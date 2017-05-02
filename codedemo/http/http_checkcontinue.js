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