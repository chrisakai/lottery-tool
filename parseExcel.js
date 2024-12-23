const xlsx = require('xlsx');
const fs = require('fs');

// Load the Excel file
const workbook = xlsx.readFile('抽奖名单Dummy.xlsx');

// Select the sheet
const sheetName = 'GS CN regular employee';
const sheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Extract the relevant columns and generate the structure
const result = data.slice(1).map((row, index) => ({
  id: (index + 1).toString().padStart(3, '0'),
  name: row[1],
  NT: row[0]
}));

// Convert the result to a string in the required format
const output = `define(${JSON.stringify(result, null, 4)})`;

// Write the output to a file
fs.writeFileSync('js/data/data-apper.js', output);

console.log('Data has been written to js/data/data-apper.js');