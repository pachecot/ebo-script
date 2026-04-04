import { TokenKind, isFunctionKind, isKeyword, isValueKind, isVariableKind } from './ebo-types';
import { LexToken, ebo_scan_text, VarToken } from './ebo-scanner';
import {
    ErrorInfo, FunctionDecl, ParameterDecl, Severity,
    SymbolTable, SymbolType, VariableDecl, VarModifier, VarTag
} from './SymbolTable';
import { EboErrors } from "./EboErrors";
import { Cursor } from './cursor';
import { FileCursor } from './file-cursor';
import { Signatures, VarType } from './ebo-signatures';

export enum StatementKind {
    NullStatement,
    AssignStatement,
    CaseStatement,
    ForStatement,
    PrintStatement,
    IfStatement,
    RepeatStatement,
    SelectStatement,
    WhileStatement,
    GotoExpr,
    BasedonExpr,
    CommandExpr,
    FunctionExpression,
    CommandStatement,
    LineStatement,
    AssignBlock,
}

export interface StatementType {
    type: StatementKind
}

export type NullStatement = null;
const null_statement: NullStatement = null;

export type Declarations = VariableDecl[] | FunctionDecl[] | ParameterDecl[];

export class VariableInst {
    name: string = "";
    token: LexToken;
    index?: number | ExpressionStatement;
    property?: LexToken;
    constructor(name: string, token: LexToken) {
        this.name = name;
        this.token = token;
    }
}

export class ArgInst {
    name: string;
    token: LexToken;
    id: number | ExpressionStatement = -1;
    index?: number | ExpressionStatement;
    constructor(name: string, token: LexToken) {
        this.name = name;
        this.token = token;
    }
}

export class FunctionExpression implements StatementType {
    readonly type: StatementKind = StatementKind.FunctionExpression;
    function: LexToken;
    arguments: ExpressionStatement[] = [];

    constructor(fn: LexToken) {
        this.function = fn;
    }
}

export enum OpCode {
    // ops in order of precedence
    NOP,

    GRP,        // () or []

    // unary ops
    NEG,        // - n
    NOT,        // NOT n
    BITNOT,     // BITNOT n
    PCT,        // n %

    // binary ops
    EXP,        // a ^ b

    MLT,        // 
    DIV,
    MOD,

    ADD,
    SUB,

    LT,
    LE,
    GT,
    GE,

    EQ,
    NE,
    SET,        // IS IN 1,2,3; IS NOT IN 1,2,3
    RANGE,      // IS BETWEEN 1 AND 3, IS 1 THRU 3

    BITAND,
    BITOR,
    BITXOR,

    AND,
    OR,

    CAT,        // CONCAT, string joining
};

function BinOpCodeLookup(tk: LexToken): OpCode {
    switch (tk.type) {
        case TokenKind.AngleLeftSymbol: return OpCode.LT;
        case TokenKind.AngleRightSymbol: return OpCode.GT;
        case TokenKind.AsteriskSymbol: return OpCode.MLT;
        case TokenKind.EqualsSymbol: return OpCode.EQ;
        case TokenKind.SlashSymbol: return OpCode.DIV;
        case TokenKind.CaretSymbol: return OpCode.EXP;
        case TokenKind.GreaterThanEqualSymbol: return OpCode.GE;
        case TokenKind.LessThanEqualSymbol: return OpCode.LE;
        case TokenKind.NotEqualSymbol: return OpCode.NE;
        case TokenKind.SemicolonSymbol: return OpCode.CAT;
        case TokenKind.AndOperator: return OpCode.AND;
        case TokenKind.AmpersandSymbol: return OpCode.AND;
        case TokenKind.BitandOperator: return OpCode.BITAND;
        case TokenKind.BitorOperator: return OpCode.BITOR;
        case TokenKind.BitxorOperator: return OpCode.BITXOR;
        case TokenKind.DivideOperator: return OpCode.DIV;
        case TokenKind.EqualsOperator: return OpCode.EQ;
        case TokenKind.MinusSymbol: return OpCode.SUB;
        case TokenKind.MinusOperator: return OpCode.SUB;
        case TokenKind.ModulusOperator: return OpCode.MOD;
        case TokenKind.OrOperator: return OpCode.OR;
        case TokenKind.ExclamationSymbol: return OpCode.OR;
        case TokenKind.PlusSymbol: return OpCode.ADD;
        case TokenKind.PlusOperator: return OpCode.ADD;
        case TokenKind.TimesOperator: return OpCode.MLT;
    }
    return OpCode.NOP;
}

export class PrintStatement implements StatementType {
    readonly type: StatementKind = StatementKind.PrintStatement;
    format: string = "";
    variables: VariableInst[] = [];
    assigned?: VariableInst;
    tks: LexToken[] = [];
}

export class AssignStatement implements StatementType {
    readonly type: StatementKind = StatementKind.AssignStatement;
    assigned: VariableInst[] = [];
    expression: ExpressionStatement = null_statement;
}

export class AssignBlock implements StatementType {
    readonly type: StatementKind = StatementKind.AssignBlock;
    assignments: AssignStatement[] = [];
}

export class IfStatement implements StatementType {
    readonly type: StatementKind = StatementKind.IfStatement;
    cond_expr: ExpressionStatement = null_statement;
    true_expr?: Statements;
    false_expr?: Statements;
}

export class RepeatStatement implements StatementType {
    readonly type: StatementKind = StatementKind.RepeatStatement;
    condition: ExpressionStatement = null_statement;
    statements: Statements = [];
}

export class CaseStatement implements StatementType {
    readonly type: StatementKind = StatementKind.CaseStatement;
    cases: ExpressionList = [];
    statements: Statements = [];
}

export class SelectStatement implements StatementType {
    readonly type: StatementKind = StatementKind.SelectStatement;
    test: ExpressionStatement = null_statement;
    cases: CaseStatement[] = [];
    elseStatements: Statements = [];
}

export class ForStatement implements StatementType {
    readonly type: StatementKind = StatementKind.ForStatement;
    numeric_name: VarToken;
    begin?: ExpressionStatement;
    end?: ExpressionStatement;
    step?: ExpressionStatement;
    statements: Statements = [];

    constructor(numeric_name: VarToken) {
        this.numeric_name = numeric_name;
    }
}

export class WhileStatement implements StatementType {
    readonly type: StatementKind = StatementKind.WhileStatement;
    condition: ExpressionStatement = null_statement;
    statements: Statements = [];
}

export class LineStatement implements StatementType {
    type: StatementKind = StatementKind.LineStatement;
    name: string = "";
    token?: LexToken = undefined;
    statements: Statements = [];
}

export enum ProgramType {
    Program,
    Function
}

export class Program {
    type: ProgramType = ProgramType.Program;
    declarations: Declarations = [];
    lines: LineStatement[] = [];
}

export type Statement =
    | NullStatement
    | AssignStatement
    | AssignBlock
    | CaseStatement
    | ForStatement
    | PrintStatement
    | IfStatement
    | RepeatStatement
    | SelectStatement
    | WhileStatement
    | GotoExpr
    | BasedonExpr
    | CommandExpr
    | FunctionExpression
    | CommandStatement
    ;

export type Statements = Statement[];

export type CommandExpr = LexToken;

export class CommandStatement implements StatementType {
    type: StatementKind = StatementKind.CommandStatement;
    tk: LexToken;
    expression: ExpressionStatement = null_statement;
    constructor(tk: LexToken) {
        this.tk = tk;
    }
}

export class BasedonExpr implements StatementType {
    type: StatementKind = StatementKind.BasedonExpr;
    variable: ExpressionStatement = null_statement;
    lines: LexToken[] = [];
}

export class GotoExpr implements StatementType {
    type: StatementKind = StatementKind.GotoExpr;
    line: LexToken;
    constructor(line: LexToken) {
        this.line = line;
    }
}

export type UnaryOp = {
    code: OpCode,
    op: LexToken,
    exp: ExpressionStatement,
};

export type BinaryOp = {
    code: OpCode,
    op: LexToken,
    exp1: ExpressionStatement,
    exp2: ExpressionStatement,
};

export type ExpressionStatement =
    | NullStatement
    | LexToken
    | ErrorExpression
    | FunctionExpression
    | BasedonExpr
    | UnaryOp
    | BinaryOp
    | IsOp
    | VariableInst
    ;

