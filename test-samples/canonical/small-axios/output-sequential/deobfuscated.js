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

  function ______inputValue(________inputValue) {
    if (typeof Symbol == "function" && typeof Symbol.iterator == "symbol") {
      ______inputValue = function (___inputParameter) {
        return typeof ___inputParameter;
      };
    } else {
      ______inputValue = function (_______________inputValue) {
        if (
          _______________inputValue &&
          typeof Symbol == "function" &&
          _______________inputValue.constructor === Symbol &&
          _______________inputValue !== Symbol.prototype
        ) {
          return "symbol";
        } else {
          return typeof _______________inputValue;
        }
      };
    }
    return ______inputValue(________inputValue);
  }
  function parsedKeyValuePair(keyValuePair, constructorType) {
    if (!(keyValuePair instanceof constructorType)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function adapterIssueMessage(___targetObject, propertyDescriptors) {
    for (var __index = 0; __index < propertyDescriptors.length; __index++) {
      var _propertyDescriptor = propertyDescriptors[__index];
      _propertyDescriptor.enumerable = _propertyDescriptor.enumerable || false;
      _propertyDescriptor.configurable = true;
      if ("value" in _propertyDescriptor) {
        _propertyDescriptor.writable = true;
      }
      Object.defineProperty(
        ___targetObject,
        _propertyDescriptor.key,
        _propertyDescriptor,
      );
    }
  }
  function ___propertyIndex(
    constructorFunction,
    ____propertyIndex,
    issueMessage,
  ) {
    if (____propertyIndex) {
      adapterIssueMessage(constructorFunction.prototype, ____propertyIndex);
    }
    if (issueMessage) {
      adapterIssueMessage(constructorFunction, issueMessage);
    }
    Object.defineProperty(constructorFunction, "prototype", {
      writable: false,
    });
    return constructorFunction;
  }
  function extractIterable(iterableInput, maxItemCount) {
    return (
      (function (______inputArray) {
        if (Array.isArray(______inputArray)) {
          return ______inputArray;
        }
      })(iterableInput) ||
      (function (_iterableInput, maxItemsToRetrieve) {
        var iterator =
          _iterableInput == null
            ? null
            : (typeof Symbol != "undefined" &&
                _iterableInput[Symbol.iterator]) ||
              _iterableInput["@@iterator"];
        if (iterator == null) {
          return;
        }
        var iteratorResult;
        var caughtError;
        var collectedItems = [];
        var isIteratorDone = true;
        var hasCaughtError = false;
        try {
          for (
            iterator = iterator.call(_iterableInput);
            !(isIteratorDone = (iteratorResult = iterator.next()).done) &&
            (collectedItems.push(iteratorResult.value),
            !maxItemsToRetrieve ||
              collectedItems.length !== maxItemsToRetrieve);
            isIteratorDone = true
          ) {}
        } catch (_____error) {
          hasCaughtError = true;
          caughtError = _____error;
        } finally {
          try {
            if (!isIteratorDone && iterator.return != null) {
              iterator.return();
            }
          } finally {
            if (hasCaughtError) {
              throw caughtError;
            }
          }
        }
        return collectedItems;
      })(iterableInput, maxItemCount) ||
      (function (_____inputValue, inputTransformation) {
        if (!_____inputValue) {
          return;
        }
        if (typeof _____inputValue == "string") {
          return inputArrayLength(_____inputValue, inputTransformation);
        }
        var inputType = Object.prototype.toString
          .call(_____inputValue)
          .slice(8, -1);
        if (inputType === "Object" && _____inputValue.constructor) {
          inputType = _____inputValue.constructor.name;
        }
        if (inputType === "Map" || inputType === "Set") {
          return Array.from(_____inputValue);
        }
        if (
          inputType === "Arguments" ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(inputType)
        ) {
          return inputArrayLength(_____inputValue, inputTransformation);
        }
      })(iterableInput, maxItemCount) ||
      (function () {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function inputArrayLength(____inputArray, maxElementsToRetrieve) {
    if (
      maxElementsToRetrieve == null ||
      maxElementsToRetrieve > ____inputArray.length
    ) {
      maxElementsToRetrieve = ____inputArray.length;
    }
    var ______currentIndex = 0;
    for (
      var retrievedElementsArray = new Array(maxElementsToRetrieve);
      ______currentIndex < maxElementsToRetrieve;
      ______currentIndex++
    ) {
      retrievedElementsArray[______currentIndex] =
        ____inputArray[______currentIndex];
    }
    return retrievedElementsArray;
  }
  function _currentInputValue(inputEventHandler, contextThis) {
    return function () {
      return inputEventHandler.apply(contextThis, arguments);
    };
  }
  var objectTypesMap;
  var getObjectTypeString = Object.prototype.toString;
  var getObjectPrototype = Object.getPrototypeOf;
  objectTypesMap = Object.create(null);
  function getObjectType(___inputObject) {
    var objectTypeString = getObjectTypeString.call(___inputObject);
    return (objectTypesMap[objectTypeString] ||= objectTypeString
      .slice(8, -1)
      .toLowerCase());
  }
  function createCaseInsensitiveMatcher(targetString) {
    targetString = targetString.toLowerCase();
    return function (_________________________________inputValue) {
      return (
        getObjectType(_________________________________inputValue) ===
        targetString
      );
    };
  }
  function _requestOptions(_targetValue) {
    return function (_inputValueToCheck) {
      return ______inputValue(_inputValueToCheck) === _targetValue;
    };
  }
  var isArray = Array.isArray;
  var isUndefinedFunction = _requestOptions("undefined");
  var isArrayBufferType = createCaseInsensitiveMatcher("ArrayBuffer");
  var isStringType = _requestOptions("string");
  var isFunctionType = _requestOptions("function");
  var isNumberType = _requestOptions("number");
  function isInputValueObject(______________________________inputValue) {
    return (
      ______________________________inputValue !== null &&
      ______inputValue(______________________________inputValue) === "object"
    );
  }
  function isObjectPrototype(___________inputValue) {
    if (getObjectType(___________inputValue) !== "object") {
      return false;
    }
    var objectPrototype = getObjectPrototype(___________inputValue);
    return (
      (objectPrototype === null ||
        objectPrototype === Object.prototype ||
        Object.getPrototypeOf(objectPrototype) === null) &&
      !(Symbol.toStringTag in ___________inputValue) &&
      !(Symbol.iterator in ___________inputValue)
    );
  }
  var isDateType = createCaseInsensitiveMatcher("Date");
  var isFileType = createCaseInsensitiveMatcher("File");
  var isBlobType = createCaseInsensitiveMatcher("Blob");
  var isFileListType = createCaseInsensitiveMatcher("FileList");
  var isURLSearchParamsType = createCaseInsensitiveMatcher("URLSearchParams");
  function iterateOverItems(itemsToIterate, callbackFunction) {
    var ___currentIndex;
    var itemsCount;
    var ownKeysOption = (
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
    ).allOwnKeys;
    var shouldIncludeAllOwnKeys = ownKeysOption !== undefined && ownKeysOption;
    if (itemsToIterate != null) {
      if (______inputValue(itemsToIterate) !== "object") {
        itemsToIterate = [itemsToIterate];
      }
      if (isArray(itemsToIterate)) {
        ___currentIndex = 0;
        itemsCount = itemsToIterate.length;
        for (; ___currentIndex < itemsCount; ___currentIndex++) {
          callbackFunction.call(
            null,
            itemsToIterate[___currentIndex],
            ___currentIndex,
            itemsToIterate,
          );
        }
      } else {
        var currentKey;
        var itemKeys = shouldIncludeAllOwnKeys
          ? Object.getOwnPropertyNames(itemsToIterate)
          : Object.keys(itemsToIterate);
        var itemKeysCount = itemKeys.length;
        for (
          ___currentIndex = 0;
          ___currentIndex < itemKeysCount;
          ___currentIndex++
        ) {
          currentKey = itemKeys[___currentIndex];
          callbackFunction.call(
            null,
            itemsToIterate[currentKey],
            currentKey,
            itemsToIterate,
          );
        }
      }
    }
  }
  function findMatchingKey(objectToSearch, searchKey) {
    searchKey = searchKey.toLowerCase();
    var __currentKey;
    var objectKeys = Object.keys(objectToSearch);
    for (var _keyIndex = objectKeys.length; _keyIndex-- > 0; ) {
      if (searchKey === (__currentKey = objectKeys[_keyIndex]).toLowerCase()) {
        return __currentKey;
      }
    }
    return null;
  }
  var globalScope =
    typeof globalThis != "undefined"
      ? globalThis
      : typeof self != "undefined"
        ? self
        : typeof window != "undefined"
          ? window
          : global;
  function isValidInput(________________________________inputValue) {
    return (
      !isUndefinedFunction(________________________________inputValue) &&
      ________________________________inputValue !== globalScope
    );
  }
  var isUint8ArraySupported;
  isUint8ArraySupported =
    typeof Uint8Array != "undefined" && getObjectPrototype(Uint8Array);
  function isUint8Array(arrayToCheck) {
    return (
      isUint8ArraySupported && arrayToCheck instanceof isUint8ArraySupported
    );
  }
  var isHTMLFormElement = createCaseInsensitiveMatcher("HTMLFormElement");
  var _hasOwnProperty = (function () {
    var hasOwnPropertyCheck = Object.prototype.hasOwnProperty;
    return function (objectToCheck, _propertyKey) {
      return hasOwnPropertyCheck.call(objectToCheck, _propertyKey);
    };
  })();
  var isRegExpType = createCaseInsensitiveMatcher("RegExp");
  function applyPropertyDescriptors(
    ____targetObject,
    propertyDescriptorCallback,
  ) {
    var __propertyDescriptors =
      Object.getOwnPropertyDescriptors(____targetObject);
    var propertyDescriptorsMap = {};
    iterateOverItems(
      __propertyDescriptors,
      function (_propertyName, __propertyDescriptor) {
        var propertyDescriptorValue;
        if (
          (propertyDescriptorValue = propertyDescriptorCallback(
            _propertyName,
            __propertyDescriptor,
            ____targetObject,
          )) !== false
        ) {
          propertyDescriptorsMap[__propertyDescriptor] =
            propertyDescriptorValue || _propertyName;
        }
      },
    );
    Object.defineProperties(____targetObject, propertyDescriptorsMap);
  }
  var alphabetLowercase = "abcdefghijklmnopqrstuvwxyz";
  var digitCharacters = "0123456789";
  var characterCategories = {
    DIGIT: digitCharacters,
    ALPHA: alphabetLowercase,
    ALPHA_DIGIT:
      alphabetLowercase + alphabetLowercase.toUpperCase() + digitCharacters,
  };
  var isAsyncFunctionType = createCaseInsensitiveMatcher("AsyncFunction");
  var utilityFunctions = {
    isArray: isArray,
    isArrayBuffer: isArrayBufferType,
    isBuffer: function (____________________inputValue) {
      return (
        ____________________inputValue !== null &&
        !isUndefinedFunction(____________________inputValue) &&
        ____________________inputValue.constructor !== null &&
        !isUndefinedFunction(____________________inputValue.constructor) &&
        isFunctionType(____________________inputValue.constructor.isBuffer) &&
        ____________________inputValue.constructor.isBuffer(
          ____________________inputValue,
        )
      );
    },
    isFormData: function (___formData) {
      var formDataType;
      return (
        ___formData &&
        ((typeof FormData == "function" && ___formData instanceof FormData) ||
          (isFunctionType(___formData.append) &&
            ((formDataType = getObjectType(___formData)) === "formdata" ||
              (formDataType === "object" &&
                isFunctionType(___formData.toString) &&
                ___formData.toString() === "[object FormData]"))))
      );
    },
    isArrayBufferView: function (valueToCheck) {
      if (typeof ArrayBuffer != "undefined" && ArrayBuffer.isView) {
        return ArrayBuffer.isView(valueToCheck);
      } else {
        return (
          valueToCheck &&
          valueToCheck.buffer &&
          isArrayBufferType(valueToCheck.buffer)
        );
      }
    },
    isString: isStringType,
    isNumber: isNumberType,
    isBoolean: function (isBoolean) {
      return isBoolean === true || isBoolean === false;
    },
    isObject: isInputValueObject,
    isPlainObject: isObjectPrototype,
    isUndefined: isUndefinedFunction,
    isDate: isDateType,
    isFile: isFileType,
    isBlob: isBlobType,
    isRegExp: isRegExpType,
    isFunction: isFunctionType,
    isStream: function (_______________________________inputValue) {
      return (
        isInputValueObject(_______________________________inputValue) &&
        isFunctionType(_______________________________inputValue.pipe)
      );
    },
    isURLSearchParams: isURLSearchParamsType,
    isTypedArray: isUint8Array,
    isFileList: isFileListType,
    forEach: iterateOverItems,
    merge: function mergeObjects() {
      var isCaseless = ((isValidInput(this) && this) || {}).caseless;
      var mergedObjects = {};
      var mergeCallback = function (_inputObject, objectKey) {
        var objectKeyOrDefault =
          (isCaseless && findMatchingKey(mergedObjects, objectKey)) ||
          objectKey;
        if (
          isObjectPrototype(mergedObjects[objectKeyOrDefault]) &&
          isObjectPrototype(_inputObject)
        ) {
          mergedObjects[objectKeyOrDefault] = mergeObjects(
            mergedObjects[objectKeyOrDefault],
            _inputObject,
          );
        } else if (isObjectPrototype(_inputObject)) {
          mergedObjects[objectKeyOrDefault] = mergeObjects({}, _inputObject);
        } else if (isArray(_inputObject)) {
          mergedObjects[objectKeyOrDefault] = _inputObject.slice();
        } else {
          mergedObjects[objectKeyOrDefault] = _inputObject;
        }
      };
      var ____currentIndex = 0;
      for (
        var totalArgumentsCount = arguments.length;
        ____currentIndex < totalArgumentsCount;
        ____currentIndex++
      ) {
        if (arguments[____currentIndex]) {
          iterateOverItems(arguments[____currentIndex], mergeCallback);
        }
      }
      return mergedObjects;
    },
    extend: function (outputValues, currentItem, inputValueIndex) {
      iterateOverItems(
        currentItem,
        function (_________________________inputValue, currentOutputIndex) {
          if (
            inputValueIndex &&
            isFunctionType(_________________________inputValue)
          ) {
            outputValues[currentOutputIndex] = _currentInputValue(
              _________________________inputValue,
              inputValueIndex,
            );
          } else {
            outputValues[currentOutputIndex] =
              _________________________inputValue;
          }
        },
        {
          allOwnKeys: (arguments.length > 3 && arguments[3] !== undefined
            ? arguments[3]
            : {}
          ).allOwnKeys,
        },
      );
      return outputValues;
    },
    trim: function (_______inputString) {
      if (_______inputString.trim) {
        return _______inputString.trim();
      } else {
        return _______inputString.replace(
          /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
          "",
        );
      }
    },
    stripBOM: function (__________inputString) {
      if (__________inputString.charCodeAt(0) === 65279) {
        __________inputString = __________inputString.slice(1);
      }
      return __________inputString;
    },
    inherits: function (
      subclassConstructor,
      superClassPrototype,
      propertiesToAssign,
      _propertyDescriptors,
    ) {
      subclassConstructor.prototype = Object.create(
        superClassPrototype.prototype,
        _propertyDescriptors,
      );
      subclassConstructor.prototype.constructor = subclassConstructor;
      Object.defineProperty(subclassConstructor, "super", {
        value: superClassPrototype.prototype,
      });
      if (propertiesToAssign) {
        Object.assign(subclassConstructor.prototype, propertiesToAssign);
      }
    },
    toFlatObject: function (
      sourceObject,
      targetObject,
      sourcePrototype,
      propertyFilter,
    ) {
      var propertyNames;
      var propertyIndex;
      var currentPropertyName;
      var processedProperties = {};
      targetObject = targetObject || {};
      if (sourceObject == null) {
        return targetObject;
      }
      do {
        for (
          propertyIndex = (propertyNames =
            Object.getOwnPropertyNames(sourceObject)).length;
          propertyIndex-- > 0;

        ) {
          currentPropertyName = propertyNames[propertyIndex];
          if (
            (!propertyFilter ||
              !!propertyFilter(
                currentPropertyName,
                sourceObject,
                targetObject,
              )) &&
            !processedProperties[currentPropertyName]
          ) {
            targetObject[currentPropertyName] =
              sourceObject[currentPropertyName];
            processedProperties[currentPropertyName] = true;
          }
        }
        sourceObject =
          sourcePrototype !== false && getObjectPrototype(sourceObject);
      } while (
        sourceObject &&
        (!sourcePrototype || sourcePrototype(sourceObject, targetObject)) &&
        sourceObject !== Object.prototype
      );
      return targetObject;
    },
    kindOf: getObjectType,
    kindOfTest: createCaseInsensitiveMatcher,
    endsWith: function (_____inputString, searchSubstring, startingIndex) {
      _____inputString = String(_____inputString);
      if (
        startingIndex === undefined ||
        startingIndex > _____inputString.length
      ) {
        startingIndex = _____inputString.length;
      }
      startingIndex -= searchSubstring.length;
      var searchSubstringIndex = _____inputString.indexOf(
        searchSubstring,
        startingIndex,
      );
      return (
        searchSubstringIndex !== -1 && searchSubstringIndex === startingIndex
      );
    },
    toArray: function (_inputArray) {
      if (!_inputArray) {
        return null;
      }
      if (isArray(_inputArray)) {
        return _inputArray;
      }
      var __inputArrayLength = _inputArray.length;
      if (!isNumberType(__inputArrayLength)) {
        return null;
      }
      var outputArray = new Array(__inputArrayLength);
      while (__inputArrayLength-- > 0) {
        outputArray[__inputArrayLength] = _inputArray[__inputArrayLength];
      }
      return outputArray;
    },
    forEachEntry: function (___iterableInput, ___callbackFunction) {
      var __iteratorResult;
      for (
        var _iterator = (
          ___iterableInput && ___iterableInput[Symbol.iterator]
        ).call(___iterableInput);
        (__iteratorResult = _iterator.next()) && !__iteratorResult.done;

      ) {
        var _currentItem = __iteratorResult.value;
        ___callbackFunction.call(
          ___iterableInput,
          _currentItem[0],
          _currentItem[1],
        );
      }
    },
    matchAll: function (regexResult, _________inputString) {
      var regexMatchResult;
      for (
        var regexMatches = [];
        (regexMatchResult = regexResult.exec(_________inputString)) !== null;

      ) {
        regexMatches.push(regexMatchResult);
      }
      return regexMatches;
    },
    isHTMLForm: isHTMLFormElement,
    hasOwnProperty: _hasOwnProperty,
    hasOwnProp: _hasOwnProperty,
    reduceDescriptors: applyPropertyDescriptors,
    freezeMethods: function (inputObject) {
      applyPropertyDescriptors(
        inputObject,
        function (propertyDescriptor, methodName) {
          if (
            isFunctionType(inputObject) &&
            ["arguments", "caller", "callee"].indexOf(methodName) !== -1
          ) {
            return false;
          }
          var methodValue = inputObject[methodName];
          if (isFunctionType(methodValue)) {
            propertyDescriptor.enumerable = false;
            if ("writable" in propertyDescriptor) {
              propertyDescriptor.writable = false;
            } else {
              propertyDescriptor.set ||= function () {
                throw Error(
                  "Can not rewrite read-only method '" + methodName + "'",
                );
              };
            }
          }
        },
      );
    },
    toObjectSet: function (___inputArray, delimiter) {
      var uniqueElementsMap = {};
      function processUniqueElements(elementList) {
        elementList.forEach(function (elementKey) {
          uniqueElementsMap[elementKey] = true;
        });
      }
      if (isArray(___inputArray)) {
        processUniqueElements(___inputArray);
      } else {
        processUniqueElements(String(___inputArray).split(delimiter));
      }
      return uniqueElementsMap;
    },
    toCamelCase: function (________inputString) {
      return ________inputString
        .toLowerCase()
        .replace(
          /[-_\s]([a-z\d])(\w*)/g,
          function (_____event, text, appendNumber) {
            return text.toUpperCase() + appendNumber;
          },
        );
    },
    noop: function () {},
    toFiniteNumber: function (
      ________________________inputValue,
      defaultValue,
    ) {
      ________________________inputValue = +________________________inputValue;
      if (Number.isFinite(________________________inputValue)) {
        return ________________________inputValue;
      } else {
        return defaultValue;
      }
    },
    findKey: findMatchingKey,
    global: globalScope,
    isContextDefined: isValidInput,
    ALPHABET: characterCategories,
    generateString: function () {
      var lengthOrDefault =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;
      var characterSet =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : characterCategories.ALPHA_DIGIT;
      var randomString = "";
      for (var characterSetLength = characterSet.length; lengthOrDefault--; ) {
        randomString += characterSet[(Math.random() * characterSetLength) | 0];
      }
      return randomString;
    },
    isSpecCompliantForm: function (____formData) {
      return (
        !!____formData &&
        !!isFunctionType(____formData.append) &&
        ____formData[Symbol.toStringTag] === "FormData" &&
        !!____formData[Symbol.iterator]
      );
    },
    toJSONObject: function (_inputValue) {
      var storageArray = new Array(10);
      return (function transformItem(item, storageIndex) {
        if (isInputValueObject(item)) {
          if (storageArray.indexOf(item) >= 0) {
            return;
          }
          if (!("toJSON" in item)) {
            storageArray[storageIndex] = item;
            var transformedItem = isArray(item) ? [] : {};
            iterateOverItems(
              item,
              function (itemToTransform, transformedItemIndex) {
                var _transformedItem = transformItem(
                  itemToTransform,
                  storageIndex + 1,
                );
                if (!isUndefinedFunction(_transformedItem)) {
                  transformedItem[transformedItemIndex] = _transformedItem;
                }
              },
            );
            storageArray[storageIndex] = undefined;
            return transformedItem;
          }
        }
        return item;
      })(_inputValue, 0);
    },
    isAsyncFn: isAsyncFunctionType,
    isThenable: function (__________________________inputValue) {
      return (
        __________________________inputValue &&
        (isInputValueObject(__________________________inputValue) ||
          isFunctionType(__________________________inputValue)) &&
        isFunctionType(__________________________inputValue.then) &&
        isFunctionType(__________________________inputValue.catch)
      );
    },
  };
  function AxiosError(
    errorMessage,
    errorCode,
    errorConfig,
    request,
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
    if (errorConfig) {
      this.config = errorConfig;
    }
    if (request) {
      this.request = request;
    }
    if (responseData) {
      this.response = responseData;
    }
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
        status:
          this.response && this.response.status ? this.response.status : null,
      };
    },
  });
  var axiosErrorPrototype = AxiosError.prototype;
  var errorCodes = {};
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
  ].forEach(function (errorCodeIndex) {
    errorCodes[errorCodeIndex] = {
      value: errorCodeIndex,
    };
  });
  Object.defineProperties(AxiosError, errorCodes);
  Object.defineProperty(axiosErrorPrototype, "isAxiosError", {
    value: true,
  });
  AxiosError.from = function (
    errorObject,
    _errorCode,
    errorSeverityLevel,
    errorResponse,
    originalError,
    additionalErrorProperties,
  ) {
    var processedAxiosError = Object.create(axiosErrorPrototype);
    utilityFunctions.toFlatObject(
      errorObject,
      processedAxiosError,
      function (errorPrototype) {
        return errorPrototype !== Error.prototype;
      },
      function (errorType) {
        return errorType !== "isAxiosError";
      },
    );
    AxiosError.call(
      processedAxiosError,
      errorObject.message,
      _errorCode,
      errorSeverityLevel,
      errorResponse,
      originalError,
    );
    processedAxiosError.cause = errorObject;
    processedAxiosError.name = errorObject.name;
    if (additionalErrorProperties) {
      Object.assign(processedAxiosError, additionalErrorProperties);
    }
    return processedAxiosError;
  };
  function isObjectOrArray(_____________________________inputValue) {
    return (
      utilityFunctions.isPlainObject(_____________________________inputValue) ||
      utilityFunctions.isArray(_____________________________inputValue)
    );
  }
  function trimArrayBrackets(arrayString) {
    if (utilityFunctions.endsWith(arrayString, "[]")) {
      return arrayString.slice(0, -2);
    } else {
      return arrayString;
    }
  }
  function concatAndFormat(
    __inputString,
    stringToConcat,
    shouldWrapInBrackets,
  ) {
    if (__inputString) {
      return __inputString
        .concat(stringToConcat)
        .map(function (_____________________inputValue, _shouldWrapInBrackets) {
          _____________________inputValue = trimArrayBrackets(
            _____________________inputValue,
          );
          if (!shouldWrapInBrackets && _shouldWrapInBrackets) {
            return "[" + _____________________inputValue + "]";
          } else {
            return _____________________inputValue;
          }
        })
        .join(shouldWrapInBrackets ? "." : "");
    } else {
      return stringToConcat;
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
  function processFormData(formDataObject, formData, flattenedData) {
    if (!utilityFunctions.isObject(formDataObject)) {
      throw new TypeError("target must be an object");
    }
    formData = formData || new FormData();
    var hasMetaTokens = (flattenedData = utilityFunctions.toFlatObject(
      flattenedData,
      {
        metaTokens: true,
        dots: false,
        indexes: false,
      },
      false,
      function (propertyKey, _propertyValue) {
        return !utilityFunctions.isUndefined(_propertyValue[propertyKey]);
      },
    )).metaTokens;
    var visitorFunction = flattenedData.visitor || processInputData;
    var metaTokenDots = flattenedData.dots;
    var indexesArray = flattenedData.indexes;
    var isBlobSupported =
      (flattenedData.Blob || (typeof Blob != "undefined" && Blob)) &&
      utilityFunctions.isSpecCompliantForm(formData);
    if (!utilityFunctions.isFunction(visitorFunction)) {
      throw new TypeError("visitor must be a function");
    }
    function convertInputToBlobOrString(___inputValue) {
      if (___inputValue === null) {
        return "";
      }
      if (utilityFunctions.isDate(___inputValue)) {
        return ___inputValue.toISOString();
      }
      if (!isBlobSupported && utilityFunctions.isBlob(___inputValue)) {
        throw new AxiosError("Blob is not supported. Use a Buffer instead.");
      }
      if (
        utilityFunctions.isArrayBuffer(___inputValue) ||
        utilityFunctions.isTypedArray(___inputValue)
      ) {
        if (isBlobSupported && typeof Blob == "function") {
          return new Blob([___inputValue]);
        } else {
          return Buffer.from(___inputValue);
        }
      } else {
        return ___inputValue;
      }
    }
    function processInputData(_inputData, inputDataFormat, _currentIndex) {
      var __inputData = _inputData;
      if (
        _inputData &&
        !_currentIndex &&
        ______inputValue(_inputData) === "object"
      ) {
        if (utilityFunctions.endsWith(inputDataFormat, "{}")) {
          if (hasMetaTokens) {
            inputDataFormat = inputDataFormat;
          } else {
            inputDataFormat = inputDataFormat.slice(0, -2);
          }
          _inputData = JSON.stringify(_inputData);
        } else if (
          (utilityFunctions.isArray(_inputData) &&
            (function (_______inputArray) {
              return (
                utilityFunctions.isArray(_______inputArray) &&
                !_______inputArray.some(isObjectOrArray)
              );
            })(_inputData)) ||
          ((utilityFunctions.isFileList(_inputData) ||
            utilityFunctions.endsWith(inputDataFormat, "[]")) &&
            (__inputData = utilityFunctions.toArray(_inputData)))
        ) {
          inputDataFormat = trimArrayBrackets(inputDataFormat);
          __inputData.forEach(
            function (__________________inputValue, inputDataTimestamp) {
              if (
                !utilityFunctions.isUndefined(__________________inputValue) &&
                __________________inputValue !== null
              ) {
                formData.append(
                  indexesArray === true
                    ? concatAndFormat(
                        [inputDataFormat],
                        inputDataTimestamp,
                        metaTokenDots,
                      )
                    : indexesArray === null
                      ? inputDataFormat
                      : inputDataFormat + "[]",
                  convertInputToBlobOrString(__________________inputValue),
                );
              }
            },
          );
          return false;
        }
      }
      return (
        !!isObjectOrArray(_inputData) ||
        (formData.append(
          concatAndFormat(_currentIndex, inputDataFormat, metaTokenDots),
          convertInputToBlobOrString(_inputData),
        ),
        false)
      );
    }
    var visitedObjectsStack = [];
    var utilityFunctionsExtended = Object.assign(_utilityFunctions, {
      defaultVisitor: processInputData,
      convertValue: convertInputToBlobOrString,
      isVisitable: isObjectOrArray,
    });
    if (!utilityFunctions.isObject(formDataObject)) {
      throw new TypeError("data must be an object");
    }
    (function traverseGraphWithCircularCheck(currentNode, traversedPath) {
      if (!utilityFunctions.isUndefined(currentNode)) {
        if (visitedObjectsStack.indexOf(currentNode) !== -1) {
          throw Error(
            "Circular reference detected in " + traversedPath.join("."),
          );
        }
        visitedObjectsStack.push(currentNode);
        utilityFunctions.forEach(
          currentNode,
          function (nodeData, currentNodeValue) {
            if (
              (!utilityFunctions.isUndefined(nodeData) &&
                nodeData !== null &&
                visitorFunction.call(
                  formData,
                  nodeData,
                  utilityFunctions.isString(currentNodeValue)
                    ? currentNodeValue.trim()
                    : currentNodeValue,
                  traversedPath,
                  utilityFunctionsExtended,
                )) === true
            ) {
              traverseGraphWithCircularCheck(
                nodeData,
                traversedPath
                  ? traversedPath.concat(currentNodeValue)
                  : [currentNodeValue],
              );
            }
          },
        );
        visitedObjectsStack.pop();
      }
    })(formDataObject);
    return formData;
  }
  function encodeUriComponent(uriComponent) {
    var uriEncodingMap = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0",
    };
    return encodeURIComponent(uriComponent).replace(
      /[!'()~]|%20|%00/g,
      function (uriEncodingKey) {
        return uriEncodingMap[uriEncodingKey];
      },
    );
  }
  function processFormOnData(__event, ______formData) {
    this._pairs = [];
    if (__event) {
      processFormData(__event, this, ______formData);
    }
  }
  var urlSearchParams = processFormOnData.prototype;
  function _encodeUriComponent(_uriComponent) {
    return encodeURIComponent(_uriComponent)
      .replace(/%3A/gi, ":")
      .replace(/%24/g, "$")
      .replace(/%2C/gi, ",")
      .replace(/%20/g, "+")
      .replace(/%5B/gi, "[")
      .replace(/%5D/gi, "]");
  }
  function updateURLWithParams(currentUrl, params, urlParamsOptions) {
    if (!params) {
      return currentUrl;
    }
    var serializedParams;
    var urlParamEncoder =
      (urlParamsOptions && urlParamsOptions.encode) || _encodeUriComponent;
    var urlSerializerFunction = urlParamsOptions && urlParamsOptions.serialize;
    if (
      (serializedParams = urlSerializerFunction
        ? urlSerializerFunction(params, urlParamsOptions)
        : utilityFunctions.isURLSearchParams(params)
          ? params.toString()
          : new processFormOnData(params, urlParamsOptions).toString(
              urlParamEncoder,
            ))
    ) {
      var hashIndex = currentUrl.indexOf("#");
      if (hashIndex !== -1) {
        currentUrl = currentUrl.slice(0, hashIndex);
      }
      currentUrl +=
        (currentUrl.indexOf("?") === -1 ? "?" : "&") + serializedParams;
    }
    return currentUrl;
  }
  urlSearchParams.append = function (firstElement, secondElement) {
    this._pairs.push([firstElement, secondElement]);
  };
  urlSearchParams.toString = function (__callbackFunction) {
    var callbackOrEncoder = __callbackFunction
      ? function (callbackParameter) {
          return __callbackFunction.call(
            this,
            callbackParameter,
            encodeUriComponent,
          );
        }
      : encodeUriComponent;
    return this._pairs
      .map(function (eventParams) {
        return (
          callbackOrEncoder(eventParams[0]) +
          "=" +
          callbackOrEncoder(eventParams[1])
        );
      }, "")
      .join("&");
  };
  var eventEmitter;
  var EventEmitter = (function () {
    function _eventHandler() {
      parsedKeyValuePair(this, _eventHandler);
      this.handlers = [];
    }
    ___propertyIndex(_eventHandler, [
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
          utilityFunctions.forEach(this.handlers, function (__inputParameter) {
            if (__inputParameter !== null) {
              handlerCallback(__inputParameter);
            }
          });
        },
      },
    ]);
    return _eventHandler;
  })();
  var axiosConfigDefaults = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false,
  };
  var browserEnvironmentConfig = {
    isBrowser: true,
    classes: {
      URLSearchParams:
        typeof URLSearchParams != "undefined"
          ? URLSearchParams
          : processFormOnData,
      FormData: typeof FormData != "undefined" ? FormData : null,
      Blob: typeof Blob != "undefined" ? Blob : null,
    },
    isStandardBrowserEnv:
      (typeof navigator == "undefined" ||
        ((eventEmitter = navigator.product) !== "ReactNative" &&
          eventEmitter !== "NativeScript" &&
          eventEmitter !== "NS")) &&
      typeof window != "undefined" &&
      typeof document != "undefined",
    isStandardBrowserWebWorkerEnv:
      typeof WorkerGlobalScope != "undefined" &&
      self instanceof WorkerGlobalScope &&
      typeof self.importScripts == "function",
    protocols: ["http", "https", "file", "blob", "url", "data"],
  };
  function _processFormData(_formData) {
    function processArray(inputArray, currentValue, resultArray, currentIndex) {
      var currentInputValue = inputArray[currentIndex++];
      var isCurrentInputValueFinite = Number.isFinite(+currentInputValue);
      var isEndOfArray = currentIndex >= inputArray.length;
      if (!currentInputValue && utilityFunctions.isArray(resultArray)) {
        currentInputValue = resultArray.length;
      } else {
        currentInputValue = currentInputValue;
      }
      if (isEndOfArray) {
        if (utilityFunctions.hasOwnProp(resultArray, currentInputValue)) {
          resultArray[currentInputValue] = [
            resultArray[currentInputValue],
            currentValue,
          ];
        } else {
          resultArray[currentInputValue] = currentValue;
        }
        return !isCurrentInputValueFinite;
      } else {
        if (
          !resultArray[currentInputValue] ||
          !utilityFunctions.isObject(resultArray[currentInputValue])
        ) {
          resultArray[currentInputValue] = [];
        }
        if (
          processArray(
            inputArray,
            currentValue,
            resultArray[currentInputValue],
            currentIndex,
          ) &&
          utilityFunctions.isArray(resultArray[currentInputValue])
        ) {
          resultArray[currentInputValue] = (function (__inputObject) {
            var ___index;
            var _currentKey;
            var restructuredObject = {};
            var inputObjectKeys = Object.keys(__inputObject);
            var inputObjectKeyCount = inputObjectKeys.length;
            for (___index = 0; ___index < inputObjectKeyCount; ___index++) {
              restructuredObject[(_currentKey = inputObjectKeys[___index])] =
                __inputObject[_currentKey];
            }
            return restructuredObject;
          })(resultArray[currentInputValue]);
        }
        return !isCurrentInputValueFinite;
      }
    }
    if (
      utilityFunctions.isFormData(_formData) &&
      utilityFunctions.isFunction(_formData.entries)
    ) {
      var formDataMap = {};
      utilityFunctions.forEachEntry(
        _formData,
        function (_inputString, matchingResult) {
          processArray(
            (function (____inputString) {
              return utilityFunctions
                .matchAll(/\w+|\[(\w*)]/g, ____inputString)
                .map(function (_____inputArray) {
                  if (_____inputArray[0] === "[]") {
                    return "";
                  } else {
                    return _____inputArray[1] || _____inputArray[0];
                  }
                });
            })(_inputString),
            matchingResult,
            formDataMap,
            0,
          );
        },
      );
      return formDataMap;
    }
    return null;
  }
  var axiosConfig = {
    transitional: axiosConfigDefaults,
    adapter: ["xhr", "http"],
    transformRequest: [
      function (inputData, requestHandler) {
        var isFileListValid;
        var _contentType = requestHandler.getContentType() || "";
        var isJsonContentType = _contentType.indexOf("application/json") > -1;
        var isInputDataValid = utilityFunctions.isObject(inputData);
        if (isInputDataValid && utilityFunctions.isHTMLForm(inputData)) {
          inputData = new FormData(inputData);
        }
        if (utilityFunctions.isFormData(inputData)) {
          if (isJsonContentType && isJsonContentType) {
            return JSON.stringify(_processFormData(inputData));
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
        if (isInputDataValid) {
          if (_contentType.indexOf("application/x-www-form-urlencoded") > -1) {
            return (function (__formData, additionalParams) {
              return processFormData(
                __formData,
                new browserEnvironmentConfig.classes.URLSearchParams(),
                Object.assign(
                  {
                    visitor: function (
                      ___inputData,
                      inputDataBase64Key,
                      inputDataLength,
                      defaultVisitorFunction,
                    ) {
                      if (
                        browserEnvironmentConfig.isNode &&
                        utilityFunctions.isBuffer(___inputData)
                      ) {
                        this.append(
                          inputDataBase64Key,
                          ___inputData.toString("base64"),
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
                  additionalParams,
                ),
              );
            })(inputData, this.formSerializer).toString();
          }
          if (
            (isFileListValid = utilityFunctions.isFileList(inputData)) ||
            _contentType.indexOf("multipart/form-data") > -1
          ) {
            var formDataConstructor = this.env && this.env.FormData;
            return processFormData(
              isFileListValid
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
          requestHandler.setContentType("application/json", false);
          return (function (
            _________inputValue,
            parseFunction,
            defaultOutputFunction,
          ) {
            if (utilityFunctions.isString(_________inputValue)) {
              try {
                (parseFunction || JSON.parse)(_________inputValue);
                return utilityFunctions.trim(_________inputValue);
              } catch (_error) {
                if (_error.name !== "SyntaxError") {
                  throw _error;
                }
              }
            }
            return (defaultOutputFunction || JSON.stringify)(
              _________inputValue,
            );
          })(inputData);
        } else {
          return inputData;
        }
      },
    ],
    transformResponse: [
      function (jsonResponseString) {
        var transitionalConfig = this.transitional || axiosConfig.transitional;
        var isForcedJSONParsing =
          transitionalConfig && transitionalConfig.forcedJSONParsing;
        var isResponseTypeJson = this.responseType === "json";
        if (
          jsonResponseString &&
          utilityFunctions.isString(jsonResponseString) &&
          ((isForcedJSONParsing && !this.responseType) || isResponseTypeJson)
        ) {
          var shouldThrowErrorOnParsing =
            (!transitionalConfig || !transitionalConfig.silentJSONParsing) &&
            isResponseTypeJson;
          try {
            return JSON.parse(jsonResponseString);
          } catch (error) {
            if (shouldThrowErrorOnParsing) {
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
        return jsonResponseString;
      },
    ],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: browserEnvironmentConfig.classes.FormData,
      Blob: browserEnvironmentConfig.classes.Blob,
    },
    validateStatus: function (httpResponseCode) {
      return httpResponseCode >= 200 && httpResponseCode < 300;
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
      axiosConfig.headers[__headerKey] = {};
    },
  );
  var _axiosConfig = axiosConfig;
  var headerFieldsSet = utilityFunctions.toObjectSet([
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
  function formatAndNormalizeInput(____________________________inputValue) {
    return (
      ____________________________inputValue &&
      String(____________________________inputValue).trim().toLowerCase()
    );
  }
  function convertToStringOrArray(___________________inputValue) {
    if (
      ___________________inputValue === false ||
      ___________________inputValue == null
    ) {
      return ___________________inputValue;
    } else if (utilityFunctions.isArray(___________________inputValue)) {
      return ___________________inputValue.map(convertToStringOrArray);
    } else {
      return String(___________________inputValue);
    }
  }
  function checkStringPattern(
    inputString,
    patternToCheck,
    patternString,
    patternMatcher,
    isPatternStrChecked,
  ) {
    if (utilityFunctions.isFunction(patternMatcher)) {
      return patternMatcher.call(this, patternToCheck, patternString);
    } else {
      if (isPatternStrChecked) {
        patternToCheck = patternString;
      }
      if (utilityFunctions.isString(patternToCheck)) {
        if (utilityFunctions.isString(patternMatcher)) {
          return patternToCheck.indexOf(patternMatcher) !== -1;
        } else if (utilityFunctions.isRegExp(patternMatcher)) {
          return patternMatcher.test(patternToCheck);
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
  }
  var httpHeaderHandler = (function () {
    function stringPatternCheck(____________inputString) {
      parsedKeyValuePair(this, stringPatternCheck);
      if (____________inputString) {
        this.set(____________inputString);
      }
    }
    ___propertyIndex(
      stringPatternCheck,
      [
        {
          key: "set",
          value: function (input, headerName, isHeaderOverwrite) {
            var contextObject = this;
            function headerHandler(
              _headerValue,
              __headerName,
              isHeaderOptional,
            ) {
              var _headerName = formatAndNormalizeInput(__headerName);
              if (!_headerName) {
                throw new Error("header name must be a non-empty string");
              }
              var __headerIndex = utilityFunctions.findKey(
                contextObject,
                _headerName,
              );
              if (
                !__headerIndex ||
                contextObject[__headerIndex] === undefined ||
                isHeaderOptional === true ||
                (isHeaderOptional === undefined &&
                  contextObject[__headerIndex] !== false)
              ) {
                contextObject[__headerIndex || __headerName] =
                  convertToStringOrArray(_headerValue);
              }
            }
            var keyIndex;
            var headerKey;
            var headerValue;
            var headerIndex;
            var headerCollection;
            function processHeaderItems(headerItems, translations) {
              return utilityFunctions.forEach(
                headerItems,
                function (______event, headerId) {
                  return headerHandler(______event, headerId, translations);
                },
              );
            }
            if (
              utilityFunctions.isPlainObject(input) ||
              input instanceof this.constructor
            ) {
              processHeaderItems(input, headerName);
            } else if (
              utilityFunctions.isString(input) &&
              (input = input.trim()) &&
              !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(input.trim())
            ) {
              processHeaderItems(
                ((headerCollection = {}),
                (keyIndex = input) &&
                  keyIndex.split("\n").forEach(function (headerLine) {
                    headerIndex = headerLine.indexOf(":");
                    headerKey = headerLine
                      .substring(0, headerIndex)
                      .trim()
                      .toLowerCase();
                    headerValue = headerLine.substring(headerIndex + 1).trim();
                    if (
                      !!headerKey &&
                      (!headerCollection[headerKey] ||
                        !headerFieldsSet[headerKey])
                    ) {
                      if (headerKey === "set-cookie") {
                        if (headerCollection[headerKey]) {
                          headerCollection[headerKey].push(headerValue);
                        } else {
                          headerCollection[headerKey] = [headerValue];
                        }
                      } else {
                        headerCollection[headerKey] = headerCollection[
                          headerKey
                        ]
                          ? headerCollection[headerKey] + ", " + headerValue
                          : headerValue;
                      }
                    }
                  }),
                headerCollection),
                headerName,
              );
            } else if (input != null) {
              headerHandler(headerName, input, isHeaderOverwrite);
            }
            return this;
          },
        },
        {
          key: "get",
          value: function (inputEvent, parserOption) {
            if ((inputEvent = formatAndNormalizeInput(inputEvent))) {
              var parsedKey = utilityFunctions.findKey(this, inputEvent);
              if (parsedKey) {
                var parsedValue = this[parsedKey];
                if (!parserOption) {
                  return parsedValue;
                }
                if (parserOption === true) {
                  return (function (___inputString) {
                    var matchedExpression;
                    var parsedKeyValuePairs = Object.create(null);
                    for (
                      var keyValuePairRegex =
                        /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
                      (matchedExpression =
                        keyValuePairRegex.exec(___inputString));

                    ) {
                      parsedKeyValuePairs[matchedExpression[1]] =
                        matchedExpression[2];
                    }
                    return parsedKeyValuePairs;
                  })(parsedValue);
                }
                if (utilityFunctions.isFunction(parserOption)) {
                  return parserOption.call(this, parsedValue, parsedKey);
                }
                if (utilityFunctions.isRegExp(parserOption)) {
                  return parserOption.exec(parsedValue);
                }
                throw new TypeError("parser must be boolean|regexp|function");
              }
            }
          },
        },
        {
          key: "has",
          value: function (_________________inputValue, stringPattern) {
            if (
              (_________________inputValue = formatAndNormalizeInput(
                _________________inputValue,
              ))
            ) {
              var _foundKey = utilityFunctions.findKey(
                this,
                _________________inputValue,
              );
              return (
                !!_foundKey &&
                this[_foundKey] !== undefined &&
                (!stringPattern ||
                  !!checkStringPattern(
                    0,
                    this[_foundKey],
                    _foundKey,
                    stringPattern,
                  ))
              );
            }
            return false;
          },
        },
        {
          key: "delete",
          value: function (inputElement, thresholdValue) {
            var __contextObject = this;
            var isDeleted = false;
            function inputValueHandler(____________inputValue) {
              if (
                (____________inputValue = formatAndNormalizeInput(
                  ____________inputValue,
                ))
              ) {
                var foundKey = utilityFunctions.findKey(
                  __contextObject,
                  ____________inputValue,
                );
                if (
                  !!foundKey &&
                  (!thresholdValue ||
                    !!checkStringPattern(
                      0,
                      __contextObject[foundKey],
                      foundKey,
                      thresholdValue,
                    ))
                ) {
                  delete __contextObject[foundKey];
                  isDeleted = true;
                }
              }
            }
            if (utilityFunctions.isArray(inputElement)) {
              inputElement.forEach(inputValueHandler);
            } else {
              inputValueHandler(inputElement);
            }
            return isDeleted;
          },
        },
        {
          key: "clear",
          value: function (stringPatternToCheck) {
            var objectKeysArray = Object.keys(this);
            var objectKeysCount = objectKeysArray.length;
            for (var isModified = false; objectKeysCount--; ) {
              var currentObjectKey = objectKeysArray[objectKeysCount];
              if (
                !stringPatternToCheck ||
                !!checkStringPattern(
                  0,
                  this[currentObjectKey],
                  currentObjectKey,
                  stringPatternToCheck,
                  true,
                )
              ) {
                delete this[currentObjectKey];
                isModified = true;
              }
            }
            return isModified;
          },
        },
        {
          key: "normalize",
          value: function (shouldTransformKey) {
            var _contextObject = this;
            var transformedKeysMap = {};
            utilityFunctions.forEach(
              this,
              function (__inputValue, keyToTransform) {
                var transformedKeyIndex = utilityFunctions.findKey(
                  transformedKeysMap,
                  keyToTransform,
                );
                if (transformedKeyIndex) {
                  _contextObject[transformedKeyIndex] =
                    convertToStringOrArray(__inputValue);
                  delete _contextObject[keyToTransform];
                  return;
                }
                var transformedKey = shouldTransformKey
                  ? (function (______inputString) {
                      return ______inputString
                        .trim()
                        .toLowerCase()
                        .replace(
                          /([a-z\d])(\w*)/g,
                          function (___event, textValue, textLength) {
                            return textValue.toUpperCase() + textLength;
                          },
                        );
                    })(keyToTransform)
                  : String(keyToTransform).trim();
                if (transformedKey !== keyToTransform) {
                  delete _contextObject[keyToTransform];
                }
                _contextObject[transformedKey] =
                  convertToStringOrArray(__inputValue);
                transformedKeysMap[transformedKey] = true;
              },
            );
            return this;
          },
        },
        {
          key: "concat",
          value: function () {
            var constructorRef;
            var argumentCount = arguments.length;
            var argumentsArray = new Array(argumentCount);
            for (
              var _argumentIndex = 0;
              _argumentIndex < argumentCount;
              _argumentIndex++
            ) {
              argumentsArray[_argumentIndex] = arguments[_argumentIndex];
            }
            return (constructorRef = this.constructor).concat.apply(
              constructorRef,
              [this].concat(argumentsArray),
            );
          },
        },
        {
          key: "toJSON",
          value: function (__________inputValue) {
            var resultMap = Object.create(null);
            utilityFunctions.forEach(
              this,
              function (_______________________inputValue, resultMapIndex) {
                if (
                  _______________________inputValue != null &&
                  _______________________inputValue !== false
                ) {
                  resultMap[resultMapIndex] =
                    __________inputValue &&
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
              .map(function (_____iterableInput) {
                var _extractedIterable = extractIterable(_____iterableInput, 2);
                return _extractedIterable[0] + ": " + _extractedIterable[1];
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
          value: function (_inputParameter) {
            var instance = new this(_inputParameter);
            var numberOfArguments = arguments.length;
            var argumentArray = new Array(
              numberOfArguments > 1 ? numberOfArguments - 1 : 0,
            );
            for (
              var argumentIndex = 1;
              argumentIndex < numberOfArguments;
              argumentIndex++
            ) {
              argumentArray[argumentIndex - 1] = arguments[argumentIndex];
            }
            argumentArray.forEach(function (_______event) {
              return instance.set(_______event);
            });
            return instance;
          },
        },
        {
          key: "accessor",
          value: function (inputParameter) {
            var accessorMap = (this[internalSymbol] = this[internalSymbol] =
              {
                accessors: {},
              }).accessors;
            var prototypeObject = this.prototype;
            function initializeAccessorFunction(accessorName) {
              var initializeAccessor = formatAndNormalizeInput(accessorName);
              if (!accessorMap[initializeAccessor]) {
                (function (_targetObject, propertyName) {
                  var camelCasePropertyName = utilityFunctions.toCamelCase(
                    " " + propertyName,
                  );
                  ["get", "set", "has"].forEach(function (propertyMethodName) {
                    Object.defineProperty(
                      _targetObject,
                      propertyMethodName + camelCasePropertyName,
                      {
                        value: function (_event, eventData, eventOptions) {
                          return this[propertyMethodName].call(
                            this,
                            propertyName,
                            _event,
                            eventData,
                            eventOptions,
                          );
                        },
                        configurable: true,
                      },
                    );
                  });
                })(prototypeObject, accessorName);
                accessorMap[initializeAccessor] = true;
              }
            }
            if (utilityFunctions.isArray(inputParameter)) {
              inputParameter.forEach(initializeAccessorFunction);
            } else {
              initializeAccessorFunction(inputParameter);
            }
            return this;
          },
        },
      ],
    );
    return stringPatternCheck;
  })();
  httpHeaderHandler.accessor([
    "Content-Type",
    "Content-Length",
    "Accept",
    "Accept-Encoding",
    "User-Agent",
    "Authorization",
  ]);
  utilityFunctions.reduceDescriptors(
    httpHeaderHandler.prototype,
    function (_inputElement, transformedString) {
      var inputElementValue = _inputElement.value;
      var formattedTransformedString =
        transformedString[0].toUpperCase() + transformedString.slice(1);
      return {
        get: function () {
          return inputElementValue;
        },
        set: function (formattedTransactionValue) {
          this[formattedTransformedString] = formattedTransactionValue;
        },
      };
    },
  );
  utilityFunctions.freezeMethods(httpHeaderHandler);
  var _httpHeaderHandler = httpHeaderHandler;
  function httpRequestHandler(requestEvents, _requestConfig) {
    var requestContext = this || _axiosConfig;
    var requestConfiguration = _requestConfig || requestContext;
    var httpHeaders = _httpHeaderHandler.from(requestConfiguration.headers);
    var _requestData = requestConfiguration.data;
    utilityFunctions.forEach(requestEvents, function (eventHandler) {
      _requestData = eventHandler.call(
        requestContext,
        _requestData,
        httpHeaders.normalize(),
        _requestConfig ? _requestConfig.status : undefined,
      );
    });
    httpHeaders.normalize();
    return _requestData;
  }
  function checkCancellation(cancellationEvent) {
    return !!cancellationEvent && !!cancellationEvent.__CANCEL__;
  }
  function canceledError(_errorMessage, errorTimestamp, __errorCode) {
    AxiosError.call(
      this,
      _errorMessage == null ? "canceled" : _errorMessage,
      AxiosError.ERR_CANCELED,
      errorTimestamp,
      __errorCode,
    );
    this.name = "CanceledError";
  }
  utilityFunctions.inherits(canceledError, AxiosError, {
    __CANCEL__: true,
  });
  var cookieUtility = browserEnvironmentConfig.isStandardBrowserEnv
    ? {
        write: function (
          cookieName,
          cookieValue,
          expirationTimestamp,
          cookiePath,
          cookieDomain,
          isSecureCookie,
        ) {
          var cookieAttributes = [];
          cookieAttributes.push(
            cookieName + "=" + encodeURIComponent(cookieValue),
          );
          if (utilityFunctions.isNumber(expirationTimestamp)) {
            cookieAttributes.push(
              "expires=" + new Date(expirationTimestamp).toGMTString(),
            );
          }
          if (utilityFunctions.isString(cookiePath)) {
            cookieAttributes.push("path=" + cookiePath);
          }
          if (utilityFunctions.isString(cookieDomain)) {
            cookieAttributes.push("domain=" + cookieDomain);
          }
          if (isSecureCookie === true) {
            cookieAttributes.push("secure");
          }
          document.cookie = cookieAttributes.join("; ");
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
  function isUrlValid(baseUrl, targetUrl) {
    if (baseUrl && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(targetUrl)) {
      return (function (urlPath, trailingPath) {
        if (trailingPath) {
          return (
            urlPath.replace(/\/+$/, "") + "/" + trailingPath.replace(/^\/+/, "")
          );
        } else {
          return urlPath;
        }
      })(baseUrl, targetUrl);
    } else {
      return targetUrl;
    }
  }
  var isSameOrigin = browserEnvironmentConfig.isStandardBrowserEnv
    ? (function () {
        var parsedUrlDetails;
        var isOldIE = /(msie|trident)/i.test(navigator.userAgent);
        var anchorElement = document.createElement("a");
        function parseUrl(urlInput) {
          var urlValue = urlInput;
          if (isOldIE) {
            anchorElement.setAttribute("href", urlValue);
            urlValue = anchorElement.href;
          }
          anchorElement.setAttribute("href", urlValue);
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
        parsedUrlDetails = parseUrl(window.location.href);
        return function (urlOrString) {
          var parsedUrl = utilityFunctions.isString(urlOrString)
            ? parseUrl(urlOrString)
            : urlOrString;
          return (
            parsedUrl.protocol === parsedUrlDetails.protocol &&
            parsedUrl.host === parsedUrlDetails.host
          );
        };
      })()
    : function () {
        return true;
      };
  function progressHandler(progressCallback, timeoutThreshold) {
    var previousLoadedBytes = 0;
    var calculateTransferRate = (function (arrayLength, intervalDuration) {
      arrayLength = arrayLength || 10;
      var lastUpdateTime;
      var dataArray = new Array(arrayLength);
      var timestampArray = new Array(arrayLength);
      var __currentIndex = 0;
      var currentDataIndex = 0;
      if (intervalDuration !== undefined) {
        intervalDuration = intervalDuration;
      } else {
        intervalDuration = 1000;
      }
      return function (newDataValue) {
        var currentTimestamp = Date.now();
        var previousTimestamp = timestampArray[currentDataIndex];
        lastUpdateTime ||= currentTimestamp;
        dataArray[__currentIndex] = newDataValue;
        timestampArray[__currentIndex] = currentTimestamp;
        var dataIndex = currentDataIndex;
        for (var accumulatedSum = 0; dataIndex !== __currentIndex; ) {
          accumulatedSum += dataArray[dataIndex++];
          dataIndex %= arrayLength;
        }
        if (
          (__currentIndex = (__currentIndex + 1) % arrayLength) ===
          currentDataIndex
        ) {
          currentDataIndex = (currentDataIndex + 1) % arrayLength;
        }
        if (!(currentTimestamp - lastUpdateTime < intervalDuration)) {
          var timeDifference =
            previousTimestamp && currentTimestamp - previousTimestamp;
          if (timeDifference) {
            return Math.round((accumulatedSum * 1000) / timeDifference);
          } else {
            return undefined;
          }
        }
      };
    })(50, 250);
    return function (fileTransferEvent) {
      var loadedBytes = fileTransferEvent.loaded;
      var totalBytes = fileTransferEvent.lengthComputable
        ? fileTransferEvent.total
        : undefined;
      var bytesTransferredSinceLastCheck = loadedBytes - previousLoadedBytes;
      var transferRate = calculateTransferRate(bytesTransferredSinceLastCheck);
      previousLoadedBytes = loadedBytes;
      var fileTransferStatus = {
        loaded: loadedBytes,
        total: totalBytes,
        progress: totalBytes ? loadedBytes / totalBytes : undefined,
        bytes: bytesTransferredSinceLastCheck,
        rate: transferRate || undefined,
        estimated:
          transferRate && totalBytes && loadedBytes <= totalBytes
            ? (totalBytes - loadedBytes) / transferRate
            : undefined,
        event: fileTransferEvent,
      };
      fileTransferStatus[timeoutThreshold ? "download" : "upload"] = true;
      progressCallback(fileTransferStatus);
    };
  }
  var httpRequestAdapter = {
    http: null,
    xhr:
      typeof XMLHttpRequest != "undefined" &&
      function (requestConfig) {
        return new Promise(function (onSuccess, errorHandler) {
          var abortHandler;
          var contentType;
          var requestData = requestConfig.data;
          var httpHeaderNormalizer = _httpHeaderHandler
            .from(requestConfig.headers)
            .normalize();
          var responseType = requestConfig.responseType;
          function handleRequestAbort() {
            if (requestConfig.cancelToken) {
              requestConfig.cancelToken.unsubscribe(abortHandler);
            }
            if (requestConfig.signal) {
              requestConfig.signal.removeEventListener("abort", abortHandler);
            }
          }
          if (utilityFunctions.isFormData(requestData)) {
            if (
              browserEnvironmentConfig.isStandardBrowserEnv ||
              browserEnvironmentConfig.isStandardBrowserWebWorkerEnv
            ) {
              httpHeaderNormalizer.setContentType(false);
            } else if (
              httpHeaderNormalizer.getContentType(/^\s*multipart\/form-data/)
            ) {
              if (
                utilityFunctions.isString(
                  (contentType = httpHeaderNormalizer.getContentType()),
                )
              ) {
                httpHeaderNormalizer.setContentType(
                  contentType.replace(/^\s*(multipart\/form-data);+/, "$1"),
                );
              }
            } else {
              httpHeaderNormalizer.setContentType("multipart/form-data");
            }
          }
          var _xmlHttpRequest = new XMLHttpRequest();
          if (requestConfig.auth) {
            var username = requestConfig.auth.username || "";
            var authPassword = requestConfig.auth.password
              ? unescape(encodeURIComponent(requestConfig.auth.password))
              : "";
            httpHeaderNormalizer.set(
              "Authorization",
              "Basic " + btoa(username + ":" + authPassword),
            );
          }
          var resolvedUrl = isUrlValid(
            requestConfig.baseURL,
            requestConfig.url,
          );
          function handleHttpRequest() {
            if (_xmlHttpRequest) {
              var responseHeaders = _httpHeaderHandler.from(
                "getAllResponseHeaders" in _xmlHttpRequest &&
                  _xmlHttpRequest.getAllResponseHeaders(),
              );
              (function (responseHandler, errorCallback, ___requestOptions) {
                var validateStatusFunction =
                  ___requestOptions.config.validateStatus;
                if (
                  ___requestOptions.status &&
                  validateStatusFunction &&
                  !validateStatusFunction(___requestOptions.status)
                ) {
                  errorCallback(
                    new AxiosError(
                      "Request failed with status code " +
                        ___requestOptions.status,
                      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][
                        Math.floor(___requestOptions.status / 100) - 4
                      ],
                      ___requestOptions.config,
                      ___requestOptions.request,
                      ___requestOptions,
                    ),
                  );
                } else {
                  responseHandler(___requestOptions);
                }
              })(
                function (____event) {
                  onSuccess(____event);
                  handleRequestAbort();
                },
                function (errorEvent) {
                  errorHandler(errorEvent);
                  handleRequestAbort();
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
            updateURLWithParams(
              resolvedUrl,
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
              errorHandler(
                new AxiosError(
                  "Request aborted",
                  AxiosError.ECONNABORTED,
                  requestConfig,
                  _xmlHttpRequest,
                ),
              );
              _xmlHttpRequest = null;
            }
          };
          _xmlHttpRequest.onerror = function () {
            errorHandler(
              new AxiosError(
                "Network Error",
                AxiosError.ERR_NETWORK,
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
            var requestConfigDefaults =
              requestConfig.transitional || axiosConfigDefaults;
            if (requestConfig.timeoutErrorMessage) {
              timeoutErrorMessage = requestConfig.timeoutErrorMessage;
            }
            errorHandler(
              new AxiosError(
                timeoutErrorMessage,
                requestConfigDefaults.clarifyTimeoutError
                  ? AxiosError.ETIMEDOUT
                  : AxiosError.ECONNABORTED,
                requestConfig,
                _xmlHttpRequest,
              ),
            );
            _xmlHttpRequest = null;
          };
          if (browserEnvironmentConfig.isStandardBrowserEnv) {
            var xsrfToken =
              isSameOrigin(resolvedUrl) &&
              requestConfig.xsrfCookieName &&
              cookieUtility.read(requestConfig.xsrfCookieName);
            if (xsrfToken) {
              httpHeaderNormalizer.set(requestConfig.xsrfHeaderName, xsrfToken);
            }
          }
          if (requestData === undefined) {
            httpHeaderNormalizer.setContentType(null);
          }
          if ("setRequestHeader" in _xmlHttpRequest) {
            utilityFunctions.forEach(
              httpHeaderNormalizer.toJSON(),
              function (__headerValue, ___headerName) {
                _xmlHttpRequest.setRequestHeader(___headerName, __headerValue);
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
              progressHandler(requestConfig.onDownloadProgress, true),
            );
          }
          if (
            typeof requestConfig.onUploadProgress == "function" &&
            _xmlHttpRequest.upload
          ) {
            _xmlHttpRequest.upload.addEventListener(
              "progress",
              progressHandler(requestConfig.onUploadProgress),
            );
          }
          if (requestConfig.cancelToken || requestConfig.signal) {
            abortHandler = function (isErrorHandled) {
              if (_xmlHttpRequest) {
                errorHandler(
                  !isErrorHandled || isErrorHandled.type
                    ? new canceledError(null, requestConfig, _xmlHttpRequest)
                    : isErrorHandled,
                );
                _xmlHttpRequest.abort();
                _xmlHttpRequest = null;
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
          var urlProtocolMatch;
          var urlProtocol =
            ((urlProtocolMatch = /^([-+\w]{1,25})(:?\/\/|:)/.exec(
              resolvedUrl,
            )) &&
              urlProtocolMatch[1]) ||
            "";
          if (
            urlProtocol &&
            browserEnvironmentConfig.protocols.indexOf(urlProtocol) === -1
          ) {
            errorHandler(
              new AxiosError(
                "Unsupported protocol " + urlProtocol + ":",
                AxiosError.ERR_BAD_REQUEST,
                requestConfig,
              ),
            );
          } else {
            _xmlHttpRequest.send(requestData || null);
          }
        });
      },
  };
  utilityFunctions.forEach(
    httpRequestAdapter,
    function (objectToDefineProperties, propertyValue) {
      if (objectToDefineProperties) {
        try {
          Object.defineProperty(objectToDefineProperties, "name", {
            value: propertyValue,
          });
        } catch (______error) {}
        Object.defineProperty(objectToDefineProperties, "adapterName", {
          value: propertyValue,
        });
      }
    },
  );
  function formatStringWithDash(______________inputString) {
    return `- ${______________inputString}`;
  }
  function isFunctionOrNullOrFalse(___________________________inputValue) {
    return (
      utilityFunctions.isFunction(___________________________inputValue) ||
      ___________________________inputValue === null ||
      ___________________________inputValue === false
    );
  }
  function getAvailableAdapter(adaptersInput) {
    var currentAdapter;
    var _currentAdapter;
    var adapterCount = (adaptersInput = utilityFunctions.isArray(adaptersInput)
      ? adaptersInput
      : [adaptersInput]).length;
    var adapterMapping = {};
    for (var adapterIndex = 0; adapterIndex < adapterCount; adapterIndex++) {
      var currentAdapterName = undefined;
      _currentAdapter = currentAdapter = adaptersInput[adapterIndex];
      if (
        !isFunctionOrNullOrFalse(currentAdapter) &&
        (_currentAdapter =
          httpRequestAdapter[
            (currentAdapterName = String(currentAdapter)).toLowerCase()
          ]) === undefined
      ) {
        throw new AxiosError(`Unknown adapter '${currentAdapterName}'`);
      }
      if (_currentAdapter) {
        break;
      }
      adapterMapping[currentAdapterName || "#" + adapterIndex] =
        _currentAdapter;
    }
    if (!_currentAdapter) {
      var unsupportedAdaptersMessages = Object.entries(adapterMapping).map(
        function (__iterableInput) {
          var extractedIterable = extractIterable(__iterableInput, 2);
          var firstExtractedValue = extractedIterable[0];
          var secondExtractedValue = extractedIterable[1];
          return `adapter ${firstExtractedValue} ${secondExtractedValue === false ? "is not supported by the environment" : "is not available in the build"}`;
        },
      );
      throw new AxiosError(
        "There is no suitable adapter to dispatch the request " +
          (adapterCount
            ? unsupportedAdaptersMessages.length > 1
              ? "since :\n" +
                unsupportedAdaptersMessages.map(formatStringWithDash).join("\n")
              : " " + formatStringWithDash(unsupportedAdaptersMessages[0])
            : "as no adapter specified"),
        "ERR_NOT_SUPPORT",
      );
    }
    return _currentAdapter;
  }
  function _requestHandler(requestEvent) {
    if (requestEvent.cancelToken) {
      requestEvent.cancelToken.throwIfRequested();
    }
    if (requestEvent.signal && requestEvent.signal.aborted) {
      throw new canceledError(null, requestEvent);
    }
  }
  function httpRequestConfig(httpRequestConfigOptions) {
    _requestHandler(httpRequestConfigOptions);
    httpRequestConfigOptions.headers = _httpHeaderHandler.from(
      httpRequestConfigOptions.headers,
    );
    httpRequestConfigOptions.data = httpRequestHandler.call(
      httpRequestConfigOptions,
      httpRequestConfigOptions.transformRequest,
    );
    if (
      ["post", "put", "patch"].indexOf(httpRequestConfigOptions.method) !== -1
    ) {
      httpRequestConfigOptions.headers.setContentType(
        "application/x-www-form-urlencoded",
        false,
      );
    }
    return getAvailableAdapter(
      httpRequestConfigOptions.adapter || _axiosConfig.adapter,
    )(httpRequestConfigOptions).then(
      function (httpResponse) {
        _requestHandler(httpRequestConfigOptions);
        httpResponse.data = httpRequestHandler.call(
          httpRequestConfigOptions,
          httpRequestConfigOptions.transformResponse,
          httpResponse,
        );
        httpResponse.headers = _httpHeaderHandler.from(httpResponse.headers);
        return httpResponse;
      },
      function (httpRequest) {
        if (!checkCancellation(httpRequest)) {
          _requestHandler(httpRequestConfigOptions);
          if (httpRequest && httpRequest.response) {
            httpRequest.response.data = httpRequestHandler.call(
              httpRequestConfigOptions,
              httpRequestConfigOptions.transformResponse,
              httpRequest.response,
            );
            httpRequest.response.headers = _httpHeaderHandler.from(
              httpRequest.response.headers,
            );
          }
        }
        return Promise.reject(httpRequest);
      },
    );
  }
  function httpHeaderToJson(httpHeader) {
    if (httpHeader instanceof _httpHeaderHandler) {
      return httpHeader.toJSON();
    } else {
      return httpHeader;
    }
  }
  function mergeOptions(sourceOptions, targetOptions) {
    targetOptions = targetOptions || {};
    var mergedOptions = {};
    function _mergeObjects(_sourceObject, __targetObject, _isCaseless) {
      if (
        utilityFunctions.isPlainObject(_sourceObject) &&
        utilityFunctions.isPlainObject(__targetObject)
      ) {
        return utilityFunctions.merge.call(
          {
            caseless: _isCaseless,
          },
          _sourceObject,
          __targetObject,
        );
      } else if (utilityFunctions.isPlainObject(__targetObject)) {
        return utilityFunctions.merge({}, __targetObject);
      } else if (utilityFunctions.isArray(__targetObject)) {
        return __targetObject.slice();
      } else {
        return __targetObject;
      }
    }
    function __mergeObjects(__sourceObject, _____targetObject, mergeDepth) {
      if (utilityFunctions.isUndefined(_____targetObject)) {
        if (utilityFunctions.isUndefined(__sourceObject)) {
          return undefined;
        } else {
          return _mergeObjects(undefined, __sourceObject, mergeDepth);
        }
      } else {
        return _mergeObjects(__sourceObject, _____targetObject, mergeDepth);
      }
    }
    function _mergeWithUndefined(targetValue, valueToMerge) {
      if (!utilityFunctions.isUndefined(valueToMerge)) {
        return _mergeObjects(undefined, valueToMerge);
      }
    }
    function mergeWithUndefined(___sourceObject, ______targetObject) {
      if (utilityFunctions.isUndefined(______targetObject)) {
        if (utilityFunctions.isUndefined(___sourceObject)) {
          return undefined;
        } else {
          return _mergeObjects(undefined, ___sourceObject);
        }
      } else {
        return _mergeObjects(undefined, ______targetObject);
      }
    }
    function _mergeOptions(optionsToMerge, _optionsToMerge, __optionIndex) {
      if (__optionIndex in targetOptions) {
        return _mergeObjects(optionsToMerge, _optionsToMerge);
      } else if (__optionIndex in sourceOptions) {
        return _mergeObjects(undefined, optionsToMerge);
      } else {
        return undefined;
      }
    }
    var optionHandlers = {
      url: _mergeWithUndefined,
      method: _mergeWithUndefined,
      data: _mergeWithUndefined,
      baseURL: mergeWithUndefined,
      transformRequest: mergeWithUndefined,
      transformResponse: mergeWithUndefined,
      paramsSerializer: mergeWithUndefined,
      timeout: mergeWithUndefined,
      timeoutMessage: mergeWithUndefined,
      withCredentials: mergeWithUndefined,
      adapter: mergeWithUndefined,
      responseType: mergeWithUndefined,
      xsrfCookieName: mergeWithUndefined,
      xsrfHeaderName: mergeWithUndefined,
      onUploadProgress: mergeWithUndefined,
      onDownloadProgress: mergeWithUndefined,
      decompress: mergeWithUndefined,
      maxContentLength: mergeWithUndefined,
      maxBodyLength: mergeWithUndefined,
      beforeRedirect: mergeWithUndefined,
      transport: mergeWithUndefined,
      httpAgent: mergeWithUndefined,
      httpsAgent: mergeWithUndefined,
      cancelToken: mergeWithUndefined,
      socketPath: mergeWithUndefined,
      responseEncoding: mergeWithUndefined,
      validateStatus: _mergeOptions,
      headers: function (firstHttpHeader, secondHttpHeader) {
        return __mergeObjects(
          httpHeaderToJson(firstHttpHeader),
          httpHeaderToJson(secondHttpHeader),
          true,
        );
      },
    };
    utilityFunctions.forEach(
      Object.keys(Object.assign({}, sourceOptions, targetOptions)),
      function (_optionKey) {
        var optionHandlerFunction =
          optionHandlers[_optionKey] || __mergeObjects;
        var mergedOptionValue = optionHandlerFunction(
          sourceOptions[_optionKey],
          targetOptions[_optionKey],
          _optionKey,
        );
        if (
          !utilityFunctions.isUndefined(mergedOptionValue) ||
          optionHandlerFunction === _mergeOptions
        ) {
          mergedOptions[_optionKey] = mergedOptionValue;
        }
      },
    );
    return mergedOptions;
  }
  var axiosVersion = "1.6.0";
  var typeCheckers = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(
    function (typeCheckerKey, typeCheckCount) {
      typeCheckers[typeCheckerKey] = function (inputValueToCheck) {
        return (
          ______inputValue(inputValueToCheck) === typeCheckerKey ||
          "a" + (typeCheckCount < 1 ? "n " : " ") + typeCheckerKey
        );
      };
    },
  );
  var transitionalOptionsChecker = {};
  typeCheckers.transitional = function (
    isTransitionalOptionEnabled,
    transitionalVersion,
    transitionalWarningMessage,
  ) {
    function logTransitionalOption(
      transitionalOption,
      transitionalOptionStatus,
    ) {
      return (
        "[Axios v1.6.0] Transitional option '" +
        transitionalOption +
        "'" +
        transitionalOptionStatus +
        (transitionalWarningMessage ? ". " + transitionalWarningMessage : "")
      );
    }
    return function (transitionalOptionValue, transitionalOptionKey, _index) {
      if (isTransitionalOptionEnabled === false) {
        throw new AxiosError(
          logTransitionalOption(
            transitionalOptionKey,
            " has been removed" +
              (transitionalVersion ? " in " + transitionalVersion : ""),
          ),
          AxiosError.ERR_DEPRECATED,
        );
      }
      if (
        transitionalVersion &&
        !transitionalOptionsChecker[transitionalOptionKey]
      ) {
        transitionalOptionsChecker[transitionalOptionKey] = true;
        console.warn(
          logTransitionalOption(
            transitionalOptionKey,
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
          transitionalOptionKey,
          _index,
        )
      );
    };
  };
  var optionsValidator = {
    assertOptions: function (
      optionsObject,
      optionsValidators,
      isUnknownOptionAllowed,
    ) {
      if (______inputValue(optionsObject) !== "object") {
        throw new AxiosError(
          "options must be an object",
          AxiosError.ERR_BAD_OPTION_VALUE,
        );
      }
      var optionKeys = Object.keys(optionsObject);
      for (var optionIndex = optionKeys.length; optionIndex-- > 0; ) {
        var optionKey = optionKeys[optionIndex];
        var optionValidator = optionsValidators[optionKey];
        if (optionValidator) {
          var optionValue = optionsObject[optionKey];
          var isOptionValueValid =
            optionValue === undefined ||
            optionValidator(optionValue, optionKey, optionsObject);
          if (isOptionValueValid !== true) {
            throw new AxiosError(
              "option " + optionKey + " must be " + isOptionValueValid,
              AxiosError.ERR_BAD_OPTION_VALUE,
            );
          }
        } else if (isUnknownOptionAllowed !== true) {
          throw new AxiosError(
            "Unknown option " + optionKey,
            AxiosError.ERR_BAD_OPTION,
          );
        }
      }
    },
    validators: typeCheckers,
  };
  var _optionsValidator = optionsValidator.validators;
  var typeOf = (function () {
    function interceptorFunction(defaultInterceptorOptions) {
      parsedKeyValuePair(this, interceptorFunction);
      this.defaults = defaultInterceptorOptions;
      this.interceptors = {
        request: new EventEmitter(),
        response: new EventEmitter(),
      };
    }
    ___propertyIndex(interceptorFunction, [
      {
        key: "request",
        value: function (inputValue, requestOptions) {
          if (typeof inputValue == "string") {
            (requestOptions = requestOptions || {}).url = inputValue;
          } else {
            requestOptions = inputValue || {};
          }
          var resolvedRequestOptions = (requestOptions = mergeOptions(
            this.defaults,
            requestOptions,
          ));
          var transitionalOptions = resolvedRequestOptions.transitional;
          var paramsSerializerFunction =
            resolvedRequestOptions.paramsSerializer;
          var requestHeaders = resolvedRequestOptions.headers;
          if (transitionalOptions !== undefined) {
            optionsValidator.assertOptions(
              transitionalOptions,
              {
                silentJSONParsing: _optionsValidator.transitional(
                  _optionsValidator.boolean,
                ),
                forcedJSONParsing: _optionsValidator.transitional(
                  _optionsValidator.boolean,
                ),
                clarifyTimeoutError: _optionsValidator.transitional(
                  _optionsValidator.boolean,
                ),
              },
              false,
            );
          }
          if (paramsSerializerFunction != null) {
            if (utilityFunctions.isFunction(paramsSerializerFunction)) {
              requestOptions.paramsSerializer = {
                serialize: paramsSerializerFunction,
              };
            } else {
              optionsValidator.assertOptions(
                paramsSerializerFunction,
                {
                  encode: _optionsValidator.function,
                  serialize: _optionsValidator.function,
                },
                true,
              );
            }
          }
          requestOptions.method = (
            requestOptions.method ||
            this.defaults.method ||
            "get"
          ).toLowerCase();
          var mergedRequestHeaders =
            requestHeaders &&
            utilityFunctions.merge(
              requestHeaders.common,
              requestHeaders[requestOptions.method],
            );
          if (requestHeaders) {
            utilityFunctions.forEach(
              ["delete", "get", "head", "post", "put", "patch", "common"],
              function (_headerKey) {
                delete requestHeaders[_headerKey];
              },
            );
          }
          requestOptions.headers = _httpHeaderHandler.concat(
            mergedRequestHeaders,
            requestHeaders,
          );
          var interceptorFunctions = [];
          var areAllInterceptorsSynchronous = true;
          this.interceptors.request.forEach(function (interceptor) {
            if (
              typeof interceptor.runWhen != "function" ||
              interceptor.runWhen(requestOptions) !== false
            ) {
              areAllInterceptorsSynchronous =
                areAllInterceptorsSynchronous && interceptor.synchronous;
              interceptorFunctions.unshift(
                interceptor.fulfilled,
                interceptor.rejected,
              );
            }
          });
          var promiseChain;
          var responseInterceptorFunctions = [];
          this.interceptors.response.forEach(function (_interceptorFunction) {
            responseInterceptorFunctions.push(
              _interceptorFunction.fulfilled,
              _interceptorFunction.rejected,
            );
          });
          var totalInterceptorFunctions;
          var interceptorIndex = 0;
          if (!areAllInterceptorsSynchronous) {
            var interceptorPromiseChain = [
              httpRequestConfig.bind(this),
              undefined,
            ];
            interceptorPromiseChain.unshift.apply(
              interceptorPromiseChain,
              interceptorFunctions,
            );
            interceptorPromiseChain.push.apply(
              interceptorPromiseChain,
              responseInterceptorFunctions,
            );
            totalInterceptorFunctions = interceptorPromiseChain.length;
            promiseChain = Promise.resolve(requestOptions);
            while (interceptorIndex < totalInterceptorFunctions) {
              promiseChain = promiseChain.then(
                interceptorPromiseChain[interceptorIndex++],
                interceptorPromiseChain[interceptorIndex++],
              );
            }
            return promiseChain;
          }
          totalInterceptorFunctions = interceptorFunctions.length;
          var requestOptionsModified = requestOptions;
          for (
            interceptorIndex = 0;
            interceptorIndex < totalInterceptorFunctions;

          ) {
            var currentInterceptorFunction =
              interceptorFunctions[interceptorIndex++];
            var _errorHandlerFunction =
              interceptorFunctions[interceptorIndex++];
            try {
              requestOptionsModified = currentInterceptorFunction(
                requestOptionsModified,
              );
            } catch (__error) {
              _errorHandlerFunction.call(this, __error);
              break;
            }
          }
          try {
            promiseChain = httpRequestConfig.call(this, requestOptionsModified);
          } catch (____error) {
            return Promise.reject(____error);
          }
          interceptorIndex = 0;
          totalInterceptorFunctions = responseInterceptorFunctions.length;
          while (interceptorIndex < totalInterceptorFunctions) {
            promiseChain = promiseChain.then(
              responseInterceptorFunctions[interceptorIndex++],
              responseInterceptorFunctions[interceptorIndex++],
            );
          }
          return promiseChain;
        },
      },
      {
        key: "getUri",
        value: function (optionsWithBaseUrl) {
          return updateURLWithParams(
            isUrlValid(
              (optionsWithBaseUrl = mergeOptions(
                this.defaults,
                optionsWithBaseUrl,
              )).baseURL,
              optionsWithBaseUrl.url,
            ),
            optionsWithBaseUrl.params,
            optionsWithBaseUrl.paramsSerializer,
          );
        },
      },
    ]);
    return interceptorFunction;
  })();
  utilityFunctions.forEach(
    ["delete", "get", "head", "options"],
    function (_httpMethod) {
      typeOf.prototype[_httpMethod] = function (
        urlParameter,
        _____requestOptions,
      ) {
        return this.request(
          mergeOptions(_____requestOptions || {}, {
            method: _httpMethod,
            url: urlParameter,
            data: (_____requestOptions || {}).data,
          }),
        );
      };
    },
  );
  utilityFunctions.forEach(["post", "put", "patch"], function (httpMethod) {
    function createRequestHandler(contentHeaders) {
      return function (url, __requestData, ____requestOptions) {
        return this.request(
          mergeOptions(____requestOptions || {}, {
            method: httpMethod,
            headers: contentHeaders
              ? {
                  "Content-Type": "multipart/form-data",
                }
              : {},
            url: url,
            data: __requestData,
          }),
        );
      };
    }
    typeOf.prototype[httpMethod] = createRequestHandler();
    typeOf.prototype[httpMethod + "Form"] = createRequestHandler(true);
  });
  var axiosClass = typeOf;
  var CancelToken = (function () {
    function executorFunction(executorCallback) {
      parsedKeyValuePair(this, executorFunction);
      if (typeof executorCallback != "function") {
        throw new TypeError("executor must be a function.");
      }
      var resolveCallback;
      this.promise = new Promise(function (________event) {
        resolveCallback = ________event;
      });
      var contextReference = this;
      this.promise.then(function (event) {
        if (contextReference._listeners) {
          for (
            var listenerCount = contextReference._listeners.length;
            listenerCount-- > 0;

          ) {
            contextReference._listeners[listenerCount](event);
          }
          contextReference._listeners = null;
        }
      });
      this.promise.then = function (contextSubscriber) {
        var subscriptionCallback;
        var subscriptionPromise = new Promise(function (subscriptionHandler) {
          contextReference.subscribe(subscriptionHandler);
          subscriptionCallback = subscriptionHandler;
        }).then(contextSubscriber);
        subscriptionPromise.cancel = function () {
          contextReference.unsubscribe(subscriptionCallback);
        };
        return subscriptionPromise;
      };
      executorCallback(function (errorParameter, errorDetail, ___errorCode) {
        if (!contextReference.reason) {
          contextReference.reason = new canceledError(
            errorParameter,
            errorDetail,
            ___errorCode,
          );
          resolveCallback(contextReference.reason);
        }
      });
    }
    ___propertyIndex(
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
          value: function (_callbackFunction) {
            if (this.reason) {
              _callbackFunction(this.reason);
            } else if (this._listeners) {
              this._listeners.push(_callbackFunction);
            } else {
              this._listeners = [_callbackFunction];
            }
          },
        },
        {
          key: "unsubscribe",
          value: function (eventListener) {
            if (this._listeners) {
              var eventListenerIndex = this._listeners.indexOf(eventListener);
              if (eventListenerIndex !== -1) {
                this._listeners.splice(eventListenerIndex, 1);
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
              token: new executorFunction(function (inputTokenValue) {
                tokenValue = inputTokenValue;
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
  Object.entries(httpStatusCodes).forEach(function (____iterableInput) {
    var extractedIterableValue = extractIterable(____iterableInput, 2);
    var extractedValue = extractedIterableValue[0];
    var httpStatusCode = extractedIterableValue[1];
    httpStatusCodes[httpStatusCode] = extractedValue;
  });
  var _httpStatusCodes = httpStatusCodes;
  var isDefined = (function createAxiosInstance(__axiosConfig) {
    var axiosInstance = new axiosClass(__axiosConfig);
    var requestInterceptor = _currentInputValue(
      axiosClass.prototype.request,
      axiosInstance,
    );
    utilityFunctions.extend(
      requestInterceptor,
      axiosClass.prototype,
      axiosInstance,
      {
        allOwnKeys: true,
      },
    );
    utilityFunctions.extend(requestInterceptor, axiosInstance, null, {
      allOwnKeys: true,
    });
    requestInterceptor.create = function (axiosOptions) {
      return createAxiosInstance(mergeOptions(__axiosConfig, axiosOptions));
    };
    return requestInterceptor;
  })(_axiosConfig);
  isDefined.Axios = axiosClass;
  isDefined.CanceledError = canceledError;
  isDefined.CancelToken = CancelToken;
  isDefined.isCancel = checkCancellation;
  isDefined.VERSION = axiosVersion;
  isDefined.toFormData = processFormData;
  isDefined.AxiosError = AxiosError;
  isDefined.Cancel = isDefined.CanceledError;
  isDefined.all = function (promiseArray) {
    return Promise.all(promiseArray);
  };
  isDefined.spread = function (originalFunction) {
    return function (_argumentsArray) {
      return originalFunction.apply(null, _argumentsArray);
    };
  };
  isDefined.isAxiosError = function (___error) {
    return (
      utilityFunctions.isObject(___error) && ___error.isAxiosError === true
    );
  };
  isDefined.mergeConfig = mergeOptions;
  isDefined.AxiosHeaders = _httpHeaderHandler;
  isDefined.formToJSON = function (formDataOrElement) {
    return _processFormData(
      utilityFunctions.isHTMLForm(formDataOrElement)
        ? new FormData(formDataOrElement)
        : formDataOrElement,
    );
  };
  isDefined.getAdapter = getAvailableAdapter;
  isDefined.HttpStatusCode = _httpStatusCodes;
  isDefined.default = isDefined;
  return isDefined;
});
