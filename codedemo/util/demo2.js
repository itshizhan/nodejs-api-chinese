const util = require('util');
const fs = require('fs');
 
const readFile = util.promisify(fs.readFile);

console.log(typeof readFile);  //function

async function callReadFile() {
  try{
    const fileContent = await readFile('./ceshi.txt');
    console.log(fileContent.toString()); // 输出文件的内容
  }catch(err){
    console.log(err);
  }

}
callReadFile();