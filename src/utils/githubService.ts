/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RepoMetadata } from '../types/repomind';

export interface ParsedRepoUrl {
  owner: string;
  repo: string;
  branch?: string;
  isValid: boolean;
  error?: string;
}

export function parseGitHubUrl(input: string): ParsedRepoUrl {
  if (!input || typeof input !== 'string') {
    return { owner: '', repo: '', isValid: false, error: 'Repository URL is required.' };
  }

  const cleaned = input.trim().replace(/\/+$/, '').replace(/\.git$/, '');

  const fullUrlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/tree\/([a-zA-Z0-9_.-]+))?/);
  if (fullUrlMatch) {
    return {
      owner: fullUrlMatch[1],
      repo: fullUrlMatch[2],
      branch: fullUrlMatch[3],
      isValid: true,
    };
  }

  const shorthandMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shorthandMatch) {
    return {
      owner: shorthandMatch[1],
      repo: shorthandMatch[2],
      isValid: true,
    };
  }

  return {
    owner: '',
    repo: '',
    isValid: false,
    error: 'Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo).',
  };
}

export const EXCLUDED_PATHS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'out',
  'vendor',
  'target',
  '__pycache__',
  '.venv',
  'env',
  '.idea',
  '.vscode',
  'coverage',
];

export const BINARY_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'svg',
  'mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg',
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  'zip', 'tar', 'gz', '7z', 'rar',
  'pdf', 'doc', 'docx', 'xls', 'xlsx',
  'exe', 'dll', 'so', 'dylib', 'bin', 'class', 'pyc', 'o',
  'ds_store',
];

export function isAllowedFile(path: string, size?: number): boolean {
  if (size && size > 250000) return false;

  const parts = path.split('/');
  for (const part of parts) {
    if (EXCLUDED_PATHS.includes(part.toLowerCase())) {
      return false;
    }
  }

  const ext = path.split('.').pop()?.toLowerCase();
  if (ext && BINARY_EXTENSIONS.includes(ext)) {
    return false;
  }

  return true;
}

export const CURATED_REPOSITORIES: Record<string, { metadata: RepoMetadata; files: { path: string; content: string }[] }> = {
  'nikhilnitt/code-complexity-analyzer': {
    metadata: {
      owner: 'nikhilnitt',
      repo: 'code-complexity-analyzer',
      fullName: 'nikhilnitt/code-complexity-analyzer',
      description: 'GenAI-Based Code Complexity Analyzer – static AST metrics, cyclomatic complexity, Halstead volume, Big-O estimation.',
      stars: 48,
      forks: 12,
      openIssues: 1,
      watchers: 48,
      defaultBranch: 'main',
      selectedBranch: 'main',
      branches: ['main', 'feature/repomind-transformation'],
      primaryLanguage: 'TypeScript',
      languagesDistribution: { TypeScript: 68, Python: 18, JavaScript: 14 },
      license: 'MIT',
      updatedAt: '2026-10-25T14:20:00Z',
      createdAt: '2026-03-10T09:12:00Z',
      sizeKB: 1420,
      isPrivate: false,
      htmlUrl: 'https://github.com/nikhilnitt/code-complexity-analyzer',
    },
    files: [
      {
        path: 'src/analyzer/cyclomatic.ts',
        content: `// Cyclomatic complexity static engine
export function computeCyclomatic(code: string): number {
  const decisions = code.match(/\\b(if|else if|for|while|case|catch)\\b|&&|\\|\\||\\?/g);
  return 1 + (decisions ? decisions.length : 0);
}

export function evaluateHalstead(tokens: string[]) {
  const unique = new Set(tokens);
  const volume = tokens.length * Math.log2(Math.max(2, unique.size));
  return { volume, vocabulary: unique.size };
}
`,
      },
      {
        path: 'src/analyzer/timeComplexity.ts',
        content: `// Time and Space Big-O Heuristic Engine
export function estimateBigO(loopDepth: number, hasHalving: boolean, isRecursive: boolean): string {
  if (isRecursive && loopDepth > 0) return 'O(N^2)';
  if (isRecursive) return 'O(N)';
  if (loopDepth >= 3) return 'O(N^3)';
  if (loopDepth === 2) return 'O(N^2)';
  if (loopDepth === 1) return hasHalving ? 'O(log N)' : 'O(N)';
  return 'O(1)';
}
`,
      },
      {
        path: 'src/server/index.ts',
        content: `import express from 'express';
import { computeCyclomatic } from '../analyzer/cyclomatic';

const app = express();
app.use(express.json());

app.post('/api/analyze', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  const cc = computeCyclomatic(code);
  res.json({ cyclomaticComplexity: cc });
});

app.listen(3000, () => console.log('Complexity server listening on 3000'));
`,
      },
      {
        path: 'package.json',
        content: `{
  "name": "code-complexity-analyzer",
  "version": "1.2.0",
  "description": "GenAI-Based Code Complexity Analyzer",
  "main": "src/server/index.ts",
  "scripts": {
    "start": "tsx src/server/index.ts",
    "test": "node --test"
  },
  "dependencies": {
    "express": "^4.21.2",
    "@google/genai": "^2.4.0",
    "typescript": "^5.6.2"
  }
}`,
      },
      {
        path: 'README.md',
        content: `# GenAI-Based Code Complexity Analyzer

Analyzes source code complexity including Cyclomatic Complexity, Halstead Volume, and Big-O runtime estimates using static AST patterns and GenAI explanations.

## Quickstart
\`\`\`bash
npm install
npm run start
\`\`\`
`,
      },
    ],
  },
  'expressjs/express': {
    metadata: {
      owner: 'expressjs',
      repo: 'express',
      fullName: 'expressjs/express',
      description: 'Fast, unopinionated, minimalist web framework for Node.js.',
      stars: 65400,
      forks: 14800,
      openIssues: 120,
      watchers: 65400,
      defaultBranch: 'master',
      selectedBranch: 'master',
      branches: ['master', '5.0', '4.x'],
      primaryLanguage: 'JavaScript',
      languagesDistribution: { JavaScript: 98, HTML: 2 },
      license: 'MIT',
      updatedAt: '2026-10-28T18:00:00Z',
      createdAt: '2010-12-29T19:38:25Z',
      sizeKB: 2480,
      isPrivate: false,
      htmlUrl: 'https://github.com/expressjs/express',
    },
    files: [
      {
        path: 'lib/express.js',
        content: `'use strict';
var EventEmitter = require('events').EventEmitter;
var proto = require('./application');

function createApplication() {
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };
  Object.assign(app, EventEmitter.prototype, proto);
  app.init();
  return app;
}

exports = module.exports = createApplication;
`,
      },
      {
        path: 'lib/application.js',
        content: `'use strict';
var http = require('http');
var app = exports = module.exports = {};

app.init = function init() {
  this.settings = {};
};

app.listen = function listen() {
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};
`,
      },
      {
        path: 'package.json',
        content: `{
  "name": "express",
  "version": "4.21.2",
  "description": "Fast, unopinionated, minimalist web framework",
  "dependencies": {
    "body-parser": "1.20.3",
    "cookie": "0.7.1",
    "http-errors": "2.0.0"
  }
}`,
      },
    ],
  },
};
