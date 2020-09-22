import * as vscode from 'vscode';

/**
 * find the first line of document that does not start with a comment
 * 
 * @param document 
 */
export function first_non_comment_line(document: vscode.TextDocument) {
    for (let i = 0; i < document.lineCount; ++i) {
        let line = document.lineAt(i);
        if (!(/^\s*'/.test(line.text))) {
            return line;
        }
    }
    return document.lineAt(0);
}
