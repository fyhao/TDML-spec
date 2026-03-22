# TDML

TDML stands for TodoList Markup Language. It is a plain-text, line-oriented format for storing nested todo lists with task status, optional start/end timestamps, and a context date that helps resolve shorthand timestamps.

This folder contains:

- `README.md`: quick overview and canonical examples
- `SPEC.md`: detailed syntax, import/export, and UI behavior
- `examples/sample.tdml`: sample TDML document
- `reference/tdml.ts`: reference TypeScript parser/stringifier based on the sample parser

The parser-oriented form is the canonical serialized TDML format. If users author shorthand examples in prose, exporters should normalize them into canonical task lines before saving.

## Goals

- Keep todo data easy to read and diff in plain text
- Support nested tasks through indentation
- Track pending, in-progress, and done states
- Store compact timestamps without forcing full ISO datetimes on every line
- Round-trip cleanly between text and UI

## Canonical Line Format

```text
<indent>- [<status>] [<startRaw>,<endRaw> ]<description>[ (start: <YYYYMMDD>)]
```

Rules:

- `<indent>` is zero or more leading spaces
- `<status>` is one of:
  - ` ` for pending
  - `w` for in progress
  - `x` for done
- `<startRaw>,<endRaw>` is optional
- `<description>` is required
- `(start: YYYYMMDD)` is optional but recommended whenever shorthand times are used

## Canonical Example

```text
- [ ] main task 1 which is pending (start: 20251112)
- [w] 1330,yyyy main task 2 which is in progress worked start from 13:30pm (start: 20251112)
- [x] 1339,1423 main task 3 which is done start from 13:39pm and end at 14:23pm (start: 20251112)
- [x] 11121339,1450 main task 4 start from 2025-11-12 13:39pm and ended with same day 14:50pm (start: 20251112)
- [x] 11121339,11131450 main task 5 start from 2025-11-12 13:39pm and ended with 2025-11-13 14:50pm (start: 20251112)

- [ ] main task 6 (start: 20251112)
  - [w] 0930,yyyy sub task 6.1 start from 2025-11-13 09:30am (start: 20251113)
  - [w] 11140930,yyyy sub task 6.2 start from 2025-11-14 09:30am (start: 20251113)
```

## Timestamp Shorthand

- `1330` means `HHmm`
- `11121339` means `MMDDHHmm`
- `202511121339` means `YYYYMMDDHHmm`
- `yyyy` means the end time is still open

Resolution defaults:

- `HHmm` resolves against the task context date
- `MMDDHHmm` resolves against the context year
- `YYYYMMDDHHmm` is already absolute
- `yyyy` has no concrete end timestamp

## UI Expectations

A TDML UI should:

- render indentation as parent/child tasks
- allow toggling status between pending, in progress, and done
- show compact raw timestamps and a human-readable resolved time
- allow create, edit, delete, indent, and outdent operations
- import TDML text and export canonical TDML text
- preserve indentation and structured fields during round-trip whenever possible

See `SPEC.md` for the full definition.
