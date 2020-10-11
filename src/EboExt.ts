import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import { ebo_parse_file } from './ebo-check';
import { editor_active_dirname } from './ebo-files';
import { EBO_SCRIPT } from './extension-types';
import { SymbolTable } from './SymbolTable';
import { SymbolTableCollection } from './SymbolTableMap';

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
                    issue.range.line, issue.range.end
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
    }

}
