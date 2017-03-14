# Assert 断言

断言模块提供一些简单的断言测试，常用于测试一些不变量。

> 断言是被用来检查非法情况而不是错误情况，即在该程序正常工作时绝不应该发生的非法情况，用来帮助开发人员对问题的快速定位。异常处理用于对程序发生异常情况的处理，增强程序的健壮性、容错性，减少程序使用中对用户不有好的行为，不让(通常也不必)用户知道发生了什么错误。                 ----来源百度

> 断言表示为一些布尔表达式，程序员相信在程序中的某个特定点该表达式值为真，当需要在一个值为FALSE时中断当前操作的话，可以使用断言。  --------来源百科
                  

## assert(value[, message])
Added in: v0.5.9
- value <any>
- message <any>

 `assert.ok() `的别称.
 
 用于测试value的值是否为true，等同于：
 
 `assert.equal(!!value, true, message)`
 
 如果value不为true，则抛出`AssertionError`错误，并将message参数作为错误消息的提示。如果message参数为指定，则抛出默认的错误消息。
 
 如下例：
 
 ```
const assert = require('assert');

assert.ok(true);
// OK
assert.ok(1);
// OK
assert.ok(false);
// throws "AssertionError: false == true"
assert.ok(0);
// throws "AssertionError: 0 == true"
assert.ok(false, 'it\'s false');
// throws "AssertionError: it's false"
 
 ```
 
注：一旦assert断言为false，则程序抛出错误，终止继续执行。


 
 # assert.deepEqual(actual, expected[, message])
 


Version | Changes
---|---
v6.4.0, v4.7.1| Typed array slices are handled correctly now.
v6.1.0, v4.5.0 | Objects with circular references can be used as inputs now.
v5.10.1, v4.4.3 | Handle non-Uint8Array typed arrays correctly.
v0.1.21	 | Added in: v0.1.21


- actual <any>实际值
- expected <any> 期望值
- message <any> 消息提示







