import * as vscode from 'vscode';
import * as ebo from './ebo-check';
import { EBO_SCRIPT } from './extension-types';

export class EboDiagnostics {

    readonly collection = vscode.languages.createDiagnosticCollection(EBO_SCRIPT);

    clear(uri: vscode.Uri): void {
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

            this.collection.set(document.uri, issues);
        }
    }
}
