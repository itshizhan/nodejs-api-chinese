var http=require('http');
var fs=require('fs');

http.createServer(function(req,res){
  //res.end("hello world");
  // fs.readFile('../testImgs/img1.png',function(err,data){
  //   if(err){
  //     console.log("no file exist");
  //   }else{
  //     res.writeHead("200",{
  //       "Content-Type":"image/png"
  //     });
  //     res.end(data);
  //   }
  // });

  fs.createReadStream('../testImgs/img2.png').pipe(res);
 
})
.listen(8848);