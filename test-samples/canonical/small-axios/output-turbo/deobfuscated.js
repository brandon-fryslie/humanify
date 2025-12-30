(function (___globalContext, axiosModule) {
  if (typeof exports == "object" && typeof module != "undefined") {
    module.exports = axiosModule();
  } else if (typeof define == "function" && define.amd) {
    define(axiosModule);
  } else {
    (___globalContext =
      typeof globalThis != "undefined"
        ? globalThis
        : ___globalContext || self).axios = axiosModule();
  }
})(this, function () {
  "use strict";

  function getType(___________inputValue) {
    if (typeof Symbol == "function" && typeof Symbol.iterator == "symbol") {
      getType = function (_________________________________inputValue) {
        return typeof _________________________________inputValue;
      };
    } else {
      getType = function (________________inputValue) {
        if (
          ________________inputValue &&
          typeof Symbol == "function" &&
          ________________inputValue.constructor === Symbol &&
          ________________inputValue !== Symbol.prototype
        ) {
          return "symbol";
        } else {
          return typeof ________________inputValue;
        }
      };
    }
    return getType(___________inputValue);
  }
  function _parserOption(_instance, constructorClass) {
    if (!(_instance instanceof constructorClass)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function prototype(___targetObject, propertyDescriptors) {
    for (var _index = 0; _index < propertyDescriptors.length; _index++) {
      var ___propertyDescriptor = propertyDescriptors[_index];
      ___propertyDescriptor.enumerable =
        ___propertyDescriptor.enumerable || false;
      ___propertyDescriptor.configurable = true;
      if ("value" in ___propertyDescriptor) {
        ___propertyDescriptor.writable = true;
      }
      Object.defineProperty(
        ___targetObject,
        ___propertyDescriptor.key,
        ___propertyDescriptor,
      );
    }
  }
  function _propertyCount(
    _constructorFunction,
    prototypeExtension,
    definePrototype,
  ) {
    if (prototypeExtension) {
      prototype(_constructorFunction.prototype, prototypeExtension);
    }
    if (definePrototype) {
      prototype(_constructorFunction, definePrototype);
    }
    Object.defineProperty(_constructorFunction, "prototype", {
      writable: false,
    });
    return _constructorFunction;
  }
  function iteratorFunction(inputValue, maxItems) {
    return (
      (function (_______inputArray) {
        if (Array.isArray(_______inputArray)) {
          return _______inputArray;
        }
      })(inputValue) ||
      (function (iterableInput, limit) {
        var _iteratorFunction =
          iterableInput == null
            ? null
            : (typeof Symbol != "undefined" &&
                iterableInput[Symbol.iterator]) ||
              iterableInput["@@iterator"];
        if (_iteratorFunction == null) {
          return;
        }
        var ___iteratorResult;
        var iterationError;
        var collectedValues = [];
        var isIterationComplete = true;
        var hasErrorOccurred = false;
        try {
          for (
            _iteratorFunction = _iteratorFunction.call(iterableInput);
            !(isIterationComplete = (___iteratorResult =
              _iteratorFunction.next()).done) &&
            (collectedValues.push(___iteratorResult.value),
            !limit || collectedValues.length !== limit);
            isIterationComplete = true
          ) {}
        } catch (____error) {
          hasErrorOccurred = true;
          iterationError = ____error;
        } finally {
          try {
            if (!isIterationComplete && _iteratorFunction.return != null) {
              _iteratorFunction.return();
            }
          } finally {
            if (hasErrorOccurred) {
              throw iterationError;
            }
          }
        }
        return collectedValues;
      })(inputValue, maxItems) ||
      (function (_______inputValue, _callbackFunction) {
        if (!_______inputValue) {
          return;
        }
        if (typeof _______inputValue == "string") {
          return optionIndex(_______inputValue, _callbackFunction);
        }
        var _inputType = Object.prototype.toString
          .call(_______inputValue)
          .slice(8, -1);
        if (_inputType === "Object" && _______inputValue.constructor) {
          _inputType = _______inputValue.constructor.name;
        }
        if (_inputType === "Map" || _inputType === "Set") {
          return Array.from(_______inputValue);
        }
        if (
          _inputType === "Arguments" ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(_inputType)
        ) {
          return optionIndex(_______inputValue, _callbackFunction);
        }
      })(inputValue, maxItems) ||
      (function () {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function optionIndex(optionsArray, optionCount) {
    if (optionCount == null || optionCount > optionsArray.length) {
      optionCount = optionsArray.length;
    }
    var _______currentIndex = 0;
    for (
      var optionsArrayCopy = new Array(optionCount);
      _______currentIndex < optionCount;
      _______currentIndex++
    ) {
      optionsArrayCopy[_______currentIndex] = optionsArray[_______currentIndex];
    }
    return optionsArrayCopy;
  }
  function headerValueString(headerFunction, _context) {
    return function () {
      return headerFunction.apply(_context, arguments);
    };
  }
  var objectTypeMapping;
  var toStringFunction = Object.prototype.toString;
  var getObjectPrototypeOf = Object.getPrototypeOf;
  objectTypeMapping = Object.create(null);
  function getObjectType(___inputObject) {
    var objectTypeString = toStringFunction.call(___inputObject);
    return (objectTypeMapping[objectTypeString] ||= objectTypeString
      .slice(8, -1)
      .toLowerCase());
  }
  function createCaseInsensitiveComparator(_targetString) {
    _targetString = _targetString.toLowerCase();
    return function (______inputParameter) {
      return getObjectType(______inputParameter) === _targetString;
    };
  }
  function currentInterceptorIndex(_expectedType) {
    return function (__________________________________inputValue) {
      return (
        getType(__________________________________inputValue) === _expectedType
      );
    };
  }
  var isArray = Array.isArray;
  var isUndefinedChecker = currentInterceptorIndex("undefined");
  var isArrayBufferType = createCaseInsensitiveComparator("ArrayBuffer");
  var isStringType = currentInterceptorIndex("string");
  var isFunctionType = currentInterceptorIndex("function");
  var isNumberType = currentInterceptorIndex("number");
  function isNonNullObject(_______________________________inputValue) {
    return (
      _______________________________inputValue !== null &&
      getType(_______________________________inputValue) === "object"
    );
  }
  function isPlainObject(____________inputValue) {
    if (getObjectType(____________inputValue) !== "object") {
      return false;
    }
    var inputPrototype = getObjectPrototypeOf(____________inputValue);
    return (
      (inputPrototype === null ||
        inputPrototype === Object.prototype ||
        Object.getPrototypeOf(inputPrototype) === null) &&
      !(Symbol.toStringTag in ____________inputValue) &&
      !(Symbol.iterator in ____________inputValue)
    );
  }
  var isDateType = createCaseInsensitiveComparator("Date");
  var createCaseInsensitiveFileComparator =
    createCaseInsensitiveComparator("File");
  var createCaseInsensitiveComparatorForBlob =
    createCaseInsensitiveComparator("Blob");
  var createCaseInsensitiveComparatorForFileList =
    createCaseInsensitiveComparator("FileList");
  var createCaseInsensitiveComparatorForURLSearchParams =
    createCaseInsensitiveComparator("URLSearchParams");
  function processInputData(_inputData, callbackFunction) {
    var _currentIndex;
    var inputDataLength;
    var inputDataKeys = (
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
    ).allOwnKeys;
    var shouldIncludeAllOwnKeys = inputDataKeys !== undefined && inputDataKeys;
    if (_inputData != null) {
      if (getType(_inputData) !== "object") {
        _inputData = [_inputData];
      }
      if (isArray(_inputData)) {
        _currentIndex = 0;
        inputDataLength = _inputData.length;
        for (; _currentIndex < inputDataLength; _currentIndex++) {
          callbackFunction.call(
            null,
            _inputData[_currentIndex],
            _currentIndex,
            _inputData,
          );
        }
      } else {
        var propertyKey;
        var propertyNames = shouldIncludeAllOwnKeys
          ? Object.getOwnPropertyNames(_inputData)
          : Object.keys(_inputData);
        var __propertyCount = propertyNames.length;
        for (
          _currentIndex = 0;
          _currentIndex < __propertyCount;
          _currentIndex++
        ) {
          propertyKey = propertyNames[_currentIndex];
          callbackFunction.call(
            null,
            _inputData[propertyKey],
            propertyKey,
            _inputData,
          );
        }
      }
    }
  }
  function findMatchingKey(objectToFindKey, searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    var ___currentKey;
    var objectKeysArray = Object.keys(objectToFindKey);
    for (var ___index = objectKeysArray.length; ___index-- > 0; ) {
      if (
        searchTerm === (___currentKey = objectKeysArray[___index]).toLowerCase()
      ) {
        return ___currentKey;
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
  function isInputValueValid(________________________________inputValue) {
    return (
      !isUndefinedChecker(________________________________inputValue) &&
      ________________________________inputValue !== globalContext
    );
  }
  var isUint8ArrayDefined;
  isUint8ArrayDefined =
    typeof Uint8Array != "undefined" && getObjectPrototypeOf(Uint8Array);
  function isValidUint8Array(uint8Array) {
    return isUint8ArrayDefined && uint8Array instanceof isUint8ArrayDefined;
  }
  var isHTMLFormElement = createCaseInsensitiveComparator("HTMLFormElement");
  var hasOwnPropertyChecker = (function () {
    var hasOwnPropertyCheck = Object.prototype.hasOwnProperty;
    return function (objectToCheck, ___propertyKey) {
      return hasOwnPropertyCheck.call(objectToCheck, ___propertyKey);
    };
  })();
  var regExpCaseInsensitiveComparator =
    createCaseInsensitiveComparator("RegExp");
  function processInputDescriptors(__inputObject, descriptorCallback) {
    var inputPropertyDescriptors =
      Object.getOwnPropertyDescriptors(__inputObject);
    var processedDescriptors = {};
    processInputData(
      inputPropertyDescriptors,
      function (inputDescriptor, descriptorKey) {
        var descriptorValue;
        if (
          (descriptorValue = descriptorCallback(
            inputDescriptor,
            descriptorKey,
            __inputObject,
          )) !== false
        ) {
          processedDescriptors[descriptorKey] =
            descriptorValue || inputDescriptor;
        }
      },
    );
    Object.defineProperties(__inputObject, processedDescriptors);
  }
  var alphabetLowercase = "abcdefghijklmnopqrstuvwxyz";
  var numericCharacters = "0123456789";
  var textualCharacterSets = {
    DIGIT: numericCharacters,
    ALPHA: alphabetLowercase,
    ALPHA_DIGIT:
      alphabetLowercase + alphabetLowercase.toUpperCase() + numericCharacters,
  };
  var isAsyncFunction = createCaseInsensitiveComparator("AsyncFunction");
  var typeCheckFunctions = {
    isArray: isArray,
    isArrayBuffer: isArrayBufferType,
    isBuffer: function (_event) {
      return (
        _event !== null &&
        !isUndefinedChecker(_event) &&
        _event.constructor !== null &&
        !isUndefinedChecker(_event.constructor) &&
        isFunctionType(_event.constructor.isBuffer) &&
        _event.constructor.isBuffer(_event)
      );
    },
    isFormData: function (__formData) {
      var formDataType;
      return (
        __formData &&
        ((typeof FormData == "function" && __formData instanceof FormData) ||
          (isFunctionType(__formData.append) &&
            ((formDataType = getObjectType(__formData)) === "formdata" ||
              (formDataType === "object" &&
                isFunctionType(__formData.toString) &&
                __formData.toString() === "[object FormData]"))))
      );
    },
    isArrayBufferView: function (_________________inputValue) {
      if (typeof ArrayBuffer != "undefined" && ArrayBuffer.isView) {
        return ArrayBuffer.isView(_________________inputValue);
      } else {
        return (
          _________________inputValue &&
          _________________inputValue.buffer &&
          isArrayBufferType(_________________inputValue.buffer)
        );
      }
    },
    isString: isStringType,
    isNumber: isNumberType,
    isBoolean: function (booleanValue) {
      return booleanValue === true || booleanValue === false;
    },
    isObject: isNonNullObject,
    isPlainObject: isPlainObject,
    isUndefined: isUndefinedChecker,
    isDate: isDateType,
    isFile: createCaseInsensitiveFileComparator,
    isBlob: createCaseInsensitiveComparatorForBlob,
    isRegExp: regExpCaseInsensitiveComparator,
    isFunction: isFunctionType,
    isStream: function (______event) {
      return isNonNullObject(______event) && isFunctionType(______event.pipe);
    },
    isURLSearchParams: createCaseInsensitiveComparatorForURLSearchParams,
    isTypedArray: isValidUint8Array,
    isFileList: createCaseInsensitiveComparatorForFileList,
    forEach: processInputData,
    merge: function mergeProperties() {
      var isCaseless = ((isInputValueValid(this) && this) || {}).caseless;
      var mergedProperties = {};
      var propertyMergerFunction = function (
        propertyValueOrDefault,
        _propertyValue,
      ) {
        var matchingKey =
          (isCaseless && findMatchingKey(mergedProperties, _propertyValue)) ||
          _propertyValue;
        if (
          isPlainObject(mergedProperties[matchingKey]) &&
          isPlainObject(propertyValueOrDefault)
        ) {
          mergedProperties[matchingKey] = mergeProperties(
            mergedProperties[matchingKey],
            propertyValueOrDefault,
          );
        } else if (isPlainObject(propertyValueOrDefault)) {
          mergedProperties[matchingKey] = mergeProperties(
            {},
            propertyValueOrDefault,
          );
        } else if (isArray(propertyValueOrDefault)) {
          mergedProperties[matchingKey] = propertyValueOrDefault.slice();
        } else {
          mergedProperties[matchingKey] = propertyValueOrDefault;
        }
      };
      var ___argumentIndex = 0;
      for (
        var argumentsCount = arguments.length;
        ___argumentIndex < argumentsCount;
        ___argumentIndex++
      ) {
        if (arguments[___argumentIndex]) {
          processInputData(arguments[___argumentIndex], propertyMergerFunction);
        }
      }
      return mergedProperties;
    },
    extend: function (_headerMap, ___headerValue, headerValueType) {
      processInputData(
        ___headerValue,
        function (____headerValue, _headerKey) {
          if (headerValueType && isFunctionType(____headerValue)) {
            _headerMap[_headerKey] = headerValueString(
              ____headerValue,
              headerValueType,
            );
          } else {
            _headerMap[_headerKey] = ____headerValue;
          }
        },
        {
          allOwnKeys: (arguments.length > 3 && arguments[3] !== undefined
            ? arguments[3]
            : {}
          ).allOwnKeys,
        },
      );
      return _headerMap;
    },
    trim: function (__________inputString) {
      if (__________inputString.trim) {
        return __________inputString.trim();
      } else {
        return __________inputString.replace(
          /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
          "",
        );
      }
    },
    stripBOM: function (_____________inputString) {
      if (_____________inputString.charCodeAt(0) === 65279) {
        _____________inputString = _____________inputString.slice(1);
      }
      return _____________inputString;
    },
    inherits: function (
      childClass,
      superClass,
      prototypeProperties,
      _prototypeProperties,
    ) {
      childClass.prototype = Object.create(
        superClass.prototype,
        _prototypeProperties,
      );
      childClass.prototype.constructor = childClass;
      Object.defineProperty(childClass, "super", {
        value: superClass.prototype,
      });
      if (prototypeProperties) {
        Object.assign(childClass.prototype, prototypeProperties);
      }
    },
    toFlatObject: function (
      sourceObject,
      _targetObject,
      _sourceObject,
      propertyAccessor,
    ) {
      var _propertyNames;
      var propertyCount;
      var _propertyName;
      var copiedProperties = {};
      _targetObject = _targetObject || {};
      if (sourceObject == null) {
        return _targetObject;
      }
      do {
        for (
          propertyCount = (_propertyNames =
            Object.getOwnPropertyNames(sourceObject)).length;
          propertyCount-- > 0;

        ) {
          _propertyName = _propertyNames[propertyCount];
          if (
            (!propertyAccessor ||
              !!propertyAccessor(_propertyName, sourceObject, _targetObject)) &&
            !copiedProperties[_propertyName]
          ) {
            _targetObject[_propertyName] = sourceObject[_propertyName];
            copiedProperties[_propertyName] = true;
          }
        }
        sourceObject =
          _sourceObject !== false && getObjectPrototypeOf(sourceObject);
      } while (
        sourceObject &&
        (!_sourceObject || _sourceObject(sourceObject, _targetObject)) &&
        sourceObject !== Object.prototype
      );
      return _targetObject;
    },
    kindOf: getObjectType,
    kindOfTest: createCaseInsensitiveComparator,
    endsWith: function (_______inputString, searchString, substringPosition) {
      _______inputString = String(_______inputString);
      if (
        substringPosition === undefined ||
        substringPosition > _______inputString.length
      ) {
        substringPosition = _______inputString.length;
      }
      substringPosition -= searchString.length;
      var searchIndex = _______inputString.indexOf(
        searchString,
        substringPosition,
      );
      return searchIndex !== -1 && searchIndex === substringPosition;
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
      var arrayCopy = new Array(elementLength);
      while (elementLength-- > 0) {
        arrayCopy[elementLength] = _inputArray[elementLength];
      }
      return arrayCopy;
    },
    forEachEntry: function (iterableCollection, ___callbackFunction) {
      var _iteratorResult;
      for (
        var iterator = (
          iterableCollection && iterableCollection[Symbol.iterator]
        ).call(iterableCollection);
        (_iteratorResult = iterator.next()) && !_iteratorResult.done;

      ) {
        var itemPair = _iteratorResult.value;
        ___callbackFunction.call(iterableCollection, itemPair[0], itemPair[1]);
      }
    },
    matchAll: function (_regexMatch, ____________inputString) {
      var __regexMatch;
      for (
        var matchingResults = [];
        (__regexMatch = _regexMatch.exec(____________inputString)) !== null;

      ) {
        matchingResults.push(__regexMatch);
      }
      return matchingResults;
    },
    isHTMLForm: isHTMLFormElement,
    hasOwnProperty: hasOwnPropertyChecker,
    hasOwnProp: hasOwnPropertyChecker,
    reduceDescriptors: processInputDescriptors,
    freezeMethods: function (objectToProcess) {
      processInputDescriptors(
        objectToProcess,
        function (propertyDescriptor, __propertyName) {
          if (
            isFunctionType(objectToProcess) &&
            ["arguments", "caller", "callee"].indexOf(__propertyName) !== -1
          ) {
            return false;
          }
          var propertyValue = objectToProcess[__propertyName];
          if (isFunctionType(propertyValue)) {
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
    toObjectSet: function (____inputArray, delimiter) {
      var uniqueValuesMap = {};
      function recordUniqueValues(______inputArray) {
        ______inputArray.forEach(function (uniqueValueKey) {
          uniqueValuesMap[uniqueValueKey] = true;
        });
      }
      if (isArray(____inputArray)) {
        recordUniqueValues(____inputArray);
      } else {
        recordUniqueValues(String(____inputArray).split(delimiter));
      }
      return uniqueValuesMap;
    },
    toCamelCase: function (___________inputString) {
      return ___________inputString
        .toLowerCase()
        .replace(
          /[-_\s]([a-z\d])(\w*)/g,
          function (____event, textInput, additionalString) {
            return textInput.toUpperCase() + additionalString;
          },
        );
    },
    noop: function () {},
    toFiniteNumber: function (
      _______________________inputValue,
      fallbackValue,
    ) {
      _______________________inputValue = +_______________________inputValue;
      if (Number.isFinite(_______________________inputValue)) {
        return _______________________inputValue;
      } else {
        return fallbackValue;
      }
    },
    findKey: findMatchingKey,
    global: globalContext,
    isContextDefined: isInputValueValid,
    ALPHABET: textualCharacterSets,
    generateString: function () {
      var lengthOfCharactersToGenerate =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;
      var characterSet =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : textualCharacterSets.ALPHA_DIGIT;
      var randomString = "";
      for (
        var characterSetLength = characterSet.length;
        lengthOfCharactersToGenerate--;

      ) {
        randomString += characterSet[(Math.random() * characterSetLength) | 0];
      }
      return randomString;
    },
    isSpecCompliantForm: function (___formData) {
      return (
        !!___formData &&
        !!isFunctionType(___formData.append) &&
        ___formData[Symbol.toStringTag] === "FormData" &&
        !!___formData[Symbol.iterator]
      );
    },
    toJSONObject: function (inputParameter) {
      var trackedArray = new Array(10);
      return (function processNestedObject(________inputValue, currentDepth) {
        if (isNonNullObject(________inputValue)) {
          if (trackedArray.indexOf(________inputValue) >= 0) {
            return;
          }
          if (!("toJSON" in ________inputValue)) {
            trackedArray[currentDepth] = ________inputValue;
            var structuredClone = isArray(________inputValue) ? [] : {};
            processInputData(
              ________inputValue,
              function (nestedObject, cloneIndex) {
                var processedNestedObject = processNestedObject(
                  nestedObject,
                  currentDepth + 1,
                );
                if (!isUndefinedChecker(processedNestedObject)) {
                  structuredClone[cloneIndex] = processedNestedObject;
                }
              },
            );
            trackedArray[currentDepth] = undefined;
            return structuredClone;
          }
        }
        return ________inputValue;
      })(inputParameter, 0);
    },
    isAsyncFn: isAsyncFunction,
    isThenable: function (__event) {
      return (
        __event &&
        (isNonNullObject(__event) || isFunctionType(__event)) &&
        isFunctionType(__event.then) &&
        isFunctionType(__event.catch)
      );
    },
  };
  function AxiosError(
    errorMessage,
    errorCode,
    _config,
    requestObject,
    httpResponse,
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
    if (_config) {
      this.config = _config;
    }
    if (requestObject) {
      this.request = requestObject;
    }
    if (httpResponse) {
      this.response = httpResponse;
    }
  }
  typeCheckFunctions.inherits(AxiosError, Error, {
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
        config: typeCheckFunctions.toJSONObject(this.config),
        code: this.code,
        status:
          this.response && this.response.status ? this.response.status : null,
      };
    },
  });
  var axiosErrorPrototype = AxiosError.prototype;
  var axiosErrorConstants = {};
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
  ].forEach(function (_____errorCode) {
    axiosErrorConstants[_____errorCode] = {
      value: _____errorCode,
    };
  });
  Object.defineProperties(AxiosError, axiosErrorConstants);
  Object.defineProperty(axiosErrorPrototype, "isAxiosError", {
    value: true,
  });
  AxiosError.from = function (
    errorObject,
    _errorCode,
    __errorCode,
    ___errorCode,
    errorResponse,
    additionalProperties,
  ) {
    var axiosErrorInstance = Object.create(axiosErrorPrototype);
    typeCheckFunctions.toFlatObject(
      errorObject,
      axiosErrorInstance,
      function (__errorObject) {
        return __errorObject !== Error.prototype;
      },
      function (_errorType) {
        return _errorType !== "isAxiosError";
      },
    );
    AxiosError.call(
      axiosErrorInstance,
      errorObject.message,
      _errorCode,
      __errorCode,
      ___errorCode,
      errorResponse,
    );
    axiosErrorInstance.cause = errorObject;
    axiosErrorInstance.name = errorObject.name;
    if (additionalProperties) {
      Object.assign(axiosErrorInstance, additionalProperties);
    }
    return axiosErrorInstance;
  };
  function isObjectOrArray(______________________________inputValue) {
    return (
      typeCheckFunctions.isPlainObject(
        ______________________________inputValue,
      ) || typeCheckFunctions.isArray(______________________________inputValue)
    );
  }
  function removeTrailingArrayBrackets(arrayEndingString) {
    if (typeCheckFunctions.endsWith(arrayEndingString, "[]")) {
      return arrayEndingString.slice(0, -2);
    } else {
      return arrayEndingString;
    }
  }
  function concatAndFormatArray(
    ___inputArray,
    additionalElement,
    isArrayNotEmpty,
  ) {
    if (___inputArray) {
      return ___inputArray
        .concat(additionalElement)
        .map(function (elementValue, formatString) {
          elementValue = removeTrailingArrayBrackets(elementValue);
          if (!isArrayNotEmpty && formatString) {
            return "[" + elementValue + "]";
          } else {
            return elementValue;
          }
        })
        .join(isArrayNotEmpty ? "." : "");
    } else {
      return additionalElement;
    }
  }
  var _typeCheckFunctions = typeCheckFunctions.toFlatObject(
    typeCheckFunctions,
    {},
    null,
    function (isUppercasePrefix) {
      return /^is[A-Z]/.test(isUppercasePrefix);
    },
  );
  function _processFormData(targetObject, formData, options) {
    if (!typeCheckFunctions.isObject(targetObject)) {
      throw new TypeError("target must be an object");
    }
    formData = formData || new FormData();
    var metaTokensOptions = (options = typeCheckFunctions.toFlatObject(
      options,
      {
        metaTokens: true,
        dots: false,
        indexes: false,
      },
      false,
      function (__propertyKey, dataForKey) {
        return !typeCheckFunctions.isUndefined(dataForKey[__propertyKey]);
      },
    )).metaTokens;
    var ________currentIndex = options.visitor || __processInputValue;
    var optionsDots = options.dots;
    var isIndexesEnabled = options.indexes;
    var isBlobSupported =
      (options.Blob || (typeof Blob != "undefined" && Blob)) &&
      typeCheckFunctions.isSpecCompliantForm(formData);
    if (!typeCheckFunctions.isFunction(________currentIndex)) {
      throw new TypeError("visitor must be a function");
    }
    function _processInputValue(______inputValue) {
      if (______inputValue === null) {
        return "";
      }
      if (typeCheckFunctions.isDate(______inputValue)) {
        return ______inputValue.toISOString();
      }
      if (!isBlobSupported && typeCheckFunctions.isBlob(______inputValue)) {
        throw new AxiosError("Blob is not supported. Use a Buffer instead.");
      }
      if (
        typeCheckFunctions.isArrayBuffer(______inputValue) ||
        typeCheckFunctions.isTypedArray(______inputValue)
      ) {
        if (isBlobSupported && typeof Blob == "function") {
          return new Blob([______inputValue]);
        } else {
          return Buffer.from(______inputValue);
        }
      } else {
        return ______inputValue;
      }
    }
    function __processInputValue(__inputValue, variableName, ___inputValue) {
      var _______________________________________inputValue = __inputValue;
      if (
        __inputValue &&
        !___inputValue &&
        getType(__inputValue) === "object"
      ) {
        if (typeCheckFunctions.endsWith(variableName, "{}")) {
          if (metaTokensOptions) {
            variableName = variableName;
          } else {
            variableName = variableName.slice(0, -2);
          }
          __inputValue = JSON.stringify(__inputValue);
        } else if (
          (typeCheckFunctions.isArray(__inputValue) &&
            (function (________inputArray) {
              return (
                typeCheckFunctions.isArray(________inputArray) &&
                !________inputArray.some(isObjectOrArray)
              );
            })(__inputValue)) ||
          ((typeCheckFunctions.isFileList(__inputValue) ||
            typeCheckFunctions.endsWith(variableName, "[]")) &&
            (_______________________________________inputValue =
              typeCheckFunctions.toArray(__inputValue)))
        ) {
          variableName = removeTrailingArrayBrackets(variableName);
          _______________________________________inputValue.forEach(
            function (eventData, formDataValue) {
              if (
                !typeCheckFunctions.isUndefined(eventData) &&
                eventData !== null
              ) {
                formData.append(
                  isIndexesEnabled === true
                    ? concatAndFormatArray(
                        [variableName],
                        formDataValue,
                        optionsDots,
                      )
                    : isIndexesEnabled === null
                      ? variableName
                      : variableName + "[]",
                  _processInputValue(eventData),
                );
              }
            },
          );
          return false;
        }
      }
      return (
        !!isObjectOrArray(__inputValue) ||
        (formData.append(
          concatAndFormatArray(___inputValue, variableName, optionsDots),
          _processInputValue(__inputValue),
        ),
        false)
      );
    }
    var circularReferenceTracker = [];
    var formDataOptions = Object.assign(_typeCheckFunctions, {
      defaultVisitor: __processInputValue,
      convertValue: _processInputValue,
      isVisitable: isObjectOrArray,
    });
    if (!typeCheckFunctions.isObject(targetObject)) {
      throw new TypeError("data must be an object");
    }
    (function processReferenceElement(referenceElement, propertyPath) {
      if (!typeCheckFunctions.isUndefined(referenceElement)) {
        if (circularReferenceTracker.indexOf(referenceElement) !== -1) {
          throw Error(
            "Circular reference detected in " + propertyPath.join("."),
          );
        }
        circularReferenceTracker.push(referenceElement);
        typeCheckFunctions.forEach(
          referenceElement,
          function (__________________inputValue, __propertyValue) {
            if (
              (!typeCheckFunctions.isUndefined(__________________inputValue) &&
                __________________inputValue !== null &&
                ________currentIndex.call(
                  formData,
                  __________________inputValue,
                  typeCheckFunctions.isString(__propertyValue)
                    ? __propertyValue.trim()
                    : __propertyValue,
                  propertyPath,
                  formDataOptions,
                )) === true
            ) {
              processReferenceElement(
                __________________inputValue,
                propertyPath
                  ? propertyPath.concat(__propertyValue)
                  : [__propertyValue],
              );
            }
          },
        );
        circularReferenceTracker.pop();
      }
    })(targetObject);
    return formData;
  }
  function encodeSpecialCharacters(___inputString) {
    var specialCharacterEncodingMap = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0",
    };
    return encodeURIComponent(___inputString).replace(
      /[!'()~]|%20|%00/g,
      function (_key) {
        return specialCharacterEncodingMap[_key];
      },
    );
  }
  function _processInputData(__inputData, ____callbackFunction) {
    this._pairs = [];
    if (__inputData) {
      _processFormData(__inputData, this, ____callbackFunction);
    }
  }
  var __processInputData = _processInputData.prototype;
  function encodeUriComponent(________inputString) {
    return encodeURIComponent(________inputString)
      .replace(/%3A/gi, ":")
      .replace(/%24/g, "$")
      .replace(/%2C/gi, ",")
      .replace(/%20/g, "+")
      .replace(/%5B/gi, "[")
      .replace(/%5D/gi, "]");
  }
  function generateUrlWithParams(baseUrl, queryStringParameters, parameters) {
    if (!queryStringParameters) {
      return baseUrl;
    }
    var serializedQueryString;
    var uriEncodingFunction =
      (parameters && parameters.encode) || encodeUriComponent;
    var queryStringSerializer = parameters && parameters.serialize;
    if (
      (serializedQueryString = queryStringSerializer
        ? queryStringSerializer(queryStringParameters, parameters)
        : typeCheckFunctions.isURLSearchParams(queryStringParameters)
          ? queryStringParameters.toString()
          : new _processInputData(queryStringParameters, parameters).toString(
              uriEncodingFunction,
            ))
    ) {
      var hashIndex = baseUrl.indexOf("#");
      if (hashIndex !== -1) {
        baseUrl = baseUrl.slice(0, hashIndex);
      }
      baseUrl +=
        (baseUrl.indexOf("?") === -1 ? "?" : "&") + serializedQueryString;
    }
    return baseUrl;
  }
  __processInputData.append = function (__element, _value) {
    this._pairs.push([__element, _value]);
  };
  __processInputData.toString = function (eventHandler) {
    var transformValue = eventHandler
      ? function (___eventData) {
          return eventHandler.call(this, ___eventData, encodeSpecialCharacters);
        }
      : encodeSpecialCharacters;
    return this._pairs
      .map(function (valuePair) {
        return (
          transformValue(valuePair[0]) + "=" + transformValue(valuePair[1])
        );
      }, "")
      .join("&");
  };
  var typeOf;
  var initializeHandler = (function () {
    function initializeParser() {
      _parserOption(this, initializeParser);
      this.handlers = [];
    }
    _propertyCount(initializeParser, [
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
        value: function (eventKey) {
          this.handlers[eventKey] &&= null;
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
          typeCheckFunctions.forEach(
            this.handlers,
            function (_____inputParameter) {
              if (_____inputParameter !== null) {
                handlerCallback(_____inputParameter);
              }
            },
          );
        },
      },
    ]);
    return initializeParser;
  })();
  var axiosRequestConfig = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false,
  };
  var environmentSupportFeatures = {
    isBrowser: true,
    classes: {
      URLSearchParams:
        typeof URLSearchParams != "undefined"
          ? URLSearchParams
          : _processInputData,
      FormData: typeof FormData != "undefined" ? FormData : null,
      Blob: typeof Blob != "undefined" ? Blob : null,
    },
    isStandardBrowserEnv:
      (typeof navigator == "undefined" ||
        ((typeOf = navigator.product) !== "ReactNative" &&
          typeOf !== "NativeScript" &&
          typeOf !== "NS")) &&
      typeof window != "undefined" &&
      typeof document != "undefined",
    isStandardBrowserWebWorkerEnv:
      typeof WorkerGlobalScope != "undefined" &&
      self instanceof WorkerGlobalScope &&
      typeof self.importScripts == "function",
    protocols: ["http", "https", "file", "blob", "url", "data"],
  };
  function processFormData(_formData) {
    function __currentKey(inputArray, index, resultArray, currentIndex) {
      var currentValue = inputArray[currentIndex++];
      var isFiniteValue = Number.isFinite(+currentValue);
      var isEndOfArray = currentIndex >= inputArray.length;
      if (!currentValue && typeCheckFunctions.isArray(resultArray)) {
        currentValue = resultArray.length;
      } else {
        currentValue = currentValue;
      }
      if (isEndOfArray) {
        if (typeCheckFunctions.hasOwnProp(resultArray, currentValue)) {
          resultArray[currentValue] = [resultArray[currentValue], index];
        } else {
          resultArray[currentValue] = index;
        }
        return !isFiniteValue;
      } else {
        if (
          !resultArray[currentValue] ||
          !typeCheckFunctions.isObject(resultArray[currentValue])
        ) {
          resultArray[currentValue] = [];
        }
        if (
          __currentKey(
            inputArray,
            index,
            resultArray[currentValue],
            currentIndex,
          ) &&
          typeCheckFunctions.isArray(resultArray[currentValue])
        ) {
          resultArray[currentValue] = (function (_inputObject) {
            var __index;
            var currentKey;
            var mappedObject = {};
            var _objectKeys = Object.keys(_inputObject);
            var keysCount = _objectKeys.length;
            for (__index = 0; __index < keysCount; __index++) {
              mappedObject[(currentKey = _objectKeys[__index])] =
                _inputObject[currentKey];
            }
            return mappedObject;
          })(resultArray[currentValue]);
        }
        return !isFiniteValue;
      }
    }
    if (
      typeCheckFunctions.isFormData(_formData) &&
      typeCheckFunctions.isFunction(_formData.entries)
    ) {
      var formDataMap = {};
      typeCheckFunctions.forEachEntry(
        _formData,
        function (__inputString, matchedResults) {
          __currentKey(
            (function (_____inputString) {
              return typeCheckFunctions
                .matchAll(/\w+|\[(\w*)]/g, _____inputString)
                .map(function (_____inputArray) {
                  if (_____inputArray[0] === "[]") {
                    return "";
                  } else {
                    return _____inputArray[1] || _____inputArray[0];
                  }
                });
            })(__inputString),
            matchedResults,
            formDataMap,
            0,
          );
        },
      );
      return formDataMap;
    }
    return null;
  }
  var _axiosRequestConfig = {
    transitional: axiosRequestConfig,
    adapter: ["xhr", "http"],
    transformRequest: [
      function (inputData, contentHandler) {
        var parsedContent;
        var _contentType = contentHandler.getContentType() || "";
        var isJsonContentType = _contentType.indexOf("application/json") > -1;
        var isInputDataValid = typeCheckFunctions.isObject(inputData);
        if (isInputDataValid && typeCheckFunctions.isHTMLForm(inputData)) {
          inputData = new FormData(inputData);
        }
        if (typeCheckFunctions.isFormData(inputData)) {
          if (isJsonContentType && isJsonContentType) {
            return JSON.stringify(processFormData(inputData));
          } else {
            return inputData;
          }
        }
        if (
          typeCheckFunctions.isArrayBuffer(inputData) ||
          typeCheckFunctions.isBuffer(inputData) ||
          typeCheckFunctions.isStream(inputData) ||
          typeCheckFunctions.isFile(inputData) ||
          typeCheckFunctions.isBlob(inputData)
        ) {
          return inputData;
        }
        if (typeCheckFunctions.isArrayBufferView(inputData)) {
          return inputData.buffer;
        }
        if (typeCheckFunctions.isURLSearchParams(inputData)) {
          contentHandler.setContentType(
            "application/x-www-form-urlencoded;charset=utf-8",
            false,
          );
          return inputData.toString();
        }
        if (isInputDataValid) {
          if (_contentType.indexOf("application/x-www-form-urlencoded") > -1) {
            return (function (event, urlSearchParamsOptions) {
              return _processFormData(
                event,
                new environmentSupportFeatures.classes.URLSearchParams(),
                Object.assign(
                  {
                    visitor: function (
                      inputElement,
                      base64StringKey,
                      bufferData,
                      defaultVisitorFunction,
                    ) {
                      if (
                        environmentSupportFeatures.isNode &&
                        typeCheckFunctions.isBuffer(inputElement)
                      ) {
                        this.append(
                          base64StringKey,
                          inputElement.toString("base64"),
                        );
                        return false;
                      } else {
                        return defaultVisitorFunction.defaultVisitor.apply(
                          this,
                          arguments,
                        );
                      }
                    },
                  },
                  urlSearchParamsOptions,
                ),
              );
            })(inputData, this.formSerializer).toString();
          }
          if (
            (parsedContent = typeCheckFunctions.isFileList(inputData)) ||
            _contentType.indexOf("multipart/form-data") > -1
          ) {
            var formDataConstructor = this.env && this.env.FormData;
            return _processFormData(
              parsedContent
                ? {
                    "files[]": inputData,
                  }
                : inputData,
              formDataConstructor && new formDataConstructor(),
              this.formSerializer,
            );
          }
        }
        if (isInputDataValid || isJsonContentType) {
          contentHandler.setContentType("application/json", false);
          return (function (_inputString, jsonParser, jsonStringifier) {
            if (typeCheckFunctions.isString(_inputString)) {
              try {
                (jsonParser || JSON.parse)(_inputString);
                return typeCheckFunctions.trim(_inputString);
              } catch (_error) {
                if (_error.name !== "SyntaxError") {
                  throw _error;
                }
              }
            }
            return (jsonStringifier || JSON.stringify)(_inputString);
          })(inputData);
        } else {
          return inputData;
        }
      },
    ],
    transformResponse: [
      function (jsonResponse) {
        var transitionalSettings =
          this.transitional || _axiosRequestConfig.transitional;
        var isJsonParsingForced =
          transitionalSettings && transitionalSettings.forcedJSONParsing;
        var isResponseJson = this.responseType === "json";
        if (
          jsonResponse &&
          typeCheckFunctions.isString(jsonResponse) &&
          ((isJsonParsingForced && !this.responseType) || isResponseJson)
        ) {
          var shouldParseJson =
            (!transitionalSettings ||
              !transitionalSettings.silentJSONParsing) &&
            isResponseJson;
          try {
            return JSON.parse(jsonResponse);
          } catch (error) {
            if (shouldParseJson) {
              if (error.name === "SyntaxError") {
                throw AxiosError.from(
                  error,
                  AxiosError.ERR_BAD_RESPONSE,
                  this,
                  null,
                  this.response,
                );
              }
              throw error;
            }
          }
        }
        return jsonResponse;
      },
    ],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: environmentSupportFeatures.classes.FormData,
      Blob: environmentSupportFeatures.classes.Blob,
    },
    validateStatus: function (httpResponseStatus) {
      return httpResponseStatus >= 200 && httpResponseStatus < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": undefined,
      },
    },
  };
  typeCheckFunctions.forEach(
    ["delete", "get", "head", "post", "put", "patch"],
    function (___headerKey) {
      _axiosRequestConfig.headers[___headerKey] = {};
    },
  );
  var axiosInstance = _axiosRequestConfig;
  var headerFieldsSet = typeCheckFunctions.toObjectSet([
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
  function normalizeInput(_____________________________inputValue) {
    return (
      _____________________________inputValue &&
      String(_____________________________inputValue).trim().toLowerCase()
    );
  }
  function transformInputValue(_____________________inputValue) {
    if (
      _____________________inputValue === false ||
      _____________________inputValue == null
    ) {
      return _____________________inputValue;
    } else if (typeCheckFunctions.isArray(_____________________inputValue)) {
      return _____________________inputValue.map(transformInputValue);
    } else {
      return String(_____________________inputValue);
    }
  }
  function executeSearchCriteria(
    _________inputValue,
    targetString,
    __________inputValue,
    searchCriteria,
    shouldReplaceTargetString,
  ) {
    if (typeCheckFunctions.isFunction(searchCriteria)) {
      return searchCriteria.call(this, targetString, __________inputValue);
    } else {
      if (shouldReplaceTargetString) {
        targetString = __________inputValue;
      }
      if (typeCheckFunctions.isString(targetString)) {
        if (typeCheckFunctions.isString(searchCriteria)) {
          return targetString.indexOf(searchCriteria) !== -1;
        } else if (typeCheckFunctions.isRegExp(searchCriteria)) {
          return searchCriteria.test(targetString);
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
  }
  var keyFilterHandler = (function () {
    function isKeyFiltered(option) {
      _parserOption(this, isKeyFiltered);
      if (option) {
        this.set(option);
      }
    }
    _propertyCount(
      isKeyFiltered,
      [
        {
          key: "set",
          value: function (__input, headerField, headerName) {
            var context = this;
            function __headerName(
              __headerValue,
              _headerName,
              isHeaderRequired,
            ) {
              var validatedHeaderName = normalizeInput(_headerName);
              if (!validatedHeaderName) {
                throw new Error("header name must be a non-empty string");
              }
              var headerNameIndex = typeCheckFunctions.findKey(
                context,
                validatedHeaderName,
              );
              if (
                !headerNameIndex ||
                context[headerNameIndex] === undefined ||
                isHeaderRequired === true ||
                (isHeaderRequired === undefined &&
                  context[headerNameIndex] !== false)
              ) {
                context[headerNameIndex || _headerName] =
                  transformInputValue(__headerValue);
              }
            }
            var headerValue;
            var headerKey;
            var _headerValue;
            var headerValueIndex;
            var headerMap;
            function processHeaderItems(headerElements, ____headerName) {
              return typeCheckFunctions.forEach(
                headerElements,
                function (headerEvent, headerIndex) {
                  return __headerName(headerEvent, headerIndex, ____headerName);
                },
              );
            }
            if (
              typeCheckFunctions.isPlainObject(__input) ||
              __input instanceof this.constructor
            ) {
              processHeaderItems(__input, headerField);
            } else if (
              typeCheckFunctions.isString(__input) &&
              (__input = __input.trim()) &&
              !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(__input.trim())
            ) {
              processHeaderItems(
                ((headerMap = {}),
                (headerValue = __input) &&
                  headerValue.split("\n").forEach(function (headerLine) {
                    headerValueIndex = headerLine.indexOf(":");
                    headerKey = headerLine
                      .substring(0, headerValueIndex)
                      .trim()
                      .toLowerCase();
                    _headerValue = headerLine
                      .substring(headerValueIndex + 1)
                      .trim();
                    if (
                      !!headerKey &&
                      (!headerMap[headerKey] || !headerFieldsSet[headerKey])
                    ) {
                      if (headerKey === "set-cookie") {
                        if (headerMap[headerKey]) {
                          headerMap[headerKey].push(_headerValue);
                        } else {
                          headerMap[headerKey] = [_headerValue];
                        }
                      } else {
                        headerMap[headerKey] = headerMap[headerKey]
                          ? headerMap[headerKey] + ", " + _headerValue
                          : _headerValue;
                      }
                    }
                  }),
                headerMap),
                headerField,
              );
            } else if (__input != null) {
              __headerName(headerField, __input, headerName);
            }
            return this;
          },
        },
        {
          key: "get",
          value: function (_inputValue, parserOption) {
            if ((_inputValue = normalizeInput(_inputValue))) {
              var foundKey = typeCheckFunctions.findKey(this, _inputValue);
              if (foundKey) {
                var parsedData = this[foundKey];
                if (!parserOption) {
                  return parsedData;
                }
                if (parserOption === true) {
                  return (function (____inputString) {
                    var regexMatch;
                    var parsedObject = Object.create(null);
                    for (
                      var regexPattern = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
                      (regexMatch = regexPattern.exec(____inputString));

                    ) {
                      parsedObject[regexMatch[1]] = regexMatch[2];
                    }
                    return parsedObject;
                  })(parsedData);
                }
                if (typeCheckFunctions.isFunction(parserOption)) {
                  return parserOption.call(this, parsedData, foundKey);
                }
                if (typeCheckFunctions.isRegExp(parserOption)) {
                  return parserOption.exec(parsedData);
                }
                throw new TypeError("parser must be boolean|regexp|function");
              }
            }
          },
        },
        {
          key: "has",
          value: function (_element, queryOrCondition) {
            if ((_element = normalizeInput(_element))) {
              var ___foundKey = typeCheckFunctions.findKey(this, _element);
              return (
                !!___foundKey &&
                this[___foundKey] !== undefined &&
                (!queryOrCondition ||
                  !!executeSearchCriteria(
                    0,
                    this[___foundKey],
                    ___foundKey,
                    queryOrCondition,
                  ))
              );
            }
            return false;
          },
        },
        {
          key: "delete",
          value: function (elementToRemove, filterCondition) {
            var _currentContext = this;
            var isModified = false;
            function keyToDelete(element) {
              if ((element = normalizeInput(element))) {
                var _foundKey = typeCheckFunctions.findKey(
                  _currentContext,
                  element,
                );
                if (
                  !!_foundKey &&
                  (!filterCondition ||
                    !!executeSearchCriteria(
                      0,
                      _currentContext[_foundKey],
                      _foundKey,
                      filterCondition,
                    ))
                ) {
                  delete _currentContext[_foundKey];
                  isModified = true;
                }
              }
            }
            if (typeCheckFunctions.isArray(elementToRemove)) {
              elementToRemove.forEach(keyToDelete);
            } else {
              keyToDelete(elementToRemove);
            }
            return isModified;
          },
        },
        {
          key: "clear",
          value: function (filterCriteria) {
            var objectKeys = Object.keys(this);
            var keyCount = objectKeys.length;
            for (var isDeleted = false; keyCount--; ) {
              var _currentKey = objectKeys[keyCount];
              if (
                !filterCriteria ||
                !!executeSearchCriteria(
                  0,
                  this[_currentKey],
                  _currentKey,
                  filterCriteria,
                  true,
                )
              ) {
                delete this[_currentKey];
                isDeleted = true;
              }
            }
            return isDeleted;
          },
        },
        {
          key: "normalize",
          value: function (inputString) {
            var currentContext = this;
            var namespaceMap = {};
            typeCheckFunctions.forEach(this, function (_inputParameter, key) {
              var foundKeyIndex = typeCheckFunctions.findKey(namespaceMap, key);
              if (foundKeyIndex) {
                currentContext[foundKeyIndex] =
                  transformInputValue(_inputParameter);
                delete currentContext[key];
                return;
              }
              var formattedKey = inputString
                ? (function (_________inputString) {
                    return _________inputString
                      .trim()
                      .toLowerCase()
                      .replace(
                        /([a-z\d])(\w*)/g,
                        function (_eventParameter, textToConvert, suffix) {
                          return textToConvert.toUpperCase() + suffix;
                        },
                      );
                  })(key)
                : String(key).trim();
              if (formattedKey !== key) {
                delete currentContext[key];
              }
              currentContext[formattedKey] =
                transformInputValue(_inputParameter);
              namespaceMap[formattedKey] = true;
            });
            return this;
          },
        },
        {
          key: "concat",
          value: function () {
            var constructorFunction;
            var _argumentCount = arguments.length;
            var argsArray = new Array(_argumentCount);
            for (var argIndex = 0; argIndex < _argumentCount; argIndex++) {
              argsArray[argIndex] = arguments[argIndex];
            }
            return (constructorFunction = this.constructor).concat.apply(
              constructorFunction,
              [this].concat(argsArray),
            );
          },
        },
        {
          key: "toJSON",
          value: function (inputEvent) {
            var formattedValues = Object.create(null);
            typeCheckFunctions.forEach(
              this,
              function (______________________inputValue, formattedValueIndex) {
                if (
                  ______________________inputValue != null &&
                  ______________________inputValue !== false
                ) {
                  formattedValues[formattedValueIndex] =
                    inputEvent &&
                    typeCheckFunctions.isArray(______________________inputValue)
                      ? ______________________inputValue.join(", ")
                      : ______________________inputValue;
                }
              },
            );
            return formattedValues;
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
              .map(function (__inputElement) {
                var __iteratorResult = iteratorFunction(__inputElement, 2);
                return __iteratorResult[0] + ": " + __iteratorResult[1];
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
          value: function (___inputParameter) {
            if (___inputParameter instanceof this) {
              return ___inputParameter;
            } else {
              return new this(___inputParameter);
            }
          },
        },
        {
          key: "concat",
          value: function (__inputParameter) {
            var instance = new this(__inputParameter);
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
            argumentsArray.forEach(function (_______event) {
              return instance.set(_______event);
            });
            return instance;
          },
        },
        {
          key: "accessor",
          value: function (propertyName) {
            var accessorMap = (this[internalSymbol] = this[internalSymbol] =
              {
                accessors: {},
              }).accessors;
            var prototypeObject = this.prototype;
            function _processEvent(____inputValue) {
              var processEvent = normalizeInput(____inputValue);
              if (!accessorMap[processEvent]) {
                (function (objectWithProperties, ___propertyName) {
                  var formattedPropertyName = typeCheckFunctions.toCamelCase(
                    " " + ___propertyName,
                  );
                  ["get", "set", "has"].forEach(function (_propertyKey) {
                    Object.defineProperty(
                      objectWithProperties,
                      _propertyKey + formattedPropertyName,
                      {
                        value: function (
                          eventParameter,
                          _eventData,
                          _callback,
                        ) {
                          return this[_propertyKey].call(
                            this,
                            ___propertyName,
                            eventParameter,
                            _eventData,
                            _callback,
                          );
                        },
                        configurable: true,
                      },
                    );
                  });
                })(prototypeObject, ____inputValue);
                accessorMap[processEvent] = true;
              }
            }
            if (typeCheckFunctions.isArray(propertyName)) {
              propertyName.forEach(_processEvent);
            } else {
              _processEvent(propertyName);
            }
            return this;
          },
        },
      ],
    );
    return isKeyFiltered;
  })();
  keyFilterHandler.accessor([
    "Content-Type",
    "Content-Length",
    "Accept",
    "Accept-Encoding",
    "User-Agent",
    "Authorization",
  ]);
  typeCheckFunctions.reduceDescriptors(
    keyFilterHandler.prototype,
    function (_inputElement, ______inputString) {
      var _______________inputValue = _inputElement.value;
      var formattedInputString =
        ______inputString[0].toUpperCase() + ______inputString.slice(1);
      return {
        get: function () {
          return _______________inputValue;
        },
        set: function (________event) {
          this[formattedInputString] = ________event;
        },
      };
    },
  );
  typeCheckFunctions.freezeMethods(keyFilterHandler);
  var keyFilter = keyFilterHandler;
  function executeCallbackChain(callbackFunctions, requestOptions) {
    var contextObject = this || axiosInstance;
    var requestOptionsOrDefault = requestOptions || contextObject;
    var _normalizedHeaders = keyFilter.from(requestOptionsOrDefault.headers);
    var __requestData = requestOptionsOrDefault.data;
    typeCheckFunctions.forEach(callbackFunctions, function (_eventHandler) {
      __requestData = _eventHandler.call(
        contextObject,
        __requestData,
        _normalizedHeaders.normalize(),
        requestOptions ? requestOptions.status : undefined,
      );
    });
    _normalizedHeaders.normalize();
    return __requestData;
  }
  function isCancelledEvent(cancelToken) {
    return !!cancelToken && !!cancelToken.__CANCEL__;
  }
  function canceledError(_errorMessage, errorContext, ____errorCode) {
    AxiosError.call(
      this,
      _errorMessage == null ? "canceled" : _errorMessage,
      AxiosError.ERR_CANCELED,
      errorContext,
      ____errorCode,
    );
    this.name = "CanceledError";
  }
  typeCheckFunctions.inherits(canceledError, AxiosError, {
    __CANCEL__: true,
  });
  var cookieHandler = environmentSupportFeatures.isStandardBrowserEnv
    ? {
        write: function (
          cookieName,
          cookieValue,
          expirationTime,
          cookiePath,
          domainName,
          isSecure,
        ) {
          var cookieAttributes = [];
          cookieAttributes.push(
            cookieName + "=" + encodeURIComponent(cookieValue),
          );
          if (typeCheckFunctions.isNumber(expirationTime)) {
            cookieAttributes.push(
              "expires=" + new Date(expirationTime).toGMTString(),
            );
          }
          if (typeCheckFunctions.isString(cookiePath)) {
            cookieAttributes.push("path=" + cookiePath);
          }
          if (typeCheckFunctions.isString(domainName)) {
            cookieAttributes.push("domain=" + domainName);
          }
          if (isSecure === true) {
            cookieAttributes.push("secure");
          }
          document.cookie = cookieAttributes.join("; ");
        },
        read: function (_cookieName) {
          var cookieMatch = document.cookie.match(
            new RegExp("(^|;\\s*)(" + _cookieName + ")=([^;]*)"),
          );
          if (cookieMatch) {
            return decodeURIComponent(cookieMatch[3]);
          } else {
            return null;
          }
        },
        remove: function (__eventData) {
          this.write(__eventData, "", Date.now() - 86400000);
        },
      }
    : {
        write: function () {},
        read: function () {
          return null;
        },
        remove: function () {},
      };
  function buildUrl(_baseUrl, urlPath) {
    if (_baseUrl && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(urlPath)) {
      return (function (_urlPath, relativePath) {
        if (relativePath) {
          return (
            _urlPath.replace(/\/+$/, "") +
            "/" +
            relativePath.replace(/^\/+/, "")
          );
        } else {
          return _urlPath;
        }
      })(_baseUrl, urlPath);
    } else {
      return urlPath;
    }
  }
  var isSameOriginUrl = environmentSupportFeatures.isStandardBrowserEnv
    ? (function () {
        var parsedUrl;
        var isInternetExplorer = /(msie|trident)/i.test(navigator.userAgent);
        var anchorElement = document.createElement("a");
        function __url(_url) {
          var url = _url;
          if (isInternetExplorer) {
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
        return function (inputUrl) {
          var parsedInputUrl = typeCheckFunctions.isString(inputUrl)
            ? __url(inputUrl)
            : inputUrl;
          return (
            parsedInputUrl.protocol === parsedUrl.protocol &&
            parsedInputUrl.host === parsedUrl.host
          );
        };
      })()
    : function () {
        return true;
      };
  function progressHandler(callback, durationThreshold) {
    var lastLoadedBytes = 0;
    var rateCalculator = (function (arraySize, timeInterval) {
      arraySize = arraySize || 10;
      var lastUpdateTime;
      var ringBuffer = new Array(arraySize);
      var timestampsArray = new Array(arraySize);
      var ___currentIndex = 0;
      var ____currentIndex = 0;
      if (timeInterval !== undefined) {
        timeInterval = timeInterval;
      } else {
        timeInterval = 1000;
      }
      return function (_____inputValue) {
        var currentTime = Date.now();
        var previousTimestamp = timestampsArray[____currentIndex];
        lastUpdateTime ||= currentTime;
        ringBuffer[___currentIndex] = _____inputValue;
        timestampsArray[___currentIndex] = currentTime;
        var bufferIndex = ____currentIndex;
        for (var accumulatedValue = 0; bufferIndex !== ___currentIndex; ) {
          accumulatedValue += ringBuffer[bufferIndex++];
          bufferIndex %= arraySize;
        }
        if (
          (___currentIndex = (___currentIndex + 1) % arraySize) ===
          ____currentIndex
        ) {
          ____currentIndex = (____currentIndex + 1) % arraySize;
        }
        if (!(currentTime - lastUpdateTime < timeInterval)) {
          var elapsedTimeSinceLastUpdate =
            previousTimestamp && currentTime - previousTimestamp;
          if (elapsedTimeSinceLastUpdate) {
            return Math.round(
              (accumulatedValue * 1000) / elapsedTimeSinceLastUpdate,
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
      var bytesDownloaded = bytesLoaded - lastLoadedBytes;
      var downloadRate = rateCalculator(bytesDownloaded);
      lastLoadedBytes = bytesLoaded;
      var progressData = {
        loaded: bytesLoaded,
        total: totalBytes,
        progress: totalBytes ? bytesLoaded / totalBytes : undefined,
        bytes: bytesDownloaded,
        rate: downloadRate || undefined,
        estimated:
          downloadRate && totalBytes && bytesLoaded <= totalBytes
            ? (totalBytes - bytesLoaded) / downloadRate
            : undefined,
        event: progressEvent,
      };
      progressData[durationThreshold ? "download" : "upload"] = true;
      callback(progressData);
    };
  }
  var httpRequestAdapters = {
    http: null,
    xhr:
      typeof XMLHttpRequest != "undefined" &&
      function (requestConfig) {
        return new Promise(function (successCallback, errorCallback) {
          var abortHandler;
          var contentType;
          var requestData = requestConfig.data;
          var normalizedHeaders = keyFilter
            .from(requestConfig.headers)
            .normalize();
          var responseType = requestConfig.responseType;
          function cleanupAbortHandlers() {
            if (requestConfig.cancelToken) {
              requestConfig.cancelToken.unsubscribe(abortHandler);
            }
            if (requestConfig.signal) {
              requestConfig.signal.removeEventListener("abort", abortHandler);
            }
          }
          if (typeCheckFunctions.isFormData(requestData)) {
            if (
              environmentSupportFeatures.isStandardBrowserEnv ||
              environmentSupportFeatures.isStandardBrowserWebWorkerEnv
            ) {
              normalizedHeaders.setContentType(false);
            } else if (
              normalizedHeaders.getContentType(/^\s*multipart\/form-data/)
            ) {
              if (
                typeCheckFunctions.isString(
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
          var xmlHttpRequest = new XMLHttpRequest();
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
          var _requestUrl = buildUrl(requestConfig.baseURL, requestConfig.url);
          function handleHttpRequest() {
            if (xmlHttpRequest) {
              var responseHeaders = keyFilter.from(
                "getAllResponseHeaders" in xmlHttpRequest &&
                  xmlHttpRequest.getAllResponseHeaders(),
              );
              (function (handleResponse, _errorCallback, response) {
                var validateStatusFunction = response.config.validateStatus;
                if (
                  response.status &&
                  validateStatusFunction &&
                  !validateStatusFunction(response.status)
                ) {
                  _errorCallback(
                    new AxiosError(
                      "Request failed with status code " + response.status,
                      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][
                        Math.floor(response.status / 100) - 4
                      ],
                      response.config,
                      response.request,
                      response,
                    ),
                  );
                } else {
                  handleResponse(response);
                }
              })(
                function (___event) {
                  successCallback(___event);
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
                      ? xmlHttpRequest.response
                      : xmlHttpRequest.responseText,
                  status: xmlHttpRequest.status,
                  statusText: xmlHttpRequest.statusText,
                  headers: responseHeaders,
                  config: requestConfig,
                  request: xmlHttpRequest,
                },
              );
              xmlHttpRequest = null;
            }
          }
          xmlHttpRequest.open(
            requestConfig.method.toUpperCase(),
            generateUrlWithParams(
              _requestUrl,
              requestConfig.params,
              requestConfig.paramsSerializer,
            ),
            true,
          );
          xmlHttpRequest.timeout = requestConfig.timeout;
          if ("onloadend" in xmlHttpRequest) {
            xmlHttpRequest.onloadend = handleHttpRequest;
          } else {
            xmlHttpRequest.onreadystatechange = function () {
              if (
                xmlHttpRequest &&
                xmlHttpRequest.readyState === 4 &&
                (xmlHttpRequest.status !== 0 ||
                  (xmlHttpRequest.responseURL &&
                    xmlHttpRequest.responseURL.indexOf("file:") === 0))
              ) {
                setTimeout(handleHttpRequest);
              }
            };
          }
          xmlHttpRequest.onabort = function () {
            if (xmlHttpRequest) {
              errorCallback(
                new AxiosError(
                  "Request aborted",
                  AxiosError.ECONNABORTED,
                  requestConfig,
                  xmlHttpRequest,
                ),
              );
              xmlHttpRequest = null;
            }
          };
          xmlHttpRequest.onerror = function () {
            errorCallback(
              new AxiosError(
                "Network Error",
                AxiosError.ERR_NETWORK,
                requestConfig,
                xmlHttpRequest,
              ),
            );
            xmlHttpRequest = null;
          };
          xmlHttpRequest.ontimeout = function () {
            var timeoutErrorMessage = requestConfig.timeout
              ? "timeout of " + requestConfig.timeout + "ms exceeded"
              : "timeout exceeded";
            var requestTransitionalConfig =
              requestConfig.transitional || axiosRequestConfig;
            if (requestConfig.timeoutErrorMessage) {
              timeoutErrorMessage = requestConfig.timeoutErrorMessage;
            }
            errorCallback(
              new AxiosError(
                timeoutErrorMessage,
                requestTransitionalConfig.clarifyTimeoutError
                  ? AxiosError.ETIMEDOUT
                  : AxiosError.ECONNABORTED,
                requestConfig,
                xmlHttpRequest,
              ),
            );
            xmlHttpRequest = null;
          };
          if (environmentSupportFeatures.isStandardBrowserEnv) {
            var xsrfTokenValue =
              isSameOriginUrl(_requestUrl) &&
              requestConfig.xsrfCookieName &&
              cookieHandler.read(requestConfig.xsrfCookieName);
            if (xsrfTokenValue) {
              normalizedHeaders.set(
                requestConfig.xsrfHeaderName,
                xsrfTokenValue,
              );
            }
          }
          if (requestData === undefined) {
            normalizedHeaders.setContentType(null);
          }
          if ("setRequestHeader" in xmlHttpRequest) {
            typeCheckFunctions.forEach(
              normalizedHeaders.toJSON(),
              function (_____headerValue, _____headerName) {
                xmlHttpRequest.setRequestHeader(
                  _____headerName,
                  _____headerValue,
                );
              },
            );
          }
          if (!typeCheckFunctions.isUndefined(requestConfig.withCredentials)) {
            xmlHttpRequest.withCredentials = !!requestConfig.withCredentials;
          }
          if (responseType && responseType !== "json") {
            xmlHttpRequest.responseType = requestConfig.responseType;
          }
          if (typeof requestConfig.onDownloadProgress == "function") {
            xmlHttpRequest.addEventListener(
              "progress",
              progressHandler(requestConfig.onDownloadProgress, true),
            );
          }
          if (
            typeof requestConfig.onUploadProgress == "function" &&
            xmlHttpRequest.upload
          ) {
            xmlHttpRequest.upload.addEventListener(
              "progress",
              progressHandler(requestConfig.onUploadProgress),
            );
          }
          if (requestConfig.cancelToken || requestConfig.signal) {
            abortHandler = function (_errorResponse) {
              if (xmlHttpRequest) {
                errorCallback(
                  !_errorResponse || _errorResponse.type
                    ? new canceledError(null, requestConfig, xmlHttpRequest)
                    : _errorResponse,
                );
                xmlHttpRequest.abort();
                xmlHttpRequest = null;
              }
            };
            if (requestConfig.cancelToken) {
              requestConfig.cancelToken.subscribe(abortHandler);
            }
            if (requestConfig.signal) {
              if (requestConfig.signal.aborted) {
                abortHandler();
              } else {
                requestConfig.signal.addEventListener("abort", abortHandler);
              }
            }
          }
          var urlProtocol;
          var requestProtocol =
            ((urlProtocol = /^([-+\w]{1,25})(:?\/\/|:)/.exec(_requestUrl)) &&
              urlProtocol[1]) ||
            "";
          if (
            requestProtocol &&
            environmentSupportFeatures.protocols.indexOf(requestProtocol) === -1
          ) {
            errorCallback(
              new AxiosError(
                "Unsupported protocol " + requestProtocol + ":",
                AxiosError.ERR_BAD_REQUEST,
                requestConfig,
              ),
            );
          } else {
            xmlHttpRequest.send(requestData || null);
          }
        });
      },
  };
  typeCheckFunctions.forEach(
    httpRequestAdapters,
    function (entity, _adapterName) {
      if (entity) {
        try {
          Object.defineProperty(entity, "name", {
            value: _adapterName,
          });
        } catch (_____error) {}
        Object.defineProperty(entity, "adapterName", {
          value: _adapterName,
        });
      }
    },
  );
  function formatStringWithDash(__errorMessage) {
    return `- ${__errorMessage}`;
  }
  function isFunctionOrNullOrFalse(____________________________inputValue) {
    return (
      typeCheckFunctions.isFunction(____________________________inputValue) ||
      ____________________________inputValue === null ||
      ____________________________inputValue === false
    );
  }
  function getAdapterFromList(adaptersList) {
    var currentAdapter;
    var selectedAdapter;
    var adaptersCount = (adaptersList = typeCheckFunctions.isArray(adaptersList)
      ? adaptersList
      : [adaptersList]).length;
    var adapterMapping = {};
    for (var adapterIndex = 0; adapterIndex < adaptersCount; adapterIndex++) {
      var adapterName = undefined;
      selectedAdapter = currentAdapter = adaptersList[adapterIndex];
      if (
        !isFunctionOrNullOrFalse(currentAdapter) &&
        (selectedAdapter =
          httpRequestAdapters[
            (adapterName = String(currentAdapter)).toLowerCase()
          ]) === undefined
      ) {
        throw new AxiosError(`Unknown adapter '${adapterName}'`);
      }
      if (selectedAdapter) {
        break;
      }
      adapterMapping[adapterName || "#" + adapterIndex] = selectedAdapter;
    }
    if (!selectedAdapter) {
      var adapterAvailabilityMessages = Object.entries(adapterMapping).map(
        function (environmentParameter) {
          var iteratorResult = iteratorFunction(environmentParameter, 2);
          var firstIteratorResult = iteratorResult[0];
          var isAvailableInBuild = iteratorResult[1];
          return `adapter ${firstIteratorResult} ${isAvailableInBuild === false ? "is not supported by the environment" : "is not available in the build"}`;
        },
      );
      throw new AxiosError(
        "There is no suitable adapter to dispatch the request " +
          (adaptersCount
            ? adapterAvailabilityMessages.length > 1
              ? "since :\n" +
                adapterAvailabilityMessages.map(formatStringWithDash).join("\n")
              : " " + formatStringWithDash(adapterAvailabilityMessages[0])
            : "as no adapter specified"),
        "ERR_NOT_SUPPORT",
      );
    }
    return selectedAdapter;
  }
  function ______requestConfig(___requestConfig) {
    if (___requestConfig.cancelToken) {
      ___requestConfig.cancelToken.throwIfRequested();
    }
    if (___requestConfig.signal && ___requestConfig.signal.aborted) {
      throw new canceledError(null, ___requestConfig);
    }
  }
  function processRequestConfig(__requestConfig) {
    ______requestConfig(__requestConfig);
    __requestConfig.headers = keyFilter.from(__requestConfig.headers);
    __requestConfig.data = executeCallbackChain.call(
      __requestConfig,
      __requestConfig.transformRequest,
    );
    if (["post", "put", "patch"].indexOf(__requestConfig.method) !== -1) {
      __requestConfig.headers.setContentType(
        "application/x-www-form-urlencoded",
        false,
      );
    }
    return getAdapterFromList(__requestConfig.adapter || axiosInstance.adapter)(
      __requestConfig,
    ).then(
      function (____requestConfig) {
        ______requestConfig(__requestConfig);
        ____requestConfig.data = executeCallbackChain.call(
          __requestConfig,
          __requestConfig.transformResponse,
          ____requestConfig,
        );
        ____requestConfig.headers = keyFilter.from(____requestConfig.headers);
        return ____requestConfig;
      },
      function (request) {
        if (!isCancelledEvent(request)) {
          ______requestConfig(__requestConfig);
          if (request && request.response) {
            request.response.data = executeCallbackChain.call(
              __requestConfig,
              __requestConfig.transformResponse,
              request.response,
            );
            request.response.headers = keyFilter.from(request.response.headers);
          }
        }
        return Promise.reject(request);
      },
    );
  }
  function convertToJson(____inputParameter) {
    if (____inputParameter instanceof keyFilter) {
      return ____inputParameter.toJSON();
    } else {
      return ____inputParameter;
    }
  }
  function mergeOptions(inputObject, _options) {
    _options = _options || {};
    var mergedOptions = {};
    function mergeObjects(__sourceObject, __targetObject, isCaselessMerge) {
      if (
        typeCheckFunctions.isPlainObject(__sourceObject) &&
        typeCheckFunctions.isPlainObject(__targetObject)
      ) {
        return typeCheckFunctions.merge.call(
          {
            caseless: isCaselessMerge,
          },
          __sourceObject,
          __targetObject,
        );
      } else if (typeCheckFunctions.isPlainObject(__targetObject)) {
        return typeCheckFunctions.merge({}, __targetObject);
      } else if (typeCheckFunctions.isArray(__targetObject)) {
        return __targetObject.slice();
      } else {
        return __targetObject;
      }
    }
    function ______________________________________inputValue(
      _____________inputValue,
      secondParameter,
      defaultValue,
    ) {
      if (typeCheckFunctions.isUndefined(secondParameter)) {
        if (typeCheckFunctions.isUndefined(_____________inputValue)) {
          return undefined;
        } else {
          return mergeObjects(undefined, _____________inputValue, defaultValue);
        }
      } else {
        return mergeObjects(
          _____________inputValue,
          secondParameter,
          defaultValue,
        );
      }
    }
    function isUndefinedCheckFunction(
      _________________________inputValue,
      valueToCheck,
    ) {
      if (!typeCheckFunctions.isUndefined(valueToCheck)) {
        return mergeObjects(undefined, valueToCheck);
      }
    }
    function processInputValue(______________inputValue, value) {
      if (typeCheckFunctions.isUndefined(value)) {
        if (typeCheckFunctions.isUndefined(______________inputValue)) {
          return undefined;
        } else {
          return mergeObjects(undefined, ______________inputValue);
        }
      } else {
        return mergeObjects(undefined, value);
      }
    }
    function mergeBasedOnInputKey(
      ___________________inputValue,
      ____________________inputValue,
      inputKey,
    ) {
      if (inputKey in _options) {
        return mergeObjects(
          ___________________inputValue,
          ____________________inputValue,
        );
      } else if (inputKey in inputObject) {
        return mergeObjects(undefined, ___________________inputValue);
      } else {
        return undefined;
      }
    }
    var optionsHandlers = {
      url: isUndefinedCheckFunction,
      method: isUndefinedCheckFunction,
      data: isUndefinedCheckFunction,
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
      validateStatus: mergeBasedOnInputKey,
      headers: function (_____event, targetElement) {
        return ______________________________________inputValue(
          convertToJson(_____event),
          convertToJson(targetElement),
          true,
        );
      },
    };
    typeCheckFunctions.forEach(
      Object.keys(Object.assign({}, inputObject, _options)),
      function (inputIndex) {
        var processingFunction =
          optionsHandlers[inputIndex] ||
          ______________________________________inputValue;
        var processedValue = processingFunction(
          inputObject[inputIndex],
          _options[inputIndex],
          inputIndex,
        );
        if (
          !typeCheckFunctions.isUndefined(processedValue) ||
          processingFunction === mergeBasedOnInputKey
        ) {
          mergedOptions[inputIndex] = processedValue;
        }
      },
    );
    return mergedOptions;
  }
  var axiosVersion = "1.6.0";
  var typeChecker = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(
    function (expectedType, typeCheckCounter) {
      typeChecker[expectedType] = function (
        ___________________________inputValue,
      ) {
        return (
          getType(___________________________inputValue) === expectedType ||
          "a" + (typeCheckCounter < 1 ? "n " : " ") + expectedType
        );
      };
    },
  );
  var transitionalOptions = {};
  typeChecker.transitional = function (
    isTransitionalOptionEnabled,
    transitionalVersion,
    transitionalWarningMessage,
  ) {
    function generateTransitionalOptionMessage(
      transitionalOption,
      _transitionalOption,
    ) {
      return (
        "[Axios v1.6.0] Transitional option '" +
        transitionalOption +
        "'" +
        _transitionalOption +
        (transitionalWarningMessage ? ". " + transitionalWarningMessage : "")
      );
    }
    return function (
      transitionalOptionValue,
      optionKey,
      transitionalOptionCallback,
    ) {
      if (isTransitionalOptionEnabled === false) {
        throw new AxiosError(
          generateTransitionalOptionMessage(
            optionKey,
            " has been removed" +
              (transitionalVersion ? " in " + transitionalVersion : ""),
          ),
          AxiosError.ERR_DEPRECATED,
        );
      }
      if (transitionalVersion && !transitionalOptions[optionKey]) {
        transitionalOptions[optionKey] = true;
        console.warn(
          generateTransitionalOptionMessage(
            optionKey,
            " has been deprecated since v" +
              transitionalVersion +
              " and will be removed in the near future",
          ),
        );
      }
      return (
        !isTransitionalOptionEnabled ||
        isTransitionalOptionEnabled(
          transitionalOptionValue,
          optionKey,
          transitionalOptionCallback,
        )
      );
    };
  };
  var _optionValidator = {
    assertOptions: function (
      __options,
      optionValidators,
      isStrictValidationEnabled,
    ) {
      if (getType(__options) !== "object") {
        throw new AxiosError(
          "options must be an object",
          AxiosError.ERR_BAD_OPTION_VALUE,
        );
      }
      var optionKeys = Object.keys(__options);
      for (var optionKeyIndex = optionKeys.length; optionKeyIndex-- > 0; ) {
        var currentOptionKey = optionKeys[optionKeyIndex];
        var optionValidator = optionValidators[currentOptionKey];
        if (optionValidator) {
          var optionValue = __options[currentOptionKey];
          var isOptionValueValid =
            optionValue === undefined ||
            optionValidator(optionValue, currentOptionKey, __options);
          if (isOptionValueValid !== true) {
            throw new AxiosError(
              "option " + currentOptionKey + " must be " + isOptionValueValid,
              AxiosError.ERR_BAD_OPTION_VALUE,
            );
          }
        } else if (isStrictValidationEnabled !== true) {
          throw new AxiosError(
            "Unknown option " + currentOptionKey,
            AxiosError.ERR_BAD_OPTION,
          );
        }
      }
    },
    validators: typeChecker,
  };
  var __optionValidator = _optionValidator.validators;
  var createAxiosInstance = (function () {
    function _input(defaultInputValue) {
      _parserOption(this, _input);
      this.defaults = defaultInputValue;
      this.interceptors = {
        request: new initializeHandler(),
        response: new initializeHandler(),
      };
    }
    _propertyCount(_input, [
      {
        key: "request",
        value: function (input, config) {
          if (typeof input == "string") {
            (config = config || {}).url = input;
          } else {
            config = input || {};
          }
          var _requestConfig = (config = mergeOptions(this.defaults, config));
          var _transitionalOptions = _requestConfig.transitional;
          var paramsSerializer = _requestConfig.paramsSerializer;
          var requestHeaders = _requestConfig.headers;
          if (_transitionalOptions !== undefined) {
            _optionValidator.assertOptions(
              _transitionalOptions,
              {
                silentJSONParsing: __optionValidator.transitional(
                  __optionValidator.boolean,
                ),
                forcedJSONParsing: __optionValidator.transitional(
                  __optionValidator.boolean,
                ),
                clarifyTimeoutError: __optionValidator.transitional(
                  __optionValidator.boolean,
                ),
              },
              false,
            );
          }
          if (paramsSerializer != null) {
            if (typeCheckFunctions.isFunction(paramsSerializer)) {
              config.paramsSerializer = {
                serialize: paramsSerializer,
              };
            } else {
              _optionValidator.assertOptions(
                paramsSerializer,
                {
                  encode: __optionValidator.function,
                  serialize: __optionValidator.function,
                },
                true,
              );
            }
          }
          config.method = (
            config.method ||
            this.defaults.method ||
            "get"
          ).toLowerCase();
          var mergedHeaders =
            requestHeaders &&
            typeCheckFunctions.merge(
              requestHeaders.common,
              requestHeaders[config.method],
            );
          if (requestHeaders) {
            typeCheckFunctions.forEach(
              ["delete", "get", "head", "post", "put", "patch", "common"],
              function (__headerKey) {
                delete requestHeaders[__headerKey];
              },
            );
          }
          config.headers = keyFilter.concat(mergedHeaders, requestHeaders);
          var interceptorFunctionsQueue = [];
          var areAllInterceptorsSynchronous = true;
          this.interceptors.request.forEach(function (interceptorObject) {
            if (
              typeof interceptorObject.runWhen != "function" ||
              interceptorObject.runWhen(config) !== false
            ) {
              areAllInterceptorsSynchronous =
                areAllInterceptorsSynchronous && interceptorObject.synchronous;
              interceptorFunctionsQueue.unshift(
                interceptorObject.fulfilled,
                interceptorObject.rejected,
              );
            }
          });
          var promiseChain;
          var responseInterceptors = [];
          this.interceptors.response.forEach(function (interceptor) {
            responseInterceptors.push(
              interceptor.fulfilled,
              interceptor.rejected,
            );
          });
          var promiseChainLength;
          var promiseIndex = 0;
          if (!areAllInterceptorsSynchronous) {
            var _promiseChain = [processRequestConfig.bind(this), undefined];
            _promiseChain.unshift.apply(
              _promiseChain,
              interceptorFunctionsQueue,
            );
            _promiseChain.push.apply(_promiseChain, responseInterceptors);
            promiseChainLength = _promiseChain.length;
            promiseChain = Promise.resolve(config);
            while (promiseIndex < promiseChainLength) {
              promiseChain = promiseChain.then(
                _promiseChain[promiseIndex++],
                _promiseChain[promiseIndex++],
              );
            }
            return promiseChain;
          }
          promiseChainLength = interceptorFunctionsQueue.length;
          var _____requestConfig = config;
          for (promiseIndex = 0; promiseIndex < promiseChainLength; ) {
            var currentInterceptorFunction =
              interceptorFunctionsQueue[promiseIndex++];
            var errorHandler = interceptorFunctionsQueue[promiseIndex++];
            try {
              _____requestConfig =
                currentInterceptorFunction(_____requestConfig);
            } catch (__error) {
              errorHandler.call(this, __error);
              break;
            }
          }
          try {
            promiseChain = processRequestConfig.call(this, _____requestConfig);
          } catch (___error) {
            return Promise.reject(___error);
          }
          promiseIndex = 0;
          promiseChainLength = responseInterceptors.length;
          while (promiseIndex < promiseChainLength) {
            promiseChain = promiseChain.then(
              responseInterceptors[promiseIndex++],
              responseInterceptors[promiseIndex++],
            );
          }
          return promiseChain;
        },
      },
      {
        key: "getUri",
        value: function (__requestOptions) {
          return generateUrlWithParams(
            buildUrl(
              (__requestOptions = mergeOptions(this.defaults, __requestOptions))
                .baseURL,
              __requestOptions.url,
            ),
            __requestOptions.params,
            __requestOptions.paramsSerializer,
          );
        },
      },
    ]);
    return _input;
  })();
  typeCheckFunctions.forEach(
    ["delete", "get", "head", "options"],
    function (_httpMethod) {
      createAxiosInstance.prototype[_httpMethod] = function (
        ___url,
        _requestOptions,
      ) {
        return this.request(
          mergeOptions(_requestOptions || {}, {
            method: _httpMethod,
            url: ___url,
            data: (_requestOptions || {}).data,
          }),
        );
      };
    },
  );
  typeCheckFunctions.forEach(["post", "put", "patch"], function (httpMethod) {
    function _contentTypeHeaders(contentTypeHeaders) {
      return function (requestUrl, _requestData, ___options) {
        return this.request(
          mergeOptions(___options || {}, {
            method: httpMethod,
            headers: contentTypeHeaders
              ? {
                  "Content-Type": "multipart/form-data",
                }
              : {},
            url: requestUrl,
            data: _requestData,
          }),
        );
      };
    }
    createAxiosInstance.prototype[httpMethod] = _contentTypeHeaders();
    createAxiosInstance.prototype[httpMethod + "Form"] =
      _contentTypeHeaders(true);
  });
  var requestHandler = createAxiosInstance;
  var CancelToken = (function () {
    function executorFunction(_executorFunction) {
      _parserOption(this, executorFunction);
      if (typeof _executorFunction != "function") {
        throw new TypeError("executor must be a function.");
      }
      var resolveFunction;
      this.promise = new Promise(function (___________event) {
        resolveFunction = ___________event;
      });
      var __context = this;
      this.promise.then(function (_________event) {
        if (__context._listeners) {
          for (
            var listenerCount = __context._listeners.length;
            listenerCount-- > 0;

          ) {
            __context._listeners[listenerCount](_________event);
          }
          __context._listeners = null;
        }
      });
      this.promise.then = function (promiseResolver) {
        var resolveCallback;
        var promiseWithCancel = new Promise(function (___eventHandler) {
          __context.subscribe(___eventHandler);
          resolveCallback = ___eventHandler;
        }).then(promiseResolver);
        promiseWithCancel.cancel = function () {
          __context.unsubscribe(resolveCallback);
        };
        return promiseWithCancel;
      };
      _executorFunction(function (_errorEvent, errorType, reasonData) {
        if (!__context.reason) {
          __context.reason = new canceledError(
            _errorEvent,
            errorType,
            reasonData,
          );
          resolveFunction(__context.reason);
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
          value: function (eventListener) {
            if (this._listeners) {
              var listenerIndex = this._listeners.indexOf(eventListener);
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
            var tokenValue;
            return {
              token: new executorFunction(function (tokenValueFromEvent) {
                tokenValue = tokenValueFromEvent;
              }),
              cancel: tokenValue,
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
  Object.entries(httpStatusCodes).forEach(
    function (__________________________inputValue) {
      var httpStatusCodeData = iteratorFunction(
        __________________________inputValue,
        2,
      );
      var httpStatusCodeDescription = httpStatusCodeData[0];
      var httpStatusCodeValue = httpStatusCodeData[1];
      httpStatusCodes[httpStatusCodeValue] = httpStatusCodeDescription;
    },
  );
  var _httpStatusCodes = httpStatusCodes;
  var _axiosInstance = (function createRequestObject(headerRequest) {
    var headerObject = new requestHandler(headerRequest);
    var _requestObject = headerValueString(
      requestHandler.prototype.request,
      headerObject,
    );
    typeCheckFunctions.extend(
      _requestObject,
      requestHandler.prototype,
      headerObject,
      {
        allOwnKeys: true,
      },
    );
    typeCheckFunctions.extend(_requestObject, headerObject, null, {
      allOwnKeys: true,
    });
    _requestObject.create = function (requestPayload) {
      return createRequestObject(mergeOptions(headerRequest, requestPayload));
    };
    return _requestObject;
  })(axiosInstance);
  _axiosInstance.Axios = requestHandler;
  _axiosInstance.CanceledError = canceledError;
  _axiosInstance.CancelToken = CancelToken;
  _axiosInstance.isCancel = isCancelledEvent;
  _axiosInstance.VERSION = axiosVersion;
  _axiosInstance.toFormData = _processFormData;
  _axiosInstance.AxiosError = AxiosError;
  _axiosInstance.Cancel = _axiosInstance.CanceledError;
  _axiosInstance.all = function (promiseArray) {
    return Promise.all(promiseArray);
  };
  _axiosInstance.spread = function (__eventHandler) {
    return function (eventArguments) {
      return __eventHandler.apply(null, eventArguments);
    };
  };
  _axiosInstance.isAxiosError = function (_errorObject) {
    return (
      typeCheckFunctions.isObject(_errorObject) &&
      _errorObject.isAxiosError === true
    );
  };
  _axiosInstance.mergeConfig = mergeOptions;
  _axiosInstance.AxiosHeaders = keyFilter;
  _axiosInstance.formToJSON = function (formElement) {
    return processFormData(
      typeCheckFunctions.isHTMLForm(formElement)
        ? new FormData(formElement)
        : formElement,
    );
  };
  _axiosInstance.getAdapter = getAdapterFromList;
  _axiosInstance.HttpStatusCode = _httpStatusCodes;
  _axiosInstance.default = _axiosInstance;
  return _axiosInstance;
});
