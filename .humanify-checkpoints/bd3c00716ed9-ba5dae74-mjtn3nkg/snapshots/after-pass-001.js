"use strict";

var value = require("side-channel"),
  utils = require("./utils"),
  formats = require("./formats"),
  filterKeys = Object.prototype.hasOwnProperty,
  arrayFormatters = {
    brackets: function (value) {
      return value + "[]";
    },
    comma: "comma",
    indices: function (value, utils) {
      return value + "[" + utils + "]";
    },
    repeat: function (value) {
      return value;
    }
  },
  isArray = Array.isArray,
  defaultFormat = Array.prototype.push,
  arrayPush = function (value, utils) {
    defaultFormat.apply(value, isArray(utils) ? utils : [utils]);
  },
  inputObject = Date.prototype.toISOString,
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
    serializeDate: function (value) {
      return inputObject.call(value);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isPrimitiveType = function (value) {
    return "string" == typeof value || "number" == typeof value || "boolean" == typeof value || "symbol" == typeof value || "bigint" == typeof value;
  },
  cyclicReferenceTracker = {},
  circularReferenceHandler = function formats(filterKeys, arrayFormatters, defaultFormat, inputObject, resultArray, circularReferenceHandler, allowEmptyArraysOption, index, currentIndex, currentValue, queryString, queryPrefix, dateSerializer, cyclicReferenceTracker, currentDepth, objectValue, depth, currentObject) {
    for (var _currentValue = filterKeys, _currentObject = currentObject, __currentObject = 0, isCyclicReference = !1; void 0 !== (_currentObject = _currentObject.get(cyclicReferenceTracker)) && !isCyclicReference;) {
      var _currentDepth = _currentObject.get(filterKeys);
      if (__currentObject += 1, void 0 !== _currentDepth) {
        if (_currentDepth === __currentObject) throw new RangeError("Cyclic object value");
        isCyclicReference = !0;
      }
      void 0 === _currentObject.get(cyclicReferenceTracker) && (__currentObject = 0);
    }
    if ("function" == typeof currentValue ? _currentValue = currentValue(arrayFormatters, _currentValue) : _currentValue instanceof Date ? _currentValue = dateSerializer(_currentValue) : "comma" === defaultFormat && isArray(_currentValue) && (_currentValue = utils.maybeMap(_currentValue, function (value) {
      return value instanceof Date ? dateSerializer(value) : value;
    })), null === _currentValue) {
      if (circularReferenceHandler) return currentIndex && !objectValue ? currentIndex(arrayFormatters, queryStringOptions.encoder, depth, "key", cyclicReferenceTracker) : arrayFormatters;
      _currentValue = "";
    }
    if (isPrimitiveType(_currentValue) || utils.isBuffer(_currentValue)) return currentIndex ? [currentDepth(objectValue ? arrayFormatters : currentIndex(arrayFormatters, queryStringOptions.encoder, depth, "key", cyclicReferenceTracker)) + "=" + currentDepth(currentIndex(_currentValue, queryStringOptions.encoder, depth, "value", cyclicReferenceTracker))] : [currentDepth(arrayFormatters) + "=" + currentDepth(String(_currentValue))];
    var mappedValues,
      keysArray = [];
    if (void 0 === _currentValue) return keysArray;
    if ("comma" === defaultFormat && isArray(_currentValue)) objectValue && currentIndex && (_currentValue = utils.maybeMap(_currentValue, currentIndex)), mappedValues = [{
      value: _currentValue.length > 0 ? _currentValue.join(",") || null : void 0
    }];else if (isArray(currentValue)) mappedValues = currentValue;else {
      var _keysArray = Object.keys(_currentValue);
      mappedValues = queryString ? _keysArray.sort(queryString) : _keysArray;
    }
    var encodedKey = index ? String(arrayFormatters).replace(/\./g, "%2E") : String(arrayFormatters),
      basePath = inputObject && isArray(_currentValue) && 1 === _currentValue.length ? encodedKey + "[]" : encodedKey;
    if (resultArray && isArray(_currentValue) && 0 === _currentValue.length) return basePath + "[]";
    for (var _index = 0; _index < mappedValues.length; ++_index) {
      var key = mappedValues[_index],
        valueOrFallback = "object" == typeof key && key && void 0 !== key.value ? key.value : _currentValue[key];
      if (!allowEmptyArraysOption || null !== valueOrFallback) {
        var propertyName = queryPrefix && index ? String(key).replace(/\./g, "%2E") : String(key),
          formattedKey = isArray(_currentValue) ? "function" == typeof defaultFormat ? defaultFormat(basePath, propertyName) : basePath : basePath + (queryPrefix ? "." + propertyName : "[" + propertyName + "]");
        currentObject.set(filterKeys, __currentObject);
        var createNewMapEntry = value();
        createNewMapEntry.set(cyclicReferenceTracker, currentObject), arrayPush(keysArray, formats(valueOrFallback, formattedKey, defaultFormat, inputObject, resultArray, circularReferenceHandler, allowEmptyArraysOption, index, "comma" === defaultFormat && objectValue && isArray(_currentValue) ? null : currentIndex, currentValue, queryString, queryPrefix, dateSerializer, cyclicReferenceTracker, currentDepth, objectValue, depth, createNewMapEntry));
      }
    }
    return keysArray;
  },
  allowEmptyArraysOption = function (value) {
    if (!value) return queryStringOptions;
    if (void 0 !== value.allowEmptyArrays && "boolean" != typeof value.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== value.encodeDotInKeys && "boolean" != typeof value.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== value.encoder && void 0 !== value.encoder && "function" != typeof value.encoder) throw new TypeError("Encoder has to be a function.");
    var utils = value.charset || queryStringOptions.charset;
    if (void 0 !== value.charset && "utf-8" !== value.charset && "iso-8859-1" !== value.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var defaultFormat = formats.default;
    if (void 0 !== value.format) {
      if (!filterKeys.call(formats.formatters, value.format)) throw new TypeError("Unknown format option provided.");
      defaultFormat = value.format;
    }
    var arrayPush,
      inputObject = formats.formatters[defaultFormat],
      resultArray = queryStringOptions.filter;
    if (("function" == typeof value.filter || isArray(value.filter)) && (resultArray = value.filter), arrayPush = value.arrayFormat in arrayFormatters ? value.arrayFormat : "indices" in value ? value.indices ? "indices" : "repeat" : queryStringOptions.arrayFormat, "commaRoundTrip" in value && "boolean" != typeof value.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isPrimitiveType = void 0 === value.allowDots ? !0 === value.encodeDotInKeys || queryStringOptions.allowDots : !!value.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof value.addQueryPrefix ? value.addQueryPrefix : queryStringOptions.addQueryPrefix,
      allowDots: isPrimitiveType,
      allowEmptyArrays: "boolean" == typeof value.allowEmptyArrays ? !!value.allowEmptyArrays : queryStringOptions.allowEmptyArrays,
      arrayFormat: arrayPush,
      charset: utils,
      charsetSentinel: "boolean" == typeof value.charsetSentinel ? value.charsetSentinel : queryStringOptions.charsetSentinel,
      commaRoundTrip: !!value.commaRoundTrip,
      delimiter: void 0 === value.delimiter ? queryStringOptions.delimiter : value.delimiter,
      encode: "boolean" == typeof value.encode ? value.encode : queryStringOptions.encode,
      encodeDotInKeys: "boolean" == typeof value.encodeDotInKeys ? value.encodeDotInKeys : queryStringOptions.encodeDotInKeys,
      encoder: "function" == typeof value.encoder ? value.encoder : queryStringOptions.encoder,
      encodeValuesOnly: "boolean" == typeof value.encodeValuesOnly ? value.encodeValuesOnly : queryStringOptions.encodeValuesOnly,
      filter: resultArray,
      format: defaultFormat,
      formatter: inputObject,
      serializeDate: "function" == typeof value.serializeDate ? value.serializeDate : queryStringOptions.serializeDate,
      skipNulls: "boolean" == typeof value.skipNulls ? value.skipNulls : queryStringOptions.skipNulls,
      sort: "function" == typeof value.sort ? value.sort : null,
      strictNullHandling: "boolean" == typeof value.strictNullHandling ? value.strictNullHandling : queryStringOptions.strictNullHandling
    };
  };
module.exports = function (utils, formats) {
  var filterKeys,
    defaultFormat = utils,
    inputObject = allowEmptyArraysOption(formats);
  "function" == typeof inputObject.filter ? defaultFormat = (0, inputObject.filter)("", defaultFormat) : isArray(inputObject.filter) && (filterKeys = inputObject.filter);
  var resultArray = [];
  if ("object" != typeof defaultFormat || null === defaultFormat) return "";
  var queryStringOptions = arrayFormatters[inputObject.arrayFormat],
    isPrimitiveType = "comma" === queryStringOptions && inputObject.commaRoundTrip;
  filterKeys || (filterKeys = Object.keys(defaultFormat)), inputObject.sort && filterKeys.sort(inputObject.sort);
  for (var cyclicReferenceTracker = value(), index = 0; index < filterKeys.length; ++index) {
    var currentIndex = filterKeys[index],
      currentValue = defaultFormat[currentIndex];
    inputObject.skipNulls && null === currentValue || arrayPush(resultArray, circularReferenceHandler(currentValue, currentIndex, queryStringOptions, isPrimitiveType, inputObject.allowEmptyArrays, inputObject.strictNullHandling, inputObject.skipNulls, inputObject.encodeDotInKeys, inputObject.encode ? inputObject.encoder : null, inputObject.filter, inputObject.sort, inputObject.allowDots, inputObject.serializeDate, inputObject.format, inputObject.formatter, inputObject.encodeValuesOnly, inputObject.charset, cyclicReferenceTracker));
  }
  var queryString = resultArray.join(inputObject.delimiter),
    queryPrefix = !0 === inputObject.addQueryPrefix ? "?" : "";
  return inputObject.charsetSentinel && ("iso-8859-1" === inputObject.charset ? queryPrefix += "utf8=%26%2310003%3B&" : queryPrefix += "utf8=%E2%9C%93&"), queryString.length > 0 ? queryPrefix + queryString : "";
};