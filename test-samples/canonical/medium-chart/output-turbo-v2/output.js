import { r as responseReference, a as eventDispatcher, e as eventEmitterInstance, c as componentLifecycleState, i as dataIndex, d as _dataProcessor, b as elementReference, v as responseHandlerFunction, u as userSessionManager, l as loggerInstance, f as calculateComponentValue, g as __dataProcessor, h as userSessionHandler, s as _eventDispatcher, j as renderComponent, k as calculateComponentKey, _ as defaultExportModule, t as dataTransformationFunction, m as moduleManager, n as _defaultExportModule, T as ComponentTypeIdentifier, o as calculatedValue, p as documentTitle, H as windowReference, P as __defaultExportModule, q as stringProcessor, w as ___defaultExportModule, x as promiseExecutor, y as componentInstance, z as _componentInstance, A as loggingLevel, B as ___identifierMapping, C as ___eventEmitter, D as dataProcessorFunction, E as __responseHandler, F as functionExecutor, G as identifierMappingRegistry, I as _functionHandler, J as ___value, K as baseValue, L as _identifierMappingRegistry, M as __identifierMappingRegistry, N as _windowReference, O as dataParameter, Q as elementQuerySelector, R as userId, S as userInputValue, U as userSessionData, V as ____identifierMapping, W as sessionKey, X as userSessionId, Y as valueRepresentation, Z as _____identifierMapping, $ as currencySymbol, a0 as _userInputValue, a1 as inputFieldValue, a2 as inputValueAdjusted, a3 as currentState, a4 as networkRequestTimeout, a5 as offsetAdjustment, a6 as animationDuration, a7 as animationTracker, a8 as elementHeight, a9 as lastElementIndex, aa as currentTimeInMillis, ab as dataTypeIdentifier, ac as ___dataProcessor, ad as globalTransformationMatrix, ae as coordinatePoint, af as fileFormat, ag as _functionExecutor, ah as currentUserValue, ai as buttonLabel, aj as __eventHandler, ak as videoPlaybackController, al as currentUserVariable, am as messageCategory, an as currentUserSessionToken, ao as keyTransformationFunction, ap as __userSessionToken, aq as dataTransformationHandler, ar as _coordinatePoint, as as activeUserSession, at as _animationDuration, au as lightnessAdjustment, av as __colorPalette, aw as colorUtility, ax as colorTransformationFunction, ay as userSessionRequestId, az as colorDataArray, aA as colorHelperUtility, aB as colorHelperFunction, aC as chartDataset, aD as _colorUtility, aE as colorPalette, aF as _colorHelperUtility, aG as __colorUtility, aH as notificationListener, aI as ___colorUtility, aJ as chartController, aK as chartColorPalette, aL as chartManagerInstance, aM as _chartManagerInstance, aN as _chartDataset, aO as chartRenderingContext, aP as chartEventListeners } from "./chunks/helpers.segment.js";
import "@kurkle/color";
class __ChartController {
  constructor() {
    this._request = null, this._charts = new Map(), this._running = !1, this._lastDate = void 0;
  }
  _notify(dimensions, footerCanvasContext, contextOptions, canvasContext) {
    const datasetMetaIndex = footerCanvasContext.listeners[canvasContext],
      caretSize = footerCanvasContext.duration;
    datasetMetaIndex.forEach(s => s({
      chart: dimensions,
      initial: footerCanvasContext.initial,
      numSteps: caretSize,
      currentStep: Math.min(contextOptions - footerCanvasContext.start, caretSize)
    }));
  }
  _refresh() {
    this._request || (this._running = !0, this._request = responseReference.call(window, () => {
      this._update(), this._request = null, this._running && this._refresh();
    }));
  }
  _update(t = Date.now()) {
    let e = 0;
    this._charts.forEach((i, s) => {
      if (!i.running || !i.items.length) return;
      const n = i.items;
      let o,
        verticalSpacing = n.length - 1,
        updateBoundsWithData = !1;
      for (; verticalSpacing >= 0; --verticalSpacing) o = n[verticalSpacing], o._active ? (o._total > i.duration && (i.duration = o._total), o.tick(t), updateBoundsWithData = !0) : (n[verticalSpacing] = n[n.length - 1], n.pop());
      updateBoundsWithData && (s.draw(), this._notify(s, i, t, "progress")), n.length || (i.running = !1, this._notify(s, i, t, "complete"), i.initial = !1), e += n.length;
    }), this._lastDate = t, 0 === e && (this._running = !1);
  }
  _getAnims(t) {
    const e = this._charts;
    let i = e.get(t);
    return i || (i = {
      running: !1,
      initial: !0,
      items: [],
      listeners: {
        complete: [],
        progress: []
      }
    }, e.set(t, i)), i;
  }
  listen(t, e, i) {
    this._getAnims(t).listeners[e].push(i);
  }
  add(t, e) {
    e && e.length && this._getAnims(t).items.push(...e);
  }
  has(t) {
    return this._getAnims(t).items.length > 0;
  }
  start(t) {
    const e = this._charts.get(t);
    e && (e.running = !0, e.start = Date.now(), e.duration = e.items.reduce((t, e) => Math.max(t, e._duration), 0), this._refresh());
  }
  running(t) {
    if (!this._running) return !1;
    const e = this._charts.get(t);
    return !!(e && e.running && e.items.length);
  }
  stop(t) {
    const e = this._charts.get(t);
    if (!e || !e.items.length) return;
    const i = e.items;
    let s = i.length - 1;
    for (; s >= 0; --s) i[s].cancel();
    e.items = [], this._notify(t, e, Date.now(), "complete");
  }
  remove(t) {
    return this._charts.delete(t);
  }
}
var __chartManagerInstance = new __ChartController();
const defaultBackgroundColor = "transparent",
  colorTransitionHandler = {
    boolean: (t, e, i) => i > .5 ? e : t,
    color(t, e, i) {
      const n = componentLifecycleState(t || defaultBackgroundColor),
        o = n.valid && componentLifecycleState(e || defaultBackgroundColor);
      return o && o.valid ? o.mix(n, i).hexString() : e;
    },
    number: (t, e, i) => t + (e - t) * i
  };
