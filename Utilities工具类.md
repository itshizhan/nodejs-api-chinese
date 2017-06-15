# Util

`util` 模块的设计主要目的是为了`Node.js`内部api提供支持。然而，很多工具，对于应用和模块的开发者也是很有用的。

使用util模块：

```js

const util = require('util');

```

# util.debuglog(section)

- `section <string>` 字符串，指定为应用的哪些部分创建日志函数。
- `Returns: <Function>` 返回日志函数


`util.debuglog()`方法用于创建一个函数，并根据条件向已经配置`NODE_DEBUG `环境变量的`stderr`写入debug消息。如果传入的参数名section出现在环境变量中，则返回类似
`console.error()`操作的函数。 否则，没有任何输出。

例如：

```js
// deubuglog.js
const util = require('util');
const debuglog = util.debuglog('foo');

debuglog('hello from foo [%d]', 123);
```

直接运行文件:node deubuglog.js, 没有任何输出

NODE_DEBUG=foo node debuglog.js 运行，则输出

`FOO 17002: hello from foo [123]`

17002 为进程id。

可以通过逗号分隔的方式设置多个环境变量，例如 `NODE_DEBUG=fs,net,tls`




# util.deprecate(function, string)

`util.deprecate()` 方法，第一个参数为一个函数或class，并标记其为废弃的。第二个参数是字符串，提示信息。例如：

```js

const util = require('util');

exports.puts = util.deprecate(function() {
  for (let i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(arguments[i] + '\n');
  }
}, 'util.puts: 使用 console.log 代替');


// 执行puts(),输出：(node:17018) DeprecationWarning: util.puts: 使用 console.log 代替

```


当被调用时，`util.deprecate() ` 会返回一个函数，并使用`process.on('warning')`事件触发`DeprecationWarning`.

默认情况下，第一个调用时，警告会触发，并输出到stderr。警告触发后，第一个参数包装的函数会执行。

- 如果设置了`--no-deprecation` or `--no-warnings`命令行参数，或者在首次废弃警告触发前设置了`process.noDeprecation` 属性，则`util.deprecate() ` 什么都不会做。

- 如果设置了 `--trace-deprecation` 或 `--trace-warnings` 命令行标记，或者`process.traceDeprecation` 属性设置为 true，则警告与堆栈追踪会在废弃的函数首次被调用时会输出到 stderr。

- 如果设置了 `--throw-deprecation`命令行标记，或者`process.throwDeprecation` 属性被设置为 true，则废弃的函数被调用时会抛出异常。

`--throw-deprecation` 命令行标记和 `process.throwDeprecation` 属性优先于 `--trace-deprecation` 和 `process.traceDeprecation`。

The --throw-deprecation command line flag and process.throwDeprecation property take precedence over --trace-deprecation and process.traceDeprecation.

# util.format(format[, ...args])

- format <string> 类似`printf`函数参数的格式化字符串

第一个参数是一个包含0个或多个占位符的字符串。每个展位符会被向对应的参数转换后的值替换。 支持以下占位符：


- %s - 字符串
- %d - 数字 (integer or floating point value).
- %i - 整型int.
- %f - 浮点型.
- %j - JSON. 如果参数包含循环引用，则使用 '[Circular]' 字符串代替
- %% - 单一的('%'). 不会消耗参数。



如果占位符没有相对应的参数，则占位符不会被替换。

```js
util.format('%s:%s', 'foo');
// Returns: 'foo:%s'
```
如果` util.format() `方法的参数比占位符的数量多，则多出的参数会被强制转换为字符串（对于对象和符号，使用 `util.inspect()`），然后拼接到返回的字符串中，并通过空格进行分割。

```js
util.format('%s:%s', 'foo', 'bar', 'baz');
 // 'foo:bar baz'
```

如果第一个参数不是一个格式字符串，则 `util.format()` 返回所有参数通过空格拼接的字符串。 在底层，每个参数都使用 `util.inspect() `转换为一个字符串。

