!function (UserAgentContext, arrayElementIndex) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = arrayElementIndex() : "function" == typeof define && define.amd ? define(arrayElementIndex) : (UserAgentContext = "undefined" != typeof globalThis ? globalThis : UserAgentContext || self).axios = arrayElementIndex();
}(this, function () {
  "use strict";

  function UserAgentContext(arrayElementIndex) {
    return UserAgentContext = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (UserAgentContext) {
      return typeof UserAgentContext;
    } : function (UserAgentContext) {
      return UserAgentContext && "function" == typeof Symbol && UserAgentContext.constructor === Symbol && UserAgentContext !== Symbol.prototype ? "symbol" : typeof UserAgentContext;
    }, UserAgentContext(arrayElementIndex);
  }
  function arrayElementIndex(UserAgentContext, arrayElementIndex) {
    if (!(UserAgentContext instanceof arrayElementIndex)) throw new TypeError("Cannot call a class as a function");
  }
  function userAgentString(UserAgentContext, arrayElementIndex) {
    for (var userAgentString = 0; userAgentString < arrayElementIndex.length; userAgentString++) {
      var combineConfigurations = arrayElementIndex[userAgentString];
      combineConfigurations.enumerable = combineConfigurations.enumerable || !1, combineConfigurations.configurable = !0, "value" in combineConfigurations && (combineConfigurations.writable = !0), Object.defineProperty(UserAgentContext, combineConfigurations.key, combineConfigurations);
    }
  }
  function combineConfigurations(UserAgentContext, arrayElementIndex, combineConfigurations) {
    return arrayElementIndex && userAgentString(UserAgentContext.prototype, arrayElementIndex), combineConfigurations && userAgentString(UserAgentContext, combineConfigurations), Object.defineProperty(UserAgentContext, "prototype", {
      writable: !1
    }), UserAgentContext;
  }
  function combineWithDefaults(UserAgentContext, arrayElementIndex) {
    return function (UserAgentContext) {
      if (Array.isArray(UserAgentContext)) return UserAgentContext;
    }(UserAgentContext) || function (UserAgentContext, arrayElementIndex) {
      var userAgentString = null == UserAgentContext ? null : "undefined" != typeof Symbol && UserAgentContext[Symbol.iterator] || UserAgentContext["@@iterator"];
      if (null == userAgentString) return;
      var combineConfigurations,
        combineWithDefaults,
        extractArraySlice = [],
        baseURLResolver = !0,
        requestMerger = !1;
      try {
        for (userAgentString = userAgentString.call(UserAgentContext); !(baseURLResolver = (combineConfigurations = userAgentString.next()).done) && (extractArraySlice.push(combineConfigurations.value), !arrayElementIndex || extractArraySlice.length !== arrayElementIndex); baseURLResolver = !0);
      } catch (UserAgentContext) {
        requestMerger = !0, combineWithDefaults = UserAgentContext;
      } finally {
        try {
          baseURLResolver || null == userAgentString.return || userAgentString.return();
        } finally {
          if (requestMerger) throw combineWithDefaults;
        }
      }
      return extractArraySlice;
    }(UserAgentContext, arrayElementIndex) || function (UserAgentContext, arrayElementIndex) {
      if (!UserAgentContext) return;
      if ("string" == typeof UserAgentContext) return extractArraySlice(UserAgentContext, arrayElementIndex);
      var userAgentString = Object.prototype.toString.call(UserAgentContext).slice(8, -1);
      "Object" === userAgentString && UserAgentContext.constructor && (userAgentString = UserAgentContext.constructor.name);
      if ("Map" === userAgentString || "Set" === userAgentString) return Array.from(UserAgentContext);
      if ("Arguments" === userAgentString || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(userAgentString)) return extractArraySlice(UserAgentContext, arrayElementIndex);
    }(UserAgentContext, arrayElementIndex) || function () {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }();
  }
  function extractArraySlice(UserAgentContext, arrayElementIndex) {
    (null == arrayElementIndex || arrayElementIndex > UserAgentContext.length) && (arrayElementIndex = UserAgentContext.length);
    for (var userAgentString = 0, combineConfigurations = new Array(arrayElementIndex); userAgentString < arrayElementIndex; userAgentString++) combineConfigurations[userAgentString] = UserAgentContext[userAgentString];
    return combineConfigurations;
  }
  function baseURLResolver(UserAgentContext, arrayElementIndex) {
    return function () {
      return UserAgentContext.apply(arrayElementIndex, arguments);
    };
  }
  var requestMerger,
    cleanupAbortHandlers = Object.prototype.toString,
    httpRequest = Object.getPrototypeOf,
    processInputData = (requestMerger = Object.create(null), function (UserAgentContext) {
      var arrayElementIndex = cleanupAbortHandlers.call(UserAgentContext);
      return requestMerger[arrayElementIndex] || (requestMerger[arrayElementIndex] = arrayElementIndex.slice(8, -1).toLowerCase());
    }),
    isMatchingArrayBufferType = function (UserAgentContext) {
      return UserAgentContext = UserAgentContext.toLowerCase(), function (arrayElementIndex) {
        return processInputData(arrayElementIndex) === UserAgentContext;
      };
    },
    currentInterceptorPosition = function (arrayElementIndex) {
      return function (userAgentString) {
        return UserAgentContext(userAgentString) === arrayElementIndex;
      };
    },
    processResponseHeaders = Array.isArray,
    isUndefinedInterceptor = currentInterceptorPosition("undefined");
  var isArrayBufferTypeCheck = isMatchingArrayBufferType("ArrayBuffer");
  var urlProtocol = currentInterceptorPosition("string"),
    isFunctionType = currentInterceptorPosition("function"),
    isNumberType = currentInterceptorPosition("number"),
    isObjectAndNotNull = function (arrayElementIndex) {
      return null !== arrayElementIndex && "object" === UserAgentContext(arrayElementIndex);
    },
    isObjectLiteral = function (UserAgentContext) {
      if ("object" !== processInputData(UserAgentContext)) return !1;
      var arrayElementIndex = httpRequest(UserAgentContext);
      return !(null !== arrayElementIndex && arrayElementIndex !== Object.prototype && null !== Object.getPrototypeOf(arrayElementIndex) || Symbol.toStringTag in UserAgentContext || Symbol.iterator in UserAgentContext);
    },
    isDateType = isMatchingArrayBufferType("Date"),
    fileArrayBufferType = isMatchingArrayBufferType("File"),
    BlobTypeChecker = isMatchingArrayBufferType("Blob"),
    fileListTypeCheck = isMatchingArrayBufferType("FileList"),
    URLSearchParamsType = isMatchingArrayBufferType("URLSearchParams");
  function processElement(arrayElementIndex, userAgentString) {
    var combineConfigurations,
      combineWithDefaults,
      extractArraySlice = (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}).allOwnKeys,
      baseURLResolver = void 0 !== extractArraySlice && extractArraySlice;
    if (null != arrayElementIndex) if ("object" !== UserAgentContext(arrayElementIndex) && (arrayElementIndex = [arrayElementIndex]), processResponseHeaders(arrayElementIndex)) for (combineConfigurations = 0, combineWithDefaults = arrayElementIndex.length; combineConfigurations < combineWithDefaults; combineConfigurations++) userAgentString.call(null, arrayElementIndex[combineConfigurations], combineConfigurations, arrayElementIndex);else {
      var requestMerger,
        cleanupAbortHandlers = baseURLResolver ? Object.getOwnPropertyNames(arrayElementIndex) : Object.keys(arrayElementIndex),
        httpRequest = cleanupAbortHandlers.length;
      for (combineConfigurations = 0; combineConfigurations < httpRequest; combineConfigurations++) requestMerger = cleanupAbortHandlers[combineConfigurations], userAgentString.call(null, arrayElementIndex[requestMerger], requestMerger, arrayElementIndex);
    }
  }
  function getKeyByValueIgnoringCase(UserAgentContext, arrayElementIndex) {
    arrayElementIndex = arrayElementIndex.toLowerCase();
    for (var userAgentString, combineConfigurations = Object.keys(UserAgentContext), combineWithDefaults = combineConfigurations.length; combineWithDefaults-- > 0;) if (arrayElementIndex === (userAgentString = combineConfigurations[combineWithDefaults]).toLowerCase()) return userAgentString;
    return null;
  }
  var globalObject = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global,
    isNotGlobalScope = function (UserAgentContext) {
      return !isUndefinedInterceptor(UserAgentContext) && UserAgentContext !== globalObject;
    };
  var isUint8ArrayAvailable,
    isInstanceOfUint8Array = (isUint8ArrayAvailable = "undefined" != typeof Uint8Array && httpRequest(Uint8Array), function (UserAgentContext) {
      return isUint8ArrayAvailable && UserAgentContext instanceof isUint8ArrayAvailable;
    }),
    htmlFormElementType = isMatchingArrayBufferType("HTMLFormElement"),
    hasOwnPropertyChecker = function () {
      var UserAgentContext = Object.prototype.hasOwnProperty;
      return function (arrayElementIndex, userAgentString) {
        return UserAgentContext.call(arrayElementIndex, userAgentString);
      };
    }(),
    isRegExpType = isMatchingArrayBufferType("RegExp"),
    applyPropertyTransformations = function (UserAgentContext, arrayElementIndex) {
      var userAgentString = Object.getOwnPropertyDescriptors(UserAgentContext),
        combineConfigurations = {};
      processElement(userAgentString, function (userAgentString, combineWithDefaults) {
        var extractArraySlice;
        !1 !== (extractArraySlice = arrayElementIndex(userAgentString, combineWithDefaults, UserAgentContext)) && (combineConfigurations[combineWithDefaults] = extractArraySlice || userAgentString);
      }), Object.defineProperties(UserAgentContext, combineConfigurations);
    },
    lowercaseAlphabetString = "abcdefghijklmnopqrstuvwxyz",
    DIGIT_CHARACTERS = "0123456789",
    CharacterTypeCategories = {
      DIGIT: DIGIT_CHARACTERS,
      ALPHA: lowercaseAlphabetString,
      ALPHA_DIGIT: lowercaseAlphabetString + lowercaseAlphabetString.toUpperCase() + DIGIT_CHARACTERS
    };
  var isAsyncFunctionType = isMatchingArrayBufferType("AsyncFunction"),
    responseUtilities = {
      isArray: processResponseHeaders,
      isArrayBuffer: isArrayBufferTypeCheck,
      isBuffer: function (UserAgentContext) {
        return null !== UserAgentContext && !isUndefinedInterceptor(UserAgentContext) && null !== UserAgentContext.constructor && !isUndefinedInterceptor(UserAgentContext.constructor) && isFunctionType(UserAgentContext.constructor.isBuffer) && UserAgentContext.constructor.isBuffer(UserAgentContext);
      },
      isFormData: function (UserAgentContext) {
        var arrayElementIndex;
        return UserAgentContext && ("function" == typeof FormData && UserAgentContext instanceof FormData || isFunctionType(UserAgentContext.append) && ("formdata" === (arrayElementIndex = processInputData(UserAgentContext)) || "object" === arrayElementIndex && isFunctionType(UserAgentContext.toString) && "[object FormData]" === UserAgentContext.toString()));
      },
      isArrayBufferView: function (UserAgentContext) {
        return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(UserAgentContext) : UserAgentContext && UserAgentContext.buffer && isArrayBufferTypeCheck(UserAgentContext.buffer);
      },
      isString: urlProtocol,
      isNumber: isNumberType,
      isBoolean: function (UserAgentContext) {
        return !0 === UserAgentContext || !1 === UserAgentContext;
      },
      isObject: isObjectAndNotNull,
      isPlainObject: isObjectLiteral,
      isUndefined: isUndefinedInterceptor,
      isDate: isDateType,
      isFile: fileArrayBufferType,
      isBlob: BlobTypeChecker,
      isRegExp: isRegExpType,
      isFunction: isFunctionType,
      isStream: function (UserAgentContext) {
        return isObjectAndNotNull(UserAgentContext) && isFunctionType(UserAgentContext.pipe);
      },
      isURLSearchParams: URLSearchParamsType,
      isTypedArray: isInstanceOfUint8Array,
      isFileList: fileListTypeCheck,
      forEach: processElement,
      merge: function UserAgentContext() {
        for (var arrayElementIndex = (isNotGlobalScope(this) && this || {}).caseless, userAgentString = {}, combineConfigurations = function (combineConfigurations, combineWithDefaults) {
            var extractArraySlice = arrayElementIndex && getKeyByValueIgnoringCase(userAgentString, combineWithDefaults) || combineWithDefaults;
            isObjectLiteral(userAgentString[extractArraySlice]) && isObjectLiteral(combineConfigurations) ? userAgentString[extractArraySlice] = UserAgentContext(userAgentString[extractArraySlice], combineConfigurations) : isObjectLiteral(combineConfigurations) ? userAgentString[extractArraySlice] = UserAgentContext({}, combineConfigurations) : processResponseHeaders(combineConfigurations) ? userAgentString[extractArraySlice] = combineConfigurations.slice() : userAgentString[extractArraySlice] = combineConfigurations;
          }, combineWithDefaults = 0, extractArraySlice = arguments.length; combineWithDefaults < extractArraySlice; combineWithDefaults++) arguments[combineWithDefaults] && processElement(arguments[combineWithDefaults], combineConfigurations);
        return userAgentString;
      },
      extend: function (UserAgentContext, arrayElementIndex, userAgentString) {
        return processElement(arrayElementIndex, function (arrayElementIndex, combineConfigurations) {
          userAgentString && isFunctionType(arrayElementIndex) ? UserAgentContext[combineConfigurations] = baseURLResolver(arrayElementIndex, userAgentString) : UserAgentContext[combineConfigurations] = arrayElementIndex;
        }, {
          allOwnKeys: (arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}).allOwnKeys
        }), UserAgentContext;
      },
      trim: function (UserAgentContext) {
        return UserAgentContext.trim ? UserAgentContext.trim() : UserAgentContext.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
      },
      stripBOM: function (UserAgentContext) {
        return 65279 === UserAgentContext.charCodeAt(0) && (UserAgentContext = UserAgentContext.slice(1)), UserAgentContext;
      },
      inherits: function (UserAgentContext, arrayElementIndex, userAgentString, combineConfigurations) {
        UserAgentContext.prototype = Object.create(arrayElementIndex.prototype, combineConfigurations), UserAgentContext.prototype.constructor = UserAgentContext, Object.defineProperty(UserAgentContext, "super", {
          value: arrayElementIndex.prototype
        }), userAgentString && Object.assign(UserAgentContext.prototype, userAgentString);
      },
      toFlatObject: function (UserAgentContext, arrayElementIndex, userAgentString, combineConfigurations) {
        var combineWithDefaults,
          extractArraySlice,
          baseURLResolver,
          requestMerger = {};
        if (arrayElementIndex = arrayElementIndex || {}, null == UserAgentContext) return arrayElementIndex;
        do {
          for (extractArraySlice = (combineWithDefaults = Object.getOwnPropertyNames(UserAgentContext)).length; extractArraySlice-- > 0;) baseURLResolver = combineWithDefaults[extractArraySlice], combineConfigurations && !combineConfigurations(baseURLResolver, UserAgentContext, arrayElementIndex) || requestMerger[baseURLResolver] || (arrayElementIndex[baseURLResolver] = UserAgentContext[baseURLResolver], requestMerger[baseURLResolver] = !0);
          UserAgentContext = !1 !== userAgentString && httpRequest(UserAgentContext);
        } while (UserAgentContext && (!userAgentString || userAgentString(UserAgentContext, arrayElementIndex)) && UserAgentContext !== Object.prototype);
        return arrayElementIndex;
      },
      kindOf: processInputData,
      kindOfTest: isMatchingArrayBufferType,
      endsWith: function (UserAgentContext, arrayElementIndex, userAgentString) {
        UserAgentContext = String(UserAgentContext), (void 0 === userAgentString || userAgentString > UserAgentContext.length) && (userAgentString = UserAgentContext.length), userAgentString -= arrayElementIndex.length;
        var combineConfigurations = UserAgentContext.indexOf(arrayElementIndex, userAgentString);
        return -1 !== combineConfigurations && combineConfigurations === userAgentString;
      },
      toArray: function (UserAgentContext) {
        if (!UserAgentContext) return null;
        if (processResponseHeaders(UserAgentContext)) return UserAgentContext;
        var arrayElementIndex = UserAgentContext.length;
        if (!isNumberType(arrayElementIndex)) return null;
        for (var userAgentString = new Array(arrayElementIndex); arrayElementIndex-- > 0;) userAgentString[arrayElementIndex] = UserAgentContext[arrayElementIndex];
        return userAgentString;
      },
      forEachEntry: function (UserAgentContext, arrayElementIndex) {
        for (var userAgentString, combineConfigurations = (UserAgentContext && UserAgentContext[Symbol.iterator]).call(UserAgentContext); (userAgentString = combineConfigurations.next()) && !userAgentString.done;) {
          var combineWithDefaults = userAgentString.value;
          arrayElementIndex.call(UserAgentContext, combineWithDefaults[0], combineWithDefaults[1]);
        }
      },
      matchAll: function (UserAgentContext, arrayElementIndex) {
        for (var userAgentString, combineConfigurations = []; null !== (userAgentString = UserAgentContext.exec(arrayElementIndex));) combineConfigurations.push(userAgentString);
        return combineConfigurations;
      },
      isHTMLForm: htmlFormElementType,
      hasOwnProperty: hasOwnPropertyChecker,
      hasOwnProp: hasOwnPropertyChecker,
      reduceDescriptors: applyPropertyTransformations,
      freezeMethods: function (UserAgentContext) {
        applyPropertyTransformations(UserAgentContext, function (arrayElementIndex, userAgentString) {
          if (isFunctionType(UserAgentContext) && -1 !== ["arguments", "caller", "callee"].indexOf(userAgentString)) return !1;
          var combineConfigurations = UserAgentContext[userAgentString];
          isFunctionType(combineConfigurations) && (arrayElementIndex.enumerable = !1, "writable" in arrayElementIndex ? arrayElementIndex.writable = !1 : arrayElementIndex.set || (arrayElementIndex.set = function () {
            throw Error("Can not rewrite read-only method '" + userAgentString + "'");
          }));
        });
      },
      toObjectSet: function (UserAgentContext, arrayElementIndex) {
        var userAgentString = {},
          combineConfigurations = function (UserAgentContext) {
            UserAgentContext.forEach(function (UserAgentContext) {
              userAgentString[UserAgentContext] = !0;
            });
          };
        return processResponseHeaders(UserAgentContext) ? combineConfigurations(UserAgentContext) : combineConfigurations(String(UserAgentContext).split(arrayElementIndex)), userAgentString;
      },
      toCamelCase: function (UserAgentContext) {
        return UserAgentContext.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (UserAgentContext, arrayElementIndex, userAgentString) {
          return arrayElementIndex.toUpperCase() + userAgentString;
        });
      },
      noop: function () {},
      toFiniteNumber: function (UserAgentContext, arrayElementIndex) {
        return UserAgentContext = +UserAgentContext, Number.isFinite(UserAgentContext) ? UserAgentContext : arrayElementIndex;
      },
      findKey: getKeyByValueIgnoringCase,
      global: globalObject,
      isContextDefined: isNotGlobalScope,
      ALPHABET: CharacterTypeCategories,
      generateString: function () {
        for (var UserAgentContext = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 16, arrayElementIndex = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : CharacterTypeCategories.ALPHA_DIGIT, userAgentString = "", combineConfigurations = arrayElementIndex.length; UserAgentContext--;) userAgentString += arrayElementIndex[Math.random() * combineConfigurations | 0];
        return userAgentString;
      },
      isSpecCompliantForm: function (UserAgentContext) {
        return !!(UserAgentContext && isFunctionType(UserAgentContext.append) && "FormData" === UserAgentContext[Symbol.toStringTag] && UserAgentContext[Symbol.iterator]);
      },
      toJSONObject: function (UserAgentContext) {
        var arrayElementIndex = new Array(10);
        return function UserAgentContext(userAgentString, combineConfigurations) {
          if (isObjectAndNotNull(userAgentString)) {
            if (arrayElementIndex.indexOf(userAgentString) >= 0) return;
            if (!("toJSON" in userAgentString)) {
              arrayElementIndex[combineConfigurations] = userAgentString;
              var combineWithDefaults = processResponseHeaders(userAgentString) ? [] : {};
              return processElement(userAgentString, function (arrayElementIndex, userAgentString) {
                var extractArraySlice = UserAgentContext(arrayElementIndex, combineConfigurations + 1);
                !isUndefinedInterceptor(extractArraySlice) && (combineWithDefaults[userAgentString] = extractArraySlice);
              }), arrayElementIndex[combineConfigurations] = void 0, combineWithDefaults;
            }
          }
          return userAgentString;
        }(UserAgentContext, 0);
      },
      isAsyncFn: isAsyncFunctionType,
      isThenable: function (UserAgentContext) {
        return UserAgentContext && (isObjectAndNotNull(UserAgentContext) || isFunctionType(UserAgentContext)) && isFunctionType(UserAgentContext.then) && isFunctionType(UserAgentContext.catch);
      }
    };
  function HttpError(UserAgentContext, arrayElementIndex, userAgentString, combineConfigurations, combineWithDefaults) {
    Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = UserAgentContext, this.name = "AxiosError", arrayElementIndex && (this.code = arrayElementIndex), userAgentString && (this.config = userAgentString), combineConfigurations && (this.request = combineConfigurations), combineWithDefaults && (this.response = combineWithDefaults);
  }
  responseUtilities.inherits(HttpError, Error, {
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
  var AxiosErrorCodes = HttpError.prototype,
    ErrorCodesMap = {};
  ["ERR_BAD_OPTION_VALUE", "ERR_BAD_OPTION", "ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK", "ERR_FR_TOO_MANY_REDIRECTS", "ERR_DEPRECATED", "ERR_BAD_RESPONSE", "ERR_BAD_REQUEST", "ERR_CANCELED", "ERR_NOT_SUPPORT", "ERR_INVALID_URL"].forEach(function (UserAgentContext) {
    ErrorCodesMap[UserAgentContext] = {
      value: UserAgentContext
    };
  }), Object.defineProperties(HttpError, ErrorCodesMap), Object.defineProperty(AxiosErrorCodes, "isAxiosError", {
    value: !0
  }), HttpError.from = function (UserAgentContext, arrayElementIndex, userAgentString, combineConfigurations, combineWithDefaults, extractArraySlice) {
    var baseURLResolver = Object.create(AxiosErrorCodes);
    return responseUtilities.toFlatObject(UserAgentContext, baseURLResolver, function (UserAgentContext) {
      return UserAgentContext !== Error.prototype;
    }, function (UserAgentContext) {
      return "isAxiosError" !== UserAgentContext;
    }), HttpError.call(baseURLResolver, UserAgentContext.message, arrayElementIndex, userAgentString, combineConfigurations, combineWithDefaults), baseURLResolver.cause = UserAgentContext, baseURLResolver.name = UserAgentContext.name, extractArraySlice && Object.assign(baseURLResolver, extractArraySlice), baseURLResolver;
  };
  function isPlainObjectOrArray(UserAgentContext) {
    return responseUtilities.isPlainObject(UserAgentContext) || responseUtilities.isArray(UserAgentContext);
  }
  function stripArraySuffix(UserAgentContext) {
    return responseUtilities.endsWith(UserAgentContext, "[]") ? UserAgentContext.slice(0, -2) : UserAgentContext;
  }
  function appendIndexToArray(UserAgentContext, arrayElementIndex, userAgentString) {
    return UserAgentContext ? UserAgentContext.concat(arrayElementIndex).map(function (UserAgentContext, arrayElementIndex) {
      return UserAgentContext = stripArraySuffix(UserAgentContext), !userAgentString && arrayElementIndex ? "[" + UserAgentContext + "]" : UserAgentContext;
    }).join(userAgentString ? "." : "") : arrayElementIndex;
  }
  var isObjectWithPlainProperties = responseUtilities.toFlatObject(responseUtilities, {}, null, function (UserAgentContext) {
    return /^is[A-Z]/.test(UserAgentContext);
  });
  function combineFormData(arrayElementIndex, userAgentString, combineConfigurations) {
    if (!responseUtilities.isObject(arrayElementIndex)) throw new TypeError("target must be an object");
    userAgentString = userAgentString || new FormData();
    var combineWithDefaults = (combineConfigurations = responseUtilities.toFlatObject(combineConfigurations, {
        metaTokens: !0,
        dots: !1,
        indexes: !1
      }, !1, function (UserAgentContext, arrayElementIndex) {
        return !responseUtilities.isUndefined(arrayElementIndex[UserAgentContext]);
      })).metaTokens,
      extractArraySlice = combineConfigurations.visitor || processInputData,
      baseURLResolver = combineConfigurations.dots,
      requestMerger = combineConfigurations.indexes,
      cleanupAbortHandlers = (combineConfigurations.Blob || "undefined" != typeof Blob && Blob) && responseUtilities.isSpecCompliantForm(userAgentString);
    if (!responseUtilities.isFunction(extractArraySlice)) throw new TypeError("visitor must be a function");
    function httpRequest(UserAgentContext) {
      if (null === UserAgentContext) return "";
      if (responseUtilities.isDate(UserAgentContext)) return UserAgentContext.toISOString();
      if (!cleanupAbortHandlers && responseUtilities.isBlob(UserAgentContext)) throw new HttpError("Blob is not supported. Use a Buffer instead.");
      return responseUtilities.isArrayBuffer(UserAgentContext) || responseUtilities.isTypedArray(UserAgentContext) ? cleanupAbortHandlers && "function" == typeof Blob ? new Blob([UserAgentContext]) : Buffer.from(UserAgentContext) : UserAgentContext;
    }
    function processInputData(arrayElementIndex, combineConfigurations, extractArraySlice) {
      var cleanupAbortHandlers = arrayElementIndex;
      if (arrayElementIndex && !extractArraySlice && "object" === UserAgentContext(arrayElementIndex)) if (responseUtilities.endsWith(combineConfigurations, "{}")) combineConfigurations = combineWithDefaults ? combineConfigurations : combineConfigurations.slice(0, -2), arrayElementIndex = JSON.stringify(arrayElementIndex);else if (responseUtilities.isArray(arrayElementIndex) && function (UserAgentContext) {
        return responseUtilities.isArray(UserAgentContext) && !UserAgentContext.some(isPlainObjectOrArray);
      }(arrayElementIndex) || (responseUtilities.isFileList(arrayElementIndex) || responseUtilities.endsWith(combineConfigurations, "[]")) && (cleanupAbortHandlers = responseUtilities.toArray(arrayElementIndex))) return combineConfigurations = stripArraySuffix(combineConfigurations), cleanupAbortHandlers.forEach(function (UserAgentContext, arrayElementIndex) {
        !responseUtilities.isUndefined(UserAgentContext) && null !== UserAgentContext && userAgentString.append(!0 === requestMerger ? appendIndexToArray([combineConfigurations], arrayElementIndex, baseURLResolver) : null === requestMerger ? combineConfigurations : combineConfigurations + "[]", httpRequest(UserAgentContext));
      }), !1;
      return !!isPlainObjectOrArray(arrayElementIndex) || (userAgentString.append(appendIndexToArray(extractArraySlice, combineConfigurations, baseURLResolver), httpRequest(arrayElementIndex)), !1);
    }
    var isMatchingArrayBufferType = [],
      currentInterceptorPosition = Object.assign(isObjectWithPlainProperties, {
        defaultVisitor: processInputData,
        convertValue: httpRequest,
        isVisitable: isPlainObjectOrArray
      });
    if (!responseUtilities.isObject(arrayElementIndex)) throw new TypeError("data must be an object");
    return function UserAgentContext(arrayElementIndex, combineConfigurations) {
      if (!responseUtilities.isUndefined(arrayElementIndex)) {
        if (-1 !== isMatchingArrayBufferType.indexOf(arrayElementIndex)) throw Error("Circular reference detected in " + combineConfigurations.join("."));
        isMatchingArrayBufferType.push(arrayElementIndex), responseUtilities.forEach(arrayElementIndex, function (arrayElementIndex, combineWithDefaults) {
          !0 === (!(responseUtilities.isUndefined(arrayElementIndex) || null === arrayElementIndex) && extractArraySlice.call(userAgentString, arrayElementIndex, responseUtilities.isString(combineWithDefaults) ? combineWithDefaults.trim() : combineWithDefaults, combineConfigurations, currentInterceptorPosition)) && UserAgentContext(arrayElementIndex, combineConfigurations ? combineConfigurations.concat(combineWithDefaults) : [combineWithDefaults]);
        }), isMatchingArrayBufferType.pop();
      }
    }(arrayElementIndex), userAgentString;
  }
  function customURLEncoder(UserAgentContext) {
    var arrayElementIndex = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0"
    };
    return encodeURIComponent(UserAgentContext).replace(/[!'()~]|%20|%00/g, function (UserAgentContext) {
      return arrayElementIndex[UserAgentContext];
    });
  }
  function KeyValuePairMapper(UserAgentContext, arrayElementIndex) {
    this._pairs = [], UserAgentContext && combineFormData(UserAgentContext, this, arrayElementIndex);
  }
  var KeyValuePairPrototype = KeyValuePairMapper.prototype;
  function encodeURIComponentWithCustomMappings(UserAgentContext) {
    return encodeURIComponent(UserAgentContext).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  function mergeQueryParameters(UserAgentContext, arrayElementIndex, userAgentString) {
    if (!arrayElementIndex) return UserAgentContext;
    var combineConfigurations,
      combineWithDefaults = userAgentString && userAgentString.encode || encodeURIComponentWithCustomMappings,
      extractArraySlice = userAgentString && userAgentString.serialize;
    if (combineConfigurations = extractArraySlice ? extractArraySlice(arrayElementIndex, userAgentString) : responseUtilities.isURLSearchParams(arrayElementIndex) ? arrayElementIndex.toString() : new KeyValuePairMapper(arrayElementIndex, userAgentString).toString(combineWithDefaults)) {
      var baseURLResolver = UserAgentContext.indexOf("#");
      -1 !== baseURLResolver && (UserAgentContext = UserAgentContext.slice(0, baseURLResolver)), UserAgentContext += (-1 === UserAgentContext.indexOf("?") ? "?" : "&") + combineConfigurations;
    }
    return UserAgentContext;
  }
  KeyValuePairPrototype.append = function (UserAgentContext, arrayElementIndex) {
    this._pairs.push([UserAgentContext, arrayElementIndex]);
  }, KeyValuePairPrototype.toString = function (UserAgentContext) {
    var arrayElementIndex = UserAgentContext ? function (arrayElementIndex) {
      return UserAgentContext.call(this, arrayElementIndex, customURLEncoder);
    } : customURLEncoder;
    return this._pairs.map(function (UserAgentContext) {
      return arrayElementIndex(UserAgentContext[0]) + "=" + arrayElementIndex(UserAgentContext[1]);
    }, "").join("&");
  };
  var eventHandler,
    createEventHandler = function () {
      function UserAgentContext() {
        arrayElementIndex(this, UserAgentContext), this.handlers = [];
      }
      return combineConfigurations(UserAgentContext, [{
        key: "use",
        value: function (UserAgentContext, arrayElementIndex, userAgentString) {
          return this.handlers.push({
            fulfilled: UserAgentContext,
            rejected: arrayElementIndex,
            synchronous: !!userAgentString && userAgentString.synchronous,
            runWhen: userAgentString ? userAgentString.runWhen : null
          }), this.handlers.length - 1;
        }
      }, {
        key: "eject",
        value: function (UserAgentContext) {
          this.handlers[UserAgentContext] && (this.handlers[UserAgentContext] = null);
        }
      }, {
        key: "clear",
        value: function () {
          this.handlers && (this.handlers = []);
        }
      }, {
        key: "forEach",
        value: function (UserAgentContext) {
          responseUtilities.forEach(this.handlers, function (arrayElementIndex) {
            null !== arrayElementIndex && UserAgentContext(arrayElementIndex);
          });
        }
      }]), UserAgentContext;
    }(),
    jsonParsingConfig = {
      silentJSONParsing: !0,
      forcedJSONParsing: !0,
      clarifyTimeoutError: !1
    },
    environmentCapabilities = {
      isBrowser: !0,
      classes: {
        URLSearchParams: "undefined" != typeof URLSearchParams ? URLSearchParams : KeyValuePairMapper,
        FormData: "undefined" != typeof FormData ? FormData : null,
        Blob: "undefined" != typeof Blob ? Blob : null
      },
      isStandardBrowserEnv: ("undefined" == typeof navigator || "ReactNative" !== (eventHandler = navigator.product) && "NativeScript" !== eventHandler && "NS" !== eventHandler) && "undefined" != typeof window && "undefined" != typeof document,
      isStandardBrowserWebWorkerEnv: "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && "function" == typeof self.importScripts,
      protocols: ["http", "https", "file", "blob", "url", "data"]
    };
  function processElementInArray(UserAgentContext) {
    function arrayElementIndex(UserAgentContext, userAgentString, combineConfigurations, combineWithDefaults) {
      var extractArraySlice = UserAgentContext[combineWithDefaults++],
        baseURLResolver = Number.isFinite(+extractArraySlice),
        requestMerger = combineWithDefaults >= UserAgentContext.length;
      return extractArraySlice = !extractArraySlice && responseUtilities.isArray(combineConfigurations) ? combineConfigurations.length : extractArraySlice, requestMerger ? (responseUtilities.hasOwnProp(combineConfigurations, extractArraySlice) ? combineConfigurations[extractArraySlice] = [combineConfigurations[extractArraySlice], userAgentString] : combineConfigurations[extractArraySlice] = userAgentString, !baseURLResolver) : (combineConfigurations[extractArraySlice] && responseUtilities.isObject(combineConfigurations[extractArraySlice]) || (combineConfigurations[extractArraySlice] = []), arrayElementIndex(UserAgentContext, userAgentString, combineConfigurations[extractArraySlice], combineWithDefaults) && responseUtilities.isArray(combineConfigurations[extractArraySlice]) && (combineConfigurations[extractArraySlice] = function (UserAgentContext) {
        var arrayElementIndex,
          userAgentString,
          combineConfigurations = {},
          combineWithDefaults = Object.keys(UserAgentContext),
          extractArraySlice = combineWithDefaults.length;
        for (arrayElementIndex = 0; arrayElementIndex < extractArraySlice; arrayElementIndex++) combineConfigurations[userAgentString = combineWithDefaults[arrayElementIndex]] = UserAgentContext[userAgentString];
        return combineConfigurations;
      }(combineConfigurations[extractArraySlice])), !baseURLResolver);
    }
    if (responseUtilities.isFormData(UserAgentContext) && responseUtilities.isFunction(UserAgentContext.entries)) {
      var userAgentString = {};
      return responseUtilities.forEachEntry(UserAgentContext, function (UserAgentContext, combineConfigurations) {
        arrayElementIndex(function (UserAgentContext) {
          return responseUtilities.matchAll(/\w+|\[(\w*)]/g, UserAgentContext).map(function (UserAgentContext) {
            return "[]" === UserAgentContext[0] ? "" : UserAgentContext[1] || UserAgentContext[0];
          });
        }(UserAgentContext), combineConfigurations, userAgentString, 0);
      }), userAgentString;
    }
    return null;
  }
  var formDataConfig = {
    transitional: jsonParsingConfig,
    adapter: ["xhr", "http"],
    transformRequest: [function (UserAgentContext, arrayElementIndex) {
      var userAgentString,
        combineConfigurations = arrayElementIndex.getContentType() || "",
        combineWithDefaults = combineConfigurations.indexOf("application/json") > -1,
        extractArraySlice = responseUtilities.isObject(UserAgentContext);
      if (extractArraySlice && responseUtilities.isHTMLForm(UserAgentContext) && (UserAgentContext = new FormData(UserAgentContext)), responseUtilities.isFormData(UserAgentContext)) return combineWithDefaults && combineWithDefaults ? JSON.stringify(processElementInArray(UserAgentContext)) : UserAgentContext;
      if (responseUtilities.isArrayBuffer(UserAgentContext) || responseUtilities.isBuffer(UserAgentContext) || responseUtilities.isStream(UserAgentContext) || responseUtilities.isFile(UserAgentContext) || responseUtilities.isBlob(UserAgentContext)) return UserAgentContext;
      if (responseUtilities.isArrayBufferView(UserAgentContext)) return UserAgentContext.buffer;
      if (responseUtilities.isURLSearchParams(UserAgentContext)) return arrayElementIndex.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), UserAgentContext.toString();
      if (extractArraySlice) {
        if (combineConfigurations.indexOf("application/x-www-form-urlencoded") > -1) return function (UserAgentContext, arrayElementIndex) {
          return combineFormData(UserAgentContext, new environmentCapabilities.classes.URLSearchParams(), Object.assign({
            visitor: function (UserAgentContext, arrayElementIndex, userAgentString, combineConfigurations) {
              return environmentCapabilities.isNode && responseUtilities.isBuffer(UserAgentContext) ? (this.append(arrayElementIndex, UserAgentContext.toString("base64")), !1) : combineConfigurations.defaultVisitor.apply(this, arguments);
            }
          }, arrayElementIndex));
        }(UserAgentContext, this.formSerializer).toString();
        if ((userAgentString = responseUtilities.isFileList(UserAgentContext)) || combineConfigurations.indexOf("multipart/form-data") > -1) {
          var baseURLResolver = this.env && this.env.FormData;
          return combineFormData(userAgentString ? {
            "files[]": UserAgentContext
          } : UserAgentContext, baseURLResolver && new baseURLResolver(), this.formSerializer);
        }
      }
      return extractArraySlice || combineWithDefaults ? (arrayElementIndex.setContentType("application/json", !1), function (UserAgentContext, arrayElementIndex, userAgentString) {
        if (responseUtilities.isString(UserAgentContext)) try {
          return (arrayElementIndex || JSON.parse)(UserAgentContext), responseUtilities.trim(UserAgentContext);
        } catch (UserAgentContext) {
          if ("SyntaxError" !== UserAgentContext.name) throw UserAgentContext;
        }
        return (userAgentString || JSON.stringify)(UserAgentContext);
      }(UserAgentContext)) : UserAgentContext;
    }],
    transformResponse: [function (UserAgentContext) {
      var arrayElementIndex = this.transitional || formDataConfig.transitional,
        userAgentString = arrayElementIndex && arrayElementIndex.forcedJSONParsing,
        combineConfigurations = "json" === this.responseType;
      if (UserAgentContext && responseUtilities.isString(UserAgentContext) && (userAgentString && !this.responseType || combineConfigurations)) {
        var combineWithDefaults = !(arrayElementIndex && arrayElementIndex.silentJSONParsing) && combineConfigurations;
        try {
          return JSON.parse(UserAgentContext);
        } catch (UserAgentContext) {
          if (combineWithDefaults) {
            if ("SyntaxError" === UserAgentContext.name) throw HttpError.from(UserAgentContext, HttpError.ERR_BAD_RESPONSE, this, null, this.response);
            throw UserAgentContext;
          }
        }
      }
      return UserAgentContext;
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
    validateStatus: function (UserAgentContext) {
      return UserAgentContext >= 200 && UserAgentContext < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": void 0
      }
    }
  };
  responseUtilities.forEach(["delete", "get", "head", "post", "put", "patch"], function (UserAgentContext) {
    formDataConfig.headers[UserAgentContext] = {};
  });
  var formDataRequestConfig = formDataConfig,
    allowedHttpHeaders = responseUtilities.toObjectSet(["age", "authorization", "content-length", "content-type", "etag", "expires", "from", "host", "if-modified-since", "if-unmodified-since", "last-modified", "location", "max-forwards", "proxy-authorization", "referer", "retry-after", "user-agent"]),
    INTERNALS_SYMBOL = Symbol("internals");
  function sanitizeInputString(UserAgentContext) {
    return UserAgentContext && String(UserAgentContext).trim().toLowerCase();
  }
  function normalizeInputValue(UserAgentContext) {
    return !1 === UserAgentContext || null == UserAgentContext ? UserAgentContext : responseUtilities.isArray(UserAgentContext) ? UserAgentContext.map(normalizeInputValue) : String(UserAgentContext);
  }
  function matchesPattern(UserAgentContext, arrayElementIndex, userAgentString, combineConfigurations, combineWithDefaults) {
    return responseUtilities.isFunction(combineConfigurations) ? combineConfigurations.call(this, arrayElementIndex, userAgentString) : (combineWithDefaults && (arrayElementIndex = userAgentString), responseUtilities.isString(arrayElementIndex) ? responseUtilities.isString(combineConfigurations) ? -1 !== arrayElementIndex.indexOf(combineConfigurations) : responseUtilities.isRegExp(combineConfigurations) ? combineConfigurations.test(arrayElementIndex) : void 0 : void 0);
  }
  var headerManagerFunction = function () {
    function UserAgentContext(userAgentString) {
      arrayElementIndex(this, UserAgentContext), userAgentString && this.set(userAgentString);
    }
    return combineConfigurations(UserAgentContext, [{
      key: "set",
      value: function (UserAgentContext, arrayElementIndex, userAgentString) {
        var combineConfigurations = this;
        function combineWithDefaults(UserAgentContext, arrayElementIndex, userAgentString) {
          var combineWithDefaults = sanitizeInputString(arrayElementIndex);
          if (!combineWithDefaults) throw new Error("header name must be a non-empty string");
          var extractArraySlice = responseUtilities.findKey(combineConfigurations, combineWithDefaults);
          (!extractArraySlice || void 0 === combineConfigurations[extractArraySlice] || !0 === userAgentString || void 0 === userAgentString && !1 !== combineConfigurations[extractArraySlice]) && (combineConfigurations[extractArraySlice || arrayElementIndex] = normalizeInputValue(UserAgentContext));
        }
        var extractArraySlice,
          baseURLResolver,
          requestMerger,
          cleanupAbortHandlers,
          httpRequest,
          processInputData = function (UserAgentContext, arrayElementIndex) {
            return responseUtilities.forEach(UserAgentContext, function (UserAgentContext, userAgentString) {
              return combineWithDefaults(UserAgentContext, userAgentString, arrayElementIndex);
            });
          };
        return responseUtilities.isPlainObject(UserAgentContext) || UserAgentContext instanceof this.constructor ? processInputData(UserAgentContext, arrayElementIndex) : responseUtilities.isString(UserAgentContext) && (UserAgentContext = UserAgentContext.trim()) && !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(UserAgentContext.trim()) ? processInputData((httpRequest = {}, (extractArraySlice = UserAgentContext) && extractArraySlice.split("\n").forEach(function (UserAgentContext) {
          cleanupAbortHandlers = UserAgentContext.indexOf(":"), baseURLResolver = UserAgentContext.substring(0, cleanupAbortHandlers).trim().toLowerCase(), requestMerger = UserAgentContext.substring(cleanupAbortHandlers + 1).trim(), !baseURLResolver || httpRequest[baseURLResolver] && allowedHttpHeaders[baseURLResolver] || ("set-cookie" === baseURLResolver ? httpRequest[baseURLResolver] ? httpRequest[baseURLResolver].push(requestMerger) : httpRequest[baseURLResolver] = [requestMerger] : httpRequest[baseURLResolver] = httpRequest[baseURLResolver] ? httpRequest[baseURLResolver] + ", " + requestMerger : requestMerger);
        }), httpRequest), arrayElementIndex) : null != UserAgentContext && combineWithDefaults(arrayElementIndex, UserAgentContext, userAgentString), this;
      }
    }, {
      key: "get",
      value: function (UserAgentContext, arrayElementIndex) {
        if (UserAgentContext = sanitizeInputString(UserAgentContext)) {
          var userAgentString = responseUtilities.findKey(this, UserAgentContext);
          if (userAgentString) {
            var combineConfigurations = this[userAgentString];
            if (!arrayElementIndex) return combineConfigurations;
            if (!0 === arrayElementIndex) return function (UserAgentContext) {
              for (var arrayElementIndex, userAgentString = Object.create(null), combineConfigurations = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g; arrayElementIndex = combineConfigurations.exec(UserAgentContext);) userAgentString[arrayElementIndex[1]] = arrayElementIndex[2];
              return userAgentString;
            }(combineConfigurations);
            if (responseUtilities.isFunction(arrayElementIndex)) return arrayElementIndex.call(this, combineConfigurations, userAgentString);
            if (responseUtilities.isRegExp(arrayElementIndex)) return arrayElementIndex.exec(combineConfigurations);
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
    }, {
      key: "has",
      value: function (UserAgentContext, arrayElementIndex) {
        if (UserAgentContext = sanitizeInputString(UserAgentContext)) {
          var userAgentString = responseUtilities.findKey(this, UserAgentContext);
          return !(!userAgentString || void 0 === this[userAgentString] || arrayElementIndex && !matchesPattern(0, this[userAgentString], userAgentString, arrayElementIndex));
        }
        return !1;
      }
    }, {
      key: "delete",
      value: function (UserAgentContext, arrayElementIndex) {
        var userAgentString = this,
          combineConfigurations = !1;
        function combineWithDefaults(UserAgentContext) {
          if (UserAgentContext = sanitizeInputString(UserAgentContext)) {
            var combineWithDefaults = responseUtilities.findKey(userAgentString, UserAgentContext);
            !combineWithDefaults || arrayElementIndex && !matchesPattern(0, userAgentString[combineWithDefaults], combineWithDefaults, arrayElementIndex) || (delete userAgentString[combineWithDefaults], combineConfigurations = !0);
          }
        }
        return responseUtilities.isArray(UserAgentContext) ? UserAgentContext.forEach(combineWithDefaults) : combineWithDefaults(UserAgentContext), combineConfigurations;
      }
    }, {
      key: "clear",
      value: function (UserAgentContext) {
        for (var arrayElementIndex = Object.keys(this), userAgentString = arrayElementIndex.length, combineConfigurations = !1; userAgentString--;) {
          var combineWithDefaults = arrayElementIndex[userAgentString];
          UserAgentContext && !matchesPattern(0, this[combineWithDefaults], combineWithDefaults, UserAgentContext, !0) || (delete this[combineWithDefaults], combineConfigurations = !0);
        }
        return combineConfigurations;
      }
    }, {
      key: "normalize",
      value: function (UserAgentContext) {
        var arrayElementIndex = this,
          userAgentString = {};
        return responseUtilities.forEach(this, function (combineConfigurations, combineWithDefaults) {
          var extractArraySlice = responseUtilities.findKey(userAgentString, combineWithDefaults);
          if (extractArraySlice) return arrayElementIndex[extractArraySlice] = normalizeInputValue(combineConfigurations), void delete arrayElementIndex[combineWithDefaults];
          var baseURLResolver = UserAgentContext ? function (UserAgentContext) {
            return UserAgentContext.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, function (UserAgentContext, arrayElementIndex, userAgentString) {
              return arrayElementIndex.toUpperCase() + userAgentString;
            });
          }(combineWithDefaults) : String(combineWithDefaults).trim();
          baseURLResolver !== combineWithDefaults && delete arrayElementIndex[combineWithDefaults], arrayElementIndex[baseURLResolver] = normalizeInputValue(combineConfigurations), userAgentString[baseURLResolver] = !0;
        }), this;
      }
    }, {
      key: "concat",
      value: function () {
        for (var UserAgentContext, arrayElementIndex = arguments.length, userAgentString = new Array(arrayElementIndex), combineConfigurations = 0; combineConfigurations < arrayElementIndex; combineConfigurations++) userAgentString[combineConfigurations] = arguments[combineConfigurations];
        return (UserAgentContext = this.constructor).concat.apply(UserAgentContext, [this].concat(userAgentString));
      }
    }, {
      key: "toJSON",
      value: function (UserAgentContext) {
        var arrayElementIndex = Object.create(null);
        return responseUtilities.forEach(this, function (userAgentString, combineConfigurations) {
          null != userAgentString && !1 !== userAgentString && (arrayElementIndex[combineConfigurations] = UserAgentContext && responseUtilities.isArray(userAgentString) ? userAgentString.join(", ") : userAgentString);
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
        return Object.entries(this.toJSON()).map(function (UserAgentContext) {
          var arrayElementIndex = combineWithDefaults(UserAgentContext, 2);
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
      value: function (UserAgentContext) {
        return UserAgentContext instanceof this ? UserAgentContext : new this(UserAgentContext);
      }
    }, {
      key: "concat",
      value: function (UserAgentContext) {
        for (var arrayElementIndex = new this(UserAgentContext), userAgentString = arguments.length, combineConfigurations = new Array(userAgentString > 1 ? userAgentString - 1 : 0), combineWithDefaults = 1; combineWithDefaults < userAgentString; combineWithDefaults++) combineConfigurations[combineWithDefaults - 1] = arguments[combineWithDefaults];
        return combineConfigurations.forEach(function (UserAgentContext) {
          return arrayElementIndex.set(UserAgentContext);
        }), arrayElementIndex;
      }
    }, {
      key: "accessor",
      value: function (UserAgentContext) {
        var arrayElementIndex = (this[INTERNALS_SYMBOL] = this[INTERNALS_SYMBOL] = {
            accessors: {}
          }).accessors,
          userAgentString = this.prototype;
        function combineConfigurations(UserAgentContext) {
          var combineConfigurations = sanitizeInputString(UserAgentContext);
          arrayElementIndex[combineConfigurations] || (!function (UserAgentContext, arrayElementIndex) {
            var userAgentString = responseUtilities.toCamelCase(" " + arrayElementIndex);
            ["get", "set", "has"].forEach(function (combineConfigurations) {
              Object.defineProperty(UserAgentContext, combineConfigurations + userAgentString, {
                value: function (UserAgentContext, userAgentString, combineWithDefaults) {
                  return this[combineConfigurations].call(this, arrayElementIndex, UserAgentContext, userAgentString, combineWithDefaults);
                },
                configurable: !0
              });
            });
          }(userAgentString, UserAgentContext), arrayElementIndex[combineConfigurations] = !0);
        }
        return responseUtilities.isArray(UserAgentContext) ? UserAgentContext.forEach(combineConfigurations) : combineConfigurations(UserAgentContext), this;
      }
    }]), UserAgentContext;
  }();
  headerManagerFunction.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]), responseUtilities.reduceDescriptors(headerManagerFunction.prototype, function (UserAgentContext, arrayElementIndex) {
    var userAgentString = UserAgentContext.value,
      combineConfigurations = arrayElementIndex[0].toUpperCase() + arrayElementIndex.slice(1);
    return {
      get: function () {
        return userAgentString;
      },
      set: function (UserAgentContext) {
        this[combineConfigurations] = UserAgentContext;
      }
    };
  }), responseUtilities.freezeMethods(headerManagerFunction);
  var headerManagerInstance = headerManagerFunction;
  function handleResponseData(UserAgentContext, arrayElementIndex) {
    var userAgentString = this || formDataRequestConfig,
      combineConfigurations = arrayElementIndex || userAgentString,
      combineWithDefaults = headerManagerInstance.from(combineConfigurations.headers),
      extractArraySlice = combineConfigurations.data;
    return responseUtilities.forEach(UserAgentContext, function (UserAgentContext) {
      extractArraySlice = UserAgentContext.call(userAgentString, extractArraySlice, combineWithDefaults.normalize(), arrayElementIndex ? arrayElementIndex.status : void 0);
    }), combineWithDefaults.normalize(), extractArraySlice;
  }
  function isCancellationToken(UserAgentContext) {
    return !(!UserAgentContext || !UserAgentContext.__CANCEL__);
  }
  function CancellationError(UserAgentContext, arrayElementIndex, userAgentString) {
    HttpError.call(this, null == UserAgentContext ? "canceled" : UserAgentContext, HttpError.ERR_CANCELED, arrayElementIndex, userAgentString), this.name = "CanceledError";
  }
  responseUtilities.inherits(CancellationError, HttpError, {
    __CANCEL__: !0
  });
  var cookieManager = environmentCapabilities.isStandardBrowserEnv ? {
    write: function (UserAgentContext, arrayElementIndex, userAgentString, combineConfigurations, combineWithDefaults, extractArraySlice) {
      var baseURLResolver = [];
      baseURLResolver.push(UserAgentContext + "=" + encodeURIComponent(arrayElementIndex)), responseUtilities.isNumber(userAgentString) && baseURLResolver.push("expires=" + new Date(userAgentString).toGMTString()), responseUtilities.isString(combineConfigurations) && baseURLResolver.push("path=" + combineConfigurations), responseUtilities.isString(combineWithDefaults) && baseURLResolver.push("domain=" + combineWithDefaults), !0 === extractArraySlice && baseURLResolver.push("secure"), document.cookie = baseURLResolver.join("; ");
    },
    read: function (UserAgentContext) {
      var arrayElementIndex = document.cookie.match(new RegExp("(^|;\\s*)(" + UserAgentContext + ")=([^;]*)"));
      return arrayElementIndex ? decodeURIComponent(arrayElementIndex[3]) : null;
    },
    remove: function (UserAgentContext) {
      this.write(UserAgentContext, "", Date.now() - 864e5);
    }
  } : {
    write: function () {},
    read: function () {
      return null;
    },
    remove: function () {}
  };
  function joinBaseUrlWithPath(UserAgentContext, arrayElementIndex) {
    return UserAgentContext && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(arrayElementIndex) ? function (UserAgentContext, arrayElementIndex) {
      return arrayElementIndex ? UserAgentContext.replace(/\/+$/, "") + "/" + arrayElementIndex.replace(/^\/+/, "") : UserAgentContext;
    }(UserAgentContext, arrayElementIndex) : arrayElementIndex;
  }
  var isStandardBrowserEnvironment = environmentCapabilities.isStandardBrowserEnv ? function () {
    var UserAgentContext,
      arrayElementIndex = /(msie|trident)/i.test(navigator.userAgent),
      userAgentString = document.createElement("a");
    function combineConfigurations(UserAgentContext) {
      var combineConfigurations = UserAgentContext;
      return arrayElementIndex && (userAgentString.setAttribute("href", combineConfigurations), combineConfigurations = userAgentString.href), userAgentString.setAttribute("href", combineConfigurations), {
        href: userAgentString.href,
        protocol: userAgentString.protocol ? userAgentString.protocol.replace(/:$/, "") : "",
        host: userAgentString.host,
        search: userAgentString.search ? userAgentString.search.replace(/^\?/, "") : "",
        hash: userAgentString.hash ? userAgentString.hash.replace(/^#/, "") : "",
        hostname: userAgentString.hostname,
        port: userAgentString.port,
        pathname: "/" === userAgentString.pathname.charAt(0) ? userAgentString.pathname : "/" + userAgentString.pathname
      };
    }
    return UserAgentContext = combineConfigurations(window.location.href), function (arrayElementIndex) {
      var userAgentString = responseUtilities.isString(arrayElementIndex) ? combineConfigurations(arrayElementIndex) : arrayElementIndex;
      return userAgentString.protocol === UserAgentContext.protocol && userAgentString.host === UserAgentContext.host;
    };
  }() : function () {
    return !0;
  };
  function requestRateLimiter(UserAgentContext, arrayElementIndex) {
    var userAgentString = 0,
      combineConfigurations = function (UserAgentContext, arrayElementIndex) {
        UserAgentContext = UserAgentContext || 10;
        var userAgentString,
          combineConfigurations = new Array(UserAgentContext),
          combineWithDefaults = new Array(UserAgentContext),
          extractArraySlice = 0,
          baseURLResolver = 0;
        return arrayElementIndex = void 0 !== arrayElementIndex ? arrayElementIndex : 1e3, function (requestMerger) {
          var cleanupAbortHandlers = Date.now(),
            httpRequest = combineWithDefaults[baseURLResolver];
          userAgentString || (userAgentString = cleanupAbortHandlers), combineConfigurations[extractArraySlice] = requestMerger, combineWithDefaults[extractArraySlice] = cleanupAbortHandlers;
          for (var processInputData = baseURLResolver, isMatchingArrayBufferType = 0; processInputData !== extractArraySlice;) isMatchingArrayBufferType += combineConfigurations[processInputData++], processInputData %= UserAgentContext;
          if ((extractArraySlice = (extractArraySlice + 1) % UserAgentContext) === baseURLResolver && (baseURLResolver = (baseURLResolver + 1) % UserAgentContext), !(cleanupAbortHandlers - userAgentString < arrayElementIndex)) {
            var currentInterceptorPosition = httpRequest && cleanupAbortHandlers - httpRequest;
            return currentInterceptorPosition ? Math.round(1e3 * isMatchingArrayBufferType / currentInterceptorPosition) : void 0;
          }
        };
      }(50, 250);
    return function (combineWithDefaults) {
      var extractArraySlice = combineWithDefaults.loaded,
        baseURLResolver = combineWithDefaults.lengthComputable ? combineWithDefaults.total : void 0,
        requestMerger = extractArraySlice - userAgentString,
        cleanupAbortHandlers = combineConfigurations(requestMerger);
      userAgentString = extractArraySlice;
      var httpRequest = {
        loaded: extractArraySlice,
        total: baseURLResolver,
        progress: baseURLResolver ? extractArraySlice / baseURLResolver : void 0,
        bytes: requestMerger,
        rate: cleanupAbortHandlers || void 0,
        estimated: cleanupAbortHandlers && baseURLResolver && extractArraySlice <= baseURLResolver ? (baseURLResolver - extractArraySlice) / cleanupAbortHandlers : void 0,
        event: combineWithDefaults
      };
      httpRequest[arrayElementIndex ? "download" : "upload"] = !0, UserAgentContext(httpRequest);
    };
  }
  var _httpRequestConfig = {
    http: null,
    xhr: "undefined" != typeof XMLHttpRequest && function (UserAgentContext) {
      return new Promise(function (arrayElementIndex, userAgentString) {
        var combineConfigurations,
          combineWithDefaults,
          extractArraySlice = UserAgentContext.data,
          baseURLResolver = headerManagerInstance.from(UserAgentContext.headers).normalize(),
          requestMerger = UserAgentContext.responseType;
        function cleanupAbortHandlers() {
          UserAgentContext.cancelToken && UserAgentContext.cancelToken.unsubscribe(combineConfigurations), UserAgentContext.signal && UserAgentContext.signal.removeEventListener("abort", combineConfigurations);
        }
        responseUtilities.isFormData(extractArraySlice) && (environmentCapabilities.isStandardBrowserEnv || environmentCapabilities.isStandardBrowserWebWorkerEnv ? baseURLResolver.setContentType(!1) : baseURLResolver.getContentType(/^\s*multipart\/form-data/) ? responseUtilities.isString(combineWithDefaults = baseURLResolver.getContentType()) && baseURLResolver.setContentType(combineWithDefaults.replace(/^\s*(multipart\/form-data);+/, "$1")) : baseURLResolver.setContentType("multipart/form-data"));
        var httpRequest = new XMLHttpRequest();
        if (UserAgentContext.auth) {
          var processInputData = UserAgentContext.auth.username || "",
            isMatchingArrayBufferType = UserAgentContext.auth.password ? unescape(encodeURIComponent(UserAgentContext.auth.password)) : "";
          baseURLResolver.set("Authorization", "Basic " + btoa(processInputData + ":" + isMatchingArrayBufferType));
        }
        var currentInterceptorPosition = joinBaseUrlWithPath(UserAgentContext.baseURL, UserAgentContext.url);
        function processResponseHeaders() {
          if (httpRequest) {
            var combineConfigurations = headerManagerInstance.from("getAllResponseHeaders" in httpRequest && httpRequest.getAllResponseHeaders());
            !function (UserAgentContext, arrayElementIndex, userAgentString) {
              var combineConfigurations = userAgentString.config.validateStatus;
              userAgentString.status && combineConfigurations && !combineConfigurations(userAgentString.status) ? arrayElementIndex(new HttpError("Request failed with status code " + userAgentString.status, [HttpError.ERR_BAD_REQUEST, HttpError.ERR_BAD_RESPONSE][Math.floor(userAgentString.status / 100) - 4], userAgentString.config, userAgentString.request, userAgentString)) : UserAgentContext(userAgentString);
            }(function (UserAgentContext) {
              arrayElementIndex(UserAgentContext), cleanupAbortHandlers();
            }, function (UserAgentContext) {
              userAgentString(UserAgentContext), cleanupAbortHandlers();
            }, {
              data: requestMerger && "text" !== requestMerger && "json" !== requestMerger ? httpRequest.response : httpRequest.responseText,
              status: httpRequest.status,
              statusText: httpRequest.statusText,
              headers: combineConfigurations,
              config: UserAgentContext,
              request: httpRequest
            }), httpRequest = null;
          }
        }
        if (httpRequest.open(UserAgentContext.method.toUpperCase(), mergeQueryParameters(currentInterceptorPosition, UserAgentContext.params, UserAgentContext.paramsSerializer), !0), httpRequest.timeout = UserAgentContext.timeout, "onloadend" in httpRequest ? httpRequest.onloadend = processResponseHeaders : httpRequest.onreadystatechange = function () {
          httpRequest && 4 === httpRequest.readyState && (0 !== httpRequest.status || httpRequest.responseURL && 0 === httpRequest.responseURL.indexOf("file:")) && setTimeout(processResponseHeaders);
        }, httpRequest.onabort = function () {
          httpRequest && (userAgentString(new HttpError("Request aborted", HttpError.ECONNABORTED, UserAgentContext, httpRequest)), httpRequest = null);
        }, httpRequest.onerror = function () {
          userAgentString(new HttpError("Network Error", HttpError.ERR_NETWORK, UserAgentContext, httpRequest)), httpRequest = null;
        }, httpRequest.ontimeout = function () {
          var arrayElementIndex = UserAgentContext.timeout ? "timeout of " + UserAgentContext.timeout + "ms exceeded" : "timeout exceeded",
            combineConfigurations = UserAgentContext.transitional || jsonParsingConfig;
          UserAgentContext.timeoutErrorMessage && (arrayElementIndex = UserAgentContext.timeoutErrorMessage), userAgentString(new HttpError(arrayElementIndex, combineConfigurations.clarifyTimeoutError ? HttpError.ETIMEDOUT : HttpError.ECONNABORTED, UserAgentContext, httpRequest)), httpRequest = null;
        }, environmentCapabilities.isStandardBrowserEnv) {
          var isUndefinedInterceptor = isStandardBrowserEnvironment(currentInterceptorPosition) && UserAgentContext.xsrfCookieName && cookieManager.read(UserAgentContext.xsrfCookieName);
          isUndefinedInterceptor && baseURLResolver.set(UserAgentContext.xsrfHeaderName, isUndefinedInterceptor);
        }
        void 0 === extractArraySlice && baseURLResolver.setContentType(null), "setRequestHeader" in httpRequest && responseUtilities.forEach(baseURLResolver.toJSON(), function (UserAgentContext, arrayElementIndex) {
          httpRequest.setRequestHeader(arrayElementIndex, UserAgentContext);
        }), responseUtilities.isUndefined(UserAgentContext.withCredentials) || (httpRequest.withCredentials = !!UserAgentContext.withCredentials), requestMerger && "json" !== requestMerger && (httpRequest.responseType = UserAgentContext.responseType), "function" == typeof UserAgentContext.onDownloadProgress && httpRequest.addEventListener("progress", requestRateLimiter(UserAgentContext.onDownloadProgress, !0)), "function" == typeof UserAgentContext.onUploadProgress && httpRequest.upload && httpRequest.upload.addEventListener("progress", requestRateLimiter(UserAgentContext.onUploadProgress)), (UserAgentContext.cancelToken || UserAgentContext.signal) && (combineConfigurations = function (arrayElementIndex) {
          httpRequest && (userAgentString(!arrayElementIndex || arrayElementIndex.type ? new CancellationError(null, UserAgentContext, httpRequest) : arrayElementIndex), httpRequest.abort(), httpRequest = null);
        }, UserAgentContext.cancelToken && UserAgentContext.cancelToken.subscribe(combineConfigurations), UserAgentContext.signal && (UserAgentContext.signal.aborted ? combineConfigurations() : UserAgentContext.signal.addEventListener("abort", combineConfigurations)));
        var isArrayBufferTypeCheck,
          urlProtocol = (isArrayBufferTypeCheck = /^([-+\w]{1,25})(:?\/\/|:)/.exec(currentInterceptorPosition)) && isArrayBufferTypeCheck[1] || "";
        urlProtocol && -1 === environmentCapabilities.protocols.indexOf(urlProtocol) ? userAgentString(new HttpError("Unsupported protocol " + urlProtocol + ":", HttpError.ERR_BAD_REQUEST, UserAgentContext)) : httpRequest.send(extractArraySlice || null);
      });
    }
  };
  responseUtilities.forEach(_httpRequestConfig, function (UserAgentContext, arrayElementIndex) {
    if (UserAgentContext) {
      try {
        Object.defineProperty(UserAgentContext, "name", {
          value: arrayElementIndex
        });
      } catch (UserAgentContext) {}
      Object.defineProperty(UserAgentContext, "adapterName", {
        value: arrayElementIndex
      });
    }
  });
  var formatErrorMessageWithPrefix = function (UserAgentContext) {
      return "- ".concat(UserAgentContext);
    },
    isAdapterValid = function (UserAgentContext) {
      return responseUtilities.isFunction(UserAgentContext) || null === UserAgentContext || !1 === UserAgentContext;
    },
    retrieveAdapter = function (UserAgentContext) {
      for (var arrayElementIndex, userAgentString, combineConfigurations = (UserAgentContext = responseUtilities.isArray(UserAgentContext) ? UserAgentContext : [UserAgentContext]).length, extractArraySlice = {}, baseURLResolver = 0; baseURLResolver < combineConfigurations; baseURLResolver++) {
        var requestMerger = void 0;
        if (userAgentString = arrayElementIndex = UserAgentContext[baseURLResolver], !isAdapterValid(arrayElementIndex) && void 0 === (userAgentString = _httpRequestConfig[(requestMerger = String(arrayElementIndex)).toLowerCase()])) throw new HttpError("Unknown adapter '".concat(requestMerger, "'"));
        if (userAgentString) break;
        extractArraySlice[requestMerger || "#" + baseURLResolver] = userAgentString;
      }
      if (!userAgentString) {
        var cleanupAbortHandlers = Object.entries(extractArraySlice).map(function (UserAgentContext) {
          var arrayElementIndex = combineWithDefaults(UserAgentContext, 2),
            userAgentString = arrayElementIndex[0],
            combineConfigurations = arrayElementIndex[1];
          return "adapter ".concat(userAgentString, " ") + (!1 === combineConfigurations ? "is not supported by the environment" : "is not available in the build");
        });
        throw new HttpError("There is no suitable adapter to dispatch the request " + (combineConfigurations ? cleanupAbortHandlers.length > 1 ? "since :\n" + cleanupAbortHandlers.map(formatErrorMessageWithPrefix).join("\n") : " " + formatErrorMessageWithPrefix(cleanupAbortHandlers[0]) : "as no adapter specified"), "ERR_NOT_SUPPORT");
      }
      return userAgentString;
    };
  function handleRequestCancellation(UserAgentContext) {
    if (UserAgentContext.cancelToken && UserAgentContext.cancelToken.throwIfRequested(), UserAgentContext.signal && UserAgentContext.signal.aborted) throw new CancellationError(null, UserAgentContext);
  }
  function handleHttpRequest(UserAgentContext) {
    return handleRequestCancellation(UserAgentContext), UserAgentContext.headers = headerManagerInstance.from(UserAgentContext.headers), UserAgentContext.data = handleResponseData.call(UserAgentContext, UserAgentContext.transformRequest), -1 !== ["post", "put", "patch"].indexOf(UserAgentContext.method) && UserAgentContext.headers.setContentType("application/x-www-form-urlencoded", !1), retrieveAdapter(UserAgentContext.adapter || formDataRequestConfig.adapter)(UserAgentContext).then(function (arrayElementIndex) {
      return handleRequestCancellation(UserAgentContext), arrayElementIndex.data = handleResponseData.call(UserAgentContext, UserAgentContext.transformResponse, arrayElementIndex), arrayElementIndex.headers = headerManagerInstance.from(arrayElementIndex.headers), arrayElementIndex;
    }, function (arrayElementIndex) {
      return isCancellationToken(arrayElementIndex) || (handleRequestCancellation(UserAgentContext), arrayElementIndex && arrayElementIndex.response && (arrayElementIndex.response.data = handleResponseData.call(UserAgentContext, UserAgentContext.transformResponse, arrayElementIndex.response), arrayElementIndex.response.headers = headerManagerInstance.from(arrayElementIndex.response.headers))), Promise.reject(arrayElementIndex);
    });
  }
  var convertToJSONFormat = function (UserAgentContext) {
    return UserAgentContext instanceof headerManagerInstance ? UserAgentContext.toJSON() : UserAgentContext;
  };
  function mergeRequestOptions(UserAgentContext, arrayElementIndex) {
    arrayElementIndex = arrayElementIndex || {};
    var userAgentString = {};
    function combineConfigurations(UserAgentContext, arrayElementIndex, userAgentString) {
      return responseUtilities.isPlainObject(UserAgentContext) && responseUtilities.isPlainObject(arrayElementIndex) ? responseUtilities.merge.call({
        caseless: userAgentString
      }, UserAgentContext, arrayElementIndex) : responseUtilities.isPlainObject(arrayElementIndex) ? responseUtilities.merge({}, arrayElementIndex) : responseUtilities.isArray(arrayElementIndex) ? arrayElementIndex.slice() : arrayElementIndex;
    }
    function combineWithDefaults(UserAgentContext, arrayElementIndex, userAgentString) {
      return responseUtilities.isUndefined(arrayElementIndex) ? responseUtilities.isUndefined(UserAgentContext) ? void 0 : combineConfigurations(void 0, UserAgentContext, userAgentString) : combineConfigurations(UserAgentContext, arrayElementIndex, userAgentString);
    }
    function extractArraySlice(UserAgentContext, arrayElementIndex) {
      if (!responseUtilities.isUndefined(arrayElementIndex)) return combineConfigurations(void 0, arrayElementIndex);
    }
    function baseURLResolver(UserAgentContext, arrayElementIndex) {
      return responseUtilities.isUndefined(arrayElementIndex) ? responseUtilities.isUndefined(UserAgentContext) ? void 0 : combineConfigurations(void 0, UserAgentContext) : combineConfigurations(void 0, arrayElementIndex);
    }
    function requestMerger(userAgentString, combineWithDefaults, extractArraySlice) {
      return extractArraySlice in arrayElementIndex ? combineConfigurations(userAgentString, combineWithDefaults) : extractArraySlice in UserAgentContext ? combineConfigurations(void 0, userAgentString) : void 0;
    }
    var cleanupAbortHandlers = {
      url: extractArraySlice,
      method: extractArraySlice,
      data: extractArraySlice,
      baseURL: baseURLResolver,
      transformRequest: baseURLResolver,
      transformResponse: baseURLResolver,
      paramsSerializer: baseURLResolver,
      timeout: baseURLResolver,
      timeoutMessage: baseURLResolver,
      withCredentials: baseURLResolver,
      adapter: baseURLResolver,
      responseType: baseURLResolver,
      xsrfCookieName: baseURLResolver,
      xsrfHeaderName: baseURLResolver,
      onUploadProgress: baseURLResolver,
      onDownloadProgress: baseURLResolver,
      decompress: baseURLResolver,
      maxContentLength: baseURLResolver,
      maxBodyLength: baseURLResolver,
      beforeRedirect: baseURLResolver,
      transport: baseURLResolver,
      httpAgent: baseURLResolver,
      httpsAgent: baseURLResolver,
      cancelToken: baseURLResolver,
      socketPath: baseURLResolver,
      responseEncoding: baseURLResolver,
      validateStatus: requestMerger,
      headers: function (UserAgentContext, arrayElementIndex) {
        return combineWithDefaults(convertToJSONFormat(UserAgentContext), convertToJSONFormat(arrayElementIndex), !0);
      }
    };
    return responseUtilities.forEach(Object.keys(Object.assign({}, UserAgentContext, arrayElementIndex)), function (combineConfigurations) {
      var extractArraySlice = cleanupAbortHandlers[combineConfigurations] || combineWithDefaults,
        baseURLResolver = extractArraySlice(UserAgentContext[combineConfigurations], arrayElementIndex[combineConfigurations], combineConfigurations);
      responseUtilities.isUndefined(baseURLResolver) && extractArraySlice !== requestMerger || (userAgentString[combineConfigurations] = baseURLResolver);
    }), userAgentString;
  }
  var axiosVersionString = "1.6.0",
    typeValidators = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(function (arrayElementIndex, userAgentString) {
    typeValidators[arrayElementIndex] = function (combineConfigurations) {
      return UserAgentContext(combineConfigurations) === arrayElementIndex || "a" + (userAgentString < 1 ? "n " : " ") + arrayElementIndex;
    };
  });
  var transitionalConfig = {};
  typeValidators.transitional = function (UserAgentContext, arrayElementIndex, userAgentString) {
    function combineConfigurations(UserAgentContext, arrayElementIndex) {
      return "[Axios v1.6.0] Transitional option '" + UserAgentContext + "'" + arrayElementIndex + (userAgentString ? ". " + userAgentString : "");
    }
    return function (userAgentString, combineWithDefaults, extractArraySlice) {
      if (!1 === UserAgentContext) throw new HttpError(combineConfigurations(combineWithDefaults, " has been removed" + (arrayElementIndex ? " in " + arrayElementIndex : "")), HttpError.ERR_DEPRECATED);
      return arrayElementIndex && !transitionalConfig[combineWithDefaults] && (transitionalConfig[combineWithDefaults] = !0, console.warn(combineConfigurations(combineWithDefaults, " has been deprecated since v" + arrayElementIndex + " and will be removed in the near future"))), !UserAgentContext || UserAgentContext(userAgentString, combineWithDefaults, extractArraySlice);
    };
  };
  var optionsValidator = {
      assertOptions: function (arrayElementIndex, userAgentString, combineConfigurations) {
        if ("object" !== UserAgentContext(arrayElementIndex)) throw new HttpError("options must be an object", HttpError.ERR_BAD_OPTION_VALUE);
        for (var combineWithDefaults = Object.keys(arrayElementIndex), extractArraySlice = combineWithDefaults.length; extractArraySlice-- > 0;) {
          var baseURLResolver = combineWithDefaults[extractArraySlice],
            requestMerger = userAgentString[baseURLResolver];
          if (requestMerger) {
            var cleanupAbortHandlers = arrayElementIndex[baseURLResolver],
              httpRequest = void 0 === cleanupAbortHandlers || requestMerger(cleanupAbortHandlers, baseURLResolver, arrayElementIndex);
            if (!0 !== httpRequest) throw new HttpError("option " + baseURLResolver + " must be " + httpRequest, HttpError.ERR_BAD_OPTION_VALUE);
          } else if (!0 !== combineConfigurations) throw new HttpError("Unknown option " + baseURLResolver, HttpError.ERR_BAD_OPTION);
        }
      },
      validators: typeValidators
    },
    _optionsValidator = optionsValidator.validators,
    createInterceptorInstance = function () {
      function UserAgentContext(userAgentString) {
        arrayElementIndex(this, UserAgentContext), this.defaults = userAgentString, this.interceptors = {
          request: new createEventHandler(),
          response: new createEventHandler()
        };
      }
      return combineConfigurations(UserAgentContext, [{
        key: "request",
        value: function (UserAgentContext, arrayElementIndex) {
          "string" == typeof UserAgentContext ? (arrayElementIndex = arrayElementIndex || {}).url = UserAgentContext : arrayElementIndex = UserAgentContext || {};
          var userAgentString = arrayElementIndex = mergeRequestOptions(this.defaults, arrayElementIndex),
            combineConfigurations = userAgentString.transitional,
            combineWithDefaults = userAgentString.paramsSerializer,
            extractArraySlice = userAgentString.headers;
          void 0 !== combineConfigurations && optionsValidator.assertOptions(combineConfigurations, {
            silentJSONParsing: _optionsValidator.transitional(_optionsValidator.boolean),
            forcedJSONParsing: _optionsValidator.transitional(_optionsValidator.boolean),
            clarifyTimeoutError: _optionsValidator.transitional(_optionsValidator.boolean)
          }, !1), null != combineWithDefaults && (responseUtilities.isFunction(combineWithDefaults) ? arrayElementIndex.paramsSerializer = {
            serialize: combineWithDefaults
          } : optionsValidator.assertOptions(combineWithDefaults, {
            encode: _optionsValidator.function,
            serialize: _optionsValidator.function
          }, !0)), arrayElementIndex.method = (arrayElementIndex.method || this.defaults.method || "get").toLowerCase();
          var baseURLResolver = extractArraySlice && responseUtilities.merge(extractArraySlice.common, extractArraySlice[arrayElementIndex.method]);
          extractArraySlice && responseUtilities.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (UserAgentContext) {
            delete extractArraySlice[UserAgentContext];
          }), arrayElementIndex.headers = headerManagerInstance.concat(baseURLResolver, extractArraySlice);
          var requestMerger = [],
            cleanupAbortHandlers = !0;
          this.interceptors.request.forEach(function (UserAgentContext) {
            "function" == typeof UserAgentContext.runWhen && !1 === UserAgentContext.runWhen(arrayElementIndex) || (cleanupAbortHandlers = cleanupAbortHandlers && UserAgentContext.synchronous, requestMerger.unshift(UserAgentContext.fulfilled, UserAgentContext.rejected));
          });
          var httpRequest,
            processInputData = [];
          this.interceptors.response.forEach(function (UserAgentContext) {
            processInputData.push(UserAgentContext.fulfilled, UserAgentContext.rejected);
          });
          var isMatchingArrayBufferType,
            currentInterceptorPosition = 0;
          if (!cleanupAbortHandlers) {
            var processResponseHeaders = [handleHttpRequest.bind(this), void 0];
            for (processResponseHeaders.unshift.apply(processResponseHeaders, requestMerger), processResponseHeaders.push.apply(processResponseHeaders, processInputData), isMatchingArrayBufferType = processResponseHeaders.length, httpRequest = Promise.resolve(arrayElementIndex); currentInterceptorPosition < isMatchingArrayBufferType;) httpRequest = httpRequest.then(processResponseHeaders[currentInterceptorPosition++], processResponseHeaders[currentInterceptorPosition++]);
            return httpRequest;
          }
          isMatchingArrayBufferType = requestMerger.length;
          var isUndefinedInterceptor = arrayElementIndex;
          for (currentInterceptorPosition = 0; currentInterceptorPosition < isMatchingArrayBufferType;) {
            var isArrayBufferTypeCheck = requestMerger[currentInterceptorPosition++],
              urlProtocol = requestMerger[currentInterceptorPosition++];
            try {
              isUndefinedInterceptor = isArrayBufferTypeCheck(isUndefinedInterceptor);
            } catch (UserAgentContext) {
              urlProtocol.call(this, UserAgentContext);
              break;
            }
          }
          try {
            httpRequest = handleHttpRequest.call(this, isUndefinedInterceptor);
          } catch (UserAgentContext) {
            return Promise.reject(UserAgentContext);
          }
          for (currentInterceptorPosition = 0, isMatchingArrayBufferType = processInputData.length; currentInterceptorPosition < isMatchingArrayBufferType;) httpRequest = httpRequest.then(processInputData[currentInterceptorPosition++], processInputData[currentInterceptorPosition++]);
          return httpRequest;
        }
      }, {
        key: "getUri",
        value: function (UserAgentContext) {
          return mergeQueryParameters(joinBaseUrlWithPath((UserAgentContext = mergeRequestOptions(this.defaults, UserAgentContext)).baseURL, UserAgentContext.url), UserAgentContext.params, UserAgentContext.paramsSerializer);
        }
      }]), UserAgentContext;
    }();
  responseUtilities.forEach(["delete", "get", "head", "options"], function (UserAgentContext) {
    createInterceptorInstance.prototype[UserAgentContext] = function (arrayElementIndex, userAgentString) {
      return this.request(mergeRequestOptions(userAgentString || {}, {
        method: UserAgentContext,
        url: arrayElementIndex,
        data: (userAgentString || {}).data
      }));
    };
  }), responseUtilities.forEach(["post", "put", "patch"], function (UserAgentContext) {
    function arrayElementIndex(arrayElementIndex) {
      return function (userAgentString, combineConfigurations, combineWithDefaults) {
        return this.request(mergeRequestOptions(combineWithDefaults || {}, {
          method: UserAgentContext,
          headers: arrayElementIndex ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: userAgentString,
          data: combineConfigurations
        }));
      };
    }
    createInterceptorInstance.prototype[UserAgentContext] = arrayElementIndex(), createInterceptorInstance.prototype[UserAgentContext + "Form"] = arrayElementIndex(!0);
  });
  var HttpRequestInterceptor = createInterceptorInstance,
    executorFunctionHandler = function () {
      function UserAgentContext(userAgentString) {
        if (arrayElementIndex(this, UserAgentContext), "function" != typeof userAgentString) throw new TypeError("executor must be a function.");
        var combineConfigurations;
        this.promise = new Promise(function (UserAgentContext) {
          combineConfigurations = UserAgentContext;
        });
        var combineWithDefaults = this;
        this.promise.then(function (UserAgentContext) {
          if (combineWithDefaults._listeners) {
            for (var arrayElementIndex = combineWithDefaults._listeners.length; arrayElementIndex-- > 0;) combineWithDefaults._listeners[arrayElementIndex](UserAgentContext);
            combineWithDefaults._listeners = null;
          }
        }), this.promise.then = function (UserAgentContext) {
          var arrayElementIndex,
            userAgentString = new Promise(function (UserAgentContext) {
              combineWithDefaults.subscribe(UserAgentContext), arrayElementIndex = UserAgentContext;
            }).then(UserAgentContext);
          return userAgentString.cancel = function () {
            combineWithDefaults.unsubscribe(arrayElementIndex);
          }, userAgentString;
        }, userAgentString(function (UserAgentContext, arrayElementIndex, userAgentString) {
          combineWithDefaults.reason || (combineWithDefaults.reason = new CancellationError(UserAgentContext, arrayElementIndex, userAgentString), combineConfigurations(combineWithDefaults.reason));
        });
      }
      return combineConfigurations(UserAgentContext, [{
        key: "throwIfRequested",
        value: function () {
          if (this.reason) throw this.reason;
        }
      }, {
        key: "subscribe",
        value: function (UserAgentContext) {
          this.reason ? UserAgentContext(this.reason) : this._listeners ? this._listeners.push(UserAgentContext) : this._listeners = [UserAgentContext];
        }
      }, {
        key: "unsubscribe",
        value: function (UserAgentContext) {
          if (this._listeners) {
            var arrayElementIndex = this._listeners.indexOf(UserAgentContext);
            -1 !== arrayElementIndex && this._listeners.splice(arrayElementIndex, 1);
          }
        }
      }], [{
        key: "source",
        value: function () {
          var arrayElementIndex;
          return {
            token: new UserAgentContext(function (UserAgentContext) {
              arrayElementIndex = UserAgentContext;
            }),
            cancel: arrayElementIndex
          };
        }
      }]), UserAgentContext;
    }();
  var HttpStatusCodeMap = {
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
  Object.entries(HttpStatusCodeMap).forEach(function (UserAgentContext) {
    var arrayElementIndex = combineWithDefaults(UserAgentContext, 2),
      userAgentString = arrayElementIndex[0],
      combineConfigurations = arrayElementIndex[1];
    HttpStatusCodeMap[combineConfigurations] = userAgentString;
  });
  var httpStatusCodeMapping = HttpStatusCodeMap;
  var initializeHttpClient = function UserAgentContext(arrayElementIndex) {
    var userAgentString = new HttpRequestInterceptor(arrayElementIndex),
      combineConfigurations = baseURLResolver(HttpRequestInterceptor.prototype.request, userAgentString);
    return responseUtilities.extend(combineConfigurations, HttpRequestInterceptor.prototype, userAgentString, {
      allOwnKeys: !0
    }), responseUtilities.extend(combineConfigurations, userAgentString, null, {
      allOwnKeys: !0
    }), combineConfigurations.create = function (userAgentString) {
      return UserAgentContext(mergeRequestOptions(arrayElementIndex, userAgentString));
    }, combineConfigurations;
  }(formDataRequestConfig);
  return initializeHttpClient.Axios = HttpRequestInterceptor, initializeHttpClient.CanceledError = CancellationError, initializeHttpClient.CancelToken = executorFunctionHandler, initializeHttpClient.isCancel = isCancellationToken, initializeHttpClient.VERSION = axiosVersionString, initializeHttpClient.toFormData = combineFormData, initializeHttpClient.AxiosError = HttpError, initializeHttpClient.Cancel = initializeHttpClient.CanceledError, initializeHttpClient.all = function (UserAgentContext) {
    return Promise.all(UserAgentContext);
  }, initializeHttpClient.spread = function (UserAgentContext) {
    return function (arrayElementIndex) {
      return UserAgentContext.apply(null, arrayElementIndex);
    };
  }, initializeHttpClient.isAxiosError = function (UserAgentContext) {
    return responseUtilities.isObject(UserAgentContext) && !0 === UserAgentContext.isAxiosError;
  }, initializeHttpClient.mergeConfig = mergeRequestOptions, initializeHttpClient.AxiosHeaders = headerManagerInstance, initializeHttpClient.formToJSON = function (UserAgentContext) {
    return processElementInArray(responseUtilities.isHTMLForm(UserAgentContext) ? new FormData(UserAgentContext) : UserAgentContext);
  }, initializeHttpClient.getAdapter = retrieveAdapter, initializeHttpClient.HttpStatusCode = httpStatusCodeMapping, initializeHttpClient.default = initializeHttpClient, initializeHttpClient;
});