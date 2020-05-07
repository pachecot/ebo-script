import * as vscode from 'vscode';
import { ebo_scan_text, LexToken, TextRange, Token } from './ebo-scanner';
import { LxToken, EboKeyWords, Symbols } from './ebo-types';

const size = 2;

function test_if_then_open(line: LexToken[]) {

    let s = 0;
    if (line[0].type === LxToken.TK_WHITESPACE) { ++s; }
    if (line[s].type !== EboKeyWords.IF) {
        return false;
    }
    let i = line.length - 1;
    while (i > 0) {
        let ty = line[--i].type;
        if (ty === EboKeyWords.THEN) {
            return true;
        }
        if (!(ty === LxToken.TK_WHITESPACE || ty === LxToken.TK_COMMENT)) {
            break;
        }
    }
    return false;
}

function test_line(line: LexToken[]) {

    if (line.length > 2) {
        let tk = line[0];
        switch (tk.type) {
            case LxToken.TK_IDENT:
                if (line[1].type === Symbols.COLON) {
                    return tk;
                }
                break;
            case EboKeyWords.LINE:
                tk = line[1];
                if (tk.type === LxToken.TK_IDENT || tk.type === LxToken.TK_NUMBER) {
                    return tk;
                }
                break;
        }
    }
    return undefined;
}

const close_tags: Token[] = [
    EboKeyWords.ELSE
    , EboKeyWords.CASE
    , EboKeyWords.ENDIF
    , EboKeyWords.ENDSELECT
    , EboKeyWords.ENDWHEN
    , EboKeyWords.ENDWHILE
    , EboKeyWords.UNTIL
    , EboKeyWords.NEXT
];

const open_tags: Token[] = [
    EboKeyWords.ELSE
    , EboKeyWords.CASE
    , EboKeyWords.FOR
    , EboKeyWords.REPEAT
    , EboKeyWords.SELECT
    , EboKeyWords.WHEN
    , EboKeyWords.WHILE
];


/**
 * get the start postion
 */
function pos_start(rng: TextRange) {
    return new vscode.Position(rng.line, rng.begin);
}

/**
 * get the end position 
 */
function pos_end(rng: TextRange) {
    return new vscode.Position(rng.line, rng.end);
}

/**
 * all but the last character in the range.
 */
function range1(rng: TextRange) {
    return new vscode.Range(pos_start(rng),
        new vscode.Position(rng.line, rng.end - 1)
    );
}

/**
 * the rest of the range from start to end.
 */
function range_back(start: number, rng: TextRange) {
    return new vscode.Range(
        new vscode.Position(rng.line, start),
        pos_end(rng)
    );
}

/**
 * create a space insert before the range  
 */
function insertSpace(rng: TextRange) {
    return vscode.TextEdit.insert(pos_start(rng), ' ');
}

/**
 * convert into a vscode range
 */
function toRange(rng: TextRange) {
    return new vscode.Range(pos_start(rng), pos_end(rng));
}

function range_size(rng: TextRange) {
    return rng.end - rng.begin;
}

const reTrailingSpaces = /\s+$/;

