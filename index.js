const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');

// Set to true to only show bad / missing BIOS files.
const onlyBad = process.argv.map(v => v.toLowerCase()).includes('onlybad');

let name = chalk.gray.bold;
let comment = chalk.gray.italic;
let ok = chalk.green;
let fail = chalk.bold.red.bgWhite;
let unknown = chalk.gray.strikethrough;

if (!fs.existsSync('data.json')) {
	console.log('data.json not found!');
	console.log('Use "node update" to download it automatically.');
	return;
}

if (!String.prototype.padStart)
	String.prototype.padStart = require('./lib/padStart.js');

const system = require('./lib/system.js');
if (!chalk.supportsColor) ok = unknown = () => '';
if (!system && !fs.existsSync('system')) fs.mkdirSync('system');

let results = require('./lib/results.js')(require('./data.json'));
let longestName = 0, anyIncap = false;
for (sys in results)
	for (rom of results[sys])
		if (rom instanceof Object) {
			longestName = Math.max(longestName, rom.name.length);
			if (rom.incap) anyIncap = true;
		}
longestName += 1;

let ignore = [];
if (onlyBad) {
	let newr = {};
	for (sys in results) {
		let news = [], any = false;
		for (rom of results[sys])
			if (rom instanceof Object) {
				if (!rom.check || rom.incap) {
					news.push(rom);
					any = true;
				} else ignore.push(rom.file);
			} else news.push(rom);
		if (any) newr[sys] = news;
	}
	results = newr;
}

for (sys in results) {
	console.log();
	console.log(name(sys));
	for (rom of results[sys]) {
		if (rom instanceof Object) {
			ignore.push(rom.file || rom.name);
			if (rom.missing)
				console.log(fail(rom.name.padStart(longestName)), 'Missing');
			else if (rom.error)
				console.log(fail(rom.name.padStart(longestName)), rom.error);
			else {
				console.log(
					rom.name.padStart(longestName),
					cc(rom.size)('Size'), cc(rom.crc)('CRC'),
					cc(rom.md5)('MD5'), cc(rom.sha1)('SHA1'),
					rom.incap ? fail('INCAP') : ''
				);
			}
		} else console.log(comment(rom));
	}
}

if (anyIncap) {
	console.log();
	console.log(fail('INCAP') + ' indicates a BIOS with INcorrect CAPitalization.');
	console.log('On Linux, this will prevent RetroArch from finding the file.');
	console.log('This has no effect on Windows and (standard) Mac filesystems.');
}
let extras = glob.sync('*', { ignore: ignore, cwd: system || 'system', nodir: true });
if (extras.length) {
	console.log();
	console.log(name('Stray files'));
	for (extra of extras) console.log(extra);
}
function cc(check) {
	if (check ===  true) return ok;
	if (check === false) return fail;
	return unknown;
}
