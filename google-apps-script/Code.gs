// Google Apps Script bound to the contact inquiries spreadsheet.
// Receives inquiries from the Cloudflare Worker (worker/index.ts) and files them into
// one tab per quarter (e.g. "2026 Q4"), newest inquiry first.
//
// Setup:
//   1. Open the spreadsheet > Extensions > Apps Script, paste this file in.
//   2. File > Settings (in the spreadsheet): set the time zone to (GMT+08:00) Manila.
//      Dates and quarter boundaries use the spreadsheet's time zone.
//   3. Project Settings > Script Properties: add WEBHOOK_SECRET (same value as the
//      SHEETS_WEBHOOK_SECRET secret on the Cloudflare Worker).
//   4. Run testInquiry once from the editor to authorise the script and check the template.
//   5. Deploy > New deployment > Web app: Execute as "Me", Who has access "Anyone".
//      Use the /macros/s/.../exec URL as the SHEETS_WEBHOOK_URL secret on the Cloudflare Worker.

const TITLE = 'ISAAC IT Services — Contact Inquiries';
const COLUMNS = [
  { header: 'Received', width: 150 },
  { header: 'Name', width: 170 },
  { header: 'Email', width: 220 },
  { header: 'Subject', width: 220 },
  { header: 'Message', width: 420 },
  { header: 'Status', width: 110 },
  { header: 'Notes', width: 240 },
  { header: 'ID', width: 60 },
];
const COL = { received: 1, name: 2, email: 3, subject: 4, message: 5, status: 6, notes: 7, id: 8 };
const STATUSES = ['New', 'In progress', 'Replied', 'Closed', 'Spam'];

const HEADER_ROW = 2;
const FIRST_DATA_ROW = 3;
const TEMPLATE_ROWS = 1000;

const BRAND = { orange: '#FEA336', dark: '#1f1f1f', grey: '#323a3b', band: '#f6f6f6' };
const STATUS_COLOURS = {
  'New': '#fde2bf',
  'In progress': '#d4e4fc',
  'Replied': '#d6f0dc',
  'Closed': '#e6e6e6',
  'Spam': '#f6d3d3',
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    if (!secret || data.secret !== secret) return respond({ status: 'error', message: 'Unauthorized' });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      addInquiry(data);
    } finally {
      lock.releaseLock();
    }
    return respond({ status: 'success' });
  } catch (err) {
    return respond({ status: 'error', message: String(err) });
  }
}

function addInquiry(data) {
  const received = data.createdAt ? new Date(data.createdAt) : new Date();
  if (isNaN(received.getTime())) throw new Error('Invalid createdAt: ' + data.createdAt);

  const sheet = getQuarterSheet(received);

  // The Worker may retry a sync; skip inquiries already filed.
  if (data.id != null && findById(sheet, data.id)) return;

  const row = [];
  row[COL.received - 1] = received;
  row[COL.name - 1] = clean(data.name);
  row[COL.email - 1] = clean(data.email);
  row[COL.subject - 1] = clean(data.subject);
  row[COL.message - 1] = clean(data.message);
  row[COL.status - 1] = 'New';
  row[COL.notes - 1] = '';
  row[COL.id - 1] = data.id == null ? '' : data.id;

  const target = sheet.getLastRow() + 1;
  if (target > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 500);
  sheet.getRange(target, 1, 1, COLUMNS.length).setValues([row]);
  sortByDate(sheet);
}

// One tab per quarter, named "YYYY Qn" in the spreadsheet's time zone.
function getQuarterSheet(date) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();
  const year = Utilities.formatDate(date, tz, 'yyyy');
  const quarter = Math.ceil(Number(Utilities.formatDate(date, tz, 'M')) / 3);
  const name = year + ' Q' + quarter;

  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name, quarterTabIndex(ss, name));
    applyTemplate(sheet, name, tz);
  }
  return sheet;
}

// Keep quarter tabs ordered newest first; other tabs stay where they are.
function quarterTabIndex(ss, name) {
  const quarterTabs = ss.getSheets().filter(s => /^\d{4} Q[1-4]$/.test(s.getName()));
  const newer = quarterTabs.filter(s => s.getName() > name);
  if (newer.length) return newer[newer.length - 1].getIndex(); // right after the closest newer tab
  return quarterTabs.length ? quarterTabs[0].getIndex() - 1 : 0;
}