export type ExpressionList = ExpressionStatement[];

type ErrorExpression = {
    loc: LexToken
};

function isEOL(cur: Cursor): boolean {
    return cur.matchAny(TokenKind.EndOfLineToken);
}

function consumeEOL(cur: Cursor) {
    while (cur.matchAny(TokenKind.EndOfLineToken)) {
        cur.advance();
    }
}

function consumeUntilEOL(cur: Cursor) {
    while (cur.remain() > 0 && !cur.matchAny(TokenKind.EndOfLineToken)) {
        cur.advance();
    }
}


/**
 * try to parse the various goto statements.
 * return true if success and advance to the
 * next position
 */
export function parse_goto_statement(cur: Cursor, st: SymbolTable): boolean {

    if (cur.matchAny(TokenKind.GoStatement)) {
        cur.advance();
        if (cur.matchAny(TokenKind.ToKeyWord)) {
            cur.advance();
        }
        if (cur.matchAny(TokenKind.LineStatement)) {
            cur.advance();
        }
        return true;
    }
    if (cur.matchAny(TokenKind.GotoStatement)) {
        cur.advance();
        if (cur.matchAny(TokenKind.LineStatement)) {
            cur.advance();
        }
        return true;
    }
    cur.error("expected goto");
    return false;
}

export function parse_goto(cur: Cursor, st: SymbolTable): GotoExpr {
    parse_goto_statement(cur, st);
    const gt = new GotoExpr(cur.current());
    cur.advance();
    if (gt.line) {
        if (isKeyword(gt.line.type)) {
            st.add_error({
                id: EboErrors.KeywordUsedAsLineName,
                severity: Severity.Warning,
                message: `Keyword '${gt.line.value}' used as line name; consider renaming the line.`,
                range: gt.line.range
            });
        } else {
            st.lookup_line(gt.line);
        }
    }
    return gt;
}

export function parse_command(cur: Cursor, st: SymbolTable): CommandExpr {
    const cmd: CommandExpr = cur.current();
    cur.advance();
    return cmd;
}


export function parse_return_command(cur: FileCursor, st: SymbolTable): CommandStatement {
    const cmd: CommandExpr = cur.current();
    cur.advance();
    const commandStatement = new CommandStatement(cmd);
    commandStatement.expression = expression(cur, st);
    return commandStatement;
}

export function parse_wait_command(cur: FileCursor, st: SymbolTable): CommandStatement {
    const cmd: CommandExpr = cur.current();
    cur.advance();
    const commandStatement = new CommandStatement(cmd);
    commandStatement.expression = expression(cur, st);
    return commandStatement;
}


function errorExpr(tk: LexToken): ErrorExpression {
    return { loc: tk };
}

export function parse_bracket_expression(cursor: FileCursor, st: SymbolTable): ExpressionStatement {
    if (!cursor.expect(TokenKind.BracketLeftSymbol, "missing open bracket")) {
        return errorExpr(cursor.current());
    }
    cursor.advance();
    const exp = expression(cursor, st);
    if (!cursor.expect(TokenKind.BracketRightSymbol, "missing closing bracket")) {
        return exp;
    }
    cursor.advance();
    return exp;
}

export function parse_parentheses_expression(cursor: FileCursor, st: SymbolTable): ExpressionStatement {
    if (!cursor.expect(TokenKind.ParenthesesLeftSymbol, "missing open parentheses")) {
        return errorExpr(cursor.current());
    }
    cursor.advance();
    const exp = expression(cursor, st);
    if (!cursor.expect(TokenKind.ParenthesesRightSymbol, "missing closing parentheses")) {
        return exp;
    }
    cursor.advance();
    return exp;
}

export function parse_function_expression(cursor: FileCursor, st: SymbolTable): FunctionExpression {
    const tk = cursor.current();
    const exp = new FunctionExpression(tk);
    if (!isFunctionKind(tk.type)) {
        if (!cursor.expect(TokenKind.FunctionCallToken, "expected function call")) {
            return exp;
        }
        st.lookup_function(tk);
    }
    cursor.advance();
    if (!cursor.expect(TokenKind.ParenthesesLeftSymbol, "expected open parentheses")) {
        return exp;
    }
    cursor.advance();
    if (cursor.matchAny(TokenKind.ParenthesesRightSymbol)) {
        cursor.advance();
        return exp;
    }
    while (cursor.remain() && !isEOL(cursor)) {
        exp.arguments.push(expression(cursor, st, OpCode.NOP));
        if (cursor.matchAny(TokenKind.ParenthesesRightSymbol)) {
            cursor.advance();
            return exp;
        }
        if (!cursor.expect(TokenKind.CommaSymbol, "expected comma and additional arguments or closing parentheses")) {
            break;
        }
        cursor.advance();
    }
    return exp;
}

export function parse_operation_unary(cur: FileCursor, st: SymbolTable): UnaryOp {
    const op = cur.current();
    let code = OpCode.NOP;
    switch (op.type) {
        case TokenKind.MinusSymbol:
            code = OpCode.NEG;
            break;
        case TokenKind.NotOperator:
            code = OpCode.NOT;
            break;
    }
    cur.advance();
    const exp: UnaryOp = {
        code: code,
        op: op,
        exp: expression(cur, st, code),
    };
    return exp;
}


const enum IsState {
    INIT
    , IS
    , DOES
    , NOT
    , EQ
    , GT
    , GTE
    , LT
    , LTE
    , SET
    , RANGE
    , EXP2
    , TO
    , END
};

const is_states: {
    [id: string]: {
        [t: number]: [IsState, { [name: string]: number | boolean | OpCode }]
    }
} = {
    [IsState.INIT]: {
        [TokenKind.IsOperator]: [IsState.IS, {}],
        [TokenKind.DoesOperator]: [IsState.IS, {}],
    },
    [IsState.DOES]: {
        [TokenKind.NotOperator]: [IsState.NOT, { "code": OpCode.EQ, "not": true }],
    },
    [IsState.NOT]: {
        [TokenKind.EqualOperator]: [IsState.NOT, { "code": OpCode.EQ, "not": true }],
    },
    [IsState.IS]: {
        [TokenKind.NotOperator]: [IsState.IS, { "not": true }],
        [TokenKind.GreaterOperator]: [IsState.GT, { "code": OpCode.GT }],
        [TokenKind.AboveOperator]: [IsState.GT, { "code": OpCode.GT }],
        [TokenKind.LessOperator]: [IsState.LT, { "code": OpCode.LT }],
        [TokenKind.BelowOperator]: [IsState.LT, { "code": OpCode.LT }],
        [TokenKind.EqualOperator]: [IsState.EQ, { "code": OpCode.EQ }],
        [TokenKind.InOperator]: [IsState.SET, { "code": OpCode.SET }],
        [TokenKind.EitherOperator]: [IsState.SET, { "code": OpCode.SET }],
        [TokenKind.NeitherOperator]: [IsState.SET, { "code": OpCode.SET }],
        [TokenKind.BetweenOperator]: [IsState.RANGE, { "code": OpCode.RANGE }],
    },
    [IsState.EQ]: {
        [TokenKind.ToKeyWord]: [IsState.EXP2, {}],
    },
    [IsState.TO]: {
        [TokenKind.ToKeyWord]: [IsState.EXP2, {}],
    },
    [IsState.GT]: {
        [TokenKind.ThanOperator]: [IsState.GT, {}],
        [TokenKind.OrOperator]: [IsState.GTE, {}],
    },
    [IsState.LT]: {
        [TokenKind.ThanOperator]: [IsState.LT, {}],
        [TokenKind.OrOperator]: [IsState.LTE, {}],
    },
    [IsState.GTE]: {
        [TokenKind.EqualOperator]: [IsState.TO, { "code": OpCode.GE }],
    },
    [IsState.LTE]: {
        [TokenKind.EqualOperator]: [IsState.TO, { "code": OpCode.LE }],
    },
    [IsState.SET]: {
    },
    [IsState.RANGE]: {
    },
    [IsState.EXP2]: {
    },
};

export type IsOp = {
    code: OpCode,
    op: LexToken,
    tks: LexToken[],
    not: boolean,
    exp1: ExpressionStatement,
    exp2: ExpressionStatement | ExpressionList,
};

