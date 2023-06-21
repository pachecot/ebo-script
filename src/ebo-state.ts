// generate state diagrams
import * as path from 'path';
import * as vscode from 'vscode';
import { editor_active_dirname, editor_active_doc_uri, editor_active_fsDirname, parent_uri } from './ebo-files';
import { EboExt } from './EboExt';
import { TextEncoder } from 'util';
import { SymbolTable } from './SymbolTable';


function generateMermaidState(stateChanges: string[]): string {
    return `stateDiagram\n\t${stateChanges.join("\n\t")}\n`;
}

function changeExt(uri: vscode.Uri, ext: string): vscode.Uri {
    if (ext[0] !== '.') { ext = '.' + ext; }
    const newFile = vscode.Uri.joinPath(uri.with({ path: path.dirname(uri.path) }), path.basename(uri.path, path.extname(uri.path)) + ext);
    return newFile;
}

const utf8enc = new TextEncoder();

type LinePos = { name: string, line: number };

const compareLines = (a: LinePos, b: LinePos) => a.line < b.line ? -1 : a.line === b.line ? 0 : 1;

/**
 * make mermaid file
 */
export function ebo_make_mermaid(eboExt: EboExt) {

    const doc_uri = editor_active_doc_uri();
    if (!doc_uri) {
        console.log('error getting document');
        return;
    }
    const st = eboExt.symbols.get(doc_uri);
    if (!st) {
        console.log('error getting symbol table');
        return;
    }
    const mmd = mmdFromST(st);
    const data = utf8enc.encode(mmd);

    const doc_mmd = changeExt(doc_uri, '.mmd');
    vscode.workspace.fs.writeFile(doc_mmd, data).then(() => {
        vscode.window.showTextDocument(doc_mmd);
    });
}


/**
 * show state diagram
 */
export function ebo_show_stateDiagram(eboExt: EboExt) {

    const doc_uri = editor_active_doc_uri();
    if (!doc_uri) {
        return;
    }
    const st = eboExt.symbols.get(doc_uri);
    const mmd = mmdFromST(st);

    // mermaid.default.render('graphDiv', mmd).then(
    //     ({ svg, bindFunctions }) => {

    //         const panel = vscode.window.createWebviewPanel(
    //             'stateDiagram',
    //             'State Diagram',
    //             vscode.ViewColumn.One,
    //             {
    //                 // Enable scripts in the webview
    //                 enableScripts: true
    //             }
    //         );
    //         panel.webview.html = svg;
    //     }
    // );


}


function mmdFromST(st: SymbolTable) {
    const names = st.line_names;
    if (!names.length) {
        return generateMermaidState(["[*]"]);
    }

    const lines: LinePos[] = names.map(
        name => ({ name, line: st.lines[name].range.line })
    );
    lines.sort(compareLines);

    const gos: LinePos[] = [];
    names.forEach(name => {
        const refs = st.line_refs[name];
        if (!refs) {
            return;
        }
        refs.forEach(t => {
            gos.push({ name: name, line: t.range.line });
        });
    });
    gos.sort(compareLines);

    let current = "[*]";
    let i = -1;
    let next_line = lines[0].line;
    let states: string[] = [];
    let seen: { [name: string]: boolean } = {};
    if (st.fallthru) {
        let lastLine = current;
        lines.forEach(line => {
            states.push(lastLine + "-->" + line.name);
            lastLine = line.name;
        });
    } else {
        lines.forEach(line => {
            seen[line.name] = false;
        });
        states.push(current + "-->" + lines[0].name);
        seen[lines[0].name] = true;
    }

    const ss: { [name: string]: boolean; } = {};
    gos.forEach(go => {
        if (go.line > next_line) {
            i++;
            current = lines[i].name;
            if (i + 1 < lines.length) {
                next_line = lines[i + 1].line;
            } else {
                next_line = 999999;
            }
        }
        seen[current] = true;
        seen[go.name] = true;
        const state = `${current} --> ${go.name}`;
        if (!ss[state]) {
            ss[state] = true;
            states.push(state);
        }
    });

    for (let n in seen) {
        if (!seen[n]) {
            states.push(n);
        }
    }
    return generateMermaidState(states);
}

/**
 * generate html file with state diagrams for all scripts in the directory
 */
export function ebo_generate_state(eboExt: EboExt) {
    const dir_name = editor_active_dirname() || '.';
    vscode.workspace.findFiles(`${dir_name}/*.ebosp`).then(files => {
        files.sort((a, b) => a.path.localeCompare(b.path));
        let diags = files.map((uri: vscode.Uri) => {
            const st = eboExt.symbols.get(uri);
            const mmd = mmdFromST(st);
            return { uri, mmd };
        });

        let html = createStateHtmlDoc(diags);
        const dir_uri = parent_uri(editor_active_doc_uri()) || vscode.Uri.parse(".");
        const state_html = vscode.Uri.joinPath(dir_uri, `_state_diagrams.html`);
        const data = utf8enc.encode(html);
        vscode.workspace.fs.writeFile(state_html, data).then(() => {
            vscode.env.openExternal(state_html);
        });
    });

}

function createStateHtmlDoc(diags: { uri: vscode.Uri; mmd: string; }[]) {

    const body = diags.map(diag => `
${diag.uri.path}
<pre class="mermaid">
---
title: ${path.basename(diag.uri.path, ".ebosp")}
---
${diag.mmd}
</pre>
`).join();

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>State Diagrams</title>
</head>
<body>
${body}
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
</script>
</body>
</html>
`;

    return html;
}

