const util = require("util");
const datfile = require("robloach-datfile");
const https = require("https");
const fs = require("fs");
const stream = require("stream");

const url =
  "https://raw.githubusercontent.com/libretro/libretro-database/master/dat/System.dat";
const dest = "System.dat";

new Promise((resolve, reject) => {
  let data = "";
  https
    .get(url, (res) => {
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(data);
      });
    })
    .on("error", (err) => {
      reject(err.message);
    });
})
  .then(async (data) => {
    const gameAt = data.indexOf("game (");
    return (
      data.substring(0, gameAt) +
      data
        .substring(gameAt)
        .replace(/.* "System"$\n/gm, "")
        .replace(/\n^\tcomment/gm, ")\n\ngame (\n\tname")
        .replace(/^game \(\s+\)\s+/gm, "")
    );
  })
  .then((data) => util.promisify(fs.writeFile)("System.dat", data))
  .then((data) => datfile.parseFile("System.dat", { ignoreHeader: true }))
  .then((data) =>
    util.promisify(fs.writeFile)("data.json", JSON.stringify(data))
  )
  .then(() => {
    console.log("Successfully updated BIOS database!");
  })
  .catch((e) => {
    console.log("Failed to update BIOS database.");
    console.error(e);
  });
