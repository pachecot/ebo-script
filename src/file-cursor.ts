import { Cursor } from "./cursor";
import { LexToken } from "./ebo-scanner";
import { TokenKind } from "./ebo-types";
import { EboErrors } from "./EboErrors";
import { ErrorInfo, Severity, SymbolTable } from "./SymbolTable";

export class FileCursor implements Cursor {
    #pos = 0;
    constructor(
        private items: LexToken[],
        private symTable: SymbolTable
    ) { }
    remain(): number {
        return this.items.length - this.#pos;
    }
    current(): LexToken {
        return this.items[this.#pos];
    }
    item(index: number): LexToken {
        return this.items[this.#pos + index];
    }
    advance(amt = 1) {
        this.#pos += amt;
    }
    SymbolTable(): SymbolTable {
        return this.symTable;
    }
    error(message: string, id: EboErrors = EboErrors.ParseError) {
        const pos = this.#pos < this.items.length ? this.#pos : this.items.length - 1;
        const range = this.items[pos].range;
        this.symTable.add_error({
            id: id,
            severity: Severity.Error,
            message: message,
            range: range
        });
    }
    addError(err: ErrorInfo) {
        const pos = this.#pos < this.items.length ? this.#pos : this.items.length - 1;
        const range = this.items[pos].range;
        this.symTable.add_error(err);
    }
    expect(expected: TokenKind, message: string, id: EboErrors = EboErrors.ParseError): boolean {
        if (this.#pos >= this.items.length) {
            this.symTable.add_error({
                id: id,
                severity: Severity.Error,
                message: message,
                range: this.items[this.items.length - 1].range
            });
            return false;
        }
        const tk = this.items[this.#pos];
        if (tk.type !== expected) {
            this.symTable.add_error({
                id: id,
                severity: Severity.Error,
                message: message,
                range: tk.range
            });
            return false;
        }
        return true;
    }
    match(expected: TokenKind): boolean {
        if (this.#pos >= this.items.length) {
            return false;
        }
        if (expected !== this.items[this.#pos].type) {
            return false;
        }
        return true;
    }
    matchAny(...expected: TokenKind[]): boolean {
        if (this.#pos >= this.items.length) {
            return false;
        }
        const t = this.items[this.#pos].type;
        return expected.some(e => e === t);
    }
}

