# HTTP

要使用HTTP 服务端和客户端（server and client），可以通过`require('http')`引入此模块


node.js中HTTP接口的设计，支持很多传统很难处理的协议特性。特别是处理庞大的，可能是块编码的消息。 接口对于整个请求和相应从不进行缓存，处理的很谨慎，这样用户可以以流的方式处理数据。


HTTP 消息头表现为一个对象字面量，如下：
```
{ 
    'content-length': '123',
    'content-type': 'text/plain',
    'connection': 'keep-alive',
    'host': 'mysite.com',
    'accept': '*/*' 
}
  ```
消息对象的keys消息，值不进行修改。

为了尽可能的支持完整支持http应用，node.js 的http api 设计的非常底层，只涉及流处理和消息解析。它把一个消息解析成头部和主体(headers and body),但并不解析具体的头部和主体内容。

详细信息，可以查看`message.headers`,关于重复头部信息的处理。

接收到的原始的headers，保存在rawHeaders属性中，是一个类似` [key, value, key2, value2, ...]`的数组

例如，之前的头消息可能有一个下面的rawHeaders属性：

```
[ 'ConTent-Length', '123456',
  'content-LENGTH', '123',
  'content-type', 'text/plain',
  'CONNECTION', 'keep-alive',
  'Host', 'mysite.com',
  'accepT', '*/*' ]
```

# http.Agent 类