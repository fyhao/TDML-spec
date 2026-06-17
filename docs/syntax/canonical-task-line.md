---
type: Syntax Concept
title: Canonical Task Line
description: The canonical TDML task line combines indentation, status, optional timestamps, description, and context date.
resource: ../../FORMAL-SPEC.md#5-canonical-grammar
tags: [tdml, syntax, grammar]
timestamp: "2026-06-17T00:00:00+08:00"
---

# Syntax

A canonical TDML task line has this shape:

```text
<indent>- [<status>] [<startRaw>,<endRaw> ]<description>[ (start: <YYYYMMDD>)]
```

The line starts with zero or more spaces, then the required task marker `- ` and status block. A timestamp pair is optional, but when present it must include both start and end tokens separated by a comma.

# Fields

| Segment | Required | Meaning |
| --- | --- | --- |
| `<indent>` | yes | Zero or more leading spaces used by [Task Tree Hierarchy](/syntax/task-tree-hierarchy.md) |
| `- [` and `]` | yes | Canonical task marker and status block delimiters |
| `<status>` | yes | One of the [Task Status Values](/syntax/task-status-values.md) |
| `<startRaw>,<endRaw>` | no | Compact timestamp pair described by [Timestamp Shorthand](/syntax/timestamp-shorthand.md) |
| `<description>` | yes | Non-empty task text |
| `(start: <YYYYMMDD>)` | no | Context date for resolving shorthand timestamps |

# Example

```text
- [w] 1330,yyyy Write TDML OKF docs (start: 20260617)
```

# Citations

[1] [TDML formal canonical grammar](../../FORMAL-SPEC.md#5-canonical-grammar)
[2] [TDML explanatory canonical syntax](../../SPEC.md#3-canonical-syntax)
