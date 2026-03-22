# TDML Specification

This document is explanatory. For the normative grammar and conformance rules, see [FORMAL-SPEC.md](FORMAL-SPEC.md).

## 1. Overview

TDML, or TodoList Markup Language, is a text format for representing task trees. Each non-empty line represents one task node. A task may include:

- hierarchy through leading spaces
- task status
- optional time range metadata
- a free-form description
- an optional context date used to resolve shorthand timestamps

TDML is designed for two-way conversion:

- import TDML text into a structured task tree for UI editing
- export the edited task tree back into TDML text

This specification treats the parser-oriented task form as the canonical interchange format. Human shorthand may be accepted by an application, but it should be normalized to canonical TDML on export.

## 2. Data Model

Each parsed task contains the following logical fields:

```ts
export enum TaskStatus {
  PENDING = ' ',
  IN_PROGRESS = 'w',
  DONE = 'x',
}

export interface Task {
  id: string;
  rawLine: string;
  indentLevel: number;
  status: TaskStatus;
  startTimeRaw?: string;
  endTimeRaw?: string;
  description: string;
  contextDateRaw?: string;
  children: Task[];
}
```

Notes:

- `id` is internal UI state and is not part of the TDML wire format
- `rawLine` is optional metadata for debugging and round-trip aids
- `children` is derived from indentation, not stored inline in TDML

## 3. Canonical Syntax

### 3.1 Canonical task line

```text
<indent>- [<status>] [<startRaw>,<endRaw> ]<description>[ (start: <YYYYMMDD>)]
```

Where:

- `<indent>` is zero or more leading spaces
- `- ` is a required task marker in canonical serialized TDML
- `<status>` is exactly one character: ` `, `w`, or `x`
- `[<startRaw>,<endRaw> ]` is optional
- `<description>` is required and may contain any text except a trailing context-date suffix reserved by this spec
- `[ (start: <YYYYMMDD>)]` is optional

### 3.2 Canonical regex

The reference parser uses this compatibility regex:

```js
/^(\s*)- \[([ xw])\]\s*(?:([0-9]{4}|[0-9]{8}|[0-9]{12}),([0-9]{4}|[0-9]{8}|[0-9]{12}|yyyy)\s+)?(.*?)(?:\s+\(start: ([0-9]{8})\))?$/
```

Capture groups:

1. indentation
2. status marker
3. optional start time
4. optional end time
5. description
6. optional context date

## 4. Status Values

TDML defines three task states:

| Marker | Meaning |
| --- | --- |
| ` ` | Pending |
| `w` | In progress |
| `x` | Done |

Recommendations:

- use `w` with `endRaw=yyyy` for open work
- use `x` when a task has completed
- use ` ` when a task is not started

## 5. Timestamp Formats

TDML supports compact timestamp tokens in three numeric lengths plus the open-ended sentinel `yyyy`.

### 5.1 Start and end token formats

| Token shape | Meaning |
| --- | --- |
| `HHmm` | Time on a known date |
| `MMDDHHmm` | Month, day, time in a known year |
| `YYYYMMDDHHmm` | Fully qualified local timestamp |
| `yyyy` | End timestamp is open or unknown |

### 5.2 Context date

The context date suffix has this format:

```text
(start: YYYYMMDD)
```

It provides a reference date for resolving shorthand timestamps.

### 5.3 Resolution rules

Importers should resolve timestamps using the following rules:

1. If a token is `YYYYMMDDHHmm`, use it directly.
2. If a start token is `MMDDHHmm`, combine it with the year from `contextDateRaw` when present.
3. If a start token is `HHmm`, combine it with the full date from `contextDateRaw` when present.
4. If an end token is `yyyy`, treat the task as having no resolved end timestamp.
5. If an end token is `HHmm`, combine it with the resolved start date when available; otherwise combine it with the full date from `contextDateRaw`.
6. If an end token is `MMDDHHmm`, combine it with the resolved start year when available; otherwise combine it with the year from `contextDateRaw`.

If neither `contextDateRaw` nor a previously resolved start date is available, the importer may:

- leave the timestamp unresolved
- or use an application-defined default year or date

For deterministic interchange, producers should include `(start: YYYYMMDD)` whenever they emit `HHmm` or `MMDDHHmm`.

### 5.4 Cross-day and cross-year ranges

TDML does not infer a date rollover from a short `HHmm` end time. Cross-day or cross-year intervals should be written explicitly with:

- `MMDDHHmm`, or
- `YYYYMMDDHHmm`

