# Buffer

在ECMAScript2015(ES6)引入TypedArray之前，javascript语言没有读取或操作二进制数据流的机制。Buffer类作为Node.js API的一部分引入，让其在TCP流和文件系统操作等情形下操作八位字节流成为可能。

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
//此方法比Buffer.alloc()更快，但是返回的buffer实例可能包含就数据，
//因此需要通过fill()或write()重写
const buf3 = Buffer.allocUnsafe(10);


//创建一个包含 [0x1, 0x2, 0x3]的buffer
const buf4 = Buffer.from([1, 2, 3]);

//创建一个包含UTF-8 字节 [0x74, 0xc3, 0xa9, 0x73, 0x74]的buffer
const buf5 = Buffer.from('tést');

// 创建一个 Latin-1 字节 包含[0x74, 0xe9, 0x73, 0x74]的buffer
const buf6 = Buffer.from('tést', 'latin1');
```

















