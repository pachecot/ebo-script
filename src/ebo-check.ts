import { TokenKind, isFunctionKind } from './ebo-types';
import { TextRange, LexToken, ebo_scan_text } from './ebo-scanner';


/**
 *
 */
export enum EboErrors {
    None,
    ParseError,
    MissingCloseParentheses,
    ExtraCloseParentheses,
    DuplicateLine,
    UnreferencedLine,
    UndefinedLine,
    UnreferencedDeclaration,
    DuplicateDeclaration,
    UndeclaredVariable,
    LineUsedAsVariable,
    FunctionUsedAsVariable,
    UndeclaredFunction,
    RedeclaredFunction,
    UnreferencedFunction,
    IllegalAssignment
}


/**
 * Represents the severity of diagnostics.
 */
export enum Severity {
    // from vscode.

    /**
     * Something not allowed by the rules of a language or other means.
     */
    Error = 0,

    /**
     * Something suspicious but allowed.
     */
    Warning = 1,

    /**
     * Something to inform about but not a problem.
     */
    Information = 2,

    /**
     * Something to hint to a better way of doing it, like proposing
     * a refactoring.
     */
    Hint = 3
}

interface ErrorInfo {
    id: EboErrors
    severity: Severity
    message: string
    range: TextRange
}

interface Cursor {
    current: () => LexToken
    item: (index: number) => LexToken
    remain: () => number
    advance: (count?: number) => void
}

enum SymbolType {
    StringType = 1
    , Numeric
    , DateTime
    , Function
    , Parameter
    , Line
}

interface SymbolDecl {
    name: string
    type: SymbolType
    range: TextRange
}

enum VarModifier {
    Local = 1
    , Input
    , Output
    , Public
}

enum VarTag {
    None = 1
    , Triggered
    , Buffered
}

type VariableType = SymbolType.StringType | SymbolType.Numeric | SymbolType.DateTime;

interface VariableDecl extends SymbolDecl {
    type: VariableType
    modifier: VarModifier
    tag: VarTag
    size?: number
}

interface ParameterDecl extends SymbolDecl {
    type: SymbolType.Parameter
    id: number
}

interface FunctionDecl extends SymbolDecl {
    type: SymbolType.Function
}

interface VariableInst {
    name: string
    index?: number
    token: LexToken
}

interface SymbolTable {
    parameters: { [name: string]: ParameterDecl }
    variables: { [name: string]: VariableDecl }
}

/**
 * try to parse the various goto statements.
 * return true if success and advance to the
 * next position
 */
function parse_goto_statement(cur: Cursor): boolean {
    const goto_tags: TokenKind[] = [TokenKind.GoStatement, TokenKind.ToKeyWord, TokenKind.GotoStatement, TokenKind.LineStatement];
    while (goto_tags.includes(cur.current().type)) { cur.advance(); }
    return true;
}

function parse_goto(cur: Cursor): LexToken {
    parse_goto_statement(cur);
    return cur.current();
}


function parse_variable_list_item(cur: Cursor): VariableInst {
    let tk = cur.current();
    cur.advance();
    if (cur.item(0).type === TokenKind.BracketLeftSymbol) {
        let id = cur.item(1);
        cur.advance(3);
        return {
            name: tk.value,
            token: tk,
            index: Number(id.value)
        };
    }
    return {
        name: tk.value,
        token: tk
    };
}

function parse_variable_list_rest(cur: Cursor): VariableInst[] {
    let tks: VariableInst[] = [];
    while (cur.current().type === TokenKind.CommaSymbol) {
        cur.advance();
        let tk = parse_variable_list_item(cur);
        if (tk) { tks.push(tk); }
    }
    return tks;
}

function parse_variable_list(cur: Cursor): VariableInst[] {
    let itm = parse_variable_list_item(cur);
    if (itm) {
        const tks = [itm].concat(parse_variable_list_rest(cur));
        cur.advance(-1);
        return tks;
    }
    return [];
}

interface FunctionExpression {
    function: LexToken
    arguments: LexToken[][];
}

function parse_function(st: SymbolTable, cur: Cursor): FunctionExpression {
    let fn = cur.current();
    if (!isFunctionKind(fn.type)) {
        st.lookup_function(fn);
    }
    let args: LexToken[][] = [];
    let arg: LexToken[] = [];
    let count = 1;
    args.push(arg);
    cur.advance();
    cur.advance();
    let tk = cur.current();
    while (tk) {
        if (tk.type === TokenKind.ParenthesesRightSymbol) {
            --count;
            if (count === 0) { break; }
        }
        if (tk.type === TokenKind.ParenthesesLeftSymbol) { ++count; }
        if (tk.type === TokenKind.CommaSymbol && count === 1) {
            arg = [];
            args.push(arg);
        } else {
            arg.push(tk);
        }
        cur.advance();
        tk = cur.current();
    }
    args.forEach(arg => { parse_expression(arg, st); });
    return {
        function: fn,
        arguments: args
    };
}

interface AssignExpression {
    assigned: VariableInst[]
    expression: LexToken[];
}

