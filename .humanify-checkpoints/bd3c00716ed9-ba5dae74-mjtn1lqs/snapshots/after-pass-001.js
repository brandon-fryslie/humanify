"use strict";

var sideChannel = require("side-channel"),
  utils = require("./utils"),
  formats = require("./formats"),
  hasOwnProperty = Object.prototype.hasOwnProperty,
  currentIndex = {
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
  objectTraversal = function formats(hasOwnProperty, currentIndex, defaultFormat, inputObject, resultArray, objectTraversal, allowEmptyArraysOption, index, currentValue, cyclicReferenceHandler, queryString, queryPrefix, dateSerializer, currentDepth, circularReferenceCounter, depth, depthCounter, currentObject) {
    for (var currentObject = hasOwnProperty, currentObject = currentObject, currentObject = 0, isCyclicReference = !1; void 0 !== (currentObject = currentObject.get(circularReferenceTracker)) && !isCyclicReference;) {
      var currentDepth = currentObject.get(hasOwnProperty);
      if (currentObject += 1, void 0 !== currentDepth) {
        if (currentDepth === currentObject) throw new RangeError("Cyclic object value");
        isCyclicReference = !0;
      }
      void 0 === currentObject.get(circularReferenceTracker) && (currentObject = 0);
    }
    if ("function" == typeof cyclicReferenceHandler ? currentObject = cyclicReferenceHandler(currentIndex, currentObject) : currentObject instanceof Date ? currentObject = dateSerializer(currentObject) : "comma" === defaultFormat && isArray(currentObject) && (currentObject = utils.maybeMap(currentObject, function (sideChannel) {
      return sideChannel instanceof Date ? dateSerializer(sideChannel) : sideChannel;
    })), null === currentObject) {
      if (objectTraversal) return currentValue && !depth ? currentValue(currentIndex, queryStringOptions.encoder, depthCounter, "key", currentDepth) : currentIndex;
      currentObject = "";
    }
    if (isPrimitiveType(currentObject) || utils.isBuffer(currentObject)) return currentValue ? [circularReferenceCounter(depth ? currentIndex : currentValue(currentIndex, queryStringOptions.encoder, depthCounter, "key", currentDepth)) + "=" + circularReferenceCounter(currentValue(currentObject, queryStringOptions.encoder, depthCounter, "value", currentDepth))] : [circularReferenceCounter(currentIndex) + "=" + circularReferenceCounter(String(currentObject))];
    var keyValuePairs,
      keysArray = [];
    if (void 0 === currentObject) return keysArray;
    if ("comma" === defaultFormat && isArray(currentObject)) depth && currentValue && (currentObject = utils.maybeMap(currentObject, currentValue)), keyValuePairs = [{
      value: currentObject.length > 0 ? currentObject.join(",") || null : void 0
    }];else if (isArray(cyclicReferenceHandler)) keyValuePairs = cyclicReferenceHandler;else {
      var keysArray = Object.keys(currentObject);
      keyValuePairs = queryString ? keysArray.sort(queryString) : keysArray;
    }
    var propertyName = index ? String(currentIndex).replace(/\./g, "%2E") : String(currentIndex),
      basePath = inputObject && isArray(currentObject) && 1 === currentObject.length ? propertyName + "[]" : propertyName;
    if (resultArray && isArray(currentObject) && 0 === currentObject.length) return basePath + "[]";
    for (var index = 0; index < keyValuePairs.length; ++index) {
      var key = keyValuePairs[index],
        valueOrDefault = "object" == typeof key && key && void 0 !== key.value ? key.value : currentObject[key];
      if (!allowEmptyArraysOption || null !== valueOrDefault) {
        var propertyName = queryPrefix && index ? String(key).replace(/\./g, "%2E") : String(key),
          formattedKey = isArray(currentObject) ? "function" == typeof defaultFormat ? defaultFormat(basePath, propertyName) : basePath : basePath + (queryPrefix ? "." + propertyName : "[" + propertyName + "]");
        currentObject.set(hasOwnProperty, currentObject);
        var arrayElement = sideChannel();
        arrayElement.set(circularReferenceTracker, currentObject), arrayPush(keysArray, formats(valueOrDefault, formattedKey, defaultFormat, inputObject, resultArray, objectTraversal, allowEmptyArraysOption, index, "comma" === defaultFormat && depth && isArray(currentObject) ? null : currentValue, cyclicReferenceHandler, queryString, queryPrefix, dateSerializer, currentDepth, circularReferenceCounter, depth, depthCounter, arrayElement));
      }
    }
    return keysArray;
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
      if (!hasOwnProperty.call(formats.formatters, sideChannel.format)) throw new TypeError("Unknown format option provided.");
      defaultFormat = sideChannel.format;
    }
    var arrayPush,
      inputObject = formats.formatters[defaultFormat],
      resultArray = queryStringOptions.filter;
    if (("function" == typeof sideChannel.filter || isArray(sideChannel.filter)) && (resultArray = sideChannel.filter), arrayPush = sideChannel.arrayFormat in currentIndex ? sideChannel.arrayFormat : "indices" in sideChannel ? sideChannel.indices ? "indices" : "repeat" : queryStringOptions.arrayFormat, "commaRoundTrip" in sideChannel && "boolean" != typeof sideChannel.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
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
  var hasOwnProperty,
    defaultFormat = utils,
    inputObject = allowEmptyArraysOption(formats);
  "function" == typeof inputObject.filter ? defaultFormat = (0, inputObject.filter)("", defaultFormat) : isArray(inputObject.filter) && (hasOwnProperty = inputObject.filter);
  var resultArray = [];
  if ("object" != typeof defaultFormat || null === defaultFormat) return "";
  var queryStringOptions = currentIndex[inputObject.arrayFormat],
    isPrimitiveType = "comma" === queryStringOptions && inputObject.commaRoundTrip;
  hasOwnProperty || (hasOwnProperty = Object.keys(defaultFormat)), inputObject.sort && hasOwnProperty.sort(inputObject.sort);
  for (var circularReferenceTracker = sideChannel(), index = 0; index < hasOwnProperty.length; ++index) {
    var currentValue = hasOwnProperty[index],
      cyclicReferenceHandler = defaultFormat[currentValue];
    inputObject.skipNulls && null === cyclicReferenceHandler || arrayPush(resultArray, objectTraversal(cyclicReferenceHandler, currentValue, queryStringOptions, isPrimitiveType, inputObject.allowEmptyArrays, inputObject.strictNullHandling, inputObject.skipNulls, inputObject.encodeDotInKeys, inputObject.encode ? inputObject.encoder : null, inputObject.filter, inputObject.sort, inputObject.allowDots, inputObject.serializeDate, inputObject.format, inputObject.formatter, inputObject.encodeValuesOnly, inputObject.charset, circularReferenceTracker));
  }
  var queryString = resultArray.join(inputObject.delimiter),
    queryPrefix = !0 === inputObject.addQueryPrefix ? "?" : "";
  return inputObject.charsetSentinel && ("iso-8859-1" === inputObject.charset ? queryPrefix += "utf8=%26%2310003%3B&" : queryPrefix += "utf8=%E2%9C%93&"), queryString.length > 0 ? queryPrefix + queryString : "";
};