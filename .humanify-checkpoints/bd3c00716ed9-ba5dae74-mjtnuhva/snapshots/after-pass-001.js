"use strict";

var getValue = require("side-channel"),
  utils = require("./utils"),
  formats = require("./formats"),
  _hasOwnProperty = Object.prototype.hasOwnProperty,
  arrayFormatters = {
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
  toISOStringMethod = Date.prototype.toISOString,
  queryStringOptions = formats.default,
  defaultStrictNullHandling = {
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
    format: queryStringOptions,
    formatter: formats.formatters[queryStringOptions],
    indices: !1,
    serializeDate: function (e) {
      return toISOStringMethod.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isPrimitiveType = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  circularReferenceTracker = {},
  recursiveObjectHandler = function o(t, n, i, s, c, y, p, index, key, value, queryString, currentIndex, dateSerializationFunction, identifierD, currentValue, objectValue, currentDepth, currentObject) {
    for (var _currentObject = t, objectTraversal = currentObject, __currentObject = 0, isCyclicReference = !1; void 0 !== (objectTraversal = objectTraversal.get(circularReferenceTracker)) && !isCyclicReference;) {
      var _currentDepth = objectTraversal.get(t);
      if (__currentObject += 1, void 0 !== _currentDepth) {
        if (_currentDepth === __currentObject) throw new RangeError("Cyclic object value");
        isCyclicReference = !0;
      }
      void 0 === objectTraversal.get(circularReferenceTracker) && (__currentObject = 0);
    }
    if ("function" == typeof value ? _currentObject = value(n, _currentObject) : _currentObject instanceof Date ? _currentObject = dateSerializationFunction(_currentObject) : "comma" === i && isArray(_currentObject) && (_currentObject = utils.maybeMap(_currentObject, function (e) {
      return e instanceof Date ? dateSerializationFunction(e) : e;
    })), null === _currentObject) {
      if (y) return key && !objectValue ? key(n, defaultStrictNullHandling.encoder, currentDepth, "key", identifierD) : n;
      _currentObject = "";
    }
    if (isPrimitiveType(_currentObject) || utils.isBuffer(_currentObject)) return key ? [currentValue(objectValue ? n : key(n, defaultStrictNullHandling.encoder, currentDepth, "key", identifierD)) + "=" + currentValue(key(_currentObject, defaultStrictNullHandling.encoder, currentDepth, "value", identifierD))] : [currentValue(n) + "=" + currentValue(String(_currentObject))];
    var keyValuePairs,
      resultArray = [];
    if (void 0 === _currentObject) return resultArray;
    if ("comma" === i && isArray(_currentObject)) objectValue && key && (_currentObject = utils.maybeMap(_currentObject, key)), keyValuePairs = [{
      value: _currentObject.length > 0 ? _currentObject.join(",") || null : void 0
    }];else if (isArray(value)) keyValuePairs = value;else {
      var keysArray = Object.keys(_currentObject);
      keyValuePairs = queryString ? keysArray.sort(queryString) : keysArray;
    }
    var encodedKey = index ? String(n).replace(/\./g, "%2E") : String(n),
      basePath = s && isArray(_currentObject) && 1 === _currentObject.length ? encodedKey + "[]" : encodedKey;
    if (c && isArray(_currentObject) && 0 === _currentObject.length) return basePath + "[]";
    for (var _index = 0; _index < keyValuePairs.length; ++_index) {
      var _key = keyValuePairs[_index],
        valueOrDefault = "object" == typeof _key && _key && void 0 !== _key.value ? _key.value : _currentObject[_key];
      if (!p || null !== valueOrDefault) {
        var propertyName = currentIndex && index ? String(_key).replace(/\./g, "%2E") : String(_key),
          formattedKey = isArray(_currentObject) ? "function" == typeof i ? i(basePath, propertyName) : basePath : basePath + (currentIndex ? "." + propertyName : "[" + propertyName + "]");
        currentObject.set(t, __currentObject);
        var createNewMapEntry = getValue();
        createNewMapEntry.set(circularReferenceTracker, currentObject), arrayPush(resultArray, o(valueOrDefault, formattedKey, i, s, c, y, p, index, "comma" === i && objectValue && isArray(_currentObject) ? null : key, value, queryString, currentIndex, dateSerializationFunction, identifierD, currentValue, objectValue, currentDepth, createNewMapEntry));
      }
    }
    return resultArray;
  },
  allowEmptyArraysOption = function (e) {
    if (!e) return defaultStrictNullHandling;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || defaultStrictNullHandling.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = formats.default;
    if (void 0 !== e.format) {
      if (!_hasOwnProperty.call(formats.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var l,
      s = formats.formatters[i],
      c = defaultStrictNullHandling.filter;
    if (("function" == typeof e.filter || isArray(e.filter)) && (c = e.filter), l = e.arrayFormat in arrayFormatters ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : defaultStrictNullHandling.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var u = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || defaultStrictNullHandling.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : defaultStrictNullHandling.addQueryPrefix,
      allowDots: u,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : defaultStrictNullHandling.allowEmptyArrays,
      arrayFormat: l,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : defaultStrictNullHandling.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? defaultStrictNullHandling.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : defaultStrictNullHandling.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : defaultStrictNullHandling.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : defaultStrictNullHandling.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : defaultStrictNullHandling.encodeValuesOnly,
      filter: c,
      format: i,
      formatter: s,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : defaultStrictNullHandling.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : defaultStrictNullHandling.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : defaultStrictNullHandling.strictNullHandling
    };
  };
module.exports = function (r, o) {
  var t,
    i = r,
    s = allowEmptyArraysOption(o);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArray(s.filter) && (t = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var f = arrayFormatters[s.arrayFormat],
    u = "comma" === f && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var d = getValue(), m = 0; m < t.length; ++m) {
    var v = t[m],
      h = i[v];
    s.skipNulls && null === h || arrayPush(c, recursiveObjectHandler(h, v, f, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, d));
  }
  var w = c.join(s.delimiter),
    b = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? b += "utf8=%26%2310003%3B&" : b += "utf8=%E2%9C%93&"), w.length > 0 ? b + w : "";
};