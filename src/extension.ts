import * as vscode from 'vscode';
import { clean_declarations, compact_declarations, expand_declarations } from './ebo-declares';
import { EboCodeActionProvider } from './ebo-code-actions';
import { EboDeclarationConverter } from './ebo-declaration-converter';
import { EboScriptDocumentFormatter } from './ebo-script-document-formatter';
import { EboSignatureHelpProvider } from './ebo-signature-help-provider';
import { EboExt } from './EboExt';
import { ebo_show_files } from './ebo-files';
import { ebo_generate_state, ebo_make_mermaid, ebo_show_stateDiagram } from './ebo-state';

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
        vscode.commands.registerCommand("ebo-script.generate_state", () => { ebo_generate_state(eboExt); })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("ebo-script.ebo_show_stateDiagram", () => { ebo_show_stateDiagram(eboExt); })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("ebo-script.ebo_create_stateDiagram", () => { ebo_make_mermaid(eboExt); })
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
