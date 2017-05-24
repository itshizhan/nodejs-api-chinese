process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    // if(chunk=="exit"){
    //   process.exit(1);
    // }
    // console.log(chunk);
    process.stdout.write(`data: ${chunk}`);
  }
});

process.on('beforeExit',function(){
  console.log("sddsdsdsds---");
});

process.stdin.on('end', () => {
  process.stdout.write('end');
});