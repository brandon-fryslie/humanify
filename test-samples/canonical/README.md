# Canonical Test Samples

This directory contains canonical JavaScript libraries used to measure unminification quality.

## Purpose

These samples provide ground truth for measuring how well HumanifyJS restores minified code to human-readable form. Each sample:

1. Has well-named, readable original source code
2. Is minified using standard tools (terser)
3. Is used to measure baseline and improved performance

## Samples

### tiny-qs (~350 lines)
- **Library**: QS stringify module
- **Source**: https://github.com/ljharb/qs/blob/main/lib/stringify.js
- **Original size**: 357 lines, 11.5KB
- **Minified size**: 4.9KB (57% reduction)
- **Baseline match rate**: 9.52% (6/63 identifiers)

### small-axios (~3000 lines)
- **Library**: Axios HTTP client (UMD bundle)
- **Source**: https://unpkg.com/axios@1.6.0/dist/axios.js
- **Original size**: 3,011 lines, 97KB
- **Minified size**: 32KB (67% reduction)
- **Baseline match rate**: TBD

### medium-chart (~11,000 lines)
- **Library**: Chart.js visualization library
- **Source**: https://unpkg.com/chart.js@4.4.0/dist/chart.js
- **Original size**: 11,448 lines, 401KB
- **Minified size**: 166KB (59% reduction)
- **Baseline match rate**: TBD

## Directory Structure

```
canonical/
├── README.md                    # This file
├── tiny-qs/
│   ├── original.js              # Original well-named source
│   ├── minified.js              # Terser-minified version
│   ├── unminified.js/           # Humanify output directory
│   │   └── deobfuscated.js      # Unminified result
│   └── baseline-scores.json     # Quality metrics
├── small-axios/
│   └── ...
└── medium-chart/
    └── ...
```

## Scripts

### Minify Samples
```bash
npm run minify-samples
```

Minifies all `original.js` files using terser with these settings:
- Mangle all names (including top-level)
- Standard compression optimizations
- Remove all comments

### Compare Quality
```bash
npm run compare <original.js> <unminified.js>
```

Compares two files and outputs:
- Identifier counts
- Exact name matches
- Match percentage
- Structural validity

### Measure Baseline
```bash
npm run measure-baseline [sample-name]
```

Runs HumanifyJS in sequential mode (no --turbo) and records baseline quality metrics.

## Baseline Methodology

1. **Minification**: Use terser with standard settings
2. **Processing**: Run `humanify unminify --provider openai --no-chunking` (sequential mode)
3. **Comparison**: Extract all binding identifiers from both original and unminified
4. **Metrics**: Calculate exact name match percentage

## Quality Metrics

- **Identifier Count**: Total number of binding identifiers (variables, functions, parameters)
- **Exact Matches**: Identifiers that match the original name exactly
- **Match Percentage**: (Exact Matches / Original Identifier Count) * 100
- **Structural Validity**: Both files parse correctly as valid JavaScript

## Future Work

Once Turbo V2 is implemented:
- Measure quality improvement over baseline
- Measure performance improvement (time, API calls)
- Track quality vs speed tradeoffs