export function parse_is_statement(cur: FileCursor, st: SymbolTable, leftExp: ExpressionStatement): IsOp {
    let state = IsState.INIT;
    const exp: IsOp = {
        code: OpCode.NOP,
        op: cur.current(),
        tks: [],
        not: false,
        exp1: leftExp,
        exp2: null_statement
    };

    while (cur.remain()) {
        const tk = cur.current();
        const next: [IsState, { [name: string]: number | boolean | OpCode }] | undefined =
            is_states[state] && is_states[state][tk.type];
        if (!next) {
            break;
        }
        exp.tks.push(tk);
        Object.assign(exp, next[1]);
        cur.advance();
        state = next[0];
    }

    switch (state) {
        case IsState.SET:
            exp.exp2 = parse_expression_list(cur, st);
            if (exp.exp2.length === 0) {
                st.add_error({
                    severity: Severity.Error,
                    id: EboErrors.IllegalExpression,
                    message: "list of values expected",
                    range: cur.current().range
                });
            }
            break;
        case IsState.RANGE:
            exp.exp2 = expression(cur, st, OpCode.RANGE);
            break;
        default:
            exp.exp2 = expression(cur, st);
            break;
    }
    return exp;
}

// DateTime token types that represent a datetime value in the token stream
const dateTimeTokenTypes = new Set<TokenKind>([
    TokenKind.TimeToken,
    TokenKind.DateVariable,
]);

/**
 * Resolves the result SymbolType of an expression, or undefined when unknown.
 * Used for DateTime / Numeric type-compatibility checks.
 */
export function expr_type(exp: ExpressionStatement, st: SymbolTable): SymbolType | undefined {
    if (!exp) { return undefined; }

    if (exp instanceof VariableInst) {
        return st.variables[exp.name]?.type;
    }

    // Plain token — DateTime literals, system date/time variables, numbers, strings
    const tk = exp as LexToken;
    if (tk.type !== undefined && tk.value !== undefined) {
        if (dateTimeTokenTypes.has(tk.type)) { return SymbolType.DateTime; }
        if (tk.type === TokenKind.NumberToken) { return SymbolType.Numeric; }
        if (tk.type === TokenKind.StringToken) { return SymbolType.StringType; }
        // isVariableKind system variables: look up in symbol table first
        if (isVariableKind(tk.type)) {
            const vd = st.variables[tk.value];
            if (vd) { return vd.type; }
        }
    }

    // FunctionExpression — map return type from Signatures
    const fe = exp as FunctionExpression;
    if (fe.function !== undefined && fe.arguments !== undefined) {
        const sig = Signatures[fe.function.value.toUpperCase()];
        if (sig?.returns === VarType.DateTime) { return SymbolType.DateTime; }
        if (sig?.returns === VarType.Numeric) { return SymbolType.Numeric; }
        if (sig?.returns === VarType.String) { return SymbolType.StringType; }
        return undefined;
    }

    // BinaryOp — derive result type from operator and operand types
    const bo = exp as BinaryOp;
    if (bo.code !== undefined && bo.exp1 !== undefined && bo.exp2 !== undefined) {
        const t1 = expr_type(bo.exp1, st);
        const t2 = expr_type(bo.exp2, st);
        if (bo.code === OpCode.ADD || bo.code === OpCode.SUB) {
            const dt = SymbolType.DateTime;
            const num = SymbolType.Numeric;
            if (t1 === dt && t2 === dt) {
                // dt - dt → Numeric; dt + dt → invalid (undefined signals error)
                return bo.code === OpCode.SUB ? num : undefined;
            }
            if (t1 === dt && t2 === num) { return dt; }  // dt ± num → DateTime
            if (t1 === num && t2 === dt) {
                // num + dt → DateTime; num - dt → invalid
                return bo.code === OpCode.ADD ? dt : undefined;
            }
        }
        return t1;  // conservative: result type follows left operand for other ops
    }

    return undefined;
}

export function parse_binary_operation(cur: FileCursor, st: SymbolTable, leftExp: ExpressionStatement): BinaryOp {
    const op = cur.current();
    const code = BinOpCodeLookup(op);
    cur.advance();
    const result: BinaryOp = {
        code: code,
        op: op,
        exp1: leftExp,
        exp2: expression(cur, st, code)
    };

    if (code === OpCode.ADD || code === OpCode.SUB) {
        const t1 = expr_type(result.exp1, st);
        const t2 = expr_type(result.exp2, st);
        const dt = SymbolType.DateTime;
        const num = SymbolType.Numeric;
        if (t1 === dt && t2 === dt && code === OpCode.ADD) {
            cur.addError({
                id: EboErrors.DateTimeArithmeticInvalid,
                severity: Severity.Error,
                message: "DateTime + DateTime is not valid; use DateTime - DateTime to get a Numeric duration.",
                range: op.range
            });
        } else if (t1 === num && t2 === dt && code === OpCode.SUB) {
            cur.addError({
                id: EboErrors.DateTimeArithmeticInvalid,
                severity: Severity.Error,
                message: "Cannot subtract a DateTime from a Numeric; valid forms are: DateTime - DateTime, DateTime +/- Numeric.",
                range: op.range
            });
        }
    }

    return result;
}

export function parse_expression_list(cur: FileCursor, st: SymbolTable): ExpressionList {
    const list: ExpressionList = [];
    while (cur.remain() && !isEOL(cur)) {
        const expr = expression(cur, st);
        if (!expr) {
            break;
        }
        list.push(expr);
        if (!cur.match(TokenKind.CommaSymbol)) {
            break;
        }
        cur.advance();
    }
    return list;
}

export function parse_assigned(cur: FileCursor, st: SymbolTable, tokens: VariableInst[]): AssignStatement {
    while (cur.matchAny(TokenKind.AndOperator, TokenKind.CommaSymbol)) {
        cur.advance();
        if (!cur.expect(TokenKind.IdentifierToken, "expected identifier")) {
            continue;
        }
        const id = parse_identifier(cur, st);
        tokens.push(id);
    }
    return parse_assignment(cur, st, tokens);
}


export function parse_assignment(cur: FileCursor, st: SymbolTable, tokens: VariableInst[]): AssignStatement {

    const stmt = new AssignStatement();
    stmt.assigned = tokens;
    let tk = cur.current();
    while (tk.type !== TokenKind.EqualsSymbol) {
        if (tk.type === TokenKind.IdentifierToken) {
            stmt.assigned.push(parse_identifier(cur, st));
        } else {
            cur.advance();
        }
        tk = cur.current();
    }
    cur.advance();
    stmt.expression = expression(cur, st, OpCode.NOP);
    stmt.assigned.forEach(vi => { st.assigned_variable(vi.token); });
    check_assignment_types(stmt, st);
    return stmt;
}

function check_assignment_types(stmt: AssignStatement, st: SymbolTable) {
    const rhs_type = expr_type(stmt.expression, st);
    if (rhs_type === undefined) { return; }
    for (const vi of stmt.assigned) {
        const vd = st.variables[vi.name];
        if (!vd) { continue; }
        const lhs_type = vd.type;
        if (lhs_type === rhs_type) { continue; }
        const dt = SymbolType.DateTime;
        const num = SymbolType.Numeric;
        if (lhs_type === dt && rhs_type === num) {
            st.add_error({
                id: EboErrors.TypeMismatch,
                severity: Severity.Warning,
                message: `Assigning Numeric expression to DateTime variable '${vi.name}'; did you mean to add/subtract from a DateTime?`,
                range: vi.token.range
            });
        } else if (lhs_type === num && rhs_type === dt) {
            st.add_error({
                id: EboErrors.TypeMismatch,
                severity: Severity.Warning,
                message: `Assigning DateTime expression to Numeric variable '${vi.name}'; consider declaring as DateTime.`,
                range: vi.token.range
            });
        }
    }
}

