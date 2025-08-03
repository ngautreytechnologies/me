import argparse
import os
from datetime import datetime, timedelta

import pytz
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# === CONFIG ===
SCOPES = ["https://www.googleapis.com/auth/calendar"]
CREDS_FILE = "../../credentials/credentials.json"
TOKEN_FILE = "../../credentials/token.json"


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
        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())
    return creds


def get_calendar_service():
    creds = authenticate_google()
    return build("calendar", "v3", credentials=creds)


def delete_all_events(start_date, end_date, timezone="Europe/London"):
    service = get_calendar_service()

    local_tz = pytz.timezone(timezone)
    time_min = local_tz.localize(datetime.strptime(start_date, "%Y-%m-%d")).astimezone(pytz.utc).isoformat()
    time_max = local_tz.localize(datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)).astimezone(
        pytz.utc).isoformat()

    try:
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get("items", [])

        if not events:
            print("No events found in range.")
            return

        print(f"Found {len(events)} events. Deleting...")

        for event in events:
            try:
                service.events().delete(calendarId="primary", eventId=event["id"]).execute()
                print(
                    f"Deleted: {event.get('summary', 'No Title')} on {event['start'].get('dateTime', event['start'].get('date'))}")
            except HttpError as e:
                print(f"Failed to delete event {event['id']}: {e}")

    except HttpError as error:
        print(f"An error occurred: {error}")


def main():
    parser = argparse.ArgumentParser(description="Admin tool for Google Calendar.")
    parser.add_argument("action", choices=["delete"], help="Action to perform.")
    parser.add_argument("--start-date", required=True, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end-date", help="End date (YYYY-MM-DD)")
    parser.add_argument("--duration-days", type=int, help="Duration in days (optional if end is given)")
    parser.add_argument("--timezone", default="Europe/London", help="Timezone (default: Europe/London)")
    args = parser.parse_args()

    start_date = datetime.strptime(args.start_date, "%Y-%m-%d")

    if args.end_date:
        end_date = datetime.strptime(args.end_date, "%Y-%m-%d")
    elif args.duration_days:
        end_date = start_date + timedelta(days=args.duration_days - 1)
    else:
        end_date = start_date

    delete_all_events(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"), args.timezone)


if __name__ == "__main__":
    main()
