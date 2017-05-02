var  http=require('http');

var proxy = http.createServer( (req, res1) => {

  if(req.url){
    http.get('http://nodejs.org/dist/index.json', function(res){
      let rawData = '';
      res.setEncoding('utf-8');
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          res1.write(rawData)
          res1.end();

        } catch (e) {
          console.error("error:"+e.message);

        }
      });
    })
  }

});
var port=10086;
proxy.listen(port,function(){
  console.log("server start at:"+port)
})