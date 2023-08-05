import * as vscode from 'vscode';
import { get_var_dec_string } from './SymbolTable';
import { EboErrors } from "./EboErrors";
import { EboExt } from './EboExt';
import { first_non_comment_line } from './document-util';
import { EBO_SCRIPT } from './extension-types';

const re_comment = /\s*'.*$/;
const re_comma = /\s*,\s*/g;
const re_declaration = /^\s*((?:Numeric)(\s+(?:Output|Public|(?:(?:Buffered|Triggered)\s+)?Input))?|(?:String|DateTime)(?:\s+(?:Input|Output|Public))?|Function|Datafile|Trendlog|Webservice)(?:\s+|$)/i;
const re_line_continuation = /~$/;
const re_line_declaration = /(\w+:)|^line\s+(\w|\d)+/i;

const declarations = [
    "Trendlog",
    "Datafile",
    "Webservice",
    "Numeric",
    "Numeric Input",
    "Numeric Buffered Input",
    "Numeric Triggered Input",
    "Numeric Output",
    "Numeric Public",
    "DateTime",
    "DateTime Input",
    "DateTime Output",
    "DateTime Public",
    "String",
    "String Input",
    "String Output",
    "String Public",
    "Function",
];

const lc_declarations = declarations.map(s => s.toLowerCase());

function get_declaration_id(dec: string) {
    const m = re_declaration.exec(dec);
    return m ? lc_declarations.indexOf(m[0].trim().toLowerCase().replace(/\s+/, ' ')) : -1;
}

function line_has_comment(line: vscode.TextLine) {
    return line.text.indexOf("'") !== -1;
}

function get_comment(line: vscode.TextLine): string {
    const m = re_comment.exec(line.text);
    return m ? m[0] : "";
}

function is_line_declaration(line: vscode.TextLine) {
    return re_line_declaration.test(line.text);
}

/**
 * merge declarations onto a single line
 * 
 * only merges the declarations that are of the same type and on adjacent lines
 */
export function compact_declarations() {

    const editor = vscode.window.activeTextEditor;
    const config = vscode.workspace.getConfiguration(EBO_SCRIPT);
    const max_line_length = config.get('declarationMaxLineLength', 95);


    if (editor) {
        const document = editor.document;

        if (document.languageId !== EBO_SCRIPT) { return; }

        const count = document.lineCount;
        let width = 0;

        const edits: vscode.Range[] = [];
        let current_decl_type = "";
        let is_line_continued = false;
        let last_line: vscode.TextLine | null = null;

        for (let i = 0; i < count; ++i) {
            let line = document.lineAt(i);

            if (is_line_declaration(line)) { break; }

            const m = re_declaration.exec(line.text);
            if (m && !line_has_comment(line)) {
                // join like declarations
                const id = get_declaration_id(m[0]);
                const decl_type = declarations[id];
                if (last_line && current_decl_type === decl_type && width < max_line_length) {
                    edits.push(new vscode.Range(
                        last_line.range.end,
                        line.range.start.translate(0, m[0].length)
                    ));
                    width += line.text.length - m[0].length;
                } else {
                    width = line.text.length;
                    current_decl_type = decl_type;
                }
                last_line = line;

            } else if (last_line && is_line_continued && current_decl_type !== "") {
                // remove line continuations
                const m_start = /(\s*,)?\s*~$/.exec(last_line.text);
                const m_end = /^(\s*,)?\s*/.exec(line.text);
                if (m_start && m_end) {
                    edits.push(new vscode.Range(
                        last_line.range.start.translate(0, m_start.index),
                        line.range.start.translate(0, m_end[0].length)
                    ));
                    width += line.text.length - m_start[0].length - m_end[0].length;
                }
                last_line = line;
            } else {
                // reset 
                current_decl_type = "";
                last_line = null;
                width = 0;
            }
            is_line_continued = re_line_continuation.test(line.text);
        }

        editor.edit(editBuilder => {
            for (const edit of edits.reverse()) {
                editBuilder.replace(edit, ", ");
            }
        });
    }
}


/**
 * split all declarations to individual lines
 *  
 */
