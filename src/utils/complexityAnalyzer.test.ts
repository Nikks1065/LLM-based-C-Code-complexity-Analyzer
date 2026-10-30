/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeFileComplexity, detectLanguage } from './complexityAnalyzer';

test('detectLanguage detects file types accurately', () => {
  assert.equal(detectLanguage('src/index.ts'), 'typescript');
  assert.equal(detectLanguage('src/components/App.tsx'), 'typescript');
  assert.equal(detectLanguage('server/app.py'), 'python');
  assert.equal(detectLanguage('core/main.cpp'), 'cpp');
  assert.equal(detectLanguage('api/handler.go'), 'go');
  assert.equal(detectLanguage('config.json'), 'json');
});

test('analyzeFileComplexity calculates correct LOC and Cyclomatic Complexity for simple code', () => {
  const code = `
    // Sample function
    function calculate(x: number, y: number): number {
      if (x > y) {
        return x * 2;
      } else if (x === y) {
        return x;
      }
      return y;
    }
  `;

  const result = analyzeFileComplexity('calc.ts', code);
  assert.ok(result.loc > 5, 'loc should be calculated');
  assert.ok(result.cloc >= 1, 'comment line should be counted');
  assert.ok(result.cyclomaticComplexity >= 3, 'if + else if adds decision points');
  assert.equal(result.functions.length, 1);
  assert.equal(result.functions[0].name, 'calculate');
  assert.equal(result.functions[0].paramsCount, 2);
  assert.ok(result.maintainabilityIndex > 50, 'Maintainability index should be positive');
});

test('nested loops correctly identify O(N^2) time complexity', () => {
  const code = `
    function bubbleSort(arr: number[]) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          if (arr[i] < arr[j]) {
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
          }
        }
      }
    }
  `;

  const result = analyzeFileComplexity('sort.ts', code);
  assert.equal(result.functions[0].timeComplexityEstimate, 'O(N^2)');
});

test('constant time function returns O(1)', () => {
  const code = `
    function getFirstElement(list: string[]) {
      return list[0];
    }
  `;

  const result = analyzeFileComplexity('access.ts', code);
  assert.equal(result.functions[0].timeComplexityEstimate, 'O(1)');
});
