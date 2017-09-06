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





# cluster.setupMaster([settings])





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

