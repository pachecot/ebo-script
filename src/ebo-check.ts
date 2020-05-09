import { Symbols, EboKeyWords, LxToken } from './ebo-types';
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
    pos: TextRange
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

interface Ast {
    parameters: { [name: string]: ParameterDecl }
    variables: { [name: string]: VariableDecl }
}

/**
 * try to parse the various goto statements.
 * return true if success and advance to the
 * next position
 */
function parse_goto_statement(cur: Cursor): boolean {

    const remain = cur.remain();
    if (remain < 1) {
        return false;
    }
    let pos = cur.pos;

    switch (cur.items[pos].type) {

        case EboKeyWords.GO:
            ++pos;
            if (pos === remain) { return false; }
            if (cur.items[pos].type === EboKeyWords.TO) { ++pos; }
            if (pos === remain) { return false; }
            if (cur.items[pos].type === EboKeyWords.LINE) { ++pos; }
            if (pos === remain) { return false; }
            cur.pos = pos;
            return true;

        case EboKeyWords.GOTO:
            ++pos;
            if (pos === remain) { return false; }
            if (cur.items[pos].type === EboKeyWords.LINE) { ++pos; }
            if (pos === remain) { return false; }
            cur.pos = pos;
            return true;

        default:
            return false;

    }
}


function parse_goto(cur: Cursor): LexToken | undefined {
    if (parse_goto_statement(cur) && cur.remain() > 0 && cur.items[cur.pos].type === LxToken.TK_IDENT) {
        return cur.current();
    }
    return undefined;
}


function parse_list_item(cur: Cursor): LexToken | undefined {
    if (test_token_seq(cur, [LxToken.TK_IDENT])) {
        let lt = cur.items[cur.pos];
        ++cur.pos;
        if (test_token_seq(cur, [Symbols.BRACKET_OP, LxToken.TK_NUMBER, Symbols.BRACKET_CL])) {
            let id = cur.item(1);
            cur.advance(3);
        }
        return lt;
    }
    return undefined;
}


function parse_list_rest(cur: Cursor): LexToken[] {
    let lt: LexToken[] = [];
    while (test_token_seq(cur, [Symbols.COMMA, LxToken.TK_IDENT])) {
        ++cur.pos;
        let itm = parse_list_item(cur);
        if (itm) { lt.push(itm); }
    }
    return lt;
}

function parse_list(cur: Cursor): LexToken[] {
    let itm = parse_list_item(cur);
    if (itm) {
        let lt = [itm];
        lt = lt.concat(parse_list_rest(cur));
        --cur.pos;
        return lt;
    }
    return [];
}


function tmMap<U>(typeMap: { [id: string]: U }): (tk: Token) => U | undefined;
function tmMap<U>(typeMap: { [id: string]: U }, def?: U): (tk: Token) => U;
function tmMap<U>(typeMap: { [id: string]: U }, def?: U) {
    return function (tk: Token) {
        return typeMap[tk] || def;
    };
}

let typeMapper = tmMap({
    [EboKeyWords.NUMERIC]: SymbolType.Numeric,
    [EboKeyWords.STRING]: SymbolType.StringType,
    [EboKeyWords.DATETIME]: SymbolType.DateTime,
});

let tagMapper = tmMap({
    [EboKeyWords.TRIGGERED]: VarTag.Triggered,
    [EboKeyWords.BUFFERED]: VarTag.Buffered,
});

let modMapper = tmMap({
    [EboKeyWords.INPUT]: VarModifier.Input,
    [EboKeyWords.OUTPUT]: VarModifier.Output,
    [EboKeyWords.PUBLIC]: VarModifier.Public,
});