export function getReformatEdits(document: vscode.TextDocument): vscode.TextEdit[] {

    let tokens = ebo_scan_text(document.getText());
    let edits: vscode.TextEdit[] = [];
    let depth = 0;

    for (let line_tks of tokens) {
        if (line_tks.length === 1) { /* EOL */ continue; }

        let lastTk = line_tks[line_tks.length - 2];

        // trim trailing spaces

        if (lastTk.type === LxToken.TK_WHITESPACE) {
            edits.push(vscode.TextEdit.delete(toRange(lastTk.range)));
        } else if (lastTk.type === LxToken.TK_COMMENT) {
            let we = reTrailingSpaces.exec(lastTk.value);
            if (we) {
                edits.push(vscode.TextEdit.delete(range_back(lastTk.range.begin + we.index, lastTk.range)));
            }
        }

        // do indentations

        let ws = line_tks[0].type === LxToken.TK_WHITESPACE ? line_tks[0] : undefined;
        let first = ws ? line_tks[1] : line_tks[0];

        if (close_tags.includes(first.type)) {
            depth -= size;
        }
        if (first.type === LxToken.TK_EOL && ws && range_size(ws.range)) {
            /// needed??
        }

        if (test_line(line_tks)) {
            depth = size;
        } else {
            let cnt = depth - first.range.begin;
            if (cnt > 0) {
                edits.push(vscode.TextEdit.insert(pos_start(first.range), ' '.repeat(cnt)));
            } else if (cnt < 0 && ws && line_tks.length > 2) {
                edits.push(vscode.TextEdit.delete(range_back(ws.range.begin + depth, ws.range)));
            }
        }
        if (open_tags.includes(first.type) || test_if_then_open(line_tks)) {
            depth += size;
        }

        // formatting for operators

        // for (let i = ltks.length - 1; 0 < i; --i) {
        for (let i = 0; i < line_tks.length - 1; ++i) {
            let tk = line_tks[i];
            switch (tk.type) {

                case Symbols.MINUS_SIGN: {
                    // special handling on `-` signs could be unary operation 
                    // in which case there is no trailing space.

                    let p = line_tks[i - 1];
                    let n = line_tks[i + 1];
                    let nn = n.type === LxToken.TK_WHITESPACE ? line_tks[i + 2] : n;

                    if (p.type !== LxToken.TK_WHITESPACE) {
                        if (!Symbols[p.type]) {
                            edits.push(insertSpace(tk.range));
                        }
                    } else {
                        if (n.range.end - n.range.begin > 1) {
                            if (!Symbols[line_tks[i - 2].type]) {
                                edits.push(vscode.TextEdit.delete(range1(p.range)));
                            }
                        }
                        p = line_tks[i - 2];
                    }

                    let is_not_unary1 = EboKeyWords[p.type];  // for system variables and functions. 
                    let is_not_unary2 = LxToken.TK_NUMBER === p.type || LxToken.TK_IDENT === p.type;
                    let is_not_unary3 = Symbols.PARENTHESES_CL === p.type || Symbols.BRACKET_CL === p.type;
                    let is_unary = !(is_not_unary1 || is_not_unary2 || is_not_unary3) && Symbols[p.type];

                    if (is_unary && (nn.type !== Symbols.PARENTHESES_OP)) {
                        if (n.type === LxToken.TK_WHITESPACE) {
                            edits.push(vscode.TextEdit.delete(toRange(n.range)));
                        }
                    } else if (n.type !== LxToken.TK_WHITESPACE) {
                        edits.push(insertSpace(n.range));
                    } else if (n.range.end - n.range.begin > 1) {
                        edits.push(vscode.TextEdit.delete(range1(n.range)));
                    }
                    break;
                }

                case Symbols.GREATER_THAN_EQUALS: //   '>='
                case Symbols.LESS_THAN_EQUALS:    //   '<='
                case Symbols.NOT_EQUAL:           //   '<>'
                case Symbols.ANGLE_LEFT:          //   '<'
                case Symbols.ANGLE_RIGHT:         //   '>'
                case Symbols.ASTERISK:             //   '*'
                case Symbols.CARET:               //   '^'
                case Symbols.EQUALS_SIGN:         //   '='
                case Symbols.GREATER_THAN:        //   '>'
                case Symbols.LESS_THAN:           //   '<'
                case Symbols.PLUS_SIGN:           //   '+'
                case Symbols.SLASH:               //   '/'
                    {
                        // single space padding surrounding operator symbols
                        let p = line_tks[i - 1];
                        let n = line_tks[i + 1];
                        if (p.type !== LxToken.TK_WHITESPACE) {
                            edits.push(insertSpace(tk.range));
                        } else if (range_size(p.range) > 1) {
                            edits.push(vscode.TextEdit.delete(range1(p.range)));
                        }
                        if (n.type !== LxToken.TK_WHITESPACE) {
                            edits.push(insertSpace(n.range));
                        } else if (range_size(n.range) > 1) {
                            edits.push(vscode.TextEdit.delete(range1(n.range)));
                        }
                        break;
                    }
                case Symbols.COMMA: {
                    //   ','
                    let p = line_tks[i - 1];
                    if (p.type === LxToken.TK_WHITESPACE && range_size(p.range) > 0) {
                        edits.push(vscode.TextEdit.delete(toRange(p.range)));
                    }
                    let n = line_tks[i + 1];
                    if (n.type !== LxToken.TK_WHITESPACE) {
                        edits.push(insertSpace(n.range));
                    } else if (range_size(n.range) > 1) {
                        edits.push(vscode.TextEdit.delete(range1(n.range)));
                    }
                    break;
                }
                case Symbols.PARENTHESES_OP: {
                    // remove spaces after opening parens
                    let n = line_tks[i + 1];
                    if (n.type === LxToken.TK_WHITESPACE) {
                        edits.push(vscode.TextEdit.delete(toRange(n.range)));
                    }
                    break;
                }
                case Symbols.PARENTHESES_CL: {
                    //  remove spaces before closing parens
                    let p = line_tks[i - 1];
                    if (p.type === LxToken.TK_WHITESPACE) {
                        edits.push(vscode.TextEdit.delete(toRange(p.range)));
                    }
                    break;
                }
                default:
                    break;
            }
            if (Symbols[tk.type]) {
            }
        }
    }
    return edits;
}

