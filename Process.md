# Process

process 是一个全局对象，提供相关信息，控制当前node.js进程，因为是全局的，所有对所有nodejs应用程序都是可用的，无需`require()` 引入。

# Process Events
process 对象是 `EventEmitter` 的实例

## Event: 'beforeExit'

当Node.js清空了其事件循环，并且没有任何逻辑去处理的时候会触发`beforeExit`。通常node.js当没有任何工作进程的时候会退出，但是,如果注册了`beforeExit`事件监听器，可以产生异步的调用，从而让node.js继续执行。


此事件的回调函数，调用时会传递 `proces.exitCode` 作为唯一参数。


`beforeExit` 不会在进程显式终止时调用，如调用`process.exit` 或未捕获异常。

`beforeExit` 事件不能作为`exit`事件的替代方案，除非是为了继续执行后续的程序。

## Event: 'disconnect'

如果nodejs 进程是由IPC通道(IPC channel)创建的(is spawned with)， (see the Child Process and Cluster documentation) ,则当IPC通道关闭时，会触发`disconnect`事件。

## Event: 'exit'


## Event: 'message'

## Event: 'rejectionHandled'

## Event: 'uncaughtException'

### Warning: Using 'uncaughtException' correctly

## Event: 'unhandledRejection'

## Event: 'warning'

## Signal Events