export function expand_declarations() {

    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const document = editor.document;

        if (document.languageId !== EBO_SCRIPT) { return; }

        const count = document.lineCount;

        const edits: [vscode.Range, string][] = [];
        let current_decl_type = "";
        let is_line_continued = false;
        let last_line: vscode.TextLine | null = null;

        for (let i = 0; i < count; ++i) {
            let line = document.lineAt(i);

            if (is_line_declaration(line)) { break; }

            const m = re_declaration.exec(line.text);
            if (m && !line_has_comment(line)) {
                current_decl_type = m[1];
                const text = line.text;
                let comma_match: RegExpExecArray | null = null;
                let cm = /(\s*,)?\s*~$/.exec(text);
                while (comma_match = re_comma.exec(text)) {
                    if (cm && comma_match.index >= cm.index) {
                        break;
                    }
                    edits.push([new vscode.Range(
                        line.range.start.translate(0, comma_match.index),
                        line.range.start.translate(0, comma_match.index + comma_match[0].length)
                    ), `\n${current_decl_type} `]);
                }
                last_line = line;
            } else if (last_line && is_line_continued && current_decl_type !== "") {
                // break continued lines to individual lines
                const m1 = last_line.text.match(/(\s*,)?\s*~$/);
                const m2 = line.text.match(/^(\s*,)?\s*/);
                if (m1 && m2) {
                    edits.push([new vscode.Range(
                        last_line.range.end.translate(0, -m1[0].length),
                        line.range.start.translate(0, m2[0].length)
                    ), `\n${current_decl_type} `]);
                }
                last_line = line;
            } else {
                current_decl_type = "";
                last_line = null;
            }
            is_line_continued = re_line_continuation.test(line.text);
        }


        editor.edit(editBuilder => {
            for (const edit of edits.reverse()) {
                editBuilder.replace(edit[0], edit[1]);
            }
        });
    }
}


/**
 * reset all declarations
 * 
 */
export function clean_declarations(eboExt: EboExt) {

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const document = editor.document;
    if (document.languageId !== EBO_SCRIPT) {
        return;
    }

    const config = vscode.workspace.getConfiguration(EBO_SCRIPT);
    const max_line_length = config.get('declarationMaxLineLength', 95);
    const compact = config.get('cleanDeclarationsCompact', false);

    const decLines: vscode.TextLine[] = [];
    const dec: { [name: string]: string[] } = {};

    const sym = eboExt.symbols.get(document.uri);

    // add declarations for missing types
    sym.errors
        .filter(e => e.id === EboErrors.UndeclaredVariable || e.id === EboErrors.UndeclaredFunction)
        .forEach(e => {
            const ident = document.getText(new vscode.Range(e.range.line, e.range.begin, e.range.line, e.range.end));
            const ident_type = e.id === EboErrors.UndeclaredFunction ? 'Function' :
                ident in sym.assigned_refs ? 'Numeric Output' : 'Numeric Input';

            if (!dec[ident_type]) { dec[ident_type] = []; }
            const index = dec[ident_type].indexOf(ident);
            if (index === -1) {
                dec[ident_type].push(ident);
            }
        });

    const decComments: { [name: string]: string } = {};
    const dec_range = declarations_range(document);

    for (let i = dec_range.start.line; i <= dec_range.end.line; ++i) {
        let line = document.lineAt(i);
        const dec_id = get_declaration_id(line.text);
        if (dec_id !== -1) {
            const decl_type = declarations[dec_id];
            const dec_list = dec[decl_type] || (dec[decl_type] = []);

            const new_decs = parse_declarations(line.text);
            if (line_has_comment(line)) {
                if (compact || new_decs.length > 1) {
                    continue;
                }
                decComments[new_decs[0]] = get_comment(line);

                append_declarations(dec_list, new_decs);
                decLines.push(line);
                continue;
            }

            append_declarations(dec_list, new_decs);
            decLines.push(line);
            while (re_line_continuation.test(line.text)) {
                line = document.lineAt(++i);
                decLines.push(line);
                parse_declaration_list(dec_list, line.text);
            }
        } else {
            if (line.isEmptyOrWhitespace) {
                decLines.push(line);
            }
        }
    }

    // remove unreferenced declarations
    sym.errors
        .filter(e => e.id === EboErrors.UnreferencedDeclaration || e.id === EboErrors.UnreferencedFunction)
        .forEach(e => {
            const ident = document.getText(new vscode.Range(e.range.line, e.range.begin, e.range.line, e.range.end));
            const ident_type = e.id === EboErrors.UnreferencedFunction ? 'Function' :
                ident in sym.assigned_refs ? 'Numeric Output' : 'Numeric Input';
            const var1 = sym.variables[ident];
            if (var1) {
                const id_type = get_var_dec_string(var1);
                if (dec[id_type]) {
                    const index = dec[id_type].findIndex(
                        name => {
                            const index = name.indexOf('[');
                            if (index !== -1) {
                                name = name.substring(0, index);
                            }
                            return name === var1.name;
                        }
                    );
                    if (index !== -1) {
                        dec[id_type].splice(index, 1);
                    }
                }
            } else {
                if (dec[ident_type]) {
                    const index = dec[ident_type].indexOf(ident);
                    if (index !== -1) {
                        dec[ident_type].splice(index, 1);
                    }
                }
            }
        });

    if (compact) {
        let text = "";
        let insert_newline = false;
        for (let name of declarations) {
            if (name === "DateTime") {
                insert_newline = true;
            }
            const list = dec[name];
            if (list && list.length > 0) {
                if (insert_newline || name === "Function") {
                    insert_newline = false;
                    text += "\n";
                }
                list.sort();
                let d = `${name} ${list.join(', ')}\n`;
                if (d.length > max_line_length) {
                    while (d.length > max_line_length) {
                        let i = d.indexOf(',', max_line_length);
                        if (i === -1) { break; }
                        text = text + d.substring(0, i) + '\n';
                        d = `${name} ${d.substring(i + 2)}`;
                    }
                }
                text = text + d;
            }
        }

        editor.edit(editBuilder => {
            for (let line of decLines) {
                editBuilder.delete(line.rangeIncludingLineBreak);
            }
            const line = first_non_comment_line(document);
            editBuilder.insert(line.range.start, text);
        });

    } else {

        let w = 0;
        let nts: string[][] = [];
        for (let dec_type in dec) {
            let dec_type_norm = dec_type.trim().toLowerCase().replace(/\s+/, ' ');
            if (w < dec_type.length) {
                w = dec_type.length;
            }
            nts = nts.concat(dec[dec_type].map(n => [n, dec_type, dec_type_norm, n.toLocaleLowerCase()]));
        }
        nts.sort((a, b) => a[3].localeCompare(b[3]));

        let text_local = "";
        let text_output = "";
        let text_function = "";
        let text_input = "";

        for (let nt of nts) {

            let decComment = decComments[nt[0]] || "";
            let decLine = `${nt[1]} ${nt[0]}${decComment}\n`;

            switch (nt[2]) {
                case "datetime output":
                case "numeric output":
                case "string output":
                    text_output += decLine;
                    break;

                case "datetime":
                case "numeric":
                case "string":
                    text_local += decLine;
                    break;

                case "webservice":
                case "function":
                    text_function += decLine;
                    break;

                case "datetime public":
                case "numeric public":
                case "string public":
                    text_input += decLine;
                    break;

                // case "datafile":
                // case "trendlog":
                // case "string input":
                // case "datetime input":
                // case "numeric input":
                // case "numeric buffered input":
                // case "numeric triggered input":

                default:
                    text_input += decLine;
                    break;
            }
        }

        let text = "";
        if (text_input.length) { text += text_input; }
        if (text_output.length) {
            if (text.length) { text += "\n"; }
            text += text_output;
        }
        if (text_function.length) {
            if (text.length) { text += "\n"; }
            text += text_function;
        }
        if (text_local.length) {
            if (text.length) { text += "\n"; }
            text += text_local;
        }

        editor.edit(editBuilder => {
            for (let line of decLines) {
                editBuilder.delete(line.rangeIncludingLineBreak);
            }
            const line = first_non_comment_line(document);
            editBuilder.insert(line.range.start, text);
        });
    }
}


