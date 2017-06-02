const fs = require('fs');

module.exports = false;
if (fs.existsSync('system.txt')) {
	const path = fs.readFileSync('system.txt', 'utf8');
	if (fs.existsSync(path))
		module.exports = path;
	else
		throw new Error(path + ' (defined in system.txt) does not exist.');
}
