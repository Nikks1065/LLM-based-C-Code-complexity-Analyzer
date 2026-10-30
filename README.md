# RepoMind – AI-Powered GitHub Repository Analyzer

> **"Understand. Explore. Analyze. Build."**

RepoMind is a developer intelligence platform that transforms raw GitHub repositories into deeply analyzed, interactive, and grounded knowledge systems. Built as a comprehensive production-grade upgrade of the **GenAI-Based Code Complexity Analyzer**, RepoMind integrates deterministic static AST complexity calculation with vector-indexed Retrieval-Augmented Generation (RAG) powered by Google Gemini.

---

## 🌟 Key Highlights & Transformation

RepoMind preserves and significantly enhances the intellectual property of the original Code Complexity Analyzer while expanding into complete repository intelligence:

1. **Static AST Complexity & Algorithmic Heuristics**:
   - **Lines of Code (LOC)**, SLOC (Source Lines), CLOC (Comment Lines), and Blank Lines.
   - **Cyclomatic Complexity ($V(G) = 1 + \text{decisions}$)**: Real branch inspection across control flow (`if`, `else if`, `for`, `while`, `case`, `catch`, `except`, `do`, `&&`, `||`, `??`, ternary `?:`).
   - **Function-Level Complexity**: Isolates each function's line boundaries, parameter counts, cognitive complexity, and algorithmic bottlenecks.
   - **SEI Maintainability Index**: Normalized 0–100 score derived from Halstead Volume ($V$), Cyclomatic Complexity ($CC$), and Lines of Code ($LOC$).
   - **Static Big-O Time & Space Bounds**: AST loop nesting depth analysis ($O(1)$, $O(\log N)$, $O(N)$, $O(N \log N)$, $O(N^2)$, $O(N^3)$, $O(2^N)$) with recursion and dynamic allocation profiling.
   - **Code Smell Detector**: Flags deep nesting (>3 levels), God functions (>50 LOC), high cyclomatic risk (>10), parameter bloat, and empty error handlers.
   - **Methodology Transparency**: Clearly delineates parser-calculated metrics from heuristic bounds and AI recommendations.

2. **Grounded RAG Repository Chat**:
   - Conversational AI powered by **Gemini 3.8 Flash (`gemini-3.8-flash`)**.
   - Code-aware structural chunking with BM25 inverted index and vector similarity.
   - Strict untrusted data isolation to prevent prompt injection from repository contents.
   - Every answer cites exact file paths and line ranges with interactive jump-to-source capabilities.

3. **Repository Architecture & Dependency Map**:
   - Automatically segments frontend UI, backend services, API routes, database schemas, and configuration layers.
   - Visual topology map showing data flow and inter-module relationships.

4. **Intelligent Code Review & Bug Hunter**:
   - Scans for security concerns, concurrency pitfalls, unhandled null states, and error suppression.
   - Categorized findings with severity badges (Critical, High, Medium, Low), code snippets, and actionable remediation steps.

5. **Dependency Audit**:
   - Analyzes `package.json`, `requirements.txt`, and dependencies manifests.
   - Classifies libraries into Framework, UI, Database, Security, Testing, Tooling, and Utility categories.

6. **Automatic Documentation Generator**:
   - Synthesizes grounded Markdown documentation: `README.md`, `ARCHITECTURE.md`, `API_SPEC.md`, and `TECH_STACK.md`.
   - Live dual-mode preview (Rendered Markdown and Raw Source) with one-click `.md` download.

7. **10-Step Developer Onboarding Guide**:
   - Structured ramp-up path for engineers joining the codebase: mission, stack, folder structure, entry points, execution flow, top 5 files to read first, and interactive completion checklist.

8. **Git Push & Branch Management**:
   - Built-in terminal guide to stage, commit, and push updates to `feature/repomind-transformation` without overwriting the default branch.

---

## 🏗️ Architecture Overview

```text
GitHub Repository (URL / Token)
       │
       ▼
GitHub Fetcher & Filter (Sensible Size & Binary Exclusions)
       │
       ├─────────────────────────────────┬─────────────────────────────────┐
       ▼                                 ▼                                 ▼
Deterministic AST Engine          RAG Ingestion Pipeline          Architecture Mapper
 • Cyclomatic Complexity (V(G))    • Code-aware Chunking           • Client / Server Split
 • Halstead Volume & SEI MI        • Inverted Index & BM25         • API Gateways & Models
 • Big-O Time & Space Bounds       • Grounded Prompt Formulation   • Dependency Extraction
 • Code Smell Inspector                      │                               │
       │                                     ▼                               │
       │                         Gemini 3.8 Flash (Server-Side)              │
       │                                     │                               │
       └─────────────────────────────────────┼───────────────────────────────┘
                                             ▼
                             RepoMind Unified Web Platform
                      (Dashboard, Code Explorer, Chat, Quality)
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js, Express, tsx.
- **AI & Grounding**: Google GenAI SDK (`@google/genai`), Gemini 3.8 Flash (`gemini-3.8-flash`), BM25 + Vector Retrieval Engine.
- **Testing**: Node's built-in test runner (`node:test`, `node:assert/strict`) via `npx --yes tsx --test`.

---

## 🚀 Quickstart & Local Execution

### 1. Prerequisites
- Node.js (v18+)
- (Optional) `GEMINI_API_KEY` for live AI generation. If not configured, RepoMind seamlessly provides deterministic grounded analysis.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/nikhilnitt/code-complexity-analyzer.git
cd code-complexity-analyzer

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 4. Running the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`, serving both the Express backend API and the Vite React frontend.

### 5. Running Automated Unit Tests
```bash
npm run test
```
Runs the static complexity analyzer test suite and RAG retrieval test suite.

---

## 📦 Pushing Upgrades to GitHub

To push the RepoMind transformation to your GitHub repository safely:

```bash
# 1. Create and switch to the transformation feature branch
git checkout -b feature/repomind-transformation

# 2. Stage all upgraded files
git add .

# 3. Commit the changes
git commit -m "feat: transform GenAI Code Complexity Analyzer into RepoMind AI platform"

# 4. Push the branch to GitHub
git push -u origin feature/repomind-transformation
```
You can then open a Pull Request from `feature/repomind-transformation` into `main` on GitHub!

---

## 📄 License
Licensed under the Apache-2.0 License.