function parse_declaration(cur: Cursor): VariableDecl[] {

    let tk = cur.current();
    let ty = typeMapper(tk.type) as VariableType | undefined;
    if (ty) {
        ++cur.pos;
        tk = cur.current();

        let tg = tagMapper(tk.type);
        if (tg) {
            ++cur.pos;
            tk = cur.current();
        } else {
            tg = VarTag.None;
        }

        let md = modMapper(tk.type);
        if (md) {
            ++cur.pos;
            tk = cur.current();
        } else {
            md = VarModifier.Local;
        }

        return parse_list(cur)
            .map(tk => ({
                name: tk.value,
                type: ty,
                modifier: md,
                tag: tg,
                pos: tk.range
            } as VariableDecl));
    }

    return [];
}

function test_token_seq(cur: Cursor, test: Token[]): boolean {
    if (test.length <= cur.remain()) {
        return test.every((tk, i) =>
            tk === cur.items[cur.pos + i].type
        );
    }
    return false;
}


function test_token_any(cur: Cursor, test: Token[]): boolean {
    return (cur.remain() > 0 && test.some(tk => tk === cur.items[cur.pos].type));
}


function parse_parameter(cur: Cursor): ParameterDecl | undefined {

    if (test_token_seq(cur, [EboKeyWords.ARG, LxToken.TK_NUMBER, LxToken.TK_IDENT])) {
        let id = cur.items[cur.pos + 1];
        let tk = cur.items[cur.pos + 2];
        cur.advance(2);

        return {
            type: SymbolType.Parameter,
            name: tk.value,
            pos: tk.range,
            id: Number(id.value)
        };
    }

    return undefined;
}

interface BasedonExpr {
    variable: LexToken
    lines: LexToken[]
}

