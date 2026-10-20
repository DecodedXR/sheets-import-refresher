---
title: How to refresh IMPORTXML in Google Sheets automatically (every minute to hourly, free)
description: IMPORTXML, IMPORTHTML and IMPORTDATA results go stale because Sheets caches them. This free script re-fetches every import formula on a schedule, even with the sheet closed.
image: https://decodedxr.github.io/sheets-import-refresher/assets/cover.png
---
{% raw %}

# How to refresh IMPORTXML in Google Sheets automatically (free)

You built a sheet that pulls prices, rankings or a feed with `IMPORTXML`, `IMPORTHTML`, `IMPORTDATA`, `IMPORTFEED` or `IMPORTRANGE`, and the numbers are stale. That's by design: Sheets caches these functions and re-fetches only when the formula changes, or on Google's own schedule. Google's help says that's roughly every hour for most of them, and the timing isn't guaranteed.

The **File → Settings → Calculation → "On change and every minute"** setting doesn't help: it only re-runs `NOW()`, `TODAY()`, `RAND()` and `RANDBETWEEN()`, not imports.

What does work is changing the formula, so Sheets sees a new request. This guide sets up [Import Refresher](https://github.com/DecodedXR/sheets-import-refresher), a free, MIT-licensed Apps Script that does exactly that on a schedule.

## Step 1: Add the script

1. Open your sheet and go to **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with [this `Code.gs`](https://github.com/DecodedXR/sheets-import-refresher/blob/main/Code.gs) and click **Save**.
3. Reload the sheet. A **🔄 Refresh Imports** menu appears.

## Step 2: Refresh now

**🔄 Refresh Imports → Refresh Now**. Approve Google's prompt the first time ("Google hasn't verified this app" → **Advanced → Go to (your project name) → Allow**). Every import formula on every tab re-fetches, and a message shows how many there were.

## Step 3: Schedule it

**🔄 Refresh Imports → Refresh Every…** and enter 1, 5, 10, 15, 30, or 60 for hourly. It keeps running on Google's servers with the sheet closed. **Stop Scheduled Refresh** turns it off.

## How it works

For a formula like

```
=IMPORTXML("https://example.com/product", "//span[@class='price']")
```

the script changes the URL to `https://example.com/product?update=1760870000000`, a new number each time. Websites ignore the extra parameter, but to Sheets it's a new URL, so it fetches fresh data.

For formulas where the URL isn't written in the formula (such as `=IMPORTXML(A2, ...)`), and for `IMPORTRANGE`, the script clears the formula for a moment and puts it back, which also makes Sheets fetch again.

## Tips

- **Be kind to websites.** Every 15 or 30 minutes is plenty for prices and rankings. Fetching every minute can get your requests blocked by the site.
- **Big sheets:** hundreds of import formulas on a 1-minute schedule can run into Google's daily script limits. Start with 15 minutes.
- **History:** a refreshed value replaces the old one. If you need a price history, copy the values to a log tab on a schedule.

---

[Get the script on GitHub](https://github.com/DecodedXR/sheets-import-refresher) · [More free Google Sheets scripts](https://decodedxr.github.io/free-google-sheets-scripts/)
{% endraw %}
