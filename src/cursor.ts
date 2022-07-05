import { TokenKind } from './ebo-types';
import { LexToken } from './ebo-scanner';
import { EboErrors } from "./EboErrors";

export interface Cursor {
    current: () => LexToken;
    item: (index: number) => LexToken;
    remain: () => number;
    advance: (count?: number) => void;
    matchAny: (...expected: TokenKind[]) => boolean;
    expect: (expected: TokenKind, message: string, id?: EboErrors) => boolean;
    error: (message: string, id?: EboErrors) => void;
}
