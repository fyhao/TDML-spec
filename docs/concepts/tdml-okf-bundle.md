---
type: Knowledge Bundle
title: TDML OKF Bundle
description: The docs directory is an OKF-style markdown knowledge bundle for TDML concepts and implementation rules.
resource: .
tags: [okf, tdml, docs, knowledge]
timestamp: "2026-06-17T00:00:00+08:00"
---

# Purpose

This `docs/` directory applies Open Knowledge Format conventions to TDML project knowledge. OKF v0.1 represents knowledge as a directory of markdown files with YAML frontmatter, where each non-reserved markdown file is a concept document.

For TDML, the bundle captures stable project concepts that agents, maintainers, and documentation tools may need to read without custom integration code:

| Area | Concept documents |
| --- | --- |
| project context | [TDML Project](/concepts/tdml-project.md) |
| format syntax | [Canonical Task Line](/syntax/canonical-task-line.md), [Task Status Values](/syntax/task-status-values.md), [Timestamp Shorthand](/syntax/timestamp-shorthand.md) |
| document semantics | [Task Tree Hierarchy](/syntax/task-tree-hierarchy.md) |
| implementation | [Parser and Exporter Conformance](/implementation/parser-exporter-conformance.md) |

# OKF Conventions Used

This bundle follows the OKF v0.1 shape described by Google Cloud:

* `index.md` files provide progressive-disclosure navigation.
* `log.md` records chronological changes.
* Concept documents include YAML frontmatter with at least `type`.
* Recommended frontmatter fields include `title`, `description`, `resource`, `tags`, and `timestamp`.
* Cross-links use normal markdown links and form an untyped directed graph between concepts.

# Conformance Notes

Every non-reserved `.md` file in this bundle has parseable YAML frontmatter and a non-empty `type` field. Reserved files are limited to this root `index.md` and `log.md`.

The bundle intentionally links back to the root TDML specifications instead of duplicating all normative language. The OKF documents are an agent-friendly knowledge layer over the canonical source files.

# Citations

[1] [Google Cloud: Introducing the Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing)
[2] [Open Knowledge Format v0.1 draft specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
