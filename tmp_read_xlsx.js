const XLSX = require('xlsx');
const workbook = XLSX.readFile('Athletic Website Information.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
console.log(JSON.stringify(rows, null, 2));
