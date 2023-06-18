// generate state diagrams
import * as path from 'path';
import * as vscode from 'vscode';
import { editor_active_dirname, editor_active_doc_uri, editor_active_fsDirname, parent_uri } from './ebo-files';
import { EboExt } from './EboExt';
import { TextEncoder } from 'util';


function generateMermaidState(stateChanges: string[]): string {
    return `stateDiagram\n\t${stateChanges.join("\n\t")}\n`;
}

const utf8enc = new TextEncoder();

/**
 * open list of ebo-script files as new text document
 */
export function ebo_generate_state(eboExt: EboExt) {
    const dir_name = editor_active_dirname() || '.';
    vscode.workspace.findFiles(`${dir_name}/*.ebosp`).then(files => {
        let diags = files.map(uri => {
            const st = eboExt.symbols.get(uri);

            const names = st.line_names;
            if (!names.length) {
                return { uri, mmd: generateMermaidState(["[*]"]) };
            }

            const lines: { name: string, line: number }[] =
                names.map(name => ({ name, line: st.lines[name].range.line }));

            lines.sort((a, b) => a.line < b.line ? -1 : a.line === b.line ? 0 : 1);

            const gos: { name: string, line: number }[] = [];
            names.forEach(name => {
                const refs = st.line_refs[name];
                if (!refs) {
                    return;
                }
                refs.forEach(t => {
                    gos.push({ name: name, line: t.range.line });
                });
            });
            gos.sort((a, b) => a.line < b.line ? -1 : a.line === b.line ? 0 : 1);

            let current = "[*]";
            let i = -1;
            let next_line = lines[0].line;
            let states: string[] = [];
            if (st.fallthru) {
                let lastLine = current;
                lines.forEach(line => {
                    states.push(lastLine + "-->" + line.name);
                    lastLine = line.name;
                });

            } else {
                lines.forEach(line => {
                    states.push(line.name);
                });
                states.push(current + "-->" + lines[0].name);
            }

            const ss: { [name: string]: boolean } = {};
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
                const state = `${current} --> ${go.name}`;
                if (!ss[state]) {
                    ss[state] = true;
                    states.push(state);
                }
            });
            const mmd = generateMermaidState(states);
            // console.log(uri.path, mmd);
            return { uri, mmd };
        });

        // console.log(diags);

        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>State Diagrams</title>
</head>
<body>
`;

        diags.forEach(diag => {
            html += `
${diag.uri.path}
<pre class="mermaid">
---
title: ${path.basename(diag.uri.path, ".ebosp")}
---
${diag.mmd}
</pre>
`;
        });
        html += `<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
</script>
</body>
</html>
`;

        const dir_uri = parent_uri(editor_active_doc_uri()) || vscode.Uri.parse(".");
        const state_html = vscode.Uri.joinPath(dir_uri, `_state_diagrams.html`);
        const data = utf8enc.encode(html);
        vscode.workspace.fs.writeFile(state_html, data).then(() => {
            vscode.env.openExternal(state_html);
        });
    });

}

