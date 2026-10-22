/**
 * AST-Capable C Parser
 * Parses C source code into a structured Abstract Syntax Tree (AST),
 * extracts functions, control flow statements, variable declarations,
 * function calls, dynamic memory allocations, and syntax diagnostics.
 */

import { type Token, tokenizeC } from './cLexer.ts';
import type { ParserDiagnostic } from '../types/analyzer.ts';

export interface ASTNode {
  type: string;
  line: number;
  endLine: number;
  [key: string]: any;
}

export interface ASTFunction {
  name: string;
  returnType: string;
  parameters: { type: string; name: string }[];
  startLine: number;
  endLine: number;
  body: ASTNode[];
  localVariables: { name: string; type: string; line: number; isArray: boolean; arraySize?: string }[];
  functionCalls: { name: string; args: string[]; line: number }[];
  allocations: { type: 'malloc' | 'calloc' | 'realloc'; varName?: string; sizeExpr: string; line: number }[];
  frees: { varName: string; line: number }[];
  tokens: Token[];
}

export interface ParsedProgram {
  functions: ASTFunction[];
  globalVariables: { name: string; type: string; line: number }[];
  diagnostics: ParserDiagnostic[];
  allTokens: Token[];
}

export function parseC(source: string): ParsedProgram {
  const allTokens = tokenizeC(source);
  const meaningfulTokens = allTokens.filter(t => t.type !== 'WHITESPACE' && t.type !== 'COMMENT');
  const diagnostics: ParserDiagnostic[] = [];
  const functions: ASTFunction[] = [];
  const globalVariables: { name: string; type: string; line: number }[] = [];

  // Check bracket balance
  const braceStack: { char: string; line: number; col: number }[] = [];
  const parenStack: { char: string; line: number; col: number }[] = [];

  for (const t of meaningfulTokens) {
    if (t.value === '{') braceStack.push({ char: '{', line: t.line, col: t.column });
    else if (t.value === '}') {
      if (braceStack.length === 0) {
        diagnostics.push({ severity: 'error', line: t.line, column: t.column, message: 'Extraneous closing brace "}"' });
      } else {
        braceStack.pop();
      }
    } else if (t.value === '(') parenStack.push({ char: '(', line: t.line, col: t.column });
    else if (t.value === ')') {
      if (parenStack.length === 0) {
        diagnostics.push({ severity: 'error', line: t.line, column: t.column, message: 'Extraneous closing parenthesis ")"' });
      } else {
        parenStack.pop();
      }
    }
  }

  for (const b of braceStack) {
    diagnostics.push({ severity: 'error', line: b.line, column: b.col, message: 'Unmatched opening brace "{"' });
  }
  for (const p of parenStack) {
    diagnostics.push({ severity: 'error', line: p.line, column: p.col, message: 'Unmatched opening parenthesis "("' });
  }

  // Parse Functions and Global Declarations
  let i = 0;
  const n = meaningfulTokens.length;

  while (i < n) {
    const startIdx = i;

    // Check for preprocessor directive
    if (meaningfulTokens[i].type === 'PREPROCESSOR') {
      i++;
      continue;
    }

    // Try finding function definition
    // Pattern: [type] [pointers] identifier '(' [params] ')' '{'
    let returnTypeParts: string[] = [];
    while (i < n && (meaningfulTokens[i].type === 'TYPE' || meaningfulTokens[i].type === 'KEYWORD' || meaningfulTokens[i].value === '*' || meaningfulTokens[i].type === 'IDENTIFIER')) {
      // If we see an identifier followed immediately by '(', that might be the function name
      if (i + 1 < n && meaningfulTokens[i].type === 'IDENTIFIER' && meaningfulTokens[i + 1].value === '(') {
        break;
      }
      returnTypeParts.push(meaningfulTokens[i].value);
      i++;
    }

    if (i < n && meaningfulTokens[i].type === 'IDENTIFIER' && i + 1 < n && meaningfulTokens[i + 1].value === '(') {
      const funcName = meaningfulTokens[i].value;
      const funcStartLine = meaningfulTokens[startIdx].line;
      i += 2; // skip name and '('

      // Parse parameters
      const params: { type: string; name: string }[] = [];
      let currentParamTokens: string[] = [];
      let parenDepth = 1;

      while (i < n && parenDepth > 0) {
        if (meaningfulTokens[i].value === '(') parenDepth++;
        else if (meaningfulTokens[i].value === ')') {
          parenDepth--;
          if (parenDepth === 0) break;
        }

        if (parenDepth === 1 && meaningfulTokens[i].value === ',') {
          if (currentParamTokens.length > 0) {
            params.push(parseParameter(currentParamTokens));
            currentParamTokens = [];
          }
        } else {
          currentParamTokens.push(meaningfulTokens[i].value);
        }
        i++;
      }

      if (currentParamTokens.length > 0) {
        params.push(parseParameter(currentParamTokens));
      }

      if (i < n && meaningfulTokens[i].value === ')') {
        i++; // skip ')'
      }

      // Check if next token is '{' (definition) or ';' (prototype)
      if (i < n && meaningfulTokens[i].value === '{') {
        const bodyStartLine = meaningfulTokens[i].line;
        const bodyTokens: Token[] = [meaningfulTokens[i]];
        let braceDepth = 1;
        i++; // skip '{'

        while (i < n && braceDepth > 0) {
          const t = meaningfulTokens[i];
          bodyTokens.push(t);
          if (t.value === '{') braceDepth++;
          else if (t.value === '}') braceDepth--;
          i++;
        }

        const funcEndLine = bodyTokens[bodyTokens.length - 1]?.line || bodyStartLine;

        // Parse body AST and extract metadata
        const parsedBody = parseBody(bodyTokens);

        functions.push({
          name: funcName,
          returnType: returnTypeParts.join(' ') || 'int',
          parameters: params.filter(p => p.name !== 'void' && p.type !== 'void'),
          startLine: funcStartLine,
          endLine: funcEndLine,
          body: parsedBody.astNodes,
          localVariables: parsedBody.localVariables,
          functionCalls: parsedBody.functionCalls,
          allocations: parsedBody.allocations,
          frees: parsedBody.frees,
          tokens: bodyTokens
        });
        continue;
      } else {
        // Prototype or declaration, skip to ';'
        while (i < n && meaningfulTokens[i].value !== ';') {
          i++;
        }
        if (i < n && meaningfulTokens[i].value === ';') i++;
        continue;
      }
    }

    // Otherwise, advance past statement
    while (i < n && meaningfulTokens[i].value !== ';' && meaningfulTokens[i].value !== '}') {
      i++;
    }
    if (i < n) i++;
  }

  return {
    functions,
    globalVariables,
    diagnostics,
    allTokens
  };
}

