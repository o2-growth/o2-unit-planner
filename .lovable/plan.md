

# Fix: PDF export not working

## Problem
The code uses `doc.autoTable(...)` (line 99 of ActionButtons.tsx), which was the jspdf-autotable **v3** API. In **v5** (currently installed: 5.0.7), `autoTable` is no longer patched onto the jsPDF instance via a side-effect import. Instead, it's exported as a standalone function: `autoTable(doc, options)`.

The `await import('jspdf-autotable')` on line 79 imports the module but doesn't attach anything to the jsPDF instance, so `doc.autoTable` is `undefined` and the call silently fails.

## Fix

**`src/components/simulator/ActionButtons.tsx`** (lines 78-105):

Change from:
```ts
const { default: jsPDF } = await import('jspdf');
await import('jspdf-autotable');

const doc = new jsPDF('landscape', 'mm', 'a4') as any;
// ...
doc.autoTable({ ... });
```

To:
```ts
const { default: jsPDF } = await import('jspdf');
const { default: autoTable } = await import('jspdf-autotable');

const doc = new jsPDF('landscape', 'mm', 'a4');
// ...
autoTable(doc, { ... });
```

This is a single-line semantic change: import `autoTable` as a named default, then call `autoTable(doc, options)` instead of `doc.autoTable(options)`.