```js
util.format(1, 2, 3); 
// '1 2 3'
```

如果只传入了一个参数，则会原本输出，不会进行任何格式。

```js
util.format('%% %s'); // '%% %s'
```


# util.inherits(constructor, superConstructor)

注意：

`util.inherits()`方法已经不推荐使用了。请使用ES6的class 和extends 关键字获得语言层面的继承支持。同时注意，这两种方式在语法上是不兼容的。

- constructor: 需要继承的构造函数
- superConstructor： 被继承的构造函数

方法的功能：通过原型prototype实现继承。 即将constructor 的原型设置为superConstructor对象。
为了方便使用：superConstructor 可以通过 `constructor.super_` 进行访问。

实际上，`util.inherits()`的内容部实现原理很简单:

```js
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor; 
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
};
```
通过源码，可知`util.inherits()` 只能继承原型上的属性和方法。

示例如下：

```js
const util = require('util');
const EventEmitter = require('events');

// 本身继承
function MyStream() {
  EventEmitter.call(this);
}

// 继承原型上的
util.inherits(MyStream, EventEmitter);

MyStream.prototype.write = function(data) {
  this.emit('data', data);
};

const stream = new MyStream();

console.log(stream instanceof EventEmitter); // true
console.log(MyStream.super_ === EventEmitter); // true

stream.on('data', (data) => {
  console.log(`Received data: "${data}"`);
});
stream.write('It works!'); // Received data: "It works!"
```

#### 使用 ES6 class and extends 的简洁版本：

```js
const EventEmitter = require('events');

class MyStream extends EventEmitter {
  write(data) {
    this.emit('data', data);
  }
}

const stream = new MyStream();

stream.on('data', (data) => {
  console.log(`Received data: "${data}"`);
});
stream.write('With ES6');

```

# util.inspect(object[, options])

先看示例：

```js
const util = require('util');
console.log(util.inspect(util.inspect, { showHidden: true, depth: null }));

//输出如下:
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
```

从以上示例可知，`util.inspect()` 方法是返回对象的字符串表现形式(有点类似JSON.stringify()), 这对于debugging 调试时是非常有用的。传入的options选项可以改变格式化字符串的某些方面。

- `object`:任何javascript字面量或Object
- `options`: <Object> 可选，选项如下

  - `showHidden` <boolean> If true, the object's non-enumerable symbols and properties will be included in the formatted result. Defaults to false.
  - `depth` <number> Specifies the number of times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.
  - `colors` <boolean> If true, the output will be styled with ANSI color codes. Defaults to false. Colors are customizable, see Customizing util.inspect colors.
  - `customInspect` <boolean> If false, then custom inspect(depth, opts) functions exported on the object being inspected will not be called. Defaults to true.
  - `showProxy` <boolean> If true, then objects and functions that are Proxy objects will be introspected to show their target and handler objects. Defaults to false.
  - `maxArrayLength` <number> Specifies the maximum number of array and TypedArray elements to include when formatting. Defaults to 100. Set to null to show all array elements. Set to 0 or negative to show no array elements.
  - `breakLength` <number> The length at which an object's keys are split across multiple lines. Set to Infinity to format an object as a single line. Defaults to 60 for legacy compatibility.





# util.promisify(original)
- original <Function>

这是 v8.0.0添加的一个工具方法。很有意义。

接收一个函数，返回一个`promises`的版本。 这个函数都是, 以最后一个参数来接收一个类似` (err, value) => ...` 的回调函数。

>这样，我们就可以用一个 API 把几乎所有标准库 API 都转换为返回 Promise 对象的函数

例如：

```js

const util = require('util');
const fs = require('fs');
 
//fs.stat(path, callback) 获取文件信息
const stat = util.promisify(fs.stat);
//console.log(typeof stat); //function


stat('./ceshi.txt').then((stats) => {
  // Do something with `stats`
  console.log(stats)
}).catch((error) => {
  // Handle the error.
  console.log(error);

});

/* 或者使用async函数
async function callStat() {
  try{
    const stats = await stat('./ceshi.txt');
    console.log(stats);
  }catch(err){
    console.log(err);
  }

}
callStat();
*/

```

