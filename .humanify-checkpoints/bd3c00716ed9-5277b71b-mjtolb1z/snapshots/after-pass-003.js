"use strict";

var sideChannelHandler = require("side-channel"),
  utilityFunctions = require("./utils"),
  formatHandlers = require("./formats"),
  hasOwnPropertyCheck = Object.prototype.hasOwnProperty,
  arrayFormatOptions = {
    brackets: function (dateFormatterFunction) {
      return dateFormatterFunction + "[]";
    },
    comma: "comma",
    indices: function (inputObjectOption, _utilityFunctions) {
      return inputObjectOption + "[" + _utilityFunctions + "]";
    },
    repeat: function (e) {
      return e;
    }
  },
  isArrayCheck = Array.isArray,
  pushToArrayMethod = Array.prototype.push,
  addElementToArray = function (e, _utilityFunctions) {
    pushToArrayMethod.apply(e, isArrayCheck(_utilityFunctions) ? _utilityFunctions : [_utilityFunctions]);
  },
  dateToISOStringMethod = Date.prototype.toISOString,
  defaultQueryStringFormat = formatHandlers.default,
  defaultQueryStringFormatOptions = {
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
    format: defaultQueryStringFormat,
    formatter: formatHandlers.formatters[defaultQueryStringFormat],
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
  circularReferenceHandlerFunction = function dataObjectToFilter(filteredKeysArray, _traversalIndex, selectedFormatter, allowEmptyArraysSettingResult, _filteredKeysArray, handleCyclicReferencesFunction, _allowEmptyArraysSetting, __traversalIndex, propertyKey, valueToSerialize, queryStringParameters, queryParameterPrefix, dateToISOStringFormatter, _cyclicReferenceTracker, dateSerializerFunction, objectValueToSerialize, traversalDepth, currentObjectReference) {
    for (var traversalObjectReference = filteredKeysArray, traverseObjectReferences = currentObjectReference, ___traversalIndex = 0, isCyclicReference = !1; void 0 !== (traverseObjectReferences = traverseObjectReferences.get(_cyclicReferenceTracker)) && !isCyclicReference;) {
      var currentTraversalDepth = traverseObjectReferences.get(filteredKeysArray);
      if (___traversalIndex += 1, void 0 !== currentTraversalDepth) {
        if (currentTraversalDepth === ___traversalIndex) throw new RangeError("Cyclic object value");
        isCyclicReference = !0;
      }
      void 0 === traverseObjectReferences.get(_cyclicReferenceTracker) && (___traversalIndex = 0);
    }
    if ("function" == typeof valueToSerialize ? traversalObjectReference = valueToSerialize(_traversalIndex, traversalObjectReference) : traversalObjectReference instanceof Date ? traversalObjectReference = dateToISOStringFormatter(traversalObjectReference) : "comma" === selectedFormatter && isArrayCheck(traversalObjectReference) && (traversalObjectReference = utilityFunctions.maybeMap(traversalObjectReference, function (e) {
      return e instanceof Date ? dateToISOStringFormatter(e) : e;
    })), null === traversalObjectReference) {
      if (handleCyclicReferencesFunction) return propertyKey && !objectValueToSerialize ? propertyKey(_traversalIndex, defaultQueryStringFormatOptions.encoder, traversalDepth, "key", _cyclicReferenceTracker) : _traversalIndex;
      traversalObjectReference = "";
    }
    if (isPrimitiveType(traversalObjectReference) || utilityFunctions.isBuffer(traversalObjectReference)) return propertyKey ? [dateSerializerFunction(objectValueToSerialize ? _traversalIndex : propertyKey(_traversalIndex, defaultQueryStringFormatOptions.encoder, traversalDepth, "key", _cyclicReferenceTracker)) + "=" + dateSerializerFunction(propertyKey(traversalObjectReference, defaultQueryStringFormatOptions.encoder, traversalDepth, "value", _cyclicReferenceTracker))] : [dateSerializerFunction(_traversalIndex) + "=" + dateSerializerFunction(String(traversalObjectReference))];
    var mappedKeyValuePairs,
      _mappedKeyValuePairs = [];
    if (void 0 === traversalObjectReference) return _mappedKeyValuePairs;
    if ("comma" === selectedFormatter && isArrayCheck(traversalObjectReference)) objectValueToSerialize && propertyKey && (traversalObjectReference = utilityFunctions.maybeMap(traversalObjectReference, propertyKey)), mappedKeyValuePairs = [{
      value: traversalObjectReference.length > 0 ? traversalObjectReference.join(",") || null : void 0
    }];else if (isArrayCheck(valueToSerialize)) mappedKeyValuePairs = valueToSerialize;else {
      var traversedObjectKeys = Object.keys(traversalObjectReference);
      mappedKeyValuePairs = queryStringParameters ? traversedObjectKeys.sort(queryStringParameters) : traversedObjectKeys;
    }
    var _formattedPropertyKey = __traversalIndex ? String(_traversalIndex).replace(/\./g, "%2E") : String(_traversalIndex),
      formattedBasePath = allowEmptyArraysSettingResult && isArrayCheck(traversalObjectReference) && 1 === traversalObjectReference.length ? _formattedPropertyKey + "[]" : _formattedPropertyKey;
    if (_filteredKeysArray && isArrayCheck(traversalObjectReference) && 0 === traversalObjectReference.length) return formattedBasePath + "[]";
    for (var mappedValuesIndex = 0; mappedValuesIndex < mappedKeyValuePairs.length; ++mappedValuesIndex) {
      var mappedKeyValuePair = mappedKeyValuePairs[mappedValuesIndex],
        valueToReturn = "object" == typeof mappedKeyValuePair && mappedKeyValuePair && void 0 !== mappedKeyValuePair.value ? mappedKeyValuePair.value : traversalObjectReference[mappedKeyValuePair];
      if (!_allowEmptyArraysSetting || null !== valueToReturn) {
        var mappedValueKeyString = queryParameterPrefix && __traversalIndex ? String(mappedKeyValuePair).replace(/\./g, "%2E") : String(mappedKeyValuePair),
          encodedPropertyKey = isArrayCheck(traversalObjectReference) ? "function" == typeof selectedFormatter ? selectedFormatter(formattedBasePath, mappedValueKeyString) : formattedBasePath : formattedBasePath + (queryParameterPrefix ? "." + mappedValueKeyString : "[" + mappedValueKeyString + "]");
        currentObjectReference.set(filteredKeysArray, ___traversalIndex);
        var createSideChannelIdentifier = sideChannelHandler();
        createSideChannelIdentifier.set(_cyclicReferenceTracker, currentObjectReference), addElementToArray(_mappedKeyValuePairs, dataObjectToFilter(valueToReturn, encodedPropertyKey, selectedFormatter, allowEmptyArraysSettingResult, _filteredKeysArray, handleCyclicReferencesFunction, _allowEmptyArraysSetting, __traversalIndex, "comma" === selectedFormatter && objectValueToSerialize && isArrayCheck(traversalObjectReference) ? null : propertyKey, valueToSerialize, queryStringParameters, queryParameterPrefix, dateToISOStringFormatter, _cyclicReferenceTracker, dateSerializerFunction, objectValueToSerialize, traversalDepth, createSideChannelIdentifier));
      }
    }
    return _mappedKeyValuePairs;
  },
  allowEmptyArraysOptionHandler = function (e) {
    if (!e) return defaultQueryStringFormatOptions;
    if (void 0 !== e.allowEmptyArrays && "boolean" != typeof e.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== e.encodeDotInKeys && "boolean" != typeof e.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== e.encoder && void 0 !== e.encoder && "function" != typeof e.encoder) throw new TypeError("Encoder has to be a function.");
    var r = e.charset || defaultQueryStringFormatOptions.charset;
    if (void 0 !== e.charset && "utf-8" !== e.charset && "iso-8859-1" !== e.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var defaultFormatHandler = formatHandlers.default;
    if (void 0 !== e.format) {
      if (!hasOwnPropertyCheck.call(formatHandlers.formatters, e.format)) throw new TypeError("Unknown format option provided.");
      defaultFormatHandler = e.format;
    }
    var arrayFormatOptions,
      inputObjectFilter = formatHandlers.formatters[defaultFormatHandler],
      filteredKeys = defaultQueryStringFormatOptions.filter;
    if (("function" == typeof e.filter || isArrayCheck(e.filter)) && (filteredKeys = e.filter), arrayFormatOptions = e.arrayFormat in arrayFormatOptions ? e.arrayFormat : "indices" in e ? e.indices ? "indices" : "repeat" : defaultQueryStringFormatOptions.arrayFormat, "commaRoundTrip" in e && "boolean" != typeof e.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var allowDotsSetting = void 0 === e.allowDots ? !0 === e.encodeDotInKeys || defaultQueryStringFormatOptions.allowDots : !!e.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof e.addQueryPrefix ? e.addQueryPrefix : defaultQueryStringFormatOptions.addQueryPrefix,
      allowDots: allowDotsSetting,
      allowEmptyArrays: "boolean" == typeof e.allowEmptyArrays ? !!e.allowEmptyArrays : defaultQueryStringFormatOptions.allowEmptyArrays,
      arrayFormat: arrayFormatOptions,
      charset: r,
      charsetSentinel: "boolean" == typeof e.charsetSentinel ? e.charsetSentinel : defaultQueryStringFormatOptions.charsetSentinel,
      commaRoundTrip: !!e.commaRoundTrip,
      delimiter: void 0 === e.delimiter ? defaultQueryStringFormatOptions.delimiter : e.delimiter,
      encode: "boolean" == typeof e.encode ? e.encode : defaultQueryStringFormatOptions.encode,
      encodeDotInKeys: "boolean" == typeof e.encodeDotInKeys ? e.encodeDotInKeys : defaultQueryStringFormatOptions.encodeDotInKeys,
      encoder: "function" == typeof e.encoder ? e.encoder : defaultQueryStringFormatOptions.encoder,
      encodeValuesOnly: "boolean" == typeof e.encodeValuesOnly ? e.encodeValuesOnly : defaultQueryStringFormatOptions.encodeValuesOnly,
      filter: filteredKeys,
      format: defaultFormatHandler,
      formatter: inputObjectFilter,
      serializeDate: "function" == typeof e.serializeDate ? e.serializeDate : defaultQueryStringFormatOptions.serializeDate,
      skipNulls: "boolean" == typeof e.skipNulls ? e.skipNulls : defaultQueryStringFormatOptions.skipNulls,
      sort: "function" == typeof e.sort ? e.sort : null,
      strictNullHandling: "boolean" == typeof e.strictNullHandling ? e.strictNullHandling : defaultQueryStringFormatOptions.strictNullHandling
    };
  };
module.exports = function (r, inputDataObject) {
  var filterFunction,
    i = r,
    s = allowEmptyArraysOptionHandler(inputDataObject);
  "function" == typeof s.filter ? i = (0, s.filter)("", i) : isArrayCheck(s.filter) && (filterFunction = s.filter);
  var c = [];
  if ("object" != typeof i || null === i) return "";
  var arrayFormatOptions = arrayFormatOptions[s.arrayFormat],
    allowDotsOption = "comma" === arrayFormatOptions && s.commaRoundTrip;
  filterFunction || (filterFunction = Object.keys(i)), s.sort && filterFunction.sort(s.sort);
  for (var keysList = sideChannelHandler(), _currentIndex = 0; _currentIndex < filterFunction.length; ++_currentIndex) {
    var objectKey = filterFunction[_currentIndex],
      valueToProcess = i[objectKey];
    s.skipNulls && null === valueToProcess || addElementToArray(c, circularReferenceHandlerFunction(valueToProcess, objectKey, arrayFormatOptions, allowDotsOption, s.allowEmptyArrays, s.strictNullHandling, s.skipNulls, s.encodeDotInKeys, s.encode ? s.encoder : null, s.filter, s.sort, s.allowDots, s.serializeDate, s.format, s.formatter, s.encodeValuesOnly, s.charset, keysList));
  }
  var queryStringParameters = c.join(s.delimiter),
    queryStringPrefix = !0 === s.addQueryPrefix ? "?" : "";
  return s.charsetSentinel && ("iso-8859-1" === s.charset ? queryStringPrefix += "utf8=%26%2310003%3B&" : queryStringPrefix += "utf8=%E2%9C%93&"), queryStringParameters.length > 0 ? queryStringPrefix + queryStringParameters : "";
};