Examples:

- `1339,1423` means same-day start and end
- `11121339,11131450` means the range crosses to November 13 in the same reference year
- `202511121339,202601011450` means the range crosses into a new year

## 6. Hierarchy and Indentation

Hierarchy is encoded by leading spaces.

Rules:

- a task with greater indentation than the previous task becomes a child of the nearest less-indented ancestor
- a task with equal indentation becomes a sibling
- a task with smaller indentation closes the previous nesting until a valid parent is found

Importers should preserve the original indentation width for round-trip safety. Exporters that do not preserve original spacing should default to two spaces per nesting level.

## 7. Import Behavior

TDML supports two parser modes.

### 7.1 Strict mode

- reject any non-empty line that does not match the canonical grammar
- report line number and parse error

### 7.2 Tolerant mode

- attempt canonical parse first
- if parsing fails, keep the line as a pending root task or plain note node
- preserve the original `rawLine`

The reference parser in this folder uses tolerant import behavior.

## 8. Export Behavior

Exporters should produce canonical TDML lines.

Normalization rules:

1. emit `- [<status>]`
2. emit one single space before the timestamp pair when present
3. emit one single space between the timestamp pair and description
4. emit one single space before the context date suffix when present
5. preserve task order
6. serialize children immediately after their parent

Canonical export example:

```text
- [w] 1330,yyyy Write draft (start: 20251112)
  - [ ] Review notes (start: 20251112)
```

## 9. UI Rendering Specification

A TDML-compatible UI should treat the parsed document as a task tree and expose the following behaviors.

### 9.1 Required UI capabilities

- render the tree structure from indentation
- show task status as a toggleable control
- show description as editable text
- show start and end raw timestamp fields
- show a readable resolved timestamp preview
- allow add, edit, delete, indent, and outdent operations
- allow switching between text import/export and structured task management

### 9.2 Recommended UI affordances

- color-code status
- display open ranges where `endRaw=yyyy`
- offer strict and tolerant import modes
- warn when shorthand times cannot be resolved because context is missing
- preserve unknown or malformed lines instead of silently dropping them

### 9.3 Indent and outdent semantics

When a UI supports indent changes:

- indenting a task makes it the child of its previous sibling
- outdenting a task makes it the next sibling of its parent

This matches the included reference helper `adjustTaskIndent`.

## 10. Round-Trip Guarantees

A TDML implementation should aim for semantic round-trip safety:

- parse TDML text into a tree
- edit structured fields in the UI
- export TDML text without losing task order, status, timestamps, descriptions, or hierarchy

Exact byte-for-byte round-trip is not required if the UI normalizes whitespace, but semantic equivalence should be preserved.

## 11. Example Mapping

### Example 1

```text
- [ ] main task 1 which is pending (start: 20251112)
```

- status: pending
- description: `main task 1 which is pending`
- context date: `20251112`

### Example 2

```text
- [w] 1330,yyyy main task 2 which is in progress worked start from 13:30pm (start: 20251112)
```

- status: in progress
- start: `2025-11-12 13:30`
- end: open

### Example 3

```text
- [x] 1339,1423 main task 3 which is done start from 13:39pm and end at 14:23pm (start: 20251112)
```

- status: done
- start: `2025-11-12 13:39`
- end: `2025-11-12 14:23`

### Example 4

```text
- [x] 11121339,1450 main task 4 start from 2025-11-12 13:39pm and ended with same day 14:50pm (start: 20251112)
```

- start raw: `11121339`
- end raw: `1450`
- resolved start: `2025-11-12 13:39`
- resolved end: `2025-11-12 14:50`

### Example 5

```text
- [x] 11121339,11131450 main task 5 start from 2025-11-12 13:39pm and ended with 2025-11-13 14:50pm (start: 20251112)
```

- resolved start: `2025-11-12 13:39`
- resolved end: `2025-11-13 14:50`

### Example 6

```text
- [ ] main task 6 (start: 20251112)
  - [w] 0930,yyyy sub task 6.1 start from 2025-11-13 09:30am (start: 20251113)
  - [w] 11140930,yyyy sub task 6.2 start from 2025-11-14 09:30am (start: 20251113)
```

- `main task 6` is the parent task
- both indented lines are children
- child timestamps may use their own context date

## 12. Non-Goals

TDML does not currently define:

- priorities
- tags
- recurrence
- attachments
- comments
- dependencies
- timezone offsets

These may be added by future versions, but they are out of scope for this initial spec.
