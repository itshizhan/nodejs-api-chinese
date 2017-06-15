const util = require('util');

// puts = util.deprecate(function() {

//   for (let i = 0, len = arguments.length; i < len; ++i) {
//     process.stdout.write(arguments[i] + '\n');
//   }

// }, 'util.puts: 使用 console.log 代替');


// puts(111,22);

console.log(util.format('hello world,%i,%s', 12345,"haha"));
// Returns: 'foo:%s'

//puts();

console.log(util.format('%% %s')); // '%% %s'
