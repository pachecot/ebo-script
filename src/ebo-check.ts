import { Symbols, EboKeyWords, LxToken } from './ebo-types';
import { TextPosition, LexToken, Token, ebo_scan_text } from './ebo-scanner';


/**
 * 
 */
enum EboErrors {
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
    pos: TextPosition
}

interface Cursor {
    pos: number
    items: LexToken[]
    current: () => LexToken
    item: (index: number) => LexToken
    remain: () => number
    advance: (count?: number) => void
}

enum SymbolType { StringType, Numeric, DateTime, Function, Parameter }

interface SymbolDecl {
    name: string
    type: SymbolType
    pos: TextPosition
}

enum VarModifier { Local, Input, Output, Public }
enum VarTag { None, Triggered, Buffered }
type VariableType = SymbolType.StringType | SymbolType.Numeric | SymbolType.DateTime;

interface VariableDecl extends SymbolDecl {
    type: VariableType
    modifer: VarModifier
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
}, VarTag.None);

let modMapper = tmMap({
    [EboKeyWords.INPUT]: VarModifier.Input,
    [EboKeyWords.OUTPUT]: VarModifier.Output,
    [EboKeyWords.PUBLIC]: VarModifier.Public,
}, VarModifier.Local);



function parse_declaration(cur: Cursor): VariableDecl[] {

    let kind = [];
    let tk = cur.current();
    let ty = typeMapper(tk.type) as VariableType | undefined;
    if (ty) {

        kind.push(tk);
        ++cur.pos;

        tk = cur.current();
        let tg = tagMapper(tk.type);
        if (tg) {
            kind.push(tk);
            ++cur.pos;
        }

        tk = cur.current();
        let md = modMapper(tk.type);
        if (md) {
            kind.push(tk);
            ++cur.pos;
        }
        return parse_list(cur)
            .map(tk => ({
                name: tk.value,
                type: ty,
                modifer: md,
                tag: tg,
                pos: tk.pos
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
            pos: tk.pos,
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


export function ebo_parse_file(fileText: string) {

    let lines = {
        fallthru: false,
        names: [] as string[],
        ids: {} as { [name: string]: LexToken[] },
        gotos: [] as LexToken[]
    };

    const tkn_lists = ebo_scan_text(fileText);
    const tkData = tkn_lists.map(l => l.filter(t => t.type !== LxToken.TK_WHITESPACE && t.type !== LxToken.TK_COMMENT));

    tkn_lists.forEach(tks => {
        tks.forEach(tk => {
            if (tk.type === LxToken.TK_COMMENT && /fallthru/i.test(tk.value)) {
                lines.fallthru = true;
            }
        });
    });

    let var_list: VariableDecl[] = [];
    let param_list: ParameterDecl[] = [];
    let fn_list: FunctionDecl[] = [];

    let variables: { [name: string]: LexToken[] } = {};
    let function_calls: { [name: string]: LexToken[] } = {};

    let errors: LexToken[] = [];
    let issues: ErrorInfo[] = [];

    let n = -1;

    for (let line of tkData) {
        ++n;
        let cur = new LineCursor(line);


        let lineTk = getLineId(cur);
        if (lineTk) {
            let name = lineTk.value as string;
            let a = lines.ids[name] || (lines.ids[name] = []);
            lines.names.push(name);
            a.push(lineTk);
        }

        cur.pos = -1;

        while (++cur.pos < cur.items.length) {
            let tk = cur.current();
            switch (tk.type) {
                case EboKeyWords.BASEDON:
                    let bo = parse_basedon(cur);
                    if (bo) {
                        let a = variables[bo.variable.value] || (variables[bo.variable.value] = []);
                        a.push(bo.variable);
                        bo.lines.forEach(line => { lines.gotos.push(line); });
                    }
                    break;
                case EboKeyWords.GO:
                case EboKeyWords.GOTO: {
                    let gt = parse_goto(cur);
                    if (gt) {
                        lines.gotos.push(gt);
                    }
                    break;
                }
                case EboKeyWords.FUNCTION: {
                    if (cur.pos + 1 >= cur.items.length) { break; }
                    ++cur.pos;
                    parse_list(cur).forEach(tk => {
                        fn_list.push({
                            type: SymbolType.Function,
                            name: tk.value,
                            pos: tk.pos,
                        });
                    });
                    break;
                }
                case EboKeyWords.LINE: {
                    if (cur.pos + 1 >= cur.items.length) { break; }
                    ++cur.pos;
                    let tk1 = cur.current();
                    if (tk1.type === LxToken.TK_IDENT || tk1.type === LxToken.TK_NUMBER) {
                        ++cur.pos;
                    }
                    break;
                }
                case EboKeyWords.NUMERIC:
                case EboKeyWords.NUMBER:
                case EboKeyWords.STRING:
                case EboKeyWords.DATETIME: {
                    let decls = parse_declaration(cur);
                    var_list = var_list.concat(decls);
                    break;
                }
                case LxToken.TK_ERROR: {
                    errors.push(tk);
                    break;
                }
                case EboKeyWords.ARG: {
                    const decl = parse_parameter(cur);
                    if (decl) {
                        param_list.push(decl);
                    }
                    break;
                }
                case LxToken.TK_IDENT:
                    if (test_token_seq(cur, [LxToken.TK_IDENT, Symbols.PARENTHESES_OP])) {
                        function_calls[tk.value] = [tk];
                    } else if (test_token_seq(cur, [LxToken.TK_IDENT, Symbols.COLON]) && tk.pos.index === 0) {
                        // skip line reference
                    } else {
                        let a = variables[tk.value] || (variables[tk.value] = []);
                        a.push(tk);
                    }
                    break;

                default:
                    break;
            }
        }
    }

    // ---- do checks

    for (let tk of errors) {
        issues.push({
            id: EboErrors.ParseError,
            severity: Severity.Error,
            message: 'Parsing Error.',
            pos: tk.pos
        });
    }

    // ---- line checks

    let gtnames = lines.gotos.map(tk => tk.value);

    for (let id in lines.ids) {

        if (lines.ids[id].length > 1) {
            let x = lines.ids[id].map(tk => ({
                id: EboErrors.DuplicateLine,
                severity: Severity.Error,
                message: 'Line defined multiple times.',
                pos: tk.pos
            }));
            issues = issues.concat(x);
        }

        if (!gtnames.includes(id) && !lines.fallthru) {
            let tk = lines.ids[id][0];
            if (tk.value !== lines.names[0]) {
                issues.push(
                    {
                        id: EboErrors.UnreferencedLine,
                        severity: Severity.Warning,
                        message: 'Line not referenced.',
                        pos: tk.pos
                    }
                );
            }
        }
    }

    for (let tk of lines.gotos) {
        if (lines.ids[tk.value]) {
            lines.ids[tk.value].push(tk);
        } else {
            issues.push({
                id: EboErrors.UndefinedLine,
                severity: Severity.Error,
                message: 'Line not defined.',
                pos: tk.pos
            });
        }
    }

    // --- symbol info

    let varNames = Object.keys(variables);
    let decNames: string[] = [];

    // --- parameter checks

    for (let parm of param_list) {
        decNames.push(parm.name);
        if (!varNames.includes(parm.name)) {
            issues.push({
                id: EboErrors.UnreferencedDeclaration,
                severity: Severity.Information,
                message: 'Parameter is not used.',
                pos: parm.pos
            });
        }
    }

    // --- variable checks

    for (let tk of var_list) {
        if (decNames.includes(tk.name)) {
            issues.push({
                id: EboErrors.DuplicateDeclaration,
                severity: Severity.Error,
                message: 'Variable is already declared.',
                pos: tk.pos
            });
        } else {
            decNames.push(tk.name);
            if (!varNames.includes(tk.name)) {
                issues.push({
                    id: EboErrors.UnreferencedDeclaration,
                    severity: Severity.Information,
                    message: 'Variable is not used.',
                    pos: tk.pos
                });
            }
        }
    }

    for (let name of varNames) {
        if (!decNames.includes(name)) {
            let lst = variables[name].map(tk => ({
                id: EboErrors.UndeclaredVariable,
                severity: Severity.Error,
                message: 'Variable is not declared.',
                pos: tk.pos
            }));
            issues = issues.concat(lst);
        }
    }

    // --- function checks

    let fnMap: { [name: string]: FunctionDecl } = {};

    for (let fn of fn_list) {
        if (fn.name in fnMap) {
            issues.push({
                id: EboErrors.RedeclaredFunction,
                severity: Severity.Error,
                message: 'Function is redeclared.',
                pos: fn.pos
            });
        } else {
            fnMap[fn.name] = fn;
            if (!(fn.name in function_calls)) {
                issues.push({
                    id: EboErrors.UnreferencedFunction,
                    severity: Severity.Information,
                    message: 'Function is not used.',
                    pos: fn.pos
                });
            }
            if (fn.name in variables) {
                variables[fn.name].forEach(tk => {
                    issues.push({
                        id: EboErrors.FunctionUsedAsVariable,
                        severity: Severity.Error,
                        message: 'Function is used as a variable.',
                        pos: tk.pos
                    });
                });
            }
        }
    }

    for (let name in function_calls) {
        if (!(name in fnMap)) {
            function_calls[name].forEach(fn => {
                issues.push({
                    id: EboErrors.UndeclaredFunction,
                    severity: Severity.Error,
                    message: 'Function is not declared.',
                    pos: fn.pos
                });
            });
        }
    }

    return {
        issues,
        variables,
        declarations: var_list,
        lines
    };
}







