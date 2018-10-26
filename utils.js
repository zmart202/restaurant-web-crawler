"use strict";

function getUrls(sheets) {
  return new Promise(function(resolve, reject) {
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: "1pFLkJ--7qg9igFnaUrICqX5TEreMx1DnOAGzSqkI9R4",
        range: "A1:A"
      },
      (err, res) => {
        if (err) reject(err);
        resolve(res.data.values);
      }
    );
  });
}

function writeLinks(url, href, sheets) {
  return new Promise(function(resolve, reject) {
    sheets.spreadsheets.values.append(
      {
        spreadsheetId: "1pFLkJ--7qg9igFnaUrICqX5TEreMx1DnOAGzSqkI9R4",
        range: `Sheet3!A1:C`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          range: `Sheet3!A1:C`,
          majorDimension: "COLUMNS",
          values: [
            [`${url}`],
            [`${href}`],
            [
              `${new Date().getMonth()}/${new Date().getDate()}/${new Date().getFullYear()}`
            ]
          ]
        }
      },
      (err, res) => {
        if (err) reject("errrrrrroooor", err);
        resolve(console.log(res.data));
      }
    );
  });
}

function notFound(site, sheets) {
  return new Promise(function(resolve, reject) {
    sheets.spreadsheets.values.append(
      {
        spreadsheetId: "1pFLkJ--7qg9igFnaUrICqX5TEreMx1DnOAGzSqkI9R4",
        range: `Sheet4!A1:A`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          range: `Sheet4!A1:A`,
          majorDimension: "COLUMNS",
          values: [[`${site}`]]
        }
      },
      (err, res) => {
        if (err) reject("errrrrrroooor", err);
        resolve(console.log(res.data));
      }
    );
  });
}

module.exports = {
  getUrls,
  writeLinks,
  notFound
};
