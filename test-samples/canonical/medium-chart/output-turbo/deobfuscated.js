import {
  r as notifyListeners,
  a as animationOptions,
  e as currentStepIndex,
  c as colorParser,
  i as currentAnimationIndex,
  d as animationDuration,
  b as animatedChartItems,
  v as chartAnimationRunning,
  u as requestAnimationFrameId,
  l as requestAnimationFrameID,
  f as _requestAnimationFrameId,
  g as chartUpdateTrigger,
  h as canvasContext,
  s as isPathClosed,
  j as tooltipHandler,
  k as chartUpdateInterval,
  _ as adapterFunctions,
  t as requestAnimation,
  m as minifiedVar,
  n as __requestAnimationFrameId,
  T as lastAnimationUpdateTimestamp,
  o as _isChartAnimationRunning,
  p as _animatedChartItems,
  H as currentFrameTimestamp,
  P as notificationListener,
  q as chartAnimationQueue,
  w as refreshIntervalId,
  x as requestId,
  y as __chartUpdater,
  z as lastDateUpdated,
  A as lastAnimationTimestamp,
  B as notificationFunction,
  C as chartUpdater,
  D as _lastAnimationUpdateTimestamp,
  E as __animationElement,
  F as __lastDateUpdated,
  G as _____animationIndex,
  I as requestAnimationFrameUniqueId,
  J as chartAnimationId,
  K as _notificationFunction,
  L as _____requestAnimationFrameId,
  M as _________animationManager,
  N as _currentFrameTimestamp,
  O as __tooltipHandler,
  Q as ________animationContext,
  R as _______requestAnimationFrameId,
  S as chartAnimationState,
  U as _____animationState,
  V as __chartUpdateTrigger,
  W as _chartUpdateInterval,
  X as __chartAnimationQueue,
  Y as __________animationManager,
  Z as ___lastDateUpdated,
  $ as ______chartAnimationQueue,
  a0 as requestAnimationFrame,
  a1 as animationTarget,
  a2 as animationQueue,
  a3 as animationStep,
  a4 as _animationDuration,
  a5 as animationItems,
  a6 as animationTask,
  a7 as ___requestAnimationFrameId,
  a8 as chartAnimationItems,
  a9 as lastTickValue,
  aa as _chartAnimationItems,
  ab as lastUpdateDate,
  ac as animationController,
  ad as animationFrameRequestId,
  ae as _animationFrameRequestId,
  af as animationFrameRequest,
  ag as minimizedTime,
  ah as _animationController,
  ai as animationIdentifier,
  aj as animationRequestId,
  ak as __animationController,
  al as animationManager,
  am as _animationManager,
  an as animationTaskId,
  ao as __chartUpdateInterval,
  ap as animationHandler,
  aq as _animationStep,
  ar as ___animationStep,
  as as _chartAnimationState,
  at as __animationStep,
  au as ___animationController,
  av as animationState,
  aw as elementBorderRadius,
  ax as _requestAnimationFrame,
  ay as animationRefreshRate,
  az as __animationManager,
  aA as chartRequestAnimationFrame,
  aB as framerate,
  aC as chartAnimationController,
  aD as __animationDuration,
  aE as ___animationDuration,
  aF as width,
  aG as _animationHandler,
  aH as __animationHandler,
  aI as __requestAnimationFrame,
  aJ as tooltipVisible,
  aK as tooltipOptions,
  aL as tooltipActiveElements,
  aM as ___animationManager,
  aN as ____animationController,
  aO as _chartAnimationQueue,
  aP as _animationQueue,
} from "./chunks/helpers.segment.js";
import "@kurkle/color";
class AnimationController {
  constructor() {
    this._request = null;
    this._charts = new Map();
    this._running = false;
    this._lastDate = undefined;
  }
  _notify(
    ____________________chartInstance,
    _______________________event,
    _currentStepIndex,
    listenerIndex,
  ) {
    const eventListenersForStep =
      _______________________event.listeners[listenerIndex];
    const eventDuration = _______________________event.duration;
    eventListenersForStep.forEach((chartSetup) =>
      chartSetup({
        chart: ____________________chartInstance,
        initial: _______________________event.initial,
        numSteps: eventDuration,
        currentStep: Math.min(
          _currentStepIndex - _______________________event.start,
          eventDuration,
        ),
      }),
    );
  }
  _refresh() {
    if (!this._request) {
      this._running = true;
      this._request = notifyListeners.call(window, () => {
        this._update();
        this._request = null;
        if (this._running) {
          this._refresh();
        }
      });
    }
  }
  _update(currentTime = Date.now()) {
    let inactiveItemsCount = 0;
    this._charts.forEach((__animationContext, canvasRenderer) => {
      if (!__animationContext.running || !__animationContext.items.length) {
        return;
      }
      const itemsList = __animationContext.items;
      let animationItem;
      let lastIndex = itemsList.length - 1;
      let hasActiveItems = false;
      for (; lastIndex >= 0; --lastIndex) {
        animationItem = itemsList[lastIndex];
        if (animationItem._active) {
          if (animationItem._total > __animationContext.duration) {
            __animationContext.duration = animationItem._total;
          }
          animationItem.tick(currentTime);
          hasActiveItems = true;
        } else {
          itemsList[lastIndex] = itemsList[itemsList.length - 1];
          itemsList.pop();
        }
      }
      if (hasActiveItems) {
        canvasRenderer.draw();
        this._notify(
          canvasRenderer,
          __animationContext,
          currentTime,
          "progress",
        );
      }
      if (!itemsList.length) {
        __animationContext.running = false;
        this._notify(
          canvasRenderer,
          __animationContext,
          currentTime,
          "complete",
        );
        __animationContext.initial = false;
      }
      inactiveItemsCount += itemsList.length;
    });
    this._lastDate = currentTime;
    if (inactiveItemsCount === 0) {
      this._running = false;
    }
  }
  _getAnims(___animationType) {
    const _chartsMap = this._charts;
    let _animationData = _chartsMap.get(___animationType);
    if (!_animationData) {
      _animationData = {
        running: false,
        initial: true,
        items: [],
        listeners: {
          complete: [],
          progress: [],
        },
      };
      _chartsMap.set(___animationType, _animationData);
    }
    return _animationData;
  }
  listen(_animationType, eventIndex, animationListener) {
    this._getAnims(_animationType).listeners[eventIndex].push(
      animationListener,
    );
  }
  add(animationTimestamp, __animationItems) {
    if (__animationItems && __animationItems.length) {
      this._getAnims(animationTimestamp).items.push(...__animationItems);
    }
  }
  has(animationType) {
    return this._getAnims(animationType).items.length > 0;
  }
  start(__chartId) {
    const ___chart = this._charts.get(__chartId);
    if (___chart) {
      ___chart.running = true;
      ___chart.start = Date.now();
      ___chart.duration = ___chart.items.reduce(
        (maxDuration, elementDuration) =>
          Math.max(maxDuration, elementDuration._duration),
        0,
      );
      this._refresh();
    }
  }
  running(_chartId) {
    if (!this._running) {
      return false;
    }
    const chartInfo = this._charts.get(_chartId);
    return !!chartInfo && !!chartInfo.running && !!chartInfo.items.length;
  }
  stop(___chartId) {
    const _______________________________chartData =
      this._charts.get(___chartId);
    if (
      !_______________________________chartData ||
      !_______________________________chartData.items.length
    ) {
      return;
    }
    const chartItems = _______________________________chartData.items;
    let ________________________________________________index =
      chartItems.length - 1;
    for (
      ;
      ________________________________________________index >= 0;
      --________________________________________________index
    ) {
      chartItems[
        ________________________________________________index
      ].cancel();
    }
    _______________________________chartData.items = [];
    this._notify(
      ___chartId,
      _______________________________chartData,
      Date.now(),
      "complete",
    );
  }
  remove(chartToRemove) {
    return this._charts.delete(chartToRemove);
  }
}
var animationControllerInstance = new AnimationController();
const defaultColor = "transparent";
const animationFunctions = {
  boolean: (__thresholdValue, ___thresholdValue, ____thresholdValue) =>
    ____thresholdValue > 0.5 ? ___thresholdValue : __thresholdValue,
  color(baseColor, secondaryColor, mixingRatio) {
    const _baseColor = colorParser(baseColor || defaultColor);
    const isSecondColorValid =
      _baseColor.valid && colorParser(secondaryColor || defaultColor);
    if (isSecondColorValid && isSecondColorValid.valid) {
      return isSecondColorValid.mix(_baseColor, mixingRatio).hexString();
    } else {
      return secondaryColor;
    }
  },
  number: (initialValue, endTime, interpolationFactor) =>
    initialValue + (endTime - initialValue) * interpolationFactor,
};
class ___AnimationController {
  constructor(
    _animationConfig,
    animationSource,
    targetPropertyIndex,
    toAnimationOptions,
  ) {
    const targetAnimationProperty = animationSource[targetPropertyIndex];
    toAnimationOptions = animationOptions([
      _animationConfig.to,
      toAnimationOptions,
      targetAnimationProperty,
      _animationConfig.from,
    ]);
    const fromAnimationOptions = animationOptions([
      _animationConfig.from,
      targetAnimationProperty,
      toAnimationOptions,
    ]);
    this._active = true;
    this._fn =
      _animationConfig.fn ||
      animationFunctions[_animationConfig.type || typeof fromAnimationOptions];
    this._easing =
      currentStepIndex[_animationConfig.easing] || currentStepIndex.linear;
    this._start = Math.floor(Date.now() + (_animationConfig.delay || 0));
    this._duration = this._total = Math.floor(_animationConfig.duration);
    this._loop = !!_animationConfig.loop;
    this._target = animationSource;
    this._prop = targetPropertyIndex;
    this._from = fromAnimationOptions;
    this._to = toAnimationOptions;
    this._promises = undefined;
  }
  active() {
    return this._active;
  }
  update(animationFrame, currentAnimationProgress, currentTimestamp) {
    if (this._active) {
      this._notify(false);
      const targetPropertyValue = this._target[this._prop];
      const _elapsedTime = currentTimestamp - this._start;
      const remainingDuration = this._duration - _elapsedTime;
      this._start = currentTimestamp;
      this._duration = Math.floor(
        Math.max(remainingDuration, animationFrame.duration),
      );
      this._total += _elapsedTime;
      this._loop = !!animationFrame.loop;
      this._to = animationOptions([
        animationFrame.to,
        currentAnimationProgress,
        targetPropertyValue,
        animationFrame.from,
      ]);
      this._from = animationOptions([
        animationFrame.from,
        targetPropertyValue,
        currentAnimationProgress,
      ]);
    }
  }
  cancel() {
    if (this._active) {
      this.tick(Date.now());
      this._active = false;
      this._notify(false);
    }
  }
  tick(____elapsedTime) {
    const _____elapsedTime = ____elapsedTime - this._start;
    const duration = this._duration;
    const _____propertyKey = this._prop;
    const ___initialValue = this._from;
    const _isLooping = this._loop;
    const ________targetValue = this._to;
    let normalizedElapsedTime;
    this._active =
      ___initialValue !== ________targetValue &&
      (_isLooping || _____elapsedTime < duration);
    if (!this._active) {
      this._target[_____propertyKey] = ________targetValue;
      this._notify(true);
      return;
    }
    if (_____elapsedTime < 0) {
      this._target[_____propertyKey] = ___initialValue;
    } else {
      normalizedElapsedTime = (_____elapsedTime / duration) % 2;
      if (_isLooping && normalizedElapsedTime > 1) {
        normalizedElapsedTime = 2 - normalizedElapsedTime;
      } else {
        normalizedElapsedTime = normalizedElapsedTime;
      }
      normalizedElapsedTime = this._easing(
        Math.min(1, Math.max(0, normalizedElapsedTime)),
      );
      this._target[_____propertyKey] = this._fn(
        ___initialValue,
        ________targetValue,
        normalizedElapsedTime,
      );
    }
  }
  wait() {
    const promiseQueue = (this._promises ||= []);
    return new Promise((resolveFunction, rejectCallback) => {
      promiseQueue.push({
        res: resolveFunction,
        rej: rejectCallback,
      });
    });
  }
  _notify(_______________________________________________index) {
    const responseStatus = _______________________________________________index
      ? "res"
      : "rej";
    const promiseArray = this._promises || [];
    for (
      let ______________________________________________index = 0;
      ______________________________________________index < promiseArray.length;
      ______________________________________________index++
    ) {
      promiseArray[______________________________________________index][
        responseStatus
      ]();
    }
  }
}
class ____AnimationController {
  constructor(__________________chartInstance, __configOptions) {
    this._chart = __________________chartInstance;
    this._properties = new Map();
    this.configure(__configOptions);
  }
  configure(_animationStates) {
    if (!currentAnimationIndex(_animationStates)) {
      return;
    }
    const animationDurationKeys = Object.keys(animationDuration.animation);
    const propertiesMap = this._properties;
    Object.getOwnPropertyNames(_animationStates).forEach((currentState) => {
      const animatedData = _animationStates[currentState];
      if (!currentAnimationIndex(animatedData)) {
        return;
      }
      const animationProperties = {};
      for (const animationProperty of animationDurationKeys) {
        animationProperties[animationProperty] =
          animatedData[animationProperty];
      }
      (
        (animatedChartItems(animatedData.properties) &&
          animatedData.properties) || [currentState]
      ).forEach((____animationState) => {
        if (
          ____animationState === currentState ||
          !propertiesMap.has(____animationState)
        ) {
          propertiesMap.set(____animationState, animationProperties);
        }
      });
    });
  }
  _animateOptions(_animationTarget, _______animationOptions) {
    const ________animationOptions = _______animationOptions.options;
    const _________animationOptions = optionsHandler(
      _animationTarget,
      ________animationOptions,
    );
    if (!_________animationOptions) {
      return [];
    }
    const animationsList = this._createAnimations(
      _________animationOptions,
      ________animationOptions,
    );
    if (________animationOptions.$shared) {
      fetchActivePromises(
        _animationTarget.options.$animations,
        ________animationOptions,
      ).then(
        () => {
          _animationTarget.options = ________animationOptions;
        },
        () => {},
      );
    }
    return animationsList;
  }
  _createAnimations(_______targetObject, _____animationProperties) {
    const _propertiesMap = this._properties;
    const animationInstances = [];
    const _animationsMap = (_______targetObject.$animations ||= {});
    const animationPropertyKeys = Object.keys(_____animationProperties);
    const _currentTimestamp = Date.now();
    let reverseIndex;
    for (
      reverseIndex = animationPropertyKeys.length - 1;
      reverseIndex >= 0;
      --reverseIndex
    ) {
      const _item = animationPropertyKeys[reverseIndex];
      if (_item.charAt(0) === "$") {
        continue;
      }
      if (_item === "options") {
        animationInstances.push(
          ...this._animateOptions(
            _______targetObject,
            _____animationProperties,
          ),
        );
        continue;
      }
      const valueForKey = _____animationProperties[_item];
      let animationInstance = _animationsMap[_item];
      const animationDetails = _propertiesMap.get(_item);
      if (animationInstance) {
        if (animationDetails && animationInstance.active()) {
          animationInstance.update(
            animationDetails,
            valueForKey,
            _currentTimestamp,
          );
          continue;
        }
        animationInstance.cancel();
      }
      if (animationDetails && animationDetails.duration) {
        _animationsMap[_item] = animationInstance = new ___AnimationController(
          animationDetails,
          _______targetObject,
          _item,
          valueForKey,
        );
        animationInstances.push(animationInstance);
      } else {
        _______targetObject[_item] = valueForKey;
      }
    }
    return animationInstances;
  }
  update(_____targetObject, ____animationProperties) {
    if (this._properties.size === 0) {
      Object.assign(_____targetObject, ____animationProperties);
      return;
    }
    const createdAnimations = this._createAnimations(
      _____targetObject,
      ____animationProperties,
    );
    if (createdAnimations.length) {
      animationControllerInstance.add(this._chart, createdAnimations);
      return true;
    } else {
      return undefined;
    }
  }
}
function fetchActivePromises(_targetObject, itemObject) {
  const activePromiseWaits = [];
  const itemObjectKeys = Object.keys(itemObject);
  for (
    let __itemIndex = 0;
    __itemIndex < itemObjectKeys.length;
    __itemIndex++
  ) {
    const targetObjectValue = _targetObject[itemObjectKeys[__itemIndex]];
    if (targetObjectValue && targetObjectValue.active()) {
      activePromiseWaits.push(targetObjectValue.wait());
    }
  }
  return Promise.all(activePromiseWaits);
}
function optionsHandler(targetObject, userProvidedOptions) {
  if (!userProvidedOptions) {
    return;
  }
  let _currentOptions = targetObject.options;
  if (_currentOptions) {
    if (_currentOptions.$shared) {
      targetObject.options = _currentOptions = Object.assign(
        {},
        _currentOptions,
        {
          $shared: false,
          $animations: {},
        },
      );
    }
    return _currentOptions;
  }
  targetObject.options = userProvidedOptions;
}
function _calculateRange(inputConfig, referenceValue) {
  const inputOptions = (inputConfig && inputConfig.options) || {};
  const isReversed = inputOptions.reverse;
  const _minValue = inputOptions.min === undefined ? referenceValue : 0;
  const maxRangeValue = inputOptions.max === undefined ? referenceValue : 0;
  return {
    start: isReversed ? maxRangeValue : _minValue,
    end: isReversed ? _minValue : maxRangeValue,
  };
}
function calculateBoundingBox(
  __targetElement,
  referenceElement,
  isCalculationEnabled,
) {
  if (isCalculationEnabled === false) {
    return false;
  }
  const targetElementRange = _calculateRange(
    __targetElement,
    isCalculationEnabled,
  );
  const referenceRange = _calculateRange(
    referenceElement,
    isCalculationEnabled,
  );
  return {
    top: referenceRange.end,
    right: targetElementRange.end,
    bottom: referenceRange.start,
    left: targetElementRange.start,
  };
}
function topBoundary(animationBoundary) {
  let topBoundaryValue;
  let _rightBoundary;
  let animationBoundaryBottom;
  let leftBoundary;
  if (currentAnimationIndex(animationBoundary)) {
    topBoundaryValue = animationBoundary.top;
    _rightBoundary = animationBoundary.right;
    animationBoundaryBottom = animationBoundary.bottom;
    leftBoundary = animationBoundary.left;
  } else {
    topBoundaryValue =
      _rightBoundary =
      animationBoundaryBottom =
      leftBoundary =
        animationBoundary;
  }
  return {
    top: topBoundaryValue,
    right: _rightBoundary,
    bottom: animationBoundaryBottom,
    left: leftBoundary,
    disabled: animationBoundary === false,
  };
}
function getDatasetIndices(datasetMetas, _________datasetMeta) {
  const datasetIndices = [];
  const sortedDatasetMetas =
    datasetMetas._getSortedDatasetMetas(_________datasetMeta);
  let ___________________________________________currentIndex;
  let sortedDatasetMetaCount;
  ___________________________________________currentIndex = 0;
  sortedDatasetMetaCount = sortedDatasetMetas.length;
  for (
    ;
    ___________________________________________currentIndex <
    sortedDatasetMetaCount;
    ++___________________________________________currentIndex
  ) {
    datasetIndices.push(
      sortedDatasetMetas[
        ___________________________________________currentIndex
      ].index,
    );
  }
  return datasetIndices;
}
function updateCurrentValue(
  data,
  currentValue,
  __________index,
  settings = {},
) {
  const dataKeys = data.keys;
  const isSingleMode = settings.mode === "single";
  let indexCounter;
  let numKeys;
  let numericKey;
  let currentValueAdjustment;
  if (currentValue !== null) {
    indexCounter = 0;
    numKeys = dataKeys.length;
    for (; indexCounter < numKeys; ++indexCounter) {
      numericKey = +dataKeys[indexCounter];
      if (numericKey === __________index) {
        if (settings.all) {
          continue;
        }
        break;
      }
      currentValueAdjustment = data.values[numericKey];
      if (
        chartUpdateTrigger(currentValueAdjustment) &&
        (isSingleMode ||
          currentValue === 0 ||
          isPathClosed(currentValue) === isPathClosed(currentValueAdjustment))
      ) {
        currentValue += currentValueAdjustment;
      }
    }
    return currentValue;
  }
}
function transformDataToKeyValuePairs(_dataObject) {
  const _dataKeys = Object.keys(_dataObject);
  const keyValuePairArray = new Array(_dataKeys.length);
  let _____________________________________________________________index;
  let dataKeysCount;
  let __key;
  _____________________________________________________________index = 0;
  dataKeysCount = _dataKeys.length;
  for (
    ;
    _____________________________________________________________index <
    dataKeysCount;
    ++_____________________________________________________________index
  ) {
    __key =
      _dataKeys[
        _____________________________________________________________index
      ];
    keyValuePairArray[
      _____________________________________________________________index
    ] = {
      x: __key,
      y: _dataObject[__key],
    };
  }
  return keyValuePairArray;
}
function isStackedOption(isStacked, stackedOption) {
  const isStackedOptionEnabled = isStacked && isStacked.options.stacked;
  return (
    isStackedOptionEnabled ||
    (isStackedOptionEnabled === undefined && stackedOption.stack !== undefined)
  );
}
function getFormattedId(____targetElement, __________element, _inputObject) {
  return `${____targetElement.id}.${__________element.id}.${_inputObject.stack || _inputObject.type}`;
}
function getUserBoundsWithInfiniteFallback(userBounds) {
  const {
    min: minUserBound,
    max: maxBound,
    minDefined: __isMinDefined,
    maxDefined: isMaxDefined,
  } = userBounds.getUserBounds();
  return {
    min: __isMinDefined ? minUserBound : Number.NEGATIVE_INFINITY,
    max: isMaxDefined ? maxBound : Number.POSITIVE_INFINITY,
  };
}
function getOrCreateNestedObject(__targetObject, _propertyKey, __propertyKey) {
  const nestedObject = (__targetObject[_propertyKey] ||= {});
  return (nestedObject[__propertyKey] ||= {});
}
function getMatchingMetaIndex(
  metaValues,
  visibleMeta,
  isPositiveCondition,
  visibleMetaSearch,
) {
  for (const matchingMetaItem of visibleMeta
    .getMatchingVisibleMetas(visibleMetaSearch)
    .reverse()) {
    const metaValue = metaValues[matchingMetaItem.index];
    if (
      (isPositiveCondition && metaValue > 0) ||
      (!isPositiveCondition && metaValue < 0)
    ) {
      return matchingMetaItem.index;
    }
  }
  return null;
}
function processChartData(________chartData, dataArray) {
  const { chart: ______chartConfig, _cachedMeta: cachedMetaData } =
    ________chartData;
  const stacksCache = (______chartConfig._stacks ||= {});
  const {
    iScale: _iScale,
    vScale: verticalScale,
    index: ____________dataIndex,
  } = cachedMetaData;
  const horizontalAxis = _iScale.axis;
  const _verticalScaleAxis = verticalScale.axis;
  const formattedId = getFormattedId(_iScale, verticalScale, cachedMetaData);
  const dataArrayLength = dataArray.length;
  let stackedDataItem;
  for (
    let _____________dataIndex = 0;
    _____________dataIndex < dataArrayLength;
    ++_____________dataIndex
  ) {
    const dataItem = dataArray[_____________dataIndex];
    const {
      [horizontalAxis]: valueForProcessing,
      [_verticalScaleAxis]: dataValue,
    } = dataItem;
    stackedDataItem = (dataItem._stacks ||= {})[_verticalScaleAxis] =
      getOrCreateNestedObject(stacksCache, formattedId, valueForProcessing);
    stackedDataItem[____________dataIndex] = dataValue;
    stackedDataItem._top = getMatchingMetaIndex(
      stackedDataItem,
      verticalScale,
      true,
      cachedMetaData.type,
    );
    stackedDataItem._bottom = getMatchingMetaIndex(
      stackedDataItem,
      verticalScale,
      false,
      cachedMetaData.type,
    );
    (stackedDataItem._visualValues ||= {})[____________dataIndex] = dataValue;
  }
}
function getFirstMatchingScale(scaleKey, ____axisIdentifier) {
  const scalesCollection = scaleKey.scales;
  return Object.keys(scalesCollection)
    .filter(
      (axisScaleIndex) =>
        scalesCollection[axisScaleIndex].axis === ____axisIdentifier,
    )
    .shift();
}
function ____tooltipHandler(_tooltipData, __________________datasetIndex) {
  return tooltipHandler(_tooltipData, {
    active: false,
    dataset: undefined,
    datasetIndex: __________________datasetIndex,
    index: __________________datasetIndex,
    mode: "default",
    type: "dataset",
  });
}
function ___tooltipHandler(tooltipData, ________dataIndex, tooltipElement) {
  return tooltipHandler(tooltipData, {
    active: false,
    dataIndex: ________dataIndex,
    parsed: undefined,
    raw: undefined,
    element: tooltipElement,
    index: ________dataIndex,
    mode: "default",
    type: "data",
  });
}
function removeStackedValues(____________chartData, parsedDataArray) {
  const controllerIndex = ____________chartData.controller.index;
  const verticalScaleAxis =
    ____________chartData.vScale && ____________chartData.vScale.axis;
  if (verticalScaleAxis) {
    parsedDataArray = parsedDataArray || ____________chartData._parsed;
    for (const stackItem of parsedDataArray) {
      const stackData = stackItem._stacks;
      if (
        !stackData ||
        stackData[verticalScaleAxis] === undefined ||
        stackData[verticalScaleAxis][controllerIndex] === undefined
      ) {
        return;
      }
      delete stackData[verticalScaleAxis][controllerIndex];
      if (
        stackData[verticalScaleAxis]._visualValues !== undefined &&
        stackData[verticalScaleAxis]._visualValues[controllerIndex] !==
          undefined
      ) {
        delete stackData[verticalScaleAxis]._visualValues[controllerIndex];
      }
    }
  }
}
const isResetOrNone = (resetState) =>
  resetState === "reset" || resetState === "none";
const isRequestActive = (____targetObject, __isValid) =>
  __isValid ? ____targetObject : Object.assign({}, ____targetObject);
const getNormalizedAnimationData = (
  __isVisible,
  _____dataset,
  __________________________________datasetIndex,
) =>
  __isVisible &&
  !_____dataset.hidden &&
  _____dataset._stacked && {
    keys: getDatasetIndices(
      __________________________________datasetIndex,
      true,
    ),
    values: null,
  };
class ChartElement {
  static defaults = {};
  static datasetElementType = null;
  static dataElementType = null;
  constructor(
    _______________________________chartInstance,
    _________________________dataIndex,
  ) {
    this.chart = _______________________________chartInstance;
    this._ctx = _______________________________chartInstance.ctx;
    this.index = _________________________dataIndex;
    this._cachedDataOpts = {};
    this._cachedMeta = this.getMeta();
    this._type = this._cachedMeta.type;
    this.options = undefined;
    this._parsing = false;
    this._data = undefined;
    this._objectData = undefined;
    this._sharedOptions = undefined;
    this._drawStart = undefined;
    this._drawCount = undefined;
    this.enableOptionSharing = false;
    this.supportsDecimation = false;
    this.$context = undefined;
    this._syncList = [];
    this.datasetElementType = new.target.datasetElementType;
    this.dataElementType = new.target.dataElementType;
    this.initialize();
  }
  initialize() {
    const ________________cachedMeta = this._cachedMeta;
    this.configure();
    this.linkScales();
    ________________cachedMeta._stacked = isStackedOption(
      ________________cachedMeta.vScale,
      ________________cachedMeta,
    );
    this.addElements();
    if (this.options.fill && !this.chart.isPluginEnabled("filler")) {
      console.warn(
        "Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options",
      );
    }
  }
  updateIndex(newIndex) {
    if (this.index !== newIndex) {
      removeStackedValues(this._cachedMeta);
    }
    this.index = newIndex;
  }
  linkScales() {
    const ____________________________chartInstance = this.chart;
    const _____________________cachedMeta = this._cachedMeta;
    const ___________dataset = this.getDataset();
    const retrieveAxisID = (typeIndicator, _result, defaultValue, _status) =>
      typeIndicator === "x"
        ? _result
        : typeIndicator === "r"
          ? _status
          : defaultValue;
    const xAxisID = (_____________________cachedMeta.xAxisID =
      chartAnimationRunning(
        ___________dataset.xAxisID,
        getFirstMatchingScale(____________________________chartInstance, "x"),
      ));
    const yAxisID = (_____________________cachedMeta.yAxisID =
      chartAnimationRunning(
        ___________dataset.yAxisID,
        getFirstMatchingScale(____________________________chartInstance, "y"),
      ));
    const radialAxisID = (_____________________cachedMeta.rAxisID =
      chartAnimationRunning(
        ___________dataset.rAxisID,
        getFirstMatchingScale(____________________________chartInstance, "r"),
      ));
    const __indexAxis = _____________________cachedMeta.indexAxis;
    const indexAxisID = (_____________________cachedMeta.iAxisID =
      retrieveAxisID(__indexAxis, xAxisID, yAxisID, radialAxisID));
    const verticalAxisID = (_____________________cachedMeta.vAxisID =
      retrieveAxisID(__indexAxis, yAxisID, xAxisID, radialAxisID));
    _____________________cachedMeta.xScale = this.getScaleForId(xAxisID);
    _____________________cachedMeta.yScale = this.getScaleForId(yAxisID);
    _____________________cachedMeta.rScale = this.getScaleForId(radialAxisID);
    _____________________cachedMeta.iScale = this.getScaleForId(indexAxisID);
    _____________________cachedMeta.vScale = this.getScaleForId(verticalAxisID);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(scaleId) {
    return this.chart.scales[scaleId];
  }
  _getOtherScale(_inputScale) {
    const ___cachedMeta = this._cachedMeta;
    if (_inputScale === ___cachedMeta.iScale) {
      return ___cachedMeta.vScale;
    } else {
      return ___cachedMeta.iScale;
    }
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const __cachedMeta = this._cachedMeta;
    if (this._data) {
      requestAnimationFrameId(this._data, this);
    }
    if (__cachedMeta._stacked) {
      removeStackedValues(__cachedMeta);
    }
  }
  _dataCheck() {
    const ________dataset = this.getDataset();
    const datasetData = (________dataset.data ||= []);
    const previousData = this._data;
    if (currentAnimationIndex(datasetData)) {
      this._data = transformDataToKeyValuePairs(datasetData);
    } else if (previousData !== datasetData) {
      if (previousData) {
        requestAnimationFrameId(previousData, this);
        const ____dataset = this._cachedMeta;
        removeStackedValues(____dataset);
        ____dataset._parsed = [];
      }
      if (datasetData && Object.isExtensible(datasetData)) {
        requestAnimationFrameID(datasetData, this);
      }
      this._syncList = [];
      this._data = datasetData;
    }
  }
  addElements() {
    const ____cachedMeta = this._cachedMeta;
    this._dataCheck();
    if (this.datasetElementType) {
      ____cachedMeta.dataset = new this.datasetElementType();
    }
  }
  buildOrUpdateElements(elementsToUpdate) {
    const _____________cachedMeta = this._cachedMeta;
    const __currentDataset = this.getDataset();
    let isStackedUpdated = false;
    this._dataCheck();
    const previousStackedValue = _____________cachedMeta._stacked;
    _____________cachedMeta._stacked = isStackedOption(
      _____________cachedMeta.vScale,
      _____________cachedMeta,
    );
    if (_____________cachedMeta.stack !== __currentDataset.stack) {
      isStackedUpdated = true;
      removeStackedValues(_____________cachedMeta);
      _____________cachedMeta.stack = __currentDataset.stack;
    }
    this._resyncElements(elementsToUpdate);
    if (
      isStackedUpdated ||
      previousStackedValue !== _____________cachedMeta._stacked
    ) {
      processChartData(this, _____________cachedMeta._parsed);
    }
  }
  configure() {
    const _________chartConfig = this.chart.config;
    const datasetScopeKeys = _________chartConfig.datasetScopeKeys(this._type);
    const _optionScopes = _________chartConfig.getOptionScopes(
      this.getDataset(),
      datasetScopeKeys,
      true,
    );
    this.options = _________chartConfig.createResolver(
      _optionScopes,
      this.getContext(),
    );
    this._parsing = this.options.parsing;
    this._cachedDataOpts = {};
  }
  parse(
    __________________________________________________________________________________currentIndex,
    __dataLength,
  ) {
    const {
      _cachedMeta: ________________________cachedMeta,
      _data: _______dataArray,
    } = this;
    const { iScale: ______iScale, _stacked: __isStacked } =
      ________________________cachedMeta;
    const iScaleAxis = ______iScale.axis;
    let __________________index;
    let _currentData;
    let ____________parsedData;
    let shouldResetSortingFlag =
      (__________________________________________________________________________________currentIndex ===
        0 &&
        __dataLength === _______dataArray.length) ||
      ________________________cachedMeta._sorted;
    let previousParsedData =
      __________________________________________________________________________________currentIndex >
        0 &&
      ________________________cachedMeta._parsed[
        __________________________________________________________________________________currentIndex -
          1
      ];
    if (this._parsing === false) {
      ________________________cachedMeta._parsed = _______dataArray;
      ________________________cachedMeta._sorted = true;
      ____________parsedData = _______dataArray;
    } else {
      if (
        animatedChartItems(
          _______dataArray[
            __________________________________________________________________________________currentIndex
          ],
        )
      ) {
        ____________parsedData = this.parseArrayData(
          ________________________cachedMeta,
          _______dataArray,
          __________________________________________________________________________________currentIndex,
          __dataLength,
        );
      } else if (
        currentAnimationIndex(
          _______dataArray[
            __________________________________________________________________________________currentIndex
          ],
        )
      ) {
        ____________parsedData = this.parseObjectData(
          ________________________cachedMeta,
          _______dataArray,
          __________________________________________________________________________________currentIndex,
          __dataLength,
        );
      } else {
        ____________parsedData = this.parsePrimitiveData(
          ________________________cachedMeta,
          _______dataArray,
          __________________________________________________________________________________currentIndex,
          __dataLength,
        );
      }
      const iScale = () =>
        _currentData[iScaleAxis] === null ||
        (previousParsedData &&
          _currentData[iScaleAxis] < previousParsedData[iScaleAxis]);
      for (
        __________________index = 0;
        __________________index < __dataLength;
        ++__________________index
      ) {
        ________________________cachedMeta._parsed[
          __________________index +
            __________________________________________________________________________________currentIndex
        ] = _currentData = ____________parsedData[__________________index];
        if (shouldResetSortingFlag) {
          if (iScale()) {
            shouldResetSortingFlag = false;
          }
          previousParsedData = _currentData;
        }
      }
      ________________________cachedMeta._sorted = shouldResetSortingFlag;
    }
    if (__isStacked) {
      processChartData(this, ____________parsedData);
    }
  }
  parsePrimitiveData(
    dataScales,
    _________________________inputValue,
    baseIndex,
    _____arrayLength,
  ) {
    const { iScale: ____iScale, vScale: ____valueScale } = dataScales;
    const _inputAxis = ____iScale.axis;
    const valueScaleAxis = ____valueScale.axis;
    const iScaleLabels = ____iScale.getLabels();
    const isSameScale = ____iScale === ____valueScale;
    const ___parsedDataArray = new Array(_____arrayLength);
    let ____________________________index;
    let _______inputArrayLength;
    let _dataArrayIndex;
    ____________________________index = 0;
    _______inputArrayLength = _____arrayLength;
    for (
      ;
      ____________________________index < _______inputArrayLength;
      ++____________________________index
    ) {
      _dataArrayIndex = ____________________________index + baseIndex;
      ___parsedDataArray[____________________________index] = {
        [_inputAxis]:
          isSameScale ||
          ____iScale.parse(iScaleLabels[_dataArrayIndex], _dataArrayIndex),
        [valueScaleAxis]: ____valueScale.parse(
          _________________________inputValue[_dataArrayIndex],
          _dataArrayIndex,
        ),
      };
    }
    return ___parsedDataArray;
  }
  parseArrayData(_data, ____dataArray, dataArrayIndex, ___arrayLength) {
    const { xScale: xScaleParser, yScale: yScaleParser } = _data;
    const __parsedDataArray = new Array(___arrayLength);
    let _________________________index;
    let ____arrayLength;
    let dataArrayIndexAdjusted;
    let _________dataPoint;
    _________________________index = 0;
    ____arrayLength = ___arrayLength;
    for (
      ;
      _________________________index < ____arrayLength;
      ++_________________________index
    ) {
      dataArrayIndexAdjusted = _________________________index + dataArrayIndex;
      _________dataPoint = ____dataArray[dataArrayIndexAdjusted];
      __parsedDataArray[_________________________index] = {
        x: xScaleParser.parse(_________dataPoint[0], dataArrayIndexAdjusted),
        y: yScaleParser.parse(_________dataPoint[1], dataArrayIndexAdjusted),
      };
    }
    return __parsedDataArray;
  }
  parseObjectData(
    ___dataObject,
    _____dataArray,
    _________startIndex,
    ______arrayLength,
  ) {
    const { xScale: _xScaleParser, yScale: _yScaleParser } = ___dataObject;
    const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
    const ____parsedDataArray = new Array(______arrayLength);
    let loopIndex;
    let _______arrayLength;
    let __dataArrayIndex;
    let dataArrayElement;
    loopIndex = 0;
    _______arrayLength = ______arrayLength;
    for (; loopIndex < _______arrayLength; ++loopIndex) {
      __dataArrayIndex = loopIndex + _________startIndex;
      dataArrayElement = _____dataArray[__dataArrayIndex];
      ____parsedDataArray[loopIndex] = {
        x: _xScaleParser.parse(
          _requestAnimationFrameId(dataArrayElement, xAxisKey),
          __dataArrayIndex,
        ),
        y: _yScaleParser.parse(
          _requestAnimationFrameId(dataArrayElement, yAxisKey),
          __dataArrayIndex,
        ),
      };
    }
    return ____parsedDataArray;
  }
  getParsed(_parsedDataIndex) {
    return this._cachedMeta._parsed[_parsedDataIndex];
  }
  getDataElement(________________dataIndex) {
    return this._cachedMeta.data[________________dataIndex];
  }
  applyStack(currentStackAxis, ______eventData, visualUpdateMode) {
    const _______________________chartInstance = this.chart;
    const ___cachedMetaData = this._cachedMeta;
    const currentStackValue = ______eventData[currentStackAxis.axis];
    return updateCurrentValue(
      {
        keys: getDatasetIndices(_______________________chartInstance, true),
        values: ______eventData._stacks[currentStackAxis.axis]._visualValues,
      },
      currentStackValue,
      ___cachedMetaData.index,
      {
        mode: visualUpdateMode,
      },
    );
  }
  updateRangeFromParsed(
    rangeUpdate,
    parsedInput,
    ___________inputData,
    _stackData,
  ) {
    const parsedAxisValue = ___________inputData[parsedInput.axis];
    let currentAxisValue = parsedAxisValue === null ? NaN : parsedAxisValue;
    const stackDataForAxis =
      _stackData && ___________inputData._stacks[parsedInput.axis];
    if (_stackData && stackDataForAxis) {
      _stackData.values = stackDataForAxis;
      currentAxisValue = updateCurrentValue(
        _stackData,
        parsedAxisValue,
        this._cachedMeta.index,
      );
    }
    rangeUpdate.min = Math.min(rangeUpdate.min, currentAxisValue);
    rangeUpdate.max = Math.max(rangeUpdate.max, currentAxisValue);
  }
  getMinMax(_scale, __animationData) {
    const _______________________cachedMeta = this._cachedMeta;
    const ___________parsedData = _______________________cachedMeta._parsed;
    const shouldContinueIteration =
      _______________________cachedMeta._sorted &&
      _scale === _______________________cachedMeta.iScale;
    const parsedDataLength = ___________parsedData.length;
    const otherScale = this._getOtherScale(_scale);
    const normalizedAnimationData = getNormalizedAnimationData(
      __animationData,
      _______________________cachedMeta,
      this.chart,
    );
    const bounds = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
    };
    const { min: userMinBound, max: userMaxBound } =
      getUserBoundsWithInfiniteFallback(otherScale);
    let ___________________________index;
    let currentParsedData;
    function isChartUpdateNeeded() {
      currentParsedData =
        ___________parsedData[___________________________index];
      const __axisValue = currentParsedData[otherScale.axis];
      return (
        !chartUpdateTrigger(currentParsedData[_scale.axis]) ||
        userMinBound > __axisValue ||
        userMaxBound < __axisValue
      );
    }
    for (
      ___________________________index = 0;
      ___________________________index < parsedDataLength &&
      (isChartUpdateNeeded() ||
        (this.updateRangeFromParsed(
          bounds,
          _scale,
          currentParsedData,
          normalizedAnimationData,
        ),
        !shouldContinueIteration));
      ++___________________________index
    ) {}
    if (shouldContinueIteration) {
      for (
        ___________________________index = parsedDataLength - 1;
        ___________________________index >= 0;
        --___________________________index
      ) {
        if (!isChartUpdateNeeded()) {
          this.updateRangeFromParsed(
            bounds,
            _scale,
            currentParsedData,
            normalizedAnimationData,
          );
          break;
        }
      }
    }
    return bounds;
  }
  getAllParsedValues(___axisValue) {
    const parsedValues = this._cachedMeta._parsed;
    const parsedValuesList = [];
    let _______________________________________index;
    let parsedValuesCount;
    let parsedValueForAxis;
    _______________________________________index = 0;
    parsedValuesCount = parsedValues.length;
    for (
      ;
      _______________________________________index < parsedValuesCount;
      ++_______________________________________index
    ) {
      parsedValueForAxis =
        parsedValues[_______________________________________index][
          ___axisValue.axis
        ];
      if (chartUpdateTrigger(parsedValueForAxis)) {
        parsedValuesList.push(parsedValueForAxis);
      }
    }
    return parsedValuesList;
  }
  getMaxOverflow() {
    return false;
  }
  getLabelAndValue(_______parsedData) {
    const _____cachedMetadata = this._cachedMeta;
    const __iScale = _____cachedMetadata.iScale;
    const __valueScale = _____cachedMetadata.vScale;
    const parsedDataValues = this.getParsed(_______parsedData);
    return {
      label: __iScale
        ? "" + __iScale.getLabelForValue(parsedDataValues[__iScale.axis])
        : "",
      value: __valueScale
        ? "" +
          __valueScale.getLabelForValue(parsedDataValues[__valueScale.axis])
        : "",
    };
  }
  _update(updateType) {
    const _____cachedMeta = this._cachedMeta;
    this.update(updateType || "default");
    _____cachedMeta._clip = topBoundary(
      chartAnimationRunning(
        this.options.clip,
        calculateBoundingBox(
          _____cachedMeta.xScale,
          _____cachedMeta.yScale,
          this.getMaxOverflow(),
        ),
      ),
    );
  }
  update(timeElapsed) {}
  draw() {
    const ______________________________canvasContext = this._ctx;
    const _____________________________chartInstance = this.chart;
    const drawIndex = this._cachedMeta;
    const datasetItems = drawIndex.data || [];
    const ____chartArea = _____________________________chartInstance.chartArea;
    const ______activeElements = [];
    const drawStartIndex = this._drawStart || 0;
    const _drawCount = this._drawCount || datasetItems.length - drawStartIndex;
    const drawActiveElementsOnTop = this.options.drawActiveElementsOnTop;
    let _________________index;
    if (drawIndex.dataset) {
      drawIndex.dataset.draw(
        ______________________________canvasContext,
        ____chartArea,
        drawStartIndex,
        _drawCount,
      );
    }
    _________________index = drawStartIndex;
    for (
      ;
      _________________index < drawStartIndex + _drawCount;
      ++_________________index
    ) {
      const _____element = datasetItems[_________________index];
      if (!_____element.hidden) {
        if (_____element.active && drawActiveElementsOnTop) {
          ______activeElements.push(_____element);
        } else {
          _____element.draw(
            ______________________________canvasContext,
            ____chartArea,
          );
        }
      }
    }
    for (
      _________________index = 0;
      _________________index < ______activeElements.length;
      ++_________________index
    ) {
      ______activeElements[_________________index].draw(
        ______________________________canvasContext,
        ____chartArea,
      );
    }
  }
  getStyle(___dataElementIndex, _isElementActive) {
    const styleState = _isElementActive ? "active" : "default";
    if (___dataElementIndex === undefined && this._cachedMeta.dataset) {
      return this.resolveDatasetElementOptions(styleState);
    } else {
      return this.resolveDataElementOptions(
        ___dataElementIndex || 0,
        styleState,
      );
    }
  }
  getContext(_______dataPointIndex, _isActive, tooltipMode) {
    const __________dataset = this.getDataset();
    let tooltipContext;
    if (
      _______dataPointIndex >= 0 &&
      _______dataPointIndex < this._cachedMeta.data.length
    ) {
      const ___dataPoint = this._cachedMeta.data[_______dataPointIndex];
      tooltipContext = ___dataPoint.$context ||= ___tooltipHandler(
        this.getContext(),
        _______dataPointIndex,
        ___dataPoint,
      );
      tooltipContext.parsed = this.getParsed(_______dataPointIndex);
      tooltipContext.raw = __________dataset.data[_______dataPointIndex];
      tooltipContext.index = tooltipContext.dataIndex = _______dataPointIndex;
    } else {
      tooltipContext = this.$context ||= ____tooltipHandler(
        this.chart.getContext(),
        this.index,
      );
      tooltipContext.dataset = __________dataset;
      tooltipContext.index = tooltipContext.datasetIndex = this.index;
    }
    tooltipContext.active = !!_isActive;
    tooltipContext.mode = tooltipMode;
    return tooltipContext;
  }
  resolveDatasetElementOptions(datasetElementOptions) {
    return this._resolveElementOptions(
      this.datasetElementType.id,
      datasetElementOptions,
    );
  }
  resolveDataElementOptions(__dataElementOptions, __elementOptions) {
    return this._resolveElementOptions(
      this.dataElementType.id,
      __elementOptions,
      __dataElementOptions,
    );
  }
  _resolveElementOptions(
    ___elementId,
    optionState = "default",
    _________elementIndex,
  ) {
    const isActiveOptionState = optionState === "active";
    const __cachedDataOptions = this._cachedDataOpts;
    const optionKey = ___elementId + "-" + optionState;
    const cachedElementOptions = __cachedDataOptions[optionKey];
    const isOptionSharingEnabled =
      this.enableOptionSharing && canvasContext(_________elementIndex);
    if (cachedElementOptions) {
      return isRequestActive(cachedElementOptions, isOptionSharingEnabled);
    }
    const ____________chartConfig = this.chart.config;
    const datasetElementScopeKeys =
      ____________chartConfig.datasetElementScopeKeys(this._type, ___elementId);
    const optionHoverData = isActiveOptionState
      ? [`${___elementId}Hover`, "hover", ___elementId, ""]
      : [___elementId, ""];
    const __optionScopes = ____________chartConfig.getOptionScopes(
      this.getDataset(),
      datasetElementScopeKeys,
    );
    const _animationDurationKeys = Object.keys(
      animationDuration.elements[___elementId],
    );
    const resolvedOptions = ____________chartConfig.resolveNamedOptions(
      __optionScopes,
      _animationDurationKeys,
      () =>
        this.getContext(
          _________elementIndex,
          isActiveOptionState,
          optionState,
        ),
      optionHoverData,
    );
    if (resolvedOptions.$shared) {
      resolvedOptions.$shared = isOptionSharingEnabled;
      __cachedDataOptions[optionKey] = Object.freeze(
        isRequestActive(resolvedOptions, isOptionSharingEnabled),
      );
    }
    return resolvedOptions;
  }
  _resolveAnimations(
    ______animationContext,
    ___animationKey,
    _______animationContext,
  ) {
    const ___________________________chartInstance = this.chart;
    const _cachedDataOptions = this._cachedDataOpts;
    const _animationOptionKey = `animation-${___animationKey}`;
    const ____________animationOptions =
      _cachedDataOptions[_animationOptionKey];
    if (____________animationOptions) {
      return ____________animationOptions;
    }
    let ___animationResolver;
    if (___________________________chartInstance.options.animation !== false) {
      const ____chartInstance = this.chart.config;
      const cachedDataOptions = ____chartInstance.datasetAnimationScopeKeys(
        this._type,
        ___animationKey,
      );
      const animationOptionKey = ____chartInstance.getOptionScopes(
        this.getDataset(),
        cachedDataOptions,
      );
      ___animationResolver = ____chartInstance.createResolver(
        animationOptionKey,
        this.getContext(
          ______animationContext,
          _______animationContext,
          ___animationKey,
        ),
      );
    }
    const ____animationResolver = new ____AnimationController(
      ___________________________chartInstance,
      ___animationResolver && ___animationResolver.animations,
    );
    if (___animationResolver && ___animationResolver._cacheable) {
      _cachedDataOptions[_animationOptionKey] = Object.freeze(
        ____animationResolver,
      );
    }
    return ____animationResolver;
  }
  getSharedOptions(sharedOptions) {
    if (sharedOptions.$shared) {
      return (this._sharedOptions ||= Object.assign({}, sharedOptions));
    }
  }
  includeOptions(optionParameter, ______options) {
    return (
      !______options ||
      isResetOrNone(optionParameter) ||
      this.chart._animationsDisabled
    );
  }
  _getSharedOptions(_______dataElement, _______________options) {
    const resolvedDataOptions = this.resolveDataElementOptions(
      _______dataElement,
      _______________options,
    );
    const defaultSharedOptions = this._sharedOptions;
    const resolvedSharedOptions = this.getSharedOptions(resolvedDataOptions);
    const areOptionsIncluded =
      this.includeOptions(_______________options, resolvedSharedOptions) ||
      resolvedSharedOptions !== defaultSharedOptions;
    this.updateSharedOptions(
      resolvedSharedOptions,
      _______________options,
      resolvedDataOptions,
    );
    return {
      sharedOptions: resolvedSharedOptions,
      includeOptions: areOptionsIncluded,
    };
  }
  updateElement(
    _elementToUpdate,
    elementAnimations,
    elementUpdates,
    ______animationState,
  ) {
    if (isResetOrNone(______animationState)) {
      Object.assign(_elementToUpdate, elementUpdates);
    } else {
      this._resolveAnimations(elementAnimations, ______animationState).update(
        _elementToUpdate,
        elementUpdates,
      );
    }
  }
  updateSharedOptions(
    _sharedOptions,
    _________options,
    ________animationIndex,
  ) {
    if (_sharedOptions && !isResetOrNone(_________options)) {
      this._resolveAnimations(undefined, _________options).update(
        _sharedOptions,
        ________animationIndex,
      );
    }
  }
  _setStyle(
    styleObject,
    _elementStyle,
    _________animationIndex,
    isStyleActive,
  ) {
    styleObject.active = isStyleActive;
    const computedStyle = this.getStyle(_elementStyle, isStyleActive);
    this._resolveAnimations(
      _elementStyle,
      _________animationIndex,
      isStyleActive,
    ).update(styleObject, {
      options:
        (!isStyleActive && this.getSharedOptions(computedStyle)) ||
        computedStyle,
    });
  }
  removeHoverStyle(__hoverElement, ___hoverElement, activeIndex) {
    this._setStyle(__hoverElement, activeIndex, "active", false);
  }
  setHoverStyle(hoverElement, _hoverElement, hoverIndex) {
    this._setStyle(hoverElement, hoverIndex, "active", true);
  }
  _removeDatasetHoverStyle() {
    const cachedDataset = this._cachedMeta.dataset;
    if (cachedDataset) {
      this._setStyle(cachedDataset, undefined, "active", false);
    }
  }
  _setDatasetHoverStyle() {
    const ____________datasetMeta = this._cachedMeta.dataset;
    if (____________datasetMeta) {
      this._setStyle(____________datasetMeta, undefined, "active", true);
    }
  }
  _resyncElements(_referenceElement) {
    const dataCollection = this._data;
    const _____cachedMetaData = this._cachedMeta.data;
    for (const [syncItemKey, ___________event, callbackArgument] of this
      ._syncList) {
      this[syncItemKey](___________event, callbackArgument);
    }
    this._syncList = [];
    const cachedMetaDataLength = _____cachedMetaData.length;
    const dataCollectionLength = dataCollection.length;
    const minElementCount = Math.min(
      dataCollectionLength,
      cachedMetaDataLength,
    );
    if (minElementCount) {
      this.parse(0, minElementCount);
    }
    if (dataCollectionLength > cachedMetaDataLength) {
      this._insertElements(
        cachedMetaDataLength,
        dataCollectionLength - cachedMetaDataLength,
        _referenceElement,
      );
    } else if (dataCollectionLength < cachedMetaDataLength) {
      this._removeElements(
        dataCollectionLength,
        cachedMetaDataLength - dataCollectionLength,
      );
    }
  }
  _insertElements(
    startingIndex,
    numberOfElementsToInsert,
    shouldUpdateElements = true,
  ) {
    const __________________cachedMeta = this._cachedMeta;
    const _cachedDataArray = __________________cachedMeta.data;
    const ________endIndex = startingIndex + numberOfElementsToInsert;
    let ____________________________________________index;
    const shiftElementsToRight = (tempArray) => {
      tempArray.length += numberOfElementsToInsert;
      ____________________________________________index = tempArray.length - 1;
      for (
        ;
        ____________________________________________index >= ________endIndex;
        ____________________________________________index--
      ) {
        tempArray[____________________________________________index] =
          tempArray[
            ____________________________________________index -
              numberOfElementsToInsert
          ];
      }
    };
    shiftElementsToRight(_cachedDataArray);
    ____________________________________________index = startingIndex;
    for (
      ;
      ____________________________________________index < ________endIndex;
      ++____________________________________________index
    ) {
      _cachedDataArray[____________________________________________index] =
        new this.dataElementType();
    }
    if (this._parsing) {
      shiftElementsToRight(__________________cachedMeta._parsed);
    }
    this.parse(startingIndex, numberOfElementsToInsert);
    if (shouldUpdateElements) {
      this.updateElements(
        _cachedDataArray,
        startingIndex,
        numberOfElementsToInsert,
        "reset",
      );
    }
  }
  updateElements(
    __time,
    elementToUpdate,
    ________________________________________________________index,
    elementStatus,
  ) {}
  _removeElements(_______startIndex, _elementsToRemove) {
    const ___cachedMetadata = this._cachedMeta;
    if (this._parsing) {
      const parsedElements = ___cachedMetadata._parsed.splice(
        _______startIndex,
        _elementsToRemove,
      );
      if (___cachedMetadata._stacked) {
        removeStackedValues(___cachedMetadata, parsedElements);
      }
    }
    ___cachedMetadata.data.splice(_______startIndex, _elementsToRemove);
  }
  _sync(_____eventData) {
    if (this._parsing) {
      this._syncList.push(_____eventData);
    } else {
      const [eventName, parsedItemIndex, dataField] = _____eventData;
      this[eventName](parsedItemIndex, dataField);
    }
    this.chart._dataChanges.push([this.index, ..._____eventData]);
  }
  _onDataPush() {
    const dataPushCount = arguments.length;
    this._sync([
      "_insertElements",
      this.getDataset().data.length - dataPushCount,
      dataPushCount,
    ]);
  }
  _onDataPop() {
    this._sync(["_removeElements", this._cachedMeta.data.length - 1, 1]);
  }
  _onDataShift() {
    this._sync(["_removeElements", 0, 1]);
  }
  _onDataSplice(dataSlice, ____eventData) {
    if (____eventData) {
      this._sync(["_removeElements", dataSlice, ____eventData]);
    }
    const argumentCount = arguments.length - 2;
    if (argumentCount) {
      this._sync(["_insertElements", dataSlice, argumentCount]);
    }
  }
  _onDataUnshift() {
    this._sync(["_insertElements", 0, arguments.length]);
  }
}
function getCachedBarChartData(_________chartInstance, metricKey) {
  if (!_________chartInstance._cache.$bar) {
    const _matchingVisibleMetas =
      _________chartInstance.getMatchingVisibleMetas(metricKey);
    let parsedChartData = [];
    for (
      let __________________________________index = 0,
        inputArrayLength = _matchingVisibleMetas.length;
      __________________________________index < inputArrayLength;
      __________________________________index++
    ) {
      parsedChartData = parsedChartData.concat(
        _matchingVisibleMetas[
          __________________________________index
        ].controller.getAllParsedValues(_________chartInstance),
      );
    }
    _________chartInstance._cache.$bar = adapterFunctions(
      parsedChartData.sort(
        (_difference, valueToSubtract) => _difference - valueToSubtract,
      ),
    );
  }
  return _________chartInstance._cache.$bar;
}
function calculateMinDistance(_chartOptions) {
  const iScaleOptions = _chartOptions.iScale;
  const cachedBarChartData = getCachedBarChartData(
    iScaleOptions,
    _chartOptions.type,
  );
  let distanceIndex;
  let barChartDataCount;
  let pixelValue;
  let previousCanvasCoordinate;
  let minimumDistance = iScaleOptions._length;
  const updateMinimumDistance = () => {
    if (pixelValue !== 32767 && pixelValue !== -32768) {
      if (canvasContext(previousCanvasCoordinate)) {
        minimumDistance = Math.min(
          minimumDistance,
          Math.abs(pixelValue - previousCanvasCoordinate) || minimumDistance,
        );
      }
      previousCanvasCoordinate = pixelValue;
    }
  };
  distanceIndex = 0;
  barChartDataCount = cachedBarChartData.length;
  for (; distanceIndex < barChartDataCount; ++distanceIndex) {
    pixelValue = iScaleOptions.getPixelForValue(
      cachedBarChartData[distanceIndex],
    );
    updateMinimumDistance();
  }
  previousCanvasCoordinate = undefined;
  distanceIndex = 0;
  barChartDataCount = iScaleOptions.ticks.length;
  for (; distanceIndex < barChartDataCount; ++distanceIndex) {
    pixelValue = iScaleOptions.getPixelForTick(distanceIndex);
    updateMinimumDistance();
  }
  return minimumDistance;
}
function calculateBarDimensions(
  pixelIndex,
  minValue,
  ___chartOptions,
  scalingFactor,
) {
  const barThickness = ___chartOptions.barThickness;
  let barDimension;
  let barPercentage;
  if (chartUpdateInterval(barThickness)) {
    barDimension = minValue.min * ___chartOptions.categoryPercentage;
    barPercentage = ___chartOptions.barPercentage;
  } else {
    barDimension = barThickness * scalingFactor;
    barPercentage = 1;
  }
  return {
    chunk: barDimension / scalingFactor,
    ratio: barPercentage,
    start: minValue.pixels[pixelIndex] - barDimension / 2,
  };
}
function calculatePixelAdjustment(
  currentPixelIndex,
  imageData,
  categoryInfo,
  pixelCount,
) {
  const pixelArray = imageData.pixels;
  const currentPixelValue = pixelArray[currentPixelIndex];
  let previousPixelValue =
    currentPixelIndex > 0 ? pixelArray[currentPixelIndex - 1] : null;
  let nextPixelValue =
    currentPixelIndex < pixelArray.length - 1
      ? pixelArray[currentPixelIndex + 1]
      : null;
  const categoryPercentage = categoryInfo.categoryPercentage;
  if (previousPixelValue === null) {
    previousPixelValue =
      currentPixelValue -
      (nextPixelValue === null
        ? imageData.end - imageData.start
        : nextPixelValue - currentPixelValue);
  }
  if (nextPixelValue === null) {
    nextPixelValue = currentPixelValue + currentPixelValue - previousPixelValue;
  }
  const adjustedPixelPosition =
    currentPixelValue -
    ((currentPixelValue - Math.min(previousPixelValue, nextPixelValue)) / 2) *
      categoryPercentage;
  return {
    chunk:
      ((Math.abs(nextPixelValue - previousPixelValue) / 2) *
        categoryPercentage) /
      pixelCount,
    ratio: categoryInfo.barPercentage,
    start: adjustedPixelPosition,
  };
}
function updateChartBounds(___dataPoints, _customData, parser, parseOptions) {
  const firstDataPoint = parser.parse(___dataPoints[0], parseOptions);
  const secondDataPointValue = parser.parse(___dataPoints[1], parseOptions);
  const minDataPointValue = Math.min(firstDataPoint, secondDataPointValue);
  const maxDataPointValue = Math.max(firstDataPoint, secondDataPointValue);
  let barStartValue = minDataPointValue;
  let _lowerBound = maxDataPointValue;
  if (Math.abs(minDataPointValue) > Math.abs(maxDataPointValue)) {
    barStartValue = maxDataPointValue;
    _lowerBound = minDataPointValue;
  }
  _customData[parser.axis] = _lowerBound;
  _customData._custom = {
    barStart: barStartValue,
    barEnd: _lowerBound,
    start: firstDataPoint,
    end: secondDataPointValue,
    min: minDataPointValue,
    max: maxDataPointValue,
  };
}
function handleChartData(
  _____________________chartData,
  ______________________chartData,
  _______________________chartData,
  _____dataPoint,
) {
  if (animatedChartItems(_____________________chartData)) {
    updateChartBounds(
      _____________________chartData,
      ______________________chartData,
      _______________________chartData,
      _____dataPoint,
    );
  } else {
    ______________________chartData[_______________________chartData.axis] =
      _______________________chartData.parse(
        _____________________chartData,
        _____dataPoint,
      );
  }
  return ______________________chartData;
}
function _processChartData(
  ____inputData,
  _dataArray,
  _____startIndex,
  _endIndex,
) {
  const inputScale = ____inputData.iScale;
  const valueScale = ____inputData.vScale;
  const labelArray = inputScale.getLabels();
  const isInputScaleEqualToOutputScale = inputScale === valueScale;
  const processedChartData = [];
  let ___________________________________________________currentIndex;
  let endProcessingIndex;
  let chartDataObject;
  let currentDataItem;
  ___________________________________________________currentIndex =
    _____startIndex;
  endProcessingIndex = _____startIndex + _endIndex;
  for (
    ;
    ___________________________________________________currentIndex <
    endProcessingIndex;
    ++___________________________________________________currentIndex
  ) {
    currentDataItem =
      _dataArray[
        ___________________________________________________currentIndex
      ];
    chartDataObject = {};
    chartDataObject[inputScale.axis] =
      isInputScaleEqualToOutputScale ||
      inputScale.parse(
        labelArray[
          ___________________________________________________currentIndex
        ],
        ___________________________________________________currentIndex,
      );
    processedChartData.push(
      handleChartData(
        currentDataItem,
        chartDataObject,
        valueScale,
        ___________________________________________________currentIndex,
      ),
    );
  }
  return processedChartData;
}
function isBarRangeDefined(timeRange) {
  return (
    timeRange &&
    timeRange.barStart !== undefined &&
    timeRange.barEnd !== undefined
  );
}
function evaluatePathClosure(pathValue, pathCoordinate, _referencePoint) {
  if (pathValue !== 0) {
    return isPathClosed(pathValue);
  } else {
    return (
      (pathCoordinate.isHorizontal() ? 1 : -1) *
      (pathCoordinate.min >= _referencePoint ? 1 : -1)
    );
  }
}
function determineCoordinateOrientation(coordinateSettings) {
  let isBaseGreater;
  let orientationStart;
  let oppositeDirection;
  let topCoordinateOrientation;
  let _startPosition;
  if (coordinateSettings.horizontal) {
    isBaseGreater = coordinateSettings.base > coordinateSettings.x;
    orientationStart = "left";
    oppositeDirection = "right";
  } else {
    isBaseGreater = coordinateSettings.base < coordinateSettings.y;
    orientationStart = "bottom";
    oppositeDirection = "top";
  }
  if (isBaseGreater) {
    topCoordinateOrientation = "end";
    _startPosition = "start";
  } else {
    topCoordinateOrientation = "start";
    _startPosition = "end";
  }
  return {
    start: orientationStart,
    end: oppositeDirection,
    reverse: isBaseGreater,
    top: topCoordinateOrientation,
    bottom: _startPosition,
  };
}
function setChartBorderSkipped(
  chartElement,
  borderSkipOption,
  borderRadiusCondition,
  borderSkippedPosition,
) {
  let borderSkipValue = borderSkipOption.borderSkipped;
  const borderSkipMap = {};
  if (!borderSkipValue) {
    chartElement.borderSkipped = borderSkipMap;
    return;
  }
  if (borderSkipValue === true) {
    chartElement.borderSkipped = {
      top: true,
      right: true,
      bottom: true,
      left: true,
    };
    return;
  }
  const {
    start: _startCoordinate,
    end: __endCoordinate,
    reverse: _isReversed,
    top: topBorderCoordinate,
    bottom: bottomBorderSkipped,
  } = determineCoordinateOrientation(chartElement);
  if (borderSkipValue === "middle" && borderRadiusCondition) {
    chartElement.enableBorderRadius = true;
    if ((borderRadiusCondition._top || 0) === borderSkippedPosition) {
      borderSkipValue = topBorderCoordinate;
    } else if ((borderRadiusCondition._bottom || 0) === borderSkippedPosition) {
      borderSkipValue = bottomBorderSkipped;
    } else {
      borderSkipMap[
        calculateTaskState(
          bottomBorderSkipped,
          _startCoordinate,
          __endCoordinate,
          _isReversed,
        )
      ] = true;
      borderSkipValue = topBorderCoordinate;
    }
  }
  borderSkipMap[
    calculateTaskState(
      borderSkipValue,
      _startCoordinate,
      __endCoordinate,
      _isReversed,
    )
  ] = true;
  chartElement.borderSkipped = borderSkipMap;
}
function calculateTaskState(
  taskState,
  ___comparisonValue,
  ____comparisonValue,
  isTaskActive,
) {
  return (taskState = isTaskActive
    ? getTaskState(
        (taskState = returnValueBasedOnComparison(
          taskState,
          ___comparisonValue,
          ____comparisonValue,
        )),
        ____comparisonValue,
        ___comparisonValue,
      )
    : getTaskState(taskState, ___comparisonValue, ____comparisonValue));
}
function returnValueBasedOnComparison(
  firstValue,
  comparisonValue,
  _comparisonValue,
) {
  if (firstValue === comparisonValue) {
    return _comparisonValue;
  } else if (firstValue === _comparisonValue) {
    return comparisonValue;
  } else {
    return firstValue;
  }
}
function getTaskState(actionType, eventParameter, ____endValue) {
  if (actionType === "start") {
    return eventParameter;
  } else if (actionType === "end") {
    return ____endValue;
  } else {
    return actionType;
  }
}
function inflateAmountHandler(
  _inflateAmount,
  { inflateAmount: inflateAmountValue },
  inflateFactor,
) {
  _inflateAmount.inflateAmount =
    inflateAmountValue === "auto"
      ? inflateFactor === 1
        ? 0.33
        : 0
      : inflateAmountValue;
}
class BarChart extends ChartElement {
  static id = "bar";
  static defaults = {
    datasetElementType: false,
    dataElementType: "bar",
    categoryPercentage: 0.8,
    barPercentage: 0.9,
    grouped: true,
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "base", "width", "height"],
      },
    },
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category",
        offset: true,
        grid: {
          offset: true,
        },
      },
      _value_: {
        type: "linear",
        beginAtZero: true,
      },
    },
  };
  parsePrimitiveData(
    primitiveData,
    _____dataElement,
    _________________dataIndex,
    dataSource,
  ) {
    return _processChartData(
      primitiveData,
      _____dataElement,
      _________________dataIndex,
      dataSource,
    );
  }
  parseArrayData(
    arrayData,
    errorData,
    _______________dataIndex,
    _____________________________chartData,
  ) {
    return _processChartData(
      arrayData,
      errorData,
      _______________dataIndex,
      _____________________________chartData,
    );
  }
  parseObjectData(
    _parsedObjectData,
    __________parsedData,
    ___________startIndex,
    endIndexOffset,
  ) {
    const { iScale: __inputScale, vScale: _____valueScale } = _parsedObjectData;
    const { xAxisKey: _xAxisKey = "x", yAxisKey: _yAxisKey = "y" } =
      this._parsing;
    const selectedAxisKey = __inputScale.axis === "x" ? _xAxisKey : _yAxisKey;
    const _valueScaleAxis =
      _____valueScale.axis === "x" ? _xAxisKey : _yAxisKey;
    const _parsedChartData = [];
    let _____________________________index;
    let endIndexPosition;
    let parsedPointData;
    let _parsedDataItem;
    _____________________________index = ___________startIndex;
    endIndexPosition = ___________startIndex + endIndexOffset;
    for (
      ;
      _____________________________index < endIndexPosition;
      ++_____________________________index
    ) {
      _parsedDataItem =
        __________parsedData[_____________________________index];
      parsedPointData = {};
      parsedPointData[__inputScale.axis] = __inputScale.parse(
        _requestAnimationFrameId(_parsedDataItem, selectedAxisKey),
        _____________________________index,
      );
      _parsedChartData.push(
        handleChartData(
          _requestAnimationFrameId(_parsedDataItem, _valueScaleAxis),
          parsedPointData,
          _____valueScale,
          _____________________________index,
        ),
      );
    }
    return _parsedChartData;
  }
  updateRangeFromParsed(rangeToUpdate, vScale, parsedRange, scale) {
    super.updateRangeFromParsed(rangeToUpdate, vScale, parsedRange, scale);
    const customRangeValues = parsedRange._custom;
    if (customRangeValues && vScale === this._cachedMeta.vScale) {
      rangeToUpdate.min = Math.min(rangeToUpdate.min, customRangeValues.min);
      rangeToUpdate.max = Math.max(rangeToUpdate.max, customRangeValues.max);
    }
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(________parsedData) {
    const __________cachedMeta = this._cachedMeta;
    const { iScale: ___iScale, vScale: ___valueScale } = __________cachedMeta;
    const parsedDataItem = this.getParsed(________parsedData);
    const __customData = parsedDataItem._custom;
    const __formattedValue = isBarRangeDefined(__customData)
      ? "[" + __customData.start + ", " + __customData.end + "]"
      : "" + ___valueScale.getLabelForValue(parsedDataItem[___valueScale.axis]);
    return {
      label: "" + ___iScale.getLabelForValue(parsedDataItem[___iScale.axis]),
      value: __formattedValue,
    };
  }
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
    this._cachedMeta.stack = this.getDataset().stack;
  }
  update(_timestamp) {
    const _cachedMetadata = this._cachedMeta;
    this.updateElements(
      _cachedMetadata.data,
      0,
      _cachedMetadata.data.length,
      _timestamp,
    );
  }
  updateElements(
    ________________dataset,
    _______________startIndex,
    numElementsToUpdate,
    ____updateType,
  ) {
    const _isResetState = ____updateType === "reset";
    const {
      index: currentStackIndex,
      _cachedMeta: { vScale: dataSetMeta },
    } = this;
    const __basePixelValue = dataSetMeta.getBasePixel();
    const __isHorizontal = dataSetMeta.isHorizontal();
    const ruler = this._getRuler();
    const {
      sharedOptions: ____sharedOptions,
      includeOptions: _includeOptions,
    } = this._getSharedOptions(_______________startIndex, ____updateType);
    for (
      let _currentIndex = _______________startIndex;
      _currentIndex < _______________startIndex + numElementsToUpdate;
      _currentIndex++
    ) {
      const ___currentIndex = this.getParsed(_currentIndex);
      const chartUpdateDuration =
        _isResetState || chartUpdateInterval(___currentIndex[dataSetMeta.axis])
          ? {
              base: __basePixelValue,
              head: __basePixelValue,
            }
          : this._calculateBarValuePixels(_currentIndex);
      const barIndexPixels = this._calculateBarIndexPixels(
        _currentIndex,
        ruler,
      );
      const stacksForCurrentAxis = (___currentIndex._stacks || {})[
        dataSetMeta.axis
      ];
      const barElementProperties = {
        horizontal: __isHorizontal,
        base: chartUpdateDuration.base,
        enableBorderRadius:
          !stacksForCurrentAxis ||
          isBarRangeDefined(___currentIndex._custom) ||
          currentStackIndex === stacksForCurrentAxis._top ||
          currentStackIndex === stacksForCurrentAxis._bottom,
        x: __isHorizontal ? chartUpdateDuration.head : barIndexPixels.center,
        y: __isHorizontal ? barIndexPixels.center : chartUpdateDuration.head,
        height: __isHorizontal
          ? barIndexPixels.size
          : Math.abs(chartUpdateDuration.size),
        width: __isHorizontal
          ? Math.abs(chartUpdateDuration.size)
          : barIndexPixels.size,
      };
      if (_includeOptions) {
        barElementProperties.options =
          ____sharedOptions ||
          this.resolveDataElementOptions(
            _currentIndex,
            ________________dataset[_currentIndex].active
              ? "active"
              : ____updateType,
          );
      }
      const elementOptions =
        barElementProperties.options ||
        ________________dataset[_currentIndex].options;
      setChartBorderSkipped(
        barElementProperties,
        elementOptions,
        stacksForCurrentAxis,
        currentStackIndex,
      );
      inflateAmountHandler(barElementProperties, elementOptions, ruler.ratio);
      this.updateElement(
        ________________dataset[_currentIndex],
        _currentIndex,
        barElementProperties,
        ____updateType,
      );
    }
  }
  _getStacks(_targetIndex, parsedDataPointValue) {
    const { iScale: metaIndexScale } = this._cachedMeta;
    const visibleMetaGroups = metaIndexScale
      .getMatchingVisibleMetas(this._type)
      .filter((groupedOptions) => groupedOptions.controller.options.grouped);
    const _isStacked = metaIndexScale.options.stacked;
    const stackedItemList = [];
    const shouldSkipParsedValue = (______dataPoint) => {
      const parsedControllerValue =
        ______dataPoint.controller.getParsed(parsedDataPointValue);
      const __parsedValue =
        parsedControllerValue &&
        parsedControllerValue[______dataPoint.vScale.axis];
      if (chartUpdateInterval(__parsedValue) || isNaN(__parsedValue)) {
        return true;
      }
    };
    for (const __currentItem of visibleMetaGroups) {
      if (
        (parsedDataPointValue === undefined ||
          !shouldSkipParsedValue(__currentItem)) &&
        ((_isStacked === false ||
          stackedItemList.indexOf(__currentItem.stack) === -1 ||
          (_isStacked === undefined && __currentItem.stack === undefined)) &&
          stackedItemList.push(__currentItem.stack),
        __currentItem.index === _targetIndex)
      ) {
        break;
      }
    }
    if (!stackedItemList.length) {
      stackedItemList.push(undefined);
    }
    return stackedItemList;
  }
  _getStackCount(_stackIdentifier) {
    return this._getStacks(undefined, _stackIdentifier).length;
  }
  _getStackIndex(__stackIdentifier, _elementToFind, _stackIndex) {
    const stackArray = this._getStacks(__stackIdentifier, _stackIndex);
    const _______elementIndex =
      _elementToFind !== undefined ? stackArray.indexOf(_elementToFind) : -1;
    if (_______elementIndex === -1) {
      return stackArray.length - 1;
    } else {
      return _______elementIndex;
    }
  }
  _getRuler() {
    const ______optionsConfig = this.options;
    const ___________________cachedMeta = this._cachedMeta;
    const _____iScale = ___________________cachedMeta.iScale;
    const pixelValues = [];
    let parsedDataIndex;
    let _dataLength;
    parsedDataIndex = 0;
    _dataLength = ___________________cachedMeta.data.length;
    for (; parsedDataIndex < _dataLength; ++parsedDataIndex) {
      pixelValues.push(
        _____iScale.getPixelForValue(
          this.getParsed(parsedDataIndex)[_____iScale.axis],
          parsedDataIndex,
        ),
      );
    }
    const _barThickness = ______optionsConfig.barThickness;
    return {
      min: _barThickness || calculateMinDistance(___________________cachedMeta),
      pixels: pixelValues,
      start: _____iScale._startPixel,
      end: _____iScale._endPixel,
      stackCount: this._getStackCount(),
      scale: _____iScale,
      grouped: ______optionsConfig.grouped,
      ratio: _barThickness
        ? 1
        : ______optionsConfig.categoryPercentage *
          ______optionsConfig.barPercentage,
    };
  }
  _calculateBarValuePixels(__________dataPointIndex) {
    const {
      _cachedMeta: {
        vScale: _verticalScale,
        _stacked: ____isStacked,
        index: ___________dataPointIndex,
      },
      options: { base: _barBaseValue, minBarLength: minBarLength },
    } = this;
    const __baseValue = _barBaseValue || 0;
    const ___parsedDataPoint = this.getParsed(__________dataPointIndex);
    const customDataPoint = ___parsedDataPoint._custom;
    const barValueInPixels = isBarRangeDefined(customDataPoint);
    let barEndPixel;
    let barSize;
    let _parsedDataPointValue = ___parsedDataPoint[_verticalScale.axis];
    let pixelOffset = 0;
    let _currentStackValue = ____isStacked
      ? this.applyStack(_verticalScale, ___parsedDataPoint, ____isStacked)
      : _parsedDataPointValue;
    if (_currentStackValue !== _parsedDataPointValue) {
      pixelOffset = _currentStackValue - _parsedDataPointValue;
      _currentStackValue = _parsedDataPointValue;
    }
    if (barValueInPixels) {
      _parsedDataPointValue = customDataPoint.barStart;
      _currentStackValue = customDataPoint.barEnd - customDataPoint.barStart;
      if (
        _parsedDataPointValue !== 0 &&
        isPathClosed(_parsedDataPointValue) !==
          isPathClosed(customDataPoint.barEnd)
      ) {
        pixelOffset = 0;
      }
      pixelOffset += _parsedDataPointValue;
    }
    const computedBarPosition =
      chartUpdateInterval(_barBaseValue) || barValueInPixels
        ? pixelOffset
        : _barBaseValue;
    let barBasePixel = _verticalScale.getPixelForValue(computedBarPosition);
    if (this.chart.getDataVisibility(__________dataPointIndex)) {
      barEndPixel = _verticalScale.getPixelForValue(
        pixelOffset + _currentStackValue,
      );
    } else {
      barEndPixel = barBasePixel;
    }
    barSize = barEndPixel - barBasePixel;
    if (Math.abs(barSize) < minBarLength) {
      barSize =
        evaluatePathClosure(barSize, _verticalScale, __baseValue) *
        minBarLength;
      if (_parsedDataPointValue === __baseValue) {
        barBasePixel -= barSize / 2;
      }
      const dataPointIndex = _verticalScale.getPixelForDecimal(0);
      const barBaseValue = _verticalScale.getPixelForDecimal(1);
      const customData = Math.min(dataPointIndex, barBaseValue);
      const isValueEqual = Math.max(dataPointIndex, barBaseValue);
      barBasePixel = Math.max(Math.min(barBasePixel, isValueEqual), customData);
      barEndPixel = barBasePixel + barSize;
      if (____isStacked && !barValueInPixels) {
        ___parsedDataPoint._stacks[_verticalScale.axis]._visualValues[
          ___________dataPointIndex
        ] =
          _verticalScale.getValueForPixel(barEndPixel) -
          _verticalScale.getValueForPixel(barBasePixel);
      }
    }
    if (barBasePixel === _verticalScale.getPixelForValue(__baseValue)) {
      const _dataPointIndex =
        (isPathClosed(barSize) *
          _verticalScale.getLineWidthForValue(__baseValue)) /
        2;
      barBasePixel += _dataPointIndex;
      barSize -= _dataPointIndex;
    }
    return {
      size: barSize,
      base: barBasePixel,
      head: barEndPixel,
      center: barEndPixel + barSize / 2,
    };
  }
  _calculateBarIndexPixels(________dataPointIndex, chartEvent) {
    const ______scaleFactor = chartEvent.scale;
    const _________________________options = this.options;
    const shouldSkipNull = _________________________options.skipNull;
    const ____isChartAnimationRunning = chartAnimationRunning(
      _________________________options.maxBarThickness,
      Infinity,
    );
    let barCenterPixel;
    let barHeight;
    if (chartEvent.grouped) {
      const scaleValue = shouldSkipNull
        ? this._getStackCount(________dataPointIndex)
        : chartEvent.stackCount;
      const barThicknessCalculation =
        _________________________options.barThickness === "flex"
          ? calculatePixelAdjustment(
              ________dataPointIndex,
              chartEvent,
              _________________________options,
              scaleValue,
            )
          : calculateBarDimensions(
              ________dataPointIndex,
              chartEvent,
              _________________________options,
              scaleValue,
            );
      const stackIndex = this._getStackIndex(
        this.index,
        this._cachedMeta.stack,
        shouldSkipNull ? ________dataPointIndex : undefined,
      );
      barCenterPixel =
        barThicknessCalculation.start +
        barThicknessCalculation.chunk * stackIndex +
        barThicknessCalculation.chunk / 2;
      barHeight = Math.min(
        ____isChartAnimationRunning,
        barThicknessCalculation.chunk * barThicknessCalculation.ratio,
      );
    } else {
      barCenterPixel = ______scaleFactor.getPixelForValue(
        this.getParsed(________dataPointIndex)[______scaleFactor.axis],
        ________dataPointIndex,
      );
      barHeight = Math.min(
        ____isChartAnimationRunning,
        chartEvent.min * chartEvent.ratio,
      );
    }
    return {
      base: barCenterPixel - barHeight / 2,
      head: barCenterPixel + barHeight / 2,
      center: barCenterPixel,
      size: barHeight,
    };
  }
  draw() {
    const ________cachedMeta = this._cachedMeta;
    const _valueScale = ________cachedMeta.vScale;
    const ____dataPoints = ________cachedMeta.data;
    const dataPointsCount = ____dataPoints.length;
    let _________________________currentIndex = 0;
    for (
      ;
      _________________________currentIndex < dataPointsCount;
      ++_________________________currentIndex
    ) {
      if (
        this.getParsed(_________________________currentIndex)[
          _valueScale.axis
        ] !== null
      ) {
        ____dataPoints[_________________________currentIndex].draw(this._ctx);
      }
    }
  }
}
class BubbleChartElement extends ChartElement {
  static id = "bubble";
  static defaults = {
    datasetElementType: false,
    dataElementType: "point",
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "borderWidth", "radius"],
      },
    },
  };
  static overrides = {
    scales: {
      x: {
        type: "linear",
      },
      y: {
        type: "linear",
      },
    },
  };
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }
  parsePrimitiveData(
    ____elementIndex,
    ______dataElement,
    elementOffset,
    ____dataElementOptions,
  ) {
    const parsedDataElements = super.parsePrimitiveData(
      ____elementIndex,
      ______dataElement,
      elementOffset,
      ____dataElementOptions,
    );
    for (
      let _________________________________index = 0;
      _________________________________index < parsedDataElements.length;
      _________________________________index++
    ) {
      parsedDataElements[_________________________________index]._custom =
        this.resolveDataElementOptions(
          _________________________________index + elementOffset,
        ).radius;
    }
    return parsedDataElements;
  }
  parseArrayData(
    ________________________index,
    _dataElementArray,
    currentElementIndex,
    _dataSlice,
  ) {
    const _parsedDataArray = super.parseArrayData(
      ________________________index,
      _dataElementArray,
      currentElementIndex,
      _dataSlice,
    );
    for (
      let _______________________index = 0;
      _______________________index < _parsedDataArray.length;
      _______________________index++
    ) {
      const ___dataElement =
        _dataElementArray[currentElementIndex + _______________________index];
      _parsedDataArray[_______________________index]._custom =
        chartAnimationRunning(
          ___dataElement[2],
          this.resolveDataElementOptions(
            _______________________index + currentElementIndex,
          ).radius,
        );
    }
    return _parsedDataArray;
  }
  parseObjectData(
    ______________________index,
    __dataElementArray,
    _____dataElementIndex,
    sourceData,
  ) {
    const parsedObjectData = super.parseObjectData(
      ______________________index,
      __dataElementArray,
      _____dataElementIndex,
      sourceData,
    );
    for (
      let _____________________index = 0;
      _____________________index < parsedObjectData.length;
      _____________________index++
    ) {
      const __dataElement =
        __dataElementArray[_____dataElementIndex + _____________________index];
      parsedObjectData[_____________________index]._custom =
        chartAnimationRunning(
          __dataElement && __dataElement.r && +__dataElement.r,
          this.resolveDataElementOptions(
            _____________________index + _____dataElementIndex,
          ).radius,
        );
    }
    return parsedObjectData;
  }
  getMaxOverflow() {
    const __cachedMetaData = this._cachedMeta.data;
    let maxHalfSize = 0;
    for (
      let _______________________________index = __cachedMetaData.length - 1;
      _______________________________index >= 0;
      --_______________________________index
    ) {
      maxHalfSize = Math.max(
        maxHalfSize,
        __cachedMetaData[_______________________________index].size(
          this.resolveDataElementOptions(_______________________________index),
        ) / 2,
      );
    }
    return maxHalfSize > 0 && maxHalfSize;
  }
  getLabelAndValue(_______________________dataIndex) {
    const ______________cachedMeta = this._cachedMeta;
    const dataLabels = this.chart.data.labels || [];
    const { xScale: __xScale, yScale: _yScale } = ______________cachedMeta;
    const _parsedDataPoint = this.getParsed(_______________________dataIndex);
    const _labelForXValue = __xScale.getLabelForValue(_parsedDataPoint.x);
    const yScaleLabel = _yScale.getLabelForValue(_parsedDataPoint.y);
    const customDataPointValue = _parsedDataPoint._custom;
    return {
      label: dataLabels[_______________________dataIndex] || "",
      value:
        "(" +
        _labelForXValue +
        ", " +
        yScaleLabel +
        (customDataPointValue ? ", " + customDataPointValue : "") +
        ")",
    };
  }
  update(updateDelta) {
    const _cachedMetaData = this._cachedMeta.data;
    this.updateElements(
      _cachedMetaData,
      0,
      _cachedMetaData.length,
      updateDelta,
    );
  }
  updateElements(
    currentElements,
    __________elementIndex,
    numberOfElementsToUpdate,
    __updateType,
  ) {
    const isParsing = __updateType === "reset";
    const { iScale: scaleObject, vScale: vScaleAxis } = this._cachedMeta;
    const {
      sharedOptions: __sharedOptions,
      includeOptions: includeOptionsFlag,
    } = this._getSharedOptions(__________elementIndex, __updateType);
    const scaleAxis = scaleObject.axis;
    const vScaleAxisValue = vScaleAxis.axis;
    for (
      let ______currentIndex = __________elementIndex;
      ______currentIndex < __________elementIndex + numberOfElementsToUpdate;
      ______currentIndex++
    ) {
      const _currentElement = currentElements[______currentIndex];
      const _parsedData = !isParsing && this.getParsed(______currentIndex);
      const elementData = {};
      const elementPixelValue = (elementData[scaleAxis] = isParsing
        ? scaleObject.getPixelForDecimal(0.5)
        : scaleObject.getPixelForValue(_parsedData[scaleAxis]));
      const basePixelValue = (elementData[vScaleAxisValue] = isParsing
        ? vScaleAxis.getBasePixel()
        : vScaleAxis.getPixelForValue(_parsedData[vScaleAxisValue]));
      elementData.skip = isNaN(elementPixelValue) || isNaN(basePixelValue);
      if (includeOptionsFlag) {
        elementData.options =
          __sharedOptions ||
          this.resolveDataElementOptions(
            ______currentIndex,
            _currentElement.active ? "active" : __updateType,
          );
        if (isParsing) {
          elementData.options.radius = 0;
        }
      }
      this.updateElement(
        _currentElement,
        ______currentIndex,
        elementData,
        __updateType,
      );
    }
  }
  resolveDataElementOptions(________dataElement, dataElementStatus) {
    const parsedDataElement = this.getParsed(________dataElement);
    let resolvedDataElementOptions = super.resolveDataElementOptions(
      ________dataElement,
      dataElementStatus,
    );
    if (resolvedDataElementOptions.$shared) {
      resolvedDataElementOptions = Object.assign(
        {},
        resolvedDataElementOptions,
        {
          $shared: false,
        },
      );
    }
    const initialRadius = resolvedDataElementOptions.radius;
    if (dataElementStatus !== "active") {
      resolvedDataElementOptions.radius = 0;
    }
    resolvedDataElementOptions.radius += chartAnimationRunning(
      parsedDataElement && parsedDataElement._custom,
      initialRadius,
    );
    return resolvedDataElementOptions;
  }
}
function calculateAnimationRatios(angle, elapsedTime, animationScaleFactor) {
  let ratioX = 1;
  let ratioY = 1;
  let offsetX = 0;
  let _offsetY = 0;
  if (elapsedTime < lastAnimationUpdateTimestamp) {
    const currentAngle = angle;
    const anglePlusElapsedTime = currentAngle + elapsedTime;
    const cosineValue = Math.cos(currentAngle);
    const sinAngle = Math.sin(currentAngle);
    const cosineOfNextAngle = Math.cos(anglePlusElapsedTime);
    const sinOfNextAngle = Math.sin(anglePlusElapsedTime);
    const calculateAnimationRatio = (
      _________animationDuration,
      ___elapsedTime,
      animatedItemScale,
    ) =>
      _animatedChartItems(
        _________animationDuration,
        currentAngle,
        anglePlusElapsedTime,
        true,
      )
        ? 1
        : Math.max(
            ___elapsedTime,
            ___elapsedTime * animationScaleFactor,
            animatedItemScale,
            animatedItemScale * animationScaleFactor,
          );
    const calculateMinValue = (
      _animationTime,
      ___minValue,
      currentScaleValue,
    ) =>
      _animatedChartItems(
        _animationTime,
        currentAngle,
        anglePlusElapsedTime,
        true,
      )
        ? -1
        : Math.min(
            ___minValue,
            ___minValue * animationScaleFactor,
            currentScaleValue,
            currentScaleValue * animationScaleFactor,
          );
    const animationRatio = calculateAnimationRatio(
      0,
      cosineValue,
      cosineOfNextAngle,
    );
    const _animatedValue = calculateAnimationRatio(
      currentFrameTimestamp,
      sinAngle,
      sinOfNextAngle,
    );
    const calculatedMinValue = calculateMinValue(
      notificationListener,
      cosineValue,
      cosineOfNextAngle,
    );
    const minAnimatedValue = calculateMinValue(
      notificationListener + currentFrameTimestamp,
      sinAngle,
      sinOfNextAngle,
    );
    ratioX = (animationRatio - calculatedMinValue) / 2;
    ratioY = (_animatedValue - minAnimatedValue) / 2;
    offsetX = -(animationRatio + calculatedMinValue) / 2;
    _offsetY = -(_animatedValue + minAnimatedValue) / 2;
  }
  return {
    ratioX: ratioX,
    ratioY: ratioY,
    offsetX: offsetX,
    offsetY: _offsetY,
  };
}
class DoughnutChartElement extends ChartElement {
  static id = "doughnut";
  static defaults = {
    datasetElementType: false,
    dataElementType: "arc",
    animation: {
      animateRotate: true,
      animateScale: false,
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "circumference",
          "endAngle",
          "innerRadius",
          "outerRadius",
          "startAngle",
          "x",
          "y",
          "offset",
          "borderWidth",
          "spacing",
        ],
      },
    },
    cutout: "50%",
    rotation: 0,
    circumference: 360,
    radius: "100%",
    spacing: 0,
    indexAxis: "r",
  };
  static descriptors = {
    _scriptable: (isNotSpacing) => isNotSpacing !== "spacing",
    _indexable: (cssProperty) =>
      cssProperty !== "spacing" &&
      !cssProperty.startsWith("borderDash") &&
      !cssProperty.startsWith("hoverBorderDash"),
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(____________________________________chartData) {
            const _____________________________________chartData =
              ____________________________________chartData.data;
            if (
              _____________________________________chartData.labels.length &&
              _____________________________________chartData.datasets.length
            ) {
              const {
                labels: { pointStyle: _pointStyle, color: _fontColor },
              } = ____________________________________chartData.legend.options;
              return _____________________________________chartData.labels.map(
                (textValue, ____dataIndex) => {
                  const _styleProperties =
                    ____________________________________chartData
                      .getDatasetMeta(0)
                      .controller.getStyle(____dataIndex);
                  return {
                    text: textValue,
                    fillStyle: _styleProperties.backgroundColor,
                    strokeStyle: _styleProperties.borderColor,
                    fontColor: _fontColor,
                    lineWidth: _styleProperties.borderWidth,
                    pointStyle: _pointStyle,
                    hidden:
                      !____________________________________chartData.getDataVisibility(
                        ____dataIndex,
                      ),
                    index: ____dataIndex,
                  };
                },
              );
            }
            return [];
          },
        },
        onClick(clickedItem, ___________________event, _chartController) {
          _chartController.chart.toggleDataVisibility(
            ___________________event.index,
          );
          _chartController.chart.update();
        },
      },
    },
  };
  constructor(constructorParam1, parentConstructorArg) {
    super(constructorParam1, parentConstructorArg);
    this.enableOptionSharing = true;
    this.innerRadius = undefined;
    this.outerRadius = undefined;
    this.offsetX = undefined;
    this.offsetY = undefined;
  }
  linkScales() {}
  parse(__________startIndex, dataChunkSize) {
    const _datasetData = this.getDataset().data;
    const _________________cachedMeta = this._cachedMeta;
    if (this._parsing === false) {
      _________________cachedMeta._parsed = _datasetData;
    } else {
      let ____startIndex;
      let endIndex;
      let parseDataValue = (
        ______________________________________________________index,
      ) =>
        +_datasetData[
          ______________________________________________________index
        ];
      if (currentAnimationIndex(_datasetData[__________startIndex])) {
        const { key: ___dataPointIndex = "value" } = this._parsing;
        parseDataValue = (____dataPointIndex) =>
          +_requestAnimationFrameId(
            _datasetData[____dataPointIndex],
            ___dataPointIndex,
          );
      }
      ____startIndex = __________startIndex;
      endIndex = __________startIndex + dataChunkSize;
      for (; ____startIndex < endIndex; ++____startIndex) {
        _________________cachedMeta._parsed[____startIndex] =
          parseDataValue(____startIndex);
      }
    }
  }
  _getRotation() {
    return requestAnimation(this.options.rotation - 90);
  }
  _getCircumference() {
    return requestAnimation(this.options.circumference);
  }
  _getRotationExtents() {
    let lastAnimationUpdateRotation = lastAnimationUpdateTimestamp;
    let maxRotationExtent = -lastAnimationUpdateTimestamp;
    for (
      let _______datasetIndex = 0;
      _______datasetIndex < this.chart.data.datasets.length;
      ++_______datasetIndex
    ) {
      if (
        this.chart.isDatasetVisible(_______datasetIndex) &&
        this.chart.getDatasetMeta(_______datasetIndex).type === this._type
      ) {
        const datasetController =
          this.chart.getDatasetMeta(_______datasetIndex).controller;
        const datasetRotation = datasetController._getRotation();
        const circumference = datasetController._getCircumference();
        lastAnimationUpdateRotation = Math.min(
          lastAnimationUpdateRotation,
          datasetRotation,
        );
        maxRotationExtent = Math.max(
          maxRotationExtent,
          datasetRotation + circumference,
        );
      }
    }
    return {
      rotation: lastAnimationUpdateRotation,
      circumference: maxRotationExtent - lastAnimationUpdateRotation,
    };
  }
  update(___________animationFrameId) {
    const ____________________________________chartInstance = this.chart;
    const { chartArea: __chartAreaDimensions } =
      ____________________________________chartInstance;
    const __________________________cachedMeta = this._cachedMeta;
    const __cachedData = __________________________cachedMeta.data;
    const totalPadding =
      this.getMaxBorderWidth() +
      this.getMaxOffset(__cachedData) +
      this.options.spacing;
    const maxInnerRadius = Math.max(
      (Math.min(__chartAreaDimensions.width, __chartAreaDimensions.height) -
        totalPadding) /
        2,
      0,
    );
    const cutoutRadius = Math.min(
      minifiedVar(this.options.cutout, maxInnerRadius),
      1,
    );
    const ringWeight = this._getRingWeight(this.index);
    const { circumference: _circumference, rotation: _rotationAngle } =
      this._getRotationExtents();
    const {
      ratioX: _ratioX,
      ratioY: _ratioY,
      offsetX: offsetXRatio,
      offsetY: offsetYRatio,
    } = calculateAnimationRatios(_rotationAngle, _circumference, cutoutRadius);
    const xDimension = (__chartAreaDimensions.width - totalPadding) / _ratioX;
    const heightAdjustmentFactor =
      (__chartAreaDimensions.height - totalPadding) / _ratioY;
    const calculatedRadius = Math.max(
      Math.min(xDimension, heightAdjustmentFactor) / 2,
      0,
    );
    const _calculatedRadius = __requestAnimationFrameId(
      this.options.radius,
      calculatedRadius,
    );
    const visibleDatasetWeightRatio =
      (_calculatedRadius - Math.max(_calculatedRadius * cutoutRadius, 0)) /
      this._getVisibleDatasetWeightTotal();
    this.offsetX = offsetXRatio * _calculatedRadius;
    this.offsetY = offsetYRatio * _calculatedRadius;
    __________________________cachedMeta.total = this.calculateTotal();
    this.outerRadius =
      _calculatedRadius -
      visibleDatasetWeightRatio * this._getRingWeightOffset(this.index);
    this.innerRadius = Math.max(
      this.outerRadius - visibleDatasetWeightRatio * ringWeight,
      0,
    );
    this.updateElements(
      __cachedData,
      0,
      __cachedData.length,
      ___________animationFrameId,
    );
  }
  _circumference(______________________dataIndex, isRotateAnimationEnabled) {
    const _____optionsConfig = this.options;
    const ____cachedMetaData = this._cachedMeta;
    const circumferenceValue = this._getCircumference();
    if (
      (isRotateAnimationEnabled &&
        _____optionsConfig.animation.animateRotate) ||
      !this.chart.getDataVisibility(______________________dataIndex) ||
      ____cachedMetaData._parsed[______________________dataIndex] === null ||
      ____cachedMetaData.data[______________________dataIndex].hidden
    ) {
      return 0;
    } else {
      return this.calculateCircumference(
        (____cachedMetaData._parsed[______________________dataIndex] *
          circumferenceValue) /
          lastAnimationUpdateTimestamp,
      );
    }
  }
  updateElements(
    ___elementList,
    _____elementCount,
    _numberOfElementsToUpdate,
    ___updateType,
  ) {
    const isResetUpdate = ___updateType === "reset";
    const __________________________________chartInstance = this.chart;
    const _____chartArea =
      __________________________________chartInstance.chartArea;
    const ______________animationOptions =
      __________________________________chartInstance.options.animation;
    const chartCenterX = (_____chartArea.left + _____chartArea.right) / 2;
    const chartAreaCenterY = (_____chartArea.top + _____chartArea.bottom) / 2;
    const isAnimationScaleEnabled =
      isResetUpdate && ______________animationOptions.animateScale;
    const __innerRadius = isAnimationScaleEnabled ? 0 : this.innerRadius;
    const outerRadiusAdjustment = isAnimationScaleEnabled
      ? 0
      : this.outerRadius;
    const {
      sharedOptions: sharedChartOptions,
      includeOptions: includeOptions,
    } = this._getSharedOptions(_____elementCount, ___updateType);
    let ________currentIndex;
    let currentRotation = this._getRotation();
    for (
      ________currentIndex = 0;
      ________currentIndex < _____elementCount;
      ++________currentIndex
    ) {
      currentRotation += this._circumference(
        ________currentIndex,
        isResetUpdate,
      );
    }
    for (
      ________currentIndex = _____elementCount;
      ________currentIndex < _____elementCount + _numberOfElementsToUpdate;
      ++________currentIndex
    ) {
      const currentCircumference = this._circumference(
        ________currentIndex,
        isResetUpdate,
      );
      const _________currentIndex = ___elementList[________currentIndex];
      const _elementData = {
        x: chartCenterX + this.offsetX,
        y: chartAreaCenterY + this.offsetY,
        startAngle: currentRotation,
        endAngle: currentRotation + currentCircumference,
        circumference: currentCircumference,
        outerRadius: outerRadiusAdjustment,
        innerRadius: __innerRadius,
      };
      if (includeOptions) {
        _elementData.options =
          sharedChartOptions ||
          this.resolveDataElementOptions(
            ________currentIndex,
            _________currentIndex.active ? "active" : ___updateType,
          );
      }
      currentRotation += currentCircumference;
      this.updateElement(
        _________currentIndex,
        ________currentIndex,
        _elementData,
        ___updateType,
      );
    }
  }
  calculateTotal() {
    const _________cachedMeta = this._cachedMeta;
    const _____dataPoints = _________cachedMeta.data;
    let ________________index;
    let totalDataValueSum = 0;
    for (
      ________________index = 0;
      ________________index < _____dataPoints.length;
      ________________index++
    ) {
      const parsedDataValue =
        _________cachedMeta._parsed[________________index];
      if (
        parsedDataValue !== null &&
        !isNaN(parsedDataValue) &&
        !!this.chart.getDataVisibility(________________index) &&
        !_____dataPoints[________________index].hidden
      ) {
        totalDataValueSum += Math.abs(parsedDataValue);
      }
    }
    return totalDataValueSum;
  }
  calculateCircumference(timeValue) {
    const totalCachedMeta = this._cachedMeta.total;
    if (totalCachedMeta > 0 && !isNaN(timeValue)) {
      return (
        lastAnimationUpdateTimestamp * (Math.abs(timeValue) / totalCachedMeta)
      );
    } else {
      return 0;
    }
  }
  getLabelAndValue(_____labelIndex) {
    const _______cachedMeta = this._cachedMeta;
    const _____________________chartInstance = this.chart;
    const _chartLabels = _____________________chartInstance.data.labels || [];
    const _isAnimationRunning = _isChartAnimationRunning(
      _______cachedMeta._parsed[_____labelIndex],
      _____________________chartInstance.options.locale,
    );
    return {
      label: _chartLabels[_____labelIndex] || "",
      value: _isAnimationRunning,
    };
  }
  getMaxBorderWidth(__datasetData) {
    let maxBorderWidth = 0;
    const ______________________________chartInstance = this.chart;
    let _dataElementIndex;
    let ____datasetCount;
    let ___________________datasetMeta;
    let dataController;
    let _____dataElementOptions;
    if (!__datasetData) {
      _dataElementIndex = 0;
      ____datasetCount =
        ______________________________chartInstance.data.datasets.length;
      for (; _dataElementIndex < ____datasetCount; ++_dataElementIndex) {
        if (
          ______________________________chartInstance.isDatasetVisible(
            _dataElementIndex,
          )
        ) {
          ___________________datasetMeta =
            ______________________________chartInstance.getDatasetMeta(
              _dataElementIndex,
            );
          __datasetData = ___________________datasetMeta.data;
          dataController = ___________________datasetMeta.controller;
          break;
        }
      }
    }
    if (!__datasetData) {
      return 0;
    }
    _dataElementIndex = 0;
    ____datasetCount = __datasetData.length;
    for (; _dataElementIndex < ____datasetCount; ++_dataElementIndex) {
      _____dataElementOptions =
        dataController.resolveDataElementOptions(_dataElementIndex);
      if (_____dataElementOptions.borderAlign !== "inner") {
        maxBorderWidth = Math.max(
          maxBorderWidth,
          _____dataElementOptions.borderWidth || 0,
          _____dataElementOptions.hoverBorderWidth || 0,
        );
      }
    }
    return maxBorderWidth;
  }
  getMaxOffset(dataElementArray) {
    let maxOffset = 0;
    for (
      let __dataElementIndex = 0, dataElementCount = dataElementArray.length;
      __dataElementIndex < dataElementCount;
      ++__dataElementIndex
    ) {
      const _dataElementOptions =
        this.resolveDataElementOptions(__dataElementIndex);
      maxOffset = Math.max(
        maxOffset,
        _dataElementOptions.offset || 0,
        _dataElementOptions.hoverOffset || 0,
      );
    }
    return maxOffset;
  }
  _getRingWeightOffset(totalVisibleDatasets) {
    let totalRingWeightOffset = 0;
    for (
      let _______________________datasetIndex = 0;
      _______________________datasetIndex < totalVisibleDatasets;
      ++_______________________datasetIndex
    ) {
      if (this.chart.isDatasetVisible(_______________________datasetIndex)) {
        totalRingWeightOffset += this._getRingWeight(
          _______________________datasetIndex,
        );
      }
    }
    return totalRingWeightOffset;
  }
  _getRingWeight(___________________________________datasetIndex) {
    return Math.max(
      chartAnimationRunning(
        this.chart.data.datasets[
          ___________________________________datasetIndex
        ].weight,
        1,
      ),
      0,
    );
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
class _LineChartElement extends ChartElement {
  static id = "line";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    showLine: true,
    spanGaps: false,
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category",
      },
      _value_: {
        type: "linear",
      },
    },
  };
  initialize() {
    this.enableOptionSharing = true;
    this.supportsDecimation = true;
    super.initialize();
  }
  update(updateTimeStamp) {
    const ______________________cachedMeta = this._cachedMeta;
    const {
      dataset: _____________dataset,
      data: ______dataArray = [],
      _dataset: ______________dataset,
    } = ______________________cachedMeta;
    const _areAnimationsDisabled = this.chart._animationsDisabled;
    let { start: _drawStartIndex, count: __drawCount } = chartAnimationQueue(
      ______________________cachedMeta,
      ______dataArray,
      _areAnimationsDisabled,
    );
    this._drawStart = _drawStartIndex;
    this._drawCount = __drawCount;
    if (refreshIntervalId(______________________cachedMeta)) {
      _drawStartIndex = 0;
      __drawCount = ______dataArray.length;
    }
    _____________dataset._chart = this.chart;
    _____________dataset._datasetIndex = this.index;
    _____________dataset._decimated = !!______________dataset._decimated;
    _____________dataset.points = ______dataArray;
    const _datasetElementOptions =
      this.resolveDatasetElementOptions(updateTimeStamp);
    if (!this.options.showLine) {
      _datasetElementOptions.borderWidth = 0;
    }
    _datasetElementOptions.segment = this.options.segment;
    this.updateElement(
      _____________dataset,
      undefined,
      {
        animated: !_areAnimationsDisabled,
        options: _datasetElementOptions,
      },
      updateTimeStamp,
    );
    this.updateElements(
      ______dataArray,
      _drawStartIndex,
      __drawCount,
      updateTimeStamp,
    );
  }
  updateElements(
    _currentElements,
    ___________________________________________________________________________________currentIndex,
    __index,
    __updateMode,
  ) {
    const isResetState = __updateMode === "reset";
    const {
      iScale: _______iScale,
      vScale: valueAxis,
      _stacked: ___isStacked,
      _dataset: _______________dataset,
    } = this._cachedMeta;
    const {
      sharedOptions: ___sharedOptions,
      includeOptions: includeSharedOptions,
    } = this._getSharedOptions(
      ___________________________________________________________________________________currentIndex,
      __updateMode,
    );
    const _____axisValue = _______iScale.axis;
    const _valueAxis = valueAxis.axis;
    const { spanGaps: spanGaps, segment: shouldParseElement } = this.options;
    const maxDistance = requestId(spanGaps)
      ? spanGaps
      : Number.POSITIVE_INFINITY;
    const isConditional =
      this.chart._animationsDisabled || isResetState || __updateMode === "none";
    const elementIndexSum =
      ___________________________________________________________________________________currentIndex +
      __index;
    const _totalElements = _currentElements.length;
    let _previousParsedData =
      ___________________________________________________________________________________currentIndex >
        0 &&
      this.getParsed(
        ___________________________________________________________________________________currentIndex -
          1,
      );
    for (let _index = 0; _index < _totalElements; ++_index) {
      const ______currentItem = _currentElements[_index];
      const currentElement = isConditional ? ______currentItem : {};
      if (
        _index <
          ___________________________________________________________________________________currentIndex ||
        _index >= elementIndexSum
      ) {
        currentElement.skip = true;
        continue;
      }
      const ___parsedData = this.getParsed(_index);
      const chartUpdateIntervalValue = chartUpdateInterval(
        ___parsedData[_valueAxis],
      );
      const currentElementPixelValue = (currentElement[_____axisValue] =
        _______iScale.getPixelForValue(___parsedData[_____axisValue], _index));
      const _currentPixelValue = (currentElement[_valueAxis] =
        isResetState || chartUpdateIntervalValue
          ? valueAxis.getBasePixel()
          : valueAxis.getPixelForValue(
              ___isStacked
                ? this.applyStack(valueAxis, ___parsedData, ___isStacked)
                : ___parsedData[_valueAxis],
              _index,
            ));
      currentElement.skip =
        isNaN(currentElementPixelValue) ||
        isNaN(_currentPixelValue) ||
        chartUpdateIntervalValue;
      currentElement.stop =
        _index > 0 &&
        Math.abs(
          ___parsedData[_____axisValue] - _previousParsedData[_____axisValue],
        ) > maxDistance;
      if (shouldParseElement) {
        currentElement.parsed = ___parsedData;
        currentElement.raw = _______________dataset.data[_index];
      }
      if (includeSharedOptions) {
        currentElement.options =
          ___sharedOptions ||
          this.resolveDataElementOptions(
            _index,
            ______currentItem.active ? "active" : __updateMode,
          );
      }
      if (!isConditional) {
        this.updateElement(
          ______currentItem,
          _index,
          currentElement,
          __updateMode,
        );
      }
      _previousParsedData = ___parsedData;
    }
  }
  getMaxOverflow() {
    const ____________cachedMeta = this._cachedMeta;
    const datasetOptions = ____________cachedMeta.dataset;
    const borderWidth =
      (datasetOptions.options && datasetOptions.options.borderWidth) || 0;
    const cachedDataArray = ____________cachedMeta.data || [];
    if (!cachedDataArray.length) {
      return borderWidth;
    }
    const firstDataElementSize = cachedDataArray[0].size(
      this.resolveDataElementOptions(0),
    );
    const lastDataElementSize = cachedDataArray[
      cachedDataArray.length - 1
    ].size(this.resolveDataElementOptions(cachedDataArray.length - 1));
    return Math.max(borderWidth, firstDataElementSize, lastDataElementSize) / 2;
  }
  draw() {
    const _cachedMeta = this._cachedMeta;
    _cachedMeta.dataset.updateControlPoints(
      this.chart.chartArea,
      _cachedMeta.iScale.axis,
    );
    super.draw();
  }
}
class PolarAreaChart extends ChartElement {
  static id = "polarArea";
  static defaults = {
    dataElementType: "arc",
    animation: {
      animateRotate: true,
      animateScale: true,
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "startAngle",
          "endAngle",
          "innerRadius",
          "outerRadius",
        ],
      },
    },
    indexAxis: "r",
    startAngle: 0,
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(______________________________________chartData) {
            const _______________________________________chartData =
              ______________________________________chartData.data;
            if (
              _______________________________________chartData.labels.length &&
              _______________________________________chartData.datasets.length
            ) {
              const {
                labels: { pointStyle: __pointStyle, color: __fontColor },
              } =
                ______________________________________chartData.legend.options;
              return _______________________________________chartData.labels.map(
                (labelText, __dataPointIndex) => {
                  const styleOptions =
                    ______________________________________chartData
                      .getDatasetMeta(0)
                      .controller.getStyle(__dataPointIndex);
                  return {
                    text: labelText,
                    fillStyle: styleOptions.backgroundColor,
                    strokeStyle: styleOptions.borderColor,
                    fontColor: __fontColor,
                    lineWidth: styleOptions.borderWidth,
                    pointStyle: __pointStyle,
                    hidden:
                      !______________________________________chartData.getDataVisibility(
                        __dataPointIndex,
                      ),
                    index: __dataPointIndex,
                  };
                },
              );
            }
            return [];
          },
        },
        onClick(
          toggleVisibilityEvent,
          ____________________event,
          __chartController,
        ) {
          __chartController.chart.toggleDataVisibility(
            ____________________event.index,
          );
          __chartController.chart.update();
        },
      },
    },
    scales: {
      r: {
        type: "radialLinear",
        angleLines: {
          display: false,
        },
        beginAtZero: true,
        grid: {
          circular: true,
        },
        pointLabels: {
          display: false,
        },
        startAngle: 0,
      },
    },
  };
  constructor(radiusConstructorParams, constructionParams) {
    super(radiusConstructorParams, constructionParams);
    this.innerRadius = undefined;
    this.outerRadius = undefined;
  }
  getLabelAndValue(______labelIndex) {
    const ____cachedMetadata = this._cachedMeta;
    const ______________________chartInstance = this.chart;
    const __chartLabels = ______________________chartInstance.data.labels || [];
    const isChartAnimationActive = _isChartAnimationRunning(
      ____cachedMetadata._parsed[______labelIndex].r,
      ______________________chartInstance.options.locale,
    );
    return {
      label: __chartLabels[______labelIndex] || "",
      value: isChartAnimationActive,
    };
  }
  parseObjectData(
    objectData,
    ____parsedData,
    ____________________________________________________________index,
    _dataSource,
  ) {
    return __chartUpdater.bind(this)(
      objectData,
      ____parsedData,
      ____________________________________________________________index,
      _dataSource,
    );
  }
  update(__timestamp) {
    const __cachedMetadata = this._cachedMeta.data;
    this._updateRadius();
    this.updateElements(
      __cachedMetadata,
      0,
      __cachedMetadata.length,
      __timestamp,
    );
  }
  getMinMax() {
    const _______________cachedMeta = this._cachedMeta;
    const minMaxValues = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
    };
    _______________cachedMeta.data.forEach((_dataValue, _______dataIndex) => {
      const parsedValue = this.getParsed(_______dataIndex).r;
      if (
        !isNaN(parsedValue) &&
        this.chart.getDataVisibility(_______dataIndex)
      ) {
        if (parsedValue < minMaxValues.min) {
          minMaxValues.min = parsedValue;
        }
        if (parsedValue > minMaxValues.max) {
          minMaxValues.max = parsedValue;
        }
      }
    });
    return minMaxValues;
  }
  _updateRadius() {
    const _________________________chartInstance = this.chart;
    const ___chartArea = _________________________chartInstance.chartArea;
    const ________________chartOptions =
      _________________________chartInstance.options;
    const minChartAreaDimension = Math.min(
      ___chartArea.right - ___chartArea.left,
      ___chartArea.bottom - ___chartArea.top,
    );
    const ____radius = Math.max(minChartAreaDimension / 2, 0);
    const cutoutRadiusAdjustment =
      (____radius -
        Math.max(
          ________________chartOptions.cutoutPercentage
            ? (____radius / 100) * ________________chartOptions.cutoutPercentage
            : 1,
          0,
        )) /
      _________________________chartInstance.getVisibleDatasetCount();
    this.outerRadius = ____radius - cutoutRadiusAdjustment * this.index;
    this.innerRadius = this.outerRadius - cutoutRadiusAdjustment;
  }
  updateElements(
    dataPointArray,
    maxDataIndex,
    numberOfAdditionalElements,
    _resetState,
  ) {
    const shouldResetState = _resetState === "reset";
    const ___________________________________chartInstance = this.chart;
    const _______________animationOptions =
      ___________________________________chartInstance.options.animation;
    const cachedMetaRadiusScale = this._cachedMeta.rScale;
    const centerXCoordinate = cachedMetaRadiusScale.xCenter;
    const ____centerY = cachedMetaRadiusScale.yCenter;
    const initialAngle =
      cachedMetaRadiusScale.getIndexAngle(0) - notificationListener * 0.5;
    let dataIndex;
    let ___currentAngle = initialAngle;
    const angleIncrementPerVisibleElement = 360 / this.countVisibleElements();
    for (dataIndex = 0; dataIndex < maxDataIndex; ++dataIndex) {
      ___currentAngle += this._computeAngle(
        dataIndex,
        _resetState,
        angleIncrementPerVisibleElement,
      );
    }
    for (
      dataIndex = maxDataIndex;
      dataIndex < maxDataIndex + numberOfAdditionalElements;
      dataIndex++
    ) {
      const _dataIndex = dataPointArray[dataIndex];
      let angleIncrement = ___currentAngle;
      let __currentAngle =
        ___currentAngle +
        this._computeAngle(
          dataIndex,
          _resetState,
          angleIncrementPerVisibleElement,
        );
      let __distanceFromCenter =
        ___________________________________chartInstance.getDataVisibility(
          dataIndex,
        )
          ? cachedMetaRadiusScale.getDistanceFromCenterForValue(
              this.getParsed(dataIndex).r,
            )
          : 0;
      ___currentAngle = __currentAngle;
      if (shouldResetState) {
        if (_______________animationOptions.animateScale) {
          __distanceFromCenter = 0;
        }
        if (_______________animationOptions.animateRotate) {
          angleIncrement = __currentAngle = initialAngle;
        }
      }
      const dataPointMetrics = {
        x: centerXCoordinate,
        y: ____centerY,
        innerRadius: 0,
        outerRadius: __distanceFromCenter,
        startAngle: angleIncrement,
        endAngle: __currentAngle,
        options: this.resolveDataElementOptions(
          dataIndex,
          _dataIndex.active ? "active" : _resetState,
        ),
      };
      this.updateElement(_dataIndex, dataIndex, dataPointMetrics, _resetState);
    }
  }
  countVisibleElements() {
    const ______cachedMeta = this._cachedMeta;
    let parsedDataCount = 0;
    ______cachedMeta.data.forEach((_parsedValue, __________dataIndex) => {
      if (
        !isNaN(this.getParsed(__________dataIndex).r) &&
        this.chart.getDataVisibility(__________dataIndex)
      ) {
        parsedDataCount++;
      }
    });
    return parsedDataCount;
  }
  _computeAngle(_____dataPointIndex, ___dataElementOptions, defaultAngle) {
    if (this.chart.getDataVisibility(_____dataPointIndex)) {
      return requestAnimation(
        this.resolveDataElementOptions(
          _____dataPointIndex,
          ___dataElementOptions,
        ).angle || defaultAngle,
      );
    } else {
      return 0;
    }
  }
}
class PieChart extends DoughnutChartElement {
  static id = "pie";
  static defaults = {
    cutout: 0,
    rotation: 0,
    circumference: 360,
    radius: "100%",
  };
}
class RadarChart extends ChartElement {
  static id = "radar";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    indexAxis: "r",
    showLine: true,
    elements: {
      line: {
        fill: "start",
      },
    },
  };
  static overrides = {
    aspectRatio: 1,
    scales: {
      r: {
        type: "radialLinear",
      },
    },
  };
  getLabelAndValue(___________________dataIndex) {
    const cachedMetaValueScale = this._cachedMeta.vScale;
    const __parsedDataValue = this.getParsed(___________________dataIndex);
    return {
      label: cachedMetaValueScale.getLabels()[___________________dataIndex],
      value:
        "" +
        cachedMetaValueScale.getLabelForValue(
          __parsedDataValue[cachedMetaValueScale.axis],
        ),
    };
  }
  parseObjectData(
    _objectData,
    __objectData,
    __________________dataIndex,
    _____parsedData,
  ) {
    return __chartUpdater.bind(this)(
      _objectData,
      __objectData,
      __________________dataIndex,
      _____parsedData,
    );
  }
  update(_updateType) {
    const ______cachedMetadata = this._cachedMeta;
    const _cachedDataset = ______cachedMetadata.dataset;
    const _cachedData = ______cachedMetadata.data || [];
    const __labelList = ______cachedMetadata.iScale.getLabels();
    _cachedDataset.points = _cachedData;
    if (_updateType !== "resize") {
      const cachedMetadata = this.resolveDatasetElementOptions(_updateType);
      if (!this.options.showLine) {
        cachedMetadata.borderWidth = 0;
      }
      const datasetUpdateOptions = {
        _loop: true,
        _fullLoop: __labelList.length === _cachedData.length,
        options: cachedMetadata,
      };
      this.updateElement(
        _cachedDataset,
        undefined,
        datasetUpdateOptions,
        _updateType,
      );
    }
    this.updateElements(_cachedData, 0, _cachedData.length, _updateType);
  }
  updateElements(
    dataElements,
    ______________startIndex,
    ____elementCount,
    elementUpdateStatus,
  ) {
    const cachedRScale = this._cachedMeta.rScale;
    const isResetStatus = elementUpdateStatus === "reset";
    for (
      let ________index = ______________startIndex;
      ________index < ______________startIndex + ____elementCount;
      ________index++
    ) {
      const dataElement = dataElements[________index];
      const dataElementOptions = this.resolveDataElementOptions(
        ________index,
        dataElement.active ? "active" : elementUpdateStatus,
      );
      const _pointPosition = cachedRScale.getPointPositionForValue(
        ________index,
        this.getParsed(________index).r,
      );
      const _xCoordinate = isResetStatus
        ? cachedRScale.xCenter
        : _pointPosition.x;
      const pointYCoordinate = isResetStatus
        ? cachedRScale.yCenter
        : _pointPosition.y;
      const elementPosition = {
        x: _xCoordinate,
        y: pointYCoordinate,
        angle: _pointPosition.angle,
        skip: isNaN(_xCoordinate) || isNaN(pointYCoordinate),
        options: dataElementOptions,
      };
      this.updateElement(
        dataElement,
        ________index,
        elementPosition,
        elementUpdateStatus,
      );
    }
  }
}
class ScatterChartElement extends ChartElement {
  static id = "scatter";
  static defaults = {
    datasetElementType: false,
    dataElementType: "point",
    showLine: false,
    fill: false,
  };
  static overrides = {
    interaction: {
      mode: "point",
    },
    scales: {
      x: {
        type: "linear",
      },
      y: {
        type: "linear",
      },
    },
  };
  getLabelAndValue(______dataPointIndex) {
    const ___________cachedMeta = this._cachedMeta;
    const _labelList = this.chart.data.labels || [];
    const { xScale: _xScale, yScale: yScaleAxis } = ___________cachedMeta;
    const parsedDataPoint = this.getParsed(______dataPointIndex);
    const labelForXValue = _xScale.getLabelForValue(parsedDataPoint.x);
    const labelForYAxisValue = yScaleAxis.getLabelForValue(parsedDataPoint.y);
    return {
      label: _labelList[______dataPointIndex] || "",
      value: "(" + labelForXValue + ", " + labelForYAxisValue + ")",
    };
  }
  update(___currentTime) {
    const _________________________cachedMeta = this._cachedMeta;
    const { data: datasetPoints = [] } = _________________________cachedMeta;
    const areAnimationsDisabled = this.chart._animationsDisabled;
    let { start: drawStartPosition, count: ___drawCount } = chartAnimationQueue(
      _________________________cachedMeta,
      datasetPoints,
      areAnimationsDisabled,
    );
    this._drawStart = drawStartPosition;
    this._drawCount = ___drawCount;
    if (refreshIntervalId(_________________________cachedMeta)) {
      drawStartPosition = 0;
      ___drawCount = datasetPoints.length;
    }
    if (this.options.showLine) {
      if (!this.datasetElementType) {
        this.addElements();
      }
      const { dataset: drawStart, _dataset: drawCount } =
        _________________________cachedMeta;
      drawStart._chart = this.chart;
      drawStart._datasetIndex = this.index;
      drawStart._decimated = !!drawCount._decimated;
      drawStart.points = datasetPoints;
      const resolvedDatasetElementOptions =
        this.resolveDatasetElementOptions(___currentTime);
      resolvedDatasetElementOptions.segment = this.options.segment;
      this.updateElement(
        drawStart,
        undefined,
        {
          animated: !areAnimationsDisabled,
          options: resolvedDatasetElementOptions,
        },
        ___currentTime,
      );
    } else if (this.datasetElementType) {
      delete _________________________cachedMeta.dataset;
      this.datasetElementType = false;
    }
    this.updateElements(
      datasetPoints,
      drawStartPosition,
      ___drawCount,
      ___currentTime,
    );
  }
  addElements() {
    const { showLine: isLineVisible } = this.options;
    if (!this.datasetElementType && isLineVisible) {
      this.datasetElementType = this.chart.registry.getElement("line");
    }
    super.addElements();
  }
  updateElements(
    ___dataElementArray,
    currentDataElementIndex,
    dataPointCount,
    _____updateType,
  ) {
    const __isResetState = _____updateType === "reset";
    const {
      iScale: ________iScale,
      vScale: ______valueScale,
      _stacked: __stackValue,
      _dataset: _________________dataset,
    } = this._cachedMeta;
    const ____currentIndex = this.resolveDataElementOptions(
      currentDataElementIndex,
      _____updateType,
    );
    const _____sharedOptions = this.getSharedOptions(____currentIndex);
    const shouldIncludeOptions = this.includeOptions(
      _____updateType,
      _____sharedOptions,
    );
    const _iScaleAxis = ________iScale.axis;
    const __valueAxis = ______valueScale.axis;
    const { spanGaps: _spanGaps, segment: shouldStoreParsedData } =
      this.options;
    const maxSpanGap = requestId(_spanGaps)
      ? _spanGaps
      : Number.POSITIVE_INFINITY;
    const shouldCreateDataPoint =
      this.chart._animationsDisabled ||
      __isResetState ||
      _____updateType === "none";
    let __previousParsedData =
      currentDataElementIndex > 0 &&
      this.getParsed(currentDataElementIndex - 1);
    for (
      let ___index = currentDataElementIndex;
      ___index < currentDataElementIndex + dataPointCount;
      ++___index
    ) {
      const ___startIndex = ___dataElementArray[___index];
      const parsedData = this.getParsed(___index);
      const dataPoint = shouldCreateDataPoint ? ___startIndex : {};
      const _chartUpdateIntervalValue = chartUpdateInterval(
        parsedData[__valueAxis],
      );
      const dataPointPixelValue = (dataPoint[_iScaleAxis] =
        ________iScale.getPixelForValue(parsedData[_iScaleAxis], ___index));
      const _basePixelValue = (dataPoint[__valueAxis] =
        __isResetState || _chartUpdateIntervalValue
          ? ______valueScale.getBasePixel()
          : ______valueScale.getPixelForValue(
              __stackValue
                ? this.applyStack(______valueScale, parsedData, __stackValue)
                : parsedData[__valueAxis],
              ___index,
            ));
      dataPoint.skip =
        isNaN(dataPointPixelValue) ||
        isNaN(_basePixelValue) ||
        _chartUpdateIntervalValue;
      dataPoint.stop =
        ___index > 0 &&
        Math.abs(parsedData[_iScaleAxis] - __previousParsedData[_iScaleAxis]) >
          maxSpanGap;
      if (shouldStoreParsedData) {
        dataPoint.parsed = parsedData;
        dataPoint.raw = _________________dataset.data[___index];
      }
      if (shouldIncludeOptions) {
        dataPoint.options =
          _____sharedOptions ||
          this.resolveDataElementOptions(
            ___index,
            ___startIndex.active ? "active" : _____updateType,
          );
      }
      if (!shouldCreateDataPoint) {
        this.updateElement(___startIndex, ___index, dataPoint, _____updateType);
      }
      __previousParsedData = parsedData;
    }
    this.updateSharedOptions(
      _____sharedOptions,
      _____updateType,
      ____currentIndex,
    );
  }
  getMaxOverflow() {
    const ____________________cachedMeta = this._cachedMeta;
    const __dataElements = ____________________cachedMeta.data || [];
    if (!this.options.showLine) {
      let cachedMeta = 0;
      for (
        let ______________________________index = __dataElements.length - 1;
        ______________________________index >= 0;
        --______________________________index
      ) {
        cachedMeta = Math.max(
          cachedMeta,
          __dataElements[______________________________index].size(
            this.resolveDataElementOptions(______________________________index),
          ) / 2,
        );
      }
      return cachedMeta > 0 && cachedMeta;
    }
    const ___elementIndex = ____________________cachedMeta.dataset;
    const ____borderWidth =
      (___elementIndex.options && ___elementIndex.options.borderWidth) || 0;
    if (!__dataElements.length) {
      return ____borderWidth;
    }
    const firstElementSize = __dataElements[0].size(
      this.resolveDataElementOptions(0),
    );
    const _lastDataElementSize = __dataElements[__dataElements.length - 1].size(
      this.resolveDataElementOptions(__dataElements.length - 1),
    );
    return (
      Math.max(____borderWidth, firstElementSize, _lastDataElementSize) / 2
    );
  }
}
var ____chartAnimationQueue = Object.freeze({
  __proto__: null,
  BarController: BarChart,
  BubbleController: BubbleChartElement,
  DoughnutController: DoughnutChartElement,
  LineController: _LineChartElement,
  PieController: PieChart,
  PolarAreaController: PolarAreaChart,
  RadarController: RadarChart,
  ScatterController: ScatterChartElement,
});
function throwErrorForUnimplementedMethod() {
  throw new Error(
    "This method is not implemented: Check that a complete date adapter is provided.",
  );
}
class CustomClass {
  static override(propertiesToAssign) {
    Object.assign(CustomClass.prototype, propertiesToAssign);
  }
  options;
  constructor(_____options) {
    this.options = _____options || {};
  }
  init() {}
  formats() {
    return throwErrorForUnimplementedMethod();
  }
  parse() {
    return throwErrorForUnimplementedMethod();
  }
  format() {
    return throwErrorForUnimplementedMethod();
  }
  add() {
    return throwErrorForUnimplementedMethod();
  }
  diff() {
    return throwErrorForUnimplementedMethod();
  }
  startOf() {
    return throwErrorForUnimplementedMethod();
  }
  endOf() {
    return throwErrorForUnimplementedMethod();
  }
}
var ___animationInstance = {
  _date: CustomClass,
};
function getChartDataRange(
  _______chartData,
  axisIdentifier,
  __dataIndex,
  isAnimationInactive,
) {
  const {
    controller: ____chartController,
    data: chartDataArray,
    _sorted: _sortedData,
  } = _______chartData;
  const cachedScaleMeta = ____chartController._cachedMeta.iScale;
  if (
    cachedScaleMeta &&
    axisIdentifier === cachedScaleMeta.axis &&
    axisIdentifier !== "r" &&
    _sortedData &&
    chartDataArray.length
  ) {
    const dataTransformationFunction = cachedScaleMeta._reversePixels
      ? lastAnimationTimestamp
      : notificationFunction;
    if (!isAnimationInactive) {
      return dataTransformationFunction(
        chartDataArray,
        axisIdentifier,
        __dataIndex,
      );
    }
    if (____chartController._sharedOptions) {
      const isAnimationActive = chartDataArray[0];
      const chartController =
        typeof isAnimationActive.getRange == "function" &&
        isAnimationActive.getRange(axisIdentifier);
      if (chartController) {
        const _isAnimationActive = dataTransformationFunction(
          chartDataArray,
          axisIdentifier,
          __dataIndex - chartController,
        );
        const sortedData = dataTransformationFunction(
          chartDataArray,
          axisIdentifier,
          __dataIndex + chartController,
        );
        return {
          lo: _isAnimationActive.lo,
          hi: sortedData.hi,
        };
      }
    }
  }
  return {
    lo: 0,
    hi: chartDataArray.length - 1,
  };
}
function processVisibleDataset(
  ____datasetIndex,
  _____datasetIndex,
  ______datasetIndex,
  callbackFunction,
  visibleDatasetIndex,
) {
  const ____sortedVisibleDatasetMetas =
    ____datasetIndex.getSortedVisibleDatasetMetas();
  const _currentDataset = ______datasetIndex[_____datasetIndex];
  for (
    let ___________________________currentIndex = 0,
      __arrayLength = ____sortedVisibleDatasetMetas.length;
    ___________________________currentIndex < __arrayLength;
    ++___________________________currentIndex
  ) {
    const { index: ______dataIndex, data: __dataArray } =
      ____sortedVisibleDatasetMetas[___________________________currentIndex];
    const { lo: lowerBound, hi: highIndex } = getChartDataRange(
      ____sortedVisibleDatasetMetas[___________________________currentIndex],
      _____datasetIndex,
      _currentDataset,
      visibleDatasetIndex,
    );
    for (
      let ____________________________________index = lowerBound;
      ____________________________________index <= highIndex;
      ++____________________________________index
    ) {
      const ____dataElement =
        __dataArray[____________________________________index];
      if (!____dataElement.skip) {
        callbackFunction(
          ____dataElement,
          ______dataIndex,
          ____________________________________index,
        );
      }
    }
  }
}
function calculateDistanceBasedOnAxes(inputString) {
  const hasXCharacter = inputString.indexOf("x") !== -1;
  const isYPresent = inputString.indexOf("y") !== -1;
  return function (pointA, secondPoint) {
    const horizontalDistance = hasXCharacter
      ? Math.abs(pointA.x - secondPoint.x)
      : 0;
    const deltaY = isYPresent ? Math.abs(pointA.y - secondPoint.y) : 0;
    return Math.sqrt(Math.pow(horizontalDistance, 2) + Math.pow(deltaY, 2));
  };
}
function findElementsInRange(
  _targetElement,
  _pointCoordinates,
  _chartElement,
  __range,
  isPointInAreaCheck,
) {
  const foundElements = [];
  if (!isPointInAreaCheck && !_targetElement.isPointInArea(_pointCoordinates)) {
    return foundElements;
  }
  processVisibleDataset(
    _targetElement,
    _chartElement,
    _pointCoordinates,
    function (
      ___chartElement,
      ________________datasetIndex,
      _________dataIndex,
    ) {
      if (
        (isPointInAreaCheck ||
          chartUpdater(___chartElement, _targetElement.chartArea, 0)) &&
        ___chartElement.inRange(
          _pointCoordinates.x,
          _pointCoordinates.y,
          __range,
        )
      ) {
        foundElements.push({
          element: ___chartElement,
          datasetIndex: ________________datasetIndex,
          index: _________dataIndex,
        });
      }
    },
    true,
  );
  return foundElements;
}
function visibleAnimatedElements(
  ___element,
  eventCoordinates,
  ___datasetIndex,
  propsContext,
) {
  let visibleDatasetEntries = [];
  processVisibleDataset(
    ___element,
    ___datasetIndex,
    eventCoordinates,
    function (elementInstance, __________datasetIndex, elementIndex) {
      const { startAngle: __startAngle, endAngle: ___endAngle } =
        elementInstance.getProps(["startAngle", "endAngle"], propsContext);
      const { angle: currentAnimationAngle } = _lastAnimationUpdateTimestamp(
        elementInstance,
        {
          x: eventCoordinates.x,
          y: eventCoordinates.y,
        },
      );
      if (
        _animatedChartItems(currentAnimationAngle, __startAngle, ___endAngle)
      ) {
        visibleDatasetEntries.push({
          element: elementInstance,
          datasetIndex: __________datasetIndex,
          index: elementIndex,
        });
      }
    },
  );
  return visibleDatasetEntries;
}
function findClosestDataPoints(
  _dataPoint,
  targetElement,
  __dataPoint,
  isFiltered,
  searchRadius,
  isOutsideBoundary,
) {
  let closestDataPoints = [];
  const distanceCalculator = calculateDistanceBasedOnAxes(__dataPoint);
  let __closestDistance = Number.POSITIVE_INFINITY;
  processVisibleDataset(
    _dataPoint,
    __dataPoint,
    targetElement,
    function (__currentElement, __datasetIndex, ___dataIndex) {
      const isInRange = __currentElement.inRange(
        targetElement.x,
        targetElement.y,
        searchRadius,
      );
      if (isFiltered && !isInRange) {
        return;
      }
      const _centerPoint = __currentElement.getCenterPoint(searchRadius);
      if (
        !isOutsideBoundary &&
        !_dataPoint.isPointInArea(_centerPoint) &&
        !isInRange
      ) {
        return;
      }
      const _distanceToTarget = distanceCalculator(targetElement, _centerPoint);
      if (_distanceToTarget < __closestDistance) {
        closestDataPoints = [
          {
            element: __currentElement,
            datasetIndex: __datasetIndex,
            index: ___dataIndex,
          },
        ];
        __closestDistance = _distanceToTarget;
      } else if (_distanceToTarget === __closestDistance) {
        closestDataPoints.push({
          element: __currentElement,
          datasetIndex: __datasetIndex,
          index: ___dataIndex,
        });
      }
    },
  );
  return closestDataPoints;
}
function areaCheckHandler(
  areaChecker,
  point,
  regionIdentifier,
  isValid,
  ___callbackFunction,
  isAreaVisible,
) {
  if (isAreaVisible || areaChecker.isPointInArea(point)) {
    if (regionIdentifier !== "r" || isValid) {
      return findClosestDataPoints(
        areaChecker,
        point,
        regionIdentifier,
        isValid,
        ___callbackFunction,
        isAreaVisible,
      );
    } else {
      return visibleAnimatedElements(
        areaChecker,
        point,
        regionIdentifier,
        ___callbackFunction,
      );
    }
  } else {
    return [];
  }
}
function isRangeMatched(
  _dataElement,
  eventInstance,
  _axisIdentifier,
  isReturnEmpty,
  rangeValue,
) {
  const matchedElements = [];
  const rangeCheckProperty = _axisIdentifier === "x" ? "inXRange" : "inYRange";
  let _isRangeMatched = false;
  processVisibleDataset(
    _dataElement,
    _axisIdentifier,
    eventInstance,
    (
      __________targetElement,
      _____________________________________datasetIndex,
      targetElementIndex,
    ) => {
      if (
        __________targetElement[rangeCheckProperty](
          eventInstance[_axisIdentifier],
          rangeValue,
        )
      ) {
        matchedElements.push({
          element: __________targetElement,
          datasetIndex: _____________________________________datasetIndex,
          index: targetElementIndex,
        });
        _isRangeMatched =
          _isRangeMatched ||
          __________targetElement.inRange(
            eventInstance.x,
            eventInstance.y,
            rangeValue,
          );
      }
    },
  );
  if (isReturnEmpty && !_isRangeMatched) {
    return [];
  } else {
    return matchedElements;
  }
}
var ____________animationController = {
  evaluateInteractionItems: processVisibleDataset,
  modes: {
    index(dataTarget, lastDateUpdate, options, currentSelection) {
      const lastDateUpdatedResult = lastDateUpdated(lastDateUpdate, dataTarget);
      const axisDirection = options.axis || "x";
      const includeInvisible = options.includeInvisible || false;
      const intersectedDataPoints = options.intersect
        ? findElementsInRange(
            dataTarget,
            lastDateUpdatedResult,
            axisDirection,
            currentSelection,
            includeInvisible,
          )
        : areaCheckHandler(
            dataTarget,
            lastDateUpdatedResult,
            axisDirection,
            false,
            currentSelection,
            includeInvisible,
          );
      const visibleDatasetElements = [];
      if (intersectedDataPoints.length) {
        dataTarget.getSortedVisibleDatasetMetas().forEach((_currentItem) => {
          const intersectedDataPointIndex = intersectedDataPoints[0].index;
          const _currentDataPoint =
            _currentItem.data[intersectedDataPointIndex];
          if (_currentDataPoint && !_currentDataPoint.skip) {
            visibleDatasetElements.push({
              element: _currentDataPoint,
              datasetIndex: _currentItem.index,
              index: intersectedDataPointIndex,
            });
          }
        });
        return visibleDatasetElements;
      } else {
        return [];
      }
    },
    dataset(currentData, eventObject, interactionOptions, intersectedData) {
      const _lastDateUpdated = lastDateUpdated(eventObject, currentData);
      const __axisType = interactionOptions.axis || "xy";
      const _includeInvisible = interactionOptions.includeInvisible || false;
      let intersectedElements = interactionOptions.intersect
        ? findElementsInRange(
            currentData,
            _lastDateUpdated,
            __axisType,
            intersectedData,
            _includeInvisible,
          )
        : areaCheckHandler(
            currentData,
            _lastDateUpdated,
            __axisType,
            false,
            intersectedData,
            _includeInvisible,
          );
      if (intersectedElements.length > 0) {
        const lastDatasetUpdated = intersectedElements[0].datasetIndex;
        const _options = currentData.getDatasetMeta(lastDatasetUpdated).data;
        intersectedElements = [];
        for (
          let optionIndex = 0;
          optionIndex < _options.length;
          ++optionIndex
        ) {
          intersectedElements.push({
            element: _options[optionIndex],
            datasetIndex: lastDatasetUpdated,
            index: optionIndex,
          });
        }
      }
      return intersectedElements;
    },
    point: (___targetValue, lastEvent, ____axisType, isInvisible) =>
      findElementsInRange(
        ___targetValue,
        lastDateUpdated(lastEvent, ___targetValue),
        ____axisType.axis || "xy",
        isInvisible,
        ____axisType.includeInvisible || false,
      ),
    nearest(timeStamp, ______element, ______chartOptions, intersectingValue) {
      const _lastUpdateDate = lastDateUpdated(______element, timeStamp);
      const ___axisType = ______chartOptions.axis || "xy";
      const includeInvisibleInChartOptions =
        ______chartOptions.includeInvisible || false;
      return areaCheckHandler(
        timeStamp,
        _lastUpdateDate,
        ___axisType,
        ______chartOptions.intersect,
        intersectingValue,
        includeInvisibleInChartOptions,
      );
    },
    x: (____targetValue, lastUpdatedDate, intersectionValue, selectionState) =>
      isRangeMatched(
        ____targetValue,
        lastDateUpdated(lastUpdatedDate, ____targetValue),
        "x",
        intersectionValue.intersect,
        selectionState,
      ),
    y: (_______inputData, lastDateInput, intersectData, status) =>
      isRangeMatched(
        _______inputData,
        lastDateUpdated(lastDateInput, _______inputData),
        "y",
        intersectData.intersect,
        status,
      ),
  },
};
const chartUpdateHandler = ["left", "top", "right", "bottom"];
function filterByPosition(itemsWithMatchingPosition, targetPosition) {
  return itemsWithMatchingPosition.filter(
    (currentTarget) => currentTarget.pos === targetPosition,
  );
}
function _dataItem(filteredData, _axisValue) {
  return filteredData.filter(
    (chartUpdateData) =>
      chartUpdateHandler.indexOf(chartUpdateData.pos) === -1 &&
      chartUpdateData.box.axis === _axisValue,
  );
}
function sortByWeightAndIndex(itemsToSort, isSortedAscending) {
  return itemsToSort.sort((firstItem, secondarySortItem) => {
    const sortedItem = isSortedAscending ? secondarySortItem : firstItem;
    const unsortedItem = isSortedAscending ? firstItem : secondarySortItem;
    if (sortedItem.weight === unsortedItem.weight) {
      return sortedItem.index - unsortedItem.index;
    } else {
      return sortedItem.weight - unsortedItem.weight;
    }
  });
}
function processItems(inputArray) {
  const processedItems = [];
  let _itemIndex;
  let _inputArrayLength;
  let ___item;
  let boxPosition;
  let stackValue;
  let stackWeight;
  _itemIndex = 0;
  _inputArrayLength = (inputArray || []).length;
  for (; _itemIndex < _inputArrayLength; ++_itemIndex) {
    ___item = inputArray[_itemIndex];
    ({
      position: boxPosition,
      options: { stack: stackValue, stackWeight = 1 },
    } = ___item);
    processedItems.push({
      index: _itemIndex,
      box: ___item,
      pos: boxPosition,
      horizontal: ___item.isHorizontal(),
      weight: ___item.weight,
      stack: stackValue && boxPosition + stackValue,
      stackWeight: stackWeight,
    });
  }
  return processedItems;
}
function processInputArray(_____inputArray) {
  const stackStatusMap = {};
  for (const currentStackItem of _____inputArray) {
    const {
      stack: _stackValue,
      pos: _position,
      stackWeight: _stackWeight,
    } = currentStackItem;
    if (!_stackValue || !chartUpdateHandler.includes(_position)) {
      continue;
    }
    const stackStatus = (stackStatusMap[_stackValue] ||= {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0,
    });
    stackStatus.count++;
    stackStatus.weight += _stackWeight;
  }
  return stackStatusMap;
}
function calculateBoxDimensions(itemsArray, boxDimensions) {
  const processedInput = processInputArray(itemsArray);
  const { vBoxMaxWidth: vBoxMaxWidth, hBoxMaxHeight: maxBoxHeight } =
    boxDimensions;
  let ____itemIndex;
  let itemsCount;
  let _______item;
  ____itemIndex = 0;
  itemsCount = itemsArray.length;
  for (; ____itemIndex < itemsCount; ++____itemIndex) {
    _______item = itemsArray[____itemIndex];
    const { fullSize: boxFullSize } = _______item.box;
    const stackHeight = processedInput[_______item.stack];
    const _stackWeightRatio =
      stackHeight && _______item.stackWeight / stackHeight.weight;
    if (_______item.horizontal) {
      _______item.width = _stackWeightRatio
        ? _stackWeightRatio * vBoxMaxWidth
        : boxFullSize && boxDimensions.availableWidth;
      _______item.height = maxBoxHeight;
    } else {
      _______item.width = vBoxMaxWidth;
      _______item.height = _stackWeightRatio
        ? _stackWeightRatio * maxBoxHeight
        : boxFullSize && boxDimensions.availableHeight;
    }
  }
  return processedInput;
}
function processInputData(__inputData) {
  const __processedItems = processItems(__inputData);
  const fullSizeSortedItems = sortByWeightAndIndex(
    __processedItems.filter((fullSizeBox) => fullSizeBox.box.fullSize),
    true,
  );
  const leftItemsSortedByWeight = sortByWeightAndIndex(
    filterByPosition(__processedItems, "left"),
    true,
  );
  const rightPositionedItems = sortByWeightAndIndex(
    filterByPosition(__processedItems, "right"),
  );
  const topSortedItems = sortByWeightAndIndex(
    filterByPosition(__processedItems, "top"),
    true,
  );
  const sortedItemsBottom = sortByWeightAndIndex(
    filterByPosition(__processedItems, "bottom"),
  );
  const dataItemX = _dataItem(__processedItems, "x");
  const yPositionData = _dataItem(__processedItems, "y");
  return {
    fullSize: fullSizeSortedItems,
    leftAndTop: leftItemsSortedByWeight.concat(topSortedItems),
    rightAndBottom: rightPositionedItems
      .concat(yPositionData)
      .concat(sortedItemsBottom)
      .concat(dataItemX),
    chartArea: filterByPosition(__processedItems, "chartArea"),
    vertical: leftItemsSortedByWeight
      .concat(rightPositionedItems)
      .concat(yPositionData),
    horizontal: topSortedItems.concat(sortedItemsBottom).concat(dataItemX),
  };
}
function _________________________________________index(
  array1,
  secondArray,
  __________________________________________index,
  secondIndex,
) {
  return (
    Math.max(
      array1[__________________________________________index],
      secondArray[__________________________________________index],
    ) + Math.max(array1[secondIndex], secondArray[secondIndex])
  );
}
function _____boundingBox(boundingRect, _rectangle) {
  boundingRect.top = Math.max(boundingRect.top, _rectangle.top);
  boundingRect.left = Math.max(boundingRect.left, _rectangle.left);
  boundingRect.bottom = Math.max(boundingRect.bottom, _rectangle.bottom);
  boundingRect.right = Math.max(boundingRect.right, _rectangle.right);
}
function updatePaddingDimensions(
  paddingDimensions,
  stackDetails,
  item,
  stackSizingInfo,
) {
  const { pos: paddingPosition, box: _boxDimensions } = item;
  const _maxPaddingValue = paddingDimensions.maxPadding;
  if (!currentAnimationIndex(paddingPosition)) {
    if (item.size) {
      paddingDimensions[paddingPosition] -= item.size;
    }
    const stackSizing = stackSizingInfo[item.stack] || {
      size: 0,
      count: 1,
    };
    stackSizing.size = Math.max(
      stackSizing.size,
      item.horizontal ? _boxDimensions.height : _boxDimensions.width,
    );
    item.size = stackSizing.size / stackSizing.count;
    paddingDimensions[paddingPosition] += item.size;
  }
  if (_boxDimensions.getPadding) {
    _____boundingBox(_maxPaddingValue, _boxDimensions.getPadding());
  }
  const remainingWidth = Math.max(
    0,
    stackDetails.outerWidth -
      _________________________________________index(
        _maxPaddingValue,
        paddingDimensions,
        "left",
        "right",
      ),
  );
  const remainingVerticalPadding = Math.max(
    0,
    stackDetails.outerHeight -
      _________________________________________index(
        _maxPaddingValue,
        paddingDimensions,
        "top",
        "bottom",
      ),
  );
  const isWidthChanged = remainingWidth !== paddingDimensions.w;
  const isHeightChanged = remainingVerticalPadding !== paddingDimensions.h;
  paddingDimensions.w = remainingWidth;
  paddingDimensions.h = remainingVerticalPadding;
  if (item.horizontal) {
    return {
      same: isWidthChanged,
      other: isHeightChanged,
    };
  } else {
    return {
      same: isHeightChanged,
      other: isWidthChanged,
    };
  }
}
function adjustPadding(_paddingAdjustment) {
  const maxPaddingValues = _paddingAdjustment.maxPadding;
  function calculatePaddingAdjustment(
    ______________________________________________________________index,
  ) {
    const maxAdjustedValue = Math.max(
      maxPaddingValues[
        ______________________________________________________________index
      ] -
        _paddingAdjustment[
          ______________________________________________________________index
        ],
      0,
    );
    _paddingAdjustment[
      ______________________________________________________________index
    ] += maxAdjustedValue;
    return maxAdjustedValue;
  }
  _paddingAdjustment.y += calculatePaddingAdjustment("top");
  _paddingAdjustment.x += calculatePaddingAdjustment("left");
  calculatePaddingAdjustment("right");
  calculatePaddingAdjustment("bottom");
}
function calculatePadding(isHorizontal, _paddingConfig) {
  const maxPaddingValue = _paddingConfig.maxPadding;
  function _paddingValues(paddingSizes) {
    const paddingValues = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };
    paddingSizes.forEach(
      (_________________________________________________index) => {
        paddingValues[_________________________________________________index] =
          Math.max(
            _paddingConfig[
              _________________________________________________index
            ],
            maxPaddingValue[
              _________________________________________________index
            ],
          );
      },
    );
    return paddingValues;
  }
  return _paddingValues(isHorizontal ? ["left", "right"] : ["top", "bottom"]);
}
function processDimensions(
  _inputArray,
  dimensions,
  _________index,
  updateStatus,
) {
  const nonFullSizeItems = [];
  let ___________________________________________________________________currentIndex;
  let ________inputArrayLength;
  let currentDimension;
  let boxReference;
  let hasSameDimensionsFlag;
  let otherDimensionResult;
  ___________________________________________________________________currentIndex = 0;
  ________inputArrayLength = _inputArray.length;
  hasSameDimensionsFlag = 0;
  for (
    ;
    ___________________________________________________________________currentIndex <
    ________inputArrayLength;
    ++___________________________________________________________________currentIndex
  ) {
    currentDimension =
      _inputArray[
        ___________________________________________________________________currentIndex
      ];
    boxReference = currentDimension.box;
    boxReference.update(
      currentDimension.width || dimensions.w,
      currentDimension.height || dimensions.h,
      calculatePadding(currentDimension.horizontal, dimensions),
    );
    const { same: sameDimensionStatus, other: otherDimension } =
      updatePaddingDimensions(
        dimensions,
        _________index,
        currentDimension,
        updateStatus,
      );
    hasSameDimensionsFlag |= sameDimensionStatus && nonFullSizeItems.length;
    otherDimensionResult = otherDimensionResult || otherDimension;
    if (!boxReference.fullSize) {
      nonFullSizeItems.push(currentDimension);
    }
  }
  return (
    (hasSameDimensionsFlag &&
      processDimensions(
        nonFullSizeItems,
        dimensions,
        _________index,
        updateStatus,
      )) ||
    otherDimensionResult
  );
}
function setBoundingBox(
  __rectangle,
  leftCoordinate,
  topPosition,
  rectangleWidth,
  height,
) {
  __rectangle.top = topPosition;
  __rectangle.left = leftCoordinate;
  __rectangle.right = leftCoordinate + rectangleWidth;
  __rectangle.bottom = topPosition + height;
  __rectangle.width = rectangleWidth;
  __rectangle.height = height;
}
function layoutItems(items, positionData, paddingConfig, stackMetrics) {
  const __paddingValues = paddingConfig.padding;
  let { x: currentStartX, y: currentYPosition } = positionData;
  for (const ________item of items) {
    const boxElement = ________item.box;
    const stackMetricsEntry = stackMetrics[________item.stack] || {
      count: 1,
      placed: 0,
      weight: 1,
    };
    const stackWeightRatio =
      ________item.stackWeight / stackMetricsEntry.weight || 1;
    if (________item.horizontal) {
      const stackedItemSize = positionData.w * stackWeightRatio;
      const currentHeightOrWidth = stackMetricsEntry.size || boxElement.height;
      if (canvasContext(stackMetricsEntry.start)) {
        currentYPosition = stackMetricsEntry.start;
      }
      if (boxElement.fullSize) {
        setBoundingBox(
          boxElement,
          __paddingValues.left,
          currentYPosition,
          paddingConfig.outerWidth -
            __paddingValues.right -
            __paddingValues.left,
          currentHeightOrWidth,
        );
      } else {
        setBoundingBox(
          boxElement,
          positionData.left + stackMetricsEntry.placed,
          currentYPosition,
          stackedItemSize,
          currentHeightOrWidth,
        );
      }
      stackMetricsEntry.start = currentYPosition;
      stackMetricsEntry.placed += stackedItemSize;
      currentYPosition = boxElement.bottom;
    } else {
      const calculatedSize = positionData.h * stackWeightRatio;
      const currentStartPosition = stackMetricsEntry.size || boxElement.width;
      if (canvasContext(stackMetricsEntry.start)) {
        currentStartX = stackMetricsEntry.start;
      }
      if (boxElement.fullSize) {
        setBoundingBox(
          boxElement,
          currentStartX,
          __paddingValues.top,
          currentStartPosition,
          paddingConfig.outerHeight -
            __paddingValues.bottom -
            __paddingValues.top,
        );
      } else {
        setBoundingBox(
          boxElement,
          currentStartX,
          positionData.top + stackMetricsEntry.placed,
          currentStartPosition,
          calculatedSize,
        );
      }
      stackMetricsEntry.start = currentStartX;
      stackMetricsEntry.placed += calculatedSize;
      currentStartX = boxElement.right;
    }
  }
  positionData.x = currentStartX;
  positionData.y = currentYPosition;
}
var ___________animationIndex = {
  addBox(boxContainer, boxOptions) {
    boxContainer.boxes ||= [];
    boxOptions.fullSize = boxOptions.fullSize || false;
    boxOptions.position = boxOptions.position || "top";
    boxOptions.weight = boxOptions.weight || 0;
    boxOptions._layers =
      boxOptions._layers ||
      function () {
        return [
          {
            z: 0,
            draw(drawTime) {
              boxOptions.draw(drawTime);
            },
          },
        ];
      };
    boxContainer.boxes.push(boxOptions);
  },
  removeBox(_boxContainer, boxToRemove) {
    const boxIndex = _boxContainer.boxes
      ? _boxContainer.boxes.indexOf(boxToRemove)
      : -1;
    if (boxIndex !== -1) {
      _boxContainer.boxes.splice(boxIndex, 1);
    }
  },
  configure(configurationObject, elementConfig, _inputConfig) {
    elementConfig.fullSize = _inputConfig.fullSize;
    elementConfig.position = _inputConfig.position;
    elementConfig.weight = _inputConfig.weight;
  },
  update(chart, outerWidth, availableHeight, layoutData) {
    if (!chart) {
      return;
    }
    const layoutPadding = __animationElement(chart.options.layout.padding);
    const availableWidth = Math.max(outerWidth - layoutPadding.width, 0);
    const _availableHeight = Math.max(
      availableHeight - layoutPadding.height,
      0,
    );
    const boxLayout = processInputData(chart.boxes);
    const verticalBoxes = boxLayout.vertical;
    const horizontalBoxes = boxLayout.horizontal;
    __lastDateUpdated(chart.boxes, (_layoutContext) => {
      if (typeof _layoutContext.beforeLayout == "function") {
        _layoutContext.beforeLayout();
      }
    });
    const visibleBoxCount =
      verticalBoxes.reduce(
        (__________________________________currentIndex, _boxOptions) =>
          _boxOptions.box.options && _boxOptions.box.options.display === false
            ? __________________________________currentIndex
            : __________________________________currentIndex + 1,
        0,
      ) || 1;
    const layoutDimensions = Object.freeze({
      outerWidth: outerWidth,
      outerHeight: availableHeight,
      padding: layoutPadding,
      availableWidth: availableWidth,
      availableHeight: _availableHeight,
      vBoxMaxWidth: availableWidth / 2 / visibleBoxCount,
      hBoxMaxHeight: _availableHeight / 2,
    });
    const paddingCopy = Object.assign({}, layoutPadding);
    _____boundingBox(paddingCopy, __animationElement(layoutData));
    const layoutDimensionsAndPosition = Object.assign(
      {
        maxPadding: paddingCopy,
        w: availableWidth,
        h: _availableHeight,
        x: layoutPadding.left,
        y: layoutPadding.top,
      },
      layoutPadding,
    );
    const layoutPositionData = calculateBoxDimensions(
      verticalBoxes.concat(horizontalBoxes),
      layoutDimensions,
    );
    processDimensions(
      boxLayout.fullSize,
      layoutDimensionsAndPosition,
      layoutDimensions,
      layoutPositionData,
    );
    processDimensions(
      verticalBoxes,
      layoutDimensionsAndPosition,
      layoutDimensions,
      layoutPositionData,
    );
    if (
      processDimensions(
        horizontalBoxes,
        layoutDimensionsAndPosition,
        layoutDimensions,
        layoutPositionData,
      )
    ) {
      processDimensions(
        verticalBoxes,
        layoutDimensionsAndPosition,
        layoutDimensions,
        layoutPositionData,
      );
    }
    adjustPadding(layoutDimensionsAndPosition);
    layoutItems(
      boxLayout.leftAndTop,
      layoutDimensionsAndPosition,
      layoutDimensions,
      layoutPositionData,
    );
    layoutDimensionsAndPosition.x += layoutDimensionsAndPosition.w;
    layoutDimensionsAndPosition.y += layoutDimensionsAndPosition.h;
    layoutItems(
      boxLayout.rightAndBottom,
      layoutDimensionsAndPosition,
      layoutDimensions,
      layoutPositionData,
    );
    chart.chartArea = {
      left: layoutDimensionsAndPosition.left,
      top: layoutDimensionsAndPosition.top,
      right: layoutDimensionsAndPosition.left + layoutDimensionsAndPosition.w,
      bottom: layoutDimensionsAndPosition.top + layoutDimensionsAndPosition.h,
      height: layoutDimensionsAndPosition.h,
      width: layoutDimensionsAndPosition.w,
    };
    __lastDateUpdated(boxLayout.chartArea, (_____event) => {
      const chartBox = _____event.box;
      Object.assign(chartBox, chart.chartArea);
      chartBox.update(
        layoutDimensionsAndPosition.w,
        layoutDimensionsAndPosition.h,
        {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        },
      );
    });
  },
};
class DeviceInteraction {
  acquireContext(contextToAcquire, __eventObject) {}
  releaseContext(releaseInfo) {
    return false;
  }
  addEventListener(
    _________eventType,
    _________eventHandler,
    __eventListenerOptions,
  ) {}
  removeEventListener(
    ________eventType,
    ________eventHandler,
    _eventListenerOptions,
  ) {}
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(elementSize, maxWidth, heightFallback, aspectRatio) {
    maxWidth = Math.max(0, maxWidth || elementSize.width);
    heightFallback = heightFallback || elementSize.height;
    return {
      width: maxWidth,
      height: Math.max(
        0,
        aspectRatio ? Math.floor(maxWidth / aspectRatio) : heightFallback,
      ),
    };
  }
  isAttached(_elementId) {
    return true;
  }
  updateConfig(configUpdates) {}
}
class canvas2DContext extends DeviceInteraction {
  acquireContext(______canvasElement) {
    return (
      (______canvasElement &&
        ______canvasElement.getContext &&
        ______canvasElement.getContext("2d")) ||
      null
    );
  }
  updateConfig(_config) {
    _config.options.animation = false;
  }
}
const _____animationController = "$chartjs";
const ___animationHandler = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout",
};
const lastUpdateTimestamp = (________________inputValue) =>
  ________________inputValue === null || ________________inputValue === "";
function updateElementDimensions(element, updatedWidth) {
  const elementStyle = element.style;
  const _currentHeight = element.getAttribute("height");
  const currentElementWidth = element.getAttribute("width");
  element[_____animationController] = {
    initial: {
      height: _currentHeight,
      width: currentElementWidth,
      style: {
        display: elementStyle.display,
        height: elementStyle.height,
        width: elementStyle.width,
      },
    },
  };
  elementStyle.display = elementStyle.display || "block";
  elementStyle.boxSizing = elementStyle.boxSizing || "border-box";
  if (lastUpdateTimestamp(currentElementWidth)) {
    const chartAnimationIdWidth = chartAnimationId(element, "width");
    if (chartAnimationIdWidth !== undefined) {
      element.width = chartAnimationIdWidth;
    }
  }
  if (lastUpdateTimestamp(_currentHeight)) {
    if (element.style.height === "") {
      element.height = element.width / (updatedWidth || 2);
    } else {
      const _updatedWidth = chartAnimationId(element, "height");
      if (_updatedWidth !== undefined) {
        element.height = _updatedWidth;
      }
    }
  }
  return element;
}
const ______animationController = !!_notificationFunction && {
  passive: true,
};
function addEventListenerToTarget(
  eventTarget,
  ____eventType,
  _____eventHandler,
) {
  eventTarget.addEventListener(
    ____eventType,
    _____eventHandler,
    ______animationController,
  );
}
function removeCanvasEventListener(
  ___canvasElement,
  ___eventType,
  ____eventHandler,
) {
  ___canvasElement.canvas.removeEventListener(
    ___eventType,
    ____eventHandler,
    ______animationController,
  );
}
function ___________eventHandler(_eventData, ___________________chartData) {
  const _____________eventType =
    ___animationHandler[_eventData.type] || _eventData.type;
  const { x: lastUpdatedX, y: lastYValue } = lastDateUpdated(
    _eventData,
    ___________________chartData,
  );
  return {
    type: _____________eventType,
    chart: ___________________chartData,
    native: _eventData,
    x: lastUpdatedX !== undefined ? lastUpdatedX : null,
    y: lastYValue !== undefined ? lastYValue : null,
  };
}
function isElementPresent(_itemsArray, elementToFind) {
  for (const ______item of _itemsArray) {
    if (______item === elementToFind || ______item.contains(elementToFind)) {
      return true;
    }
  }
}
function createMutationObserver(
  __canvasElement,
  isCanvasUpdated,
  _callbackFunction,
) {
  const ____canvasElement = __canvasElement.canvas;
  const mutationObserver = new MutationObserver((nodeList) => {
    let isNodeStateValid = false;
    for (const nodeIterator of nodeList) {
      isNodeStateValid =
        isNodeStateValid ||
        isElementPresent(nodeIterator.addedNodes, ____canvasElement);
      isNodeStateValid =
        isNodeStateValid &&
        !isElementPresent(nodeIterator.removedNodes, ____canvasElement);
    }
    if (isNodeStateValid) {
      _callbackFunction();
    }
  });
  mutationObserver.observe(document, {
    childList: true,
    subtree: true,
  });
  return mutationObserver;
}
function setupMutationObserver(
  mutationObserverConfig,
  isCanvasRemoved,
  __callbackFunction,
) {
  const _____canvasElement = mutationObserverConfig.canvas;
  const _mutationObserver = new MutationObserver((nodeMutations) => {
    let isElementDeleted = false;
    for (const nodeMutation of nodeMutations) {
      isElementDeleted =
        isElementDeleted ||
        isElementPresent(nodeMutation.removedNodes, _____canvasElement);
      isElementDeleted =
        isElementDeleted &&
        !isElementPresent(nodeMutation.addedNodes, _____canvasElement);
    }
    if (isElementDeleted) {
      __callbackFunction();
    }
  });
  _mutationObserver.observe(document, {
    childList: true,
    subtree: true,
  });
  return _mutationObserver;
}
const ____animationManager = new Map();
let activeChart = 0;
function updateActiveChartOnDeviceChange() {
  const currentDevicePixelRatio = window.devicePixelRatio;
  if (currentDevicePixelRatio !== activeChart) {
    activeChart = currentDevicePixelRatio;
    ____animationManager.forEach((executeOnDeviceChange, _callbackIndex) => {
      if (_callbackIndex.currentDevicePixelRatio !== currentDevicePixelRatio) {
        executeOnDeviceChange();
      }
    });
  }
}
function handleAnimation(__animationKey, __animationProperties) {
  if (!____animationManager.size) {
    window.addEventListener("resize", updateActiveChartOnDeviceChange);
  }
  ____animationManager.set(__animationKey, __animationProperties);
}
function removeAnimationById(animationId) {
  ____animationManager.delete(animationId);
  if (!____animationManager.size) {
    window.removeEventListener("resize", updateActiveChartOnDeviceChange);
  }
}
function resizeObserverCallback(
  canvasElement,
  resizeObserverEntry,
  resizeHandler,
) {
  const canvasElementReference = canvasElement.canvas;
  const ________requestAnimationFrameId =
    canvasElementReference &&
    requestAnimationFrameUniqueId(canvasElementReference);
  if (!________requestAnimationFrameId) {
    return;
  }
  const requestAnimationFrameCallback = _____requestAnimationFrameId(
    (_eventTarget, ________________event) => {
      const clientWidth = ________requestAnimationFrameId.clientWidth;
      resizeHandler(_eventTarget, ________________event);
      if (clientWidth < ________requestAnimationFrameId.clientWidth) {
        resizeHandler();
      }
    },
    window,
  );
  const resizeObserver = new ResizeObserver((resizeObserverEntries) => {
    const elementEntry = resizeObserverEntries[0];
    const contentRectWidth = elementEntry.contentRect.width;
    const contentRectHeight = elementEntry.contentRect.height;
    if (contentRectWidth !== 0 || contentRectHeight !== 0) {
      requestAnimationFrameCallback(contentRectWidth, contentRectHeight);
    }
  });
  resizeObserver.observe(________requestAnimationFrameId);
  handleAnimation(canvasElement, requestAnimationFrameCallback);
  return resizeObserver;
}
function uiHandler(uiElement, __eventType, connectionInstance) {
  if (connectionInstance) {
    connectionInstance.disconnect();
  }
  if (__eventType === "resize") {
    removeAnimationById(uiElement);
  }
}
function initializeCanvasAnimation(
  ______________canvasContext,
  _________event,
  _eventHandler,
) {
  const _______canvasElement = ______________canvasContext.canvas;
  const _______animationFrameId = _____requestAnimationFrameId(
    (__________________event) => {
      if (______________canvasContext.ctx !== null) {
        _eventHandler(
          ___________eventHandler(
            __________________event,
            ______________canvasContext,
          ),
        );
      }
    },
    ______________canvasContext,
  );
  addEventListenerToTarget(
    _______canvasElement,
    _________event,
    _______animationFrameId,
  );
  return _______animationFrameId;
}
class CanvasInteraction extends DeviceInteraction {
  acquireContext(__________canvasElement, ___________canvasElement) {
    const _canvas2DContext =
      __________canvasElement &&
      __________canvasElement.getContext &&
      __________canvasElement.getContext("2d");
    if (
      _canvas2DContext &&
      _canvas2DContext.canvas === __________canvasElement
    ) {
      updateElementDimensions(
        __________canvasElement,
        ___________canvasElement,
      );
      return _canvas2DContext;
    } else {
      return null;
    }
  }
  releaseContext(________canvasElement) {
    const _________canvasElement = ________canvasElement.canvas;
    if (!_________canvasElement[_____animationController]) {
      return false;
    }
    const animationControllerInitialValues =
      _________canvasElement[_____animationController].initial;
    ["height", "width"].forEach((attributeKey) => {
      const valueAtIndex = animationControllerInitialValues[attributeKey];
      if (chartUpdateInterval(valueAtIndex)) {
        _________canvasElement.removeAttribute(attributeKey);
      } else {
        _________canvasElement.setAttribute(attributeKey, valueAtIndex);
      }
    });
    const initialStyles = animationControllerInitialValues.style || {};
    Object.keys(initialStyles).forEach((styleProperty) => {
      _________canvasElement.style[styleProperty] =
        initialStyles[styleProperty];
    });
    _________canvasElement.width = _________canvasElement.width;
    delete _________canvasElement[_____animationController];
    return true;
  }
  addEventListener(
    ___________eventType,
    ____________eventType,
    __________options,
  ) {
    this.removeEventListener(___________eventType, ____________eventType);
    const proxies = (___________eventType.$proxies ||= {});
    const eventHandlerFunction =
      {
        attach: createMutationObserver,
        detach: setupMutationObserver,
        resize: resizeObserverCallback,
      }[____________eventType] || initializeCanvasAnimation;
    proxies[____________eventType] = eventHandlerFunction(
      ___________eventType,
      ____________eventType,
      __________options,
    );
  }
  removeEventListener(_________targetElement, __________eventType) {
    const eventProxies = (_________targetElement.$proxies ||= {});
    const __________eventHandler = eventProxies[__________eventType];
    if (!__________eventHandler) {
      return;
    }
    (
      ({
        attach: uiHandler,
        detach: uiHandler,
        resize: uiHandler,
      })[__________eventType] || removeCanvasEventListener
    )(_________targetElement, __________eventType, __________eventHandler);
    eventProxies[__________eventType] = undefined;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(
    animationInput,
    _______________element,
    ______animationIndex,
    __scaleFactor,
  ) {
    return _____animationIndex(
      animationInput,
      _______________element,
      ______animationIndex,
      __scaleFactor,
    );
  }
  isAttached(____animationFrameId) {
    const _____animationFrameId =
      requestAnimationFrameUniqueId(____animationFrameId);
    return !!_____animationFrameId && !!_____animationFrameId.isConnected;
  }
}
function getCanvasContext(canvasObject) {
  if (
    !_________animationManager() ||
    (typeof OffscreenCanvas != "undefined" &&
      canvasObject instanceof OffscreenCanvas)
  ) {
    return canvas2DContext;
  } else {
    return CanvasInteraction;
  }
}
class _AnimationController {
  static defaults = {};
  static defaultRoutes = undefined;
  x;
  y;
  active = false;
  options;
  $animations;
  tooltipPosition(______tooltipData) {
    const { x: tooltipXPosition, y: tooltipYPosition } = this.getProps(
      ["x", "y"],
      ______tooltipData,
    );
    return {
      x: tooltipXPosition,
      y: tooltipYPosition,
    };
  }
  hasValue() {
    return requestId(this.x) && requestId(this.y);
  }
  getProps(timeIndices, animationProps) {
    const animationsMap = this.$animations;
    if (!animationProps || !animationsMap) {
      return this;
    }
    const animationStates = {};
    timeIndices.forEach((timeIndex) => {
      animationStates[timeIndex] =
        animationsMap[timeIndex] && animationsMap[timeIndex].active()
          ? animationsMap[timeIndex]._to
          : this[timeIndex];
    });
    return animationStates;
  }
}
function calculateChartTicks(_____chartData, ______chartData) {
  const tickOptions = _____chartData.options.ticks;
  const __tickCount = calculateTickCount(_____chartData);
  const maxTicksLimit = Math.min(
    tickOptions.maxTicksLimit || __tickCount,
    __tickCount,
  );
  const majorTickIndices = tickOptions.major.enabled
    ? findMajorIndices(______chartData)
    : [];
  const majorIndicesCount = majorTickIndices.length;
  const firstMajorIndex = majorTickIndices[0];
  const lastMajorIndex = majorTickIndices[majorIndicesCount - 1];
  const tickIndices = [];
  if (majorIndicesCount > maxTicksLimit) {
    targetStep(
      ______chartData,
      tickIndices,
      majorTickIndices,
      majorIndicesCount / maxTicksLimit,
    );
    return tickIndices;
  }
  const sequenceMaxValue = calculateSequenceMax(
    majorTickIndices,
    ______chartData,
    maxTicksLimit,
  );
  if (majorIndicesCount > 0) {
    let _______________________________________currentIndex;
    let __tickOptions;
    const ___tickCount =
      majorIndicesCount > 1
        ? Math.round(
            (lastMajorIndex - firstMajorIndex) / (majorIndicesCount - 1),
          )
        : null;
    calculateAnimationIndex(
      ______chartData,
      tickIndices,
      sequenceMaxValue,
      chartUpdateInterval(___tickCount) ? 0 : firstMajorIndex - ___tickCount,
      firstMajorIndex,
    );
    _______________________________________currentIndex = 0;
    __tickOptions = majorIndicesCount - 1;
    for (
      ;
      _______________________________________currentIndex < __tickOptions;
      _______________________________________currentIndex++
    ) {
      calculateAnimationIndex(
        ______chartData,
        tickIndices,
        sequenceMaxValue,
        majorTickIndices[_______________________________________currentIndex],
        majorTickIndices[
          _______________________________________currentIndex + 1
        ],
      );
    }
    calculateAnimationIndex(
      ______chartData,
      tickIndices,
      sequenceMaxValue,
      lastMajorIndex,
      chartUpdateInterval(___tickCount)
        ? ______chartData.length
        : lastMajorIndex + ___tickCount,
    );
    return tickIndices;
  }
  calculateAnimationIndex(______chartData, tickIndices, sequenceMaxValue);
  return tickIndices;
}
function calculateTickCount(chartDimension) {
  const ____offsetValue = chartDimension.options.offset;
  const tickSize = chartDimension._tickSize();
  const _tickCount =
    chartDimension._length / tickSize + (____offsetValue ? 0 : 1);
  const maxTicksCount = chartDimension._maxLength / tickSize;
  return Math.floor(Math.min(_tickCount, maxTicksCount));
}
function calculateSequenceMax(__inputValue, sequenceLength, _segmentLength) {
  const hasConstantDifference = isConstantDifference(__inputValue);
  const numberOfSegments = sequenceLength.length / _segmentLength;
  if (!hasConstantDifference) {
    return Math.max(numberOfSegments, 1);
  }
  const currentFrameTimestamps = _currentFrameTimestamp(hasConstantDifference);
  for (
    let ________________________________________________________currentIndex = 0,
      _____lastIndex = currentFrameTimestamps.length - 1;
    ________________________________________________________currentIndex <
    _____lastIndex;
    ________________________________________________________currentIndex++
  ) {
    const ___lastIndex =
      currentFrameTimestamps[
        ________________________________________________________currentIndex
      ];
    if (___lastIndex > numberOfSegments) {
      return ___lastIndex;
    }
  }
  return Math.max(numberOfSegments, 1);
}
function findMajorIndices(__________inputArray) {
  const majorIndices = [];
  let _____________________________________________currentIndex;
  let ____inputArrayLength;
  _____________________________________________currentIndex = 0;
  ____inputArrayLength = __________inputArray.length;
  for (
    ;
    _____________________________________________currentIndex <
    ____inputArrayLength;
    _____________________________________________currentIndex++
  ) {
    if (
      __________inputArray[
        _____________________________________________currentIndex
      ].major
    ) {
      majorIndices.push(
        _____________________________________________currentIndex,
      );
    }
  }
  return majorIndices;
}
function targetStep(
  _________inputArray,
  extractedElements,
  indexThreshold,
  stepIndex,
) {
  let currentInputIndex;
  let ____________________________currentIndex = 0;
  let currentIndexThreshold = indexThreshold[0];
  stepIndex = Math.ceil(stepIndex);
  currentInputIndex = 0;
  for (; currentInputIndex < _________inputArray.length; currentInputIndex++) {
    if (currentInputIndex === currentIndexThreshold) {
      extractedElements.push(_________inputArray[currentInputIndex]);
      ____________________________currentIndex++;
      currentIndexThreshold =
        indexThreshold[____________________________currentIndex * stepIndex];
    }
  }
}
function calculateAnimationIndex(
  __inputArray,
  outputArray,
  intervalSize,
  animationStartIndex,
  animationFrameIndex,
) {
  const startingAnimationIndex = chartAnimationRunning(animationStartIndex, 0);
  const maxAnimationFrameIndex = Math.min(
    chartAnimationRunning(animationFrameIndex, __inputArray.length),
    __inputArray.length,
  );
  let ________animationDuration;
  let ___animationIndex;
  let animationCurrentStep;
  let animationStepCount = 0;
  intervalSize = Math.ceil(intervalSize);
  if (animationFrameIndex) {
    ________animationDuration = animationFrameIndex - animationStartIndex;
    intervalSize =
      ________animationDuration /
      Math.floor(________animationDuration / intervalSize);
  }
  animationCurrentStep = startingAnimationIndex;
  while (animationCurrentStep < 0) {
    animationStepCount++;
    animationCurrentStep = Math.round(
      startingAnimationIndex + animationStepCount * intervalSize,
    );
  }
  for (
    ___animationIndex = Math.max(startingAnimationIndex, 0);
    ___animationIndex < maxAnimationFrameIndex;
    ___animationIndex++
  ) {
    if (___animationIndex === animationCurrentStep) {
      outputArray.push(__inputArray[___animationIndex]);
      animationStepCount++;
      animationCurrentStep = Math.round(
        startingAnimationIndex + animationStepCount * intervalSize,
      );
    }
  }
}
function isConstantDifference(________inputArray) {
  const ___inputArrayLength = ________inputArray.length;
  let __________________________________________currentIndex;
  let initialDifference;
  if (___inputArrayLength < 2) {
    return false;
  }
  initialDifference = ________inputArray[0];
  __________________________________________currentIndex = 1;
  for (
    ;
    __________________________________________currentIndex <
    ___inputArrayLength;
    ++__________________________________________currentIndex
  ) {
    if (
      ________inputArray[
        __________________________________________currentIndex
      ] -
        ________inputArray[
          __________________________________________currentIndex - 1
        ] !==
      initialDifference
    ) {
      return false;
    }
  }
  return initialDifference;
}
const _animationTask = (directionToggle) =>
  directionToggle === "left"
    ? "right"
    : directionToggle === "right"
      ? "left"
      : directionToggle;
const listenerMap = (_positionAdjustment, __position, _____offsetValue) =>
  __position === "top" || __position === "left"
    ? _positionAdjustment[__position] + _____offsetValue
    : _positionAdjustment[__position] - _____offsetValue;
const _animationRequestId = (minimumValue, optionalValue) =>
  Math.min(optionalValue || minimumValue, minimumValue);
function arraySliceByStep(sourceArray, _numSegments) {
  const slicedArrayElements = [];
  const segmentSize = sourceArray.length / _numSegments;
  const totalElements = sourceArray.length;
  let ____________________________________________currentIndex = 0;
  for (
    ;
    ____________________________________________currentIndex < totalElements;
    ____________________________________________currentIndex += segmentSize
  ) {
    slicedArrayElements.push(
      sourceArray[
        Math.floor(____________________________________________currentIndex)
      ],
    );
  }
  return slicedArrayElements;
}
function calculateTickPosition(tickData, _tickIndex, __tickIndex) {
  const totalTickCount = tickData.ticks.length;
  const validTickIndex = Math.min(_tickIndex, totalTickCount - 1);
  const startPixel = tickData._startPixel;
  const endPixel = tickData._endPixel;
  const tolerance = 0.000001;
  let tickPositionAdjustment;
  let currentTickPosition = tickData.getPixelForTick(validTickIndex);
  if (
    !__tickIndex ||
    !((tickPositionAdjustment =
      totalTickCount === 1
        ? Math.max(
            currentTickPosition - startPixel,
            endPixel - currentTickPosition,
          )
        : _tickIndex === 0
          ? (tickData.getPixelForTick(1) - currentTickPosition) / 2
          : (currentTickPosition -
              tickData.getPixelForTick(validTickIndex - 1)) /
            2),
    (currentTickPosition +=
      validTickIndex < _tickIndex
        ? tickPositionAdjustment
        : -tickPositionAdjustment),
    currentTickPosition < startPixel - tolerance ||
      currentTickPosition > endPixel + tolerance)
  ) {
    return currentTickPosition;
  }
}
function handleDataCleanup(__dataObject, _threshold) {
  __lastDateUpdated(__dataObject, (gcData) => {
    const gcArray = gcData.gc;
    const halfLengthOfGc = gcArray.length / 2;
    let _____________________________________________index;
    if (halfLengthOfGc > _threshold) {
      for (
        _____________________________________________index = 0;
        _____________________________________________index < halfLengthOfGc;
        ++_____________________________________________index
      ) {
        delete gcData.data[
          gcArray[_____________________________________________index]
        ];
      }
      gcArray.splice(0, halfLengthOfGc);
    }
  });
}
function getTickLength(lineStyle) {
  if (lineStyle.drawTicks) {
    return lineStyle.tickLength;
  } else {
    return 0;
  }
}
function calculateChartSize(_____chartOptions, fontElement) {
  if (!_____chartOptions.display) {
    return 0;
  }
  const animationFrameResult = requestAnimationFrame(
    _____chartOptions.font,
    fontElement,
  );
  const __paddingAdjustment = __animationElement(_____chartOptions.padding);
  return (
    (animatedChartItems(_____chartOptions.text)
      ? _____chartOptions.text.length
      : 1) *
      animationFrameResult.lineHeight +
    __paddingAdjustment.height
  );
}
function __tooltipHandlerFunction(_____tooltipData, _scaleValue) {
  return tooltipHandler(_____tooltipData, {
    scale: _scaleValue,
    type: "scale",
  });
}
function _____tooltipHandler(__tooltipElement, ___tickIndex, _tickValue) {
  return tooltipHandler(__tooltipElement, {
    tick: _tickValue,
    index: ___tickIndex,
    type: "tick",
  });
}
function animatedTarget(
  targetAnimation,
  animationDirection,
  isAnimationTriggered,
) {
  let animatedTargetResult = animationTarget(targetAnimation);
  if (
    (isAnimationTriggered && animationDirection !== "right") ||
    (!isAnimationTriggered && animationDirection === "right")
  ) {
    animatedTargetResult = _animationTask(animatedTargetResult);
  }
  return animatedTargetResult;
}
function calculateChartPositions(
  chartDimensions,
  offsetValue,
  animationIndex,
  animationValue,
) {
  const {
    top: chartTop,
    left: leftOffset,
    bottom: chartBottomPosition,
    right: rightBoundary,
    chart: ____________________________chartData,
  } = chartDimensions;
  const { chartArea: chartAreaDimensions, scales: chartScales } =
    ____________________________chartData;
  let maxChartWidth;
  let calculatedPosition;
  let titleYPosition;
  let rotationTimestamp = 0;
  const chartHeight = chartBottomPosition - chartTop;
  const _chartWidth = rightBoundary - leftOffset;
  if (chartDimensions.isHorizontal()) {
    calculatedPosition = animationQueue(
      animationValue,
      leftOffset,
      rightBoundary,
    );
    if (currentAnimationIndex(animationIndex)) {
      const _chartDimensions = Object.keys(animationIndex)[0];
      const _animationValue = animationIndex[_chartDimensions];
      titleYPosition =
        chartScales[_chartDimensions].getPixelForValue(_animationValue) +
        chartHeight -
        offsetValue;
    } else {
      if (animationIndex === "center") {
        titleYPosition =
          (chartAreaDimensions.bottom + chartAreaDimensions.top) / 2 +
          chartHeight -
          offsetValue;
      } else {
        titleYPosition = listenerMap(
          chartDimensions,
          animationIndex,
          offsetValue,
        );
      }
    }
    maxChartWidth = rightBoundary - leftOffset;
  } else {
    if (currentAnimationIndex(animationIndex)) {
      const __chartDimensions = Object.keys(animationIndex)[0];
      const __animationValue = animationIndex[__chartDimensions];
      calculatedPosition =
        chartScales[__chartDimensions].getPixelForValue(__animationValue) -
        _chartWidth +
        offsetValue;
    } else {
      if (animationIndex === "center") {
        calculatedPosition =
          (chartAreaDimensions.left + chartAreaDimensions.right) / 2 -
          _chartWidth +
          offsetValue;
      } else {
        calculatedPosition = listenerMap(
          chartDimensions,
          animationIndex,
          offsetValue,
        );
      }
    }
    titleYPosition = animationQueue(
      animationValue,
      chartBottomPosition,
      chartTop,
    );
    if (animationIndex === "left") {
      rotationTimestamp = -currentFrameTimestamp;
    } else {
      rotationTimestamp = currentFrameTimestamp;
    }
  }
  return {
    titleX: calculatedPosition,
    titleY: titleYPosition,
    maxWidth: maxChartWidth,
    rotation: rotationTimestamp,
  };
}
class ChartAxisController extends _AnimationController {
  constructor(_______________chartConfig) {
    super();
    this.id = _______________chartConfig.id;
    this.type = _______________chartConfig.type;
    this.options = undefined;
    this.ctx = _______________chartConfig.ctx;
    this.chart = _______________chartConfig.chart;
    this.top = undefined;
    this.bottom = undefined;
    this.left = undefined;
    this.right = undefined;
    this.width = undefined;
    this.height = undefined;
    this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };
    this.maxWidth = undefined;
    this.maxHeight = undefined;
    this.paddingTop = undefined;
    this.paddingBottom = undefined;
    this.paddingLeft = undefined;
    this.paddingRight = undefined;
    this.axis = undefined;
    this.labelRotation = undefined;
    this.min = undefined;
    this.max = undefined;
    this._range = undefined;
    this.ticks = [];
    this._gridLineItems = null;
    this._labelItems = null;
    this._labelSizes = null;
    this._length = 0;
    this._maxLength = 0;
    this._longestTextCache = {};
    this._startPixel = undefined;
    this._endPixel = undefined;
    this._reversePixels = false;
    this._userMax = undefined;
    this._userMin = undefined;
    this._suggestedMax = undefined;
    this._suggestedMin = undefined;
    this._ticksLength = 0;
    this._borderValue = 0;
    this._cache = {};
    this._dataLimitsCached = false;
    this.$context = undefined;
  }
  init(________chartConfig) {
    this.options = ________chartConfig.setContext(this.getContext());
    this.axis = ________chartConfig.axis;
    this._userMin = this.parse(________chartConfig.min);
    this._userMax = this.parse(________chartConfig.max);
    this._suggestedMin = this.parse(________chartConfig.suggestedMin);
    this._suggestedMax = this.parse(________chartConfig.suggestedMax);
  }
  parse(__________________inputValue, ______________element) {
    return __________________inputValue;
  }
  getUserBounds() {
    let {
      _userMin: userMin,
      _userMax: userMax,
      _suggestedMin: suggestedMin,
      _suggestedMax: suggestedMax,
    } = this;
    userMin = __tooltipHandler(userMin, Number.POSITIVE_INFINITY);
    userMax = __tooltipHandler(userMax, Number.NEGATIVE_INFINITY);
    suggestedMin = __tooltipHandler(suggestedMin, Number.POSITIVE_INFINITY);
    suggestedMax = __tooltipHandler(suggestedMax, Number.NEGATIVE_INFINITY);
    return {
      min: __tooltipHandler(userMin, suggestedMin),
      max: __tooltipHandler(userMax, suggestedMax),
      minDefined: chartUpdateTrigger(userMin),
      maxDefined: chartUpdateTrigger(userMax),
    };
  }
  getMinMax(_________currentValue) {
    let visibleMetaMinMax;
    let {
      min: __________minValue,
      max: __________maxValue,
      minDefined: isMinMaxNotCalculated,
      maxDefined: isMaxValueCalculated,
    } = this.getUserBounds();
    if (isMinMaxNotCalculated && isMaxValueCalculated) {
      return {
        min: __________minValue,
        max: __________maxValue,
      };
    }
    const matchingVisibleMetaControllers = this.getMatchingVisibleMetas();
    for (
      let ______________index = 0,
        _arrayLength = matchingVisibleMetaControllers.length;
      ______________index < _arrayLength;
      ++______________index
    ) {
      visibleMetaMinMax = matchingVisibleMetaControllers[
        ______________index
      ].controller.getMinMax(this, _________currentValue);
      if (!isMinMaxNotCalculated) {
        __________minValue = Math.min(
          __________minValue,
          visibleMetaMinMax.min,
        );
      }
      if (!isMaxValueCalculated) {
        __________maxValue = Math.max(
          __________maxValue,
          visibleMetaMinMax.max,
        );
      }
    }
    if (isMaxValueCalculated && __________minValue > __________maxValue) {
      __________minValue = __________maxValue;
    } else {
      __________minValue = __________minValue;
    }
    if (isMinMaxNotCalculated && __________minValue > __________maxValue) {
      __________maxValue = __________minValue;
    } else {
      __________maxValue = __________maxValue;
    }
    return {
      min: __tooltipHandler(
        __________minValue,
        __tooltipHandler(__________maxValue, __________minValue),
      ),
      max: __tooltipHandler(
        __________maxValue,
        __tooltipHandler(__________minValue, __________maxValue),
      ),
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0,
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const ______________________________chartData = this.chart.data;
    return (
      this.options.labels ||
      (this.isHorizontal()
        ? ______________________________chartData.xLabels
        : ______________________________chartData.yLabels) ||
      ______________________________chartData.labels ||
      []
    );
  }
  getLabelItems(__chartArea = this.chart.chartArea) {
    return (this._labelItems ||= this._computeLabelItems(__chartArea));
  }
  beforeLayout() {
    this._cache = {};
    this._dataLimitsCached = false;
  }
  beforeUpdate() {
    ________animationContext(this.options.beforeUpdate, [this]);
  }
  update(_maxChartWidth, maxHeight, _margins) {
    const {
      beginAtZero: __beginAtZero,
      grace: graceValue,
      ticks: ___________tickOptions,
    } = this.options;
    const _sampleSize = ___________tickOptions.sampleSize;
    this.beforeUpdate();
    this.maxWidth = _maxChartWidth;
    this.maxHeight = maxHeight;
    this._margins = _margins = Object.assign(
      {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      _margins,
    );
    this.ticks = null;
    this._labelSizes = null;
    this._gridLineItems = null;
    this._labelItems = null;
    this.beforeSetDimensions();
    this.setDimensions();
    this.afterSetDimensions();
    this._maxLength = this.isHorizontal()
      ? this.width + _margins.left + _margins.right
      : this.height + _margins.top + _margins.bottom;
    if (!this._dataLimitsCached) {
      this.beforeDataLimits();
      this.determineDataLimits();
      this.afterDataLimits();
      this._range = _______requestAnimationFrameId(
        this,
        graceValue,
        __beginAtZero,
      );
      this._dataLimitsCached = true;
    }
    this.beforeBuildTicks();
    this.ticks = this.buildTicks() || [];
    this.afterBuildTicks();
    const isSampleSizeLessThanTicks = _sampleSize < this.ticks.length;
    this._convertTicksToLabels(
      isSampleSizeLessThanTicks
        ? arraySliceByStep(this.ticks, _sampleSize)
        : this.ticks,
    );
    this.configure();
    this.beforeCalculateLabelRotation();
    this.calculateLabelRotation();
    this.afterCalculateLabelRotation();
    if (
      ___________tickOptions.display &&
      (___________tickOptions.autoSkip ||
        ___________tickOptions.source === "auto")
    ) {
      this.ticks = calculateChartTicks(this, this.ticks);
      this._labelSizes = null;
      this.afterAutoSkip();
    }
    if (isSampleSizeLessThanTicks) {
      this._convertTicksToLabels(this.ticks);
    }
    this.beforeFit();
    this.fit();
    this.afterFit();
    this.afterUpdate();
  }
  configure() {
    let _startPixel;
    let _endPixel;
    let isReverse = this.options.reverse;
    if (this.isHorizontal()) {
      _startPixel = this.left;
      _endPixel = this.right;
    } else {
      _startPixel = this.top;
      _endPixel = this.bottom;
      isReverse = !isReverse;
    }
    this._startPixel = _startPixel;
    this._endPixel = _endPixel;
    this._reversePixels = isReverse;
    this._length = _endPixel - _startPixel;
    this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    ________animationContext(this.options.afterUpdate, [this]);
  }
  beforeSetDimensions() {
    ________animationContext(this.options.beforeSetDimensions, [this]);
  }
  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = 0;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = 0;
      this.bottom = this.height;
    }
    this.paddingLeft = 0;
    this.paddingTop = 0;
    this.paddingRight = 0;
    this.paddingBottom = 0;
  }
  afterSetDimensions() {
    ________animationContext(this.options.afterSetDimensions, [this]);
  }
  _callHooks(hookEventType) {
    this.chart.notifyPlugins(hookEventType, this.getContext());
    ________animationContext(this.options[hookEventType], [this]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {}
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    ________animationContext(this.options.beforeTickToLabelConversion, [this]);
  }
  generateTickLabels(tickValues) {
    const ___tickOptions = this.options.ticks;
    let ______________________________________index;
    let tickValuesCount;
    let currentTickValue;
    ______________________________________index = 0;
    tickValuesCount = tickValues.length;
    for (
      ;
      ______________________________________index < tickValuesCount;
      ______________________________________index++
    ) {
      currentTickValue =
        tickValues[______________________________________index];
      currentTickValue.label = ________animationContext(
        ___tickOptions.callback,
        [
          currentTickValue.value,
          ______________________________________index,
          tickValues,
        ],
        this,
      );
    }
  }
  afterTickToLabelConversion() {
    ________animationContext(this.options.afterTickToLabelConversion, [this]);
  }
  beforeCalculateLabelRotation() {
    ________animationContext(this.options.beforeCalculateLabelRotation, [this]);
  }
  calculateLabelRotation() {
    const ____________________________options = this.options;
    const _________tickOptions = ____________________________options.ticks;
    const __animationRequestId = _animationRequestId(
      this.ticks.length,
      ____________________________options.ticks.maxTicksLimit,
    );
    const minTickRotation = _________tickOptions.minRotation || 0;
    const maxTickRotation = _________tickOptions.maxRotation;
    let labelWidthForRotation;
    let verticalLabelSpace;
    let labelRotationAdjustment;
    let finalLabelRotation = minTickRotation;
    if (
      !this._isVisible() ||
      !_________tickOptions.display ||
      minTickRotation >= maxTickRotation ||
      __animationRequestId <= 1 ||
      !this.isHorizontal()
    ) {
      this.labelRotation = minTickRotation;
      return;
    }
    const _labelSizes = this._getLabelSizes();
    const widestLabelWidth = _labelSizes.widest.width;
    const highestLabelHeight = _labelSizes.highest.height;
    const labelRotationCalculation = chartAnimationState(
      this.chart.width - widestLabelWidth,
      0,
      this.maxWidth,
    );
    if (____________________________options.offset) {
      labelWidthForRotation = this.maxWidth / __animationRequestId;
    } else {
      labelWidthForRotation =
        labelRotationCalculation / (__animationRequestId - 1);
    }
    if (widestLabelWidth + 6 > labelWidthForRotation) {
      labelWidthForRotation =
        labelRotationCalculation /
        (__animationRequestId -
          (____________________________options.offset ? 0.5 : 1));
      verticalLabelSpace =
        this.maxHeight -
        getTickLength(____________________________options.grid) -
        _________tickOptions.padding -
        calculateChartSize(
          ____________________________options.title,
          this.chart.options.font,
        );
      labelRotationAdjustment = Math.sqrt(
        widestLabelWidth * widestLabelWidth +
          highestLabelHeight * highestLabelHeight,
      );
      finalLabelRotation = _____animationState(
        Math.min(
          Math.asin(
            chartAnimationState(
              (_labelSizes.highest.height + 6) / labelWidthForRotation,
              -1,
              1,
            ),
          ),
          Math.asin(
            chartAnimationState(
              verticalLabelSpace / labelRotationAdjustment,
              -1,
              1,
            ),
          ) -
            Math.asin(
              chartAnimationState(
                highestLabelHeight / labelRotationAdjustment,
                -1,
                1,
              ),
            ),
        ),
      );
      finalLabelRotation = Math.max(
        minTickRotation,
        Math.min(maxTickRotation, finalLabelRotation),
      );
    }
    this.labelRotation = finalLabelRotation;
  }
  afterCalculateLabelRotation() {
    ________animationContext(this.options.afterCalculateLabelRotation, [this]);
  }
  afterAutoSkip() {}
  beforeFit() {
    ________animationContext(this.options.beforeFit, [this]);
  }
  fit() {
    const _______chartDimensions = {
      width: 0,
      height: 0,
    };
    const {
      chart: ________________chartConfig,
      options: {
        ticks: __________tickOptions,
        title: _chartTitle,
        grid: gridTickLength,
      },
    } = this;
    const _isChartVisible = this._isVisible();
    const isChartHorizontal = this.isHorizontal();
    if (_isChartVisible) {
      const isChartVisible = calculateChartSize(
        _chartTitle,
        ________________chartConfig.options.font,
      );
      if (isChartHorizontal) {
        _______chartDimensions.width = this.maxWidth;
        _______chartDimensions.height =
          getTickLength(gridTickLength) + isChartVisible;
      } else {
        _______chartDimensions.height = this.maxHeight;
        _______chartDimensions.width =
          getTickLength(gridTickLength) + isChartVisible;
      }
      if (__________tickOptions.display && this.ticks.length) {
        const {
          first: chartData,
          last: titleText,
          widest: gridSpacing,
          highest: isVisible,
        } = this._getLabelSizes();
        const labelPadding = __________tickOptions.padding * 2;
        const labelRotationRadians = requestAnimation(this.labelRotation);
        const labelRotationCosine = Math.cos(labelRotationRadians);
        const sinLabelRotation = Math.sin(labelRotationRadians);
        if (isChartHorizontal) {
          const _chartInstance = __________tickOptions.mirror
            ? 0
            : sinLabelRotation * gridSpacing.width +
              labelRotationCosine * isVisible.height;
          _______chartDimensions.height = Math.min(
            this.maxHeight,
            _______chartDimensions.height + _chartInstance + labelPadding,
          );
        } else {
          const chartConfig = __________tickOptions.mirror
            ? 0
            : labelRotationCosine * gridSpacing.width +
              sinLabelRotation * isVisible.height;
          _______chartDimensions.width = Math.min(
            this.maxWidth,
            _______chartDimensions.width + chartConfig + labelPadding,
          );
        }
        this._calculatePadding(
          chartData,
          titleText,
          sinLabelRotation,
          labelRotationCosine,
        );
      }
    }
    this._handleMargins();
    if (isChartHorizontal) {
      this.width = this._length =
        ________________chartConfig.width -
        this._margins.left -
        this._margins.right;
      this.height = _______chartDimensions.height;
    } else {
      this.width = _______chartDimensions.width;
      this.height = this._length =
        ________________chartConfig.height -
        this._margins.top -
        this._margins.bottom;
    }
  }
  _calculatePadding(
    tickDimensions,
    _tickSize,
    paddingFactor,
    paddingMultiplier,
  ) {
    const {
      ticks: { align: tickAlignment, padding: tickPadding },
      position: tickPosition,
    } = this.options;
    const isLabelRotated = this.labelRotation !== 0;
    const isHorizontalAxis = tickPosition !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const _labelPosition = this.getPixelForTick(0) - this.left;
      const remainingRightPadding =
        this.right - this.getPixelForTick(this.ticks.length - 1);
      let horizontalPaddingAdjustment = 0;
      let paddingAdjustment = 0;
      if (isLabelRotated) {
        if (isHorizontalAxis) {
          horizontalPaddingAdjustment =
            paddingMultiplier * tickDimensions.width;
          paddingAdjustment = paddingFactor * _tickSize.height;
        } else {
          horizontalPaddingAdjustment = paddingFactor * tickDimensions.height;
          paddingAdjustment = paddingMultiplier * _tickSize.width;
        }
      } else if (tickAlignment === "start") {
        paddingAdjustment = _tickSize.width;
      } else if (tickAlignment === "end") {
        horizontalPaddingAdjustment = tickDimensions.width;
      } else if (tickAlignment !== "inner") {
        horizontalPaddingAdjustment = tickDimensions.width / 2;
        paddingAdjustment = _tickSize.width / 2;
      }
      this.paddingLeft = Math.max(
        ((horizontalPaddingAdjustment - _labelPosition + tickPadding) *
          this.width) /
          (this.width - _labelPosition),
        0,
      );
      this.paddingRight = Math.max(
        ((paddingAdjustment - remainingRightPadding + tickPadding) *
          this.width) /
          (this.width - remainingRightPadding),
        0,
      );
    } else {
      let tickIndex = _tickSize.height / 2;
      let tickCount = tickDimensions.height / 2;
      if (tickAlignment === "start") {
        tickIndex = 0;
        tickCount = tickDimensions.height;
      } else if (tickAlignment === "end") {
        tickIndex = _tickSize.height;
        tickCount = 0;
      }
      this.paddingTop = tickIndex + tickPadding;
      this.paddingBottom = tickCount + tickPadding;
    }
  }
  _handleMargins() {
    if (this._margins) {
      this._margins.left = Math.max(this.paddingLeft, this._margins.left);
      this._margins.top = Math.max(this.paddingTop, this._margins.top);
      this._margins.right = Math.max(this.paddingRight, this._margins.right);
      this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
    }
  }
  afterFit() {
    ________animationContext(this.options.afterFit, [this]);
  }
  isHorizontal() {
    const { axis: ___axisDirection, position: positionVertical } = this.options;
    return (
      positionVertical === "top" ||
      positionVertical === "bottom" ||
      ___axisDirection === "x"
    );
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(_tickArray) {
    let __________________________currentIndex;
    let ____endIndex;
    this.beforeTickToLabelConversion();
    this.generateTickLabels(_tickArray);
    __________________________currentIndex = 0;
    ____endIndex = _tickArray.length;
    for (
      ;
      __________________________currentIndex < ____endIndex;
      __________________________currentIndex++
    ) {
      if (
        chartUpdateInterval(
          _tickArray[__________________________currentIndex].label,
        )
      ) {
        _tickArray.splice(__________________________currentIndex, 1);
        ____endIndex--;
        __________________________currentIndex--;
      }
    }
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let labelSizesCache = this._labelSizes;
    if (!labelSizesCache) {
      const sampleSize = this.options.ticks.sampleSize;
      let sampledTicks = this.ticks;
      if (sampleSize < sampledTicks.length) {
        sampledTicks = arraySliceByStep(sampledTicks, sampleSize);
      }
      this._labelSizes = labelSizesCache = this._computeLabelSizes(
        sampledTicks,
        sampledTicks.length,
        this.options.ticks.maxTicksLimit,
      );
    }
    return labelSizesCache;
  }
  _computeLabelSizes(labelData, totalLabels, _currentLabelIndex) {
    const {
      ctx: ___________________________________________canvasContext,
      _longestTextCache: longestTextCache,
    } = this;
    const labelWidths = [];
    const calculatedLabelHeights = [];
    const labelHeightInterval = Math.floor(
      totalLabels / _animationRequestId(totalLabels, _currentLabelIndex),
    );
    let _________labelIndex;
    let _____________________currentIndex;
    let currentLabelLength;
    let ___labelText;
    let __tickFontOptions;
    let tickFontString;
    let fontMetrics;
    let _lineHeight;
    let totalLabelWidth;
    let labelHeightAccumulator;
    let currentCharacter;
    let maxLabelWidth = 0;
    let maxLabelHeight = 0;
    for (
      _________labelIndex = 0;
      _________labelIndex < totalLabels;
      _________labelIndex += labelHeightInterval
    ) {
      ___labelText = labelData[_________labelIndex].label;
      __tickFontOptions = this._resolveTickFontOptions(_________labelIndex);
      ___________________________________________canvasContext.font =
        tickFontString = __tickFontOptions.string;
      fontMetrics = longestTextCache[tickFontString] = longestTextCache[
        tickFontString
      ] || {
        data: {},
        gc: [],
      };
      _lineHeight = __tickFontOptions.lineHeight;
      totalLabelWidth = labelHeightAccumulator = 0;
      if (
        chartUpdateInterval(___labelText) ||
        animatedChartItems(___labelText)
      ) {
        if (animatedChartItems(___labelText)) {
          _____________________currentIndex = 0;
          currentLabelLength = ___labelText.length;
          for (
            ;
            _____________________currentIndex < currentLabelLength;
            ++_____________________currentIndex
          ) {
            currentCharacter = ___labelText[_____________________currentIndex];
            if (
              !chartUpdateInterval(currentCharacter) &&
              !animatedChartItems(currentCharacter)
            ) {
              totalLabelWidth = __chartUpdateTrigger(
                ___________________________________________canvasContext,
                fontMetrics.data,
                fontMetrics.gc,
                totalLabelWidth,
                currentCharacter,
              );
              labelHeightAccumulator += _lineHeight;
            }
          }
        }
      } else {
        totalLabelWidth = __chartUpdateTrigger(
          ___________________________________________canvasContext,
          fontMetrics.data,
          fontMetrics.gc,
          totalLabelWidth,
          ___labelText,
        );
        labelHeightAccumulator = _lineHeight;
      }
      labelWidths.push(totalLabelWidth);
      calculatedLabelHeights.push(labelHeightAccumulator);
      maxLabelWidth = Math.max(totalLabelWidth, maxLabelWidth);
      maxLabelHeight = Math.max(labelHeightAccumulator, maxLabelHeight);
    }
    handleDataCleanup(longestTextCache, totalLabels);
    const widestLabelIndex = labelWidths.indexOf(maxLabelWidth);
    const highestLabelHeightIndex =
      calculatedLabelHeights.indexOf(maxLabelHeight);
    const getLabelDimensions = (
      __________________________________________________________index,
    ) => ({
      width:
        labelWidths[
          __________________________________________________________index
        ] || 0,
      height:
        calculatedLabelHeights[
          __________________________________________________________index
        ] || 0,
    });
    return {
      first: getLabelDimensions(0),
      last: getLabelDimensions(totalLabels - 1),
      widest: getLabelDimensions(widestLabelIndex),
      highest: getLabelDimensions(highestLabelHeightIndex),
      widths: labelWidths,
      heights: calculatedLabelHeights,
    };
  }
  getLabelForValue(valueToLabel) {
    return valueToLabel;
  }
  getPixelForValue(__value, __pixelValue) {
    return NaN;
  }
  getValueForPixel(_pixelValue) {}
  getPixelForTick(_____tickIndex) {
    const ticksArray = this.ticks;
    if (_____tickIndex < 0 || _____tickIndex > ticksArray.length - 1) {
      return null;
    } else {
      return this.getPixelForValue(ticksArray[_____tickIndex].value);
    }
  }
  getPixelForDecimal(_normalizedPixelValue) {
    if (this._reversePixels) {
      _normalizedPixelValue = 1 - _normalizedPixelValue;
    }
    const calculatedPixelValue =
      this._startPixel + _normalizedPixelValue * this._length;
    return _chartUpdateInterval(
      this._alignToPixels
        ? __chartAnimationQueue(this.chart, calculatedPixelValue, 0)
        : calculatedPixelValue,
    );
  }
  getDecimalForPixel(_____pixelValue) {
    const decimalPosition = (_____pixelValue - this._startPixel) / this._length;
    if (this._reversePixels) {
      return 1 - decimalPosition;
    } else {
      return decimalPosition;
    }
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min: _____minValue, max: ____maxValue } = this;
    if (_____minValue < 0 && ____maxValue < 0) {
      return ____maxValue;
    } else if (_____minValue > 0 && ____maxValue > 0) {
      return _____minValue;
    } else {
      return 0;
    }
  }
  getContext(_______tickIndex) {
    const tickArray = this.ticks || [];
    if (_______tickIndex >= 0 && _______tickIndex < tickArray.length) {
      const tickValue = tickArray[_______tickIndex];
      return (tickValue.$context ||= _____tooltipHandler(
        this.getContext(),
        _______tickIndex,
        tickValue,
      ));
    }
    return (this.$context ||= __tooltipHandlerFunction(
      this.chart.getContext(),
      this,
    ));
  }
  _tickSize() {
    const ______tickOptions = this.options.ticks;
    const _labelRotationRadians = requestAnimation(this.labelRotation);
    const cosineOfRotation = Math.abs(Math.cos(_labelRotationRadians));
    const sinValue = Math.abs(Math.sin(_labelRotationRadians));
    const labelSizes = this._getLabelSizes();
    const autoSkipPadding = ______tickOptions.autoSkipPadding || 0;
    const maxLabelWidthWithPadding = labelSizes
      ? labelSizes.widest.width + autoSkipPadding
      : 0;
    const labelHeightWithPadding = labelSizes
      ? labelSizes.highest.height + autoSkipPadding
      : 0;
    if (this.isHorizontal()) {
      if (
        labelHeightWithPadding * cosineOfRotation >
        maxLabelWidthWithPadding * sinValue
      ) {
        return maxLabelWidthWithPadding / cosineOfRotation;
      } else {
        return labelHeightWithPadding / sinValue;
      }
    } else if (
      labelHeightWithPadding * sinValue <
      maxLabelWidthWithPadding * cosineOfRotation
    ) {
      return labelHeightWithPadding / cosineOfRotation;
    } else {
      return maxLabelWidthWithPadding / sinValue;
    }
  }
  _isVisible() {
    const displayOption = this.options.display;
    if (displayOption !== "auto") {
      return !!displayOption;
    } else {
      return this.getMatchingVisibleMetas().length > 0;
    }
  }
  _computeGridLineItems(tickRange) {
    const _____axisType = this.axis;
    const _____________________________________chartInstance = this.chart;
    const _____________________________options = this.options;
    const {
      grid: _____gridOptions,
      position: gridPosition,
      border: ___borderOptions,
    } = _____________________________options;
    const gridOptionsOffset = _____gridOptions.offset;
    const isAxisOrientationHorizontal = this.isHorizontal();
    const totalTicksCount = this.ticks.length + (gridOptionsOffset ? 1 : 0);
    const tickLength = getTickLength(_____gridOptions);
    const _gridLineItems = [];
    const borderOptionsContext = ___borderOptions.setContext(this.getContext());
    const _______borderWidth = borderOptionsContext.display
      ? borderOptionsContext.width
      : 0;
    const halfBorderWidth = _______borderWidth / 2;
    const getPixelForValue = function (___________animationDuration) {
      return __chartAnimationQueue(
        _____________________________________chartInstance,
        ___________animationDuration,
        _______borderWidth,
      );
    };
    let _borderValue;
    let ____currentTickIndex;
    let tickPositionY;
    let calculatedTickPosition;
    let rightPosition;
    let calculatedTickPositionY;
    let rightPositionAdjusted;
    let __startPosition;
    let tickPositionX;
    let _tickPosition;
    let tickRangeRight;
    let tickRangeBottom;
    if (gridPosition === "top") {
      _borderValue = getPixelForValue(this.bottom);
      calculatedTickPositionY = this.bottom - tickLength;
      __startPosition = _borderValue - halfBorderWidth;
      _tickPosition = getPixelForValue(tickRange.top) + halfBorderWidth;
      tickRangeBottom = tickRange.bottom;
    } else if (gridPosition === "bottom") {
      _borderValue = getPixelForValue(this.top);
      _tickPosition = tickRange.top;
      tickRangeBottom = getPixelForValue(tickRange.bottom) - halfBorderWidth;
      calculatedTickPositionY = _borderValue + halfBorderWidth;
      __startPosition = this.top + tickLength;
    } else if (gridPosition === "left") {
      _borderValue = getPixelForValue(this.right);
      rightPosition = this.right - tickLength;
      rightPositionAdjusted = _borderValue - halfBorderWidth;
      tickPositionX = getPixelForValue(tickRange.left) + halfBorderWidth;
      tickRangeRight = tickRange.right;
    } else if (gridPosition === "right") {
      _borderValue = getPixelForValue(this.left);
      tickPositionX = tickRange.left;
      tickRangeRight = getPixelForValue(tickRange.right) - halfBorderWidth;
      rightPosition = _borderValue + halfBorderWidth;
      rightPositionAdjusted = this.left + tickLength;
    } else if (_____axisType === "x") {
      if (gridPosition === "center") {
        _borderValue = getPixelForValue(
          (tickRange.top + tickRange.bottom) / 2 + 0.5,
        );
      } else if (currentAnimationIndex(gridPosition)) {
        const tickCoordinates = Object.keys(gridPosition)[0];
        const axisType = gridPosition[tickCoordinates];
        _borderValue = getPixelForValue(
          this.chart.scales[tickCoordinates].getPixelForValue(axisType),
        );
      }
      _tickPosition = tickRange.top;
      tickRangeBottom = tickRange.bottom;
      calculatedTickPositionY = _borderValue + halfBorderWidth;
      __startPosition = calculatedTickPositionY + tickLength;
    } else if (_____axisType === "y") {
      if (gridPosition === "center") {
        _borderValue = getPixelForValue((tickRange.left + tickRange.right) / 2);
      } else if (currentAnimationIndex(gridPosition)) {
        const tickPositions = Object.keys(gridPosition)[0];
        const _axisType = gridPosition[tickPositions];
        _borderValue = getPixelForValue(
          this.chart.scales[tickPositions].getPixelForValue(_axisType),
        );
      }
      rightPosition = _borderValue - halfBorderWidth;
      rightPositionAdjusted = rightPosition - tickLength;
      tickPositionX = tickRange.left;
      tickRangeRight = tickRange.right;
    }
    const animationFrameLimit = chartAnimationRunning(
      _____________________________options.ticks.maxTicksLimit,
      totalTicksCount,
    );
    const _tickInterval = Math.max(
      1,
      Math.ceil(totalTicksCount / animationFrameLimit),
    );
    for (
      ____currentTickIndex = 0;
      ____currentTickIndex < totalTicksCount;
      ____currentTickIndex += _tickInterval
    ) {
      const context = this.getContext(____currentTickIndex);
      const contextSettings = _____gridOptions.setContext(context);
      const _contextSettings = ___borderOptions.setContext(context);
      const lineWidth = contextSettings.lineWidth;
      const contextColor = contextSettings.color;
      const borderDashArray = _contextSettings.dash || [];
      const dashOffset = _contextSettings.dashOffset;
      const tickWidth = contextSettings.tickWidth;
      const tickColor = contextSettings.tickColor;
      const tickBorderDash = contextSettings.tickBorderDash || [];
      const tickBorderDashOffset = contextSettings.tickBorderDashOffset;
      tickPositionY = calculateTickPosition(
        this,
        ____currentTickIndex,
        gridOptionsOffset,
      );
      if (tickPositionY !== undefined) {
        calculatedTickPosition = __chartAnimationQueue(
          _____________________________________chartInstance,
          tickPositionY,
          lineWidth,
        );
        if (isAxisOrientationHorizontal) {
          rightPosition =
            rightPositionAdjusted =
            tickPositionX =
            tickRangeRight =
              calculatedTickPosition;
        } else {
          calculatedTickPositionY =
            __startPosition =
            _tickPosition =
            tickRangeBottom =
              calculatedTickPosition;
        }
        _gridLineItems.push({
          tx1: rightPosition,
          ty1: calculatedTickPositionY,
          tx2: rightPositionAdjusted,
          ty2: __startPosition,
          x1: tickPositionX,
          y1: _tickPosition,
          x2: tickRangeRight,
          y2: tickRangeBottom,
          width: lineWidth,
          color: contextColor,
          borderDash: borderDashArray,
          borderDashOffset: dashOffset,
          tickWidth: tickWidth,
          tickColor: tickColor,
          tickBorderDash: tickBorderDash,
          tickBorderDashOffset: tickBorderDashOffset,
        });
      }
    }
    this._ticksLength = totalTicksCount;
    this._borderValue = _borderValue;
    return _gridLineItems;
  }
  _computeLabelItems(tickLabelBounds) {
    const axisInstance = this.axis;
    const _____________________chartOptions = this.options;
    const { position: ___labelPosition, ticks: tickLabelOptions } =
      _____________________chartOptions;
    const isHorizontalLayout = this.isHorizontal();
    const _tickLabels = this.ticks;
    const {
      align: _____labelAlignment,
      crossAlign: labelCrossAlign,
      padding: __paddingValue,
      mirror: isLabelMirrored,
    } = tickLabelOptions;
    const _tickLength = getTickLength(_____________________chartOptions.grid);
    const totalPaddingValue = _tickLength + __paddingValue;
    const ___paddingAdjustment = isLabelMirrored
      ? -__paddingValue
      : totalPaddingValue;
    const _labelRotationAdjustment = -requestAnimation(this.labelRotation);
    const _labelItems = [];
    let currentTickIndex;
    let _totalTickCount;
    let currentTickLabel;
    let tickLabelValue;
    let labelXOffset;
    let labelTranslationY;
    let labelTextAlign;
    let labelPixelPosition;
    let resolvedFontOptions;
    let ___lineHeight;
    let labelItemCount;
    let labelVerticalOffset;
    let labelVerticalAlignment = "middle";
    if (___labelPosition === "top") {
      labelTranslationY = this.bottom - ___paddingAdjustment;
      labelTextAlign = this._getXAxisLabelAlignment();
    } else if (___labelPosition === "bottom") {
      labelTranslationY = this.top + ___paddingAdjustment;
      labelTextAlign = this._getXAxisLabelAlignment();
    } else if (___labelPosition === "left") {
      const labelAlignment = this._getYAxisLabelAlignment(_tickLength);
      labelTextAlign = labelAlignment.textAlign;
      labelXOffset = labelAlignment.x;
    } else if (___labelPosition === "right") {
      const _labelAlignment = this._getYAxisLabelAlignment(_tickLength);
      labelTextAlign = _labelAlignment.textAlign;
      labelXOffset = _labelAlignment.x;
    } else if (axisInstance === "x") {
      if (___labelPosition === "center") {
        labelTranslationY =
          (tickLabelBounds.top + tickLabelBounds.bottom) / 2 +
          totalPaddingValue;
      } else if (currentAnimationIndex(___labelPosition)) {
        const yAxisLabelAlignment = Object.keys(___labelPosition)[0];
        const axisReference = ___labelPosition[yAxisLabelAlignment];
        labelTranslationY =
          this.chart.scales[yAxisLabelAlignment].getPixelForValue(
            axisReference,
          ) + totalPaddingValue;
      }
      labelTextAlign = this._getXAxisLabelAlignment();
    } else if (axisInstance === "y") {
      if (___labelPosition === "center") {
        labelXOffset =
          (tickLabelBounds.left + tickLabelBounds.right) / 2 -
          totalPaddingValue;
      } else if (currentAnimationIndex(___labelPosition)) {
        const __labelAlignment = Object.keys(___labelPosition)[0];
        const _axisReference = ___labelPosition[__labelAlignment];
        labelXOffset =
          this.chart.scales[__labelAlignment].getPixelForValue(_axisReference);
      }
      labelTextAlign = this._getYAxisLabelAlignment(_tickLength).textAlign;
    }
    if (axisInstance === "y") {
      if (_____labelAlignment === "start") {
        labelVerticalAlignment = "top";
      } else if (_____labelAlignment === "end") {
        labelVerticalAlignment = "bottom";
      }
    }
    const labelSizeMetrics = this._getLabelSizes();
    currentTickIndex = 0;
    _totalTickCount = _tickLabels.length;
    for (; currentTickIndex < _totalTickCount; ++currentTickIndex) {
      currentTickLabel = _tickLabels[currentTickIndex];
      tickLabelValue = currentTickLabel.label;
      const labelContext = tickLabelOptions.setContext(
        this.getContext(currentTickIndex),
      );
      labelPixelPosition =
        this.getPixelForTick(currentTickIndex) + tickLabelOptions.labelOffset;
      resolvedFontOptions = this._resolveTickFontOptions(currentTickIndex);
      ___lineHeight = resolvedFontOptions.lineHeight;
      if (animatedChartItems(tickLabelValue)) {
        labelItemCount = tickLabelValue.length;
      } else {
        labelItemCount = 1;
      }
      const halfLabelCount = labelItemCount / 2;
      const textColor = labelContext.color;
      const textStrokeColor = labelContext.textStrokeColor;
      const textStrokeWidth = labelContext.textStrokeWidth;
      let labelBackdropOptions;
      let textAlign = labelTextAlign;
      if (isHorizontalLayout) {
        labelXOffset = labelPixelPosition;
        if (labelTextAlign === "inner") {
          if (currentTickIndex === _totalTickCount - 1) {
            if (this.options.reverse) {
              textAlign = "left";
            } else {
              textAlign = "right";
            }
          } else if (currentTickIndex === 0) {
            if (this.options.reverse) {
              textAlign = "right";
            } else {
              textAlign = "left";
            }
          } else {
            textAlign = "center";
          }
        }
        if (___labelPosition === "top") {
          if (labelCrossAlign === "near" || _labelRotationAdjustment !== 0) {
            labelVerticalOffset =
              -labelItemCount * ___lineHeight + ___lineHeight / 2;
          } else if (labelCrossAlign === "center") {
            labelVerticalOffset =
              -labelSizeMetrics.highest.height / 2 -
              halfLabelCount * ___lineHeight +
              ___lineHeight;
          } else {
            labelVerticalOffset =
              -labelSizeMetrics.highest.height + ___lineHeight / 2;
          }
        } else if (
          labelCrossAlign === "near" ||
          _labelRotationAdjustment !== 0
        ) {
          labelVerticalOffset = ___lineHeight / 2;
        } else if (labelCrossAlign === "center") {
          labelVerticalOffset =
            labelSizeMetrics.highest.height / 2 -
            halfLabelCount * ___lineHeight;
        } else {
          labelVerticalOffset =
            labelSizeMetrics.highest.height - labelItemCount * ___lineHeight;
        }
        if (isLabelMirrored) {
          labelVerticalOffset *= -1;
        }
        if (_labelRotationAdjustment !== 0 && !labelContext.showLabelBackdrop) {
          labelXOffset +=
            (___lineHeight / 2) * Math.sin(_labelRotationAdjustment);
        }
      } else {
        labelTranslationY = labelPixelPosition;
        labelVerticalOffset = ((1 - labelItemCount) * ___lineHeight) / 2;
      }
      if (labelContext.showLabelBackdrop) {
        const _halfLabelCount = __animationElement(
          labelContext.backdropPadding,
        );
        const _textColor = labelSizeMetrics.heights[currentTickIndex];
        const labelPosition = labelSizeMetrics.widths[currentTickIndex];
        let _textStrokeColor = labelVerticalOffset - _halfLabelCount.top;
        let contextSetter = 0 - _halfLabelCount.left;
        switch (labelVerticalAlignment) {
          case "middle":
            _textStrokeColor -= _textColor / 2;
            break;
          case "bottom":
            _textStrokeColor -= _textColor;
        }
        switch (labelTextAlign) {
          case "center":
            contextSetter -= labelPosition / 2;
            break;
          case "right":
            contextSetter -= labelPosition;
        }
        labelBackdropOptions = {
          left: contextSetter,
          top: _textStrokeColor,
          width: labelPosition + _halfLabelCount.width,
          height: _textColor + _halfLabelCount.height,
          color: labelContext.backdropColor,
        };
      }
      _labelItems.push({
        label: tickLabelValue,
        font: resolvedFontOptions,
        textOffset: labelVerticalOffset,
        options: {
          rotation: _labelRotationAdjustment,
          color: textColor,
          strokeColor: textStrokeColor,
          strokeWidth: textStrokeWidth,
          textAlign: textAlign,
          textBaseline: labelVerticalAlignment,
          translation: [labelXOffset, labelTranslationY],
          backdrop: labelBackdropOptions,
        },
      });
    }
    return _labelItems;
  }
  _getXAxisLabelAlignment() {
    const { position: xAxisLabelPosition, ticks: xAxisTicks } = this.options;
    if (-requestAnimation(this.labelRotation)) {
      if (xAxisLabelPosition === "top") {
        return "left";
      } else {
        return "right";
      }
    }
    let xAxisTickAlignment = "center";
    if (xAxisTicks.align === "start") {
      xAxisTickAlignment = "left";
    } else if (xAxisTicks.align === "end") {
      xAxisTickAlignment = "right";
    } else if (xAxisTicks.align === "inner") {
      xAxisTickAlignment = "inner";
    }
    return xAxisTickAlignment;
  }
  _getYAxisLabelAlignment(labelOffset) {
    const {
      position: yAxisLabelPosition,
      ticks: {
        crossAlign: yAxisLabelCrossAlign,
        mirror: isYAxisLabelMirrored,
        padding: _____labelPadding,
      },
    } = this.options;
    const totalLabelOffset = labelOffset + _____labelPadding;
    const _widestLabelWidth = this._getLabelSizes().widest.width;
    let _textAlign;
    let labelPositionOffset;
    if (yAxisLabelPosition === "left") {
      if (isYAxisLabelMirrored) {
        labelPositionOffset = this.right + _____labelPadding;
        if (yAxisLabelCrossAlign === "near") {
          _textAlign = "left";
        } else if (yAxisLabelCrossAlign === "center") {
          _textAlign = "center";
          labelPositionOffset += _widestLabelWidth / 2;
        } else {
          _textAlign = "right";
          labelPositionOffset += _widestLabelWidth;
        }
      } else {
        labelPositionOffset = this.right - totalLabelOffset;
        if (yAxisLabelCrossAlign === "near") {
          _textAlign = "right";
        } else if (yAxisLabelCrossAlign === "center") {
          _textAlign = "center";
          labelPositionOffset -= _widestLabelWidth / 2;
        } else {
          _textAlign = "left";
          labelPositionOffset = this.left;
        }
      }
    } else if (yAxisLabelPosition === "right") {
      if (isYAxisLabelMirrored) {
        labelPositionOffset = this.left + _____labelPadding;
        if (yAxisLabelCrossAlign === "near") {
          _textAlign = "right";
        } else if (yAxisLabelCrossAlign === "center") {
          _textAlign = "center";
          labelPositionOffset -= _widestLabelWidth / 2;
        } else {
          _textAlign = "left";
          labelPositionOffset -= _widestLabelWidth;
        }
      } else {
        labelPositionOffset = this.left + totalLabelOffset;
        if (yAxisLabelCrossAlign === "near") {
          _textAlign = "left";
        } else if (yAxisLabelCrossAlign === "center") {
          _textAlign = "center";
          labelPositionOffset += _widestLabelWidth / 2;
        } else {
          _textAlign = "right";
          labelPositionOffset = this.right;
        }
      }
    } else {
      _textAlign = "right";
    }
    return {
      textAlign: _textAlign,
      x: labelPositionOffset,
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror) {
      return;
    }
    const __________________________chartInstance = this.chart;
    const __labelPosition = this.options.position;
    if (__labelPosition === "left" || __labelPosition === "right") {
      return {
        top: 0,
        left: this.left,
        bottom: __________________________chartInstance.height,
        right: this.right,
      };
    } else if (__labelPosition === "top" || __labelPosition === "bottom") {
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: __________________________chartInstance.width,
      };
    } else {
      return undefined;
    }
  }
  drawBackground() {
    const {
      ctx: ______________________canvasContext,
      options: { backgroundColor: backgroundColor },
      left: _leftCoordinate,
      top: __topPosition,
      width: backgroundWidth,
      height: backgroundHeight,
    } = this;
    if (backgroundColor) {
      ______________________canvasContext.save();
      ______________________canvasContext.fillStyle = backgroundColor;
      ______________________canvasContext.fillRect(
        _leftCoordinate,
        __topPosition,
        backgroundWidth,
        backgroundHeight,
      );
      ______________________canvasContext.restore();
    }
  }
  getLineWidthForValue(________________________inputValue) {
    const gridOptions = this.options.grid;
    if (!this._isVisible() || !gridOptions.display) {
      return 0;
    }
    const inputValueIndex = this.ticks.findIndex(
      (____________inputValue) =>
        ____________inputValue.value === ________________________inputValue,
    );
    if (inputValueIndex >= 0) {
      return gridOptions.setContext(this.getContext(inputValueIndex)).lineWidth;
    }
    return 0;
  }
  drawGrid(gridLineSpacing) {
    const __gridOptions = this.options.grid;
    const gridLineIndex = this.ctx;
    const gridLineItems = (this._gridLineItems ||=
      this._computeGridLineItems(gridLineSpacing));
    let ______index;
    let gridLineCount;
    const drawGridLine = (_startPoint, _endPoint, strokeOptions) => {
      if (strokeOptions.width && strokeOptions.color) {
        gridLineIndex.save();
        gridLineIndex.lineWidth = strokeOptions.width;
        gridLineIndex.strokeStyle = strokeOptions.color;
        gridLineIndex.setLineDash(strokeOptions.borderDash || []);
        gridLineIndex.lineDashOffset = strokeOptions.borderDashOffset;
        gridLineIndex.beginPath();
        gridLineIndex.moveTo(_startPoint.x, _startPoint.y);
        gridLineIndex.lineTo(_endPoint.x, _endPoint.y);
        gridLineIndex.stroke();
        gridLineIndex.restore();
      }
    };
    if (__gridOptions.display) {
      ______index = 0;
      gridLineCount = gridLineItems.length;
      for (; ______index < gridLineCount; ++______index) {
        const gridLineProperties = gridLineItems[______index];
        if (__gridOptions.drawOnChartArea) {
          drawGridLine(
            {
              x: gridLineProperties.x1,
              y: gridLineProperties.y1,
            },
            {
              x: gridLineProperties.x2,
              y: gridLineProperties.y2,
            },
            gridLineProperties,
          );
        }
        if (__gridOptions.drawTicks) {
          drawGridLine(
            {
              x: gridLineProperties.tx1,
              y: gridLineProperties.ty1,
            },
            {
              x: gridLineProperties.tx2,
              y: gridLineProperties.ty2,
            },
            {
              color: gridLineProperties.tickColor,
              width: gridLineProperties.tickWidth,
              borderDash: gridLineProperties.tickBorderDash,
              borderDashOffset: gridLineProperties.tickBorderDashOffset,
            },
          );
        }
      }
    }
  }
  drawBorder() {
    const {
      chart: _________________________________chartInstance,
      ctx: ___________________________________canvasContext,
      options: { border: _borderOptions, grid: _gridOptions },
    } = this;
    const borderContext = _borderOptions.setContext(this.getContext());
    const _____borderWidth = _borderOptions.display ? borderContext.width : 0;
    if (!_____borderWidth) {
      return;
    }
    const gridLineWidth = _gridOptions.setContext(this.getContext(0)).lineWidth;
    const borderValue = this._borderValue;
    let borderHorizontalPosition;
    let rightBorderAnimationPosition;
    let centerLinePosition;
    let borderAnimationPosition;
    if (this.isHorizontal()) {
      borderHorizontalPosition =
        __chartAnimationQueue(
          _________________________________chartInstance,
          this.left,
          _____borderWidth,
        ) -
        _____borderWidth / 2;
      rightBorderAnimationPosition =
        __chartAnimationQueue(
          _________________________________chartInstance,
          this.right,
          gridLineWidth,
        ) +
        gridLineWidth / 2;
      centerLinePosition = borderAnimationPosition = borderValue;
    } else {
      centerLinePosition =
        __chartAnimationQueue(
          _________________________________chartInstance,
          this.top,
          _____borderWidth,
        ) -
        _____borderWidth / 2;
      borderAnimationPosition =
        __chartAnimationQueue(
          _________________________________chartInstance,
          this.bottom,
          gridLineWidth,
        ) +
        gridLineWidth / 2;
      borderHorizontalPosition = rightBorderAnimationPosition = borderValue;
    }
    ___________________________________canvasContext.save();
    ___________________________________canvasContext.lineWidth =
      borderContext.width;
    ___________________________________canvasContext.strokeStyle =
      borderContext.color;
    ___________________________________canvasContext.beginPath();
    ___________________________________canvasContext.moveTo(
      borderHorizontalPosition,
      centerLinePosition,
    );
    ___________________________________canvasContext.lineTo(
      rightBorderAnimationPosition,
      borderAnimationPosition,
    );
    ___________________________________canvasContext.stroke();
    ___________________________________canvasContext.restore();
  }
  drawLabels(labelItems) {
    if (!this.options.ticks.display) {
      return;
    }
    const ________________________canvasContext = this.ctx;
    const labelArea = this._computeLabelArea();
    if (labelArea) {
      __________animationManager(
        ________________________canvasContext,
        labelArea,
      );
    }
    const labelItemsArray = this.getLabelItems(labelItems);
    for (const textItem of labelItemsArray) {
      const optionsArray = textItem.options;
      const fontStyle = textItem.font;
      const _labelText = textItem.label;
      const textOffset = textItem.textOffset;
      ___lastDateUpdated(
        ________________________canvasContext,
        _labelText,
        0,
        textOffset,
        fontStyle,
        optionsArray,
      );
    }
    if (labelArea) {
      ______chartAnimationQueue(________________________canvasContext);
    }
  }
  drawTitle() {
    const {
      ctx: __________________________________canvasContext,
      options: {
        position: _titlePosition,
        title: ___titleOptions,
        reverse: isTextReversed,
      },
    } = this;
    if (!___titleOptions.display) {
      return;
    }
    const _animationFrameData = requestAnimationFrame(___titleOptions.font);
    const titlePadding = __animationElement(___titleOptions.padding);
    const titleAlignment = ___titleOptions.align;
    let lineHeightAdjusted = _animationFrameData.lineHeight / 2;
    if (
      _titlePosition === "bottom" ||
      _titlePosition === "center" ||
      currentAnimationIndex(_titlePosition)
    ) {
      lineHeightAdjusted += titlePadding.bottom;
      if (animatedChartItems(___titleOptions.text)) {
        lineHeightAdjusted +=
          _animationFrameData.lineHeight * (___titleOptions.text.length - 1);
      }
    } else {
      lineHeightAdjusted += titlePadding.top;
    }
    const {
      titleX: titleXCoordinate,
      titleY: titleYCoordinate,
      maxWidth: _maxWidthValue,
      rotation: titleRotation,
    } = calculateChartPositions(
      this,
      lineHeightAdjusted,
      _titlePosition,
      titleAlignment,
    );
    ___lastDateUpdated(
      __________________________________canvasContext,
      ___titleOptions.text,
      0,
      0,
      _animationFrameData,
      {
        color: ___titleOptions.color,
        maxWidth: _maxWidthValue,
        rotation: titleRotation,
        textAlign: animatedTarget(
          titleAlignment,
          _titlePosition,
          isTextReversed,
        ),
        textBaseline: "middle",
        translation: [titleXCoordinate, titleYCoordinate],
      },
    );
  }
  draw(__timeElapsed) {
    if (this._isVisible()) {
      this.drawBackground();
      this.drawGrid(__timeElapsed);
      this.drawBorder();
      this.drawTitle();
      this.drawLabels(__timeElapsed);
    }
  }
  _layers() {
    const ________________________options = this.options;
    const ticksZValue =
      (________________________options.ticks &&
        ________________________options.ticks.z) ||
      0;
    const gridAnimationZIndex = chartAnimationRunning(
      ________________________options.grid &&
        ________________________options.grid.z,
      -1,
    );
    const borderAnimationZValue = chartAnimationRunning(
      ________________________options.border &&
        ________________________options.border.z,
      0,
    );
    if (this._isVisible() && this.draw === ChartAxisController.prototype.draw) {
      return [
        {
          z: gridAnimationZIndex,
          draw: (gridTick) => {
            this.drawBackground();
            this.drawGrid(gridTick);
            this.drawTitle();
          },
        },
        {
          z: borderAnimationZValue,
          draw: () => {
            this.drawBorder();
          },
        },
        {
          z: ticksZValue,
          draw: (currentLabel) => {
            this.drawLabels(currentLabel);
          },
        },
      ];
    } else {
      return [
        {
          z: ticksZValue,
          draw: (timestamp) => {
            this.draw(timestamp);
          },
        },
      ];
    }
  }
  getMatchingVisibleMetas(typeFilter) {
    const ___sortedVisibleDatasetMetas =
      this.chart.getSortedVisibleDatasetMetas();
    const axisIdKey = this.axis + "AxisID";
    const __matchingVisibleMetas = [];
    let _______________________currentIndex;
    let sortedDatasetMetasCount;
    _______________________currentIndex = 0;
    sortedDatasetMetasCount = ___sortedVisibleDatasetMetas.length;
    for (
      ;
      _______________________currentIndex < sortedDatasetMetasCount;
      ++_______________________currentIndex
    ) {
      const _____currentItem =
        ___sortedVisibleDatasetMetas[_______________________currentIndex];
      if (
        _____currentItem[axisIdKey] === this.id &&
        (!typeFilter || _____currentItem.type === typeFilter)
      ) {
        __matchingVisibleMetas.push(_____currentItem);
      }
    }
    return __matchingVisibleMetas;
  }
  _resolveTickFontOptions(tickFontOptions) {
    const _tickFontOptions = this.options.ticks.setContext(
      this.getContext(tickFontOptions),
    );
    return requestAnimationFrame(_tickFontOptions.font);
  }
  _maxDigits() {
    const lineHeight = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / lineHeight;
  }
}
class AnimationRegistry {
  constructor(type, scope, overrideValue) {
    this.type = type;
    this.scope = scope;
    this.override = overrideValue;
    this.items = Object.create(null);
  }
  isForType(prototypeInput) {
    return Object.prototype.isPrototypeOf.call(
      this.type.prototype,
      prototypeInput.prototype,
    );
  }
  register(classInstance) {
    const prototypeOfObject = Object.getPrototypeOf(classInstance);
    let registeredItem;
    if (hasIdAndDefaults(prototypeOfObject)) {
      registeredItem = this.register(prototypeOfObject);
    }
    const registeredItems = this.items;
    const itemId = classInstance.id;
    const itemScopedId = this.scope + "." + itemId;
    if (!itemId) {
      throw new Error("class does not have id: " + classInstance);
    }
    if (!(itemId in registeredItems)) {
      registeredItems[itemId] = classInstance;
      ___animationSettings(classInstance, itemScopedId, registeredItem);
      if (this.override) {
        animationDuration.override(classInstance.id, classInstance.overrides);
      }
    }
    return itemScopedId;
  }
  get(______itemIndex) {
    return this.items[______itemIndex];
  }
  unregister(itemToUnregister) {
    const itemsMap = this.items;
    const __itemId = itemToUnregister.id;
    const currentScope = this.scope;
    if (__itemId in itemsMap) {
      delete itemsMap[__itemId];
    }
    if (currentScope && __itemId in animationDuration[currentScope]) {
      delete animationDuration[currentScope][__itemId];
      if (this.override) {
        delete animationStep[__itemId];
      }
    }
  }
}
function ___animationSettings(
  animationConfig,
  animationKey,
  animationDurationIndex,
) {
  const calculatedAnimationDuration = _animationDuration(Object.create(null), [
    animationDurationIndex ? animationDuration.get(animationDurationIndex) : {},
    animationDuration.get(animationKey),
    animationConfig.defaults,
  ]);
  animationDuration.set(animationKey, calculatedAnimationDuration);
  if (animationConfig.defaultRoutes) {
    animateProperty(animationKey, animationConfig.defaultRoutes);
  }
  if (animationConfig.descriptors) {
    animationDuration.describe(animationKey, animationConfig.descriptors);
  }
}
function animateProperty(target, _animationProperties) {
  Object.keys(_animationProperties).forEach((__inputString) => {
    const splitPathSegments = __inputString.split(".");
    const fileNameExtension = splitPathSegments.pop();
    const animationRoute = [target].concat(splitPathSegments).join(".");
    const animationPropertiesArray =
      _animationProperties[__inputString].split(".");
    const animationPropertyLastSegment = animationPropertiesArray.pop();
    const propertyPath = animationPropertiesArray.join(".");
    animationDuration.route(
      animationRoute,
      fileNameExtension,
      propertyPath,
      animationPropertyLastSegment,
    );
  });
}
function hasIdAndDefaults(__inputObject) {
  return "id" in __inputObject && "defaults" in __inputObject;
}
class AnimationRegistryManager {
  constructor() {
    this.controllers = new AnimationRegistry(ChartElement, "datasets", true);
    this.elements = new AnimationRegistry(_AnimationController, "elements");
    this.plugins = new AnimationRegistry(Object, "plugins");
    this.scales = new AnimationRegistry(ChartAxisController, "scales");
    this._typedRegistries = [this.controllers, this.scales, this.elements];
  }
  add(...eventArgs) {
    this._each("register", eventArgs);
  }
  remove(...unregisterArgs) {
    this._each("unregister", unregisterArgs);
  }
  addControllers(...controllerArgs) {
    this._each("register", controllerArgs, this.controllers);
  }
  addElements(...elementArgs) {
    this._each("register", elementArgs, this.elements);
  }
  addPlugins(...pluginArgs) {
    this._each("register", pluginArgs, this.plugins);
  }
  addScales(...scaleArgs) {
    this._each("register", scaleArgs, this.scales);
  }
  getController(controllerType) {
    return this._get(controllerType, this.controllers, "controller");
  }
  getElement(__elementId) {
    return this._get(__elementId, this.elements, "element");
  }
  getPlugin(pluginIdentifier) {
    return this._get(pluginIdentifier, this.plugins, "plugin");
  }
  getScale(__scaleValue) {
    return this._get(__scaleValue, this.scales, "scale");
  }
  removeControllers(...controllerList) {
    this._each("unregister", controllerList, this.controllers);
  }
  removeElements(...elementsToRemove) {
    this._each("unregister", elementsToRemove, this.elements);
  }
  removePlugins(..._pluginArgs) {
    this._each("unregister", _pluginArgs, this.plugins);
  }
  removeScales(...scaleToRemove) {
    this._each("unregister", scaleToRemove, this.scales);
  }
  _each(____________eventHandler, eventsArray, _currentRegistry) {
    [...eventsArray].forEach((event) => {
      const registryForType =
        _currentRegistry || this._getRegistryForType(event);
      if (
        _currentRegistry ||
        registryForType.isForType(event) ||
        (registryForType === this.plugins && event.id)
      ) {
        this._exec(____________eventHandler, registryForType, event);
      } else {
        __lastDateUpdated(event, (_eventType) => {
          const registry =
            _currentRegistry || this._getRegistryForType(_eventType);
          this._exec(____________eventHandler, registry, _eventType);
        });
      }
    });
  }
  _exec(__animationType, _____________________event, _______animationIndex) {
    const animationItemsList = animationItems(__animationType);
    ________animationContext(
      _______animationIndex["before" + animationItemsList],
      [],
      _______animationIndex,
    );
    _____________________event[__animationType](_______animationIndex);
    ________animationContext(
      _______animationIndex["after" + animationItemsList],
      [],
      _______animationIndex,
    );
  }
  _getRegistryForType(typeIdentifier) {
    for (
      let typedRegistryIndex = 0;
      typedRegistryIndex < this._typedRegistries.length;
      typedRegistryIndex++
    ) {
      const currentRegistry = this._typedRegistries[typedRegistryIndex];
      if (currentRegistry.isForType(typeIdentifier)) {
        return currentRegistry;
      }
    }
    return this.plugins;
  }
  _get(_key, entityManager, registrationType) {
    const retrievedEntity = entityManager.get(_key);
    if (retrievedEntity === undefined) {
      throw new Error(
        '"' + _key + '" is not a registered ' + registrationType + ".",
      );
    }
    return retrievedEntity;
  }
}
var chartRegistry = new AnimationRegistryManager();
class PluginManager {
  constructor() {
    this._init = [];
  }
  notify(
    descriptorTemplate,
    notificationPhase,
    _notificationCallback,
    filterFunction,
  ) {
    if (notificationPhase === "beforeInit") {
      this._init = this._createDescriptors(descriptorTemplate, true);
      this._notify(this._init, descriptorTemplate, "install");
    }
    const filteredDescriptors = filterFunction
      ? this._descriptors(descriptorTemplate).filter(filterFunction)
      : this._descriptors(descriptorTemplate);
    const notificationResult = this._notify(
      filteredDescriptors,
      descriptorTemplate,
      notificationPhase,
      _notificationCallback,
    );
    if (notificationPhase === "afterDestroy") {
      this._notify(filteredDescriptors, descriptorTemplate, "stop");
      this._notify(this._init, descriptorTemplate, "uninstall");
    }
    return notificationResult;
  }
  _notify(
    _pluginsList,
    _________________________event,
    _pluginIndex,
    __pluginOptions,
  ) {
    __pluginOptions = __pluginOptions || {};
    for (const pluginItem of _pluginsList) {
      const pluginsArray = pluginItem.plugin;
      const pluginInstance = pluginsArray[_pluginIndex];
      const pluginArguments = [
        _________________________event,
        __pluginOptions,
        pluginItem.options,
      ];
      if (
        ________animationContext(
          pluginInstance,
          pluginArguments,
          pluginsArray,
        ) === false &&
        __pluginOptions.cancelable
      ) {
        return false;
      }
    }
    return true;
  }
  invalidate() {
    if (!chartUpdateInterval(this._cache)) {
      this._oldCache = this._cache;
      this._cache = undefined;
    }
  }
  _descriptors(_________inputData) {
    if (this._cache) {
      return this._cache;
    }
    const descriptorsCache = (this._cache =
      this._createDescriptors(_________inputData));
    this._notifyStateChanges(_________inputData);
    return descriptorsCache;
  }
  _createDescriptors(chartDescriptor, _pluginOptions) {
    const _______chartConfig = chartDescriptor && chartDescriptor.config;
    const __isChartAnimationRunning = chartAnimationRunning(
      _______chartConfig.options && _______chartConfig.options.plugins,
      {},
    );
    const workspaceOptions = updateWorkspacePlugins(_______chartConfig);
    if (__isChartAnimationRunning !== false || _pluginOptions) {
      return initializePlugins(
        chartDescriptor,
        workspaceOptions,
        __isChartAnimationRunning,
        _pluginOptions,
      );
    } else {
      return [];
    }
  }
  _notifyStateChanges(notificationMeta) {
    const oldCachePlugins = this._oldCache || [];
    const currentCache = this._cache;
    const filterPluginsByDifferentCache = (pluginFilter, excludedPlugins) =>
      pluginFilter.filter(
        (currentPluginId) =>
          !excludedPlugins.some(
            (currentPlugin) =>
              currentPluginId.plugin.id === currentPlugin.plugin.id,
          ),
      );
    this._notify(
      filterPluginsByDifferentCache(oldCachePlugins, currentCache),
      notificationMeta,
      "stop",
    );
    this._notify(
      filterPluginsByDifferentCache(currentCache, oldCachePlugins),
      notificationMeta,
      "start",
    );
  }
}
function updateWorkspacePlugins(workspace) {
  const localPluginIdsMap = {};
  const __pluginsList = [];
  const pluginKeys = Object.keys(chartRegistry.plugins.items);
  for (let stringIndex = 0; stringIndex < pluginKeys.length; stringIndex++) {
    __pluginsList.push(chartRegistry.getPlugin(pluginKeys[stringIndex]));
  }
  const workspacePlugins = workspace.plugins || [];
  for (
    let ______________________________________________________________currentIndex = 0;
    ______________________________________________________________currentIndex <
    workspacePlugins.length;
    ______________________________________________________________currentIndex++
  ) {
    const ___currentItem =
      workspacePlugins[
        ______________________________________________________________currentIndex
      ];
    if (__pluginsList.indexOf(___currentItem) === -1) {
      __pluginsList.push(___currentItem);
      localPluginIdsMap[___currentItem.id] = true;
    }
  }
  return {
    plugins: __pluginsList,
    localIds: localPluginIdsMap,
  };
}
function getResponseObject(responseCondition, _responseCondition) {
  if (_responseCondition || responseCondition !== false) {
    if (responseCondition === true) {
      return {};
    } else {
      return responseCondition;
    }
  } else {
    return null;
  }
}
function initializePlugins(
  _canvasElement,
  { plugins: pluginsList, localIds: localIdMapping },
  pluginOptions,
  pluginReference,
) {
  const initializedPlugins = [];
  const _________________canvasContext = _canvasElement.getContext();
  for (const plugin of pluginsList) {
    const pluginReferenceList = plugin.id;
    const pluginOptionsConfig = getResponseObject(
      pluginOptions[pluginReferenceList],
      pluginReference,
    );
    if (pluginOptionsConfig !== null) {
      initializedPlugins.push({
        plugin: plugin,
        options: configurePlugin(
          _canvasElement.config,
          {
            plugin: plugin,
            local: localIdMapping[pluginReferenceList],
          },
          pluginOptionsConfig,
          _________________canvasContext,
        ),
      });
    }
  }
  return initializedPlugins;
}
function configurePlugin(
  contextHandler,
  { plugin: pluginConfig, local: localPluginConfig },
  optionScopeKeys,
  resolverOptions,
) {
  const pluginScopeKeys = contextHandler.pluginScopeKeys(pluginConfig);
  const optionScopes = contextHandler.getOptionScopes(
    optionScopeKeys,
    pluginScopeKeys,
  );
  if (localPluginConfig && pluginConfig.defaults) {
    optionScopes.push(pluginConfig.defaults);
  }
  return contextHandler.createResolver(optionScopes, resolverOptions, [""], {
    scriptable: false,
    indexable: false,
    allKeys: true,
  });
}
function getDatasetIndexAxis(
  ______________________datasetIndex,
  _inputParameters,
) {
  const datasetProperties =
    animationDuration.datasets[______________________datasetIndex] || {};
  return (
    (
      (_inputParameters.datasets || {})[______________________datasetIndex] ||
      {}
    ).indexAxis ||
    _inputParameters.indexAxis ||
    datasetProperties.indexAxis ||
    "x"
  );
}
function getValueOrIndex(_____inputValue, ______inputValue) {
  let resultValueOrIndex = _____inputValue;
  if (_____inputValue === "_index_") {
    resultValueOrIndex = ______inputValue;
  } else if (_____inputValue === "_value_") {
    if (______inputValue === "x") {
      resultValueOrIndex = "y";
    } else {
      resultValueOrIndex = "x";
    }
  }
  return resultValueOrIndex;
}
function compareValues(_firstValue, __comparisonValue) {
  if (_firstValue === __comparisonValue) {
    return "_index_";
  } else {
    return "_value_";
  }
}
function validateCoordinateInput(______axisIdentifier) {
  if (
    ______axisIdentifier === "x" ||
    ______axisIdentifier === "y" ||
    ______axisIdentifier === "r"
  ) {
    return ______axisIdentifier;
  }
}
function _axisDirection(positionDirection) {
  if (positionDirection === "top" || positionDirection === "bottom") {
    return "x";
  } else if (positionDirection === "left" || positionDirection === "right") {
    return "y";
  } else {
    return undefined;
  }
}
function determineAxisValue(inputAxis, ...extraAxisOptions) {
  if (validateCoordinateInput(inputAxis)) {
    return inputAxis;
  }
  for (const ____________element of extraAxisOptions) {
    const axisValue =
      ____________element.axis ||
      _axisDirection(____________element.position) ||
      (inputAxis.length > 1 &&
        validateCoordinateInput(inputAxis[0].toLowerCase()));
    if (axisValue) {
      return axisValue;
    }
  }
  throw new Error(
    `Cannot determine type of '${inputAxis}' axis. Please provide 'axis' or 'position' option.`,
  );
}
function axisCheck(targetAxisID, __axisDirection, _____axisIdentifier) {
  if (_____axisIdentifier[__axisDirection + "AxisID"] === targetAxisID) {
    return {
      axis: __axisDirection,
    };
  }
}
function retrieveAxisData(axisId, __________________chartData) {
  if (
    __________________chartData.data &&
    __________________chartData.data.datasets
  ) {
    const filteredDatasets = __________________chartData.data.datasets.filter(
      (_______axisIdentifier) =>
        _______axisIdentifier.xAxisID === axisId ||
        _______axisIdentifier.yAxisID === axisId,
    );
    if (filteredDatasets.length) {
      return (
        axisCheck(axisId, "x", filteredDatasets[0]) ||
        axisCheck(axisId, "y", filteredDatasets[0])
      );
    }
  }
  return {};
}
function updateChartAnimation(__chartConfig, scaleConfiguration) {
  const currentAnimationConfig = animationStep[__chartConfig.type] || {
    scales: {},
  };
  const scaleConfigurations = scaleConfiguration.scales || {};
  const datasetIndexAxis = getDatasetIndexAxis(
    __chartConfig.type,
    scaleConfiguration,
  );
  const animationUpdates = Object.create(null);
  Object.keys(scaleConfigurations).forEach((_scaleKey) => {
    const _scaleConfiguration = scaleConfigurations[_scaleKey];
    if (!currentAnimationIndex(_scaleConfiguration)) {
      return console.error(
        `Invalid scale configuration for scale: ${_scaleKey}`,
      );
    }
    if (_scaleConfiguration._proxy) {
      return console.warn(
        `Ignoring resolver passed as options for scale: ${_scaleKey}`,
      );
    }
    const ____axisValue = determineAxisValue(
      _scaleKey,
      _scaleConfiguration,
      retrieveAxisData(_scaleKey, __chartConfig),
      animationDuration.scales[_scaleConfiguration.type],
    );
    const valueComparisonResult = compareValues(
      ____axisValue,
      datasetIndexAxis,
    );
    const _scaleConfigurations = currentAnimationConfig.scales || {};
    animationUpdates[_scaleKey] = lastUpdateDate(Object.create(null), [
      {
        axis: ____axisValue,
      },
      _scaleConfiguration,
      _scaleConfigurations[____axisValue],
      _scaleConfigurations[valueComparisonResult],
    ]);
  });
  __chartConfig.data.datasets.forEach((____________inputData) => {
    const __chartType = ____________inputData.type || __chartConfig.type;
    const _indexAxis =
      ____________inputData.indexAxis ||
      getDatasetIndexAxis(__chartType, scaleConfiguration);
    const scaleAnimations = (animationStep[__chartType] || {}).scales || {};
    Object.keys(scaleAnimations).forEach((_______inputValue) => {
      const __axisIdentifier = getValueOrIndex(_______inputValue, _indexAxis);
      const ___axisIdentifier =
        ____________inputData[__axisIdentifier + "AxisID"] || __axisIdentifier;
      animationUpdates[___axisIdentifier] =
        animationUpdates[___axisIdentifier] || Object.create(null);
      lastUpdateDate(animationUpdates[___axisIdentifier], [
        {
          axis: __axisIdentifier,
        },
        scaleConfigurations[___axisIdentifier],
        scaleAnimations[_______inputValue],
      ]);
    });
  });
  Object.keys(animationUpdates).forEach((animationTypeIndex) => {
    const ________________element = animationUpdates[animationTypeIndex];
    lastUpdateDate(________________element, [
      animationDuration.scales[________________element.type],
      animationDuration.scale,
    ]);
  });
  return animationUpdates;
}
function isChartDataValid(inputChartData) {
  const _optionsConfig = (inputChartData.options ||= {});
  _optionsConfig.plugins = chartAnimationRunning(_optionsConfig.plugins, {});
  _optionsConfig.scales = updateChartAnimation(inputChartData, _optionsConfig);
}
function prepareChartOptions(_configOptions) {
  (_configOptions = _configOptions || {}).datasets =
    _configOptions.datasets || [];
  _configOptions.labels = _configOptions.labels || [];
  return _configOptions;
}
function ___________chartOptions(_______chartOptions) {
  (_______chartOptions = _______chartOptions || {}).data = prepareChartOptions(
    _______chartOptions.data,
  );
  isChartDataValid(_______chartOptions);
  return _______chartOptions;
}
const _____animationManager = new Map();
const chartsMap = new Set();
function getOrCreateAnimationInstance(_animationKey, createAnimationInstance) {
  let _animationInstance = _____animationManager.get(_animationKey);
  if (!_animationInstance) {
    _animationInstance = createAnimationInstance();
    _____animationManager.set(_animationKey, _animationInstance);
    chartsMap.add(_animationInstance);
  }
  return _animationInstance;
}
const isAnimationRunning = (
  animationFrameIdSet,
  _animationFrameId,
  _animationFrameIndex,
) => {
  const __animationFrameId = _requestAnimationFrameId(
    _animationFrameId,
    _animationFrameIndex,
  );
  if (__animationFrameId !== undefined) {
    animationFrameIdSet.add(__animationFrameId);
  }
};
class ChartConfiguration {
  constructor(____________chartOptions) {
    this._config = ___________chartOptions(____________chartOptions);
    this._scopeCache = new Map();
    this._resolverCache = new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(newType) {
    this._config.type = newType;
  }
  get data() {
    return this._config.data;
  }
  set data(__________chartOptions) {
    this._config.data = prepareChartOptions(__________chartOptions);
  }
  get options() {
    return this._config.options;
  }
  set options(optionsParam) {
    this._config.options = optionsParam;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const __config = this._config;
    this.clearCache();
    isChartDataValid(__config);
  }
  clearCache() {
    this._scopeCache.clear();
    this._resolverCache.clear();
  }
  datasetScopeKeys(datasetKey) {
    return getOrCreateAnimationInstance(datasetKey, () => [
      [`datasets.${datasetKey}`, ""],
    ]);
  }
  datasetAnimationScopeKeys(__datasetKey, transitionKey) {
    return getOrCreateAnimationInstance(
      `${__datasetKey}.transition.${transitionKey}`,
      () => [
        [
          `datasets.${__datasetKey}.transitions.${transitionKey}`,
          `transitions.${transitionKey}`,
        ],
        [`datasets.${__datasetKey}`, ""],
      ],
    );
  }
  datasetElementScopeKeys(_datasetKey, __elementKey) {
    return getOrCreateAnimationInstance(
      `${_datasetKey}-${__elementKey}`,
      () => [
        [
          `datasets.${_datasetKey}.elements.${__elementKey}`,
          `datasets.${_datasetKey}`,
          `elements.${__elementKey}`,
          "",
        ],
      ],
    );
  }
  pluginScopeKeys(pluginScopeKey) {
    const _pluginId = pluginScopeKey.id;
    return getOrCreateAnimationInstance(
      `${this.type}-plugin-${_pluginId}`,
      () => [
        [
          `plugins.${_pluginId}`,
          ...(pluginScopeKey.additionalOptionScopes || []),
        ],
      ],
    );
  }
  _cachedScopes(scopeKey, shouldReinitialize) {
    const scopeCache = this._scopeCache;
    let scopeMap = scopeCache.get(scopeKey);
    if (!scopeMap || !!shouldReinitialize) {
      scopeMap = new Map();
      scopeCache.set(scopeKey, scopeMap);
    }
    return scopeMap;
  }
  getOptionScopes(animationTrigger, eventList, eventListIndex) {
    const { options: _____________animationOptions, type: ____animationType } =
      this;
    const cachedAnimationScopes = this._cachedScopes(
      animationTrigger,
      eventListIndex,
    );
    const animationResult = cachedAnimationScopes.get(eventList);
    if (animationResult) {
      return animationResult;
    }
    const activeAnimationSet = new Set();
    eventList.forEach((_elementList) => {
      if (animationTrigger) {
        activeAnimationSet.add(animationTrigger);
        _elementList.forEach((_____________event) =>
          isAnimationRunning(
            activeAnimationSet,
            animationTrigger,
            _____________event,
          ),
        );
      }
      _elementList.forEach((_time) =>
        isAnimationRunning(
          activeAnimationSet,
          _____________animationOptions,
          _time,
        ),
      );
      _elementList.forEach((time) =>
        isAnimationRunning(
          activeAnimationSet,
          animationStep[____animationType] || {},
          time,
        ),
      );
      _elementList.forEach((animationStartTime) =>
        isAnimationRunning(
          activeAnimationSet,
          animationDuration,
          animationStartTime,
        ),
      );
      _elementList.forEach((timeParameter) =>
        isAnimationRunning(activeAnimationSet, animationTask, timeParameter),
      );
    });
    const animationHandles = Array.from(activeAnimationSet);
    if (animationHandles.length === 0) {
      animationHandles.push(Object.create(null));
    }
    if (chartsMap.has(eventList)) {
      cachedAnimationScopes.set(eventList, animationHandles);
    }
    return animationHandles;
  }
  chartOptionScopes() {
    const { options: ______________chartOptions, type: _chartType } = this;
    return [
      ______________chartOptions,
      animationStep[_chartType] || {},
      animationDuration.datasets[_chartType] || {},
      {
        type: _chartType,
      },
      animationDuration,
      animationTask,
    ];
  }
  resolveNamedOptions(
    namedOptions,
    elementKeys,
    __animationFrameRequestId,
    _defaultOptions = [""],
  ) {
    const _resolverOptions = {
      $shared: true,
    };
    const { resolver: __resolverOptions, subPrefixes: subPrefixes } =
      elementMap(this._resolverCache, namedOptions, _defaultOptions);
    let ___resolverOptions = __resolverOptions;
    if (checkElementAnimation(__resolverOptions, elementKeys)) {
      _resolverOptions.$shared = false;
      if (___requestAnimationFrameId(__animationFrameRequestId)) {
        __animationFrameRequestId = __animationFrameRequestId();
      } else {
        __animationFrameRequestId = __animationFrameRequestId;
      }
      const optionValue = this.createResolver(
        namedOptions,
        __animationFrameRequestId,
        subPrefixes,
      );
      ___resolverOptions = chartAnimationItems(
        __resolverOptions,
        __animationFrameRequestId,
        optionValue,
      );
    }
    for (const _elementKey of elementKeys) {
      _resolverOptions[_elementKey] = ___resolverOptions[_elementKey];
    }
    return _resolverOptions;
  }
  createResolver(
    animationResolver,
    _currentAnimation,
    animationFrames = [""],
    __________animationDuration,
  ) {
    const { resolver: animationResolverContents } = elementMap(
      this._resolverCache,
      animationResolver,
      animationFrames,
    );
    if (currentAnimationIndex(_currentAnimation)) {
      return chartAnimationItems(
        animationResolverContents,
        _currentAnimation,
        undefined,
        __________animationDuration,
      );
    } else {
      return animationResolverContents;
    }
  }
}
function elementMap(targetMap, elementKey, ______inputArray) {
  let elementMapCache = targetMap.get(elementKey);
  if (!elementMapCache) {
    elementMapCache = new Map();
    targetMap.set(elementKey, elementMapCache);
  }
  const inputArrayJoined = ______inputArray.join();
  let __elementData = elementMapCache.get(inputArrayJoined);
  if (!__elementData) {
    __elementData = {
      resolver: lastTickValue(elementKey, ______inputArray),
      subPrefixes: ______inputArray.filter(
        (isNotHoverText) => !isNotHoverText.toLowerCase().includes("hover"),
      ),
    };
    elementMapCache.set(inputArrayJoined, __elementData);
  }
  return __elementData;
}
const ___animationContext = (currentAnimation) =>
  currentAnimationIndex(currentAnimation) &&
  Object.getOwnPropertyNames(currentAnimation).reduce(
    (isAnimationFrameActive, _currentAnimationIndex) =>
      isAnimationFrameActive ||
      ___requestAnimationFrameId(currentAnimation[_currentAnimationIndex]),
    false,
  );
function checkElementAnimation(inputParameter, elementList) {
  const {
    isScriptable: getElementAnimationInfo,
    isIndexable: isElementIndexable,
  } = _chartAnimationItems(inputParameter);
  for (const _____________element of elementList) {
    const elementInfo = getElementAnimationInfo(_____________element);
    const sourceValue = isElementIndexable(_____________element);
    const isElementActive =
      (sourceValue || elementInfo) && inputParameter[_____________element];
    if (
      (elementInfo &&
        (___requestAnimationFrameId(isElementActive) ||
          ___animationContext(isElementActive))) ||
      (sourceValue && animatedChartItems(isElementActive))
    ) {
      return true;
    }
  }
  return false;
}
var chartAnimationList = "4.4.0";
const __animationQueue = ["top", "bottom", "left", "right", "chartArea"];
function isVerticalPosition(positionType, _positionType) {
  return (
    positionType === "top" ||
    positionType === "bottom" ||
    (__animationQueue.indexOf(positionType) === -1 && _positionType === "x")
  );
}
function compareByField(comparisonKey, propertyToCompare) {
  return function (itemToCompare, secondItem) {
    if (itemToCompare[comparisonKey] === secondItem[comparisonKey]) {
      return itemToCompare[propertyToCompare] - secondItem[propertyToCompare];
    } else {
      return itemToCompare[comparisonKey] - secondItem[comparisonKey];
    }
  };
}
function chartDataProcessingFunction(jsChartData) {
  const _____________chartOptions = jsChartData.chart;
  const ______animationOptions = _____________chartOptions.options.animation;
  _____________chartOptions.notifyPlugins("afterRender");
  ________animationContext(
    ______animationOptions && ______animationOptions.onComplete,
    [jsChartData],
    _____________chartOptions,
  );
}
function __processChartData(_________________________chartData) {
  const __chart = _________________________chartData.chart;
  const _____animationOptions = __chart.options.animation;
  ________animationContext(
    _____animationOptions && _____animationOptions.onProgress,
    [_________________________chartData],
    __chart,
  );
}
function getElementFromSelector(elementOrSelector) {
  if (_________animationManager() && typeof elementOrSelector == "string") {
    elementOrSelector = document.getElementById(elementOrSelector);
  } else if (elementOrSelector && elementOrSelector.length) {
    elementOrSelector = elementOrSelector[0];
  }
  if (elementOrSelector && elementOrSelector.canvas) {
    elementOrSelector = elementOrSelector.canvas;
  }
  return elementOrSelector;
}
const currentStep = {};
const __notificationFunction = (selectedElement) => {
  const _selectedElement = getElementFromSelector(selectedElement);
  return Object.values(currentStep)
    .filter((targetCanvas) => targetCanvas.canvas === _selectedElement)
    .pop();
};
function shiftedIndex(inputObject, threshold, indexOffset) {
  const inputKeys = Object.keys(inputObject);
  for (const _currentValue of inputKeys) {
    const numberValue = +_currentValue;
    if (numberValue >= threshold) {
      const ________inputValue = inputObject[_currentValue];
      delete inputObject[_currentValue];
      if (indexOffset > 0 || numberValue > threshold) {
        inputObject[numberValue + indexOffset] = ________inputValue;
      }
    }
  }
}
function determineReturnValue(
  _______event,
  ________event,
  isConditionMet,
  _isConditionMet,
) {
  if (isConditionMet && _______event.type !== "mouseout") {
    if (_isConditionMet) {
      return ________event;
    } else {
      return _______event;
    }
  } else {
    return null;
  }
}
function getValueBasedOnClip(
  ___target,
  ________element,
  _____________________________________index,
) {
  if (___target.options.clip) {
    return ___target[_____________________________________index];
  } else {
    return ________element[_____________________________________index];
  }
}
function calculateChartBounds(_____chartDimensions, _event) {
  const { xScale: xScale, yScale: yScale } = _____chartDimensions;
  if (xScale && yScale) {
    return {
      left: getValueBasedOnClip(xScale, _event, "left"),
      right: getValueBasedOnClip(xScale, _event, "right"),
      top: getValueBasedOnClip(yScale, _event, "top"),
      bottom: getValueBasedOnClip(yScale, _event, "bottom"),
    };
  } else {
    return _event;
  }
}
class Chart {
  static defaults = animationDuration;
  static instances = currentStep;
  static overrides = animationStep;
  static registry = chartRegistry;
  static version = chartAnimationList;
  static getChart = __notificationFunction;
  static register(...registrationParams) {
    chartRegistry.add(...registrationParams);
    updateLastDate();
  }
  static unregister(..._unregisterArgs) {
    chartRegistry.remove(..._unregisterArgs);
    updateLastDate();
  }
  constructor(canvasSelector, chartConfiguration) {
    const _________________chartConfig = (this.config = new ChartConfiguration(
      chartConfiguration,
    ));
    const ______________canvasElement = getElementFromSelector(canvasSelector);
    const notification = __notificationFunction(______________canvasElement);
    if (notification) {
      throw new Error(
        "Canvas is already in use. Chart with ID '" +
          notification.id +
          "' must be destroyed before the canvas with ID '" +
          notification.canvas.id +
          "' can be reused.",
      );
    }
    const chartResolver = _________________chartConfig.createResolver(
      _________________chartConfig.chartOptionScopes(),
      this.getContext(),
    );
    this.platform = new (_________________chartConfig.platform ||
      getCanvasContext(______________canvasElement))();
    this.platform.updateConfig(_________________chartConfig);
    const ___canvasRenderingContext = this.platform.acquireContext(
      ______________canvasElement,
      chartResolver.aspectRatio,
    );
    const _______________canvasElement =
      ___canvasRenderingContext && ___canvasRenderingContext.canvas;
    const _canvasHeight =
      _______________canvasElement && _______________canvasElement.height;
    const canvasWidth =
      _______________canvasElement && _______________canvasElement.width;
    this.id = animationController();
    this.ctx = ___canvasRenderingContext;
    this.canvas = _______________canvasElement;
    this.width = canvasWidth;
    this.height = _canvasHeight;
    this._options = chartResolver;
    this._aspectRatio = this.aspectRatio;
    this._layers = [];
    this._metasets = [];
    this._stacks = undefined;
    this.boxes = [];
    this.currentDevicePixelRatio = undefined;
    this.chartArea = undefined;
    this._active = [];
    this._lastEvent = undefined;
    this._listeners = {};
    this._responsiveListeners = undefined;
    this._sortedMetasets = [];
    this.scales = {};
    this._plugins = new PluginManager();
    this.$proxies = {};
    this._hiddenIndices = {};
    this.attached = false;
    this._animationsDisabled = undefined;
    this.$context = undefined;
    this._doResize = animationFrameRequestId(
      (updateTimestamp) => this.update(updateTimestamp),
      chartResolver.resizeDelay || 0,
    );
    this._dataChanges = [];
    currentStep[this.id] = this;
    if (___canvasRenderingContext && _______________canvasElement) {
      animationControllerInstance.listen(
        this,
        "complete",
        chartDataProcessingFunction,
      );
      animationControllerInstance.listen(this, "progress", __processChartData);
      this._initialize();
      if (this.attached) {
        this.update();
      }
    } else {
      console.error(
        "Failed to create chart: can't acquire context from the given item",
      );
    }
  }
  get aspectRatio() {
    const {
      options: {
        aspectRatio: aspectRatioValue,
        maintainAspectRatio: isMaintainAspectRatio,
      },
      width: widthValue,
      height: heightValue,
      _aspectRatio: aspectRatioValueOverride,
    } = this;
    if (chartUpdateInterval(aspectRatioValue)) {
      if (isMaintainAspectRatio && aspectRatioValueOverride) {
        return aspectRatioValueOverride;
      } else if (heightValue) {
        return widthValue / heightValue;
      } else {
        return null;
      }
    } else {
      return aspectRatioValue;
    }
  }
  get data() {
    return this.config.data;
  }
  set data(________inputData) {
    this.config.data = ________inputData;
  }
  get options() {
    return this._options;
  }
  set options(optionsSetting) {
    this.config.options = optionsSetting;
  }
  get registry() {
    return chartRegistry;
  }
  _initialize() {
    this.notifyPlugins("beforeInit");
    if (this.options.responsive) {
      this.resize();
    } else {
      _animationFrameRequestId(this, this.options.devicePixelRatio);
    }
    this.bindEvents();
    this.notifyPlugins("afterInit");
    return this;
  }
  clear() {
    animationFrameRequest(this.canvas, this.ctx);
    return this;
  }
  stop() {
    animationControllerInstance.stop(this);
    return this;
  }
  resize(___width, resizeHeight) {
    if (animationControllerInstance.running(this)) {
      this._resizeBeforeDraw = {
        width: ___width,
        height: resizeHeight,
      };
    } else {
      this._resize(___width, resizeHeight);
    }
  }
  _resize(_newWidth, canvasSize) {
    const _______________________options = this.options;
    const _____________canvasElement = this.canvas;
    const isAspectRatioMaintained =
      _______________________options.maintainAspectRatio && this.aspectRatio;
    const maximumCanvasSize = this.platform.getMaximumSize(
      _____________canvasElement,
      _newWidth,
      canvasSize,
      isAspectRatioMaintained,
    );
    const devicePixelRatio =
      _______________________options.devicePixelRatio ||
      this.platform.getDevicePixelRatio();
    const resizeAction = this.width ? "resize" : "attach";
    this.width = maximumCanvasSize.width;
    this.height = maximumCanvasSize.height;
    this._aspectRatio = this.aspectRatio;
    if (_animationFrameRequestId(this, devicePixelRatio, true)) {
      this.notifyPlugins("resize", {
        size: maximumCanvasSize,
      });
      ________animationContext(
        _______________________options.onResize,
        [this, maximumCanvasSize],
        this,
      );
      if (this.attached && this._doResize(resizeAction)) {
        this.render();
      }
    }
  }
  ensureScalesHaveIDs() {
    const scaleOptions = this.options.scales || {};
    __lastDateUpdated(scaleOptions, (___targetObject, elementId) => {
      ___targetObject.id = elementId;
    });
  }
  buildOrUpdateScales() {
    const shouldDelete = this.options;
    const scalesOptions = shouldDelete.scales;
    const scalesMap = this.scales;
    const scaleStatusMap = Object.keys(scalesMap).reduce((statusMap, key) => {
      statusMap[key] = false;
      return statusMap;
    }, {});
    let __scaleConfigurations = [];
    if (scalesOptions) {
      __scaleConfigurations = __scaleConfigurations.concat(
        Object.keys(scalesOptions).map((_____dataIndex) => {
          const currentDataPoint = scalesOptions[_____dataIndex];
          const chartType = determineAxisValue(
            _____dataIndex,
            currentDataPoint,
          );
          const isRadial = chartType === "r";
          const isXAxis = chartType === "x";
          return {
            options: currentDataPoint,
            dposition: isRadial ? "chartArea" : isXAxis ? "bottom" : "left",
            dtype: isRadial ? "radialLinear" : isXAxis ? "category" : "linear",
          };
        }),
      );
    }
    __lastDateUpdated(__scaleConfigurations, (eventData) => {
      const eventOptions = eventData.options;
      const optionId = eventOptions.id;
      const seriesScale = determineAxisValue(optionId, eventOptions);
      const isChartAnimationRunning = chartAnimationRunning(
        eventOptions.type,
        eventData.dtype,
      );
      if (
        eventOptions.position === undefined ||
        isVerticalPosition(eventOptions.position, seriesScale) !==
          isVerticalPosition(eventData.dposition)
      ) {
        eventOptions.position = eventData.dposition;
      }
      scaleStatusMap[optionId] = true;
      let scaleInstance = null;
      if (
        optionId in scalesMap &&
        scalesMap[optionId].type === isChartAnimationRunning
      ) {
        scaleInstance = scalesMap[optionId];
      } else {
        scaleInstance = new (chartRegistry.getScale(isChartAnimationRunning))({
          id: optionId,
          type: isChartAnimationRunning,
          ctx: this.ctx,
          chart: this,
        });
        scalesMap[scaleInstance.id] = scaleInstance;
      }
      scaleInstance.init(eventOptions, shouldDelete);
    });
    __lastDateUpdated(scaleStatusMap, (isActive, ___propertyKey) => {
      if (!isActive) {
        delete scalesMap[___propertyKey];
      }
    });
    __lastDateUpdated(scalesMap, (task) => {
      ___________animationIndex.configure(this, task, task.options);
      ___________animationIndex.addBox(this, task);
    });
  }
  _updateMetasets() {
    const ______________________________datasetIndex = this._metasets;
    const _datasetsCount = this.data.datasets.length;
    const metasetCount = ______________________________datasetIndex.length;
    ______________________________datasetIndex.sort(
      (targetIndex, _____elementIndex) =>
        targetIndex.index - _____elementIndex.index,
    );
    if (metasetCount > _datasetsCount) {
      for (
        let _____________________________datasetIndex = _datasetsCount;
        _____________________________datasetIndex < metasetCount;
        ++_____________________________datasetIndex
      ) {
        this._destroyDatasetMeta(_____________________________datasetIndex);
      }
      ______________________________datasetIndex.splice(
        _datasetsCount,
        metasetCount - _datasetsCount,
      );
    }
    this._sortedMetasets = ______________________________datasetIndex
      .slice(0)
      .sort(compareByField("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const {
      _metasets: metasetList,
      data: { datasets: _datasets },
    } = this;
    if (metasetList.length > _datasets.length) {
      delete this._stacks;
    }
    metasetList.forEach((datasetToCheck, _datasetMetaIndex) => {
      if (
        _datasets.filter(
          (isMatchingDataset) => isMatchingDataset === datasetToCheck._dataset,
        ).length === 0
      ) {
        this._destroyDatasetMeta(_datasetMetaIndex);
      }
    });
  }
  buildOrUpdateControllers() {
    const controllersList = [];
    const __datasets = this.data.datasets;
    let datasetIndex;
    let __datasetsCount;
    this._removeUnreferencedMetasets();
    datasetIndex = 0;
    __datasetsCount = __datasets.length;
    for (; datasetIndex < __datasetsCount; datasetIndex++) {
      const _dataset = __datasets[datasetIndex];
      let __datasetMeta = this.getDatasetMeta(datasetIndex);
      const datasetType = _dataset.type || this.config.type;
      if (__datasetMeta.type && __datasetMeta.type !== datasetType) {
        this._destroyDatasetMeta(datasetIndex);
        __datasetMeta = this.getDatasetMeta(datasetIndex);
      }
      __datasetMeta.type = datasetType;
      __datasetMeta.indexAxis =
        _dataset.indexAxis || getDatasetIndexAxis(datasetType, this.options);
      __datasetMeta.order = _dataset.order || 0;
      __datasetMeta.index = datasetIndex;
      __datasetMeta.label = "" + _dataset.label;
      __datasetMeta.visible = this.isDatasetVisible(datasetIndex);
      if (__datasetMeta.controller) {
        __datasetMeta.controller.updateIndex(datasetIndex);
        __datasetMeta.controller.linkScales();
      } else {
        const __dataset = chartRegistry.getController(datasetType);
        const {
          datasetElementType: currentDataset,
          dataElementType: dataElementTypeName,
        } = animationDuration.datasets[datasetType];
        Object.assign(__dataset, {
          dataElementType: chartRegistry.getElement(dataElementTypeName),
          datasetElementType:
            currentDataset && chartRegistry.getElement(currentDataset),
        });
        __datasetMeta.controller = new __dataset(this, datasetIndex);
        controllersList.push(__datasetMeta.controller);
      }
    }
    this._updateMetasets();
    return controllersList;
  }
  _resetElements() {
    __lastDateUpdated(
      this.data.datasets,
      (_______________________________datasetIndex, __________datasetMeta) => {
        this.getDatasetMeta(__________datasetMeta).controller.reset();
      },
      this,
    );
  }
  reset() {
    this._resetElements();
    this.notifyPlugins("reset");
  }
  update(______________datasetIndex) {
    const ___config = this.config;
    ___config.update();
    const optionsResolver = (this._options = ___config.createResolver(
      ___config.chartOptionScopes(),
      this.getContext(),
    ));
    const isDatasetAbsent = (this._animationsDisabled =
      !optionsResolver.animation);
    this._updateScales();
    this._checkEventBindings();
    this._updateHiddenIndices();
    this._plugins.invalidate();
    if (
      this.notifyPlugins("beforeUpdate", {
        mode: ______________datasetIndex,
        cancelable: true,
      }) === false
    ) {
      return;
    }
    const updatedControllers = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let maxOverflowValue = 0;
    for (
      let _____________datasetIndex = 0,
        _datasetCount = this.data.datasets.length;
      _____________datasetIndex < _datasetCount;
      _____________datasetIndex++
    ) {
      const { controller: datasetMetaController } = this.getDatasetMeta(
        _____________datasetIndex,
      );
      const isDatasetNotIncluded =
        !isDatasetAbsent &&
        updatedControllers.indexOf(datasetMetaController) === -1;
      datasetMetaController.buildOrUpdateElements(isDatasetNotIncluded);
      maxOverflowValue = Math.max(
        +datasetMetaController.getMaxOverflow(),
        maxOverflowValue,
      );
    }
    maxOverflowValue = this._minPadding = optionsResolver.layout.autoPadding
      ? maxOverflowValue
      : 0;
    this._updateLayout(maxOverflowValue);
    if (!isDatasetAbsent) {
      __lastDateUpdated(updatedControllers, (resettableObject) => {
        resettableObject.reset();
      });
    }
    this._updateDatasets(______________datasetIndex);
    this.notifyPlugins("afterUpdate", {
      mode: ______________datasetIndex,
    });
    this._layers.sort(compareByField("z", "_idx"));
    const { _active: _______activeElements, _lastEvent: _lastEvent } = this;
    if (_lastEvent) {
      this._eventHandler(_lastEvent, true);
    } else if (_______activeElements.length) {
      this._updateHoverStyles(
        _______activeElements,
        _______activeElements,
        true,
      );
    }
    this.render();
  }
  _updateScales() {
    __lastDateUpdated(this.scales, (_boxToRemove) => {
      ___________animationIndex.removeBox(this, _boxToRemove);
    });
    this.ensureScalesHaveIDs();
    this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const __eventOptions = this.options;
    const listenerEventKeysSet = new Set(Object.keys(this._listeners));
    const eventSet = new Set(__eventOptions.events);
    if (
      !minimizedTime(listenerEventKeysSet, eventSet) ||
      !!this._responsiveListeners !== __eventOptions.responsive
    ) {
      this.unbindEvents();
      this.bindEvents();
    }
  }
  _updateHiddenIndices() {
    const { _hiddenIndices: hiddenIndices } = this;
    const uniformDataChanges = this._getUniformDataChanges() || [];
    for (const {
      method: httpMethod,
      start: ______startIndex,
      count: _elementCount,
    } of uniformDataChanges) {
      shiftedIndex(
        hiddenIndices,
        ______startIndex,
        httpMethod === "_removeElements" ? -_elementCount : _elementCount,
      );
    }
  }
  _getUniformDataChanges() {
    const _currentIteration = this._dataChanges;
    if (!_currentIteration || !_currentIteration.length) {
      return;
    }
    this._dataChanges = [];
    const ___datasetCount = this.data.datasets.length;
    const datasetFilterFunction = (currentIterationIdentifier) =>
      new Set(
        _currentIteration
          .filter(
            (currentIterationValue) =>
              currentIterationValue[0] === currentIterationIdentifier,
          )
          .map(
            (_itemsList, firstElement) =>
              firstElement + "," + _itemsList.splice(1).join(","),
          ),
      );
    const filteredDatasetIdentifiers = datasetFilterFunction(0);
    for (
      let currentIteration = 1;
      currentIteration < ___datasetCount;
      currentIteration++
    ) {
      if (
        !minimizedTime(
          filteredDatasetIdentifiers,
          datasetFilterFunction(currentIteration),
        )
      ) {
        return;
      }
    }
    return Array.from(filteredDatasetIdentifiers)
      .map((commaSeparatedValues) => commaSeparatedValues.split(","))
      .map((tokenArray) => ({
        method: tokenArray[1],
        start: +tokenArray[2],
        count: +tokenArray[3],
      }));
  }
  _updateLayout(timeSinceStart) {
    if (
      this.notifyPlugins("beforeLayout", {
        cancelable: true,
      }) === false
    ) {
      return;
    }
    ___________animationIndex.update(
      this,
      this.width,
      this.height,
      timeSinceStart,
    );
    const _chartAreaDimensions = this.chartArea;
    const isInitialized =
      _chartAreaDimensions.width <= 0 || _chartAreaDimensions.height <= 0;
    this._layers = [];
    __lastDateUpdated(
      this.boxes,
      (chartLayer) => {
        if (!isInitialized || chartLayer.position !== "chartArea") {
          if (chartLayer.configure) {
            chartLayer.configure();
          }
          this._layers.push(...chartLayer._layers());
        }
      },
      this,
    );
    this._layers.forEach(
      (
        ___________________________________________________index,
        ____________________________________________________index,
      ) => {
        ___________________________________________________index._idx =
          ____________________________________________________index;
      },
    );
    this.notifyPlugins("afterLayout");
  }
  _updateDatasets(__________________________datasetIndex) {
    if (
      this.notifyPlugins("beforeDatasetsUpdate", {
        mode: __________________________datasetIndex,
        cancelable: true,
      }) !== false
    ) {
      for (
        let _________________________datasetIndex = 0,
          datasetsCount = this.data.datasets.length;
        _________________________datasetIndex < datasetsCount;
        ++_________________________datasetIndex
      ) {
        this.getDatasetMeta(
          _________________________datasetIndex,
        ).controller.configure();
      }
      for (
        let ___________________datasetIndex = 0,
          __datasetCount = this.data.datasets.length;
        ___________________datasetIndex < __datasetCount;
        ++___________________datasetIndex
      ) {
        this._updateDataset(
          ___________________datasetIndex,
          ___requestAnimationFrameId(__________________________datasetIndex)
            ? __________________________datasetIndex({
                datasetIndex: ___________________datasetIndex,
              })
            : __________________________datasetIndex,
        );
      }
      this.notifyPlugins("afterDatasetsUpdate", {
        mode: __________________________datasetIndex,
      });
    }
  }
  _updateDataset(
    _________________________________________datasetIndex,
    updateMode,
  ) {
    const _______________datasetMeta = this.getDatasetMeta(
      _________________________________________datasetIndex,
    );
    const datasetUpdateInfo = {
      meta: _______________datasetMeta,
      index: _________________________________________datasetIndex,
      mode: updateMode,
      cancelable: true,
    };
    if (
      this.notifyPlugins("beforeDatasetUpdate", datasetUpdateInfo) !== false
    ) {
      _______________datasetMeta.controller._update(updateMode);
      datasetUpdateInfo.cancelable = false;
      this.notifyPlugins("afterDatasetUpdate", datasetUpdateInfo);
    }
  }
  render() {
    if (
      this.notifyPlugins("beforeRender", {
        cancelable: true,
      }) !== false
    ) {
      if (animationControllerInstance.has(this)) {
        if (this.attached && !animationControllerInstance.running(this)) {
          animationControllerInstance.start(this);
        }
      } else {
        this.draw();
        chartDataProcessingFunction({
          chart: this,
        });
      }
    }
  }
  draw() {
    let indexForDrawing;
    if (this._resizeBeforeDraw) {
      const { width: resizeWidth, height: layerArray } = this._resizeBeforeDraw;
      this._resize(resizeWidth, layerArray);
      this._resizeBeforeDraw = null;
    }
    this.clear();
    if (this.width <= 0 || this.height <= 0) {
      return;
    }
    if (
      this.notifyPlugins("beforeDraw", {
        cancelable: true,
      }) === false
    ) {
      return;
    }
    const layersArray = this._layers;
    for (
      indexForDrawing = 0;
      indexForDrawing < layersArray.length &&
      layersArray[indexForDrawing].z <= 0;
      ++indexForDrawing
    ) {
      layersArray[indexForDrawing].draw(this.chartArea);
    }
    for (
      this._drawDatasets();
      indexForDrawing < layersArray.length;
      ++indexForDrawing
    ) {
      layersArray[indexForDrawing].draw(this.chartArea);
    }
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(__isConditionMet) {
    const sortedMetasets = this._sortedMetasets;
    const filteredMetas = [];
    let _____________________________currentIndex;
    let totalSortedMetas;
    _____________________________currentIndex = 0;
    totalSortedMetas = sortedMetasets.length;
    for (
      ;
      _____________________________currentIndex < totalSortedMetas;
      ++_____________________________currentIndex
    ) {
      const ___elementCount =
        sortedMetasets[_____________________________currentIndex];
      if (!__isConditionMet || !!___elementCount.visible) {
        filteredMetas.push(___elementCount);
      }
    }
    return filteredMetas;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(true);
  }
  _drawDatasets() {
    if (
      this.notifyPlugins("beforeDatasetsDraw", {
        cancelable: true,
      }) === false
    ) {
      return;
    }
    const __sortedVisibleDatasetMetas = this.getSortedVisibleDatasetMetas();
    for (
      let ____________________________datasetIndex =
        __sortedVisibleDatasetMetas.length - 1;
      ____________________________datasetIndex >= 0;
      --____________________________datasetIndex
    ) {
      this._drawDataset(
        __sortedVisibleDatasetMetas[____________________________datasetIndex],
      );
    }
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(____________dataset) {
    const _________________________________canvasContext = this.ctx;
    const clipData = ____________dataset._clip;
    const isClipDisabled = !clipData.disabled;
    const chartBounds = calculateChartBounds(
      ____________dataset,
      this.chartArea,
    );
    const datasetDrawOptions = {
      meta: ____________dataset,
      index: ____________dataset.index,
      cancelable: true,
    };
    if (this.notifyPlugins("beforeDatasetDraw", datasetDrawOptions) !== false) {
      if (isClipDisabled) {
        __________animationManager(
          _________________________________canvasContext,
          {
            left:
              clipData.left === false ? 0 : chartBounds.left - clipData.left,
            right:
              clipData.right === false
                ? this.width
                : chartBounds.right + clipData.right,
            top: clipData.top === false ? 0 : chartBounds.top - clipData.top,
            bottom:
              clipData.bottom === false
                ? this.height
                : chartBounds.bottom + clipData.bottom,
          },
        );
      }
      ____________dataset.controller.draw();
      if (isClipDisabled) {
        ______chartAnimationQueue(
          _________________________________canvasContext,
        );
      }
      datasetDrawOptions.cancelable = false;
      this.notifyPlugins("afterDatasetDraw", datasetDrawOptions);
    }
  }
  isPointInArea(__pointCoordinates) {
    return chartUpdater(__pointCoordinates, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(
    __eventTarget,
    eventModeIndex,
    _eventIndex,
    ___eventData,
  ) {
    const eventMode = ____________animationController.modes[eventModeIndex];
    if (typeof eventMode == "function") {
      return eventMode(this, __eventTarget, _eventIndex, ___eventData);
    } else {
      return [];
    }
  }
  getDatasetMeta(____________________________________________datasetIndex) {
    const _________dataset =
      this.data.datasets[
        ____________________________________________datasetIndex
      ];
    const metasetArray = this._metasets;
    let __________________datasetMeta = metasetArray
      .filter(
        (_____targetElement) =>
          _____targetElement &&
          _____targetElement._dataset === _________dataset,
      )
      .pop();
    if (!__________________datasetMeta) {
      __________________datasetMeta = {
        type: null,
        data: [],
        dataset: null,
        controller: null,
        hidden: null,
        xAxisID: null,
        yAxisID: null,
        order: (_________dataset && _________dataset.order) || 0,
        index: ____________________________________________datasetIndex,
        _dataset: _________dataset,
        _parsed: [],
        _sorted: false,
      };
      metasetArray.push(__________________datasetMeta);
    }
    return __________________datasetMeta;
  }
  getContext() {
    return (this.$context ||= tooltipHandler(null, {
      chart: this,
      type: "chart",
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(________________________________________datasetIndex) {
    const ______dataset =
      this.data.datasets[________________________________________datasetIndex];
    if (!______dataset) {
      return false;
    }
    const ______________datasetMeta = this.getDatasetMeta(
      ________________________________________datasetIndex,
    );
    if (typeof ______________datasetMeta.hidden == "boolean") {
      return !______________datasetMeta.hidden;
    } else {
      return !______dataset.hidden;
    }
  }
  setDatasetVisibility(datasetId, isDatasetVisible) {
    this.getDatasetMeta(datasetId).hidden = !isDatasetVisible;
  }
  toggleDataVisibility(indexToToggle) {
    this._hiddenIndices[indexToToggle] = !this._hiddenIndices[indexToToggle];
  }
  getDataVisibility(
    ___________________________________________________________index,
  ) {
    return !this._hiddenIndices[
      ___________________________________________________________index
    ];
  }
  _updateVisibility(
    __________________________________________datasetIndex,
    ___________________________________________datasetIndex,
    _isVisible,
  ) {
    const visibilityState = _isVisible ? "show" : "hide";
    const ________________datasetMeta = this.getDatasetMeta(
      __________________________________________datasetIndex,
    );
    const __animationResolver =
      ________________datasetMeta.controller._resolveAnimations(
        undefined,
        visibilityState,
      );
    if (
      canvasContext(___________________________________________datasetIndex)
    ) {
      ________________datasetMeta.data[
        ___________________________________________datasetIndex
      ].hidden = !_isVisible;
      this.update();
    } else {
      this.setDatasetVisibility(
        __________________________________________datasetIndex,
        _isVisible,
      );
      __animationResolver.update(________________datasetMeta, {
        visible: _isVisible,
      });
      this.update((datasetIndexMatch) =>
        datasetIndexMatch.datasetIndex ===
        __________________________________________datasetIndex
          ? visibilityState
          : undefined,
      );
    }
  }
  hide(_______targetElement, ____isVisible) {
    this._updateVisibility(_______targetElement, ____isVisible, false);
  }
  show(___isVisible, visibilityToggle) {
    this._updateVisibility(___isVisible, visibilityToggle, true);
  }
  _destroyDatasetMeta(____________________________________datasetIndex) {
    const _____________datasetMeta =
      this._metasets[____________________________________datasetIndex];
    if (_____________datasetMeta && _____________datasetMeta.controller) {
      _____________datasetMeta.controller._destroy();
    }
    delete this._metasets[____________________________________datasetIndex];
  }
  _stop() {
    let ________________________________datasetIndex;
    let totalDatasetCount;
    this.stop();
    animationControllerInstance.remove(this);
    ________________________________datasetIndex = 0;
    totalDatasetCount = this.data.datasets.length;
    for (
      ;
      ________________________________datasetIndex < totalDatasetCount;
      ++________________________________datasetIndex
    ) {
      this._destroyDatasetMeta(________________________________datasetIndex);
    }
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas: ____________canvasElement, ctx: __canvasRenderingContext } =
      this;
    this._stop();
    this.config.clearCache();
    if (____________canvasElement) {
      this.unbindEvents();
      animationFrameRequest(
        ____________canvasElement,
        __canvasRenderingContext,
      );
      this.platform.releaseContext(__canvasRenderingContext);
      this.canvas = null;
      this.ctx = null;
    }
    delete currentStep[this.id];
    this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...base64ImageOptions) {
    return this.canvas.toDataURL(...base64ImageOptions);
  }
  bindEvents() {
    this.bindUserEvents();
    if (this.options.responsive) {
      this.bindResponsiveEvents();
    } else {
      this.attached = true;
    }
  }
  bindUserEvents() {
    const eventListeners = this._listeners;
    const eventPlatform = this.platform;
    const addEventListenerWithCallback = (
      ______eventType,
      ______eventHandler,
    ) => {
      eventPlatform.addEventListener(this, ______eventType, ______eventHandler);
      eventListeners[______eventType] = ______eventHandler;
    };
    const eventOffsetHandler = (eventOffset, eventOffsetX, offsetYValue) => {
      eventOffset.offsetX = eventOffsetX;
      eventOffset.offsetY = offsetYValue;
      this._eventHandler(eventOffset);
    };
    __lastDateUpdated(this.options.events, (_____eventType) =>
      addEventListenerWithCallback(_____eventType, eventOffsetHandler),
    );
  }
  bindResponsiveEvents() {
    this._responsiveListeners ||= {};
    const responsiveListeners = this._responsiveListeners;
    const platformContext = this.platform;
    const eventListenerCallback = (_______eventType, _______eventHandler) => {
      platformContext.addEventListener(
        this,
        _______eventType,
        _______eventHandler,
      );
      responsiveListeners[_______eventType] = _______eventHandler;
    };
    const removeEventListener = (eventTypeIndex, eventListenerOptions) => {
      if (responsiveListeners[eventTypeIndex]) {
        platformContext.removeEventListener(
          this,
          eventTypeIndex,
          eventListenerOptions,
        );
        delete responsiveListeners[eventTypeIndex];
      }
    };
    const handleCanvasResize = (canvasHeight, ______________event) => {
      if (this.canvas) {
        this.resize(canvasHeight, ______________event);
      }
    };
    let detachHandler;
    const onAttach = () => {
      removeEventListener("attach", onAttach);
      this.attached = true;
      this.resize();
      eventListenerCallback("resize", handleCanvasResize);
      eventListenerCallback("detach", detachHandler);
    };
    detachHandler = () => {
      this.attached = false;
      removeEventListener("resize", handleCanvasResize);
      this._stop();
      this._resize(0, 0);
      eventListenerCallback("attach", onAttach);
    };
    if (platformContext.isAttached(this.canvas)) {
      onAttach();
    } else {
      detachHandler();
    }
  }
  unbindEvents() {
    __lastDateUpdated(this._listeners, (__eventHandler, eventListener) => {
      this.platform.removeEventListener(this, eventListener, __eventHandler);
    });
    this._listeners = {};
    __lastDateUpdated(
      this._responsiveListeners,
      (___eventHandler, _eventListener) => {
        this.platform.removeEventListener(
          this,
          _eventListener,
          ___eventHandler,
        );
      },
    );
    this._responsiveListeners = undefined;
  }
  updateHoverStyle(hoverDatasetArray, hoverType, hoverDatasetIndex) {
    const hoverAction = hoverDatasetIndex ? "set" : "remove";
    let _________________datasetMeta;
    let hoverDataset;
    let ____________________currentIndex;
    let hoverDatasetCount;
    if (hoverType === "dataset") {
      _________________datasetMeta = this.getDatasetMeta(
        hoverDatasetArray[0].datasetIndex,
      );
      _________________datasetMeta.controller[
        "_" + hoverAction + "DatasetHoverStyle"
      ]();
    }
    ____________________currentIndex = 0;
    hoverDatasetCount = hoverDatasetArray.length;
    for (
      ;
      ____________________currentIndex < hoverDatasetCount;
      ++____________________currentIndex
    ) {
      hoverDataset = hoverDatasetArray[____________________currentIndex];
      const _datasetController =
        hoverDataset &&
        this.getDatasetMeta(hoverDataset.datasetIndex).controller;
      if (_datasetController) {
        _datasetController[hoverAction + "HoverStyle"](
          hoverDataset.element,
          hoverDataset.datasetIndex,
          hoverDataset.index,
        );
      }
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(elementDataArray) {
    const _activeElements = this._active || [];
    const ________datasetMeta = elementDataArray.map(
      ({ datasetIndex: ____________datasetIndex, index: _elementIndex }) => {
        const _______datasetMeta = this.getDatasetMeta(
          ____________datasetIndex,
        );
        if (!_______datasetMeta) {
          throw new Error(
            "No dataset found at index " + ____________datasetIndex,
          );
        }
        return {
          datasetIndex: ____________datasetIndex,
          element: _______datasetMeta.data[_elementIndex],
          index: _elementIndex,
        };
      },
    );
    if (!_animationController(________datasetMeta, _activeElements)) {
      this._active = ________datasetMeta;
      this._lastEvent = null;
      this._updateHoverStyles(________datasetMeta, _activeElements);
    }
  }
  notifyPlugins(notificationData, __eventData, pluginIndex) {
    return this._plugins.notify(
      this,
      notificationData,
      __eventData,
      pluginIndex,
    );
  }
  isPluginEnabled(pluginId) {
    return (
      this._plugins._cache.filter(
        (pluginEvent) => pluginEvent.plugin.id === pluginId,
      ).length === 1
    );
  }
  _updateHoverStyles(_excludedEvents, excludedDataPoints, _excludedDataPoints) {
    const _hoverOptions = this.options.hover;
    const filterOutDataPoints = (_filteredData, excludedEvents) =>
      _filteredData.filter(
        (__currentDataPoint) =>
          !excludedEvents.some(
            (currentEvent) =>
              __currentDataPoint.datasetIndex === currentEvent.datasetIndex &&
              __currentDataPoint.index === currentEvent.index,
          ),
      );
    const filteredDataPoints = filterOutDataPoints(
      excludedDataPoints,
      _excludedEvents,
    );
    const filteredExcludedEvents = _excludedDataPoints
      ? _excludedEvents
      : filterOutDataPoints(_excludedEvents, excludedDataPoints);
    if (filteredDataPoints.length) {
      this.updateHoverStyle(filteredDataPoints, _hoverOptions.mode, false);
    }
    if (filteredExcludedEvents.length && _hoverOptions.mode) {
      this.updateHoverStyle(filteredExcludedEvents, _hoverOptions.mode, true);
    }
  }
  _eventHandler(_____________________________event, eventReplay) {
    const __eventDetails = {
      event: _____________________________event,
      replay: eventReplay,
      cancelable: true,
      inChartArea: this.isPointInArea(_____________________________event),
    };
    const isEventTriggeredByNative = (_eventOptions) =>
      (_eventOptions.options.events || this.options.events).includes(
        _____________________________event.native.type,
      );
    if (
      this.notifyPlugins(
        "beforeEvent",
        __eventDetails,
        isEventTriggeredByNative,
      ) === false
    ) {
      return;
    }
    const eventHandledSuccessfully = this._handleEvent(
      _____________________________event,
      eventReplay,
      __eventDetails.inChartArea,
    );
    __eventDetails.cancelable = false;
    this.notifyPlugins("afterEvent", __eventDetails, isEventTriggeredByNative);
    if (eventHandledSuccessfully || __eventDetails.changed) {
      this.render();
    }
    return this;
  }
  _handleEvent(_eventContext, ________eventData, hoverEventIndex) {
    const { _active: __activeElements = [], options: ____eventOptions } = this;
    const _________eventData = ________eventData;
    const ___activeElements = this._getActiveElements(
      _eventContext,
      __activeElements,
      hoverEventIndex,
      _________eventData,
    );
    const _animationId = animationIdentifier(_eventContext);
    const returnValue = determineReturnValue(
      _eventContext,
      this._lastEvent,
      hoverEventIndex,
      _animationId,
    );
    if (hoverEventIndex) {
      this._lastEvent = null;
      ________animationContext(
        ____eventOptions.onHover,
        [_eventContext, ___activeElements, this],
        this,
      );
      if (_animationId) {
        ________animationContext(
          ____eventOptions.onClick,
          [_eventContext, ___activeElements, this],
          this,
        );
      }
    }
    const isAnimationControllerActive = !_animationController(
      ___activeElements,
      __activeElements,
    );
    if (isAnimationControllerActive || ________eventData) {
      this._active = ___activeElements;
      this._updateHoverStyles(
        ___activeElements,
        __activeElements,
        ________eventData,
      );
    }
    this._lastEvent = returnValue;
    return isAnimationControllerActive;
  }
  _getActiveElements(
    ________________________event,
    ____eventObject,
    isActiveElement,
    activeElementsCount,
  ) {
    if (________________________event.type === "mouseout") {
      return [];
    }
    if (!isActiveElement) {
      return ____eventObject;
    }
    const hoverOptions = this.options.hover;
    return this.getElementsAtEventForMode(
      ________________________event,
      hoverOptions.mode,
      hoverOptions,
      activeElementsCount,
    );
  }
}
function updateLastDate() {
  return __lastDateUpdated(Chart.instances, (pluginHandler) =>
    pluginHandler._plugins.invalidate(),
  );
}
function lineMarginRatio(
  _________canvasContext,
  ___shapeProperties,
  __endAngle,
) {
  const {
    startAngle: ____startAngle,
    pixelMargin: _pixelMargin,
    x: ____centerX,
    y: __centerY,
    outerRadius: _outerRadius,
    innerRadius: innerRadius,
  } = ___shapeProperties;
  let marginRatio = _pixelMargin / _outerRadius;
  _________canvasContext.beginPath();
  _________canvasContext.arc(
    ____centerX,
    __centerY,
    _outerRadius,
    ____startAngle - marginRatio,
    __endAngle + marginRatio,
  );
  if (innerRadius > _pixelMargin) {
    marginRatio = _pixelMargin / innerRadius;
    _________canvasContext.arc(
      ____centerX,
      __centerY,
      innerRadius,
      __endAngle + marginRatio,
      ____startAngle - marginRatio,
      true,
    );
  } else {
    _________canvasContext.arc(
      ____centerX,
      __centerY,
      _pixelMargin,
      __endAngle + currentFrameTimestamp,
      ____startAngle - currentFrameTimestamp,
    );
  }
  _________canvasContext.closePath();
  _________canvasContext.clip();
}
function createAnimation(_______animationDuration) {
  return __animationController(_______animationDuration, [
    "outerStart",
    "outerEnd",
    "innerStart",
    "innerEnd",
  ]);
}
function animateBorderRadius(
  borderOptions,
  outerRadius,
  currentCoordinate,
  _scaleFactor,
) {
  const ___animationProperties = createAnimation(
    borderOptions.options.borderRadius,
  );
  const halfDistanceToOuterRadius = (currentCoordinate - outerRadius) / 2;
  const maxBorderRadius = Math.min(
    halfDistanceToOuterRadius,
    (_scaleFactor * outerRadius) / 2,
  );
  const borderAnimationFunction = (timeProgress) => {
    const scaledDistanceToChartEdge =
      ((currentCoordinate - Math.min(halfDistanceToOuterRadius, timeProgress)) *
        _scaleFactor) /
      2;
    return chartAnimationState(
      timeProgress,
      0,
      Math.min(halfDistanceToOuterRadius, scaledDistanceToChartEdge),
    );
  };
  return {
    outerStart: borderAnimationFunction(___animationProperties.outerStart),
    outerEnd: borderAnimationFunction(___animationProperties.outerEnd),
    innerStart: chartAnimationState(
      ___animationProperties.innerStart,
      0,
      maxBorderRadius,
    ),
    innerEnd: chartAnimationState(
      ___animationProperties.innerEnd,
      0,
      maxBorderRadius,
    ),
  };
}
function calculateCoordinates(_radius, _angle, angleOffset, offsetY) {
  return {
    x: angleOffset + _radius * Math.cos(_angle),
    y: offsetY + _radius * Math.sin(_angle),
  };
}
function drawShapeWithArcs(
  _canvasContext,
  shapeProperties,
  additionalOffset,
  additionalRadius,
  offsetAngle,
  isArcVisible,
) {
  const {
    x: centerX,
    y: centerYCoordinate,
    startAngle: startAngle,
    pixelMargin: pixelMargin,
    innerRadius: innerRadiusValue,
  } = shapeProperties;
  const calculatedOffsetRadius = Math.max(
    shapeProperties.outerRadius +
      additionalRadius +
      additionalOffset -
      pixelMargin,
    0,
  );
  const calculatedInnerRadius =
    innerRadiusValue > 0
      ? innerRadiusValue + additionalRadius + additionalOffset + pixelMargin
      : 0;
  let arcOffsetAdjustment = 0;
  const angleDifference = offsetAngle - startAngle;
  if (additionalRadius) {
    const arcOffset =
      ((innerRadiusValue > 0 ? innerRadiusValue - additionalRadius : 0) +
        (calculatedOffsetRadius > 0
          ? calculatedOffsetRadius - additionalRadius
          : 0)) /
      2;
    arcOffsetAdjustment =
      (angleDifference -
        (arcOffset !== 0
          ? (angleDifference * arcOffset) / (arcOffset + additionalRadius)
          : angleDifference)) /
      2;
  }
  const _angleOffset =
    (angleDifference -
      Math.max(
        0.001,
        angleDifference * calculatedOffsetRadius -
          additionalOffset / notificationListener,
      ) /
        calculatedOffsetRadius) /
    2;
  const totalAngleOffset = startAngle + _angleOffset + arcOffsetAdjustment;
  const finalArcAngle = offsetAngle - _angleOffset - arcOffsetAdjustment;
  const {
    outerStart: outerArcStart,
    outerEnd: outerEndAngle,
    innerStart: innerEndArcRadius,
    innerEnd: innerEndArcRadiusValue,
  } = animateBorderRadius(
    shapeProperties,
    calculatedInnerRadius,
    calculatedOffsetRadius,
    finalArcAngle - totalAngleOffset,
  );
  const remainingDistance = calculatedOffsetRadius - outerArcStart;
  const shapeRadiusDifference = calculatedOffsetRadius - outerEndAngle;
  const arcMidpointAdjustment =
    totalAngleOffset + outerArcStart / remainingDistance;
  const _angleDifference =
    finalArcAngle - outerEndAngle / shapeRadiusDifference;
  const innerArcTotalRadius = calculatedInnerRadius + innerEndArcRadius;
  const _innerArcTotalRadius = calculatedInnerRadius + innerEndArcRadiusValue;
  const angleAdjustment =
    totalAngleOffset + innerEndArcRadius / innerArcTotalRadius;
  const finalArcAngleAdjustment =
    finalArcAngle - innerEndArcRadiusValue / _innerArcTotalRadius;
  _canvasContext.beginPath();
  if (isArcVisible) {
    const midArcAngle = (arcMidpointAdjustment + _angleDifference) / 2;
    _canvasContext.arc(
      centerX,
      centerYCoordinate,
      calculatedOffsetRadius,
      arcMidpointAdjustment,
      midArcAngle,
    );
    _canvasContext.arc(
      centerX,
      centerYCoordinate,
      calculatedOffsetRadius,
      midArcAngle,
      _angleDifference,
    );
    if (outerEndAngle > 0) {
      const geometry = calculateCoordinates(
        shapeRadiusDifference,
        _angleDifference,
        centerX,
        centerYCoordinate,
      );
      _canvasContext.arc(
        geometry.x,
        geometry.y,
        outerEndAngle,
        _angleDifference,
        finalArcAngle + currentFrameTimestamp,
      );
    }
    const arcCoordinates = calculateCoordinates(
      _innerArcTotalRadius,
      finalArcAngle,
      centerX,
      centerYCoordinate,
    );
    _canvasContext.lineTo(arcCoordinates.x, arcCoordinates.y);
    if (innerEndArcRadiusValue > 0) {
      const _shapeProperties = calculateCoordinates(
        _innerArcTotalRadius,
        finalArcAngleAdjustment,
        centerX,
        centerYCoordinate,
      );
      _canvasContext.arc(
        _shapeProperties.x,
        _shapeProperties.y,
        innerEndArcRadiusValue,
        finalArcAngle + currentFrameTimestamp,
        finalArcAngleAdjustment + Math.PI,
      );
    }
    const arcEndAngle =
      (finalArcAngle -
        innerEndArcRadiusValue / calculatedInnerRadius +
        (totalAngleOffset + innerEndArcRadius / calculatedInnerRadius)) /
      2;
    _canvasContext.arc(
      centerX,
      centerYCoordinate,
      calculatedInnerRadius,
      finalArcAngle - innerEndArcRadiusValue / calculatedInnerRadius,
      arcEndAngle,
      true,
    );
    _canvasContext.arc(
      centerX,
      centerYCoordinate,
      calculatedInnerRadius,
      arcEndAngle,
      totalAngleOffset + innerEndArcRadius / calculatedInnerRadius,
      true,
    );
    if (innerEndArcRadius > 0) {
      const __shapeProperties = calculateCoordinates(
        innerArcTotalRadius,
        angleAdjustment,
        centerX,
        centerYCoordinate,
      );
      _canvasContext.arc(
        __shapeProperties.x,
        __shapeProperties.y,
        innerEndArcRadius,
        angleAdjustment + Math.PI,
        totalAngleOffset - currentFrameTimestamp,
      );
    }
    const _endPointCoordinates = calculateCoordinates(
      remainingDistance,
      totalAngleOffset,
      centerX,
      centerYCoordinate,
    );
    _canvasContext.lineTo(_endPointCoordinates.x, _endPointCoordinates.y);
    if (outerArcStart > 0) {
      const shapeCoordinates = calculateCoordinates(
        remainingDistance,
        arcMidpointAdjustment,
        centerX,
        centerYCoordinate,
      );
      _canvasContext.arc(
        shapeCoordinates.x,
        shapeCoordinates.y,
        outerArcStart,
        totalAngleOffset - currentFrameTimestamp,
        arcMidpointAdjustment,
      );
    }
  } else {
    _canvasContext.moveTo(centerX, centerYCoordinate);
    const arcMidpoint =
      Math.cos(arcMidpointAdjustment) * calculatedOffsetRadius + centerX;
    const arcEndCoordinates =
      Math.sin(arcMidpointAdjustment) * calculatedOffsetRadius +
      centerYCoordinate;
    _canvasContext.lineTo(arcMidpoint, arcEndCoordinates);
    const _arcMidpoint =
      Math.cos(_angleDifference) * calculatedOffsetRadius + centerX;
    const calculatedCoordinates =
      Math.sin(_angleDifference) * calculatedOffsetRadius + centerYCoordinate;
    _canvasContext.lineTo(_arcMidpoint, calculatedCoordinates);
  }
  _canvasContext.closePath();
}
function drawArcSegments(
  ___________canvasContext,
  arcProperties,
  ____________index,
  segmentIndex,
  arcSegmentCount,
) {
  const {
    fullCircles: fullCircleCount,
    startAngle: ___startAngle,
    circumference: arcCircumference,
  } = arcProperties;
  let ____endAngle = arcProperties.endAngle;
  if (fullCircleCount) {
    drawShapeWithArcs(
      ___________canvasContext,
      arcProperties,
      ____________index,
      segmentIndex,
      ____endAngle,
      arcSegmentCount,
    );
    for (let _loopIndex = 0; _loopIndex < fullCircleCount; ++_loopIndex) {
      ___________canvasContext.fill();
    }
    if (!isNaN(arcCircumference)) {
      ____endAngle =
        ___startAngle +
        (arcCircumference % lastAnimationUpdateTimestamp ||
          lastAnimationUpdateTimestamp);
    }
  }
  drawShapeWithArcs(
    ___________canvasContext,
    arcProperties,
    ____________index,
    segmentIndex,
    ____endAngle,
    arcSegmentCount,
  );
  ___________canvasContext.fill();
  return ____endAngle;
}
function _drawShapeWithStroke(
  canvasRenderingContext,
  drawingConfig,
  endAngleValue,
  endAngle,
  _endAngle,
) {
  const {
    fullCircles: _fullCircleCount,
    startAngle: ______startAngle,
    circumference: circularCircumference,
    options: drawingOptions,
  } = drawingConfig;
  const {
    borderWidth: _borderWidth,
    borderJoinStyle: borderJoinStyle,
    borderDash: _borderDashArray,
    borderDashOffset: borderDashOffset,
  } = drawingOptions;
  const isBorderAlignedInner = drawingOptions.borderAlign === "inner";
  if (!_borderWidth) {
    return;
  }
  canvasRenderingContext.setLineDash(_borderDashArray || []);
  canvasRenderingContext.lineDashOffset = borderDashOffset;
  if (isBorderAlignedInner) {
    canvasRenderingContext.lineWidth = _borderWidth * 2;
    canvasRenderingContext.lineJoin = borderJoinStyle || "round";
  } else {
    canvasRenderingContext.lineWidth = _borderWidth;
    canvasRenderingContext.lineJoin = borderJoinStyle || "bevel";
  }
  let currentEndAngle = drawingConfig.endAngle;
  if (_fullCircleCount) {
    drawShapeWithArcs(
      canvasRenderingContext,
      drawingConfig,
      endAngleValue,
      endAngle,
      currentEndAngle,
      _endAngle,
    );
    for (
      let strokeIteration = 0;
      strokeIteration < _fullCircleCount;
      ++strokeIteration
    ) {
      canvasRenderingContext.stroke();
    }
    if (!isNaN(circularCircumference)) {
      currentEndAngle =
        ______startAngle +
        (circularCircumference % lastAnimationUpdateTimestamp ||
          lastAnimationUpdateTimestamp);
    }
  }
  if (isBorderAlignedInner) {
    lineMarginRatio(canvasRenderingContext, drawingConfig, currentEndAngle);
  }
  if (!_fullCircleCount) {
    drawShapeWithArcs(
      canvasRenderingContext,
      drawingConfig,
      endAngleValue,
      endAngle,
      currentEndAngle,
      _endAngle,
    );
    canvasRenderingContext.stroke();
  }
}
class ArcAnimationController extends _AnimationController {
  static id = "arc";
  static defaults = {
    borderAlign: "center",
    borderColor: "#fff",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: undefined,
    borderRadius: 0,
    borderWidth: 2,
    offset: 0,
    spacing: 0,
    angle: undefined,
    circular: true,
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
  };
  static descriptors = {
    _scriptable: true,
    _indexable: (isBorderDash) => isBorderDash !== "borderDash",
  };
  circumference;
  endAngle;
  fullCircles;
  innerRadius;
  outerRadius;
  pixelMargin;
  startAngle;
  constructor(________________options) {
    super();
    this.options = undefined;
    this.circumference = undefined;
    this.startAngle = undefined;
    this.endAngle = undefined;
    this.innerRadius = undefined;
    this.outerRadius = undefined;
    this.pixelMargin = 0;
    this.fullCircles = 0;
    if (________________options) {
      Object.assign(this, ________________options);
    }
  }
  inRange(coordinateX, __coordinateY, ____________animationIndex) {
    const propsForCoordinate = this.getProps(
      ["x", "y"],
      ____________animationIndex,
    );
    const { angle: _currentAngle, distance: distanceValue } =
      _lastAnimationUpdateTimestamp(propsForCoordinate, {
        x: coordinateX,
        y: __coordinateY,
      });
    const {
      startAngle: _______startAngle,
      endAngle: _endAngleValue,
      innerRadius: _innerRadiusValue,
      outerRadius: outerRadiusValue,
      circumference: _circumferenceValue,
    } = this.getProps(
      ["startAngle", "endAngle", "innerRadius", "outerRadius", "circumference"],
      ____________animationIndex,
    );
    const halfSpacingPlusBorderWidth =
      (this.options.spacing + this.options.borderWidth) / 2;
    const isChartAnimating =
      chartAnimationRunning(
        _circumferenceValue,
        _endAngleValue - _______startAngle,
      ) >= lastAnimationUpdateTimestamp ||
      _animatedChartItems(_currentAngle, _______startAngle, _endAngleValue);
    const animationRequestIdValue = animationRequestId(
      distanceValue,
      _innerRadiusValue + halfSpacingPlusBorderWidth,
      outerRadiusValue + halfSpacingPlusBorderWidth,
    );
    return isChartAnimating && animationRequestIdValue;
  }
  getCenterPoint(props) {
    const {
      x: _centerPointX,
      y: ___centerY,
      startAngle: _____startAngle,
      endAngle: _____endAngle,
      innerRadius: _innerRadius,
      outerRadius: __outerRadius,
    } = this.getProps(
      ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"],
      props,
    );
    const { offset: radiusOffset, spacing: spacingValue } = this.options;
    const averageAngle = (_____startAngle + _____endAngle) / 2;
    const averageRadius =
      (_innerRadius + __outerRadius + spacingValue + radiusOffset) / 2;
    return {
      x: _centerPointX + Math.cos(averageAngle) * averageRadius,
      y: ___centerY + Math.sin(averageAngle) * averageRadius,
    };
  }
  tooltipPosition(tooltipDimensions) {
    return this.getCenterPoint(tooltipDimensions);
  }
  draw(________________________________canvasContext) {
    const {
      options: __________________chartOptions,
      circumference: __circumferenceValue,
    } = this;
    const offsetAdjustment = (__________________chartOptions.offset || 0) / 4;
    const spacingAdjustment = (__________________chartOptions.spacing || 0) / 2;
    const isCircular = __________________chartOptions.circular;
    this.pixelMargin =
      __________________chartOptions.borderAlign === "inner" ? 0.33 : 0;
    this.fullCircles =
      __circumferenceValue > lastAnimationUpdateTimestamp
        ? Math.floor(__circumferenceValue / lastAnimationUpdateTimestamp)
        : 0;
    if (
      __circumferenceValue === 0 ||
      this.innerRadius < 0 ||
      this.outerRadius < 0
    ) {
      return;
    }
    ________________________________canvasContext.save();
    const _averageAngle = (this.startAngle + this.endAngle) / 2;
    ________________________________canvasContext.translate(
      Math.cos(_averageAngle) * offsetAdjustment,
      Math.sin(_averageAngle) * offsetAdjustment,
    );
    const radiusAdjustment =
      offsetAdjustment *
      (1 - Math.sin(Math.min(notificationListener, __circumferenceValue || 0)));
    ________________________________canvasContext.fillStyle =
      __________________chartOptions.backgroundColor;
    ________________________________canvasContext.strokeStyle =
      __________________chartOptions.borderColor;
    drawArcSegments(
      ________________________________canvasContext,
      this,
      radiusAdjustment,
      spacingAdjustment,
      isCircular,
    );
    _drawShapeWithStroke(
      ________________________________canvasContext,
      this,
      radiusAdjustment,
      spacingAdjustment,
      isCircular,
    );
    ________________________________canvasContext.restore();
  }
}
function updateCanvasBorderStyles(
  __________canvasContext,
  borderStyles,
  borderStyleValues = borderStyles,
) {
  __________canvasContext.lineCap = chartAnimationRunning(
    borderStyleValues.borderCapStyle,
    borderStyles.borderCapStyle,
  );
  __________canvasContext.setLineDash(
    chartAnimationRunning(
      borderStyleValues.borderDash,
      borderStyles.borderDash,
    ),
  );
  __________canvasContext.lineDashOffset = chartAnimationRunning(
    borderStyleValues.borderDashOffset,
    borderStyles.borderDashOffset,
  );
  __________canvasContext.lineJoin = chartAnimationRunning(
    borderStyleValues.borderJoinStyle,
    borderStyles.borderJoinStyle,
  );
  __________canvasContext.lineWidth = chartAnimationRunning(
    borderStyleValues.borderWidth,
    borderStyles.borderWidth,
  );
  __________canvasContext.strokeStyle = chartAnimationRunning(
    borderStyleValues.borderColor,
    borderStyles.borderColor,
  );
}
function defineLineToPoint(lineToPoint, endPoint, _point) {
  lineToPoint.lineTo(_point.x, _point.y);
}
function getAnimationFunction(curveOptions) {
  if (curveOptions.stepped) {
    return ___animationStep;
  } else if (
    curveOptions.tension ||
    curveOptions.cubicInterpolationMode === "monotone"
  ) {
    return _chartAnimationState;
  } else {
    return defineLineToPoint;
  }
}
function calculateOverlap(____inputArray, _range, inputRange = {}) {
  const __inputArrayLength = ____inputArray.length;
  const { start: rangeStart = 0, end: _____endIndex = __inputArrayLength - 1 } =
    inputRange;
  const { start: _rangeStart, end: rangeEnd } = _range;
  const maxStartRange = Math.max(rangeStart, _rangeStart);
  const overlapEnd = Math.min(_____endIndex, rangeEnd);
  const isOutsideRange =
    (rangeStart < _rangeStart && _____endIndex < _rangeStart) ||
    (rangeStart > rangeEnd && _____endIndex > rangeEnd);
  return {
    count: __inputArrayLength,
    start: maxStartRange,
    loop: _range.loop,
    ilen:
      overlapEnd < maxStartRange && !isOutsideRange
        ? __inputArrayLength + overlapEnd - maxStartRange
        : overlapEnd - maxStartRange,
  };
}
function animateUsingCanvas(
  _____canvasContext,
  _animationOptions,
  _____index,
  animationSettings,
) {
  const { points: __animationPoints, options: ___________animationOptions } =
    _animationOptions;
  const {
    count: _pointCount,
    start: _____________startIndex,
    loop: isLooping,
    ilen: _overlapLength,
  } = calculateOverlap(__animationPoints, _____index, animationSettings);
  const _getAnimationHandler = getAnimationFunction(
    ___________animationOptions,
  );
  let __________________________________________________________________index;
  let __currentPoint;
  let previousPoint;
  let { move: shouldMove = true, reverse: isAnimationReversed } =
    animationSettings || {};
  for (
    __________________________________________________________________index = 0;
    __________________________________________________________________index <=
    _overlapLength;
    ++__________________________________________________________________index
  ) {
    __currentPoint =
      __animationPoints[
        (_____________startIndex +
          (isAnimationReversed
            ? _overlapLength -
              __________________________________________________________________index
            : __________________________________________________________________index)) %
          _pointCount
      ];
    if (!__currentPoint.skip) {
      if (shouldMove) {
        _____canvasContext.moveTo(__currentPoint.x, __currentPoint.y);
        shouldMove = false;
      } else {
        _getAnimationHandler(
          _____canvasContext,
          previousPoint,
          __currentPoint,
          isAnimationReversed,
          ___________animationOptions.stepped,
        );
      }
      previousPoint = __currentPoint;
    }
  }
  if (isLooping) {
    __currentPoint =
      __animationPoints[
        (_____________startIndex + (isAnimationReversed ? _overlapLength : 0)) %
          _pointCount
      ];
    _getAnimationHandler(
      _____canvasContext,
      previousPoint,
      __currentPoint,
      isAnimationReversed,
      ___________animationOptions.stepped,
    );
  }
  return !!isLooping;
}
function drawLineToCanvas(__canvasContext, pointsData, index, configOptions) {
  const ___pointsArray = pointsData.points;
  const {
    count: totalPointCount,
    start: ____________startIndex,
    ilen: overlapLength,
  } = calculateOverlap(___pointsArray, index, configOptions);
  const { move: shouldMoveToStart = true, reverse: _isReverse } =
    configOptions || {};
  let ________________________________________________________________________currentIndex;
  let _currentPoint;
  let _currentPixelCoordinate;
  let currentMaxYCoordinate;
  let maxCoordinateY;
  let currentCoordinateY;
  let _averageXCoordinate = 0;
  let averageCount = 0;
  const calculateWrappedIndex = (_tempValue) =>
    (____________startIndex +
      (_isReverse ? overlapLength - _tempValue : _tempValue)) %
    totalPointCount;
  const drawLineSegment = () => {
    if (currentMaxYCoordinate !== maxCoordinateY) {
      __canvasContext.lineTo(_averageXCoordinate, maxCoordinateY);
      __canvasContext.lineTo(_averageXCoordinate, currentMaxYCoordinate);
      __canvasContext.lineTo(_averageXCoordinate, currentCoordinateY);
    }
  };
  if (shouldMoveToStart) {
    _currentPoint = ___pointsArray[calculateWrappedIndex(0)];
    __canvasContext.moveTo(_currentPoint.x, _currentPoint.y);
  }
  ________________________________________________________________________currentIndex = 0;
  for (
    ;
    ________________________________________________________________________currentIndex <=
    overlapLength;
    ++________________________________________________________________________currentIndex
  ) {
    _currentPoint =
      ___pointsArray[
        calculateWrappedIndex(
          ________________________________________________________________________currentIndex,
        )
      ];
    if (_currentPoint.skip) {
      continue;
    }
    const positionX = _currentPoint.x;
    const coordinateY = _currentPoint.y;
    const currentPixelCoordinate = positionX | 0;
    if (currentPixelCoordinate === _currentPixelCoordinate) {
      if (coordinateY < currentMaxYCoordinate) {
        currentMaxYCoordinate = coordinateY;
      } else if (coordinateY > maxCoordinateY) {
        maxCoordinateY = coordinateY;
      }
      _averageXCoordinate =
        (averageCount * _averageXCoordinate + positionX) / ++averageCount;
    } else {
      drawLineSegment();
      __canvasContext.lineTo(positionX, coordinateY);
      _currentPixelCoordinate = currentPixelCoordinate;
      averageCount = 0;
      currentMaxYCoordinate = maxCoordinateY = coordinateY;
    }
    currentCoordinateY = coordinateY;
  }
  drawLineSegment();
}
function chartDataProcessor(_________________chartData) {
  const _______________chartOptions = _________________chartData.options;
  const borderDashLength =
    _______________chartOptions.borderDash &&
    _______________chartOptions.borderDash.length;
  if (
    !_________________chartData._decimated &&
    !_________________chartData._loop &&
    !_______________chartOptions.tension &&
    _______________chartOptions.cubicInterpolationMode !== "monotone" &&
    !_______________chartOptions.stepped &&
    !borderDashLength
  ) {
    return drawLineToCanvas;
  } else {
    return animateUsingCanvas;
  }
}
function getAnimationHandler(___animationOptions) {
  if (___animationOptions.stepped) {
    return __chartUpdateInterval;
  } else if (
    ___animationOptions.tension ||
    ___animationOptions.cubicInterpolationMode === "monotone"
  ) {
    return animationHandler;
  } else {
    return _animationStep;
  }
}
function currentPath(targetShape, shape, pathOptions, pathShouldClose) {
  let shapePath = shape._path;
  if (!shapePath) {
    shapePath = shape._path = new Path2D();
    if (shape.path(shapePath, pathOptions, pathShouldClose)) {
      shapePath.closePath();
    }
  }
  updateCanvasBorderStyles(targetShape, shape.options);
  targetShape.stroke(shapePath);
}
function drawSegments(
  ____________canvasContext,
  _elementOptions,
  segmentStartIndex,
  segmentLength,
) {
  const { segments: segments, options: ___elementOptions } = _elementOptions;
  const ____processChartData = chartDataProcessor(_elementOptions);
  for (const ___rectangle of segments) {
    updateCanvasBorderStyles(
      ____________canvasContext,
      ___elementOptions,
      ___rectangle.style,
    );
    ____________canvasContext.beginPath();
    if (
      ____processChartData(
        ____________canvasContext,
        _elementOptions,
        ___rectangle,
        {
          start: segmentStartIndex,
          end: segmentStartIndex + segmentLength - 1,
        },
      )
    ) {
      ____________canvasContext.closePath();
    }
    ____________canvasContext.stroke();
  }
}
const animationContext = typeof Path2D == "function";
function animateWithOptions(
  animationData,
  ____animationOptions,
  frameIndex,
  ___animationState,
) {
  if (animationContext && !____animationOptions.options.segment) {
    currentPath(
      animationData,
      ____animationOptions,
      frameIndex,
      ___animationState,
    );
  } else {
    drawSegments(
      animationData,
      ____animationOptions,
      frameIndex,
      ___animationState,
    );
  }
}
class LineAnimationController extends _AnimationController {
  static id = "line";
  static defaults = {
    borderCapStyle: "butt",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: "miter",
    borderWidth: 3,
    capBezierPoints: true,
    cubicInterpolationMode: "default",
    fill: false,
    spanGaps: false,
    stepped: false,
    tension: 0,
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor",
  };
  static descriptors = {
    _scriptable: true,
    _indexable: (propertyType) =>
      propertyType !== "borderDash" && propertyType !== "fill",
  };
  constructor(constructorOptions) {
    super();
    this.animated = true;
    this.options = undefined;
    this._chart = undefined;
    this._loop = undefined;
    this._fullLoop = undefined;
    this._path = undefined;
    this._points = undefined;
    this._segments = undefined;
    this._decimated = false;
    this._pointsUpdated = false;
    this._datasetIndex = undefined;
    if (constructorOptions) {
      Object.assign(this, constructorOptions);
    }
  }
  updateControlPoints(______timestamp, _____animationContext) {
    const ______________options = this.options;
    if (
      (______________options.tension ||
        ______________options.cubicInterpolationMode === "monotone") &&
      !______________options.stepped &&
      !this._pointsUpdated
    ) {
      const spanGapsEnabled = ______________options.spanGaps
        ? this._loop
        : this._fullLoop;
      animationManager(
        this._points,
        ______________options,
        ______timestamp,
        spanGapsEnabled,
        _____animationContext,
      );
      this._pointsUpdated = true;
    }
  }
  set points(newPoints) {
    this._points = newPoints;
    delete this._segments;
    delete this._path;
    this._pointsUpdated = false;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return (this._segments ||= _animationManager(this, this.options.segment));
  }
  first() {
    const segmentsArray = this.segments;
    const pointsArray = this.points;
    return segmentsArray.length && pointsArray[segmentsArray[0].start];
  }
  last() {
    const _segmentsArray = this.segments;
    const _pointsArray = this.points;
    const segmentsCount = _segmentsArray.length;
    return segmentsCount && _pointsArray[_segmentsArray[segmentsCount - 1].end];
  }
  interpolate(_timeValue, ____propertyKey) {
    const ___________________options = this.options;
    const _______targetValue = _timeValue[____propertyKey];
    const pointsList = this.points;
    const animationTasks = animationTaskId(this, {
      property: ____propertyKey,
      start: _______targetValue,
      end: _______targetValue,
    });
    if (!animationTasks.length) {
      return;
    }
    const interpolatedValues = [];
    const getAnimationHandlerFunction = getAnimationHandler(
      ___________________options,
    );
    let ______________currentIndex;
    let animationTaskCount;
    ______________currentIndex = 0;
    animationTaskCount = animationTasks.length;
    for (
      ;
      ______________currentIndex < animationTaskCount;
      ++______________currentIndex
    ) {
      const { start: length, end: __endIndex } =
        animationTasks[______________currentIndex];
      const startValue = pointsList[length];
      const _endValue = pointsList[__endIndex];
      if (startValue === _endValue) {
        interpolatedValues.push(startValue);
        continue;
      }
      const _interpolatedValue = getAnimationHandlerFunction(
        startValue,
        _endValue,
        Math.abs(
          (_______targetValue - startValue[____propertyKey]) /
            (_endValue[____propertyKey] - startValue[____propertyKey]),
        ),
        ___________________options.stepped,
      );
      _interpolatedValue[____propertyKey] = _timeValue[____propertyKey];
      interpolatedValues.push(_interpolatedValue);
    }
    if (interpolatedValues.length === 1) {
      return interpolatedValues[0];
    } else {
      return interpolatedValues;
    }
  }
  pathSegment(pathSegmentValue, segmentValue, ____segmentIndex) {
    return chartDataProcessor(this)(
      pathSegmentValue,
      this,
      segmentValue,
      ____segmentIndex,
    );
  }
  path(_______dataPoint, ________startIndex, _______endIndex) {
    const segmentsList = this.segments;
    const chartDataProcessorResult = chartDataProcessor(this);
    let isLoopActive = this._loop;
    ________startIndex = ________startIndex || 0;
    _______endIndex =
      _______endIndex || this.points.length - ________startIndex;
    for (const __item of segmentsList) {
      isLoopActive &= chartDataProcessorResult(_______dataPoint, this, __item, {
        start: ________startIndex,
        end: ________startIndex + _______endIndex - 1,
      });
    }
    return !!isLoopActive;
  }
  draw(
    ____________________canvasContext,
    _____________________canvasContext,
    animationDelta,
    animationSpeed,
  ) {
    const ___optionsConfig = this.options || {};
    if ((this.points || []).length && ___optionsConfig.borderWidth) {
      ____________________canvasContext.save();
      animateWithOptions(
        ____________________canvasContext,
        this,
        animationDelta,
        animationSpeed,
      );
      ____________________canvasContext.restore();
    }
    if (this.animated) {
      this._pointsUpdated = false;
      this._path = undefined;
    }
  }
}
function isWithinHitRadius(
  _target,
  __________inputValue,
  propKey,
  propsSource,
) {
  const targetOptions = _target.options;
  const { [propKey]: _targetPropertyValue } = _target.getProps(
    [propKey],
    propsSource,
  );
  return (
    Math.abs(__________inputValue - _targetPropertyValue) <
    targetOptions.radius + targetOptions.hitRadius
  );
}
class __AnimationController extends _AnimationController {
  static id = "point";
  parsed;
  skip;
  stop;
  static defaults = {
    borderWidth: 1,
    hitRadius: 1,
    hoverBorderWidth: 1,
    hoverRadius: 4,
    pointStyle: "circle",
    radius: 3,
    rotation: 0,
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor",
  };
  constructor(optionsObject) {
    super();
    this.options = undefined;
    this.parsed = undefined;
    this.skip = undefined;
    this.stop = undefined;
    if (optionsObject) {
      Object.assign(this, optionsObject);
    }
  }
  inRange(
    pointX,
    _coordinateY,
    _______________________________________________________________index,
  ) {
    const ____________options = this.options;
    const { x: pointXCoordinate, y: _pointYCoordinate } = this.getProps(
      ["x", "y"],
      _______________________________________________________________index,
    );
    return (
      Math.pow(pointX - pointXCoordinate, 2) +
        Math.pow(_coordinateY - _pointYCoordinate, 2) <
      Math.pow(____________options.hitRadius + ____________options.radius, 2)
    );
  }
  inXRange(targetXPosition, _________________event) {
    return isWithinHitRadius(
      this,
      targetXPosition,
      "x",
      _________________event,
    );
  }
  inYRange(_targetPosition, hitRadiusY) {
    return isWithinHitRadius(this, _targetPosition, "y", hitRadiusY);
  }
  getCenterPoint(_timeParameter) {
    const { x: centerPointX, y: centerPointY } = this.getProps(
      ["x", "y"],
      _timeParameter,
    );
    return {
      x: centerPointX,
      y: centerPointY,
    };
  }
  size(chartSizeOptions) {
    let effectiveRadius =
      (chartSizeOptions = chartSizeOptions || this.options || {}).radius || 0;
    effectiveRadius = Math.max(
      effectiveRadius,
      (effectiveRadius && chartSizeOptions.hoverRadius) || 0,
    );
    return (
      (effectiveRadius +
        ((effectiveRadius && chartSizeOptions.borderWidth) || 0)) *
      2
    );
  }
  draw(___________________canvasContext, __________________________event) {
    const _____________options = this.options;
    if (
      !this.skip &&
      !(_____________options.radius < 0.1) &&
      !!chartUpdater(
        this,
        __________________________event,
        this.size(_____________options) / 2,
      )
    ) {
      ___________________canvasContext.strokeStyle =
        _____________options.borderColor;
      ___________________canvasContext.lineWidth =
        _____________options.borderWidth;
      ___________________canvasContext.fillStyle =
        _____________options.backgroundColor;
      __animationStep(
        ___________________canvasContext,
        _____________options,
        this.x,
        this.y,
      );
    }
  }
  getRange() {
    const _______options = this.options || {};
    return _______options.radius + _______options.hitRadius;
  }
}
function calculateDiagramBounds(diagram, elevation) {
  const {
    x: __xCoordinate,
    y: _____yCoordinate,
    base: baseCoordinate,
    width: diagramWidth,
    height: __height,
  } = diagram.getProps(["x", "y", "base", "width", "height"], elevation);
  let _leftBoundary;
  let maxCoordinate;
  let _topBoundary;
  let bottom;
  let halfDimension;
  if (diagram.horizontal) {
    halfDimension = __height / 2;
    _leftBoundary = Math.min(__xCoordinate, baseCoordinate);
    maxCoordinate = Math.max(__xCoordinate, baseCoordinate);
    _topBoundary = _____yCoordinate - halfDimension;
    bottom = _____yCoordinate + halfDimension;
  } else {
    halfDimension = diagramWidth / 2;
    _leftBoundary = __xCoordinate - halfDimension;
    maxCoordinate = __xCoordinate + halfDimension;
    _topBoundary = Math.min(_____yCoordinate, baseCoordinate);
    bottom = Math.max(_____yCoordinate, baseCoordinate);
  }
  return {
    left: _leftBoundary,
    top: _topBoundary,
    right: maxCoordinate,
    bottom: bottom,
  };
}
function isValidAndProcessEvent(
  _isValid,
  __________event,
  ________________________________________index,
  _____callbackFunction,
) {
  if (_isValid) {
    return 0;
  } else {
    return chartAnimationState(
      __________event,
      ________________________________________index,
      _____callbackFunction,
    );
  }
}
function calculateBorderAnimation(
  __chartElement,
  borderWidthValue,
  borderAnimationValue,
) {
  const borderWidthOption = __chartElement.options.borderWidth;
  const borderSkippedDirections = __chartElement.borderSkipped;
  const animationStateResult = animationState(borderWidthOption);
  return {
    t: isValidAndProcessEvent(
      borderSkippedDirections.top,
      animationStateResult.top,
      0,
      borderAnimationValue,
    ),
    r: isValidAndProcessEvent(
      borderSkippedDirections.right,
      animationStateResult.right,
      0,
      borderWidthValue,
    ),
    b: isValidAndProcessEvent(
      borderSkippedDirections.bottom,
      animationStateResult.bottom,
      0,
      borderAnimationValue,
    ),
    l: isValidAndProcessEvent(
      borderSkippedDirections.left,
      animationStateResult.left,
      0,
      borderWidthValue,
    ),
  };
}
function calculateBorderRadius(
  __element,
  minBorderRadius,
  minimumBorderRadius,
) {
  const { enableBorderRadius: isBorderRadiusEnabled } = __element.getProps([
    "enableBorderRadius",
  ]);
  const borderRadiusOptions = __element.options.borderRadius;
  const borderRadiusValues = elementBorderRadius(borderRadiusOptions);
  const minimumBorderRadiusValue = Math.min(
    minBorderRadius,
    minimumBorderRadius,
  );
  const borderSkipped = __element.borderSkipped;
  const _isBorderRadiusEnabled =
    isBorderRadiusEnabled || currentAnimationIndex(borderRadiusOptions);
  return {
    topLeft: isValidAndProcessEvent(
      !_isBorderRadiusEnabled || borderSkipped.top || borderSkipped.left,
      borderRadiusValues.topLeft,
      0,
      minimumBorderRadiusValue,
    ),
    topRight: isValidAndProcessEvent(
      !_isBorderRadiusEnabled || borderSkipped.top || borderSkipped.right,
      borderRadiusValues.topRight,
      0,
      minimumBorderRadiusValue,
    ),
    bottomLeft: isValidAndProcessEvent(
      !_isBorderRadiusEnabled || borderSkipped.bottom || borderSkipped.left,
      borderRadiusValues.bottomLeft,
      0,
      minimumBorderRadiusValue,
    ),
    bottomRight: isValidAndProcessEvent(
      !_isBorderRadiusEnabled || borderSkipped.bottom || borderSkipped.right,
      borderRadiusValues.bottomRight,
      0,
      minimumBorderRadiusValue,
    ),
  };
}
function borderAnimation(inputElement) {
  const diagramBounds = calculateDiagramBounds(inputElement);
  const ___borderWidth = diagramBounds.right - diagramBounds.left;
  const borderHeight = diagramBounds.bottom - diagramBounds.top;
  const borderAnimationOffsets = calculateBorderAnimation(
    inputElement,
    ___borderWidth / 2,
    borderHeight / 2,
  );
  const _borderRadius = calculateBorderRadius(
    inputElement,
    ___borderWidth / 2,
    borderHeight / 2,
  );
  return {
    outer: {
      x: diagramBounds.left,
      y: diagramBounds.top,
      w: ___borderWidth,
      h: borderHeight,
      radius: _borderRadius,
    },
    inner: {
      x: diagramBounds.left + borderAnimationOffsets.l,
      y: diagramBounds.top + borderAnimationOffsets.t,
      w: ___borderWidth - borderAnimationOffsets.l - borderAnimationOffsets.r,
      h: borderHeight - borderAnimationOffsets.t - borderAnimationOffsets.b,
      radius: {
        topLeft: Math.max(
          0,
          _borderRadius.topLeft -
            Math.max(borderAnimationOffsets.t, borderAnimationOffsets.l),
        ),
        topRight: Math.max(
          0,
          _borderRadius.topRight -
            Math.max(borderAnimationOffsets.t, borderAnimationOffsets.r),
        ),
        bottomLeft: Math.max(
          0,
          _borderRadius.bottomLeft -
            Math.max(borderAnimationOffsets.b, borderAnimationOffsets.l),
        ),
        bottomRight: Math.max(
          0,
          _borderRadius.bottomRight -
            Math.max(borderAnimationOffsets.b, borderAnimationOffsets.r),
        ),
      },
    },
  };
}
function isAnimationRequired(
  ___targetElement,
  ____element,
  _animationElement,
  __animationSettings,
) {
  const isElementNull = ____element === null;
  const isAnimationElementNull = _animationElement === null;
  const __isAnimationActive =
    ___targetElement &&
    (!isElementNull || !isAnimationElementNull) &&
    calculateDiagramBounds(___targetElement, __animationSettings);
  return (
    __isAnimationActive &&
    (isElementNull ||
      animationRequestId(
        ____element,
        __isAnimationActive.left,
        __isAnimationActive.right,
      )) &&
    (isAnimationElementNull ||
      animationRequestId(
        _animationElement,
        __isAnimationActive.top,
        __isAnimationActive.bottom,
      ))
  );
}
function getCornerValues(cornerCoordinates) {
  return (
    cornerCoordinates.topLeft ||
    cornerCoordinates.topRight ||
    cornerCoordinates.bottomLeft ||
    cornerCoordinates.bottomRight
  );
}
function drawRectangle(________________canvasContext, rectangleCoordinates) {
  ________________canvasContext.rect(
    rectangleCoordinates.x,
    rectangleCoordinates.y,
    rectangleCoordinates.w,
    rectangleCoordinates.h,
  );
}
function adjustRectanglePosition(
  currentRectangle,
  offset,
  inputRectangle = {},
) {
  const horizontalOffset =
    currentRectangle.x !== inputRectangle.x ? -offset : 0;
  const _verticalOffset = currentRectangle.y !== inputRectangle.y ? -offset : 0;
  const widthAdjustment =
    (currentRectangle.x + currentRectangle.w !==
    inputRectangle.x + inputRectangle.w
      ? offset
      : 0) - horizontalOffset;
  const _heightAdjustment =
    (currentRectangle.y + currentRectangle.h !==
    inputRectangle.y + inputRectangle.h
      ? offset
      : 0) - _verticalOffset;
  return {
    x: currentRectangle.x + horizontalOffset,
    y: currentRectangle.y + _verticalOffset,
    w: currentRectangle.w + widthAdjustment,
    h: currentRectangle.h + _heightAdjustment,
    radius: currentRectangle.radius,
  };
}
class BarAnimationController extends _AnimationController {
  static id = "bar";
  static defaults = {
    borderSkipped: "start",
    borderWidth: 0,
    borderRadius: 0,
    inflateAmount: "auto",
    pointStyle: undefined,
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor",
  };
  constructor(optionsInput) {
    super();
    this.options = undefined;
    this.horizontal = undefined;
    this.base = undefined;
    this.width = undefined;
    this.height = undefined;
    this.inflateAmount = undefined;
    if (optionsInput) {
      Object.assign(this, optionsInput);
    }
  }
  draw(__________________________canvasContext) {
    const {
      inflateAmount: inflateAmount,
      options: {
        borderColor: borderColor,
        backgroundColor: ___backgroundColor,
      },
    } = this;
    const { inner: borderInnerDimensions, outer: outerBorder } =
      borderAnimation(this);
    const drawFunction = getCornerValues(outerBorder.radius)
      ? ___animationController
      : drawRectangle;
    __________________________canvasContext.save();
    if (
      outerBorder.w !== borderInnerDimensions.w ||
      outerBorder.h !== borderInnerDimensions.h
    ) {
      __________________________canvasContext.beginPath();
      drawFunction(
        __________________________canvasContext,
        adjustRectanglePosition(
          outerBorder,
          inflateAmount,
          borderInnerDimensions,
        ),
      );
      __________________________canvasContext.clip();
      drawFunction(
        __________________________canvasContext,
        adjustRectanglePosition(
          borderInnerDimensions,
          -inflateAmount,
          outerBorder,
        ),
      );
      __________________________canvasContext.fillStyle = borderColor;
      __________________________canvasContext.fill("evenodd");
    }
    __________________________canvasContext.beginPath();
    drawFunction(
      __________________________canvasContext,
      adjustRectanglePosition(borderInnerDimensions, inflateAmount),
    );
    __________________________canvasContext.fillStyle = ___backgroundColor;
    __________________________canvasContext.fill();
    __________________________canvasContext.restore();
  }
  inRange(
    _____targetValue,
    endRangeValue,
    _________________________________________________________index,
  ) {
    return isAnimationRequired(
      this,
      _____targetValue,
      endRangeValue,
      _________________________________________________________index,
    );
  }
  inXRange(__inputParameter, ______callbackFunction) {
    return isAnimationRequired(
      this,
      __inputParameter,
      null,
      ______callbackFunction,
    );
  }
  inYRange(valueToCheck, checkRange) {
    return isAnimationRequired(this, null, valueToCheck, checkRange);
  }
  getCenterPoint(targetProps) {
    const {
      x: ___centerX,
      y: ____yCoordinate,
      base: _baseValue,
      horizontal: _isHorizontal,
    } = this.getProps(["x", "y", "base", "horizontal"], targetProps);
    return {
      x: _isHorizontal ? (___centerX + _baseValue) / 2 : ___centerX,
      y: _isHorizontal ? ____yCoordinate : (____yCoordinate + _baseValue) / 2,
    };
  }
  getRange(axis) {
    if (axis === "x") {
      return this.width / 2;
    } else {
      return this.height / 2;
    }
  }
}
var ___animationElement = Object.freeze({
  __proto__: null,
  ArcElement: ArcAnimationController,
  BarElement: BarAnimationController,
  LineElement: LineAnimationController,
  PointElement: __AnimationController,
});
const chartAnimationContext = [
  "rgb(54, 162, 235)",
  "rgb(255, 99, 132)",
  "rgb(255, 159, 64)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
  "rgb(153, 102, 255)",
  "rgb(201, 203, 207)",
];
const ______requestAnimationFrameId = chartAnimationContext.map(
  (rgbToRgbaWithOpacity) =>
    rgbToRgbaWithOpacity.replace("rgb(", "rgba(").replace(")", ", 0.5)"),
);
function getChartAnimationContext(__animationIndex) {
  return chartAnimationContext[__animationIndex % chartAnimationContext.length];
}
function getRequestAnimationFrameId(
  __________________________________________________index,
) {
  return ______requestAnimationFrameId[
    __________________________________________________index %
      ______requestAnimationFrameId.length
  ];
}
function updateElementStyles(_elementStyles, iterationCount) {
  _elementStyles.borderColor = getChartAnimationContext(iterationCount);
  _elementStyles.backgroundColor = getRequestAnimationFrameId(iterationCount);
  return ++iterationCount;
}
function setElementBackgroundColor(_________element, colorIndex) {
  _________element.backgroundColor = _________element.data.map(() =>
    getChartAnimationContext(colorIndex++),
  );
  return colorIndex;
}
function colorFrameId(dataContainer, _colorIndex) {
  dataContainer.backgroundColor = dataContainer.data.map(() =>
    getRequestAnimationFrameId(_colorIndex++),
  );
  return _colorIndex;
}
function updateChartStyles(chartDataset) {
  let elementStyleIndex = 0;
  return (
    ________elementIndex,
    _______________________________________datasetIndex,
  ) => {
    const ___chartController = chartDataset.getDatasetMeta(
      _______________________________________datasetIndex,
    ).controller;
    if (___chartController instanceof DoughnutChartElement) {
      elementStyleIndex = setElementBackgroundColor(
        ________elementIndex,
        elementStyleIndex,
      );
    } else if (___chartController instanceof PolarAreaChart) {
      elementStyleIndex = colorFrameId(________elementIndex, elementStyleIndex);
    } else if (___chartController) {
      elementStyleIndex = updateElementStyles(
        ________elementIndex,
        elementStyleIndex,
      );
    }
  };
}
function hasBorderOrBackgroundColor(__styleProperties) {
  let stylePropertyKey;
  for (stylePropertyKey in __styleProperties) {
    if (
      __styleProperties[stylePropertyKey].borderColor ||
      __styleProperties[stylePropertyKey].backgroundColor
    ) {
      return true;
    }
  }
  return false;
}
function getBorderOrBackgroundColor(colorProperties) {
  return (
    colorProperties &&
    (colorProperties.borderColor || colorProperties.backgroundColor)
  );
}
var _animationTaskId = {
  id: "colors",
  defaults: {
    enabled: true,
    forceOverride: false,
  },
  beforeLayout(________chartInstance, layoutContext, layoutOptions) {
    if (!layoutOptions.enabled) {
      return;
    }
    const {
      data: { datasets: datasetsArray },
      options: __chartOptions,
    } = ________chartInstance.config;
    const { elements: elementStyles } = __chartOptions;
    if (
      !layoutOptions.forceOverride &&
      (hasBorderOrBackgroundColor(datasetsArray) ||
        getBorderOrBackgroundColor(__chartOptions) ||
        (elementStyles && hasBorderOrBackgroundColor(elementStyles)))
    ) {
      return;
    }
    const datasetProcessingFunction = updateChartStyles(________chartInstance);
    datasetsArray.forEach(datasetProcessingFunction);
  },
};
function extractSamples(
  _dataPoints,
  _startIndex,
  numSamples,
  samplesOrDefault,
  inputParameters,
) {
  const _sampleCount = inputParameters.samples || samplesOrDefault;
  if (_sampleCount >= numSamples) {
    return _dataPoints.slice(_startIndex, _startIndex + numSamples);
  }
  const sampleExtractedPoints = [];
  const sampleRatio = (numSamples - 2) / (_sampleCount - 2);
  let outputIndex = 0;
  const ____lastIndex = _startIndex + numSamples - 1;
  let currentSampleIndex;
  let closestDataPoint;
  let maxArea;
  let _maxArea;
  let _currentSampleIndex;
  let __currentSampleIndex = _startIndex;
  sampleExtractedPoints[outputIndex++] = _dataPoints[__currentSampleIndex];
  currentSampleIndex = 0;
  for (; currentSampleIndex < _sampleCount - 2; currentSampleIndex++) {
    let startSampleIndex;
    let sumXValues = 0;
    let sumY = 0;
    const __startIndex =
      Math.floor((currentSampleIndex + 1) * sampleRatio) + 1 + _startIndex;
    const _currentSampleEndIndex =
      Math.min(
        Math.floor((currentSampleIndex + 2) * sampleRatio) + 1,
        numSamples,
      ) + _startIndex;
    const sampleCount = _currentSampleEndIndex - __startIndex;
    for (
      startSampleIndex = __startIndex;
      startSampleIndex < _currentSampleEndIndex;
      startSampleIndex++
    ) {
      sumXValues += _dataPoints[startSampleIndex].x;
      sumY += _dataPoints[startSampleIndex].y;
    }
    sumXValues /= sampleCount;
    sumY /= sampleCount;
    const startIndexAdjusted =
      Math.floor(currentSampleIndex * sampleRatio) + 1 + _startIndex;
    const currentSampleEndIndex =
      Math.min(
        Math.floor((currentSampleIndex + 1) * sampleRatio) + 1,
        numSamples,
      ) + _startIndex;
    const { x: yCoordinate, y: pointYValue } =
      _dataPoints[__currentSampleIndex];
    maxArea = _maxArea = -1;
    startSampleIndex = startIndexAdjusted;
    for (; startSampleIndex < currentSampleEndIndex; startSampleIndex++) {
      _maxArea =
        Math.abs(
          (yCoordinate - sumXValues) *
            (_dataPoints[startSampleIndex].y - pointYValue) -
            (yCoordinate - _dataPoints[startSampleIndex].x) *
              (sumY - pointYValue),
        ) * 0.5;
      if (_maxArea > maxArea) {
        maxArea = _maxArea;
        closestDataPoint = _dataPoints[startSampleIndex];
        _currentSampleIndex = startSampleIndex;
      }
    }
    sampleExtractedPoints[outputIndex++] = closestDataPoint;
    __currentSampleIndex = _currentSampleIndex;
  }
  sampleExtractedPoints[outputIndex++] = _dataPoints[____lastIndex];
  return sampleExtractedPoints;
}
function processDataPoints(dataPoints, currentIndex, rangeIndex, scaleFactor) {
  let currentDataPointIndex;
  let ___currentDataPoint;
  let normalizedDataPointPosition;
  let currentYValue;
  let _resultingValue;
  let lastValidIndex;
  let maxIndexInRange;
  let lastProcessedIndex;
  let currentLowestYValue;
  let maxYValue;
  let averageXCoordinate = 0;
  let countValidDataPoints = 0;
  const processedDataPoints = [];
  const lastIndexInRange = currentIndex + rangeIndex - 1;
  const currentDataPointX = dataPoints[currentIndex].x;
  const deltaX = dataPoints[lastIndexInRange].x - currentDataPointX;
  for (
    currentDataPointIndex = currentIndex;
    currentDataPointIndex < currentIndex + rangeIndex;
    ++currentDataPointIndex
  ) {
    ___currentDataPoint = dataPoints[currentDataPointIndex];
    normalizedDataPointPosition =
      ((___currentDataPoint.x - currentDataPointX) / deltaX) * scaleFactor;
    currentYValue = ___currentDataPoint.y;
    const resultingValue = normalizedDataPointPosition | 0;
    if (resultingValue === _resultingValue) {
      if (currentYValue < currentLowestYValue) {
        currentLowestYValue = currentYValue;
        lastValidIndex = currentDataPointIndex;
      } else if (currentYValue > maxYValue) {
        maxYValue = currentYValue;
        maxIndexInRange = currentDataPointIndex;
      }
      averageXCoordinate =
        (countValidDataPoints * averageXCoordinate + ___currentDataPoint.x) /
        ++countValidDataPoints;
    } else {
      const previousIndex = currentDataPointIndex - 1;
      if (
        !chartUpdateInterval(lastValidIndex) &&
        !chartUpdateInterval(maxIndexInRange)
      ) {
        const currentYCoordinate = Math.min(lastValidIndex, maxIndexInRange);
        const maxIndex = Math.max(lastValidIndex, maxIndexInRange);
        if (
          currentYCoordinate !== lastProcessedIndex &&
          currentYCoordinate !== previousIndex
        ) {
          processedDataPoints.push({
            ...dataPoints[currentYCoordinate],
            x: averageXCoordinate,
          });
        }
        if (maxIndex !== lastProcessedIndex && maxIndex !== previousIndex) {
          processedDataPoints.push({
            ...dataPoints[maxIndex],
            x: averageXCoordinate,
          });
        }
      }
      if (currentDataPointIndex > 0 && previousIndex !== lastProcessedIndex) {
        processedDataPoints.push(dataPoints[previousIndex]);
      }
      processedDataPoints.push(___currentDataPoint);
      _resultingValue = resultingValue;
      countValidDataPoints = 0;
      currentLowestYValue = maxYValue = currentYValue;
      lastValidIndex =
        maxIndexInRange =
        lastProcessedIndex =
          currentDataPointIndex;
    }
  }
  return processedDataPoints;
}
function processIo(ioObject) {
  if (ioObject._decimated) {
    const _decimatedData = ioObject._data;
    delete ioObject._decimated;
    delete ioObject._data;
    Object.defineProperty(ioObject, "data", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: _decimatedData,
    });
  }
}
function processDatasetItem(datasetItem) {
  datasetItem.data.datasets.forEach((ioData) => {
    processIo(ioData);
  });
}
function calculateNotificationRange(userScale, notificationList) {
  const notificationCount = notificationList.length;
  let _notificationCount;
  let notificationStartIndex = 0;
  const { iScale: userScaleDetails } = userScale;
  const {
    min: ________minValue,
    max: maxUserBound,
    minDefined: ___isMinDefined,
    maxDefined: _isMaxDefined,
  } = userScaleDetails.getUserBounds();
  if (___isMinDefined) {
    notificationStartIndex = chartAnimationState(
      notificationFunction(
        notificationList,
        userScaleDetails.axis,
        ________minValue,
      ).lo,
      0,
      notificationCount - 1,
    );
  }
  if (_isMaxDefined) {
    _notificationCount =
      chartAnimationState(
        notificationFunction(
          notificationList,
          userScaleDetails.axis,
          maxUserBound,
        ).hi + 1,
        notificationStartIndex,
        notificationCount,
      ) - notificationStartIndex;
  } else {
    _notificationCount = notificationCount - notificationStartIndex;
  }
  return {
    start: notificationStartIndex,
    count: _notificationCount,
  };
}
var ___isChartAnimationRunning = {
  id: "decimation",
  defaults: {
    algorithm: "min-max",
    enabled: false,
  },
  beforeElementsUpdate: (__chartInstance, dataset, decimationSettings) => {
    if (!decimationSettings.enabled) {
      processDatasetItem(__chartInstance);
      return;
    }
    const chartWidth = __chartInstance.width;
    __chartInstance.data.datasets.forEach((__chartData, datasetMeta) => {
      const { _data: inputData, indexAxis: indexAxis } = __chartData;
      const _datasetMeta = __chartInstance.getDatasetMeta(datasetMeta);
      const _inputData = inputData || __chartData.data;
      if (
        animationOptions([indexAxis, __chartInstance.options.indexAxis]) === "y"
      ) {
        return;
      }
      if (!_datasetMeta.controller.supportsDecimation) {
        return;
      }
      const xAxisScale = __chartInstance.scales[_datasetMeta.xAxisID];
      if (xAxisScale.type !== "linear" && xAxisScale.type !== "time") {
        return;
      }
      if (__chartInstance.options.parsing) {
        return;
      }
      let { start: startIndex, count: decimatedCount } =
        calculateNotificationRange(_datasetMeta, _inputData);
      if (decimatedCount <= (decimationSettings.threshold || chartWidth * 4)) {
        processIo(__chartData);
        return;
      }
      let decimatedData;
      if (chartUpdateInterval(inputData)) {
        __chartData._data = _inputData;
        delete __chartData.data;
        Object.defineProperty(__chartData, "data", {
          configurable: true,
          enumerable: true,
          get: function () {
            return this._decimated;
          },
          set: function (______inputData) {
            this._data = ______inputData;
          },
        });
      }
      switch (decimationSettings.algorithm) {
        case "lttb":
          decimatedData = extractSamples(
            _inputData,
            startIndex,
            decimatedCount,
            chartWidth,
            decimationSettings,
          );
          break;
        case "min-max":
          decimatedData = processDataPoints(
            _inputData,
            startIndex,
            decimatedCount,
            chartWidth,
          );
          break;
        default:
          throw new Error(
            `Unsupported decimation algorithm '${decimationSettings.algorithm}'`,
          );
      }
      __chartData._decimated = decimatedData;
    });
  },
  destroy(____target) {
    processDatasetItem(____target);
  },
};
function mapAnimationSegmentsToTargets(
  animationSegments,
  targetSegments,
  currentSegmentIndex,
) {
  const animationSegmentsList = animationSegments.segments;
  const animationPoints = animationSegments.points;
  const targetPoints = targetSegments.points;
  const mappedAnimationTargets = [];
  for (const __animationTask of animationSegmentsList) {
    let { start: segment, end: endSegment } = __animationTask;
    endSegment = findLastValidPointIndex(segment, endSegment, animationPoints);
    const targetSegmentMapping = getAnimationProperty(
      currentSegmentIndex,
      animationPoints[segment],
      animationPoints[endSegment],
      __animationTask.loop,
    );
    if (!targetSegments.segments) {
      mappedAnimationTargets.push({
        source: __animationTask,
        target: targetSegmentMapping,
        start: animationPoints[segment],
        end: animationPoints[endSegment],
      });
      continue;
    }
    const targetSegmentsList = animationTaskId(
      targetSegments,
      targetSegmentMapping,
    );
    for (const _segment of targetSegmentsList) {
      const geometryData = getAnimationProperty(
        currentSegmentIndex,
        targetPoints[_segment.start],
        targetPoints[_segment.end],
        _segment.loop,
      );
      const requestAnimationFrameResult = _requestAnimationFrame(
        __animationTask,
        animationPoints,
        geometryData,
      );
      for (const animationFrameResultItem of requestAnimationFrameResult) {
        mappedAnimationTargets.push({
          source: animationFrameResultItem,
          target: _segment,
          start: {
            [currentSegmentIndex]: arrayElementRetriever(
              targetSegmentMapping,
              geometryData,
              "start",
              Math.max,
            ),
          },
          end: {
            [currentSegmentIndex]: arrayElementRetriever(
              targetSegmentMapping,
              geometryData,
              "end",
              Math.min,
            ),
          },
        });
      }
    }
  }
  return mappedAnimationTargets;
}
function getAnimationProperty(
  propertyKey,
  propertyValue,
  __endValue,
  isAnimationEnabled,
) {
  if (isAnimationEnabled) {
    return;
  }
  let ____startValue = propertyValue[propertyKey];
  let _____endValue = __endValue[propertyKey];
  if (propertyKey === "angle") {
    ____startValue = animationRefreshRate(____startValue);
    _____endValue = animationRefreshRate(_____endValue);
  }
  return {
    property: propertyKey,
    start: ____startValue,
    end: _____endValue,
  };
}
function coordinateOutput(coordinateOptions, _pathData) {
  const { x: fixedXCoordinate = null, y: ______yCoordinate = null } =
    coordinateOptions || {};
  const pathDataPoints = _pathData.points;
  const outputCoordinates = [];
  _pathData.segments.forEach(({ start: startCoordinate, end: endValue }) => {
    endValue = findLastValidPointIndex(
      startCoordinate,
      endValue,
      pathDataPoints,
    );
    const __startPoint = pathDataPoints[startCoordinate];
    const _endCoordinate = pathDataPoints[endValue];
    if (______yCoordinate !== null) {
      outputCoordinates.push({
        x: __startPoint.x,
        y: ______yCoordinate,
      });
      outputCoordinates.push({
        x: _endCoordinate.x,
        y: ______yCoordinate,
      });
    } else if (fixedXCoordinate !== null) {
      outputCoordinates.push({
        x: fixedXCoordinate,
        y: __startPoint.y,
      });
      outputCoordinates.push({
        x: fixedXCoordinate,
        y: _endCoordinate.y,
      });
    }
  });
  return outputCoordinates;
}
function findLastValidPointIndex(
  indexOfValidPoint,
  ___endIndex,
  __________________________index,
) {
  for (; ___endIndex > indexOfValidPoint; ___endIndex--) {
    const pointAtEndIndex = __________________________index[___endIndex];
    if (!isNaN(pointAtEndIndex.x) && !isNaN(pointAtEndIndex.y)) {
      break;
    }
  }
  return ___endIndex;
}
function arrayElementRetriever(
  _sourceArray,
  ___dataArray,
  ___________________index,
  ____callbackFunction,
) {
  if (_sourceArray && ___dataArray) {
    return ____callbackFunction(
      _sourceArray[___________________index],
      ___dataArray[___________________index],
    );
  } else if (_sourceArray) {
    return _sourceArray[___________________index];
  } else if (___dataArray) {
    return ___dataArray[___________________index];
  } else {
    return 0;
  }
}
function createChartPoints(______________chartData, _______________chartData) {
  let chartPoints = [];
  let isAnimated = false;
  if (animatedChartItems(______________chartData)) {
    isAnimated = true;
    chartPoints = ______________chartData;
  } else {
    chartPoints = coordinateOutput(
      ______________chartData,
      _______________chartData,
    );
  }
  if (chartPoints.length) {
    return new LineAnimationController({
      points: chartPoints,
      options: {
        tension: 0,
      },
      _loop: isAnimated,
      _fullLoop: isAnimated,
    });
  } else {
    return null;
  }
}
function shouldFill(isFillEnabled) {
  return isFillEnabled && isFillEnabled.fill !== false;
}
function getFillColor(dataSet, fillColorKey, filledChartIndex) {
  let currentFillColor = dataSet[fillColorKey].fill;
  const visitedFillColors = [fillColorKey];
  let currentChartObject;
  if (!filledChartIndex) {
    return currentFillColor;
  }
  while (
    currentFillColor !== false &&
    visitedFillColors.indexOf(currentFillColor) === -1
  ) {
    if (!chartUpdateTrigger(currentFillColor)) {
      return currentFillColor;
    }
    currentChartObject = dataSet[currentFillColor];
    if (!currentChartObject) {
      return false;
    }
    if (currentChartObject.visible) {
      return currentFillColor;
    }
    visitedFillColors.push(currentFillColor);
    currentFillColor = currentChartObject.fill;
  }
  return false;
}
function chartAnimationHandler(_inputValue, _animationState, chartIndex) {
  const chartAnimationOrigin = getChartAnimationOrigin(_inputValue);
  if (currentAnimationIndex(chartAnimationOrigin)) {
    return !isNaN(chartAnimationOrigin.value) && chartAnimationOrigin;
  }
  let parsedAnimationOrigin = parseFloat(chartAnimationOrigin);
  if (
    chartUpdateTrigger(parsedAnimationOrigin) &&
    Math.floor(parsedAnimationOrigin) === parsedAnimationOrigin
  ) {
    return operationResult(
      chartAnimationOrigin[0],
      _animationState,
      parsedAnimationOrigin,
      chartIndex,
    );
  } else {
    return (
      ["origin", "start", "end", "stack", "shape"].indexOf(
        chartAnimationOrigin,
      ) >= 0 && chartAnimationOrigin
    );
  }
}
function operationResult(operationSign, __currentValue, result, maxValue) {
  if (operationSign === "-" || operationSign === "+") {
    result = __currentValue + result;
  }
  return (
    result !== __currentValue &&
    !(result < 0) &&
    !(result >= maxValue) &&
    result
  );
}
function animationPixelValue(__animationPosition, coordinateSystem) {
  let _animationPixelValue = null;
  if (__animationPosition === "start") {
    _animationPixelValue = coordinateSystem.bottom;
  } else if (__animationPosition === "end") {
    _animationPixelValue = coordinateSystem.top;
  } else if (currentAnimationIndex(__animationPosition)) {
    _animationPixelValue = coordinateSystem.getPixelForValue(
      __animationPosition.value,
    );
  } else if (coordinateSystem.getBasePixel) {
    _animationPixelValue = coordinateSystem.getBasePixel();
  }
  return _animationPixelValue;
}
function calculateAnimationValue(
  __animationState,
  __animationOptions,
  _inputParameter,
) {
  let animatedValue;
  if (__animationState === "start") {
    animatedValue = _inputParameter;
  } else if (__animationState === "end") {
    if (__animationOptions.options.reverse) {
      animatedValue = __animationOptions.min;
    } else {
      animatedValue = __animationOptions.max;
    }
  } else if (currentAnimationIndex(__animationState)) {
    animatedValue = __animationState.value;
  } else {
    animatedValue = __animationOptions.getBaseValue();
  }
  return animatedValue;
}
function getChartAnimationOrigin(____chartOptions) {
  const _________chartOptions = ____chartOptions.options;
  const chartFillOptions = _________chartOptions.fill;
  let isAnimationOriginDefined = chartAnimationRunning(
    chartFillOptions && chartFillOptions.target,
    chartFillOptions,
  );
  if (isAnimationOriginDefined === undefined) {
    isAnimationOriginDefined = !!_________chartOptions.backgroundColor;
  }
  return (
    isAnimationOriginDefined !== false &&
    isAnimationOriginDefined !== null &&
    (isAnimationOriginDefined === true ? "origin" : isAnimationOriginDefined)
  );
}
function _processInputData(___inputData) {
  const {
    scale: ___scaleValue,
    index: ________________________dataIndex,
    line: lineData,
  } = ___inputData;
  const interpolatedPoints = [];
  const _lineSegments = lineData.segments;
  const __pointsArray = lineData.points;
  const visibleMetaData = getVisibleMetaDatasUntilIndex(
    ___scaleValue,
    ________________________dataIndex,
  );
  visibleMetaData.push(
    createChartPoints(
      {
        x: null,
        y: ___scaleValue.bottom,
      },
      lineData,
    ),
  );
  for (
    let _____________________________________currentIndex = 0;
    _____________________________________currentIndex < _lineSegments.length;
    _____________________________________currentIndex++
  ) {
    const ____currentItem =
      _lineSegments[_____________________________________currentIndex];
    for (
      let ____________________________________currentIndex =
        ____currentItem.start;
      ____________________________________currentIndex <= ____currentItem.end;
      ____________________________________currentIndex++
    ) {
      processInterpolation(
        interpolatedPoints,
        __pointsArray[____________________________________currentIndex],
        visibleMetaData,
      );
    }
  }
  return new LineAnimationController({
    points: interpolatedPoints,
    options: {},
  });
}
function getVisibleMetaDatasUntilIndex(
  targetMetaIndex,
  _________________currentIndex,
) {
  const visibleMetaDatas = [];
  const matchingVisibleMetas = targetMetaIndex.getMatchingVisibleMetas("line");
  for (
    let currentMetaIndex = 0;
    currentMetaIndex < matchingVisibleMetas.length;
    currentMetaIndex++
  ) {
    const _____currentElement = matchingVisibleMetas[currentMetaIndex];
    if (_____currentElement.index === _________________currentIndex) {
      break;
    }
    if (!_____currentElement.hidden) {
      visibleMetaDatas.unshift(_____currentElement.dataset);
    }
  }
  return visibleMetaDatas;
}
function processInterpolation(_outputArray, externalParameter, ___inputArray) {
  const pointsToPrepend = [];
  for (
    let ____________________________________________________currentIndex = 0;
    ____________________________________________________currentIndex <
    ___inputArray.length;
    ____________________________________________________currentIndex++
  ) {
    const currentItem =
      ___inputArray[
        ____________________________________________________currentIndex
      ];
    const {
      first: firstName,
      last: lastName,
      point: pointValue,
    } = interpolationCheck(currentItem, externalParameter, "x");
    if (!!pointValue && (!firstName || !lastName)) {
      if (firstName) {
        pointsToPrepend.unshift(pointValue);
      } else {
        _outputArray.push(pointValue);
        if (!lastName) {
          break;
        }
      }
    }
  }
  _outputArray.push(...pointsToPrepend);
}
function interpolationCheck(
  interpolator,
  interpolatedValue,
  interpolationIndex,
) {
  const interpolatedResult = interpolator.interpolate(
    interpolatedValue,
    interpolationIndex,
  );
  if (!interpolatedResult) {
    return {};
  }
  const interpolatedPointValue = interpolatedResult[interpolationIndex];
  const interpolatorSegments = interpolator.segments;
  const interpolatorPoints = interpolator.points;
  let isStartValue = false;
  let isEndInterpolationValue = false;
  for (
    let _currentSegmentIndex = 0;
    _currentSegmentIndex < interpolatorSegments.length;
    _currentSegmentIndex++
  ) {
    const currentAnimationFrame = interpolatorSegments[_currentSegmentIndex];
    const __startValue =
      interpolatorPoints[currentAnimationFrame.start][interpolationIndex];
    const endInterpolationValue =
      interpolatorPoints[currentAnimationFrame.end][interpolationIndex];
    if (
      animationRequestId(
        interpolatedPointValue,
        __startValue,
        endInterpolationValue,
      )
    ) {
      isStartValue = interpolatedPointValue === __startValue;
      isEndInterpolationValue =
        interpolatedPointValue === endInterpolationValue;
      break;
    }
  }
  return {
    first: isStartValue,
    last: isEndInterpolationValue,
    point: interpolatedResult,
  };
}
class Circle {
  constructor(circleProperties) {
    this.x = circleProperties.x;
    this.y = circleProperties.y;
    this.radius = circleProperties.radius;
  }
  pathSegment(arcContext, arcAnimationFrame, isBoundsUndefined) {
    const { x: __centerX, y: _centerY, radius: arcRadius } = this;
    arcAnimationFrame = arcAnimationFrame || {
      start: 0,
      end: lastAnimationUpdateTimestamp,
    };
    arcContext.arc(
      __centerX,
      _centerY,
      arcRadius,
      arcAnimationFrame.end,
      arcAnimationFrame.start,
      true,
    );
    return !isBoundsUndefined.bounds;
  }
  interpolate(angleParameter) {
    const { x: _centerX, y: centerY, radius: ___radius } = this;
    const _angleValue = angleParameter.angle;
    return {
      x: _centerX + Math.cos(_angleValue) * ___radius,
      y: centerY + Math.sin(_angleValue) * ___radius,
      angle: _angleValue,
    };
  }
}
function processChartConfig(____chartConfig) {
  const {
    chart: __________chartConfig,
    fill: _fillColor,
    line: lineConfig,
  } = ____chartConfig;
  if (chartUpdateTrigger(_fillColor)) {
    return getDataset(__________chartConfig, _fillColor);
  }
  if (_fillColor === "stack") {
    return _processInputData(____chartConfig);
  }
  if (_fillColor === "shape") {
    return true;
  }
  const _processedChartData = ___processChartData(____chartConfig);
  if (_processedChartData instanceof Circle) {
    return _processedChartData;
  } else {
    return createChartPoints(_processedChartData, lineConfig);
  }
}
function getDataset(
  ________________chartInstance,
  _____________________datasetIndex,
) {
  const ___________datasetMeta = ________________chartInstance.getDatasetMeta(
    _____________________datasetIndex,
  );
  if (
    ___________datasetMeta &&
    ________________chartInstance.isDatasetVisible(
      _____________________datasetIndex,
    )
  ) {
    return ___________datasetMeta.dataset;
  } else {
    return null;
  }
}
function ___processChartData(________________________chartData) {
  if (
    (________________________chartData.scale || {}).getPointPositionForValue
  ) {
    return animationPointsGenerator(________________________chartData);
  } else {
    return createChartCoordinates(________________________chartData);
  }
}
function createChartCoordinates(____________________chartData) {
  const { scale: scaleConfig = {}, fill: fillColor } =
    ____________________chartData;
  const animationPixelCoordinate = animationPixelValue(fillColor, scaleConfig);
  if (chartUpdateTrigger(animationPixelCoordinate)) {
    const isHorizontalScale = scaleConfig.isHorizontal();
    return {
      x: isHorizontalScale ? animationPixelCoordinate : null,
      y: isHorizontalScale ? null : animationPixelCoordinate,
    };
  }
  return null;
}
function animationPointsGenerator(config) {
  const { scale: __scaleConfig, fill: __fillColor } = config;
  const __________animationOptions = __scaleConfig.options;
  const __labelCount = __scaleConfig.getLabels().length;
  const minOrMaxValue = __________animationOptions.reverse
    ? __scaleConfig.max
    : __scaleConfig.min;
  const ___animationValue = calculateAnimationValue(
    __fillColor,
    __scaleConfig,
    minOrMaxValue,
  );
  const _animationPoints = [];
  if (__________animationOptions.grid.circular) {
    const pointPositionForZero = __scaleConfig.getPointPositionForValue(
      0,
      minOrMaxValue,
    );
    return new Circle({
      x: pointPositionForZero.x,
      y: pointPositionForZero.y,
      radius: __scaleConfig.getDistanceFromCenterForValue(___animationValue),
    });
  }
  for (
    let __________________________________________________________currentIndex = 0;
    __________________________________________________________currentIndex <
    __labelCount;
    ++__________________________________________________________currentIndex
  ) {
    _animationPoints.push(
      __scaleConfig.getPointPositionForValue(
        __________________________________________________________currentIndex,
        ___animationValue,
      ),
    );
  }
  return _animationPoints;
}
function _____processChartData(targetValue, ___chartConfig, area) {
  const processedChartConfig = processChartConfig(___chartConfig);
  const {
    line: _lineConfig,
    scale: _scaleConfig,
    axis: axisOptions,
  } = ___chartConfig;
  const lineOptions = _lineConfig.options;
  const _chartFillOptions = lineOptions.fill;
  const __backgroundColor = lineOptions.backgroundColor;
  const {
    above: defaultFillColor = __backgroundColor,
    below: belowFillColor = __backgroundColor,
  } = _chartFillOptions || {};
  if (processedChartConfig && _lineConfig.points.length) {
    __________animationManager(targetValue, area);
    renderPlot(targetValue, {
      line: _lineConfig,
      target: processedChartConfig,
      above: defaultFillColor,
      below: belowFillColor,
      area: area,
      scale: _scaleConfig,
      axis: axisOptions,
    });
    ______chartAnimationQueue(targetValue);
  }
}
function renderPlot(_______canvasContext, plotConfig) {
  const {
    line: __lineConfig,
    target: ______targetValue,
    above: aboveColor,
    below: belowThresholdColor,
    area: areaBounds,
    scale: _____scaleFactor,
  } = plotConfig;
  const axisProperty = __lineConfig._loop ? "angle" : plotConfig.axis;
  _______canvasContext.save();
  if (axisProperty === "x" && belowThresholdColor !== aboveColor) {
    drawPathOnCanvas(_______canvasContext, ______targetValue, areaBounds.top);
    drawPathSegments(_______canvasContext, {
      line: __lineConfig,
      target: ______targetValue,
      color: aboveColor,
      scale: _____scaleFactor,
      property: axisProperty,
    });
    _______canvasContext.restore();
    _______canvasContext.save();
    drawPathOnCanvas(
      _______canvasContext,
      ______targetValue,
      areaBounds.bottom,
    );
  }
  drawPathSegments(_______canvasContext, {
    line: __lineConfig,
    target: ______targetValue,
    color: belowThresholdColor,
    scale: _____scaleFactor,
    property: axisProperty,
  });
  _______canvasContext.restore();
}
function drawPathOnCanvas(______canvasContext, pathData, _yCoordinate) {
  const { segments: __pathSegments, points: ____pointsArray } = pathData;
  let isFirstSegment = true;
  let isFirstSegmentCompleted = false;
  ______canvasContext.beginPath();
  for (const pathSegment of __pathSegments) {
    const { start: _pathSegments, end: endCoordinate } = pathSegment;
    const startPoint = ____pointsArray[_pathSegments];
    const endPointCoordinates =
      ____pointsArray[
        findLastValidPointIndex(_pathSegments, endCoordinate, ____pointsArray)
      ];
    if (isFirstSegment) {
      ______canvasContext.moveTo(startPoint.x, startPoint.y);
      isFirstSegment = false;
    } else {
      ______canvasContext.lineTo(startPoint.x, _yCoordinate);
      ______canvasContext.lineTo(startPoint.x, startPoint.y);
    }
    isFirstSegmentCompleted = !!pathData.pathSegment(
      ______canvasContext,
      pathSegment,
      {
        move: isFirstSegmentCompleted,
      },
    );
    if (isFirstSegmentCompleted) {
      ______canvasContext.closePath();
    } else {
      ______canvasContext.lineTo(endPointCoordinates.x, _yCoordinate);
    }
  }
  ______canvasContext.lineTo(pathData.first().x, _yCoordinate);
  ______canvasContext.closePath();
  ______canvasContext.clip();
}
function drawPathSegments(___canvasContext, drawOptions) {
  const {
    line: lineSegments,
    target: targetSegment,
    property: _animationProperty,
    color: pathSegmentColor,
    scale: ___scaleFactor,
  } = drawOptions;
  const _animationSegments = mapAnimationSegmentsToTargets(
    lineSegments,
    targetSegment,
    _animationProperty,
  );
  for (const {
    source: pathSegmentData,
    target: ________targetElement,
    start: startPosition,
    end: endPosition,
  } of _animationSegments) {
    const { style: { backgroundColor: pathSegments = pathSegmentColor } = {} } =
      pathSegmentData;
    const isNotInteractive = targetSegment !== true;
    ___canvasContext.save();
    ___canvasContext.fillStyle = pathSegments;
    clipRectangle(
      ___canvasContext,
      ___scaleFactor,
      isNotInteractive &&
        getAnimationProperty(_animationProperty, startPosition, endPosition),
    );
    ___canvasContext.beginPath();
    const isPathSegmentVisible = !!lineSegments.pathSegment(
      ___canvasContext,
      pathSegmentData,
    );
    let isPathSegmentClosed;
    if (isNotInteractive) {
      if (isPathSegmentVisible) {
        ___canvasContext.closePath();
      } else {
        drawLineIfInterpolated(
          ___canvasContext,
          targetSegment,
          endPosition,
          _animationProperty,
        );
      }
      const _element = !!targetSegment.pathSegment(
        ___canvasContext,
        ________targetElement,
        {
          move: isPathSegmentVisible,
          reverse: true,
        },
      );
      isPathSegmentClosed = isPathSegmentVisible && _element;
      if (!isPathSegmentClosed) {
        drawLineIfInterpolated(
          ___canvasContext,
          targetSegment,
          startPosition,
          _animationProperty,
        );
      }
    }
    ___canvasContext.closePath();
    ___canvasContext.fill(isPathSegmentClosed ? "evenodd" : "nonzero");
    ___canvasContext.restore();
  }
}
function clipRectangle(_____________canvasContext, _chartArea, chartAreaStyle) {
  const { top: chartAreaTop, bottom: bottomYCoordinate } =
    _chartArea.chart.chartArea;
  const {
    property: clipAxisOrientation,
    start: chartAreaStartX,
    end: chartAreaEnd,
  } = chartAreaStyle || {};
  if (clipAxisOrientation === "x") {
    _____________canvasContext.beginPath();
    _____________canvasContext.rect(
      chartAreaStartX,
      chartAreaTop,
      chartAreaEnd - chartAreaStartX,
      bottomYCoordinate - chartAreaTop,
    );
    _____________canvasContext.clip();
  }
}
function drawLineIfInterpolated(
  _graphicsContext,
  _interpolator,
  interpolationValue,
  _interpolationValue,
) {
  const interpolatedPoint = _interpolator.interpolate(
    interpolationValue,
    _interpolationValue,
  );
  if (interpolatedPoint) {
    _graphicsContext.lineTo(interpolatedPoint.x, interpolatedPoint.y);
  }
}
var _animationControllerInstance = {
  id: "filler",
  afterDatasetsUpdate(___chartInstance, updatedDatasets, indexPropagation) {
    const datasetCount = (___chartInstance.data.datasets || []).length;
    const datasetMetadataList = [];
    let ___datasetMeta;
    let _datasetIndex;
    let ___dataset;
    let datasetMetaInfo;
    for (_datasetIndex = 0; _datasetIndex < datasetCount; ++_datasetIndex) {
      ___datasetMeta = ___chartInstance.getDatasetMeta(_datasetIndex);
      ___dataset = ___datasetMeta.dataset;
      datasetMetaInfo = null;
      if (
        ___dataset &&
        ___dataset.options &&
        ___dataset instanceof LineAnimationController
      ) {
        datasetMetaInfo = {
          visible: ___chartInstance.isDatasetVisible(_datasetIndex),
          index: _datasetIndex,
          fill: chartAnimationHandler(___dataset, _datasetIndex, datasetCount),
          chart: ___chartInstance,
          axis: ___datasetMeta.controller.options.indexAxis,
          scale: ___datasetMeta.vScale,
          line: ___dataset,
        };
      }
      ___datasetMeta.$filler = datasetMetaInfo;
      datasetMetadataList.push(datasetMetaInfo);
    }
    for (_datasetIndex = 0; _datasetIndex < datasetCount; ++_datasetIndex) {
      datasetMetaInfo = datasetMetadataList[_datasetIndex];
      if (datasetMetaInfo && datasetMetaInfo.fill !== false) {
        datasetMetaInfo.fill = getFillColor(
          datasetMetadataList,
          _datasetIndex,
          indexPropagation.propagate,
        );
      }
    }
  },
  beforeDraw(______chartInstance, _________datasetIndex, datasetMetaIndex) {
    const isBeforeDraw = datasetMetaIndex.drawTime === "beforeDraw";
    const sortedVisibleDatasetMetas =
      ______chartInstance.getSortedVisibleDatasetMetas();
    const chartArea = ______chartInstance.chartArea;
    for (
      let visibleDatasetMetaIndex = sortedVisibleDatasetMetas.length - 1;
      visibleDatasetMetaIndex >= 0;
      --visibleDatasetMetaIndex
    ) {
      const fillerDatasetMeta =
        sortedVisibleDatasetMetas[visibleDatasetMetaIndex].$filler;
      if (fillerDatasetMeta) {
        fillerDatasetMeta.line.updateControlPoints(
          chartArea,
          fillerDatasetMeta.axis,
        );
        if (isBeforeDraw && fillerDatasetMeta.fill) {
          _____processChartData(
            ______chartInstance.ctx,
            fillerDatasetMeta,
            chartArea,
          );
        }
      }
    }
  },
  beforeDatasetsDraw(
    __________chartInstance,
    _visibleDatasetIndex,
    drawTimeIndicator,
  ) {
    if (drawTimeIndicator.drawTime !== "beforeDatasetsDraw") {
      return;
    }
    const _sortedVisibleDatasetMetas =
      __________chartInstance.getSortedVisibleDatasetMetas();
    for (
      let ______________________currentIndex =
        _sortedVisibleDatasetMetas.length - 1;
      ______________________currentIndex >= 0;
      --______________________currentIndex
    ) {
      const _fillerDatasetMeta =
        _sortedVisibleDatasetMetas[______________________currentIndex].$filler;
      if (shouldFill(_fillerDatasetMeta)) {
        _____processChartData(
          __________chartInstance.ctx,
          _fillerDatasetMeta,
          __________chartInstance.chartArea,
        );
      }
    }
  },
  beforeDatasetDraw(drawTimeContext, metaFiller, drawCallbackIndex) {
    const fillerMetaData = metaFiller.meta.$filler;
    if (
      shouldFill(fillerMetaData) &&
      drawCallbackIndex.drawTime === "beforeDatasetDraw"
    ) {
      _____processChartData(
        drawTimeContext.ctx,
        fillerMetaData,
        drawTimeContext.chartArea,
      );
    }
  },
  defaults: {
    propagate: true,
    drawTime: "beforeDatasetDraw",
  },
};
const _chartUpdater = (______chartDimensions, defaultDimension) => {
  let { boxHeight = defaultDimension, boxWidth = defaultDimension } =
    ______chartDimensions;
  if (______chartDimensions.usePointStyle) {
    boxHeight = Math.min(boxHeight, defaultDimension);
    boxWidth =
      ______chartDimensions.pointStyleWidth ||
      Math.min(boxWidth, defaultDimension);
  }
  return {
    boxWidth: boxWidth,
    boxHeight: boxHeight,
    itemHeight: Math.max(defaultDimension, boxHeight),
  };
};
const _______animationController = (targetData, ______targetElement) =>
  targetData !== null &&
  ______targetElement !== null &&
  targetData.datasetIndex === ______targetElement.datasetIndex &&
  targetData.index === ______targetElement.index;
class ChartLegendController extends _AnimationController {
  constructor(_____________chartConfig) {
    super();
    this._added = false;
    this.legendHitBoxes = [];
    this._hoveredItem = null;
    this.doughnutMode = false;
    this.chart = _____________chartConfig.chart;
    this.options = _____________chartConfig.options;
    this.ctx = _____________chartConfig.ctx;
    this.legendItems = undefined;
    this.columnSizes = undefined;
    this.lineWidths = undefined;
    this.maxHeight = undefined;
    this.maxWidth = undefined;
    this.top = undefined;
    this.bottom = undefined;
    this.left = undefined;
    this.right = undefined;
    this.height = undefined;
    this.width = undefined;
    this._margins = undefined;
    this.position = undefined;
    this.weight = undefined;
    this.fullSize = undefined;
  }
  update(maxWidthValue, maxHeightValue, margins) {
    this.maxWidth = maxWidthValue;
    this.maxHeight = maxHeightValue;
    this._margins = margins;
    this.setDimensions();
    this.buildLabels();
    this.fit();
  }
  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = this._margins.left;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = this._margins.top;
      this.bottom = this.height;
    }
  }
  buildLabels() {
    const labelOptions = this.options.labels || {};
    let generatedLabels =
      ________animationContext(
        labelOptions.generateLabels,
        [this.chart],
        this,
      ) || [];
    if (labelOptions.filter) {
      generatedLabels = generatedLabels.filter((itemToFilter) =>
        labelOptions.filter(itemToFilter, this.chart.data),
      );
    }
    if (labelOptions.sort) {
      generatedLabels = generatedLabels.sort((sortFunction, sortOrder) =>
        labelOptions.sort(sortFunction, sortOrder, this.chart.data),
      );
    }
    if (this.options.reverse) {
      generatedLabels.reverse();
    }
    this.legendItems = generatedLabels;
  }
  fit() {
    const {
      options: _________________chartOptions,
      ctx: _______________________________canvasContext,
    } = this;
    if (!_________________chartOptions.display) {
      this.width = this.height = 0;
      return;
    }
    const ___chartLabels = _________________chartOptions.labels;
    const _animationFrame = requestAnimationFrame(___chartLabels.font);
    const animationFrameSize = _animationFrame.size;
    const computedTitleHeight = this._computeTitleHeight();
    const { boxWidth: _boxWidth, itemHeight: _itemHeight } = _chartUpdater(
      ___chartLabels,
      animationFrameSize,
    );
    let computedHeight;
    let calculatedLength;
    _______________________________canvasContext.font = _animationFrame.string;
    if (this.isHorizontal()) {
      computedHeight = this.maxWidth;
      calculatedLength =
        this._fitRows(
          computedTitleHeight,
          animationFrameSize,
          _boxWidth,
          _itemHeight,
        ) + 10;
    } else {
      calculatedLength = this.maxHeight;
      computedHeight =
        this._fitCols(
          computedTitleHeight,
          _animationFrame,
          _boxWidth,
          _itemHeight,
        ) + 10;
    }
    this.width = Math.min(
      computedHeight,
      _________________chartOptions.maxWidth || this.maxWidth,
    );
    this.height = Math.min(
      calculatedLength,
      _________________chartOptions.maxHeight || this.maxHeight,
    );
  }
  _fitRows(
    rowHeight,
    textWidthOffset,
    calculatedTextWidthAdjustment,
    legendItemHeight,
  ) {
    const {
      ctx: drawingContext,
      maxWidth: maxLegendItemWidth,
      options: {
        labels: { padding: __labelPadding },
      },
    } = this;
    const legendHitBoxes = (this.legendHitBoxes = []);
    const lineWidths = (this.lineWidths = [0]);
    const legendItemTotalHeight = legendItemHeight + __labelPadding;
    let currentRowHeight = rowHeight;
    drawingContext.textAlign = "left";
    drawingContext.textBaseline = "middle";
    let rowCount = -1;
    let currentVerticalOffset = -legendItemTotalHeight;
    this.legendItems.forEach((textString, _____________currentIndex) => {
      const calculatedTextWidth =
        calculatedTextWidthAdjustment +
        textWidthOffset / 2 +
        drawingContext.measureText(textString.text).width;
      if (
        _____________currentIndex === 0 ||
        lineWidths[lineWidths.length - 1] +
          calculatedTextWidth +
          __labelPadding * 2 >
          maxLegendItemWidth
      ) {
        currentRowHeight += legendItemTotalHeight;
        lineWidths[
          lineWidths.length - (_____________currentIndex > 0 ? 0 : 1)
        ] = 0;
        currentVerticalOffset += legendItemTotalHeight;
        rowCount++;
      }
      legendHitBoxes[_____________currentIndex] = {
        left: 0,
        top: currentVerticalOffset,
        row: rowCount,
        width: calculatedTextWidth,
        height: legendItemHeight,
      };
      lineWidths[lineWidths.length - 1] += calculatedTextWidth + __labelPadding;
    });
    return currentRowHeight;
  }
  _fitCols(
    remainingHeight,
    currentLegendItem,
    currentColumnWidth,
    currentLegendItemIndex,
  ) {
    const {
      ctx: _____________________________________canvasContext,
      maxHeight: maxLegendHeight,
      options: {
        labels: { padding: ___labelPadding },
      },
    } = this;
    const _legendHitBoxes = (this.legendHitBoxes = []);
    const columnSizes = (this.columnSizes = []);
    const remainingLegendHeight = maxLegendHeight - remainingHeight;
    let totalColumnWidth = ___labelPadding;
    let maxItemWidth = 0;
    let currentColumnHeight = 0;
    let totalHorizontalOffset = 0;
    let columnIndex = 0;
    this.legendItems.forEach((___________currentIndex, itemIndex) => {
      const { itemWidth: itemWidth, itemHeight: itemHeight } =
        calculateItemDimensions(
          currentColumnWidth,
          currentLegendItem,
          _____________________________________canvasContext,
          ___________currentIndex,
          currentLegendItemIndex,
        );
      if (
        itemIndex > 0 &&
        currentColumnHeight + itemHeight + ___labelPadding * 2 >
          remainingLegendHeight
      ) {
        totalColumnWidth += maxItemWidth + ___labelPadding;
        columnSizes.push({
          width: maxItemWidth,
          height: currentColumnHeight,
        });
        totalHorizontalOffset += maxItemWidth + ___labelPadding;
        columnIndex++;
        maxItemWidth = currentColumnHeight = 0;
      }
      _legendHitBoxes[itemIndex] = {
        left: totalHorizontalOffset,
        top: currentColumnHeight,
        col: columnIndex,
        width: itemWidth,
        height: itemHeight,
      };
      maxItemWidth = Math.max(maxItemWidth, itemWidth);
      currentColumnHeight += itemHeight + ___labelPadding;
    });
    totalColumnWidth += maxItemWidth;
    columnSizes.push({
      width: maxItemWidth,
      height: currentColumnHeight,
    });
    return totalColumnWidth;
  }
  adjustHitBoxes() {
    if (!this.options.display) {
      return;
    }
    const titleHeight = this._computeTitleHeight();
    const {
      legendHitBoxes: __legendHitBoxes,
      options: {
        align: ___labelAlignment,
        labels: { padding: ____labelPadding },
        rtl: isRightToLeft,
      },
    } = this;
    const ___________animationManager = __animationManager(
      isRightToLeft,
      this.left,
      this.width,
    );
    if (this.isHorizontal()) {
      let isRtl = 0;
      let _animationPosition = animationQueue(
        ___labelAlignment,
        this.left + ____labelPadding,
        this.right - this.lineWidths[isRtl],
      );
      for (const rowData of __legendHitBoxes) {
        if (isRtl !== rowData.row) {
          isRtl = rowData.row;
          _animationPosition = animationQueue(
            ___labelAlignment,
            this.left + ____labelPadding,
            this.right - this.lineWidths[isRtl],
          );
        }
        rowData.top += this.top + titleHeight + ____labelPadding;
        rowData.left = ___________animationManager.leftForLtr(
          ___________animationManager.x(_animationPosition),
          rowData.width,
        );
        _animationPosition += rowData.width + ____labelPadding;
      }
    } else {
      let _isRtl = 0;
      let animationQueuePosition = animationQueue(
        ___labelAlignment,
        this.top + titleHeight + ____labelPadding,
        this.bottom - this.columnSizes[_isRtl].height,
      );
      for (const row of __legendHitBoxes) {
        if (row.col !== _isRtl) {
          _isRtl = row.col;
          animationQueuePosition = animationQueue(
            ___labelAlignment,
            this.top + titleHeight + ____labelPadding,
            this.bottom - this.columnSizes[_isRtl].height,
          );
        }
        row.top = animationQueuePosition;
        row.left += this.left + ____labelPadding;
        row.left = ___________animationManager.leftForLtr(
          ___________animationManager.x(row.left),
          row.width,
        );
        animationQueuePosition += row.height + ____labelPadding;
      }
    }
  }
  isHorizontal() {
    return (
      this.options.position === "top" || this.options.position === "bottom"
    );
  }
  draw() {
    if (this.options.display) {
      const _______________canvasContext = this.ctx;
      __________animationManager(_______________canvasContext, this);
      this._draw();
      ______chartAnimationQueue(_______________canvasContext);
    }
  }
  _draw() {
    const {
      options: ________optionsConfig,
      columnSizes: columnHeights,
      lineWidths: lineWidthsArray,
      ctx: ______________________________________________canvasContext,
    } = this;
    const { align: ____labelAlignment, labels: labelConfig } =
      ________optionsConfig;
    const animationColorDuration = animationDuration.color;
    const animationManagerConfig = __animationManager(
      ________optionsConfig.rtl,
      this.left,
      this.width,
    );
    const requestAnimationFrameLabel = requestAnimationFrame(labelConfig.font);
    const { padding: ______labelPadding } = labelConfig;
    const currentFrameSize = requestAnimationFrameLabel.size;
    const halfCurrentFrameSize = currentFrameSize / 2;
    let currentTextPosition;
    this.drawTitle();
    ______________________________________________canvasContext.textAlign =
      animationManagerConfig.textAlign("left");
    ______________________________________________canvasContext.textBaseline =
      "middle";
    ______________________________________________canvasContext.lineWidth = 0.5;
    ______________________________________________canvasContext.font =
      requestAnimationFrameLabel.string;
    const {
      boxWidth: ____boxWidth,
      boxHeight: ____boxHeight,
      itemHeight: __itemHeight,
    } = _chartUpdater(labelConfig, currentFrameSize);
    const isDrawingHorizontal = this.isHorizontal();
    const _computedTitleHeight = this._computeTitleHeight();
    if (isDrawingHorizontal) {
      currentTextPosition = {
        x: animationQueue(
          ____labelAlignment,
          this.left + ______labelPadding,
          this.right - lineWidthsArray[0],
        ),
        y: this.top + ______labelPadding + _computedTitleHeight,
        line: 0,
      };
    } else {
      currentTextPosition = {
        x: this.left + ______labelPadding,
        y: animationQueue(
          ____labelAlignment,
          this.top + _computedTitleHeight + ______labelPadding,
          this.bottom - columnHeights[0].height,
        ),
        line: 0,
      };
    }
    chartRequestAnimationFrame(this.ctx, ________optionsConfig.textDirection);
    const itemHeightWithPadding = __itemHeight + ______labelPadding;
    this.legendItems.forEach((fontProperties, verticalOffset) => {
      ______________________________________________canvasContext.strokeStyle =
        fontProperties.fontColor;
      ______________________________________________canvasContext.fillStyle =
        fontProperties.fontColor;
      const textWidth =
        ______________________________________________canvasContext.measureText(
          fontProperties.text,
        ).width;
      const textAlignAdjustment = animationManagerConfig.textAlign(
        (fontProperties.textAlign ||= labelConfig.textAlign),
      );
      const totalTextWidthIncludingPadding =
        ____boxWidth + halfCurrentFrameSize + textWidth;
      let currentXPosition = currentTextPosition.x;
      let positionY = currentTextPosition.y;
      animationManagerConfig.setWidth(this.width);
      if (isDrawingHorizontal) {
        if (
          verticalOffset > 0 &&
          currentXPosition +
            totalTextWidthIncludingPadding +
            ______labelPadding >
            this.right
        ) {
          positionY = currentTextPosition.y += itemHeightWithPadding;
          currentTextPosition.line++;
          currentXPosition = currentTextPosition.x = animationQueue(
            ____labelAlignment,
            this.left + ______labelPadding,
            this.right - lineWidthsArray[currentTextPosition.line],
          );
        }
      } else if (
        verticalOffset > 0 &&
        positionY + itemHeightWithPadding > this.bottom
      ) {
        currentXPosition = currentTextPosition.x =
          currentXPosition +
          columnHeights[currentTextPosition.line].width +
          ______labelPadding;
        currentTextPosition.line++;
        positionY = currentTextPosition.y = animationQueue(
          ____labelAlignment,
          this.top + _computedTitleHeight + ______labelPadding,
          this.bottom - columnHeights[currentTextPosition.line].height,
        );
      }
      (function (xCoordinate, yPosition, chartStyle) {
        if (
          isNaN(____boxWidth) ||
          ____boxWidth <= 0 ||
          isNaN(____boxHeight) ||
          ____boxHeight < 0
        ) {
          return;
        }
        ______________________________________________canvasContext.save();
        const animatedLineWidth = chartAnimationRunning(
          chartStyle.lineWidth,
          1,
        );
        ______________________________________________canvasContext.fillStyle =
          chartAnimationRunning(chartStyle.fillStyle, animationColorDuration);
        ______________________________________________canvasContext.lineCap =
          chartAnimationRunning(chartStyle.lineCap, "butt");
        ______________________________________________canvasContext.lineDashOffset =
          chartAnimationRunning(chartStyle.lineDashOffset, 0);
        ______________________________________________canvasContext.lineJoin =
          chartAnimationRunning(chartStyle.lineJoin, "miter");
        ______________________________________________canvasContext.lineWidth =
          animatedLineWidth;
        ______________________________________________canvasContext.strokeStyle =
          chartAnimationRunning(chartStyle.strokeStyle, animationColorDuration);
        ______________________________________________canvasContext.setLineDash(
          chartAnimationRunning(chartStyle.lineDash, []),
        );
        if (labelConfig.usePointStyle) {
          const pointStyleProps = {
            radius: (____boxHeight * Math.SQRT2) / 2,
            pointStyle: chartStyle.pointStyle,
            rotation: chartStyle.rotation,
            borderWidth: animatedLineWidth,
          };
          const borderRadius = animationManagerConfig.xPlus(
            xCoordinate,
            ____boxWidth / 2,
          );
          __animationDuration(
            ______________________________________________canvasContext,
            pointStyleProps,
            borderRadius,
            yPosition + halfCurrentFrameSize,
            labelConfig.pointStyleWidth && ____boxWidth,
          );
        } else {
          const pointStyles =
            yPosition + Math.max((currentFrameSize - ____boxHeight) / 2, 0);
          const _chartConfig = animationManagerConfig.leftForLtr(
            xCoordinate,
            ____boxWidth,
          );
          const animationPosition = elementBorderRadius(
            chartStyle.borderRadius,
          );
          ______________________________________________canvasContext.beginPath();
          if (
            Object.values(animationPosition).some(
              (isNonZero) => isNonZero !== 0,
            )
          ) {
            ___animationController(
              ______________________________________________canvasContext,
              {
                x: _chartConfig,
                y: pointStyles,
                w: ____boxWidth,
                h: ____boxHeight,
                radius: animationPosition,
              },
            );
          } else {
            ______________________________________________canvasContext.rect(
              _chartConfig,
              pointStyles,
              ____boxWidth,
              ____boxHeight,
            );
          }
          ______________________________________________canvasContext.fill();
          if (animatedLineWidth !== 0) {
            ______________________________________________canvasContext.stroke();
          }
        }
        ______________________________________________canvasContext.restore();
      })(animationManagerConfig.x(currentXPosition), positionY, fontProperties);
      currentXPosition = framerate(
        textAlignAdjustment,
        currentXPosition + ____boxWidth + halfCurrentFrameSize,
        isDrawingHorizontal
          ? currentXPosition + totalTextWidthIncludingPadding
          : this.right,
        ________optionsConfig.rtl,
      );
      (function (__textValue, textVerticalOffset, textIndex) {
        ___lastDateUpdated(
          ______________________________________________canvasContext,
          textIndex.text,
          __textValue,
          textVerticalOffset + __itemHeight / 2,
          requestAnimationFrameLabel,
          {
            strikethrough: textIndex.hidden,
            textAlign: animationManagerConfig.textAlign(textIndex.textAlign),
          },
        );
      })(animationManagerConfig.x(currentXPosition), positionY, fontProperties);
      if (isDrawingHorizontal) {
        currentTextPosition.x +=
          totalTextWidthIncludingPadding + ______labelPadding;
      } else if (typeof fontProperties.text != "string") {
        const _animationContext = requestAnimationFrameLabel.lineHeight;
        currentTextPosition.y +=
          textLengthMultiplier(fontProperties, _animationContext) +
          ______labelPadding;
      } else {
        currentTextPosition.y += itemHeightWithPadding;
      }
    });
    chartAnimationController(this.ctx, ________optionsConfig.textDirection);
  }
  drawTitle() {
    const ____titleOptions = this.options;
    const _____titleOptions = ____titleOptions.title;
    const __animationFrameRequest = requestAnimationFrame(
      _____titleOptions.font,
    );
    const animationElementPadding = __animationElement(
      _____titleOptions.padding,
    );
    if (!_____titleOptions.display) {
      return;
    }
    const textAlignOptions = __animationManager(
      ____titleOptions.rtl,
      this.left,
      this.width,
    );
    const ______________________________________canvasContext = this.ctx;
    const __titlePosition = _____titleOptions.position;
    const animationFrameRequestHalfSize = __animationFrameRequest.size / 2;
    const totalTitleHeight =
      animationElementPadding.top + animationFrameRequestHalfSize;
    let titleVerticalPosition;
    let _leftPosition = this.left;
    let titleWidth = this.width;
    if (this.isHorizontal()) {
      titleWidth = Math.max(...this.lineWidths);
      titleVerticalPosition = this.top + totalTitleHeight;
      _leftPosition = animationQueue(
        ____titleOptions.align,
        _leftPosition,
        this.right - titleWidth,
      );
    } else {
      const titleOptions = this.columnSizes.reduce(
        (currentHeight, elementHeight) =>
          Math.max(currentHeight, elementHeight.height),
        0,
      );
      titleVerticalPosition =
        totalTitleHeight +
        animationQueue(
          ____titleOptions.align,
          this.top,
          this.bottom -
            titleOptions -
            ____titleOptions.labels.padding -
            this._computeTitleHeight(),
        );
    }
    const titlePositionAdjusted = animationQueue(
      __titlePosition,
      _leftPosition,
      _leftPosition + titleWidth,
    );
    ______________________________________canvasContext.textAlign =
      textAlignOptions.textAlign(animationTarget(__titlePosition));
    ______________________________________canvasContext.textBaseline = "middle";
    ______________________________________canvasContext.strokeStyle =
      _____titleOptions.color;
    ______________________________________canvasContext.fillStyle =
      _____titleOptions.color;
    ______________________________________canvasContext.font =
      __animationFrameRequest.string;
    ___lastDateUpdated(
      ______________________________________canvasContext,
      _____titleOptions.text,
      titlePositionAdjusted,
      titleVerticalPosition,
      __animationFrameRequest,
    );
  }
  _computeTitleHeight() {
    const _titleOptions = this.options.title;
    const fontAnimationFrame = requestAnimationFrame(_titleOptions.font);
    const animationElementHeight = __animationElement(_titleOptions.padding);
    if (_titleOptions.display) {
      return fontAnimationFrame.lineHeight + animationElementHeight.height;
    } else {
      return 0;
    }
  }
  _getLegendItemAt(mouseX, mouseY) {
    let legendItemIndex;
    let legendHitBox;
    let legendHitBoxesArray;
    if (
      animationRequestId(mouseX, this.left, this.right) &&
      animationRequestId(mouseY, this.top, this.bottom)
    ) {
      legendHitBoxesArray = this.legendHitBoxes;
      legendItemIndex = 0;
      for (; legendItemIndex < legendHitBoxesArray.length; ++legendItemIndex) {
        legendHitBox = legendHitBoxesArray[legendItemIndex];
        if (
          animationRequestId(
            mouseX,
            legendHitBox.left,
            legendHitBox.left + legendHitBox.width,
          ) &&
          animationRequestId(
            mouseY,
            legendHitBox.top,
            legendHitBox.top + legendHitBox.height,
          )
        ) {
          return this.legendItems[legendItemIndex];
        }
      }
    }
    return null;
  }
  handleEvent(_______eventData) {
    const ___eventOptions = this.options;
    if (!eventHandler(_______eventData.type, ___eventOptions)) {
      return;
    }
    const legendItem = this._getLegendItemAt(
      _______eventData.x,
      _______eventData.y,
    );
    if (
      _______eventData.type === "mousemove" ||
      _______eventData.type === "mouseout"
    ) {
      const hoveredItem = this._hoveredItem;
      const isAnimationInProgress = _______animationController(
        hoveredItem,
        legendItem,
      );
      if (hoveredItem && !isAnimationInProgress) {
        ________animationContext(
          ___eventOptions.onLeave,
          [_______eventData, hoveredItem, this],
          this,
        );
      }
      this._hoveredItem = legendItem;
      if (legendItem && !isAnimationInProgress) {
        ________animationContext(
          ___eventOptions.onHover,
          [_______eventData, legendItem, this],
          this,
        );
      }
    } else if (legendItem) {
      ________animationContext(
        ___eventOptions.onClick,
        [_______eventData, legendItem, this],
        this,
      );
    }
  }
}
function calculateItemDimensions(
  __textWidth,
  textWidthParameter,
  maxTextWidth,
  _textMeasurement,
  lineHeightValue,
) {
  return {
    itemWidth: getMaxTextWidth(
      _textMeasurement,
      __textWidth,
      textWidthParameter,
      maxTextWidth,
    ),
    itemHeight: elementText(
      lineHeightValue,
      _textMeasurement,
      textWidthParameter.lineHeight,
    ),
  };
}
function getMaxTextWidth(
  _textValue,
  _textWidth,
  textArraySize,
  textMeasurement,
) {
  let longestTextValue = _textValue.text;
  if (longestTextValue && typeof longestTextValue != "string") {
    longestTextValue = longestTextValue.reduce((longerString, _longerString) =>
      longerString.length > _longerString.length ? longerString : _longerString,
    );
  }
  return (
    _textWidth +
    textArraySize.size / 2 +
    textMeasurement.measureText(longestTextValue).width
  );
}
function elementText(inputText, _______element, callbackIndex) {
  let outputText = inputText;
  if (typeof _______element.text != "string") {
    outputText = textLengthMultiplier(_______element, callbackIndex);
  }
  return outputText;
}
function textLengthMultiplier(textElement, _textLengthMultiplier) {
  return (
    _textLengthMultiplier * (textElement.text ? textElement.text.length : 0)
  );
}
function eventHandler(eventType, eventConfig) {
  return (
    ((eventType === "mousemove" || eventType === "mouseout") &&
      (!!eventConfig.onHover || !!eventConfig.onLeave)) ||
    (!!eventConfig.onClick &&
      (eventType === "click" || eventType === "mouseup"))
  );
}
var _______animationState = {
  id: "legend",
  _element: ChartLegendController,
  start(_______________chartInstance, ______event, optionsConfig) {
    const legendInstance = (_______________chartInstance.legend =
      new ChartLegendController({
        ctx: _______________chartInstance.ctx,
        options: optionsConfig,
        chart: _______________chartInstance,
      }));
    ___________animationIndex.configure(
      _______________chartInstance,
      legendInstance,
      optionsConfig,
    );
    ___________animationIndex.addBox(
      _______________chartInstance,
      legendInstance,
    );
  },
  stop(boxToStop) {
    ___________animationIndex.removeBox(boxToStop, boxToStop.legend);
    delete boxToStop.legend;
  },
  beforeUpdate(
    __________________________chartData,
    updatedOptions,
    updateOptionIndex,
  ) {
    const legendData = __________________________chartData.legend;
    ___________animationIndex.configure(
      __________________________chartData,
      legendData,
      updateOptionIndex,
    );
    legendData.options = updateOptionIndex;
  },
  afterUpdate(___________________________chartData) {
    const _legendInstance = ___________________________chartData.legend;
    _legendInstance.buildLabels();
    _legendInstance.adjustHitBoxes();
  },
  afterEvent(eventContext, _eventDetails) {
    if (!_eventDetails.replay) {
      eventContext.legend.handleEvent(_eventDetails.event);
    }
  },
  defaults: {
    display: true,
    position: "top",
    align: "center",
    fullSize: true,
    reverse: false,
    weight: 1000,
    onClick(__event, ___event, ___________chartInstance) {
      const _______________datasetIndex = ___event.datasetIndex;
      const ____________chartInstance = ___________chartInstance.chart;
      if (
        ____________chartInstance.isDatasetVisible(_______________datasetIndex)
      ) {
        ____________chartInstance.hide(_______________datasetIndex);
        ___event.hidden = true;
      } else {
        ____________chartInstance.show(_______________datasetIndex);
        ___event.hidden = false;
      }
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (________chartOptions) => ________chartOptions.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(___chartData) {
        const datasets = ___chartData.data.datasets;
        const {
          labels: {
            usePointStyle: usePointStyle,
            pointStyle: pointStyle,
            textAlign: textAlignment,
            color: fontColor,
            useBorderRadius: useBorderRadius,
            borderRadius: borderRadiusOption,
          },
        } = ___chartData.legend.options;
        return ___chartData._getSortedDatasetMetas().map((datasetContext) => {
          const styleProperties = datasetContext.controller.getStyle(
            usePointStyle ? 0 : undefined,
          );
          const borderWidthDimensions = __animationElement(
            styleProperties.borderWidth,
          );
          return {
            text: datasets[datasetContext.index].label,
            fillStyle: styleProperties.backgroundColor,
            fontColor: fontColor,
            hidden: !datasetContext.visible,
            lineCap: styleProperties.borderCapStyle,
            lineDash: styleProperties.borderDash,
            lineDashOffset: styleProperties.borderDashOffset,
            lineJoin: styleProperties.borderJoinStyle,
            lineWidth:
              (borderWidthDimensions.width + borderWidthDimensions.height) / 4,
            strokeStyle: styleProperties.borderColor,
            pointStyle: pointStyle || styleProperties.pointStyle,
            rotation: styleProperties.rotation,
            textAlign: textAlignment || styleProperties.textAlign,
            borderRadius:
              useBorderRadius &&
              (borderRadiusOption || styleProperties.borderRadius),
            datasetIndex: datasetContext.index,
          };
        }, this);
      },
    },
    title: {
      color: (chartOptionsColor) => chartOptionsColor.chart.options.color,
      display: false,
      position: "center",
      text: "",
    },
  },
  descriptors: {
    _scriptable: (isNotEventPrefix) => !isNotEventPrefix.startsWith("on"),
    labels: {
      _scriptable: (_actionType) =>
        !["generateLabels", "filter", "sort"].includes(_actionType),
    },
  },
};
class _____AnimationController extends _AnimationController {
  constructor(___________chartConfig) {
    super();
    this.chart = ___________chartConfig.chart;
    this.options = ___________chartConfig.options;
    this.ctx = ___________chartConfig.ctx;
    this._padding = undefined;
    this.top = undefined;
    this.bottom = undefined;
    this.left = undefined;
    this.right = undefined;
    this.width = undefined;
    this.height = undefined;
    this.position = undefined;
    this.weight = undefined;
    this.fullSize = undefined;
  }
  update(newWidth, _heightValue) {
    const ____________________options = this.options;
    this.left = 0;
    this.top = 0;
    if (!____________________options.display) {
      this.width = this.height = this.right = this.bottom = 0;
      return;
    }
    this.width = this.right = newWidth;
    this.height = this.bottom = _heightValue;
    const textItemCount = animatedChartItems(____________________options.text)
      ? ____________________options.text.length
      : 1;
    this._padding = __animationElement(____________________options.padding);
    const calculatedHeight =
      textItemCount *
        requestAnimationFrame(____________________options.font).lineHeight +
      this._padding.height;
    if (this.isHorizontal()) {
      this.height = calculatedHeight;
    } else {
      this.width = calculatedHeight;
    }
  }
  isHorizontal() {
    const positionOption = this.options.position;
    return positionOption === "top" || positionOption === "bottom";
  }
  _drawArgs(______offsetValue) {
    const {
      top: bottomEdge,
      left: leftPosition,
      bottom: bottomEdgePosition,
      right: _rightEdge,
      options: ______________________options,
    } = this;
    const alignmentOption = ______________________options.align;
    let maxWidthDifference;
    let titleXPosition;
    let __titleYPosition;
    let rotationAdjustment = 0;
    if (this.isHorizontal()) {
      titleXPosition = animationQueue(
        alignmentOption,
        leftPosition,
        _rightEdge,
      );
      __titleYPosition = bottomEdge + ______offsetValue;
      maxWidthDifference = _rightEdge - leftPosition;
    } else {
      if (______________________options.position === "left") {
        titleXPosition = leftPosition + ______offsetValue;
        __titleYPosition = animationQueue(
          alignmentOption,
          bottomEdgePosition,
          bottomEdge,
        );
        rotationAdjustment = notificationListener * -0.5;
      } else {
        titleXPosition = _rightEdge - ______offsetValue;
        __titleYPosition = animationQueue(
          alignmentOption,
          bottomEdge,
          bottomEdgePosition,
        );
        rotationAdjustment = notificationListener * 0.5;
      }
      maxWidthDifference = bottomEdgePosition - bottomEdge;
    }
    return {
      titleX: titleXPosition,
      titleY: __titleYPosition,
      maxWidth: maxWidthDifference,
      rotation: rotationAdjustment,
    };
  }
  draw() {
    const _________________________canvasContext = this.ctx;
    const __________________options = this.options;
    if (!__________________options.display) {
      return;
    }
    const ________animationFrameId = requestAnimationFrame(
      __________________options.font,
    );
    const lineHeightOffset =
      ________animationFrameId.lineHeight / 2 + this._padding.top;
    const {
      titleX: titlePositionX,
      titleY: _titleYPosition,
      maxWidth: _maxTextWidth,
      rotation: textRotation,
    } = this._drawArgs(lineHeightOffset);
    ___lastDateUpdated(
      _________________________canvasContext,
      __________________options.text,
      0,
      0,
      ________animationFrameId,
      {
        color: __________________options.color,
        maxWidth: _maxTextWidth,
        rotation: textRotation,
        textAlign: animationTarget(__________________options.align),
        textBaseline: "middle",
        translation: [titlePositionX, _titleYPosition],
      },
    );
  }
}
function createChartInstance(chartContext, ____options) {
  const ___________________chartInstance = new _____AnimationController({
    ctx: chartContext.ctx,
    options: ____options,
    chart: chartContext,
  });
  ___________animationIndex.configure(
    chartContext,
    ___________________chartInstance,
    ____options,
  );
  ___________animationIndex.addBox(
    chartContext,
    ___________________chartInstance,
  );
  chartContext.titleBlock = ___________________chartInstance;
}
var ______________animationController = {
  id: "title",
  _element: _____AnimationController,
  start(
    startTime,
    ____________event,
    _____________________________________________________index,
  ) {
    createChartInstance(
      startTime,
      _____________________________________________________index,
    );
  },
  stop(_titleBlockData) {
    const titleBlockReference = _titleBlockData.titleBlock;
    ___________animationIndex.removeBox(_titleBlockData, titleBlockReference);
    delete _titleBlockData.titleBlock;
  },
  beforeUpdate(titleBlockData, optionsUpdate, updateOptionsIndex) {
    const titleBlock = titleBlockData.titleBlock;
    ___________animationIndex.configure(
      titleBlockData,
      titleBlock,
      updateOptionsIndex,
    );
    titleBlock.options = updateOptionsIndex;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "bold",
    },
    fullSize: true,
    padding: 10,
    position: "top",
    text: "",
    weight: 2000,
  },
  defaultRoutes: {
    color: "color",
  },
  descriptors: {
    _scriptable: true,
    _indexable: false,
  },
};
const chartManager = new WeakMap();
var _____chartAnimationQueue = {
  id: "subtitle",
  start(_____________chartInstance, _eventObject, ___options) {
    const ______________chartInstance = new _____AnimationController({
      ctx: _____________chartInstance.ctx,
      options: ___options,
      chart: _____________chartInstance,
    });
    ___________animationIndex.configure(
      _____________chartInstance,
      ______________chartInstance,
      ___options,
    );
    ___________animationIndex.addBox(
      _____________chartInstance,
      ______________chartInstance,
    );
    chartManager.set(_____________chartInstance, ______________chartInstance);
  },
  stop(boxId) {
    ___________animationIndex.removeBox(boxId, chartManager.get(boxId));
    chartManager.delete(boxId);
  },
  beforeUpdate(chartId, updatedChartOptions, updateOptions) {
    const _________________chartInstance = chartManager.get(chartId);
    ___________animationIndex.configure(
      chartId,
      _________________chartInstance,
      updateOptions,
    );
    _________________chartInstance.options = updateOptions;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "normal",
    },
    fullSize: true,
    padding: 0,
    position: "top",
    text: "",
    weight: 1500,
  },
  defaultRoutes: {
    color: "color",
  },
  descriptors: {
    _scriptable: true,
    _indexable: false,
  },
};
const _____________animationController = {
  average(__elementsArray) {
    if (!__elementsArray.length) {
      return false;
    }
    let ___________index;
    let elementCount;
    let sumTooltipPositionX = 0;
    let totalTooltipY = 0;
    let validElementCount = 0;
    ___________index = 0;
    elementCount = __elementsArray.length;
    for (; ___________index < elementCount; ++___________index) {
      const ____currentElement = __elementsArray[___________index].element;
      if (____currentElement && ____currentElement.hasValue()) {
        const ___tooltipPosition = ____currentElement.tooltipPosition();
        sumTooltipPositionX += ___tooltipPosition.x;
        totalTooltipY += ___tooltipPosition.y;
        ++validElementCount;
      }
    }
    return {
      x: sumTooltipPositionX / validElementCount,
      y: totalTooltipY / validElementCount,
    };
  },
  nearest(elementsArray, currentPoint) {
    if (!elementsArray.length) {
      return false;
    }
    let _______index;
    let arrayLength;
    let nearestElement;
    let tooltipX = currentPoint.x;
    let __yCoordinate = currentPoint.y;
    let closestDistance = Number.POSITIVE_INFINITY;
    _______index = 0;
    arrayLength = elementsArray.length;
    for (; _______index < arrayLength; ++_______index) {
      const ___currentElement = elementsArray[_______index].element;
      if (___currentElement && ___currentElement.hasValue()) {
        const centerPoint = ___currentElement.getCenterPoint();
        const animationDurationToClosestElement = ___animationDuration(
          currentPoint,
          centerPoint,
        );
        if (animationDurationToClosestElement < closestDistance) {
          closestDistance = animationDurationToClosestElement;
          nearestElement = ___currentElement;
        }
      }
    }
    if (nearestElement) {
      const _elementsArray = nearestElement.tooltipPosition();
      tooltipX = _elementsArray.x;
      __yCoordinate = _elementsArray.y;
    }
    return {
      x: tooltipX,
      y: __yCoordinate,
    };
  },
};
function updateTargetArray(targetArray, _chartItem) {
  if (_chartItem) {
    if (animatedChartItems(_chartItem)) {
      Array.prototype.push.apply(targetArray, _chartItem);
    } else {
      targetArray.push(_chartItem);
    }
  }
  return targetArray;
}
function splitStringByLine(_inputString) {
  if (
    (typeof _inputString == "string" || _inputString instanceof String) &&
    _inputString.indexOf("\n") > -1
  ) {
    return _inputString.split("\n");
  } else {
    return _inputString;
  }
}
function getChartDetails(_____chartInstance, ____datasetMeta) {
  const {
    element: ______elementIndex,
    datasetIndex: _________________________________datasetIndex,
    index: ___________dataIndex,
  } = ____datasetMeta;
  const controllerInstance = _____chartInstance.getDatasetMeta(
    _________________________________datasetIndex,
  ).controller;
  const { label: __label, value: _formattedValue } =
    controllerInstance.getLabelAndValue(___________dataIndex);
  return {
    chart: _____chartInstance,
    label: __label,
    parsed: controllerInstance.getParsed(___________dataIndex),
    raw: _____chartInstance.data.datasets[
      _________________________________datasetIndex
    ].data[___________dataIndex],
    formattedValue: _formattedValue,
    dataset: controllerInstance.getDataset(),
    dataIndex: ___________dataIndex,
    datasetIndex: _________________________________datasetIndex,
    element: ______elementIndex,
  };
}
function calculateTooltipDimensions(_chartData, _tooltipOptions) {
  const _canvasRenderingContext = _chartData.chart.ctx;
  const {
    body: tooltipBody,
    footer: footerLines,
    title: tooltipTitle,
  } = _chartData;
  const { boxWidth: tooltipBoxWidth, boxHeight: _boxHeight } = _tooltipOptions;
  const tooltipBodyFontMetrics = requestAnimationFrame(
    _tooltipOptions.bodyFont,
  );
  const titleFontMetrics = requestAnimationFrame(_tooltipOptions.titleFont);
  const footerFont = requestAnimationFrame(_tooltipOptions.footerFont);
  const titleCount = tooltipTitle.length;
  const footerItemCount = footerLines.length;
  const tooltipBodyCount = tooltipBody.length;
  const tooltipPadding = __animationElement(_tooltipOptions.padding);
  let tooltipHeight = tooltipPadding.height;
  let maxTooltipWidth = 0;
  let totalTextLength = tooltipBody.reduce(
    (totalLengthIncludingBeforeAndAfter, ____elementData) =>
      totalLengthIncludingBeforeAndAfter +
      ____elementData.before.length +
      ____elementData.lines.length +
      ____elementData.after.length,
    0,
  );
  totalTextLength += _chartData.beforeBody.length + _chartData.afterBody.length;
  if (titleCount) {
    tooltipHeight +=
      titleCount * titleFontMetrics.lineHeight +
      (titleCount - 1) * _tooltipOptions.titleSpacing +
      _tooltipOptions.titleMarginBottom;
  }
  if (totalTextLength) {
    tooltipHeight +=
      tooltipBodyCount *
        (_tooltipOptions.displayColors
          ? Math.max(_boxHeight, tooltipBodyFontMetrics.lineHeight)
          : tooltipBodyFontMetrics.lineHeight) +
      (totalTextLength - tooltipBodyCount) * tooltipBodyFontMetrics.lineHeight +
      (totalTextLength - 1) * _tooltipOptions.bodySpacing;
  }
  if (footerItemCount) {
    tooltipHeight +=
      _tooltipOptions.footerMarginTop +
      footerItemCount * footerFont.lineHeight +
      (footerItemCount - 1) * _tooltipOptions.footerSpacing;
  }
  let _tooltipPadding = 0;
  const measureTextWidth = function (text) {
    maxTooltipWidth = Math.max(
      maxTooltipWidth,
      _canvasRenderingContext.measureText(text).width + _tooltipPadding,
    );
  };
  _canvasRenderingContext.save();
  _canvasRenderingContext.font = titleFontMetrics.string;
  __lastDateUpdated(_chartData.title, measureTextWidth);
  _canvasRenderingContext.font = tooltipBodyFontMetrics.string;
  __lastDateUpdated(
    _chartData.beforeBody.concat(_chartData.afterBody),
    measureTextWidth,
  );
  if (_tooltipOptions.displayColors) {
    _tooltipPadding = tooltipBoxWidth + 2 + _tooltipOptions.boxPadding;
  } else {
    _tooltipPadding = 0;
  }
  __lastDateUpdated(tooltipBody, (dateUpdateEvent) => {
    __lastDateUpdated(dateUpdateEvent.before, measureTextWidth);
    __lastDateUpdated(dateUpdateEvent.lines, measureTextWidth);
    __lastDateUpdated(dateUpdateEvent.after, measureTextWidth);
  });
  _tooltipPadding = 0;
  _canvasRenderingContext.font = footerFont.string;
  __lastDateUpdated(_chartData.footer, measureTextWidth);
  _canvasRenderingContext.restore();
  maxTooltipWidth += tooltipPadding.width;
  return {
    width: maxTooltipWidth,
    height: tooltipHeight,
  };
}
function getVerticalPosition(container, ____boundingBox) {
  const { y: verticalPositionY, height: boundingBoxHeight } = ____boundingBox;
  if (verticalPositionY < boundingBoxHeight / 2) {
    return "top";
  } else if (verticalPositionY > container.height - boundingBoxHeight / 2) {
    return "bottom";
  } else {
    return "center";
  }
}
function isInputOverflowing(
  alignmentDirection,
  availableSpaceWidth,
  ___inputValue,
  selectionBounds,
) {
  const { x: selectionPositionX, width: selectionWidth } = selectionBounds;
  const totalCaretSpace = ___inputValue.caretSize + ___inputValue.caretPadding;
  return (
    (alignmentDirection === "left" &&
      selectionPositionX + selectionWidth + totalCaretSpace >
        availableSpaceWidth.width) ||
    (alignmentDirection === "right" &&
      selectionPositionX - selectionWidth - totalCaretSpace < 0) ||
    undefined
  );
}
function determinePositionAlignment(
  ___chartDimensions,
  ___________chartData,
  ____chartDimensions,
  positionAlignment,
) {
  const { x: chartXPosition, width: __chartWidth } = ____chartDimensions;
  const {
    width: ___chartWidth,
    chartArea: { left: chartAreaLeft, right: chartAreaRight },
  } = ___chartDimensions;
  let _positionAlignment = "center";
  if (positionAlignment === "center") {
    if (chartXPosition <= (chartAreaLeft + chartAreaRight) / 2) {
      _positionAlignment = "left";
    } else {
      _positionAlignment = "right";
    }
  } else if (chartXPosition <= __chartWidth / 2) {
    _positionAlignment = "left";
  } else if (chartXPosition >= ___chartWidth - __chartWidth / 2) {
    _positionAlignment = "right";
  }
  if (
    isInputOverflowing(
      _positionAlignment,
      ___chartDimensions,
      ___________chartData,
      ____chartDimensions,
    )
  ) {
    _positionAlignment = "center";
  }
  return _positionAlignment;
}
function alignElements(alignmentSettings, elementAlignment, alignmentOptions) {
  const yAlignmentValue =
    alignmentOptions.yAlign ||
    elementAlignment.yAlign ||
    getVerticalPosition(alignmentSettings, alignmentOptions);
  return {
    xAlign:
      alignmentOptions.xAlign ||
      elementAlignment.xAlign ||
      determinePositionAlignment(
        alignmentSettings,
        elementAlignment,
        alignmentOptions,
        yAlignmentValue,
      ),
    yAlign: yAlignmentValue,
  };
}
function calculateAdjustedX(______boundingBox, _alignment) {
  let { x: adjustedX, width: boundingBoxWidth } = ______boundingBox;
  if (_alignment === "right") {
    adjustedX -= boundingBoxWidth;
  } else if (_alignment === "center") {
    adjustedX -= boundingBoxWidth / 2;
  }
  return adjustedX;
}
function calculatePositionY(
  positionAttributes,
  positionAdjustment,
  _offsetValue,
) {
  let { y: ___yCoordinate, height: _height } = positionAttributes;
  if (positionAdjustment === "top") {
    ___yCoordinate += _offsetValue;
  } else {
    if (positionAdjustment === "bottom") {
      ___yCoordinate -= _height + _offsetValue;
    } else {
      ___yCoordinate -= _height / 2;
    }
  }
  return ___yCoordinate;
}
function calculateTooltipPosition(
  __tooltipOptions,
  elementWidth,
  alignmentConfig,
  boundingBox,
) {
  const {
    caretSize: caretSize,
    caretPadding: caretPadding,
    cornerRadius: cornerRadius,
  } = __tooltipOptions;
  const { xAlign: xAlignment, yAlign: verticalAlignment } = alignmentConfig;
  const totalCaretOffset = caretSize + caretPadding;
  const {
    topLeft: topLeftBorderRadius,
    topRight: bottomRightBorderRadius,
    bottomLeft: bottomLeftBorderRadius,
    bottomRight: _bottomRightBorderRadius,
  } = elementBorderRadius(cornerRadius);
  let adjustedXPosition = calculateAdjustedX(elementWidth, xAlignment);
  const calculatedPositionY = calculatePositionY(
    elementWidth,
    verticalAlignment,
    totalCaretOffset,
  );
  if (verticalAlignment === "center") {
    if (xAlignment === "left") {
      adjustedXPosition += totalCaretOffset;
    } else if (xAlignment === "right") {
      adjustedXPosition -= totalCaretOffset;
    }
  } else if (xAlignment === "left") {
    adjustedXPosition -=
      Math.max(topLeftBorderRadius, bottomLeftBorderRadius) + caretSize;
  } else if (xAlignment === "right") {
    adjustedXPosition +=
      Math.max(bottomRightBorderRadius, _bottomRightBorderRadius) + caretSize;
  }
  return {
    x: chartAnimationState(
      adjustedXPosition,
      0,
      boundingBox.width - elementWidth.width,
    ),
    y: chartAnimationState(
      calculatedPositionY,
      0,
      boundingBox.height - elementWidth.height,
    ),
  };
}
function calculateAlignmentOffset(rectangle, alignment, paddingValue) {
  const paddingAnimationValue = __animationElement(paddingValue.padding);
  if (alignment === "center") {
    return rectangle.x + rectangle.width / 2;
  } else if (alignment === "right") {
    return rectangle.x + rectangle.width - paddingAnimationValue.right;
  } else {
    return rectangle.x + paddingAnimationValue.left;
  }
}
function processInputText(_inputText) {
  return updateTargetArray([], splitStringByLine(_inputText));
}
function tooltipHandlerFunction(_tooltipElement, tooltipContent, tooltipItems) {
  return tooltipHandler(_tooltipElement, {
    tooltip: tooltipContent,
    tooltipItems: tooltipItems,
    type: "tooltip",
  });
}
function getTooltipWithCallbacks(_tooltipHandler, tooltipCallbacks) {
  const tooltipCallbacksArray =
    tooltipCallbacks &&
    tooltipCallbacks.dataset &&
    tooltipCallbacks.dataset.tooltip &&
    tooltipCallbacks.dataset.tooltip.callbacks;
  if (tooltipCallbacksArray) {
    return _tooltipHandler.override(tooltipCallbacksArray);
  } else {
    return _tooltipHandler;
  }
}
const chartUpdateState = {
  beforeTitle: width,
  title(titleArray) {
    if (titleArray.length > 0) {
      const firstTitleElement = titleArray[0];
      const chartLabels = firstTitleElement.chart.data.labels;
      const labelCount = chartLabels ? chartLabels.length : 0;
      if (this && this.options && this.options.mode === "dataset") {
        return firstTitleElement.dataset.label || "";
      }
      if (firstTitleElement.label) {
        return firstTitleElement.label;
      }
      if (labelCount > 0 && firstTitleElement.dataIndex < labelCount) {
        return chartLabels[firstTitleElement.dataIndex];
      }
    }
    return "";
  },
  afterTitle: width,
  beforeBody: width,
  beforeLabel: width,
  label(____dataPoint) {
    if (this && this.options && this.options.mode === "dataset") {
      return (
        ____dataPoint.label + ": " + ____dataPoint.formattedValue ||
        ____dataPoint.formattedValue
      );
    }
    let dataLabel = ____dataPoint.dataset.label || "";
    if (dataLabel) {
      dataLabel += ": ";
    }
    const formattedValue = ____dataPoint.formattedValue;
    if (!chartUpdateInterval(formattedValue)) {
      dataLabel += formattedValue;
    }
    return dataLabel;
  },
  labelColor(_____________chartData) {
    const datasetStyle = _____________chartData.chart
      .getDatasetMeta(_____________chartData.datasetIndex)
      .controller.getStyle(_____________chartData.dataIndex);
    return {
      borderColor: datasetStyle.borderColor,
      backgroundColor: datasetStyle.backgroundColor,
      borderWidth: datasetStyle.borderWidth,
      borderDash: datasetStyle.borderDash,
      borderDashOffset: datasetStyle.borderDashOffset,
      borderRadius: 0,
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(labelPointStyleContext) {
    const ___pointStyle = labelPointStyleContext.chart
      .getDatasetMeta(labelPointStyleContext.datasetIndex)
      .controller.getStyle(labelPointStyleContext.dataIndex);
    return {
      pointStyle: ___pointStyle.pointStyle,
      rotation: ___pointStyle.rotation,
    };
  },
  afterLabel: width,
  afterBody: width,
  beforeFooter: width,
  footer: width,
  afterFooter: width,
};
function invokePropertyMethod(
  __target,
  propertyName,
  contextualObject,
  callArgument,
) {
  const propertyMethodResult = __target[propertyName].call(
    contextualObject,
    callArgument,
  );
  if (propertyMethodResult === undefined) {
    return chartUpdateState[propertyName].call(contextualObject, callArgument);
  } else {
    return propertyMethodResult;
  }
}
class TooltipAnimationController extends _AnimationController {
  static positioners = _____________animationController;
  constructor(______________chartConfig) {
    super();
    this.opacity = 0;
    this._active = [];
    this._eventPosition = undefined;
    this._size = undefined;
    this._cachedAnimations = undefined;
    this._tooltipItems = [];
    this.$animations = undefined;
    this.$context = undefined;
    this.chart = ______________chartConfig.chart;
    this.options = ______________chartConfig.options;
    this.dataPoints = undefined;
    this.title = undefined;
    this.beforeBody = undefined;
    this.body = undefined;
    this.afterBody = undefined;
    this.footer = undefined;
    this.xAlign = undefined;
    this.yAlign = undefined;
    this.x = undefined;
    this.y = undefined;
    this.height = undefined;
    this.width = undefined;
    this.caretX = undefined;
    this.caretY = undefined;
    this.labelColors = undefined;
    this.labelPointStyles = undefined;
    this.labelTextColors = undefined;
  }
  initialize(________options) {
    this.options = ________options;
    this._cachedAnimations = undefined;
    this.$context = undefined;
  }
  _resolveAnimations() {
    const cachedAnimations = this._cachedAnimations;
    if (cachedAnimations) {
      return cachedAnimations;
    }
    const ________________________chartInstance = this.chart;
    const contextOptions = this.options.setContext(this.getContext());
    const _isAnimationEnabled =
      contextOptions.enabled &&
      ________________________chartInstance.options.animation &&
      contextOptions.animations;
    const _animationResolver = new ____AnimationController(
      this.chart,
      _isAnimationEnabled,
    );
    if (_isAnimationEnabled._cacheable) {
      this._cachedAnimations = Object.freeze(_animationResolver);
    }
    return _animationResolver;
  }
  getContext() {
    return (this.$context ||= tooltipHandlerFunction(
      this.chart.getContext(),
      this,
      this._tooltipItems,
    ));
  }
  getTitle(______targetObject, __titleOptions) {
    const { callbacks: _eventCallbacks } = __titleOptions;
    const beforeTitle = invokePropertyMethod(
      _eventCallbacks,
      "beforeTitle",
      this,
      ______targetObject,
    );
    const title = invokePropertyMethod(
      _eventCallbacks,
      "title",
      this,
      ______targetObject,
    );
    const afterTitle = invokePropertyMethod(
      _eventCallbacks,
      "afterTitle",
      this,
      ______targetObject,
    );
    let titleLinesArray = [];
    titleLinesArray = updateTargetArray(
      titleLinesArray,
      splitStringByLine(beforeTitle),
    );
    titleLinesArray = updateTargetArray(
      titleLinesArray,
      splitStringByLine(title),
    );
    titleLinesArray = updateTargetArray(
      titleLinesArray,
      splitStringByLine(afterTitle),
    );
    return titleLinesArray;
  }
  getBeforeBody(__inputText, eventCallbacks) {
    return processInputText(
      invokePropertyMethod(
        eventCallbacks.callbacks,
        "beforeBody",
        this,
        __inputText,
      ),
    );
  }
  getBody(_lastUpdatedDate, _____________inputData) {
    const { callbacks: callbacks } = _____________inputData;
    const labelSectionsArray = [];
    __lastDateUpdated(_lastUpdatedDate, (_____inputData) => {
      const labelSections = {
        before: [],
        lines: [],
        after: [],
      };
      const __parsedData = getTooltipWithCallbacks(callbacks, _____inputData);
      updateTargetArray(
        labelSections.before,
        splitStringByLine(
          invokePropertyMethod(
            __parsedData,
            "beforeLabel",
            this,
            _____inputData,
          ),
        ),
      );
      updateTargetArray(
        labelSections.lines,
        invokePropertyMethod(__parsedData, "label", this, _____inputData),
      );
      updateTargetArray(
        labelSections.after,
        splitStringByLine(
          invokePropertyMethod(
            __parsedData,
            "afterLabel",
            this,
            _____inputData,
          ),
        ),
      );
      labelSectionsArray.push(labelSections);
    });
    return labelSectionsArray;
  }
  getAfterBody(___inputParameter, afterBodyCallbacks) {
    return processInputText(
      invokePropertyMethod(
        afterBodyCallbacks.callbacks,
        "afterBody",
        this,
        ___inputParameter,
      ),
    );
  }
  getFooter(footerContext, footerConfig) {
    const { callbacks: footerCallbacks } = footerConfig;
    const beforeFooterContent = invokePropertyMethod(
      footerCallbacks,
      "beforeFooter",
      this,
      footerContext,
    );
    const footerContent = invokePropertyMethod(
      footerCallbacks,
      "footer",
      this,
      footerContext,
    );
    const afterFooterContent = invokePropertyMethod(
      footerCallbacks,
      "afterFooter",
      this,
      footerContext,
    );
    let footerContentLines = [];
    footerContentLines = updateTargetArray(
      footerContentLines,
      splitStringByLine(beforeFooterContent),
    );
    footerContentLines = updateTargetArray(
      footerContentLines,
      splitStringByLine(footerContent),
    );
    footerContentLines = updateTargetArray(
      footerContentLines,
      splitStringByLine(afterFooterContent),
    );
    return footerContentLines;
  }
  _createItems(filterAndSortOptions) {
    const activeItems = this._active;
    const __________________________________chartData = this.chart.data;
    const labelColorsArray = [];
    const labelPointStyles = [];
    const labelTextColorsArray = [];
    let _chartIndex;
    let activeItemsCount;
    let chartDetailsArray = [];
    _chartIndex = 0;
    activeItemsCount = activeItems.length;
    for (; _chartIndex < activeItemsCount; ++_chartIndex) {
      chartDetailsArray.push(
        getChartDetails(this.chart, activeItems[_chartIndex]),
      );
    }
    if (filterAndSortOptions.filter) {
      chartDetailsArray = chartDetailsArray.filter(
        (filterElement, filterCriteria, _filterCriteria) =>
          filterAndSortOptions.filter(
            filterElement,
            filterCriteria,
            _filterCriteria,
            __________________________________chartData,
          ),
      );
    }
    if (filterAndSortOptions.itemSort) {
      chartDetailsArray = chartDetailsArray.sort(
        (___________element, _sortOrder) =>
          filterAndSortOptions.itemSort(
            ___________element,
            _sortOrder,
            __________________________________chartData,
          ),
      );
    }
    __lastDateUpdated(chartDetailsArray, (____event) => {
      const callbackResult = getTooltipWithCallbacks(
        filterAndSortOptions.callbacks,
        ____event,
      );
      labelColorsArray.push(
        invokePropertyMethod(callbackResult, "labelColor", this, ____event),
      );
      labelPointStyles.push(
        invokePropertyMethod(
          callbackResult,
          "labelPointStyle",
          this,
          ____event,
        ),
      );
      labelTextColorsArray.push(
        invokePropertyMethod(callbackResult, "labelTextColor", this, ____event),
      );
    });
    this.labelColors = labelColorsArray;
    this.labelPointStyles = labelPointStyles;
    this.labelTextColors = labelTextColorsArray;
    this.dataPoints = chartDetailsArray;
    return chartDetailsArray;
  }
  update(externalCallback, tooltipReplayFunction) {
    const _tooltipContext = this.options.setContext(this.getContext());
    const activeTooltipItems = this._active;
    let tooltipPositionData;
    let _tooltipItems = [];
    if (activeTooltipItems.length) {
      const tooltipPosition = _____________animationController[
        _tooltipContext.position
      ].call(this, activeTooltipItems, this._eventPosition);
      _tooltipItems = this._createItems(_tooltipContext);
      this.title = this.getTitle(_tooltipItems, _tooltipContext);
      this.beforeBody = this.getBeforeBody(_tooltipItems, _tooltipContext);
      this.body = this.getBody(_tooltipItems, _tooltipContext);
      this.afterBody = this.getAfterBody(_tooltipItems, _tooltipContext);
      this.footer = this.getFooter(_tooltipItems, _tooltipContext);
      const tooltipReplay = (this._size = calculateTooltipDimensions(
        this,
        _tooltipContext,
      ));
      const mergedContext = Object.assign({}, tooltipPosition, tooltipReplay);
      const _tooltipPosition = alignElements(
        this.chart,
        _tooltipContext,
        mergedContext,
      );
      const __tooltipPosition = calculateTooltipPosition(
        _tooltipContext,
        mergedContext,
        _tooltipPosition,
        this.chart,
      );
      this.xAlign = _tooltipPosition.xAlign;
      this.yAlign = _tooltipPosition.yAlign;
      tooltipPositionData = {
        opacity: 1,
        x: __tooltipPosition.x,
        y: __tooltipPosition.y,
        width: tooltipReplay.width,
        height: tooltipReplay.height,
        caretX: tooltipPosition.x,
        caretY: tooltipPosition.y,
      };
    } else if (this.opacity !== 0) {
      tooltipPositionData = {
        opacity: 0,
      };
    }
    this._tooltipItems = _tooltipItems;
    this.$context = undefined;
    if (tooltipPositionData) {
      this._resolveAnimations().update(this, tooltipPositionData);
    }
    if (externalCallback && _tooltipContext.external) {
      _tooltipContext.external.call(this, {
        chart: this.chart,
        tooltip: this,
        replay: tooltipReplayFunction,
      });
    }
  }
  drawCaret(
    caretXPosition,
    __________________canvasContext,
    caretIndex,
    caretString,
  ) {
    const caretPosition = this.getCaretPosition(
      caretXPosition,
      caretIndex,
      caretString,
    );
    __________________canvasContext.lineTo(caretPosition.x1, caretPosition.y1);
    __________________canvasContext.lineTo(caretPosition.x2, caretPosition.y2);
    __________________canvasContext.lineTo(caretPosition.x3, caretPosition.y3);
  }
  getCaretPosition(_caretPosition, elementDimensions, caretConfig) {
    const { xAlign: _xAlignment, yAlign: verticalAlign } = this;
    const { caretSize: _caretSize, cornerRadius: _cornerRadius } = caretConfig;
    const {
      topLeft: _topLeftBorderRadius,
      topRight: __bottomRightBorderRadius,
      bottomLeft: bottomLeftRadius,
      bottomRight: ___bottomRightBorderRadius,
    } = elementBorderRadius(_cornerRadius);
    const { x: caretPositionX, y: caretPositionY } = _caretPosition;
    const { width: _elementWidth, height: ___height } = elementDimensions;
    let caretPositionAdjustment;
    let _caretPositionAdjustment;
    let caretFinalPositionX;
    let adjustedCaretPositionY;
    let caretPositionAdjustmentY;
    let finalCaretPositionY;
    if (verticalAlign === "center") {
      caretPositionAdjustmentY = caretPositionY + ___height / 2;
      if (_xAlignment === "left") {
        caretPositionAdjustment = caretPositionX;
        _caretPositionAdjustment = caretPositionAdjustment - _caretSize;
        adjustedCaretPositionY = caretPositionAdjustmentY + _caretSize;
        finalCaretPositionY = caretPositionAdjustmentY - _caretSize;
      } else {
        caretPositionAdjustment = caretPositionX + _elementWidth;
        _caretPositionAdjustment = caretPositionAdjustment + _caretSize;
        adjustedCaretPositionY = caretPositionAdjustmentY - _caretSize;
        finalCaretPositionY = caretPositionAdjustmentY + _caretSize;
      }
      caretFinalPositionX = caretPositionAdjustment;
    } else {
      if (_xAlignment === "left") {
        _caretPositionAdjustment =
          caretPositionX +
          Math.max(_topLeftBorderRadius, bottomLeftRadius) +
          _caretSize;
      } else if (_xAlignment === "right") {
        _caretPositionAdjustment =
          caretPositionX +
          _elementWidth -
          Math.max(__bottomRightBorderRadius, ___bottomRightBorderRadius) -
          _caretSize;
      } else {
        _caretPositionAdjustment = this.caretX;
      }
      if (verticalAlign === "top") {
        adjustedCaretPositionY = caretPositionY;
        caretPositionAdjustmentY = adjustedCaretPositionY - _caretSize;
        caretPositionAdjustment = _caretPositionAdjustment - _caretSize;
        caretFinalPositionX = _caretPositionAdjustment + _caretSize;
      } else {
        adjustedCaretPositionY = caretPositionY + ___height;
        caretPositionAdjustmentY = adjustedCaretPositionY + _caretSize;
        caretPositionAdjustment = _caretPositionAdjustment + _caretSize;
        caretFinalPositionX = _caretPositionAdjustment - _caretSize;
      }
      finalCaretPositionY = adjustedCaretPositionY;
    }
    return {
      x1: caretPositionAdjustment,
      x2: _caretPositionAdjustment,
      x3: caretFinalPositionX,
      y1: adjustedCaretPositionY,
      y2: caretPositionAdjustmentY,
      y3: finalCaretPositionY,
    };
  }
  drawTitle(
    titlePosition,
    _____________________________canvasContext,
    currentCharacterIndex,
  ) {
    const _titleText = this.title;
    const titleTextLength = _titleText.length;
    let _________animationFrameId;
    let titleSpacing;
    let ___________________currentIndex;
    if (titleTextLength) {
      const animationParams = __animationManager(
        currentCharacterIndex.rtl,
        this.x,
        this.width,
      );
      titlePosition.x = calculateAlignmentOffset(
        this,
        currentCharacterIndex.titleAlign,
        currentCharacterIndex,
      );
      _____________________________canvasContext.textAlign =
        animationParams.textAlign(currentCharacterIndex.titleAlign);
      _____________________________canvasContext.textBaseline = "middle";
      _________animationFrameId = requestAnimationFrame(
        currentCharacterIndex.titleFont,
      );
      titleSpacing = currentCharacterIndex.titleSpacing;
      _____________________________canvasContext.fillStyle =
        currentCharacterIndex.titleColor;
      _____________________________canvasContext.font =
        _________animationFrameId.string;
      ___________________currentIndex = 0;
      for (
        ;
        ___________________currentIndex < titleTextLength;
        ++___________________currentIndex
      ) {
        _____________________________canvasContext.fillText(
          _titleText[___________________currentIndex],
          animationParams.x(titlePosition.x),
          titlePosition.y + _________animationFrameId.lineHeight / 2,
        );
        titlePosition.y += _________animationFrameId.lineHeight + titleSpacing;
        if (___________________currentIndex + 1 === titleTextLength) {
          titlePosition.y +=
            currentCharacterIndex.titleMarginBottom - titleSpacing;
        }
      }
    }
  }
  _drawColorBox(
    _____________________________________________canvasContext,
    pointPositionY,
    __________labelIndex,
    _coordinateSystem,
    __boxDimensions,
  ) {
    const labelColor = this.labelColors[__________labelIndex];
    const _labelPointStyle = this.labelPointStyles[__________labelIndex];
    const { boxHeight: ___boxHeight, boxWidth: ___boxWidth } = __boxDimensions;
    const ___animationFrameRequest = requestAnimationFrame(
      __boxDimensions.bodyFont,
    );
    const alignmentOffset = calculateAlignmentOffset(
      this,
      "left",
      __boxDimensions,
    );
    const leftAlignmentOffset = _coordinateSystem.x(alignmentOffset);
    const __verticalOffset =
      ___boxHeight < ___animationFrameRequest.lineHeight
        ? (___animationFrameRequest.lineHeight - ___boxHeight) / 2
        : 0;
    const adjustedPointPositionY = pointPositionY.y + __verticalOffset;
    if (__boxDimensions.usePointStyle) {
      const pointCoordinates = {
        radius: Math.min(___boxWidth, ___boxHeight) / 2,
        pointStyle: _labelPointStyle.pointStyle,
        rotation: _labelPointStyle.rotation,
        borderWidth: 1,
      };
      const labelIndex =
        _coordinateSystem.leftForLtr(leftAlignmentOffset, ___boxWidth) +
        ___boxWidth / 2;
      const centerYPosition = adjustedPointPositionY + ___boxHeight / 2;
      _____________________________________________canvasContext.strokeStyle =
        __boxDimensions.multiKeyBackground;
      _____________________________________________canvasContext.fillStyle =
        __boxDimensions.multiKeyBackground;
      __animationStep(
        _____________________________________________canvasContext,
        pointCoordinates,
        labelIndex,
        centerYPosition,
      );
      _____________________________________________canvasContext.strokeStyle =
        labelColor.borderColor;
      _____________________________________________canvasContext.fillStyle =
        labelColor.backgroundColor;
      __animationStep(
        _____________________________________________canvasContext,
        pointCoordinates,
        labelIndex,
        centerYPosition,
      );
    } else {
      _____________________________________________canvasContext.lineWidth =
        currentAnimationIndex(labelColor.borderWidth)
          ? Math.max(...Object.values(labelColor.borderWidth))
          : labelColor.borderWidth || 1;
      _____________________________________________canvasContext.strokeStyle =
        labelColor.borderColor;
      _____________________________________________canvasContext.setLineDash(
        labelColor.borderDash || [],
      );
      _____________________________________________canvasContext.lineDashOffset =
        labelColor.borderDashOffset || 0;
      const pointPosition = _coordinateSystem.leftForLtr(
        leftAlignmentOffset,
        ___boxWidth,
      );
      const _labelIndex = _coordinateSystem.leftForLtr(
        _coordinateSystem.xPlus(leftAlignmentOffset, 1),
        ___boxWidth - 2,
      );
      const labelPointStyle = elementBorderRadius(labelColor.borderRadius);
      if (
        Object.values(labelPointStyle).some((_isNonZero) => _isNonZero !== 0)
      ) {
        _____________________________________________canvasContext.beginPath();
        _____________________________________________canvasContext.fillStyle =
          __boxDimensions.multiKeyBackground;
        ___animationController(
          _____________________________________________canvasContext,
          {
            x: pointPosition,
            y: adjustedPointPositionY,
            w: ___boxWidth,
            h: ___boxHeight,
            radius: labelPointStyle,
          },
        );
        _____________________________________________canvasContext.fill();
        _____________________________________________canvasContext.stroke();
        _____________________________________________canvasContext.fillStyle =
          labelColor.backgroundColor;
        _____________________________________________canvasContext.beginPath();
        ___animationController(
          _____________________________________________canvasContext,
          {
            x: _labelIndex,
            y: adjustedPointPositionY + 1,
            w: ___boxWidth - 2,
            h: ___boxHeight - 2,
            radius: labelPointStyle,
          },
        );
        _____________________________________________canvasContext.fill();
      } else {
        _____________________________________________canvasContext.fillStyle =
          __boxDimensions.multiKeyBackground;
        _____________________________________________canvasContext.fillRect(
          pointPosition,
          adjustedPointPositionY,
          ___boxWidth,
          ___boxHeight,
        );
        _____________________________________________canvasContext.strokeRect(
          pointPosition,
          adjustedPointPositionY,
          ___boxWidth,
          ___boxHeight,
        );
        _____________________________________________canvasContext.fillStyle =
          labelColor.backgroundColor;
        _____________________________________________canvasContext.fillRect(
          _labelIndex,
          adjustedPointPositionY + 1,
          ___boxWidth - 2,
          ___boxHeight - 2,
        );
      }
    }
    _____________________________________________canvasContext.fillStyle =
      this.labelTextColors[__________labelIndex];
  }
  drawBody(
    contextPosition,
    ____________________________________________canvasContext,
    bodyProperties,
  ) {
    const { body: bodyItems } = this;
    const {
      bodySpacing: bodySpacing,
      bodyAlign: bodyAlignment,
      displayColors: displayColors,
      boxHeight: __boxHeight,
      boxWidth: __boxWidth,
      boxPadding: boxPadding,
    } = bodyProperties;
    const requestAnimationFrameInfo = requestAnimationFrame(
      bodyProperties.bodyFont,
    );
    let __lineHeight = requestAnimationFrameInfo.lineHeight;
    let _horizontalOffset = 0;
    const ____________animationManager = __animationManager(
      bodyProperties.rtl,
      this.x,
      this.width,
    );
    const drawTextOnCanvas = function (textToDraw) {
      ____________________________________________canvasContext.fillText(
        textToDraw,
        ____________animationManager.x(contextPosition.x + _horizontalOffset),
        contextPosition.y + __lineHeight / 2,
      );
      contextPosition.y += __lineHeight + bodySpacing;
    };
    const textAlignmentFunction =
      ____________animationManager.textAlign(bodyAlignment);
    let bodyItem;
    let labelTextColor;
    let textLineItems;
    let ____________currentIndex;
    let _________________________________currentIndex;
    let numberOfBodyItems;
    let textLineCount;
    ____________________________________________canvasContext.textAlign =
      bodyAlignment;
    ____________________________________________canvasContext.textBaseline =
      "middle";
    ____________________________________________canvasContext.font =
      requestAnimationFrameInfo.string;
    contextPosition.x = calculateAlignmentOffset(
      this,
      textAlignmentFunction,
      bodyProperties,
    );
    ____________________________________________canvasContext.fillStyle =
      bodyProperties.bodyColor;
    __lastDateUpdated(this.beforeBody, drawTextOnCanvas);
    if (displayColors && textAlignmentFunction !== "right") {
      if (bodyAlignment === "center") {
        _horizontalOffset = __boxWidth / 2 + boxPadding;
      } else {
        _horizontalOffset = __boxWidth + 2 + boxPadding;
      }
    } else {
      _horizontalOffset = 0;
    }
    ____________currentIndex = 0;
    numberOfBodyItems = bodyItems.length;
    for (
      ;
      ____________currentIndex < numberOfBodyItems;
      ++____________currentIndex
    ) {
      bodyItem = bodyItems[____________currentIndex];
      labelTextColor = this.labelTextColors[____________currentIndex];
      ____________________________________________canvasContext.fillStyle =
        labelTextColor;
      __lastDateUpdated(bodyItem.before, drawTextOnCanvas);
      textLineItems = bodyItem.lines;
      if (displayColors && textLineItems.length) {
        this._drawColorBox(
          ____________________________________________canvasContext,
          contextPosition,
          ____________currentIndex,
          ____________animationManager,
          bodyProperties,
        );
        __lineHeight = Math.max(
          requestAnimationFrameInfo.lineHeight,
          __boxHeight,
        );
      }
      _________________________________currentIndex = 0;
      textLineCount = textLineItems.length;
      for (
        ;
        _________________________________currentIndex < textLineCount;
        ++_________________________________currentIndex
      ) {
        drawTextOnCanvas(
          textLineItems[_________________________________currentIndex],
        );
        __lineHeight = requestAnimationFrameInfo.lineHeight;
      }
      __lastDateUpdated(bodyItem.after, drawTextOnCanvas);
    }
    _horizontalOffset = 0;
    __lineHeight = requestAnimationFrameInfo.lineHeight;
    __lastDateUpdated(this.afterBody, drawTextOnCanvas);
    contextPosition.y -= bodySpacing;
  }
  drawFooter(
    footerPosition,
    ___________________________canvasContext,
    footerData,
  ) {
    const footerItems = this.footer;
    const _footerItemCount = footerItems.length;
    let _animationFrameRequest;
    let _textIndex;
    if (_footerItemCount) {
      const _animationSettings = __animationManager(
        footerData.rtl,
        this.x,
        this.width,
      );
      footerPosition.x = calculateAlignmentOffset(
        this,
        footerData.footerAlign,
        footerData,
      );
      footerPosition.y += footerData.footerMarginTop;
      ___________________________canvasContext.textAlign =
        _animationSettings.textAlign(footerData.footerAlign);
      ___________________________canvasContext.textBaseline = "middle";
      _animationFrameRequest = requestAnimationFrame(footerData.footerFont);
      ___________________________canvasContext.fillStyle =
        footerData.footerColor;
      ___________________________canvasContext.font =
        _animationFrameRequest.string;
      _textIndex = 0;
      for (; _textIndex < _footerItemCount; ++_textIndex) {
        ___________________________canvasContext.fillText(
          footerItems[_textIndex],
          _animationSettings.x(footerPosition.x),
          footerPosition.y + _animationFrameRequest.lineHeight / 2,
        );
        footerPosition.y +=
          _animationFrameRequest.lineHeight + footerData.footerSpacing;
      }
    }
  }
  drawBackground(
    backgroundDimensions,
    _________________________________________canvasContext,
    _backgroundDimensions,
    backgroundStyle,
  ) {
    const { xAlign: horizontalAlignment, yAlign: _verticalAlignment } = this;
    const { x: backgroundX, y: backgroundYPosition } = backgroundDimensions;
    const { width: _backgroundWidth, height: _backgroundHeight } =
      _backgroundDimensions;
    const {
      topLeft: topLeftCornerRadius,
      topRight: topRightCornerRadius,
      bottomLeft: bottomLeftCornerRadius,
      bottomRight: bottomRightCornerRadius,
    } = elementBorderRadius(backgroundStyle.cornerRadius);
    _________________________________________canvasContext.fillStyle =
      backgroundStyle.backgroundColor;
    _________________________________________canvasContext.strokeStyle =
      backgroundStyle.borderColor;
    _________________________________________canvasContext.lineWidth =
      backgroundStyle.borderWidth;
    _________________________________________canvasContext.beginPath();
    _________________________________________canvasContext.moveTo(
      backgroundX + topLeftCornerRadius,
      backgroundYPosition,
    );
    if (_verticalAlignment === "top") {
      this.drawCaret(
        backgroundDimensions,
        _________________________________________canvasContext,
        _backgroundDimensions,
        backgroundStyle,
      );
    }
    _________________________________________canvasContext.lineTo(
      backgroundX + _backgroundWidth - topRightCornerRadius,
      backgroundYPosition,
    );
    _________________________________________canvasContext.quadraticCurveTo(
      backgroundX + _backgroundWidth,
      backgroundYPosition,
      backgroundX + _backgroundWidth,
      backgroundYPosition + topRightCornerRadius,
    );
    if (_verticalAlignment === "center" && horizontalAlignment === "right") {
      this.drawCaret(
        backgroundDimensions,
        _________________________________________canvasContext,
        _backgroundDimensions,
        backgroundStyle,
      );
    }
    _________________________________________canvasContext.lineTo(
      backgroundX + _backgroundWidth,
      backgroundYPosition + _backgroundHeight - bottomRightCornerRadius,
    );
    _________________________________________canvasContext.quadraticCurveTo(
      backgroundX + _backgroundWidth,
      backgroundYPosition + _backgroundHeight,
      backgroundX + _backgroundWidth - bottomRightCornerRadius,
      backgroundYPosition + _backgroundHeight,
    );
    if (_verticalAlignment === "bottom") {
      this.drawCaret(
        backgroundDimensions,
        _________________________________________canvasContext,
        _backgroundDimensions,
        backgroundStyle,
      );
    }
    _________________________________________canvasContext.lineTo(
      backgroundX + bottomLeftCornerRadius,
      backgroundYPosition + _backgroundHeight,
    );
    _________________________________________canvasContext.quadraticCurveTo(
      backgroundX,
      backgroundYPosition + _backgroundHeight,
      backgroundX,
      backgroundYPosition + _backgroundHeight - bottomLeftCornerRadius,
    );
    if (_verticalAlignment === "center" && horizontalAlignment === "left") {
      this.drawCaret(
        backgroundDimensions,
        _________________________________________canvasContext,
        _backgroundDimensions,
        backgroundStyle,
      );
    }
    _________________________________________canvasContext.lineTo(
      backgroundX,
      backgroundYPosition + topLeftCornerRadius,
    );
    _________________________________________canvasContext.quadraticCurveTo(
      backgroundX,
      backgroundYPosition,
      backgroundX + topLeftCornerRadius,
      backgroundYPosition,
    );
    _________________________________________canvasContext.closePath();
    _________________________________________canvasContext.fill();
    if (backgroundStyle.borderWidth > 0) {
      _________________________________________canvasContext.stroke();
    }
  }
  _updateAnimationTarget(tooltipEventPosition) {
    const ________________________________chartInstance = this.chart;
    const _animations = this.$animations;
    const xAnimation = _animations && _animations.x;
    const yAnimation = _animations && _animations.y;
    if (xAnimation || yAnimation) {
      const animations = _____________animationController[
        tooltipEventPosition.position
      ].call(this, this._active, this._eventPosition);
      if (!animations) {
        return;
      }
      const updatedSize = (this._size = calculateTooltipDimensions(
        this,
        tooltipEventPosition,
      ));
      const animationTargetProperties = Object.assign(
        {},
        animations,
        this._size,
      );
      const animationTargetData = alignElements(
        ________________________________chartInstance,
        tooltipEventPosition,
        animationTargetProperties,
      );
      const newAnimationPosition = calculateTooltipPosition(
        tooltipEventPosition,
        animationTargetProperties,
        animationTargetData,
        ________________________________chartInstance,
      );
      if (
        xAnimation._to !== newAnimationPosition.x ||
        yAnimation._to !== newAnimationPosition.y
      ) {
        this.xAlign = animationTargetData.xAlign;
        this.yAlign = animationTargetData.yAlign;
        this.width = updatedSize.width;
        this.height = updatedSize.height;
        this.caretX = animations.x;
        this.caretY = animations.y;
        this._resolveAnimations().update(this, newAnimationPosition);
      }
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(____________________________________canvasContext) {
    const _contextOptions = this.options.setContext(this.getContext());
    let currentOpacity = this.opacity;
    if (!currentOpacity) {
      return;
    }
    this._updateAnimationTarget(_contextOptions);
    const _dimensions = {
      width: this.width,
      height: this.height,
    };
    const ___position = {
      x: this.x,
      y: this.y,
    };
    if (Math.abs(currentOpacity) < 0.001) {
      currentOpacity = 0;
    } else {
      currentOpacity = currentOpacity;
    }
    const _animationOffset = __animationElement(_contextOptions.padding);
    const textElementCount =
      this.title.length ||
      this.beforeBody.length ||
      this.body.length ||
      this.afterBody.length ||
      this.footer.length;
    if (_contextOptions.enabled && textElementCount) {
      ____________________________________canvasContext.save();
      ____________________________________canvasContext.globalAlpha =
        currentOpacity;
      this.drawBackground(
        ___position,
        ____________________________________canvasContext,
        _dimensions,
        _contextOptions,
      );
      chartRequestAnimationFrame(
        ____________________________________canvasContext,
        _contextOptions.textDirection,
      );
      ___position.y += _animationOffset.top;
      this.drawTitle(
        ___position,
        ____________________________________canvasContext,
        _contextOptions,
      );
      this.drawBody(
        ___position,
        ____________________________________canvasContext,
        _contextOptions,
      );
      this.drawFooter(
        ___position,
        ____________________________________canvasContext,
        _contextOptions,
      );
      chartAnimationController(
        ____________________________________canvasContext,
        _contextOptions.textDirection,
      );
      ____________________________________canvasContext.restore();
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(_dataElements, _eventPosition) {
    const ______datasetMeta = this._active;
    const activeDataElements = _dataElements.map(
      ({ datasetIndex: ___________datasetIndex, index: dataElementIndex }) => {
        const _____datasetMeta = this.chart.getDatasetMeta(
          ___________datasetIndex,
        );
        if (!_____datasetMeta) {
          throw new Error(
            "Cannot find a dataset at index " + ___________datasetIndex,
          );
        }
        return {
          datasetIndex: ___________datasetIndex,
          element: _____datasetMeta.data[dataElementIndex],
          index: dataElementIndex,
        };
      },
    );
    const isAnimationCompleted = !_animationController(
      ______datasetMeta,
      activeDataElements,
    );
    const isPositionChanged = this._positionChanged(
      activeDataElements,
      _eventPosition,
    );
    if (isAnimationCompleted || isPositionChanged) {
      this._active = activeDataElements;
      this._eventPosition = _eventPosition;
      this._ignoreReplayEvents = true;
      this.update(true);
    }
  }
  handleEvent(eventPosition, _____eventObject, isInitialEvent = true) {
    if (_____eventObject && this._ignoreReplayEvents) {
      return false;
    }
    this._ignoreReplayEvents = false;
    const _____________________options = this.options;
    const ____activeElements = this._active || [];
    const _____activeElements = this._getActiveElements(
      eventPosition,
      ____activeElements,
      _____eventObject,
      isInitialEvent,
    );
    const positionChanged = this._positionChanged(
      _____activeElements,
      eventPosition,
    );
    const shouldProcessEvent =
      _____eventObject ||
      !_animationController(_____activeElements, ____activeElements) ||
      positionChanged;
    if (shouldProcessEvent) {
      this._active = _____activeElements;
      if (
        _____________________options.enabled ||
        _____________________options.external
      ) {
        this._eventPosition = {
          x: eventPosition.x,
          y: eventPosition.y,
        };
        this.update(true, _____eventObject);
      }
    }
    return shouldProcessEvent;
  }
  _getActiveElements(
    ___________________________event,
    eventElements,
    activeElementIndex,
    isEventProcessed,
  ) {
    const ____optionsConfig = this.options;
    if (___________________________event.type === "mouseout") {
      return [];
    }
    if (!isEventProcessed) {
      return eventElements;
    }
    const activeElements = this.chart.getElementsAtEventForMode(
      ___________________________event,
      ____optionsConfig.mode,
      ____optionsConfig,
      activeElementIndex,
    );
    if (____optionsConfig.reverse) {
      activeElements.reverse();
    }
    return activeElements;
  }
  _positionChanged(positionDelta, ______________________event) {
    const {
      caretX: _caretXPosition,
      caretY: caretY,
      options: __optionsConfig,
    } = this;
    const newPosition = _____________animationController[
      __optionsConfig.position
    ].call(this, positionDelta, ______________________event);
    return (
      newPosition !== false &&
      (_caretXPosition !== newPosition.x || caretY !== newPosition.y)
    );
  }
}
var tooltipManager = {
  id: "tooltip",
  _element: TooltipAnimationController,
  positioners: _____________animationController,
  afterInit(chartObject, ___tooltipOptions, ____tooltipOptions) {
    if (____tooltipOptions) {
      chartObject.tooltip = new TooltipAnimationController({
        chart: chartObject,
        options: ____tooltipOptions,
      });
    }
  },
  beforeUpdate(__tooltipData, _tooltipInstance, tooltipInitializationIndex) {
    if (__tooltipData.tooltip) {
      __tooltipData.tooltip.initialize(tooltipInitializationIndex);
    }
  },
  reset(___tooltipData, _____tooltipOptions, ____tooltipData) {
    if (___tooltipData.tooltip) {
      ___tooltipData.tooltip.initialize(____tooltipData);
    }
  },
  afterDraw(_______chartInstance) {
    const tooltipInstance = _______chartInstance.tooltip;
    if (tooltipInstance && tooltipInstance._willRender()) {
      const tooltipDrawData = {
        tooltip: tooltipInstance,
      };
      if (
        _______chartInstance.notifyPlugins("beforeTooltipDraw", {
          ...tooltipDrawData,
          cancelable: true,
        }) === false
      ) {
        return;
      }
      tooltipInstance.draw(_______chartInstance.ctx);
      _______chartInstance.notifyPlugins("afterTooltipDraw", tooltipDrawData);
    }
  },
  afterEvent(eventTooltip, eventDetails) {
    if (eventTooltip.tooltip) {
      const replayEvent = eventDetails.replay;
      if (
        eventTooltip.tooltip.handleEvent(
          eventDetails.event,
          replayEvent,
          eventDetails.inChartArea,
        )
      ) {
        eventDetails.changed = true;
      }
    }
  },
  defaults: {
    enabled: true,
    external: null,
    position: "average",
    backgroundColor: "rgba(0,0,0,0.8)",
    titleColor: "#fff",
    titleFont: {
      weight: "bold",
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: "left",
    bodyColor: "#fff",
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: "left",
    footerColor: "#fff",
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: "bold",
    },
    footerAlign: "left",
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (_textElement, bodyFontSize) => bodyFontSize.bodyFont.size,
    boxWidth: (textSize, _bodyFontSize) => _bodyFontSize.bodyFont.size,
    multiKeyBackground: "#fff",
    displayColors: true,
    boxPadding: 0,
    borderColor: "rgba(0,0,0,0)",
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: "easeOutQuart",
    },
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "width", "height", "caretX", "caretY"],
      },
      opacity: {
        easing: "linear",
        duration: 200,
      },
    },
    callbacks: chartUpdateState,
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font",
  },
  descriptors: {
    _scriptable: (filterType) =>
      filterType !== "filter" &&
      filterType !== "itemSort" &&
      filterType !== "external",
    _indexable: false,
    callbacks: {
      _scriptable: false,
      _indexable: false,
    },
    animation: {
      _fallback: false,
    },
    animations: {
      _fallback: "animation",
    },
  },
  additionalOptionScopes: ["interaction"],
};
var ___animationRequestId = Object.freeze({
  __proto__: null,
  Colors: _animationTaskId,
  Decimation: ___isChartAnimationRunning,
  Filler: _animationControllerInstance,
  Legend: _______animationState,
  SubTitle: _____chartAnimationQueue,
  Title: ______________animationController,
  Tooltip: tooltipManager,
});
const _animationItems = (
  __elementList,
  _____________inputValue,
  pushedIndex,
  stringLabelList,
) => {
  if (typeof _____________inputValue == "string") {
    pushedIndex = __elementList.push(_____________inputValue) - 1;
    stringLabelList.unshift({
      index: pushedIndex,
      label: _____________inputValue,
    });
  } else if (isNaN(_____________inputValue)) {
    pushedIndex = null;
  }
  return pushedIndex;
};
function findFirstOccurrence(
  targetString,
  searchElement,
  _animationIndex,
  searchString,
) {
  const firstOccurrenceIndex = targetString.indexOf(searchElement);
  if (firstOccurrenceIndex === -1) {
    return _animationItems(
      targetString,
      searchElement,
      _animationIndex,
      searchString,
    );
  }
  if (firstOccurrenceIndex !== targetString.lastIndexOf(searchElement)) {
    return _animationIndex;
  } else {
    return firstOccurrenceIndex;
  }
}
const chartLabel = (durationInMilliseconds, animationFrameTime) =>
  durationInMilliseconds === null
    ? null
    : chartAnimationState(
        Math.round(durationInMilliseconds),
        0,
        animationFrameTime,
      );
function getLabelByIndex(___labelIndex) {
  const labelsArray = this.getLabels();
  if (___labelIndex >= 0 && ___labelIndex < labelsArray.length) {
    return labelsArray[___labelIndex];
  } else {
    return ___labelIndex;
  }
}
class Category extends ChartAxisController {
  static id = "category";
  static defaults = {
    ticks: {
      callback: getLabelByIndex,
    },
  };
  constructor(_constructorParameter) {
    super(_constructorParameter);
    this._startValue = undefined;
    this._valueRange = 0;
    this._addedLabels = [];
  }
  init(initializationParameter) {
    const addedLabels = this._addedLabels;
    if (addedLabels.length) {
      const labelsToRemove = this.getLabels();
      for (const { index: __labelIndex, label: _label } of addedLabels) {
        if (labelsToRemove[__labelIndex] === _label) {
          labelsToRemove.splice(__labelIndex, 1);
        }
      }
      this._addedLabels = [];
    }
    super.init(initializationParameter);
  }
  parse(labelToParse, _______labelIndex) {
    if (chartUpdateInterval(labelToParse)) {
      return null;
    }
    const _labelsArray = this.getLabels();
    if (
      isFinite(_______labelIndex) &&
      _labelsArray[_______labelIndex] === labelToParse
    ) {
      _______labelIndex = _______labelIndex;
    } else {
      _______labelIndex = findFirstOccurrence(
        _labelsArray,
        labelToParse,
        chartAnimationRunning(_______labelIndex, labelToParse),
        this._addedLabels,
      );
    }
    return chartLabel(_______labelIndex, _labelsArray.length - 1);
  }
  determineDataLimits() {
    const { minDefined: minDefinedValue, maxDefined: maxDefinedUserBound } =
      this.getUserBounds();
    let { min: _______minValue, max: maxDefinedValue } = this.getMinMax(true);
    if (this.options.bounds === "ticks") {
      if (!minDefinedValue) {
        _______minValue = 0;
      }
      if (!maxDefinedUserBound) {
        maxDefinedValue = this.getLabels().length - 1;
      }
    }
    this.min = _______minValue;
    this.max = maxDefinedValue;
  }
  buildTicks() {
    const startValueIndex = this.min;
    const ________maxValue = this.max;
    const _____currentValue = this.options.offset;
    const __tickValues = [];
    let _labelCount = this.getLabels();
    if (startValueIndex === 0 && ________maxValue === _labelCount.length - 1) {
      _labelCount = _labelCount;
    } else {
      _labelCount = _labelCount.slice(startValueIndex, ________maxValue + 1);
    }
    this._valueRange = Math.max(
      _labelCount.length - (_____currentValue ? 0 : 1),
      1,
    );
    this._startValue = this.min - (_____currentValue ? 0.5 : 0);
    for (
      let ____currentValue = startValueIndex;
      ____currentValue <= ________maxValue;
      ____currentValue++
    ) {
      __tickValues.push({
        value: ____currentValue,
      });
    }
    return __tickValues;
  }
  getLabelForValue(valueIndex) {
    return getLabelByIndex.call(this, valueIndex);
  }
  configure() {
    super.configure();
    if (!this.isHorizontal()) {
      this._reversePixels = !this._reversePixels;
    }
  }
  getPixelForValue(_valueForPixel) {
    if (typeof _valueForPixel != "number") {
      _valueForPixel = this.parse(_valueForPixel);
    }
    if (_valueForPixel === null) {
      return NaN;
    } else {
      return this.getPixelForDecimal(
        (_valueForPixel - this._startValue) / this._valueRange,
      );
    }
  }
  getPixelForTick(______tickIndex) {
    const _ticksArray = this.ticks;
    if (______tickIndex < 0 || ______tickIndex > _ticksArray.length - 1) {
      return null;
    } else {
      return this.getPixelForValue(_ticksArray[______tickIndex].value);
    }
  }
  getValueForPixel(_pixelPosition) {
    return Math.round(
      this._startValue +
        this.getDecimalForPixel(_pixelPosition) * this._valueRange,
    );
  }
  getBasePixel() {
    return this.bottom;
  }
}
function calculateIntervalValues(inputParams, range) {
  const calculatedIntervalValues = [];
  const {
    bounds: boundsType,
    step: stepSize,
    min: __minValue,
    max: _maxValue,
    precision: decimalPrecision,
    count: intervalCount,
    maxTicks: maxTicksAllowed,
    maxDigits: maxDigits,
    includeBounds: includeBounds,
  } = inputParams;
  const _stepSize = stepSize || 1;
  const maxTicksAdjusted = maxTicksAllowed - 1;
  const { min: rangeMin, max: _maxRangeValue } = range;
  const isStartInterval = !chartUpdateInterval(__minValue);
  const isMaxBoundUpdated = !chartUpdateInterval(_maxValue);
  const isMaxCountValid = !chartUpdateInterval(intervalCount);
  const intervalStepSize = (_maxRangeValue - rangeMin) / (maxDigits + 1);
  let stepValue;
  let __lowerBound;
  let __maxValue;
  let _intervalCount;
  let intervalValue =
    __animationHandler(
      (_maxRangeValue - rangeMin) / maxTicksAdjusted / _stepSize,
    ) * _stepSize;
  if (intervalValue < 1e-14 && !isStartInterval && !isMaxBoundUpdated) {
    return [
      {
        value: rangeMin,
      },
      {
        value: _maxRangeValue,
      },
    ];
  }
  _intervalCount =
    Math.ceil(_maxRangeValue / intervalValue) -
    Math.floor(rangeMin / intervalValue);
  if (_intervalCount > maxTicksAdjusted) {
    intervalValue =
      __animationHandler(
        (_intervalCount * intervalValue) / maxTicksAdjusted / _stepSize,
      ) * _stepSize;
  }
  if (!chartUpdateInterval(decimalPrecision)) {
    stepValue = Math.pow(10, decimalPrecision);
    intervalValue = Math.ceil(intervalValue * stepValue) / stepValue;
  }
  if (boundsType === "ticks") {
    __lowerBound = Math.floor(rangeMin / intervalValue) * intervalValue;
    __maxValue = Math.ceil(_maxRangeValue / intervalValue) * intervalValue;
  } else {
    __lowerBound = rangeMin;
    __maxValue = _maxRangeValue;
  }
  if (
    isStartInterval &&
    isMaxBoundUpdated &&
    stepSize &&
    __requestAnimationFrame(
      (_maxValue - __minValue) / stepSize,
      intervalValue / 1000,
    )
  ) {
    _intervalCount = Math.round(
      Math.min((_maxValue - __minValue) / intervalValue, maxTicksAllowed),
    );
    intervalValue = (_maxValue - __minValue) / _intervalCount;
    __lowerBound = __minValue;
    __maxValue = _maxValue;
  } else if (isMaxCountValid) {
    if (isStartInterval) {
      __lowerBound = __minValue;
    } else {
      __lowerBound = __lowerBound;
    }
    if (isMaxBoundUpdated) {
      __maxValue = _maxValue;
    } else {
      __maxValue = __maxValue;
    }
    _intervalCount = intervalCount - 1;
    intervalValue = (__maxValue - __lowerBound) / _intervalCount;
  } else {
    _intervalCount = (__maxValue - __lowerBound) / intervalValue;
    if (
      tooltipVisible(
        _intervalCount,
        Math.round(_intervalCount),
        intervalValue / 1000,
      )
    ) {
      _intervalCount = Math.round(_intervalCount);
    } else {
      _intervalCount = Math.ceil(_intervalCount);
    }
  }
  const maxTooltipOption = Math.max(
    tooltipOptions(intervalValue),
    tooltipOptions(__lowerBound),
  );
  stepValue = Math.pow(
    10,
    chartUpdateInterval(decimalPrecision) ? maxTooltipOption : decimalPrecision,
  );
  __lowerBound = Math.round(__lowerBound * stepValue) / stepValue;
  __maxValue = Math.round(__maxValue * stepValue) / stepValue;
  let numIntervals = 0;
  for (
    isStartInterval &&
    (includeBounds && __lowerBound !== __minValue
      ? (calculatedIntervalValues.push({
          value: __minValue,
        }),
        __lowerBound < __minValue && numIntervals++,
        tooltipVisible(
          Math.round(
            (__lowerBound + numIntervals * intervalValue) * stepValue,
          ) / stepValue,
          __minValue,
          calculateAnimation(__minValue, intervalStepSize, inputParams),
        ) && numIntervals++)
      : __lowerBound < __minValue && numIntervals++);
    numIntervals < _intervalCount;
    ++numIntervals
  ) {
    const calculatedValue =
      Math.round((__lowerBound + numIntervals * intervalValue) * stepValue) /
      stepValue;
    if (isMaxBoundUpdated && calculatedValue > _maxValue) {
      break;
    }
    calculatedIntervalValues.push({
      value: calculatedValue,
    });
  }
  if (isMaxBoundUpdated && includeBounds && __maxValue !== _maxValue) {
    if (
      calculatedIntervalValues.length &&
      tooltipVisible(
        calculatedIntervalValues[calculatedIntervalValues.length - 1].value,
        _maxValue,
        calculateAnimation(_maxValue, intervalStepSize, inputParams),
      )
    ) {
      calculatedIntervalValues[calculatedIntervalValues.length - 1].value =
        _maxValue;
    } else {
      calculatedIntervalValues.push({
        value: _maxValue,
      });
    }
  } else if (!isMaxBoundUpdated || __maxValue === _maxValue) {
    calculatedIntervalValues.push({
      value: __maxValue,
    });
  }
  return calculatedIntervalValues;
}
function calculateAnimation(
  ____inputValue,
  angleValue,
  { horizontal: isHorizontalAnimationEnabled, minRotation: minRotationDegrees },
) {
  const animationProgress = requestAnimation(minRotationDegrees);
  const trigonometricValue =
    (isHorizontalAnimationEnabled
      ? Math.sin(animationProgress)
      : Math.cos(animationProgress)) || 0.001;
  const maxAnimationValue = angleValue * 0.75 * ("" + ____inputValue).length;
  return Math.min(angleValue / trigonometricValue, maxAnimationValue);
}
class ScaleAdapter extends ChartAxisController {
  constructor(__initialValue) {
    super(__initialValue);
    this.start = undefined;
    this.end = undefined;
    this._startValue = undefined;
    this._endValue = undefined;
    this._valueRange = 0;
  }
  parse(_________inputValue, inputParsingOptions) {
    if (
      chartUpdateInterval(_________inputValue) ||
      ((typeof _________inputValue == "number" ||
        _________inputValue instanceof Number) &&
        !isFinite(+_________inputValue))
    ) {
      return null;
    } else {
      return +_________inputValue;
    }
  }
  handleTickRangeOptions() {
    const { beginAtZero: _beginAtZero } = this.options;
    const { minDefined: minDefined, maxDefined: maxBoundary } =
      this.getUserBounds();
    let { min: _________minValue, max: _________maxValue } = this;
    const setMinIfNotDefined = (fallbackValue) =>
      (_________minValue = minDefined ? _________minValue : fallbackValue);
    const updateMaxValue = (tempValue) =>
      (_________maxValue = maxBoundary ? _________maxValue : tempValue);
    if (_beginAtZero) {
      const beginAtZero = isPathClosed(_________minValue);
      const isMinDefined = isPathClosed(_________maxValue);
      if (beginAtZero < 0 && isMinDefined < 0) {
        updateMaxValue(0);
      } else if (beginAtZero > 0 && isMinDefined > 0) {
        setMinIfNotDefined(0);
      }
    }
    if (_________minValue === _________maxValue) {
      let _isMinDefined =
        _________maxValue === 0 ? 1 : Math.abs(_________maxValue * 0.05);
      updateMaxValue(_________maxValue + _isMinDefined);
      if (!_beginAtZero) {
        setMinIfNotDefined(_________minValue - _isMinDefined);
      }
    }
    this.min = _________minValue;
    this.max = _________maxValue;
  }
  getTickLimit() {
    const ticksOptions = this.options.ticks;
    let ____tickCount;
    let { maxTicksLimit: _maxTicksLimit, stepSize: __stepSize } = ticksOptions;
    if (__stepSize) {
      ____tickCount =
        Math.ceil(this.max / __stepSize) -
        Math.floor(this.min / __stepSize) +
        1;
      if (____tickCount > 1000) {
        console.warn(
          `scales.${this.id}.ticks.stepSize: ${__stepSize} would result generating up to ${____tickCount} ticks. Limiting to 1000.`,
        );
        ____tickCount = 1000;
      }
    } else {
      ____tickCount = this.computeTickLimit();
      _maxTicksLimit = _maxTicksLimit || 11;
    }
    if (_maxTicksLimit) {
      ____tickCount = Math.min(_maxTicksLimit, ____tickCount);
    }
    return ____tickCount;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const __________________________options = this.options;
    const _______tickOptions = __________________________options.ticks;
    let tickLimitAdjusted = this.getTickLimit();
    tickLimitAdjusted = Math.max(2, tickLimitAdjusted);
    const intervalValues = calculateIntervalValues(
      {
        maxTicks: tickLimitAdjusted,
        bounds: __________________________options.bounds,
        min: __________________________options.min,
        max: __________________________options.max,
        precision: _______tickOptions.precision,
        step: _______tickOptions.stepSize,
        count: _______tickOptions.count,
        maxDigits: this._maxDigits(),
        horizontal: this.isHorizontal(),
        minRotation: _______tickOptions.minRotation || 0,
        includeBounds: _______tickOptions.includeBounds !== false,
      },
      this._range || this,
    );
    if (__________________________options.bounds === "ticks") {
      _animationHandler(intervalValues, this, "value");
    }
    if (__________________________options.reverse) {
      intervalValues.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return intervalValues;
  }
  configure() {
    const _tickValues = this.ticks;
    let _____startValue = this.min;
    let ______maxValue = this.max;
    super.configure();
    if (this.options.offset && _tickValues.length) {
      const tickSpacing =
        (______maxValue - _____startValue) /
        Math.max(_tickValues.length - 1, 1) /
        2;
      _____startValue -= tickSpacing;
      ______maxValue += tickSpacing;
    }
    this._startValue = _____startValue;
    this._endValue = ______maxValue;
    this._valueRange = ______maxValue - _____startValue;
  }
  getLabelForValue(chartAnimationDuration) {
    return _isChartAnimationRunning(
      chartAnimationDuration,
      this.chart.options.locale,
      this.options.ticks.format,
    );
  }
}
class LinearScale extends ScaleAdapter {
  static id = "linear";
  static defaults = {
    ticks: {
      callback: tooltipActiveElements.formatters.numeric,
    },
  };
  determineDataLimits() {
    const { min: minDataLimit, max: maxDataLimit } = this.getMinMax(true);
    this.min = chartUpdateTrigger(minDataLimit) ? minDataLimit : 0;
    this.max = chartUpdateTrigger(maxDataLimit) ? maxDataLimit : 1;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const isHorizontalOrientation = this.isHorizontal();
    const tickLimitDimension = isHorizontalOrientation
      ? this.width
      : this.height;
    const minRotationAnimation = requestAnimation(
      this.options.ticks.minRotation,
    );
    const tickRotationAdjustment =
      (isHorizontalOrientation
        ? Math.sin(minRotationAnimation)
        : Math.cos(minRotationAnimation)) || 0.001;
    const resolvedTickFontOptions = this._resolveTickFontOptions(0);
    return Math.ceil(
      tickLimitDimension /
        Math.min(
          40,
          resolvedTickFontOptions.lineHeight / tickRotationAdjustment,
        ),
    );
  }
  getPixelForValue(valueForPixel) {
    if (valueForPixel === null) {
      return NaN;
    } else {
      return this.getPixelForDecimal(
        (valueForPixel - this._startValue) / this._valueRange,
      );
    }
  }
  getValueForPixel(pixelPosition) {
    return (
      this._startValue +
      this.getDecimalForPixel(pixelPosition) * this._valueRange
    );
  }
}
const animationProgressIndex = (__elapsedTime) =>
  Math.floor(___animationManager(__elapsedTime));
const animationCounter = (animationTime, animationOffset) =>
  Math.pow(10, animationProgressIndex(animationTime) + animationOffset);
function isNumberAtAnimationProgress(numberToCheck) {
  return (
    numberToCheck / Math.pow(10, animationProgressIndex(numberToCheck)) === 1
  );
}
function calculateDifference(___________inputValue, dividend, exponentPower) {
  const _scalingFactor = Math.pow(10, exponentPower);
  const dividendQuotient = Math.floor(___________inputValue / _scalingFactor);
  return Math.ceil(dividend / _scalingFactor) - dividendQuotient;
}
function calculateIncrementalAdjustment(___startValue, ___endValue) {
  let incrementalAdjustment = animationProgressIndex(
    ___endValue - ___startValue,
  );
  while (
    calculateDifference(___startValue, ___endValue, incrementalAdjustment) > 10
  ) {
    incrementalAdjustment++;
  }
  while (
    calculateDifference(___startValue, ___endValue, incrementalAdjustment) < 10
  ) {
    incrementalAdjustment--;
  }
  return Math.min(incrementalAdjustment, animationProgressIndex(___startValue));
}
function calculateValueRange(
  value,
  { min: currentMinValue, max: ___maxValue },
) {
  currentMinValue = __tooltipHandler(value.min, currentMinValue);
  const valueRangeArray = [];
  const _animationProgressIndex = animationProgressIndex(currentMinValue);
  let exponent = calculateIncrementalAdjustment(currentMinValue, ___maxValue);
  let incrementScalingFactor =
    exponent < 0 ? Math.pow(10, Math.abs(exponent)) : 1;
  const baseValue = Math.pow(10, exponent);
  const currentPowerOfTen =
    _animationProgressIndex > exponent
      ? Math.pow(10, _animationProgressIndex)
      : 0;
  const roundedValue =
    Math.round((currentMinValue - currentPowerOfTen) * incrementScalingFactor) /
    incrementScalingFactor;
  const baseIncrementValue =
    Math.floor((currentMinValue - currentPowerOfTen) / baseValue / 10) *
    baseValue *
    10;
  let significandValue = Math.floor(
    (roundedValue - baseIncrementValue) / Math.pow(10, exponent),
  );
  let ________currentValue = __tooltipHandler(
    value.min,
    Math.round(
      (currentPowerOfTen +
        baseIncrementValue +
        significandValue * Math.pow(10, exponent)) *
        incrementScalingFactor,
    ) / incrementScalingFactor,
  );
  while (________currentValue < ___maxValue) {
    valueRangeArray.push({
      value: ________currentValue,
      major: isNumberAtAnimationProgress(________currentValue),
      significand: significandValue,
    });
    if (significandValue >= 10) {
      if (significandValue < 15) {
        significandValue = 15;
      } else {
        significandValue = 20;
      }
    } else {
      significandValue++;
    }
    if (significandValue >= 20) {
      exponent++;
      significandValue = 2;
      if (exponent >= 0) {
        incrementScalingFactor = 1;
      } else {
        incrementScalingFactor = incrementScalingFactor;
      }
    }
    ________currentValue =
      Math.round(
        (currentPowerOfTen +
          baseIncrementValue +
          significandValue * Math.pow(10, exponent)) *
          incrementScalingFactor,
      ) / incrementScalingFactor;
  }
  const maxValueWithTooltip = __tooltipHandler(value.max, ________currentValue);
  valueRangeArray.push({
    value: maxValueWithTooltip,
    major: isNumberAtAnimationProgress(maxValueWithTooltip),
    significand: significandValue,
  });
  return valueRangeArray;
}
class LogarithmicScale extends ChartAxisController {
  static id = "logarithmic";
  static defaults = {
    ticks: {
      callback: tooltipActiveElements.formatters.logarithmic,
      major: {
        enabled: true,
      },
    },
  };
  constructor(_initialValue) {
    super(_initialValue);
    this.start = undefined;
    this.end = undefined;
    this._startValue = undefined;
    this._valueRange = 0;
  }
  parse(__________inputData, parserOptions) {
    const ______parsedData = ScaleAdapter.prototype.parse.apply(this, [
      __________inputData,
      parserOptions,
    ]);
    if (______parsedData !== 0) {
      if (chartUpdateTrigger(______parsedData) && ______parsedData > 0) {
        return ______parsedData;
      } else {
        return null;
      }
    }
    this._zero = true;
  }
  determineDataLimits() {
    const { min: _minDataLimit, max: _______maxValue } = this.getMinMax(true);
    this.min = chartUpdateTrigger(_minDataLimit)
      ? Math.max(0, _minDataLimit)
      : null;
    this.max = chartUpdateTrigger(_______maxValue)
      ? Math.max(0, _______maxValue)
      : null;
    if (this.options.beginAtZero) {
      this._zero = true;
    }
    if (
      this._zero &&
      this.min !== this._suggestedMin &&
      !chartUpdateTrigger(this._userMin)
    ) {
      this.min =
        _minDataLimit === animationCounter(this.min, 0)
          ? animationCounter(this.min, -1)
          : animationCounter(this.min, 0);
    }
    this.handleTickRangeOptions();
  }
  handleTickRangeOptions() {
    const { minDefined: minValueDefined, maxDefined: maxDefined } =
      this.getUserBounds();
    let currentMin = this.min;
    let currentMaxValue = this.max;
    const setMinIfUndefined = (_______________event) =>
      (currentMin = minValueDefined ? currentMin : _______________event);
    const adjustMax = (_fallbackValue) =>
      (currentMaxValue = maxDefined ? currentMaxValue : _fallbackValue);
    if (currentMin === currentMaxValue) {
      if (currentMin <= 0) {
        setMinIfUndefined(1);
        adjustMax(10);
      } else {
        setMinIfUndefined(animationCounter(currentMin, -1));
        adjustMax(animationCounter(currentMaxValue, 1));
      }
    }
    if (currentMin <= 0) {
      setMinIfUndefined(animationCounter(currentMaxValue, -1));
    }
    if (currentMaxValue <= 0) {
      adjustMax(animationCounter(currentMin, 1));
    }
    this.min = currentMin;
    this.max = currentMaxValue;
  }
  buildTicks() {
    const _____tickOptions = this.options;
    const valueRange = calculateValueRange(
      {
        min: this._userMin,
        max: this._userMax,
      },
      this,
    );
    if (_____tickOptions.bounds === "ticks") {
      _animationHandler(valueRange, this, "value");
    }
    if (_____tickOptions.reverse) {
      valueRange.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return valueRange;
  }
  getLabelForValue(_____value) {
    if (_____value === undefined) {
      return "0";
    } else {
      return _isChartAnimationRunning(
        _____value,
        this.chart.options.locale,
        this.options.ticks.format,
      );
    }
  }
  configure() {
    const ____minValue = this.min;
    super.configure();
    this._startValue = ___animationManager(____minValue);
    this._valueRange =
      ___animationManager(this.max) - ___animationManager(____minValue);
  }
  getPixelForValue(_______pixelValue) {
    if (_______pixelValue === undefined || _______pixelValue === 0) {
      _______pixelValue = this.min;
    }
    if (_______pixelValue === null || isNaN(_______pixelValue)) {
      return NaN;
    } else {
      return this.getPixelForDecimal(
        _______pixelValue === this.min
          ? 0
          : (___animationManager(_______pixelValue) - this._startValue) /
              this._valueRange,
      );
    }
  }
  getValueForPixel(___pixelValue) {
    const _decimalValue = this.getDecimalForPixel(___pixelValue);
    return Math.pow(10, this._startValue + _decimalValue * this._valueRange);
  }
}
function calculateChartPadding(chartTicks) {
  const chartTicksObject = chartTicks.ticks;
  if (chartTicksObject.display && chartTicks.display) {
    const backdropPaddingHeight = __animationElement(
      chartTicksObject.backdropPadding,
    );
    return (
      chartAnimationRunning(
        chartTicksObject.font && chartTicksObject.font.size,
        animationDuration.font.size,
      ) + backdropPaddingHeight.height
    );
  }
  return 0;
}
function getChartDimensions(
  ______animationDuration,
  _____chartConfig,
  chartItem,
) {
  if (animatedChartItems(chartItem)) {
    chartItem = chartItem;
  } else {
    chartItem = [chartItem];
  }
  return {
    w: ____animationController(
      ______animationDuration,
      _____chartConfig.string,
      chartItem,
    ),
    h: chartItem.length * _____chartConfig.lineHeight,
  };
}
function calculateRange(
  _targetValue,
  referencePoint,
  __width,
  thresholdValue,
  boundaryValue,
) {
  if (_targetValue === thresholdValue || _targetValue === boundaryValue) {
    return {
      start: referencePoint - __width / 2,
      end: referencePoint + __width / 2,
    };
  } else if (_targetValue < thresholdValue || _targetValue > boundaryValue) {
    return {
      start: referencePoint - __width,
      end: referencePoint,
    };
  } else {
    return {
      start: referencePoint,
      end: referencePoint + __width,
    };
  }
}
function generateChartPointLabels(____chartData) {
  const _______boundingBox = {
    l: ____chartData.left + ____chartData._padding.left,
    r: ____chartData.right - ____chartData._padding.right,
    t: ____chartData.top + ____chartData._padding.top,
    b: ____chartData.bottom - ____chartData._padding.bottom,
  };
  const ________boundingBox = Object.assign({}, _______boundingBox);
  const pointLabelDimensionsArray = [];
  const pointLabelPadding = [];
  const pointLabelCount = ____chartData._pointLabels.length;
  const pointLabelOptions = ____chartData.options.pointLabels;
  const offsetCenterPointLabel = pointLabelOptions.centerPointLabels
    ? notificationListener / pointLabelCount
    : 0;
  for (
    let currentPointIndex = 0;
    currentPointIndex < pointLabelCount;
    currentPointIndex++
  ) {
    const pointCount = pointLabelOptions.setContext(
      ____chartData.getPointLabelContext(currentPointIndex),
    );
    pointLabelPadding[currentPointIndex] = pointCount.padding;
    const __pointPosition = ____chartData.getPointPosition(
      currentPointIndex,
      ____chartData.drawingArea + pointLabelPadding[currentPointIndex],
      offsetCenterPointLabel,
    );
    const fontAnimationFrameId = requestAnimationFrame(pointCount.font);
    const pointLabelDimensions = getChartDimensions(
      ____chartData.ctx,
      fontAnimationFrameId,
      ____chartData._pointLabels[currentPointIndex],
    );
    pointLabelDimensionsArray[currentPointIndex] = pointLabelDimensions;
    const animationRefreshRateValue = animationRefreshRate(
      ____chartData.getIndexAngle(currentPointIndex) + offsetCenterPointLabel,
    );
    const roundedAnimationRefreshRate = Math.round(
      _____animationState(animationRefreshRateValue),
    );
    adjustBoundingBox(
      ________boundingBox,
      _______boundingBox,
      animationRefreshRateValue,
      calculateRange(
        roundedAnimationRefreshRate,
        __pointPosition.x,
        pointLabelDimensions.w,
        0,
        180,
      ),
      calculateRange(
        roundedAnimationRefreshRate,
        __pointPosition.y,
        pointLabelDimensions.h,
        90,
        270,
      ),
    );
  }
  ____chartData.setCenterPoint(
    _______boundingBox.l - ________boundingBox.l,
    ________boundingBox.r - _______boundingBox.r,
    _______boundingBox.t - ________boundingBox.t,
    ________boundingBox.b - _______boundingBox.b,
  );
  ____chartData._pointLabelItems = calculateLabelPositions(
    ____chartData,
    pointLabelDimensionsArray,
    pointLabelPadding,
  );
}
function adjustBoundingBox(
  __boundingBox,
  elementBounds,
  angleInRadians,
  ___boundingBox,
  adjustmentArea,
) {
  const sinAdjustmentFactor = Math.abs(Math.sin(angleInRadians));
  const cosineAdjustmentFactor = Math.abs(Math.cos(angleInRadians));
  let horizontalAdjustment = 0;
  let heightAdjustment = 0;
  if (___boundingBox.start < elementBounds.l) {
    horizontalAdjustment =
      (elementBounds.l - ___boundingBox.start) / sinAdjustmentFactor;
    __boundingBox.l = Math.min(
      __boundingBox.l,
      elementBounds.l - horizontalAdjustment,
    );
  } else if (___boundingBox.end > elementBounds.r) {
    horizontalAdjustment =
      (___boundingBox.end - elementBounds.r) / sinAdjustmentFactor;
    __boundingBox.r = Math.max(
      __boundingBox.r,
      elementBounds.r + horizontalAdjustment,
    );
  }
  if (adjustmentArea.start < elementBounds.t) {
    heightAdjustment =
      (elementBounds.t - adjustmentArea.start) / cosineAdjustmentFactor;
    __boundingBox.t = Math.min(
      __boundingBox.t,
      elementBounds.t - heightAdjustment,
    );
  } else if (adjustmentArea.end > elementBounds.b) {
    heightAdjustment =
      (adjustmentArea.end - elementBounds.b) / cosineAdjustmentFactor;
    __boundingBox.b = Math.max(
      __boundingBox.b,
      elementBounds.b + heightAdjustment,
    );
  }
}
function calculateDrawingPosition(
  drawingObject,
  pointIndex,
  drawingProperties,
) {
  const drawingArea = drawingObject.drawingArea;
  const {
    extra: extraPadding,
    additionalAngle: additionalRotationAngle,
    padding: _paddingValue,
    size: sizeDimensions,
  } = drawingProperties;
  const ___pointPosition = drawingObject.getPointPosition(
    pointIndex,
    drawingArea + extraPadding + _paddingValue,
    additionalRotationAngle,
  );
  const roundedAnimationState = Math.round(
    _____animationState(
      animationRefreshRate(___pointPosition.angle + currentFrameTimestamp),
    ),
  );
  const adjustedYCoordinate = adjustedValue(
    ___pointPosition.y,
    sizeDimensions.h,
    roundedAnimationState,
  );
  const __textAlignment = getAlignmentPosition(roundedAnimationState);
  const adjustedLeftPosition = _adjustedPosition(
    ___pointPosition.x,
    sizeDimensions.w,
    __textAlignment,
  );
  return {
    visible: true,
    x: ___pointPosition.x,
    y: adjustedYCoordinate,
    textAlign: __textAlignment,
    left: adjustedLeftPosition,
    top: adjustedYCoordinate,
    right: adjustedLeftPosition + sizeDimensions.w,
    bottom: adjustedYCoordinate + sizeDimensions.h,
  };
}
function _________________________________chartData(
  rectangleDimensions,
  ________________chartData,
) {
  if (!________________chartData) {
    return true;
  }
  const {
    left: rectangleLeft,
    top: _topPosition,
    right: rightEdge,
    bottom: bottomCoordinate,
  } = rectangleDimensions;
  return (
    !chartUpdater(
      {
        x: rectangleLeft,
        y: _topPosition,
      },
      ________________chartData,
    ) &&
    !chartUpdater(
      {
        x: rectangleLeft,
        y: bottomCoordinate,
      },
      ________________chartData,
    ) &&
    !chartUpdater(
      {
        x: rightEdge,
        y: _topPosition,
      },
      ________________chartData,
    ) &&
    !chartUpdater(
      {
        x: rightEdge,
        y: bottomCoordinate,
      },
      ________________chartData,
    )
  );
}
function calculateLabelPositions(
  __________chartData,
  pointLabelSizes,
  _labelPadding,
) {
  const labelPositions = [];
  const _numberOfPointLabels = __________chartData._pointLabels.length;
  const ________________________________________________________________index =
    __________chartData.options;
  const {
    centerPointLabels: shouldCenterPointLabels,
    display: _displayOption,
  } =
    ________________________________________________________________index.pointLabels;
  const labelPositionConfig = {
    extra:
      calculateChartPadding(
        ________________________________________________________________index,
      ) / 2,
    additionalAngle: shouldCenterPointLabels
      ? notificationListener / _numberOfPointLabels
      : 0,
  };
  let lastVisibleLabelPoint;
  for (
    let ____labelIndex = 0;
    ____labelIndex < _numberOfPointLabels;
    ____labelIndex++
  ) {
    labelPositionConfig.padding = _labelPadding[____labelIndex];
    labelPositionConfig.size = pointLabelSizes[____labelIndex];
    const labelPoint = calculateDrawingPosition(
      __________chartData,
      ____labelIndex,
      labelPositionConfig,
    );
    labelPositions.push(labelPoint);
    if (_displayOption === "auto") {
      labelPoint.visible = _________________________________chartData(
        labelPoint,
        lastVisibleLabelPoint,
      );
      if (labelPoint.visible) {
        lastVisibleLabelPoint = labelPoint;
      }
    }
  }
  return labelPositions;
}
function getAlignmentPosition(angleInDegrees) {
  if (angleInDegrees === 0 || angleInDegrees === 180) {
    return "center";
  } else if (angleInDegrees < 180) {
    return "left";
  } else {
    return "right";
  }
}
function _adjustedPosition(positionOffset, ___offsetValue, alignmentPosition) {
  if (alignmentPosition === "right") {
    positionOffset -= ___offsetValue;
  } else if (alignmentPosition === "center") {
    positionOffset -= ___offsetValue / 2;
  }
  return positionOffset;
}
function adjustedValue(adjustedPosition, __offsetValue, angleDegrees) {
  if (angleDegrees === 90 || angleDegrees === 270) {
    adjustedPosition -= __offsetValue / 2;
  } else if (angleDegrees > 270 || angleDegrees < 90) {
    adjustedPosition -= __offsetValue;
  }
  return adjustedPosition;
}
function drawChartBackdrop(____canvasContext, chartOptions, _boundingBox) {
  const {
    left: boundingBoxLeft,
    top: ___topPosition,
    right: rightBound,
    bottom: _rectangleHeight,
  } = _boundingBox;
  const { backdropColor: backdropColor } = chartOptions;
  if (!chartUpdateInterval(backdropColor)) {
    const borderRadiusValue = elementBorderRadius(chartOptions.borderRadius);
    const animationPadding = __animationElement(chartOptions.backdropPadding);
    ____canvasContext.fillStyle = backdropColor;
    const leftMarginAdjusted = boundingBoxLeft - animationPadding.left;
    const topLeftY = ___topPosition - animationPadding.top;
    const rectWidth = rightBound - boundingBoxLeft + animationPadding.width;
    const rectangleHeight =
      _rectangleHeight - ___topPosition + animationPadding.height;
    if (Object.values(borderRadiusValue).some((isNotZero) => isNotZero !== 0)) {
      ____canvasContext.beginPath();
      ___animationController(____canvasContext, {
        x: leftMarginAdjusted,
        y: topLeftY,
        w: rectWidth,
        h: rectangleHeight,
        radius: borderRadiusValue,
      });
      ____canvasContext.fill();
    } else {
      ____canvasContext.fillRect(
        leftMarginAdjusted,
        topLeftY,
        rectWidth,
        rectangleHeight,
      );
    }
  }
}
function drawChartWithPointLabels(_________chartData, numberOfPointLabels) {
  const {
    ctx: _chartContext,
    options: { pointLabels: pointLabelStyle },
  } = _________chartData;
  for (
    let ____pointLabelIndex = numberOfPointLabels - 1;
    ____pointLabelIndex >= 0;
    ____pointLabelIndex--
  ) {
    const pointLabelItem =
      _________chartData._pointLabelItems[____pointLabelIndex];
    if (!pointLabelItem.visible) {
      continue;
    }
    const _pointLabelContext = pointLabelStyle.setContext(
      _________chartData.getPointLabelContext(____pointLabelIndex),
    );
    drawChartBackdrop(_chartContext, _pointLabelContext, pointLabelItem);
    const animationFrameId = requestAnimationFrame(_pointLabelContext.font);
    const {
      x: pointLabelXCoordinate,
      y: labelYPosition,
      textAlign: _textAlignment,
    } = pointLabelItem;
    ___lastDateUpdated(
      _chartContext,
      _________chartData._pointLabels[____pointLabelIndex],
      pointLabelXCoordinate,
      labelYPosition + animationFrameId.lineHeight / 2,
      animationFrameId,
      {
        color: _pointLabelContext.color,
        textAlign: _textAlignment,
        textBaseline: "middle",
      },
    );
  }
}
function drawCircle(circleParameters, radius, shouldAnimate, numSegments) {
  const { ctx: _______________________canvasContext } = circleParameters;
  if (shouldAnimate) {
    _______________________canvasContext.arc(
      circleParameters.xCenter,
      circleParameters.yCenter,
      radius,
      0,
      lastAnimationUpdateTimestamp,
    );
  } else {
    let segmentPoint = circleParameters.getPointPosition(0, radius);
    _______________________canvasContext.moveTo(segmentPoint.x, segmentPoint.y);
    for (let _segmentIndex = 1; _segmentIndex < numSegments; _segmentIndex++) {
      segmentPoint = circleParameters.getPointPosition(_segmentIndex, radius);
      _______________________canvasContext.lineTo(
        segmentPoint.x,
        segmentPoint.y,
      );
    }
  }
}
function drawShapeWithStroke(
  graphicsContext,
  shapeOptions,
  lineDashOffset,
  isStrokeEnabled,
  lineDashProperties,
) {
  const __graphicsContext = graphicsContext.ctx;
  const isCircularShape = shapeOptions.circular;
  const { color: _strokeColor, lineWidth: __lineWidth } = shapeOptions;
  if (
    (!!isCircularShape || !!isStrokeEnabled) &&
    !!_strokeColor &&
    !!__lineWidth &&
    !(lineDashOffset < 0)
  ) {
    __graphicsContext.save();
    __graphicsContext.strokeStyle = _strokeColor;
    __graphicsContext.lineWidth = __lineWidth;
    __graphicsContext.setLineDash(lineDashProperties.dash);
    __graphicsContext.lineDashOffset = lineDashProperties.dashOffset;
    __graphicsContext.beginPath();
    drawCircle(
      graphicsContext,
      lineDashOffset,
      isCircularShape,
      isStrokeEnabled,
    );
    __graphicsContext.closePath();
    __graphicsContext.stroke();
    __graphicsContext.restore();
  }
}
function _tooltipHandlerFunction(
  tooltipPointLabel,
  pointLabelIndex,
  _pointLabelIndex,
) {
  return tooltipHandler(tooltipPointLabel, {
    label: _pointLabelIndex,
    index: pointLabelIndex,
    type: "pointLabel",
  });
}
class RadialLinearScale extends ScaleAdapter {
  static id = "radialLinear";
  static defaults = {
    display: true,
    animate: true,
    position: "chartArea",
    angleLines: {
      display: true,
      lineWidth: 1,
      borderDash: [],
      borderDashOffset: 0,
    },
    grid: {
      circular: false,
    },
    startAngle: 0,
    ticks: {
      showLabelBackdrop: true,
      callback: tooltipActiveElements.formatters.numeric,
    },
    pointLabels: {
      backdropColor: undefined,
      backdropPadding: 2,
      display: true,
      font: {
        size: 10,
      },
      callback: (transformFunction) => transformFunction,
      padding: 5,
      centerPointLabels: false,
    },
  };
  static defaultRoutes = {
    "angleLines.color": "borderColor",
    "pointLabels.color": "color",
    "ticks.color": "color",
  };
  static descriptors = {
    angleLines: {
      _fallback: "grid",
    },
  };
  constructor(constructorParam) {
    super(constructorParam);
    this.xCenter = undefined;
    this.yCenter = undefined;
    this.drawingArea = undefined;
    this._pointLabels = [];
    this._pointLabelItems = [];
  }
  setDimensions() {
    const chartPadding = (this._padding = __animationElement(
      calculateChartPadding(this.options) / 2,
    ));
    const ____chartWidth = (this.width = this.maxWidth - chartPadding.width);
    const _chartHeight = (this.height = this.maxHeight - chartPadding.height);
    this.xCenter = Math.floor(
      this.left + ____chartWidth / 2 + chartPadding.left,
    );
    this.yCenter = Math.floor(this.top + _chartHeight / 2 + chartPadding.top);
    this.drawingArea = Math.floor(Math.min(____chartWidth, _chartHeight) / 2);
  }
  determineDataLimits() {
    const { min: ______minValue, max: _____maxValue } = this.getMinMax(false);
    this.min =
      chartUpdateTrigger(______minValue) && !isNaN(______minValue)
        ? ______minValue
        : 0;
    this.max =
      chartUpdateTrigger(_____maxValue) && !isNaN(_____maxValue)
        ? _____maxValue
        : 0;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / calculateChartPadding(this.options));
  }
  generateTickLabels(tickInterval) {
    ScaleAdapter.prototype.generateTickLabels.call(this, tickInterval);
    this._pointLabels = this.getLabels()
      .map((pointLabelValue, _pointLabelValue) => {
        const pointLabelCallbackResult = ________animationContext(
          this.options.pointLabels.callback,
          [pointLabelValue, _pointLabelValue],
          this,
        );
        if (pointLabelCallbackResult || pointLabelCallbackResult === 0) {
          return pointLabelCallbackResult;
        } else {
          return "";
        }
      })
      .filter((dataVisibility, dataVisibilityIndex) =>
        this.chart.getDataVisibility(dataVisibilityIndex),
      );
  }
  fit() {
    const ___________options = this.options;
    if (___________options.display && ___________options.pointLabels.display) {
      generateChartPointLabels(this);
    } else {
      this.setCenterPoint(0, 0, 0, 0);
    }
  }
  setCenterPoint(newCenterX, oldCenterX, newCenterY, _centerPointY) {
    this.xCenter += Math.floor((newCenterX - oldCenterX) / 2);
    this.yCenter += Math.floor((newCenterY - _centerPointY) / 2);
    this.drawingArea -= Math.min(
      this.drawingArea / 2,
      Math.max(newCenterX, oldCenterX, newCenterY, _centerPointY),
    );
  }
  getIndexAngle(_timeElapsed) {
    const animationUpdateRatio =
      lastAnimationUpdateTimestamp / (this._pointLabels.length || 1);
    const _startAngle = this.options.startAngle || 0;
    return animationRefreshRate(
      _timeElapsed * animationUpdateRatio + requestAnimation(_startAngle),
    );
  }
  getDistanceFromCenterForValue(valueForDistanceCalculation) {
    if (chartUpdateInterval(valueForDistanceCalculation)) {
      return NaN;
    }
    const ____scaleFactor = this.drawingArea / (this.max - this.min);
    if (this.options.reverse) {
      return (this.max - valueForDistanceCalculation) * ____scaleFactor;
    } else {
      return (valueForDistanceCalculation - this.min) * ____scaleFactor;
    }
  }
  getValueForDistanceFromCenter(___distanceFromCenter) {
    if (chartUpdateInterval(___distanceFromCenter)) {
      return NaN;
    }
    const normalizedDistance =
      ___distanceFromCenter / (this.drawingArea / (this.max - this.min));
    if (this.options.reverse) {
      return this.max - normalizedDistance;
    } else {
      return this.min + normalizedDistance;
    }
  }
  getPointLabelContext(__pointLabelIndex) {
    const pointLabels = this._pointLabels || [];
    if (__pointLabelIndex >= 0 && __pointLabelIndex < pointLabels.length) {
      const pointLabel = pointLabels[__pointLabelIndex];
      return _tooltipHandlerFunction(
        this.getContext(),
        __pointLabelIndex,
        pointLabel,
      );
    }
  }
  getPointPosition(____timestamp, __radius, _offsetAngle = 0) {
    const angleFromIndex =
      this.getIndexAngle(____timestamp) - currentFrameTimestamp + _offsetAngle;
    return {
      x: Math.cos(angleFromIndex) * __radius + this.xCenter,
      y: Math.sin(angleFromIndex) * __radius + this.yCenter,
      angle: angleFromIndex,
    };
  }
  getPointPositionForValue(valuePosition, ___value) {
    return this.getPointPosition(
      valuePosition,
      this.getDistanceFromCenterForValue(___value),
    );
  }
  getBasePosition(___________________inputValue) {
    return this.getPointPositionForValue(
      ___________________inputValue || 0,
      this.getBaseValue(),
    );
  }
  getPointLabelPosition(___pointLabelIndex) {
    const {
      left: pointLabelLeft,
      top: pointLabelTop,
      right: pointLabelRight,
      bottom: pointLabelBottom,
    } = this._pointLabelItems[___pointLabelIndex];
    return {
      left: pointLabelLeft,
      top: pointLabelTop,
      right: pointLabelRight,
      bottom: pointLabelBottom,
    };
  }
  drawBackground() {
    const {
      backgroundColor: _backgroundColor,
      grid: { circular: circleGrid },
    } = this.options;
    if (_backgroundColor) {
      const ________canvasContext = this.ctx;
      ________canvasContext.save();
      ________canvasContext.beginPath();
      drawCircle(
        this,
        this.getDistanceFromCenterForValue(this._endValue),
        circleGrid,
        this._pointLabels.length,
      );
      ________canvasContext.closePath();
      ________canvasContext.fillStyle = _backgroundColor;
      ________canvasContext.fill();
      ________canvasContext.restore();
    }
  }
  drawGrid() {
    const __________________________________________canvasContext = this.ctx;
    const ___gridOptions = this.options;
    const {
      angleLines: angleLinesOptions,
      grid: ____gridOptions,
      border: __borderOptions,
    } = ___gridOptions;
    const _pointLabelCount = this._pointLabels.length;
    let _____currentIndex;
    let ____distanceFromCenter;
    let pointLabelPosition;
    if (___gridOptions.pointLabels.display) {
      drawChartWithPointLabels(this, _pointLabelCount);
    }
    if (____gridOptions.display) {
      this.ticks.forEach((_value, contextValue) => {
        if (contextValue !== 0) {
          ____distanceFromCenter = this.getDistanceFromCenterForValue(
            _value.value,
          );
          const _contextValue = this.getContext(contextValue);
          const __contextSettings = ____gridOptions.setContext(_contextValue);
          const dataContext = __borderOptions.setContext(_contextValue);
          drawShapeWithStroke(
            this,
            __contextSettings,
            ____distanceFromCenter,
            _pointLabelCount,
            dataContext,
          );
        }
      });
    }
    if (angleLinesOptions.display) {
      __________________________________________canvasContext.save();
      _____currentIndex = _pointLabelCount - 1;
      for (; _____currentIndex >= 0; _____currentIndex--) {
        const pointLabelContext = angleLinesOptions.setContext(
          this.getPointLabelContext(_____currentIndex),
        );
        const { color: strokeColor, lineWidth: _lineWidth } = pointLabelContext;
        if (_lineWidth && strokeColor) {
          __________________________________________canvasContext.lineWidth =
            _lineWidth;
          __________________________________________canvasContext.strokeStyle =
            strokeColor;
          __________________________________________canvasContext.setLineDash(
            pointLabelContext.borderDash,
          );
          __________________________________________canvasContext.lineDashOffset =
            pointLabelContext.borderDashOffset;
          ____distanceFromCenter = this.getDistanceFromCenterForValue(
            ___gridOptions.ticks.reverse ? this.min : this.max,
          );
          pointLabelPosition = this.getPointPosition(
            _____currentIndex,
            ____distanceFromCenter,
          );
          __________________________________________canvasContext.beginPath();
          __________________________________________canvasContext.moveTo(
            this.xCenter,
            this.yCenter,
          );
          __________________________________________canvasContext.lineTo(
            pointLabelPosition.x,
            pointLabelPosition.y,
          );
          __________________________________________canvasContext.stroke();
        }
      }
      __________________________________________canvasContext.restore();
    }
  }
  drawBorder() {}
  drawLabels() {
    const _______________________________________canvasContext = this.ctx;
    const ____________________chartOptions = this.options;
    const _ticksOptions = ____________________chartOptions.ticks;
    if (!_ticksOptions.display) {
      return;
    }
    const labelRotationAngle = this.getIndexAngle(0);
    let distanceFromCenter;
    let labelWidth;
    _______________________________________canvasContext.save();
    _______________________________________canvasContext.translate(
      this.xCenter,
      this.yCenter,
    );
    _______________________________________canvasContext.rotate(
      labelRotationAngle,
    );
    _______________________________________canvasContext.textAlign = "center";
    _______________________________________canvasContext.textBaseline =
      "middle";
    this.ticks.forEach((label, ____index) => {
      if (____index === 0 && !____________________chartOptions.reverse) {
        return;
      }
      const contextualRenderer = _ticksOptions.setContext(
        this.getContext(____index),
      );
      const animationFrameData = requestAnimationFrame(contextualRenderer.font);
      distanceFromCenter = this.getDistanceFromCenterForValue(
        this.ticks[____index].value,
      );
      if (contextualRenderer.showLabelBackdrop) {
        _______________________________________canvasContext.font =
          animationFrameData.string;
        labelWidth =
          _______________________________________canvasContext.measureText(
            label.label,
          ).width;
        _______________________________________canvasContext.fillStyle =
          contextualRenderer.backdropColor;
        const backdropPadding = __animationElement(
          contextualRenderer.backdropPadding,
        );
        _______________________________________canvasContext.fillRect(
          -labelWidth / 2 - backdropPadding.left,
          -distanceFromCenter -
            animationFrameData.size / 2 -
            backdropPadding.top,
          labelWidth + backdropPadding.width,
          animationFrameData.size + backdropPadding.height,
        );
      }
      ___lastDateUpdated(
        _______________________________________canvasContext,
        label.label,
        0,
        -distanceFromCenter,
        animationFrameData,
        {
          color: contextualRenderer.color,
          strokeColor: contextualRenderer.textStrokeColor,
          strokeWidth: contextualRenderer.textStrokeWidth,
        },
      );
    });
    _______________________________________canvasContext.restore();
  }
  drawTitle() {}
}
const timeScaleConfig = {
  millisecond: {
    common: true,
    size: 1,
    steps: 1000,
  },
  second: {
    common: true,
    size: 1000,
    steps: 60,
  },
  minute: {
    common: true,
    size: 60000,
    steps: 60,
  },
  hour: {
    common: true,
    size: 3600000,
    steps: 24,
  },
  day: {
    common: true,
    size: 86400000,
    steps: 30,
  },
  week: {
    common: false,
    size: 604800000,
    steps: 4,
  },
  month: {
    common: true,
    size: 2628000000,
    steps: 12,
  },
  quarter: {
    common: false,
    size: 7884000000,
    steps: 4,
  },
  year: {
    common: true,
    size: 31540000000,
  },
};
const timeScaleKeys = Object.keys(timeScaleConfig);
function subtractValues(difference, subtractorValue) {
  return difference - subtractorValue;
}
function transformInputValue(dataObject, inputValue) {
  if (chartUpdateInterval(inputValue)) {
    return null;
  }
  const dataAdapter = dataObject._adapter;
  const {
    parser: inputParser,
    round: roundingUnit,
    isoWeekday: isoWeekdayOption,
  } = dataObject._parseOpts;
  let transformedInputValue = inputValue;
  if (typeof inputParser == "function") {
    transformedInputValue = inputParser(transformedInputValue);
  }
  if (!chartUpdateTrigger(transformedInputValue)) {
    if (typeof inputParser == "string") {
      transformedInputValue = dataAdapter.parse(
        transformedInputValue,
        inputParser,
      );
    } else {
      transformedInputValue = dataAdapter.parse(transformedInputValue);
    }
  }
  if (transformedInputValue === null) {
    return null;
  } else {
    if (roundingUnit) {
      if (
        roundingUnit !== "week" ||
        (!requestId(isoWeekdayOption) && isoWeekdayOption !== true)
      ) {
        transformedInputValue = dataAdapter.startOf(
          transformedInputValue,
          roundingUnit,
        );
      } else {
        transformedInputValue = dataAdapter.startOf(
          transformedInputValue,
          "isoWeek",
          isoWeekdayOption,
        );
      }
    }
    return +transformedInputValue;
  }
}
function getNextTimeScale(
  currentTimeScale,
  _startValue,
  _currentTime,
  maxStepsAllowed,
) {
  const totalTimeScaleKeys = timeScaleKeys.length;
  for (
    let currentTimeScaleIndex = timeScaleKeys.indexOf(currentTimeScale);
    currentTimeScaleIndex < totalTimeScaleKeys - 1;
    ++currentTimeScaleIndex
  ) {
    const currentTimeScaleConfig =
      timeScaleConfig[timeScaleKeys[currentTimeScaleIndex]];
    const maxStepsInTimeScale = currentTimeScaleConfig.steps
      ? currentTimeScaleConfig.steps
      : Number.MAX_SAFE_INTEGER;
    if (
      currentTimeScaleConfig.common &&
      Math.ceil(
        (_currentTime - _startValue) /
          (maxStepsInTimeScale * currentTimeScaleConfig.size),
      ) <= maxStepsAllowed
    ) {
      return timeScaleKeys[currentTimeScaleIndex];
    }
  }
  return timeScaleKeys[totalTimeScaleKeys - 1];
}
function findMatchingTimeScale(
  timeDifferenceThreshold,
  _timeDifferenceThreshold,
  indexOfTimeScale,
  referenceTime,
  _thresholdValue,
) {
  for (
    let ______________________________________________________currentIndex =
      timeScaleKeys.length - 1;
    ______________________________________________________currentIndex >=
    timeScaleKeys.indexOf(indexOfTimeScale);
    ______________________________________________________currentIndex--
  ) {
    const _currentTimeScale =
      timeScaleKeys[
        ______________________________________________________currentIndex
      ];
    if (
      timeScaleConfig[_currentTimeScale].common &&
      timeDifferenceThreshold._adapter.diff(
        _thresholdValue,
        referenceTime,
        _currentTimeScale,
      ) >=
        _timeDifferenceThreshold - 1
    ) {
      return _currentTimeScale;
    }
  }
  return timeScaleKeys[
    indexOfTimeScale ? timeScaleKeys.indexOf(indexOfTimeScale) : 0
  ];
}
function findNextCommonTimeScaleKey(__targetValue) {
  for (
    let nextTimeScaleIndex = timeScaleKeys.indexOf(__targetValue) + 1,
      ______endIndex = timeScaleKeys.length;
    nextTimeScaleIndex < ______endIndex;
    ++nextTimeScaleIndex
  ) {
    if (timeScaleConfig[timeScaleKeys[nextTimeScaleIndex]].common) {
      return timeScaleKeys[nextTimeScaleIndex];
    }
  }
}
function updateAnimationState(
  targetAnimationState,
  _____animationDuration,
  animationIndices,
) {
  if (animationIndices) {
    if (animationIndices.length) {
      const { lo: lowestAnimationIndex, hi: _highIndex } = _animationQueue(
        animationIndices,
        _____animationDuration,
      );
      targetAnimationState[
        animationIndices[lowestAnimationIndex] >= _____animationDuration
          ? animationIndices[lowestAnimationIndex]
          : animationIndices[_highIndex]
      ] = true;
    }
  } else {
    targetAnimationState[_____animationDuration] = true;
  }
}
function calculateMajorIntervals(
  calendarAdapter,
  eventValues,
  ________________currentIndex,
  timeUnit,
) {
  const calendarAdapterInstance = calendarAdapter._adapter;
  const startOfFirstEvent = +calendarAdapterInstance.startOf(
    eventValues[0].value,
    timeUnit,
  );
  const lastEventValue = eventValues[eventValues.length - 1].value;
  let __currentTime;
  let currentIndexValue;
  for (
    __currentTime = startOfFirstEvent;
    __currentTime <= lastEventValue;
    __currentTime = +calendarAdapterInstance.add(__currentTime, 1, timeUnit)
  ) {
    currentIndexValue = ________________currentIndex[__currentTime];
    if (currentIndexValue >= 0) {
      eventValues[currentIndexValue].major = true;
    }
  }
  return eventValues;
}
function inputArrayElement(
  arrayToProcess,
  _______inputArray,
  _____________index,
) {
  const processedElements = [];
  const elementIndexMap = {};
  const ______inputArrayLength = _______inputArray.length;
  let __________________________________________________currentIndex;
  let _________________inputValue;
  for (
    __________________________________________________currentIndex = 0;
    __________________________________________________currentIndex <
    ______inputArrayLength;
    ++__________________________________________________currentIndex
  ) {
    _________________inputValue =
      _______inputArray[
        __________________________________________________currentIndex
      ];
    elementIndexMap[_________________inputValue] =
      __________________________________________________currentIndex;
    processedElements.push({
      value: _________________inputValue,
      major: false,
    });
  }
  if (______inputArrayLength !== 0 && _____________index) {
    return calculateMajorIntervals(
      arrayToProcess,
      processedElements,
      elementIndexMap,
      _____________index,
    );
  } else {
    return processedElements;
  }
}
class TimeScale extends ChartAxisController {
  static id = "time";
  static defaults = {
    bounds: "data",
    adapters: {},
    time: {
      parser: false,
      unit: false,
      round: false,
      isoWeekday: false,
      minUnit: "millisecond",
      displayFormats: {},
    },
    ticks: {
      source: "auto",
      callback: false,
      major: {
        enabled: false,
      },
    },
  };
  constructor(_constructorParam) {
    super(_constructorParam);
    this._cache = {
      data: [],
      labels: [],
      all: [],
    };
    this._unit = "day";
    this._majorUnit = undefined;
    this._offsets = {};
    this._normalized = false;
    this._parseOpts = undefined;
  }
  init(timeData, __options = {}) {
    const _timeOptions = (timeData.time ||= {});
    const dateAdapter = (this._adapter = new ___animationInstance._date(
      timeData.adapters.date,
    ));
    dateAdapter.init(__options);
    lastUpdateDate(_timeOptions.displayFormats, dateAdapter.formats());
    this._parseOpts = {
      parser: _timeOptions.parser,
      round: _timeOptions.round,
      isoWeekday: _timeOptions.isoWeekday,
    };
    super.init(timeData);
    this._normalized = __options.normalized;
  }
  parse(____________________inputValue, _____________________inputValue) {
    if (____________________inputValue === undefined) {
      return null;
    } else {
      return transformInputValue(this, ____________________inputValue);
    }
  }
  beforeLayout() {
    super.beforeLayout();
    this._cache = {
      data: [],
      labels: [],
      all: [],
    };
  }
  determineDataLimits() {
    const ___________________________options = this.options;
    const _dateAdapter = this._adapter;
    const __timeUnit = ___________________________options.time.unit || "day";
    let {
      min: minBoundary,
      max: _maxBoundary,
      minDefined: isMinMaxUpdated,
      maxDefined: isMaxValuePresent,
    } = this.getUserBounds();
    function updateMinMaxValues(minMax) {
      if (!isMinMaxUpdated && !isNaN(minMax.min)) {
        minBoundary = Math.min(minBoundary, minMax.min);
      }
      if (!isMaxValuePresent && !isNaN(minMax.max)) {
        _maxBoundary = Math.max(_maxBoundary, minMax.max);
      }
    }
    if (!isMinMaxUpdated || !isMaxValuePresent) {
      updateMinMaxValues(this._getLabelBounds());
      if (
        ___________________________options.bounds !== "ticks" ||
        ___________________________options.ticks.source !== "labels"
      ) {
        updateMinMaxValues(this.getMinMax(false));
      }
    }
    if (chartUpdateTrigger(minBoundary) && !isNaN(minBoundary)) {
      minBoundary = minBoundary;
    } else {
      minBoundary = +_dateAdapter.startOf(Date.now(), __timeUnit);
    }
    if (chartUpdateTrigger(_maxBoundary) && !isNaN(_maxBoundary)) {
      _maxBoundary = _maxBoundary;
    } else {
      _maxBoundary = +_dateAdapter.endOf(Date.now(), __timeUnit) + 1;
    }
    this.min = Math.min(minBoundary, _maxBoundary - 1);
    this.max = Math.max(minBoundary + 1, _maxBoundary);
  }
  _getLabelBounds() {
    const labelTimestamps = this.getLabelTimestamps();
    let minLabelTimestamp = Number.POSITIVE_INFINITY;
    let maxLabelTimestamp = Number.NEGATIVE_INFINITY;
    if (labelTimestamps.length) {
      minLabelTimestamp = labelTimestamps[0];
      maxLabelTimestamp = labelTimestamps[labelTimestamps.length - 1];
    }
    return {
      min: minLabelTimestamp,
      max: maxLabelTimestamp,
    };
  }
  buildTicks() {
    const _______optionsConfig = this.options;
    const timeConfig = _______optionsConfig.time;
    const ________tickOptions = _______optionsConfig.ticks;
    const timestampSource =
      ________tickOptions.source === "labels"
        ? this.getLabelTimestamps()
        : this._generate();
    if (_______optionsConfig.bounds === "ticks" && timestampSource.length) {
      this.min = this._userMin || timestampSource[0];
      this.max = this._userMax || timestampSource[timestampSource.length - 1];
    }
    const _minTimestamp = this.min;
    const _maxTimestamp = this.max;
    const ___chartAnimationQueue = _chartAnimationQueue(
      timestampSource,
      _minTimestamp,
      _maxTimestamp,
    );
    this._unit =
      timeConfig.unit ||
      (________tickOptions.autoSkip
        ? getNextTimeScale(
            timeConfig.minUnit,
            this.min,
            this.max,
            this._getLabelCapacity(_minTimestamp),
          )
        : findMatchingTimeScale(
            this,
            ___chartAnimationQueue.length,
            timeConfig.minUnit,
            this.min,
            this.max,
          ));
    this._majorUnit =
      ________tickOptions.major.enabled && this._unit !== "year"
        ? findNextCommonTimeScaleKey(this._unit)
        : undefined;
    this.initOffsets(timestampSource);
    if (_______optionsConfig.reverse) {
      ___chartAnimationQueue.reverse();
    }
    return inputArrayElement(this, ___chartAnimationQueue, this._majorUnit);
  }
  afterAutoSkip() {
    if (this.options.offsetAfterAutoskip) {
      this.initOffsets(this.ticks.map((valueAsNumber) => +valueAsNumber.value));
    }
  }
  initOffsets(offsetValues = []) {
    let initialOffset;
    let lastOffsetValue;
    let calculatedStartOffset = 0;
    let endOffset = 0;
    if (this.options.offset && offsetValues.length) {
      initialOffset = this.getDecimalForValue(offsetValues[0]);
      if (offsetValues.length === 1) {
        calculatedStartOffset = 1 - initialOffset;
      } else {
        calculatedStartOffset =
          (this.getDecimalForValue(offsetValues[1]) - initialOffset) / 2;
      }
      lastOffsetValue = this.getDecimalForValue(
        offsetValues[offsetValues.length - 1],
      );
      if (offsetValues.length === 1) {
        endOffset = lastOffsetValue;
      } else {
        endOffset =
          (lastOffsetValue -
            this.getDecimalForValue(offsetValues[offsetValues.length - 2])) /
          2;
      }
    }
    const animationFactor = offsetValues.length < 3 ? 0.5 : 0.25;
    calculatedStartOffset = chartAnimationState(
      calculatedStartOffset,
      0,
      animationFactor,
    );
    endOffset = chartAnimationState(endOffset, 0, animationFactor);
    this._offsets = {
      start: calculatedStartOffset,
      end: endOffset,
      factor: 1 / (calculatedStartOffset + 1 + endOffset),
    };
  }
  _generate() {
    const _numericValue = this._adapter;
    const ___________minValue = this.min;
    const _____________maxValue = this.max;
    const ___________________chartOptions = this.options;
    const timeScaleOptions = ___________________chartOptions.time;
    const ____timeUnit =
      timeScaleOptions.unit ||
      getNextTimeScale(
        timeScaleOptions.minUnit,
        ___________minValue,
        _____________maxValue,
        this._getLabelCapacity(___________minValue),
      );
    const _chartAnimationDuration = chartAnimationRunning(
      ___________________chartOptions.ticks.stepSize,
      1,
    );
    const isTimeUnitWeekAndIsoWeekday =
      ____timeUnit === "week" && timeScaleOptions.isoWeekday;
    const isRequestIdValid =
      requestId(isTimeUnitWeekAndIsoWeekday) ||
      isTimeUnitWeekAndIsoWeekday === true;
    const __animationStates = {};
    let currentAnimationValue;
    let _indexCounter;
    let currentDateValue = ___________minValue;
    if (isRequestIdValid) {
      currentDateValue = +_numericValue.startOf(
        currentDateValue,
        "isoWeek",
        isTimeUnitWeekAndIsoWeekday,
      );
    }
    currentDateValue = +_numericValue.startOf(
      currentDateValue,
      isRequestIdValid ? "day" : ____timeUnit,
    );
    if (
      _numericValue.diff(
        _____________maxValue,
        ___________minValue,
        ____timeUnit,
      ) >
      _chartAnimationDuration * 100000
    ) {
      throw new Error(
        ___________minValue +
          " and " +
          _____________maxValue +
          " are too far apart with stepSize of " +
          _chartAnimationDuration +
          " " +
          ____timeUnit,
      );
    }
    const dataSourceTicks =
      ___________________chartOptions.ticks.source === "data" &&
      this.getDataTimestamps();
    currentAnimationValue = currentDateValue;
    _indexCounter = 0;
    currentAnimationValue = +_numericValue.add(
      currentAnimationValue,
      _chartAnimationDuration,
      ____timeUnit,
    );
    for (; currentAnimationValue < _____________maxValue; _indexCounter++) {
      updateAnimationState(
        __animationStates,
        currentAnimationValue,
        dataSourceTicks,
      );
    }
    if (
      currentAnimationValue === _____________maxValue ||
      ___________________chartOptions.bounds === "ticks" ||
      _indexCounter === 1
    ) {
      updateAnimationState(
        __animationStates,
        currentAnimationValue,
        dataSourceTicks,
      );
    }
    return Object.keys(__animationStates)
      .sort(subtractValues)
      .map((numericValue) => +numericValue);
  }
  getLabelForValue(_____timestamp) {
    const adapter = this._adapter;
    const timeOptions = this.options.time;
    if (timeOptions.tooltipFormat) {
      return adapter.format(_____timestamp, timeOptions.tooltipFormat);
    } else {
      return adapter.format(
        _____timestamp,
        timeOptions.displayFormats.datetime,
      );
    }
  }
  format(___timestamp, displayFormat) {
    const displayFormatsOptions = this.options.time.displayFormats;
    const _timeUnit = this._unit;
    const formattedDisplay = displayFormat || displayFormatsOptions[_timeUnit];
    return this._adapter.format(___timestamp, formattedDisplay);
  }
  _tickFormatFunction(
    __tickValue,
    ___tickValue,
    _________tickIndex,
    tickValueFormat,
  ) {
    const _________________options = this.options;
    const tickCallback = _________________options.ticks.callback;
    if (tickCallback) {
      return ________animationContext(
        tickCallback,
        [__tickValue, ___tickValue, _________tickIndex],
        this,
      );
    }
    const timeDisplayFormats = _________________options.time.displayFormats;
    const currentUnit = this._unit;
    const majorTimeUnit = this._majorUnit;
    const currentUnitFormat = currentUnit && timeDisplayFormats[currentUnit];
    const currentUnitTimeFormat =
      majorTimeUnit && timeDisplayFormats[majorTimeUnit];
    const tickValueData = _________tickIndex[___tickValue];
    const isMajorTimeUnit =
      majorTimeUnit &&
      currentUnitTimeFormat &&
      tickValueData &&
      tickValueData.major;
    return this._adapter.format(
      __tickValue,
      tickValueFormat ||
        (isMajorTimeUnit ? currentUnitTimeFormat : currentUnitFormat),
    );
  }
  generateTickLabels(tickLabels) {
    let ______________________________currentIndex;
    let tickLabelCount;
    let tickLabel;
    ______________________________currentIndex = 0;
    tickLabelCount = tickLabels.length;
    for (
      ;
      ______________________________currentIndex < tickLabelCount;
      ++______________________________currentIndex
    ) {
      tickLabel = tickLabels[______________________________currentIndex];
      tickLabel.label = this._tickFormatFunction(
        tickLabel.value,
        ______________________________currentIndex,
        tickLabels,
      );
    }
  }
  getDecimalForValue(____value) {
    if (____value === null) {
      return NaN;
    } else {
      return (____value - this.min) / (this.max - this.min);
    }
  }
  getPixelForValue(valueToPixel) {
    const offsets = this._offsets;
    const __decimalValue = this.getDecimalForValue(valueToPixel);
    return this.getPixelForDecimal(
      (offsets.start + __decimalValue) * offsets.factor,
    );
  }
  getValueForPixel(____pixelValue) {
    const offsetData = this._offsets;
    const normalizedPixelValue =
      this.getDecimalForPixel(____pixelValue) / offsetData.factor -
      offsetData.end;
    return this.min + normalizedPixelValue * (this.max - this.min);
  }
  _getLabelSize(__labelText) {
    const ____tickOptions = this.options.ticks;
    const ___textWidth = this.ctx.measureText(__labelText).width;
    const rotationAngle = requestAnimation(
      this.isHorizontal()
        ? ____tickOptions.maxRotation
        : ____tickOptions.minRotation,
    );
    const cosineRotation = Math.cos(rotationAngle);
    const sinRotation = Math.sin(rotationAngle);
    const tickFontSize = this._resolveTickFontOptions(0).size;
    return {
      w: ___textWidth * cosineRotation + tickFontSize * sinRotation,
      h: ___textWidth * sinRotation + tickFontSize * cosineRotation,
    };
  }
  _getLabelCapacity(________labelIndex) {
    const __timeOptions = this.options.time;
    const displayFormats = __timeOptions.displayFormats;
    const _displayFormat =
      displayFormats[__timeOptions.unit] || displayFormats.millisecond;
    const formattedLabel = this._tickFormatFunction(
      ________labelIndex,
      0,
      inputArrayElement(this, [________labelIndex], this._majorUnit),
      _displayFormat,
    );
    const labelSize = this._getLabelSize(formattedLabel);
    const labelCapacity =
      Math.floor(
        this.isHorizontal()
          ? this.width / labelSize.w
          : this.height / labelSize.h,
      ) - 1;
    if (labelCapacity > 0) {
      return labelCapacity;
    } else {
      return 1;
    }
  }
  getDataTimestamps() {
    let ________________________________currentIndex;
    let visibleMetaCount;
    let cachedData = this._cache.data || [];
    if (cachedData.length) {
      return cachedData;
    }
    const visibleMetadatas = this.getMatchingVisibleMetas();
    if (this._normalized && visibleMetadatas.length) {
      return (this._cache.data =
        visibleMetadatas[0].controller.getAllParsedValues(this));
    }
    ________________________________currentIndex = 0;
    visibleMetaCount = visibleMetadatas.length;
    for (
      ;
      ________________________________currentIndex < visibleMetaCount;
      ++________________________________currentIndex
    ) {
      cachedData = cachedData.concat(
        visibleMetadatas[
          ________________________________currentIndex
        ].controller.getAllParsedValues(this),
      );
    }
    return (this._cache.data = this.normalize(cachedData));
  }
  getLabelTimestamps() {
    const _labelTimestamps = this._cache.labels || [];
    let ________________________________________currentIndex;
    let totalLabelsCount;
    if (_labelTimestamps.length) {
      return _labelTimestamps;
    }
    const labelList = this.getLabels();
    ________________________________________currentIndex = 0;
    totalLabelsCount = labelList.length;
    for (
      ;
      ________________________________________currentIndex < totalLabelsCount;
      ++________________________________________currentIndex
    ) {
      _labelTimestamps.push(
        transformInputValue(
          this,
          labelList[________________________________________currentIndex],
        ),
      );
    }
    return (this._cache.labels = this._normalized
      ? _labelTimestamps
      : this.normalize(_labelTimestamps));
  }
  normalize(valuesToNormalize) {
    return adapterFunctions(valuesToNormalize.sort(subtractValues));
  }
}
function calculateHorizontalRange(__dataPoints, position, isTimeBased) {
  let lowerBoundValue;
  let lastDataPointPos;
  let _endPosition;
  let lastDataPointTime;
  let lowerBoundIndex = 0;
  let _lastIndex = __dataPoints.length - 1;
  if (isTimeBased) {
    if (
      position >= __dataPoints[lowerBoundIndex].pos &&
      position <= __dataPoints[_lastIndex].pos
    ) {
      ({ lo: lowerBoundIndex, hi: _lastIndex } = notificationFunction(
        __dataPoints,
        "pos",
        position,
      ));
    }
    ({ pos: lowerBoundValue, time: _endPosition } =
      __dataPoints[lowerBoundIndex]);
    ({ pos: lastDataPointPos, time: lastDataPointTime } =
      __dataPoints[_lastIndex]);
  } else {
    if (
      position >= __dataPoints[lowerBoundIndex].time &&
      position <= __dataPoints[_lastIndex].time
    ) {
      ({ lo: lowerBoundIndex, hi: _lastIndex } = notificationFunction(
        __dataPoints,
        "time",
        position,
      ));
    }
    ({ time: lowerBoundValue, pos: _endPosition } =
      __dataPoints[lowerBoundIndex]);
    ({ time: lastDataPointPos, pos: lastDataPointTime } =
      __dataPoints[_lastIndex]);
  }
  const horizontalRangeDelta = lastDataPointPos - lowerBoundValue;
  if (horizontalRangeDelta) {
    return (
      _endPosition +
      ((lastDataPointTime - _endPosition) * (position - lowerBoundValue)) /
        horizontalRangeDelta
    );
  } else {
    return _endPosition;
  }
}
class TimeseriesClass extends TimeScale {
  static id = "timeseries";
  static defaults = TimeScale.defaults;
  constructor(constructorParameter) {
    super(constructorParameter);
    this._table = [];
    this._minPos = undefined;
    this._tableRange = undefined;
  }
  initOffsets() {
    const timestampsForTable = this._getTimestampsForTable();
    const lookupTable = (this._table =
      this.buildLookupTable(timestampsForTable));
    this._minPos = calculateHorizontalRange(lookupTable, this.min);
    this._tableRange =
      calculateHorizontalRange(lookupTable, this.max) - this._minPos;
    super.initOffsets(timestampsForTable);
  }
  buildLookupTable(inputValues) {
    const { min: minTime, max: maxTime } = this;
    const filteredInputValues = [];
    const filteredTimePositions = [];
    let __________________currentIndex;
    let inputValuesCount;
    let previousFilteredValue;
    let currentInputValue;
    let nextFilteredValue;
    __________________currentIndex = 0;
    inputValuesCount = inputValues.length;
    for (
      ;
      __________________currentIndex < inputValuesCount;
      ++__________________currentIndex
    ) {
      currentInputValue = inputValues[__________________currentIndex];
      if (currentInputValue >= minTime && currentInputValue <= maxTime) {
        filteredInputValues.push(currentInputValue);
      }
    }
    if (filteredInputValues.length < 2) {
      return [
        {
          time: minTime,
          pos: 0,
        },
        {
          time: maxTime,
          pos: 1,
        },
      ];
    }
    __________________currentIndex = 0;
    inputValuesCount = filteredInputValues.length;
    for (
      ;
      __________________currentIndex < inputValuesCount;
      ++__________________currentIndex
    ) {
      nextFilteredValue =
        filteredInputValues[__________________currentIndex + 1];
      previousFilteredValue =
        filteredInputValues[__________________currentIndex - 1];
      currentInputValue = filteredInputValues[__________________currentIndex];
      if (
        Math.round((nextFilteredValue + previousFilteredValue) / 2) !==
        currentInputValue
      ) {
        filteredTimePositions.push({
          time: currentInputValue,
          pos: __________________currentIndex / (inputValuesCount - 1),
        });
      }
    }
    return filteredTimePositions;
  }
  _generate() {
    const minTimestamp = this.min;
    const maxTimestamp = this.max;
    let dataTimestamps = super.getDataTimestamps();
    if (!dataTimestamps.includes(minTimestamp) || !dataTimestamps.length) {
      dataTimestamps.splice(0, 0, minTimestamp);
    }
    if (!dataTimestamps.includes(maxTimestamp) || dataTimestamps.length === 1) {
      dataTimestamps.push(maxTimestamp);
    }
    return dataTimestamps.sort(
      (subtractValue, _subtractValue) => subtractValue - _subtractValue,
    );
  }
  _getTimestampsForTable() {
    let timestampsArray = this._cache.all || [];
    if (timestampsArray.length) {
      return timestampsArray;
    }
    const _dataTimestamps = this.getDataTimestamps();
    const __labelTimestamps = this.getLabelTimestamps();
    if (_dataTimestamps.length && __labelTimestamps.length) {
      timestampsArray = this.normalize(
        _dataTimestamps.concat(__labelTimestamps),
      );
    } else if (_dataTimestamps.length) {
      timestampsArray = _dataTimestamps;
    } else {
      timestampsArray = __labelTimestamps;
    }
    timestampsArray = this._cache.all = timestampsArray;
    return timestampsArray;
  }
  getDecimalForValue(decimalValue) {
    return (
      (calculateHorizontalRange(this._table, decimalValue) - this._minPos) /
      this._tableRange
    );
  }
  getValueForPixel(______pixelValue) {
    const _offsets = this._offsets;
    const _decimalPosition =
      this.getDecimalForPixel(______pixelValue) / _offsets.factor -
      _offsets.end;
    return calculateHorizontalRange(
      this._table,
      _decimalPosition * this._tableRange + this._minPos,
      true,
    );
  }
}
var __chartAnimationState = Object.freeze({
  __proto__: null,
  CategoryScale: Category,
  LinearScale: LinearScale,
  LogarithmicScale: LogarithmicScale,
  RadialLinearScale: RadialLinearScale,
  TimeScale: TimeScale,
  TimeSeriesScale: TimeseriesClass,
});
const chartAnimationDetails = [
  ____chartAnimationQueue,
  ___animationElement,
  ___animationRequestId,
  __chartAnimationState,
];
export {
  ___AnimationController as Animation,
  ____AnimationController as Animations,
  ArcAnimationController as ArcElement,
  BarChart as BarController,
  BarAnimationController as BarElement,
  DeviceInteraction as BasePlatform,
  canvas2DContext as BasicPlatform,
  BubbleChartElement as BubbleController,
  Category as CategoryScale,
  Chart,
  _animationTaskId as Colors,
  ChartElement as DatasetController,
  ___isChartAnimationRunning as Decimation,
  CanvasInteraction as DomPlatform,
  DoughnutChartElement as DoughnutController,
  _AnimationController as Element,
  _animationControllerInstance as Filler,
  ____________animationController as Interaction,
  _______animationState as Legend,
  _LineChartElement as LineController,
  LineAnimationController as LineElement,
  LinearScale,
  LogarithmicScale,
  PieChart as PieController,
  __AnimationController as PointElement,
  PolarAreaChart as PolarAreaController,
  RadarChart as RadarController,
  RadialLinearScale,
  ChartAxisController as Scale,
  ScatterChartElement as ScatterController,
  _____chartAnimationQueue as SubTitle,
  tooltipActiveElements as Ticks,
  TimeScale,
  TimeseriesClass as TimeSeriesScale,
  ______________animationController as Title,
  tooltipManager as Tooltip,
  ___animationInstance as _adapters,
  getCanvasContext as _detectPlatform,
  animationControllerInstance as animator,
  ____chartAnimationQueue as controllers,
  animationDuration as defaults,
  ___animationElement as elements,
  ___________animationIndex as layouts,
  ___animationRequestId as plugins,
  chartAnimationDetails as registerables,
  chartRegistry as registry,
  __chartAnimationState as scales,
};