function parse_basedon(cur: Cursor): BasedonExpr | undefined {

    if (test_token_seq(cur, [EboKeyWords.BASEDON, LxToken.TK_IDENT]) && cur.remain() > 3) {

        const variable = cur.item(1);
        let lines: LexToken[] = [];
        cur.advance(2);

        if (parse_goto_statement(cur)) {
            while (cur.remain() > 0 && cur.current().type === LxToken.TK_IDENT) {
                lines.push(cur.current());
                cur.advance();
            }
        }
        return { variable, lines };
    }

    return undefined;
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


function getLineId(cur: Cursor) {

    if (test_token_seq(cur, [LxToken.TK_IDENT, Symbols.COLON])) {
        let tk = cur.current();
        return tk;
    }

    if (test_token_seq(cur, [EboKeyWords.LINE])) {
        let tk = cur.item(1);
        if (tk.type === LxToken.TK_IDENT || tk.type === LxToken.TK_NUMBER) {
            return tk;
        }
    }
    return undefined;
}

function functionDecl(tk: LexToken): FunctionDecl {
    return {
        type: SymbolType.Function,
        name: tk.value,
        pos: tk.range,
    };
}

class Ast {

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
                range: variable.pos
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
                range: functionDecl.pos
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
                range: parameter.pos
            });
        } else {
            if (this.parameterids[parameter.id]) {
                this.add_error({
                    id: EboErrors.DuplicateDeclaration,
                    severity: Severity.Error,
                    message: `Parameter '${name}' is redeclared with existing id: ${parameter.id}!`,
                    range: parameter.pos
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


export function ebo_parse_file(fileText: string) {

    let ast = new Ast();

    const tkn_lists = ebo_scan_text(fileText);
    const tkData = tkn_lists.map(l =>
        l.filter(t => t.type !== LxToken.TK_WHITESPACE && t.type !== LxToken.TK_COMMENT)
    );

    // check for fallthru to disable warnings
    tkn_lists.forEach(tks => {
        tks.forEach(tk => {
            if (tk.type === LxToken.TK_COMMENT && /fallthru/i.test(tk.value)) {
                ast.fallthru = true;
            }
        });
    });


    for (let line of tkData) {

        const cur = new LineCursor(line);

        const lineTk = getLineId(cur);
        if (lineTk) {
            ast.declare_line(lineTk);
        }
        cur.pos = -1;

        while (++cur.pos < cur.items.length) {
            const tk = cur.current();
            switch (tk.type) {

                case EboKeyWords.BASEDON:
                    const bo = parse_basedon(cur);
                    if (bo) {
                        ast.lookup_variable(bo.variable);
                        bo.lines.forEach(line => { ast.lookup_line(line); });
                    }
                    break;

                case EboKeyWords.GO:
                case EboKeyWords.GOTO: {
                    const gt = parse_goto(cur);
                    if (gt) {
                        ast.lookup_line(gt);
                    }
                    break;
                }

                case EboKeyWords.FUNCTION: {
                    if (cur.pos + 1 >= cur.items.length) { break; }
                    ++cur.pos;
                    parse_list(cur).forEach(tk => {
                        ast.declare_function(functionDecl(tk));
                    });
                    break;
                }

                case EboKeyWords.LINE: {
                    if (cur.pos + 1 >= cur.items.length) { break; }
                    ++cur.pos;
                    const tk1 = cur.current();
                    if (tk1.type === LxToken.TK_IDENT || tk1.type === LxToken.TK_NUMBER) {
                        ++cur.pos;
                    }
                    break;
                }

                case EboKeyWords.NUMERIC:
                case EboKeyWords.NUMBER:
                case EboKeyWords.STRING:
                case EboKeyWords.DATETIME: {
                    parse_declaration(cur)
                        .forEach(decl => {
                            ast.declare_variable(decl);
                        });
                    break;
                }

                case LxToken.TK_ERROR: {
                    ast.add_error({
                        id: EboErrors.ParseError,
                        severity: Severity.Error,
                        message: `Parse error '${tk.value}'`,
                        range: tk.range
                    });
                    break;
                }

                case EboKeyWords.ARG: {
                    const decl = parse_parameter(cur);
                    if (decl) {
                        ast.declare_parameter(decl);
                    }
                    break;
                }

                case LxToken.TK_FNCALL:
                    ast.lookup_function(tk);
                    break;

                case LxToken.TK_IDENT:
                    if (test_token_seq(cur, [LxToken.TK_IDENT, Symbols.COLON]) && tk.range.begin === 0) {
                        // skip line reference
                    } else {
                        ast.lookup_variable(tk);
                    }
                    break;

                default:
                    break;
            }
        }
    }

    let issues: ErrorInfo[] = ast.errors;
    // ---- do checks

    // ---- line checks

    if (!ast.fallthru) {
        Object.keys(ast.lines)
            .forEach(name => {
                if (name in ast.line_refs || ast.linenames[0] === name) {
                    return;
                }
                issues.push({
                    id: EboErrors.UnreferencedLine,
                    severity: Severity.Warning,
                    message: `Line '${name}' not referenced.`,
                    range: ast.lines[name].range
                });
            });
    }

    Object.keys(ast.line_refs).forEach(name => {
        if (name in ast.lines) { return; }
        ast.line_refs[name].forEach(tk => {
            issues.push({
                id: EboErrors.UndefinedLine,
                severity: Severity.Error,
                message: `Line '${name}' not defined.`,
                range: tk.range
            });
        });
    });

    // --- ussage checks

    Object.keys(ast.parameters)
        .forEach(name => {
            if (name in ast.variable_refs) { return; }
            issues.push({
                id: EboErrors.UnreferencedDeclaration,
                severity: Severity.Information,
                message: `Parameter '${name}' is not used.`,
                range: ast.parameters[name].pos
            });
        });

    Object.keys(ast.variables)
        .forEach(name => {
            if (name in ast.variable_refs) { return; }
            issues.push({
                id: EboErrors.UnreferencedDeclaration,
                severity: Severity.Information,
                message: `Variable '${name}' is not used.`,
                range: ast.variables[name].pos
            });
        });

    Object.keys(ast.functions)
        .forEach(name => {
            if (name in ast.function_refs) { return; }
            issues.push({
                id: EboErrors.UnreferencedFunction,
                severity: Severity.Information,
                message: `Function '${name}' is not used.`,
                range: ast.functions[name].pos
            });
        });

    return {
        issues,
        ast
    };
}



