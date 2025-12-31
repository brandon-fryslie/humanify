"use strict";

var optionsObject = require("side-channel"),
  utilityFunctions = require("./utils"),
  formatHandlers = require("./formats"),
  __hasOwnProperty = Object.prototype.hasOwnProperty,
  arrayFormatterFunctions = {
    brackets: function (optionsObject) {
      return optionsObject + "[]";
    },
    comma: "comma",
    indices: function (optionsObject, utilityFunctions) {
      return optionsObject + "[" + utilityFunctions + "]";
    },
    repeat: function (optionsObject) {
      return optionsObject;
    }
  },
  isArrayFunction = Array.isArray,
  defaultUtils = Array.prototype.push,
  pushToArray = function (optionsObject, utilityFunctions) {
    defaultUtils.apply(optionsObject, isArrayFunction(utilityFunctions) ? utilityFunctions : [utilityFunctions]);
  },
  formattedInput = Date.prototype.toISOString,
  formattedQueryParameters = formatHandlers.default,
  queryStringConfig = {
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
    format: formattedQueryParameters,
    formatter: formatHandlers.formatters[formattedQueryParameters],
    indices: !1,
    serializeDate: function (optionsObject) {
      return formattedInput.call(optionsObject);
    },
    skipNulls: !1,
    strictNullHandling: !1
  },
  isValuePrimitive = function (optionsObject) {
    return "string" == typeof optionsObject || "number" == typeof optionsObject || "boolean" == typeof optionsObject || "symbol" == typeof optionsObject || "bigint" == typeof optionsObject;
  },
  cyclicReferenceMap = {},
  handleCircularReferences = function formatHandlers(__hasOwnProperty, arrayFormatterFunctions, defaultUtils, formattedInput, formattedQueryParameters, handleCircularReferences, allowEmptyArraysSetting, currentIndex, traversalDepth, formatValueForKey, encodedQueryString, queryStringPrefix, dateFormatter, identifier, currentValueIndex, _objectTraversal, objectTraversalDepthCounter, currentObjectReference) {
    for (var _currentObjectReference = __hasOwnProperty, objectTraversalReference = currentObjectReference, currentIterationCount = 0, hasCyclicReference = !1; void 0 !== (objectTraversalReference = objectTraversalReference.get(cyclicReferenceMap)) && !hasCyclicReference;) {
      var currentTraversalIndex = objectTraversalReference.get(__hasOwnProperty);
      if (currentIterationCount += 1, void 0 !== currentTraversalIndex) {
        if (currentTraversalIndex === currentIterationCount) throw new RangeError("Cyclic object value");
        hasCyclicReference = !0;
      }
      void 0 === objectTraversalReference.get(cyclicReferenceMap) && (currentIterationCount = 0);
    }
    if ("function" == typeof formatValueForKey ? _currentObjectReference = formatValueForKey(arrayFormatterFunctions, _currentObjectReference) : _currentObjectReference instanceof Date ? _currentObjectReference = dateFormatter(_currentObjectReference) : "comma" === defaultUtils && isArrayFunction(_currentObjectReference) && (_currentObjectReference = utilityFunctions.maybeMap(_currentObjectReference, function (optionsObject) {
      return optionsObject instanceof Date ? dateFormatter(optionsObject) : optionsObject;
    })), null === _currentObjectReference) {
      if (handleCircularReferences) return traversalDepth && !_objectTraversal ? traversalDepth(arrayFormatterFunctions, queryStringConfig.encoder, objectTraversalDepthCounter, "key", identifier) : arrayFormatterFunctions;
      _currentObjectReference = "";
    }
    if (isValuePrimitive(_currentObjectReference) || utilityFunctions.isBuffer(_currentObjectReference)) return traversalDepth ? [currentValueIndex(_objectTraversal ? arrayFormatterFunctions : traversalDepth(arrayFormatterFunctions, queryStringConfig.encoder, objectTraversalDepthCounter, "key", identifier)) + "=" + currentValueIndex(traversalDepth(_currentObjectReference, queryStringConfig.encoder, objectTraversalDepthCounter, "value", identifier))] : [currentValueIndex(arrayFormatterFunctions) + "=" + currentValueIndex(String(_currentObjectReference))];
    var mappedKeyValuePairs,
      __resultArray = [];
    if (void 0 === _currentObjectReference) return __resultArray;
    if ("comma" === defaultUtils && isArrayFunction(_currentObjectReference)) _objectTraversal && traversalDepth && (_currentObjectReference = utilityFunctions.maybeMap(_currentObjectReference, traversalDepth)), mappedKeyValuePairs = [{
      value: _currentObjectReference.length > 0 ? _currentObjectReference.join(",") || null : void 0
    }];else if (isArrayFunction(formatValueForKey)) mappedKeyValuePairs = formatValueForKey;else {
      var currentObjectKeys = Object.keys(_currentObjectReference);
      mappedKeyValuePairs = encodedQueryString ? currentObjectKeys.sort(encodedQueryString) : currentObjectKeys;
    }
    var _formattedKey = currentIndex ? String(arrayFormatterFunctions).replace(/\./g, "%2E") : String(arrayFormatterFunctions),
      encodedArrayKey = formattedInput && isArrayFunction(_currentObjectReference) && 1 === _currentObjectReference.length ? _formattedKey + "[]" : _formattedKey;
    if (formattedQueryParameters && isArrayFunction(_currentObjectReference) && 0 === _currentObjectReference.length) return encodedArrayKey + "[]";
    for (var currentMappedIndex = 0; currentMappedIndex < mappedKeyValuePairs.length; ++currentMappedIndex) {
      var mappedValueKey = mappedKeyValuePairs[currentMappedIndex],
        resolvedValue = "object" == typeof mappedValueKey && mappedValueKey && void 0 !== mappedValueKey.value ? mappedValueKey.value : _currentObjectReference[mappedValueKey];
      if (!allowEmptyArraysSetting || null !== resolvedValue) {
        var formattedPropertyName = queryStringPrefix && currentIndex ? String(mappedValueKey).replace(/\./g, "%2E") : String(mappedValueKey),
          formattedKeyString = isArrayFunction(_currentObjectReference) ? "function" == typeof defaultUtils ? defaultUtils(encodedArrayKey, formattedPropertyName) : encodedArrayKey : encodedArrayKey + (queryStringPrefix ? "." + formattedPropertyName : "[" + formattedPropertyName + "]");
        currentObjectReference.set(__hasOwnProperty, currentIterationCount);
        var initializeObject = optionsObject();
        initializeObject.set(cyclicReferenceMap, currentObjectReference), pushToArray(__resultArray, formatHandlers(resolvedValue, formattedKeyString, defaultUtils, formattedInput, formattedQueryParameters, handleCircularReferences, allowEmptyArraysSetting, currentIndex, "comma" === defaultUtils && _objectTraversal && isArrayFunction(_currentObjectReference) ? null : traversalDepth, formatValueForKey, encodedQueryString, queryStringPrefix, dateFormatter, identifier, currentValueIndex, _objectTraversal, objectTraversalDepthCounter, initializeObject));
      }
    }
    return __resultArray;
  },
  allowEmptyArraysSetting = function (optionsObject) {
    if (!optionsObject) return queryStringConfig;
    if (void 0 !== optionsObject.allowEmptyArrays && "boolean" != typeof optionsObject.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
    if (void 0 !== optionsObject.encodeDotInKeys && "boolean" != typeof optionsObject.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
    if (null !== optionsObject.encoder && void 0 !== optionsObject.encoder && "function" != typeof optionsObject.encoder) throw new TypeError("Encoder has to be a function.");
    var utilityFunctions = optionsObject.charset || queryStringConfig.charset;
    if (void 0 !== optionsObject.charset && "utf-8" !== optionsObject.charset && "iso-8859-1" !== optionsObject.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
    var defaultUtils = formatHandlers.default;
    if (void 0 !== optionsObject.format) {
      if (!__hasOwnProperty.call(formatHandlers.formatters, optionsObject.format)) throw new TypeError("Unknown format option provided.");
      defaultUtils = optionsObject.format;
    }
    var pushToArray,
      formattedInput = formatHandlers.formatters[defaultUtils],
      formattedQueryParameters = queryStringConfig.filter;
    if (("function" == typeof optionsObject.filter || isArrayFunction(optionsObject.filter)) && (formattedQueryParameters = optionsObject.filter), pushToArray = optionsObject.arrayFormat in arrayFormatterFunctions ? optionsObject.arrayFormat : "indices" in optionsObject ? optionsObject.indices ? "indices" : "repeat" : queryStringConfig.arrayFormat, "commaRoundTrip" in optionsObject && "boolean" != typeof optionsObject.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
    var isValuePrimitive = void 0 === optionsObject.allowDots ? !0 === optionsObject.encodeDotInKeys || queryStringConfig.allowDots : !!optionsObject.allowDots;
    return {
      addQueryPrefix: "boolean" == typeof optionsObject.addQueryPrefix ? optionsObject.addQueryPrefix : queryStringConfig.addQueryPrefix,
      allowDots: isValuePrimitive,
      allowEmptyArrays: "boolean" == typeof optionsObject.allowEmptyArrays ? !!optionsObject.allowEmptyArrays : queryStringConfig.allowEmptyArrays,
      arrayFormat: pushToArray,
      charset: utilityFunctions,
      charsetSentinel: "boolean" == typeof optionsObject.charsetSentinel ? optionsObject.charsetSentinel : queryStringConfig.charsetSentinel,
      commaRoundTrip: !!optionsObject.commaRoundTrip,
      delimiter: void 0 === optionsObject.delimiter ? queryStringConfig.delimiter : optionsObject.delimiter,
      encode: "boolean" == typeof optionsObject.encode ? optionsObject.encode : queryStringConfig.encode,
      encodeDotInKeys: "boolean" == typeof optionsObject.encodeDotInKeys ? optionsObject.encodeDotInKeys : queryStringConfig.encodeDotInKeys,
      encoder: "function" == typeof optionsObject.encoder ? optionsObject.encoder : queryStringConfig.encoder,
      encodeValuesOnly: "boolean" == typeof optionsObject.encodeValuesOnly ? optionsObject.encodeValuesOnly : queryStringConfig.encodeValuesOnly,
      filter: formattedQueryParameters,
      format: defaultUtils,
      formatter: formattedInput,
      serializeDate: "function" == typeof optionsObject.serializeDate ? optionsObject.serializeDate : queryStringConfig.serializeDate,
      skipNulls: "boolean" == typeof optionsObject.skipNulls ? optionsObject.skipNulls : queryStringConfig.skipNulls,
      sort: "function" == typeof optionsObject.sort ? optionsObject.sort : null,
      strictNullHandling: "boolean" == typeof optionsObject.strictNullHandling ? optionsObject.strictNullHandling : queryStringConfig.strictNullHandling
    };
  };
module.exports = function (utilityFunctions, formatHandlers) {
  var __hasOwnProperty,
    defaultUtils = utilityFunctions,
    formattedInput = allowEmptyArraysSetting(formatHandlers);
  "function" == typeof formattedInput.filter ? defaultUtils = (0, formattedInput.filter)("", defaultUtils) : isArrayFunction(formattedInput.filter) && (__hasOwnProperty = formattedInput.filter);
  var formattedQueryParameters = [];
  if ("object" != typeof defaultUtils || null === defaultUtils) return "";
  var queryStringConfig = arrayFormatterFunctions[formattedInput.arrayFormat],
    isValuePrimitive = "comma" === queryStringConfig && formattedInput.commaRoundTrip;
  __hasOwnProperty || (__hasOwnProperty = Object.keys(defaultUtils)), formattedInput.sort && __hasOwnProperty.sort(formattedInput.sort);
  for (var cyclicReferenceMap = optionsObject(), currentIndex = 0; currentIndex < __hasOwnProperty.length; ++currentIndex) {
    var traversalDepth = __hasOwnProperty[currentIndex],
      formatValueForKey = defaultUtils[traversalDepth];
    formattedInput.skipNulls && null === formatValueForKey || pushToArray(formattedQueryParameters, handleCircularReferences(formatValueForKey, traversalDepth, queryStringConfig, isValuePrimitive, formattedInput.allowEmptyArrays, formattedInput.strictNullHandling, formattedInput.skipNulls, formattedInput.encodeDotInKeys, formattedInput.encode ? formattedInput.encoder : null, formattedInput.filter, formattedInput.sort, formattedInput.allowDots, formattedInput.serializeDate, formattedInput.format, formattedInput.formatter, formattedInput.encodeValuesOnly, formattedInput.charset, cyclicReferenceMap));
  }
  var encodedQueryString = formattedQueryParameters.join(formattedInput.delimiter),
    queryStringPrefix = !0 === formattedInput.addQueryPrefix ? "?" : "";
  return formattedInput.charsetSentinel && ("iso-8859-1" === formattedInput.charset ? queryStringPrefix += "utf8=%26%2310003%3B&" : queryStringPrefix += "utf8=%E2%9C%93&"), encodedQueryString.length > 0 ? queryStringPrefix + encodedQueryString : "";
};