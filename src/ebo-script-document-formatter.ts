import * as vscode from 'vscode';
import { getReformatEdits } from './ebo-formatter';


export class EboScriptDocumentFormatter implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
        return getReformatEdits(document);
    }
}
