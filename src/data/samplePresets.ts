export interface CodePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  expectedComplexity: {
    time: string;
    space: string;
    cc: string;
  };
  code: string;
}

export const SAMPLE_PRESETS: CodePreset[] = [
  {
    id: 'bubble_sort',
    name: 'Bubble Sort (Quadratic O(n²))',
    category: 'Sorting Algorithms',
    description: 'Classic comparison sort with nested loops and dependent inner bounds.',
    expectedComplexity: {
      time: 'O(n^2)',
      space: 'O(1)',
      cc: '3'
    },
    code: `/*
 * Bubble Sort Implementation in C
 * Classic O(n^2) nested loop sorting algorithm.
 */
#include <stdio.h>
#include <stdbool.h>

void swap(int *xp, int *yp) {
    int temp = *xp;
    *xp = *yp;
    *yp = temp;
}

void bubble_sort(int arr[], int n) {
    // Outer loop traverses entire array
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        // Inner loop does pairwise comparisons with dependent bound (n - i - 1)
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(&arr[j], &arr[j + 1]);
                swapped = true;
            }
        }
        // Early termination optimization if no elements were swapped
        if (!swapped) {
            break;
        }
    }
}

int main() {
    int data[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(data) / sizeof(data[0]);
    bubble_sort(data, n);
    for (int i = 0; i < n; i++) {
        printf("%d ", data[i]);
    }
    printf("\\n");
    return 0;
}
`
  },
  {
    id: 'binary_search',
    name: 'Binary Search (Logarithmic O(log n))',
    category: 'Search Algorithms',
    description: 'Interval halving on a sorted array yielding logarithmic time complexity.',
    expectedComplexity: {
      time: 'O(log n)',
      space: 'O(1)',
      cc: '4'
    },
    code: `/*
 * Binary Search in C
 * Demonstrates logarithmic iteration O(log n) via interval halving.
 */
#include <stdio.h>

int binary_search(const int arr[], int n, int target) {
    int low = 0;
    int high = n - 1;

    // Iteratively halve the candidate search space
    while (low <= high) {
        int mid = low + (high - low) / 2;

        if (arr[mid] == target) {
            return mid; // Target found at index mid
        }
        if (arr[mid] < target) {
            low = mid + 1; // Discard left half
        } else {
            high = mid - 1; // Discard right half
        }
    }

    return -1; // Target element not present
}

int main() {
    int sorted[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int n = sizeof(sorted) / sizeof(sorted[0]);
    int target = 23;
    int index = binary_search(sorted, n, target);
    printf("Element %d found at index %d\\n", target, index);
    return 0;
}
`
  },
  {
    id: 'fibonacci_exponential',
    name: 'Recursive Fibonacci (Exponential O(2ⁿ))',
    category: 'Dynamic Programming & Recursion',
    description: 'Naive dual-branching recursion with exponential growth and O(n) stack memory.',
    expectedComplexity: {
      time: 'O(2^n)',
      space: 'O(n)',
      cc: '2'
    },
    code: `/*
 * Naive Recursive Fibonacci in C
 * Generates an exponential recursion tree O(2^n) without memoization.
 */
#include <stdio.h>

int fibonacci(int n) {
    // Base cases
    if (n <= 0) {
        return 0;
    }
    if (n == 1) {
        return 1;
    }
    // Dual recursive branch calls
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int n = 10;
    int result = fibonacci(n);
    printf("Fibonacci(%d) = %d\\n", n, result);
    return 0;
}
`
  },
  {
    id: 'matrix_mult',
    name: 'Matrix Multiplication & Dynamic Malloc (O(n³))',
    category: 'Linear Algebra & Memory',
    description: 'Triple-nested loop matrix multiplication with dynamic heap allocation and potential leak risk.',
    expectedComplexity: {
      time: 'O(n^3)',
      space: 'O(n)',
      cc: '4'
    },
    code: `/*
 * Matrix Multiplication with Dynamic Heap Allocation
 * Triple-nested loops O(n^3) and dynamic memory allocation.
 */
#include <stdio.h>
#include <stdlib.h>

int** allocate_matrix(int rows, int cols) {
    int **matrix = (int**)malloc(rows * sizeof(int*));
    for (int i = 0; i < rows; i++) {
        matrix[i] = (int*)malloc(cols * sizeof(int));
    }
    return matrix;
}

void multiply_matrices(int **A, int **B, int **C, int n) {
    // Triple nested loop traversal
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            C[i][j] = 0;
            for (int k = 0; k < n; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}

int main() {
    int n = 3;
    int **A = allocate_matrix(n, n);
    int **B = allocate_matrix(n, n);
    int **C = allocate_matrix(n, n);

    multiply_matrices(A, B, C, n);
    printf("Computed matrix multiplication of size %dx%d\\n", n, n);

    // Note: Deliberately missing free_matrix() to highlight static memory leak detection
    return 0;
}
`
  },
  {
    id: 'complex_branching',
    name: 'High Cyclomatic Complexity Kernel (M > 12)',
    category: 'Control Flow & Logic',
    description: 'Complex nested conditional branches, boolean operators, and switch statements.',
    expectedComplexity: {
      time: 'O(1)',
      space: 'O(1)',
      cc: '13'
    },
    code: `/*
 * Protocol Packet Validator
 * Demonstrates high McCabe Cyclomatic Complexity with complex boolean conditions.
 */
#include <stdio.h>
#include <stdbool.h>

int validate_packet(int type, int length, int checksum, int flags, int priority) {
    int status = 0;

    // Complex compound condition with short-circuit operators
    if ((type >= 1 && type <= 5) && (length > 0 || flags == 0x01)) {
        if (checksum == 0 && flags != 0xFF) {
            status = 1;
        } else if (flags == 0x02 || flags == 0x04) {
            status = 2;
        }
    } else if (type == 10 || type == 20) {
        status = 3;
    } else {
        return -1;
    }

    // Switch case branching
    switch (priority) {
        case 0:
            status += 10;
            break;
        case 1:
            status += 20;
            break;
        case 2:
            status += 30;
            break;
        case 3:
            status += 40;
            break;
        // Notice: missing default case triggers quality finding
    }

    // Ternary expression contribution
    int penalty = (flags & 0x10) ? 5 : 0;
    return status - penalty;
}
`
  }
];
