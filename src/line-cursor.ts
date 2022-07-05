import { TokenKind } from './ebo-types';
import { LexToken } from './ebo-scanner';
import {
    Severity,
    SymbolTable
} from './SymbolTable';
import { EboErrors } from "./EboErrors";
import { Cursor } from './cursor';


export class LineCursor implements Cursor {
    #pos = 0;
    constructor(private items: LexToken[], private symTable: SymbolTable) { }
    remain() {
        return this.items.length - this.#pos;
    }
    current() {
        return this.items[this.#pos];
    }
    item(index: number) {
        return this.items[this.#pos + index];
    }
    advance(amt = 1) {
        this.#pos += amt;
    }
    error(message: string, id: EboErrors = EboErrors.ParseError) {
        const range = this.items[this.#pos].range;
        this.symTable.add_error({
            id: id,
            severity: Severity.Error,
            message: message,
            range: range
        });
    }
    expect(expected: TokenKind, message: string, id: EboErrors = EboErrors.ParseError): boolean {
        const pos = this.#pos;
        if (this.items[pos].type !== expected) {
            const range = this.items[pos].range;
            this.symTable.add_error({
                id: id,
                severity: Severity.Error,
                message: message,
                range: range
            });
            return false;
        }
        return true;
    }
    match(expected: TokenKind, message: string): boolean {
        const tk = this.items[this.#pos];
        if (expected !== tk.type) {
            this.symTable.add_error({
                id: EboErrors.ParseError,
                severity: Severity.Error,
                message: message,
                range: tk.range
            });
            return false;
        }
        ++this.#pos;
        return true;
    }
    matchAny(...expected: TokenKind[]): boolean {
        const t = this.items[this.#pos].type;
        return expected.some(e => e === t);
    }
}
