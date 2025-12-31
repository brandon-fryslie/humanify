"use strict";

var sideChannelHandler = require("side-channel"),
  utilityFunctionsModule = require("./utils"),
  formattingUtilities = require("./formats"),
  hasOwnPropertyReference = Object.prototype.hasOwnProperty,
  arrayFormattingStrategies = {
    brackets: function (optionsValidatorInputValue) {
      return optionsValidatorInputValue + "[]";
    },
    comma: "comma",
    indices: function (optionsValidatorInput, currentArrayElementIndex) {
      return optionsValidatorInput + "[" + currentArrayElementIndex + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArrayFunction = Array.isArray,
  arrayElementAppender = Array.prototype.push,
  _arrayElementAppender = function (e, charsetOptionValue) {
    arrayElementAppender.apply(e, isArrayFunction(charsetOptionValue) ? charsetOptionValue : [charsetOptionValue]);
  },
  dateToISOStringMethod = Date.prototype.toISOString,
  defaultQueryStringFormatOptionsObject = formattingUtilities.default,
  queryStringFormatOptions = {
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
    format: defaultQueryStringFormatOptionsObject,
    formatter: formattingUtilities.formatters[defaultQueryStringFormatOptionsObject],
    indices: !1,
    serializeDate: function (e) {
      return dateToISOStringMethod.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isPrimitiveTypeCheck = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  objectReferenceCacheMap = {},
  cyclicObjectCheckCounter = function _cyclicObjectCheckHandlerFunction(cyclicObjectCheckHandlerFunction, cyclicObjectCheckCount, defaultFormatOptionHandler, validatedOptionsInput, _mappedValueResults, cyclicObjectCheckCounter, optionsValidationFunction, currentIterationIndex, keyForCurrentIteration, serializedInputValue, queryStringParametersList, isQueryPrefixEnabled, dateSerializationHandler, cyclicReferenceCountTracker, currentObjectDepthCounter, currentIterationCount, currentObjectDepthLevelCounter, currentObjectReferenceHandler) {
    for (var filteredKeysArrayReference = cyclicObjectCheckHandlerFunction, currentObjectReferenceCache = currentObjectReferenceHandler, _currentObjectDepthCounter = 0, hasMoreIterations = !1; void 0 !== (currentObjectReferenceCache = currentObjectReferenceCache.get(objectReferenceCacheMap)) && !hasMoreIterations;) {
      var currentCyclicReferenceDepthCount = currentObjectReferenceCache.get(cyclicObjectCheckHandlerFunction);
      if (_currentObjectDepthCounter += 1, void 0 !== currentCyclicReferenceDepthCount) {
        if (currentCyclicReferenceDepthCount === _currentObjectDepthCounter) throw new RangeError("Cyclic object value");
        hasMoreIterations = !0;
      }
      void 0 === currentObjectReferenceCache.get(objectReferenceCacheMap) && (_currentObjectDepthCounter = 0);
    }
    if ("function" == typeof serializedInputValue ? filteredKeysArrayReference = serializedInputValue(cyclicObjectCheckCount, filteredKeysArrayReference) : filteredKeysArrayReference instanceof Date ? filteredKeysArrayReference = dateSerializationHandler(filteredKeysArrayReference) : "comma" === defaultFormatOptionHandler && isArrayFunction(filteredKeysArrayReference) && (filteredKeysArrayReference = utilityFunctionsModule.maybeMap(filteredKeysArrayReference, function (e) {
      return e instanceof Date ? dateSerializationHandler(e) : e;
    })), null === filteredKeysArrayReference) {
      if (cyclicObjectCheckCounter) return keyForCurrentIteration && !currentIterationCount ? keyForCurrentIteration(cyclicObjectCheckCount, queryStringFormatOptions.encoder, currentObjectDepthLevelCounter, "key", cyclicReferenceCountTracker) : cyclicObjectCheckCount;
      filteredKeysArrayReference = "";
    }
    if (isPrimitiveTypeCheck(filteredKeysArrayReference) || utilityFunctionsModule.isBuffer(filteredKeysArrayReference)) return keyForCurrentIteration ? [currentObjectDepthCounter(currentIterationCount ? cyclicObjectCheckCount : keyForCurrentIteration(cyclicObjectCheckCount, queryStringFormatOptions.encoder, currentObjectDepthLevelCounter, "key", cyclicReferenceCountTracker)) + "=" + currentObjectDepthCounter(keyForCurrentIteration(filteredKeysArrayReference, queryStringFormatOptions.encoder, currentObjectDepthLevelCounter, "value", cyclicReferenceCountTracker))] : [currentObjectDepthCounter(cyclicObjectCheckCount) + "=" + currentObjectDepthCounter(String(filteredKeysArrayReference))];
    var mappedValueResultsList,
      processedValuesArray = [];
    if (void 0 === filteredKeysArrayReference) return processedValuesArray;
    if ("comma" === defaultFormatOptionHandler && isArrayFunction(filteredKeysArrayReference)) currentIterationCount && keyForCurrentIteration && (filteredKeysArrayReference = utilityFunctionsModule.maybeMap(filteredKeysArrayReference, keyForCurrentIteration)), mappedValueResultsList = [{
      value: filteredKeysArrayReference.length > 0 ? filteredKeysArrayReference.join(",") || null : void 0
    }];else if (isArrayFunction(serializedInputValue)) mappedValueResultsList = serializedInputValue;else {
      var currentObjectKeyList = Object.keys(filteredKeysArrayReference);
      mappedValueResultsList = queryStringParametersList ? currentObjectKeyList.sort(queryStringParametersList) : currentObjectKeyList;
    }
    var encodedCyclicObjectCheckCount = currentIterationIndex ? String(cyclicObjectCheckCount).replace(/\./g, "%2E") : String(cyclicObjectCheckCount),
      encodedKeyPathForSerializedArray = validatedOptionsInput && isArrayFunction(filteredKeysArrayReference) && 1 === filteredKeysArrayReference.length ? encodedCyclicObjectCheckCount + "[]" : encodedCyclicObjectCheckCount;
    if (_mappedValueResults && isArrayFunction(filteredKeysArrayReference) && 0 === filteredKeysArrayReference.length) return encodedKeyPathForSerializedArray + "[]";
    for (var mappedValueIndexCounter = 0; mappedValueIndexCounter < mappedValueResultsList.length; ++mappedValueIndexCounter) {
      var currentMappedValueKey = mappedValueResultsList[mappedValueIndexCounter],
        mappedValueContent = "object" == typeof currentMappedValueKey && currentMappedValueKey && void 0 !== currentMappedValueKey.value ? currentMappedValueKey.value : filteredKeysArrayReference[currentMappedValueKey];
      if (!optionsValidationFunction || null !== mappedValueContent) {
        var encodedMappedValueKey = isQueryPrefixEnabled && currentIterationIndex ? String(currentMappedValueKey).replace(/\./g, "%2E") : String(currentMappedValueKey),
          formattedKeyPathWithQueryIndicator = isArrayFunction(filteredKeysArrayReference) ? "function" == typeof defaultFormatOptionHandler ? defaultFormatOptionHandler(encodedKeyPathForSerializedArray, encodedMappedValueKey) : encodedKeyPathForSerializedArray : encodedKeyPathForSerializedArray + (isQueryPrefixEnabled ? "." + encodedMappedValueKey : "[" + encodedMappedValueKey + "]");
        currentObjectReferenceHandler.set(cyclicObjectCheckHandlerFunction, _currentObjectDepthCounter);
        var sideChannelResultSetCache = sideChannelHandler();
        sideChannelResultSetCache.set(objectReferenceCacheMap, currentObjectReferenceHandler), _arrayElementAppender(processedValuesArray, _cyclicObjectCheckHandlerFunction(mappedValueContent, formattedKeyPathWithQueryIndicator, defaultFormatOptionHandler, validatedOptionsInput, _mappedValueResults, cyclicObjectCheckCounter, optionsValidationFunction, currentIterationIndex, "comma" === defaultFormatOptionHandler && currentIterationCount && isArrayFunction(filteredKeysArrayReference) ? null : keyForCurrentIteration, serializedInputValue, queryStringParametersList, isQueryPrefixEnabled, dateSerializationHandler, cyclicReferenceCountTracker, currentObjectDepthCounter, currentIterationCount, currentObjectDepthLevelCounter, sideChannelResultSetCache));
      }
    }
    return processedValuesArray;
  },
  validateQueryStringOptions = function (e) {
    if (!e) return queryStringFormatOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || queryStringFormatOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var inputObject = formattingUtilities.default;
    if (void 0 !== e.format) {
      if (!hasOwnPropertyReference.call(formattingUtilities.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      inputObject = e.format;
    }
    var arrayFormatStrategyHandler,
      validatedQueryOptions = formattingUtilities.formatters[inputObject],
      resultArray = queryStringFormatOptions.filter;
    if (("function" == typeof e.filter || isArrayFunction(e.filter)) && (resultArray = e.filter), arrayFormatStrategyHandler = e.arrayFormat in arrayFormattingStrategies ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : queryStringFormatOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isCommaRoundTripEnabledFlag = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || queryStringFormatOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : queryStringFormatOptions.addQueryPrefix,
      allowDots: isCommaRoundTripEnabledFlag,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : queryStringFormatOptions.allowEmptyArrays,
      arrayFormat: arrayFormatStrategyHandler,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : queryStringFormatOptions.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? queryStringFormatOptions.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : queryStringFormatOptions.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : queryStringFormatOptions.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : queryStringFormatOptions.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : queryStringFormatOptions.encodeValuesOnly,
      filter: resultArray,
      format: inputObject,
      formatter: validatedQueryOptions,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : queryStringFormatOptions.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : queryStringFormatOptions.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : queryStringFormatOptions.strictNullHandling
    };
  };
module.exports = function (r, dataObjectHandler) {
  var filterFunctionArray,
    i = r,
    s = validateQueryStringOptions(dataObjectHandler);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArrayFunction(s.filter) && (filterFunctionArray = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var arrayFormatStrategiesMap = arrayFormattingStrategies[s.arrayFormat],
    isCommaRoundTripEnabledFlag = "comma" === arrayFormatStrategiesMap && s.commaRoundTrip;
  filterFunctionArray || (filterFunctionArray = Object.keys(i)), s.sort && filterFunctionArray.sort(s.sort);
  for (var currentIterationIndex = sideChannelHandler(), currentIndexCounterForIteration = 0; currentIndexCounterForIteration < filterFunctionArray.length; ++currentIndexCounterForIteration) {
    var currentIterationKey = filterFunctionArray[currentIndexCounterForIteration],
      currentInputValueForSerialization = i[currentIterationKey];
    s.skipNulls && null === currentInputValueForSerialization || _arrayElementAppender(c, cyclicObjectCheckCounter(currentInputValueForSerialization, currentIterationKey, arrayFormatStrategiesMap, isCommaRoundTripEnabledFlag, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, currentIterationIndex));
  }
  var formattedQueryStringOutput = c.join(s.delimiter),
    queryPrefixString = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryPrefixString += "utf8=%26%2310003%3B&" : queryPrefixString += "utf8=%E2%9C%93&"), formattedQueryStringOutput.length > 0 ? queryPrefixString + formattedQueryStringOutput : "";
};