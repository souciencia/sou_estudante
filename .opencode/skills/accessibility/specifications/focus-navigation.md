---
name: accessibility-for-focus-navigation
description: Guidance for accessible keyboard focus and navigation. Requires visible 3:1 contrast focus indicators, logical DOM/tab order, modal focus trapping, and skip-links. Never remove default outlines without an a11y-compliant replacement.
---

- Every interactive element (link, button, input, custom control) has a **visible focus indicator** with ≥ 3:1 contrast against its background, in both light and dark contexts.
- Never remove a focus outline (`outline: none`) without supplying a replacement that meets the 3:1 rule — this includes replacing default browser focus rings on custom components.
- Focus order follows visual/reading order (left-to-right, top-to-bottom for LTR content). If DOM order and visual order diverge (e.g. CSS grid reordering), fix the DOM order rather than relying on `tabindex` hacks.
- Modal dialogs and drawers **trap focus** while open and **return focus** to the triggering element on close.
- Skip-link to main content is present on every page with repeated navigation/header blocks.