const fs = require('fs');
const path = require('path');
const hasha = require('hasha');
const crcl = require('crc');
const glob = require('glob');

if (!fs.existsSync('data.json')) {
	console.log('data.json not found!');
	console.log('Use "node update" to download it automatically.');
	return;
}

const system = require('./lib/system.js');
if (!fs.existsSync('drop')) fs.mkdirSync('drop');
const data = require('./data.json');
const results = require('./lib/results.js')(data);
const files = glob.sync('**', { cwd: 'drop', nodir: true });

let left = [];
for (sys in results) {
	for (k in results[sys]) {
		const res = results[sys][k];
		const rom = data[sys][k];
		rom.system = sys;
		if (rom instanceof Object && !res.check)
			left.push(rom);
	}
}
console.log(left.length + ' BIOS file' + plur(left.length) + ' missing');
console.log(files.length + ' file' + plur(files.length) + ' to scan');
console.log();

let found = 0;
for (file of files) {
	try {
		const cont = fs.readFileSync(path.join('drop', file));
		const size = cont.length;
		const crc  = crcl.crc32(cont).toString(16).padStart(8, '0');
		const md5  = hasha(cont, {algorithm: 'md5'});
		const sha1 = hasha(cont, {algorithm: 'sha1'});
		for (rom of left) {
			if (!rom.found && match(size, rom.size) && match(crc, rom.crc) && match(md5, rom.md5) && match(sha1, rom.sha1)) {
				fs.createReadStream(path.join('drop', file)).pipe(fs.createWriteStream(path.join(system || 'system', rom.name)));
				rom.found = true;
				found++;
				console.log('Found ' + rom.name + ' (' + file + ') for ' + rom.system);
			}
		}
	} catch (e) {
		console.error(String(e.message));
	}
}

if (found) console.log();
console.log('Done! Found and copied ' + found + ' missing BIOS file' + plur(found) + '.');
if (found) {
	console.log('Do NOT close the console or terminate the program manually.');
	console.log('Files may still be copying! Wait for the script to end itself.');
}

function match(file, db) {
	return !db || file == db;
}

function plur(num) {
	return num == 1 ? '' : 's';
}
