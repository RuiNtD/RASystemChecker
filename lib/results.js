const fs = require("fs");
const path = require("path");
const hasha = require("hasha");
const crc = require("crc");
const glob = require("glob");

module.exports = (db) => {
  let results = {};
  for (sys of db) {
    const name = sys.name;
    results[name] = [];
    for (rom of sys.entries) {
      if (rom instanceof Object) results[name].push(getResult(rom, sys.name));
      else results[name].push(rom);
    }
  }
  return results;

  function getResult(rom, sysName) {
    let res = { name: rom.name };
    const search = glob.sync(path.join(sys.name, rom.name), {
      nocase: true,
      cwd: "system",
    });
    if (search.length == 0) {
      res.missing = true;
      return res;
    }
    const file = search.includes(rom.name) ? rom.name : search[0];
    if (path.basename(file) != rom.name) res.incap = true;
    res.file = file;
    try {
      const cont = fs.readFileSync(path.join("system", file));
      if (rom.size) res.size = rom.size == cont.length;
      if (rom.crc)
        res.crc = rom.crc == crc.crc32(cont).toString(16).padStart(8, "0");
      if (rom.md5) res.md5 = rom.md5 == hasha(cont, { algorithm: "md5" });
      if (rom.sha1) res.sha1 = rom.sha1 == hasha(cont, { algorithm: "sha1" });
      res.check =
        res.size != false &&
        res.crc != false &&
        res.md5 != false &&
        res.sha1 != false;
    } catch (e) {
      return { name: rom.name, error: String(e) || "Unknown Error" };
    }
    return res;
  }
};
