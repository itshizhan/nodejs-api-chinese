# Class: http.Server

继承自`net.Server`, 同时具有以下额外事件：

### Event: 'checkContinue'

>http 100-continue用于客户端在发送POST数据给服务器前，征询服务器情况，看服务器是否处理POST的数据，如果不处理，客户端则不上传POST数据，如果处理，则POST上传数据。在现实应用中，通过POST大数据时，才会使用100-continue协议。     ---摘自网络

>如果客户端有POST数据要上传，可以考虑使用100-continue协议。加入头{"Expect":"100-continue"}            ----摘自网络

当收到一个带有`{"Expect":"100-continue"} ` 的请求时触发。如果该事件未设置监听函数，则服务器自动返回`100 Continue`作为响应。

处理此事件时，如果客户端继续发送请求主体，则调用`response.writeContinue()`，如果客户端没有持续发送请求主体，则产生一个适当的HTTP响应(如 400 错误请求)。

**注意**：当此事件被触发且处理后，`request` 事件不会被触发。


例如：

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.end("checkContinue");
});

const options={
  hostname:'localhost',
  port:10086,
  paht:'/',
  method:'POST',
  headers:{
    "Expect":"100-continue"
  }
}

http.request(options,function(res){

})

server.on('checkContinue', function(){
  console.log("checkContinue emited");

  //输出：checkContinue emited 
  
});
server.listen(10086);
```

### Event: 'checkExpectation'

当收到一个带有`Expect` 的值不为`100-continue`的请求时触发。如果该事件未设置监听函数，则服务器自动返回`417 Expectation Failed`作为响应。


**注意**：当此事件被触发且处理后，`request` 事件不会被触发。

### Event: 'clientError'
如果客户端连接出发了`error`事件，也会触发此事件(it will be forwarded here ???怎么理解，怎么翻译). 此事件的监听器会负责关闭或销毁底层的socket。例如：如果希望优雅的关闭socket，并返回一个 400 错误请求，而不是唐突的关闭服务连接。

因为，默认行为是异常请求，立即销毁socket。

socket是发生错误的`net.Socket`对象。


```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.end();
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
```

当`clientError`事件发生时，没有request或response对象。所以，发送的任何 HTTP 响应，包括响应头和内容，必须被直接写入到 socket 对象。 必须小心确保响应是一个被正确格式化的 HTTP 响应消息。

### Event: 'close'

服务器关闭时触发。

### Event: 'connect'

- request：<http.IncomingMessage> HTTP 请求参数，同 'request' 事件。
- socket： <net.Socket> 服务器与客户端之间的网络 socket。
- head： <Buffer> 流的第一个数据包，可能为空。

每当客户端发送 HTTP CONNECT 请求时触发。 如果此事件未被监听，则发送 CONNECT 请求的客户端会关闭连接。

当此事件被触发后，请求的 socket 上是没有 'data' 监听器的，这意味着你需要绑定 'data' 事件监听器，用来处理 socket 上发送到服务器的数据。

### Event: 'connection'

- socket ：<net.Socket> 上的事件

每当一个新的TCP流建立时，触发此事件。socket 是一个 net.Socket类型的对象。通常来说，用户不需要访问此事件。特别是，socket 并不会触发可读流（readable）事件，因为协议解析器绑定到到socket。 socket 可以通过 request.connection 访问。


### Event: 'request'

- request <http.IncomingMessage>
- response <http.ServerResponse>

每次请求时触发。注意：request 与connection 不是一个概念。 每次连接可能有多个请求。（例如，当保存keep-alive连接时）。

### Event: 'upgrade'



### server.maxHeadersCount

- <number> 默认是 2000.

允许请求头的最大数量。默认是2000，如果设置为0，则没有限制。

### server.setTimeout([msecs][, callback])

- msecs <Number>
- callback <Function>

设置socket的超时时间，及超时后的回调。

如果超时发生，则触发服务器对象的 'timeout' 事件，并传入 socket 作为一个参数。

如果服务器对象上设置了`timeout`事件监听，此监听将会携带超时socket参数调用。

默认情况下，服务器超时时间是2分钟，如果超时了，sockets将会自动销毁。然而，如果为服务器的`timeout`指定了监听器，你需要显式的处理超时。



返回：server

### server.timeout

- <number> 默认是：120000 毫秒(2分钟).

socket 被认为超时时的空闲毫秒数。

注意：此值的计算逻辑是建立在连接的基础上的。 因此，改变此值，并不会影响已经存在的连接，只会影响新建的连接。

当设置为0时，将使所有自动超时行为失效。




