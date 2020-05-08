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


const reWhiteSpace = /^\s+/;
const reComment = /^(?:'.*)/;
const reQuotedString = /^"(?:\|"|[^"|]*)*"/;
const reNumber = /^(?:\d+(?:\.\d+)?(?:[eE][-+]?[0-9]+)?)/;
const reTime = /^(?:\d{1,2}:\d{2}(?:\s*(i?:am|pm))?)/;
const reKWords = new RegExp("^(?:" + Object.keys(EboKeyWords).filter(x => isNaN(Number(x))).join('|') + ")\\b", 'i');
const reSymbol = /^(?:>=|<=|<>|[-,;!*&%^+<>=:~/\\()[\]])/;
const reToken = /^[\w\d_]+\b/;
const reErr = /^./;

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

const scannerMap: [RegExp, ((m: string) => Token)][] = [
    [reWhiteSpace, () => LxToken.TK_WHITESPACE],
    [reComment, () => LxToken.TK_COMMENT],
    [reQuotedString, () => LxToken.TK_STRING],
    [reNumber, () => LxToken.TK_NUMBER],
    [reTime, () => LxToken.TK_TIME],
    [reSymbol, (m: string) => SymbolMap[m] || LxToken.TK_OPERATOR],
    [reKWords, (m: string) => EboKeyWords[m.toUpperCase() as any] as any as EboKeyWords || LxToken.TK_KEYWORD],
    [reToken, () => LxToken.TK_IDENT],
    [reErr, () => LxToken.TK_ERROR],
];

export function ebo_scan_line(line: string, line_id: number): LexToken[] {

    const toks: LexToken[] = [];
    let pos = 0;
    let remain = line;

    while (remain.length) {
        for (let [re, fn] of scannerMap) {
            let m = re.exec(remain);
            if (m) {
                let sz = m[0].length;
                toks.push({
                    range: {
                        line: line_id,
                        begin: pos,
                        end: pos + sz,
                    },
                    type: fn(m[0]),
                    value: m[0]
                });
                pos += sz;
                remain = remain.substring(sz);
                break;
            }
        }
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

export function ebo_scan_lines(lines: string[]) {
    return lines.map(ebo_scan_line);
}

/**
 * tokenize the file text 
 * @param fileText 
 */
export function ebo_scan_text(fileText: string) {
    return ebo_scan_lines(fileText.split('\r\n'));
}
