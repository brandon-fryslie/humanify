"use strict";

var createSideChannelInstance = require("side-channel");
var utils = require("./utils");
var formatModule = require("./formats");
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var arrayFormatFunctions = {
  brackets: function (inputValue) {
    return inputValue + "[]";
  },
  comma: "comma",
  indices: function (element, arrayIndex) {
    return element + "[" + arrayIndex + "]";
  },
  repeat: function (event) {
    return event;
  },
};
var isArrayFunction = Array.isArray;
var arrayPush = Array.prototype.push;
function arrayPushToTarget(targetArray, elementToAdd) {
  arrayPush.apply(
    targetArray,
    isArrayFunction(elementToAdd) ? elementToAdd : [elementToAdd],
  );
}
var serializeDateToISOString = Date.prototype.toISOString;
var defaultFormat = formatModule.default;
var defaultQueryConfig = {
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
  formatter: formatModule.formatters[defaultFormat],
  indices: false,
  serializeDate: function (dateObject) {
    return serializeDateToISOString.call(dateObject);
  },
  skipNulls: false,
  strictNullHandling: false,
};
function isPrimitiveType(valueToCheck) {
  return (
    typeof valueToCheck == "string" ||
    typeof valueToCheck == "number" ||
    typeof valueToCheck == "boolean" ||
    typeof valueToCheck == "symbol" ||
    typeof valueToCheck == "bigint"
  );
}
var sideChannelCache = {};
var serializeValue = function processValue(
  initialValue,
  currentValue,
  separatorType,
  separatorValue,
  isEmptyArray,
  isProcessing,
  excludeNullValues,
  shouldEncodeCurrentValue,
  encoderFunction,
  valueProcessor,
  sortFunction,
  isCurrentValueEncoded,
  dateFormatterFunction,
  keyParameter,
  encodeValue,
  isEncoderFunctionActive,
  encoderKey,
  _sideChannelCache,
) {
  var processedValue = initialValue;
  var __sideChannelCache = _sideChannelCache;
  var iterationCount = 0;
  for (
    var isCyclicObjectValueDetected = false;
    (__sideChannelCache = __sideChannelCache.get(sideChannelCache)) !==
      undefined && !isCyclicObjectValueDetected;

  ) {
    var cachedValue = __sideChannelCache.get(initialValue);
    iterationCount += 1;
    if (cachedValue !== undefined) {
      if (cachedValue === iterationCount) {
        throw new RangeError("Cyclic object value");
      }
      isCyclicObjectValueDetected = true;
    }
    if (__sideChannelCache.get(sideChannelCache) === undefined) {
      iterationCount = 0;
    }
  }
  if (typeof valueProcessor == "function") {
    processedValue = valueProcessor(currentValue, processedValue);
  } else if (processedValue instanceof Date) {
    processedValue = dateFormatterFunction(processedValue);
  } else if (separatorType === "comma" && isArrayFunction(processedValue)) {
    processedValue = utils.maybeMap(processedValue, function (inputDate) {
      if (inputDate instanceof Date) {
        return dateFormatterFunction(inputDate);
      } else {
        return inputDate;
      }
    });
  }
  if (processedValue === null) {
    if (isProcessing) {
      if (encoderFunction && !isEncoderFunctionActive) {
        return encoderFunction(
          currentValue,
          defaultQueryConfig.encoder,
          encoderKey,
          "key",
          keyParameter,
        );
      } else {
        return currentValue;
      }
    }
    processedValue = "";
  }
  if (isPrimitiveType(processedValue) || utils.isBuffer(processedValue)) {
    if (encoderFunction) {
      return [
        encodeValue(
          isEncoderFunctionActive
            ? currentValue
            : encoderFunction(
                currentValue,
                defaultQueryConfig.encoder,
                encoderKey,
                "key",
                keyParameter,
              ),
        ) +
          "=" +
          encodeValue(
            encoderFunction(
              processedValue,
              defaultQueryConfig.encoder,
              encoderKey,
              "value",
              keyParameter,
            ),
          ),
      ];
    } else {
      return [
        encodeValue(currentValue) + "=" + encodeValue(String(processedValue)),
      ];
    }
  }
  var processedKeys;
  var processedResults = [];
  if (processedValue === undefined) {
    return processedResults;
  }
  if (separatorType === "comma" && isArrayFunction(processedValue)) {
    if (isEncoderFunctionActive && encoderFunction) {
      processedValue = utils.maybeMap(processedValue, encoderFunction);
    }
    processedKeys = [
      {
        value:
          processedValue.length > 0
            ? processedValue.join(",") || null
            : undefined,
      },
    ];
  } else if (isArrayFunction(valueProcessor)) {
    processedKeys = valueProcessor;
  } else {
    var processedKeysArray = Object.keys(processedValue);
    if (sortFunction) {
      processedKeys = processedKeysArray.sort(sortFunction);
    } else {
      processedKeys = processedKeysArray;
    }
  }
  var encodedCurrentValue = shouldEncodeCurrentValue
    ? String(currentValue).replace(/\./g, "%2E")
    : String(currentValue);
  var encodedValueIfArray =
    separatorValue &&
    isArrayFunction(processedValue) &&
    processedValue.length === 1
      ? encodedCurrentValue + "[]"
      : encodedCurrentValue;
  if (
    isEmptyArray &&
    isArrayFunction(processedValue) &&
    processedValue.length === 0
  ) {
    return encodedValueIfArray + "[]";
  }
  for (
    var currentKeyIndex = 0;
    currentKeyIndex < processedKeys.length;
    ++currentKeyIndex
  ) {
    var currentKey = processedKeys[currentKeyIndex];
    var _currentKeyValue =
      typeof currentKey == "object" &&
      currentKey &&
      currentKey.value !== undefined
        ? currentKey.value
        : processedValue[currentKey];
    if (!excludeNullValues || _currentKeyValue !== null) {
      var currentKeyEncoded =
        isCurrentValueEncoded && shouldEncodeCurrentValue
          ? String(currentKey).replace(/\./g, "%2E")
          : String(currentKey);
      var encodedKeyValue = isArrayFunction(processedValue)
        ? typeof separatorType == "function"
          ? separatorType(encodedValueIfArray, currentKeyEncoded)
          : encodedValueIfArray
        : encodedValueIfArray +
          (isCurrentValueEncoded
            ? "." + currentKeyEncoded
            : "[" + currentKeyEncoded + "]");
      _sideChannelCache.set(initialValue, iterationCount);
      var _sideChannelInstance = createSideChannelInstance();
      _sideChannelInstance.set(sideChannelCache, _sideChannelCache);
      arrayPushToTarget(
        processedResults,
        processValue(
          _currentKeyValue,
          encodedKeyValue,
          separatorType,
          separatorValue,
          isEmptyArray,
          isProcessing,
          excludeNullValues,
          shouldEncodeCurrentValue,
          separatorType === "comma" &&
            isEncoderFunctionActive &&
            isArrayFunction(processedValue)
            ? null
            : encoderFunction,
          valueProcessor,
          sortFunction,
          isCurrentValueEncoded,
          dateFormatterFunction,
          keyParameter,
          encodeValue,
          isEncoderFunctionActive,
          encoderKey,
          _sideChannelInstance,
        ),
      );
    }
  }
  return processedResults;
};
function getQueryConfig(queryConfigOptions) {
  if (!queryConfigOptions) {
    return defaultQueryConfig;
  }
  if (
    queryConfigOptions.allowEmptyArrays !== undefined &&
    typeof queryConfigOptions.allowEmptyArrays != "boolean"
  ) {
    throw new TypeError(
      "`allowEmptyArrays` option can only be `true` or `false`, when provided",
    );
  }
  if (
    queryConfigOptions.encodeDotInKeys !== undefined &&
    typeof queryConfigOptions.encodeDotInKeys != "boolean"
  ) {
    throw new TypeError(
      "`encodeDotInKeys` option can only be `true` or `false`, when provided",
    );
  }
  if (
    queryConfigOptions.encoder !== null &&
    queryConfigOptions.encoder !== undefined &&
    typeof queryConfigOptions.encoder != "function"
  ) {
    throw new TypeError("Encoder has to be a function.");
  }
  var charset = queryConfigOptions.charset || defaultQueryConfig.charset;
  if (
    queryConfigOptions.charset !== undefined &&
    queryConfigOptions.charset !== "utf-8" &&
    queryConfigOptions.charset !== "iso-8859-1"
  ) {
    throw new TypeError(
      "The charset option must be either utf-8, iso-8859-1, or undefined",
    );
  }
  var selectedFormat = formatModule.default;
  if (queryConfigOptions.format !== undefined) {
    if (
      !_hasOwnProperty.call(formatModule.formatters, queryConfigOptions.format)
    ) {
      throw new TypeError("Unknown format option provided.");
    }
    selectedFormat = queryConfigOptions.format;
  }
  var selectedArrayFormat;
  var selectedFormatter = formatModule.formatters[selectedFormat];
  var filterFunction = defaultQueryConfig.filter;
  if (
    typeof queryConfigOptions.filter == "function" ||
    isArrayFunction(queryConfigOptions.filter)
  ) {
    filterFunction = queryConfigOptions.filter;
  }
  if (queryConfigOptions.arrayFormat in arrayFormatFunctions) {
    selectedArrayFormat = queryConfigOptions.arrayFormat;
  } else if ("indices" in queryConfigOptions) {
    if (queryConfigOptions.indices) {
      selectedArrayFormat = "indices";
    } else {
      selectedArrayFormat = "repeat";
    }
  } else {
    selectedArrayFormat = defaultQueryConfig.arrayFormat;
  }
  if (
    "commaRoundTrip" in queryConfigOptions &&
    typeof queryConfigOptions.commaRoundTrip != "boolean"
  ) {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  var allowDots =
    queryConfigOptions.allowDots === undefined
      ? queryConfigOptions.encodeDotInKeys === true ||
        defaultQueryConfig.allowDots
      : !!queryConfigOptions.allowDots;
  return {
    addQueryPrefix:
      typeof queryConfigOptions.addQueryPrefix == "boolean"
        ? queryConfigOptions.addQueryPrefix
        : defaultQueryConfig.addQueryPrefix,
    allowDots: allowDots,
    allowEmptyArrays:
      typeof queryConfigOptions.allowEmptyArrays == "boolean"
        ? !!queryConfigOptions.allowEmptyArrays
        : defaultQueryConfig.allowEmptyArrays,
    arrayFormat: selectedArrayFormat,
    charset: charset,
    charsetSentinel:
      typeof queryConfigOptions.charsetSentinel == "boolean"
        ? queryConfigOptions.charsetSentinel
        : defaultQueryConfig.charsetSentinel,
    commaRoundTrip: !!queryConfigOptions.commaRoundTrip,
    delimiter:
      queryConfigOptions.delimiter === undefined
        ? defaultQueryConfig.delimiter
        : queryConfigOptions.delimiter,
    encode:
      typeof queryConfigOptions.encode == "boolean"
        ? queryConfigOptions.encode
        : defaultQueryConfig.encode,
    encodeDotInKeys:
      typeof queryConfigOptions.encodeDotInKeys == "boolean"
        ? queryConfigOptions.encodeDotInKeys
        : defaultQueryConfig.encodeDotInKeys,
    encoder:
      typeof queryConfigOptions.encoder == "function"
        ? queryConfigOptions.encoder
        : defaultQueryConfig.encoder,
    encodeValuesOnly:
      typeof queryConfigOptions.encodeValuesOnly == "boolean"
        ? queryConfigOptions.encodeValuesOnly
        : defaultQueryConfig.encodeValuesOnly,
    filter: filterFunction,
    format: selectedFormat,
    formatter: selectedFormatter,
    serializeDate:
      typeof queryConfigOptions.serializeDate == "function"
        ? queryConfigOptions.serializeDate
        : defaultQueryConfig.serializeDate,
    skipNulls:
      typeof queryConfigOptions.skipNulls == "boolean"
        ? queryConfigOptions.skipNulls
        : defaultQueryConfig.skipNulls,
    sort:
      typeof queryConfigOptions.sort == "function"
        ? queryConfigOptions.sort
        : null,
    strictNullHandling:
      typeof queryConfigOptions.strictNullHandling == "boolean"
        ? queryConfigOptions.strictNullHandling
        : defaultQueryConfig.strictNullHandling,
  };
}
module.exports = function (inputObject, queryConfig) {
  var filterableKeys;
  var inputData = inputObject;
  var queryConfigSettings = getQueryConfig(queryConfig);
  if (typeof queryConfigSettings.filter == "function") {
    inputData = (0, queryConfigSettings.filter)("", inputData);
  } else if (isArrayFunction(queryConfigSettings.filter)) {
    filterableKeys = queryConfigSettings.filter;
  }
  var serializedValues = [];
  if (typeof inputData != "object" || inputData === null) {
    return "";
  }
  var arrayFormatFunction =
    arrayFormatFunctions[queryConfigSettings.arrayFormat];
  var shouldCommaRoundTrip =
    arrayFormatFunction === "comma" && queryConfigSettings.commaRoundTrip;
  filterableKeys ||= Object.keys(inputData);
  if (queryConfigSettings.sort) {
    filterableKeys.sort(queryConfigSettings.sort);
  }
  var sideChannelInstance = createSideChannelInstance();
  for (
    var filterableKeyIndex = 0;
    filterableKeyIndex < filterableKeys.length;
    ++filterableKeyIndex
  ) {
    var currentFilterableKey = filterableKeys[filterableKeyIndex];
    var currentInputValue = inputData[currentFilterableKey];
    if (!queryConfigSettings.skipNulls || currentInputValue !== null) {
      arrayPushToTarget(
        serializedValues,
        serializeValue(
          currentInputValue,
          currentFilterableKey,
          arrayFormatFunction,
          shouldCommaRoundTrip,
          queryConfigSettings.allowEmptyArrays,
          queryConfigSettings.strictNullHandling,
          queryConfigSettings.skipNulls,
          queryConfigSettings.encodeDotInKeys,
          queryConfigSettings.encode ? queryConfigSettings.encoder : null,
          queryConfigSettings.filter,
          queryConfigSettings.sort,
          queryConfigSettings.allowDots,
          queryConfigSettings.serializeDate,
          queryConfigSettings.format,
          queryConfigSettings.formatter,
          queryConfigSettings.encodeValuesOnly,
          queryConfigSettings.charset,
          sideChannelInstance,
        ),
      );
    }
  }
  var serializedQueryString = serializedValues.join(
    queryConfigSettings.delimiter,
  );
  var queryPrefix = queryConfigSettings.addQueryPrefix === true ? "?" : "";
  if (queryConfigSettings.charsetSentinel) {
    if (queryConfigSettings.charset === "iso-8859-1") {
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