function applyTemplate(sheet, name, tz) {
  const width = COLUMNS.length;
  const lastRow = HEADER_ROW + TEMPLATE_ROWS;

  if (sheet.getMaxColumns() > width) sheet.deleteColumns(width + 1, sheet.getMaxColumns() - width);
  if (sheet.getMaxRows() < lastRow) sheet.insertRowsAfter(sheet.getMaxRows(), lastRow - sheet.getMaxRows());
  sheet.setTabColor(BRAND.orange);

  // Title
  sheet.getRange(1, 1, 1, width).merge()
    .setValue(TITLE + '  ·  ' + name)
    .setFontSize(14).setFontWeight('bold').setFontColor(BRAND.orange)
    .setBackground(BRAND.dark).setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);

  // Headers
  sheet.getRange(HEADER_ROW, 1, 1, width)
    .setValues([COLUMNS.map(c => c.header)])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground(BRAND.grey)
    .setVerticalAlignment('middle');
  sheet.getRange(HEADER_ROW, COL.received).setNote('Time zone: ' + tz);
  sheet.setRowHeight(HEADER_ROW, 28);
  sheet.setFrozenRows(HEADER_ROW);
  COLUMNS.forEach((c, i) => sheet.setColumnWidth(i + 1, c.width));

  // Data area
  const data = sheet.getRange(FIRST_DATA_ROW, 1, TEMPLATE_ROWS, width);
  data.setVerticalAlignment('top').setWrap(false);
  sheet.getRange(FIRST_DATA_ROW, COL.received, TEMPLATE_ROWS, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.getRange(FIRST_DATA_ROW, COL.message, TEMPLATE_ROWS, 1).setWrap(true);
  sheet.getRange(FIRST_DATA_ROW, COL.id, TEMPLATE_ROWS, 1).setHorizontalAlignment('center').setFontColor('#888888');
  sheet.getRange(FIRST_DATA_ROW, COL.status, TEMPLATE_ROWS, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build(),
  );

  // Status colours, then light banding for the rest of the row
  const statusRange = sheet.getRange(FIRST_DATA_ROW, COL.status, TEMPLATE_ROWS, 1);
  const rules = STATUSES.map(s =>
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s).setBackground(STATUS_COLOURS[s]).setRanges([statusRange]).build(),
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($A' + FIRST_DATA_ROW + '<>"", ISEVEN(ROW()))')
      .setBackground(BRAND.band)
      .setRanges([data])
      .build(),
  );
  sheet.setConditionalFormatRules(rules);

  sheet.getRange(HEADER_ROW, 1, TEMPLATE_ROWS + 1, width).createFilter();
}

// Newest first. Sorting whole rows keeps staff Status/Notes with their inquiry.
function sortByDate(sheet) {
  const rows = sheet.getLastRow() - FIRST_DATA_ROW + 1;
  if (rows < 2) return;
  const filter = sheet.getFilter();
  if (filter && filter.getRange().getLastRow() >= sheet.getLastRow()) {
    filter.sort(COL.received, false); // empty rows stay at the bottom
  } else {
    sheet.getRange(FIRST_DATA_ROW, 1, rows, COLUMNS.length).sort({ column: COL.received, ascending: false });
  }
}

function findById(sheet, id) {
  const rows = sheet.getLastRow() - FIRST_DATA_ROW + 1;
  if (rows < 1) return null;
  return sheet.getRange(FIRST_DATA_ROW, COL.id, rows, 1)
    .createTextFinder(String(id)).matchEntireCell(true).findNext();
}

// Stop values like "=HYPERLINK(...)" from being treated as formulas (spreadsheet injection).
function clean(value) {
  const str = String(value == null ? '' : value);
  return /^[=+\-@]/.test(str) ? "'" + str : str;
}

function respond(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

// Spreadsheet menu for re-sorting after manual edits.
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Inquiries')
    .addItem('Sort this tab by date (newest first)', 'sortActiveSheet')
    .addToUi();
}

function sortActiveSheet() {
  sortByDate(SpreadsheetApp.getActiveSheet());
}

// Run from the editor to authorise the script and preview the template.
// Delete the test row afterwards.
function testInquiry() {
  addInquiry({
    id: 'test-' + Date.now(),
    createdAt: new Date().toISOString(),
    name: 'Test Inquiry',
    email: 'test@example.com',
    subject: 'Template check',
    message: 'This is a test row created by testInquiry(). You can delete it.',
  });
}
