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
    data = data.replace(/.* "System"$/gm, "");
    data = data.replace(/^\tcomment /gm, ")\ngame (\n\tname ");
    return data;
  })
  .then(async (data) => {
    const input = new stream.Readable();
    input.push(data);
    input.push(null);
    return input;
  })
  .then((data) => datfile.parse(data, { ignoreHeader: true }))
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
