import * as vscode from 'vscode';
import { clean_declarations, compact_declarations, expand_declarations } from './ebo-declares';
import { EboCodeActionProvider } from './ebo-code-actions';
import { EboDeclarationConverter } from './ebo-declaration-converter';
import { EboScriptDocumentFormatter } from './ebo-script-document-formatter';
import { EboSignatureHelpProvider } from './ebo-signature-help-provider';
import { EBO_SCRIPT } from './extension-types';
import { EboExt } from './EboExt';

export function deactivate() { }

export function activate(context: vscode.ExtensionContext) {

    const eboExt = new EboExt();

    if (vscode.window.activeTextEditor) {
        eboExt.update(vscode.window.activeTextEditor.document);
    }

    context.subscriptions.push(
        vscode.commands.registerCommand("ebo-script.clean-declarations", () => {
            clean_declarations(eboExt);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("ebo-script.compact_declarations", compact_declarations)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("ebo-script.expand_declarations", expand_declarations)
    );

    context.subscriptions.push(
        vscode.workspace.onDidDeleteFiles(fileDeleteEvent => {
            fileDeleteEvent.files.forEach(file => eboExt.delete(file));
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(document => {
            eboExt.update(document);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => {
            eboExt.update(e.document);
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                eboExt.update(editor.document);
            }
        })
    );

    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            EBO_SCRIPT, new EboSignatureHelpProvider(), '(', ',')
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            EBO_SCRIPT, new EboScriptDocumentFormatter())
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            EBO_SCRIPT, new EboCodeActionProvider(eboExt), {
            providedCodeActionKinds: EboCodeActionProvider.providedCodeActionKinds
        })
    );
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            EBO_SCRIPT, new EboDeclarationConverter(), {
            providedCodeActionKinds: EboCodeActionProvider.providedCodeActionKinds
        })
    );
}