function parse_set_assignment(cur: FileCursor, st: SymbolTable): AssignStatement {
    const stmt = new AssignStatement();
    if (!cur.matchAny(TokenKind.SetAction, TokenKind.ChangeAction, TokenKind.AdjustAction, TokenKind.LetAction)) {
        cur.addError({
            message: "expected assignment",
            id: EboErrors.ParseError,
            range: cur.current().range,
            severity: Severity.Error
        });
        return stmt;
    }
    cur.advance();
    stmt.assigned = parse_assigned_vars(cur, st);
    if (!cur.matchAny(TokenKind.EqualsSymbol, TokenKind.ToKeyWord)) {
        cur.addError({
            id: EboErrors.ParseError,
            severity: Severity.Error,
            message: "expected  = or to",
            range: cur.current().range
        });
        consumeUntilEOL(cur);
        return stmt;
    }
    cur.advance();
    stmt.expression = expression(cur, st);
    return stmt;
}


function parse_assigned_vars(cur: FileCursor, st: SymbolTable): VariableInst[] {
    const assigned: VariableInst[] = [];
    while (cur.remain() && !isEOL(cur)) {
        if (cur.match(TokenKind.TheOperator)) {
            cur.advance();
        }
        if (!cur.expect(TokenKind.IdentifierToken, "expected identifier")) {
            while (!cur.matchAny(TokenKind.EndOfLineToken, TokenKind.CommaSymbol, TokenKind.AndOperator)) {
                cur.advance();
            }
            if (cur.match(TokenKind.EndOfLineToken)) {
                return assigned;
            }
            cur.advance();
            continue;
        }
        const id = parse_identifier(cur, st);
        assigned.push(id);
        st.assigned_variable(id.token);
        if (!cur.matchAny(TokenKind.CommaSymbol, TokenKind.AndOperator)) {
            break;
        }
        cur.advance();
    }
    return assigned;
}


function parse_print_statement(cur: FileCursor, st: SymbolTable): PrintStatement {
    const stmt = new PrintStatement();
    // TODO: actually parse the statement
    while (cur.remain() > 0 && !cur.match(TokenKind.EndOfLineToken)) {
        stmt.tks.push(cur.current());
        cur.advance();
    }
    consumeEOL(cur);

    return stmt;
}


function parse_stop(cur: FileCursor, st: SymbolTable): AssignStatement | CommandExpr {
    const stmt = new AssignStatement();
    const tk = cur.current();
    if (!cur.expect(TokenKind.StopStatement, "expected stop")) {
        return stmt;
    }
    cur.advance();
    if (cur.match(TokenKind.EndOfLineToken)) {
        return tk;
    }
    if (cur.match(TokenKind.ThenStatement)) {
        return tk;
    }
    stmt.assigned = parse_assigned_vars(cur, st);
    stmt.assigned.forEach(id => { st.assigned_variable(id.token); });
    stmt.expression = { type: TokenKind.OnValue, value: "Off", range: { begin: 0, end: 0, line: 0 } } as LexToken;
    return stmt;
}

function parse_stop_assignment(cur: FileCursor, st: SymbolTable): AssignStatement {

    const stmt = new AssignStatement();
    stmt.expression = {
        type: TokenKind.OnValue,
        value: "Off",
        range: { begin: 0, end: 0, line: 0 }
    };

    if (!cur.matchAny(TokenKind.CloseAction, TokenKind.ShutAction, TokenKind.DisableAction)) {
        cur.addError({
            id: EboErrors.ParseError,
            severity: Severity.Error,
            message: "expected close or shut command",
            range: cur.current().range
        });
        return stmt;
    }
    cur.advance();
    stmt.assigned = parse_assigned_vars(cur, st);
    stmt.assigned.forEach(id => { st.assigned_variable(id.token); });
    return stmt;
}



function parse_start_assignment(cur: FileCursor, st: SymbolTable): AssignStatement {

    const stmt = new AssignStatement();
    stmt.expression = {
        type: TokenKind.OnValue,
        value: "On",
        range: { begin: 0, end: 0, line: 0 }
    };

    if (!cur.matchAny(TokenKind.StartAction, TokenKind.OpenAction, TokenKind.EnableAction)) {
        cur.addError({
            id: EboErrors.ParseError,
            severity: Severity.Error,
            message: "expected start or open command",
            range: cur.current().range
        });
        return stmt;
    }
    cur.advance();
    stmt.assigned = parse_assigned_vars(cur, st);
    stmt.assigned.forEach(id => { st.assigned_variable(id.token); });
    return stmt;
}

function parse_turn_assignment(cur: FileCursor, st: SymbolTable): AssignStatement {
    const stmt = new AssignStatement();
    if (!cur.expect(TokenKind.TurnAction, "expected turn statement")) {
        return stmt;
    }
    cur.advance();
    if (cur.matchAny(TokenKind.OnValue, TokenKind.OffValue)) {
        stmt.expression = cur.current();
        cur.advance();
    }
    stmt.assigned = parse_assigned_vars(cur, st);
    if (cur.matchAny(TokenKind.OnValue, TokenKind.OffValue)) {
        if (stmt.expression) {
            cur.error("already assigned on or off");
            return stmt;
        }
        stmt.expression = cur.current();
        cur.advance();
    }
    if (stmt.assigned.length === 0) {
        cur.error("expected variable(s) for assignment");
        return stmt;
    }
    if (!stmt.expression) {
        cur.error("expected on or off assignment");
        return stmt;
    }
    if (stmt && stmt.assigned) {
        stmt.assigned.forEach(id => { st.assigned_variable(id.token); });
    }
    return stmt;
}

export function parse_if_exp(cur: FileCursor, st: SymbolTable): IfStatement {

    const data: { [name: number]: LexToken[] } = {};
    const stmt = new IfStatement();

    if (!cur.expect(TokenKind.IfStatement, "")) {
        return stmt;
    }
    const if_tk = cur.current();
    cur.advance();
    stmt.cond_expr = expression(cur, st);
    if (!cur.expect(TokenKind.ThenStatement, "expected then")) {
        return stmt;
    }
    cur.advance();
    if (cur.matchAny(TokenKind.EndOfLineToken)) {
        consumeEOL(cur);
        stmt.true_expr = parse_statements(cur, st);
        if (cur.matchAny(TokenKind.ElseStatement)) {
            cur.advance();
            consumeEOL(cur);
            stmt.false_expr = parse_statements(cur, st);
        }
        if (!cur.match(TokenKind.EndIfStatement)) {
            st.add_error({
                id: EboErrors.IfThenStatementMissingEndIf,
                message: "closing EndIf statement not found",
                severity: Severity.Error,
                range: if_tk.range
            });
            return stmt;
        }
        cur.advance();
        consumeEOL(cur);
        return stmt;
    }

    stmt.true_expr = [parse_statement(cur, st)];
    if (cur.matchAny(TokenKind.ElseStatement)) {
        cur.advance();
        stmt.false_expr = [parse_statement(cur, st)];
    }
    return stmt;
}

function has_goto_statement(stmts: Statement[] | undefined): boolean {
    if (!stmts) { return false; }
    return stmts.reduce((a, s) => a || is_goto_statement(s), false);
}

function is_goto_statement(stmt: Statement): boolean {
    if (!stmt) {
        return false;
    }
    switch (stmt.type) {
        case StatementKind.GotoExpr:
        case StatementKind.BasedonExpr:
            return true;
        case StatementKind.IfStatement:
            const if_stmt = stmt as IfStatement;
            return has_goto_statement(if_stmt.true_expr)
                || has_goto_statement(if_stmt.false_expr)
                || false;
        case StatementKind.SelectStatement:
            const sel_stmt = stmt as SelectStatement;
            return sel_stmt.cases?.reduce(
                (a, c) => a || has_goto_statement(c.statements), false)
                || has_goto_statement(sel_stmt.elseStatements)
                || false;
        default:
            return false;
    }
}

