(function (__globalContext, axiosLibrary) {
  if (typeof exports == "object" && typeof module != "undefined") {
    module.exports = axiosLibrary();
  } else if (typeof define == "function" && define.amd) {
    define(axiosLibrary);
  } else {
    (__globalContext =
      typeof globalThis != "undefined"
        ? globalThis
        : __globalContext || self).axios = axiosLibrary();
  }
})(this, function () {
  "use strict";

  function getType(____________inputValue) {
    if (typeof Symbol == "function" && typeof Symbol.iterator == "symbol") {
      getType = function (____inputParameter) {
        return typeof ____inputParameter;
      };
    } else {
      getType = function (__________________inputValue) {
        if (
          __________________inputValue &&
          typeof Symbol == "function" &&
          __________________inputValue.constructor === Symbol &&
          __________________inputValue !== Symbol.prototype
        ) {
          return "symbol";
        } else {
          return typeof __________________inputValue;
        }
      };
    }
    return getType(____________inputValue);
  }
  function parserOption(instanceToCheck, classConstructor) {
    if (!(instanceToCheck instanceof classConstructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function __targetObject(_____targetObject, propertiesArray) {
    for (var index = 0; index < propertiesArray.length; index++) {
      var ____propertyDescriptor = propertiesArray[index];
      ____propertyDescriptor.enumerable =
        ____propertyDescriptor.enumerable || false;
      ____propertyDescriptor.configurable = true;
      if ("value" in ____propertyDescriptor) {
        ____propertyDescriptor.writable = true;
      }
      Object.defineProperty(
        _____targetObject,
        ____propertyDescriptor.key,
        ____propertyDescriptor,
      );
    }
  }
  function _propertyCount(
    targetedFunction,
    targetPrototype,
    _______targetObject,
  ) {
    if (targetPrototype) {
      __targetObject(targetedFunction.prototype, targetPrototype);
    }
    if (_______targetObject) {
      __targetObject(targetedFunction, _______targetObject);
    }
    Object.defineProperty(targetedFunction, "prototype", {
      writable: false,
    });
    return targetedFunction;
  }
  function iterateOverItems(_inputValue, count) {
    return (
      (function (_____inputArray) {
        if (Array.isArray(_____inputArray)) {
          return _____inputArray;
        }
      })(_inputValue) ||
      (function (iterable, iteratorLimit) {
        var iteratorMethod =
          iterable == null
            ? null
            : (typeof Symbol != "undefined" && iterable[Symbol.iterator]) ||
              iterable["@@iterator"];
        if (iteratorMethod == null) {
          return;
        }
        var _iteratorResult;
        var caughtError;
        var accumulatedValues = [];
        var isDone = true;
        var hasErrorOccurred = false;
        try {
          for (
            iteratorMethod = iteratorMethod.call(iterable);
            !(isDone = (_iteratorResult = iteratorMethod.next()).done) &&
            (accumulatedValues.push(_iteratorResult.value),
            !iteratorLimit || accumulatedValues.length !== iteratorLimit);
            isDone = true
          ) {}
        } catch (_____error) {
          hasErrorOccurred = true;
          caughtError = _____error;
        } finally {
          try {
            if (!isDone && iteratorMethod.return != null) {
              iteratorMethod.return();
            }
          } finally {
            if (hasErrorOccurred) {
              throw caughtError;
            }
          }
        }
        return accumulatedValues;
      })(_inputValue, count) ||
      (function (_________inputValue, _inputParameter) {
        if (!_________inputValue) {
          return;
        }
        if (typeof _________inputValue == "string") {
          return optionKeyIndex(_________inputValue, _inputParameter);
        }
        var inputTypeName = Object.prototype.toString
          .call(_________inputValue)
          .slice(8, -1);
        if (inputTypeName === "Object" && _________inputValue.constructor) {
          inputTypeName = _________inputValue.constructor.name;
        }
        if (inputTypeName === "Map" || inputTypeName === "Set") {
          return Array.from(_________inputValue);
        }
        if (
          inputTypeName === "Arguments" ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(inputTypeName)
        ) {
          return optionKeyIndex(_________inputValue, _inputParameter);
        }
      })(_inputValue, count) ||
      (function () {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function optionKeyIndex(optionsArray, optionCount) {
    if (optionCount == null || optionCount > optionsArray.length) {
      optionCount = optionsArray.length;
    }
    var selectedOptionIndex = 0;
    for (
      var optionsSelectedArray = new Array(optionCount);
      selectedOptionIndex < optionCount;
      selectedOptionIndex++
    ) {
      optionsSelectedArray[selectedOptionIndex] =
        optionsArray[selectedOptionIndex];
    }
    return optionsSelectedArray;
  }
  function headerString(contextFunction, context) {
    return function () {
      return contextFunction.apply(context, arguments);
    };
  }
  var objectTypeMap;
  var objectToString = Object.prototype.toString;
  var getPrototypeOfObject = Object.getPrototypeOf;
  objectTypeMap = Object.create(null);
  function getObjectType(____________________________inputValue) {
    var objectTypeString = objectToString.call(
      ____________________________inputValue,
    );
    return (objectTypeMap[objectTypeString] ||= objectTypeString
      .slice(8, -1)
      .toLowerCase());
  }
  function createLowerCaseMatcher(targetString) {
    targetString = targetString.toLowerCase();
    return function (_____inputParameter) {
      return getObjectType(_____inputParameter) === targetString;
    };
  }
  function _currentInterceptorIndex(_expectedType) {
    return function (_____________________________________inputValue) {
      return (
        getType(_____________________________________inputValue) ===
        _expectedType
      );
    };
  }
  var isArray = Array.isArray;
  var isUndefined = _currentInterceptorIndex("undefined");
  var checkIsArrayBuffer = createLowerCaseMatcher("ArrayBuffer");
  var isStringType = _currentInterceptorIndex("string");
  var isExpectedTypeFunction = _currentInterceptorIndex("function");
  var isNumberType = _currentInterceptorIndex("number");
  function isInputValueObject(__________________________________inputValue) {
    return (
      __________________________________inputValue !== null &&
      getType(__________________________________inputValue) === "object"
    );
  }
  function isPlainObject(______________inputValue) {
    if (getObjectType(______________inputValue) !== "object") {
      return false;
    }
    var _prototypeObject = getPrototypeOfObject(______________inputValue);
    return (
      (_prototypeObject === null ||
        _prototypeObject === Object.prototype ||
        Object.getPrototypeOf(_prototypeObject) === null) &&
      !(Symbol.toStringTag in ______________inputValue) &&
      !(Symbol.iterator in ______________inputValue)
    );
  }
  var isDateType = createLowerCaseMatcher("Date");
  var createLowerCaseFileMatcher = createLowerCaseMatcher("File");
  var createLowerCaseBlobMatcher = createLowerCaseMatcher("Blob");
  var createLowerCaseMatcherForFileList = createLowerCaseMatcher("FileList");
  var createURLSearchParamsMatcher = createLowerCaseMatcher("URLSearchParams");
  function processCollection(inputCollection, callbackFunction) {
    var _propertyIndex;
    var inputCollectionLength;
    var allOwnKeys = (
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
    ).allOwnKeys;
    var includeOwnPropertyKeys = allOwnKeys !== undefined && allOwnKeys;
    if (inputCollection != null) {
      if (getType(inputCollection) !== "object") {
        inputCollection = [inputCollection];
      }
      if (isArray(inputCollection)) {
        _propertyIndex = 0;
        inputCollectionLength = inputCollection.length;
        for (; _propertyIndex < inputCollectionLength; _propertyIndex++) {
          callbackFunction.call(
            null,
            inputCollection[_propertyIndex],
            _propertyIndex,
            inputCollection,
          );
        }
      } else {
        var propertyName;
        var propertyNames = includeOwnPropertyKeys
          ? Object.getOwnPropertyNames(inputCollection)
          : Object.keys(inputCollection);
        var __propertyCount = propertyNames.length;
        for (
          _propertyIndex = 0;
          _propertyIndex < __propertyCount;
          _propertyIndex++
        ) {
          propertyName = propertyNames[_propertyIndex];
          callbackFunction.call(
            null,
            inputCollection[propertyName],
            propertyName,
            inputCollection,
          );
        }
      }
    }
  }
  function findMatchingKey(___inputObject, searchString) {
    searchString = searchString.toLowerCase();
    var ____currentKey;
    var inputObjectKeys = Object.keys(___inputObject);
    for (var reverseIndex = inputObjectKeys.length; reverseIndex-- > 0; ) {
      if (
        searchString ===
        (____currentKey = inputObjectKeys[reverseIndex]).toLowerCase()
      ) {
        return ____currentKey;
      }
    }
    return null;
  }
  var globalContext =
    typeof globalThis != "undefined"
      ? globalThis
      : typeof self != "undefined"
        ? self
        : typeof window != "undefined"
          ? window
          : global;
  function isInputValueValid(____________________________________inputValue) {
    return (
      !isUndefined(____________________________________inputValue) &&
      ____________________________________inputValue !== globalContext
    );
  }
  var isUint8ArrayDefined;
  isUint8ArrayDefined =
    typeof Uint8Array != "undefined" && getPrototypeOfObject(Uint8Array);
  function isValidUint8Array(uint8Array) {
    return isUint8ArrayDefined && uint8Array instanceof isUint8ArrayDefined;
  }
  var isHTMLFormElement = createLowerCaseMatcher("HTMLFormElement");
  var hasOwnPropertyCheck = (function () {
    var hasOwnPropertyMethod = Object.prototype.hasOwnProperty;
    return function (objectWithOwnProperty, _____propertyName) {
      return hasOwnPropertyMethod.call(
        objectWithOwnProperty,
        _____propertyName,
      );
    };
  })();
  var lowerCaseMatcher = createLowerCaseMatcher("RegExp");
  function definePropertiesWithDescriptors(
    ______targetObject,
    propertyDescriptorCallback,
  ) {
    var _propertyDescriptors =
      Object.getOwnPropertyDescriptors(______targetObject);
    var propertyDescriptorsMap = {};
    processCollection(
      _propertyDescriptors,
      function (propertyDescriptorKey, ___propertyDescriptor) {
        var propertyCallbackResult;
        if (
          (propertyCallbackResult = propertyDescriptorCallback(
            propertyDescriptorKey,
            ___propertyDescriptor,
            ______targetObject,
          )) !== false
        ) {
          propertyDescriptorsMap[___propertyDescriptor] =
            propertyCallbackResult || propertyDescriptorKey;
        }
      },
    );
    Object.defineProperties(______targetObject, propertyDescriptorsMap);
  }
  var alphabetLowercase = "abcdefghijklmnopqrstuvwxyz";
  var numericCharacterSet = "0123456789";
  var characterSets = {
    DIGIT: numericCharacterSet,
    ALPHA: alphabetLowercase,
    ALPHA_DIGIT:
      alphabetLowercase + alphabetLowercase.toUpperCase() + numericCharacterSet,
  };
  var isAsyncFunction = createLowerCaseMatcher("AsyncFunction");
  var utilityFunctions = {
    isArray: isArray,
    isArrayBuffer: checkIsArrayBuffer,
    isBuffer: function (_____________________inputValue) {
      return (
        _____________________inputValue !== null &&
        !isUndefined(_____________________inputValue) &&
        _____________________inputValue.constructor !== null &&
        !isUndefined(_____________________inputValue.constructor) &&
        isExpectedTypeFunction(
          _____________________inputValue.constructor.isBuffer,
        ) &&
        _____________________inputValue.constructor.isBuffer(
          _____________________inputValue,
        )
      );
    },
    isFormData: function (_formData) {
      var formDataType;
      return (
        _formData &&
        ((typeof FormData == "function" && _formData instanceof FormData) ||
          (isExpectedTypeFunction(_formData.append) &&
            ((formDataType = getObjectType(_formData)) === "formdata" ||
              (formDataType === "object" &&
                isExpectedTypeFunction(_formData.toString) &&
                _formData.toString() === "[object FormData]"))))
      );
    },
    isArrayBufferView: function (inputArrayBuffer) {
      if (typeof ArrayBuffer != "undefined" && ArrayBuffer.isView) {
        return ArrayBuffer.isView(inputArrayBuffer);
      } else {
        return (
          inputArrayBuffer &&
          inputArrayBuffer.buffer &&
          checkIsArrayBuffer(inputArrayBuffer.buffer)
        );
      }
    },
    isString: isStringType,
    isNumber: isNumberType,
    isBoolean: function (booleanValue) {
      return booleanValue === true || booleanValue === false;
    },
    isObject: isInputValueObject,
    isPlainObject: isPlainObject,
    isUndefined: isUndefined,
    isDate: isDateType,
    isFile: createLowerCaseFileMatcher,
    isBlob: createLowerCaseBlobMatcher,
    isRegExp: lowerCaseMatcher,
    isFunction: isExpectedTypeFunction,
    isStream: function (___________event) {
      return (
        isInputValueObject(___________event) &&
        isExpectedTypeFunction(___________event.pipe)
      );
    },
    isURLSearchParams: createURLSearchParamsMatcher,
    isTypedArray: isValidUint8Array,
    isFileList: createLowerCaseMatcherForFileList,
    forEach: processCollection,
    merge: function mergeObjects() {
      var _isCaseless = ((isInputValueValid(this) && this) || {}).caseless;
      var mergedObjects = {};
      var mergeInputData = function (_____inputData, _inputObject) {
        var matchingKey =
          (_isCaseless && findMatchingKey(mergedObjects, _inputObject)) ||
          _inputObject;
        if (
          isPlainObject(mergedObjects[matchingKey]) &&
          isPlainObject(_____inputData)
        ) {
          mergedObjects[matchingKey] = mergeObjects(
            mergedObjects[matchingKey],
            _____inputData,
          );
        } else if (isPlainObject(_____inputData)) {
          mergedObjects[matchingKey] = mergeObjects({}, _____inputData);
        } else if (isArray(_____inputData)) {
          mergedObjects[matchingKey] = _____inputData.slice();
        } else {
          mergedObjects[matchingKey] = _____inputData;
        }
      };
      var ____argumentIndex = 0;
      for (
        var _argumentsLength = arguments.length;
        ____argumentIndex < _argumentsLength;
        ____argumentIndex++
      ) {
        if (arguments[____argumentIndex]) {
          processCollection(arguments[____argumentIndex], mergeInputData);
        }
      }
      return mergedObjects;
    },
    extend: function (headersMap, targetValue, ___headerValue) {
      processCollection(
        targetValue,
        function (headerValueOrDefault, responseHeaderKey) {
          if (___headerValue && isExpectedTypeFunction(headerValueOrDefault)) {
            headersMap[responseHeaderKey] = headerString(
              headerValueOrDefault,
              ___headerValue,
            );
          } else {
            headersMap[responseHeaderKey] = headerValueOrDefault;
          }
        },
        {
          allOwnKeys: (arguments.length > 3 && arguments[3] !== undefined
            ? arguments[3]
            : {}
          ).allOwnKeys,
        },
      );
      return headersMap;
    },
    trim: function (________inputString) {
      if (________inputString.trim) {
        return ________inputString.trim();
      } else {
        return ________inputString.replace(
          /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
          "",
        );
      }
    },
    stripBOM: function (____________inputString) {
      if (____________inputString.charCodeAt(0) === 65279) {
        ____________inputString = ____________inputString.slice(1);
      }
      return ____________inputString;
    },
    inherits: function (
      childClass,
      parentConstructor,
      additionalProperties,
      propertyDescriptors,
    ) {
      childClass.prototype = Object.create(
        parentConstructor.prototype,
        propertyDescriptors,
      );
      childClass.prototype.constructor = childClass;
      Object.defineProperty(childClass, "super", {
        value: parentConstructor.prototype,
      });
      if (additionalProperties) {
        Object.assign(childClass.prototype, additionalProperties);
      }
    },
    toFlatObject: function (
      _sourceObject,
      _targetObject,
      prototypeChain,
      propertyFilter,
    ) {
      var _propertyNames;
      var propertyCount;
      var _propertyName;
      var processedProperties = {};
      _targetObject = _targetObject || {};
      if (_sourceObject == null) {
        return _targetObject;
      }
      do {
        for (
          propertyCount = (_propertyNames =
            Object.getOwnPropertyNames(_sourceObject)).length;
          propertyCount-- > 0;

        ) {
          _propertyName = _propertyNames[propertyCount];
          if (
            (!propertyFilter ||
              !!propertyFilter(_propertyName, _sourceObject, _targetObject)) &&
            !processedProperties[_propertyName]
          ) {
            _targetObject[_propertyName] = _sourceObject[_propertyName];
            processedProperties[_propertyName] = true;
          }
        }
        _sourceObject =
          prototypeChain !== false && getPrototypeOfObject(_sourceObject);
      } while (
        _sourceObject &&
        (!prototypeChain || prototypeChain(_sourceObject, _targetObject)) &&
        _sourceObject !== Object.prototype
      );
      return _targetObject;
    },
    kindOf: getObjectType,
    kindOfTest: createLowerCaseMatcher,
    endsWith: function (_____inputString, substringToFind, startingIndex) {
      _____inputString = String(_____inputString);
      if (
        startingIndex === undefined ||
        startingIndex > _____inputString.length
      ) {
        startingIndex = _____inputString.length;
      }
      startingIndex -= substringToFind.length;
      var indexOfSubstringAtAdjustedIndex = _____inputString.indexOf(
        substringToFind,
        startingIndex,
      );
      return (
        indexOfSubstringAtAdjustedIndex !== -1 &&
        indexOfSubstringAtAdjustedIndex === startingIndex
      );
    },
    toArray: function (_inputArray) {
      if (!_inputArray) {
        return null;
      }
      if (isArray(_inputArray)) {
        return _inputArray;
      }
      var elementLength = _inputArray.length;
      if (!isNumberType(elementLength)) {
        return null;
      }
      var copiedArray = new Array(elementLength);
      while (elementLength-- > 0) {
        copiedArray[elementLength] = _inputArray[elementLength];
      }
      return copiedArray;
    },
    forEachEntry: function (iterableCollection, ___callbackFunction) {
      var iteratorResult;
      for (
        var iterator = (
          iterableCollection && iterableCollection[Symbol.iterator]
        ).call(iterableCollection);
        (iteratorResult = iterator.next()) && !iteratorResult.done;

      ) {
        var _currentItem = iteratorResult.value;
        ___callbackFunction.call(
          iterableCollection,
          _currentItem[0],
          _currentItem[1],
        );
      }
    },
    matchAll: function (regexMatcher, __________inputString) {
      var matchedPattern;
      for (
        var _matchedPatterns = [];
        (matchedPattern = regexMatcher.exec(__________inputString)) !== null;

      ) {
        _matchedPatterns.push(matchedPattern);
      }
      return _matchedPatterns;
    },
    isHTMLForm: isHTMLFormElement,
    hasOwnProperty: hasOwnPropertyCheck,
    hasOwnProp: hasOwnPropertyCheck,
    reduceDescriptors: definePropertiesWithDescriptors,
    freezeMethods: function (inputObject) {
      definePropertiesWithDescriptors(
        inputObject,
        function (propertyDescriptor, __propertyName) {
          if (
            isExpectedTypeFunction(inputObject) &&
            ["arguments", "caller", "callee"].indexOf(__propertyName) !== -1
          ) {
            return false;
          }
          var propertyValue = inputObject[__propertyName];
          if (isExpectedTypeFunction(propertyValue)) {
            propertyDescriptor.enumerable = false;
            if ("writable" in propertyDescriptor) {
              propertyDescriptor.writable = false;
            } else {
              propertyDescriptor.set ||= function () {
                throw Error(
                  "Can not rewrite read-only method '" + __propertyName + "'",
                );
              };
            }
          }
        },
      );
    },
    toObjectSet: function (___inputArray, _delimiter) {
      var uniqueValuesMap = {};
      function collectUniqueValues(arrayElement) {
        arrayElement.forEach(function (uniqueValueKey) {
          uniqueValuesMap[uniqueValueKey] = true;
        });
      }
      if (isArray(___inputArray)) {
        collectUniqueValues(___inputArray);
      } else {
        collectUniqueValues(String(___inputArray).split(_delimiter));
      }
      return uniqueValuesMap;
    },
    toCamelCase: function (_________inputString) {
      return _________inputString
        .toLowerCase()
        .replace(
          /[-_\s]([a-z\d])(\w*)/g,
          function (_eventParameter, textParameter, additionalString) {
            return textParameter.toUpperCase() + additionalString;
          },
        );
    },
    noop: function () {},
    toFiniteNumber: function (
      ________________________inputValue,
      fallbackValue,
    ) {
      ________________________inputValue = +________________________inputValue;
      if (Number.isFinite(________________________inputValue)) {
        return ________________________inputValue;
      } else {
        return fallbackValue;
      }
    },
    findKey: findMatchingKey,
    global: globalContext,
    isContextDefined: isInputValueValid,
    ALPHABET: characterSets,
    generateString: function () {
      var lengthOrDefault =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;
      var characterSet =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : characterSets.ALPHA_DIGIT;
      var randomString = "";
      for (var characterSetLength = characterSet.length; lengthOrDefault--; ) {
        randomString += characterSet[(Math.random() * characterSetLength) | 0];
      }
      return randomString;
    },
    isSpecCompliantForm: function (__formData) {
      return (
        !!__formData &&
        !!isExpectedTypeFunction(__formData.append) &&
        __formData[Symbol.toStringTag] === "FormData" &&
        !!__formData[Symbol.iterator]
      );
    },
    toJSONObject: function (___inputValue) {
      var nestedArray = new Array(10);
      return (function transformData(__________inputValue, depthLevel) {
        if (isInputValueObject(__________inputValue)) {
          if (nestedArray.indexOf(__________inputValue) >= 0) {
            return;
          }
          if (!("toJSON" in __________inputValue)) {
            nestedArray[depthLevel] = __________inputValue;
            var outputObject = isArray(__________inputValue) ? [] : {};
            processCollection(
              __________inputValue,
              function (____inputData, outputKey) {
                var transformedData = transformData(
                  ____inputData,
                  depthLevel + 1,
                );
                if (!isUndefined(transformedData)) {
                  outputObject[outputKey] = transformedData;
                }
              },
            );
            nestedArray[depthLevel] = undefined;
            return outputObject;
          }
        }
        return __________inputValue;
      })(___inputValue, 0);
    },
    isAsyncFn: isAsyncFunction,
    isThenable: function (_______event) {
      return (
        _______event &&
        (isInputValueObject(_______event) ||
          isExpectedTypeFunction(_______event)) &&
        isExpectedTypeFunction(_______event.then) &&
        isExpectedTypeFunction(_______event.catch)
      );
    },
  };
  function createAxiosError(
    errorMessage,
    errorCode,
    __requestConfig,
    requestPayload,
    responseData,
  ) {
    Error.call(this);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
    this.message = errorMessage;
    this.name = "AxiosError";
    if (errorCode) {
      this.code = errorCode;
    }
    if (__requestConfig) {
      this.config = __requestConfig;
    }
    if (requestPayload) {
      this.request = requestPayload;
    }
    if (responseData) {
      this.response = responseData;
    }
  }
  utilityFunctions.inherits(createAxiosError, Error, {
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
        status:
          this.response && this.response.status ? this.response.status : null,
      };
    },
  });
  var createAxiosErrorPrototype = createAxiosError.prototype;
  var axiosErrorCodes = {};
  [
    "ERR_BAD_OPTION_VALUE",
    "ERR_BAD_OPTION",
    "ECONNABORTED",
    "ETIMEDOUT",
    "ERR_NETWORK",
    "ERR_FR_TOO_MANY_REDIRECTS",
    "ERR_DEPRECATED",
    "ERR_BAD_RESPONSE",
    "ERR_BAD_REQUEST",
    "ERR_CANCELED",
    "ERR_NOT_SUPPORT",
    "ERR_INVALID_URL",
  ].forEach(function (__errorCode) {
    axiosErrorCodes[__errorCode] = {
      value: __errorCode,
    };
  });
  Object.defineProperties(createAxiosError, axiosErrorCodes);
  Object.defineProperty(createAxiosErrorPrototype, "isAxiosError", {
    value: true,
  });
  createAxiosError.from = function (
    error,
    errorDetails,
    _errorCode,
    axiosErrorInstance,
    axiosErrorConfig,
    errorProperties,
  ) {
    var errorObjectPrototype = Object.create(createAxiosErrorPrototype);
    utilityFunctions.toFlatObject(
      error,
      errorObjectPrototype,
      function (_errorObject) {
        return _errorObject !== Error.prototype;
      },
      function (errorType) {
        return errorType !== "isAxiosError";
      },
    );
    createAxiosError.call(
      errorObjectPrototype,
      error.message,
      errorDetails,
      _errorCode,
      axiosErrorInstance,
      axiosErrorConfig,
    );
    errorObjectPrototype.cause = error;
    errorObjectPrototype.name = error.name;
    if (errorProperties) {
      Object.assign(errorObjectPrototype, errorProperties);
    }
    return errorObjectPrototype;
  };
  function isPlainObjectOrArray(_________________________________inputValue) {
    return (
      utilityFunctions.isPlainObject(
        _________________________________inputValue,
      ) || utilityFunctions.isArray(_________________________________inputValue)
    );
  }
  function removeArrayBracketsIfExists(___________inputString) {
    if (utilityFunctions.endsWith(___________inputString, "[]")) {
      return ___________inputString.slice(0, -2);
    } else {
      return ___________inputString;
    }
  }
  function concatArrayWithDelimiter(
    arrayToConcat,
    additionalElement,
    delimiter,
  ) {
    if (arrayToConcat) {
      return arrayToConcat
        .concat(additionalElement)
        .map(function (______________________inputValue, delimiterCondition) {
          ______________________inputValue = removeArrayBracketsIfExists(
            ______________________inputValue,
          );
          if (!delimiter && delimiterCondition) {
            return "[" + ______________________inputValue + "]";
          } else {
            return ______________________inputValue;
          }
        })
        .join(delimiter ? "." : "");
    } else {
      return additionalElement;
    }
  }
  var _utilityFunctions = utilityFunctions.toFlatObject(
    utilityFunctions,
    {},
    null,
    function (_____________inputString) {
      return /^is[A-Z]/.test(_____________inputString);
    },
  );
  function _processFormData(targetObject, formDataInstance, options) {
    if (!utilityFunctions.isObject(targetObject)) {
      throw new TypeError("target must be an object");
    }
    formDataInstance = formDataInstance || new FormData();
    var metaTokens = (options = utilityFunctions.toFlatObject(
      options,
      {
        metaTokens: true,
        dots: false,
        indexes: false,
      },
      false,
      function (key, _propertyValue) {
        return !utilityFunctions.isUndefined(_propertyValue[key]);
      },
    )).metaTokens;
    var ____index = options.visitor || processInputData;
    var shouldIncludeDots = options.dots;
    var isIndexArray = options.indexes;
    var isBlobSupported =
      (options.Blob || (typeof Blob != "undefined" && Blob)) &&
      utilityFunctions.isSpecCompliantForm(formDataInstance);
    if (!utilityFunctions.isFunction(____index)) {
      throw new TypeError("visitor must be a function");
    }
    function _processInputValue(________inputValue) {
      if (________inputValue === null) {
        return "";
      }
      if (utilityFunctions.isDate(________inputValue)) {
        return ________inputValue.toISOString();
      }
      if (!isBlobSupported && utilityFunctions.isBlob(________inputValue)) {
        throw new createAxiosError(
          "Blob is not supported. Use a Buffer instead.",
        );
      }
      if (
        utilityFunctions.isArrayBuffer(________inputValue) ||
        utilityFunctions.isTypedArray(________inputValue)
      ) {
        if (isBlobSupported && typeof Blob == "function") {
          return new Blob([________inputValue]);
        } else {
          return Buffer.from(________inputValue);
        }
      } else {
        return ________inputValue;
      }
    }
    function processInputData(_inputData, resourceName, __inputValue) {
      var _______inputData = _inputData;
      if (_inputData && !__inputValue && getType(_inputData) === "object") {
        if (utilityFunctions.endsWith(resourceName, "{}")) {
          if (metaTokens) {
            resourceName = resourceName;
          } else {
            resourceName = resourceName.slice(0, -2);
          }
          _inputData = JSON.stringify(_inputData);
        } else if (
          (utilityFunctions.isArray(_inputData) &&
            (function (______inputArray) {
              return (
                utilityFunctions.isArray(______inputArray) &&
                !______inputArray.some(isPlainObjectOrArray)
              );
            })(_inputData)) ||
          ((utilityFunctions.isFileList(_inputData) ||
            utilityFunctions.endsWith(resourceName, "[]")) &&
            (_______inputData = utilityFunctions.toArray(_inputData)))
        ) {
          resourceName = removeArrayBracketsIfExists(resourceName);
          _______inputData.forEach(function (_____event, formDataField) {
            if (
              !utilityFunctions.isUndefined(_____event) &&
              _____event !== null
            ) {
              formDataInstance.append(
                isIndexArray === true
                  ? concatArrayWithDelimiter(
                      [resourceName],
                      formDataField,
                      shouldIncludeDots,
                    )
                  : isIndexArray === null
                    ? resourceName
                    : resourceName + "[]",
                _processInputValue(_____event),
              );
            }
          });
          return false;
        }
      }
      return (
        !!isPlainObjectOrArray(_inputData) ||
        (formDataInstance.append(
          concatArrayWithDelimiter(
            __inputValue,
            resourceName,
            shouldIncludeDots,
          ),
          _processInputValue(_inputData),
        ),
        false)
      );
    }
    var visitedItems = [];
    var utilityFunctionsMapping = Object.assign(_utilityFunctions, {
      defaultVisitor: processInputData,
      convertValue: _processInputValue,
      isVisitable: isPlainObjectOrArray,
    });
    if (!utilityFunctions.isObject(targetObject)) {
      throw new TypeError("data must be an object");
    }
    (function detectCircularReference(currentItem, referencePath) {
      if (!utilityFunctions.isUndefined(currentItem)) {
        if (visitedItems.indexOf(currentItem) !== -1) {
          throw Error(
            "Circular reference detected in " + referencePath.join("."),
          );
        }
        visitedItems.push(currentItem);
        utilityFunctions.forEach(
          currentItem,
          function (formDataValue, valueOrDefault) {
            if (
              (!utilityFunctions.isUndefined(formDataValue) &&
                formDataValue !== null &&
                ____index.call(
                  formDataInstance,
                  formDataValue,
                  utilityFunctions.isString(valueOrDefault)
                    ? valueOrDefault.trim()
                    : valueOrDefault,
                  referencePath,
                  utilityFunctionsMapping,
                )) === true
            ) {
              detectCircularReference(
                formDataValue,
                referencePath
                  ? referencePath.concat(valueOrDefault)
                  : [valueOrDefault],
              );
            }
          },
        );
        visitedItems.pop();
      }
    })(targetObject);
    return formDataInstance;
  }
  function encodeURIComponentWithMapping(__inputString) {
    var characterToEncodingMap = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0",
    };
    return encodeURIComponent(__inputString).replace(
      /[!'()~]|%20|%00/g,
      function (__propertyIndex) {
        return characterToEncodingMap[__propertyIndex];
      },
    );
  }
  function handleEvent(_eventData, contextParameter) {
    this._pairs = [];
    if (_eventData) {
      _processFormData(_eventData, this, contextParameter);
    }
  }
  var handleEventPrototype = handleEvent.prototype;
  function encodeUriComponentWithFormatting(______inputString) {
    return encodeURIComponent(______inputString)
      .replace(/%3A/gi, ":")
      .replace(/%24/g, "$")
      .replace(/%2C/gi, ",")
      .replace(/%20/g, "+")
      .replace(/%5B/gi, "[")
      .replace(/%5D/gi, "]");
  }
  function constructUrlWithParams(baseUrl, queryString, urlParams) {
    if (!queryString) {
      return baseUrl;
    }
    var formattedQueryString;
    var urlEncoder =
      (urlParams && urlParams.encode) || encodeUriComponentWithFormatting;
    var serializeQueryParamsFunction = urlParams && urlParams.serialize;
    if (
      (formattedQueryString = serializeQueryParamsFunction
        ? serializeQueryParamsFunction(queryString, urlParams)
        : utilityFunctions.isURLSearchParams(queryString)
          ? queryString.toString()
          : new handleEvent(queryString, urlParams).toString(urlEncoder))
    ) {
      var hashIndex = baseUrl.indexOf("#");
      if (hashIndex !== -1) {
        baseUrl = baseUrl.slice(0, hashIndex);
      }
      baseUrl +=
        (baseUrl.indexOf("?") === -1 ? "?" : "&") + formattedQueryString;
    }
    return baseUrl;
  }
  handleEventPrototype.append = function (firstValue, __value) {
    this._pairs.push([firstValue, __value]);
  };
  handleEventPrototype.toString = function (encodeURIComponentCallback) {
    var encodeParameter = encodeURIComponentCallback
      ? function (___________________________________inputValue) {
          return encodeURIComponentCallback.call(
            this,
            ___________________________________inputValue,
            encodeURIComponentWithMapping,
          );
        }
      : encodeURIComponentWithMapping;
    return this._pairs
      .map(function (parameterPair) {
        return (
          encodeParameter(parameterPair[0]) +
          "=" +
          encodeParameter(parameterPair[1])
        );
      }, "")
      .join("&");
  };
  var typeOfVariable;
  var requestInterceptor = (function () {
    function __parserFunction() {
      parserOption(this, __parserFunction);
      this.handlers = [];
    }
    _propertyCount(__parserFunction, [
      {
        key: "use",
        value: function (fulfilledHandler, rejectedHandler, handlerOptions) {
          this.handlers.push({
            fulfilled: fulfilledHandler,
            rejected: rejectedHandler,
            synchronous: !!handlerOptions && handlerOptions.synchronous,
            runWhen: handlerOptions ? handlerOptions.runWhen : null,
          });
          return this.handlers.length - 1;
        },
      },
      {
        key: "eject",
        value: function (eventType) {
          this.handlers[eventType] &&= null;
        },
      },
      {
        key: "clear",
        value: function () {
          this.handlers &&= [];
        },
      },
      {
        key: "forEach",
        value: function (handlerCallback) {
          utilityFunctions.forEach(this.handlers, function (___inputParameter) {
            if (___inputParameter !== null) {
              handlerCallback(___inputParameter);
            }
          });
        },
      },
    ]);
    return __parserFunction;
  })();
  var requestConfigOptions = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false,
  };
  var environmentConfig = {
    isBrowser: true,
    classes: {
      URLSearchParams:
        typeof URLSearchParams != "undefined" ? URLSearchParams : handleEvent,
      FormData: typeof FormData != "undefined" ? FormData : null,
      Blob: typeof Blob != "undefined" ? Blob : null,
    },
    isStandardBrowserEnv:
      (typeof navigator == "undefined" ||
        ((typeOfVariable = navigator.product) !== "ReactNative" &&
          typeOfVariable !== "NativeScript" &&
          typeOfVariable !== "NS")) &&
      typeof window != "undefined" &&
      typeof document != "undefined",
    isStandardBrowserWebWorkerEnv:
      typeof WorkerGlobalScope != "undefined" &&
      self instanceof WorkerGlobalScope &&
      typeof self.importScripts == "function",
    protocols: ["http", "https", "file", "blob", "url", "data"],
  };
  function processFormData(formData) {
    function ___currentKey(inputArray, valueIndex, resultArray, currentIndex) {
      var currentElement = inputArray[currentIndex++];
      var isFiniteValue = Number.isFinite(+currentElement);
      var isAtEndOfInputArray = currentIndex >= inputArray.length;
      if (!currentElement && utilityFunctions.isArray(resultArray)) {
        currentElement = resultArray.length;
      } else {
        currentElement = currentElement;
      }
      if (isAtEndOfInputArray) {
        if (utilityFunctions.hasOwnProp(resultArray, currentElement)) {
          resultArray[currentElement] = [
            resultArray[currentElement],
            valueIndex,
          ];
        } else {
          resultArray[currentElement] = valueIndex;
        }
        return !isFiniteValue;
      } else {
        if (
          !resultArray[currentElement] ||
          !utilityFunctions.isObject(resultArray[currentElement])
        ) {
          resultArray[currentElement] = [];
        }
        if (
          ___currentKey(
            inputArray,
            valueIndex,
            resultArray[currentElement],
            currentIndex,
          ) &&
          utilityFunctions.isArray(resultArray[currentElement])
        ) {
          resultArray[currentElement] = (function (__inputObject) {
            var _index;
            var currentKey;
            var mappedObject = {};
            var objectKeys = Object.keys(__inputObject);
            var _keysCount = objectKeys.length;
            for (_index = 0; _index < _keysCount; _index++) {
              mappedObject[(currentKey = objectKeys[_index])] =
                __inputObject[currentKey];
            }
            return mappedObject;
          })(resultArray[currentElement]);
        }
        return !isFiniteValue;
      }
    }
    if (
      utilityFunctions.isFormData(formData) &&
      utilityFunctions.isFunction(formData.entries)
    ) {
      var formDataMap = {};
      utilityFunctions.forEachEntry(
        formData,
        function (_inputString, matchedPatterns) {
          ___currentKey(
            (function (____inputString) {
              return utilityFunctions
                .matchAll(/\w+|\[(\w*)]/g, ____inputString)
                .map(function (____inputArray) {
                  if (____inputArray[0] === "[]") {
                    return "";
                  } else {
                    return ____inputArray[1] || ____inputArray[0];
                  }
                });
            })(_inputString),
            matchedPatterns,
            formDataMap,
            0,
          );
        },
      );
      return formDataMap;
    }
    return null;
  }
  var axiosRequestConfig = {
    transitional: requestConfigOptions,
    adapter: ["xhr", "http"],
    transformRequest: [
      function (inputData, requestHandler) {
        var isFileList;
        var _contentType = requestHandler.getContentType() || "";
        var isJsonContentType = _contentType.indexOf("application/json") > -1;
        var isInputDataObject = utilityFunctions.isObject(inputData);
        if (isInputDataObject && utilityFunctions.isHTMLForm(inputData)) {
          inputData = new FormData(inputData);
        }
        if (utilityFunctions.isFormData(inputData)) {
          if (isJsonContentType && isJsonContentType) {
            return JSON.stringify(processFormData(inputData));
          } else {
            return inputData;
          }
        }
        if (
          utilityFunctions.isArrayBuffer(inputData) ||
          utilityFunctions.isBuffer(inputData) ||
          utilityFunctions.isStream(inputData) ||
          utilityFunctions.isFile(inputData) ||
          utilityFunctions.isBlob(inputData)
        ) {
          return inputData;
        }
        if (utilityFunctions.isArrayBufferView(inputData)) {
          return inputData.buffer;
        }
        if (utilityFunctions.isURLSearchParams(inputData)) {
          requestHandler.setContentType(
            "application/x-www-form-urlencoded;charset=utf-8",
            false,
          );
          return inputData.toString();
        }
        if (isInputDataObject) {
          if (_contentType.indexOf("application/x-www-form-urlencoded") > -1) {
            return (function (event, additionalParams) {
              return _processFormData(
                event,
                new environmentConfig.classes.URLSearchParams(),
                Object.assign(
                  {
                    visitor: function (
                      __inputData,
                      dataType,
                      ___inputData,
                      defaultVisitorFunction,
                    ) {
                      if (
                        environmentConfig.isNode &&
                        utilityFunctions.isBuffer(__inputData)
                      ) {
                        this.append(dataType, __inputData.toString("base64"));
                        return false;
                      } else {
                        return defaultVisitorFunction.defaultVisitor.apply(
                          this,
                          arguments,
                        );
                      }
                    },
                  },
                  additionalParams,
                ),
              );
            })(inputData, this.formSerializer).toString();
          }
          if (
            (isFileList = utilityFunctions.isFileList(inputData)) ||
            _contentType.indexOf("multipart/form-data") > -1
          ) {
            var formDataEnv = this.env && this.env.FormData;
            return _processFormData(
              isFileList
                ? {
                    "files[]": inputData,
                  }
                : inputData,
              formDataEnv && new formDataEnv(),
              this.formSerializer,
            );
          }
        }
        if (isInputDataObject || isJsonContentType) {
          requestHandler.setContentType("application/json", false);
          return (function (inputString, _parserFunction, jsonStringify) {
            if (utilityFunctions.isString(inputString)) {
              try {
                (_parserFunction || JSON.parse)(inputString);
                return utilityFunctions.trim(inputString);
              } catch (__error) {
                if (__error.name !== "SyntaxError") {
                  throw __error;
                }
              }
            }
            return (jsonStringify || JSON.stringify)(inputString);
          })(inputData);
        } else {
          return inputData;
        }
      },
    ],
    transformResponse: [
      function (jsonString) {
        var transitionalConfig =
          this.transitional || axiosRequestConfig.transitional;
        var isForcedJSONParsing =
          transitionalConfig && transitionalConfig.forcedJSONParsing;
        var isResponseJson = this.responseType === "json";
        if (
          jsonString &&
          utilityFunctions.isString(jsonString) &&
          ((isForcedJSONParsing && !this.responseType) || isResponseJson)
        ) {
          var shouldParseJson =
            (!transitionalConfig || !transitionalConfig.silentJSONParsing) &&
            isResponseJson;
          try {
            return JSON.parse(jsonString);
          } catch (_error) {
            if (shouldParseJson) {
              if (_error.name === "SyntaxError") {
                throw createAxiosError.from(
                  _error,
                  createAxiosError.ERR_BAD_RESPONSE,
                  this,
                  null,
                  this.response,
                );
              }
              throw _error;
            }
          }
        }
        return jsonString;
      },
    ],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: environmentConfig.classes.FormData,
      Blob: environmentConfig.classes.Blob,
    },
    validateStatus: function (httpStatusCode) {
      return httpStatusCode >= 200 && httpStatusCode < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": undefined,
      },
    },
  };
  utilityFunctions.forEach(
    ["delete", "get", "head", "post", "put", "patch"],
    function (__headerKey) {
      axiosRequestConfig.headers[__headerKey] = {};
    },
  );
  var axiosHttpClient = axiosRequestConfig;
  var httpHeadersSet = utilityFunctions.toObjectSet([
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent",
  ]);
  var internalSymbol = Symbol("internals");
  function normalizeInput(________________________________inputValue) {
    return (
      ________________________________inputValue &&
      String(________________________________inputValue).trim().toLowerCase()
    );
  }
  function formatInputValue(____________________inputValue) {
    if (
      ____________________inputValue === false ||
      ____________________inputValue == null
    ) {
      return ____________________inputValue;
    } else if (utilityFunctions.isArray(____________________inputValue)) {
      return ____________________inputValue.map(formatInputValue);
    } else {
      return String(____________________inputValue);
    }
  }
  function evaluateCondition(
    ___________inputValue,
    currentValue,
    indexValue,
    callbackOrPattern,
    shouldUpdateValue,
  ) {
    if (utilityFunctions.isFunction(callbackOrPattern)) {
      return callbackOrPattern.call(this, currentValue, indexValue);
    } else {
      if (shouldUpdateValue) {
        currentValue = indexValue;
      }
      if (utilityFunctions.isString(currentValue)) {
        if (utilityFunctions.isString(callbackOrPattern)) {
          return currentValue.indexOf(callbackOrPattern) !== -1;
        } else if (utilityFunctions.isRegExp(callbackOrPattern)) {
          return callbackOrPattern.test(currentValue);
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
  }
  var axiosHeaderManager = (function () {
    function __currentKey(_____________________________inputValue) {
      parserOption(this, __currentKey);
      if (_____________________________inputValue) {
        this.set(_____________________________inputValue);
      }
    }
    _propertyCount(
      __currentKey,
      [
        {
          key: "set",
          value: function (headerInput, headerName, headerValue) {
            var contextReference = this;
            function validatedHeaderName(
              __headerValue,
              ___headerName,
              isUndefinedOrTrue,
            ) {
              var __headerName = normalizeInput(___headerName);
              if (!__headerName) {
                throw new Error("header name must be a non-empty string");
              }
              var headerNameIndex = utilityFunctions.findKey(
                contextReference,
                __headerName,
              );
              if (
                !headerNameIndex ||
                contextReference[headerNameIndex] === undefined ||
                isUndefinedOrTrue === true ||
                (isUndefinedOrTrue === undefined &&
                  contextReference[headerNameIndex] !== false)
              ) {
                contextReference[headerNameIndex || ___headerName] =
                  formatInputValue(__headerValue);
              }
            }
            var headerKey;
            var _headerName;
            var _headerValue;
            var headerValueIndex;
            var headerValueMap;
            function processValidatedHeaderNames(
              headerEntries,
              headerValidationOptions,
            ) {
              return utilityFunctions.forEach(
                headerEntries,
                function (_____headerName, ______headerName) {
                  return validatedHeaderName(
                    _____headerName,
                    ______headerName,
                    headerValidationOptions,
                  );
                },
              );
            }
            if (
              utilityFunctions.isPlainObject(headerInput) ||
              headerInput instanceof this.constructor
            ) {
              processValidatedHeaderNames(headerInput, headerName);
            } else if (
              utilityFunctions.isString(headerInput) &&
              (headerInput = headerInput.trim()) &&
              !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(headerInput.trim())
            ) {
              processValidatedHeaderNames(
                ((headerValueMap = {}),
                (headerKey = headerInput) &&
                  headerKey.split("\n").forEach(function (headerLine) {
                    headerValueIndex = headerLine.indexOf(":");
                    _headerName = headerLine
                      .substring(0, headerValueIndex)
                      .trim()
                      .toLowerCase();
                    _headerValue = headerLine
                      .substring(headerValueIndex + 1)
                      .trim();
                    if (
                      !!_headerName &&
                      (!headerValueMap[_headerName] ||
                        !httpHeadersSet[_headerName])
                    ) {
                      if (_headerName === "set-cookie") {
                        if (headerValueMap[_headerName]) {
                          headerValueMap[_headerName].push(_headerValue);
                        } else {
                          headerValueMap[_headerName] = [_headerValue];
                        }
                      } else {
                        headerValueMap[_headerName] = headerValueMap[
                          _headerName
                        ]
                          ? headerValueMap[_headerName] + ", " + _headerValue
                          : _headerValue;
                      }
                    }
                  }),
                headerValueMap),
                headerName,
              );
            } else if (headerInput != null) {
              validatedHeaderName(headerName, headerInput, headerValue);
            }
            return this;
          },
        },
        {
          key: "get",
          value: function (inputElement, parserFunction) {
            if ((inputElement = normalizeInput(inputElement))) {
              var foundKey = utilityFunctions.findKey(this, inputElement);
              if (foundKey) {
                var value = this[foundKey];
                if (!parserFunction) {
                  return value;
                }
                if (parserFunction === true) {
                  return (function (___inputString) {
                    var regexMatch;
                    var propertiesMap = Object.create(null);
                    for (
                      var propertyRegex = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
                      (regexMatch = propertyRegex.exec(___inputString));

                    ) {
                      propertiesMap[regexMatch[1]] = regexMatch[2];
                    }
                    return propertiesMap;
                  })(value);
                }
                if (utilityFunctions.isFunction(parserFunction)) {
                  return parserFunction.call(this, value, foundKey);
                }
                if (utilityFunctions.isRegExp(parserFunction)) {
                  return parserFunction.exec(value);
                }
                throw new TypeError("parser must be boolean|regexp|function");
              }
            }
          },
        },
        {
          key: "has",
          value: function (___event, searchKey) {
            if ((___event = normalizeInput(___event))) {
              var ___foundKey = utilityFunctions.findKey(this, ___event);
              return (
                !!___foundKey &&
                this[___foundKey] !== undefined &&
                (!searchKey ||
                  !!evaluateCondition(
                    0,
                    this[___foundKey],
                    ___foundKey,
                    searchKey,
                  ))
              );
            }
            return false;
          },
        },
        {
          key: "delete",
          value: function (elementToRemove, conditionalParam) {
            var _contextObject = this;
            var isModified = false;
            function keyToRemove(_inputElement) {
              if ((_inputElement = normalizeInput(_inputElement))) {
                var _foundKey = utilityFunctions.findKey(
                  _contextObject,
                  _inputElement,
                );
                if (
                  !!_foundKey &&
                  (!conditionalParam ||
                    !!evaluateCondition(
                      0,
                      _contextObject[_foundKey],
                      _foundKey,
                      conditionalParam,
                    ))
                ) {
                  delete _contextObject[_foundKey];
                  isModified = true;
                }
              }
            }
            if (utilityFunctions.isArray(elementToRemove)) {
              elementToRemove.forEach(keyToRemove);
            } else {
              keyToRemove(elementToRemove);
            }
            return isModified;
          },
        },
        {
          key: "clear",
          value: function (filterCondition) {
            var keysArray = Object.keys(this);
            var keysCount = keysArray.length;
            for (var isFiltered = false; keysCount--; ) {
              var _currentKey = keysArray[keysCount];
              if (
                !filterCondition ||
                !!evaluateCondition(
                  0,
                  this[_currentKey],
                  _currentKey,
                  filterCondition,
                  true,
                )
              ) {
                delete this[_currentKey];
                isFiltered = true;
              }
            }
            return isFiltered;
          },
        },
        {
          key: "normalize",
          value: function (shouldTransformKey) {
            var contextObject = this;
            var mappedKeys = {};
            utilityFunctions.forEach(
              this,
              function (______inputValue, _______inputValue) {
                var foundKeyIndex = utilityFunctions.findKey(
                  mappedKeys,
                  _______inputValue,
                );
                if (foundKeyIndex) {
                  contextObject[foundKeyIndex] =
                    formatInputValue(______inputValue);
                  delete contextObject[_______inputValue];
                  return;
                }
                var formattedKey = shouldTransformKey
                  ? (function (_______inputString) {
                      return _______inputString
                        .trim()
                        .toLowerCase()
                        .replace(
                          /([a-z\d])(\w*)/g,
                          function (________event, textInput, suffix) {
                            return textInput.toUpperCase() + suffix;
                          },
                        );
                    })(_______inputValue)
                  : String(_______inputValue).trim();
                if (formattedKey !== _______inputValue) {
                  delete contextObject[_______inputValue];
                }
                contextObject[formattedKey] =
                  formatInputValue(______inputValue);
                mappedKeys[formattedKey] = true;
              },
            );
            return this;
          },
        },
        {
          key: "concat",
          value: function () {
            var constructorRef;
            var argumentsLength = arguments.length;
            var _argumentsArray = new Array(argumentsLength);
            for (
              var __argumentIndex = 0;
              __argumentIndex < argumentsLength;
              __argumentIndex++
            ) {
              _argumentsArray[__argumentIndex] = arguments[__argumentIndex];
            }
            return (constructorRef = this.constructor).concat.apply(
              constructorRef,
              [this].concat(_argumentsArray),
            );
          },
        },
        {
          key: "toJSON",
          value: function (_____________inputValue) {
            var resultMap = Object.create(null);
            utilityFunctions.forEach(
              this,
              function (_______________________inputValue, resultKey) {
                if (
                  _______________________inputValue != null &&
                  _______________________inputValue !== false
                ) {
                  resultMap[resultKey] =
                    _____________inputValue &&
                    utilityFunctions.isArray(_______________________inputValue)
                      ? _______________________inputValue.join(", ")
                      : _______________________inputValue;
                }
              },
            );
            return resultMap;
          },
        },
        {
          key: Symbol.iterator,
          value: function () {
            return Object.entries(this.toJSON())[Symbol.iterator]();
          },
        },
        {
          key: "toString",
          value: function () {
            return Object.entries(this.toJSON())
              .map(function (_itemsToIterate) {
                var itemsAfterIteration = iterateOverItems(_itemsToIterate, 2);
                return itemsAfterIteration[0] + ": " + itemsAfterIteration[1];
              })
              .join("\n");
          },
        },
        {
          key: Symbol.toStringTag,
          get: function () {
            return "AxiosHeaders";
          },
        },
      ],
      [
        {
          key: "from",
          value: function (instanceOrNew) {
            if (instanceOrNew instanceof this) {
              return instanceOrNew;
            } else {
              return new this(instanceOrNew);
            }
          },
        },
        {
          key: "concat",
          value: function (_event) {
            var instanceOfClass = new this(_event);
            var argumentCount = arguments.length;
            var argumentsArray = new Array(
              argumentCount > 1 ? argumentCount - 1 : 0,
            );
            for (
              var argumentIndex = 1;
              argumentIndex < argumentCount;
              argumentIndex++
            ) {
              argumentsArray[argumentIndex - 1] = arguments[argumentIndex];
            }
            argumentsArray.forEach(function (____________event) {
              return instanceOfClass.set(____________event);
            });
            return instanceOfClass;
          },
        },
        {
          key: "accessor",
          value: function (accessorKey) {
            var accessorMap = (this[internalSymbol] = this[internalSymbol] =
              {
                accessors: {},
              }).accessors;
            var prototypeObject = this.prototype;
            function inputKey(____inputValue) {
              var computedPropertyKey = normalizeInput(____inputValue);
              if (!accessorMap[computedPropertyKey]) {
                (function (___targetObject, ___propertyName) {
                  var camelCaseProperty = utilityFunctions.toCamelCase(
                    " " + ___propertyName,
                  );
                  ["get", "set", "has"].forEach(function (propertyKey) {
                    Object.defineProperty(
                      ___targetObject,
                      propertyKey + camelCaseProperty,
                      {
                        value: function (
                          eventParameter,
                          eventData,
                          callbackOption,
                        ) {
                          return this[propertyKey].call(
                            this,
                            ___propertyName,
                            eventParameter,
                            eventData,
                            callbackOption,
                          );
                        },
                        configurable: true,
                      },
                    );
                  });
                })(prototypeObject, ____inputValue);
                accessorMap[computedPropertyKey] = true;
              }
            }
            if (utilityFunctions.isArray(accessorKey)) {
              accessorKey.forEach(inputKey);
            } else {
              inputKey(accessorKey);
            }
            return this;
          },
        },
      ],
    );
    return __currentKey;
  })();
  axiosHeaderManager.accessor([
    "Content-Type",
    "Content-Length",
    "Accept",
    "Accept-Encoding",
    "User-Agent",
    "Authorization",
  ]);
  utilityFunctions.reduceDescriptors(
    axiosHeaderManager.prototype,
    function (__inputElement, ____propertyName) {
      var _________________inputValue = __inputElement.value;
      var capitalizedPropertyName =
        ____propertyName[0].toUpperCase() + ____propertyName.slice(1);
      return {
        get: function () {
          return _________________inputValue;
        },
        set: function (_____________event) {
          this[capitalizedPropertyName] = _____________event;
        },
      };
    },
  );
  utilityFunctions.freezeMethods(axiosHeaderManager);
  var axiosHeadersInstance = axiosHeaderManager;
  function executeCallbacks(callbackFunctions, _requestOptions) {
    var contextOrDefault = this || axiosHttpClient;
    var ______requestOptions = _requestOptions || contextOrDefault;
    var _normalizedHeaders = axiosHeadersInstance.from(
      ______requestOptions.headers,
    );
    var _responseData = ______requestOptions.data;
    utilityFunctions.forEach(callbackFunctions, function (______event) {
      _responseData = ______event.call(
        contextOrDefault,
        _responseData,
        _normalizedHeaders.normalize(),
        _requestOptions ? _requestOptions.status : undefined,
      );
    });
    _normalizedHeaders.normalize();
    return _responseData;
  }
  function isCancelEvent(cancelToken) {
    return !!cancelToken && !!cancelToken.__CANCEL__;
  }
  function cancelErrorHandler(
    _errorMessage,
    _____requestConfig,
    ______requestConfig,
  ) {
    createAxiosError.call(
      this,
      _errorMessage == null ? "canceled" : _errorMessage,
      createAxiosError.ERR_CANCELED,
      _____requestConfig,
      ______requestConfig,
    );
    this.name = "CanceledError";
  }
  utilityFunctions.inherits(cancelErrorHandler, createAxiosError, {
    __CANCEL__: true,
  });
  var cookieHandler = environmentConfig.isStandardBrowserEnv
    ? {
        write: function (
          cookieName,
          cookieValue,
          cookieExpirationTime,
          cookiePath,
          cookieDomain,
          isSecure,
        ) {
          var cookieParts = [];
          cookieParts.push(cookieName + "=" + encodeURIComponent(cookieValue));
          if (utilityFunctions.isNumber(cookieExpirationTime)) {
            cookieParts.push(
              "expires=" + new Date(cookieExpirationTime).toGMTString(),
            );
          }
          if (utilityFunctions.isString(cookiePath)) {
            cookieParts.push("path=" + cookiePath);
          }
          if (utilityFunctions.isString(cookieDomain)) {
            cookieParts.push("domain=" + cookieDomain);
          }
          if (isSecure === true) {
            cookieParts.push("secure");
          }
          document.cookie = cookieParts.join("; ");
        },
        read: function (_cookieName) {
          var cookieValueMatch = document.cookie.match(
            new RegExp("(^|;\\s*)(" + _cookieName + ")=([^;]*)"),
          );
          if (cookieValueMatch) {
            return decodeURIComponent(cookieValueMatch[3]);
          } else {
            return null;
          }
        },
        remove: function (eventPayload) {
          this.write(eventPayload, "", Date.now() - 86400000);
        },
      }
    : {
        write: function () {},
        read: function () {
          return null;
        },
        remove: function () {},
      };
  function formatUrl(_baseUrl, urlPath) {
    if (_baseUrl && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(urlPath)) {
      return (function (_urlPath, pathSuffix) {
        if (pathSuffix) {
          return (
            _urlPath.replace(/\/+$/, "") + "/" + pathSuffix.replace(/^\/+/, "")
          );
        } else {
          return _urlPath;
        }
      })(_baseUrl, urlPath);
    } else {
      return urlPath;
    }
  }
  var isStandardBrowserEnvironment = environmentConfig.isStandardBrowserEnv
    ? (function () {
        var parsedUrl;
        var isOldBrowser = /(msie|trident)/i.test(navigator.userAgent);
        var anchorElement = document.createElement("a");
        function __url(_url) {
          var url = _url;
          if (isOldBrowser) {
            anchorElement.setAttribute("href", url);
            url = anchorElement.href;
          }
          anchorElement.setAttribute("href", url);
          return {
            href: anchorElement.href,
            protocol: anchorElement.protocol
              ? anchorElement.protocol.replace(/:$/, "")
              : "",
            host: anchorElement.host,
            search: anchorElement.search
              ? anchorElement.search.replace(/^\?/, "")
              : "",
            hash: anchorElement.hash
              ? anchorElement.hash.replace(/^#/, "")
              : "",
            hostname: anchorElement.hostname,
            port: anchorElement.port,
            pathname:
              anchorElement.pathname.charAt(0) === "/"
                ? anchorElement.pathname
                : "/" + anchorElement.pathname,
          };
        }
        parsedUrl = __url(window.location.href);
        return function (__________________________inputValue) {
          var normalizedUrl = utilityFunctions.isString(
            __________________________inputValue,
          )
            ? __url(__________________________inputValue)
            : __________________________inputValue;
          return (
            normalizedUrl.protocol === parsedUrl.protocol &&
            normalizedUrl.host === parsedUrl.host
          );
        };
      })()
    : function () {
        return true;
      };
  function createProgressHandler(callback, timeInterval) {
    var previousLoadedBytes = 0;
    var progressCalculator = (function (maxSamples, _timeInterval) {
      maxSamples = maxSamples || 10;
      var lastTimestamp;
      var sampleValuesArray = new Array(maxSamples);
      var timestampArray = new Array(maxSamples);
      var currentSampleIndex = 0;
      var _currentSampleIndex = 0;
      if (_timeInterval !== undefined) {
        _timeInterval = _timeInterval;
      } else {
        _timeInterval = 1000;
      }
      return function (_____inputValue) {
        var currentTimestamp = Date.now();
        var previousTimestamp = timestampArray[_currentSampleIndex];
        lastTimestamp ||= currentTimestamp;
        sampleValuesArray[currentSampleIndex] = _____inputValue;
        timestampArray[currentSampleIndex] = currentTimestamp;
        var currentSampleIndexForTotal = _currentSampleIndex;
        for (
          var totalSamples = 0;
          currentSampleIndexForTotal !== currentSampleIndex;

        ) {
          totalSamples += sampleValuesArray[currentSampleIndexForTotal++];
          currentSampleIndexForTotal %= maxSamples;
        }
        if (
          (currentSampleIndex = (currentSampleIndex + 1) % maxSamples) ===
          _currentSampleIndex
        ) {
          _currentSampleIndex = (_currentSampleIndex + 1) % maxSamples;
        }
        if (!(currentTimestamp - lastTimestamp < _timeInterval)) {
          var timeElapsedSinceLastUpdate =
            previousTimestamp && currentTimestamp - previousTimestamp;
          if (timeElapsedSinceLastUpdate) {
            return Math.round(
              (totalSamples * 1000) / timeElapsedSinceLastUpdate,
            );
          } else {
            return undefined;
          }
        }
      };
    })(50, 250);
    return function (progressEvent) {
      var bytesLoaded = progressEvent.loaded;
      var totalBytes = progressEvent.lengthComputable
        ? progressEvent.total
        : undefined;
      var bytesTransferred = bytesLoaded - previousLoadedBytes;
      var transferRate = progressCalculator(bytesTransferred);
      previousLoadedBytes = bytesLoaded;
      var progressData = {
        loaded: bytesLoaded,
        total: totalBytes,
        progress: totalBytes ? bytesLoaded / totalBytes : undefined,
        bytes: bytesTransferred,
        rate: transferRate || undefined,
        estimated:
          transferRate && totalBytes && bytesLoaded <= totalBytes
            ? (totalBytes - bytesLoaded) / transferRate
            : undefined,
        event: progressEvent,
      };
      progressData[timeInterval ? "download" : "upload"] = true;
      callback(progressData);
    };
  }
  var httpAdapter = {
    http: null,
    xhr:
      typeof XMLHttpRequest != "undefined" &&
      function (requestConfig) {
        return new Promise(function (resolveResponse, errorCallback) {
          var abortRequestHandler;
          var contentType;
          var requestData = requestConfig.data;
          var normalizedHeaders = axiosHeadersInstance
            .from(requestConfig.headers)
            .normalize();
          var responseType = requestConfig.responseType;
          function cleanupAbortHandlers() {
            if (requestConfig.cancelToken) {
              requestConfig.cancelToken.unsubscribe(abortRequestHandler);
            }
            if (requestConfig.signal) {
              requestConfig.signal.removeEventListener(
                "abort",
                abortRequestHandler,
              );
            }
          }
          if (utilityFunctions.isFormData(requestData)) {
            if (
              environmentConfig.isStandardBrowserEnv ||
              environmentConfig.isStandardBrowserWebWorkerEnv
            ) {
              normalizedHeaders.setContentType(false);
            } else if (
              normalizedHeaders.getContentType(/^\s*multipart\/form-data/)
            ) {
              if (
                utilityFunctions.isString(
                  (contentType = normalizedHeaders.getContentType()),
                )
              ) {
                normalizedHeaders.setContentType(
                  contentType.replace(/^\s*(multipart\/form-data);+/, "$1"),
                );
              }
            } else {
              normalizedHeaders.setContentType("multipart/form-data");
            }
          }
          var _xmlHttpRequest = new XMLHttpRequest();
          if (requestConfig.auth) {
            var authUsername = requestConfig.auth.username || "";
            var authPassword = requestConfig.auth.password
              ? unescape(encodeURIComponent(requestConfig.auth.password))
              : "";
            normalizedHeaders.set(
              "Authorization",
              "Basic " + btoa(authUsername + ":" + authPassword),
            );
          }
          var formattedUrl = formatUrl(
            requestConfig.baseURL,
            requestConfig.url,
          );
          function handleHttpRequest() {
            if (_xmlHttpRequest) {
              var responseHeaders = axiosHeadersInstance.from(
                "getAllResponseHeaders" in _xmlHttpRequest &&
                  _xmlHttpRequest.getAllResponseHeaders(),
              );
              (function (handleResponse, _errorCallback, response) {
                var validateStatusFunction = response.config.validateStatus;
                if (
                  response.status &&
                  validateStatusFunction &&
                  !validateStatusFunction(response.status)
                ) {
                  _errorCallback(
                    new createAxiosError(
                      "Request failed with status code " + response.status,
                      [
                        createAxiosError.ERR_BAD_REQUEST,
                        createAxiosError.ERR_BAD_RESPONSE,
                      ][Math.floor(response.status / 100) - 4],
                      response.config,
                      response.request,
                      response,
                    ),
                  );
                } else {
                  handleResponse(response);
                }
              })(
                function (_________event) {
                  resolveResponse(_________event);
                  cleanupAbortHandlers();
                },
                function (errorEvent) {
                  errorCallback(errorEvent);
                  cleanupAbortHandlers();
                },
                {
                  data:
                    responseType &&
                    responseType !== "text" &&
                    responseType !== "json"
                      ? _xmlHttpRequest.response
                      : _xmlHttpRequest.responseText,
                  status: _xmlHttpRequest.status,
                  statusText: _xmlHttpRequest.statusText,
                  headers: responseHeaders,
                  config: requestConfig,
                  request: _xmlHttpRequest,
                },
              );
              _xmlHttpRequest = null;
            }
          }
          _xmlHttpRequest.open(
            requestConfig.method.toUpperCase(),
            constructUrlWithParams(
              formattedUrl,
              requestConfig.params,
              requestConfig.paramsSerializer,
            ),
            true,
          );
          _xmlHttpRequest.timeout = requestConfig.timeout;
          if ("onloadend" in _xmlHttpRequest) {
            _xmlHttpRequest.onloadend = handleHttpRequest;
          } else {
            _xmlHttpRequest.onreadystatechange = function () {
              if (
                _xmlHttpRequest &&
                _xmlHttpRequest.readyState === 4 &&
                (_xmlHttpRequest.status !== 0 ||
                  (_xmlHttpRequest.responseURL &&
                    _xmlHttpRequest.responseURL.indexOf("file:") === 0))
              ) {
                setTimeout(handleHttpRequest);
              }
            };
          }
          _xmlHttpRequest.onabort = function () {
            if (_xmlHttpRequest) {
              errorCallback(
                new createAxiosError(
                  "Request aborted",
                  createAxiosError.ECONNABORTED,
                  requestConfig,
                  _xmlHttpRequest,
                ),
              );
              _xmlHttpRequest = null;
            }
          };
          _xmlHttpRequest.onerror = function () {
            errorCallback(
              new createAxiosError(
                "Network Error",
                createAxiosError.ERR_NETWORK,
                requestConfig,
                _xmlHttpRequest,
              ),
            );
            _xmlHttpRequest = null;
          };
          _xmlHttpRequest.ontimeout = function () {
            var timeoutErrorMessage = requestConfig.timeout
              ? "timeout of " + requestConfig.timeout + "ms exceeded"
              : "timeout exceeded";
            var transitionalRequestOptions =
              requestConfig.transitional || requestConfigOptions;
            if (requestConfig.timeoutErrorMessage) {
              timeoutErrorMessage = requestConfig.timeoutErrorMessage;
            }
            errorCallback(
              new createAxiosError(
                timeoutErrorMessage,
                transitionalRequestOptions.clarifyTimeoutError
                  ? createAxiosError.ETIMEDOUT
                  : createAxiosError.ECONNABORTED,
                requestConfig,
                _xmlHttpRequest,
              ),
            );
            _xmlHttpRequest = null;
          };
          if (environmentConfig.isStandardBrowserEnv) {
            var xsrfToken =
              isStandardBrowserEnvironment(formattedUrl) &&
              requestConfig.xsrfCookieName &&
              cookieHandler.read(requestConfig.xsrfCookieName);
            if (xsrfToken) {
              normalizedHeaders.set(requestConfig.xsrfHeaderName, xsrfToken);
            }
          }
          if (requestData === undefined) {
            normalizedHeaders.setContentType(null);
          }
          if ("setRequestHeader" in _xmlHttpRequest) {
            utilityFunctions.forEach(
              normalizedHeaders.toJSON(),
              function (____headerValue, _____headerValue) {
                _xmlHttpRequest.setRequestHeader(
                  _____headerValue,
                  ____headerValue,
                );
              },
            );
          }
          if (!utilityFunctions.isUndefined(requestConfig.withCredentials)) {
            _xmlHttpRequest.withCredentials = !!requestConfig.withCredentials;
          }
          if (responseType && responseType !== "json") {
            _xmlHttpRequest.responseType = requestConfig.responseType;
          }
          if (typeof requestConfig.onDownloadProgress == "function") {
            _xmlHttpRequest.addEventListener(
              "progress",
              createProgressHandler(requestConfig.onDownloadProgress, true),
            );
          }
          if (
            typeof requestConfig.onUploadProgress == "function" &&
            _xmlHttpRequest.upload
          ) {
            _xmlHttpRequest.upload.addEventListener(
              "progress",
              createProgressHandler(requestConfig.onUploadProgress),
            );
          }
          if (requestConfig.cancelToken || requestConfig.signal) {
            abortRequestHandler = function (errorResponse) {
              if (_xmlHttpRequest) {
                errorCallback(
                  !errorResponse || errorResponse.type
                    ? new cancelErrorHandler(
                        null,
                        requestConfig,
                        _xmlHttpRequest,
                      )
                    : errorResponse,
                );
                _xmlHttpRequest.abort();
                _xmlHttpRequest = null;
              }
            };
            if (requestConfig.cancelToken) {
              requestConfig.cancelToken.subscribe(abortRequestHandler);
            }
            if (requestConfig.signal) {
              if (requestConfig.signal.aborted) {
                abortRequestHandler();
              } else {
                requestConfig.signal.addEventListener(
                  "abort",
                  abortRequestHandler,
                );
              }
            }
          }
          var parsedUrlProtocol;
          var requestedProtocol =
            ((parsedUrlProtocol = /^([-+\w]{1,25})(:?\/\/|:)/.exec(
              formattedUrl,
            )) &&
              parsedUrlProtocol[1]) ||
            "";
          if (
            requestedProtocol &&
            environmentConfig.protocols.indexOf(requestedProtocol) === -1
          ) {
            errorCallback(
              new createAxiosError(
                "Unsupported protocol " + requestedProtocol + ":",
                createAxiosError.ERR_BAD_REQUEST,
                requestConfig,
              ),
            );
          } else {
            _xmlHttpRequest.send(requestData || null);
          }
        });
      },
  };
  utilityFunctions.forEach(httpAdapter, function (__event, _adapterName) {
    if (__event) {
      try {
        Object.defineProperty(__event, "name", {
          value: _adapterName,
        });
      } catch (______error) {}
      Object.defineProperty(__event, "adapterName", {
        value: _adapterName,
      });
    }
  });
  function formatStringWithDash(__errorMessage) {
    return `- ${__errorMessage}`;
  }
  function isValidInput(_______________________________inputValue) {
    return (
      utilityFunctions.isFunction(_______________________________inputValue) ||
      _______________________________inputValue === null ||
      _______________________________inputValue === false
    );
  }
  function getHttpAdapter(adapterInput) {
    var adapter;
    var currentAdapter;
    var adapterInputLength = (adapterInput = utilityFunctions.isArray(
      adapterInput,
    )
      ? adapterInput
      : [adapterInput]).length;
    var adapterMap = {};
    for (
      var adapterIndex = 0;
      adapterIndex < adapterInputLength;
      adapterIndex++
    ) {
      var adapterName = undefined;
      currentAdapter = adapter = adapterInput[adapterIndex];
      if (
        !isValidInput(adapter) &&
        (currentAdapter =
          httpAdapter[(adapterName = String(adapter)).toLowerCase()]) ===
          undefined
      ) {
        throw new createAxiosError(`Unknown adapter '${adapterName}'`);
      }
      if (currentAdapter) {
        break;
      }
      adapterMap[adapterName || "#" + adapterIndex] = currentAdapter;
    }
    if (!currentAdapter) {
      var unavailableAdaptersMessages = Object.entries(adapterMap).map(
        function (itemsToIterate) {
          var itemsIteration = iterateOverItems(itemsToIterate, 2);
          var firstItem = itemsIteration[0];
          var secondItemStatus = itemsIteration[1];
          return `adapter ${firstItem} ${secondItemStatus === false ? "is not supported by the environment" : "is not available in the build"}`;
        },
      );
      throw new createAxiosError(
        "There is no suitable adapter to dispatch the request " +
          (adapterInputLength
            ? unavailableAdaptersMessages.length > 1
              ? "since :\n" +
                unavailableAdaptersMessages.map(formatStringWithDash).join("\n")
              : " " + formatStringWithDash(unavailableAdaptersMessages[0])
            : "as no adapter specified"),
        "ERR_NOT_SUPPORT",
      );
    }
    return currentAdapter;
  }
  function handleRequestConfig(___requestConfig) {
    if (___requestConfig.cancelToken) {
      ___requestConfig.cancelToken.throwIfRequested();
    }
    if (___requestConfig.signal && ___requestConfig.signal.aborted) {
      throw new cancelErrorHandler(null, ___requestConfig);
    }
  }
  function _handleHttpRequest(_requestConfig) {
    handleRequestConfig(_requestConfig);
    _requestConfig.headers = axiosHeadersInstance.from(_requestConfig.headers);
    _requestConfig.data = executeCallbacks.call(
      _requestConfig,
      _requestConfig.transformRequest,
    );
    if (["post", "put", "patch"].indexOf(_requestConfig.method) !== -1) {
      _requestConfig.headers.setContentType(
        "application/x-www-form-urlencoded",
        false,
      );
    }
    return getHttpAdapter(_requestConfig.adapter || axiosHttpClient.adapter)(
      _requestConfig,
    ).then(
      function (____requestConfig) {
        handleRequestConfig(_requestConfig);
        ____requestConfig.data = executeCallbacks.call(
          _requestConfig,
          _requestConfig.transformResponse,
          ____requestConfig,
        );
        ____requestConfig.headers = axiosHeadersInstance.from(
          ____requestConfig.headers,
        );
        return ____requestConfig;
      },
      function (responseObject) {
        if (!isCancelEvent(responseObject)) {
          handleRequestConfig(_requestConfig);
          if (responseObject && responseObject.response) {
            responseObject.response.data = executeCallbacks.call(
              _requestConfig,
              _requestConfig.transformResponse,
              responseObject.response,
            );
            responseObject.response.headers = axiosHeadersInstance.from(
              responseObject.response.headers,
            );
          }
        }
        return Promise.reject(responseObject);
      },
    );
  }
  function convertToJson(___________________________inputValue) {
    if (___________________________inputValue instanceof axiosHeadersInstance) {
      return ___________________________inputValue.toJSON();
    } else {
      return ___________________________inputValue;
    }
  }
  function mergeOptionsFromSource(sourceObject, _options) {
    _options = _options || {};
    var mergedOptions = {};
    function _mergeObjects(__sourceObject, ____targetObject, isCaseless) {
      if (
        utilityFunctions.isPlainObject(__sourceObject) &&
        utilityFunctions.isPlainObject(____targetObject)
      ) {
        return utilityFunctions.merge.call(
          {
            caseless: isCaseless,
          },
          __sourceObject,
          ____targetObject,
        );
      } else if (utilityFunctions.isPlainObject(____targetObject)) {
        return utilityFunctions.merge({}, ____targetObject);
      } else if (utilityFunctions.isArray(____targetObject)) {
        return ____targetObject.slice();
      } else {
        return ____targetObject;
      }
    }
    function performOperation(firstParameter, _value, thirdParameter) {
      if (utilityFunctions.isUndefined(_value)) {
        if (utilityFunctions.isUndefined(firstParameter)) {
          return undefined;
        } else {
          return _mergeObjects(undefined, firstParameter, thirdParameter);
        }
      } else {
        return _mergeObjects(firstParameter, _value, thirdParameter);
      }
    }
    function inputHandler(__inputParameter, callbackParam) {
      if (!utilityFunctions.isUndefined(callbackParam)) {
        return _mergeObjects(undefined, callbackParam);
      }
    }
    function processInputValue(
      _______________inputValue,
      ________________inputValue,
    ) {
      if (utilityFunctions.isUndefined(________________inputValue)) {
        if (utilityFunctions.isUndefined(_______________inputValue)) {
          return undefined;
        } else {
          return _mergeObjects(undefined, _______________inputValue);
        }
      } else {
        return _mergeObjects(undefined, ________________inputValue);
      }
    }
    function mergeInputBasedOnKey(
      ___________________inputValue,
      optionValue,
      _inputKey,
    ) {
      if (_inputKey in _options) {
        return _mergeObjects(___________________inputValue, optionValue);
      } else if (_inputKey in sourceObject) {
        return _mergeObjects(undefined, ___________________inputValue);
      } else {
        return undefined;
      }
    }
    var optionHandlers = {
      url: inputHandler,
      method: inputHandler,
      data: inputHandler,
      baseURL: processInputValue,
      transformRequest: processInputValue,
      transformResponse: processInputValue,
      paramsSerializer: processInputValue,
      timeout: processInputValue,
      timeoutMessage: processInputValue,
      withCredentials: processInputValue,
      adapter: processInputValue,
      responseType: processInputValue,
      xsrfCookieName: processInputValue,
      xsrfHeaderName: processInputValue,
      onUploadProgress: processInputValue,
      onDownloadProgress: processInputValue,
      decompress: processInputValue,
      maxContentLength: processInputValue,
      maxBodyLength: processInputValue,
      beforeRedirect: processInputValue,
      transport: processInputValue,
      httpAgent: processInputValue,
      httpsAgent: processInputValue,
      cancelToken: processInputValue,
      socketPath: processInputValue,
      responseEncoding: processInputValue,
      validateStatus: mergeInputBasedOnKey,
      headers: function (__________event, _targetValue) {
        return performOperation(
          convertToJson(__________event),
          convertToJson(_targetValue),
          true,
        );
      },
    };
    utilityFunctions.forEach(
      Object.keys(Object.assign({}, sourceObject, _options)),
      function (sourceIndex) {
        var inputFunction = optionHandlers[sourceIndex] || performOperation;
        var functionResult = inputFunction(
          sourceObject[sourceIndex],
          _options[sourceIndex],
          sourceIndex,
        );
        if (
          !utilityFunctions.isUndefined(functionResult) ||
          inputFunction === mergeInputBasedOnKey
        ) {
          mergedOptions[sourceIndex] = functionResult;
        }
      },
    );
    return mergedOptions;
  }
  var axiosVersion = "1.6.0";
  var typeCheck = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(
    function (expectedType, typeCheckThreshold) {
      typeCheck[expectedType] = function (
        ______________________________inputValue,
      ) {
        return (
          getType(______________________________inputValue) === expectedType ||
          "a" + (typeCheckThreshold < 1 ? "n " : " ") + expectedType
        );
      };
    },
  );
  var transitionalOptions = {};
  typeCheck.transitional = function (
    isEnabled,
    transitionalVersion,
    transitionalOptionWarning,
  ) {
    function generateTransitionalOptionMessage(
      transitionalOptionName,
      transitionalOptionValue,
    ) {
      return (
        "[Axios v1.6.0] Transitional option '" +
        transitionalOptionName +
        "'" +
        transitionalOptionValue +
        (transitionalOptionWarning ? ". " + transitionalOptionWarning : "")
      );
    }
    return function (_callbackFunction, optionName, optionsCallback) {
      if (isEnabled === false) {
        throw new createAxiosError(
          generateTransitionalOptionMessage(
            optionName,
            " has been removed" +
              (transitionalVersion ? " in " + transitionalVersion : ""),
          ),
          createAxiosError.ERR_DEPRECATED,
        );
      }
      if (transitionalVersion && !transitionalOptions[optionName]) {
        transitionalOptions[optionName] = true;
        console.warn(
          generateTransitionalOptionMessage(
            optionName,
            " has been deprecated since v" +
              transitionalVersion +
              " and will be removed in the near future",
          ),
        );
      }
      return (
        !isEnabled || isEnabled(_callbackFunction, optionName, optionsCallback)
      );
    };
  };
  var _optionsValidator = {
    assertOptions: function (
      optionsObject,
      optionsValidator,
      isStrictValidationMode,
    ) {
      if (getType(optionsObject) !== "object") {
        throw new createAxiosError(
          "options must be an object",
          createAxiosError.ERR_BAD_OPTION_VALUE,
        );
      }
      var optionKeys = Object.keys(optionsObject);
      for (var optionIndex = optionKeys.length; optionIndex-- > 0; ) {
        var currentOptionKey = optionKeys[optionIndex];
        var validatorFunction = optionsValidator[currentOptionKey];
        if (validatorFunction) {
          var validatedOptionValue = optionsObject[currentOptionKey];
          var isOptionValid =
            validatedOptionValue === undefined ||
            validatorFunction(
              validatedOptionValue,
              currentOptionKey,
              optionsObject,
            );
          if (isOptionValid !== true) {
            throw new createAxiosError(
              "option " + currentOptionKey + " must be " + isOptionValid,
              createAxiosError.ERR_BAD_OPTION_VALUE,
            );
          }
        } else if (isStrictValidationMode !== true) {
          throw new createAxiosError(
            "Unknown option " + currentOptionKey,
            createAxiosError.ERR_BAD_OPTION,
          );
        }
      }
    },
    validators: typeCheck,
  };
  var __optionsValidator = _optionsValidator.validators;
  var RequestHandler = (function () {
    function inputParameter(inputParameterValue) {
      parserOption(this, inputParameter);
      this.defaults = inputParameterValue;
      this.interceptors = {
        request: new requestInterceptor(),
        response: new requestInterceptor(),
      };
    }
    _propertyCount(inputParameter, [
      {
        key: "request",
        value: function (inputValue, configOptions) {
          if (typeof inputValue == "string") {
            (configOptions = configOptions || {}).url = inputValue;
          } else {
            configOptions = inputValue || {};
          }
          var requestOptions = (configOptions = mergeOptionsFromSource(
            this.defaults,
            configOptions,
          ));
          var _transitionalOptions = requestOptions.transitional;
          var paramsSerializer = requestOptions.paramsSerializer;
          var requestHeaders = requestOptions.headers;
          if (_transitionalOptions !== undefined) {
            _optionsValidator.assertOptions(
              _transitionalOptions,
              {
                silentJSONParsing: __optionsValidator.transitional(
                  __optionsValidator.boolean,
                ),
                forcedJSONParsing: __optionsValidator.transitional(
                  __optionsValidator.boolean,
                ),
                clarifyTimeoutError: __optionsValidator.transitional(
                  __optionsValidator.boolean,
                ),
              },
              false,
            );
          }
          if (paramsSerializer != null) {
            if (utilityFunctions.isFunction(paramsSerializer)) {
              configOptions.paramsSerializer = {
                serialize: paramsSerializer,
              };
            } else {
              _optionsValidator.assertOptions(
                paramsSerializer,
                {
                  encode: __optionsValidator.function,
                  serialize: __optionsValidator.function,
                },
                true,
              );
            }
          }
          configOptions.method = (
            configOptions.method ||
            this.defaults.method ||
            "get"
          ).toLowerCase();
          var mergedHeaders =
            requestHeaders &&
            utilityFunctions.merge(
              requestHeaders.common,
              requestHeaders[configOptions.method],
            );
          if (requestHeaders) {
            utilityFunctions.forEach(
              ["delete", "get", "head", "post", "put", "patch", "common"],
              function (_headerKey) {
                delete requestHeaders[_headerKey];
              },
            );
          }
          configOptions.headers = axiosHeadersInstance.concat(
            mergedHeaders,
            requestHeaders,
          );
          var interceptorHandlers = [];
          var areAllInterceptorsSynchronous = true;
          this.interceptors.request.forEach(function (interceptorConfig) {
            if (
              typeof interceptorConfig.runWhen != "function" ||
              interceptorConfig.runWhen(configOptions) !== false
            ) {
              areAllInterceptorsSynchronous =
                areAllInterceptorsSynchronous && interceptorConfig.synchronous;
              interceptorHandlers.unshift(
                interceptorConfig.fulfilled,
                interceptorConfig.rejected,
              );
            }
          });
          var promiseResult;
          var responseInterceptors = [];
          this.interceptors.response.forEach(function (interceptor) {
            responseInterceptors.push(
              interceptor.fulfilled,
              interceptor.rejected,
            );
          });
          var promiseChainLength;
          var currentInterceptorIndex = 0;
          if (!areAllInterceptorsSynchronous) {
            var promiseChain = [_handleHttpRequest.bind(this), undefined];
            promiseChain.unshift.apply(promiseChain, interceptorHandlers);
            promiseChain.push.apply(promiseChain, responseInterceptors);
            promiseChainLength = promiseChain.length;
            promiseResult = Promise.resolve(configOptions);
            while (currentInterceptorIndex < promiseChainLength) {
              promiseResult = promiseResult.then(
                promiseChain[currentInterceptorIndex++],
                promiseChain[currentInterceptorIndex++],
              );
            }
            return promiseResult;
          }
          promiseChainLength = interceptorHandlers.length;
          var configOptionsFinal = configOptions;
          for (
            currentInterceptorIndex = 0;
            currentInterceptorIndex < promiseChainLength;

          ) {
            var _currentInterceptorHandler =
              interceptorHandlers[currentInterceptorIndex++];
            var _errorHandler = interceptorHandlers[currentInterceptorIndex++];
            try {
              configOptionsFinal =
                _currentInterceptorHandler(configOptionsFinal);
            } catch (___error) {
              _errorHandler.call(this, ___error);
              break;
            }
          }
          try {
            promiseResult = _handleHttpRequest.call(this, configOptionsFinal);
          } catch (____error) {
            return Promise.reject(____error);
          }
          currentInterceptorIndex = 0;
          promiseChainLength = responseInterceptors.length;
          while (currentInterceptorIndex < promiseChainLength) {
            promiseResult = promiseResult.then(
              responseInterceptors[currentInterceptorIndex++],
              responseInterceptors[currentInterceptorIndex++],
            );
          }
          return promiseResult;
        },
      },
      {
        key: "getUri",
        value: function (____requestOptions) {
          return constructUrlWithParams(
            formatUrl(
              (____requestOptions = mergeOptionsFromSource(
                this.defaults,
                ____requestOptions,
              )).baseURL,
              ____requestOptions.url,
            ),
            ____requestOptions.params,
            ____requestOptions.paramsSerializer,
          );
        },
      },
    ]);
    return inputParameter;
  })();
  utilityFunctions.forEach(
    ["delete", "get", "head", "options"],
    function (_httpMethod) {
      RequestHandler.prototype[_httpMethod] = function (
        _requestUrl,
        ___requestOptions,
      ) {
        return this.request(
          mergeOptionsFromSource(___requestOptions || {}, {
            method: _httpMethod,
            url: _requestUrl,
            data: (___requestOptions || {}).data,
          }),
        );
      };
    },
  );
  utilityFunctions.forEach(["post", "put", "patch"], function (httpMethod) {
    function __requestHeaders(_requestHeaders) {
      return function (requestUrl, __requestData, __requestOptions) {
        return this.request(
          mergeOptionsFromSource(__requestOptions || {}, {
            method: httpMethod,
            headers: _requestHeaders
              ? {
                  "Content-Type": "multipart/form-data",
                }
              : {},
            url: requestUrl,
            data: __requestData,
          }),
        );
      };
    }
    RequestHandler.prototype[httpMethod] = __requestHeaders();
    RequestHandler.prototype[httpMethod + "Form"] = __requestHeaders(true);
  });
  var functionExecutor = RequestHandler;
  var cancelTokenExecutor = (function () {
    function executorFunction(_executorFunction) {
      parserOption(this, executorFunction);
      if (typeof _executorFunction != "function") {
        throw new TypeError("executor must be a function.");
      }
      var resolvePromise;
      this.promise = new Promise(function (_________________event) {
        resolvePromise = _________________event;
      });
      var executorContext = this;
      this.promise.then(function (______________event) {
        if (executorContext._listeners) {
          for (
            var listenerCount = executorContext._listeners.length;
            listenerCount-- > 0;

          ) {
            executorContext._listeners[listenerCount](______________event);
          }
          executorContext._listeners = null;
        }
      });
      this.promise.then = function (_promiseExecutor) {
        var promiseResolveCallback;
        var promiseWithCancel = new Promise(function (_______________event) {
          executorContext.subscribe(_______________event);
          promiseResolveCallback = _______________event;
        }).then(_promiseExecutor);
        promiseWithCancel.cancel = function () {
          executorContext.unsubscribe(promiseResolveCallback);
        };
        return promiseWithCancel;
      };
      _executorFunction(function (_errorEvent, reasonDetails, notification) {
        if (!executorContext.reason) {
          executorContext.reason = new cancelErrorHandler(
            _errorEvent,
            reasonDetails,
            notification,
          );
          resolvePromise(executorContext.reason);
        }
      });
    }
    _propertyCount(
      executorFunction,
      [
        {
          key: "throwIfRequested",
          value: function () {
            if (this.reason) {
              throw this.reason;
            }
          },
        },
        {
          key: "subscribe",
          value: function (__callbackFunction) {
            if (this.reason) {
              __callbackFunction(this.reason);
            } else if (this._listeners) {
              this._listeners.push(__callbackFunction);
            } else {
              this._listeners = [__callbackFunction];
            }
          },
        },
        {
          key: "unsubscribe",
          value: function (____event) {
            if (this._listeners) {
              var listenerIndex = this._listeners.indexOf(____event);
              if (listenerIndex !== -1) {
                this._listeners.splice(listenerIndex, 1);
              }
            }
          },
        },
      ],
      [
        {
          key: "source",
          value: function () {
            var executionToken;
            return {
              token: new executorFunction(function (executionEvent) {
                executionToken = executionEvent;
              }),
              cancel: executionToken,
            };
          },
        },
      ],
    );
    return executorFunction;
  })();
  var httpStatusCodes = {
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
    NetworkAuthenticationRequired: 511,
  };
  Object.entries(httpStatusCodes).forEach(function (itemsToProcess) {
    var iteratedItems = iterateOverItems(itemsToProcess, 2);
    var _firstItem = iteratedItems[0];
    var responseCodeIndex = iteratedItems[1];
    httpStatusCodes[responseCodeIndex] = _firstItem;
  });
  var HttpStatusCodes = httpStatusCodes;
  var axiosDefaultConfig = (function createRequestWithHeader(_requestData) {
    var requestInstance = new functionExecutor(_requestData);
    var requestWithHeader = headerString(
      functionExecutor.prototype.request,
      requestInstance,
    );
    utilityFunctions.extend(
      requestWithHeader,
      functionExecutor.prototype,
      requestInstance,
      {
        allOwnKeys: true,
      },
    );
    utilityFunctions.extend(requestWithHeader, requestInstance, null, {
      allOwnKeys: true,
    });
    requestWithHeader.create = function (_____requestOptions) {
      return createRequestWithHeader(
        mergeOptionsFromSource(_requestData, _____requestOptions),
      );
    };
    return requestWithHeader;
  })(axiosHttpClient);
  axiosDefaultConfig.Axios = functionExecutor;
  axiosDefaultConfig.CanceledError = cancelErrorHandler;
  axiosDefaultConfig.CancelToken = cancelTokenExecutor;
  axiosDefaultConfig.isCancel = isCancelEvent;
  axiosDefaultConfig.VERSION = axiosVersion;
  axiosDefaultConfig.toFormData = _processFormData;
  axiosDefaultConfig.AxiosError = createAxiosError;
  axiosDefaultConfig.Cancel = axiosDefaultConfig.CanceledError;
  axiosDefaultConfig.all = function (promiseArray) {
    return Promise.all(promiseArray);
  };
  axiosDefaultConfig.spread = function (functionToBeApplied) {
    return function (__argumentsArray) {
      return functionToBeApplied.apply(null, __argumentsArray);
    };
  };
  axiosDefaultConfig.isAxiosError = function (errorObject) {
    return (
      utilityFunctions.isObject(errorObject) &&
      errorObject.isAxiosError === true
    );
  };
  axiosDefaultConfig.mergeConfig = mergeOptionsFromSource;
  axiosDefaultConfig.AxiosHeaders = axiosHeadersInstance;
  axiosDefaultConfig.formToJSON = function (htmlFormElement) {
    return processFormData(
      utilityFunctions.isHTMLForm(htmlFormElement)
        ? new FormData(htmlFormElement)
        : htmlFormElement,
    );
  };
  axiosDefaultConfig.getAdapter = getHttpAdapter;
  axiosDefaultConfig.HttpStatusCode = HttpStatusCodes;
  axiosDefaultConfig.default = axiosDefaultConfig;
  return axiosDefaultConfig;
});
