// const util = require('util');
// console.log(util.promisify.custom);  //Symbol(util.promisify.custom)
// console.log(typeof util.promisify.custom); //symbol

// const util = require('util');

// function doSomething(foo, callback) {
//   // ...
// }

// doSomething[util.promisify.custom] = function(foo) {
//  // return getPromiseSomehow();
// };

// const promisified = util.promisify(doSomething);
// console.log(promisified === doSomething[util.promisify.custom]); //true


const util = require('util');
const fs = require('fs');
 
const readFileSync = fs.readFileSync;

readFileSync[util.promisify.custom] = function(path){
  //设置 util.promisify.custom 属性，重写promisify返回值。
  return fs.readFileSync(path);
}

const promisified = util.promisify(readFileSync);

console.log( promisified===readFileSync[util.promisify.custom]); //true

async function callReadFile() {
  try{
    const fileContent = await promisified('./ceshi.txt');
    console.log(fileContent.toString()); // 同样可以输出文件的内容
  }catch(err){
    console.log(err);
  }

}
callReadFile();