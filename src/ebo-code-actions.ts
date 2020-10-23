import * as vscode from 'vscode';
import { declarations } from './ebo-declaration';
import { EboErrors } from "./EboErrors";
import { EboExt } from './EboExt';
import { first_non_comment_line } from './document-util';


/**
 * Provide code actions for diagnostics of declaration errors
 * 
 */
export class EboCodeActionProvider implements vscode.CodeActionProvider {

    constructor(readonly eboExt: EboExt) { }

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(
        document: vscode.TextDocument, range: vscode.Range,
        context: vscode.CodeActionContext, token: vscode.CancellationToken):
        vscode.CodeAction[] {

        const actions = context.diagnostics
            .reduce((actions: vscode.CodeAction[], diagnostic) => {
                const name = document.getText(diagnostic.range);
                switch (diagnostic.code) {
                    case EboErrors.DuplicateDeclaration:    // fallthru
                    case EboErrors.RedeclaredFunction:      // fallthru
                    case EboErrors.UnreferencedDeclaration: // fallthru
                    case EboErrors.UnreferencedFunction:
                        actions.push(createRemoveDeclaration(document, diagnostic));
                        break;

                    case EboErrors.UndeclaredFunction:
                        actions.push(createAddFunctionDeclaration(document, diagnostic, name));
                        break;

                    case EboErrors.UndeclaredVariable:
                        const id = document.getText(diagnostic.range);
                        const st = this.eboExt.symbols.get(document.uri);

                        const sym_name = Object.keys(st.symbols).find(s => s.toLowerCase() === id.toLowerCase());
                        if (sym_name) {
                            actions.push(createFixVariableCase(document, diagnostic, name, sym_name));
                        } else {
                            actions = actions.concat(createAddDeclarations(document, diagnostic, name, id in st.assigned_refs));
                        }

                        break;
                };
                return actions;
            }, []);

        return actions;
    }
}

export const reReadOnlyDeclaration = /(Input|Triggered)$/i;

function createFixVariableCase(document: vscode.TextDocument, diagnostic: vscode.Diagnostic, name: string, fix_name: string): vscode.CodeAction {
    const action = new vscode.CodeAction(`Change case to match declaration '${fix_name}'`, vscode.CodeActionKind.QuickFix);
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    action.edit = new vscode.WorkspaceEdit();
    action.edit.replace(document.uri, diagnostic.range, fix_name);
    return action;
}


function createAddDeclarations(document: vscode.TextDocument, diagnostic: vscode.Diagnostic, name: string, writeable: boolean): vscode.CodeAction[] {

    return declarations
        .filter(dec =>
            !writeable || !reReadOnlyDeclaration.test(dec)
        )
        .map(dec => {
            const action = new vscode.CodeAction(`Add ${dec} Declaration`, vscode.CodeActionKind.QuickFix);
            action.diagnostics = [diagnostic];
            action.edit = new vscode.WorkspaceEdit();
            const line = first_non_comment_line(document);
            action.edit.insert(document.uri, line.range.start, `${dec} ${name}\n`);
            return action;
        });
}

function createAddFunctionDeclaration(document: vscode.TextDocument, diagnostic: vscode.Diagnostic, name: string): vscode.CodeAction {
    const action = new vscode.CodeAction('Add Function Declaration', vscode.CodeActionKind.QuickFix);
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    action.edit = new vscode.WorkspaceEdit();
    const line = first_non_comment_line(document);

    action.edit.insert(document.uri, line.range.start, `Function ${name}\n`);
    return action;
}

const diagnostic_fix_titles: { [id: string]: string } = {
    [EboErrors.DuplicateDeclaration]: "Remove Duplicate Declaration",
    [EboErrors.UnreferencedDeclaration]: "Remove Unreferenced Declaration",
    [EboErrors.UnreferencedFunction]: "Remove Unreferenced Function",
};

function createRemoveDeclaration(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {

    const title = diagnostic_fix_titles[String(diagnostic.code)] || "Remove Declaration";
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    action.diagnostics = [diagnostic];
    action.isPreferred = true;

    action.edit = new vscode.WorkspaceEdit();
    const line = document.lineAt(diagnostic.range.start.line);
    if (line.text.includes(",")) {
        const prefix = line.text.substr(0, diagnostic.range.start.character - 1);
        if (prefix.match(",\s*")) {
            const start = prefix.lastIndexOf(',');
            const end_pos = diagnostic.range.end.character;
            const m = /^\s*\[\s*\d+\s*\]\s*/.exec(line.text.substr(end_pos));
            const end_offset = m ? m[0].length : 0;
            const range = new vscode.Range(
                new vscode.Position(
                    diagnostic.range.start.line,
                    start),
                diagnostic.range.end.translate(0, end_offset)
            );
            action.edit.delete(document.uri, range);
        } else {
            let end_pos = diagnostic.range.end.character;
            let end = line.text.indexOf(',', end_pos);
            if (end !== -1) {
                ++end;
                while (line.text[end] === ' ') {
                    ++end;
                }
                const range = new vscode.Range(
                    diagnostic.range.start,
                    new vscode.Position(
                        diagnostic.range.end.line,
                        end
                    )
                );
                action.edit.delete(document.uri, range);
            }
        }
    } else {
        action.edit.delete(document.uri, line.rangeIncludingLineBreak);
    }
    return action;
}


