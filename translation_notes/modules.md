# nodejs中，模块可以分为核心模块和文件模块.

1. 核心模块是被编译成二进制代码，引用的时候只需require表示符即可，如(require('net'))。

2. 文件模块，则是指js文件、json文件或者是.node文件。在引用文件模块的时候后要加上文件的路径：/.../.../xxx.js表示绝对路径、./xxx.js表示相对路径(同一文件夹下的xxx.js)，../表示上一级目录。如果既不加/.../、../又不加./的话，则该模块要么是核心模块，要么是从一个node_modules文件夹加载。

> 即不加路径，总是从node_modules文件夹加载

3. 对于加载模块时既没指出./ ../ /.../时，加载模块的搜索路径。如果'/home/ry/projects/foo.js' 中的文件调用了 require('bar.js') ，node将依次在下面的位置进行搜索： 
```js
/home/ry/projects/node_modules/bar.js 
/home/ry/node_modules/bar.js 
/home/node_modules/bar.js 
/node_modules/bar.js 
```

例如：
```js
--- a.js
--- c.js
--- node_modules
------ c.js // 在node_modules文件夹下
//如果a.js:
const c = require('c.js');
则此时引用的是node_modules文件夹下的c.js

```


# 文件夹作为模块,例如：
```js
// a.js
const main = require('./dir');  没有扩展名
```

如果dir 文件夹下 下有package.json. 且指定了main入口文件，在实际加载的是 main入口文件：
```json
{ 
	"name" : "dir",
	"version": "1.0.0",
	"main" : "./lib/main.js" // 真正加载的文件
} 
```

如果dir 目录下没有package.json，则依次加载 a.js同目录的dir.js 文件，在依次查找./dir/index.js和./dir/index.node文件


# module变量代表当前模块

CommonJS规范规定，每个模块内部，module变量代表当前模块。这个变量是一个对象，它的exports属性（即module.exports）是对外的接口。加载某个模块，其实是加载该模块的module.exports属性。

# module.exports属性

module.exports属性表示当前模块对外输出的接口，其他文件加载该模块，实际上就是读取module.exports变量。

# exports变量

Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行这样的命令。

```js
var exports = module.exports;
```
在对外输出模块接口时，可以向exports对象添加方法。

```js
exports.area = function (r) {
  return Math.PI * r * r;
};

exports.circumference = function (r) {
  return 2 * Math.PI * r;
};
```

但是：不能直接将exports变量指向一个值，因为这样等于切断了exports与module.exports的联系。

```js
//------------例1：
exports = function(x) {console.log(x)};
// 此写法无效，因为exports不再指向module.exports了。

// ------------例2：
exports.hello = function() {
  return 'hello';
};

module.exports = 'Hello world';
//上面代码中，hello函数是无法对外输出的，因为module.exports被重新赋值了。
```

### 这意味着，如果一个模块的对外接口，就是一个单一的值，不能使用exports输出，只能使用module.exports输出。
例如：
```js
module.exports = function (x){ console.log(x);};
```




# 笔记源码：./codedemo/modules/目录
# 参考：http://javascript.ruanyifeng.com/nodejs/module.html

