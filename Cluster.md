# Cluster 集群





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





# Event: 'message'，事件





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

