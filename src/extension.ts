import * as vscode from 'vscode';
import * as ebo from './ebo-check';
import * as sig from './signatures';
import { getReformatEdits } from './ebo-formatter';

const EBO_SCRIPT = 'ebo-script';

export function deactivate() { }

export function activate(context: vscode.ExtensionContext) {

    const collection = vscode.languages.createDiagnosticCollection(EBO_SCRIPT);

    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, collection);
    }

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(document => {
            updateDiagnostics(document, collection);
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDiagnostics(editor.document, collection);
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

}

function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {

    if (document && document.languageId === 'ebo-script') {

        const ast = ebo.ebo_parse_file(document.getText());
        const issues = ast.issues.map(issue => (
            {
                code: issue.id,
                message: issue.message,
                range: new vscode.Range(new vscode.Position(issue.pos.line, issue.pos.index), new vscode.Position(issue.pos.line, issue.pos.index + issue.pos.size)),
                severity: issue.severity as unknown as vscode.DiagnosticSeverity,
                source: ''
            }
        ));

        collection.set(document.uri, issues);
    }
}


function toSignatureHelp(info: sig.Signature) {
    let h = new vscode.SignatureHelp();
    // h.activeParameter = 0;
    // h.activeSignature = 0;
    if (info.alias) {
        let alias = info.alias.join(',');
        h.signatures = info.syntaxes.map(syn => new vscode.SignatureInformation(syn, new vscode.MarkdownString(
            `${info.description}

+ Alias: ${alias}`
        )));
    } else {
        h.signatures = info.syntaxes.map(syn => new vscode.SignatureInformation(syn, new vscode.MarkdownString(
            `${info.description}`
        )));
    }
    return h;
}


const reFunctionName = /.*\b(\w[\w\d]*)\s*\(/;
function getFunctionName(text: string) {
    let m = reFunctionName.exec(text);
}


function lineSoFar(document: vscode.TextDocument, position: vscode.Position) {
    return document.lineAt(position.line).text.substring(0, position.character);
}

class EboSignatureHelpProvider implements vscode.SignatureHelpProvider {
    public provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.SignatureHelp> {
        return new Promise((resolve, reject) => {
            let m = reFunctionName.exec(lineSoFar(document, position));
            if (m) {
                const info = sig.get(m[1]);
                if (info) {
                    resolve(toSignatureHelp(info));
                } else {
                    reject();
                }
            }
        });

    }
}


class EboScriptDocumentFormatter implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
        return getReformatEdits(document);
    }
}

