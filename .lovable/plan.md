

# Fix: Overlapping text in DRE table on horizontal scroll

## Problem
The DRE table in Section 9 has sticky left columns (the "Linha" column) but the table itself is not wrapped in a scrollable container. When the table overflows horizontally, the sticky column text overlaps with the scrolling content, causing characters to pile on top of each other -- especially visible in the "RESULTADO FINAL" row.

## Root Cause
The `<Table>` component (line 199) sits directly inside `<CardContent>` without an `overflow-x-auto` wrapper. Without a proper scroll container, the `sticky left-0` positioning on the first column cells doesn't work correctly, causing visual overlap.

## Fix

**`src/components/simulator/SectionPL.tsx`** (line ~198-308):
- Wrap the `<Table>` in a `<div className="overflow-x-auto">` container
- This creates a proper scroll context for the sticky positioning to work against

Single change: add a scroll wrapper div around the Table element inside the Card.

