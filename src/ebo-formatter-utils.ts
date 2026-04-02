import { LexToken } from './ebo-scanner';
import { TokenKind, isVariableKind } from './ebo-types';

function test_is_line_util(line: LexToken[]): boolean {
    if (line.length > 2) {
        const tk = line[0];
        switch (tk.type) {
            case TokenKind.ErrorLine:
            case TokenKind.IdentifierToken:
                if (line[1].type === TokenKind.ColonSymbol) { return true; }
                break;
            case TokenKind.LineStatement:
                if (line[1].type === TokenKind.IdentifierToken || line[1].type === TokenKind.NumberToken) {
                    return true;
                }
                break;
        }
    }
    return false;
}

/**
 * Returns the index of the assignment '=' token in the line, or undefined if
 * the line is not a simple bare-identifier assignment statement.
 */
export function detect_assign_line(line_tks: LexToken[]): number | undefined {
    if (line_tks.length < 4) { return undefined; }

    let s = 0;
    if (line_tks[s].type === TokenKind.WhitespaceToken) { s++; }

    const first = line_tks[s];
    if (first.type !== TokenKind.IdentifierToken && !isVariableKind(first.type)) {
        return undefined;
    }
    if (test_is_line_util(line_tks)) { return undefined; }

    let depth = 0;
    for (let i = s + 1; i < line_tks.length; i++) {
        switch (line_tks[i].type) {
            case TokenKind.ParenthesesLeftSymbol:
            case TokenKind.BracketLeftSymbol:
                depth++;
                break;
            case TokenKind.ParenthesesRightSymbol:
            case TokenKind.BracketRightSymbol:
                depth--;
                break;
            case TokenKind.EqualsSymbol:
                if (depth === 0) { return i; }
                break;
            case TokenKind.EndOfLineToken:
            case TokenKind.ContinueLineToken:
                return undefined;
        }
    }
    return undefined;
}

/**
 * Returns the column end of the last LHS token before the '=' at eq_idx.
 */
export function compute_lhs_end(line_tks: LexToken[], eq_idx: number): number {
    for (let i = eq_idx - 1; i >= 0; i--) {
        if (line_tks[i].type !== TokenKind.WhitespaceToken) {
            return line_tks[i].range.end;
        }
    }
    return 0;
}