function parse_assignment(st: SymbolTable, cur: Cursor): AssignExpression {
    let assigned: VariableInst[] = [];
    let expression: LexToken[] = [];
    let tk = cur.current();
    while (tk.type !== TokenKind.EqualsSymbol) {
        if (tk.type === TokenKind.IdentifierToken) {
            assigned.push(parse_variable_list_item(cur));
        } else {
            cur.advance();
        }
        tk = cur.current();
    }
    cur.advance();
    tk = cur.current();
    while (tk && tk.type !== TokenKind.EndOfLineToken) {
        expression.push(tk);
        cur.advance();
        tk = cur.current();
    }
    assigned.forEach(id => { st.lookup_variable(id.token, true); });
    parse_expression(expression, st);
    return {
        assigned,
        expression
    };
}


function parse_set_assignment(st: SymbolTable, cur: Cursor): AssignExpression {
    let assigned: VariableInst[] = [];
    let expression: LexToken[] = [];
    let tk = cur.current();
    while (tk.type !== TokenKind.EqualsSymbol && tk.type !== TokenKind.ToKeyWord) {
        if (tk.type === TokenKind.IdentifierToken) {
            assigned.push(parse_variable_list_item(cur));
        } else {
            cur.advance();
        }
        tk = cur.current();
    }
    cur.advance();
    tk = cur.current();
    while (tk && tk.type !== TokenKind.EndOfLineToken) {
        expression.push(tk);
        cur.advance();
        tk = cur.current();
    }
    assigned.forEach(id => { st.lookup_variable(id.token, true); });
    parse_expression(expression, st);
    return {
        assigned,
        expression
    };
}

function parse_turn_assignment(st: SymbolTable, cur: Cursor): AssignExpression {
    let assigned: VariableInst[] = [];
    let expression: LexToken[] = [];
    let tk = cur.current();
    while (tk) {

        switch (tk.type) {
            case TokenKind.IdentifierToken:
                assigned.push(parse_variable_list_item(cur));
                break;
            case TokenKind.OffValue:  // fallthru
            case TokenKind.OnValue:
                expression.push(tk);
            //fallthru
            default:
                cur.advance();
                break;
        }
        tk = cur.current();
    }
    assigned.forEach(id => { st.lookup_variable(id.token, true); });
    parse_expression(expression, st);
    return {
        assigned,
        expression
    };
}


type ConditionExpression = LexToken[];
type Expression = LexToken[];

const enum ForState { C, T, F, E }

interface ForExpression {
    cond_expr: ConditionExpression
    true_expr?: Expression
    false_expr?: Expression
}


const if_then_states: { [id: number]: ForState } = {
    [TokenKind.IfStatement]: ForState.C,
    [TokenKind.ThenStatement]: ForState.T,
    [TokenKind.ElseStatement]: ForState.F,
    [TokenKind.EndOfLineToken]: ForState.E,
};


function parse_if_exp(st: SymbolTable, cur: Cursor): ForExpression {

    const data: { [name: string]: LexToken[] } = {};

    let tks: LexToken[] = [];
    let state = if_then_states[cur.current().type];
    cur.advance();

    while (state && state !== ForState.E) {
        const tk = cur.current();
        if (if_then_states[tk.type]) {
            data[state] = tks;
            state = if_then_states[tk.type];
            tks = [];
        } else {
            tks.push(tk);;
        }
        cur.advance();
    }

    const res = {
        cond_expr: data[ForState.C] || [],
        true_expr: data[ForState.T] || [],
        false_expr: data[ForState.F] || []
    };

    parse_expression(res.cond_expr, st);
    parse_statements(res.true_expr, st);
    parse_statements(res.false_expr, st);

    return res;
}


/**
 * comma separated list of tokens
 */
function parse_list(cur: Cursor): LexToken[] {
    let tk = cur.current();
    if (tk) {
        cur.advance();
        let tks: LexToken[] = [tk];
        while (cur.current().type === TokenKind.CommaSymbol) {
            cur.advance();
            tks.push(cur.current());
            cur.advance();
        }
        cur.advance(-1);
        return tks;
    }
    return [];
}


const enum DeclState { Init, Type, Modifier, Complete };

const declaration_states: {
    [id: string]: {
        [t: number]: [DeclState, { [name: string]: number }]
    }
} = {
    [DeclState.Init]: {
        [TokenKind.StringDeclaration]: [DeclState.Type, { type: SymbolType.StringType }],
        [TokenKind.NumericDeclaration]: [DeclState.Type, { type: SymbolType.Numeric }],
        [TokenKind.DatetimeDeclaration]: [DeclState.Type, { type: SymbolType.DateTime }],
    },
    [DeclState.Type]: {
        [TokenKind.InputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Input }],
        [TokenKind.OutputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Output }],
        [TokenKind.PublicDeclaration]: [DeclState.Complete, { modifier: VarModifier.Public }],
        [TokenKind.BufferedDeclaration]: [DeclState.Modifier, { tag: VarTag.Buffered }],
        [TokenKind.TriggeredDeclaration]: [DeclState.Modifier, { tag: VarTag.Triggered }],
    },
    [DeclState.Modifier]: {
        [TokenKind.InputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Input }],
        [TokenKind.OutputDeclaration]: [DeclState.Complete, { modifier: VarModifier.Output }],
        [TokenKind.PublicDeclaration]: [DeclState.Complete, { modifier: VarModifier.Public }],
    }
};

