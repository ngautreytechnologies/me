import argparse
import datetime
import logging
import os
import sys
import time

import dateutil.parser
import pytz
from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

SCOPES = ['https://www.googleapis.com/auth/calendar']

TOKEN_FILE = '../../credentials/token.json'
CREDS_FILE = '../../credentials/credentials.json'

load_dotenv()

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)  # Set root logger level

# Create console handler that logs to stdout
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.DEBUG)  # You can set to INFO or WARNING as needed

# Create a formatter and set it to the handler
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)

# Add the handler to the logger
logger.addHandler(console_handler)

# Load batch_size and max_retries globally from workflows.yaml or override CLI
# For this example, we'll just use defaults here; you can adjust later or load dynamically.
DEFAULT_BATCH_SIZE = 10
DEFAULT_MAX_RETRIES = 5
LOCAL_TIMEZONE = pytz.timezone("Europe/London")  # replace it with your desired local timezone


def authenticate_google():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
    return creds


def parse_markdown(md_file):
    with open(f'../assets/{md_file}', 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip() and line.startswith('|') and not line.startswith('| ---')]

    headers = [h.strip() for h in lines[0].strip('|').split('|')]
    entries = []
    for line in lines[1:]:
        cols = [c.strip() for c in line.strip('|').split('|')]
        if len(cols) != len(headers):
            continue
        item = dict(zip(headers, cols))
        try:
            item['TimeParsed'] = dateutil.parser.parse(item['Time'])
        except Exception:
            item['TimeParsed'] = None
        entries.append(item)

    for i in range(len(entries)):
        if i + 1 < len(entries) and entries[i]['TimeParsed'] and entries[i + 1]['TimeParsed']:
            duration = entries[i + 1]['TimeParsed'] - entries[i]['TimeParsed']
        else:
            duration = datetime.timedelta(minutes=30)
        entries[i]['Duration'] = duration
    return entries


def event_to_google(event, base_date):
    time_only = event['TimeParsed'].time()
    start = datetime.datetime.combine(base_date, time_only)
    end = start + event['Duration']

    exclude_keys = {'Time', 'TimeParsed', 'Activity', 'Duration'}
    description_lines = []
    for key, value in event.items():
        if key not in exclude_keys and value:
            description_lines.append(f"{key}: {value}")

    description = "\n".join(description_lines)

    return {
        'summary': event['Activity'],
        'description': description,
        'start': {'dateTime': start.isoformat(), 'timeZone': str(LOCAL_TIMEZONE)},
        'end': {'dateTime': end.isoformat(), 'timeZone': str(LOCAL_TIMEZONE)},
    }


def chunk_list(lst, chunk_size):
    """Yield successive chunks from a list."""
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]


def batch_execute(service, batch_requests, max_retries=DEFAULT_MAX_RETRIES):
    """
    Executes a batch of Google Calendar API requests with retry logic for rate limiting.
    batch_requests: list of tuples (method, resource, body, callback)
    """
    attempt = 0
    while attempt <= max_retries:
        batch = service.new_batch_http_request()
        for req_id, (method, resource, body, callback) in enumerate(batch_requests):
            if method == 'insert':
                batch.add(service.events().insert(calendarId='primary', body=body), callback=callback,
                          request_id=str(req_id))
            elif method == 'update':
                batch.add(service.events().update(calendarId='primary', eventId=resource, body=body), callback=callback,
                          request_id=str(req_id))
            elif method == 'delete':
                batch.add(service.events().delete(calendarId='primary', eventId=resource), callback=callback,
                          request_id=str(req_id))

        try:
            batch.execute()
            return True
        except HttpError as e:
            if e.resp.status in [403, 429, 500, 503]:
                wait_time = (2 ** attempt) * 1.5  # exponential backoff with a factor
                logger.debug(f"Rate limit or server error ({e.resp.status}), retrying in {wait_time:.1f}s...")
                time.sleep(wait_time)
                attempt += 1
            else:
                logger.debug(f"HTTP Error: {e}")
                return False
    logger.debug("Max retries exceeded for batch request.")
    return False


def sync_events(service, events, base_date, debug_mode, batch_size=DEFAULT_BATCH_SIZE, max_retries=DEFAULT_MAX_RETRIES):
    day_start = datetime.datetime.combine(base_date, datetime.time.min).replace(tzinfo=LOCAL_TIMEZONE).isoformat()
    day_end = datetime.datetime.combine(base_date, datetime.time.max).replace(tzinfo=LOCAL_TIMEZONE).isoformat()
    if debug_mode:
        logger.debug(f'Syncing using day_start: {day_start} and day_end: {day_end}')
    existing_resp = service.events().list(calendarId='primary', timeMin=day_start,
                                          timeMax=day_end, singleEvents=True,
                                          orderBy='startTime').execute()

    existing_events = existing_resp.get('items', [])
    existing_map = {}  # key: (summary, start_datetime), value: event_id
    for e in existing_events:
        if debug_mode:
            logger.debug(f'Handling event {e}')
        summary = e.get('summary', '')
        start = e['start'].get('dateTime', '')
        existing_map[(summary, start)] = e['id']

    to_create = []
    to_update = []
    matched_keys = set()

    for event in events:
        if not event['TimeParsed']:
            logger.debug(f"Skipping event with invalid time: {event.get('Activity', 'Unknown')}")
            continue
        g_event = event_to_google(event, base_date)
        key = (g_event['summary'], g_event['start']['dateTime'])
        if key in existing_map:
            if debug_mode:
                logger.debug(f'Found key in map: {key}. Event: {g_event}')
            # Update existing
            to_update.append(('update', existing_map[key], g_event, event_callback))
            matched_keys.add(key)
        else:
            if debug_mode:
                logger.debug(f'Unable to find key in map: {key}. Event: {g_event}')
            # New event
            to_create.append(('insert', None, g_event, event_callback))

    # Events to delete are those existing but not matched in the current routine
    to_delete = []
    for key, event_id in existing_map.items():
        if key not in matched_keys:
            to_delete.append(('delete', event_id, None, event_callback))

    logger.debug(f"Batching: {len(to_create)} creates, {len(to_update)} updates, {len(to_delete)} deletes")

    # Process batches for creates
    for batch_chunk in chunk_list(to_create, batch_size):
        success = batch_execute(service, batch_chunk, max_retries)
        if not success:
            logger.debug("Failed to complete create batch.")

    # Process batches for updates
    for batch_chunk in chunk_list(to_update, batch_size):
        success = batch_execute(service, batch_chunk, max_retries)
        if not success:
            logger.debug("Failed to complete update batch.")

    # Process batches for deletes
    for batch_chunk in chunk_list(to_delete, batch_size):
        success = batch_execute(service, batch_chunk, max_retries)
        if not success:
            logger.debug("Failed to complete delete batch.")


