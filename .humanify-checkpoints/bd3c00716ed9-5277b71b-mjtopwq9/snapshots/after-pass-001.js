"use strict";

var sideChannel = require("side-channel"),
  utilsModule = require("./utils"),
  formatUtils = require("./formats"),
  hasOwnPropertyCheck = Object.prototype.hasOwnProperty,
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
  arrayPushFunction = Array.prototype.push,
  arrayPushHandler = function (e, r) {
    arrayPushFunction.apply(e, isArray(r) ? r : [r]);
  },
  inputData = Date.prototype.toISOString,
  queryStringFormatOptions = formatUtils.default,
  strictNullHandlingFlag = {
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
    format: queryStringFormatOptions,
    formatter: formatUtils.formatters[queryStringFormatOptions],
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
  objectReferenceMap = {},
  cyclicObjectCheckCounter = function o(t, n, i, s, c, y, p, currentIndex, keyForIteration, inputValue, queryString, queryPrefixIndicator, dateSerializationHandler, cyclicReferenceCounter, currentDepthLevel, currentIterationCount, _currentDepthLevel, currentObjectReference) {
    for (var currentObjectValue = t, _currentObjectReference = currentObjectReference, currentObjectDepth = 0, iterationCount = !1; void 0 !== (_currentObjectReference = _currentObjectReference.get(objectReferenceMap)) && !iterationCount;) {
      var cyclicReferenceCount = _currentObjectReference.get(t);
      if (currentObjectDepth += 1, void 0 !== cyclicReferenceCount) {
        if (cyclicReferenceCount === currentObjectDepth) throw new RangeError("Cyclic object value");
        iterationCount = !0;
      }
      void 0 === _currentObjectReference.get(objectReferenceMap) && (currentObjectDepth = 0);
    }
    if ("function" == typeof inputValue ? currentObjectValue = inputValue(n, currentObjectValue) : currentObjectValue instanceof Date ? currentObjectValue = dateSerializationHandler(currentObjectValue) : "comma" === i && isArray(currentObjectValue) && (currentObjectValue = utilsModule.maybeMap(currentObjectValue, function (e) {
      return e instanceof Date ? dateSerializationHandler(e) : e;
    })), null === currentObjectValue) {
      if (y) return keyForIteration && !currentIterationCount ? keyForIteration(n, strictNullHandlingFlag.encoder, _currentDepthLevel, "key", cyclicReferenceCounter) : n;
      currentObjectValue = "";
    }
    if (isPrimitiveType(currentObjectValue) || utilsModule.isBuffer(currentObjectValue)) return keyForIteration ? [currentDepthLevel(currentIterationCount ? n : keyForIteration(n, strictNullHandlingFlag.encoder, _currentDepthLevel, "key", cyclicReferenceCounter)) + "=" + currentDepthLevel(keyForIteration(currentObjectValue, strictNullHandlingFlag.encoder, _currentDepthLevel, "value", cyclicReferenceCounter))] : [currentDepthLevel(n) + "=" + currentDepthLevel(String(currentObjectValue))];
    var mappedValuesArray,
      processedValuesArray = [];
    if (void 0 === currentObjectValue) return processedValuesArray;
    if ("comma" === i && isArray(currentObjectValue)) currentIterationCount && keyForIteration && (currentObjectValue = utilsModule.maybeMap(currentObjectValue, keyForIteration)), mappedValuesArray = [{
      value: currentObjectValue.length > 0 ? currentObjectValue.join(",") || null : void 0
    }];else if (isArray(inputValue)) mappedValuesArray = inputValue;else {
      var keyList = Object.keys(currentObjectValue);
      mappedValuesArray = queryString ? keyList.sort(queryString) : keyList;
    }
    var encodedKey = currentIndex ? String(n).replace(/\./g, "%2E") : String(n),
      formattedKeyPath = s && isArray(currentObjectValue) && 1 === currentObjectValue.length ? encodedKey + "[]" : encodedKey;
    if (c && isArray(currentObjectValue) && 0 === currentObjectValue.length) return formattedKeyPath + "[]";
    for (var indexCounter = 0; indexCounter < mappedValuesArray.length; ++indexCounter) {
      var currentKey = mappedValuesArray[indexCounter],
        currentValue = "object" == typeof currentKey && currentKey && void 0 !== currentKey.value ? currentKey.value : currentObjectValue[currentKey];
      if (!p || null !== currentValue) {
        var formattedIdentifier = queryPrefixIndicator && currentIndex ? String(currentKey).replace(/\./g, "%2E") : String(currentKey),
          _formattedKeyPath = isArray(currentObjectValue) ? "function" == typeof i ? i(formattedKeyPath, formattedIdentifier) : formattedKeyPath : formattedKeyPath + (queryPrefixIndicator ? "." + formattedIdentifier : "[" + formattedIdentifier + "]");
        currentObjectReference.set(t, currentObjectDepth);
        var resultSet = sideChannel();
        resultSet.set(objectReferenceMap, currentObjectReference), arrayPushHandler(processedValuesArray, o(currentValue, _formattedKeyPath, i, s, c, y, p, currentIndex, "comma" === i && currentIterationCount && isArray(currentObjectValue) ? null : keyForIteration, inputValue, queryString, queryPrefixIndicator, dateSerializationHandler, cyclicReferenceCounter, currentDepthLevel, currentIterationCount, _currentDepthLevel, resultSet));
      }
    }
    return processedValuesArray;
  },
  optionsValidator = function (e) {
    if (!e) return strictNullHandlingFlag;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || strictNullHandlingFlag.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = formatUtils.default;
    if (void 0 !== e.format) {
      if (!hasOwnPropertyCheck.call(formatUtils.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var l,
      s = formatUtils.formatters[i],
      c = strictNullHandlingFlag.filter;
    if (("function" == typeof e.filter || isArray(e.filter)) && (c = e.filter), l = e.arrayFormat in arrayFormatters ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : strictNullHandlingFlag.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var u = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || strictNullHandlingFlag.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : strictNullHandlingFlag.addQueryPrefix,
      allowDots: u,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : strictNullHandlingFlag.allowEmptyArrays,
      arrayFormat: l,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : strictNullHandlingFlag.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? strictNullHandlingFlag.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : strictNullHandlingFlag.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : strictNullHandlingFlag.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : strictNullHandlingFlag.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : strictNullHandlingFlag.encodeValuesOnly,
      filter: c,
      format: i,
      formatter: s,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : strictNullHandlingFlag.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : strictNullHandlingFlag.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : strictNullHandlingFlag.strictNullHandling
    };
  };
module.exports = function (r, o) {
  var t,
    i = r,
    s = optionsValidator(o);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArray(s.filter) && (t = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var f = arrayFormatters[s.arrayFormat],
    u = "comma" === f && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var d = sideChannel(), m = 0; m < t.length; ++m) {
    var v = t[m],
      h = i[v];
    s.skipNulls && null === h || arrayPushHandler(c, cyclicObjectCheckCounter(h, v, f, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, d));
  }
  var w = c.join(s.delimiter),
    b = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? b += "utf8=%26%2310003%3B&" : b += "utf8=%E2%9C%93&"), w.length > 0 ? b + w : "";
};