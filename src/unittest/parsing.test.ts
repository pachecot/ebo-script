import * as assert from 'assert';
import { FileCursor } from '../file-cursor';
import { SymbolTable } from '../SymbolTable';
import { ebo_scan_text, LexToken } from '../ebo-scanner';
import {
    AssignStatement, CommandStatement, StatementKind,
    ebo_parse_file, expression, OpCode, BinaryOp,
    parse_return_command, parse_wait_command,
    parse_statement, parse_statements, parse_while_statement,
    parse_repeat_statement, parse_program,
    removeWhiteSpace, VariableInst, WhileStatement, ProgramType,
} from '../ebo-check';
import { TokenKind } from '../ebo-types';
import { EboErrors } from '../EboErrors';
import { Severity } from '../SymbolTable';

function parseWith<T>(
    text: string,
    f: (cur: FileCursor, st: SymbolTable) => T,
    st: SymbolTable = new SymbolTable()
): T {
    const tkn_lists = ebo_scan_text(text);
    const tks = removeWhiteSpace(tkn_lists);
    const cur = new FileCursor(tks, st);
    return f(cur, st);
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Parsing Tests', () => {

    // ─── parse_return_command ─────────────────────────────────────────────────
    describe('parse_return_command', () => {
        it('returns a CommandStatement with Return token', () => {
            const stmt = parseWith('Return x\n', parse_return_command) as CommandStatement;
            assert.strictEqual(stmt.type, StatementKind.CommandStatement);
            assert.strictEqual(stmt.tk.type, TokenKind.ReturnStatement);
        });

        it('expression is parsed after Return', () => {
            const stmt = parseWith('Return x + 1\n', parse_return_command) as CommandStatement;
            assert.ok(stmt.expression, 'expected expression');
            assert.strictEqual((stmt.expression as BinaryOp).code, OpCode.ADD);
        });

        it('Return with no expression yields null expression', () => {
            const stmt = parseWith('Return\n', parse_return_command) as CommandStatement;
            assert.strictEqual(stmt.expression, null);
        });
    });

    // ─── parse_wait_command ───────────────────────────────────────────────────
    describe('parse_wait_command', () => {
        it('returns a CommandStatement with Wait token', () => {
            const stmt = parseWith('Wait 5\n', parse_wait_command) as CommandStatement;
            assert.strictEqual(stmt.type, StatementKind.CommandStatement);
            assert.strictEqual(stmt.tk.type, TokenKind.WaitStatement);
        });

        it('expression is parsed after Wait', () => {
            const stmt = parseWith('Wait x\n', parse_wait_command) as CommandStatement;
            assert.ok(stmt.expression, 'expected expression');
            // x is parsed as a VariableInst (identifier)
            assert.strictEqual((stmt.expression as VariableInst).name, 'x');
        });
    });

    // ─── parse_while_statement ────────────────────────────────────────────────
    describe('parse_while_statement', () => {
        it('parses a simple while loop', () => {
            const stmt = parseWith(
                'While x < 10\n  x = x + 1\nEndWhile\n',
                parse_while_statement
            ) as WhileStatement;
            assert.strictEqual(stmt.type, StatementKind.WhileStatement);
            assert.ok(stmt.condition, 'expected condition');
            assert.strictEqual(stmt.statements.length, 1);
        });

        it('missing EndWhile generates an error', () => {
            const st = new SymbolTable();
            parseWith('While x < 10\n  x = x + 1\n', parse_while_statement, st);
            assert.ok(st.errors.some(e => e.id === EboErrors.WhileMissingEndWhile),
                'expected WhileMissingEndWhile error');
        });

        it('goto inside while generates GotoInLoop error', () => {
            const st = new SymbolTable();
            parseWith(
                'While x < 10\n  Goto done\n  x = x + 1\nEndWhile\n',
                parse_while_statement, st
            );
            assert.ok(st.errors.some(e => e.id === EboErrors.GotoInLoop),
                'expected GotoInLoop error');
        });

        it('basedOn inside while generates GotoInLoop error', () => {
            const st = new SymbolTable();
            parseWith(
                'While x < 10\n  BasedOn x Goto a, b\nEndWhile\n',
                parse_while_statement, st
            );
            assert.ok(st.errors.some(e => e.id === EboErrors.GotoInLoop),
                'expected GotoInLoop error for BasedOn in while');
        });

        it('while loop body is accessible as statements', () => {
            const stmt = parseWith(
                'While x > 0\n  y = x\n  x = x - 1\nEndWhile\n',
                parse_while_statement
            ) as WhileStatement;
            // y=x and x=x-1 are consecutive — grouped into one AssignBlock
            assert.strictEqual(stmt.statements.length, 1);
        });
    });

    // ─── parse_repeat_statement ───────────────────────────────────────────────
    describe('parse_repeat_statement', () => {
        it('missing Until generates an error', () => {
            const st = new SymbolTable();
            parseWith('Repeat\n  x = x + 1\n', parse_repeat_statement, st);
            assert.ok(st.errors.some(e => e.id === EboErrors.RepeatStatementMissingUntil),
                'expected RepeatStatementMissingUntil error');
        });
    });

    // ─── stop / close / shut / open / start / enable / disable ───────────────
    describe('stop and start assignments via parse_statement', () => {
        it('Stop alone returns a CommandExpr token', () => {
            const stmt = parseWith('Stop\n', parse_statement);
            assert.ok(stmt !== null, 'expected a statement');
            // Stop alone produces the raw LexToken (CommandExpr), not an AssignStatement
            assert.strictEqual((stmt as LexToken).type, TokenKind.StopStatement);
        });

        it('Stop with target returns an AssignStatement with Off expression', () => {
            const stmt = parseWith('Stop x\n', parse_statement) as AssignStatement;
            assert.ok(stmt instanceof AssignStatement);
            assert.strictEqual(stmt.assigned.length, 1);
            assert.strictEqual(stmt.assigned[0].name, 'x');
            assert.strictEqual((stmt.expression as LexToken).type, TokenKind.OnValue);
            assert.strictEqual((stmt.expression as LexToken).value, 'Off');
        });

        it('Close assigns Off to target', () => {
            const stmt = parseWith('Close x\n', parse_statement) as AssignStatement;
            assert.ok(stmt instanceof AssignStatement);
            assert.strictEqual(stmt.assigned[0].name, 'x');
            assert.strictEqual((stmt.expression as LexToken).value, 'Off');
        });

        it('Shut assigns Off to target', () => {
            const stmt = parseWith('Shut x\n', parse_statement) as AssignStatement;
            assert.ok(stmt instanceof AssignStatement);
            assert.strictEqual((stmt.expression as LexToken).value, 'Off');
        });

        it('Disable assigns Off to target', () => {
            const stmt = parseWith('Disable x\n', parse_statement) as AssignStatement;
            assert.ok(stmt instanceof AssignStatement);
            assert.strictEqual((stmt.expression as LexToken).value, 'Off');
        });

        it('Open assigns On to target', () => {
            const stmt = parseWith('Open x\n', parse_statement) as AssignStatement;
            assert.ok(stmt instanceof AssignStatement);
            assert.strictEqual((stmt.expression as LexToken).value, 'On');
        });

        it('Start assigns On to target', () => {
            const stmt = parseWith('Start x\n', parse_statement) as AssignStatement;
            assert.ok(stmt instanceof AssignStatement);
            assert.strictEqual((stmt.expression as LexToken).value, 'On');
        });

        it('Enable assigns On to target', () => {
            const stmt = parseWith('Enable x\n', parse_statement) as AssignStatement;
            assert.ok(stmt instanceof AssignStatement);
            assert.strictEqual((stmt.expression as LexToken).value, 'On');
        });
    });

    // ─── check_lines_valid_and_used (via ebo_parse_file) ─────────────────────
    describe('line validation (via ebo_parse_file)', () => {
        it('goto to undefined line generates UndefinedLine error', () => {
            const st = ebo_parse_file('Goto missing\n');
            assert.ok(st.errors.some(e => e.id === EboErrors.UndefinedLine),
                'expected UndefinedLine error');
        });

        it('defined line that is never referenced generates UnreferencedLine warning', () => {
            // Two labels: 'used' is referenced (and is line_names[0]), 'notused' is not
            const st = ebo_parse_file('Numeric x\nNumeric y\nGoto used\nused:\n  x = 1\nnotused:\n  y = 2\n');
            assert.ok(st.errors.some(e => e.id === EboErrors.UnreferencedLine),
                'expected UnreferencedLine warning');
        });

        it('defined line that is referenced generates no line errors', () => {
            const st = ebo_parse_file('Numeric x\nGoto used\nused:\n  x = 1\n');
            assert.ok(!st.errors.some(
                e => e.id === EboErrors.UndefinedLine || e.id === EboErrors.UnreferencedLine
            ), 'expected no line errors');
        });

        it('first line label is exempt from UnreferencedLine warning', () => {
            // Only one label — it is line_names[0] so exempt
            const st = ebo_parse_file('Numeric x\nfirst:\n  x = 1\n');
            assert.ok(!st.errors.some(e => e.id === EboErrors.UnreferencedLine),
                'first line should not trigger UnreferencedLine');
        });

        it('line named E is exempt from UnreferencedLine warning', () => {
            // E is treated as an error-handler line and never flagged
            const st = ebo_parse_file('Numeric x\nGoto used\nused:\n  x = 1\nE:\n  x = 0\n');
            assert.ok(!st.errors.some(e => e.id === EboErrors.UnreferencedLine),
                'line E should not trigger UnreferencedLine');
        });
    });

    // ─── check_declarations_used (via ebo_parse_file) ─────────────────────────
    describe('declaration usage checks (via ebo_parse_file)', () => {
        it('unused variable generates UnreferencedDeclaration info', () => {
            const st = ebo_parse_file('Numeric x\n');
            assert.ok(st.errors.some(e => e.id === EboErrors.UnreferencedDeclaration),
                'expected UnreferencedDeclaration for unused variable');
        });

        it('used variable generates no UnreferencedDeclaration', () => {
            const st = ebo_parse_file('Numeric x\nx = 1\n');
            assert.ok(!st.errors.some(e => e.id === EboErrors.UnreferencedDeclaration),
                'used variable should not trigger UnreferencedDeclaration');
        });

        it('unused function declaration generates UnreferencedFunction info', () => {
            const st = ebo_parse_file('Function myFn\nNumeric x\nx = 1\n');
            assert.ok(st.errors.some(e => e.id === EboErrors.UnreferencedFunction),
                'expected UnreferencedFunction for unused function');
        });

        it('unused parameter generates UnreferencedDeclaration info', () => {
            // Declare two args; only use one — the unused one should be flagged
            const st = ebo_parse_file('Arg 1 x\nNumeric n\nReturn x\n');
            assert.ok(st.errors.some(e => e.id === EboErrors.UnreferencedDeclaration),
                'expected UnreferencedDeclaration for unused variable n');
        });
    });

    // ─── expression: additional edge cases ───────────────────────────────────
    describe('expression edge cases', () => {
        it('unary negation of a number', () => {
            const exp = parseWith('-1\n', expression);
            // unary minus: the result wraps into a UnaryOp or is a negative token
            assert.ok(exp !== null, 'expected an expression');
        });

        it('nested parentheses', () => {
            const exp = parseWith('((x + 1))\n', expression) as LexToken;
            assert.ok(exp !== null);
        });

        it('binary operator precedence: * before +', () => {
            const exp = parseWith('a + b * c\n', expression) as BinaryOp;
            assert.ok(exp !== null);
            assert.strictEqual(exp.code, OpCode.ADD, 'top-level operator should be +');
            assert.strictEqual((exp.exp2 as BinaryOp).code, OpCode.MLT, 'rhs should be *');
        });

        it('chained binary operators left-to-right', () => {
            const exp = parseWith('a + b + c\n', expression) as BinaryOp;
            assert.ok(exp !== null);
            assert.strictEqual(exp.code, OpCode.ADD);
        });
    });

    // ─── parse_program: additional cases ─────────────────────────────────────
    describe('parse_program additional cases', () => {
        it('empty program has no lines and no errors', () => {
            const st = new SymbolTable();
            const pgm = parseWith('\n', parse_program, st);
            assert.strictEqual(pgm.lines.length, 0);
            assert.strictEqual(st.errors.length, 0);
        });

        it('program with only declarations has correct type', () => {
            const st = new SymbolTable();
            const pgm = parseWith('Numeric x\nNumeric y\n', parse_program, st);
            assert.strictEqual(pgm.type, ProgramType.Program);
        });

        it('initial statements before first line label are captured', () => {
            const st = new SymbolTable();
            const pgm = parseWith('x = 1\nfirst:\n  y = 2\n', parse_program, st);
            // initial line + named line
            assert.strictEqual(pgm.lines.length, 2);
            assert.strictEqual(pgm.lines[0].name, '');
        });

        it('multiple named lines are all captured', () => {
            const st = new SymbolTable();
            const pgm = parseWith(
                'Goto a\na:\n  x = 1\nb:\n  y = 2\n',
                parse_program, st
            );
            assert.strictEqual(pgm.lines.length, 3); // initial + a + b
            assert.strictEqual(pgm.lines[1].name, 'a');
            assert.strictEqual(pgm.lines[2].name, 'b');
        });
    });

    // ─── keyword used as line name ────────────────────────────────────────────
    describe('keyword used as line name', () => {

        it('Goto with a keyword target emits KeywordUsedAsLineName warning', () => {
            const result = ebo_parse_file('Goto DST\n');
            const warns = result.errors.filter(e => e.id === EboErrors.KeywordUsedAsLineName);
            assert.equal(1, warns.length, 'expected KeywordUsedAsLineName warning');
        });

        it('Goto with a keyword target does NOT emit UndefinedLine', () => {
            const result = ebo_parse_file('Goto DST\n');
            const undef = result.errors.filter(e => e.id === EboErrors.UndefinedLine);
            assert.equal(0, undef.length, 'should not emit UndefinedLine for keyword goto target');
        });

        it('keyword line label emits KeywordUsedAsLineName warning', () => {
            const result = ebo_parse_file('DST:\n');
            const warns = result.errors.filter(e => e.id === EboErrors.KeywordUsedAsLineName);
            assert.equal(1, warns.length, 'expected KeywordUsedAsLineName warning for keyword label');
        });

        it('keyword line label is still registered so a matching Goto does not error', () => {
            const result = ebo_parse_file('Goto DST\nDST:\n');
            const undef = result.errors.filter(e => e.id === EboErrors.UndefinedLine);
            assert.equal(0, undef.length, 'keyword label should be declared so Goto resolves it');
        });

        it('keyword label and Goto each emit exactly one KeywordUsedAsLineName warning', () => {
            const result = ebo_parse_file('Goto DST\nDST:\n');
            const warns = result.errors.filter(e => e.id === EboErrors.KeywordUsedAsLineName);
            assert.equal(2, warns.length, 'expected one warning at Goto and one at the label');
        });

        it('a normal identifier label emits no KeywordUsedAsLineName warning', () => {
            const result = ebo_parse_file('Goto myLine\nmyLine:\n');
            const warns = result.errors.filter(e => e.id === EboErrors.KeywordUsedAsLineName);
            assert.equal(0, warns.length, 'normal identifier label should not warn');
        });

        it('another keyword (ON) used as goto target also warns', () => {
            const result = ebo_parse_file('Goto ON\n');
            const warns = result.errors.filter(e => e.id === EboErrors.KeywordUsedAsLineName);
            assert.equal(1, warns.length, 'expected KeywordUsedAsLineName for Goto ON');
        });

    });

    // ─── variable name used as line label / goto target ───────────────────────
    describe('variable name used as line name', () => {

        it('declaring a line with a variable name emits VariableUsedAsLineName', () => {
            const result = ebo_parse_file('Numeric myVar\nmyVar:\n');
            const errs = result.errors.filter(e => e.id === EboErrors.VariableUsedAsLineName);
            assert.equal(1, errs.length, 'expected VariableUsedAsLineName error');
        });

        it('declaring a line with a variable name does NOT emit DuplicateLine', () => {
            const result = ebo_parse_file('Numeric myVar\nmyVar:\n');
            const dups = result.errors.filter(e => e.id === EboErrors.DuplicateLine);
            assert.equal(0, dups.length, 'should not emit DuplicateLine when name is a variable');
        });

        it('Goto targeting a declared variable emits VariableUsedAsLineName', () => {
            const result = ebo_parse_file('Numeric myVar\nGoto myVar\n');
            const errs = result.errors.filter(e => e.id === EboErrors.VariableUsedAsLineName);
            assert.equal(1, errs.length, 'expected VariableUsedAsLineName for Goto to variable');
        });

        it('Goto targeting a declared variable does NOT emit UndefinedLine', () => {
            const result = ebo_parse_file('Numeric myVar\nGoto myVar\n');
            const undef = result.errors.filter(e => e.id === EboErrors.UndefinedLine);
            assert.equal(0, undef.length, 'should not emit UndefinedLine when name is a variable');
        });

        it('true duplicate line label still emits DuplicateLine', () => {
            const result = ebo_parse_file('myLine:\nmyLine:\n');
            const dups = result.errors.filter(e => e.id === EboErrors.DuplicateLine);
            assert.equal(1, dups.length, 'expected DuplicateLine for genuinely duplicate line label');
        });

        it('normal variable usage alongside a different line label has no errors', () => {
            const result = ebo_parse_file('Numeric myVar\nmyLine:\nmyVar = 1\nGoto myLine\n');
            const errs = result.errors.filter(e =>
                e.id === EboErrors.VariableUsedAsLineName ||
                e.id === EboErrors.UndefinedLine ||
                e.id === EboErrors.DuplicateLine
            );
            assert.equal(0, errs.length, 'no name-clash errors for properly separate names');
        });

        it('variable and line sharing a name emits no DuplicateDeclaration and no UndeclaredVariable', () => {
            const result = ebo_parse_file('Numeric myVar\nmyVar:\nmyVar = 1\n');
            const dups = result.errors.filter(e => e.id === EboErrors.DuplicateDeclaration);
            assert.equal(0, dups.length, 'no DuplicateDeclaration when variable and line share a name');
            const undef = result.errors.filter(e => e.id === EboErrors.UndeclaredVariable);
            assert.equal(0, undef.length, 'no UndeclaredVariable when variable and line share a name');
        });

        it('variable and line sharing a name emits VariableUsedAsLineName as Information', () => {
            const result = ebo_parse_file('Numeric myVar\nmyVar:\n');
            const info = result.errors.filter(e =>
                e.id === EboErrors.VariableUsedAsLineName && e.severity === Severity.Information
            );
            assert.equal(1, info.length, 'VariableUsedAsLineName should be Information severity');
        });

    });

});
