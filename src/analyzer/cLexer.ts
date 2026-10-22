/**
 * Robust C99/C11 Lexer and Tokenizer
 * Tracks precise line and column numbers for all tokens.
 */

export type TokenType =
  | 'KEYWORD'
  | 'TYPE'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'CHAR'
  | 'OPERATOR'
  | 'DELIMITER'
  | 'PREPROCESSOR'
  | 'COMMENT'
  | 'WHITESPACE'
  | 'UNKNOWN';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

const C_KEYWORDS = new Set([
  'auto', 'break', 'case', 'const', 'continue', 'default', 'do',
  'else', 'enum', 'extern', 'for', 'goto', 'if', 'inline', 'register',
  'restrict', 'return', 'sizeof', 'static', 'struct', 'switch', 'typedef',
  'union', 'volatile', 'while', '_Bool', '_Complex', '_Imaginary'
]);

const C_TYPES = new Set([
  'void', 'char', 'short', 'int', 'long', 'float', 'double', 'signed',
  'unsigned', 'size_t', 'ssize_t', 'int8_t', 'int16_t', 'int32_t', 'int64_t',
  'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t', 'bool', 'intptr_t', 'uintptr_t',
  'FILE', 'ptrdiff_t'
]);

export function tokenizeC(source: string): Token[] {
  const tokens: Token[] = [];
  const len = source.length;
  let idx = 0;
  let line = 1;
  let col = 1;

  function advance(): string {
    const ch = source[idx];
    idx++;
    if (ch === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  }

  function peek(offset = 0): string {
    if (idx + offset >= len) return '';
    return source[idx + offset];
  }

  while (idx < len) {
    const ch = peek();
    const startLine = line;
    const startCol = col;

    // Whitespace
    if (/\s/.test(ch)) {
      let val = '';
      while (idx < len && /\s/.test(peek())) {
        val += advance();
      }
      tokens.push({
        type: 'WHITESPACE',
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Preprocessor directive: lines starting with #
    if (ch === '#' && (startCol === 1 || tokens[tokens.length - 1]?.type === 'WHITESPACE')) {
      let val = advance();
      while (idx < len) {
        if (peek() === '\\' && peek(1) === '\n') {
          val += advance(); // \
          val += advance(); // \n
        } else if (peek() === '\n') {
          break;
        } else {
          val += advance();
        }
      }
      tokens.push({
        type: 'PREPROCESSOR',
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Single-line comment: //
    if (ch === '/' && peek(1) === '/') {
      let val = advance() + advance();
      while (idx < len && peek() !== '\n') {
        val += advance();
      }
      tokens.push({
        type: 'COMMENT',
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Multi-line comment: /* ... */
    if (ch === '/' && peek(1) === '*') {
      let val = advance() + advance();
      while (idx < len) {
        if (peek() === '*' && peek(1) === '/') {
          val += advance() + advance();
          break;
        }
        val += advance();
      }
      tokens.push({
        type: 'COMMENT',
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // String literal: "..."
    if (ch === '"') {
      let val = advance();
      let escaped = false;
      while (idx < len) {
        const c = advance();
        val += c;
        if (escaped) {
          escaped = false;
        } else if (c === '\\') {
          escaped = true;
        } else if (c === '"') {
          break;
        } else if (c === '\n') {
          break; // Unclosed string on newline
        }
      }
      tokens.push({
        type: 'STRING',
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Character literal: '...'
    if (ch === "'") {
      let val = advance();
      let escaped = false;
      while (idx < len) {
        const c = advance();
        val += c;
        if (escaped) {
          escaped = false;
        } else if (c === '\\') {
          escaped = true;
        } else if (c === "'") {
          break;
        } else if (c === '\n') {
          break;
        }
      }
      tokens.push({
        type: 'CHAR',
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Multi-char operators: e.g. ->, <<=, >>=, ==, !=, <=, >=, &&, ||, ++, --, +=, -=, *=, /=, %=, &=, |=, ^=, <<, >>
    const threeChars = ch + peek(1) + peek(2);
    if (['<<=', '>>=', '...'].includes(threeChars)) {
      advance(); advance(); advance();
      tokens.push({
        type: 'OPERATOR',
        value: threeChars,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    const twoChars = ch + peek(1);
    if ([
      '->', '++', '--', '==', '!=', '<=', '>=', '&&', '||',
      '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>'
    ].includes(twoChars)) {
      advance(); advance();
      tokens.push({
        type: 'OPERATOR',
        value: twoChars,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Single-char operators
    if (['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':'].includes(ch)) {
      const val = advance();
      tokens.push({
        type: 'OPERATOR',
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Delimiters
    if (['(', ')', '{', '}', '[', ']', ';', ',', '.'].includes(ch)) {
      const val = advance();
      tokens.push({
        type: 'DELIMITER',
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Numbers (decimal, hex, octal, float)
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(peek(1)))) {
      let val = advance();
      let isHex = false;
      if (val === '0' && (peek().toLowerCase() === 'x')) {
        val += advance(); // x
        isHex = true;
      }
      while (idx < len) {
        const c = peek();
        if (isHex ? /[0-9a-fA-F]/.test(c) : /[0-9]/.test(c)) {
          val += advance();
        } else if (c === '.' && !isHex && !val.includes('.')) {
          val += advance();
        } else if (['f', 'F', 'l', 'L', 'u', 'U'].includes(c)) {
          val += advance();
        } else if ((c === 'e' || c === 'E') && !isHex) {
          val += advance();
          if (peek() === '+' || peek() === '-') {
            val += advance();
          }
        } else {
          break;
        }
      }
      tokens.push({
        type: 'NUMBER',
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Identifiers and Keywords
    if (/[a-zA-Z_]/.test(ch)) {
      let val = advance();
      while (idx < len && /[a-zA-Z0-9_]/.test(peek())) {
        val += advance();
      }
      let tType: TokenType = 'IDENTIFIER';
      if (C_KEYWORDS.has(val)) {
        tType = 'KEYWORD';
      } else if (C_TYPES.has(val)) {
        tType = 'TYPE';
      }
      tokens.push({
        type: tType,
        value: val,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col
      });
      continue;
    }

    // Unknown or other character
    const unknownChar = advance();
    tokens.push({
      type: 'UNKNOWN',
      value: unknownChar,
      line: startLine,
      column: startCol,
      endLine: line,
      endColumn: col
    });
  }

  return tokens;
}
