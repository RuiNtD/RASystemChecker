const fs = require("fs");
const path = require("path");
const hasha = require("hasha");
const crcl = require("crc");
const glob = require("glob");

if (!fs.existsSync("data.json")) {
  console.log("data.json not found!");
  console.log('Use "node update" to download it automatically.');
  return;
}

function mkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}

const data = require("./data.json");
const files = glob.sync("**", { cwd: "drop", nodir: true });

mkdir("drop");
mkdir("sorted");

function match(file, db) {
  return !db || file == db;
}

for (file of files) {
  file = path.normalize(file);
  const filePath = path.join("drop", file);
  const cont = fs.readFileSync(filePath);
  const size = cont.length;
  const crc = crcl.crc32(cont).toString(16).padStart(8, "0");
  const md5 = hasha(cont, { algorithm: "md5" });
  const sha1 = hasha(cont, { algorithm: "sha1" });
  for (sys of data)
    for (rom of sys.entries) {
      if (
        match(size, rom.size) &&
        match(crc, rom.crc) &&
        match(md5, rom.md5) &&
        match(sha1, rom.sha1)
      ) {
        console.log(file);
        console.log("  -> " + path.join(sys.name, rom.name));
        mkdir(path.join("sorted", sys.name));
        fs.writeFileSync(path.join("sorted", sys.name, rom.name), cont);
      }
    }
}

console.log("Done");
