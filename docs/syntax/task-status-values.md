---
type: Syntax Concept
title: Task Status Values
description: TDML uses one-character task status markers for pending, in-progress, and done states.
resource: ../../FORMAL-SPEC.md#6-status-semantics
tags: [tdml, syntax, status]
timestamp: "2026-06-17T00:00:00+08:00"
---

# Values

TDML defines exactly three serialized status markers:

| Marker | Meaning |
| --- | --- |
| ` ` | Pending |
| `w` | In progress |
| `x` | Done |

The marker appears inside the status block of a [Canonical Task Line](/syntax/canonical-task-line.md).

# Export Rules

A canonical exporter must emit one of these three markers for every serialized task. Applications may display richer UI states, colors, or labels, but the wire format remains the three-marker set.

# Usage Guidance

Use `w` with an end timestamp of `yyyy` when work is ongoing. Use `x` after completion. Use a space when the task is not started.

# Citations

[1] [TDML status semantics](../../FORMAL-SPEC.md#6-status-semantics)
[2] [TDML status values](../../SPEC.md#4-status-values)
