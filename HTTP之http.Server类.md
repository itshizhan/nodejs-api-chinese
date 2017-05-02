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

  //checkContinue emited 
  
});
server.listen(10086);
```
