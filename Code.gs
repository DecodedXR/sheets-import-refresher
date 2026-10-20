/** @OnlyCurrentDoc */ // asks Google for access to this spreadsheet only, not all your sheets

/**
 * Import Refresher for Google Sheets: re-fetch IMPORTXML, IMPORTHTML, IMPORTDATA, IMPORTFEED and
 * IMPORTRANGE formulas on a schedule you choose (every 1 to 30 minutes, or hourly), or on demand.
 *
 * Sheets caches these functions and only re-fetches when the formula changes. So for a formula
 * whose URL is written in it, this updates an "update=" parameter on the URL (a new URL means a
 * fresh fetch); for anything else (IMPORTRANGE, a URL in another cell) it clears and restores the
 * formula. Use 🔄 Refresh Imports → Refresh Now, or Refresh Every… to schedule it.
 */

const IMPORTS = /\bIMPORT(XML|HTML|DATA|FEED|RANGE)\s*\(/i;

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔄 Refresh Imports')
    .addItem('Refresh Now', 'refreshMenu')
    .addItem('Refresh Every…', 'schedule')
    .addItem('Stop Scheduled Refresh', 'stop')
    .addToUi();
}

function refreshMenu() {
  SpreadsheetApp.getActive().toast(refresh_() + ' import formula(s) refreshed.');
}

function schedule() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Refresh Imports', 'Refresh every how many minutes? 1, 5, 10, 15 or 30, or 60 for hourly.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const mins = Number(r.getResponseText().trim());
  if (![1, 5, 10, 15, 30, 60].includes(mins)) { ui.alert('Please enter 1, 5, 10, 15, 30 or 60.'); return; }
  stop_();
  const t = ScriptApp.newTrigger('refreshScheduled').timeBased();
  (mins === 60 ? t.everyHours(1) : t.everyMinutes(mins)).create();
  ui.alert('Import formulas will refresh every ' + (mins === 60 ? 'hour' : mins + ' minute(s)') + ', even with the sheet closed.');
}

function stop() {
  stop_();
  SpreadsheetApp.getUi().alert('Scheduled refresh is off.');
}

function refreshScheduled() { refresh_(); }

function refresh_() {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) return 0; // a refresh is already running
  try {
    const stamp = Date.now();
    let n = 0;
    SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(sheet => {
      const range = sheet.getDataRange();
      const formulas = range.getFormulas();
      const restore = [];
      formulas.forEach((row, r) => row.forEach((f, c) => {
        if (!IMPORTS.test(f)) return;
        const bumped = bumpUrl_(f, stamp);
        const cell = range.getCell(r + 1, c + 1);
        if (bumped) cell.setFormula(bumped);
        else { cell.setValue(''); restore.push([cell, f]); }
        n++;
      }));
      if (restore.length) {
        SpreadsheetApp.flush();
        restore.forEach(([cell, f]) => cell.setFormula(f));
      }
    });
    return n;
  } finally {
    lock.releaseLock();
  }
}

/**
 * For IMPORTXML/HTML/DATA/FEED with a quoted http(s) URL, set update=<stamp> on that URL.
 * Returns the new formula, or '' when there's no literal URL to change (or it's IMPORTRANGE,
 * whose spreadsheet URL is left alone).
 */
function bumpUrl_(formula, stamp) {
  const call = /\bIMPORT(XML|HTML|DATA|FEED)\s*\(\s*"(https?:\/\/[^"]*)"/i.exec(formula);
  if (!call) return '';
  const url = call[2];
  const next = /([?&])update=\d*/.test(url)
    ? url.replace(/([?&])update=\d*/, '$1update=' + stamp)
    : url.replace(/(#.*)?$/, (hash) => (url.includes('?') ? '&' : '?') + 'update=' + stamp + (hash || ''));
  const at = call.index + call[0].length - 1 - url.length; // the URL ends just before the closing quote
  return formula.slice(0, at) + next + formula.slice(at + url.length);
}

function stop_() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'refreshScheduled')
    .forEach(t => ScriptApp.deleteTrigger(t));
}
