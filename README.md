# C Code Intelligence Analyzer — AI-Powered Complexity Analysis and Refactoring Assistant

A comprehensive, explainable software engineering platform for analyzing C source code using a deterministic static-analysis engine and Google Gemini AI.

---

## 1. Key Highlights

- **Strict Boundary Distinction:**
  - **Deterministic Static Analysis Engine:** Calculates all metrics (LOC, Cyclomatic Complexity, Halstead, Maintainability Index, Big-O Time & Space) using AST parsing, graph algorithms, and formal mathematical formulas. Gemini never fabricates numeric metrics.
  - **Gemini AI:** Provides contextual code reviews, architectural explanations, answers questions grounded in verified static metrics, and proposes refactoring.
- **Explainable Calculations:** Every metric features an expandable derivation view with raw inputs, formula definitions, step-by-step intermediate calculations, and clickable source-line evidence.
- **Deep Big-O Time & Space Engine:** Analyzes loops, nested loops with independent or dependent bounds, logarithmic halving/doubling, linear and divide-and-conquer recurrences, Master Theorem classification, recursion stack frames, and heap allocation tracking (`malloc`/`calloc`/`free`).
- **Interactive Visualizations:**
  - Control Flow Graph (CFG) diagram with nodes, branches, joins, and decision points.
  - Asymptotic operation growth chart comparing $O(1), O(\log n), O(n), O(n \log n), O(n^2)$ and plotting the code's curve for $n = 1 \dots 128$.
  - Circular maintainability gauge with industry benchmarks.
  - Line-by-line attribution explorer and searchable Halstead operator/operand frequency tables.
- **AI Refactoring & Before/After Comparison:**
  - Reviewable diff between original and proposed code.
  - Delta metric table ($\Delta$ LOC, $\Delta$ CC, $\Delta$ MI, $\Delta$ Time, $\Delta$ Space, $\Delta$ Findings).
  - One-click "Accept & Apply Refactoring" with instant recalculation.
- **Exportable Reports:** Print-ready / PDF-ready HTML report, structured JSON artifact, and C source code export.

---

## 2. Mathematical Formulas and Conventions

### A. Lines of Code (LOC)
- **Physical Lines:** Total newline-delimited lines in the file.
- **Blank Lines:** Lines consisting exclusively of whitespace characters.
- **Comment-Only Lines:** Lines containing solely single-line (`//`) or multiline (`/* ... */`) comments.
- **Code-Only Lines:** Lines containing executable C tokens or preprocessor directives without inline comments.
- **Code-Plus-Comment Lines:** Lines containing both executable code and comments.
- **Non-Empty Lines:** Code-Only + Comment-Only + Code-Plus-Comment.
- **Strict Partition Principle:** Code-Only + Comment-Only + Code-Plus-Comment + Blank = Physical Lines (100% sum).

### B. Cyclomatic Complexity (McCabe, 1976)
- **CFG Formula:** $M = E - N + 2P$
  - $E$: Number of edges in the control flow graph.
  - $N$: Number of nodes (basic blocks).
  - $P$: Connected components ($P = 1$ for a single function).
- **Decision Predicate Method:** $M = \pi + 1$
  - $\pi$: Count of decision points (`if`, `for`, `while`, `do-while`, `case`, `&&`, `||`, `? :`).
  - Planar flow graph equivalence: $E - N + 2 = \pi + 1$.

### C. Halstead Software Science (Halstead, 1977)
- $n_1$: Distinct operators (keywords, arithmetic/logical/relational operators, delimiters).
- $n_2$: Distinct operands (identifiers, variables, numeric/string literals).
- $N_1$: Total operator tokens.
- $N_2$: Total operand tokens.
- **Vocabulary:** $n = n_1 + n_2$
- **Length:** $N = N_1 + N_2$
- **Volume:** $V = N \times \log_2(n)$ (bits)
- **Difficulty:** $D = (n_1 / 2) \times (N_2 / n_2)$
- **Effort:** $E = D \times V$ (elementary mental discriminations)
- **Time:** $T = E / 18$ seconds (Halstead Stroud frequency $S = 18$/sec)
- **Bugs:** $B = V / 3000$ (estimated delivered faults)

