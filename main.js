"use strict";

const fs = require("fs");
const URL = require("url-parse");
const { google } = require("googleapis");

const {
  client_id,
  client_secret,
  redirect_uris
} = require("./credentials").installed;
const token = require("./token");
const { depthFirstSearch } = require("./depth-first-search");
const { getUrls } = require("./utils");

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

oAuth2Client.setCredentials(token);

const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

(async function() {
  try {
    // clear console
    process.stdout.write("\x1B[2J\x1B[0f");

    const urlTable = await getUrls(sheets);
    const urls = urlTable.reduce((acc, u) => acc.concat(u[0]), []);

    for (const s of urls) {
      // counter will increment for each hit
      let counter = 0;

      await depthFirstSearch(s, function(domTree, url) {
        const as = domTree("a");
        for (let i = 0; i < as.length; i++) {
          const href = as[i].attribs.href;
          if (href) {
            const hostname = new URL(href).hostname;
            if (hostname.includes("ezcater.com")) {
              console.log(`Found link: ${href} on ${url}`);
              counter++;
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
})();
