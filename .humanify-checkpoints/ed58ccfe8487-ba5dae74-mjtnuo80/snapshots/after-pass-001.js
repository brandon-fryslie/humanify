!function (responseData, arrayIndex) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = arrayIndex() : "function" == typeof define && define.amd ? define(arrayIndex) : (responseData = "undefined" != typeof globalThis ? globalThis : responseData || self).axios = arrayIndex();
}(this, function () {
  "use strict";

  function e(t) {
    return e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
      return typeof e;
    } : function (e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
    }, e(t);
  }
  function t(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
  }
  function userAgent(e, t) {
    for (var n = 0; n < t.length; n++) {
      var r = t[n];
      r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, r.key, r);
    }
  }
  function mergeOptions(e, t, r) {
    return t && userAgent(e.prototype, t), r && userAgent(e, r), Object.defineProperty(e, "prototype", {
      writable: !1
    }), e;
  }
  function arrayIterator(e, t) {
    return function (e) {
      if (Array.isArray(e)) return e;
    }(e) || function (e, t) {
      var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
      if (null == n) return;
      var r,
        o,
        i = [],
        a = !0,
        s = !1;
      try {
        for (n = n.call(e); !(a = (r = n.next()).done) && (i.push(r.value), !t || i.length !== t); a = !0);
      } catch (e) {
        s = !0, o = e;
      } finally {
        try {
          a || null == n.return || n.return();
        } finally {
          if (s) throw o;
        }
      }
      return i;
    }(e, t) || function (e, t) {
      if (!e) return;
      if ("string" == typeof e) return index(e, t);
      var n = Object.prototype.toString.call(e).slice(8, -1);
      "Object" === n && e.constructor && (n = e.constructor.name);
      if ("Map" === n || "Set" === n) return Array.from(e);
      if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return index(e, t);
    }(e, t) || function () {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }();
  }
  function index(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
    return r;
  }
  function baseURLHandler(e, t) {
    return function () {
      return e.apply(t, arguments);
    };
  }
  var checkResponseProperty,
    timeoutDuration = Object.prototype.toString,
    convertToString = Object.getPrototypeOf,
    transformData = (checkResponseProperty = Object.create(null), function (e) {
      var t = timeoutDuration.call(e);
      return checkResponseProperty[t] || (checkResponseProperty[t] = t.slice(8, -1).toLowerCase());
    }),
    isArrayBuffer = function (e) {
      return e = e.toLowerCase(), function (t) {
        return transformData(t) === e;
      };
    },
    promiseChainIndex = function (t) {
      return function (n) {
        return e(n) === t;
      };
    },
    handleResponseHeaders = Array.isArray,
    getType = promiseChainIndex("undefined");
  var isArrayBufferType = isArrayBuffer("ArrayBuffer");
  var protocolScheme = promiseChainIndex("string"),
    isFunction = promiseChainIndex("function"),
    isNumber = promiseChainIndex("number"),
    isObject = function (t) {
      return null !== t && "object" === e(t);
    },
    isPlainObject = function (e) {
      if ("object" !== transformData(e)) return !1;
      var t = convertToString(e);
      return !(null !== t && t !== Object.prototype && null !== Object.getPrototypeOf(t) || Symbol.toStringTag in e || Symbol.iterator in e);
    },
    DateConstructor = isArrayBuffer("Date"),
    FileType = isArrayBuffer("File"),
    BlobConstructor = isArrayBuffer("Blob"),
    fileList = isArrayBuffer("FileList"),
    URLSearchParamsConstructor = isArrayBuffer("URLSearchParams");
  function forEachItem(t, n) {
    var r,
      o,
      i = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}).allOwnKeys,
      a = void 0 !== i && i;
    if (null != t) if ("object" !== e(t) && (t = [t]), handleResponseHeaders(t)) for (r = 0, o = t.length; r < o; r++) n.call(null, t[r], r, t);else {
      var s,
        u = a ? Object.getOwnPropertyNames(t) : Object.keys(t),
        c = u.length;
      for (r = 0; r < c; r++) s = u[r], n.call(null, t[s], s, t);
    }
  }
  function findKeyByCaseInsensitiveValue(e, t) {
    t = t.toLowerCase();
    for (var n, r = Object.keys(e), o = r.length; o-- > 0;) if (t === (n = r[o]).toLowerCase()) return n;
    return null;
  }
  var globalScope = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global,
    isNotGlobalContext = function (e) {
      return !getType(e) && e !== globalScope;
    };
  var isUint8ArraySupported,
    isUint8Array = (isUint8ArraySupported = "undefined" != typeof Uint8Array && convertToString(Uint8Array), function (e) {
      return isUint8ArraySupported && e instanceof isUint8ArraySupported;
    }),
    HTMLFormElementType = isArrayBuffer("HTMLFormElement"),
    _hasOwnProperty = function () {
      var e = Object.prototype.hasOwnProperty;
      return function (t, n) {
        return e.call(t, n);
      };
    }(),
    isRegExp = isArrayBuffer("RegExp"),
    definePropertyDescriptors = function (e, t) {
      var n = Object.getOwnPropertyDescriptors(e),
        r = {};
      forEachItem(n, function (n, o) {
        var i;
        !1 !== (i = t(n, o, e)) && (r[o] = i || n);
      }), Object.defineProperties(e, r);
    },
    lowercaseAlphabet = "abcdefghijklmnopqrstuvwxyz",
    DIGITS = "0123456789",
    CharacterSets = {
      DIGIT: DIGITS,
      ALPHA: lowercaseAlphabet,
      ALPHA_DIGIT: lowercaseAlphabet + lowercaseAlphabet.toUpperCase() + DIGITS
    };
  var isAsyncFunction = isArrayBuffer("AsyncFunction"),
    utilityFunctions = {
      isArray: handleResponseHeaders,
      isArrayBuffer: isArrayBufferType,
      isBuffer: function (e) {
        return null !== e && !getType(e) && null !== e.constructor && !getType(e.constructor) && isFunction(e.constructor.isBuffer) && e.constructor.isBuffer(e);
      },
      isFormData: function (e) {
        var t;
        return e && ("function" == typeof FormData && e instanceof FormData || isFunction(e.append) && ("formdata" === (t = transformData(e)) || "object" === t && isFunction(e.toString) && "[object FormData]" === e.toString()));
      },
      isArrayBufferView: function (e) {
        return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer && isArrayBufferType(e.buffer);
      },
      isString: protocolScheme,
      isNumber: isNumber,
      isBoolean: function (e) {
        return !0 === e || !1 === e;
      },
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: getType,
      isDate: DateConstructor,
      isFile: FileType,
      isBlob: BlobConstructor,
      isRegExp: isRegExp,
      isFunction: isFunction,
      isStream: function (e) {
        return isObject(e) && isFunction(e.pipe);
      },
      isURLSearchParams: URLSearchParamsConstructor,
      isTypedArray: isUint8Array,
      isFileList: fileList,
      forEach: forEachItem,
      merge: function e() {
        for (var t = (isNotGlobalContext(this) && this || {}).caseless, n = {}, r = function (r, o) {
            var i = t && findKeyByCaseInsensitiveValue(n, o) || o;
            isPlainObject(n[i]) && isPlainObject(r) ? n[i] = e(n[i], r) : isPlainObject(r) ? n[i] = e({}, r) : handleResponseHeaders(r) ? n[i] = r.slice() : n[i] = r;
          }, o = 0, i = arguments.length; o < i; o++) arguments[o] && forEachItem(arguments[o], r);
        return n;
      },
      extend: function (e, t, n) {
        return forEachItem(t, function (t, r) {
          n && isFunction(t) ? e[r] = baseURLHandler(t, n) : e[r] = t;
        }, {
          allOwnKeys: (arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}).allOwnKeys
        }), e;
      },
      trim: function (e) {
        return e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
      },
      stripBOM: function (e) {
        return 65279 === e.charCodeAt(0) && (e = e.slice(1)), e;
      },
      inherits: function (e, t, n, r) {
        e.prototype = Object.create(t.prototype, r), e.prototype.constructor = e, Object.defineProperty(e, "super", {
          value: t.prototype
        }), n && Object.assign(e.prototype, n);
      },
      toFlatObject: function (e, t, n, r) {
        var o,
          i,
          a,
          s = {};
        if (t = t || {}, null == e) return t;
        do {
          for (i = (o = Object.getOwnPropertyNames(e)).length; i-- > 0;) a = o[i], r && !r(a, e, t) || s[a] || (t[a] = e[a], s[a] = !0);
          e = !1 !== n && convertToString(e);
        } while (e && (!n || n(e, t)) && e !== Object.prototype);
        return t;
      },
      kindOf: transformData,
      kindOfTest: isArrayBuffer,
      endsWith: function (e, t, n) {
        e = String(e), (void 0 === n || n > e.length) && (n = e.length), n -= t.length;
        var r = e.indexOf(t, n);
        return -1 !== r && r === n;
      },
      toArray: function (e) {
        if (!e) return null;
        if (handleResponseHeaders(e)) return e;
        var t = e.length;
        if (!isNumber(t)) return null;
        for (var n = new Array(t); t-- > 0;) n[t] = e[t];
        return n;
      },
      forEachEntry: function (e, t) {
        for (var n, r = (e && e[Symbol.iterator]).call(e); (n = r.next()) && !n.done;) {
          var o = n.value;
          t.call(e, o[0], o[1]);
        }
      },
      matchAll: function (e, t) {
        for (var n, r = []; null !== (n = e.exec(t));) r.push(n);
        return r;
      },
      isHTMLForm: HTMLFormElementType,
      hasOwnProperty: _hasOwnProperty,
      hasOwnProp: _hasOwnProperty,
      reduceDescriptors: definePropertyDescriptors,
      freezeMethods: function (e) {
        definePropertyDescriptors(e, function (t, n) {
          if (isFunction(e) && -1 !== ["arguments", "caller", "callee"].indexOf(n)) return !1;
          var r = e[n];
          isFunction(r) && (t.enumerable = !1, "writable" in t ? t.writable = !1 : t.set || (t.set = function () {
            throw Error("Can not rewrite read-only method '" + n + "'");
          }));
        });
      },
      toObjectSet: function (e, t) {
        var n = {},
          r = function (e) {
            e.forEach(function (e) {
              n[e] = !0;
            });
          };
        return handleResponseHeaders(e) ? r(e) : r(String(e).split(t)), n;
      },
      toCamelCase: function (e) {
        return e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (e, t, n) {
          return t.toUpperCase() + n;
        });
      },
      noop: function () {},
      toFiniteNumber: function (e, t) {
        return e = +e, Number.isFinite(e) ? e : t;
      },
      findKey: findKeyByCaseInsensitiveValue,
      global: globalScope,
      isContextDefined: isNotGlobalContext,
      ALPHABET: CharacterSets,
      generateString: function () {
        for (var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 16, t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : CharacterSets.ALPHA_DIGIT, n = "", r = t.length; e--;) n += t[Math.random() * r | 0];
        return n;
      },
      isSpecCompliantForm: function (e) {
        return !!(e && isFunction(e.append) && "FormData" === e[Symbol.toStringTag] && e[Symbol.iterator]);
      },
      toJSONObject: function (e) {
        var t = new Array(10);
        return function e(n, r) {
          if (isObject(n)) {
            if (t.indexOf(n) >= 0) return;
            if (!("toJSON" in n)) {
              t[r] = n;
              var o = handleResponseHeaders(n) ? [] : {};
              return forEachItem(n, function (t, n) {
                var i = e(t, r + 1);
                !getType(i) && (o[n] = i);
              }), t[r] = void 0, o;
            }
          }
          return n;
        }(e, 0);
      },
      isAsyncFn: isAsyncFunction,
      isThenable: function (e) {
        return e && (isObject(e) || isFunction(e)) && isFunction(e.then) && isFunction(e.catch);
      }
    };
  function AxiosError(e, t, n, r, o) {
    Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = e, this.name = "AxiosError", t && (this.code = t), n && (this.config = n), r && (this.request = r), o && (this.response = o);
  }
  utilityFunctions.inherits(AxiosError, Error, {
    toJSON: function () {
      return {
        message: this.message,
        name: this.name,
        description: this.description,
        number: this.number,
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        config: utilityFunctions.toJSONObject(this.config),
        code: this.code,
        status: this.response && this.response.status ? this.response.status : null
      };
    }
  });
  var ErrorCodes = AxiosError.prototype,
    _ErrorCodes = {};
  ["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(function (e) {
    _ErrorCodes[e] = {
      value: e
    };
  }), Object.defineProperties(AxiosError, _ErrorCodes), Object.defineProperty(ErrorCodes, "isAxiosError", {
    value: !0
  }), AxiosError.from = function (e, t, n, r, o, i) {
    var a = Object.create(ErrorCodes);
    return utilityFunctions.toFlatObject(e, a, function (e) {
      return e !== Error.prototype;
    }, function (e) {
      return "isAxiosError" !== e;
    }), AxiosError.call(a, e.message, t, n, r, o), a.cause = e, a.name = e.name, i && Object.assign(a, i), a;
  };
  function isObjectOrArray(e) {
    return utilityFunctions.isPlainObject(e) || utilityFunctions.isArray(e);
  }
  function removeArraySuffix(e) {
    return utilityFunctions.endsWith(e, "[]") ? e.slice(0, -2) : e;
  }
  function concatAndFormatKeys(e, t, n) {
    return e ? e.concat(t).map(function (e, t) {
      return e = removeArraySuffix(e), !n && t ? "[" + e + "]" : e;
    }).join(n ? "." : "") : t;
  }
  var isMetaPropertyMap = utilityFunctions.toFlatObject(utilityFunctions, {}, null, function (e) {
    return /^is[A-Z]/.test(e);
  });
  function mergeFormData(t, n, r) {
    if (!utilityFunctions.isObject(t)) throw new TypeError("target must be an object");
    n = n || new FormData();
    var o = (r = utilityFunctions.toFlatObject(r, {
        metaTokens: !0,
        dots: !1,
        indexes: !1
      }, !1, function (e, t) {
        return !utilityFunctions.isUndefined(t[e]);
      })).metaTokens,
      i = r.visitor || f,
      a = r.dots,
      s = r.indexes,
      u = (r.Blob || "undefined" != typeof Blob && Blob) && utilityFunctions.isSpecCompliantForm(n);
    if (!utilityFunctions.isFunction(i)) throw new TypeError("visitor must be a function");
    function c(e) {
      if (null === e) return "";
      if (utilityFunctions.isDate(e)) return e.toISOString();
      if (!u && utilityFunctions.isBlob(e)) throw new AxiosError("Blob is not supported. Use a Buffer instead.");
      return utilityFunctions.isArrayBuffer(e) || utilityFunctions.isTypedArray(e) ? u && "function" == typeof Blob ? new Blob([e]) : Buffer.from(e) : e;
    }
    function f(t, r, i) {
      var u = t;
      if (t && !i && "object" === e(t)) if (utilityFunctions.endsWith(r, "{}")) r = o ? r : r.slice(0, -2), t = JSON.stringify(t);else if (utilityFunctions.isArray(t) && function (e) {
        return utilityFunctions.isArray(e) && !e.some(isObjectOrArray);
      }(t) || (utilityFunctions.isFileList(t) || utilityFunctions.endsWith(r, "[]")) && (u = utilityFunctions.toArray(t))) return r = removeArraySuffix(r), u.forEach(function (e, t) {
        !utilityFunctions.isUndefined(e) && null !== e && n.append(!0 === s ? concatAndFormatKeys([r], t, a) : null === s ? r : r + "[]", c(e));
      }), !1;
      return !!isObjectOrArray(t) || (n.append(concatAndFormatKeys(i, r, a), c(t)), !1);
    }
    var l = [],
      d = Object.assign(isMetaPropertyMap, {
        defaultVisitor: f,
        convertValue: c,
        isVisitable: isObjectOrArray
      });
    if (!utilityFunctions.isObject(t)) throw new TypeError("data must be an object");
    return function e(t, r) {
      if (!utilityFunctions.isUndefined(t)) {
        if (-1 !== l.indexOf(t)) throw Error("Circular reference detected in " + r.join("."));
        l.push(t), utilityFunctions.forEach(t, function (t, o) {
          !0 === (!(utilityFunctions.isUndefined(t) || null === t) && i.call(n, t, utilityFunctions.isString(o) ? o.trim() : o, r, d)) && e(t, r ? r.concat(o) : [o]);
        }), l.pop();
      }
    }(t), n;
  }
  function encodeURIComponentCustom(e) {
    var t = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0"
    };
    return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function (e) {
      return t[e];
    });
  }
  function KeyValuePairHandler(e, t) {
    this._pairs = [], e && mergeFormData(e, this, t);
  }
  var UrlEncoder = KeyValuePairHandler.prototype;
  function decodeURIComponentWithCustomMappings(e) {
    return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  function appendQueryParameters(e, t, n) {
    if (!t) return e;
    var r,
      o = n && n.encode || decodeURIComponentWithCustomMappings,
      i = n && n.serialize;
    if (r = i ? i(t, n) : utilityFunctions.isURLSearchParams(t) ? t.toString() : new KeyValuePairHandler(t, n).toString(o)) {
      var a = e.indexOf("#");
      -1 !== a && (e = e.slice(0, a)), e += (-1 === e.indexOf("?") ? "?" : "&") + r;
    }
    return e;
  }
  UrlEncoder.append = function (e, t) {
    this._pairs.push([e, t]);
  }, UrlEncoder.toString = function (e) {
    var t = e ? function (t) {
      return e.call(this, t, encodeURIComponentCustom);
    } : encodeURIComponentCustom;
    return this._pairs.map(function (e) {
      return t(e[0]) + "=" + t(e[1]);
    }, "").join("&");
  };
  var errorHandler,
    createHandler = function () {
      function e() {
        t(this, e), this.handlers = [];
      }
      return mergeOptions(e, [{
        key: "use",
        value: function (e, t, n) {
          return this.handlers.push({
            fulfilled: e,
            rejected: t,
            synchronous: !!n && n.synchronous,
            runWhen: n ? n.runWhen : null
          }), this.handlers.length - 1;
        }
      }, {
        key: "eject",
        value: function (e) {
          this.handlers[e] && (this.handlers[e] = null);
        }
      }, {
        key: "clear",
        value: function () {
          this.handlers && (this.handlers = []);
        }
      }, {
        key: "forEach",
        value: function (e) {
          utilityFunctions.forEach(this.handlers, function (t) {
            null !== t && e(t);
          });
        }
      }]), e;
    }(),
    jsonParsingOptions = {
      silentJSONParsing: !0,
      forcedJSONParsing: !0,
      clarifyTimeoutError: !1
    },
    browserEnvironment = {
      isBrowser: !0,
      classes: {
        URLSearchParams: "undefined" != typeof URLSearchParams ? URLSearchParams : KeyValuePairHandler,
        FormData: "undefined" != typeof FormData ? FormData : null,
        Blob: "undefined" != typeof Blob ? Blob : null
      },
      isStandardBrowserEnv: ("undefined" == typeof navigator || "ReactNative" !== (errorHandler = navigator.product) && "NativeScript" !== errorHandler && "NS" !== errorHandler) && "undefined" != typeof window && "undefined" != typeof document,
      isStandardBrowserWebWorkerEnv: "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && "function" == typeof self.importScripts,
      protocols: ["http", "https", "file", "blob", "url", "data"]
    };
  function processArrayElement(e) {
    function t(e, n, r, o) {
      var i = e[o++],
        a = Number.isFinite(+i),
        s = o >= e.length;
      return i = !i && utilityFunctions.isArray(r) ? r.length : i, s ? (utilityFunctions.hasOwnProp(r, i) ? r[i] = [r[i], n] : r[i] = n, !a) : (r[i] && utilityFunctions.isObject(r[i]) || (r[i] = []), t(e, n, r[i], o) && utilityFunctions.isArray(r[i]) && (r[i] = function (e) {
        var t,
          n,
          r = {},
          o = Object.keys(e),
          i = o.length;
        for (t = 0; t < i; t++) r[n = o[t]] = e[n];
        return r;
      }(r[i])), !a);
    }
    if (utilityFunctions.isFormData(e) && utilityFunctions.isFunction(e.entries)) {
      var n = {};
      return utilityFunctions.forEachEntry(e, function (e, r) {
        t(function (e) {
          return utilityFunctions.matchAll(/\w+|\[(\w*)]/g, e).map(function (e) {
            return "[]" === e[0] ? "" : e[1] || e[0];
          });
        }(e), r, n, 0);
      }), n;
    }
    return null;
  }
  var formDataAdapter = {
    transitional: jsonParsingOptions,
    adapter: ["xhr", "http"],
    transformRequest: [function (e, t) {
      var n,
        r = t.getContentType() || "",
        o = r.indexOf("application/json") > -1,
        i = utilityFunctions.isObject(e);
      if (i && utilityFunctions.isHTMLForm(e) && (e = new FormData(e)), utilityFunctions.isFormData(e)) return o && o ? JSON.stringify(processArrayElement(e)) : e;
      if (utilityFunctions.isArrayBuffer(e) || utilityFunctions.isBuffer(e) || utilityFunctions.isStream(e) || utilityFunctions.isFile(e) || utilityFunctions.isBlob(e)) return e;
      if (utilityFunctions.isArrayBufferView(e)) return e.buffer;
      if (utilityFunctions.isURLSearchParams(e)) return t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), e.toString();
      if (i) {
        if (r.indexOf("application/x-www-form-urlencoded") > -1) return function (e, t) {
          return mergeFormData(e, new browserEnvironment.classes.URLSearchParams(), Object.assign({
            visitor: function (e, t, n, r) {
              return browserEnvironment.isNode && utilityFunctions.isBuffer(e) ? (this.append(t, e.toString("base64")), !1) : r.defaultVisitor.apply(this, arguments);
            }
          }, t));
        }(e, this.formSerializer).toString();
        if ((n = utilityFunctions.isFileList(e)) || r.indexOf("multipart/form-data") > -1) {
          var a = this.env && this.env.FormData;
          return mergeFormData(n ? {
            "files[]": e
          } : e, a && new a(), this.formSerializer);
        }
      }
      return i || o ? (t.setContentType("application/json", !1), function (e, t, n) {
        if (utilityFunctions.isString(e)) try {
          return (t || JSON.parse)(e), utilityFunctions.trim(e);
        } catch (e) {
          if ("SyntaxError" !== e.name) throw e;
        }
        return (n || JSON.stringify)(e);
      }(e)) : e;
    }],
    transformResponse: [function (e) {
      var t = this.transitional || formDataAdapter.transitional,
        n = t && t.forcedJSONParsing,
        r = "json" === this.responseType;
      if (e && utilityFunctions.isString(e) && (n && !this.responseType || r)) {
        var o = !(t && t.silentJSONParsing) && r;
        try {
          return JSON.parse(e);
        } catch (e) {
          if (o) {
            if ("SyntaxError" === e.name) throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
            throw e;
          }
        }
      }
      return e;
    }],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: browserEnvironment.classes.FormData,
      Blob: browserEnvironment.classes.Blob
    },
    validateStatus: function (e) {
      return e >= 200 && e < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": void 0
      }
    }
  };
  utilityFunctions.forEach(["delete", "get", "head", "post", "put", "patch"], function (e) {
    formDataAdapter.headers[e] = {};
  });
  var httpRequestConfig = formDataAdapter,
    allowedHeaders = utilityFunctions.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]),
    INTERNALS_SYMBOL = Symbol("internals");
  function normalizeString(e) {
    return e && String(e).trim().toLowerCase();
  }
  function normalizeInput(e) {
    return !1 === e || null == e ? e : utilityFunctions.isArray(e) ? e.map(normalizeInput) : String(e);
  }
  function stringContainsPattern(e, t, n, r, o) {
    return utilityFunctions.isFunction(r) ? r.call(this, t, n) : (o && (t = n), utilityFunctions.isString(t) ? utilityFunctions.isString(r) ? -1 !== t.indexOf(r) : utilityFunctions.isRegExp(r) ? r.test(t) : void 0 : void 0);
  }
  var headerSetter = function () {
    function e(n) {
      t(this, e), n && this.set(n);
    }
    return mergeOptions(e, [{
      key: "set",
      value: function (e, t, n) {
        var r = this;
        function o(e, t, n) {
          var o = normalizeString(t);
          if (!o) throw new Error("header name must be a non-empty string");
          var i = utilityFunctions.findKey(r, o);
          (!i || void 0 === r[i] || !0 === n || void 0 === n && !1 !== r[i]) && (r[i || t] = normalizeInput(e));
        }
        var i,
          a,
          s,
          u,
          c,
          f = function (e, t) {
            return utilityFunctions.forEach(e, function (e, n) {
              return o(e, n, t);
            });
          };
        return utilityFunctions.isPlainObject(e) || e instanceof this.constructor ? f(e, t) : utilityFunctions.isString(e) && (e = e.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim()) ? f((c = {}, (i = e) && i.split("\n").forEach(function (e) {
          u = e.indexOf(":"), a = e.substring(0, u).trim().toLowerCase(), s = e.substring(u + 1).trim(), !a || c[a] && allowedHeaders[a] || ("set-cookie" === a ? c[a] ? c[a].push(s) : c[a] = [s] : c[a] = c[a] ? c[a] + ", " + s : s);
        }), c), t) : null != e && o(t, e, n), this;
      }
    }, {
      key: "get",
      value: function (e, t) {
        if (e = normalizeString(e)) {
          var n = utilityFunctions.findKey(this, e);
          if (n) {
            var r = this[n];
            if (!t) return r;
            if (!0 === t) return function (e) {
              for (var t, n = Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; t = r.exec(e);) n[t[1]] = t[2];
              return n;
            }(r);
            if (utilityFunctions.isFunction(t)) return t.call(this, r, n);
            if (utilityFunctions.isRegExp(t)) return t.exec(r);
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
    }, {
      key: "has",
      value: function (e, t) {
        if (e = normalizeString(e)) {
          var n = utilityFunctions.findKey(this, e);
          return !(!n || void 0 === this[n] || t && !stringContainsPattern(0, this[n], n, t));
        }
        return !1;
      }
    }, {
      key: "delete",
      value: function (e, t) {
        var n = this,
          r = !1;
        function o(e) {
          if (e = normalizeString(e)) {
            var o = utilityFunctions.findKey(n, e);
            !o || t && !stringContainsPattern(0, n[o], o, t) || (delete n[o], r = !0);
          }
        }
        return utilityFunctions.isArray(e) ? e.forEach(o) : o(e), r;
      }
    }, {
      key: "clear",
      value: function (e) {
        for (var t = Object.keys(this), n = t.length, r = !1; n--;) {
          var o = t[n];
          e && !stringContainsPattern(0, this[o], o, e, !0) || (delete this[o], r = !0);
        }
        return r;
      }
    }, {
      key: "normalize",
      value: function (e) {
        var t = this,
          n = {};
        return utilityFunctions.forEach(this, function (r, o) {
          var i = utilityFunctions.findKey(n, o);
          if (i) return t[i] = normalizeInput(r), void delete t[o];
          var a = e ? function (e) {
            return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function (e, t, n) {
              return t.toUpperCase() + n;
            });
          }(o) : String(o).trim();
          a !== o && delete t[o], t[a] = normalizeInput(r), n[a] = !0;
        }), this;
      }
    }, {
      key: "concat",
      value: function () {
        for (var e, t = arguments.length, n = new Array(t), r = 0; r < t; r++) n[r] = arguments[r];
        return (e = this.constructor).concat.apply(e, [this].concat(n));
      }
    }, {
      key: "toJSON",
      value: function (e) {
        var t = Object.create(null);
        return utilityFunctions.forEach(this, function (n, r) {
          null != n && !1 !== n && (t[r] = e && utilityFunctions.isArray(n) ? n.join(", ") : n);
        }), t;
      }
    }, {
      key: Symbol.iterator,
      value: function () {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }
    }, {
      key: "toString",
      value: function () {
        return Object.entries(this.toJSON()).map(function (e) {
          var t = arrayIterator(e, 2);
          return t[0] + ": " + t[1];
        }).join("\n");
      }
    }, {
      key: Symbol.toStringTag,
      get: function () {
        return "AxiosHeaders";
      }
    }], [{
      key: "from",
      value: function (e) {
        return e instanceof this ? e : new this(e);
      }
    }, {
      key: "concat",
      value: function (e) {
        for (var t = new this(e), n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) r[o - 1] = arguments[o];
        return r.forEach(function (e) {
          return t.set(e);
        }), t;
      }
    }, {
      key: "accessor",
      value: function (e) {
        var t = (this[INTERNALS_SYMBOL] = this[INTERNALS_SYMBOL] = {
            accessors: {}
          }).accessors,
          n = this.prototype;
        function r(e) {
          var r = normalizeString(e);
          t[r] || (!function (e, t) {
            var n = utilityFunctions.toCamelCase(" " + t);
            ["get", "set", "has"].forEach(function (r) {
              Object.defineProperty(e, r + n, {
                value: function (e, n, o) {
                  return this[r].call(this, t, e, n, o);
                },
                configurable: !0
              });
            });
          }(n, e), t[r] = !0);
        }
        return utilityFunctions.isArray(e) ? e.forEach(r) : r(e), this;
      }
    }]), e;
  }();
  headerSetter.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]), utilityFunctions.reduceDescriptors(headerSetter.prototype, function (e, t) {
    var n = e.value,
      r = t[0].toUpperCase() + t.slice(1);
    return {
      get: function () {
        return n;
      },
      set: function (e) {
        this[r] = e;
      }
    };
  }), utilityFunctions.freezeMethods(headerSetter);
  var dataExtractor = headerSetter;
  function processResponse(e, t) {
    var n = this || httpRequestConfig,
      r = t || n,
      o = dataExtractor.from(r.headers),
      i = r.data;
    return utilityFunctions.forEach(e, function (e) {
      i = e.call(n, i, o.normalize(), t ? t.status : void 0);
    }), o.normalize(), i;
  }
  function isCancellationError(e) {
    return !(!e || !e.__CANCEL__);
  }
  function CanceledError(e, t, n) {
    AxiosError.call(this, null == e ? "canceled" : e, AxiosError.ERR_CANCELED, t, n), this.name = "CanceledError";
  }
  utilityFunctions.inherits(CanceledError, AxiosError, {
    __CANCEL__: !0
  });
  var cookieStorage = browserEnvironment.isStandardBrowserEnv ? {
    write: function (e, t, n, r, o, i) {
      var a = [];
      a.push(e + "=" + encodeURIComponent(t)), utilityFunctions.isNumber(n) && a.push("expires=" + new Date(n).toGMTString()), utilityFunctions.isString(r) && a.push("path=" + r), utilityFunctions.isString(o) && a.push("domain=" + o), !0 === i && a.push("secure"), document.cookie = a.join("; ");
    },
    read: function (e) {
      var t = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)"));
      return t ? decodeURIComponent(t[3]) : null;
    },
    remove: function (e) {
      this.write(e, "", Date.now() - 864e5);
    }
  } : {
    write: function () {},
    read: function () {
      return null;
    },
    remove: function () {}
  };
  function combineUrlPath(e, t) {
    return e && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(t) ? function (e, t) {
      return t ? e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "") : e;
    }(e, t) : t;
  }
  var isStandardBrowserEnvironment = browserEnvironment.isStandardBrowserEnv ? function () {
    var e,
      t = /(msie|trident)/i.test(navigator.userAgent),
      n = document.createElement("a");
    function r(e) {
      var r = e;
      return t && (n.setAttribute("href", r), r = n.href), n.setAttribute("href", r), {
        href: n.href,
        protocol: n.protocol ? n.protocol.replace(/:$/, "") : "",
        host: n.host,
        search: n.search ? n.search.replace(/^\?/, "") : "",
        hash: n.hash ? n.hash.replace(/^#/, "") : "",
        hostname: n.hostname,
        port: n.port,
        pathname: "/" === n.pathname.charAt(0) ? n.pathname : "/" + n.pathname
      };
    }
    return e = r(window.location.href), function (t) {
      var n = utilityFunctions.isString(t) ? r(t) : t;
      return n.protocol === e.protocol && n.host === e.host;
    };
  }() : function () {
    return !0;
  };
  function rateLimiter(e, t) {
    var n = 0,
      r = function (e, t) {
        e = e || 10;
        var n,
          r = new Array(e),
          o = new Array(e),
          i = 0,
          a = 0;
        return t = void 0 !== t ? t : 1e3, function (s) {
          var u = Date.now(),
            c = o[a];
          n || (n = u), r[i] = s, o[i] = u;
          for (var f = a, l = 0; f !== i;) l += r[f++], f %= e;
          if ((i = (i + 1) % e) === a && (a = (a + 1) % e), !(u - n < t)) {
            var d = c && u - c;
            return d ? Math.round(1e3 * l / d) : void 0;
          }
        };
      }(50, 250);
    return function (o) {
      var i = o.loaded,
        a = o.lengthComputable ? o.total : void 0,
        s = i - n,
        u = r(s);
      n = i;
      var c = {
        loaded: i,
        total: a,
        progress: a ? i / a : void 0,
        bytes: s,
        rate: u || void 0,
        estimated: u && a && i <= a ? (a - i) / u : void 0,
        event: o
      };
      c[t ? "download" : "upload"] = !0, e(c);
    };
  }
  var httpRequestHandler = {
    http: null,
    xhr: "undefined" != typeof XMLHttpRequest && function (e) {
      return new Promise(function (t, n) {
        var r,
          o,
          i = e.data,
          a = dataExtractor.from(e.headers).normalize(),
          s = e.responseType;
        function u() {
          e.cancelToken && e.cancelToken.unsubscribe(r), e.signal && e.signal.removeEventListener("abort", r);
        }
        utilityFunctions.isFormData(i) && (browserEnvironment.isStandardBrowserEnv || browserEnvironment.isStandardBrowserWebWorkerEnv ? a.setContentType(!1) : a.getContentType(/^\s*multipart\/form-data/) ? utilityFunctions.isString(o = a.getContentType()) && a.setContentType(o.replace(/^\s*(multipart\/form-data);+/, "$1")) : a.setContentType("multipart/form-data"));
        var c = new XMLHttpRequest();
        if (e.auth) {
          var f = e.auth.username || "",
            l = e.auth.password ? unescape(encodeURIComponent(e.auth.password)) : "";
          a.set("Authorization", "Basic " + btoa(f + ":" + l));
        }
        var d = combineUrlPath(e.baseURL, e.url);
        function p() {
          if (c) {
            var r = dataExtractor.from("getAllResponseHeaders" in c && c.getAllResponseHeaders());
            !function (e, t, n) {
              var r = n.config.validateStatus;
              n.status && r && !r(n.status) ? t(new AxiosError("Request failed with status code " + n.status, [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4], n.config, n.request, n)) : e(n);
            }(function (e) {
              t(e), u();
            }, function (e) {
              n(e), u();
            }, {
              data: s && "text" !== s && "json" !== s ? c.response : c.responseText,
              status: c.status,
              statusText: c.statusText,
              headers: r,
              config: e,
              request: c
            }), c = null;
          }
        }
        if (c.open(e.method.toUpperCase(), appendQueryParameters(d, e.params, e.paramsSerializer), !0), c.timeout = e.timeout, "onloadend" in c ? c.onloadend = p : c.onreadystatechange = function () {
          c && 4 === c.readyState && (0 !== c.status || c.responseURL && 0 === c.responseURL.indexOf("file:")) && setTimeout(p);
        }, c.onabort = function () {
          c && (n(new AxiosError("Request aborted", AxiosError.ECONNABORTED, e, c)), c = null);
        }, c.onerror = function () {
          n(new AxiosError("Network Error", AxiosError.ERR_NETWORK, e, c)), c = null;
        }, c.ontimeout = function () {
          var t = e.timeout ? "timeout of " + e.timeout + "ms exceeded" : "timeout exceeded",
            r = e.transitional || jsonParsingOptions;
          e.timeoutErrorMessage && (t = e.timeoutErrorMessage), n(new AxiosError(t, r.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED, e, c)), c = null;
        }, browserEnvironment.isStandardBrowserEnv) {
          var h = isStandardBrowserEnvironment(d) && e.xsrfCookieName && cookieStorage.read(e.xsrfCookieName);
          h && a.set(e.xsrfHeaderName, h);
        }
        void 0 === i && a.setContentType(null), "setRequestHeader" in c && utilityFunctions.forEach(a.toJSON(), function (e, t) {
          c.setRequestHeader(t, e);
        }), utilityFunctions.isUndefined(e.withCredentials) || (c.withCredentials = !!e.withCredentials), s && "json" !== s && (c.responseType = e.responseType), "function" == typeof e.onDownloadProgress && c.addEventListener("progress", rateLimiter(e.onDownloadProgress, !0)), "function" == typeof e.onUploadProgress && c.upload && c.upload.addEventListener("progress", rateLimiter(e.onUploadProgress)), (e.cancelToken || e.signal) && (r = function (t) {
          c && (n(!t || t.type ? new CanceledError(null, e, c) : t), c.abort(), c = null);
        }, e.cancelToken && e.cancelToken.subscribe(r), e.signal && (e.signal.aborted ? r() : e.signal.addEventListener("abort", r)));
        var m,
          y = (m = /^([-+\w]{1,25})(:?\/\/|:)/.exec(d)) && m[1] || "";
        y && -1 === browserEnvironment.protocols.indexOf(y) ? n(new AxiosError("Unsupported protocol " + y + ":", AxiosError.ERR_BAD_REQUEST, e)) : c.send(i || null);
      });
    }
  };
  utilityFunctions.forEach(httpRequestHandler, function (e, t) {
    if (e) {
      try {
        Object.defineProperty(e, "name", {
          value: t
        });
      } catch (e) {}
      Object.defineProperty(e, "adapterName", {
        value: t
      });
    }
  });
  var formatErrorMessage = function (e) {
      return "- ".concat(e);
    },
    isValidAdapter = function (e) {
      return utilityFunctions.isFunction(e) || null === e || !1 === e;
    },
    getAdapter = function (e) {
      for (var t, n, r = (e = utilityFunctions.isArray(e) ? e : [e]).length, i = {}, a = 0; a < r; a++) {
        var s = void 0;
        if (n = t = e[a], !isValidAdapter(t) && void 0 === (n = httpRequestHandler[(s = String(t)).toLowerCase()])) throw new AxiosError("Unknown adapter '".concat(s, "'"));
        if (n) break;
        i[s || "#" + a] = n;
      }
      if (!n) {
        var u = Object.entries(i).map(function (e) {
          var t = arrayIterator(e, 2),
            n = t[0],
            r = t[1];
          return "adapter ".concat(n, " ") + (!1 === r ? "is not supported by the environment" : "is not available in the build");
        });
        throw new AxiosError("There is no suitable adapter to dispatch the request " + (r ? u.length > 1 ? "since :\n" + u.map(formatErrorMessage).join("\n") : " " + formatErrorMessage(u[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
      }
      return n;
    };
  function validateRequestCancellation(e) {
    if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted) throw new CanceledError(null, e);
  }
  function processRequest(e) {
    return validateRequestCancellation(e), e.headers = dataExtractor.from(e.headers), e.data = processResponse.call(e, e.transformRequest), -1 !== ["post", "put", "patch"].indexOf(e.method) && e.headers.setContentType("application/x-www-form-urlencoded", !1), getAdapter(e.adapter || httpRequestConfig.adapter)(e).then(function (t) {
      return validateRequestCancellation(e), t.data = processResponse.call(e, e.transformResponse, t), t.headers = dataExtractor.from(t.headers), t;
    }, function (t) {
      return isCancellationError(t) || (validateRequestCancellation(e), t && t.response && (t.response.data = processResponse.call(e, e.transformResponse, t.response), t.response.headers = dataExtractor.from(t.response.headers))), Promise.reject(t);
    });
  }
  var convertToJSON = function (e) {
    return e instanceof dataExtractor ? e.toJSON() : e;
  };
  function _mergeOptions(e, t) {
    t = t || {};
    var n = {};
    function r(e, t, n) {
      return utilityFunctions.isPlainObject(e) && utilityFunctions.isPlainObject(t) ? utilityFunctions.merge.call({
        caseless: n
      }, e, t) : utilityFunctions.isPlainObject(t) ? utilityFunctions.merge({}, t) : utilityFunctions.isArray(t) ? t.slice() : t;
    }
    function o(e, t, n) {
      return utilityFunctions.isUndefined(t) ? utilityFunctions.isUndefined(e) ? void 0 : r(void 0, e, n) : r(e, t, n);
    }
    function i(e, t) {
      if (!utilityFunctions.isUndefined(t)) return r(void 0, t);
    }
    function a(e, t) {
      return utilityFunctions.isUndefined(t) ? utilityFunctions.isUndefined(e) ? void 0 : r(void 0, e) : r(void 0, t);
    }
    function s(n, o, i) {
      return i in t ? r(n, o) : i in e ? r(void 0, n) : void 0;
    }
    var u = {
      url: i,
      method: i,
      data: i,
      baseURL: a,
      transformRequest: a,
      transformResponse: a,
      paramsSerializer: a,
      timeout: a,
      timeoutMessage: a,
      withCredentials: a,
      adapter: a,
      responseType: a,
      xsrfCookieName: a,
      xsrfHeaderName: a,
      onUploadProgress: a,
      onDownloadProgress: a,
      decompress: a,
      maxContentLength: a,
      maxBodyLength: a,
      beforeRedirect: a,
      transport: a,
      httpAgent: a,
      httpsAgent: a,
      cancelToken: a,
      socketPath: a,
      responseEncoding: a,
      validateStatus: s,
      headers: function (e, t) {
        return o(convertToJSON(e), convertToJSON(t), !0);
      }
    };
    return utilityFunctions.forEach(Object.keys(Object.assign({}, e, t)), function (r) {
      var i = u[r] || o,
        a = i(e[r], t[r], r);
      utilityFunctions.isUndefined(a) && i !== s || (n[r] = a);
    }), n;
  }
  var axiosVersion = "1.6.0",
    typeCheckers = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(function (t, n) {
    typeCheckers[t] = function (r) {
      return e(r) === t || "a" + (n < 1 ? "n " : " ") + t;
    };
  });
  var deprecatedOptionsTracker = {};
  typeCheckers.transitional = function (e, t, n) {
    function r(e, t) {
      return "[Axios v1.6.0] Transitional option '" + e + "'" + t + (n ? ". " + n : "");
    }
    return function (n, o, i) {
      if (!1 === e) throw new AxiosError(r(o, " has been removed" + (t ? " in " + t : "")), AxiosError.ERR_DEPRECATED);
      return t && !deprecatedOptionsTracker[o] && (deprecatedOptionsTracker[o] = !0, console.warn(r(o, " has been deprecated since v" + t + " and will be removed in the near future"))), !e || e(n, o, i);
    };
  };
  var optionValidator = {
      assertOptions: function (t, n, r) {
        if ("object" !== e(t)) throw new AxiosError("options must be an object", AxiosError.ERR_BAD_OPTION_VALUE);
        for (var o = Object.keys(t), i = o.length; i-- > 0;) {
          var a = o[i],
            s = n[a];
          if (s) {
            var u = t[a],
              c = void 0 === u || s(u, a, t);
            if (!0 !== c) throw new AxiosError("option " + a + " must be " + c, AxiosError.ERR_BAD_OPTION_VALUE);
          } else if (!0 !== r) throw new AxiosError("Unknown option " + a, AxiosError.ERR_BAD_OPTION);
        }
      },
      validators: typeCheckers
    },
    validators = optionValidator.validators,
    createInterceptor = function () {
      function e(n) {
        t(this, e), this.defaults = n, this.interceptors = {
          request: new createHandler(),
          response: new createHandler()
        };
      }
      return mergeOptions(e, [{
        key: "request",
        value: function (e, t) {
          "string" == typeof e ? (t = t || {}).url = e : t = e || {};
          var n = t = _mergeOptions(this.defaults, t),
            r = n.transitional,
            o = n.paramsSerializer,
            i = n.headers;
          void 0 !== r && optionValidator.assertOptions(r, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, !1), null != o && (utilityFunctions.isFunction(o) ? t.paramsSerializer = {
            serialize: o
          } : optionValidator.assertOptions(o, {
            encode: validators.function,
            serialize: validators.function
          }, !0)), t.method = (t.method || this.defaults.method || "get").toLowerCase();
          var a = i && utilityFunctions.merge(i.common, i[t.method]);
          i && utilityFunctions.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (e) {
            delete i[e];
          }), t.headers = dataExtractor.concat(a, i);
          var s = [],
            u = !0;
          this.interceptors.request.forEach(function (e) {
            "function" == typeof e.runWhen && !1 === e.runWhen(t) || (u = u && e.synchronous, s.unshift(e.fulfilled, e.rejected));
          });
          var c,
            f = [];
          this.interceptors.response.forEach(function (e) {
            f.push(e.fulfilled, e.rejected);
          });
          var l,
            d = 0;
          if (!u) {
            var p = [processRequest.bind(this), void 0];
            for (p.unshift.apply(p, s), p.push.apply(p, f), l = p.length, c = Promise.resolve(t); d < l;) c = c.then(p[d++], p[d++]);
            return c;
          }
          l = s.length;
          var h = t;
          for (d = 0; d < l;) {
            var m = s[d++],
              y = s[d++];
            try {
              h = m(h);
            } catch (e) {
              y.call(this, e);
              break;
            }
          }
          try {
            c = processRequest.call(this, h);
          } catch (e) {
            return Promise.reject(e);
          }
          for (d = 0, l = f.length; d < l;) c = c.then(f[d++], f[d++]);
          return c;
        }
      }, {
        key: "getUri",
        value: function (e) {
          return appendQueryParameters(combineUrlPath((e = _mergeOptions(this.defaults, e)).baseURL, e.url), e.params, e.paramsSerializer);
        }
      }]), e;
    }();
  utilityFunctions.forEach(["delete", "get", "head", "options"], function (e) {
    createInterceptor.prototype[e] = function (t, n) {
      return this.request(_mergeOptions(n || {}, {
        method: e,
        url: t,
        data: (n || {}).data
      }));
    };
  }), utilityFunctions.forEach(["post", "put", "patch"], function (e) {
    function t(t) {
      return function (n, r, o) {
        return this.request(_mergeOptions(o || {}, {
          method: e,
          headers: t ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: n,
          data: r
        }));
      };
    }
    createInterceptor.prototype[e] = t(), createInterceptor.prototype[e + "Form"] = t(!0);
  });
  var HttpRequestHandler = createInterceptor,
    ExecutorFunction = function () {
      function e(n) {
        if (t(this, e), "function" != typeof n) throw new TypeError("executor must be a function.");
        var r;
        this.promise = new Promise(function (e) {
          r = e;
        });
        var o = this;
        this.promise.then(function (e) {
          if (o._listeners) {
            for (var t = o._listeners.length; t-- > 0;) o._listeners[t](e);
            o._listeners = null;
          }
        }), this.promise.then = function (e) {
          var t,
            n = new Promise(function (e) {
              o.subscribe(e), t = e;
            }).then(e);
          return n.cancel = function () {
            o.unsubscribe(t);
          }, n;
        }, n(function (e, t, n) {
          o.reason || (o.reason = new CanceledError(e, t, n), r(o.reason));
        });
      }
      return mergeOptions(e, [{
        key: "throwIfRequested",
        value: function () {
          if (this.reason) throw this.reason;
        }
      }, {
        key: "subscribe",
        value: function (e) {
          this.reason ? e(this.reason) : this._listeners ? this._listeners.push(e) : this._listeners = [e];
        }
      }, {
        key: "unsubscribe",
        value: function (e) {
          if (this._listeners) {
            var t = this._listeners.indexOf(e);
            -1 !== t && this._listeners.splice(t, 1);
          }
        }
      }], [{
        key: "source",
        value: function () {
          var t;
          return {
            token: new e(function (e) {
              t = e;
            }),
            cancel: t
          };
        }
      }]), e;
    }();
  var HttpStatusCodes = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511
  };
  Object.entries(HttpStatusCodes).forEach(function (e) {
    var t = arrayIterator(e, 2),
      n = t[0],
      r = t[1];
    HttpStatusCodes[r] = n;
  });
  var httpStatusCodesMap = HttpStatusCodes;
  var createAxiosInstance = function e(t) {
    var n = new HttpRequestHandler(t),
      r = baseURLHandler(HttpRequestHandler.prototype.request, n);
    return utilityFunctions.extend(r, HttpRequestHandler.prototype, n, {
      allOwnKeys: !0
    }), utilityFunctions.extend(r, n, null, {
      allOwnKeys: !0
    }), r.create = function (n) {
      return e(_mergeOptions(t, n));
    }, r;
  }(httpRequestConfig);
  return createAxiosInstance.Axios = HttpRequestHandler, createAxiosInstance.CanceledError = CanceledError, createAxiosInstance.CancelToken = ExecutorFunction, createAxiosInstance.isCancel = isCancellationError, createAxiosInstance.VERSION = axiosVersion, createAxiosInstance.toFormData = mergeFormData, createAxiosInstance.AxiosError = AxiosError, createAxiosInstance.Cancel = createAxiosInstance.CanceledError, createAxiosInstance.all = function (e) {
    return Promise.all(e);
  }, createAxiosInstance.spread = function (e) {
    return function (t) {
      return e.apply(null, t);
    };
  }, createAxiosInstance.isAxiosError = function (e) {
    return utilityFunctions.isObject(e) && !0 === e.isAxiosError;
  }, createAxiosInstance.mergeConfig = _mergeOptions, createAxiosInstance.AxiosHeaders = dataExtractor, createAxiosInstance.formToJSON = function (e) {
    return processArrayElement(utilityFunctions.isHTMLForm(e) ? new FormData(e) : e);
  }, createAxiosInstance.getAdapter = getAdapter, createAxiosInstance.HttpStatusCode = httpStatusCodesMap, createAxiosInstance.default = createAxiosInstance, createAxiosInstance;
});