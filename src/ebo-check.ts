import { TokenKind, isFunctionKind } from './ebo-types';
import { LexToken, ebo_scan_text } from './ebo-scanner';
import {
    ErrorInfo, FunctionDecl, ParameterDecl, Severity,
    SymbolTable, SymbolType, VariableDecl, VarModifier, VarTag
} from './SymbolTable';
import { EboErrors } from "./EboErrors";


interface Cursor {
    current: () => LexToken
    item: (index: number) => LexToken
    remain: () => number
    advance: (count?: number) => void
}


interface VariableInst {
    name: string
    index?: number
    token: LexToken
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

    const tk = cur.current();
    cur.advance();
    let depth = 0;
    if (cur.remain() > 0 && cur.current().type === TokenKind.BracketLeftSymbol) {
        ++depth;
        cur.advance();
        const id = cur.current();
        let index = -1;
        if (id.type === TokenKind.NumberToken) {
            cur.advance();
            index = Number(id.value);
        }
        while (cur.remain() > 0 && depth) {
            if (cur.current().type === TokenKind.BracketLeftSymbol) { ++depth; }
            if (cur.current().type === TokenKind.BracketRightSymbol) { --depth; }
            cur.advance();
        }
        return {
            name: tk.value,
            token: tk,
            index: index
        };
    }

    return {
        name: tk.value,
        token: tk
    };
}

function parse_variable_list_rest(cur: Cursor): VariableInst[] {

    const tks: VariableInst[] = [];

    while (cur.current().type === TokenKind.CommaSymbol) {
        cur.advance();
        const tk = parse_variable_list_item(cur);
        if (tk) { tks.push(tk); }
    }

    return tks;
}

