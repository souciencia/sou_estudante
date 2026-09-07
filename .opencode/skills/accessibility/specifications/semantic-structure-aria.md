---
name: semantic-structure-aria
description: Use this when writing a UI compoment
---
- Use native HTML elements before reaching for ARIA: `<button>` not `<div role="button">`, `<nav>`, `<main>`, `<header>`, real form elements.
- One `<h1>` per page; heading levels never skip (no `<h2>` straight to `<h4>`).
- Each of the 5 module cards/sections has an accessible name (visible text, `aria-label`, or `aria-labelledby`) that includes the instrument name — not just an icon.
- Icon-only buttons (e.g. icon tiles that act as links/buttons) always carry an `aria-label` describing the action, not the icon shape.
- Decorative images/icons get `alt=""` or `aria-hidden="true"`; meaningful images get descriptive `alt` text.
- Dynamic content updates that matter to screen reader users (form errors, save confirmations, progress changes) use an `aria-live` region (`polite` for most cases, `assertive` only for errors that block progress).
