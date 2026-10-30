/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { RAGEngine } from './ragEngine';

test('RAGEngine indexes files and retrieves relevant chunks', () => {
  const engine = new RAGEngine();
  const sampleFiles = [
    {
      path: 'src/auth/login.ts',
      content: `
        export function authenticateUser(username: string, pass: string) {
          if (!username || !pass) return false;
          return verifyPasswordHash(username, pass);
        }
      `,
    },
    {
      path: 'src/db/connection.ts',
      content: `
        import postgres from 'pg';
        export const dbPool = new postgres.Pool({
          host: process.env.DB_HOST,
          port: 5432,
        });
      `,
    },
  ];

  const count = engine.indexRepository(sampleFiles);
  assert.equal(count, 2);

  const authResults = engine.search('authenticateUser login credentials');
  assert.ok(authResults.length > 0);
  assert.equal(authResults[0].chunk.filePath, 'src/auth/login.ts');

  const dbResults = engine.search('database connection pool postgres');
  assert.ok(dbResults.length > 0);
  assert.equal(dbResults[0].chunk.filePath, 'src/db/connection.ts');
});
