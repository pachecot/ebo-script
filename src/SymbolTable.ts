import { TextRange, LexToken } from './ebo-scanner';
import { EboErrors } from './EboErrors';

// import { ParseContext, ErrorInfo, SymbolDecl, FunctionDecl, VariableDecl, ParameterDecl, EboErrors, Severity, VarModifier, SymbolType } from './ebo-check';

export class ParseContext {
    parens_depth = 0;
    bracket_depth = 0;
    for_next_state: LexToken[] = [];
    if_then_state: LexToken[] = [];
    select_state: LexToken[] = [];
    while_state: LexToken[] = [];
    repeat_state: LexToken[] = [];
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


export interface ErrorInfo {
    id: EboErrors
    severity: Severity
    message: string
    range: TextRange
}

export enum SymbolType {
    StringType = 1
    , Numeric
    , DateTime
    , Function
    , Parameter
    , Line
}

export interface SymbolDecl {
    name: string
    type: SymbolType
    range: TextRange
}

type VariableType = SymbolType.StringType | SymbolType.Numeric | SymbolType.DateTime;

export enum VarModifier {
    Local = 1
    , Input
    , Output
    , Public
}

export enum VarTag {
    None = 1
    , Triggered
    , Buffered
}


export function get_var_dec_string(vd: VariableDecl): string {

    let res = "";

    switch (vd.type) {
        case SymbolType.StringType:
            res += "String";
            break;
        case SymbolType.Numeric:
            res += "Numeric";
            break;
        case SymbolType.DateTime:
            res += "DateTime";
            break;
    }

    switch (vd.modifier) {
        case VarModifier.Input:
            res += " Input";
            break;
        case VarModifier.Output:
            res += " Output";
            break;
        case VarModifier.Public:
            res += " Public";
            break;
    }

    switch (vd.tag) {
        case VarTag.Buffered:
            res += " Buffered";
            break;
        case VarTag.Triggered:
            res += " Triggered";
            break;
    }

    return res;
}


export interface VariableDecl extends SymbolDecl {
    type: VariableType
    modifier: VarModifier
    tag: VarTag
    size?: number
}

export interface ParameterDecl extends SymbolDecl {
    type: SymbolType.Parameter
    id: number
}

export interface FunctionDecl extends SymbolDecl {
    type: SymbolType.Function
}

export class SymbolTable {

    context: ParseContext = new ParseContext();
    errors: ErrorInfo[] = [];
    fallthru = false;
    lines: { [name: string]: LexToken; } = {};
    line_names: string[] = [];
    line_refs: { [name: string]: LexToken[]; } = {};

    symbols: { [name: string]: SymbolDecl; } = {};
    functions: { [name: string]: FunctionDecl; } = {};
    variables: { [name: string]: VariableDecl; } = {};
    parameters: { [name: string]: ParameterDecl; } = {};
    parameter_ids: string[] = [];

    assigned_refs: { [name: string]: LexToken[]; } = {};
    variable_refs: { [name: string]: LexToken[]; } = {};
    function_refs: { [name: string]: LexToken[]; } = {};


    assigned_variable(tk: LexToken) {
        const name = tk.value;
        const sets = this.assigned_refs[name] || (this.assigned_refs[name] = []);
        sets.push(tk);
        if (name in this.symbols) {
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
        return this.variables[name];
    }


    lookup_variable(tk: LexToken) {
        const name = tk.value;
        const refs = this.variable_refs[name] || (this.variable_refs[name] = []);
        refs.push(tk);
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
                id: EboErrors.UndeclaredFunction,
                severity: Severity.Error,
                message: `Function '${name}' is not declared`,
                range: tk.range,
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
            if (variable.modifier !== VarModifier.Local && variable.size !== undefined) {
                this.add_error({
                    id: EboErrors.ArrayNotAllowed,
                    severity: Severity.Error,
                    message: `Variable '${name}' array index not allowed here.`,
                    range: variable.range
                });
            }
            if (variable.size !== undefined && variable.size <= 0) {
                this.add_error({
                    id: EboErrors.ArraySizeInvalid,
                    severity: Severity.Error,
                    message: `Variable '${name}' size is not valid.`,
                    range: variable.range
                });
            }
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
