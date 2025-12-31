"use strict";

var sideChannelModule = require("side-channel"),
  utilityFunctions = require("./utils"),
  formattingUtils = require("./formats"),
  hasOwnPropertyMethod = Object.prototype.hasOwnProperty,
  arrayFormatStrategies = {
    brackets: function (optionsValidatorInput) {
      return optionsValidatorInput + "[]";
    },
    comma: "comma",
    indices: function (e, arrayElementIndex) {
      return e + "[" + arrayElementIndex + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArrayCheck = Array.isArray,
  arrayPushMethod = Array.prototype.push,
  arrayElementPusher = function (e, r) {
    arrayPushMethod.apply(e, isArrayCheck(r) ? r : [r]);
  },
  dateToISOStringFunction = Date.prototype.toISOString,
  defaultQueryStringFormatOptions = formattingUtils.default,
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
    encoder: utilityFunctions.encode,
    encodeValuesOnly: !1,
    filter: void 0,
    format: defaultQueryStringFormatOptions,
    formatter: formattingUtils.formatters[defaultQueryStringFormatOptions],
    indices: !1,
    serializeDate: function (e) {
      return dateToISOStringFunction.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isValuePrimitive = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  objectReferenceCache = {},
  cyclicObjectCheckCount = function cyclicObjectCheckHandler(filterKeysArray, cyclicObjectCheckCount, defaultFormatOption, validatedOptions, resultArray, _cyclicObjectCheckCounter, _optionsValidator, currentIndexForIteration, currentIterationKey, inputValueForSerialization, queryStringParameters, queryPrefixFlag, dateSerializationFunction, _cyclicReferenceCount, currentObjectDepthLevel, iterationCounter, currentDepthLevelCounter, currentObjectHandler) {
    for (var currentObjectValueReference = filterKeysArray, currentObjectReferenceMap = currentObjectHandler, _currentObjectDepthLevel = 0, isIterationComplete = !1; void 0 !== (currentObjectReferenceMap = currentObjectReferenceMap.get(objectReferenceCache)) && !isIterationComplete;) {
      var cyclicReferenceDepthCount = currentObjectReferenceMap.get(filterKeysArray);
      if (_currentObjectDepthLevel += 1, void 0 !== cyclicReferenceDepthCount) {
        if (cyclicReferenceDepthCount === _currentObjectDepthLevel) throw new RangeError("Cyclic object value");
        isIterationComplete = !0;
      }
      void 0 === currentObjectReferenceMap.get(objectReferenceCache) && (_currentObjectDepthLevel = 0);
    }
    if ("function" == typeof inputValueForSerialization ? currentObjectValueReference = inputValueForSerialization(cyclicObjectCheckCount, currentObjectValueReference) : currentObjectValueReference instanceof Date ? currentObjectValueReference = dateSerializationFunction(currentObjectValueReference) : "comma" === defaultFormatOption && isArrayCheck(currentObjectValueReference) && (currentObjectValueReference = utilityFunctions.maybeMap(currentObjectValueReference, function (e) {
      return e instanceof Date ? dateSerializationFunction(e) : e;
    })), null === currentObjectValueReference) {
      if (_cyclicObjectCheckCounter) return currentIterationKey && !iterationCounter ? currentIterationKey(cyclicObjectCheckCount, queryStringOptions.encoder, currentDepthLevelCounter, "key", _cyclicReferenceCount) : cyclicObjectCheckCount;
      currentObjectValueReference = "";
    }
    if (isValuePrimitive(currentObjectValueReference) || utilityFunctions.isBuffer(currentObjectValueReference)) return currentIterationKey ? [currentObjectDepthLevel(iterationCounter ? cyclicObjectCheckCount : currentIterationKey(cyclicObjectCheckCount, queryStringOptions.encoder, currentDepthLevelCounter, "key", _cyclicReferenceCount)) + "=" + currentObjectDepthLevel(currentIterationKey(currentObjectValueReference, queryStringOptions.encoder, currentDepthLevelCounter, "value", _cyclicReferenceCount))] : [currentObjectDepthLevel(cyclicObjectCheckCount) + "=" + currentObjectDepthLevel(String(currentObjectValueReference))];
    var mappedValueResults,
      processedValueList = [];
    if (void 0 === currentObjectValueReference) return processedValueList;
    if ("comma" === defaultFormatOption && isArrayCheck(currentObjectValueReference)) iterationCounter && currentIterationKey && (currentObjectValueReference = utilityFunctions.maybeMap(currentObjectValueReference, currentIterationKey)), mappedValueResults = [{
      value: currentObjectValueReference.length > 0 ? currentObjectValueReference.join(",") || null : void 0
    }];else if (isArrayCheck(inputValueForSerialization)) mappedValueResults = inputValueForSerialization;else {
      var currentObjectKeys = Object.keys(currentObjectValueReference);
      mappedValueResults = queryStringParameters ? currentObjectKeys.sort(queryStringParameters) : currentObjectKeys;
    }
    var formattedKeyForQueryString = currentIndexForIteration ? String(cyclicObjectCheckCount).replace(/\./g, "%2E") : String(cyclicObjectCheckCount),
      encodedKeyPathForArray = validatedOptions && isArrayCheck(currentObjectValueReference) && 1 === currentObjectValueReference.length ? formattedKeyForQueryString + "[]" : formattedKeyForQueryString;
    if (resultArray && isArrayCheck(currentObjectValueReference) && 0 === currentObjectValueReference.length) return encodedKeyPathForArray + "[]";
    for (var mappedValuesIndex = 0; mappedValuesIndex < mappedValueResults.length; ++mappedValuesIndex) {
      var mappedValueKey = mappedValueResults[mappedValuesIndex],
        currentKeyValue = "object" == typeof mappedValueKey && mappedValueKey && void 0 !== mappedValueKey.value ? mappedValueKey.value : currentObjectValueReference[mappedValueKey];
      if (!_optionsValidator || null !== currentKeyValue) {
        var encodedCurrentKey = queryPrefixFlag && currentIndexForIteration ? String(mappedValueKey).replace(/\./g, "%2E") : String(mappedValueKey),
          formattedKeyPathWithIndicator = isArrayCheck(currentObjectValueReference) ? "function" == typeof defaultFormatOption ? defaultFormatOption(encodedKeyPathForArray, encodedCurrentKey) : encodedKeyPathForArray : encodedKeyPathForArray + (queryPrefixFlag ? "." + encodedCurrentKey : "[" + encodedCurrentKey + "]");
        currentObjectHandler.set(filterKeysArray, _currentObjectDepthLevel);
        var sideChannelResultSet = sideChannelModule();
        sideChannelResultSet.set(objectReferenceCache, currentObjectHandler), arrayElementPusher(processedValueList, cyclicObjectCheckHandler(currentKeyValue, formattedKeyPathWithIndicator, defaultFormatOption, validatedOptions, resultArray, _cyclicObjectCheckCounter, _optionsValidator, currentIndexForIteration, "comma" === defaultFormatOption && iterationCounter && isArrayCheck(currentObjectValueReference) ? null : currentIterationKey, inputValueForSerialization, queryStringParameters, queryPrefixFlag, dateSerializationFunction, _cyclicReferenceCount, currentObjectDepthLevel, iterationCounter, currentDepthLevelCounter, sideChannelResultSet));
      }
    }
    return processedValueList;
  },
  validateOptionsForQueryString = function (e) {
    if (!e) return queryStringOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || queryStringOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var i = formattingUtils.default;
    if (void 0 !== e.format) {
      if (!hasOwnPropertyMethod.call(formattingUtils.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      i = e.format;
    }
    var arrayFormatTypeHandler,
      s = formattingUtils.formatters[i],
      c = queryStringOptions.filter;
    if (("function" == typeof e.filter || isArrayCheck(e.filter)) && (c = e.filter), arrayFormatTypeHandler = e.arrayFormat in arrayFormatStrategies ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : queryStringOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isCommaRoundTripEnabled = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || queryStringOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : queryStringOptions.addQueryPrefix,
      allowDots: isCommaRoundTripEnabled,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : queryStringOptions.allowEmptyArrays,
      arrayFormat: arrayFormatTypeHandler,
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
    s = validateOptionsForQueryString(o);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArrayCheck(s.filter) && (t = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var arrayFormattersMap = arrayFormatStrategies[s.arrayFormat],
    u = "comma" === arrayFormattersMap && s.commaRoundTrip;
  t || (t = Object.keys(i)), s.sort && t.sort(s.sort);
  for (var currentIndexCounter = sideChannelModule(), _currentIndexCounter = 0; _currentIndexCounter < t.length; ++_currentIndexCounter) {
    var keyForIteration = t[_currentIndexCounter],
      currentInputValue = i[keyForIteration];
    s.skipNulls && null === currentInputValue || arrayElementPusher(c, cyclicObjectCheckCount(currentInputValue, keyForIteration, arrayFormattersMap, u, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, currentIndexCounter));
  }
  var queryStringOutput = c.join(s.delimiter),
    queryPrefixIndicator = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryPrefixIndicator += "utf8=%26%2310003%3B&" : queryPrefixIndicator += "utf8=%E2%9C%93&"), queryStringOutput.length > 0 ? queryPrefixIndicator + queryStringOutput : "";
};