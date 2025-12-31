"use strict";

var sideChannelUtils = require("side-channel"),
  utilityFunctions = require("./utils"),
  formatHandlers = require("./formats"),
  hasOwnPropertyCheck = Object.prototype.hasOwnProperty,
  arrayIndexingStrategies = {
    brackets: function (inputDataValue) {
      return inputDataValue + "[]";
    },
    comma: "comma",
    indices: function (inputOptions, currentIndexInArray) {
      return inputOptions + "[" + currentIndexInArray + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArrayFunction = Array.isArray,
  pushToArrayMethod = Array.prototype.push,
  appendToArray = function (e, indexValue) {
    pushToArrayMethod.apply(e, isArrayFunction(indexValue) ? indexValue : [indexValue]);
  },
  dateToISOStringMethod = Date.prototype.toISOString,
  defaultQueryStringFormatOptions = formatHandlers.default,
  _defaultQueryStringFormatOptions = {
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
    formatter: formatHandlers.formatters[defaultQueryStringFormatOptions],
    indices: !1,
    serializeDate: function (e) {
      return dateToISOStringMethod.call(e);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isPrimitiveType = function (e) {
    return "string" == typeof e || "number" == typeof e || "boolean" == typeof e || "symbol" == typeof e || "bigint" == typeof e;
  },
  circularReferenceMap = {},
  processNestedObjectStructure = function inputOptionsParameters(filteredKeysList, currentItemIndex, arrayElementIndex, allowEmptyArraysSettingResult, _mappedResults, objectTraversalFunction, _allowEmptyArraysSetting, _currentItemIndex, _indexInArray, _currentIterationCount, queryStringParameters, queryParameterPrefix, _dateToISOStringFunction, _cyclicReferenceTracker, ___objectTraversalDepth, currentTraversalDepth, _currentTraversalDepth, trackedObjectToProcess) {
    for (var filteredKeys = filteredKeysList, _objectToProcess = trackedObjectToProcess, currentIterationCount = 0, isCyclicReferenceDetected = !1; void 0 !== (_objectToProcess = _objectToProcess.get(_cyclicReferenceTracker)) && !isCyclicReferenceDetected;) {
      var currentObjectDepth = _objectToProcess.get(filteredKeysList);
      if (currentIterationCount += 1, void 0 !== currentObjectDepth) {
        if (currentObjectDepth === currentIterationCount) throw new RangeError("Cyclic object value");
        isCyclicReferenceDetected = !0;
      }
      void 0 === _objectToProcess.get(_cyclicReferenceTracker) && (currentIterationCount = 0);
    }
    if ("function" == typeof _currentIterationCount ? filteredKeys = _currentIterationCount(currentItemIndex, filteredKeys) : filteredKeys instanceof Date ? filteredKeys = _dateToISOStringFunction(filteredKeys) : "comma" === arrayElementIndex && isArrayFunction(filteredKeys) && (filteredKeys = utilityFunctions.maybeMap(filteredKeys, function (e) {
      return e instanceof Date ? _dateToISOStringFunction(e) : e;
    })), null === filteredKeys) {
      if (objectTraversalFunction) return _indexInArray && !currentTraversalDepth ? _indexInArray(currentItemIndex, _defaultQueryStringFormatOptions.encoder, _currentTraversalDepth, "key", _cyclicReferenceTracker) : currentItemIndex;
      filteredKeys = "";
    }
    if (isPrimitiveType(filteredKeys) || utilityFunctions.isBuffer(filteredKeys)) return _indexInArray ? [___objectTraversalDepth(currentTraversalDepth ? currentItemIndex : _indexInArray(currentItemIndex, _defaultQueryStringFormatOptions.encoder, _currentTraversalDepth, "key", _cyclicReferenceTracker)) + "=" + ___objectTraversalDepth(_indexInArray(filteredKeys, _defaultQueryStringFormatOptions.encoder, _currentTraversalDepth, "value", _cyclicReferenceTracker))] : [___objectTraversalDepth(currentItemIndex) + "=" + ___objectTraversalDepth(String(filteredKeys))];
    var mappedKeyValuePairs,
      _mappedKeyValuePairs = [];
    if (void 0 === filteredKeys) return _mappedKeyValuePairs;
    if ("comma" === arrayElementIndex && isArrayFunction(filteredKeys)) currentTraversalDepth && _indexInArray && (filteredKeys = utilityFunctions.maybeMap(filteredKeys, _indexInArray)), mappedKeyValuePairs = [{
      value: filteredKeys.length > 0 ? filteredKeys.join(",") || null : void 0
    }];else if (isArrayFunction(_currentIterationCount)) mappedKeyValuePairs = _currentIterationCount;else {
      var initialObjectKeys = Object.keys(filteredKeys);
      mappedKeyValuePairs = queryStringParameters ? initialObjectKeys.sort(queryStringParameters) : initialObjectKeys;
    }
    var _formattedKeyPath = _currentItemIndex ? String(currentItemIndex).replace(/\./g, "%2E") : String(currentItemIndex),
      formattedBasePathWithArrayIndicator = allowEmptyArraysSettingResult && isArrayFunction(filteredKeys) && 1 === filteredKeys.length ? _formattedKeyPath + "[]" : _formattedKeyPath;
    if (_mappedResults && isArrayFunction(filteredKeys) && 0 === filteredKeys.length) return formattedBasePathWithArrayIndicator + "[]";
    for (var mappedValueIndex = 0; mappedValueIndex < mappedKeyValuePairs.length; ++mappedValueIndex) {
      var mappedKeyValuePair = mappedKeyValuePairs[mappedValueIndex],
        resolvedObjectValue = "object" == typeof mappedKeyValuePair && mappedKeyValuePair && void 0 !== mappedKeyValuePair.value ? mappedKeyValuePair.value : filteredKeys[mappedKeyValuePair];
      if (!_allowEmptyArraysSetting || null !== resolvedObjectValue) {
        var formattedMappedValueKey = queryParameterPrefix && _currentItemIndex ? String(mappedKeyValuePair).replace(/\./g, "%2E") : String(mappedKeyValuePair),
          formattedKeyPath = isArrayFunction(filteredKeys) ? "function" == typeof arrayElementIndex ? arrayElementIndex(formattedBasePathWithArrayIndicator, formattedMappedValueKey) : formattedBasePathWithArrayIndicator : formattedBasePathWithArrayIndicator + (queryParameterPrefix ? "." + formattedMappedValueKey : "[" + formattedMappedValueKey + "]");
        trackedObjectToProcess.set(filteredKeysList, currentIterationCount);
        var createNewMapEntry = sideChannelUtils();
        createNewMapEntry.set(_cyclicReferenceTracker, trackedObjectToProcess), appendToArray(_mappedKeyValuePairs, inputOptionsParameters(resolvedObjectValue, formattedKeyPath, arrayElementIndex, allowEmptyArraysSettingResult, _mappedResults, objectTraversalFunction, _allowEmptyArraysSetting, _currentItemIndex, "comma" === arrayElementIndex && currentTraversalDepth && isArrayFunction(filteredKeys) ? null : _indexInArray, _currentIterationCount, queryStringParameters, queryParameterPrefix, _dateToISOStringFunction, _cyclicReferenceTracker, ___objectTraversalDepth, currentTraversalDepth, _currentTraversalDepth, createNewMapEntry));
      }
    }
    return _mappedKeyValuePairs;
  },
  allowEmptyArraysOptionHandler = function (e) {
    if (!e) return _defaultQueryStringFormatOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || _defaultQueryStringFormatOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var defaultFormatHandler = formatHandlers.default;
    if (void 0 !== e.format) {
      if (!hasOwnPropertyCheck.call(formatHandlers.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      defaultFormatHandler = e.format;
    }
    var arrayFormatOption,
      allowEmptyArraysSettingResult = formatHandlers.formatters[defaultFormatHandler],
      indexTracker = _defaultQueryStringFormatOptions.filter;
    if (("function" == typeof e.filter || isArrayFunction(e.filter)) && (indexTracker = e.filter), arrayFormatOption = e.arrayFormat in arrayIndexingStrategies ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : _defaultQueryStringFormatOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isCommaRoundTripEnabled = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || _defaultQueryStringFormatOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : _defaultQueryStringFormatOptions.addQueryPrefix,
      allowDots: isCommaRoundTripEnabled,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : _defaultQueryStringFormatOptions.allowEmptyArrays,
      arrayFormat: arrayFormatOption,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : _defaultQueryStringFormatOptions.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? _defaultQueryStringFormatOptions.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : _defaultQueryStringFormatOptions.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : _defaultQueryStringFormatOptions.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : _defaultQueryStringFormatOptions.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : _defaultQueryStringFormatOptions.encodeValuesOnly,
      filter: indexTracker,
      format: defaultFormatHandler,
      formatter: allowEmptyArraysSettingResult,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : _defaultQueryStringFormatOptions.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : _defaultQueryStringFormatOptions.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : _defaultQueryStringFormatOptions.strictNullHandling
    };
  };
module.exports = function (r, inputOptions) {
  var filteredKeys,
    i = r,
    s = allowEmptyArraysOptionHandler(inputOptions);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArrayFunction(s.filter) && (filteredKeys = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var arrayFormatOptions = arrayIndexingStrategies[s.arrayFormat],
    isCommaRoundTripFlag = "comma" === arrayFormatOptions && s.commaRoundTrip;
  filteredKeys || (filteredKeys = Object.keys(i)), s.sort && filteredKeys.sort(s.sort);
  for (var circularReferenceMapTracker = sideChannelUtils(), _currentIndex = 0; _currentIndex < filteredKeys.length; ++_currentIndex) {
    var mappedValueKey = filteredKeys[_currentIndex],
      mappedValue = i[mappedValueKey];
    s.skipNulls && null === mappedValue || appendToArray(c, processNestedObjectStructure(mappedValue, mappedValueKey, arrayFormatOptions, isCommaRoundTripFlag, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, circularReferenceMapTracker));
  }
  var formattedQueryString = c.join(s.delimiter),
    queryParameterPrefix = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryParameterPrefix += "utf8=%26%2310003%3B&" : queryParameterPrefix += "utf8=%E2%9C%93&"), formattedQueryString.length > 0 ? queryParameterPrefix + formattedQueryString : "";
};