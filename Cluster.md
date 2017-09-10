# Cluster 集群

A single instance of Node.js runs in a single thread. To take advantage of multi-core systems the user will sometimes want to launch a cluster of Node.js processes to handle the load.

The cluster module allows easy creation of child processes that all share server ports.



```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```



Running Node.js will now share port 8000 between the workers:

```javascript
$ node server.js
Master 3596 is running
Worker 4324 started
Worker 4520 started
Worker 6056 started
Worker 5644 started
```



Please note that on Windows, it is not yet possible to set up a named pipe server in a worker.



# How It Works 集群是如何工作的



The worker processes are spawned using the [`child_process.fork()`](https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_fork_modulepath_args_options) method, so that they can communicate with the parent via IPC and pass server handles back and forth.

The cluster module supports two methods of distributing incoming connections.

The first one (and the default one on all platforms except Windows), is the round-robin approach, where the master process listens on a port, accepts new connections and distributes them across the workers in a round-robin fashion, with some built-in smarts to avoid overloading a worker process.

The second approach is where the master process creates the listen socket and sends it to interested workers. The workers then accept incoming connections directly.

The second approach should, in theory, give the best performance. In practice however, distribution tends to be very unbalanced due to operating system scheduler vagaries. Loads have been observed where over 70% of all connections ended up in just two processes, out of a total of eight.

Because `server.listen()` hands off most of the work to the master process, there are three cases where the behavior between a normal Node.js process and a cluster worker differs:



1. `server.listen({fd: 7})` Because the message is passed to the master, file descriptor 7 **in the parent** will be listened on, and the handle passed to the worker, rather than listening to the worker's idea of what the number 7 file descriptor references.
2. `server.listen(handle)` Listening on handles explicitly will cause the worker to use the supplied handle, rather than talk to the master process.
3. `server.listen(0)` Normally, this will cause servers to listen on a random port. However, in a cluster, each worker will receive the same "random" port each time they do `listen(0)`. In essence, the port is random the first time, but predictable thereafter. To listen on a unique port, generate a port number based on the cluster worker ID.



*Note*: Node.js does not provide routing logic. It is, therefore important to design an application such that it does not rely too heavily on in-memory data objects for things like sessions and login.

Because workers are all separate processes, they can be killed or re-spawned depending on a program's needs, without affecting other workers. As long as there are some workers still alive, the server will continue to accept connections. If no workers are alive, existing connections will be dropped and new connections will be refused. Node.js does not automatically manage the number of workers, however. It is the application's responsibility to manage the worker pool based on its own needs.



# Class: Worker



A Worker object contains all public information and method about a worker. In the master it can be obtained using `cluster.workers`. In a worker it can be obtained using `cluster.worker`.



### Event: 'disconnect',   worker事件

Similar to the `cluster.on('disconnect')` event, but specific to this worker.

```javascript
cluster.fork().on('disconnect', () => {
  // Worker has disconnected
});
```



### Event: 'error',   worker事件

This event is the same as the one provided by [`child_process.fork()`](https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_fork_modulepath_args_options).

Within a worker, `process.on('error')` may also be used.



### Event: 'exit',   worker事件

- `code`<Number>. the exit code, if it exited normally.
- `signal` <String> the name of the signal (e.g. `'SIGHUP'`) that caused the process to be killed.

Similar to the `cluster.on('exit')` event, but specific to this worker.

```javascript
const worker = cluster.fork();
worker.on('exit', (code, signal) => {
  if (signal) {
    console.log(`worker was killed by signal: ${signal}`);
  } else if (code !== 0) {
    console.log(`worker exited with error code: ${code}`);
  } else {
    console.log('worker success!');
  }
});
```





### Event: 'listening',   worker事件

- address <Object>

Similar to the `cluster.on('listening')` event, but specific to this worker.

```javascript
cluster.fork().on('listening', (address) => {
  // Worker is listening
});
```



It is not emitted in the worker.



### Event: 'message'， worker事件

- `message` <Object>
- `handle` <Object>|<undefined>

Similar to the `cluster.on('message')` event, but specific to this worker.

Within a worker, `process.on('message')` may also be used.

See [`process` event: `'message'`](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_event_message).

As an example, here is a cluster that keeps count of the number of requests in the master process using the message system:



```javascript
const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {

  // Keep track of http requests
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);

  // Count requests
  function messageHandler(msg) {
    if (msg.cmd && msg.cmd === 'notifyRequest') {
      numReqs += 1;
    }
  }

  // Start workers and listen for messages containing notifyRequest
  const numCPUs = require('os').cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', messageHandler);
  }

} else {

  // Worker processes have a http server.
  http.Server((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');

    // notify master about the request
    process.send({ cmd: 'notifyRequest' });
  }).listen(8000);
}
```