function parse_declaration(cur: Cursor): VariableDecl[] {

    let variable_dec = {
        type: SymbolType.Numeric,
        tag: VarTag.None,
        modifier: VarModifier.Local
    };

    let state_name = DeclState.Init;
    while (state_name !== DeclState.Complete) {
        let tk = cur.current();
        let next: [DeclState, { [name: string]: number }] = declaration_states[state_name][tk.type];
        if (next) {
            cur.advance();
            Object.assign(variable_dec, next[1]);
            state_name = next[0];
        } else {
            // local variables
            if (state_name !== DeclState.Type) { break; }
            state_name = DeclState.Complete;
        }
    }
    if (state_name !== DeclState.Complete) {
        //// error!!!
        return [];
    }

    return parse_variable_list(cur)
        .map(vi => Object.assign({
            name: vi.name,
            size: vi.index,
            range: vi.token.range
        }, variable_dec) as VariableDecl);
}


function parse_parameter(cur: Cursor): ParameterDecl {
    // EboKeyWords.ARG
    // TokenKind.TK_NUMBER
    // TokenKind.TK_IDENT

    let id = cur.item(1);
    let tk = cur.item(2);
    cur.advance(2);

    return {
        type: SymbolType.Parameter,
        name: tk.value,
        range: tk.range,
        id: Number(id.value)
    };
}

interface BasedonExpr {
    variable: LexToken
    lines: LexToken[]
}

function parse_basedon(cur: Cursor): BasedonExpr {

    const variable = cur.item(1);
    const lines: LexToken[] = [];
    cur.advance(2);
    parse_goto_statement(cur);
    while (cur.remain() > 0 && cur.current().type !== TokenKind.EndOfLineToken) {
        if (cur.current().type !== TokenKind.CommaSymbol) {
            lines.push(cur.current());
        }
        cur.advance();
    }
    return { variable, lines };
}


export class LineCursor implements Cursor {
    #pos = 0;
    constructor(private items: LexToken[]) { }
    remain() {
        return this.items.length - this.#pos;
    }
    current() {
        return this.items[this.#pos];
    }
    item(index: number) {
        return this.items[index];
    }
    advance(amt = 1) {
        this.#pos += amt;
    }
}

function functionDecl(tk: LexToken): FunctionDecl {
    return {
        type: SymbolType.Function,
        name: tk.value,
        range: tk.range,
    };
}

class SymbolTable {

    errors: ErrorInfo[] = [];
    parens_depth = 0;
    fallthru = false;
    lines: { [name: string]: LexToken } = {};
    line_names: string[] = [];
    line_refs: { [name: string]: LexToken[] } = {};

    symbols: { [name: string]: SymbolDecl } = {};
    functions: { [name: string]: FunctionDecl } = {};
    variables: { [name: string]: VariableDecl } = {};
    parameters: { [name: string]: ParameterDecl } = {};
    parameter_ids: string[] = [];

    assigned_refs: { [name: string]: LexToken[] } = {};
    variable_refs: { [name: string]: LexToken[] } = {};
    function_refs: { [name: string]: LexToken[] } = {};

    lookup_variable(tk: LexToken, assign?: boolean) {
        const name = tk.value;
        const refs = this.variable_refs[name] || (this.variable_refs[name] = []);
        refs.push(tk);
        if (assign) {
            const sets = this.assigned_refs[name] || (this.assigned_refs[name] = []);
            sets.push(tk);
        }

        if (name in this.symbols) {
            if (name in this.functions) {
                this.add_error({
                    id: EboErrors.FunctionUsedAsVariable,
                    severity: Severity.Error,
                    message: `Function '${name}' used as a variable.`,
                    range: tk.range
                });
            }
            if (name in this.lines) {
                this.add_error({
                    id: EboErrors.LineUsedAsVariable,
                    severity: Severity.Error,
                    message: `Line '${name}' used as a variable.`,
                    range: tk.range
                });
            }
            if (assign) {
                const vd = this.variables[name];
                if (vd && (vd.modifier === VarModifier.Input)) {
                    this.add_error({
                        severity: Severity.Error,
                        id: EboErrors.IllegalAssignment,
                        message: "assignment not allowed",
                        range: tk.range
                    });
                }
            }
        } else {
            this.add_error({
                id: EboErrors.UndeclaredVariable,
                severity: Severity.Error,
                message: `Variable '${name}' is not declared`,
                range: tk.range
            });
        }

        return this.variables[name];
    }

    lookup_function(tk: LexToken) {
        const name = tk.value;
        const arr = this.function_refs[name] || (this.function_refs[name] = []);
        arr.push(tk);
        if (!(name in this.functions)) {
            this.add_error({
                id: EboErrors.UndeclaredVariable,
                severity: Severity.Error,
                message: `Function '${name}' is not declared`,
                range: tk.range
            });
        }
    }

    lookup_line(tk: LexToken) {
        const name = tk.value;
        const arr = this.line_refs[name] || (this.line_refs[name] = []);
        arr.push(tk);
    }

