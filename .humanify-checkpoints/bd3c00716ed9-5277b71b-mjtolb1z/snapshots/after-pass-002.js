"use strict";

var sideChannelHandler = require("side-channel"),
  utilityFunctions = require("./utils"),
  formatHandlers = require("./formats"),
  hasOwnPropertyCheck = Object.prototype.hasOwnProperty,
  traversalIndex = {
    brackets: function (dateSerializerFunction) {
      return dateSerializerFunction + "[]";
    },
    comma: "comma",
    indices: function (e, _utils) {
      return e + "[" + _utils + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArrayCheck = Array.isArray,
  arrayPushMethod = Array.prototype.push,
  pushToArray = function (e, r) {
    arrayPushMethod.apply(e, isArrayCheck(r) ? r : [r]);
  },
  dateToISOStringFunction = Date.prototype.toISOString,
  defaultQueryStringFormat = formatHandlers.default,
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
    format: defaultQueryStringFormat,
    formatter: formatHandlers.formatters[defaultQueryStringFormat],
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
  handleCyclicReferences = function dataObject(filterKeys, _currentIndex, selectedFormat, allowEmptyArraysOptionResult, filteredKeys, _circularReferenceHandler, _allowEmptyArraysOption, currentIndexInTraversal, objectKey, valueToProcess, queryStringParameters, queryParameterPrefix, dateFormatter, circularReferenceMap, dateSerializerFunction, objectValueToSerialize, objectTraversalDepth, traversedObject) {
    for (var _traversedObject = filterKeys, traverseObjectReferences = traversedObject, currentIndex = 0, hasCyclicReference = !1; void 0 !== (traverseObjectReferences = traverseObjectReferences.get(circularReferenceMap)) && !hasCyclicReference;) {
      var _objectTraversalDepth = traverseObjectReferences.get(filterKeys);
      if (currentIndex += 1, void 0 !== _objectTraversalDepth) {
        if (_objectTraversalDepth === currentIndex) throw new RangeError("Cyclic object value");
        hasCyclicReference = !0;
      }
      void 0 === traverseObjectReferences.get(circularReferenceMap) && (currentIndex = 0);
    }
    if ("function" == typeof valueToProcess ? _traversedObject = valueToProcess(_currentIndex, _traversedObject) : _traversedObject instanceof Date ? _traversedObject = dateFormatter(_traversedObject) : "comma" === selectedFormat && isArrayCheck(_traversedObject) && (_traversedObject = utilityFunctions.maybeMap(_traversedObject, function (e) {
      return e instanceof Date ? dateFormatter(e) : e;
    })), null === _traversedObject) {
      if (_circularReferenceHandler) return objectKey && !objectValueToSerialize ? objectKey(_currentIndex, queryStringHandlingOptions.encoder, objectTraversalDepth, "key", circularReferenceMap) : _currentIndex;
      _traversedObject = "";
    }
    if (isBasicDataType(_traversedObject) || utilityFunctions.isBuffer(_traversedObject)) return objectKey ? [dateSerializerFunction(objectValueToSerialize ? _currentIndex : objectKey(_currentIndex, queryStringHandlingOptions.encoder, objectTraversalDepth, "key", circularReferenceMap)) + "=" + dateSerializerFunction(objectKey(_traversedObject, queryStringHandlingOptions.encoder, objectTraversalDepth, "value", circularReferenceMap))] : [dateSerializerFunction(_currentIndex) + "=" + dateSerializerFunction(String(_traversedObject))];
    var mappedKeyValuePairs,
      mappedResults = [];
    if (void 0 === _traversedObject) return mappedResults;
    if ("comma" === selectedFormat && isArrayCheck(_traversedObject)) objectValueToSerialize && objectKey && (_traversedObject = utilityFunctions.maybeMap(_traversedObject, objectKey)), mappedKeyValuePairs = [{
      value: _traversedObject.length > 0 ? _traversedObject.join(",") || null : void 0
    }];else if (isArrayCheck(valueToProcess)) mappedKeyValuePairs = valueToProcess;else {
      var objectKeys = Object.keys(_traversedObject);
      mappedKeyValuePairs = queryStringParameters ? objectKeys.sort(queryStringParameters) : objectKeys;
    }
    var _formattedKey = currentIndexInTraversal ? String(_currentIndex).replace(/\./g, "%2E") : String(_currentIndex),
      encodedBasePath = allowEmptyArraysOptionResult && isArrayCheck(_traversedObject) && 1 === _traversedObject.length ? _formattedKey + "[]" : _formattedKey;
    if (filteredKeys && isArrayCheck(_traversedObject) && 0 === _traversedObject.length) return encodedBasePath + "[]";
    for (var mappedValuesIndex = 0; mappedValuesIndex < mappedKeyValuePairs.length; ++mappedValuesIndex) {
      var mappedValueKey = mappedKeyValuePairs[mappedValuesIndex],
        resolvedValue = "object" == typeof mappedValueKey && mappedValueKey && void 0 !== mappedValueKey.value ? mappedValueKey.value : _traversedObject[mappedValueKey];
      if (!_allowEmptyArraysOption || null !== resolvedValue) {
        var formattedPropertyName = queryParameterPrefix && currentIndexInTraversal ? String(mappedValueKey).replace(/\./g, "%2E") : String(mappedValueKey),
          formattedPropertyKey = isArrayCheck(_traversedObject) ? "function" == typeof selectedFormat ? selectedFormat(encodedBasePath, formattedPropertyName) : encodedBasePath : encodedBasePath + (queryParameterPrefix ? "." + formattedPropertyName : "[" + formattedPropertyName + "]");
        traversedObject.set(filterKeys, currentIndex);
        var createSideChannelIdentifier = sideChannelHandler();
        createSideChannelIdentifier.set(circularReferenceMap, traversedObject), pushToArray(mappedResults, dataObject(resolvedValue, formattedPropertyKey, selectedFormat, allowEmptyArraysOptionResult, filteredKeys, _circularReferenceHandler, _allowEmptyArraysOption, currentIndexInTraversal, "comma" === selectedFormat && objectValueToSerialize && isArrayCheck(_traversedObject) ? null : objectKey, valueToProcess, queryStringParameters, queryParameterPrefix, dateFormatter, circularReferenceMap, dateSerializerFunction, objectValueToSerialize, objectTraversalDepth, createSideChannelIdentifier));
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
    if (("function" == typeof e.filter || isArrayCheck(e.filter)) && (c = e.filter), arrayFormatType = e.arrayFormat in traversalIndex ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : queryStringHandlingOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var allowDotsOption = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || queryStringHandlingOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : queryStringHandlingOptions.addQueryPrefix,
      allowDots: allowDotsOption,
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
  var queryStringFormatOptions = traversalIndex[s.arrayFormat],
    u = "comma" === queryStringFormatOptions && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var keysArray = sideChannelHandler(), _currentIndex = 0; _currentIndex < t.length; ++_currentIndex) {
    var currentKey = t[_currentIndex],
      value = i[currentKey];
    s.skipNulls && null === value || pushToArray(c, handleCyclicReferences(value, currentKey, queryStringFormatOptions, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, keysArray));
  }
  var queryString = c.join(s.delimiter),
    queryPrefix = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryPrefix += "utf8=%26%2310003%3B&" : queryPrefix += "utf8=%E2%9C%93&"), queryString.length > 0 ? queryPrefix + queryString : "";
};