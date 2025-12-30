"use strict";

var sideChannel = require("side-channel");
var utilsModule = require("./utils");
var formats = require("./formats");
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var arrayFormatMethods = {
  brackets: function (inputString) {
    return inputString + "[]";
  },
  comma: "comma",
  indices: function (elementKey, __index) {
    return elementKey + "[" + __index + "]";
  },
  repeat: function (__event) {
    return __event;
  },
};
var isArray = Array.isArray;
var arrayPushMethod = Array.prototype.push;
function handleEvent(event, receivedArgument) {
  arrayPushMethod.apply(
    event,
    isArray(receivedArgument) ? receivedArgument : [receivedArgument],
  );
}
var serializeDateFunction = Date.prototype.toISOString;
var defaultFormat = formats.default;
var defaultOptions = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: false,
  commaRoundTrip: false,
  delimiter: "&",
  encode: true,
  encodeDotInKeys: false,
  encoder: utilsModule.encode,
  encodeValuesOnly: false,
  filter: undefined,
  format: defaultFormat,
  formatter: formats.formatters[defaultFormat],
  indices: false,
  serializeDate: function (_event) {
    return serializeDateFunction.call(_event);
  },
  skipNulls: false,
  strictNullHandling: false,
};
function isPrimitiveType(inputValue) {
  return (
    typeof inputValue == "string" ||
    typeof inputValue == "number" ||
    typeof inputValue == "boolean" ||
    typeof inputValue == "symbol" ||
    typeof inputValue == "bigint"
  );
}
var visitedObjectsMap = {};
var serializeObjectAsQueryString = function mapNestedObject(
  currentObjectValue,
  currentValue,
  index,
  _currentObjectValue,
  isArrayEmpty,
  isKeyEncoded,
  isValueAllowed,
  shouldEncodeKey,
  keyEncoderFunction,
  transformFunction,
  sortFunction,
  isCyclic,
  dateFormatter,
  cyclicCheckCounter,
  _encodeURIComponent,
  isCyclicValue,
  keyParam,
  objectMap,
) {
  var __currentObjectValue = currentObjectValue;
  var _visitedObjectsMap = objectMap;
  var currentCycleCount = 0;
  for (
    var isVisited = false;
    (_visitedObjectsMap = _visitedObjectsMap.get(visitedObjectsMap)) !==
      undefined && !isVisited;

  ) {
    var currentObjectCount = _visitedObjectsMap.get(currentObjectValue);
    currentCycleCount += 1;
    if (currentObjectCount !== undefined) {
      if (currentObjectCount === currentCycleCount) {
        throw new RangeError("Cyclic object value");
      }
      isVisited = true;
    }
    if (_visitedObjectsMap.get(visitedObjectsMap) === undefined) {
      currentCycleCount = 0;
    }
  }
  if (typeof transformFunction == "function") {
    __currentObjectValue = transformFunction(
      currentValue,
      __currentObjectValue,
    );
  } else if (__currentObjectValue instanceof Date) {
    __currentObjectValue = dateFormatter(__currentObjectValue);
  } else if (index === "comma" && isArray(__currentObjectValue)) {
    __currentObjectValue = utilsModule.maybeMap(
      __currentObjectValue,
      function (_inputValue) {
        if (_inputValue instanceof Date) {
          return dateFormatter(_inputValue);
        } else {
          return _inputValue;
        }
      },
    );
  }
  if (__currentObjectValue === null) {
    if (isKeyEncoded) {
      if (keyEncoderFunction && !isCyclicValue) {
        return keyEncoderFunction(
          currentValue,
          defaultOptions.encoder,
          keyParam,
          "key",
          cyclicCheckCounter,
        );
      } else {
        return currentValue;
      }
    }
    __currentObjectValue = "";
  }
  if (
    isPrimitiveType(__currentObjectValue) ||
    utilsModule.isBuffer(__currentObjectValue)
  ) {
    if (keyEncoderFunction) {
      return [
        _encodeURIComponent(
          isCyclicValue
            ? currentValue
            : keyEncoderFunction(
                currentValue,
                defaultOptions.encoder,
                keyParam,
                "key",
                cyclicCheckCounter,
              ),
        ) +
          "=" +
          _encodeURIComponent(
            keyEncoderFunction(
              __currentObjectValue,
              defaultOptions.encoder,
              keyParam,
              "value",
              cyclicCheckCounter,
            ),
          ),
      ];
    } else {
      return [
        _encodeURIComponent(currentValue) +
          "=" +
          _encodeURIComponent(String(__currentObjectValue)),
      ];
    }
  }
  var currentObjectKeys;
  var resultArray = [];
  if (__currentObjectValue === undefined) {
    return resultArray;
  }
  if (index === "comma" && isArray(__currentObjectValue)) {
    if (isCyclicValue && keyEncoderFunction) {
      __currentObjectValue = utilsModule.maybeMap(
        __currentObjectValue,
        keyEncoderFunction,
      );
    }
    currentObjectKeys = [
      {
        value:
          __currentObjectValue.length > 0
            ? __currentObjectValue.join(",") || null
            : undefined,
      },
    ];
  } else if (isArray(transformFunction)) {
    currentObjectKeys = transformFunction;
  } else {
    var objectKeys = Object.keys(__currentObjectValue);
    if (sortFunction) {
      currentObjectKeys = objectKeys.sort(sortFunction);
    } else {
      currentObjectKeys = objectKeys;
    }
  }
  var encodedKey = shouldEncodeKey
    ? String(currentValue).replace(/\./g, "%2E")
    : String(currentValue);
  var encodedKeyWithArrayNotation =
    _currentObjectValue &&
    isArray(__currentObjectValue) &&
    __currentObjectValue.length === 1
      ? encodedKey + "[]"
      : encodedKey;
  if (
    isArrayEmpty &&
    isArray(__currentObjectValue) &&
    __currentObjectValue.length === 0
  ) {
    return encodedKeyWithArrayNotation + "[]";
  }
  for (
    var _currentIndex = 0;
    _currentIndex < currentObjectKeys.length;
    ++_currentIndex
  ) {
    var currentItem = currentObjectKeys[_currentIndex];
    var valueToMap =
      typeof currentItem == "object" &&
      currentItem &&
      currentItem.value !== undefined
        ? currentItem.value
        : __currentObjectValue[currentItem];
    if (!isValueAllowed || valueToMap !== null) {
      var formattedValue =
        isCyclic && shouldEncodeKey
          ? String(currentItem).replace(/\./g, "%2E")
          : String(currentItem);
      var objectKey = isArray(__currentObjectValue)
        ? typeof index == "function"
          ? index(encodedKeyWithArrayNotation, formattedValue)
          : encodedKeyWithArrayNotation
        : encodedKeyWithArrayNotation +
          (isCyclic ? "." + formattedValue : "[" + formattedValue + "]");
      objectMap.set(currentObjectValue, currentCycleCount);
      var sideChannelData = sideChannel();
      sideChannelData.set(visitedObjectsMap, objectMap);
      handleEvent(
        resultArray,
        mapNestedObject(
          valueToMap,
          objectKey,
          index,
          _currentObjectValue,
          isArrayEmpty,
          isKeyEncoded,
          isValueAllowed,
          shouldEncodeKey,
          index === "comma" && isCyclicValue && isArray(__currentObjectValue)
            ? null
            : keyEncoderFunction,
          transformFunction,
          sortFunction,
          isCyclic,
          dateFormatter,
          cyclicCheckCounter,
          _encodeURIComponent,
          isCyclicValue,
          keyParam,
          sideChannelData,
        ),
      );
    }
  }
  return resultArray;
};
function processOptions(options) {
  if (!options) {
    return defaultOptions;
  }
  if (
    options.allowEmptyArrays !== undefined &&
    typeof options.allowEmptyArrays != "boolean"
  ) {
    throw new TypeError(
      "`allowEmptyArrays` option can only be `true` or `false`, when provided",
    );
  }
  if (
    options.encodeDotInKeys !== undefined &&
    typeof options.encodeDotInKeys != "boolean"
  ) {
    throw new TypeError(
      "`encodeDotInKeys` option can only be `true` or `false`, when provided",
    );
  }
  if (
    options.encoder !== null &&
    options.encoder !== undefined &&
    typeof options.encoder != "function"
  ) {
    throw new TypeError("Encoder has to be a function.");
  }
  var charset = options.charset || defaultOptions.charset;
  if (
    options.charset !== undefined &&
    options.charset !== "utf-8" &&
    options.charset !== "iso-8859-1"
  ) {
    throw new TypeError(
      "The charset option must be either utf-8, iso-8859-1, or undefined",
    );
  }
  var selectedFormat = formats.default;
  if (options.format !== undefined) {
    if (!_hasOwnProperty.call(formats.formatters, options.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    selectedFormat = options.format;
  }
  var selectedArrayFormat;
  var formatterFunction = formats.formatters[selectedFormat];
  var filterFunction = defaultOptions.filter;
  if (typeof options.filter == "function" || isArray(options.filter)) {
    filterFunction = options.filter;
  }
  if (options.arrayFormat in arrayFormatMethods) {
    selectedArrayFormat = options.arrayFormat;
  } else if ("indices" in options) {
    if (options.indices) {
      selectedArrayFormat = "indices";
    } else {
      selectedArrayFormat = "repeat";
    }
  } else {
    selectedArrayFormat = defaultOptions.arrayFormat;
  }
  if (
    "commaRoundTrip" in options &&
    typeof options.commaRoundTrip != "boolean"
  ) {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  var allowDots =
    options.allowDots === undefined
      ? options.encodeDotInKeys === true || defaultOptions.allowDots
      : !!options.allowDots;
  return {
    addQueryPrefix:
      typeof options.addQueryPrefix == "boolean"
        ? options.addQueryPrefix
        : defaultOptions.addQueryPrefix,
    allowDots: allowDots,
    allowEmptyArrays:
      typeof options.allowEmptyArrays == "boolean"
        ? !!options.allowEmptyArrays
        : defaultOptions.allowEmptyArrays,
    arrayFormat: selectedArrayFormat,
    charset: charset,
    charsetSentinel:
      typeof options.charsetSentinel == "boolean"
        ? options.charsetSentinel
        : defaultOptions.charsetSentinel,
    commaRoundTrip: !!options.commaRoundTrip,
    delimiter:
      options.delimiter === undefined
        ? defaultOptions.delimiter
        : options.delimiter,
    encode:
      typeof options.encode == "boolean"
        ? options.encode
        : defaultOptions.encode,
    encodeDotInKeys:
      typeof options.encodeDotInKeys == "boolean"
        ? options.encodeDotInKeys
        : defaultOptions.encodeDotInKeys,
    encoder:
      typeof options.encoder == "function"
        ? options.encoder
        : defaultOptions.encoder,
    encodeValuesOnly:
      typeof options.encodeValuesOnly == "boolean"
        ? options.encodeValuesOnly
        : defaultOptions.encodeValuesOnly,
    filter: filterFunction,
    format: selectedFormat,
    formatter: formatterFunction,
    serializeDate:
      typeof options.serializeDate == "function"
        ? options.serializeDate
        : defaultOptions.serializeDate,
    skipNulls:
      typeof options.skipNulls == "boolean"
        ? options.skipNulls
        : defaultOptions.skipNulls,
    sort: typeof options.sort == "function" ? options.sort : null,
    strictNullHandling:
      typeof options.strictNullHandling == "boolean"
        ? options.strictNullHandling
        : defaultOptions.strictNullHandling,
  };
}
module.exports = function (inputObject, _options) {
  var filterKeys;
  var inputData = inputObject;
  var processedOptions = processOptions(_options);
  if (typeof processedOptions.filter == "function") {
    inputData = (0, processedOptions.filter)("", inputData);
  } else if (isArray(processedOptions.filter)) {
    filterKeys = processedOptions.filter;
  }
  var queryParametersArray = [];
  if (typeof inputData != "object" || inputData === null) {
    return "";
  }
  var arrayFormatMethod = arrayFormatMethods[processedOptions.arrayFormat];
  var isCommaRoundTrip =
    arrayFormatMethod === "comma" && processedOptions.commaRoundTrip;
  filterKeys ||= Object.keys(inputData);
  if (processedOptions.sort) {
    filterKeys.sort(processedOptions.sort);
  }
  var sideChannelReference = sideChannel();
  for (var _index = 0; _index < filterKeys.length; ++_index) {
    var currentFilterKey = filterKeys[_index];
    var currentFilterValue = inputData[currentFilterKey];
    if (!processedOptions.skipNulls || currentFilterValue !== null) {
      handleEvent(
        queryParametersArray,
        serializeObjectAsQueryString(
          currentFilterValue,
          currentFilterKey,
          arrayFormatMethod,
          isCommaRoundTrip,
          processedOptions.allowEmptyArrays,
          processedOptions.strictNullHandling,
          processedOptions.skipNulls,
          processedOptions.encodeDotInKeys,
          processedOptions.encode ? processedOptions.encoder : null,
          processedOptions.filter,
          processedOptions.sort,
          processedOptions.allowDots,
          processedOptions.serializeDate,
          processedOptions.format,
          processedOptions.formatter,
          processedOptions.encodeValuesOnly,
          processedOptions.charset,
          sideChannelReference,
        ),
      );
    }
  }
  var queryString = queryParametersArray.join(processedOptions.delimiter);
  var queryPrefix = processedOptions.addQueryPrefix === true ? "?" : "";
  if (processedOptions.charsetSentinel) {
    if (processedOptions.charset === "iso-8859-1") {
      queryPrefix += "utf8=%26%2310003%3B&";
    } else {
      queryPrefix += "utf8=%E2%9C%93&";
    }
  }
  if (queryString.length > 0) {
    return queryPrefix + queryString;
  } else {
    return "";
  }
};