    declare_line(lineTk: LexToken) {
        const name = lineTk.value;
        if (name in this.symbols) {
            this.add_error({
                id: EboErrors.DuplicateLine,
                severity: Severity.Error,
                message: `Line '${name}' already exists.`,
                range: lineTk.range
            });
        } else {
            if (name in this.variable_refs) {
                /// check again here for newly defined lines. 
                this.variable_refs[name]
                    .forEach(vr => {
                        this.add_error({
                            id: EboErrors.LineUsedAsVariable,
                            severity: Severity.Error,
                            message: `Line '${name}' used as variable.`,
                            range: vr.range
                        });
                    });
            }
            this.lines[name] = lineTk;
            this.line_names.push(name);
            this.symbols[name] = {
                type: SymbolType.Line,
                name: name,
                range: lineTk.range
            };
        }
    }

    declare_variable(variable: VariableDecl) {
        const name = variable.name;
        if (name in this.symbols) {
            this.add_error({
                id: EboErrors.DuplicateDeclaration,
                severity: Severity.Error,
                message: `Variable '${name}' is redeclared`,
                range: variable.range
            });
        } else {
            this.symbols[name] = variable;
            this.variables[name] = variable;
        }
    }

    declare_function(functionDecl: FunctionDecl) {
        const name = functionDecl.name;
        if (name in this.symbols) {
            this.add_error({
                id: EboErrors.DuplicateDeclaration,
                severity: Severity.Error,
                message: `Function '${name}' is redeclared!`,
                range: functionDecl.range
            });
        } else {
            this.symbols[name] = functionDecl;
            this.functions[name] = functionDecl;
        }
    }

    declare_parameter(parameter: ParameterDecl) {
        const name = parameter.name;
        if (name in this.symbols) {
            this.add_error({
                id: EboErrors.DuplicateDeclaration,
                severity: Severity.Error,
                message: `Parameter '${name}' is redeclared!`,
                range: parameter.range
            });
        } else {
            if (this.parameter_ids[parameter.id]) {
                this.add_error({
                    id: EboErrors.DuplicateDeclaration,
                    severity: Severity.Error,
                    message: `Parameter '${name}' is redeclared with existing id: ${parameter.id}!`,
                    range: parameter.range
                });
            }
            this.symbols[name] = parameter;
            this.parameters[name] = parameter;
            this.parameter_ids[parameter.id] = name;
        }
    }

