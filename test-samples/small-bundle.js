// Sample webpack bundle: ~200 lines, demonstrates bundle structure
// This tests webcrack integration
// Expected: Should unbundle into multiple modules

(function(modules) {
  var installedModules = {};

  function __webpack_require__(moduleId) {
    if(installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    module.l = true;
    return module.exports;
  }

  __webpack_require__.m = modules;
  __webpack_require__.c = installedModules;

  __webpack_require__.d = function(exports, name, getter) {
    if(!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, { enumerable: true, get: getter });
    }
  };

  __webpack_require__.r = function(exports) {
    if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exports, '__esModule', { value: true });
  };

  __webpack_require__.t = function(value, mode) {
    if(mode & 1) value = __webpack_require__(value);
    if(mode & 8) return value;
    if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
    var ns = Object.create(null);
    __webpack_require__.r(ns);
    Object.defineProperty(ns, 'default', { enumerable: true, value: value });
    if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
    return ns;
  };

  __webpack_require__.n = function(module) {
    var getter = module && module.__esModule ?
      function getDefault() { return module['default']; } :
      function getModuleExports() { return module; };
    __webpack_require__.d(getter, 'a', getter);
    return getter;
  };

  __webpack_require__.o = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  __webpack_require__.p = "";

  return __webpack_require__(__webpack_require__.s = 0);
})([
  // Module 0: Entry point
  function(module, exports, __webpack_require__) {
    "use strict";

    const a = __webpack_require__(1);
    const b = __webpack_require__(2);

    const c = a.d(10, 20);
    const e = b.f("hello");

    console.log("Result:", c, e);

    module.exports = { c, e };
  },

  // Module 1: Math utilities
  function(module, exports, __webpack_require__) {
    "use strict";

    __webpack_require__.r(exports);
    __webpack_require__.d(exports, "d", function() { return d; });
    __webpack_require__.d(exports, "g", function() { return g; });

    const d = function(h, i) {
      return h + i;
    };

    const g = function(j, k) {
      return j * k;
    };
  },

  // Module 2: String utilities
  function(module, exports, __webpack_require__) {
    "use strict";

    __webpack_require__.r(exports);
    __webpack_require__.d(exports, "f", function() { return f; });
    __webpack_require__.d(exports, "l", function() { return l; });

    const f = function(m) {
      return m.toUpperCase();
    };

    const l = function(n) {
      return n.toLowerCase();
    };
  },

  // Module 3: Array utilities
  function(module, exports, __webpack_require__) {
    "use strict";

    __webpack_require__.r(exports);
    __webpack_require__.d(exports, "o", function() { return o; });
    __webpack_require__.d(exports, "p", function() { return p; });

    const o = function(q) {
      return q.map(r => r * 2);
    };

    const p = function(s) {
      return s.filter(t => t > 0);
    };
  },

  // Module 4: Object utilities
  function(module, exports, __webpack_require__) {
    "use strict";

    __webpack_require__.r(exports);
    __webpack_require__.d(exports, "u", function() { return u; });
    __webpack_require__.d(exports, "v", function() { return v; });

    const u = function(w, x) {
      return { ...w, ...x };
    };

    const v = function(y, z) {
      const { [z]: aa, ...ab } = y;
      return { aa, ab };
    };
  },

  // Module 5: Async utilities
  function(module, exports, __webpack_require__) {
    "use strict";

    __webpack_require__.r(exports);
    __webpack_require__.d(exports, "ac", function() { return ac; });
    __webpack_require__.d(exports, "ad", function() { return ad; });

    const ac = async function(ae) {
      return new Promise(af => setTimeout(() => af(ae), 100));
    };

    const ad = async function(ag) {
      try {
        const ah = await ac(ag);
        return ah;
      } catch(ai) {
        return null;
      }
    };
  }
]);
