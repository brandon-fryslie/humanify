"use strict";

var _allowEmptyArraysOption = require("side-channel"),
  utilityFunctions = require("./utils"),
  formatOptions = require("./formats"),
  filteredKeys = Object.prototype.hasOwnProperty,
  arrayFormatFunctions = {
    brackets: function (_allowEmptyArraysOption) {
      return _allowEmptyArraysOption + "[]";
    },
    comma: "comma",
    indices: function (_allowEmptyArraysOption, utilityFunctions) {
      return _allowEmptyArraysOption + "[" + utilityFunctions + "]";
    },
    repeat: function (_allowEmptyArraysOption) {
      return _allowEmptyArraysOption;
    }
  },
  isArrayCheck = Array.isArray,
  _utilityFunctions = Array.prototype.push,
  pushToArray = function (_allowEmptyArraysOption, utilityFunctions) {
    _utilityFunctions.apply(_allowEmptyArraysOption, isArrayCheck(utilityFunctions) ? utilityFunctions : [utilityFunctions]);
  },
  formattedInputData = Date.prototype.toISOString,
  formattedQueryParameters = formatOptions.default,
  arrayFormatterOptions = {
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
    format: formattedQueryParameters,
    formatter: formatOptions.formatters[formattedQueryParameters],
    indices: !1,
    serializeDate: function (_allowEmptyArraysOption) {
      return formattedInputData.call(_allowEmptyArraysOption);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isValuePrimitive = function (_allowEmptyArraysOption) {
    return "string" == typeof _allowEmptyArraysOption || "number" == typeof _allowEmptyArraysOption || "boolean" == typeof _allowEmptyArraysOption || "symbol" == typeof _allowEmptyArraysOption || "bigint" == typeof _allowEmptyArraysOption;
  },
  circularReferenceMap = {},
  handleCyclicReferences = function formatOptions(filteredKeys, arrayFormatFunctions, utilityFunctions, formattedInputData, formattedQueryParameters, handleCyclicReferences, allowEmptyArrays, filterKeyIndex, filterKey, defaultFormatValue, formattedQueryString, queryStringPrefix, dateFormatter, circularReferenceMap, currentRecursionDepth, formattedObjectValue, currentDepthLevel, currentObjectReference) {
    for (var filteredValue = filteredKeys, _currentObjectReference = currentObjectReference, currentIterationCount = 0, hasCyclicReference = !1; void 0 !== (_currentObjectReference = _currentObjectReference.get(circularReferenceMap)) && !hasCyclicReference;) {
      var _currentDepthLevel = _currentObjectReference.get(filteredKeys);
      if (currentIterationCount += 1, void 0 !== _currentDepthLevel) {
        if (_currentDepthLevel === currentIterationCount) throw new RangeError("Cyclic object value");
        hasCyclicReference = !0;
      }
      void 0 === _currentObjectReference.get(circularReferenceMap) && (currentIterationCount = 0);
    }
    if ("function" == typeof defaultFormatValue ? filteredValue = defaultFormatValue(arrayFormatFunctions, filteredValue) : filteredValue instanceof Date ? filteredValue = dateFormatter(filteredValue) : "comma" === utilityFunctions && isArrayCheck(filteredValue) && (filteredValue = utilityFunctions.maybeMap(filteredValue, function (_allowEmptyArraysOption) {
      return _allowEmptyArraysOption instanceof Date ? dateFormatter(_allowEmptyArraysOption) : _allowEmptyArraysOption;
    })), null === filteredValue) {
      if (handleCyclicReferences) return filterKey && !formattedObjectValue ? filterKey(arrayFormatFunctions, arrayFormatterOptions.encoder, currentDepthLevel, "key", circularReferenceMap) : arrayFormatFunctions;
      filteredValue = "";
    }
    if (isValuePrimitive(filteredValue) || utilityFunctions.isBuffer(filteredValue)) return filterKey ? [currentRecursionDepth(formattedObjectValue ? arrayFormatFunctions : filterKey(arrayFormatFunctions, arrayFormatterOptions.encoder, currentDepthLevel, "key", circularReferenceMap)) + "=" + currentRecursionDepth(filterKey(filteredValue, arrayFormatterOptions.encoder, currentDepthLevel, "value", circularReferenceMap))] : [currentRecursionDepth(arrayFormatFunctions) + "=" + currentRecursionDepth(String(filteredValue))];
    var mappedArrayValues,
      mappedKeys = [];
    if (void 0 === filteredValue) return mappedKeys;
    if ("comma" === utilityFunctions && isArrayCheck(filteredValue)) formattedObjectValue && filterKey && (filteredValue = utilityFunctions.maybeMap(filteredValue, filterKey)), mappedArrayValues = [{
      value: filteredValue.length > 0 ? filteredValue.join(",") || null : void 0
    }];else if (isArrayCheck(defaultFormatValue)) mappedArrayValues = defaultFormatValue;else {
      var currentValueKeys = Object.keys(filteredValue);
      mappedArrayValues = formattedQueryString ? currentValueKeys.sort(formattedQueryString) : currentValueKeys;
    }
    var _formattedKey = filterKeyIndex ? String(arrayFormatFunctions).replace(/\./g, "%2E") : String(arrayFormatFunctions),
      encodedBasePath = formattedInputData && isArrayCheck(filteredValue) && 1 === filteredValue.length ? _formattedKey + "[]" : _formattedKey;
    if (formattedQueryParameters && isArrayCheck(filteredValue) && 0 === filteredValue.length) return encodedBasePath + "[]";
    for (var mappedValueIndex = 0; mappedValueIndex < mappedArrayValues.length; ++mappedValueIndex) {
      var mappedKey = mappedArrayValues[mappedValueIndex],
        resolvedValue = "object" == typeof mappedKey && mappedKey && void 0 !== mappedKey.value ? mappedKey.value : filteredValue[mappedKey];
      if (!allowEmptyArrays || null !== resolvedValue) {
        var formattedKeyName = queryStringPrefix && filterKeyIndex ? String(mappedKey).replace(/\./g, "%2E") : String(mappedKey),
          formattedKeyPath = isArrayCheck(filteredValue) ? "function" == typeof utilityFunctions ? utilityFunctions(encodedBasePath, formattedKeyName) : encodedBasePath : encodedBasePath + (queryStringPrefix ? "." + formattedKeyName : "[" + formattedKeyName + "]");
        currentObjectReference.set(filteredKeys, currentIterationCount);
        var mapEntryCreator = _allowEmptyArraysOption();
        mapEntryCreator.set(circularReferenceMap, currentObjectReference), pushToArray(mappedKeys, formatOptions(resolvedValue, formattedKeyPath, utilityFunctions, formattedInputData, formattedQueryParameters, handleCyclicReferences, allowEmptyArrays, filterKeyIndex, "comma" === utilityFunctions && formattedObjectValue && isArrayCheck(filteredValue) ? null : filterKey, defaultFormatValue, formattedQueryString, queryStringPrefix, dateFormatter, circularReferenceMap, currentRecursionDepth, formattedObjectValue, currentDepthLevel, mapEntryCreator));
      }
    }
    return mappedKeys;
  },
  allowEmptyArrays = function (_allowEmptyArraysOption) {
    if (!_allowEmptyArraysOption) return arrayFormatterOptions;
    if (void 0 !== _allowEmptyArraysOption.allowEmptyArrays && "boolean" != typeof _allowEmptyArraysOption.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== _allowEmptyArraysOption.encodeDotInKeys && "boolean" != typeof _allowEmptyArraysOption.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== _allowEmptyArraysOption.encoder && void 0 !== _allowEmptyArraysOption.encoder && "function" != typeof _allowEmptyArraysOption.encoder) throw new TypeError("Encoder has to be a function.");
    var utilityFunctions = _allowEmptyArraysOption.charset || arrayFormatterOptions.charset;
    if (void 0 !== _allowEmptyArraysOption.charset && "utf-8" !== _allowEmptyArraysOption.charset && "iso-8859-1" !== _allowEmptyArraysOption.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var _utilityFunctions = formatOptions.default;
    if (void 0 !== _allowEmptyArraysOption.format) {
      if (!filteredKeys.call(formatOptions.formatters, _allowEmptyArraysOption.format)) throw new TypeError("Unknown format option provided.");
      _utilityFunctions = _allowEmptyArraysOption.format;
    }
    var pushToArray,
      formattedInputData = formatOptions.formatters[_utilityFunctions],
      formattedQueryParameters = arrayFormatterOptions.filter;
    if (("function" == typeof _allowEmptyArraysOption.filter || isArrayCheck(_allowEmptyArraysOption.filter)) && (formattedQueryParameters = _allowEmptyArraysOption.filter), pushToArray = _allowEmptyArraysOption.arrayFormat in arrayFormatFunctions ? _allowEmptyArraysOption.arrayFormat : "indices" in _allowEmptyArraysOption ? _allowEmptyArraysOption.indices ? "indices" : "repeat" : arrayFormatterOptions.arrayFormat, "commaRoundTrip" in _allowEmptyArraysOption && "boolean" != typeof _allowEmptyArraysOption.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isValuePrimitive = void 0 === _allowEmptyArraysOption.allowDots ? !0 === _allowEmptyArraysOption.encodeDotInKeys || arrayFormatterOptions.allowDots : !!_allowEmptyArraysOption.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof _allowEmptyArraysOption.addQueryPrefix ? _allowEmptyArraysOption.addQueryPrefix : arrayFormatterOptions.addQueryPrefix,
      allowDots: isValuePrimitive,
      allowEmptyArrays: "boolean" == typeof _allowEmptyArraysOption.allowEmptyArrays ? !!_allowEmptyArraysOption.allowEmptyArrays : arrayFormatterOptions.allowEmptyArrays,
      arrayFormat: pushToArray,
      charset: utilityFunctions,
      charsetSentinel: "boolean" == typeof _allowEmptyArraysOption.charsetSentinel ? _allowEmptyArraysOption.charsetSentinel : arrayFormatterOptions.charsetSentinel,
      commaRoundTrip: !!_allowEmptyArraysOption.commaRoundTrip,
      delimiter: void 0 === _allowEmptyArraysOption.delimiter ? arrayFormatterOptions.delimiter : _allowEmptyArraysOption.delimiter,
      encode: "boolean" == typeof _allowEmptyArraysOption.encode ? _allowEmptyArraysOption.encode : arrayFormatterOptions.encode,
      encodeDotInKeys: "boolean" == typeof _allowEmptyArraysOption.encodeDotInKeys ? _allowEmptyArraysOption.encodeDotInKeys : arrayFormatterOptions.encodeDotInKeys,
      encoder: "function" == typeof _allowEmptyArraysOption.encoder ? _allowEmptyArraysOption.encoder : arrayFormatterOptions.encoder,
      encodeValuesOnly: "boolean" == typeof _allowEmptyArraysOption.encodeValuesOnly ? _allowEmptyArraysOption.encodeValuesOnly : arrayFormatterOptions.encodeValuesOnly,
      filter: formattedQueryParameters,
      format: _utilityFunctions,
      formatter: formattedInputData,
      serializeDate: "function" == typeof _allowEmptyArraysOption.serializeDate ? _allowEmptyArraysOption.serializeDate : arrayFormatterOptions.serializeDate,
      skipNulls: "boolean" == typeof _allowEmptyArraysOption.skipNulls ? _allowEmptyArraysOption.skipNulls : arrayFormatterOptions.skipNulls,
      sort: "function" == typeof _allowEmptyArraysOption.sort ? _allowEmptyArraysOption.sort : null,
      strictNullHandling: "boolean" == typeof _allowEmptyArraysOption.strictNullHandling ? _allowEmptyArraysOption.strictNullHandling : arrayFormatterOptions.strictNullHandling
    };
  };
module.exports = function (utilityFunctions, formatOptions) {
  var filteredKeys,
    _utilityFunctions = utilityFunctions,
    formattedInputData = allowEmptyArrays(formatOptions);
  "function" == typeof formattedInputData.filter ? _utilityFunctions = (0, formattedInputData.filter)("", _utilityFunctions) : isArrayCheck(formattedInputData.filter) && (filteredKeys = formattedInputData.filter);
  var formattedQueryParameters = [];
  if ("object" != typeof _utilityFunctions || null === _utilityFunctions) return "";
  var arrayFormatterOptions = arrayFormatFunctions[formattedInputData.arrayFormat],
    isValuePrimitive = "comma" === arrayFormatterOptions && formattedInputData.commaRoundTrip;
  filteredKeys || (filteredKeys = Object.keys(_utilityFunctions)), formattedInputData.sort && filteredKeys.sort(formattedInputData.sort);
  for (var circularReferenceMap = _allowEmptyArraysOption(), filterKeyIndex = 0; filterKeyIndex < filteredKeys.length; ++filterKeyIndex) {
    var filterKey = filteredKeys[filterKeyIndex],
      defaultFormatValue = _utilityFunctions[filterKey];
    formattedInputData.skipNulls && null === defaultFormatValue || pushToArray(formattedQueryParameters, handleCyclicReferences(defaultFormatValue, filterKey, arrayFormatterOptions, isValuePrimitive, formattedInputData.allowEmptyArrays, formattedInputData.strictNullHandling, formattedInputData.skipNulls, formattedInputData.encodeDotInKeys, formattedInputData.encode ? formattedInputData.encoder : null, formattedInputData.filter, formattedInputData.sort, formattedInputData.allowDots, formattedInputData.serializeDate, formattedInputData.format, formattedInputData.formatter, formattedInputData.encodeValuesOnly, formattedInputData.charset, circularReferenceMap));
  }
  var formattedQueryString = formattedQueryParameters.join(formattedInputData.delimiter),
    queryStringPrefix = !0 === formattedInputData.addQueryPrefix ? "?" : "";
  return formattedInputData.charsetSentinel && ("iso-8859-1" === formattedInputData.charset ? queryStringPrefix += "utf8=%26%2310003%3B&" : queryStringPrefix += "utf8=%E2%9C%93&"), formattedQueryString.length > 0 ? queryStringPrefix + formattedQueryString : "";
};