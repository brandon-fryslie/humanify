"use strict";

var sideChannelModule = require("side-channel"),
  utilsModule = require("./utils"),
  formatUtils = require("./formats"),
  filteredKeys = Object.prototype.hasOwnProperty,
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
  selectedFormatOption = Array.prototype.push,
  arrayPushHandler = function (e, r) {
    selectedFormatOption.apply(e, isArray(r) ? r : [r]);
  },
  inputData = Date.prototype.toISOString,
  queryStringOptions = formatUtils.default,
  _queryStringOptions = {
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
    encoder: utilsModule.encode,
    encodeValuesOnly: !1,
    filter: void 0,
    format: queryStringOptions,
    formatter: formatUtils.formatters[queryStringOptions],
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
  visitedObjectsMap = {},
  cyclicObjectHandler = function o(t, n, i, s, c, y, p, currentIndex, keyForIteration, inputValue, queryString, queryPrefix, dateSerializationHandler, cyclicReferenceCounter, currentDepthLevel, _currentDepthLevel, _currentIndex, currentObjectReference) {
    for (var currentObjectValue = t, _currentObjectReference = currentObjectReference, currentIterationCount = 0, _currentIterationCount = !1; void 0 !== (_currentObjectReference = _currentObjectReference.get(visitedObjectsMap)) && !_currentIterationCount;) {
      var cyclicObjectValueCounter = _currentObjectReference.get(t);
      if (currentIterationCount += 1, void 0 !== cyclicObjectValueCounter) {
        if (cyclicObjectValueCounter === currentIterationCount) throw new RangeError("Cyclic object value");
        _currentIterationCount = !0;
      }
      void 0 === _currentObjectReference.get(visitedObjectsMap) && (currentIterationCount = 0);
    }
    if ("function" == typeof inputValue ? currentObjectValue = inputValue(n, currentObjectValue) : currentObjectValue instanceof Date ? currentObjectValue = dateSerializationHandler(currentObjectValue) : "comma" === i && isArray(currentObjectValue) && (currentObjectValue = utilsModule.maybeMap(currentObjectValue, function (e) {
      return e instanceof Date ? dateSerializationHandler(e) : e;
    })), null === currentObjectValue) {
      if (y) return keyForIteration && !_currentDepthLevel ? keyForIteration(n, _queryStringOptions.encoder, _currentIndex, "key", cyclicReferenceCounter) : n;
      currentObjectValue = "";
    }
    if (isPrimitiveType(currentObjectValue) || utilsModule.isBuffer(currentObjectValue)) return keyForIteration ? [currentDepthLevel(_currentDepthLevel ? n : keyForIteration(n, _queryStringOptions.encoder, _currentIndex, "key", cyclicReferenceCounter)) + "=" + currentDepthLevel(keyForIteration(currentObjectValue, _queryStringOptions.encoder, _currentIndex, "value", cyclicReferenceCounter))] : [currentDepthLevel(n) + "=" + currentDepthLevel(String(currentObjectValue))];
    var mappedValuesArray,
      resultArray = [];
    if (void 0 === currentObjectValue) return resultArray;
    if ("comma" === i && isArray(currentObjectValue)) _currentDepthLevel && keyForIteration && (currentObjectValue = utilsModule.maybeMap(currentObjectValue, keyForIteration)), mappedValuesArray = [{
      value: currentObjectValue.length > 0 ? currentObjectValue.join(",") || null : void 0
    }];else if (isArray(inputValue)) mappedValuesArray = inputValue;else {
      var keyList = Object.keys(currentObjectValue);
      mappedValuesArray = queryString ? keyList.sort(queryString) : keyList;
    }
    var encodedKey = currentIndex ? String(n).replace(/\./g, "%2E") : String(n),
      formattedPath = s && isArray(currentObjectValue) && 1 === currentObjectValue.length ? encodedKey + "[]" : encodedKey;
    if (c && isArray(currentObjectValue) && 0 === currentObjectValue.length) return formattedPath + "[]";
    for (var indexOfCurrentItem = 0; indexOfCurrentItem < mappedValuesArray.length; ++indexOfCurrentItem) {
      var keyName = mappedValuesArray[indexOfCurrentItem],
        valueOrFallback = "object" == typeof keyName && keyName && void 0 !== keyName.value ? keyName.value : currentObjectValue[keyName];
      if (!p || null !== valueOrFallback) {
        var propertyName = queryPrefix && currentIndex ? String(keyName).replace(/\./g, "%2E") : String(keyName),
          propertyAccessor = isArray(currentObjectValue) ? "function" == typeof i ? i(formattedPath, propertyName) : formattedPath : formattedPath + (queryPrefix ? "." + propertyName : "[" + propertyName + "]");
        currentObjectReference.set(t, currentIterationCount);
        var dataMap = sideChannelModule();
        dataMap.set(visitedObjectsMap, currentObjectReference), arrayPushHandler(resultArray, o(valueOrFallback, propertyAccessor, i, s, c, y, p, currentIndex, "comma" === i && _currentDepthLevel && isArray(currentObjectValue) ? null : keyForIteration, inputValue, queryString, queryPrefix, dateSerializationHandler, cyclicReferenceCounter, currentDepthLevel, _currentDepthLevel, _currentIndex, dataMap));
      }
    }
    return resultArray;
  },
  optionsHandler = function (e) {
    if (!e) return _queryStringOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || _queryStringOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = formatUtils.default;
    if (void 0 !== e.format) {
      if (!filteredKeys.call(formatUtils.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var l,
      s = formatUtils.formatters[i],
      c = _queryStringOptions.filter;
    if (("function" == typeof e.filter || isArray(e.filter)) && (c = e.filter), l = e.arrayFormat in arrayFormatters ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : _queryStringOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var u = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || _queryStringOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : _queryStringOptions.addQueryPrefix,
      allowDots: u,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : _queryStringOptions.allowEmptyArrays,
      arrayFormat: l,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : _queryStringOptions.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? _queryStringOptions.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : _queryStringOptions.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : _queryStringOptions.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : _queryStringOptions.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : _queryStringOptions.encodeValuesOnly,
      filter: c,
      format: i,
      formatter: s,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : _queryStringOptions.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : _queryStringOptions.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : _queryStringOptions.strictNullHandling
    };
  };
module.exports = function (r, o) {
  var t,
    i = r,
    s = optionsHandler(o);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArray(s.filter) && (t = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var f = arrayFormatters[s.arrayFormat],
    u = "comma" === f && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var d = sideChannelModule(), m = 0; m < t.length; ++m) {
    var v = t[m],
      h = i[v];
    s.skipNulls && null === h || arrayPushHandler(c, cyclicObjectHandler(h, v, f, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, d));
  }
  var w = c.join(s.delimiter),
    b = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? b += "utf8=%26%2310003%3B&" : b += "utf8=%E2%9C%93&"), w.length > 0 ? b + w : "";
};