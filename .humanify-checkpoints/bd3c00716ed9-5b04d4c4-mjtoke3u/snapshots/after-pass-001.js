"use strict";

var createNewInstance = require("side-channel"),
  utils = require("./utils"),
  formats = require("./formats"),
  _hasOwnProperty = Object.prototype.hasOwnProperty,
  objectKey = {
    brackets: function (e) {
      return e + "[]";
    },
    comma: "comma",
    indices: function (e, r) {
      return e + "[" + r + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArray = Array.isArray,
  defaultFormat = Array.prototype.push,
  arrayPush = function (e, r) {
    defaultFormat.apply(e, isArray(r) ? r : [r]);
  },
  inputData = Date.prototype.toISOString,
  queryStringFormat = formats.default,
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
    encoder: utils.encode,
    encodeValuesOnly: !1,
    filter: void 0,
    format: queryStringFormat,
    formatter: formats.formatters[queryStringFormat],
    indices: !1,
    serializeDate: function (e) {
      return inputData.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isPrimitiveType = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  circularReferenceTracker = {},
  recursiveObjectHandler = function o(t, n, i, s, c, y, p, index, currentIndex, callbackFunction, queryString, _currentIndex, dateSerializer, context, currentValue, depthCounter, _depthCounter, currentObject) {
    for (var _currentObject = t, objectTraversal = currentObject, __currentIndex = 0, isCyclicReference = !1; void 0 !== (objectTraversal = objectTraversal.get(circularReferenceTracker)) && !isCyclicReference;) {
      var __currentObject = objectTraversal.get(t);
      if (__currentIndex += 1, void 0 !== __currentObject) {
        if (__currentObject === __currentIndex) throw new RangeError("Cyclic object value");
        isCyclicReference = !0;
      }
      void 0 === objectTraversal.get(circularReferenceTracker) && (__currentIndex = 0);
    }
    if ("function" == typeof callbackFunction ? _currentObject = callbackFunction(n, _currentObject) : _currentObject instanceof Date ? _currentObject = dateSerializer(_currentObject) : "comma" === i && isArray(_currentObject) && (_currentObject = utils.maybeMap(_currentObject, function (e) {
      return e instanceof Date ? dateSerializer(e) : e;
    })), null === _currentObject) {
      if (y) return currentIndex && !depthCounter ? currentIndex(n, queryStringOptions.encoder, _depthCounter, "key", context) : n;
      _currentObject = "";
    }
    if (isPrimitiveType(_currentObject) || utils.isBuffer(_currentObject)) return currentIndex ? [currentValue(depthCounter ? n : currentIndex(n, queryStringOptions.encoder, _depthCounter, "key", context)) + "=" + currentValue(currentIndex(_currentObject, queryStringOptions.encoder, _depthCounter, "value", context))] : [currentValue(n) + "=" + currentValue(String(_currentObject))];
    var mappedValues,
      resultArray = [];
    if (void 0 === _currentObject) return resultArray;
    if ("comma" === i && isArray(_currentObject)) depthCounter && currentIndex && (_currentObject = utils.maybeMap(_currentObject, currentIndex)), mappedValues = [{
      value: _currentObject.length > 0 ? _currentObject.join(",") || null : void 0
    }];else if (isArray(callbackFunction)) mappedValues = callbackFunction;else {
      var keysArray = Object.keys(_currentObject);
      mappedValues = queryString ? keysArray.sort(queryString) : keysArray;
    }
    var encodedKey = index ? String(n).replace(/\./g, "%2E") : String(n),
      basePath = s && isArray(_currentObject) && 1 === _currentObject.length ? encodedKey + "[]" : encodedKey;
    if (c && isArray(_currentObject) && 0 === _currentObject.length) return basePath + "[]";
    for (var _index = 0; _index < mappedValues.length; ++_index) {
      var key = mappedValues[_index],
        valueOrDefault = "object" == typeof key && key && void 0 !== key.value ? key.value : _currentObject[key];
      if (!p || null !== valueOrDefault) {
        var propertyName = _currentIndex && index ? String(key).replace(/\./g, "%2E") : String(key),
          formattedKey = isArray(_currentObject) ? "function" == typeof i ? i(basePath, propertyName) : basePath : basePath + (_currentIndex ? "." + propertyName : "[" + propertyName + "]");
        currentObject.set(t, __currentIndex);
        var createNewMapEntry = createNewInstance();
        createNewMapEntry.set(circularReferenceTracker, currentObject), arrayPush(resultArray, o(valueOrDefault, formattedKey, i, s, c, y, p, index, "comma" === i && depthCounter && isArray(_currentObject) ? null : currentIndex, callbackFunction, queryString, _currentIndex, dateSerializer, context, currentValue, depthCounter, _depthCounter, createNewMapEntry));
      }
    }
    return resultArray;
  },
  allowEmptyArraysOption = function (e) {
    if (!e) return queryStringOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || queryStringOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = formats.default;
    if (void 0 !== e.format) {
      if (!_hasOwnProperty.call(formats.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var l,
      s = formats.formatters[i],
      c = queryStringOptions.filter;
    if (("function" == typeof e.filter || isArray(e.filter)) && (c = e.filter), l = e.arrayFormat in objectKey ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : queryStringOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var u = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || queryStringOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : queryStringOptions.addQueryPrefix,
      allowDots: u,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : queryStringOptions.allowEmptyArrays,
      arrayFormat: l,
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
  var f = objectKey[s.arrayFormat],
    u = "comma" === f && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var d = createNewInstance(), m = 0; m < t.length; ++m) {
    var v = t[m],
      h = i[v];
    s.skipNulls && null === h || arrayPush(c, recursiveObjectHandler(h, v, f, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, d));
  }
  var w = c.join(s.delimiter),
    b = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? b += "utf8=%26%2310003%3B&" : b += "utf8=%E2%9C%93&"), w.length > 0 ? b + w : "";
};