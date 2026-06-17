# TDML OKF Bundle

This directory is an Open Knowledge Format bundle for TDML. It uses markdown files with YAML frontmatter for concept documents, plus reserved `index.md` and `log.md` files for navigation and history.

# Concepts

* [TDML Project](concepts/tdml-project.md) - Overview of TDML as a plain-text todo list markup language.
* [TDML Knowledge Bundle](concepts/tdml-okf-bundle.md) - How this `docs/` directory applies OKF v0.1 conventions to TDML project knowledge.

# Syntax

* [Canonical Task Line](syntax/canonical-task-line.md) - The canonical serialized TDML task line shape.
* [Task Status Values](syntax/task-status-values.md) - The pending, in-progress, and done markers used by TDML.
* [Timestamp Shorthand](syntax/timestamp-shorthand.md) - Compact TDML timestamp tokens and context-date resolution.
* [Task Tree Hierarchy](syntax/task-tree-hierarchy.md) - How leading spaces define parent-child task structure.

# Implementation

* [Parser and Exporter Conformance](implementation/parser-exporter-conformance.md) - Import, export, and round-trip expectations for TDML implementations.
