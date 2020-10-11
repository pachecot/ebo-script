import * as vscode from 'vscode';
import { clean_declarations, compact_declarations, expand_declarations } from './ebo-declares';
import { EboCodeActionProvider } from './ebo-code-actions';
import { EboDeclarationConverter } from './ebo-declaration-converter';
import { EboScriptDocumentFormatter } from './ebo-script-document-formatter';
import { EboSignatureHelpProvider } from './ebo-signature-help-provider';
import { EboExt } from './EboExt';
import { ebo_show_files } from './ebo-files';

export function deactivate() { }

export function activate(context: vscode.ExtensionContext) {

    const eboExt = new EboExt(context);

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
        vscode.commands.registerCommand("ebo-script.show_files", ebo_show_files)
    );

    context.subscriptions.push(
        vscode.languages.registerSignatureHelpProvider(
            EboExt.languageId, new EboSignatureHelpProvider(), '(', ',')
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            EboExt.languageId, new EboScriptDocumentFormatter())
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            EboExt.languageId, new EboCodeActionProvider(eboExt), {
            providedCodeActionKinds: EboCodeActionProvider.providedCodeActionKinds
        })
    );
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            EboExt.languageId, new EboDeclarationConverter(), {
            providedCodeActionKinds: EboCodeActionProvider.providedCodeActionKinds
        })
    );
}
