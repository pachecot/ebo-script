import * as vscode from 'vscode';
import * as sig from './ebo-signatures';


export class EboSignatureHelpProvider implements vscode.SignatureHelpProvider {

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
                }
                else {
                    reject();
                }
            }
        });

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
    }
    else {
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
