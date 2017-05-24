var Readable = require('stream').Readable;

var rs = new Readable; //new Readable == new Readable() == Readable()
rs.push('beep ');
rs.push('boop\n');
rs.push(null);

rs.pipe(process.stdout);
