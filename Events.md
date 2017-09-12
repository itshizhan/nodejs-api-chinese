# Events

Much of the Node.js core API is built around an idiomatic asynchronous event-driven architecture in which certain kinds of objects (called "emitters") periodically emit named events that cause Function objects ("listeners") to be called.

For instance: a [`net.Server`](https://nodejs.org/dist/latest-v8.x/docs/api/net.html#net_class_net_server) object emits an event each time a peer connects to it; a [`fs.ReadStream`](https://nodejs.org/dist/latest-v8.x/docs/api/fs.html#fs_class_fs_readstream) emits an event when the file is opened; a [stream](https://nodejs.org/dist/latest-v8.x/docs/api/stream.html) emits an event whenever data is available to be read.

All objects that emit events are instances of the `EventEmitter` class. These objects expose an `eventEmitter.on()`function that allows one or more functions to be attached to named events emitted by the object. Typically, event names are camel-cased strings but any valid JavaScript property key can be used.

When the `EventEmitter` object emits an event, all of the functions attached to that specific event are called *synchronously*. Any values returned by the called listeners are *ignored* and will be discarded.

The following example shows a simple `EventEmitter` instance with a single listener. The `eventEmitter.on()` method is used to register listeners, while the `eventEmitter.emit()` method is used to trigger the event.



```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
myEmitter.emit('event');
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

