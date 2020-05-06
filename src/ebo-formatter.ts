import * as vscode from 'vscode';
import { ebo_scan_text, LexToken, TextPosition } from './ebo-scanner';
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

const close_tags = [
    EboKeyWords.ELSE
    , EboKeyWords.CASE
    , EboKeyWords.ENDIF
    , EboKeyWords.ENDSELECT
    , EboKeyWords.ENDWHEN
    , EboKeyWords.ENDWHILE
    , EboKeyWords.UNTIL
    , EboKeyWords.NEXT
];

const open_tags = [
    EboKeyWords.ELSE
    , EboKeyWords.CASE
    , EboKeyWords.FOR
    , EboKeyWords.REPEAT
    , EboKeyWords.SELECT
    , EboKeyWords.WHEN
    , EboKeyWords.WHILE
];


function begin(pos: TextPosition) {
    return new vscode.Position(pos.line, pos.index);
}

function end(pos: TextPosition) {
    return new vscode.Position(pos.line, pos.index + pos.size);
}

function range1(pos: TextPosition) {
    return new vscode.Range(begin(pos),
        new vscode.Position(pos.line, pos.index + pos.size - 1)
    );
}
function insertSpace(pos: TextPosition) {
    return vscode.TextEdit.insert(begin(pos), ' ');
}

function toRange(pos: TextPosition) {
    return new vscode.Range(begin(pos), end(pos));
}


