import * as assert from 'assert';
import { ebo_scan_text } from '../ebo-scanner';
import { TokenKind } from '../ebo-types';

// Helper: scan and drop whitespace / EOF tokens for cleaner assertions
function scan(text: string) {
    return ebo_scan_text(text).filter(t =>
        t.type !== TokenKind.WhitespaceToken &&
        t.type !== TokenKind.EndOfFileToken
    );
}

function scanAll(text: string) {
    return ebo_scan_text(text);
}

function types(text: string) {
    return scan(text).map(t => t.type);
}

function values(text: string) {
    return scan(text).map(t => t.value);
}

describe('Scanner Tests', () => {

    describe('numeric tokens', () => {
        it('scans an integer', () => {
            const tks = scan('42');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.NumberToken, tks[0].type);
            assert.equal('42', tks[0].value);
        });

        it('scans a decimal number', () => {
            const tks = scan('3.14');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.NumberToken, tks[0].type);
            assert.equal('3.14', tks[0].value);
        });

        it('scans a leading-dot decimal', () => {
            const tks = scan('.5');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.NumberToken, tks[0].type);
            assert.equal('.5', tks[0].value);
        });

        it('scans scientific notation', () => {
            const tks = scan('1.5e10');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.NumberToken, tks[0].type);
        });

        it('scans a percentage number', () => {
            const tks = scan('50%');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.NumberToken, tks[0].type);
            assert.equal('50%', tks[0].value);
        });

        it('scans zero', () => {
            const tks = scan('0');
            assert.equal(TokenKind.NumberToken, tks[0].type);
        });
    });

    describe('string tokens', () => {
        it('scans a quoted string', () => {
            const tks = scan('"hello"');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.StringToken, tks[0].type);
            assert.equal('"hello"', tks[0].value);
        });

        it('scans an empty string', () => {
            const tks = scan('""');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.StringToken, tks[0].type);
        });

        it('scans a string with a pipe-escaped quote', () => {
            const tks = scan('"|""');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.StringToken, tks[0].type);
        });
    });

    describe('time tokens', () => {
        it('scans HH:MM time', () => {
            const tks = scan('08:30');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.TimeToken, tks[0].type);
            assert.equal('08:30', tks[0].value);
        });

        it('scans H:MM time', () => {
            const tks = scan('9:00');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.TimeToken, tks[0].type);
        });

        it('scans 12-hour time with am', () => {
            const tks = scan('8:30 am');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.TimeToken, tks[0].type);
        });

        it('scans 12-hour time with pm', () => {
            const tks = scan('1:00pm');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.TimeToken, tks[0].type);
        });
    });

    describe('identifier and keyword tokens', () => {
        it('scans an identifier', () => {
            const tks = scan('myVar');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.IdentifierToken, tks[0].type);
            assert.equal('myVar', tks[0].value);
        });

        it('scans an identifier with underscores and digits', () => {
            const tks = scan('my_var_2');
            assert.equal(1, tks.length);
            assert.equal(TokenKind.IdentifierToken, tks[0].type);
        });

        it('keywords are case-insensitive', () => {
            const lower = scan('numeric');
            const upper = scan('NUMERIC');
            const mixed = scan('Numeric');
            assert.equal(TokenKind.NumericDeclaration, lower[0].type);
            assert.equal(TokenKind.NumericDeclaration, upper[0].type);
            assert.equal(TokenKind.NumericDeclaration, mixed[0].type);
        });

        it('scans DateTime keyword', () => {
            const tks = scan('DateTime');
            assert.equal(TokenKind.DatetimeDeclaration, tks[0].type);
        });

        it('scans If keyword', () => {
            const tks = scan('If');
            assert.equal(TokenKind.IfStatement, tks[0].type);
        });

        it('scans Then keyword', () => {
            const tks = scan('Then');
            assert.equal(TokenKind.ThenStatement, tks[0].type);
        });

        it('scans EndIf keyword', () => {
            const tks = scan('EndIf');
            assert.equal(TokenKind.EndIfStatement, tks[0].type);
        });

        it('scans For keyword', () => {
            const tks = scan('For');
            assert.equal(TokenKind.ForStatement, tks[0].type);
        });

        it('scans While keyword', () => {
            const tks = scan('While');
            assert.equal(TokenKind.WhileStatement, tks[0].type);
        });

        it('scans ON as OnValue', () => {
            const tks = scan('ON');
            assert.equal(TokenKind.OnValue, tks[0].type);
        });

        it('scans OFF as OffValue', () => {
            const tks = scan('OFF');
            assert.equal(TokenKind.OffValue, tks[0].type);
        });
    });

    describe('function call tokens', () => {
        it('recognises a function call (name followed by open paren)', () => {
            const tks = scan('ABS(');
            // ABS( → FunctionCallToken or AbsFunction + '('
            // Scanner emits FunctionCallToken for name-followed-by-paren if not in keyword map
            // For known functions it uses a keyword token
            assert.notEqual(TokenKind.IdentifierToken, tks[0].type);
        });

        it('identifier without paren is not a function call', () => {
            const tks = scan('myFunc');
            assert.equal(TokenKind.IdentifierToken, tks[0].type);
        });

        it('user-defined function call gets FunctionCallToken', () => {
            const tks = scan('myFunc(');
            assert.equal(TokenKind.FunctionCallToken, tks[0].type);
        });
    });

    describe('symbol tokens', () => {
        it('scans single-char symbols', () => {
            assert.equal(TokenKind.PlusSymbol, scan('+')[0].type);
            assert.equal(TokenKind.MinusSymbol, scan('-')[0].type);
            assert.equal(TokenKind.AsteriskSymbol, scan('*')[0].type);
            assert.equal(TokenKind.SlashSymbol, scan('/')[0].type);
            assert.equal(TokenKind.EqualsSymbol, scan('=')[0].type);
            assert.equal(TokenKind.CommaSymbol, scan(',')[0].type);
        });

        it('scans two-char comparison symbols', () => {
            assert.equal(TokenKind.LessThanEqualSymbol, scan('<=')[0].type);
            assert.equal(TokenKind.GreaterThanEqualSymbol, scan('>=')[0].type);
            assert.equal(TokenKind.NotEqualSymbol, scan('<>')[0].type);
        });

        it('scans bracket symbols', () => {
            assert.equal(TokenKind.BracketLeftSymbol, scan('[')[0].type);
            assert.equal(TokenKind.BracketRightSymbol, scan(']')[0].type);
        });

        it('scans parenthesis symbols', () => {
            assert.equal(TokenKind.ParenthesesLeftSymbol, scan('(')[0].type);
            assert.equal(TokenKind.ParenthesesRightSymbol, scan(')')[0].type);
        });

        it('scans colon symbol', () => {
            assert.equal(TokenKind.ColonSymbol, scan(':')[0].type);
        });
    });

    describe('comment tokens', () => {
        it('scans a line comment', () => {
            const tks = scanAll("' this is a comment\n");
            const comment = tks.find(t => t.type === TokenKind.CommentToken);
            assert.notEqual(undefined, comment);
            assert.equal("' this is a comment", comment!.value);
        });

        it('comment after code produces a CommentToken', () => {
            const tks = scanAll("x = 1 ' set x");
            const comment = tks.find(t => t.type === TokenKind.CommentToken);
            assert.notEqual(undefined, comment, 'expected a CommentToken');
            assert.ok(comment!.value.startsWith("'"));
        });
    });

    describe('whitespace and line tokens', () => {
        it('produces EndOfLineToken for newline', () => {
            const tks = scanAll('x\n');
            const eol = tks.find(t => t.type === TokenKind.EndOfLineToken);
            assert.notEqual(undefined, eol);
        });

        it('produces WhitespaceToken for spaces', () => {
            const tks = scanAll('x y');
            const ws = tks.find(t => t.type === TokenKind.WhitespaceToken);
            assert.notEqual(undefined, ws);
        });

        it('produces ContinueLineToken for ~ at end of line', () => {
            const tks = scanAll('x ~\ny');
            const cont = tks.find(t => t.type === TokenKind.ContinueLineToken);
            assert.notEqual(undefined, cont);
        });
    });

    describe('line and range tracking', () => {
        it('tokens on the first line have line=0', () => {
            const tks = scan('x = 1');
            tks.forEach(t => assert.equal(0, t.range.line, `token '${t.value}' should be on line 0`));
        });

        it('tokens after a newline have line=1', () => {
            const tks = scanAll('x\ny');
            const y = tks.find(t => t.value === 'y');
            assert.equal(1, y!.range.line);
        });

        it('begin/end track column positions', () => {
            const tks = scan('abc');
            assert.equal(0, tks[0].range.begin);
            assert.equal(3, tks[0].range.end);
        });

        it('second token has correct column begin', () => {
            const tks = scan('ab cd');
            assert.equal(0, tks[0].range.begin);
            assert.equal(3, tks[1].range.begin);
        });
    });

    describe('system variables', () => {
        it('DATE is a DateVariable', () => {
            const tks = scan('DATE');
            assert.equal(TokenKind.DateVariable, tks[0].type);
        });

        it('TIME is a DateVariable', () => {
            const tks = scan('TIME');
            assert.equal(TokenKind.DateVariable, tks[0].type);
        });

        it('TS is a TsVariable', () => {
            const tks = scan('TS');
            assert.equal(TokenKind.TsVariable, tks[0].type);
        });
    });

    describe('error token', () => {
        it('produces ErrorToken for unrecognised characters', () => {
            const tks = scan('@');
            assert.equal(TokenKind.ErrorToken, tks[0].type);
        });
    });

    describe('multi-token expressions', () => {
        it('scans assignment expression', () => {
            const tks = scan('myVar = 42');
            assert.equal(3, tks.length);
            assert.equal(TokenKind.IdentifierToken, tks[0].type);
            assert.equal(TokenKind.EqualsSymbol, tks[1].type);
            assert.equal(TokenKind.NumberToken, tks[2].type);
        });

        it('scans arithmetic expression', () => {
            const t = types('a + b * 2');
            assert.deepEqual([
                TokenKind.IdentifierToken,
                TokenKind.PlusSymbol,
                TokenKind.IdentifierToken,
                TokenKind.AsteriskSymbol,
                TokenKind.NumberToken,
            ], t);
        });

        it('scans multi-line program fragment', () => {
            const text = 'Numeric n\nn = 1\n';
            const tks = scanAll(text).filter(t =>
                t.type !== TokenKind.WhitespaceToken
            );
            const kinds = tks.map(t => t.type);
            assert.ok(kinds.includes(TokenKind.NumericDeclaration));
            assert.ok(kinds.includes(TokenKind.IdentifierToken));
            assert.ok(kinds.includes(TokenKind.EqualsSymbol));
            assert.ok(kinds.includes(TokenKind.NumberToken));
        });
    });

    describe('ebo_scan_text robustness', () => {
        it('handles empty string', () => {
            const tks = ebo_scan_text('');
            assert.ok(Array.isArray(tks));
        });

        it('handles string with only whitespace', () => {
            const tks = ebo_scan_text('   \n  ');
            assert.ok(Array.isArray(tks));
        });

        it('handles string with only a comment', () => {
            const tks = ebo_scan_text("' just a comment\n");
            assert.ok(Array.isArray(tks));
            const comment = tks.find(t => t.type === TokenKind.CommentToken);
            assert.notEqual(undefined, comment);
        });
    });
});
