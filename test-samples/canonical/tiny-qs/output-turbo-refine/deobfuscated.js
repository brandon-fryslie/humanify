"use strict";

var createSideChannelInstance = require("side-channel");
var utilityFunctions = require("./utils");
var formatsModule = require("./formats");
var __hasOwnProperty = Object.prototype.hasOwnProperty;
var arrayFormatHandlers = {
  brackets: function (_____inputValue) {
    return _____inputValue + "[]";
  },
  comma: "comma",
  indices: function (arrayElement, elementIndex) {
    return arrayElement + "[" + elementIndex + "]";
  },
  repeat: function (_eventObject) {
    return _eventObject;
  },
};
var checkIfArray = Array.isArray;
var arrayPushFunction = Array.prototype.push;
function applyElementsToTarget(targetElement, arrayElements) {
  arrayPushFunction.apply(
    targetElement,
    checkIfArray(arrayElements) ? arrayElements : [arrayElements],
  );
}
var _dateToIsoString = Date.prototype.toISOString;
var defaultQueryFormat = formatsModule.default;
var defaultQueryOptions = {
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
  encoder: utilityFunctions.encode,
  encodeValuesOnly: false,
  filter: undefined,
  format: defaultQueryFormat,
  formatter: formatsModule.formatters[defaultQueryFormat],
  indices: false,
  serializeDate: function (eventObject) {
    return _dateToIsoString.call(eventObject);
  },
  skipNulls: false,
  strictNullHandling: false,
};
function checkIfPrimitiveType(primitiveInputValue) {
  return (
    typeof primitiveInputValue == "string" ||
    typeof primitiveInputValue == "number" ||
    typeof primitiveInputValue == "boolean" ||
    typeof primitiveInputValue == "symbol" ||
    typeof primitiveInputValue == "bigint"
  );
}
var cyclicReferenceMap = {};
var processInputData = function processInputValue(
  inputData,
  inputKey,
  arraySeparatorOrTransformFunction,
  isDataArray,
  appendEmptyArrayIfRequired,
  isValueNullOrUndefined,
  skipNullValues,
  shouldUrlEncode,
  keyEncoderCallback,
  valueTransformer,
  sortingFunction,
  isKeyBeingAppended,
  dateToIsoString,
  cyclicReferenceTracker,
  encodeUriComponent,
  isKeyEncoderFunctionUsed,
  keyEncoderFunction,
  cyclicReferenceTrackerMap,
) {
  var processedInputValue = inputData;
  var _cyclicReferenceTrackerMap = cyclicReferenceTrackerMap;
  var cyclicReferenceDepth = 0;
  for (
    var hasCyclicReference = false;
    (_cyclicReferenceTrackerMap =
      _cyclicReferenceTrackerMap.get(cyclicReferenceMap)) !== undefined &&
    !hasCyclicReference;

  ) {
    var inputDataResult = _cyclicReferenceTrackerMap.get(inputData);
    cyclicReferenceDepth += 1;
    if (inputDataResult !== undefined) {
      if (inputDataResult === cyclicReferenceDepth) {
        throw new RangeError("Cyclic object value");
      }
      hasCyclicReference = true;
    }
    if (_cyclicReferenceTrackerMap.get(cyclicReferenceMap) === undefined) {
      cyclicReferenceDepth = 0;
    }
  }
  if (typeof valueTransformer == "function") {
    processedInputValue = valueTransformer(inputKey, processedInputValue);
  } else if (processedInputValue instanceof Date) {
    processedInputValue = dateToIsoString(processedInputValue);
  } else if (
    arraySeparatorOrTransformFunction === "comma" &&
    checkIfArray(processedInputValue)
  ) {
    processedInputValue = utilityFunctions.maybeMap(
      processedInputValue,
      function (inputDateValue) {
        if (inputDateValue instanceof Date) {
          return dateToIsoString(inputDateValue);
        } else {
          return inputDateValue;
        }
      },
    );
  }
  if (processedInputValue === null) {
    if (isValueNullOrUndefined) {
      if (keyEncoderCallback && !isKeyEncoderFunctionUsed) {
        return keyEncoderCallback(
          inputKey,
          defaultQueryOptions.encoder,
          keyEncoderFunction,
          "key",
          cyclicReferenceTracker,
        );
      } else {
        return inputKey;
      }
    }
    processedInputValue = "";
  }
  if (
    checkIfPrimitiveType(processedInputValue) ||
    utilityFunctions.isBuffer(processedInputValue)
  ) {
    if (keyEncoderCallback) {
      return [
        encodeUriComponent(
          isKeyEncoderFunctionUsed
            ? inputKey
            : keyEncoderCallback(
                inputKey,
                defaultQueryOptions.encoder,
                keyEncoderFunction,
                "key",
                cyclicReferenceTracker,
              ),
        ) +
          "=" +
          encodeUriComponent(
            keyEncoderCallback(
              processedInputValue,
              defaultQueryOptions.encoder,
              keyEncoderFunction,
              "value",
              cyclicReferenceTracker,
            ),
          ),
      ];
    } else {
      return [
        encodeUriComponent(inputKey) +
          "=" +
          encodeUriComponent(String(processedInputValue)),
      ];
    }
  }
  var keysOrTransformedValues;
  var processedOutputArray = [];
  if (processedInputValue === undefined) {
    return processedOutputArray;
  }
  if (
    arraySeparatorOrTransformFunction === "comma" &&
    checkIfArray(processedInputValue)
  ) {
    if (isKeyEncoderFunctionUsed && keyEncoderCallback) {
      processedInputValue = utilityFunctions.maybeMap(
        processedInputValue,
        keyEncoderCallback,
      );
    }
    keysOrTransformedValues = [
      {
        value:
          processedInputValue.length > 0
            ? processedInputValue.join(",") || null
            : undefined,
      },
    ];
  } else if (checkIfArray(valueTransformer)) {
    keysOrTransformedValues = valueTransformer;
  } else {
    var objectKeysSortedOrTransformed = Object.keys(processedInputValue);
    if (sortingFunction) {
      keysOrTransformedValues =
        objectKeysSortedOrTransformed.sort(sortingFunction);
    } else {
      keysOrTransformedValues = objectKeysSortedOrTransformed;
    }
  }
  var urlEncodedInputKey = shouldUrlEncode
    ? String(inputKey).replace(/\./g, "%2E")
    : String(inputKey);
  var encodedKeyWithArrayIndicator =
    isDataArray &&
    checkIfArray(processedInputValue) &&
    processedInputValue.length === 1
      ? urlEncodedInputKey + "[]"
      : urlEncodedInputKey;
  if (
    appendEmptyArrayIfRequired &&
    checkIfArray(processedInputValue) &&
    processedInputValue.length === 0
  ) {
    return encodedKeyWithArrayIndicator + "[]";
  }
  for (
    var currentIterationIndex = 0;
    currentIterationIndex < keysOrTransformedValues.length;
    ++currentIterationIndex
  ) {
    var currentKeyOrValue = keysOrTransformedValues[currentIterationIndex];
    var processedValue =
      typeof currentKeyOrValue == "object" &&
      currentKeyOrValue &&
      currentKeyOrValue.value !== undefined
        ? currentKeyOrValue.value
        : processedInputValue[currentKeyOrValue];
    if (!skipNullValues || processedValue !== null) {
      var escapedFormattedValue =
        isKeyBeingAppended && shouldUrlEncode
          ? String(currentKeyOrValue).replace(/\./g, "%2E")
          : String(currentKeyOrValue);
      var formattedKey = checkIfArray(processedInputValue)
        ? typeof arraySeparatorOrTransformFunction == "function"
          ? arraySeparatorOrTransformFunction(
              encodedKeyWithArrayIndicator,
              escapedFormattedValue,
            )
          : encodedKeyWithArrayIndicator
        : encodedKeyWithArrayIndicator +
          (isKeyBeingAppended
            ? "." + escapedFormattedValue
            : "[" + escapedFormattedValue + "]");
      cyclicReferenceTrackerMap.set(inputData, cyclicReferenceDepth);
      var _sideChannelInstance = createSideChannelInstance();
      _sideChannelInstance.set(cyclicReferenceMap, cyclicReferenceTrackerMap);
      applyElementsToTarget(
        processedOutputArray,
        processInputValue(
          processedValue,
          formattedKey,
          arraySeparatorOrTransformFunction,
          isDataArray,
          appendEmptyArrayIfRequired,
          isValueNullOrUndefined,
          skipNullValues,
          shouldUrlEncode,
          arraySeparatorOrTransformFunction === "comma" &&
            isKeyEncoderFunctionUsed &&
            checkIfArray(processedInputValue)
            ? null
            : keyEncoderCallback,
          valueTransformer,
          sortingFunction,
          isKeyBeingAppended,
          dateToIsoString,
          cyclicReferenceTracker,
          encodeUriComponent,
          isKeyEncoderFunctionUsed,
          keyEncoderFunction,
          _sideChannelInstance,
        ),
      );
    }
  }
  return processedOutputArray;
};
function processQueryParameters(queryParameters) {
  if (!queryParameters) {
    return defaultQueryOptions;
  }
  if (
    queryParameters.allowEmptyArrays !== undefined &&
    typeof queryParameters.allowEmptyArrays != "boolean"
  ) {
    throw new TypeError(
      "`allowEmptyArrays` option can only be `true` or `false`, when provided",
    );
  }
  if (
    queryParameters.encodeDotInKeys !== undefined &&
    typeof queryParameters.encodeDotInKeys != "boolean"
  ) {
    throw new TypeError(
      "`encodeDotInKeys` option can only be `true` or `false`, when provided",
    );
  }
  if (
    queryParameters.encoder !== null &&
    queryParameters.encoder !== undefined &&
    typeof queryParameters.encoder != "function"
  ) {
    throw new TypeError("Encoder has to be a function.");
  }
  var selectedCharset = queryParameters.charset || defaultQueryOptions.charset;
  if (
    queryParameters.charset !== undefined &&
    queryParameters.charset !== "utf-8" &&
    queryParameters.charset !== "iso-8859-1"
  ) {
    throw new TypeError(
      "The charset option must be either utf-8, iso-8859-1, or undefined",
    );
  }
  var selectedQueryFormat = formatsModule.default;
  if (queryParameters.format !== undefined) {
    if (
      !__hasOwnProperty.call(formatsModule.formatters, queryParameters.format)
    ) {
      throw new TypeError("Unknown format option provided.");
    }
    selectedQueryFormat = queryParameters.format;
  }
  var arrayFormatPreference;
  var queryFormatterFunction = formatsModule.formatters[selectedQueryFormat];
  var queryFilterFunction = defaultQueryOptions.filter;
  if (
    typeof queryParameters.filter == "function" ||
    checkIfArray(queryParameters.filter)
  ) {
    queryFilterFunction = queryParameters.filter;
  }
  if (queryParameters.arrayFormat in arrayFormatHandlers) {
    arrayFormatPreference = queryParameters.arrayFormat;
  } else if ("indices" in queryParameters) {
    if (queryParameters.indices) {
      arrayFormatPreference = "indices";
    } else {
      arrayFormatPreference = "repeat";
    }
  } else {
    arrayFormatPreference = defaultQueryOptions.arrayFormat;
  }
  if (
    "commaRoundTrip" in queryParameters &&
    typeof queryParameters.commaRoundTrip != "boolean"
  ) {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  var isDotsAllowed =
    queryParameters.allowDots === undefined
      ? queryParameters.encodeDotInKeys === true ||
        defaultQueryOptions.allowDots
      : !!queryParameters.allowDots;
  return {
    addQueryPrefix:
      typeof queryParameters.addQueryPrefix == "boolean"
        ? queryParameters.addQueryPrefix
        : defaultQueryOptions.addQueryPrefix,
    allowDots: isDotsAllowed,
    allowEmptyArrays:
      typeof queryParameters.allowEmptyArrays == "boolean"
        ? !!queryParameters.allowEmptyArrays
        : defaultQueryOptions.allowEmptyArrays,
    arrayFormat: arrayFormatPreference,
    charset: selectedCharset,
    charsetSentinel:
      typeof queryParameters.charsetSentinel == "boolean"
        ? queryParameters.charsetSentinel
        : defaultQueryOptions.charsetSentinel,
    commaRoundTrip: !!queryParameters.commaRoundTrip,
    delimiter:
      queryParameters.delimiter === undefined
        ? defaultQueryOptions.delimiter
        : queryParameters.delimiter,
    encode:
      typeof queryParameters.encode == "boolean"
        ? queryParameters.encode
        : defaultQueryOptions.encode,
    encodeDotInKeys:
      typeof queryParameters.encodeDotInKeys == "boolean"
        ? queryParameters.encodeDotInKeys
        : defaultQueryOptions.encodeDotInKeys,
    encoder:
      typeof queryParameters.encoder == "function"
        ? queryParameters.encoder
        : defaultQueryOptions.encoder,
    encodeValuesOnly:
      typeof queryParameters.encodeValuesOnly == "boolean"
        ? queryParameters.encodeValuesOnly
        : defaultQueryOptions.encodeValuesOnly,
    filter: queryFilterFunction,
    format: selectedQueryFormat,
    formatter: queryFormatterFunction,
    serializeDate:
      typeof queryParameters.serializeDate == "function"
        ? queryParameters.serializeDate
        : defaultQueryOptions.serializeDate,
    skipNulls:
      typeof queryParameters.skipNulls == "boolean"
        ? queryParameters.skipNulls
        : defaultQueryOptions.skipNulls,
    sort:
      typeof queryParameters.sort == "function" ? queryParameters.sort : null,
    strictNullHandling:
      typeof queryParameters.strictNullHandling == "boolean"
        ? queryParameters.strictNullHandling
        : defaultQueryOptions.strictNullHandling,
  };
}
module.exports = function (inputDataObject, _queryParametersConfig) {
  var selectedFilterKeys;
  var _inputDataObject = inputDataObject;
  var __queryParameters = processQueryParameters(_queryParametersConfig);
  if (typeof __queryParameters.filter == "function") {
    _inputDataObject = (0, __queryParameters.filter)("", _inputDataObject);
  } else if (checkIfArray(__queryParameters.filter)) {
    selectedFilterKeys = __queryParameters.filter;
  }
  var queryParamList = [];
  if (typeof _inputDataObject != "object" || _inputDataObject === null) {
    return "";
  }
  var arrayFormatHandler = arrayFormatHandlers[__queryParameters.arrayFormat];
  var isCommaSeparatedRoundTrip =
    arrayFormatHandler === "comma" && __queryParameters.commaRoundTrip;
  selectedFilterKeys ||= Object.keys(_inputDataObject);
  if (__queryParameters.sort) {
    selectedFilterKeys.sort(__queryParameters.sort);
  }
  var sideChannelInstance = createSideChannelInstance();
  for (
    var filterKeyIndex = 0;
    filterKeyIndex < selectedFilterKeys.length;
    ++filterKeyIndex
  ) {
    var activeFilterKey = selectedFilterKeys[filterKeyIndex];
    var activeFilterValue = _inputDataObject[activeFilterKey];
    if (!__queryParameters.skipNulls || activeFilterValue !== null) {
      applyElementsToTarget(
        queryParamList,
        processInputData(
          activeFilterValue,
          activeFilterKey,
          arrayFormatHandler,
          isCommaSeparatedRoundTrip,
          __queryParameters.allowEmptyArrays,
          __queryParameters.strictNullHandling,
          __queryParameters.skipNulls,
          __queryParameters.encodeDotInKeys,
          __queryParameters.encode ? __queryParameters.encoder : null,
          __queryParameters.filter,
          __queryParameters.sort,
          __queryParameters.allowDots,
          __queryParameters.serializeDate,
          __queryParameters.format,
          __queryParameters.formatter,
          __queryParameters.encodeValuesOnly,
          __queryParameters.charset,
          sideChannelInstance,
        ),
      );
    }
  }
  var formattedQueryString = queryParamList.join(__queryParameters.delimiter);
  var queryStringPrefix = __queryParameters.addQueryPrefix === true ? "?" : "";
  if (__queryParameters.charsetSentinel) {
    if (__queryParameters.charset === "iso-8859-1") {
      queryStringPrefix += "utf8=%26%2310003%3B&";
    } else {
      queryStringPrefix += "utf8=%E2%9C%93&";
    }
  }
  if (formattedQueryString.length > 0) {
    return queryStringPrefix + formattedQueryString;
  } else {
    return "";
  }
};
