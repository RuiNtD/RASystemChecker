const https = require('https');
const fs = require('fs');
const cp = require('cli-command-parser');
const url = 'https://raw.githubusercontent.com/libretro/libretro-database/master/dat/BIOS%20-%20Non-Merged.dat';

(new Promise((resolve, reject) => {
	https.get(url, res => {
		if (res.statusCode !== 200) {
			reject(res.statusCode + ' ' + res.statusMessage);
			res.resume();
			return;
		}
		res.setEncoding('utf8');
		let data = '';
		res.on('data', chunk => { data += chunk; });
		res.on('end', () => { resolve(data); });
	}).on('error', e => {
		reject(e.message);
	});
})).then(data => new Promise(resolve => {
	let bios = data.split('\n');
	bios.splice(0,10);
	bios = bios.filter(Boolean).filter(v => v != 'game (').filter(v => v != ')');
	let out = {};
	let name = "";
	for (v of bios) {
		if (v.startsWith('\tname ')) {
			name = v.substring(7, v.length-1);
			if (!out[name]) out[name] = [];
		} else if (v.startsWith('\tcomment '))
			out[name].push(v.substring(10, v.length-1));
		else if (v.startsWith('\trom ')) {
			var obj = {};
			v = cp(v.substring(7, v.length-2));
			for (let i = 0; i < v.length; i += 2)
				obj[v[i]] = v[i+1];
			if (obj.size) obj.size = Number(obj.size);
			if (obj.crc) obj.crc = obj.crc.toLowerCase();
			if (obj.md5) obj.md5 = obj.md5.toLowerCase();
			if (obj.sha1) obj.sha1 = obj.sha1.toLowerCase();
			if (obj.name) out[name].push(obj);
		}
	}
	if (out[0] == '') out.splice(0,1);
	resolve(out);
})).then(data => new Promise((resolve, reject) => {
	fs.writeFile('data.json', JSON.stringify(data), err => {
		if (err) reject(err);
		resolve();
	});
})).then(() => {
	console.log('Successfully updated BIOS database!');
}).catch(e => {
	console.error('Failed to update BIOS database.');
	console.error(e);
});