###  Event: 'online', worker事件



Similar to the `cluster.on('online')` event, but specific to this worker.

```javascript
cluster.fork().on('online', () => {
  // Worker is online
});
```

It is not emitted in the worker.



### worker.disconnect()

- Returns: <Worker> A reference to `worker`.

In a worker, this function will close all servers, wait for the `'close'` event on those servers, and then disconnect the IPC channel.

In the master, an internal message is sent to the worker causing it to call `.disconnect()` on itself.

Causes `.exitedAfterDisconnect` to be set.

Note that after a server is closed, it will no longer accept new connections, but connections may be accepted by any other listening worker. Existing connections will be allowed to close as usual. When no more connections exist, see [`server.close()`](https://nodejs.org/dist/latest-v8.x/docs/api/net.html#net_event_close), the IPC channel to the worker will close allowing it to die gracefully.

The above applies *only* to server connections, client connections are not automatically closed by workers, and disconnect does not wait for them to close before exiting.

Note that in a worker, `process.disconnect` exists, but it is not this function, it is [`disconnect`](https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_disconnect).

Because long living server connections may block workers from disconnecting, it may be useful to send a message, so application specific actions may be taken to close them. It also may be useful to implement a timeout, killing a worker if the `'disconnect'` event has not been emitted after some time.



```javascript
if (cluster.isMaster) {
  const worker = cluster.fork();
  let timeout;

  worker.on('listening', (address) => {
    worker.send('shutdown');
    worker.disconnect();
    timeout = setTimeout(() => {
      worker.kill();
    }, 2000);
  });

  worker.on('disconnect', () => {
    clearTimeout(timeout);
  });

} else if (cluster.isWorker) {
  const net = require('net');
  const server = net.createServer((socket) => {
    // connections never end
  });

  server.listen(8000);

  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      // initiate graceful close of any connections to server
    }
  });
}
```



### worker.exitedAfterDisconnect

- <boolean>



Set by calling `.kill()` or `.disconnect()`. Until then, it is `undefined`.

The boolean `worker.exitedAfterDisconnect` allows distinguishing between voluntary and accidental exit, the master may choose not to respawn a worker based on this value.



```javascript
cluster.on('exit', (worker, code, signal) => {
  if (worker.exitedAfterDisconnect === true) {
    console.log('Oh, it was just voluntary – no need to worry');
  }
});

// kill worker
worker.kill();


```





### worker.id

- <Number>

Each new worker is given its own unique id, this id is stored in the `id`.

While a worker is alive, this is the key that indexes it in cluster.workers





### worker.isConnected()

This function returns `true` if the worker is connected to its master via its IPC channel, `false` otherwise. A worker is connected to its master after it has been created. It is disconnected after the `'disconnect'` event is emitted.



### worker.isDead()

This function returns `true` if the worker's process has terminated (either because of exiting or being signaled). Otherwise, it returns `false`.



### worker.kill([signal='SIGTERM'])

- `signal` <String> Name of the kill signal to send to the worker process.

This function will kill the worker. In the master, it does this by disconnecting the `worker.process`, and once disconnected, killing with `signal`. In the worker, it does it by disconnecting the channel, and then exiting with code `0`.

Causes `.exitedAfterDisconnect` to be set.

This method is aliased as `worker.destroy()` for backwards compatibility.

Note that in a worker, `process.kill()` exists, but it is not this function, it is [`kill`](https://nodejs.org/dist/latest-v8.x/docs/api/process.html#process_process_kill_pid_signal).



### worker.process

- <ChildProcess>

All workers are created using [`child_process.fork()`](https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_fork_modulepath_args_options), the returned object from this function is stored as `.process`. In a worker, the global `process` is stored.

See: [Child Process module](https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process_fork_modulepath_args_options)

Note that workers will call `process.exit(0)` if the `'disconnect'` event occurs on `process` and `.exitedAfterDisconnect` is not `true`. This protects against accidental disconnection.





### worker.send(message[, sendHandle][, callback])

- `message`<Object>
- `sendHandle` <Handle>
- `callback`<Function>
- Returns: Boolean

Send a message to a worker or master, optionally with a handle.

In the master this sends a message to a specific worker. It is identical to [`ChildProcess.send()`](https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_send_message_sendhandle_options_callback).

In a worker this sends a message to the master. It is identical to `process.send()`.

This example will echo back all messages from the master:



```javascript
if (cluster.isMaster) {
  const worker = cluster.fork();
  worker.send('hi there');

} else if (cluster.isWorker) {
  process.on('message', (msg) => {
    process.send(msg);
  });
}
```





# Event: 'disconnect'，  cluster事件



- worker <cluster.Worker>

  ​

  **工作进程**的IPC管道断开时触发。当工作进程优雅的退出，被kill，或者手工断开（例如调用 worker.disconnect方法）时发生。

  disconnect和exit事件之间可能会有延迟，这些事件常用来检查进程在清理过程中卡住(stuck:卡住，动不了)，或者是否有长连接。

  ```javascript
  cluster.on('disconnect', (worker) => {
    console.log(`The worker #${worker.id} has disconnected`);
  });
  ```



# Event: 'exit'，  cluster事件

- worker： <cluster.Worker>

- code：正常退出时候的退出码

- signal：进程被killed时候的信号名称（例如：'SIGHUP'）

  ​

任何一个工作进程死亡时（例如：kill -9 pid, kill -HUP pid）, 会触发此事件。

可以在回调函数中调用fork()方法重启工作进程。

```javascript
cluster.on('exit', (worker, code, signal) => {
  
  // 当执行kill -9 pid, kill -HUP pid， sinal 为：SIGKILL，SIGHUP
  // 当调用cluster.disconnect()方法是，优雅退出，code为0
  console.log('worker %d died (%s). restarting...',worker.process.pid, signal || code);

  cluster.fork();
});
```

参加：child_process event: 'exit'



# Event: 'fork' , 事件

- worker： <cluster.Worker>

  ​

当fork一个新的工作进程时，cluster模块会触发fork事件。 这可以用于记录(log)当前工作经常活动的日志，创建一个自定义超时。

```javascript
const timeouts = [];
function errorMsg() {
  console.error('Something must be wrong with the connection ...');
}