/**
 * reset all declarations
 * 
 */
function declarations_range(document: vscode.TextDocument): vscode.Range {

    // Get the word within the selection
    const count = document.lineCount;
    let first: vscode.TextLine | undefined = undefined;
    let last: vscode.TextLine | undefined = undefined;

    for (let i = 0; i < count; ++i) {
        const line = document.lineAt(i);
        const text = line.text;
        if (is_line_declaration(line)) {
            break;
        }
        if (re_declaration.test(text)) {
            if (!first) {
                first = line;
            }
            last = line;
        }
    }

    if (!first || !last) {
        return new vscode.Range(0, 0, 0, 0);
    }

    return first.range.union(last.range);
}

type DecMap = { [declaration_type: string]: string[]; };

/**
 * split declaration text and add to declaration list.
 */
function parse_declaration_list(dest: string[], text: string) {
    append_declarations(dest, parse_declarations(text));
}

/**
 * add to declaration list.
 */
function append_declarations(dest: string[], source: string[]) {
    dest.push(...source.filter(d => dest.indexOf(d) === -1));
}


/**
 * split declaration text.
 */
function parse_declarations(text: string): string[] {
    const dec_match = re_declaration.exec(text);
    const ident_text = dec_match ? text.substring(dec_match[0].length) : text;
    const decl_items = ident_text.replace(/(\s+~\s*)|(\s*'.*)$/, '').split(',').map(n => n.trim());
    return decl_items.filter(decl => decl.length);
}

