import * as assert from 'assert';
import { ebo_scan_text, LexToken } from '../ebo-scanner';
import { detect_assign_line, compute_lhs_end } from '../ebo-formatter-utils';
import { TokenKind } from '../ebo-types';

function scanLine(text: string): LexToken[] {
    return ebo_scan_text(text + '\n');
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

        it('multiple targets assignment returns = index', () => {
            const tks = scanLine('x, y = 1');
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
    });

    describe('compute_lhs_end', () => {

        it('simple variable: lhs_end is end of identifier', () => {
            // 'x = 1'  -> tokens: [x, ws, =, ws, 1, EOL]
            const tks = scanLine('x = 1');
            const eq_idx = detect_assign_line(tks)!;
            const lhs_end = compute_lhs_end(tks, eq_idx);
            // 'x' ends at column 1
            assert.strictEqual(lhs_end, 1);
        });

        it('long variable: lhs_end is end of identifier', () => {
            const tks = scanLine('longVariableName = 2');
            const eq_idx = detect_assign_line(tks)!;
            const lhs_end = compute_lhs_end(tks, eq_idx);
            assert.strictEqual(lhs_end, 'longVariableName'.length);
        });

        it('array subscript: lhs_end is end of ]', () => {
            const tks = scanLine('x[3] = 4');
            const eq_idx = detect_assign_line(tks)!;
            const lhs_end = compute_lhs_end(tks, eq_idx);
            // 'x[3]' ends at column 4
            assert.strictEqual(lhs_end, 4);
        });

        it('indented variable: lhs_end includes indent', () => {
            const tks = scanLine('  x = 1');
            const eq_idx = detect_assign_line(tks)!;
            const lhs_end = compute_lhs_end(tks, eq_idx);
            // '  x' ends at column 3
            assert.strictEqual(lhs_end, 3);
        });
    });

    describe('alignment block detection', () => {

        it('single assignment: no block detected (eq_idx returned)', () => {
            const tks = scanLine('x = 1');
            const idx = detect_assign_line(tks);
            assert.notStrictEqual(idx, undefined, 'should detect single assignment');
        });

        it('non-assignment between assignments breaks block', () => {
            const line1 = scanLine('x = 1');
            const line2 = scanLine('GOTO SomeLine');
            const line3 = scanLine('longName = 2');
            assert.notStrictEqual(detect_assign_line(line1), undefined);
            assert.strictEqual(detect_assign_line(line2), undefined);
            assert.notStrictEqual(detect_assign_line(line3), undefined);
        });

        it('assignment inside parentheses is not detected as top-level', () => {
            // This line has = inside parens — should not detect as an assignment line
            // because the only = is at depth > 0 in the expression
            const tks = scanLine('IF (x = 1) THEN');
            assert.strictEqual(detect_assign_line(tks), undefined);
        });
    });
});
