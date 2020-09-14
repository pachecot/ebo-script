import * as vscode from 'vscode';
import * as ebo from './ebo-check';
import * as sig from './ebo-signatures';
import { getReformatEdits } from './ebo-formatter';

const EBO_SCRIPT = 'ebo-script';

export function deactivate() { }

export function activate(context: vscode.ExtensionContext) {

    const diagnostics = new EboDiagnostics();

    if (vscode.window.activeTextEditor) {
        diagnostics.update(vscode.window.activeTextEditor.document);
    }

    context.subscriptions.push(
        vscode.workspace.onDidDeleteFiles(fileDeleteEvent => {
            fileDeleteEvent.files.forEach(file => diagnostics.clear(file));
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

}


class EboDiagnostics {

    readonly collection = vscode.languages.createDiagnosticCollection(EBO_SCRIPT);

    clear(uri: vscode.Uri): void {
        this.collection.delete(uri);
    }

    update(document: vscode.TextDocument): void {

        if (document && document.languageId === 'ebo-script') {

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
    return m ? m[1] : '';
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
            let name = getFunctionName(lineSoFar(document, position));
            if (name) {
                const info = sig.get(name);
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

