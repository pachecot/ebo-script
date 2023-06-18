import * as path from 'path';
import * as vscode from 'vscode';


/**
 * get the dirname of the document in the active editor 
 */
export function editor_active_doc_uri() {

    const editor = vscode.window.activeTextEditor;

    if (editor && vscode.workspace) {
        return editor.document.uri;
    }

    return undefined;
}

export function parent_uri(uri: vscode.Uri | undefined) {
    return uri && uri.with({ path: path.dirname(uri.path) });
}


/**
 * get the dirname of the document in the active editor 
 */
export function editor_active_fsDirname() {
    const doc_uri = editor_active_doc_uri();
    return doc_uri ? path.dirname(doc_uri.fsPath) : "";
}

/**
 * get the dirname of the document in the active editor 
 */
export function editor_active_dirname() {

    const doc_uri = editor_active_doc_uri();
    if (doc_uri) {
        return vscode.workspace.asRelativePath(path.dirname(doc_uri.path));
    }
    return "";
}

/**
 * open list of ebo-script files as new text document
 */
export function ebo_show_files() {
    const dir_uri = parent_uri(editor_active_doc_uri());

    if (dir_uri) {
        vscode.workspace.fs.readDirectory(dir_uri)
            .then((files) => {

                const file_map = files.reduce(
                    (acc: { [ext: string]: string[] }, [file, _]) => {
                        const ext = path.extname(file).toLowerCase();
                        const a = acc[ext] || (acc[ext] = []);
                        a.push(path.basename(file, ext));
                        return acc;
                    }, {});

                let fileList = '';
                if (file_map['.ebosp']) {
                    fileList += '#Script-Programs\n';
                    fileList += file_map['.ebosp'].join('\n');
                    fileList += '\n';
                }

                if (file_map['.ebosf']) {
                    if (fileList) { fileList += '\n'; }
                    fileList += '#Script-Functions\n';
                    fileList += file_map['.ebosf'].join('\n');
                    fileList += '\n';
                }

                vscode.workspace.openTextDocument({
                    content: fileList
                }).then(doc => {
                    vscode.window.showTextDocument(doc);
                });

            }, e => {
                console.log(e);
            });
    }
}

