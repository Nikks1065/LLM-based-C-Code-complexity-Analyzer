import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCCode } from '../analyzer/index.ts';
import { analyzeLOC } from '../analyzer/locAnalyzer.ts';
import { tokenizeC } from '../analyzer/cLexer.ts';
import { analyzeHalstead } from '../analyzer/halsteadAnalyzer.ts';
import { analyzeMaintainability } from '../analyzer/maintainabilityAnalyzer.ts';
import { compareRefactoredCode } from '../analyzer/diffHelper.ts';

test('1. Empty input handling', () => {
  const result = analyzeCCode('');
  assert.equal(result.programLOC.totalPhysical, 1);
  assert.equal(result.programLOC.blank, 1);
  assert.equal(result.functions.length, 0);
  assert.equal(result.programCyclomatic.maxComplexity, 1);
  assert.equal(result.programHalstead.distinctOperators, 0);
  assert.equal(result.programHalstead.volume, 0);
  assert.equal(result.programMaintainability.normalizedScore >= 0, true);
});

test('2. Comments and strings containing operator-like characters', () => {
  const code = `
#include <stdio.h>
int main() {
    // This is a comment with == and != and /* tricky */
    /* Multiline comment
       with for (int i = 0; i < 10; i++)
    */
    char* str = "String with for (;;) and if (x > y) /* not comment */";
    printf("%s\\n", str);
    return 0;
}
`;
  const result = analyzeCCode(code);
  const mainFn = result.functions.find(f => f.name === 'main');
  assert.ok(mainFn, 'main function should be identified');
  // The operators inside the comment and inside the string must NOT be counted as control decisions!
  assert.equal(mainFn?.cyclomatic.score, 1, 'Decision count should be 1 (only linear flow, no real if/for)');
});

test('3. LOC partitioning: blank, comment, code, code-plus-comment', () => {
  const code = `// Header comment
int x = 10; /* inline comment */
int y = 20;

/* Block comment */
`;
  const loc = analyzeLOC(code);
  assert.equal(loc.commentOnly, 2, 'Should have 2 comment-only lines');
  assert.equal(loc.codeOnly, 1, 'Should have 1 code-only line');
  assert.equal(loc.codeAndComment, 1, 'Should have 1 code-plus-comment line');
  assert.equal(loc.blank, 2, 'Should have 2 blank lines (including trailing)');
  assert.equal(loc.totalPhysical, loc.commentOnly + loc.codeOnly + loc.codeAndComment + loc.blank);
});

test('4. Conditional branches and short-circuit boolean operators', () => {
  const code = `
int check(int a, int b, int c) {
    if (a > 0 && b < 10 || c == 5) {
        return 1;
    }
    return 0;
}
`;
  const result = analyzeCCode(code);
  const fn = result.functions.find(f => f.name === 'check');
  assert.ok(fn);
  // if (+1), && (+1), || (+1) => total CC = 1 + 3 = 4
  assert.equal(fn?.cyclomatic.score, 4);
});

test('5. Ternary expressions and Switch statements', () => {
  const code = `
int evaluate(int val) {
    int x = (val > 0) ? 10 : 20; // ternary +1
    switch (val) {
        case 1: return 1;        // case 1 +1
        case 2: return 2;        // case 2 +1
        default: return 0;       // default not counted
    }
}
`;
  const result = analyzeCCode(code);
  const fn = result.functions.find(f => f.name === 'evaluate');
  assert.ok(fn);
  // ternary (+1), case 1 (+1), case 2 (+1) => CC = 1 + 3 = 4
  assert.equal(fn?.cyclomatic.score, 4);
});

test('6. Nested loops and quadratic complexity O(n^2)', () => {
  const code = `
void bubble_sort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}
`;
  const result = analyzeCCode(code);
  const fn = result.functions.find(f => f.name === 'bubble_sort');
  assert.ok(fn);
  assert.equal(fn?.timeComplexity.asymptoticNotation, 'O(n^2)');
  assert.equal(fn?.spaceComplexity.asymptoticNotation, 'O(1)');
});

test('7. Logarithmic loop complexity O(log n)', () => {
  const code = `
int binary_search(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
`;
  const result = analyzeCCode(code);
  const fn = result.functions.find(f => f.name === 'binary_search');
  assert.ok(fn);
  assert.equal(fn?.timeComplexity.asymptoticNotation, 'O(log n)');
  assert.equal(fn?.spaceComplexity.asymptoticNotation, 'O(1)');
});

test('8. Branching recursion: Exponential Time O(2^n)', () => {
  const code = `
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
`;
  const result = analyzeCCode(code);
  const fn = result.functions.find(f => f.name === 'fibonacci');
  assert.ok(fn);
  assert.equal(fn?.timeComplexity.isRecursive, true);
  assert.equal(fn?.timeComplexity.asymptoticNotation, 'O(2^n)');
  assert.equal(fn?.spaceComplexity.auxiliarySpace, 'O(n)'); // stack memory
});

test('9. Dynamic memory allocation and leak detection', () => {
  const code = `
#include <stdlib.h>
void leak_memory(int n) {
    int *buffer = (int*)malloc(n * sizeof(int));
    // missing free(buffer)
}
`;
  const result = analyzeCCode(code);
  const fn = result.functions.find(f => f.name === 'leak_memory');
  assert.ok(fn);
  assert.equal(fn?.spaceComplexity.allocations.filter(a => a.type === 'malloc').length, 1);
  assert.equal(fn?.spaceComplexity.potentialLeaks.length, 1);
  assert.equal(result.findings.some(f => f.category === 'Memory Safety'), true);
});

test('10. Halstead metrics and zero denominator edge cases', () => {
  const halstead = analyzeHalstead([]);
  assert.equal(halstead.programVocabulary, 0);
  assert.equal(halstead.volume, 0);
  assert.equal(halstead.difficulty, 0);
  assert.equal(halstead.effort, 0);
  assert.equal(halstead.estimatedBugs, 0);
});

test('11. Maintainability index range bounds (0 - 100)', () => {
  // Extreme values check
  const mi1 = analyzeMaintainability(100000, 50, 1000, 0);
  assert.ok(mi1.normalizedScore >= 0 && mi1.normalizedScore <= 100);
  assert.equal(mi1.category, 'Low Maintainability');

  const mi2 = analyzeMaintainability(10, 1, 5, 20);
  assert.ok(mi2.normalizedScore >= 80);
  assert.equal(mi2.category, 'High Maintainability');
});

test('12. Before/After Refactoring comparison deltas', () => {
  const original = `
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
`;
  const refactored = `
int fib(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1, c;
    for (int i = 2; i <= n; i++) {
        c = a + b;
        a = b;
        b = c;
    }
    return b;
}
`;
  const comp = compareRefactoredCode(original, refactored);
  assert.equal(comp.originalAnalysis.programTimeComplexity.overallBigO, 'O(2^n)');
  assert.equal(comp.refactoredAnalysis.programTimeComplexity.overallBigO, 'O(n)');
  const timeDelta = comp.deltas.find(d => d.metric === 'Time Complexity');
  assert.equal(timeDelta?.improved, true);
});