若`./ceshi.txt`文件存在，则输出如下的文件信息：
```js
 {
  dev: 16777220,
  mode: 33188,
  nlink: 1,
  uid: 501,
  gid: 80,
  rdev: 0,
  blksize: 4096,
  ino: 32496527,
  size: 38,
  blocks: 8,
  atime: 2017-06-11T14:06:22.000Z,
  mtime: 2017-06-11T14:06:22.000Z,
  ctime: 2017-06-11T14:06:22.000Z,
  birthtime: 2017-06-11T14:06:09.000Z }
```


#### 如果当前存在`original[util.promisify.custom]`属性，`promisify` 将会返回其值，参看：` Custom promisified functions`


`promisify()` 方法是假定 `original`是一个函数，并且最后一个参数是一个回调函数。否则返回的函数将会导致一些未定义的行为。

例如，如果需要获取文件的内容，有同步和异步两个方法：
- 对于 `fs.readFileSync(path[, options])`
```js
const util = require('util');
const fs = require('fs');
 
const readFile = util.promisify(fs.readFileSync);

console.log(typeof readFile); // function

async function callReadFileSync() {
  try{
    const fileContent = await readFile('./ceshi.txt');
    console.log(fileContent.toString());  //没有任何输出
  }catch(err){
    console.log(err);    // 没有任何输出
  }

}
callReadFileSync();

```
因不符合最后一个参数是回调函数，虽然返回的类型是function，但是没有任何效果( 通过下文我们可知，是需要通过其他方式实现的 )。


- 对于 `fs.readFile(path[, options], callback)`

```js
const util = require('util');
const fs = require('fs');
 
const readFile = util.promisify(fs.readFile);

console.log(typeof readFile);  //function

async function callReadFile() {
  try{
    const fileContent = await readFile('./ceshi.txt');
    console.log(fileContent.toString()); // 输出文件的内容
  }catch(err){
    console.log(err);
  }

}
callReadFile();
```
因符合最后一个参数是callback， 可以返回promises,并输出文件内容。


# Custom promisified functions  自定义Promise 化处理函数

使用`util.promisify.custom` symbol可以重写`util.promisify()`的返回值。

> symbol 是什么呢？是es6新增的数据类型。是独一无二的。


```js
const util = require('util');
console.log(util.promisify.custom);  //Symbol(util.promisify.custom)
console.log(typeof util.promisify.custom); //symbol
```

我们知道，使用`util.promisify()`时，必须符合一定的要求，即传入的函数最后一个参数为callback。如果不符合这个风格怎么办，我们只要给函数增加一个属性 util.promisify.custom ，指定一个函数作为 Promise 化处理函数即可。

例如：

```js
const util = require('util');

function doSomething(foo, callback) {
  // ...
}

doSomething[util.promisify.custom] = function(foo) {
  return getPromiseSomehow();
};

const promisified = util.promisify(doSomething);
console.log(promisified === doSomething[util.promisify.custom]);
  // prints 'true'
```

下面再举一个例子，即使用 `util.promisify` Promise 化 `fs.readFileSync(path[, options])` 

```js

const util = require('util');
const fs = require('fs');
 
const readFileSync = fs.readFileSync;

readFileSync[util.promisify.custom] = function(path){
  //设置 util.promisify.custom 属性，重写promisify返回值。
  return fs.readFileSync(path);
}

const promisified = util.promisify(readFileSync);

console.log( promisified===readFileSync[util.promisify.custom]); //true

async function callReadFile() {
  try{
    const fileContent = await promisified('./ceshi.txt');
    console.log(fileContent.toString()); // 同样可以输出文件的内容
  }catch(err){
    console.log(err);
  }

}
callReadFile();

```



# util.promisify.custom
A Symbol值，作为函数的属性，可以自定义 Promise 化处理函数





