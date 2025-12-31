"use strict";

var sideChannelHandler = require("side-channel"),
  utilityFunctionsModule = require("./utils"),
  formattingUtilities = require("./formats"),
  hasOwnPropertyMethod = Object.prototype.hasOwnProperty,
  arrayFormatHandlers = {
    brackets: function (optionsHandlerInput) {
      return optionsHandlerInput + "[]";
    },
    comma: "comma",
    indices: function (e, charsetOptionValue) {
      return e + "[" + charsetOptionValue + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArrayFunction = Array.isArray,
  arrayPushMethod = Array.prototype.push,
  arrayElementAppender = function (e, r) {
    arrayPushMethod.apply(e, isArrayFunction(r) ? r : [r]);
  },
  dateToISOStringConverter = Date.prototype.toISOString,
  defaultQueryStringOptions = formattingUtilities.default,
  queryStringConfiguration = {
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
    encoder: utilityFunctionsModule.encode,
    encodeValuesOnly: !1,
    filter: void 0,
    format: defaultQueryStringOptions,
    formatter: formattingUtilities.formatters[defaultQueryStringOptions],
    indices: !1,
    serializeDate: function (e) {
      return dateToISOStringConverter.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isValuePrimitive = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  visitedObjectsTracker = {},
  cyclicObjectHandlerFunction = function __queryStringOptions(filteredKeysArray, currentIndexInIteration, inputDataReference, optionsHandlerResult, _resultArray, cyclicObjectCheckCount, _optionsHandler, currentIterationIndex, currentKeyForIteration, inputValueForIteration, queryStringParameters, queryParameterPrefix, dateSerializationFunction, cyclicReferenceCount, currentDepthLevelCounter, _currentDepthLevelCounter, currentObjectIndex, visitedObjectReference) {
    for (var currentObjectState = filteredKeysArray, _visitedObjectReference = visitedObjectReference, iterationCounter = 0, iterationCompletedFlag = !1; void 0 !== (_visitedObjectReference = _visitedObjectReference.get(visitedObjectsTracker)) && !iterationCompletedFlag;) {
      var cyclicObjectReferenceCount = _visitedObjectReference.get(filteredKeysArray);
      if (iterationCounter += 1, void 0 !== cyclicObjectReferenceCount) {
        if (cyclicObjectReferenceCount === iterationCounter) throw new RangeError("Cyclic object value");
        iterationCompletedFlag = !0;
      }
      void 0 === _visitedObjectReference.get(visitedObjectsTracker) && (iterationCounter = 0);
    }
    if ("function" == typeof inputValueForIteration ? currentObjectState = inputValueForIteration(currentIndexInIteration, currentObjectState) : currentObjectState instanceof Date ? currentObjectState = dateSerializationFunction(currentObjectState) : "comma" === inputDataReference && isArrayFunction(currentObjectState) && (currentObjectState = utilityFunctionsModule.maybeMap(currentObjectState, function (e) {
      return e instanceof Date ? dateSerializationFunction(e) : e;
    })), null === currentObjectState) {
      if (cyclicObjectCheckCount) return currentKeyForIteration && !_currentDepthLevelCounter ? currentKeyForIteration(currentIndexInIteration, queryStringConfiguration.encoder, currentObjectIndex, "key", cyclicReferenceCount) : currentIndexInIteration;
      currentObjectState = "";
    }
    if (isValuePrimitive(currentObjectState) || utilityFunctionsModule.isBuffer(currentObjectState)) return currentKeyForIteration ? [currentDepthLevelCounter(_currentDepthLevelCounter ? currentIndexInIteration : currentKeyForIteration(currentIndexInIteration, queryStringConfiguration.encoder, currentObjectIndex, "key", cyclicReferenceCount)) + "=" + currentDepthLevelCounter(currentKeyForIteration(currentObjectState, queryStringConfiguration.encoder, currentObjectIndex, "value", cyclicReferenceCount))] : [currentDepthLevelCounter(currentIndexInIteration) + "=" + currentDepthLevelCounter(String(currentObjectState))];
    var mappedValueList,
      mappedResultArray = [];
    if (void 0 === currentObjectState) return mappedResultArray;
    if ("comma" === inputDataReference && isArrayFunction(currentObjectState)) _currentDepthLevelCounter && currentKeyForIteration && (currentObjectState = utilityFunctionsModule.maybeMap(currentObjectState, currentKeyForIteration)), mappedValueList = [{
      value: currentObjectState.length > 0 ? currentObjectState.join(",") || null : void 0
    }];else if (isArrayFunction(inputValueForIteration)) mappedValueList = inputValueForIteration;else {
      var currentObjectKeyList = Object.keys(currentObjectState);
      mappedValueList = queryStringParameters ? currentObjectKeyList.sort(queryStringParameters) : currentObjectKeyList;
    }
    var encodedKeyForCurrentIndex = currentIterationIndex ? String(currentIndexInIteration).replace(/\./g, "%2E") : String(currentIndexInIteration),
      encodedPathForArray = optionsHandlerResult && isArrayFunction(currentObjectState) && 1 === currentObjectState.length ? encodedKeyForCurrentIndex + "[]" : encodedKeyForCurrentIndex;
    if (_resultArray && isArrayFunction(currentObjectState) && 0 === currentObjectState.length) return encodedPathForArray + "[]";
    for (var currentItemIndex = 0; currentItemIndex < mappedValueList.length; ++currentItemIndex) {
      var mappedValueKey = mappedValueList[currentItemIndex],
        resolvedValueOrDefault = "object" == typeof mappedValueKey && mappedValueKey && void 0 !== mappedValueKey.value ? mappedValueKey.value : currentObjectState[mappedValueKey];
      if (!_optionsHandler || null !== resolvedValueOrDefault) {
        var formattedKeyName = queryParameterPrefix && currentIterationIndex ? String(mappedValueKey).replace(/\./g, "%2E") : String(mappedValueKey),
          propertyAccessPath = isArrayFunction(currentObjectState) ? "function" == typeof inputDataReference ? inputDataReference(encodedPathForArray, formattedKeyName) : encodedPathForArray : encodedPathForArray + (queryParameterPrefix ? "." + formattedKeyName : "[" + formattedKeyName + "]");
        visitedObjectReference.set(filteredKeysArray, iterationCounter);
        var sideChannelDataMap = sideChannelHandler();
        sideChannelDataMap.set(visitedObjectsTracker, visitedObjectReference), arrayElementAppender(mappedResultArray, __queryStringOptions(resolvedValueOrDefault, propertyAccessPath, inputDataReference, optionsHandlerResult, _resultArray, cyclicObjectCheckCount, _optionsHandler, currentIterationIndex, "comma" === inputDataReference && _currentDepthLevelCounter && isArrayFunction(currentObjectState) ? null : currentKeyForIteration, inputValueForIteration, queryStringParameters, queryParameterPrefix, dateSerializationFunction, cyclicReferenceCount, currentDepthLevelCounter, _currentDepthLevelCounter, currentObjectIndex, sideChannelDataMap));
      }
    }
    return mappedResultArray;
  },
  queryStringOptionsHandler = function (e) {
    if (!e) return queryStringConfiguration;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || queryStringConfiguration.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = formattingUtilities.default;
    if (void 0 !== e.format) {
      if (!hasOwnPropertyMethod.call(formattingUtilities.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var arrayFormatType,
      s = formattingUtilities.formatters[i],
      c = queryStringConfiguration.filter;
    if (("function" == typeof e.filter || isArrayFunction(e.filter)) && (c = e.filter), arrayFormatType = e.arrayFormat in arrayFormatHandlers ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : queryStringConfiguration.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isCommaRoundTripEnabled = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || queryStringConfiguration.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : queryStringConfiguration.addQueryPrefix,
      allowDots: isCommaRoundTripEnabled,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : queryStringConfiguration.allowEmptyArrays,
      arrayFormat: arrayFormatType,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : queryStringConfiguration.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? queryStringConfiguration.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : queryStringConfiguration.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : queryStringConfiguration.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : queryStringConfiguration.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : queryStringConfiguration.encodeValuesOnly,
      filter: c,
      format: i,
      formatter: s,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : queryStringConfiguration.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : queryStringConfiguration.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : queryStringConfiguration.strictNullHandling
    };
  };
module.exports = function (r, o) {
  var t,
    i = r,
    s = queryStringOptionsHandler(o);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArrayFunction(s.filter) && (t = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var arrayFormatterFunction = arrayFormatHandlers[s.arrayFormat],
    u = "comma" === arrayFormatterFunction && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var _visitedObjectsMap = sideChannelHandler(), currentIndexInArray = 0; currentIndexInArray < t.length; ++currentIndexInArray) {
    var keyForIteration = t[currentIndexInArray],
      inputValueForKey = i[keyForIteration];
    s.skipNulls && null === inputValueForKey || arrayElementAppender(c, cyclicObjectHandlerFunction(inputValueForKey, keyForIteration, arrayFormatterFunction, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, _visitedObjectsMap));
  }
  var queryStringResult = c.join(s.delimiter),
    queryPrefix = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryPrefix += "utf8=%26%2310003%3B&" : queryPrefix += "utf8=%E2%9C%93&"), queryStringResult.length > 0 ? queryPrefix + queryStringResult : "";
};