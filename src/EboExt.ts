import { TextDecoder } from 'util';
import { existsSync, readFileSync } from 'fs';
import * as vscode from 'vscode';
import { ebo_parse_file } from './ebo-check';
import { editor_active_dirname, editor_active_fsDirname } from './ebo-files';
import { EBO_SCRIPT } from './extension-types';
import { SymbolTable, VarModifier } from './SymbolTable';
import { SymbolTableCollection } from './SymbolTableMap';
import path = require('path');


interface EConfig {
    "binding-rules": [string, string][]
    "io-file": string,
    "consumer-file": string,
    "io-points": { [name: string]: object },
    "consumer-values": { [name: string]: object },
}


class EboConfig {

    readonly file_name = 'ebo.json';

    config: EConfig | undefined;
    path: string = '';

    constructor() {
        const rules: [RegExp, string][] = [];
        this.path = editor_active_fsDirname();

        if (this.path) {
            const eboFile = path.join(this.path, this.file_name);
            if (existsSync(eboFile)) {
                const s = readFileSync(eboFile).toString();
                this.config = JSON.parse(s) as EConfig;
            }
        }
    }

    binding_rules() {
        if (!this.config) { return []; }
        const rules: [RegExp, string][] = [];
        if (this.config["binding-rules"]) {
            for (let br of this.config["binding-rules"]) {
                const r = new RegExp(`(?:.*\/)?${br[0]}`);
                const s = br[1];
                rules.push([r, s]);
            }
        }
        return rules;
    }