export function parse_for_statement(cur: FileCursor, ast: SymbolTable): ForStatement | null {

    const for_tk = cur.current();
    cur.advance();

    if (!cur.expect(TokenKind.IdentifierToken, "for statement missing numeric variable")) {
        return null;
    }
    const numeric_name = cur.current() as VarToken;
    const stmt = new ForStatement(numeric_name);
    cur.advance();
    if (!cur.expect(TokenKind.EqualsSymbol, "for statement missing range assignment", EboErrors.ForStatementInvalidRange)) {
        return null;
    }
    cur.advance();
    stmt.begin = expression(cur, ast);
    if (!stmt.begin) {
        cur.addError({
            severity: Severity.Error,
            id: EboErrors.ForStatementInvalidRange,
            message: "For statement missing begin range",
            range: for_tk.range
        });
    }

    if (!cur.expect(TokenKind.ToKeyWord, "for statement expected To", EboErrors.ForStatementInvalidRange)) {
        return null;
    }
    cur.advance();

    stmt.end = expression(cur, ast);
    if (!stmt.end) {
        cur.addError({
            severity: Severity.Error,
            id: EboErrors.ForStatementInvalidRange,
            message: "For statement missing end range",
            range: for_tk.range
        });
    }
    if (cur.matchAny(TokenKind.StepStatement)) {
        cur.advance();
        stmt.step = expression(cur, ast);
    }
    if (!cur.expect(TokenKind.EndOfLineToken, "unknown")) {
        return null;
    }
    while (cur.matchAny(TokenKind.EndOfLineToken)) {
        cur.advance();
    }
    stmt.statements = parse_statements(cur, ast);
    while (cur.matchAny(TokenKind.EndOfLineToken)) {
        cur.advance();
    }
    if (!cur.expect(TokenKind.NextStatement, "missing closing next statement")) {
        return null;
    }
    cur.advance();
    if (!cur.expect(TokenKind.IdentifierToken, "next statement missing numeric variable", EboErrors.ForStatementMissingNext)) {
        return null;
    }
    if (numeric_name.value === cur.current().value) {
        cur.advance();
    } else {
        cur.addError({
            severity: Severity.Error,
            id: EboErrors.ForStatementNextVariableInvalid,
            message: "For statement missing end range",
            range: for_tk.range
        });
    }
    if (!stmt) {
        return null_statement;
    }
    let vn = ast.lookup_variable(stmt.numeric_name);
    if (!stmt.numeric_name
        || stmt.numeric_name.type !== TokenKind.IdentifierToken
        || !vn
        || (vn.modifier !== VarModifier.Local && vn.modifier !== VarModifier.Public)
        || vn.type !== SymbolType.Numeric
    ) {
        ast.errors.push({
            severity: Severity.Error,
            id: EboErrors.ForIdentifierInvalid,
            message: "For identifier is invalid, local numeric required",
            range: stmt.numeric_name.range
        });
    }

    if (has_goto_statement(stmt.statements)) {
        ast.errors.push({
            severity: Severity.Error,
            id: EboErrors.GotoInLoop,
            message: "Goto is not allowed in loops.",
            range: for_tk.range
        });
    }

    return stmt;
}


export function parse_select_statement(cur: FileCursor, st: SymbolTable): SelectStatement {
    const stmt = new SelectStatement();
    if (!cur.expect(TokenKind.SelectStatement, "")) {
        return stmt;
    }
    const select_tk = cur.current();
    cur.advance();
    if (!cur.expect(TokenKind.CaseStatement, "")) {
        return stmt;
    }
    cur.advance();
    stmt.test = expression(cur, st);
    consumeEOL(cur);
    {
        // consume any bad statements before first case and report as error
        const tk = cur.current();
        const bad_stmts = parse_statements(cur, st);
        if (bad_stmts.length) {
            const range = {
                ...tk.range,
                end: cur.current().range.begin,
                lines: cur.current().range.line - tk.range.line
            };
            st.add_error({
                id: EboErrors.ParseError,
                message: "illegal statements",
                range: range,
                severity: Severity.Error
            });
        }
    }

    while (cur.matchAny(TokenKind.CaseStatement)) {
        const cs = parse_case_statement(cur, st);
        if (cs.cases.length === 1 && (cs.cases[0] as LexToken).type === TokenKind.ElseStatement) {
            stmt.elseStatements = cs.statements;
            break;
        }
        stmt.cases.push(cs);
        consumeEOL(cur);
    }
    consumeEOL(cur);
    if (!cur.match(TokenKind.EndSelectStatement)) {
        st.add_error({
            id: EboErrors.SelectCaseMissingEnd,
            severity: Severity.Error,
            message: "closing EndSelect statement not found",
            range: select_tk.range
        });
        return stmt;
    }
    cur.advance();
    return stmt;
}


export function parse_cases_statement(cur: FileCursor, st: SymbolTable): ExpressionList {
    const cases: ExpressionList = [];

    if (!cur.expect(TokenKind.CaseStatement, "expected case statement")) {
        consumeUntilEOL(cur);
        return cases;
    }
    cur.advance();

    if (cur.match(TokenKind.ElseStatement)) {
        cases.push(cur.current());
        cur.advance();
        if (!cur.match(TokenKind.EndOfLineToken)) {
            /// error
            consumeUntilEOL(cur);
        }
        consumeEOL(cur);
        return cases;
    }

    while (!isEOL(cur)) {
        cases.push(expression(cur, st));

        if (cur.match(TokenKind.EndOfLineToken)) {
            cur.advance();
            break;
        }

        if (cur.match(TokenKind.CommaSymbol)) {
            cur.advance();
            continue;
        }

        if (cur.match(TokenKind.ThruOperator)) {
            const start = cases.pop();
            const op = cur.current();
            cur.advance();
            const epr: BinaryOp = {
                code: OpCode.RANGE,
                op: op,
                exp1: start as ExpressionStatement,
                exp2: cur.current(),
            };
            cur.advance();
            cases.push(epr);
            continue;
        }

        /// error(s)
        st.add_error({
            id: EboErrors.ParseError,
            range: cur.current().range,
            message: "bad case statement",
            severity: Severity.Error
        });
        consumeUntilEOL(cur);
        break;
    }
    consumeEOL(cur);
    return cases;
}


export function parse_case_statement(cur: FileCursor, st: SymbolTable): CaseStatement {
    const stmt = new CaseStatement();
    stmt.cases = parse_cases_statement(cur, st);
    stmt.statements = parse_statements(cur, st);
    return stmt;
}


export function parse_repeat_statement(cur: FileCursor, st: SymbolTable): RepeatStatement {

    const stmt = new RepeatStatement();
    stmt.condition = errorExpr(cur.current());

    if (!cur.expect(TokenKind.RepeatStatement, "expected repeat statement")) {
        return stmt;
    }
    const repeat_tk = cur.current();
    cur.advance();
    if (!cur.expect(TokenKind.EndOfLineToken, "expected End of Line")) {
        return stmt;
    }
    cur.advance();

    stmt.statements = parse_statements(cur, st);
    if (has_goto_statement(stmt.statements)) {
        st.errors.push({
            severity: Severity.Error,
            id: EboErrors.GotoInLoop,
            message: "Goto is not allowed in loops.",
            range: repeat_tk.range,
        });
    }

    if (!cur.match(TokenKind.UntilStatement)) {
        st.add_error({
            id: EboErrors.RepeatStatementMissingUntil,
            message: "closing Until statement not found",
            range: repeat_tk.range,
            severity: Severity.Error
        });
        return stmt;
    }
    cur.advance();

    stmt.condition = expression(cur, st);
    return stmt;
}


export function parse_while_statement(cur: FileCursor, st: SymbolTable): WhileStatement {
    let stmt = new WhileStatement();
    if (!cur.expect(TokenKind.WhileStatement, "expected While statement")) {
        return stmt;
    }
    const while_tk = cur.current();
    cur.advance();
    stmt.condition = expression(cur, st);
    if (!cur.expect(TokenKind.EndOfLineToken, "expected End of Line")) {
        return stmt;
    }
    cur.advance();
    stmt.statements = parse_statements(cur, st);
    if (!cur.match(TokenKind.EndWhileStatement)) {
        st.add_error({
            id: EboErrors.WhileMissingEndWhile,
            message: "closing EndWhile statement not found",
            range: while_tk.range,
            severity: Severity.Error
        });
        return stmt;
    }
    cur.advance();

    if (has_goto_statement(stmt.statements)) {
        st.errors.push({
            severity: Severity.Error,
            id: EboErrors.GotoInLoop,
            message: "Goto is not allowed in loops.",
            range: while_tk.range,
        });
    }

    return stmt;
}


/**
 * comma separated list of tokens
 */
