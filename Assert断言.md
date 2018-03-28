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

`assert.deepEqual(actual, expected[, message])` 测试实际值与期望值之间的深度相等，原始值的使用(==)运算符进行比较。

只考虑可枚举的自身属性。对于对象原型,attached symbols,以及非枚举属性，可能会产生意想不到的结果。

例如：以下的示例并不会抛出断言错误，因为Error对象属性是不可枚举的。
```
// WARNING: This does not throw an AssertionError!
assert.deepEqual(Error('a'), Error('b'));
```

深度相等意味着子对象的自身可枚举属性也会考虑在内。

```js
const assert = require('assert');

const obj1 = {
  a : {
    b : 1
  }
};
const obj2 = {
  a : {
    b : 2
  }
};
const obj3 = {
  a : {
    b : 1
  }
};
const obj4 = Object.create(obj1);  
//obj1是obj4的原型，因此obj4={},
//但是：console.log(obj4.__proto__==obj1) //true

assert.deepEqual(obj1, obj1);
// OK, object is equal to itself

assert.deepEqual(obj1, obj2);
// AssertionError: { a: { b: 1 } } deepEqual { a: { b: 2 } }
// values of b are different

assert.deepEqual(obj1, obj3);
// OK, objects are equal

assert.deepEqual(obj1, obj4);
// AssertionError: { a: { b: 1 } } deepEqual {}
// Prototypes are ignored
```

# assert.deepStrictEqual(actual, expected[, message])

总体来说，和`assert.deepEqual()`用法相同，但有两点例外，不一样：
### 1. 原始值使用严格相对运算符（===）进行比较
### 2. 如果是对象比较，对象的属性也会进行严格比较。

```js
const assert = require('assert');

assert.deepEqual({a:1}, {a:'1'});
// OK, because 1 == '1'

assert.deepStrictEqual({a:1}, {a:'1'});
// AssertionError: { a: 1 } deepStrictEqual { a: '1' }
// because 1 !== '1' using strict equality
```

# assert.doesNotThrow(block[, error][, message])


# assert.equal(actual, expected[, message])


# assert.fail(actual, expected, message, operator)


# assert.ifError(value)


# assert.notDeepEqual(actual, expected[, message])


# assert.notDeepStrictEqual(actual, expected[, message])



# assert.notEqual(actual, expected[, message])

- actual <any>
- expected <any>
- message <any>


断言不相等（shallow, coercive inequality ），使用Abstract Equality Comparison ( != )

```js
const assert = require('assert');

assert.notEqual(1, 2);
// OK

assert.notEqual(1, 1);
// AssertionError: 1 != 1

assert.notEqual(1, '1');
// AssertionError: 1 != '1'
```


如果value 和 expected 相等，会抛出带有message属性的AssertionError异常，并将message参数作为其值。如果message参数 没有指定，为展示默认的错误消息。

# assert.notStrictEqual(actual, expected[, message])

- actual <any>
- expected <any>
- message <any>

断言不严格相等,使用 Strict Equality Comparison `！==`

```js
const assert = require('assert');

assert.notStrictEqual(1, 2);
// OK

assert.notStrictEqual(1, 1);
// AssertionError: 1 !== 1

assert.notStrictEqual(1, '1');
// OK
```

# assert.ok(value[, message])

断言value 是否为true值(truely),等同于 `assert.equal(!!value, true, message).`


如果value 不为true或转为true (truely),会抛出带有message属性的AssertionError异常，并将message参数作为其值。如果message参数 没有指定，为展示默认的错误消息。

```js

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


# assert.strictEqual(actual, expected[, message])
使用严格相对运算符 == 比较 actual和expected 是否相对，不等时，可以给定消息提示。

```js
const assert = require('assert');

assert.strictEqual(1, 2);
// AssertionError: 1 === 2

assert.strictEqual(1, 1);
// OK

assert.strictEqual(1, '1');
// AssertionError: 1 === '1'
```

如果比较的值不严格相等，会抛出带有message属性的AssertionError异常，并将message参数作为其值。如果message参数 没有指定，为展示默认的错误消息。

# assert.throws(block[, error][, message])
- block：函数
- error：正则或函数
- message：any

断言 block 以抛出错误。

error：可以是正则表达式，或任何有效的函数(自定义函数，箭头函数)
message： 如果指定了此参数，当block 不抛出错误是，message参数会作为AssertionErro 的信息。

```js
// 构造函数
assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  Error
);

// 正则

assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  /value/
)

// 自定义错误函数

assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  function(err) {
    if ((err instanceof Error) && /value/.test(err)) {
      return true;
    }
  },
  'unexpected error'
);

```


> 注意(Note that): error参数不能是字符串，如果第二个参数是一个字符串会被认为忽略了error（error is assumed to be omitted), 同时error字符串会被作为message参数。这个可能会导致一些很容易忽视(easy-to-miss)的错误。

```js
// THIS IS A MISTAKE! DO NOT DO THIS!
assert.throws(myFunction, 'missing foo', 'did not throw with expected message');

// Do this instead.
assert.throws(myFunction, /missing foo/, 'did not throw with expected message');
```




# Caveats 警告

对于下面的示例(同值为零samevaluezero)，建议使用ES2015 的Object.is() 进行比较：

```js
const a = 0;
const b = -a;
assert.notStrictEqual(a, b);
// AssertionError: 0 !== -0
// Strict Equality Comparison doesn't distinguish between -0 and +0...
assert(!Object.is(a, b));
// but Object.is() does!

const str1 = 'foo';
const str2 = 'foo';
assert.strictEqual(str1 / 1, str2 / 1);
// AssertionError: NaN === NaN
// Strict Equality Comparison can't be used to check NaN...
assert(Object.is(str1 / 1, str2 / 1));
// but Object.is() can!
```

> Object.is() 是ES2015 的概念，为了解决同值相等（Same-value equality）的问题，相当于 === ，区别是：`Object.is(0，-0)` 为 false，`Object.is(NaN，NaN)` 为true


更多信息，可以参考：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness


