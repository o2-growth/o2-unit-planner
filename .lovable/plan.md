

# Fix: Sticky column still showing overlapping text

## Problem
The `overflow-x-auto` wrapper was added but the overlapping persists. The root cause is that sticky cells use **semi-transparent backgrounds** like `bg-primary/10` and `bg-card` (which may resolve to a transparent/variable color). When scrolling horizontally, the content behind bleeds through.

## Fix

**`src/components/simulator/SectionPL.tsx`**:

1. **DRERow component** (line 357): Replace `bg-primary/10` with `bg-green-50` (or similar solid color) for the primary highlight sticky cell, and replace `bg-card` with `bg-white dark:bg-gray-950` (solid fallback).

2. **GroupRow component** (line 327): Same fix — replace `bg-card` with `bg-white dark:bg-gray-950`.

3. **Receita Líquida inline row** (around line 247): The sticky cell uses `bg-muted` which should be solid, but verify.

All sticky `<TableCell>` elements must have a fully opaque background so scrolling content doesn't show through.

### Specific changes:
- Line 327: `bg-card` → `bg-white dark:bg-gray-950`
- Line 357: `bg-card` → `bg-white dark:bg-gray-950`, `bg-primary/10` → `bg-green-100 dark:bg-green-950`
- Line 247 (Receita Líquida sticky cell): ensure `bg-muted` is present (already is)

