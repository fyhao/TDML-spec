---
type: Syntax Concept
title: Timestamp Shorthand
description: TDML supports compact timestamp tokens resolved with an optional context date.
resource: ../../FORMAL-SPEC.md#7-timestamp-semantics
tags: [tdml, syntax, timestamps]
timestamp: "2026-06-17T00:00:00+08:00"
---

# Token Shapes

TDML timestamp pairs use compact local-time tokens:

| Shape | Meaning |
| --- | --- |
| `HHmm` | Time on a known date |
| `MMDDHHmm` | Month, day, and time in a known year |
| `YYYYMMDDHHmm` | Fully qualified local timestamp |
| `yyyy` | Open or unresolved end timestamp |

Only end timestamps may use `yyyy`.

# Context Date

The optional context-date suffix has this shape:

```text
(start: YYYYMMDD)
```

Producers should include a context date whenever they emit `HHmm` or `MMDDHHmm`, because these shorter tokens need an external date or year to resolve deterministically.

# Resolution

Resolution is local and timezone-free in the wire format:

* `HHmm` resolves against the full context date.
* `MMDDHHmm` resolves against the context year.
* `YYYYMMDDHHmm` is already complete.
* `yyyy` stays unresolved and represents an open end.

For end timestamps, importers should prefer the resolved start date or year before falling back to the task context date.

# Citations

[1] [TDML timestamp semantics](../../FORMAL-SPEC.md#7-timestamp-semantics)
[2] [TDML timestamp formats](../../SPEC.md#5-timestamp-formats)
