import * as assert from 'assert';
import {
    TokenKind,
    isFunctionKind,
    isOperatorKind,
    isValueKind,
    isVariableKind,
    isSymbolKind,
    isKeyword,
    isUnaryOperator,
} from '../ebo-types';

describe('ebo-types predicate tests', () => {

    describe('isFunctionKind', () => {
        it('returns true for AbsFunction', () => {
            assert.ok(isFunctionKind(TokenKind.AbsFunction));
        });

        it('returns true for SqrtFunction', () => {
            assert.ok(isFunctionKind(TokenKind.SqrtFunction));
        });

        it('returns true for LengthFunction', () => {
            assert.ok(isFunctionKind(TokenKind.LengthFunction));
        });

        it('returns true for StrToDateFunction', () => {
            assert.ok(isFunctionKind(TokenKind.StrToDateFunction));
        });

        it('returns true for DiffTimeFunction', () => {
            assert.ok(isFunctionKind(TokenKind.DiffTimeFunction));
        });

        it('returns true for FirstFunction (boundary)', () => {
            assert.ok(isFunctionKind(TokenKind.FirstFunction));
        });

        it('returns true for LastFunction (boundary)', () => {
            assert.ok(isFunctionKind(TokenKind.LastFunction));
        });

        it('returns false for IdentifierToken', () => {
            assert.ok(!isFunctionKind(TokenKind.IdentifierToken));
        });

        it('returns false for NumberToken', () => {
            assert.ok(!isFunctionKind(TokenKind.NumberToken));
        });

        it('returns false for EqualsSymbol', () => {
            assert.ok(!isFunctionKind(TokenKind.EqualsSymbol));
        });

        it('returns false for IfStatement', () => {
            assert.ok(!isFunctionKind(TokenKind.IfStatement));
        });
    });

    describe('isValueKind', () => {
        it('returns true for OnValue', () => {
            assert.ok(isValueKind(TokenKind.OnValue));
        });

        it('returns true for OffValue', () => {
            assert.ok(isValueKind(TokenKind.OffValue));
        });

        it('returns true for NullValue', () => {
            assert.ok(isValueKind(TokenKind.NullValue));
        });

        it('returns true for TrueValue', () => {
            assert.ok(isValueKind(TokenKind.TrueValue));
        });

        it('returns true for FalseValue', () => {
            assert.ok(isValueKind(TokenKind.FalseValue));
        });

        it('returns true for JanuaryValue', () => {
            assert.ok(isValueKind(TokenKind.JanuaryValue));
        });

        it('returns true for SundayValue', () => {
            assert.ok(isValueKind(TokenKind.SundayValue));
        });

        it('returns true for FirstValue (boundary)', () => {
            assert.ok(isValueKind(TokenKind.FirstValue));
        });

        it('returns true for LastValue (boundary)', () => {
            assert.ok(isValueKind(TokenKind.LastValue));
        });

        it('returns false for IdentifierToken', () => {
            assert.ok(!isValueKind(TokenKind.IdentifierToken));
        });

        it('returns false for NumberToken', () => {
            assert.ok(!isValueKind(TokenKind.NumberToken));
        });

        it('returns false for PlusSymbol', () => {
            assert.ok(!isValueKind(TokenKind.PlusSymbol));
        });
    });

    describe('isVariableKind', () => {
        it('returns true for TsVariable', () => {
            assert.ok(isVariableKind(TokenKind.TsVariable));
        });

        it('returns true for DateVariable', () => {
            assert.ok(isVariableKind(TokenKind.DateVariable));
        });

        it('returns true for TmVariable', () => {
            assert.ok(isVariableKind(TokenKind.TmVariable));
        });

        it('returns true for YearVariable', () => {
            assert.ok(isVariableKind(TokenKind.YearVariable));
        });

        it('returns true for FirstVariable (boundary)', () => {
            assert.ok(isVariableKind(TokenKind.FirstVariable));
        });

        it('returns true for LastVariable (boundary)', () => {
            assert.ok(isVariableKind(TokenKind.LastVariable));
        });

        it('returns false for IdentifierToken', () => {
            assert.ok(!isVariableKind(TokenKind.IdentifierToken));
        });

        it('returns false for NumberToken', () => {
            assert.ok(!isVariableKind(TokenKind.NumberToken));
        });

        it('returns false for AbsFunction', () => {
            assert.ok(!isVariableKind(TokenKind.AbsFunction));
        });
    });

    describe('isSymbolKind', () => {
        it('returns true for PlusSymbol', () => {
            assert.ok(isSymbolKind(TokenKind.PlusSymbol));
        });

        it('returns true for MinusSymbol', () => {
            assert.ok(isSymbolKind(TokenKind.MinusSymbol));
        });

        it('returns true for EqualsSymbol', () => {
            assert.ok(isSymbolKind(TokenKind.EqualsSymbol));
        });

        it('returns true for FirstSymbol (boundary)', () => {
            assert.ok(isSymbolKind(TokenKind.FirstSymbol));
        });

        it('returns true for LastSymbol (boundary)', () => {
            assert.ok(isSymbolKind(TokenKind.LastSymbol));
        });

        it('returns false for IdentifierToken', () => {
            assert.ok(!isSymbolKind(TokenKind.IdentifierToken));
        });

        it('returns false for NumberToken', () => {
            assert.ok(!isSymbolKind(TokenKind.NumberToken));
        });

        it('returns false for IfStatement', () => {
            assert.ok(!isSymbolKind(TokenKind.IfStatement));
        });
    });

    describe('isOperatorKind', () => {
        it('returns true for AndOperator', () => {
            assert.ok(isOperatorKind(TokenKind.AndOperator));
        });

        it('returns true for OrOperator', () => {
            assert.ok(isOperatorKind(TokenKind.OrOperator));
        });

        it('returns true for NotOperator', () => {
            assert.ok(isOperatorKind(TokenKind.NotOperator));
        });

        it('returns true for AboveOperator', () => {
            assert.ok(isOperatorKind(TokenKind.AboveOperator));
        });

        it('returns true for FirstOperator (boundary)', () => {
            assert.ok(isOperatorKind(TokenKind.FirstOperator));
        });

        it('returns true for LastOperator (boundary)', () => {
            assert.ok(isOperatorKind(TokenKind.LastOperator));
        });

        it('returns false for IdentifierToken', () => {
            assert.ok(!isOperatorKind(TokenKind.IdentifierToken));
        });

        it('returns false for PlusSymbol', () => {
            assert.ok(!isOperatorKind(TokenKind.PlusSymbol));
        });
    });

    describe('isKeyword', () => {
        it('returns true for IfStatement', () => {
            assert.ok(isKeyword(TokenKind.IfStatement));
        });

        it('returns true for NumericDeclaration', () => {
            assert.ok(isKeyword(TokenKind.NumericDeclaration));
        });

        it('returns true for OnValue', () => {
            assert.ok(isKeyword(TokenKind.OnValue));
        });

        it('returns true for AbsFunction', () => {
            assert.ok(isKeyword(TokenKind.AbsFunction));
        });

        it('returns false for IdentifierToken', () => {
            assert.ok(!isKeyword(TokenKind.IdentifierToken));
        });

        it('returns false for NumberToken', () => {
            assert.ok(!isKeyword(TokenKind.NumberToken));
        });

        it('returns false for ErrorToken', () => {
            assert.ok(!isKeyword(TokenKind.ErrorToken));
        });

        it('returns false for Unknown', () => {
            assert.ok(!isKeyword(TokenKind.Unknown));
        });
    });

    describe('isUnaryOperator', () => {
        it('returns true for NotOperator', () => {
            assert.ok(isUnaryOperator(TokenKind.NotOperator));
        });

        it('returns true for BitnotOperator', () => {
            assert.ok(isUnaryOperator(TokenKind.BitnotOperator));
        });

        it('returns true for MinusSymbol (unary minus)', () => {
            assert.ok(isUnaryOperator(TokenKind.MinusSymbol));
        });

        it('returns true for PlusSymbol (unary plus)', () => {
            assert.ok(isUnaryOperator(TokenKind.PlusSymbol));
        });

        it('returns true for PercentSymbol', () => {
            assert.ok(isUnaryOperator(TokenKind.PercentSymbol));
        });

        it('returns false for AndOperator', () => {
            assert.ok(!isUnaryOperator(TokenKind.AndOperator));
        });

        it('returns false for AsteriskSymbol', () => {
            assert.ok(!isUnaryOperator(TokenKind.AsteriskSymbol));
        });

        it('returns false for IdentifierToken', () => {
            assert.ok(!isUnaryOperator(TokenKind.IdentifierToken));
        });
    });

    describe('TokenKind range marker consistency', () => {
        it('FirstSymbol <= LastSymbol', () => {
            assert.ok(TokenKind.FirstSymbol <= TokenKind.LastSymbol);
        });

        it('FirstValue <= LastValue', () => {
            assert.ok(TokenKind.FirstValue <= TokenKind.LastValue);
        });

        it('FirstVariable <= LastVariable', () => {
            assert.ok(TokenKind.FirstVariable <= TokenKind.LastVariable);
        });

        it('FirstFunction <= LastFunction', () => {
            assert.ok(TokenKind.FirstFunction <= TokenKind.LastFunction);
        });

        it('FirstOperator <= LastOperator', () => {
            assert.ok(TokenKind.FirstOperator <= TokenKind.LastOperator);
        });

        it('ranges do not overlap: symbols below values', () => {
            assert.ok(TokenKind.LastSymbol < TokenKind.FirstValue);
        });

        it('ranges do not overlap: values below variables', () => {
            assert.ok(TokenKind.LastValue < TokenKind.FirstVariable);
        });

        it('ranges do not overlap: variables below functions', () => {
            assert.ok(TokenKind.LastVariable < TokenKind.FirstFunction);
        });
    });
});
