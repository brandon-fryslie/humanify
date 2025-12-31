"use strict";

var sideChannelModuleHandler = require("side-channel"),
  utilityFunctionsModule = require("./utils"),
  formattingUtilitiesModule = require("./formats"),
  hasOwnPropertyFunction = Object.prototype.hasOwnProperty,
  arrayFormatHandlerFunctions = {
    brackets: function (optionsInputForArrayFormat) {
      return optionsInputForArrayFormat + "[]";
    },
    comma: "comma",
    indices: function (queryStringOptionsInput, characterSetOptionValue) {
      return queryStringOptionsInput + "[" + characterSetOptionValue + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArrayChecker = Array.isArray,
  arrayElementAppenderFunction = Array.prototype.push,
  arrayElementsAppender = function (e, charsetOptionValue) {
    arrayElementAppenderFunction.apply(e, isArrayChecker(charsetOptionValue) ? charsetOptionValue : [charsetOptionValue]);
  },
  dateToISOStringMethod = Date.prototype.toISOString,
  defaultQueryStringOptionsConfig = formattingUtilitiesModule.default,
  queryStringOptionsConfiguration = {
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
    format: defaultQueryStringOptionsConfig,
    formatter: formattingUtilitiesModule.formatters[defaultQueryStringOptionsConfig],
    indices: !1,
    serializeDate: function (e) {
      return dateToISOStringMethod.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isPrimitiveValue = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  trackedVisitedObjectsMap = {},
  cyclicObjectHandlerFunction = function _queryStringOptionsHandler(filteredKeysList, _currentIterationIndex, inputDataForProcessing, optionsHandlerOutput, _mappedResultArray, _cyclicObjectReferenceCount, queryStringOptionsHandlerFunction, currentIterationIndexCounter, currentKeyForMappingIteration, inputValueForCurrentIteration, queryStringParametersList, queryParameterPrefixValue, dateSerializationHandlerFunction, cyclicReferenceCounter, currentDepthLevelCounter, __currentDepthLevelCounter, currentObjectIndexInIteration, visitedObjectTracker) {
    for (var filteredKeysArrayReference = filteredKeysList, currentVisitedObjectReference = visitedObjectTracker, currentIterationCount = 0, isIterationCompleteFlag = !1; void 0 !== (currentVisitedObjectReference = currentVisitedObjectReference.get(trackedVisitedObjectsMap)) && !isIterationCompleteFlag;) {
      var cyclicObjectReferenceCount = currentVisitedObjectReference.get(filteredKeysList);
      if (currentIterationCount += 1, void 0 !== cyclicObjectReferenceCount) {
        if (cyclicObjectReferenceCount === currentIterationCount) throw new RangeError("Cyclic object value");
        isIterationCompleteFlag = !0;
      }
      void 0 === currentVisitedObjectReference.get(trackedVisitedObjectsMap) && (currentIterationCount = 0);
    }
    if ("function" == typeof inputValueForCurrentIteration ? filteredKeysArrayReference = inputValueForCurrentIteration(_currentIterationIndex, filteredKeysArrayReference) : filteredKeysArrayReference instanceof Date ? filteredKeysArrayReference = dateSerializationHandlerFunction(filteredKeysArrayReference) : "comma" === inputDataForProcessing && isArrayChecker(filteredKeysArrayReference) && (filteredKeysArrayReference = utilityFunctionsModule.maybeMap(filteredKeysArrayReference, function (e) {
      return e instanceof Date ? dateSerializationHandlerFunction(e) : e;
    })), null === filteredKeysArrayReference) {
      if (_cyclicObjectReferenceCount) return currentKeyForMappingIteration && !__currentDepthLevelCounter ? currentKeyForMappingIteration(_currentIterationIndex, queryStringOptionsConfiguration.encoder, currentObjectIndexInIteration, "key", cyclicReferenceCounter) : _currentIterationIndex;
      filteredKeysArrayReference = "";
    }
    if (isPrimitiveValue(filteredKeysArrayReference) || utilityFunctionsModule.isBuffer(filteredKeysArrayReference)) return currentKeyForMappingIteration ? [currentDepthLevelCounter(__currentDepthLevelCounter ? _currentIterationIndex : currentKeyForMappingIteration(_currentIterationIndex, queryStringOptionsConfiguration.encoder, currentObjectIndexInIteration, "key", cyclicReferenceCounter)) + "=" + currentDepthLevelCounter(currentKeyForMappingIteration(filteredKeysArrayReference, queryStringOptionsConfiguration.encoder, currentObjectIndexInIteration, "value", cyclicReferenceCounter))] : [currentDepthLevelCounter(_currentIterationIndex) + "=" + currentDepthLevelCounter(String(filteredKeysArrayReference))];
    var mappedValuesList,
      mappedResultList = [];
    if (void 0 === filteredKeysArrayReference) return mappedResultList;
    if ("comma" === inputDataForProcessing && isArrayChecker(filteredKeysArrayReference)) __currentDepthLevelCounter && currentKeyForMappingIteration && (filteredKeysArrayReference = utilityFunctionsModule.maybeMap(filteredKeysArrayReference, currentKeyForMappingIteration)), mappedValuesList = [{
      value: filteredKeysArrayReference.length > 0 ? filteredKeysArrayReference.join(",") || null : void 0
    }];else if (isArrayChecker(inputValueForCurrentIteration)) mappedValuesList = inputValueForCurrentIteration;else {
      var currentObjectKeyListArray = Object.keys(filteredKeysArrayReference);
      mappedValuesList = queryStringParametersList ? currentObjectKeyListArray.sort(queryStringParametersList) : currentObjectKeyListArray;
    }
    var encodedKeyForCurrentIndexInIteration = currentIterationIndexCounter ? String(_currentIterationIndex).replace(/\./g, "%2E") : String(_currentIterationIndex),
      encodedArrayPath = optionsHandlerOutput && isArrayChecker(filteredKeysArrayReference) && 1 === filteredKeysArrayReference.length ? encodedKeyForCurrentIndexInIteration + "[]" : encodedKeyForCurrentIndexInIteration;
    if (_mappedResultArray && isArrayChecker(filteredKeysArrayReference) && 0 === filteredKeysArrayReference.length) return encodedArrayPath + "[]";
    for (var currentMappedValueIndex = 0; currentMappedValueIndex < mappedValuesList.length; ++currentMappedValueIndex) {
      var currentMappedValueKey = mappedValuesList[currentMappedValueIndex],
        extractedValueOrDefault = "object" == typeof currentMappedValueKey && currentMappedValueKey && void 0 !== currentMappedValueKey.value ? currentMappedValueKey.value : filteredKeysArrayReference[currentMappedValueKey];
      if (!queryStringOptionsHandlerFunction || null !== extractedValueOrDefault) {
        var formattedKeyForQueryParameter = queryParameterPrefixValue && currentIterationIndexCounter ? String(currentMappedValueKey).replace(/\./g, "%2E") : String(currentMappedValueKey),
          propertyAccessPathString = isArrayChecker(filteredKeysArrayReference) ? "function" == typeof inputDataForProcessing ? inputDataForProcessing(encodedArrayPath, formattedKeyForQueryParameter) : encodedArrayPath : encodedArrayPath + (queryParameterPrefixValue ? "." + formattedKeyForQueryParameter : "[" + formattedKeyForQueryParameter + "]");
        visitedObjectTracker.set(filteredKeysList, currentIterationCount);
        var sideChannelDataMapReference = sideChannelModuleHandler();
        sideChannelDataMapReference.set(trackedVisitedObjectsMap, visitedObjectTracker), arrayElementsAppender(mappedResultList, _queryStringOptionsHandler(extractedValueOrDefault, propertyAccessPathString, inputDataForProcessing, optionsHandlerOutput, _mappedResultArray, _cyclicObjectReferenceCount, queryStringOptionsHandlerFunction, currentIterationIndexCounter, "comma" === inputDataForProcessing && __currentDepthLevelCounter && isArrayChecker(filteredKeysArrayReference) ? null : currentKeyForMappingIteration, inputValueForCurrentIteration, queryStringParametersList, queryParameterPrefixValue, dateSerializationHandlerFunction, cyclicReferenceCounter, currentDepthLevelCounter, __currentDepthLevelCounter, currentObjectIndexInIteration, sideChannelDataMapReference));
      }
    }
    return mappedResultList;
  },
  queryStringOptionsHandlerFunction = function (e) {
    if (!e) return queryStringOptionsConfiguration;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || queryStringOptionsConfiguration.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var defaultFormattingOption = formattingUtilitiesModule.default;
    if (void 0 !== e.format) {
      if (!hasOwnPropertyFunction.call(formattingUtilitiesModule.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      defaultFormattingOption = e.format;
    }
    var arrayFormatOption,
      queryStringOptionsHandlerResult = formattingUtilitiesModule.formatters[defaultFormattingOption],
      resultArray = queryStringOptionsConfiguration.filter;
    if (("function" == typeof e.filter || isArrayChecker(e.filter)) && (resultArray = e.filter), arrayFormatOption = e.arrayFormat in arrayFormatHandlerFunctions ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : queryStringOptionsConfiguration.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isCommaRoundTripEnabledFlag = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || queryStringOptionsConfiguration.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : queryStringOptionsConfiguration.addQueryPrefix,
      allowDots: isCommaRoundTripEnabledFlag,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : queryStringOptionsConfiguration.allowEmptyArrays,
      arrayFormat: arrayFormatOption,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : queryStringOptionsConfiguration.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? queryStringOptionsConfiguration.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : queryStringOptionsConfiguration.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : queryStringOptionsConfiguration.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : queryStringOptionsConfiguration.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : queryStringOptionsConfiguration.encodeValuesOnly,
      filter: resultArray,
      format: defaultFormattingOption,
      formatter: queryStringOptionsHandlerResult,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : queryStringOptionsConfiguration.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : queryStringOptionsConfiguration.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : queryStringOptionsConfiguration.strictNullHandling
    };
  };
module.exports = function (r, queryStringOptionsHandlerFunction) {
  var filterFunctionForOptions,
    i = r,
    s = queryStringOptionsHandlerFunction(queryStringOptionsHandlerFunction);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArrayChecker(s.filter) && (filterFunctionForOptions = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var arrayElementFormatterFunction = arrayFormatHandlerFunctions[s.arrayFormat],
    isCommaRoundTripEnabledFlag = "comma" === arrayElementFormatterFunction && s.commaRoundTrip;
  filterFunctionForOptions || (filterFunctionForOptions = Object.keys(i)), s.sort && filterFunctionForOptions.sort(s.sort);
  for (var _visitedObjectsTracker = sideChannelModuleHandler(), currentIterationIndexInArray = 0; currentIterationIndexInArray < filterFunctionForOptions.length; ++currentIterationIndexInArray) {
    var currentKeyForIteration = filterFunctionForOptions[currentIterationIndexInArray],
      inputValueForMappedKey = i[currentKeyForIteration];
    s.skipNulls && null === inputValueForMappedKey || arrayElementsAppender(c, cyclicObjectHandlerFunction(inputValueForMappedKey, currentKeyForIteration, arrayElementFormatterFunction, isCommaRoundTripEnabledFlag, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, _visitedObjectsTracker));
  }
  var serializedQueryString = c.join(s.delimiter),
    queryParameterPrefix = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryParameterPrefix += "utf8=%26%2310003%3B&" : queryParameterPrefix += "utf8=%E2%9C%93&"), serializedQueryString.length > 0 ? queryParameterPrefix + serializedQueryString : "";
};