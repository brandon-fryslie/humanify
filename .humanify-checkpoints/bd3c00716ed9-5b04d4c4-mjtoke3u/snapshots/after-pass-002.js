"use strict";

var requireSideChannel = require("side-channel"),
  utilityFunctions = require("./utils"),
  arrayFormatters = require("./formats"),
  __hasOwnProperty = Object.prototype.hasOwnProperty,
  _arrayFormatters = {
    brackets: function (options) {
      return options + "[]";
    },
    comma: "comma",
    indices: function (e, _utils) {
      return e + "[" + _utils + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArray = Array.isArray,
  arrayPushMethod = Array.prototype.push,
  pushToArray = function (e, r) {
    arrayPushMethod.apply(e, isArray(r) ? r : [r]);
  },
  toISOStringMethod = Date.prototype.toISOString,
  defaultQueryStringFormat = arrayFormatters.default,
  queryStringOptions = {
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
    formatter: arrayFormatters.formatters[defaultQueryStringFormat],
    indices: !1,
    serializeDate: function (e) {
      return toISOStringMethod.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isValuePrimitive = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  circularReferenceTracker = {},
  handleRecursiveObjectTraversal = function _formats(filterKeys, _objectKey, ___currentIndex, _allowEmptyArraysOption, _resultArray, _recursiveObjectHandler, ____currentIndex, _____currentIndex, currentIndex, callbackFunction, _queryStringOptions, ______currentIndex, serializeDateToQueryString, context, currentValue, currentDepthCounter, _currentDepthCounter, _objectTraversal) {
    for (var referencedObject = filterKeys, traversalObject = _objectTraversal, _______currentIndex = 0, hasCyclicReference = !1; void 0 !== (traversalObject = traversalObject.get(circularReferenceTracker)) && !hasCyclicReference;) {
      var objectTraversalResult = traversalObject.get(filterKeys);
      if (_______currentIndex += 1, void 0 !== objectTraversalResult) {
        if (objectTraversalResult === _______currentIndex) throw new RangeError("Cyclic object value");
        hasCyclicReference = !0;
      }
      void 0 === traversalObject.get(circularReferenceTracker) && (_______currentIndex = 0);
    }
    if ("function" == typeof callbackFunction ? referencedObject = callbackFunction(_objectKey, referencedObject) : referencedObject instanceof Date ? referencedObject = serializeDateToQueryString(referencedObject) : "comma" === ___currentIndex && isArray(referencedObject) && (referencedObject = utilityFunctions.maybeMap(referencedObject, function (e) {
      return e instanceof Date ? serializeDateToQueryString(e) : e;
    })), null === referencedObject) {
      if (_recursiveObjectHandler) return currentIndex && !currentDepthCounter ? currentIndex(_objectKey, queryStringOptions.encoder, _currentDepthCounter, "key", context) : _objectKey;
      referencedObject = "";
    }
    if (isValuePrimitive(referencedObject) || utilityFunctions.isBuffer(referencedObject)) return currentIndex ? [currentValue(currentDepthCounter ? _objectKey : currentIndex(_objectKey, queryStringOptions.encoder, _currentDepthCounter, "key", context)) + "=" + currentValue(currentIndex(referencedObject, queryStringOptions.encoder, _currentDepthCounter, "value", context))] : [currentValue(_objectKey) + "=" + currentValue(String(referencedObject))];
    var transformedValues,
      mappedResults = [];
    if (void 0 === referencedObject) return mappedResults;
    if ("comma" === ___currentIndex && isArray(referencedObject)) currentDepthCounter && currentIndex && (referencedObject = utilityFunctions.maybeMap(referencedObject, currentIndex)), transformedValues = [{
      value: referencedObject.length > 0 ? referencedObject.join(",") || null : void 0
    }];else if (isArray(callbackFunction)) transformedValues = callbackFunction;else {
      var objectKeys = Object.keys(referencedObject);
      transformedValues = _queryStringOptions ? objectKeys.sort(_queryStringOptions) : objectKeys;
    }
    var _formattedKey = _____currentIndex ? String(_objectKey).replace(/\./g, "%2E") : String(_objectKey),
      encodedKeyWithArraySuffix = _allowEmptyArraysOption && isArray(referencedObject) && 1 === referencedObject.length ? _formattedKey + "[]" : _formattedKey;
    if (_resultArray && isArray(referencedObject) && 0 === referencedObject.length) return encodedKeyWithArraySuffix + "[]";
    for (var ________currentIndex = 0; ________currentIndex < transformedValues.length; ++________currentIndex) {
      var mappedValue = transformedValues[________currentIndex],
        extractedValue = "object" == typeof mappedValue && mappedValue && void 0 !== mappedValue.value ? mappedValue.value : referencedObject[mappedValue];
      if (!____currentIndex || null !== extractedValue) {
        var formattedPropertyName = ______currentIndex && _____currentIndex ? String(mappedValue).replace(/\./g, "%2E") : String(mappedValue),
          formattedKey = isArray(referencedObject) ? "function" == typeof ___currentIndex ? ___currentIndex(encodedKeyWithArraySuffix, formattedPropertyName) : encodedKeyWithArraySuffix : encodedKeyWithArraySuffix + (______currentIndex ? "." + formattedPropertyName : "[" + formattedPropertyName + "]");
        _objectTraversal.set(filterKeys, _______currentIndex);
        var initializeMapEntry = requireSideChannel();
        initializeMapEntry.set(circularReferenceTracker, _objectTraversal), pushToArray(mappedResults, _formats(extractedValue, formattedKey, ___currentIndex, _allowEmptyArraysOption, _resultArray, _recursiveObjectHandler, ____currentIndex, _____currentIndex, "comma" === ___currentIndex && currentDepthCounter && isArray(referencedObject) ? null : currentIndex, callbackFunction, _queryStringOptions, ______currentIndex, serializeDateToQueryString, context, currentValue, currentDepthCounter, _currentDepthCounter, initializeMapEntry));
      }
    }
    return mappedResults;
  },
  allowEmptyArraysOption = function (e) {
    if (!e) return queryStringOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || queryStringOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = arrayFormatters.default;
    if (void 0 !== e.format) {
      if (!__hasOwnProperty.call(arrayFormatters.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var arrayFormatOption,
      s = arrayFormatters.formatters[i],
      c = queryStringOptions.filter;
    if (("function" == typeof e.filter || isArray(e.filter)) && (c = e.filter), arrayFormatOption = e.arrayFormat in _arrayFormatters ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : queryStringOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isCommaRoundTrip = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || queryStringOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : queryStringOptions.addQueryPrefix,
      allowDots: isCommaRoundTrip,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : queryStringOptions.allowEmptyArrays,
      arrayFormat: arrayFormatOption,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : queryStringOptions.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? queryStringOptions.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : queryStringOptions.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : queryStringOptions.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : queryStringOptions.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : queryStringOptions.encodeValuesOnly,
      filter: c,
      format: i,
      formatter: s,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : queryStringOptions.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : queryStringOptions.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : queryStringOptions.strictNullHandling
    };
  };
module.exports = function (r, o) {
  var t,
    i = r,
    s = allowEmptyArraysOption(o);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArray(s.filter) && (t = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var arrayFormatOption = _arrayFormatters[s.arrayFormat],
    u = "comma" === arrayFormatOption && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var _circularReferenceTracker = requireSideChannel(), currentIndex = 0; currentIndex < t.length; ++currentIndex) {
    var currentKey = t[currentIndex],
      value = i[currentKey];
    s.skipNulls && null === value || pushToArray(c, handleRecursiveObjectTraversal(value, currentKey, arrayFormatOption, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, _circularReferenceTracker));
  }
  var queryString = c.join(s.delimiter),
    queryPrefix = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryPrefix += "utf8=%26%2310003%3B&" : queryPrefix += "utf8=%E2%9C%93&"), queryString.length > 0 ? queryPrefix + queryString : "";
};