function parse_variable_list(cur: Cursor): VariableInst[] {
    const itm = parse_variable_list_item(cur);
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
    const fn = cur.current();

    if (!isFunctionKind(fn.type)) {
        st.lookup_function(fn);
    }

    const args: LexToken[][] = [];
    let arg: LexToken[] = [];
    let count = 1;
    args.push(arg);
    cur.advance(2);
    let tk: LexToken;

    while (tk = cur.current()) {
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

    const assigned: VariableInst[] = [];
    const expression: LexToken[] = [];
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

    const assigned: VariableInst[] = [];
    const expression: LexToken[] = [];
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

    const assigned: VariableInst[] = [];
    const expression: LexToken[] = [];
    let tk = cur.current();

    while (tk) {
        switch (tk.type) {
            case TokenKind.IdentifierToken:
                assigned.push(parse_variable_list_item(cur));
                break;
            case TokenKind.OffValue:  // fallthru
            case TokenKind.OnValue:
                expression.push(tk);
            // fallthru
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

const enum IfState {
    IF_COND = 1,
    IF_TRUE,
    IF_FALSE,
    IF_END
}

interface IfExpression {
    cond_expr: ConditionExpression
    true_expr?: Expression
    false_expr?: Expression
}

const if_then_states: { [id: number]: IfState } = {
    [TokenKind.IfStatement]: IfState.IF_COND,
    [TokenKind.ThenStatement]: IfState.IF_TRUE,
    [TokenKind.ElseStatement]: IfState.IF_FALSE,
    [TokenKind.EndOfLineToken]: IfState.IF_END,
};


function parse_if_exp(st: SymbolTable, cur: Cursor): IfExpression {

    const data: { [name: number]: LexToken[] } = {};

    let tks: LexToken[] = [];
    let state = if_then_states[cur.current().type];
    st.context.if_then_state.push(cur.current());
    cur.advance();
    let depth = 1;

    while (state && state !== IfState.IF_END) {
        const tk = cur.current();
        switch (tk.type) {
            case TokenKind.IfStatement:
                ++depth;
                break;
            case TokenKind.ElseStatement:
                --depth;
                break;
            case TokenKind.EndOfLineToken:
                if (tks.length) { --depth; }
                break;
        }
        if (if_then_states[tk.type] && depth <= 1) {
            data[state] = tks;
            state = if_then_states[tk.type];
            tks = [];
        } else {
            tks.push(tk);;
        }
        cur.advance();
    }

    const res: Required<IfExpression> = {
        cond_expr: data[IfState.IF_COND] || [],
        true_expr: data[IfState.IF_TRUE] || [],
        false_expr: data[IfState.IF_FALSE] || []
    };

    if (res.true_expr.length > 0) {
        st.context.if_then_state.pop();
    }

    parse_expression(res.cond_expr, st);
    parse_statements(res.true_expr, st);
    parse_statements(res.false_expr, st);

    return res;
}

interface ForExpression {
    numeric_name: LexToken
    begin: Expression
    end: Expression
    step: Expression
    statements: Expression
}

const enum ForNextState {
    FOR_NAME = 1,
    FOR_BEGIN,
    FOR_END,
    FOR_STEP,
    FOR_BLOCK,
}

const for_next_states: { [id: number]: ForNextState } = {
    [TokenKind.ForStatement]: ForNextState.FOR_NAME,
    [TokenKind.EqualsSymbol]: ForNextState.FOR_BEGIN,
    [TokenKind.ToKeyWord]: ForNextState.FOR_END,
    [TokenKind.StepStatement]: ForNextState.FOR_STEP,
    [TokenKind.EndOfLineToken]: ForNextState.FOR_BLOCK,
};

function parse_for_exp(st: SymbolTable, cur: Cursor): ForExpression {

    const data: { [name: number]: LexToken[] } = {};

    const for_tk = cur.current();
    let tks: LexToken[] = [];
    let state = for_next_states[for_tk.type];
    st.context.for_next_state.push(for_tk);
    cur.advance();

    while (state && state !== ForNextState.FOR_BLOCK) {
        const tk = cur.current();
        if (for_next_states[tk.type]) {
            parse_expression(tks, st);
            data[state] = tks;
            state = for_next_states[tk.type];
            tks = [];
        } else {
            tks.push(tk);;
        }
        cur.advance();
    }

    const numeric_exp = data[ForNextState.FOR_NAME];
    const numeric_name = numeric_exp[0];
    const res = {
        numeric_name
        , begin: data[ForNextState.FOR_BEGIN]
        , end: data[ForNextState.FOR_END]
        , step: data[ForNextState.FOR_STEP]
        , statements: []
    };

    let vn = st.lookup_variable(numeric_name);

    if (!numeric_name
        || numeric_name.type !== TokenKind.IdentifierToken
        || numeric_exp.length > 1
        || !vn
        || (vn.modifier !== VarModifier.Local && vn.modifier !== VarModifier.Public)
    ) {
        st.errors.push({
            severity: Severity.Error,
            id: EboErrors.ForIdentifierInvalid,
            message: "For identifier is invalid, local numeric required",
            range: numeric_name.range
        });
    }

    if (!res.begin || res.begin.length === 0) {
        st.errors.push({
            severity: Severity.Error,
            id: EboErrors.ForStatementInvalidRange,
            message: "For statement missing begin range",
            range: for_tk.range
        });
    }

    if (!res.end || res.end.length === 0) {
        st.errors.push({
            severity: Severity.Error,
            id: EboErrors.ForStatementInvalidRange,
            message: "For statement missing end range",
            range: for_tk.range
        });
    }

    return res;
}

interface CaseExpression {
    cases: Expression
    statements: Expression[]
}

interface SelectExpression {
    test: Expression
    cases: CaseExpression[]
}

function parse_select_exp(st: SymbolTable, cur: Cursor): SelectExpression {
    let test: Expression = [];
    st.context.select_state.push(cur.current());
    if (cur.current().type === TokenKind.SelectStatement) {
        cur.advance();
    }
    if (cur.current().type === TokenKind.CaseStatement) {
        cur.advance();
    }
    while (cur.remain()) {
        test.push(cur.current());
        cur.advance();
    }

    parse_expression(test, st);

    return {
        test,
        cases: []
    };
}

function parse_select_case_exp(st: SymbolTable, cur: Cursor): CaseExpression {

    let cases: Expression = [];
    if (cur.current().type === TokenKind.CaseStatement) {
        cur.advance();
    }

    while (cur.remain()) {
        cases.push(cur.current());
        cur.advance();
    }

    parse_expression(cases, st);

    return {
        cases: cases,
        statements: []
    };
}

interface RepeatUntilExpression {
    condition: Expression
    statements: Expression
}


function parse_until_exp(st: SymbolTable, cur: Cursor): RepeatUntilExpression {

    let condition: Expression = [];
    if (cur.current().type === TokenKind.UntilStatement) {
        cur.advance();
    }
    while (cur.remain()) {
        condition.push(cur.current());
        cur.advance();
    }

    parse_expression(condition, st);

    return {
        condition,
        statements: []
    };
}

interface WhileExpression {
    condition: Expression
    statements: Expression
}

function parse_while_exp(st: SymbolTable, cur: Cursor): WhileExpression {

    st.context.while_state.push(cur.current());
    let condition: Expression = [];
    if (cur.current().type === TokenKind.UntilStatement) {
        cur.advance();
    }
    while (cur.remain()) {
        condition.push(cur.current());
        cur.advance();
    }

    parse_expression(condition, st);

    return {
        condition,
        statements: []
    };
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
        return this.items[this.#pos + index];
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




const enum ParseState {
    UNKNOWN
    , ARG
    , ARG_END
    , ARG_ID
    , ARRAY_CLOSE
    , ARRAY_INDEX
    , ARRAY_INIT
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
    , FOR_EXP
    , FOR_EXP_END
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
    , REPEAT_EXP
    , UNTIL_EXP
    , UNTIL_EXP_END
    , SELECT_CASE
    , SELECT_CASE_ELSE
    , SELECT_CASE_END
    , SELECT_EXP
    , SELECT_EXP_END
    , SET
    , SET_ARRAY
    , SET_ARRAY_CL
    , SET_EXPR
    , SET_MORE
    , SET_STATEMENT_END
    , SET_VAR
    , SYS_FUNCTION
    , SYS_FUNCTION_END
    , TURN
    , TURN_STATEMENT_END
    , TURN_VAL
    , WHILE_EXP
    , WHILE_EXP_END
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
        [TokenKind.ForStatement]: ParseState.FOR_EXP,
        [TokenKind.SelectStatement]: ParseState.SELECT_EXP,
        [TokenKind.CaseStatement]: ParseState.SELECT_CASE,
        [TokenKind.LineStatement]: ParseState.LINE_TAG,
        [TokenKind.ArgDeclaration]: ParseState.ARG,
        [TokenKind.UntilStatement]: ParseState.UNTIL_EXP,
        [TokenKind.WhileStatement]: ParseState.WHILE_EXP,
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

        [TokenKind.ThenStatement]: ParseState.ERROR,
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
        [TokenKind.BracketRightSymbol]: ParseState.DECLARES_LOC, // error empty []
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
        _: ParseState.DECLARES,
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
    [ParseState.SYS_FUNCTION]: {
        _: ParseState.FUNCTION_CALL,
        [TokenKind.ParenthesesRightSymbol]: ParseState.FUNCTION_CALL_END,
    },
    [ParseState.FOR_EXP]: {
        _: ParseState.FOR_EXP,
        [TokenKind.EndOfLineToken]: ParseState.FOR_EXP_END
    },
    [ParseState.SELECT_EXP]: {
        _: ParseState.SELECT_EXP,
        [TokenKind.EndOfLineToken]: ParseState.SELECT_EXP_END
    },
    [ParseState.SELECT_CASE]: {
        _: ParseState.SELECT_CASE,
        [TokenKind.EndOfLineToken]: ParseState.SELECT_CASE_END,
        [TokenKind.ElseStatement]: ParseState.SELECT_CASE_ELSE
    },
    [ParseState.SELECT_CASE_ELSE]: {
        [TokenKind.EndOfLineToken]: ParseState.SELECT_CASE_END
    },
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
        _: ParseState.ASSIGN_ARRAY,
        [TokenKind.BracketRightSymbol]: ParseState.ASSIGN_ARRAY_CL,
    },
    [ParseState.ASSIGN_ARRAY_CL]: {
        [TokenKind.EqualsSymbol]: ParseState.ASSIGN_END,
        [TokenKind.AmpersandSymbol]: ParseState.ASSIGN_MORE,
        [TokenKind.AndOperator]: ParseState.ASSIGN_MORE,
        [TokenKind.CommaSymbol]: ParseState.ASSIGN_MORE,
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
    [ParseState.UNTIL_EXP]: {
        _: ParseState.UNTIL_EXP,
        [TokenKind.EndOfLineToken]: ParseState.UNTIL_EXP_END
    },
    [ParseState.WHILE_EXP]: {
        _: ParseState.WHILE_EXP,
        [TokenKind.EndOfLineToken]: ParseState.WHILE_EXP_END
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
    [ParseState.ASSIGN_ARRAY_CL](ast: SymbolTable, cur: Cursor) {
        const array_exp = [];
        while (cur.current().type !== TokenKind.BracketLeftSymbol) {
            cur.advance();
        }
        cur.advance();
        while (cur.remain() > 1) {
            array_exp.push(cur.current());
            cur.advance();
        }
        parse_expression(array_exp, ast);
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
    [ParseState.FOR_EXP_END](ast: SymbolTable, cur: Cursor) {
        parse_for_exp(ast, cur);
    },
    [ParseState.UNTIL_EXP_END](ast: SymbolTable, cur: Cursor) {
        ast.context.repeat_state.pop();
        parse_until_exp(ast, cur);
    },
    [ParseState.WHILE_EXP_END](ast: SymbolTable, cur: Cursor) {
        parse_while_exp(ast, cur);
    },
    [ParseState.SELECT_EXP_END](ast: SymbolTable, cur: Cursor) {
        parse_select_exp(ast, cur);
    },
    [ParseState.SELECT_CASE_END](ast: SymbolTable, cur: Cursor) {
        parse_select_case_exp(ast, cur);
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
function check_lines_valid_and_used(st: SymbolTable) {

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
 * check for open block statements 
 * - If...Then...Else...EndIf 
 * - For...Next 
 * - Repeat...Until
 * - Select...EndSelect
 * - While...EndWhile
 * 
 * @param symTable 
 */
function check_open_block(symTable: SymbolTable) {
    symTable.context.if_then_state.forEach(tk => {
        symTable.add_error({
            id: EboErrors.IfThenStatementMissingEndIf,
            severity: Severity.Error,
            message: `If statement missing closing EndIf!`,
            range: tk.range
        });
    });

    symTable.context.for_next_state.forEach(tk => {
        symTable.add_error({
            id: EboErrors.ForStatementMissingNext,
            severity: Severity.Error,
            message: `For statement missing closing Next!`,
            range: tk.range
        });
    });

    symTable.context.select_state.forEach(tk => {
        symTable.add_error({
            id: EboErrors.SelectCaseMissingEnd,
            severity: Severity.Error,
            message: `Select statement missing closing EndSelect!`,
            range: tk.range
        });
    });

    symTable.context.while_state.forEach(tk => {
        symTable.add_error({
            id: EboErrors.WhileMissingEndWhile,
            severity: Severity.Error,
            message: `While statement missing closing EndWhile!`,
            range: tk.range
        });
    });

    symTable.context.repeat_state.forEach(tk => {
        symTable.add_error({
            id: EboErrors.RepeatStatementMissingUntil,
            severity: Severity.Error,
            message: `Repeat statement missing closing Until!`,
            range: tk.range
        });
    });
}

/**
 * check unmatched parentheses
 * 
 * @param symTable 
 * @param tk 
 */
function check_parens(symTable: SymbolTable, tk: LexToken) {
    if (symTable.context.parens_depth) {
        if (symTable.context.parens_depth > 0) {
            symTable.add_error({
                id: EboErrors.MissingCloseParentheses,
                severity: Severity.Error,
                message: `Missing closing Parentheses!`,
                range: tk.range
            });
        }
        else {
            symTable.add_error({
                id: EboErrors.ExtraCloseParentheses,
                severity: Severity.Error,
                message: `Extra closing Parentheses!`,
                range: tk.range
            });
        }
        symTable.context.parens_depth = 0;
    }
}


/**
 * check for unused declarations 
 * 
 * @param symbol_table 
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



const expr_state = states[ParseState.EXPR];

function parse_expression(line: LexToken[], symTable: SymbolTable) {

    let state = expr_state;
    let stack: LexToken[] = [];

    for (const tk of line) {
        let next = state[tk.type] || state._;

        switch (tk.type) {
            case TokenKind.ParenthesesLeftSymbol:
                ++symTable.context.parens_depth;
                break;

            case TokenKind.ParenthesesRightSymbol:
                --symTable.context.parens_depth;
                if (symTable.context.parens_depth && next === ParseState.FUNCTION_CALL_END) {
                    next = ParseState.FUNCTION_CALL;
                }
                break;

            case TokenKind.BracketLeftSymbol:
                ++symTable.context.bracket_depth;
                break;

            case TokenKind.BracketRightSymbol:
                --symTable.context.bracket_depth;
                if (symTable.context.bracket_depth && next === ParseState.ASSIGN_ARRAY_CL) {
                    next = ParseState.ASSIGN_ARRAY;
                }
                break;

            case TokenKind.ColonSymbol:
                symTable.errors.push({
                    severity: Severity.Error,
                    id: EboErrors.IllegalExpression,
                    message: "Illegal Expression, unexpected colon.",
                    range: tk.range
                });
                break;
        }

        if (!next && isFunctionKind(tk.type)) {
            next = ParseState.FUNCTION_CALL;
        }
        if (next) {
            stack.push(tk);
            state = states[next];
            const fn = state_actions[next];
            if (fn) {
                fn(symTable, new LineCursor(stack));
            }
            if (!state) {
                if (!fn) {
                    emit_parse_error(symTable, tk);
                }
                state = expr_state;
                stack = [];
            }
        } else {
            if (state !== expr_state) {
                emit_parse_error(symTable, tk);
                state = expr_state;
                stack = [];
            }
        }
    }

    const next = state && (state[TokenKind.EndOfLineToken] || state._);
    if (next) {
        state = states[next];
        let fn = state_actions[next];
        if (fn) {
            fn(symTable, new LineCursor(stack));
        }
    }

}

const init_state = states[ParseState.INIT];

function parse_statements(line: LexToken[], symTable: SymbolTable) {

    let state = init_state;
    let stack: LexToken[] = [];

    for (const tk of line) {

        let next = state[tk.type] || state._;

        switch (tk.type) {
            case TokenKind.RepeatStatement:
                symTable.context.repeat_state.push(tk);
                break;
            case TokenKind.ElseStatement:
                const ifThen = symTable.context.if_then_state;
                if (ifThen.length > 0) {
                    if (ifThen[ifThen.length - 1].type === TokenKind.ElseStatement) {
                        emit_parse_error(symTable, tk);
                    } else {
                        ifThen.pop();
                        ifThen.push(tk);
                    }
                } else if (symTable.context.select_state.length > 0) {
                    if (state !== states[ParseState.SELECT_CASE]) {
                        emit_parse_error(symTable, tk);
                    }
                } else {
                    if (state !== states[ParseState.IF_THEN_EXP]) {
                        emit_parse_error(symTable, tk);
                    }
                }
                break;
            case TokenKind.EndIfStatement:
                if (symTable.context.if_then_state.length === 0) {
                    emit_parse_error(symTable, tk);
                }
                symTable.context.if_then_state.pop();
                break;
            case TokenKind.NextStatement:
                if (symTable.context.for_next_state.length === 0) {
                    emit_parse_error(symTable, tk);
                }
                symTable.context.for_next_state.pop();
                break;
            case TokenKind.EndSelectStatement:
                if (symTable.context.select_state.length === 0) {
                    emit_parse_error(symTable, tk);
                }
                symTable.context.select_state.pop();
                break;
            case TokenKind.EndWhileStatement:
                if (symTable.context.select_state.length === 0) {
                    emit_parse_error(symTable, tk);
                }
                symTable.context.while_state.pop();
                break;
            case TokenKind.BracketLeftSymbol:
                ++symTable.context.bracket_depth;
                break;
            case TokenKind.BracketRightSymbol:
                --symTable.context.bracket_depth;
                if (symTable.context.bracket_depth) {
                    if (next === ParseState.ASSIGN_ARRAY_CL) { next = ParseState.ASSIGN_ARRAY; }
                }
                break;
            case TokenKind.ParenthesesLeftSymbol:
                ++symTable.context.parens_depth;
                break;
            case TokenKind.ParenthesesRightSymbol:
                --symTable.context.parens_depth;
                if (symTable.context.parens_depth) {
                    if (next === ParseState.SYS_FUNCTION_END) { next = ParseState.SYS_FUNCTION; }
                    if (next === ParseState.FUNCTION_CALL_END) { next = ParseState.FUNCTION_CALL; }
                }
                break;
        }

        if (!next && isFunctionKind(tk.type)) {
            next = ParseState.SYS_FUNCTION;
        }

        if (next) {
            stack.push(tk);
            state = states[next];
            const fn = state_actions[next];
            if (fn) {
                fn(symTable, new LineCursor(stack));
            }
            if (!state) {
                if (!fn) {
                    emit_parse_error(symTable, tk);
                }
                state = init_state;
                stack = [];
            }
        } else {
            if (state !== init_state) {
                emit_parse_error(symTable, tk);
                state = init_state;
                stack = [];
            }
        }

        if (tk.type === TokenKind.EndOfLineToken) {
            state = init_state;
            check_parens(symTable, tk);
        }
    }

    const next = state && (state[TokenKind.EndOfLineToken] || state._);

    if (next) {
        state = states[next];
        const fn = state_actions[next];
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

    parse_statements(tkData, symTable);

    check_lines_valid_and_used(symTable);
    check_declarations_used(symTable);
    check_open_block(symTable);

    return symTable;
}




