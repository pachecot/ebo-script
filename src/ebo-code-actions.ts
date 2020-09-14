import * as vscode from 'vscode';
import * as ebo from './ebo-check';
import { declarations } from './ebo-declaration';


/**
 * Provide code actions for diagnostics of declaration errors
 */
export class EboCodeActionProvider implements vscode.CodeActionProvider {

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
                    case ebo.EboErrors.DuplicateDeclaration:
                    case ebo.EboErrors.RedeclaredFunction:
                    case ebo.EboErrors.UnreferencedDeclaration:
                    case ebo.EboErrors.UnreferencedFunction:
                        actions.push(createRemoveDeclaration(document, diagnostic));
                        break;

                    case ebo.EboErrors.UndeclaredFunction:
                        actions.push(createAddFunctionDeclaration(document, diagnostic, name));
                        break;

                    case ebo.EboErrors.UndeclaredVariable:
                        actions = actions.concat(createAddDeclarations(document, diagnostic, name));
                        break;
                };
                return actions;
            }, []);

        return actions;
    }
}


function createAddDeclarations(document: vscode.TextDocument, diagnostic: vscode.Diagnostic, name: string): vscode.CodeAction[] {

    return declarations.map(dec => {
        const action = new vscode.CodeAction(`Add ${dec} Declaration`, vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.edit = new vscode.WorkspaceEdit();
        const line = document.lineAt(0);
        action.edit.insert(document.uri, line.range.start, `${dec} ${name}\n`);
        return action;
    });
}

function createAddFunctionDeclaration(document: vscode.TextDocument, diagnostic: vscode.Diagnostic, name: string): vscode.CodeAction {
    const action = new vscode.CodeAction('Add Function Declaration', vscode.CodeActionKind.QuickFix);
    action.diagnostics = [diagnostic];
    action.isPreferred = true;
    action.edit = new vscode.WorkspaceEdit();
    const line = document.lineAt(0);

    action.edit.insert(document.uri, line.range.start, `Function ${name}\n`);
    return action;
}

const diagnostic_fix_titles: { [id: string]: string } = {
    [ebo.EboErrors.DuplicateDeclaration]: "Remove Duplicate Declaration",
    [ebo.EboErrors.UnreferencedDeclaration]: "Remove Unreferenced Declaration",
    [ebo.EboErrors.UnreferencedFunction]: "Remove Unreferenced Function",
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
            const range = new vscode.Range(
                new vscode.Position(
                    diagnostic.range.start.line,
                    start),
                diagnostic.range.end
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


