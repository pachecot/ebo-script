import * as vscode from 'vscode';
import { clean_declarations, compact_declarations, expand_declarations } from './ebo-declares';
import { EboCodeActionProvider } from './ebo-code-actions';
import { EboDeclarationConverter } from './ebo-declaration-converter';
import { EboDiagnostics } from './ebo-diagnostics';
import { EboScriptDocumentFormatter } from './ebo-script-document-formatter';
import { EboSignatureHelpProvider } from './ebo-signature-help-provider';
import { EBO_SCRIPT } from './extension-types';

export function deactivate() { }

export function activate(context: vscode.ExtensionContext) {

    const diagnostics = new EboDiagnostics();

    if (vscode.window.activeTextEditor) {
        diagnostics.update(vscode.window.activeTextEditor.document);
    }

    context.subscriptions.push(
        vscode.commands.registerCommand("ebo-script.clean-declarations", () => {
            clean_declarations(diagnostics);
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
            fileDeleteEvent.files.forEach(file => diagnostics.delete(file));
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(document => {
            diagnostics.update(document);
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => {
            diagnostics.update(e.document);
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                diagnostics.update(editor.document);
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
            EBO_SCRIPT, new EboCodeActionProvider(), {
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

