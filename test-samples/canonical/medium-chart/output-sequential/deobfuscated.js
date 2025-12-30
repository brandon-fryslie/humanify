import { r as t, a as e, e as i, c as s, i as n, d as o, b as a, v as r, u as h, l, f as c, g as d, h as u, s as g, j as p, k as f, _ as m, t as x, m as b, n as _, T as y, o as v, p as M, H as w, P as k, q as S, w as D, x as P, y as C, z as A, A as L, B as O, C as E, D as T, E as R, F as z, G as I, I as F, J as V, K as B, L as N, M as W, N as H, O as j, Q as $, R as U, S as Y, U as X, V as G, W as K, X as q, Y as J, Z, $ as Q, a0 as tt, a1 as et, a2 as it, a3 as st, a4 as nt, a5 as ot, a6 as at, a7 as rt, a8 as ht, a9 as lt, aa as ct, ab as dt, ac as ut, ad as gt, ae as pt, af as ft, ag as mt, ah as xt, ai as bt, aj as _t, ak as yt, al as vt, am as Mt, an as wt, ao as kt, ap as St, aq as Dt, ar as Pt, as as Ct, at as At, au as Lt, av as Ot, aw as Et, ax as Tt, ay as Rt, az as zt, aA as It, aB as Ft, aC as Vt, aD as Bt, aE as Nt, aF as Wt, aG as Ht, aH as jt, aI as $t, aJ as Ut, aK as Yt, aL as Xt, aM as Gt, aN as Kt, aO as qt, aP as Jt } from "./chunks/helpers.segment.js";
import "@kurkle/color";
class Zt {
  constructor() {
    this._request = null;
    this._charts = new Map();
    this._running = false;
    this._lastDate = undefined;
  }
  _notify(t, e, i, s) {
    const n = e.listeners[s];
    const o = e.duration;
    n.forEach(s => s({
      chart: t,
      initial: e.initial,
      numSteps: o,
      currentStep: Math.min(i - e.start, o)
    }));
  }
  _refresh() {
    if (!this._request) {
      this._running = true;
      this._request = t.call(window, () => {
        this._update();
        this._request = null;
        if (this._running) {
          this._refresh();
        }
      });
    }
  }
  _update(t = Date.now()) {
    let e = 0;
    this._charts.forEach((i, s) => {
      if (!i.running || !i.items.length) {
        return;
      }
      const n = i.items;
      let o;
      let a = n.length - 1;
      let r = false;
      for (; a >= 0; --a) {
        o = n[a];
        if (o._active) {
          if (o._total > i.duration) {
            i.duration = o._total;
          }
          o.tick(t);
          r = true;
        } else {
          n[a] = n[n.length - 1];
          n.pop();
        }
      }
      if (r) {
        s.draw();
        this._notify(s, i, t, "progress");
      }
      if (!n.length) {
        i.running = false;
        this._notify(s, i, t, "complete");
        i.initial = false;
      }
      e += n.length;
    });
    this._lastDate = t;
    if (e === 0) {
      this._running = false;
    }
  }
  _getAnims(t) {
    const e = this._charts;
    let i = e.get(t);
    if (!i) {
      i = {
        running: false,
        initial: true,
        items: [],
        listeners: {
          complete: [],
          progress: []
        }
      };
      e.set(t, i);
    }
    return i;
  }
  listen(t, e, i) {
    this._getAnims(t).listeners[e].push(i);
  }
  add(t, e) {
    if (e && e.length) {
      this._getAnims(t).items.push(...e);
    }
  }
  has(t) {
    return this._getAnims(t).items.length > 0;
  }
  start(t) {
    const e = this._charts.get(t);
    if (e) {
      e.running = true;
      e.start = Date.now();
      e.duration = e.items.reduce((t, e) => Math.max(t, e._duration), 0);
      this._refresh();
    }
  }
  running(t) {
    if (!this._running) {
      return false;
    }
    const e = this._charts.get(t);
    return !!e && !!e.running && !!e.items.length;
  }
  stop(t) {
    const e = this._charts.get(t);
    if (!e || !e.items.length) {
      return;
    }
    const i = e.items;
    let s = i.length - 1;
    for (; s >= 0; --s) {
      i[s].cancel();
    }
    e.items = [];
    this._notify(t, e, Date.now(), "complete");
  }
  remove(t) {
    return this._charts.delete(t);
  }
}
var Qt = new Zt();
const te = "transparent";
const ee = {
  boolean: (t, e, i) => i > 0.5 ? e : t,
  color(t, e, i) {
    const n = s(t || te);
    const o = n.valid && s(e || te);
    if (o && o.valid) {
      return o.mix(n, i).hexString();
    } else {
      return e;
    }
  },
  number: (t, e, i) => t + (e - t) * i
};
class ie {
  constructor(t, s, n, o) {
    const a = s[n];
    o = e([t.to, o, a, t.from]);
    const r = e([t.from, a, o]);
    this._active = true;
    this._fn = t.fn || ee[t.type || typeof r];
    this._easing = i[t.easing] || i.linear;
    this._start = Math.floor(Date.now() + (t.delay || 0));
    this._duration = this._total = Math.floor(t.duration);
    this._loop = !!t.loop;
    this._target = s;
    this._prop = n;
    this._from = r;
    this._to = o;
    this._promises = undefined;
  }
  active() {
    return this._active;
  }
  update(t, i, s) {
    if (this._active) {
      this._notify(false);
      const n = this._target[this._prop];
      const o = s - this._start;
      const a = this._duration - o;
      this._start = s;
      this._duration = Math.floor(Math.max(a, t.duration));
      this._total += o;
      this._loop = !!t.loop;
      this._to = e([t.to, i, n, t.from]);
      this._from = e([t.from, n, i]);
    }
  }
  cancel() {
    if (this._active) {
      this.tick(Date.now());
      this._active = false;
      this._notify(false);
    }
  }
  tick(t) {
    const e = t - this._start;
    const i = this._duration;
    const s = this._prop;
    const n = this._from;
    const o = this._loop;
    const a = this._to;
    let r;
    this._active = n !== a && (o || e < i);
    if (!this._active) {
      this._target[s] = a;
      this._notify(true);
      return;
    }
    if (e < 0) {
      this._target[s] = n;
    } else {
      r = e / i % 2;
      r = o && r > 1 ? 2 - r : r;
      r = this._easing(Math.min(1, Math.max(0, r)));
      this._target[s] = this._fn(n, a, r);
    }
  }
  wait() {
    const t = this._promises ||= [];
    return new Promise((e, i) => {
      t.push({
        res: e,
        rej: i
      });
    });
  }
  _notify(t) {
    const e = t ? "res" : "rej";
    const i = this._promises || [];
    for (let t = 0; t < i.length; t++) {
      i[t][e]();
    }
  }
}
class se {
  constructor(t, e) {
    this._chart = t;
    this._properties = new Map();
    this.configure(e);
  }
  configure(t) {
    if (!n(t)) {
      return;
    }
    const e = Object.keys(o.animation);
    const i = this._properties;
    Object.getOwnPropertyNames(t).forEach(s => {
      const o = t[s];
      if (!n(o)) {
        return;
      }
      const r = {};
      for (const t of e) {
        r[t] = o[t];
      }
      (a(o.properties) && o.properties || [s]).forEach(t => {
        if (t === s || !i.has(t)) {
          i.set(t, r);
        }
      });
    });
  }
  _animateOptions(t, e) {
    const i = e.options;
    const s = oe(t, i);
    if (!s) {
      return [];
    }
    const n = this._createAnimations(s, i);
    if (i.$shared) {
      ne(t.options.$animations, i).then(() => {
        t.options = i;
      }, () => {});
    }
    return n;
  }
  _createAnimations(t, e) {
    const i = this._properties;
    const s = [];
    const n = t.$animations ||= {};
    const o = Object.keys(e);
    const a = Date.now();
    let r;
    for (r = o.length - 1; r >= 0; --r) {
      const h = o[r];
      if (h.charAt(0) === "$") {
        continue;
      }
      if (h === "options") {
        s.push(...this._animateOptions(t, e));
        continue;
      }
      const l = e[h];
      let c = n[h];
      const d = i.get(h);
      if (c) {
        if (d && c.active()) {
          c.update(d, l, a);
          continue;
        }
        c.cancel();
      }
      if (d && d.duration) {
        n[h] = c = new ie(d, t, h, l);
        s.push(c);
      } else {
        t[h] = l;
      }
    }
    return s;
  }
  update(t, e) {
    if (this._properties.size === 0) {
      Object.assign(t, e);
      return;
    }
    const i = this._createAnimations(t, e);
    if (i.length) {
      Qt.add(this._chart, i);
      return true;
    } else {
      return undefined;
    }
  }
}
function ne(t, e) {
  const i = [];
  const s = Object.keys(e);
  for (let e = 0; e < s.length; e++) {
    const n = t[s[e]];
    if (n && n.active()) {
      i.push(n.wait());
    }
  }
  return Promise.all(i);
}
function oe(t, e) {
  if (!e) {
    return;
  }
  let i = t.options;
  if (i) {
    if (i.$shared) {
      t.options = i = Object.assign({}, i, {
        $shared: false,
        $animations: {}
      });
    }
    return i;
  }
  t.options = e;
}
function ae(t, e) {
  const i = t && t.options || {};
  const s = i.reverse;
  const n = i.min === undefined ? e : 0;
  const o = i.max === undefined ? e : 0;
  return {
    start: s ? o : n,
    end: s ? n : o
  };
}
function re(t, e, i) {
  if (i === false) {
    return false;
  }
  const s = ae(t, i);
  const n = ae(e, i);
  return {
    top: n.end,
    right: s.end,
    bottom: n.start,
    left: s.start
  };
}
function he(t) {
  let e;
  let i;
  let s;
  let o;
  if (n(t)) {
    e = t.top;
    i = t.right;
    s = t.bottom;
    o = t.left;
  } else {
    e = i = s = o = t;
  }
  return {
    top: e,
    right: i,
    bottom: s,
    left: o,
    disabled: t === false
  };
}
function le(t, e) {
  const i = [];
  const s = t._getSortedDatasetMetas(e);
  let n;
  let o;
  n = 0;
  o = s.length;
  for (; n < o; ++n) {
    i.push(s[n].index);
  }
  return i;
}
function ce(t, e, i, s = {}) {
  const n = t.keys;
  const o = s.mode === "single";
  let a;
  let r;
  let h;
  let l;
  if (e !== null) {
    a = 0;
    r = n.length;
    for (; a < r; ++a) {
      h = +n[a];
      if (h === i) {
        if (s.all) {
          continue;
        }
        break;
      }
      l = t.values[h];
      if (d(l) && (o || e === 0 || g(e) === g(l))) {
        e += l;
      }
    }
    return e;
  }
}
function de(t) {
  const e = Object.keys(t);
  const i = new Array(e.length);
  let s;
  let n;
  let o;
  s = 0;
  n = e.length;
  for (; s < n; ++s) {
    o = e[s];
    i[s] = {
      x: o,
      y: t[o]
    };
  }
  return i;
}
function ue(t, e) {
  const i = t && t.options.stacked;
  return i || i === undefined && e.stack !== undefined;
}
function ge(t, e, i) {
  return `${t.id}.${e.id}.${i.stack || i.type}`;
}
function pe(t) {
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
function fe(t, e, i) {
  const s = t[e] ||= {};
  return s[i] ||= {};
}
function me(t, e, i, s) {
  for (const n of e.getMatchingVisibleMetas(s).reverse()) {
    const e = t[n.index];
    if (i && e > 0 || !i && e < 0) {
      return n.index;
    }
  }
  return null;
}
function xe(t, e) {
  const {
    chart: i,
    _cachedMeta: s
  } = t;
  const n = i._stacks ||= {};
  const {
    iScale: o,
    vScale: a,
    index: r
  } = s;
  const h = o.axis;
  const l = a.axis;
  const c = ge(o, a, s);
  const d = e.length;
  let u;
  for (let t = 0; t < d; ++t) {
    const i = e[t];
    const {
      [h]: o,
      [l]: d
    } = i;
    u = (i._stacks ||= {})[l] = fe(n, c, o);
    u[r] = d;
    u._top = me(u, a, true, s.type);
    u._bottom = me(u, a, false, s.type);
    (u._visualValues ||= {})[r] = d;
  }
}
function be(t, e) {
  const i = t.scales;
  return Object.keys(i).filter(t => i[t].axis === e).shift();
}
function _e(t, e) {
  return p(t, {
    active: false,
    dataset: undefined,
    datasetIndex: e,
    index: e,
    mode: "default",
    type: "dataset"
  });
}
function ye(t, e, i) {
  return p(t, {
    active: false,
    dataIndex: e,
    parsed: undefined,
    raw: undefined,
    element: i,
    index: e,
    mode: "default",
    type: "data"
  });
}
function ve(t, e) {
  const i = t.controller.index;
  const s = t.vScale && t.vScale.axis;
  if (s) {
    e = e || t._parsed;
    for (const t of e) {
      const e = t._stacks;
      if (!e || e[s] === undefined || e[s][i] === undefined) {
        return;
      }
      delete e[s][i];
      if (e[s]._visualValues !== undefined && e[s]._visualValues[i] !== undefined) {
        delete e[s]._visualValues[i];
      }
    }
  }
}
const Me = t => t === "reset" || t === "none";
const we = (t, e) => e ? t : Object.assign({}, t);
const ke = (t, e, i) => t && !e.hidden && e._stacked && {
  keys: le(i, true),
  values: null
};
class Se {
  static defaults = {};
  static datasetElementType = null;
  static dataElementType = null;
  constructor(t, e) {
    this.chart = t;
    this._ctx = t.ctx;
    this.index = e;
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
    const t = this._cachedMeta;
    this.configure();
    this.linkScales();
    t._stacked = ue(t.vScale, t);
    this.addElements();
    if (this.options.fill && !this.chart.isPluginEnabled("filler")) {
      console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
    }
  }
  updateIndex(t) {
    if (this.index !== t) {
      ve(this._cachedMeta);
    }
    this.index = t;
  }
  linkScales() {
    const t = this.chart;
    const e = this._cachedMeta;
    const i = this.getDataset();
    const s = (t, e, i, s) => t === "x" ? e : t === "r" ? s : i;
    const n = e.xAxisID = r(i.xAxisID, be(t, "x"));
    const o = e.yAxisID = r(i.yAxisID, be(t, "y"));
    const a = e.rAxisID = r(i.rAxisID, be(t, "r"));
    const h = e.indexAxis;
    const l = e.iAxisID = s(h, n, o, a);
    const c = e.vAxisID = s(h, o, n, a);
    e.xScale = this.getScaleForId(n);
    e.yScale = this.getScaleForId(o);
    e.rScale = this.getScaleForId(a);
    e.iScale = this.getScaleForId(l);
    e.vScale = this.getScaleForId(c);
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
    if (t === e.iScale) {
      return e.vScale;
    } else {
      return e.iScale;
    }
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const t = this._cachedMeta;
    if (this._data) {
      h(this._data, this);
    }
    if (t._stacked) {
      ve(t);
    }
  }
  _dataCheck() {
    const t = this.getDataset();
    const e = t.data ||= [];
    const i = this._data;
    if (n(e)) {
      this._data = de(e);
    } else if (i !== e) {
      if (i) {
        h(i, this);
        const t = this._cachedMeta;
        ve(t);
        t._parsed = [];
      }
      if (e && Object.isExtensible(e)) {
        l(e, this);
      }
      this._syncList = [];
      this._data = e;
    }
  }
  addElements() {
    const t = this._cachedMeta;
    this._dataCheck();
    if (this.datasetElementType) {
      t.dataset = new this.datasetElementType();
    }
  }
  buildOrUpdateElements(t) {
    const e = this._cachedMeta;
    const i = this.getDataset();
    let s = false;
    this._dataCheck();
    const n = e._stacked;
    e._stacked = ue(e.vScale, e);
    if (e.stack !== i.stack) {
      s = true;
      ve(e);
      e.stack = i.stack;
    }
    this._resyncElements(t);
    if (s || n !== e._stacked) {
      xe(this, e._parsed);
    }
  }
  configure() {
    const t = this.chart.config;
    const e = t.datasetScopeKeys(this._type);
    const i = t.getOptionScopes(this.getDataset(), e, true);
    this.options = t.createResolver(i, this.getContext());
    this._parsing = this.options.parsing;
    this._cachedDataOpts = {};
  }
  parse(t, e) {
    const {
      _cachedMeta: i,
      _data: s
    } = this;
    const {
      iScale: o,
      _stacked: r
    } = i;
    const h = o.axis;
    let l;
    let c;
    let d;
    let u = t === 0 && e === s.length || i._sorted;
    let g = t > 0 && i._parsed[t - 1];
    if (this._parsing === false) {
      i._parsed = s;
      i._sorted = true;
      d = s;
    } else {
      d = a(s[t]) ? this.parseArrayData(i, s, t, e) : n(s[t]) ? this.parseObjectData(i, s, t, e) : this.parsePrimitiveData(i, s, t, e);
      const o = () => c[h] === null || g && c[h] < g[h];
      for (l = 0; l < e; ++l) {
        i._parsed[l + t] = c = d[l];
        if (u) {
          if (o()) {
            u = false;
          }
          g = c;
        }
      }
      i._sorted = u;
    }
    if (r) {
      xe(this, d);
    }
  }
  parsePrimitiveData(t, e, i, s) {
    const {
      iScale: n,
      vScale: o
    } = t;
    const a = n.axis;
    const r = o.axis;
    const h = n.getLabels();
    const l = n === o;
    const c = new Array(s);
    let d;
    let u;
    let g;
    d = 0;
    u = s;
    for (; d < u; ++d) {
      g = d + i;
      c[d] = {
        [a]: l || n.parse(h[g], g),
        [r]: o.parse(e[g], g)
      };
    }
    return c;
  }
  parseArrayData(t, e, i, s) {
    const {
      xScale: n,
      yScale: o
    } = t;
    const a = new Array(s);
    let r;
    let h;
    let l;
    let c;
    r = 0;
    h = s;
    for (; r < h; ++r) {
      l = r + i;
      c = e[l];
      a[r] = {
        x: n.parse(c[0], l),
        y: o.parse(c[1], l)
      };
    }
    return a;
  }
  parseObjectData(t, e, i, s) {
    const {
      xScale: n,
      yScale: o
    } = t;
    const {
      xAxisKey: a = "x",
      yAxisKey: r = "y"
    } = this._parsing;
    const h = new Array(s);
    let l;
    let d;
    let u;
    let g;
    l = 0;
    d = s;
    for (; l < d; ++l) {
      u = l + i;
      g = e[u];
      h[l] = {
        x: n.parse(c(g, a), u),
        y: o.parse(c(g, r), u)
      };
    }
    return h;
  }
  getParsed(t) {
    return this._cachedMeta._parsed[t];
  }
  getDataElement(t) {
    return this._cachedMeta.data[t];
  }
  applyStack(t, e, i) {
    const s = this.chart;
    const n = this._cachedMeta;
    const o = e[t.axis];
    return ce({
      keys: le(s, true),
      values: e._stacks[t.axis]._visualValues
    }, o, n.index, {
      mode: i
    });
  }
  updateRangeFromParsed(t, e, i, s) {
    const n = i[e.axis];
    let o = n === null ? NaN : n;
    const a = s && i._stacks[e.axis];
    if (s && a) {
      s.values = a;
      o = ce(s, n, this._cachedMeta.index);
    }
    t.min = Math.min(t.min, o);
    t.max = Math.max(t.max, o);
  }
  getMinMax(t, e) {
    const i = this._cachedMeta;
    const s = i._parsed;
    const n = i._sorted && t === i.iScale;
    const o = s.length;
    const a = this._getOtherScale(t);
    const r = ke(e, i, this.chart);
    const h = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };
    const {
      min: l,
      max: c
    } = pe(a);
    let u;
    let g;
    function p() {
      g = s[u];
      const e = g[a.axis];
      return !d(g[t.axis]) || l > e || c < e;
    }
    for (u = 0; u < o && (p() || (this.updateRangeFromParsed(h, t, g, r), !n)); ++u);
    if (n) {
      for (u = o - 1; u >= 0; --u) {
        if (!p()) {
          this.updateRangeFromParsed(h, t, g, r);
          break;
        }
      }
    }
    return h;
  }
  getAllParsedValues(t) {
    const e = this._cachedMeta._parsed;
    const i = [];
    let s;
    let n;
    let o;
    s = 0;
    n = e.length;
    for (; s < n; ++s) {
      o = e[s][t.axis];
      if (d(o)) {
        i.push(o);
      }
    }
    return i;
  }
  getMaxOverflow() {
    return false;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta;
    const i = e.iScale;
    const s = e.vScale;
    const n = this.getParsed(t);
    return {
      label: i ? "" + i.getLabelForValue(n[i.axis]) : "",
      value: s ? "" + s.getLabelForValue(n[s.axis]) : ""
    };
  }
  _update(t) {
    const e = this._cachedMeta;
    this.update(t || "default");
    e._clip = he(r(this.options.clip, re(e.xScale, e.yScale, this.getMaxOverflow())));
  }
  update(t) {}
  draw() {
    const t = this._ctx;
    const e = this.chart;
    const i = this._cachedMeta;
    const s = i.data || [];
    const n = e.chartArea;
    const o = [];
    const a = this._drawStart || 0;
    const r = this._drawCount || s.length - a;
    const h = this.options.drawActiveElementsOnTop;
    let l;
    if (i.dataset) {
      i.dataset.draw(t, n, a, r);
    }
    l = a;
    for (; l < a + r; ++l) {
      const e = s[l];
      if (!e.hidden) {
        if (e.active && h) {
          o.push(e);
        } else {
          e.draw(t, n);
        }
      }
    }
    for (l = 0; l < o.length; ++l) {
      o[l].draw(t, n);
    }
  }
  getStyle(t, e) {
    const i = e ? "active" : "default";
    if (t === undefined && this._cachedMeta.dataset) {
      return this.resolveDatasetElementOptions(i);
    } else {
      return this.resolveDataElementOptions(t || 0, i);
    }
  }
  getContext(t, e, i) {
    const s = this.getDataset();
    let n;
    if (t >= 0 && t < this._cachedMeta.data.length) {
      const e = this._cachedMeta.data[t];
      n = e.$context ||= ye(this.getContext(), t, e);
      n.parsed = this.getParsed(t);
      n.raw = s.data[t];
      n.index = n.dataIndex = t;
    } else {
      n = this.$context ||= _e(this.chart.getContext(), this.index);
      n.dataset = s;
      n.index = n.datasetIndex = this.index;
    }
    n.active = !!e;
    n.mode = i;
    return n;
  }
  resolveDatasetElementOptions(t) {
    return this._resolveElementOptions(this.datasetElementType.id, t);
  }
  resolveDataElementOptions(t, e) {
    return this._resolveElementOptions(this.dataElementType.id, e, t);
  }
  _resolveElementOptions(t, e = "default", i) {
    const s = e === "active";
    const n = this._cachedDataOpts;
    const a = t + "-" + e;
    const r = n[a];
    const h = this.enableOptionSharing && u(i);
    if (r) {
      return we(r, h);
    }
    const l = this.chart.config;
    const c = l.datasetElementScopeKeys(this._type, t);
    const d = s ? [`${t}Hover`, "hover", t, ""] : [t, ""];
    const g = l.getOptionScopes(this.getDataset(), c);
    const p = Object.keys(o.elements[t]);
    const f = l.resolveNamedOptions(g, p, () => this.getContext(i, s, e), d);
    if (f.$shared) {
      f.$shared = h;
      n[a] = Object.freeze(we(f, h));
    }
    return f;
  }
  _resolveAnimations(t, e, i) {
    const s = this.chart;
    const n = this._cachedDataOpts;
    const o = `animation-${e}`;
    const a = n[o];
    if (a) {
      return a;
    }
    let r;
    if (s.options.animation !== false) {
      const s = this.chart.config;
      const n = s.datasetAnimationScopeKeys(this._type, e);
      const o = s.getOptionScopes(this.getDataset(), n);
      r = s.createResolver(o, this.getContext(t, i, e));
    }
    const h = new se(s, r && r.animations);
    if (r && r._cacheable) {
      n[o] = Object.freeze(h);
    }
    return h;
  }
  getSharedOptions(t) {
    if (t.$shared) {
      return this._sharedOptions ||= Object.assign({}, t);
    }
  }
  includeOptions(t, e) {
    return !e || Me(t) || this.chart._animationsDisabled;
  }
  _getSharedOptions(t, e) {
    const i = this.resolveDataElementOptions(t, e);
    const s = this._sharedOptions;
    const n = this.getSharedOptions(i);
    const o = this.includeOptions(e, n) || n !== s;
    this.updateSharedOptions(n, e, i);
    return {
      sharedOptions: n,
      includeOptions: o
    };
  }
  updateElement(t, e, i, s) {
    if (Me(s)) {
      Object.assign(t, i);
    } else {
      this._resolveAnimations(e, s).update(t, i);
    }
  }
  updateSharedOptions(t, e, i) {
    if (t && !Me(e)) {
      this._resolveAnimations(undefined, e).update(t, i);
    }
  }
  _setStyle(t, e, i, s) {
    t.active = s;
    const n = this.getStyle(e, s);
    this._resolveAnimations(e, i, s).update(t, {
      options: !s && this.getSharedOptions(n) || n
    });
  }
  removeHoverStyle(t, e, i) {
    this._setStyle(t, i, "active", false);
  }
  setHoverStyle(t, e, i) {
    this._setStyle(t, i, "active", true);
  }
  _removeDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    if (t) {
      this._setStyle(t, undefined, "active", false);
    }
  }
  _setDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    if (t) {
      this._setStyle(t, undefined, "active", true);
    }
  }
  _resyncElements(t) {
    const e = this._data;
    const i = this._cachedMeta.data;
    for (const [t, e, i] of this._syncList) {
      this[t](e, i);
    }
    this._syncList = [];
    const s = i.length;
    const n = e.length;
    const o = Math.min(n, s);
    if (o) {
      this.parse(0, o);
    }
    if (n > s) {
      this._insertElements(s, n - s, t);
    } else if (n < s) {
      this._removeElements(n, s - n);
    }
  }
  _insertElements(t, e, i = true) {
    const s = this._cachedMeta;
    const n = s.data;
    const o = t + e;
    let a;
    const r = t => {
      t.length += e;
      a = t.length - 1;
      for (; a >= o; a--) {
        t[a] = t[a - e];
      }
    };
    r(n);
    a = t;
    for (; a < o; ++a) {
      n[a] = new this.dataElementType();
    }
    if (this._parsing) {
      r(s._parsed);
    }
    this.parse(t, e);
    if (i) {
      this.updateElements(n, t, e, "reset");
    }
  }
  updateElements(t, e, i, s) {}
  _removeElements(t, e) {
    const i = this._cachedMeta;
    if (this._parsing) {
      const s = i._parsed.splice(t, e);
      if (i._stacked) {
        ve(i, s);
      }
    }
    i.data.splice(t, e);
  }
  _sync(t) {
    if (this._parsing) {
      this._syncList.push(t);
    } else {
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
    if (e) {
      this._sync(["_removeElements", t, e]);
    }
    const i = arguments.length - 2;
    if (i) {
      this._sync(["_insertElements", t, i]);
    }
  }
  _onDataUnshift() {
    this._sync(["_insertElements", 0, arguments.length]);
  }
}
function De(t, e) {
  if (!t._cache.$bar) {
    const i = t.getMatchingVisibleMetas(e);
    let s = [];
    for (let e = 0, n = i.length; e < n; e++) {
      s = s.concat(i[e].controller.getAllParsedValues(t));
    }
    t._cache.$bar = m(s.sort((t, e) => t - e));
  }
  return t._cache.$bar;
}
function Pe(t) {
  const e = t.iScale;
  const i = De(e, t.type);
  let s;
  let n;
  let o;
  let a;
  let r = e._length;
  const h = () => {
    if (o !== 32767 && o !== -32768) {
      if (u(a)) {
        r = Math.min(r, Math.abs(o - a) || r);
      }
      a = o;
    }
  };
  s = 0;
  n = i.length;
  for (; s < n; ++s) {
    o = e.getPixelForValue(i[s]);
    h();
  }
  a = undefined;
  s = 0;
  n = e.ticks.length;
  for (; s < n; ++s) {
    o = e.getPixelForTick(s);
    h();
  }
  return r;
}
function Ce(t, e, i, s) {
  const n = i.barThickness;
  let o;
  let a;
  if (f(n)) {
    o = e.min * i.categoryPercentage;
    a = i.barPercentage;
  } else {
    o = n * s;
    a = 1;
  }
  return {
    chunk: o / s,
    ratio: a,
    start: e.pixels[t] - o / 2
  };
}
function Ae(t, e, i, s) {
  const n = e.pixels;
  const o = n[t];
  let a = t > 0 ? n[t - 1] : null;
  let r = t < n.length - 1 ? n[t + 1] : null;
  const h = i.categoryPercentage;
  if (a === null) {
    a = o - (r === null ? e.end - e.start : r - o);
  }
  if (r === null) {
    r = o + o - a;
  }
  const l = o - (o - Math.min(a, r)) / 2 * h;
  return {
    chunk: Math.abs(r - a) / 2 * h / s,
    ratio: i.barPercentage,
    start: l
  };
}
function Le(t, e, i, s) {
  const n = i.parse(t[0], s);
  const o = i.parse(t[1], s);
  const a = Math.min(n, o);
  const r = Math.max(n, o);
  let h = a;
  let l = r;
  if (Math.abs(a) > Math.abs(r)) {
    h = r;
    l = a;
  }
  e[i.axis] = l;
  e._custom = {
    barStart: h,
    barEnd: l,
    start: n,
    end: o,
    min: a,
    max: r
  };
}
function Oe(t, e, i, s) {
  if (a(t)) {
    Le(t, e, i, s);
  } else {
    e[i.axis] = i.parse(t, s);
  }
  return e;
}
function Ee(t, e, i, s) {
  const n = t.iScale;
  const o = t.vScale;
  const a = n.getLabels();
  const r = n === o;
  const h = [];
  let l;
  let c;
  let d;
  let u;
  l = i;
  c = i + s;
  for (; l < c; ++l) {
    u = e[l];
    d = {};
    d[n.axis] = r || n.parse(a[l], l);
    h.push(Oe(u, d, o, l));
  }
  return h;
}
function Te(t) {
  return t && t.barStart !== undefined && t.barEnd !== undefined;
}
function Re(t, e, i) {
  if (t !== 0) {
    return g(t);
  } else {
    return (e.isHorizontal() ? 1 : -1) * (e.min >= i ? 1 : -1);
  }
}
function ze(t) {
  let e;
  let i;
  let s;
  let n;
  let o;
  if (t.horizontal) {
    e = t.base > t.x;
    i = "left";
    s = "right";
  } else {
    e = t.base < t.y;
    i = "bottom";
    s = "top";
  }
  if (e) {
    n = "end";
    o = "start";
  } else {
    n = "start";
    o = "end";
  }
  return {
    start: i,
    end: s,
    reverse: e,
    top: n,
    bottom: o
  };
}
function Ie(t, e, i, s) {
  let n = e.borderSkipped;
  const o = {};
  if (!n) {
    t.borderSkipped = o;
    return;
  }
  if (n === true) {
    t.borderSkipped = {
      top: true,
      right: true,
      bottom: true,
      left: true
    };
    return;
  }
  const {
    start: a,
    end: r,
    reverse: h,
    top: l,
    bottom: c
  } = ze(t);
  if (n === "middle" && i) {
    t.enableBorderRadius = true;
    if ((i._top || 0) === s) {
      n = l;
    } else if ((i._bottom || 0) === s) {
      n = c;
    } else {
      o[Fe(c, a, r, h)] = true;
      n = l;
    }
  }
  o[Fe(n, a, r, h)] = true;
  t.borderSkipped = o;
}
function Fe(t, e, i, s) {
  return t = s ? Be(t = Ve(t, e, i), i, e) : Be(t, e, i);
}
function Ve(t, e, i) {
  if (t === e) {
    return i;
  } else if (t === i) {
    return e;
  } else {
    return t;
  }
}
function Be(t, e, i) {
  if (t === "start") {
    return e;
  } else if (t === "end") {
    return i;
  } else {
    return t;
  }
}
function Ne(t, {
  inflateAmount: e
}, i) {
  t.inflateAmount = e === "auto" ? i === 1 ? 0.33 : 0 : e;
}
class We extends Se {
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
        properties: ["x", "y", "base", "width", "height"]
      }
    }
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category",
        offset: true,
        grid: {
          offset: true
        }
      },
      _value_: {
        type: "linear",
        beginAtZero: true
      }
    }
  };
  parsePrimitiveData(t, e, i, s) {
    return Ee(t, e, i, s);
  }
  parseArrayData(t, e, i, s) {
    return Ee(t, e, i, s);
  }
  parseObjectData(t, e, i, s) {
    const {
      iScale: n,
      vScale: o
    } = t;
    const {
      xAxisKey: a = "x",
      yAxisKey: r = "y"
    } = this._parsing;
    const h = n.axis === "x" ? a : r;
    const l = o.axis === "x" ? a : r;
    const d = [];
    let u;
    let g;
    let p;
    let f;
    u = i;
    g = i + s;
    for (; u < g; ++u) {
      f = e[u];
      p = {};
      p[n.axis] = n.parse(c(f, h), u);
      d.push(Oe(c(f, l), p, o, u));
    }
    return d;
  }
  updateRangeFromParsed(t, e, i, s) {
    super.updateRangeFromParsed(t, e, i, s);
    const n = i._custom;
    if (n && e === this._cachedMeta.vScale) {
      t.min = Math.min(t.min, n.min);
      t.max = Math.max(t.max, n.max);
    }
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta;
    const {
      iScale: i,
      vScale: s
    } = e;
    const n = this.getParsed(t);
    const o = n._custom;
    const a = Te(o) ? "[" + o.start + ", " + o.end + "]" : "" + s.getLabelForValue(n[s.axis]);
    return {
      label: "" + i.getLabelForValue(n[i.axis]),
      value: a
    };
  }
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
    this._cachedMeta.stack = this.getDataset().stack;
  }
  update(t) {
    const e = this._cachedMeta;
    this.updateElements(e.data, 0, e.data.length, t);
  }
  updateElements(t, e, i, s) {
    const n = s === "reset";
    const {
      index: o,
      _cachedMeta: {
        vScale: a
      }
    } = this;
    const r = a.getBasePixel();
    const h = a.isHorizontal();
    const l = this._getRuler();
    const {
      sharedOptions: c,
      includeOptions: d
    } = this._getSharedOptions(e, s);
    for (let u = e; u < e + i; u++) {
      const e = this.getParsed(u);
      const i = n || f(e[a.axis]) ? {
        base: r,
        head: r
      } : this._calculateBarValuePixels(u);
      const g = this._calculateBarIndexPixels(u, l);
      const p = (e._stacks || {})[a.axis];
      const m = {
        horizontal: h,
        base: i.base,
        enableBorderRadius: !p || Te(e._custom) || o === p._top || o === p._bottom,
        x: h ? i.head : g.center,
        y: h ? g.center : i.head,
        height: h ? g.size : Math.abs(i.size),
        width: h ? Math.abs(i.size) : g.size
      };
      if (d) {
        m.options = c || this.resolveDataElementOptions(u, t[u].active ? "active" : s);
      }
      const x = m.options || t[u].options;
      Ie(m, x, p, o);
      Ne(m, x, l.ratio);
      this.updateElement(t[u], u, m, s);
    }
  }
  _getStacks(t, e) {
    const {
      iScale: i
    } = this._cachedMeta;
    const s = i.getMatchingVisibleMetas(this._type).filter(t => t.controller.options.grouped);
    const n = i.options.stacked;
    const o = [];
    const a = t => {
      const i = t.controller.getParsed(e);
      const s = i && i[t.vScale.axis];
      if (f(s) || isNaN(s)) {
        return true;
      }
    };
    for (const i of s) {
      if ((e === undefined || !a(i)) && ((n === false || o.indexOf(i.stack) === -1 || n === undefined && i.stack === undefined) && o.push(i.stack), i.index === t)) {
        break;
      }
    }
    if (!o.length) {
      o.push(undefined);
    }
    return o;
  }
  _getStackCount(t) {
    return this._getStacks(undefined, t).length;
  }
  _getStackIndex(t, e, i) {
    const s = this._getStacks(t, i);
    const n = e !== undefined ? s.indexOf(e) : -1;
    if (n === -1) {
      return s.length - 1;
    } else {
      return n;
    }
  }
  _getRuler() {
    const t = this.options;
    const e = this._cachedMeta;
    const i = e.iScale;
    const s = [];
    let n;
    let o;
    n = 0;
    o = e.data.length;
    for (; n < o; ++n) {
      s.push(i.getPixelForValue(this.getParsed(n)[i.axis], n));
    }
    const a = t.barThickness;
    return {
      min: a || Pe(e),
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
    } = this;
    const a = n || 0;
    const r = this.getParsed(t);
    const h = r._custom;
    const l = Te(h);
    let c;
    let d;
    let u = r[e.axis];
    let p = 0;
    let m = i ? this.applyStack(e, r, i) : u;
    if (m !== u) {
      p = m - u;
      m = u;
    }
    if (l) {
      u = h.barStart;
      m = h.barEnd - h.barStart;
      if (u !== 0 && g(u) !== g(h.barEnd)) {
        p = 0;
      }
      p += u;
    }
    const x = f(n) || l ? p : n;
    let b = e.getPixelForValue(x);
    c = this.chart.getDataVisibility(t) ? e.getPixelForValue(p + m) : b;
    d = c - b;
    if (Math.abs(d) < o) {
      d = Re(d, e, a) * o;
      if (u === a) {
        b -= d / 2;
      }
      const t = e.getPixelForDecimal(0);
      const n = e.getPixelForDecimal(1);
      const h = Math.min(t, n);
      const g = Math.max(t, n);
      b = Math.max(Math.min(b, g), h);
      c = b + d;
      if (i && !l) {
        r._stacks[e.axis]._visualValues[s] = e.getValueForPixel(c) - e.getValueForPixel(b);
      }
    }
    if (b === e.getPixelForValue(a)) {
      const t = g(d) * e.getLineWidthForValue(a) / 2;
      b += t;
      d -= t;
    }
    return {
      size: d,
      base: b,
      head: c,
      center: c + d / 2
    };
  }
  _calculateBarIndexPixels(t, e) {
    const i = e.scale;
    const s = this.options;
    const n = s.skipNull;
    const o = r(s.maxBarThickness, Infinity);
    let a;
    let h;
    if (e.grouped) {
      const i = n ? this._getStackCount(t) : e.stackCount;
      const r = s.barThickness === "flex" ? Ae(t, e, s, i) : Ce(t, e, s, i);
      const l = this._getStackIndex(this.index, this._cachedMeta.stack, n ? t : undefined);
      a = r.start + r.chunk * l + r.chunk / 2;
      h = Math.min(o, r.chunk * r.ratio);
    } else {
      a = i.getPixelForValue(this.getParsed(t)[i.axis], t);
      h = Math.min(o, e.min * e.ratio);
    }
    return {
      base: a - h / 2,
      head: a + h / 2,
      center: a,
      size: h
    };
  }
  draw() {
    const t = this._cachedMeta;
    const e = t.vScale;
    const i = t.data;
    const s = i.length;
    let n = 0;
    for (; n < s; ++n) {
      if (this.getParsed(n)[e.axis] !== null) {
        i[n].draw(this._ctx);
      }
    }
  }
}
class He extends Se {
  static id = "bubble";
  static defaults = {
    datasetElementType: false,
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
    this.enableOptionSharing = true;
    super.initialize();
  }
  parsePrimitiveData(t, e, i, s) {
    const n = super.parsePrimitiveData(t, e, i, s);
    for (let t = 0; t < n.length; t++) {
      n[t]._custom = this.resolveDataElementOptions(t + i).radius;
    }
    return n;
  }
  parseArrayData(t, e, i, s) {
    const n = super.parseArrayData(t, e, i, s);
    for (let t = 0; t < n.length; t++) {
      const s = e[i + t];
      n[t]._custom = r(s[2], this.resolveDataElementOptions(t + i).radius);
    }
    return n;
  }
  parseObjectData(t, e, i, s) {
    const n = super.parseObjectData(t, e, i, s);
    for (let t = 0; t < n.length; t++) {
      const s = e[i + t];
      n[t]._custom = r(s && s.r && +s.r, this.resolveDataElementOptions(t + i).radius);
    }
    return n;
  }
  getMaxOverflow() {
    const t = this._cachedMeta.data;
    let e = 0;
    for (let i = t.length - 1; i >= 0; --i) {
      e = Math.max(e, t[i].size(this.resolveDataElementOptions(i)) / 2);
    }
    return e > 0 && e;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta;
    const i = this.chart.data.labels || [];
    const {
      xScale: s,
      yScale: n
    } = e;
    const o = this.getParsed(t);
    const a = s.getLabelForValue(o.x);
    const r = n.getLabelForValue(o.y);
    const h = o._custom;
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
    const n = s === "reset";
    const {
      iScale: o,
      vScale: a
    } = this._cachedMeta;
    const {
      sharedOptions: r,
      includeOptions: h
    } = this._getSharedOptions(e, s);
    const l = o.axis;
    const c = a.axis;
    for (let d = e; d < e + i; d++) {
      const e = t[d];
      const i = !n && this.getParsed(d);
      const u = {};
      const g = u[l] = n ? o.getPixelForDecimal(0.5) : o.getPixelForValue(i[l]);
      const p = u[c] = n ? a.getBasePixel() : a.getPixelForValue(i[c]);
      u.skip = isNaN(g) || isNaN(p);
      if (h) {
        u.options = r || this.resolveDataElementOptions(d, e.active ? "active" : s);
        if (n) {
          u.options.radius = 0;
        }
      }
      this.updateElement(e, d, u, s);
    }
  }
  resolveDataElementOptions(t, e) {
    const i = this.getParsed(t);
    let s = super.resolveDataElementOptions(t, e);
    if (s.$shared) {
      s = Object.assign({}, s, {
        $shared: false
      });
    }
    const n = s.radius;
    if (e !== "active") {
      s.radius = 0;
    }
    s.radius += r(i && i._custom, n);
    return s;
  }
}
function je(t, e, i) {
  let s = 1;
  let n = 1;
  let o = 0;
  let a = 0;
  if (e < y) {
    const r = t;
    const h = r + e;
    const l = Math.cos(r);
    const c = Math.sin(r);
    const d = Math.cos(h);
    const u = Math.sin(h);
    const g = (t, e, s) => M(t, r, h, true) ? 1 : Math.max(e, e * i, s, s * i);
    const p = (t, e, s) => M(t, r, h, true) ? -1 : Math.min(e, e * i, s, s * i);
    const f = g(0, l, d);
    const m = g(w, c, u);
    const x = p(k, l, d);
    const b = p(k + w, c, u);
    s = (f - x) / 2;
    n = (m - b) / 2;
    o = -(f + x) / 2;
    a = -(m + b) / 2;
  }
  return {
    ratioX: s,
    ratioY: n,
    offsetX: o,
    offsetY: a
  };
}
class $e extends Se {
  static id = "doughnut";
  static defaults = {
    datasetElementType: false,
    dataElementType: "arc",
    animation: {
      animateRotate: true,
      animateScale: false
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
    _scriptable: t => t !== "spacing",
    _indexable: t => t !== "spacing" && !t.startsWith("borderDash") && !t.startsWith("hoverBorderDash")
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
          i.chart.toggleDataVisibility(e.index);
          i.chart.update();
        }
      }
    }
  };
  constructor(t, e) {
    super(t, e);
    this.enableOptionSharing = true;
    this.innerRadius = undefined;
    this.outerRadius = undefined;
    this.offsetX = undefined;
    this.offsetY = undefined;
  }
  linkScales() {}
  parse(t, e) {
    const i = this.getDataset().data;
    const s = this._cachedMeta;
    if (this._parsing === false) {
      s._parsed = i;
    } else {
      let o;
      let a;
      let r = t => +i[t];
      if (n(i[t])) {
        const {
          key: t = "value"
        } = this._parsing;
        r = e => +c(i[e], t);
      }
      o = t;
      a = t + e;
      for (; o < a; ++o) {
        s._parsed[o] = r(o);
      }
    }
  }
  _getRotation() {
    return x(this.options.rotation - 90);
  }
  _getCircumference() {
    return x(this.options.circumference);
  }
  _getRotationExtents() {
    let t = y;
    let e = -y;
    for (let i = 0; i < this.chart.data.datasets.length; ++i) {
      if (this.chart.isDatasetVisible(i) && this.chart.getDatasetMeta(i).type === this._type) {
        const s = this.chart.getDatasetMeta(i).controller;
        const n = s._getRotation();
        const o = s._getCircumference();
        t = Math.min(t, n);
        e = Math.max(e, n + o);
      }
    }
    return {
      rotation: t,
      circumference: e - t
    };
  }
  update(t) {
    const e = this.chart;
    const {
      chartArea: i
    } = e;
    const s = this._cachedMeta;
    const n = s.data;
    const o = this.getMaxBorderWidth() + this.getMaxOffset(n) + this.options.spacing;
    const a = Math.max((Math.min(i.width, i.height) - o) / 2, 0);
    const r = Math.min(b(this.options.cutout, a), 1);
    const h = this._getRingWeight(this.index);
    const {
      circumference: l,
      rotation: c
    } = this._getRotationExtents();
    const {
      ratioX: d,
      ratioY: u,
      offsetX: g,
      offsetY: p
    } = je(c, l, r);
    const f = (i.width - o) / d;
    const m = (i.height - o) / u;
    const x = Math.max(Math.min(f, m) / 2, 0);
    const y = _(this.options.radius, x);
    const v = (y - Math.max(y * r, 0)) / this._getVisibleDatasetWeightTotal();
    this.offsetX = g * y;
    this.offsetY = p * y;
    s.total = this.calculateTotal();
    this.outerRadius = y - v * this._getRingWeightOffset(this.index);
    this.innerRadius = Math.max(this.outerRadius - v * h, 0);
    this.updateElements(n, 0, n.length, t);
  }
  _circumference(t, e) {
    const i = this.options;
    const s = this._cachedMeta;
    const n = this._getCircumference();
    if (e && i.animation.animateRotate || !this.chart.getDataVisibility(t) || s._parsed[t] === null || s.data[t].hidden) {
      return 0;
    } else {
      return this.calculateCircumference(s._parsed[t] * n / y);
    }
  }
  updateElements(t, e, i, s) {
    const n = s === "reset";
    const o = this.chart;
    const a = o.chartArea;
    const r = o.options.animation;
    const h = (a.left + a.right) / 2;
    const l = (a.top + a.bottom) / 2;
    const c = n && r.animateScale;
    const d = c ? 0 : this.innerRadius;
    const u = c ? 0 : this.outerRadius;
    const {
      sharedOptions: g,
      includeOptions: p
    } = this._getSharedOptions(e, s);
    let f;
    let m = this._getRotation();
    for (f = 0; f < e; ++f) {
      m += this._circumference(f, n);
    }
    for (f = e; f < e + i; ++f) {
      const e = this._circumference(f, n);
      const i = t[f];
      const o = {
        x: h + this.offsetX,
        y: l + this.offsetY,
        startAngle: m,
        endAngle: m + e,
        circumference: e,
        outerRadius: u,
        innerRadius: d
      };
      if (p) {
        o.options = g || this.resolveDataElementOptions(f, i.active ? "active" : s);
      }
      m += e;
      this.updateElement(i, f, o, s);
    }
  }
  calculateTotal() {
    const t = this._cachedMeta;
    const e = t.data;
    let i;
    let s = 0;
    for (i = 0; i < e.length; i++) {
      const n = t._parsed[i];
      if (n !== null && !isNaN(n) && !!this.chart.getDataVisibility(i) && !e[i].hidden) {
        s += Math.abs(n);
      }
    }
    return s;
  }
  calculateCircumference(t) {
    const e = this._cachedMeta.total;
    if (e > 0 && !isNaN(t)) {
      return y * (Math.abs(t) / e);
    } else {
      return 0;
    }
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta;
    const i = this.chart;
    const s = i.data.labels || [];
    const n = v(e._parsed[t], i.options.locale);
    return {
      label: s[t] || "",
      value: n
    };
  }
  getMaxBorderWidth(t) {
    let e = 0;
    const i = this.chart;
    let s;
    let n;
    let o;
    let a;
    let r;
    if (!t) {
      s = 0;
      n = i.data.datasets.length;
      for (; s < n; ++s) {
        if (i.isDatasetVisible(s)) {
          o = i.getDatasetMeta(s);
          t = o.data;
          a = o.controller;
          break;
        }
      }
    }
    if (!t) {
      return 0;
    }
    s = 0;
    n = t.length;
    for (; s < n; ++s) {
      r = a.resolveDataElementOptions(s);
      if (r.borderAlign !== "inner") {
        e = Math.max(e, r.borderWidth || 0, r.hoverBorderWidth || 0);
      }
    }
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
    for (let i = 0; i < t; ++i) {
      if (this.chart.isDatasetVisible(i)) {
        e += this._getRingWeight(i);
      }
    }
    return e;
  }
  _getRingWeight(t) {
    return Math.max(r(this.chart.data.datasets[t].weight, 1), 0);
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
class Ue extends Se {
  static id = "line";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    showLine: true,
    spanGaps: false
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
    this.enableOptionSharing = true;
    this.supportsDecimation = true;
    super.initialize();
  }
  update(t) {
    const e = this._cachedMeta;
    const {
      dataset: i,
      data: s = [],
      _dataset: n
    } = e;
    const o = this.chart._animationsDisabled;
    let {
      start: a,
      count: r
    } = S(e, s, o);
    this._drawStart = a;
    this._drawCount = r;
    if (D(e)) {
      a = 0;
      r = s.length;
    }
    i._chart = this.chart;
    i._datasetIndex = this.index;
    i._decimated = !!n._decimated;
    i.points = s;
    const h = this.resolveDatasetElementOptions(t);
    if (!this.options.showLine) {
      h.borderWidth = 0;
    }
    h.segment = this.options.segment;
    this.updateElement(i, undefined, {
      animated: !o,
      options: h
    }, t);
    this.updateElements(s, a, r, t);
  }
  updateElements(t, e, i, s) {
    const n = s === "reset";
    const {
      iScale: o,
      vScale: a,
      _stacked: r,
      _dataset: h
    } = this._cachedMeta;
    const {
      sharedOptions: l,
      includeOptions: c
    } = this._getSharedOptions(e, s);
    const d = o.axis;
    const u = a.axis;
    const {
      spanGaps: g,
      segment: p
    } = this.options;
    const m = P(g) ? g : Number.POSITIVE_INFINITY;
    const x = this.chart._animationsDisabled || n || s === "none";
    const b = e + i;
    const _ = t.length;
    let y = e > 0 && this.getParsed(e - 1);
    for (let i = 0; i < _; ++i) {
      const g = t[i];
      const _ = x ? g : {};
      if (i < e || i >= b) {
        _.skip = true;
        continue;
      }
      const v = this.getParsed(i);
      const M = f(v[u]);
      const w = _[d] = o.getPixelForValue(v[d], i);
      const k = _[u] = n || M ? a.getBasePixel() : a.getPixelForValue(r ? this.applyStack(a, v, r) : v[u], i);
      _.skip = isNaN(w) || isNaN(k) || M;
      _.stop = i > 0 && Math.abs(v[d] - y[d]) > m;
      if (p) {
        _.parsed = v;
        _.raw = h.data[i];
      }
      if (c) {
        _.options = l || this.resolveDataElementOptions(i, g.active ? "active" : s);
      }
      if (!x) {
        this.updateElement(g, i, _, s);
      }
      y = v;
    }
  }
  getMaxOverflow() {
    const t = this._cachedMeta;
    const e = t.dataset;
    const i = e.options && e.options.borderWidth || 0;
    const s = t.data || [];
    if (!s.length) {
      return i;
    }
    const n = s[0].size(this.resolveDataElementOptions(0));
    const o = s[s.length - 1].size(this.resolveDataElementOptions(s.length - 1));
    return Math.max(i, n, o) / 2;
  }
  draw() {
    const t = this._cachedMeta;
    t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis);
    super.draw();
  }
}
class Ye extends Se {
  static id = "polarArea";
  static defaults = {
    dataElementType: "arc",
    animation: {
      animateRotate: true,
      animateScale: true
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
          i.chart.toggleDataVisibility(e.index);
          i.chart.update();
        }
      }
    },
    scales: {
      r: {
        type: "radialLinear",
        angleLines: {
          display: false
        },
        beginAtZero: true,
        grid: {
          circular: true
        },
        pointLabels: {
          display: false
        },
        startAngle: 0
      }
    }
  };
  constructor(t, e) {
    super(t, e);
    this.innerRadius = undefined;
    this.outerRadius = undefined;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta;
    const i = this.chart;
    const s = i.data.labels || [];
    const n = v(e._parsed[t].r, i.options.locale);
    return {
      label: s[t] || "",
      value: n
    };
  }
  parseObjectData(t, e, i, s) {
    return C.bind(this)(t, e, i, s);
  }
  update(t) {
    const e = this._cachedMeta.data;
    this._updateRadius();
    this.updateElements(e, 0, e.length, t);
  }
  getMinMax() {
    const t = this._cachedMeta;
    const e = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };
    t.data.forEach((t, i) => {
      const s = this.getParsed(i).r;
      if (!isNaN(s) && this.chart.getDataVisibility(i)) {
        if (s < e.min) {
          e.min = s;
        }
        if (s > e.max) {
          e.max = s;
        }
      }
    });
    return e;
  }
  _updateRadius() {
    const t = this.chart;
    const e = t.chartArea;
    const i = t.options;
    const s = Math.min(e.right - e.left, e.bottom - e.top);
    const n = Math.max(s / 2, 0);
    const o = (n - Math.max(i.cutoutPercentage ? n / 100 * i.cutoutPercentage : 1, 0)) / t.getVisibleDatasetCount();
    this.outerRadius = n - o * this.index;
    this.innerRadius = this.outerRadius - o;
  }
  updateElements(t, e, i, s) {
    const n = s === "reset";
    const o = this.chart;
    const a = o.options.animation;
    const r = this._cachedMeta.rScale;
    const h = r.xCenter;
    const l = r.yCenter;
    const c = r.getIndexAngle(0) - k * 0.5;
    let d;
    let u = c;
    const g = 360 / this.countVisibleElements();
    for (d = 0; d < e; ++d) {
      u += this._computeAngle(d, s, g);
    }
    for (d = e; d < e + i; d++) {
      const e = t[d];
      let i = u;
      let p = u + this._computeAngle(d, s, g);
      let f = o.getDataVisibility(d) ? r.getDistanceFromCenterForValue(this.getParsed(d).r) : 0;
      u = p;
      if (n) {
        if (a.animateScale) {
          f = 0;
        }
        if (a.animateRotate) {
          i = p = c;
        }
      }
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
    t.data.forEach((t, i) => {
      if (!isNaN(this.getParsed(i).r) && this.chart.getDataVisibility(i)) {
        e++;
      }
    });
    return e;
  }
  _computeAngle(t, e, i) {
    if (this.chart.getDataVisibility(t)) {
      return x(this.resolveDataElementOptions(t, e).angle || i);
    } else {
      return 0;
    }
  }
}
class Xe extends $e {
  static id = "pie";
  static defaults = {
    cutout: 0,
    rotation: 0,
    circumference: 360,
    radius: "100%"
  };
}
class Ge extends Se {
  static id = "radar";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    indexAxis: "r",
    showLine: true,
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
    const e = this._cachedMeta.vScale;
    const i = this.getParsed(t);
    return {
      label: e.getLabels()[t],
      value: "" + e.getLabelForValue(i[e.axis])
    };
  }
  parseObjectData(t, e, i, s) {
    return C.bind(this)(t, e, i, s);
  }
  update(t) {
    const e = this._cachedMeta;
    const i = e.dataset;
    const s = e.data || [];
    const n = e.iScale.getLabels();
    i.points = s;
    if (t !== "resize") {
      const e = this.resolveDatasetElementOptions(t);
      if (!this.options.showLine) {
        e.borderWidth = 0;
      }
      const o = {
        _loop: true,
        _fullLoop: n.length === s.length,
        options: e
      };
      this.updateElement(i, undefined, o, t);
    }
    this.updateElements(s, 0, s.length, t);
  }
  updateElements(t, e, i, s) {
    const n = this._cachedMeta.rScale;
    const o = s === "reset";
    for (let a = e; a < e + i; a++) {
      const e = t[a];
      const i = this.resolveDataElementOptions(a, e.active ? "active" : s);
      const r = n.getPointPositionForValue(a, this.getParsed(a).r);
      const h = o ? n.xCenter : r.x;
      const l = o ? n.yCenter : r.y;
      const c = {
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
class Ke extends Se {
  static id = "scatter";
  static defaults = {
    datasetElementType: false,
    dataElementType: "point",
    showLine: false,
    fill: false
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
    const e = this._cachedMeta;
    const i = this.chart.data.labels || [];
    const {
      xScale: s,
      yScale: n
    } = e;
    const o = this.getParsed(t);
    const a = s.getLabelForValue(o.x);
    const r = n.getLabelForValue(o.y);
    return {
      label: i[t] || "",
      value: "(" + a + ", " + r + ")"
    };
  }
  update(t) {
    const e = this._cachedMeta;
    const {
      data: i = []
    } = e;
    const s = this.chart._animationsDisabled;
    let {
      start: n,
      count: o
    } = S(e, i, s);
    this._drawStart = n;
    this._drawCount = o;
    if (D(e)) {
      n = 0;
      o = i.length;
    }
    if (this.options.showLine) {
      if (!this.datasetElementType) {
        this.addElements();
      }
      const {
        dataset: n,
        _dataset: o
      } = e;
      n._chart = this.chart;
      n._datasetIndex = this.index;
      n._decimated = !!o._decimated;
      n.points = i;
      const a = this.resolveDatasetElementOptions(t);
      a.segment = this.options.segment;
      this.updateElement(n, undefined, {
        animated: !s,
        options: a
      }, t);
    } else if (this.datasetElementType) {
      delete e.dataset;
      this.datasetElementType = false;
    }
    this.updateElements(i, n, o, t);
  }
  addElements() {
    const {
      showLine: t
    } = this.options;
    if (!this.datasetElementType && t) {
      this.datasetElementType = this.chart.registry.getElement("line");
    }
    super.addElements();
  }
  updateElements(t, e, i, s) {
    const n = s === "reset";
    const {
      iScale: o,
      vScale: a,
      _stacked: r,
      _dataset: h
    } = this._cachedMeta;
    const l = this.resolveDataElementOptions(e, s);
    const c = this.getSharedOptions(l);
    const d = this.includeOptions(s, c);
    const u = o.axis;
    const g = a.axis;
    const {
      spanGaps: p,
      segment: m
    } = this.options;
    const x = P(p) ? p : Number.POSITIVE_INFINITY;
    const b = this.chart._animationsDisabled || n || s === "none";
    let _ = e > 0 && this.getParsed(e - 1);
    for (let l = e; l < e + i; ++l) {
      const e = t[l];
      const i = this.getParsed(l);
      const p = b ? e : {};
      const y = f(i[g]);
      const v = p[u] = o.getPixelForValue(i[u], l);
      const M = p[g] = n || y ? a.getBasePixel() : a.getPixelForValue(r ? this.applyStack(a, i, r) : i[g], l);
      p.skip = isNaN(v) || isNaN(M) || y;
      p.stop = l > 0 && Math.abs(i[u] - _[u]) > x;
      if (m) {
        p.parsed = i;
        p.raw = h.data[l];
      }
      if (d) {
        p.options = c || this.resolveDataElementOptions(l, e.active ? "active" : s);
      }
      if (!b) {
        this.updateElement(e, l, p, s);
      }
      _ = i;
    }
    this.updateSharedOptions(c, s, l);
  }
  getMaxOverflow() {
    const t = this._cachedMeta;
    const e = t.data || [];
    if (!this.options.showLine) {
      let t = 0;
      for (let i = e.length - 1; i >= 0; --i) {
        t = Math.max(t, e[i].size(this.resolveDataElementOptions(i)) / 2);
      }
      return t > 0 && t;
    }
    const i = t.dataset;
    const s = i.options && i.options.borderWidth || 0;
    if (!e.length) {
      return s;
    }
    const n = e[0].size(this.resolveDataElementOptions(0));
    const o = e[e.length - 1].size(this.resolveDataElementOptions(e.length - 1));
    return Math.max(s, n, o) / 2;
  }
}
var qe = Object.freeze({
  __proto__: null,
  BarController: We,
  BubbleController: He,
  DoughnutController: $e,
  LineController: Ue,
  PieController: Xe,
  PolarAreaController: Ye,
  RadarController: Ge,
  ScatterController: Ke
});
function Je() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
class Ze {
  static override(t) {
    Object.assign(Ze.prototype, t);
  }
  options;
  constructor(t) {
    this.options = t || {};
  }
  init() {}
  formats() {
    return Je();
  }
  parse() {
    return Je();
  }
  format() {
    return Je();
  }
  add() {
    return Je();
  }
  diff() {
    return Je();
  }
  startOf() {
    return Je();
  }
  endOf() {
    return Je();
  }
}
var Qe = {
  _date: Ze
};
function ti(t, e, i, s) {
  const {
    controller: n,
    data: o,
    _sorted: a
  } = t;
  const r = n._cachedMeta.iScale;
  if (r && e === r.axis && e !== "r" && a && o.length) {
    const t = r._reversePixels ? L : O;
    if (!s) {
      return t(o, e, i);
    }
    if (n._sharedOptions) {
      const s = o[0];
      const n = typeof s.getRange == "function" && s.getRange(e);
      if (n) {
        const s = t(o, e, i - n);
        const a = t(o, e, i + n);
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
function ei(t, e, i, s, n) {
  const o = t.getSortedVisibleDatasetMetas();
  const a = i[e];
  for (let t = 0, i = o.length; t < i; ++t) {
    const {
      index: i,
      data: r
    } = o[t];
    const {
      lo: h,
      hi: l
    } = ti(o[t], e, a, n);
    for (let t = h; t <= l; ++t) {
      const e = r[t];
      if (!e.skip) {
        s(e, i, t);
      }
    }
  }
}
function ii(t) {
  const e = t.indexOf("x") !== -1;
  const i = t.indexOf("y") !== -1;
  return function (t, s) {
    const n = e ? Math.abs(t.x - s.x) : 0;
    const o = i ? Math.abs(t.y - s.y) : 0;
    return Math.sqrt(Math.pow(n, 2) + Math.pow(o, 2));
  };
}
function si(t, e, i, s, n) {
  const o = [];
  if (!n && !t.isPointInArea(e)) {
    return o;
  }
  ei(t, i, e, function (i, a, r) {
    if ((n || E(i, t.chartArea, 0)) && i.inRange(e.x, e.y, s)) {
      o.push({
        element: i,
        datasetIndex: a,
        index: r
      });
    }
  }, true);
  return o;
}
function ni(t, e, i, s) {
  let n = [];
  ei(t, i, e, function (t, i, o) {
    const {
      startAngle: a,
      endAngle: r
    } = t.getProps(["startAngle", "endAngle"], s);
    const {
      angle: h
    } = T(t, {
      x: e.x,
      y: e.y
    });
    if (M(h, a, r)) {
      n.push({
        element: t,
        datasetIndex: i,
        index: o
      });
    }
  });
  return n;
}
function oi(t, e, i, s, n, o) {
  let a = [];
  const r = ii(i);
  let h = Number.POSITIVE_INFINITY;
  ei(t, i, e, function (i, l, c) {
    const d = i.inRange(e.x, e.y, n);
    if (s && !d) {
      return;
    }
    const u = i.getCenterPoint(n);
    if (!o && !t.isPointInArea(u) && !d) {
      return;
    }
    const g = r(e, u);
    if (g < h) {
      a = [{
        element: i,
        datasetIndex: l,
        index: c
      }];
      h = g;
    } else if (g === h) {
      a.push({
        element: i,
        datasetIndex: l,
        index: c
      });
    }
  });
  return a;
}
function ai(t, e, i, s, n, o) {
  if (o || t.isPointInArea(e)) {
    if (i !== "r" || s) {
      return oi(t, e, i, s, n, o);
    } else {
      return ni(t, e, i, n);
    }
  } else {
    return [];
  }
}
function ri(t, e, i, s, n) {
  const o = [];
  const a = i === "x" ? "inXRange" : "inYRange";
  let r = false;
  ei(t, i, e, (t, s, h) => {
    if (t[a](e[i], n)) {
      o.push({
        element: t,
        datasetIndex: s,
        index: h
      });
      r = r || t.inRange(e.x, e.y, n);
    }
  });
  if (s && !r) {
    return [];
  } else {
    return o;
  }
}
var hi = {
  evaluateInteractionItems: ei,
  modes: {
    index(t, e, i, s) {
      const n = A(e, t);
      const o = i.axis || "x";
      const a = i.includeInvisible || false;
      const r = i.intersect ? si(t, n, o, s, a) : ai(t, n, o, false, s, a);
      const h = [];
      if (r.length) {
        t.getSortedVisibleDatasetMetas().forEach(t => {
          const e = r[0].index;
          const i = t.data[e];
          if (i && !i.skip) {
            h.push({
              element: i,
              datasetIndex: t.index,
              index: e
            });
          }
        });
        return h;
      } else {
        return [];
      }
    },
    dataset(t, e, i, s) {
      const n = A(e, t);
      const o = i.axis || "xy";
      const a = i.includeInvisible || false;
      let r = i.intersect ? si(t, n, o, s, a) : ai(t, n, o, false, s, a);
      if (r.length > 0) {
        const e = r[0].datasetIndex;
        const i = t.getDatasetMeta(e).data;
        r = [];
        for (let t = 0; t < i.length; ++t) {
          r.push({
            element: i[t],
            datasetIndex: e,
            index: t
          });
        }
      }
      return r;
    },
    point: (t, e, i, s) => si(t, A(e, t), i.axis || "xy", s, i.includeInvisible || false),
    nearest(t, e, i, s) {
      const n = A(e, t);
      const o = i.axis || "xy";
      const a = i.includeInvisible || false;
      return ai(t, n, o, i.intersect, s, a);
    },
    x: (t, e, i, s) => ri(t, A(e, t), "x", i.intersect, s),
    y: (t, e, i, s) => ri(t, A(e, t), "y", i.intersect, s)
  }
};
const li = ["left", "top", "right", "bottom"];
function ci(t, e) {
  return t.filter(t => t.pos === e);
}
function di(t, e) {
  return t.filter(t => li.indexOf(t.pos) === -1 && t.box.axis === e);
}
function ui(t, e) {
  return t.sort((t, i) => {
    const s = e ? i : t;
    const n = e ? t : i;
    if (s.weight === n.weight) {
      return s.index - n.index;
    } else {
      return s.weight - n.weight;
    }
  });
}
function gi(t) {
  const e = [];
  let i;
  let s;
  let n;
  let o;
  let a;
  let r;
  i = 0;
  s = (t || []).length;
  for (; i < s; ++i) {
    n = t[i];
    ({
      position: o,
      options: {
        stack: a,
        stackWeight: r = 1
      }
    } = n);
    e.push({
      index: i,
      box: n,
      pos: o,
      horizontal: n.isHorizontal(),
      weight: n.weight,
      stack: a && o + a,
      stackWeight: r
    });
  }
  return e;
}
function pi(t) {
  const e = {};
  for (const i of t) {
    const {
      stack: t,
      pos: s,
      stackWeight: n
    } = i;
    if (!t || !li.includes(s)) {
      continue;
    }
    const o = e[t] ||= {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    };
    o.count++;
    o.weight += n;
  }
  return e;
}
function fi(t, e) {
  const i = pi(t);
  const {
    vBoxMaxWidth: s,
    hBoxMaxHeight: n
  } = e;
  let o;
  let a;
  let r;
  o = 0;
  a = t.length;
  for (; o < a; ++o) {
    r = t[o];
    const {
      fullSize: a
    } = r.box;
    const h = i[r.stack];
    const l = h && r.stackWeight / h.weight;
    if (r.horizontal) {
      r.width = l ? l * s : a && e.availableWidth;
      r.height = n;
    } else {
      r.width = s;
      r.height = l ? l * n : a && e.availableHeight;
    }
  }
  return i;
}
function mi(t) {
  const e = gi(t);
  const i = ui(e.filter(t => t.box.fullSize), true);
  const s = ui(ci(e, "left"), true);
  const n = ui(ci(e, "right"));
  const o = ui(ci(e, "top"), true);
  const a = ui(ci(e, "bottom"));
  const r = di(e, "x");
  const h = di(e, "y");
  return {
    fullSize: i,
    leftAndTop: s.concat(o),
    rightAndBottom: n.concat(h).concat(a).concat(r),
    chartArea: ci(e, "chartArea"),
    vertical: s.concat(n).concat(h),
    horizontal: o.concat(a).concat(r)
  };
}
function xi(t, e, i, s) {
  return Math.max(t[i], e[i]) + Math.max(t[s], e[s]);
}
function bi(t, e) {
  t.top = Math.max(t.top, e.top);
  t.left = Math.max(t.left, e.left);
  t.bottom = Math.max(t.bottom, e.bottom);
  t.right = Math.max(t.right, e.right);
}
function _i(t, e, i, s) {
  const {
    pos: o,
    box: a
  } = i;
  const r = t.maxPadding;
  if (!n(o)) {
    if (i.size) {
      t[o] -= i.size;
    }
    const e = s[i.stack] || {
      size: 0,
      count: 1
    };
    e.size = Math.max(e.size, i.horizontal ? a.height : a.width);
    i.size = e.size / e.count;
    t[o] += i.size;
  }
  if (a.getPadding) {
    bi(r, a.getPadding());
  }
  const h = Math.max(0, e.outerWidth - xi(r, t, "left", "right"));
  const l = Math.max(0, e.outerHeight - xi(r, t, "top", "bottom"));
  const c = h !== t.w;
  const d = l !== t.h;
  t.w = h;
  t.h = l;
  if (i.horizontal) {
    return {
      same: c,
      other: d
    };
  } else {
    return {
      same: d,
      other: c
    };
  }
}
function yi(t) {
  const e = t.maxPadding;
  function i(i) {
    const s = Math.max(e[i] - t[i], 0);
    t[i] += s;
    return s;
  }
  t.y += i("top");
  t.x += i("left");
  i("right");
  i("bottom");
}
function vi(t, e) {
  const i = e.maxPadding;
  function s(t) {
    const s = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    t.forEach(t => {
      s[t] = Math.max(e[t], i[t]);
    });
    return s;
  }
  return s(t ? ["left", "right"] : ["top", "bottom"]);
}
function Mi(t, e, i, s) {
  const n = [];
  let o;
  let a;
  let r;
  let h;
  let l;
  let c;
  o = 0;
  a = t.length;
  l = 0;
  for (; o < a; ++o) {
    r = t[o];
    h = r.box;
    h.update(r.width || e.w, r.height || e.h, vi(r.horizontal, e));
    const {
      same: a,
      other: d
    } = _i(e, i, r, s);
    l |= a && n.length;
    c = c || d;
    if (!h.fullSize) {
      n.push(r);
    }
  }
  return l && Mi(n, e, i, s) || c;
}
function wi(t, e, i, s, n) {
  t.top = i;
  t.left = e;
  t.right = e + s;
  t.bottom = i + n;
  t.width = s;
  t.height = n;
}
function ki(t, e, i, s) {
  const n = i.padding;
  let {
    x: o,
    y: a
  } = e;
  for (const r of t) {
    const t = r.box;
    const h = s[r.stack] || {
      count: 1,
      placed: 0,
      weight: 1
    };
    const l = r.stackWeight / h.weight || 1;
    if (r.horizontal) {
      const s = e.w * l;
      const o = h.size || t.height;
      if (u(h.start)) {
        a = h.start;
      }
      if (t.fullSize) {
        wi(t, n.left, a, i.outerWidth - n.right - n.left, o);
      } else {
        wi(t, e.left + h.placed, a, s, o);
      }
      h.start = a;
      h.placed += s;
      a = t.bottom;
    } else {
      const s = e.h * l;
      const a = h.size || t.width;
      if (u(h.start)) {
        o = h.start;
      }
      if (t.fullSize) {
        wi(t, o, n.top, a, i.outerHeight - n.bottom - n.top);
      } else {
        wi(t, o, e.top + h.placed, a, s);
      }
      h.start = o;
      h.placed += s;
      o = t.right;
    }
  }
  e.x = o;
  e.y = a;
}
var Si = {
  addBox(t, e) {
    t.boxes ||= [];
    e.fullSize = e.fullSize || false;
    e.position = e.position || "top";
    e.weight = e.weight || 0;
    e._layers = e._layers || function () {
      return [{
        z: 0,
        draw(t) {
          e.draw(t);
        }
      }];
    };
    t.boxes.push(e);
  },
  removeBox(t, e) {
    const i = t.boxes ? t.boxes.indexOf(e) : -1;
    if (i !== -1) {
      t.boxes.splice(i, 1);
    }
  },
  configure(t, e, i) {
    e.fullSize = i.fullSize;
    e.position = i.position;
    e.weight = i.weight;
  },
  update(t, e, i, s) {
    if (!t) {
      return;
    }
    const n = R(t.options.layout.padding);
    const o = Math.max(e - n.width, 0);
    const a = Math.max(i - n.height, 0);
    const r = mi(t.boxes);
    const h = r.vertical;
    const l = r.horizontal;
    z(t.boxes, t => {
      if (typeof t.beforeLayout == "function") {
        t.beforeLayout();
      }
    });
    const c = h.reduce((t, e) => e.box.options && e.box.options.display === false ? t : t + 1, 0) || 1;
    const d = Object.freeze({
      outerWidth: e,
      outerHeight: i,
      padding: n,
      availableWidth: o,
      availableHeight: a,
      vBoxMaxWidth: o / 2 / c,
      hBoxMaxHeight: a / 2
    });
    const u = Object.assign({}, n);
    bi(u, R(s));
    const g = Object.assign({
      maxPadding: u,
      w: o,
      h: a,
      x: n.left,
      y: n.top
    }, n);
    const p = fi(h.concat(l), d);
    Mi(r.fullSize, g, d, p);
    Mi(h, g, d, p);
    if (Mi(l, g, d, p)) {
      Mi(h, g, d, p);
    }
    yi(g);
    ki(r.leftAndTop, g, d, p);
    g.x += g.w;
    g.y += g.h;
    ki(r.rightAndBottom, g, d, p);
    t.chartArea = {
      left: g.left,
      top: g.top,
      right: g.left + g.w,
      bottom: g.top + g.h,
      height: g.h,
      width: g.w
    };
    z(r.chartArea, e => {
      const i = e.box;
      Object.assign(i, t.chartArea);
      i.update(g.w, g.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
class Di {
  acquireContext(t, e) {}
  releaseContext(t) {
    return false;
  }
  addEventListener(t, e, i) {}
  removeEventListener(t, e, i) {}
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(t, e, i, s) {
    e = Math.max(0, e || t.width);
    i = i || t.height;
    return {
      width: e,
      height: Math.max(0, s ? Math.floor(e / s) : i)
    };
  }
  isAttached(t) {
    return true;
  }
  updateConfig(t) {}
}
class Pi extends Di {
  acquireContext(t) {
    return t && t.getContext && t.getContext("2d") || null;
  }
  updateConfig(t) {
    t.options.animation = false;
  }
}
const Ci = "$chartjs";
const Ai = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
};
const Li = t => t === null || t === "";
function Oi(t, e) {
  const i = t.style;
  const s = t.getAttribute("height");
  const n = t.getAttribute("width");
  t[Ci] = {
    initial: {
      height: s,
      width: n,
      style: {
        display: i.display,
        height: i.height,
        width: i.width
      }
    }
  };
  i.display = i.display || "block";
  i.boxSizing = i.boxSizing || "border-box";
  if (Li(n)) {
    const e = V(t, "width");
    if (e !== undefined) {
      t.width = e;
    }
  }
  if (Li(s)) {
    if (t.style.height === "") {
      t.height = t.width / (e || 2);
    } else {
      const e = V(t, "height");
      if (e !== undefined) {
        t.height = e;
      }
    }
  }
  return t;
}
const Ei = !!B && {
  passive: true
};
function Ti(t, e, i) {
  t.addEventListener(e, i, Ei);
}
function Ri(t, e, i) {
  t.canvas.removeEventListener(e, i, Ei);
}
function zi(t, e) {
  const i = Ai[t.type] || t.type;
  const {
    x: s,
    y: n
  } = A(t, e);
  return {
    type: i,
    chart: e,
    native: t,
    x: s !== undefined ? s : null,
    y: n !== undefined ? n : null
  };
}
function Ii(t, e) {
  for (const i of t) {
    if (i === e || i.contains(e)) {
      return true;
    }
  }
}
function Fi(t, e, i) {
  const s = t.canvas;
  const n = new MutationObserver(t => {
    let e = false;
    for (const i of t) {
      e = e || Ii(i.addedNodes, s);
      e = e && !Ii(i.removedNodes, s);
    }
    if (e) {
      i();
    }
  });
  n.observe(document, {
    childList: true,
    subtree: true
  });
  return n;
}
function Vi(t, e, i) {
  const s = t.canvas;
  const n = new MutationObserver(t => {
    let e = false;
    for (const i of t) {
      e = e || Ii(i.removedNodes, s);
      e = e && !Ii(i.addedNodes, s);
    }
    if (e) {
      i();
    }
  });
  n.observe(document, {
    childList: true,
    subtree: true
  });
  return n;
}
const Bi = new Map();
let Ni = 0;
function Wi() {
  const t = window.devicePixelRatio;
  if (t !== Ni) {
    Ni = t;
    Bi.forEach((e, i) => {
      if (i.currentDevicePixelRatio !== t) {
        e();
      }
    });
  }
}
function Hi(t, e) {
  if (!Bi.size) {
    window.addEventListener("resize", Wi);
  }
  Bi.set(t, e);
}
function ji(t) {
  Bi.delete(t);
  if (!Bi.size) {
    window.removeEventListener("resize", Wi);
  }
}
function $i(t, e, i) {
  const s = t.canvas;
  const n = s && F(s);
  if (!n) {
    return;
  }
  const o = N((t, e) => {
    const s = n.clientWidth;
    i(t, e);
    if (s < n.clientWidth) {
      i();
    }
  }, window);
  const a = new ResizeObserver(t => {
    const e = t[0];
    const i = e.contentRect.width;
    const s = e.contentRect.height;
    if (i !== 0 || s !== 0) {
      o(i, s);
    }
  });
  a.observe(n);
  Hi(t, o);
  return a;
}
function Ui(t, e, i) {
  if (i) {
    i.disconnect();
  }
  if (e === "resize") {
    ji(t);
  }
}
function Yi(t, e, i) {
  const s = t.canvas;
  const n = N(e => {
    if (t.ctx !== null) {
      i(zi(e, t));
    }
  }, t);
  Ti(s, e, n);
  return n;
}
class Xi extends Di {
  acquireContext(t, e) {
    const i = t && t.getContext && t.getContext("2d");
    if (i && i.canvas === t) {
      Oi(t, e);
      return i;
    } else {
      return null;
    }
  }
  releaseContext(t) {
    const e = t.canvas;
    if (!e[Ci]) {
      return false;
    }
    const i = e[Ci].initial;
    ["height", "width"].forEach(t => {
      const s = i[t];
      if (f(s)) {
        e.removeAttribute(t);
      } else {
        e.setAttribute(t, s);
      }
    });
    const s = i.style || {};
    Object.keys(s).forEach(t => {
      e.style[t] = s[t];
    });
    e.width = e.width;
    delete e[Ci];
    return true;
  }
  addEventListener(t, e, i) {
    this.removeEventListener(t, e);
    const s = t.$proxies ||= {};
    const n = {
      attach: Fi,
      detach: Vi,
      resize: $i
    }[e] || Yi;
    s[e] = n(t, e, i);
  }
  removeEventListener(t, e) {
    const i = t.$proxies ||= {};
    const s = i[e];
    if (!s) {
      return;
    }
    ({
      attach: Ui,
      detach: Ui,
      resize: Ui
    }[e] || Ri)(t, e, s);
    i[e] = undefined;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(t, e, i, s) {
    return I(t, e, i, s);
  }
  isAttached(t) {
    const e = F(t);
    return !!e && !!e.isConnected;
  }
}
function Gi(t) {
  if (!W() || typeof OffscreenCanvas != "undefined" && t instanceof OffscreenCanvas) {
    return Pi;
  } else {
    return Xi;
  }
}
class Ki {
  static defaults = {};
  static defaultRoutes = undefined;
  x;
  y;
  active = false;
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
    return P(this.x) && P(this.y);
  }
  getProps(t, e) {
    const i = this.$animations;
    if (!e || !i) {
      return this;
    }
    const s = {};
    t.forEach(t => {
      s[t] = i[t] && i[t].active() ? i[t]._to : this[t];
    });
    return s;
  }
}
function qi(t, e) {
  const i = t.options.ticks;
  const s = Ji(t);
  const n = Math.min(i.maxTicksLimit || s, s);
  const o = i.major.enabled ? Qi(e) : [];
  const a = o.length;
  const r = o[0];
  const h = o[a - 1];
  const l = [];
  if (a > n) {
    ts(e, l, o, a / n);
    return l;
  }
  const c = Zi(o, e, n);
  if (a > 0) {
    let t;
    let i;
    const s = a > 1 ? Math.round((h - r) / (a - 1)) : null;
    es(e, l, c, f(s) ? 0 : r - s, r);
    t = 0;
    i = a - 1;
    for (; t < i; t++) {
      es(e, l, c, o[t], o[t + 1]);
    }
    es(e, l, c, h, f(s) ? e.length : h + s);
    return l;
  }
  es(e, l, c);
  return l;
}
function Ji(t) {
  const e = t.options.offset;
  const i = t._tickSize();
  const s = t._length / i + (e ? 0 : 1);
  const n = t._maxLength / i;
  return Math.floor(Math.min(s, n));
}
function Zi(t, e, i) {
  const s = is(t);
  const n = e.length / i;
  if (!s) {
    return Math.max(n, 1);
  }
  const o = H(s);
  for (let t = 0, e = o.length - 1; t < e; t++) {
    const e = o[t];
    if (e > n) {
      return e;
    }
  }
  return Math.max(n, 1);
}
function Qi(t) {
  const e = [];
  let i;
  let s;
  i = 0;
  s = t.length;
  for (; i < s; i++) {
    if (t[i].major) {
      e.push(i);
    }
  }
  return e;
}
function ts(t, e, i, s) {
  let n;
  let o = 0;
  let a = i[0];
  s = Math.ceil(s);
  n = 0;
  for (; n < t.length; n++) {
    if (n === a) {
      e.push(t[n]);
      o++;
      a = i[o * s];
    }
  }
}
function es(t, e, i, s, n) {
  const o = r(s, 0);
  const a = Math.min(r(n, t.length), t.length);
  let h;
  let l;
  let c;
  let d = 0;
  i = Math.ceil(i);
  if (n) {
    h = n - s;
    i = h / Math.floor(h / i);
  }
  c = o;
  while (c < 0) {
    d++;
    c = Math.round(o + d * i);
  }
  for (l = Math.max(o, 0); l < a; l++) {
    if (l === c) {
      e.push(t[l]);
      d++;
      c = Math.round(o + d * i);
    }
  }
}
function is(t) {
  const e = t.length;
  let i;
  let s;
  if (e < 2) {
    return false;
  }
  s = t[0];
  i = 1;
  for (; i < e; ++i) {
    if (t[i] - t[i - 1] !== s) {
      return false;
    }
  }
  return s;
}
const ss = t => t === "left" ? "right" : t === "right" ? "left" : t;
const ns = (t, e, i) => e === "top" || e === "left" ? t[e] + i : t[e] - i;
const os = (t, e) => Math.min(e || t, t);
function as(t, e) {
  const i = [];
  const s = t.length / e;
  const n = t.length;
  let o = 0;
  for (; o < n; o += s) {
    i.push(t[Math.floor(o)]);
  }
  return i;
}
function rs(t, e, i) {
  const s = t.ticks.length;
  const n = Math.min(e, s - 1);
  const o = t._startPixel;
  const a = t._endPixel;
  const r = 0.000001;
  let h;
  let l = t.getPixelForTick(n);
  if (!i || !(h = s === 1 ? Math.max(l - o, a - l) : e === 0 ? (t.getPixelForTick(1) - l) / 2 : (l - t.getPixelForTick(n - 1)) / 2, l += n < e ? h : -h, l < o - r || l > a + r)) {
    return l;
  }
}
function hs(t, e) {
  z(t, t => {
    const i = t.gc;
    const s = i.length / 2;
    let n;
    if (s > e) {
      for (n = 0; n < s; ++n) {
        delete t.data[i[n]];
      }
      i.splice(0, s);
    }
  });
}
function ls(t) {
  if (t.drawTicks) {
    return t.tickLength;
  } else {
    return 0;
  }
}
function cs(t, e) {
  if (!t.display) {
    return 0;
  }
  const i = tt(t.font, e);
  const s = R(t.padding);
  return (a(t.text) ? t.text.length : 1) * i.lineHeight + s.height;
}
function ds(t, e) {
  return p(t, {
    scale: e,
    type: "scale"
  });
}
function us(t, e, i) {
  return p(t, {
    tick: i,
    index: e,
    type: "tick"
  });
}
function gs(t, e, i) {
  let s = et(t);
  if (i && e !== "right" || !i && e === "right") {
    s = ss(s);
  }
  return s;
}
function ps(t, e, i, s) {
  const {
    top: o,
    left: a,
    bottom: r,
    right: h,
    chart: l
  } = t;
  const {
    chartArea: c,
    scales: d
  } = l;
  let u;
  let g;
  let p;
  let f = 0;
  const m = r - o;
  const x = h - a;
  if (t.isHorizontal()) {
    g = it(s, a, h);
    if (n(i)) {
      const t = Object.keys(i)[0];
      const s = i[t];
      p = d[t].getPixelForValue(s) + m - e;
    } else {
      p = i === "center" ? (c.bottom + c.top) / 2 + m - e : ns(t, i, e);
    }
    u = h - a;
  } else {
    if (n(i)) {
      const t = Object.keys(i)[0];
      const s = i[t];
      g = d[t].getPixelForValue(s) - x + e;
    } else {
      g = i === "center" ? (c.left + c.right) / 2 - x + e : ns(t, i, e);
    }
    p = it(s, r, o);
    f = i === "left" ? -w : w;
  }
  return {
    titleX: g,
    titleY: p,
    maxWidth: u,
    rotation: f
  };
}
class fs extends Ki {
  constructor(t) {
    super();
    this.id = t.id;
    this.type = t.type;
    this.options = undefined;
    this.ctx = t.ctx;
    this.chart = t.chart;
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
      bottom: 0
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
  init(t) {
    this.options = t.setContext(this.getContext());
    this.axis = t.axis;
    this._userMin = this.parse(t.min);
    this._userMax = this.parse(t.max);
    this._suggestedMin = this.parse(t.suggestedMin);
    this._suggestedMax = this.parse(t.suggestedMax);
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
    t = j(t, Number.POSITIVE_INFINITY);
    e = j(e, Number.NEGATIVE_INFINITY);
    i = j(i, Number.POSITIVE_INFINITY);
    s = j(s, Number.NEGATIVE_INFINITY);
    return {
      min: j(t, i),
      max: j(e, s),
      minDefined: d(t),
      maxDefined: d(e)
    };
  }
  getMinMax(t) {
    let e;
    let {
      min: i,
      max: s,
      minDefined: n,
      maxDefined: o
    } = this.getUserBounds();
    if (n && o) {
      return {
        min: i,
        max: s
      };
    }
    const a = this.getMatchingVisibleMetas();
    for (let r = 0, h = a.length; r < h; ++r) {
      e = a[r].controller.getMinMax(this, t);
      if (!n) {
        i = Math.min(i, e.min);
      }
      if (!o) {
        s = Math.max(s, e.max);
      }
    }
    i = o && i > s ? s : i;
    s = n && i > s ? i : s;
    return {
      min: j(i, j(s, i)),
      max: j(s, j(i, s))
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
    return this._labelItems ||= this._computeLabelItems(t);
  }
  beforeLayout() {
    this._cache = {};
    this._dataLimitsCached = false;
  }
  beforeUpdate() {
    $(this.options.beforeUpdate, [this]);
  }
  update(t, e, i) {
    const {
      beginAtZero: s,
      grace: n,
      ticks: o
    } = this.options;
    const a = o.sampleSize;
    this.beforeUpdate();
    this.maxWidth = t;
    this.maxHeight = e;
    this._margins = i = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, i);
    this.ticks = null;
    this._labelSizes = null;
    this._gridLineItems = null;
    this._labelItems = null;
    this.beforeSetDimensions();
    this.setDimensions();
    this.afterSetDimensions();
    this._maxLength = this.isHorizontal() ? this.width + i.left + i.right : this.height + i.top + i.bottom;
    if (!this._dataLimitsCached) {
      this.beforeDataLimits();
      this.determineDataLimits();
      this.afterDataLimits();
      this._range = U(this, n, s);
      this._dataLimitsCached = true;
    }
    this.beforeBuildTicks();
    this.ticks = this.buildTicks() || [];
    this.afterBuildTicks();
    const r = a < this.ticks.length;
    this._convertTicksToLabels(r ? as(this.ticks, a) : this.ticks);
    this.configure();
    this.beforeCalculateLabelRotation();
    this.calculateLabelRotation();
    this.afterCalculateLabelRotation();
    if (o.display && (o.autoSkip || o.source === "auto")) {
      this.ticks = qi(this, this.ticks);
      this._labelSizes = null;
      this.afterAutoSkip();
    }
    if (r) {
      this._convertTicksToLabels(this.ticks);
    }
    this.beforeFit();
    this.fit();
    this.afterFit();
    this.afterUpdate();
  }
  configure() {
    let t;
    let e;
    let i = this.options.reverse;
    if (this.isHorizontal()) {
      t = this.left;
      e = this.right;
    } else {
      t = this.top;
      e = this.bottom;
      i = !i;
    }
    this._startPixel = t;
    this._endPixel = e;
    this._reversePixels = i;
    this._length = e - t;
    this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    $(this.options.afterUpdate, [this]);
  }
  beforeSetDimensions() {
    $(this.options.beforeSetDimensions, [this]);
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
    $(this.options.afterSetDimensions, [this]);
  }
  _callHooks(t) {
    this.chart.notifyPlugins(t, this.getContext());
    $(this.options[t], [this]);
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
    $(this.options.beforeTickToLabelConversion, [this]);
  }
  generateTickLabels(t) {
    const e = this.options.ticks;
    let i;
    let s;
    let n;
    i = 0;
    s = t.length;
    for (; i < s; i++) {
      n = t[i];
      n.label = $(e.callback, [n.value, i, t], this);
    }
  }
  afterTickToLabelConversion() {
    $(this.options.afterTickToLabelConversion, [this]);
  }
  beforeCalculateLabelRotation() {
    $(this.options.beforeCalculateLabelRotation, [this]);
  }
  calculateLabelRotation() {
    const t = this.options;
    const e = t.ticks;
    const i = os(this.ticks.length, t.ticks.maxTicksLimit);
    const s = e.minRotation || 0;
    const n = e.maxRotation;
    let o;
    let a;
    let r;
    let h = s;
    if (!this._isVisible() || !e.display || s >= n || i <= 1 || !this.isHorizontal()) {
      this.labelRotation = s;
      return;
    }
    const l = this._getLabelSizes();
    const c = l.widest.width;
    const d = l.highest.height;
    const u = Y(this.chart.width - c, 0, this.maxWidth);
    o = t.offset ? this.maxWidth / i : u / (i - 1);
    if (c + 6 > o) {
      o = u / (i - (t.offset ? 0.5 : 1));
      a = this.maxHeight - ls(t.grid) - e.padding - cs(t.title, this.chart.options.font);
      r = Math.sqrt(c * c + d * d);
      h = X(Math.min(Math.asin(Y((l.highest.height + 6) / o, -1, 1)), Math.asin(Y(a / r, -1, 1)) - Math.asin(Y(d / r, -1, 1))));
      h = Math.max(s, Math.min(n, h));
    }
    this.labelRotation = h;
  }
  afterCalculateLabelRotation() {
    $(this.options.afterCalculateLabelRotation, [this]);
  }
  afterAutoSkip() {}
  beforeFit() {
    $(this.options.beforeFit, [this]);
  }
  fit() {
    const t = {
      width: 0,
      height: 0
    };
    const {
      chart: e,
      options: {
        ticks: i,
        title: s,
        grid: n
      }
    } = this;
    const o = this._isVisible();
    const a = this.isHorizontal();
    if (o) {
      const o = cs(s, e.options.font);
      if (a) {
        t.width = this.maxWidth;
        t.height = ls(n) + o;
      } else {
        t.height = this.maxHeight;
        t.width = ls(n) + o;
      }
      if (i.display && this.ticks.length) {
        const {
          first: e,
          last: s,
          widest: n,
          highest: o
        } = this._getLabelSizes();
        const r = i.padding * 2;
        const h = x(this.labelRotation);
        const l = Math.cos(h);
        const c = Math.sin(h);
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
    this._handleMargins();
    if (a) {
      this.width = this._length = e.width - this._margins.left - this._margins.right;
      this.height = t.height;
    } else {
      this.width = t.width;
      this.height = this._length = e.height - this._margins.top - this._margins.bottom;
    }
  }
  _calculatePadding(t, e, i, s) {
    const {
      ticks: {
        align: n,
        padding: o
      },
      position: a
    } = this.options;
    const r = this.labelRotation !== 0;
    const h = a !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const a = this.getPixelForTick(0) - this.left;
      const l = this.right - this.getPixelForTick(this.ticks.length - 1);
      let c = 0;
      let d = 0;
      if (r) {
        if (h) {
          c = s * t.width;
          d = i * e.height;
        } else {
          c = i * t.height;
          d = s * e.width;
        }
      } else if (n === "start") {
        d = e.width;
      } else if (n === "end") {
        c = t.width;
      } else if (n !== "inner") {
        c = t.width / 2;
        d = e.width / 2;
      }
      this.paddingLeft = Math.max((c - a + o) * this.width / (this.width - a), 0);
      this.paddingRight = Math.max((d - l + o) * this.width / (this.width - l), 0);
    } else {
      let i = e.height / 2;
      let s = t.height / 2;
      if (n === "start") {
        i = 0;
        s = t.height;
      } else if (n === "end") {
        i = e.height;
        s = 0;
      }
      this.paddingTop = i + o;
      this.paddingBottom = s + o;
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
    $(this.options.afterFit, [this]);
  }
  isHorizontal() {
    const {
      axis: t,
      position: e
    } = this.options;
    return e === "top" || e === "bottom" || t === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(t) {
    let e;
    let i;
    this.beforeTickToLabelConversion();
    this.generateTickLabels(t);
    e = 0;
    i = t.length;
    for (; e < i; e++) {
      if (f(t[e].label)) {
        t.splice(e, 1);
        i--;
        e--;
      }
    }
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let t = this._labelSizes;
    if (!t) {
      const e = this.options.ticks.sampleSize;
      let i = this.ticks;
      if (e < i.length) {
        i = as(i, e);
      }
      this._labelSizes = t = this._computeLabelSizes(i, i.length, this.options.ticks.maxTicksLimit);
    }
    return t;
  }
  _computeLabelSizes(t, e, i) {
    const {
      ctx: s,
      _longestTextCache: n
    } = this;
    const o = [];
    const r = [];
    const h = Math.floor(e / os(e, i));
    let l;
    let c;
    let d;
    let u;
    let g;
    let p;
    let m;
    let x;
    let b;
    let _;
    let y;
    let v = 0;
    let M = 0;
    for (l = 0; l < e; l += h) {
      u = t[l].label;
      g = this._resolveTickFontOptions(l);
      s.font = p = g.string;
      m = n[p] = n[p] || {
        data: {},
        gc: []
      };
      x = g.lineHeight;
      b = _ = 0;
      if (f(u) || a(u)) {
        if (a(u)) {
          c = 0;
          d = u.length;
          for (; c < d; ++c) {
            y = u[c];
            if (!f(y) && !a(y)) {
              b = G(s, m.data, m.gc, b, y);
              _ += x;
            }
          }
        }
      } else {
        b = G(s, m.data, m.gc, b, u);
        _ = x;
      }
      o.push(b);
      r.push(_);
      v = Math.max(b, v);
      M = Math.max(_, M);
    }
    hs(n, e);
    const w = o.indexOf(v);
    const k = r.indexOf(M);
    const S = t => ({
      width: o[t] || 0,
      height: r[t] || 0
    });
    return {
      first: S(0),
      last: S(e - 1),
      widest: S(w),
      highest: S(k),
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
    if (t < 0 || t > e.length - 1) {
      return null;
    } else {
      return this.getPixelForValue(e[t].value);
    }
  }
  getPixelForDecimal(t) {
    if (this._reversePixels) {
      t = 1 - t;
    }
    const e = this._startPixel + t * this._length;
    return K(this._alignToPixels ? q(this.chart, e, 0) : e);
  }
  getDecimalForPixel(t) {
    const e = (t - this._startPixel) / this._length;
    if (this._reversePixels) {
      return 1 - e;
    } else {
      return e;
    }
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const {
      min: t,
      max: e
    } = this;
    if (t < 0 && e < 0) {
      return e;
    } else if (t > 0 && e > 0) {
      return t;
    } else {
      return 0;
    }
  }
  getContext(t) {
    const e = this.ticks || [];
    if (t >= 0 && t < e.length) {
      const i = e[t];
      return i.$context ||= us(this.getContext(), t, i);
    }
    return this.$context ||= ds(this.chart.getContext(), this);
  }
  _tickSize() {
    const t = this.options.ticks;
    const e = x(this.labelRotation);
    const i = Math.abs(Math.cos(e));
    const s = Math.abs(Math.sin(e));
    const n = this._getLabelSizes();
    const o = t.autoSkipPadding || 0;
    const a = n ? n.widest.width + o : 0;
    const r = n ? n.highest.height + o : 0;
    if (this.isHorizontal()) {
      if (r * i > a * s) {
        return a / i;
      } else {
        return r / s;
      }
    } else if (r * s < a * i) {
      return r / i;
    } else {
      return a / s;
    }
  }
  _isVisible() {
    const t = this.options.display;
    if (t !== "auto") {
      return !!t;
    } else {
      return this.getMatchingVisibleMetas().length > 0;
    }
  }
  _computeGridLineItems(t) {
    const e = this.axis;
    const i = this.chart;
    const s = this.options;
    const {
      grid: o,
      position: a,
      border: h
    } = s;
    const l = o.offset;
    const c = this.isHorizontal();
    const d = this.ticks.length + (l ? 1 : 0);
    const u = ls(o);
    const g = [];
    const p = h.setContext(this.getContext());
    const f = p.display ? p.width : 0;
    const m = f / 2;
    const x = function (t) {
      return q(i, t, f);
    };
    let b;
    let _;
    let y;
    let v;
    let M;
    let w;
    let k;
    let S;
    let D;
    let P;
    let C;
    let A;
    if (a === "top") {
      b = x(this.bottom);
      w = this.bottom - u;
      S = b - m;
      P = x(t.top) + m;
      A = t.bottom;
    } else if (a === "bottom") {
      b = x(this.top);
      P = t.top;
      A = x(t.bottom) - m;
      w = b + m;
      S = this.top + u;
    } else if (a === "left") {
      b = x(this.right);
      M = this.right - u;
      k = b - m;
      D = x(t.left) + m;
      C = t.right;
    } else if (a === "right") {
      b = x(this.left);
      D = t.left;
      C = x(t.right) - m;
      M = b + m;
      k = this.left + u;
    } else if (e === "x") {
      if (a === "center") {
        b = x((t.top + t.bottom) / 2 + 0.5);
      } else if (n(a)) {
        const t = Object.keys(a)[0];
        const e = a[t];
        b = x(this.chart.scales[t].getPixelForValue(e));
      }
      P = t.top;
      A = t.bottom;
      w = b + m;
      S = w + u;
    } else if (e === "y") {
      if (a === "center") {
        b = x((t.left + t.right) / 2);
      } else if (n(a)) {
        const t = Object.keys(a)[0];
        const e = a[t];
        b = x(this.chart.scales[t].getPixelForValue(e));
      }
      M = b - m;
      k = M - u;
      D = t.left;
      C = t.right;
    }
    const L = r(s.ticks.maxTicksLimit, d);
    const O = Math.max(1, Math.ceil(d / L));
    for (_ = 0; _ < d; _ += O) {
      const t = this.getContext(_);
      const e = o.setContext(t);
      const s = h.setContext(t);
      const n = e.lineWidth;
      const a = e.color;
      const r = s.dash || [];
      const d = s.dashOffset;
      const u = e.tickWidth;
      const p = e.tickColor;
      const f = e.tickBorderDash || [];
      const m = e.tickBorderDashOffset;
      y = rs(this, _, l);
      if (y !== undefined) {
        v = q(i, y, n);
        if (c) {
          M = k = D = C = v;
        } else {
          w = S = P = A = v;
        }
        g.push({
          tx1: M,
          ty1: w,
          tx2: k,
          ty2: S,
          x1: D,
          y1: P,
          x2: C,
          y2: A,
          width: n,
          color: a,
          borderDash: r,
          borderDashOffset: d,
          tickWidth: u,
          tickColor: p,
          tickBorderDash: f,
          tickBorderDashOffset: m
        });
      }
    }
    this._ticksLength = d;
    this._borderValue = b;
    return g;
  }
  _computeLabelItems(t) {
    const e = this.axis;
    const i = this.options;
    const {
      position: s,
      ticks: o
    } = i;
    const r = this.isHorizontal();
    const h = this.ticks;
    const {
      align: l,
      crossAlign: c,
      padding: d,
      mirror: u
    } = o;
    const g = ls(i.grid);
    const p = g + d;
    const f = u ? -d : p;
    const m = -x(this.labelRotation);
    const b = [];
    let _;
    let y;
    let v;
    let M;
    let w;
    let k;
    let S;
    let D;
    let P;
    let C;
    let A;
    let L;
    let O = "middle";
    if (s === "top") {
      k = this.bottom - f;
      S = this._getXAxisLabelAlignment();
    } else if (s === "bottom") {
      k = this.top + f;
      S = this._getXAxisLabelAlignment();
    } else if (s === "left") {
      const t = this._getYAxisLabelAlignment(g);
      S = t.textAlign;
      w = t.x;
    } else if (s === "right") {
      const t = this._getYAxisLabelAlignment(g);
      S = t.textAlign;
      w = t.x;
    } else if (e === "x") {
      if (s === "center") {
        k = (t.top + t.bottom) / 2 + p;
      } else if (n(s)) {
        const t = Object.keys(s)[0];
        const e = s[t];
        k = this.chart.scales[t].getPixelForValue(e) + p;
      }
      S = this._getXAxisLabelAlignment();
    } else if (e === "y") {
      if (s === "center") {
        w = (t.left + t.right) / 2 - p;
      } else if (n(s)) {
        const t = Object.keys(s)[0];
        const e = s[t];
        w = this.chart.scales[t].getPixelForValue(e);
      }
      S = this._getYAxisLabelAlignment(g).textAlign;
    }
    if (e === "y") {
      if (l === "start") {
        O = "top";
      } else if (l === "end") {
        O = "bottom";
      }
    }
    const E = this._getLabelSizes();
    _ = 0;
    y = h.length;
    for (; _ < y; ++_) {
      v = h[_];
      M = v.label;
      const t = o.setContext(this.getContext(_));
      D = this.getPixelForTick(_) + o.labelOffset;
      P = this._resolveTickFontOptions(_);
      C = P.lineHeight;
      A = a(M) ? M.length : 1;
      const e = A / 2;
      const i = t.color;
      const n = t.textStrokeColor;
      const l = t.textStrokeWidth;
      let d;
      let g = S;
      if (r) {
        w = D;
        if (S === "inner") {
          g = _ === y - 1 ? this.options.reverse ? "left" : "right" : _ === 0 ? this.options.reverse ? "right" : "left" : "center";
        }
        L = s === "top" ? c === "near" || m !== 0 ? -A * C + C / 2 : c === "center" ? -E.highest.height / 2 - e * C + C : -E.highest.height + C / 2 : c === "near" || m !== 0 ? C / 2 : c === "center" ? E.highest.height / 2 - e * C : E.highest.height - A * C;
        if (u) {
          L *= -1;
        }
        if (m !== 0 && !t.showLabelBackdrop) {
          w += C / 2 * Math.sin(m);
        }
      } else {
        k = D;
        L = (1 - A) * C / 2;
      }
      if (t.showLabelBackdrop) {
        const e = R(t.backdropPadding);
        const i = E.heights[_];
        const s = E.widths[_];
        let n = L - e.top;
        let o = 0 - e.left;
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
    if (-x(this.labelRotation)) {
      if (t === "top") {
        return "left";
      } else {
        return "right";
      }
    }
    let i = "center";
    if (e.align === "start") {
      i = "left";
    } else if (e.align === "end") {
      i = "right";
    } else if (e.align === "inner") {
      i = "inner";
    }
    return i;
  }
  _getYAxisLabelAlignment(t) {
    const {
      position: e,
      ticks: {
        crossAlign: i,
        mirror: s,
        padding: n
      }
    } = this.options;
    const o = t + n;
    const a = this._getLabelSizes().widest.width;
    let r;
    let h;
    if (e === "left") {
      if (s) {
        h = this.right + n;
        if (i === "near") {
          r = "left";
        } else if (i === "center") {
          r = "center";
          h += a / 2;
        } else {
          r = "right";
          h += a;
        }
      } else {
        h = this.right - o;
        if (i === "near") {
          r = "right";
        } else if (i === "center") {
          r = "center";
          h -= a / 2;
        } else {
          r = "left";
          h = this.left;
        }
      }
    } else if (e === "right") {
      if (s) {
        h = this.left + n;
        if (i === "near") {
          r = "right";
        } else if (i === "center") {
          r = "center";
          h -= a / 2;
        } else {
          r = "left";
          h -= a;
        }
      } else {
        h = this.left + o;
        if (i === "near") {
          r = "left";
        } else if (i === "center") {
          r = "center";
          h += a / 2;
        } else {
          r = "right";
          h = this.right;
        }
      }
    } else {
      r = "right";
    }
    return {
      textAlign: r,
      x: h
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror) {
      return;
    }
    const t = this.chart;
    const e = this.options.position;
    if (e === "left" || e === "right") {
      return {
        top: 0,
        left: this.left,
        bottom: t.height,
        right: this.right
      };
    } else if (e === "top" || e === "bottom") {
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: t.width
      };
    } else {
      return undefined;
    }
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
    if (e) {
      t.save();
      t.fillStyle = e;
      t.fillRect(i, s, n, o);
      t.restore();
    }
  }
  getLineWidthForValue(t) {
    const e = this.options.grid;
    if (!this._isVisible() || !e.display) {
      return 0;
    }
    const i = this.ticks.findIndex(e => e.value === t);
    if (i >= 0) {
      return e.setContext(this.getContext(i)).lineWidth;
    }
    return 0;
  }
  drawGrid(t) {
    const e = this.options.grid;
    const i = this.ctx;
    const s = this._gridLineItems ||= this._computeGridLineItems(t);
    let n;
    let o;
    const a = (t, e, s) => {
      if (s.width && s.color) {
        i.save();
        i.lineWidth = s.width;
        i.strokeStyle = s.color;
        i.setLineDash(s.borderDash || []);
        i.lineDashOffset = s.borderDashOffset;
        i.beginPath();
        i.moveTo(t.x, t.y);
        i.lineTo(e.x, e.y);
        i.stroke();
        i.restore();
      }
    };
    if (e.display) {
      n = 0;
      o = s.length;
      for (; n < o; ++n) {
        const t = s[n];
        if (e.drawOnChartArea) {
          a({
            x: t.x1,
            y: t.y1
          }, {
            x: t.x2,
            y: t.y2
          }, t);
        }
        if (e.drawTicks) {
          a({
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
    } = this;
    const n = i.setContext(this.getContext());
    const o = i.display ? n.width : 0;
    if (!o) {
      return;
    }
    const a = s.setContext(this.getContext(0)).lineWidth;
    const r = this._borderValue;
    let h;
    let l;
    let c;
    let d;
    if (this.isHorizontal()) {
      h = q(t, this.left, o) - o / 2;
      l = q(t, this.right, a) + a / 2;
      c = d = r;
    } else {
      c = q(t, this.top, o) - o / 2;
      d = q(t, this.bottom, a) + a / 2;
      h = l = r;
    }
    e.save();
    e.lineWidth = n.width;
    e.strokeStyle = n.color;
    e.beginPath();
    e.moveTo(h, c);
    e.lineTo(l, d);
    e.stroke();
    e.restore();
  }
  drawLabels(t) {
    if (!this.options.ticks.display) {
      return;
    }
    const e = this.ctx;
    const i = this._computeLabelArea();
    if (i) {
      J(e, i);
    }
    const s = this.getLabelItems(t);
    for (const t of s) {
      const i = t.options;
      const s = t.font;
      const n = t.label;
      const o = t.textOffset;
      Z(e, n, 0, o, s, i);
    }
    if (i) {
      Q(e);
    }
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
    if (!i.display) {
      return;
    }
    const o = tt(i.font);
    const r = R(i.padding);
    const h = i.align;
    let l = o.lineHeight / 2;
    if (e === "bottom" || e === "center" || n(e)) {
      l += r.bottom;
      if (a(i.text)) {
        l += o.lineHeight * (i.text.length - 1);
      }
    } else {
      l += r.top;
    }
    const {
      titleX: c,
      titleY: d,
      maxWidth: u,
      rotation: g
    } = ps(this, l, e, h);
    Z(t, i.text, 0, 0, o, {
      color: i.color,
      maxWidth: u,
      rotation: g,
      textAlign: gs(h, e, s),
      textBaseline: "middle",
      translation: [c, d]
    });
  }
  draw(t) {
    if (this._isVisible()) {
      this.drawBackground();
      this.drawGrid(t);
      this.drawBorder();
      this.drawTitle();
      this.drawLabels(t);
    }
  }
  _layers() {
    const t = this.options;
    const e = t.ticks && t.ticks.z || 0;
    const i = r(t.grid && t.grid.z, -1);
    const s = r(t.border && t.border.z, 0);
    if (this._isVisible() && this.draw === fs.prototype.draw) {
      return [{
        z: i,
        draw: t => {
          this.drawBackground();
          this.drawGrid(t);
          this.drawTitle();
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
      }];
    } else {
      return [{
        z: e,
        draw: t => {
          this.draw(t);
        }
      }];
    }
  }
  getMatchingVisibleMetas(t) {
    const e = this.chart.getSortedVisibleDatasetMetas();
    const i = this.axis + "AxisID";
    const s = [];
    let n;
    let o;
    n = 0;
    o = e.length;
    for (; n < o; ++n) {
      const o = e[n];
      if (o[i] === this.id && (!t || o.type === t)) {
        s.push(o);
      }
    }
    return s;
  }
  _resolveTickFontOptions(t) {
    const e = this.options.ticks.setContext(this.getContext(t));
    return tt(e.font);
  }
  _maxDigits() {
    const t = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / t;
  }
}
class ms {
  constructor(t, e, i) {
    this.type = t;
    this.scope = e;
    this.override = i;
    this.items = Object.create(null);
  }
  isForType(t) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype);
  }
  register(t) {
    const e = Object.getPrototypeOf(t);
    let i;
    if (_s(e)) {
      i = this.register(e);
    }
    const s = this.items;
    const n = t.id;
    const a = this.scope + "." + n;
    if (!n) {
      throw new Error("class does not have id: " + t);
    }
    if (!(n in s)) {
      s[n] = t;
      xs(t, a, i);
      if (this.override) {
        o.override(t.id, t.overrides);
      }
    }
    return a;
  }
  get(t) {
    return this.items[t];
  }
  unregister(t) {
    const e = this.items;
    const i = t.id;
    const s = this.scope;
    if (i in e) {
      delete e[i];
    }
    if (s && i in o[s]) {
      delete o[s][i];
      if (this.override) {
        delete st[i];
      }
    }
  }
}
function xs(t, e, i) {
  const s = nt(Object.create(null), [i ? o.get(i) : {}, o.get(e), t.defaults]);
  o.set(e, s);
  if (t.defaultRoutes) {
    bs(e, t.defaultRoutes);
  }
  if (t.descriptors) {
    o.describe(e, t.descriptors);
  }
}
function bs(t, e) {
  Object.keys(e).forEach(i => {
    const s = i.split(".");
    const n = s.pop();
    const a = [t].concat(s).join(".");
    const r = e[i].split(".");
    const h = r.pop();
    const l = r.join(".");
    o.route(a, n, l, h);
  });
}
function _s(t) {
  return "id" in t && "defaults" in t;
}
class ys {
  constructor() {
    this.controllers = new ms(Se, "datasets", true);
    this.elements = new ms(Ki, "elements");
    this.plugins = new ms(Object, "plugins");
    this.scales = new ms(fs, "scales");
    this._typedRegistries = [this.controllers, this.scales, this.elements];
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
      if (i || s.isForType(e) || s === this.plugins && e.id) {
        this._exec(t, s, e);
      } else {
        z(e, e => {
          const s = i || this._getRegistryForType(e);
          this._exec(t, s, e);
        });
      }
    });
  }
  _exec(t, e, i) {
    const s = ot(t);
    $(i["before" + s], [], i);
    e[t](i);
    $(i["after" + s], [], i);
  }
  _getRegistryForType(t) {
    for (let e = 0; e < this._typedRegistries.length; e++) {
      const i = this._typedRegistries[e];
      if (i.isForType(t)) {
        return i;
      }
    }
    return this.plugins;
  }
  _get(t, e, i) {
    const s = e.get(t);
    if (s === undefined) {
      throw new Error("\"" + t + "\" is not a registered " + i + ".");
    }
    return s;
  }
}
var vs = new ys();
class Ms {
  constructor() {
    this._init = [];
  }
  notify(t, e, i, s) {
    if (e === "beforeInit") {
      this._init = this._createDescriptors(t, true);
      this._notify(this._init, t, "install");
    }
    const n = s ? this._descriptors(t).filter(s) : this._descriptors(t);
    const o = this._notify(n, t, e, i);
    if (e === "afterDestroy") {
      this._notify(n, t, "stop");
      this._notify(this._init, t, "uninstall");
    }
    return o;
  }
  _notify(t, e, i, s) {
    s = s || {};
    for (const n of t) {
      const t = n.plugin;
      const o = t[i];
      const a = [e, s, n.options];
      if ($(o, a, t) === false && s.cancelable) {
        return false;
      }
    }
    return true;
  }
  invalidate() {
    if (!f(this._cache)) {
      this._oldCache = this._cache;
      this._cache = undefined;
    }
  }
  _descriptors(t) {
    if (this._cache) {
      return this._cache;
    }
    const e = this._cache = this._createDescriptors(t);
    this._notifyStateChanges(t);
    return e;
  }
  _createDescriptors(t, e) {
    const i = t && t.config;
    const s = r(i.options && i.options.plugins, {});
    const n = ws(i);
    if (s !== false || e) {
      return Ss(t, n, s, e);
    } else {
      return [];
    }
  }
  _notifyStateChanges(t) {
    const e = this._oldCache || [];
    const i = this._cache;
    const s = (t, e) => t.filter(t => !e.some(e => t.plugin.id === e.plugin.id));
    this._notify(s(e, i), t, "stop");
    this._notify(s(i, e), t, "start");
  }
}
function ws(t) {
  const e = {};
  const i = [];
  const s = Object.keys(vs.plugins.items);
  for (let t = 0; t < s.length; t++) {
    i.push(vs.getPlugin(s[t]));
  }
  const n = t.plugins || [];
  for (let t = 0; t < n.length; t++) {
    const s = n[t];
    if (i.indexOf(s) === -1) {
      i.push(s);
      e[s.id] = true;
    }
  }
  return {
    plugins: i,
    localIds: e
  };
}
function ks(t, e) {
  if (e || t !== false) {
    if (t === true) {
      return {};
    } else {
      return t;
    }
  } else {
    return null;
  }
}
function Ss(t, {
  plugins: e,
  localIds: i
}, s, n) {
  const o = [];
  const a = t.getContext();
  for (const r of e) {
    const e = r.id;
    const h = ks(s[e], n);
    if (h !== null) {
      o.push({
        plugin: r,
        options: Ds(t.config, {
          plugin: r,
          local: i[e]
        }, h, a)
      });
    }
  }
  return o;
}
function Ds(t, {
  plugin: e,
  local: i
}, s, n) {
  const o = t.pluginScopeKeys(e);
  const a = t.getOptionScopes(s, o);
  if (i && e.defaults) {
    a.push(e.defaults);
  }
  return t.createResolver(a, n, [""], {
    scriptable: false,
    indexable: false,
    allKeys: true
  });
}
function Ps(t, e) {
  const i = o.datasets[t] || {};
  return ((e.datasets || {})[t] || {}).indexAxis || e.indexAxis || i.indexAxis || "x";
}
function Cs(t, e) {
  let i = t;
  if (t === "_index_") {
    i = e;
  } else if (t === "_value_") {
    i = e === "x" ? "y" : "x";
  }
  return i;
}
function As(t, e) {
  if (t === e) {
    return "_index_";
  } else {
    return "_value_";
  }
}
function Ls(t) {
  if (t === "x" || t === "y" || t === "r") {
    return t;
  }
}
function Os(t) {
  if (t === "top" || t === "bottom") {
    return "x";
  } else if (t === "left" || t === "right") {
    return "y";
  } else {
    return undefined;
  }
}
function Es(t, ...e) {
  if (Ls(t)) {
    return t;
  }
  for (const i of e) {
    const e = i.axis || Os(i.position) || t.length > 1 && Ls(t[0].toLowerCase());
    if (e) {
      return e;
    }
  }
  throw new Error(`Cannot determine type of '${t}' axis. Please provide 'axis' or 'position' option.`);
}
function Ts(t, e, i) {
  if (i[e + "AxisID"] === t) {
    return {
      axis: e
    };
  }
}
function Rs(t, e) {
  if (e.data && e.data.datasets) {
    const i = e.data.datasets.filter(e => e.xAxisID === t || e.yAxisID === t);
    if (i.length) {
      return Ts(t, "x", i[0]) || Ts(t, "y", i[0]);
    }
  }
  return {};
}
function zs(t, e) {
  const i = st[t.type] || {
    scales: {}
  };
  const s = e.scales || {};
  const a = Ps(t.type, e);
  const r = Object.create(null);
  Object.keys(s).forEach(e => {
    const h = s[e];
    if (!n(h)) {
      return console.error(`Invalid scale configuration for scale: ${e}`);
    }
    if (h._proxy) {
      return console.warn(`Ignoring resolver passed as options for scale: ${e}`);
    }
    const l = Es(e, h, Rs(e, t), o.scales[h.type]);
    const c = As(l, a);
    const d = i.scales || {};
    r[e] = dt(Object.create(null), [{
      axis: l
    }, h, d[l], d[c]]);
  });
  t.data.datasets.forEach(i => {
    const n = i.type || t.type;
    const o = i.indexAxis || Ps(n, e);
    const a = (st[n] || {}).scales || {};
    Object.keys(a).forEach(t => {
      const e = Cs(t, o);
      const n = i[e + "AxisID"] || e;
      r[n] = r[n] || Object.create(null);
      dt(r[n], [{
        axis: e
      }, s[n], a[t]]);
    });
  });
  Object.keys(r).forEach(t => {
    const e = r[t];
    dt(e, [o.scales[e.type], o.scale]);
  });
  return r;
}
function Is(t) {
  const e = t.options ||= {};
  e.plugins = r(e.plugins, {});
  e.scales = zs(t, e);
}
function Fs(t) {
  (t = t || {}).datasets = t.datasets || [];
  t.labels = t.labels || [];
  return t;
}
function Vs(t) {
  (t = t || {}).data = Fs(t.data);
  Is(t);
  return t;
}
const Bs = new Map();
const Ns = new Set();
function Ws(t, e) {
  let i = Bs.get(t);
  if (!i) {
    i = e();
    Bs.set(t, i);
    Ns.add(i);
  }
  return i;
}
const Hs = (t, e, i) => {
  const s = c(e, i);
  if (s !== undefined) {
    t.add(s);
  }
};
class js {
  constructor(t) {
    this._config = Vs(t);
    this._scopeCache = new Map();
    this._resolverCache = new Map();
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
    this._config.data = Fs(t);
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
    this.clearCache();
    Is(t);
  }
  clearCache() {
    this._scopeCache.clear();
    this._resolverCache.clear();
  }
  datasetScopeKeys(t) {
    return Ws(t, () => [[`datasets.${t}`, ""]]);
  }
  datasetAnimationScopeKeys(t, e) {
    return Ws(`${t}.transition.${e}`, () => [[`datasets.${t}.transitions.${e}`, `transitions.${e}`], [`datasets.${t}`, ""]]);
  }
  datasetElementScopeKeys(t, e) {
    return Ws(`${t}-${e}`, () => [[`datasets.${t}.elements.${e}`, `datasets.${t}`, `elements.${e}`, ""]]);
  }
  pluginScopeKeys(t) {
    const e = t.id;
    return Ws(`${this.type}-plugin-${e}`, () => [[`plugins.${e}`, ...(t.additionalOptionScopes || [])]]);
  }
  _cachedScopes(t, e) {
    const i = this._scopeCache;
    let s = i.get(t);
    if (!s || !!e) {
      s = new Map();
      i.set(t, s);
    }
    return s;
  }
  getOptionScopes(t, e, i) {
    const {
      options: s,
      type: n
    } = this;
    const a = this._cachedScopes(t, i);
    const r = a.get(e);
    if (r) {
      return r;
    }
    const h = new Set();
    e.forEach(e => {
      if (t) {
        h.add(t);
        e.forEach(e => Hs(h, t, e));
      }
      e.forEach(t => Hs(h, s, t));
      e.forEach(t => Hs(h, st[n] || {}, t));
      e.forEach(t => Hs(h, o, t));
      e.forEach(t => Hs(h, at, t));
    });
    const l = Array.from(h);
    if (l.length === 0) {
      l.push(Object.create(null));
    }
    if (Ns.has(e)) {
      a.set(e, l);
    }
    return l;
  }
  chartOptionScopes() {
    const {
      options: t,
      type: e
    } = this;
    return [t, st[e] || {}, o.datasets[e] || {}, {
      type: e
    }, o, at];
  }
  resolveNamedOptions(t, e, i, s = [""]) {
    const n = {
      $shared: true
    };
    const {
      resolver: o,
      subPrefixes: a
    } = $s(this._resolverCache, t, s);
    let r = o;
    if (Ys(o, e)) {
      n.$shared = false;
      i = rt(i) ? i() : i;
      const e = this.createResolver(t, i, a);
      r = ht(o, i, e);
    }
    for (const t of e) {
      n[t] = r[t];
    }
    return n;
  }
  createResolver(t, e, i = [""], s) {
    const {
      resolver: o
    } = $s(this._resolverCache, t, i);
    if (n(e)) {
      return ht(o, e, undefined, s);
    } else {
      return o;
    }
  }
}
function $s(t, e, i) {
  let s = t.get(e);
  if (!s) {
    s = new Map();
    t.set(e, s);
  }
  const n = i.join();
  let o = s.get(n);
  if (!o) {
    o = {
      resolver: lt(e, i),
      subPrefixes: i.filter(t => !t.toLowerCase().includes("hover"))
    };
    s.set(n, o);
  }
  return o;
}
const Us = t => n(t) && Object.getOwnPropertyNames(t).reduce((e, i) => e || rt(t[i]), false);
function Ys(t, e) {
  const {
    isScriptable: i,
    isIndexable: s
  } = ct(t);
  for (const n of e) {
    const e = i(n);
    const o = s(n);
    const r = (o || e) && t[n];
    if (e && (rt(r) || Us(r)) || o && a(r)) {
      return true;
    }
  }
  return false;
}
var Xs = "4.4.0";
const Gs = ["top", "bottom", "left", "right", "chartArea"];
function Ks(t, e) {
  return t === "top" || t === "bottom" || Gs.indexOf(t) === -1 && e === "x";
}
function qs(t, e) {
  return function (i, s) {
    if (i[t] === s[t]) {
      return i[e] - s[e];
    } else {
      return i[t] - s[t];
    }
  };
}
function Js(t) {
  const e = t.chart;
  const i = e.options.animation;
  e.notifyPlugins("afterRender");
  $(i && i.onComplete, [t], e);
}
function Zs(t) {
  const e = t.chart;
  const i = e.options.animation;
  $(i && i.onProgress, [t], e);
}
function Qs(t) {
  if (W() && typeof t == "string") {
    t = document.getElementById(t);
  } else if (t && t.length) {
    t = t[0];
  }
  if (t && t.canvas) {
    t = t.canvas;
  }
  return t;
}
const tn = {};
const en = t => {
  const e = Qs(t);
  return Object.values(tn).filter(t => t.canvas === e).pop();
};
function sn(t, e, i) {
  const s = Object.keys(t);
  for (const n of s) {
    const s = +n;
    if (s >= e) {
      const o = t[n];
      delete t[n];
      if (i > 0 || s > e) {
        t[s + i] = o;
      }
    }
  }
}
function nn(t, e, i, s) {
  if (i && t.type !== "mouseout") {
    if (s) {
      return e;
    } else {
      return t;
    }
  } else {
    return null;
  }
}
function on(t, e, i) {
  if (t.options.clip) {
    return t[i];
  } else {
    return e[i];
  }
}
function an(t, e) {
  const {
    xScale: i,
    yScale: s
  } = t;
  if (i && s) {
    return {
      left: on(i, e, "left"),
      right: on(i, e, "right"),
      top: on(s, e, "top"),
      bottom: on(s, e, "bottom")
    };
  } else {
    return e;
  }
}
class rn {
  static defaults = o;
  static instances = tn;
  static overrides = st;
  static registry = vs;
  static version = Xs;
  static getChart = en;
  static register(...t) {
    vs.add(...t);
    hn();
  }
  static unregister(...t) {
    vs.remove(...t);
    hn();
  }
  constructor(t, e) {
    const i = this.config = new js(e);
    const s = Qs(t);
    const n = en(s);
    if (n) {
      throw new Error("Canvas is already in use. Chart with ID '" + n.id + "' must be destroyed before the canvas with ID '" + n.canvas.id + "' can be reused.");
    }
    const o = i.createResolver(i.chartOptionScopes(), this.getContext());
    this.platform = new (i.platform || Gi(s))();
    this.platform.updateConfig(i);
    const a = this.platform.acquireContext(s, o.aspectRatio);
    const r = a && a.canvas;
    const h = r && r.height;
    const l = r && r.width;
    this.id = ut();
    this.ctx = a;
    this.canvas = r;
    this.width = l;
    this.height = h;
    this._options = o;
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
    this._plugins = new Ms();
    this.$proxies = {};
    this._hiddenIndices = {};
    this.attached = false;
    this._animationsDisabled = undefined;
    this.$context = undefined;
    this._doResize = gt(t => this.update(t), o.resizeDelay || 0);
    this._dataChanges = [];
    tn[this.id] = this;
    if (a && r) {
      Qt.listen(this, "complete", Js);
      Qt.listen(this, "progress", Zs);
      this._initialize();
      if (this.attached) {
        this.update();
      }
    } else {
      console.error("Failed to create chart: can't acquire context from the given item");
    }
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
    if (f(t)) {
      if (e && n) {
        return n;
      } else if (s) {
        return i / s;
      } else {
        return null;
      }
    } else {
      return t;
    }
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
    return vs;
  }
  _initialize() {
    this.notifyPlugins("beforeInit");
    if (this.options.responsive) {
      this.resize();
    } else {
      pt(this, this.options.devicePixelRatio);
    }
    this.bindEvents();
    this.notifyPlugins("afterInit");
    return this;
  }
  clear() {
    ft(this.canvas, this.ctx);
    return this;
  }
  stop() {
    Qt.stop(this);
    return this;
  }
  resize(t, e) {
    if (Qt.running(this)) {
      this._resizeBeforeDraw = {
        width: t,
        height: e
      };
    } else {
      this._resize(t, e);
    }
  }
  _resize(t, e) {
    const i = this.options;
    const s = this.canvas;
    const n = i.maintainAspectRatio && this.aspectRatio;
    const o = this.platform.getMaximumSize(s, t, e, n);
    const a = i.devicePixelRatio || this.platform.getDevicePixelRatio();
    const r = this.width ? "resize" : "attach";
    this.width = o.width;
    this.height = o.height;
    this._aspectRatio = this.aspectRatio;
    if (pt(this, a, true)) {
      this.notifyPlugins("resize", {
        size: o
      });
      $(i.onResize, [this, o], this);
      if (this.attached && this._doResize(r)) {
        this.render();
      }
    }
  }
  ensureScalesHaveIDs() {
    const t = this.options.scales || {};
    z(t, (t, e) => {
      t.id = e;
    });
  }
  buildOrUpdateScales() {
    const t = this.options;
    const e = t.scales;
    const i = this.scales;
    const s = Object.keys(i).reduce((t, e) => {
      t[e] = false;
      return t;
    }, {});
    let n = [];
    if (e) {
      n = n.concat(Object.keys(e).map(t => {
        const i = e[t];
        const s = Es(t, i);
        const n = s === "r";
        const o = s === "x";
        return {
          options: i,
          dposition: n ? "chartArea" : o ? "bottom" : "left",
          dtype: n ? "radialLinear" : o ? "category" : "linear"
        };
      }));
    }
    z(n, e => {
      const n = e.options;
      const o = n.id;
      const a = Es(o, n);
      const h = r(n.type, e.dtype);
      if (n.position === undefined || Ks(n.position, a) !== Ks(e.dposition)) {
        n.position = e.dposition;
      }
      s[o] = true;
      let l = null;
      if (o in i && i[o].type === h) {
        l = i[o];
      } else {
        l = new (vs.getScale(h))({
          id: o,
          type: h,
          ctx: this.ctx,
          chart: this
        });
        i[l.id] = l;
      }
      l.init(n, t);
    });
    z(s, (t, e) => {
      if (!t) {
        delete i[e];
      }
    });
    z(i, t => {
      Si.configure(this, t, t.options);
      Si.addBox(this, t);
    });
  }
  _updateMetasets() {
    const t = this._metasets;
    const e = this.data.datasets.length;
    const i = t.length;
    t.sort((t, e) => t.index - e.index);
    if (i > e) {
      for (let t = e; t < i; ++t) {
        this._destroyDatasetMeta(t);
      }
      t.splice(e, i - e);
    }
    this._sortedMetasets = t.slice(0).sort(qs("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const {
      _metasets: t,
      data: {
        datasets: e
      }
    } = this;
    if (t.length > e.length) {
      delete this._stacks;
    }
    t.forEach((t, i) => {
      if (e.filter(e => e === t._dataset).length === 0) {
        this._destroyDatasetMeta(i);
      }
    });
  }
  buildOrUpdateControllers() {
    const t = [];
    const e = this.data.datasets;
    let i;
    let s;
    this._removeUnreferencedMetasets();
    i = 0;
    s = e.length;
    for (; i < s; i++) {
      const s = e[i];
      let n = this.getDatasetMeta(i);
      const a = s.type || this.config.type;
      if (n.type && n.type !== a) {
        this._destroyDatasetMeta(i);
        n = this.getDatasetMeta(i);
      }
      n.type = a;
      n.indexAxis = s.indexAxis || Ps(a, this.options);
      n.order = s.order || 0;
      n.index = i;
      n.label = "" + s.label;
      n.visible = this.isDatasetVisible(i);
      if (n.controller) {
        n.controller.updateIndex(i);
        n.controller.linkScales();
      } else {
        const e = vs.getController(a);
        const {
          datasetElementType: s,
          dataElementType: r
        } = o.datasets[a];
        Object.assign(e, {
          dataElementType: vs.getElement(r),
          datasetElementType: s && vs.getElement(s)
        });
        n.controller = new e(this, i);
        t.push(n.controller);
      }
    }
    this._updateMetasets();
    return t;
  }
  _resetElements() {
    z(this.data.datasets, (t, e) => {
      this.getDatasetMeta(e).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements();
    this.notifyPlugins("reset");
  }
  update(t) {
    const e = this.config;
    e.update();
    const i = this._options = e.createResolver(e.chartOptionScopes(), this.getContext());
    const s = this._animationsDisabled = !i.animation;
    this._updateScales();
    this._checkEventBindings();
    this._updateHiddenIndices();
    this._plugins.invalidate();
    if (this.notifyPlugins("beforeUpdate", {
      mode: t,
      cancelable: true
    }) === false) {
      return;
    }
    const n = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let o = 0;
    for (let t = 0, e = this.data.datasets.length; t < e; t++) {
      const {
        controller: e
      } = this.getDatasetMeta(t);
      const i = !s && n.indexOf(e) === -1;
      e.buildOrUpdateElements(i);
      o = Math.max(+e.getMaxOverflow(), o);
    }
    o = this._minPadding = i.layout.autoPadding ? o : 0;
    this._updateLayout(o);
    if (!s) {
      z(n, t => {
        t.reset();
      });
    }
    this._updateDatasets(t);
    this.notifyPlugins("afterUpdate", {
      mode: t
    });
    this._layers.sort(qs("z", "_idx"));
    const {
      _active: a,
      _lastEvent: r
    } = this;
    if (r) {
      this._eventHandler(r, true);
    } else if (a.length) {
      this._updateHoverStyles(a, a, true);
    }
    this.render();
  }
  _updateScales() {
    z(this.scales, t => {
      Si.removeBox(this, t);
    });
    this.ensureScalesHaveIDs();
    this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const t = this.options;
    const e = new Set(Object.keys(this._listeners));
    const i = new Set(t.events);
    if (!mt(e, i) || !!this._responsiveListeners !== t.responsive) {
      this.unbindEvents();
      this.bindEvents();
    }
  }
  _updateHiddenIndices() {
    const {
      _hiddenIndices: t
    } = this;
    const e = this._getUniformDataChanges() || [];
    for (const {
      method: i,
      start: s,
      count: n
    } of e) {
      sn(t, s, i === "_removeElements" ? -n : n);
    }
  }
  _getUniformDataChanges() {
    const t = this._dataChanges;
    if (!t || !t.length) {
      return;
    }
    this._dataChanges = [];
    const e = this.data.datasets.length;
    const i = e => new Set(t.filter(t => t[0] === e).map((t, e) => e + "," + t.splice(1).join(",")));
    const s = i(0);
    for (let t = 1; t < e; t++) {
      if (!mt(s, i(t))) {
        return;
      }
    }
    return Array.from(s).map(t => t.split(",")).map(t => ({
      method: t[1],
      start: +t[2],
      count: +t[3]
    }));
  }
  _updateLayout(t) {
    if (this.notifyPlugins("beforeLayout", {
      cancelable: true
    }) === false) {
      return;
    }
    Si.update(this, this.width, this.height, t);
    const e = this.chartArea;
    const i = e.width <= 0 || e.height <= 0;
    this._layers = [];
    z(this.boxes, t => {
      if (!i || t.position !== "chartArea") {
        if (t.configure) {
          t.configure();
        }
        this._layers.push(...t._layers());
      }
    }, this);
    this._layers.forEach((t, e) => {
      t._idx = e;
    });
    this.notifyPlugins("afterLayout");
  }
  _updateDatasets(t) {
    if (this.notifyPlugins("beforeDatasetsUpdate", {
      mode: t,
      cancelable: true
    }) !== false) {
      for (let t = 0, e = this.data.datasets.length; t < e; ++t) {
        this.getDatasetMeta(t).controller.configure();
      }
      for (let e = 0, i = this.data.datasets.length; e < i; ++e) {
        this._updateDataset(e, rt(t) ? t({
          datasetIndex: e
        }) : t);
      }
      this.notifyPlugins("afterDatasetsUpdate", {
        mode: t
      });
    }
  }
  _updateDataset(t, e) {
    const i = this.getDatasetMeta(t);
    const s = {
      meta: i,
      index: t,
      mode: e,
      cancelable: true
    };
    if (this.notifyPlugins("beforeDatasetUpdate", s) !== false) {
      i.controller._update(e);
      s.cancelable = false;
      this.notifyPlugins("afterDatasetUpdate", s);
    }
  }
  render() {
    if (this.notifyPlugins("beforeRender", {
      cancelable: true
    }) !== false) {
      if (Qt.has(this)) {
        if (this.attached && !Qt.running(this)) {
          Qt.start(this);
        }
      } else {
        this.draw();
        Js({
          chart: this
        });
      }
    }
  }
  draw() {
    let t;
    if (this._resizeBeforeDraw) {
      const {
        width: t,
        height: e
      } = this._resizeBeforeDraw;
      this._resize(t, e);
      this._resizeBeforeDraw = null;
    }
    this.clear();
    if (this.width <= 0 || this.height <= 0) {
      return;
    }
    if (this.notifyPlugins("beforeDraw", {
      cancelable: true
    }) === false) {
      return;
    }
    const e = this._layers;
    for (t = 0; t < e.length && e[t].z <= 0; ++t) {
      e[t].draw(this.chartArea);
    }
    for (this._drawDatasets(); t < e.length; ++t) {
      e[t].draw(this.chartArea);
    }
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(t) {
    const e = this._sortedMetasets;
    const i = [];
    let s;
    let n;
    s = 0;
    n = e.length;
    for (; s < n; ++s) {
      const n = e[s];
      if (!t || !!n.visible) {
        i.push(n);
      }
    }
    return i;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(true);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: true
    }) === false) {
      return;
    }
    const t = this.getSortedVisibleDatasetMetas();
    for (let e = t.length - 1; e >= 0; --e) {
      this._drawDataset(t[e]);
    }
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(t) {
    const e = this.ctx;
    const i = t._clip;
    const s = !i.disabled;
    const n = an(t, this.chartArea);
    const o = {
      meta: t,
      index: t.index,
      cancelable: true
    };
    if (this.notifyPlugins("beforeDatasetDraw", o) !== false) {
      if (s) {
        J(e, {
          left: i.left === false ? 0 : n.left - i.left,
          right: i.right === false ? this.width : n.right + i.right,
          top: i.top === false ? 0 : n.top - i.top,
          bottom: i.bottom === false ? this.height : n.bottom + i.bottom
        });
      }
      t.controller.draw();
      if (s) {
        Q(e);
      }
      o.cancelable = false;
      this.notifyPlugins("afterDatasetDraw", o);
    }
  }
  isPointInArea(t) {
    return E(t, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(t, e, i, s) {
    const n = hi.modes[e];
    if (typeof n == "function") {
      return n(this, t, i, s);
    } else {
      return [];
    }
  }
  getDatasetMeta(t) {
    const e = this.data.datasets[t];
    const i = this._metasets;
    let s = i.filter(t => t && t._dataset === e).pop();
    if (!s) {
      s = {
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
        _sorted: false
      };
      i.push(s);
    }
    return s;
  }
  getContext() {
    return this.$context ||= p(null, {
      chart: this,
      type: "chart"
    });
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(t) {
    const e = this.data.datasets[t];
    if (!e) {
      return false;
    }
    const i = this.getDatasetMeta(t);
    if (typeof i.hidden == "boolean") {
      return !i.hidden;
    } else {
      return !e.hidden;
    }
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
    const s = i ? "show" : "hide";
    const n = this.getDatasetMeta(t);
    const o = n.controller._resolveAnimations(undefined, s);
    if (u(e)) {
      n.data[e].hidden = !i;
      this.update();
    } else {
      this.setDatasetVisibility(t, i);
      o.update(n, {
        visible: i
      });
      this.update(e => e.datasetIndex === t ? s : undefined);
    }
  }
  hide(t, e) {
    this._updateVisibility(t, e, false);
  }
  show(t, e) {
    this._updateVisibility(t, e, true);
  }
  _destroyDatasetMeta(t) {
    const e = this._metasets[t];
    if (e && e.controller) {
      e.controller._destroy();
    }
    delete this._metasets[t];
  }
  _stop() {
    let t;
    let e;
    this.stop();
    Qt.remove(this);
    t = 0;
    e = this.data.datasets.length;
    for (; t < e; ++t) {
      this._destroyDatasetMeta(t);
    }
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const {
      canvas: t,
      ctx: e
    } = this;
    this._stop();
    this.config.clearCache();
    if (t) {
      this.unbindEvents();
      ft(t, e);
      this.platform.releaseContext(e);
      this.canvas = null;
      this.ctx = null;
    }
    delete tn[this.id];
    this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...t) {
    return this.canvas.toDataURL(...t);
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
    const t = this._listeners;
    const e = this.platform;
    const i = (i, s) => {
      e.addEventListener(this, i, s);
      t[i] = s;
    };
    const s = (t, e, i) => {
      t.offsetX = e;
      t.offsetY = i;
      this._eventHandler(t);
    };
    z(this.options.events, t => i(t, s));
  }
  bindResponsiveEvents() {
    this._responsiveListeners ||= {};
    const t = this._responsiveListeners;
    const e = this.platform;
    const i = (i, s) => {
      e.addEventListener(this, i, s);
      t[i] = s;
    };
    const s = (i, s) => {
      if (t[i]) {
        e.removeEventListener(this, i, s);
        delete t[i];
      }
    };
    const n = (t, e) => {
      if (this.canvas) {
        this.resize(t, e);
      }
    };
    let o;
    const a = () => {
      s("attach", a);
      this.attached = true;
      this.resize();
      i("resize", n);
      i("detach", o);
    };
    o = () => {
      this.attached = false;
      s("resize", n);
      this._stop();
      this._resize(0, 0);
      i("attach", a);
    };
    if (e.isAttached(this.canvas)) {
      a();
    } else {
      o();
    }
  }
  unbindEvents() {
    z(this._listeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    });
    this._listeners = {};
    z(this._responsiveListeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    });
    this._responsiveListeners = undefined;
  }
  updateHoverStyle(t, e, i) {
    const s = i ? "set" : "remove";
    let n;
    let o;
    let a;
    let r;
    if (e === "dataset") {
      n = this.getDatasetMeta(t[0].datasetIndex);
      n.controller["_" + s + "DatasetHoverStyle"]();
    }
    a = 0;
    r = t.length;
    for (; a < r; ++a) {
      o = t[a];
      const e = o && this.getDatasetMeta(o.datasetIndex).controller;
      if (e) {
        e[s + "HoverStyle"](o.element, o.datasetIndex, o.index);
      }
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t) {
    const e = this._active || [];
    const i = t.map(({
      datasetIndex: t,
      index: e
    }) => {
      const i = this.getDatasetMeta(t);
      if (!i) {
        throw new Error("No dataset found at index " + t);
      }
      return {
        datasetIndex: t,
        element: i.data[e],
        index: e
      };
    });
    if (!xt(i, e)) {
      this._active = i;
      this._lastEvent = null;
      this._updateHoverStyles(i, e);
    }
  }
  notifyPlugins(t, e, i) {
    return this._plugins.notify(this, t, e, i);
  }
  isPluginEnabled(t) {
    return this._plugins._cache.filter(e => e.plugin.id === t).length === 1;
  }
  _updateHoverStyles(t, e, i) {
    const s = this.options.hover;
    const n = (t, e) => t.filter(t => !e.some(e => t.datasetIndex === e.datasetIndex && t.index === e.index));
    const o = n(e, t);
    const a = i ? t : n(t, e);
    if (o.length) {
      this.updateHoverStyle(o, s.mode, false);
    }
    if (a.length && s.mode) {
      this.updateHoverStyle(a, s.mode, true);
    }
  }
  _eventHandler(t, e) {
    const i = {
      event: t,
      replay: e,
      cancelable: true,
      inChartArea: this.isPointInArea(t)
    };
    const s = e => (e.options.events || this.options.events).includes(t.native.type);
    if (this.notifyPlugins("beforeEvent", i, s) === false) {
      return;
    }
    const n = this._handleEvent(t, e, i.inChartArea);
    i.cancelable = false;
    this.notifyPlugins("afterEvent", i, s);
    if (n || i.changed) {
      this.render();
    }
    return this;
  }
  _handleEvent(t, e, i) {
    const {
      _active: s = [],
      options: n
    } = this;
    const o = e;
    const a = this._getActiveElements(t, s, i, o);
    const r = bt(t);
    const h = nn(t, this._lastEvent, i, r);
    if (i) {
      this._lastEvent = null;
      $(n.onHover, [t, a, this], this);
      if (r) {
        $(n.onClick, [t, a, this], this);
      }
    }
    const l = !xt(a, s);
    if (l || e) {
      this._active = a;
      this._updateHoverStyles(a, s, e);
    }
    this._lastEvent = h;
    return l;
  }
  _getActiveElements(t, e, i, s) {
    if (t.type === "mouseout") {
      return [];
    }
    if (!i) {
      return e;
    }
    const n = this.options.hover;
    return this.getElementsAtEventForMode(t, n.mode, n, s);
  }
}
function hn() {
  return z(rn.instances, t => t._plugins.invalidate());
}
function ln(t, e, i) {
  const {
    startAngle: s,
    pixelMargin: n,
    x: o,
    y: a,
    outerRadius: r,
    innerRadius: h
  } = e;
  let l = n / r;
  t.beginPath();
  t.arc(o, a, r, s - l, i + l);
  if (h > n) {
    l = n / h;
    t.arc(o, a, h, i + l, s - l, true);
  } else {
    t.arc(o, a, n, i + w, s - w);
  }
  t.closePath();
  t.clip();
}
function cn(t) {
  return yt(t, ["outerStart", "outerEnd", "innerStart", "innerEnd"]);
}
function dn(t, e, i, s) {
  const n = cn(t.options.borderRadius);
  const o = (i - e) / 2;
  const a = Math.min(o, s * e / 2);
  const r = t => {
    const e = (i - Math.min(o, t)) * s / 2;
    return Y(t, 0, Math.min(o, e));
  };
  return {
    outerStart: r(n.outerStart),
    outerEnd: r(n.outerEnd),
    innerStart: Y(n.innerStart, 0, a),
    innerEnd: Y(n.innerEnd, 0, a)
  };
}
function un(t, e, i, s) {
  return {
    x: i + t * Math.cos(e),
    y: s + t * Math.sin(e)
  };
}
function gn(t, e, i, s, n, o) {
  const {
    x: a,
    y: r,
    startAngle: h,
    pixelMargin: l,
    innerRadius: c
  } = e;
  const d = Math.max(e.outerRadius + s + i - l, 0);
  const u = c > 0 ? c + s + i + l : 0;
  let g = 0;
  const p = n - h;
  if (s) {
    const t = ((c > 0 ? c - s : 0) + (d > 0 ? d - s : 0)) / 2;
    g = (p - (t !== 0 ? p * t / (t + s) : p)) / 2;
  }
  const f = (p - Math.max(0.001, p * d - i / k) / d) / 2;
  const m = h + f + g;
  const x = n - f - g;
  const {
    outerStart: b,
    outerEnd: _,
    innerStart: y,
    innerEnd: v
  } = dn(e, u, d, x - m);
  const M = d - b;
  const S = d - _;
  const D = m + b / M;
  const P = x - _ / S;
  const C = u + y;
  const A = u + v;
  const L = m + y / C;
  const O = x - v / A;
  t.beginPath();
  if (o) {
    const e = (D + P) / 2;
    t.arc(a, r, d, D, e);
    t.arc(a, r, d, e, P);
    if (_ > 0) {
      const e = un(S, P, a, r);
      t.arc(e.x, e.y, _, P, x + w);
    }
    const i = un(A, x, a, r);
    t.lineTo(i.x, i.y);
    if (v > 0) {
      const e = un(A, O, a, r);
      t.arc(e.x, e.y, v, x + w, O + Math.PI);
    }
    const s = (x - v / u + (m + y / u)) / 2;
    t.arc(a, r, u, x - v / u, s, true);
    t.arc(a, r, u, s, m + y / u, true);
    if (y > 0) {
      const e = un(C, L, a, r);
      t.arc(e.x, e.y, y, L + Math.PI, m - w);
    }
    const n = un(M, m, a, r);
    t.lineTo(n.x, n.y);
    if (b > 0) {
      const e = un(M, D, a, r);
      t.arc(e.x, e.y, b, m - w, D);
    }
  } else {
    t.moveTo(a, r);
    const e = Math.cos(D) * d + a;
    const i = Math.sin(D) * d + r;
    t.lineTo(e, i);
    const s = Math.cos(P) * d + a;
    const n = Math.sin(P) * d + r;
    t.lineTo(s, n);
  }
  t.closePath();
}
function pn(t, e, i, s, n) {
  const {
    fullCircles: o,
    startAngle: a,
    circumference: r
  } = e;
  let h = e.endAngle;
  if (o) {
    gn(t, e, i, s, h, n);
    for (let e = 0; e < o; ++e) {
      t.fill();
    }
    if (!isNaN(r)) {
      h = a + (r % y || y);
    }
  }
  gn(t, e, i, s, h, n);
  t.fill();
  return h;
}
function fn(t, e, i, s, n) {
  const {
    fullCircles: o,
    startAngle: a,
    circumference: r,
    options: h
  } = e;
  const {
    borderWidth: l,
    borderJoinStyle: c,
    borderDash: d,
    borderDashOffset: u
  } = h;
  const g = h.borderAlign === "inner";
  if (!l) {
    return;
  }
  t.setLineDash(d || []);
  t.lineDashOffset = u;
  if (g) {
    t.lineWidth = l * 2;
    t.lineJoin = c || "round";
  } else {
    t.lineWidth = l;
    t.lineJoin = c || "bevel";
  }
  let p = e.endAngle;
  if (o) {
    gn(t, e, i, s, p, n);
    for (let e = 0; e < o; ++e) {
      t.stroke();
    }
    if (!isNaN(r)) {
      p = a + (r % y || y);
    }
  }
  if (g) {
    ln(t, e, p);
  }
  if (!o) {
    gn(t, e, i, s, p, n);
    t.stroke();
  }
}
class mn extends Ki {
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
    circular: true
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor"
  };
  static descriptors = {
    _scriptable: true,
    _indexable: t => t !== "borderDash"
  };
  circumference;
  endAngle;
  fullCircles;
  innerRadius;
  outerRadius;
  pixelMargin;
  startAngle;
  constructor(t) {
    super();
    this.options = undefined;
    this.circumference = undefined;
    this.startAngle = undefined;
    this.endAngle = undefined;
    this.innerRadius = undefined;
    this.outerRadius = undefined;
    this.pixelMargin = 0;
    this.fullCircles = 0;
    if (t) {
      Object.assign(this, t);
    }
  }
  inRange(t, e, i) {
    const s = this.getProps(["x", "y"], i);
    const {
      angle: n,
      distance: o
    } = T(s, {
      x: t,
      y: e
    });
    const {
      startAngle: a,
      endAngle: h,
      innerRadius: l,
      outerRadius: c,
      circumference: d
    } = this.getProps(["startAngle", "endAngle", "innerRadius", "outerRadius", "circumference"], i);
    const u = (this.options.spacing + this.options.borderWidth) / 2;
    const g = r(d, h - a) >= y || M(n, a, h);
    const p = _t(o, l + u, c + u);
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
    } = this.getProps(["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"], t);
    const {
      offset: r,
      spacing: h
    } = this.options;
    const l = (s + n) / 2;
    const c = (o + a + h + r) / 2;
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
    } = this;
    const s = (e.offset || 0) / 4;
    const n = (e.spacing || 0) / 2;
    const o = e.circular;
    this.pixelMargin = e.borderAlign === "inner" ? 0.33 : 0;
    this.fullCircles = i > y ? Math.floor(i / y) : 0;
    if (i === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
      return;
    }
    t.save();
    const a = (this.startAngle + this.endAngle) / 2;
    t.translate(Math.cos(a) * s, Math.sin(a) * s);
    const r = s * (1 - Math.sin(Math.min(k, i || 0)));
    t.fillStyle = e.backgroundColor;
    t.strokeStyle = e.borderColor;
    pn(t, this, r, n, o);
    fn(t, this, r, n, o);
    t.restore();
  }
}
function xn(t, e, i = e) {
  t.lineCap = r(i.borderCapStyle, e.borderCapStyle);
  t.setLineDash(r(i.borderDash, e.borderDash));
  t.lineDashOffset = r(i.borderDashOffset, e.borderDashOffset);
  t.lineJoin = r(i.borderJoinStyle, e.borderJoinStyle);
  t.lineWidth = r(i.borderWidth, e.borderWidth);
  t.strokeStyle = r(i.borderColor, e.borderColor);
}
function bn(t, e, i) {
  t.lineTo(i.x, i.y);
}
function _n(t) {
  if (t.stepped) {
    return Pt;
  } else if (t.tension || t.cubicInterpolationMode === "monotone") {
    return Ct;
  } else {
    return bn;
  }
}
function yn(t, e, i = {}) {
  const s = t.length;
  const {
    start: n = 0,
    end: o = s - 1
  } = i;
  const {
    start: a,
    end: r
  } = e;
  const h = Math.max(n, a);
  const l = Math.min(o, r);
  const c = n < a && o < a || n > r && o > r;
  return {
    count: s,
    start: h,
    loop: e.loop,
    ilen: l < h && !c ? s + l - h : l - h
  };
}
function vn(t, e, i, s) {
  const {
    points: n,
    options: o
  } = e;
  const {
    count: a,
    start: r,
    loop: h,
    ilen: l
  } = yn(n, i, s);
  const c = _n(o);
  let d;
  let u;
  let g;
  let {
    move: p = true,
    reverse: f
  } = s || {};
  for (d = 0; d <= l; ++d) {
    u = n[(r + (f ? l - d : d)) % a];
    if (!u.skip) {
      if (p) {
        t.moveTo(u.x, u.y);
        p = false;
      } else {
        c(t, g, u, f, o.stepped);
      }
      g = u;
    }
  }
  if (h) {
    u = n[(r + (f ? l : 0)) % a];
    c(t, g, u, f, o.stepped);
  }
  return !!h;
}
function Mn(t, e, i, s) {
  const n = e.points;
  const {
    count: o,
    start: a,
    ilen: r
  } = yn(n, i, s);
  const {
    move: h = true,
    reverse: l
  } = s || {};
  let c;
  let d;
  let u;
  let g;
  let p;
  let f;
  let m = 0;
  let x = 0;
  const b = t => (a + (l ? r - t : t)) % o;
  const _ = () => {
    if (g !== p) {
      t.lineTo(m, p);
      t.lineTo(m, g);
      t.lineTo(m, f);
    }
  };
  if (h) {
    d = n[b(0)];
    t.moveTo(d.x, d.y);
  }
  c = 0;
  for (; c <= r; ++c) {
    d = n[b(c)];
    if (d.skip) {
      continue;
    }
    const e = d.x;
    const i = d.y;
    const s = e | 0;
    if (s === u) {
      if (i < g) {
        g = i;
      } else if (i > p) {
        p = i;
      }
      m = (x * m + e) / ++x;
    } else {
      _();
      t.lineTo(e, i);
      u = s;
      x = 0;
      g = p = i;
    }
    f = i;
  }
  _();
}
function wn(t) {
  const e = t.options;
  const i = e.borderDash && e.borderDash.length;
  if (!t._decimated && !t._loop && !e.tension && e.cubicInterpolationMode !== "monotone" && !e.stepped && !i) {
    return Mn;
  } else {
    return vn;
  }
}
function kn(t) {
  if (t.stepped) {
    return kt;
  } else if (t.tension || t.cubicInterpolationMode === "monotone") {
    return St;
  } else {
    return Dt;
  }
}
function Sn(t, e, i, s) {
  let n = e._path;
  if (!n) {
    n = e._path = new Path2D();
    if (e.path(n, i, s)) {
      n.closePath();
    }
  }
  xn(t, e.options);
  t.stroke(n);
}
function Dn(t, e, i, s) {
  const {
    segments: n,
    options: o
  } = e;
  const a = wn(e);
  for (const r of n) {
    xn(t, o, r.style);
    t.beginPath();
    if (a(t, e, r, {
      start: i,
      end: i + s - 1
    })) {
      t.closePath();
    }
    t.stroke();
  }
}
const Pn = typeof Path2D == "function";
function Cn(t, e, i, s) {
  if (Pn && !e.options.segment) {
    Sn(t, e, i, s);
  } else {
    Dn(t, e, i, s);
  }
}
class An extends Ki {
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
    tension: 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  static descriptors = {
    _scriptable: true,
    _indexable: t => t !== "borderDash" && t !== "fill"
  };
  constructor(t) {
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
    if (t) {
      Object.assign(this, t);
    }
  }
  updateControlPoints(t, e) {
    const i = this.options;
    if ((i.tension || i.cubicInterpolationMode === "monotone") && !i.stepped && !this._pointsUpdated) {
      const s = i.spanGaps ? this._loop : this._fullLoop;
      vt(this._points, i, t, s, e);
      this._pointsUpdated = true;
    }
  }
  set points(t) {
    this._points = t;
    delete this._segments;
    delete this._path;
    this._pointsUpdated = false;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments ||= Mt(this, this.options.segment);
  }
  first() {
    const t = this.segments;
    const e = this.points;
    return t.length && e[t[0].start];
  }
  last() {
    const t = this.segments;
    const e = this.points;
    const i = t.length;
    return i && e[t[i - 1].end];
  }
  interpolate(t, e) {
    const i = this.options;
    const s = t[e];
    const n = this.points;
    const o = wt(this, {
      property: e,
      start: s,
      end: s
    });
    if (!o.length) {
      return;
    }
    const a = [];
    const r = kn(i);
    let h;
    let l;
    h = 0;
    l = o.length;
    for (; h < l; ++h) {
      const {
        start: l,
        end: c
      } = o[h];
      const d = n[l];
      const u = n[c];
      if (d === u) {
        a.push(d);
        continue;
      }
      const g = r(d, u, Math.abs((s - d[e]) / (u[e] - d[e])), i.stepped);
      g[e] = t[e];
      a.push(g);
    }
    if (a.length === 1) {
      return a[0];
    } else {
      return a;
    }
  }
  pathSegment(t, e, i) {
    return wn(this)(t, this, e, i);
  }
  path(t, e, i) {
    const s = this.segments;
    const n = wn(this);
    let o = this._loop;
    e = e || 0;
    i = i || this.points.length - e;
    for (const a of s) {
      o &= n(t, this, a, {
        start: e,
        end: e + i - 1
      });
    }
    return !!o;
  }
  draw(t, e, i, s) {
    const n = this.options || {};
    if ((this.points || []).length && n.borderWidth) {
      t.save();
      Cn(t, this, i, s);
      t.restore();
    }
    if (this.animated) {
      this._pointsUpdated = false;
      this._path = undefined;
    }
  }
}
function Ln(t, e, i, s) {
  const n = t.options;
  const {
    [i]: o
  } = t.getProps([i], s);
  return Math.abs(e - o) < n.radius + n.hitRadius;
}
class On extends Ki {
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
    super();
    this.options = undefined;
    this.parsed = undefined;
    this.skip = undefined;
    this.stop = undefined;
    if (t) {
      Object.assign(this, t);
    }
  }
  inRange(t, e, i) {
    const s = this.options;
    const {
      x: n,
      y: o
    } = this.getProps(["x", "y"], i);
    return Math.pow(t - n, 2) + Math.pow(e - o, 2) < Math.pow(s.hitRadius + s.radius, 2);
  }
  inXRange(t, e) {
    return Ln(this, t, "x", e);
  }
  inYRange(t, e) {
    return Ln(this, t, "y", e);
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
    return (e + (e && t.borderWidth || 0)) * 2;
  }
  draw(t, e) {
    const i = this.options;
    if (!this.skip && !(i.radius < 0.1) && !!E(this, e, this.size(i) / 2)) {
      t.strokeStyle = i.borderColor;
      t.lineWidth = i.borderWidth;
      t.fillStyle = i.backgroundColor;
      At(t, i, this.x, this.y);
    }
  }
  getRange() {
    const t = this.options || {};
    return t.radius + t.hitRadius;
  }
}
function En(t, e) {
  const {
    x: i,
    y: s,
    base: n,
    width: o,
    height: a
  } = t.getProps(["x", "y", "base", "width", "height"], e);
  let r;
  let h;
  let l;
  let c;
  let d;
  if (t.horizontal) {
    d = a / 2;
    r = Math.min(i, n);
    h = Math.max(i, n);
    l = s - d;
    c = s + d;
  } else {
    d = o / 2;
    r = i - d;
    h = i + d;
    l = Math.min(s, n);
    c = Math.max(s, n);
  }
  return {
    left: r,
    top: l,
    right: h,
    bottom: c
  };
}
function Tn(t, e, i, s) {
  if (t) {
    return 0;
  } else {
    return Y(e, i, s);
  }
}
function Rn(t, e, i) {
  const s = t.options.borderWidth;
  const n = t.borderSkipped;
  const o = Ot(s);
  return {
    t: Tn(n.top, o.top, 0, i),
    r: Tn(n.right, o.right, 0, e),
    b: Tn(n.bottom, o.bottom, 0, i),
    l: Tn(n.left, o.left, 0, e)
  };
}
function zn(t, e, i) {
  const {
    enableBorderRadius: s
  } = t.getProps(["enableBorderRadius"]);
  const o = t.options.borderRadius;
  const a = Et(o);
  const r = Math.min(e, i);
  const h = t.borderSkipped;
  const l = s || n(o);
  return {
    topLeft: Tn(!l || h.top || h.left, a.topLeft, 0, r),
    topRight: Tn(!l || h.top || h.right, a.topRight, 0, r),
    bottomLeft: Tn(!l || h.bottom || h.left, a.bottomLeft, 0, r),
    bottomRight: Tn(!l || h.bottom || h.right, a.bottomRight, 0, r)
  };
}
function In(t) {
  const e = En(t);
  const i = e.right - e.left;
  const s = e.bottom - e.top;
  const n = Rn(t, i / 2, s / 2);
  const o = zn(t, i / 2, s / 2);
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
function Fn(t, e, i, s) {
  const n = e === null;
  const o = i === null;
  const a = t && (!n || !o) && En(t, s);
  return a && (n || _t(e, a.left, a.right)) && (o || _t(i, a.top, a.bottom));
}
function Vn(t) {
  return t.topLeft || t.topRight || t.bottomLeft || t.bottomRight;
}
function Bn(t, e) {
  t.rect(e.x, e.y, e.w, e.h);
}
function Nn(t, e, i = {}) {
  const s = t.x !== i.x ? -e : 0;
  const n = t.y !== i.y ? -e : 0;
  const o = (t.x + t.w !== i.x + i.w ? e : 0) - s;
  const a = (t.y + t.h !== i.y + i.h ? e : 0) - n;
  return {
    x: t.x + s,
    y: t.y + n,
    w: t.w + o,
    h: t.h + a,
    radius: t.radius
  };
}
class Wn extends Ki {
  static id = "bar";
  static defaults = {
    borderSkipped: "start",
    borderWidth: 0,
    borderRadius: 0,
    inflateAmount: "auto",
    pointStyle: undefined
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(t) {
    super();
    this.options = undefined;
    this.horizontal = undefined;
    this.base = undefined;
    this.width = undefined;
    this.height = undefined;
    this.inflateAmount = undefined;
    if (t) {
      Object.assign(this, t);
    }
  }
  draw(t) {
    const {
      inflateAmount: e,
      options: {
        borderColor: i,
        backgroundColor: s
      }
    } = this;
    const {
      inner: n,
      outer: o
    } = In(this);
    const a = Vn(o.radius) ? Lt : Bn;
    t.save();
    if (o.w !== n.w || o.h !== n.h) {
      t.beginPath();
      a(t, Nn(o, e, n));
      t.clip();
      a(t, Nn(n, -e, o));
      t.fillStyle = i;
      t.fill("evenodd");
    }
    t.beginPath();
    a(t, Nn(n, e));
    t.fillStyle = s;
    t.fill();
    t.restore();
  }
  inRange(t, e, i) {
    return Fn(this, t, e, i);
  }
  inXRange(t, e) {
    return Fn(this, t, null, e);
  }
  inYRange(t, e) {
    return Fn(this, null, t, e);
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
    if (t === "x") {
      return this.width / 2;
    } else {
      return this.height / 2;
    }
  }
}
var Hn = Object.freeze({
  __proto__: null,
  ArcElement: mn,
  BarElement: Wn,
  LineElement: An,
  PointElement: On
});
const jn = ["rgb(54, 162, 235)", "rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"];
const $n = jn.map(t => t.replace("rgb(", "rgba(").replace(")", ", 0.5)"));
function Un(t) {
  return jn[t % jn.length];
}
function Yn(t) {
  return $n[t % $n.length];
}
function Xn(t, e) {
  t.borderColor = Un(e);
  t.backgroundColor = Yn(e);
  return ++e;
}
function Gn(t, e) {
  t.backgroundColor = t.data.map(() => Un(e++));
  return e;
}
function Kn(t, e) {
  t.backgroundColor = t.data.map(() => Yn(e++));
  return e;
}
function qn(t) {
  let e = 0;
  return (i, s) => {
    const n = t.getDatasetMeta(s).controller;
    if (n instanceof $e) {
      e = Gn(i, e);
    } else if (n instanceof Ye) {
      e = Kn(i, e);
    } else if (n) {
      e = Xn(i, e);
    }
  };
}
function Jn(t) {
  let e;
  for (e in t) {
    if (t[e].borderColor || t[e].backgroundColor) {
      return true;
    }
  }
  return false;
}
function Zn(t) {
  return t && (t.borderColor || t.backgroundColor);
}
var Qn = {
  id: "colors",
  defaults: {
    enabled: true,
    forceOverride: false
  },
  beforeLayout(t, e, i) {
    if (!i.enabled) {
      return;
    }
    const {
      data: {
        datasets: s
      },
      options: n
    } = t.config;
    const {
      elements: o
    } = n;
    if (!i.forceOverride && (Jn(s) || Zn(n) || o && Jn(o))) {
      return;
    }
    const a = qn(t);
    s.forEach(a);
  }
};
function to(t, e, i, s, n) {
  const o = n.samples || s;
  if (o >= i) {
    return t.slice(e, e + i);
  }
  const a = [];
  const r = (i - 2) / (o - 2);
  let h = 0;
  const l = e + i - 1;
  let c;
  let d;
  let u;
  let g;
  let p;
  let f = e;
  a[h++] = t[f];
  c = 0;
  for (; c < o - 2; c++) {
    let s;
    let n = 0;
    let o = 0;
    const l = Math.floor((c + 1) * r) + 1 + e;
    const m = Math.min(Math.floor((c + 2) * r) + 1, i) + e;
    const x = m - l;
    for (s = l; s < m; s++) {
      n += t[s].x;
      o += t[s].y;
    }
    n /= x;
    o /= x;
    const b = Math.floor(c * r) + 1 + e;
    const _ = Math.min(Math.floor((c + 1) * r) + 1, i) + e;
    const {
      x: y,
      y: v
    } = t[f];
    u = g = -1;
    s = b;
    for (; s < _; s++) {
      g = Math.abs((y - n) * (t[s].y - v) - (y - t[s].x) * (o - v)) * 0.5;
      if (g > u) {
        u = g;
        d = t[s];
        p = s;
      }
    }
    a[h++] = d;
    f = p;
  }
  a[h++] = t[l];
  return a;
}
function eo(t, e, i, s) {
  let n;
  let o;
  let a;
  let r;
  let h;
  let l;
  let c;
  let d;
  let u;
  let g;
  let p = 0;
  let m = 0;
  const x = [];
  const b = e + i - 1;
  const _ = t[e].x;
  const y = t[b].x - _;
  for (n = e; n < e + i; ++n) {
    o = t[n];
    a = (o.x - _) / y * s;
    r = o.y;
    const e = a | 0;
    if (e === h) {
      if (r < u) {
        u = r;
        l = n;
      } else if (r > g) {
        g = r;
        c = n;
      }
      p = (m * p + o.x) / ++m;
    } else {
      const i = n - 1;
      if (!f(l) && !f(c)) {
        const e = Math.min(l, c);
        const s = Math.max(l, c);
        if (e !== d && e !== i) {
          x.push({
            ...t[e],
            x: p
          });
        }
        if (s !== d && s !== i) {
          x.push({
            ...t[s],
            x: p
          });
        }
      }
      if (n > 0 && i !== d) {
        x.push(t[i]);
      }
      x.push(o);
      h = e;
      m = 0;
      u = g = r;
      l = c = d = n;
    }
  }
  return x;
}
function io(t) {
  if (t._decimated) {
    const e = t._data;
    delete t._decimated;
    delete t._data;
    Object.defineProperty(t, "data", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: e
    });
  }
}
function so(t) {
  t.data.datasets.forEach(t => {
    io(t);
  });
}
function no(t, e) {
  const i = e.length;
  let s;
  let n = 0;
  const {
    iScale: o
  } = t;
  const {
    min: a,
    max: r,
    minDefined: h,
    maxDefined: l
  } = o.getUserBounds();
  if (h) {
    n = Y(O(e, o.axis, a).lo, 0, i - 1);
  }
  s = l ? Y(O(e, o.axis, r).hi + 1, n, i) - n : i - n;
  return {
    start: n,
    count: s
  };
}
var oo = {
  id: "decimation",
  defaults: {
    algorithm: "min-max",
    enabled: false
  },
  beforeElementsUpdate: (t, i, s) => {
    if (!s.enabled) {
      so(t);
      return;
    }
    const n = t.width;
    t.data.datasets.forEach((i, o) => {
      const {
        _data: a,
        indexAxis: r
      } = i;
      const h = t.getDatasetMeta(o);
      const l = a || i.data;
      if (e([r, t.options.indexAxis]) === "y") {
        return;
      }
      if (!h.controller.supportsDecimation) {
        return;
      }
      const c = t.scales[h.xAxisID];
      if (c.type !== "linear" && c.type !== "time") {
        return;
      }
      if (t.options.parsing) {
        return;
      }
      let {
        start: d,
        count: u
      } = no(h, l);
      if (u <= (s.threshold || n * 4)) {
        io(i);
        return;
      }
      let g;
      if (f(a)) {
        i._data = l;
        delete i.data;
        Object.defineProperty(i, "data", {
          configurable: true,
          enumerable: true,
          get: function () {
            return this._decimated;
          },
          set: function (t) {
            this._data = t;
          }
        });
      }
      switch (s.algorithm) {
        case "lttb":
          g = to(l, d, u, n, s);
          break;
        case "min-max":
          g = eo(l, d, u, n);
          break;
        default:
          throw new Error(`Unsupported decimation algorithm '${s.algorithm}'`);
      }
      i._decimated = g;
    });
  },
  destroy(t) {
    so(t);
  }
};
function ao(t, e, i) {
  const s = t.segments;
  const n = t.points;
  const o = e.points;
  const a = [];
  for (const t of s) {
    let {
      start: s,
      end: r
    } = t;
    r = lo(s, r, n);
    const h = ro(i, n[s], n[r], t.loop);
    if (!e.segments) {
      a.push({
        source: t,
        target: h,
        start: n[s],
        end: n[r]
      });
      continue;
    }
    const l = wt(e, h);
    for (const e of l) {
      const s = ro(i, o[e.start], o[e.end], e.loop);
      const r = Tt(t, n, s);
      for (const t of r) {
        a.push({
          source: t,
          target: e,
          start: {
            [i]: co(h, s, "start", Math.max)
          },
          end: {
            [i]: co(h, s, "end", Math.min)
          }
        });
      }
    }
  }
  return a;
}
function ro(t, e, i, s) {
  if (s) {
    return;
  }
  let n = e[t];
  let o = i[t];
  if (t === "angle") {
    n = Rt(n);
    o = Rt(o);
  }
  return {
    property: t,
    start: n,
    end: o
  };
}
function ho(t, e) {
  const {
    x: i = null,
    y: s = null
  } = t || {};
  const n = e.points;
  const o = [];
  e.segments.forEach(({
    start: t,
    end: e
  }) => {
    e = lo(t, e, n);
    const a = n[t];
    const r = n[e];
    if (s !== null) {
      o.push({
        x: a.x,
        y: s
      });
      o.push({
        x: r.x,
        y: s
      });
    } else if (i !== null) {
      o.push({
        x: i,
        y: a.y
      });
      o.push({
        x: i,
        y: r.y
      });
    }
  });
  return o;
}
function lo(t, e, i) {
  for (; e > t; e--) {
    const t = i[e];
    if (!isNaN(t.x) && !isNaN(t.y)) {
      break;
    }
  }
  return e;
}
function co(t, e, i, s) {
  if (t && e) {
    return s(t[i], e[i]);
  } else if (t) {
    return t[i];
  } else if (e) {
    return e[i];
  } else {
    return 0;
  }
}
function uo(t, e) {
  let i = [];
  let s = false;
  if (a(t)) {
    s = true;
    i = t;
  } else {
    i = ho(t, e);
  }
  if (i.length) {
    return new An({
      points: i,
      options: {
        tension: 0
      },
      _loop: s,
      _fullLoop: s
    });
  } else {
    return null;
  }
}
function go(t) {
  return t && t.fill !== false;
}
function po(t, e, i) {
  let s = t[e].fill;
  const n = [e];
  let o;
  if (!i) {
    return s;
  }
  while (s !== false && n.indexOf(s) === -1) {
    if (!d(s)) {
      return s;
    }
    o = t[s];
    if (!o) {
      return false;
    }
    if (o.visible) {
      return s;
    }
    n.push(s);
    s = o.fill;
  }
  return false;
}
function fo(t, e, i) {
  const s = _o(t);
  if (n(s)) {
    return !isNaN(s.value) && s;
  }
  let o = parseFloat(s);
  if (d(o) && Math.floor(o) === o) {
    return mo(s[0], e, o, i);
  } else {
    return ["origin", "start", "end", "stack", "shape"].indexOf(s) >= 0 && s;
  }
}
function mo(t, e, i, s) {
  if (t === "-" || t === "+") {
    i = e + i;
  }
  return i !== e && !(i < 0) && !(i >= s) && i;
}
function xo(t, e) {
  let i = null;
  if (t === "start") {
    i = e.bottom;
  } else if (t === "end") {
    i = e.top;
  } else if (n(t)) {
    i = e.getPixelForValue(t.value);
  } else if (e.getBasePixel) {
    i = e.getBasePixel();
  }
  return i;
}
function bo(t, e, i) {
  let s;
  s = t === "start" ? i : t === "end" ? e.options.reverse ? e.min : e.max : n(t) ? t.value : e.getBaseValue();
  return s;
}
function _o(t) {
  const e = t.options;
  const i = e.fill;
  let s = r(i && i.target, i);
  if (s === undefined) {
    s = !!e.backgroundColor;
  }
  return s !== false && s !== null && (s === true ? "origin" : s);
}
function yo(t) {
  const {
    scale: e,
    index: i,
    line: s
  } = t;
  const n = [];
  const o = s.segments;
  const a = s.points;
  const r = vo(e, i);
  r.push(uo({
    x: null,
    y: e.bottom
  }, s));
  for (let t = 0; t < o.length; t++) {
    const e = o[t];
    for (let t = e.start; t <= e.end; t++) {
      Mo(n, a[t], r);
    }
  }
  return new An({
    points: n,
    options: {}
  });
}
function vo(t, e) {
  const i = [];
  const s = t.getMatchingVisibleMetas("line");
  for (let t = 0; t < s.length; t++) {
    const n = s[t];
    if (n.index === e) {
      break;
    }
    if (!n.hidden) {
      i.unshift(n.dataset);
    }
  }
  return i;
}
function Mo(t, e, i) {
  const s = [];
  for (let n = 0; n < i.length; n++) {
    const o = i[n];
    const {
      first: a,
      last: r,
      point: h
    } = wo(o, e, "x");
    if (!!h && (!a || !r)) {
      if (a) {
        s.unshift(h);
      } else {
        t.push(h);
        if (!r) {
          break;
        }
      }
    }
  }
  t.push(...s);
}
function wo(t, e, i) {
  const s = t.interpolate(e, i);
  if (!s) {
    return {};
  }
  const n = s[i];
  const o = t.segments;
  const a = t.points;
  let r = false;
  let h = false;
  for (let t = 0; t < o.length; t++) {
    const e = o[t];
    const s = a[e.start][i];
    const l = a[e.end][i];
    if (_t(n, s, l)) {
      r = n === s;
      h = n === l;
      break;
    }
  }
  return {
    first: r,
    last: h,
    point: s
  };
}
class ko {
  constructor(t) {
    this.x = t.x;
    this.y = t.y;
    this.radius = t.radius;
  }
  pathSegment(t, e, i) {
    const {
      x: s,
      y: n,
      radius: o
    } = this;
    e = e || {
      start: 0,
      end: y
    };
    t.arc(s, n, o, e.end, e.start, true);
    return !i.bounds;
  }
  interpolate(t) {
    const {
      x: e,
      y: i,
      radius: s
    } = this;
    const n = t.angle;
    return {
      x: e + Math.cos(n) * s,
      y: i + Math.sin(n) * s,
      angle: n
    };
  }
}
function So(t) {
  const {
    chart: e,
    fill: i,
    line: s
  } = t;
  if (d(i)) {
    return Do(e, i);
  }
  if (i === "stack") {
    return yo(t);
  }
  if (i === "shape") {
    return true;
  }
  const n = Po(t);
  if (n instanceof ko) {
    return n;
  } else {
    return uo(n, s);
  }
}
function Do(t, e) {
  const i = t.getDatasetMeta(e);
  if (i && t.isDatasetVisible(e)) {
    return i.dataset;
  } else {
    return null;
  }
}
function Po(t) {
  if ((t.scale || {}).getPointPositionForValue) {
    return Ao(t);
  } else {
    return Co(t);
  }
}
function Co(t) {
  const {
    scale: e = {},
    fill: i
  } = t;
  const s = xo(i, e);
  if (d(s)) {
    const t = e.isHorizontal();
    return {
      x: t ? s : null,
      y: t ? null : s
    };
  }
  return null;
}
function Ao(t) {
  const {
    scale: e,
    fill: i
  } = t;
  const s = e.options;
  const n = e.getLabels().length;
  const o = s.reverse ? e.max : e.min;
  const a = bo(i, e, o);
  const r = [];
  if (s.grid.circular) {
    const t = e.getPointPositionForValue(0, o);
    return new ko({
      x: t.x,
      y: t.y,
      radius: e.getDistanceFromCenterForValue(a)
    });
  }
  for (let t = 0; t < n; ++t) {
    r.push(e.getPointPositionForValue(t, a));
  }
  return r;
}
function Lo(t, e, i) {
  const s = So(e);
  const {
    line: n,
    scale: o,
    axis: a
  } = e;
  const r = n.options;
  const h = r.fill;
  const l = r.backgroundColor;
  const {
    above: c = l,
    below: d = l
  } = h || {};
  if (s && n.points.length) {
    J(t, i);
    Oo(t, {
      line: n,
      target: s,
      above: c,
      below: d,
      area: i,
      scale: o,
      axis: a
    });
    Q(t);
  }
}
function Oo(t, e) {
  const {
    line: i,
    target: s,
    above: n,
    below: o,
    area: a,
    scale: r
  } = e;
  const h = i._loop ? "angle" : e.axis;
  t.save();
  if (h === "x" && o !== n) {
    Eo(t, s, a.top);
    To(t, {
      line: i,
      target: s,
      color: n,
      scale: r,
      property: h
    });
    t.restore();
    t.save();
    Eo(t, s, a.bottom);
  }
  To(t, {
    line: i,
    target: s,
    color: o,
    scale: r,
    property: h
  });
  t.restore();
}
function Eo(t, e, i) {
  const {
    segments: s,
    points: n
  } = e;
  let o = true;
  let a = false;
  t.beginPath();
  for (const r of s) {
    const {
      start: s,
      end: h
    } = r;
    const l = n[s];
    const c = n[lo(s, h, n)];
    if (o) {
      t.moveTo(l.x, l.y);
      o = false;
    } else {
      t.lineTo(l.x, i);
      t.lineTo(l.x, l.y);
    }
    a = !!e.pathSegment(t, r, {
      move: a
    });
    if (a) {
      t.closePath();
    } else {
      t.lineTo(c.x, i);
    }
  }
  t.lineTo(e.first().x, i);
  t.closePath();
  t.clip();
}
function To(t, e) {
  const {
    line: i,
    target: s,
    property: n,
    color: o,
    scale: a
  } = e;
  const r = ao(i, s, n);
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
    } = e;
    const d = s !== true;
    t.save();
    t.fillStyle = r;
    Ro(t, a, d && ro(n, l, c));
    t.beginPath();
    const u = !!i.pathSegment(t, e);
    let g;
    if (d) {
      if (u) {
        t.closePath();
      } else {
        zo(t, s, c, n);
      }
      const e = !!s.pathSegment(t, h, {
        move: u,
        reverse: true
      });
      g = u && e;
      if (!g) {
        zo(t, s, l, n);
      }
    }
    t.closePath();
    t.fill(g ? "evenodd" : "nonzero");
    t.restore();
  }
}
function Ro(t, e, i) {
  const {
    top: s,
    bottom: n
  } = e.chart.chartArea;
  const {
    property: o,
    start: a,
    end: r
  } = i || {};
  if (o === "x") {
    t.beginPath();
    t.rect(a, s, r - a, n - s);
    t.clip();
  }
}
function zo(t, e, i, s) {
  const n = e.interpolate(i, s);
  if (n) {
    t.lineTo(n.x, n.y);
  }
}
var Io = {
  id: "filler",
  afterDatasetsUpdate(t, e, i) {
    const s = (t.data.datasets || []).length;
    const n = [];
    let o;
    let a;
    let r;
    let h;
    for (a = 0; a < s; ++a) {
      o = t.getDatasetMeta(a);
      r = o.dataset;
      h = null;
      if (r && r.options && r instanceof An) {
        h = {
          visible: t.isDatasetVisible(a),
          index: a,
          fill: fo(r, a, s),
          chart: t,
          axis: o.controller.options.indexAxis,
          scale: o.vScale,
          line: r
        };
      }
      o.$filler = h;
      n.push(h);
    }
    for (a = 0; a < s; ++a) {
      h = n[a];
      if (h && h.fill !== false) {
        h.fill = po(n, a, i.propagate);
      }
    }
  },
  beforeDraw(t, e, i) {
    const s = i.drawTime === "beforeDraw";
    const n = t.getSortedVisibleDatasetMetas();
    const o = t.chartArea;
    for (let e = n.length - 1; e >= 0; --e) {
      const i = n[e].$filler;
      if (i) {
        i.line.updateControlPoints(o, i.axis);
        if (s && i.fill) {
          Lo(t.ctx, i, o);
        }
      }
    }
  },
  beforeDatasetsDraw(t, e, i) {
    if (i.drawTime !== "beforeDatasetsDraw") {
      return;
    }
    const s = t.getSortedVisibleDatasetMetas();
    for (let e = s.length - 1; e >= 0; --e) {
      const i = s[e].$filler;
      if (go(i)) {
        Lo(t.ctx, i, t.chartArea);
      }
    }
  },
  beforeDatasetDraw(t, e, i) {
    const s = e.meta.$filler;
    if (go(s) && i.drawTime === "beforeDatasetDraw") {
      Lo(t.ctx, s, t.chartArea);
    }
  },
  defaults: {
    propagate: true,
    drawTime: "beforeDatasetDraw"
  }
};
const Fo = (t, e) => {
  let {
    boxHeight: i = e,
    boxWidth: s = e
  } = t;
  if (t.usePointStyle) {
    i = Math.min(i, e);
    s = t.pointStyleWidth || Math.min(s, e);
  }
  return {
    boxWidth: s,
    boxHeight: i,
    itemHeight: Math.max(e, i)
  };
};
const Vo = (t, e) => t !== null && e !== null && t.datasetIndex === e.datasetIndex && t.index === e.index;
class Bo extends Ki {
  constructor(t) {
    super();
    this._added = false;
    this.legendHitBoxes = [];
    this._hoveredItem = null;
    this.doughnutMode = false;
    this.chart = t.chart;
    this.options = t.options;
    this.ctx = t.ctx;
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
  update(t, e, i) {
    this.maxWidth = t;
    this.maxHeight = e;
    this._margins = i;
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
    const t = this.options.labels || {};
    let e = $(t.generateLabels, [this.chart], this) || [];
    if (t.filter) {
      e = e.filter(e => t.filter(e, this.chart.data));
    }
    if (t.sort) {
      e = e.sort((e, i) => t.sort(e, i, this.chart.data));
    }
    if (this.options.reverse) {
      e.reverse();
    }
    this.legendItems = e;
  }
  fit() {
    const {
      options: t,
      ctx: e
    } = this;
    if (!t.display) {
      this.width = this.height = 0;
      return;
    }
    const i = t.labels;
    const s = tt(i.font);
    const n = s.size;
    const o = this._computeTitleHeight();
    const {
      boxWidth: a,
      itemHeight: r
    } = Fo(i, n);
    let h;
    let l;
    e.font = s.string;
    if (this.isHorizontal()) {
      h = this.maxWidth;
      l = this._fitRows(o, n, a, r) + 10;
    } else {
      l = this.maxHeight;
      h = this._fitCols(o, s, a, r) + 10;
    }
    this.width = Math.min(h, t.maxWidth || this.maxWidth);
    this.height = Math.min(l, t.maxHeight || this.maxHeight);
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
    } = this;
    const r = this.legendHitBoxes = [];
    const h = this.lineWidths = [0];
    const l = s + a;
    let c = t;
    n.textAlign = "left";
    n.textBaseline = "middle";
    let d = -1;
    let u = -l;
    this.legendItems.forEach((t, g) => {
      const p = i + e / 2 + n.measureText(t.text).width;
      if (g === 0 || h[h.length - 1] + p + a * 2 > o) {
        c += l;
        h[h.length - (g > 0 ? 0 : 1)] = 0;
        u += l;
        d++;
      }
      r[g] = {
        left: 0,
        top: u,
        row: d,
        width: p,
        height: s
      };
      h[h.length - 1] += p + a;
    });
    return c;
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
    } = this;
    const r = this.legendHitBoxes = [];
    const h = this.columnSizes = [];
    const l = o - t;
    let c = a;
    let d = 0;
    let u = 0;
    let g = 0;
    let p = 0;
    this.legendItems.forEach((t, o) => {
      const {
        itemWidth: f,
        itemHeight: m
      } = No(i, e, n, t, s);
      if (o > 0 && u + m + a * 2 > l) {
        c += d + a;
        h.push({
          width: d,
          height: u
        });
        g += d + a;
        p++;
        d = u = 0;
      }
      r[o] = {
        left: g,
        top: u,
        col: p,
        width: f,
        height: m
      };
      d = Math.max(d, f);
      u += m + a;
    });
    c += d;
    h.push({
      width: d,
      height: u
    });
    return c;
  }
  adjustHitBoxes() {
    if (!this.options.display) {
      return;
    }
    const t = this._computeTitleHeight();
    const {
      legendHitBoxes: e,
      options: {
        align: i,
        labels: {
          padding: s
        },
        rtl: n
      }
    } = this;
    const o = zt(n, this.left, this.width);
    if (this.isHorizontal()) {
      let n = 0;
      let a = it(i, this.left + s, this.right - this.lineWidths[n]);
      for (const r of e) {
        if (n !== r.row) {
          n = r.row;
          a = it(i, this.left + s, this.right - this.lineWidths[n]);
        }
        r.top += this.top + t + s;
        r.left = o.leftForLtr(o.x(a), r.width);
        a += r.width + s;
      }
    } else {
      let n = 0;
      let a = it(i, this.top + t + s, this.bottom - this.columnSizes[n].height);
      for (const r of e) {
        if (r.col !== n) {
          n = r.col;
          a = it(i, this.top + t + s, this.bottom - this.columnSizes[n].height);
        }
        r.top = a;
        r.left += this.left + s;
        r.left = o.leftForLtr(o.x(r.left), r.width);
        a += r.height + s;
      }
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const t = this.ctx;
      J(t, this);
      this._draw();
      Q(t);
    }
  }
  _draw() {
    const {
      options: t,
      columnSizes: e,
      lineWidths: i,
      ctx: s
    } = this;
    const {
      align: n,
      labels: a
    } = t;
    const h = o.color;
    const l = zt(t.rtl, this.left, this.width);
    const c = tt(a.font);
    const {
      padding: d
    } = a;
    const u = c.size;
    const g = u / 2;
    let p;
    this.drawTitle();
    s.textAlign = l.textAlign("left");
    s.textBaseline = "middle";
    s.lineWidth = 0.5;
    s.font = c.string;
    const {
      boxWidth: f,
      boxHeight: m,
      itemHeight: x
    } = Fo(a, u);
    const b = this.isHorizontal();
    const _ = this._computeTitleHeight();
    p = b ? {
      x: it(n, this.left + d, this.right - i[0]),
      y: this.top + d + _,
      line: 0
    } : {
      x: this.left + d,
      y: it(n, this.top + _ + d, this.bottom - e[0].height),
      line: 0
    };
    It(this.ctx, t.textDirection);
    const y = x + d;
    this.legendItems.forEach((o, v) => {
      s.strokeStyle = o.fontColor;
      s.fillStyle = o.fontColor;
      const M = s.measureText(o.text).width;
      const w = l.textAlign(o.textAlign ||= a.textAlign);
      const k = f + g + M;
      let S = p.x;
      let D = p.y;
      l.setWidth(this.width);
      if (b) {
        if (v > 0 && S + k + d > this.right) {
          D = p.y += y;
          p.line++;
          S = p.x = it(n, this.left + d, this.right - i[p.line]);
        }
      } else if (v > 0 && D + y > this.bottom) {
        S = p.x = S + e[p.line].width + d;
        p.line++;
        D = p.y = it(n, this.top + _ + d, this.bottom - e[p.line].height);
      }
      (function (t, e, i) {
        if (isNaN(f) || f <= 0 || isNaN(m) || m < 0) {
          return;
        }
        s.save();
        const n = r(i.lineWidth, 1);
        s.fillStyle = r(i.fillStyle, h);
        s.lineCap = r(i.lineCap, "butt");
        s.lineDashOffset = r(i.lineDashOffset, 0);
        s.lineJoin = r(i.lineJoin, "miter");
        s.lineWidth = n;
        s.strokeStyle = r(i.strokeStyle, h);
        s.setLineDash(r(i.lineDash, []));
        if (a.usePointStyle) {
          const o = {
            radius: m * Math.SQRT2 / 2,
            pointStyle: i.pointStyle,
            rotation: i.rotation,
            borderWidth: n
          };
          const r = l.xPlus(t, f / 2);
          Bt(s, o, r, e + g, a.pointStyleWidth && f);
        } else {
          const o = e + Math.max((u - m) / 2, 0);
          const a = l.leftForLtr(t, f);
          const r = Et(i.borderRadius);
          s.beginPath();
          if (Object.values(r).some(t => t !== 0)) {
            Lt(s, {
              x: a,
              y: o,
              w: f,
              h: m,
              radius: r
            });
          } else {
            s.rect(a, o, f, m);
          }
          s.fill();
          if (n !== 0) {
            s.stroke();
          }
        }
        s.restore();
      })(l.x(S), D, o);
      S = Ft(w, S + f + g, b ? S + k : this.right, t.rtl);
      (function (t, e, i) {
        Z(s, i.text, t, e + x / 2, c, {
          strikethrough: i.hidden,
          textAlign: l.textAlign(i.textAlign)
        });
      })(l.x(S), D, o);
      if (b) {
        p.x += k + d;
      } else if (typeof o.text != "string") {
        const t = c.lineHeight;
        p.y += jo(o, t) + d;
      } else {
        p.y += y;
      }
    });
    Vt(this.ctx, t.textDirection);
  }
  drawTitle() {
    const t = this.options;
    const e = t.title;
    const i = tt(e.font);
    const s = R(e.padding);
    if (!e.display) {
      return;
    }
    const n = zt(t.rtl, this.left, this.width);
    const o = this.ctx;
    const a = e.position;
    const r = i.size / 2;
    const h = s.top + r;
    let l;
    let c = this.left;
    let d = this.width;
    if (this.isHorizontal()) {
      d = Math.max(...this.lineWidths);
      l = this.top + h;
      c = it(t.align, c, this.right - d);
    } else {
      const e = this.columnSizes.reduce((t, e) => Math.max(t, e.height), 0);
      l = h + it(t.align, this.top, this.bottom - e - t.labels.padding - this._computeTitleHeight());
    }
    const u = it(a, c, c + d);
    o.textAlign = n.textAlign(et(a));
    o.textBaseline = "middle";
    o.strokeStyle = e.color;
    o.fillStyle = e.color;
    o.font = i.string;
    Z(o, e.text, u, l, i);
  }
  _computeTitleHeight() {
    const t = this.options.title;
    const e = tt(t.font);
    const i = R(t.padding);
    if (t.display) {
      return e.lineHeight + i.height;
    } else {
      return 0;
    }
  }
  _getLegendItemAt(t, e) {
    let i;
    let s;
    let n;
    if (_t(t, this.left, this.right) && _t(e, this.top, this.bottom)) {
      n = this.legendHitBoxes;
      i = 0;
      for (; i < n.length; ++i) {
        s = n[i];
        if (_t(t, s.left, s.left + s.width) && _t(e, s.top, s.top + s.height)) {
          return this.legendItems[i];
        }
      }
    }
    return null;
  }
  handleEvent(t) {
    const e = this.options;
    if (!$o(t.type, e)) {
      return;
    }
    const i = this._getLegendItemAt(t.x, t.y);
    if (t.type === "mousemove" || t.type === "mouseout") {
      const s = this._hoveredItem;
      const n = Vo(s, i);
      if (s && !n) {
        $(e.onLeave, [t, s, this], this);
      }
      this._hoveredItem = i;
      if (i && !n) {
        $(e.onHover, [t, i, this], this);
      }
    } else if (i) {
      $(e.onClick, [t, i, this], this);
    }
  }
}
function No(t, e, i, s, n) {
  return {
    itemWidth: Wo(s, t, e, i),
    itemHeight: Ho(n, s, e.lineHeight)
  };
}
function Wo(t, e, i, s) {
  let n = t.text;
  if (n && typeof n != "string") {
    n = n.reduce((t, e) => t.length > e.length ? t : e);
  }
  return e + i.size / 2 + s.measureText(n).width;
}
function Ho(t, e, i) {
  let s = t;
  if (typeof e.text != "string") {
    s = jo(e, i);
  }
  return s;
}
function jo(t, e) {
  return e * (t.text ? t.text.length : 0);
}
function $o(t, e) {
  return (t === "mousemove" || t === "mouseout") && (!!e.onHover || !!e.onLeave) || !!e.onClick && (t === "click" || t === "mouseup");
}
var Uo = {
  id: "legend",
  _element: Bo,
  start(t, e, i) {
    const s = t.legend = new Bo({
      ctx: t.ctx,
      options: i,
      chart: t
    });
    Si.configure(t, s, i);
    Si.addBox(t, s);
  },
  stop(t) {
    Si.removeBox(t, t.legend);
    delete t.legend;
  },
  beforeUpdate(t, e, i) {
    const s = t.legend;
    Si.configure(t, s, i);
    s.options = i;
  },
  afterUpdate(t) {
    const e = t.legend;
    e.buildLabels();
    e.adjustHitBoxes();
  },
  afterEvent(t, e) {
    if (!e.replay) {
      t.legend.handleEvent(e.event);
    }
  },
  defaults: {
    display: true,
    position: "top",
    align: "center",
    fullSize: true,
    reverse: false,
    weight: 1000,
    onClick(t, e, i) {
      const s = e.datasetIndex;
      const n = i.chart;
      if (n.isDatasetVisible(s)) {
        n.hide(s);
        e.hidden = true;
      } else {
        n.show(s);
        e.hidden = false;
      }
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: t => t.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(t) {
        const e = t.data.datasets;
        const {
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
          const h = t.controller.getStyle(i ? 0 : undefined);
          const l = R(h.borderWidth);
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
      display: false,
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
class Yo extends Ki {
  constructor(t) {
    super();
    this.chart = t.chart;
    this.options = t.options;
    this.ctx = t.ctx;
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
  update(t, e) {
    const i = this.options;
    this.left = 0;
    this.top = 0;
    if (!i.display) {
      this.width = this.height = this.right = this.bottom = 0;
      return;
    }
    this.width = this.right = t;
    this.height = this.bottom = e;
    const s = a(i.text) ? i.text.length : 1;
    this._padding = R(i.padding);
    const n = s * tt(i.font).lineHeight + this._padding.height;
    if (this.isHorizontal()) {
      this.height = n;
    } else {
      this.width = n;
    }
  }
  isHorizontal() {
    const t = this.options.position;
    return t === "top" || t === "bottom";
  }
  _drawArgs(t) {
    const {
      top: e,
      left: i,
      bottom: s,
      right: n,
      options: o
    } = this;
    const a = o.align;
    let r;
    let h;
    let l;
    let c = 0;
    if (this.isHorizontal()) {
      h = it(a, i, n);
      l = e + t;
      r = n - i;
    } else {
      if (o.position === "left") {
        h = i + t;
        l = it(a, s, e);
        c = k * -0.5;
      } else {
        h = n - t;
        l = it(a, e, s);
        c = k * 0.5;
      }
      r = s - e;
    }
    return {
      titleX: h,
      titleY: l,
      maxWidth: r,
      rotation: c
    };
  }
  draw() {
    const t = this.ctx;
    const e = this.options;
    if (!e.display) {
      return;
    }
    const i = tt(e.font);
    const s = i.lineHeight / 2 + this._padding.top;
    const {
      titleX: n,
      titleY: o,
      maxWidth: a,
      rotation: r
    } = this._drawArgs(s);
    Z(t, e.text, 0, 0, i, {
      color: e.color,
      maxWidth: a,
      rotation: r,
      textAlign: et(e.align),
      textBaseline: "middle",
      translation: [n, o]
    });
  }
}
function Xo(t, e) {
  const i = new Yo({
    ctx: t.ctx,
    options: e,
    chart: t
  });
  Si.configure(t, i, e);
  Si.addBox(t, i);
  t.titleBlock = i;
}
var Go = {
  id: "title",
  _element: Yo,
  start(t, e, i) {
    Xo(t, i);
  },
  stop(t) {
    const e = t.titleBlock;
    Si.removeBox(t, e);
    delete t.titleBlock;
  },
  beforeUpdate(t, e, i) {
    const s = t.titleBlock;
    Si.configure(t, s, i);
    s.options = i;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "bold"
    },
    fullSize: true,
    padding: 10,
    position: "top",
    text: "",
    weight: 2000
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
const Ko = new WeakMap();
var qo = {
  id: "subtitle",
  start(t, e, i) {
    const s = new Yo({
      ctx: t.ctx,
      options: i,
      chart: t
    });
    Si.configure(t, s, i);
    Si.addBox(t, s);
    Ko.set(t, s);
  },
  stop(t) {
    Si.removeBox(t, Ko.get(t));
    Ko.delete(t);
  },
  beforeUpdate(t, e, i) {
    const s = Ko.get(t);
    Si.configure(t, s, i);
    s.options = i;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "normal"
    },
    fullSize: true,
    padding: 0,
    position: "top",
    text: "",
    weight: 1500
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
const Jo = {
  average(t) {
    if (!t.length) {
      return false;
    }
    let e;
    let i;
    let s = 0;
    let n = 0;
    let o = 0;
    e = 0;
    i = t.length;
    for (; e < i; ++e) {
      const i = t[e].element;
      if (i && i.hasValue()) {
        const t = i.tooltipPosition();
        s += t.x;
        n += t.y;
        ++o;
      }
    }
    return {
      x: s / o,
      y: n / o
    };
  },
  nearest(t, e) {
    if (!t.length) {
      return false;
    }
    let i;
    let s;
    let n;
    let o = e.x;
    let a = e.y;
    let r = Number.POSITIVE_INFINITY;
    i = 0;
    s = t.length;
    for (; i < s; ++i) {
      const s = t[i].element;
      if (s && s.hasValue()) {
        const t = s.getCenterPoint();
        const i = Nt(e, t);
        if (i < r) {
          r = i;
          n = s;
        }
      }
    }
    if (n) {
      const t = n.tooltipPosition();
      o = t.x;
      a = t.y;
    }
    return {
      x: o,
      y: a
    };
  }
};
function Zo(t, e) {
  if (e) {
    if (a(e)) {
      Array.prototype.push.apply(t, e);
    } else {
      t.push(e);
    }
  }
  return t;
}
function Qo(t) {
  if ((typeof t == "string" || t instanceof String) && t.indexOf("\n") > -1) {
    return t.split("\n");
  } else {
    return t;
  }
}
function ta(t, e) {
  const {
    element: i,
    datasetIndex: s,
    index: n
  } = e;
  const o = t.getDatasetMeta(s).controller;
  const {
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
function ea(t, e) {
  const i = t.chart.ctx;
  const {
    body: s,
    footer: n,
    title: o
  } = t;
  const {
    boxWidth: a,
    boxHeight: r
  } = e;
  const h = tt(e.bodyFont);
  const l = tt(e.titleFont);
  const c = tt(e.footerFont);
  const d = o.length;
  const u = n.length;
  const g = s.length;
  const p = R(e.padding);
  let f = p.height;
  let m = 0;
  let x = s.reduce((t, e) => t + e.before.length + e.lines.length + e.after.length, 0);
  x += t.beforeBody.length + t.afterBody.length;
  if (d) {
    f += d * l.lineHeight + (d - 1) * e.titleSpacing + e.titleMarginBottom;
  }
  if (x) {
    f += g * (e.displayColors ? Math.max(r, h.lineHeight) : h.lineHeight) + (x - g) * h.lineHeight + (x - 1) * e.bodySpacing;
  }
  if (u) {
    f += e.footerMarginTop + u * c.lineHeight + (u - 1) * e.footerSpacing;
  }
  let b = 0;
  const _ = function (t) {
    m = Math.max(m, i.measureText(t).width + b);
  };
  i.save();
  i.font = l.string;
  z(t.title, _);
  i.font = h.string;
  z(t.beforeBody.concat(t.afterBody), _);
  b = e.displayColors ? a + 2 + e.boxPadding : 0;
  z(s, t => {
    z(t.before, _);
    z(t.lines, _);
    z(t.after, _);
  });
  b = 0;
  i.font = c.string;
  z(t.footer, _);
  i.restore();
  m += p.width;
  return {
    width: m,
    height: f
  };
}
function ia(t, e) {
  const {
    y: i,
    height: s
  } = e;
  if (i < s / 2) {
    return "top";
  } else if (i > t.height - s / 2) {
    return "bottom";
  } else {
    return "center";
  }
}
function sa(t, e, i, s) {
  const {
    x: n,
    width: o
  } = s;
  const a = i.caretSize + i.caretPadding;
  return t === "left" && n + o + a > e.width || t === "right" && n - o - a < 0 || undefined;
}
function na(t, e, i, s) {
  const {
    x: n,
    width: o
  } = i;
  const {
    width: a,
    chartArea: {
      left: r,
      right: h
    }
  } = t;
  let l = "center";
  if (s === "center") {
    l = n <= (r + h) / 2 ? "left" : "right";
  } else if (n <= o / 2) {
    l = "left";
  } else if (n >= a - o / 2) {
    l = "right";
  }
  if (sa(l, t, e, i)) {
    l = "center";
  }
  return l;
}
function oa(t, e, i) {
  const s = i.yAlign || e.yAlign || ia(t, i);
  return {
    xAlign: i.xAlign || e.xAlign || na(t, e, i, s),
    yAlign: s
  };
}
function aa(t, e) {
  let {
    x: i,
    width: s
  } = t;
  if (e === "right") {
    i -= s;
  } else if (e === "center") {
    i -= s / 2;
  }
  return i;
}
function ra(t, e, i) {
  let {
    y: s,
    height: n
  } = t;
  if (e === "top") {
    s += i;
  } else {
    s -= e === "bottom" ? n + i : n / 2;
  }
  return s;
}
function ha(t, e, i, s) {
  const {
    caretSize: n,
    caretPadding: o,
    cornerRadius: a
  } = t;
  const {
    xAlign: r,
    yAlign: h
  } = i;
  const l = n + o;
  const {
    topLeft: c,
    topRight: d,
    bottomLeft: u,
    bottomRight: g
  } = Et(a);
  let p = aa(e, r);
  const f = ra(e, h, l);
  if (h === "center") {
    if (r === "left") {
      p += l;
    } else if (r === "right") {
      p -= l;
    }
  } else if (r === "left") {
    p -= Math.max(c, u) + n;
  } else if (r === "right") {
    p += Math.max(d, g) + n;
  }
  return {
    x: Y(p, 0, s.width - e.width),
    y: Y(f, 0, s.height - e.height)
  };
}
function la(t, e, i) {
  const s = R(i.padding);
  if (e === "center") {
    return t.x + t.width / 2;
  } else if (e === "right") {
    return t.x + t.width - s.right;
  } else {
    return t.x + s.left;
  }
}
function ca(t) {
  return Zo([], Qo(t));
}
function da(t, e, i) {
  return p(t, {
    tooltip: e,
    tooltipItems: i,
    type: "tooltip"
  });
}
function ua(t, e) {
  const i = e && e.dataset && e.dataset.tooltip && e.dataset.tooltip.callbacks;
  if (i) {
    return t.override(i);
  } else {
    return t;
  }
}
const ga = {
  beforeTitle: Wt,
  title(t) {
    if (t.length > 0) {
      const e = t[0];
      const i = e.chart.data.labels;
      const s = i ? i.length : 0;
      if (this && this.options && this.options.mode === "dataset") {
        return e.dataset.label || "";
      }
      if (e.label) {
        return e.label;
      }
      if (s > 0 && e.dataIndex < s) {
        return i[e.dataIndex];
      }
    }
    return "";
  },
  afterTitle: Wt,
  beforeBody: Wt,
  beforeLabel: Wt,
  label(t) {
    if (this && this.options && this.options.mode === "dataset") {
      return t.label + ": " + t.formattedValue || t.formattedValue;
    }
    let e = t.dataset.label || "";
    if (e) {
      e += ": ";
    }
    const i = t.formattedValue;
    if (!f(i)) {
      e += i;
    }
    return e;
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
  afterLabel: Wt,
  afterBody: Wt,
  beforeFooter: Wt,
  footer: Wt,
  afterFooter: Wt
};
function pa(t, e, i, s) {
  const n = t[e].call(i, s);
  if (n === undefined) {
    return ga[e].call(i, s);
  } else {
    return n;
  }
}
class fa extends Ki {
  static positioners = Jo;
  constructor(t) {
    super();
    this.opacity = 0;
    this._active = [];
    this._eventPosition = undefined;
    this._size = undefined;
    this._cachedAnimations = undefined;
    this._tooltipItems = [];
    this.$animations = undefined;
    this.$context = undefined;
    this.chart = t.chart;
    this.options = t.options;
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
  initialize(t) {
    this.options = t;
    this._cachedAnimations = undefined;
    this.$context = undefined;
  }
  _resolveAnimations() {
    const t = this._cachedAnimations;
    if (t) {
      return t;
    }
    const e = this.chart;
    const i = this.options.setContext(this.getContext());
    const s = i.enabled && e.options.animation && i.animations;
    const n = new se(this.chart, s);
    if (s._cacheable) {
      this._cachedAnimations = Object.freeze(n);
    }
    return n;
  }
  getContext() {
    return this.$context ||= da(this.chart.getContext(), this, this._tooltipItems);
  }
  getTitle(t, e) {
    const {
      callbacks: i
    } = e;
    const s = pa(i, "beforeTitle", this, t);
    const n = pa(i, "title", this, t);
    const o = pa(i, "afterTitle", this, t);
    let a = [];
    a = Zo(a, Qo(s));
    a = Zo(a, Qo(n));
    a = Zo(a, Qo(o));
    return a;
  }
  getBeforeBody(t, e) {
    return ca(pa(e.callbacks, "beforeBody", this, t));
  }
  getBody(t, e) {
    const {
      callbacks: i
    } = e;
    const s = [];
    z(t, t => {
      const e = {
        before: [],
        lines: [],
        after: []
      };
      const n = ua(i, t);
      Zo(e.before, Qo(pa(n, "beforeLabel", this, t)));
      Zo(e.lines, pa(n, "label", this, t));
      Zo(e.after, Qo(pa(n, "afterLabel", this, t)));
      s.push(e);
    });
    return s;
  }
  getAfterBody(t, e) {
    return ca(pa(e.callbacks, "afterBody", this, t));
  }
  getFooter(t, e) {
    const {
      callbacks: i
    } = e;
    const s = pa(i, "beforeFooter", this, t);
    const n = pa(i, "footer", this, t);
    const o = pa(i, "afterFooter", this, t);
    let a = [];
    a = Zo(a, Qo(s));
    a = Zo(a, Qo(n));
    a = Zo(a, Qo(o));
    return a;
  }
  _createItems(t) {
    const e = this._active;
    const i = this.chart.data;
    const s = [];
    const n = [];
    const o = [];
    let a;
    let r;
    let h = [];
    a = 0;
    r = e.length;
    for (; a < r; ++a) {
      h.push(ta(this.chart, e[a]));
    }
    if (t.filter) {
      h = h.filter((e, s, n) => t.filter(e, s, n, i));
    }
    if (t.itemSort) {
      h = h.sort((e, s) => t.itemSort(e, s, i));
    }
    z(h, e => {
      const i = ua(t.callbacks, e);
      s.push(pa(i, "labelColor", this, e));
      n.push(pa(i, "labelPointStyle", this, e));
      o.push(pa(i, "labelTextColor", this, e));
    });
    this.labelColors = s;
    this.labelPointStyles = n;
    this.labelTextColors = o;
    this.dataPoints = h;
    return h;
  }
  update(t, e) {
    const i = this.options.setContext(this.getContext());
    const s = this._active;
    let n;
    let o = [];
    if (s.length) {
      const t = Jo[i.position].call(this, s, this._eventPosition);
      o = this._createItems(i);
      this.title = this.getTitle(o, i);
      this.beforeBody = this.getBeforeBody(o, i);
      this.body = this.getBody(o, i);
      this.afterBody = this.getAfterBody(o, i);
      this.footer = this.getFooter(o, i);
      const e = this._size = ea(this, i);
      const a = Object.assign({}, t, e);
      const r = oa(this.chart, i, a);
      const h = ha(i, a, r, this.chart);
      this.xAlign = r.xAlign;
      this.yAlign = r.yAlign;
      n = {
        opacity: 1,
        x: h.x,
        y: h.y,
        width: e.width,
        height: e.height,
        caretX: t.x,
        caretY: t.y
      };
    } else if (this.opacity !== 0) {
      n = {
        opacity: 0
      };
    }
    this._tooltipItems = o;
    this.$context = undefined;
    if (n) {
      this._resolveAnimations().update(this, n);
    }
    if (t && i.external) {
      i.external.call(this, {
        chart: this.chart,
        tooltip: this,
        replay: e
      });
    }
  }
  drawCaret(t, e, i, s) {
    const n = this.getCaretPosition(t, i, s);
    e.lineTo(n.x1, n.y1);
    e.lineTo(n.x2, n.y2);
    e.lineTo(n.x3, n.y3);
  }
  getCaretPosition(t, e, i) {
    const {
      xAlign: s,
      yAlign: n
    } = this;
    const {
      caretSize: o,
      cornerRadius: a
    } = i;
    const {
      topLeft: r,
      topRight: h,
      bottomLeft: l,
      bottomRight: c
    } = Et(a);
    const {
      x: d,
      y: u
    } = t;
    const {
      width: g,
      height: p
    } = e;
    let f;
    let m;
    let x;
    let b;
    let _;
    let y;
    if (n === "center") {
      _ = u + p / 2;
      if (s === "left") {
        f = d;
        m = f - o;
        b = _ + o;
        y = _ - o;
      } else {
        f = d + g;
        m = f + o;
        b = _ - o;
        y = _ + o;
      }
      x = f;
    } else {
      m = s === "left" ? d + Math.max(r, l) + o : s === "right" ? d + g - Math.max(h, c) - o : this.caretX;
      if (n === "top") {
        b = u;
        _ = b - o;
        f = m - o;
        x = m + o;
      } else {
        b = u + p;
        _ = b + o;
        f = m + o;
        x = m - o;
      }
      y = b;
    }
    return {
      x1: f,
      x2: m,
      x3: x,
      y1: b,
      y2: _,
      y3: y
    };
  }
  drawTitle(t, e, i) {
    const s = this.title;
    const n = s.length;
    let o;
    let a;
    let r;
    if (n) {
      const h = zt(i.rtl, this.x, this.width);
      t.x = la(this, i.titleAlign, i);
      e.textAlign = h.textAlign(i.titleAlign);
      e.textBaseline = "middle";
      o = tt(i.titleFont);
      a = i.titleSpacing;
      e.fillStyle = i.titleColor;
      e.font = o.string;
      r = 0;
      for (; r < n; ++r) {
        e.fillText(s[r], h.x(t.x), t.y + o.lineHeight / 2);
        t.y += o.lineHeight + a;
        if (r + 1 === n) {
          t.y += i.titleMarginBottom - a;
        }
      }
    }
  }
  _drawColorBox(t, e, i, s, o) {
    const a = this.labelColors[i];
    const r = this.labelPointStyles[i];
    const {
      boxHeight: h,
      boxWidth: l
    } = o;
    const c = tt(o.bodyFont);
    const d = la(this, "left", o);
    const u = s.x(d);
    const g = h < c.lineHeight ? (c.lineHeight - h) / 2 : 0;
    const p = e.y + g;
    if (o.usePointStyle) {
      const e = {
        radius: Math.min(l, h) / 2,
        pointStyle: r.pointStyle,
        rotation: r.rotation,
        borderWidth: 1
      };
      const i = s.leftForLtr(u, l) + l / 2;
      const n = p + h / 2;
      t.strokeStyle = o.multiKeyBackground;
      t.fillStyle = o.multiKeyBackground;
      At(t, e, i, n);
      t.strokeStyle = a.borderColor;
      t.fillStyle = a.backgroundColor;
      At(t, e, i, n);
    } else {
      t.lineWidth = n(a.borderWidth) ? Math.max(...Object.values(a.borderWidth)) : a.borderWidth || 1;
      t.strokeStyle = a.borderColor;
      t.setLineDash(a.borderDash || []);
      t.lineDashOffset = a.borderDashOffset || 0;
      const e = s.leftForLtr(u, l);
      const i = s.leftForLtr(s.xPlus(u, 1), l - 2);
      const r = Et(a.borderRadius);
      if (Object.values(r).some(t => t !== 0)) {
        t.beginPath();
        t.fillStyle = o.multiKeyBackground;
        Lt(t, {
          x: e,
          y: p,
          w: l,
          h: h,
          radius: r
        });
        t.fill();
        t.stroke();
        t.fillStyle = a.backgroundColor;
        t.beginPath();
        Lt(t, {
          x: i,
          y: p + 1,
          w: l - 2,
          h: h - 2,
          radius: r
        });
        t.fill();
      } else {
        t.fillStyle = o.multiKeyBackground;
        t.fillRect(e, p, l, h);
        t.strokeRect(e, p, l, h);
        t.fillStyle = a.backgroundColor;
        t.fillRect(i, p + 1, l - 2, h - 2);
      }
    }
    t.fillStyle = this.labelTextColors[i];
  }
  drawBody(t, e, i) {
    const {
      body: s
    } = this;
    const {
      bodySpacing: n,
      bodyAlign: o,
      displayColors: a,
      boxHeight: r,
      boxWidth: h,
      boxPadding: l
    } = i;
    const c = tt(i.bodyFont);
    let d = c.lineHeight;
    let u = 0;
    const g = zt(i.rtl, this.x, this.width);
    const p = function (i) {
      e.fillText(i, g.x(t.x + u), t.y + d / 2);
      t.y += d + n;
    };
    const f = g.textAlign(o);
    let m;
    let x;
    let b;
    let _;
    let y;
    let v;
    let M;
    e.textAlign = o;
    e.textBaseline = "middle";
    e.font = c.string;
    t.x = la(this, f, i);
    e.fillStyle = i.bodyColor;
    z(this.beforeBody, p);
    u = a && f !== "right" ? o === "center" ? h / 2 + l : h + 2 + l : 0;
    _ = 0;
    v = s.length;
    for (; _ < v; ++_) {
      m = s[_];
      x = this.labelTextColors[_];
      e.fillStyle = x;
      z(m.before, p);
      b = m.lines;
      if (a && b.length) {
        this._drawColorBox(e, t, _, g, i);
        d = Math.max(c.lineHeight, r);
      }
      y = 0;
      M = b.length;
      for (; y < M; ++y) {
        p(b[y]);
        d = c.lineHeight;
      }
      z(m.after, p);
    }
    u = 0;
    d = c.lineHeight;
    z(this.afterBody, p);
    t.y -= n;
  }
  drawFooter(t, e, i) {
    const s = this.footer;
    const n = s.length;
    let o;
    let a;
    if (n) {
      const r = zt(i.rtl, this.x, this.width);
      t.x = la(this, i.footerAlign, i);
      t.y += i.footerMarginTop;
      e.textAlign = r.textAlign(i.footerAlign);
      e.textBaseline = "middle";
      o = tt(i.footerFont);
      e.fillStyle = i.footerColor;
      e.font = o.string;
      a = 0;
      for (; a < n; ++a) {
        e.fillText(s[a], r.x(t.x), t.y + o.lineHeight / 2);
        t.y += o.lineHeight + i.footerSpacing;
      }
    }
  }
  drawBackground(t, e, i, s) {
    const {
      xAlign: n,
      yAlign: o
    } = this;
    const {
      x: a,
      y: r
    } = t;
    const {
      width: h,
      height: l
    } = i;
    const {
      topLeft: c,
      topRight: d,
      bottomLeft: u,
      bottomRight: g
    } = Et(s.cornerRadius);
    e.fillStyle = s.backgroundColor;
    e.strokeStyle = s.borderColor;
    e.lineWidth = s.borderWidth;
    e.beginPath();
    e.moveTo(a + c, r);
    if (o === "top") {
      this.drawCaret(t, e, i, s);
    }
    e.lineTo(a + h - d, r);
    e.quadraticCurveTo(a + h, r, a + h, r + d);
    if (o === "center" && n === "right") {
      this.drawCaret(t, e, i, s);
    }
    e.lineTo(a + h, r + l - g);
    e.quadraticCurveTo(a + h, r + l, a + h - g, r + l);
    if (o === "bottom") {
      this.drawCaret(t, e, i, s);
    }
    e.lineTo(a + u, r + l);
    e.quadraticCurveTo(a, r + l, a, r + l - u);
    if (o === "center" && n === "left") {
      this.drawCaret(t, e, i, s);
    }
    e.lineTo(a, r + c);
    e.quadraticCurveTo(a, r, a + c, r);
    e.closePath();
    e.fill();
    if (s.borderWidth > 0) {
      e.stroke();
    }
  }
  _updateAnimationTarget(t) {
    const e = this.chart;
    const i = this.$animations;
    const s = i && i.x;
    const n = i && i.y;
    if (s || n) {
      const i = Jo[t.position].call(this, this._active, this._eventPosition);
      if (!i) {
        return;
      }
      const o = this._size = ea(this, t);
      const a = Object.assign({}, i, this._size);
      const r = oa(e, t, a);
      const h = ha(t, a, r, e);
      if (s._to !== h.x || n._to !== h.y) {
        this.xAlign = r.xAlign;
        this.yAlign = r.yAlign;
        this.width = o.width;
        this.height = o.height;
        this.caretX = i.x;
        this.caretY = i.y;
        this._resolveAnimations().update(this, h);
      }
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(t) {
    const e = this.options.setContext(this.getContext());
    let i = this.opacity;
    if (!i) {
      return;
    }
    this._updateAnimationTarget(e);
    const s = {
      width: this.width,
      height: this.height
    };
    const n = {
      x: this.x,
      y: this.y
    };
    i = Math.abs(i) < 0.001 ? 0 : i;
    const o = R(e.padding);
    const a = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    if (e.enabled && a) {
      t.save();
      t.globalAlpha = i;
      this.drawBackground(n, t, s, e);
      It(t, e.textDirection);
      n.y += o.top;
      this.drawTitle(n, t, e);
      this.drawBody(n, t, e);
      this.drawFooter(n, t, e);
      Vt(t, e.textDirection);
      t.restore();
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t, e) {
    const i = this._active;
    const s = t.map(({
      datasetIndex: t,
      index: e
    }) => {
      const i = this.chart.getDatasetMeta(t);
      if (!i) {
        throw new Error("Cannot find a dataset at index " + t);
      }
      return {
        datasetIndex: t,
        element: i.data[e],
        index: e
      };
    });
    const n = !xt(i, s);
    const o = this._positionChanged(s, e);
    if (n || o) {
      this._active = s;
      this._eventPosition = e;
      this._ignoreReplayEvents = true;
      this.update(true);
    }
  }
  handleEvent(t, e, i = true) {
    if (e && this._ignoreReplayEvents) {
      return false;
    }
    this._ignoreReplayEvents = false;
    const s = this.options;
    const n = this._active || [];
    const o = this._getActiveElements(t, n, e, i);
    const a = this._positionChanged(o, t);
    const r = e || !xt(o, n) || a;
    if (r) {
      this._active = o;
      if (s.enabled || s.external) {
        this._eventPosition = {
          x: t.x,
          y: t.y
        };
        this.update(true, e);
      }
    }
    return r;
  }
  _getActiveElements(t, e, i, s) {
    const n = this.options;
    if (t.type === "mouseout") {
      return [];
    }
    if (!s) {
      return e;
    }
    const o = this.chart.getElementsAtEventForMode(t, n.mode, n, i);
    if (n.reverse) {
      o.reverse();
    }
    return o;
  }
  _positionChanged(t, e) {
    const {
      caretX: i,
      caretY: s,
      options: n
    } = this;
    const o = Jo[n.position].call(this, t, e);
    return o !== false && (i !== o.x || s !== o.y);
  }
}
var ma = {
  id: "tooltip",
  _element: fa,
  positioners: Jo,
  afterInit(t, e, i) {
    if (i) {
      t.tooltip = new fa({
        chart: t,
        options: i
      });
    }
  },
  beforeUpdate(t, e, i) {
    if (t.tooltip) {
      t.tooltip.initialize(i);
    }
  },
  reset(t, e, i) {
    if (t.tooltip) {
      t.tooltip.initialize(i);
    }
  },
  afterDraw(t) {
    const e = t.tooltip;
    if (e && e._willRender()) {
      const i = {
        tooltip: e
      };
      if (t.notifyPlugins("beforeTooltipDraw", {
        ...i,
        cancelable: true
      }) === false) {
        return;
      }
      e.draw(t.ctx);
      t.notifyPlugins("afterTooltipDraw", i);
    }
  },
  afterEvent(t, e) {
    if (t.tooltip) {
      const i = e.replay;
      if (t.tooltip.handleEvent(e.event, i, e.inChartArea)) {
        e.changed = true;
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
    displayColors: true,
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
    callbacks: ga
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font"
  },
  descriptors: {
    _scriptable: t => t !== "filter" && t !== "itemSort" && t !== "external",
    _indexable: false,
    callbacks: {
      _scriptable: false,
      _indexable: false
    },
    animation: {
      _fallback: false
    },
    animations: {
      _fallback: "animation"
    }
  },
  additionalOptionScopes: ["interaction"]
};
var xa = Object.freeze({
  __proto__: null,
  Colors: Qn,
  Decimation: oo,
  Filler: Io,
  Legend: Uo,
  SubTitle: qo,
  Title: Go,
  Tooltip: ma
});
const ba = (t, e, i, s) => {
  if (typeof e == "string") {
    i = t.push(e) - 1;
    s.unshift({
      index: i,
      label: e
    });
  } else if (isNaN(e)) {
    i = null;
  }
  return i;
};
function _a(t, e, i, s) {
  const n = t.indexOf(e);
  if (n === -1) {
    return ba(t, e, i, s);
  }
  if (n !== t.lastIndexOf(e)) {
    return i;
  } else {
    return n;
  }
}
const ya = (t, e) => t === null ? null : Y(Math.round(t), 0, e);
function va(t) {
  const e = this.getLabels();
  if (t >= 0 && t < e.length) {
    return e[t];
  } else {
    return t;
  }
}
class Ma extends fs {
  static id = "category";
  static defaults = {
    ticks: {
      callback: va
    }
  };
  constructor(t) {
    super(t);
    this._startValue = undefined;
    this._valueRange = 0;
    this._addedLabels = [];
  }
  init(t) {
    const e = this._addedLabels;
    if (e.length) {
      const t = this.getLabels();
      for (const {
        index: i,
        label: s
      } of e) {
        if (t[i] === s) {
          t.splice(i, 1);
        }
      }
      this._addedLabels = [];
    }
    super.init(t);
  }
  parse(t, e) {
    if (f(t)) {
      return null;
    }
    const i = this.getLabels();
    e = isFinite(e) && i[e] === t ? e : _a(i, t, r(e, t), this._addedLabels);
    return ya(e, i.length - 1);
  }
  determineDataLimits() {
    const {
      minDefined: t,
      maxDefined: e
    } = this.getUserBounds();
    let {
      min: i,
      max: s
    } = this.getMinMax(true);
    if (this.options.bounds === "ticks") {
      if (!t) {
        i = 0;
      }
      if (!e) {
        s = this.getLabels().length - 1;
      }
    }
    this.min = i;
    this.max = s;
  }
  buildTicks() {
    const t = this.min;
    const e = this.max;
    const i = this.options.offset;
    const s = [];
    let n = this.getLabels();
    n = t === 0 && e === n.length - 1 ? n : n.slice(t, e + 1);
    this._valueRange = Math.max(n.length - (i ? 0 : 1), 1);
    this._startValue = this.min - (i ? 0.5 : 0);
    for (let i = t; i <= e; i++) {
      s.push({
        value: i
      });
    }
    return s;
  }
  getLabelForValue(t) {
    return va.call(this, t);
  }
  configure() {
    super.configure();
    if (!this.isHorizontal()) {
      this._reversePixels = !this._reversePixels;
    }
  }
  getPixelForValue(t) {
    if (typeof t != "number") {
      t = this.parse(t);
    }
    if (t === null) {
      return NaN;
    } else {
      return this.getPixelForDecimal((t - this._startValue) / this._valueRange);
    }
  }
  getPixelForTick(t) {
    const e = this.ticks;
    if (t < 0 || t > e.length - 1) {
      return null;
    } else {
      return this.getPixelForValue(e[t].value);
    }
  }
  getValueForPixel(t) {
    return Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
}
function wa(t, e) {
  const i = [];
  const {
    bounds: s,
    step: n,
    min: o,
    max: a,
    precision: r,
    count: h,
    maxTicks: l,
    maxDigits: c,
    includeBounds: d
  } = t;
  const u = n || 1;
  const g = l - 1;
  const {
    min: p,
    max: m
  } = e;
  const x = !f(o);
  const b = !f(a);
  const _ = !f(h);
  const y = (m - p) / (c + 1);
  let v;
  let M;
  let w;
  let k;
  let S = jt((m - p) / g / u) * u;
  if (S < 1e-14 && !x && !b) {
    return [{
      value: p
    }, {
      value: m
    }];
  }
  k = Math.ceil(m / S) - Math.floor(p / S);
  if (k > g) {
    S = jt(k * S / g / u) * u;
  }
  if (!f(r)) {
    v = Math.pow(10, r);
    S = Math.ceil(S * v) / v;
  }
  if (s === "ticks") {
    M = Math.floor(p / S) * S;
    w = Math.ceil(m / S) * S;
  } else {
    M = p;
    w = m;
  }
  if (x && b && n && $t((a - o) / n, S / 1000)) {
    k = Math.round(Math.min((a - o) / S, l));
    S = (a - o) / k;
    M = o;
    w = a;
  } else if (_) {
    M = x ? o : M;
    w = b ? a : w;
    k = h - 1;
    S = (w - M) / k;
  } else {
    k = (w - M) / S;
    k = Ut(k, Math.round(k), S / 1000) ? Math.round(k) : Math.ceil(k);
  }
  const D = Math.max(Yt(S), Yt(M));
  v = Math.pow(10, f(r) ? D : r);
  M = Math.round(M * v) / v;
  w = Math.round(w * v) / v;
  let P = 0;
  for (x && (d && M !== o ? (i.push({
    value: o
  }), M < o && P++, Ut(Math.round((M + P * S) * v) / v, o, ka(o, y, t)) && P++) : M < o && P++); P < k; ++P) {
    const t = Math.round((M + P * S) * v) / v;
    if (b && t > a) {
      break;
    }
    i.push({
      value: t
    });
  }
  if (b && d && w !== a) {
    if (i.length && Ut(i[i.length - 1].value, a, ka(a, y, t))) {
      i[i.length - 1].value = a;
    } else {
      i.push({
        value: a
      });
    }
  } else if (!b || w === a) {
    i.push({
      value: w
    });
  }
  return i;
}
function ka(t, e, {
  horizontal: i,
  minRotation: s
}) {
  const n = x(s);
  const o = (i ? Math.sin(n) : Math.cos(n)) || 0.001;
  const a = e * 0.75 * ("" + t).length;
  return Math.min(e / o, a);
}
class Sa extends fs {
  constructor(t) {
    super(t);
    this.start = undefined;
    this.end = undefined;
    this._startValue = undefined;
    this._endValue = undefined;
    this._valueRange = 0;
  }
  parse(t, e) {
    if (f(t) || (typeof t == "number" || t instanceof Number) && !isFinite(+t)) {
      return null;
    } else {
      return +t;
    }
  }
  handleTickRangeOptions() {
    const {
      beginAtZero: t
    } = this.options;
    const {
      minDefined: e,
      maxDefined: i
    } = this.getUserBounds();
    let {
      min: s,
      max: n
    } = this;
    const o = t => s = e ? s : t;
    const a = t => n = i ? n : t;
    if (t) {
      const t = g(s);
      const e = g(n);
      if (t < 0 && e < 0) {
        a(0);
      } else if (t > 0 && e > 0) {
        o(0);
      }
    }
    if (s === n) {
      let e = n === 0 ? 1 : Math.abs(n * 0.05);
      a(n + e);
      if (!t) {
        o(s - e);
      }
    }
    this.min = s;
    this.max = n;
  }
  getTickLimit() {
    const t = this.options.ticks;
    let e;
    let {
      maxTicksLimit: i,
      stepSize: s
    } = t;
    if (s) {
      e = Math.ceil(this.max / s) - Math.floor(this.min / s) + 1;
      if (e > 1000) {
        console.warn(`scales.${this.id}.ticks.stepSize: ${s} would result generating up to ${e} ticks. Limiting to 1000.`);
        e = 1000;
      }
    } else {
      e = this.computeTickLimit();
      i = i || 11;
    }
    if (i) {
      e = Math.min(i, e);
    }
    return e;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const t = this.options;
    const e = t.ticks;
    let i = this.getTickLimit();
    i = Math.max(2, i);
    const s = wa({
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
      includeBounds: e.includeBounds !== false
    }, this._range || this);
    if (t.bounds === "ticks") {
      Ht(s, this, "value");
    }
    if (t.reverse) {
      s.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return s;
  }
  configure() {
    const t = this.ticks;
    let e = this.min;
    let i = this.max;
    super.configure();
    if (this.options.offset && t.length) {
      const s = (i - e) / Math.max(t.length - 1, 1) / 2;
      e -= s;
      i += s;
    }
    this._startValue = e;
    this._endValue = i;
    this._valueRange = i - e;
  }
  getLabelForValue(t) {
    return v(t, this.chart.options.locale, this.options.ticks.format);
  }
}
class Da extends Sa {
  static id = "linear";
  static defaults = {
    ticks: {
      callback: Xt.formatters.numeric
    }
  };
  determineDataLimits() {
    const {
      min: t,
      max: e
    } = this.getMinMax(true);
    this.min = d(t) ? t : 0;
    this.max = d(e) ? e : 1;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const t = this.isHorizontal();
    const e = t ? this.width : this.height;
    const i = x(this.options.ticks.minRotation);
    const s = (t ? Math.sin(i) : Math.cos(i)) || 0.001;
    const n = this._resolveTickFontOptions(0);
    return Math.ceil(e / Math.min(40, n.lineHeight / s));
  }
  getPixelForValue(t) {
    if (t === null) {
      return NaN;
    } else {
      return this.getPixelForDecimal((t - this._startValue) / this._valueRange);
    }
  }
  getValueForPixel(t) {
    return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
  }
}
const Pa = t => Math.floor(Gt(t));
const Ca = (t, e) => Math.pow(10, Pa(t) + e);
function Aa(t) {
  return t / Math.pow(10, Pa(t)) === 1;
}
function La(t, e, i) {
  const s = Math.pow(10, i);
  const n = Math.floor(t / s);
  return Math.ceil(e / s) - n;
}
function Oa(t, e) {
  let i = Pa(e - t);
  while (La(t, e, i) > 10) {
    i++;
  }
  while (La(t, e, i) < 10) {
    i--;
  }
  return Math.min(i, Pa(t));
}
function Ea(t, {
  min: e,
  max: i
}) {
  e = j(t.min, e);
  const s = [];
  const n = Pa(e);
  let o = Oa(e, i);
  let a = o < 0 ? Math.pow(10, Math.abs(o)) : 1;
  const r = Math.pow(10, o);
  const h = n > o ? Math.pow(10, n) : 0;
  const l = Math.round((e - h) * a) / a;
  const c = Math.floor((e - h) / r / 10) * r * 10;
  let d = Math.floor((l - c) / Math.pow(10, o));
  let u = j(t.min, Math.round((h + c + d * Math.pow(10, o)) * a) / a);
  while (u < i) {
    s.push({
      value: u,
      major: Aa(u),
      significand: d
    });
    if (d >= 10) {
      d = d < 15 ? 15 : 20;
    } else {
      d++;
    }
    if (d >= 20) {
      o++;
      d = 2;
      a = o >= 0 ? 1 : a;
    }
    u = Math.round((h + c + d * Math.pow(10, o)) * a) / a;
  }
  const g = j(t.max, u);
  s.push({
    value: g,
    major: Aa(g),
    significand: d
  });
  return s;
}
class Ta extends fs {
  static id = "logarithmic";
  static defaults = {
    ticks: {
      callback: Xt.formatters.logarithmic,
      major: {
        enabled: true
      }
    }
  };
  constructor(t) {
    super(t);
    this.start = undefined;
    this.end = undefined;
    this._startValue = undefined;
    this._valueRange = 0;
  }
  parse(t, e) {
    const i = Sa.prototype.parse.apply(this, [t, e]);
    if (i !== 0) {
      if (d(i) && i > 0) {
        return i;
      } else {
        return null;
      }
    }
    this._zero = true;
  }
  determineDataLimits() {
    const {
      min: t,
      max: e
    } = this.getMinMax(true);
    this.min = d(t) ? Math.max(0, t) : null;
    this.max = d(e) ? Math.max(0, e) : null;
    if (this.options.beginAtZero) {
      this._zero = true;
    }
    if (this._zero && this.min !== this._suggestedMin && !d(this._userMin)) {
      this.min = t === Ca(this.min, 0) ? Ca(this.min, -1) : Ca(this.min, 0);
    }
    this.handleTickRangeOptions();
  }
  handleTickRangeOptions() {
    const {
      minDefined: t,
      maxDefined: e
    } = this.getUserBounds();
    let i = this.min;
    let s = this.max;
    const n = e => i = t ? i : e;
    const o = t => s = e ? s : t;
    if (i === s) {
      if (i <= 0) {
        n(1);
        o(10);
      } else {
        n(Ca(i, -1));
        o(Ca(s, 1));
      }
    }
    if (i <= 0) {
      n(Ca(s, -1));
    }
    if (s <= 0) {
      o(Ca(i, 1));
    }
    this.min = i;
    this.max = s;
  }
  buildTicks() {
    const t = this.options;
    const e = Ea({
      min: this._userMin,
      max: this._userMax
    }, this);
    if (t.bounds === "ticks") {
      Ht(e, this, "value");
    }
    if (t.reverse) {
      e.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return e;
  }
  getLabelForValue(t) {
    if (t === undefined) {
      return "0";
    } else {
      return v(t, this.chart.options.locale, this.options.ticks.format);
    }
  }
  configure() {
    const t = this.min;
    super.configure();
    this._startValue = Gt(t);
    this._valueRange = Gt(this.max) - Gt(t);
  }
  getPixelForValue(t) {
    if (t === undefined || t === 0) {
      t = this.min;
    }
    if (t === null || isNaN(t)) {
      return NaN;
    } else {
      return this.getPixelForDecimal(t === this.min ? 0 : (Gt(t) - this._startValue) / this._valueRange);
    }
  }
  getValueForPixel(t) {
    const e = this.getDecimalForPixel(t);
    return Math.pow(10, this._startValue + e * this._valueRange);
  }
}
function Ra(t) {
  const e = t.ticks;
  if (e.display && t.display) {
    const t = R(e.backdropPadding);
    return r(e.font && e.font.size, o.font.size) + t.height;
  }
  return 0;
}
function za(t, e, i) {
  i = a(i) ? i : [i];
  return {
    w: Kt(t, e.string, i),
    h: i.length * e.lineHeight
  };
}
function Ia(t, e, i, s, n) {
  if (t === s || t === n) {
    return {
      start: e - i / 2,
      end: e + i / 2
    };
  } else if (t < s || t > n) {
    return {
      start: e - i,
      end: e
    };
  } else {
    return {
      start: e,
      end: e + i
    };
  }
}
function Fa(t) {
  const e = {
    l: t.left + t._padding.left,
    r: t.right - t._padding.right,
    t: t.top + t._padding.top,
    b: t.bottom - t._padding.bottom
  };
  const i = Object.assign({}, e);
  const s = [];
  const n = [];
  const o = t._pointLabels.length;
  const a = t.options.pointLabels;
  const r = a.centerPointLabels ? k / o : 0;
  for (let h = 0; h < o; h++) {
    const o = a.setContext(t.getPointLabelContext(h));
    n[h] = o.padding;
    const l = t.getPointPosition(h, t.drawingArea + n[h], r);
    const c = tt(o.font);
    const d = za(t.ctx, c, t._pointLabels[h]);
    s[h] = d;
    const u = Rt(t.getIndexAngle(h) + r);
    const g = Math.round(X(u));
    Va(i, e, u, Ia(g, l.x, d.w, 0, 180), Ia(g, l.y, d.h, 90, 270));
  }
  t.setCenterPoint(e.l - i.l, i.r - e.r, e.t - i.t, i.b - e.b);
  t._pointLabelItems = Wa(t, s, n);
}
function Va(t, e, i, s, n) {
  const o = Math.abs(Math.sin(i));
  const a = Math.abs(Math.cos(i));
  let r = 0;
  let h = 0;
  if (s.start < e.l) {
    r = (e.l - s.start) / o;
    t.l = Math.min(t.l, e.l - r);
  } else if (s.end > e.r) {
    r = (s.end - e.r) / o;
    t.r = Math.max(t.r, e.r + r);
  }
  if (n.start < e.t) {
    h = (e.t - n.start) / a;
    t.t = Math.min(t.t, e.t - h);
  } else if (n.end > e.b) {
    h = (n.end - e.b) / a;
    t.b = Math.max(t.b, e.b + h);
  }
}
function Ba(t, e, i) {
  const s = t.drawingArea;
  const {
    extra: n,
    additionalAngle: o,
    padding: a,
    size: r
  } = i;
  const h = t.getPointPosition(e, s + n + a, o);
  const l = Math.round(X(Rt(h.angle + w)));
  const c = $a(h.y, r.h, l);
  const d = Ha(l);
  const u = ja(h.x, r.w, d);
  return {
    visible: true,
    x: h.x,
    y: c,
    textAlign: d,
    left: u,
    top: c,
    right: u + r.w,
    bottom: c + r.h
  };
}
function Na(t, e) {
  if (!e) {
    return true;
  }
  const {
    left: i,
    top: s,
    right: n,
    bottom: o
  } = t;
  return !E({
    x: i,
    y: s
  }, e) && !E({
    x: i,
    y: o
  }, e) && !E({
    x: n,
    y: s
  }, e) && !E({
    x: n,
    y: o
  }, e);
}
function Wa(t, e, i) {
  const s = [];
  const n = t._pointLabels.length;
  const o = t.options;
  const {
    centerPointLabels: a,
    display: r
  } = o.pointLabels;
  const h = {
    extra: Ra(o) / 2,
    additionalAngle: a ? k / n : 0
  };
  let l;
  for (let o = 0; o < n; o++) {
    h.padding = i[o];
    h.size = e[o];
    const n = Ba(t, o, h);
    s.push(n);
    if (r === "auto") {
      n.visible = Na(n, l);
      if (n.visible) {
        l = n;
      }
    }
  }
  return s;
}
function Ha(t) {
  if (t === 0 || t === 180) {
    return "center";
  } else if (t < 180) {
    return "left";
  } else {
    return "right";
  }
}
function ja(t, e, i) {
  if (i === "right") {
    t -= e;
  } else if (i === "center") {
    t -= e / 2;
  }
  return t;
}
function $a(t, e, i) {
  if (i === 90 || i === 270) {
    t -= e / 2;
  } else if (i > 270 || i < 90) {
    t -= e;
  }
  return t;
}
function Ua(t, e, i) {
  const {
    left: s,
    top: n,
    right: o,
    bottom: a
  } = i;
  const {
    backdropColor: r
  } = e;
  if (!f(r)) {
    const i = Et(e.borderRadius);
    const h = R(e.backdropPadding);
    t.fillStyle = r;
    const l = s - h.left;
    const c = n - h.top;
    const d = o - s + h.width;
    const u = a - n + h.height;
    if (Object.values(i).some(t => t !== 0)) {
      t.beginPath();
      Lt(t, {
        x: l,
        y: c,
        w: d,
        h: u,
        radius: i
      });
      t.fill();
    } else {
      t.fillRect(l, c, d, u);
    }
  }
}
function Ya(t, e) {
  const {
    ctx: i,
    options: {
      pointLabels: s
    }
  } = t;
  for (let n = e - 1; n >= 0; n--) {
    const e = t._pointLabelItems[n];
    if (!e.visible) {
      continue;
    }
    const o = s.setContext(t.getPointLabelContext(n));
    Ua(i, o, e);
    const a = tt(o.font);
    const {
      x: r,
      y: h,
      textAlign: l
    } = e;
    Z(i, t._pointLabels[n], r, h + a.lineHeight / 2, a, {
      color: o.color,
      textAlign: l,
      textBaseline: "middle"
    });
  }
}
function Xa(t, e, i, s) {
  const {
    ctx: n
  } = t;
  if (i) {
    n.arc(t.xCenter, t.yCenter, e, 0, y);
  } else {
    let i = t.getPointPosition(0, e);
    n.moveTo(i.x, i.y);
    for (let o = 1; o < s; o++) {
      i = t.getPointPosition(o, e);
      n.lineTo(i.x, i.y);
    }
  }
}
function Ga(t, e, i, s, n) {
  const o = t.ctx;
  const a = e.circular;
  const {
    color: r,
    lineWidth: h
  } = e;
  if ((!!a || !!s) && !!r && !!h && !(i < 0)) {
    o.save();
    o.strokeStyle = r;
    o.lineWidth = h;
    o.setLineDash(n.dash);
    o.lineDashOffset = n.dashOffset;
    o.beginPath();
    Xa(t, i, a, s);
    o.closePath();
    o.stroke();
    o.restore();
  }
}
function Ka(t, e, i) {
  return p(t, {
    label: i,
    index: e,
    type: "pointLabel"
  });
}
class qa extends Sa {
  static id = "radialLinear";
  static defaults = {
    display: true,
    animate: true,
    position: "chartArea",
    angleLines: {
      display: true,
      lineWidth: 1,
      borderDash: [],
      borderDashOffset: 0
    },
    grid: {
      circular: false
    },
    startAngle: 0,
    ticks: {
      showLabelBackdrop: true,
      callback: Xt.formatters.numeric
    },
    pointLabels: {
      backdropColor: undefined,
      backdropPadding: 2,
      display: true,
      font: {
        size: 10
      },
      callback: t => t,
      padding: 5,
      centerPointLabels: false
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
    super(t);
    this.xCenter = undefined;
    this.yCenter = undefined;
    this.drawingArea = undefined;
    this._pointLabels = [];
    this._pointLabelItems = [];
  }
  setDimensions() {
    const t = this._padding = R(Ra(this.options) / 2);
    const e = this.width = this.maxWidth - t.width;
    const i = this.height = this.maxHeight - t.height;
    this.xCenter = Math.floor(this.left + e / 2 + t.left);
    this.yCenter = Math.floor(this.top + i / 2 + t.top);
    this.drawingArea = Math.floor(Math.min(e, i) / 2);
  }
  determineDataLimits() {
    const {
      min: t,
      max: e
    } = this.getMinMax(false);
    this.min = d(t) && !isNaN(t) ? t : 0;
    this.max = d(e) && !isNaN(e) ? e : 0;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / Ra(this.options));
  }
  generateTickLabels(t) {
    Sa.prototype.generateTickLabels.call(this, t);
    this._pointLabels = this.getLabels().map((t, e) => {
      const i = $(this.options.pointLabels.callback, [t, e], this);
      if (i || i === 0) {
        return i;
      } else {
        return "";
      }
    }).filter((t, e) => this.chart.getDataVisibility(e));
  }
  fit() {
    const t = this.options;
    if (t.display && t.pointLabels.display) {
      Fa(this);
    } else {
      this.setCenterPoint(0, 0, 0, 0);
    }
  }
  setCenterPoint(t, e, i, s) {
    this.xCenter += Math.floor((t - e) / 2);
    this.yCenter += Math.floor((i - s) / 2);
    this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(t, e, i, s));
  }
  getIndexAngle(t) {
    const e = y / (this._pointLabels.length || 1);
    const i = this.options.startAngle || 0;
    return Rt(t * e + x(i));
  }
  getDistanceFromCenterForValue(t) {
    if (f(t)) {
      return NaN;
    }
    const e = this.drawingArea / (this.max - this.min);
    if (this.options.reverse) {
      return (this.max - t) * e;
    } else {
      return (t - this.min) * e;
    }
  }
  getValueForDistanceFromCenter(t) {
    if (f(t)) {
      return NaN;
    }
    const e = t / (this.drawingArea / (this.max - this.min));
    if (this.options.reverse) {
      return this.max - e;
    } else {
      return this.min + e;
    }
  }
  getPointLabelContext(t) {
    const e = this._pointLabels || [];
    if (t >= 0 && t < e.length) {
      const i = e[t];
      return Ka(this.getContext(), t, i);
    }
  }
  getPointPosition(t, e, i = 0) {
    const s = this.getIndexAngle(t) - w + i;
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
      i.save();
      i.beginPath();
      Xa(this, this.getDistanceFromCenterForValue(this._endValue), e, this._pointLabels.length);
      i.closePath();
      i.fillStyle = t;
      i.fill();
      i.restore();
    }
  }
  drawGrid() {
    const t = this.ctx;
    const e = this.options;
    const {
      angleLines: i,
      grid: s,
      border: n
    } = e;
    const o = this._pointLabels.length;
    let a;
    let r;
    let h;
    if (e.pointLabels.display) {
      Ya(this, o);
    }
    if (s.display) {
      this.ticks.forEach((t, e) => {
        if (e !== 0) {
          r = this.getDistanceFromCenterForValue(t.value);
          const i = this.getContext(e);
          const a = s.setContext(i);
          const h = n.setContext(i);
          Ga(this, a, r, o, h);
        }
      });
    }
    if (i.display) {
      t.save();
      a = o - 1;
      for (; a >= 0; a--) {
        const s = i.setContext(this.getPointLabelContext(a));
        const {
          color: n,
          lineWidth: o
        } = s;
        if (o && n) {
          t.lineWidth = o;
          t.strokeStyle = n;
          t.setLineDash(s.borderDash);
          t.lineDashOffset = s.borderDashOffset;
          r = this.getDistanceFromCenterForValue(e.ticks.reverse ? this.min : this.max);
          h = this.getPointPosition(a, r);
          t.beginPath();
          t.moveTo(this.xCenter, this.yCenter);
          t.lineTo(h.x, h.y);
          t.stroke();
        }
      }
      t.restore();
    }
  }
  drawBorder() {}
  drawLabels() {
    const t = this.ctx;
    const e = this.options;
    const i = e.ticks;
    if (!i.display) {
      return;
    }
    const s = this.getIndexAngle(0);
    let n;
    let o;
    t.save();
    t.translate(this.xCenter, this.yCenter);
    t.rotate(s);
    t.textAlign = "center";
    t.textBaseline = "middle";
    this.ticks.forEach((s, a) => {
      if (a === 0 && !e.reverse) {
        return;
      }
      const r = i.setContext(this.getContext(a));
      const h = tt(r.font);
      n = this.getDistanceFromCenterForValue(this.ticks[a].value);
      if (r.showLabelBackdrop) {
        t.font = h.string;
        o = t.measureText(s.label).width;
        t.fillStyle = r.backdropColor;
        const e = R(r.backdropPadding);
        t.fillRect(-o / 2 - e.left, -n - h.size / 2 - e.top, o + e.width, h.size + e.height);
      }
      Z(t, s.label, 0, -n, h, {
        color: r.color,
        strokeColor: r.textStrokeColor,
        strokeWidth: r.textStrokeWidth
      });
    });
    t.restore();
  }
  drawTitle() {}
}
const Ja = {
  millisecond: {
    common: true,
    size: 1,
    steps: 1000
  },
  second: {
    common: true,
    size: 1000,
    steps: 60
  },
  minute: {
    common: true,
    size: 60000,
    steps: 60
  },
  hour: {
    common: true,
    size: 3600000,
    steps: 24
  },
  day: {
    common: true,
    size: 86400000,
    steps: 30
  },
  week: {
    common: false,
    size: 604800000,
    steps: 4
  },
  month: {
    common: true,
    size: 2628000000,
    steps: 12
  },
  quarter: {
    common: false,
    size: 7884000000,
    steps: 4
  },
  year: {
    common: true,
    size: 31540000000
  }
};
const Za = Object.keys(Ja);
function Qa(t, e) {
  return t - e;
}
function tr(t, e) {
  if (f(e)) {
    return null;
  }
  const i = t._adapter;
  const {
    parser: s,
    round: n,
    isoWeekday: o
  } = t._parseOpts;
  let a = e;
  if (typeof s == "function") {
    a = s(a);
  }
  if (!d(a)) {
    a = typeof s == "string" ? i.parse(a, s) : i.parse(a);
  }
  if (a === null) {
    return null;
  } else {
    if (n) {
      a = n !== "week" || !P(o) && o !== true ? i.startOf(a, n) : i.startOf(a, "isoWeek", o);
    }
    return +a;
  }
}
function er(t, e, i, s) {
  const n = Za.length;
  for (let o = Za.indexOf(t); o < n - 1; ++o) {
    const t = Ja[Za[o]];
    const n = t.steps ? t.steps : Number.MAX_SAFE_INTEGER;
    if (t.common && Math.ceil((i - e) / (n * t.size)) <= s) {
      return Za[o];
    }
  }
  return Za[n - 1];
}
function ir(t, e, i, s, n) {
  for (let o = Za.length - 1; o >= Za.indexOf(i); o--) {
    const i = Za[o];
    if (Ja[i].common && t._adapter.diff(n, s, i) >= e - 1) {
      return i;
    }
  }
  return Za[i ? Za.indexOf(i) : 0];
}
function sr(t) {
  for (let e = Za.indexOf(t) + 1, i = Za.length; e < i; ++e) {
    if (Ja[Za[e]].common) {
      return Za[e];
    }
  }
}
function nr(t, e, i) {
  if (i) {
    if (i.length) {
      const {
        lo: s,
        hi: n
      } = Jt(i, e);
      t[i[s] >= e ? i[s] : i[n]] = true;
    }
  } else {
    t[e] = true;
  }
}
function or(t, e, i, s) {
  const n = t._adapter;
  const o = +n.startOf(e[0].value, s);
  const a = e[e.length - 1].value;
  let r;
  let h;
  for (r = o; r <= a; r = +n.add(r, 1, s)) {
    h = i[r];
    if (h >= 0) {
      e[h].major = true;
    }
  }
  return e;
}
function ar(t, e, i) {
  const s = [];
  const n = {};
  const o = e.length;
  let a;
  let r;
  for (a = 0; a < o; ++a) {
    r = e[a];
    n[r] = a;
    s.push({
      value: r,
      major: false
    });
  }
  if (o !== 0 && i) {
    return or(t, s, n, i);
  } else {
    return s;
  }
}
class rr extends fs {
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
      displayFormats: {}
    },
    ticks: {
      source: "auto",
      callback: false,
      major: {
        enabled: false
      }
    }
  };
  constructor(t) {
    super(t);
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
    this._unit = "day";
    this._majorUnit = undefined;
    this._offsets = {};
    this._normalized = false;
    this._parseOpts = undefined;
  }
  init(t, e = {}) {
    const i = t.time ||= {};
    const s = this._adapter = new Qe._date(t.adapters.date);
    s.init(e);
    dt(i.displayFormats, s.formats());
    this._parseOpts = {
      parser: i.parser,
      round: i.round,
      isoWeekday: i.isoWeekday
    };
    super.init(t);
    this._normalized = e.normalized;
  }
  parse(t, e) {
    if (t === undefined) {
      return null;
    } else {
      return tr(this, t);
    }
  }
  beforeLayout() {
    super.beforeLayout();
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const t = this.options;
    const e = this._adapter;
    const i = t.time.unit || "day";
    let {
      min: s,
      max: n,
      minDefined: o,
      maxDefined: a
    } = this.getUserBounds();
    function r(t) {
      if (!o && !isNaN(t.min)) {
        s = Math.min(s, t.min);
      }
      if (!a && !isNaN(t.max)) {
        n = Math.max(n, t.max);
      }
    }
    if (!o || !a) {
      r(this._getLabelBounds());
      if (t.bounds !== "ticks" || t.ticks.source !== "labels") {
        r(this.getMinMax(false));
      }
    }
    s = d(s) && !isNaN(s) ? s : +e.startOf(Date.now(), i);
    n = d(n) && !isNaN(n) ? n : +e.endOf(Date.now(), i) + 1;
    this.min = Math.min(s, n - 1);
    this.max = Math.max(s + 1, n);
  }
  _getLabelBounds() {
    const t = this.getLabelTimestamps();
    let e = Number.POSITIVE_INFINITY;
    let i = Number.NEGATIVE_INFINITY;
    if (t.length) {
      e = t[0];
      i = t[t.length - 1];
    }
    return {
      min: e,
      max: i
    };
  }
  buildTicks() {
    const t = this.options;
    const e = t.time;
    const i = t.ticks;
    const s = i.source === "labels" ? this.getLabelTimestamps() : this._generate();
    if (t.bounds === "ticks" && s.length) {
      this.min = this._userMin || s[0];
      this.max = this._userMax || s[s.length - 1];
    }
    const n = this.min;
    const o = this.max;
    const a = qt(s, n, o);
    this._unit = e.unit || (i.autoSkip ? er(e.minUnit, this.min, this.max, this._getLabelCapacity(n)) : ir(this, a.length, e.minUnit, this.min, this.max));
    this._majorUnit = i.major.enabled && this._unit !== "year" ? sr(this._unit) : undefined;
    this.initOffsets(s);
    if (t.reverse) {
      a.reverse();
    }
    return ar(this, a, this._majorUnit);
  }
  afterAutoSkip() {
    if (this.options.offsetAfterAutoskip) {
      this.initOffsets(this.ticks.map(t => +t.value));
    }
  }
  initOffsets(t = []) {
    let e;
    let i;
    let s = 0;
    let n = 0;
    if (this.options.offset && t.length) {
      e = this.getDecimalForValue(t[0]);
      s = t.length === 1 ? 1 - e : (this.getDecimalForValue(t[1]) - e) / 2;
      i = this.getDecimalForValue(t[t.length - 1]);
      n = t.length === 1 ? i : (i - this.getDecimalForValue(t[t.length - 2])) / 2;
    }
    const o = t.length < 3 ? 0.5 : 0.25;
    s = Y(s, 0, o);
    n = Y(n, 0, o);
    this._offsets = {
      start: s,
      end: n,
      factor: 1 / (s + 1 + n)
    };
  }
  _generate() {
    const t = this._adapter;
    const e = this.min;
    const i = this.max;
    const s = this.options;
    const n = s.time;
    const o = n.unit || er(n.minUnit, e, i, this._getLabelCapacity(e));
    const a = r(s.ticks.stepSize, 1);
    const h = o === "week" && n.isoWeekday;
    const l = P(h) || h === true;
    const c = {};
    let d;
    let u;
    let g = e;
    if (l) {
      g = +t.startOf(g, "isoWeek", h);
    }
    g = +t.startOf(g, l ? "day" : o);
    if (t.diff(i, e, o) > a * 100000) {
      throw new Error(e + " and " + i + " are too far apart with stepSize of " + a + " " + o);
    }
    const p = s.ticks.source === "data" && this.getDataTimestamps();
    d = g;
    u = 0;
    for (; d < i; d = +t.add(d, a, o), u++) {
      nr(c, d, p);
    }
    if (d === i || s.bounds === "ticks" || u === 1) {
      nr(c, d, p);
    }
    return Object.keys(c).sort(Qa).map(t => +t);
  }
  getLabelForValue(t) {
    const e = this._adapter;
    const i = this.options.time;
    if (i.tooltipFormat) {
      return e.format(t, i.tooltipFormat);
    } else {
      return e.format(t, i.displayFormats.datetime);
    }
  }
  format(t, e) {
    const i = this.options.time.displayFormats;
    const s = this._unit;
    const n = e || i[s];
    return this._adapter.format(t, n);
  }
  _tickFormatFunction(t, e, i, s) {
    const n = this.options;
    const o = n.ticks.callback;
    if (o) {
      return $(o, [t, e, i], this);
    }
    const a = n.time.displayFormats;
    const r = this._unit;
    const h = this._majorUnit;
    const l = r && a[r];
    const c = h && a[h];
    const d = i[e];
    const u = h && c && d && d.major;
    return this._adapter.format(t, s || (u ? c : l));
  }
  generateTickLabels(t) {
    let e;
    let i;
    let s;
    e = 0;
    i = t.length;
    for (; e < i; ++e) {
      s = t[e];
      s.label = this._tickFormatFunction(s.value, e, t);
    }
  }
  getDecimalForValue(t) {
    if (t === null) {
      return NaN;
    } else {
      return (t - this.min) / (this.max - this.min);
    }
  }
  getPixelForValue(t) {
    const e = this._offsets;
    const i = this.getDecimalForValue(t);
    return this.getPixelForDecimal((e.start + i) * e.factor);
  }
  getValueForPixel(t) {
    const e = this._offsets;
    const i = this.getDecimalForPixel(t) / e.factor - e.end;
    return this.min + i * (this.max - this.min);
  }
  _getLabelSize(t) {
    const e = this.options.ticks;
    const i = this.ctx.measureText(t).width;
    const s = x(this.isHorizontal() ? e.maxRotation : e.minRotation);
    const n = Math.cos(s);
    const o = Math.sin(s);
    const a = this._resolveTickFontOptions(0).size;
    return {
      w: i * n + a * o,
      h: i * o + a * n
    };
  }
  _getLabelCapacity(t) {
    const e = this.options.time;
    const i = e.displayFormats;
    const s = i[e.unit] || i.millisecond;
    const n = this._tickFormatFunction(t, 0, ar(this, [t], this._majorUnit), s);
    const o = this._getLabelSize(n);
    const a = Math.floor(this.isHorizontal() ? this.width / o.w : this.height / o.h) - 1;
    if (a > 0) {
      return a;
    } else {
      return 1;
    }
  }
  getDataTimestamps() {
    let t;
    let e;
    let i = this._cache.data || [];
    if (i.length) {
      return i;
    }
    const s = this.getMatchingVisibleMetas();
    if (this._normalized && s.length) {
      return this._cache.data = s[0].controller.getAllParsedValues(this);
    }
    t = 0;
    e = s.length;
    for (; t < e; ++t) {
      i = i.concat(s[t].controller.getAllParsedValues(this));
    }
    return this._cache.data = this.normalize(i);
  }
  getLabelTimestamps() {
    const t = this._cache.labels || [];
    let e;
    let i;
    if (t.length) {
      return t;
    }
    const s = this.getLabels();
    e = 0;
    i = s.length;
    for (; e < i; ++e) {
      t.push(tr(this, s[e]));
    }
    return this._cache.labels = this._normalized ? t : this.normalize(t);
  }
  normalize(t) {
    return m(t.sort(Qa));
  }
}
function hr(t, e, i) {
  let s;
  let n;
  let o;
  let a;
  let r = 0;
  let h = t.length - 1;
  if (i) {
    if (e >= t[r].pos && e <= t[h].pos) {
      ({
        lo: r,
        hi: h
      } = O(t, "pos", e));
    }
    ({
      pos: s,
      time: o
    } = t[r]);
    ({
      pos: n,
      time: a
    } = t[h]);
  } else {
    if (e >= t[r].time && e <= t[h].time) {
      ({
        lo: r,
        hi: h
      } = O(t, "time", e));
    }
    ({
      time: s,
      pos: o
    } = t[r]);
    ({
      time: n,
      pos: a
    } = t[h]);
  }
  const l = n - s;
  if (l) {
    return o + (a - o) * (e - s) / l;
  } else {
    return o;
  }
}
class lr extends rr {
  static id = "timeseries";
  static defaults = rr.defaults;
  constructor(t) {
    super(t);
    this._table = [];
    this._minPos = undefined;
    this._tableRange = undefined;
  }
  initOffsets() {
    const t = this._getTimestampsForTable();
    const e = this._table = this.buildLookupTable(t);
    this._minPos = hr(e, this.min);
    this._tableRange = hr(e, this.max) - this._minPos;
    super.initOffsets(t);
  }
  buildLookupTable(t) {
    const {
      min: e,
      max: i
    } = this;
    const s = [];
    const n = [];
    let o;
    let a;
    let r;
    let h;
    let l;
    o = 0;
    a = t.length;
    for (; o < a; ++o) {
      h = t[o];
      if (h >= e && h <= i) {
        s.push(h);
      }
    }
    if (s.length < 2) {
      return [{
        time: e,
        pos: 0
      }, {
        time: i,
        pos: 1
      }];
    }
    o = 0;
    a = s.length;
    for (; o < a; ++o) {
      l = s[o + 1];
      r = s[o - 1];
      h = s[o];
      if (Math.round((l + r) / 2) !== h) {
        n.push({
          time: h,
          pos: o / (a - 1)
        });
      }
    }
    return n;
  }
  _generate() {
    const t = this.min;
    const e = this.max;
    let i = super.getDataTimestamps();
    if (!i.includes(t) || !i.length) {
      i.splice(0, 0, t);
    }
    if (!i.includes(e) || i.length === 1) {
      i.push(e);
    }
    return i.sort((t, e) => t - e);
  }
  _getTimestampsForTable() {
    let t = this._cache.all || [];
    if (t.length) {
      return t;
    }
    const e = this.getDataTimestamps();
    const i = this.getLabelTimestamps();
    t = e.length && i.length ? this.normalize(e.concat(i)) : e.length ? e : i;
    t = this._cache.all = t;
    return t;
  }
  getDecimalForValue(t) {
    return (hr(this._table, t) - this._minPos) / this._tableRange;
  }
  getValueForPixel(t) {
    const e = this._offsets;
    const i = this.getDecimalForPixel(t) / e.factor - e.end;
    return hr(this._table, i * this._tableRange + this._minPos, true);
  }
}
var cr = Object.freeze({
  __proto__: null,
  CategoryScale: Ma,
  LinearScale: Da,
  LogarithmicScale: Ta,
  RadialLinearScale: qa,
  TimeScale: rr,
  TimeSeriesScale: lr
});
const dr = [qe, Hn, xa, cr];
export { ie as Animation, se as Animations, mn as ArcElement, We as BarController, Wn as BarElement, Di as BasePlatform, Pi as BasicPlatform, He as BubbleController, Ma as CategoryScale, rn as Chart, Qn as Colors, Se as DatasetController, oo as Decimation, Xi as DomPlatform, $e as DoughnutController, Ki as Element, Io as Filler, hi as Interaction, Uo as Legend, Ue as LineController, An as LineElement, Da as LinearScale, Ta as LogarithmicScale, Xe as PieController, On as PointElement, Ye as PolarAreaController, Ge as RadarController, qa as RadialLinearScale, fs as Scale, Ke as ScatterController, qo as SubTitle, Xt as Ticks, rr as TimeScale, lr as TimeSeriesScale, Go as Title, ma as Tooltip, Qe as _adapters, Gi as _detectPlatform, Qt as animator, qe as controllers, o as defaults, Hn as elements, Si as layouts, xa as plugins, dr as registerables, vs as registry, cr as scales };