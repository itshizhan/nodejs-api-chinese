'use strict';

var domain;

// 构造函数
function EventEmitter() {
  // EventEmitter 构造执行时，执行init方法
  EventEmitter.init.call(this);
}
// 导出构造函数
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x 向后兼容
// EventEmitter.EventEmitter = EventEmitter;

// 是否是否EventEmitter 的子类 domain，默认不使用
EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
// 默认最多设置10个监听函数
var defaultMaxListeners = 10;

//defaultMaxListeners是类属性（也是唯一一个），相当于static成员，非实例属性
Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    // force global console to be compiled.
    // see https://github.com/nodejs/node/issues/4467
    console;
    // check whether the input is a positive number (whose value is zero or
    // greater and not a NaN).
    if (typeof arg !== 'number' || arg < 0 || arg !== arg)
      throw new TypeError('"defaultMaxListeners" must be a positive number');
    defaultMaxListeners = arg;
  }
});


// 构造方法，EventEmitter 实例化时执行
EventEmitter.init = function() {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    domain = domain || require('domain');
    if (domain.active && !(this instanceof domain.Domain)) {
      this.domain = domain.active;
    }
  }

  // EventEmitter 实例化是，将 _events 初始化为 {}， _eventsCount = 0
  // 这一步很重要，否则on()方法执行时 _events 为undefined
  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.

//设置事件监听器的个数，并返回EventEmitter实例，可以链式调用
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

// 供 实例的getMaxListeners方法调用
function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

// 返回 EventEmitter 当前的最大监听器限制值
// 该值可以通过 emitter.setMaxListeners(n) 设置或默认为 EventEmitter.defaultMaxListeners。
EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.

// 回调函数没有参数
function emitNone(handler, isFn, self) {
  if (isFn)
    // 如果是函数直接调用
    handler.call(self);
  else {
    // 如果是数组，拷贝后遍历执行
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}

//回调函数1个参数
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
//回调函数2个参数
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
//回调函数3个参数
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

//回调函数多个参数，遍历
function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

//emit 方法用于触发事件，返回true 或false，或抛出异常
EventEmitter.prototype.emit = function emit(type) {
  // 定义临时变量
  var er, handler, len, args, i, events, domain;
  var needDomainExit = false;

  //如果参数是error，则是触发error事件
  var doError = (type === 'error');

  // events 即当前的事件队列 {}
  events = this._events;
  // 继续处理doError
  if (events)
    //doError 为true
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  domain = this.domain;

  // If there is no 'error' event listener then throw.
  if (doError) {
    //触发error事件，且有第二个参数
    if (arguments.length > 1)
      er = arguments[1];

    if (domain) {
      if (!er)
        er = new Error('Unhandled "error" event');
      if (typeof er === 'object' && er !== null) {
        er.domainEmitter = this;
        er.domain = domain;
        er.domainThrown = false;
      }
      domain.emit('error', er);
    } else if (er instanceof Error) {
      // 直接抛出异常
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      // 抛出自定义异常
      const err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }


  //获取触发事件名称对应的回调函数，events = this._events的分析见下文
  handler = events[type];

  //未定义回调函数
  if (!handler)
    return false;

   //如果使用了domain
  if (domain && this !== process) {
    domain.enter();
    needDomainExit = true;
  }

  //触发的事件有监听函数，根据参数分别进行处理？ 这里为什么要分别处理呢？ 性能问题？
  //emit参数最好不要太多，回调函数的参数最好不要超过3个，否则性能会慢
  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    // fast cases
    case 1:
      //回调函数没有参数
      emitNone(handler, isFn, this);
      break;
    case 2:
      //回调函数有1个参数 
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      //回调函数有2个参数 
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      //回调函数有3个参数 
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower //多个参数
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  //继续处理domain
  if (needDomainExit)
    domain.exit();

  return true;
};


//addListener 方法底层
function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;
  // listener 必须是函数
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  //当前实例的事件队列{}, _events 是原型属性，默认是undefined， 在init 时初始化为{}
  events = target._events; 
  if (!events) {  
    //如果false，创建一个空对象
    //这一步感觉有点多余，因为实例化的时候，_events 已经初始化为 {}了，这里会执行吗？
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    // 为了避免添加了 newListener 事件，产生递归，在添加事件监听器前，先触发一次 newListener 事件
    if (events.newListener) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    // 将事件名 作为事件队列对象的key
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    // 为了防止内存泄漏，检查事件监听器是否超过最大值
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        const w = new Error('Possible EventEmitter memory leak detected. ' +
                            `${existing.length} ${String(type)} listeners ` +
                            'added. Use emitter.setMaxListeners() to ' +
                            'increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        process.emitWarning(w);
      }
    }
  }

  return target;
}

// 添加一个事件绑定，等同于on
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

//参加addListener
EventEmitter.prototype.on = EventEmitter.prototype.addListener;


EventEmitter.prototype.prependListener = function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
};

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
                                  arguments[2]);
      default:
        const args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target, type, listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    ret = [];
  else {
    evlistener = events[type];
    if (!evlistener)
      ret = [];
    else if (typeof evlistener === 'function')
      ret = [evlistener.listener || evlistener];
    else
      ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  const events = this._events;

  if (events) {
    const evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  const ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}