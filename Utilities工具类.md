# Util

`util` 模块的设计主要目的是为了`Node.js`内部api提供支持。然而，很多工具，对于应用和模块的开发者也是很有用的。

使用util模块：

```js

const util = require('util');

```

# util.debuglog(section)

# util.deprecate(function, string)

# util.format(format[, ...args])

# util.inherits(constructor, superConstructor)

# util.inspect(object[, options])

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
因不符合最后一个参数是回调函数，虽然返回的类型是function，但是没有任何效果。


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




