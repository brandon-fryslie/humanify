"use strict";

var sideChannelUtils = require("side-channel"),
  utilityFunctions = require("./utils"),
  formatHandlers = require("./formats"),
  hasOwnPropertyCheck = Object.prototype.hasOwnProperty,
  arrayIndexingMethods = {
    brackets: function (inputValue) {
      return inputValue + "[]";
    },
    comma: "comma",
    indices: function (e, indexValue) {
      return e + "[" + indexValue + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArrayCheck = Array.isArray,
  arrayAppend = Array.prototype.push,
  pushToArray = function (e, r) {
    arrayAppend.apply(e, isArrayCheck(r) ? r : [r]);
  },
  dateToISOStringFunction = Date.prototype.toISOString,
  defaultQueryStringFormatOptions = formatHandlers.default,
  queryStringHandlingOptions = {
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
    format: defaultQueryStringFormatOptions,
    formatter: formatHandlers.formatters[defaultQueryStringFormatOptions],
    indices: !1,
    serializeDate: function (e) {
      return dateToISOStringFunction.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isBasicDataType = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  cyclicReferenceTracker = {},
  processNestedObject = function inputOptions(_filteredKeys, _currentIndex, indexInArray, allowEmptyArraysOptionResult, _resultArray, objectTraversal, _allowEmptyArraysOption, currentIndexInArray, currentIndex, _currentValue, queryStringParameters, queryParameterPrefix, dateFormatter, circularReferenceMap, objectDepth, objectTraversalDepth, _objectTraversalDepth, objectToProcess) {
    for (var initialObjectState = _filteredKeys, trackedObject = objectToProcess, currentIterationCount = 0, isCyclicReferenceDetected = !1; void 0 !== (trackedObject = trackedObject.get(circularReferenceMap)) && !isCyclicReferenceDetected;) {
      var __objectTraversalDepth = trackedObject.get(_filteredKeys);
      if (currentIterationCount += 1, void 0 !== __objectTraversalDepth) {
        if (__objectTraversalDepth === currentIterationCount) throw new RangeError("Cyclic object value");
        isCyclicReferenceDetected = !0;
      }
      void 0 === trackedObject.get(circularReferenceMap) && (currentIterationCount = 0);
    }
    if ("function" == typeof _currentValue ? initialObjectState = _currentValue(_currentIndex, initialObjectState) : initialObjectState instanceof Date ? initialObjectState = dateFormatter(initialObjectState) : "comma" === indexInArray && isArrayCheck(initialObjectState) && (initialObjectState = utilityFunctions.maybeMap(initialObjectState, function (e) {
      return e instanceof Date ? dateFormatter(e) : e;
    })), null === initialObjectState) {
      if (objectTraversal) return currentIndex && !objectTraversalDepth ? currentIndex(_currentIndex, queryStringHandlingOptions.encoder, _objectTraversalDepth, "key", circularReferenceMap) : _currentIndex;
      initialObjectState = "";
    }
    if (isBasicDataType(initialObjectState) || utilityFunctions.isBuffer(initialObjectState)) return currentIndex ? [objectDepth(objectTraversalDepth ? _currentIndex : currentIndex(_currentIndex, queryStringHandlingOptions.encoder, _objectTraversalDepth, "key", circularReferenceMap)) + "=" + objectDepth(currentIndex(initialObjectState, queryStringHandlingOptions.encoder, _objectTraversalDepth, "value", circularReferenceMap))] : [objectDepth(_currentIndex) + "=" + objectDepth(String(initialObjectState))];
    var mappedKeyValuePairs,
      mappedResults = [];
    if (void 0 === initialObjectState) return mappedResults;
    if ("comma" === indexInArray && isArrayCheck(initialObjectState)) objectTraversalDepth && currentIndex && (initialObjectState = utilityFunctions.maybeMap(initialObjectState, currentIndex)), mappedKeyValuePairs = [{
      value: initialObjectState.length > 0 ? initialObjectState.join(",") || null : void 0
    }];else if (isArrayCheck(_currentValue)) mappedKeyValuePairs = _currentValue;else {
      var objectKeys = Object.keys(initialObjectState);
      mappedKeyValuePairs = queryStringParameters ? objectKeys.sort(queryStringParameters) : objectKeys;
    }
    var _formattedKey = currentIndexInArray ? String(_currentIndex).replace(/\./g, "%2E") : String(_currentIndex),
      encodedBasePath = allowEmptyArraysOptionResult && isArrayCheck(initialObjectState) && 1 === initialObjectState.length ? _formattedKey + "[]" : _formattedKey;
    if (_resultArray && isArrayCheck(initialObjectState) && 0 === initialObjectState.length) return encodedBasePath + "[]";
    for (var mappedValueIndex = 0; mappedValueIndex < mappedKeyValuePairs.length; ++mappedValueIndex) {
      var mappedValueKey = mappedKeyValuePairs[mappedValueIndex],
        resolvedValue = "object" == typeof mappedValueKey && mappedValueKey && void 0 !== mappedValueKey.value ? mappedValueKey.value : initialObjectState[mappedValueKey];
      if (!_allowEmptyArraysOption || null !== resolvedValue) {
        var formattedPropertyName = queryParameterPrefix && currentIndexInArray ? String(mappedValueKey).replace(/\./g, "%2E") : String(mappedValueKey),
          formattedKeyPath = isArrayCheck(initialObjectState) ? "function" == typeof indexInArray ? indexInArray(encodedBasePath, formattedPropertyName) : encodedBasePath : encodedBasePath + (queryParameterPrefix ? "." + formattedPropertyName : "[" + formattedPropertyName + "]");
        objectToProcess.set(_filteredKeys, currentIterationCount);
        var initializeMapEntry = sideChannelUtils();
        initializeMapEntry.set(circularReferenceMap, objectToProcess), pushToArray(mappedResults, inputOptions(resolvedValue, formattedKeyPath, indexInArray, allowEmptyArraysOptionResult, _resultArray, objectTraversal, _allowEmptyArraysOption, currentIndexInArray, "comma" === indexInArray && objectTraversalDepth && isArrayCheck(initialObjectState) ? null : currentIndex, _currentValue, queryStringParameters, queryParameterPrefix, dateFormatter, circularReferenceMap, objectDepth, objectTraversalDepth, _objectTraversalDepth, initializeMapEntry));
      }
    }
    return mappedResults;
  },
  allowEmptyArraysSetting = function (e) {
    if (!e) return queryStringHandlingOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || queryStringHandlingOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = formatHandlers.default;
    if (void 0 !== e.format) {
      if (!hasOwnPropertyCheck.call(formatHandlers.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var arrayFormatType,
      s = formatHandlers.formatters[i],
      c = queryStringHandlingOptions.filter;
    if (("function" == typeof e.filter || isArrayCheck(e.filter)) && (c = e.filter), arrayFormatType = e.arrayFormat in arrayIndexingMethods ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : queryStringHandlingOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isCommaRoundTrip = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || queryStringHandlingOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : queryStringHandlingOptions.addQueryPrefix,
      allowDots: isCommaRoundTrip,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : queryStringHandlingOptions.allowEmptyArrays,
      arrayFormat: arrayFormatType,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : queryStringHandlingOptions.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? queryStringHandlingOptions.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : queryStringHandlingOptions.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : queryStringHandlingOptions.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : queryStringHandlingOptions.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : queryStringHandlingOptions.encodeValuesOnly,
      filter: c,
      format: i,
      formatter: s,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : queryStringHandlingOptions.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : queryStringHandlingOptions.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : queryStringHandlingOptions.strictNullHandling
    };
  };
module.exports = function (r, o) {
  var t,
    i = r,
    s = allowEmptyArraysSetting(o);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArrayCheck(s.filter) && (t = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var _queryStringOptions = arrayIndexingMethods[s.arrayFormat],
    u = "comma" === _queryStringOptions && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var _circularReferenceTracker = sideChannelUtils(), _currentIndex = 0; _currentIndex < t.length; ++_currentIndex) {
    var currentKey = t[_currentIndex],
      callbackFunction = i[currentKey];
    s.skipNulls && null === callbackFunction || pushToArray(c, processNestedObject(callbackFunction, currentKey, _queryStringOptions, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, _circularReferenceTracker));
  }
  var queryStringResult = c.join(s.delimiter),
    queryPrefix = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryPrefix += "utf8=%26%2310003%3B&" : queryPrefix += "utf8=%E2%9C%93&"), queryStringResult.length > 0 ? queryPrefix + queryStringResult : "";
};