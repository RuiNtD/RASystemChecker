const fs = require('fs');
const path = require('path');
const hasha = require('hasha');
const crc = require('crc');
const glob = require('glob');

const system = require('./system.js');
module.exports = db => {
	let results = {};
	for (sys in db) {
		results[sys] = [];
		for (rom of db[sys]) {
			if (rom instanceof Object) results[sys].push(getResult(rom));
			else results[sys].push(rom);
		}
	}
	return results;
	
	function getResult(rom) {
		let res = { name: rom.name };
		const search = glob.sync(rom.name, { nocase: true, cwd: system || 'system' });
		if (search.length == 0) {
			res.missing = true;
			return res;
		}
		const file = search.includes(rom.name) ? rom.name : search[0];
		if (file != rom.name) res.incap = true;
		res.file = file;
		try {
			const cont = fs.readFileSync(path.join(system || 'system', file));
			if (rom.size) res.size = rom.size == cont.length;
			if (rom.crc ) res.crc  = rom.crc  == crc.crc32(cont).toString(16).padStart(8, '0');
			if (rom.md5 ) res.md5  = rom.md5  == hasha(cont, {algorithm: 'md5'});
			if (rom.sha1) res.sha1 = rom.sha1 == hasha(cont, {algorithm: 'sha1'});
			res.check = res.size != false && res.crc != false && res.md5 != false && res.sha1 != false;
		} catch (e) {
			return { name: rom.name, error: String(e) || 'Unknown Error' };
		}
		return res;
	}
};
