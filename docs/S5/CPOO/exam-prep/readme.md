---
title: "CPOO Exam Preparation"
sidebar_position: 0
---

# CPOO Exam Preparation

## Exam Format

- **Duration**: 2 hours (2h40 for students with extra time)
- **Materials allowed**: printed course notes and handwritten notes
- **Format**: written on paper, answers written directly on the exam sheet
- **Length**: typically 6 pages, 3-5 exercises
- **Points**: ~20 points total across exercises

**Critical rule**: any crossed-out text or illegible writing results in a penalty. Use your draft paper first, then copy your clean answer onto the exam sheet.

## Exam Structure (Based on 5 Years of Past Exams)

Every CPOO exam from 2019 to 2025 follows the same three-pillar structure:

| Pillar | Weight | Topics |
|--------|--------|--------|
| **Unit Testing** | ~5-8 pts | Write test classes, fix assertions, mocking, coverage, control flow |
| **UML Diagrams** | ~5-8 pts | Class diagrams from text, use case diagrams, sequence diagrams |
| **OOP Theory / QCM** | ~3-5 pts | Multiple choice, short answer on OOP concepts |

---

## Detailed Exam Analysis

### [Exam Walkthroughs by Year](/S5/CPOO/exam-prep/exam-walkthroughs)

Step-by-step solutions for questions from all available past exams.

### [Question Bank by Type](/S5/CPOO/exam-prep/question-bank)

All exam questions organized by topic for focused revision.

---

## Exam Strategy

### Time Management (2 hours)

| Phase | Time | Activity |
|-------|------|----------|
| Read | 10 min | Read the entire exam, identify easy wins |
| Testing exercise | 40-50 min | Write test class, fix assertions |
| UML exercise | 40-50 min | Draw diagrams carefully |
| Theory/QCM | 10-15 min | Answer multiple choice, short answer |
| Review | 5-10 min | Check all answers, verify diagrams |

### Priority Order

1. **Testing exercises**: these are the most mechanical and score well if you know the patterns.
2. **UML class diagrams**: systematic approach (nouns=classes, verbs=methods, relationships).
3. **Theory QCM**: often straightforward if you know the definitions.
4. **Control flow / equivalence classes**: requires careful analysis, save for last if time-constrained.

### What to Bring

- Printed course slides (especially UML notation reference and JUnit/Mockito cheat sheets)
- Handwritten notes with example test classes
- This study guide (printed)

---

## Key Patterns That Repeat Every Year

### 1. "Write a test class for this code" (Every single year)

You are given a Java class and an interface. The interface has no implementation, so you must mock it. Expected pattern:

```java
@ExtendWith(MockitoExtension.class)
public class TestX {
    X x;
    MockedInterface mock;

    @BeforeEach
    void setUp() throws Exception {
        mock = Mockito.mock(MockedInterface.class);
        Mockito.when(mock.method()).thenReturn(value);
        x = new X(mock);
    }

    @Test void testNormalCase() { ... }
    @Test void testNullInput() {
        assertThrows(IllegalArgumentException.class, () -> new X(null));
    }
    @Test void testExceptionPath() { ... }
}
```

### 2. "Fix these assertions" (Most years)

Common fixes:
- `assertTrue(a.equals(b))` becomes `assertEquals(a, b)`
- `assertFalse(!a.foo())` becomes `assertTrue(a.foo())`
- `assertTrue(a == b)` becomes `assertSame(a, b)`
- try/catch with `fail()` becomes `assertThrows()`
- `if (x != 10) fail()` becomes `assertEquals(10, x)`
- Duplicate `new C()` in each test becomes `@BeforeEach`

### 3. "Draw a UML class diagram from this text" (Every single year)

Systematic approach:
1. Underline all nouns (classes/attributes)
2. Underline all verbs (methods)
3. Identify "is-a" = inheritance
4. Identify "has" / "contains" = association/aggregation/composition
5. Identify multiplicity from text ("one," "several," "at least one")
6. Identify enumerations ("is either X, Y, or Z")
7. Draw boxes, connect with lines, add multiplicities

### 4. "Control flow graph / truth table / equivalence classes" (Most years)

- Draw nodes for each statement/branch
- Draw edges for control flow
- For `||` (short-circuit): left true means right is NOT evaluated
- For `&&` (short-circuit): left false means right is NOT evaluated
- Equivalence classes: group inputs that produce the same behavior
- Boundary values: test at the edges of each class

### 5. "What is the maximum coverage achievable?" (2021-2022)

Check for dead code:
- Exceptions declared but never thrown
- Branches that can never be reached due to short-circuit evaluation
- Private methods that transform state (e.g., `doSomething()` sets `str = "yolo"` which means the `str == null` branch in the subsequent `if` is dead)

---

## Quick Reference: Exam Vocabulary

| French (exam) | English | Meaning |
|---------------|---------|---------|
| couverture de lignes | line coverage | % of source lines executed |
| couverture de branches | branch coverage | % of if/else paths taken |
| couverture de conditions | condition coverage | each sub-expression true and false |
| graphe de flot de controle | control flow graph | nodes=statements, edges=control flow |
| classes d'equivalence | equivalence classes | input partitions with same behavior |
| diagramme de classes | class diagram | UML class relationships |
| diagramme de cas d'utilisation | use case diagram | actors and use cases |
| diagramme de sequence | sequence diagram | method call ordering |
| heritage | inheritance | extends |
| polymorphisme | polymorphism | dynamic dispatch |
| encapsulation | encapsulation | private fields + public methods |
| intégrité référentielle | referential integrity | both sides of bidirectional link consistent |
