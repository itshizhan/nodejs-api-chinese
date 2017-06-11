const util = require('util');

console.log(util.inspect({a:1,b:[1,2,3]}, { showHidden: true, depth: null }));

//输入如下:

/*
{ [Function: inspect]
  [length]: 2,
  [name]: 'inspect',
  [prototype]: inspect { [constructor]: [Circular] },
  [defaultOptions]: [Getter/Setter],
  colors:
   { bold: [ 1, 22, [length]: 2 ],
     italic: [ 3, 23, [length]: 2 ],
     underline: [ 4, 24, [length]: 2 ],
     inverse: [ 7, 27, [length]: 2 ],
     white: [ 37, 39, [length]: 2 ],
     grey: [ 90, 39, [length]: 2 ],
     black: [ 30, 39, [length]: 2 ],
     blue: [ 34, 39, [length]: 2 ],
     cyan: [ 36, 39, [length]: 2 ],
     green: [ 32, 39, [length]: 2 ],
     magenta: [ 35, 39, [length]: 2 ],
     red: [ 31, 39, [length]: 2 ],
     yellow: [ 33, 39, [length]: 2 ] },
  styles:
   { special: 'cyan',
     number: 'yellow',
     boolean: 'yellow',
     undefined: 'grey',
     null: 'bold',
     string: 'green',
     symbol: 'green',
     date: 'magenta',
     regexp: 'red' },
  custom: Symbol(util.inspect.custom) }

  */