    add_error(info: ErrorInfo) {
        this.errors.push(info);
    }
}


const enum ParseState {
    UNKNOWN
    , ARG
    , ARG_END
    , ARG_ID
    , ARRAY_CLOSE
    , ARRAY_INDEX
    , ASSIGN
    , ASSIGN_ARRAY
    , ASSIGN_ARRAY_CL
    , ASSIGN_END
    , ASSIGN_MORE
    , ASSIGN_TO
    , ASSIGN_TO_END
    , BASEDON
    , BASEDON_END
    , BASEDON_GO
    , BASEDON_GOTO
    , BASEDON_GOTO_LINE
    , BASEDON_GOTO_LIST
    , BASEDON_GOTO_LIST_ITEM
    , BASEDON_I
    , DECLARE_FUNCTION
    , DECLARE_FUNCTIONS
    , DECLARE_FUNCTIONS_END
    , DECLARE_IDENT
    , DECLARE_IDENT_LOC
    , DECLARE_IN
    , DECLARE_LOC_AR_CL
    , DECLARE_LOC_AR_SZ
    , DECLARE_MOD
    , DECLARES
    , DECLARES_END
    , DECLARES_LOC
    , ERROR
    , EXPR
    , EXPR_IDENT
    , FUNCTION_CALL
    , FUNCTION_CALL_END
    , GO
    , GOTO
    , GOTO_END
    , GOTO_LINE
    , IDENT
    , IDENT_ID_END
    , IF
    , IF_EXP
    , IF_THEN
    , IF_THEN_ELSE
    , IF_THEN_ELSE_EXP
    , IF_THEN_ELSE_EXP_END
    , IF_THEN_END
    , IF_THEN_EXP
    , IF_THEN_EXP_END
    , INIT
    , LINE_ID_END
    , LINE_TAG
    , LINE_TAG_END
    , TURN
    , TURN_VAL
    , TURN_STATEMENT_END
    , SET
    , SET_ARRAY
    , SET_ARRAY_CL
    , SET_EXPR
    , SET_MORE
    , SET_STATEMENT_END
    , SET_VAR
    , SYS_FUNCTION
    , SYS_FUNCTION_END
    , ARRAY_INIT
};

function parse_array_x(expression: LexToken[], symTable: SymbolTable) {
    let stack: LexToken[] = [];
    let depth = 0;
    let i = 0;
    if (expression[i].type === TokenKind.BracketLeftSymbol) {
        ++depth;
        while (depth && ++i < expression.length) {
            const tk = expression[i];
            switch (tk.type) {
                case TokenKind.BracketLeftSymbol: ++depth; break;
                case TokenKind.BracketRightSymbol: --depth; break;
            }
            if (depth) {
                stack.push(tk);
            }
        }
    }
    return stack;
}


type ParseMap = { [name: number]: { [id: number]: number, _?: number } };

const states: ParseMap = {
    [ParseState.INIT]: {
        [TokenKind.BasedonStatement]: ParseState.BASEDON,
        [TokenKind.GoStatement]: ParseState.GO,
        [TokenKind.GotoStatement]: ParseState.GOTO,
        [TokenKind.IfStatement]: ParseState.IF,
        [TokenKind.LineStatement]: ParseState.LINE_TAG,
        [TokenKind.ArgDeclaration]: ParseState.ARG,
        [TokenKind.DatetimeDeclaration]: ParseState.DECLARE_MOD,
        [TokenKind.FunctionDeclaration]: ParseState.DECLARE_FUNCTION,
        [TokenKind.NumericDeclaration]: ParseState.DECLARE_MOD,
        [TokenKind.StringDeclaration]: ParseState.DECLARE_MOD,
        [TokenKind.ErrorToken]: ParseState.ERROR,
        [TokenKind.FunctionCallToken]: ParseState.FUNCTION_CALL,
        [TokenKind.IdentifierToken]: ParseState.IDENT,
        [TokenKind.SetAction]: ParseState.SET,
        [TokenKind.AdjustAction]: ParseState.SET,
        [TokenKind.ModifyAction]: ParseState.SET,
        [TokenKind.ChangeAction]: ParseState.SET,
        [TokenKind.TurnAction]: ParseState.TURN,
    },
    [ParseState.EXPR]: {
        [TokenKind.IdentifierToken]: ParseState.EXPR_IDENT,
        // [TokenKind.NumberToken]: ParseState.EXPR_IDENT,
        // [TokenKind.TimeToken]: ParseState.EXPR_IDENT,
        [TokenKind.FunctionCallToken]: ParseState.FUNCTION_CALL,
    },
    [ParseState.DECLARE_MOD]: {
        [TokenKind.BufferedDeclaration]: ParseState.DECLARE_IN,
        [TokenKind.TriggeredDeclaration]: ParseState.DECLARE_IN,
        [TokenKind.PublicDeclaration]: ParseState.DECLARE_IDENT,
        [TokenKind.InputDeclaration]: ParseState.DECLARE_IDENT,
        [TokenKind.OutputDeclaration]: ParseState.DECLARE_IDENT,
        [TokenKind.IdentifierToken]: ParseState.DECLARES_LOC
    },
    [ParseState.DECLARE_IN]: {
        [TokenKind.InputDeclaration]: ParseState.DECLARE_IDENT
    },
    [ParseState.DECLARE_IDENT]: {
        [TokenKind.IdentifierToken]: ParseState.DECLARES
    },
    [ParseState.DECLARE_IDENT_LOC]: {
        [TokenKind.IdentifierToken]: ParseState.DECLARES_LOC
    },
    [ParseState.DECLARE_LOC_AR_SZ]: {
        [TokenKind.NumberToken]: ParseState.DECLARE_LOC_AR_CL,
    },
    [ParseState.DECLARE_LOC_AR_CL]: {
        [TokenKind.BracketRightSymbol]: ParseState.DECLARES_LOC,
    },
    [ParseState.DECLARES_LOC]: {
        [TokenKind.BracketLeftSymbol]: ParseState.DECLARE_LOC_AR_SZ,
        [TokenKind.CommaSymbol]: ParseState.DECLARE_IDENT_LOC,
        [TokenKind.EndOfLineToken]: ParseState.DECLARES_END
    },
    [ParseState.DECLARES]: {
        [TokenKind.CommaSymbol]: ParseState.DECLARE_IDENT,
        [TokenKind.EndOfLineToken]: ParseState.DECLARES_END
    },
    [ParseState.BASEDON]: {
        [TokenKind.IdentifierToken]: ParseState.BASEDON_I
    },
    [ParseState.BASEDON_I]: {
        [TokenKind.GoStatement]: ParseState.BASEDON_GO,
        [TokenKind.GotoStatement]: ParseState.BASEDON_GOTO,
    },
    [ParseState.BASEDON_GO]: {
        [TokenKind.ToKeyWord]: ParseState.BASEDON_GOTO,
        [TokenKind.LineStatement]: ParseState.BASEDON_GOTO_LIST,
        [TokenKind.IdentifierToken]: ParseState.BASEDON_GOTO_LIST_ITEM,
        [TokenKind.NumberToken]: ParseState.BASEDON_GOTO_LIST_ITEM
    },
    [ParseState.BASEDON_GOTO]: {
        [TokenKind.LineStatement]: ParseState.BASEDON_GOTO_LIST,
        [TokenKind.IdentifierToken]: ParseState.BASEDON_GOTO_LIST_ITEM,
        [TokenKind.NumberToken]: ParseState.BASEDON_GOTO_LIST_ITEM
    },
    [ParseState.BASEDON_GOTO_LIST]: {
        [TokenKind.IdentifierToken]: ParseState.BASEDON_GOTO_LIST_ITEM,
        [TokenKind.NumberToken]: ParseState.BASEDON_GOTO_LIST_ITEM,
    },
    [ParseState.BASEDON_GOTO_LIST_ITEM]: {
        [TokenKind.CommaSymbol]: ParseState.BASEDON_GOTO_LIST,
        [TokenKind.EndOfLineToken]: ParseState.BASEDON_END
    },
    [ParseState.GO]: {
        [TokenKind.ToKeyWord]: ParseState.GOTO,
        [TokenKind.LineStatement]: ParseState.GOTO_LINE,
        [TokenKind.IdentifierToken]: ParseState.GOTO_END,
        [TokenKind.NumberToken]: ParseState.GOTO_END
    },
    [ParseState.GOTO]: {
        [TokenKind.LineStatement]: ParseState.GOTO_LINE,
        [TokenKind.IdentifierToken]: ParseState.GOTO_END,
        [TokenKind.NumberToken]: ParseState.GOTO_END
    },
    [ParseState.GOTO_LINE]: {
        [TokenKind.LineStatement]: ParseState.BASEDON_GOTO,
        [TokenKind.IdentifierToken]: ParseState.GOTO_END,
        [TokenKind.NumberToken]: ParseState.GOTO_END
    },
    [ParseState.ARG]: {
        [TokenKind.NumberToken]: ParseState.ARG_ID,
    },
    [ParseState.ARG_ID]: {
        [TokenKind.IdentifierToken]: ParseState.ARG_END
    },
    [ParseState.FUNCTION_CALL]: {
        _: ParseState.FUNCTION_CALL,
        [TokenKind.ParenthesesRightSymbol]: ParseState.FUNCTION_CALL_END,
    },
    // [ParseState.SYS_FUNCTION]: {
    //     _: ParseState.FUNCTION_CALL,
    //     [TokenKind.ParenthesesRightSymbol]: ParseState.FUNCTION_CALL_END,
    // },
    [ParseState.EXPR_IDENT]: {
        _: ParseState.IDENT_ID_END
    },
    [ParseState.IDENT]: {
        [TokenKind.ColonSymbol]: ParseState.LINE_ID_END,
        [TokenKind.EqualsSymbol]: ParseState.ASSIGN_END,
        [TokenKind.BracketLeftSymbol]: ParseState.ASSIGN_ARRAY,
        [TokenKind.AmpersandSymbol]: ParseState.ASSIGN_MORE,
        [TokenKind.AndOperator]: ParseState.ASSIGN_MORE,
        [TokenKind.CommaSymbol]: ParseState.ASSIGN_MORE,
        _: ParseState.IDENT_ID_END
    },
    [ParseState.ASSIGN_ARRAY]: {
        [TokenKind.IdentifierToken]: ParseState.ASSIGN_ARRAY_CL,
        [TokenKind.NumberToken]: ParseState.ASSIGN_ARRAY_CL,
    },
    [ParseState.ASSIGN_ARRAY_CL]: {
        [TokenKind.BracketRightSymbol]: ParseState.ASSIGN,
    },
    [ParseState.ASSIGN]: {
        [TokenKind.EqualsSymbol]: ParseState.ASSIGN_END,
        [TokenKind.AmpersandSymbol]: ParseState.ASSIGN_MORE,
        [TokenKind.AndOperator]: ParseState.ASSIGN_MORE,
        [TokenKind.CommaSymbol]: ParseState.ASSIGN_MORE,
    },
    [ParseState.TURN]: {
        [TokenKind.OnValue]: ParseState.TURN_VAL,
        [TokenKind.OffValue]: ParseState.TURN_VAL,
        _: ParseState.TURN,
    },
    [ParseState.TURN_VAL]: {
        _: ParseState.TURN_VAL,
        [TokenKind.EndOfLineToken]: ParseState.TURN_STATEMENT_END
    },
    [ParseState.SET]: {
        [TokenKind.TheOperator]: ParseState.SET,
        [TokenKind.IdentifierToken]: ParseState.SET_VAR,
    },
    [ParseState.SET_MORE]: {
        [TokenKind.IdentifierToken]: ParseState.SET_VAR,
    },
    [ParseState.SET_VAR]: {
        [TokenKind.ToKeyWord]: ParseState.SET_EXPR,
        [TokenKind.EqualsSymbol]: ParseState.SET_EXPR,
        [TokenKind.BracketLeftSymbol]: ParseState.SET_ARRAY,
        [TokenKind.CommaSymbol]: ParseState.SET_MORE,
        [TokenKind.AndOperator]: ParseState.SET_MORE,
    },
    [ParseState.SET_ARRAY]: {
        [TokenKind.IdentifierToken]: ParseState.SET_ARRAY_CL,
        [TokenKind.NumberToken]: ParseState.SET_ARRAY_CL,
    },
    [ParseState.SET_ARRAY_CL]: {
        [TokenKind.BracketRightSymbol]: ParseState.SET_VAR,
    },
    [ParseState.SET_EXPR]: {
        _: ParseState.SET_EXPR,
        [TokenKind.EndOfLineToken]: ParseState.SET_STATEMENT_END
    },
    // [ParseState.FUNCTION_CALL_OPEN]: {
    //     _: ParseState.FUNCTION_CALL_OPEN,
    //     [TokenKind.PARENTHESES_CL]: ParseState.FUNCTION_CALL_CLOSE,
    // },

    // [ParseState.FUNCTION_CALL_CLOSE]: {
    //     [TokenKind.PARENTHESES_CL]: ParseState.IDENT,
    // },
    [ParseState.ASSIGN_END]: {
        _: ParseState.ASSIGN_TO,
    },
    [ParseState.ASSIGN_MORE]: {
        [TokenKind.AmpersandSymbol]: ParseState.ASSIGN_MORE,
        [TokenKind.AndOperator]: ParseState.ASSIGN_MORE,
        [TokenKind.IdentifierToken]: ParseState.ASSIGN,
        _: ParseState.IDENT_ID_END
    },
    [ParseState.ASSIGN_TO]: {
        [TokenKind.EndOfLineToken]: ParseState.ASSIGN_TO_END,
        _: ParseState.ASSIGN_TO,
    },
    [ParseState.LINE_TAG]: {
        [TokenKind.IdentifierToken]: ParseState.LINE_TAG_END,
        [TokenKind.NumberToken]: ParseState.LINE_TAG_END
    },

    [ParseState.DECLARE_FUNCTION]: {
        [TokenKind.IdentifierToken]: ParseState.DECLARE_FUNCTIONS,
    },
    [ParseState.DECLARE_FUNCTIONS]: {
        [TokenKind.CommaSymbol]: ParseState.DECLARE_FUNCTION,
        [TokenKind.EndOfLineToken]: ParseState.DECLARE_FUNCTIONS_END,
    },

    [ParseState.IF]: {
        _: ParseState.IF_EXP,
    },
    [ParseState.IF_EXP]: {
        _: ParseState.IF_EXP,
        [TokenKind.ThenStatement]: ParseState.IF_THEN,
    },
    [ParseState.IF_THEN]: {
        _: ParseState.IF_THEN_EXP,
        [TokenKind.EndOfLineToken]: ParseState.IF_THEN_END,
    },
    [ParseState.IF_THEN_EXP]: {
        _: ParseState.IF_THEN_EXP,
        [TokenKind.ElseStatement]: ParseState.IF_THEN_ELSE,
        [TokenKind.EndOfLineToken]: ParseState.IF_THEN_EXP_END,
    },
    [ParseState.IF_THEN_ELSE]: {
        _: ParseState.IF_THEN_ELSE_EXP,
    },
    [ParseState.IF_THEN_ELSE_EXP]: {
        _: ParseState.IF_THEN_ELSE_EXP,
        [TokenKind.EndOfLineToken]: ParseState.IF_THEN_ELSE_EXP_END,
    },
};

const state_actions: { [id: number]: (ast: SymbolTable, cur: Cursor) => void } = {
    [ParseState.DECLARES_END](ast: SymbolTable, cur: Cursor) {
        parse_declaration(cur)
            .forEach(decl => {
                ast.declare_variable(decl);
            });
    },
    [ParseState.BASEDON_END](ast: SymbolTable, cur: Cursor) {
        const bo = parse_basedon(cur);
        if (bo) {
            ast.lookup_variable(bo.variable);
            bo.lines.forEach(line => { ast.lookup_line(line); });
        }
    },
    [ParseState.GOTO_END](ast: SymbolTable, cur: Cursor) {
        const gt = parse_goto(cur);
        if (gt) {
            ast.lookup_line(gt);
        }
    },
    [ParseState.ARG_END](ast: SymbolTable, cur: Cursor) {
        const decl = parse_parameter(cur);
        ast.declare_parameter(decl);
    },
    [ParseState.IDENT_ID_END](ast: SymbolTable, cur: Cursor) {
        const tk = cur.current();
        ast.lookup_variable(tk);
    },
    [ParseState.LINE_ID_END](ast: SymbolTable, cur: Cursor) {
        const tk = cur.current();
        if (tk.range.begin === 0) {
            ast.declare_line(cur.current());
        } else {
            ast.lookup_variable(tk);
        }
    },
    [ParseState.FUNCTION_CALL_END](ast: SymbolTable, cur: Cursor) {
        parse_function(ast, cur);
    },
    [ParseState.LINE_TAG_END](ast: SymbolTable, cur: Cursor) {
        ast.declare_line(cur.item(1));
    },
    [ParseState.DECLARE_FUNCTIONS_END](ast: SymbolTable, cur: Cursor) {
        cur.advance();
        parse_list(cur).forEach(tk => {
            ast.declare_function(functionDecl(tk));
        });
    },
    [ParseState.ERROR](ast: SymbolTable, cur: Cursor) {
        let tk = cur.current();
        ast.add_error({
            id: EboErrors.ParseError,
            severity: Severity.Error,
            message: `Parse error '${tk.value}'`,
            range: tk.range
        });
    },
    [ParseState.IF_THEN_END](ast: SymbolTable, cur: Cursor) {
        parse_if_exp(ast, cur);
    },
    [ParseState.IF_THEN_EXP_END](ast: SymbolTable, cur: Cursor) {
        parse_if_exp(ast, cur);
    },
    [ParseState.IF_THEN_ELSE_EXP_END](ast: SymbolTable, cur: Cursor) {
        parse_if_exp(ast, cur);
    },
    [ParseState.ASSIGN_TO_END](ast: SymbolTable, cur: Cursor) {
        parse_assignment(ast, cur);
    },
    [ParseState.SET_STATEMENT_END](ast: SymbolTable, cur: Cursor) {
        parse_set_assignment(ast, cur);
    },
    [ParseState.TURN_STATEMENT_END](ast: SymbolTable, cur: Cursor) {
        parse_turn_assignment(ast, cur);
    },


    // [ParseState.FUNCTION_CALL_CLOSE](ast: SymbolTable, cur: Cursor) {
    //     parse_function(ast, cur);
    // },
    // [ParseState.SYS_FUNCTION_END](ast: SymbolTable, cur: Cursor) {
    //     parse_function(ast, cur);
    // },
};

/**
 * check for lines that are not used and calls to lines that do not exist. 
 * 
 * @param symbol_table
 */
function check_lines(st: SymbolTable) {

    let issues: ErrorInfo[] = st.errors;

    if (!st.fallthru) {
        Object.keys(st.lines)
            .forEach(name => {
                if (name in st.line_refs || st.line_names[0] === name) {
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
 * @param symbol_table 
 */
function check_usage(st: SymbolTable) {

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


function parse_expression(line: LexToken[], symTable: SymbolTable) {

    let state = states[ParseState.EXPR];
    let stack: LexToken[] = [];

    for (const tk of line) {
        let next = state[tk.type] || state._;
        if (tk.type === TokenKind.ParenthesesLeftSymbol) {
            ++symTable.parens_depth;
        }
        if (tk.type === TokenKind.ParenthesesRightSymbol) {
            --symTable.parens_depth;
            if (symTable.parens_depth && next === ParseState.FUNCTION_CALL_END) {
                next = ParseState.FUNCTION_CALL;
            }
        }
        if (!next && isFunctionKind(tk.type)) {
            next = ParseState.FUNCTION_CALL;
        }
        if (next) {
            stack.push(tk);
            state = states[next];
            let fn = state_actions[next];
            if (fn) {
                fn(symTable, new LineCursor(stack));
            }
            if (!state) {
                state = states[ParseState.EXPR];
                stack = [];
            }
        } else {
            if (state !== states[ParseState.EXPR]) {
                state = states[ParseState.EXPR];
                stack = [];
            }
        }
    }
    let next = state && (state[TokenKind.EndOfLineToken] || state._);
    if (next) {
        state = states[next];
        let fn = state_actions[next];
        if (fn) {
            fn(symTable, new LineCursor(stack));
        }
    }
}


function parse_statements(line: LexToken[], symTable: SymbolTable) {

    let state = states[ParseState.INIT];
    let stack: LexToken[] = [];

    for (const tk of line) {
        let next = state[tk.type] || state._;
        if (tk.type === TokenKind.ParenthesesLeftSymbol) {
            ++symTable.parens_depth;
        }
        if (tk.type === TokenKind.ParenthesesRightSymbol) {
            --symTable.parens_depth;
            if (symTable.parens_depth) {
                if (next === ParseState.SYS_FUNCTION_END) { next = ParseState.SYS_FUNCTION; }
                if (next === ParseState.FUNCTION_CALL_END) { next = ParseState.FUNCTION_CALL; }
            }
        }
        if (!next && isFunctionKind(tk.type)) { next = ParseState.SYS_FUNCTION; }
        if (next) {
            stack.push(tk);
            state = states[next];
            let fn = state_actions[next];
            if (fn) {
                fn(symTable, new LineCursor(stack));
            }
            if (!state) {
                state = states[ParseState.INIT];
                stack = [];
            }
        } else {
            if (state !== states[ParseState.INIT]) {
                state = states[ParseState.INIT];
                stack = [];
            }
        }
        if (tk.type === TokenKind.EndOfLineToken) {
            state = states[ParseState.INIT];
            if (symTable.parens_depth) {
                if (symTable.parens_depth > 0) {
                    symTable.add_error({
                        id: EboErrors.MissingCloseParentheses,
                        severity: Severity.Error,
                        message: `Missing closing Parentheses!`,
                        range: tk.range
                    });
                } else {
                    symTable.add_error({
                        id: EboErrors.ExtraCloseParentheses,
                        severity: Severity.Error,
                        message: `Extra closing Parentheses!`,
                        range: tk.range
                    });
                }
                symTable.parens_depth = 0;
            }
        }
    }

    let next = state && (state[TokenKind.EndOfLineToken] || state._);
    if (next) {
        state = states[next];
        let fn = state_actions[next];
        if (fn) {
            fn(symTable, new LineCursor(stack));
        }
    }
}

const reFallthru = /\bfallthru\b/i;
const isFallthru = (tk: LexToken) => tk.type === TokenKind.CommentToken && reFallthru.test(tk.value);
function check_is_fallthru(tkn_lists: LexToken[]) {
    // check for fallthru to disable warnings
    return tkn_lists.some(isFallthru);
}


export function ebo_parse_file(fileText: string) {

    const tkn_lists = ebo_scan_text(fileText);

    const symTable = new SymbolTable();
    symTable.fallthru = check_is_fallthru(tkn_lists);

    const tkData = tkn_lists.filter(t =>
        t.type !== TokenKind.WhitespaceToken &&
        t.type !== TokenKind.CommentToken &&
        t.type !== TokenKind.ContinueLineToken
    );

    // for (const line of tkData) {
    parse_statements(tkData, symTable);
    // }

    check_lines(symTable);
    check_usage(symTable);

    return symTable;
}




