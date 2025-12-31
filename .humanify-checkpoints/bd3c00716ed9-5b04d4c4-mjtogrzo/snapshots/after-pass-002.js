"use strict";

var sideChannel = require("side-channel"),
  utilityFunctions = require("./utils"),
  formatOptions = require("./formats"),
  _hasOwnProperty = Object.prototype.hasOwnProperty,
  arrayFormatOptions = {
    brackets: function (optionsObject) {
      return optionsObject + "[]";
    },
    comma: "comma",
    indices: function (e, charset) {
      return e + "[" + charset + "]";
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
  dateToISOString = Date.prototype.toISOString,
  defaultQueryStringFormat = formatOptions.default,
  __queryStringOptions = {
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
    formatter: formatOptions.formatters[defaultQueryStringFormat],
    indices: !1,
    serializeDate: function (e) {
      return dateToISOString.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isPrimitiveType = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  referenceMap = {},
  detectCyclicReferencesInObject = function _formats(_filterKeys, _currentIndex, _defaultFormat, optionsObject, filteredKeys, processObject, objectTraversalDepth, __currentIndex, objectValue, value, queryStringParameters, traversalDepth, serializeDateObject, circularReferenceTracker, __objectValue, objectValueCounter, _traversalDepth, _objectTraversal) {
    for (var currentObjectReference = _filterKeys, objectTraversal = _objectTraversal, currentIndex = 0, isCyclicReference = !1; void 0 !== (objectTraversal = objectTraversal.get(referenceMap)) && !isCyclicReference;) {
      var _objectTraversalDepth = objectTraversal.get(_filterKeys);
      if (currentIndex += 1, void 0 !== _objectTraversalDepth) {
        if (_objectTraversalDepth === currentIndex) throw new RangeError("Cyclic object value");
        isCyclicReference = !0;
      }
      void 0 === objectTraversal.get(referenceMap) && (currentIndex = 0);
    }
    if ("function" == typeof value ? currentObjectReference = value(_currentIndex, currentObjectReference) : currentObjectReference instanceof Date ? currentObjectReference = serializeDateObject(currentObjectReference) : "comma" === _defaultFormat && isArray(currentObjectReference) && (currentObjectReference = utilityFunctions.maybeMap(currentObjectReference, function (e) {
      return e instanceof Date ? serializeDateObject(e) : e;
    })), null === currentObjectReference) {
      if (processObject) return objectValue && !objectValueCounter ? objectValue(_currentIndex, __queryStringOptions.encoder, _traversalDepth, "key", circularReferenceTracker) : _currentIndex;
      currentObjectReference = "";
    }
    if (isPrimitiveType(currentObjectReference) || utilityFunctions.isBuffer(currentObjectReference)) return objectValue ? [__objectValue(objectValueCounter ? _currentIndex : objectValue(_currentIndex, __queryStringOptions.encoder, _traversalDepth, "key", circularReferenceTracker)) + "=" + __objectValue(objectValue(currentObjectReference, __queryStringOptions.encoder, _traversalDepth, "value", circularReferenceTracker))] : [__objectValue(_currentIndex) + "=" + __objectValue(String(currentObjectReference))];
    var mappedValues,
      keysArray = [];
    if (void 0 === currentObjectReference) return keysArray;
    if ("comma" === _defaultFormat && isArray(currentObjectReference)) objectValueCounter && objectValue && (currentObjectReference = utilityFunctions.maybeMap(currentObjectReference, objectValue)), mappedValues = [{
      value: currentObjectReference.length > 0 ? currentObjectReference.join(",") || null : void 0
    }];else if (isArray(value)) mappedValues = value;else {
      var currentObjectKeys = Object.keys(currentObjectReference);
      mappedValues = queryStringParameters ? currentObjectKeys.sort(queryStringParameters) : currentObjectKeys;
    }
    var formattedKey = __currentIndex ? String(_currentIndex).replace(/\./g, "%2E") : String(_currentIndex),
      encodedKeyWithArraySuffix = optionsObject && isArray(currentObjectReference) && 1 === currentObjectReference.length ? formattedKey + "[]" : formattedKey;
    if (filteredKeys && isArray(currentObjectReference) && 0 === currentObjectReference.length) return encodedKeyWithArraySuffix + "[]";
    for (var mappedValuesIndex = 0; mappedValuesIndex < mappedValues.length; ++mappedValuesIndex) {
      var mappedValue = mappedValues[mappedValuesIndex],
        resolvedValue = "object" == typeof mappedValue && mappedValue && void 0 !== mappedValue.value ? mappedValue.value : currentObjectReference[mappedValue];
      if (!objectTraversalDepth || null !== resolvedValue) {
        var _formattedKey = traversalDepth && __currentIndex ? String(mappedValue).replace(/\./g, "%2E") : String(mappedValue),
          computedPropertyPath = isArray(currentObjectReference) ? "function" == typeof _defaultFormat ? _defaultFormat(encodedKeyWithArraySuffix, _formattedKey) : encodedKeyWithArraySuffix : encodedKeyWithArraySuffix + (traversalDepth ? "." + _formattedKey : "[" + _formattedKey + "]");
        _objectTraversal.set(_filterKeys, currentIndex);
        var createNewMapEntry = value();
        createNewMapEntry.set(referenceMap, _objectTraversal), pushToArray(keysArray, _formats(resolvedValue, computedPropertyPath, _defaultFormat, optionsObject, filteredKeys, processObject, objectTraversalDepth, __currentIndex, "comma" === _defaultFormat && objectValueCounter && isArray(currentObjectReference) ? null : objectValue, value, queryStringParameters, traversalDepth, serializeDateObject, circularReferenceTracker, __objectValue, objectValueCounter, _traversalDepth, createNewMapEntry));
      }
    }
    return keysArray;
  },
  ___queryStringOptions = function (e) {
    if (!e) return __queryStringOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || __queryStringOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = formatOptions.default;
    if (void 0 !== e.format) {
      if (!_hasOwnProperty.call(formatOptions.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var arrayFormatOption,
      s = formatOptions.formatters[i],
      c = __queryStringOptions.filter;
    if (("function" == typeof e.filter || isArray(e.filter)) && (c = e.filter), arrayFormatOption = e.arrayFormat in arrayFormatOptions ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : __queryStringOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isCommaRoundTrip = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || __queryStringOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : __queryStringOptions.addQueryPrefix,
      allowDots: isCommaRoundTrip,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : __queryStringOptions.allowEmptyArrays,
      arrayFormat: arrayFormatOption,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : __queryStringOptions.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? __queryStringOptions.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : __queryStringOptions.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : __queryStringOptions.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : __queryStringOptions.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : __queryStringOptions.encodeValuesOnly,
      filter: c,
      format: i,
      formatter: s,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : __queryStringOptions.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : __queryStringOptions.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : __queryStringOptions.strictNullHandling
    };
  };
module.exports = function (r, o) {
  var t,
    i = r,
    s = ___queryStringOptions(o);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArray(s.filter) && (t = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var arrayFormatterFunction = arrayFormatOptions[s.arrayFormat],
    u = "comma" === arrayFormatterFunction && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var keysArray = sideChannel(), currentIndex = 0; currentIndex < t.length; ++currentIndex) {
    var key = t[currentIndex],
      propertyValue = i[key];
    s.skipNulls && null === propertyValue || pushToArray(c, detectCyclicReferencesInObject(propertyValue, key, arrayFormatterFunction, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, keysArray));
  }
  var queryString = c.join(s.delimiter),
    queryPrefix = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryPrefix += "utf8=%26%2310003%3B&" : queryPrefix += "utf8=%E2%9C%93&"), queryString.length > 0 ? queryPrefix + queryString : "";
};