---
name: accessibility-for-forms
description: Guidance for form accessibility. Requires programmatically linked labels, clear validation errors announced via aria-live/aria-describedby, visible required fields, and icons/text alongside colors to convey error states.
---
- Every input has a programmatically associated `<label>` (not just placeholder text).
- Required fields are marked in both the visual UI and via `aria-required`/`required`.
- Validation errors are: announced to screen readers (`aria-live` or `aria-describedby` pointing to the error text), shown next to the relevant field, and not conveyed by color alone (add an icon + text).
- Placeholder text never substitutes for a label, and never carries essential instructions that disappear on focus.