export function parse_list(cur: Cursor): LexToken[] {
    const tks: LexToken[] = [];
    while (cur.remain() && !isEOL(cur)) {
        tks.push(cur.current());
        cur.advance();
        if (cur.matchAny(TokenKind.CommaSymbol)) {
            cur.advance();
        }
    }
    return tks;
}


const enum DeclState { Init, Type, InputType, Modifier, InputMod, Complete };

const declaration_states: {
    [id: string]: {
        [t: number]: [DeclState, { [name: string]: number }]
    }
} = {
    [DeclState.Init]: {
        [TokenKind.StringDeclaration]: [DeclState.Type, { type: SymbolType.StringType }],
        [TokenKind.NumericDeclaration]: [DeclState.InputType, { type: SymbolType.Numeric }],
        [TokenKind.DatetimeDeclaration]: [DeclState.Type, { type: SymbolType.DateTime }],
        //
        [TokenKind.DatafileDeclaration]: [DeclState.Complete, { type: SymbolType.Datafile }],
        [TokenKind.TrendlogDeclaration]: [DeclState.Complete, { type: SymbolType.Trendlog }],
        [TokenKind.WebserviceDeclaration]: [DeclState.Complete, { type: SymbolType.Webservice }],
    },
    [DeclState.Type]: {
        [TokenKind.NumberToken]: [DeclState.Complete, {}],
        [TokenKind.InputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Input }],
        [TokenKind.OutputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Output }],
        [TokenKind.PublicDeclaration]: [DeclState.Complete, { modifier: VarModifier.Public }],
    },
    [DeclState.InputType]: {
        [TokenKind.NumberToken]: [DeclState.Complete, {}],
        [TokenKind.InputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Input }],
        [TokenKind.OutputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Output }],
        [TokenKind.PublicDeclaration]: [DeclState.Complete, { modifier: VarModifier.Public }],
        [TokenKind.BufferedDeclaration]: [DeclState.InputMod, { tag: VarTag.Buffered }],
        [TokenKind.TriggeredDeclaration]: [DeclState.InputMod, { tag: VarTag.Triggered }],
        [TokenKind.QueuedDeclaration]: [DeclState.InputMod, { tag: VarTag.Queued }],
    },
    [DeclState.Modifier]: {
        [TokenKind.InputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Input }],
        [TokenKind.OutputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Output }],
        [TokenKind.PublicDeclaration]: [DeclState.Complete, { modifier: VarModifier.Public }],
    },
    [DeclState.InputMod]: {
        [TokenKind.InputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Input }],
    }
};

export function declare_variable(cur: FileCursor, ast: SymbolTable): VariableDecl[] {

    let variable_dec = {
        type: SymbolType.Numeric,
        tag: VarTag.None,
        modifier: VarModifier.Local
    };

    let state = DeclState.Init;
    while (state !== DeclState.Complete) {
        let tk = cur.current();
        if (tk.type === TokenKind.NumberToken && variable_dec.type !== SymbolType.StringType) {
            cur.expect(TokenKind.InputDeclaration, "declaration error");
            return [];
        }
        let next: [DeclState, { [name: string]: number }] = declaration_states[state][tk.type];
        if (next) {
            cur.advance();
            Object.assign(variable_dec, next[1]);
            state = next[0];
        } else {
            cur.expect(TokenKind.InputDeclaration, "declaration error");
            return [];
        }
        if ((state === DeclState.Type || state === DeclState.InputType) && cur.matchAny(TokenKind.IdentifierToken)) {
            // local variables
            break;
        }
    }

    const decls: VariableDecl[] =
        declaration_list(cur, variable_dec.modifier === VarModifier.Local)
            .map(vi => Object.assign({
                name: vi.name,
                size: vi.index,
                range: vi.token.range
            }, variable_dec) as VariableDecl);

    decls.forEach(decl => {
        ast.declare_variable(decl);
    });

    return decls;
}

export function declaration_list(cur: FileCursor, local: boolean): VariableInst[] {
    const itm = declaration_list_item(cur, local);
    if (!itm) {
        //// error!!!
        return [];
    }
    const tks = [itm];
    while (cur.current().type === TokenKind.CommaSymbol) {
        cur.advance();
        let next = declaration_list_item(cur, local);
        if (next) {
            tks.push(next);
        } else {
            //// error try to recover!!!
            while (cur.remain() && !isEOL(cur)) {
                if (cur.matchAny(TokenKind.CommaSymbol)) {
                    break;
                }
                cur.advance();
            }
        }
    }
    if (!isEOL(cur)) {
        let range = { ...cur.current().range };
        consumeUntilEOL(cur);
        range.end = cur.current().range.end;
        range.lines = cur.current().range.line - range.line;
        cur.addError({
            id: EboErrors.IllegalExpression,
            severity: Severity.Error,
            message: "expected comma or end of line",
            range: range
        });
    }
    return tks;
}

export function declaration_list_item(cur: FileCursor, local: boolean): VariableInst | null {

    if (!cur.match(TokenKind.IdentifierToken)) {
        if (isKeyword(cur.current().type)) {
            cur.error("keyword used as identifier.");
        } else {
            cur.error("missing identifier.");
            return null;
        }
    }
    const tk = cur.current();
    let vi = new VariableInst(tk.value, tk);
    cur.advance();

    if (cur.matchAny(TokenKind.BracketLeftSymbol)) {
        let pos = cur.current().range;
        cur.advance();
        if (!cur.expect(TokenKind.NumberToken,
            "expected number for size of array.",
            EboErrors.ArraySizeInvalid)) {
            if (cur.match(TokenKind.BracketRightSymbol)) {
                cur.advance();
                return null;
            }
            return null;
        }
        let id = cur.current();
        vi.index = Number(id.value);
        cur.advance();
        if (!cur.expect(TokenKind.BracketRightSymbol, "missing closing bracket in array declaration.")) {
            return null;
        }
        if (!local) {
            cur.addError({
                id: EboErrors.ArrayNotAllowed,
                message: "array declaration only allowed on local variables.",
                range: { ...pos, end: cur.current().range.end },
                severity: Severity.Error
            });
        }
        cur.advance();
    }
    return vi;
}

export function declare_argument(cur: FileCursor, ast: SymbolTable): ParameterDecl[] {
    // EboKeyWords.ARG
    // TokenKind.TK_NUMBER
    // TokenKind.TK_IDENT

    if (!cur.expect(TokenKind.ArgDeclaration, "expected Arg declaration")) {
        return [];
    }
    cur.advance();

    if (!cur.expect(TokenKind.NumberToken, "expected number")) {
        return [];
    }
    let id = cur.current();
    cur.advance();

    if (!cur.expect(TokenKind.IdentifierToken, "expected identifier")) {
        return [];
    }
    let tk = cur.current();
    cur.advance();

    const decl: ParameterDecl = {
        type: SymbolType.Parameter,
        name: tk.value,
        range: tk.range,
        id: Number(id.value)
    };

    ast.declare_parameter(decl);
    return [decl];
}


export function parse_basedon_statement(cur: FileCursor, st: SymbolTable): BasedonExpr {
    const res = new BasedonExpr();
    if (!cur.expect(TokenKind.BasedonStatement, "expected BasedOn")) {
        return res;
    }
    cur.advance();
    res.variable = expression(cur, st);
    // if (!cur.expect(TokenKind.IdentifierToken, "expected numeric identifier")) {
    //     return res;
    // }
    // cur.advance();
    if (!parse_goto_statement(cur, st)) {
        return res;
    }
    while (cur.remain() > 0 && !isEOL(cur)) {
        const line = cur.current();
        res.lines.push(line);
        st.lookup_line(line);
        cur.advance();
        if (cur.matchAny(TokenKind.CommaSymbol)) {
            cur.advance();
        }
    }
    return res;
}

export function declare_function(cur: FileCursor, ast: SymbolTable): Declarations {
    cur.advance();
    const decl: FunctionDecl[] = parse_list(cur).map(tk => ({
        type: SymbolType.Function,
        name: tk.value,
        range: tk.range,
    }));
    decl.forEach(f => { ast.declare_function(f); });
    return decl;
}

type DeclarationAction = (fc: FileCursor, ast: SymbolTable) => Declarations;