### D. Maintainability Index (MI)
- **Canonical SEI / Coleman & Oman (1992) Formula:**
  $$MI_{\text{raw}} = 171 - 5.2 \times \ln(V) - 0.23 \times G - 16.2 \times \ln(LOC) + 50 \times \sin(\sqrt{2.4 \times perCM})$$
- **Normalized (0–100 scale):**
  $$MI_{\text{norm}} = \max(0, \min(100, MI_{\text{raw}} \times 100 / 171))$$
- **Interpretation:**
  - $85 - 100$: High Maintainability (Green)
  - $65 - 84$: Moderate Maintainability (Yellow)
  - $0 - 64$: Low Maintainability / High Technical Debt (Red)

### E. Algorithmic Big-O Time Complexity
- **Sequential Statements:** $O(1)$
- **Independent Nested Loops:** $\prod_{i=1}^k n_i \implies O(n^k)$
- **Dependent Bounds:** e.g. $\sum_{i=0}^{n-1} (n - i) = \frac{n(n+1)}{2} = \frac{1}{2}n^2 + \frac{1}{2}n \implies O(n^2)$
- **Logarithmic Loops:** Halving/doubling step (`i *= 2`, `i /= 2`, `mid = (low + high) / 2`) $\implies O(\log n)$
- **Linear Recursion:** $T(n) = T(n-1) + O(1) \implies O(n)$
- **Divide-and-Conquer:** $T(n) = 2T(n/2) + O(n) \implies O(n \log n)$ (Master Theorem)
- **Branching Recursion:** $T(n) = T(n-1) + T(n-2) + O(1) \implies O(2^n)$ (Exponential)

### F. Space Complexity
- **Input Storage:** Caller-allocated arguments passed by reference or value.
- **Auxiliary Space:** Extra memory allocated outside input buffers.
- **Call Stack Depth:** Activation frame chain ($O(1)$ iterative, $O(\log n)$ divide-and-conquer, $O(n)$ linear recursion).
- **Heap Allocations:** Dynamic memory sites (`malloc`, `calloc`) and leak detection for missing `free()`.

---

## 3. Technology Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide icons.
- **Backend:** Node.js 22, Express, TypeScript (`tsx`).
- **AI Integration:** `@google/genai` TypeScript SDK (server-side only, `gemini-3.8-flash`).
- **Parsing:** Custom C99/C11 Lexer & AST-capable recursive parser with line/column tracking.
- **Testing:** Native Node.js test runner (`node:test`, `node:assert/strict`).

---

## 4. Setup and Run Instructions

### Prerequisites
- Node.js >= 20 (Node 22 recommended)
- npm >= 9

### Installation
```bash
npm install
```

### Environment Configuration
Configure your Gemini API key in `.env`:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```
*(In Google AI Studio Build, the API key is injected automatically via the Secrets panel).*

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Automated Unit Tests
```bash
npm test
```
Or directly via Node 22:
```bash
node --experimental-strip-types --test src/tests/analyzer.test.ts
```

### Build for Production
```bash
npm run build
```

---

## 5. Assumptions and Known Limitations

1. **Static Analysis Bounds:** Static complexity analysis cannot solve the general Halting Problem. Loops with runtime-dependent convergence (e.g. pointer traversal `while (ptr != NULL)`) are modeled with linear upper bounds.
2. **External Libraries:** External standard library calls (e.g. `printf`, `qsort`) are evaluated with standard Big-O profiles.
3. **Safe Execution Boundary:** The platform executes static AST parsing and metric evaluation exclusively; submitted C code is never executed directly on the host server.
