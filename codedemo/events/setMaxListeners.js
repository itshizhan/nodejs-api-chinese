const EventEmitter = require('events');

console.log(typeof EventEmitter); // function

const myEmitter = new EventEmitter();

/********
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

es6的写法： 注意EventEmitter本身是个function，可以类式继承，也可以直接 new EventEmitter()
*/


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


/* events使用
引入
Event模块中我们使用的都是EventEmitter这个核心对象,当我们需要引入它时也极其简单

const EventEmitter = require('events').EventEmitter;
let ee = new EventEmitter();
如果需要自定义的EventEmitter,那么我们可以使用ES6 Class继承之后再创建对象

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
*/