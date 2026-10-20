# Free Import Refresher for Google Sheets: refresh IMPORTXML on a schedule

![Import Refresher for Google Sheets](assets/cover.png)

`IMPORTXML`, `IMPORTHTML`, `IMPORTDATA`, `IMPORTFEED` and `IMPORTRANGE` cache their results, and Google decides when to fetch again. If you track prices, stock levels, rankings or a feed, that's often not fresh enough. This script re-fetches them **every 1, 5, 10, 15 or 30 minutes, or hourly**, even with the sheet closed, or right now from a menu.

- Finds every import formula on every tab, with nothing to configure
- For formulas with the URL written in them, it adds an `update=` parameter to the URL so Google treats it as a new request; other import formulas are briefly cleared and restored
- A lock stops two refreshes overlapping

New to this? Read the [step-by-step guide](https://decodedxr.github.io/sheets-import-refresher/refresh-importxml-google-sheets.html).

## Setup (2 minutes)

1. In your sheet: **Extensions → Apps Script**.
2. Replace `Code.gs` with this repo's `Code.gs` and click **Save**. Reload the sheet.
3. **🔄 Refresh Imports → Refresh Now** to test, then **Refresh Every…** to schedule it.
4. Approve the permission prompt ("Google hasn't verified this app" → **Advanced → Go to (your project name) → Allow**; it's your own script).

**Stop Scheduled Refresh** turns it off.

## Things to know

- The script edits import formulas while it refreshes, so a formula someone is editing at that exact moment could be overwritten. Schedule it less often on sheets many people edit.
- The `update=` parameter is ignored by almost every website. If a site rejects it, put that URL in a cell and reference the cell (`=IMPORTXML(A1, "//h1")`); those formulas are cleared and restored instead.
- Fetching a site every minute can get you rate-limited or blocked by that site. Pick the slowest schedule you can live with.
- Google's daily quotas for scripts apply. A sheet with hundreds of import formulas refreshed every minute can hit them; every 5 to 15 minutes is a safer default.

## More free Google tools

- [All free Google Sheets scripts](https://github.com/DecodedXR/free-google-sheets-scripts): mail merge, PDF merge, reminders, Gmail and CSV import, timestamps, row cleanup, time zones.

## License

MIT. See `LICENSE`.
