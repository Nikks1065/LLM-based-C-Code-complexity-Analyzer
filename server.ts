/**
 * Full-Stack Express Server with Vite Dev Middleware & Gemini AI Proxy
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeCCode } from './src/analyzer/index.ts';
import { compareRefactoredCode } from './src/analyzer/diffHelper.ts';
import {
  generateAIReview,
  explainComplexityWithAI,
  refactorCodeWithAI,
  chatAboutCode
} from './src/services/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      uptime: process.uptime()
    });
  });

  // 1. Deterministic Static Code Analysis
  app.post('/api/analyze', (req, res) => {
    try {
      const { sourceCode, fileName } = req.body;
      if (typeof sourceCode !== 'string') {
        return res.status(400).json({ error: 'sourceCode string is required' });
      }
      const result = analyzeCCode(sourceCode, fileName || 'main.c');
      return res.json(result);
    } catch (err: any) {
      console.error('Error analyzing C code:', err);
      return res.status(500).json({ error: err.message || 'Internal analysis error' });
    }
  });

  // 2. Refactor Comparison
  app.post('/api/refactor/compare', (req, res) => {
    try {
      const { originalCode, refactoredCode, fileName } = req.body;
      if (!originalCode || !refactoredCode) {
        return res.status(400).json({ error: 'originalCode and refactoredCode are required' });
      }
      const comparison = compareRefactoredCode(originalCode, refactoredCode, fileName);
      return res.json(comparison);
    } catch (err: any) {
      console.error('Error comparing refactored code:', err);
      return res.status(500).json({ error: err.message || 'Comparison error' });
    }
  });

  // 3. Gemini AI Review
  app.post('/api/ai/review', async (req, res) => {
    try {
      const { sourceCode, analysis } = req.body;
      if (!sourceCode || !analysis) {
        return res.status(400).json({ error: 'sourceCode and analysis are required' });
      }
      const review = await generateAIReview(sourceCode, analysis);
      return res.json(review);
    } catch (err: any) {
      console.error('AI Review Error:', err);
      return res.status(500).json({ error: err.message || 'AI review failed' });
    }
  });

  // 4. Gemini Complexity Explanation
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { sourceCode, analysis, targetFunction } = req.body;
      if (!sourceCode || !analysis) {
        return res.status(400).json({ error: 'sourceCode and analysis are required' });
      }
      const explanation = await explainComplexityWithAI(sourceCode, analysis, targetFunction);
      return res.json(explanation);
    } catch (err: any) {
      console.error('AI Explain Error:', err);
      return res.status(500).json({ error: err.message || 'AI explanation failed' });
    }
  });

  // 5. Gemini Refactor Proposal
  app.post('/api/ai/refactor', async (req, res) => {
    try {
      const { sourceCode, analysis, userGoal } = req.body;
      if (!sourceCode || !analysis) {
        return res.status(400).json({ error: 'sourceCode and analysis are required' });
      }
      const refactorProposal = await refactorCodeWithAI(sourceCode, analysis, userGoal);
      return res.json(refactorProposal);
    } catch (err: any) {
      console.error('AI Refactor Error:', err);
      return res.status(500).json({ error: err.message || 'AI refactor failed' });
    }
  });

  // 6. Gemini Contextual Q&A Chat
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { sourceCode, analysis, question, chatHistory } = req.body;
      if (!sourceCode || !question) {
        return res.status(400).json({ error: 'sourceCode and question are required' });
      }
      const answer = await chatAboutCode(sourceCode, analysis, question, chatHistory || []);
      return res.json({ answer });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      return res.status(500).json({ error: err.message || 'AI chat failed' });
    }
  });

  // Dev server or Production static serving
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`C Code Intelligence Analyzer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