function parseParameter(tokens: string[]): { type: string; name: string } {
  if (tokens.length === 0) return { type: '', name: '' };
  if (tokens.length === 1) {
    if (tokens[0] === 'void') return { type: 'void', name: '' };
    return { type: tokens[0], name: '' };
  }
  const name = tokens[tokens.length - 1];
  const type = tokens.slice(0, tokens.length - 1).join(' ');
  return { type, name };
}

interface ParsedBodyResult {
  astNodes: ASTNode[];
  localVariables: { name: string; type: string; line: number; isArray: boolean; arraySize?: string }[];
  functionCalls: { name: string; args: string[]; line: number }[];
  allocations: { type: 'malloc' | 'calloc' | 'realloc'; varName?: string; sizeExpr: string; line: number }[];
  frees: { varName: string; line: number }[];
}

function parseBody(tokens: Token[]): ParsedBodyResult {
  const astNodes: ASTNode[] = [];
  const localVariables: { name: string; type: string; line: number; isArray: boolean; arraySize?: string }[] = [];
  const functionCalls: { name: string; args: string[]; line: number }[] = [];
  const allocations: { type: 'malloc' | 'calloc' | 'realloc'; varName?: string; sizeExpr: string; line: number }[] = [];
  const frees: { varName: string; line: number }[] = [];

  let idx = 0;
  const len = tokens.length;

  while (idx < len) {
    const t = tokens[idx];

    // Detect loops: for, while, do
    if (t.value === 'for') {
      const startLine = t.line;
      idx++;
      let parenCount = 0;
      let headerTokens: Token[] = [];
      if (idx < len && tokens[idx].value === '(') {
        parenCount = 1;
        idx++;
        while (idx < len && parenCount > 0) {
          if (tokens[idx].value === '(') parenCount++;
          else if (tokens[idx].value === ')') parenCount--;
          if (parenCount > 0) headerTokens.push(tokens[idx]);
          idx++;
        }
      }

      // Parse init; cond; update from headerTokens
      const headerStr = headerTokens.map(h => h.value).join(' ');
      const headerParts = headerStr.split(';');
      const initPart = headerParts[0]?.trim() || '';
      const condPart = headerParts[1]?.trim() || '';
      const updatePart = headerParts[2]?.trim() || '';

      // Infer loop variable
      let loopVar = '';
      const varMatch = initPart.match(/\b([a-zA-Z_]\w*)\s*=/);
      if (varMatch) loopVar = varMatch[1];
      else {
        const condMatch = condPart.match(/\b([a-zA-Z_]\w*)\s*(<|<=|>|>=|!=|==)/);
        if (condMatch) loopVar = condMatch[1];
      }

      // Step type
      let stepType: 'linear' | 'logarithmic' | 'constant' | 'unknown' = 'linear';
      if (updatePart.includes('*=') || updatePart.includes('/=') || updatePart.includes('<<=') || updatePart.includes('>>=')) {
        stepType = 'logarithmic';
      } else if (updatePart.includes('++') || updatePart.includes('--') || updatePart.includes('+=') || updatePart.includes('-=')) {
        stepType = 'linear';
      }

      // Determine loop body end line by looking ahead without advancing idx
      let bodyEndLine = startLine;
      let lookaheadIdx = idx;
      if (lookaheadIdx < len && tokens[lookaheadIdx].value === '{') {
        let bDepth = 1;
        lookaheadIdx++;
        while (lookaheadIdx < len && bDepth > 0) {
          if (tokens[lookaheadIdx].value === '{') bDepth++;
          else if (tokens[lookaheadIdx].value === '}') bDepth--;
          bodyEndLine = tokens[lookaheadIdx]?.line || bodyEndLine;
          lookaheadIdx++;
        }
      } else {
        while (lookaheadIdx < len && tokens[lookaheadIdx].value !== ';') {
          bodyEndLine = tokens[lookaheadIdx].line;
          lookaheadIdx++;
        }
      }

      astNodes.push({
        type: 'ForStatement',
        line: startLine,
        endLine: bodyEndLine,
        loopVar,
        initPart,
        condPart,
        updatePart,
        stepType,
        codeSnippet: `for (${headerStr})`
      });
      // Do not skip tokens; let idx naturally parse statements inside body
      continue;
    }

    if (t.value === 'while') {
      const startLine = t.line;
      idx++;
      let parenCount = 0;
      let condTokens: Token[] = [];
      if (idx < len && tokens[idx].value === '(') {
        parenCount = 1;
        idx++;
        while (idx < len && parenCount > 0) {
          if (tokens[idx].value === '(') parenCount++;
          else if (tokens[idx].value === ')') parenCount--;
          if (parenCount > 0) condTokens.push(tokens[idx]);
          idx++;
        }
      }

      const condStr = condTokens.map(c => c.value).join(' ');
      let loopVar = '';
      const condMatch = condStr.match(/\b([a-zA-Z_]\w*)\s*(<|<=|>|>=|!=|==)/);
      if (condMatch) loopVar = condMatch[1];

      // Check if body has binary search pattern or logarithmic halving
      let isBinarySearchLoop = false;
      if (condStr.includes('<=') || condStr.includes('<')) {
        // Look ahead inside loop for mid / 2 or >> 1
        for (let k = idx; k < Math.min(len, idx + 40); k++) {
          if (tokens[k].value === '}' && tokens[k].line > startLine + 10) break;
          if (tokens[k].value === '/' && tokens[k + 1]?.value === '2') {
            isBinarySearchLoop = true;
            break;
          }
          if (tokens[k].value === '>>' && tokens[k + 1]?.value === '1') {
            isBinarySearchLoop = true;
            break;
          }
        }
      }

      let bodyEndLine = startLine;
      let lookaheadIdx = idx;
      if (lookaheadIdx < len && tokens[lookaheadIdx].value === '{') {
        let bDepth = 1;
        lookaheadIdx++;
        while (lookaheadIdx < len && bDepth > 0) {
          if (tokens[lookaheadIdx].value === '{') bDepth++;
          else if (tokens[lookaheadIdx].value === '}') bDepth--;
          bodyEndLine = tokens[lookaheadIdx]?.line || bodyEndLine;
          lookaheadIdx++;
        }
      } else {
        while (lookaheadIdx < len && tokens[lookaheadIdx].value !== ';') {
          bodyEndLine = tokens[lookaheadIdx].line;
          lookaheadIdx++;
        }
      }

      astNodes.push({
        type: 'WhileStatement',
        line: startLine,
        endLine: bodyEndLine,
        loopVar,
        condPart: condStr,
        stepType: isBinarySearchLoop ? 'logarithmic' : 'linear',
        codeSnippet: `while (${condStr})`
      });
      // Do not skip tokens; let idx naturally parse statements inside body
      continue;
    }

    if (t.value === 'do') {
      const startLine = t.line;
      idx++;
      let bodyEndLine = startLine;
      if (idx < len && tokens[idx].value === '{') {
        let bDepth = 1;
        idx++;
        while (idx < len && bDepth > 0) {
          if (tokens[idx].value === '{') bDepth++;
          else if (tokens[idx].value === '}') bDepth--;
          bodyEndLine = tokens[idx].line;
          idx++;
        }
      }
      // Read while (cond);
      while (idx < len && tokens[idx].value !== ';') {
        bodyEndLine = tokens[idx].line;
        idx++;
      }
      if (idx < len) idx++;

      astNodes.push({
        type: 'DoWhileStatement',
        line: startLine,
        endLine: bodyEndLine,
        codeSnippet: 'do { ... } while (...);'
      });
      continue;
    }

    // Branching: if, switch, case
    if (t.value === 'if') {
      const startLine = t.line;
      idx++;
      let parenCount = 0;
      let condTokens: Token[] = [];
      if (idx < len && tokens[idx].value === '(') {
        parenCount = 1;
        idx++;
        while (idx < len && parenCount > 0) {
          if (tokens[idx].value === '(') parenCount++;
          else if (tokens[idx].value === ')') parenCount--;
          if (parenCount > 0) condTokens.push(tokens[idx]);
          idx++;
        }
      }

      const condStr = condTokens.map(c => c.value).join(' ');
      astNodes.push({
        type: 'IfStatement',
        line: startLine,
        endLine: startLine,
        condition: condStr,
        conditionTokens: condTokens,
        codeSnippet: `if (${condStr})`
      });
      continue;
    }

    if (t.value === 'switch') {
      astNodes.push({
        type: 'SwitchStatement',
        line: t.line,
        endLine: t.line,
        codeSnippet: 'switch (...)'
      });
      idx++;
      continue;
    }

    if (t.value === 'case') {
      let caseVal = '';
      const line = t.line;
      idx++;
      while (idx < len && tokens[idx].value !== ':') {
        caseVal += ' ' + tokens[idx].value;
        idx++;
      }
      if (idx < len) idx++; // skip ':'
      astNodes.push({
        type: 'CaseStatement',
        line,
        endLine: line,
        value: caseVal.trim(),
        codeSnippet: `case ${caseVal.trim()}:`
      });
      continue;
    }

    // Check function calls: identifier '('
    if (t.type === 'IDENTIFIER' && idx + 1 < len && tokens[idx + 1].value === '(') {
      const callName = t.value;
      const callLine = t.line;
      idx += 2; // skip name and '('
      let pDepth = 1;
      let argsTokens: string[] = [];
      while (idx < len && pDepth > 0) {
        if (tokens[idx].value === '(') pDepth++;
        else if (tokens[idx].value === ')') pDepth--;
        if (pDepth > 0) argsTokens.push(tokens[idx].value);
        idx++;
      }
      const argsStr = argsTokens.join(' ');
      functionCalls.push({ name: callName, args: argsStr.split(','), line: callLine });

      // Special handling for malloc / calloc / realloc
      if (callName === 'malloc' || callName === 'calloc' || callName === 'realloc') {
        allocations.push({
          type: callName,
          sizeExpr: argsStr,
          line: callLine
        });
      }

      // Special handling for free
      if (callName === 'free') {
        frees.push({
          varName: argsStr.trim(),
          line: callLine
        });
      }
      continue;
    }

    // Local variable declarations: [type] [pointers] identifier [ '[' size ']' ] [ = init ];
    if (t.type === 'TYPE' || (t.type === 'KEYWORD' && ['int', 'char', 'float', 'double', 'long', 'short', 'unsigned', 'signed'].includes(t.value))) {
      const varType = t.value;
      idx++;
      while (idx < len && tokens[idx].value === '*') idx++;
      if (idx < len && tokens[idx].type === 'IDENTIFIER') {
        const varName = tokens[idx].value;
        const line = tokens[idx].line;
        idx++;
        let isArray = false;
        let arraySize: string | undefined = undefined;

        if (idx < len && tokens[idx].value === '[') {
          isArray = true;
          idx++;
          let sz = '';
          while (idx < len && tokens[idx].value !== ']') {
            sz += tokens[idx].value;
            idx++;
          }
          if (idx < len) idx++; // skip ']'
          arraySize = sz.trim();
        }

        localVariables.push({
          name: varName,
          type: varType,
          line,
          isArray,
          arraySize
        });
      }
      continue;
    }

    idx++;
  }

  return {
    astNodes,
    localVariables,
    functionCalls,
    allocations,
    frees
  };
}