cluster.on('fork', (worker) => {
  //如果2秒之内没有监听到listening事件，提示连接超时。
  timeouts[worker.id] = setTimeout(errorMsg, 2000);
});
cluster.on('listening', (worker, address) => {
  clearTimeout(timeouts[worker.id]);
});
cluster.on('exit', (worker, code, signal) => {
  clearTimeout(timeouts[worker.id]);
  errorMsg();
});
```





# Event: 'listening' ,事件

- `worker` <cluster.Worker>
- `address` <Object>

当在工作进程上调用listen()方法后，listening事件会在服务上(工作进程的)触发，同时主进程的cluster也会触发此事件。

**listening**事件的处理函数有两个参数，`worker`参数包含了工作进程对象，`address`对象包含了如下的连接属性：address，port和addressType。这对于工作进程监听多个地址是非常有用。

示例：

```javascript
cluster.on('listening', (worker, address) => {
  console.log(
    `A worker is now connected to ${address.address}:${address.port}`);
});
```

 `addressType` 的值如下：

- `4` (TCPv4)
- `6` (TCPv6)
- `-1` (unix domain socket)
- `"udp4"` or `"udp6"` (UDP v4 or v6)



# Event: 'message'，事件

- `worker` <cluster.Worker>
- `message` <Object>
- `handle` <Object>|<undefined>



当主进程（master）接收到任何一个工作进程的消息时触发此事件。

参加： [child_process event: 'message'](https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_event_message). 

在Node.js v6.0之前，此事件的回调函数只接收`message` 和`handle`两个参数，而不包括`worker`对象，这一点当前文档展示的不一样(contrary to:与…相反)。

如果需要支持老的版本，并且不需要`worder`对象的话, 可以通过检查参数的个数来解决此差异（ work around the discrepancy）。



```javascript
cluster.on('message', (worker, message, handle) => {
  if (arguments.length === 2) {
    handle = message;
    message = worker;
    worker = undefined;
  }
  // ...
});
```



#Event: 'online',事件

- worker： <cluster.Worker>

当fork一个新的工作进程时，该工作进程应该相应一个实时消息（online message）。当master接收到实时消息时，就会触发online事件。online事件与fork事件的区别是，fork事件是工作进程fork时触发，而online事件是工作进程运行时触发。



```javascript
cluster.on('online', (worker) => {
  console.log('Yay, the worker responded after it was forked');
});
```





## 

# Event: 'setup'，事件

- settings <Object>

每次调用setupMaster()方法时，触发此事件。

`settings`对象就是**setupMaster**()方法调用时的`cluster.settings`对象，并且该对象只能用于参考(advisory:咨询，报告)， 因为在单个信号（single tick ?和解 ？)中，**setupMaster**()可以多次调用。

如果对精确性(accuracy)要求高，请使用`cluster.settings`



# cluster.disconnect([callback])

- callback 当所有工作进程断开连接，并且handle都关闭时调用。

可以在 cluster.workers 的每个工作进程中调用`.disconnect()`方法。

当工作进程断开时，所有内部的handle都会关闭，这是如果没有其他的事件等待处理，主进程可以优雅的结束。

此方法可以接受一个可选的回调函数作为参数，当工作进程结束时此回调函数会调用。

#### 此方法只能在主进程中调用。



# cluster.fork([env])



- `env`  以Key/value 的形式为工作进程添加环境变量

- return <cluster.Worker> 返回cluster.Worker

  ​

此方法只能在主进程中调用。



# cluster.isMaster

- <boolean>

  如果进程时主进程，则返回true。 这是由 `process.env.NODE_UNIQUE_ID`决定的。 如果`process.env.NODE_UNIQUE_ID` 未定义，则为true



> 译注：process.env.NODE_UNIQUE_ID 是在`cluster.fork()`时添加变量。



# cluster.isWorker

- <boolean>

如果进程不是主进程，则返回true（和cluster.isMaster正好相反）。



# cluster.schedulingPolicy

调度策略，不管是轮询调度的 `cluster.SCHED_RR`，还是由操作系统决定的`cluster.SCHED_NONE`。 

这是一个全局设置，当第一个工作进程被spawned或者调用cluster.setupMaster()时，此设置都会生效。

`SCHED_RR` 是所有操作系统的默认设置，当然除了windows系统。当然，如果libuv 能够有效的分发IOCP handle，并不会产出巨大的性能冲击，windows系统也会变为`SCHED_RR`

`cluster.schedulingPolicy` 可以设置`NODE_CLUSTER_SCHED_POLICY`环境变量。环境变量的有效值包括`rr` 和 `none`。



> 译注：
>
>  linux内核的三种调度方法：
> 1，SCHED_OTHER 分时调度策略，
> 2，SCHED_FIFO实时调度策略，先到先服务
> 3，SCHED_RR实时调度策略，时间片轮转 



# cluster.settings

- Object
  - execArgv：
  - exec：
  - args：
  - silent：
  - stdio：
  - uid：
  - gid：
  - inspectPort：



After calling `.setupMaster()` (or `.fork()`) this settings object will contain the settings, including the default values.

This object is not intended to be changed or set manually.



# cluster.setupMaster([settings])

- settings <Object> 参见： cluster.settings

`setupMaster` 用于改变默认的fork行为。 

一旦调用,  settings 将会传递给`cluster.settings`. 

注意：

- 任何settings 的改变只会影响将要调用的fork()方法，而对当前已经运行的工作进程没有影响。

- 通过`.setupMaster()` 不能设置的唯一属性是传递给fork()的env变量。

-  上述的默认设置只会在第一次调用时生效。 后续调用时，只会使用`cluster.setupMaster()` 

  调用时的当前值。

  ​

  示例：

  ```javascript
  const cluster = require('cluster');
  cluster.setupMaster({
    exec: 'worker.js',
    args: ['--use', 'https'],
    silent: true
  });
  cluster.fork(); // https worker
  cluster.setupMaster({
    exec: 'worker.js',
    args: ['--use', 'http']
  });
  cluster.fork(); // http worker
  ```

  ​

此方法只能在主进程中调用。



# cluster.worker

- Object

当前工作进程对象的引用。在主进程中无效。

```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) { 
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();   
  }
} else {

  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');    
    // console.log(cluster.worker);// Worker{}
    console.log(`I am worker #${cluster.worker.id}`);
  }).listen(8000);
}

// 依次执行四次 curl http://localhost:8000/
// 输出：
I am worker #1
I am worker #4
I am worker #2
I am worker #3

```



# cluster.workers

- Object

cluster.workers 是一个存储活跃的工作进程对象的hash表。hash表使用id字段作为key。有了key，就可以方便的遍历所有的工作进程。cluster.workers  只存在于主进程中。



当工作进程断开连接并退出后（ disconnected *and* exited），工作进程就会从cluster.workers中移除。这两个事件的顺序并不能预先确定，但是，可以确定的是，工作进程从cluster.workers列表的移除是发生在`disconnect  `  或者 `exit`中最后一个触发事件之前的。

```javascript
// Go through all workers
function eachWorker(callback) {
  for (const id in cluster.workers) {
    // id: int, 1,2,3,4
    callback(cluster.workers[id]);
  }
}
eachWorker((worker) => {
  worker.send('big announcement to all workers');
});
```

使用工作进程的id来定位工作进程是最方便的。

```javascript

socket.on('data', (id) => {
  const worker = cluster.workers[id];
});
```

