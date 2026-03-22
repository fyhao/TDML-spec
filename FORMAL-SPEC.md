# TDML Formal Definition

Version: 1.0.0

Status: Normative

## 1. Scope

This document defines the normative grammar and conformance rules for TDML, the TodoList Markup Language.

This file is the authoritative source for:

- canonical serialized syntax
- token shapes
- indentation-based tree construction
- importer and exporter conformance

The following files are informative companions:

- [README.md](README.md)
- [SPEC.md](SPEC.md)
- [examples/sample.tdml](examples/sample.tdml)
- [reference/tdml.ts](reference/tdml.ts)

## 2. Conformance Language

The key words `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` in this document are to be interpreted as described in RFC 2119 and RFC 8174.

## 3. Character Encoding

TDML documents MUST be interpreted as UTF-8 text.

Line endings MAY be:

- LF
- CRLF

Parsers MUST treat either line ending as a logical line break.

## 4. Document Model

A TDML document is a sequence of lines. Each non-empty line represents exactly one task node.

A task node consists of:

- leading indentation
- a task marker
- a status marker
- an optional timestamp pair
- a description
- an optional context-date suffix

The logical task object contains:

```ts
interface Task {
  indentLevel: number;
  status: " " | "w" | "x";
  startTimeRaw?: string;
  endTimeRaw?: string;
  description: string;
  contextDateRaw?: string;
  children: Task[];
}
```

Fields such as `id` and `rawLine` are implementation metadata and are not part of the TDML wire format.

## 5. Canonical Grammar

### 5.1 ABNF

The canonical TDML line grammar is defined below using ABNF.

```abnf
document        = *(linebreak / task-line linebreak) [task-line [linebreak]]

task-line       = indent task-marker status-block SP body
body            = [timestamp-pair SP] description [SP context-date]

indent          = *SP
task-marker     = "-" SP
status-block    = "[" status "]"
status          = SP / "w" / "x"

timestamp-pair  = timestamp "," end-timestamp
timestamp       = hhmm / mmddhhmm / yyyymmddhhmm
end-timestamp   = hhmm / mmddhhmm / yyyymmddhhmm / "yyyy"

hhmm            = 4DIGIT
mmddhhmm        = 8DIGIT
yyyymmddhhmm    = 12DIGIT
date8           = 8DIGIT

context-date    = "(start:" SP date8 ")"

description     = 1*(%x09 / %x20-7E / UTF8-non-ascii)

linebreak       = CRLF / LF
CRLF            = %x0D.0A
LF              = %x0A
SP              = %x20
DIGIT           = %x30-39
UTF8-non-ascii  = %x80-FF
```

### 5.2 Additional lexical constraints

ABNF alone is insufficient to express all TDML constraints. The following rules are normative:

1. The description MUST NOT be empty.
2. If a context-date suffix is present, it MUST appear only once and MUST appear at the end of the task line.
3. A timestamp token MUST be exactly 4, 8, or 12 decimal digits.
4. The end timestamp MAY be the literal `yyyy`, which represents an open or unresolved end instant.
5. Empty lines MAY appear anywhere in the document and MUST be ignored by canonical tree construction.
6. If the final substring of a line matches the context-date syntax, it MUST be interpreted as the context-date suffix rather than as part of the description.

### 5.3 Canonical regular expression

An implementation MAY use the following regex to recognize canonical task lines:

```js
/^(\s*)- \[([ xw])\]\s*(?:([0-9]{4}|[0-9]{8}|[0-9]{12}),([0-9]{4}|[0-9]{8}|[0-9]{12}|yyyy)\s+)?(.*?)(?:\s+\(start: ([0-9]{8})\))?$/
```

If the regex and this document ever disagree, this document takes precedence.

## 6. Status Semantics

TDML defines exactly three statuses:

| Marker | Meaning |
| --- | --- |
| ` ` | Pending |
| `w` | In progress |
| `x` | Done |

A conforming exporter MUST emit one of these three markers for every task.

## 7. Timestamp Semantics

### 7.1 Token shapes

