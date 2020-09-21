import * as vscode from 'vscode';
import { EboDiagnostics } from './ebo-diagnostics';
import { get_var_dec_string } from './SymbolTable';
import { EboErrors } from "./EboErrors";

const DEC_MAX_LEN = 95;
const EXTENDED = true;

const re_comma = /\s*,\s*/g;
const re_declaration = /^\s*((Numeric|String|DateTime)(\s+(Public|Input|Output|Buffered|Triggered))?|Function)\s+/i;
const re_line_continuation = /~$/;
const re_line_declaration = /(\w+:)|^line\s+(\w|\d)+/i;

const declarations = [
    "DateTime Buffered",
    "DateTime Input",
    "DateTime Output",
    "DateTime Public",
    "DateTime Triggered",
    "Numeric Buffered",
    "Numeric Input",
    "Numeric Output",
    "Numeric Public",
    "Numeric Triggered",
    "String Buffered",
    "String Input",
    "String Output",
    "String Public",
    "String Triggered",
    "DateTime",
    "Numeric",
    "String",
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

    if (editor) {
        const document = editor.document;
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
                if (last_line && current_decl_type === decl_type && width < DEC_MAX_LEN) {
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
export function clean_declarations(diagnostics: EboDiagnostics) {

    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const document = editor.document;

        // Get the word within the selection
        const count = document.lineCount;
        const decLines: vscode.TextLine[] = [];
        const dec: { [name: string]: string[] } = {};

        const sym = diagnostics.symbols.get(document.uri);

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

        const dec_range = declarations_range(document);

        let j = -1;
        for (let i = dec_range.start.line; i <= dec_range.end.line; ++i) {
            let line = document.lineAt(i);
            const dec_id = get_declaration_id(line.text);
            if (dec_id !== -1) { j = i; }
            if (dec_id !== -1 && !line_has_comment(line)) {
                const decl_type = declarations[dec_id];
                const dec_list = dec[decl_type] || (dec[decl_type] = []);
                decLines.push(line);
                parse_declaration_list(dec_list, line.text);
                while (re_line_continuation.test(line.text)) {
                    line = document.lineAt(++i);
                    decLines.push(line);
                    parse_declaration_list(dec_list, line.text);
                }
            } else {
                if (j === i - 1 && line.isEmptyOrWhitespace) {
                    j = i;
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
                                    name = name.substr(0, index);
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


        editor.edit(editBuilder => {
            for (let line of decLines) {
                editBuilder.delete(line.rangeIncludingLineBreak);
            }
            let text = "";
            for (let name of declarations) {
                if (name === "Numeric") {
                    text += "\n";
                }
                const list = dec[name];
                if (list) {
                    if (name === "Function") {
                        text += "\n";
                    }
                    list.sort();
                    if (EXTENDED) {
                        text += `${name} ${list.join(`\n${name} `)}\n`;
                    } else {
                        let d = `${name} ${list.join(', ')}\n`;
                        if (d.length > DEC_MAX_LEN) {
                            while (d.length > DEC_MAX_LEN) {
                                let i = d.indexOf(',', DEC_MAX_LEN);
                                if (i === -1) { break; }
                                text = text + d.substr(0, i) + '\n';
                                d = `${name} ${d.substr(i + 2)}`;
                            }
                        }
                        text = text + d;
                    }
                }
            }
            text += '\n';
            editBuilder.insert(new vscode.Position(0, 0), text);
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
 *  
 * @param decl_type 
 * @param dec_map 
 * @param text 
 */
function parse_declaration_list(dec_list: string[], text: string) {

    const dec_match = re_declaration.exec(text);
    const ident_text = dec_match ? text.substr(dec_match[0].length) : text;
    const decl_items = ident_text.split(',').map(n => n.trim());

    decl_items.forEach(decl => {
        decl = decl.replace(/\s*~/, '');
        if (decl.length && decl !== '~' && dec_list.indexOf(decl) === -1) {
            dec_list.push(decl);
        }
    });
}

