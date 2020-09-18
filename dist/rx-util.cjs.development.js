'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 在浏览器上下载二进制资源
 * @param blob 要下载的二进制资源
 * @param filename 文件名
 */
function download(blob, filename) {
  if (filename === void 0) {
    filename = 'unknown';
  }

  // 创建隐藏的可下载链接
  var eleLink = document.createElement('a');
  eleLink.download = filename;
  eleLink.style.display = 'none'; // 为 link 赋值

  eleLink.href = URL.createObjectURL(blob); // 触发点击

  document.body.appendChild(eleLink);
  eleLink.click(); // 然后移除

  document.body.removeChild(eleLink);
}

/**
 * 将字符串转化为 Blob 类型
 * @param str 字符串
 * @returns Blob 数据
 */
function strToBlob(str) {
  return new Blob([str], {
    type: 'text/plain'
  });
}

/**
 * 在浏览器上下载文本内容
 * @param str 字符串内容
 * @param filename 下载文件名，没有则默认为链接中的文件名
 */

var downloadString = function downloadString(str, filename) {
  if (filename === void 0) {
    filename = 'unknown.txt';
  }

  try {
    download(strToBlob(str), filename);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * 根据 url 下载二进制资源
 * @param url 下载请求信息
 * @param filename 下载文件名，没有则默认为链接中的文件名
 */
var downloadUrl = function downloadUrl(url, filename) {
  try {
    if (filename === undefined) filename = url.substr(url.lastIndexOf('/'));
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none'; // 为 link 赋值

    eleLink.href = url; // 触发点击

    document.body.appendChild(eleLink);
    eleLink.click(); // 然后移除

    document.body.removeChild(eleLink);
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * 获取 cookie 键值映射 Map
 * @returns cookie 键值映射 Map
 */
function getCookies() {
  return document.cookie.split(';').reduce(function (res, str) {
    var _str$split = str.split('='),
        k = _str$split[0],
        v = _str$split[1];

    res.set(k, v);
    return res;
  }, new Map());
}

/**
 * 将 url 中的内容加载到元素上
 * 注：domSelector 必须有 src 属性用以将加载完成的资源赋值给其，加载默认是异步的
 * @param url url 资源
 * @param dom dom 元素
 * @param init 初始化参数, 实为 fetch() 的参数以及一些自定义的参数，默认 {}
 * 关于 fetch 具体可以参考 <https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch>
 */
var loadResource = function loadResource(url, dom, init) {
  if (init === void 0) {
    init = {};
  }

  try {
    return Promise.resolve(fetch(url, init)).then(function (res) {
      return Promise.resolve(res.blob()).then(function (blob) {
        // 生成一个本地的 url 并赋值给 src 属性
        dom.src = window.URL.createObjectURL(blob);
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * 协议与默认端口映射表
 */
var protocolPortMap = /*#__PURE__*/new Map().set('http', 80).set('https', 443).set('ssh', 22).set('ftp', 21);
/**
 * 解析 url 字符串
 * @param url url 字符串，不能为空
 * @returns url 对象
 * @deprecated 请使用原生 API URL 类，可以通过 new URL(url) 将 URL 字符串转换为 URL 对象，并获取指定的信息
 */

function parseUrl(url) {
  if (!url) {
    throw new Error('Url cannot be empty');
  }

  var regexp = new RegExp('^((\\w+)://([\\w\\.]*)(:(\\d+))?)(.*)');
  var temps = regexp.exec(url);

  if (temps === null) {
    return null;
  }

  var website = temps[1];
  var protocol = temps[2];
  var domain = temps[3];
  var portStr = temps[5];
  var href = temps[6]; // 截取域名之后的内容

  var temp = url.substr(website.length);
  var markIndex = temp.indexOf('?'); // 如果没有携带参数则直接返回

  if (markIndex === -1) {
    var _accessPath = temp;
    return {
      url: url,
      website: website,
      protocol: protocol,
      domain: domain,
      // tslint:disable-next-line:radix
      port: parseInt(portStr),
      href: href,
      accessPath: _accessPath,
      params: new Map()
    };
  }

  var accessPath = temp.substr(0, markIndex);

  if (accessPath.endsWith('/')) {
    accessPath = accessPath.substring(0, accessPath.length - 1);
  }

  var port = portStr || protocolPortMap.get(protocol) || 0; // 解析参数列表

  var params = temp.substr(markIndex + 1).split('&').map(function (str) {
    return str.split('=');
  }).filter(function (arr) {
    return arr[0] !== '';
  }).reduce(function (params, arr) {
    var k = decodeURIComponent(arr[0]);
    var v = decodeURIComponent(arr.length === 1 ? '' : arr[1]); // 如果已经存在了就认为是数组参数

    var vs = params.get(k);

    if (vs === undefined) {
      params.set(k, v);
    } else {
      if (!Array.isArray(vs)) {
        params.set(k, [vs]);
      }

      if (params.get(k).length !== undefined) {
        params.get(k).push(v);
      }
    }

    return params;
  }, new Map());
  return {
    url: url,
    website: website,
    protocol: protocol,
    domain: domain,
    port: port,
    href: href,
    accessPath: accessPath,
    params: params
  };
}

/**
 * 读取文件类型
 */
var ReadType;

(function (ReadType) {
  /**
   * 以 data url 读取
   */
  ReadType["DataURL"] = "readAsDataURL";
  /**
   * 以文本读取
   */

  ReadType["Text"] = "readAsText";
  /**
   * 以二进制文件读取
   */

  ReadType["BinaryString"] = "readAsBinaryString";
  /**
   * 以 ArrayBuffer 读取
   */

  ReadType["ArrayBuffer"] = "readAsArrayBuffer";
})(ReadType || (ReadType = {}));
/**
 * 读取本地浏览器选择的文件
 * @param file 选择的文件
 * @param options 读取的选项
 * @returns 返回了读取到的内容（异步）
 */


function _readLocal(file, options) {
  if (options === void 0) {
    options = {};
  }

  var _Object$assign = Object.assign({
    type: ReadType.DataURL,
    encoding: 'UTF-8'
  }, options),
      type = _Object$assign.type,
      encoding = _Object$assign.encoding;

  return new Promise(function (resolve, reject) {
    if (!file) {
      reject(new Error('file not exists'));
    }

    var fr = new FileReader();

    fr.onload = function () {
      resolve(fr.result);
    };

    fr.onerror = function (error) {
      reject(error);
    };

    switch (type) {
      case ReadType.DataURL:
        fr.readAsDataURL(file);
        break;

      case ReadType.Text:
        fr.readAsText(file, encoding);
        break;

      case ReadType.BinaryString:
        fr.readAsBinaryString(file);
        break;

      case ReadType.ArrayBuffer:
        fr.readAsArrayBuffer(file);
        break;
    }
  });
}
var readLocal = /*#__PURE__*/Object.assign(_readLocal, {
  ReadType: ReadType,

  /**
   * 以 data url 读取
   * @deprecated 已废弃，请使用枚举类 ReadType
   */
  DataURL: ReadType.DataURL,

  /**
   * 以文本读取
   * @deprecated 已废弃，请使用枚举类 ReadType
   */
  Text: ReadType.Text,

  /**
   * 以二进制文件读取
   * @deprecated 已废弃，请使用枚举类 ReadType
   */
  BinaryString: ReadType.BinaryString,

  /**
   * 以 ArrayBuffer 读取
   * @deprecated 已废弃，请使用枚举类 ReadType
   */
  ArrayBuffer: ReadType.ArrayBuffer
});

/**
 * 为 js 中的 Date 对象原型添加 format 格式化方法
 * @param date 要进行格式化的日期
 * @param fmt 日期的格式，格式 {@code '[Y+|y+][M+][D+|d+][H+|h+][m+][s+][S+][q+]'}
 * @returns 格式化得到的结果
 */
function dateFormat(date, fmt) {
  var timeFormatDefaults = {
    'Y+|y+': date.getFullYear(),
    'M+': date.getMonth() + 1,
    'D+|d+': date.getDate(),
    'H+|h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S+': date.getMilliseconds()
  };

  for (var k in timeFormatDefaults) {
    if (!new RegExp('(' + k + ')').test(fmt)) {
      continue;
    }

    if (k === 'Y+|y+') {
      fmt = fmt.replace(RegExp.$1, ('' + timeFormatDefaults[k]).substr(4 - RegExp.$1.length));
    } else if (k === 'S+') {
      var lens = RegExp.$1.length;
      lens = lens === 1 ? 3 : lens;
      fmt = fmt.replace(RegExp.$1, ('00' + timeFormatDefaults[k]).substr(('' + timeFormatDefaults[k]).length - 1, lens));
    } else {
      var v = Reflect.get(timeFormatDefaults, k);
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? v : ('00' + v).substr(('' + v).length));
    }
  }

  return fmt;
}

/**
 * 默认的日期格式
 * 不加 Z 为本地日期时间，避免出现时区的问题
 */

var dateFormatter = 'yyyy-MM-ddThh:mm:ss.SSS';
/**
 * 将参数 key 与 value 进行 url 编码
 * @param k 参数的名字
 * @param v 参数的值
 * @returns 编码后的字符串
 */

var encode = function encode(k, v) {
  return encodeURIComponent(k) + '=' + encodeURIComponent(v);
};
/**
 * 拼接参数字符串
 * @param params 参数对象
 * @returns 拼接后的字符串
 */


function spliceParams(params) {
  if (params === void 0) {
    params = {};
  }

  return Array.from(Object.entries(params)).reduce(function (res, _ref) {
    var k = _ref[0],
        v = _ref[1];

    if (v === undefined || v === null) {
      return res;
    } else if (v instanceof Date) {
      res += encode(k, dateFormat(v, dateFormatter));
    } else if (v instanceof Array) {
      res += v.map(function (item) {
        return encode(k, item instanceof Date ? dateFormat(item, dateFormatter) : item);
      }).join('&');
    } else {
      res += encode(k, v);
    }

    return res += '&';
  }, '');
}

/**
 * 等待指定的时间/等待指定表达式成立
 * 如果未指定等待条件则立刻执行
 * 注: 此实现在 nodejs 10- 会存在宏任务与微任务的问题，切记 async-await 本质上还是 Promise 的语法糖，实际上并非真正的同步函数！！！即便在浏览器，也不要依赖于这种特性。
 * @param param 等待时间/等待条件
 * @returns Promise 对象
 */
function wait(param) {
  return new Promise(function (resolve) {
    if (typeof param === 'number') {
      setTimeout(resolve, param);
    } else if (typeof param === 'function') {
      var timer = setInterval(function () {
        if (param()) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    } else {
      resolve();
    }
  });
}

/**
 * 为 fetch 请求添加超时选项
 * 注：超时选项并非真正意义上的超时即取消请求，请求依旧正常执行完成，但会提前返回 reject 结果
 * @param fetchPromise fetch 请求的 Promise
 * @param timeout 超时时间
 * @returns 如果超时就提前返回 reject, 否则正常返回 fetch 结果
 */

function fetchTimeout(fetchPromise, timeout) {
  return Promise.race([fetchPromise, wait(timeout).then(function () {
    throw new Error('timeout');
  })]);
}

/**
 * 将字符串转为字符流
 * @param str 字符串
 * @returns 字符流对象
 */
function strToArrayBuffer(str) {
  var buf = new ArrayBuffer(str.length);
  var view = new Uint8Array(buf);

  for (var i = 0; i < str.length; ++i) {
    view[i] = str.charCodeAt(i) & 0xff;
  }

  return buf;
}

// A type of promise-like that resolves synchronously and supports only one observer
const _Pact = /*#__PURE__*/(function() {
	function _Pact() {}
	_Pact.prototype.then = function(onFulfilled, onRejected) {
		const result = new _Pact();
		const state = this.s;
		if (state) {
			const callback = state & 1 ? onFulfilled : onRejected;
			if (callback) {
				try {
					_settle(result, 1, callback(this.v));
				} catch (e) {
					_settle(result, 2, e);
				}
				return result;
			} else {
				return this;
			}
		}
		this.o = function(_this) {
			try {
				const value = _this.v;
				if (_this.s & 1) {
					_settle(result, 1, onFulfilled ? onFulfilled(value) : value);
				} else if (onRejected) {
					_settle(result, 1, onRejected(value));
				} else {
					_settle(result, 2, value);
				}
			} catch (e) {
				_settle(result, 2, e);
			}
		};
		return result;
	};
	return _Pact;
})();

// Settles a pact synchronously
function _settle(pact, state, value) {
	if (!pact.s) {
		if (value instanceof _Pact) {
			if (value.s) {
				if (state & 1) {
					state = value.s;
				}
				value = value.v;
			} else {
				value.o = _settle.bind(null, pact, state);
				return;
			}
		}
		if (value && value.then) {
			value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
			return;
		}
		pact.s = state;
		pact.v = value;
		const observer = pact.o;
		if (observer) {
			observer(pact);
		}
	}
}

function _isSettledPact(thenable) {
	return thenable instanceof _Pact && thenable.s & 1;
}

// Asynchronously iterate through an object that has a length property, passing the index as the first argument to the callback (even as the length property changes)
function _forTo(array, body, check) {
	var i = -1, pact, reject;
	function _cycle(result) {
		try {
			while (++i < array.length && (!check || !check())) {
				result = body(i);
				if (result && result.then) {
					if (_isSettledPact(result)) {
						result = result.v;
					} else {
						result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
						return;
					}
				}
			}
			if (pact) {
				_settle(pact, 1, result);
			} else {
				pact = result;
			}
		} catch (e) {
			_settle(pact || (pact = new _Pact()), 2, e);
		}
	}
	_cycle();
	return pact;
}

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

// Asynchronously iterate through an object's values
// Uses for...of if the runtime supports it, otherwise iterates until length on a copy
function _forOf(target, body, check) {
	if (typeof target[_iteratorSymbol] === "function") {
		var iterator = target[_iteratorSymbol](), step, pact, reject;
		function _cycle(result) {
			try {
				while (!(step = iterator.next()).done && (!check || !check())) {
					result = body(step.value);
					if (result && result.then) {
						if (_isSettledPact(result)) {
							result = result.v;
						} else {
							result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
							return;
						}
					}
				}
				if (pact) {
					_settle(pact, 1, result);
				} else {
					pact = result;
				}
			} catch (e) {
				_settle(pact || (pact = new _Pact()), 2, e);
			}
		}
		_cycle();
		if (iterator.return) {
			var _fixup = function(value) {
				try {
					if (!step.done) {
						iterator.return();
					}
				} catch(e) {
				}
				return value;
			};
			if (pact && pact.then) {
				return pact.then(_fixup, function(e) {
					throw _fixup(e);
				});
			}
			_fixup();
		}
		return pact;
	}
	// No support for Symbol.iterator
	if (!("length" in target)) {
		throw new TypeError("Object is not iterable");
	}
	// Handle live collections properly
	var values = [];
	for (var i = 0; i < target.length; i++) {
		values.push(target[i]);
	}
	return _forTo(values, function(i) { return body(values[i]); }, check);
}

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously implement a generic for loop
function _for(test, update, body) {
	var stage;
	for (;;) {
		var shouldContinue = test();
		if (_isSettledPact(shouldContinue)) {
			shouldContinue = shouldContinue.v;
		}
		if (!shouldContinue) {
			return result;
		}
		if (shouldContinue.then) {
			stage = 0;
			break;
		}
		var result = body();
		if (result && result.then) {
			if (_isSettledPact(result)) {
				result = result.s;
			} else {
				stage = 1;
				break;
			}
		}
		if (update) {
			var updateValue = update();
			if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
				stage = 2;
				break;
			}
		}
	}
	var pact = new _Pact();
	var reject = _settle.bind(null, pact, 2);
	(stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
	return pact;
	function _resumeAfterBody(value) {
		result = value;
		do {
			if (update) {
				updateValue = update();
				if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
					updateValue.then(_resumeAfterUpdate).then(void 0, reject);
					return;
				}
			}
			shouldContinue = test();
			if (!shouldContinue || (_isSettledPact(shouldContinue) && !shouldContinue.v)) {
				_settle(pact, 1, result);
				return;
			}
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
				return;
			}
			result = body();
			if (_isSettledPact(result)) {
				result = result.v;
			}
		} while (!result || !result.then);
		result.then(_resumeAfterBody).then(void 0, reject);
	}
	function _resumeAfterTest(shouldContinue) {
		if (shouldContinue) {
			result = body();
			if (result && result.then) {
				result.then(_resumeAfterBody).then(void 0, reject);
			} else {
				_resumeAfterBody(result);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
	function _resumeAfterUpdate() {
		if (shouldContinue = test()) {
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
			} else {
				_resumeAfterTest(shouldContinue);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
}

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

// Asynchronously await a promise and pass the result to a finally continuation
function _finallyRethrows(body, finalizer) {
	try {
		var result = body();
	} catch (e) {
		return finalizer(true, e);
	}
	if (result && result.then) {
		return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
	}
	return finalizer(false, result);
}

/**
 * 限制并发请求数量的 fetch 封装
 * @class FetchLimiting
 * @example
 * const fetchLimiting = new FetchLimiting()
 * fetchLimiting._fetch('/')
 *   .then(res => res.json())
 *   .then(json => console.log(json))
 * @deprecated 已废弃，请使用 {@link asyncLimiting} 函数
 */

var FetchLimiting = /*#__PURE__*/function () {
  /**
   * 构造函数
   * @param option 可选配置项
   * @param option.timeout 超时毫秒数
   * @param option.limit 最大并发数限制
   */
  function FetchLimiting(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === void 0 ? 10000 : _ref$timeout,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 10 : _ref$limit;

    /**
     * @field timeout 超时毫秒数
     */
    this.timeout = timeout;
    /**
     * @field limit 最大并发数限制
     */

    this.limit = limit;
    /**
     * @field execCount 当前正在执行异步的数量
     */

    this.execCount = 0;
    /**
     * @field waitArr 等待的队列
     * @type {Array.<IArguments>}
     */

    this.waitArr = [];
  }
  /**
   * 执行一个请求
   * 如果到达最大并发限制时就进行等待
   * @param input
   * @param init 请求的其他可选项，默认为 undefined
   * @returns 如果超时就提前返回 reject, 否则正常返回 fetch 结果
   */


  var _proto = FetchLimiting.prototype;

  _proto.fetch = /*#__PURE__*/function (_fetch) {
    function fetch(_x, _x2) {
      return _fetch.apply(this, arguments);
    }

    fetch.toString = function () {
      return _fetch.toString();
    };

    return fetch;
  }(function (input, init) {
    try {
      var _this2 = this;

      var _innerFetch = function _innerFetch() {
        try {
          _this2.execCount++;

          var args = _this2.waitArr.shift();

          return Promise.resolve(_finallyRethrows(function () {
            // 这里的 args 实际上就是 arguments 对象，即上面的 url 和 init
            return Promise.resolve(fetchTimeout(fetch(args[0], args[1]), _this2.timeout));
          }, function (_wasThrown, _result) {
            _this2.execCount--;
            if (_wasThrown) throw _result;
            return _result;
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      };

      _this2.waitArr.push([input, init]);

      return Promise.resolve(wait(function () {
        return _this2.execCount < _this2.limit;
      })).then(function () {
        // 尝试启动等待队列
        return _innerFetch();
      });
    } catch (e) {
      return Promise.reject(e);
    }
  });

  return FetchLimiting;
}();

/**
 * 将一个 Iterator 迭代器转换为一个 Array
 * @param iterator Iterator 迭代器
 * @return Iterator 中每一项元素转换而得到的 Array
 * @deprecated 已废弃，请使用 ES6 原生函数 {@see Array.from} 替代
 */
function asIterator(iterator) {
  var arr = [];

  while (true) {
    var next = iterator.next();

    if (next.done) {
      break;
    }

    arr.push(next.value);
  }

  return arr;
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

/**
 * 判断一个对象是否是无效的
 * 无效的值仅包含 null/undefined
 * @param object 任何一个对象
 * @returns 是否无效的值
 */
function isNullOrUndefined(object) {
  return object === undefined || object === null;
}

/**
 * 返回第一个参数的函数
 * 注: 一般可以当作返回参数自身的函数，如果你只关注第一个参数的话
 * @param obj 任何对象
 * @typeparam T 传入参数的类型
 * @typeparam R 返回结果的类型，默认为 T，只是为了兼容该函数当参数被传递时可能出现需要类型不一致的问题
 * @returns 传入的第一个参数
 */
function returnItself(obj) {
  return obj;
}

/**
 * 兼容异步函数的返回值
 * @param res 返回值
 * @param callback 同步/异步结果的回调函数
 * @typeparam T 处理参数的类型，如果是 Promise 类型，则取出其泛型类型
 * @typeparam Param 处理参数具体的类型，如果是 Promise 类型，则指定为原类型
 * @typeparam R 返回值具体的类型，如果是 Promise 类型，则指定为 Promise 类型，否则为原类型
 * @returns 处理后的结果，如果是同步的，则返回结果是同步的，否则为异步的
 */
function compatibleAsync(res, callback) {
  return res instanceof Promise ? res.then(callback) : callback(res);
}

/**
 * 内部使用的函数
 * 注: 如果谓词中包含任意一个异步(返回 Promise)函数,则整个返回结果将变成异步的,否则默认为同步操作.
 * @param fns 谓词数组
 * @param args 谓词应用的参数列表
 * @param condition 临界条件
 * @returns 返回结果
 */

function _inner(fns, args, condition) {
  var fn = fns[0];
  var res = fn.apply(void 0, args);

  function _call(res) {
    if (condition(res)) {
      return res;
    }

    var others = fns.slice(1);

    if (others.length === 0) {
      return res;
    }

    return _inner(others, args, condition);
  }

  return compatibleAsync(res, _call);
}
/**
 * 连接谓词函数
 */


var CombinedPredicate = /*#__PURE__*/function () {
  function CombinedPredicate() {}

  /**
   * 使用 && 进行连接
   * @param fns 连接任意多个谓词
   * @returns 连接后的新谓词
   */
  CombinedPredicate.and = function and() {
    for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _inner(fns, args, function (res) {
        return !res;
      });
    };
  }
  /**
   * 使用 || 进行连接
   * @param fns 连接任意多个谓词
   * @returns 连接后的新谓词
   */
  ;

  CombinedPredicate.or = function or() {
    for (var _len3 = arguments.length, fns = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      fns[_key3] = arguments[_key3];
    }

    return function () {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return _inner(fns, args, function (res) {
        return res;
      });
    };
  }
  /**
   * 对谓词进行取反
   * @param fn 谓词
   * @returns 取反后的谓词
   */
  ;

  CombinedPredicate.not = function not(fn) {
    return new Proxy(fn, {
      apply: function apply(_, _this, args) {
        return compatibleAsync(Reflect.apply(_, this, args), function (res) {
          return !res;
        });
      }
    });
  };

  return CombinedPredicate;
}();
var and = CombinedPredicate.and;
var or = CombinedPredicate.or;
var not = CombinedPredicate.not;

/**
 * 操作类型
 */

var ActionType;

(function (ActionType) {
  ActionType["forEach"] = "forEach";
  ActionType["filter"] = "filter";
  ActionType["map"] = "map";
  ActionType["flatMap"] = "flatMap";
  ActionType["sort"] = "sort";
  ActionType["reduce"] = "reduce";
  ActionType["reduceRight"] = "reduceRight";
  ActionType["findIndex"] = "findIndex";
  ActionType["find"] = "find";
  ActionType["every"] = "every";
  ActionType["some"] = "some";
  ActionType["parallel"] = "parallel";
  ActionType["serial"] = "serial";
})(ActionType || (ActionType = {}));
/**
 * 保存高阶函数传入的异步操作
 * @field 异步操作的类型
 * @field 异步操作
 */


var Action = function Action(type, args) {
  this.type = type;
  this.args = args;
  this.type = type;
  this.args = args;
};

Action.Type = ActionType;
/**
 * 抽象异步数组，实现了一些公共的函数
 */

var InnerBaseAsyncArray = /*#__PURE__*/function () {
  /**
   * 构造函数
   * @param args 数组初始元素
   */
  function InnerBaseAsyncArray(args) {
    if (args === void 0) {
      args = [];
    }

    this._arr = args;
  }
  /**
   * 将整个数组排序
   * @param fn 比较函数
   * @returns 排序后的数组
   */


  var _proto = InnerBaseAsyncArray.prototype;

  _proto.sort = function sort(fn) {
    try {
      var _this2 = this;

      var _sort3 = function _sort3(arr, fn) {
        try {
          var _temp3 = function _temp3() {
            return Promise.resolve(_sort3(left, fn)).then(function (_sort4) {
              var _sort4$concat = _sort4.concat([medianValue]),
                  _concat = _sort4$concat.concat;

              return Promise.resolve(_sort3(right, fn)).then(function (_sort5) {
                return _concat.call(_sort4$concat, _sort5);
              });
            });
          };

          // 边界条件，如果传入数组的值
          if (arr.length <= 1) {
            return Promise.resolve(arr);
          } // 根据中间值对数组分治为两个数组


          var medianIndex = Math.floor(arr.length / 2);
          var medianValue = arr[medianIndex];
          var left = [];
          var right = [];
          var _i = 0,
              _len = arr.length;

          var _temp4 = _for(function () {
            return _i < _len;
          }, function () {
            return _i++;
          }, function () {
            if (_i === medianIndex) {
              return;
            }

            var v = arr[_i];
            return Promise.resolve(fn(v, medianValue)).then(function (_fn) {
              if (_fn <= 0) {
                left.push(v);
              } else {
                right.push(v);
              }
            });
          });

          return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
        } catch (e) {
          return Promise.reject(e);
        }
      };

      if (fn === undefined) {
        return Promise.resolve(new InnerAsyncArray(_this2._arr.sort()));
      } // TODO 此处为了让 type-doc 能生成文档而不得不加上类型


      var arr = _this2._arr.map(function (v, i) {
        return [v, i];
      });

      return Promise.resolve(_sort3(arr, function (_ref, _ref2) {
        var t1 = _ref[0];
        var t2 = _ref2[0];
        return fn(t1, t2);
      })).then(function (_sort2) {
        return Promise.resolve(_sort2.map(function (_ref3) {
          var _v = _ref3[0],
              i = _ref3[1];
          return _this2._arr[i];
        })).then(function (_await$_sort$map) {
          return new InnerAsyncArray(_await$_sort$map);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * 异步的 find
   * @param fn 异步查询函数
   * @returns 查询到的第一个值
   */
  ;

  _proto.find = function find(fn) {
    try {
      var _this4 = this;

      return Promise.resolve(_this4.findIndex(fn)).then(function (i) {
        return i === -1 ? null : _this4._arr[i];
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * 异步的 every
   * @param fn 异步匹配函数
   * @returns 是否全部匹配
   */
  ;

  _proto.every = function every(fn) {
    try {
      var _this6 = this;

      return Promise.resolve(_this6.findIndex(CombinedPredicate.not(fn))).then(function (_this5$findIndex) {
        return _this5$findIndex === -1;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * 异步的 some
   * @param fn 异步匹配函数
   * @returns 是否有任意一个匹配
   */
  ;

  _proto.some = function some(fn) {
    try {
      var _this8 = this;

      return Promise.resolve(_this8.findIndex(fn)).then(function (_this7$findIndex) {
        return _this7$findIndex !== -1;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * 转换为并发异步数组
   */
  ;

  _proto.parallel = function parallel() {
    return new InnerAsyncArrayParallel(this._arr);
  }
  /**
   * 转换为顺序异步数组
   */
  ;

  _proto.serial = function serial() {
    return new InnerAsyncArray(this._arr);
  }
  /**
   * 获取内部数组的值，将返回一个浅复制的数组
   */
  ;

  _proto.value = function value() {
    return this._arr.slice();
  };

  return InnerBaseAsyncArray;
}();
/**
 * 串行的异步数组
 */


var InnerAsyncArray = /*#__PURE__*/function (_InnerBaseAsyncArray) {
  _inheritsLoose(InnerAsyncArray, _InnerBaseAsyncArray);

  function InnerAsyncArray() {
    return _InnerBaseAsyncArray.apply(this, arguments) || this;
  }

  var _proto2 = InnerAsyncArray.prototype;

  _proto2.forEach = function forEach(fn) {
    try {
      var _this10 = this;

      var _i2 = 0,
          _len2 = _this10._arr.length;

      var _temp6 = _for(function () {
        return _i2 < _len2;
      }, function () {
        return _i2++;
      }, function () {
        return Promise.resolve(fn.call(_this10, _this10._arr[_i2], _i2, _this10)).then(function () {});
      });

      return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.filter = function filter(fn) {
    try {
      var _this12 = this;

      var res = new InnerAsyncArray();
      var _i3 = 0,
          _len3 = _this12._arr.length;

      var _temp8 = _for(function () {
        return _i3 < _len3;
      }, function () {
        return _i3++;
      }, function () {
        return Promise.resolve(fn.call(_this12, _this12._arr[_i3], _i3, _this12)).then(function (_fn$call) {
          if (_fn$call) {
            res._arr.push(_this12._arr[_i3]);
          }
        });
      });

      return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function () {
        return res;
      }) : res);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.map = function map(fn) {
    try {
      var _this14 = this;

      var res = new InnerAsyncArray();
      var _i4 = 0,
          _len4 = _this14._arr.length;

      var _temp10 = _for(function () {
        return _i4 < _len4;
      }, function () {
        return _i4++;
      }, function () {
        var _res$_arr = res._arr,
            _push = _res$_arr.push;
        return Promise.resolve(fn.call(_this14, _this14._arr[_i4], _i4, _this14)).then(function (_fn$call2) {
          _push.call(_res$_arr, _fn$call2);
        });
      });

      return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {
        return res;
      }) : res);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.flatMap = function flatMap(fn) {
    try {
      var _this16 = this;

      var res = new InnerAsyncArray();
      var _i5 = 0,
          _len5 = _this16._arr.length;

      var _temp12 = _for(function () {
        return _i5 < _len5;
      }, function () {
        return _i5++;
      }, function () {
        var _res$_arr2 = res._arr,
            _push2 = _res$_arr2.push;
        return Promise.resolve(fn.call(_this16, _this16._arr[_i5], _i5, _this16)).then(function (_fn$call3) {
          _push2.call.apply(_push2, [_res$_arr2].concat(_fn$call3));
        });
      });

      return Promise.resolve(_temp12 && _temp12.then ? _temp12.then(function () {
        return res;
      }) : res);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.reduce = function reduce(fn, res) {
    try {
      var _this18 = this;

      var _i6 = 0,
          _len6 = _this18._arr.length;

      var _temp15 = _for(function () {
        return _i6 < _len6;
      }, function () {
        return _i6++;
      }, function () {
        var _temp13 = function () {
          if (res) {
            return Promise.resolve(fn.call(_this18, res, _this18._arr[_i6], _i6, _this18)).then(function (_fn$call4) {
              res = _fn$call4;
            });
          } else {
            res = _this18._arr[_i6];
          }
        }();

        if (_temp13 && _temp13.then) return _temp13.then(function () {});
      });

      return Promise.resolve(_temp15 && _temp15.then ? _temp15.then(function () {
        return res;
      }) : res);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.reduceRight = function reduceRight(fn, res) {
    try {
      var _this20 = this;

      var _i7 = _this20._arr.length - 1;

      var _temp18 = _for(function () {
        return _i7 >= 0;
      }, function () {
        return _i7--;
      }, function () {
        var _temp16 = function () {
          if (res) {
            return Promise.resolve(fn.apply(_this20, [res, _this20._arr[_i7], _i7, _this20])).then(function (_fn$apply) {
              res = _fn$apply;
            });
          } else {
            res = _this20._arr[_i7];
          }
        }();

        if (_temp16 && _temp16.then) return _temp16.then(function () {});
      });

      return Promise.resolve(_temp18 && _temp18.then ? _temp18.then(function () {
        return res;
      }) : res);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.findIndex = function findIndex(fn) {
    try {
      var _temp21 = function _temp21(_result) {
        return _exit2 ? _result : -1;
      };

      var _exit2 = false;

      var _this22 = this;

      var _i8 = 0,
          _len7 = _this22._arr.length;

      var _temp22 = _for(function () {
        return !_exit2 && _i8 < _len7;
      }, function () {
        return _i8++;
      }, function () {
        return Promise.resolve(fn.call(_this22, _this22._arr[_i8], _i8, _this22)).then(function (res) {
          if (res) {
            _exit2 = true;
            return _i8;
          }
        });
      });

      return Promise.resolve(_temp22 && _temp22.then ? _temp22.then(_temp21) : _temp21(_temp22));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return InnerAsyncArray;
}(InnerBaseAsyncArray);
/**
 * 并发的异步数组
 */


var InnerAsyncArrayParallel = /*#__PURE__*/function (_InnerBaseAsyncArray2) {
  _inheritsLoose(InnerAsyncArrayParallel, _InnerBaseAsyncArray2);

  function InnerAsyncArrayParallel() {
    return _InnerBaseAsyncArray2.apply(this, arguments) || this;
  }

  var _proto3 = InnerAsyncArrayParallel.prototype;

  _proto3.forEach = function forEach(fn) {
    try {
      var _this24 = this;

      return Promise.resolve(_this24._all(fn)).then(function () {});
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto3.filter = function filter(fn) {
    try {
      var _this26 = this;

      return Promise.resolve(_this26._all(fn)).then(function (res) {
        var result = new InnerAsyncArrayParallel();

        for (var _i9 = 0, _len8 = res.length; _i9 < _len8; _i9++) {
          if (res[_i9]) {
            result._arr.push(_this26._arr[_i9]);
          }
        }

        return result;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto3.map = function map(fn) {
    try {
      var _this28 = this;

      return Promise.resolve(_this28._all(fn)).then(function (_this27$_all) {
        return new InnerAsyncArrayParallel(_this27$_all);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto3.flatMap = function flatMap(fn) {
    try {
      var _this30 = this;

      return Promise.resolve(_this30._all(fn)).then(function (res) {
        return new InnerAsyncArrayParallel(res.flat());
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto3.sort = function sort(fn) {
    throw new Error('Method not implemented.');
  };

  _proto3.reduce = function reduce(fn, res) {
    try {
      var _this32 = this;

      var _i10 = 0,
          _len9 = _this32._arr.length;

      var _temp25 = _for(function () {
        return _i10 < _len9;
      }, function () {
        return _i10++;
      }, function () {
        var _temp23 = function () {
          if (res) {
            return Promise.resolve(fn.call(_this32, res, _this32._arr[_i10], _i10, _this32)).then(function (_fn$call5) {
              res = _fn$call5;
            });
          } else {
            res = _this32._arr[_i10];
          }
        }();

        if (_temp23 && _temp23.then) return _temp23.then(function () {});
      });

      return Promise.resolve(_temp25 && _temp25.then ? _temp25.then(function () {
        return res;
      }) : res);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto3.reduceRight = function reduceRight(fn, res) {
    try {
      var _this34 = this;

      var _i11 = _this34._arr.length - 1;

      var _temp28 = _for(function () {
        return _i11 >= 0;
      }, function () {
        return _i11--;
      }, function () {
        var _temp26 = function () {
          if (res) {
            return Promise.resolve(fn.apply(_this34, [res, _this34._arr[_i11], _i11, _this34])).then(function (_fn$apply2) {
              res = _fn$apply2;
            });
          } else {
            res = _this34._arr[_i11];
          }
        }();

        if (_temp26 && _temp26.then) return _temp26.then(function () {});
      });

      return Promise.resolve(_temp28 && _temp28.then ? _temp28.then(function () {
        return res;
      }) : res);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto3.findIndex = function findIndex(fn) {
    try {
      var _this36 = this;

      return Promise.resolve(_this36._all(fn)).then(function (_this35$_all) {
        return _this35$_all.findIndex(returnItself);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto3._all = function _all(fn) {
    try {
      var _this38 = this;

      return Promise.resolve(Promise.all(_this38._arr.map(function (v, i) {
        return fn.apply(_this38, [v, i, _this38]);
      })));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return InnerAsyncArrayParallel;
}(InnerBaseAsyncArray);
/**
 * 异步数组
 */


var AsyncArray = /*#__PURE__*/function () {
  /**
   * 构造函数
   * @param args 任意个参数
   */
  function AsyncArray() {
    /**
     * 内部数组的长度，用于让 {@link AsyncArray} 的实例能作为 {@link Array.from} 的参数
     */
    this.length = 0;

    for (var _len10 = arguments.length, args = new Array(_len10), _key = 0; _key < _len10; _key++) {
      args[_key] = arguments[_key];
    }

    this._arr = Array.from(args);
    /**
     * @field 保存异步任务
     * @type {Action[]}
     */

    this._tasks = [];
  }
  /**
   * 为内置数组赋值
   * 此处自动重新计算 length 属性
   */


  /**
   * 提供一个函数方便根据已有的数组或类数组（Set/Map）创建 {@link AsyncArray}
   * @param arr 一个可迭代元素
   * @returns 创建一个新的异步数组包装
   */
  AsyncArray.from = function from(arr) {
    var result = new AsyncArray();

    if (isNullOrUndefined(arr)) {
      return result;
    }

    result._arr = Array.from(arr);
    return result;
  };

  var _proto4 = AsyncArray.prototype;

  _proto4.filter = function filter(fn) {
    return this._addTask(new Action(Action.Type.filter, [fn]));
  };

  _proto4.map = function map(fn) {
    return this._addTask(new Action(Action.Type.map, [fn]));
  };

  _proto4.flatMap = function flatMap(fn) {
    return this._addTask(new Action(Action.Type.flatMap, [fn]));
  };

  _proto4.sort = function sort(fn) {
    return this._addTask(new Action(Action.Type.sort, [fn]));
  };

  _proto4.parallel = function parallel() {
    return this._addTask(new Action(Action.Type.parallel, []));
  };

  _proto4.serial = function serial() {
    return this._addTask(new Action(Action.Type.serial, []));
  };

  _proto4.forEach = function forEach(fn) {
    return this._addTask(new Action(Action.Type.forEach, [fn])).then();
  };

  _proto4.some = function some(fn) {
    return this._addTask(new Action(Action.Type.some, [fn])).then();
  };

  _proto4.every = function every(fn) {
    return this._addTask(new Action(Action.Type.every, [fn])).then();
  };

  _proto4.find = function find(fn) {
    return this._addTask(new Action(Action.Type.find, [fn])).then();
  };

  _proto4.findIndex = function findIndex(fn) {
    return this._addTask(new Action(Action.Type.findIndex, [fn])).then();
  };

  _proto4.reduce = function reduce(fn, res) {
    return this._addTask(new Action(Action.Type.reduce, [fn, res])).then();
  };

  _proto4.reduceRight = function reduceRight(fn, res) {
    return this._addTask(new Action(Action.Type.reduceRight, [fn, res])).then();
  }
  /**
   * 终结整个链式操作并返回结果，可以使用 await 等待当前实例开始计算
   */
  ;

  _proto4.then = function then(onfulfilled, onrejected) {
    try {
      var _exit4 = false;

      var _this40 = this;

      return Promise.resolve(_catch(function () {
        function _temp30(_result2) {
          if (_exit4) return _result2;

          if (!isNullOrUndefined(onfulfilled)) {
            onfulfilled(result);
          }

          return result;
        }

        var asyncArray = new InnerAsyncArray(_this40._arr);
        var result = _this40._arr;

        var _temp29 = _forOf(_this40._tasks, function (task) {
          return Promise.resolve(Reflect.apply(Reflect.get(asyncArray, task.type), asyncArray, task.args)).then(function (_Reflect$apply) {
            asyncArray = _Reflect$apply;

            if (asyncArray instanceof InnerBaseAsyncArray) {
              result = asyncArray.value();
            } else {
              if (!isNullOrUndefined(onfulfilled)) {
                onfulfilled(result);
              }

              _exit4 = true;
              return asyncArray;
            }
          });
        }, function () {
          return _exit4;
        });

        return _temp29 && _temp29.then ? _temp29.then(_temp30) : _temp30(_temp29);
      }, function (err) {
        if (!isNullOrUndefined(onrejected)) {
          onrejected(err);
        }
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * @deprecated 已废弃，请直接使用 await 进行等待获取结果值即可
   */
  ;

  _proto4.value = function value() {
    return this.then();
  }
  /**
   * 允许使用 for-of 遍历内部的 _arr
   */
  ;

  _proto4[Symbol.iterator] =
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var _iterator, _step, kv;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _iterator = _createForOfIteratorHelperLoose(this._arr);

          case 1:
            if ((_step = _iterator()).done) {
              _context.next = 7;
              break;
            }

            kv = _step.value;
            _context.next = 5;
            return kv;

          case 5:
            _context.next = 1;
            break;

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  });

  _proto4._addTask = function _addTask(task) {
    var result = _construct(AsyncArray, this._arr);

    result._tasks = [].concat(this._tasks, [task]);
    return result;
  };

  _createClass(AsyncArray, [{
    key: "_arr",
    set: function set(arr) {
      this.__arr = arr;
      this.length = this.__arr.length;
    },
    get: function get() {
      return this.__arr;
    }
  }]);

  return AsyncArray;
}();

var asyncFlatMap = function asyncFlatMap(arr, fn) {
  try {
    return Promise.resolve(_construct(AsyncArray, arr).flatMap(fn));
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * 判断数字是否在指定区间之中
 * @param num 指定数字
 * @param min 最小值
 * @param max 最大值（不包含）
 */
function isRange(num, min, max) {
  return num >= min && num < max;
}

/**
 * 判断是否为小数的正则表达式
 */

var FloatRule = /^(-?\d+)(.\d+)?$/;
/**
 * 判断是否为整数的正则表达式
 */

var IntegerRule = /^-?\d+$/;
/**
 * 判断是否为邮箱的正则表达式
 */

var EmailRule = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
/**
 * 判断是否为 ipv4 地址的正则表达式
 */

var Ipv4Rule = /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/;
/**
 * 判断是否为固定电话的正则表达式
 */

var TelephoneRule = /^0[1-9][0-9]{1,2}-[2-8][0-9]{6,7}$/;
/**
 * 判断是否为移动电话的正则表达式
 * 注：不在判断二三位的数字，具体参考：http://caibaojian.com/phone-regexp.html
 */

var MobileRule = /^1\d{10}$/;
/**
 * 判断是否为域名的正则表达式
 */

var DomainRule = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
/**
 * 判断是否为邮政编码的正则表达式
 */

var PostcodeRule = /^\d{6}$/;
/**
 * 字符串校验
 * @suppress 之后将会对类型定义进行不兼容修改，避免一直出现的两难问题
 */

var StringValidator = /*#__PURE__*/function () {
  function StringValidator() {}

  /**
   * 判断一个字符串是否为空字符串
   * @param str 字符串
   * @returns 是否为空字符串
   */
  StringValidator.isEmpty = function isEmpty(str) {
    return isNullOrUndefined(str) || str === '';
  }
  /**
   * 判断一个字符串是否为空白的字符串
   * @param str 字符串
   * @returns 是否为空字符串
   */
  ;

  StringValidator.isBlank = function isBlank(str) {
    return StringValidator.isEmpty(str) || str.trim() === '';
  }
  /**
   * 判断字符串是否位小数
   * @param str 需要进行判断的字符串
   * @returns 是否为小数
   */
  ;

  StringValidator.isFloat = function isFloat(str) {
    if (isNullOrUndefined(str)) {
      return false;
    }

    return FloatRule.test(str);
  }
  /**
   * 判断字符串是否位整数
   * @param str 需要进行判断的字符串
   * @returns 是否为小数
   */
  ;

  StringValidator.isInteger = function isInteger(str) {
    return !isNullOrUndefined(str) && IntegerRule.test(str);
  }
  /**
   * 判断邮箱的格式是否正确
   * @param str 邮箱字符串
   * @returns 是否是邮箱
   */
  ;

  StringValidator.isEmail = function isEmail(str) {
    return !isNullOrUndefined(str) && EmailRule.test(str);
  }
  /**
   * 判断 ipv4 地址的格式是否正确
   * @param str ipv4 字符串
   * @returns 是否是 ipv4 地址
   */
  ;

  StringValidator.isIpv4 = function isIpv4(str) {
    return !isNullOrUndefined(str) && Ipv4Rule.test(str);
  }
  /**
   * 判断字符串是否为正确的端口号
   * 正确的端口号是 1-65535
   * @param str 字符串
   * @returns 是否为端口号
   */
  ;

  StringValidator.isPort = function isPort(str) {
    // tslint:disable-next-line:radix
    return StringValidator.isInteger(str) && isRange(parseInt(str), 1, 65535);
  }
  /**
   * 判断是否为固定电话
   * @param str 字符串
   * @returns 是否为固定电话
   */
  ;

  StringValidator.isTelephone = function isTelephone(str) {
    return !isNullOrUndefined(str) && TelephoneRule.test(str);
  }
  /**
   * 判断是否为移动电话
   * @param str 字符串
   * @returns 是否为移动电话
   */
  ;

  StringValidator.isMobile = function isMobile(str) {
    return !isNullOrUndefined(str) && MobileRule.test(str);
  }
  /**
   * 判断是否为域名
   * @param str 字符串
   * @returns 是否为域名
   */
  ;

  StringValidator.isDomain = function isDomain(str) {
    return !isNullOrUndefined(str) && DomainRule.test(str);
  }
  /**
   * 判断是否为邮政编码
   * @param str 字符串
   * @returns 是否为邮政编码
   */
  ;

  StringValidator.isPostcode = function isPostcode(str) {
    return !isNullOrUndefined(str) && PostcodeRule.test(str);
  };

  return StringValidator;
}();
/**
 * 导出一个字符串校验的对象
 * @deprecated 已废弃，请直接使用类的静态函数
 */

var stringValidator = StringValidator;

/**
 * 可能的类型
 */

var Type;

(function (Type) {
  Type[Type["String"] = 0] = "String";
  Type[Type["Number"] = 1] = "Number";
  Type[Type["Boolean"] = 2] = "Boolean";
  Type[Type["Undefined"] = 3] = "Undefined";
  Type[Type["Null"] = 4] = "Null";
  Type[Type["Symbol"] = 5] = "Symbol";
  Type[Type["PropertyKey"] = 6] = "PropertyKey";
  Type[Type["Object"] = 7] = "Object";
  Type[Type["Array"] = 8] = "Array";
  Type[Type["Function"] = 9] = "Function";
  Type[Type["Date"] = 10] = "Date";
  Type[Type["File"] = 11] = "File";
  Type[Type["Blob"] = 12] = "Blob";
  Type[Type["Stream"] = 13] = "Stream";
  Type[Type["ArrayBuffer"] = 14] = "ArrayBuffer";
  Type[Type["ArrayBufferView"] = 15] = "ArrayBufferView";
  Type[Type["URLSearchParams"] = 16] = "URLSearchParams";
  Type[Type["FormData"] = 17] = "FormData";
})(Type || (Type = {}));
/**
 * 校验变量的类型
 */


var TypeValidator = /*#__PURE__*/function () {
  function TypeValidator() {}

  /**
   * 获取变量的类型
   * @param val 变量
   * @returns 类型
   * 注: 此函数依赖于 ts 的编译枚举原理与约定 {@link TypeValidator} 中所有判断函数都是以 `is` 开头并于 {@link Type} 中的保持一致
   */
  TypeValidator.getType = function getType(val) {
    for (var _i = 0, _Object$keys = Object.keys(Type); _i < _Object$keys.length; _i++) {
      var k = _Object$keys[_i];

      if (StringValidator.isInteger(k)) {
        var type = Type[k];

        if (TypeValidator['is' + type](val)) {
          return Type[type];
        }
      }
    }

    throw new Error('无法识别的类型');
  }
  /**
   * 判断是否为指定类型
   * @param val 需要判断的值
   * @param types 需要判断的类型
   */
  ;

  TypeValidator.isType = function isType(val) {
    for (var _len = arguments.length, types = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      types[_key - 1] = arguments[_key];
    }

    return types.includes(TypeValidator.getType(val));
  }
  /**
   * 判断是否为字符串
   * @param val 需要判断的值
   * @returns 是否为字符串
   */
  ;

  TypeValidator.isString = function isString(val) {
    return typeof val === 'string';
  }
  /**
   * 判断是否为数字
   * @param val 需要判断的值
   * @returns 是否为数字
   */
  ;

  TypeValidator.isNumber = function isNumber(val) {
    return typeof val === 'number';
  }
  /**
   * 判断是否为布尔值
   * @param val 需要判断的值
   * @returns 是否为布尔值
   */
  ;

  TypeValidator.isBoolean = function isBoolean(val) {
    return typeof val === 'boolean';
  }
  /**
   * 判断是否为 Symbol
   * @param val 需要判断的值
   * @returns 是否为 Symbol
   */
  ;

  TypeValidator.isSymbol = function isSymbol(val) {
    return typeof val === 'symbol';
  }
  /**
   * 判断是否为 undefined
   * @param val 需要判断的值
   * @returns 是否为 undefined
   */
  ;

  TypeValidator.isUndefined = function isUndefined(val) {
    return val === undefined;
  }
  /**
   * 判断是否为 null
   * @param val 需要判断的值
   * @returns 是否为 null
   */
  ;

  TypeValidator.isNull = function isNull(val) {
    return val === null;
  }
  /**
   * 判断是否可以作为对象的属性
   * @param val 需要判断的值
   * @returns 是否为对象属性
   */
  ;

  TypeValidator.isPropertyKey = function isPropertyKey(val) {
    return TypeValidator.isString(val) || TypeValidator.isNumber(val) || TypeValidator.isSymbol(val);
  }
  /**
   * 判断是否为对象
   * 注: 函数（包括 ES6 箭头函数）将不被视为对象
   * @param val 需要判断的值
   * @returns 是否为对象
   */
  ;

  TypeValidator.isObject = function isObject(val) {
    return !TypeValidator.isNull(val) && !TypeValidator.isUndefined(val) && typeof val === 'object';
  }
  /**
   * 判断是否为数组
   * @param val 需要判断的值
   * @returns 是否为数组
   */
  ;

  TypeValidator.isArray = function isArray(val) {
    return Array.isArray(val);
  }
  /**
   * 判断是否为数组
   * @param val 需要判断的值
   * @returns 是否为数组
   */
  ;

  TypeValidator.isFunction = function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }
  /**
   * 判断是否为日期
   * @param val 需要判断的值
   * @returns 是否为日期
   */
  ;

  TypeValidator.isDate = function isDate(val) {
    return toString.call(val) === '[object Date]';
  }
  /**
   * 判断是否为浏览器文件类型
   * @param val 需要判断的值
   * @returns 是否为浏览器文件类型
   */
  ;

  TypeValidator.isFile = function isFile(val) {
    return toString.call(val) === '[object File]';
  }
  /**
   * 判断是否为浏览器二进制类型
   * @param val 需要判断的值
   * @returns 是否为浏览器二进制类型
   */
  ;

  TypeValidator.isBlob = function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }
  /**
   * 判断是否为浏览器流类型
   * @param val 需要判断的值
   * @returns 是否为浏览器流类型
   */
  ;

  TypeValidator.isStream = function isStream(val) {
    return TypeValidator.isObject(val) && TypeValidator.isFunction(val.pipe);
  }
  /**
   * 判断是否为浏览器 ArrayBuffer 类型
   * @param val 需要判断的值
   * @returns 是否为浏览器 ArrayBuffer 类型
   */
  ;

  TypeValidator.isArrayBuffer = function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }
  /**
   * 判断是否为浏览器 ArrayBufferView 类型
   * @param val 需要判断的值
   * @returns 是否为浏览器 ArrayBufferView 类型
   */
  ;

  TypeValidator.isArrayBufferView = function isArrayBufferView(val) {
    return typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView ? ArrayBuffer.isView(val) : val && val.buffer && val.buffer instanceof ArrayBuffer;
  }
  /**
   * 判断是否为浏览器 URLSearchParams 类型
   * @param val 需要判断的值
   * @returns 是否为浏览器 URLSearchParams 类型
   */
  ;

  TypeValidator.isURLSearchParams = function isURLSearchParams(val) {
    return !TypeValidator.isUndefined(val) && val instanceof URLSearchParams;
  }
  /**
   * 判断是否为浏览器 FormData 类型
   * @param val 需要判断的值
   * @returns 是否为浏览器 FormData 类型
   */
  ;

  TypeValidator.isFormData = function isFormData(val) {
    return !TypeValidator.isUndefined(val) && val instanceof FormData;
  };

  return TypeValidator;
}();
/**
 * 类型枚举类对象
 */

TypeValidator.Type = Type;

/**
 * 安全执行某个函数
 * 支持异步函数
 * @param fn 需要执行的函数
 * @param defaultVal 发生异常后的默认返回值，默认为 null
 * @param args 可选的函数参数
 * @returns 函数执行的结果，或者其默认值
 */
function safeExec(fn, defaultVal) {
  var defRes = defaultVal === undefined ? null : defaultVal;

  try {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    var res = fn.apply(void 0, args);
    return res instanceof Promise ? res["catch"](function () {
      return defRes;
    }) : res;
  } catch (err) {
    return defRes;
  }
}

/**
 * 提取对象中的字段并封装为函数
 * @param k 提取的字段，深度获取使用 . 分割不同的字段
 * @returns 获取对象中指定字段的函数
 */

function extractField(k) {
  var fields = TypeValidator.isString(k) ? k.split('.') : [k];
  return fields.reduceRight(function (fn, field) {
    return function (obj) {
      return safeExec(function () {
        return fn(Reflect.get(obj, field));
      });
    };
  }, returnItself);
}

/**
 * 获取提取对象属性的函数
 * @param k 提取对象属性的函数或者是属性名（允许使用 . 进行分割）
 * @returns 提取对象属性的函数
 */

function getKFn(k) {
  return k instanceof Function ? k : extractField(k);
}

/**
 * 自行实现 flatMap，将数组压平一层
 * @param arr 数组
 * @param k 映射方法，将一个元素映射为一个数组
 * @returns 压平一层的数组
 */

function flatMap(arr, k) {
  if (k === void 0) {
    k = function k(v) {
      return Array.from(v);
    };
  }

  var fn = getKFn(k);
  return arr.reduce(function (res, v, i, arr) {
    res.push.apply(res, fn(v, i, arr));
    return res;
  }, new Array());
}

function groupBy(arr, k,
/**
 * 默认的值处理函数
 * @param res 最终 V 集合
 * @param item 当前迭代的元素
 * @returns 将当前元素合并后的最终 V 集合
 */
vFn, init) {
  if (vFn === void 0) {
    vFn = function vFn(res, item) {
      res.push(item);
      return res;
    };
  }

  if (init === void 0) {
    init = function init() {
      return [];
    };
  }

  var kFn = getKFn(k); // 将元素按照分组条件进行分组得到一个 条件 -> 数组 的对象

  return arr.reduce(function (res, item, index, arr) {
    var k = kFn(item, index, arr); // 如果已经有这个键了就直接追加, 否则先将之初始化再追加元素

    if (!res.has(k)) {
      res.set(k, init());
    }

    res.set(k, vFn(res.get(k), item, index, arr));
    return res;
  }, new Map());
}

/**
 * 创建一个等差数列数组
 * @param start 开始（包含）
 * @param end 结束（不包含）
 * @param sep 步长，默认为 1
 * @returns 等差数列数组
 */
function range(start, end, sep) {
  if (sep === void 0) {
    sep = 1;
  }

  var arr = [];

  for (var i = start; i < end; i += sep) {
    arr.push(i);
  }

  return arr;
}

/**
 * 将数组转化为一个 Object 对象
 * @deprecated 已废弃，请使用更好的 {@link arrayToMap} 替代
 * @param arr 需要进行转换的数组
 * @param k 生成对象属性名的函数
 * @param v 生成对象属性值的函数，默认为数组中的迭代元素
 * @returns 转化得到的对象
 */

function toObject(arr, k, v) {
  if (v === void 0) {
    v = returnItself;
  }

  var kFn = getKFn(k);
  var vFn = getKFn(v);
  return arr.reduce(function (res, item, i, arr) {
    var k = kFn(item, i, arr);

    if (!Reflect.has(res, k)) {
      Reflect.set(res, k, vFn(item, i, arr));
    }

    return res;
  }, {});
}

/**
 * js 的数组去重方法
 * @param arr 要进行去重的数组
 * @param k 唯一标识元素的方法，默认使用 {@link returnItself}
 * @returns 进行去重操作之后得到的新的数组 (原数组并未改变)
 */

function uniqueBy(arr, k) {
  if (k === void 0) {
    k = returnItself;
  }

  var kFn = getKFn(k);
  var set = new Set();
  return arr.filter(function (v) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var k = kFn.apply(void 0, [v].concat(args));

    if (set.has(k)) {
      return false;
    }

    set.add(k);
    return true;
  });
}

/**
 * 将数组映射为 Map
 * @param arr 数组
 * @param k 产生 Map 元素唯一标识的函数，或者对象元素中的一个属性名
 * @param v 产生 Map 值的函数，默认为返回数组的元素，或者对象元素中的一个属性名
 * @returns 映射产生的 map 集合
 */

function arrayToMap(arr, k, v) {
  if (v === void 0) {
    v = returnItself;
  }

  var kFn = getKFn(k);
  var vFn = getKFn(v);
  return arr.reduce(function (res, item, index, arr) {
    return res.set(kFn(item, index, arr), vFn(item, index, arr));
  }, new Map());
}

/**
 * 日期格式化类
 */

var DateFormat =
/**
 * 构造函数
 * @param name 日期格式的名称
 * @param format 日期的格式值
 * @param value 格式化得到的值
 * @param index 需要替换位置的索引
 */
function DateFormat(name, format, value, index) {
  this.name = name;
  this.format = format;
  this.value = value;
  this.index = index;
};
/**
 * 日期时间的正则表达式
 */


var dateFormats = /*#__PURE__*/new Map().set('year', 'Y{4}|Y{2}|y{4}|y{2}').set('month', 'M{1,2}').set('day', 'D{1,2}|d{1,2}').set('hour', 'h{1,2}').set('minute', 'm{1,2}').set('second', 's{1,2}').set('millieSecond', 'S{1,3}');
/**
 * 如果没有格式化某项的话则设置为默认时间
 */

var defaultDateValues = /*#__PURE__*/new Map().set('month', '01').set('day', '01').set('hour', '00').set('minute', '00').set('second', '00').set('millieSecond', '000');
/**
 * 月份日期校验
 */

var monthDayValidate = {
  1: 31,
  3: 31,
  5: 31,
  7: 31,
  8: 31,
  10: 31,
  12: 31,
  4: 30,
  6: 30,
  9: 30,
  11: 30,
  2: 28
};
/**
 * 解析字符串为 Date 对象
 * @param str 日期字符串
 * @param fmt 日期字符串的格式，目前仅支持使用 y(年),M(月),d(日),h(时),m(分),s(秒),S(毫秒)
 * @returns 解析得到的 Date 对象
 */

function dateParse(str, fmt) {
  var now = new Date();
  defaultDateValues.set('year', now.getFullYear().toString()); // 保存对传入的日期字符串进行格式化的全部信息数组列表

  var dateUnits = [];

  for (var _iterator = _createForOfIteratorHelperLoose(dateFormats), _step; !(_step = _iterator()).done;) {
    var _step$value = _step.value,
        fmtName = _step$value[0],
        regex = _step$value[1];
    var regExp = new RegExp(regex);

    if (regExp.test(fmt)) {
      var matchStr = regExp.exec(fmt)[0];
      var regexStr = '`'.repeat(matchStr.length);
      var index = fmt.indexOf(matchStr);
      fmt = fmt.replace(matchStr, regexStr);
      dateUnits.push(new DateFormat(fmtName, '\\d'.repeat(matchStr.length), null, index));
    } else {
      dateUnits.push(new DateFormat(fmtName, null, defaultDateValues.get(fmtName), -1));
    }
  } // 进行验证是否真的是符合传入格式的字符串


  fmt = fmt.replace(new RegExp('`', 'g'), '\\d');

  if (!new RegExp("^" + fmt + "$").test(str)) {
    return null;
  } // 进行一次排序, 依次对字符串进行截取


  dateUnits // 过滤掉没有得到格式化的对象
  .filter(function (_ref) {
    var format = _ref.format;
    return format;
  }) // 按照字符串中日期片段的索引进行排序
  .sort(function (a, b) {
    return a.index - b.index;
  }) // 获取到匹配的日期片段的值
  .map(function (format) {
    var matchDateUnit = new RegExp(format.format).exec(str);

    if (matchDateUnit !== null && matchDateUnit.length > 0) {
      str = str.replace(matchDateUnit[0], '');
      format.value = matchDateUnit[0];
    }

    return format;
  }) // 覆写到 dateStr 上面
  .forEach(function (_ref2, i) {
    var format = _ref2.format;
    var matchDateUnit = new RegExp(format).exec(str);

    if (matchDateUnit !== null && matchDateUnit.length > 0) {
      str = str.replace(matchDateUnit[0], '');
      dateUnits[i].value = matchDateUnit[0];
    }
  }); // 将截取完成的信息封装成对象并格式化标准的日期字符串

  var map = arrayToMap(dateUnits, function (item) {
    return item.name;
  }, function (item) {
    return item.value;
  });

  if (map.get('year').length === 2) {
    map.set('year', defaultDateValues.get('year').substr(0, 2).concat(map.get('year')));
  } // 注意：此处使用的是本地时间而非 UTC 时间


  var get = function get(unit) {
    return parseInt(map.get(unit));
  };

  var year = get('year');
  var month = get('month');
  var day = get('day');
  var hour = get('hour');
  var minute = get('minute');
  var second = get('second');
  var millieSecond = get('millieSecond');

  if (!isRange(month, 1, 12 + 1)) {
    return null;
  }

  if (!isRange(day, 1, Reflect.get(monthDayValidate, month) + (month === 2 && year % 4 === 0 ? 1 : 0) + 1)) {
    return null;
  }

  if (!isRange(hour, 0, 24 + 1) || !isRange(minute, 0, 60 + 1) || !isRange(second, 0, 60 + 1) || !isRange(millieSecond, 0, 999 + 1)) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, second, millieSecond);
}

/**
 * 解析字符串为 Date 对象
 * @deprecated 已弃用，请使用可读性更好的 {@link dateParse} 代替
 * @param dateStr 日期字符串
 * @param fmt 日期字符串的格式
 * 目前仅支持使用 y(年),M(月),d(日),h(时),m(分),s(秒),S(毫秒)
 * @returns 解析得到的 Date 对象
 */

function strToDate(dateStr, fmt) {
  return dateParse(dateStr, fmt);
}

/**
 * 复制一段文本内容
 * @param text 要进行复制的文本
 * @returns 是否复制成功
 */
function copyText(text) {
  var $el = document.createElement('textarea');
  $el.style.position = 'fixed';
  $el.style.top = '-1000px';
  document.body.appendChild($el);
  $el.value = text;
  $el.select();
  var res = document.execCommand('copy');
  document.body.removeChild($el);
  return res;
}

/**
 * 根据 html 字符串创建 Element 元素
 * @param str html 字符串
 * @returns 创建的 Element 元素
 */
function createElByString(str) {
  var root = document.createElement('div');
  root.innerHTML = str;
  return root.querySelector('*');
}

/**
 * 获取输入框中光标所在位置
 * @param  {HTMLFormElement} el 需要获取的输入框元素
 * @returns 光标所在位置的下标
 */
function getCursorPosition(el) {
  return el.selectionStart;
}

/**
 * 获取输入框中光标所在位置
 * @param  {HTMLFormElement} el 需要获取的输入框元素
 * @returns 光标所在位置的下标
 * @deprecated 已废弃，请使用正确更名后的 {@link getCursorPosition} 函数
 */

function getCusorPostion(el) {
  return getCursorPosition(el);
}

/**
 * 设置输入框中选中的文本/光标所在位置
 * @param el 需要设置的输入框元素
 * @param start 光标所在位置的下标
 * @param end 结束位置，默认为输入框结束
 */
function setCursorPosition(el, start, end) {
  if (end === void 0) {
    end = start;
  }

  el.focus();
  el.setSelectionRange(start, end);
}

/**
 * 在指定位置后插入文本
 * @param el 需要设置的输入框元素
 * @param text 要插入的值
 * @param start 开始位置，默认为当前光标处
 */

function insertText(el, text, start) {
  if (start === void 0) {
    start = getCursorPosition(el);
  }

  var value = el.value;
  el.value = value.substr(0, start) + text + value.substr(start);
  setCursorPosition(el, start + text.length);
}

/**
 * 字符串安全的转换为小写
 * @param str 字符串
 * @returns 转换后得到的全小写字符串
 */

function toLowerCase(str) {
  if (isNullOrUndefined(str) || typeof str !== 'string') {
    return str;
  }

  return str.toLowerCase();
}

/**
 * 判断指定元素是否是可编辑元素
 * 注：可编辑元素并不一定能够进行编辑，例如只读的 input 元素
 * @param el 需要进行判断的元素
 * @returns 是否为可编辑元素
 */

function isEditable(el) {
  var inputEls = ['input', 'date', 'datetime', 'select', 'textarea'];
  return (// 此处需要判断是否存在属性 isContentEditable
    // @ts-ignore
    el && (el.isContentEditable || inputEls.includes(toLowerCase(el.tagName)))
  );
}

var lastFocusEl;
/**
 * 获取到最后一个获得焦点的元素
 * @returns 最后一个获取到焦点的元素
 */

function _lastFocus() {
  return lastFocusEl;
}

var lastFocus = /*#__PURE__*/Object.assign(_lastFocus, {
  init: function init() {
    document.addEventListener('focus', function (event) {
      lastFocusEl = event.target;
    }, true);
    document.addEventListener('blur', function () {
      lastFocusEl = null;
    }, true);
  }
});

/**
 * 直接删除指定元素
 * @param el 需要删除的元素
 * @returns 返回被删除的元素
 */
function removeEl(el) {
  var parent = el.parentElement;

  if (parent == null) {
    return null;
  }

  return parent.removeChild(el);
}

/**
 * 在指定范围内删除文本
 * @param el 需要设置的输入框元素
 * @param start 开始位置，默认为当前选中开始位置
 * @param end 结束位置，默认为当前选中结束位置
 */

function removeText(el, start, end) {
  if (start === void 0) {
    start = el.selectionStart;
  }

  if (end === void 0) {
    end = el.selectionEnd;
  }

  // 删除之前必须要 [记住] 当前光标的位置
  var index = getCursorPosition(el);
  var value = el.value;
  el.value = value.substr(0, start) + value.substr(end, value.length);
  setCursorPosition(el, index);
}

/**
 * 设置输入框中选中的文本/光标所在位置
 * @param el 需要设置的输入框元素
 * @param start 光标所在位置的下标
 * @param end 结束位置，默认为输入框结束
 * @deprecated 已废弃，请使用正确更名后的 {@link setCursorPosition} 函数
 */

function setCusorPostion(el, start, end) {
  if (end === void 0) {
    end = start;
  }

  return setCursorPosition(el, start, end);
}

/**
 * 监听 event 的添加/删除，使 DOM 事件是可撤销的
 * 注：必须及早运行，否则无法监听之前添加的事件
 * @deprecated 实际上 {@link EventUtil} 已经更好的实现了这个功能，如果需要则直接修改原型即可，无需使用该函数
 */
function watchEventListener() {
  /**
   * 用来保存监听到的事件信息
   */
  var Event = function Event(el, type, listener, useCapture) {
    this.el = el;
    this.type = type;
    this.listener = listener;
    this.useCapture = useCapture;
  };
  /**
   * 监听所有的 addEventListener, removeEventListener 事件
   */


  var documentAddEventListener = document.addEventListener;
  var eventTargetAddEventListener = EventTarget.prototype.addEventListener;
  var documentRemoveEventListener = document.removeEventListener;
  var eventTargetRemoveEventListener = EventTarget.prototype.removeEventListener;
  var events = [];
  /**
   * 自定义的添加事件监听函数
   * @param type 事件类型
   * @param listener 事件监听函数
   * @param [useCapture] 是否需要捕获事件冒泡，默认为 false
   */

  function addEventListener(type, listener, useCapture) {
    if (useCapture === void 0) {
      useCapture = false;
    }

    var $addEventListener = // @ts-ignore
    this === document ? documentAddEventListener : eventTargetAddEventListener; // @ts-ignore

    events.push(new Event(this, type, listener, useCapture)); // @ts-ignore

    $addEventListener.apply(this, arguments);
  }
  /**
   * 自定义的根据类型删除事件函数
   * 该方法会删除这个类型下面全部的监听函数，不管数量
   * @param type 事件类型
   */


  function removeEventListenerByType(type) {
    var _arguments = arguments,
        _this = this;

    var $removeEventListener = // @ts-ignore
    this === document ? documentRemoveEventListener : eventTargetRemoveEventListener;
    var removeIndexList = events // @ts-ignore
    .map(function (e, i) {
      return e.el === _this || e.type === _arguments[0] ? i : -1;
    }).filter(function (i) {
      return i !== -1;
    });
    removeIndexList.forEach(function (i) {
      var e = events[i];
      $removeEventListener.apply(e.el, [e.type, e.listener, e.useCapture]);
    });
    removeIndexList.sort(function (a, b) {
      return b - a;
    }).forEach(function (i) {
      return events.splice(i, 1);
    });
  }

  document.addEventListener = EventTarget.prototype.addEventListener = addEventListener; // @ts-ignore

  document.removeEventListenerByType = EventTarget.prototype.removeEventListenerByType = removeEventListenerByType;
}

/**
 * 将任意对象转换为 String
 * 主要避免原生 Object toString 遇到某些空值的时候抛异常的问题
 * @param object 任意对象
 * @returns 字符串
 */

function toString$1(object) {
  if (isNullOrUndefined(object)) {
    return '';
  }

  if (object instanceof Date) {
    return object.toISOString();
  }

  return object.toString();
}

/**
 * FormData 批量添加方法
 * 注：该方法不会覆盖掉原本的属性
 * @param fd FormData 对象
 * @param obj 键值对对象
 * @returns 添加完成后的 FormData 对象
 */

function appends(fd, obj) {
  for (var k in obj) {
    var v = obj[k];
    fd.append(k, toString$1(v));
  }

  return fd;
}

/**
 * FormData 批量删除方法
 * @param fd FormData 对象
 * @param keys  删除的 key 列表
 * @returns 返回删除后的 FormData 对象
 */
function deletes(fd, keys) {
  keys.forEach(function (key) {
    return fd["delete"](key);
  });
  return fd;
}

/**
 * FormData 批量设置方法
 * 注：该方法会覆盖掉原本的属性
 * @param fd 表单对象
 * @param obj 键值对对象
 * @returns 设置完成后的 FormData 对象
 */
function sets(fd, obj) {
  for (var k in obj) {
    fd.set(k, obj[k]);
  }

  return fd;
}

/**
 * FormData 转换为包含所有键值数组的二维数组函数
 *
 * @param fd 需要转换的 FormData 对象
 * @returns 转换后的数组
 * @deprecated 已被原生函数 Array.from 取代
 */
function formDataToArray(fd) {
  // @ts-ignore
  return Array.from(fd);
}

/**
 * 将参数对象转换为 FormData，只转换一层
 * @param data 参数对象
 * @return {FormData} 转换后的表单对象
 */
function objToFormData(data) {
  return Object.entries(data).reduce(function (res, _ref) {
    var k = _ref[0],
        v = _ref[1];

    if (v instanceof Blob) {
      res.append(k, v);
    } else {
      res.append(k, v && v.toString());
    }

    return res;
  }, new FormData());
}

/**
 * 函数去抖
 * 去抖 (debounce) 去抖就是对于一定时间段的连续的函数调用，只让其执行一次
 * 注: 包装后的函数如果两次操作间隔小于 delay 则不会被执行, 如果一直在操作就会一直不执行, 直到操作停止的时间大于 delay 最小间隔时间才会执行一次, 不管任何时间调用都需要停止操作等待最小延迟时间
 * 应用场景主要在那些连续的操作, 例如页面滚动监听, 包装后的函数只会执行最后一次
 * 注: 该函数第一次调用一定不会执行，第一次一定拿不到缓存值，后面的连续调用都会拿到上一次的缓存值。如果需要在第一次调用获取到的缓存值，则需要传入第三个参数 {@param init}，默认为 {@code undefined} 的可选参数
 * 注: 返回函数结果的高阶函数需要使用 {@see Proxy} 实现，以避免原函数原型链上的信息丢失
 *
 * @param delay 最小延迟时间，单位为 ms
 * @param action 真正需要执行的操作
 * @param init 初始的缓存值，不填默认为 {@see undefined}
 * @return 包装后有去抖功能的函数。该函数是异步的，与需要包装的函数 {@see action} 是否异步没有太大关联
 */
function debounce(delay, action, init) {
  if (init === void 0) {
    init = null;
  }

  var flag;
  var result = init;
  return new Proxy(action, {
    apply: function apply(_, _this, args) {
      return new Promise(function (resolve) {
        if (flag) clearTimeout(flag);
        flag = setTimeout(function () {
          return resolve(result = Reflect.apply(_, _this, args));
        }, delay);
        setTimeout(function () {
          return resolve(result);
        }, delay);
      });
    }
  });
}

/**
 * 使用 Proxy 实现通用的单例模式
 * @param clazz 需要包装为单例的类型
 * @returns 包装后的单例模式类，使用 {@code new} 创建将只在第一次有效
 */
function singleModel(clazz) {
  var instance;
  return new Proxy(clazz, {
    construct: function construct(target, args, newTarget) {
      if (instance === undefined) {
        instance = Reflect.construct(target, args, newTarget);
      }

      return instance;
    }
  });
}

/**
 * 状态机
 * 用于避免使用 if-else 的一种方式
 * @typeparam K 状态的类型，默认为 any
 * @typeparam V 构造函数返回值的类型，一般为实现子类的基类，默认为 any
 * @deprecated 该类将在下个大版本进行重构，使用函数而非类作为基本单元
 */
var StateMachine = /*#__PURE__*/function () {
  function StateMachine() {
    this.classMap = new Map();
  }
  /**
   * 获取到一个状态工厂
   * @deprecated 已废弃，请直接创建一个 StateMachine 实例
   */


  StateMachine.getFactory = function getFactory() {
    /**
     * 状态注册器
     * 更好的有限状态机，分离子类与构建的关系，无论子类如何增删该都不影响基类及工厂类
     */
    return new StateMachine();
  }
  /**
   * 注册一个 class，创建子类时调用，用于记录每一个 [状态 => 子类] 对应
   * 注: 此处不再默认使用单例模式，如果需要，请自行对 class 进行包装
   * @param state 作为键的状态
   * @param clazz 对应的子类型
   * @returns 返回 clazz 本身
   */
  ;

  var _proto = StateMachine.prototype;

  _proto.register = function register(state, clazz) {
    this.classMap.set(state, clazz);
    return clazz;
  }
  /**
   * 获取一个标签子类对象
   * @param state 状态索引
   * @param args 构造函数的参数
   * @returns 子类对象
   */
  ;

  _proto.getInstance = function getInstance(state) {
    var Class = this.classMap.get(state);

    if (!Class) {
      return null;
    } // 构造函数的参数


    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return _construct(Class, args);
  }
  /**
   * 允许使用 for-of 遍历整个状态机
   */
  ;

  _proto[Symbol.iterator] =
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var _iterator, _step, kv;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _iterator = _createForOfIteratorHelperLoose(this.classMap.entries());

          case 1:
            if ((_step = _iterator()).done) {
              _context.next = 7;
              break;
            }

            kv = _step.value;
            _context.next = 5;
            return kv;

          case 5:
            _context.next = 1;
            break;

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  });
  return StateMachine;
}();

/**
 * 函数节流
 * 节流 (throttle) 让一个函数不要执行的太频繁，减少执行过快的调用，叫节流
 * 类似于上面而又不同于上面的函数去抖, 包装后函数在上一次操作执行过去了最小间隔时间后会直接执行, 否则会忽略该次操作
 * 与上面函数去抖的明显区别在连续操作时会按照最小间隔时间循环执行操作, 而非仅执行最后一次操作
 * 注: 该函数第一次调用一定会执行，不需要担心第一次拿不到缓存值，后面的连续调用都会拿到上一次的缓存值
 * 注: 返回函数结果的高阶函数需要使用 {@see Proxy} 实现，以避免原函数原型链上的信息丢失
 *
 * @param delay 最小间隔时间，单位为 ms
 * @param action 真正需要执行的操作
 * @return {Function} 包装后有节流功能的函数。该函数是异步的，与需要包装的函数 {@link action} 是否异步没有太大关联
 */
function throttle(delay, action) {
  var last = 0;
  var result;
  return new Proxy(action, {
    apply: function apply(target, thisArg, args) {
      return new Promise(function (resolve) {
        var curr = Date.now();

        if (curr - last > delay) {
          result = Reflect.apply(target, thisArg, args);
          last = curr;
          resolve(result);
          return;
        }

        resolve(result);
      });
    }
  });
}

/**
 * 测试函数的执行时间
 * 注：如果函数返回 Promise，则该函数也会返回 Promise，否则直接返回执行时间
 * @param fn 需要测试的函数
 * @returns 执行的毫秒数
 */

function timing(fn) {
  var begin = performance.now();
  var res = fn();
  return compatibleAsync(res, function () {
    return performance.now() - begin;
  });
}

/**
 * 轮询等待指定资源加载完毕再执行操作
 * 使用 Promises 实现，可以使用 ES7 的 {@see async} 和 {@see await} 调用
 * @param fn 判断必须的资源是否存在的方法
 * @param option 可配置项
 * @returns Promise 对象
 */
function waitResource(fn, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$interval = _ref.interval,
      interval = _ref$interval === void 0 ? 100 : _ref$interval,
      _ref$max = _ref.max,
      max = _ref$max === void 0 ? 10 : _ref$max;

  var current = 0;
  return new Promise(function (resolve, reject) {
    var timer = setInterval(function () {
      if (fn()) {
        clearInterval(timer);
        resolve();
      }

      current++;

      if (current >= max) {
        clearInterval(timer);
        reject(new Error('waitResource call timeout'));
      }
    }, interval);
  });
}

/**
 * 监视指定函数返回值的变化
 * @param fn 需要监视的函数
 * @param callback 回调函数
 * @param interval 每次检查的间隔时间，默认为 100ms
 * @returns 关闭这个监视函数
 */
function watch(fn, callback, interval) {
  if (interval === void 0) {
    interval = 100;
  }

  var oldVal = fn();
  var timer = setInterval(function () {
    var newVal = fn();

    if (oldVal !== newVal) {
      callback(newVal, oldVal);
      oldVal = newVal;
    }
  }, interval);
  return function () {
    return clearInterval(timer);
  };
}

/**
 * 深度监听指定对象属性的变化
 * 注：指定对象不能是原始类型，即不可变类型，而且对象本身的引用不能改变，最好使用 const 进行声明
 * @param object 需要监视的对象
 * @param callback 当代理对象发生改变时的回调函数，回调函数有三个参数，分别是对象，修改的 key，修改的 v
 * @returns 返回源对象的一个代理
 */
function watchObject(object, callback) {
  var handler = {
    get: function get(target, k) {
      try {
        // 注意: 这里很关键，它为对象的字段也添加了代理
        return new Proxy(Reflect.get(target, k), handler);
      } catch (err) {
        return Reflect.get(target, k);
      }
    },
    set: function set(target, k, v) {
      callback(target, k, v);
      return Reflect.set(target, k, v);
    }
  };
  return new Proxy(object, handler);
}

/**
 * 填充字符串到指定长度
 * @param item 填充的字符串
 * @param len 填充的长度
 * @returns 填充完成的字符串
 * @deprecated 已废弃，请使用 ES6 {@link String.prototype.repeat} 函数
 * 具体请参考 MDN {@url(https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/repeat)}
 */
function fill(item, len) {
  if (len <= 0) {
    return '';
  }

  return item + fill(item, len - 1);
}

/**
 * 字符串格式化
 *
 * @param str 要进行格式化的值
 * @param args 格式化参数值，替换字符串中的 {} 的值
 * @returns 替换完成的字符串
 * @deprecated 已废弃，请使用 ES6 模板字符串 {@url(https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/template_strings)}
 */

function format(str, args) {
  return Object.keys(args).reduce(function (res, k) {
    return res.replace(new RegExp("{" + k + "}", 'g'), toString$1(args[k]));
  }, str);
}

/**
 * 判断字符串是否位小数
 * @param str 需要进行判断的字符串
 * @returns 是否为小数
 * @deprecated 已废弃，请使用 {@link stringValidator#isFloat}
 */

function isFloat(str) {
  return stringValidator.isFloat(str);
}

/**
 * 判断字符串是否位整数
 * @param str 需要进行判断的字符串
 * @returns 是否为小数
 * @deprecated 已废弃，请使用 {@link stringValidator#isInteger}
 */

function isNumber(str) {
  return stringValidator.isInteger(str);
}

/**
 * 字符串安全的转换为大写
 * @param str 字符串
 * @returns 转换后得到的全大写字符串
 */

function toUpperCase(str) {
  if (isNullOrUndefined(str) || typeof str !== 'string') {
    return str;
  }

  return str.toUpperCase();
}

/**
 * 将空白字符串转换为 null
 *
 * @param str 将空字符串转换为 {@code null}
 * @returns 可能为 {@code null}
 */

function blankToNull(str) {
  return StringValidator.isBlank(str) ? null : str;
}

/**
 * 置空对象所有空白的属性
 * @param obj 对象
 * @returns 将所有的空白属性全部转换为 null 的新对象
 */

function blankToNullField(obj) {
  return Object.keys(obj).reduce(function (res, k) {
    var v = Reflect.get(obj, k);
    Reflect.set(res, k, typeof v === 'string' ? blankToNull(v) : v);
    return res;
  }, {});
}

/**
 * 将对象的所有属性置空
 * @param obj 需要置空属性的对象
 * @returns 返回一个新的对象
 */
function emptyAllField(obj) {
  return Object.keys(obj).reduce(function (res, k) {
    Reflect.set(res, k, null);
    return res;
  }, {});
}

/**
 * 排除对象中的指定字段
 * 注: 此处将获得一个浅拷贝对象
 * @param obj 排除对象
 * @param fields 要排除的多个字段
 * @returns 排除完指定字段得到的新的对象
 */
function excludeFields(obj) {
  for (var _len = arguments.length, fields = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    fields[_key - 1] = arguments[_key];
  }

  var set = new Set(fields);
  return Object.keys(obj).reduce(function (res, k) {
    if (!set.has(k)) {
      Reflect.set(res, k, Reflect.get(obj, k));
    }

    return res;
  }, {});
}

/**
 * 将 Map 转换为 Object 对象
 * @param map Map 键值表
 * @returns 转换得到的 Object 对象
 */
function mapToObject(map) {
  var res = {};

  for (var _iterator = _createForOfIteratorHelperLoose(map), _step; !(_step = _iterator()).done;) {
    var _step$value = _step.value,
        k = _step$value[0],
        v = _step$value[1];
    Reflect.set(res, k, v);
  }

  return res;
}

function randomInt(num1, num2) {
  var min = num2 ? num1 : 0;
  var max = num2 ? num2 : num1;

  if (max <= 0) {
    throw new Error('最大值不能为 0');
  }

  return min + Math.floor(Math.random() * (max - min));
}

/**
 * 计算月有多少天
 * @param date 日期
 * @returns 月的总天数
 */

function calcMonEndDay(date) {
  var monthToDay = [[new Set([1, 3, 5, 7, 8, 10, 12]), 30], [new Set([4, 6, 9, 11]), 30], [new Set([2]), 28]];
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var days = monthToDay.find(function (_ref) {
    var monthSet = _ref[0];
    return monthSet.has(month);
  })[1];
  return days + (month === 2 && year % 4 === 0 ? 1 : 0);
}
/**
 * 日期固定时间点
 */


var DateConstants = /*#__PURE__*/function () {
  function DateConstants() {}

  /**
   * 获取指定日期一天的开始时间
   * @param date 指定的时间，默认为当前日期
   * @returns 一天的开始时间
   */
  DateConstants.dayStart = function dayStart(date) {
    if (date === void 0) {
      date = new Date();
    }

    return new Date(dateFormat(date, 'yyyy-MM-dd') + "T00:00:00.000");
  }
  /**
   * 获取指定日期一天的结束时间
   * @param date 指定的时间，默认为当前日期
   * @returns 一天的结束时间
   */
  ;

  DateConstants.dayEnd = function dayEnd(date) {
    if (date === void 0) {
      date = new Date();
    }

    return new Date(dateFormat(date, 'yyyy-MM-dd') + "T23:59:59.999");
  }
  /**
   * 获取指定日期所在月的开始时间
   * @param date 指定的时间，默认为当前日期
   * @returns 月的开始时间
   */
  ;

  DateConstants.monthStart = function monthStart(date) {
    if (date === void 0) {
      date = new Date();
    }

    return new Date(dateFormat(date, 'yyyy-MM') + "-01T00:00:00.000");
  }
  /**
   * 获取指定日期所在月的结束时间
   * @param date 指定的时间，默认为当前日期
   * @returns 月的结束时间
   */
  ;

  DateConstants.monthEnd = function monthEnd(date) {
    if (date === void 0) {
      date = new Date();
    }

    return new Date(dateFormat(date, 'yyyy-MM') + "-" + calcMonEndDay(date) + "T23:59:59.999");
  }
  /**
   * 获取指定日期所在年份的新年开始时间
   * @param date 指定的时间，默认为当前日期
   * @returns 新年开始时间
   */
  ;

  DateConstants.yearStart = function yearStart(date) {
    if (date === void 0) {
      date = new Date();
    }

    return new Date(date.getFullYear() + "-01-01T00:00:00.000");
  }
  /**
   * 获取指定日期所在年份的旧年结束时间
   * @param date 指定的时间，默认为当前日期
   * @returns 旧年结束时间
   */
  ;

  DateConstants.yearEnd = function yearEnd(date) {
    if (date === void 0) {
      date = new Date();
    }

    return new Date(date.getFullYear() + "-12-31T23:59:59.999");
  };

  return DateConstants;
}();
/**
 * 导出一个日期固定时间点的对象
 * @deprecated 已废弃，请直接使用类的静态函数
 */

var dateConstants = DateConstants;

/**
 * 一天标准的毫秒数
 */

var DAY_UNIT_TIME = 1000 * 60 * 60 * 24;
/**
 * 日期增强
 */

var DateEnhance = /*#__PURE__*/function () {
  /**
   * 构造函数
   * @param date 要增强的日期
   */
  function DateEnhance(date) {
    this.date = date;
  }
  /**
   * 获取到年份
   * @returns
   */


  var _proto = DateEnhance.prototype;

  _proto.year = function year() {
    return this.date.getFullYear();
  }
  /**
   * 获取月份
   * @returns
   * @deprecated 已废弃，请使用 {@link this#monthOfYear} 函数
   */
  ;

  _proto.month = function month() {
    return this.date.getMonth();
  }
  /**
   * 获取今年的第几个月份
   * 和 {@link this#month} 不同的是不再从 0 计算月份
   */
  ;

  _proto.monthOfYear = function monthOfYear() {
    return this.date.getMonth() + 1;
  }
  /**
   * 获取一年内的第多少天
   * 注: 这个天数指定的在第几天而非过去了多少天，例如 2018-01-10 的结果会是 10
   * @returns
   */
  ;

  _proto.dayOfYear = function dayOfYear() {
    return Math.ceil((this.date.getTime() - dateConstants.yearStart(this.date).getTime()) / DAY_UNIT_TIME);
  }
  /**
   * 获取一个月内的第多少天
   * 注: 这个天数指的是在第几天而非过去了多少天，例如 2018-01-10 的结果会是 10
   * @returns
   */
  ;

  _proto.dayOfMonth = function dayOfMonth() {
    return this.date.getDate();
  }
  /**
   * 获取一个星期内的第多少天
   * @returns
   */
  ;

  _proto.dayOfWeek = function dayOfWeek() {
    return this.date.getDay();
  }
  /**
   * 获取一年内的第多少星期
   * 注: 这个星期指定的在第几天而非过去了多少天，例如 2018-01-10 的结果会是 10
   * @returns
   */
  ;

  _proto.weekOfYear = function weekOfYear() {
    return Math.ceil(this.dayOfYear() / 7);
  }
  /**
   * 获取一个月内的第多少星期
   * @returns
   */
  ;

  _proto.weekOfMonth = function weekOfMonth() {
    return Math.ceil(this.dayOfMonth() / 7);
  }
  /**
   * 获取季度
   * @returns
   */
  ;

  _proto.quarter = function quarter() {
    var month = this.month();

    if (isRange(month, 0, 3)) {
      return 1;
    } else if (isRange(month, 3, 6)) {
      return 2;
    } else if (isRange(month, 6, 9)) {
      return 3;
    } else {
      return 4;
    }
  }
  /**
   * 获取小时
   * @returns
   */
  ;

  _proto.hour = function hour() {
    return this.date.getHours();
  }
  /**
   * 获取分钟
   * @returns
   */
  ;

  _proto.minute = function minute() {
    return this.date.getMinutes();
  }
  /**
   * 获取秒
   * @returns
   */
  ;

  _proto.second = function second() {
    return this.date.getSeconds();
  }
  /**
   * 获取毫秒
   * @returns
   */
  ;

  _proto.milliSecond = function milliSecond() {
    return this.date.getMilliseconds();
  };

  return DateEnhance;
}();
/**
 * 获取一个增强的日期
 * @param date 要增强的日期
 * @returns 增强日期
 */

function dateEnhance(date) {
  return new DateEnhance(date);
}

/**
 * 获取一年内的第多少星期
 * @param date 日期
 * @returns 这个日期第多少个星期
 * @deprecated 不推荐使用，请使用 {@see dateEnhance} 代替
 */

function getYearWeek(date) {
  return dateEnhance(date).weekOfYear();
}

/**
 * 时间日期间隔
 */
var DateBetween = /*#__PURE__*/function () {
  /**
   * 构造函数
   * @param start 开始时间
   * @param end 结束时间
   */
  function DateBetween(start, end) {
    this.start = start;
    this.end = end;
  }
  /**
   * 获取毫秒差值
   * @returns 毫秒差值
   */


  var _proto = DateBetween.prototype;

  _proto.milliSecond = function milliSecond() {
    return this.end.getTime() - this.start.getTime();
  }
  /**
   * 获取秒差值
   * @returns 秒差值
   */
  ;

  _proto.second = function second() {
    return Math.floor(this.milliSecond() / 1000);
  }
  /**
   * 获取分钟差值
   * @returns 分钟差值
   */
  ;

  _proto.minute = function minute() {
    return Math.floor(this.second() / 60);
  }
  /**
   * 获取小时差值
   * @returns 小时差值
   */
  ;

  _proto.hour = function hour() {
    return Math.floor(this.minute() / 60);
  }
  /**
   * 获取天数差值
   * @returns 天数差值
   */
  ;

  _proto.day = function day() {
    return Math.floor(this.hour() / 24);
  }
  /**
   * 获取月份差值
   * 注: 此处获取的差值是按月计算的，即 2018-12-31 => 2019-01-01 也被认为相差一个月
   * @returns 月份差值
   */
  ;

  _proto.month = function month() {
    var year = this.year();
    var month = this.end.getMonth() - this.start.getMonth();
    return year * 12 + month;
  }
  /**
   * 获取年份差值
   * 注: 此处获取的差值是按年计算的，即 2018-12-31 => 2019-01-01 也被认为相差一年
   * @returns 年份差值
   */
  ;

  _proto.year = function year() {
    return this.end.getFullYear() - this.start.getFullYear();
  };

  return DateBetween;
}();
/**
 * 获取两个时间的差值
 * @param start 开始时间
 * @param end 结束时间
 * @returns 差值对象
 */

function dateBetween(start, end) {
  return new DateBetween(start, end);
}

/**
 * 返回合理参数本身的函数
 * 1. 如果没有参数则返回 undefined
 * 2. 如果只有一个参数则返回参数本身
 * 3. 如果有两个以上的参数则返回参数列表
 * @param args 任何对象
 * @returns 传入的参数
 * @deprecated 已废弃，貌似没有太多的使用场景
 */
function returnReasonableItself() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var len = args.length;

  if (len === 0) {
    return null;
  }

  if (len === 1) {
    return args[0];
  }

  return args;
}

/**
 * 从数组中移除指定的元素
 * 注: 时间复杂度为 1~3On
 * @param arr 需要被过滤的数组
 * @param deleteItems 要过滤的元素数组
 * @param k 每个元素的唯一键函数
 */

function filterItems(arr, deleteItems, k) {
  if (k === void 0) {
    k = returnItself;
  }

  var kFn = getKFn(k);
  var kSet = new Set(deleteItems.map(kFn));
  return arr.filter(function (v, i, arr) {
    return !kSet.has(kFn(v, i, arr));
  });
}

/**
 * 比较两个数组的差异
 * @param left 第一个数组
 * @param right 第二个数组
 * @param k 每个元素的唯一标识产生函数
 * @returns 比较的差异结果
 */

function diffBy(left, right, k) {
  if (k === void 0) {
    k = returnItself;
  }

  var kFn = getKFn(k); // 首先得到两个 kSet 集合用于过滤

  var kThanSet = new Set(left.map(kFn));
  var kThatSet = new Set(right.map(kFn));
  var leftUnique = left.filter(function (v) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return !kThatSet.has(kFn.apply(void 0, [v].concat(args)));
  });
  var rightUnique = right.filter(function (v) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    return !kThanSet.has(kFn.apply(void 0, [v].concat(args)));
  });
  var kLeftSet = new Set(leftUnique.map(kFn));
  var common = left.filter(function (v) {
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    return !kLeftSet.has(kFn.apply(void 0, [v].concat(args)));
  });
  return {
    left: leftUnique,
    right: rightUnique,
    common: common
  };
}

/**
 * 比较两个数组的差异
 * @deprecated 已废弃，请使用更简洁的 {@link diffBy}
 */

var arrayDiffBy = diffBy;

var _marked = /*#__PURE__*/regeneratorRuntime.mark(autoIncrementGenerator);

/**
 * 使用 Generator 实现一个从 0 开始的无限自增序列
 */
function autoIncrementGenerator() {
  var i;
  return regeneratorRuntime.wrap(function autoIncrementGenerator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          i = 0;

        case 1:
          _context.next = 3;
          return i;

        case 3:
          i++;
          _context.next = 1;
          break;

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}
/**
 * 生成器对象
 */


var generator = /*#__PURE__*/autoIncrementGenerator();
/**
 * 获取自增长序列的最新值
 * @returns 最新值
 */

function autoIncrement() {
  return generator.next().value;
}

/**
 * 转换接口
 * @interface
 */
var IConverter = /*#__PURE__*/function () {
  function IConverter() {}

  var _proto = IConverter.prototype;

  /**
   * 将字符串解析为字符串列表
   *
   * @param str 字符串
   * @return {Array.<String>} 字符串列表
   * @abstract
   */
  _proto.from = function from(str) {
    throw new Error('子类必须重写 from 函数');
  }
  /**
   * 将字符串列表构造为字符串
   *
   * @param list 字符串列表
   * @return {String} 字符串
   * @abstract
   */
  ;

  _proto.to = function to(list) {
    throw new Error('子类必须重写 to 函数');
  };

  return IConverter;
}();

/**
 * 驼峰风格解析
 */

var CamelOrPascalFrom = /*#__PURE__*/function (_IConverter) {
  _inheritsLoose(CamelOrPascalFrom, _IConverter);

  function CamelOrPascalFrom() {
    return _IConverter.apply(this, arguments) || this;
  }

  var _proto = CamelOrPascalFrom.prototype;

  /**
   * 将字符串解析为字符串列表
   *
   * @param str 字符串
   * @return {Array.<String>} 字符串列表
   * @override
   */
  _proto.from = function from(str) {
    var result = [];
    var len = str.length;
    var old = 0;

    for (var i = 0; i < len; i++) {
      var c = str.charAt(i);

      if (c >= 'A' && c <= 'Z') {
        if (i !== 0) {
          result.push(str.substring(old, i));
        }

        old = i;
      }
    }

    if (old !== str.length) {
      result.push(str.substring(old, str.length));
    }

    return result;
  };

  return CamelOrPascalFrom;
}(IConverter);

/**
 * 小写开头的驼峰转换器
 *
 */

var CamelConverter = /*#__PURE__*/function (_CamelOrPascalFrom) {
  _inheritsLoose(CamelConverter, _CamelOrPascalFrom);

  function CamelConverter() {
    return _CamelOrPascalFrom.apply(this, arguments) || this;
  }

  var _proto = CamelConverter.prototype;

  /**
   * 将字符串列表构造为字符串
   *
   * @param list 字符串列表
   * @return {String} 字符串
   * @override
   */
  _proto.to = function to(list) {
    return list.reduce(function (res, s, i) {
      var str = toLowerCase(s);
      return res += (i === 0 ? toLowerCase : toUpperCase)(str.substring(0, 1)) + str.substring(1);
    }, '');
  };

  return CamelConverter;
}(CamelOrPascalFrom);

/**
 * 大写开头的驼峰转换器
 */

var PascalConverter = /*#__PURE__*/function (_CamelOrPascalFrom) {
  _inheritsLoose(PascalConverter, _CamelOrPascalFrom);

  function PascalConverter() {
    return _CamelOrPascalFrom.apply(this, arguments) || this;
  }

  var _proto = PascalConverter.prototype;

  /**
   * 将字符串列表构造为字符串
   *
   * @param list 字符串列表
   * @return {String} 字符串
   * @override
   */
  _proto.to = function to(list) {
    return list.reduce(function (res, s) {
      var str = toLowerCase(s);
      return res += toUpperCase(str.substring(0, 1)) + str.substring(1);
    }, '');
  };

  return PascalConverter;
}(CamelOrPascalFrom);

/**
 * 下划线风格解析
 */

var SnakeOrScreamingSnakeFrom = /*#__PURE__*/function (_IConverter) {
  _inheritsLoose(SnakeOrScreamingSnakeFrom, _IConverter);

  function SnakeOrScreamingSnakeFrom() {
    return _IConverter.apply(this, arguments) || this;
  }

  var _proto = SnakeOrScreamingSnakeFrom.prototype;

  /**
   * 将字符串解析为字符串列表
   *
   * @param str 字符串
   * @return {Array.<String>} 字符串列表
   * @override
   */
  _proto.from = function from(str) {
    return str.split('_');
  };

  return SnakeOrScreamingSnakeFrom;
}(IConverter);

/**
 * 小写下划线的转换器
 */

var SnakeConverter = /*#__PURE__*/function (_SnakeOrScreamingSnak) {
  _inheritsLoose(SnakeConverter, _SnakeOrScreamingSnak);

  function SnakeConverter() {
    return _SnakeOrScreamingSnak.apply(this, arguments) || this;
  }

  var _proto = SnakeConverter.prototype;

  /**
   * 将字符串列表构造为字符串
   *
   * @param list 字符串列表
   * @return {String} 字符串
   * @override
   */
  _proto.to = function to(list) {
    return list.map(toLowerCase).join('_');
  };

  return SnakeConverter;
}(SnakeOrScreamingSnakeFrom);

/**
 * 大写下划线的转换器
 */

var ScreamingSnakeConverter = /*#__PURE__*/function (_SnakeOrScreamingSnak) {
  _inheritsLoose(ScreamingSnakeConverter, _SnakeOrScreamingSnak);

  function ScreamingSnakeConverter() {
    return _SnakeOrScreamingSnak.apply(this, arguments) || this;
  }

  var _proto = ScreamingSnakeConverter.prototype;

  /**
   * 将字符串列表构造为字符串
   *
   * @param list 字符串列表
   * @return {String} 字符串
   * @override
   */
  _proto.to = function to(list) {
    return list.map(toUpperCase).join('_');
  };

  return ScreamingSnakeConverter;
}(SnakeOrScreamingSnakeFrom);

/**
 * @enum {Symbol} 字符串风格常量对象
 */

(function (StringStyleType) {
  /**
   * 小写驼峰
   */
  StringStyleType[StringStyleType["Camel"] = 1] = "Camel";
  /**
   * 大写驼峰
   */

  StringStyleType[StringStyleType["Pascal"] = 2] = "Pascal";
  /**
   * 小写下划线
   */

  StringStyleType[StringStyleType["Snake"] = 3] = "Snake";
  /**
   * 大写下划线
   */

  StringStyleType[StringStyleType["ScreamingSnake"] = 4] = "ScreamingSnake";
})(exports.StringStyleType || (exports.StringStyleType = {}));

/**
 * 转换器工厂
 */

var ConverterFactory = /*#__PURE__*/function () {
  function ConverterFactory() {}

  /**
   * 获取一个转换器实例
   *
   * @param styleType 转换风格，使用了 {@link stringStyleType} 定义的常量对象
   * @return {IConverter} 转换器对象
   * @throws 如果获取未定义过的转换器，则会抛出异常
   */
  ConverterFactory.getInstance = function getInstance(styleType) {
    switch (styleType) {
      case exports.StringStyleType.Camel:
        return new CamelConverter();

      case exports.StringStyleType.Pascal:
        return new PascalConverter();

      case exports.StringStyleType.Snake:
        return new SnakeConverter();

      case exports.StringStyleType.ScreamingSnake:
        return new ScreamingSnakeConverter();

      default:
        throw new Error('No corresponding converter found');
    }
  };

  return ConverterFactory;
}();

/**
 * 字符串风格转换器
 * 请不要直接使用构造函数创建，而是用 {@link StringStyleUtil.getConverter} 来获得一个转换器
 * @private
 */

var StringStyleConverter = /*#__PURE__*/function () {
  /**
   * 构造一个字符串任意风格转换器
   * @param from 转换字符串的风格
   * @param to 需要转换的风格
   * @private
   */
  function StringStyleConverter(from, to) {
    /**
     * @field 解析字符串风格的转换器
     * @type {IConverter}
     * @private
     */
    this.fromConverter = ConverterFactory.getInstance(from);
    /**
     * @field 构造字符串风格的转换器
     * @type {IConverter}
     * @private
     */

    this.toConverter = ConverterFactory.getInstance(to);
  }
  /**
   * 转换字符串的风格
   *
   * @param str 要转换的字符串
   * @return {String} 转换得到的字符串
   */


  var _proto = StringStyleConverter.prototype;

  _proto.convert = function convert(str) {
    if (stringValidator.isEmpty(str)) {
      return str;
    }

    return this.toConverter.to(this.fromConverter.from(str));
  };

  return StringStyleConverter;
}();

/**
 * 基本缓存实现
 * 主要封装通用的 delete/size 函数
 */
var BasicMemoryCache = /*#__PURE__*/function () {
  function BasicMemoryCache(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? Infinity : _ref$limit;

    this.cache = new Map();

    if (limit <= 0) {
      throw new Error('缓存的最大容量至少为 1');
    }

    this.limit = limit;
  }

  var _proto = BasicMemoryCache.prototype;

  _proto["delete"] = function _delete(key) {
    this.cache["delete"](key);
  };

  _proto.clear = function clear() {
    this.cache.clear();
  };

  _createClass(BasicMemoryCache, [{
    key: "size",
    get: function get() {
      return this.cache.size;
    }
  }]);

  return BasicMemoryCache;
}();
/**
 * FIFO 算法
 */


var MemoryCacheFIFO = /*#__PURE__*/function (_BasicMemoryCache) {
  _inheritsLoose(MemoryCacheFIFO, _BasicMemoryCache);

  function MemoryCacheFIFO() {
    return _BasicMemoryCache.apply(this, arguments) || this;
  }

  var _proto2 = MemoryCacheFIFO.prototype;

  _proto2.add = function add(key, val) {
    var _this = this;

    var diff = this.cache.size + 1 - this.limit;

    if (diff > 0) {
      var keys = [].concat(this.cache.keys()).slice(0, diff);
      keys.forEach(function (k) {
        return _this["delete"](k);
      });
    }

    this.cache.set(key, val);
  };

  _proto2["delete"] = function _delete(key) {
    this.cache["delete"](key);
  };

  _proto2.get = function get(key) {
    return this.cache.get(key);
  };

  _proto2.has = function has(key) {
    return this.cache.has(key);
  };

  _createClass(MemoryCacheFIFO, [{
    key: "size",
    get: function get() {
      return this.cache.size;
    }
  }]);

  return MemoryCacheFIFO;
}(BasicMemoryCache);
/**
 * IFU 算法
 */

var MemoryCacheLFU = /*#__PURE__*/function (_BasicMemoryCache2) {
  _inheritsLoose(MemoryCacheLFU, _BasicMemoryCache2);

  function MemoryCacheLFU() {
    var _this2;

    _this2 = _BasicMemoryCache2.apply(this, arguments) || this;
    _this2.lfuMap = new Map();
    return _this2;
  }

  var _proto3 = MemoryCacheLFU.prototype;

  _proto3.add = function add(key, val) {
    var _this3 = this;

    var diff = this.cache.size + 1 - this.limit;

    if (diff > 0) {
      var keys = [].concat(this.cache.keys()).sort(function (k1, k2) {
        return _this3.lfuMap.get(k1) - _this3.lfuMap.get(k2);
      }).slice(0, diff);
      keys.forEach(function (k) {
        return _this3["delete"](k);
      });
    }

    this.cache.set(key, val);
    this.lfuMap.set(key, 0);
  };

  _proto3.get = function get(key) {
    this.lfuMap.set(key, this.lfuMap.get(key) + 1);
    return this.cache.get(key);
  };

  _proto3.has = function has(key) {
    this.lfuMap.set(key, this.lfuMap.get(key) + 1);
    return this.cache.has(key);
  };

  _proto3["delete"] = function _delete(key) {
    _BasicMemoryCache2.prototype["delete"].call(this, key);

    this.lfuMap["delete"](key);
  };

  _proto3.clear = function clear() {
    _BasicMemoryCache2.prototype.clear.call(this);

    this.lfuMap.clear();
  };

  return MemoryCacheLFU;
}(BasicMemoryCache);
/**
 * LRU 算法
 */

var MemoryCacheLRU = /*#__PURE__*/function (_BasicMemoryCache3) {
  _inheritsLoose(MemoryCacheLRU, _BasicMemoryCache3);

  function MemoryCacheLRU() {
    var _this4;

    _this4 = _BasicMemoryCache3.apply(this, arguments) || this;
    _this4.i = 0;
    _this4.lruMap = new Map();
    return _this4;
  }

  var _proto4 = MemoryCacheLRU.prototype;

  _proto4.add = function add(key, val) {
    var _this5 = this;

    var diff = this.cache.size + 1 - this.limit;

    if (diff > 0) {
      var keys = [].concat(this.cache.keys()).sort(function (k1, k2) {
        return _this5.lruMap.get(k1) - _this5.lruMap.get(k2);
      }).slice(0, diff);
      console.log(keys, this.lruMap);
      keys.forEach(function (k) {
        return _this5["delete"](k);
      });
    }

    this.cache.set(key, val);
    this.lruMap.set(key, this.idx);
  };

  _proto4.get = function get(key) {
    this.lruMap.set(key, this.idx);
    return this.cache.get(key);
  };

  _proto4.has = function has(key) {
    this.lruMap.set(key, this.idx);
    return this.cache.has(key);
  };

  _proto4["delete"] = function _delete(key) {
    _BasicMemoryCache3.prototype["delete"].call(this, key);

    this.lruMap["delete"](key);
  };

  _proto4.clear = function clear() {
    _BasicMemoryCache3.prototype.clear.call(this);

    this.lruMap.clear();
  };

  _createClass(MemoryCacheLRU, [{
    key: "idx",
    get: function get() {
      return this.i++;
    }
  }]);

  return MemoryCacheLRU;
}(BasicMemoryCache);

(function (MemoryCacheEnum) {
  //先进先出
  MemoryCacheEnum[MemoryCacheEnum["Fifo"] = 0] = "Fifo"; //最少使用

  MemoryCacheEnum[MemoryCacheEnum["Lfu"] = 1] = "Lfu"; //最近使用

  MemoryCacheEnum[MemoryCacheEnum["Lru"] = 2] = "Lru";
})(exports.MemoryCacheEnum || (exports.MemoryCacheEnum = {}));
/**
 * 缓存工厂类
 */


var MemoryCacheFactory = /*#__PURE__*/function () {
  function MemoryCacheFactory() {}

  MemoryCacheFactory.create = function create(type, config) {
    switch (type) {
      case exports.MemoryCacheEnum.Fifo:
        return new MemoryCacheFIFO(config);

      case exports.MemoryCacheEnum.Lfu:
        return new MemoryCacheLFU(config);

      case exports.MemoryCacheEnum.Lru:
        return new MemoryCacheLRU(config);
    }
  };

  return MemoryCacheFactory;
}();

var onceOfSameParamIdentity = function onceOfSameParamIdentity(fn, args) {
  return "onceOfSameParam-" + fn.toString() + "-" + JSON.stringify(args);
};
/**
 * 包装一个函数为指定参数只执行一次的函数
 * @param fn 需要包装的函数
 * @param identity 参数转换的函数，参数为需要包装函数的参数
 * @param memoryCache
 * @returns 需要被包装的函数
 */


function _onceOfSameParam(fn, identity, memoryCache) {
  if (identity === void 0) {
    identity = onceOfSameParamIdentity;
  }

  if (memoryCache === void 0) {
    memoryCache = MemoryCacheFactory.create(exports.MemoryCacheEnum.Fifo);
  }

  var res = new Proxy(fn, {
    apply: function apply(_, _this, args) {
      var key = identity(fn, args);
      var old = memoryCache.get(key);

      if (old !== undefined) {
        return old;
      }

      var res = Reflect.apply(_, _this, args);
      return compatibleAsync(res, function (res) {
        memoryCache.add(key, res);
        return res;
      });
    }
  });
  return Object.assign(res, {
    origin: fn,
    clear: function clear() {
      for (var _len = arguments.length, keys = new Array(_len), _key = 0; _key < _len; _key++) {
        keys[_key] = arguments[_key];
      }

      if (keys.length) {
        memoryCache.clear();
      } else {
        keys.forEach(function (key) {
          return memoryCache["delete"](key);
        });
      }
    }
  });
}

var onceOfSameParam = /*#__PURE__*/Object.assign(_onceOfSameParam, {
  identity: onceOfSameParamIdentity
});

/**
 * 包装获取字符串风格转换器
 * 此处采用了单例模式，每种转换器只会有一个
 *
 * @param from 解析风格
 * @param to 转换风格
 * @return {StringStyleConverter} 转换器的实例
 */

var _getConverter = /*#__PURE__*/onceOfSameParam(
/**
 * @param from 解析风格
 * @param to 转换风格
 * @return {StringStyleConverter} 转换器的实例
 */
function (from, to) {
  return new StringStyleConverter(from, to);
});
/**
 * 字符串风格转换工具类
 */


var StringStyleUtil = /*#__PURE__*/function () {
  function StringStyleUtil() {}

  /**
   * 获取一个转换器的实例
   * 该函数获取的转换器可以任意复用，请优先使用函数
   * @param from 解析风格
   * @param to 转换风格
   * @return {StringStyleConverter} 转换器的实例
   */
  StringStyleUtil.getConverter = function getConverter(from, to) {
    return _getConverter(from, to);
  }
  /**
   * 直接转换字符串的风格
   * 请优先使用可以复用的 {@link StringStyleUtil.getConverter} 函数
   * @param from 解析风格
   * @param to 转换风格
   * @param str 要转换的字符串
   * @return {String} 转换得到的字符串
   */
  ;

  StringStyleUtil.convert = function convert(from, to, str) {
    return StringStyleUtil.getConverter(from, to).convert(str);
  };

  return StringStyleUtil;
}();

/**
 * 递归使对象不可变
 * @param obj 任何非空对象
 * @returns 新的不可变对象
 */

function deepFreeze(obj) {
  var freeze = function freeze(v) {
    if (TypeValidator.isObject(v)) {
      deepFreeze(v);
    }
  }; // 数组和对象分别处理


  if (TypeValidator.isArray(obj)) {
    obj.forEach(freeze);
  } else if (TypeValidator.isObject(obj)) {
    Object.keys(obj).map(function (k) {
      return Reflect.get(obj, k);
    }).forEach(freeze);
  }

  return Object.freeze(obj);
}

/**
 * 包装对象，使其成为可以任意深度调用而不会出现 undefined 调用的问题
 * 注意: 该函数不能进行递归调用（{@link JSON.stringfy}），一定会造成堆栈溢出的问题（RangeError: Maximum call stack size exceeded）
 * @param obj 任意一个 Object 对象
 * @param [defaultValue] 默认值，默认为 {}
 * @returns 包装后的对象
 */

function deepProxy(obj, defaultValue) {
  if (obj === void 0) {
    obj = {};
  }

  if (defaultValue === void 0) {
    defaultValue = new String();
  }

  var handler = {
    get: function get(target, k) {
      var v = Reflect.get(target, k);

      if (isNullOrUndefined(v)) {
        v = defaultValue;
      }

      if (TypeValidator.isFunction(v)) {
        return v.bind(target);
      }

      if (!TypeValidator.isObject(v)) {
        return v;
      }

      return new Proxy(v, handler);
    }
  };
  return new Proxy(obj, handler);
}

/**
 * 将函数包装为柯里化函数
 * 注: 该函数模仿了 Lodash 的 curry 函数
 * @param fn 需要包装的函数
 * @param  {...any} args 应用的部分参数
 * @returns 包装后的函数
 * @deprecated 由于之前的理解错误，该函数在下个大版本将会被废弃，请使用命名更合适的 {@link partial}
 */
function curry(fn) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var realArgs = args.filter(function (arg) {
    return arg !== curry._;
  }); // 如果函数参数足够则调用传入的函数

  if (realArgs.length >= fn.length) {
    return fn.apply(void 0, realArgs);
  }
  /**
   * 最终返回的函数
   * @param otherArgs 接受任意参数
   * @returns 返回一个函数，或者函数调用完成返回结果
   */


  function innerFn() {
    for (var _len2 = arguments.length, otherArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      otherArgs[_key2] = arguments[_key2];
    }

    // 记录需要移除补到前面的参数
    var removeIndexSet = new Set();
    var i = 0;
    var newArgs = args.map(function (arg) {
      if (arg !== curry._ || otherArgs[i] === undefined || otherArgs[i] === curry._) {
        return arg;
      }

      removeIndexSet.add(i); // 每次补偿前面的 curry._ 参数计数器 +1

      return otherArgs[i++];
    });
    var newOtherArgs = otherArgs.filter(function (_v, i) {
      return !removeIndexSet.has(i);
    });
    return curry.apply(void 0, [fn].concat(newArgs, newOtherArgs));
  } // 定义柯里化函数的剩余参数长度，便于在其他地方进行部分参数应用
  // 注: 不使用 length 属性的原因是 length 属性


  innerFn._length = fn.length - args.filter(function (arg) {
    return arg !== curry._;
  }).length; // 自定义 toString 函数便于调试

  innerFn.toString = function () {
    return "name: " + fn.name + ", args: [" + args.map(function (o) {
      return o.toString();
    }).join(', ') + "]";
  };

  innerFn._curry = true;
  return innerFn;
}
/**
 * 柯里化的占位符，需要应用后面的参数时使用
 * 例如 {@link curry(fn)(curry._, 1)} 意味着函数 fn 的第二个参数将被确定为 1
 */

curry._ = /*#__PURE__*/Symbol('_');

/**
 * 快速根据指定函数对数组进行排序
 * TODO 此处有 bug，会改变原数组的顺序（在计算的 key 值相同的情况下）
 * 注: 使用递归实现，对于超大数组（其实前端的数组不可能特别大吧？#笑）可能造成堆栈溢出
 * @param arr 需要排序的数组
 * @param k 对数组中每个元素都产生可比较的值的函数，默认返回自身进行比较
 * @returns 排序后的新数组
 */

function sortBy(arr, k) {
  if (k === void 0) {
    k = returnItself;
  }

  var kFn = getKFn(k); //  此处为了让 typedoc 能生成文档而不得不加上类型

  var newArr = arr.map(function (v, i) {
    return [v, i];
  });

  function _sort(arr, fn) {
    // 边界条件，如果传入数组的值
    if (arr.length <= 1) {
      return arr;
    } // 根据中间值对数组分治为两个数组


    var medianIndex = Math.floor(arr.length / 2);
    var medianValue = arr[medianIndex];
    var left = [];
    var right = [];

    for (var i = 0, len = arr.length; i < len; i++) {
      if (i === medianIndex) {
        continue;
      }

      var v = arr[i];

      if (fn(v, medianValue) <= 0) {
        left.push(v);
      } else {
        right.push(v);
      }
    }

    return _sort(left, fn).concat([medianValue]).concat(_sort(right, fn));
  }

  return _sort(newArr, function (_ref, _ref2) {
    var t1 = _ref[0],
        i1 = _ref[1];
    var t2 = _ref2[0],
        i2 = _ref2[1];
    var k1 = kFn(t1, i1, arr);
    var k2 = kFn(t2, i2, arr);

    if (k1 === k2) {
      return 0;
    } else if (k1 < k2) {
      return -1;
    } else {
      return 1;
    }
  }).map(function (_ref3) {
    var i = _ref3[1];
    return arr[i];
  });
}

/**
 * 日期格式化器
 * 包含格式化为字符串和解析字符串为日期的函数
 */

var DateFormatter = /*#__PURE__*/function () {
  /**
   * 构造函数
   * @param fmt 日期时间格式
   */
  function DateFormatter(fmt) {
    this.fmt = fmt;
  }
  /**
   * 格式化
   * @param date 需要格式化的日期
   * @returns 格式化的字符串
   */


  var _proto = DateFormatter.prototype;

  _proto.format = function format(date) {
    if (isNullOrUndefined(date)) {
      return '';
    }

    return dateFormat(date, this.fmt);
  }
  /**
   * 解析字符串为日期对象
   * @param str 字符串
   * @returns 解析得到的日期
   */
  ;

  _proto.parse = function parse(str) {
    if (stringValidator.isEmpty(str)) {
      return null;
    }

    return dateParse(str, this.fmt);
  }
  /**
   * 将日期时间字符串转换为前端指定格式的字符串
   * 主要适用场景是前端接收到后端的日期时间一般是一个字符串，然而需要自定义格式的时候还必须先创建 {@link Date} 对象才能格式化，略微繁琐，故使用该函数
   * @param str 字符串
   * @param parseFmt 解析的日期时间格式。默认直接使用 {@link new Date()} 创建
   * @returns 转换后得到的字符串
   */
  ;

  _proto.strFormat = function strFormat(str, parseFmt) {
    if (stringValidator.isEmpty(str)) {
      return '';
    }

    var date = parseFmt ? dateParse(str, parseFmt) : new Date(str);
    return dateFormat(date, this.fmt);
  };

  return DateFormatter;
}();
/**
 * 日期格式化器
 */

DateFormatter.dateFormatter = /*#__PURE__*/new DateFormatter('yyyy-MM-dd');
/**
 * 时间格式化器
 */

DateFormatter.timeFormatter = /*#__PURE__*/new DateFormatter('hh:mm:ss');
/**
 * 日期时间格式化器
 */

DateFormatter.dateTimeFormatter = /*#__PURE__*/new DateFormatter('yyyy-MM-dd hh:mm:ss');

/**
 * 查询符合条件的元素的下标
 * @param arr 查询的数组
 * @param fn 谓词
 * @param num 查询的第几个符合条件的元素，默认为 1，和默认的 findIndex 行为保持一致
 * @returns 符合条件的元素的下标，如果没有则返回 -1
 */
function findIndex(arr, fn, num) {
  if (num === void 0) {
    num = 1;
  }

  var k = 0;

  for (var i = 0, len = arr.length; i < len; i++) {
    if (fn.call(arr, arr[i], i, arr) && ++k >= num) {
      return i;
    }
  }

  return -1;
}

/**
 * 连接两个函数并自动柯里化
 * 注: 该函数依赖于 length，所以不支持默认参数以及不定参数
 * @param fn1 第一个函数
 * @param fn2 第二个函数
 * @returns 连接后的函数
 */

var _compose = function _compose(fn1, fn2) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var i = findIndex(args, function (v) {
      return v !== curry._;
    }, fn1._length || fn1.length);
    var res = curry.apply(void 0, [fn1].concat(args)); // 如果这个函数的参数不足，则返回它

    if (i === -1) {
      return _compose(res, fn2);
    } // 否则将结果以及多余的参数应用到下一个函数上


    return curry.apply(void 0, [fn2, res].concat(args.slice(i + 1)));
  };
};
/**
 * 将多个函数组合起来
 * 前面函数的返回值将变成后面函数的第一个参数，如果到了最后一个函数执行完成，则直接返回
 * 注: 该函数是自动柯里化，将对所有传入的函数进行柯里化处理
 * 注: 该函数支持一次调用传入全部函数的参数
 * @param fns 多个需要连接函数
 * @returns 连接后的柯里化函数
 * TODO 这里需要进行类型优化
 */


function compose() {
  for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fns[_key2] = arguments[_key2];
  }

  return fns.reduceRight(function (fn1, fn2) {
    return _compose(fn2, fn1);
  });
}

/**
 * 递归排除对象中的指定字段
 * @param obj 需要排除的对象
 * @param  {...obj} fields 需要排除的字段
 */

function deepExcludeFields(obj) {
  for (var _len = arguments.length, fields = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    fields[_key - 1] = arguments[_key];
  }

  if (TypeValidator.isArray(obj)) {
    return obj.map(function (o) {
      return deepExcludeFields.apply(void 0, [o].concat(fields));
    });
  } else if (TypeValidator.isDate(obj)) {
    return obj;
  } else if (TypeValidator.isObject(obj)) {
    var temp = excludeFields.apply(void 0, [obj].concat(fields));
    return Object.keys(temp).reduce(function (res, k) {
      var v = Reflect.get(res, k);
      Reflect.set(res, k, deepExcludeFields.apply(void 0, [v].concat(fields)));
      return res;
    }, temp);
  } else {
    return obj;
  }
}

/**
 * 递归排除对象中的指定字段
 * @param obj 需要排除的对象
 * @param  {...obj} fields 需要排除的字段
 * @deprecated 已废弃，请使用统一使用 `deep` 开头的 {@link deepExcludeFields} 函数
 */

function excludeFieldsDeep(obj) {
  for (var _len = arguments.length, fields = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    fields[_key - 1] = arguments[_key];
  }

  return deepExcludeFields.apply(void 0, [obj].concat(fields));
}

/**
 * 缓存的值
 */
var CacheVal =
/**
 * 构造函数
 * @param options 缓存值对象
 * @param options.key 缓存的键原始值
 * @param options.val 缓存的值
 * @param options.cacheOption 缓存的选项
 */
function CacheVal(options) {
  if (options === void 0) {
    options = {};
  }

  Object.assign(this, options);
};

/**
 * 无限的超时时间
 * TODO 此处暂时使用字符串作为一种折衷方法，因为 Symbol 无法被序列化为 JSON，反向序列化也是不可能的
 */
var TimeoutInfinite = 'TimeoutInfinite';

/**
 * 使用 LocalStorage 实现的缓存
 * 1. get: 根据 key 获取
 * 2. set: 根据 key value 设置，会覆盖
 * 3. touch: 获取并刷新超时时间
 * 4. add: 根据 key value 添加，不会覆盖
 * 5. del: 根据 key 删除
 * 6. clearExpired: 清除所有过期的缓存
 */

var LocalStorageCache = /*#__PURE__*/function () {
  /**
   * 构造函数
   * @param cacheOption 全局缓存选项
   */
  function LocalStorageCache(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === void 0 ? TimeoutInfinite : _ref$timeout,
        _ref$serialize = _ref.serialize,
        serialize = _ref$serialize === void 0 ? JSON.stringify : _ref$serialize,
        _ref$deserialize = _ref.deserialize,
        deserialize = _ref$deserialize === void 0 ? JSON.parse : _ref$deserialize;

    // 这里必须强制转换，因为 timeStart 在全局选项中是不可能存在的
    this.cacheOption = {
      timeout: timeout,
      serialize: serialize,
      deserialize: deserialize
    };
    /**
     * 缓存对象，默认使用 localStorage
     */

    this.localStorage = window.localStorage; // 创建后将异步清空所有过期的缓存

    this.clearExpired();
  }
  /**
   * 清空所有过期的 key
   * 注: 该函数是异步执行的
   */


  var _proto = LocalStorageCache.prototype;

  _proto.clearExpired = function clearExpired() {
    try {
      var _this2 = this;

      var local = _this2.localStorage;

      var getKeys = function getKeys() {
        var len = local.length;
        var res = [];

        for (var i = 0; i < len; i++) {
          res.push(local.key(i));
        }

        return res;
      };

      getKeys().filter(not(isNullOrUndefined)).map(function (key) {
        return safeExec(function () {
          return JSON.parse(local.getItem(key));
        });
      }).filter(function (cacheVal) {
        return !isNullOrUndefined(cacheVal) && isNullOrUndefined(cacheVal.cacheOption);
      }) // TODO 这里暂时加个补丁，过滤掉 timeStart,timeout 为 undefined 的缓存
      .filter(function (_ref2) {
        var _ref2$cacheOption = _ref2.cacheOption,
            cacheOption = _ref2$cacheOption === void 0 ? {} : _ref2$cacheOption;
        var timeStart = cacheOption.timeStart,
            timeout = cacheOption.timeout;

        if (isNullOrUndefined(timeStart) || isNullOrUndefined(timeout)) {
          return false;
        }

        return timeout !== TimeoutInfinite && Date.now() - timeStart > timeout;
      }).forEach(function (_ref3) {
        var key = _ref3.key;
        return local.removeItem(key);
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * 根据 key + value 添加
   * 如果不存在则添加，否则忽略
   * @param key 缓存的 key
   * @param val 缓存的 value
   * @param cacheOption 缓存的选项，默认为无限时间
   * @override
   */
  ;

  _proto.add = function add(key, val, timeout) {
    var result = this.get(key);

    if (result !== null) {
      return;
    }

    this.set(key, val, timeout);
  }
  /**
   * 根据指定的 key 删除
   * 如果存在则删除，否则忽略
   * @param key 删除的 key
   * @override
   */
  ;

  _proto.del = function del(key) {
    this.localStorage.removeItem(key);
  }
  /**
   * 根据指定的 key 修改
   * 不管是否存在都会设置
   * @param key 修改的 key
   * @param val 修改的 value
   * @param timeout 修改的选项
   * @override
   */
  ;

  _proto.set = function set(key, val, timeout) {
    this.localStorage.setItem(key, JSON.stringify(new CacheVal({
      key: key,
      val: this.cacheOption.serialize(val),
      // 我们不需要缓存序列化/反序列化策略（实际上也无法缓存）
      cacheOption: {
        timeStart: Date.now(),
        timeout: timeout || this.cacheOption.timeout
      }
    })));
  }
  /**
   * 根据 key 获取
   * 如果存在则获取，否则忽略
   * @param key 指定的 key
   * @param timeout 获取的选项
   * @returns 获取到的缓存值
   * @override
   */
  ;

  _proto.get = function get(key) {
    var str = this.localStorage.getItem(key);
    var cacheVal = safeExec(function () {
      return JSON.parse(str);
    });

    if (isNullOrUndefined(cacheVal) || isNullOrUndefined(cacheVal.cacheOption)) {
      return null;
    }

    var _ref4 = [cacheVal.cacheOption.timeStart, cacheVal.cacheOption.timeout, this.cacheOption.deserialize],
        timeStart = _ref4[0],
        timeout = _ref4[1],
        deserialize = _ref4[2]; // 如果超时则删除并返回 null

    if (timeout !== TimeoutInfinite && Date.now() - timeStart > timeout) {
      this.del(key);
      return null;
    }

    try {
      return deserialize(cacheVal.val);
    } catch (e) {
      this.del(key);
      return null;
    }
  }
  /**
   * 根据 key 获取并刷新超时时间
   * @param key 指定的 key
   * @param cacheOption 获取的选项
   * @returns 获取到的缓存值
   * @override
   */
  ;

  _proto.touch = function touch(key) {
    var str = this.localStorage.getItem(key);
    /**
     * @type {CacheVal}
     */

    var cacheVal = safeExec(function () {
      return JSON.parse(str);
    });

    if (isNullOrUndefined(cacheVal) || isNullOrUndefined(cacheVal.cacheOption)) {
      return null;
    }

    var _ref5 = [cacheVal.cacheOption.timeStart, cacheVal.cacheOption.timeout, this.cacheOption.deserialize],
        timeStart = _ref5[0],
        timeout = _ref5[1],
        deserialize = _ref5[2]; // 如果超时则删除并返回 null

    if (timeout !== TimeoutInfinite && Date.now() - timeStart > timeout) {
      this.del(key);
      return null;
    }

    try {
      var result = deserialize(cacheVal.val);
      this.set(key, result, {
        timeStart: Date.now(),
        timeout: timeout
      });
      return result;
    } catch (e) {
      this.del(key);
      return null;
    }
  };

  return LocalStorageCache;
}();

/**
 * 默认使用的 {@link ICache} 接口的缓存实现
 */

var cache = /*#__PURE__*/new LocalStorageCache();
/**
 * 缓存工具类
 * 主要实现缓存高阶函数的封装
 */

var CacheUtil = /*#__PURE__*/function () {
  function CacheUtil() {}

  /**
   * 将指定函数包装为只调用一次为缓存函数
   * @param fn 需要包装的函数
   * @param options 缓存选项对象。可选项
   * @param options.identity 缓存标识。默认为函数 {@link toString}，但有时候不太可行（继承自基类的函数）
   * @param options.timeout 缓存时间。默认为无限
   * @returns 包装后的函数
   */
  CacheUtil.once = function once(fn, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$identity = _ref.identity,
        identity = _ref$identity === void 0 ? fn.toString() : _ref$identity,
        timeout = _ref.timeout;

    var generateKey = function generateKey() {
      return "CacheUtil.onceOfSameParam-" + identity;
    };

    var innerFn = new Proxy(fn, {
      apply: function apply(_, _this, args) {
        var key = generateKey();
        var val = cache.get(key);

        if (val !== null) {
          return val;
        }

        return compatibleAsync(Reflect.apply(_, _this, args), function (res) {
          cache.set(key, res, timeout);
          return res;
        });
      }
    });
    return Object.assign(innerFn, {
      origin: fn,
      clear: function clear() {
        cache.del(generateKey());
      }
    });
  }
  /**
   * 包裹函数为缓存函数
   * @param fn 一个接受一些参数并返回结果的函数
   * @param options 缓存选项对象。可选项
   * @param options.identity 缓存标识。默认为函数 {@link toString}，但有时候不太可行（继承自基类的函数）
   * @param options.timeout 缓存时间。默认为无限
   * @returns 带有缓存功能的函数
   */
  ;

  CacheUtil.onceOfSameParam = function onceOfSameParam(fn, _temp2) {
    var _ref2 = _temp2 === void 0 ? {} : _temp2,
        _ref2$identity = _ref2.identity,
        identity = _ref2$identity === void 0 ? fn.toString() : _ref2$identity,
        timeout = _ref2.timeout;

    var generateKey = function generateKey(args) {
      return "CacheUtil.onceOfSameParam-" + identity + "-" + JSON.stringify(args);
    };

    var innerFn = new Proxy(fn, {
      apply: function apply(_, _this, args) {
        var key = generateKey(args);
        var val = cache.get(key);

        if (val !== null) {
          return val;
        }

        return compatibleAsync(Reflect.apply(_, _this, args), function (res) {
          cache.set(key, res, timeout);
          return res;
        });
      }
    });
    return Object.assign(innerFn, {
      origin: fn,
      clear: function clear() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        cache.del(generateKey(args));
      }
    });
  };

  return CacheUtil;
}();
/**
 * 导出一个默认的缓存工具对象
 * @deprecated 已废弃，请直接使用类的静态函数
 */

var cacheUtil = CacheUtil;

/**
 * 一个空的函数
 * @param args 接受任何参数
 */
function emptyFunc() {}

/**
 * 禁止他人调试网站相关方法的集合对象
 */

var AntiDebug = /*#__PURE__*/function () {
  function AntiDebug() {}

  /**
   * 不停循环 debugger 防止有人调试代码
   * @returns 取消函数
   */
  AntiDebug.cyclingDebugger = function cyclingDebugger() {
    var res = setInterval(function () {
      debugger;
    }, 100);
    return function () {
      return clearInterval(res);
    };
  }
  /**
   * 检查是否正在 debugger 并调用回调函数
   * @param fn 回调函数，默认为重载页面
   * @returns 取消函数
   */
  ;

  AntiDebug.checkDebug = function checkDebug(fn) {
    if (fn === void 0) {
      fn = function fn() {
        return window.location.reload();
      };
    }

    var res = setInterval(function () {
      var diff = timing(function () {
        debugger;
      });

      if (diff > 500) {
        console.log(diff);
        fn();
      }
    }, 1000);
    return function () {
      return clearInterval(res);
    };
  }
  /**
   * 禁用控制台调试输出
   * @returns 取消函数
   */
  ;

  AntiDebug.disableConsoleOutput = function disableConsoleOutput() {
    if (!window.console) {
      return emptyFunc;
    }

    var map = arrayToMap(Object.keys(console), returnItself, function (k) {
      // @ts-ignore
      var temp = console[k]; // @ts-ignore

      console[k] = emptyFunc;
      return temp;
    });
    return function () {
      for (var _iterator = _createForOfIteratorHelperLoose(map), _step; !(_step = _iterator()).done;) {
        var _step$value = _step.value,
            k = _step$value[0],
            v = _step$value[1];
        // @ts-ignore
        console[k] = v;
      }
    };
  };

  return AntiDebug;
}();
/**
 * 禁止他人调试网站相关方法的集合对象
 * @deprecated 已废弃，请直接使用类的静态函数
 */

var antiDebug = AntiDebug;

/**
 * 判断一个字符串是否为空白的字符串
 * @param str 字符串
 * @returns 是否为空字符串
 * @deprecated 已废弃，请使用 {@link stringValidator#isBlank}
 */

function isBlank(str) {
  return stringValidator.isBlank(str);
}

/**
 * 判断一个字符串是否为空字符串
 * @param str 字符串
 * @returns 是否为空字符串
 * @deprecated 已废弃，请使用 {@link stringValidator#isEmpty}
 */

function isEmpty(str) {
  return stringValidator.isEmpty(str);
}

/**
 * 加载一个远程脚本文件
 * @param src 远程脚本路径
 * @returns 等待异步加载脚本完成
 */
function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.async = false;
    script.src = src;
    script.addEventListener('load', function () {
      return resolve();
    });
    script.addEventListener('error', reject);
    document.body.appendChild(script);
  });
}

/**
 * 将一个谓词函数取反
 * 如果是同步函数，则返回的函数也是同步的，否则返回的是取反后的异步函数
 * @param fn 要取反的函数
 * @returns 取反得到的函数
 * @deprecated 已废弃，请使用 {@link CombinedPredicate.not} 进行为此取反
 */

function deny(fn) {
  return CombinedPredicate.not(fn);
}

/**
 * 数组校验器
 */

var ArrayValidator = /*#__PURE__*/function () {
  function ArrayValidator() {}

  /**
   * 是否为空数组
   * @param array 空数组
   * @returns 是否为空数组
   */
  ArrayValidator.isEmpty = function isEmpty(array) {
    return isNullOrUndefined(array) || !(array instanceof Array) || array.length === 0;
  };

  return ArrayValidator;
}();
/**
 * 导出一个默认的数组校验对象
 * @deprecated 已废弃，请直接使用类的静态函数
 */

var arrayValidator = ArrayValidator;

/**
 * 路径工具
 */
var PathUtil = /*#__PURE__*/function () {
  function PathUtil() {}

  /**
   * 拼接多个路径
   *
   * @param paths 路径数组
   * @return {String} 拼接完成的路径
   */
  PathUtil.join = function join() {
    for (var _len = arguments.length, paths = new Array(_len), _key = 0; _key < _len; _key++) {
      paths[_key] = arguments[_key];
    }

    return paths.reduce(PathUtil._join);
  }
  /**
   * 拼接两个路径
   *
   * @param pathStart 开始路径
   * @param pathEnd   结束路径
   * @return {String} 拼接完成的两个路径
   */
  ;

  PathUtil._join = function _join(pathStart, pathEnd) {
    if (pathStart.endsWith(PathUtil.Separator)) {
      return (pathStart + pathEnd).replace(PathUtil.Separator + PathUtil.Separator, PathUtil.Separator);
    }

    if (pathEnd.startsWith(PathUtil.Separator)) {
      return pathStart + pathEnd;
    }

    return pathStart + PathUtil.Separator + pathEnd;
  };

  return PathUtil;
}();
/**
 * 路径分隔符
 */

PathUtil.Separator = '/';
/**
 * 导出一个路径工具类
 * @deprecated 已废弃，请直接使用类的静态函数
 */

var pathUtil = PathUtil;

var LoggerLevelEnum;

(function (LoggerLevelEnum) {
  LoggerLevelEnum[LoggerLevelEnum["Debug"] = 0] = "Debug";
  LoggerLevelEnum[LoggerLevelEnum["Log"] = 1] = "Log";
  LoggerLevelEnum[LoggerLevelEnum["Info"] = 2] = "Info";
  LoggerLevelEnum[LoggerLevelEnum["Warn"] = 3] = "Warn";
  LoggerLevelEnum[LoggerLevelEnum["Error"] = 4] = "Error";
})(LoggerLevelEnum || (LoggerLevelEnum = {}));

var enumMap = {
  debug: LoggerLevelEnum.Debug,
  log: LoggerLevelEnum.Log,
  info: LoggerLevelEnum.Info,
  warn: LoggerLevelEnum.Warn,
  error: LoggerLevelEnum.Error
};
/**
 * 自定义的日志类
 * 主要便于在开发环境下正常显示调试信息，在生产环境则默认关闭它
 */

var Logger = /*#__PURE__*/function () {
  /**
   * 构造函数
   * @param options 可选项
   * @param options.enable 是否开启日志
   */
  function Logger(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$enable = _ref.enable,
        enable = _ref$enable === void 0 ? true : _ref$enable,
        _ref$level = _ref.level,
        level = _ref$level === void 0 ? LoggerLevelEnum.Log : _ref$level;

    /**
     * 开发日志：业务强相关调试日志，希望其他人开发时默认隐藏起来的日志（例如第三方服务的回调日志很多，但对于服务接入层的使用者并不关心）
     */
    this.debug = console.debug;
    /**
     * 开发日志：业务相关调试日志，希望其他开发时也能看到的日志
     */

    this.log = console.log;
    /**
     * 生产日志：开发环境也会打印的日志，希望在生产环境打印并且方便调试的日志
     */

    this.info = console.info;
    /**
     * 警告日志：一些危险的操作可以在这里打印出来，同时会显示在生产环境（例如警告用户不要在控制台输入不了解的代码以避免账号安全）
     */

    this.warn = console.warn;
    /**
     * 错误日志：发生错误时使用的日志，发生影响到用户的错误时必须使用该日志
     */

    this.error = console.error;
    this.dir = console.dir;
    this.dirxml = console.dirxml;
    this.table = console.table;
    this.trace = console.trace;
    this.group = console.group;
    this.groupCollapsed = console.groupCollapsed;
    this.groupEnd = console.groupEnd;
    this.clear = console.clear;
    this.count = console.count;
    this.assert = console.assert;
    this.time = console.time;
    this.timeEnd = console.timeEnd;
    this.timeStamp = console.timeStamp;
    this.enable = enable;
    this.level = level;
  }
  /**
   * 设置 enable 的 setter 属性，在改变时合并对应的子类对象实现
   * @param enable 是否开启
   */


  _createClass(Logger, [{
    key: "enable",
    set: function set(enable) {
      var _this = this;
      Object.keys(console).forEach(function (k) {
        return Reflect.set(_this, k, enable ? console[k] : emptyFunc);
      });
    }
    /**
     * 设置日志的级别
     * @param level
     */

  }, {
    key: "level",
    set: function set(level) {
      var _this2 = this;
      Object.keys(console).filter(function (k) {
        return Reflect.has(enumMap, k);
      }).forEach(function (k) {
        return Reflect.set(_this2, k, Reflect.get(enumMap, k) >= level ? console[k] : emptyFunc);
      });
    }
  }]);

  return Logger;
}();
Logger.Level = LoggerLevelEnum;
/**
 * 导出一个全局可用的 Logger 对象
 * 使用 enable 属性控制是否开启日志输出，默认为 true
 */

var logger = /*#__PURE__*/new Logger();

/**
 * 将 Object 对象 转换为 Map
 * @param obj Object 对象
 * @returns 转换得到的 Map 键值表
 */
function objectToMap(obj) {
  return Object.keys(obj).reduce(function (map, k) {
    return map.set(k, Reflect.get(obj, k));
  }, new Map());
}

/**
 * 将列表转换为树节点
 * 注: 该函数默认树的根节点只有一个，如果有多个，则返回一个数组
 * @param list 树节点列表
 * @param options 其他选项
 * @returns 树节点，或是树节点列表
 */

function listToTree(list, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$bridge = _ref.bridge,
      bridge = _ref$bridge === void 0 ? returnItself : _ref$bridge,
      _ref$isRoot = _ref.isRoot,
      isRoot = _ref$isRoot === void 0 ? function (node) {
    return !node.parentId;
  } : _ref$isRoot;

  var arr = [];
  var res = list.reduce(function (root, _sub) {
    var sub = bridge(_sub);

    if (isRoot(sub)) {
      root.push(sub);
      return root;
    }

    for (var _iterator = _createForOfIteratorHelperLoose(list), _step; !(_step = _iterator()).done;) {
      var _parent = _step.value;
      var parent = bridge(_parent);

      if (sub.parentId === parent.id) {
        parent.child = parent.child || [];
        parent.child.push(sub);
        return root;
      }
    }

    return root;
  }, arr); // 根据顶级节点的数量决定如何返回

  var len = res.length;
  if (len === 0) return {};
  if (len === 1) return res[0];
  return res;
}

/**
 * 桥接对象不存在的字段
 * @param map 代理的字段映射 Map
 * @returns 转换一个对象为代理对象
 * @typeparam 类型解释：1. -readonly 是将使用者的 as const 修改为可变的字段，2. [P in keyof M] 从映射对象中取出所有的 key 作为字段，3. T[M[P] extends keyof T ? M[P] : never] 本质上只是 T[M[P]]]，只是 ts 不认为 M[P] 是 T 的字段，所以只能绕一下才能使用
 */
function bridge(map) {
  /**
   * 为对象添加代理的函数
   * @param obj 任何对象
   * @returns 代理后的对象
   */
  return function (obj) {
    return new Proxy(obj, {
      get: function get(_, k) {
        if (Reflect.has(map, k)) {
          return Reflect.get(_, Reflect.get(map, k));
        }

        return Reflect.get(_, k);
      },
      set: function set(_, k, v) {
        if (Reflect.has(map, k)) {
          Reflect.set(_, Reflect.get(map, k), v);
          return true;
        }

        Reflect.set(_, k, v);
        return true;
      }
    });
  };
}

/**
 * 遍历并映射一棵树的每个节点
 * @param root 树节点
 * @param options 其他选项
 * @returns 递归遍历后的树节点
 */

function treeMapping(root, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$before = _ref.before,
      before = _ref$before === void 0 ? returnItself : _ref$before,
      _ref$after = _ref.after,
      after = _ref$after === void 0 ? returnItself : _ref$after,
      _ref$paramFn = _ref.paramFn,
      paramFn = _ref$paramFn === void 0 ? function (node) {
    return [];
  } : _ref$paramFn;

  /**
   * 遍历一颗完整的树
   * @param node 要遍历的树节点
   * @param args 每次递归遍历时的参数
   */
  function _treeMapping(node) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    // 之前的操作
    var _node = before.apply(void 0, [node].concat(args));

    var _child = _node.child;

    if (!arrayValidator.isEmpty(_child)) {
      _node.child = _child.map(function (v) {
        return (// 产生一个参数
          _treeMapping.apply(void 0, [v].concat(paramFn.apply(void 0, [_node].concat(args))))
        );
      });
    } // 之后的操作


    return after.apply(void 0, [_node].concat(args));
  }

  return _treeMapping(root);
}

/**
 * 将树节点转为树节点列表
 * 这里使用了循环进行遍历，而非传统的递归方式
 * @param root 树节点
 * @param options 其他选项
 * @returns 树节点列表
 */

function treeToList(root, _temp2) {
  var _ref2 = _temp2 === void 0 ? {} : _temp2,
      _ref2$calcPath = _ref2.calcPath,
      calcPath = _ref2$calcPath === void 0 ? false : _ref2$calcPath,
      _ref2$bridge = _ref2.bridge,
      bridge = _ref2$bridge === void 0 ? returnItself : _ref2$bridge;

  var res = [];
  var temp = bridge(root);

  if (calcPath) {
    temp.path = temp.id + '';
  } // 利用队列缓存所有未处理的节点


  var queue = [temp]; // 使用 Set 防止可能的重复引用

  var filterSet = new Set(); // 使用 lastIdMap 避免重复添加

  var lastIdMap = new Map();

  var _loop = function _loop(_value) {
    var first = queue.shift();
    _value = bridge(first); // 判断重复

    if (_value === undefined || filterSet.has(first)) {
      value = _value;
      return "continue";
    }

    filterSet.add(first);
    res.push(_value);
    var child = _value.child;

    if (ArrayValidator.isEmpty(child)) {
      value = _value;
      return "continue";
    }

    var childNonIllegal = child.filter(function (v) {
      return !isNullOrUndefined(v) || filterSet.has(v);
    }); // TODO 这里和上面的代码明显重复，待优化。。。

    queue.push.apply(queue, calcPath ? childNonIllegal.map(function (v) {
      var _v = bridge(v); // 如果最后一个的 id 等于自身，说明已经被添加过了


      if (lastIdMap.get(_v.id) === _v.id) {
        value = _value;
        return _v;
      } // 使用父节点绝对路径 + 当前 id


      _v.path = _value.path + ',' + _v.id;
      lastIdMap.set(_v.id, _v.id);
      value = _value;
      return _v;
    }) : childNonIllegal);
    value = _value;
  };

  for (var value; queue.length > 0;) {
    var _ret = _loop(value);

    if (_ret === "continue") continue;
  }

  return res;
}

/**
 * 树节点桥接工具类
 * 主要实现了桥接 {@field bridge} {@field bridgeTree} 和 {@field bridgeList} 三个函数，事实上桥接之后再转换相当于做了两遍，但就目前而言暂且只能如此了
 */

var NodeBridgeUtil = /*#__PURE__*/function () {
  function NodeBridgeUtil() {}

  /**
   * 桥接对象为标准的树结构
   * @param nodeBridge 桥接对象
   * @returns 代理函数
   */
  NodeBridgeUtil.bridge = function bridge$1(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$id = _ref.id,
        id = _ref$id === void 0 ? 'id' : _ref$id,
        _ref$parentId = _ref.parentId,
        parentId = _ref$parentId === void 0 ? 'parentId' : _ref$parentId,
        _ref$child = _ref.child,
        child = _ref$child === void 0 ? 'child' : _ref$child,
        _ref$path = _ref.path,
        path = _ref$path === void 0 ? 'path' : _ref$path;

    return bridge({
      id: id,
      parentId: parentId,
      child: child,
      path: path
    });
  }
  /**
   * 桥接一棵完整的树
   * @param tree 树节点
   * @param nodeBridge 桥接对象
   * @returns 代理后的树对象
   */
  ;

  NodeBridgeUtil.bridgeTree = function bridgeTree(tree, nodeBridge) {
    return treeMapping(tree, {
      before: this.bridge(nodeBridge)
    });
  }
  /**
   * 桥接一个树节点列表
   * @param list 树节点列表
   * @param nodeBridge 桥接对象
   * @returns 代理后的树节点列表
   */
  ;

  NodeBridgeUtil.bridgeList = function bridgeList(list, nodeBridge) {
    return list.map(this.bridge(nodeBridge));
  };

  return NodeBridgeUtil;
}();
/**
 * 导出一个 NodeBridgeUtil 的实例
 * @deprecated 已废弃，请直接使用类的静态函数
 */

var nodeBridgeUtil = NodeBridgeUtil;

/**
 * 获取对象中所有的属性及对应的值，包括 ES6 新增的 Symbol 类型的属性
 * @param obj 任何对象
 * @returns 属性及其对应值的二维数组
 * @deprecated 该函数将要被废弃，实质上应用场景很窄
 */
function getObjectEntries(obj) {
  var mFn = function mFn(k) {
    return [k, Reflect.get(obj, k)];
  };

  return Reflect.ownKeys(obj).map(mFn);
}

/**
 * 获取对象中所有的属性，包括 ES6 新增的 Symbol 类型的属性
 * @param obj 任何对象
 * @returns 属性数组
 * @deprecated 已废弃，请使用 ES6 {@see Reflect.ownKeys} 代替
 * 具体参考 {@url(https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys)}
 */

function getObjectKeys(obj) {
  if (isNullOrUndefined(obj)) {
    return [];
  }

  return Reflect.ownKeys(obj);
}

/**
 * 比较两个浮点数是否相等
 * 具体实现采用差值取绝对值并与 {@link Number.EPSILON} 比较的方式，如果小于浮点数最小差值，则认为它们是 [相等] 的
 * @param num1 第一个浮点数
 * @param num2 第二个浮点数
 * @returns 两数是否相等
 */
function floatEquals(num1, num2) {
  return Math.abs(num1 - num2) < Number.EPSILON;
}

// export function assign<T, A>(target: T, a: A): T & A
// export function assign<T, A, B>(target: T, a: A, b: B): T & A & B
// export function assign<T, A, B, C>(target: T, a: A, b: B, c: C): T & A & B & C
// export function assign<T, A, B, C, D>(
//   target: T,
//   a: A,
//   b: B,
//   c: C,
//   d: D,
// ): T & A & B & C & D

/**
 * 合并多个对象的属性
 * 1. 该合并的方式为浅层合并，只会合并一层的对象
 * 2. 默认忽略值为 undefined/null 的属性
 * @param target 覆盖的对象上
 * @param  {...Object} sources 任意数量的对象
 * @returns 合并后的对象
 */

function assign(target) {
  for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  return [target].concat(sources).reduce(function (res, source) {
    if (isNullOrUndefined(source)) {
      return res;
    }

    return Object.keys(source).reduce(function (res, k) {
      var v = Reflect.get(source, k);

      if (isNullOrUndefined(v)) {
        return res;
      }

      Reflect.set(res, k, v);
      return res;
    }, res);
  }, {});
}

/**
 * 根据不同的源对象获取不同的正则匹配，代表不需要拷贝的属性
 * @param source 源对象
 * @returns 匹配内部属性的正则表达式
 */

function getInnerFieldRule(source) {
  if (source instanceof Function) {
    return /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/;
  } else {
    return /^(?:toString|length)$/;
  }
}
/**
 * 拷贝对象的属性到目标对象上
 * @param target 目标对象
 * @param source 源对象
 * @returns 返回 {@param target} 目标对象
 */


function _copyProps(target, source) {
  var innerField = getInnerFieldRule(source);
  Reflect.ownKeys(source).forEach(function (prop) {
    if (typeof prop === 'string' && innerField.test(prop)) {
      return;
    }

    Reflect.set(target, prop, Reflect.get(source, prop));
  });
  return target;
}
/**
 * 混合多个类
 * @param  {...Class} mixins 需要混合的多个类及其构造函数参数映射函数的 Map 集合
 * @returns 返回一个混合后的类，构造函数将的参数
 */


function aggregation(mixins) {
  var arr = Array.from(mixins);

  var Aggregate =
  /**
   * @param args 任意数量的参数
   */
  function Aggregate() {
    var _this = this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    arr.forEach(function (_ref) {
      var Mixin = _ref[0],
          _ref$ = _ref[1],
          fn = _ref$ === void 0 ? returnItself : _ref$;
      return _copyProps(_this, _construct(Mixin, fn(args)));
    });
  };

  arr.forEach(function (_ref2) {
    var Mixin = _ref2[0];

    _copyProps(Aggregate.prototype, Mixin.prototype);

    _copyProps(Aggregate, Mixin);
  });
  return Aggregate;
}

/**
 * 包装一个异步函数为有限制并发功能的函数
 * @param fn 异步函数
 * @param options 可选参数
 * @param options.limit 并发限制数量，默认为 1
 * @returns 返回被包装后的限制并发功能的函数
 */

function asyncLimiting(fn, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$limit = _ref.limit,
      limit = _ref$limit === void 0 ? 1 : _ref$limit;

  // 当前正在执行异步的数量
  var execCount = 0; // waitArr 等待的队列

  var takeQueue = []; // 是否增加了 execCount 的标记

  var flag = false;
  return new Proxy(fn, {
    apply: function apply(_, _this, args) {
      try {
        var _takeRun = function _takeRun() {
          try {
            if (!flag) {
              execCount++;
              flag = false;
            }

            var tempArgs = takeQueue.shift();
            return Promise.resolve(_finallyRethrows(function () {
              return Promise.resolve(Reflect.apply(_, _this, tempArgs));
            }, function (_wasThrown, _result) {
              execCount--;
              if (_wasThrown) throw _result;
              return _result;
            }));
          } catch (e) {
            return Promise.reject(e);
          }
        };

        takeQueue.push(args);
        return Promise.resolve(wait(function () {
          var result = execCount < limit; // 如果等待结束则必须立刻增加 execCount，避免微任务与宏任务调度可能产生错误

          if (result) {
            flag = true;
            execCount++;
          }

          return result;
        })).then(function () {
          return _takeRun();
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
}

/**
 * 默认的超时时间，可以认为是无限
 */

var TimeoutInfinity = function TimeoutInfinity() {
  return false;
};
/**
 * 创建一个 Lock 对象，用于锁住当前的当前的异步流程
 */


var Locker = /*#__PURE__*/function () {
  /**
   * @param options 可选项
   * @param options.limit 限制并发数量，默认为 1
   * @param options.timeout 超时时间，默认为无限
   */
  function Locker(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$limit = _ref.limit,
        limit = _ref$limit === void 0 ? 1 : _ref$limit,
        timeout = _ref.timeout;

    this.limit = limit;
    this.timeout = timeout || TimeoutInfinity;
  }
  /**
   * 当前是否锁住了
   * @returns 是否锁住了
   */


  var _proto = Locker.prototype;

  _proto.isLocked = function isLocked() {
    return this.limit <= 0;
  }
  /**
   * 添加异步锁
   * @param timeout 超时时间，默认为全局 timeout
   * @returns 进行等待
   */
  ;

  _proto.lock = function lock(timeout) {
    try {
      var _this2 = this;

      if (timeout === undefined) timeout = _this2.timeout;

      var _temp3 = function () {
        if (_this2.isLocked()) {
          /**
           * @type {Number|Function}
           */
          return Promise.resolve(Promise.race([wait(function () {
            var result = !_this2.isLocked();

            if (result) {
              _this2.limit--;
            }

            return result;
          }), wait(timeout)])).then(function () {});
        } else {
          _this2.limit--;
        }
      }();

      return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * 删除异步锁
   */
  ;

  _proto.unlock = function unlock() {
    this.limit++;
  };

  return Locker;
}();

/**
 * 包装一个函数为有错误重试功能的函数
 * 注: 如果发生错误，最终将抛出最后一次调用的异常
 * @param fn 需要被包装的函数
 * @param num 调用的次数。默认为 1
 * @param errorCheck 检查返回结果是否需要重试的函数。默认只要 resolve() 就返回 true
 * @returns 包装后的有错误重试功能的函数
 */
function trySometime(fn, num, errorCheck) {
  if (num === void 0) {
    num = 1;
  }

  if (errorCheck === void 0) {
    errorCheck = function errorCheck(res) {
      return true;
    };
  }

  return new Proxy(fn, {
    apply: function apply(target, thisArg, args) {
      try {
        var _temp3 = function _temp3(_result2) {
          if (_exit2) return _result2;
          throw err;
        };

        var _exit2 = false;
        var err;
        var _i = 0;

        var _temp4 = _for(function () {
          return !_exit2 && _i < num;
        }, function () {
          return _i++;
        }, function () {
          return _catch(function () {
            // 等待结果出来
            return Promise.resolve(Reflect.apply(target, thisArg, args)).then(function (res) {
              // 如果没问题就直接返回了
              if (errorCheck(res)) {
                _exit2 = true;
                return res;
              } // 否则抛出异常以进行下一次重试


              throw res;
            });
          }, function (error) {
            err = error;
          });
        });

        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
}

/**
 * 包装一个函数为有错误重试功能的函数
 * 注意: 该函数是并行运行，所以一旦调用，就会同时调用 n 次，不管之前有没有失败。。。此函数不适合包装有副作用的操作，例如修改用户信息，请使用 {@link trySometime} 替代
 * @param fn 需要被包装的函数
 * @param num 调用的次数。默认为 1
 * @param errorCheck 检查返回结果是否需要重试的函数。默认只要 resolve() 就返回 true
 * @returns 包装后的有错误重试功能的函数
 */

function trySometimeParallel(fn, num, errorCheck) {
  if (num === void 0) {
    num = 1;
  }

  if (errorCheck === void 0) {
    errorCheck = function errorCheck(res) {
      return true;
    };
  }

  return new Proxy(fn, {
    apply: function apply(target, thisArg, args) {
      try {
        return Promise.resolve(new Promise(function (resolve, reject) {
          try {
            var _temp3 = function _temp3() {
              reject(err);
            };

            var err;

            var _temp4 = _catch(function () {
              return Promise.resolve(Promise.all(range(0, num).map(function () {
                return Promise.resolve(_catch(function () {
                  return Promise.resolve(Reflect.apply(target, thisArg, args)).then(function (res) {
                    if (errorCheck(res) === true) {
                      resolve(res);
                    }

                    throw res;
                  });
                }, function (error) {
                  err = error;
                }));
              }))).then(function () {});
            }, function (error) {
              console.log(error);
            });

            return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
          } catch (e) {
            return Promise.reject(e);
          }
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
}

/**
 * 深度比较两个对象是否相等
 * @param x 任何对象
 * @param y 任何对象
 * @returns 是否相等
 */
function compare(x, y) {
  if ((typeof x === 'number' || x instanceof Number) && (typeof y === 'number' || y instanceof Number)) {
    var _x = +x;

    var _y = +y; // 如果都是 NaN 则直接返回 true


    if (isNaN(_x) && isNaN(_y)) {
      return true;
    } // 如果是 -0/+0 则返回 false


    if (_x === _y) {
      return 1 / _x === 1 / _y;
    } // 如果均为数字且两数之差的绝对值小于浮点数的最小精度（此举主要是为了避免浮点数的精度丢失）


    if (Math.abs(_x - _y) < Number.EPSILON) {
      return true;
    }
  } // 如果恒等表达式成立则直接返回 true


  if (x === y) {
    return true;
  } // 比较正则和字符串


  if (x instanceof RegExp && y instanceof RegExp || (typeof x === 'string' || x instanceof String) && (typeof y === 'string' || y instanceof String)) {
    return x.toString() === y.toString();
  } // 如果都是时间则比较它们的时间戳


  if (x instanceof Date && y instanceof Date) {
    return x.getTime() === y.getTime();
  } // 如果两者有一个不是 Object 类型的话则直接返回 false
  // 注: 此处直接返回 false 是因为特殊原生类型的都在上面处理过了
  // 注: Array 可以按照 Object 的逻辑进行处理


  if (!(x instanceof Object && y instanceof Object)) {
    return false;
  } // 比较它们的原型


  if (x.prototype !== y.prototype) {
    return false;
  } // 比较构造函数


  if (x.constructor !== y.constructor) {
    return false;
  } // 比较 y 中的属性是否全部都在 x 中


  for (var _i = 0, _Object$keys = Object.keys(y); _i < _Object$keys.length; _i++) {
    var p = _Object$keys[_i];

    if (!Reflect.has(x, p)) {
      return false;
    }
  } // 比较 x 中的属性是否全部都在 y 中


  for (var _i2 = 0, _Object$keys2 = Object.keys(x); _i2 < _Object$keys2.length; _i2++) {
    var _p = _Object$keys2[_i2];

    if (!Reflect.has(y, _p)) {
      return false;
    } // 比较每个元素的类型，如果不同则直接返回 false


    if (typeof y[_p] !== typeof x[_p]) {
      return false;
    } // 递归比较每个元素


    if (!compare(x[_p], y[_p])) {
      return false;
    }
  } // 全部比较完成仍然没有结果就返回 true


  return true;
}

/**
 * 阻塞主线程指定时间
 * 注: 和 {@see wait} 不同，该函数会真的阻塞住主线程，即这段时间内其他的代码都无法执行，例如用户的点击事件！
 * @param time 阻塞毫秒数
 */
function sleep(time) {
  var end = performance.now() + time;

  while (performance.now() <= end) {}
}

/**
 * 包装一个函数为异步函数
 * 如果是一个异步函数，则直接返回，否则返回一部函数
 * @param fn 任意一个函数
 * @returns 返回的异步结果 Promise 对象
 * @typeparam R 原函数函数返回值类型
 */
function async(fn) {
  return new Proxy(fn, {
    apply: function apply(_, _this, args) {
      try {
        return Promise.resolve(Reflect.apply(_, _this, args));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
}

/**
 * 将一个异步函数包装为具有时序的异步函数
 * 注: 该函数会按照调用顺序依次返回结果，后面的调用的结果需要等待前面的，所以如果不关心过时的结果，请使用 {@link switchMap} 函数
 * @param fn 一个普通的异步函数
 * @returns 包装后的函数
 */

function mergeMap(fn) {
  // 当前执行的异步操作 id
  var id = 0; // 所执行的异步操作 id 列表

  var ids = new Set();
  return new Proxy(fn, {
    apply: function apply(_, _this, args) {
      try {
        var prom = Reflect.apply(_, _this, args);
        var temp = id;
        ids.add(temp);
        id++;
        return Promise.resolve(wait(function () {
          return !ids.has(temp - 1);
        })).then(function () {
          ids["delete"](temp);
          return Promise.resolve(prom);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
}

/**
 * 将一个异步函数包装为具有时序的异步函数
 * 注: 该函数会丢弃过期的异步操作结果，这样的话性能会稍稍提高（主要是响应比较快的结果会立刻生效而不必等待前面的响应结果）
 * @param fn 一个普通的异步函数
 * @returns 包装后的函数
 */
function switchMap(fn) {
  // 当前执行的异步操作 id
  var id = 0; // 最后一次异步操作的 id，小于这个的操作结果会被丢弃

  var last = 0; // 缓存最后一次异步操作的结果

  var cache;
  return new Proxy(fn, {
    apply: function apply(_, _this, args) {
      try {
        var temp = id;
        id++;
        return Promise.resolve(Reflect.apply(_, _this, args)).then(function (res) {
          if (temp < last) {
            return cache;
          }

          cache = res;
          last = temp;
          return res;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
}

/**
 * 将指定函数包装为只调用一次，其他的调用返回旧值
 * 主要适用场景是只允许调用一次的地方，例如 Tab 的初始化
 * * 示意图:
 * a => b => c => d => e =>
 * a ==|====|====|====|====>
 *     |b   |c   |d   |e  (die)
 *
 * @param fn 需要包装的函数
 * @returns 包装后的函数
 */

function once(fn) {
  var flag = true;
  var cache;
  var res = new Proxy(fn, {
    apply: function apply(target, thisArg, args) {
      if (!flag) {
        return cache;
      }

      flag = false; // 如果是异步函数则返回异步的结果

      return compatibleAsync(Reflect.apply(target, thisArg, args), function (res) {
        cache = res;
        return cache;
      });
    }
  });
  return Object.assign(res, {
    origin: fn,
    clear: function clear() {
      cache = null;
    }
  });
}

/**
 * 将一个异步函数包装为具有时序的异步函数
 * 注: 该函数会按照调用顺序依次返回结果，后面的执行的调用（不是调用结果）需要等待前面的，此函数适用于异步函数的内里执行也必须保证顺序时使用，否则请使用 {@link mergeMap} 函数
 * 注: 该函数其实相当于调用 {@code asyncLimiting(fn, {limit: 1})} 函数
 * 例如即时保存文档到服务器，当然要等待上一次的请求结束才能请求下一次，不然数据库保存的数据就存在谬误了
 * @param fn 一个普通的异步函数
 * @returns 包装后的函数
 */

function concatMap(fn) {
  // 当前执行的异步操作 id
  var id = 0; // 所执行的异步操作 id 列表

  var ids = new Set();
  return new Proxy(fn, {
    apply: function apply(_, _this, args) {
      try {
        var temp = id;
        ids.add(temp);
        id++;
        return Promise.resolve(wait(function () {
          return !ids.has(temp - 1);
        })).then(function () {
          return Promise.resolve(Reflect.apply(_, _this, args)).then(function (res) {
            ids["delete"](temp);
            return res;
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
}

/**
 * 重复执行指定的函数
 * @param num 重复的次数
 * @param fn 执行的函数，如果是异步函数，则返回 Array.<Promise>
 * @param  {...Object} args 参数
 * @returns 执行返回结果
 */

function repeatedCall(num, fn) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return range(0, num).map(function () {
    return fn.apply(void 0, args);
  });
}

/**
 * 发布订阅模式
 * @typeparam T 订阅主题的类型，虽然可以为 any，但这里是刻意进行限制以避免 “全局” 的发布订阅中心对象
 * @deprecated 已废弃，请使用语义更好、类型安全且 API 更强大的 {@see EventEmitter} 进行事件总线处理
 */
var PubSubMachine = /*#__PURE__*/function () {
  function PubSubMachine() {
    /**
     * 订阅者集合
     */
    this.subMap = new Map();
  }
  /**
   * 发布一个主题
   * @param topic 发布的主题
   * @param [args] 主题订阅所需要的参数
   */


  var _proto = PubSubMachine.prototype;

  _proto.pub = function pub(topic) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var fns = this.subMap.get(topic);

    if (fns === undefined) {
      return;
    }

    fns.forEach(function (fn) {
      return fn.apply(void 0, args);
    });
  }
  /**
   * 订阅一个主题
   * @param topic 订阅的主题
   * @param fn 回调的函数
   */
  ;

  _proto.sub = function sub(topic, fn) {
    if (!this.subMap.has(topic)) {
      this.subMap.set(topic, []);
    }

    this.subMap.get(topic).push(fn);
  }
  /**
   * 取消订阅
   * @param topic 订阅的主题
   * @param fn 订阅的函数，没有则删除这个主题下所有的函数
   */
  ;

  _proto.unsub = function unsub(topic, fn) {
    if (fn === undefined) {
      this.subMap["delete"](topic);
      return;
    }

    if (!this.subMap.has(topic)) {
      return;
    }

    var fns = this.subMap.get(topic);
    fns.splice(fns.indexOf(fn), 1);
  };

  return PubSubMachine;
}();

/**
 * 提取对象数组为 Map
 * @param arr 对象数组
 * @param fields 提取的字段
 * @returns 提取字段名对应其字段值数组的 Map
 * @typeparam T 数组元素的类型，必须为可提取字段的对象
 */

function extractFieldMap(arr, fields) {
  return arr.reduce(function (res, v) {
    for (var _iterator = _createForOfIteratorHelperLoose(res), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
          k = _step$value[0],
          _arr = _step$value[1];

      _arr.push(Reflect.get(v, k));
    }

    return res;
  }, arrayToMap(fields, function (k) {
    return k;
  }, function () {
    return new Array();
  }));
}

/**
 * 数组按照指定长度进行分段为二维数组
 * 注: num 必须要大于 1
 * @param arr 要进行分段的数组
 * @param num 每段的长度
 * @returns 分段后的二维数组
 */
function segmentation(arr, num) {
  return arr.reduce(function (res, v, i) {
    var index = (i + 1) % num;

    if (index === 1) {
      res.push([]);
    }

    res[res.length - 1].push(v);
    return res;
  }, new Array());
}

/**
 * 切换 DOM 元素的 class
 * @param {Element} el DOM 元素
 * @param {Object} obj 切换的状态/class 键值对象
 * @return 根据状态切换 class 的函数
 */
function toggleClass(el, obj) {
  var arr = Array.from(Object.values(obj));
  /**
   * 返回切换 class 的函数
   * @param state 切换的状态
   */

  return function toggle(state) {
    arr.forEach(function (v) {
      return el.classList.remove(v);
    });
    el.classList.add(obj[state]);
  };
}

/**
 * 将函数包装为偏函数
 * 注: 该函数模仿了 underscore 的 partial 函数
 * @param fn 需要包装的函数
 * @param  {...any} args 应用的部分参数
 * @returns 包装后的函数
 */
function partial(fn) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var realArgs = args.filter(function (arg) {
    return arg !== partial._;
  }); // 如果函数参数足够则调用传入的函数

  if (realArgs.length >= fn.length) {
    return fn.apply(void 0, realArgs);
  }
  /**
   * 最终返回的函数
   * @param otherArgs 接受任意参数
   * @returns 返回一个函数，或者函数调用完成返回结果
   */


  function innerFn() {
    for (var _len2 = arguments.length, otherArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      otherArgs[_key2] = arguments[_key2];
    }

    // 记录需要移除补到前面的参数
    var removeIndexSet = new Set();
    var i = 0;
    var newArgs = args.map(function (arg) {
      if (arg !== partial._ || otherArgs[i] === undefined || otherArgs[i] === partial._) {
        return arg;
      }

      removeIndexSet.add(i); // 每次补偿前面的 partial._ 参数计数器 +1

      return otherArgs[i++];
    });
    var newOtherArgs = otherArgs.filter(function (_v, i) {
      return !removeIndexSet.has(i);
    });
    return partial.apply(void 0, [fn].concat(newArgs, newOtherArgs));
  } // 定义偏函数的剩余参数长度，便于在其他地方进行部分参数应用
  // 注: 不使用 length 属性的原因是 length 属性


  innerFn._length = fn.length - args.filter(function (arg) {
    return arg !== partial._;
  }).length; // 自定义 toString 函数便于调试

  innerFn.toString = function () {
    return "name: " + fn.name + ", args: [" + args.map(function (o) {
      return o.toString();
    }).join(', ') + "]";
  };

  innerFn._partial = true;
  return innerFn;
}
/**
 * 偏的占位符，需要应用后面的参数时使用
 * 例如 {@link partial(fn)(partial._, 1)} 意味着函数 fn 的第二个参数将被确定为 1
 */

partial._ = /*#__PURE__*/Symbol('_');

/**
 * 事件工具类
 */

var EventUtil = /*#__PURE__*/function () {
  function EventUtil() {}

  EventUtil.add = function add(dom, type, listener, options) {
    if (!EventUtil.listenerMap.has(dom)) {
      EventUtil.listenerMap.set(dom, []);
    }

    EventUtil.listenerMap.get(dom).push({
      type: type,
      listener: listener,
      options: options
    });
    dom.addEventListener(type, listener, options);
  };

  EventUtil.remove = function remove(dom, type, listener, options) {
    dom.removeEventListener(type, listener, options);
    EventUtil.listenerMap.set(dom, (EventUtil.listenerMap.get(dom) || []).filter(function (cacheListener) {
      return cacheListener.type !== type || cacheListener.listener !== listener || cacheListener.options !== options;
    }));
  };

  EventUtil.removeByType = function removeByType(dom, type, options) {
    var listenerList = EventUtil.listenerMap.get(dom);

    if (listenerList === undefined) {
      return [];
    }

    var map = groupBy(listenerList, function (cacheListener) {
      return type === cacheListener.type && options === cacheListener.options;
    });
    var removeCacheListenerList = map.get(true) || [];
    var retainCacheListenerList = map.get(true) || [];
    EventUtil.listenerMap.set(dom, retainCacheListenerList);
    return removeCacheListenerList.map(function (cacheListener) {
      dom.removeEventListener(cacheListener.type, cacheListener.listener, cacheListener.options);
      return cacheListener;
    });
  };

  return EventUtil;
}();
/**
 * 缓存的事件监听对象映射表
 */

EventUtil.listenerMap = /*#__PURE__*/new Map();

/**
 * 加载一个远程样式文件
 * @param href 远程 CSS 样式路径
 * @returns 等待异步加载样式完成
 */
function loadStyle(href) {
  return new Promise(function (resolve, reject) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', function () {
      return resolve();
    });
    link.addEventListener('error', reject);
    document.body.appendChild(link);
  });
}

/**
 * 补 0 函数
 * @param time 为时分秒补首位 0
 * @returns 补零得到的字符串
 */
function zeroPadding(time) {
  return (time >= 10 ? '' : '0') + time;
}
/**
 * 秒表
 * 标准格式 `HH:mm:ss`
 * 主要适用场景是格式化/解析时间差值
 */


var Stopwatch = /*#__PURE__*/function () {
  function Stopwatch() {}

  /**
   * 格式化一个以秒为单位的绝对时间为标准时间格式的字符串
   * @param time 时间/s
   * @returns 格式化后的字符串
   */
  Stopwatch.format = function format(time) {
    var seconds = time % 60;
    var minutes = Math.floor(time / 60) % 60;
    var hours = Math.floor(time / 60 / 60);
    return zeroPadding(hours) + ":" + zeroPadding(minutes) + ":" + zeroPadding(seconds);
  }
  /**
   * 解析一个标准的时间字符串为秒为单位的绝对时间
   * @param str 时间字符串
   * @returns 解析得到的时间/s
   */
  ;

  Stopwatch.parse = function parse(str) {
    var _$exec = /(\d+):(\d+):(\d+)/.exec(str),
        hours = _$exec[1],
        minutes = _$exec[2],
        seconds = _$exec[3];

    return parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds);
  };

  return Stopwatch;
}();

/**
 * 提醒用户当前页面有正在执行的操作，暂时不能离开
 * 注：用户实际上可以不管该提醒
 * @param fn 谓词，是否要提醒不要关闭
 * @returns 返回删除这个事件监听的函数
 */
function remindLeavePage(fn) {
  if (fn === void 0) {
    fn = function fn() {
      return false;
    };
  }

  var listener = function listener(e) {
    if (fn()) {
      return false;
    }

    var confirmationMessage = '请不要关闭页面';
    e.returnValue = confirmationMessage; //Gecko + IE

    return confirmationMessage; //Webkit, Safari, Chrome etc.
  };

  window.addEventListener('beforeunload', listener);
  return function () {
    return window.removeEventListener('beforeunload', listener);
  };
}

/**
 * 事件总线
 * 实际上就是发布订阅模式的一种简单实现
 * 类型定义受到 {@link https://github.com/andywer/typed-emitter/blob/master/index.d.ts} 的启发，不过只需要声明参数就好了，而不需要返回值（应该是 {@code void}）
 */
var EventEmitter = /*#__PURE__*/function () {
  function EventEmitter() {
    this.events = new Map();
  }
  /**
   * 添加一个事件监听程序
   * @param type 监听类型
   * @param callback 处理回调
   * @returns {@code this}
   */


  var _proto = EventEmitter.prototype;

  _proto.add = function add(type, callback) {
    var callbacks = this.events.get(type) || [];
    callbacks.push(callback);
    this.events.set(type, callbacks);
    return this;
  }
  /**
   * 移除一个事件监听程序
   * @param type 监听类型
   * @param callback 处理回调
   * @returns {@code this}
   */
  ;

  _proto.remove = function remove(type, callback) {
    var callbacks = this.events.get(type) || [];
    this.events.set(type, callbacks.filter(function (fn) {
      return fn !== callback;
    }));
    return this;
  }
  /**
   * 移除一类事件监听程序
   * @param type 监听类型
   * @returns {@code this}
   */
  ;

  _proto.removeByType = function removeByType(type) {
    this.events["delete"](type);
    return this;
  }
  /**
   * 触发一类事件监听程序
   * @param type 监听类型
   * @param args 处理回调需要的参数
   * @returns {@code this}
   */
  ;

  _proto.emit = function emit(type) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var callbacks = this.events.get(type) || [];
    callbacks.forEach(function (fn) {
      fn.apply(void 0, args);
    });
    return this;
  }
  /**
   * 获取一类事件监听程序
   * @param type 监听类型
   * @returns 一个只读的数组，如果找不到，则返回空数组 {@code []}
   */
  ;

  _proto.listeners = function listeners(type) {
    return Object.freeze(this.events.get(type) || []);
  };

  return EventEmitter;
}();

/**
 * 一个简单的微任务队列辅助类，使用（宏）命令模式实现
 * 注：该 class 是为了解决问题 https://segmentfault.com/q/1010000019115775
 */

var MicrotaskQueue = /*#__PURE__*/function () {
  function MicrotaskQueue() {
    // task 列表
    this.tasks = []; // 当前是否存在正在执行的 task

    this.lock = false;
  }

  var _proto = MicrotaskQueue.prototype;

  _proto.add = function add(func) {
    this.tasks.push(func);
    this.execute();
    return this;
  };

  _proto.execute = function execute() {
    var _this = this;

    if (this.lock) {
      return;
    }

    this.lock = true;

    var goNext = function goNext() {
      if (_this.tasks.length) {
        var task = _this.tasks.shift();

        compatibleAsync(task(), function () {
          return goNext();
        });
      } else {
        _this.lock = false;
      }
    };

    Promise.resolve().then(goNext);
  };

  return MicrotaskQueue;
}();

/**
 * 取值的字符串
 */
var rangeStr = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var rangeLen = rangeStr.length;
/**
 * 生成一个随机字符串
 * @param len
 */

function randomStr(len) {
  var res = '';

  for (var i = 0; i < len; i++) {
    res += rangeStr.charAt(Math.floor(Math.random() * rangeLen));
  }

  return res;
}

/**
 * 解析字段字符串为数组
 * @param str 字段字符串
 * @returns 字符串数组，数组的 `[]` 取法会被解析为数组的一个元素
 */
function parseFieldStr(str) {
  // noinspection RegExpRedundantEscape
  return str.split(new RegExp('[\\.\\[]')).map(function (k) {
    return new RegExp('\\]$').test(k) ? k.slice(0, k.length - 1) : k;
  });
}

/**
 * 安全的深度获取对象的字段
 * TODO 该函数尚处于早期测试阶段
 * 注: 只要获取字段的值为 {@type null|undefined}，就会直接返回 {@param defVal}
 * 类似于 ES2019 的可选调用链特性: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/%E5%8F%AF%E9%80%89%E9%93%BE
 * @param obj 获取的对象
 * @param fields 字段字符串或数组
 * @param [defVal] 取不到值时的默认值，默认为 null
 */

function get(obj, fields, defVal) {
  if (defVal === void 0) {
    defVal = null;
  }

  if (TypeValidator.isString(fields)) {
    fields = parseFieldStr(fields);
  }

  var res = obj;

  for (var _iterator = _createForOfIteratorHelperLoose(fields), _step; !(_step = _iterator()).done;) {
    var field = _step.value;

    try {
      res = Reflect.get(res, field);

      if (isNullOrUndefined(res)) {
        return defVal;
      }
    } catch (e) {
      return defVal;
    }
  }

  return res;
}

/**
 * 安全的深度设置对象的字段
 * TODO 该函数尚处于早期测试阶段
 * 注: 只要设置字段的值为 {@type null|undefined}，就会直接返回 {@param defVal}
 * 类似于 ES2019 的可选调用链特性: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/%E5%8F%AF%E9%80%89%E9%93%BE
 * @param obj 设置的对象
 * @param fields 字段字符串或数组
 * @param [val] 设置字段的值
 */

function set(obj, fields, val) {
  if (TypeValidator.isString(fields)) {
    fields = parseFieldStr(fields);
  }

  var res = obj;

  for (var i = 0, len = fields.length; i < len; i++) {
    var field = fields[i];

    if (i === len - 1) {
      res[field] = val;
      return true;
    }

    res = res[field];

    if (!TypeValidator.isObject(res)) {
      return false;
    }
  }

  return false;
}

/**
 * 获取当前选中的文本
 * @returns 当前选中的文本
 */
function getSelectText() {
  return getSelection().toString();
}

/**
 * 获取图片的尺寸
 * @param url
 */
function imageSize(url) {
  return new Promise(function (resolve, reject) {
    var image = new Image();
    image.addEventListener('load', function () {
      resolve({
        width: this.width,
        height: this.height
      });
    });
    image.addEventListener('error', function (ev) {
      reject(ev.error);
    });
    image.src = url;
  });
}

/**
 * 获取鼠标的位置
 * @param e 触发的鼠标事件对象
 * @returns 鼠标的坐标
 */
function getMousePos(e) {
  var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
  var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
  var x = e.pageX || e.clientX + scrollX;
  var y = e.pageY || e.clientY + scrollY;
  return {
    x: x,
    y: y
  };
}

/**
 * 将多个并发异步调用合并为一次批处理
 * @param handle 批处理的函数
 * @param ms 等待的时长（时间越长则可能合并的调用越多，否则将使用微任务只合并一次同步执行的所有调用）
 */

function batch(handle, ms) {
  if (ms === void 0) {
    ms = 0;
  }

  //参数 => 结果 映射
  var resultCache = new Map(); //参数 => 次数的映射

  var paramCache = new Map(); //当前是否被锁定

  var lock = false;
  return function () {
    try {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var key = JSON.stringify(args);
      paramCache.set(key, (paramCache.get(key) || 0) + 1);
      return Promise.resolve(Promise.all([wait(function () {
        return resultCache.has(key) || !lock;
      }), wait(ms)])).then(function () {
        function _temp3() {
          var value = resultCache.get(key);
          paramCache.set(key, paramCache.get(key) - 1);

          if ((paramCache.get(key) || 0) <= 0) {
            paramCache["delete"](key);
            resultCache["delete"](key);
          }

          if (value instanceof Error) {
            resultCache["delete"](key);
            throw value;
          }

          return value;
        }

        var _temp2 = function () {
          if (!resultCache.has(key)) {
            var _temp4 = _finallyRethrows(function () {
              lock = true;
              return Promise.resolve(handle(Array.from(paramCache.keys()).map(function (v) {
                return JSON.parse(v);
              }))).then(function (_handle) {
                Array.from(_handle).forEach(function (_ref) {
                  var k = _ref[0],
                      v = _ref[1];
                  resultCache.set(JSON.stringify(k), v);
                });
              });
            }, function (_wasThrown, _result) {
              lock = false;
              if (_wasThrown) throw _result;
              return _result;
            });

            if (_temp4 && _temp4.then) return _temp4.then(function () {});
          }
        }();

        return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

/**
 * 从一个对象中挑选出来几个指定的字段
 * @param obj 指定对象
 * @param fieldList 指定对象字段列表
 * @returns 返回挑选字段组成的新对象
 */
function pick(obj) {
  for (var _len = arguments.length, fieldList = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    fieldList[_key - 1] = arguments[_key];
  }

  var set = new Set(fieldList);
  return Object.entries(obj).reduce(function (res, _ref) {
    var k = _ref[0],
        v = _ref[1];

    if (set.has(k)) {
      Reflect.set(res, k, v);
    }

    return res;
  }, {});
}

var WebStorage = /*#__PURE__*/function () {
  function WebStorage(storage) {
    var _this = this;

    this.storage = storage;

    this.clear = function () {
      _this.storage.clear();
    };

    this.getItem = function (key) {
      return _this.storage.getItem(key);
    };

    this.key = function (index) {
      return _this.storage.key(index);
    };

    this.removeItem = function (key) {
      _this.storage.removeItem(key);
    };

    this.setItem = function (key, value) {
      _this.storage.setItem(key, value);
    };
  }

  _createClass(WebStorage, [{
    key: "length",
    get: function get() {
      return this.storage.length;
    }
  }]);

  return WebStorage;
}();
/**
 * 代理 Storage 使之更简单易用
 * @param storage
 */


function proxyStorage(storage) {
  var kSet = new Set(['storage', 'length', 'clear', 'getItem', 'setItem', 'removeItem', 'key']);
  return new Proxy(new WebStorage(storage), {
    get: function get(target, p, receiver) {
      if (kSet.has(p)) {
        return Reflect.get(target, p, receiver);
      }

      return safeExec(function () {
        return JSON.parse(target.getItem(p.toString()));
      }, null);
    },
    set: function set(target, p, value, receiver) {
      if (kSet.has(p)) {
        return Reflect.set(target, p, receiver);
      }

      target.setItem(p.toString(), value !== undefined && value !== null ? JSON.stringify(value) : value);
      return true;
    }
  });
}

exports.AntiDebug = AntiDebug;
exports.ArrayValidator = ArrayValidator;
exports.AsyncArray = AsyncArray;
exports.CacheUtil = CacheUtil;
exports.CombinedPredicate = CombinedPredicate;
exports.DateConstants = DateConstants;
exports.DateFormatter = DateFormatter;
exports.EventEmitter = EventEmitter;
exports.EventUtil = EventUtil;
exports.FetchLimiting = FetchLimiting;
exports.LocalStorageCache = LocalStorageCache;
exports.Locker = Locker;
exports.Logger = Logger;
exports.MemoryCacheFactory = MemoryCacheFactory;
exports.MicrotaskQueue = MicrotaskQueue;
exports.NodeBridgeUtil = NodeBridgeUtil;
exports.PathUtil = PathUtil;
exports.PubSubMachine = PubSubMachine;
exports.StateMachine = StateMachine;
exports.Stopwatch = Stopwatch;
exports.StringStyleUtil = StringStyleUtil;
exports.StringValidator = StringValidator;
exports.TypeValidator = TypeValidator;
exports.aggregation = aggregation;
exports.and = and;
exports.antiDebug = antiDebug;
exports.appends = appends;
exports.arrayDiffBy = arrayDiffBy;
exports.arrayToMap = arrayToMap;
exports.arrayValidator = arrayValidator;
exports.asIterator = asIterator;
exports.assign = assign;
exports.async = async;
exports.asyncFlatMap = asyncFlatMap;
exports.asyncLimiting = asyncLimiting;
exports.autoIncrement = autoIncrement;
exports.batch = batch;
exports.blankToNull = blankToNull;
exports.blankToNullField = blankToNullField;
exports.bridge = bridge;
exports.cacheUtil = cacheUtil;
exports.compare = compare;
exports.compatibleAsync = compatibleAsync;
exports.compose = compose;
exports.concatMap = concatMap;
exports.copyText = copyText;
exports.createElByString = createElByString;
exports.curry = curry;
exports.dateBetween = dateBetween;
exports.dateConstants = dateConstants;
exports.dateEnhance = dateEnhance;
exports.dateFormat = dateFormat;
exports.dateParse = dateParse;
exports.debounce = debounce;
exports.deepExcludeFields = deepExcludeFields;
exports.deepFreeze = deepFreeze;
exports.deepProxy = deepProxy;
exports.deletes = deletes;
exports.deny = deny;
exports.diffBy = diffBy;
exports.download = download;
exports.downloadString = downloadString;
exports.downloadUrl = downloadUrl;
exports.emptyAllField = emptyAllField;
exports.emptyFunc = emptyFunc;
exports.excludeFields = excludeFields;
exports.excludeFieldsDeep = excludeFieldsDeep;
exports.extractFieldMap = extractFieldMap;
exports.fetchTimeout = fetchTimeout;
exports.fill = fill;
exports.filterItems = filterItems;
exports.findIndex = findIndex;
exports.flatMap = flatMap;
exports.floatEquals = floatEquals;
exports.formDataToArray = formDataToArray;
exports.format = format;
exports.get = get;
exports.getCookies = getCookies;
exports.getCursorPosition = getCursorPosition;
exports.getCusorPostion = getCusorPostion;
exports.getKFn = getKFn;
exports.getMousePos = getMousePos;
exports.getObjectEntries = getObjectEntries;
exports.getObjectKeys = getObjectKeys;
exports.getSelectText = getSelectText;
exports.getYearWeek = getYearWeek;
exports.groupBy = groupBy;
exports.imageSize = imageSize;
exports.insertText = insertText;
exports.isBlank = isBlank;
exports.isEditable = isEditable;
exports.isEmpty = isEmpty;
exports.isFloat = isFloat;
exports.isNullOrUndefined = isNullOrUndefined;
exports.isNumber = isNumber;
exports.isRange = isRange;
exports.lastFocus = lastFocus;
exports.listToTree = listToTree;
exports.loadResource = loadResource;
exports.loadScript = loadScript;
exports.loadStyle = loadStyle;
exports.logger = logger;
exports.mapToObject = mapToObject;
exports.mergeMap = mergeMap;
exports.nodeBridgeUtil = nodeBridgeUtil;
exports.not = not;
exports.objToFormData = objToFormData;
exports.objectToMap = objectToMap;
exports.once = once;
exports.onceOfSameParam = onceOfSameParam;
exports.or = or;
exports.parseUrl = parseUrl;
exports.partial = partial;
exports.pathUtil = pathUtil;
exports.pick = pick;
exports.proxyStorage = proxyStorage;
exports.randomInt = randomInt;
exports.randomStr = randomStr;
exports.range = range;
exports.readLocal = readLocal;
exports.remindLeavePage = remindLeavePage;
exports.removeEl = removeEl;
exports.removeText = removeText;
exports.repeatedCall = repeatedCall;
exports.returnItself = returnItself;
exports.returnReasonableItself = returnReasonableItself;
exports.safeExec = safeExec;
exports.segmentation = segmentation;
exports.set = set;
exports.setCursorPosition = setCursorPosition;
exports.setCusorPostion = setCusorPostion;
exports.sets = sets;
exports.singleModel = singleModel;
exports.sleep = sleep;
exports.sortBy = sortBy;
exports.spliceParams = spliceParams;
exports.strToArrayBuffer = strToArrayBuffer;
exports.strToDate = strToDate;
exports.stringValidator = stringValidator;
exports.switchMap = switchMap;
exports.throttle = throttle;
exports.timing = timing;
exports.toLowerCase = toLowerCase;
exports.toObject = toObject;
exports.toString = toString$1;
exports.toUpperCase = toUpperCase;
exports.toggleClass = toggleClass;
exports.treeMapping = treeMapping;
exports.treeToList = treeToList;
exports.trySometime = trySometime;
exports.trySometimeParallel = trySometimeParallel;
exports.uniqueBy = uniqueBy;
exports.wait = wait;
exports.waitResource = waitResource;
exports.watch = watch;
exports.watchEventListener = watchEventListener;
exports.watchObject = watchObject;
//# sourceMappingURL=rx-util.cjs.development.js.map