| Shape | Meaning |
| --- | --- |
| `HHmm` | Local time on a known date |
| `MMDDHHmm` | Local month, day, and time in a known year |
| `YYYYMMDDHHmm` | Fully qualified local timestamp |
| `yyyy` | Open or unresolved end timestamp |

### 7.2 Context date

The context-date suffix stores a reference date in `YYYYMMDD` form.

Importers SHOULD use the context date to resolve shorthand timestamps.

Exporters SHOULD include a context date whenever a task emits `HHmm` or `MMDDHHmm`.

### 7.3 Resolution algorithm

Given `contextDateRaw = YYYYMMDD`:

1. `HHmm` MUST resolve against `YYYYMMDD`.
2. `MMDDHHmm` MUST resolve against the year `YYYY`.
3. `YYYYMMDDHHmm` MUST be used directly.
4. `yyyy` MUST remain unresolved and MUST NOT be converted into a concrete timestamp by canonical export.

For end timestamps:

1. `HHmm` SHOULD resolve against the resolved start date when a start date exists.
2. Otherwise `HHmm` SHOULD resolve against `contextDateRaw`.
3. `MMDDHHmm` SHOULD resolve against the resolved start year when available.
4. Otherwise `MMDDHHmm` SHOULD resolve against the year from `contextDateRaw`.

TDML does not define timezone offsets. Applications MAY attach local timezone meaning outside the wire format.

## 8. Tree Construction

Hierarchy is derived only from leading spaces.

For each parsed task line:

1. Let `indentLevel` be the count of leading spaces.
2. If the stack is empty, the task becomes a root node.
3. Otherwise pop the stack until the top entry has a smaller indentation value than `indentLevel`.
4. If no such entry remains, the task becomes a root node.
5. Otherwise the task becomes a child of the stack top.
6. Push the current task onto the stack.

Tasks with equal indentation are siblings.

Tasks with greater indentation become descendants of the nearest prior less-indented task.

## 9. Importer Conformance

A strict TDML importer:

- MUST reject any non-empty line that does not match the canonical grammar
- MUST report the line number of the failed parse

A tolerant TDML importer:

- MUST attempt canonical parsing first
- MAY preserve malformed lines as implementation-defined note nodes or fallback tasks
- SHOULD retain the original line content for recovery or editing

## 10. Exporter Conformance

A conforming canonical exporter:

1. MUST emit one task per non-empty line.
2. MUST emit `- [<status>]` at the start of every serialized task.
3. MUST emit the timestamp pair only when both `startTimeRaw` and `endTimeRaw` are present.
4. MUST emit a single ASCII space between syntactic segments.
5. MUST emit the context-date suffix only at the end of the line.
6. MUST preserve task order.
7. MUST serialize children immediately after their parent.

Canonical exporters SHOULD preserve the exact indentation width captured from the parsed task tree when that width is available.

## 11. Round-Trip Requirements

If a TDML document is parsed and then exported without semantic edits:

- status values MUST be preserved
- task order MUST be preserved
- parent-child relationships MUST be preserved
- raw timestamp tokens SHOULD be preserved
- context dates SHOULD be preserved

Exact byte-for-byte preservation is not required if the exporter normalizes whitespace into canonical form.

## 12. UI Conformance

A TDML management UI is conforming if it can:

- import canonical TDML text
- render parent-child structure from indentation
- edit status, description, timestamps, and context date
- add and remove tasks
- indent and outdent tasks while preserving tree semantics
- export canonical TDML text

## 13. Canonical Examples

```text
- [ ] main task 1 which is pending (start: 20251112)
- [w] 1330,yyyy main task 2 which is in progress worked start from 13:30pm (start: 20251112)
- [x] 1339,1423 main task 3 which is done start from 13:39pm and end at 14:23pm (start: 20251112)
- [x] 11121339,1450 main task 4 start from 2025-11-12 13:39pm and ended with same day 14:50pm (start: 20251112)
- [x] 11121339,11131450 main task 5 start from 2025-11-12 13:39pm and ended with 2025-11-13 14:50pm (start: 20251112)
```
