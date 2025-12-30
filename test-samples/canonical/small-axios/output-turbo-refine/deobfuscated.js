(function (_globalContext, initializeAxiosInstance) {
  if (typeof exports == "object" && typeof module != "undefined") {
    module.exports = initializeAxiosInstance();
  } else if (typeof define == "function" && define.amd) {
    define(initializeAxiosInstance);
  } else {
    (_globalContext =
      typeof globalThis != "undefined"
        ? globalThis
        : _globalContext || self).axios = initializeAxiosInstance();
  }
})(this, function () {
  "use strict";

  function determineValueType(inputValueToDetermineType) {
    if (typeof Symbol == "function" && typeof Symbol.iterator == "symbol") {
      determineValueType = function (____event) {
        return typeof ____event;
      };
    } else {
      determineValueType = function (________inputValue) {
        if (
          ________inputValue &&
          typeof Symbol == "function" &&
          ________inputValue.constructor === Symbol &&
          ________inputValue !== Symbol.prototype
        ) {
          return "symbol";
        } else {
          return typeof ________inputValue;
        }
      };
    }
    return determineValueType(inputValueToDetermineType);
  }
  function checkParserInstance(isInstanceOfConstructor, constructorClass) {
    if (!(isInstanceOfConstructor instanceof constructorClass)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function defineProperties(_____targetObject, propertyDescriptors) {
    for (
      var _propertyIndex = 0;
      _propertyIndex < propertyDescriptors.length;
      _propertyIndex++
    ) {
      var propertyDescriptor = propertyDescriptors[_propertyIndex];
      propertyDescriptor.enumerable = propertyDescriptor.enumerable || false;
      propertyDescriptor.configurable = true;
      if ("value" in propertyDescriptor) {
        propertyDescriptor.writable = true;
      }
      Object.defineProperty(
        _____targetObject,
        propertyDescriptor.key,
        propertyDescriptor,
      );
    }
  }
  function definePropertyCount(
    constructorFn,
    prototypeOfSourceObject,
    __sourceObject,
  ) {
    if (prototypeOfSourceObject) {
      defineProperties(constructorFn.prototype, prototypeOfSourceObject);
    }
    if (__sourceObject) {
      defineProperties(constructorFn, __sourceObject);
    }
    Object.defineProperty(constructorFn, "prototype", {
      writable: false,
    });
    return constructorFn;
  }
  function retrieveIterableElements(inputIterable, _maximumItemCount) {
    return (
      (function (_____inputArray) {
        if (Array.isArray(_____inputArray)) {
          return _____inputArray;
        }
      })(inputIterable) ||
      (function (sourceIterable, maximumItemCount) {
        var getIteratorFunction =
          sourceIterable == null
            ? null
            : (typeof Symbol != "undefined" &&
                sourceIterable[Symbol.iterator]) ||
              sourceIterable["@@iterator"];
        if (getIteratorFunction == null) {
          return;
        }
        var iteratorNextResult;
        var caughtError;
        var collectedItems = [];
        var isIterationComplete = true;
        var isErrorOccurred = false;
        try {
          for (
            getIteratorFunction = getIteratorFunction.call(sourceIterable);
            !(isIterationComplete = (iteratorNextResult =
              getIteratorFunction.next()).done) &&
            (collectedItems.push(iteratorNextResult.value),
            !maximumItemCount || collectedItems.length !== maximumItemCount);
            isIterationComplete = true
          ) {}
        } catch (___caughtError) {
          isErrorOccurred = true;
          caughtError = ___caughtError;
        } finally {
          try {
            if (!isIterationComplete && getIteratorFunction.return != null) {
              getIteratorFunction.return();
            }
          } finally {
            if (isErrorOccurred) {
              throw caughtError;
            }
          }
        }
        return collectedItems;
      })(inputIterable, _maximumItemCount) ||
      (function (____inputValue, lookupArgument) {
        if (!____inputValue) {
          return;
        }
        if (typeof ____inputValue == "string") {
          return currentOptionIndex(____inputValue, lookupArgument);
        }
        var inputValueType = Object.prototype.toString
          .call(____inputValue)
          .slice(8, -1);
        if (inputValueType === "Object" && ____inputValue.constructor) {
          inputValueType = ____inputValue.constructor.name;
        }
        if (inputValueType === "Map" || inputValueType === "Set") {
          return Array.from(____inputValue);
        }
        if (
          inputValueType === "Arguments" ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(inputValueType)
        ) {
          return currentOptionIndex(____inputValue, lookupArgument);
        }
      })(inputIterable, _maximumItemCount) ||
      (function () {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function currentOptionIndex(availableOptions, maxOptionCount) {
    if (maxOptionCount == null || maxOptionCount > availableOptions.length) {
      maxOptionCount = availableOptions.length;
    }
    var _currentOptionIndex = 0;
    var selectedAvailableOptions = new Array(maxOptionCount);
    for (; _currentOptionIndex < maxOptionCount; _currentOptionIndex++) {
      selectedAvailableOptions[_currentOptionIndex] =
        availableOptions[_currentOptionIndex];
    }
    return selectedAvailableOptions;
  }
  function headerLineWrapper(headerLineFunction, functionExecutionContext) {
    return function () {
      return headerLineFunction.apply(functionExecutionContext, arguments);
    };
  }
  var objectTypeMapping;
  var objectToStringRepresentation = Object.prototype.toString;
  var getObjectPrototype = Object.getPrototypeOf;
  objectTypeMapping = Object.create(null);
  function determineObjectType(__inputObject) {
    var inputObjectStringType =
      objectToStringRepresentation.call(__inputObject);
    return (objectTypeMapping[inputObjectStringType] ||= inputObjectStringType
      .slice(8, -1)
      .toLowerCase());
  }
  function stringTypeMatcher(desiredStringType) {
    desiredStringType = desiredStringType.toLowerCase();
    return function (__inputParameter) {
      return determineObjectType(__inputParameter) === desiredStringType;
    };
  }
  function getCurrentInterceptorIndex(expectedType) {
    return function (_inputValueForTypeCheck) {
      return determineValueType(_inputValueForTypeCheck) === expectedType;
    };
  }
  var isArrayCheck = Array.isArray;
  var isValueUndefined = getCurrentInterceptorIndex("undefined");
  var isArrayBufferTypeMatcher = stringTypeMatcher("ArrayBuffer");
  var isStringTypeMatcher = getCurrentInterceptorIndex("string");
  var isFunctionTypeMatcher = getCurrentInterceptorIndex("function");
  var isNumberTypeChecker = getCurrentInterceptorIndex("number");
  function inputValueIsObject(__inputValueToCheck) {
    return (
      __inputValueToCheck !== null &&
      determineValueType(__inputValueToCheck) === "object"
    );
  }
  function checkIfPlainObject(inputValueToCheck) {
    if (determineObjectType(inputValueToCheck) !== "object") {
      return false;
    }
    var inputValuePrototype = getObjectPrototype(inputValueToCheck);
    return (
      (inputValuePrototype === null ||
        inputValuePrototype === Object.prototype ||
        Object.getPrototypeOf(inputValuePrototype) === null) &&
      !(Symbol.toStringTag in inputValueToCheck) &&
      !(Symbol.iterator in inputValueToCheck)
    );
  }
  var isDateTypeMatcher = stringTypeMatcher("Date");
  var isFileTypeMatcher = stringTypeMatcher("File");
  var blobStringTypeMatcher = stringTypeMatcher("Blob");
  var createStringMatcherForFileList = stringTypeMatcher("FileList");
  var createStringMatcherForUrlSearchParams =
    stringTypeMatcher("URLSearchParams");
  function processInputData(_inputData, callbackForInputProcessing) {
    var propertyIndex;
    var inputCollectionSize;
    var _includeAllOwnKeys = (
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
    ).allOwnKeys;
    var shouldIncludeAllOwnKeys =
      _includeAllOwnKeys !== undefined && _includeAllOwnKeys;
    if (_inputData != null) {
      if (determineValueType(_inputData) !== "object") {
        _inputData = [_inputData];
      }
      if (isArrayCheck(_inputData)) {
        propertyIndex = 0;
        inputCollectionSize = _inputData.length;
        for (; propertyIndex < inputCollectionSize; propertyIndex++) {
          callbackForInputProcessing.call(
            null,
            _inputData[propertyIndex],
            propertyIndex,
            _inputData,
          );
        }
      } else {
        var propertyName;
        var inputPropertyNames = shouldIncludeAllOwnKeys
          ? Object.getOwnPropertyNames(_inputData)
          : Object.keys(_inputData);
        var propertyCount = inputPropertyNames.length;
        for (
          propertyIndex = 0;
          propertyIndex < propertyCount;
          propertyIndex++
        ) {
          propertyName = inputPropertyNames[propertyIndex];
          callbackForInputProcessing.call(
            null,
            _inputData[propertyName],
            propertyName,
            _inputData,
          );
        }
      }
    }
  }
  function findMatchingKeyInObject(objectToMatch, targetKey) {
    targetKey = targetKey.toLowerCase();
    var currentKey;
    var objectKeys = Object.keys(objectToMatch);
    for (
      var ___currentKeyIndex = objectKeys.length;
      ___currentKeyIndex-- > 0;

    ) {
      if (
        targetKey ===
        (currentKey = objectKeys[___currentKeyIndex]).toLowerCase()
      ) {
        return currentKey;
      }
    }
    return null;
  }
  var globalExecutionContext =
    typeof globalThis != "undefined"
      ? globalThis
      : typeof self != "undefined"
        ? self
        : typeof window != "undefined"
          ? window
          : global;
  function isUserInputValid(__userInputValue) {
    return (
      !isValueUndefined(__userInputValue) &&
      __userInputValue !== globalExecutionContext
    );
  }
  var isUint8ArrayAvailable;
  isUint8ArrayAvailable =
    typeof Uint8Array != "undefined" && getObjectPrototype(Uint8Array);
  function ______inputArray(____inputArray) {
    return (
      isUint8ArrayAvailable && ____inputArray instanceof isUint8ArrayAvailable
    );
  }
  var isHTMLFormElementMatcher = stringTypeMatcher("HTMLFormElement");
  var checkOwnProperty = (function () {
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    return function (______targetObject, ___propertyKey) {
      return _hasOwnProperty.call(______targetObject, ___propertyKey);
    };
  })();
  var createStringTypeMatcher = stringTypeMatcher("RegExp");
  function definePropertiesWithModification(
    __targetObject,
    modifyPropertyDescriptor,
  ) {
    var targetObjectPropertyDescriptors =
      Object.getOwnPropertyDescriptors(__targetObject);
    var modifiedPropertyDescriptorMap = {};
    processInputData(
      targetObjectPropertyDescriptors,
      function (originalPropertyDescriptor, optionsForPropertyDescriptor) {
        var updatedPropertyDescriptor;
        if (
          (updatedPropertyDescriptor = modifyPropertyDescriptor(
            originalPropertyDescriptor,
            optionsForPropertyDescriptor,
            __targetObject,
          )) !== false
        ) {
          modifiedPropertyDescriptorMap[optionsForPropertyDescriptor] =
            updatedPropertyDescriptor || originalPropertyDescriptor;
        }
      },
    );
    Object.defineProperties(__targetObject, modifiedPropertyDescriptorMap);
  }
  var lowercaseAlphabet = "abcdefghijklmnopqrstuvwxyz";
  var digits = "0123456789";
  var characterSetsMap = {
    DIGIT: digits,
    ALPHA: lowercaseAlphabet,
    ALPHA_DIGIT: lowercaseAlphabet + lowercaseAlphabet.toUpperCase() + digits,
  };
  var isAsyncFunctionType = stringTypeMatcher("AsyncFunction");
  var __typeCheckerObject = {
    isArray: isArrayCheck,
    isArrayBuffer: isArrayBufferTypeMatcher,
    isBuffer: function (inputValueForBufferCheck) {
      return (
        inputValueForBufferCheck !== null &&
        !isValueUndefined(inputValueForBufferCheck) &&
        inputValueForBufferCheck.constructor !== null &&
        !isValueUndefined(inputValueForBufferCheck.constructor) &&
        isFunctionTypeMatcher(inputValueForBufferCheck.constructor.isBuffer) &&
        inputValueForBufferCheck.constructor.isBuffer(inputValueForBufferCheck)
      );
    },
    isFormData: function (_formData) {
      var formDataType;
      return (
        _formData &&
        ((typeof FormData == "function" && _formData instanceof FormData) ||
          (isFunctionTypeMatcher(_formData.append) &&
            ((formDataType = determineObjectType(_formData)) === "formdata" ||
              (formDataType === "object" &&
                isFunctionTypeMatcher(_formData.toString) &&
                _formData.toString() === "[object FormData]"))))
      );
    },
    isArrayBufferView: function (dataView) {
      if (typeof ArrayBuffer != "undefined" && ArrayBuffer.isView) {
        return ArrayBuffer.isView(dataView);
      } else {
        return (
          dataView &&
          dataView.buffer &&
          isArrayBufferTypeMatcher(dataView.buffer)
        );
      }
    },
    isString: isStringTypeMatcher,
    isNumber: isNumberTypeChecker,
    isBoolean: function (isStrictBoolean) {
      return isStrictBoolean === true || isStrictBoolean === false;
    },
    isObject: inputValueIsObject,
    isPlainObject: checkIfPlainObject,
    isUndefined: isValueUndefined,
    isDate: isDateTypeMatcher,
    isFile: isFileTypeMatcher,
    isBlob: blobStringTypeMatcher,
    isRegExp: createStringTypeMatcher,
    isFunction: isFunctionTypeMatcher,
    isStream: function (_eventObject) {
      return (
        inputValueIsObject(_eventObject) &&
        isFunctionTypeMatcher(_eventObject.pipe)
      );
    },
    isURLSearchParams: createStringMatcherForUrlSearchParams,
    isTypedArray: ______inputArray,
    isFileList: createStringMatcherForFileList,
    forEach: processInputData,
    merge: function mergeArgsIntoObject() {
      var isCaselessMerge = ((isUserInputValid(this) && this) || {}).caseless;
      var accumulatedArguments = {};
      function mergeArgumentsWithObject(argumentsToMerge, sourceObject) {
        var matchedKey =
          (isCaselessMerge &&
            findMatchingKeyInObject(accumulatedArguments, sourceObject)) ||
          sourceObject;
        if (
          checkIfPlainObject(accumulatedArguments[matchedKey]) &&
          checkIfPlainObject(argumentsToMerge)
        ) {
          accumulatedArguments[matchedKey] = mergeArgsIntoObject(
            accumulatedArguments[matchedKey],
            argumentsToMerge,
          );
        } else if (checkIfPlainObject(argumentsToMerge)) {
          accumulatedArguments[matchedKey] = mergeArgsIntoObject(
            {},
            argumentsToMerge,
          );
        } else if (isArrayCheck(argumentsToMerge)) {
          accumulatedArguments[matchedKey] = argumentsToMerge.slice();
        } else {
          accumulatedArguments[matchedKey] = argumentsToMerge;
        }
      }
      var argumentIndex = 0;
      for (
        var totalArgumentsCount = arguments.length;
        argumentIndex < totalArgumentsCount;
        argumentIndex++
      ) {
        if (arguments[argumentIndex]) {
          processInputData(arguments[argumentIndex], mergeArgumentsWithObject);
        }
      }
      return accumulatedArguments;
    },
    extend: function (processedResults, _callbackHandler, formattedHeaderLine) {
      processInputData(
        _callbackHandler,
        function (headerLineContent, resultKey) {
          if (formattedHeaderLine && isFunctionTypeMatcher(headerLineContent)) {
            processedResults[resultKey] = headerLineWrapper(
              headerLineContent,
              formattedHeaderLine,
            );
          } else {
            processedResults[resultKey] = headerLineContent;
          }
        },
        {
          allOwnKeys: (arguments.length > 3 && arguments[3] !== undefined
            ? arguments[3]
            : {}
          ).allOwnKeys,
        },
      );
      return processedResults;
    },
    trim: function (____inputString) {
      if (____inputString.trim) {
        return ____inputString.trim();
      } else {
        return ____inputString.replace(
          /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
          "",
        );
      }
    },
    stripBOM: function (inputStringWithoutBOM) {
      if (inputStringWithoutBOM.charCodeAt(0) === 65279) {
        inputStringWithoutBOM = inputStringWithoutBOM.slice(1);
      }
      return inputStringWithoutBOM;
    },
    inherits: function (
      createChildConstructor,
      baseClass,
      extraPrototypeProps,
      inheritedPrototypeProperties,
    ) {
      createChildConstructor.prototype = Object.create(
        baseClass.prototype,
        inheritedPrototypeProperties,
      );
      createChildConstructor.prototype.constructor = createChildConstructor;
      Object.defineProperty(createChildConstructor, "super", {
        value: baseClass.prototype,
      });
      if (extraPrototypeProps) {
        Object.assign(createChildConstructor.prototype, extraPrototypeProps);
      }
    },
    toFlatObject: function (
      sourcePrototypeObject,
      targetObject,
      sourcePrototype,
      propertyFilterCallback,
    ) {
      var propertyNamesArray;
      var currentPropertyCount;
      var currentPropertyName;
      var propertyCopyTracker = {};
      targetObject = targetObject || {};
      if (sourcePrototypeObject == null) {
        return targetObject;
      }
      do {
        for (
          currentPropertyCount = (propertyNamesArray =
            Object.getOwnPropertyNames(sourcePrototypeObject)).length;
          currentPropertyCount-- > 0;

        ) {
          currentPropertyName = propertyNamesArray[currentPropertyCount];
          if (
            (!propertyFilterCallback ||
              !!propertyFilterCallback(
                currentPropertyName,
                sourcePrototypeObject,
                targetObject,
              )) &&
            !propertyCopyTracker[currentPropertyName]
          ) {
            targetObject[currentPropertyName] =
              sourcePrototypeObject[currentPropertyName];
            propertyCopyTracker[currentPropertyName] = true;
          }
        }
        sourcePrototypeObject =
          sourcePrototype !== false &&
          getObjectPrototype(sourcePrototypeObject);
      } while (
        sourcePrototypeObject &&
        (!sourcePrototype ||
          sourcePrototype(sourcePrototypeObject, targetObject)) &&
        sourcePrototypeObject !== Object.prototype
      );
      return targetObject;
    },
    kindOf: determineObjectType,
    kindOfTest: stringTypeMatcher,
    endsWith: function (
      _inputString,
      targetSubstring,
      adjustedSubstringLength,
    ) {
      _inputString = String(_inputString);
      if (
        adjustedSubstringLength === undefined ||
        adjustedSubstringLength > _inputString.length
      ) {
        adjustedSubstringLength = _inputString.length;
      }
      adjustedSubstringLength -= targetSubstring.length;
      var targetSubstringIndex = _inputString.indexOf(
        targetSubstring,
        adjustedSubstringLength,
      );
      return (
        targetSubstringIndex !== -1 &&
        targetSubstringIndex === adjustedSubstringLength
      );
    },
    toArray: function (inputArray) {
      if (!inputArray) {
        return null;
      }
      if (isArrayCheck(inputArray)) {
        return inputArray;
      }
      var lengthOfInputArray = inputArray.length;
      if (!isNumberTypeChecker(lengthOfInputArray)) {
        return null;
      }
      var arrayCopy = new Array(lengthOfInputArray);
      while (lengthOfInputArray-- > 0) {
        arrayCopy[lengthOfInputArray] = inputArray[lengthOfInputArray];
      }
      return arrayCopy;
    },
    forEachEntry: function (_collectionIterator, processItemCallback) {
      var currentIteratorResult;
      for (
        var collectionItemsIterator = (
          _collectionIterator && _collectionIterator[Symbol.iterator]
        ).call(_collectionIterator);
        (currentIteratorResult = collectionItemsIterator.next()) &&
        !currentIteratorResult.done;

      ) {
        var _currentItem = currentIteratorResult.value;
        processItemCallback.call(
          _collectionIterator,
          _currentItem[0],
          _currentItem[1],
        );
      }
    },
    matchAll: function (regexMatchResult, patternForRegexMatching) {
      var currentMatch;
      var matchingResults = [];
      for (
        ;
        (currentMatch = regexMatchResult.exec(patternForRegexMatching)) !==
        null;

      ) {
        matchingResults.push(currentMatch);
      }
      return matchingResults;
    },
    isHTMLForm: isHTMLFormElementMatcher,
    hasOwnProperty: checkOwnProperty,
    hasOwnProp: checkOwnProperty,
    reduceDescriptors: definePropertiesWithModification,
    freezeMethods: function (_targetObject) {
      definePropertiesWithModification(
        _targetObject,
        function (propertyDescriptorObject, __propertyName) {
          if (
            isFunctionTypeMatcher(_targetObject) &&
            ["arguments", "caller", "callee"].indexOf(__propertyName) !== -1
          ) {
            return false;
          }
          var targetPropertyValue = _targetObject[__propertyName];
          if (isFunctionTypeMatcher(targetPropertyValue)) {
            propertyDescriptorObject.enumerable = false;
            if ("writable" in propertyDescriptorObject) {
              propertyDescriptorObject.writable = false;
            } else {
              propertyDescriptorObject.set ||= function () {
                throw Error(
                  "Can not rewrite read-only method '" + __propertyName + "'",
                );
              };
            }
          }
        },
      );
    },
    toObjectSet: function (inputElements, stringSplitDelimiter) {
      var uniqueElementTracker = {};
      function trackProcessedElements(elementsToProcess) {
        elementsToProcess.forEach(function (uniqueElementIdentifier) {
          uniqueElementTracker[uniqueElementIdentifier] = true;
        });
      }
      if (isArrayCheck(inputElements)) {
        trackProcessedElements(inputElements);
      } else {
        trackProcessedElements(
          String(inputElements).split(stringSplitDelimiter),
        );
      }
      return uniqueElementTracker;
    },
    toCamelCase: function (inputStringForTransformation) {
      return inputStringForTransformation
        .toLowerCase()
        .replace(
          /[-_\s]([a-z\d])(\w*)/g,
          function (inputEvent, _____inputString, stringSuffix) {
            return _____inputString.toUpperCase() + stringSuffix;
          },
        );
    },
    noop: function () {},
    toFiniteNumber: function (parsedInputValue, defaultReturnValue) {
      parsedInputValue = +parsedInputValue;
      if (Number.isFinite(parsedInputValue)) {
        return parsedInputValue;
      } else {
        return defaultReturnValue;
      }
    },
    findKey: findMatchingKeyInObject,
    global: globalExecutionContext,
    isContextDefined: isUserInputValid,
    ALPHABET: characterSetsMap,
    generateString: function (
      desiredStringLength = 16,
      selectedCharacterSet = characterSetsMap.ALPHA_DIGIT,
    ) {
      var generatedRandomString = "";
      var selectedCharacterSetLength = selectedCharacterSet.length;
      for (; desiredStringLength--; ) {
        generatedRandomString +=
          selectedCharacterSet[
            (Math.random() * selectedCharacterSetLength) | 0
          ];
      }
      return generatedRandomString;
    },
    isSpecCompliantForm: function (__formData) {
      return (
        !!__formData &&
        !!isFunctionTypeMatcher(__formData.append) &&
        __formData[Symbol.toStringTag] === "FormData" &&
        !!__formData[Symbol.iterator]
      );
    },
    toJSONObject: function (__inputValue) {
      var uniqueTrackedItems = new Array(10);
      return (function processNestedObject(inputCollection, trackedItemDepth) {
        if (inputValueIsObject(inputCollection)) {
          if (uniqueTrackedItems.indexOf(inputCollection) >= 0) {
            return;
          }
          if (!("toJSON" in inputCollection)) {
            uniqueTrackedItems[trackedItemDepth] = inputCollection;
            var transformedResult = isArrayCheck(inputCollection) ? [] : {};
            processInputData(
              inputCollection,
              function (_inputObject, targetResultIndex) {
                var transformedInputObject = processNestedObject(
                  _inputObject,
                  trackedItemDepth + 1,
                );
                if (!isValueUndefined(transformedInputObject)) {
                  transformedResult[targetResultIndex] = transformedInputObject;
                }
              },
            );
            uniqueTrackedItems[trackedItemDepth] = undefined;
            return transformedResult;
          }
        }
        return inputCollection;
      })(__inputValue, 0);
    },
    isAsyncFn: isAsyncFunctionType,
    isThenable: function (event) {
      return (
        event &&
        (inputValueIsObject(event) || isFunctionTypeMatcher(event)) &&
        isFunctionTypeMatcher(event.then) &&
        isFunctionTypeMatcher(event.catch)
      );
    },
  };
  function HttpError(
    errorMessageText,
    errorCodeValue,
    axiosErrorConfig,
    requestPayload,
    httpResponseData,
  ) {
    Error.call(this);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
    this.message = errorMessageText;
    this.name = "AxiosError";
    if (errorCodeValue) {
      this.code = errorCodeValue;
    }
    if (axiosErrorConfig) {
      this.config = axiosErrorConfig;
    }
    if (requestPayload) {
      this.request = requestPayload;
    }
    if (httpResponseData) {
      this.response = httpResponseData;
    }
  }
  __typeCheckerObject.inherits(HttpError, Error, {
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
        config: __typeCheckerObject.toJSONObject(this.config),
        code: this.code,
        status:
          this.response && this.response.status ? this.response.status : null,
      };
    },
  });
  var httpErrorPrototype = HttpError.prototype;
  var axiosErrorLookup = {};
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
  ].forEach(function (_errorCode) {
    axiosErrorLookup[_errorCode] = {
      value: _errorCode,
    };
  });
  Object.defineProperties(HttpError, axiosErrorLookup);
  Object.defineProperty(httpErrorPrototype, "isAxiosError", {
    value: true,
  });
  HttpError.from = function (
    inputError,
    errorMessage,
    errorCode,
    innerErrorCode,
    errorConfiguration,
    errorAdditionalProperties,
  ) {
    var httpErrorInstance = Object.create(httpErrorPrototype);
    __typeCheckerObject.toFlatObject(
      inputError,
      httpErrorInstance,
      function (customErrorPrototype) {
        return customErrorPrototype !== Error.prototype;
      },
      function (isNetworkError) {
        return isNetworkError !== "isAxiosError";
      },
    );
    HttpError.call(
      httpErrorInstance,
      inputError.message,
      errorMessage,
      errorCode,
      innerErrorCode,
      errorConfiguration,
    );
    httpErrorInstance.cause = inputError;
    httpErrorInstance.name = inputError.name;
    if (errorAdditionalProperties) {
      Object.assign(httpErrorInstance, errorAdditionalProperties);
    }
    return httpErrorInstance;
  };
  function inputDataIsPlainObjectOrArray(____inputData) {
    return (
      __typeCheckerObject.isPlainObject(____inputData) ||
      __typeCheckerObject.isArray(____inputData)
    );
  }
  function trimArrayBrackets(inputStringWithoutBrackets) {
    if (__typeCheckerObject.endsWith(inputStringWithoutBrackets, "[]")) {
      return inputStringWithoutBrackets.slice(0, -2);
    } else {
      return inputStringWithoutBrackets;
    }
  }
  function appendElementToArray(
    arrayToAppend,
    elementToConcat,
    shouldWrapElementInBrackets,
  ) {
    if (arrayToAppend) {
      return arrayToAppend
        .concat(elementToConcat)
        .map(function (elementInputValue, shouldWrapInBrackets) {
          elementInputValue = trimArrayBrackets(elementInputValue);
          if (!shouldWrapElementInBrackets && shouldWrapInBrackets) {
            return "[" + elementInputValue + "]";
          } else {
            return elementInputValue;
          }
        })
        .join(shouldWrapElementInBrackets ? "." : "");
    } else {
      return elementToConcat;
    }
  }
  var typeCheckerUtils = __typeCheckerObject.toFlatObject(
    __typeCheckerObject,
    {},
    null,
    function (candidateInputString) {
      return /^is[A-Z]/.test(candidateInputString);
    },
  );
  function processFormEntries(
    formDataObject,
    formEntries,
    formProcessingOptions,
  ) {
    if (!__typeCheckerObject.isObject(formDataObject)) {
      throw new TypeError("target must be an object");
    }
    formEntries = formEntries || new FormData();
    var metaTokenSettings = (formProcessingOptions =
      __typeCheckerObject.toFlatObject(
        formProcessingOptions,
        {
          metaTokens: true,
          dots: false,
          indexes: false,
        },
        false,
        function (propertyKey, propertyValue) {
          return !__typeCheckerObject.isUndefined(propertyValue[propertyKey]);
        },
      )).metaTokens;
    var visitorFunction = formProcessingOptions.visitor || processInputValue;
    var enableDotNotation = formProcessingOptions.dots;
    var shouldIncludeIndexes = formProcessingOptions.indexes;
    var isBlobSupportedInEnvironment =
      (formProcessingOptions.Blob || (typeof Blob != "undefined" && Blob)) &&
      __typeCheckerObject.isSpecCompliantForm(formEntries);
    if (!__typeCheckerObject.isFunction(visitorFunction)) {
      throw new TypeError("visitor must be a function");
    }
    function convertValueForInput(inputValueToConvert) {
      if (inputValueToConvert === null) {
        return "";
      }
      if (__typeCheckerObject.isDate(inputValueToConvert)) {
        return inputValueToConvert.toISOString();
      }
      if (
        !isBlobSupportedInEnvironment &&
        __typeCheckerObject.isBlob(inputValueToConvert)
      ) {
        throw new HttpError("Blob is not supported. Use a Buffer instead.");
      }
      if (
        __typeCheckerObject.isArrayBuffer(inputValueToConvert) ||
        __typeCheckerObject.isTypedArray(inputValueToConvert)
      ) {
        if (isBlobSupportedInEnvironment && typeof Blob == "function") {
          return new Blob([inputValueToConvert]);
        } else {
          return Buffer.from(inputValueToConvert);
        }
      } else {
        return inputValueToConvert;
      }
    }
    function processInputValue(inputValue, resourceKey, arrayIndex) {
      var processedInputValue = inputValue;
      if (
        inputValue &&
        !arrayIndex &&
        determineValueType(inputValue) === "object"
      ) {
        if (__typeCheckerObject.endsWith(resourceKey, "{}")) {
          if (metaTokenSettings) {
            resourceKey = resourceKey;
          } else {
            resourceKey = resourceKey.slice(0, -2);
          }
          inputValue = JSON.stringify(inputValue);
        } else if (
          (__typeCheckerObject.isArray(inputValue) &&
            (function (___inputArray) {
              return (
                __typeCheckerObject.isArray(___inputArray) &&
                !___inputArray.some(inputDataIsPlainObjectOrArray)
              );
            })(inputValue)) ||
          ((__typeCheckerObject.isFileList(inputValue) ||
            __typeCheckerObject.endsWith(resourceKey, "[]")) &&
            (processedInputValue = __typeCheckerObject.toArray(inputValue)))
        ) {
          resourceKey = trimArrayBrackets(resourceKey);
          processedInputValue.forEach(function (__eventData, formInputData) {
            if (
              !__typeCheckerObject.isUndefined(__eventData) &&
              __eventData !== null
            ) {
              formEntries.append(
                shouldIncludeIndexes === true
                  ? appendElementToArray(
                      [resourceKey],
                      formInputData,
                      enableDotNotation,
                    )
                  : shouldIncludeIndexes === null
                    ? resourceKey
                    : resourceKey + "[]",
                convertValueForInput(__eventData),
              );
            }
          });
          return false;
        }
      }
      return (
        !!inputDataIsPlainObjectOrArray(inputValue) ||
        (formEntries.append(
          appendElementToArray(arrayIndex, resourceKey, enableDotNotation),
          convertValueForInput(inputValue),
        ),
        false)
      );
    }
    var itemProcessingStack = [];
    var typeCheckerOptions = Object.assign(typeCheckerUtils, {
      defaultVisitor: processInputValue,
      convertValue: convertValueForInput,
      isVisitable: inputDataIsPlainObjectOrArray,
    });
    if (!__typeCheckerObject.isObject(formDataObject)) {
      throw new TypeError("data must be an object");
    }
    (function validateAndProcessItem(currentItem, itemReferencePath) {
      if (!__typeCheckerObject.isUndefined(currentItem)) {
        if (itemProcessingStack.indexOf(currentItem) !== -1) {
          throw Error(
            "Circular reference detected in " + itemReferencePath.join("."),
          );
        }
        itemProcessingStack.push(currentItem);
        __typeCheckerObject.forEach(
          currentItem,
          function (itemInputValue, _inputValueToProcess) {
            if (
              (!__typeCheckerObject.isUndefined(itemInputValue) &&
                itemInputValue !== null &&
                visitorFunction.call(
                  formEntries,
                  itemInputValue,
                  __typeCheckerObject.isString(_inputValueToProcess)
                    ? _inputValueToProcess.trim()
                    : _inputValueToProcess,
                  itemReferencePath,
                  typeCheckerOptions,
                )) === true
            ) {
              validateAndProcessItem(
                itemInputValue,
                itemReferencePath
                  ? itemReferencePath.concat(_inputValueToProcess)
                  : [_inputValueToProcess],
              );
            }
          },
        );
        itemProcessingStack.pop();
      }
    })(formDataObject);
    return formEntries;
  }
  function encodeAndReplaceUrlCharacters(inputUrl) {
    var characterEncodingMap = {
      "!": "%21",
      "'": "%27",
      "(": "%28",
      ")": "%29",
      "~": "%7E",
      "%20": "+",
      "%00": "\0",
    };
    return encodeURIComponent(inputUrl).replace(
      /[!'()~]|%20|%00/g,
      function (charEncodingIndex) {
        return characterEncodingMap[charEncodingIndex];
      },
    );
  }
  function processEventData(____eventData, eventContext) {
    this._pairs = [];
    if (____eventData) {
      processFormEntries(____eventData, this, eventContext);
    }
  }
  var eventHandlerPrototype = processEventData.prototype;
  function uriComponentToEncode(_uriComponentToEncode) {
    return encodeURIComponent(_uriComponentToEncode)
      .replace(/%3A/gi, ":")
      .replace(/%24/g, "$")
      .replace(/%2C/gi, ",")
      .replace(/%20/g, "+")
      .replace(/%5B/gi, "[")
      .replace(/%5D/gi, "]");
  }
  function buildUrlWithQueryParams(
    baseUrlWithParams,
    urlParam,
    queryParamOptions,
  ) {
    if (!urlParam) {
      return baseUrlWithParams;
    }
    var serializedParameterString;
    var urlParameterEncoder =
      (queryParamOptions && queryParamOptions.encode) || uriComponentToEncode;
    var serializeQueryParamFunction =
      queryParamOptions && queryParamOptions.serialize;
    if (
      (serializedParameterString = serializeQueryParamFunction
        ? serializeQueryParamFunction(urlParam, queryParamOptions)
        : __typeCheckerObject.isURLSearchParams(urlParam)
          ? urlParam.toString()
          : new processEventData(urlParam, queryParamOptions).toString(
              urlParameterEncoder,
            ))
    ) {
      var hashDelimiterIndex = baseUrlWithParams.indexOf("#");
      if (hashDelimiterIndex !== -1) {
        baseUrlWithParams = baseUrlWithParams.slice(0, hashDelimiterIndex);
      }
      baseUrlWithParams +=
        (baseUrlWithParams.indexOf("?") === -1 ? "?" : "&") +
        serializedParameterString;
    }
    return baseUrlWithParams;
  }
  eventHandlerPrototype.append = function (pairKey, secondValue) {
    this._pairs.push([pairKey, secondValue]);
  };
  eventHandlerPrototype.toString = function (optionalCallback) {
    var getEncodedParameterValue = optionalCallback
      ? function (callbackValue) {
          return optionalCallback.call(
            this,
            callbackValue,
            encodeAndReplaceUrlCharacters,
          );
        }
      : encodeAndReplaceUrlCharacters;
    return this._pairs
      .map(function (encodedParams) {
        return (
          getEncodedParameterValue(encodedParams[0]) +
          "=" +
          getEncodedParameterValue(encodedParams[1])
        );
      }, "")
      .join("&");
  };
  var environmentVariable;
  var _requestHandler = (function () {
    function initializeParser() {
      checkParserInstance(this, initializeParser);
      this.handlers = [];
    }
    definePropertyCount(initializeParser, [
      {
        key: "use",
        value: function (onFulfilled, _errorHandler, actionHandlerOptions) {
          this.handlers.push({
            fulfilled: onFulfilled,
            rejected: _errorHandler,
            synchronous:
              !!actionHandlerOptions && actionHandlerOptions.synchronous,
            runWhen: actionHandlerOptions ? actionHandlerOptions.runWhen : null,
          });
          return this.handlers.length - 1;
        },
      },
      {
        key: "eject",
        value: function (eventHandlerKey) {
          this.handlers[eventHandlerKey] &&= null;
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
        value: function (inputHandlerCallback) {
          __typeCheckerObject.forEach(
            this.handlers,
            function (_userInputValue) {
              if (_userInputValue !== null) {
                inputHandlerCallback(_userInputValue);
              }
            },
          );
        },
      },
    ]);
    return initializeParser;
  })();
  var defaultAxiosConfigOptions = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false,
  };
  var environmentInfo = {
    isBrowser: true,
    classes: {
      URLSearchParams:
        typeof URLSearchParams != "undefined"
          ? URLSearchParams
          : processEventData,
      FormData: typeof FormData != "undefined" ? FormData : null,
      Blob: typeof Blob != "undefined" ? Blob : null,
    },
    isStandardBrowserEnv:
      (typeof navigator == "undefined" ||
        ((environmentVariable = navigator.product) !== "ReactNative" &&
          environmentVariable !== "NativeScript" &&
          environmentVariable !== "NS")) &&
      typeof window != "undefined" &&
      typeof document != "undefined",
    isStandardBrowserWebWorkerEnv:
      typeof WorkerGlobalScope != "undefined" &&
      self instanceof WorkerGlobalScope &&
      typeof self.importScripts == "function",
    protocols: ["http", "https", "file", "blob", "url", "data"],
  };
  function handleFormData(formData) {
    function currentKeyHandler(
      inputValues,
      currentKeyIndex,
      resultMap,
      nextInputIndex,
    ) {
      var nextInputValue = inputValues[nextInputIndex++];
      var isCurrentValueFinite = Number.isFinite(+nextInputValue);
      var isEndOfInputReached = nextInputIndex >= inputValues.length;
      if (!nextInputValue && __typeCheckerObject.isArray(resultMap)) {
        nextInputValue = resultMap.length;
      } else {
        nextInputValue = nextInputValue;
      }
      if (isEndOfInputReached) {
        if (__typeCheckerObject.hasOwnProp(resultMap, nextInputValue)) {
          resultMap[nextInputValue] = [
            resultMap[nextInputValue],
            currentKeyIndex,
          ];
        } else {
          resultMap[nextInputValue] = currentKeyIndex;
        }
        return !isCurrentValueFinite;
      } else {
        if (
          !resultMap[nextInputValue] ||
          !__typeCheckerObject.isObject(resultMap[nextInputValue])
        ) {
          resultMap[nextInputValue] = [];
        }
        if (
          currentKeyHandler(
            inputValues,
            currentKeyIndex,
            resultMap[nextInputValue],
            nextInputIndex,
          ) &&
          __typeCheckerObject.isArray(resultMap[nextInputValue])
        ) {
          resultMap[nextInputValue] = (function (inputObject) {
            var _currentKeyIndex;
            var currentObjectKey;
            var copiedProperties = {};
            var inputObjectKeys = Object.keys(inputObject);
            var inputObjectKeysCount = inputObjectKeys.length;
            for (
              _currentKeyIndex = 0;
              _currentKeyIndex < inputObjectKeysCount;
              _currentKeyIndex++
            ) {
              copiedProperties[
                (currentObjectKey = inputObjectKeys[_currentKeyIndex])
              ] = inputObject[currentObjectKey];
            }
            return copiedProperties;
          })(resultMap[nextInputValue]);
        }
        return !isCurrentValueFinite;
      }
    }
    if (
      __typeCheckerObject.isFormData(formData) &&
      __typeCheckerObject.isFunction(formData.entries)
    ) {
      var parsedFormData = {};
      __typeCheckerObject.forEachEntry(
        formData,
        function (__inputString, matchedResultsArray) {
          currentKeyHandler(
            (function (___inputString) {
              return __typeCheckerObject
                .matchAll(/\w+|\[(\w*)]/g, ___inputString)
                .map(function (__inputArray) {
                  if (__inputArray[0] === "[]") {
                    return "";
                  } else {
                    return __inputArray[1] || __inputArray[0];
                  }
                });
            })(__inputString),
            matchedResultsArray,
            parsedFormData,
            0,
          );
        },
      );
      return parsedFormData;
    }
    return null;
  }
  var axiosDefaultConfig = {
    transitional: defaultAxiosConfigOptions,
    adapter: ["xhr", "http"],
    transformRequest: [
      function (inputPayload, requestProcessor) {
        var isInputDataFileList;
        var contentType = requestProcessor.getContentType() || "";
        var isContentTypeJson = contentType.indexOf("application/json") > -1;
        var isInputPayloadValid = __typeCheckerObject.isObject(inputPayload);
        if (
          isInputPayloadValid &&
          __typeCheckerObject.isHTMLForm(inputPayload)
        ) {
          inputPayload = new FormData(inputPayload);
        }
        if (__typeCheckerObject.isFormData(inputPayload)) {
          if (isContentTypeJson && isContentTypeJson) {
            return JSON.stringify(handleFormData(inputPayload));
          } else {
            return inputPayload;
          }
        }
        if (
          __typeCheckerObject.isArrayBuffer(inputPayload) ||
          __typeCheckerObject.isBuffer(inputPayload) ||
          __typeCheckerObject.isStream(inputPayload) ||
          __typeCheckerObject.isFile(inputPayload) ||
          __typeCheckerObject.isBlob(inputPayload)
        ) {
          return inputPayload;
        }
        if (__typeCheckerObject.isArrayBufferView(inputPayload)) {
          return inputPayload.buffer;
        }
        if (__typeCheckerObject.isURLSearchParams(inputPayload)) {
          requestProcessor.setContentType(
            "application/x-www-form-urlencoded;charset=utf-8",
            false,
          );
          return inputPayload.toString();
        }
        if (isInputPayloadValid) {
          if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
            return (function (formEvent, formSubmissionOptions) {
              return processFormEntries(
                formEvent,
                new environmentInfo.classes.URLSearchParams(),
                Object.assign(
                  {
                    visitor: function (
                      inputBufferData,
                      inputDataBase64,
                      inputBufferNode,
                      defaultVisitorFunction,
                    ) {
                      if (
                        environmentInfo.isNode &&
                        __typeCheckerObject.isBuffer(inputBufferData)
                      ) {
                        this.append(
                          inputDataBase64,
                          inputBufferData.toString("base64"),
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
                  formSubmissionOptions,
                ),
              );
            })(inputPayload, this.formSerializer).toString();
          }
          if (
            (isInputDataFileList =
              __typeCheckerObject.isFileList(inputPayload)) ||
            contentType.indexOf("multipart/form-data") > -1
          ) {
            var formDataProcessor = this.env && this.env.FormData;
            return processFormEntries(
              isInputDataFileList
                ? {
                    "files[]": inputPayload,
                  }
                : inputPayload,
              formDataProcessor && new formDataProcessor(),
              this.formSerializer,
            );
          }
        }
        if (isInputPayloadValid || isContentTypeJson) {
          requestProcessor.setContentType("application/json", false);
          return (function (
            inputJsonString,
            jsonInputParser,
            jsonStringifyFunction,
          ) {
            if (__typeCheckerObject.isString(inputJsonString)) {
              try {
                (jsonInputParser || JSON.parse)(inputJsonString);
                return __typeCheckerObject.trim(inputJsonString);
              } catch (error) {
                if (error.name !== "SyntaxError") {
                  throw error;
                }
              }
            }
            return (jsonStringifyFunction || JSON.stringify)(inputJsonString);
          })(inputPayload);
        } else {
          return inputPayload;
        }
      },
    ],
    transformResponse: [
      function (responseJsonString) {
        var transitionalParserOptions =
          this.transitional || axiosDefaultConfig.transitional;
        var isJSONParsingForced =
          transitionalParserOptions &&
          transitionalParserOptions.forcedJSONParsing;
        var isResponseJsonType = this.responseType === "json";
        if (
          responseJsonString &&
          __typeCheckerObject.isString(responseJsonString) &&
          ((isJSONParsingForced && !this.responseType) || isResponseJsonType)
        ) {
          var shouldEnableJsonParsing =
            (!transitionalParserOptions ||
              !transitionalParserOptions.silentJSONParsing) &&
            isResponseJsonType;
          try {
            return JSON.parse(responseJsonString);
          } catch (jsonParsingError) {
            if (shouldEnableJsonParsing) {
              if (jsonParsingError.name === "SyntaxError") {
                throw HttpError.from(
                  jsonParsingError,
                  HttpError.ERR_BAD_RESPONSE,
                  this,
                  null,
                  this.response,
                );
              }
              throw jsonParsingError;
            }
          }
        }
        return responseJsonString;
      },
    ],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: {
      FormData: environmentInfo.classes.FormData,
      Blob: environmentInfo.classes.Blob,
    },
    validateStatus: function (isSuccessfulHttpStatus) {
      return isSuccessfulHttpStatus >= 200 && isSuccessfulHttpStatus < 300;
    },
    headers: {
      common: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": undefined,
      },
    },
  };
  __typeCheckerObject.forEach(
    ["delete", "get", "head", "post", "put", "patch"],
    function (_headerConfigKey) {
      axiosDefaultConfig.headers[_headerConfigKey] = {};
    },
  );
  var axiosRequestConfig = axiosDefaultConfig;
  var httpRequestHeaderFields = __typeCheckerObject.toObjectSet([
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
  function inputToSanitize(rawInputString) {
    return rawInputString && String(rawInputString).trim().toLowerCase();
  }
  function convertValueToString(valueToConvert) {
    if (valueToConvert === false || valueToConvert == null) {
      return valueToConvert;
    } else if (__typeCheckerObject.isArray(valueToConvert)) {
      return valueToConvert.map(convertValueToString);
    } else {
      return String(valueToConvert);
    }
  }
  function searchQuery(
    inputStringToSearch,
    inputString,
    searchTerm,
    criteriaForSearch,
    shouldUpdateInputString,
  ) {
    if (__typeCheckerObject.isFunction(criteriaForSearch)) {
      return criteriaForSearch.call(this, inputString, searchTerm);
    } else {
      if (shouldUpdateInputString) {
        inputString = searchTerm;
      }
      if (__typeCheckerObject.isString(inputString)) {
        if (__typeCheckerObject.isString(criteriaForSearch)) {
          return inputString.indexOf(criteriaForSearch) !== -1;
        } else if (__typeCheckerObject.isRegExp(criteriaForSearch)) {
          return criteriaForSearch.test(inputString);
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
  }
  var httpRequestHeaders = (function () {
    function _currentKey(currentParserOptionValue) {
      checkParserInstance(this, _currentKey);
      if (currentParserOptionValue) {
        this.set(currentParserOptionValue);
      }
    }
    definePropertyCount(
      _currentKey,
      [
        {
          key: "set",
          value: function (
            inputData,
            headerNameArgument,
            isHeaderOverrideEnabled,
          ) {
            var currentContext = this;
            function __headerName(headerValue, headerName, isHeaderMandatory) {
              var sanitizedHeaderName = inputToSanitize(headerName);
              if (!sanitizedHeaderName) {
                throw new Error("header name must be a non-empty string");
              }
              var headerNameKeyIndex = __typeCheckerObject.findKey(
                currentContext,
                sanitizedHeaderName,
              );
              if (
                !headerNameKeyIndex ||
                currentContext[headerNameKeyIndex] === undefined ||
                isHeaderMandatory === true ||
                (isHeaderMandatory === undefined &&
                  currentContext[headerNameKeyIndex] !== false)
              ) {
                currentContext[headerNameKeyIndex || headerName] =
                  convertValueToString(headerValue);
              }
            }
            var headerKeyName;
            var headerFieldName;
            var parsedHeaderValue;
            var headerLineColonIndex;
            var headersByName;
            function processHeaderItemList(headerItems, headerItemProcessor) {
              return __typeCheckerObject.forEach(
                headerItems,
                function (_event, _headerValue) {
                  return __headerName(
                    _event,
                    _headerValue,
                    headerItemProcessor,
                  );
                },
              );
            }
            if (
              __typeCheckerObject.isPlainObject(inputData) ||
              inputData instanceof this.constructor
            ) {
              processHeaderItemList(inputData, headerNameArgument);
            } else if (
              __typeCheckerObject.isString(inputData) &&
              (inputData = inputData.trim()) &&
              !/^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(inputData.trim())
            ) {
              processHeaderItemList(
                ((headersByName = {}),
                (headerKeyName = inputData) &&
                  headerKeyName.split("\n").forEach(function (httpHeaderLine) {
                    headerLineColonIndex = httpHeaderLine.indexOf(":");
                    headerFieldName = httpHeaderLine
                      .substring(0, headerLineColonIndex)
                      .trim()
                      .toLowerCase();
                    parsedHeaderValue = httpHeaderLine
                      .substring(headerLineColonIndex + 1)
                      .trim();
                    if (
                      !!headerFieldName &&
                      (!headersByName[headerFieldName] ||
                        !httpRequestHeaderFields[headerFieldName])
                    ) {
                      if (headerFieldName === "set-cookie") {
                        if (headersByName[headerFieldName]) {
                          headersByName[headerFieldName].push(
                            parsedHeaderValue,
                          );
                        } else {
                          headersByName[headerFieldName] = [parsedHeaderValue];
                        }
                      } else {
                        headersByName[headerFieldName] = headersByName[
                          headerFieldName
                        ]
                          ? headersByName[headerFieldName] +
                            ", " +
                            parsedHeaderValue
                          : parsedHeaderValue;
                      }
                    }
                  }),
                headersByName),
                headerNameArgument,
              );
            } else if (inputData != null) {
              __headerName(
                headerNameArgument,
                inputData,
                isHeaderOverrideEnabled,
              );
            }
            return this;
          },
        },
        {
          key: "get",
          value: function (_inputValue, dataParser) {
            if ((_inputValue = inputToSanitize(_inputValue))) {
              var foundKey = __typeCheckerObject.findKey(this, _inputValue);
              if (foundKey) {
                var _parsedInputValue = this[foundKey];
                if (!dataParser) {
                  return _parsedInputValue;
                }
                if (dataParser === true) {
                  return (function (inputKeyValuePairsString) {
                    var matchedKeyValuePair;
                    var keyValueMap = Object.create(null);
                    for (
                      var keyValuePairRegex =
                        /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
                      (matchedKeyValuePair = keyValuePairRegex.exec(
                        inputKeyValuePairsString,
                      ));

                    ) {
                      keyValueMap[matchedKeyValuePair[1]] =
                        matchedKeyValuePair[2];
                    }
                    return keyValueMap;
                  })(_parsedInputValue);
                }
                if (__typeCheckerObject.isFunction(dataParser)) {
                  return dataParser.call(this, _parsedInputValue, foundKey);
                }
                if (__typeCheckerObject.isRegExp(dataParser)) {
                  return dataParser.exec(_parsedInputValue);
                }
                throw new TypeError("parser must be boolean|regexp|function");
              }
            }
          },
        },
        {
          key: "has",
          value: function (sanitizedEvent, _searchTerm) {
            if ((sanitizedEvent = inputToSanitize(sanitizedEvent))) {
              var foundMatchingKey = __typeCheckerObject.findKey(
                this,
                sanitizedEvent,
              );
              return (
                !!foundMatchingKey &&
                this[foundMatchingKey] !== undefined &&
                (!_searchTerm ||
                  !!searchQuery(
                    0,
                    this[foundMatchingKey],
                    foundMatchingKey,
                    _searchTerm,
                  ))
              );
            }
            return false;
          },
        },
        {
          key: "delete",
          value: function (elementToBeDeleted, searchBindingKey) {
            var __currentContext = this;
            var isElementDeleted = false;
            function findAndRemoveKey(inputElement) {
              if ((inputElement = inputToSanitize(inputElement))) {
                var foundKeyToDelete = __typeCheckerObject.findKey(
                  __currentContext,
                  inputElement,
                );
                if (
                  !!foundKeyToDelete &&
                  (!searchBindingKey ||
                    !!searchQuery(
                      0,
                      __currentContext[foundKeyToDelete],
                      foundKeyToDelete,
                      searchBindingKey,
                    ))
                ) {
                  delete __currentContext[foundKeyToDelete];
                  isElementDeleted = true;
                }
              }
            }
            if (__typeCheckerObject.isArray(elementToBeDeleted)) {
              elementToBeDeleted.forEach(findAndRemoveKey);
            } else {
              findAndRemoveKey(elementToBeDeleted);
            }
            return isElementDeleted;
          },
        },
        {
          key: "clear",
          value: function (searchFilter) {
            var currentObjectKeys = Object.keys(this);
            var totalObjectKeys = currentObjectKeys.length;
            var hasChanges = false;
            for (; totalObjectKeys--; ) {
              var _currentObjectKey = currentObjectKeys[totalObjectKeys];
              if (
                !searchFilter ||
                !!searchQuery(
                  0,
                  this[_currentObjectKey],
                  _currentObjectKey,
                  searchFilter,
                  true,
                )
              ) {
                delete this[_currentObjectKey];
                hasChanges = true;
              }
            }
            return hasChanges;
          },
        },
        {
          key: "normalize",
          value: function (inputFormat) {
            var _currentContext = this;
            var keyMappingDictionary = {};
            __typeCheckerObject.forEach(
              this,
              function (___inputValue, keyForMapping) {
                var mappedKeyIndexInDictionary = __typeCheckerObject.findKey(
                  keyMappingDictionary,
                  keyForMapping,
                );
                if (mappedKeyIndexInDictionary) {
                  _currentContext[mappedKeyIndexInDictionary] =
                    convertValueToString(___inputValue);
                  delete _currentContext[keyForMapping];
                  return;
                }
                var formattedKeyForMapping = inputFormat
                  ? (function (formattedInputString) {
                      return formattedInputString
                        .trim()
                        .toLowerCase()
                        .replace(
                          /([a-z\d])(\w*)/g,
                          function (_eventParameter, inputText, suffixText) {
                            return inputText.toUpperCase() + suffixText;
                          },
                        );
                    })(keyForMapping)
                  : String(keyForMapping).trim();
                if (formattedKeyForMapping !== keyForMapping) {
                  delete _currentContext[keyForMapping];
                }
                _currentContext[formattedKeyForMapping] =
                  convertValueToString(___inputValue);
                keyMappingDictionary[formattedKeyForMapping] = true;
              },
            );
            return this;
          },
        },
        {
          key: "concat",
          value: function () {
            var constructorConcat;
            var argumentsLength = arguments.length;
            var argsArray = new Array(argumentsLength);
            for (
              var _argumentIndex = 0;
              _argumentIndex < argumentsLength;
              _argumentIndex++
            ) {
              argsArray[_argumentIndex] = arguments[_argumentIndex];
            }
            return (constructorConcat = this.constructor).concat.apply(
              constructorConcat,
              [this].concat(argsArray),
            );
          },
        },
        {
          key: "toJSON",
          value: function (_______inputValue) {
            var formattedResultMap = Object.create(null);
            __typeCheckerObject.forEach(
              this,
              function (receivedInputValue, formattedResultKey) {
                if (
                  receivedInputValue != null &&
                  receivedInputValue !== false
                ) {
                  formattedResultMap[formattedResultKey] =
                    _______inputValue &&
                    __typeCheckerObject.isArray(receivedInputValue)
                      ? receivedInputValue.join(", ")
                      : receivedInputValue;
                }
              },
            );
            return formattedResultMap;
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
              .map(function (inputForIterableElements) {
                var iterableElements = retrieveIterableElements(
                  inputForIterableElements,
                  2,
                );
                return iterableElements[0] + ": " + iterableElements[1];
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
          value: function (___inputObject) {
            if (___inputObject instanceof this) {
              return ___inputObject;
            } else {
              return new this(___inputObject);
            }
          },
        },
        {
          key: "concat",
          value: function (eventData) {
            var eventInstance = new this(eventData);
            var numArguments = arguments.length;
            var eventParametersArray = new Array(
              numArguments > 1 ? numArguments - 1 : 0,
            );
            for (
              var _currentArgumentIndex = 1;
              _currentArgumentIndex < numArguments;
              _currentArgumentIndex++
            ) {
              eventParametersArray[_currentArgumentIndex - 1] =
                arguments[_currentArgumentIndex];
            }
            eventParametersArray.forEach(function (__eventParameter) {
              return eventInstance.set(__eventParameter);
            });
            return eventInstance;
          },
        },
        {
          key: "accessor",
          value: function (__inputData) {
            var accessorRegistry = (this[internalSymbol] = this[
              internalSymbol
            ] =
              {
                accessors: {},
              }).accessors;
            var prototypeInstance = this.prototype;
            function generateResourceKey(inputPropertyKey) {
              var sanitizedPropertyKey = inputToSanitize(inputPropertyKey);
              if (!accessorRegistry[sanitizedPropertyKey]) {
                (function (___targetObject, __propertyKey) {
                  var camelCasedPropertyName = __typeCheckerObject.toCamelCase(
                    " " + __propertyKey,
                  );
                  ["get", "set", "has"].forEach(function (_propertyKey) {
                    Object.defineProperty(
                      ___targetObject,
                      _propertyKey + camelCasedPropertyName,
                      {
                        value: function (
                          eventParameter,
                          _eventData,
                          callbackFunction,
                        ) {
                          return this[_propertyKey].call(
                            this,
                            _propertyKey,
                            eventParameter,
                            _eventData,
                            callbackFunction,
                          );
                        },
                        configurable: true,
                      },
                    );
                  });
                })(prototypeInstance, inputPropertyKey);
                accessorRegistry[sanitizedPropertyKey] = true;
              }
            }
            if (__typeCheckerObject.isArray(__inputData)) {
              __inputData.forEach(generateResourceKey);
            } else {
              generateResourceKey(__inputData);
            }
            return this;
          },
        },
      ],
    );
    return _currentKey;
  })();
  httpRequestHeaders.accessor([
    "Content-Type",
    "Content-Length",
    "Accept",
    "Accept-Encoding",
    "User-Agent",
    "Authorization",
  ]);
  __typeCheckerObject.reduceDescriptors(
    httpRequestHeaders.prototype,
    function (formInputElement, _propertyName) {
      var __________inputValue = formInputElement.value;
      var capitalizedProperty =
        _propertyName[0].toUpperCase() + _propertyName.slice(1);
      return {
        get: function () {
          return __________inputValue;
        },
        set: function (___event) {
          this[capitalizedProperty] = ___event;
        },
      };
    },
  );
  __typeCheckerObject.freezeMethods(httpRequestHeaders);
  var requestHeadersManager = httpRequestHeaders;
  function executeEventCallbacks(callbackArray, requestOptions) {
    var contextObject = this || axiosRequestConfig;
    var resolvedRequestOptions = requestOptions || contextObject;
    var normalizedRequestHeaders = requestHeadersManager.from(
      resolvedRequestOptions.headers,
    );
    var __requestPayload = resolvedRequestOptions.data;
    __typeCheckerObject.forEach(callbackArray, function (eventHandlerFunction) {
      __requestPayload = eventHandlerFunction.call(
        contextObject,
        __requestPayload,
        normalizedRequestHeaders.normalize(),
        requestOptions ? requestOptions.status : undefined,
      );
    });
    normalizedRequestHeaders.normalize();
    return __requestPayload;
  }
  function eventIsCanceled(isEventCanceled) {
    return !!isEventCanceled && !!isEventCanceled.__CANCEL__;
  }
  function canceledErrorMessage(
    _errorMessage,
    timeoutDuration,
    onCancelCallback,
  ) {
    HttpError.call(
      this,
      _errorMessage == null ? "canceled" : _errorMessage,
      HttpError.ERR_CANCELED,
      timeoutDuration,
      onCancelCallback,
    );
    this.name = "CanceledError";
  }
  __typeCheckerObject.inherits(canceledErrorMessage, HttpError, {
    __CANCEL__: true,
  });
  var httpCookieManager = environmentInfo.isStandardBrowserEnv
    ? {
        write: function (
          cookieNameValue,
          cookieValueToSet,
          cookieExpiryTime,
          cookiePathValue,
          cookieDomain,
          isSecureCookie,
        ) {
          var cookieSettings = [];
          cookieSettings.push(
            cookieNameValue + "=" + encodeURIComponent(cookieValueToSet),
          );
          if (__typeCheckerObject.isNumber(cookieExpiryTime)) {
            cookieSettings.push(
              "expires=" + new Date(cookieExpiryTime).toGMTString(),
            );
          }
          if (__typeCheckerObject.isString(cookiePathValue)) {
            cookieSettings.push("path=" + cookiePathValue);
          }
          if (__typeCheckerObject.isString(cookieDomain)) {
            cookieSettings.push("domain=" + cookieDomain);
          }
          if (isSecureCookie === true) {
            cookieSettings.push("secure");
          }
          document.cookie = cookieSettings.join("; ");
        },
        read: function (cookieName) {
          var matchedCookieValue = document.cookie.match(
            new RegExp("(^|;\\s*)(" + cookieName + ")=([^;]*)"),
          );
          if (matchedCookieValue) {
            return decodeURIComponent(matchedCookieValue[3]);
          } else {
            return null;
          }
        },
        remove: function (_____eventData) {
          this.write(_____eventData, "", Date.now() - 86400000);
        },
      }
    : {
        write: function () {},
        read: function () {
          return null;
        },
        remove: function () {},
      };
  function combineBaseUrlWithPath(baseUrl, relativeUrlPath) {
    if (baseUrl && !/^([a-z][a-z\d+\-.]*:)?\/\//i.test(relativeUrlPath)) {
      return (function (basePath, appendPathSegment) {
        if (appendPathSegment) {
          return (
            basePath.replace(/\/+$/, "") +
            "/" +
            appendPathSegment.replace(/^\/+/, "")
          );
        } else {
          return basePath;
        }
      })(baseUrl, relativeUrlPath);
    } else {
      return relativeUrlPath;
    }
  }
  var isSameOriginCheck = environmentInfo.isStandardBrowserEnv
    ? (function () {
        var currentPageUrl;
        var isLegacyInternetExplorer = /(msie|trident)/i.test(
          navigator.userAgent,
        );
        var temporaryAnchor = document.createElement("a");
        function _inputUrl(inputUrlString) {
          var __inputUrl = inputUrlString;
          if (isLegacyInternetExplorer) {
            temporaryAnchor.setAttribute("href", __inputUrl);
            __inputUrl = temporaryAnchor.href;
          }
          temporaryAnchor.setAttribute("href", __inputUrl);
          return {
            href: temporaryAnchor.href,
            protocol: temporaryAnchor.protocol
              ? temporaryAnchor.protocol.replace(/:$/, "")
              : "",
            host: temporaryAnchor.host,
            search: temporaryAnchor.search
              ? temporaryAnchor.search.replace(/^\?/, "")
              : "",
            hash: temporaryAnchor.hash
              ? temporaryAnchor.hash.replace(/^#/, "")
              : "",
            hostname: temporaryAnchor.hostname,
            port: temporaryAnchor.port,
            pathname:
              temporaryAnchor.pathname.charAt(0) === "/"
                ? temporaryAnchor.pathname
                : "/" + temporaryAnchor.pathname,
          };
        }
        currentPageUrl = _inputUrl(window.location.href);
        return function (validatedInputUrl) {
          var normalizedInputUrl = __typeCheckerObject.isString(
            validatedInputUrl,
          )
            ? normalizedInputUrl(validatedInputUrl)
            : validatedInputUrl;
          return (
            normalizedInputUrl.protocol === currentPageUrl.protocol &&
            normalizedInputUrl.host === currentPageUrl.host
          );
        };
      })()
    : function () {
        return true;
      };
  function handleCallbackEvent(progressCallback, isDownloadEvent) {
    var bytesLoadedPreviously = 0;
    var calculateDownloadRate = (function (maxSamplesSize, updateInterval) {
      maxSamplesSize = maxSamplesSize || 10;
      var lastRefreshTimestamp;
      var sampleBuffer = new Array(maxSamplesSize);
      var sampleTimestamps = new Array(maxSamplesSize);
      var currentSampleIndex = 0;
      var _currentSampleIndex = 0;
      if (updateInterval !== undefined) {
        updateInterval = updateInterval;
      } else {
        updateInterval = 1000;
      }
      return function (sampleInput) {
        var currentMillis = Date.now();
        var previousTimestamp = sampleTimestamps[_currentSampleIndex];
        lastRefreshTimestamp ||= currentMillis;
        sampleBuffer[currentSampleIndex] = sampleInput;
        sampleTimestamps[currentSampleIndex] = currentMillis;
        var __currentSampleIndex = _currentSampleIndex;
        var cumulativeSampleSum = 0;
        for (; __currentSampleIndex !== currentSampleIndex; ) {
          cumulativeSampleSum += sampleBuffer[__currentSampleIndex++];
          __currentSampleIndex %= maxSamplesSize;
        }
        if (
          (currentSampleIndex = (currentSampleIndex + 1) % maxSamplesSize) ===
          _currentSampleIndex
        ) {
          _currentSampleIndex = (_currentSampleIndex + 1) % maxSamplesSize;
        }
        if (!(currentMillis - lastRefreshTimestamp < updateInterval)) {
          var timeSinceLastUpdate =
            previousTimestamp && currentMillis - previousTimestamp;
          if (timeSinceLastUpdate) {
            return Math.round(
              (cumulativeSampleSum * 1000) / timeSinceLastUpdate,
            );
          } else {
            return undefined;
          }
        }
      };
    })(50, 250);
    return function (progressEventData) {
      var bytesDownloaded = progressEventData.loaded;
      var totalBytesExpected = progressEventData.lengthComputable
        ? progressEventData.total
        : undefined;
      var bytesSinceLastCheck = bytesDownloaded - bytesLoadedPreviously;
      var currentDownloadRate = calculateDownloadRate(bytesSinceLastCheck);
      bytesLoadedPreviously = bytesDownloaded;
      var downloadProgress = {
        loaded: bytesDownloaded,
        total: totalBytesExpected,
        progress: totalBytesExpected
          ? bytesDownloaded / totalBytesExpected
          : undefined,
        bytes: bytesSinceLastCheck,
        rate: currentDownloadRate || undefined,
        estimated:
          currentDownloadRate &&
          totalBytesExpected &&
          bytesDownloaded <= totalBytesExpected
            ? (totalBytesExpected - bytesDownloaded) / currentDownloadRate
            : undefined,
        event: progressEventData,
      };
      downloadProgress[isDownloadEvent ? "download" : "upload"] = true;
      progressCallback(downloadProgress);
    };
  }
  var _httpRequestHandler = {
    http: null,
    xhr:
      typeof XMLHttpRequest != "undefined" &&
      function (httpRequestConfig) {
        return new Promise(function (responseCallback, onErrorCallback) {
          var abortRequestHandler;
          var contentTypeHeader;
          var httpRequestBody = httpRequestConfig.data;
          var _normalizedRequestHeaders = requestHeadersManager
            .from(httpRequestConfig.headers)
            .normalize();
          var responseFormat = httpRequestConfig.responseType;
          function removeAbortHandlers() {
            if (httpRequestConfig.cancelToken) {
              httpRequestConfig.cancelToken.unsubscribe(abortRequestHandler);
            }
            if (httpRequestConfig.signal) {
              httpRequestConfig.signal.removeEventListener(
                "abort",
                abortRequestHandler,
              );
            }
          }
          if (__typeCheckerObject.isFormData(httpRequestBody)) {
            if (
              environmentInfo.isStandardBrowserEnv ||
              environmentInfo.isStandardBrowserWebWorkerEnv
            ) {
              _normalizedRequestHeaders.setContentType(false);
            } else if (
              _normalizedRequestHeaders.getContentType(
                /^\s*multipart\/form-data/,
              )
            ) {
              if (
                __typeCheckerObject.isString(
                  (contentTypeHeader =
                    _normalizedRequestHeaders.getContentType()),
                )
              ) {
                _normalizedRequestHeaders.setContentType(
                  contentTypeHeader.replace(
                    /^\s*(multipart\/form-data);+/,
                    "$1",
                  ),
                );
              }
            } else {
              _normalizedRequestHeaders.setContentType("multipart/form-data");
            }
          }
          var _httpRequest = new XMLHttpRequest();
          if (httpRequestConfig.auth) {
            var authUsernameValue = httpRequestConfig.auth.username || "";
            var authPasswordEncoded = httpRequestConfig.auth.password
              ? unescape(encodeURIComponent(httpRequestConfig.auth.password))
              : "";
            _normalizedRequestHeaders.set(
              "Authorization",
              "Basic " + btoa(authUsernameValue + ":" + authPasswordEncoded),
            );
          }
          var fullRequestUrl = combineBaseUrlWithPath(
            httpRequestConfig.baseURL,
            httpRequestConfig.url,
          );
          function handleHttpRequest() {
            if (_httpRequest) {
              var allResponseHeaders = requestHeadersManager.from(
                "getAllResponseHeaders" in _httpRequest &&
                  _httpRequest.getAllResponseHeaders(),
              );
              (function (onSuccessResponse, errorHandler, httpResponse) {
                var isStatusValid = httpResponse.config.validateStatus;
                if (
                  httpResponse.status &&
                  isStatusValid &&
                  !isStatusValid(httpResponse.status)
                ) {
                  errorHandler(
                    new HttpError(
                      "Request failed with status code " + httpResponse.status,
                      [HttpError.ERR_BAD_REQUEST, HttpError.ERR_BAD_RESPONSE][
                        Math.floor(httpResponse.status / 100) - 4
                      ],
                      httpResponse.config,
                      httpResponse.request,
                      httpResponse,
                    ),
                  );
                } else {
                  onSuccessResponse(httpResponse);
                }
              })(
                function (__event) {
                  responseCallback(__event);
                  removeAbortHandlers();
                },
                function (errorCallbackEvent) {
                  onErrorCallback(errorCallbackEvent);
                  removeAbortHandlers();
                },
                {
                  data:
                    responseFormat &&
                    responseFormat !== "text" &&
                    responseFormat !== "json"
                      ? _httpRequest.response
                      : _httpRequest.responseText,
                  status: _httpRequest.status,
                  statusText: _httpRequest.statusText,
                  headers: allResponseHeaders,
                  config: httpRequestConfig,
                  request: _httpRequest,
                },
              );
              _httpRequest = null;
            }
          }
          _httpRequest.open(
            httpRequestConfig.method.toUpperCase(),
            buildUrlWithQueryParams(
              fullRequestUrl,
              httpRequestConfig.params,
              httpRequestConfig.paramsSerializer,
            ),
            true,
          );
          _httpRequest.timeout = httpRequestConfig.timeout;
          if ("onloadend" in _httpRequest) {
            _httpRequest.onloadend = handleHttpRequest;
          } else {
            _httpRequest.onreadystatechange = function () {
              if (
                _httpRequest &&
                _httpRequest.readyState === 4 &&
                (_httpRequest.status !== 0 ||
                  (_httpRequest.responseURL &&
                    _httpRequest.responseURL.indexOf("file:") === 0))
              ) {
                setTimeout(handleHttpRequest);
              }
            };
          }
          _httpRequest.onabort = function () {
            if (_httpRequest) {
              onErrorCallback(
                new HttpError(
                  "Request aborted",
                  HttpError.ECONNABORTED,
                  httpRequestConfig,
                  _httpRequest,
                ),
              );
              _httpRequest = null;
            }
          };
          _httpRequest.onerror = function () {
            onErrorCallback(
              new HttpError(
                "Network Error",
                HttpError.ERR_NETWORK,
                httpRequestConfig,
                _httpRequest,
              ),
            );
            _httpRequest = null;
          };
          _httpRequest.ontimeout = function () {
            var timeoutErrorNotification = httpRequestConfig.timeout
              ? "timeout of " + httpRequestConfig.timeout + "ms exceeded"
              : "timeout exceeded";
            var transitionalRequestConfig =
              httpRequestConfig.transitional || defaultAxiosConfigOptions;
            if (httpRequestConfig.timeoutErrorMessage) {
              timeoutErrorNotification = httpRequestConfig.timeoutErrorMessage;
            }
            onErrorCallback(
              new HttpError(
                timeoutErrorNotification,
                transitionalRequestConfig.clarifyTimeoutError
                  ? HttpError.ETIMEDOUT
                  : HttpError.ECONNABORTED,
                httpRequestConfig,
                _httpRequest,
              ),
            );
            _httpRequest = null;
          };
          if (environmentInfo.isStandardBrowserEnv) {
            var xsrfTokenValue =
              isSameOriginCheck(fullRequestUrl) &&
              httpRequestConfig.xsrfCookieName &&
              httpCookieManager.read(httpRequestConfig.xsrfCookieName);
            if (xsrfTokenValue) {
              _normalizedRequestHeaders.set(
                httpRequestConfig.xsrfHeaderName,
                xsrfTokenValue,
              );
            }
          }
          if (httpRequestBody === undefined) {
            _normalizedRequestHeaders.setContentType(null);
          }
          if ("setRequestHeader" in _httpRequest) {
            __typeCheckerObject.forEach(
              _normalizedRequestHeaders.toJSON(),
              function (___headerValue, _headerName) {
                _httpRequest.setRequestHeader(_headerName, ___headerValue);
              },
            );
          }
          if (
            !__typeCheckerObject.isUndefined(httpRequestConfig.withCredentials)
          ) {
            _httpRequest.withCredentials = !!httpRequestConfig.withCredentials;
          }
          if (responseFormat && responseFormat !== "json") {
            _httpRequest.responseType = httpRequestConfig.responseType;
          }
          if (typeof httpRequestConfig.onDownloadProgress == "function") {
            _httpRequest.addEventListener(
              "progress",
              handleCallbackEvent(httpRequestConfig.onDownloadProgress, true),
            );
          }
          if (
            typeof httpRequestConfig.onUploadProgress == "function" &&
            _httpRequest.upload
          ) {
            _httpRequest.upload.addEventListener(
              "progress",
              handleCallbackEvent(httpRequestConfig.onUploadProgress),
            );
          }
          if (httpRequestConfig.cancelToken || httpRequestConfig.signal) {
            abortRequestHandler = function (isErrorConditionMet) {
              if (_httpRequest) {
                onErrorCallback(
                  !isErrorConditionMet || isErrorConditionMet.type
                    ? new canceledErrorMessage(
                        null,
                        httpRequestConfig,
                        _httpRequest,
                      )
                    : isErrorConditionMet,
                );
                _httpRequest.abort();
                _httpRequest = null;
              }
            };
            if (httpRequestConfig.cancelToken) {
              httpRequestConfig.cancelToken.subscribe(abortRequestHandler);
            }
            if (httpRequestConfig.signal) {
              if (httpRequestConfig.signal.aborted) {
                abortRequestHandler();
              } else {
                httpRequestConfig.signal.addEventListener(
                  "abort",
                  abortRequestHandler,
                );
              }
            }
          }
          var matchedRequestProtocol;
          var requestProtocolFromUrl =
            ((matchedRequestProtocol = /^([-+\w]{1,25})(:?\/\/|:)/.exec(
              fullRequestUrl,
            )) &&
              matchedRequestProtocol[1]) ||
            "";
          if (
            requestProtocolFromUrl &&
            environmentInfo.protocols.indexOf(requestProtocolFromUrl) === -1
          ) {
            onErrorCallback(
              new HttpError(
                "Unsupported protocol " + requestProtocolFromUrl + ":",
                HttpError.ERR_BAD_REQUEST,
                httpRequestConfig,
              ),
            );
          } else {
            _httpRequest.send(httpRequestBody || null);
          }
        });
      },
  };
  __typeCheckerObject.forEach(
    _httpRequestHandler,
    function (objectToConfigure, adapterName) {
      if (objectToConfigure) {
        try {
          Object.defineProperty(objectToConfigure, "name", {
            value: adapterName,
          });
        } catch (_caughtError) {}
        Object.defineProperty(objectToConfigure, "adapterName", {
          value: adapterName,
        });
      }
    },
  );
  function getFormattedPrefixString(formattedItemPrefix) {
    return `- ${formattedItemPrefix}`;
  }
  function isFunctionNullOrFalse(_inputValueToCheck) {
    return (
      __typeCheckerObject.isFunction(_inputValueToCheck) ||
      _inputValueToCheck === null ||
      _inputValueToCheck === false
    );
  }
  function selectHttpRequestAdapter(httpRequestAdapters) {
    var selectedHttpRequestAdapter;
    var __httpRequestAdapter;
    var httpRequestAdapterCount = (httpRequestAdapters =
      __typeCheckerObject.isArray(httpRequestAdapters)
        ? httpRequestAdapters
        : [httpRequestAdapters]).length;
    var httpRequestAdaptersMap = {};
    for (
      var currentAdapterIndex = 0;
      currentAdapterIndex < httpRequestAdapterCount;
      currentAdapterIndex++
    ) {
      var currentAdapterName = undefined;
      __httpRequestAdapter = selectedHttpRequestAdapter =
        httpRequestAdapters[currentAdapterIndex];
      if (
        !isFunctionNullOrFalse(selectedHttpRequestAdapter) &&
        (__httpRequestAdapter =
          _httpRequestHandler[
            (currentAdapterName = String(
              selectedHttpRequestAdapter,
            )).toLowerCase()
          ]) === undefined
      ) {
        throw new HttpError(`Unknown adapter '${currentAdapterName}'`);
      }
      if (__httpRequestAdapter) {
        break;
      }
      httpRequestAdaptersMap[currentAdapterName || "#" + currentAdapterIndex] =
        __httpRequestAdapter;
    }
    if (!__httpRequestAdapter) {
      var adapterErrorMessages = Object.entries(httpRequestAdaptersMap).map(
        function (inputIterableElements) {
          var __iterableElements = retrieveIterableElements(
            inputIterableElements,
            2,
          );
          var firstElementFromIterable = __iterableElements[0];
          var secondElement = __iterableElements[1];
          return `adapter ${firstElementFromIterable} ${secondElement === false ? "is not supported by the environment" : "is not available in the build"}`;
        },
      );
      throw new HttpError(
        "There is no suitable adapter to dispatch the request " +
          (httpRequestAdapterCount
            ? adapterErrorMessages.length > 1
              ? "since :\n" +
                adapterErrorMessages.map(getFormattedPrefixString).join("\n")
              : " " + getFormattedPrefixString(adapterErrorMessages[0])
            : "as no adapter specified"),
        "ERR_NOT_SUPPORT",
      );
    }
    return __httpRequestAdapter;
  }
  function requestHandler(_requestConfiguration) {
    if (_requestConfiguration.cancelToken) {
      _requestConfiguration.cancelToken.throwIfRequested();
    }
    if (_requestConfiguration.signal && _requestConfiguration.signal.aborted) {
      throw new canceledErrorMessage(null, _requestConfiguration);
    }
  }
  function processRequestConfig(requestConfig) {
    requestHandler(requestConfig);
    requestConfig.headers = requestHeadersManager.from(requestConfig.headers);
    requestConfig.data = executeEventCallbacks.call(
      requestConfig,
      requestConfig.transformRequest,
    );
    if (["post", "put", "patch"].indexOf(requestConfig.method) !== -1) {
      requestConfig.headers.setContentType(
        "application/x-www-form-urlencoded",
        false,
      );
    }
    return selectHttpRequestAdapter(
      requestConfig.adapter || axiosRequestConfig.adapter,
    )(requestConfig).then(
      function (_requestConfig) {
        requestHandler(requestConfig);
        _requestConfig.data = executeEventCallbacks.call(
          requestConfig,
          requestConfig.transformResponse,
          _requestConfig,
        );
        _requestConfig.headers = requestHeadersManager.from(
          _requestConfig.headers,
        );
        return _requestConfig;
      },
      function (__httpRequest) {
        if (!eventIsCanceled(__httpRequest)) {
          requestHandler(requestConfig);
          if (__httpRequest && __httpRequest.response) {
            __httpRequest.response.data = executeEventCallbacks.call(
              requestConfig,
              requestConfig.transformResponse,
              __httpRequest.response,
            );
            __httpRequest.response.headers = requestHeadersManager.from(
              __httpRequest.response.headers,
            );
          }
        }
        return Promise.reject(__httpRequest);
      },
    );
  }
  function convertInputToJson(inputRequestValue) {
    if (inputRequestValue instanceof requestHeadersManager) {
      return inputRequestValue.toJSON();
    } else {
      return inputRequestValue;
    }
  }
  function createMergedConfiguration(userConfig, defaultConfigurationOptions) {
    defaultConfigurationOptions = defaultConfigurationOptions || {};
    var mergedConfigResults = {};
    function mergeSourceAndTargetObjects(
      _sourceObject,
      ____targetObject,
      isCaseInsensitive,
    ) {
      if (
        __typeCheckerObject.isPlainObject(_sourceObject) &&
        __typeCheckerObject.isPlainObject(____targetObject)
      ) {
        return __typeCheckerObject.merge.call(
          {
            caseless: isCaseInsensitive,
          },
          _sourceObject,
          ____targetObject,
        );
      } else if (__typeCheckerObject.isPlainObject(____targetObject)) {
        return __typeCheckerObject.merge({}, ____targetObject);
      } else if (__typeCheckerObject.isArray(____targetObject)) {
        return ____targetObject.slice();
      } else {
        return ____targetObject;
      }
    }
    function handleProcessArguments(
      firstArgument,
      secondArgument,
      additionalOptions,
    ) {
      if (__typeCheckerObject.isUndefined(secondArgument)) {
        if (__typeCheckerObject.isUndefined(firstArgument)) {
          return undefined;
        } else {
          return mergeSourceAndTargetObjects(
            undefined,
            firstArgument,
            additionalOptions,
          );
        }
      } else {
        return mergeSourceAndTargetObjects(
          firstArgument,
          secondArgument,
          additionalOptions,
        );
      }
    }
    function handleInputValue(secondaryInputValue, userInputValue) {
      if (!__typeCheckerObject.isUndefined(userInputValue)) {
        return mergeSourceAndTargetObjects(undefined, userInputValue);
      }
    }
    function ___inputValueToProcess(__inputValueToProcess, inputFallbackValue) {
      if (__typeCheckerObject.isUndefined(inputFallbackValue)) {
        if (__typeCheckerObject.isUndefined(__inputValueToProcess)) {
          return undefined;
        } else {
          return mergeSourceAndTargetObjects(undefined, __inputValueToProcess);
        }
      } else {
        return mergeSourceAndTargetObjects(undefined, inputFallbackValue);
      }
    }
    function mergeValuesBasedOnOptionKey(
      inputValuesToMerge,
      mergeOptions,
      optionKeyToMerge,
    ) {
      if (optionKeyToMerge in defaultConfigurationOptions) {
        return mergeSourceAndTargetObjects(inputValuesToMerge, mergeOptions);
      } else if (optionKeyToMerge in userConfig) {
        return mergeSourceAndTargetObjects(undefined, inputValuesToMerge);
      } else {
        return undefined;
      }
    }
    var requestConfigOptions = {
      url: handleInputValue,
      method: handleInputValue,
      data: handleInputValue,
      baseURL: ___inputValueToProcess,
      transformRequest: ___inputValueToProcess,
      transformResponse: ___inputValueToProcess,
      paramsSerializer: ___inputValueToProcess,
      timeout: ___inputValueToProcess,
      timeoutMessage: ___inputValueToProcess,
      withCredentials: ___inputValueToProcess,
      adapter: ___inputValueToProcess,
      responseType: ___inputValueToProcess,
      xsrfCookieName: ___inputValueToProcess,
      xsrfHeaderName: ___inputValueToProcess,
      onUploadProgress: ___inputValueToProcess,
      onDownloadProgress: ___inputValueToProcess,
      decompress: ___inputValueToProcess,
      maxContentLength: ___inputValueToProcess,
      maxBodyLength: ___inputValueToProcess,
      beforeRedirect: ___inputValueToProcess,
      transport: ___inputValueToProcess,
      httpAgent: ___inputValueToProcess,
      httpsAgent: ___inputValueToProcess,
      cancelToken: ___inputValueToProcess,
      socketPath: ___inputValueToProcess,
      responseEncoding: ___inputValueToProcess,
      validateStatus: mergeValuesBasedOnOptionKey,
      headers: function (___eventData, targetJsonElement) {
        return handleProcessArguments(
          convertInputToJson(___eventData),
          convertInputToJson(targetJsonElement),
          true,
        );
      },
    };
    __typeCheckerObject.forEach(
      Object.keys(Object.assign({}, userConfig, defaultConfigurationOptions)),
      function (currentResponseIndex) {
        var responseHandler =
          requestConfigOptions[currentResponseIndex] || handleProcessArguments;
        var _responseData = responseHandler(
          userConfig[currentResponseIndex],
          defaultConfigurationOptions[currentResponseIndex],
          currentResponseIndex,
        );
        if (
          !__typeCheckerObject.isUndefined(_responseData) ||
          responseHandler === mergeValuesBasedOnOptionKey
        ) {
          mergedConfigResults[currentResponseIndex] = _responseData;
        }
      },
    );
    return mergedConfigResults;
  }
  var axiosLibraryVersion = "1.6.0";
  var _typeCheckerObject = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(
    function (expectedInputType, typeComparisonCategory) {
      _typeCheckerObject[expectedInputType] = function (
        inputValueForTypeCheck,
      ) {
        return (
          determineValueType(inputValueForTypeCheck) === expectedInputType ||
          "a" + (typeComparisonCategory < 1 ? "n " : " ") + expectedInputType
        );
      };
    },
  );
  var optionsValidator = {};
  _typeCheckerObject.transitional = function (
    isFeatureDeprecated,
    currentVersion,
    transitionalOptionMessage,
  ) {
    function createTransitionalOptionMessage(
      transitionalOptionLabel,
      formattedTransitionalOptionMessage,
    ) {
      return (
        "[Axios v1.6.0] Transitional option '" +
        transitionalOptionLabel +
        "'" +
        formattedTransitionalOptionMessage +
        (formattedTransitionalOptionMessage
          ? ". " + formattedTransitionalOptionMessage
          : "")
      );
    }
    return function (
      isFeatureDeprecatedCallback,
      transitionalOptionKey,
      callbackHandler,
    ) {
      if (isFeatureDeprecated === false) {
        throw new HttpError(
          createTransitionalOptionMessage(
            transitionalOptionKey,
            " has been removed" +
              (currentVersion ? " in " + currentVersion : ""),
          ),
          HttpError.ERR_DEPRECATED,
        );
      }
      if (currentVersion && !optionsValidator[transitionalOptionKey]) {
        optionsValidator[transitionalOptionKey] = true;
        console.warn(
          createTransitionalOptionMessage(
            transitionalOptionKey,
            " has been deprecated since v" +
              currentVersion +
              " and will be removed in the near future",
          ),
        );
      }
      return (
        !isFeatureDeprecated ||
        isFeatureDeprecated(
          isFeatureDeprecatedCallback,
          transitionalOptionKey,
          callbackHandler,
        )
      );
    };
  };
  var ___optionsValidator = {
    assertOptions: function (
      options,
      optionValidationRules,
      allowDeprecatedOptions,
    ) {
      if (determineValueType(options) !== "object") {
        throw new HttpError(
          "options must be an object",
          HttpError.ERR_BAD_OPTION_VALUE,
        );
      }
      var validatedOptionKeys = Object.keys(options);
      for (
        var validatedOptionKeysIndex = validatedOptionKeys.length;
        validatedOptionKeysIndex-- > 0;

      ) {
        var validatedOptionKey = validatedOptionKeys[validatedOptionKeysIndex];
        var optionValidationFunction =
          optionValidationRules[validatedOptionKey];
        if (optionValidationFunction) {
          var validatedOptionValue = options[validatedOptionKey];
          var isValidOptionValue =
            validatedOptionValue === undefined ||
            optionValidationFunction(
              validatedOptionValue,
              validatedOptionKey,
              options,
            );
          if (isValidOptionValue !== true) {
            throw new HttpError(
              "option " + validatedOptionKey + " must be " + isValidOptionValue,
              HttpError.ERR_BAD_OPTION_VALUE,
            );
          }
        } else if (allowDeprecatedOptions !== true) {
          throw new HttpError(
            "Unknown option " + validatedOptionKey,
            HttpError.ERR_BAD_OPTION,
          );
        }
      }
    },
    validators: _typeCheckerObject,
  };
  var _optionsValidator = ___optionsValidator.validators;
  var axiosRequestHandler = (function () {
    function parserInputValue(inputValueTotalCount) {
      checkParserInstance(this, parserInputValue);
      this.defaults = inputValueTotalCount;
      this.interceptors = {
        request: new _requestHandler(),
        response: new _requestHandler(),
      };
    }
    definePropertyCount(parserInputValue, [
      {
        key: "request",
        value: function (requestInput, requestConfiguration) {
          if (typeof requestInput == "string") {
            (requestConfiguration = requestConfiguration || {}).url =
              requestInput;
          } else {
            requestConfiguration = requestInput || {};
          }
          var mergedRequestConfiguration = (requestConfiguration =
            createMergedConfiguration(this.defaults, requestConfiguration));
          var transitionalRequestOptions =
            mergedRequestConfiguration.transitional;
          var paramsSerializerFunction =
            mergedRequestConfiguration.paramsSerializer;
          var requestHeadersConfig = mergedRequestConfiguration.headers;
          if (transitionalRequestOptions !== undefined) {
            ___optionsValidator.assertOptions(
              transitionalRequestOptions,
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
            if (__typeCheckerObject.isFunction(paramsSerializerFunction)) {
              requestConfiguration.paramsSerializer = {
                serialize: paramsSerializerFunction,
              };
            } else {
              ___optionsValidator.assertOptions(
                paramsSerializerFunction,
                {
                  encode: _optionsValidator.function,
                  serialize: _optionsValidator.function,
                },
                true,
              );
            }
          }
          requestConfiguration.method = (
            requestConfiguration.method ||
            this.defaults.method ||
            "get"
          ).toLowerCase();
          var mergedRequestHeadersCommon =
            requestHeadersConfig &&
            __typeCheckerObject.merge(
              requestHeadersConfig.common,
              requestHeadersConfig[requestConfiguration.method],
            );
          if (requestHeadersConfig) {
            __typeCheckerObject.forEach(
              ["delete", "get", "head", "post", "put", "patch", "common"],
              function (headerConfigKey) {
                delete requestHeadersConfig[headerConfigKey];
              },
            );
          }
          requestConfiguration.headers = requestHeadersManager.concat(
            mergedRequestHeadersCommon,
            requestHeadersConfig,
          );
          var interceptorExecutionQueue = [];
          var areInterceptorsExecutingSynchronously = true;
          this.interceptors.request.forEach(function (requestInterceptor) {
            if (
              typeof requestInterceptor.runWhen != "function" ||
              requestInterceptor.runWhen(requestConfiguration) !== false
            ) {
              areInterceptorsExecutingSynchronously =
                areInterceptorsExecutingSynchronously &&
                requestInterceptor.synchronous;
              interceptorExecutionQueue.unshift(
                requestInterceptor.fulfilled,
                requestInterceptor.rejected,
              );
            }
          });
          var interceptorPromiseChain;
          var responseInterceptorCallbacks = [];
          this.interceptors.response.forEach(function (responseInterceptor) {
            responseInterceptorCallbacks.push(
              responseInterceptor.fulfilled,
              responseInterceptor.rejected,
            );
          });
          var numOfInterceptorsInPromiseChain;
          var interceptorIndex = 0;
          if (!areInterceptorsExecutingSynchronously) {
            var _interceptorPromiseChain = [
              processRequestConfig.bind(this),
              undefined,
            ];
            _interceptorPromiseChain.unshift.apply(
              _interceptorPromiseChain,
              interceptorExecutionQueue,
            );
            _interceptorPromiseChain.push.apply(
              _interceptorPromiseChain,
              responseInterceptorCallbacks,
            );
            numOfInterceptorsInPromiseChain = _interceptorPromiseChain.length;
            interceptorPromiseChain = Promise.resolve(requestConfiguration);
            while (interceptorIndex < numOfInterceptorsInPromiseChain) {
              interceptorPromiseChain = interceptorPromiseChain.then(
                _interceptorPromiseChain[interceptorIndex++],
                _interceptorPromiseChain[interceptorIndex++],
              );
            }
            return interceptorPromiseChain;
          }
          numOfInterceptorsInPromiseChain = interceptorExecutionQueue.length;
          var requestConfigInstance = requestConfiguration;
          for (
            interceptorIndex = 0;
            interceptorIndex < numOfInterceptorsInPromiseChain;

          ) {
            var activeInterceptor =
              interceptorExecutionQueue[interceptorIndex++];
            var errorHandlerFunction =
              interceptorExecutionQueue[interceptorIndex++];
            try {
              requestConfigInstance = activeInterceptor(requestConfigInstance);
            } catch (____caughtError) {
              errorHandlerFunction.call(this, ____caughtError);
              break;
            }
          }
          try {
            interceptorPromiseChain = processRequestConfig.call(
              this,
              requestConfigInstance,
            );
          } catch (__caughtError) {
            return Promise.reject(__caughtError);
          }
          interceptorIndex = 0;
          numOfInterceptorsInPromiseChain = responseInterceptorCallbacks.length;
          while (interceptorIndex < numOfInterceptorsInPromiseChain) {
            interceptorPromiseChain = interceptorPromiseChain.then(
              responseInterceptorCallbacks[interceptorIndex++],
              responseInterceptorCallbacks[interceptorIndex++],
            );
          }
          return interceptorPromiseChain;
        },
      },
      {
        key: "getUri",
        value: function (__requestConfiguration) {
          return buildUrlWithQueryParams(
            combineBaseUrlWithPath(
              (__requestConfiguration = createMergedConfiguration(
                this.defaults,
                __requestConfiguration,
              )).baseURL,
              __requestConfiguration.url,
            ),
            __requestConfiguration.params,
            __requestConfiguration.paramsSerializer,
          );
        },
      },
    ]);
    return parserInputValue;
  })();
  __typeCheckerObject.forEach(
    ["delete", "get", "head", "options"],
    function (httpMethod) {
      axiosRequestHandler.prototype[httpMethod] = function (
        requestUrl,
        __requestOptions,
      ) {
        return this.request(
          createMergedConfiguration(__requestOptions || {}, {
            method: httpMethod,
            url: requestUrl,
            data: (__requestOptions || {}).data,
          }),
        );
      };
    },
  );
  __typeCheckerObject.forEach(
    ["post", "put", "patch"],
    function (httpRequestMethod) {
      function createMultipartRequestHeaders(isMultipartContentType) {
        return function (targetRequestUrl, _requestPayload, _requestOptions) {
          return this.request(
            createMergedConfiguration(_requestOptions || {}, {
              method: httpRequestMethod,
              headers: isMultipartContentType
                ? {
                    "Content-Type": "multipart/form-data",
                  }
                : {},
              url: targetRequestUrl,
              data: _requestPayload,
            }),
          );
        };
      }
      axiosRequestHandler.prototype[httpRequestMethod] =
        createMultipartRequestHeaders();
      axiosRequestHandler.prototype[httpRequestMethod + "Form"] =
        createMultipartRequestHeaders(true);
    },
  );
  var _axiosRequestHandler = axiosRequestHandler;
  var cancelTokenHandler = (function () {
    function executorCallbackFunction(executorCallback) {
      checkParserInstance(this, executorCallbackFunction);
      if (typeof executorCallback != "function") {
        throw new TypeError("executor must be a function.");
      }
      var resolveEvent;
      this.promise = new Promise(function (resolvedEvent) {
        resolveEvent = resolvedEvent;
      });
      var contextInstance = this;
      this.promise.then(function (eventObject) {
        if (contextInstance._listeners) {
          for (
            var remainingListenerCount = contextInstance._listeners.length;
            remainingListenerCount-- > 0;

          ) {
            contextInstance._listeners[remainingListenerCount](eventObject);
          }
          contextInstance._listeners = null;
        }
      });
      this.promise.then = function (onEventProcessed) {
        var subscriptionEventHandler;
        var cancellablePromise = new Promise(function (subscriptionEvent) {
          contextInstance.subscribe(subscriptionEvent);
          subscriptionEventHandler = subscriptionEvent;
        }).then(onEventProcessed);
        cancellablePromise.cancel = function () {
          contextInstance.unsubscribe(subscriptionEventHandler);
        };
        return cancellablePromise;
      };
      executorCallback(
        function (cancellationEvent, eventCancellationReason, responseData) {
          if (!contextInstance.reason) {
            contextInstance.reason = new canceledErrorMessage(
              cancellationEvent,
              eventCancellationReason,
              responseData,
            );
            resolveEvent(contextInstance.reason);
          }
        },
      );
    }
    definePropertyCount(
      executorCallbackFunction,
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
          value: function (errorCallback) {
            if (this.reason) {
              errorCallback(this.reason);
            } else if (this._listeners) {
              this._listeners.push(errorCallback);
            } else {
              this._listeners = [errorCallback];
            }
          },
        },
        {
          key: "unsubscribe",
          value: function (listenerToUnsubscribe) {
            if (this._listeners) {
              var subscriberIndex = this._listeners.indexOf(
                listenerToUnsubscribe,
              );
              if (subscriberIndex !== -1) {
                this._listeners.splice(subscriberIndex, 1);
              }
            }
          },
        },
      ],
      [
        {
          key: "source",
          value: function () {
            var pendingToken;
            return {
              token: new executorCallbackFunction(function (receivedToken) {
                pendingToken = receivedToken;
              }),
              cancel: pendingToken,
            };
          },
        },
      ],
    );
    return executorCallbackFunction;
  })();
  var httpResponseStatusCodes = {
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
  Object.entries(httpResponseStatusCodes).forEach(function (responseObject) {
    var _iterableElements = retrieveIterableElements(responseObject, 2);
    var statusCode = _iterableElements[0];
    var httpResponseContent = _iterableElements[1];
    httpResponseStatusCodes[httpResponseContent] = statusCode;
  });
  var httpStatusCodes = httpResponseStatusCodes;
  var __httpRequestHandler = (function buildHttpRequestWithHeaders(
    httpRequestOptions,
  ) {
    var httpRequestHandler = new _axiosRequestHandler(httpRequestOptions);
    var wrappedRequestWithHeaders = headerLineWrapper(
      _axiosRequestHandler.prototype.request,
      httpRequestHandler,
    );
    __typeCheckerObject.extend(
      wrappedRequestWithHeaders,
      _axiosRequestHandler.prototype,
      httpRequestHandler,
      {
        allOwnKeys: true,
      },
    );
    __typeCheckerObject.extend(
      wrappedRequestWithHeaders,
      httpRequestHandler,
      null,
      {
        allOwnKeys: true,
      },
    );
    wrappedRequestWithHeaders.create = function (httpRequestParams) {
      return buildHttpRequestWithHeaders(
        createMergedConfiguration(httpRequestOptions, httpRequestParams),
      );
    };
    return wrappedRequestWithHeaders;
  })(axiosRequestConfig);
  __httpRequestHandler.Axios = _axiosRequestHandler;
  __httpRequestHandler.CanceledError = canceledErrorMessage;
  __httpRequestHandler.CancelToken = cancelTokenHandler;
  __httpRequestHandler.isCancel = eventIsCanceled;
  __httpRequestHandler.VERSION = axiosLibraryVersion;
  __httpRequestHandler.toFormData = processFormEntries;
  __httpRequestHandler.AxiosError = HttpError;
  __httpRequestHandler.Cancel = __httpRequestHandler.CanceledError;
  __httpRequestHandler.all = function (promisesList) {
    return Promise.all(promisesList);
  };
  __httpRequestHandler.spread = function (handlerCallback) {
    return function (callbackParameters) {
      return handlerCallback.apply(null, callbackParameters);
    };
  };
  __httpRequestHandler.isAxiosError = function (axiosError) {
    return (
      __typeCheckerObject.isObject(axiosError) &&
      axiosError.isAxiosError === true
    );
  };
  __httpRequestHandler.mergeConfig = createMergedConfiguration;
  __httpRequestHandler.AxiosHeaders = requestHeadersManager;
  __httpRequestHandler.formToJSON = function (_formEvent) {
    return handleFormData(
      __typeCheckerObject.isHTMLForm(_formEvent)
        ? new FormData(_formEvent)
        : _formEvent,
    );
  };
  __httpRequestHandler.getAdapter = selectHttpRequestAdapter;
  __httpRequestHandler.HttpStatusCode = httpStatusCodes;
  __httpRequestHandler.default = __httpRequestHandler;
  return __httpRequestHandler;
});
