!function (headerValue, index) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = index() : "function" == typeof define && define.amd ? define(index) : (headerValue = "undefined" != typeof globalThis ? globalThis : headerValue || self).axios = index();
}(this, function () {
  "use strict";

  function headerValue(index) {
    return headerValue = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (headerValue) {
      return typeof headerValue;
    } : function (headerValue) {
      return headerValue && "function" == typeof Symbol && headerValue.constructor === Symbol && headerValue !== Symbol.prototype ? "symbol" : typeof headerValue;
    }, headerValue(index);
  }
  function index(headerValue, index) {
    if (!(headerValue instanceof index)) throw new TypeError("Cannot call a class as a function");
  }
  function urlParser(headerValue, index) {
    for (var urlParser = 0; urlParser < index.length; urlParser++) {
      var mergeOptions = index[urlParser];
      mergeOptions.enumerable = mergeOptions.enumerable || !1, mergeOptions.configurable = !0, "value" in mergeOptions && (mergeOptions.writable = !0), Object.defineProperty(headerValue, mergeOptions.key, mergeOptions);
    }
  }
  function mergeOptions(headerValue, index, mergeOptions) {
    return index && urlParser(headerValue.prototype, index), mergeOptions && urlParser(headerValue, mergeOptions), Object.defineProperty(headerValue, "prototype", {
      writable: !1
    }), headerValue;
  }
  function arrayIterator(headerValue, index) {
    return function (headerValue) {
      if (Array.isArray(headerValue)) return headerValue;
    }(headerValue) || function (headerValue, index) {
      var urlParser = null == headerValue ? null : "undefined" != typeof Symbol && headerValue[Symbol.iterator] || headerValue["@@iterator"];
      if (null == urlParser) return;
      var mergeOptions,
        arrayIterator,
        currentIndex = [],
        baseUrlHandler = !0,
        requestHandler = !1;
      try {
        for (urlParser = urlParser.call(headerValue); !(baseUrlHandler = (mergeOptions = urlParser.next()).done) && (currentIndex.push(mergeOptions.value), !index || currentIndex.length !== index); baseUrlHandler = !0);
      } catch (headerValue) {
        requestHandler = !0, arrayIterator = headerValue;
      } finally {
        try {
          baseUrlHandler || null == urlParser.return || urlParser.return();
        } finally {
          if (requestHandler) throw arrayIterator;
        }
      }
      return currentIndex;
    }(headerValue, index) || function (headerValue, index) {
      if (!headerValue) return;
      if ("string" == typeof headerValue) return currentIndex(headerValue, index);
      var urlParser = Object.prototype.toString.call(headerValue).slice(8, -1);
      "Object" === urlParser && headerValue.constructor && (urlParser = headerValue.constructor.name);
      if ("Map" === urlParser || "Set" === urlParser) return Array.from(headerValue);
      if ("Arguments" === urlParser || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(urlParser)) return currentIndex(headerValue, index);
    }(headerValue, index) || function () {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }();
  }
  function currentIndex(headerValue, index) {
    (null == index || index > headerValue.length) && (index = headerValue.length);
    for (var urlParser = 0, mergeOptions = new Array(index); urlParser < index; urlParser++) mergeOptions[urlParser] = headerValue[urlParser];
    return mergeOptions;
  }
  function baseUrlHandler(headerValue, index) {
    return function () {
      return headerValue.apply(index, arguments);
    };
  }
  var requestHandler,
    timeoutDuration = Object.prototype.toString,
    xmlHttpRequest = Object.getPrototypeOf,
    processInput = (requestHandler = Object.create(null), function (headerValue) {
      var index = timeoutDuration.call(headerValue);
      return requestHandler[index] || (requestHandler[index] = index.slice(8, -1).toLowerCase());
    }),
    isArrayBufferType = function (headerValue) {
      return headerValue = headerValue.toLowerCase(), function (index) {
        return processInput(index) === headerValue;
      };
    },
    currentInterceptorIndex = function (index) {
      return function (urlParser) {
        return headerValue(urlParser) === index;
      };
    },
    handleResponseHeaders = Array.isArray,
    getType = currentInterceptorIndex("undefined");
  var _isArrayBufferType = isArrayBufferType("ArrayBuffer");
  var protocolScheme = currentInterceptorIndex("string"),
    isFunction = currentInterceptorIndex("function"),
    isNumber = currentInterceptorIndex("number"),
    isNonNullObject = function (index) {
      return null !== index && "object" === headerValue(index);
    },
    isPlainObject = function (headerValue) {
      if ("object" !== processInput(headerValue)) return !1;
      var index = xmlHttpRequest(headerValue);
      return !(null !== index && index !== Object.prototype && null !== Object.getPrototypeOf(index) || Symbol.toStringTag in headerValue || Symbol.iterator in headerValue);
    },
    DateConstructor = isArrayBufferType("Date"),
    FileType = isArrayBufferType("File"),
    BlobConstructor = isArrayBufferType("Blob"),
    fileList = isArrayBufferType("FileList"),
    URLSearchParamsConstructor = isArrayBufferType("URLSearchParams");
  function forEachElement(index, urlParser) {
    var mergeOptions,
      arrayIterator,
      currentIndex = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}).allOwnKeys,
      baseUrlHandler = void 0 !== currentIndex && currentIndex;
    if (null != index) if ("object" !== headerValue(index) && (index = [index]), handleResponseHeaders(index)) for (mergeOptions = 0, arrayIterator = index.length; mergeOptions < arrayIterator; mergeOptions++) urlParser.call(null, index[mergeOptions], mergeOptions, index);else {
      var requestHandler,
        timeoutDuration = baseUrlHandler ? Object.getOwnPropertyNames(index) : Object.keys(index),
        xmlHttpRequest = timeoutDuration.length;
      for (mergeOptions = 0; mergeOptions < xmlHttpRequest; mergeOptions++) requestHandler = timeoutDuration[mergeOptions], urlParser.call(null, index[requestHandler], requestHandler, index);
    }
  }
  function findKeyByValueCaseInsensitive(headerValue, index) {
    index = index.toLowerCase();
    for (var urlParser, mergeOptions = Object.keys(headerValue), arrayIterator = mergeOptions.length; arrayIterator-- > 0;) if (index === (urlParser = mergeOptions[arrayIterator]).toLowerCase()) return urlParser;
    return null;
  }
  var globalObject = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global,
    isNotGlobalContext = function (headerValue) {
      return !getType(headerValue) && headerValue !== globalObject;
    };
  var isUint8ArraySupported,
    isUint8Array = (isUint8ArraySupported = "undefined" != typeof Uint8Array && xmlHttpRequest(Uint8Array), function (headerValue) {
      return isUint8ArraySupported && headerValue instanceof isUint8ArraySupported;
    }),
    HTMLFormElementType = isArrayBufferType("HTMLFormElement"),
    _hasOwnProperty = function () {
      var headerValue = Object.prototype.hasOwnProperty;
      return function (index, urlParser) {
        return headerValue.call(index, urlParser);
      };
    }(),
    isRegExp = isArrayBufferType("RegExp"),
    definePropertiesWithTransformations = function (headerValue, index) {
      var urlParser = Object.getOwnPropertyDescriptors(headerValue),
        mergeOptions = {};
      forEachElement(urlParser, function (urlParser, arrayIterator) {
        var currentIndex;
        !1 !== (currentIndex = index(urlParser, arrayIterator, headerValue)) && (mergeOptions[arrayIterator] = currentIndex || urlParser);
      }), Object.defineProperties(headerValue, mergeOptions);
    },
    lowercaseAlphabet = "abcdefghijklmnopqrstuvwxyz",
    DIGITS = "0123456789",
    CharacterCategories = {
      DIGIT: DIGITS,
      ALPHA: lowercaseAlphabet,
      ALPHA_DIGIT: lowercaseAlphabet + lowercaseAlphabet.toUpperCase() + DIGITS
    };
  var isAsyncFunction = isArrayBufferType("AsyncFunction"),
    utilityFunctions = {
      isArray: handleResponseHeaders,
      isArrayBuffer: _isArrayBufferType,
      isBuffer: function (headerValue) {
        return null !== headerValue && !getType(headerValue) && null !== headerValue.constructor && !getType(headerValue.constructor) && isFunction(headerValue.constructor.isBuffer) && headerValue.constructor.isBuffer(headerValue);
      },
      isFormData: function (headerValue) {
        var index;
        return headerValue && ("function" == typeof FormData && headerValue instanceof FormData || isFunction(headerValue.append) && ("formdata" === (index = processInput(headerValue)) || "object" === index && isFunction(headerValue.toString) && "[object FormData]" === headerValue.toString()));
      },
      isArrayBufferView: function (headerValue) {
        return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(headerValue) : headerValue && headerValue.buffer && _isArrayBufferType(headerValue.buffer);
      },
      isString: protocolScheme,
      isNumber: isNumber,
      isBoolean: function (headerValue) {
        return !0 === headerValue || !1 === headerValue;
      },
      isObject: isNonNullObject,
      isPlainObject: isPlainObject,
      isUndefined: getType,
      isDate: DateConstructor,
      isFile: FileType,
      isBlob: BlobConstructor,
      isRegExp: isRegExp,
      isFunction: isFunction,
      isStream: function (headerValue) {
        return isNonNullObject(headerValue) && isFunction(headerValue.pipe);
      },
      isURLSearchParams: URLSearchParamsConstructor,
      isTypedArray: isUint8Array,
      isFileList: fileList,
      forEach: forEachElement,
      merge: function headerValue() {
        for (var index = (isNotGlobalContext(this) && this || {}).caseless, urlParser = {}, mergeOptions = function (mergeOptions, arrayIterator) {
            var currentIndex = index && findKeyByValueCaseInsensitive(urlParser, arrayIterator) || arrayIterator;
            isPlainObject(urlParser[currentIndex]) && isPlainObject(mergeOptions) ? urlParser[currentIndex] = headerValue(urlParser[currentIndex], mergeOptions) : isPlainObject(mergeOptions) ? urlParser[currentIndex] = headerValue({}, mergeOptions) : handleResponseHeaders(mergeOptions) ? urlParser[currentIndex] = mergeOptions.slice() : urlParser[currentIndex] = mergeOptions;
          }, arrayIterator = 0, currentIndex = arguments.length; arrayIterator < currentIndex; arrayIterator++) arguments[arrayIterator] && forEachElement(arguments[arrayIterator], mergeOptions);
        return urlParser;
      },
      extend: function (headerValue, index, urlParser) {
        return forEachElement(index, function (index, mergeOptions) {
          urlParser && isFunction(index) ? headerValue[mergeOptions] = baseUrlHandler(index, urlParser) : headerValue[mergeOptions] = index;
        }, {
          allOwnKeys: (arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}).allOwnKeys
        }), headerValue;
      },
      trim: function (headerValue) {
        return headerValue.trim ? headerValue.trim() : headerValue.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
      },
      stripBOM: function (headerValue) {
        return 65279 === headerValue.charCodeAt(0) && (headerValue = headerValue.slice(1)), headerValue;
      },
      inherits: function (headerValue, index, urlParser, mergeOptions) {
        headerValue.prototype = Object.create(index.prototype, mergeOptions), headerValue.prototype.constructor = headerValue, Object.defineProperty(headerValue, "super", {
          value: index.prototype
        }), urlParser && Object.assign(headerValue.prototype, urlParser);
      },
      toFlatObject: function (headerValue, index, urlParser, mergeOptions) {
        var arrayIterator,
          currentIndex,
          baseUrlHandler,
          requestHandler = {};
        if (index = index || {}, null == headerValue) return index;
        do {
          for (currentIndex = (arrayIterator = Object.getOwnPropertyNames(headerValue)).length; currentIndex-- > 0;) baseUrlHandler = arrayIterator[currentIndex], mergeOptions && !mergeOptions(baseUrlHandler, headerValue, index) || requestHandler[baseUrlHandler] || (index[baseUrlHandler] = headerValue[baseUrlHandler], requestHandler[baseUrlHandler] = !0);
          headerValue = !1 !== urlParser && xmlHttpRequest(headerValue);
        } while (headerValue && (!urlParser || urlParser(headerValue, index)) && headerValue !== Object.prototype);
        return index;
      },
      kindOf: processInput,
      kindOfTest: isArrayBufferType,
      endsWith: function (headerValue, index, urlParser) {
        headerValue = String(headerValue), (void 0 === urlParser || urlParser > headerValue.length) && (urlParser = headerValue.length), urlParser -= index.length;
        var mergeOptions = headerValue.indexOf(index, urlParser);
        return -1 !== mergeOptions && mergeOptions === urlParser;
      },
      toArray: function (headerValue) {
        if (!headerValue) return null;
        if (handleResponseHeaders(headerValue)) return headerValue;
        var index = headerValue.length;
        if (!isNumber(index)) return null;
        for (var urlParser = new Array(index); index-- > 0;) urlParser[index] = headerValue[index];
        return urlParser;
      },
      forEachEntry: function (headerValue, index) {
        for (var urlParser, mergeOptions = (headerValue && headerValue[Symbol.iterator]).call(headerValue); (urlParser = mergeOptions.next()) && !urlParser.done;) {
          var arrayIterator = urlParser.value;
          index.call(headerValue, arrayIterator[0], arrayIterator[1]);
        }
      },
      matchAll: function (headerValue, index) {
        for (var urlParser, mergeOptions = []; null !== (urlParser = headerValue.exec(index));) mergeOptions.push(urlParser);
        return mergeOptions;
      },
      isHTMLForm: HTMLFormElementType,
      hasOwnProperty: _hasOwnProperty,
      hasOwnProp: _hasOwnProperty,
      reduceDescriptors: definePropertiesWithTransformations,
      freezeMethods: function (headerValue) {
        definePropertiesWithTransformations(headerValue, function (index, urlParser) {
          if (isFunction(headerValue) && -1 !== ["arguments", "caller", "callee"].indexOf(urlParser)) return !1;
          var mergeOptions = headerValue[urlParser];
          isFunction(mergeOptions) && (index.enumerable = !1, "writable" in index ? index.writable = !1 : index.set || (index.set = function () {
            throw Error("Can not rewrite read-only method '" + urlParser + "'");
          }));
        });
      },
      toObjectSet: function (headerValue, index) {
        var urlParser = {},
          mergeOptions = function (headerValue) {
            headerValue.forEach(function (headerValue) {
              urlParser[headerValue] = !0;
            });
          };
        return handleResponseHeaders(headerValue) ? mergeOptions(headerValue) : mergeOptions(String(headerValue).split(index)), urlParser;
      },
      toCamelCase: function (headerValue) {
        return headerValue.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (headerValue, index, urlParser) {
          return index.toUpperCase() + urlParser;
        });
      },
      noop: function () {},
      toFiniteNumber: function (headerValue, index) {
        return headerValue = +headerValue, Number.isFinite(headerValue) ? headerValue : index;
      },
      findKey: findKeyByValueCaseInsensitive,
      global: globalObject,
      isContextDefined: isNotGlobalContext,
      ALPHABET: CharacterCategories,
      generateString: function () {
        for (var headerValue = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 16, index = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : CharacterCategories.ALPHA_DIGIT, urlParser = "", mergeOptions = index.length; headerValue--;) urlParser += index[Math.random() * mergeOptions | 0];
        return urlParser;
      },
      isSpecCompliantForm: function (headerValue) {
        return !!(headerValue && isFunction(headerValue.append) && "FormData" === headerValue[Symbol.toStringTag] && headerValue[Symbol.iterator]);
      },
      toJSONObject: function (headerValue) {
        var index = new Array(10);
        return function headerValue(urlParser, mergeOptions) {
          if (isNonNullObject(urlParser)) {
            if (index.indexOf(urlParser) >= 0) return;
            if (!("toJSON" in urlParser)) {
              index[mergeOptions] = urlParser;
              var arrayIterator = handleResponseHeaders(urlParser) ? [] : {};
              return forEachElement(urlParser, function (index, urlParser) {
                var currentIndex = headerValue(index, mergeOptions + 1);
                !getType(currentIndex) && (arrayIterator[urlParser] = currentIndex);
              }), index[mergeOptions] = void 0, arrayIterator;
            }
          }
          return urlParser;
        }(headerValue, 0);
      },
      isAsyncFn: isAsyncFunction,
      isThenable: function (headerValue) {
        return headerValue && (isNonNullObject(headerValue) || isFunction(headerValue)) && isFunction(headerValue.then) && isFunction(headerValue.catch);
      }
    };
  function AxiosError(headerValue, index, urlParser, mergeOptions, arrayIterator) {
    Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = headerValue, this.name = "AxiosError", index && (this.code = index), urlParser && (this.config = urlParser), mergeOptions && (this.request = mergeOptions), arrayIterator && (this.response = arrayIterator);
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
  ["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(function (headerValue) {
    _ErrorCodes[headerValue] = {
      value: headerValue
    };
  }), Object.defineProperties(AxiosError, _ErrorCodes), Object.defineProperty(ErrorCodes, "isAxiosError", {
    value: !0
  }), AxiosError.from = function (headerValue, index, urlParser, mergeOptions, arrayIterator, currentIndex) {
    var baseUrlHandler = Object.create(ErrorCodes);
    return utilityFunctions.toFlatObject(headerValue, baseUrlHandler, function (headerValue) {
      return headerValue !== Error.prototype;
    }, function (headerValue) {
      return "isAxiosError" !== headerValue;
    }), AxiosError.call(baseUrlHandler, headerValue.message, index, urlParser, mergeOptions, arrayIterator), baseUrlHandler.cause = headerValue, baseUrlHandler.name = headerValue.name, currentIndex && Object.assign(baseUrlHandler, currentIndex), baseUrlHandler;
  };
  function isObjectOrArray(headerValue) {
    return utilityFunctions.isPlainObject(headerValue) || utilityFunctions.isArray(headerValue);
  }
  function removeArraySuffix(headerValue) {
    return utilityFunctions.endsWith(headerValue, "[]") ? headerValue.slice(0, -2) : headerValue;
  }
  function concatAndFormatKeys(headerValue, index, urlParser) {
    return headerValue ? headerValue.concat(index).map(function (headerValue, index) {
      return headerValue = removeArraySuffix(headerValue), !urlParser && index ? "[" + headerValue + "]" : headerValue;
    }).join(urlParser ? "." : "") : index;
  }
  var isMetaTokenPropertyMap = utilityFunctions.toFlatObject(utilityFunctions, {}, null, function (headerValue) {
    return /^is[A-Z]/.test(headerValue);
  });
  function mergeFormData(index, urlParser, mergeOptions) {
    if (!utilityFunctions.isObject(index)) throw new TypeError("target must be an object");
    urlParser = urlParser || new FormData();
    var arrayIterator = (mergeOptions = utilityFunctions.toFlatObject(mergeOptions, {
        metaTokens: !0,
        dots: !1,
        indexes: !1
      }, !1, function (headerValue, index) {
        return !utilityFunctions.isUndefined(index[headerValue]);
      })).metaTokens,
      currentIndex = mergeOptions.visitor || processInput,
      baseUrlHandler = mergeOptions.dots,
      requestHandler = mergeOptions.indexes,
      timeoutDuration = (mergeOptions.Blob || "undefined" != typeof Blob && Blob) && utilityFunctions.isSpecCompliantForm(urlParser);
    if (!utilityFunctions.isFunction(currentIndex)) throw new TypeError("visitor must be a function");
    function xmlHttpRequest(headerValue) {
      if (null === headerValue) return "";
      if (utilityFunctions.isDate(headerValue)) return headerValue.toISOString();
      if (!timeoutDuration && utilityFunctions.isBlob(headerValue)) throw new AxiosError("Blob is not supported. Use a Buffer instead.");
      return utilityFunctions.isArrayBuffer(headerValue) || utilityFunctions.isTypedArray(headerValue) ? timeoutDuration && "function" == typeof Blob ? new Blob([headerValue]) : Buffer.from(headerValue) : headerValue;
    }
    function processInput(index, mergeOptions, currentIndex) {
      var timeoutDuration = index;
      if (index && !currentIndex && "object" === headerValue(index)) if (utilityFunctions.endsWith(mergeOptions, "{}")) mergeOptions = arrayIterator ? mergeOptions : mergeOptions.slice(0, -2), index = JSON.stringify(index);else if (utilityFunctions.isArray(index) && function (headerValue) {
        return utilityFunctions.isArray(headerValue) && !headerValue.some(isObjectOrArray);
      }(index) || (utilityFunctions.isFileList(index) || utilityFunctions.endsWith(mergeOptions, "[]")) && (timeoutDuration = utilityFunctions.toArray(index))) return mergeOptions = removeArraySuffix(mergeOptions), timeoutDuration.forEach(function (headerValue, index) {
        !utilityFunctions.isUndefined(headerValue) && null !== headerValue && urlParser.append(!0 === requestHandler ? concatAndFormatKeys([mergeOptions], index, baseUrlHandler) : null === requestHandler ? mergeOptions : mergeOptions + "[]", xmlHttpRequest(headerValue));
      }), !1;
      return !!isObjectOrArray(index) || (urlParser.append(concatAndFormatKeys(currentIndex, mergeOptions, baseUrlHandler), xmlHttpRequest(index)), !1);
    }
    var isArrayBufferType = [],
      currentInterceptorIndex = Object.assign(isMetaTokenPropertyMap, {
        defaultVisitor: processInput,
        convertValue: xmlHttpRequest,
        isVisitable: isObjectOrArray
      });
    if (!utilityFunctions.isObject(index)) throw new TypeError("data must be an object");
    return function headerValue(index, mergeOptions) {
      if (!utilityFunctions.isUndefined(index)) {
        if (-1 !== isArrayBufferType.indexOf(index)) throw Error("Circular reference detected in " + mergeOptions.join("."));
        isArrayBufferType.push(index), utilityFunctions.forEach(index, function (index, arrayIterator) {
          !0 === (!(utilityFunctions.isUndefined(index) || null === index) && currentIndex.call(urlParser, index, utilityFunctions.isString(arrayIterator) ? arrayIterator.trim() : arrayIterator, mergeOptions, currentInterceptorIndex)) && headerValue(index, mergeOptions ? mergeOptions.concat(arrayIterator) : [arrayIterator]);
        }), isArrayBufferType.pop();
      }
    }(index), urlParser;
  }
  function encodeUriComponentCustom(headerValue) {
    var index = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0"
    };
    return encodeURIComponent(headerValue).replace(/[!'()~]|%20|%00/g, function (headerValue) {
      return index[headerValue];
    });
  }
  function KeyValuePairHandler(headerValue, index) {
    this._pairs = [], headerValue && mergeFormData(headerValue, this, index);
  }
  var PairsHandler = KeyValuePairHandler.prototype;
  function decodeURIComponentWithCustomMappings(headerValue) {
    return encodeURIComponent(headerValue).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  function appendQueryParams(headerValue, index, urlParser) {
    if (!index) return headerValue;
    var mergeOptions,
      arrayIterator = urlParser && urlParser.encode || decodeURIComponentWithCustomMappings,
      currentIndex = urlParser && urlParser.serialize;
    if (mergeOptions = currentIndex ? currentIndex(index, urlParser) : utilityFunctions.isURLSearchParams(index) ? index.toString() : new KeyValuePairHandler(index, urlParser).toString(arrayIterator)) {
      var baseUrlHandler = headerValue.indexOf("#");
      -1 !== baseUrlHandler && (headerValue = headerValue.slice(0, baseUrlHandler)), headerValue += (-1 === headerValue.indexOf("?") ? "?" : "&") + mergeOptions;
    }
    return headerValue;
  }
  PairsHandler.append = function (headerValue, index) {
    this._pairs.push([headerValue, index]);
  }, PairsHandler.toString = function (headerValue) {
    var index = headerValue ? function (index) {
      return headerValue.call(this, index, encodeUriComponentCustom);
    } : encodeUriComponentCustom;
    return this._pairs.map(function (headerValue) {
      return index(headerValue[0]) + "=" + index(headerValue[1]);
    }, "").join("&");
  };
  var eventEmitter,
    createHandler = function () {
      function headerValue() {
        index(this, headerValue), this.handlers = [];
      }
      return mergeOptions(headerValue, [{
        key: "use",
        value: function (headerValue, index, urlParser) {
          return this.handlers.push({
            fulfilled: headerValue,
            rejected: index,
            synchronous: !!urlParser && urlParser.synchronous,
            runWhen: urlParser ? urlParser.runWhen : null
          }), this.handlers.length - 1;
        }
      }, {
        key: "eject",
        value: function (headerValue) {
          this.handlers[headerValue] && (this.handlers[headerValue] = null);
        }
      }, {
        key: "clear",
        value: function () {
          this.handlers && (this.handlers = []);
        }
      }, {
        key: "forEach",
        value: function (headerValue) {
          utilityFunctions.forEach(this.handlers, function (index) {
            null !== index && headerValue(index);
          });
        }
      }]), headerValue;
    }(),
    httpRequestConfig = {
      silentJSONParsing: !0,
      forcedJSONParsing: !0,
      clarifyTimeoutError: !1
    },
    environmentConfig = {
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
  function processArrayElement(headerValue) {
    function index(headerValue, urlParser, mergeOptions, arrayIterator) {
      var currentIndex = headerValue[arrayIterator++],
        baseUrlHandler = Number.isFinite(+currentIndex),
        requestHandler = arrayIterator >= headerValue.length;
      return currentIndex = !currentIndex && utilityFunctions.isArray(mergeOptions) ? mergeOptions.length : currentIndex, requestHandler ? (utilityFunctions.hasOwnProp(mergeOptions, currentIndex) ? mergeOptions[currentIndex] = [mergeOptions[currentIndex], urlParser] : mergeOptions[currentIndex] = urlParser, !baseUrlHandler) : (mergeOptions[currentIndex] && utilityFunctions.isObject(mergeOptions[currentIndex]) || (mergeOptions[currentIndex] = []), index(headerValue, urlParser, mergeOptions[currentIndex], arrayIterator) && utilityFunctions.isArray(mergeOptions[currentIndex]) && (mergeOptions[currentIndex] = function (headerValue) {
        var index,
          urlParser,
          mergeOptions = {},
          arrayIterator = Object.keys(headerValue),
          currentIndex = arrayIterator.length;
        for (index = 0; index < currentIndex; index++) mergeOptions[urlParser = arrayIterator[index]] = headerValue[urlParser];
        return mergeOptions;
      }(mergeOptions[currentIndex])), !baseUrlHandler);
    }
    if (utilityFunctions.isFormData(headerValue) && utilityFunctions.isFunction(headerValue.entries)) {
      var urlParser = {};
      return utilityFunctions.forEachEntry(headerValue, function (headerValue, mergeOptions) {
        index(function (headerValue) {
          return utilityFunctions.matchAll(/\w+|\[(\w*)]/g, headerValue).map(function (headerValue) {
            return "[]" === headerValue[0] ? "" : headerValue[1] || headerValue[0];
          });
        }(headerValue), mergeOptions, urlParser, 0);
      }), urlParser;
    }
    return null;
  }
  var formDataAdapter = {
    transitional: httpRequestConfig,
    adapter: ["xhr", "http"],
    transformRequest: [function (headerValue, index) {
      var urlParser,
        mergeOptions = index.getContentType() || "",
        arrayIterator = mergeOptions.indexOf("application/json") > -1,
        currentIndex = utilityFunctions.isObject(headerValue);
      if (currentIndex && utilityFunctions.isHTMLForm(headerValue) && (headerValue = new FormData(headerValue)), utilityFunctions.isFormData(headerValue)) return arrayIterator && arrayIterator ? JSON.stringify(processArrayElement(headerValue)) : headerValue;
      if (utilityFunctions.isArrayBuffer(headerValue) || utilityFunctions.isBuffer(headerValue) || utilityFunctions.isStream(headerValue) || utilityFunctions.isFile(headerValue) || utilityFunctions.isBlob(headerValue)) return headerValue;
      if (utilityFunctions.isArrayBufferView(headerValue)) return headerValue.buffer;
      if (utilityFunctions.isURLSearchParams(headerValue)) return index.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), headerValue.toString();
      if (currentIndex) {
        if (mergeOptions.indexOf("application/x-www-form-urlencoded") > -1) return function (headerValue, index) {
          return mergeFormData(headerValue, new environmentConfig.classes.URLSearchParams(), Object.assign({
            visitor: function (headerValue, index, urlParser, mergeOptions) {
              return environmentConfig.isNode && utilityFunctions.isBuffer(headerValue) ? (this.append(index, headerValue.toString("base64")), !1) : mergeOptions.defaultVisitor.apply(this, arguments);
            }
          }, index));
        }(headerValue, this.formSerializer).toString();
        if ((urlParser = utilityFunctions.isFileList(headerValue)) || mergeOptions.indexOf("multipart/form-data") > -1) {
          var baseUrlHandler = this.env && this.env.FormData;
          return mergeFormData(urlParser ? {
            "files[]": headerValue
          } : headerValue, baseUrlHandler && new baseUrlHandler(), this.formSerializer);
        }
      }
      return currentIndex || arrayIterator ? (index.setContentType("application/json", !1), function (headerValue, index, urlParser) {
        if (utilityFunctions.isString(headerValue)) try {
          return (index || JSON.parse)(headerValue), utilityFunctions.trim(headerValue);
        } catch (headerValue) {
          if ("SyntaxError" !== headerValue.name) throw headerValue;
        }
        return (urlParser || JSON.stringify)(headerValue);
      }(headerValue)) : headerValue;
    }],
    transformResponse: [function (headerValue) {
      var index = this.transitional || formDataAdapter.transitional,
        urlParser = index && index.forcedJSONParsing,
        mergeOptions = "json" === this.responseType;
      if (headerValue && utilityFunctions.isString(headerValue) && (urlParser && !this.responseType || mergeOptions)) {
        var arrayIterator = !(index && index.silentJSONParsing) && mergeOptions;
        try {
          return JSON.parse(headerValue);
        } catch (headerValue) {
          if (arrayIterator) {
            if ("SyntaxError" === headerValue.name) throw AxiosError.from(headerValue, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
            throw headerValue;
          }
        }
      }
      return headerValue;
    }],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: environmentConfig.classes.FormData,
      Blob: environmentConfig.classes.Blob
    },
    validateStatus: function (headerValue) {
      return headerValue >= 200 && headerValue < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": void 0
      }
    }
  };
  utilityFunctions.forEach(["delete", "get", "head", "post", "put", "patch"], function (headerValue) {
    formDataAdapter.headers[headerValue] = {};
  });
  var _httpRequestConfig = formDataAdapter,
    httpHeadersSet = utilityFunctions.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]),
    internalsSymbol = Symbol("internals");
  function normalizeString(headerValue) {
    return headerValue && String(headerValue).trim().toLowerCase();
  }
  function normalizeValue(headerValue) {
    return !1 === headerValue || null == headerValue ? headerValue : utilityFunctions.isArray(headerValue) ? headerValue.map(normalizeValue) : String(headerValue);
  }
  function stringContainsPattern(headerValue, index, urlParser, mergeOptions, arrayIterator) {
    return utilityFunctions.isFunction(mergeOptions) ? mergeOptions.call(this, index, urlParser) : (arrayIterator && (index = urlParser), utilityFunctions.isString(index) ? utilityFunctions.isString(mergeOptions) ? -1 !== index.indexOf(mergeOptions) : utilityFunctions.isRegExp(mergeOptions) ? mergeOptions.test(index) : void 0 : void 0);
  }
  var headerHandler = function () {
    function headerValue(urlParser) {
      index(this, headerValue), urlParser && this.set(urlParser);
    }
    return mergeOptions(headerValue, [{
      key: "set",
      value: function (headerValue, index, urlParser) {
        var mergeOptions = this;
        function arrayIterator(headerValue, index, urlParser) {
          var arrayIterator = normalizeString(index);
          if (!arrayIterator) throw new Error("header name must be a non-empty string");
          var currentIndex = utilityFunctions.findKey(mergeOptions, arrayIterator);
          (!currentIndex || void 0 === mergeOptions[currentIndex] || !0 === urlParser || void 0 === urlParser && !1 !== mergeOptions[currentIndex]) && (mergeOptions[currentIndex || index] = normalizeValue(headerValue));
        }
        var currentIndex,
          baseUrlHandler,
          requestHandler,
          timeoutDuration,
          xmlHttpRequest,
          processInput = function (headerValue, index) {
            return utilityFunctions.forEach(headerValue, function (headerValue, urlParser) {
              return arrayIterator(headerValue, urlParser, index);
            });
          };
        return utilityFunctions.isPlainObject(headerValue) || headerValue instanceof this.constructor ? processInput(headerValue, index) : utilityFunctions.isString(headerValue) && (headerValue = headerValue.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(headerValue.trim()) ? processInput((xmlHttpRequest = {}, (currentIndex = headerValue) && currentIndex.split("\n").forEach(function (headerValue) {
          timeoutDuration = headerValue.indexOf(":"), baseUrlHandler = headerValue.substring(0, timeoutDuration).trim().toLowerCase(), requestHandler = headerValue.substring(timeoutDuration + 1).trim(), !baseUrlHandler || xmlHttpRequest[baseUrlHandler] && httpHeadersSet[baseUrlHandler] || ("set-cookie" === baseUrlHandler ? xmlHttpRequest[baseUrlHandler] ? xmlHttpRequest[baseUrlHandler].push(requestHandler) : xmlHttpRequest[baseUrlHandler] = [requestHandler] : xmlHttpRequest[baseUrlHandler] = xmlHttpRequest[baseUrlHandler] ? xmlHttpRequest[baseUrlHandler] + ", " + requestHandler : requestHandler);
        }), xmlHttpRequest), index) : null != headerValue && arrayIterator(index, headerValue, urlParser), this;
      }
    }, {
      key: "get",
      value: function (headerValue, index) {
        if (headerValue = normalizeString(headerValue)) {
          var urlParser = utilityFunctions.findKey(this, headerValue);
          if (urlParser) {
            var mergeOptions = this[urlParser];
            if (!index) return mergeOptions;
            if (!0 === index) return function (headerValue) {
              for (var index, urlParser = Object.create(null), mergeOptions = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; index = mergeOptions.exec(headerValue);) urlParser[index[1]] = index[2];
              return urlParser;
            }(mergeOptions);
            if (utilityFunctions.isFunction(index)) return index.call(this, mergeOptions, urlParser);
            if (utilityFunctions.isRegExp(index)) return index.exec(mergeOptions);
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
    }, {
      key: "has",
      value: function (headerValue, index) {
        if (headerValue = normalizeString(headerValue)) {
          var urlParser = utilityFunctions.findKey(this, headerValue);
          return !(!urlParser || void 0 === this[urlParser] || index && !stringContainsPattern(0, this[urlParser], urlParser, index));
        }
        return !1;
      }
    }, {
      key: "delete",
      value: function (headerValue, index) {
        var urlParser = this,
          mergeOptions = !1;
        function arrayIterator(headerValue) {
          if (headerValue = normalizeString(headerValue)) {
            var arrayIterator = utilityFunctions.findKey(urlParser, headerValue);
            !arrayIterator || index && !stringContainsPattern(0, urlParser[arrayIterator], arrayIterator, index) || (delete urlParser[arrayIterator], mergeOptions = !0);
          }
        }
        return utilityFunctions.isArray(headerValue) ? headerValue.forEach(arrayIterator) : arrayIterator(headerValue), mergeOptions;
      }
    }, {
      key: "clear",
      value: function (headerValue) {
        for (var index = Object.keys(this), urlParser = index.length, mergeOptions = !1; urlParser--;) {
          var arrayIterator = index[urlParser];
          headerValue && !stringContainsPattern(0, this[arrayIterator], arrayIterator, headerValue, !0) || (delete this[arrayIterator], mergeOptions = !0);
        }
        return mergeOptions;
      }
    }, {
      key: "normalize",
      value: function (headerValue) {
        var index = this,
          urlParser = {};
        return utilityFunctions.forEach(this, function (mergeOptions, arrayIterator) {
          var currentIndex = utilityFunctions.findKey(urlParser, arrayIterator);
          if (currentIndex) return index[currentIndex] = normalizeValue(mergeOptions), void delete index[arrayIterator];
          var baseUrlHandler = headerValue ? function (headerValue) {
            return headerValue.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function (headerValue, index, urlParser) {
              return index.toUpperCase() + urlParser;
            });
          }(arrayIterator) : String(arrayIterator).trim();
          baseUrlHandler !== arrayIterator && delete index[arrayIterator], index[baseUrlHandler] = normalizeValue(mergeOptions), urlParser[baseUrlHandler] = !0;
        }), this;
      }
    }, {
      key: "concat",
      value: function () {
        for (var headerValue, index = arguments.length, urlParser = new Array(index), mergeOptions = 0; mergeOptions < index; mergeOptions++) urlParser[mergeOptions] = arguments[mergeOptions];
        return (headerValue = this.constructor).concat.apply(headerValue, [this].concat(urlParser));
      }
    }, {
      key: "toJSON",
      value: function (headerValue) {
        var index = Object.create(null);
        return utilityFunctions.forEach(this, function (urlParser, mergeOptions) {
          null != urlParser && !1 !== urlParser && (index[mergeOptions] = headerValue && utilityFunctions.isArray(urlParser) ? urlParser.join(", ") : urlParser);
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
        return Object.entries(this.toJSON()).map(function (headerValue) {
          var index = arrayIterator(headerValue, 2);
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
      value: function (headerValue) {
        return headerValue instanceof this ? headerValue : new this(headerValue);
      }
    }, {
      key: "concat",
      value: function (headerValue) {
        for (var index = new this(headerValue), urlParser = arguments.length, mergeOptions = new Array(urlParser > 1 ? urlParser - 1 : 0), arrayIterator = 1; arrayIterator < urlParser; arrayIterator++) mergeOptions[arrayIterator - 1] = arguments[arrayIterator];
        return mergeOptions.forEach(function (headerValue) {
          return index.set(headerValue);
        }), index;
      }
    }, {
      key: "accessor",
      value: function (headerValue) {
        var index = (this[internalsSymbol] = this[internalsSymbol] = {
            accessors: {}
          }).accessors,
          urlParser = this.prototype;
        function mergeOptions(headerValue) {
          var mergeOptions = normalizeString(headerValue);
          index[mergeOptions] || (!function (headerValue, index) {
            var urlParser = utilityFunctions.toCamelCase(" " + index);
            ["get", "set", "has"].forEach(function (mergeOptions) {
              Object.defineProperty(headerValue, mergeOptions + urlParser, {
                value: function (headerValue, urlParser, arrayIterator) {
                  return this[mergeOptions].call(this, index, headerValue, urlParser, arrayIterator);
                },
                configurable: !0
              });
            });
          }(urlParser, headerValue), index[mergeOptions] = !0);
        }
        return utilityFunctions.isArray(headerValue) ? headerValue.forEach(mergeOptions) : mergeOptions(headerValue), this;
      }
    }]), headerValue;
  }();
  headerHandler.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]), utilityFunctions.reduceDescriptors(headerHandler.prototype, function (headerValue, index) {
    var urlParser = headerValue.value,
      mergeOptions = index[0].toUpperCase() + index.slice(1);
    return {
      get: function () {
        return urlParser;
      },
      set: function (headerValue) {
        this[mergeOptions] = headerValue;
      }
    };
  }), utilityFunctions.freezeMethods(headerHandler);
  var dataExtractor = headerHandler;
  function processResponse(headerValue, index) {
    var urlParser = this || _httpRequestConfig,
      mergeOptions = index || urlParser,
      arrayIterator = dataExtractor.from(mergeOptions.headers),
      currentIndex = mergeOptions.data;
    return utilityFunctions.forEach(headerValue, function (headerValue) {
      currentIndex = headerValue.call(urlParser, currentIndex, arrayIterator.normalize(), index ? index.status : void 0);
    }), arrayIterator.normalize(), currentIndex;
  }
  function isCancellationError(headerValue) {
    return !(!headerValue || !headerValue.__CANCEL__);
  }
  function CanceledError(headerValue, index, urlParser) {
    AxiosError.call(this, null == headerValue ? "canceled" : headerValue, AxiosError.ERR_CANCELED, index, urlParser), this.name = "CanceledError";
  }
  utilityFunctions.inherits(CanceledError, AxiosError, {
    __CANCEL__: !0
  });
  var cookieStorage = environmentConfig.isStandardBrowserEnv ? {
    write: function (headerValue, index, urlParser, mergeOptions, arrayIterator, currentIndex) {
      var baseUrlHandler = [];
      baseUrlHandler.push(headerValue + "=" + encodeURIComponent(index)), utilityFunctions.isNumber(urlParser) && baseUrlHandler.push("expires=" + new Date(urlParser).toGMTString()), utilityFunctions.isString(mergeOptions) && baseUrlHandler.push("path=" + mergeOptions), utilityFunctions.isString(arrayIterator) && baseUrlHandler.push("domain=" + arrayIterator), !0 === currentIndex && baseUrlHandler.push("secure"), document.cookie = baseUrlHandler.join("; ");
    },
    read: function (headerValue) {
      var index = document.cookie.match(new RegExp("(^|;\\s*)(" + headerValue + ")=([^;]*)"));
      return index ? decodeURIComponent(index[3]) : null;
    },
    remove: function (headerValue) {
      this.write(headerValue, "", Date.now() - 864e5);
    }
  } : {
    write: function () {},
    read: function () {
      return null;
    },
    remove: function () {}
  };
  function combineUrlPath(headerValue, index) {
    return headerValue && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(index) ? function (headerValue, index) {
      return index ? headerValue.replace(/\/+$/, "") + "/" + index.replace(/^\/+/, "") : headerValue;
    }(headerValue, index) : index;
  }
  var isStandardBrowserEnvironment = environmentConfig.isStandardBrowserEnv ? function () {
    var headerValue,
      index = /(msie|trident)/i.test(navigator.userAgent),
      urlParser = document.createElement("a");
    function mergeOptions(headerValue) {
      var mergeOptions = headerValue;
      return index && (urlParser.setAttribute("href", mergeOptions), mergeOptions = urlParser.href), urlParser.setAttribute("href", mergeOptions), {
        href: urlParser.href,
        protocol: urlParser.protocol ? urlParser.protocol.replace(/:$/, "") : "",
        host: urlParser.host,
        search: urlParser.search ? urlParser.search.replace(/^\?/, "") : "",
        hash: urlParser.hash ? urlParser.hash.replace(/^#/, "") : "",
        hostname: urlParser.hostname,
        port: urlParser.port,
        pathname: "/" === urlParser.pathname.charAt(0) ? urlParser.pathname : "/" + urlParser.pathname
      };
    }
    return headerValue = mergeOptions(window.location.href), function (index) {
      var urlParser = utilityFunctions.isString(index) ? mergeOptions(index) : index;
      return urlParser.protocol === headerValue.protocol && urlParser.host === headerValue.host;
    };
  }() : function () {
    return !0;
  };
  function rateLimiter(headerValue, index) {
    var urlParser = 0,
      mergeOptions = function (headerValue, index) {
        headerValue = headerValue || 10;
        var urlParser,
          mergeOptions = new Array(headerValue),
          arrayIterator = new Array(headerValue),
          currentIndex = 0,
          baseUrlHandler = 0;
        return index = void 0 !== index ? index : 1e3, function (requestHandler) {
          var timeoutDuration = Date.now(),
            xmlHttpRequest = arrayIterator[baseUrlHandler];
          urlParser || (urlParser = timeoutDuration), mergeOptions[currentIndex] = requestHandler, arrayIterator[currentIndex] = timeoutDuration;
          for (var processInput = baseUrlHandler, isArrayBufferType = 0; processInput !== currentIndex;) isArrayBufferType += mergeOptions[processInput++], processInput %= headerValue;
          if ((currentIndex = (currentIndex + 1) % headerValue) === baseUrlHandler && (baseUrlHandler = (baseUrlHandler + 1) % headerValue), !(timeoutDuration - urlParser < index)) {
            var currentInterceptorIndex = xmlHttpRequest && timeoutDuration - xmlHttpRequest;
            return currentInterceptorIndex ? Math.round(1e3 * isArrayBufferType / currentInterceptorIndex) : void 0;
          }
        };
      }(50, 250);
    return function (arrayIterator) {
      var currentIndex = arrayIterator.loaded,
        baseUrlHandler = arrayIterator.lengthComputable ? arrayIterator.total : void 0,
        requestHandler = currentIndex - urlParser,
        timeoutDuration = mergeOptions(requestHandler);
      urlParser = currentIndex;
      var xmlHttpRequest = {
        loaded: currentIndex,
        total: baseUrlHandler,
        progress: baseUrlHandler ? currentIndex / baseUrlHandler : void 0,
        bytes: requestHandler,
        rate: timeoutDuration || void 0,
        estimated: timeoutDuration && baseUrlHandler && currentIndex <= baseUrlHandler ? (baseUrlHandler - currentIndex) / timeoutDuration : void 0,
        event: arrayIterator
      };
      xmlHttpRequest[index ? "download" : "upload"] = !0, headerValue(xmlHttpRequest);
    };
  }
  var httpRequestHandler = {
    http: null,
    xhr: "undefined" != typeof XMLHttpRequest && function (headerValue) {
      return new Promise(function (index, urlParser) {
        var mergeOptions,
          arrayIterator,
          currentIndex = headerValue.data,
          baseUrlHandler = dataExtractor.from(headerValue.headers).normalize(),
          requestHandler = headerValue.responseType;
        function timeoutDuration() {
          headerValue.cancelToken && headerValue.cancelToken.unsubscribe(mergeOptions), headerValue.signal && headerValue.signal.removeEventListener("abort", mergeOptions);
        }
        utilityFunctions.isFormData(currentIndex) && (environmentConfig.isStandardBrowserEnv || environmentConfig.isStandardBrowserWebWorkerEnv ? baseUrlHandler.setContentType(!1) : baseUrlHandler.getContentType(/^\s*multipart\/form-data/) ? utilityFunctions.isString(arrayIterator = baseUrlHandler.getContentType()) && baseUrlHandler.setContentType(arrayIterator.replace(/^\s*(multipart\/form-data);+/, "$1")) : baseUrlHandler.setContentType("multipart/form-data"));
        var xmlHttpRequest = new XMLHttpRequest();
        if (headerValue.auth) {
          var processInput = headerValue.auth.username || "",
            isArrayBufferType = headerValue.auth.password ? unescape(encodeURIComponent(headerValue.auth.password)) : "";
          baseUrlHandler.set("Authorization", "Basic " + btoa(processInput + ":" + isArrayBufferType));
        }
        var currentInterceptorIndex = combineUrlPath(headerValue.baseURL, headerValue.url);
        function handleResponseHeaders() {
          if (xmlHttpRequest) {
            var mergeOptions = dataExtractor.from("getAllResponseHeaders" in xmlHttpRequest && xmlHttpRequest.getAllResponseHeaders());
            !function (headerValue, index, urlParser) {
              var mergeOptions = urlParser.config.validateStatus;
              urlParser.status && mergeOptions && !mergeOptions(urlParser.status) ? index(new AxiosError("Request failed with status code " + urlParser.status, [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(urlParser.status / 100) - 4], urlParser.config, urlParser.request, urlParser)) : headerValue(urlParser);
            }(function (headerValue) {
              index(headerValue), timeoutDuration();
            }, function (headerValue) {
              urlParser(headerValue), timeoutDuration();
            }, {
              data: requestHandler && "text" !== requestHandler && "json" !== requestHandler ? xmlHttpRequest.response : xmlHttpRequest.responseText,
              status: xmlHttpRequest.status,
              statusText: xmlHttpRequest.statusText,
              headers: mergeOptions,
              config: headerValue,
              request: xmlHttpRequest
            }), xmlHttpRequest = null;
          }
        }
        if (xmlHttpRequest.open(headerValue.method.toUpperCase(), appendQueryParams(currentInterceptorIndex, headerValue.params, headerValue.paramsSerializer), !0), xmlHttpRequest.timeout = headerValue.timeout, "onloadend" in xmlHttpRequest ? xmlHttpRequest.onloadend = handleResponseHeaders : xmlHttpRequest.onreadystatechange = function () {
          xmlHttpRequest && 4 === xmlHttpRequest.readyState && (0 !== xmlHttpRequest.status || xmlHttpRequest.responseURL && 0 === xmlHttpRequest.responseURL.indexOf("file:")) && setTimeout(handleResponseHeaders);
        }, xmlHttpRequest.onabort = function () {
          xmlHttpRequest && (urlParser(new AxiosError("Request aborted", AxiosError.ECONNABORTED, headerValue, xmlHttpRequest)), xmlHttpRequest = null);
        }, xmlHttpRequest.onerror = function () {
          urlParser(new AxiosError("Network Error", AxiosError.ERR_NETWORK, headerValue, xmlHttpRequest)), xmlHttpRequest = null;
        }, xmlHttpRequest.ontimeout = function () {
          var index = headerValue.timeout ? "timeout of " + headerValue.timeout + "ms exceeded" : "timeout exceeded",
            mergeOptions = headerValue.transitional || httpRequestConfig;
          headerValue.timeoutErrorMessage && (index = headerValue.timeoutErrorMessage), urlParser(new AxiosError(index, mergeOptions.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED, headerValue, xmlHttpRequest)), xmlHttpRequest = null;
        }, environmentConfig.isStandardBrowserEnv) {
          var getType = isStandardBrowserEnvironment(currentInterceptorIndex) && headerValue.xsrfCookieName && cookieStorage.read(headerValue.xsrfCookieName);
          getType && baseUrlHandler.set(headerValue.xsrfHeaderName, getType);
        }
        void 0 === currentIndex && baseUrlHandler.setContentType(null), "setRequestHeader" in xmlHttpRequest && utilityFunctions.forEach(baseUrlHandler.toJSON(), function (headerValue, index) {
          xmlHttpRequest.setRequestHeader(index, headerValue);
        }), utilityFunctions.isUndefined(headerValue.withCredentials) || (xmlHttpRequest.withCredentials = !!headerValue.withCredentials), requestHandler && "json" !== requestHandler && (xmlHttpRequest.responseType = headerValue.responseType), "function" == typeof headerValue.onDownloadProgress && xmlHttpRequest.addEventListener("progress", rateLimiter(headerValue.onDownloadProgress, !0)), "function" == typeof headerValue.onUploadProgress && xmlHttpRequest.upload && xmlHttpRequest.upload.addEventListener("progress", rateLimiter(headerValue.onUploadProgress)), (headerValue.cancelToken || headerValue.signal) && (mergeOptions = function (index) {
          xmlHttpRequest && (urlParser(!index || index.type ? new CanceledError(null, headerValue, xmlHttpRequest) : index), xmlHttpRequest.abort(), xmlHttpRequest = null);
        }, headerValue.cancelToken && headerValue.cancelToken.subscribe(mergeOptions), headerValue.signal && (headerValue.signal.aborted ? mergeOptions() : headerValue.signal.addEventListener("abort", mergeOptions)));
        var _isArrayBufferType,
          protocolScheme = (_isArrayBufferType = /^([-+\w]{1,25})(:?\/\/|:)/.exec(currentInterceptorIndex)) && _isArrayBufferType[1] || "";
        protocolScheme && -1 === environmentConfig.protocols.indexOf(protocolScheme) ? urlParser(new AxiosError("Unsupported protocol " + protocolScheme + ":", AxiosError.ERR_BAD_REQUEST, headerValue)) : xmlHttpRequest.send(currentIndex || null);
      });
    }
  };
  utilityFunctions.forEach(httpRequestHandler, function (headerValue, index) {
    if (headerValue) {
      try {
        Object.defineProperty(headerValue, "name", {
          value: index
        });
      } catch (headerValue) {}
      Object.defineProperty(headerValue, "adapterName", {
        value: index
      });
    }
  });
  var formatProtocolErrorMessage = function (headerValue) {
      return "- ".concat(headerValue);
    },
    isValidAdapter = function (headerValue) {
      return utilityFunctions.isFunction(headerValue) || null === headerValue || !1 === headerValue;
    },
    getAdapter = function (headerValue) {
      for (var index, urlParser, mergeOptions = (headerValue = utilityFunctions.isArray(headerValue) ? headerValue : [headerValue]).length, currentIndex = {}, baseUrlHandler = 0; baseUrlHandler < mergeOptions; baseUrlHandler++) {
        var requestHandler = void 0;
        if (urlParser = index = headerValue[baseUrlHandler], !isValidAdapter(index) && void 0 === (urlParser = httpRequestHandler[(requestHandler = String(index)).toLowerCase()])) throw new AxiosError("Unknown adapter '".concat(requestHandler, "'"));
        if (urlParser) break;
        currentIndex[requestHandler || "#" + baseUrlHandler] = urlParser;
      }
      if (!urlParser) {
        var timeoutDuration = Object.entries(currentIndex).map(function (headerValue) {
          var index = arrayIterator(headerValue, 2),
            urlParser = index[0],
            mergeOptions = index[1];
          return "adapter ".concat(urlParser, " ") + (!1 === mergeOptions ? "is not supported by the environment" : "is not available in the build");
        });
        throw new AxiosError("There is no suitable adapter to dispatch the request " + (mergeOptions ? timeoutDuration.length > 1 ? "since :\n" + timeoutDuration.map(formatProtocolErrorMessage).join("\n") : " " + formatProtocolErrorMessage(timeoutDuration[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
      }
      return urlParser;
    };
  function validateRequestCancellation(headerValue) {
    if (headerValue.cancelToken && headerValue.cancelToken.throwIfRequested(), headerValue.signal && headerValue.signal.aborted) throw new CanceledError(null, headerValue);
  }
  function processRequest(headerValue) {
    return validateRequestCancellation(headerValue), headerValue.headers = dataExtractor.from(headerValue.headers), headerValue.data = processResponse.call(headerValue, headerValue.transformRequest), -1 !== ["post", "put", "patch"].indexOf(headerValue.method) && headerValue.headers.setContentType("application/x-www-form-urlencoded", !1), getAdapter(headerValue.adapter || _httpRequestConfig.adapter)(headerValue).then(function (index) {
      return validateRequestCancellation(headerValue), index.data = processResponse.call(headerValue, headerValue.transformResponse, index), index.headers = dataExtractor.from(index.headers), index;
    }, function (index) {
      return isCancellationError(index) || (validateRequestCancellation(headerValue), index && index.response && (index.response.data = processResponse.call(headerValue, headerValue.transformResponse, index.response), index.response.headers = dataExtractor.from(index.response.headers))), Promise.reject(index);
    });
  }
  var convertToJSON = function (headerValue) {
    return headerValue instanceof dataExtractor ? headerValue.toJSON() : headerValue;
  };
  function _mergeOptions(headerValue, index) {
    index = index || {};
    var urlParser = {};
    function mergeOptions(headerValue, index, urlParser) {
      return utilityFunctions.isPlainObject(headerValue) && utilityFunctions.isPlainObject(index) ? utilityFunctions.merge.call({
        caseless: urlParser
      }, headerValue, index) : utilityFunctions.isPlainObject(index) ? utilityFunctions.merge({}, index) : utilityFunctions.isArray(index) ? index.slice() : index;
    }
    function arrayIterator(headerValue, index, urlParser) {
      return utilityFunctions.isUndefined(index) ? utilityFunctions.isUndefined(headerValue) ? void 0 : mergeOptions(void 0, headerValue, urlParser) : mergeOptions(headerValue, index, urlParser);
    }
    function currentIndex(headerValue, index) {
      if (!utilityFunctions.isUndefined(index)) return mergeOptions(void 0, index);
    }
    function baseUrlHandler(headerValue, index) {
      return utilityFunctions.isUndefined(index) ? utilityFunctions.isUndefined(headerValue) ? void 0 : mergeOptions(void 0, headerValue) : mergeOptions(void 0, index);
    }
    function requestHandler(urlParser, arrayIterator, currentIndex) {
      return currentIndex in index ? mergeOptions(urlParser, arrayIterator) : currentIndex in headerValue ? mergeOptions(void 0, urlParser) : void 0;
    }
    var timeoutDuration = {
      url: currentIndex,
      method: currentIndex,
      data: currentIndex,
      baseURL: baseUrlHandler,
      transformRequest: baseUrlHandler,
      transformResponse: baseUrlHandler,
      paramsSerializer: baseUrlHandler,
      timeout: baseUrlHandler,
      timeoutMessage: baseUrlHandler,
      withCredentials: baseUrlHandler,
      adapter: baseUrlHandler,
      responseType: baseUrlHandler,
      xsrfCookieName: baseUrlHandler,
      xsrfHeaderName: baseUrlHandler,
      onUploadProgress: baseUrlHandler,
      onDownloadProgress: baseUrlHandler,
      decompress: baseUrlHandler,
      maxContentLength: baseUrlHandler,
      maxBodyLength: baseUrlHandler,
      beforeRedirect: baseUrlHandler,
      transport: baseUrlHandler,
      httpAgent: baseUrlHandler,
      httpsAgent: baseUrlHandler,
      cancelToken: baseUrlHandler,
      socketPath: baseUrlHandler,
      responseEncoding: baseUrlHandler,
      validateStatus: requestHandler,
      headers: function (headerValue, index) {
        return arrayIterator(convertToJSON(headerValue), convertToJSON(index), !0);
      }
    };
    return utilityFunctions.forEach(Object.keys(Object.assign({}, headerValue, index)), function (mergeOptions) {
      var currentIndex = timeoutDuration[mergeOptions] || arrayIterator,
        baseUrlHandler = currentIndex(headerValue[mergeOptions], index[mergeOptions], mergeOptions);
      utilityFunctions.isUndefined(baseUrlHandler) && currentIndex !== requestHandler || (urlParser[mergeOptions] = baseUrlHandler);
    }), urlParser;
  }
  var axiosVersion = "1.6.0",
    typeCheckers = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(function (index, urlParser) {
    typeCheckers[index] = function (mergeOptions) {
      return headerValue(mergeOptions) === index || "a" + (urlParser < 1 ? "n " : " ") + index;
    };
  });
  var transitionalOptions = {};
  typeCheckers.transitional = function (headerValue, index, urlParser) {
    function mergeOptions(headerValue, index) {
      return "[Axios v1.6.0] Transitional option '" + headerValue + "'" + index + (urlParser ? ". " + urlParser : "");
    }
    return function (urlParser, arrayIterator, currentIndex) {
      if (!1 === headerValue) throw new AxiosError(mergeOptions(arrayIterator, " has been removed" + (index ? " in " + index : "")), AxiosError.ERR_DEPRECATED);
      return index && !transitionalOptions[arrayIterator] && (transitionalOptions[arrayIterator] = !0, console.warn(mergeOptions(arrayIterator, " has been deprecated since v" + index + " and will be removed in the near future"))), !headerValue || headerValue(urlParser, arrayIterator, currentIndex);
    };
  };
  var optionsValidator = {
      assertOptions: function (index, urlParser, mergeOptions) {
        if ("object" !== headerValue(index)) throw new AxiosError("options must be an object", AxiosError.ERR_BAD_OPTION_VALUE);
        for (var arrayIterator = Object.keys(index), currentIndex = arrayIterator.length; currentIndex-- > 0;) {
          var baseUrlHandler = arrayIterator[currentIndex],
            requestHandler = urlParser[baseUrlHandler];
          if (requestHandler) {
            var timeoutDuration = index[baseUrlHandler],
              xmlHttpRequest = void 0 === timeoutDuration || requestHandler(timeoutDuration, baseUrlHandler, index);
            if (!0 !== xmlHttpRequest) throw new AxiosError("option " + baseUrlHandler + " must be " + xmlHttpRequest, AxiosError.ERR_BAD_OPTION_VALUE);
          } else if (!0 !== mergeOptions) throw new AxiosError("Unknown option " + baseUrlHandler, AxiosError.ERR_BAD_OPTION);
        }
      },
      validators: typeCheckers
    },
    validators = optionsValidator.validators,
    createInterceptor = function () {
      function headerValue(urlParser) {
        index(this, headerValue), this.defaults = urlParser, this.interceptors = {
          request: new createHandler(),
          response: new createHandler()
        };
      }
      return mergeOptions(headerValue, [{
        key: "request",
        value: function (headerValue, index) {
          "string" == typeof headerValue ? (index = index || {}).url = headerValue : index = headerValue || {};
          var urlParser = index = _mergeOptions(this.defaults, index),
            mergeOptions = urlParser.transitional,
            arrayIterator = urlParser.paramsSerializer,
            currentIndex = urlParser.headers;
          void 0 !== mergeOptions && optionsValidator.assertOptions(mergeOptions, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, !1), null != arrayIterator && (utilityFunctions.isFunction(arrayIterator) ? index.paramsSerializer = {
            serialize: arrayIterator
          } : optionsValidator.assertOptions(arrayIterator, {
            encode: validators.function,
            serialize: validators.function
          }, !0)), index.method = (index.method || this.defaults.method || "get").toLowerCase();
          var baseUrlHandler = currentIndex && utilityFunctions.merge(currentIndex.common, currentIndex[index.method]);
          currentIndex && utilityFunctions.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (headerValue) {
            delete currentIndex[headerValue];
          }), index.headers = dataExtractor.concat(baseUrlHandler, currentIndex);
          var requestHandler = [],
            timeoutDuration = !0;
          this.interceptors.request.forEach(function (headerValue) {
            "function" == typeof headerValue.runWhen && !1 === headerValue.runWhen(index) || (timeoutDuration = timeoutDuration && headerValue.synchronous, requestHandler.unshift(headerValue.fulfilled, headerValue.rejected));
          });
          var xmlHttpRequest,
            processInput = [];
          this.interceptors.response.forEach(function (headerValue) {
            processInput.push(headerValue.fulfilled, headerValue.rejected);
          });
          var isArrayBufferType,
            currentInterceptorIndex = 0;
          if (!timeoutDuration) {
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
            } catch (headerValue) {
              protocolScheme.call(this, headerValue);
              break;
            }
          }
          try {
            xmlHttpRequest = processRequest.call(this, getType);
          } catch (headerValue) {
            return Promise.reject(headerValue);
          }
          for (currentInterceptorIndex = 0, isArrayBufferType = processInput.length; currentInterceptorIndex < isArrayBufferType;) xmlHttpRequest = xmlHttpRequest.then(processInput[currentInterceptorIndex++], processInput[currentInterceptorIndex++]);
          return xmlHttpRequest;
        }
      }, {
        key: "getUri",
        value: function (headerValue) {
          return appendQueryParams(combineUrlPath((headerValue = _mergeOptions(this.defaults, headerValue)).baseURL, headerValue.url), headerValue.params, headerValue.paramsSerializer);
        }
      }]), headerValue;
    }();
  utilityFunctions.forEach(["delete", "get", "head", "options"], function (headerValue) {
    createInterceptor.prototype[headerValue] = function (index, urlParser) {
      return this.request(_mergeOptions(urlParser || {}, {
        method: headerValue,
        url: index,
        data: (urlParser || {}).data
      }));
    };
  }), utilityFunctions.forEach(["post", "put", "patch"], function (headerValue) {
    function index(index) {
      return function (urlParser, mergeOptions, arrayIterator) {
        return this.request(_mergeOptions(arrayIterator || {}, {
          method: headerValue,
          headers: index ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: urlParser,
          data: mergeOptions
        }));
      };
    }
    createInterceptor.prototype[headerValue] = index(), createInterceptor.prototype[headerValue + "Form"] = index(!0);
  });
  var HttpClient = createInterceptor,
    ExecutorFunction = function () {
      function headerValue(urlParser) {
        if (index(this, headerValue), "function" != typeof urlParser) throw new TypeError("executor must be a function.");
        var mergeOptions;
        this.promise = new Promise(function (headerValue) {
          mergeOptions = headerValue;
        });
        var arrayIterator = this;
        this.promise.then(function (headerValue) {
          if (arrayIterator._listeners) {
            for (var index = arrayIterator._listeners.length; index-- > 0;) arrayIterator._listeners[index](headerValue);
            arrayIterator._listeners = null;
          }
        }), this.promise.then = function (headerValue) {
          var index,
            urlParser = new Promise(function (headerValue) {
              arrayIterator.subscribe(headerValue), index = headerValue;
            }).then(headerValue);
          return urlParser.cancel = function () {
            arrayIterator.unsubscribe(index);
          }, urlParser;
        }, urlParser(function (headerValue, index, urlParser) {
          arrayIterator.reason || (arrayIterator.reason = new CanceledError(headerValue, index, urlParser), mergeOptions(arrayIterator.reason));
        });
      }
      return mergeOptions(headerValue, [{
        key: "throwIfRequested",
        value: function () {
          if (this.reason) throw this.reason;
        }
      }, {
        key: "subscribe",
        value: function (headerValue) {
          this.reason ? headerValue(this.reason) : this._listeners ? this._listeners.push(headerValue) : this._listeners = [headerValue];
        }
      }, {
        key: "unsubscribe",
        value: function (headerValue) {
          if (this._listeners) {
            var index = this._listeners.indexOf(headerValue);
            -1 !== index && this._listeners.splice(index, 1);
          }
        }
      }], [{
        key: "source",
        value: function () {
          var index;
          return {
            token: new headerValue(function (headerValue) {
              index = headerValue;
            }),
            cancel: index
          };
        }
      }]), headerValue;
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
  Object.entries(HttpStatusCodes).forEach(function (headerValue) {
    var index = arrayIterator(headerValue, 2),
      urlParser = index[0],
      mergeOptions = index[1];
    HttpStatusCodes[mergeOptions] = urlParser;
  });
  var httpStatusCodes = HttpStatusCodes;
  var createAxiosInstance = function headerValue(index) {
    var urlParser = new HttpClient(index),
      mergeOptions = baseUrlHandler(HttpClient.prototype.request, urlParser);
    return utilityFunctions.extend(mergeOptions, HttpClient.prototype, urlParser, {
      allOwnKeys: !0
    }), utilityFunctions.extend(mergeOptions, urlParser, null, {
      allOwnKeys: !0
    }), mergeOptions.create = function (urlParser) {
      return headerValue(_mergeOptions(index, urlParser));
    }, mergeOptions;
  }(_httpRequestConfig);
  return createAxiosInstance.Axios = HttpClient, createAxiosInstance.CanceledError = CanceledError, createAxiosInstance.CancelToken = ExecutorFunction, createAxiosInstance.isCancel = isCancellationError, createAxiosInstance.VERSION = axiosVersion, createAxiosInstance.toFormData = mergeFormData, createAxiosInstance.AxiosError = AxiosError, createAxiosInstance.Cancel = createAxiosInstance.CanceledError, createAxiosInstance.all = function (headerValue) {
    return Promise.all(headerValue);
  }, createAxiosInstance.spread = function (headerValue) {
    return function (index) {
      return headerValue.apply(null, index);
    };
  }, createAxiosInstance.isAxiosError = function (headerValue) {
    return utilityFunctions.isObject(headerValue) && !0 === headerValue.isAxiosError;
  }, createAxiosInstance.mergeConfig = _mergeOptions, createAxiosInstance.AxiosHeaders = dataExtractor, createAxiosInstance.formToJSON = function (headerValue) {
    return processArrayElement(utilityFunctions.isHTMLForm(headerValue) ? new FormData(headerValue) : headerValue);
  }, createAxiosInstance.getAdapter = getAdapter, createAxiosInstance.HttpStatusCode = httpStatusCodes, createAxiosInstance.default = createAxiosInstance, createAxiosInstance;
});