import { Symbols, LxToken, EboControl, EboDeclarations } from './ebo-types';
import { TextRange, LexToken, Token, ebo_scan_text } from './ebo-scanner';


/**
 *
 */
export enum EboErrors {
    None,
    ParseError,
    DuplicateLine,
    UnreferencedLine,
    UndefinedLine,
    UnreferencedDeclaration,
    DuplicateDeclaration,
    UndeclaredVariable,
    FunctionUsedAsVariable,
    UndeclaredFunction,
    RedeclaredFunction,
    UnreferencedFunction
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
    pos: number
    items: LexToken[]
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
    const goto_tags: Token[] = [EboControl.GO, EboControl.TO, EboControl.GOTO, EboControl.LINE];
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
    if (cur.item(0).type === Symbols.BRACKET_OP) {
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
    while (cur.current().type === Symbols.COMMA) {
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

/**
 * comma separated list of tokens
 */
function parse_list(cur: Cursor): LexToken[] {
    let tk = cur.current();
    if (tk) {
        cur.advance();
        let tks: LexToken[] = [tk];
        while (cur.current().type === Symbols.COMMA) {
            cur.advance();
            tks.push(cur.current());
            cur.advance();
    }
        cur.advance(-1);
        return tks;
    }
    return [];
}


const declaration_states: { [id: string]: { [t: number]: [string, { [name: string]: number }] } } = {
    _: {
        [EboDeclarations.STRING]: ["T", { type: SymbolType.StringType }],
        [EboDeclarations.NUMERIC]: ["T", { type: SymbolType.Numeric }],
        [EboDeclarations.DATETIME]: ["T", { type: SymbolType.DateTime }],
    },
    "T": {
        [EboDeclarations.INPUT]: ['$', { modifier: VarModifier.Input }],
        [EboDeclarations.OUTPUT]: ['$', { modifier: VarModifier.Output }],
        [EboDeclarations.PUBLIC]: ['$', { modifier: VarModifier.Public }],
        [EboDeclarations.BUFFERED]: ["M", { tag: VarTag.Buffered }],
        [EboDeclarations.TRIGGERED]: ["M", { tag: VarTag.Triggered }],
    },
    "M": {
        [EboDeclarations.INPUT]: ['$', { modifier: VarModifier.Input }],
        [EboDeclarations.OUTPUT]: ['$', { modifier: VarModifier.Output }],
        [EboDeclarations.PUBLIC]: ['$', { modifier: VarModifier.Public }],
}
};

function parse_declaration(cur: Cursor): VariableDecl[] {

    let variable_dec = {
        type: SymbolType.Numeric,
        tag: VarTag.None,
        modifier: VarModifier.Local
    };

    let state_name = '_';
    while (state_name !== '$') {
        let tk = cur.current();
        let next = declaration_states[state_name][tk.type];
        if (next) {
            cur.advance();
            Object.assign(variable_dec, next[1]);
            state_name = next[0];
        } else {
            // local variables
            if (state_name !== '_') { break; }
            state_name = '$';
        }
        }
    if (state_name !== '$') {
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
    // LxToken.TK_NUMBER
    // LxToken.TK_IDENT

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

function parse_basedon(cur: Cursor): BasedonExpr | undefined {

    const variable = cur.item(1);
    let lines: LexToken[] = [];
    cur.advance(2);
    parse_goto_statement(cur);
    while (cur.remain() > 0 && cur.current().type !== LxToken.TK_EOL) {
        lines.push(cur.current());
        cur.advance();
    }
    return { variable, lines };
}


export class LineCursor implements Cursor {
    pos = 0;
    constructor(public items: LexToken[]) { }
    remain() {
        return this.items.length - this.pos;
    }
    current() {
        return this.items[this.pos];
    }
    item(index: number) {
        return this.items[index];
    }
    advance(amt = 1) {
        this.pos += amt;
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

    fallthru = false;
    lines: { [name: string]: LexToken } = {};
    linenames: string[] = [];
    line_refs: { [name: string]: LexToken[] } = {};

    symbols: { [name: string]: SymbolDecl } = {};
    functions: { [name: string]: FunctionDecl } = {};
    variables: { [name: string]: VariableDecl } = {};
    parameters: { [name: string]: ParameterDecl } = {};
    parameterids: string[] = [];

    variable_refs: { [name: string]: LexToken[] } = {};
    function_refs: { [name: string]: LexToken[] } = {};

    lookup_variable(tk: LexToken) {
        const name = tk.value;
        const arr = this.variable_refs[name] || (this.variable_refs[name] = []);
        arr.push(tk);
        if (name in this.symbols) {
            if (name in this.functions) {
                this.add_error({
                    id: EboErrors.FunctionUsedAsVariable,
                    severity: Severity.Error,
                    message: `Function '${name}' used as a variable.`,
                    range: tk.range
                });
            }
        } else {
            this.add_error({
                id: EboErrors.UndeclaredVariable,
                severity: Severity.Error,
                message: `Variable '${name}' is not declared`,
                range: tk.range
            });
        }
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
        if (name in this.lines) {
            this.add_error({
                id: EboErrors.DuplicateLine,
                severity: Severity.Error,
                message: `Line '${name}' already exists.`,
                range: lineTk.range
            });
        } else {
            this.lines[name] = lineTk;
            this.linenames.push(name);
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
            if (this.parameterids[parameter.id]) {
                this.add_error({
                    id: EboErrors.DuplicateDeclaration,
                    severity: Severity.Error,
                    message: `Parameter '${name}' is redeclared with existing id: ${parameter.id}!`,
                    range: parameter.range
                });
            }
            this.symbols[name] = parameter;
            this.parameters[name] = parameter;
            this.parameterids[parameter.id] = name;
        }
    }

    add_error(info: ErrorInfo) {
        this.errors.push(info);
    }
}


const states: { [name: string]: { [id: number]: string, _?: string } } = {
    INIT: {
        [EboControl.BASEDON]: 'BASEDON',
        [EboControl.GO]: 'GO',
        [EboControl.GOTO]: 'GOTO',
        // [EboControl.IF]: 'IF',
        [EboControl.LINE]: 'LINE_TAG',
        [EboDeclarations.ARG]: 'ARG',
        [EboDeclarations.DATETIME]: 'DECLARE_MOD',
        [EboDeclarations.FUNCTION]: 'FUNCTION',
        [EboDeclarations.NUMERIC]: 'DECLARE_MOD',
        [EboDeclarations.STRING]: 'DECLARE_MOD',
        [LxToken.TK_ERROR]: 'ERROR',
        [LxToken.TK_FNCALL]: 'FUNCTION_CALL_END',
        [LxToken.TK_IDENT]: 'IDENT',
    },
    DECLARE_MOD: {
        [EboDeclarations.BUFFERED]: 'DECLARE_IN',
        [EboDeclarations.TRIGGERED]: 'DECLARE_IN',
        [EboDeclarations.PUBLIC]: 'DECLARE_IDENT',
        [EboDeclarations.INPUT]: 'DECLARE_IDENT',
        [EboDeclarations.OUTPUT]: 'DECLARE_IDENT',
        [LxToken.TK_IDENT]: 'DECLARES_LOC'
    },
    DECLARE_IN: {
        [EboDeclarations.INPUT]: 'DECLARE_IDENT'
    },
    DECLARE_IDENT: {
        [LxToken.TK_IDENT]: 'DECLARES'
    },
    DECLARE_IDENT_LOC: {
        [LxToken.TK_IDENT]: 'DECLARES_LOC'
    },
    DECLARE_LOC_AR_SZ: {
        [LxToken.TK_NUMBER]: 'DECLARE_LOC_AR_CL',
    },
    DECLARE_LOC_AR_CL: {
        [Symbols.BRACKET_CL]: 'DECLARES_LOC',
    },
    DECLARES_LOC: {
        [Symbols.BRACKET_OP]: 'DECLARE_LOC_AR_SZ',
        [Symbols.COMMA]: 'DECLARE_IDENT_LOC',
        [LxToken.TK_EOL]: 'DECLARES_END'
    },
    DECLARES: {
        [Symbols.COMMA]: 'DECLARE_IDENT',
        [LxToken.TK_EOL]: 'DECLARES_END'
    },
    BASEDON: {
        [LxToken.TK_IDENT]: 'BASEDON_I'
    },
    BASEDON_I: {
        [EboControl.GO]: 'BASEDON_GO',
        [EboControl.GOTO]: 'BASEDON_GOTO',
    },
    BASEDON_GO: {
        [EboControl.TO]: 'BASEDON_GOTO',
        [EboControl.LINE]: 'BASEDON_GOTO_LINE',
        [LxToken.TK_IDENT]: 'BASEDON_GOTO_LIST',
        [LxToken.TK_NUMBER]: 'BASEDON_GOTO_LIST'
    },
    BASEDON_GOTO: {
        [EboControl.LINE]: 'BASEDON_GOTO_LINE',
        [LxToken.TK_IDENT]: 'BASEDON_GOTO_LIST',
        [LxToken.TK_NUMBER]: 'BASEDON_GOTO_LIST'
    },
    BASEDON_GOTO_LINE: {
        [LxToken.TK_IDENT]: 'BASEDON_GOTO_LIST',
        [LxToken.TK_NUMBER]: 'BASEDON_GOTO_LIST'
    },
    BASEDON_GOTO_LIST: {
        [LxToken.TK_IDENT]: 'BASEDON_GOTO_LIST',
        [LxToken.TK_NUMBER]: 'BASEDON_GOTO_LIST',
        [LxToken.TK_EOL]: 'BASEDON_END'
    },
    GO: {
        [EboControl.TO]: 'GOTO',
        [EboControl.LINE]: 'GOTO_LINE',
        [LxToken.TK_IDENT]: 'GOTO_END',
        [LxToken.TK_NUMBER]: 'GOTO_END'
    },
    GOTO: {
        [EboControl.LINE]: 'GOTO_LINE',
        [LxToken.TK_IDENT]: 'GOTO_END',
        [LxToken.TK_NUMBER]: 'GOTO_END'
    },
    GOTO_LINE: {
        [EboControl.LINE]: 'BASEDON_GOTO',
        [LxToken.TK_IDENT]: 'GOTO_END',
        [LxToken.TK_NUMBER]: 'GOTO_END'
    },
    ARG: {
        [LxToken.TK_NUMBER]: 'ARG_ID',
    },
    ARG_ID: {
        [LxToken.TK_IDENT]: 'ARG_END'
    },
    IDENT: {
        [Symbols.COLON]: 'LINE_ID_END',
        _: 'IDENT_ID_END'
    },
    LINE_TAG: {
        [LxToken.TK_IDENT]: 'LINE_TAG_END',
        [LxToken.TK_NUMBER]: 'LINE_TAG_END'
    },
    FUNCTION: {
        [LxToken.TK_IDENT]: 'FUNCTIONS',
    },
    FUNCTIONS: {
        [Symbols.COMMA]: 'FUNCTION',
        [LxToken.TK_EOL]: 'FUNCTION_END',
    },



};

const state_actions: { [id: string]: (ast: SymbolTable, cur: Cursor) => void } = {
    DECLARES_END(ast: SymbolTable, cur: Cursor) {
        parse_declaration(cur)
            .forEach(decl => {
                ast.declare_variable(decl);
            });
    },
    BASEDON_END(ast: SymbolTable, cur: Cursor) {
        const bo = parse_basedon(cur);
        if (bo) {
            ast.lookup_variable(bo.variable);
            bo.lines.forEach(line => { ast.lookup_line(line); });
        }
    },
    GOTO_END(ast: SymbolTable, cur: Cursor) {
        const gt = parse_goto(cur);
        if (gt) {
            ast.lookup_line(gt);
        }
    },
    ARG_END(ast: SymbolTable, cur: Cursor) {
        const decl = parse_parameter(cur);
        ast.declare_parameter(decl);
    },
    IDENT_ID_END(ast: SymbolTable, cur: Cursor) {
        const tk = cur.current();
        ast.lookup_variable(tk);
    },
    LINE_ID_END(ast: SymbolTable, cur: Cursor) {
        const tk = cur.current();
        if (tk.range.begin === 0) {
            ast.declare_line(cur.current());
        } else {
            ast.lookup_variable(tk);
        }
    },
    FUNCTION_CALL_END(ast: SymbolTable, cur: Cursor) {
        ast.lookup_function(cur.current());
    },
    LINE_TAG_END(ast: SymbolTable, cur: Cursor) {
        ast.declare_line(cur.item(1));
    },
    FUNCTION_END(ast: SymbolTable, cur: Cursor) {
        cur.advance();
            parse_list(cur).forEach(tk => {
                ast.declare_function(functionDecl(tk));
            });
    },
    ERROR(ast: SymbolTable, cur: Cursor) {
            let tk = cur.current();
            ast.add_error({
                id: EboErrors.ParseError,
                severity: Severity.Error,
                message: `Parse error '${tk.value}'`,
                range: tk.range
            });
    },
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

const reFallthru = /\bfallthru\b/i;

export function ebo_parse_file(fileText: string) {

    const symTable = new SymbolTable();

    const tkn_lists = ebo_scan_text(fileText);

    const tkData = tkn_lists.map(l =>
        l.filter(t => t.type !== LxToken.TK_WHITESPACE && t.type !== LxToken.TK_COMMENT)
    );

    // check for fallthru to disable warnings
    tkn_lists.forEach(tks => {
        tks.forEach(tk => {
            if (tk.type === LxToken.TK_COMMENT && reFallthru.test(tk.value)) {
                symTable.fallthru = true;
            }
            });
        });

    for (const line of tkData) {

        let state = states.INIT;
        let stack: LexToken[] = [];

        for (const tk of line) {
            let next = state[tk.type] || state._;
            if (next) {
                stack.push(tk);
                state = states[next];
                let fn = state_actions[next];
                if (fn) {
                    fn(symTable, new LineCursor(stack));
                }
                if (!state) {
                    state = states.INIT;
                    stack = [];
                }
            } else {
                if (state !== states.INIT) {
                    state = states.INIT;
                    stack = [];
                }
            }
        }
    }

    check_lines(symTable);
    check_usage(symTable);

    return symTable;
}



