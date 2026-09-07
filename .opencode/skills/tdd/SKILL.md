---
name: tdd
description: Test-driven-developemnt. Trigger this whenever you write, edit, or refactor code.
version: 1.0
---

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification: "user can checkout with valid cart" tells you exactly what capability exists, and it survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines. Use the **red → green loop structure**. Refactoring is part of process of turning red to green.

## Red → Green loop Structure
1. **Red Step:**
  - Write a failing test
  - Write the basic, empty structure of the component
  - Only for visual components: Write the component's story (or storybook entry)
2. **Refactor Step:** 
  - Improve the test
  - Refactor the component to meet its objective and pass the test
  - Only for visual components: Update the storybook as needed
3. **Green Step:** (The component is ready and passing the test)
  - Commit your changes with a one-line message

After every step, confirm with user if you can do the next step.