    io_points() {
        let io_list: string[] = [];

        if (!this.config) {
            return [];
        }
        if (this.config["io-file"]) {
            const io_file = path.join(this.path, this.config["io-file"]);
            if (existsSync(io_file)) {
                const io_text = readFileSync(io_file).toString();
                io_list = io_text.split('\n')
                    .map(x => x.replace(/#.*/, ''))
                    .map(x => x.trim())
                    .filter(x => x);
            }
        }
        if (this.config["io-points"]) {
            io_list = io_list.concat(
                Object.keys(this.config["io-points"])
            );
        }
        io_list.sort();
        return io_list;
    }

    consumers() {
        if (!this.config) {
            return [];
        }
        let consumer_list: string[] = [];
        if (this.config["consumer-file"]) {
            const consumer_file = path.join(this.path, this.config["consumer-file"]);
            if (existsSync(consumer_file)) {
                const consumer_text = readFileSync(consumer_file).toString();
                consumer_list = consumer_text.split('\n')
                    .map(x => x.replace(/#.*/, ''))
                    .map(x => x.trim())
                    .filter(x => x);
            }
        }
        if (this.config["consumer-values"]) {
            consumer_list = consumer_list.concat(
                Object.keys(this.config["consumer-values"])
            );
        }
        consumer_list.sort();
        return consumer_list;
    }

}



export class EboExt {
    static readonly languageId = EBO_SCRIPT;
    readonly symbols: SymbolTableCollection = new SymbolTableCollection();
    readonly collection = vscode.languages.createDiagnosticCollection(EBO_SCRIPT);
    readonly configuration = vscode.workspace.getConfiguration(EBO_SCRIPT);

    constructor(context: vscode.ExtensionContext) {
        if (vscode.window.activeTextEditor) {
            this.update(vscode.window.activeTextEditor.document);
            this.check_active_dir_files();
        }
        this.subscribe(context);
    }

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
            this.update_file(document.uri, document.getText());
        }
    }

    update_file(uri: vscode.Uri, fileText: string): void {
        const st = ebo_parse_file(fileText);
        this.update_ast(uri, st);
    }


    update_ast(uri: vscode.Uri, ast: SymbolTable): void {

        const issues = ast.errors.map(issue => (
            {
                code: issue.id,
                message: issue.message,
                range: new vscode.Range(
                    issue.range.line, issue.range.begin,
                    issue.range.line + (issue.range.lines || 0), issue.range.end
                ),
                severity: issue.severity as unknown as vscode.DiagnosticSeverity,
                source: ''
            }
        ));

        this.symbols.set(uri, ast);
        this.collection.set(uri, issues);
    }

    check_active_dir_files() {

        const dir_name = editor_active_dirname() || '.';

        vscode.workspace.findFiles(`${dir_name}/*.ebos?`)
            .then(uri_list => {
                const decoder = new TextDecoder("utf-8");
                uri_list
                    .filter(uri => !this.collection.has(uri))
                    .forEach(uri => {
                        vscode.workspace.fs.readFile(uri)
                            .then(fileBytes => decoder.decode(fileBytes))
                            .then(fileText => this.update_file(uri, fileText));
                    });
            });
    }

    show_variables() {

        const cfg = new EboConfig();
        const rules = cfg.binding_rules();
        const io_points = cfg.io_points();
        console.log(io_points);
        const consumers = cfg.consumers();

        const dir_name = editor_active_dirname() || '.';
        vscode.workspace.findFiles(`${dir_name}/*.ebosp`)
            .then(uri_list => {
                const vars: { [name: string]: boolean } = {};
                uri_list
                    .filter(uri => this.collection.has(uri))
                    .forEach(uri => {
                        const sym = this.symbols.get(uri);
                        const vs = sym.variables;
                        Object.keys(vs)
                            .map(k => vs[k])
                            .filter(var_dec => {
                                const modifier = var_dec.modifier;
                                return modifier === VarModifier.Output || modifier === VarModifier.Input;
                            })
                            .forEach(var_dec => {
                                let name = var_dec.name;
                                const fullName = `${uri.path.replace(/\.ebosp$/, '')}/${name}`;
                                for (let [rx, rs] of rules) {
                                    if (rx.test(fullName)) {
                                        name = fullName.replace(rx, rs);
                                        break;
                                    }
                                };
                                if (!io_points.includes(name) && !consumers.includes(name)) {
                                    vars[name] = vars[name] || var_dec.modifier === VarModifier.Output;
                                }
                            });
                    });

                const vs = Object.keys(vars);
                vs.sort();
                const vs_i: string[] = [];
                const vs_o: string[] = [];
                vs.forEach(v => {
                    if (vars[v]) {
                        vs_o.push(v);
                    } else {
                        vs_i.push(v);
                    }
                });

                vscode.workspace.openTextDocument({
                    content: `#${dir_name}\n\n#Setpoint Variables\n\n${vs_i.join("\n")}\n\n#Status Variables\n\n${vs_o.join("\n")}\n`
                }).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            });
    }





    workspace_onDidDeleteFiles(fileDeleteEvent: vscode.FileDeleteEvent) {
        fileDeleteEvent.files.forEach(file => this.delete(file));
    }

    workspace_onDidSaveTextDocument(document: vscode.TextDocument) {
        this.update(document);
    }

    workspace_onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
        this.update(e.document);
    }

    window_onDidChangeActiveTextEditor(editor: vscode.TextEditor | undefined) {
        if (editor) {
            this.update(editor.document);
            this.check_active_dir_files();
        }
    }

    subscribe(context: vscode.ExtensionContext) {
        vscode.window.onDidChangeActiveTextEditor(this.window_onDidChangeActiveTextEditor, this, context.subscriptions);
        vscode.workspace.onDidChangeTextDocument(this.workspace_onDidChangeTextDocument, this, context.subscriptions);
        vscode.workspace.onDidDeleteFiles(this.workspace_onDidDeleteFiles, this, context.subscriptions);
        vscode.workspace.onDidSaveTextDocument(this.workspace_onDidSaveTextDocument, this, context.subscriptions);

        context.subscriptions.push(
            vscode.commands.registerCommand("ebo-script.show_variables", this.show_variables, this)
        );
    }

}