const declare_actions: { [id: number]: DeclarationAction } = {
    [TokenKind.ArgDeclaration]: declare_argument,
    [TokenKind.DatetimeDeclaration]: declare_variable,
    [TokenKind.NumericDeclaration]: declare_variable,
    [TokenKind.StringDeclaration]: declare_variable,
    [TokenKind.DatafileDeclaration]: declare_variable,
    [TokenKind.TrendlogDeclaration]: declare_variable,
    [TokenKind.FunctionDeclaration]: declare_function,
};

export function parse_declarations(cursor: FileCursor, symTable: SymbolTable): Declarations {
    let decls: Declarations = [];
    while (cursor.remain() > 0) {
        if (cursor.match(TokenKind.EndOfLineToken)) {
            cursor.advance();
            continue;
        }
        const tk = cursor.current();
        const fn = declare_actions[tk.type];
        if (!fn) {
            return decls;
        }
        const decl = fn(cursor, symTable);
        decl.forEach(d => { decls.push(d as any); });
    }
    return decls;
}

type StatementAction = (fc: FileCursor, ast: SymbolTable, tks: VariableInst[]) => Statement;

const statement_actions: { [id: number]: StatementAction } = {
    [TokenKind.FunctionCallToken]: parse_function_expression,
    [TokenKind.ForStatement]: parse_for_statement,
    [TokenKind.RepeatStatement]: parse_repeat_statement,
    [TokenKind.WhileStatement]: parse_while_statement,
    [TokenKind.SelectStatement]: parse_select_statement,
    [TokenKind.IfStatement]: parse_if_exp,
    [TokenKind.EqualsSymbol]: parse_assignment,
    [TokenKind.PrintAction]: parse_print_statement,
    [TokenKind.SetAction]: parse_set_assignment,
    [TokenKind.ModifyAction]: parse_set_assignment,
    [TokenKind.LetAction]: parse_set_assignment,
    [TokenKind.AdjustAction]: parse_set_assignment,
    [TokenKind.ChangeAction]: parse_set_assignment,
    [TokenKind.EnableAction]: parse_start_assignment,
    [TokenKind.OpenAction]: parse_start_assignment,
    [TokenKind.StartAction]: parse_start_assignment,
    [TokenKind.CloseAction]: parse_stop_assignment,
    [TokenKind.ShutAction]: parse_stop_assignment,
    [TokenKind.DisableAction]: parse_stop_assignment,
    [TokenKind.TurnAction]: parse_turn_assignment,
    [TokenKind.AndOperator]: parse_assigned,
    [TokenKind.CommaSymbol]: parse_assigned,
    [TokenKind.GoStatement]: parse_goto,
    [TokenKind.GotoStatement]: parse_goto,
    [TokenKind.BasedonStatement]: parse_basedon_statement,
    [TokenKind.StopStatement]: parse_stop,
    [TokenKind.ReturnStatement]: parse_return_command,
    [TokenKind.BreakStatement]: parse_command,
    [TokenKind.ContinueStatement]: parse_command,
    [TokenKind.WaitStatement]: parse_wait_command,
};


/**
 * check for lines that are not used and calls to lines that do not exist.
 *
 * @param st
 */
function check_lines_valid_and_used(st: SymbolTable) {

    let issues: ErrorInfo[] = st.errors;

    if (!st.fallthru) {
        Object.keys(st.lines)
            .forEach(name => {
                if (name in st.line_refs || st.line_names[0] === name || name === "E") {
                    return;
                }
                issues.push({
                    id: EboErrors.UnreferencedLine,
                    severity: Severity.Warning,
                    message: `Line '${name}' not referenced.`,
                    range: st.lines[name].range
                });
            });
    }

    Object.keys(st.line_refs).forEach(name => {
        if (name in st.lines) { return; }
        st.line_refs[name].forEach(tk => {
            issues.push({
                id: EboErrors.UndefinedLine,
                severity: Severity.Error,
                message: `Line '${name}' not defined.`,
                range: tk.range
            });
        });
    });
}

/**
 * check for unused declarations
 *
 * @param st
 */
function check_declarations_used(st: SymbolTable) {

    let issues: ErrorInfo[] = st.errors;

    Object.keys(st.parameters)
        .forEach(name => {
            if (name in st.variable_refs) { return; }
            issues.push({
                id: EboErrors.UnreferencedDeclaration,
                severity: Severity.Information,
                message: `Parameter '${name}' is not used.`,
                range: st.parameters[name].range
            });
        });

    Object.keys(st.variables)
        .forEach(name => {
            if (name in st.variable_refs) { return; }
            issues.push({
                id: EboErrors.UnreferencedDeclaration,
                severity: Severity.Information,
                message: `Variable '${name}' is not used.`,
                range: st.variables[name].range
            });
        });

    Object.keys(st.functions)
        .forEach(name => {
            if (name in st.function_refs) { return; }
            issues.push({
                id: EboErrors.UnreferencedFunction,
                severity: Severity.Information,
                message: `Function '${name}' is not used.`,
                range: st.functions[name].range
            });
        });


}

function emit_parse_error(ast: SymbolTable, tk: LexToken) {
    ast.add_error({
        id: EboErrors.ParseError,
        severity: Severity.Information,
        message: `Parse error '${tk.value}'`,
        range: tk.range
    });
}

export function expression(cursor: FileCursor, st: SymbolTable, op: OpCode = OpCode.NOP): ExpressionStatement {
    let exp: ExpressionStatement = null_statement;
    while (cursor.remain()) {
        let tk = cursor.current();

        if (isFunctionKind(tk.type)) {
            exp = parse_function_expression(cursor, st);
            continue;
        }

        if (isValueKind(tk.type) || isVariableKind(tk.type)) {
            exp = tk;
            cursor.advance();
            continue;
        }

        if (tk.value in st.variables) {
            exp = parse_identifier(cursor, st);
            continue;
        }

        switch (tk.type) {
            case TokenKind.ArgDeclaration:
                exp = parse_arg_reference(cursor, st);
                break;

            case TokenKind.IdentifierToken:
                exp = parse_identifier(cursor, st);
                break;

            case TokenKind.TimeToken:
            case TokenKind.StringToken:
            case TokenKind.NumberToken:
                exp = tk;
                cursor.advance();
                break;

            case TokenKind.BitnotOperator:
            case TokenKind.NotOperator:
                exp = parse_operation_unary(cursor, st);
                break;

            case TokenKind.MinusSymbol:
            case TokenKind.PlusSymbol:
                if (exp) {
                    if (op !== OpCode.NOP && BinOpCodeLookup(tk) >= op) {
                        return exp;
                    }
                    exp = parse_binary_operation(cursor, st, exp);
                } else {
                    exp = parse_operation_unary(cursor, st);
                }
                break;

            case TokenKind.AngleLeftSymbol:
            case TokenKind.CaretSymbol:
            case TokenKind.AngleRightSymbol:
            case TokenKind.AsteriskSymbol:
            case TokenKind.EqualsSymbol:
            case TokenKind.SlashSymbol:
            case TokenKind.GreaterThanEqualSymbol:
            case TokenKind.LessThanEqualSymbol:
            case TokenKind.NotEqualSymbol:
            case TokenKind.SemicolonSymbol:
            case TokenKind.AndOperator:
            case TokenKind.AmpersandSymbol:
            case TokenKind.BitandOperator:
            case TokenKind.BitorOperator:
            case TokenKind.BitxorOperator:
            case TokenKind.DivideOperator:
            case TokenKind.EqualsOperator:
            case TokenKind.MinusOperator:
            case TokenKind.ModulusOperator:
            case TokenKind.OrOperator:
            case TokenKind.ExclamationSymbol:
            case TokenKind.PlusOperator:
            case TokenKind.TimesOperator:
                if (op !== OpCode.NOP && BinOpCodeLookup(tk) >= op) {
                    return exp;
                }
                exp = parse_binary_operation(cursor, st, exp);
                break;

            case TokenKind.IsOperator:
            case TokenKind.DoesOperator:
                if (op !== OpCode.NOP && BinOpCodeLookup(tk) >= op) {
                    return exp;
                }
                exp = parse_is_statement(cursor, st, exp);
                break;

            case TokenKind.FunctionCallToken:
                exp = parse_function_expression(cursor, st);
                break;

            case TokenKind.ParenthesesLeftSymbol:
                exp = parse_parentheses_expression(cursor, st);
                break;

            case TokenKind.ColonSymbol:
                cursor.advance();
                cursor.addError({
                    severity: Severity.Error,
                    id: EboErrors.IllegalExpression,
                    message: "Illegal Expression, unexpected colon.",
                    range: tk.range
                });
                return errorExpr(tk);

            case TokenKind.CommaSymbol:
            case TokenKind.ThenStatement:
            case TokenKind.ParenthesesRightSymbol:
            case TokenKind.BracketRightSymbol:
            case TokenKind.EndOfFileToken:
            case TokenKind.EndOfLineToken:
            default:
                return exp;
        }
    }
    return exp;
}


