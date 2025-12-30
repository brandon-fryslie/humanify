"use strict";

var createSideChannel = require("side-channel");
var utils = require("./utils");
var formatsModule = require("./formats");
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var arrayFormatMethods = {
  brackets: function (________inputValue) {
    return ________inputValue + "[]";
  },
  comma: "comma",
  indices: function (element, elementIndex) {
    return element + "[" + elementIndex + "]";
  },
  repeat: function (event) {
    return event;
  },
};
var isArray = Array.isArray;
var arrayPushMethod = Array.prototype.push;
function targetArray(targetArrayElement, inputElement) {
  arrayPushMethod.apply(
    targetArrayElement,
    isArray(inputElement) ? inputElement : [inputElement],
  );
}
var serializeDateToISOString = Date.prototype.toISOString;
var defaultFormat = formatsModule.default;
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
  encoder: utils.encode,
  encodeValuesOnly: false,
  filter: undefined,
  format: defaultFormat,
  formatter: formatsModule.formatters[defaultFormat],
  indices: false,
  serializeDate: function (dateObject) {
    return serializeDateToISOString.call(dateObject);
  },
  skipNulls: false,
  strictNullHandling: false,
};
function isPrimitive(_inputValue) {
  return (
    typeof _inputValue == "string" ||
    typeof _inputValue == "number" ||
    typeof _inputValue == "boolean" ||
    typeof _inputValue == "symbol" ||
    typeof _inputValue == "bigint"
  );
}
var sideChannelMap = {};
var serializeObject = function serializeValue(
  valueToSerialize,
  currentValue,
  serializationFormat,
  isSerializationArray,
  isEmptyArray,
  shouldSerialize,
  shouldExcludeNull,
  shouldEncodeCurrentValue,
  serializationFunction,
  serializationFunctionCallback,
  sortingFunction,
  shouldEncodeValue,
  dateSerializer,
  sideChannelKey,
  encodeValue,
  isSerializationFunctionApplied,
  sideChannelCounter,
  _sideChannelMap,
) {
  var _valueToSerialize = valueToSerialize;
  var __sideChannelMap = _sideChannelMap;
  var sideChannelIterationCount = 0;
  for (
    var isCycleDetected = false;
    (__sideChannelMap = __sideChannelMap.get(sideChannelMap)) !== undefined &&
    !isCycleDetected;

  ) {
    var sideChannelValue = __sideChannelMap.get(valueToSerialize);
    sideChannelIterationCount += 1;
    if (sideChannelValue !== undefined) {
      if (sideChannelValue === sideChannelIterationCount) {
        throw new RangeError("Cyclic object value");
      }
      isCycleDetected = true;
    }
    if (__sideChannelMap.get(sideChannelMap) === undefined) {
      sideChannelIterationCount = 0;
    }
  }
  if (typeof serializationFunctionCallback == "function") {
    _valueToSerialize = serializationFunctionCallback(
      currentValue,
      _valueToSerialize,
    );
  } else if (_valueToSerialize instanceof Date) {
    _valueToSerialize = dateSerializer(_valueToSerialize);
  } else if (serializationFormat === "comma" && isArray(_valueToSerialize)) {
    _valueToSerialize = utils.maybeMap(
      _valueToSerialize,
      function (_______inputValue) {
        if (_______inputValue instanceof Date) {
          return dateSerializer(_______inputValue);
        } else {
          return _______inputValue;
        }
      },
    );
  }
  if (_valueToSerialize === null) {
    if (shouldSerialize) {
      if (serializationFunction && !isSerializationFunctionApplied) {
        return serializationFunction(
          currentValue,
          defaultOptions.encoder,
          sideChannelCounter,
          "key",
          sideChannelKey,
        );
      } else {
        return currentValue;
      }
    }
    _valueToSerialize = "";
  }
  if (isPrimitive(_valueToSerialize) || utils.isBuffer(_valueToSerialize)) {
    if (serializationFunction) {
      return [
        encodeValue(
          isSerializationFunctionApplied
            ? currentValue
            : serializationFunction(
                currentValue,
                defaultOptions.encoder,
                sideChannelCounter,
                "key",
                sideChannelKey,
              ),
        ) +
          "=" +
          encodeValue(
            serializationFunction(
              _valueToSerialize,
              defaultOptions.encoder,
              sideChannelCounter,
              "value",
              sideChannelKey,
            ),
          ),
      ];
    } else {
      return [
        encodeValue(currentValue) +
          "=" +
          encodeValue(String(_valueToSerialize)),
      ];
    }
  }
  var keysOrSerializedArray;
  var serializedValues = [];
  if (_valueToSerialize === undefined) {
    return serializedValues;
  }
  if (serializationFormat === "comma" && isArray(_valueToSerialize)) {
    if (isSerializationFunctionApplied && serializationFunction) {
      _valueToSerialize = utils.maybeMap(
        _valueToSerialize,
        serializationFunction,
      );
    }
    keysOrSerializedArray = [
      {
        value:
          _valueToSerialize.length > 0
            ? _valueToSerialize.join(",") || null
            : undefined,
      },
    ];
  } else if (isArray(serializationFunctionCallback)) {
    keysOrSerializedArray = serializationFunctionCallback;
  } else {
    var objectKeys = Object.keys(_valueToSerialize);
    if (sortingFunction) {
      keysOrSerializedArray = objectKeys.sort(sortingFunction);
    } else {
      keysOrSerializedArray = objectKeys;
    }
  }
  var encodedCurrentValue = shouldEncodeCurrentValue
    ? String(currentValue).replace(/\./g, "%2E")
    : String(currentValue);
  var serializedValue =
    isSerializationArray &&
    isArray(_valueToSerialize) &&
    _valueToSerialize.length === 1
      ? encodedCurrentValue + "[]"
      : encodedCurrentValue;
  if (
    isEmptyArray &&
    isArray(_valueToSerialize) &&
    _valueToSerialize.length === 0
  ) {
    return serializedValue + "[]";
  }
  for (var index = 0; index < keysOrSerializedArray.length; ++index) {
    var currentKey = keysOrSerializedArray[index];
    var _currentValue =
      typeof currentKey == "object" &&
      currentKey &&
      currentKey.value !== undefined
        ? currentKey.value
        : _valueToSerialize[currentKey];
    if (!shouldExcludeNull || _currentValue !== null) {
      var encodedValue =
        shouldEncodeValue && shouldEncodeCurrentValue
          ? String(currentKey).replace(/\./g, "%2E")
          : String(currentKey);
      var finalSerializedValue = isArray(_valueToSerialize)
        ? typeof serializationFormat == "function"
          ? serializationFormat(serializedValue, encodedValue)
          : serializedValue
        : serializedValue +
          (shouldEncodeValue ? "." + encodedValue : "[" + encodedValue + "]");
      _sideChannelMap.set(valueToSerialize, sideChannelIterationCount);
      var sideChannelContainer = createSideChannel();
      sideChannelContainer.set(sideChannelMap, _sideChannelMap);
      targetArray(
        serializedValues,
        serializeValue(
          _currentValue,
          finalSerializedValue,
          serializationFormat,
          isSerializationArray,
          isEmptyArray,
          shouldSerialize,
          shouldExcludeNull,
          shouldEncodeCurrentValue,
          serializationFormat === "comma" &&
            isSerializationFunctionApplied &&
            isArray(_valueToSerialize)
            ? null
            : serializationFunction,
          serializationFunctionCallback,
          sortingFunction,
          shouldEncodeValue,
          dateSerializer,
          sideChannelKey,
          encodeValue,
          isSerializationFunctionApplied,
          sideChannelCounter,
          sideChannelContainer,
        ),
      );
    }
  }
  return serializedValues;
};
function getOptionsFromInput(inputOptions) {
  if (!inputOptions) {
    return defaultOptions;
  }
  if (
    inputOptions.allowEmptyArrays !== undefined &&
    typeof inputOptions.allowEmptyArrays != "boolean"
  ) {
    throw new TypeError(
      "`allowEmptyArrays` option can only be `true` or `false`, when provided",
    );
  }
  if (
    inputOptions.encodeDotInKeys !== undefined &&
    typeof inputOptions.encodeDotInKeys != "boolean"
  ) {
    throw new TypeError(
      "`encodeDotInKeys` option can only be `true` or `false`, when provided",
    );
  }
  if (
    inputOptions.encoder !== null &&
    inputOptions.encoder !== undefined &&
    typeof inputOptions.encoder != "function"
  ) {
    throw new TypeError("Encoder has to be a function.");
  }
  var charsetValue = inputOptions.charset || defaultOptions.charset;
  if (
    inputOptions.charset !== undefined &&
    inputOptions.charset !== "utf-8" &&
    inputOptions.charset !== "iso-8859-1"
  ) {
    throw new TypeError(
      "The charset option must be either utf-8, iso-8859-1, or undefined",
    );
  }
  var selectedFormat = formatsModule.default;
  if (inputOptions.format !== undefined) {
    if (!_hasOwnProperty.call(formatsModule.formatters, inputOptions.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    selectedFormat = inputOptions.format;
  }
  var arrayFormatOption;
  var selectedFormatter = formatsModule.formatters[selectedFormat];
  var filterFunction = defaultOptions.filter;
  if (
    typeof inputOptions.filter == "function" ||
    isArray(inputOptions.filter)
  ) {
    filterFunction = inputOptions.filter;
  }
  if (inputOptions.arrayFormat in arrayFormatMethods) {
    arrayFormatOption = inputOptions.arrayFormat;
  } else if ("indices" in inputOptions) {
    if (inputOptions.indices) {
      arrayFormatOption = "indices";
    } else {
      arrayFormatOption = "repeat";
    }
  } else {
    arrayFormatOption = defaultOptions.arrayFormat;
  }
  if (
    "commaRoundTrip" in inputOptions &&
    typeof inputOptions.commaRoundTrip != "boolean"
  ) {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  var allowDots =
    inputOptions.allowDots === undefined
      ? inputOptions.encodeDotInKeys === true || defaultOptions.allowDots
      : !!inputOptions.allowDots;
  return {
    addQueryPrefix:
      typeof inputOptions.addQueryPrefix == "boolean"
        ? inputOptions.addQueryPrefix
        : defaultOptions.addQueryPrefix,
    allowDots: allowDots,
    allowEmptyArrays:
      typeof inputOptions.allowEmptyArrays == "boolean"
        ? !!inputOptions.allowEmptyArrays
        : defaultOptions.allowEmptyArrays,
    arrayFormat: arrayFormatOption,
    charset: charsetValue,
    charsetSentinel:
      typeof inputOptions.charsetSentinel == "boolean"
        ? inputOptions.charsetSentinel
        : defaultOptions.charsetSentinel,
    commaRoundTrip: !!inputOptions.commaRoundTrip,
    delimiter:
      inputOptions.delimiter === undefined
        ? defaultOptions.delimiter
        : inputOptions.delimiter,
    encode:
      typeof inputOptions.encode == "boolean"
        ? inputOptions.encode
        : defaultOptions.encode,
    encodeDotInKeys:
      typeof inputOptions.encodeDotInKeys == "boolean"
        ? inputOptions.encodeDotInKeys
        : defaultOptions.encodeDotInKeys,
    encoder:
      typeof inputOptions.encoder == "function"
        ? inputOptions.encoder
        : defaultOptions.encoder,
    encodeValuesOnly:
      typeof inputOptions.encodeValuesOnly == "boolean"
        ? inputOptions.encodeValuesOnly
        : defaultOptions.encodeValuesOnly,
    filter: filterFunction,
    format: selectedFormat,
    formatter: selectedFormatter,
    serializeDate:
      typeof inputOptions.serializeDate == "function"
        ? inputOptions.serializeDate
        : defaultOptions.serializeDate,
    skipNulls:
      typeof inputOptions.skipNulls == "boolean"
        ? inputOptions.skipNulls
        : defaultOptions.skipNulls,
    sort: typeof inputOptions.sort == "function" ? inputOptions.sort : null,
    strictNullHandling:
      typeof inputOptions.strictNullHandling == "boolean"
        ? inputOptions.strictNullHandling
        : defaultOptions.strictNullHandling,
  };
}
module.exports = function (inputObject, options) {
  var filterKeys;
  var inputData = inputObject;
  var optionsFromInput = getOptionsFromInput(options);
  if (typeof optionsFromInput.filter == "function") {
    inputData = (0, optionsFromInput.filter)("", inputData);
  } else if (isArray(optionsFromInput.filter)) {
    filterKeys = optionsFromInput.filter;
  }
  var serializedOutput = [];
  if (typeof inputData != "object" || inputData === null) {
    return "";
  }
  var arrayFormatMethod = arrayFormatMethods[optionsFromInput.arrayFormat];
  var isCommaRoundTrip =
    arrayFormatMethod === "comma" && optionsFromInput.commaRoundTrip;
  filterKeys ||= Object.keys(inputData);
  if (optionsFromInput.sort) {
    filterKeys.sort(optionsFromInput.sort);
  }
  var sideChannel = createSideChannel();
  for (
    var _filterKeyIndex = 0;
    _filterKeyIndex < filterKeys.length;
    ++_filterKeyIndex
  ) {
    var currentFilterKey = filterKeys[_filterKeyIndex];
    var currentFilterValue = inputData[currentFilterKey];
    if (!optionsFromInput.skipNulls || currentFilterValue !== null) {
      targetArray(
        serializedOutput,
        serializeObject(
          currentFilterValue,
          currentFilterKey,
          arrayFormatMethod,
          isCommaRoundTrip,
          optionsFromInput.allowEmptyArrays,
          optionsFromInput.strictNullHandling,
          optionsFromInput.skipNulls,
          optionsFromInput.encodeDotInKeys,
          optionsFromInput.encode ? optionsFromInput.encoder : null,
          optionsFromInput.filter,
          optionsFromInput.sort,
          optionsFromInput.allowDots,
          optionsFromInput.serializeDate,
          optionsFromInput.format,
          optionsFromInput.formatter,
          optionsFromInput.encodeValuesOnly,
          optionsFromInput.charset,
          sideChannel,
        ),
      );
    }
  }
  var serializedQueryString = serializedOutput.join(optionsFromInput.delimiter);
  var queryPrefix = optionsFromInput.addQueryPrefix === true ? "?" : "";
  if (optionsFromInput.charsetSentinel) {
    if (optionsFromInput.charset === "iso-8859-1") {
      queryPrefix += "utf8=%26%2310003%3B&";
    } else {
      queryPrefix += "utf8=%E2%9C%93&";
    }
  }
  if (serializedQueryString.length > 0) {
    return queryPrefix + serializedQueryString;
  } else {
    return "";
  }
};
