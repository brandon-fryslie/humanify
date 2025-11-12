import { createRequire as rcQ } from "node:module";
var icQ = Object.create;
var {
  getPrototypeOf: ncQ,
  defineProperty: JA0,
  getOwnPropertyNames: acQ
} = Object;
var scQ = Object.prototype.hasOwnProperty;
var A1 = (A, B, Q) => {
  Q = A != null ? icQ(ncQ(A)) : {};
  let Z = B || !A || !A.__esModule ? JA0(Q, "default", {
    value: A,
    enumerable: true
  }) : Q;
  for (let G of acQ(A)) {
    if (!scQ.call(Z, G)) {
      JA0(Z, G, {
        get: () => A[G],
        enumerable: true
      });
    }
  }
  return Z;
};
var U = (A, B) => () => {
  if (!B) {
    A((B = {
      exports: {}
    }).exports, B);
  }
  return B.exports;
};
var BR = (A, B) => {
  for (var Q in B) {
    JA0(A, Q, {
      get: B[Q],
      enumerable: true,
      configurable: true,
      set: Z => B[Q] = () => Z
    });
  }
};
var R = (A, B) => () => {
  if (A) {
    B = A(A = 0);
  }
  return B;
};
var W1 = A => Promise.all(A);
var H1 = rcQ(import.meta.url);
var ocQ;
var Zq1;
var WA0 = R(() => {
  ocQ = typeof global == "object" && global && global.Object === Object && global;
  Zq1 = ocQ;
});
var tcQ;
var ecQ;
var OW;
var oN = R(() => {
  WA0();
  tcQ = typeof self == "object" && self && self.Object === Object && self;
  ecQ = Zq1 || tcQ || Function("return this")();
  OW = ecQ;
});
var ApQ;
var KI;
var Oc = R(() => {
  oN();
  ApQ = OW.Symbol;
  KI = ApQ;
});
function ZpQ(A) {
  var B = BpQ.call(A, x31);
  var Q = A[x31];
  try {
    A[x31] = undefined;
    var Z = true;
  } catch (Y) {}
  var G = QpQ.call(A);
  if (Z) {
    if (B) {
      A[x31] = Q;
    } else {
      delete A[x31];
    }
  }
  return G;
}
var ct0;
var BpQ;
var QpQ;
var x31;
var pt0;
var lt0 = R(() => {
  Oc();
  ct0 = Object.prototype;
  BpQ = ct0.hasOwnProperty;
  QpQ = ct0.toString;
  x31 = KI ? KI.toStringTag : undefined;
