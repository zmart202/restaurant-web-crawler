"use strict";

// const fs = require("fs");
const URL = require("url-parse");
// const { google } = require("googleapis");

// const {
//   client_id,
//   client_secret,
//   redirect_uris
// } = require("./credentials").installed;
// // const token = require("./token");
const { depthFirstSearch } = require("./depth-first-search");
const { getUrls, writeLinks } = require("./utils");

// const oAuth2Client = new google.auth.OAuth2(
//   client_id,
//   client_secret,
//   redirect_uris[0]
// );

// oAuth2Client.setCredentials(token);

// // const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), Scrape);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */

async function Scrape(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  console.log(sheets);
  try {
    // clear console
    process.stdout.write("\x1B[2J\x1B[0f");

    const urlTable = await getUrls(sheets);
    const urls = urlTable.reduce((acc, u) => acc.concat(u[0]), []);

    for (const s of urls) {
      // counter will increment for each hit
      let counter = 0;

      await depthFirstSearch(s, async function(domTree, url) {
        const as = domTree("a");
        for (let i = 0; i < as.length; i++) {
          const href = as[i].attribs.href;
          if (href) {
            const hostname = new URL(href).hostname;
            if (hostname.includes("ezcater.com")) {
              await writeLinks(url, href, sheets);
              console.log(`Found link: ${href} on ${url}`);
              counter++;
            } else {
              //await notFound(s, sheets);
            }
          }
        }
      });
      console.log("\n\n");
      if (counter === 0) {
        console.log(`Finished. Could not find any links on ${s}`);
      } else {
        const message =
          "Finished. Found a total of " +
          counter +
          " link" +
          (counter === 1 ? "" : "s") +
          " on " +
          s;
        console.log(message);
      }
      console.log("\n\n");
    }
  } catch (err) {
    console.error(err);
  }
}

// (async function() {
//   try {
//     // clear console
//     process.stdout.write("\x1B[2J\x1B[0f");

//     const urlTable = await getUrls(sheets);
//     const urls = urlTable.reduce((acc, u) => acc.concat(u[0]), []);

//     for (const s of urls) {
//       // counter will increment for each hit
//       let counter = 0;

//       await depthFirstSearch(s, function(domTree, url) {
//         const as = domTree("a");
//         for (let i = 0; i < as.length; i++) {
//           const href = as[i].attribs.href;
//           if (href) {
//             const hostname = new URL(href).hostname;
//             if (hostname.includes("ezcater.com")) {
//               // writeLinks(href, sheets);
//               console.log(`Found link: ${href} on ${url}`);
//               counter++;
//             }
//           }
//         }
//       });
//       console.log("\n\n");
//       if (counter === 0) {
//         console.log(`Finished. Could not find any links on ${s}`);
//       } else {
//         const message =
//           "Finished. Found a total of " +
//           counter +
//           " link" +
//           (counter === 1 ? "" : "s") +
//           " on " +
//           s;
//         console.log(message);
//       }
//       console.log("\n\n");
//     }
//   } catch (err) {
//     console.error(err);
//   }
// })();