export function getReformatEdits(document: vscode.TextDocument): vscode.TextEdit[] {

    let tokens = ebo_scan_text(document.getText());
    let edits: vscode.TextEdit[] = [];
    let depth = 0;

    for (let ltks of tokens) {
        if (ltks.length === 1) { continue; }

        let lastTk = ltks[ltks.length - 2];

        // trim trailing spaces

        if (lastTk.type === LxToken.TK_WHITESPACE) {
            edits.push(vscode.TextEdit.delete(toRange(lastTk.pos)));
        } else if (lastTk.type === LxToken.TK_COMMENT) {
            let we = lastTk.value.match(/\s+$/);
            if (we) {
                let end = lastTk.pos.index + lastTk.pos.size;
                let index = end - we[0].length;
                edits.push(vscode.TextEdit.delete(
                    new vscode.Range(
                        new vscode.Position(lastTk.pos.line, index),
                        new vscode.Position(lastTk.pos.line, end)
                    )));
            }
        }

        // do indentations

        let ws = ltks[0].type === LxToken.TK_WHITESPACE ? ltks[0] : undefined;
        let first = ws ? ltks[1] : ltks[0];

        if (close_tags.includes(first.type as any)) {
            depth -= size;
        }
        if (first.type === LxToken.TK_EOL && ws && ws.pos.size) {
            /// needed??
        }

        if (test_line(ltks)) {
            depth = size;
        } else {
            let cnt = depth - first.pos.index;
            if (cnt > 0) {
                edits.push(vscode.TextEdit.insert(begin(first.pos), ' '.repeat(cnt)));
            } else if (cnt < 0 && ws && ltks.length > 2) {
                edits.push(vscode.TextEdit.delete(toRange(ws.pos)));
            }
        }
        if (open_tags.includes(first.type as any) || test_if_then_open(ltks)) {
            depth += size;
        }

        // formatting for operators

        // for (let i = ltks.length - 1; 0 < i; --i) {
        for (let i = 0; i < ltks.length - 1; ++i) {
            let tk = ltks[i];
            switch (tk.type) {

                case Symbols.MINUS_SIGN:          //   '-'
                    {
                        let p = ltks[i - 1];
                        let n = ltks[i + 1];
                        let nn = n.type === LxToken.TK_WHITESPACE ? ltks[i + 2] : n;

                        if (p.type !== LxToken.TK_WHITESPACE) {
                            if (!Symbols[p.type]) {
                                edits.push(insertSpace(tk.pos));
                            }
                        } else {
                            if (p.pos.size > 1) {
                                if (!Symbols[ltks[i - 2].type]) {
                                    edits.push(vscode.TextEdit.delete(range1(p.pos)));
                                }
                            }
                            p = ltks[i - 2];
                        }

                        ///  e1 - e2
                        /// 


                        let is_unary1 = Symbols[p.type] && (![Symbols.PARENTHESES_CL, Symbols.BRACKET_CL].includes(p.type as any));
                        let is_not_unary1 = EboKeyWords[p.type];
                        let is_not_unary2 = [LxToken.TK_NUMBER, LxToken.TK_IDENT].includes(p.type as any);
                        let is_unary =!(is_not_unary1 ||  is_not_unary2) && is_unary1;


                        if (is_unary && (nn.type !== Symbols.PARENTHESES_OP)) {
                            if (n.type === LxToken.TK_WHITESPACE) {
                                edits.push(vscode.TextEdit.delete(toRange(n.pos)));
                            }
                        } else if (n.type !== LxToken.TK_WHITESPACE) {
                            edits.push(insertSpace(n.pos));
                        } else if (n.pos.size > 1) {
                            edits.push(vscode.TextEdit.delete(range1(n.pos)));
                        }
                        break;
                    }

                case Symbols.GREATER_THAN_EQUALS: //   '>='
                case Symbols.LESS_THAN_EQUALS:    //   '<='
                case Symbols.NOT_EQUAL:           //   '<>'
                case Symbols.ANGLE_LEFT:          //   '<'
                case Symbols.ANGLE_RIGHT:         //   '>'
                case Symbols.APOSTROPHE:          //   '''
                case Symbols.ASTRISK:             //   '*'
                case Symbols.CARET:               //   '^'
                case Symbols.EQUALS_SIGN:         //   '='
                case Symbols.GREATER_THAN:        //   '>'
                case Symbols.LESS_THAN:           //   '<'
                case Symbols.PLUS_SIGN:           //   '+'
                case Symbols.SLASH:               //   '/'
                    {
                        let p = ltks[i - 1];
                        if (p.type !== LxToken.TK_WHITESPACE) {
                            edits.push(insertSpace(tk.pos));
                        } else if (p.pos.size > 1) {
                            edits.push(vscode.TextEdit.delete(range1(p.pos)));
                        }
                        let n = ltks[i + 1];
                        if (n.type !== LxToken.TK_WHITESPACE) {
                            edits.push(insertSpace(n.pos));
                        } else if (n.pos.size > 1) {
                            edits.push(vscode.TextEdit.delete(range1(n.pos)));
                        }
                        break;
                    }
                case Symbols.COMMA:               //   ','
                    {
                        let p = ltks[i - 1];
                        if (p.type === LxToken.TK_WHITESPACE && p.pos.size > 0) {
                            edits.push(vscode.TextEdit.delete(toRange(p.pos)));
                        }
                        let n = ltks[i + 1];
                        if (n.type !== LxToken.TK_WHITESPACE) {
                            edits.push(insertSpace(n.pos));
                        } else if (n.pos.size > 1) {
                            edits.push(vscode.TextEdit.delete(range1(n.pos)));
                        }
                        break;
                    }
                case Symbols.PARENTHESES_OP:      //   '('
                    {
                        let n = ltks[i + 1];
                        if (n.type === LxToken.TK_WHITESPACE) {
                            edits.push(vscode.TextEdit.delete(toRange(n.pos)));
                        }
                        break;
                    }
                case Symbols.PARENTHESES_CL:      //   ')'
                    {
                        let p = ltks[i - 1];
                        if (p.type === LxToken.TK_WHITESPACE) {
                            edits.push(vscode.TextEdit.delete(toRange(p.pos)));
                        }
                        break;
                    }

                // case Symbols.AMPERSAND:           //   '&'
                // case Symbols.BACKSLASH:           //   '\'
                // case Symbols.BRACKET_CL:          //   ']'
                // case Symbols.BRACKET_OP:          //   '['
                // case Symbols.COLON:               //   ':'
                // case Symbols.DOUBLE_QUOTE:        //   '"'
                // case Symbols.EXCLAMATION:         //   '!'
                // case Symbols.PERCENT:             //   '%'
                // case Symbols.SEMICOLON:           //   ';'
                // case Symbols.TILDE:               //   '~'


                default:
                    break;
            }
            if (Symbols[tk.type]) {

            }
        }




    }
    return edits;
}

