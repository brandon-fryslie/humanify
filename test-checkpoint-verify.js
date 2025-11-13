// Test file for checkpoint verification
function a(b, c) {
  const d = b + c;
  const e = d * 2;
  let f = e / 3;

  if (d > 10) {
    const g = d - 5;
    f = g + e;
  }

  function h(i) {
    const j = i * 2;
    return j + f;
  }

  return h(d) + e;
}

const k = a(5, 10);
console.log(k);
