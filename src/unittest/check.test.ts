import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
import { FileCursor } from '../file-cursor';
import { SymbolTable, VariableDecl } from '../SymbolTable';
import { ebo_scan_text, LexToken } from '../ebo-scanner';
import {
	AssignStatement, BinaryOp, bracket_expression, expression,
	ExpressionList, for_exp, parse_goto,
	function_expression, IfStatement, IsOp, Op2Code, parse_declarations,
	parse_identifier, parse_if_exp, parse_line, parse_program, parse_select_exp,
	parse_statement, removeWhiteSpace, VariableInst
} from '../ebo-check';
import { TokenKind } from '../ebo-types';

function parseWith<T>(text: string, f: (cur: FileCursor, st: SymbolTable) => T, st: SymbolTable = new SymbolTable()): T {
	const tkn_lists = ebo_scan_text(text);
	const tks = removeWhiteSpace(tkn_lists);
	const cur = new FileCursor(tks, st);
	return f(cur, st);
}

describe('Check Tests', () => {
	describe('Declarations test', () => {
		it('should parse multiple declarations', () => {
			const st = new SymbolTable();
			const dec = parseWith(
				"Numeric Input Occupied, Standby\n\nSomeLine:",
				parse_declarations,
				st
			);
			assert.equal(2, dec.length);
			assert.equal("Occupied", dec[0].name);
			assert.equal("Standby", dec[1].name);
			assert.equal(0, st.errors.length);
		});
		it('should parse multiple lines of declarations', () => {
			const st = new SymbolTable();
			const dec = parseWith(
				"Numeric Input Occupied, Standby\nNumeric Output OutValue\nSomeLine:",
				parse_declarations,
				st
			);
			assert.equal(3, dec.length);
			assert.equal("Occupied", dec[0].name);
			assert.equal("Standby", dec[1].name);
			assert.equal("OutValue", dec[2].name);
			assert.equal(0, st.errors.length);
		});
		it('should end declaration parse on statement', () => {
			const st = new SymbolTable();
			const dec = parseWith(
				"Numeric Input Occupied, Standby\nNumeric Output OutValue\n\nOutValue = Occupied\n\n",
				parse_declarations,
				st,
			);
			assert.equal(3, dec.length);
			assert.equal("Occupied", dec[0].name);
			assert.equal("Standby", dec[1].name);
			assert.equal("OutValue", dec[2].name);
			// assert.equal("OutValue", cur.current().value);
			assert.equal(0, st.errors.length);
		});
		it('should parse local declarations with arrays', () => {
			const st = new SymbolTable();
			const dec = parseWith(
				"Numeric values[11], data[101], x\n\nSomeLine:",
				parse_declarations,
				st,
			);
			assert.equal(3, dec.length);
			assert.equal("values", dec[0].name);
			assert.equal(11, (dec[0] as VariableDecl).size);
			assert.equal("data", dec[1].name);
			assert.equal(101, (dec[1] as VariableDecl).size);
			assert.equal("x", dec[2].name);
			assert.equal(0, st.errors.length);
		});
		it('should generate errors on array declarations of non local variables', () => {
			const st = new SymbolTable();
			const dec = parseWith(
				"Numeric Input values[11], data[101], x\n\nSomeLine:",
				parse_declarations,
				st,
			);
			assert.equal(3, dec.length);
			assert.equal("values", dec[0].name);
			assert.equal(11, (dec[0] as VariableDecl).size);
			assert.equal("data", dec[1].name);
			assert.equal(101, (dec[1] as VariableDecl).size);
			assert.equal("x", dec[2].name);
			assert.equal(4, st.errors.length);
		});
	});
	describe('bracket_expression', () => {
		it('should read numbers array indexing', () => {
			const exp = parseWith(
				"[2] + x\n",
				bracket_expression,
			) as LexToken;
			assert.notEqual(null, exp);
			assert.equal(2, exp.value);
			assert.equal(TokenKind.NumberToken, exp.type);
		});
		it('should read variable array indexing', () => {
			const exp = parseWith(
				"[x] + x\n",
				bracket_expression,
			) as VariableInst;
			assert.notEqual(null, exp);
			assert.equal('x', exp.name);
			assert.equal(TokenKind.IdentifierToken, exp.token.type);
		});
	});
	describe('function calls', () => {
		it('should parse system functions with arguments', () => {
			const exp = parseWith(
				"Sum(1,2,3)\n",
				function_expression,
			);
			assert.notEqual(null, exp);
			assert.equal('Sum', exp.function.value);
			assert.equal(3, exp.arguments.length);
		});
		it('should parse system functions with expression arguments', () => {
			const exp = parseWith(
				"Sum(x + 1, y - 2, n * 3)\n",
				function_expression,
			);
			assert.notEqual(null, exp);
			assert.equal('Sum', exp.function.value);
			assert.equal(3, exp.arguments.length);
		});
		it('should parse defined functions with arguments', () => {
			const exp = parseWith(
				"Reset(1,2,3)\n",
				function_expression,
			);
			assert.notEqual(null, exp);
			assert.equal('Reset', exp.function.value);
			assert.equal(3, exp.arguments.length);
		});
		it('should parse defined functions with no arguments', () => {
			const exp = parseWith(
				"Reset()\n",
				function_expression,
			);
			assert.notEqual(null, exp);
			assert.equal('Reset', exp.function.value);
			assert.equal(0, exp.arguments.length);
		});
	});
	describe('parse_identifier', () => {
		it('should read non-keywords as variables', () => {
			const exp = parseWith(
				"test + x\n",
				parse_identifier,
			) as VariableInst;
			assert.notEqual(null, exp);
			assert.equal('test', exp.name);
			assert.equal(TokenKind.IdentifierToken, exp.token.type);
			assert.equal(undefined, exp.index);
		});
		it('should read variables with array indexing', () => {
			const exp = parseWith(
				"test[2] + x\n",
				parse_identifier,
			) as VariableInst;
			assert.notEqual(null, exp);
			assert.equal('test', exp.name);
			assert.notEqual(undefined, exp.index);
			assert.equal(2, (exp.index as LexToken).value);
			assert.equal(TokenKind.IdentifierToken, exp.token.type);
		});
	});
	describe('expression', () => {
		it('process numbers', () => {
			const exp = parseWith(
				"1\n",
				expression,
			) as LexToken;
			assert.notEqual(null, exp);
			assert.equal(1, exp.value);
			assert.equal(TokenKind.NumberToken, exp.type);
		});
		it('process strings', () => {
			const exp = parseWith(
				'"test"\n',
				expression,
			) as LexToken;
			assert.notEqual(null, exp);
			assert.equal('"test"', exp.value);
			assert.equal(TokenKind.StringToken, exp.type);
		});
		it('process variables', () => {
			const exp = parseWith(
				'SomeVar\n',
				expression,
			) as VariableInst;
			assert.notEqual(null, exp);
			assert.equal("SomeVar", exp.name);
			// assert.equal(TokenKind.IdentifierToken, exp.type);
		});
		it('process equations', () => {
			const exp = parseWith(
				'X + 1\n',
				expression,
			) as BinaryOp;
			assert.notEqual(null, exp);
			assert.equal("+", exp.op.value);
			assert.equal("X", (exp.exp1 as VariableInst).name);
			assert.equal("1", (exp.exp2 as LexToken).value);
		});
		it('process equations', () => {
			const exp = parseWith(
				'X * 2\n',
				expression,
			) as BinaryOp;
			assert.notEqual(null, exp);
			assert.equal("*", exp.op.value);
			assert.equal("X", (exp.exp1 as VariableInst).name);
			assert.equal("2", (exp.exp2 as LexToken).value);
		});
		it('process equations with system variables', () => {
			const exp = parseWith(
				'timer + Scan\n',
				expression,
			) as BinaryOp;
			assert.notEqual(null, exp);
			assert.equal("+", exp.op.value);
			assert.equal("timer", (exp.exp1 as VariableInst).name);
			assert.equal("Scan", (exp.exp2 as LexToken).value);
		});
		it('process equations with functions', () => {
			const exp = parseWith(
				'X + Sum(a,b,c)\n',
				expression,
			) as BinaryOp;
			assert.notEqual(null, exp);
			assert.equal("+", exp.op.value);
			assert.equal("X", (exp.exp1 as VariableInst).name);
		});
		it('process equations with functions', () => {
			const exp = parseWith(
				'Sum(v1,v2,v3) * Maximum(m1,m2,m3)\n',
				expression,
			) as BinaryOp;
			assert.notEqual(null, exp);
			assert.equal("*", exp.op.value);
		});
	});
	describe('Statements Parsing', () => {
		it('should parse single assignments', () => {
			const stmt = parseWith(
				"  x = 1",
				parse_statement,
			) as AssignStatement;
			if (!stmt) {
				assert.fail("expected return value");
			}
			assert.equal(1, stmt.assigned.length);
			assert.equal("x", stmt.assigned[0].name);
			assert.equal(1, (stmt.expression as LexToken).value);
		});
		it('should parse multiple assignments', () => {
			const lines = [
				"  x, y, z = 1",
				"  x[1], y[1], z[1] = 1",
				"  x and y and z = 1",
				"  x, y and z = 1",
				"  x and y, z = 1",
				"  x    ,  y  ,   z   =    1\n\n",
			];
			lines.forEach(line => {
				const stmt = parseWith(
					line,
					parse_statement,
				) as AssignStatement;
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal(3, stmt.assigned.length);
				assert.equal("x", stmt.assigned[0].name);
				assert.equal("y", stmt.assigned[1].name);
				assert.equal("z", stmt.assigned[2].name);
				assert.equal(1, (stmt.expression as LexToken).value);
			});
		});
		it('should parse multiple set assignments with comma and and', () => {
			const tests = [
				"  set x, y and z to 1\n\n",
				"  set the x, y and the z to 1\n\n",
				"  set the x, y and the z = 1\n\n",
				"  change x, y and the z = 1\n\n",
				"  adjust x, y and the z = 1\n\n",
				"  let x, y and the z = 1\n\n",
				"  let x[1], y[1] and the z[1] = 1\n\n",
			];
			tests.forEach(test => {
				const stmt = parseWith(
					test,
					parse_statement,
				) as AssignStatement;
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal(3, stmt.assigned.length);
				assert.equal("x", stmt.assigned[0].name);
				assert.equal("y", stmt.assigned[1].name);
				assert.equal("z", stmt.assigned[2].name);
				assert.equal(1, (stmt.expression as LexToken).value);
			});
		});
		it('should parse turn assignments', () => {
			const tests = [
				"turn x on",
				"turn the x on",
				"turn on x",
				"turn on the x"
			];
			tests.forEach(test => {
				const stmt = parseWith(
					test,
					parse_statement,
				) as AssignStatement;
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal(1, stmt.assigned.length);
				assert.equal("x", stmt.assigned[0].name);
				assert.equal('on', (stmt.expression as LexToken).value);
			});
		});
		it('should not parse line statements', () => {
			const tests = [
				"SomeLine:\n",
				"Line 1\n",
			];
			tests.forEach(test => {
				const stmt = parseWith(
					test,
					parse_statement,
				);
				assert.equal(null, stmt);
			});
		});
	});
	describe('Control Flow', () => {
		describe('Select Statements', () => {
			it('should parse simple select case', () => {
				const stmt = parseWith(
					`Select Case x
					Case 1
						y = 1
					Case 2
						y = 2
					EndSelect
					`,
					parse_select_exp,
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal('x', (stmt.test as VariableInst).name);
				if (!stmt.cases) {
					assert.fail("expected begin value");
				}
				assert.equal(2, stmt.cases.length);
				assert.equal(1, stmt.cases[0].statements.length);
				assert.equal(0, stmt.elseStatements.length);
			});
			it('should parse simple select case with bad case value', () => {
				const st = new SymbolTable();
				const stmt = parseWith(
					`Select Case x
					Case Something
						y = 1
					Case 2
						y = 2
					EndSelect
					`,
					parse_select_exp,
					st
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				if (!stmt.cases) {
					assert.fail("expected begin value");
				}
				assert.equal(2, stmt.cases.length);
				assert.equal(1, stmt.cases[0].statements.length);
				assert.equal(0, stmt.elseStatements.length);
			});

		});
		describe('For Statements', () => {
			it('should parse simple for next', () => {
				const stmt = parseWith(
					`For x = 1 to 10
						a[x] = x
					Next x
					`,
					for_exp,
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal('x', stmt.numeric_name.value);
				if (!stmt.begin) {
					assert.fail("expected begin value");
				}
				if (!stmt.end) {
					assert.fail("expected end value");
				}
				assert.equal('1', (stmt.begin as LexToken).value);
				assert.equal('10', (stmt.end as LexToken).value);
				assert.equal(null, stmt.step);
				assert.equal(1, stmt.statements.length);
				assert.equal('a', (stmt.statements[0] as AssignStatement).assigned[0].name);
			});
		});
		describe('If Statements', () => {
			it('should parse if line statements', () => {
				const stmt = parseWith(
					"If x Then y = 1\n\n",
					parse_if_exp,
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal('x', (stmt.cond_expr as VariableInst).name);
				if (!stmt.true_expr) {
					assert.fail("expected true condition statement");
				}
				assert.equal(1, stmt.true_expr.length);
				assert.equal('y', (stmt.true_expr[0] as AssignStatement).assigned[0].name);
				assert.equal(null, stmt.false_expr);
			});
			it('should parse if then else line statement', () => {
				const stmt = parseWith(
					"If x Then y = 1 else y = 2\n\n",
					parse_if_exp,
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal('x', (stmt.cond_expr as VariableInst).name);
				if (!stmt.true_expr) {
					assert.fail("expected true condition statement");
				}
				if (!stmt.false_expr) {
					assert.fail("expected false condition statement");
				}
				assert.equal(1, stmt.true_expr.length);
				assert.equal(1, stmt.false_expr.length);
				assert.equal('y', (stmt.true_expr[0] as AssignStatement).assigned[0].name);
				assert.equal('y', (stmt.false_expr[0] as AssignStatement).assigned[0].name);
			});
			it('should parse if then else statements', () => {
				const stmt = parseWith(
					`If x Then
					y = 1
					z = 1
					else
					y = 2
					z = 2
					endif
					`,
					parse_if_exp,
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal('x', (stmt.cond_expr as VariableInst).name);
				if (!stmt.true_expr) {
					assert.fail("expected true condition statement");
				}
				if (!stmt.false_expr) {
					assert.fail("expected false condition statement");
				}
				assert.equal(2, stmt.true_expr.length);
				assert.equal(2, stmt.false_expr.length);
				assert.equal('y', (stmt.true_expr[0] as AssignStatement).assigned[0].name);
				assert.equal('y', (stmt.false_expr[0] as AssignStatement).assigned[0].name);
			});
			it('should parse nested if then else statements', () => {
				const stmt = parseWith(
					`If x Then
					If y Then
					z = 1
					else
					z = 2
					endif
					else
					If y Then
					z = 3
					else
					z = 4
					endif
					endif
					`,
					parse_if_exp,
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal('x', (stmt.cond_expr as VariableInst).name);
				if (!stmt.true_expr) {
					assert.fail("expected true condition statement");
				}
				if (!stmt.false_expr) {
					assert.fail("expected false condition statement");
				}
				assert.equal(1, stmt.true_expr.length);
				assert.equal(1, stmt.false_expr.length);
				assert.equal('y', ((stmt.true_expr[0] as IfStatement).cond_expr as VariableInst).name);
				assert.equal('y', ((stmt.false_expr[0] as IfStatement).cond_expr as VariableInst).name);
			});
			it('should parse nested if then else statements 2', () => {
				const st = new SymbolTable();
				const stmt = parseWith(
					`If lvEnableCmd <> PGM_EnableCmd Then
					If PGM_EnableCmd Then
					  PGM_LastStarted_v = Date
					Else
					  PGM_LastStopped_v = Date
					Endif
				  Endif
					`,
					parse_if_exp,
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal('<>', (stmt.cond_expr as BinaryOp).op.value);
				if (!stmt.true_expr) {
					assert.fail("expected true condition statement");
				}
				if (stmt.false_expr) {
					assert.fail("unexpected false condition statement");
				}
				assert.equal(1, stmt.true_expr.length);
				assert.equal('PGM_EnableCmd', ((stmt.true_expr[0] as IfStatement).cond_expr as VariableInst).name);
				assert.equal(0, st.errors.length);
			});
		});
		it('should parse nested inline if then else statements', () => {
			const stmt = parseWith(
				`If x Then If y Then z = 1 else z = 2 else If y Then z = 3 else z = 4
				`,
				parse_if_exp,
			);
			if (!stmt) {
				assert.fail("expected return value");
			}
			assert.equal('x', (stmt.cond_expr as VariableInst).name);
			if (!stmt.true_expr) {
				assert.fail("expected true condition statement");
			}
			if (!stmt.false_expr) {
				assert.fail("expected false condition statement");
			}
			assert.equal(1, stmt.true_expr.length);
			assert.equal(1, stmt.false_expr.length);
			assert.equal('y', ((stmt.true_expr[0] as IfStatement).cond_expr as VariableInst).name);
			assert.equal('y', ((stmt.false_expr[0] as IfStatement).cond_expr as VariableInst).name);
		});
	});

	describe('Line Parsing', () => {
		it('should parse program lines', () => {
			const text = `
Line 1
  v1=1			
Line 2
  v2=2		
Extra:
  v3=3		
			`;
			const st = new SymbolTable();
			const pgm = parseWith(
				text,
				parse_program,
				st
			);
			if (!pgm) {
				assert.fail("expected return value");
			}
			assert.equal(3, pgm.lines.length);
			assert.equal('1', pgm.lines[0].name);
			assert.equal(1, pgm.lines[0].statements.length);
			assert.equal('2', pgm.lines[1].name);
			assert.equal(1, pgm.lines[1].statements.length);
			assert.equal('Extra', pgm.lines[2].name);
			assert.equal(1, pgm.lines[2].statements.length);
			assert.equal(3, st.line_names.length);
			assert.equal('1', st.line_names[0]);
			assert.equal('2', st.line_names[1]);
			assert.equal('Extra', st.line_names[2]);
		});
		it('should parse named line statements', () => {
			const tests: { line: string, expect: string | number }[] = [
				{ line: "SomeLine:\n\n", expect: "SomeLine" },
				{ line: "Line SomeLine\n\n", expect: "SomeLine" },
				{ line: "Line 5\n\n", expect: 5 },
				{ line: "E:\n\n", expect: "E" },
				{ line: "Line E\n\n", expect: "E" },
			];
			tests.forEach(test => {
				const st = new SymbolTable();
				const stmt = parseWith(
					test.line,
					parse_line,
					st
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal(test.expect, stmt.value);
				assert.equal(1, st.line_names.length);
				assert.equal(stmt.value, st.line_names[0]);
			});
		});
	});

	describe('Goto Parsing', () => {
		it('should parse named line statements', () => {
			const tests: { line: string, expect: string | number }[] = [
				{ line: "Goto SomeLine\n\n", expect: "SomeLine" },
				{ line: "Goto Line SomeLine\n\n", expect: "SomeLine" },
				{ line: "Go SomeLine\n\n", expect: "SomeLine" },
				{ line: "Go To SomeLine\n\n", expect: "SomeLine" },
				{ line: "Go To Line SomeLine\n\n", expect: "SomeLine" },
			];
			tests.forEach(test => {
				const st = new SymbolTable();
				const stmt = parseWith(
					test.line,
					parse_goto,
					st,
				);
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal(test.expect, stmt.line.value);
				assert.equal(1, st.line_refs['SomeLine'].length);
				assert.equal(stmt.line, st.line_refs['SomeLine'][0]);
			});
		});
	});
	describe('Is Expression Parsing', () => {
		it('should parse is comparison expressions', () => {
			const tests: { line: string, code: Op2Code, not: boolean, expect: string | number }[] =
				[
					{ line: "x Is Greater 10\n", code: Op2Code.GT, not: false, expect: "10" },
					{ line: "x Is Greater Than 10\n", code: Op2Code.GT, not: false, expect: "10" },
					{ line: "x Is Above 10\n", code: Op2Code.GT, not: false, expect: "10" },
					{ line: "x Is Less 10\n", code: Op2Code.LT, not: false, expect: "10" },
					{ line: "x Is Less Than 10\n", code: Op2Code.LT, not: false, expect: "10" },
					{ line: "x Is Below 10\n", code: Op2Code.LT, not: false, expect: "10" },
					{ line: "x Is Greater Than Or Equal To 10\n", code: Op2Code.GE, not: false, expect: "10" },
					{ line: "x Is Less Than Or Equal To 10\n", code: Op2Code.LE, not: false, expect: "10" },
					{ line: "x Is Greater Or Equal To 10\n", code: Op2Code.GE, not: false, expect: "10" },
					{ line: "x Is Less Or Equal To 10\n", code: Op2Code.LE, not: false, expect: "10" },
					{ line: "x Is Equal To 10\n", code: Op2Code.EQ, not: false, expect: "10" },
					{ line: "x Is Equal 10\n", code: Op2Code.EQ, not: false, expect: "10" },
					{ line: "x Is Not Greater 10\n", code: Op2Code.GT, not: true, expect: "10" },
					{ line: "x Is Not Greater Than 10\n", code: Op2Code.GT, not: true, expect: "10" },
					{ line: "x Is Not Above 10\n", code: Op2Code.GT, not: true, expect: "10" },
					{ line: "x Is Not Less 10\n", code: Op2Code.LT, not: true, expect: "10" },
					{ line: "x Is Not Less Than 10\n", code: Op2Code.LT, not: true, expect: "10" },
					{ line: "x Is Not Below 10\n", code: Op2Code.LT, not: true, expect: "10" },
					{ line: "x Is Not Greater Than Or Equal To 10\n", code: Op2Code.GE, not: true, expect: "10" },
					{ line: "x Is Not Less Than Or Equal To 10\n", code: Op2Code.LE, not: true, expect: "10" },
					{ line: "x Is Not Greater Or Equal To 10\n", code: Op2Code.GE, not: true, expect: "10" },
					{ line: "x Is Not Less Or Equal To 10\n", code: Op2Code.LE, not: true, expect: "10" },
					{ line: "x Is Not Equal To 10\n", code: Op2Code.EQ, not: true, expect: "10" },
					{ line: "x Is Not Equal 10\n", code: Op2Code.EQ, not: true, expect: "10" },
					{ line: "x Does Not Equal 10\n", code: Op2Code.EQ, not: true, expect: "10" },
				];
			tests.forEach((test, i) => {
				const st = new SymbolTable();
				const stmt = parseWith(
					test.line,
					expression,
					st,
				) as IsOp;
				if (!stmt) {
					assert.fail("expected return value");
				}
				assert.equal(test.code, stmt.code);
				assert.equal(test.expect, (stmt.exp2 as LexToken).value);
			});
		});
		it('should parse is in comparison expressions', () => {
			const test = "x is in 1, 2, 3\n";
			const st = new SymbolTable();
			const stmt = parseWith(
				test,
				expression,
				st,
			) as IsOp;
			if (!stmt) {
				assert.fail("expected return value");
			}
			assert.equal(Op2Code.SET, stmt.code);
			assert.equal(3, (stmt.exp2 as ExpressionList).length);
		});
		it('should have errors with is in statements without list of numbers', () => {
			const test = "x is in then\n";
			const st = new SymbolTable();
			const stmt = parseWith(
				test,
				expression,
				st,
			) as IsOp;
			if (!stmt) {
				assert.fail("expected return value");
			}
			assert.equal(Op2Code.SET, stmt.code);
			assert.equal(0, (stmt.exp2 as ExpressionList).length);
			assert.equal(2, st.errors.length);
		});
	});

});

