var J = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (P1) {
  return typeof P1;
} : function (P1) {
  if (P1 && typeof Symbol === "function" && P1.constructor === Symbol && P1 !== Symbol.prototype) {
    return "symbol";
  } else {
    return typeof P1;
  }
};
function W(P1, X0) {
  if (!(P1 instanceof X0)) {
    throw TypeError("Cannot call a class as a function");
  }
}
function X() {
  try {
    if (typeof indexedDB !== "undefined") {
      return indexedDB;
    }
    if (typeof webkitIndexedDB !== "undefined") {
      return webkitIndexedDB;
    }
    if (typeof mozIndexedDB !== "undefined") {
      return mozIndexedDB;
    }
    if (typeof OIndexedDB !== "undefined") {
      return OIndexedDB;
    }
    if (typeof msIndexedDB !== "undefined") {
      return msIndexedDB;
    }
  } catch (P1) {
    return;
  }
}
var I = X();
function F() {
  try {
    if (!I || !I.open) {
      return false;
    }
    var P1 = typeof openDatabase !== "undefined" && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);
    var X0 = typeof fetch === "function" && fetch.toString().indexOf("[native code") !== -1;
    return (!P1 || X0) && typeof indexedDB !== "undefined" && typeof IDBKeyRange !== "undefined";
  } catch (s1) {
    return false;
  }
}
function V(P1, X0) {
  P1 = P1 || [];
  X0 = X0 || {};
  try {
    return new Blob(P1, X0);
  } catch (O0) {
    if (O0.name !== "TypeError") {
      throw O0;
    }
    var s1 = typeof BlobBuilder !== "undefined" ? BlobBuilder : typeof MSBlobBuilder !== "undefined" ? MSBlobBuilder : typeof MozBlobBuilder !== "undefined" ? MozBlobBuilder : WebKitBlobBuilder;
    var q0 = new s1();
    for (var S0 = 0; S0 < P1.length; S0 += 1) {
      q0.append(P1[S0]);
    }
    return q0.getBlob(X0.type);
  }
}
if (typeof Promise === "undefined") {
  require(3);
}
var K = Promise;
function D(P1, X0) {
  if (X0) {
    P1.then(function (s1) {
      X0(null, s1);
    }, function (s1) {
      X0(s1);
    });
  }
}
function H(P1, X0, s1) {
  if (typeof X0 === "function") {
    P1.then(X0);
  }
  if (typeof s1 === "function") {
    P1.catch(s1);
  }
}
function z(P1) {
  if (typeof P1 !== "string") {
    console.warn(P1 + " used as a key, but it is not a string.");
    P1 = String(P1);
  }
  return P1;
}
function C() {
  if (arguments.length && typeof arguments[arguments.length - 1] === "function") {
    return arguments[arguments.length - 1];
  }
}
var q = "local-forage-detect-blob-support";
var N = undefined;
var L = {};
var O = Object.prototype.toString;
var T = "readonly";
var P = "readwrite";
function _(P1) {
  var X0 = P1.length;
  var s1 = new ArrayBuffer(X0);
  var q0 = new Uint8Array(s1);
  for (var S0 = 0; S0 < X0; S0++) {
    q0[S0] = P1.charCodeAt(S0);
  }
  return s1;
}
function h(P1) {
  return new K(function (X0) {
    var s1 = P1.transaction(q, P);
    var q0 = V([""]);
    s1.objectStore(q).put(q0, "key");
    s1.onabort = function (S0) {
      S0.preventDefault();
      S0.stopPropagation();
      X0(false);
    };
    s1.oncomplete = function () {
      var S0 = navigator.userAgent.match(/Chrome\/(\d+)/);
      var O0 = navigator.userAgent.match(/Edge\//);
      X0(O0 || !S0 || parseInt(S0[1], 10) >= 43);
    };
  }).catch(function () {
    return false;
  });
}
function k(P1) {
  if (typeof N === "boolean") {
    return K.resolve(N);
  }
  return h(P1).then(function (X0) {
    N = X0;
    return N;
  });
}
function n(P1) {
  var X0 = L[P1.name];
  var s1 = {};
  s1.promise = new K(function (q0, S0) {
    s1.resolve = q0;
    s1.reject = S0;
  });
  X0.deferredOperations.push(s1);
  if (!X0.dbReady) {
    X0.dbReady = s1.promise;
  } else {
    X0.dbReady = X0.dbReady.then(function () {
      return s1.promise;
    });
  }
}
function g(P1) {
  var X0 = L[P1.name];
  var s1 = X0.deferredOperations.pop();
  if (s1) {
    s1.resolve();
    return s1.promise;
  }
}
function o(P1, X0) {
  var s1 = L[P1.name];
  var q0 = s1.deferredOperations.pop();
  if (q0) {
    q0.reject(X0);
    return q0.promise;
  }
}
function c(P1, X0) {
  return new K(function (s1, q0) {
    L[P1.name] = L[P1.name] || z1();
    if (P1.db) {
      if (X0) {
        n(P1);
        P1.db.close();
      } else {
        return s1(P1.db);
      }
    }
    var S0 = [P1.name];
    if (X0) {
      S0.push(P1.version);
    }
    var O0 = I.open.apply(I, S0);
    if (X0) {
      O0.onupgradeneeded = function (VA) {
        var jA = O0.result;
        try {
          jA.createObjectStore(P1.storeName);
          if (VA.oldVersion <= 1) {
            jA.createObjectStore(q);
          }
        } catch (LA) {
          if (LA.name === "ConstraintError") {
            console.warn("The database \"" + P1.name + "\" has been upgraded from version " + VA.oldVersion + " to version " + VA.newVersion + ", but the storage \"" + P1.storeName + "\" already exists.");
          } else {
            throw LA;
          }
        }
      };
    }
    O0.onerror = function (VA) {
      VA.preventDefault();
      q0(O0.error);
    };
    O0.onsuccess = function () {
      var VA = O0.result;
      VA.onversionchange = function (jA) {
        jA.target.close();
      };
      s1(VA);
      g(P1);
    };
  });
}
function y(P1) {
  return c(P1, false);
}
function d(P1) {
  return c(P1, true);
}
function e(P1, X0) {
  if (!P1.db) {
    return true;
  }
  var s1 = !P1.db.objectStoreNames.contains(P1.storeName);
  var q0 = P1.version < P1.db.version;
  var S0 = P1.version > P1.db.version;
  if (q0) {
    if (P1.version !== X0) {
      console.warn(`${"The database \"" + P1.name}" can't be downgraded from version ${P1.db.version} to version ${P1.version}.`);
    }
    P1.version = P1.db.version;
  }
  if (S0 || s1) {
    if (s1) {
      var O0 = P1.db.version + 1;
      if (O0 > P1.version) {
        P1.version = O0;
      }
    }
    return true;
  }
  return false;
}
function Q1(P1) {
  return new K(function (X0, s1) {
    var q0 = new FileReader();
    q0.onerror = s1;
    q0.onloadend = function (S0) {
      var O0 = btoa(S0.target.result || "");
      X0({
        __local_forage_encoded_blob: true,
        data: O0,
        type: P1.type
      });
    };
    q0.readAsBinaryString(P1);
  });
}
function T1(P1) {
  var X0 = _(atob(P1.data));
  return V([X0], {
    type: P1.type
  });
}
function K1(P1) {
  return P1 && P1.__local_forage_encoded_blob;
}
function j1(P1) {
  var X0 = this;
  var s1 = X0._initReady().then(function () {
    var q0 = L[X0._dbInfo.name];
    if (q0 && q0.dbReady) {
      return q0.dbReady;
    }
  });
  H(s1, P1, P1);
  return s1;
}
function c1(P1) {
  n(P1);
  var X0 = L[P1.name];
  var s1 = X0.forages;
  for (var q0 = 0; q0 < s1.length; q0++) {
    var S0 = s1[q0];
    if (S0._dbInfo.db) {
      S0._dbInfo.db.close();
      S0._dbInfo.db = null;
    }
  }
  P1.db = null;
  return y(P1).then(function (O0) {
    P1.db = O0;
    if (e(P1)) {
      return d(P1);
    }
    return O0;
  }).then(function (O0) {
    P1.db = X0.db = O0;
    for (var VA = 0; VA < s1.length; VA++) {
      s1[VA]._dbInfo.db = O0;
    }
  }).catch(function (O0) {
    o(P1, O0);
    throw O0;
  });
}
function Z0(P1, X0, s1, q0 = 1) {
  try {
    var S0 = P1.db.transaction(P1.storeName, X0);
    s1(null, S0);
  } catch (O0) {
    if (q0 > 0 && (!P1.db || O0.name === "InvalidStateError" || O0.name === "NotFoundError")) {
      return K.resolve().then(function () {
        if (!P1.db || O0.name === "NotFoundError" && !P1.db.objectStoreNames.contains(P1.storeName) && P1.version <= P1.db.version) {
          if (P1.db) {
            P1.version = P1.db.version + 1;
          }
          return d(P1);
        }
      }).then(function () {
        return c1(P1).then(function () {
          Z0(P1, X0, s1, q0 - 1);
        });
      }).catch(s1);
    }
    s1(O0);
  }
}
function z1() {
  return {
    forages: [],
    db: null,
    dbReady: null,
    deferredOperations: []
  };
}
function U1(P1) {
  var X0 = this;
  var s1 = {
    db: null
  };
  if (P1) {
    for (var q0 in P1) {
      s1[q0] = P1[q0];
    }
  }
  var S0 = L[s1.name];
  if (!S0) {
    S0 = z1();
    L[s1.name] = S0;
  }
  S0.forages.push(X0);
  if (!X0._initReady) {
    X0._initReady = X0.ready;
    X0.ready = j1;
  }
  var O0 = [];
  function VA() {
    return K.resolve();
  }
  for (var jA = 0; jA < S0.forages.length; jA++) {
    var LA = S0.forages[jA];
    if (LA !== X0) {
      O0.push(LA._initReady().catch(VA));
    }
  }
  var pA = S0.forages.slice(0);
  return K.all(O0).then(function () {
    s1.db = S0.db;
    return y(s1);
  }).then(function (G2) {
    s1.db = G2;
    if (e(s1, X0._defaultConfig.version)) {
      return d(s1);
    }
    return G2;
  }).then(function (G2) {
    s1.db = S0.db = G2;
    X0._dbInfo = s1;
    for (var v2 = 0; v2 < pA.length; v2++) {
      var xQ = pA[v2];
      if (xQ !== X0) {
        xQ._dbInfo.db = s1.db;
        xQ._dbInfo.version = s1.version;
      }
    }
  });
}
function q1(P1, X0) {
  var s1 = this;
  P1 = z(P1);
  var q0 = new K(function (S0, O0) {
    s1.ready().then(function () {
      Z0(s1._dbInfo, T, function (VA, jA) {
        if (VA) {
          return O0(VA);
        }
        try {
          var LA = jA.objectStore(s1._dbInfo.storeName);
          var pA = LA.get(P1);
          pA.onsuccess = function () {
            var G2 = pA.result;
            if (G2 === undefined) {
              G2 = null;
            }
            if (K1(G2)) {
              G2 = T1(G2);
            }
            S0(G2);
          };
          pA.onerror = function () {
            O0(pA.error);
          };
        } catch (G2) {
          O0(G2);
        }
      });
    }).catch(O0);
  });
  D(q0, X0);
  return q0;
}
function x1(P1, X0) {
  var s1 = this;
  var q0 = new K(function (S0, O0) {
    s1.ready().then(function () {
      Z0(s1._dbInfo, T, function (VA, jA) {
        if (VA) {
          return O0(VA);
        }
        try {
          var LA = jA.objectStore(s1._dbInfo.storeName);
          var pA = LA.openCursor();
          var G2 = 1;
          pA.onsuccess = function () {
            var v2 = pA.result;
            if (v2) {
              var xQ = v2.value;
              if (K1(xQ)) {
                xQ = T1(xQ);
              }
              var L9 = P1(xQ, v2.key, G2++);
              if (L9 !== undefined) {
                S0(L9);
              } else {
                v2.continue();
              }
            } else {
              S0();
            }
          };
          pA.onerror = function () {
            O0(pA.error);
          };
        } catch (v2) {
          O0(v2);
        }
      });
    }).catch(O0);
  });
  D(q0, X0);
  return q0;
}
function a1(P1, X0, s1) {
  var q0 = this;
  P1 = z(P1);
  var S0 = new K(function (O0, VA) {
    var jA;
    q0.ready().then(function () {
      jA = q0._dbInfo;
      if (O.call(X0) === "[object Blob]") {
        return k(jA.db).then(function (LA) {
          if (LA) {
            return X0;
          }
          return Q1(X0);
        });
      }
      return X0;
    }).then(function (LA) {
      Z0(q0._dbInfo, P, function (pA, G2) {
        if (pA) {
          return VA(pA);
        }
        try {
          var v2 = G2.objectStore(q0._dbInfo.storeName);
          if (LA === null) {
            LA = undefined;
          }
          var xQ = v2.put(LA, P1);
          G2.oncomplete = function () {
            if (LA === undefined) {
              LA = null;
            }
            O0(LA);
          };
          G2.onabort = G2.onerror = function () {
            var L9 = xQ.error ? xQ.error : xQ.transaction.error;
            VA(L9);
          };
        } catch (L9) {
          VA(L9);
        }
      });
    }).catch(VA);
  });
  D(S0, s1);
  return S0;
}
function B0(P1, X0) {
  var s1 = this;
  P1 = z(P1);
  var q0 = new K(function (S0, O0) {
    s1.ready().then(function () {
      Z0(s1._dbInfo, P, function (VA, jA) {
        if (VA) {
          return O0(VA);
        }
        try {
          var LA = jA.objectStore(s1._dbInfo.storeName);
          var pA = LA.delete(P1);
          jA.oncomplete = function () {
            S0();
          };
          jA.onerror = function () {
            O0(pA.error);
          };
          jA.onabort = function () {
            var G2 = pA.error ? pA.error : pA.transaction.error;
            O0(G2);
          };
        } catch (G2) {
          O0(G2);
        }
      });
    }).catch(O0);
  });
  D(q0, X0);
  return q0;
}
function G1(P1) {
  var X0 = this;
  var s1 = new K(function (q0, S0) {
    X0.ready().then(function () {
      Z0(X0._dbInfo, P, function (O0, VA) {
        if (O0) {
          return S0(O0);
        }
        try {
          var jA = VA.objectStore(X0._dbInfo.storeName);
          var LA = jA.clear();
          VA.oncomplete = function () {
            q0();
          };
          VA.onabort = VA.onerror = function () {
            var pA = LA.error ? LA.error : LA.transaction.error;
            S0(pA);
          };
        } catch (pA) {
          S0(pA);
        }
      });
    }).catch(S0);
  });
  D(s1, P1);
  return s1;
}
function F1(P1) {
  var X0 = this;
  var s1 = new K(function (q0, S0) {
    X0.ready().then(function () {
      Z0(X0._dbInfo, T, function (O0, VA) {
        if (O0) {
          return S0(O0);
        }
        try {
          var jA = VA.objectStore(X0._dbInfo.storeName);
          var LA = jA.count();
          LA.onsuccess = function () {
            q0(LA.result);
          };
          LA.onerror = function () {
            S0(LA.error);
          };
        } catch (pA) {
          S0(pA);
        }
      });
    }).catch(S0);
  });
  D(s1, P1);
  return s1;
}
function $1(P1, X0) {
  var s1 = this;
  var q0 = new K(function (S0, O0) {
    if (P1 < 0) {
      S0(null);
      return;
    }
    s1.ready().then(function () {
      Z0(s1._dbInfo, T, function (VA, jA) {
        if (VA) {
          return O0(VA);
        }
        try {
          var LA = jA.objectStore(s1._dbInfo.storeName);
          var pA = false;
          var G2 = LA.openKeyCursor();
          G2.onsuccess = function () {
            var v2 = G2.result;
            if (!v2) {
              S0(null);
              return;
            }
            if (P1 === 0) {
              S0(v2.key);
            } else if (!pA) {
              pA = true;
              v2.advance(P1);
            } else {
              S0(v2.key);
            }
          };
          G2.onerror = function () {
            O0(G2.error);
          };
        } catch (v2) {
          O0(v2);
        }
      });
    }).catch(O0);
  });
  D(q0, X0);
  return q0;
}
function C1(P1) {
  var X0 = this;
  var s1 = new K(function (q0, S0) {
    X0.ready().then(function () {
      Z0(X0._dbInfo, T, function (O0, VA) {
        if (O0) {
          return S0(O0);
        }
        try {
          var jA = VA.objectStore(X0._dbInfo.storeName);
          var LA = jA.openKeyCursor();
          var pA = [];
          LA.onsuccess = function () {
            var G2 = LA.result;
            if (!G2) {
              q0(pA);
              return;
            }
            pA.push(G2.key);
            G2.continue();
          };
          LA.onerror = function () {
            S0(LA.error);
          };
        } catch (G2) {
          S0(G2);
        }
      });
    }).catch(S0);
  });
  D(s1, P1);
  return s1;
}
function w1(P1, X0) {
  X0 = C.apply(this, arguments);
  var s1 = this.config();
  P1 = typeof P1 !== "function" && P1 || {};
  if (!P1.name) {
    P1.name = P1.name || s1.name;
    P1.storeName = P1.storeName || s1.storeName;
  }
  var q0 = this;
  var S0;
  if (!P1.name) {
    S0 = K.reject("Invalid arguments");
  } else {
    var O0 = P1.name === s1.name && q0._dbInfo.db;
    var VA = O0 ? K.resolve(q0._dbInfo.db) : y(P1).then(function (jA) {
      var LA = L[P1.name];
      var pA = LA.forages;
      LA.db = jA;
      for (var G2 = 0; G2 < pA.length; G2++) {
        pA[G2]._dbInfo.db = jA;
      }
      return jA;
    });
    if (!P1.storeName) {
      S0 = VA.then(function (jA) {
        n(P1);
        var LA = L[P1.name];
        var pA = LA.forages;
        jA.close();
        for (var G2 = 0; G2 < pA.length; G2++) {
          var v2 = pA[G2];
          v2._dbInfo.db = null;
        }
        var xQ = new K(function (L9, e9) {
          var G9 = I.deleteDatabase(P1.name);
          G9.onerror = function () {
            var z4 = G9.result;
            if (z4) {
              z4.close();
            }
            e9(G9.error);
          };
          G9.onblocked = function () {
            console.warn("dropInstance blocked for database \"" + P1.name + "\" until all open connections are closed");
          };
          G9.onsuccess = function () {
            var z4 = G9.result;
            if (z4) {
              z4.close();
            }
            L9(z4);
          };
        });
        return xQ.then(function (L9) {
          LA.db = L9;
          for (var e9 = 0; e9 < pA.length; e9++) {
            var G9 = pA[e9];
            g(G9._dbInfo);
          }
        }).catch(function (L9) {
          (o(P1, L9) || K.resolve()).catch(function () {});
          throw L9;
        });
      });
    } else {
      S0 = VA.then(function (jA) {
        if (!jA.objectStoreNames.contains(P1.storeName)) {
          return;
        }
        var LA = jA.version + 1;
        n(P1);
        var pA = L[P1.name];
        var G2 = pA.forages;
        jA.close();
        for (var v2 = 0; v2 < G2.length; v2++) {
          var xQ = G2[v2];
          xQ._dbInfo.db = null;
          xQ._dbInfo.version = LA;
        }
        var L9 = new K(function (e9, G9) {
          var z4 = I.open(P1.name, LA);
          z4.onerror = function (T3) {
            var jZ = z4.result;
            jZ.close();
            G9(T3);
          };
          z4.onupgradeneeded = function () {
            var T3 = z4.result;
            T3.deleteObjectStore(P1.storeName);
          };
          z4.onsuccess = function () {
            var T3 = z4.result;
            T3.close();
            e9(T3);
          };
        });
        return L9.then(function (e9) {
          pA.db = e9;
          for (var G9 = 0; G9 < G2.length; G9++) {
            var z4 = G2[G9];
            z4._dbInfo.db = e9;
            g(z4._dbInfo);
          }
        }).catch(function (e9) {
          (o(P1, e9) || K.resolve()).catch(function () {});
          throw e9;
        });
      });
    }
  }
  D(S0, X0);
  return S0;
}
var R1 = {
  _driver: "asyncStorage",
  _initStorage: U1,
  _support: F(),
  iterate: x1,
  getItem: q1,
  setItem: a1,
  removeItem: B0,
  clear: G1,
  length: F1,
  key: $1,
  keys: C1,
  dropInstance: w1
};
function Q0() {
  return typeof openDatabase === "function";
}
var l1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var Y0 = "~~local_forage_type~";
var U0 = /^~~local_forage_type~([^~]+)~/;
var L1 = "__lfsc__:";
var S1 = L1.length;
var b0 = "arbf";
var P0 = "blob";
var k0 = "si08";
var $A = "ui08";
var UA = "uic8";
var xA = "si16";
var e0 = "si32";
var N2 = "ur16";
var X4 = "ui32";
var gA = "fl32";
var L2 = "fl64";
var m2 = S1 + b0.length;
var uA = Object.prototype.toString;
function aA(P1) {
  var X0 = P1.length * 0.75;
  var s1 = P1.length;
  var q0;
  var S0 = 0;
  var O0;
  var VA;
  var jA;
  var LA;
  if (P1[P1.length - 1] === "=") {
    X0--;
    if (P1[P1.length - 2] === "=") {
      X0--;
    }
  }
  var pA = new ArrayBuffer(X0);
  var G2 = new Uint8Array(pA);
  for (q0 = 0; q0 < s1; q0 += 4) {
    O0 = l1.indexOf(P1[q0]);
    VA = l1.indexOf(P1[q0 + 1]);
    jA = l1.indexOf(P1[q0 + 2]);
    LA = l1.indexOf(P1[q0 + 3]);
    G2[S0++] = O0 << 2 | VA >> 4;
    G2[S0++] = (VA & 15) << 4 | jA >> 2;
    G2[S0++] = (jA & 3) << 6 | LA & 63;
  }
  return pA;
}
function PB(P1) {
  var X0 = new Uint8Array(P1);
  var s1 = "";
  var q0;
  for (q0 = 0; q0 < X0.length; q0 += 3) {
    s1 += l1[X0[q0] >> 2];
    s1 += l1[(X0[q0] & 3) << 4 | X0[q0 + 1] >> 4];
    s1 += l1[(X0[q0 + 1] & 15) << 2 | X0[q0 + 2] >> 6];
    s1 += l1[X0[q0 + 2] & 63];
  }
  if (X0.length % 3 === 2) {
    s1 = s1.substring(0, s1.length - 1) + "=";
  } else if (X0.length % 3 === 1) {
    s1 = s1.substring(0, s1.length - 2) + "==";
  }
  return s1;
}
function rB(P1, X0) {
  var s1 = "";
  if (P1) {
    s1 = uA.call(P1);
  }
  if (P1 && (s1 === "[object ArrayBuffer]" || P1.buffer && uA.call(P1.buffer) === "[object ArrayBuffer]")) {
    var q0;
    var S0 = L1;
    if (P1 instanceof ArrayBuffer) {
      q0 = P1;
      S0 += b0;
    } else {
      q0 = P1.buffer;
      if (s1 === "[object Int8Array]") {
        S0 += k0;
      } else if (s1 === "[object Uint8Array]") {
        S0 += $A;
      } else if (s1 === "[object Uint8ClampedArray]") {
        S0 += UA;
      } else if (s1 === "[object Int16Array]") {
        S0 += xA;
      } else if (s1 === "[object Uint16Array]") {
        S0 += N2;
      } else if (s1 === "[object Int32Array]") {
        S0 += e0;
      } else if (s1 === "[object Uint32Array]") {
        S0 += X4;
      } else if (s1 === "[object Float32Array]") {
        S0 += gA;
      } else if (s1 === "[object Float64Array]") {
        S0 += L2;
      } else {
        X0(Error("Failed to get type for BinaryArray"));
      }
    }
    X0(S0 + PB(q0));
  } else if (s1 === "[object Blob]") {
    var O0 = new FileReader();
    O0.onload = function () {
      var VA = Y0 + P1.type + "~" + PB(this.result);
      X0(L1 + P0 + VA);
    };
    O0.readAsArrayBuffer(P1);
  } else {
    try {
      X0(JSON.stringify(P1));
    } catch (VA) {
      console.error("Couldn't convert value into a JSON string: ", P1);
      X0(null, VA);
    }
  }
}
function R3(P1) {
  if (P1.substring(0, S1) !== L1) {
    return JSON.parse(P1);
  }
  var X0 = P1.substring(m2);
  var s1 = P1.substring(S1, m2);
  var q0;
  if (s1 === P0 && U0.test(X0)) {
    var S0 = X0.match(U0);
    q0 = S0[1];
    X0 = X0.substring(S0[0].length);
  }
  var O0 = aA(X0);
  switch (s1) {
    case b0:
      return O0;
    case P0:
      return V([O0], {
        type: q0
      });
    case k0:
      return new Int8Array(O0);
    case $A:
      return new Uint8Array(O0);
    case UA:
      return new Uint8ClampedArray(O0);
    case xA:
      return new Int16Array(O0);
    case N2:
      return new Uint16Array(O0);
    case e0:
      return new Int32Array(O0);
    case X4:
      return new Uint32Array(O0);
    case gA:
      return new Float32Array(O0);
    case L2:
      return new Float64Array(O0);
    default:
      throw Error("Unkown type: " + s1);
  }
}
var V8 = {
  serialize: rB,
  deserialize: R3,
  stringToBuffer: aA,
  bufferToString: PB
};
function S8(P1, X0, s1, q0) {
  P1.executeSql("CREATE TABLE IF NOT EXISTS " + X0.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], s1, q0);
}
function EB(P1) {
  var X0 = this;
  var s1 = {
    db: null
  };
  if (P1) {
    for (var q0 in P1) {
      s1[q0] = typeof P1[q0] !== "string" ? P1[q0].toString() : P1[q0];
    }
  }
  var S0 = new K(function (O0, VA) {
    try {
      s1.db = openDatabase(s1.name, String(s1.version), s1.description, s1.size);
    } catch (jA) {
      return VA(jA);
    }
    s1.db.transaction(function (jA) {
      S8(jA, s1, function () {
        X0._dbInfo = s1;
        O0();
      }, function (LA, pA) {
        VA(pA);
      });
    }, VA);
  });
  s1.serializer = V8;
  return S0;
}
function r4(P1, X0, s1, q0, S0, O0) {
  P1.executeSql(s1, q0, S0, function (VA, jA) {
    if (jA.code === jA.SYNTAX_ERR) {
      VA.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [X0.storeName], function (LA, pA) {
        if (!pA.rows.length) {
          S8(LA, X0, function () {
            LA.executeSql(s1, q0, S0, O0);
          }, O0);
        } else {
          O0(LA, jA);
        }
      }, O0);
    } else {
      O0(VA, jA);
    }
  }, O0);
}
function K8(P1, X0) {
  var s1 = this;
  P1 = z(P1);
  var q0 = new K(function (S0, O0) {
    s1.ready().then(function () {
      var VA = s1._dbInfo;
      VA.db.transaction(function (jA) {
        r4(jA, VA, "SELECT * FROM " + VA.storeName + " WHERE key = ? LIMIT 1", [P1], function (LA, pA) {
          var G2 = pA.rows.length ? pA.rows.item(0).value : null;
          if (G2) {
            G2 = VA.serializer.deserialize(G2);
          }
          S0(G2);
        }, function (LA, pA) {
          O0(pA);
        });
      });
    }).catch(O0);
  });
  D(q0, X0);
  return q0;
}
function Z3(P1, X0) {
  var s1 = this;
  var q0 = new K(function (S0, O0) {
    s1.ready().then(function () {
      var VA = s1._dbInfo;
      VA.db.transaction(function (jA) {
        r4(jA, VA, "SELECT * FROM " + VA.storeName, [], function (LA, pA) {
          var G2 = pA.rows;
          var v2 = G2.length;
          for (var xQ = 0; xQ < v2; xQ++) {
            var L9 = G2.item(xQ);
            var e9 = L9.value;
            if (e9) {
              e9 = VA.serializer.deserialize(e9);
            }
            e9 = P1(e9, L9.key, xQ + 1);
            if (e9 !== undefined) {
              S0(e9);
              return;
            }
          }
          S0();
        }, function (LA, pA) {
          O0(pA);
        });
      });
    }).catch(O0);
  });
  D(q0, X0);
  return q0;
}
function o4(P1, X0, s1, q0) {
  var S0 = this;
  P1 = z(P1);
  var O0 = new K(function (VA, jA) {
    S0.ready().then(function () {
      if (X0 === undefined) {
        X0 = null;
      }
      var LA = X0;
      var pA = S0._dbInfo;
      pA.serializer.serialize(X0, function (G2, v2) {
        if (v2) {
          jA(v2);
        } else {
          pA.db.transaction(function (xQ) {
            r4(xQ, pA, "INSERT OR REPLACE INTO " + pA.storeName + " (key, value) VALUES (?, ?)", [P1, G2], function () {
              VA(LA);
            }, function (L9, e9) {
              jA(e9);
            });
          }, function (xQ) {
            if (xQ.code === xQ.QUOTA_ERR) {
              if (q0 > 0) {
                VA(o4.apply(S0, [P1, LA, s1, q0 - 1]));
                return;
              }
              jA(xQ);
            }
          });
        }
      });
    }).catch(jA);
  });
  D(O0, s1);
  return O0;
}
function G3(P1, X0, s1) {
  return o4.apply(this, [P1, X0, s1, 1]);
}
function p3(P1, X0) {
  var s1 = this;
  P1 = z(P1);
  var q0 = new K(function (S0, O0) {
    s1.ready().then(function () {
      var VA = s1._dbInfo;
      VA.db.transaction(function (jA) {
        r4(jA, VA, "DELETE FROM " + VA.storeName + " WHERE key = ?", [P1], function () {
          S0();
        }, function (LA, pA) {
          O0(pA);
        });
      });
    }).catch(O0);
  });
  D(q0, X0);
  return q0;
}
function l3(P1) {
  var X0 = this;
  var s1 = new K(function (q0, S0) {
    X0.ready().then(function () {
      var O0 = X0._dbInfo;
      O0.db.transaction(function (VA) {
        r4(VA, O0, "DELETE FROM " + O0.storeName, [], function () {
          q0();
        }, function (jA, LA) {
          S0(LA);
        });
      });
    }).catch(S0);
  });
  D(s1, P1);
  return s1;
}
function BZ(P1) {
  var X0 = this;
  var s1 = new K(function (q0, S0) {
    X0.ready().then(function () {
      var O0 = X0._dbInfo;
      O0.db.transaction(function (VA) {
        r4(VA, O0, "SELECT COUNT(key) as c FROM " + O0.storeName, [], function (jA, LA) {
          var pA = LA.rows.item(0).c;
          q0(pA);
        }, function (jA, LA) {
          S0(LA);
        });
      });
    }).catch(S0);
  });
  D(s1, P1);
  return s1;
}
function x4(P1, X0) {
  var s1 = this;
  var q0 = new K(function (S0, O0) {
    s1.ready().then(function () {
      var VA = s1._dbInfo;
      VA.db.transaction(function (jA) {
        r4(jA, VA, "SELECT key FROM " + VA.storeName + " WHERE id = ? LIMIT 1", [P1 + 1], function (LA, pA) {
          var G2 = pA.rows.length ? pA.rows.item(0).key : null;
          S0(G2);
        }, function (LA, pA) {
          O0(pA);
        });
      });
    }).catch(O0);
  });
  D(q0, X0);
  return q0;
}
function y8(P1) {
  var X0 = this;
  var s1 = new K(function (q0, S0) {
    X0.ready().then(function () {
      var O0 = X0._dbInfo;
      O0.db.transaction(function (VA) {
        r4(VA, O0, "SELECT key FROM " + O0.storeName, [], function (jA, LA) {
          var pA = [];
          for (var G2 = 0; G2 < LA.rows.length; G2++) {
            pA.push(LA.rows.item(G2).key);
          }
          q0(pA);
        }, function (jA, LA) {
          S0(LA);
        });
      });
    }).catch(S0);
  });
  D(s1, P1);
  return s1;
}
function x2(P1) {
  return new K(function (X0, s1) {
    P1.transaction(function (q0) {
      q0.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (S0, O0) {
        var VA = [];
        for (var jA = 0; jA < O0.rows.length; jA++) {
          VA.push(O0.rows.item(jA).name);
        }
        X0({
          db: P1,
          storeNames: VA
        });
      }, function (S0, O0) {
        s1(O0);
      });
    }, function (q0) {
      s1(q0);
    });
  });
}
function bB(P1, X0) {
  X0 = C.apply(this, arguments);
  var s1 = this.config();
  P1 = typeof P1 !== "function" && P1 || {};
  if (!P1.name) {
    P1.name = P1.name || s1.name;
    P1.storeName = P1.storeName || s1.storeName;
  }
  var q0 = this;
  var S0;
  if (!P1.name) {
    S0 = K.reject("Invalid arguments");
  } else {
    S0 = new K(function (O0) {
      var VA;
      if (P1.name === s1.name) {
        VA = q0._dbInfo.db;
      } else {
        VA = openDatabase(P1.name, "", "", 0);
      }
      if (!P1.storeName) {
        O0(x2(VA));
      } else {
        O0({
          db: VA,
          storeNames: [P1.storeName]
        });
      }
    }).then(function (O0) {
      return new K(function (VA, jA) {
        O0.db.transaction(function (LA) {
          function pA(L9) {
            return new K(function (e9, G9) {
              LA.executeSql("DROP TABLE IF EXISTS " + L9, [], function () {
                e9();
              }, function (z4, T3) {
                G9(T3);
              });
            });
          }
          var G2 = [];
          for (var v2 = 0, xQ = O0.storeNames.length; v2 < xQ; v2++) {
            G2.push(pA(O0.storeNames[v2]));
          }
          K.all(G2).then(function () {
            VA();
          }).catch(function (L9) {
            jA(L9);
          });
        }, function (LA) {
          jA(LA);
        });
      });
    });
  }
  D(S0, X0);
  return S0;
}
var J0 = {
  _driver: "webSQLStorage",
  _initStorage: EB,
  _support: Q0(),
  iterate: Z3,
  getItem: K8,
  setItem: G3,
  removeItem: p3,
  clear: l3,
  length: BZ,
  key: x4,
  keys: y8,
  dropInstance: bB
};
function f1() {
  try {
    return typeof localStorage !== "undefined" && "setItem" in localStorage && !!localStorage.setItem;
  } catch (P1) {
    return false;
  }
}
function F0(P1, X0) {
  var s1 = P1.name + "/";
  if (P1.storeName !== X0.storeName) {
    s1 += P1.storeName + "/";
  }
  return s1;
}
function s0() {
  var P1 = "_localforage_support_test";
  try {
    localStorage.setItem(P1, true);
    localStorage.removeItem(P1);
    return false;
  } catch (X0) {
    return true;
  }
}
function AA() {
  return !s0() || localStorage.length > 0;
}
function U2(P1) {
  var X0 = this;
  var s1 = {};
  if (P1) {
    for (var q0 in P1) {
      s1[q0] = P1[q0];
    }
  }
  s1.keyPrefix = F0(P1, X0._defaultConfig);
  if (!AA()) {
    return K.reject();
  }
  X0._dbInfo = s1;
  s1.serializer = V8;
  return K.resolve();
}
function SB(P1) {
  var X0 = this;
  var s1 = X0.ready().then(function () {
    var q0 = X0._dbInfo.keyPrefix;
    for (var S0 = localStorage.length - 1; S0 >= 0; S0--) {
      var O0 = localStorage.key(S0);
      if (O0.indexOf(q0) === 0) {
        localStorage.removeItem(O0);
      }
    }
  });
  D(s1, P1);
  return s1;
}
function I9(P1, X0) {
  var s1 = this;
  P1 = z(P1);
  var q0 = s1.ready().then(function () {
    var S0 = s1._dbInfo;
    var O0 = localStorage.getItem(S0.keyPrefix + P1);
    if (O0) {
      O0 = S0.serializer.deserialize(O0);
    }
    return O0;
  });
  D(q0, X0);
  return q0;
}
function t9(P1, X0) {
  var s1 = this;
  var q0 = s1.ready().then(function () {
    var S0 = s1._dbInfo;
    var O0 = S0.keyPrefix;
    var VA = O0.length;
    var jA = localStorage.length;
    var LA = 1;
    for (var pA = 0; pA < jA; pA++) {
      var G2 = localStorage.key(pA);
      if (G2.indexOf(O0) !== 0) {
        continue;
      }
      var v2 = localStorage.getItem(G2);
      if (v2) {
        v2 = S0.serializer.deserialize(v2);
      }
      v2 = P1(v2, G2.substring(VA), LA++);
      if (v2 !== undefined) {
        return v2;
      }
    }
  });
  D(q0, X0);
  return q0;
}
function $6(P1, X0) {
  var s1 = this;
  var q0 = s1.ready().then(function () {
    var S0 = s1._dbInfo;
    var O0;
    try {
      O0 = localStorage.key(P1);
    } catch (VA) {
      O0 = null;
    }
    if (O0) {
      O0 = O0.substring(S0.keyPrefix.length);
    }
    return O0;
  });
  D(q0, X0);
  return q0;
}
function F9(P1) {
  var X0 = this;
  var s1 = X0.ready().then(function () {
    var q0 = X0._dbInfo;
    var S0 = localStorage.length;
    var O0 = [];
    for (var VA = 0; VA < S0; VA++) {
      var jA = localStorage.key(VA);
      if (jA.indexOf(q0.keyPrefix) === 0) {
        O0.push(jA.substring(q0.keyPrefix.length));
      }
    }
    return O0;
  });
  D(s1, P1);
  return s1;
}
function p4(P1) {
  var X0 = this;
  var s1 = X0.keys().then(function (q0) {
    return q0.length;
  });
  D(s1, P1);
  return s1;
}
function y6(P1, X0) {
  var s1 = this;
  P1 = z(P1);
  var q0 = s1.ready().then(function () {
    var S0 = s1._dbInfo;
    localStorage.removeItem(S0.keyPrefix + P1);
  });
  D(q0, X0);
  return q0;
}
function H4(P1, X0, s1) {
  var q0 = this;
  P1 = z(P1);
  var S0 = q0.ready().then(function () {
    if (X0 === undefined) {
      X0 = null;
    }
    var O0 = X0;
    return new K(function (VA, jA) {
      var LA = q0._dbInfo;
      LA.serializer.serialize(X0, function (pA, G2) {
        if (G2) {
          jA(G2);
        } else {
          try {
            localStorage.setItem(LA.keyPrefix + P1, pA);
            VA(O0);
          } catch (v2) {
            if (v2.name === "QuotaExceededError" || v2.name === "NS_ERROR_DOM_QUOTA_REACHED") {
              jA(v2);
            }
            jA(v2);
          }
        }
      });
    });
  });
  D(S0, s1);
  return S0;
}
function kQ(P1, X0) {
  X0 = C.apply(this, arguments);
  P1 = typeof P1 !== "function" && P1 || {};
  if (!P1.name) {
    var s1 = this.config();
    P1.name = P1.name || s1.name;
    P1.storeName = P1.storeName || s1.storeName;
  }
  var q0 = this;
  var S0;
  if (!P1.name) {
    S0 = K.reject("Invalid arguments");
  } else {
    S0 = new K(function (O0) {
      if (!P1.storeName) {
        O0(P1.name + "/");
      } else {
        O0(F0(P1, q0._defaultConfig));
      }
    }).then(function (O0) {
      for (var VA = localStorage.length - 1; VA >= 0; VA--) {
        var jA = localStorage.key(VA);
        if (jA.indexOf(O0) === 0) {
          localStorage.removeItem(jA);
        }
      }
    });
  }
  D(S0, X0);
  return S0;
}
var F6 = {
  _driver: "localStorageWrapper",
  _initStorage: U2,
  _support: f1(),
  iterate: t9,
  getItem: I9,
  setItem: H4,
  removeItem: y6,
  clear: SB,
  length: p4,
  key: $6,
  keys: F9,
  dropInstance: kQ
};
function d1(X0, s1) {
  return X0 === s1 || typeof X0 === "number" && typeof s1 === "number" && isNaN(X0) && isNaN(s1);
}
function n1(X0, s1) {
  var q0 = X0.length;
  var S0 = 0;
  while (S0 < q0) {
    if (d1(X0[S0], s1)) {
      return true;
    }
    S0++;
  }
  return false;
}
var T0 = Array.isArray || function (P1) {
  return Object.prototype.toString.call(P1) === "[object Array]";
};
var d0 = {};
var N0 = {};
var p0 = {
  INDEXEDDB: R1,
  WEBSQL: J0,
  LOCALSTORAGE: F6
};
var NA = [p0.INDEXEDDB._driver, p0.WEBSQL._driver, p0.LOCALSTORAGE._driver];
var IA = ["dropInstance"];
var wA = ["clear", "getItem", "iterate", "key", "keys", "length", "removeItem", "setItem"].concat(IA);
var BA = {
  description: "",
  driver: NA.slice(),
  name: "localforage",
  size: 4980736,
  storeName: "keyvaluepairs",
  version: 1
};
function RA(P1, X0) {
  P1[X0] = function () {
    var s1 = arguments;
    return P1.ready().then(function () {
      return P1[X0].apply(P1, s1);
    });
  };
}
function oB() {
  for (var P1 = 1; P1 < arguments.length; P1++) {
    var X0 = arguments[P1];
    if (X0) {
      for (var s1 in X0) {
        if (X0.hasOwnProperty(s1)) {
          if (T0(X0[s1])) {
            arguments[0][s1] = X0[s1].slice();
          } else {
            arguments[0][s1] = X0[s1];
          }
        }
      }
    }
  }
  return arguments[0];
}
var t2 = function () {
  function P1(X0) {
    W(this, P1);
    for (var s1 in p0) {
      if (p0.hasOwnProperty(s1)) {
        var q0 = p0[s1];
        var S0 = q0._driver;
        this[s1] = S0;
        if (!d0[S0]) {
          this.defineDriver(q0);
        }
      }
    }
    this._defaultConfig = oB({}, BA);
    this._config = oB({}, this._defaultConfig, X0);
    this._driverSet = null;
    this._initDriver = null;
    this._ready = false;
    this._dbInfo = null;
    this._wrapLibraryMethodsWithReady();
    this.setDriver(this._config.driver).catch(function () {});
  }
  P1.prototype.config = function (s1) {
    if ((typeof s1 === "undefined" ? "undefined" : J(s1)) === "object") {
      if (this._ready) {
        return Error("Can't call config() after localforage has been used.");
      }
      for (var q0 in s1) {
        if (q0 === "storeName") {
          s1[q0] = s1[q0].replace(/\W/g, "_");
        }
        if (q0 === "version" && typeof s1[q0] !== "number") {
          return Error("Database version must be a number.");
        }
        this._config[q0] = s1[q0];
      }
      if ("driver" in s1 && s1.driver) {
        return this.setDriver(this._config.driver);
      }
      return true;
    } else if (typeof s1 === "string") {
      return this._config[s1];
    } else {
      return this._config;
    }
  };
  P1.prototype.defineDriver = function (s1, q0, S0) {
    var O0 = new K(function (VA, jA) {
      try {
        var LA = s1._driver;
        var pA = Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
        if (!s1._driver) {
          jA(pA);
          return;
        }
        var G2 = wA.concat("_initStorage");
        for (var v2 = 0, xQ = G2.length; v2 < xQ; v2++) {
          var L9 = G2[v2];
          var e9 = !n1(IA, L9);
          if ((e9 || s1[L9]) && typeof s1[L9] !== "function") {
            jA(pA);
            return;
          }
        }
        function G9() {
          function jZ(QG) {
            return function () {
              var p9 = Error("Method " + QG + " is not implemented by the current driver");
              var tX = K.reject(p9);
              D(tX, arguments[arguments.length - 1]);
              return tX;
            };
          }
          for (var QZ = 0, OF = IA.length; QZ < OF; QZ++) {
            var V7 = IA[QZ];
            if (!s1[V7]) {
              s1[V7] = jZ(V7);
            }
          }
        }
        G9();
        function z4(jZ) {
          if (d0[LA]) {
            console.info("Redefining LocalForage driver: " + LA);
          }
          d0[LA] = s1;
          N0[LA] = jZ;
          VA();
        }
        if ("_support" in s1) {
          if (s1._support && typeof s1._support === "function") {
            s1._support().then(z4, jA);
          } else {
            z4(!!s1._support);
          }
        } else {
          z4(true);
        }
      } catch (T3) {
        jA(T3);
      }
    });
    H(O0, q0, S0);
    return O0;
  };
  P1.prototype.driver = function () {
    return this._driver || null;
  };
  P1.prototype.getDriver = function (s1, q0, S0) {
    var O0 = d0[s1] ? K.resolve(d0[s1]) : K.reject(Error("Driver not found."));
    H(O0, q0, S0);
    return O0;
  };
  P1.prototype.getSerializer = function (s1) {
    var q0 = K.resolve(V8);
    H(q0, s1);
    return q0;
  };
  P1.prototype.ready = function (s1) {
    var q0 = this;
    var S0 = q0._driverSet.then(function () {
      if (q0._ready === null) {
        q0._ready = q0._initDriver();
      }
      return q0._ready;
    });
    H(S0, s1, s1);
    return S0;
  };
  P1.prototype.setDriver = function (s1, q0, S0) {
    var O0 = this;
    if (!T0(s1)) {
      s1 = [s1];
    }
    var VA = this._getSupportedDrivers(s1);
    function jA() {
      O0._config.driver = O0.driver();
    }
    function LA(v2) {
      O0._extend(v2);
      jA();
      O0._ready = O0._initStorage(O0._config);
      return O0._ready;
    }
    function pA(v2) {
      return function () {
        var xQ = 0;
        function L9() {
          while (xQ < v2.length) {
            var e9 = v2[xQ];
            xQ++;
            O0._dbInfo = null;
            O0._ready = null;
            return O0.getDriver(e9).then(LA).catch(L9);
          }
          jA();
          var G9 = Error("No available storage method found.");
          O0._driverSet = K.reject(G9);
          return O0._driverSet;
        }
        return L9();
      };
    }
    var G2 = this._driverSet !== null ? this._driverSet.catch(function () {
      return K.resolve();
    }) : K.resolve();
    this._driverSet = G2.then(function () {
      var v2 = VA[0];
      O0._dbInfo = null;
      O0._ready = null;
      return O0.getDriver(v2).then(function (xQ) {
        O0._driver = xQ._driver;
        jA();
        O0._wrapLibraryMethodsWithReady();
        O0._initDriver = pA(VA);
      });
    }).catch(function () {
      jA();
      var v2 = Error("No available storage method found.");
      O0._driverSet = K.reject(v2);
      return O0._driverSet;
    });
    H(this._driverSet, q0, S0);
    return this._driverSet;
  };
  P1.prototype.supports = function (s1) {
    return !!N0[s1];
  };
  P1.prototype._extend = function (s1) {
    oB(this, s1);
  };
  P1.prototype._getSupportedDrivers = function (s1) {
    var q0 = [];
    for (var S0 = 0, O0 = s1.length; S0 < O0; S0++) {
      var VA = s1[S0];
      if (this.supports(VA)) {
        q0.push(VA);
      }
    }
    return q0;
  };
  P1.prototype._wrapLibraryMethodsWithReady = function () {
    for (var s1 = 0, q0 = wA.length; s1 < q0; s1++) {
      RA(this, wA[s1]);
    }
  };
  P1.prototype.createInstance = function (s1) {
    return new P1(s1);
  };
  return P1;
}();
var e2 = new t2();
module.exports = e2;