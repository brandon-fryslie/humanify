"use strict";

var optionsObject = require("side-channel"),
  utilityFunctions = require("./utils"),
  formatHandlers = require("./formats"),
  keysList = Object.prototype.hasOwnProperty,
  arrayFormatOptions = {
    brackets: function (optionsObject) {
      return optionsObject + "[]";
    },
    comma: "comma",
    indices: function (optionsObject, utilityFunctions) {
      return optionsObject + "[" + utilityFunctions + "]";
    },
    repeat: function (optionsObject) {
      return optionsObject;
    }
  },
  isArrayCheck = Array.isArray,
  selectedFormatFunction = Array.prototype.push,
  pushToArray = function (optionsObject, utilityFunctions) {
    selectedFormatFunction.apply(optionsObject, isArrayCheck(utilityFunctions) ? utilityFunctions : [utilityFunctions]);
  },
  formattingFunction = Date.prototype.toISOString,
  queryStringParameters = formatHandlers.default,
  queryStringConfig = {
    addQueryPrefix: !1,
    allowDots: !1,
    allowEmptyArrays: !1,
    arrayFormat: "indices",
    charset: "utf-8",
    charsetSentinel: !1,
    commaRoundTrip: !1,
    delimiter: "&",
    encode: !0,
    encodeDotInKeys: !1,
    encoder: utilityFunctions.encode,
    encodeValuesOnly: !1,
    filter: void 0,
    format: queryStringParameters,
    formatter: formatHandlers.formatters[queryStringParameters],
    indices: !1,
    serializeDate: function (optionsObject) {
      return formattingFunction.call(optionsObject);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isBasicDataType = function (optionsObject) {
    return "string" == typeof optionsObject || "number" == typeof optionsObject || "boolean" == typeof optionsObject || "symbol" == typeof optionsObject || "bigint" == typeof optionsObject;
  },
  circularReferenceMap = {},
  processNestedObject = function formatHandlers(keysList, arrayFormatOptions, selectedFormatFunction, formattingFunction, queryStringParameters, processNestedObject, allowEmptyArraysSetting, currentKeyIndex, currentKey, filteredValue, formattedQueryString, _currentKeyIndex, dateFormatter, _circularReferenceTracker, objectTraversalDepth, currentObjectValue, _objectTraversalDepth, targetObject) {
    for (var currentObjectReference = keysList, _currentObjectValue = targetObject, currentIterationIndex = 0, hasCyclicReference = !1; void 0 !== (_currentObjectValue = _currentObjectValue.get(circularReferenceMap)) && !hasCyclicReference;) {
      var __currentObjectValue = _currentObjectValue.get(keysList);
      if (currentIterationIndex += 1, void 0 !== __currentObjectValue) {
        if (__currentObjectValue === currentIterationIndex) throw new RangeError("Cyclic object value");
        hasCyclicReference = !0;
      }
      void 0 === _currentObjectValue.get(circularReferenceMap) && (currentIterationIndex = 0);
    }
    if ("function" == typeof filteredValue ? currentObjectReference = filteredValue(arrayFormatOptions, currentObjectReference) : currentObjectReference instanceof Date ? currentObjectReference = dateFormatter(currentObjectReference) : "comma" === selectedFormatFunction && isArrayCheck(currentObjectReference) && (currentObjectReference = utilityFunctions.maybeMap(currentObjectReference, function (optionsObject) {
      return optionsObject instanceof Date ? dateFormatter(optionsObject) : optionsObject;
    })), null === currentObjectReference) {
      if (processNestedObject) return currentKey && !currentObjectValue ? currentKey(arrayFormatOptions, queryStringConfig.encoder, _objectTraversalDepth, "key", _circularReferenceTracker) : arrayFormatOptions;
      currentObjectReference = "";
    }
    if (isBasicDataType(currentObjectReference) || utilityFunctions.isBuffer(currentObjectReference)) return currentKey ? [objectTraversalDepth(currentObjectValue ? arrayFormatOptions : currentKey(arrayFormatOptions, queryStringConfig.encoder, _objectTraversalDepth, "key", _circularReferenceTracker)) + "=" + objectTraversalDepth(currentKey(currentObjectReference, queryStringConfig.encoder, _objectTraversalDepth, "value", _circularReferenceTracker))] : [objectTraversalDepth(arrayFormatOptions) + "=" + objectTraversalDepth(String(currentObjectReference))];
    var mappedKeyValuePairs,
      mappedResultArray = [];
    if (void 0 === currentObjectReference) return mappedResultArray;
    if ("comma" === selectedFormatFunction && isArrayCheck(currentObjectReference)) currentObjectValue && currentKey && (currentObjectReference = utilityFunctions.maybeMap(currentObjectReference, currentKey)), mappedKeyValuePairs = [{
      value: currentObjectReference.length > 0 ? currentObjectReference.join(",") || null : void 0
    }];else if (isArrayCheck(filteredValue)) mappedKeyValuePairs = filteredValue;else {
      var currentObjectKeys = Object.keys(currentObjectReference);
      mappedKeyValuePairs = formattedQueryString ? currentObjectKeys.sort(formattedQueryString) : currentObjectKeys;
    }
    var _formattedKey = currentKeyIndex ? String(arrayFormatOptions).replace(/\./g, "%2E") : String(arrayFormatOptions),
      encodedArrayPath = formattingFunction && isArrayCheck(currentObjectReference) && 1 === currentObjectReference.length ? _formattedKey + "[]" : _formattedKey;
    if (queryStringParameters && isArrayCheck(currentObjectReference) && 0 === currentObjectReference.length) return encodedArrayPath + "[]";
    for (var mappedValueIndex = 0; mappedValueIndex < mappedKeyValuePairs.length; ++mappedValueIndex) {
      var mappedValueKey = mappedKeyValuePairs[mappedValueIndex],
        resolvedValue = "object" == typeof mappedValueKey && mappedValueKey && void 0 !== mappedValueKey.value ? mappedValueKey.value : currentObjectReference[mappedValueKey];
      if (!allowEmptyArraysSetting || null !== resolvedValue) {
        var formattedPropertyName = _currentKeyIndex && currentKeyIndex ? String(mappedValueKey).replace(/\./g, "%2E") : String(mappedValueKey),
          formattedPropertyKey = isArrayCheck(currentObjectReference) ? "function" == typeof selectedFormatFunction ? selectedFormatFunction(encodedArrayPath, formattedPropertyName) : encodedArrayPath : encodedArrayPath + (_currentKeyIndex ? "." + formattedPropertyName : "[" + formattedPropertyName + "]");
        targetObject.set(keysList, currentIterationIndex);
        var sideChannelElement = optionsObject();
        sideChannelElement.set(circularReferenceMap, targetObject), pushToArray(mappedResultArray, formatHandlers(resolvedValue, formattedPropertyKey, selectedFormatFunction, formattingFunction, queryStringParameters, processNestedObject, allowEmptyArraysSetting, currentKeyIndex, "comma" === selectedFormatFunction && currentObjectValue && isArrayCheck(currentObjectReference) ? null : currentKey, filteredValue, formattedQueryString, _currentKeyIndex, dateFormatter, _circularReferenceTracker, objectTraversalDepth, currentObjectValue, _objectTraversalDepth, sideChannelElement));
      }
    }
    return mappedResultArray;
  },
  allowEmptyArraysSetting = function (optionsObject) {
    if (!optionsObject) return queryStringConfig;
    if (void 0 !== optionsObject.allowEmptyArrays && "boolean" != typeof optionsObject.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== optionsObject.encodeDotInKeys && "boolean" != typeof optionsObject.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== optionsObject.encoder && void 0 !== optionsObject.encoder && "function" != typeof optionsObject.encoder) throw new TypeError("Encoder has to be a function.");
    var utilityFunctions = optionsObject.charset || queryStringConfig.charset;
    if (void 0 !== optionsObject.charset && "utf-8" !== optionsObject.charset && "iso-8859-1" !== optionsObject.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var selectedFormatFunction = formatHandlers.default;
    if (void 0 !== optionsObject.format) {
      if (!keysList.call(formatHandlers.formatters, optionsObject.format)) throw new TypeError("Unknown format option provided.");
      selectedFormatFunction = optionsObject.format;
    }
    var pushToArray,
      formattingFunction = formatHandlers.formatters[selectedFormatFunction],
      queryStringParameters = queryStringConfig.filter;
    if (("function" == typeof optionsObject.filter || isArrayCheck(optionsObject.filter)) && (queryStringParameters = optionsObject.filter), pushToArray = optionsObject.arrayFormat in arrayFormatOptions ? optionsObject.arrayFormat : "indices" in optionsObject ? optionsObject.indices ? "indices" : "repeat" : queryStringConfig.arrayFormat, "commaRoundTrip" in optionsObject && "boolean" != typeof optionsObject.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isBasicDataType = void 0 === optionsObject.allowDots ? !0 === optionsObject.encodeDotInKeys || queryStringConfig.allowDots : !!optionsObject.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof optionsObject.addQueryPrefix ? optionsObject.addQueryPrefix : queryStringConfig.addQueryPrefix,
      allowDots: isBasicDataType,
      allowEmptyArrays: "boolean" == typeof optionsObject.allowEmptyArrays ? !!optionsObject.allowEmptyArrays : queryStringConfig.allowEmptyArrays,
      arrayFormat: pushToArray,
      charset: utilityFunctions,
      charsetSentinel: "boolean" == typeof optionsObject.charsetSentinel ? optionsObject.charsetSentinel : queryStringConfig.charsetSentinel,
      commaRoundTrip: !!optionsObject.commaRoundTrip,
      delimiter: void 0 === optionsObject.delimiter ? queryStringConfig.delimiter : optionsObject.delimiter,
      encode: "boolean" == typeof optionsObject.encode ? optionsObject.encode : queryStringConfig.encode,
      encodeDotInKeys: "boolean" == typeof optionsObject.encodeDotInKeys ? optionsObject.encodeDotInKeys : queryStringConfig.encodeDotInKeys,
      encoder: "function" == typeof optionsObject.encoder ? optionsObject.encoder : queryStringConfig.encoder,
      encodeValuesOnly: "boolean" == typeof optionsObject.encodeValuesOnly ? optionsObject.encodeValuesOnly : queryStringConfig.encodeValuesOnly,
      filter: queryStringParameters,
      format: selectedFormatFunction,
      formatter: formattingFunction,
      serializeDate: "function" == typeof optionsObject.serializeDate ? optionsObject.serializeDate : queryStringConfig.serializeDate,
      skipNulls: "boolean" == typeof optionsObject.skipNulls ? optionsObject.skipNulls : queryStringConfig.skipNulls,
      sort: "function" == typeof optionsObject.sort ? optionsObject.sort : null,
      strictNullHandling: "boolean" == typeof optionsObject.strictNullHandling ? optionsObject.strictNullHandling : queryStringConfig.strictNullHandling
    };
  };
module.exports = function (utilityFunctions, formatHandlers) {
  var keysList,
    selectedFormatFunction = utilityFunctions,
    formattingFunction = allowEmptyArraysSetting(formatHandlers);
  "function" == typeof formattingFunction.filter ? selectedFormatFunction = (0, formattingFunction.filter)("", selectedFormatFunction) : isArrayCheck(formattingFunction.filter) && (keysList = formattingFunction.filter);
  var queryStringParameters = [];
  if ("object" != typeof selectedFormatFunction || null === selectedFormatFunction) return "";
  var queryStringConfig = arrayFormatOptions[formattingFunction.arrayFormat],
    isBasicDataType = "comma" === queryStringConfig && formattingFunction.commaRoundTrip;
  keysList || (keysList = Object.keys(selectedFormatFunction)), formattingFunction.sort && keysList.sort(formattingFunction.sort);
  for (var circularReferenceMap = optionsObject(), currentKeyIndex = 0; currentKeyIndex < keysList.length; ++currentKeyIndex) {
    var currentKey = keysList[currentKeyIndex],
      filteredValue = selectedFormatFunction[currentKey];
    formattingFunction.skipNulls && null === filteredValue || pushToArray(queryStringParameters, processNestedObject(filteredValue, currentKey, queryStringConfig, isBasicDataType, formattingFunction.allowEmptyArrays, formattingFunction.strictNullHandling, formattingFunction.skipNulls, formattingFunction.encodeDotInKeys, formattingFunction.encode ? formattingFunction.encoder : null, formattingFunction.filter, formattingFunction.sort, formattingFunction.allowDots, formattingFunction.serializeDate, formattingFunction.format, formattingFunction.formatter, formattingFunction.encodeValuesOnly, formattingFunction.charset, circularReferenceMap));
  }
  var formattedQueryString = queryStringParameters.join(formattingFunction.delimiter),
    _currentKeyIndex = !0 === formattingFunction.addQueryPrefix ? "?" : "";
  return formattingFunction.charsetSentinel && ("iso-8859-1" === formattingFunction.charset ? _currentKeyIndex += "utf8=%26%2310003%3B&" : _currentKeyIndex += "utf8=%E2%9C%93&"), formattedQueryString.length > 0 ? _currentKeyIndex + formattedQueryString : "";
};