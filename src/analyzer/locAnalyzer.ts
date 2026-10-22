/**
 * Lines of Code (LOC) Analyzer
 * Deterministic categorization of lines according to software engineering standards.
 * Correctly distinguishes code, comments, blank lines, and mixed lines,
 * even with multiline comments and string literals containing comment syntax.
 */

import type { LOCMetrics, LOCLineDetail, LineCategory } from '../types/analyzer.ts';
import { tokenizeC } from './cLexer.ts';

export function analyzeLOC(source: string, startLine = 1, endLine?: number): LOCMetrics {
  const rawLines = source.split(/\r?\n/);
  const maxLine = endLine ? Math.min(endLine, rawLines.length) : rawLines.length;
  const targetLines = rawLines.slice(startLine - 1, maxLine);

  // We tokenize the source to know exactly where comments, code tokens, and strings exist
  const tokens = tokenizeC(source);

  // Map each line number to what kind of tokens it contains
  const lineTokenMap = new Map<number, { hasCode: boolean; hasComment: boolean }>();

  for (let l = startLine; l <= maxLine; l++) {
    lineTokenMap.set(l, { hasCode: false, hasComment: false });
  }

  for (const token of tokens) {
    const tStart = token.line;
    const tEnd = token.endLine;

    for (let l = tStart; l <= tEnd; l++) {
      if (l < startLine || l > maxLine) continue;
      const entry = lineTokenMap.get(l) || { hasCode: false, hasComment: false };

      if (token.type === 'COMMENT') {
        entry.hasComment = true;
      } else if (token.type !== 'WHITESPACE') {
        entry.hasCode = true;
      }
      lineTokenMap.set(l, entry);
    }
  }

  const linesDetail: LOCLineDetail[] = [];
  let blankCount = 0;
  let codeOnlyCount = 0;
  let commentOnlyCount = 0;
  let codeAndCommentCount = 0;

  for (let i = 0; i < targetLines.length; i++) {
    const lineNum = startLine + i;
    const content = targetLines[i];
    const isWhitespaceOnly = /^\s*$/.test(content);
    const entry = lineTokenMap.get(lineNum) || { hasCode: false, hasComment: false };

    let category: LineCategory = 'blank';
    let explanation = '';

    if (isWhitespaceOnly) {
      category = 'blank';
      blankCount++;
      explanation = 'Line contains only whitespace characters (spaces, tabs, carriage returns).';
    } else if (entry.hasCode && entry.hasComment) {
      category = 'code_and_comment';
      codeAndCommentCount++;
      explanation = 'Line contains both executable C statements / declarations and comments.';
    } else if (entry.hasComment && !entry.hasCode) {
      category = 'comment';
      commentOnlyCount++;
      explanation = 'Line contains only comment text (single-line // or block /* */).';
    } else {
      category = 'code';
      codeOnlyCount++;
      explanation = 'Line contains executable C code, declarations, or preprocessor directives without comments.';
    }

    linesDetail.push({
      lineNumber: lineNum,
      content,
      category,
      explanation
    });
  }

  const totalPhysical = targetLines.length;
  const nonEmpty = codeOnlyCount + commentOnlyCount + codeAndCommentCount;
  const totalComments = commentOnlyCount + codeAndCommentCount;
  const commentRatio = totalPhysical > 0 ? Number(((totalComments / totalPhysical) * 100).toFixed(2)) : 0;

  const countingRules = [
    'Physical LOC: Total count of newline-delimited lines in the source range.',
    'Blank Lines: Lines containing zero characters or only whitespace (\t, \\r, spaces).',
    'Comment-Only Lines: Lines containing solely single-line (//) or multi-line (/* */) comments.',
    'Code-Only Lines: Lines with C statements, keywords, or preprocessor directives without inline comments.',
    'Code-Plus-Comment Lines: Lines containing both executable C tokens and comment tokens.',
    'Non-Empty Lines: Exactly equal to Code-Only + Comment-Only + Code-Plus-Comment lines.',
    'Overlap Principle: Code-Only, Comment-Only, Code-Plus-Comment, and Blank lines form a strict partition of Physical LOC (Sum equals 100%).'
  ];

  return {
    totalPhysical,
    codeOnly: codeOnlyCount,
    commentOnly: commentOnlyCount,
    codeAndComment: codeAndCommentCount,
    blank: blankCount,
    nonEmpty,
    commentRatio,
    lines: linesDetail,
    countingRules
  };
}
