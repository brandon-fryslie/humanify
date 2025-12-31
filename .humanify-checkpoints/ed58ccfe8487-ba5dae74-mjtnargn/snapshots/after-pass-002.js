!function (headerHandler, arrayElementIndex) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = arrayElementIndex() : "function" == typeof define && define.amd ? define(arrayElementIndex) : (headerHandler = "undefined" != typeof globalThis ? globalThis : headerHandler || self).axios = arrayElementIndex();
}(this, function () {
  "use strict";

  function _headerHandler(arrayElementIndex) {
    return _headerHandler = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (_headerHandler) {
      return typeof _headerHandler;
    } : function (_headerHandler) {
      return _headerHandler && "function" == typeof Symbol && _headerHandler.constructor === Symbol && _headerHandler !== Symbol.prototype ? "symbol" : typeof _headerHandler;
    }, _headerHandler(arrayElementIndex);
  }
  function arrayElementIndex(_headerHandler, arrayElementIndex) {
    if (!(_headerHandler instanceof arrayElementIndex)) throw new TypeError("Cannot call a class as a function");
  }
  function urlElement(_headerHandler, arrayElementIndex) {
    for (var urlElement = 0; urlElement < arrayElementIndex.length; urlElement++) {
      var combineHeaderOptions = arrayElementIndex[urlElement];
      combineHeaderOptions.enumerable = combineHeaderOptions.enumerable || !1, combineHeaderOptions.configurable = !0, "value" in combineHeaderOptions && (combineHeaderOptions.writable = !0), Object.defineProperty(_headerHandler, combineHeaderOptions.key, combineHeaderOptions);
    }
  }
  function combineHeaderOptions(_headerHandler, arrayElementIndex, combineHeaderOptions) {
    return arrayElementIndex && urlElement(_headerHandler.prototype, arrayElementIndex), combineHeaderOptions && urlElement(_headerHandler, combineHeaderOptions), Object.defineProperty(_headerHandler, "prototype", {
      writable: !1
    }), _headerHandler;
  }
  function arrayElementIterator(_headerHandler, arrayElementIndex) {
    return function (_headerHandler) {
      if (Array.isArray(_headerHandler)) return _headerHandler;
    }(_headerHandler) || function (_headerHandler, arrayElementIndex) {
      var urlElement = null == _headerHandler ? null : "undefined" != typeof Symbol && _headerHandler[Symbol.iterator] || _headerHandler["@@iterator"];
      if (null == urlElement) return;
      var combineHeaderOptions,
        arrayElementIterator,
        maxIndex = [],
        handleBaseUrl = !0,
        requestMerger = !1;
      try {
        for (urlElement = urlElement.call(_headerHandler); !(handleBaseUrl = (combineHeaderOptions = urlElement.next()).done) && (maxIndex.push(combineHeaderOptions.value), !arrayElementIndex || maxIndex.length !== arrayElementIndex); handleBaseUrl = !0);
      } catch (_headerHandler) {
        requestMerger = !0, arrayElementIterator = _headerHandler;
      } finally {
        try {
          handleBaseUrl || null == urlElement.return || urlElement.return();
        } finally {
          if (requestMerger) throw arrayElementIterator;
        }
      }
      return maxIndex;
    }(_headerHandler, arrayElementIndex) || function (_headerHandler, arrayElementIndex) {
      if (!_headerHandler) return;
      if ("string" == typeof _headerHandler) return maxIndex(_headerHandler, arrayElementIndex);
      var urlElement = Object.prototype.toString.call(_headerHandler).slice(8, -1);
      "Object" === urlElement && _headerHandler.constructor && (urlElement = _headerHandler.constructor.name);
      if ("Map" === urlElement || "Set" === urlElement) return Array.from(_headerHandler);
      if ("Arguments" === urlElement || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(urlElement)) return maxIndex(_headerHandler, arrayElementIndex);
    }(_headerHandler, arrayElementIndex) || function () {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }();
  }
  function maxIndex(_headerHandler, arrayElementIndex) {
    (null == arrayElementIndex || arrayElementIndex > _headerHandler.length) && (arrayElementIndex = _headerHandler.length);
    for (var urlElement = 0, combineHeaderOptions = new Array(arrayElementIndex); urlElement < arrayElementIndex; urlElement++) combineHeaderOptions[urlElement] = _headerHandler[urlElement];
    return combineHeaderOptions;
  }
  function handleBaseUrl(_headerHandler, arrayElementIndex) {
    return function () {
      return _headerHandler.apply(arrayElementIndex, arguments);
    };
  }
  var requestMerger,
    cleanupTimeoutHandlers = Object.prototype.toString,
    httpRequest = Object.getPrototypeOf,
    handleInputData = (requestMerger = Object.create(null), function (_headerHandler) {
      var arrayElementIndex = cleanupTimeoutHandlers.call(_headerHandler);
      return requestMerger[arrayElementIndex] || (requestMerger[arrayElementIndex] = arrayElementIndex.slice(8, -1).toLowerCase());
    }),
    isArrayBufferTypeCheck = function (_headerHandler) {
      return _headerHandler = _headerHandler.toLowerCase(), function (arrayElementIndex) {
        return handleInputData(arrayElementIndex) === _headerHandler;
      };
    },
    currentInterceptorPosition = function (arrayElementIndex) {
      return function (urlElement) {
        return _headerHandler(urlElement) === arrayElementIndex;
      };
    },
    processResponseHeaders = Array.isArray,
    checkIfInterceptorIsDefined = currentInterceptorPosition("undefined");
  var _isArrayBufferTypeCheck = isArrayBufferTypeCheck("ArrayBuffer");
  var urlProtocolScheme = currentInterceptorPosition("string"),
    isFunctionType = currentInterceptorPosition("function"),
    isNumberType = currentInterceptorPosition("number"),
    isObjectNotNull = function (arrayElementIndex) {
      return null !== arrayElementIndex && "object" === _headerHandler(arrayElementIndex);
    },
    isObjectLiteral = function (_headerHandler) {
      if ("object" !== handleInputData(_headerHandler)) return !1;
      var arrayElementIndex = httpRequest(_headerHandler);
      return !(null !== arrayElementIndex && arrayElementIndex !== Object.prototype && null !== Object.getPrototypeOf(arrayElementIndex) || Symbol.toStringTag in _headerHandler || Symbol.iterator in _headerHandler);
    },
    isDateArrayBufferType = isArrayBufferTypeCheck("Date"),
    isFileType = isArrayBufferTypeCheck("File"),
    BlobTypeChecker = isArrayBufferTypeCheck("Blob"),
    fileListType = isArrayBufferTypeCheck("FileList"),
    URLSearchParamsTypeChecker = isArrayBufferTypeCheck("URLSearchParams");
  function iterateOverElements(arrayElementIndex, urlElement) {
    var combineHeaderOptions,
      arrayElementIterator,
      maxIndex = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}).allOwnKeys,
      handleBaseUrl = void 0 !== maxIndex && maxIndex;
    if (null != arrayElementIndex) if ("object" !== _headerHandler(arrayElementIndex) && (arrayElementIndex = [arrayElementIndex]), processResponseHeaders(arrayElementIndex)) for (combineHeaderOptions = 0, arrayElementIterator = arrayElementIndex.length; combineHeaderOptions < arrayElementIterator; combineHeaderOptions++) urlElement.call(null, arrayElementIndex[combineHeaderOptions], combineHeaderOptions, arrayElementIndex);else {
      var requestMerger,
        cleanupTimeoutHandlers = handleBaseUrl ? Object.getOwnPropertyNames(arrayElementIndex) : Object.keys(arrayElementIndex),
        httpRequest = cleanupTimeoutHandlers.length;
      for (combineHeaderOptions = 0; combineHeaderOptions < httpRequest; combineHeaderOptions++) requestMerger = cleanupTimeoutHandlers[combineHeaderOptions], urlElement.call(null, arrayElementIndex[requestMerger], requestMerger, arrayElementIndex);
    }
  }
  function getKeyByValueIgnoringCase(_headerHandler, arrayElementIndex) {
    arrayElementIndex = arrayElementIndex.toLowerCase();
    for (var urlElement, combineHeaderOptions = Object.keys(_headerHandler), arrayElementIterator = combineHeaderOptions.length; arrayElementIterator-- > 0;) if (arrayElementIndex === (urlElement = combineHeaderOptions[arrayElementIterator]).toLowerCase()) return urlElement;
    return null;
  }
  var globalContext = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global,
    isNotGlobalObject = function (_headerHandler) {
      return !checkIfInterceptorIsDefined(_headerHandler) && _headerHandler !== globalContext;
    };
  var isUint8ArrayAvailable,
    isSupportedUint8Array = (isUint8ArrayAvailable = "undefined" != typeof Uint8Array && httpRequest(Uint8Array), function (_headerHandler) {
      return isUint8ArrayAvailable && _headerHandler instanceof isUint8ArrayAvailable;
    }),
    HTMLFormElementBufferType = isArrayBufferTypeCheck("HTMLFormElement"),
    hasOwnPropertyChecker = function () {
      var _headerHandler = Object.prototype.hasOwnProperty;
      return function (arrayElementIndex, urlElement) {
        return _headerHandler.call(arrayElementIndex, urlElement);
      };
    }(),
    isRegExpType = isArrayBufferTypeCheck("RegExp"),
    applyPropertyTransformations = function (_headerHandler, arrayElementIndex) {
      var urlElement = Object.getOwnPropertyDescriptors(_headerHandler),
        combineHeaderOptions = {};
      iterateOverElements(urlElement, function (urlElement, arrayElementIterator) {
        var maxIndex;
        !1 !== (maxIndex = arrayElementIndex(urlElement, arrayElementIterator, _headerHandler)) && (combineHeaderOptions[arrayElementIterator] = maxIndex || urlElement);
      }), Object.defineProperties(_headerHandler, combineHeaderOptions);
    },
    lowercaseAlphabetString = "abcdefghijklmnopqrstuvwxyz",
    DIGIT_CHARACTERS = "0123456789",
    CharacterTypeCategories = {
      DIGIT: DIGIT_CHARACTERS,
      ALPHA: lowercaseAlphabetString,
      ALPHA_DIGIT: lowercaseAlphabetString + lowercaseAlphabetString.toUpperCase() + DIGIT_CHARACTERS
    };
  var isAsyncFunctionType = isArrayBufferTypeCheck("AsyncFunction"),
    responseUtilities = {
      isArray: processResponseHeaders,
      isArrayBuffer: _isArrayBufferTypeCheck,
      isBuffer: function (_headerHandler) {
        return null !== _headerHandler && !checkIfInterceptorIsDefined(_headerHandler) && null !== _headerHandler.constructor && !checkIfInterceptorIsDefined(_headerHandler.constructor) && isFunctionType(_headerHandler.constructor.isBuffer) && _headerHandler.constructor.isBuffer(_headerHandler);
      },
      isFormData: function (_headerHandler) {
        var arrayElementIndex;
        return _headerHandler && ("function" == typeof FormData && _headerHandler instanceof FormData || isFunctionType(_headerHandler.append) && ("formdata" === (arrayElementIndex = handleInputData(_headerHandler)) || "object" === arrayElementIndex && isFunctionType(_headerHandler.toString) && "[object FormData]" === _headerHandler.toString()));
      },
      isArrayBufferView: function (_headerHandler) {
        return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(_headerHandler) : _headerHandler && _headerHandler.buffer && _isArrayBufferTypeCheck(_headerHandler.buffer);
      },
      isString: urlProtocolScheme,
      isNumber: isNumberType,
      isBoolean: function (_headerHandler) {
        return !0 === _headerHandler || !1 === _headerHandler;
      },
      isObject: isObjectNotNull,
      isPlainObject: isObjectLiteral,
      isUndefined: checkIfInterceptorIsDefined,
      isDate: isDateArrayBufferType,
      isFile: isFileType,
      isBlob: BlobTypeChecker,
      isRegExp: isRegExpType,
      isFunction: isFunctionType,
      isStream: function (_headerHandler) {
        return isObjectNotNull(_headerHandler) && isFunctionType(_headerHandler.pipe);
      },
      isURLSearchParams: URLSearchParamsTypeChecker,
      isTypedArray: isSupportedUint8Array,
      isFileList: fileListType,
      forEach: iterateOverElements,
      merge: function _headerHandler() {
        for (var arrayElementIndex = (isNotGlobalObject(this) && this || {}).caseless, urlElement = {}, combineHeaderOptions = function (combineHeaderOptions, arrayElementIterator) {
            var maxIndex = arrayElementIndex && getKeyByValueIgnoringCase(urlElement, arrayElementIterator) || arrayElementIterator;
            isObjectLiteral(urlElement[maxIndex]) && isObjectLiteral(combineHeaderOptions) ? urlElement[maxIndex] = _headerHandler(urlElement[maxIndex], combineHeaderOptions) : isObjectLiteral(combineHeaderOptions) ? urlElement[maxIndex] = _headerHandler({}, combineHeaderOptions) : processResponseHeaders(combineHeaderOptions) ? urlElement[maxIndex] = combineHeaderOptions.slice() : urlElement[maxIndex] = combineHeaderOptions;
          }, arrayElementIterator = 0, maxIndex = arguments.length; arrayElementIterator < maxIndex; arrayElementIterator++) arguments[arrayElementIterator] && iterateOverElements(arguments[arrayElementIterator], combineHeaderOptions);
        return urlElement;
      },
      extend: function (_headerHandler, arrayElementIndex, urlElement) {
        return iterateOverElements(arrayElementIndex, function (arrayElementIndex, combineHeaderOptions) {
          urlElement && isFunctionType(arrayElementIndex) ? _headerHandler[combineHeaderOptions] = handleBaseUrl(arrayElementIndex, urlElement) : _headerHandler[combineHeaderOptions] = arrayElementIndex;
        }, {
          allOwnKeys: (arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}).allOwnKeys
        }), _headerHandler;
      },
      trim: function (_headerHandler) {
        return _headerHandler.trim ? _headerHandler.trim() : _headerHandler.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
      },
      stripBOM: function (_headerHandler) {
        return 65279 === _headerHandler.charCodeAt(0) && (_headerHandler = _headerHandler.slice(1)), _headerHandler;
      },
      inherits: function (_headerHandler, arrayElementIndex, urlElement, combineHeaderOptions) {
        _headerHandler.prototype = Object.create(arrayElementIndex.prototype, combineHeaderOptions), _headerHandler.prototype.constructor = _headerHandler, Object.defineProperty(_headerHandler, "super", {
          value: arrayElementIndex.prototype
        }), urlElement && Object.assign(_headerHandler.prototype, urlElement);
      },
      toFlatObject: function (_headerHandler, arrayElementIndex, urlElement, combineHeaderOptions) {
        var arrayElementIterator,
          maxIndex,
          handleBaseUrl,
          requestMerger = {};
        if (arrayElementIndex = arrayElementIndex || {}, null == _headerHandler) return arrayElementIndex;
        do {
          for (maxIndex = (arrayElementIterator = Object.getOwnPropertyNames(_headerHandler)).length; maxIndex-- > 0;) handleBaseUrl = arrayElementIterator[maxIndex], combineHeaderOptions && !combineHeaderOptions(handleBaseUrl, _headerHandler, arrayElementIndex) || requestMerger[handleBaseUrl] || (arrayElementIndex[handleBaseUrl] = _headerHandler[handleBaseUrl], requestMerger[handleBaseUrl] = !0);
          _headerHandler = !1 !== urlElement && httpRequest(_headerHandler);
        } while (_headerHandler && (!urlElement || urlElement(_headerHandler, arrayElementIndex)) && _headerHandler !== Object.prototype);
        return arrayElementIndex;
      },
      kindOf: handleInputData,
      kindOfTest: isArrayBufferTypeCheck,
      endsWith: function (_headerHandler, arrayElementIndex, urlElement) {
        _headerHandler = String(_headerHandler), (void 0 === urlElement || urlElement > _headerHandler.length) && (urlElement = _headerHandler.length), urlElement -= arrayElementIndex.length;
        var combineHeaderOptions = _headerHandler.indexOf(arrayElementIndex, urlElement);
        return -1 !== combineHeaderOptions && combineHeaderOptions === urlElement;
      },
      toArray: function (_headerHandler) {
        if (!_headerHandler) return null;
        if (processResponseHeaders(_headerHandler)) return _headerHandler;
        var arrayElementIndex = _headerHandler.length;
        if (!isNumberType(arrayElementIndex)) return null;
        for (var urlElement = new Array(arrayElementIndex); arrayElementIndex-- > 0;) urlElement[arrayElementIndex] = _headerHandler[arrayElementIndex];
        return urlElement;
      },
      forEachEntry: function (_headerHandler, arrayElementIndex) {
        for (var urlElement, combineHeaderOptions = (_headerHandler && _headerHandler[Symbol.iterator]).call(_headerHandler); (urlElement = combineHeaderOptions.next()) && !urlElement.done;) {
          var arrayElementIterator = urlElement.value;
          arrayElementIndex.call(_headerHandler, arrayElementIterator[0], arrayElementIterator[1]);
        }
      },
      matchAll: function (_headerHandler, arrayElementIndex) {
        for (var urlElement, combineHeaderOptions = []; null !== (urlElement = _headerHandler.exec(arrayElementIndex));) combineHeaderOptions.push(urlElement);
        return combineHeaderOptions;
      },
      isHTMLForm: HTMLFormElementBufferType,
      hasOwnProperty: hasOwnPropertyChecker,
      hasOwnProp: hasOwnPropertyChecker,
      reduceDescriptors: applyPropertyTransformations,
      freezeMethods: function (_headerHandler) {
        applyPropertyTransformations(_headerHandler, function (arrayElementIndex, urlElement) {
          if (isFunctionType(_headerHandler) && -1 !== ["arguments", "caller", "callee"].indexOf(urlElement)) return !1;
          var combineHeaderOptions = _headerHandler[urlElement];
          isFunctionType(combineHeaderOptions) && (arrayElementIndex.enumerable = !1, "writable" in arrayElementIndex ? arrayElementIndex.writable = !1 : arrayElementIndex.set || (arrayElementIndex.set = function () {
            throw Error("Can not rewrite read-only method '" + urlElement + "'");
          }));
        });
      },
      toObjectSet: function (_headerHandler, arrayElementIndex) {
        var urlElement = {},
          combineHeaderOptions = function (_headerHandler) {
            _headerHandler.forEach(function (_headerHandler) {
              urlElement[_headerHandler] = !0;
            });
          };
        return processResponseHeaders(_headerHandler) ? combineHeaderOptions(_headerHandler) : combineHeaderOptions(String(_headerHandler).split(arrayElementIndex)), urlElement;
      },
      toCamelCase: function (_headerHandler) {
        return _headerHandler.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (_headerHandler, arrayElementIndex, urlElement) {
          return arrayElementIndex.toUpperCase() + urlElement;
        });
      },
      noop: function () {},
      toFiniteNumber: function (_headerHandler, arrayElementIndex) {
        return _headerHandler = +_headerHandler, Number.isFinite(_headerHandler) ? _headerHandler : arrayElementIndex;
      },
      findKey: getKeyByValueIgnoringCase,
      global: globalContext,
      isContextDefined: isNotGlobalObject,
      ALPHABET: CharacterTypeCategories,
      generateString: function () {
        for (var _headerHandler = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 16, arrayElementIndex = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : CharacterTypeCategories.ALPHA_DIGIT, urlElement = "", combineHeaderOptions = arrayElementIndex.length; _headerHandler--;) urlElement += arrayElementIndex[Math.random() * combineHeaderOptions | 0];
        return urlElement;
      },
      isSpecCompliantForm: function (_headerHandler) {
        return !!(_headerHandler && isFunctionType(_headerHandler.append) && "FormData" === _headerHandler[Symbol.toStringTag] && _headerHandler[Symbol.iterator]);
      },
      toJSONObject: function (_headerHandler) {
        var arrayElementIndex = new Array(10);
        return function _headerHandler(urlElement, combineHeaderOptions) {
          if (isObjectNotNull(urlElement)) {
            if (arrayElementIndex.indexOf(urlElement) >= 0) return;
            if (!("toJSON" in urlElement)) {
              arrayElementIndex[combineHeaderOptions] = urlElement;
              var arrayElementIterator = processResponseHeaders(urlElement) ? [] : {};
              return iterateOverElements(urlElement, function (arrayElementIndex, urlElement) {
                var maxIndex = _headerHandler(arrayElementIndex, combineHeaderOptions + 1);
                !checkIfInterceptorIsDefined(maxIndex) && (arrayElementIterator[urlElement] = maxIndex);
              }), arrayElementIndex[combineHeaderOptions] = void 0, arrayElementIterator;
            }
          }
          return urlElement;
        }(_headerHandler, 0);
      },
      isAsyncFn: isAsyncFunctionType,
      isThenable: function (_headerHandler) {
        return _headerHandler && (isObjectNotNull(_headerHandler) || isFunctionType(_headerHandler)) && isFunctionType(_headerHandler.then) && isFunctionType(_headerHandler.catch);
      }
    };
  function HttpRequestError(_headerHandler, arrayElementIndex, urlElement, combineHeaderOptions, arrayElementIterator) {
    Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = _headerHandler, this.name = "AxiosError", arrayElementIndex && (this.code = arrayElementIndex), urlElement && (this.config = urlElement), combineHeaderOptions && (this.request = combineHeaderOptions), arrayElementIterator && (this.response = arrayElementIterator);
  }
  responseUtilities.inherits(HttpRequestError, Error, {
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
        config: responseUtilities.toJSONObject(this.config),
        code: this.code,
        status: this.response && this.response.status ? this.response.status : null
      };
    }
  });
  var HttpErrorCodes = HttpRequestError.prototype,
    AxiosErrorCodes = {};
  ["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(function (_headerHandler) {
    AxiosErrorCodes[_headerHandler] = {
      value: _headerHandler
    };
  }), Object.defineProperties(HttpRequestError, AxiosErrorCodes), Object.defineProperty(HttpErrorCodes, "isAxiosError", {
    value: !0
  }), HttpRequestError.from = function (_headerHandler, arrayElementIndex, urlElement, combineHeaderOptions, arrayElementIterator, maxIndex) {
    var handleBaseUrl = Object.create(HttpErrorCodes);
    return responseUtilities.toFlatObject(_headerHandler, handleBaseUrl, function (_headerHandler) {
      return _headerHandler !== Error.prototype;
    }, function (_headerHandler) {
      return "isAxiosError" !== _headerHandler;
    }), HttpRequestError.call(handleBaseUrl, _headerHandler.message, arrayElementIndex, urlElement, combineHeaderOptions, arrayElementIterator), handleBaseUrl.cause = _headerHandler, handleBaseUrl.name = _headerHandler.name, maxIndex && Object.assign(handleBaseUrl, maxIndex), handleBaseUrl;
  };
  function isPlainObjectOrArray(_headerHandler) {
    return responseUtilities.isPlainObject(_headerHandler) || responseUtilities.isArray(_headerHandler);
  }
  function stripArraySuffix(_headerHandler) {
    return responseUtilities.endsWith(_headerHandler, "[]") ? _headerHandler.slice(0, -2) : _headerHandler;
  }
  function combineAndFormatHeaderKeys(_headerHandler, arrayElementIndex, urlElement) {
    return _headerHandler ? _headerHandler.concat(arrayElementIndex).map(function (_headerHandler, arrayElementIndex) {
      return _headerHandler = stripArraySuffix(_headerHandler), !urlElement && arrayElementIndex ? "[" + _headerHandler + "]" : _headerHandler;
    }).join(urlElement ? "." : "") : arrayElementIndex;
  }
  var isMetaTokenPropertyMap = responseUtilities.toFlatObject(responseUtilities, {}, null, function (_headerHandler) {
    return /^is[A-Z]/.test(_headerHandler);
  });
  function combineFormData(arrayElementIndex, urlElement, combineHeaderOptions) {
    if (!responseUtilities.isObject(arrayElementIndex)) throw new TypeError("target must be an object");
    urlElement = urlElement || new FormData();
    var arrayElementIterator = (combineHeaderOptions = responseUtilities.toFlatObject(combineHeaderOptions, {
        metaTokens: !0,
        dots: !1,
        indexes: !1
      }, !1, function (_headerHandler, arrayElementIndex) {
        return !responseUtilities.isUndefined(arrayElementIndex[_headerHandler]);
      })).metaTokens,
      maxIndex = combineHeaderOptions.visitor || handleInputData,
      handleBaseUrl = combineHeaderOptions.dots,
      requestMerger = combineHeaderOptions.indexes,
      cleanupTimeoutHandlers = (combineHeaderOptions.Blob || "undefined" != typeof Blob && Blob) && responseUtilities.isSpecCompliantForm(urlElement);
    if (!responseUtilities.isFunction(maxIndex)) throw new TypeError("visitor must be a function");
    function httpRequest(_headerHandler) {
      if (null === _headerHandler) return "";
      if (responseUtilities.isDate(_headerHandler)) return _headerHandler.toISOString();
      if (!cleanupTimeoutHandlers && responseUtilities.isBlob(_headerHandler)) throw new HttpRequestError("Blob is not supported. Use a Buffer instead.");
      return responseUtilities.isArrayBuffer(_headerHandler) || responseUtilities.isTypedArray(_headerHandler) ? cleanupTimeoutHandlers && "function" == typeof Blob ? new Blob([_headerHandler]) : Buffer.from(_headerHandler) : _headerHandler;
    }
    function handleInputData(arrayElementIndex, combineHeaderOptions, maxIndex) {
      var cleanupTimeoutHandlers = arrayElementIndex;
      if (arrayElementIndex && !maxIndex && "object" === _headerHandler(arrayElementIndex)) if (responseUtilities.endsWith(combineHeaderOptions, "{}")) combineHeaderOptions = arrayElementIterator ? combineHeaderOptions : combineHeaderOptions.slice(0, -2), arrayElementIndex = JSON.stringify(arrayElementIndex);else if (responseUtilities.isArray(arrayElementIndex) && function (_headerHandler) {
        return responseUtilities.isArray(_headerHandler) && !_headerHandler.some(isPlainObjectOrArray);
      }(arrayElementIndex) || (responseUtilities.isFileList(arrayElementIndex) || responseUtilities.endsWith(combineHeaderOptions, "[]")) && (cleanupTimeoutHandlers = responseUtilities.toArray(arrayElementIndex))) return combineHeaderOptions = stripArraySuffix(combineHeaderOptions), cleanupTimeoutHandlers.forEach(function (_headerHandler, arrayElementIndex) {
        !responseUtilities.isUndefined(_headerHandler) && null !== _headerHandler && urlElement.append(!0 === requestMerger ? combineAndFormatHeaderKeys([combineHeaderOptions], arrayElementIndex, handleBaseUrl) : null === requestMerger ? combineHeaderOptions : combineHeaderOptions + "[]", httpRequest(_headerHandler));
      }), !1;
      return !!isPlainObjectOrArray(arrayElementIndex) || (urlElement.append(combineAndFormatHeaderKeys(maxIndex, combineHeaderOptions, handleBaseUrl), httpRequest(arrayElementIndex)), !1);
    }
    var isArrayBufferTypeCheck = [],
      currentInterceptorPosition = Object.assign(isMetaTokenPropertyMap, {
        defaultVisitor: handleInputData,
        convertValue: httpRequest,
        isVisitable: isPlainObjectOrArray
      });
    if (!responseUtilities.isObject(arrayElementIndex)) throw new TypeError("data must be an object");
    return function _headerHandler(arrayElementIndex, combineHeaderOptions) {
      if (!responseUtilities.isUndefined(arrayElementIndex)) {
        if (-1 !== isArrayBufferTypeCheck.indexOf(arrayElementIndex)) throw Error("Circular reference detected in " + combineHeaderOptions.join("."));
        isArrayBufferTypeCheck.push(arrayElementIndex), responseUtilities.forEach(arrayElementIndex, function (arrayElementIndex, arrayElementIterator) {
          !0 === (!(responseUtilities.isUndefined(arrayElementIndex) || null === arrayElementIndex) && maxIndex.call(urlElement, arrayElementIndex, responseUtilities.isString(arrayElementIterator) ? arrayElementIterator.trim() : arrayElementIterator, combineHeaderOptions, currentInterceptorPosition)) && _headerHandler(arrayElementIndex, combineHeaderOptions ? combineHeaderOptions.concat(arrayElementIterator) : [arrayElementIterator]);
        }), isArrayBufferTypeCheck.pop();
      }
    }(arrayElementIndex), urlElement;
  }
  function customUriEncoder(_headerHandler) {
    var arrayElementIndex = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0"
    };
    return encodeURIComponent(_headerHandler).replace(/[!'()~]|%20|%00/g, function (_headerHandler) {
      return arrayElementIndex[_headerHandler];
    });
  }
  function HeaderValueMapper(_headerHandler, arrayElementIndex) {
    this._pairs = [], _headerHandler && combineFormData(_headerHandler, this, arrayElementIndex);
  }
  var _KeyValuePairHandler = HeaderValueMapper.prototype;
  function customUrlDecoder(_headerHandler) {
    return encodeURIComponent(_headerHandler).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  function mergeQueryParameters(_headerHandler, arrayElementIndex, urlElement) {
    if (!arrayElementIndex) return _headerHandler;
    var combineHeaderOptions,
      arrayElementIterator = urlElement && urlElement.encode || customUrlDecoder,
      maxIndex = urlElement && urlElement.serialize;
    if (combineHeaderOptions = maxIndex ? maxIndex(arrayElementIndex, urlElement) : responseUtilities.isURLSearchParams(arrayElementIndex) ? arrayElementIndex.toString() : new HeaderValueMapper(arrayElementIndex, urlElement).toString(arrayElementIterator)) {
      var handleBaseUrl = _headerHandler.indexOf("#");
      -1 !== handleBaseUrl && (_headerHandler = _headerHandler.slice(0, handleBaseUrl)), _headerHandler += (-1 === _headerHandler.indexOf("?") ? "?" : "&") + combineHeaderOptions;
    }
    return _headerHandler;
  }
  _KeyValuePairHandler.append = function (_headerHandler, arrayElementIndex) {
    this._pairs.push([_headerHandler, arrayElementIndex]);
  }, _KeyValuePairHandler.toString = function (_headerHandler) {
    var arrayElementIndex = _headerHandler ? function (arrayElementIndex) {
      return _headerHandler.call(this, arrayElementIndex, customUriEncoder);
    } : customUriEncoder;
    return this._pairs.map(function (_headerHandler) {
      return arrayElementIndex(_headerHandler[0]) + "=" + arrayElementIndex(_headerHandler[1]);
    }, "").join("&");
  };
  var eventHandler,
    createHeaderHandler = function () {
      function _headerHandler() {
        arrayElementIndex(this, _headerHandler), this.handlers = [];
      }
      return combineHeaderOptions(_headerHandler, [{
        key: "use",
        value: function (_headerHandler, arrayElementIndex, urlElement) {
          return this.handlers.push({
            fulfilled: _headerHandler,
            rejected: arrayElementIndex,
            synchronous: !!urlElement && urlElement.synchronous,
            runWhen: urlElement ? urlElement.runWhen : null
          }), this.handlers.length - 1;
        }
      }, {
        key: "eject",
        value: function (_headerHandler) {
          this.handlers[_headerHandler] && (this.handlers[_headerHandler] = null);
        }
      }, {
        key: "clear",
        value: function () {
          this.handlers && (this.handlers = []);
        }
      }, {
        key: "forEach",
        value: function (_headerHandler) {
          responseUtilities.forEach(this.handlers, function (arrayElementIndex) {
            null !== arrayElementIndex && _headerHandler(arrayElementIndex);
          });
        }
      }]), _headerHandler;
    }(),
    httpRequestOptions = {
      silentJSONParsing: !0,
      forcedJSONParsing: !0,
      clarifyTimeoutError: !1
    },
    environmentSettings = {
      isBrowser: !0,
      classes: {
        URLSearchParams: "undefined" != typeof URLSearchParams ? URLSearchParams : HeaderValueMapper,
        FormData: "undefined" != typeof FormData ? FormData : null,
        Blob: "undefined" != typeof Blob ? Blob : null
      },
      isStandardBrowserEnv: ("undefined" == typeof navigator || "ReactNative" !== (eventHandler = navigator.product) && "NativeScript" !== eventHandler && "NS" !== eventHandler) && "undefined" != typeof window && "undefined" != typeof document,
      isStandardBrowserWebWorkerEnv: "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && "function" == typeof self.importScripts,
      protocols: ["http", "https", "file", "blob", "url", "data"]
    };
  function processHeaderValue(_headerHandler) {
    function arrayElementIndex(_headerHandler, urlElement, combineHeaderOptions, arrayElementIterator) {
      var maxIndex = _headerHandler[arrayElementIterator++],
        handleBaseUrl = Number.isFinite(+maxIndex),
        requestMerger = arrayElementIterator >= _headerHandler.length;
      return maxIndex = !maxIndex && responseUtilities.isArray(combineHeaderOptions) ? combineHeaderOptions.length : maxIndex, requestMerger ? (responseUtilities.hasOwnProp(combineHeaderOptions, maxIndex) ? combineHeaderOptions[maxIndex] = [combineHeaderOptions[maxIndex], urlElement] : combineHeaderOptions[maxIndex] = urlElement, !handleBaseUrl) : (combineHeaderOptions[maxIndex] && responseUtilities.isObject(combineHeaderOptions[maxIndex]) || (combineHeaderOptions[maxIndex] = []), arrayElementIndex(_headerHandler, urlElement, combineHeaderOptions[maxIndex], arrayElementIterator) && responseUtilities.isArray(combineHeaderOptions[maxIndex]) && (combineHeaderOptions[maxIndex] = function (_headerHandler) {
        var arrayElementIndex,
          urlElement,
          combineHeaderOptions = {},
          arrayElementIterator = Object.keys(_headerHandler),
          maxIndex = arrayElementIterator.length;
        for (arrayElementIndex = 0; arrayElementIndex < maxIndex; arrayElementIndex++) combineHeaderOptions[urlElement = arrayElementIterator[arrayElementIndex]] = _headerHandler[urlElement];
        return combineHeaderOptions;
      }(combineHeaderOptions[maxIndex])), !handleBaseUrl);
    }
    if (responseUtilities.isFormData(_headerHandler) && responseUtilities.isFunction(_headerHandler.entries)) {
      var urlElement = {};
      return responseUtilities.forEachEntry(_headerHandler, function (_headerHandler, combineHeaderOptions) {
        arrayElementIndex(function (_headerHandler) {
          return responseUtilities.matchAll(/\w+|\[(\w*)]/g, _headerHandler).map(function (_headerHandler) {
            return "[]" === _headerHandler[0] ? "" : _headerHandler[1] || _headerHandler[0];
          });
        }(_headerHandler), combineHeaderOptions, urlElement, 0);
      }), urlElement;
    }
    return null;
  }
  var formDataHandler = {
    transitional: httpRequestOptions,
    adapter: ["xhr", "http"],
    transformRequest: [function (_headerHandler, arrayElementIndex) {
      var urlElement,
        combineHeaderOptions = arrayElementIndex.getContentType() || "",
        arrayElementIterator = combineHeaderOptions.indexOf("application/json") > -1,
        maxIndex = responseUtilities.isObject(_headerHandler);
      if (maxIndex && responseUtilities.isHTMLForm(_headerHandler) && (_headerHandler = new FormData(_headerHandler)), responseUtilities.isFormData(_headerHandler)) return arrayElementIterator && arrayElementIterator ? JSON.stringify(processHeaderValue(_headerHandler)) : _headerHandler;
      if (responseUtilities.isArrayBuffer(_headerHandler) || responseUtilities.isBuffer(_headerHandler) || responseUtilities.isStream(_headerHandler) || responseUtilities.isFile(_headerHandler) || responseUtilities.isBlob(_headerHandler)) return _headerHandler;
      if (responseUtilities.isArrayBufferView(_headerHandler)) return _headerHandler.buffer;
      if (responseUtilities.isURLSearchParams(_headerHandler)) return arrayElementIndex.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), _headerHandler.toString();
      if (maxIndex) {
        if (combineHeaderOptions.indexOf("application/x-www-form-urlencoded") > -1) return function (_headerHandler, arrayElementIndex) {
          return combineFormData(_headerHandler, new environmentSettings.classes.URLSearchParams(), Object.assign({
            visitor: function (_headerHandler, arrayElementIndex, urlElement, combineHeaderOptions) {
              return environmentSettings.isNode && responseUtilities.isBuffer(_headerHandler) ? (this.append(arrayElementIndex, _headerHandler.toString("base64")), !1) : combineHeaderOptions.defaultVisitor.apply(this, arguments);
            }
          }, arrayElementIndex));
        }(_headerHandler, this.formSerializer).toString();
        if ((urlElement = responseUtilities.isFileList(_headerHandler)) || combineHeaderOptions.indexOf("multipart/form-data") > -1) {
          var handleBaseUrl = this.env && this.env.FormData;
          return combineFormData(urlElement ? {
            "files[]": _headerHandler
          } : _headerHandler, handleBaseUrl && new handleBaseUrl(), this.formSerializer);
        }
      }
      return maxIndex || arrayElementIterator ? (arrayElementIndex.setContentType("application/json", !1), function (_headerHandler, arrayElementIndex, urlElement) {
        if (responseUtilities.isString(_headerHandler)) try {
          return (arrayElementIndex || JSON.parse)(_headerHandler), responseUtilities.trim(_headerHandler);
        } catch (_headerHandler) {
          if ("SyntaxError" !== _headerHandler.name) throw _headerHandler;
        }
        return (urlElement || JSON.stringify)(_headerHandler);
      }(_headerHandler)) : _headerHandler;
    }],
    transformResponse: [function (_headerHandler) {
      var arrayElementIndex = this.transitional || formDataHandler.transitional,
        urlElement = arrayElementIndex && arrayElementIndex.forcedJSONParsing,
        combineHeaderOptions = "json" === this.responseType;
      if (_headerHandler && responseUtilities.isString(_headerHandler) && (urlElement && !this.responseType || combineHeaderOptions)) {
        var arrayElementIterator = !(arrayElementIndex && arrayElementIndex.silentJSONParsing) && combineHeaderOptions;
        try {
          return JSON.parse(_headerHandler);
        } catch (_headerHandler) {
          if (arrayElementIterator) {
            if ("SyntaxError" === _headerHandler.name) throw HttpRequestError.from(_headerHandler, HttpRequestError.ERR_BAD_RESPONSE, this, null, this.response);
            throw _headerHandler;
          }
        }
      }
      return _headerHandler;
    }],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: environmentSettings.classes.FormData,
      Blob: environmentSettings.classes.Blob
    },
    validateStatus: function (_headerHandler) {
      return _headerHandler >= 200 && _headerHandler < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": void 0
      }
    }
  };
  responseUtilities.forEach(["delete", "get", "head", "post", "put", "patch"], function (_headerHandler) {
    formDataHandler.headers[_headerHandler] = {};
  });
  var formDataRequestConfig = formDataHandler,
    httpHeadersMap = responseUtilities.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]),
    internalSymbol = Symbol("internals");
  function sanitizeHeaderValue(_headerHandler) {
    return _headerHandler && String(_headerHandler).trim().toLowerCase();
  }
  function normalizeHeaderValue(_headerHandler) {
    return !1 === _headerHandler || null == _headerHandler ? _headerHandler : responseUtilities.isArray(_headerHandler) ? _headerHandler.map(normalizeHeaderValue) : String(_headerHandler);
  }
  function matchesPatternInString(_headerHandler, arrayElementIndex, urlElement, combineHeaderOptions, arrayElementIterator) {
    return responseUtilities.isFunction(combineHeaderOptions) ? combineHeaderOptions.call(this, arrayElementIndex, urlElement) : (arrayElementIterator && (arrayElementIndex = urlElement), responseUtilities.isString(arrayElementIndex) ? responseUtilities.isString(combineHeaderOptions) ? -1 !== arrayElementIndex.indexOf(combineHeaderOptions) : responseUtilities.isRegExp(combineHeaderOptions) ? combineHeaderOptions.test(arrayElementIndex) : void 0 : void 0);
  }
  var headerValueHandler = function () {
    function _headerHandler(urlElement) {
      arrayElementIndex(this, _headerHandler), urlElement && this.set(urlElement);
    }
    return combineHeaderOptions(_headerHandler, [{
      key: "set",
      value: function (_headerHandler, arrayElementIndex, urlElement) {
        var combineHeaderOptions = this;
        function arrayElementIterator(_headerHandler, arrayElementIndex, urlElement) {
          var arrayElementIterator = sanitizeHeaderValue(arrayElementIndex);
          if (!arrayElementIterator) throw new Error("header name must be a non-empty string");
          var maxIndex = responseUtilities.findKey(combineHeaderOptions, arrayElementIterator);
          (!maxIndex || void 0 === combineHeaderOptions[maxIndex] || !0 === urlElement || void 0 === urlElement && !1 !== combineHeaderOptions[maxIndex]) && (combineHeaderOptions[maxIndex || arrayElementIndex] = normalizeHeaderValue(_headerHandler));
        }
        var maxIndex,
          handleBaseUrl,
          requestMerger,
          cleanupTimeoutHandlers,
          httpRequest,
          handleInputData = function (_headerHandler, arrayElementIndex) {
            return responseUtilities.forEach(_headerHandler, function (_headerHandler, urlElement) {
              return arrayElementIterator(_headerHandler, urlElement, arrayElementIndex);
            });
          };
        return responseUtilities.isPlainObject(_headerHandler) || _headerHandler instanceof this.constructor ? handleInputData(_headerHandler, arrayElementIndex) : responseUtilities.isString(_headerHandler) && (_headerHandler = _headerHandler.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(_headerHandler.trim()) ? handleInputData((httpRequest = {}, (maxIndex = _headerHandler) && maxIndex.split("\n").forEach(function (_headerHandler) {
          cleanupTimeoutHandlers = _headerHandler.indexOf(":"), handleBaseUrl = _headerHandler.substring(0, cleanupTimeoutHandlers).trim().toLowerCase(), requestMerger = _headerHandler.substring(cleanupTimeoutHandlers + 1).trim(), !handleBaseUrl || httpRequest[handleBaseUrl] && httpHeadersMap[handleBaseUrl] || ("set-cookie" === handleBaseUrl ? httpRequest[handleBaseUrl] ? httpRequest[handleBaseUrl].push(requestMerger) : httpRequest[handleBaseUrl] = [requestMerger] : httpRequest[handleBaseUrl] = httpRequest[handleBaseUrl] ? httpRequest[handleBaseUrl] + ", " + requestMerger : requestMerger);
        }), httpRequest), arrayElementIndex) : null != _headerHandler && arrayElementIterator(arrayElementIndex, _headerHandler, urlElement), this;
      }
    }, {
      key: "get",
      value: function (_headerHandler, arrayElementIndex) {
        if (_headerHandler = sanitizeHeaderValue(_headerHandler)) {
          var urlElement = responseUtilities.findKey(this, _headerHandler);
          if (urlElement) {
            var combineHeaderOptions = this[urlElement];
            if (!arrayElementIndex) return combineHeaderOptions;
            if (!0 === arrayElementIndex) return function (_headerHandler) {
              for (var arrayElementIndex, urlElement = Object.create(null), combineHeaderOptions = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; arrayElementIndex = combineHeaderOptions.exec(_headerHandler);) urlElement[arrayElementIndex[1]] = arrayElementIndex[2];
              return urlElement;
            }(combineHeaderOptions);
            if (responseUtilities.isFunction(arrayElementIndex)) return arrayElementIndex.call(this, combineHeaderOptions, urlElement);
            if (responseUtilities.isRegExp(arrayElementIndex)) return arrayElementIndex.exec(combineHeaderOptions);
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
    }, {
      key: "has",
      value: function (_headerHandler, arrayElementIndex) {
        if (_headerHandler = sanitizeHeaderValue(_headerHandler)) {
          var urlElement = responseUtilities.findKey(this, _headerHandler);
          return !(!urlElement || void 0 === this[urlElement] || arrayElementIndex && !matchesPatternInString(0, this[urlElement], urlElement, arrayElementIndex));
        }
        return !1;
      }
    }, {
      key: "delete",
      value: function (_headerHandler, arrayElementIndex) {
        var urlElement = this,
          combineHeaderOptions = !1;
        function arrayElementIterator(_headerHandler) {
          if (_headerHandler = sanitizeHeaderValue(_headerHandler)) {
            var arrayElementIterator = responseUtilities.findKey(urlElement, _headerHandler);
            !arrayElementIterator || arrayElementIndex && !matchesPatternInString(0, urlElement[arrayElementIterator], arrayElementIterator, arrayElementIndex) || (delete urlElement[arrayElementIterator], combineHeaderOptions = !0);
          }
        }
        return responseUtilities.isArray(_headerHandler) ? _headerHandler.forEach(arrayElementIterator) : arrayElementIterator(_headerHandler), combineHeaderOptions;
      }
    }, {
      key: "clear",
      value: function (_headerHandler) {
        for (var arrayElementIndex = Object.keys(this), urlElement = arrayElementIndex.length, combineHeaderOptions = !1; urlElement--;) {
          var arrayElementIterator = arrayElementIndex[urlElement];
          _headerHandler && !matchesPatternInString(0, this[arrayElementIterator], arrayElementIterator, _headerHandler, !0) || (delete this[arrayElementIterator], combineHeaderOptions = !0);
        }
        return combineHeaderOptions;
      }
    }, {
      key: "normalize",
      value: function (_headerHandler) {
        var arrayElementIndex = this,
          urlElement = {};
        return responseUtilities.forEach(this, function (combineHeaderOptions, arrayElementIterator) {
          var maxIndex = responseUtilities.findKey(urlElement, arrayElementIterator);
          if (maxIndex) return arrayElementIndex[maxIndex] = normalizeHeaderValue(combineHeaderOptions), void delete arrayElementIndex[arrayElementIterator];
          var handleBaseUrl = _headerHandler ? function (_headerHandler) {
            return _headerHandler.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function (_headerHandler, arrayElementIndex, urlElement) {
              return arrayElementIndex.toUpperCase() + urlElement;
            });
          }(arrayElementIterator) : String(arrayElementIterator).trim();
          handleBaseUrl !== arrayElementIterator && delete arrayElementIndex[arrayElementIterator], arrayElementIndex[handleBaseUrl] = normalizeHeaderValue(combineHeaderOptions), urlElement[handleBaseUrl] = !0;
        }), this;
      }
    }, {
      key: "concat",
      value: function () {
        for (var _headerHandler, arrayElementIndex = arguments.length, urlElement = new Array(arrayElementIndex), combineHeaderOptions = 0; combineHeaderOptions < arrayElementIndex; combineHeaderOptions++) urlElement[combineHeaderOptions] = arguments[combineHeaderOptions];
        return (_headerHandler = this.constructor).concat.apply(_headerHandler, [this].concat(urlElement));
      }
    }, {
      key: "toJSON",
      value: function (_headerHandler) {
        var arrayElementIndex = Object.create(null);
        return responseUtilities.forEach(this, function (urlElement, combineHeaderOptions) {
          null != urlElement && !1 !== urlElement && (arrayElementIndex[combineHeaderOptions] = _headerHandler && responseUtilities.isArray(urlElement) ? urlElement.join(", ") : urlElement);
        }), arrayElementIndex;
      }
    }, {
      key: Symbol.iterator,
      value: function () {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }
    }, {
      key: "toString",
      value: function () {
        return Object.entries(this.toJSON()).map(function (_headerHandler) {
          var arrayElementIndex = arrayElementIterator(_headerHandler, 2);
          return arrayElementIndex[0] + ": " + arrayElementIndex[1];
        }).join("\n");
      }
    }, {
      key: Symbol.toStringTag,
      get: function () {
        return "AxiosHeaders";
      }
    }], [{
      key: "from",
      value: function (_headerHandler) {
        return _headerHandler instanceof this ? _headerHandler : new this(_headerHandler);
      }
    }, {
      key: "concat",
      value: function (_headerHandler) {
        for (var arrayElementIndex = new this(_headerHandler), urlElement = arguments.length, combineHeaderOptions = new Array(urlElement > 1 ? urlElement - 1 : 0), arrayElementIterator = 1; arrayElementIterator < urlElement; arrayElementIterator++) combineHeaderOptions[arrayElementIterator - 1] = arguments[arrayElementIterator];
        return combineHeaderOptions.forEach(function (_headerHandler) {
          return arrayElementIndex.set(_headerHandler);
        }), arrayElementIndex;
      }
    }, {
      key: "accessor",
      value: function (_headerHandler) {
        var arrayElementIndex = (this[internalSymbol] = this[internalSymbol] = {
            accessors: {}
          }).accessors,
          urlElement = this.prototype;
        function combineHeaderOptions(_headerHandler) {
          var combineHeaderOptions = sanitizeHeaderValue(_headerHandler);
          arrayElementIndex[combineHeaderOptions] || (!function (_headerHandler, arrayElementIndex) {
            var urlElement = responseUtilities.toCamelCase(" " + arrayElementIndex);
            ["get", "set", "has"].forEach(function (combineHeaderOptions) {
              Object.defineProperty(_headerHandler, combineHeaderOptions + urlElement, {
                value: function (_headerHandler, urlElement, arrayElementIterator) {
                  return this[combineHeaderOptions].call(this, arrayElementIndex, _headerHandler, urlElement, arrayElementIterator);
                },
                configurable: !0
              });
            });
          }(urlElement, _headerHandler), arrayElementIndex[combineHeaderOptions] = !0);
        }
        return responseUtilities.isArray(_headerHandler) ? _headerHandler.forEach(combineHeaderOptions) : combineHeaderOptions(_headerHandler), this;
      }
    }]), _headerHandler;
  }();
  headerValueHandler.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]), responseUtilities.reduceDescriptors(headerValueHandler.prototype, function (_headerHandler, arrayElementIndex) {
    var urlElement = _headerHandler.value,
      combineHeaderOptions = arrayElementIndex[0].toUpperCase() + arrayElementIndex.slice(1);
    return {
      get: function () {
        return urlElement;
      },
      set: function (_headerHandler) {
        this[combineHeaderOptions] = _headerHandler;
      }
    };
  }), responseUtilities.freezeMethods(headerValueHandler);
  var __headerHandler = headerValueHandler;
  function handleResponseData(_headerHandler, arrayElementIndex) {
    var urlElement = this || formDataRequestConfig,
      combineHeaderOptions = arrayElementIndex || urlElement,
      arrayElementIterator = __headerHandler.from(combineHeaderOptions.headers),
      maxIndex = combineHeaderOptions.data;
    return responseUtilities.forEach(_headerHandler, function (_headerHandler) {
      maxIndex = _headerHandler.call(urlElement, maxIndex, arrayElementIterator.normalize(), arrayElementIndex ? arrayElementIndex.status : void 0);
    }), arrayElementIterator.normalize(), maxIndex;
  }
  function isErrorCanceled(_headerHandler) {
    return !(!_headerHandler || !_headerHandler.__CANCEL__);
  }
  function CancellationError(_headerHandler, arrayElementIndex, urlElement) {
    HttpRequestError.call(this, null == _headerHandler ? "canceled" : _headerHandler, HttpRequestError.ERR_CANCELED, arrayElementIndex, urlElement), this.name = "CanceledError";
  }
  responseUtilities.inherits(CancellationError, HttpRequestError, {
    __CANCEL__: !0
  });
  var cookieStorageManager = environmentSettings.isStandardBrowserEnv ? {
    write: function (_headerHandler, arrayElementIndex, urlElement, combineHeaderOptions, arrayElementIterator, maxIndex) {
      var handleBaseUrl = [];
      handleBaseUrl.push(_headerHandler + "=" + encodeURIComponent(arrayElementIndex)), responseUtilities.isNumber(urlElement) && handleBaseUrl.push("expires=" + new Date(urlElement).toGMTString()), responseUtilities.isString(combineHeaderOptions) && handleBaseUrl.push("path=" + combineHeaderOptions), responseUtilities.isString(arrayElementIterator) && handleBaseUrl.push("domain=" + arrayElementIterator), !0 === maxIndex && handleBaseUrl.push("secure"), document.cookie = handleBaseUrl.join("; ");
    },
    read: function (_headerHandler) {
      var arrayElementIndex = document.cookie.match(new RegExp("(^|;\\s*)(" + _headerHandler + ")=([^;]*)"));
      return arrayElementIndex ? decodeURIComponent(arrayElementIndex[3]) : null;
    },
    remove: function (_headerHandler) {
      this.write(_headerHandler, "", Date.now() - 864e5);
    }
  } : {
    write: function () {},
    read: function () {
      return null;
    },
    remove: function () {}
  };
  function joinUrlPathSegments(_headerHandler, arrayElementIndex) {
    return _headerHandler && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(arrayElementIndex) ? function (_headerHandler, arrayElementIndex) {
      return arrayElementIndex ? _headerHandler.replace(/\/+$/, "") + "/" + arrayElementIndex.replace(/^\/+/, "") : _headerHandler;
    }(_headerHandler, arrayElementIndex) : arrayElementIndex;
  }
  var isBrowserEnvironmentStandard = environmentSettings.isStandardBrowserEnv ? function () {
    var _headerHandler,
      arrayElementIndex = /(msie|trident)/i.test(navigator.userAgent),
      urlElement = document.createElement("a");
    function combineHeaderOptions(_headerHandler) {
      var combineHeaderOptions = _headerHandler;
      return arrayElementIndex && (urlElement.setAttribute("href", combineHeaderOptions), combineHeaderOptions = urlElement.href), urlElement.setAttribute("href", combineHeaderOptions), {
        href: urlElement.href,
        protocol: urlElement.protocol ? urlElement.protocol.replace(/:$/, "") : "",
        host: urlElement.host,
        search: urlElement.search ? urlElement.search.replace(/^\?/, "") : "",
        hash: urlElement.hash ? urlElement.hash.replace(/^#/, "") : "",
        hostname: urlElement.hostname,
        port: urlElement.port,
        pathname: "/" === urlElement.pathname.charAt(0) ? urlElement.pathname : "/" + urlElement.pathname
      };
    }
    return _headerHandler = combineHeaderOptions(window.location.href), function (arrayElementIndex) {
      var urlElement = responseUtilities.isString(arrayElementIndex) ? combineHeaderOptions(arrayElementIndex) : arrayElementIndex;
      return urlElement.protocol === _headerHandler.protocol && urlElement.host === _headerHandler.host;
    };
  }() : function () {
    return !0;
  };
  function requestRateLimiter(_headerHandler, arrayElementIndex) {
    var urlElement = 0,
      combineHeaderOptions = function (_headerHandler, arrayElementIndex) {
        _headerHandler = _headerHandler || 10;
        var urlElement,
          combineHeaderOptions = new Array(_headerHandler),
          arrayElementIterator = new Array(_headerHandler),
          maxIndex = 0,
          handleBaseUrl = 0;
        return arrayElementIndex = void 0 !== arrayElementIndex ? arrayElementIndex : 1e3, function (requestMerger) {
          var cleanupTimeoutHandlers = Date.now(),
            httpRequest = arrayElementIterator[handleBaseUrl];
          urlElement || (urlElement = cleanupTimeoutHandlers), combineHeaderOptions[maxIndex] = requestMerger, arrayElementIterator[maxIndex] = cleanupTimeoutHandlers;
          for (var handleInputData = handleBaseUrl, isArrayBufferTypeCheck = 0; handleInputData !== maxIndex;) isArrayBufferTypeCheck += combineHeaderOptions[handleInputData++], handleInputData %= _headerHandler;
          if ((maxIndex = (maxIndex + 1) % _headerHandler) === handleBaseUrl && (handleBaseUrl = (handleBaseUrl + 1) % _headerHandler), !(cleanupTimeoutHandlers - urlElement < arrayElementIndex)) {
            var currentInterceptorPosition = httpRequest && cleanupTimeoutHandlers - httpRequest;
            return currentInterceptorPosition ? Math.round(1e3 * isArrayBufferTypeCheck / currentInterceptorPosition) : void 0;
          }
        };
      }(50, 250);
    return function (arrayElementIterator) {
      var maxIndex = arrayElementIterator.loaded,
        handleBaseUrl = arrayElementIterator.lengthComputable ? arrayElementIterator.total : void 0,
        requestMerger = maxIndex - urlElement,
        cleanupTimeoutHandlers = combineHeaderOptions(requestMerger);
      urlElement = maxIndex;
      var httpRequest = {
        loaded: maxIndex,
        total: handleBaseUrl,
        progress: handleBaseUrl ? maxIndex / handleBaseUrl : void 0,
        bytes: requestMerger,
        rate: cleanupTimeoutHandlers || void 0,
        estimated: cleanupTimeoutHandlers && handleBaseUrl && maxIndex <= handleBaseUrl ? (handleBaseUrl - maxIndex) / cleanupTimeoutHandlers : void 0,
        event: arrayElementIterator
      };
      httpRequest[arrayElementIndex ? "download" : "upload"] = !0, _headerHandler(httpRequest);
    };
  }
  var __httpRequestConfig = {
    http: null,
    xhr: "undefined" != typeof XMLHttpRequest && function (_headerHandler) {
      return new Promise(function (arrayElementIndex, urlElement) {
        var combineHeaderOptions,
          arrayElementIterator,
          maxIndex = _headerHandler.data,
          handleBaseUrl = __headerHandler.from(_headerHandler.headers).normalize(),
          requestMerger = _headerHandler.responseType;
        function cleanupTimeoutHandlers() {
          _headerHandler.cancelToken && _headerHandler.cancelToken.unsubscribe(combineHeaderOptions), _headerHandler.signal && _headerHandler.signal.removeEventListener("abort", combineHeaderOptions);
        }
        responseUtilities.isFormData(maxIndex) && (environmentSettings.isStandardBrowserEnv || environmentSettings.isStandardBrowserWebWorkerEnv ? handleBaseUrl.setContentType(!1) : handleBaseUrl.getContentType(/^\s*multipart\/form-data/) ? responseUtilities.isString(arrayElementIterator = handleBaseUrl.getContentType()) && handleBaseUrl.setContentType(arrayElementIterator.replace(/^\s*(multipart\/form-data);+/, "$1")) : handleBaseUrl.setContentType("multipart/form-data"));
        var httpRequest = new XMLHttpRequest();
        if (_headerHandler.auth) {
          var handleInputData = _headerHandler.auth.username || "",
            isArrayBufferTypeCheck = _headerHandler.auth.password ? unescape(encodeURIComponent(_headerHandler.auth.password)) : "";
          handleBaseUrl.set("Authorization", "Basic " + btoa(handleInputData + ":" + isArrayBufferTypeCheck));
        }
        var currentInterceptorPosition = joinUrlPathSegments(_headerHandler.baseURL, _headerHandler.url);
        function processResponseHeaders() {
          if (httpRequest) {
            var combineHeaderOptions = __headerHandler.from("getAllResponseHeaders" in httpRequest && httpRequest.getAllResponseHeaders());
            !function (_headerHandler, arrayElementIndex, urlElement) {
              var combineHeaderOptions = urlElement.config.validateStatus;
              urlElement.status && combineHeaderOptions && !combineHeaderOptions(urlElement.status) ? arrayElementIndex(new HttpRequestError("Request failed with status code " + urlElement.status, [HttpRequestError.ERR_BAD_REQUEST, HttpRequestError.ERR_BAD_RESPONSE][Math.floor(urlElement.status / 100) - 4], urlElement.config, urlElement.request, urlElement)) : _headerHandler(urlElement);
            }(function (_headerHandler) {
              arrayElementIndex(_headerHandler), cleanupTimeoutHandlers();
            }, function (_headerHandler) {
              urlElement(_headerHandler), cleanupTimeoutHandlers();
            }, {
              data: requestMerger && "text" !== requestMerger && "json" !== requestMerger ? httpRequest.response : httpRequest.responseText,
              status: httpRequest.status,
              statusText: httpRequest.statusText,
              headers: combineHeaderOptions,
              config: _headerHandler,
              request: httpRequest
            }), httpRequest = null;
          }
        }
        if (httpRequest.open(_headerHandler.method.toUpperCase(), mergeQueryParameters(currentInterceptorPosition, _headerHandler.params, _headerHandler.paramsSerializer), !0), httpRequest.timeout = _headerHandler.timeout, "onloadend" in httpRequest ? httpRequest.onloadend = processResponseHeaders : httpRequest.onreadystatechange = function () {
          httpRequest && 4 === httpRequest.readyState && (0 !== httpRequest.status || httpRequest.responseURL && 0 === httpRequest.responseURL.indexOf("file:")) && setTimeout(processResponseHeaders);
        }, httpRequest.onabort = function () {
          httpRequest && (urlElement(new HttpRequestError("Request aborted", HttpRequestError.ECONNABORTED, _headerHandler, httpRequest)), httpRequest = null);
        }, httpRequest.onerror = function () {
          urlElement(new HttpRequestError("Network Error", HttpRequestError.ERR_NETWORK, _headerHandler, httpRequest)), httpRequest = null;
        }, httpRequest.ontimeout = function () {
          var arrayElementIndex = _headerHandler.timeout ? "timeout of " + _headerHandler.timeout + "ms exceeded" : "timeout exceeded",
            combineHeaderOptions = _headerHandler.transitional || httpRequestOptions;
          _headerHandler.timeoutErrorMessage && (arrayElementIndex = _headerHandler.timeoutErrorMessage), urlElement(new HttpRequestError(arrayElementIndex, combineHeaderOptions.clarifyTimeoutError ? HttpRequestError.ETIMEDOUT : HttpRequestError.ECONNABORTED, _headerHandler, httpRequest)), httpRequest = null;
        }, environmentSettings.isStandardBrowserEnv) {
          var checkIfInterceptorIsDefined = isBrowserEnvironmentStandard(currentInterceptorPosition) && _headerHandler.xsrfCookieName && cookieStorageManager.read(_headerHandler.xsrfCookieName);
          checkIfInterceptorIsDefined && handleBaseUrl.set(_headerHandler.xsrfHeaderName, checkIfInterceptorIsDefined);
        }
        void 0 === maxIndex && handleBaseUrl.setContentType(null), "setRequestHeader" in httpRequest && responseUtilities.forEach(handleBaseUrl.toJSON(), function (_headerHandler, arrayElementIndex) {
          httpRequest.setRequestHeader(arrayElementIndex, _headerHandler);
        }), responseUtilities.isUndefined(_headerHandler.withCredentials) || (httpRequest.withCredentials = !!_headerHandler.withCredentials), requestMerger && "json" !== requestMerger && (httpRequest.responseType = _headerHandler.responseType), "function" == typeof _headerHandler.onDownloadProgress && httpRequest.addEventListener("progress", requestRateLimiter(_headerHandler.onDownloadProgress, !0)), "function" == typeof _headerHandler.onUploadProgress && httpRequest.upload && httpRequest.upload.addEventListener("progress", requestRateLimiter(_headerHandler.onUploadProgress)), (_headerHandler.cancelToken || _headerHandler.signal) && (combineHeaderOptions = function (arrayElementIndex) {
          httpRequest && (urlElement(!arrayElementIndex || arrayElementIndex.type ? new CancellationError(null, _headerHandler, httpRequest) : arrayElementIndex), httpRequest.abort(), httpRequest = null);
        }, _headerHandler.cancelToken && _headerHandler.cancelToken.subscribe(combineHeaderOptions), _headerHandler.signal && (_headerHandler.signal.aborted ? combineHeaderOptions() : _headerHandler.signal.addEventListener("abort", combineHeaderOptions)));
        var _isArrayBufferTypeCheck,
          urlProtocolScheme = (_isArrayBufferTypeCheck = /^([-+\w]{1,25})(:?\/\/|:)/.exec(currentInterceptorPosition)) && _isArrayBufferTypeCheck[1] || "";
        urlProtocolScheme && -1 === environmentSettings.protocols.indexOf(urlProtocolScheme) ? urlElement(new HttpRequestError("Unsupported protocol " + urlProtocolScheme + ":", HttpRequestError.ERR_BAD_REQUEST, _headerHandler)) : httpRequest.send(maxIndex || null);
      });
    }
  };
  responseUtilities.forEach(__httpRequestConfig, function (_headerHandler, arrayElementIndex) {
    if (_headerHandler) {
      try {
        Object.defineProperty(_headerHandler, "name", {
          value: arrayElementIndex
        });
      } catch (_headerHandler) {}
      Object.defineProperty(_headerHandler, "adapterName", {
        value: arrayElementIndex
      });
    }
  });
  var formatErrorMessageForProtocol = function (_headerHandler) {
      return "- ".concat(_headerHandler);
    },
    isAdapterValid = function (_headerHandler) {
      return responseUtilities.isFunction(_headerHandler) || null === _headerHandler || !1 === _headerHandler;
    },
    retrieveAdapter = function (_headerHandler) {
      for (var arrayElementIndex, urlElement, combineHeaderOptions = (_headerHandler = responseUtilities.isArray(_headerHandler) ? _headerHandler : [_headerHandler]).length, maxIndex = {}, handleBaseUrl = 0; handleBaseUrl < combineHeaderOptions; handleBaseUrl++) {
        var requestMerger = void 0;
        if (urlElement = arrayElementIndex = _headerHandler[handleBaseUrl], !isAdapterValid(arrayElementIndex) && void 0 === (urlElement = __httpRequestConfig[(requestMerger = String(arrayElementIndex)).toLowerCase()])) throw new HttpRequestError("Unknown adapter '".concat(requestMerger, "'"));
        if (urlElement) break;
        maxIndex[requestMerger || "#" + handleBaseUrl] = urlElement;
      }
      if (!urlElement) {
        var cleanupTimeoutHandlers = Object.entries(maxIndex).map(function (_headerHandler) {
          var arrayElementIndex = arrayElementIterator(_headerHandler, 2),
            urlElement = arrayElementIndex[0],
            combineHeaderOptions = arrayElementIndex[1];
          return "adapter ".concat(urlElement, " ") + (!1 === combineHeaderOptions ? "is not supported by the environment" : "is not available in the build");
        });
        throw new HttpRequestError("There is no suitable adapter to dispatch the request " + (combineHeaderOptions ? cleanupTimeoutHandlers.length > 1 ? "since :\n" + cleanupTimeoutHandlers.map(formatErrorMessageForProtocol).join("\n") : " " + formatErrorMessageForProtocol(cleanupTimeoutHandlers[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
      }
      return urlElement;
    };
  function checkRequestCancellation(_headerHandler) {
    if (_headerHandler.cancelToken && _headerHandler.cancelToken.throwIfRequested(), _headerHandler.signal && _headerHandler.signal.aborted) throw new CancellationError(null, _headerHandler);
  }
  function handleRequestProcessing(_headerHandler) {
    return checkRequestCancellation(_headerHandler), _headerHandler.headers = __headerHandler.from(_headerHandler.headers), _headerHandler.data = handleResponseData.call(_headerHandler, _headerHandler.transformRequest), -1 !== ["post", "put", "patch"].indexOf(_headerHandler.method) && _headerHandler.headers.setContentType("application/x-www-form-urlencoded", !1), retrieveAdapter(_headerHandler.adapter || formDataRequestConfig.adapter)(_headerHandler).then(function (arrayElementIndex) {
      return checkRequestCancellation(_headerHandler), arrayElementIndex.data = handleResponseData.call(_headerHandler, _headerHandler.transformResponse, arrayElementIndex), arrayElementIndex.headers = __headerHandler.from(arrayElementIndex.headers), arrayElementIndex;
    }, function (arrayElementIndex) {
      return isErrorCanceled(arrayElementIndex) || (checkRequestCancellation(_headerHandler), arrayElementIndex && arrayElementIndex.response && (arrayElementIndex.response.data = handleResponseData.call(_headerHandler, _headerHandler.transformResponse, arrayElementIndex.response), arrayElementIndex.response.headers = __headerHandler.from(arrayElementIndex.response.headers))), Promise.reject(arrayElementIndex);
    });
  }
  var convertHeaderValueToJSON = function (_headerHandler) {
    return _headerHandler instanceof __headerHandler ? _headerHandler.toJSON() : _headerHandler;
  };
  function mergeRequestHeaders(_headerHandler, arrayElementIndex) {
    arrayElementIndex = arrayElementIndex || {};
    var urlElement = {};
    function combineHeaderOptions(_headerHandler, arrayElementIndex, urlElement) {
      return responseUtilities.isPlainObject(_headerHandler) && responseUtilities.isPlainObject(arrayElementIndex) ? responseUtilities.merge.call({
        caseless: urlElement
      }, _headerHandler, arrayElementIndex) : responseUtilities.isPlainObject(arrayElementIndex) ? responseUtilities.merge({}, arrayElementIndex) : responseUtilities.isArray(arrayElementIndex) ? arrayElementIndex.slice() : arrayElementIndex;
    }
    function arrayElementIterator(_headerHandler, arrayElementIndex, urlElement) {
      return responseUtilities.isUndefined(arrayElementIndex) ? responseUtilities.isUndefined(_headerHandler) ? void 0 : combineHeaderOptions(void 0, _headerHandler, urlElement) : combineHeaderOptions(_headerHandler, arrayElementIndex, urlElement);
    }
    function maxIndex(_headerHandler, arrayElementIndex) {
      if (!responseUtilities.isUndefined(arrayElementIndex)) return combineHeaderOptions(void 0, arrayElementIndex);
    }
    function handleBaseUrl(_headerHandler, arrayElementIndex) {
      return responseUtilities.isUndefined(arrayElementIndex) ? responseUtilities.isUndefined(_headerHandler) ? void 0 : combineHeaderOptions(void 0, _headerHandler) : combineHeaderOptions(void 0, arrayElementIndex);
    }
    function requestMerger(urlElement, arrayElementIterator, maxIndex) {
      return maxIndex in arrayElementIndex ? combineHeaderOptions(urlElement, arrayElementIterator) : maxIndex in _headerHandler ? combineHeaderOptions(void 0, urlElement) : void 0;
    }
    var cleanupTimeoutHandlers = {
      url: maxIndex,
      method: maxIndex,
      data: maxIndex,
      baseURL: handleBaseUrl,
      transformRequest: handleBaseUrl,
      transformResponse: handleBaseUrl,
      paramsSerializer: handleBaseUrl,
      timeout: handleBaseUrl,
      timeoutMessage: handleBaseUrl,
      withCredentials: handleBaseUrl,
      adapter: handleBaseUrl,
      responseType: handleBaseUrl,
      xsrfCookieName: handleBaseUrl,
      xsrfHeaderName: handleBaseUrl,
      onUploadProgress: handleBaseUrl,
      onDownloadProgress: handleBaseUrl,
      decompress: handleBaseUrl,
      maxContentLength: handleBaseUrl,
      maxBodyLength: handleBaseUrl,
      beforeRedirect: handleBaseUrl,
      transport: handleBaseUrl,
      httpAgent: handleBaseUrl,
      httpsAgent: handleBaseUrl,
      cancelToken: handleBaseUrl,
      socketPath: handleBaseUrl,
      responseEncoding: handleBaseUrl,
      validateStatus: requestMerger,
      headers: function (_headerHandler, arrayElementIndex) {
        return arrayElementIterator(convertHeaderValueToJSON(_headerHandler), convertHeaderValueToJSON(arrayElementIndex), !0);
      }
    };
    return responseUtilities.forEach(Object.keys(Object.assign({}, _headerHandler, arrayElementIndex)), function (combineHeaderOptions) {
      var maxIndex = cleanupTimeoutHandlers[combineHeaderOptions] || arrayElementIterator,
        handleBaseUrl = maxIndex(_headerHandler[combineHeaderOptions], arrayElementIndex[combineHeaderOptions], combineHeaderOptions);
      responseUtilities.isUndefined(handleBaseUrl) && maxIndex !== requestMerger || (urlElement[combineHeaderOptions] = handleBaseUrl);
    }), urlElement;
  }
  var axiosVersionString = "1.6.0",
    typeValidators = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(function (arrayElementIndex, urlElement) {
    typeValidators[arrayElementIndex] = function (combineHeaderOptions) {
      return _headerHandler(combineHeaderOptions) === arrayElementIndex || "a" + (urlElement < 1 ? "n " : " ") + arrayElementIndex;
    };
  });
  var transitionalConfig = {};
  typeValidators.transitional = function (_headerHandler, arrayElementIndex, urlElement) {
    function combineHeaderOptions(_headerHandler, arrayElementIndex) {
      return "[Axios v1.6.0] Transitional option '" + _headerHandler + "'" + arrayElementIndex + (urlElement ? ". " + urlElement : "");
    }
    return function (urlElement, arrayElementIterator, maxIndex) {
      if (!1 === _headerHandler) throw new HttpRequestError(combineHeaderOptions(arrayElementIterator, " has been removed" + (arrayElementIndex ? " in " + arrayElementIndex : "")), HttpRequestError.ERR_DEPRECATED);
      return arrayElementIndex && !transitionalConfig[arrayElementIterator] && (transitionalConfig[arrayElementIterator] = !0, console.warn(combineHeaderOptions(arrayElementIterator, " has been deprecated since v" + arrayElementIndex + " and will be removed in the near future"))), !_headerHandler || _headerHandler(urlElement, arrayElementIterator, maxIndex);
    };
  };
  var optionsValidatorObject = {
      assertOptions: function (arrayElementIndex, urlElement, combineHeaderOptions) {
        if ("object" !== _headerHandler(arrayElementIndex)) throw new HttpRequestError("options must be an object", HttpRequestError.ERR_BAD_OPTION_VALUE);
        for (var arrayElementIterator = Object.keys(arrayElementIndex), maxIndex = arrayElementIterator.length; maxIndex-- > 0;) {
          var handleBaseUrl = arrayElementIterator[maxIndex],
            requestMerger = urlElement[handleBaseUrl];
          if (requestMerger) {
            var cleanupTimeoutHandlers = arrayElementIndex[handleBaseUrl],
              httpRequest = void 0 === cleanupTimeoutHandlers || requestMerger(cleanupTimeoutHandlers, handleBaseUrl, arrayElementIndex);
            if (!0 !== httpRequest) throw new HttpRequestError("option " + handleBaseUrl + " must be " + httpRequest, HttpRequestError.ERR_BAD_OPTION_VALUE);
          } else if (!0 !== combineHeaderOptions) throw new HttpRequestError("Unknown option " + handleBaseUrl, HttpRequestError.ERR_BAD_OPTION);
        }
      },
      validators: typeValidators
    },
    _optionsValidator = optionsValidatorObject.validators,
    initializeInterceptor = function () {
      function _headerHandler(urlElement) {
        arrayElementIndex(this, _headerHandler), this.defaults = urlElement, this.interceptors = {
          request: new createHeaderHandler(),
          response: new createHeaderHandler()
        };
      }
      return combineHeaderOptions(_headerHandler, [{
        key: "request",
        value: function (_headerHandler, arrayElementIndex) {
          "string" == typeof _headerHandler ? (arrayElementIndex = arrayElementIndex || {}).url = _headerHandler : arrayElementIndex = _headerHandler || {};
          var urlElement = arrayElementIndex = mergeRequestHeaders(this.defaults, arrayElementIndex),
            combineHeaderOptions = urlElement.transitional,
            arrayElementIterator = urlElement.paramsSerializer,
            maxIndex = urlElement.headers;
          void 0 !== combineHeaderOptions && optionsValidatorObject.assertOptions(combineHeaderOptions, {
            silentJSONParsing: _optionsValidator.transitional(_optionsValidator.boolean),
            forcedJSONParsing: _optionsValidator.transitional(_optionsValidator.boolean),
            clarifyTimeoutError: _optionsValidator.transitional(_optionsValidator.boolean)
          }, !1), null != arrayElementIterator && (responseUtilities.isFunction(arrayElementIterator) ? arrayElementIndex.paramsSerializer = {
            serialize: arrayElementIterator
          } : optionsValidatorObject.assertOptions(arrayElementIterator, {
            encode: _optionsValidator.function,
            serialize: _optionsValidator.function
          }, !0)), arrayElementIndex.method = (arrayElementIndex.method || this.defaults.method || "get").toLowerCase();
          var handleBaseUrl = maxIndex && responseUtilities.merge(maxIndex.common, maxIndex[arrayElementIndex.method]);
          maxIndex && responseUtilities.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (_headerHandler) {
            delete maxIndex[_headerHandler];
          }), arrayElementIndex.headers = __headerHandler.concat(handleBaseUrl, maxIndex);
          var requestMerger = [],
            cleanupTimeoutHandlers = !0;
          this.interceptors.request.forEach(function (_headerHandler) {
            "function" == typeof _headerHandler.runWhen && !1 === _headerHandler.runWhen(arrayElementIndex) || (cleanupTimeoutHandlers = cleanupTimeoutHandlers && _headerHandler.synchronous, requestMerger.unshift(_headerHandler.fulfilled, _headerHandler.rejected));
          });
          var httpRequest,
            handleInputData = [];
          this.interceptors.response.forEach(function (_headerHandler) {
            handleInputData.push(_headerHandler.fulfilled, _headerHandler.rejected);
          });
          var isArrayBufferTypeCheck,
            currentInterceptorPosition = 0;
          if (!cleanupTimeoutHandlers) {
            var processResponseHeaders = [handleRequestProcessing.bind(this), void 0];
            for (processResponseHeaders.unshift.apply(processResponseHeaders, requestMerger), processResponseHeaders.push.apply(processResponseHeaders, handleInputData), isArrayBufferTypeCheck = processResponseHeaders.length, httpRequest = Promise.resolve(arrayElementIndex); currentInterceptorPosition < isArrayBufferTypeCheck;) httpRequest = httpRequest.then(processResponseHeaders[currentInterceptorPosition++], processResponseHeaders[currentInterceptorPosition++]);
            return httpRequest;
          }
          isArrayBufferTypeCheck = requestMerger.length;
          var checkIfInterceptorIsDefined = arrayElementIndex;
          for (currentInterceptorPosition = 0; currentInterceptorPosition < isArrayBufferTypeCheck;) {
            var _isArrayBufferTypeCheck = requestMerger[currentInterceptorPosition++],
              urlProtocolScheme = requestMerger[currentInterceptorPosition++];
            try {
              checkIfInterceptorIsDefined = _isArrayBufferTypeCheck(checkIfInterceptorIsDefined);
            } catch (_headerHandler) {
              urlProtocolScheme.call(this, _headerHandler);
              break;
            }
          }
          try {
            httpRequest = handleRequestProcessing.call(this, checkIfInterceptorIsDefined);
          } catch (_headerHandler) {
            return Promise.reject(_headerHandler);
          }
          for (currentInterceptorPosition = 0, isArrayBufferTypeCheck = handleInputData.length; currentInterceptorPosition < isArrayBufferTypeCheck;) httpRequest = httpRequest.then(handleInputData[currentInterceptorPosition++], handleInputData[currentInterceptorPosition++]);
          return httpRequest;
        }
      }, {
        key: "getUri",
        value: function (_headerHandler) {
          return mergeQueryParameters(joinUrlPathSegments((_headerHandler = mergeRequestHeaders(this.defaults, _headerHandler)).baseURL, _headerHandler.url), _headerHandler.params, _headerHandler.paramsSerializer);
        }
      }]), _headerHandler;
    }();
  responseUtilities.forEach(["delete", "get", "head", "options"], function (_headerHandler) {
    initializeInterceptor.prototype[_headerHandler] = function (arrayElementIndex, urlElement) {
      return this.request(mergeRequestHeaders(urlElement || {}, {
        method: _headerHandler,
        url: arrayElementIndex,
        data: (urlElement || {}).data
      }));
    };
  }), responseUtilities.forEach(["post", "put", "patch"], function (_headerHandler) {
    function arrayElementIndex(arrayElementIndex) {
      return function (urlElement, combineHeaderOptions, arrayElementIterator) {
        return this.request(mergeRequestHeaders(arrayElementIterator || {}, {
          method: _headerHandler,
          headers: arrayElementIndex ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: urlElement,
          data: combineHeaderOptions
        }));
      };
    }
    initializeInterceptor.prototype[_headerHandler] = arrayElementIndex(), initializeInterceptor.prototype[_headerHandler + "Form"] = arrayElementIndex(!0);
  });
  var HttpInterceptor = initializeInterceptor,
    executorFunctionHandler = function () {
      function _headerHandler(urlElement) {
        if (arrayElementIndex(this, _headerHandler), "function" != typeof urlElement) throw new TypeError("executor must be a function.");
        var combineHeaderOptions;
        this.promise = new Promise(function (_headerHandler) {
          combineHeaderOptions = _headerHandler;
        });
        var arrayElementIterator = this;
        this.promise.then(function (_headerHandler) {
          if (arrayElementIterator._listeners) {
            for (var arrayElementIndex = arrayElementIterator._listeners.length; arrayElementIndex-- > 0;) arrayElementIterator._listeners[arrayElementIndex](_headerHandler);
            arrayElementIterator._listeners = null;
          }
        }), this.promise.then = function (_headerHandler) {
          var arrayElementIndex,
            urlElement = new Promise(function (_headerHandler) {
              arrayElementIterator.subscribe(_headerHandler), arrayElementIndex = _headerHandler;
            }).then(_headerHandler);
          return urlElement.cancel = function () {
            arrayElementIterator.unsubscribe(arrayElementIndex);
          }, urlElement;
        }, urlElement(function (_headerHandler, arrayElementIndex, urlElement) {
          arrayElementIterator.reason || (arrayElementIterator.reason = new CancellationError(_headerHandler, arrayElementIndex, urlElement), combineHeaderOptions(arrayElementIterator.reason));
        });
      }
      return combineHeaderOptions(_headerHandler, [{
        key: "throwIfRequested",
        value: function () {
          if (this.reason) throw this.reason;
        }
      }, {
        key: "subscribe",
        value: function (_headerHandler) {
          this.reason ? _headerHandler(this.reason) : this._listeners ? this._listeners.push(_headerHandler) : this._listeners = [_headerHandler];
        }
      }, {
        key: "unsubscribe",
        value: function (_headerHandler) {
          if (this._listeners) {
            var arrayElementIndex = this._listeners.indexOf(_headerHandler);
            -1 !== arrayElementIndex && this._listeners.splice(arrayElementIndex, 1);
          }
        }
      }], [{
        key: "source",
        value: function () {
          var arrayElementIndex;
          return {
            token: new _headerHandler(function (_headerHandler) {
              arrayElementIndex = _headerHandler;
            }),
            cancel: arrayElementIndex
          };
        }
      }]), _headerHandler;
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
  Object.entries(HttpStatus).forEach(function (_headerHandler) {
    var arrayElementIndex = arrayElementIterator(_headerHandler, 2),
      urlElement = arrayElementIndex[0],
      combineHeaderOptions = arrayElementIndex[1];
    HttpStatus[combineHeaderOptions] = urlElement;
  });
  var httpStatusMapping = HttpStatus;
  var initializeHttpClient = function _headerHandler(arrayElementIndex) {
    var urlElement = new HttpInterceptor(arrayElementIndex),
      combineHeaderOptions = handleBaseUrl(HttpInterceptor.prototype.request, urlElement);
    return responseUtilities.extend(combineHeaderOptions, HttpInterceptor.prototype, urlElement, {
      allOwnKeys: !0
    }), responseUtilities.extend(combineHeaderOptions, urlElement, null, {
      allOwnKeys: !0
    }), combineHeaderOptions.create = function (urlElement) {
      return _headerHandler(mergeRequestHeaders(arrayElementIndex, urlElement));
    }, combineHeaderOptions;
  }(formDataRequestConfig);
  return initializeHttpClient.Axios = HttpInterceptor, initializeHttpClient.CanceledError = CancellationError, initializeHttpClient.CancelToken = executorFunctionHandler, initializeHttpClient.isCancel = isErrorCanceled, initializeHttpClient.VERSION = axiosVersionString, initializeHttpClient.toFormData = combineFormData, initializeHttpClient.AxiosError = HttpRequestError, initializeHttpClient.Cancel = initializeHttpClient.CanceledError, initializeHttpClient.all = function (_headerHandler) {
    return Promise.all(_headerHandler);
  }, initializeHttpClient.spread = function (_headerHandler) {
    return function (arrayElementIndex) {
      return _headerHandler.apply(null, arrayElementIndex);
    };
  }, initializeHttpClient.isAxiosError = function (_headerHandler) {
    return responseUtilities.isObject(_headerHandler) && !0 === _headerHandler.isAxiosError;
  }, initializeHttpClient.mergeConfig = mergeRequestHeaders, initializeHttpClient.AxiosHeaders = __headerHandler, initializeHttpClient.formToJSON = function (_headerHandler) {
    return processHeaderValue(responseUtilities.isHTMLForm(_headerHandler) ? new FormData(_headerHandler) : _headerHandler);
  }, initializeHttpClient.getAdapter = retrieveAdapter, initializeHttpClient.HttpStatusCode = httpStatusMapping, initializeHttpClient.default = initializeHttpClient, initializeHttpClient;
});