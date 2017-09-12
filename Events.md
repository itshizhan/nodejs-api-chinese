# Events

大多数的Node.js核心API都是基于惯用的异步的事件驱动模型（an idiomatic asynchronous event-driven architecture）构建的。即，某些类型的对象 (called "emitters")会周期性的触发命名事件（emit named events），调用事件监听函数（listeners）。

例如，`net.Server`对象在每次建立一个连接时，都会触发事件（译注：connection事件）;

`fs.ReadStream` 会在每次打开文件是触发事件，`stream`会在每次读取到数据时触发事件。



**所有**触发事件的对象都是`EventEmitter` **类**的实例。

这些`EventEmitter` **类**的实例对象，都会暴露一个`eventEmitter.on()`方法, 用来在一个命名事件（对象可以触发此事件）上绑定一个或多个事件监听函数。通常（Typically）, 事件名称以驼峰式的字符串命名 (实际上任何有效的可以作为javascript 属性key值的都可以作为事件名称）。



当EventEmitter实例对象触发一个事件时，所有绑定到该指定事件的监听函数都会同步调用（called *synchronously*），同时该监听函数的返回值会忽略和丢弃。



例如，下面的实例展示了只绑定一个事件监听器的简单EventEmitter对象实例（myEmitter）。`eventEmitter.on()`  方法用来注册监听函数， `eventEmitter.emit()` 方法用来触发该事件。



```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
myEmitter.emit('event');
```





# emitter.addListener(eventName, listener)

- eventName： 事件名 <any>
- listener： 监听函数 <Function>

 `emitter.on(eventName, listener)` 的别名



# emitter.on(eventName, listener)

添加一个监听函数(listener) 到指定事件（名称eventName）已绑定事件监听器数组的末尾。on()方法不会检查`listener` 函数是否已经添加到listeners数组中，如果多次调用on()方法在相同的`eventName`上添加了相同的`listener`，将会导致多次调用。

```javascript
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

`on()` 方法返回EventEmitter 实例的引用，这样可以进行链式操作。



默认情况下，事件监听器是按照添加的顺序进行调用的。作为一个可选方案(alternative), 可以使用  `emitter.prependListener()`  方法 将 事件监听器添加到 listeners array 的开头。

```javascript
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```



> 译注： 补充示例

```javascript
const EventEmitter = require('events');
class TestEE extends EventEmitter{}
//实例化构造函数
const testEE = new TestEE();
let index = 0;
const listeners =function listeners(){
  index++;
  console.log("我被执行了--"+index+"--次");
}
testEE.on("myEvent",listeners);
testEE.on("myEvent",listeners);

testEE.emit('myEvent');
console.log(index);
/* 输出如下：
我被执行了--1--次
我被执行了--2--次
2
*/
```




### emitter.setMaxListeners(n)
- `n <integer>`


默认情况下，一个指定事件(event)可以添加10个监听器(listeners),超过的话就会给出警告。 这样做的好处是可以发现内存的泄露。 然而，并不是所有的事件都应该只绑定10个监听器。

通过`emitter.setMaxListeners(n)` 就可以修改指定 EventEmitter实例可以添加监听器的数量。 参数n可以设置为无穷大或0，以指明无限个数的监听器。

返回值：EventEmitter 的 应用reference,方便链式调用。

实例1：

```js
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

//链式调用
myEmitter.setMaxListeners(3)
.on('event', () => {
  console.log('an event chain called occurred');
});;

myEmitter.on('event', () => {
  console.log('an event occurred 111!');
});
myEmitter.on('event', () => {
  console.log('an event occurred 222 !');
});
myEmitter.on('event', () => {
  console.log('an event occurred 333 !');
});
myEmitter.emit('event');


// 输出如下，可以看到控制台的警告

// an event occurred 111!
// an event occurred 222 !
// an event occurred 333 !
//(node:38395) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 4 event listeners added. Use emitter.setMaxListeners() to increase limit


```

