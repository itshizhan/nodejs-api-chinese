


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

