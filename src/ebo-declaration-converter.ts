import * as vscode from 'vscode';
import { declarations, reDeclaration } from './ebo-declaration';


/**
 * Provides code actions for converting Declarations.
 */
export class EboDeclarationConverter implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        if (!isDeclaration(document, range)) {
            return;
        }

        const decRange = getDeclarationRange(document, range);
        if (!decRange) {
            return;
        }
        const decText = document.getText(decRange).toLowerCase();

        return declarations
            .filter(dec => dec.toLowerCase() !== decText)
            .map(dec => createDeclarationChangeFix(document, decRange, dec));
    }
}


/**
 * test if is a declaration line 
 */
function isDeclaration(document: vscode.TextDocument, range: vscode.Range) {
    const line = document.lineAt(range.start.line);
    return reDeclaration.test(line.text);
}


/**
 * get the declaration type range
 */
function getDeclarationRange(document: vscode.TextDocument, range: vscode.Range): vscode.Range | undefined {
    const line = document.lineAt(range.start.line);
    const m = reDeclaration.exec(line.text);
    if (!m) {
        return;
    }
    return new vscode.Range(
        line.lineNumber, m.index,
        line.lineNumber, m[1].length
    );
}


function createDeclarationChangeFix(document: vscode.TextDocument, range: vscode.Range, declaration: string): vscode.CodeAction {
    const fix = new vscode.CodeAction(`Convert to ${declaration}`, vscode.CodeActionKind.QuickFix);
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(document.uri, range, declaration);
    return fix;
}


