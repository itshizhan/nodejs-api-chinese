var http = require('http');  
  
var qs = require('querystring');  
  
http.createServer(function(req,res){
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('okay');
}).listen(10086);


var data = {  
    a: 123,  
    time: new Date().getTime()};//这是需要提交的数据  
  
  
var content = qs.stringify(data);  
  
var options = {  
    hostname: '127.0.0.1',  
    port: 10086,  
    path: '/?' + content,  
    method: 'GET'  
};  
  
var req = http.request(options, function (res) {  
    console.log('STATUS: ' + res.statusCode);  
    console.log('HEADERS: ' + JSON.stringify(res.headers));  
    res.setEncoding('utf8');  
    res.on('data', function (chunk) {  
        console.log('BODY: ' + chunk);  
    });  
    res.on('end', function (chunk) {  
        console.log('BODY: ' + chunk);  
        res.end(chunk);
    });  

});  
  
req.on('error', function (e) {  
    console.log('problem with request: ' + e.message);  
});  
  
req.end();