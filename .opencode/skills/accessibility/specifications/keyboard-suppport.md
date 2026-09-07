---
name: accessibility-for-keyboard-support
description: Guidance for keyboard-support accessibility.
---

- Every action available via mouse/touch is available via keyboard — no hover-only menus, no click-only cards that lack a focusable/activatable element underneath.
- Standard key behavior: `Tab`/`Shift+Tab` moves focus, `Enter`/`Space` activates buttons, `Esc` closes modals/dropdowns, arrow keys navigate within composite widgets (tabs, radio groups, custom dropdowns) per the WAI-ARIA Authoring Practices pattern for that widget.
- Custom components (module cards, custom selects, accordions) get real `role`, `tabindex`, and keyboard handlers — don't ship a `<div onClick>` as an interactive control.