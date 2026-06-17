---
type: Implementation Concept
title: Parser and Exporter Conformance
description: TDML implementations should parse canonical lines, build task trees from indentation, and export canonical TDML.
resource: ../../FORMAL-SPEC.md
tags: [tdml, implementation, parser, exporter, conformance]
timestamp: "2026-06-17T00:00:00+08:00"
---

# Importer Behavior

A strict TDML importer rejects non-empty lines that do not match the canonical grammar and reports the failed line number.

A tolerant TDML importer still attempts canonical parsing first, then may preserve malformed lines as implementation-defined note nodes or fallback tasks. Tolerant importers should retain the original line content for recovery or editing.

# Exporter Behavior

A conforming canonical exporter:

1. Emits one task per non-empty line.
2. Emits the [Task Status Values](/syntax/task-status-values.md) inside the required `- [<status>]` marker.
3. Emits a timestamp pair only when both start and end tokens exist.
4. Uses single ASCII spaces between syntactic segments.
5. Emits the context-date suffix only at the end of the line.
6. Preserves task order.
7. Serializes children immediately after their parent.

# Round-Trip Requirements

When a TDML document is parsed and exported without semantic edits, implementations must preserve status values, task order, and parent-child relationships. They should preserve raw timestamp tokens and context dates.

Exact byte-for-byte preservation is not required if the exporter normalizes whitespace to canonical TDML.

# Reference Implementation

The project includes a TypeScript reference implementation at [reference/tdml.ts](../../reference/tdml.ts). It is useful for validating parser and stringifier behavior against the project examples.

# Citations

[1] [TDML formal definition](../../FORMAL-SPEC.md)
[2] [TDML reference implementation](../../reference/tdml.ts)
