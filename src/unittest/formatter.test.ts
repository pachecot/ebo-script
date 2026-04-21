import * as assert from 'assert';
import { ebo_scan_text, LexToken } from '../ebo-scanner';
import { detect_assign_line, compute_lhs_end, is_eof_skip_line, is_line_label } from '../ebo-formatter-utils';
import { TokenKind } from '../ebo-types';
import { FileCursor } from '../file-cursor';
import { SymbolTable } from '../SymbolTable';
import { AssignBlock, AssignStatement, parse_statements, removeWhiteSpace } from '../ebo-check';

function scanLine(text: string): LexToken[] {
    return ebo_scan_text(text + '\n');
}

function parseStatements(text: string) {
    const tkn_lists = ebo_scan_text(text);
    const tks = removeWhiteSpace(tkn_lists);
    const st = new SymbolTable();
    const cur = new FileCursor(tks, st);
    return parse_statements(cur, st);
}

describe('Formatter Tests', () => {
    describe('detect_assign_line', () => {

        it('simple assignment returns = index', () => {
            const tks = scanLine('x = 1');
            const idx = detect_assign_line(tks);
            assert.notStrictEqual(idx, undefined);
            assert.strictEqual(tks[idx!].type, TokenKind.EqualsSymbol);
        });

        it('assignment with leading whitespace returns = index', () => {
            const tks = scanLine('  x = 1');
            const idx = detect_assign_line(tks);
            assert.notStrictEqual(idx, undefined);
            assert.strictEqual(tks[idx!].type, TokenKind.EqualsSymbol);
        });

        it('long variable name assignment returns = index', () => {
            const tks = scanLine('longVariableName = 2');
            const idx = detect_assign_line(tks);
            assert.notStrictEqual(idx, undefined);
            assert.strictEqual(tks[idx!].type, TokenKind.EqualsSymbol);
        });

        it('array subscript assignment returns = index', () => {
            const tks = scanLine('x[3] = 4');
            const idx = detect_assign_line(tks);
            assert.notStrictEqual(idx, undefined);
            assert.strictEqual(tks[idx!].type, TokenKind.EqualsSymbol);
        });

        it('multiple targets with comma returns = index', () => {
            const tks = scanLine('x, y = 1');
            const idx = detect_assign_line(tks);
            assert.notStrictEqual(idx, undefined);
            assert.strictEqual(tks[idx!].type, TokenKind.EqualsSymbol);
        });

        it('assignment with expression RHS returns = index', () => {
            const tks = scanLine('result = a + b * 2');
            const idx = detect_assign_line(tks);
            assert.notStrictEqual(idx, undefined);
            assert.strictEqual(tks[idx!].type, TokenKind.EqualsSymbol);
        });

        it('assignment with string literal RHS returns = index', () => {
            const tks = scanLine('msg = "hello"');
            const idx = detect_assign_line(tks);
            assert.notStrictEqual(idx, undefined);
            assert.strictEqual(tks[idx!].type, TokenKind.EqualsSymbol);
        });

        it('line label returns undefined', () => {
            const tks = scanLine('SomeLine:');
            assert.strictEqual(detect_assign_line(tks), undefined);
        });

        it('IF statement returns undefined', () => {
            const tks = scanLine('IF x = 1 THEN');
            assert.strictEqual(detect_assign_line(tks), undefined);
        });

        it('WHILE statement returns undefined', () => {
            const tks = scanLine('WHILE x = 1');
            assert.strictEqual(detect_assign_line(tks), undefined);
        });

        it('GOTO statement returns undefined', () => {
            const tks = scanLine('GOTO SomeLine');
            assert.strictEqual(detect_assign_line(tks), undefined);
        });

        it('blank line returns undefined', () => {
            const tks = scanLine('');
            assert.strictEqual(detect_assign_line(tks), undefined);
        });

        it('SET action keyword returns undefined', () => {
            const tks = scanLine('SET x = 1');
            assert.strictEqual(detect_assign_line(tks), undefined);
        });

        it('CHANGE action keyword returns undefined', () => {
            const tks = scanLine('CHANGE x = 1');
            assert.strictEqual(detect_assign_line(tks), undefined);
        });

        it('LET action keyword returns undefined', () => {
            const tks = scanLine('LET x = 1');
            assert.strictEqual(detect_assign_line(tks), undefined);
        });

        it('continuation line returns undefined', () => {
            const tks = ebo_scan_text('x = 1 ~\n  + 2\n');
            // second physical line starts with whitespace then '+' — not an assignment
            const lines: LexToken[][] = [];
            let current: LexToken[] = [];
            for (const tk of tks) {
                current.push(tk);
                if (tk.type === TokenKind.EndOfLineToken || tk.type === TokenKind.ContinueLineToken) {
                    lines.push(current);
                    current = [];
                }
            }
            if (current.length) { lines.push(current); }
            // the continuation follow-up line should not be detected as an assignment
            assert.strictEqual(detect_assign_line(lines[1]), undefined);
        });

        it('= inside brackets is not the assignment =', () => {
            // x[a = 1] — the only = is inside brackets
            const tks = scanLine('x[a = 1] = 2');
            const idx = detect_assign_line(tks);
            assert.notStrictEqual(idx, undefined);
            // make sure it found the outer =, not the inner one
            assert.ok(idx! > tks.findIndex(t => t.type === TokenKind.BracketRightSymbol));
        });
    });

    describe('compute_lhs_end', () => {

        it('simple variable: lhs_end is end of identifier', () => {
            const tks = scanLine('x = 1');
            const eq_idx = detect_assign_line(tks)!;
            assert.strictEqual(compute_lhs_end(tks, eq_idx), 1);
        });

        it('long variable: lhs_end is end of identifier', () => {
            const tks = scanLine('longVariableName = 2');
            const eq_idx = detect_assign_line(tks)!;
            assert.strictEqual(compute_lhs_end(tks, eq_idx), 'longVariableName'.length);
        });

        it('array subscript: lhs_end is end of ]', () => {
            const tks = scanLine('x[3] = 4');
            const eq_idx = detect_assign_line(tks)!;
            // 'x[3]' ends at column 4
            assert.strictEqual(compute_lhs_end(tks, eq_idx), 4);
        });

        it('indented variable: lhs_end includes indent', () => {
            const tks = scanLine('  x = 1');
            const eq_idx = detect_assign_line(tks)!;
            // '  x' ends at column 3
            assert.strictEqual(compute_lhs_end(tks, eq_idx), 3);
        });

        it('multiple targets: lhs_end is end of last target', () => {
            const tks = scanLine('abc, xy = 1');
            const eq_idx = detect_assign_line(tks)!;
            // 'xy' ends at column 7 (after 'abc, ')
            assert.strictEqual(compute_lhs_end(tks, eq_idx), 'abc, xy'.length);
        });

        it('target with extra spaces before =: lhs_end skips whitespace', () => {
            const tks = scanLine('x   = 1');
            const eq_idx = detect_assign_line(tks)!;
            assert.strictEqual(compute_lhs_end(tks, eq_idx), 1);
        });
    });

    describe('group_assign_blocks (via parse_statements)', () => {

        it('single assignment stays as AssignStatement', () => {
            const stmts = parseStatements('x = 1\n');
            assert.strictEqual(stmts.length, 1);
            assert.ok(stmts[0] instanceof AssignStatement);
        });

        it('two consecutive assignments become one AssignBlock', () => {
            const stmts = parseStatements('x = 1\ny = 2\n');
            assert.strictEqual(stmts.length, 1);
            assert.ok(stmts[0] instanceof AssignBlock);
            assert.strictEqual((stmts[0] as AssignBlock).assignments.length, 2);
        });

        it('three consecutive assignments become one AssignBlock', () => {
            const stmts = parseStatements('x = 1\ny = 2\nz = 3\n');
            assert.strictEqual(stmts.length, 1);
            assert.ok(stmts[0] instanceof AssignBlock);
            assert.strictEqual((stmts[0] as AssignBlock).assignments.length, 3);
        });

        it('AssignBlock preserves variable names and values', () => {
            const stmts = parseStatements('x = 1\nlongName = 2\n');
            const block = stmts[0] as AssignBlock;
            assert.strictEqual(block.assignments[0].assigned[0].name, 'x');
            assert.strictEqual(block.assignments[1].assigned[0].name, 'longName');
        });

        it('non-assignment between two assignments keeps them separate', () => {
            const stmts = parseStatements('x = 1\nGOTO done\ny = 2\ndone:\n');
            // x=1 alone, GOTO, y=2 alone — 3 statements
            assert.strictEqual(stmts.length, 3);
            assert.ok(stmts[0] instanceof AssignStatement);
            assert.ok(stmts[2] instanceof AssignStatement);
        });

        it('block followed by non-assignment then block', () => {
            const stmts = parseStatements('a = 1\nb = 2\nGOTO done\nc = 3\nd = 4\ndone:\n');
            // [AssignBlock(a,b), GOTO, AssignBlock(c,d)]
            assert.strictEqual(stmts.length, 3);
            assert.ok(stmts[0] instanceof AssignBlock);
            assert.strictEqual((stmts[0] as AssignBlock).assignments.length, 2);
            assert.ok(stmts[2] instanceof AssignBlock);
            assert.strictEqual((stmts[2] as AssignBlock).assignments.length, 2);
        });

        it('AssignBlock has correct StatementKind type', () => {
            const stmts = parseStatements('x = 1\ny = 2\n');
            const block = stmts[0] as AssignBlock;
            assert.ok(block instanceof AssignBlock);
        });
    });

    describe('detect_assign_line: block boundary helpers', () => {

        it('all assignment lines in a run are detected', () => {
            const lines = [
                'x = 1',
                'longVariableName = 2',
                'y = 3',
            ];
            for (const line of lines) {
                assert.notStrictEqual(
                    detect_assign_line(scanLine(line)),
                    undefined,
                    `expected assignment detection for: ${line}`
                );
            }
        });

        it('non-assignment lines in a run all return undefined', () => {
            const lines = [
                'GOTO done',
                'IF x THEN',
                'done:',
                'SET x = 1',
            ];
            for (const line of lines) {
                assert.strictEqual(
                    detect_assign_line(scanLine(line)),
                    undefined,
                    `expected undefined for: ${line}`
                );
            }
        });
    });

    // ─── is_eof_skip_line ─────────────────────────────────────────────────────
    describe('is_eof_skip_line', () => {

        function lastLine(text: string): LexToken[] {
            const tokens = ebo_scan_text(text);
            const lines: LexToken[][] = [];
            let cur: LexToken[] = [];
            for (const tk of tokens) {
                cur.push(tk);
                if (tk.type === TokenKind.EndOfLineToken || tk.type === TokenKind.ContinueLineToken) {
                    lines.push(cur);
                    cur = [];
                }
            }
            if (cur.length) { lines.push(cur); }
            return lines[lines.length - 1];
        }

        // cases that SHOULD be skipped
        it('blank line (EOL only) is skipped', () => {
            // "x = 1\n\n" — the second \n produces a [\n] line
            const tks = lastLine('x = 1\n\n');
            assert.strictEqual(tks.length, 1);
            assert.strictEqual(is_eof_skip_line(tks), true);
        });

        it('trailing whitespace at EOF (no newline) is skipped', () => {
            const tks = lastLine('x = 1\n   ');
            assert.strictEqual(tks.length, 1);
            assert.strictEqual(is_eof_skip_line(tks), true);
        });

        // cases that should NOT be skipped (single meaningful token at EOF)
        it('EndIf at EOF without newline is NOT skipped', () => {
            const tks = lastLine('If x Then\n  y = 1\nEndIf');
            assert.strictEqual(tks.length, 1);
            assert.strictEqual(is_eof_skip_line(tks), false);
        });

        it('EndWhile at EOF without newline is NOT skipped', () => {
            const tks = lastLine('While x\n  y = 1\nEndWhile');
            assert.strictEqual(tks.length, 1);
            assert.strictEqual(is_eof_skip_line(tks), false);
        });

        it('EndSelect at EOF without newline is NOT skipped', () => {
            const tks = lastLine('Select Case x\nCase 1\n  y = 1\nEndSelect');
            assert.strictEqual(tks.length, 1);
            assert.strictEqual(is_eof_skip_line(tks), false);
        });

        // multi-token lines always return false regardless of content
        it('EndIf with trailing newline is NOT a skip line (length > 1)', () => {
            const tks = lastLine('If x Then\n  y = 1\nEndIf\n');
            assert.strictEqual(is_eof_skip_line(tks), false);
        });

        it('normal statement line is NOT a skip line', () => {
            const tks = lastLine('x = 1\n');
            assert.strictEqual(is_eof_skip_line(tks), false);
        });
    });

    // ─── scanner tokenization at EOF ─────────────────────────────────────────
    describe('scanner EOF tokenization', () => {

        function tokensByLine(text: string): LexToken[][] {
            const tokens = ebo_scan_text(text);
            const lines = tokens.reduce((ar: LexToken[][], tk: LexToken) => {
                ar[ar.length - 1].push(tk);
                if (tk.type === TokenKind.EndOfLineToken || tk.type === TokenKind.ContinueLineToken) {
                    ar.push([]);
                }
                return ar;
            }, [[]] as LexToken[][]);
            if (lines[lines.length - 1].length === 0) { lines.pop(); }
            return lines;
        }

        it('EndIf without trailing newline produces 1-token last line', () => {
            const lines = tokensByLine('If x Then\n  y = 1\nEndIf');
            const last = lines[lines.length - 1];
            assert.strictEqual(last.length, 1);
            assert.strictEqual(last[0].type, TokenKind.EndIfStatement);
        });

        it('EndIf with trailing newline produces 2-token last line', () => {
            const lines = tokensByLine('If x Then\n  y = 1\nEndIf\n');
            const last = lines[lines.length - 1];
            assert.strictEqual(last.length, 2);
            assert.strictEqual(last[0].type, TokenKind.EndIfStatement);
            assert.strictEqual(last[1].type, TokenKind.EndOfLineToken);
        });

        it('Next x without trailing newline produces multi-token last line', () => {
            const lines = tokensByLine('For x = 1 to 5\n  y = 1\nNext x');
            const last = lines[lines.length - 1];
            assert.ok(last.length > 1, 'Next x should produce multiple tokens');
            assert.strictEqual(last[0].type, TokenKind.NextStatement);
        });

        it('EndWhile without trailing newline produces 1-token last line', () => {
            const lines = tokensByLine('While x\n  y = 1\nEndWhile');
            const last = lines[lines.length - 1];
            assert.strictEqual(last.length, 1);
            assert.strictEqual(last[0].type, TokenKind.EndWhileStatement);
        });

        it('indented EndIf without trailing newline produces 2-token last line', () => {
            // Leading whitespace is a separate token
            const lines = tokensByLine('If x Then\n    y = 1\n  EndIf');
            const last = lines[lines.length - 1];
            assert.strictEqual(last.length, 2);
            assert.strictEqual(last[0].type, TokenKind.WhitespaceToken);
            assert.strictEqual(last[1].type, TokenKind.EndIfStatement);
        });
    });

    describe('is_line_label', () => {

        it('identifier followed by colon is a line label', () => {
            assert.strictEqual(true, is_line_label(scanLine('myLabel:')));
        });

        it('Line keyword followed by identifier is a line label', () => {
            assert.strictEqual(true, is_line_label(scanLine('Line myLabel')));
        });

        it('keyword followed by colon is a line label (e.g. DST:)', () => {
            // DST is a system variable keyword — must be recognised as a label
            assert.strictEqual(true, is_line_label(scanLine('DST:')));
        });

        it('ON followed by colon is a line label', () => {
            assert.strictEqual(true, is_line_label(scanLine('ON:')));
        });

        it('a plain assignment line is not a line label', () => {
            assert.strictEqual(false, is_line_label(scanLine('myVar = 1')));
        });

        it('a keyword on its own (no colon) is not a line label', () => {
            assert.strictEqual(false, is_line_label(scanLine('DST')));
        });

        it('an expression is not a line label', () => {
            assert.strictEqual(false, is_line_label(scanLine('x + y')));
        });

        it('keyword label does not affect detect_assign_line (returns undefined)', () => {
            // DST: should not be mistaken for an assignment
            assert.strictEqual(undefined, detect_assign_line(scanLine('DST:')));
        });

    });
});
