"use strict";

var sideChannel = require("side-channel"),
  utils = require("./utils"),
  formats = require("./formats"),
  keysArray = Object.prototype.hasOwnProperty,
  arrayFormatters = {
    brackets: function (sideChannel) {
      return sideChannel + "[]";
    },
    comma: "comma",
    indices: function (sideChannel, utils) {
      return sideChannel + "[" + utils + "]";
    },
    repeat: function (sideChannel) {
      return sideChannel;
    }
  },
  isArray = Array.isArray,
  filterFunction = Array.prototype.push,
  arrayPush = function (sideChannel, utils) {
    filterFunction.apply(sideChannel, isArray(utils) ? utils : [utils]);
  },
  toISOStringMethod = Date.prototype.toISOString,
  resultArray = formats.default,
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
    format: resultArray,
    formatter: formats.formatters[resultArray],
    indices: !1,
    serializeDate: function (sideChannel) {
      return toISOStringMethod.call(sideChannel);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isPrimitiveType = function (sideChannel) {
    return "string" == typeof sideChannel || "number" == typeof sideChannel || "boolean" == typeof sideChannel || "symbol" == typeof sideChannel || "bigint" == typeof sideChannel;
  },
  circularReferenceTracker = {},
  processObject = function formats(keysArray, arrayFormatters, filterFunction, toISOStringMethod, resultArray, processObject, allowEmptyArraysOption, index, key, currentValue, queryString, currentIndex, dateSerializer, cycleDetector, currentDepth, objectValue, depthCounter, currentObject) {
    for (var _currentObject = keysArray, _objectValue = currentObject, _currentIndex = 0, isCyclicReference = !1; void 0 !== (_objectValue = _objectValue.get(circularReferenceTracker)) && !isCyclicReference;) {
      var __currentObject = _objectValue.get(keysArray);
      if (_currentIndex += 1, void 0 !== __currentObject) {
        if (__currentObject === _currentIndex) throw new RangeError("Cyclic object value");
        isCyclicReference = !0;
      }
      void 0 === _objectValue.get(circularReferenceTracker) && (_currentIndex = 0);
    }
    if ("function" == typeof currentValue ? _currentObject = currentValue(arrayFormatters, _currentObject) : _currentObject instanceof Date ? _currentObject = dateSerializer(_currentObject) : "comma" === filterFunction && isArray(_currentObject) && (_currentObject = utils.maybeMap(_currentObject, function (sideChannel) {
      return sideChannel instanceof Date ? dateSerializer(sideChannel) : sideChannel;
    })), null === _currentObject) {
      if (processObject) return key && !objectValue ? key(arrayFormatters, queryStringOptions.encoder, depthCounter, "key", cycleDetector) : arrayFormatters;
      _currentObject = "";
    }
    if (isPrimitiveType(_currentObject) || utils.isBuffer(_currentObject)) return key ? [currentDepth(objectValue ? arrayFormatters : key(arrayFormatters, queryStringOptions.encoder, depthCounter, "key", cycleDetector)) + "=" + currentDepth(key(_currentObject, queryStringOptions.encoder, depthCounter, "value", cycleDetector))] : [currentDepth(arrayFormatters) + "=" + currentDepth(String(_currentObject))];
    var mappedValues,
      _resultArray = [];
    if (void 0 === _currentObject) return _resultArray;
    if ("comma" === filterFunction && isArray(_currentObject)) objectValue && key && (_currentObject = utils.maybeMap(_currentObject, key)), mappedValues = [{
      value: _currentObject.length > 0 ? _currentObject.join(",") || null : void 0
    }];else if (isArray(currentValue)) mappedValues = currentValue;else {
      var _keysArray = Object.keys(_currentObject);
      mappedValues = queryString ? _keysArray.sort(queryString) : _keysArray;
    }
    var encodedKey = index ? String(arrayFormatters).replace(/\./g, "%2E") : String(arrayFormatters),
      basePath = toISOStringMethod && isArray(_currentObject) && 1 === _currentObject.length ? encodedKey + "[]" : encodedKey;
    if (resultArray && isArray(_currentObject) && 0 === _currentObject.length) return basePath + "[]";
    for (var _index = 0; _index < mappedValues.length; ++_index) {
      var _key = mappedValues[_index],
        valueOrDefault = "object" == typeof _key && _key && void 0 !== _key.value ? _key.value : _currentObject[_key];
      if (!allowEmptyArraysOption || null !== valueOrDefault) {
        var propertyName = currentIndex && index ? String(_key).replace(/\./g, "%2E") : String(_key),
          formattedKey = isArray(_currentObject) ? "function" == typeof filterFunction ? filterFunction(basePath, propertyName) : basePath : basePath + (currentIndex ? "." + propertyName : "[" + propertyName + "]");
        currentObject.set(keysArray, _currentIndex);
        var arrayElement = sideChannel();
        arrayElement.set(circularReferenceTracker, currentObject), arrayPush(_resultArray, formats(valueOrDefault, formattedKey, filterFunction, toISOStringMethod, resultArray, processObject, allowEmptyArraysOption, index, "comma" === filterFunction && objectValue && isArray(_currentObject) ? null : key, currentValue, queryString, currentIndex, dateSerializer, cycleDetector, currentDepth, objectValue, depthCounter, arrayElement));
      }
    }
    return _resultArray;
  },
  allowEmptyArraysOption = function (sideChannel) {
    if (!sideChannel) return queryStringOptions;
    if (void 0 !== sideChannel.allowEmptyArrays && "boolean" != typeof sideChannel.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== sideChannel.encodeDotInKeys && "boolean" != typeof sideChannel.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== sideChannel.encoder && void 0 !== sideChannel.encoder && "function" != typeof sideChannel.encoder) throw new TypeError("Encoder has to be a function.");
    var utils = sideChannel.charset || queryStringOptions.charset;
    if (void 0 !== sideChannel.charset && "utf-8" !== sideChannel.charset && "iso-8859-1" !== sideChannel.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var filterFunction = formats.default;
    if (void 0 !== sideChannel.format) {
      if (!keysArray.call(formats.formatters, sideChannel.format)) throw new TypeError("Unknown format option provided.");
      filterFunction = sideChannel.format;
    }
    var arrayPush,
      toISOStringMethod = formats.formatters[filterFunction],
      resultArray = queryStringOptions.filter;
    if (("function" == typeof sideChannel.filter || isArray(sideChannel.filter)) && (resultArray = sideChannel.filter), arrayPush = sideChannel.arrayFormat in arrayFormatters ? sideChannel.arrayFormat : "indices" in sideChannel ? sideChannel.indices ? "indices" : "repeat" : queryStringOptions.arrayFormat, "commaRoundTrip" in sideChannel && "boolean" != typeof sideChannel.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isPrimitiveType = void 0 === sideChannel.allowDots ? !0 === sideChannel.encodeDotInKeys || queryStringOptions.allowDots : !!sideChannel.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof sideChannel.addQueryPrefix ? sideChannel.addQueryPrefix : queryStringOptions.addQueryPrefix,
      allowDots: isPrimitiveType,
      allowEmptyArrays: "boolean" == typeof sideChannel.allowEmptyArrays ? !!sideChannel.allowEmptyArrays : queryStringOptions.allowEmptyArrays,
      arrayFormat: arrayPush,
      charset: utils,
      charsetSentinel: "boolean" == typeof sideChannel.charsetSentinel ? sideChannel.charsetSentinel : queryStringOptions.charsetSentinel,
      commaRoundTrip: !!sideChannel.commaRoundTrip,
      delimiter: void 0 === sideChannel.delimiter ? queryStringOptions.delimiter : sideChannel.delimiter,
      encode: "boolean" == typeof sideChannel.encode ? sideChannel.encode : queryStringOptions.encode,
      encodeDotInKeys: "boolean" == typeof sideChannel.encodeDotInKeys ? sideChannel.encodeDotInKeys : queryStringOptions.encodeDotInKeys,
      encoder: "function" == typeof sideChannel.encoder ? sideChannel.encoder : queryStringOptions.encoder,
      encodeValuesOnly: "boolean" == typeof sideChannel.encodeValuesOnly ? sideChannel.encodeValuesOnly : queryStringOptions.encodeValuesOnly,
      filter: resultArray,
      format: filterFunction,
      formatter: toISOStringMethod,
      serializeDate: "function" == typeof sideChannel.serializeDate ? sideChannel.serializeDate : queryStringOptions.serializeDate,
      skipNulls: "boolean" == typeof sideChannel.skipNulls ? sideChannel.skipNulls : queryStringOptions.skipNulls,
      sort: "function" == typeof sideChannel.sort ? sideChannel.sort : null,
      strictNullHandling: "boolean" == typeof sideChannel.strictNullHandling ? sideChannel.strictNullHandling : queryStringOptions.strictNullHandling
    };
  };
module.exports = function (utils, formats) {
  var keysArray,
    filterFunction = utils,
    toISOStringMethod = allowEmptyArraysOption(formats);
  "function" == typeof toISOStringMethod.filter ? filterFunction = (0, toISOStringMethod.filter)("", filterFunction) : isArray(toISOStringMethod.filter) && (keysArray = toISOStringMethod.filter);
  var resultArray = [];
  if ("object" != typeof filterFunction || null === filterFunction) return "";
  var queryStringOptions = arrayFormatters[toISOStringMethod.arrayFormat],
    isPrimitiveType = "comma" === queryStringOptions && toISOStringMethod.commaRoundTrip;
  keysArray || (keysArray = Object.keys(filterFunction)), toISOStringMethod.sort && keysArray.sort(toISOStringMethod.sort);
  for (var circularReferenceTracker = sideChannel(), index = 0; index < keysArray.length; ++index) {
    var key = keysArray[index],
      currentValue = filterFunction[key];
    toISOStringMethod.skipNulls && null === currentValue || arrayPush(resultArray, processObject(currentValue, key, queryStringOptions, isPrimitiveType, toISOStringMethod.allowEmptyArrays, toISOStringMethod.strictNullHandling, toISOStringMethod.skipNulls, toISOStringMethod.encodeDotInKeys, toISOStringMethod.encode ? toISOStringMethod.encoder : null, toISOStringMethod.filter, toISOStringMethod.sort, toISOStringMethod.allowDots, toISOStringMethod.serializeDate, toISOStringMethod.format, toISOStringMethod.formatter, toISOStringMethod.encodeValuesOnly, toISOStringMethod.charset, circularReferenceTracker));
  }
  var queryString = resultArray.join(toISOStringMethod.delimiter),
    currentIndex = !0 === toISOStringMethod.addQueryPrefix ? "?" : "";
  return toISOStringMethod.charsetSentinel && ("iso-8859-1" === toISOStringMethod.charset ? currentIndex += "utf8=%26%2310003%3B&" : currentIndex += "utf8=%E2%9C%93&"), queryString.length > 0 ? currentIndex + queryString : "";
};