# HTTP

要使用HTTP 服务端和客户端（server and client），可以通过`require('http')`引入此模块


node.js中HTTP接口的设计，支持很多传统很难处理的协议特性。特别是处理庞大的，可能是块编码的消息。 接口对于整个请求和响应从不进行缓存，处理的很谨慎，这样用户可以以流的方式处理数据。


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
[ 
  'ConTent-Length', '123456',
  'content-LENGTH', '123',
  'content-type', 'text/plain',
  'CONNECTION', 'keep-alive',
  'Host', 'mysite.com',
  'accepT', '*/*' 
]
```

# 主要目录（译者添加）

- Class:http.Agent
- Class:http.ClientRequst
- Class:http.Server
- Class:http.ServerResponse
- Class:http.IncomingMessage
- Http.Methods
- Http.STATUS_CODES
- http.createServer([requestListener])
- http.get(options[, callback])
- http.globalAgent
- http.request(options[, callback])

# http.Agent 类

> node.js的http模块使用了一个agent代理。如果你的http启动了keep-alive那么这个代理相当于一个连接池。
这个代理维护了一定数量的socket链接，当然都是短链接。http发起请求所用的socket都是通过代理获取的。
这样就省去了每次发起http请求是创建套接字的时间提高了效率。
-- 引用自：http://linmomo02.iteye.com/blog/1415695

# http.request(options[, callback]) 

```Returns:<http.ClientRequest>```

Nodejs维护服务器的多个连接来进行http请求，request函数允许显式的进行请求。
options参数：可以是一个object 或 string，如果是string，则自动通过url.parse()进行解析。
callback参数：Function,作为response 事件的监听器函数进行添加。是可选的。

**http.request 返回的是http.ClientRequest类的实例。ClientRequest实例是一个可写流。如果通过post方式进行一个上传文件的请求，则可以将其写入ClientRequest对象。**

当options时对象是，其属性说明如下：
- protocol:请求协议，默认http
- host:主机名，域名或Ip地址，默认是localhost.
- hostname:host的别名，支持url.parse(),推荐使用hostname
- family:number类型，解析host时的IP地址家族,值是4或6，如果没有指定，同时支持IP v4和IP v6
- port：端口后，默认80
- localAddress：绑定到网络连接的本地接口
- socketPath:Unix域名套接字
- method:请求方法，默认get
- path:请求路径，默认"/". 可以包含查询字符串，如'/index.html?page=12'。path是字符串，如果包含非法字符，会抛出异常。同时，path中忽略空格(spaces)
- headers:object请求头对象。
- auth:请求授权形式，如`user:password`
- agent：指定请求代理的行为。默认值：undefined，使用http.globalAgent(即所有http客户端请求的默认Agent)。如果指定 Agent object：可以显式使用Agent，如果传递false：则产生一个新的使用默认值的 Agent。
- createConnection:Function, 当未指定 agent 选项时，产生一个用于请求的 socket/stream 的函数。 避免创建一个自定义的 Agent 类来覆盖默认createConnection 函数。详见 agent.createConnection();
- timeout:设置socket的超时毫秒数。



`http.request(options[, callback]) `使用示例：

```
const postData = querystring.stringify({
  'msg': 'Hello World!'
});

const options = {
  hostname: 'www.google.com',
  port: 80,
  path: '/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
```