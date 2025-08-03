# Daily Routine Markdown Sync Script

This Python script watches a Markdown file with your daily routine, parses it, and syncs the events to your 
Google Calendar over a specified date range. You can also enable a watch mode to automatically 
update your calendar whenever the Markdown file changes.

---

## Features

- Parse your routine from a Markdown table.
- Schedule recurring daily events for a given number of days starting from a specified date.
- Sync events to Google Calendar via API.
- Watch the Markdown file for changes and auto-sync.
- Cleanly update, create, and delete events to avoid duplicates.
- Works cross-platform with Python 3.x.

---

## Setup Instructions

1. **Clone or copy the project folder.**

2. **Create and activate a virtual environment:**

   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
Install required packages:

bash
Copy
Edit
pip install google-auth google-auth-oauthlib google-api-python-client python-dateutil watchdog python-dotenv
Set up Google API credentials:

Go to the Google Cloud Console.

Create a project and enable the Google Calendar API.

Create OAuth 2.0 credentials for a desktop app.

Download the credentials.json file and place it in the project folder.

Run the script to authenticate and sync:

bash
Copy
Edit
python sync_routine.py --routine daily-routine.md --start-date 2025-08-02 --duration-days 7 --watch
Usage
bash
Copy
Edit
python sync_routine.py --routine <routine_file.md> --start-date YYYY-MM-DD --duration-days N [--watch]
--routine — Markdown file containing your routine (e.g., daily-routine.md or rest-routine.md).

--start-date — Date to start scheduling events (format: YYYY-MM-DD).

--duration-days — Number of days to schedule.

--watch — Optional. If present, the script watches the file for changes and syncs automatically.

Markdown Routine Format
Your routine Markdown file should contain a table with columns:

| Time | Activity | Notes / How-to | Why This Matters | Event Details (Free App + Setup) |

Example snippet:

Time	Activity	Notes / How-to	Why This Matters	Event Details (Free App + Setup)
7:30 AM	Body Scan / Breathwork	Sit upright, close eyes ...	Ground before digital inputs	Breathwrk app - Use "Wake Up" pattern

How It Works
The script parses your routine Markdown, extracting event info.

It calculates each event’s duration based on the start time of the next event.

It creates, updates, or deletes Google Calendar events for the scheduled date range.

If --watch is enabled, it listens for file changes and syncs on every save.

Troubleshooting & Notes
The first time you run, a browser window will open for Google OAuth consent.

Keep your credentials.json safe and private.

Use UTC time in your routine or adjust your calendar timezone accordingly.

To stop watching, press Ctrl+C.