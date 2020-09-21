import * as vscode from 'vscode';
import { SymbolTable } from './SymbolTable';

type SymbolTableMap = { [uri_path: string]: SymbolTable; };
export class SymbolTableCollection {

    #symbols: SymbolTableMap = {};

    delete(uri: vscode.Uri) {
        delete this.#symbols[uri.path];
    }

    set(uri: vscode.Uri, table: SymbolTable) {
        this.#symbols[uri.path] = table;
    }

    clear() {
        this.#symbols = {};
    }

    get(uri: vscode.Uri) {
        return this.#symbols[uri.path];
    }
}
