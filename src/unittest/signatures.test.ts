import * as assert from 'assert';
import { Signatures, get, VarType } from '../ebo-signatures';

describe('Signatures Tests', () => {

    describe('Signatures map structure', () => {

        it('every entry has a non-empty description', () => {
            for (const [name, sig] of Object.entries(Signatures)) {
                assert.ok(sig, `${name} entry is undefined`);
                assert.ok(sig!.description && sig!.description.length > 0,
                    `${name} missing description`);
            }
        });

        it('every entry has at least one syntax string', () => {
            for (const [name, sig] of Object.entries(Signatures)) {
                assert.ok(sig!.syntaxes && sig!.syntaxes.length > 0,
                    `${name} has no syntaxes`);
            }
        });

        it('returns field is a valid VarType when present', () => {
            const validReturnTypes = new Set([
                VarType.Null, VarType.DateTime, VarType.Numeric,
                VarType.NumericA, VarType.String, VarType.Variant, VarType.VarName,
            ]);
            for (const [name, sig] of Object.entries(Signatures)) {
                if (sig!.returns !== undefined) {
                    assert.ok(validReturnTypes.has(sig!.returns),
                        `${name} has invalid returns value ${sig!.returns}`);
                }
            }
        });

        it('signature argument arrays contain valid VarType values', () => {
            const validTypes = new Set([
                VarType.Null, VarType.DateTime, VarType.Numeric,
                VarType.NumericA, VarType.String, VarType.Variant, VarType.VarName,
            ]);
            for (const [name, sig] of Object.entries(Signatures)) {
                if (sig!.signatures) {
                    for (const overload of sig!.signatures) {
                        for (const argType of overload) {
                            assert.ok(validTypes.has(argType),
                                `${name} has invalid arg type ${argType}`);
                        }
                    }
                }
            }
        });

        it('all Signatures keys are uppercase', () => {
            for (const key of Object.keys(Signatures)) {
                assert.equal(key, key.toUpperCase(), `${key} is not uppercase`);
            }
        });
    });

    describe('specific known functions', () => {

        it('NUMTOSTR returns String', () => {
            assert.equal(VarType.String, Signatures.NUMTOSTR?.returns);
        });

        it('STRTODATE returns DateTime', () => {
            assert.equal(VarType.DateTime, Signatures.STRTODATE?.returns);
        });

        it('STRTONUM returns Numeric', () => {
            assert.equal(VarType.Numeric, Signatures.STRTONUM?.returns);
        });

        it('ABS returns Numeric', () => {
            assert.equal(VarType.Numeric, Signatures.ABS?.returns);
        });

        it('SQRT returns Numeric', () => {
            assert.equal(VarType.Numeric, Signatures.SQRT?.returns);
        });

        it('DIFFTIME returns Numeric', () => {
            assert.equal(VarType.Numeric, Signatures.DIFFTIME?.returns);
        });

        it('TIMEPIECE returns Numeric', () => {
            assert.equal(VarType.Numeric, Signatures.TIMEPIECE?.returns);
        });

        it('LENGTH / LEN returns Numeric', () => {
            assert.equal(VarType.Numeric, Signatures.LENGTH?.returns);
        });

        it('LEFT returns String', () => {
            assert.equal(VarType.String, Signatures.LEFT?.returns);
        });

        it('RIGHT returns String', () => {
            assert.equal(VarType.String, Signatures.RIGHT?.returns);
        });

        it('MID returns String', () => {
            assert.equal(VarType.String, Signatures.MID?.returns);
        });
    });

    describe('function aliases', () => {

        it('STRTOTIME is an alias for STRTODATE', () => {
            assert.strictEqual(Signatures.STRTODATE, Signatures['STRTOTIME'],
                'STRTOTIME should reference the same object as STRTODATE');
        });

        it('VAL is an alias for STRTONUM', () => {
            assert.strictEqual(Signatures.STRTONUM, Signatures['VAL']);
        });

        it('EXP is an alias for EXPONENTIAL', () => {
            assert.strictEqual(Signatures.EXPONENTIAL, Signatures['EXP']);
        });

        it('FACT is an alias for FACTORIAL', () => {
            assert.strictEqual(Signatures.FACTORIAL, Signatures['FACT']);
        });

        it('RND is an alias for RANDOM', () => {
            assert.strictEqual(Signatures.RANDOM, Signatures['RND']);
        });

        it('TRUNC is an alias for TRUNCATE', () => {
            assert.strictEqual(Signatures.TRUNCATE, Signatures['TRUNC']);
        });

        it('AVG is an alias for AVERAGE', () => {
            assert.strictEqual(Signatures.AVERAGE, Signatures['AVG']);
        });

        it('MAX is an alias for MAXIMUM', () => {
            assert.strictEqual(Signatures.MAXIMUM, Signatures['MAX']);
        });

        it('SD is an alias for STANDARDDEVIATION', () => {
            assert.strictEqual(Signatures.STANDARDDEVIATION, Signatures['SD']);
        });

        it('LEN is an alias for LENGTH', () => {
            assert.strictEqual(Signatures.LENGTH, Signatures['LEN']);
        });

        it('FIRST is an alias for LEFT', () => {
            assert.strictEqual(Signatures.LEFT, Signatures['FIRST']);
        });

        it('LAST is an alias for RIGHT', () => {
            assert.strictEqual(Signatures.RIGHT, Signatures['LAST']);
        });

        it('ARCCOSINE is an alias for ACOS', () => {
            assert.strictEqual(Signatures.ACOS, Signatures['ARCCOSINE']);
        });

        it('ARCSINE is an alias for ASIN', () => {
            assert.strictEqual(Signatures.ASIN, Signatures['ARCSINE']);
        });

        it('ARCTANGENT is an alias for ATAN', () => {
            assert.strictEqual(Signatures.ATAN, Signatures['ARCTANGENT']);
        });

        it('COSINE is an alias for COS', () => {
            assert.strictEqual(Signatures.COS, Signatures['COSINE']);
        });

        it('SINE is an alias for SIN', () => {
            assert.strictEqual(Signatures.SIN, Signatures['SINE']);
        });

        it('TANGENT is an alias for TAN', () => {
            assert.strictEqual(Signatures.TAN, Signatures['TANGENT']);
        });
    });

    describe('get() helper', () => {

        it('looks up a function by exact uppercase name', () => {
            const sig = get('ABS');
            assert.notEqual(undefined, sig);
            assert.equal(VarType.Numeric, sig?.returns);
        });

        it('is case-insensitive — lowercase', () => {
            const sig = get('abs');
            assert.notEqual(undefined, sig, 'get("abs") should find ABS');
        });

        it('is case-insensitive — mixed case', () => {
            const sig = get('Abs');
            assert.notEqual(undefined, sig, 'get("Abs") should find ABS');
        });

        it('returns undefined for unknown function', () => {
            const sig = get('NOTAFUNCTION');
            assert.equal(undefined, sig);
        });

        it('resolves alias via get()', () => {
            const direct = get('STRTODATE');
            const alias  = get('STRTOTIME');
            assert.strictEqual(direct, alias,
                'get("STRTOTIME") should equal get("STRTODATE")');
        });

        it('resolves LEN alias', () => {
            const direct = get('LENGTH');
            const alias  = get('len');
            assert.strictEqual(direct, alias);
        });
    });

    describe('ebo_check expr_type integration — function return types', () => {
        // These smoke-tests verify that the type information fed into
        // expr_type() in ebo-check.ts comes from correct Signatures entries.

        it('DIFFTIME signature returns Numeric (used in DateTime arithmetic check)', () => {
            assert.equal(VarType.Numeric, get('DIFFTIME')?.returns);
        });

        it('STRTODATE signature returns DateTime (for type assignment checks)', () => {
            assert.equal(VarType.DateTime, get('STRTODATE')?.returns);
        });

        it('NUMTOSTR signature returns String', () => {
            assert.equal(VarType.String, get('NUMTOSTR')?.returns);
        });
    });
});