class _AnimationHandler {
  constructor(t, s, n, o) {
    const a = s[n];
    o = eventDispatcher([t.to, o, a, t.from]);
    const r = eventDispatcher([t.from, a, o]);
    this._active = !0, this._fn = t.fn || colorTransitionHandler[t.type || typeof r], this._easing = eventEmitterInstance[t.easing] || eventEmitterInstance.linear, this._start = Math.floor(Date.now() + (t.delay || 0)), this._duration = this._total = Math.floor(t.duration), this._loop = !!t.loop, this._target = s, this._prop = n, this._from = r, this._to = o, this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(t, i, s) {
    if (this._active) {
      this._notify(!1);
      const n = this._target[this._prop],
        o = s - this._start,
        a = this._duration - o;
      this._start = s, this._duration = Math.floor(Math.max(a, t.duration)), this._total += o, this._loop = !!t.loop, this._to = eventDispatcher([t.to, i, n, t.from]), this._from = eventDispatcher([t.from, n, i]);
    }
  }
  cancel() {
    this._active && (this.tick(Date.now()), this._active = !1, this._notify(!1));
  }
  tick(t) {
    const e = t - this._start,
      i = this._duration,
      s = this._prop,
      n = this._from,
      o = this._loop,
      a = this._to;
    let r;
    if (this._active = n !== a && (o || e < i), !this._active) return this._target[s] = a, void this._notify(!0);
    e < 0 ? this._target[s] = n : (r = e / i % 2, r = o && r > 1 ? 2 - r : r, r = this._easing(Math.min(1, Math.max(0, r))), this._target[s] = this._fn(n, a, r));
  }
  wait() {
    const t = this._promises || (this._promises = []);
    return new Promise((e, i) => {
      t.push({
        res: e,
        rej: i
      });
    });
  }
  _notify(t) {
    const e = t ? "res" : "rej",
      i = this._promises || [];
    for (let t = 0; t < i.length; t++) i[t][e]();
  }
}
class AnimationManager {
  constructor(t, e) {
    this._chart = t, this._properties = new Map(), this.configure(e);
  }
  configure(t) {
    if (!dataIndex(t)) return;
    const e = Object.keys(_dataProcessor.animation),
      i = this._properties;
    Object.getOwnPropertyNames(t).forEach(s => {
      const o = t[s];
      if (!dataIndex(o)) return;
      const r = {};
      for (const t of e) r[t] = o[t];
      (elementReference(o.properties) && o.properties || [s]).forEach(t => {
        t !== s && i.has(t) || i.set(t, r);
      });
    });
  }
  _animateOptions(t, e) {
    const i = e.options,
      s = mergeChartOptions(t, i);
    if (!s) return [];
    const n = this._createAnimations(s, i);
    return i.$shared && collectActivePromises(t.options.$animations, i).then(() => {
      t.options = i;
    }, () => {}), n;
  }
  _createAnimations(t, e) {
    const i = this._properties,
      s = [],
      n = t.$animations || (t.$animations = {}),
      o = Object.keys(e),
      a = Date.now();
    let r;
    for (r = o.length - 1; r >= 0; --r) {
      const boxHeight = o[r];
      if ("$" === boxHeight.charAt(0)) continue;
      if ("options" === boxHeight) {
        s.push(...this._animateOptions(t, e));
        continue;
      }
      const boxWidth = e[boxHeight];
      let animationTask = n[boxHeight];
      const angleIncrement = i.get(boxHeight);
      if (animationTask) {
        if (angleIncrement && animationTask.active()) {
          animationTask.update(angleIncrement, boxWidth, a);
          continue;
        }
        animationTask.cancel();
      }
      angleIncrement && angleIncrement.duration ? (n[boxHeight] = animationTask = new _AnimationHandler(angleIncrement, t, boxHeight, boxWidth), s.push(animationTask)) : t[boxHeight] = boxWidth;
    }
    return s;
  }
  update(t, e) {
    if (0 === this._properties.size) return void Object.assign(t, e);
    const i = this._createAnimations(t, e);
    return i.length ? (__chartManagerInstance.add(this._chart, i), !0) : void 0;
  }
}
function collectActivePromises(t, e) {
  const i = [],
    s = Object.keys(e);
  for (let e = 0; e < s.length; e++) {
    const n = t[s[e]];
    n && n.active() && i.push(n.wait());
  }
  return Promise.all(i);
}
function mergeChartOptions(t, e) {
  if (!e) return;
  let i = t.options;
  if (i) return i.$shared && (t.options = i = Object.assign({}, i, {
    $shared: !1,
    $animations: {}
  })), i;
  t.options = e;
}
function determineRange(t, e) {
  const i = t && t.options || {},
    s = i.reverse,
    n = void 0 === i.min ? e : 0,
    o = void 0 === i.max ? e : 0;
  return {
    start: s ? o : n,
    end: s ? n : o
  };
}
function getBoundingBoxCoordinates(t, e, i) {
  if (!1 === i) return !1;
  const s = determineRange(t, i),
    n = determineRange(e, i);
  return {
    top: n.end,
    right: s.end,
    bottom: n.start,
    left: s.start
  };
}
function extractRectangleCoordinates(t) {
  let e, i, s, o;
  return dataIndex(t) ? (e = t.top, i = t.right, s = t.bottom, o = t.left) : e = i = s = o = t, {
    top: e,
    right: i,
    bottom: s,
    left: o,
    disabled: !1 === t
  };
}
function getSortedDatasetIndicesByMeta(t, e) {
  const i = [],
    s = t._getSortedDatasetMetas(e);
  let n, o;
  for (n = 0, o = s.length; n < o; ++n) i.push(s[n].index);
  return i;
}
function accumulatedValue(t, e, i, s = {}) {
  const n = t.keys,
    o = "single" === s.mode;
  let a, r, h, l;
  if (null !== e) {
    for (a = 0, r = n.length; a < r; ++a) {
      if (h = +n[a], h === i) {
        if (s.all) continue;
        break;
      }
      l = t.values[h], __dataProcessor(l) && (o || 0 === e || _eventDispatcher(e) === _eventDispatcher(l)) && (e += l);
    }
    return e;
  }
}
function transformObjectToArray(t) {
  const e = Object.keys(t),
    i = new Array(e.length);
  let s, n, o;
  for (s = 0, n = e.length; s < n; ++s) o = e[s], i[s] = {
    x: o,
    y: t[o]
  };
  return i;
}
function isOptionStacked(t, e) {
  const i = t && t.options.stacked;
  return i || void 0 === i && void 0 !== e.stack;
}
function createIdentifierPath(t, e, i) {
  return `${t.id}.${e.id}.${i.stack || i.type}`;
}
function getUserBoundsWithFallbackToInfinity(t) {
  const {
    min: e,
    max: i,
    minDefined: s,
    maxDefined: n
  } = t.getUserBounds();
  return {
    min: s ? e : Number.NEGATIVE_INFINITY,
    max: n ? i : Number.POSITIVE_INFINITY
  };
}
function retrieveOrInitializeMetadata(t, e, i) {
  const s = t[e] || (t[e] = {});
  return s[i] || (s[i] = {});
}
function getFirstVisibleMetaIndex(t, e, i, s) {
  for (const n of e.getMatchingVisibleMetas(s).reverse()) {
    const e = t[n.index];
    if (i && e > 0 || !i && e < 0) return n.index;
  }
  return null;
}
function updateStackedValueForChart(t, e) {
  const {
      chart: i,
      _cachedMeta: s
    } = t,
    n = i._stacks || (i._stacks = {}),
    {
      iScale: o,
      vScale: a,
      index: r
    } = s,
    h = o.axis,
    l = a.axis,
    c = createIdentifierPath(o, a, s),
    d = e.length;
  let currentIndex;
  for (let t = 0; t < d; ++t) {
    const i = e[t],
      {
        [h]: o,
        [l]: d
      } = i;
    currentIndex = (i._stacks || (i._stacks = {}))[l] = retrieveOrInitializeMetadata(n, c, o), currentIndex[r] = d, currentIndex._top = getFirstVisibleMetaIndex(currentIndex, a, !0, s.type), currentIndex._bottom = getFirstVisibleMetaIndex(currentIndex, a, !1, s.type);
    (currentIndex._visualValues || (currentIndex._visualValues = {}))[r] = d;
  }
}
function getScaleIdForAxis(t, e) {
  const i = t.scales;
  return Object.keys(i).filter(t => i[t].axis === e).shift();
}
function initializeDatasetRenderer(t, e) {
  return renderComponent(t, {
    active: !1,
    dataset: void 0,
    datasetIndex: e,
    index: e,
    mode: "default",
    type: "dataset"
  });
}
function dataPointContext(t, e, i) {
  return renderComponent(t, {
    active: !1,
    dataIndex: e,
    parsed: void 0,
    raw: void 0,
    element: i,
    index: e,
    mode: "default",
    type: "data"
  });
}
function removeStackedValue(t, e) {
  const i = t.controller.index,
    s = t.vScale && t.vScale.axis;
  if (s) {
    e = e || t._parsed;
    for (const t of e) {
      const e = t._stacks;
      if (!e || void 0 === e[s] || void 0 === e[s][i]) return;
      delete e[s][i], void 0 !== e[s]._visualValues && void 0 !== e[s]._visualValues[i] && delete e[s]._visualValues[i];
    }
  }
}
const isResetOrNoneAction = t => "reset" === t || "none" === t,
  combineWithDefaults = (t, e) => e ? t : Object.assign({}, t),
  getStackedDatasetValues = (t, e, i) => t && !e.hidden && e._stacked && {
    keys: getSortedDatasetIndicesByMeta(i, !0),
    values: null
  };
class ChartComponent {
  static defaults = {};
  static datasetElementType = null;
  static dataElementType = null;
  constructor(t, e) {
    this.chart = t, this._ctx = t.ctx, this.index = e, this._cachedDataOpts = {}, this._cachedMeta = this.getMeta(), this._type = this._cachedMeta.type, this.options = void 0, this._parsing = !1, this._data = void 0, this._objectData = void 0, this._sharedOptions = void 0, this._drawStart = void 0, this._drawCount = void 0, this.enableOptionSharing = !1, this.supportsDecimation = !1, this.$context = void 0, this._syncList = [], this.datasetElementType = new.target.datasetElementType, this.dataElementType = new.target.dataElementType, this.initialize();
  }
  initialize() {
    const t = this._cachedMeta;
    this.configure(), this.linkScales(), t._stacked = isOptionStacked(t.vScale, t), this.addElements(), this.options.fill && !this.chart.isPluginEnabled("filler") && console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
  }
  updateIndex(t) {
    this.index !== t && removeStackedValue(this._cachedMeta), this.index = t;
  }
  linkScales() {
    const t = this.chart,
      e = this._cachedMeta,
      i = this.getDataset(),
      s = (t, e, i, s) => "x" === t ? e : "r" === t ? s : i,
      n = e.xAxisID = responseHandlerFunction(i.xAxisID, getScaleIdForAxis(t, "x")),
      o = e.yAxisID = responseHandlerFunction(i.yAxisID, getScaleIdForAxis(t, "y")),
      a = e.rAxisID = responseHandlerFunction(i.rAxisID, getScaleIdForAxis(t, "r")),
      h = e.indexAxis,
      l = e.iAxisID = s(h, n, o, a),
      c = e.vAxisID = s(h, o, n, a);
    e.xScale = this.getScaleForId(n), e.yScale = this.getScaleForId(o), e.rScale = this.getScaleForId(a), e.iScale = this.getScaleForId(l), e.vScale = this.getScaleForId(c);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(t) {
    return this.chart.scales[t];
  }
  _getOtherScale(t) {
    const e = this._cachedMeta;
    return t === e.iScale ? e.vScale : e.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const t = this._cachedMeta;
    this._data && userSessionManager(this._data, this), t._stacked && removeStackedValue(t);
  }
  _dataCheck() {
    const t = this.getDataset(),
      e = t.data || (t.data = []),
      i = this._data;
    if (dataIndex(e)) this._data = transformObjectToArray(e);else if (i !== e) {
      if (i) {
        userSessionManager(i, this);
        const t = this._cachedMeta;
        removeStackedValue(t), t._parsed = [];
      }
      e && Object.isExtensible(e) && loggerInstance(e, this), this._syncList = [], this._data = e;
    }
  }
  addElements() {
    const t = this._cachedMeta;
    this._dataCheck(), this.datasetElementType && (t.dataset = new this.datasetElementType());
  }
  buildOrUpdateElements(t) {
    const e = this._cachedMeta,
      i = this.getDataset();
    let s = !1;
    this._dataCheck();
    const n = e._stacked;
    e._stacked = isOptionStacked(e.vScale, e), e.stack !== i.stack && (s = !0, removeStackedValue(e), e.stack = i.stack), this._resyncElements(t), (s || n !== e._stacked) && updateStackedValueForChart(this, e._parsed);
  }
  configure() {
    const t = this.chart.config,
      e = t.datasetScopeKeys(this._type),
      i = t.getOptionScopes(this.getDataset(), e, !0);
    this.options = t.createResolver(i, this.getContext()), this._parsing = this.options.parsing, this._cachedDataOpts = {};
  }
  parse(t, e) {
    const {
        _cachedMeta: i,
        _data: s
      } = this,
      {
        iScale: o,
        _stacked: r
      } = i,
      h = o.axis;
    let l,
      c,
      d,
      u = 0 === t && e === s.length || i._sorted,
      boundingBoxDimensions = t > 0 && i._parsed[t - 1];
    if (!1 === this._parsing) i._parsed = s, i._sorted = !0, d = s;else {
      d = elementReference(s[t]) ? this.parseArrayData(i, s, t, e) : dataIndex(s[t]) ? this.parseObjectData(i, s, t, e) : this.parsePrimitiveData(i, s, t, e);
      const o = () => null === c[h] || boundingBoxDimensions && c[h] < boundingBoxDimensions[h];
      for (l = 0; l < e; ++l) i._parsed[l + t] = c = d[l], u && (o() && (u = !1), boundingBoxDimensions = c);
      i._sorted = u;
    }
    r && updateStackedValueForChart(this, d);
  }
  parsePrimitiveData(t, e, i, s) {
    const {
        iScale: n,
        vScale: o
      } = t,
      a = n.axis,
      r = o.axis,
      h = n.getLabels(),
      l = n === o,
      c = new Array(s);
    let d, u, g;
    for (d = 0, u = s; d < u; ++d) g = d + i, c[d] = {
      [a]: l || n.parse(h[g], g),
      [r]: o.parse(e[g], g)
    };
    return c;
  }
  parseArrayData(t, e, i, s) {
    const {
        xScale: n,
        yScale: o
      } = t,
      a = new Array(s);
    let r, h, l, c;
    for (r = 0, h = s; r < h; ++r) l = r + i, c = e[l], a[r] = {
      x: n.parse(c[0], l),
      y: o.parse(c[1], l)
    };
    return a;
  }
  parseObjectData(t, e, i, s) {
    const {
        xScale: n,
        yScale: o
      } = t,
      {
        xAxisKey: a = "x",
        yAxisKey: r = "y"
      } = this._parsing,
      h = new Array(s);
    let l, d, u, g;
    for (l = 0, d = s; l < d; ++l) u = l + i, g = e[u], h[l] = {
      x: n.parse(calculateComponentValue(g, a), u),
      y: o.parse(calculateComponentValue(g, r), u)
    };
    return h;
  }
  getParsed(t) {
    return this._cachedMeta._parsed[t];
  }
  getDataElement(t) {
    return this._cachedMeta.data[t];
  }
  applyStack(t, e, i) {
    const s = this.chart,
      n = this._cachedMeta,
      o = e[t.axis];
    return accumulatedValue({
      keys: getSortedDatasetIndicesByMeta(s, !0),
      values: e._stacks[t.axis]._visualValues
    }, o, n.index, {
      mode: i
    });
  }
  updateRangeFromParsed(t, e, i, s) {
    const n = i[e.axis];
    let o = null === n ? NaN : n;
    const a = s && i._stacks[e.axis];
    s && a && (s.values = a, o = accumulatedValue(s, n, this._cachedMeta.index)), t.min = Math.min(t.min, o), t.max = Math.max(t.max, o);
  }
  getMinMax(t, e) {
    const i = this._cachedMeta,
      s = i._parsed,
      n = i._sorted && t === i.iScale,
      o = s.length,
      a = this._getOtherScale(t),
      r = getStackedDatasetValues(e, i, this.chart),
      h = {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY
      },
      {
        min: l,
        max: c
      } = getUserBoundsWithFallbackToInfinity(a);
    let u, g;
    function titlePosition() {
      g = s[u];
      const e = g[a.axis];
      return !__dataProcessor(g[t.axis]) || l > e || c < e;
    }
    for (u = 0; u < o && (titlePosition() || (this.updateRangeFromParsed(h, t, g, r), !n)); ++u);
    if (n) for (u = o - 1; u >= 0; --u) if (!titlePosition()) {
      this.updateRangeFromParsed(h, t, g, r);
      break;
    }
    return h;
  }
  getAllParsedValues(t) {
    const e = this._cachedMeta._parsed,
      i = [];
    let s, n, o;
    for (s = 0, n = e.length; s < n; ++s) o = e[s][t.axis], __dataProcessor(o) && i.push(o);
    return i;
  }
  getMaxOverflow() {
    return !1;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      i = e.iScale,
      s = e.vScale,
      n = this.getParsed(t);
    return {
      label: i ? "" + i.getLabelForValue(n[i.axis]) : "",
      value: s ? "" + s.getLabelForValue(n[s.axis]) : ""
    };
  }
  _update(t) {
    const e = this._cachedMeta;
    this.update(t || "default"), e._clip = extractRectangleCoordinates(responseHandlerFunction(this.options.clip, getBoundingBoxCoordinates(e.xScale, e.yScale, this.getMaxOverflow())));
  }
  update(t) {}
  draw() {
    const t = this._ctx,
      e = this.chart,
      i = this._cachedMeta,
      s = i.data || [],
      n = e.chartArea,
      o = [],
      a = this._drawStart || 0,
      r = this._drawCount || s.length - a,
      h = this.options.drawActiveElementsOnTop;
    let l;
    for (i.dataset && i.dataset.draw(t, n, a, r), l = a; l < a + r; ++l) {
      const e = s[l];
      e.hidden || (e.active && h ? o.push(e) : e.draw(t, n));
    }
    for (l = 0; l < o.length; ++l) o[l].draw(t, n);
  }
  getStyle(t, e) {
    const i = e ? "active" : "default";
    return void 0 === t && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(i) : this.resolveDataElementOptions(t || 0, i);
  }
  getContext(t, e, i) {
    const s = this.getDataset();
    let n;
    if (t >= 0 && t < this._cachedMeta.data.length) {
      const e = this._cachedMeta.data[t];
      n = e.$context || (e.$context = dataPointContext(this.getContext(), t, e)), n.parsed = this.getParsed(t), n.raw = s.data[t], n.index = n.dataIndex = t;
    } else n = this.$context || (this.$context = initializeDatasetRenderer(this.chart.getContext(), this.index)), n.dataset = s, n.index = n.datasetIndex = this.index;
    return n.active = !!e, n.mode = i, n;
  }
  resolveDatasetElementOptions(t) {
    return this._resolveElementOptions(this.datasetElementType.id, t);
  }
  resolveDataElementOptions(t, e) {
    return this._resolveElementOptions(this.dataElementType.id, e, t);
  }
  _resolveElementOptions(t, e = "default", i) {
    const s = "active" === e,
      n = this._cachedDataOpts,
      a = t + "-" + e,
      r = n[a],
      h = this.enableOptionSharing && userSessionHandler(i);
    if (r) return combineWithDefaults(r, h);
    const l = this.chart.config,
      c = l.datasetElementScopeKeys(this._type, t),
      d = s ? [`${t}Hover`, "hover", t, ""] : [t, ""],
      g = l.getOptionScopes(this.getDataset(), c),
      p = Object.keys(_dataProcessor.elements[t]),
      rotationIndex = l.resolveNamedOptions(g, p, () => this.getContext(i, s, e), d);
    return rotationIndex.$shared && (rotationIndex.$shared = h, n[a] = Object.freeze(combineWithDefaults(rotationIndex, h))), rotationIndex;
  }
  _resolveAnimations(t, e, i) {
    const s = this.chart,
      n = this._cachedDataOpts,
      o = `animation-${e}`,
      a = n[o];
    if (a) return a;
    let r;
    if (!1 !== s.options.animation) {
      const s = this.chart.config,
        n = s.datasetAnimationScopeKeys(this._type, e),
        o = s.getOptionScopes(this.getDataset(), n);
      r = s.createResolver(o, this.getContext(t, i, e));
    }
    const h = new AnimationManager(s, r && r.animations);
    return r && r._cacheable && (n[o] = Object.freeze(h)), h;
  }
  getSharedOptions(t) {
    if (t.$shared) return this._sharedOptions || (this._sharedOptions = Object.assign({}, t));
  }
  includeOptions(t, e) {
    return !e || isResetOrNoneAction(t) || this.chart._animationsDisabled;
  }
  _getSharedOptions(t, e) {
    const i = this.resolveDataElementOptions(t, e),
      s = this._sharedOptions,
      n = this.getSharedOptions(i),
      o = this.includeOptions(e, n) || n !== s;
    return this.updateSharedOptions(n, e, i), {
      sharedOptions: n,
      includeOptions: o
    };
  }
  updateElement(t, e, i, s) {
    isResetOrNoneAction(s) ? Object.assign(t, i) : this._resolveAnimations(e, s).update(t, i);
  }
  updateSharedOptions(t, e, i) {
    t && !isResetOrNoneAction(e) && this._resolveAnimations(void 0, e).update(t, i);
  }
  _setStyle(t, e, i, s) {
    t.active = s;
    const n = this.getStyle(e, s);
    this._resolveAnimations(e, i, s).update(t, {
      options: !s && this.getSharedOptions(n) || n
    });
  }
  removeHoverStyle(t, e, i) {
    this._setStyle(t, i, "active", !1);
  }
  setHoverStyle(t, e, i) {
    this._setStyle(t, i, "active", !0);
  }
  _removeDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !1);
  }
  _setDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !0);
  }
  _resyncElements(t) {
    const e = this._data,
      i = this._cachedMeta.data;
    for (const [t, e, i] of this._syncList) this[t](e, i);
    this._syncList = [];
    const s = i.length,
      n = e.length,
      o = Math.min(n, s);
    o && this.parse(0, o), n > s ? this._insertElements(s, n - s, t) : n < s && this._removeElements(n, s - n);
  }
  _insertElements(t, e, i = !0) {
    const s = this._cachedMeta,
      n = s.data,
      o = t + e;
    let a;
    const r = t => {
      for (t.length += e, a = t.length - 1; a >= o; a--) t[a] = t[a - e];
    };
    for (r(n), a = t; a < o; ++a) n[a] = new this.dataElementType();
    this._parsing && r(s._parsed), this.parse(t, e), i && this.updateElements(n, t, e, "reset");
  }
  updateElements(t, e, i, s) {}
  _removeElements(t, e) {
    const i = this._cachedMeta;
    if (this._parsing) {
      const s = i._parsed.splice(t, e);
      i._stacked && removeStackedValue(i, s);
    }
    i.data.splice(t, e);
  }
  _sync(t) {
    if (this._parsing) this._syncList.push(t);else {
      const [e, i, s] = t;
      this[e](i, s);
    }
    this.chart._dataChanges.push([this.index, ...t]);
  }
  _onDataPush() {
    const t = arguments.length;
    this._sync(["_insertElements", this.getDataset().data.length - t, t]);
  }
  _onDataPop() {
    this._sync(["_removeElements", this._cachedMeta.data.length - 1, 1]);
  }
  _onDataShift() {
    this._sync(["_removeElements", 0, 1]);
  }
  _onDataSplice(t, e) {
    e && this._sync(["_removeElements", t, e]);
    const i = arguments.length - 2;
    i && this._sync(["_insertElements", t, i]);
  }
  _onDataUnshift() {
    this._sync(["_insertElements", 0, arguments.length]);
  }
}
function retrieveSortedBarValues(t, e) {
  if (!t._cache.$bar) {
    const i = t.getMatchingVisibleMetas(e);
    let s = [];
    for (let e = 0, n = i.length; e < n; e++) s = s.concat(i[e].controller.getAllParsedValues(t));
    t._cache.$bar = defaultExportModule(s.sort((t, e) => t - e));
  }
  return t._cache.$bar;
}
function calculateBarChartValues(t) {
  const e = t.iScale,
    i = retrieveSortedBarValues(e, t.type);
  let s,
    n,
    o,
    a,
    r = e._length;
  const h = () => {
    32767 !== o && -32768 !== o && (userSessionHandler(a) && (r = Math.min(r, Math.abs(o - a) || r)), a = o);
  };
  for (s = 0, n = i.length; s < n; ++s) o = e.getPixelForValue(i[s]), h();
  for (a = void 0, s = 0, n = e.ticks.length; s < n; ++s) o = e.getPixelForTick(s), h();
  return r;
}
function calculateBarMetrics(t, e, i, s) {
  const n = i.barThickness;
  let o, a;
  return calculateComponentKey(n) ? (o = e.min * i.categoryPercentage, a = i.barPercentage) : (o = n * s, a = 1), {
    chunk: o / s,
    ratio: a,
    start: e.pixels[t] - o / 2
  };
}
function calculateBarDimensionsAndPosition(t, e, i, s) {
  const n = e.pixels,
    o = n[t];
  let a = t > 0 ? n[t - 1] : null,
    r = t < n.length - 1 ? n[t + 1] : null;
  const h = i.categoryPercentage;
  null === a && (a = o - (null === r ? e.end - e.start : r - o)), null === r && (r = o + o - a);
  const l = o - (o - Math.min(a, r)) / 2 * h;
  return {
    chunk: Math.abs(r - a) / 2 * h / s,
    ratio: i.barPercentage,
    start: l
  };
}
function _calculateBarDimensions(t, e, i, s) {
  const n = i.parse(t[0], s),
    o = i.parse(t[1], s),
    a = Math.min(n, o),
    r = Math.max(n, o);
  let h = a,
    l = r;
  Math.abs(a) > Math.abs(r) && (h = r, l = a), e[i.axis] = l, e._custom = {
    barStart: h,
    barEnd: l,
    start: n,
    end: o,
    min: a,
    max: r
  };
}
function calculateBarData(t, e, i, s) {
  return elementReference(t) ? _calculateBarDimensions(t, e, i, s) : e[i.axis] = i.parse(t, s), e;
}
function retrieveBarData(t, e, i, s) {
  const n = t.iScale,
    o = t.vScale,
    a = n.getLabels(),
    r = n === o,
    h = [];
  let l, c, d, u;
  for (l = i, c = i + s; l < c; ++l) u = e[l], d = {}, d[n.axis] = r || n.parse(a[l], l), h.push(calculateBarData(u, d, o, l));
  return h;
}
function isValidBarChartData(t) {
  return t && void 0 !== t.barStart && void 0 !== t.barEnd;
}
function determineDirection(t, e, i) {
  return 0 !== t ? _eventDispatcher(t) : (e.isHorizontal() ? 1 : -1) * (e.min >= i ? 1 : -1);
}
function determinePositioningDirections(t) {
  let e, i, s, n, o;
  return t.horizontal ? (e = t.base > t.x, i = "left", s = "right") : (e = t.base < t.y, i = "bottom", s = "top"), e ? (n = "end", o = "start") : (n = "start", o = "end"), {
    start: i,
    end: s,
    reverse: e,
    top: n,
    bottom: o
  };
}
function configureBorderSkippingOptions(t, e, i, s) {
  let n = e.borderSkipped;
  const o = {};
  if (!n) return void (t.borderSkipped = o);
  if (!0 === n) return void (t.borderSkipped = {
    top: !0,
    right: !0,
    bottom: !0,
    left: !0
  });
  const {
    start: a,
    end: r,
    reverse: h,
    top: l,
    bottom: c
  } = determinePositioningDirections(t);
  "middle" === n && i && (t.enableBorderRadius = !0, (i._top || 0) === s ? n = l : (i._bottom || 0) === s ? n = c : (o[calculateBorderSkipValue(c, a, r, h)] = !0, n = l)), o[calculateBorderSkipValue(n, a, r, h)] = !0, t.borderSkipped = o;
}
function calculateBorderSkipValue(t, e, i, s) {
  return t = s ? determineBorderValue(t = getAlternativeBorderValue(t, e, i), i, e) : determineBorderValue(t, e, i);
}
function getAlternativeBorderValue(t, e, i) {
  return t === e ? i : t === i ? e : t;
}
function determineBorderValue(t, e, i) {
  return "start" === t ? e : "end" === t ? i : t;
}
function updateInflateAmount(t, {
  inflateAmount: e
}, i) {
  t.inflateAmount = "auto" === e ? 1 === i ? .33 : 0 : e;
}
class BarChartComponent extends ChartComponent {
  static id = "bar";
  static defaults = {
    datasetElementType: !1,
    dataElementType: "bar",
    categoryPercentage: .8,
    barPercentage: .9,
    grouped: !0,
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "base", "width", "height"]
      }
    }
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category",
        offset: !0,
        grid: {
          offset: !0
        }
      },
      _value_: {
        type: "linear",
        beginAtZero: !0
      }
    }
  };
  parsePrimitiveData(t, e, i, s) {
    return retrieveBarData(t, e, i, s);
  }
  parseArrayData(t, e, i, s) {
    return retrieveBarData(t, e, i, s);
  }
  parseObjectData(t, e, i, s) {
    const {
        iScale: n,
        vScale: o
      } = t,
      {
        xAxisKey: a = "x",
        yAxisKey: r = "y"
      } = this._parsing,
      h = "x" === n.axis ? a : r,
      l = "x" === o.axis ? a : r,
      d = [];
    let u, g, p, f;
    for (u = i, g = i + s; u < g; ++u) f = e[u], p = {}, p[n.axis] = n.parse(calculateComponentValue(f, h), u), d.push(calculateBarData(calculateComponentValue(f, l), p, o, u));
    return d;
  }
  updateRangeFromParsed(t, e, i, s) {
    super.updateRangeFromParsed(t, e, i, s);
    const n = i._custom;
    n && e === this._cachedMeta.vScale && (t.min = Math.min(t.min, n.min), t.max = Math.max(t.max, n.max));
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      {
        iScale: i,
        vScale: s
      } = e,
      n = this.getParsed(t),
      o = n._custom,
      a = isValidBarChartData(o) ? "[" + o.start + ", " + o.end + "]" : "" + s.getLabelForValue(n[s.axis]);
    return {
      label: "" + i.getLabelForValue(n[i.axis]),
      value: a
    };
  }
  initialize() {
    this.enableOptionSharing = !0, super.initialize();
    this._cachedMeta.stack = this.getDataset().stack;
  }
  update(t) {
    const e = this._cachedMeta;
    this.updateElements(e.data, 0, e.data.length, t);
  }
  updateElements(t, e, i, s) {
    const n = "reset" === s,
      {
        index: o,
        _cachedMeta: {
          vScale: a
        }
      } = this,
      r = a.getBasePixel(),
      h = a.isHorizontal(),
      l = this._getRuler(),
      {
        sharedOptions: c,
        includeOptions: d
      } = this._getSharedOptions(e, s);
    for (let u = e; u < e + i; u++) {
      const e = this.getParsed(u),
        i = n || calculateComponentKey(e[a.axis]) ? {
          base: r,
          head: r
        } : this._calculateBarValuePixels(u),
        g = this._calculateBarIndexPixels(u, l),
        p = (e._stacks || {})[a.axis],
        halfWidthOfDisplay = {
          horizontal: h,
          base: i.base,
          enableBorderRadius: !p || isValidBarChartData(e._custom) || o === p._top || o === p._bottom,
          x: h ? i.head : g.center,
          y: h ? g.center : i.head,
          height: h ? g.size : Math.abs(i.size),
          width: h ? Math.abs(i.size) : g.size
        };
      d && (halfWidthOfDisplay.options = c || this.resolveDataElementOptions(u, t[u].active ? "active" : s));
      const getSessionIdForTick = halfWidthOfDisplay.options || t[u].options;
      configureBorderSkippingOptions(halfWidthOfDisplay, getSessionIdForTick, p, o), updateInflateAmount(halfWidthOfDisplay, getSessionIdForTick, l.ratio), this.updateElement(t[u], u, halfWidthOfDisplay, s);
    }
  }
  _getStacks(t, e) {
    const {
        iScale: i
      } = this._cachedMeta,
      s = i.getMatchingVisibleMetas(this._type).filter(t => t.controller.options.grouped),
      n = i.options.stacked,
      o = [],
      a = t => {
        const i = t.controller.getParsed(e),
          s = i && i[t.vScale.axis];
        if (calculateComponentKey(s) || isNaN(s)) return !0;
      };
    for (const i of s) if ((void 0 === e || !a(i)) && ((!1 === n || -1 === o.indexOf(i.stack) || void 0 === n && void 0 === i.stack) && o.push(i.stack), i.index === t)) break;
    return o.length || o.push(void 0), o;
  }
  _getStackCount(t) {
    return this._getStacks(void 0, t).length;
  }
  _getStackIndex(t, e, i) {
    const s = this._getStacks(t, i),
      n = void 0 !== e ? s.indexOf(e) : -1;
    return -1 === n ? s.length - 1 : n;
  }
  _getRuler() {
    const t = this.options,
      e = this._cachedMeta,
      i = e.iScale,
      s = [];
    let n, o;
    for (n = 0, o = e.data.length; n < o; ++n) s.push(i.getPixelForValue(this.getParsed(n)[i.axis], n));
    const a = t.barThickness;
    return {
      min: a || calculateBarChartValues(e),
      pixels: s,
      start: i._startPixel,
      end: i._endPixel,
      stackCount: this._getStackCount(),
      scale: i,
      grouped: t.grouped,
      ratio: a ? 1 : t.categoryPercentage * t.barPercentage
    };
  }
  _calculateBarValuePixels(t) {
    const {
        _cachedMeta: {
          vScale: e,
          _stacked: i,
          index: s
        },
        options: {
          base: n,
          minBarLength: o
        }
      } = this,
      a = n || 0,
      r = this.getParsed(t),
      h = r._custom,
      l = isValidBarChartData(h);
    let c,
      d,
      u = r[e.axis],
      p = 0,
      m = i ? this.applyStack(e, r, i) : u;
    m !== u && (p = m - u, m = u), l && (u = h.barStart, m = h.barEnd - h.barStart, 0 !== u && _eventDispatcher(u) !== _eventDispatcher(h.barEnd) && (p = 0), p += u);
    const x = calculateComponentKey(n) || l ? p : n;
    let pixelValue = e.getPixelForValue(x);
    if (c = this.chart.getDataVisibility(t) ? e.getPixelForValue(p + m) : pixelValue, d = c - pixelValue, Math.abs(d) < o) {
      d = determineDirection(d, e, a) * o, u === a && (pixelValue -= d / 2);
      const t = e.getPixelForDecimal(0),
        n = e.getPixelForDecimal(1),
        h = Math.min(t, n),
        g = Math.max(t, n);
      pixelValue = Math.max(Math.min(pixelValue, g), h), c = pixelValue + d, i && !l && (r._stacks[e.axis]._visualValues[s] = e.getValueForPixel(c) - e.getValueForPixel(pixelValue));
    }
    if (pixelValue === e.getPixelForValue(a)) {
      const t = _eventDispatcher(d) * e.getLineWidthForValue(a) / 2;
      pixelValue += t, d -= t;
    }
    return {
      size: d,
      base: pixelValue,
      head: c,
      center: c + d / 2
    };
  }
  _calculateBarIndexPixels(t, e) {
    const i = e.scale,
      s = this.options,
      n = s.skipNull,
      o = responseHandlerFunction(s.maxBarThickness, 1 / 0);
    let a, h;
    if (e.grouped) {
      const i = n ? this._getStackCount(t) : e.stackCount,
        r = "flex" === s.barThickness ? calculateBarDimensionsAndPosition(t, e, s, i) : calculateBarMetrics(t, e, s, i),
        l = this._getStackIndex(this.index, this._cachedMeta.stack, n ? t : void 0);
      a = r.start + r.chunk * l + r.chunk / 2, h = Math.min(o, r.chunk * r.ratio);
    } else a = i.getPixelForValue(this.getParsed(t)[i.axis], t), h = Math.min(o, e.min * e.ratio);
    return {
      base: a - h / 2,
      head: a + h / 2,
      center: a,
      size: h
    };
  }
  draw() {
    const t = this._cachedMeta,
      e = t.vScale,
      i = t.data,
      s = i.length;
    let n = 0;
    for (; n < s; ++n) null !== this.getParsed(n)[e.axis] && i[n].draw(this._ctx);
  }
}
class BubbleChartComponent extends ChartComponent {
  static id = "bubble";
  static defaults = {
    datasetElementType: !1,
    dataElementType: "point",
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "borderWidth", "radius"]
      }
    }
  };
  static overrides = {
    scales: {
      x: {
        type: "linear"
      },
      y: {
        type: "linear"
      }
    }
  };
  initialize() {
    this.enableOptionSharing = !0, super.initialize();
  }
  parsePrimitiveData(t, e, i, s) {
    const n = super.parsePrimitiveData(t, e, i, s);
    for (let t = 0; t < n.length; t++) n[t]._custom = this.resolveDataElementOptions(t + i).radius;
    return n;
  }
  parseArrayData(t, e, i, s) {
    const n = super.parseArrayData(t, e, i, s);
    for (let t = 0; t < n.length; t++) {
      const s = e[i + t];
      n[t]._custom = responseHandlerFunction(s[2], this.resolveDataElementOptions(t + i).radius);
    }
    return n;
  }
  parseObjectData(t, e, i, s) {
    const n = super.parseObjectData(t, e, i, s);
    for (let t = 0; t < n.length; t++) {
      const s = e[i + t];
      n[t]._custom = responseHandlerFunction(s && s.r && +s.r, this.resolveDataElementOptions(t + i).radius);
    }
    return n;
  }
  getMaxOverflow() {
    const t = this._cachedMeta.data;
    let e = 0;
    for (let i = t.length - 1; i >= 0; --i) e = Math.max(e, t[i].size(this.resolveDataElementOptions(i)) / 2);
    return e > 0 && e;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      i = this.chart.data.labels || [],
      {
        xScale: s,
        yScale: n
      } = e,
      o = this.getParsed(t),
      a = s.getLabelForValue(o.x),
      r = n.getLabelForValue(o.y),
      h = o._custom;
    return {
      label: i[t] || "",
      value: "(" + a + ", " + r + (h ? ", " + h : "") + ")"
    };
  }
  update(t) {
    const e = this._cachedMeta.data;
    this.updateElements(e, 0, e.length, t);
  }
  updateElements(t, e, i, s) {
    const n = "reset" === s,
      {
        iScale: o,
        vScale: a
      } = this._cachedMeta,
      {
        sharedOptions: r,
        includeOptions: h
      } = this._getSharedOptions(e, s),
      l = o.axis,
      c = a.axis;
    for (let d = e; d < e + i; d++) {
      const e = t[d],
        i = !n && this.getParsed(d),
        u = {},
        g = u[l] = n ? o.getPixelForDecimal(.5) : o.getPixelForValue(i[l]),
        p = u[c] = n ? a.getBasePixel() : a.getPixelForValue(i[c]);
      u.skip = isNaN(g) || isNaN(p), h && (u.options = r || this.resolveDataElementOptions(d, e.active ? "active" : s), n && (u.options.radius = 0)), this.updateElement(e, d, u, s);
    }
  }
  resolveDataElementOptions(t, e) {
    const i = this.getParsed(t);
    let s = super.resolveDataElementOptions(t, e);
    s.$shared && (s = Object.assign({}, s, {
      $shared: !1
    }));
    const n = s.radius;
    return "active" !== e && (s.radius = 0), s.radius += responseHandlerFunction(i && i._custom, n), s;
  }
}
function calculateArcSegmentLength(t, e, i) {
  let s = 1,
    n = 1,
    o = 0,
    a = 0;
  if (e < ComponentTypeIdentifier) {
    const r = t,
      h = r + e,
      l = Math.cos(r),
      c = Math.sin(r),
      d = Math.cos(h),
      u = Math.sin(h),
      g = (t, e, s) => documentTitle(t, r, h, !0) ? 1 : Math.max(e, e * i, s, s * i),
      p = (t, e, s) => documentTitle(t, r, h, !0) ? -1 : Math.min(e, e * i, s, s * i),
      f = g(0, l, d),
      m = g(windowReference, c, u),
      x = p(__defaultExportModule, l, d),
      b = p(__defaultExportModule + windowReference, c, u);
    s = (f - x) / 2, n = (m - b) / 2, o = -(f + x) / 2, a = -(m + b) / 2;
  }
  return {
    ratioX: s,
    ratioY: n,
    offsetX: o,
    offsetY: a
  };
}
class DoughnutChartComponent extends ChartComponent {
  static id = "doughnut";
  static defaults = {
    datasetElementType: !1,
    dataElementType: "arc",
    animation: {
      animateRotate: !0,
      animateScale: !1
    },
    animations: {
      numbers: {
        type: "number",
        properties: ["circumference", "endAngle", "innerRadius", "outerRadius", "startAngle", "x", "y", "offset", "borderWidth", "spacing"]
      }
    },
    cutout: "50%",
    rotation: 0,
    circumference: 360,
    radius: "100%",
    spacing: 0,
    indexAxis: "r"
  };
  static descriptors = {
    _scriptable: t => "spacing" !== t,
    _indexable: t => "spacing" !== t && !t.startsWith("borderDash") && !t.startsWith("hoverBorderDash")
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(t) {
            const e = t.data;
            if (e.labels.length && e.datasets.length) {
              const {
                labels: {
                  pointStyle: i,
                  color: s
                }
              } = t.legend.options;
              return e.labels.map((e, n) => {
                const o = t.getDatasetMeta(0).controller.getStyle(n);
                return {
                  text: e,
                  fillStyle: o.backgroundColor,
                  strokeStyle: o.borderColor,
                  fontColor: s,
                  lineWidth: o.borderWidth,
                  pointStyle: i,
                  hidden: !t.getDataVisibility(n),
                  index: n
                };
              });
            }
            return [];
          }
        },
        onClick(t, e, i) {
          i.chart.toggleDataVisibility(e.index), i.chart.update();
        }
      }
    }
  };
  constructor(t, e) {
    super(t, e), this.enableOptionSharing = !0, this.innerRadius = void 0, this.outerRadius = void 0, this.offsetX = void 0, this.offsetY = void 0;
  }
  linkScales() {}
  parse(t, e) {
    const i = this.getDataset().data,
      s = this._cachedMeta;
    if (!1 === this._parsing) s._parsed = i;else {
      let o,
        a,
        r = t => +i[t];
      if (dataIndex(i[t])) {
        const {
          key: t = "value"
        } = this._parsing;
        r = e => +calculateComponentValue(i[e], t);
      }
      for (o = t, a = t + e; o < a; ++o) s._parsed[o] = r(o);
    }
  }
  _getRotation() {
    return dataTransformationFunction(this.options.rotation - 90);
  }
  _getCircumference() {
    return dataTransformationFunction(this.options.circumference);
  }
  _getRotationExtents() {
    let t = ComponentTypeIdentifier,
      e = -ComponentTypeIdentifier;
    for (let i = 0; i < this.chart.data.datasets.length; ++i) if (this.chart.isDatasetVisible(i) && this.chart.getDatasetMeta(i).type === this._type) {
      const s = this.chart.getDatasetMeta(i).controller,
        n = s._getRotation(),
        o = s._getCircumference();
      t = Math.min(t, n), e = Math.max(e, n + o);
    }
    return {
      rotation: t,
      circumference: e - t
    };
  }
  update(t) {
    const e = this.chart,
      {
        chartArea: i
      } = e,
      s = this._cachedMeta,
      n = s.data,
      o = this.getMaxBorderWidth() + this.getMaxOffset(n) + this.options.spacing,
      a = Math.max((Math.min(i.width, i.height) - o) / 2, 0),
      r = Math.min(moduleManager(this.options.cutout, a), 1),
      h = this._getRingWeight(this.index),
      {
        circumference: l,
        rotation: c
      } = this._getRotationExtents(),
      {
        ratioX: d,
        ratioY: u,
        offsetX: g,
        offsetY: p
      } = calculateArcSegmentLength(c, l, r),
      f = (i.width - o) / d,
      m = (i.height - o) / u,
      x = Math.max(Math.min(f, m) / 2, 0),
      innerStartRadius = _defaultExportModule(this.options.radius, x),
      tickIntervalAdjustment = (innerStartRadius - Math.max(innerStartRadius * r, 0)) / this._getVisibleDatasetWeightTotal();
    this.offsetX = g * innerStartRadius, this.offsetY = p * innerStartRadius, s.total = this.calculateTotal(), this.outerRadius = innerStartRadius - tickIntervalAdjustment * this._getRingWeightOffset(this.index), this.innerRadius = Math.max(this.outerRadius - tickIntervalAdjustment * h, 0), this.updateElements(n, 0, n.length, t);
  }
  _circumference(t, e) {
    const i = this.options,
      s = this._cachedMeta,
      n = this._getCircumference();
    return e && i.animation.animateRotate || !this.chart.getDataVisibility(t) || null === s._parsed[t] || s.data[t].hidden ? 0 : this.calculateCircumference(s._parsed[t] * n / ComponentTypeIdentifier);
  }
  updateElements(t, e, i, s) {
    const n = "reset" === s,
      o = this.chart,
      a = o.chartArea,
      r = o.options.animation,
      h = (a.left + a.right) / 2,
      l = (a.top + a.bottom) / 2,
      c = n && r.animateScale,
      d = c ? 0 : this.innerRadius,
      u = c ? 0 : this.outerRadius,
      {
        sharedOptions: g,
        includeOptions: p
      } = this._getSharedOptions(e, s);
    let f,
      m = this._getRotation();
    for (f = 0; f < e; ++f) m += this._circumference(f, n);
    for (f = e; f < e + i; ++f) {
      const e = this._circumference(f, n),
        i = t[f],
        o = {
          x: h + this.offsetX,
          y: l + this.offsetY,
          startAngle: m,
          endAngle: m + e,
          circumference: e,
          outerRadius: u,
          innerRadius: d
        };
      p && (o.options = g || this.resolveDataElementOptions(f, i.active ? "active" : s)), m += e, this.updateElement(i, f, o, s);
    }
  }
  calculateTotal() {
    const t = this._cachedMeta,
      e = t.data;
    let i,
      s = 0;
    for (i = 0; i < e.length; i++) {
      const n = t._parsed[i];
      null === n || isNaN(n) || !this.chart.getDataVisibility(i) || e[i].hidden || (s += Math.abs(n));
    }
    return s;
  }
  calculateCircumference(t) {
    const e = this._cachedMeta.total;
    return e > 0 && !isNaN(t) ? ComponentTypeIdentifier * (Math.abs(t) / e) : 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      i = this.chart,
      s = i.data.labels || [],
      n = calculatedValue(e._parsed[t], i.options.locale);
    return {
      label: s[t] || "",
      value: n
    };
  }
  getMaxBorderWidth(t) {
    let e = 0;
    const i = this.chart;
    let s, n, o, a, r;
    if (!t) for (s = 0, n = i.data.datasets.length; s < n; ++s) if (i.isDatasetVisible(s)) {
      o = i.getDatasetMeta(s), t = o.data, a = o.controller;
      break;
    }
    if (!t) return 0;
    for (s = 0, n = t.length; s < n; ++s) r = a.resolveDataElementOptions(s), "inner" !== r.borderAlign && (e = Math.max(e, r.borderWidth || 0, r.hoverBorderWidth || 0));
    return e;
  }
  getMaxOffset(t) {
    let e = 0;
    for (let i = 0, s = t.length; i < s; ++i) {
      const t = this.resolveDataElementOptions(i);
      e = Math.max(e, t.offset || 0, t.hoverOffset || 0);
    }
    return e;
  }
  _getRingWeightOffset(t) {
    let e = 0;
    for (let i = 0; i < t; ++i) this.chart.isDatasetVisible(i) && (e += this._getRingWeight(i));
    return e;
  }
  _getRingWeight(t) {
    return Math.max(responseHandlerFunction(this.chart.data.datasets[t].weight, 1), 0);
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
class LineChartManager extends ChartComponent {
  static id = "line";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    showLine: !0,
    spanGaps: !1
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category"
      },
      _value_: {
        type: "linear"
      }
    }
  };
  initialize() {
    this.enableOptionSharing = !0, this.supportsDecimation = !0, super.initialize();
  }
  update(t) {
    const e = this._cachedMeta,
      {
        dataset: i,
        data: s = [],
        _dataset: n
      } = e,
      o = this.chart._animationsDisabled;
    let {
      start: a,
      count: r
    } = stringProcessor(e, s, o);
    this._drawStart = a, this._drawCount = r, ___defaultExportModule(e) && (a = 0, r = s.length), i._chart = this.chart, i._datasetIndex = this.index, i._decimated = !!n._decimated, i.points = s;
    const h = this.resolveDatasetElementOptions(t);
    this.options.showLine || (h.borderWidth = 0), h.segment = this.options.segment, this.updateElement(i, void 0, {
      animated: !o,
      options: h
    }, t), this.updateElements(s, a, r, t);
  }
  updateElements(t, e, i, s) {
    const n = "reset" === s,
      {
        iScale: o,
        vScale: a,
        _stacked: r,
        _dataset: h
      } = this._cachedMeta,
      {
        sharedOptions: l,
        includeOptions: c
      } = this._getSharedOptions(e, s),
      d = o.axis,
      u = a.axis,
      {
        spanGaps: g,
        segment: p
      } = this.options,
      m = promiseExecutor(g) ? g : Number.POSITIVE_INFINITY,
      x = this.chart._animationsDisabled || n || "none" === s,
      b = e + i,
      labelItems = t.length;
    let y = e > 0 && this.getParsed(e - 1);
    for (let i = 0; i < labelItems; ++i) {
      const g = t[i],
        _ = x ? g : {};
      if (i < e || i >= b) {
        _.skip = !0;
        continue;
      }
      const v = this.getParsed(i),
        tickInterval = calculateComponentKey(v[u]),
        scaleFactor = _[d] = o.getPixelForValue(v[d], i),
        numberOfSegments = _[u] = n || tickInterval ? a.getBasePixel() : a.getPixelForValue(r ? this.applyStack(a, v, r) : v[u], i);
      _.skip = isNaN(scaleFactor) || isNaN(numberOfSegments) || tickInterval, _.stop = i > 0 && Math.abs(v[d] - y[d]) > m, p && (_.parsed = v, _.raw = h.data[i]), c && (_.options = l || this.resolveDataElementOptions(i, g.active ? "active" : s)), x || this.updateElement(g, i, _, s), y = v;
    }
  }
  getMaxOverflow() {
    const t = this._cachedMeta,
      e = t.dataset,
      i = e.options && e.options.borderWidth || 0,
      s = t.data || [];
    if (!s.length) return i;
    const n = s[0].size(this.resolveDataElementOptions(0)),
      o = s[s.length - 1].size(this.resolveDataElementOptions(s.length - 1));
    return Math.max(i, n, o) / 2;
  }
  draw() {
    const t = this._cachedMeta;
    t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis), super.draw();
  }
}
class PolarAreaChartElement extends ChartComponent {
  static id = "polarArea";
  static defaults = {
    dataElementType: "arc",
    animation: {
      animateRotate: !0,
      animateScale: !0
    },
    animations: {
      numbers: {
        type: "number",
        properties: ["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"]
      }
    },
    indexAxis: "r",
    startAngle: 0
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(t) {
            const e = t.data;
            if (e.labels.length && e.datasets.length) {
              const {
                labels: {
                  pointStyle: i,
                  color: s
                }
              } = t.legend.options;
              return e.labels.map((e, n) => {
                const o = t.getDatasetMeta(0).controller.getStyle(n);
                return {
                  text: e,
                  fillStyle: o.backgroundColor,
                  strokeStyle: o.borderColor,
                  fontColor: s,
                  lineWidth: o.borderWidth,
                  pointStyle: i,
                  hidden: !t.getDataVisibility(n),
                  index: n
                };
              });
            }
            return [];
          }
        },
        onClick(t, e, i) {
          i.chart.toggleDataVisibility(e.index), i.chart.update();
        }
      }
    },
    scales: {
      r: {
        type: "radialLinear",
        angleLines: {
          display: !1
        },
        beginAtZero: !0,
        grid: {
          circular: !0
        },
        pointLabels: {
          display: !1
        },
        startAngle: 0
      }
    }
  };
  constructor(t, e) {
    super(t, e), this.innerRadius = void 0, this.outerRadius = void 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      i = this.chart,
      s = i.data.labels || [],
      n = calculatedValue(e._parsed[t].r, i.options.locale);
    return {
      label: s[t] || "",
      value: n
    };
  }
  parseObjectData(t, e, i, s) {
    return componentInstance.bind(this)(t, e, i, s);
  }
  update(t) {
    const e = this._cachedMeta.data;
    this._updateRadius(), this.updateElements(e, 0, e.length, t);
  }
  getMinMax() {
    const t = this._cachedMeta,
      e = {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY
      };
    return t.data.forEach((t, i) => {
      const s = this.getParsed(i).r;
      !isNaN(s) && this.chart.getDataVisibility(i) && (s < e.min && (e.min = s), s > e.max && (e.max = s));
    }), e;
  }
  _updateRadius() {
    const t = this.chart,
      e = t.chartArea,
      i = t.options,
      s = Math.min(e.right - e.left, e.bottom - e.top),
      n = Math.max(s / 2, 0),
      o = (n - Math.max(i.cutoutPercentage ? n / 100 * i.cutoutPercentage : 1, 0)) / t.getVisibleDatasetCount();
    this.outerRadius = n - o * this.index, this.innerRadius = this.outerRadius - o;
  }
  updateElements(t, e, i, s) {
    const n = "reset" === s,
      o = this.chart,
      a = o.options.animation,
      r = this._cachedMeta.rScale,
      h = r.xCenter,
      l = r.yCenter,
      c = r.getIndexAngle(0) - .5 * __defaultExportModule;
    let d,
      u = c;
    const g = 360 / this.countVisibleElements();
    for (d = 0; d < e; ++d) u += this._computeAngle(d, s, g);
    for (d = e; d < e + i; d++) {
      const e = t[d];
      let i = u,
        p = u + this._computeAngle(d, s, g),
        f = o.getDataVisibility(d) ? r.getDistanceFromCenterForValue(this.getParsed(d).r) : 0;
      u = p, n && (a.animateScale && (f = 0), a.animateRotate && (i = p = c));
      const m = {
        x: h,
        y: l,
        innerRadius: 0,
        outerRadius: f,
        startAngle: i,
        endAngle: p,
        options: this.resolveDataElementOptions(d, e.active ? "active" : s)
      };
      this.updateElement(e, d, m, s);
    }
  }
  countVisibleElements() {
    const t = this._cachedMeta;
    let e = 0;
    return t.data.forEach((t, i) => {
      !isNaN(this.getParsed(i).r) && this.chart.getDataVisibility(i) && e++;
    }), e;
  }
  _computeAngle(t, e, i) {
    return this.chart.getDataVisibility(t) ? dataTransformationFunction(this.resolveDataElementOptions(t, e).angle || i) : 0;
  }
}
class PieChartComponent extends DoughnutChartComponent {
  static id = "pie";
  static defaults = {
    cutout: 0,
    rotation: 0,
    circumference: 360,
    radius: "100%"
  };
}
class RadarChartElement extends ChartComponent {
  static id = "radar";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    indexAxis: "r",
    showLine: !0,
    elements: {
      line: {
        fill: "start"
      }
    }
  };
  static overrides = {
    aspectRatio: 1,
    scales: {
      r: {
        type: "radialLinear"
      }
    }
  };
  getLabelAndValue(t) {
    const e = this._cachedMeta.vScale,
      i = this.getParsed(t);
    return {
      label: e.getLabels()[t],
      value: "" + e.getLabelForValue(i[e.axis])
    };
  }
  parseObjectData(t, e, i, s) {
    return componentInstance.bind(this)(t, e, i, s);
  }
  update(t) {
    const e = this._cachedMeta,
      i = e.dataset,
      s = e.data || [],
      n = e.iScale.getLabels();
    if (i.points = s, "resize" !== t) {
      const e = this.resolveDatasetElementOptions(t);
      this.options.showLine || (e.borderWidth = 0);
      const o = {
        _loop: !0,
        _fullLoop: n.length === s.length,
        options: e
      };
      this.updateElement(i, void 0, o, t);
    }
    this.updateElements(s, 0, s.length, t);
  }
  updateElements(t, e, i, s) {
    const n = this._cachedMeta.rScale,
      o = "reset" === s;
    for (let a = e; a < e + i; a++) {
      const e = t[a],
        i = this.resolveDataElementOptions(a, e.active ? "active" : s),
        r = n.getPointPositionForValue(a, this.getParsed(a).r),
        h = o ? n.xCenter : r.x,
        l = o ? n.yCenter : r.y,
        c = {
          x: h,
          y: l,
          angle: r.angle,
          skip: isNaN(h) || isNaN(l),
          options: i
        };
      this.updateElement(e, a, c, s);
    }
  }
}
class ScatterPlotChart extends ChartComponent {
  static id = "scatter";
  static defaults = {
    datasetElementType: !1,
    dataElementType: "point",
    showLine: !1,
    fill: !1
  };
  static overrides = {
    interaction: {
      mode: "point"
    },
    scales: {
      x: {
        type: "linear"
      },
      y: {
        type: "linear"
      }
    }
  };
  getLabelAndValue(t) {
    const e = this._cachedMeta,
      i = this.chart.data.labels || [],
      {
        xScale: s,
        yScale: n
      } = e,
      o = this.getParsed(t),
      a = s.getLabelForValue(o.x),
      r = n.getLabelForValue(o.y);
    return {
      label: i[t] || "",
      value: "(" + a + ", " + r + ")"
    };
  }
  update(t) {
    const e = this._cachedMeta,
      {
        data: i = []
      } = e,
      s = this.chart._animationsDisabled;
    let {
      start: n,
      count: o
    } = stringProcessor(e, i, s);
    if (this._drawStart = n, this._drawCount = o, ___defaultExportModule(e) && (n = 0, o = i.length), this.options.showLine) {
      this.datasetElementType || this.addElements();
      const {
        dataset: n,
        _dataset: o
      } = e;
      n._chart = this.chart, n._datasetIndex = this.index, n._decimated = !!o._decimated, n.points = i;
      const a = this.resolveDatasetElementOptions(t);
      a.segment = this.options.segment, this.updateElement(n, void 0, {
        animated: !s,
        options: a
      }, t);
    } else this.datasetElementType && (delete e.dataset, this.datasetElementType = !1);
    this.updateElements(i, n, o, t);
  }
  addElements() {
    const {
      showLine: t
    } = this.options;
    !this.datasetElementType && t && (this.datasetElementType = this.chart.registry.getElement("line")), super.addElements();
  }
  updateElements(t, e, i, s) {
    const n = "reset" === s,
      {
        iScale: o,
        vScale: a,
        _stacked: r,
        _dataset: h
      } = this._cachedMeta,
      l = this.resolveDataElementOptions(e, s),
      c = this.getSharedOptions(l),
      d = this.includeOptions(s, c),
      u = o.axis,
      g = a.axis,
      {
        spanGaps: p,
        segment: m
      } = this.options,
      x = promiseExecutor(p) ? p : Number.POSITIVE_INFINITY,
      b = this.chart._animationsDisabled || n || "none" === s;
    let _ = e > 0 && this.getParsed(e - 1);
    for (let l = e; l < e + i; ++l) {
      const e = t[l],
        i = this.getParsed(l),
        p = b ? e : {},
        y = calculateComponentKey(i[g]),
        v = p[u] = o.getPixelForValue(i[u], l),
        M = p[g] = n || y ? a.getBasePixel() : a.getPixelForValue(r ? this.applyStack(a, i, r) : i[g], l);
      p.skip = isNaN(v) || isNaN(M) || y, p.stop = l > 0 && Math.abs(i[u] - _[u]) > x, m && (p.parsed = i, p.raw = h.data[l]), d && (p.options = c || this.resolveDataElementOptions(l, e.active ? "active" : s)), b || this.updateElement(e, l, p, s), _ = i;
    }
    this.updateSharedOptions(c, s, l);
  }
  getMaxOverflow() {
    const t = this._cachedMeta,
      e = t.data || [];
    if (!this.options.showLine) {
      let t = 0;
      for (let i = e.length - 1; i >= 0; --i) t = Math.max(t, e[i].size(this.resolveDataElementOptions(i)) / 2);
      return t > 0 && t;
    }
    const i = t.dataset,
      s = i.options && i.options.borderWidth || 0;
    if (!e.length) return s;
    const n = e[0].size(this.resolveDataElementOptions(0)),
      o = e[e.length - 1].size(this.resolveDataElementOptions(e.length - 1));
    return Math.max(s, n, o) / 2;
  }
}
var ChartControllersRegistry = Object.freeze({
  __proto__: null,
  BarController: BarChartComponent,
  BubbleController: BubbleChartComponent,
  DoughnutController: DoughnutChartComponent,
  LineController: LineChartManager,
  PieController: PieChartComponent,
  PolarAreaController: PolarAreaChartElement,
  RadarController: RadarChartElement,
  ScatterController: ScatterPlotChart
});
function methodNotImplementedError() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
class DateAdapterImplementation {
  static override(t) {
    Object.assign(DateAdapterImplementation.prototype, t);
  }
  options;
  constructor(t) {
    this.options = t || {};
  }
  init() {}
  formats() {
    return methodNotImplementedError();
  }
  parse() {
    return methodNotImplementedError();
  }
  format() {
    return methodNotImplementedError();
  }
  add() {
    return methodNotImplementedError();
  }
  diff() {
    return methodNotImplementedError();
  }
  startOf() {
    return methodNotImplementedError();
  }
  endOf() {
    return methodNotImplementedError();
  }
}
var DateManager = {
  _date: DateAdapterImplementation
};
function processChartData(t, e, i, s) {
  const {
      controller: n,
      data: o,
      _sorted: a
    } = t,
    r = n._cachedMeta.iScale;
  if (r && e === r.axis && "r" !== e && a && o.length) {
    const t = r._reversePixels ? loggingLevel : ___identifierMapping;
    if (!s) return t(o, e, i);
    if (n._sharedOptions) {
      const s = o[0],
        n = "function" == typeof s.getRange && s.getRange(e);
      if (n) {
        const s = t(o, e, i - n),
          a = t(o, e, i + n);
        return {
          lo: s.lo,
          hi: a.hi
        };
      }
    }
  }
  return {
    lo: 0,
    hi: o.length - 1
  };
}
function processVisibleDataSetMetas(t, e, i, s, n) {
  const o = t.getSortedVisibleDatasetMetas(),
    a = i[e];
  for (let t = 0, i = o.length; t < i; ++t) {
    const {
        index: i,
        data: r
      } = o[t],
      {
        lo: h,
        hi: l
      } = processChartData(o[t], e, a, n);
    for (let t = h; t <= l; ++t) {
      const e = r[t];
      e.skip || s(e, i, t);
    }
  }
}
function calculateEuclideanDistance(t) {
  const e = -1 !== t.indexOf("x"),
    i = -1 !== t.indexOf("y");
  return function (t, s) {
    const n = e ? Math.abs(t.x - s.x) : 0,
      o = i ? Math.abs(t.y - s.y) : 0;
    return Math.sqrt(Math.pow(n, 2) + Math.pow(o, 2));
  };
}
function getVisibleElementsInRange(t, e, i, s, n) {
  const o = [];
  if (!n && !t.isPointInArea(e)) return o;
  return processVisibleDataSetMetas(t, i, e, function (i, a, r) {
    (n || ___eventEmitter(i, t.chartArea, 0)) && i.inRange(e.x, e.y, s) && o.push({
      element: i,
      datasetIndex: a,
      index: r
    });
  }, !0), o;
}
function getVisibleElementsInArc(t, e, i, s) {
  let n = [];
  return processVisibleDataSetMetas(t, i, e, function (t, i, o) {
    const {
        startAngle: a,
        endAngle: r
      } = t.getProps(["startAngle", "endAngle"], s),
      {
        angle: h
      } = dataProcessorFunction(t, {
        x: e.x,
        y: e.y
      });
    documentTitle(h, a, r) && n.push({
      element: t,
      datasetIndex: i,
      index: o
    });
  }), n;
}
function _getVisibleElementsInRange(t, e, i, s, n, o) {
  let a = [];
  const r = calculateEuclideanDistance(i);
  let h = Number.POSITIVE_INFINITY;
  return processVisibleDataSetMetas(t, i, e, function (i, l, c) {
    const d = i.inRange(e.x, e.y, n);
    if (s && !d) return;
    const u = i.getCenterPoint(n);
    if (!(!!o || t.isPointInArea(u)) && !d) return;
    const g = r(e, u);
    g < h ? (a = [{
      element: i,
      datasetIndex: l,
      index: c
    }], h = g) : g === h && a.push({
      element: i,
      datasetIndex: l,
      index: c
    });
  }), a;
}
function checkPointInAreaOrRange(t, e, i, s, n, o) {
  return o || t.isPointInArea(e) ? "r" !== i || s ? _getVisibleElementsInRange(t, e, i, s, n, o) : getVisibleElementsInArc(t, e, i, n) : [];
}
function __getElementsInRange(t, e, i, s, n) {
  const o = [],
    a = "x" === i ? "inXRange" : "inYRange";
  let r = !1;
  return processVisibleDataSetMetas(t, i, e, (t, s, h) => {
    t[a](e[i], n) && (o.push({
      element: t,
      datasetIndex: s,
      index: h
    }), r = r || t.inRange(e.x, e.y, n));
  }), s && !r ? [] : o;
}
var interactionEvaluatorConfig = {
  evaluateInteractionItems: processVisibleDataSetMetas,
  modes: {
    index(t, e, i, s) {
      const n = _componentInstance(e, t),
        o = i.axis || "x",
        a = i.includeInvisible || !1,
        r = i.intersect ? getVisibleElementsInRange(t, n, o, s, a) : checkPointInAreaOrRange(t, n, o, !1, s, a),
        h = [];
      return r.length ? (t.getSortedVisibleDatasetMetas().forEach(t => {
        const e = r[0].index,
          i = t.data[e];
        i && !i.skip && h.push({
          element: i,
          datasetIndex: t.index,
          index: e
        });
      }), h) : [];
    },
    dataset(t, e, i, s) {
      const n = _componentInstance(e, t),
        o = i.axis || "xy",
        a = i.includeInvisible || !1;
      let r = i.intersect ? getVisibleElementsInRange(t, n, o, s, a) : checkPointInAreaOrRange(t, n, o, !1, s, a);
      if (r.length > 0) {
        const e = r[0].datasetIndex,
          i = t.getDatasetMeta(e).data;
        r = [];
        for (let t = 0; t < i.length; ++t) r.push({
          element: i[t],
          datasetIndex: e,
          index: t
        });
      }
      return r;
    },
    point: (t, e, i, s) => getVisibleElementsInRange(t, _componentInstance(e, t), i.axis || "xy", s, i.includeInvisible || !1),
    nearest(t, e, i, s) {
      const n = _componentInstance(e, t),
        o = i.axis || "xy",
        a = i.includeInvisible || !1;
      return checkPointInAreaOrRange(t, n, o, i.intersect, s, a);
    },
    x: (t, e, i, s) => __getElementsInRange(t, _componentInstance(e, t), "x", i.intersect, s),
    y: (t, e, i, s) => __getElementsInRange(t, _componentInstance(e, t), "y", i.intersect, s)
  }
};
const borderEdges = ["left", "top", "right", "bottom"];
function filterByPositionValue(t, e) {
  return t.filter(t => t.pos === e);
}
function filterNonAlignedBoxesByAxis(t, e) {
  return t.filter(t => -1 === borderEdges.indexOf(t.pos) && t.box.axis === e);
}
function sortBoxesByWeightAndIndex(t, e) {
  return t.sort((t, i) => {
    const s = e ? i : t,
      n = e ? t : i;
    return s.weight === n.weight ? s.index - n.index : s.weight - n.weight;
  });
}
function generateBoxData(t) {
  const e = [];
  let i, s, n, o, a, r;
  for (i = 0, s = (t || []).length; i < s; ++i) n = t[i], {
    position: o,
    options: {
      stack: a,
      stackWeight: r = 1
    }
  } = n, e.push({
    index: i,
    box: n,
    pos: o,
    horizontal: n.isHorizontal(),
    weight: n.weight,
    stack: a && o + a,
    stackWeight: r
  });
  return e;
}
function computeStackWeights(t) {
  const e = {};
  for (const i of t) {
    const {
      stack: t,
      pos: s,
      stackWeight: n
    } = i;
    if (!t || !borderEdges.includes(s)) continue;
    const o = e[t] || (e[t] = {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    });
    o.count++, o.weight += n;
  }
  return e;
}
function __calculateBoxDimensions(t, e) {
  const i = computeStackWeights(t),
    {
      vBoxMaxWidth: s,
      hBoxMaxHeight: n
    } = e;
  let o, a, r;
  for (o = 0, a = t.length; o < a; ++o) {
    r = t[o];
    const {
        fullSize: a
      } = r.box,
      h = i[r.stack],
      l = h && r.stackWeight / h.weight;
    r.horizontal ? (r.width = l ? l * s : a && e.availableWidth, r.height = n) : (r.width = s, r.height = l ? l * n : a && e.availableHeight);
  }
  return i;
}
function ___calculateBoxDimensions(t) {
  const e = generateBoxData(t),
    i = sortBoxesByWeightAndIndex(e.filter(t => t.box.fullSize), !0),
    s = sortBoxesByWeightAndIndex(filterByPositionValue(e, "left"), !0),
    n = sortBoxesByWeightAndIndex(filterByPositionValue(e, "right")),
    o = sortBoxesByWeightAndIndex(filterByPositionValue(e, "top"), !0),
    a = sortBoxesByWeightAndIndex(filterByPositionValue(e, "bottom")),
    r = filterNonAlignedBoxesByAxis(e, "x"),
    h = filterNonAlignedBoxesByAxis(e, "y");
  return {
    fullSize: i,
    leftAndTop: s.concat(o),
    rightAndBottom: n.concat(h).concat(a).concat(r),
    chartArea: filterByPositionValue(e, "chartArea"),
    vertical: s.concat(n).concat(h),
    horizontal: o.concat(a).concat(r)
  };
}
function calculateMaximumChartDimensions(t, e, i, s) {
  return Math.max(t[i], e[i]) + Math.max(t[s], e[s]);
}
function adjustBoundingBoxDimensions(t, e) {
  t.top = Math.max(t.top, e.top), t.left = Math.max(t.left, e.left), t.bottom = Math.max(t.bottom, e.bottom), t.right = Math.max(t.right, e.right);
}
function updateStackSizeAdjustment(t, e, i, s) {
  const {
      pos: o,
      box: a
    } = i,
    r = t.maxPadding;
  if (!dataIndex(o)) {
    i.size && (t[o] -= i.size);
    const e = s[i.stack] || {
      size: 0,
      count: 1
    };
    e.size = Math.max(e.size, i.horizontal ? a.height : a.width), i.size = e.size / e.count, t[o] += i.size;
  }
  a.getPadding && adjustBoundingBoxDimensions(r, a.getPadding());
  const h = Math.max(0, e.outerWidth - calculateMaximumChartDimensions(r, t, "left", "right")),
    l = Math.max(0, e.outerHeight - calculateMaximumChartDimensions(r, t, "top", "bottom")),
    c = h !== t.w,
    d = l !== t.h;
  return t.w = h, t.h = l, i.horizontal ? {
    same: c,
    other: d
  } : {
    same: d,
    other: c
  };
}
function updatePaddingValues(t) {
  const e = t.maxPadding;
  function i(i) {
    const s = Math.max(e[i] - t[i], 0);
    return t[i] += s, s;
  }
  t.y += i("top"), t.x += i("left"), i("right"), i("bottom");
}
function computePaddingValues(t, e) {
  const i = e.maxPadding;
  function s(t) {
    const s = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    return t.forEach(t => {
      s[t] = Math.max(e[t], i[t]);
    }), s;
  }
  return s(t ? ["left", "right"] : ["top", "bottom"]);
}
function updateBoxDimensions(t, e, i, s) {
  const n = [];
  let o, a, r, h, l, c;
  for (o = 0, a = t.length, l = 0; o < a; ++o) {
    r = t[o], h = r.box, h.update(r.width || e.w, r.height || e.h, computePaddingValues(r.horizontal, e));
    const {
      same: a,
      other: d
    } = updateStackSizeAdjustment(e, i, r, s);
    l |= a && n.length, c = c || d, h.fullSize || n.push(r);
  }
  return l && updateBoxDimensions(n, e, i, s) || c;
}
function _updateBoxDimensions(t, e, i, s, n) {
  t.top = i, t.left = e, t.right = e + s, t.bottom = i + n, t.width = s, t.height = n;
}
function computeBoxDimensions(t, e, i, s) {
  const n = i.padding;
  let {
    x: o,
    y: a
  } = e;
  for (const r of t) {
    const t = r.box,
      h = s[r.stack] || {
        count: 1,
        placed: 0,
        weight: 1
      },
      l = r.stackWeight / h.weight || 1;
    if (r.horizontal) {
      const s = e.w * l,
        o = h.size || t.height;
      userSessionHandler(h.start) && (a = h.start), t.fullSize ? _updateBoxDimensions(t, n.left, a, i.outerWidth - n.right - n.left, o) : _updateBoxDimensions(t, e.left + h.placed, a, s, o), h.start = a, h.placed += s, a = t.bottom;
    } else {
      const s = e.h * l,
        a = h.size || t.width;
      userSessionHandler(h.start) && (o = h.start), t.fullSize ? _updateBoxDimensions(t, o, n.top, a, i.outerHeight - n.bottom - n.top) : _updateBoxDimensions(t, o, e.top + h.placed, a, s), h.start = o, h.placed += s, o = t.right;
    }
  }
  e.x = o, e.y = a;
}
var boxLayoutManager = {
  addBox(t, e) {
    t.boxes || (t.boxes = []), e.fullSize = e.fullSize || !1, e.position = e.position || "top", e.weight = e.weight || 0, e._layers = e._layers || function () {
      return [{
        z: 0,
        draw(t) {
          e.draw(t);
        }
      }];
    }, t.boxes.push(e);
  },
  removeBox(t, e) {
    const i = t.boxes ? t.boxes.indexOf(e) : -1;
    -1 !== i && t.boxes.splice(i, 1);
  },
  configure(t, e, i) {
    e.fullSize = i.fullSize, e.position = i.position, e.weight = i.weight;
  },
  update(t, e, i, s) {
    if (!t) return;
    const n = __responseHandler(t.options.layout.padding),
      o = Math.max(e - n.width, 0),
      a = Math.max(i - n.height, 0),
      r = ___calculateBoxDimensions(t.boxes),
      h = r.vertical,
      l = r.horizontal;
    functionExecutor(t.boxes, t => {
      "function" == typeof t.beforeLayout && t.beforeLayout();
    });
    const c = h.reduce((t, e) => e.box.options && !1 === e.box.options.display ? t : t + 1, 0) || 1,
      d = Object.freeze({
        outerWidth: e,
        outerHeight: i,
        padding: n,
        availableWidth: o,
        availableHeight: a,
        vBoxMaxWidth: o / 2 / c,
        hBoxMaxHeight: a / 2
      }),
      u = Object.assign({}, n);
    adjustBoundingBoxDimensions(u, __responseHandler(s));
    const g = Object.assign({
        maxPadding: u,
        w: o,
        h: a,
        x: n.left,
        y: n.top
      }, n),
      p = __calculateBoxDimensions(h.concat(l), d);
    updateBoxDimensions(r.fullSize, g, d, p), updateBoxDimensions(h, g, d, p), updateBoxDimensions(l, g, d, p) && updateBoxDimensions(h, g, d, p), updatePaddingValues(g), computeBoxDimensions(r.leftAndTop, g, d, p), g.x += g.w, g.y += g.h, computeBoxDimensions(r.rightAndBottom, g, d, p), t.chartArea = {
      left: g.left,
      top: g.top,
      right: g.left + g.w,
      bottom: g.top + g.h,
      height: g.h,
      width: g.w
    }, functionExecutor(r.chartArea, e => {
      const i = e.box;
      Object.assign(i, t.chartArea), i.update(g.w, g.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
class CanvasRenderingContextManager {
  acquireContext(t, e) {}
  releaseContext(t) {
    return !1;
  }
  addEventListener(t, e, i) {}
  removeEventListener(t, e, i) {}
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(t, e, i, s) {
    return e = Math.max(0, e || t.width), i = i || t.height, {
      width: e,
      height: Math.max(0, s ? Math.floor(e / s) : i)
    };
  }
  isAttached(t) {
    return !0;
  }
  updateConfig(t) {}
}
class CanvasRenderingContext2DManager extends CanvasRenderingContextManager {
  acquireContext(t) {
    return t && t.getContext && t.getContext("2d") || null;
  }
  updateConfig(t) {
    t.options.animation = !1;
  }
}
const chartIdentifierKey = "$chartjs",
  pointerEventMappings = {
    touchstart: "mousedown",
    touchmove: "mousemove",
    touchend: "mouseup",
    pointerenter: "mouseenter",
    pointerdown: "mousedown",
    pointermove: "mousemove",
    pointerup: "mouseup",
    pointerleave: "mouseout",
    pointerout: "mouseout"
  },
  isValueNullOrEmpty = t => null === t || "" === t;
function setupCanvasStyles(t, e) {
  const i = t.style,
    s = t.getAttribute("height"),
    n = t.getAttribute("width");
  if (t[chartIdentifierKey] = {
    initial: {
      height: s,
      width: n,
      style: {
        display: i.display,
        height: i.height,
        width: i.width
      }
    }
  }, i.display = i.display || "block", i.boxSizing = i.boxSizing || "border-box", isValueNullOrEmpty(n)) {
    const e = ___value(t, "width");
    void 0 !== e && (t.width = e);
  }
  if (isValueNullOrEmpty(s)) if ("" === t.style.height) t.height = t.width / (e || 2);else {
    const e = ___value(t, "height");
    void 0 !== e && (t.height = e);
  }
  return t;
}
const passiveEventOptions = !!baseValue && {
  passive: !0
};
function addEventListenerWithOptions(t, e, i) {
  t.addEventListener(e, i, passiveEventOptions);
}
function removeCanvasEventListenerWithPassiveSupport(t, e, i) {
  t.canvas.removeEventListener(e, i, passiveEventOptions);
}
function generateChartPointData(t, e) {
  const i = pointerEventMappings[t.type] || t.type,
    {
      x: s,
      y: n
    } = _componentInstance(t, e);
  return {
    type: i,
    chart: e,
    native: t,
    x: void 0 !== s ? s : null,
    y: void 0 !== n ? n : null
  };
}
function isElementInCollection(t, e) {
  for (const i of t) if (i === e || i.contains(e)) return !0;
}
function monitorCanvasChanges(t, e, i) {
  const s = t.canvas,
    n = new MutationObserver(t => {
      let e = !1;
      for (const i of t) e = e || isElementInCollection(i.addedNodes, s), e = e && !isElementInCollection(i.removedNodes, s);
      e && i();
    });
  return n.observe(document, {
    childList: !0,
    subtree: !0
  }), n;
}
function __observeCanvasMutations(t, e, i) {
  const s = t.canvas,
    n = new MutationObserver(t => {
      let e = !1;
      for (const i of t) e = e || isElementInCollection(i.removedNodes, s), e = e && !isElementInCollection(i.addedNodes, s);
      e && i();
    });
  return n.observe(document, {
    childList: !0,
    subtree: !0
  }), n;
}
const devicePixelRatioChangeObservers = new Map();
let currentDevicePixelRatioValue = 0;
function handleDevicePixelRatioChange() {
  const t = window.devicePixelRatio;
  t !== currentDevicePixelRatioValue && (currentDevicePixelRatioValue = t, devicePixelRatioChangeObservers.forEach((e, i) => {
    i.currentDevicePixelRatio !== t && e();
  }));
}
function addResizeObserver(t, e) {
  devicePixelRatioChangeObservers.size || window.addEventListener("resize", handleDevicePixelRatioChange), devicePixelRatioChangeObservers.set(t, e);
}
function unregisterResizeObserver(t) {
  devicePixelRatioChangeObservers.delete(t), devicePixelRatioChangeObservers.size || window.removeEventListener("resize", handleDevicePixelRatioChange);
}
function observeCanvasDimensionChange(t, e, i) {
  const s = t.canvas,
    n = s && _functionHandler(s);
  if (!n) return;
  const o = _identifierMappingRegistry((t, e) => {
      const s = n.clientWidth;
      i(t, e), s < n.clientWidth && i();
    }, window),
    a = new ResizeObserver(t => {
      const e = t[0],
        i = e.contentRect.width,
        s = e.contentRect.height;
      0 === i && 0 === s || o(i, s);
    });
  return a.observe(n), addResizeObserver(t, o), a;
}
function handleResizeObserver(t, e, i) {
  i && i.disconnect(), "resize" === e && unregisterResizeObserver(t);
}
function initializeCanvasEventListeners(t, e, i) {
  const s = t.canvas,
    n = _identifierMappingRegistry(e => {
      null !== t.ctx && i(generateChartPointData(e, t));
    }, t);
  return addEventListenerWithOptions(s, e, n), n;
}
class CanvasRenderingContextHandler extends CanvasRenderingContextManager {
  acquireContext(t, e) {
    const i = t && t.getContext && t.getContext("2d");
    return i && i.canvas === t ? (setupCanvasStyles(t, e), i) : null;
  }
  releaseContext(t) {
    const e = t.canvas;
    if (!e[chartIdentifierKey]) return !1;
    const i = e[chartIdentifierKey].initial;
    ["height", "width"].forEach(t => {
      const s = i[t];
      calculateComponentKey(s) ? e.removeAttribute(t) : e.setAttribute(t, s);
    });
    const s = i.style || {};
    return Object.keys(s).forEach(t => {
      e.style[t] = s[t];
    }), e.width = e.width, delete e[chartIdentifierKey], !0;
  }
  addEventListener(t, e, i) {
    this.removeEventListener(t, e);
    const s = t.$proxies || (t.$proxies = {}),
      n = {
        attach: monitorCanvasChanges,
        detach: __observeCanvasMutations,
        resize: observeCanvasDimensionChange
      }[e] || initializeCanvasEventListeners;
    s[e] = n(t, e, i);
  }
  removeEventListener(t, e) {
    const i = t.$proxies || (t.$proxies = {}),
      s = i[e];
    if (!s) return;
    ({
      attach: handleResizeObserver,
      detach: handleResizeObserver,
      resize: handleResizeObserver
    }[e] || removeCanvasEventListenerWithPassiveSupport)(t, e, s), i[e] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(t, e, i, s) {
    return identifierMappingRegistry(t, e, i, s);
  }
  isAttached(t) {
    const e = _functionHandler(t);
    return !(!e || !e.isConnected);
  }
}
function isOffscreenCanvasAvailable(t) {
  return !__identifierMappingRegistry() || "undefined" != typeof OffscreenCanvas && t instanceof OffscreenCanvas ? CanvasRenderingContext2DManager : CanvasRenderingContextHandler;
}
class CanvasAnimationManager {
  static defaults = {};
  static defaultRoutes = void 0;
  x;
  y;
  active = !1;
  options;
  $animations;
  tooltipPosition(t) {
    const {
      x: e,
      y: i
    } = this.getProps(["x", "y"], t);
    return {
      x: e,
      y: i
    };
  }
  hasValue() {
    return promiseExecutor(this.x) && promiseExecutor(this.y);
  }
  getProps(t, e) {
    const i = this.$animations;
    if (!e || !i) return this;
    const s = {};
    return t.forEach(t => {
      s[t] = i[t] && i[t].active() ? i[t]._to : this[t];
    }), s;
  }
}
function calculateTickCount(t, e) {
  const i = t.options.ticks,
    s = calculateMaxTickCount(t),
    n = Math.min(i.maxTicksLimit || s, s),
    o = i.major.enabled ? getIndicesOfMajorElements(e) : [],
    a = o.length,
    r = o[0],
    h = o[a - 1],
    l = [];
  if (a > n) return insertElementsAtIntervals(e, l, o, a / n), l;
  const c = getMaxLengthOrDefault(o, e, n);
  if (a > 0) {
    let t, i;
    const s = a > 1 ? Math.round((h - r) / (a - 1)) : null;
    for (distributeElementsEvenly(e, l, c, calculateComponentKey(s) ? 0 : r - s, r), t = 0, i = a - 1; t < i; t++) distributeElementsEvenly(e, l, c, o[t], o[t + 1]);
    return distributeElementsEvenly(e, l, c, h, calculateComponentKey(s) ? e.length : h + s), l;
  }
  return distributeElementsEvenly(e, l, c), l;
}
function calculateMaxTickCount(t) {
  const e = t.options.offset,
    i = t._tickSize(),
    s = t._length / i + (e ? 0 : 1),
    n = t._maxLength / i;
  return Math.floor(Math.min(s, n));
}
function getMaxLengthOrDefault(t, e, i) {
  const s = hasConsistentDifference(t),
    n = e.length / i;
  if (!s) return Math.max(n, 1);
  const o = _windowReference(s);
  for (let t = 0, e = o.length - 1; t < e; t++) {
    const e = o[t];
    if (e > n) return e;
  }
  return Math.max(n, 1);
}
function getIndicesOfMajorElements(t) {
  const e = [];
  let i, s;
  for (i = 0, s = t.length; i < s; i++) t[i].major && e.push(i);
  return e;
}
function insertElementsAtIntervals(t, e, i, s) {
  let n,
    o = 0,
    a = i[0];
  for (s = Math.ceil(s), n = 0; n < t.length; n++) n === a && (e.push(t[n]), o++, a = i[o * s]);
}
function distributeElementsEvenly(t, e, i, s, n) {
  const o = responseHandlerFunction(s, 0),
    a = Math.min(responseHandlerFunction(n, t.length), t.length);
  let h,
    l,
    c,
    d = 0;
  for (i = Math.ceil(i), n && (h = n - s, i = h / Math.floor(h / i)), c = o; c < 0;) d++, c = Math.round(o + d * i);
  for (l = Math.max(o, 0); l < a; l++) l === c && (e.push(t[l]), d++, c = Math.round(o + d * i));
}
function hasConsistentDifference(t) {
  const e = t.length;
  let i, s;
  if (e < 2) return !1;
  for (s = t[0], i = 1; i < e; ++i) if (t[i] - t[i - 1] !== s) return !1;
  return s;
}
const toggleHorizontalDirection = t => "left" === t ? "right" : "right" === t ? "left" : t,
  calculatePositionOffset = (t, e, i) => "top" === e || "left" === e ? t[e] + i : t[e] - i,
  calculateMinimumValue = (t, e) => Math.min(e || t, t);
function getEveryNthElement(t, e) {
  const i = [],
    s = t.length / e,
    n = t.length;
  let o = 0;
  for (; o < n; o += s) i.push(t[Math.floor(o)]);
  return i;
}
function getPixelForAdjustedTick(t, e, i) {
  const s = t.ticks.length,
    n = Math.min(e, s - 1),
    o = t._startPixel,
    a = t._endPixel,
    r = 1e-6;
  let h,
    l = t.getPixelForTick(n);
  if (!(i && (h = 1 === s ? Math.max(l - o, a - l) : 0 === e ? (t.getPixelForTick(1) - l) / 2 : (l - t.getPixelForTick(n - 1)) / 2, l += n < e ? h : -h, l < o - r || l > a + r))) return l;
}
function cleanupGarbageCollection(t, e) {
  functionExecutor(t, t => {
    const i = t.gc,
      s = i.length / 2;
    let n;
    if (s > e) {
      for (n = 0; n < s; ++n) delete t.data[i[n]];
      i.splice(0, s);
    }
  });
}
function getTickLengthInPixels(t) {
  return t.drawTicks ? t.tickLength : 0;
}
function calculateTextHeightInPixels(t, e) {
  if (!t.display) return 0;
  const i = _userInputValue(t.font, e),
    s = __responseHandler(t.padding);
  return (elementReference(t.text) ? t.text.length : 1) * i.lineHeight + s.height;
}
function scaleParameters(t, e) {
  return renderComponent(t, {
    scale: e,
    type: "scale"
  });
}
function createTickComponent(t, e, i) {
  return renderComponent(t, {
    tick: i,
    index: e,
    type: "tick"
  });
}
function scaledInputValue(t, e, i) {
  let s = inputFieldValue(t);
  return (i && "right" !== e || !i && "right" === e) && (s = toggleHorizontalDirection(s)), s;
}
function calculateChartPosition(t, e, i, s) {
  const {
      top: o,
      left: a,
      bottom: r,
      right: h,
      chart: l
    } = t,
    {
      chartArea: c,
      scales: d
    } = l;
  let u,
    g,
    p,
    f = 0;
  const m = r - o,
    x = h - a;
  if (t.isHorizontal()) {
    if (g = inputValueAdjusted(s, a, h), dataIndex(i)) {
      const t = Object.keys(i)[0],
        s = i[t];
      p = d[t].getPixelForValue(s) + m - e;
    } else p = "center" === i ? (c.bottom + c.top) / 2 + m - e : calculatePositionOffset(t, i, e);
    u = h - a;
  } else {
    if (dataIndex(i)) {
      const t = Object.keys(i)[0],
        s = i[t];
      g = d[t].getPixelForValue(s) - x + e;
    } else g = "center" === i ? (c.left + c.right) / 2 - x + e : calculatePositionOffset(t, i, e);
    p = inputValueAdjusted(s, r, o), f = "left" === i ? -windowReference : windowReference;
  }
  return {
    titleX: g,
    titleY: p,
    maxWidth: u,
    rotation: f
  };
}
class ___ChartElement extends CanvasAnimationManager {
  constructor(t) {
    super(), this.id = t.id, this.type = t.type, this.options = void 0, this.ctx = t.ctx, this.chart = t.chart, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, this.maxWidth = void 0, this.maxHeight = void 0, this.paddingTop = void 0, this.paddingBottom = void 0, this.paddingLeft = void 0, this.paddingRight = void 0, this.axis = void 0, this.labelRotation = void 0, this.min = void 0, this.max = void 0, this._range = void 0, this.ticks = [], this._gridLineItems = null, this._labelItems = null, this._labelSizes = null, this._length = 0, this._maxLength = 0, this._longestTextCache = {}, this._startPixel = void 0, this._endPixel = void 0, this._reversePixels = !1, this._userMax = void 0, this._userMin = void 0, this._suggestedMax = void 0, this._suggestedMin = void 0, this._ticksLength = 0, this._borderValue = 0, this._cache = {}, this._dataLimitsCached = !1, this.$context = void 0;
  }
  init(t) {
    this.options = t.setContext(this.getContext()), this.axis = t.axis, this._userMin = this.parse(t.min), this._userMax = this.parse(t.max), this._suggestedMin = this.parse(t.suggestedMin), this._suggestedMax = this.parse(t.suggestedMax);
  }
  parse(t, e) {
    return t;
  }
  getUserBounds() {
    let {
      _userMin: t,
      _userMax: e,
      _suggestedMin: i,
      _suggestedMax: s
    } = this;
    return t = dataParameter(t, Number.POSITIVE_INFINITY), e = dataParameter(e, Number.NEGATIVE_INFINITY), i = dataParameter(i, Number.POSITIVE_INFINITY), s = dataParameter(s, Number.NEGATIVE_INFINITY), {
      min: dataParameter(t, i),
      max: dataParameter(e, s),
      minDefined: __dataProcessor(t),
      maxDefined: __dataProcessor(e)
    };
  }
  getMinMax(t) {
    let e,
      {
        min: i,
        max: s,
        minDefined: n,
        maxDefined: o
      } = this.getUserBounds();
    if (n && o) return {
      min: i,
      max: s
    };
    const a = this.getMatchingVisibleMetas();
    for (let r = 0, h = a.length; r < h; ++r) e = a[r].controller.getMinMax(this, t), n || (i = Math.min(i, e.min)), o || (s = Math.max(s, e.max));
    return i = o && i > s ? s : i, s = n && i > s ? i : s, {
      min: dataParameter(i, dataParameter(s, i)),
      max: dataParameter(s, dataParameter(i, s))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const t = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || [];
  }
  getLabelItems(t = this.chart.chartArea) {
    return this._labelItems || (this._labelItems = this._computeLabelItems(t));
  }
  beforeLayout() {
    this._cache = {}, this._dataLimitsCached = !1;
  }
  beforeUpdate() {
    elementQuerySelector(this.options.beforeUpdate, [this]);
  }
  update(t, e, i) {
    const {
        beginAtZero: s,
        grace: n,
        ticks: o
      } = this.options,
      a = o.sampleSize;
    this.beforeUpdate(), this.maxWidth = t, this.maxHeight = e, this._margins = i = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, i), this.ticks = null, this._labelSizes = null, this._gridLineItems = null, this._labelItems = null, this.beforeSetDimensions(), this.setDimensions(), this.afterSetDimensions(), this._maxLength = this.isHorizontal() ? this.width + i.left + i.right : this.height + i.top + i.bottom, this._dataLimitsCached || (this.beforeDataLimits(), this.determineDataLimits(), this.afterDataLimits(), this._range = userId(this, n, s), this._dataLimitsCached = !0), this.beforeBuildTicks(), this.ticks = this.buildTicks() || [], this.afterBuildTicks();
    const r = a < this.ticks.length;
    this._convertTicksToLabels(r ? getEveryNthElement(this.ticks, a) : this.ticks), this.configure(), this.beforeCalculateLabelRotation(), this.calculateLabelRotation(), this.afterCalculateLabelRotation(), o.display && (o.autoSkip || "auto" === o.source) && (this.ticks = calculateTickCount(this, this.ticks), this._labelSizes = null, this.afterAutoSkip()), r && this._convertTicksToLabels(this.ticks), this.beforeFit(), this.fit(), this.afterFit(), this.afterUpdate();
  }
  configure() {
    let t,
      e,
      i = this.options.reverse;
    this.isHorizontal() ? (t = this.left, e = this.right) : (t = this.top, e = this.bottom, i = !i), this._startPixel = t, this._endPixel = e, this._reversePixels = i, this._length = e - t, this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    elementQuerySelector(this.options.afterUpdate, [this]);
  }
  beforeSetDimensions() {
    elementQuerySelector(this.options.beforeSetDimensions, [this]);
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = 0, this.right = this.width) : (this.height = this.maxHeight, this.top = 0, this.bottom = this.height), this.paddingLeft = 0, this.paddingTop = 0, this.paddingRight = 0, this.paddingBottom = 0;
  }
  afterSetDimensions() {
    elementQuerySelector(this.options.afterSetDimensions, [this]);
  }
  _callHooks(t) {
    this.chart.notifyPlugins(t, this.getContext()), elementQuerySelector(this.options[t], [this]);
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
    elementQuerySelector(this.options.beforeTickToLabelConversion, [this]);
  }
  generateTickLabels(t) {
    const e = this.options.ticks;
    let i, s, n;
    for (i = 0, s = t.length; i < s; i++) n = t[i], n.label = elementQuerySelector(e.callback, [n.value, i, t], this);
  }
  afterTickToLabelConversion() {
    elementQuerySelector(this.options.afterTickToLabelConversion, [this]);
  }
  beforeCalculateLabelRotation() {
    elementQuerySelector(this.options.beforeCalculateLabelRotation, [this]);
  }
  calculateLabelRotation() {
    const t = this.options,
      e = t.ticks,
      i = calculateMinimumValue(this.ticks.length, t.ticks.maxTicksLimit),
      s = e.minRotation || 0,
      n = e.maxRotation;
    let o,
      a,
      r,
      h = s;
    if (!this._isVisible() || !e.display || s >= n || i <= 1 || !this.isHorizontal()) return void (this.labelRotation = s);
    const l = this._getLabelSizes(),
      c = l.widest.width,
      d = l.highest.height,
      u = userInputValue(this.chart.width - c, 0, this.maxWidth);
    o = t.offset ? this.maxWidth / i : u / (i - 1), c + 6 > o && (o = u / (i - (t.offset ? .5 : 1)), a = this.maxHeight - getTickLengthInPixels(t.grid) - e.padding - calculateTextHeightInPixels(t.title, this.chart.options.font), r = Math.sqrt(c * c + d * d), h = userSessionData(Math.min(Math.asin(userInputValue((l.highest.height + 6) / o, -1, 1)), Math.asin(userInputValue(a / r, -1, 1)) - Math.asin(userInputValue(d / r, -1, 1)))), h = Math.max(s, Math.min(n, h))), this.labelRotation = h;
  }
  afterCalculateLabelRotation() {
    elementQuerySelector(this.options.afterCalculateLabelRotation, [this]);
  }
  afterAutoSkip() {}
  beforeFit() {
    elementQuerySelector(this.options.beforeFit, [this]);
  }
  fit() {
    const t = {
        width: 0,
        height: 0
      },
      {
        chart: e,
        options: {
          ticks: i,
          title: s,
          grid: n
        }
      } = this,
      o = this._isVisible(),
      a = this.isHorizontal();
    if (o) {
      const o = calculateTextHeightInPixels(s, e.options.font);
      if (a ? (t.width = this.maxWidth, t.height = getTickLengthInPixels(n) + o) : (t.height = this.maxHeight, t.width = getTickLengthInPixels(n) + o), i.display && this.ticks.length) {
        const {
            first: e,
            last: s,
            widest: n,
            highest: o
          } = this._getLabelSizes(),
          r = 2 * i.padding,
          h = dataTransformationFunction(this.labelRotation),
          l = Math.cos(h),
          c = Math.sin(h);
        if (a) {
          const e = i.mirror ? 0 : c * n.width + l * o.height;
          t.height = Math.min(this.maxHeight, t.height + e + r);
        } else {
          const e = i.mirror ? 0 : l * n.width + c * o.height;
          t.width = Math.min(this.maxWidth, t.width + e + r);
        }
        this._calculatePadding(e, s, c, l);
      }
    }
    this._handleMargins(), a ? (this.width = this._length = e.width - this._margins.left - this._margins.right, this.height = t.height) : (this.width = t.width, this.height = this._length = e.height - this._margins.top - this._margins.bottom);
  }
  _calculatePadding(t, e, i, s) {
    const {
        ticks: {
          align: n,
          padding: o
        },
        position: a
      } = this.options,
      r = 0 !== this.labelRotation,
      h = "top" !== a && "x" === this.axis;
    if (this.isHorizontal()) {
      const a = this.getPixelForTick(0) - this.left,
        l = this.right - this.getPixelForTick(this.ticks.length - 1);
      let c = 0,
        d = 0;
      r ? h ? (c = s * t.width, d = i * e.height) : (c = i * t.height, d = s * e.width) : "start" === n ? d = e.width : "end" === n ? c = t.width : "inner" !== n && (c = t.width / 2, d = e.width / 2), this.paddingLeft = Math.max((c - a + o) * this.width / (this.width - a), 0), this.paddingRight = Math.max((d - l + o) * this.width / (this.width - l), 0);
    } else {
      let i = e.height / 2,
        s = t.height / 2;
      "start" === n ? (i = 0, s = t.height) : "end" === n && (i = e.height, s = 0), this.paddingTop = i + o, this.paddingBottom = s + o;
    }
  }
  _handleMargins() {
    this._margins && (this._margins.left = Math.max(this.paddingLeft, this._margins.left), this._margins.top = Math.max(this.paddingTop, this._margins.top), this._margins.right = Math.max(this.paddingRight, this._margins.right), this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom));
  }
  afterFit() {
    elementQuerySelector(this.options.afterFit, [this]);
  }
  isHorizontal() {
    const {
      axis: t,
      position: e
    } = this.options;
    return "top" === e || "bottom" === e || "x" === t;
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(t) {
    let e, i;
    for (this.beforeTickToLabelConversion(), this.generateTickLabels(t), e = 0, i = t.length; e < i; e++) calculateComponentKey(t[e].label) && (t.splice(e, 1), i--, e--);
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let t = this._labelSizes;
    if (!t) {
      const e = this.options.ticks.sampleSize;
      let i = this.ticks;
      e < i.length && (i = getEveryNthElement(i, e)), this._labelSizes = t = this._computeLabelSizes(i, i.length, this.options.ticks.maxTicksLimit);
    }
    return t;
  }
  _computeLabelSizes(t, e, i) {
    const {
        ctx: s,
        _longestTextCache: n
      } = this,
      o = [],
      r = [],
      h = Math.floor(e / calculateMinimumValue(e, i));
    let l,
      c,
      d,
      u,
      g,
      p,
      m,
      x,
      b,
      _,
      y,
      v = 0,
      M = 0;
    for (l = 0; l < e; l += h) {
      if (u = t[l].label, g = this._resolveTickFontOptions(l), s.font = p = g.string, m = n[p] = n[p] || {
        data: {},
        gc: []
      }, x = g.lineHeight, b = _ = 0, calculateComponentKey(u) || elementReference(u)) {
        if (elementReference(u)) for (c = 0, d = u.length; c < d; ++c) y = u[c], calculateComponentKey(y) || elementReference(y) || (b = ____identifierMapping(s, m.data, m.gc, b, y), _ += x);
      } else b = ____identifierMapping(s, m.data, m.gc, b, u), _ = x;
      o.push(b), r.push(_), v = Math.max(b, v), M = Math.max(_, M);
    }
    cleanupGarbageCollection(n, e);
    const w = o.indexOf(v),
      k = r.indexOf(M),
      notificationInterval = t => ({
        width: o[t] || 0,
        height: r[t] || 0
      });
    return {
      first: notificationInterval(0),
      last: notificationInterval(e - 1),
      widest: notificationInterval(w),
      highest: notificationInterval(k),
      widths: o,
      heights: r
    };
  }
  getLabelForValue(t) {
    return t;
  }
  getPixelForValue(t, e) {
    return NaN;
  }
  getValueForPixel(t) {}
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getPixelForDecimal(t) {
    this._reversePixels && (t = 1 - t);
    const e = this._startPixel + t * this._length;
    return sessionKey(this._alignToPixels ? userSessionId(this.chart, e, 0) : e);
  }
  getDecimalForPixel(t) {
    const e = (t - this._startPixel) / this._length;
    return this._reversePixels ? 1 - e : e;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const {
      min: t,
      max: e
    } = this;
    return t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0;
  }
  getContext(t) {
    const e = this.ticks || [];
    if (t >= 0 && t < e.length) {
      const i = e[t];
      return i.$context || (i.$context = createTickComponent(this.getContext(), t, i));
    }
    return this.$context || (this.$context = scaleParameters(this.chart.getContext(), this));
  }
  _tickSize() {
    const t = this.options.ticks,
      e = dataTransformationFunction(this.labelRotation),
      i = Math.abs(Math.cos(e)),
      s = Math.abs(Math.sin(e)),
      n = this._getLabelSizes(),
      o = t.autoSkipPadding || 0,
      a = n ? n.widest.width + o : 0,
      r = n ? n.highest.height + o : 0;
    return this.isHorizontal() ? r * i > a * s ? a / i : r / s : r * s < a * i ? r / i : a / s;
  }
  _isVisible() {
    const t = this.options.display;
    return "auto" !== t ? !!t : this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(t) {
    const e = this.axis,
      i = this.chart,
      s = this.options,
      {
        grid: o,
        position: a,
        border: h
      } = s,
      l = o.offset,
      c = this.isHorizontal(),
      d = this.ticks.length + (l ? 1 : 0),
      u = getTickLengthInPixels(o),
      g = [],
      p = h.setContext(this.getContext()),
      f = p.display ? p.width : 0,
      m = f / 2,
      x = function (t) {
        return userSessionId(i, t, f);
      };
    let b, _, y, v, M, w, k, S, averageBorderRadiusAdjustment, remainingWidthAfterBorderAdjustment, labelItems, labelPositionAdjustment;
    if ("top" === a) b = x(this.bottom), w = this.bottom - u, S = b - m, remainingWidthAfterBorderAdjustment = x(t.top) + m, labelPositionAdjustment = t.bottom;else if ("bottom" === a) b = x(this.top), remainingWidthAfterBorderAdjustment = t.top, labelPositionAdjustment = x(t.bottom) - m, w = b + m, S = this.top + u;else if ("left" === a) b = x(this.right), M = this.right - u, k = b - m, averageBorderRadiusAdjustment = x(t.left) + m, labelItems = t.right;else if ("right" === a) b = x(this.left), averageBorderRadiusAdjustment = t.left, labelItems = x(t.right) - m, M = b + m, k = this.left + u;else if ("x" === e) {
      if ("center" === a) b = x((t.top + t.bottom) / 2 + .5);else if (dataIndex(a)) {
        const t = Object.keys(a)[0],
          e = a[t];
        b = x(this.chart.scales[t].getPixelForValue(e));
      }
      remainingWidthAfterBorderAdjustment = t.top, labelPositionAdjustment = t.bottom, w = b + m, S = w + u;
    } else if ("y" === e) {
      if ("center" === a) b = x((t.left + t.right) / 2);else if (dataIndex(a)) {
        const t = Object.keys(a)[0],
          e = a[t];
        b = x(this.chart.scales[t].getPixelForValue(e));
      }
      M = b - m, k = M - u, averageBorderRadiusAdjustment = t.left, labelItems = t.right;
    }
    const labelAlignmentOffset = responseHandlerFunction(s.ticks.maxTicksLimit, d),
      labelAlignmentPosition = Math.max(1, Math.ceil(d / labelAlignmentOffset));
    for (_ = 0; _ < d; _ += labelAlignmentPosition) {
      const t = this.getContext(_),
        e = o.setContext(t),
        s = h.setContext(t),
        n = e.lineWidth,
        a = e.color,
        r = s.dash || [],
        d = s.dashOffset,
        u = e.tickWidth,
        p = e.tickColor,
        f = e.tickBorderDash || [],
        m = e.tickBorderDashOffset;
      y = getPixelForAdjustedTick(this, _, l), void 0 !== y && (v = userSessionId(i, y, n), c ? M = k = averageBorderRadiusAdjustment = labelItems = v : w = S = remainingWidthAfterBorderAdjustment = labelPositionAdjustment = v, g.push({
        tx1: M,
        ty1: w,
        tx2: k,
        ty2: S,
        x1: averageBorderRadiusAdjustment,
        y1: remainingWidthAfterBorderAdjustment,
        x2: labelItems,
        y2: labelPositionAdjustment,
        width: n,
        color: a,
        borderDash: r,
        borderDashOffset: d,
        tickWidth: u,
        tickColor: p,
        tickBorderDash: f,
        tickBorderDashOffset: m
      }));
    }
    return this._ticksLength = d, this._borderValue = b, g;
  }
  _computeLabelItems(t) {
    const e = this.axis,
      i = this.options,
      {
        position: s,
        ticks: o
      } = i,
      r = this.isHorizontal(),
      h = this.ticks,
      {
        align: l,
        crossAlign: c,
        padding: d,
        mirror: u
      } = o,
      g = getTickLengthInPixels(i.grid),
      p = g + d,
      f = u ? -d : p,
      m = -dataTransformationFunction(this.labelRotation),
      b = [];
    let _,
      y,
      v,
      M,
      w,
      k,
      S,
      D,
      P,
      C,
      A,
      L,
      O = "middle";
    if ("top" === s) k = this.bottom - f, S = this._getXAxisLabelAlignment();else if ("bottom" === s) k = this.top + f, S = this._getXAxisLabelAlignment();else if ("left" === s) {
      const t = this._getYAxisLabelAlignment(g);
      S = t.textAlign, w = t.x;
    } else if ("right" === s) {
      const t = this._getYAxisLabelAlignment(g);
      S = t.textAlign, w = t.x;
    } else if ("x" === e) {
      if ("center" === s) k = (t.top + t.bottom) / 2 + p;else if (dataIndex(s)) {
        const t = Object.keys(s)[0],
          e = s[t];
        k = this.chart.scales[t].getPixelForValue(e) + p;
      }
      S = this._getXAxisLabelAlignment();
    } else if ("y" === e) {
      if ("center" === s) w = (t.left + t.right) / 2 - p;else if (dataIndex(s)) {
        const t = Object.keys(s)[0],
          e = s[t];
        w = this.chart.scales[t].getPixelForValue(e);
      }
      S = this._getYAxisLabelAlignment(g).textAlign;
    }
    "y" === e && ("start" === l ? O = "top" : "end" === l && (O = "bottom"));
    const labelSizes = this._getLabelSizes();
    for (_ = 0, y = h.length; _ < y; ++_) {
      v = h[_], M = v.label;
      const t = o.setContext(this.getContext(_));
      D = this.getPixelForTick(_) + o.labelOffset, P = this._resolveTickFontOptions(_), C = P.lineHeight, A = elementReference(M) ? M.length : 1;
      const e = A / 2,
        i = t.color,
        n = t.textStrokeColor,
        l = t.textStrokeWidth;
      let d,
        g = S;
      if (r ? (w = D, "inner" === S && (g = _ === y - 1 ? this.options.reverse ? "left" : "right" : 0 === _ ? this.options.reverse ? "right" : "left" : "center"), L = "top" === s ? "near" === c || 0 !== m ? -A * C + C / 2 : "center" === c ? -labelSizes.highest.height / 2 - e * C + C : -labelSizes.highest.height + C / 2 : "near" === c || 0 !== m ? C / 2 : "center" === c ? labelSizes.highest.height / 2 - e * C : labelSizes.highest.height - A * C, u && (L *= -1), 0 === m || t.showLabelBackdrop || (w += C / 2 * Math.sin(m))) : (k = D, L = (1 - A) * C / 2), t.showLabelBackdrop) {
        const e = __responseHandler(t.backdropPadding),
          i = labelSizes.heights[_],
          s = labelSizes.widths[_];
        let n = L - e.top,
          o = 0 - e.left;
        switch (O) {
          case "middle":
            n -= i / 2;
            break;
          case "bottom":
            n -= i;
        }
        switch (S) {
          case "center":
            o -= s / 2;
            break;
          case "right":
            o -= s;
        }
        d = {
          left: o,
          top: n,
          width: s + e.width,
          height: i + e.height,
          color: t.backdropColor
        };
      }
      b.push({
        label: M,
        font: P,
        textOffset: L,
        options: {
          rotation: m,
          color: i,
          strokeColor: n,
          strokeWidth: l,
          textAlign: g,
          textBaseline: O,
          translation: [w, k],
          backdrop: d
        }
      });
    }
    return b;
  }
  _getXAxisLabelAlignment() {
    const {
      position: t,
      ticks: e
    } = this.options;
    if (-dataTransformationFunction(this.labelRotation)) return "top" === t ? "left" : "right";
    let i = "center";
    return "start" === e.align ? i = "left" : "end" === e.align ? i = "right" : "inner" === e.align && (i = "inner"), i;
  }
  _getYAxisLabelAlignment(t) {
    const {
        position: e,
        ticks: {
          crossAlign: i,
          mirror: s,
          padding: n
        }
      } = this.options,
      o = t + n,
      a = this._getLabelSizes().widest.width;
    let r, h;
    return "left" === e ? s ? (h = this.right + n, "near" === i ? r = "left" : "center" === i ? (r = "center", h += a / 2) : (r = "right", h += a)) : (h = this.right - o, "near" === i ? r = "right" : "center" === i ? (r = "center", h -= a / 2) : (r = "left", h = this.left)) : "right" === e ? s ? (h = this.left + n, "near" === i ? r = "right" : "center" === i ? (r = "center", h -= a / 2) : (r = "left", h -= a)) : (h = this.left + o, "near" === i ? r = "left" : "center" === i ? (r = "center", h += a / 2) : (r = "right", h = this.right)) : r = "right", {
      textAlign: r,
      x: h
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror) return;
    const t = this.chart,
      e = this.options.position;
    return "left" === e || "right" === e ? {
      top: 0,
      left: this.left,
      bottom: t.height,
      right: this.right
    } : "top" === e || "bottom" === e ? {
      top: this.top,
      left: 0,
      bottom: this.bottom,
      right: t.width
    } : void 0;
  }
  drawBackground() {
    const {
      ctx: t,
      options: {
        backgroundColor: e
      },
      left: i,
      top: s,
      width: n,
      height: o
    } = this;
    e && (t.save(), t.fillStyle = e, t.fillRect(i, s, n, o), t.restore());
  }
  getLineWidthForValue(t) {
    const e = this.options.grid;
    if (!this._isVisible() || !e.display) return 0;
    const i = this.ticks.findIndex(e => e.value === t);
    if (i >= 0) {
      return e.setContext(this.getContext(i)).lineWidth;
    }
    return 0;
  }
  drawGrid(t) {
    const e = this.options.grid,
      i = this.ctx,
      s = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t));
    let n, o;
    const a = (t, e, s) => {
      s.width && s.color && (i.save(), i.lineWidth = s.width, i.strokeStyle = s.color, i.setLineDash(s.borderDash || []), i.lineDashOffset = s.borderDashOffset, i.beginPath(), i.moveTo(t.x, t.y), i.lineTo(e.x, e.y), i.stroke(), i.restore());
    };
    if (e.display) for (n = 0, o = s.length; n < o; ++n) {
      const t = s[n];
      e.drawOnChartArea && a({
        x: t.x1,
        y: t.y1
      }, {
        x: t.x2,
        y: t.y2
      }, t), e.drawTicks && a({
        x: t.tx1,
        y: t.ty1
      }, {
        x: t.tx2,
        y: t.ty2
      }, {
        color: t.tickColor,
        width: t.tickWidth,
        borderDash: t.tickBorderDash,
        borderDashOffset: t.tickBorderDashOffset
      });
    }
  }
  drawBorder() {
    const {
        chart: t,
        ctx: e,
        options: {
          border: i,
          grid: s
        }
      } = this,
      n = i.setContext(this.getContext()),
      o = i.display ? n.width : 0;
    if (!o) return;
    const a = s.setContext(this.getContext(0)).lineWidth,
      r = this._borderValue;
    let h, l, c, d;
    this.isHorizontal() ? (h = userSessionId(t, this.left, o) - o / 2, l = userSessionId(t, this.right, a) + a / 2, c = d = r) : (c = userSessionId(t, this.top, o) - o / 2, d = userSessionId(t, this.bottom, a) + a / 2, h = l = r), e.save(), e.lineWidth = n.width, e.strokeStyle = n.color, e.beginPath(), e.moveTo(h, c), e.lineTo(l, d), e.stroke(), e.restore();
  }
  drawLabels(t) {
    if (!this.options.ticks.display) return;
    const e = this.ctx,
      i = this._computeLabelArea();
    i && valueRepresentation(e, i);
    const s = this.getLabelItems(t);
    for (const t of s) {
      const i = t.options,
        s = t.font,
        n = t.label,
        o = t.textOffset;
      _____identifierMapping(e, n, 0, o, s, i);
    }
    i && currencySymbol(e);
  }
  drawTitle() {
    const {
      ctx: t,
      options: {
        position: e,
        title: i,
        reverse: s
      }
    } = this;
    if (!i.display) return;
    const o = _userInputValue(i.font),
      r = __responseHandler(i.padding),
      h = i.align;
    let l = o.lineHeight / 2;
    "bottom" === e || "center" === e || dataIndex(e) ? (l += r.bottom, elementReference(i.text) && (l += o.lineHeight * (i.text.length - 1))) : l += r.top;
    const {
      titleX: c,
      titleY: d,
      maxWidth: u,
      rotation: g
    } = calculateChartPosition(this, l, e, h);
    _____identifierMapping(t, i.text, 0, 0, o, {
      color: i.color,
      maxWidth: u,
      rotation: g,
      textAlign: scaledInputValue(h, e, s),
      textBaseline: "middle",
      translation: [c, d]
    });
  }
  draw(t) {
    this._isVisible() && (this.drawBackground(), this.drawGrid(t), this.drawBorder(), this.drawTitle(), this.drawLabels(t));
  }
  _layers() {
    const t = this.options,
      e = t.ticks && t.ticks.z || 0,
      i = responseHandlerFunction(t.grid && t.grid.z, -1),
      s = responseHandlerFunction(t.border && t.border.z, 0);
    return this._isVisible() && this.draw === ___ChartElement.prototype.draw ? [{
      z: i,
      draw: t => {
        this.drawBackground(), this.drawGrid(t), this.drawTitle();
      }
    }, {
      z: s,
      draw: () => {
        this.drawBorder();
      }
    }, {
      z: e,
      draw: t => {
        this.drawLabels(t);
      }
    }] : [{
      z: e,
      draw: t => {
        this.draw(t);
      }
    }];
  }
  getMatchingVisibleMetas(t) {
    const e = this.chart.getSortedVisibleDatasetMetas(),
      i = this.axis + "AxisID",
      s = [];
    let n, o;
    for (n = 0, o = e.length; n < o; ++n) {
      const o = e[n];
      o[i] !== this.id || t && o.type !== t || s.push(o);
    }
    return s;
  }
  _resolveTickFontOptions(t) {
    const e = this.options.ticks.setContext(this.getContext(t));
    return _userInputValue(e.font);
  }
  _maxDigits() {
    const t = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / t;
  }
}
class ChartDataSetManager {
  constructor(t, e, i) {
    this.type = t, this.scope = e, this.override = i, this.items = Object.create(null);
  }
  isForType(t) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype);
  }
  register(t) {
    const e = Object.getPrototypeOf(t);
    let i;
    hasIdAndDefaultsCheck(e) && (i = this.register(e));
    const s = this.items,
      n = t.id,
      a = this.scope + "." + n;
    if (!n) throw new Error("class does not have id: " + t);
    return n in s || (s[n] = t, initializeRouteConfiguration(t, a, i), this.override && _dataProcessor.override(t.id, t.overrides)), a;
  }
  get(t) {
    return this.items[t];
  }
  unregister(t) {
    const e = this.items,
      i = t.id,
      s = this.scope;
    i in e && delete e[i], s && i in _dataProcessor[s] && (delete _dataProcessor[s][i], this.override && delete currentState[i]);
  }
}
function initializeRouteConfiguration(t, e, i) {
  const s = networkRequestTimeout(Object.create(null), [i ? _dataProcessor.get(i) : {}, _dataProcessor.get(e), t.defaults]);
  _dataProcessor.set(e, s), t.defaultRoutes && registerRouteHandlers(e, t.defaultRoutes), t.descriptors && _dataProcessor.describe(e, t.descriptors);
}
function registerRouteHandlers(t, e) {
  Object.keys(e).forEach(i => {
    const s = i.split("."),
      n = s.pop(),
      a = [t].concat(s).join("."),
      r = e[i].split("."),
      h = r.pop(),
      l = r.join(".");
    _dataProcessor.route(a, n, l, h);
  });
}
function hasIdAndDefaultsCheck(t) {
  return "id" in t && "defaults" in t;
}
class _ChartManager {
  constructor() {
    this.controllers = new ChartDataSetManager(ChartComponent, "datasets", !0), this.elements = new ChartDataSetManager(CanvasAnimationManager, "elements"), this.plugins = new ChartDataSetManager(Object, "plugins"), this.scales = new ChartDataSetManager(___ChartElement, "scales"), this._typedRegistries = [this.controllers, this.scales, this.elements];
  }
  add(...t) {
    this._each("register", t);
  }
  remove(...t) {
    this._each("unregister", t);
  }
  addControllers(...t) {
    this._each("register", t, this.controllers);
  }
  addElements(...t) {
    this._each("register", t, this.elements);
  }
  addPlugins(...t) {
    this._each("register", t, this.plugins);
  }
  addScales(...t) {
    this._each("register", t, this.scales);
  }
  getController(t) {
    return this._get(t, this.controllers, "controller");
  }
  getElement(t) {
    return this._get(t, this.elements, "element");
  }
  getPlugin(t) {
    return this._get(t, this.plugins, "plugin");
  }
  getScale(t) {
    return this._get(t, this.scales, "scale");
  }
  removeControllers(...t) {
    this._each("unregister", t, this.controllers);
  }
  removeElements(...t) {
    this._each("unregister", t, this.elements);
  }
  removePlugins(...t) {
    this._each("unregister", t, this.plugins);
  }
  removeScales(...t) {
    this._each("unregister", t, this.scales);
  }
  _each(t, e, i) {
    [...e].forEach(e => {
      const s = i || this._getRegistryForType(e);
      i || s.isForType(e) || s === this.plugins && e.id ? this._exec(t, s, e) : functionExecutor(e, e => {
        const s = i || this._getRegistryForType(e);
        this._exec(t, s, e);
      });
    });
  }
  _exec(t, e, i) {
    const s = offsetAdjustment(t);
    elementQuerySelector(i["before" + s], [], i), e[t](i), elementQuerySelector(i["after" + s], [], i);
  }
  _getRegistryForType(t) {
    for (let e = 0; e < this._typedRegistries.length; e++) {
      const i = this._typedRegistries[e];
      if (i.isForType(t)) return i;
    }
    return this.plugins;
  }
  _get(t, e, i) {
    const s = e.get(t);
    if (void 0 === s) throw new Error('"' + t + '" is not a registered ' + i + ".");
    return s;
  }
}
var chartRegistryManager = new _ChartManager();
class NotificationController {
  constructor() {
    this._init = [];
  }
  notify(t, e, i, s) {
    "beforeInit" === e && (this._init = this._createDescriptors(t, !0), this._notify(this._init, t, "install"));
    const n = s ? this._descriptors(t).filter(s) : this._descriptors(t),
      o = this._notify(n, t, e, i);
    return "afterDestroy" === e && (this._notify(n, t, "stop"), this._notify(this._init, t, "uninstall")), o;
  }
  _notify(t, e, i, s) {
    s = s || {};
    for (const n of t) {
      const t = n.plugin,
        o = t[i],
        a = [e, s, n.options];
      if (!1 === elementQuerySelector(o, a, t) && s.cancelable) return !1;
    }
    return !0;
  }
  invalidate() {
    calculateComponentKey(this._cache) || (this._oldCache = this._cache, this._cache = void 0);
  }
  _descriptors(t) {
    if (this._cache) return this._cache;
    const e = this._cache = this._createDescriptors(t);
    return this._notifyStateChanges(t), e;
  }
  _createDescriptors(t, e) {
    const i = t && t.config,
      s = responseHandlerFunction(i.options && i.options.plugins, {}),
      n = gatherActivePlugins(i);
    return !1 !== s || e ? applyPlugins(t, n, s, e) : [];
  }
  _notifyStateChanges(t) {
    const e = this._oldCache || [],
      i = this._cache,
      s = (t, e) => t.filter(t => !e.some(e => t.plugin.id === e.plugin.id));
    this._notify(s(e, i), t, "stop"), this._notify(s(i, e), t, "start");
  }
}
function gatherActivePlugins(t) {
  const e = {},
    i = [],
    s = Object.keys(chartRegistryManager.plugins.items);
  for (let t = 0; t < s.length; t++) i.push(chartRegistryManager.getPlugin(s[t]));
  const n = t.plugins || [];
  for (let t = 0; t < n.length; t++) {
    const s = n[t];
    -1 === i.indexOf(s) && (i.push(s), e[s.id] = !0);
  }
  return {
    plugins: i,
    localIds: e
  };
}
function getPluginConfiguration(t, e) {
  return e || !1 !== t ? !0 === t ? {} : t : null;
}
function applyPlugins(t, {
  plugins: e,
  localIds: i
}, s, n) {
  const o = [],
    a = t.getContext();
  for (const r of e) {
    const e = r.id,
      h = getPluginConfiguration(s[e], n);
    null !== h && o.push({
      plugin: r,
      options: resolvePluginOptions(t.config, {
        plugin: r,
        local: i[e]
      }, h, a)
    });
  }
  return o;
}
function resolvePluginOptions(t, {
  plugin: e,
  local: i
}, s, n) {
  const o = t.pluginScopeKeys(e),
    a = t.getOptionScopes(s, o);
  return i && e.defaults && a.push(e.defaults), t.createResolver(a, n, [""], {
    scriptable: !1,
    indexable: !1,
    allKeys: !0
  });
}
function getAxisOrientation(t, e) {
  const i = _dataProcessor.datasets[t] || {};
  return ((e.datasets || {})[t] || {}).indexAxis || e.indexAxis || i.indexAxis || "x";
}
function determineAxisForValue(t, e) {
  let i = t;
  return "_index_" === t ? i = e : "_value_" === t && (i = "x" === e ? "y" : "x"), i;
}
function _determineAxisType(t, e) {
  return t === e ? "_index_" : "_value_";
}
function getValidAxisIdentifier(t) {
  if ("x" === t || "y" === t || "r" === t) return t;
}
function getAxisDirectionFromPosition(t) {
  return "top" === t || "bottom" === t ? "x" : "left" === t || "right" === t ? "y" : void 0;
}
function inferAxisType(t, ...e) {
  if (getValidAxisIdentifier(t)) return t;
  for (const i of e) {
    const e = i.axis || getAxisDirectionFromPosition(i.position) || t.length > 1 && getValidAxisIdentifier(t[0].toLowerCase());
    if (e) return e;
  }
  throw new Error(`Cannot determine type of '${t}' axis. Please provide 'axis' or 'position' option.`);
}
function getAxisById(t, e, i) {
  if (i[e + "AxisID"] === t) return {
    axis: e
  };
}
function retrieveDatasetAxisInfo(t, e) {
  if (e.data && e.data.datasets) {
    const i = e.data.datasets.filter(e => e.xAxisID === t || e.yAxisID === t);
    if (i.length) return getAxisById(t, "x", i[0]) || getAxisById(t, "y", i[0]);
  }
  return {};
}
function retrieveScaleConfiguration(t, e) {
  const i = currentState[t.type] || {
      scales: {}
    },
    s = e.scales || {},
    a = getAxisOrientation(t.type, e),
    r = Object.create(null);
  return Object.keys(s).forEach(e => {
    const h = s[e];
    if (!dataIndex(h)) return console.error(`Invalid scale configuration for scale: ${e}`);
    if (h._proxy) return console.warn(`Ignoring resolver passed as options for scale: ${e}`);
    const l = inferAxisType(e, h, retrieveDatasetAxisInfo(e, t), _dataProcessor.scales[h.type]),
      c = _determineAxisType(l, a),
      d = i.scales || {};
    r[e] = dataTypeIdentifier(Object.create(null), [{
      axis: l
    }, h, d[l], d[c]]);
  }), t.data.datasets.forEach(i => {
    const n = i.type || t.type,
      o = i.indexAxis || getAxisOrientation(n, e),
      a = (currentState[n] || {}).scales || {};
    Object.keys(a).forEach(t => {
      const e = determineAxisForValue(t, o),
        n = i[e + "AxisID"] || e;
      r[n] = r[n] || Object.create(null), dataTypeIdentifier(r[n], [{
        axis: e
      }, s[n], a[t]]);
    });
  }), Object.keys(r).forEach(t => {
    const e = r[t];
    dataTypeIdentifier(e, [_dataProcessor.scales[e.type], _dataProcessor.scale]);
  }), r;
}
function configureScaleOptions(t) {
  const e = t.options || (t.options = {});
  e.plugins = responseHandlerFunction(e.plugins, {}), e.scales = retrieveScaleConfiguration(t, e);
}
function prepareChartData(t) {
  return (t = t || {}).datasets = t.datasets || [], t.labels = t.labels || [], t;
}
function configureChartSettings(t) {
  return (t = t || {}).data = prepareChartData(t.data), configureScaleOptions(t), t;
}
const chartDataInstances = new Map(),
  uniqueChartInstances = new Set();
function retrieveOrInstantiatePlugin(t, e) {
  let i = chartDataInstances.get(t);
  return i || (i = e(), chartDataInstances.set(t, i), uniqueChartInstances.add(i)), i;
}
const addDatasetIfValueDefined = (t, e, i) => {
  const s = calculateComponentValue(e, i);
  void 0 !== s && t.add(s);
};
class ChartConfigurationManager {
  constructor(t) {
    this._config = configureChartSettings(t), this._scopeCache = new Map(), this._resolverCache = new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(t) {
    this._config.type = t;
  }
  get data() {
    return this._config.data;
  }
  set data(t) {
    this._config.data = prepareChartData(t);
  }
  get options() {
    return this._config.options;
  }
  set options(t) {
    this._config.options = t;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const t = this._config;
    this.clearCache(), configureScaleOptions(t);
  }
  clearCache() {
    this._scopeCache.clear(), this._resolverCache.clear();
  }
  datasetScopeKeys(t) {
    return retrieveOrInstantiatePlugin(t, () => [[`datasets.${t}`, ""]]);
  }
  datasetAnimationScopeKeys(t, e) {
    return retrieveOrInstantiatePlugin(`${t}.transition.${e}`, () => [[`datasets.${t}.transitions.${e}`, `transitions.${e}`], [`datasets.${t}`, ""]]);
  }
  datasetElementScopeKeys(t, e) {
    return retrieveOrInstantiatePlugin(`${t}-${e}`, () => [[`datasets.${t}.elements.${e}`, `datasets.${t}`, `elements.${e}`, ""]]);
  }
  pluginScopeKeys(t) {
    const e = t.id;
    return retrieveOrInstantiatePlugin(`${this.type}-plugin-${e}`, () => [[`plugins.${e}`, ...(t.additionalOptionScopes || [])]]);
  }
  _cachedScopes(t, e) {
    const i = this._scopeCache;
    let s = i.get(t);
    return s && !e || (s = new Map(), i.set(t, s)), s;
  }
  getOptionScopes(t, e, i) {
    const {
        options: s,
        type: n
      } = this,
      a = this._cachedScopes(t, i),
      r = a.get(e);
    if (r) return r;
    const h = new Set();
    e.forEach(e => {
      t && (h.add(t), e.forEach(e => addDatasetIfValueDefined(h, t, e))), e.forEach(t => addDatasetIfValueDefined(h, s, t)), e.forEach(t => addDatasetIfValueDefined(h, currentState[n] || {}, t)), e.forEach(t => addDatasetIfValueDefined(h, _dataProcessor, t)), e.forEach(t => addDatasetIfValueDefined(h, animationDuration, t));
    });
    const l = Array.from(h);
    return 0 === l.length && l.push(Object.create(null)), uniqueChartInstances.has(e) && a.set(e, l), l;
  }
  chartOptionScopes() {
    const {
      options: t,
      type: e
    } = this;
    return [t, currentState[e] || {}, _dataProcessor.datasets[e] || {}, {
      type: e
    }, _dataProcessor, animationDuration];
  }
  resolveNamedOptions(t, e, i, s = [""]) {
    const n = {
        $shared: !0
      },
      {
        resolver: o,
        subPrefixes: a
      } = retrieveResolverFromCache(this._resolverCache, t, s);
    let r = o;
    if (isScriptableAndIndexable(o, e)) {
      n.$shared = !1, i = animationTracker(i) ? i() : i;
      const e = this.createResolver(t, i, a);
      r = elementHeight(o, i, e);
    }
    for (const t of e) n[t] = r[t];
    return n;
  }
  createResolver(t, e, i = [""], s) {
    const {
      resolver: o
    } = retrieveResolverFromCache(this._resolverCache, t, i);
    return dataIndex(e) ? elementHeight(o, e, void 0, s) : o;
  }
}
function retrieveResolverFromCache(t, e, i) {
  let s = t.get(e);
  s || (s = new Map(), t.set(e, s));
  const n = i.join();
  let o = s.get(n);
  if (!o) {
    o = {
      resolver: lastElementIndex(e, i),
      subPrefixes: i.filter(t => !t.toLowerCase().includes("hover"))
    }, s.set(n, o);
  }
  return o;
}
const hasPropertiesTrackedByRuntime = t => dataIndex(t) && Object.getOwnPropertyNames(t).reduce((e, i) => e || animationTracker(t[i]), !1);
function isScriptableAndIndexable(t, e) {
  const {
    isScriptable: i,
    isIndexable: s
  } = currentTimeInMillis(t);
  for (const n of e) {
    const e = i(n),
      o = s(n),
      r = (o || e) && t[n];
    if (e && (animationTracker(r) || hasPropertiesTrackedByRuntime(r)) || o && elementReference(r)) return !0;
  }
  return !1;
}
var chartVersionString = "4.4.0";
const chartPositioningOptions = ["top", "bottom", "left", "right", "chartArea"];
function isPositionVertical(t, e) {
  return "top" === t || "bottom" === t || -1 === chartPositioningOptions.indexOf(t) && "x" === e;
}
function compareObjectsByProperty(t, e) {
  return function (i, s) {
    return i[t] === s[t] ? i[e] - s[e] : i[t] - s[t];
  };
}
function notifyPluginsAfterRender(t) {
  const e = t.chart,
    i = e.options.animation;
  e.notifyPlugins("afterRender"), elementQuerySelector(i && i.onComplete, [t], e);
}
function executeAnimationProgressCallback(t) {
  const e = t.chart,
    i = e.options.animation;
  elementQuerySelector(i && i.onProgress, [t], e);
}
function retrieveCanvasElement(t) {
  return __identifierMappingRegistry() && "string" == typeof t ? t = document.getElementById(t) : t && t.length && (t = t[0]), t && t.canvas && (t = t.canvas), t;
}
const chartRegistry = {},
  getChartInstanceByCanvasElement = t => {
    const e = retrieveCanvasElement(t);
    return Object.values(chartRegistry).filter(t => t.canvas === e).pop();
  };
function adjustCanvasElementPositions(t, e, i) {
  const s = Object.keys(t);
  for (const n of s) {
    const s = +n;
    if (s >= e) {
      const o = t[n];
      delete t[n], (i > 0 || s > e) && (t[s + i] = o);
    }
  }
}
function extractMouseEventData(t, e, i, s) {
  return i && "mouseout" !== t.type ? s ? e : t : null;
}
function getClippedValueOrDefault(t, e, i) {
  return t.options.clip ? t[i] : e[i];
}
function _calculateBoundingBox(t, e) {
  const {
    xScale: i,
    yScale: s
  } = t;
  return i && s ? {
    left: getClippedValueOrDefault(i, e, "left"),
    right: getClippedValueOrDefault(i, e, "right"),
    top: getClippedValueOrDefault(s, e, "top"),
    bottom: getClippedValueOrDefault(s, e, "bottom")
  } : e;
}
class __ChartManager {
  static defaults = _dataProcessor;
  static instances = chartRegistry;
  static overrides = currentState;
  static registry = chartRegistryManager;
  static version = chartVersionString;
  static getChart = getChartInstanceByCanvasElement;
  static register(...t) {
    chartRegistryManager.add(...t), invalidateChartPlugins();
  }
  static unregister(...t) {
    chartRegistryManager.remove(...t), invalidateChartPlugins();
  }
  constructor(t, e) {
    const i = this.config = new ChartConfigurationManager(e),
      s = retrieveCanvasElement(t),
      n = getChartInstanceByCanvasElement(s);
    if (n) throw new Error("Canvas is already in use. Chart with ID '" + n.id + "' must be destroyed before the canvas with ID '" + n.canvas.id + "' can be reused.");
    const o = i.createResolver(i.chartOptionScopes(), this.getContext());
    this.platform = new (i.platform || isOffscreenCanvasAvailable(s))(), this.platform.updateConfig(i);
    const a = this.platform.acquireContext(s, o.aspectRatio),
      r = a && a.canvas,
      h = r && r.height,
      l = r && r.width;
    this.id = ___dataProcessor(), this.ctx = a, this.canvas = r, this.width = l, this.height = h, this._options = o, this._aspectRatio = this.aspectRatio, this._layers = [], this._metasets = [], this._stacks = void 0, this.boxes = [], this.currentDevicePixelRatio = void 0, this.chartArea = void 0, this._active = [], this._lastEvent = void 0, this._listeners = {}, this._responsiveListeners = void 0, this._sortedMetasets = [], this.scales = {}, this._plugins = new NotificationController(), this.$proxies = {}, this._hiddenIndices = {}, this.attached = !1, this._animationsDisabled = void 0, this.$context = void 0, this._doResize = globalTransformationMatrix(t => this.update(t), o.resizeDelay || 0), this._dataChanges = [], chartRegistry[this.id] = this, a && r ? (__chartManagerInstance.listen(this, "complete", notifyPluginsAfterRender), __chartManagerInstance.listen(this, "progress", executeAnimationProgressCallback), this._initialize(), this.attached && this.update()) : console.error("Failed to create chart: can't acquire context from the given item");
  }
  get aspectRatio() {
    const {
      options: {
        aspectRatio: t,
        maintainAspectRatio: e
      },
      width: i,
      height: s,
      _aspectRatio: n
    } = this;
    return calculateComponentKey(t) ? e && n ? n : s ? i / s : null : t;
  }
  get data() {
    return this.config.data;
  }
  set data(t) {
    this.config.data = t;
  }
  get options() {
    return this._options;
  }
  set options(t) {
    this.config.options = t;
  }
  get registry() {
    return chartRegistryManager;
  }
  _initialize() {
    return this.notifyPlugins("beforeInit"), this.options.responsive ? this.resize() : coordinatePoint(this, this.options.devicePixelRatio), this.bindEvents(), this.notifyPlugins("afterInit"), this;
  }
  clear() {
    return fileFormat(this.canvas, this.ctx), this;
  }
  stop() {
    return __chartManagerInstance.stop(this), this;
  }
  resize(t, e) {
    __chartManagerInstance.running(this) ? this._resizeBeforeDraw = {
      width: t,
      height: e
    } : this._resize(t, e);
  }
  _resize(t, e) {
    const i = this.options,
      s = this.canvas,
      n = i.maintainAspectRatio && this.aspectRatio,
      o = this.platform.getMaximumSize(s, t, e, n),
      a = i.devicePixelRatio || this.platform.getDevicePixelRatio(),
      r = this.width ? "resize" : "attach";
    this.width = o.width, this.height = o.height, this._aspectRatio = this.aspectRatio, coordinatePoint(this, a, !0) && (this.notifyPlugins("resize", {
      size: o
    }), elementQuerySelector(i.onResize, [this, o], this), this.attached && this._doResize(r) && this.render());
  }
  ensureScalesHaveIDs() {
    const t = this.options.scales || {};
    functionExecutor(t, (t, e) => {
      t.id = e;
    });
  }
  buildOrUpdateScales() {
    const t = this.options,
      e = t.scales,
      i = this.scales,
      s = Object.keys(i).reduce((t, e) => (t[e] = !1, t), {});
    let n = [];
    e && (n = n.concat(Object.keys(e).map(t => {
      const i = e[t],
        s = inferAxisType(t, i),
        n = "r" === s,
        o = "x" === s;
      return {
        options: i,
        dposition: n ? "chartArea" : o ? "bottom" : "left",
        dtype: n ? "radialLinear" : o ? "category" : "linear"
      };
    }))), functionExecutor(n, e => {
      const n = e.options,
        o = n.id,
        a = inferAxisType(o, n),
        h = responseHandlerFunction(n.type, e.dtype);
      void 0 !== n.position && isPositionVertical(n.position, a) === isPositionVertical(e.dposition) || (n.position = e.dposition), s[o] = !0;
      let l = null;
      if (o in i && i[o].type === h) l = i[o];else {
        l = new (chartRegistryManager.getScale(h))({
          id: o,
          type: h,
          ctx: this.ctx,
          chart: this
        }), i[l.id] = l;
      }
      l.init(n, t);
    }), functionExecutor(s, (t, e) => {
      t || delete i[e];
    }), functionExecutor(i, t => {
      boxLayoutManager.configure(this, t, t.options), boxLayoutManager.addBox(this, t);
    });
  }
  _updateMetasets() {
    const t = this._metasets,
      e = this.data.datasets.length,
      i = t.length;
    if (t.sort((t, e) => t.index - e.index), i > e) {
      for (let t = e; t < i; ++t) this._destroyDatasetMeta(t);
      t.splice(e, i - e);
    }
    this._sortedMetasets = t.slice(0).sort(compareObjectsByProperty("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const {
      _metasets: t,
      data: {
        datasets: e
      }
    } = this;
    t.length > e.length && delete this._stacks, t.forEach((t, i) => {
      0 === e.filter(e => e === t._dataset).length && this._destroyDatasetMeta(i);
    });
  }
  buildOrUpdateControllers() {
    const t = [],
      e = this.data.datasets;
    let i, s;
    for (this._removeUnreferencedMetasets(), i = 0, s = e.length; i < s; i++) {
      const s = e[i];
      let n = this.getDatasetMeta(i);
      const a = s.type || this.config.type;
      if (n.type && n.type !== a && (this._destroyDatasetMeta(i), n = this.getDatasetMeta(i)), n.type = a, n.indexAxis = s.indexAxis || getAxisOrientation(a, this.options), n.order = s.order || 0, n.index = i, n.label = "" + s.label, n.visible = this.isDatasetVisible(i), n.controller) n.controller.updateIndex(i), n.controller.linkScales();else {
        const e = chartRegistryManager.getController(a),
          {
            datasetElementType: s,
            dataElementType: r
          } = _dataProcessor.datasets[a];
        Object.assign(e, {
          dataElementType: chartRegistryManager.getElement(r),
          datasetElementType: s && chartRegistryManager.getElement(s)
        }), n.controller = new e(this, i), t.push(n.controller);
      }
    }
    return this._updateMetasets(), t;
  }
  _resetElements() {
    functionExecutor(this.data.datasets, (t, e) => {
      this.getDatasetMeta(e).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements(), this.notifyPlugins("reset");
  }
  update(t) {
    const e = this.config;
    e.update();
    const i = this._options = e.createResolver(e.chartOptionScopes(), this.getContext()),
      s = this._animationsDisabled = !i.animation;
    if (this._updateScales(), this._checkEventBindings(), this._updateHiddenIndices(), this._plugins.invalidate(), !1 === this.notifyPlugins("beforeUpdate", {
      mode: t,
      cancelable: !0
    })) return;
    const n = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let o = 0;
    for (let t = 0, e = this.data.datasets.length; t < e; t++) {
      const {
          controller: e
        } = this.getDatasetMeta(t),
        i = !s && -1 === n.indexOf(e);
      e.buildOrUpdateElements(i), o = Math.max(+e.getMaxOverflow(), o);
    }
    o = this._minPadding = i.layout.autoPadding ? o : 0, this._updateLayout(o), s || functionExecutor(n, t => {
      t.reset();
    }), this._updateDatasets(t), this.notifyPlugins("afterUpdate", {
      mode: t
    }), this._layers.sort(compareObjectsByProperty("z", "_idx"));
    const {
      _active: a,
      _lastEvent: r
    } = this;
    r ? this._eventHandler(r, !0) : a.length && this._updateHoverStyles(a, a, !0), this.render();
  }
  _updateScales() {
    functionExecutor(this.scales, t => {
      boxLayoutManager.removeBox(this, t);
    }), this.ensureScalesHaveIDs(), this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const t = this.options,
      e = new Set(Object.keys(this._listeners)),
      i = new Set(t.events);
    _functionExecutor(e, i) && !!this._responsiveListeners === t.responsive || (this.unbindEvents(), this.bindEvents());
  }
  _updateHiddenIndices() {
    const {
        _hiddenIndices: t
      } = this,
      e = this._getUniformDataChanges() || [];
    for (const {
      method: i,
      start: s,
      count: n
    } of e) {
      adjustCanvasElementPositions(t, s, "_removeElements" === i ? -n : n);
    }
  }
  _getUniformDataChanges() {
    const t = this._dataChanges;
    if (!t || !t.length) return;
    this._dataChanges = [];
    const e = this.data.datasets.length,
      i = e => new Set(t.filter(t => t[0] === e).map((t, e) => e + "," + t.splice(1).join(","))),
      s = i(0);
    for (let t = 1; t < e; t++) if (!_functionExecutor(s, i(t))) return;
    return Array.from(s).map(t => t.split(",")).map(t => ({
      method: t[1],
      start: +t[2],
      count: +t[3]
    }));
  }
  _updateLayout(t) {
    if (!1 === this.notifyPlugins("beforeLayout", {
      cancelable: !0
    })) return;
    boxLayoutManager.update(this, this.width, this.height, t);
    const e = this.chartArea,
      i = e.width <= 0 || e.height <= 0;
    this._layers = [], functionExecutor(this.boxes, t => {
      i && "chartArea" === t.position || (t.configure && t.configure(), this._layers.push(...t._layers()));
    }, this), this._layers.forEach((t, e) => {
      t._idx = e;
    }), this.notifyPlugins("afterLayout");
  }
  _updateDatasets(t) {
    if (!1 !== this.notifyPlugins("beforeDatasetsUpdate", {
      mode: t,
      cancelable: !0
    })) {
      for (let t = 0, e = this.data.datasets.length; t < e; ++t) this.getDatasetMeta(t).controller.configure();
      for (let e = 0, i = this.data.datasets.length; e < i; ++e) this._updateDataset(e, animationTracker(t) ? t({
        datasetIndex: e
      }) : t);
      this.notifyPlugins("afterDatasetsUpdate", {
        mode: t
      });
    }
  }
  _updateDataset(t, e) {
    const i = this.getDatasetMeta(t),
      s = {
        meta: i,
        index: t,
        mode: e,
        cancelable: !0
      };
    !1 !== this.notifyPlugins("beforeDatasetUpdate", s) && (i.controller._update(e), s.cancelable = !1, this.notifyPlugins("afterDatasetUpdate", s));
  }
  render() {
    !1 !== this.notifyPlugins("beforeRender", {
      cancelable: !0
    }) && (__chartManagerInstance.has(this) ? this.attached && !__chartManagerInstance.running(this) && __chartManagerInstance.start(this) : (this.draw(), notifyPluginsAfterRender({
      chart: this
    })));
  }
  draw() {
    let t;
    if (this._resizeBeforeDraw) {
      const {
        width: t,
        height: e
      } = this._resizeBeforeDraw;
      this._resize(t, e), this._resizeBeforeDraw = null;
    }
    if (this.clear(), this.width <= 0 || this.height <= 0) return;
    if (!1 === this.notifyPlugins("beforeDraw", {
      cancelable: !0
    })) return;
    const e = this._layers;
    for (t = 0; t < e.length && e[t].z <= 0; ++t) e[t].draw(this.chartArea);
    for (this._drawDatasets(); t < e.length; ++t) e[t].draw(this.chartArea);
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(t) {
    const e = this._sortedMetasets,
      i = [];
    let s, n;
    for (s = 0, n = e.length; s < n; ++s) {
      const n = e[s];
      t && !n.visible || i.push(n);
    }
    return i;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(!0);
  }
  _drawDatasets() {
    if (!1 === this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: !0
    })) return;
    const t = this.getSortedVisibleDatasetMetas();
    for (let e = t.length - 1; e >= 0; --e) this._drawDataset(t[e]);
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(t) {
    const e = this.ctx,
      i = t._clip,
      s = !i.disabled,
      n = _calculateBoundingBox(t, this.chartArea),
      o = {
        meta: t,
        index: t.index,
        cancelable: !0
      };
    !1 !== this.notifyPlugins("beforeDatasetDraw", o) && (s && valueRepresentation(e, {
      left: !1 === i.left ? 0 : n.left - i.left,
      right: !1 === i.right ? this.width : n.right + i.right,
      top: !1 === i.top ? 0 : n.top - i.top,
      bottom: !1 === i.bottom ? this.height : n.bottom + i.bottom
    }), t.controller.draw(), s && currencySymbol(e), o.cancelable = !1, this.notifyPlugins("afterDatasetDraw", o));
  }
  isPointInArea(t) {
    return ___eventEmitter(t, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(t, e, i, s) {
    const n = interactionEvaluatorConfig.modes[e];
    return "function" == typeof n ? n(this, t, i, s) : [];
  }
  getDatasetMeta(t) {
    const e = this.data.datasets[t],
      i = this._metasets;
    let s = i.filter(t => t && t._dataset === e).pop();
    return s || (s = {
      type: null,
      data: [],
      dataset: null,
      controller: null,
      hidden: null,
      xAxisID: null,
      yAxisID: null,
      order: e && e.order || 0,
      index: t,
      _dataset: e,
      _parsed: [],
      _sorted: !1
    }, i.push(s)), s;
  }
  getContext() {
    return this.$context || (this.$context = renderComponent(null, {
      chart: this,
      type: "chart"
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(t) {
    const e = this.data.datasets[t];
    if (!e) return !1;
    const i = this.getDatasetMeta(t);
    return "boolean" == typeof i.hidden ? !i.hidden : !e.hidden;
  }
  setDatasetVisibility(t, e) {
    this.getDatasetMeta(t).hidden = !e;
  }
  toggleDataVisibility(t) {
    this._hiddenIndices[t] = !this._hiddenIndices[t];
  }
  getDataVisibility(t) {
    return !this._hiddenIndices[t];
  }
  _updateVisibility(t, e, i) {
    const s = i ? "show" : "hide",
      n = this.getDatasetMeta(t),
      o = n.controller._resolveAnimations(void 0, s);
    userSessionHandler(e) ? (n.data[e].hidden = !i, this.update()) : (this.setDatasetVisibility(t, i), o.update(n, {
      visible: i
    }), this.update(e => e.datasetIndex === t ? s : void 0));
  }
  hide(t, e) {
    this._updateVisibility(t, e, !1);
  }
  show(t, e) {
    this._updateVisibility(t, e, !0);
  }
  _destroyDatasetMeta(t) {
    const e = this._metasets[t];
    e && e.controller && e.controller._destroy(), delete this._metasets[t];
  }
  _stop() {
    let t, e;
    for (this.stop(), __chartManagerInstance.remove(this), t = 0, e = this.data.datasets.length; t < e; ++t) this._destroyDatasetMeta(t);
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const {
      canvas: t,
      ctx: e
    } = this;
    this._stop(), this.config.clearCache(), t && (this.unbindEvents(), fileFormat(t, e), this.platform.releaseContext(e), this.canvas = null, this.ctx = null), delete chartRegistry[this.id], this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...t) {
    return this.canvas.toDataURL(...t);
  }
  bindEvents() {
    this.bindUserEvents(), this.options.responsive ? this.bindResponsiveEvents() : this.attached = !0;
  }
  bindUserEvents() {
    const t = this._listeners,
      e = this.platform,
      i = (i, s) => {
        e.addEventListener(this, i, s), t[i] = s;
      },
      s = (t, e, i) => {
        t.offsetX = e, t.offsetY = i, this._eventHandler(t);
      };
    functionExecutor(this.options.events, t => i(t, s));
  }
  bindResponsiveEvents() {
    this._responsiveListeners || (this._responsiveListeners = {});
    const t = this._responsiveListeners,
      e = this.platform,
      i = (i, s) => {
        e.addEventListener(this, i, s), t[i] = s;
      },
      s = (i, s) => {
        t[i] && (e.removeEventListener(this, i, s), delete t[i]);
      },
      n = (t, e) => {
        this.canvas && this.resize(t, e);
      };
    let o;
    const a = () => {
      s("attach", a), this.attached = !0, this.resize(), i("resize", n), i("detach", o);
    };
    o = () => {
      this.attached = !1, s("resize", n), this._stop(), this._resize(0, 0), i("attach", a);
    }, e.isAttached(this.canvas) ? a() : o();
  }
  unbindEvents() {
    functionExecutor(this._listeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._listeners = {}, functionExecutor(this._responsiveListeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._responsiveListeners = void 0;
  }
  updateHoverStyle(t, e, i) {
    const s = i ? "set" : "remove";
    let n, o, a, r;
    for ("dataset" === e && (n = this.getDatasetMeta(t[0].datasetIndex), n.controller["_" + s + "DatasetHoverStyle"]()), a = 0, r = t.length; a < r; ++a) {
      o = t[a];
      const e = o && this.getDatasetMeta(o.datasetIndex).controller;
      e && e[s + "HoverStyle"](o.element, o.datasetIndex, o.index);
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t) {
    const e = this._active || [],
      i = t.map(({
        datasetIndex: t,
        index: e
      }) => {
        const i = this.getDatasetMeta(t);
        if (!i) throw new Error("No dataset found at index " + t);
        return {
          datasetIndex: t,
          element: i.data[e],
          index: e
        };
      });
    !currentUserValue(i, e) && (this._active = i, this._lastEvent = null, this._updateHoverStyles(i, e));
  }
  notifyPlugins(t, e, i) {
    return this._plugins.notify(this, t, e, i);
  }
  isPluginEnabled(t) {
    return 1 === this._plugins._cache.filter(e => e.plugin.id === t).length;
  }
  _updateHoverStyles(t, e, i) {
    const s = this.options.hover,
      n = (t, e) => t.filter(t => !e.some(e => t.datasetIndex === e.datasetIndex && t.index === e.index)),
      o = n(e, t),
      a = i ? t : n(t, e);
    o.length && this.updateHoverStyle(o, s.mode, !1), a.length && s.mode && this.updateHoverStyle(a, s.mode, !0);
  }
  _eventHandler(t, e) {
    const i = {
        event: t,
        replay: e,
        cancelable: !0,
        inChartArea: this.isPointInArea(t)
      },
      s = e => (e.options.events || this.options.events).includes(t.native.type);
    if (!1 === this.notifyPlugins("beforeEvent", i, s)) return;
    const n = this._handleEvent(t, e, i.inChartArea);
    return i.cancelable = !1, this.notifyPlugins("afterEvent", i, s), (n || i.changed) && this.render(), this;
  }
  _handleEvent(t, e, i) {
    const {
        _active: s = [],
        options: n
      } = this,
      o = e,
      a = this._getActiveElements(t, s, i, o),
      r = buttonLabel(t),
      h = extractMouseEventData(t, this._lastEvent, i, r);
    i && (this._lastEvent = null, elementQuerySelector(n.onHover, [t, a, this], this), r && elementQuerySelector(n.onClick, [t, a, this], this));
    const l = !currentUserValue(a, s);
    return (l || e) && (this._active = a, this._updateHoverStyles(a, s, e)), this._lastEvent = h, l;
  }
  _getActiveElements(t, e, i, s) {
    if ("mouseout" === t.type) return [];
    if (!i) return e;
    const n = this.options.hover;
    return this.getElementsAtEventForMode(t, n.mode, n, s);
  }
}
function invalidateChartPlugins() {
  return functionExecutor(__ChartManager.instances, t => t._plugins.invalidate());
}
function drawArcWithPadding(t, e, i) {
  const {
    startAngle: s,
    pixelMargin: n,
    x: o,
    y: a,
    outerRadius: r,
    innerRadius: h
  } = e;
  let l = n / r;
  t.beginPath(), t.arc(o, a, r, s - l, i + l), h > n ? (l = n / h, t.arc(o, a, h, i + l, s - l, !0)) : t.arc(o, a, n, i + windowReference, s - windowReference), t.closePath(), t.clip();
}
function fetchBorderRadiusSettings(t) {
  return videoPlaybackController(t, ["outerStart", "outerEnd", "innerStart", "innerEnd"]);
}
function computeBorderRadius(t, e, i, s) {
  const n = fetchBorderRadiusSettings(t.options.borderRadius),
    o = (i - e) / 2,
    a = Math.min(o, s * e / 2),
    r = t => {
      const e = (i - Math.min(o, t)) * s / 2;
      return userInputValue(t, 0, Math.min(o, e));
    };
  return {
    outerStart: r(n.outerStart),
    outerEnd: r(n.outerEnd),
    innerStart: userInputValue(n.innerStart, 0, a),
    innerEnd: userInputValue(n.innerEnd, 0, a)
  };
}
function getCoordinatesOnCircle(t, e, i, s) {
  return {
    x: i + t * Math.cos(e),
    y: s + t * Math.sin(e)
  };
}
function calculateArcDimensions(t, e, i, s, n, o) {
  const {
      x: a,
      y: r,
      startAngle: h,
      pixelMargin: l,
      innerRadius: c
    } = e,
    d = Math.max(e.outerRadius + s + i - l, 0),
    u = c > 0 ? c + s + i + l : 0;
  let g = 0;
  const p = n - h;
  if (s) {
    const t = ((c > 0 ? c - s : 0) + (d > 0 ? d - s : 0)) / 2;
    g = (p - (0 !== t ? p * t / (t + s) : p)) / 2;
  }
  const f = (p - Math.max(.001, p * d - i / __defaultExportModule) / d) / 2,
    m = h + f + g,
    x = n - f - g,
    {
      outerStart: b,
      outerEnd: _,
      innerStart: y,
      innerEnd: v
    } = computeBorderRadius(e, u, d, x - m),
    M = d - b,
    S = d - _,
    D = m + b / M,
    P = x - _ / S,
    C = u + y,
    A = u + v,
    L = m + y / C,
    O = x - v / A;
  if (t.beginPath(), o) {
    const e = (D + P) / 2;
    if (t.arc(a, r, d, D, e), t.arc(a, r, d, e, P), _ > 0) {
      const e = getCoordinatesOnCircle(S, P, a, r);
      t.arc(e.x, e.y, _, P, x + windowReference);
    }
    const i = getCoordinatesOnCircle(A, x, a, r);
    if (t.lineTo(i.x, i.y), v > 0) {
      const e = getCoordinatesOnCircle(A, O, a, r);
      t.arc(e.x, e.y, v, x + windowReference, O + Math.PI);
    }
    const s = (x - v / u + (m + y / u)) / 2;
    if (t.arc(a, r, u, x - v / u, s, !0), t.arc(a, r, u, s, m + y / u, !0), y > 0) {
      const e = getCoordinatesOnCircle(C, L, a, r);
      t.arc(e.x, e.y, y, L + Math.PI, m - windowReference);
    }
    const n = getCoordinatesOnCircle(M, m, a, r);
    if (t.lineTo(n.x, n.y), b > 0) {
      const e = getCoordinatesOnCircle(M, D, a, r);
      t.arc(e.x, e.y, b, m - windowReference, D);
    }
  } else {
    t.moveTo(a, r);
    const e = Math.cos(D) * d + a,
      i = Math.sin(D) * d + r;
    t.lineTo(e, i);
    const s = Math.cos(P) * d + a,
      n = Math.sin(P) * d + r;
    t.lineTo(s, n);
  }
  t.closePath();
}
function drawFullCircleArc(t, e, i, s, n) {
  const {
    fullCircles: o,
    startAngle: a,
    circumference: r
  } = e;
  let h = e.endAngle;
  if (o) {
    calculateArcDimensions(t, e, i, s, h, n);
    for (let e = 0; e < o; ++e) t.fill();
    isNaN(r) || (h = a + (r % ComponentTypeIdentifier || ComponentTypeIdentifier));
  }
  return calculateArcDimensions(t, e, i, s, h, n), t.fill(), h;
}
function renderBorder(t, e, i, s, n) {
  const {
      fullCircles: o,
      startAngle: a,
      circumference: r,
      options: h
    } = e,
    {
      borderWidth: l,
      borderJoinStyle: c,
      borderDash: d,
      borderDashOffset: u
    } = h,
    g = "inner" === h.borderAlign;
  if (!l) return;
  t.setLineDash(d || []), t.lineDashOffset = u, g ? (t.lineWidth = 2 * l, t.lineJoin = c || "round") : (t.lineWidth = l, t.lineJoin = c || "bevel");
  let p = e.endAngle;
  if (o) {
    calculateArcDimensions(t, e, i, s, p, n);
    for (let e = 0; e < o; ++e) t.stroke();
    isNaN(r) || (p = a + (r % ComponentTypeIdentifier || ComponentTypeIdentifier));
  }
  g && drawArcWithPadding(t, e, p), o || (calculateArcDimensions(t, e, i, s, p, n), t.stroke());
}
class ArcRendererController extends CanvasAnimationManager {
  static id = "arc";
  static defaults = {
    borderAlign: "center",
    borderColor: "#fff",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: void 0,
    borderRadius: 0,
    borderWidth: 2,
    offset: 0,
    spacing: 0,
    angle: void 0,
    circular: !0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor"
  };
  static descriptors = {
    _scriptable: !0,
    _indexable: t => "borderDash" !== t
  };
  circumference;
  endAngle;
  fullCircles;
  innerRadius;
  outerRadius;
  pixelMargin;
  startAngle;
  constructor(t) {
    super(), this.options = void 0, this.circumference = void 0, this.startAngle = void 0, this.endAngle = void 0, this.innerRadius = void 0, this.outerRadius = void 0, this.pixelMargin = 0, this.fullCircles = 0, t && Object.assign(this, t);
  }
  inRange(t, e, i) {
    const s = this.getProps(["x", "y"], i),
      {
        angle: n,
        distance: o
      } = dataProcessorFunction(s, {
        x: t,
        y: e
      }),
      {
        startAngle: a,
        endAngle: h,
        innerRadius: l,
        outerRadius: c,
        circumference: d
      } = this.getProps(["startAngle", "endAngle", "innerRadius", "outerRadius", "circumference"], i),
      u = (this.options.spacing + this.options.borderWidth) / 2,
      g = responseHandlerFunction(d, h - a) >= ComponentTypeIdentifier || documentTitle(n, a, h),
      p = __eventHandler(o, l + u, c + u);
    return g && p;
  }
  getCenterPoint(t) {
    const {
        x: e,
        y: i,
        startAngle: s,
        endAngle: n,
        innerRadius: o,
        outerRadius: a
      } = this.getProps(["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"], t),
      {
        offset: r,
        spacing: h
      } = this.options,
      l = (s + n) / 2,
      c = (o + a + h + r) / 2;
    return {
      x: e + Math.cos(l) * c,
      y: i + Math.sin(l) * c
    };
  }
  tooltipPosition(t) {
    return this.getCenterPoint(t);
  }
  draw(t) {
    const {
        options: e,
        circumference: i
      } = this,
      s = (e.offset || 0) / 4,
      n = (e.spacing || 0) / 2,
      o = e.circular;
    if (this.pixelMargin = "inner" === e.borderAlign ? .33 : 0, this.fullCircles = i > ComponentTypeIdentifier ? Math.floor(i / ComponentTypeIdentifier) : 0, 0 === i || this.innerRadius < 0 || this.outerRadius < 0) return;
    t.save();
    const a = (this.startAngle + this.endAngle) / 2;
    t.translate(Math.cos(a) * s, Math.sin(a) * s);
    const r = s * (1 - Math.sin(Math.min(__defaultExportModule, i || 0)));
    t.fillStyle = e.backgroundColor, t.strokeStyle = e.borderColor, drawFullCircleArc(t, this, r, n, o), renderBorder(t, this, r, n, o), t.restore();
  }
}
function applyLineStyles(t, e, i = e) {
  t.lineCap = responseHandlerFunction(i.borderCapStyle, e.borderCapStyle), t.setLineDash(responseHandlerFunction(i.borderDash, e.borderDash)), t.lineDashOffset = responseHandlerFunction(i.borderDashOffset, e.borderDashOffset), t.lineJoin = responseHandlerFunction(i.borderJoinStyle, e.borderJoinStyle), t.lineWidth = responseHandlerFunction(i.borderWidth, e.borderWidth), t.strokeStyle = responseHandlerFunction(i.borderColor, e.borderColor);
}
function drawLineToCoordinates(t, e, i) {
  t.lineTo(i.x, i.y);
}
function determineInterpolationMethod(t) {
  return t.stepped ? _coordinatePoint : t.tension || "monotone" === t.cubicInterpolationMode ? activeUserSession : drawLineToCoordinates;
}
function rangeBounds(t, e, i = {}) {
  const s = t.length,
    {
      start: n = 0,
      end: o = s - 1
    } = i,
    {
      start: a,
      end: r
    } = e,
    h = Math.max(n, a),
    l = Math.min(o, r),
    c = n < a && o < a || n > r && o > r;
  return {
    count: s,
    start: h,
    loop: e.loop,
    ilen: l < h && !c ? s + l - h : l - h
  };
}
function renderPathSegment(t, e, i, s) {
  const {
      points: n,
      options: o
    } = e,
    {
      count: a,
      start: r,
      loop: h,
      ilen: l
    } = rangeBounds(n, i, s),
    c = determineInterpolationMethod(o);
  let d,
    u,
    g,
    {
      move: p = !0,
      reverse: f
    } = s || {};
  for (d = 0; d <= l; ++d) u = n[(r + (f ? l - d : d)) % a], u.skip || (p ? (t.moveTo(u.x, u.y), p = !1) : c(t, g, u, f, o.stepped), g = u);
  return h && (u = n[(r + (f ? l : 0)) % a], c(t, g, u, f, o.stepped)), !!h;
}
function renderPath(t, e, i, s) {
  const n = e.points,
    {
      count: o,
      start: a,
      ilen: r
    } = rangeBounds(n, i, s),
    {
      move: h = !0,
      reverse: l
    } = s || {};
  let c,
    d,
    u,
    g,
    p,
    f,
    m = 0,
    x = 0;
  const b = t => (a + (l ? r - t : t)) % o,
    _ = () => {
      g !== p && (t.lineTo(m, p), t.lineTo(m, g), t.lineTo(m, f));
    };
  for (h && (d = n[b(0)], t.moveTo(d.x, d.y)), c = 0; c <= r; ++c) {
    if (d = n[b(c)], d.skip) continue;
    const e = d.x,
      i = d.y,
      s = 0 | e;
    s === u ? (i < g ? g = i : i > p && (p = i), m = (x * m + e) / ++x) : (_(), t.lineTo(e, i), u = s, x = 0, g = p = i), f = i;
  }
  _();
}
function determineLineStyle(t) {
  const e = t.options,
    i = e.borderDash && e.borderDash.length;
  return !(t._decimated || t._loop || e.tension || "monotone" === e.cubicInterpolationMode || e.stepped || i) ? renderPath : renderPathSegment;
}
function _determineInterpolationMethod(t) {
  return t.stepped ? keyTransformationFunction : t.tension || "monotone" === t.cubicInterpolationMode ? __userSessionToken : dataTransformationHandler;
}
function ___drawPathSegment(t, e, i, s) {
  let n = e._path;
  n || (n = e._path = new Path2D(), e.path(n, i, s) && n.closePath()), applyLineStyles(t, e.options), t.stroke(n);
}
function renderPathSegments(t, e, i, s) {
  const {
      segments: n,
      options: o
    } = e,
    a = determineLineStyle(e);
  for (const r of n) applyLineStyles(t, o, r.style), t.beginPath(), a(t, e, r, {
    start: i,
    end: i + s - 1
  }) && t.closePath(), t.stroke();
}
const isPath2DAvailable = "function" == typeof Path2D;
function renderLineSegments(t, e, i, s) {
  isPath2DAvailable && !e.options.segment ? ___drawPathSegment(t, e, i, s) : renderPathSegments(t, e, i, s);
}
class LineChartComponent extends CanvasAnimationManager {
  static id = "line";
  static defaults = {
    borderCapStyle: "butt",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: "miter",
    borderWidth: 3,
    capBezierPoints: !0,
    cubicInterpolationMode: "default",
    fill: !1,
    spanGaps: !1,
    stepped: !1,
    tension: 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  static descriptors = {
    _scriptable: !0,
    _indexable: t => "borderDash" !== t && "fill" !== t
  };
  constructor(t) {
    super(), this.animated = !0, this.options = void 0, this._chart = void 0, this._loop = void 0, this._fullLoop = void 0, this._path = void 0, this._points = void 0, this._segments = void 0, this._decimated = !1, this._pointsUpdated = !1, this._datasetIndex = void 0, t && Object.assign(this, t);
  }
  updateControlPoints(t, e) {
    const i = this.options;
    if ((i.tension || "monotone" === i.cubicInterpolationMode) && !i.stepped && !this._pointsUpdated) {
      const s = i.spanGaps ? this._loop : this._fullLoop;
      currentUserVariable(this._points, i, t, s, e), this._pointsUpdated = !0;
    }
  }
  set points(t) {
    this._points = t, delete this._segments, delete this._path, this._pointsUpdated = !1;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = messageCategory(this, this.options.segment));
  }
  first() {
    const t = this.segments,
      e = this.points;
    return t.length && e[t[0].start];
  }
  last() {
    const t = this.segments,
      e = this.points,
      i = t.length;
    return i && e[t[i - 1].end];
  }
  interpolate(t, e) {
    const i = this.options,
      s = t[e],
      n = this.points,
      o = currentUserSessionToken(this, {
        property: e,
        start: s,
        end: s
      });
    if (!o.length) return;
    const a = [],
      r = _determineInterpolationMethod(i);
    let h, l;
    for (h = 0, l = o.length; h < l; ++h) {
      const {
          start: l,
          end: c
        } = o[h],
        d = n[l],
        u = n[c];
      if (d === u) {
        a.push(d);
        continue;
      }
      const g = r(d, u, Math.abs((s - d[e]) / (u[e] - d[e])), i.stepped);
      g[e] = t[e], a.push(g);
    }
    return 1 === a.length ? a[0] : a;
  }
  pathSegment(t, e, i) {
    return determineLineStyle(this)(t, this, e, i);
  }
  path(t, e, i) {
    const s = this.segments,
      n = determineLineStyle(this);
    let o = this._loop;
    e = e || 0, i = i || this.points.length - e;
    for (const a of s) o &= n(t, this, a, {
      start: e,
      end: e + i - 1
    });
    return !!o;
  }
  draw(t, e, i, s) {
    const n = this.options || {};
    (this.points || []).length && n.borderWidth && (t.save(), renderLineSegments(t, this, i, s), t.restore()), this.animated && (this._pointsUpdated = !1, this._path = void 0);
  }
}
function isPointWithinHitArea(t, e, i, s) {
  const n = t.options,
    {
      [i]: o
    } = t.getProps([i], s);
  return Math.abs(e - o) < n.radius + n.hitRadius;
}
class PointData extends CanvasAnimationManager {
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
    rotation: 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(t) {
    super(), this.options = void 0, this.parsed = void 0, this.skip = void 0, this.stop = void 0, t && Object.assign(this, t);
  }
  inRange(t, e, i) {
    const s = this.options,
      {
        x: n,
        y: o
      } = this.getProps(["x", "y"], i);
    return Math.pow(t - n, 2) + Math.pow(e - o, 2) < Math.pow(s.hitRadius + s.radius, 2);
  }
  inXRange(t, e) {
    return isPointWithinHitArea(this, t, "x", e);
  }
  inYRange(t, e) {
    return isPointWithinHitArea(this, t, "y", e);
  }
  getCenterPoint(t) {
    const {
      x: e,
      y: i
    } = this.getProps(["x", "y"], t);
    return {
      x: e,
      y: i
    };
  }
  size(t) {
    let e = (t = t || this.options || {}).radius || 0;
    e = Math.max(e, e && t.hoverRadius || 0);
    return 2 * (e + (e && t.borderWidth || 0));
  }
  draw(t, e) {
    const i = this.options;
    this.skip || i.radius < .1 || !___eventEmitter(this, e, this.size(i) / 2) || (t.strokeStyle = i.borderColor, t.lineWidth = i.borderWidth, t.fillStyle = i.backgroundColor, _animationDuration(t, i, this.x, this.y));
  }
  getRange() {
    const t = this.options || {};
    return t.radius + t.hitRadius;
  }
}
function __calculateBoundingBox(t, e) {
  const {
    x: i,
    y: s,
    base: n,
    width: o,
    height: a
  } = t.getProps(["x", "y", "base", "width", "height"], e);
  let r, h, l, c, d;
  return t.horizontal ? (d = a / 2, r = Math.min(i, n), h = Math.max(i, n), l = s - d, c = s + d) : (d = o / 2, r = i - d, h = i + d, l = Math.min(s, n), c = Math.max(s, n)), {
    left: r,
    top: l,
    right: h,
    bottom: c
  };
}
function calculateBorderThickness(t, e, i, s) {
  return t ? 0 : userInputValue(e, i, s);
}
function calculateBorderWidths(t, e, i) {
  const s = t.options.borderWidth,
    n = t.borderSkipped,
    o = __colorPalette(s);
  return {
    t: calculateBorderThickness(n.top, o.top, 0, i),
    r: calculateBorderThickness(n.right, o.right, 0, e),
    b: calculateBorderThickness(n.bottom, o.bottom, 0, i),
    l: calculateBorderThickness(n.left, o.left, 0, e)
  };
}
function __calculateBorderRadius(t, e, i) {
  const {
      enableBorderRadius: s
    } = t.getProps(["enableBorderRadius"]),
    o = t.options.borderRadius,
    a = colorUtility(o),
    r = Math.min(e, i),
    h = t.borderSkipped,
    l = s || dataIndex(o);
  return {
    topLeft: calculateBorderThickness(!l || h.top || h.left, a.topLeft, 0, r),
    topRight: calculateBorderThickness(!l || h.top || h.right, a.topRight, 0, r),
    bottomLeft: calculateBorderThickness(!l || h.bottom || h.left, a.bottomLeft, 0, r),
    bottomRight: calculateBorderThickness(!l || h.bottom || h.right, a.bottomRight, 0, r)
  };
}
function computeRectangleDimensions(t) {
  const e = __calculateBoundingBox(t),
    i = e.right - e.left,
    s = e.bottom - e.top,
    n = calculateBorderWidths(t, i / 2, s / 2),
    o = __calculateBorderRadius(t, i / 2, s / 2);
  return {
    outer: {
      x: e.left,
      y: e.top,
      w: i,
      h: s,
      radius: o
    },
    inner: {
      x: e.left + n.l,
      y: e.top + n.t,
      w: i - n.l - n.r,
      h: s - n.t - n.b,
      radius: {
        topLeft: Math.max(0, o.topLeft - Math.max(n.t, n.l)),
        topRight: Math.max(0, o.topRight - Math.max(n.t, n.r)),
        bottomLeft: Math.max(0, o.bottomLeft - Math.max(n.b, n.l)),
        bottomRight: Math.max(0, o.bottomRight - Math.max(n.b, n.r))
      }
    }
  };
}
function isRectangleValidForCorners(t, e, i, s) {
  const n = null === e,
    o = null === i,
    a = t && !(n && o) && __calculateBoundingBox(t, s);
  return a && (n || __eventHandler(e, a.left, a.right)) && (o || __eventHandler(i, a.top, a.bottom));
}
function areAnyCornersDefined(t) {
  return t.topLeft || t.topRight || t.bottomLeft || t.bottomRight;
}
function renderRectangle(t, e) {
  t.rect(e.x, e.y, e.w, e.h);
}
function adjustRectangleForPosition(t, e, i = {}) {
  const s = t.x !== i.x ? -e : 0,
    n = t.y !== i.y ? -e : 0,
    o = (t.x + t.w !== i.x + i.w ? e : 0) - s,
    a = (t.y + t.h !== i.y + i.h ? e : 0) - n;
  return {
    x: t.x + s,
    y: t.y + n,
    w: t.w + o,
    h: t.h + a,
    radius: t.radius
  };
}
class BarChartAnimationController extends CanvasAnimationManager {
  static id = "bar";
  static defaults = {
    borderSkipped: "start",
    borderWidth: 0,
    borderRadius: 0,
    inflateAmount: "auto",
    pointStyle: void 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(t) {
    super(), this.options = void 0, this.horizontal = void 0, this.base = void 0, this.width = void 0, this.height = void 0, this.inflateAmount = void 0, t && Object.assign(this, t);
  }
  draw(t) {
    const {
        inflateAmount: e,
        options: {
          borderColor: i,
          backgroundColor: s
        }
      } = this,
      {
        inner: n,
        outer: o
      } = computeRectangleDimensions(this),
      a = areAnyCornersDefined(o.radius) ? lightnessAdjustment : renderRectangle;
    t.save(), o.w === n.w && o.h === n.h || (t.beginPath(), a(t, adjustRectangleForPosition(o, e, n)), t.clip(), a(t, adjustRectangleForPosition(n, -e, o)), t.fillStyle = i, t.fill("evenodd")), t.beginPath(), a(t, adjustRectangleForPosition(n, e)), t.fillStyle = s, t.fill(), t.restore();
  }
  inRange(t, e, i) {
    return isRectangleValidForCorners(this, t, e, i);
  }
  inXRange(t, e) {
    return isRectangleValidForCorners(this, t, null, e);
  }
  inYRange(t, e) {
    return isRectangleValidForCorners(this, null, t, e);
  }
  getCenterPoint(t) {
    const {
      x: e,
      y: i,
      base: s,
      horizontal: n
    } = this.getProps(["x", "y", "base", "horizontal"], t);
    return {
      x: n ? (e + s) / 2 : e,
      y: n ? i : (i + s) / 2
    };
  }
  getRange(t) {
    return "x" === t ? this.width / 2 : this.height / 2;
  }
}
var ChartElementRegistry = Object.freeze({
  __proto__: null,
  ArcElement: ArcRendererController,
  BarElement: BarChartAnimationController,
  LineElement: LineChartComponent,
  PointElement: PointData
});
const colorPaletteArray = ["rgb(54, 162, 235)", "rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"],
  semiTransparentColorPalette = colorPaletteArray.map(t => t.replace("rgb(", "rgba(").replace(")", ", 0.5)"));
function getColorFromPaletteByIndex(t) {
  return colorPaletteArray[t % colorPaletteArray.length];
}
function rgbaColorWithOpacity(t) {
  return semiTransparentColorPalette[t % semiTransparentColorPalette.length];
}
function applyColorSettingsToChart(t, e) {
  return t.borderColor = getColorFromPaletteByIndex(e), t.backgroundColor = rgbaColorWithOpacity(e), ++e;
}
function setBackgroundColorForDataSet(t, e) {
  return t.backgroundColor = t.data.map(() => getColorFromPaletteByIndex(e++)), e;
}
function setBackgroundColorForDatasetWithTransparency(t, e) {
  return t.backgroundColor = t.data.map(() => rgbaColorWithOpacity(e++)), e;
}
function updateChartBackgroundColors(t) {
  let e = 0;
  return (i, s) => {
    const n = t.getDatasetMeta(s).controller;
    n instanceof DoughnutChartComponent ? e = setBackgroundColorForDataSet(i, e) : n instanceof PolarAreaChartElement ? e = setBackgroundColorForDatasetWithTransparency(i, e) : n && (e = applyColorSettingsToChart(i, e));
  };
}
function containsColorProperties(t) {
  let e;
  for (e in t) if (t[e].borderColor || t[e].backgroundColor) return !0;
  return !1;
}
function hasColorAttributes(t) {
  return t && (t.borderColor || t.backgroundColor);
}
var colorSettings = {
  id: "colors",
  defaults: {
    enabled: !0,
    forceOverride: !1
  },
  beforeLayout(t, e, i) {
    if (!i.enabled) return;
    const {
        data: {
          datasets: s
        },
        options: n
      } = t.config,
      {
        elements: o
      } = n;
    if (!i.forceOverride && (containsColorProperties(s) || hasColorAttributes(n) || o && containsColorProperties(o))) return;
    const a = updateChartBackgroundColors(t);
    s.forEach(a);
  }
};
function extractSampleSlice(t, e, i, s, n) {
  const o = n.samples || s;
  if (o >= i) return t.slice(e, e + i);
  const a = [],
    r = (i - 2) / (o - 2);
  let h = 0;
  const l = e + i - 1;
  let c,
    d,
    u,
    g,
    p,
    f = e;
  for (a[h++] = t[f], c = 0; c < o - 2; c++) {
    let s,
      n = 0,
      o = 0;
    const l = Math.floor((c + 1) * r) + 1 + e,
      m = Math.min(Math.floor((c + 2) * r) + 1, i) + e,
      x = m - l;
    for (s = l; s < m; s++) n += t[s].x, o += t[s].y;
    n /= x, o /= x;
    const b = Math.floor(c * r) + 1 + e,
      _ = Math.min(Math.floor((c + 1) * r) + 1, i) + e,
      {
        x: y,
        y: v
      } = t[f];
    for (u = g = -1, s = b; s < _; s++) g = .5 * Math.abs((y - n) * (t[s].y - v) - (y - t[s].x) * (o - v)), g > u && (u = g, d = t[s], p = s);
    a[h++] = d, f = p;
  }
  return a[h++] = t[l], a;
}
function calculateSegmentArea(t, e, i, s) {
  let n,
    o,
    a,
    r,
    h,
    l,
    c,
    d,
    u,
    g,
    p = 0,
    m = 0;
  const x = [],
    b = e + i - 1,
    _ = t[e].x,
    y = t[b].x - _;
  for (n = e; n < e + i; ++n) {
    o = t[n], a = (o.x - _) / y * s, r = o.y;
    const e = 0 | a;
    if (e === h) r < u ? (u = r, l = n) : r > g && (g = r, c = n), p = (m * p + o.x) / ++m;else {
      const i = n - 1;
      if (!calculateComponentKey(l) && !calculateComponentKey(c)) {
        const e = Math.min(l, c),
          s = Math.max(l, c);
        e !== d && e !== i && x.push({
          ...t[e],
          x: p
        }), s !== d && s !== i && x.push({
          ...t[s],
          x: p
        });
      }
      n > 0 && i !== d && x.push(t[i]), x.push(o), h = e, m = 0, u = g = r, l = c = d = n;
    }
  }
  return x;
}
function unpackDataset(t) {
  if (t._decimated) {
    const e = t._data;
    delete t._decimated, delete t._data, Object.defineProperty(t, "data", {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: e
    });
  }
}
function processDataSetsForDecimation(t) {
  t.data.datasets.forEach(t => {
    unpackDataset(t);
  });
}
function calculateDataDecimationBounds(t, e) {
  const i = e.length;
  let s,
    n = 0;
  const {
      iScale: o
    } = t,
    {
      min: a,
      max: r,
      minDefined: h,
      maxDefined: l
    } = o.getUserBounds();
  return h && (n = userInputValue(___identifierMapping(e, o.axis, a).lo, 0, i - 1)), s = l ? userInputValue(___identifierMapping(e, o.axis, r).hi + 1, n, i) - n : i - n, {
    start: n,
    count: s
  };
}
var decimationSettings = {
  id: "decimation",
  defaults: {
    algorithm: "min-max",
    enabled: !1
  },
  beforeElementsUpdate: (t, i, s) => {
    if (!s.enabled) return void processDataSetsForDecimation(t);
    const n = t.width;
    t.data.datasets.forEach((i, o) => {
      const {
          _data: a,
          indexAxis: r
        } = i,
        h = t.getDatasetMeta(o),
        l = a || i.data;
      if ("y" === eventDispatcher([r, t.options.indexAxis])) return;
      if (!h.controller.supportsDecimation) return;
      const c = t.scales[h.xAxisID];
      if ("linear" !== c.type && "time" !== c.type) return;
      if (t.options.parsing) return;
      let {
        start: d,
        count: u
      } = calculateDataDecimationBounds(h, l);
      if (u <= (s.threshold || 4 * n)) return void unpackDataset(i);
      let g;
      switch (calculateComponentKey(a) && (i._data = l, delete i.data, Object.defineProperty(i, "data", {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return this._decimated;
        },
        set: function (t) {
          this._data = t;
        }
      })), s.algorithm) {
        case "lttb":
          g = extractSampleSlice(l, d, u, n, s);
          break;
        case "min-max":
          g = calculateSegmentArea(l, d, u, n);
          break;
        default:
          throw new Error(`Unsupported decimation algorithm '${s.algorithm}'`);
      }
      i._decimated = g;
    });
  },
  destroy(t) {
    processDataSetsForDecimation(t);
  }
};
function processSegmentData(t, e, i) {
  const s = t.segments,
    n = t.points,
    o = e.points,
    a = [];
  for (const t of s) {
    let {
      start: s,
      end: r
    } = t;
    r = findLastValidPointIndexInArray(s, r, n);
    const h = getPropertyBoundsForSegment(i, n[s], n[r], t.loop);
    if (!e.segments) {
      a.push({
        source: t,
        target: h,
        start: n[s],
        end: n[r]
      });
      continue;
    }
    const l = currentUserSessionToken(e, h);
    for (const e of l) {
      const s = getPropertyBoundsForSegment(i, o[e.start], o[e.end], e.loop),
        r = colorTransformationFunction(t, n, s);
      for (const t of r) a.push({
        source: t,
        target: e,
        start: {
          [i]: getValueOrDefaultAtIndex(h, s, "start", Math.max)
        },
        end: {
          [i]: getValueOrDefaultAtIndex(h, s, "end", Math.min)
        }
      });
    }
  }
  return a;
}
function getPropertyBoundsForSegment(t, e, i, s) {
  if (s) return;
  let n = e[t],
    o = i[t];
  return "angle" === t && (n = userSessionRequestId(n), o = userSessionRequestId(o)), {
    property: t,
    start: n,
    end: o
  };
}
function createPointsFromSegments(t, e) {
  const {
      x: i = null,
      y: s = null
    } = t || {},
    n = e.points,
    o = [];
  return e.segments.forEach(({
    start: t,
    end: e
  }) => {
    e = findLastValidPointIndexInArray(t, e, n);
    const a = n[t],
      r = n[e];
    null !== s ? (o.push({
      x: a.x,
      y: s
    }), o.push({
      x: r.x,
      y: s
    })) : null !== i && (o.push({
      x: i,
      y: a.y
    }), o.push({
      x: i,
      y: r.y
    }));
  }), o;
}
function findLastValidPointIndexInArray(t, e, i) {
  for (; e > t; e--) {
    const t = i[e];
    if (!isNaN(t.x) && !isNaN(t.y)) break;
  }
  return e;
}
function getValueOrDefaultAtIndex(t, e, i, s) {
  return t && e ? s(t[i], e[i]) : t ? t[i] : e ? e[i] : 0;
}
function generateLineChartPoints(t, e) {
  let i = [],
    s = !1;
  return elementReference(t) ? (s = !0, i = t) : i = createPointsFromSegments(t, e), i.length ? new LineChartComponent({
    points: i,
    options: {
      tension: 0
    },
    _loop: s,
    _fullLoop: s
  }) : null;
}
function isFillEnabledForChart(t) {
  return t && !1 !== t.fill;
}
function retrieveFillSource(t, e, i) {
  let s = t[e].fill;
  const n = [e];
  let o;
  if (!i) return s;
  for (; !1 !== s && -1 === n.indexOf(s);) {
    if (!__dataProcessor(s)) return s;
    if (o = t[s], !o) return !1;
    if (o.visible) return s;
    n.push(s), s = o.fill;
  }
  return !1;
}
function retrieveFillValue(t, e, i) {
  const s = determineFillTarget(t);
  if (dataIndex(s)) return !isNaN(s.value) && s;
  let o = parseFloat(s);
  return __dataProcessor(o) && Math.floor(o) === o ? isIndexWithinBounds(s[0], e, o, i) : ["origin", "start", "end", "stack", "shape"].indexOf(s) >= 0 && s;
}
function isIndexWithinBounds(t, e, i, s) {
  return "-" !== t && "+" !== t || (i = e + i), !(i === e || i < 0 || i >= s) && i;
}
function getPixelCoordinateForPosition(t, e) {
  let i = null;
  return "start" === t ? i = e.bottom : "end" === t ? i = e.top : dataIndex(t) ? i = e.getPixelForValue(t.value) : e.getBasePixel && (i = e.getBasePixel()), i;
}
function valueAtPosition(t, e, i) {
  let s;
  return s = "start" === t ? i : "end" === t ? e.options.reverse ? e.min : e.max : dataIndex(t) ? t.value : e.getBaseValue(), s;
}
function determineFillTarget(t) {
  const e = t.options,
    i = e.fill;
  let s = responseHandlerFunction(i && i.target, i);
  return void 0 === s && (s = !!e.backgroundColor), !1 !== s && null !== s && (!0 === s ? "origin" : s);
}
function __generatePointsFromSegments(t) {
  const {
      scale: e,
      index: i,
      line: s
    } = t,
    n = [],
    o = s.segments,
    a = s.points,
    r = retrieveVisibleDatasetsByIndex(e, i);
  r.push(generateLineChartPoints({
    x: null,
    y: e.bottom
  }, s));
  for (let t = 0; t < o.length; t++) {
    const e = o[t];
    for (let t = e.start; t <= e.end; t++) collectInterpolatedPoints(n, a[t], r);
  }
  return new LineChartComponent({
    points: n,
    options: {}
  });
}
function retrieveVisibleDatasetsByIndex(t, e) {
  const i = [],
    s = t.getMatchingVisibleMetas("line");
  for (let t = 0; t < s.length; t++) {
    const n = s[t];
    if (n.index === e) break;
    n.hidden || i.unshift(n.dataset);
  }
  return i;
}
function collectInterpolatedPoints(t, e, i) {
  const s = [];
  for (let n = 0; n < i.length; n++) {
    const o = i[n],
      {
        first: a,
        last: r,
        point: h
      } = interpolatedPointData(o, e, "x");
    if (!(!h || a && r)) if (a) s.unshift(h);else if (t.push(h), !r) break;
  }
  t.push(...s);
}
function interpolatedPointData(t, e, i) {
  const s = t.interpolate(e, i);
  if (!s) return {};
  const n = s[i],
    o = t.segments,
    a = t.points;
  let r = !1,
    h = !1;
  for (let t = 0; t < o.length; t++) {
    const e = o[t],
      s = a[e.start][i],
      l = a[e.end][i];
    if (__eventHandler(n, s, l)) {
      r = n === s, h = n === l;
      break;
    }
  }
  return {
    first: r,
    last: h,
    point: s
  };
}
class CircleShape {
  constructor(t) {
    this.x = t.x, this.y = t.y, this.radius = t.radius;
  }
  pathSegment(t, e, i) {
    const {
      x: s,
      y: n,
      radius: o
    } = this;
    return e = e || {
      start: 0,
      end: ComponentTypeIdentifier
    }, t.arc(s, n, o, e.end, e.start, !0), !i.bounds;
  }
  interpolate(t) {
    const {
        x: e,
        y: i,
        radius: s
      } = this,
      n = t.angle;
    return {
      x: e + Math.cos(n) * s,
      y: i + Math.sin(n) * s,
      angle: n
    };
  }
}
function determineDatasetVisibility(t) {
  const {
    chart: e,
    fill: i,
    line: s
  } = t;
  if (__dataProcessor(i)) return retrieveDataset(e, i);
  if ("stack" === i) return __generatePointsFromSegments(t);
  if ("shape" === i) return !0;
  const n = retrievePointPosition(t);
  return n instanceof CircleShape ? n : generateLineChartPoints(n, s);
}
function retrieveDataset(t, e) {
  const i = t.getDatasetMeta(e);
  return i && t.isDatasetVisible(e) ? i.dataset : null;
}
function retrievePointPosition(t) {
  return (t.scale || {}).getPointPositionForValue ? getPositionForValueWithDefaults(t) : getPointPositionFromScale(t);
}
function getPointPositionFromScale(t) {
  const {
      scale: e = {},
      fill: i
    } = t,
    s = getPixelCoordinateForPosition(i, e);
  if (__dataProcessor(s)) {
    const t = e.isHorizontal();
    return {
      x: t ? s : null,
      y: t ? null : s
    };
  }
  return null;
}
function getPositionForValueWithDefaults(t) {
  const {
      scale: e,
      fill: i
    } = t,
    s = e.options,
    n = e.getLabels().length,
    o = s.reverse ? e.max : e.min,
    a = valueAtPosition(i, e, o),
    r = [];
  if (s.grid.circular) {
    const t = e.getPointPositionForValue(0, o);
    return new CircleShape({
      x: t.x,
      y: t.y,
      radius: e.getDistanceFromCenterForValue(a)
    });
  }
  for (let t = 0; t < n; ++t) r.push(e.getPointPositionForValue(t, a));
  return r;
}
function drawFilledLine(t, e, i) {
  const s = determineDatasetVisibility(e),
    {
      line: n,
      scale: o,
      axis: a
    } = e,
    r = n.options,
    h = r.fill,
    l = r.backgroundColor,
    {
      above: c = l,
      below: d = l
    } = h || {};
  s && n.points.length && (valueRepresentation(t, i), renderLineWithArea(t, {
    line: n,
    target: s,
    above: c,
    below: d,
    area: i,
    scale: o,
    axis: a
  }), currencySymbol(t));
}
function renderLineWithArea(t, e) {
  const {
      line: i,
      target: s,
      above: n,
      below: o,
      area: a,
      scale: r
    } = e,
    h = i._loop ? "angle" : e.axis;
  t.save(), "x" === h && o !== n && (_renderPathSegment(t, s, a.top), ____drawPathSegment(t, {
    line: i,
    target: s,
    color: n,
    scale: r,
    property: h
  }), t.restore(), t.save(), _renderPathSegment(t, s, a.bottom)), ____drawPathSegment(t, {
    line: i,
    target: s,
    color: o,
    scale: r,
    property: h
  }), t.restore();
}
function _renderPathSegment(t, e, i) {
  const {
    segments: s,
    points: n
  } = e;
  let o = !0,
    a = !1;
  t.beginPath();
  for (const r of s) {
    const {
        start: s,
        end: h
      } = r,
      l = n[s],
      c = n[findLastValidPointIndexInArray(s, h, n)];
    o ? (t.moveTo(l.x, l.y), o = !1) : (t.lineTo(l.x, i), t.lineTo(l.x, l.y)), a = !!e.pathSegment(t, r, {
      move: a
    }), a ? t.closePath() : t.lineTo(c.x, i);
  }
  t.lineTo(e.first().x, i), t.closePath(), t.clip();
}
function ____drawPathSegment(t, e) {
  const {
      line: i,
      target: s,
      property: n,
      color: o,
      scale: a
    } = e,
    r = processSegmentData(i, s, n);
  for (const {
    source: e,
    target: h,
    start: l,
    end: c
  } of r) {
    const {
        style: {
          backgroundColor: r = o
        } = {}
      } = e,
      d = !0 !== s;
    t.save(), t.fillStyle = r, clipChartAreaToCanvas(t, a, d && getPropertyBoundsForSegment(n, l, c)), t.beginPath();
    const u = !!i.pathSegment(t, e);
    let g;
    if (d) {
      u ? t.closePath() : drawLineToInterpolatedCoordinates(t, s, c, n);
      const e = !!s.pathSegment(t, h, {
        move: u,
        reverse: !0
      });
      g = u && e, g || drawLineToInterpolatedCoordinates(t, s, l, n);
    }
    t.closePath(), t.fill(g ? "evenodd" : "nonzero"), t.restore();
  }
}
function clipChartAreaToCanvas(t, e, i) {
  const {
      top: s,
      bottom: n
    } = e.chart.chartArea,
    {
      property: o,
      start: a,
      end: r
    } = i || {};
  "x" === o && (t.beginPath(), t.rect(a, s, r - a, n - s), t.clip());
}
function drawLineToInterpolatedCoordinates(t, e, i, s) {
  const n = e.interpolate(i, s);
  n && t.lineTo(n.x, n.y);
}
var fillerPluginManager = {
  id: "filler",
  afterDatasetsUpdate(t, e, i) {
    const s = (t.data.datasets || []).length,
      n = [];
    let o, a, r, h;
    for (a = 0; a < s; ++a) o = t.getDatasetMeta(a), r = o.dataset, h = null, r && r.options && r instanceof LineChartComponent && (h = {
      visible: t.isDatasetVisible(a),
      index: a,
      fill: retrieveFillValue(r, a, s),
      chart: t,
      axis: o.controller.options.indexAxis,
      scale: o.vScale,
      line: r
    }), o.$filler = h, n.push(h);
    for (a = 0; a < s; ++a) h = n[a], h && !1 !== h.fill && (h.fill = retrieveFillSource(n, a, i.propagate));
  },
  beforeDraw(t, e, i) {
    const s = "beforeDraw" === i.drawTime,
      n = t.getSortedVisibleDatasetMetas(),
      o = t.chartArea;
    for (let e = n.length - 1; e >= 0; --e) {
      const i = n[e].$filler;
      i && (i.line.updateControlPoints(o, i.axis), s && i.fill && drawFilledLine(t.ctx, i, o));
    }
  },
  beforeDatasetsDraw(t, e, i) {
    if ("beforeDatasetsDraw" !== i.drawTime) return;
    const s = t.getSortedVisibleDatasetMetas();
    for (let e = s.length - 1; e >= 0; --e) {
      const i = s[e].$filler;
      isFillEnabledForChart(i) && drawFilledLine(t.ctx, i, t.chartArea);
    }
  },
  beforeDatasetDraw(t, e, i) {
    const s = e.meta.$filler;
    isFillEnabledForChart(s) && "beforeDatasetDraw" === i.drawTime && drawFilledLine(t.ctx, s, t.chartArea);
  },
  defaults: {
    propagate: !0,
    drawTime: "beforeDatasetDraw"
  }
};
const ____calculateBoxDimensions = (t, e) => {
    let {
      boxHeight: i = e,
      boxWidth: s = e
    } = t;
    return t.usePointStyle && (i = Math.min(i, e), s = t.pointStyleWidth || Math.min(s, e)), {
      boxWidth: s,
      boxHeight: i,
      itemHeight: Math.max(e, i)
    };
  },
  areLegendItemsIdentical = (t, e) => null !== t && null !== e && t.datasetIndex === e.datasetIndex && t.index === e.index;
class LegendManager extends CanvasAnimationManager {
  constructor(t) {
    super(), this._added = !1, this.legendHitBoxes = [], this._hoveredItem = null, this.doughnutMode = !1, this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this.legendItems = void 0, this.columnSizes = void 0, this.lineWidths = void 0, this.maxHeight = void 0, this.maxWidth = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.height = void 0, this.width = void 0, this._margins = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, e, i) {
    this.maxWidth = t, this.maxHeight = e, this._margins = i, this.setDimensions(), this.buildLabels(), this.fit();
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = this._margins.left, this.right = this.width) : (this.height = this.maxHeight, this.top = this._margins.top, this.bottom = this.height);
  }
  buildLabels() {
    const t = this.options.labels || {};
    let e = elementQuerySelector(t.generateLabels, [this.chart], this) || [];
    t.filter && (e = e.filter(e => t.filter(e, this.chart.data))), t.sort && (e = e.sort((e, i) => t.sort(e, i, this.chart.data))), this.options.reverse && e.reverse(), this.legendItems = e;
  }
  fit() {
    const {
      options: t,
      ctx: e
    } = this;
    if (!t.display) return void (this.width = this.height = 0);
    const i = t.labels,
      s = _userInputValue(i.font),
      n = s.size,
      o = this._computeTitleHeight(),
      {
        boxWidth: a,
        itemHeight: r
      } = ____calculateBoxDimensions(i, n);
    let h, l;
    e.font = s.string, this.isHorizontal() ? (h = this.maxWidth, l = this._fitRows(o, n, a, r) + 10) : (l = this.maxHeight, h = this._fitCols(o, s, a, r) + 10), this.width = Math.min(h, t.maxWidth || this.maxWidth), this.height = Math.min(l, t.maxHeight || this.maxHeight);
  }
  _fitRows(t, e, i, s) {
    const {
        ctx: n,
        maxWidth: o,
        options: {
          labels: {
            padding: a
          }
        }
      } = this,
      r = this.legendHitBoxes = [],
      h = this.lineWidths = [0],
      l = s + a;
    let c = t;
    n.textAlign = "left", n.textBaseline = "middle";
    let d = -1,
      u = -l;
    return this.legendItems.forEach((t, g) => {
      const p = i + e / 2 + n.measureText(t.text).width;
      (0 === g || h[h.length - 1] + p + 2 * a > o) && (c += l, h[h.length - (g > 0 ? 0 : 1)] = 0, u += l, d++), r[g] = {
        left: 0,
        top: u,
        row: d,
        width: p,
        height: s
      }, h[h.length - 1] += p + a;
    }), c;
  }
  _fitCols(t, e, i, s) {
    const {
        ctx: n,
        maxHeight: o,
        options: {
          labels: {
            padding: a
          }
        }
      } = this,
      r = this.legendHitBoxes = [],
      h = this.columnSizes = [],
      l = o - t;
    let c = a,
      d = 0,
      u = 0,
      g = 0,
      p = 0;
    return this.legendItems.forEach((t, o) => {
      const {
        itemWidth: f,
        itemHeight: m
      } = calculateItemSize(i, e, n, t, s);
      o > 0 && u + m + 2 * a > l && (c += d + a, h.push({
        width: d,
        height: u
      }), g += d + a, p++, d = u = 0), r[o] = {
        left: g,
        top: u,
        col: p,
        width: f,
        height: m
      }, d = Math.max(d, f), u += m + a;
    }), c += d, h.push({
      width: d,
      height: u
    }), c;
  }
  adjustHitBoxes() {
    if (!this.options.display) return;
    const t = this._computeTitleHeight(),
      {
        legendHitBoxes: e,
        options: {
          align: i,
          labels: {
            padding: s
          },
          rtl: n
        }
      } = this,
      o = colorDataArray(n, this.left, this.width);
    if (this.isHorizontal()) {
      let n = 0,
        a = inputValueAdjusted(i, this.left + s, this.right - this.lineWidths[n]);
      for (const r of e) n !== r.row && (n = r.row, a = inputValueAdjusted(i, this.left + s, this.right - this.lineWidths[n])), r.top += this.top + t + s, r.left = o.leftForLtr(o.x(a), r.width), a += r.width + s;
    } else {
      let n = 0,
        a = inputValueAdjusted(i, this.top + t + s, this.bottom - this.columnSizes[n].height);
      for (const r of e) r.col !== n && (n = r.col, a = inputValueAdjusted(i, this.top + t + s, this.bottom - this.columnSizes[n].height)), r.top = a, r.left += this.left + s, r.left = o.leftForLtr(o.x(r.left), r.width), a += r.height + s;
    }
  }
  isHorizontal() {
    return "top" === this.options.position || "bottom" === this.options.position;
  }
  draw() {
    if (this.options.display) {
      const t = this.ctx;
      valueRepresentation(t, this), this._draw(), currencySymbol(t);
    }
  }
  _draw() {
    const {
        options: t,
        columnSizes: e,
        lineWidths: i,
        ctx: s
      } = this,
      {
        align: n,
        labels: a
      } = t,
      h = _dataProcessor.color,
      l = colorDataArray(t.rtl, this.left, this.width),
      c = _userInputValue(a.font),
      {
        padding: d
      } = a,
      u = c.size,
      g = u / 2;
    let p;
    this.drawTitle(), s.textAlign = l.textAlign("left"), s.textBaseline = "middle", s.lineWidth = .5, s.font = c.string;
    const {
        boxWidth: f,
        boxHeight: m,
        itemHeight: x
      } = ____calculateBoxDimensions(a, u),
      b = this.isHorizontal(),
      _ = this._computeTitleHeight();
    p = b ? {
      x: inputValueAdjusted(n, this.left + d, this.right - i[0]),
      y: this.top + d + _,
      line: 0
    } : {
      x: this.left + d,
      y: inputValueAdjusted(n, this.top + _ + d, this.bottom - e[0].height),
      line: 0
    }, colorHelperUtility(this.ctx, t.textDirection);
    const y = x + d;
    this.legendItems.forEach((o, v) => {
      s.strokeStyle = o.fontColor, s.fillStyle = o.fontColor;
      const M = s.measureText(o.text).width,
        w = l.textAlign(o.textAlign || (o.textAlign = a.textAlign)),
        k = f + g + M;
      let S = p.x,
        D = p.y;
      l.setWidth(this.width), b ? v > 0 && S + k + d > this.right && (D = p.y += y, p.line++, S = p.x = inputValueAdjusted(n, this.left + d, this.right - i[p.line])) : v > 0 && D + y > this.bottom && (S = p.x = S + e[p.line].width + d, p.line++, D = p.y = inputValueAdjusted(n, this.top + _ + d, this.bottom - e[p.line].height));
      if (function (t, e, i) {
        if (isNaN(f) || f <= 0 || isNaN(m) || m < 0) return;
        s.save();
        const n = responseHandlerFunction(i.lineWidth, 1);
        if (s.fillStyle = responseHandlerFunction(i.fillStyle, h), s.lineCap = responseHandlerFunction(i.lineCap, "butt"), s.lineDashOffset = responseHandlerFunction(i.lineDashOffset, 0), s.lineJoin = responseHandlerFunction(i.lineJoin, "miter"), s.lineWidth = n, s.strokeStyle = responseHandlerFunction(i.strokeStyle, h), s.setLineDash(responseHandlerFunction(i.lineDash, [])), a.usePointStyle) {
          const o = {
              radius: m * Math.SQRT2 / 2,
              pointStyle: i.pointStyle,
              rotation: i.rotation,
              borderWidth: n
            },
            r = l.xPlus(t, f / 2);
          _colorUtility(s, o, r, e + g, a.pointStyleWidth && f);
        } else {
          const o = e + Math.max((u - m) / 2, 0),
            a = l.leftForLtr(t, f),
            r = colorUtility(i.borderRadius);
          s.beginPath(), Object.values(r).some(t => 0 !== t) ? lightnessAdjustment(s, {
            x: a,
            y: o,
            w: f,
            h: m,
            radius: r
          }) : s.rect(a, o, f, m), s.fill(), 0 !== n && s.stroke();
        }
        s.restore();
      }(l.x(S), D, o), S = colorHelperFunction(w, S + f + g, b ? S + k : this.right, t.rtl), function (t, e, i) {
        _____identifierMapping(s, i.text, t, e + x / 2, c, {
          strikethrough: i.hidden,
          textAlign: l.textAlign(i.textAlign)
        });
      }(l.x(S), D, o), b) p.x += k + d;else if ("string" != typeof o.text) {
        const t = c.lineHeight;
        p.y += calculateTextLengthInPixels(o, t) + d;
      } else p.y += y;
    }), chartDataset(this.ctx, t.textDirection);
  }
  drawTitle() {
    const t = this.options,
      e = t.title,
      i = _userInputValue(e.font),
      s = __responseHandler(e.padding);
    if (!e.display) return;
    const n = colorDataArray(t.rtl, this.left, this.width),
      o = this.ctx,
      a = e.position,
      r = i.size / 2,
      h = s.top + r;
    let l,
      c = this.left,
      d = this.width;
    if (this.isHorizontal()) d = Math.max(...this.lineWidths), l = this.top + h, c = inputValueAdjusted(t.align, c, this.right - d);else {
      const e = this.columnSizes.reduce((t, e) => Math.max(t, e.height), 0);
      l = h + inputValueAdjusted(t.align, this.top, this.bottom - e - t.labels.padding - this._computeTitleHeight());
    }
    const u = inputValueAdjusted(a, c, c + d);
    o.textAlign = n.textAlign(inputFieldValue(a)), o.textBaseline = "middle", o.strokeStyle = e.color, o.fillStyle = e.color, o.font = i.string, _____identifierMapping(o, e.text, u, l, i);
  }
  _computeTitleHeight() {
    const t = this.options.title,
      e = _userInputValue(t.font),
      i = __responseHandler(t.padding);
    return t.display ? e.lineHeight + i.height : 0;
  }
  _getLegendItemAt(t, e) {
    let i, s, n;
    if (__eventHandler(t, this.left, this.right) && __eventHandler(e, this.top, this.bottom)) for (n = this.legendHitBoxes, i = 0; i < n.length; ++i) if (s = n[i], __eventHandler(t, s.left, s.left + s.width) && __eventHandler(e, s.top, s.top + s.height)) return this.legendItems[i];
    return null;
  }
  handleEvent(t) {
    const e = this.options;
    if (!isEventTriggeredByPointerInteraction(t.type, e)) return;
    const i = this._getLegendItemAt(t.x, t.y);
    if ("mousemove" === t.type || "mouseout" === t.type) {
      const s = this._hoveredItem,
        n = areLegendItemsIdentical(s, i);
      s && !n && elementQuerySelector(e.onLeave, [t, s, this], this), this._hoveredItem = i, i && !n && elementQuerySelector(e.onHover, [t, i, this], this);
    } else i && elementQuerySelector(e.onClick, [t, i, this], this);
  }
}
function calculateItemSize(t, e, i, s, n) {
  return {
    itemWidth: calculateItemWidth(s, t, e, i),
    itemHeight: _calculateTextHeight(n, s, e.lineHeight)
  };
}
function calculateItemWidth(t, e, i, s) {
  let n = t.text;
  return n && "string" != typeof n && (n = n.reduce((t, e) => t.length > e.length ? t : e)), e + i.size / 2 + s.measureText(n).width;
}
function _calculateTextHeight(t, e, i) {
  let s = t;
  return "string" != typeof e.text && (s = calculateTextLengthInPixels(e, i)), s;
}
function calculateTextLengthInPixels(t, e) {
  return e * (t.text ? t.text.length : 0);
}
function isEventTriggeredByPointerInteraction(t, e) {
  return !("mousemove" !== t && "mouseout" !== t || !e.onHover && !e.onLeave) || !(!e.onClick || "click" !== t && "mouseup" !== t);
}
var legendControllerInstance = {
  id: "legend",
  _element: LegendManager,
  start(t, e, i) {
    const s = t.legend = new LegendManager({
      ctx: t.ctx,
      options: i,
      chart: t
    });
    boxLayoutManager.configure(t, s, i), boxLayoutManager.addBox(t, s);
  },
  stop(t) {
    boxLayoutManager.removeBox(t, t.legend), delete t.legend;
  },
  beforeUpdate(t, e, i) {
    const s = t.legend;
    boxLayoutManager.configure(t, s, i), s.options = i;
  },
  afterUpdate(t) {
    const e = t.legend;
    e.buildLabels(), e.adjustHitBoxes();
  },
  afterEvent(t, e) {
    e.replay || t.legend.handleEvent(e.event);
  },
  defaults: {
    display: !0,
    position: "top",
    align: "center",
    fullSize: !0,
    reverse: !1,
    weight: 1e3,
    onClick(t, e, i) {
      const s = e.datasetIndex,
        n = i.chart;
      n.isDatasetVisible(s) ? (n.hide(s), e.hidden = !0) : (n.show(s), e.hidden = !1);
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: t => t.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(t) {
        const e = t.data.datasets,
          {
            labels: {
              usePointStyle: i,
              pointStyle: s,
              textAlign: n,
              color: o,
              useBorderRadius: a,
              borderRadius: r
            }
          } = t.legend.options;
        return t._getSortedDatasetMetas().map(t => {
          const h = t.controller.getStyle(i ? 0 : void 0),
            l = __responseHandler(h.borderWidth);
          return {
            text: e[t.index].label,
            fillStyle: h.backgroundColor,
            fontColor: o,
            hidden: !t.visible,
            lineCap: h.borderCapStyle,
            lineDash: h.borderDash,
            lineDashOffset: h.borderDashOffset,
            lineJoin: h.borderJoinStyle,
            lineWidth: (l.width + l.height) / 4,
            strokeStyle: h.borderColor,
            pointStyle: s || h.pointStyle,
            rotation: h.rotation,
            textAlign: n || h.textAlign,
            borderRadius: a && (r || h.borderRadius),
            datasetIndex: t.index
          };
        }, this);
      }
    },
    title: {
      color: t => t.chart.options.color,
      display: !1,
      position: "center",
      text: ""
    }
  },
  descriptors: {
    _scriptable: t => !t.startsWith("on"),
    labels: {
      _scriptable: t => !["generateLabels", "filter", "sort"].includes(t)
    }
  }
};
class ___ChartController extends CanvasAnimationManager {
  constructor(t) {
    super(), this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this._padding = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, e) {
    const i = this.options;
    if (this.left = 0, this.top = 0, !i.display) return void (this.width = this.height = this.right = this.bottom = 0);
    this.width = this.right = t, this.height = this.bottom = e;
    const s = elementReference(i.text) ? i.text.length : 1;
    this._padding = __responseHandler(i.padding);
    const n = s * _userInputValue(i.font).lineHeight + this._padding.height;
    this.isHorizontal() ? this.height = n : this.width = n;
  }
  isHorizontal() {
    const t = this.options.position;
    return "top" === t || "bottom" === t;
  }
  _drawArgs(t) {
    const {
        top: e,
        left: i,
        bottom: s,
        right: n,
        options: o
      } = this,
      a = o.align;
    let r,
      h,
      l,
      c = 0;
    return this.isHorizontal() ? (h = inputValueAdjusted(a, i, n), l = e + t, r = n - i) : ("left" === o.position ? (h = i + t, l = inputValueAdjusted(a, s, e), c = -.5 * __defaultExportModule) : (h = n - t, l = inputValueAdjusted(a, e, s), c = .5 * __defaultExportModule), r = s - e), {
      titleX: h,
      titleY: l,
      maxWidth: r,
      rotation: c
    };
  }
  draw() {
    const t = this.ctx,
      e = this.options;
    if (!e.display) return;
    const i = _userInputValue(e.font),
      s = i.lineHeight / 2 + this._padding.top,
      {
        titleX: n,
        titleY: o,
        maxWidth: a,
        rotation: r
      } = this._drawArgs(s);
    _____identifierMapping(t, e.text, 0, 0, i, {
      color: e.color,
      maxWidth: a,
      rotation: r,
      textAlign: inputFieldValue(e.align),
      textBaseline: "middle",
      translation: [n, o]
    });
  }
}
function configureTitleBlock(t, e) {
  const i = new ___ChartController({
    ctx: t.ctx,
    options: e,
    chart: t
  });
  boxLayoutManager.configure(t, i, e), boxLayoutManager.addBox(t, i), t.titleBlock = i;
}
var titlePluginManager = {
  id: "title",
  _element: ___ChartController,
  start(t, e, i) {
    configureTitleBlock(t, i);
  },
  stop(t) {
    const e = t.titleBlock;
    boxLayoutManager.removeBox(t, e), delete t.titleBlock;
  },
  beforeUpdate(t, e, i) {
    const s = t.titleBlock;
    boxLayoutManager.configure(t, s, i), s.options = i;
  },
  defaults: {
    align: "center",
    display: !1,
    font: {
      weight: "bold"
    },
    fullSize: !0,
    padding: 10,
    position: "top",
    text: "",
    weight: 2e3
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: !0,
    _indexable: !1
  }
};
const chartInstanceRegistry = new WeakMap();
var subtitleManager = {
  id: "subtitle",
  start(t, e, i) {
    const s = new ___ChartController({
      ctx: t.ctx,
      options: i,
      chart: t
    });
    boxLayoutManager.configure(t, s, i), boxLayoutManager.addBox(t, s), chartInstanceRegistry.set(t, s);
  },
  stop(t) {
    boxLayoutManager.removeBox(t, chartInstanceRegistry.get(t)), chartInstanceRegistry.delete(t);
  },
  beforeUpdate(t, e, i) {
    const s = chartInstanceRegistry.get(t);
    boxLayoutManager.configure(t, s, i), s.options = i;
  },
  defaults: {
    align: "center",
    display: !1,
    font: {
      weight: "normal"
    },
    fullSize: !0,
    padding: 0,
    position: "top",
    text: "",
    weight: 1500
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: !0,
    _indexable: !1
  }
};
const tooltipPositionCalculator = {
  average(t) {
    if (!t.length) return !1;
    let e,
      i,
      s = 0,
      n = 0,
      o = 0;
    for (e = 0, i = t.length; e < i; ++e) {
      const i = t[e].element;
      if (i && i.hasValue()) {
        const t = i.tooltipPosition();
        s += t.x, n += t.y, ++o;
      }
    }
    return {
      x: s / o,
      y: n / o
    };
  },
  nearest(t, e) {
    if (!t.length) return !1;
    let i,
      s,
      n,
      o = e.x,
      a = e.y,
      r = Number.POSITIVE_INFINITY;
    for (i = 0, s = t.length; i < s; ++i) {
      const s = t[i].element;
      if (s && s.hasValue()) {
        const t = s.getCenterPoint(),
          i = colorPalette(e, t);
        i < r && (r = i, n = s);
      }
    }
    if (n) {
      const t = n.tooltipPosition();
      o = t.x, a = t.y;
    }
    return {
      x: o,
      y: a
    };
  }
};
function addElementsToArray(t, e) {
  return e && (elementReference(e) ? Array.prototype.push.apply(t, e) : t.push(e)), t;
}
function splitStringIntoLines(t) {
  return ("string" == typeof t || t instanceof String) && t.indexOf("\n") > -1 ? t.split("\n") : t;
}
function getDatasetLabelDetails(t, e) {
  const {
      element: i,
      datasetIndex: s,
      index: n
    } = e,
    o = t.getDatasetMeta(s).controller,
    {
      label: a,
      value: r
    } = o.getLabelAndValue(n);
  return {
    chart: t,
    label: a,
    parsed: o.getParsed(n),
    raw: t.data.datasets[s].data[n],
    formattedValue: r,
    dataset: o.getDataset(),
    dataIndex: n,
    datasetIndex: s,
    element: i
  };
}
function renderTooltipContent(t, e) {
  const i = t.chart.ctx,
    {
      body: s,
      footer: n,
      title: o
    } = t,
    {
      boxWidth: a,
      boxHeight: r
    } = e,
    h = _userInputValue(e.bodyFont),
    l = _userInputValue(e.titleFont),
    c = _userInputValue(e.footerFont),
    d = o.length,
    u = n.length,
    g = s.length,
    p = __responseHandler(e.padding);
  let f = p.height,
    m = 0,
    x = s.reduce((t, e) => t + e.before.length + e.lines.length + e.after.length, 0);
  if (x += t.beforeBody.length + t.afterBody.length, d && (f += d * l.lineHeight + (d - 1) * e.titleSpacing + e.titleMarginBottom), x) {
    f += g * (e.displayColors ? Math.max(r, h.lineHeight) : h.lineHeight) + (x - g) * h.lineHeight + (x - 1) * e.bodySpacing;
  }
  u && (f += e.footerMarginTop + u * c.lineHeight + (u - 1) * e.footerSpacing);
  let b = 0;
  const _ = function (t) {
    m = Math.max(m, i.measureText(t).width + b);
  };
  return i.save(), i.font = l.string, functionExecutor(t.title, _), i.font = h.string, functionExecutor(t.beforeBody.concat(t.afterBody), _), b = e.displayColors ? a + 2 + e.boxPadding : 0, functionExecutor(s, t => {
    functionExecutor(t.before, _), functionExecutor(t.lines, _), functionExecutor(t.after, _);
  }), b = 0, i.font = c.string, functionExecutor(t.footer, _), i.restore(), m += p.width, {
    width: m,
    height: f
  };
}
function determineVerticalAlignment(t, e) {
  const {
    y: i,
    height: s
  } = e;
  return i < s / 2 ? "top" : i > t.height - s / 2 ? "bottom" : "center";
}
function isCaretWithinVisibleBounds(t, e, i, s) {
  const {
      x: n,
      width: o
    } = s,
    a = i.caretSize + i.caretPadding;
  return "left" === t && n + o + a > e.width || "right" === t && n - o - a < 0 || void 0;
}
function determineHorizontalAlignment(t, e, i, s) {
  const {
      x: n,
      width: o
    } = i,
    {
      width: a,
      chartArea: {
        left: r,
        right: h
      }
    } = t;
  let l = "center";
  return "center" === s ? l = n <= (r + h) / 2 ? "left" : "right" : n <= o / 2 ? l = "left" : n >= a - o / 2 && (l = "right"), isCaretWithinVisibleBounds(l, t, e, i) && (l = "center"), l;
}
function alignmentCoordinates(t, e, i) {
  const s = i.yAlign || e.yAlign || determineVerticalAlignment(t, i);
  return {
    xAlign: i.xAlign || e.xAlign || determineHorizontalAlignment(t, e, i, s),
    yAlign: s
  };
}
function calculateAdjustedXPosition(t, e) {
  let {
    x: i,
    width: s
  } = t;
  return "right" === e ? i -= s : "center" === e && (i -= s / 2), i;
}
function computeVerticalAlignment(t, e, i) {
  let {
    y: s,
    height: n
  } = t;
  return "top" === e ? s += i : s -= "bottom" === e ? n + i : n / 2, s;
}
function calculateCaretCoordinates(t, e, i, s) {
  const {
      caretSize: n,
      caretPadding: o,
      cornerRadius: a
    } = t,
    {
      xAlign: r,
      yAlign: h
    } = i,
    l = n + o,
    {
      topLeft: c,
      topRight: d,
      bottomLeft: u,
      bottomRight: g
    } = colorUtility(a);
  let p = calculateAdjustedXPosition(e, r);
  const f = computeVerticalAlignment(e, h, l);
  return "center" === h ? "left" === r ? p += l : "right" === r && (p -= l) : "left" === r ? p -= Math.max(c, u) + n : "right" === r && (p += Math.max(d, g) + n), {
    x: userInputValue(p, 0, s.width - e.width),
    y: userInputValue(f, 0, s.height - e.height)
  };
}
function calculateHorizontalOffset(t, e, i) {
  const s = __responseHandler(i.padding);
  return "center" === e ? t.x + t.width / 2 : "right" === e ? t.x + t.width - s.right : t.x + s.left;
}
function extractTooltipItems(t) {
  return addElementsToArray([], splitStringIntoLines(t));
}
function _renderTooltip(t, e, i) {
  return renderComponent(t, {
    tooltip: e,
    tooltipItems: i,
    type: "tooltip"
  });
}
function updateTooltipCallbacks(t, e) {
  const i = e && e.dataset && e.dataset.tooltip && e.dataset.tooltip.callbacks;
  return i ? t.override(i) : t;
}
const tooltipEventHandlers = {
  beforeTitle: _colorHelperUtility,
  title(t) {
    if (t.length > 0) {
      const e = t[0],
        i = e.chart.data.labels,
        s = i ? i.length : 0;
      if (this && this.options && "dataset" === this.options.mode) return e.dataset.label || "";
      if (e.label) return e.label;
      if (s > 0 && e.dataIndex < s) return i[e.dataIndex];
    }
    return "";
  },
  afterTitle: _colorHelperUtility,
  beforeBody: _colorHelperUtility,
  beforeLabel: _colorHelperUtility,
  label(t) {
    if (this && this.options && "dataset" === this.options.mode) return t.label + ": " + t.formattedValue || t.formattedValue;
    let e = t.dataset.label || "";
    e && (e += ": ");
    const i = t.formattedValue;
    return calculateComponentKey(i) || (e += i), e;
  },
  labelColor(t) {
    const e = t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);
    return {
      borderColor: e.borderColor,
      backgroundColor: e.backgroundColor,
      borderWidth: e.borderWidth,
      borderDash: e.borderDash,
      borderDashOffset: e.borderDashOffset,
      borderRadius: 0
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(t) {
    const e = t.chart.getDatasetMeta(t.datasetIndex).controller.getStyle(t.dataIndex);
    return {
      pointStyle: e.pointStyle,
      rotation: e.rotation
    };
  },
  afterLabel: _colorHelperUtility,
  afterBody: _colorHelperUtility,
  beforeFooter: _colorHelperUtility,
  footer: _colorHelperUtility,
  afterFooter: _colorHelperUtility
};
function executeWithFallback(t, e, i, s) {
  const n = t[e].call(i, s);
  return void 0 === n ? tooltipEventHandlers[e].call(i, s) : n;
}
class ____ChartElement extends CanvasAnimationManager {
  static positioners = tooltipPositionCalculator;
  constructor(t) {
    super(), this.opacity = 0, this._active = [], this._eventPosition = void 0, this._size = void 0, this._cachedAnimations = void 0, this._tooltipItems = [], this.$animations = void 0, this.$context = void 0, this.chart = t.chart, this.options = t.options, this.dataPoints = void 0, this.title = void 0, this.beforeBody = void 0, this.body = void 0, this.afterBody = void 0, this.footer = void 0, this.xAlign = void 0, this.yAlign = void 0, this.x = void 0, this.y = void 0, this.height = void 0, this.width = void 0, this.caretX = void 0, this.caretY = void 0, this.labelColors = void 0, this.labelPointStyles = void 0, this.labelTextColors = void 0;
  }
  initialize(t) {
    this.options = t, this._cachedAnimations = void 0, this.$context = void 0;
  }
  _resolveAnimations() {
    const t = this._cachedAnimations;
    if (t) return t;
    const e = this.chart,
      i = this.options.setContext(this.getContext()),
      s = i.enabled && e.options.animation && i.animations,
      n = new AnimationManager(this.chart, s);
    return s._cacheable && (this._cachedAnimations = Object.freeze(n)), n;
  }
  getContext() {
    return this.$context || (this.$context = _renderTooltip(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(t, e) {
    const {
        callbacks: i
      } = e,
      s = executeWithFallback(i, "beforeTitle", this, t),
      n = executeWithFallback(i, "title", this, t),
      o = executeWithFallback(i, "afterTitle", this, t);
    let a = [];
    return a = addElementsToArray(a, splitStringIntoLines(s)), a = addElementsToArray(a, splitStringIntoLines(n)), a = addElementsToArray(a, splitStringIntoLines(o)), a;
  }
  getBeforeBody(t, e) {
    return extractTooltipItems(executeWithFallback(e.callbacks, "beforeBody", this, t));
  }
  getBody(t, e) {
    const {
        callbacks: i
      } = e,
      s = [];
    return functionExecutor(t, t => {
      const e = {
          before: [],
          lines: [],
          after: []
        },
        n = updateTooltipCallbacks(i, t);
      addElementsToArray(e.before, splitStringIntoLines(executeWithFallback(n, "beforeLabel", this, t))), addElementsToArray(e.lines, executeWithFallback(n, "label", this, t)), addElementsToArray(e.after, splitStringIntoLines(executeWithFallback(n, "afterLabel", this, t))), s.push(e);
    }), s;
  }
  getAfterBody(t, e) {
    return extractTooltipItems(executeWithFallback(e.callbacks, "afterBody", this, t));
  }
  getFooter(t, e) {
    const {
        callbacks: i
      } = e,
      s = executeWithFallback(i, "beforeFooter", this, t),
      n = executeWithFallback(i, "footer", this, t),
      o = executeWithFallback(i, "afterFooter", this, t);
    let a = [];
    return a = addElementsToArray(a, splitStringIntoLines(s)), a = addElementsToArray(a, splitStringIntoLines(n)), a = addElementsToArray(a, splitStringIntoLines(o)), a;
  }
  _createItems(t) {
    const e = this._active,
      i = this.chart.data,
      s = [],
      n = [],
      o = [];
    let a,
      r,
      h = [];
    for (a = 0, r = e.length; a < r; ++a) h.push(getDatasetLabelDetails(this.chart, e[a]));
    return t.filter && (h = h.filter((e, s, n) => t.filter(e, s, n, i))), t.itemSort && (h = h.sort((e, s) => t.itemSort(e, s, i))), functionExecutor(h, e => {
      const i = updateTooltipCallbacks(t.callbacks, e);
      s.push(executeWithFallback(i, "labelColor", this, e)), n.push(executeWithFallback(i, "labelPointStyle", this, e)), o.push(executeWithFallback(i, "labelTextColor", this, e));
    }), this.labelColors = s, this.labelPointStyles = n, this.labelTextColors = o, this.dataPoints = h, h;
  }
  update(t, e) {
    const i = this.options.setContext(this.getContext()),
      s = this._active;
    let n,
      o = [];
    if (s.length) {
      const t = tooltipPositionCalculator[i.position].call(this, s, this._eventPosition);
      o = this._createItems(i), this.title = this.getTitle(o, i), this.beforeBody = this.getBeforeBody(o, i), this.body = this.getBody(o, i), this.afterBody = this.getAfterBody(o, i), this.footer = this.getFooter(o, i);
      const e = this._size = renderTooltipContent(this, i),
        a = Object.assign({}, t, e),
        r = alignmentCoordinates(this.chart, i, a),
        h = calculateCaretCoordinates(i, a, r, this.chart);
      this.xAlign = r.xAlign, this.yAlign = r.yAlign, n = {
        opacity: 1,
        x: h.x,
        y: h.y,
        width: e.width,
        height: e.height,
        caretX: t.x,
        caretY: t.y
      };
    } else 0 !== this.opacity && (n = {
      opacity: 0
    });
    this._tooltipItems = o, this.$context = void 0, n && this._resolveAnimations().update(this, n), t && i.external && i.external.call(this, {
      chart: this.chart,
      tooltip: this,
      replay: e
    });
  }
  drawCaret(t, e, i, s) {
    const n = this.getCaretPosition(t, i, s);
    e.lineTo(n.x1, n.y1), e.lineTo(n.x2, n.y2), e.lineTo(n.x3, n.y3);
  }
  getCaretPosition(t, e, i) {
    const {
        xAlign: s,
        yAlign: n
      } = this,
      {
        caretSize: o,
        cornerRadius: a
      } = i,
      {
        topLeft: r,
        topRight: h,
        bottomLeft: l,
        bottomRight: c
      } = colorUtility(a),
      {
        x: d,
        y: u
      } = t,
      {
        width: g,
        height: p
      } = e;
    let f, m, x, b, _, y;
    return "center" === n ? (_ = u + p / 2, "left" === s ? (f = d, m = f - o, b = _ + o, y = _ - o) : (f = d + g, m = f + o, b = _ - o, y = _ + o), x = f) : (m = "left" === s ? d + Math.max(r, l) + o : "right" === s ? d + g - Math.max(h, c) - o : this.caretX, "top" === n ? (b = u, _ = b - o, f = m - o, x = m + o) : (b = u + p, _ = b + o, f = m + o, x = m - o), y = b), {
      x1: f,
      x2: m,
      x3: x,
      y1: b,
      y2: _,
      y3: y
    };
  }
  drawTitle(t, e, i) {
    const s = this.title,
      n = s.length;
    let o, a, r;
    if (n) {
      const h = colorDataArray(i.rtl, this.x, this.width);
      for (t.x = calculateHorizontalOffset(this, i.titleAlign, i), e.textAlign = h.textAlign(i.titleAlign), e.textBaseline = "middle", o = _userInputValue(i.titleFont), a = i.titleSpacing, e.fillStyle = i.titleColor, e.font = o.string, r = 0; r < n; ++r) e.fillText(s[r], h.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + a, r + 1 === n && (t.y += i.titleMarginBottom - a);
    }
  }
  _drawColorBox(t, e, i, s, o) {
    const a = this.labelColors[i],
      r = this.labelPointStyles[i],
      {
        boxHeight: h,
        boxWidth: l
      } = o,
      c = _userInputValue(o.bodyFont),
      d = calculateHorizontalOffset(this, "left", o),
      u = s.x(d),
      g = h < c.lineHeight ? (c.lineHeight - h) / 2 : 0,
      p = e.y + g;
    if (o.usePointStyle) {
      const e = {
          radius: Math.min(l, h) / 2,
          pointStyle: r.pointStyle,
          rotation: r.rotation,
          borderWidth: 1
        },
        i = s.leftForLtr(u, l) + l / 2,
        n = p + h / 2;
      t.strokeStyle = o.multiKeyBackground, t.fillStyle = o.multiKeyBackground, _animationDuration(t, e, i, n), t.strokeStyle = a.borderColor, t.fillStyle = a.backgroundColor, _animationDuration(t, e, i, n);
    } else {
      t.lineWidth = dataIndex(a.borderWidth) ? Math.max(...Object.values(a.borderWidth)) : a.borderWidth || 1, t.strokeStyle = a.borderColor, t.setLineDash(a.borderDash || []), t.lineDashOffset = a.borderDashOffset || 0;
      const e = s.leftForLtr(u, l),
        i = s.leftForLtr(s.xPlus(u, 1), l - 2),
        r = colorUtility(a.borderRadius);
      Object.values(r).some(t => 0 !== t) ? (t.beginPath(), t.fillStyle = o.multiKeyBackground, lightnessAdjustment(t, {
        x: e,
        y: p,
        w: l,
        h: h,
        radius: r
      }), t.fill(), t.stroke(), t.fillStyle = a.backgroundColor, t.beginPath(), lightnessAdjustment(t, {
        x: i,
        y: p + 1,
        w: l - 2,
        h: h - 2,
        radius: r
      }), t.fill()) : (t.fillStyle = o.multiKeyBackground, t.fillRect(e, p, l, h), t.strokeRect(e, p, l, h), t.fillStyle = a.backgroundColor, t.fillRect(i, p + 1, l - 2, h - 2));
    }
    t.fillStyle = this.labelTextColors[i];
  }
  drawBody(t, e, i) {
    const {
        body: s
      } = this,
      {
        bodySpacing: n,
        bodyAlign: o,
        displayColors: a,
        boxHeight: r,
        boxWidth: h,
        boxPadding: l
      } = i,
      c = _userInputValue(i.bodyFont);
    let d = c.lineHeight,
      u = 0;
    const g = colorDataArray(i.rtl, this.x, this.width),
      p = function (i) {
        e.fillText(i, g.x(t.x + u), t.y + d / 2), t.y += d + n;
      },
      f = g.textAlign(o);
    let m, x, b, _, y, v, M;
    for (e.textAlign = o, e.textBaseline = "middle", e.font = c.string, t.x = calculateHorizontalOffset(this, f, i), e.fillStyle = i.bodyColor, functionExecutor(this.beforeBody, p), u = a && "right" !== f ? "center" === o ? h / 2 + l : h + 2 + l : 0, _ = 0, v = s.length; _ < v; ++_) {
      for (m = s[_], x = this.labelTextColors[_], e.fillStyle = x, functionExecutor(m.before, p), b = m.lines, a && b.length && (this._drawColorBox(e, t, _, g, i), d = Math.max(c.lineHeight, r)), y = 0, M = b.length; y < M; ++y) p(b[y]), d = c.lineHeight;
      functionExecutor(m.after, p);
    }
    u = 0, d = c.lineHeight, functionExecutor(this.afterBody, p), t.y -= n;
  }
  drawFooter(t, e, i) {
    const s = this.footer,
      n = s.length;
    let o, a;
    if (n) {
      const r = colorDataArray(i.rtl, this.x, this.width);
      for (t.x = calculateHorizontalOffset(this, i.footerAlign, i), t.y += i.footerMarginTop, e.textAlign = r.textAlign(i.footerAlign), e.textBaseline = "middle", o = _userInputValue(i.footerFont), e.fillStyle = i.footerColor, e.font = o.string, a = 0; a < n; ++a) e.fillText(s[a], r.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + i.footerSpacing;
    }
  }
  drawBackground(t, e, i, s) {
    const {
        xAlign: n,
        yAlign: o
      } = this,
      {
        x: a,
        y: r
      } = t,
      {
        width: h,
        height: l
      } = i,
      {
        topLeft: c,
        topRight: d,
        bottomLeft: u,
        bottomRight: g
      } = colorUtility(s.cornerRadius);
    e.fillStyle = s.backgroundColor, e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.beginPath(), e.moveTo(a + c, r), "top" === o && this.drawCaret(t, e, i, s), e.lineTo(a + h - d, r), e.quadraticCurveTo(a + h, r, a + h, r + d), "center" === o && "right" === n && this.drawCaret(t, e, i, s), e.lineTo(a + h, r + l - g), e.quadraticCurveTo(a + h, r + l, a + h - g, r + l), "bottom" === o && this.drawCaret(t, e, i, s), e.lineTo(a + u, r + l), e.quadraticCurveTo(a, r + l, a, r + l - u), "center" === o && "left" === n && this.drawCaret(t, e, i, s), e.lineTo(a, r + c), e.quadraticCurveTo(a, r, a + c, r), e.closePath(), e.fill(), s.borderWidth > 0 && e.stroke();
  }
  _updateAnimationTarget(t) {
    const e = this.chart,
      i = this.$animations,
      s = i && i.x,
      n = i && i.y;
    if (s || n) {
      const i = tooltipPositionCalculator[t.position].call(this, this._active, this._eventPosition);
      if (!i) return;
      const o = this._size = renderTooltipContent(this, t),
        a = Object.assign({}, i, this._size),
        r = alignmentCoordinates(e, t, a),
        h = calculateCaretCoordinates(t, a, r, e);
      s._to === h.x && n._to === h.y || (this.xAlign = r.xAlign, this.yAlign = r.yAlign, this.width = o.width, this.height = o.height, this.caretX = i.x, this.caretY = i.y, this._resolveAnimations().update(this, h));
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(t) {
    const e = this.options.setContext(this.getContext());
    let i = this.opacity;
    if (!i) return;
    this._updateAnimationTarget(e);
    const s = {
        width: this.width,
        height: this.height
      },
      n = {
        x: this.x,
        y: this.y
      };
    i = Math.abs(i) < .001 ? 0 : i;
    const o = __responseHandler(e.padding),
      a = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    e.enabled && a && (t.save(), t.globalAlpha = i, this.drawBackground(n, t, s, e), colorHelperUtility(t, e.textDirection), n.y += o.top, this.drawTitle(n, t, e), this.drawBody(n, t, e), this.drawFooter(n, t, e), chartDataset(t, e.textDirection), t.restore());
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t, e) {
    const i = this._active,
      s = t.map(({
        datasetIndex: t,
        index: e
      }) => {
        const i = this.chart.getDatasetMeta(t);
        if (!i) throw new Error("Cannot find a dataset at index " + t);
        return {
          datasetIndex: t,
          element: i.data[e],
          index: e
        };
      }),
      n = !currentUserValue(i, s),
      o = this._positionChanged(s, e);
    (n || o) && (this._active = s, this._eventPosition = e, this._ignoreReplayEvents = !0, this.update(!0));
  }
  handleEvent(t, e, i = !0) {
    if (e && this._ignoreReplayEvents) return !1;
    this._ignoreReplayEvents = !1;
    const s = this.options,
      n = this._active || [],
      o = this._getActiveElements(t, n, e, i),
      a = this._positionChanged(o, t),
      r = e || !currentUserValue(o, n) || a;
    return r && (this._active = o, (s.enabled || s.external) && (this._eventPosition = {
      x: t.x,
      y: t.y
    }, this.update(!0, e))), r;
  }
  _getActiveElements(t, e, i, s) {
    const n = this.options;
    if ("mouseout" === t.type) return [];
    if (!s) return e;
    const o = this.chart.getElementsAtEventForMode(t, n.mode, n, i);
    return n.reverse && o.reverse(), o;
  }
  _positionChanged(t, e) {
    const {
        caretX: i,
        caretY: s,
        options: n
      } = this,
      o = tooltipPositionCalculator[n.position].call(this, t, e);
    return !1 !== o && (i !== o.x || s !== o.y);
  }
}
var tooltipManager = {
    id: "tooltip",
    _element: ____ChartElement,
    positioners: tooltipPositionCalculator,
    afterInit(t, e, i) {
      i && (t.tooltip = new ____ChartElement({
        chart: t,
        options: i
      }));
    },
    beforeUpdate(t, e, i) {
      t.tooltip && t.tooltip.initialize(i);
    },
    reset(t, e, i) {
      t.tooltip && t.tooltip.initialize(i);
    },
    afterDraw(t) {
      const e = t.tooltip;
      if (e && e._willRender()) {
        const i = {
          tooltip: e
        };
        if (!1 === t.notifyPlugins("beforeTooltipDraw", {
          ...i,
          cancelable: !0
        })) return;
        e.draw(t.ctx), t.notifyPlugins("afterTooltipDraw", i);
      }
    },
    afterEvent(t, e) {
      if (t.tooltip) {
        const i = e.replay;
        t.tooltip.handleEvent(e.event, i, e.inChartArea) && (e.changed = !0);
      }
    },
    defaults: {
      enabled: !0,
      external: null,
      position: "average",
      backgroundColor: "rgba(0,0,0,0.8)",
      titleColor: "#fff",
      titleFont: {
        weight: "bold"
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
        weight: "bold"
      },
      footerAlign: "left",
      padding: 6,
      caretPadding: 2,
      caretSize: 5,
      cornerRadius: 6,
      boxHeight: (t, e) => e.bodyFont.size,
      boxWidth: (t, e) => e.bodyFont.size,
      multiKeyBackground: "#fff",
      displayColors: !0,
      boxPadding: 0,
      borderColor: "rgba(0,0,0,0)",
      borderWidth: 0,
      animation: {
        duration: 400,
        easing: "easeOutQuart"
      },
      animations: {
        numbers: {
          type: "number",
          properties: ["x", "y", "width", "height", "caretX", "caretY"]
        },
        opacity: {
          easing: "linear",
          duration: 200
        }
      },
      callbacks: tooltipEventHandlers
    },
    defaultRoutes: {
      bodyFont: "font",
      footerFont: "font",
      titleFont: "font"
    },
    descriptors: {
      _scriptable: t => "filter" !== t && "itemSort" !== t && "external" !== t,
      _indexable: !1,
      callbacks: {
        _scriptable: !1,
        _indexable: !1
      },
      animation: {
        _fallback: !1
      },
      animations: {
        _fallback: "animation"
      }
    },
    additionalOptionScopes: ["interaction"]
  },
  chartConfiguration = Object.freeze({
    __proto__: null,
    Colors: colorSettings,
    Decimation: decimationSettings,
    Filler: fillerPluginManager,
    Legend: legendControllerInstance,
    SubTitle: subtitleManager,
    Title: titlePluginManager,
    Tooltip: tooltipManager
  });
const addToArrayOrGetIndex = (t, e, i, s) => ("string" == typeof e ? (i = t.push(e) - 1, s.unshift({
  index: i,
  label: e
})) : isNaN(e) && (i = null), i);
function findIndexOrInsert(t, e, i, s) {
  const n = t.indexOf(e);
  if (-1 === n) return addToArrayOrGetIndex(t, e, i, s);
  return n !== t.lastIndexOf(e) ? i : n;
}
const clampValueToRange = (t, e) => null === t ? null : userInputValue(Math.round(t), 0, e);
function getLabelForIndex(t) {
  const e = this.getLabels();
  return t >= 0 && t < e.length ? e[t] : t;
}
class CategoryScaleManager extends ___ChartElement {
  static id = "category";
  static defaults = {
    ticks: {
      callback: getLabelForIndex
    }
  };
  constructor(t) {
    super(t), this._startValue = void 0, this._valueRange = 0, this._addedLabels = [];
  }
  init(t) {
    const e = this._addedLabels;
    if (e.length) {
      const t = this.getLabels();
      for (const {
        index: i,
        label: s
      } of e) t[i] === s && t.splice(i, 1);
      this._addedLabels = [];
    }
    super.init(t);
  }
  parse(t, e) {
    if (calculateComponentKey(t)) return null;
    const i = this.getLabels();
    return e = isFinite(e) && i[e] === t ? e : findIndexOrInsert(i, t, responseHandlerFunction(e, t), this._addedLabels), clampValueToRange(e, i.length - 1);
  }
  determineDataLimits() {
    const {
      minDefined: t,
      maxDefined: e
    } = this.getUserBounds();
    let {
      min: i,
      max: s
    } = this.getMinMax(!0);
    "ticks" === this.options.bounds && (t || (i = 0), e || (s = this.getLabels().length - 1)), this.min = i, this.max = s;
  }
  buildTicks() {
    const t = this.min,
      e = this.max,
      i = this.options.offset,
      s = [];
    let n = this.getLabels();
    n = 0 === t && e === n.length - 1 ? n : n.slice(t, e + 1), this._valueRange = Math.max(n.length - (i ? 0 : 1), 1), this._startValue = this.min - (i ? .5 : 0);
    for (let i = t; i <= e; i++) s.push({
      value: i
    });
    return s;
  }
  getLabelForValue(t) {
    return getLabelForIndex.call(this, t);
  }
  configure() {
    super.configure(), this.isHorizontal() || (this._reversePixels = !this._reversePixels);
  }
  getPixelForValue(t) {
    return "number" != typeof t && (t = this.parse(t)), null === t ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getValueForPixel(t) {
    return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
}
function createTickMarks(t, e) {
  const i = [],
    {
      bounds: s,
      step: n,
      min: o,
      max: a,
      precision: r,
      count: h,
      maxTicks: l,
      maxDigits: c,
      includeBounds: d
    } = t,
    u = n || 1,
    g = l - 1,
    {
      min: p,
      max: m
    } = e,
    x = !calculateComponentKey(o),
    b = !calculateComponentKey(a),
    _ = !calculateComponentKey(h),
    y = (m - p) / (c + 1);
  let v,
    M,
    w,
    k,
    S = notificationListener((m - p) / g / u) * u;
  if (S < 1e-14 && !x && !b) return [{
    value: p
  }, {
    value: m
  }];
  k = Math.ceil(m / S) - Math.floor(p / S), k > g && (S = notificationListener(k * S / g / u) * u), calculateComponentKey(r) || (v = Math.pow(10, r), S = Math.ceil(S * v) / v), "ticks" === s ? (M = Math.floor(p / S) * S, w = Math.ceil(m / S) * S) : (M = p, w = m), x && b && n && ___colorUtility((a - o) / n, S / 1e3) ? (k = Math.round(Math.min((a - o) / S, l)), S = (a - o) / k, M = o, w = a) : _ ? (M = x ? o : M, w = b ? a : w, k = h - 1, S = (w - M) / k) : (k = (w - M) / S, k = chartController(k, Math.round(k), S / 1e3) ? Math.round(k) : Math.ceil(k));
  const D = Math.max(chartColorPalette(S), chartColorPalette(M));
  v = Math.pow(10, calculateComponentKey(r) ? D : r), M = Math.round(M * v) / v, w = Math.round(w * v) / v;
  let P = 0;
  for (x && (d && M !== o ? (i.push({
    value: o
  }), M < o && P++, chartController(Math.round((M + P * S) * v) / v, o, calculateAdjustedValueForRotation(o, y, t)) && P++) : M < o && P++); P < k; ++P) {
    const t = Math.round((M + P * S) * v) / v;
    if (b && t > a) break;
    i.push({
      value: t
    });
  }
  return b && d && w !== a ? i.length && chartController(i[i.length - 1].value, a, calculateAdjustedValueForRotation(a, y, t)) ? i[i.length - 1].value = a : i.push({
    value: a
  }) : b && w !== a || i.push({
    value: w
  }), i;
}
function calculateAdjustedValueForRotation(t, e, {
  horizontal: i,
  minRotation: s
}) {
  const n = dataTransformationFunction(s),
    o = (i ? Math.sin(n) : Math.cos(n)) || .001,
    a = .75 * e * ("" + t).length;
  return Math.min(e / o, a);
}
class ValueRangeManager extends ___ChartElement {
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._endValue = void 0, this._valueRange = 0;
  }
  parse(t, e) {
    return calculateComponentKey(t) || ("number" == typeof t || t instanceof Number) && !isFinite(+t) ? null : +t;
  }
  handleTickRangeOptions() {
    const {
        beginAtZero: t
      } = this.options,
      {
        minDefined: e,
        maxDefined: i
      } = this.getUserBounds();
    let {
      min: s,
      max: n
    } = this;
    const o = t => s = e ? s : t,
      a = t => n = i ? n : t;
    if (t) {
      const t = _eventDispatcher(s),
        e = _eventDispatcher(n);
      t < 0 && e < 0 ? a(0) : t > 0 && e > 0 && o(0);
    }
    if (s === n) {
      let e = 0 === n ? 1 : Math.abs(.05 * n);
      a(n + e), t || o(s - e);
    }
    this.min = s, this.max = n;
  }
  getTickLimit() {
    const t = this.options.ticks;
    let e,
      {
        maxTicksLimit: i,
        stepSize: s
      } = t;
    return s ? (e = Math.ceil(this.max / s) - Math.floor(this.min / s) + 1, e > 1e3 && (console.warn(`scales.${this.id}.ticks.stepSize: ${s} would result generating up to ${e} ticks. Limiting to 1000.`), e = 1e3)) : (e = this.computeTickLimit(), i = i || 11), i && (e = Math.min(i, e)), e;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const t = this.options,
      e = t.ticks;
    let i = this.getTickLimit();
    i = Math.max(2, i);
    const s = createTickMarks({
      maxTicks: i,
      bounds: t.bounds,
      min: t.min,
      max: t.max,
      precision: e.precision,
      step: e.stepSize,
      count: e.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: e.minRotation || 0,
      includeBounds: !1 !== e.includeBounds
    }, this._range || this);
    return "ticks" === t.bounds && __colorUtility(s, this, "value"), t.reverse ? (s.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), s;
  }
  configure() {
    const t = this.ticks;
    let e = this.min,
      i = this.max;
    if (super.configure(), this.options.offset && t.length) {
      const s = (i - e) / Math.max(t.length - 1, 1) / 2;
      e -= s, i += s;
    }
    this._startValue = e, this._endValue = i, this._valueRange = i - e;
  }
  getLabelForValue(t) {
    return calculatedValue(t, this.chart.options.locale, this.options.ticks.format);
  }
}
class LinearScaleHandler extends ValueRangeManager {
  static id = "linear";
  static defaults = {
    ticks: {
      callback: chartManagerInstance.formatters.numeric
    }
  };
  determineDataLimits() {
    const {
      min: t,
      max: e
    } = this.getMinMax(!0);
    this.min = __dataProcessor(t) ? t : 0, this.max = __dataProcessor(e) ? e : 1, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const t = this.isHorizontal(),
      e = t ? this.width : this.height,
      i = dataTransformationFunction(this.options.ticks.minRotation),
      s = (t ? Math.sin(i) : Math.cos(i)) || .001,
      n = this._resolveTickFontOptions(0);
    return Math.ceil(e / Math.min(40, n.lineHeight / s));
  }
  getPixelForValue(t) {
    return null === t ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
  }
}
const log10Floor = t => Math.floor(_chartManagerInstance(t)),
  calculateExponentForBaseTen = (t, e) => Math.pow(10, log10Floor(t) + e);
function isPowerOfTen(t) {
  return 1 === t / Math.pow(10, log10Floor(t));
}
function computeDecimalOffset(t, e, i) {
  const s = Math.pow(10, i),
    n = Math.floor(t / s);
  return Math.ceil(e / s) - n;
}
function adjustExponentForScaling(t, e) {
  let i = log10Floor(e - t);
  for (; computeDecimalOffset(t, e, i) > 10;) i++;
  for (; computeDecimalOffset(t, e, i) < 10;) i--;
  return Math.min(i, log10Floor(t));
}
function scaleValueToRange(t, {
  min: e,
  max: i
}) {
  e = dataParameter(t.min, e);
  const s = [],
    n = log10Floor(e);
  let o = adjustExponentForScaling(e, i),
    a = o < 0 ? Math.pow(10, Math.abs(o)) : 1;
  const r = Math.pow(10, o),
    h = n > o ? Math.pow(10, n) : 0,
    l = Math.round((e - h) * a) / a,
    c = Math.floor((e - h) / r / 10) * r * 10;
  let d = Math.floor((l - c) / Math.pow(10, o)),
    u = dataParameter(t.min, Math.round((h + c + d * Math.pow(10, o)) * a) / a);
  for (; u < i;) s.push({
    value: u,
    major: isPowerOfTen(u),
    significand: d
  }), d >= 10 ? d = d < 15 ? 15 : 20 : d++, d >= 20 && (o++, d = 2, a = o >= 0 ? 1 : a), u = Math.round((h + c + d * Math.pow(10, o)) * a) / a;
  const g = dataParameter(t.max, u);
  return s.push({
    value: g,
    major: isPowerOfTen(g),
    significand: d
  }), s;
}
class LogarithmicScaleChart extends ___ChartElement {
  static id = "logarithmic";
  static defaults = {
    ticks: {
      callback: chartManagerInstance.formatters.logarithmic,
      major: {
        enabled: !0
      }
    }
  };
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._valueRange = 0;
  }
  parse(t, e) {
    const i = ValueRangeManager.prototype.parse.apply(this, [t, e]);
    if (0 !== i) return __dataProcessor(i) && i > 0 ? i : null;
    this._zero = !0;
  }
  determineDataLimits() {
    const {
      min: t,
      max: e
    } = this.getMinMax(!0);
    this.min = __dataProcessor(t) ? Math.max(0, t) : null, this.max = __dataProcessor(e) ? Math.max(0, e) : null, this.options.beginAtZero && (this._zero = !0), this._zero && this.min !== this._suggestedMin && !__dataProcessor(this._userMin) && (this.min = t === calculateExponentForBaseTen(this.min, 0) ? calculateExponentForBaseTen(this.min, -1) : calculateExponentForBaseTen(this.min, 0)), this.handleTickRangeOptions();
  }
  handleTickRangeOptions() {
    const {
      minDefined: t,
      maxDefined: e
    } = this.getUserBounds();
    let i = this.min,
      s = this.max;
    const n = e => i = t ? i : e,
      o = t => s = e ? s : t;
    i === s && (i <= 0 ? (n(1), o(10)) : (n(calculateExponentForBaseTen(i, -1)), o(calculateExponentForBaseTen(s, 1)))), i <= 0 && n(calculateExponentForBaseTen(s, -1)), s <= 0 && o(calculateExponentForBaseTen(i, 1)), this.min = i, this.max = s;
  }
  buildTicks() {
    const t = this.options,
      e = scaleValueToRange({
        min: this._userMin,
        max: this._userMax
      }, this);
    return "ticks" === t.bounds && __colorUtility(e, this, "value"), t.reverse ? (e.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), e;
  }
  getLabelForValue(t) {
    return void 0 === t ? "0" : calculatedValue(t, this.chart.options.locale, this.options.ticks.format);
  }
  configure() {
    const t = this.min;
    super.configure(), this._startValue = _chartManagerInstance(t), this._valueRange = _chartManagerInstance(this.max) - _chartManagerInstance(t);
  }
  getPixelForValue(t) {
    return void 0 !== t && 0 !== t || (t = this.min), null === t || isNaN(t) ? NaN : this.getPixelForDecimal(t === this.min ? 0 : (_chartManagerInstance(t) - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    const e = this.getDecimalForPixel(t);
    return Math.pow(10, this._startValue + e * this._valueRange);
  }
}
function calculateTickHeightInPixels(t) {
  const e = t.ticks;
  if (e.display && t.display) {
    const t = __responseHandler(e.backdropPadding);
    return responseHandlerFunction(e.font && e.font.size, _dataProcessor.font.size) + t.height;
  }
  return 0;
}
function textSize(t, e, i) {
  return i = elementReference(i) ? i : [i], {
    w: _chartDataset(t, e.string, i),
    h: i.length * e.lineHeight
  };
}
function calculateRangeBounds(t, e, i, s, n) {
  return t === s || t === n ? {
    start: e - i / 2,
    end: e + i / 2
  } : t < s || t > n ? {
    start: e - i,
    end: e
  } : {
    start: e,
    end: e + i
  };
}
function calculateLabelPositionBounds(t) {
  const e = {
      l: t.left + t._padding.left,
      r: t.right - t._padding.right,
      t: t.top + t._padding.top,
      b: t.bottom - t._padding.bottom
    },
    i = Object.assign({}, e),
    s = [],
    n = [],
    o = t._pointLabels.length,
    a = t.options.pointLabels,
    r = a.centerPointLabels ? __defaultExportModule / o : 0;
  for (let h = 0; h < o; h++) {
    const o = a.setContext(t.getPointLabelContext(h));
    n[h] = o.padding;
    const l = t.getPointPosition(h, t.drawingArea + n[h], r),
      c = _userInputValue(o.font),
      d = textSize(t.ctx, c, t._pointLabels[h]);
    s[h] = d;
    const u = userSessionRequestId(t.getIndexAngle(h) + r),
      g = Math.round(userSessionData(u));
    adjustLabelPosition(i, e, u, calculateRangeBounds(g, l.x, d.w, 0, 180), calculateRangeBounds(g, l.y, d.h, 90, 270));
  }
  t.setCenterPoint(e.l - i.l, i.r - e.r, e.t - i.t, i.b - e.b), t._pointLabelItems = generatePointLabels(t, s, n);
}
function adjustLabelPosition(t, e, i, s, n) {
  const o = Math.abs(Math.sin(i)),
    a = Math.abs(Math.cos(i));
  let r = 0,
    h = 0;
  s.start < e.l ? (r = (e.l - s.start) / o, t.l = Math.min(t.l, e.l - r)) : s.end > e.r && (r = (s.end - e.r) / o, t.r = Math.max(t.r, e.r + r)), n.start < e.t ? (h = (e.t - n.start) / a, t.t = Math.min(t.t, e.t - h)) : n.end > e.b && (h = (n.end - e.b) / a, t.b = Math.max(t.b, e.b + h));
}
function calculatePointPosition(t, e, i) {
  const s = t.drawingArea,
    {
      extra: n,
      additionalAngle: o,
      padding: a,
      size: r
    } = i,
    h = t.getPointPosition(e, s + n + a, o),
    l = Math.round(userSessionData(userSessionRequestId(h.angle + windowReference))),
    c = adjustedHorizontalPosition(h.y, r.h, l),
    d = __getHorizontalAlignment(l),
    u = adjustOffsetForAlignment(h.x, r.w, d);
  return {
    visible: !0,
    x: h.x,
    y: c,
    textAlign: d,
    left: u,
    top: c,
    right: u + r.w,
    bottom: c + r.h
  };
}
function isRectangleInViewport(t, e) {
  if (!e) return !0;
  const {
    left: i,
    top: s,
    right: n,
    bottom: o
  } = t;
  return !(___eventEmitter({
    x: i,
    y: s
  }, e) || ___eventEmitter({
    x: i,
    y: o
  }, e) || ___eventEmitter({
    x: n,
    y: s
  }, e) || ___eventEmitter({
    x: n,
    y: o
  }, e));
}
function generatePointLabels(t, e, i) {
  const s = [],
    n = t._pointLabels.length,
    o = t.options,
    {
      centerPointLabels: a,
      display: r
    } = o.pointLabels,
    h = {
      extra: calculateTickHeightInPixels(o) / 2,
      additionalAngle: a ? __defaultExportModule / n : 0
    };
  let l;
  for (let o = 0; o < n; o++) {
    h.padding = i[o], h.size = e[o];
    const n = calculatePointPosition(t, o, h);
    s.push(n), "auto" === r && (n.visible = isRectangleInViewport(n, l), n.visible && (l = n));
  }
  return s;
}
function __getHorizontalAlignment(t) {
  return 0 === t || 180 === t ? "center" : t < 180 ? "left" : "right";
}
function adjustOffsetForAlignment(t, e, i) {
  return "right" === i ? t -= e : "center" === i && (t -= e / 2), t;
}
function adjustedHorizontalPosition(t, e, i) {
  return 90 === i || 270 === i ? t -= e / 2 : (i > 270 || i < 90) && (t -= e), t;
}
function renderBackdrop(t, e, i) {
  const {
      left: s,
      top: n,
      right: o,
      bottom: a
    } = i,
    {
      backdropColor: r
    } = e;
  if (!calculateComponentKey(r)) {
    const i = colorUtility(e.borderRadius),
      h = __responseHandler(e.backdropPadding);
    t.fillStyle = r;
    const l = s - h.left,
      c = n - h.top,
      d = o - s + h.width,
      u = a - n + h.height;
    Object.values(i).some(t => 0 !== t) ? (t.beginPath(), lightnessAdjustment(t, {
      x: l,
      y: c,
      w: d,
      h: u,
      radius: i
    }), t.fill()) : t.fillRect(l, c, d, u);
  }
}
function renderPointLabelsToCanvas(t, e) {
  const {
    ctx: i,
    options: {
      pointLabels: s
    }
  } = t;
  for (let n = e - 1; n >= 0; n--) {
    const e = t._pointLabelItems[n];
    if (!e.visible) continue;
    const o = s.setContext(t.getPointLabelContext(n));
    renderBackdrop(i, o, e);
    const a = _userInputValue(o.font),
      {
        x: r,
        y: h,
        textAlign: l
      } = e;
    _____identifierMapping(i, t._pointLabels[n], r, h + a.lineHeight / 2, a, {
      color: o.color,
      textAlign: l,
      textBaseline: "middle"
    });
  }
}
function drawArcSegment(t, e, i, s) {
  const {
    ctx: n
  } = t;
  if (i) n.arc(t.xCenter, t.yCenter, e, 0, ComponentTypeIdentifier);else {
    let i = t.getPointPosition(0, e);
    n.moveTo(i.x, i.y);
    for (let o = 1; o < s; o++) i = t.getPointPosition(o, e), n.lineTo(i.x, i.y);
  }
}
function __drawCircularArc(t, e, i, s, n) {
  const o = t.ctx,
    a = e.circular,
    {
      color: r,
      lineWidth: h
    } = e;
  !a && !s || !r || !h || i < 0 || (o.save(), o.strokeStyle = r, o.lineWidth = h, o.setLineDash(n.dash), o.lineDashOffset = n.dashOffset, o.beginPath(), drawArcSegment(t, i, a, s), o.closePath(), o.stroke(), o.restore());
}
function renderPointLabel(t, e, i) {
  return renderComponent(t, {
    label: i,
    index: e,
    type: "pointLabel"
  });
}
class RadialLinearChartRenderer extends ValueRangeManager {
  static id = "radialLinear";
  static defaults = {
    display: !0,
    animate: !0,
    position: "chartArea",
    angleLines: {
      display: !0,
      lineWidth: 1,
      borderDash: [],
      borderDashOffset: 0
    },
    grid: {
      circular: !1
    },
    startAngle: 0,
    ticks: {
      showLabelBackdrop: !0,
      callback: chartManagerInstance.formatters.numeric
    },
    pointLabels: {
      backdropColor: void 0,
      backdropPadding: 2,
      display: !0,
      font: {
        size: 10
      },
      callback: t => t,
      padding: 5,
      centerPointLabels: !1
    }
  };
  static defaultRoutes = {
    "angleLines.color": "borderColor",
    "pointLabels.color": "color",
    "ticks.color": "color"
  };
  static descriptors = {
    angleLines: {
      _fallback: "grid"
    }
  };
  constructor(t) {
    super(t), this.xCenter = void 0, this.yCenter = void 0, this.drawingArea = void 0, this._pointLabels = [], this._pointLabelItems = [];
  }
  setDimensions() {
    const t = this._padding = __responseHandler(calculateTickHeightInPixels(this.options) / 2),
      e = this.width = this.maxWidth - t.width,
      i = this.height = this.maxHeight - t.height;
    this.xCenter = Math.floor(this.left + e / 2 + t.left), this.yCenter = Math.floor(this.top + i / 2 + t.top), this.drawingArea = Math.floor(Math.min(e, i) / 2);
  }
  determineDataLimits() {
    const {
      min: t,
      max: e
    } = this.getMinMax(!1);
    this.min = __dataProcessor(t) && !isNaN(t) ? t : 0, this.max = __dataProcessor(e) && !isNaN(e) ? e : 0, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / calculateTickHeightInPixels(this.options));
  }
  generateTickLabels(t) {
    ValueRangeManager.prototype.generateTickLabels.call(this, t), this._pointLabels = this.getLabels().map((t, e) => {
      const i = elementQuerySelector(this.options.pointLabels.callback, [t, e], this);
      return i || 0 === i ? i : "";
    }).filter((t, e) => this.chart.getDataVisibility(e));
  }
  fit() {
    const t = this.options;
    t.display && t.pointLabels.display ? calculateLabelPositionBounds(this) : this.setCenterPoint(0, 0, 0, 0);
  }
  setCenterPoint(t, e, i, s) {
    this.xCenter += Math.floor((t - e) / 2), this.yCenter += Math.floor((i - s) / 2), this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(t, e, i, s));
  }
  getIndexAngle(t) {
    const e = ComponentTypeIdentifier / (this._pointLabels.length || 1),
      i = this.options.startAngle || 0;
    return userSessionRequestId(t * e + dataTransformationFunction(i));
  }
  getDistanceFromCenterForValue(t) {
    if (calculateComponentKey(t)) return NaN;
    const e = this.drawingArea / (this.max - this.min);
    return this.options.reverse ? (this.max - t) * e : (t - this.min) * e;
  }
  getValueForDistanceFromCenter(t) {
    if (calculateComponentKey(t)) return NaN;
    const e = t / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - e : this.min + e;
  }
  getPointLabelContext(t) {
    const e = this._pointLabels || [];
    if (t >= 0 && t < e.length) {
      const i = e[t];
      return renderPointLabel(this.getContext(), t, i);
    }
  }
  getPointPosition(t, e, i = 0) {
    const s = this.getIndexAngle(t) - windowReference + i;
    return {
      x: Math.cos(s) * e + this.xCenter,
      y: Math.sin(s) * e + this.yCenter,
      angle: s
    };
  }
  getPointPositionForValue(t, e) {
    return this.getPointPosition(t, this.getDistanceFromCenterForValue(e));
  }
  getBasePosition(t) {
    return this.getPointPositionForValue(t || 0, this.getBaseValue());
  }
  getPointLabelPosition(t) {
    const {
      left: e,
      top: i,
      right: s,
      bottom: n
    } = this._pointLabelItems[t];
    return {
      left: e,
      top: i,
      right: s,
      bottom: n
    };
  }
  drawBackground() {
    const {
      backgroundColor: t,
      grid: {
        circular: e
      }
    } = this.options;
    if (t) {
      const i = this.ctx;
      i.save(), i.beginPath(), drawArcSegment(this, this.getDistanceFromCenterForValue(this._endValue), e, this._pointLabels.length), i.closePath(), i.fillStyle = t, i.fill(), i.restore();
    }
  }
  drawGrid() {
    const t = this.ctx,
      e = this.options,
      {
        angleLines: i,
        grid: s,
        border: n
      } = e,
      o = this._pointLabels.length;
    let a, r, h;
    if (e.pointLabels.display && renderPointLabelsToCanvas(this, o), s.display && this.ticks.forEach((t, e) => {
      if (0 !== e) {
        r = this.getDistanceFromCenterForValue(t.value);
        const i = this.getContext(e),
          a = s.setContext(i),
          h = n.setContext(i);
        __drawCircularArc(this, a, r, o, h);
      }
    }), i.display) {
      for (t.save(), a = o - 1; a >= 0; a--) {
        const s = i.setContext(this.getPointLabelContext(a)),
          {
            color: n,
            lineWidth: o
          } = s;
        o && n && (t.lineWidth = o, t.strokeStyle = n, t.setLineDash(s.borderDash), t.lineDashOffset = s.borderDashOffset, r = this.getDistanceFromCenterForValue(e.ticks.reverse ? this.min : this.max), h = this.getPointPosition(a, r), t.beginPath(), t.moveTo(this.xCenter, this.yCenter), t.lineTo(h.x, h.y), t.stroke());
      }
      t.restore();
    }
  }
  drawBorder() {}
  drawLabels() {
    const t = this.ctx,
      e = this.options,
      i = e.ticks;
    if (!i.display) return;
    const s = this.getIndexAngle(0);
    let n, o;
    t.save(), t.translate(this.xCenter, this.yCenter), t.rotate(s), t.textAlign = "center", t.textBaseline = "middle", this.ticks.forEach((s, a) => {
      if (0 === a && !e.reverse) return;
      const r = i.setContext(this.getContext(a)),
        h = _userInputValue(r.font);
      if (n = this.getDistanceFromCenterForValue(this.ticks[a].value), r.showLabelBackdrop) {
        t.font = h.string, o = t.measureText(s.label).width, t.fillStyle = r.backdropColor;
        const e = __responseHandler(r.backdropPadding);
        t.fillRect(-o / 2 - e.left, -n - h.size / 2 - e.top, o + e.width, h.size + e.height);
      }
      _____identifierMapping(t, s.label, 0, -n, h, {
        color: r.color,
        strokeColor: r.textStrokeColor,
        strokeWidth: r.textStrokeWidth
      });
    }), t.restore();
  }
  drawTitle() {}
}
const timeIntervals = {
    millisecond: {
      common: !0,
      size: 1,
      steps: 1e3
    },
    second: {
      common: !0,
      size: 1e3,
      steps: 60
    },
    minute: {
      common: !0,
      size: 6e4,
      steps: 60
    },
    hour: {
      common: !0,
      size: 36e5,
      steps: 24
    },
    day: {
      common: !0,
      size: 864e5,
      steps: 30
    },
    week: {
      common: !1,
      size: 6048e5,
      steps: 4
    },
    month: {
      common: !0,
      size: 2628e6,
      steps: 12
    },
    quarter: {
      common: !1,
      size: 7884e6,
      steps: 4
    },
    year: {
      common: !0,
      size: 3154e7
    }
  },
  timeUnitIdentifiers = Object.keys(timeIntervals);
function calculateDifference(t, e) {
  return t - e;
}
function parseDateString(t, e) {
  if (calculateComponentKey(e)) return null;
  const i = t._adapter,
    {
      parser: s,
      round: n,
      isoWeekday: o
    } = t._parseOpts;
  let a = e;
  return "function" == typeof s && (a = s(a)), __dataProcessor(a) || (a = "string" == typeof s ? i.parse(a, s) : i.parse(a)), null === a ? null : (n && (a = "week" !== n || !promiseExecutor(o) && !0 !== o ? i.startOf(a, n) : i.startOf(a, "isoWeek", o)), +a);
}
function getNearestTimeStep(t, e, i, s) {
  const n = timeUnitIdentifiers.length;
  for (let o = timeUnitIdentifiers.indexOf(t); o < n - 1; ++o) {
    const t = timeIntervals[timeUnitIdentifiers[o]],
      n = t.steps ? t.steps : Number.MAX_SAFE_INTEGER;
    if (t.common && Math.ceil((i - e) / (n * t.size)) <= s) return timeUnitIdentifiers[o];
  }
  return timeUnitIdentifiers[n - 1];
}
function findLastCommonTimeUnitIndex(t, e, i, s, n) {
  for (let o = timeUnitIdentifiers.length - 1; o >= timeUnitIdentifiers.indexOf(i); o--) {
    const i = timeUnitIdentifiers[o];
    if (timeIntervals[i].common && t._adapter.diff(n, s, i) >= e - 1) return i;
  }
  return timeUnitIdentifiers[i ? timeUnitIdentifiers.indexOf(i) : 0];
}
function getNextCommonTimeUnit(t) {
  for (let e = timeUnitIdentifiers.indexOf(t) + 1, i = timeUnitIdentifiers.length; e < i; ++e) if (timeIntervals[timeUnitIdentifiers[e]].common) return timeUnitIdentifiers[e];
}
function setValueInRange(t, e, i) {
  if (i) {
    if (i.length) {
      const {
        lo: s,
        hi: n
      } = chartEventListeners(i, e);
      t[i[s] >= e ? i[s] : i[n]] = !0;
    }
  } else t[e] = !0;
}
function markMajorEventsWithinRange(t, e, i, s) {
  const n = t._adapter,
    o = +n.startOf(e[0].value, s),
    a = e[e.length - 1].value;
  let r, h;
  for (r = o; r <= a; r = +n.add(r, 1, s)) h = i[r], h >= 0 && (e[h].major = !0);
  return e;
}
function generateTimeSeriesData(t, e, i) {
  const s = [],
    n = {},
    o = e.length;
  let a, r;
  for (a = 0; a < o; ++a) r = e[a], n[r] = a, s.push({
    value: r,
    major: !1
  });
  return 0 !== o && i ? markMajorEventsWithinRange(t, s, n, i) : s;
}
class TimeScaleManager extends ___ChartElement {
  static id = "time";
  static defaults = {
    bounds: "data",
    adapters: {},
    time: {
      parser: !1,
      unit: !1,
      round: !1,
      isoWeekday: !1,
      minUnit: "millisecond",
      displayFormats: {}
    },
    ticks: {
      source: "auto",
      callback: !1,
      major: {
        enabled: !1
      }
    }
  };
  constructor(t) {
    super(t), this._cache = {
      data: [],
      labels: [],
      all: []
    }, this._unit = "day", this._majorUnit = void 0, this._offsets = {}, this._normalized = !1, this._parseOpts = void 0;
  }
  init(t, e = {}) {
    const i = t.time || (t.time = {}),
      s = this._adapter = new DateManager._date(t.adapters.date);
    s.init(e), dataTypeIdentifier(i.displayFormats, s.formats()), this._parseOpts = {
      parser: i.parser,
      round: i.round,
      isoWeekday: i.isoWeekday
    }, super.init(t), this._normalized = e.normalized;
  }
  parse(t, e) {
    return void 0 === t ? null : parseDateString(this, t);
  }
  beforeLayout() {
    super.beforeLayout(), this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const t = this.options,
      e = this._adapter,
      i = t.time.unit || "day";
    let {
      min: s,
      max: n,
      minDefined: o,
      maxDefined: a
    } = this.getUserBounds();
    function r(t) {
      o || isNaN(t.min) || (s = Math.min(s, t.min)), a || isNaN(t.max) || (n = Math.max(n, t.max));
    }
    o && a || (r(this._getLabelBounds()), "ticks" === t.bounds && "labels" === t.ticks.source || r(this.getMinMax(!1))), s = __dataProcessor(s) && !isNaN(s) ? s : +e.startOf(Date.now(), i), n = __dataProcessor(n) && !isNaN(n) ? n : +e.endOf(Date.now(), i) + 1, this.min = Math.min(s, n - 1), this.max = Math.max(s + 1, n);
  }
  _getLabelBounds() {
    const t = this.getLabelTimestamps();
    let e = Number.POSITIVE_INFINITY,
      i = Number.NEGATIVE_INFINITY;
    return t.length && (e = t[0], i = t[t.length - 1]), {
      min: e,
      max: i
    };
  }
  buildTicks() {
    const t = this.options,
      e = t.time,
      i = t.ticks,
      s = "labels" === i.source ? this.getLabelTimestamps() : this._generate();
    "ticks" === t.bounds && s.length && (this.min = this._userMin || s[0], this.max = this._userMax || s[s.length - 1]);
    const n = this.min,
      o = this.max,
      a = chartRenderingContext(s, n, o);
    return this._unit = e.unit || (i.autoSkip ? getNearestTimeStep(e.minUnit, this.min, this.max, this._getLabelCapacity(n)) : findLastCommonTimeUnitIndex(this, a.length, e.minUnit, this.min, this.max)), this._majorUnit = i.major.enabled && "year" !== this._unit ? getNextCommonTimeUnit(this._unit) : void 0, this.initOffsets(s), t.reverse && a.reverse(), generateTimeSeriesData(this, a, this._majorUnit);
  }
  afterAutoSkip() {
    this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map(t => +t.value));
  }
  initOffsets(t = []) {
    let e,
      i,
      s = 0,
      n = 0;
    this.options.offset && t.length && (e = this.getDecimalForValue(t[0]), s = 1 === t.length ? 1 - e : (this.getDecimalForValue(t[1]) - e) / 2, i = this.getDecimalForValue(t[t.length - 1]), n = 1 === t.length ? i : (i - this.getDecimalForValue(t[t.length - 2])) / 2);
    const o = t.length < 3 ? .5 : .25;
    s = userInputValue(s, 0, o), n = userInputValue(n, 0, o), this._offsets = {
      start: s,
      end: n,
      factor: 1 / (s + 1 + n)
    };
  }
  _generate() {
    const t = this._adapter,
      e = this.min,
      i = this.max,
      s = this.options,
      n = s.time,
      o = n.unit || getNearestTimeStep(n.minUnit, e, i, this._getLabelCapacity(e)),
      a = responseHandlerFunction(s.ticks.stepSize, 1),
      h = "week" === o && n.isoWeekday,
      l = promiseExecutor(h) || !0 === h,
      c = {};
    let d,
      u,
      g = e;
    if (l && (g = +t.startOf(g, "isoWeek", h)), g = +t.startOf(g, l ? "day" : o), t.diff(i, e, o) > 1e5 * a) throw new Error(e + " and " + i + " are too far apart with stepSize of " + a + " " + o);
    const p = "data" === s.ticks.source && this.getDataTimestamps();
    for (d = g, u = 0; d < i; d = +t.add(d, a, o), u++) setValueInRange(c, d, p);
    return d !== i && "ticks" !== s.bounds && 1 !== u || setValueInRange(c, d, p), Object.keys(c).sort(calculateDifference).map(t => +t);
  }
  getLabelForValue(t) {
    const e = this._adapter,
      i = this.options.time;
    return i.tooltipFormat ? e.format(t, i.tooltipFormat) : e.format(t, i.displayFormats.datetime);
  }
  format(t, e) {
    const i = this.options.time.displayFormats,
      s = this._unit,
      n = e || i[s];
    return this._adapter.format(t, n);
  }
  _tickFormatFunction(t, e, i, s) {
    const n = this.options,
      o = n.ticks.callback;
    if (o) return elementQuerySelector(o, [t, e, i], this);
    const a = n.time.displayFormats,
      r = this._unit,
      h = this._majorUnit,
      l = r && a[r],
      c = h && a[h],
      d = i[e],
      u = h && c && d && d.major;
    return this._adapter.format(t, s || (u ? c : l));
  }
  generateTickLabels(t) {
    let e, i, s;
    for (e = 0, i = t.length; e < i; ++e) s = t[e], s.label = this._tickFormatFunction(s.value, e, t);
  }
  getDecimalForValue(t) {
    return null === t ? NaN : (t - this.min) / (this.max - this.min);
  }
  getPixelForValue(t) {
    const e = this._offsets,
      i = this.getDecimalForValue(t);
    return this.getPixelForDecimal((e.start + i) * e.factor);
  }
  getValueForPixel(t) {
    const e = this._offsets,
      i = this.getDecimalForPixel(t) / e.factor - e.end;
    return this.min + i * (this.max - this.min);
  }
  _getLabelSize(t) {
    const e = this.options.ticks,
      i = this.ctx.measureText(t).width,
      s = dataTransformationFunction(this.isHorizontal() ? e.maxRotation : e.minRotation),
      n = Math.cos(s),
      o = Math.sin(s),
      a = this._resolveTickFontOptions(0).size;
    return {
      w: i * n + a * o,
      h: i * o + a * n
    };
  }
  _getLabelCapacity(t) {
    const e = this.options.time,
      i = e.displayFormats,
      s = i[e.unit] || i.millisecond,
      n = this._tickFormatFunction(t, 0, generateTimeSeriesData(this, [t], this._majorUnit), s),
      o = this._getLabelSize(n),
      a = Math.floor(this.isHorizontal() ? this.width / o.w : this.height / o.h) - 1;
    return a > 0 ? a : 1;
  }
  getDataTimestamps() {
    let t,
      e,
      i = this._cache.data || [];
    if (i.length) return i;
    const s = this.getMatchingVisibleMetas();
    if (this._normalized && s.length) return this._cache.data = s[0].controller.getAllParsedValues(this);
    for (t = 0, e = s.length; t < e; ++t) i = i.concat(s[t].controller.getAllParsedValues(this));
    return this._cache.data = this.normalize(i);
  }
  getLabelTimestamps() {
    const t = this._cache.labels || [];
    let e, i;
    if (t.length) return t;
    const s = this.getLabels();
    for (e = 0, i = s.length; e < i; ++e) t.push(parseDateString(this, s[e]));
    return this._cache.labels = this._normalized ? t : this.normalize(t);
  }
  normalize(t) {
    return defaultExportModule(t.sort(calculateDifference));
  }
}
function getPositionRange(t, e, i) {
  let s,
    n,
    o,
    a,
    r = 0,
    h = t.length - 1;
  i ? (e >= t[r].pos && e <= t[h].pos && ({
    lo: r,
    hi: h
  } = ___identifierMapping(t, "pos", e)), {
    pos: s,
    time: o
  } = t[r], {
    pos: n,
    time: a
  } = t[h]) : (e >= t[r].time && e <= t[h].time && ({
    lo: r,
    hi: h
  } = ___identifierMapping(t, "time", e)), {
    time: s,
    pos: o
  } = t[r], {
    time: n,
    pos: a
  } = t[h]);
  const l = n - s;
  return l ? o + (a - o) * (e - s) / l : o;
}
class TimeSeriesManager extends TimeScaleManager {
  static id = "timeseries";
  static defaults = TimeScaleManager.defaults;
  constructor(t) {
    super(t), this._table = [], this._minPos = void 0, this._tableRange = void 0;
  }
  initOffsets() {
    const t = this._getTimestampsForTable(),
      e = this._table = this.buildLookupTable(t);
    this._minPos = getPositionRange(e, this.min), this._tableRange = getPositionRange(e, this.max) - this._minPos, super.initOffsets(t);
  }
  buildLookupTable(t) {
    const {
        min: e,
        max: i
      } = this,
      s = [],
      n = [];
    let o, a, r, h, l;
    for (o = 0, a = t.length; o < a; ++o) h = t[o], h >= e && h <= i && s.push(h);
    if (s.length < 2) return [{
      time: e,
      pos: 0
    }, {
      time: i,
      pos: 1
    }];
    for (o = 0, a = s.length; o < a; ++o) l = s[o + 1], r = s[o - 1], h = s[o], Math.round((l + r) / 2) !== h && n.push({
      time: h,
      pos: o / (a - 1)
    });
    return n;
  }
  _generate() {
    const t = this.min,
      e = this.max;
    let i = super.getDataTimestamps();
    return i.includes(t) && i.length || i.splice(0, 0, t), i.includes(e) && 1 !== i.length || i.push(e), i.sort((t, e) => t - e);
  }
  _getTimestampsForTable() {
    let t = this._cache.all || [];
    if (t.length) return t;
    const e = this.getDataTimestamps(),
      i = this.getLabelTimestamps();
    return t = e.length && i.length ? this.normalize(e.concat(i)) : e.length ? e : i, t = this._cache.all = t, t;
  }
  getDecimalForValue(t) {
    return (getPositionRange(this._table, t) - this._minPos) / this._tableRange;
  }
  getValueForPixel(t) {
    const e = this._offsets,
      i = this.getDecimalForPixel(t) / e.factor - e.end;
    return getPositionRange(this._table, i * this._tableRange + this._minPos, !0);
  }
}
var ChartScaleRegistry = Object.freeze({
  __proto__: null,
  CategoryScale: CategoryScaleManager,
  LinearScale: LinearScaleHandler,
  LogarithmicScale: LogarithmicScaleChart,
  RadialLinearScale: RadialLinearChartRenderer,
  TimeScale: TimeScaleManager,
  TimeSeriesScale: TimeSeriesManager
});
const scaleConfigurations = [ChartControllersRegistry, ChartElementRegistry, chartConfiguration, ChartScaleRegistry];
export { _AnimationHandler as Animation, AnimationManager as Animations, ArcRendererController as ArcElement, BarChartComponent as BarController, BarChartAnimationController as BarElement, CanvasRenderingContextManager as BasePlatform, CanvasRenderingContext2DManager as BasicPlatform, BubbleChartComponent as BubbleController, CategoryScaleManager as CategoryScale, __ChartManager as Chart, colorSettings as Colors, ChartComponent as DatasetController, decimationSettings as Decimation, CanvasRenderingContextHandler as DomPlatform, DoughnutChartComponent as DoughnutController, CanvasAnimationManager as Element, fillerPluginManager as Filler, interactionEvaluatorConfig as Interaction, legendControllerInstance as Legend, LineChartManager as LineController, LineChartComponent as LineElement, LinearScaleHandler as LinearScale, LogarithmicScaleChart as LogarithmicScale, PieChartComponent as PieController, PointData as PointElement, PolarAreaChartElement as PolarAreaController, RadarChartElement as RadarController, RadialLinearChartRenderer as RadialLinearScale, ___ChartElement as Scale, ScatterPlotChart as ScatterController, subtitleManager as SubTitle, chartManagerInstance as Ticks, TimeScaleManager as TimeScale, TimeSeriesManager as TimeSeriesScale, titlePluginManager as Title, tooltipManager as Tooltip, DateManager as _adapters, isOffscreenCanvasAvailable as _detectPlatform, __chartManagerInstance as animator, ChartControllersRegistry as controllers, _dataProcessor as defaults, ChartElementRegistry as elements, boxLayoutManager as layouts, chartConfiguration as plugins, scaleConfigurations as registerables, chartRegistryManager as registry, ChartScaleRegistry as scales };