import * as vscode from 'vscode';
import * as ebo from './ebo-check';
import { EBO_SCRIPT } from './extension-types';
import { SymbolTableCollection } from './SymbolTableMap';

export class EboExt {
    
    readonly symbols: SymbolTableCollection = new SymbolTableCollection();
    readonly collection = vscode.languages.createDiagnosticCollection(EBO_SCRIPT);

    clear(uri: vscode.Uri): void {
        this.symbols.delete(uri);
        this.collection.clear();
    }

    delete(uri: vscode.Uri): void {
        this.symbols.delete(uri);
        this.collection.delete(uri);
    }

    update(document: vscode.TextDocument): void {

        if (document && document.languageId === EBO_SCRIPT) {

            const ast = ebo.ebo_parse_file(document.getText());
            const issues = ast.errors.map(issue => (
                {
                    code: issue.id,
                    message: issue.message,
                    range: new vscode.Range(
                        issue.range.line, issue.range.begin,
                        issue.range.line, issue.range.end
                    ),
                    severity: issue.severity as unknown as vscode.DiagnosticSeverity,
                    source: ''
                }
            ));

            this.symbols.set(document.uri, ast);
            this.collection.set(document.uri, issues);
        }
    }

}
