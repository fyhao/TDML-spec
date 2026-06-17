---
type: Project
title: TDML Project
description: TDML is a plain-text, line-oriented format for nested todo lists with status, timestamps, and context dates.
resource: ../README.md
tags: [tdml, project, todo, markup]
timestamp: "2026-06-17T00:00:00+08:00"
---

# Overview

TDML stands for TodoList Markup Language. It stores task trees in plain UTF-8 text so todo data stays readable, diffable, and easy to round-trip between files and user interfaces.

Each non-empty TDML line represents one task. The task line can encode:

| Field | Purpose |
| --- | --- |
| indentation | Parent-child hierarchy |
| status marker | Pending, in-progress, or done state |
| timestamp pair | Optional compact start and end tokens |
| description | Human-readable task text |
| context date | Reference date for shorthand timestamp resolution |

The project treats the parser-oriented line format as the canonical serialized form. Human-friendly shorthand can be accepted by applications, but exporters should normalize back to canonical TDML.

# Relationships

The normative format rules live in [TDML Formal Definition](/implementation/parser-exporter-conformance.md), which references the root [FORMAL-SPEC.md](../../FORMAL-SPEC.md). The explanatory project specification is summarized by [Canonical Task Line](/syntax/canonical-task-line.md), [Timestamp Shorthand](/syntax/timestamp-shorthand.md), and [Task Tree Hierarchy](/syntax/task-tree-hierarchy.md).

# Citations

[1] [TDML README](../../README.md)
[2] [TDML explanatory specification](../../SPEC.md)
[3] [TDML formal definition](../../FORMAL-SPEC.md)
