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

module.exports = {
  getUrls
};
