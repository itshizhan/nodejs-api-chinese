const util = require('util');
const fs = require('fs');
 
//fs.stat(path, callback) 获取文件信息
const stat = util.promisify(fs.stat);
//console.log(typeof stat); //function


// stat('./ceshi.txt').then((stats) => {
//   // Do something with `stats`
//   console.log(stats)
// }).catch((error) => {
//   // Handle the error.
//   console.log(error);

// });

async function callStat() {
  try{
    const stats = await stat('./ceshi.txt');
    console.log(stats);
  }catch(err){
  console.log(err);
  }

}
callStat();