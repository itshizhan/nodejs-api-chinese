# Buffer

在ECMAScript2015(ES6)引入TypedArray之前，javascript语言没有读取或操作二进制数据流的机制。Buffer类作为Node.js API的一部分引入，让其在TCP流和文件系统操作等情形下操作八位字节流**(octet streams)**成为可能。

> 译者注：octet的百度百科解释：在传统的二进制数字概念中，1 byte（字节）=8 bit（位）。大多数因特网标准使用八位组（octet）这个术语而不是使用字节来表示8位的量。该术语起始于TCP/IP发展的早期，当时许多早期的工作是在诸如DEC－10这样的系统上进行的，然而这些系统的结构使用的[字节](https://baike.baidu.com/item/%E5%AD%97%E8%8A%82)(byte)长度是10位（bit）,因此出现了octet的单位，即准确定义 1 octet = 8 bit。



既然，ES6中已经加入了TypedArray，而Buffer类以一种更优雅和更合适的方式对Node.js的用例实现了Uint8Array API。



Buffer类的实例类似整形数组，但是大小是固定的，而且在V8 堆之外分配原始内存。Buffer类的大小是固定的，因为其大小是在其创建时就确定的，而且不可以调整。

在Node.js中Buffer类式全局的，使用是不需要通过`require('buffer').Buffer`引入。

**例如：**

```javascript
// 创建一个长度为10，零充填的Buffer实例
const buf1 = Buffer.alloc(10);

// 创建一个长度为10， 0x1充填的Buffer实例
const buf2 = Buffer.alloc(10, 1);


//创建一个长度为10，但未初始化的buffer
//此方法比Buffer.alloc()更快，但是返回的buffer实例可能包含就旧数据，
//因此需要通过fill()或write()重写
const buf3 = Buffer.allocUnsafe(10);


//创建一个包含 [0x1, 0x2, 0x3]的buffer
const buf4 = Buffer.from([1, 2, 3]);

//创建一个包含UTF-8 字节 [0x74, 0xc3, 0xa9, 0x73, 0x74]的buffer
const buf5 = Buffer.from('tést');

// 创建一个 Latin-1 字节 包含[0x74, 0xe9, 0x73, 0x74]的buffer
const buf6 = Buffer.from('tést', 'latin1');
```





# `Buffer.from()`, `Buffer.alloc()`, and `Buffer.allocUnsafe()`



在Node.js v6之前的版本中，Buffer实例是通过Buffer构造函数创建的，基于构造函数的参数不同，返回不同的Buffer：



- Buffer构造函数如果第一个参数传入数值，如 new Buffer(10)，则分配一个指定大小的Buffer对象。在Node.js 8.0.0之前，通过这种方式创建的实例是没有进行内存初始化的，并且包含有敏感数据。这种Buffer实例，必须在之后通过buf.fill(0)或彻底写入进行初始化。虽然通过此种方式创建Buffer的本意是提升性能，然而经验证明，到底是创建一个快速但未初始化的Buffer，还是创建一个稍慢但是更安全的Buffer，这两个不同的方式是有必要进行显示区分的。因此，从Node.js 8.0.0开始，`Buffer(num)` 和 `new Buffer(num)`  将会返回一个已经初始化内存的Buffer。


- 传递一个字符串，数组，或Buffer，作为第一个参数，则将传入对象的数据拷贝进Buffer。
- 传递一个ArrayBuffer，则返回一个通过共享该ArrayBuffer分配内存的Buffer。



由此可见，new Buffer()构造函数的行为，会因为第一个参数的类型不同，会有显著的不同。如果应用程序没有正确的验证构造函数中传入的参数，或者没有恰当的初始化新分配的Buffer内容，可能会不经意间在代码中造成安全性和可靠性问题。



为了使Buffer实例的创建更加可靠，更少错误，`new Buffer` 构造函数的不同形式都已经废弃了，可以通过新的 `Buffer。from() Buffer.alloc()或 Buffer.allocUnsage()`方法进行替代。



开发者应该尽快将所有已存在的 new Buffer 构造方法迁移到下面这些新的APIs上面。

- Buffer.from(array):   返回一个包含提供的8位组字节副本的buffer。
- Buffer.from(arrayBuffer[, byteOffset [, length\]]) ： 返回一个与给定ArrayBuffer共享内存的新建buffer。
- Buffer.from(buffer):  返回一个包含给定Buffer副本内容的Bufer。


- Buffer.from(string[, encoding\]) ：返回一个包含给定字符串副本的Buffer。

- Buffer.alloc(size [,fill][,encodeing\]):  返回一个指定大小充填满的Buffer。此方法比Buffer.allocUnsafe(size)明显要慢，但是可以确保创建Buffer实例不会包含旧的和潜在的敏感数据。

- Buffer.allocUnsafe(size)和Buffer.allocUnsafeSlow(size): 返回指定大小的Buffer实例，必须通过buf.fill(0) 初始化，或完全填满。

  ​

如果size小于或等于Buffer.poolSize的一半，Buffer.allocUnsafe()返回的Buffer实例可能会被分配进一个内部共享的内存池。 而Buffer.allocUnsafeSlow() 返回的Buffer实例从来不会使用共享的内存池。



### The --zero-fill-buffers 命令行选项





















