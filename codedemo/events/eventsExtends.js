function A(){
  this.Test = function(){
    console.log("aaaaaa")
  }
}

class B extends A{
  log(){
    console.log("bbb")
  }
}

var b = new B();
b.Test();
b.log()
console.log(typeof A)
console.log(typeof B)
