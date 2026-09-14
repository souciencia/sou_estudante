# Development Guidelines:

## Principles

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

4. Test-Driven Developemnt:
  - Tests verify behavior through public interfaces, not implementation details. 
  - Code can change entirely; tests shouldn't.
  - A good test reads like a specification: "user can checkout with valid cart" tells you exactly what capability exists, and it survives refactors because it doesn't care about internal structure.
  - For testing guidelines, see [tdd-specs/tests.md](tdd-specs/tests.md)
  - Refactoring is part of process of turning red to green.
  - For mocking guidelines, see [tdd-specs/mocking.md](tdd-specs/mocking.md)
  - Use the **red → green loop structure**. 
  - After every step, confirm with user if you can do the next step.


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


