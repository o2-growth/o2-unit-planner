

# Fix: PDF export crash — "Invalid argument passed to jsPDF.f2"

## Problem
In the `didParseCell` callback (line 220), the code reads `data.cell.styles.fillColor` for the "Total" column highlight. For regular rows without an explicit fill color, `fillColor` is `false` (not `null`/`undefined`), so the `|| [255, 255, 255]` fallback doesn't activate. The value `false` gets passed to jsPDF's `setFillColor`, which crashes.

## Fix

**`src/lib/exportPdf.ts`, line 220**:

Change:
```ts
const bg = data.cell.styles.fillColor || [255, 255, 255];
```

To:
```ts
const bg = Array.isArray(data.cell.styles.fillColor) ? data.cell.styles.fillColor : [255, 255, 255];
```

This ensures only valid RGB arrays are used for color math; any falsy or non-array value falls back to white.

Single line change, no other files affected.

