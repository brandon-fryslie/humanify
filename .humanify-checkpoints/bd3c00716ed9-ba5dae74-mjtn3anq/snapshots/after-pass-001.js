"use strict";

var sideChannel = require("side-channel"),
  utils = require("./utils"),
  formats = require("./formats"),
  _hasOwnProperty = Object.prototype.hasOwnProperty,
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
  defaultFormat = Array.prototype.push,
  arrayPush = function (sideChannel, utils) {
    defaultFormat.apply(sideChannel, isArray(utils) ? utils : [utils]);
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
    serializeDate: function (sideChannel) {
      return inputObject.call(sideChannel);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isPrimitiveType = function (sideChannel) {
    return "string" == typeof sideChannel || "number" == typeof sideChannel || "boolean" == typeof sideChannel || "symbol" == typeof sideChannel || "bigint" == typeof sideChannel;
  },
  circularReferenceTracker = {},
  circularReferenceHandler = function formats(_hasOwnProperty, arrayFormatters, defaultFormat, inputObject, resultArray, circularReferenceHandler, allowEmptyArraysOption, index, objectTraversalDepth, callbackFunction, queryString, queryPrefix, dateSerializer, identifierD, currentValue, objectValue, depthCounter, currentObject) {
    for (var _currentObject = _hasOwnProperty, objectTraversal = currentObject, _currentValue = 0, isCyclicReference = !1; void 0 !== (objectTraversal = objectTraversal.get(circularReferenceTracker)) && !isCyclicReference;) {
      var currentIteration = objectTraversal.get(_hasOwnProperty);
      if (_currentValue += 1, void 0 !== currentIteration) {
        if (currentIteration === _currentValue) throw new RangeError("Cyclic object value");
        isCyclicReference = !0;
      }
      void 0 === objectTraversal.get(circularReferenceTracker) && (_currentValue = 0);
    }
    if ("function" == typeof callbackFunction ? _currentObject = callbackFunction(arrayFormatters, _currentObject) : _currentObject instanceof Date ? _currentObject = dateSerializer(_currentObject) : "comma" === defaultFormat && isArray(_currentObject) && (_currentObject = utils.maybeMap(_currentObject, function (sideChannel) {
      return sideChannel instanceof Date ? dateSerializer(sideChannel) : sideChannel;
    })), null === _currentObject) {
      if (circularReferenceHandler) return objectTraversalDepth && !objectValue ? objectTraversalDepth(arrayFormatters, queryStringOptions.encoder, depthCounter, "key", identifierD) : arrayFormatters;
      _currentObject = "";
    }
    if (isPrimitiveType(_currentObject) || utils.isBuffer(_currentObject)) return objectTraversalDepth ? [currentValue(objectValue ? arrayFormatters : objectTraversalDepth(arrayFormatters, queryStringOptions.encoder, depthCounter, "key", identifierD)) + "=" + currentValue(objectTraversalDepth(_currentObject, queryStringOptions.encoder, depthCounter, "value", identifierD))] : [currentValue(arrayFormatters) + "=" + currentValue(String(_currentObject))];
    var mappedValues,
      _resultArray = [];
    if (void 0 === _currentObject) return _resultArray;
    if ("comma" === defaultFormat && isArray(_currentObject)) objectValue && objectTraversalDepth && (_currentObject = utils.maybeMap(_currentObject, objectTraversalDepth)), mappedValues = [{
      value: _currentObject.length > 0 ? _currentObject.join(",") || null : void 0
    }];else if (isArray(callbackFunction)) mappedValues = callbackFunction;else {
      var keysArray = Object.keys(_currentObject);
      mappedValues = queryString ? keysArray.sort(queryString) : keysArray;
    }
    var encodedKey = index ? String(arrayFormatters).replace(/\./g, "%2E") : String(arrayFormatters),
      parameterizedKey = inputObject && isArray(_currentObject) && 1 === _currentObject.length ? encodedKey + "[]" : encodedKey;
    if (resultArray && isArray(_currentObject) && 0 === _currentObject.length) return parameterizedKey + "[]";
    for (var _index = 0; _index < mappedValues.length; ++_index) {
      var key = mappedValues[_index],
        valueOrFallback = "object" == typeof key && key && void 0 !== key.value ? key.value : _currentObject[key];
      if (!allowEmptyArraysOption || null !== valueOrFallback) {
        var propertyName = queryPrefix && index ? String(key).replace(/\./g, "%2E") : String(key),
          formattedKey = isArray(_currentObject) ? "function" == typeof defaultFormat ? defaultFormat(parameterizedKey, propertyName) : parameterizedKey : parameterizedKey + (queryPrefix ? "." + propertyName : "[" + propertyName + "]");
        currentObject.set(_hasOwnProperty, _currentValue);
        var createNewObject = sideChannel();
        createNewObject.set(circularReferenceTracker, currentObject), arrayPush(_resultArray, formats(valueOrFallback, formattedKey, defaultFormat, inputObject, resultArray, circularReferenceHandler, allowEmptyArraysOption, index, "comma" === defaultFormat && objectValue && isArray(_currentObject) ? null : objectTraversalDepth, callbackFunction, queryString, queryPrefix, dateSerializer, identifierD, currentValue, objectValue, depthCounter, createNewObject));
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
    var defaultFormat = formats.default;
    if (void 0 !== sideChannel.format) {
      if (!_hasOwnProperty.call(formats.formatters, sideChannel.format)) throw new TypeError("Unknown format option provided.");
      defaultFormat = sideChannel.format;
    }
    var arrayPush,
      inputObject = formats.formatters[defaultFormat],
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
      format: defaultFormat,
      formatter: inputObject,
      serializeDate: "function" == typeof sideChannel.serializeDate ? sideChannel.serializeDate : queryStringOptions.serializeDate,
      skipNulls: "boolean" == typeof sideChannel.skipNulls ? sideChannel.skipNulls : queryStringOptions.skipNulls,
      sort: "function" == typeof sideChannel.sort ? sideChannel.sort : null,
      strictNullHandling: "boolean" == typeof sideChannel.strictNullHandling ? sideChannel.strictNullHandling : queryStringOptions.strictNullHandling
    };
  };
module.exports = function (utils, formats) {
  var _hasOwnProperty,
    defaultFormat = utils,
    inputObject = allowEmptyArraysOption(formats);
  "function" == typeof inputObject.filter ? defaultFormat = (0, inputObject.filter)("", defaultFormat) : isArray(inputObject.filter) && (_hasOwnProperty = inputObject.filter);
  var resultArray = [];
  if ("object" != typeof defaultFormat || null === defaultFormat) return "";
  var queryStringOptions = arrayFormatters[inputObject.arrayFormat],
    isPrimitiveType = "comma" === queryStringOptions && inputObject.commaRoundTrip;
  _hasOwnProperty || (_hasOwnProperty = Object.keys(defaultFormat)), inputObject.sort && _hasOwnProperty.sort(inputObject.sort);
  for (var circularReferenceTracker = sideChannel(), index = 0; index < _hasOwnProperty.length; ++index) {
    var objectTraversalDepth = _hasOwnProperty[index],
      callbackFunction = defaultFormat[objectTraversalDepth];
    inputObject.skipNulls && null === callbackFunction || arrayPush(resultArray, circularReferenceHandler(callbackFunction, objectTraversalDepth, queryStringOptions, isPrimitiveType, inputObject.allowEmptyArrays, inputObject.strictNullHandling, inputObject.skipNulls, inputObject.encodeDotInKeys, inputObject.encode ? inputObject.encoder : null, inputObject.filter, inputObject.sort, inputObject.allowDots, inputObject.serializeDate, inputObject.format, inputObject.formatter, inputObject.encodeValuesOnly, inputObject.charset, circularReferenceTracker));
  }
  var queryString = resultArray.join(inputObject.delimiter),
    queryPrefix = !0 === inputObject.addQueryPrefix ? "?" : "";
  return inputObject.charsetSentinel && ("iso-8859-1" === inputObject.charset ? queryPrefix += "utf8=%26%2310003%3B&" : queryPrefix += "utf8=%E2%9C%93&"), queryString.length > 0 ? queryPrefix + queryString : "";
};