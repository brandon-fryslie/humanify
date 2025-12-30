"use strict";

var createSideChannel = require("side-channel");
var utils = require("./utils");
var formatUtils = require("./formats");
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var arrayFormatters = {
  brackets: function (__inputValue) {
    return __inputValue + "[]";
  },
  comma: "comma",
  indices: function (element, _index) {
    return element + "[" + _index + "]";
  },
  repeat: function (event) {
    return event;
  },
};
var isArray = Array.isArray;
var arrayPushMethod = Array.prototype.push;
function pushToExecutionContext(executionContext, response) {
  arrayPushMethod.apply(
    executionContext,
    isArray(response) ? response : [response],
  );
}
var serializeDateToISOString = Date.prototype.toISOString;
var defaultFormat = formatUtils.default;
var defaultQueryParameters = {
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
  encoder: utils.encode,
  encodeValuesOnly: false,
  filter: undefined,
  format: defaultFormat,
  formatter: formatUtils.formatters[defaultFormat],
  indices: false,
  serializeDate: function (eventParameter) {
    return serializeDateToISOString.call(eventParameter);
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
var cyclicReferenceTracker = {};
var serializeObjectToQueryParams = function recursiveObjectMapper(
  currentValue,
  key,
  currentIndex,
  sourceData,
  isEmptyArray,
  isOptional,
  conditionalValue,
  shouldEncode,
  keyValueMapperFunction,
  customFunctionMapper,
  sortingFunction,
  isKeyIncluded,
  dateFormatter,
  cyclicObjectIdentifier,
  _encodeURIComponent,
  isRecursiveCall,
  currentKey,
  nestedObjectMap,
) {
  var _currentValue = currentValue;
  var nestedObjectMapTracker = nestedObjectMap;
  var cyclicReferenceCount = 0;
  for (
    var hasCyclicReference = false;
    (nestedObjectMapTracker = nestedObjectMapTracker.get(
      cyclicReferenceTracker,
    )) !== undefined && !hasCyclicReference;

  ) {
    var currentCyclicReference = nestedObjectMapTracker.get(currentValue);
    cyclicReferenceCount += 1;
    if (currentCyclicReference !== undefined) {
      if (currentCyclicReference === cyclicReferenceCount) {
        throw new RangeError("Cyclic object value");
      }
      hasCyclicReference = true;
    }
    if (nestedObjectMapTracker.get(cyclicReferenceTracker) === undefined) {
      cyclicReferenceCount = 0;
    }
  }
  if (typeof customFunctionMapper == "function") {
    _currentValue = customFunctionMapper(key, _currentValue);
  } else if (_currentValue instanceof Date) {
    _currentValue = dateFormatter(_currentValue);
  } else if (currentIndex === "comma" && isArray(_currentValue)) {
    _currentValue = utils.maybeMap(_currentValue, function (_inputValue) {
      if (_inputValue instanceof Date) {
        return dateFormatter(_inputValue);
      } else {
        return _inputValue;
      }
    });
  }
  if (_currentValue === null) {
    if (isOptional) {
      if (keyValueMapperFunction && !isRecursiveCall) {
        return keyValueMapperFunction(
          key,
          defaultQueryParameters.encoder,
          currentKey,
          "key",
          cyclicObjectIdentifier,
        );
      } else {
        return key;
      }
    }
    _currentValue = "";
  }
  if (isPrimitiveType(_currentValue) || utils.isBuffer(_currentValue)) {
    if (keyValueMapperFunction) {
      return [
        _encodeURIComponent(
          isRecursiveCall
            ? key
            : keyValueMapperFunction(
                key,
                defaultQueryParameters.encoder,
                currentKey,
                "key",
                cyclicObjectIdentifier,
              ),
        ) +
          "=" +
          _encodeURIComponent(
            keyValueMapperFunction(
              _currentValue,
              defaultQueryParameters.encoder,
              currentKey,
              "value",
              cyclicObjectIdentifier,
            ),
          ),
      ];
    } else {
      return [
        _encodeURIComponent(key) +
          "=" +
          _encodeURIComponent(String(_currentValue)),
      ];
    }
  }
  var resultingKeys;
  var nestedValuesCollection = [];
  if (_currentValue === undefined) {
    return nestedValuesCollection;
  }
  if (currentIndex === "comma" && isArray(_currentValue)) {
    if (isRecursiveCall && keyValueMapperFunction) {
      _currentValue = utils.maybeMap(_currentValue, keyValueMapperFunction);
    }
    resultingKeys = [
      {
        value:
          _currentValue.length > 0
            ? _currentValue.join(",") || null
            : undefined,
      },
    ];
  } else if (isArray(customFunctionMapper)) {
    resultingKeys = customFunctionMapper;
  } else {
    var keyList = Object.keys(_currentValue);
    if (sortingFunction) {
      resultingKeys = keyList.sort(sortingFunction);
    } else {
      resultingKeys = keyList;
    }
  }
  var encodedKey = shouldEncode
    ? String(key).replace(/\./g, "%2E")
    : String(key);
  var encodedKeyForArray =
    sourceData && isArray(_currentValue) && _currentValue.length === 1
      ? encodedKey + "[]"
      : encodedKey;
  if (isEmptyArray && isArray(_currentValue) && _currentValue.length === 0) {
    return encodedKeyForArray + "[]";
  }
  for (var __index = 0; __index < resultingKeys.length; ++__index) {
    var currentElement = resultingKeys[__index];
    var fetchedValue =
      typeof currentElement == "object" &&
      currentElement &&
      currentElement.value !== undefined
        ? currentElement.value
        : _currentValue[currentElement];
    if (!conditionalValue || fetchedValue !== null) {
      var encodedValue =
        isKeyIncluded && shouldEncode
          ? String(currentElement).replace(/\./g, "%2E")
          : String(currentElement);
      var nestedKeyBuilder = isArray(_currentValue)
        ? typeof currentIndex == "function"
          ? currentIndex(encodedKeyForArray, encodedValue)
          : encodedKeyForArray
        : encodedKeyForArray +
          (isKeyIncluded ? "." + encodedValue : "[" + encodedValue + "]");
      nestedObjectMap.set(currentValue, cyclicReferenceCount);
      var _sideChannel = createSideChannel();
      _sideChannel.set(cyclicReferenceTracker, nestedObjectMap);
      pushToExecutionContext(
        nestedValuesCollection,
        recursiveObjectMapper(
          fetchedValue,
          nestedKeyBuilder,
          currentIndex,
          sourceData,
          isEmptyArray,
          isOptional,
          conditionalValue,
          shouldEncode,
          currentIndex === "comma" && isRecursiveCall && isArray(_currentValue)
            ? null
            : keyValueMapperFunction,
          customFunctionMapper,
          sortingFunction,
          isKeyIncluded,
          dateFormatter,
          cyclicObjectIdentifier,
          _encodeURIComponent,
          isRecursiveCall,
          currentKey,
          _sideChannel,
        ),
      );
    }
  }
  return nestedValuesCollection;
};
function parseOptions(options) {
  if (!options) {
    return defaultQueryParameters;
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
  var charsetOption = options.charset || defaultQueryParameters.charset;
  if (
    options.charset !== undefined &&
    options.charset !== "utf-8" &&
    options.charset !== "iso-8859-1"
  ) {
    throw new TypeError(
      "The charset option must be either utf-8, iso-8859-1, or undefined",
    );
  }
  var selectedFormat = formatUtils.default;
  if (options.format !== undefined) {
    if (!_hasOwnProperty.call(formatUtils.formatters, options.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    selectedFormat = options.format;
  }
  var selectedArrayFormat;
  var formatterFunction = formatUtils.formatters[selectedFormat];
  var filterFunction = defaultQueryParameters.filter;
  if (typeof options.filter == "function" || isArray(options.filter)) {
    filterFunction = options.filter;
  }
  if (options.arrayFormat in arrayFormatters) {
    selectedArrayFormat = options.arrayFormat;
  } else if ("indices" in options) {
    if (options.indices) {
      selectedArrayFormat = "indices";
    } else {
      selectedArrayFormat = "repeat";
    }
  } else {
    selectedArrayFormat = defaultQueryParameters.arrayFormat;
  }
  if (
    "commaRoundTrip" in options &&
    typeof options.commaRoundTrip != "boolean"
  ) {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  var allowDots =
    options.allowDots === undefined
      ? options.encodeDotInKeys === true || defaultQueryParameters.allowDots
      : !!options.allowDots;
  return {
    addQueryPrefix:
      typeof options.addQueryPrefix == "boolean"
        ? options.addQueryPrefix
        : defaultQueryParameters.addQueryPrefix,
    allowDots: allowDots,
    allowEmptyArrays:
      typeof options.allowEmptyArrays == "boolean"
        ? !!options.allowEmptyArrays
        : defaultQueryParameters.allowEmptyArrays,
    arrayFormat: selectedArrayFormat,
    charset: charsetOption,
    charsetSentinel:
      typeof options.charsetSentinel == "boolean"
        ? options.charsetSentinel
        : defaultQueryParameters.charsetSentinel,
    commaRoundTrip: !!options.commaRoundTrip,
    delimiter:
      options.delimiter === undefined
        ? defaultQueryParameters.delimiter
        : options.delimiter,
    encode:
      typeof options.encode == "boolean"
        ? options.encode
        : defaultQueryParameters.encode,
    encodeDotInKeys:
      typeof options.encodeDotInKeys == "boolean"
        ? options.encodeDotInKeys
        : defaultQueryParameters.encodeDotInKeys,
    encoder:
      typeof options.encoder == "function"
        ? options.encoder
        : defaultQueryParameters.encoder,
    encodeValuesOnly:
      typeof options.encodeValuesOnly == "boolean"
        ? options.encodeValuesOnly
        : defaultQueryParameters.encodeValuesOnly,
    filter: filterFunction,
    format: selectedFormat,
    formatter: formatterFunction,
    serializeDate:
      typeof options.serializeDate == "function"
        ? options.serializeDate
        : defaultQueryParameters.serializeDate,
    skipNulls:
      typeof options.skipNulls == "boolean"
        ? options.skipNulls
        : defaultQueryParameters.skipNulls,
    sort: typeof options.sort == "function" ? options.sort : null,
    strictNullHandling:
      typeof options.strictNullHandling == "boolean"
        ? options.strictNullHandling
        : defaultQueryParameters.strictNullHandling,
  };
}
module.exports = function (inputObject, _options) {
  var filterKeys;
  var inputData = inputObject;
  var parsedOptions = parseOptions(_options);
  if (typeof parsedOptions.filter == "function") {
    inputData = (0, parsedOptions.filter)("", inputData);
  } else if (isArray(parsedOptions.filter)) {
    filterKeys = parsedOptions.filter;
  }
  var queryParamArray = [];
  if (typeof inputData != "object" || inputData === null) {
    return "";
  }
  var arrayFormatter = arrayFormatters[parsedOptions.arrayFormat];
  var isCommaRoundTrip =
    arrayFormatter === "comma" && parsedOptions.commaRoundTrip;
  filterKeys ||= Object.keys(inputData);
  if (parsedOptions.sort) {
    filterKeys.sort(parsedOptions.sort);
  }
  var sideChannel = createSideChannel();
  for (
    var _currentIndex = 0;
    _currentIndex < filterKeys.length;
    ++_currentIndex
  ) {
    var currentFilterKey = filterKeys[_currentIndex];
    var currentInputDataValue = inputData[currentFilterKey];
    if (!parsedOptions.skipNulls || currentInputDataValue !== null) {
      pushToExecutionContext(
        queryParamArray,
        serializeObjectToQueryParams(
          currentInputDataValue,
          currentFilterKey,
          arrayFormatter,
          isCommaRoundTrip,
          parsedOptions.allowEmptyArrays,
          parsedOptions.strictNullHandling,
          parsedOptions.skipNulls,
          parsedOptions.encodeDotInKeys,
          parsedOptions.encode ? parsedOptions.encoder : null,
          parsedOptions.filter,
          parsedOptions.sort,
          parsedOptions.allowDots,
          parsedOptions.serializeDate,
          parsedOptions.format,
          parsedOptions.formatter,
          parsedOptions.encodeValuesOnly,
          parsedOptions.charset,
          sideChannel,
        ),
      );
    }
  }
  var queryParamString = queryParamArray.join(parsedOptions.delimiter);
  var queryPrefix = parsedOptions.addQueryPrefix === true ? "?" : "";
  if (parsedOptions.charsetSentinel) {
    if (parsedOptions.charset === "iso-8859-1") {
      queryPrefix += "utf8=%26%2310003%3B&";
    } else {
      queryPrefix += "utf8=%E2%9C%93&";
    }
  }
  if (queryParamString.length > 0) {
    return queryPrefix + queryParamString;
  } else {
    return "";
  }
};