export function parse_identifier(cursor: FileCursor, symTable: SymbolTable): VariableInst {
    const tk = cursor.current();
    cursor.advance();
    const vi = new VariableInst(tk.value, tk);
    if (cursor.matchAny(
        TokenKind.AlarmKeyword, TokenKind.RefreshKeyword,
        TokenKind.SizeKeyword, TokenKind.StateKeyword)) {
        // continuum properties
        vi.property = cursor.current();
        cursor.advance();
    } else if (cursor.matchAny(TokenKind.BracketLeftSymbol)) {
        vi.index = parse_bracket_expression(cursor, symTable);
    }
    symTable.lookup_variable(tk);
    return vi;
}

export function parse_arg_reference(cursor: FileCursor, symTable: SymbolTable): ArgInst {
    const tk = cursor.current();
    cursor.advance();
    const vi = new ArgInst(tk.value, tk);
    if (!cursor.expect(TokenKind.BracketLeftSymbol, "Argument references require indexes")) {
        return vi;
    }
    vi.id = parse_bracket_expression(cursor, symTable);
    if (cursor.matchAny(TokenKind.BracketLeftSymbol)) {
        vi.index = parse_bracket_expression(cursor, symTable);
    }
    // symTable.lookup_variable(tk);
    return vi;
}

export function parse_statement(cursor: FileCursor, symTable: SymbolTable): Statement {
    const tks: VariableInst[] = [];
    while (!cursor.matchAny(TokenKind.EndOfLineToken)) {
        let tk = cursor.current();
        if (cursor.match(TokenKind.IdentifierToken) || tk.value in symTable.variables) {
            if (cursor.item(1).type === TokenKind.ColonSymbol) {
                break;
            }
            tks.push(parse_identifier(cursor, symTable));
            continue;
        }
        if (cursor.match(TokenKind.ArgDeclaration)) {
            tks.push(parse_arg_reference(cursor, symTable));
            continue;
        }
        const fn = statement_actions[tk.type];
        if (fn) {
            const stmt = fn(cursor, symTable, tks);
            consumeEOL(cursor);
            return stmt;
        }
        if (isFunctionKind(tk.type)) {
            return parse_function_expression(cursor, symTable);
        }
        break;
    }
    return null_statement;
}

function group_assign_blocks(stmts: Statements): Statements {
    const result: Statements = [];
    let i = 0;
    while (i < stmts.length) {
        if (stmts[i] instanceof AssignStatement) {
            const block = new AssignBlock();
            while (i < stmts.length && stmts[i] instanceof AssignStatement) {
                block.assignments.push(stmts[i] as AssignStatement);
                i++;
            }
            if (block.assignments.length === 1) {
                result.push(block.assignments[0]);
            } else {
                result.push(block);
            }
        } else {
            result.push(stmts[i]);
            i++;
        }
    }
    return result;
}

export function parse_statements(cursor: FileCursor, symTable: SymbolTable): Statements {
    consumeEOL(cursor);
    let stmts: Statements = [];
    while (cursor.remain() > 0) {
        const stmt = parse_statement(cursor, symTable);
        if (!stmt) {
            break;
        }
        stmts.push(stmt);
        consumeEOL(cursor);
    }
    return group_assign_blocks(stmts);
}

const reFallthru = /\bfallthru\b/i;
const isFallthru = (tk: LexToken) => tk.type === TokenKind.CommentToken && reFallthru.test(tk.value);


function check_is_fallthru(tkn_lists: LexToken[]) {
    // check for fallthru to disable warnings
    return tkn_lists.some(isFallthru);
}


export function parse_line(cursor: FileCursor, symTable: SymbolTable) {
    if (cursor.remain() < 2) {
        return;
    }
    let tk = cursor.item(0);
    switch (tk.type) {
        case TokenKind.ErrorLine:
        case TokenKind.NumberToken:
        case TokenKind.IdentifierToken:
            if (cursor.item(1).type === TokenKind.ColonSymbol) {
                if (cursor.remain() < 3 || cursor.item(2).type === TokenKind.EndOfLineToken) {
                    cursor.advance(3);
                    symTable.declare_line(tk);
                    return tk;
                }
            }
            break;
        case TokenKind.LineStatement:
            tk = cursor.item(1);
            if (tk.type === TokenKind.IdentifierToken ||
                tk.type === TokenKind.NumberToken ||
                tk.type === TokenKind.ErrorLine
            ) {
                if (cursor.remain() < 3 || cursor.item(2).type === TokenKind.EndOfLineToken) {
                    cursor.advance(3);
                    symTable.declare_line(tk);
                    return tk;
                }
                break;
            }
    }
    // Handle keyword used as a bare line label: e.g. DST:
    if (isKeyword(tk.type) && cursor.item(1).type === TokenKind.ColonSymbol) {
        if (cursor.remain() < 3 || cursor.item(2).type === TokenKind.EndOfLineToken) {
            cursor.advance(3);
            symTable.add_error({
                id: EboErrors.KeywordUsedAsLineName,
                severity: Severity.Warning,
                message: `Keyword '${tk.value}' used as line name; consider renaming the line.`,
                range: tk.range
            });
            symTable.declare_line(tk);
            return tk;
        }
    }
    return undefined;
}

export function parse_program(cursor: FileCursor, symTable: SymbolTable): Program {
    const pgm = new Program();
    pgm.declarations = parse_declarations(cursor, symTable);
    if (symTable.parameter_ids.length) {
        pgm.type = ProgramType.Function;
    }
    const initial_line: LineStatement = new LineStatement();
    initial_line.statements = parse_statements(cursor, symTable);
    if (initial_line.statements.length) {
        pgm.lines.push(initial_line);
    }
    if (pgm.type === ProgramType.Function && cursor.remain()) {
        symTable.add_error({
            id: EboErrors.ParseError,
            message: "expected end of function",
            severity: Severity.Error,
            range: cursor.current().range,
        });
    }
    while (cursor.remain()) {
        if (cursor.match(TokenKind.EndOfLineToken)) {
            cursor.advance();
            continue;
        }
        if (cursor.match(TokenKind.EndOfFileToken)) {
            break;
        }
        const line: LineStatement = new LineStatement();
        const tk = parse_line(cursor, symTable);
        if (tk) {
            line.token = tk;
            line.name = tk.value;
        } else if (pgm.lines.length > 0) {
            symTable.add_error({
                id: EboErrors.ParseError,
                message: "expected line statement",
                severity: Severity.Error,
                range: cursor.current().range,
            });
            while (cursor.remain() && !cursor.matchAny(TokenKind.EndOfLineToken, TokenKind.EndOfFileToken)) {
                cursor.advance();
            }
        }
        while (cursor.match(TokenKind.EndOfLineToken)) {
            cursor.advance();
        }
        line.statements = parse_statements(cursor, symTable);
        pgm.lines.push(line);
    }
    return pgm;
}

export function ebo_parse_file(fileText: string) {

    const tkn_lists = ebo_scan_text(fileText);

    const symTable = new SymbolTable();

    symTable.fallthru = check_is_fallthru(tkn_lists);

    const tkData = removeWhiteSpace(tkn_lists);
    const cursor = new FileCursor(tkData, symTable);

    const pgm = parse_program(cursor, symTable);

    check_lines_valid_and_used(symTable);
    check_declarations_used(symTable);
    return symTable;
}

export function removeWhiteSpace(tks: LexToken[]) {
    return tks.filter(tk => tk.type !== TokenKind.WhitespaceToken &&
        tk.type !== TokenKind.CommentToken &&
        tk.type !== TokenKind.ContinueLineToken
    );
}

