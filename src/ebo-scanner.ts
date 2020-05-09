import { Symbols, EboKeyWords, LxToken } from './ebo-types';

const SymbolMap = {
    '-': Symbols.MINUS_SIGN,
    ',': Symbols.COMMA,
    ';': Symbols.SEMICOLON,
    '!': Symbols.EXCLAMATION,
    '"': Symbols.DOUBLE_QUOTE,
    '(': Symbols.PARENTHESES_OP,
    ')': Symbols.PARENTHESES_CL,
    '[': Symbols.BRACKET_OP,
    ']': Symbols.BRACKET_CL,
    '*': Symbols.ASTERISK,
    '/': Symbols.SLASH,
    '\'': Symbols.APOSTROPHE,
    '\\': Symbols.BACKSLASH,
    '&': Symbols.AMPERSAND,
    '%': Symbols.PERCENT,
    '^': Symbols.CARET,
    '+': Symbols.PLUS_SIGN,
    '<': Symbols.ANGLE_LEFT,
    '=': Symbols.EQUALS_SIGN,
    '>': Symbols.ANGLE_RIGHT,
    '~': Symbols.TILDE,
    ':': Symbols.COLON,
    '<=': Symbols.LESS_THAN_EQUALS,
    '<>': Symbols.NOT_EQUAL,
    '>=': Symbols.GREATER_THAN_EQUALS,
} as { [name: string]: Symbols };


const reEndLine = /\r?\n/;
const reWhiteSpace = /\s+/;
const reComment = /'.*/;
const reQuotedString = /"(?:\|"|[^"|]*)*"/;
const reNumber = /\d+(?:\.\d+)?(?:[eE][-+]?[0-9]+)?/;
const reTime = /\d{1,2}:\d{2}(?:\s*(?:am|pm))?/;
const reSymbol = /(?:>=|<=|<>|[-,;!*&%^+<>=:~/\\()[\]])/;
const reKWords = new RegExp("(?:" + Object.keys(EboKeyWords).filter(x => isNaN(Number(x))).join('|') + ")\\b");
const reFnCall = /[\w_][\w\d_]+(?=\s*\()/;
const reToken = /[\w_][\w\d_]+\b/;
const reErr = /./;

export type Token = LxToken | EboKeyWords | Symbols;

export interface TextRange {
    line: number
    begin: number
    end: number
}

export interface LexToken {
    type: Token
    value: string
    range: TextRange
}

const scannerRe = new RegExp(`(${[
    //                          0
    reEndLine.source         // 1
    , reWhiteSpace.source    // 2
    , reComment.source       // 3
    , reQuotedString.source  // 4
    , reNumber.source        // 5
    , reTime.source          // 6
    , reSymbol.source        // 7
    , reKWords.source        // 8
    , reFnCall.source        // 9
    , reToken.source         // 10
    , reErr.source           // 11
].join(')|(')})`, 'yi');

const scannerFns: ((m: string) => Token)[] = [
/* 0 */    () => LxToken.TK_EOL,
/* 1 */    () => LxToken.TK_WHITESPACE,
/* 2 */    () => LxToken.TK_COMMENT,
/* 3 */    () => LxToken.TK_STRING,
/* 4 */    () => LxToken.TK_NUMBER,
/* 5 */    () => LxToken.TK_TIME,
/* 6 */    (m: string) => SymbolMap[m] || LxToken.TK_OPERATOR,
/* 7 */    (m: string): Token => (EboKeyWords as any)[m.toUpperCase()] || LxToken.TK_KEYWORD,
/* 8 */    () => LxToken.TK_FNCALL,
/* 9 */    () => LxToken.TK_IDENT,
/* 10*/    () => LxToken.TK_ERROR,
];

function ebo_scan_line(line: string, line_id: number): LexToken[] {

    const toks: LexToken[] = [];
    let m: RegExpExecArray | null;
    while ((m = scannerRe.exec(line))) {
        let i = 1;
        while (!m[i] && i < m.length) { ++i; }
        toks.push({
            range: {
                line: line_id,
                begin: m.index,
                end: m.index + m[i].length
            },
            type: scannerFns[i - 1](m[i]),
            value: m[i]
        });
    }
    toks.push({
        range: {
            line: line_id,
            begin: line.length,
            end: line.length + 1,
        },
        type: LxToken.TK_EOL,
        value: "\n"
    });
    return toks;
}

function ebo_scan_lines(lines: string[]) {
    return lines.map(ebo_scan_line);
}

/**
 * tokenize the file text 
 * @param fileText 
 */
export function ebo_scan_text(fileText: string) {
    return ebo_scan_lines(fileText.split(reEndLine));
}
