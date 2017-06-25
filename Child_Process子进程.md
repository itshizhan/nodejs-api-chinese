# [Child Process](https://nodejs.org/dist/latest-v8.x/docs/api/child_process.html#child_process_child_process)

`child_process` 模块以某种方式衍生子进程的能力。这种方式类似[popen(3)](http://man7.org/linux/man-pages/man3/popen.3.html)，但不完全相同。这种能力主要是基于`child_process.spawn()` 函数实现的。

```javascript
console.log(require('child_process'));
//输出如下：
{ ChildProcess:
   { [Function: ChildProcess]
     super_:
      { [Function: EventEmitter]
        EventEmitter: [Circular],
        usingDomains: false,
        defaultMaxListeners: [Getter/Setter],
        init: [Function],
        listenerCount: [Function] } },
  fork: [Function],
  _forkChild: [Function],
  exec: [Function],
  execFile: [Function],
  spawn: [Function],
  spawnSync: [Function: spawnSync],
  execFileSync: [Function: execFileSync],
  execSync: [Function: execSync] }
```



----

关于popen(): 

```c
  #include <stdio.h>

  FILE *popen(const char *command, const char *type);

  int pclose(FILE *stream);
```

　　popen()函数通过创建一个管道，调用fork()产生一个子进程，执行一个shell以运行命令来开启一个进程。这个管道必须由pclose()函数关闭，而不是fclose()函数。pclose()函数关闭标准I/O流，等待命令执行结束，然后返回shell的终止状态。如果shell不能被执行，则pclose()返回的终止状态与shell已执行exit一样。

　　popen()的返回值是个标准I/O流，必须由pclose来终止。

**更多解析，自行百度。**

----

示例：

```javascript
const { spawn } = require('child_process');
//执行ls 命令，输出/usr目录下面的文件
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```



默认情形下， `stdin`, `stdout` , `stderr` 管道是建立在父进程和衍生的子进程之间的。流数据以非阻塞的方式通过这些管道。注意，然而，在一些 程序中内部，使用的是行缓冲I/O（line-buffered I/O）。这样的实现方式并不会影响node.js,但这意味着，传输给子进程的数据可能不会立即消费。



 `child_process.spawn()` 方法通过异步的方式创建子进程，不会阻塞node.js的事件循环。

`child_process.spawnSync()`提供了相同的功能，但是以同步的方式，会阻塞事件循环，直到创建的子进程退出或终止。



为了方便起见，`child_process`提供了一些同步和异步的便捷方法，可以替代`child_process.spawn()`和`child_process.spawnSync()`方法。但是，请注意，这些便捷方法都是在child_process.spawn() or child_process.spawnSync()的基础上实现的。



- `child_process.exec()`:  创建一个shell，并可以执行shell命令，当完成时会传递`stdout`和  `stderr`到回调函数。

- `child_process.execFile()` ：类似child_process.exec()，但是，是直接创建命令，而无需向创建shell。

- `child_process.fork()` : 创建一个新的node.js进程。并可以通过IPC通讯通道调用指定模块，该通道允许父子进程之间通讯。

- `child_process.execSync()`: child_process.exec()方法的同步版本。会阻塞node.js事件循环。

- `child_process.execFileSync()`: child_process.execFile()方法的同步版本。会阻塞node.js事件循环。

  ​

在某些情形下，如自动化的shell脚步，同步版本的方法可能更加方便。然而，跟多的情形是，同步的方法对性能会有一些重大的影响。因为其会阻塞事件循环直到进程完成。



## Asynchronous Process Creation 异步进程创建



### Spawning `.bat` and `.cmd` files on Windows



### child_process.exec(command[, options][, callback])



###  child_process.execFile(file[, args][, options][, callback])



### child_process.fork(modulePath[, args][, options])



### child_process.spawn(command[, args][, options])



#  Synchronous Process Creation 同步进程创建



### child_process.execFileSync(file[, args][, options])



### child_process.execSync(command[, options])



### child_process.spawnSync(command[, args][, options])



# Class: ChildProcess   ChildProcess类 

#### Event: 'close'

#### Event: 'disconnect'

#### Event: 'error'

#### Event: 'exit'

#### Event: 'message'

#### child.channel

#### child.connected

#### child.disconnect()

#### child.kill([signal])

#### child.pid

#### child.send(message[, sendHandle[, options]][, callback])

#### child.stderr

#### child.stdin

#### child.stdio

#### child.stdout