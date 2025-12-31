!function (globalResponseData, arrayHandler) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = arrayHandler() : "function" == typeof define && define.amd ? define(arrayHandler) : (globalResponseData = "undefined" != typeof globalThis ? globalThis : globalResponseData || self).axios = arrayHandler();
}(this, function () {
  "use strict";

  function interceptorFunction(t) {
    return interceptorFunction = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
      return typeof e;
    } : function (e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
    }, interceptorFunction(t);
  }
  function processArrayElementCallback(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
  }
  function defineClassProperties(e, t) {
    for (var userAgentParser = 0; userAgentParser < t.length; userAgentParser++) {
      var mergeOptionsHandler = t[userAgentParser];
      mergeOptionsHandler.enumerable = mergeOptionsHandler.enumerable || !1, mergeOptionsHandler.configurable = !0, "value" in mergeOptionsHandler && (mergeOptionsHandler.writable = !0), Object.defineProperty(e, mergeOptionsHandler.key, mergeOptionsHandler);
    }
  }
  function extendClassProperties(e, t, r) {
    return t && defineClassProperties(e.prototype, t), r && defineClassProperties(e, r), Object.defineProperty(e, "prototype", {
      writable: !1
    }), e;
  }
  function arrayIteratorFunction(e, t) {
    return function (e) {
      if (Array.isArray(e)) return e;
    }(e) || function (e, t) {
      var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
      if (null == n) return;
      var r,
        resolveValue,
        argumentIndex = [],
        valueRetriever = !0,
        requestHandler = !1;
      try {
        for (n = n.call(e); !(valueRetriever = (r = n.next()).done) && (argumentIndex.push(r.value), !t || argumentIndex.length !== t); valueRetriever = !0);
      } catch (e) {
        requestHandler = !0, resolveValue = e;
      } finally {
        try {
          valueRetriever || null == n.return || n.return();
        } finally {
          if (requestHandler) throw resolveValue;
        }
      }
      return argumentIndex;
    }(e, t) || function (e, t) {
      if (!e) return;
      if ("string" == typeof e) return arraySliceCount(e, t);
      var n = Object.prototype.toString.call(e).slice(8, -1);
      "Object" === n && e.constructor && (n = e.constructor.name);
      if ("Map" === n || "Set" === n) return Array.from(e);
      if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arraySliceCount(e, t);
    }(e, t) || function () {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }();
  }
  function arraySliceCount(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
    return r;
  }
  function applyBaseURLFunction(e, t) {
    return function () {
      return e.apply(t, arguments);
    };
  }
  var responsePropertyChecker,
    toStringMethod = Object.prototype.toString,
    getObjectPrototype = Object.getPrototypeOf,
    getTypeName = (responsePropertyChecker = Object.create(null), function (e) {
      var t = toStringMethod.call(e);
      return responsePropertyChecker[t] || (responsePropertyChecker[t] = t.slice(8, -1).toLowerCase());
    }),
    isTypeArrayBuffer = function (e) {
      return e = e.toLowerCase(), function (t) {
        return getTypeName(t) === e;
      };
    },
    responseTypeMatcher = function (t) {
      return function (n) {
        return interceptorFunction(n) === t;
      };
    },
    isArray = Array.isArray,
    typeCheckerFunction = responseTypeMatcher("undefined");
  var isArrayBufferTypeCheck = isTypeArrayBuffer("ArrayBuffer");
  var isStringType = responseTypeMatcher("string"),
    isFunctionType = responseTypeMatcher("function"),
    isNumberType = responseTypeMatcher("number"),
    isNonNullObject = function (t) {
      return null !== t && "object" === interceptorFunction(t);
    },
    isPlainObjectType = function (e) {
      if ("object" !== getTypeName(e)) return !1;
      var t = getObjectPrototype(e);
      return !(null !== t && t !== Object.prototype && null !== Object.getPrototypeOf(t) || Symbol.toStringTag in e || Symbol.iterator in e);
    },
    isDateType = isTypeArrayBuffer("Date"),
    isFileType = isTypeArrayBuffer("File"),
    BlobTypeChecker = isTypeArrayBuffer("Blob"),
    isFileListType = isTypeArrayBuffer("FileList"),
    URLSearchParamsChecker = isTypeArrayBuffer("URLSearchParams");
  function iterateOverItems(t, n) {
    var r,
      o,
      i = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}).allOwnKeys,
      a = void 0 !== i && i;
    if (null != t) if ("object" !== interceptorFunction(t) && (t = [t]), isArray(t)) for (r = 0, o = t.length; r < o; r++) n.call(null, t[r], r, t);else {
      var s,
        abortHandler = a ? Object.getOwnPropertyNames(t) : Object.keys(t),
        xmlHttpRequestInstance = abortHandler.length;
      for (r = 0; r < xmlHttpRequestInstance; r++) s = abortHandler[r], n.call(null, t[s], s, t);
    }
  }
  function getKeyByValueIgnoringCase(e, t) {
    t = t.toLowerCase();
    for (var n, r = Object.keys(e), o = r.length; o-- > 0;) if (t === (n = r[o]).toLowerCase()) return n;
    return null;
  }
  var globalContext = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global,
    isNotInGlobalScope = function (e) {
      return !typeCheckerFunction(e) && e !== globalContext;
    };
  var isUint8ArrayAvailable,
    isValidUint8Array = (isUint8ArrayAvailable = "undefined" != typeof Uint8Array && getObjectPrototype(Uint8Array), function (e) {
      return isUint8ArrayAvailable && e instanceof isUint8ArrayAvailable;
    }),
    isHTMLFormElement = isTypeArrayBuffer("HTMLFormElement"),
    hasOwnPropertyChecker = function () {
      var e = Object.prototype.hasOwnProperty;
      return function (t, n) {
        return e.call(t, n);
      };
    }(),
    isRegExpType = isTypeArrayBuffer("RegExp"),
    applyPropertyDescriptors = function (e, t) {
      var n = Object.getOwnPropertyDescriptors(e),
        r = {};
      iterateOverItems(n, function (n, o) {
        var i;
        !1 !== (i = t(n, o, e)) && (r[o] = i || n);
      }), Object.defineProperties(e, r);
    },
    lowercaseAlphabetCharacters = "abcdefghijklmnopqrstuvwxyz",
    DIGIT_CHARACTERS = "0123456789",
    CharacterCategories = {
      DIGIT: DIGIT_CHARACTERS,
      ALPHA: lowercaseAlphabetCharacters,
      ALPHA_DIGIT: lowercaseAlphabetCharacters + lowercaseAlphabetCharacters.toUpperCase() + DIGIT_CHARACTERS
    };
  var isAsyncFunctionType = isTypeArrayBuffer("AsyncFunction"),
    typeCheckUtilities = {
      isArray: isArray,
      isArrayBuffer: isArrayBufferTypeCheck,
      isBuffer: function (e) {
        return null !== e && !typeCheckerFunction(e) && null !== e.constructor && !typeCheckerFunction(e.constructor) && isFunctionType(e.constructor.isBuffer) && e.constructor.isBuffer(e);
      },
      isFormData: function (e) {
        var t;
        return e && ("function" == typeof FormData && e instanceof FormData || isFunctionType(e.append) && ("formdata" === (t = getTypeName(e)) || "object" === t && isFunctionType(e.toString) && "[object FormData]" === e.toString()));
      },
      isArrayBufferView: function (e) {
        return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer && isArrayBufferTypeCheck(e.buffer);
      },
      isString: isStringType,
      isNumber: isNumberType,
      isBoolean: function (e) {
        return !0 === e || !1 === e;
      },
      isObject: isNonNullObject,
      isPlainObject: isPlainObjectType,
      isUndefined: typeCheckerFunction,
      isDate: isDateType,
      isFile: isFileType,
      isBlob: BlobTypeChecker,
      isRegExp: isRegExpType,
      isFunction: isFunctionType,
      isStream: function (e) {
        return isNonNullObject(e) && isFunctionType(e.pipe);
      },
      isURLSearchParams: URLSearchParamsChecker,
      isTypedArray: isValidUint8Array,
      isFileList: isFileListType,
      forEach: iterateOverItems,
      merge: function e() {
        for (var t = (isNotInGlobalScope(this) && this || {}).caseless, n = {}, r = function (r, o) {
            var i = t && getKeyByValueIgnoringCase(n, o) || o;
            isPlainObjectType(n[i]) && isPlainObjectType(r) ? n[i] = e(n[i], r) : isPlainObjectType(r) ? n[i] = e({}, r) : isArray(r) ? n[i] = r.slice() : n[i] = r;
          }, o = 0, i = arguments.length; o < i; o++) arguments[o] && iterateOverItems(arguments[o], r);
        return n;
      },
      extend: function (e, t, n) {
        return iterateOverItems(t, function (t, r) {
          n && isFunctionType(t) ? e[r] = applyBaseURLFunction(t, n) : e[r] = t;
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
          e = !1 !== n && getObjectPrototype(e);
        } while (e && (!n || n(e, t)) && e !== Object.prototype);
        return t;
      },
      kindOf: getTypeName,
      kindOfTest: isTypeArrayBuffer,
      endsWith: function (e, t, n) {
        e = String(e), (void 0 === n || n > e.length) && (n = e.length), n -= t.length;
        var r = e.indexOf(t, n);
        return -1 !== r && r === n;
      },
      toArray: function (e) {
        if (!e) return null;
        if (isArray(e)) return e;
        var t = e.length;
        if (!isNumberType(t)) return null;
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
      isHTMLForm: isHTMLFormElement,
      hasOwnProperty: hasOwnPropertyChecker,
      hasOwnProp: hasOwnPropertyChecker,
      reduceDescriptors: applyPropertyDescriptors,
      freezeMethods: function (e) {
        applyPropertyDescriptors(e, function (t, n) {
          if (isFunctionType(e) && -1 !== ["arguments", "caller", "callee"].indexOf(n)) return !1;
          var r = e[n];
          isFunctionType(r) && (t.enumerable = !1, "writable" in t ? t.writable = !1 : t.set || (t.set = function () {
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
        return isArray(e) ? r(e) : r(String(e).split(t)), n;
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
      findKey: getKeyByValueIgnoringCase,
      global: globalContext,
      isContextDefined: isNotInGlobalScope,
      ALPHABET: CharacterCategories,
      generateString: function () {
        for (var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 16, t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : CharacterCategories.ALPHA_DIGIT, n = "", r = t.length; e--;) n += t[Math.random() * r | 0];
        return n;
      },
      isSpecCompliantForm: function (e) {
        return !!(e && isFunctionType(e.append) && "FormData" === e[Symbol.toStringTag] && e[Symbol.iterator]);
      },
      toJSONObject: function (e) {
        var t = new Array(10);
        return function e(n, r) {
          if (isNonNullObject(n)) {
            if (t.indexOf(n) >= 0) return;
            if (!("toJSON" in n)) {
              t[r] = n;
              var o = isArray(n) ? [] : {};
              return iterateOverItems(n, function (t, n) {
                var i = e(t, r + 1);
                !typeCheckerFunction(i) && (o[n] = i);
              }), t[r] = void 0, o;
            }
          }
          return n;
        }(e, 0);
      },
      isAsyncFn: isAsyncFunctionType,
      isThenable: function (e) {
        return e && (isNonNullObject(e) || isFunctionType(e)) && isFunctionType(e.then) && isFunctionType(e.catch);
      }
    };
  function HttpRequestError(e, t, n, r, o) {
    Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = e, this.name = "AxiosError", t && (this.code = t), n && (this.config = n), r && (this.request = r), o && (this.response = o);
  }
  typeCheckUtilities.inherits(HttpRequestError, Error, {
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
        config: typeCheckUtilities.toJSONObject(this.config),
        code: this.code,
        status: this.response && this.response.status ? this.response.status : null
      };
    }
  });
  var AxiosErrorCodes = HttpRequestError.prototype,
    _AxiosErrorCodes = {};
  ["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(function (e) {
    _AxiosErrorCodes[e] = {
      value: e
    };
  }), Object.defineProperties(HttpRequestError, _AxiosErrorCodes), Object.defineProperty(AxiosErrorCodes, "isAxiosError", {
    value: !0
  }), HttpRequestError.from = function (e, t, n, r, o, i) {
    var a = Object.create(AxiosErrorCodes);
    return typeCheckUtilities.toFlatObject(e, a, function (e) {
      return e !== Error.prototype;
    }, function (e) {
      return "isAxiosError" !== e;
    }), HttpRequestError.call(a, e.message, t, n, r, o), a.cause = e, a.name = e.name, i && Object.assign(a, i), a;
  };
  function isPlainObjectOrArray(e) {
    return typeCheckUtilities.isPlainObject(e) || typeCheckUtilities.isArray(e);
  }
  function stripArraySuffix(e) {
    return typeCheckUtilities.endsWith(e, "[]") ? e.slice(0, -2) : e;
  }
  function combineAndFormatKeys(e, t, n) {
    return e ? e.concat(t).map(function (e, t) {
      return e = stripArraySuffix(e), !n && t ? "[" + e + "]" : e;
    }).join(n ? "." : "") : t;
  }
  var isMetaProperty = typeCheckUtilities.toFlatObject(typeCheckUtilities, {}, null, function (e) {
    return /^is[A-Z]/.test(e);
  });
  function combineFormData(t, n, r) {
    if (!typeCheckUtilities.isObject(t)) throw new TypeError("target must be an object");
    n = n || new FormData();
    var o = (r = typeCheckUtilities.toFlatObject(r, {
        metaTokens: !0,
        dots: !1,
        indexes: !1
      }, !1, function (e, t) {
        return !typeCheckUtilities.isUndefined(t[e]);
      })).metaTokens,
      i = r.visitor || responseInterceptorsHandler,
      a = r.dots,
      s = r.indexes,
      u = (r.Blob || "undefined" != typeof Blob && Blob) && typeCheckUtilities.isSpecCompliantForm(n);
    if (!typeCheckUtilities.isFunction(i)) throw new TypeError("visitor must be a function");
    function c(e) {
      if (null === e) return "";
      if (typeCheckUtilities.isDate(e)) return e.toISOString();
      if (!u && typeCheckUtilities.isBlob(e)) throw new HttpRequestError("Blob is not supported. Use a Buffer instead.");
      return typeCheckUtilities.isArrayBuffer(e) || typeCheckUtilities.isTypedArray(e) ? u && "function" == typeof Blob ? new Blob([e]) : Buffer.from(e) : e;
    }
    function responseInterceptorsHandler(t, r, i) {
      var u = t;
      if (t && !i && "object" === interceptorFunction(t)) if (typeCheckUtilities.endsWith(r, "{}")) r = o ? r : r.slice(0, -2), t = JSON.stringify(t);else if (typeCheckUtilities.isArray(t) && function (e) {
        return typeCheckUtilities.isArray(e) && !e.some(isPlainObjectOrArray);
      }(t) || (typeCheckUtilities.isFileList(t) || typeCheckUtilities.endsWith(r, "[]")) && (u = typeCheckUtilities.toArray(t))) return r = stripArraySuffix(r), u.forEach(function (e, t) {
        !typeCheckUtilities.isUndefined(e) && null !== e && n.append(!0 === s ? combineAndFormatKeys([r], t, a) : null === s ? r : r + "[]", c(e));
      }), !1;
      return !!isPlainObjectOrArray(t) || (n.append(combineAndFormatKeys(i, r, a), c(t)), !1);
    }
    var promiseChainLength = [],
      _promiseChainIndex = Object.assign(isMetaProperty, {
        defaultVisitor: responseInterceptorsHandler,
        convertValue: c,
        isVisitable: isPlainObjectOrArray
      });
    if (!typeCheckUtilities.isObject(t)) throw new TypeError("data must be an object");
    return function e(t, r) {
      if (!typeCheckUtilities.isUndefined(t)) {
        if (-1 !== promiseChainLength.indexOf(t)) throw Error("Circular reference detected in " + r.join("."));
        promiseChainLength.push(t), typeCheckUtilities.forEach(t, function (t, o) {
          !0 === (!(typeCheckUtilities.isUndefined(t) || null === t) && i.call(n, t, typeCheckUtilities.isString(o) ? o.trim() : o, r, _promiseChainIndex)) && e(t, r ? r.concat(o) : [o]);
        }), promiseChainLength.pop();
      }
    }(t), n;
  }
  function customURLEncoder(e) {
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
  function FormDataKeyValueHandler(e, t) {
    this._pairs = [], e && combineFormData(e, this, t);
  }
  var KeyValuePairEncoder = FormDataKeyValueHandler.prototype;
  function customUrlEncoder(e) {
    return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  function addQueryParametersToURL(e, t, n) {
    if (!t) return e;
    var r,
      o = n && n.encode || customUrlEncoder,
      i = n && n.serialize;
    if (r = i ? i(t, n) : typeCheckUtilities.isURLSearchParams(t) ? t.toString() : new FormDataKeyValueHandler(t, n).toString(o)) {
      var a = e.indexOf("#");
      -1 !== a && (e = e.slice(0, a)), e += (-1 === e.indexOf("?") ? "?" : "&") + r;
    }
    return e;
  }
  KeyValuePairEncoder.append = function (e, t) {
    this._pairs.push([e, t]);
  }, KeyValuePairEncoder.toString = function (e) {
    var t = e ? function (t) {
      return e.call(this, t, customURLEncoder);
    } : customURLEncoder;
    return this._pairs.map(function (e) {
      return t(e[0]) + "=" + t(e[1]);
    }, "").join("&");
  };
  var errorHandlerFunction,
    createHandlerFunction = function () {
      function e() {
        processArrayElementCallback(this, e), this.handlers = [];
      }
      return extendClassProperties(e, [{
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
          typeCheckUtilities.forEach(this.handlers, function (t) {
            null !== t && e(t);
          });
        }
      }]), e;
    }(),
    jsonParsingConfig = {
      silentJSONParsing: !0,
      forcedJSONParsing: !0,
      clarifyTimeoutError: !1
    },
    environmentCapabilities = {
      isBrowser: !0,
      classes: {
        URLSearchParams: "undefined" != typeof URLSearchParams ? URLSearchParams : FormDataKeyValueHandler,
        FormData: "undefined" != typeof FormData ? FormData : null,
        Blob: "undefined" != typeof Blob ? Blob : null
      },
      isStandardBrowserEnv: ("undefined" == typeof navigator || "ReactNative" !== (errorHandlerFunction = navigator.product) && "NativeScript" !== errorHandlerFunction && "NS" !== errorHandlerFunction) && "undefined" != typeof window && "undefined" != typeof document,
      isStandardBrowserWebWorkerEnv: "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && "function" == typeof self.importScripts,
      protocols: ["http", "https", "file", "blob", "url", "data"]
    };
  function processElementFromArray(e) {
    function t(e, n, r, o) {
      var i = e[o++],
        a = Number.isFinite(+i),
        s = o >= e.length;
      return i = !i && typeCheckUtilities.isArray(r) ? r.length : i, s ? (typeCheckUtilities.hasOwnProp(r, i) ? r[i] = [r[i], n] : r[i] = n, !a) : (r[i] && typeCheckUtilities.isObject(r[i]) || (r[i] = []), t(e, n, r[i], o) && typeCheckUtilities.isArray(r[i]) && (r[i] = function (e) {
        var t,
          n,
          r = {},
          o = Object.keys(e),
          i = o.length;
        for (t = 0; t < i; t++) r[n = o[t]] = e[n];
        return r;
      }(r[i])), !a);
    }
    if (typeCheckUtilities.isFormData(e) && typeCheckUtilities.isFunction(e.entries)) {
      var n = {};
      return typeCheckUtilities.forEachEntry(e, function (e, r) {
        t(function (e) {
          return typeCheckUtilities.matchAll(/\w+|\[(\w*)]/g, e).map(function (e) {
            return "[]" === e[0] ? "" : e[1] || e[0];
          });
        }(e), r, n, 0);
      }), n;
    }
    return null;
  }
  var formDataHandler = {
    transitional: jsonParsingConfig,
    adapter: ["xhr", "http"],
    transformRequest: [function (e, t) {
      var n,
        r = t.getContentType() || "",
        o = r.indexOf("application/json") > -1,
        i = typeCheckUtilities.isObject(e);
      if (i && typeCheckUtilities.isHTMLForm(e) && (e = new FormData(e)), typeCheckUtilities.isFormData(e)) return o && o ? JSON.stringify(processElementFromArray(e)) : e;
      if (typeCheckUtilities.isArrayBuffer(e) || typeCheckUtilities.isBuffer(e) || typeCheckUtilities.isStream(e) || typeCheckUtilities.isFile(e) || typeCheckUtilities.isBlob(e)) return e;
      if (typeCheckUtilities.isArrayBufferView(e)) return e.buffer;
      if (typeCheckUtilities.isURLSearchParams(e)) return t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), e.toString();
      if (i) {
        if (r.indexOf("application/x-www-form-urlencoded") > -1) return function (e, t) {
          return combineFormData(e, new environmentCapabilities.classes.URLSearchParams(), Object.assign({
            visitor: function (e, t, n, r) {
              return environmentCapabilities.isNode && typeCheckUtilities.isBuffer(e) ? (this.append(t, e.toString("base64")), !1) : r.defaultVisitor.apply(this, arguments);
            }
          }, t));
        }(e, this.formSerializer).toString();
        if ((n = typeCheckUtilities.isFileList(e)) || r.indexOf("multipart/form-data") > -1) {
          var a = this.env && this.env.FormData;
          return combineFormData(n ? {
            "files[]": e
          } : e, a && new a(), this.formSerializer);
        }
      }
      return i || o ? (t.setContentType("application/json", !1), function (e, t, n) {
        if (typeCheckUtilities.isString(e)) try {
          return (t || JSON.parse)(e), typeCheckUtilities.trim(e);
        } catch (e) {
          if ("SyntaxError" !== e.name) throw e;
        }
        return (n || JSON.stringify)(e);
      }(e)) : e;
    }],
    transformResponse: [function (e) {
      var t = this.transitional || formDataHandler.transitional,
        n = t && t.forcedJSONParsing,
        r = "json" === this.responseType;
      if (e && typeCheckUtilities.isString(e) && (n && !this.responseType || r)) {
        var o = !(t && t.silentJSONParsing) && r;
        try {
          return JSON.parse(e);
        } catch (e) {
          if (o) {
            if ("SyntaxError" === e.name) throw HttpRequestError.from(e, HttpRequestError.ERR_BAD_RESPONSE, this, null, this.response);
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
      FormData: environmentCapabilities.classes.FormData,
      Blob: environmentCapabilities.classes.Blob
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
  typeCheckUtilities.forEach(["delete", "get", "head", "post", "put", "patch"], function (e) {
    formDataHandler.headers[e] = {};
  });
  var formDataAdapterConfig = formDataHandler,
    allowedHttpHeaders = typeCheckUtilities.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]),
    INTERNALS_SYMBOL_IDENTIFIER = Symbol("internals");
  function normalizeAndTrimString(e) {
    return e && String(e).trim().toLowerCase();
  }
  function sanitizeInput(e) {
    return !1 === e || null == e ? e : typeCheckUtilities.isArray(e) ? e.map(sanitizeInput) : String(e);
  }
  function matchesPattern(e, t, n, r, o) {
    return typeCheckUtilities.isFunction(r) ? r.call(this, t, n) : (o && (t = n), typeCheckUtilities.isString(t) ? typeCheckUtilities.isString(r) ? -1 !== t.indexOf(r) : typeCheckUtilities.isRegExp(r) ? r.test(t) : void 0 : void 0);
  }
  var headerManager = function () {
    function e(n) {
      processArrayElementCallback(this, e), n && this.set(n);
    }
    return extendClassProperties(e, [{
      key: "set",
      value: function (e, t, n) {
        var r = this;
        function o(e, t, n) {
          var o = normalizeAndTrimString(t);
          if (!o) throw new Error("header name must be a non-empty string");
          var i = typeCheckUtilities.findKey(r, o);
          (!i || void 0 === r[i] || !0 === n || void 0 === n && !1 !== r[i]) && (r[i || t] = sanitizeInput(e));
        }
        var i,
          a,
          s,
          u,
          c,
          f = function (e, t) {
            return typeCheckUtilities.forEach(e, function (e, n) {
              return o(e, n, t);
            });
          };
        return typeCheckUtilities.isPlainObject(e) || e instanceof this.constructor ? f(e, t) : typeCheckUtilities.isString(e) && (e = e.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim()) ? f((c = {}, (i = e) && i.split("\n").forEach(function (e) {
          u = e.indexOf(":"), a = e.substring(0, u).trim().toLowerCase(), s = e.substring(u + 1).trim(), !a || c[a] && allowedHttpHeaders[a] || ("set-cookie" === a ? c[a] ? c[a].push(s) : c[a] = [s] : c[a] = c[a] ? c[a] + ", " + s : s);
        }), c), t) : null != e && o(t, e, n), this;
      }
    }, {
      key: "get",
      value: function (e, t) {
        if (e = normalizeAndTrimString(e)) {
          var n = typeCheckUtilities.findKey(this, e);
          if (n) {
            var r = this[n];
            if (!t) return r;
            if (!0 === t) return function (e) {
              for (var t, n = Object.create(null), r = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; t = r.exec(e);) n[t[1]] = t[2];
              return n;
            }(r);
            if (typeCheckUtilities.isFunction(t)) return t.call(this, r, n);
            if (typeCheckUtilities.isRegExp(t)) return t.exec(r);
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
    }, {
      key: "has",
      value: function (e, t) {
        if (e = normalizeAndTrimString(e)) {
          var n = typeCheckUtilities.findKey(this, e);
          return !(!n || void 0 === this[n] || t && !matchesPattern(0, this[n], n, t));
        }
        return !1;
      }
    }, {
      key: "delete",
      value: function (e, t) {
        var n = this,
          r = !1;
        function o(e) {
          if (e = normalizeAndTrimString(e)) {
            var o = typeCheckUtilities.findKey(n, e);
            !o || t && !matchesPattern(0, n[o], o, t) || (delete n[o], r = !0);
          }
        }
        return typeCheckUtilities.isArray(e) ? e.forEach(o) : o(e), r;
      }
    }, {
      key: "clear",
      value: function (e) {
        for (var t = Object.keys(this), n = t.length, r = !1; n--;) {
          var o = t[n];
          e && !matchesPattern(0, this[o], o, e, !0) || (delete this[o], r = !0);
        }
        return r;
      }
    }, {
      key: "normalize",
      value: function (e) {
        var t = this,
          n = {};
        return typeCheckUtilities.forEach(this, function (r, o) {
          var i = typeCheckUtilities.findKey(n, o);
          if (i) return t[i] = sanitizeInput(r), void delete t[o];
          var a = e ? function (e) {
            return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function (e, t, n) {
              return t.toUpperCase() + n;
            });
          }(o) : String(o).trim();
          a !== o && delete t[o], t[a] = sanitizeInput(r), n[a] = !0;
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
        return typeCheckUtilities.forEach(this, function (n, r) {
          null != n && !1 !== n && (t[r] = e && typeCheckUtilities.isArray(n) ? n.join(", ") : n);
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
          var t = arrayIteratorFunction(e, 2);
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
        var t = (this[INTERNALS_SYMBOL_IDENTIFIER] = this[INTERNALS_SYMBOL_IDENTIFIER] = {
            accessors: {}
          }).accessors,
          n = this.prototype;
        function r(e) {
          var r = normalizeAndTrimString(e);
          t[r] || (!function (e, t) {
            var n = typeCheckUtilities.toCamelCase(" " + t);
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
        return typeCheckUtilities.isArray(e) ? e.forEach(r) : r(e), this;
      }
    }]), e;
  }();
  headerManager.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]), typeCheckUtilities.reduceDescriptors(headerManager.prototype, function (e, t) {
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
  }), typeCheckUtilities.freezeMethods(headerManager);
  var headerSetterFunction = headerManager;
  function handleResponse(e, t) {
    var n = this || formDataAdapterConfig,
      r = t || n,
      o = headerSetterFunction.from(r.headers),
      i = r.data;
    return typeCheckUtilities.forEach(e, function (e) {
      i = e.call(n, i, o.normalize(), t ? t.status : void 0);
    }), o.normalize(), i;
  }
  function isErrorCancelled(e) {
    return !(!e || !e.__CANCEL__);
  }
  function CancellationError(e, t, n) {
    HttpRequestError.call(this, null == e ? "canceled" : e, HttpRequestError.ERR_CANCELED, t, n), this.name = "CanceledError";
  }
  typeCheckUtilities.inherits(CancellationError, HttpRequestError, {
    __CANCEL__: !0
  });
  var cookieManager = environmentCapabilities.isStandardBrowserEnv ? {
    write: function (e, t, n, r, o, i) {
      var a = [];
      a.push(e + "=" + encodeURIComponent(t)), typeCheckUtilities.isNumber(n) && a.push("expires=" + new Date(n).toGMTString()), typeCheckUtilities.isString(r) && a.push("path=" + r), typeCheckUtilities.isString(o) && a.push("domain=" + o), !0 === i && a.push("secure"), document.cookie = a.join("; ");
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
  function combineBaseUrlWithPath(e, t) {
    return e && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(t) ? function (e, t) {
      return t ? e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "") : e;
    }(e, t) : t;
  }
  var isStandardBrowserEnvironmentCheck = environmentCapabilities.isStandardBrowserEnv ? function () {
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
      var n = typeCheckUtilities.isString(t) ? r(t) : t;
      return n.protocol === e.protocol && n.host === e.host;
    };
  }() : function () {
    return !0;
  };
  function requestRateLimiter(e, t) {
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
  var httpRequestManager = {
    http: null,
    xhr: "undefined" != typeof XMLHttpRequest && function (e) {
      return new Promise(function (t, n) {
        var r,
          o,
          i = e.data,
          a = headerSetterFunction.from(e.headers).normalize(),
          s = e.responseType;
        function u() {
          e.cancelToken && e.cancelToken.unsubscribe(r), e.signal && e.signal.removeEventListener("abort", r);
        }
        typeCheckUtilities.isFormData(i) && (environmentCapabilities.isStandardBrowserEnv || environmentCapabilities.isStandardBrowserWebWorkerEnv ? a.setContentType(!1) : a.getContentType(/^\s*multipart\/form-data/) ? typeCheckUtilities.isString(o = a.getContentType()) && a.setContentType(o.replace(/^\s*(multipart\/form-data);+/, "$1")) : a.setContentType("multipart/form-data"));
        var c = new XMLHttpRequest();
        if (e.auth) {
          var f = e.auth.username || "",
            l = e.auth.password ? unescape(encodeURIComponent(e.auth.password)) : "";
          a.set("Authorization", "Basic " + btoa(f + ":" + l));
        }
        var d = combineBaseUrlWithPath(e.baseURL, e.url);
        function handleResponse() {
          if (c) {
            var r = headerSetterFunction.from("getAllResponseHeaders" in c && c.getAllResponseHeaders());
            !function (e, t, n) {
              var r = n.config.validateStatus;
              n.status && r && !r(n.status) ? t(new HttpRequestError("Request failed with status code " + n.status, [HttpRequestError.ERR_BAD_REQUEST, HttpRequestError.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4], n.config, n.request, n)) : e(n);
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
        if (c.open(e.method.toUpperCase(), addQueryParametersToURL(d, e.params, e.paramsSerializer), !0), c.timeout = e.timeout, "onloadend" in c ? c.onloadend = handleResponse : c.onreadystatechange = function () {
          c && 4 === c.readyState && (0 !== c.status || c.responseURL && 0 === c.responseURL.indexOf("file:")) && setTimeout(handleResponse);
        }, c.onabort = function () {
          c && (n(new HttpRequestError("Request aborted", HttpRequestError.ECONNABORTED, e, c)), c = null);
        }, c.onerror = function () {
          n(new HttpRequestError("Network Error", HttpRequestError.ERR_NETWORK, e, c)), c = null;
        }, c.ontimeout = function () {
          var t = e.timeout ? "timeout of " + e.timeout + "ms exceeded" : "timeout exceeded",
            r = e.transitional || jsonParsingConfig;
          e.timeoutErrorMessage && (t = e.timeoutErrorMessage), n(new HttpRequestError(t, r.clarifyTimeoutError ? HttpRequestError.ETIMEDOUT : HttpRequestError.ECONNABORTED, e, c)), c = null;
        }, environmentCapabilities.isStandardBrowserEnv) {
          var currentValue = isStandardBrowserEnvironmentCheck(d) && e.xsrfCookieName && cookieManager.read(e.xsrfCookieName);
          currentValue && a.set(e.xsrfHeaderName, currentValue);
        }
        void 0 === i && a.setContentType(null), "setRequestHeader" in c && typeCheckUtilities.forEach(a.toJSON(), function (e, t) {
          c.setRequestHeader(t, e);
        }), typeCheckUtilities.isUndefined(e.withCredentials) || (c.withCredentials = !!e.withCredentials), s && "json" !== s && (c.responseType = e.responseType), "function" == typeof e.onDownloadProgress && c.addEventListener("progress", requestRateLimiter(e.onDownloadProgress, !0)), "function" == typeof e.onUploadProgress && c.upload && c.upload.addEventListener("progress", requestRateLimiter(e.onUploadProgress)), (e.cancelToken || e.signal) && (r = function (t) {
          c && (n(!t || t.type ? new CancellationError(null, e, c) : t), c.abort(), c = null);
        }, e.cancelToken && e.cancelToken.subscribe(r), e.signal && (e.signal.aborted ? r() : e.signal.addEventListener("abort", r)));
        var callbackFunction,
          _protocolScheme = (callbackFunction = /^([-+\w]{1,25})(:?\/\/|:)/.exec(d)) && callbackFunction[1] || "";
        _protocolScheme && -1 === environmentCapabilities.protocols.indexOf(_protocolScheme) ? n(new HttpRequestError("Unsupported protocol " + _protocolScheme + ":", HttpRequestError.ERR_BAD_REQUEST, e)) : c.send(i || null);
      });
    }
  };
  typeCheckUtilities.forEach(httpRequestManager, function (e, t) {
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
  var formatErrorMessageWithPrefix = function (e) {
      return "- ".concat(e);
    },
    isAdapterValid = function (e) {
      return typeCheckUtilities.isFunction(e) || null === e || !1 === e;
    },
    retrieveAdapter = function (e) {
      for (var t, n, r = (e = typeCheckUtilities.isArray(e) ? e : [e]).length, i = {}, a = 0; a < r; a++) {
        var s = void 0;
        if (n = t = e[a], !isAdapterValid(t) && void 0 === (n = httpRequestManager[(s = String(t)).toLowerCase()])) throw new HttpRequestError("Unknown adapter '".concat(s, "'"));
        if (n) break;
        i[s || "#" + a] = n;
      }
      if (!n) {
        var u = Object.entries(i).map(function (e) {
          var t = arrayIteratorFunction(e, 2),
            n = t[0],
            r = t[1];
          return "adapter ".concat(n, " ") + (!1 === r ? "is not supported by the environment" : "is not available in the build");
        });
        throw new HttpRequestError("There is no suitable adapter to dispatch the request " + (r ? u.length > 1 ? "since :\n" + u.map(formatErrorMessageWithPrefix).join("\n") : " " + formatErrorMessageWithPrefix(u[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
      }
      return n;
    };
  function checkRequestCancellation(e) {
    if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted) throw new CancellationError(null, e);
  }
  function handleHttpRequest(e) {
    return checkRequestCancellation(e), e.headers = headerSetterFunction.from(e.headers), e.data = handleResponse.call(e, e.transformRequest), -1 !== ["post", "put", "patch"].indexOf(e.method) && e.headers.setContentType("application/x-www-form-urlencoded", !1), retrieveAdapter(e.adapter || formDataAdapterConfig.adapter)(e).then(function (t) {
      return checkRequestCancellation(e), t.data = handleResponse.call(e, e.transformResponse, t), t.headers = headerSetterFunction.from(t.headers), t;
    }, function (t) {
      return isErrorCancelled(t) || (checkRequestCancellation(e), t && t.response && (t.response.data = handleResponse.call(e, e.transformResponse, t.response), t.response.headers = headerSetterFunction.from(t.response.headers))), Promise.reject(t);
    });
  }
  var convertToSerializableFormat = function (e) {
    return e instanceof headerSetterFunction ? e.toJSON() : e;
  };
  function mergeRequestOptions(e, t) {
    t = t || {};
    var n = {};
    function r(e, t, n) {
      return typeCheckUtilities.isPlainObject(e) && typeCheckUtilities.isPlainObject(t) ? typeCheckUtilities.merge.call({
        caseless: n
      }, e, t) : typeCheckUtilities.isPlainObject(t) ? typeCheckUtilities.merge({}, t) : typeCheckUtilities.isArray(t) ? t.slice() : t;
    }
    function o(e, t, n) {
      return typeCheckUtilities.isUndefined(t) ? typeCheckUtilities.isUndefined(e) ? void 0 : r(void 0, e, n) : r(e, t, n);
    }
    function i(e, t) {
      if (!typeCheckUtilities.isUndefined(t)) return r(void 0, t);
    }
    function a(e, t) {
      return typeCheckUtilities.isUndefined(t) ? typeCheckUtilities.isUndefined(e) ? void 0 : r(void 0, e) : r(void 0, t);
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
        return o(convertToSerializableFormat(e), convertToSerializableFormat(t), !0);
      }
    };
    return typeCheckUtilities.forEach(Object.keys(Object.assign({}, e, t)), function (r) {
      var i = u[r] || o,
        a = i(e[r], t[r], r);
      typeCheckUtilities.isUndefined(a) && i !== s || (n[r] = a);
    }), n;
  }
  var axiosVersionString = "1.6.0",
    typeValidators = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(function (t, n) {
    typeValidators[t] = function (r) {
      return interceptorFunction(r) === t || "a" + (n < 1 ? "n " : " ") + t;
    };
  });
  var transitionalOptionsTracker = {};
  typeValidators.transitional = function (e, t, n) {
    function r(e, t) {
      return "[Axios v1.6.0] Transitional option '" + e + "'" + t + (n ? ". " + n : "");
    }
    return function (n, o, i) {
      if (!1 === e) throw new HttpRequestError(r(o, " has been removed" + (t ? " in " + t : "")), HttpRequestError.ERR_DEPRECATED);
      return t && !transitionalOptionsTracker[o] && (transitionalOptionsTracker[o] = !0, console.warn(r(o, " has been deprecated since v" + t + " and will be removed in the near future"))), !e || e(n, o, i);
    };
  };
  var optionsValidator = {
      assertOptions: function (t, n, r) {
        if ("object" !== interceptorFunction(t)) throw new HttpRequestError("options must be an object", HttpRequestError.ERR_BAD_OPTION_VALUE);
        for (var o = Object.keys(t), i = o.length; i-- > 0;) {
          var a = o[i],
            s = n[a];
          if (s) {
            var u = t[a],
              c = void 0 === u || s(u, a, t);
            if (!0 !== c) throw new HttpRequestError("option " + a + " must be " + c, HttpRequestError.ERR_BAD_OPTION_VALUE);
          } else if (!0 !== r) throw new HttpRequestError("Unknown option " + a, HttpRequestError.ERR_BAD_OPTION);
        }
      },
      validators: typeValidators
    },
    optionValidators = optionsValidator.validators,
    createInterceptorInstance = function () {
      function e(n) {
        processArrayElementCallback(this, e), this.defaults = n, this.interceptors = {
          request: new createHandlerFunction(),
          response: new createHandlerFunction()
        };
      }
      return extendClassProperties(e, [{
        key: "request",
        value: function (e, t) {
          "string" == typeof e ? (t = t || {}).url = e : t = e || {};
          var n = t = mergeRequestOptions(this.defaults, t),
            r = n.transitional,
            o = n.paramsSerializer,
            i = n.headers;
          void 0 !== r && optionsValidator.assertOptions(r, {
            silentJSONParsing: optionValidators.transitional(optionValidators.boolean),
            forcedJSONParsing: optionValidators.transitional(optionValidators.boolean),
            clarifyTimeoutError: optionValidators.transitional(optionValidators.boolean)
          }, !1), null != o && (typeCheckUtilities.isFunction(o) ? t.paramsSerializer = {
            serialize: o
          } : optionsValidator.assertOptions(o, {
            encode: optionValidators.function,
            serialize: optionValidators.function
          }, !0)), t.method = (t.method || this.defaults.method || "get").toLowerCase();
          var a = i && typeCheckUtilities.merge(i.common, i[t.method]);
          i && typeCheckUtilities.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (e) {
            delete i[e];
          }), t.headers = headerSetterFunction.concat(a, i);
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
            var p = [handleHttpRequest.bind(this), void 0];
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
            c = handleHttpRequest.call(this, h);
          } catch (e) {
            return Promise.reject(e);
          }
          for (d = 0, l = f.length; d < l;) c = c.then(f[d++], f[d++]);
          return c;
        }
      }, {
        key: "getUri",
        value: function (e) {
          return addQueryParametersToURL(combineBaseUrlWithPath((e = mergeRequestOptions(this.defaults, e)).baseURL, e.url), e.params, e.paramsSerializer);
        }
      }]), e;
    }();
  typeCheckUtilities.forEach(["delete", "get", "head", "options"], function (e) {
    createInterceptorInstance.prototype[e] = function (t, n) {
      return this.request(mergeRequestOptions(n || {}, {
        method: e,
        url: t,
        data: (n || {}).data
      }));
    };
  }), typeCheckUtilities.forEach(["post", "put", "patch"], function (e) {
    function t(t) {
      return function (n, r, o) {
        return this.request(mergeRequestOptions(o || {}, {
          method: e,
          headers: t ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: n,
          data: r
        }));
      };
    }
    createInterceptorInstance.prototype[e] = t(), createInterceptorInstance.prototype[e + "Form"] = t(!0);
  });
  var InterceptorCreator = createInterceptorInstance,
    ExecutorFunctionHandler = function () {
      function e(n) {
        if (processArrayElementCallback(this, e), "function" != typeof n) throw new TypeError("executor must be a function.");
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
          o.reason || (o.reason = new CancellationError(e, t, n), r(o.reason));
        });
      }
      return extendClassProperties(e, [{
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
  var HttpStatus = {
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
  Object.entries(HttpStatus).forEach(function (e) {
    var t = arrayIteratorFunction(e, 2),
      n = t[0],
      r = t[1];
    HttpStatus[r] = n;
  });
  var httpStatusCodeMapping = HttpStatus;
  var initializeHttpRequestHandler = function e(t) {
    var n = new InterceptorCreator(t),
      r = applyBaseURLFunction(InterceptorCreator.prototype.request, n);
    return typeCheckUtilities.extend(r, InterceptorCreator.prototype, n, {
      allOwnKeys: !0
    }), typeCheckUtilities.extend(r, n, null, {
      allOwnKeys: !0
    }), r.create = function (n) {
      return e(mergeRequestOptions(t, n));
    }, r;
  }(formDataAdapterConfig);
  return initializeHttpRequestHandler.Axios = InterceptorCreator, initializeHttpRequestHandler.CanceledError = CancellationError, initializeHttpRequestHandler.CancelToken = ExecutorFunctionHandler, initializeHttpRequestHandler.isCancel = isErrorCancelled, initializeHttpRequestHandler.VERSION = axiosVersionString, initializeHttpRequestHandler.toFormData = combineFormData, initializeHttpRequestHandler.AxiosError = HttpRequestError, initializeHttpRequestHandler.Cancel = initializeHttpRequestHandler.CanceledError, initializeHttpRequestHandler.all = function (e) {
    return Promise.all(e);
  }, initializeHttpRequestHandler.spread = function (e) {
    return function (t) {
      return e.apply(null, t);
    };
  }, initializeHttpRequestHandler.isAxiosError = function (e) {
    return typeCheckUtilities.isObject(e) && !0 === e.isAxiosError;
  }, initializeHttpRequestHandler.mergeConfig = mergeRequestOptions, initializeHttpRequestHandler.AxiosHeaders = headerSetterFunction, initializeHttpRequestHandler.formToJSON = function (e) {
    return processElementFromArray(typeCheckUtilities.isHTMLForm(e) ? new FormData(e) : e);
  }, initializeHttpRequestHandler.getAdapter = retrieveAdapter, initializeHttpRequestHandler.HttpStatusCode = httpStatusCodeMapping, initializeHttpRequestHandler.default = initializeHttpRequestHandler, initializeHttpRequestHandler;
});