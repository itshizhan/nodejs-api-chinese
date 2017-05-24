var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    // fs.readFile(__dirname + '/data.txt', function (err, data) {
    //     res.end(data);
    // });
    var stream = fs.createReadStream(__dirname + '/data.txt');
    stream.pipe(res);
});
server.listen(8848);

/**
.pipe()方法监听fs.createReadStream()的'data' 和'end'事件，
这样"data.txt"文件就不需要缓存整个文件，当客户端连接完成之后马上可以发送一个数据块到客户端。
使用.pipe()另一个好处是可以解决当客户端延迟非常大时导致的读写不平衡问题。如果想压缩文件再发送，可以使用三方模块实现：
 */
/*
readable.pipe(destination[, options])#

destination <stream.Writable> The destination for writing data
options <Object> Pipe options
end <boolean> End the writer when the reader ends. Defaults to true.
*/