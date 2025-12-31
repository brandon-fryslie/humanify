!function (globalContext, index) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = index() : "function" == typeof define && define.amd ? define(index) : (globalContext = "undefined" != typeof globalThis ? globalThis : globalContext || self).axios = index();
}(this, function () {
  "use strict";

  function globalContext(index) {
    return globalContext = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (globalContext) {
      return typeof globalContext;
    } : function (globalContext) {
      return globalContext && "function" == typeof Symbol && globalContext.constructor === Symbol && globalContext !== Symbol.prototype ? "symbol" : typeof globalContext;
    }, globalContext(index);
  }
  function index(globalContext, index) {
    if (!(globalContext instanceof index)) throw new TypeError("Cannot call a class as a function");
  }
  function userAgent(globalContext, index) {
    for (var userAgent = 0; userAgent < index.length; userAgent++) {
      var mergeOptions = index[userAgent];
      mergeOptions.enumerable = mergeOptions.enumerable || !1, mergeOptions.configurable = !0, "value" in mergeOptions && (mergeOptions.writable = !0), Object.defineProperty(globalContext, mergeOptions.key, mergeOptions);
    }
  }
  function mergeOptions(globalContext, index, mergeOptions) {
    return index && userAgent(globalContext.prototype, index), mergeOptions && userAgent(globalContext, mergeOptions), Object.defineProperty(globalContext, "prototype", {
      writable: !1
    }), globalContext;
  }
  function mergeWithDefaults(globalContext, index) {
    return function (globalContext) {
      if (Array.isArray(globalContext)) return globalContext;
    }(globalContext) || function (globalContext, index) {
      var userAgent = null == globalContext ? null : "undefined" != typeof Symbol && globalContext[Symbol.iterator] || globalContext["@@iterator"];
      if (null == userAgent) return;
      var mergeOptions,
        mergeWithDefaults,
        arraySlice = [],
        baseURLHandler = !0,
        requestHandler = !1;
      try {
        for (userAgent = userAgent.call(globalContext); !(baseURLHandler = (mergeOptions = userAgent.next()).done) && (arraySlice.push(mergeOptions.value), !index || arraySlice.length !== index); baseURLHandler = !0);
      } catch (globalContext) {
        requestHandler = !0, mergeWithDefaults = globalContext;
      } finally {
        try {
          baseURLHandler || null == userAgent.return || userAgent.return();
        } finally {
          if (requestHandler) throw mergeWithDefaults;
        }
      }
      return arraySlice;
    }(globalContext, index) || function (globalContext, index) {
      if (!globalContext) return;
      if ("string" == typeof globalContext) return arraySlice(globalContext, index);
      var userAgent = Object.prototype.toString.call(globalContext).slice(8, -1);
      "Object" === userAgent && globalContext.constructor && (userAgent = globalContext.constructor.name);
      if ("Map" === userAgent || "Set" === userAgent) return Array.from(globalContext);
      if ("Arguments" === userAgent || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(userAgent)) return arraySlice(globalContext, index);
    }(globalContext, index) || function () {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }();
  }
  function arraySlice(globalContext, index) {
    (null == index || index > globalContext.length) && (index = globalContext.length);
    for (var userAgent = 0, mergeOptions = new Array(index); userAgent < index; userAgent++) mergeOptions[userAgent] = globalContext[userAgent];
    return mergeOptions;
  }
  function baseURLHandler(globalContext, index) {
    return function () {
      return globalContext.apply(index, arguments);
    };
  }
  var requestHandler,
    responseTime = Object.prototype.toString,
    xmlHttpRequest = Object.getPrototypeOf,
    processInput = (requestHandler = Object.create(null), function (globalContext) {
      var index = responseTime.call(globalContext);
      return requestHandler[index] || (requestHandler[index] = index.slice(8, -1).toLowerCase());
    }),
    isArrayBufferType = function (globalContext) {
      return globalContext = globalContext.toLowerCase(), function (index) {
        return processInput(index) === globalContext;
      };
    },
    currentInterceptorIndex = function (index) {
      return function (userAgent) {
        return globalContext(userAgent) === index;
      };
    },
    handleResponseHeaders = Array.isArray,
    getType = currentInterceptorIndex("undefined");
  var _isArrayBufferType = isArrayBufferType("ArrayBuffer");
  var protocolScheme = currentInterceptorIndex("string"),
    isFunction = currentInterceptorIndex("function"),
    isNumber = currentInterceptorIndex("number"),
    isNonNullObject = function (index) {
      return null !== index && "object" === globalContext(index);
    },
    isPlainObject = function (globalContext) {
      if ("object" !== processInput(globalContext)) return !1;
      var index = xmlHttpRequest(globalContext);
      return !(null !== index && index !== Object.prototype && null !== Object.getPrototypeOf(index) || Symbol.toStringTag in globalContext || Symbol.iterator in globalContext);
    },
    DateConstructor = isArrayBufferType("Date"),
    FileType = isArrayBufferType("File"),
    BlobConstructor = isArrayBufferType("Blob"),
    fileListType = isArrayBufferType("FileList"),
    URLSearchParamsConstructor = isArrayBufferType("URLSearchParams");
  function forEachElement(index, userAgent) {
    var mergeOptions,
      mergeWithDefaults,
      arraySlice = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}).allOwnKeys,
      baseURLHandler = void 0 !== arraySlice && arraySlice;
    if (null != index) if ("object" !== globalContext(index) && (index = [index]), handleResponseHeaders(index)) for (mergeOptions = 0, mergeWithDefaults = index.length; mergeOptions < mergeWithDefaults; mergeOptions++) userAgent.call(null, index[mergeOptions], mergeOptions, index);else {
      var requestHandler,
        responseTime = baseURLHandler ? Object.getOwnPropertyNames(index) : Object.keys(index),
        xmlHttpRequest = responseTime.length;
      for (mergeOptions = 0; mergeOptions < xmlHttpRequest; mergeOptions++) requestHandler = responseTime[mergeOptions], userAgent.call(null, index[requestHandler], requestHandler, index);
    }
  }
  function findKeyByValueCaseInsensitive(globalContext, index) {
    index = index.toLowerCase();
    for (var userAgent, mergeOptions = Object.keys(globalContext), mergeWithDefaults = mergeOptions.length; mergeWithDefaults-- > 0;) if (index === (userAgent = mergeOptions[mergeWithDefaults]).toLowerCase()) return userAgent;
    return null;
  }
  var globalScope = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global,
    isNotGlobalObject = function (globalContext) {
      return !getType(globalContext) && globalContext !== globalScope;
    };
  var isUint8ArraySupported,
    isUint8Array = (isUint8ArraySupported = "undefined" != typeof Uint8Array && xmlHttpRequest(Uint8Array), function (globalContext) {
      return isUint8ArraySupported && globalContext instanceof isUint8ArraySupported;
    }),
    HTMLFormElementType = isArrayBufferType("HTMLFormElement"),
    _hasOwnProperty = function () {
      var globalContext = Object.prototype.hasOwnProperty;
      return function (index, userAgent) {
        return globalContext.call(index, userAgent);
      };
    }(),
    isRegExp = isArrayBufferType("RegExp"),
    definePropertiesWithTransform = function (globalContext, index) {
      var userAgent = Object.getOwnPropertyDescriptors(globalContext),
        mergeOptions = {};
      forEachElement(userAgent, function (userAgent, mergeWithDefaults) {
        var arraySlice;
        !1 !== (arraySlice = index(userAgent, mergeWithDefaults, globalContext)) && (mergeOptions[mergeWithDefaults] = arraySlice || userAgent);
      }), Object.defineProperties(globalContext, mergeOptions);
    },
    lowercaseAlphabet = "abcdefghijklmnopqrstuvwxyz",
    DIGITS = "0123456789",
    CharacterCategories = {
      DIGIT: DIGITS,
      ALPHA: lowercaseAlphabet,
      ALPHA_DIGIT: lowercaseAlphabet + lowercaseAlphabet.toUpperCase() + DIGITS
    };
  var isAsyncFunction = isArrayBufferType("AsyncFunction"),
    utils = {
      isArray: handleResponseHeaders,
      isArrayBuffer: _isArrayBufferType,
      isBuffer: function (globalContext) {
        return null !== globalContext && !getType(globalContext) && null !== globalContext.constructor && !getType(globalContext.constructor) && isFunction(globalContext.constructor.isBuffer) && globalContext.constructor.isBuffer(globalContext);
      },
      isFormData: function (globalContext) {
        var index;
        return globalContext && ("function" == typeof FormData && globalContext instanceof FormData || isFunction(globalContext.append) && ("formdata" === (index = processInput(globalContext)) || "object" === index && isFunction(globalContext.toString) && "[object FormData]" === globalContext.toString()));
      },
      isArrayBufferView: function (globalContext) {
        return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(globalContext) : globalContext && globalContext.buffer && _isArrayBufferType(globalContext.buffer);
      },
      isString: protocolScheme,
      isNumber: isNumber,
      isBoolean: function (globalContext) {
        return !0 === globalContext || !1 === globalContext;
      },
      isObject: isNonNullObject,
      isPlainObject: isPlainObject,
      isUndefined: getType,
      isDate: DateConstructor,
      isFile: FileType,
      isBlob: BlobConstructor,
      isRegExp: isRegExp,
      isFunction: isFunction,
      isStream: function (globalContext) {
        return isNonNullObject(globalContext) && isFunction(globalContext.pipe);
      },
      isURLSearchParams: URLSearchParamsConstructor,
      isTypedArray: isUint8Array,
      isFileList: fileListType,
      forEach: forEachElement,
      merge: function globalContext() {
        for (var index = (isNotGlobalObject(this) && this || {}).caseless, userAgent = {}, mergeOptions = function (mergeOptions, mergeWithDefaults) {
            var arraySlice = index && findKeyByValueCaseInsensitive(userAgent, mergeWithDefaults) || mergeWithDefaults;
            isPlainObject(userAgent[arraySlice]) && isPlainObject(mergeOptions) ? userAgent[arraySlice] = globalContext(userAgent[arraySlice], mergeOptions) : isPlainObject(mergeOptions) ? userAgent[arraySlice] = globalContext({}, mergeOptions) : handleResponseHeaders(mergeOptions) ? userAgent[arraySlice] = mergeOptions.slice() : userAgent[arraySlice] = mergeOptions;
          }, mergeWithDefaults = 0, arraySlice = arguments.length; mergeWithDefaults < arraySlice; mergeWithDefaults++) arguments[mergeWithDefaults] && forEachElement(arguments[mergeWithDefaults], mergeOptions);
        return userAgent;
      },
      extend: function (globalContext, index, userAgent) {
        return forEachElement(index, function (index, mergeOptions) {
          userAgent && isFunction(index) ? globalContext[mergeOptions] = baseURLHandler(index, userAgent) : globalContext[mergeOptions] = index;
        }, {
          allOwnKeys: (arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}).allOwnKeys
        }), globalContext;
      },
      trim: function (globalContext) {
        return globalContext.trim ? globalContext.trim() : globalContext.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
      },
      stripBOM: function (globalContext) {
        return 65279 === globalContext.charCodeAt(0) && (globalContext = globalContext.slice(1)), globalContext;
      },
      inherits: function (globalContext, index, userAgent, mergeOptions) {
        globalContext.prototype = Object.create(index.prototype, mergeOptions), globalContext.prototype.constructor = globalContext, Object.defineProperty(globalContext, "super", {
          value: index.prototype
        }), userAgent && Object.assign(globalContext.prototype, userAgent);
      },
      toFlatObject: function (globalContext, index, userAgent, mergeOptions) {
        var mergeWithDefaults,
          arraySlice,
          baseURLHandler,
          requestHandler = {};
        if (index = index || {}, null == globalContext) return index;
        do {
          for (arraySlice = (mergeWithDefaults = Object.getOwnPropertyNames(globalContext)).length; arraySlice-- > 0;) baseURLHandler = mergeWithDefaults[arraySlice], mergeOptions && !mergeOptions(baseURLHandler, globalContext, index) || requestHandler[baseURLHandler] || (index[baseURLHandler] = globalContext[baseURLHandler], requestHandler[baseURLHandler] = !0);
          globalContext = !1 !== userAgent && xmlHttpRequest(globalContext);
        } while (globalContext && (!userAgent || userAgent(globalContext, index)) && globalContext !== Object.prototype);
        return index;
      },
      kindOf: processInput,
      kindOfTest: isArrayBufferType,
      endsWith: function (globalContext, index, userAgent) {
        globalContext = String(globalContext), (void 0 === userAgent || userAgent > globalContext.length) && (userAgent = globalContext.length), userAgent -= index.length;
        var mergeOptions = globalContext.indexOf(index, userAgent);
        return -1 !== mergeOptions && mergeOptions === userAgent;
      },
      toArray: function (globalContext) {
        if (!globalContext) return null;
        if (handleResponseHeaders(globalContext)) return globalContext;
        var index = globalContext.length;
        if (!isNumber(index)) return null;
        for (var userAgent = new Array(index); index-- > 0;) userAgent[index] = globalContext[index];
        return userAgent;
      },
      forEachEntry: function (globalContext, index) {
        for (var userAgent, mergeOptions = (globalContext && globalContext[Symbol.iterator]).call(globalContext); (userAgent = mergeOptions.next()) && !userAgent.done;) {
          var mergeWithDefaults = userAgent.value;
          index.call(globalContext, mergeWithDefaults[0], mergeWithDefaults[1]);
        }
      },
      matchAll: function (globalContext, index) {
        for (var userAgent, mergeOptions = []; null !== (userAgent = globalContext.exec(index));) mergeOptions.push(userAgent);
        return mergeOptions;
      },
      isHTMLForm: HTMLFormElementType,
      hasOwnProperty: _hasOwnProperty,
      hasOwnProp: _hasOwnProperty,
      reduceDescriptors: definePropertiesWithTransform,
      freezeMethods: function (globalContext) {
        definePropertiesWithTransform(globalContext, function (index, userAgent) {
          if (isFunction(globalContext) && -1 !== ["arguments", "caller", "callee"].indexOf(userAgent)) return !1;
          var mergeOptions = globalContext[userAgent];
          isFunction(mergeOptions) && (index.enumerable = !1, "writable" in index ? index.writable = !1 : index.set || (index.set = function () {
            throw Error("Can not rewrite read-only method '" + userAgent + "'");
          }));
        });
      },
      toObjectSet: function (globalContext, index) {
        var userAgent = {},
          mergeOptions = function (globalContext) {
            globalContext.forEach(function (globalContext) {
              userAgent[globalContext] = !0;
            });
          };
        return handleResponseHeaders(globalContext) ? mergeOptions(globalContext) : mergeOptions(String(globalContext).split(index)), userAgent;
      },
      toCamelCase: function (globalContext) {
        return globalContext.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (globalContext, index, userAgent) {
          return index.toUpperCase() + userAgent;
        });
      },
      noop: function () {},
      toFiniteNumber: function (globalContext, index) {
        return globalContext = +globalContext, Number.isFinite(globalContext) ? globalContext : index;
      },
      findKey: findKeyByValueCaseInsensitive,
      global: globalScope,
      isContextDefined: isNotGlobalObject,
      ALPHABET: CharacterCategories,
      generateString: function () {
        for (var globalContext = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 16, index = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : CharacterCategories.ALPHA_DIGIT, userAgent = "", mergeOptions = index.length; globalContext--;) userAgent += index[Math.random() * mergeOptions | 0];
        return userAgent;
      },
      isSpecCompliantForm: function (globalContext) {
        return !!(globalContext && isFunction(globalContext.append) && "FormData" === globalContext[Symbol.toStringTag] && globalContext[Symbol.iterator]);
      },
      toJSONObject: function (globalContext) {
        var index = new Array(10);
        return function globalContext(userAgent, mergeOptions) {
          if (isNonNullObject(userAgent)) {
            if (index.indexOf(userAgent) >= 0) return;
            if (!("toJSON" in userAgent)) {
              index[mergeOptions] = userAgent;
              var mergeWithDefaults = handleResponseHeaders(userAgent) ? [] : {};
              return forEachElement(userAgent, function (index, userAgent) {
                var arraySlice = globalContext(index, mergeOptions + 1);
                !getType(arraySlice) && (mergeWithDefaults[userAgent] = arraySlice);
              }), index[mergeOptions] = void 0, mergeWithDefaults;
            }
          }
          return userAgent;
        }(globalContext, 0);
      },
      isAsyncFn: isAsyncFunction,
      isThenable: function (globalContext) {
        return globalContext && (isNonNullObject(globalContext) || isFunction(globalContext)) && isFunction(globalContext.then) && isFunction(globalContext.catch);
      }
    };
  function AxiosError(globalContext, index, userAgent, mergeOptions, mergeWithDefaults) {
    Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = globalContext, this.name = "AxiosError", index && (this.code = index), userAgent && (this.config = userAgent), mergeOptions && (this.request = mergeOptions), mergeWithDefaults && (this.response = mergeWithDefaults);
  }
  utils.inherits(AxiosError, Error, {
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
        config: utils.toJSONObject(this.config),
        code: this.code,
        status: this.response && this.response.status ? this.response.status : null
      };
    }
  });
  var ErrorCodes = AxiosError.prototype,
    _ErrorCodes = {};
  ["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(function (globalContext) {
    _ErrorCodes[globalContext] = {
      value: globalContext
    };
  }), Object.defineProperties(AxiosError, _ErrorCodes), Object.defineProperty(ErrorCodes, "isAxiosError", {
    value: !0
  }), AxiosError.from = function (globalContext, index, userAgent, mergeOptions, mergeWithDefaults, arraySlice) {
    var baseURLHandler = Object.create(ErrorCodes);
    return utils.toFlatObject(globalContext, baseURLHandler, function (globalContext) {
      return globalContext !== Error.prototype;
    }, function (globalContext) {
      return "isAxiosError" !== globalContext;
    }), AxiosError.call(baseURLHandler, globalContext.message, index, userAgent, mergeOptions, mergeWithDefaults), baseURLHandler.cause = globalContext, baseURLHandler.name = globalContext.name, arraySlice && Object.assign(baseURLHandler, arraySlice), baseURLHandler;
  };
  function isObjectOrArray(globalContext) {
    return utils.isPlainObject(globalContext) || utils.isArray(globalContext);
  }
  function removeArraySuffix(globalContext) {
    return utils.endsWith(globalContext, "[]") ? globalContext.slice(0, -2) : globalContext;
  }
  function concatArrayWithIndex(globalContext, index, userAgent) {
    return globalContext ? globalContext.concat(index).map(function (globalContext, index) {
      return globalContext = removeArraySuffix(globalContext), !userAgent && index ? "[" + globalContext + "]" : globalContext;
    }).join(userAgent ? "." : "") : index;
  }
  var isPlainObjectProperties = utils.toFlatObject(utils, {}, null, function (globalContext) {
    return /^is[A-Z]/.test(globalContext);
  });
  function mergeFormData(index, userAgent, mergeOptions) {
    if (!utils.isObject(index)) throw new TypeError("target must be an object");
    userAgent = userAgent || new FormData();
    var mergeWithDefaults = (mergeOptions = utils.toFlatObject(mergeOptions, {
        metaTokens: !0,
        dots: !1,
        indexes: !1
      }, !1, function (globalContext, index) {
        return !utils.isUndefined(index[globalContext]);
      })).metaTokens,
      arraySlice = mergeOptions.visitor || processInput,
      baseURLHandler = mergeOptions.dots,
      requestHandler = mergeOptions.indexes,
      responseTime = (mergeOptions.Blob || "undefined" != typeof Blob && Blob) && utils.isSpecCompliantForm(userAgent);
    if (!utils.isFunction(arraySlice)) throw new TypeError("visitor must be a function");
    function xmlHttpRequest(globalContext) {
      if (null === globalContext) return "";
      if (utils.isDate(globalContext)) return globalContext.toISOString();
      if (!responseTime && utils.isBlob(globalContext)) throw new AxiosError("Blob is not supported. Use a Buffer instead.");
      return utils.isArrayBuffer(globalContext) || utils.isTypedArray(globalContext) ? responseTime && "function" == typeof Blob ? new Blob([globalContext]) : Buffer.from(globalContext) : globalContext;
    }
    function processInput(index, mergeOptions, arraySlice) {
      var responseTime = index;
      if (index && !arraySlice && "object" === globalContext(index)) if (utils.endsWith(mergeOptions, "{}")) mergeOptions = mergeWithDefaults ? mergeOptions : mergeOptions.slice(0, -2), index = JSON.stringify(index);else if (utils.isArray(index) && function (globalContext) {
        return utils.isArray(globalContext) && !globalContext.some(isObjectOrArray);
      }(index) || (utils.isFileList(index) || utils.endsWith(mergeOptions, "[]")) && (responseTime = utils.toArray(index))) return mergeOptions = removeArraySuffix(mergeOptions), responseTime.forEach(function (globalContext, index) {
        !utils.isUndefined(globalContext) && null !== globalContext && userAgent.append(!0 === requestHandler ? concatArrayWithIndex([mergeOptions], index, baseURLHandler) : null === requestHandler ? mergeOptions : mergeOptions + "[]", xmlHttpRequest(globalContext));
      }), !1;
      return !!isObjectOrArray(index) || (userAgent.append(concatArrayWithIndex(arraySlice, mergeOptions, baseURLHandler), xmlHttpRequest(index)), !1);
    }
    var isArrayBufferType = [],
      currentInterceptorIndex = Object.assign(isPlainObjectProperties, {
        defaultVisitor: processInput,
        convertValue: xmlHttpRequest,
        isVisitable: isObjectOrArray
      });
    if (!utils.isObject(index)) throw new TypeError("data must be an object");
    return function globalContext(index, mergeOptions) {
      if (!utils.isUndefined(index)) {
        if (-1 !== isArrayBufferType.indexOf(index)) throw Error("Circular reference detected in " + mergeOptions.join("."));
        isArrayBufferType.push(index), utils.forEach(index, function (index, mergeWithDefaults) {
          !0 === (!(utils.isUndefined(index) || null === index) && arraySlice.call(userAgent, index, utils.isString(mergeWithDefaults) ? mergeWithDefaults.trim() : mergeWithDefaults, mergeOptions, currentInterceptorIndex)) && globalContext(index, mergeOptions ? mergeOptions.concat(mergeWithDefaults) : [mergeWithDefaults]);
        }), isArrayBufferType.pop();
      }
    }(index), userAgent;
  }
  function encodeURIComponentCustom(globalContext) {
    var index = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0"
    };
    return encodeURIComponent(globalContext).replace(/[!'()~]|%20|%00/g, function (globalContext) {
      return index[globalContext];
    });
  }
  function KeyValuePairHandler(globalContext, index) {
    this._pairs = [], globalContext && mergeFormData(globalContext, this, index);
  }
  var XPrototype = KeyValuePairHandler.prototype;
  function decodeURIComponentWithCustomMappings(globalContext) {
    return encodeURIComponent(globalContext).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  function appendQueryParams(globalContext, index, userAgent) {
    if (!index) return globalContext;
    var mergeOptions,
      mergeWithDefaults = userAgent && userAgent.encode || decodeURIComponentWithCustomMappings,
      arraySlice = userAgent && userAgent.serialize;
    if (mergeOptions = arraySlice ? arraySlice(index, userAgent) : utils.isURLSearchParams(index) ? index.toString() : new KeyValuePairHandler(index, userAgent).toString(mergeWithDefaults)) {
      var baseURLHandler = globalContext.indexOf("#");
      -1 !== baseURLHandler && (globalContext = globalContext.slice(0, baseURLHandler)), globalContext += (-1 === globalContext.indexOf("?") ? "?" : "&") + mergeOptions;
    }
    return globalContext;
  }
  XPrototype.append = function (globalContext, index) {
    this._pairs.push([globalContext, index]);
  }, XPrototype.toString = function (globalContext) {
    var index = globalContext ? function (index) {
      return globalContext.call(this, index, encodeURIComponentCustom);
    } : encodeURIComponentCustom;
    return this._pairs.map(function (globalContext) {
      return index(globalContext[0]) + "=" + index(globalContext[1]);
    }, "").join("&");
  };
  var eventEmitter,
    createHandler = function () {
      function globalContext() {
        index(this, globalContext), this.handlers = [];
      }
      return mergeOptions(globalContext, [{
        key: "use",
        value: function (globalContext, index, userAgent) {
          return this.handlers.push({
            fulfilled: globalContext,
            rejected: index,
            synchronous: !!userAgent && userAgent.synchronous,
            runWhen: userAgent ? userAgent.runWhen : null
          }), this.handlers.length - 1;
        }
      }, {
        key: "eject",
        value: function (globalContext) {
          this.handlers[globalContext] && (this.handlers[globalContext] = null);
        }
      }, {
        key: "clear",
        value: function () {
          this.handlers && (this.handlers = []);
        }
      }, {
        key: "forEach",
        value: function (globalContext) {
          utils.forEach(this.handlers, function (index) {
            null !== index && globalContext(index);
          });
        }
      }]), globalContext;
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
      isStandardBrowserEnv: ("undefined" == typeof navigator || "ReactNative" !== (eventEmitter = navigator.product) && "NativeScript" !== eventEmitter && "NS" !== eventEmitter) && "undefined" != typeof window && "undefined" != typeof document,
      isStandardBrowserWebWorkerEnv: "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && "function" == typeof self.importScripts,
      protocols: ["http", "https", "file", "blob", "url", "data"]
    };
  function processArrayElement(globalContext) {
    function index(globalContext, userAgent, mergeOptions, mergeWithDefaults) {
      var arraySlice = globalContext[mergeWithDefaults++],
        baseURLHandler = Number.isFinite(+arraySlice),
        requestHandler = mergeWithDefaults >= globalContext.length;
      return arraySlice = !arraySlice && utils.isArray(mergeOptions) ? mergeOptions.length : arraySlice, requestHandler ? (utils.hasOwnProp(mergeOptions, arraySlice) ? mergeOptions[arraySlice] = [mergeOptions[arraySlice], userAgent] : mergeOptions[arraySlice] = userAgent, !baseURLHandler) : (mergeOptions[arraySlice] && utils.isObject(mergeOptions[arraySlice]) || (mergeOptions[arraySlice] = []), index(globalContext, userAgent, mergeOptions[arraySlice], mergeWithDefaults) && utils.isArray(mergeOptions[arraySlice]) && (mergeOptions[arraySlice] = function (globalContext) {
        var index,
          userAgent,
          mergeOptions = {},
          mergeWithDefaults = Object.keys(globalContext),
          arraySlice = mergeWithDefaults.length;
        for (index = 0; index < arraySlice; index++) mergeOptions[userAgent = mergeWithDefaults[index]] = globalContext[userAgent];
        return mergeOptions;
      }(mergeOptions[arraySlice])), !baseURLHandler);
    }
    if (utils.isFormData(globalContext) && utils.isFunction(globalContext.entries)) {
      var userAgent = {};
      return utils.forEachEntry(globalContext, function (globalContext, mergeOptions) {
        index(function (globalContext) {
          return utils.matchAll(/\w+|\[(\w*)]/g, globalContext).map(function (globalContext) {
            return "[]" === globalContext[0] ? "" : globalContext[1] || globalContext[0];
          });
        }(globalContext), mergeOptions, userAgent, 0);
      }), userAgent;
    }
    return null;
  }
  var formDataEntries = {
    transitional: jsonParsingOptions,
    adapter: ["xhr", "http"],
    transformRequest: [function (globalContext, index) {
      var userAgent,
        mergeOptions = index.getContentType() || "",
        mergeWithDefaults = mergeOptions.indexOf("application/json") > -1,
        arraySlice = utils.isObject(globalContext);
      if (arraySlice && utils.isHTMLForm(globalContext) && (globalContext = new FormData(globalContext)), utils.isFormData(globalContext)) return mergeWithDefaults && mergeWithDefaults ? JSON.stringify(processArrayElement(globalContext)) : globalContext;
      if (utils.isArrayBuffer(globalContext) || utils.isBuffer(globalContext) || utils.isStream(globalContext) || utils.isFile(globalContext) || utils.isBlob(globalContext)) return globalContext;
      if (utils.isArrayBufferView(globalContext)) return globalContext.buffer;
      if (utils.isURLSearchParams(globalContext)) return index.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), globalContext.toString();
      if (arraySlice) {
        if (mergeOptions.indexOf("application/x-www-form-urlencoded") > -1) return function (globalContext, index) {
          return mergeFormData(globalContext, new browserEnvironment.classes.URLSearchParams(), Object.assign({
            visitor: function (globalContext, index, userAgent, mergeOptions) {
              return browserEnvironment.isNode && utils.isBuffer(globalContext) ? (this.append(index, globalContext.toString("base64")), !1) : mergeOptions.defaultVisitor.apply(this, arguments);
            }
          }, index));
        }(globalContext, this.formSerializer).toString();
        if ((userAgent = utils.isFileList(globalContext)) || mergeOptions.indexOf("multipart/form-data") > -1) {
          var baseURLHandler = this.env && this.env.FormData;
          return mergeFormData(userAgent ? {
            "files[]": globalContext
          } : globalContext, baseURLHandler && new baseURLHandler(), this.formSerializer);
        }
      }
      return arraySlice || mergeWithDefaults ? (index.setContentType("application/json", !1), function (globalContext, index, userAgent) {
        if (utils.isString(globalContext)) try {
          return (index || JSON.parse)(globalContext), utils.trim(globalContext);
        } catch (globalContext) {
          if ("SyntaxError" !== globalContext.name) throw globalContext;
        }
        return (userAgent || JSON.stringify)(globalContext);
      }(globalContext)) : globalContext;
    }],
    transformResponse: [function (globalContext) {
      var index = this.transitional || formDataEntries.transitional,
        userAgent = index && index.forcedJSONParsing,
        mergeOptions = "json" === this.responseType;
      if (globalContext && utils.isString(globalContext) && (userAgent && !this.responseType || mergeOptions)) {
        var mergeWithDefaults = !(index && index.silentJSONParsing) && mergeOptions;
        try {
          return JSON.parse(globalContext);
        } catch (globalContext) {
          if (mergeWithDefaults) {
            if ("SyntaxError" === globalContext.name) throw AxiosError.from(globalContext, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
            throw globalContext;
          }
        }
      }
      return globalContext;
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
    validateStatus: function (globalContext) {
      return globalContext >= 200 && globalContext < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": void 0
      }
    }
  };
  utils.forEach(["delete", "get", "head", "post", "put", "patch"], function (globalContext) {
    formDataEntries.headers[globalContext] = {};
  });
  var httpRequestConfig = formDataEntries,
    allowedHeaders = utils.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]),
    internalsSymbol = Symbol("internals");
  function normalizeString(globalContext) {
    return globalContext && String(globalContext).trim().toLowerCase();
  }
  function normalizeValue(globalContext) {
    return !1 === globalContext || null == globalContext ? globalContext : utils.isArray(globalContext) ? globalContext.map(normalizeValue) : String(globalContext);
  }
  function stringContainsPattern(globalContext, index, userAgent, mergeOptions, mergeWithDefaults) {
    return utils.isFunction(mergeOptions) ? mergeOptions.call(this, index, userAgent) : (mergeWithDefaults && (index = userAgent), utils.isString(index) ? utils.isString(mergeOptions) ? -1 !== index.indexOf(mergeOptions) : utils.isRegExp(mergeOptions) ? mergeOptions.test(index) : void 0 : void 0);
  }
  var headerManager = function () {
    function globalContext(userAgent) {
      index(this, globalContext), userAgent && this.set(userAgent);
    }
    return mergeOptions(globalContext, [{
      key: "set",
      value: function (globalContext, index, userAgent) {
        var mergeOptions = this;
        function mergeWithDefaults(globalContext, index, userAgent) {
          var mergeWithDefaults = normalizeString(index);
          if (!mergeWithDefaults) throw new Error("header name must be a non-empty string");
          var arraySlice = utils.findKey(mergeOptions, mergeWithDefaults);
          (!arraySlice || void 0 === mergeOptions[arraySlice] || !0 === userAgent || void 0 === userAgent && !1 !== mergeOptions[arraySlice]) && (mergeOptions[arraySlice || index] = normalizeValue(globalContext));
        }
        var arraySlice,
          baseURLHandler,
          requestHandler,
          responseTime,
          xmlHttpRequest,
          processInput = function (globalContext, index) {
            return utils.forEach(globalContext, function (globalContext, userAgent) {
              return mergeWithDefaults(globalContext, userAgent, index);
            });
          };
        return utils.isPlainObject(globalContext) || globalContext instanceof this.constructor ? processInput(globalContext, index) : utils.isString(globalContext) && (globalContext = globalContext.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(globalContext.trim()) ? processInput((xmlHttpRequest = {}, (arraySlice = globalContext) && arraySlice.split("\n").forEach(function (globalContext) {
          responseTime = globalContext.indexOf(":"), baseURLHandler = globalContext.substring(0, responseTime).trim().toLowerCase(), requestHandler = globalContext.substring(responseTime + 1).trim(), !baseURLHandler || xmlHttpRequest[baseURLHandler] && allowedHeaders[baseURLHandler] || ("set-cookie" === baseURLHandler ? xmlHttpRequest[baseURLHandler] ? xmlHttpRequest[baseURLHandler].push(requestHandler) : xmlHttpRequest[baseURLHandler] = [requestHandler] : xmlHttpRequest[baseURLHandler] = xmlHttpRequest[baseURLHandler] ? xmlHttpRequest[baseURLHandler] + ", " + requestHandler : requestHandler);
        }), xmlHttpRequest), index) : null != globalContext && mergeWithDefaults(index, globalContext, userAgent), this;
      }
    }, {
      key: "get",
      value: function (globalContext, index) {
        if (globalContext = normalizeString(globalContext)) {
          var userAgent = utils.findKey(this, globalContext);
          if (userAgent) {
            var mergeOptions = this[userAgent];
            if (!index) return mergeOptions;
            if (!0 === index) return function (globalContext) {
              for (var index, userAgent = Object.create(null), mergeOptions = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; index = mergeOptions.exec(globalContext);) userAgent[index[1]] = index[2];
              return userAgent;
            }(mergeOptions);
            if (utils.isFunction(index)) return index.call(this, mergeOptions, userAgent);
            if (utils.isRegExp(index)) return index.exec(mergeOptions);
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
    }, {
      key: "has",
      value: function (globalContext, index) {
        if (globalContext = normalizeString(globalContext)) {
          var userAgent = utils.findKey(this, globalContext);
          return !(!userAgent || void 0 === this[userAgent] || index && !stringContainsPattern(0, this[userAgent], userAgent, index));
        }
        return !1;
      }
    }, {
      key: "delete",
      value: function (globalContext, index) {
        var userAgent = this,
          mergeOptions = !1;
        function mergeWithDefaults(globalContext) {
          if (globalContext = normalizeString(globalContext)) {
            var mergeWithDefaults = utils.findKey(userAgent, globalContext);
            !mergeWithDefaults || index && !stringContainsPattern(0, userAgent[mergeWithDefaults], mergeWithDefaults, index) || (delete userAgent[mergeWithDefaults], mergeOptions = !0);
          }
        }
        return utils.isArray(globalContext) ? globalContext.forEach(mergeWithDefaults) : mergeWithDefaults(globalContext), mergeOptions;
      }
    }, {
      key: "clear",
      value: function (globalContext) {
        for (var index = Object.keys(this), userAgent = index.length, mergeOptions = !1; userAgent--;) {
          var mergeWithDefaults = index[userAgent];
          globalContext && !stringContainsPattern(0, this[mergeWithDefaults], mergeWithDefaults, globalContext, !0) || (delete this[mergeWithDefaults], mergeOptions = !0);
        }
        return mergeOptions;
      }
    }, {
      key: "normalize",
      value: function (globalContext) {
        var index = this,
          userAgent = {};
        return utils.forEach(this, function (mergeOptions, mergeWithDefaults) {
          var arraySlice = utils.findKey(userAgent, mergeWithDefaults);
          if (arraySlice) return index[arraySlice] = normalizeValue(mergeOptions), void delete index[mergeWithDefaults];
          var baseURLHandler = globalContext ? function (globalContext) {
            return globalContext.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function (globalContext, index, userAgent) {
              return index.toUpperCase() + userAgent;
            });
          }(mergeWithDefaults) : String(mergeWithDefaults).trim();
          baseURLHandler !== mergeWithDefaults && delete index[mergeWithDefaults], index[baseURLHandler] = normalizeValue(mergeOptions), userAgent[baseURLHandler] = !0;
        }), this;
      }
    }, {
      key: "concat",
      value: function () {
        for (var globalContext, index = arguments.length, userAgent = new Array(index), mergeOptions = 0; mergeOptions < index; mergeOptions++) userAgent[mergeOptions] = arguments[mergeOptions];
        return (globalContext = this.constructor).concat.apply(globalContext, [this].concat(userAgent));
      }
    }, {
      key: "toJSON",
      value: function (globalContext) {
        var index = Object.create(null);
        return utils.forEach(this, function (userAgent, mergeOptions) {
          null != userAgent && !1 !== userAgent && (index[mergeOptions] = globalContext && utils.isArray(userAgent) ? userAgent.join(", ") : userAgent);
        }), index;
      }
    }, {
      key: Symbol.iterator,
      value: function () {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }
    }, {
      key: "toString",
      value: function () {
        return Object.entries(this.toJSON()).map(function (globalContext) {
          var index = mergeWithDefaults(globalContext, 2);
          return index[0] + ": " + index[1];
        }).join("\n");
      }
    }, {
      key: Symbol.toStringTag,
      get: function () {
        return "AxiosHeaders";
      }
    }], [{
      key: "from",
      value: function (globalContext) {
        return globalContext instanceof this ? globalContext : new this(globalContext);
      }
    }, {
      key: "concat",
      value: function (globalContext) {
        for (var index = new this(globalContext), userAgent = arguments.length, mergeOptions = new Array(userAgent > 1 ? userAgent - 1 : 0), mergeWithDefaults = 1; mergeWithDefaults < userAgent; mergeWithDefaults++) mergeOptions[mergeWithDefaults - 1] = arguments[mergeWithDefaults];
        return mergeOptions.forEach(function (globalContext) {
          return index.set(globalContext);
        }), index;
      }
    }, {
      key: "accessor",
      value: function (globalContext) {
        var index = (this[internalsSymbol] = this[internalsSymbol] = {
            accessors: {}
          }).accessors,
          userAgent = this.prototype;
        function mergeOptions(globalContext) {
          var mergeOptions = normalizeString(globalContext);
          index[mergeOptions] || (!function (globalContext, index) {
            var userAgent = utils.toCamelCase(" " + index);
            ["get", "set", "has"].forEach(function (mergeOptions) {
              Object.defineProperty(globalContext, mergeOptions + userAgent, {
                value: function (globalContext, userAgent, mergeWithDefaults) {
                  return this[mergeOptions].call(this, index, globalContext, userAgent, mergeWithDefaults);
                },
                configurable: !0
              });
            });
          }(userAgent, globalContext), index[mergeOptions] = !0);
        }
        return utils.isArray(globalContext) ? globalContext.forEach(mergeOptions) : mergeOptions(globalContext), this;
      }
    }]), globalContext;
  }();
  headerManager.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]), utils.reduceDescriptors(headerManager.prototype, function (globalContext, index) {
    var userAgent = globalContext.value,
      mergeOptions = index[0].toUpperCase() + index.slice(1);
    return {
      get: function () {
        return userAgent;
      },
      set: function (globalContext) {
        this[mergeOptions] = globalContext;
      }
    };
  }), utils.freezeMethods(headerManager);
  var dataExtractor = headerManager;
  function processResponse(globalContext, index) {
    var userAgent = this || httpRequestConfig,
      mergeOptions = index || userAgent,
      mergeWithDefaults = dataExtractor.from(mergeOptions.headers),
      arraySlice = mergeOptions.data;
    return utils.forEach(globalContext, function (globalContext) {
      arraySlice = globalContext.call(userAgent, arraySlice, mergeWithDefaults.normalize(), index ? index.status : void 0);
    }), mergeWithDefaults.normalize(), arraySlice;
  }
  function isCancelToken(globalContext) {
    return !(!globalContext || !globalContext.__CANCEL__);
  }
  function CanceledError(globalContext, index, userAgent) {
    AxiosError.call(this, null == globalContext ? "canceled" : globalContext, AxiosError.ERR_CANCELED, index, userAgent), this.name = "CanceledError";
  }
  utils.inherits(CanceledError, AxiosError, {
    __CANCEL__: !0
  });
  var cookieStorage = browserEnvironment.isStandardBrowserEnv ? {
    write: function (globalContext, index, userAgent, mergeOptions, mergeWithDefaults, arraySlice) {
      var baseURLHandler = [];
      baseURLHandler.push(globalContext + "=" + encodeURIComponent(index)), utils.isNumber(userAgent) && baseURLHandler.push("expires=" + new Date(userAgent).toGMTString()), utils.isString(mergeOptions) && baseURLHandler.push("path=" + mergeOptions), utils.isString(mergeWithDefaults) && baseURLHandler.push("domain=" + mergeWithDefaults), !0 === arraySlice && baseURLHandler.push("secure"), document.cookie = baseURLHandler.join("; ");
    },
    read: function (globalContext) {
      var index = document.cookie.match(new RegExp("(^|;\\s*)(" + globalContext + ")=([^;]*)"));
      return index ? decodeURIComponent(index[3]) : null;
    },
    remove: function (globalContext) {
      this.write(globalContext, "", Date.now() - 864e5);
    }
  } : {
    write: function () {},
    read: function () {
      return null;
    },
    remove: function () {}
  };
  function combineUrlWithBase(globalContext, index) {
    return globalContext && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(index) ? function (globalContext, index) {
      return index ? globalContext.replace(/\/+$/, "") + "/" + index.replace(/^\/+/, "") : globalContext;
    }(globalContext, index) : index;
  }
  var isStandardBrowserEnvironment = browserEnvironment.isStandardBrowserEnv ? function () {
    var globalContext,
      index = /(msie|trident)/i.test(navigator.userAgent),
      userAgent = document.createElement("a");
    function mergeOptions(globalContext) {
      var mergeOptions = globalContext;
      return index && (userAgent.setAttribute("href", mergeOptions), mergeOptions = userAgent.href), userAgent.setAttribute("href", mergeOptions), {
        href: userAgent.href,
        protocol: userAgent.protocol ? userAgent.protocol.replace(/:$/, "") : "",
        host: userAgent.host,
        search: userAgent.search ? userAgent.search.replace(/^\?/, "") : "",
        hash: userAgent.hash ? userAgent.hash.replace(/^#/, "") : "",
        hostname: userAgent.hostname,
        port: userAgent.port,
        pathname: "/" === userAgent.pathname.charAt(0) ? userAgent.pathname : "/" + userAgent.pathname
      };
    }
    return globalContext = mergeOptions(window.location.href), function (index) {
      var userAgent = utils.isString(index) ? mergeOptions(index) : index;
      return userAgent.protocol === globalContext.protocol && userAgent.host === globalContext.host;
    };
  }() : function () {
    return !0;
  };
  function rateLimiter(globalContext, index) {
    var userAgent = 0,
      mergeOptions = function (globalContext, index) {
        globalContext = globalContext || 10;
        var userAgent,
          mergeOptions = new Array(globalContext),
          mergeWithDefaults = new Array(globalContext),
          arraySlice = 0,
          baseURLHandler = 0;
        return index = void 0 !== index ? index : 1e3, function (requestHandler) {
          var responseTime = Date.now(),
            xmlHttpRequest = mergeWithDefaults[baseURLHandler];
          userAgent || (userAgent = responseTime), mergeOptions[arraySlice] = requestHandler, mergeWithDefaults[arraySlice] = responseTime;
          for (var processInput = baseURLHandler, isArrayBufferType = 0; processInput !== arraySlice;) isArrayBufferType += mergeOptions[processInput++], processInput %= globalContext;
          if ((arraySlice = (arraySlice + 1) % globalContext) === baseURLHandler && (baseURLHandler = (baseURLHandler + 1) % globalContext), !(responseTime - userAgent < index)) {
            var currentInterceptorIndex = xmlHttpRequest && responseTime - xmlHttpRequest;
            return currentInterceptorIndex ? Math.round(1e3 * isArrayBufferType / currentInterceptorIndex) : void 0;
          }
        };
      }(50, 250);
    return function (mergeWithDefaults) {
      var arraySlice = mergeWithDefaults.loaded,
        baseURLHandler = mergeWithDefaults.lengthComputable ? mergeWithDefaults.total : void 0,
        requestHandler = arraySlice - userAgent,
        responseTime = mergeOptions(requestHandler);
      userAgent = arraySlice;
      var xmlHttpRequest = {
        loaded: arraySlice,
        total: baseURLHandler,
        progress: baseURLHandler ? arraySlice / baseURLHandler : void 0,
        bytes: requestHandler,
        rate: responseTime || void 0,
        estimated: responseTime && baseURLHandler && arraySlice <= baseURLHandler ? (baseURLHandler - arraySlice) / responseTime : void 0,
        event: mergeWithDefaults
      };
      xmlHttpRequest[index ? "download" : "upload"] = !0, globalContext(xmlHttpRequest);
    };
  }
  var httpRequestHandler = {
    http: null,
    xhr: "undefined" != typeof XMLHttpRequest && function (globalContext) {
      return new Promise(function (index, userAgent) {
        var mergeOptions,
          mergeWithDefaults,
          arraySlice = globalContext.data,
          baseURLHandler = dataExtractor.from(globalContext.headers).normalize(),
          requestHandler = globalContext.responseType;
        function responseTime() {
          globalContext.cancelToken && globalContext.cancelToken.unsubscribe(mergeOptions), globalContext.signal && globalContext.signal.removeEventListener("abort", mergeOptions);
        }
        utils.isFormData(arraySlice) && (browserEnvironment.isStandardBrowserEnv || browserEnvironment.isStandardBrowserWebWorkerEnv ? baseURLHandler.setContentType(!1) : baseURLHandler.getContentType(/^\s*multipart\/form-data/) ? utils.isString(mergeWithDefaults = baseURLHandler.getContentType()) && baseURLHandler.setContentType(mergeWithDefaults.replace(/^\s*(multipart\/form-data);+/, "$1")) : baseURLHandler.setContentType("multipart/form-data"));
        var xmlHttpRequest = new XMLHttpRequest();
        if (globalContext.auth) {
          var processInput = globalContext.auth.username || "",
            isArrayBufferType = globalContext.auth.password ? unescape(encodeURIComponent(globalContext.auth.password)) : "";
          baseURLHandler.set("Authorization", "Basic " + btoa(processInput + ":" + isArrayBufferType));
        }
        var currentInterceptorIndex = combineUrlWithBase(globalContext.baseURL, globalContext.url);
        function handleResponseHeaders() {
          if (xmlHttpRequest) {
            var mergeOptions = dataExtractor.from("getAllResponseHeaders" in xmlHttpRequest && xmlHttpRequest.getAllResponseHeaders());
            !function (globalContext, index, userAgent) {
              var mergeOptions = userAgent.config.validateStatus;
              userAgent.status && mergeOptions && !mergeOptions(userAgent.status) ? index(new AxiosError("Request failed with status code " + userAgent.status, [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(userAgent.status / 100) - 4], userAgent.config, userAgent.request, userAgent)) : globalContext(userAgent);
            }(function (globalContext) {
              index(globalContext), responseTime();
            }, function (globalContext) {
              userAgent(globalContext), responseTime();
            }, {
              data: requestHandler && "text" !== requestHandler && "json" !== requestHandler ? xmlHttpRequest.response : xmlHttpRequest.responseText,
              status: xmlHttpRequest.status,
              statusText: xmlHttpRequest.statusText,
              headers: mergeOptions,
              config: globalContext,
              request: xmlHttpRequest
            }), xmlHttpRequest = null;
          }
        }
        if (xmlHttpRequest.open(globalContext.method.toUpperCase(), appendQueryParams(currentInterceptorIndex, globalContext.params, globalContext.paramsSerializer), !0), xmlHttpRequest.timeout = globalContext.timeout, "onloadend" in xmlHttpRequest ? xmlHttpRequest.onloadend = handleResponseHeaders : xmlHttpRequest.onreadystatechange = function () {
          xmlHttpRequest && 4 === xmlHttpRequest.readyState && (0 !== xmlHttpRequest.status || xmlHttpRequest.responseURL && 0 === xmlHttpRequest.responseURL.indexOf("file:")) && setTimeout(handleResponseHeaders);
        }, xmlHttpRequest.onabort = function () {
          xmlHttpRequest && (userAgent(new AxiosError("Request aborted", AxiosError.ECONNABORTED, globalContext, xmlHttpRequest)), xmlHttpRequest = null);
        }, xmlHttpRequest.onerror = function () {
          userAgent(new AxiosError("Network Error", AxiosError.ERR_NETWORK, globalContext, xmlHttpRequest)), xmlHttpRequest = null;
        }, xmlHttpRequest.ontimeout = function () {
          var index = globalContext.timeout ? "timeout of " + globalContext.timeout + "ms exceeded" : "timeout exceeded",
            mergeOptions = globalContext.transitional || jsonParsingOptions;
          globalContext.timeoutErrorMessage && (index = globalContext.timeoutErrorMessage), userAgent(new AxiosError(index, mergeOptions.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED, globalContext, xmlHttpRequest)), xmlHttpRequest = null;
        }, browserEnvironment.isStandardBrowserEnv) {
          var getType = isStandardBrowserEnvironment(currentInterceptorIndex) && globalContext.xsrfCookieName && cookieStorage.read(globalContext.xsrfCookieName);
          getType && baseURLHandler.set(globalContext.xsrfHeaderName, getType);
        }
        void 0 === arraySlice && baseURLHandler.setContentType(null), "setRequestHeader" in xmlHttpRequest && utils.forEach(baseURLHandler.toJSON(), function (globalContext, index) {
          xmlHttpRequest.setRequestHeader(index, globalContext);
        }), utils.isUndefined(globalContext.withCredentials) || (xmlHttpRequest.withCredentials = !!globalContext.withCredentials), requestHandler && "json" !== requestHandler && (xmlHttpRequest.responseType = globalContext.responseType), "function" == typeof globalContext.onDownloadProgress && xmlHttpRequest.addEventListener("progress", rateLimiter(globalContext.onDownloadProgress, !0)), "function" == typeof globalContext.onUploadProgress && xmlHttpRequest.upload && xmlHttpRequest.upload.addEventListener("progress", rateLimiter(globalContext.onUploadProgress)), (globalContext.cancelToken || globalContext.signal) && (mergeOptions = function (index) {
          xmlHttpRequest && (userAgent(!index || index.type ? new CanceledError(null, globalContext, xmlHttpRequest) : index), xmlHttpRequest.abort(), xmlHttpRequest = null);
        }, globalContext.cancelToken && globalContext.cancelToken.subscribe(mergeOptions), globalContext.signal && (globalContext.signal.aborted ? mergeOptions() : globalContext.signal.addEventListener("abort", mergeOptions)));
        var _isArrayBufferType,
          protocolScheme = (_isArrayBufferType = /^([-+\w]{1,25})(:?\/\/|:)/.exec(currentInterceptorIndex)) && _isArrayBufferType[1] || "";
        protocolScheme && -1 === browserEnvironment.protocols.indexOf(protocolScheme) ? userAgent(new AxiosError("Unsupported protocol " + protocolScheme + ":", AxiosError.ERR_BAD_REQUEST, globalContext)) : xmlHttpRequest.send(arraySlice || null);
      });
    }
  };
  utils.forEach(httpRequestHandler, function (globalContext, index) {
    if (globalContext) {
      try {
        Object.defineProperty(globalContext, "name", {
          value: index
        });
      } catch (globalContext) {}
      Object.defineProperty(globalContext, "adapterName", {
        value: index
      });
    }
  });
  var formatProtocolErrorMessage = function (globalContext) {
      return "- ".concat(globalContext);
    },
    isValidAdapter = function (globalContext) {
      return utils.isFunction(globalContext) || null === globalContext || !1 === globalContext;
    },
    getAdapter = function (globalContext) {
      for (var index, userAgent, mergeOptions = (globalContext = utils.isArray(globalContext) ? globalContext : [globalContext]).length, arraySlice = {}, baseURLHandler = 0; baseURLHandler < mergeOptions; baseURLHandler++) {
        var requestHandler = void 0;
        if (userAgent = index = globalContext[baseURLHandler], !isValidAdapter(index) && void 0 === (userAgent = httpRequestHandler[(requestHandler = String(index)).toLowerCase()])) throw new AxiosError("Unknown adapter '".concat(requestHandler, "'"));
        if (userAgent) break;
        arraySlice[requestHandler || "#" + baseURLHandler] = userAgent;
      }
      if (!userAgent) {
        var responseTime = Object.entries(arraySlice).map(function (globalContext) {
          var index = mergeWithDefaults(globalContext, 2),
            userAgent = index[0],
            mergeOptions = index[1];
          return "adapter ".concat(userAgent, " ") + (!1 === mergeOptions ? "is not supported by the environment" : "is not available in the build");
        });
        throw new AxiosError("There is no suitable adapter to dispatch the request " + (mergeOptions ? responseTime.length > 1 ? "since :\n" + responseTime.map(formatProtocolErrorMessage).join("\n") : " " + formatProtocolErrorMessage(responseTime[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
      }
      return userAgent;
    };
  function checkRequestCancellation(globalContext) {
    if (globalContext.cancelToken && globalContext.cancelToken.throwIfRequested(), globalContext.signal && globalContext.signal.aborted) throw new CanceledError(null, globalContext);
  }
  function processRequest(globalContext) {
    return checkRequestCancellation(globalContext), globalContext.headers = dataExtractor.from(globalContext.headers), globalContext.data = processResponse.call(globalContext, globalContext.transformRequest), -1 !== ["post", "put", "patch"].indexOf(globalContext.method) && globalContext.headers.setContentType("application/x-www-form-urlencoded", !1), getAdapter(globalContext.adapter || httpRequestConfig.adapter)(globalContext).then(function (index) {
      return checkRequestCancellation(globalContext), index.data = processResponse.call(globalContext, globalContext.transformResponse, index), index.headers = dataExtractor.from(index.headers), index;
    }, function (index) {
      return isCancelToken(index) || (checkRequestCancellation(globalContext), index && index.response && (index.response.data = processResponse.call(globalContext, globalContext.transformResponse, index.response), index.response.headers = dataExtractor.from(index.response.headers))), Promise.reject(index);
    });
  }
  var convertToJSON = function (globalContext) {
    return globalContext instanceof dataExtractor ? globalContext.toJSON() : globalContext;
  };
  function _mergeOptions(globalContext, index) {
    index = index || {};
    var userAgent = {};
    function mergeOptions(globalContext, index, userAgent) {
      return utils.isPlainObject(globalContext) && utils.isPlainObject(index) ? utils.merge.call({
        caseless: userAgent
      }, globalContext, index) : utils.isPlainObject(index) ? utils.merge({}, index) : utils.isArray(index) ? index.slice() : index;
    }
    function mergeWithDefaults(globalContext, index, userAgent) {
      return utils.isUndefined(index) ? utils.isUndefined(globalContext) ? void 0 : mergeOptions(void 0, globalContext, userAgent) : mergeOptions(globalContext, index, userAgent);
    }
    function arraySlice(globalContext, index) {
      if (!utils.isUndefined(index)) return mergeOptions(void 0, index);
    }
    function baseURLHandler(globalContext, index) {
      return utils.isUndefined(index) ? utils.isUndefined(globalContext) ? void 0 : mergeOptions(void 0, globalContext) : mergeOptions(void 0, index);
    }
    function requestHandler(userAgent, mergeWithDefaults, arraySlice) {
      return arraySlice in index ? mergeOptions(userAgent, mergeWithDefaults) : arraySlice in globalContext ? mergeOptions(void 0, userAgent) : void 0;
    }
    var responseTime = {
      url: arraySlice,
      method: arraySlice,
      data: arraySlice,
      baseURL: baseURLHandler,
      transformRequest: baseURLHandler,
      transformResponse: baseURLHandler,
      paramsSerializer: baseURLHandler,
      timeout: baseURLHandler,
      timeoutMessage: baseURLHandler,
      withCredentials: baseURLHandler,
      adapter: baseURLHandler,
      responseType: baseURLHandler,
      xsrfCookieName: baseURLHandler,
      xsrfHeaderName: baseURLHandler,
      onUploadProgress: baseURLHandler,
      onDownloadProgress: baseURLHandler,
      decompress: baseURLHandler,
      maxContentLength: baseURLHandler,
      maxBodyLength: baseURLHandler,
      beforeRedirect: baseURLHandler,
      transport: baseURLHandler,
      httpAgent: baseURLHandler,
      httpsAgent: baseURLHandler,
      cancelToken: baseURLHandler,
      socketPath: baseURLHandler,
      responseEncoding: baseURLHandler,
      validateStatus: requestHandler,
      headers: function (globalContext, index) {
        return mergeWithDefaults(convertToJSON(globalContext), convertToJSON(index), !0);
      }
    };
    return utils.forEach(Object.keys(Object.assign({}, globalContext, index)), function (mergeOptions) {
      var arraySlice = responseTime[mergeOptions] || mergeWithDefaults,
        baseURLHandler = arraySlice(globalContext[mergeOptions], index[mergeOptions], mergeOptions);
      utils.isUndefined(baseURLHandler) && arraySlice !== requestHandler || (userAgent[mergeOptions] = baseURLHandler);
    }), userAgent;
  }
  var axiosVersion = "1.6.0",
    typeCheckers = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(function (index, userAgent) {
    typeCheckers[index] = function (mergeOptions) {
      return globalContext(mergeOptions) === index || "a" + (userAgent < 1 ? "n " : " ") + index;
    };
  });
  var transitionalOptions = {};
  typeCheckers.transitional = function (globalContext, index, userAgent) {
    function mergeOptions(globalContext, index) {
      return "[Axios v1.6.0] Transitional option '" + globalContext + "'" + index + (userAgent ? ". " + userAgent : "");
    }
    return function (userAgent, mergeWithDefaults, arraySlice) {
      if (!1 === globalContext) throw new AxiosError(mergeOptions(mergeWithDefaults, " has been removed" + (index ? " in " + index : "")), AxiosError.ERR_DEPRECATED);
      return index && !transitionalOptions[mergeWithDefaults] && (transitionalOptions[mergeWithDefaults] = !0, console.warn(mergeOptions(mergeWithDefaults, " has been deprecated since v" + index + " and will be removed in the near future"))), !globalContext || globalContext(userAgent, mergeWithDefaults, arraySlice);
    };
  };
  var optionsValidator = {
      assertOptions: function (index, userAgent, mergeOptions) {
        if ("object" !== globalContext(index)) throw new AxiosError("options must be an object", AxiosError.ERR_BAD_OPTION_VALUE);
        for (var mergeWithDefaults = Object.keys(index), arraySlice = mergeWithDefaults.length; arraySlice-- > 0;) {
          var baseURLHandler = mergeWithDefaults[arraySlice],
            requestHandler = userAgent[baseURLHandler];
          if (requestHandler) {
            var responseTime = index[baseURLHandler],
              xmlHttpRequest = void 0 === responseTime || requestHandler(responseTime, baseURLHandler, index);
            if (!0 !== xmlHttpRequest) throw new AxiosError("option " + baseURLHandler + " must be " + xmlHttpRequest, AxiosError.ERR_BAD_OPTION_VALUE);
          } else if (!0 !== mergeOptions) throw new AxiosError("Unknown option " + baseURLHandler, AxiosError.ERR_BAD_OPTION);
        }
      },
      validators: typeCheckers
    },
    validators = optionsValidator.validators,
    createInterceptor = function () {
      function globalContext(userAgent) {
        index(this, globalContext), this.defaults = userAgent, this.interceptors = {
          request: new createHandler(),
          response: new createHandler()
        };
      }
      return mergeOptions(globalContext, [{
        key: "request",
        value: function (globalContext, index) {
          "string" == typeof globalContext ? (index = index || {}).url = globalContext : index = globalContext || {};
          var userAgent = index = _mergeOptions(this.defaults, index),
            mergeOptions = userAgent.transitional,
            mergeWithDefaults = userAgent.paramsSerializer,
            arraySlice = userAgent.headers;
          void 0 !== mergeOptions && optionsValidator.assertOptions(mergeOptions, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, !1), null != mergeWithDefaults && (utils.isFunction(mergeWithDefaults) ? index.paramsSerializer = {
            serialize: mergeWithDefaults
          } : optionsValidator.assertOptions(mergeWithDefaults, {
            encode: validators.function,
            serialize: validators.function
          }, !0)), index.method = (index.method || this.defaults.method || "get").toLowerCase();
          var baseURLHandler = arraySlice && utils.merge(arraySlice.common, arraySlice[index.method]);
          arraySlice && utils.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (globalContext) {
            delete arraySlice[globalContext];
          }), index.headers = dataExtractor.concat(baseURLHandler, arraySlice);
          var requestHandler = [],
            responseTime = !0;
          this.interceptors.request.forEach(function (globalContext) {
            "function" == typeof globalContext.runWhen && !1 === globalContext.runWhen(index) || (responseTime = responseTime && globalContext.synchronous, requestHandler.unshift(globalContext.fulfilled, globalContext.rejected));
          });
          var xmlHttpRequest,
            processInput = [];
          this.interceptors.response.forEach(function (globalContext) {
            processInput.push(globalContext.fulfilled, globalContext.rejected);
          });
          var isArrayBufferType,
            currentInterceptorIndex = 0;
          if (!responseTime) {
            var handleResponseHeaders = [processRequest.bind(this), void 0];
            for (handleResponseHeaders.unshift.apply(handleResponseHeaders, requestHandler), handleResponseHeaders.push.apply(handleResponseHeaders, processInput), isArrayBufferType = handleResponseHeaders.length, xmlHttpRequest = Promise.resolve(index); currentInterceptorIndex < isArrayBufferType;) xmlHttpRequest = xmlHttpRequest.then(handleResponseHeaders[currentInterceptorIndex++], handleResponseHeaders[currentInterceptorIndex++]);
            return xmlHttpRequest;
          }
          isArrayBufferType = requestHandler.length;
          var getType = index;
          for (currentInterceptorIndex = 0; currentInterceptorIndex < isArrayBufferType;) {
            var _isArrayBufferType = requestHandler[currentInterceptorIndex++],
              protocolScheme = requestHandler[currentInterceptorIndex++];
            try {
              getType = _isArrayBufferType(getType);
            } catch (globalContext) {
              protocolScheme.call(this, globalContext);
              break;
            }
          }
          try {
            xmlHttpRequest = processRequest.call(this, getType);
          } catch (globalContext) {
            return Promise.reject(globalContext);
          }
          for (currentInterceptorIndex = 0, isArrayBufferType = processInput.length; currentInterceptorIndex < isArrayBufferType;) xmlHttpRequest = xmlHttpRequest.then(processInput[currentInterceptorIndex++], processInput[currentInterceptorIndex++]);
          return xmlHttpRequest;
        }
      }, {
        key: "getUri",
        value: function (globalContext) {
          return appendQueryParams(combineUrlWithBase((globalContext = _mergeOptions(this.defaults, globalContext)).baseURL, globalContext.url), globalContext.params, globalContext.paramsSerializer);
        }
      }]), globalContext;
    }();
  utils.forEach(["delete", "get", "head", "options"], function (globalContext) {
    createInterceptor.prototype[globalContext] = function (index, userAgent) {
      return this.request(_mergeOptions(userAgent || {}, {
        method: globalContext,
        url: index,
        data: (userAgent || {}).data
      }));
    };
  }), utils.forEach(["post", "put", "patch"], function (globalContext) {
    function index(index) {
      return function (userAgent, mergeOptions, mergeWithDefaults) {
        return this.request(_mergeOptions(mergeWithDefaults || {}, {
          method: globalContext,
          headers: index ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: userAgent,
          data: mergeOptions
        }));
      };
    }
    createInterceptor.prototype[globalContext] = index(), createInterceptor.prototype[globalContext + "Form"] = index(!0);
  });
  var HttpClient = createInterceptor,
    ExecutorFunction = function () {
      function globalContext(userAgent) {
        if (index(this, globalContext), "function" != typeof userAgent) throw new TypeError("executor must be a function.");
        var mergeOptions;
        this.promise = new Promise(function (globalContext) {
          mergeOptions = globalContext;
        });
        var mergeWithDefaults = this;
        this.promise.then(function (globalContext) {
          if (mergeWithDefaults._listeners) {
            for (var index = mergeWithDefaults._listeners.length; index-- > 0;) mergeWithDefaults._listeners[index](globalContext);
            mergeWithDefaults._listeners = null;
          }
        }), this.promise.then = function (globalContext) {
          var index,
            userAgent = new Promise(function (globalContext) {
              mergeWithDefaults.subscribe(globalContext), index = globalContext;
            }).then(globalContext);
          return userAgent.cancel = function () {
            mergeWithDefaults.unsubscribe(index);
          }, userAgent;
        }, userAgent(function (globalContext, index, userAgent) {
          mergeWithDefaults.reason || (mergeWithDefaults.reason = new CanceledError(globalContext, index, userAgent), mergeOptions(mergeWithDefaults.reason));
        });
      }
      return mergeOptions(globalContext, [{
        key: "throwIfRequested",
        value: function () {
          if (this.reason) throw this.reason;
        }
      }, {
        key: "subscribe",
        value: function (globalContext) {
          this.reason ? globalContext(this.reason) : this._listeners ? this._listeners.push(globalContext) : this._listeners = [globalContext];
        }
      }, {
        key: "unsubscribe",
        value: function (globalContext) {
          if (this._listeners) {
            var index = this._listeners.indexOf(globalContext);
            -1 !== index && this._listeners.splice(index, 1);
          }
        }
      }], [{
        key: "source",
        value: function () {
          var index;
          return {
            token: new globalContext(function (globalContext) {
              index = globalContext;
            }),
            cancel: index
          };
        }
      }]), globalContext;
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
  Object.entries(HttpStatusCodes).forEach(function (globalContext) {
    var index = mergeWithDefaults(globalContext, 2),
      userAgent = index[0],
      mergeOptions = index[1];
    HttpStatusCodes[mergeOptions] = userAgent;
  });
  var httpStatusCodesMap = HttpStatusCodes;
  var createAxiosInstance = function globalContext(index) {
    var userAgent = new HttpClient(index),
      mergeOptions = baseURLHandler(HttpClient.prototype.request, userAgent);
    return utils.extend(mergeOptions, HttpClient.prototype, userAgent, {
      allOwnKeys: !0
    }), utils.extend(mergeOptions, userAgent, null, {
      allOwnKeys: !0
    }), mergeOptions.create = function (userAgent) {
      return globalContext(_mergeOptions(index, userAgent));
    }, mergeOptions;
  }(httpRequestConfig);
  return createAxiosInstance.Axios = HttpClient, createAxiosInstance.CanceledError = CanceledError, createAxiosInstance.CancelToken = ExecutorFunction, createAxiosInstance.isCancel = isCancelToken, createAxiosInstance.VERSION = axiosVersion, createAxiosInstance.toFormData = mergeFormData, createAxiosInstance.AxiosError = AxiosError, createAxiosInstance.Cancel = createAxiosInstance.CanceledError, createAxiosInstance.all = function (globalContext) {
    return Promise.all(globalContext);
  }, createAxiosInstance.spread = function (globalContext) {
    return function (index) {
      return globalContext.apply(null, index);
    };
  }, createAxiosInstance.isAxiosError = function (globalContext) {
    return utils.isObject(globalContext) && !0 === globalContext.isAxiosError;
  }, createAxiosInstance.mergeConfig = _mergeOptions, createAxiosInstance.AxiosHeaders = dataExtractor, createAxiosInstance.formToJSON = function (globalContext) {
    return processArrayElement(utils.isHTMLForm(globalContext) ? new FormData(globalContext) : globalContext);
  }, createAxiosInstance.getAdapter = getAdapter, createAxiosInstance.HttpStatusCode = httpStatusCodesMap, createAxiosInstance.default = createAxiosInstance, createAxiosInstance;
});