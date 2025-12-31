"use strict";

var sideChannelUtils = require("side-channel"),
  utilityFunctions = require("./utils"),
  formatters = require("./formats"),
  __hasOwnProperty = Object.prototype.hasOwnProperty,
  arrayFormattingStrategies = {
    brackets: function (inputValue) {
      return inputValue + "[]";
    },
    comma: "comma",
    indices: function (e, charsetOption) {
      return e + "[" + charsetOption + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArrayFunction = Array.isArray,
  arrayPushMethod = Array.prototype.push,
  pushToArray = function (e, r) {
    arrayPushMethod.apply(e, isArrayFunction(r) ? r : [r]);
  },
  dateToISOStringFunction = Date.prototype.toISOString,
  defaultQueryStringFormatOptions = formatters.default,
  queryStringNullHandlingOptions = {
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
    formatter: formatters.formatters[defaultQueryStringFormatOptions],
    indices: !1,
    serializeDate: function (e) {
      return dateToISOStringFunction.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isValuePrimitive = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  cyclicReferenceMap = {},
  traverseAndSerializeObject = function _arrayFormatters(filterFunction, _currentValue, inputData, allowEmptyArraysOptionValue, _resultArray, _recursiveObjectHandler, _allowEmptyArraysOption, currentIndexPosition, objectKey, valueToSerialize, queryParameters, currentObjectIndex, serializeDateValue, identifier, currentValueReference, objectTraversalDepth, traversalDepth, traversedObject) {
    for (var _traversedObject = filterFunction, __traversedObject = traversedObject, _currentObjectIndex = 0, hasCyclicReference = !1; void 0 !== (__traversedObject = __traversedObject.get(cyclicReferenceMap)) && !hasCyclicReference;) {
      var currentTraversalDepth = __traversedObject.get(filterFunction);
      if (_currentObjectIndex += 1, void 0 !== currentTraversalDepth) {
        if (currentTraversalDepth === _currentObjectIndex) throw new RangeError("Cyclic object value");
        hasCyclicReference = !0;
      }
      void 0 === __traversedObject.get(cyclicReferenceMap) && (_currentObjectIndex = 0);
    }
    if ("function" == typeof valueToSerialize ? _traversedObject = valueToSerialize(_currentValue, _traversedObject) : _traversedObject instanceof Date ? _traversedObject = serializeDateValue(_traversedObject) : "comma" === inputData && isArrayFunction(_traversedObject) && (_traversedObject = utilityFunctions.maybeMap(_traversedObject, function (e) {
      return e instanceof Date ? serializeDateValue(e) : e;
    })), null === _traversedObject) {
      if (_recursiveObjectHandler) return objectKey && !objectTraversalDepth ? objectKey(_currentValue, queryStringNullHandlingOptions.encoder, traversalDepth, "key", identifier) : _currentValue;
      _traversedObject = "";
    }
    if (isValuePrimitive(_traversedObject) || utilityFunctions.isBuffer(_traversedObject)) return objectKey ? [currentValueReference(objectTraversalDepth ? _currentValue : objectKey(_currentValue, queryStringNullHandlingOptions.encoder, traversalDepth, "key", identifier)) + "=" + currentValueReference(objectKey(_traversedObject, queryStringNullHandlingOptions.encoder, traversalDepth, "value", identifier))] : [currentValueReference(_currentValue) + "=" + currentValueReference(String(_traversedObject))];
    var mappedKeyValuePairs,
      keyValuePairsArray = [];
    if (void 0 === _traversedObject) return keyValuePairsArray;
    if ("comma" === inputData && isArrayFunction(_traversedObject)) objectTraversalDepth && objectKey && (_traversedObject = utilityFunctions.maybeMap(_traversedObject, objectKey)), mappedKeyValuePairs = [{
      value: _traversedObject.length > 0 ? _traversedObject.join(",") || null : void 0
    }];else if (isArrayFunction(valueToSerialize)) mappedKeyValuePairs = valueToSerialize;else {
      var currentObjectKeys = Object.keys(_traversedObject);
      mappedKeyValuePairs = queryParameters ? currentObjectKeys.sort(queryParameters) : currentObjectKeys;
    }
    var _formattedKey = currentIndexPosition ? String(_currentValue).replace(/\./g, "%2E") : String(_currentValue),
      encodedBasePath = allowEmptyArraysOptionValue && isArrayFunction(_traversedObject) && 1 === _traversedObject.length ? _formattedKey + "[]" : _formattedKey;
    if (_resultArray && isArrayFunction(_traversedObject) && 0 === _traversedObject.length) return encodedBasePath + "[]";
    for (var currentKeyIndex = 0; currentKeyIndex < mappedKeyValuePairs.length; ++currentKeyIndex) {
      var keyValuePairKey = mappedKeyValuePairs[currentKeyIndex],
        extractedValue = "object" == typeof keyValuePairKey && keyValuePairKey && void 0 !== keyValuePairKey.value ? keyValuePairKey.value : _traversedObject[keyValuePairKey];
      if (!_allowEmptyArraysOption || null !== extractedValue) {
        var formattedPropertyName = currentObjectIndex && currentIndexPosition ? String(keyValuePairKey).replace(/\./g, "%2E") : String(keyValuePairKey),
          formattedKeyPath = isArrayFunction(_traversedObject) ? "function" == typeof inputData ? inputData(encodedBasePath, formattedPropertyName) : encodedBasePath : encodedBasePath + (currentObjectIndex ? "." + formattedPropertyName : "[" + formattedPropertyName + "]");
        traversedObject.set(filterFunction, _currentObjectIndex);
        var mapEntry = sideChannelUtils();
        mapEntry.set(cyclicReferenceMap, traversedObject), pushToArray(keyValuePairsArray, _arrayFormatters(extractedValue, formattedKeyPath, inputData, allowEmptyArraysOptionValue, _resultArray, _recursiveObjectHandler, _allowEmptyArraysOption, currentIndexPosition, "comma" === inputData && objectTraversalDepth && isArrayFunction(_traversedObject) ? null : objectKey, valueToSerialize, queryParameters, currentObjectIndex, serializeDateValue, identifier, currentValueReference, objectTraversalDepth, traversalDepth, mapEntry));
      }
    }
    return keyValuePairsArray;
  },
  allowEmptyArraysSetting = function (e) {
    if (!e) return queryStringNullHandlingOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || queryStringNullHandlingOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = formatters.default;
    if (void 0 !== e.format) {
      if (!__hasOwnProperty.call(formatters.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var arrayFormatType,
      s = formatters.formatters[i],
      c = queryStringNullHandlingOptions.filter;
    if (("function" == typeof e.filter || isArrayFunction(e.filter)) && (c = e.filter), arrayFormatType = e.arrayFormat in arrayFormattingStrategies ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : queryStringNullHandlingOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isCommaRoundTrip = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || queryStringNullHandlingOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : queryStringNullHandlingOptions.addQueryPrefix,
      allowDots: isCommaRoundTrip,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : queryStringNullHandlingOptions.allowEmptyArrays,
      arrayFormat: arrayFormatType,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : queryStringNullHandlingOptions.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? queryStringNullHandlingOptions.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : queryStringNullHandlingOptions.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : queryStringNullHandlingOptions.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : queryStringNullHandlingOptions.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : queryStringNullHandlingOptions.encodeValuesOnly,
      filter: c,
      format: i,
      formatter: s,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : queryStringNullHandlingOptions.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : queryStringNullHandlingOptions.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : queryStringNullHandlingOptions.strictNullHandling
    };
  };
module.exports = function (r, o) {
  var t,
    i = r,
    s = allowEmptyArraysSetting(o);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArrayFunction(s.filter) && (t = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var arrayFormatOptions = arrayFormattingStrategies[s.arrayFormat],
    u = "comma" === arrayFormatOptions && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var _circularReferenceTracker = sideChannelUtils(), currentIndex = 0; currentIndex < t.length; ++currentIndex) {
    var currentKey = t[currentIndex],
      valueForKey = i[currentKey];
    s.skipNulls && null === valueForKey || pushToArray(c, traverseAndSerializeObject(valueForKey, currentKey, arrayFormatOptions, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, _circularReferenceTracker));
  }
  var queryStringResult = c.join(s.delimiter),
    queryPrefix = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryPrefix += "utf8=%26%2310003%3B&" : queryPrefix += "utf8=%E2%9C%93&"), queryStringResult.length > 0 ? queryPrefix + queryStringResult : "";
};