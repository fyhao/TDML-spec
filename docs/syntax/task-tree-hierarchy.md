---
type: Syntax Concept
title: Task Tree Hierarchy
description: TDML derives parent-child task relationships entirely from leading spaces.
resource: ../../FORMAL-SPEC.md#8-tree-construction
tags: [tdml, syntax, hierarchy, tree]
timestamp: "2026-06-17T00:00:00+08:00"
---

# Rule

TDML hierarchy is encoded only by leading spaces before the task marker in a [Canonical Task Line](/syntax/canonical-task-line.md).

When importing a document:

1. Count the leading spaces for the current task.
2. Find the nearest previous task with a smaller indentation value.
3. Make the current task a child of that task.
4. If no prior task has smaller indentation, the current task is a root task.

Tasks with equal indentation are siblings.

# Example

```text
- [ ] Parent task (start: 20260617)
 - [w] 0930,yyyy Child task (start: 20260617)
 - [ ] Sibling child task (start: 20260617)
- [x] Another root task (start: 20260617)
```

# Round-Trip Guidance

Importers should preserve original indentation width where possible. Exporters that do not preserve exact spacing should use a stable indentation policy so parent-child relationships remain unchanged.

# Citations

[1] [TDML tree construction](../../FORMAL-SPEC.md#8-tree-construction)
[2] [TDML hierarchy and indentation](../../SPEC.md#6-hierarchy-and-indentation)