def event_callback(request_id, response, exception):
    if exception:
        logger.exception(f"Request {request_id} failed: {exception}")
    else:
        action = "Deleted" if response is None else "Processed"
        logger.debug(f"Request {request_id} succeeded: {action}")


class RoutineHandler(FileSystemEventHandler):
    def __init__(self, service, md_file, start_date, duration_days, batch_size, max_retries, debug_mode):
        self.service = service
        self.md_file = md_file
        self.start_date = start_date
        self.duration_days = duration_days
        self.batch_size = batch_size
        self.max_retries = max_retries
        self.debug_mode = debug_mode

    def on_modified(self, event):
        logger.debug(f'File modified event handler.  MD File {self.md_file}')
        if event.src_path.endswith(self.md_file):
            logger.info(f"🔄 {self.md_file} changed, syncing with Google Calendar...")
            events = parse_markdown(self.md_file)
            if self.debug_mode:
                logger.debug(f'Here is MD file {events}')
            current_date = self.start_date
            logger.debug(f'Handling date {current_date} with duration of {self.duration_days}')
            for _ in range(self.duration_days):
                if self.debug_mode:
                    logger.debug(f'Syncing using even data {self.to_dict()}')
                sync_events(self.service, events, current_date, self.debug_mode, self.batch_size, self.max_retries)
                current_date += datetime.timedelta(days=1)
            logger.debug("✅ Sync complete.")

    def to_dict(self):
        return {
            "service": str(self.service),  # or use self.service.__class__.__name__ if preferred
            "md_file": self.md_file,
            "start_date": self.start_date.isoformat() if hasattr(self.start_date, 'isoformat') else self.start_date,
            "duration_days": self.duration_days,
            "batch_size": self.batch_size,
            "max_retries": self.max_retries,
            "debug_mode": self.debug_mode,
        }


def main():
    parser = argparse.ArgumentParser(description="Sync routine markdown to Google Calendar")
    parser.add_argument("--routine", choices=["daily-routine.md", "rest-routine.md"], default="daily-routine.md",
                        help="Markdown routine file (located in ../assets/)")
    parser.add_argument("--start-date", required=True, help="Schedule start date (YYYY-MM-DD)")
    parser.add_argument("--end-date", help="Schedule end date (YYYY-MM-DD), mutually exclusive with --duration-days")
    parser.add_argument("--duration-days", type=int, default=None,
                        help="Number of days to schedule (alternative to --end-date)")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Batch size for API calls")
    parser.add_argument("--max-retries", type=int, default=DEFAULT_MAX_RETRIES, help="Max retries for API calls")
    parser.add_argument("--watch", action="store_true", help="Watch markdown file for changes and auto-sync")
    parser.add_argument("--debug", default=False, help="Print MD contents")
    args = parser.parse_args()

    # Validate date args and compute duration_days
    start_date = datetime.datetime.strptime(args.start_date, "%Y-%m-%d").date()

    if args.end_date and args.duration_days:
        logger.debug("Error: Specify either --end-date or --duration-days, not both.")
        return

    if args.end_date:
        end_date = datetime.datetime.strptime(args.end_date, "%Y-%m-%d").date()
        if end_date < start_date:
            logger.debug("Error: end-date cannot be before start-date.")
            return
        duration_days = (end_date - start_date).days + 1
    elif args.duration_days is not None:
        duration_days = args.duration_days
    else:
        duration_days = 1

    creds = authenticate_google()
    service = build('calendar', 'v3', credentials=creds)

    events = parse_markdown(args.routine)
    current_date = start_date
    for _ in range(duration_days):
        sync_events(service, events, current_date, args.debug, args.batch_size, args.max_retries)
        current_date += datetime.timedelta(days=1)

    if args.watch:
        observer = Observer()
        event_handler = RoutineHandler(service, f'../assets/{args.routine}', start_date, args.debug, duration_days,
                                       args.batch_size, args.max_retries)
        observer.schedule(event_handler, path=os.path.dirname(os.path.abspath(f'../assets/{args.routine}')),
                          recursive=False)
        observer.start()
        logger.debug(f"👀 Watching {args.routine} for changes... (Ctrl+C to exit)")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()
    else:
        logger.debug("✅ Sync complete. Exiting (watch disabled).")


if __name__ == '__main__':
    main()
