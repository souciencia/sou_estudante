---
name: coding-and-refactoring
description: Trigger this whenever you write, edit, or refactor code.
version: 1.0
---

Refactoring Guidelines:

1. Functional Core:
   - Prefer functional programming patterns.
   - Use pure functions (no side effects) whenever possible.
   - Enforce immutability (do not mutate function arguments or external state).
   - Keep functions small, composable, and single-purpose.

2. Code Quality & Readability:
   - Ensure low coupling and high cohesion.
   - Use self-explanatory naming for variables, parameters, and functions.
   - Pass dependencies explicitly; avoid hidden outer-scope states.
   - Replace magic numbers/strings with named, typed constants.

3. Modularization & File Splitting:
   - Separate code into multiple files only when a file addresses more than one domain responsibility.
   - Name files according to their core domain/responsibility (e.g., `user.service.ts`, `date.utils.ts`).
   - Clearly mark exported symbols vs. private internal helpers.

4. Use `tdd` skill. 

