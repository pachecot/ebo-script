import * as vscode from 'vscode';
import { ebo_scan_text, LexToken, TextRange } from './ebo-scanner';
import { TokenKind, isFunctionKind, isOperatorKind, isVariableKind, isValueKind, isSymbolKind } from './ebo-types';

const size = 2;

function test_if_then_open(line: LexToken[]) {

    let s = 0;
    if (line[0].type === TokenKind.WhitespaceToken) { ++s; }
    if (line[s].type !== TokenKind.IfStatement) {
        return false;
    }
    let i = line.length - 1;
    while (i > 0) {
        let ty = line[--i].type;
        if (ty === TokenKind.ThenStatement) {
            return true;
        }
        if (!(ty === TokenKind.WhitespaceToken || ty === TokenKind.CommentToken)) {
            break;
        }
    }
    return false;
}

function test_is_line(line: LexToken[]) {

    if (line.length > 2) {
        let tk = line[0];
        switch (tk.type) {
            case TokenKind.IdentifierToken:
                if (line[1].type === TokenKind.ColonSymbol) {
                    return tk;
                }
                break;
            case TokenKind.LineStatement:
                tk = line[1];
                if (tk.type === TokenKind.IdentifierToken || tk.type === TokenKind.NumberToken) {
                    return tk;
                }
                break;
        }
    }
    return undefined;
}

const close_tags: TokenKind[] = [
    TokenKind.ElseStatement
    , TokenKind.CaseStatement
    , TokenKind.EndIfStatement
    , TokenKind.EndSelectStatement
    , TokenKind.EndWhenStatement
    , TokenKind.EndWhileStatement
    , TokenKind.UntilStatement
    , TokenKind.NextStatement
];

const open_tags: TokenKind[] = [
    TokenKind.ElseStatement
    , TokenKind.CaseStatement
    , TokenKind.ForStatement
    , TokenKind.RepeatStatement
    , TokenKind.SelectStatement
    , TokenKind.WhenStatement
    , TokenKind.WhileStatement
];


/**
 * get the start position
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
    let line_continue = false;

    let tokensByLine = tokens.reduce((ar, tk) => {
        ar[ar.length - 1].push(tk);
        if (tk.type === TokenKind.EndOfLineToken || tk.type === TokenKind.ContinueLineToken) {
            ar.push([]);
        }
        return ar;
    }, [[]] as LexToken[][]);

    if (tokensByLine[tokensByLine.length - 1].length === 0) {
        tokensByLine.pop();
    }

    for (let line_tks of tokensByLine) {

        if (line_tks.length === 1) {
            // trim trailing whitespace at EOF if no EOF token
            if (line_tks[0].type === TokenKind.WhitespaceToken && line_tks[0].value.length > 0) {
                edits.push(vscode.TextEdit.delete(toRange(line_tks[0].range)));
            }
            /* EOL */
            continue;
        }

        const last_id = line_tks.length - 1;
        const lastTk = line_tks[last_id].type === TokenKind.EndOfLineToken ? line_tks[last_id - 1] : line_tks[last_id];

        // trim trailing spaces

        if (lastTk.type === TokenKind.WhitespaceToken) {
            edits.push(vscode.TextEdit.delete(toRange(lastTk.range)));
        } else if (lastTk.type === TokenKind.CommentToken) {
            const we = reTrailingSpaces.exec(lastTk.value);
            if (we) {
                edits.push(vscode.TextEdit.delete(range_back(lastTk.range.begin + we.index, lastTk.range)));
            }
        }

        // do indentations

        const ws = line_tks[0].type === TokenKind.WhitespaceToken ? line_tks[0] : undefined;
        const first = ws ? line_tks[1] : line_tks[0];

        if (close_tags.includes(first.type)) {
            depth -= size;
        }

        if (first.type === TokenKind.EndOfLineToken && ws && range_size(ws.range)) {
            /// needed??
        }

        if (test_is_line(line_tks)) {
            // reset on starting new line
            depth = size;
        } else {
            const x_depth = line_continue ? depth + size * 2 : depth;
            const cnt = x_depth - first.range.begin;
            if (line_tks.length > 2 && x_depth && ws && /\t/.test(ws.value)) { // remove tabs 
                edits.push(vscode.TextEdit.replace(toRange(ws.range), ' '.repeat(Math.abs(x_depth))));
            } else {
                if (cnt > 0) {
                    edits.push(vscode.TextEdit.insert(pos_start(first.range), ' '.repeat(cnt)));
                } else if (line_tks.length > 2 && cnt < 0 && ws) {
                    edits.push(vscode.TextEdit.delete(range_back(ws.range.begin + x_depth, ws.range)));
                }
            }
        }

        if (open_tags.includes(first.type) || test_if_then_open(line_tks)) {
            depth += size;
        }

        // formatting for operators

        for (let i = 0; i < line_tks.length - 1; ++i) {
            const tk = line_tks[i];

            switch (tk.type) {

                case TokenKind.ToKeyWord:
                case TokenKind.ElseStatement:
                case TokenKind.ThenStatement:
                    {
                        const p = line_tks[i - 1];
                        if (i > 1 && p && p.type === TokenKind.WhitespaceToken) {
                            if (p.range.end - p.range.begin > 1) {
                                edits.push(vscode.TextEdit.delete(range1(p.range)));
                                p.range.end = p.range.begin + 1;
                            }
                        }
                        const n = line_tks[i + 1];
                        if (n && n.type === TokenKind.WhitespaceToken) {
                            if (n.range.end - n.range.begin > 1) {
                                edits.push(vscode.TextEdit.delete(range1(n.range)));
                                n.range.end = n.range.begin + 1;
                            }
                        }
                        i += 1;
                        break;
                    }

                case TokenKind.ModulateAction:
                case TokenKind.SetAction:
                case TokenKind.ShutAction:
                case TokenKind.TurnAction:
                case TokenKind.OpenAction:
                case TokenKind.ForStatement:
                case TokenKind.WhileStatement:
                case TokenKind.NextStatement:
                case TokenKind.UntilStatement:
                case TokenKind.StepStatement:
                case TokenKind.IfStatement:
                case TokenKind.GotoStatement:
                    {
                        const n = line_tks[i + 1];
                        if (n && n.type === TokenKind.WhitespaceToken) {
                            if (n.range.end - n.range.begin > 1) {
                                edits.push(vscode.TextEdit.delete(range1(n.range)));
                                n.range.end = n.range.begin + 1;
                            }
                        }
                        i += 1;

                        break;
                    }

                case TokenKind.DatetimeDeclaration:
                case TokenKind.FunctionDeclaration:
                case TokenKind.InputDeclaration:
                case TokenKind.NumericDeclaration:
                case TokenKind.OutputDeclaration:
                case TokenKind.PublicDeclaration:
                case TokenKind.StringDeclaration:
                    {
                        const n = line_tks[i + 1];
                        if (n && n.type === TokenKind.WhitespaceToken) {
                            if (n.range.end - n.range.begin > 1) {
                                edits.push(vscode.TextEdit.delete(range1(n.range)));
                                n.range.end = n.range.begin + 1;
                            }
                        }
                        i += 1;

                        break;
                    }

                case TokenKind.MinusSymbol: {
                    // special handling on `-` signs could be unary operation 
                    // in which case there is no trailing space.

                    let p = line_tks[i - 1];

                    if (p.type !== TokenKind.WhitespaceToken) {
                        if (!isSymbolKind(p.type)) {
                            edits.push(insertSpace(tk.range));
                        }
                    } else {
                        if (p.range.end - p.range.begin > 1) {
                            const prev_tk = line_tks[i - 2].type;
                            if (!isSymbolKind(prev_tk) || prev_tk === TokenKind.BracketRightSymbol) {
                                edits.push(vscode.TextEdit.delete(range1(p.range)));
                            }
                        }
                        p = line_tks[i - 2];
                    }

                    // for system variables and functions. 
                    const is_not_unary1 = isFunctionKind(p.type)
                        || isValueKind(p.type)
                        || isVariableKind(p.type)
                        || isOperatorKind(p.type);
                    const is_not_unary2 = TokenKind.NumberToken === p.type || TokenKind.IdentifierToken === p.type;
                    const is_not_unary3 = TokenKind.ParenthesesRightSymbol === p.type || TokenKind.BracketRightSymbol === p.type;
                    const is_unary = !(is_not_unary1 || is_not_unary2 || is_not_unary3) && isSymbolKind(p.type);

                    const n = line_tks[i + 1];
                    const nn = n.type === TokenKind.WhitespaceToken ? line_tks[i + 2] : n;

                    if (is_unary && (nn.type !== TokenKind.ParenthesesLeftSymbol)) {
                        if (n.type === TokenKind.WhitespaceToken) {
                            edits.push(vscode.TextEdit.delete(toRange(n.range)));
                        }
                    } else if (n.type !== TokenKind.WhitespaceToken) {
                        edits.push(insertSpace(n.range));
                    } else if (n.range.end - n.range.begin > 1) {
                        edits.push(vscode.TextEdit.delete(range1(n.range)));
                    }
                    break;
                }



                case TokenKind.AboveOperator:
                case TokenKind.AndOperator:
                case TokenKind.BelowOperator:
                case TokenKind.BetweenOperator:
                case TokenKind.BitandOperator:
                case TokenKind.BitnotOperator:
                case TokenKind.BitorOperator:
                case TokenKind.BitxorOperator:
                case TokenKind.DivideOperator:
                case TokenKind.DoesOperator:
                case TokenKind.EitherOperator:
                case TokenKind.EqualOperator:
                case TokenKind.EqualsOperator:
                case TokenKind.FirstOperator:
                case TokenKind.GreaterOperator:
                case TokenKind.InOperator:
                case TokenKind.IsOperator:
                case TokenKind.LastOperator:
                case TokenKind.LessOperator:
                case TokenKind.MinusOperator:
                case TokenKind.ModulusOperator:
                case TokenKind.NeitherOperator:
                case TokenKind.NotOperator:
                case TokenKind.OrOperator:
                case TokenKind.PlusOperator:
                case TokenKind.ThanOperator:
                case TokenKind.TheOperator:
                case TokenKind.ThruOperator:
                case TokenKind.TimesOperator:

                case TokenKind.OffValue:
                case TokenKind.OnValue:
                case TokenKind.OpenedValue:
                case TokenKind.ClosedValue:
                    {
                        const p = line_tks[i - 1];
                        if (p.type === TokenKind.WhitespaceToken && range_size(p.range) > 1) {
                            edits.push(vscode.TextEdit.delete(range1(p.range)));
                            p.range.end = p.range.begin + 1;
                        }
                        const n = line_tks[i + 1];
                        if (n.type === TokenKind.WhitespaceToken && range_size(n.range) > 1) {
                            edits.push(vscode.TextEdit.delete(range1(n.range)));
                            n.range.end = n.range.begin + 1;
                        }
                        break;
                    }

                case TokenKind.ContinueLineToken:  //  '~'
                    {
                        const p = line_tks[i - 1];
                        if (p.type === TokenKind.WhitespaceToken) {
                            if (range_size(p.range) > 1) {
                                edits.push(vscode.TextEdit.delete(range1(p.range)));
                                p.range.end = p.range.begin + 1;
                            }
                        } else {
                            edits.push(insertSpace(p.range));
                        }
                        break;
                    }

                case TokenKind.GreaterThanEqualSymbol:  //  '>='
                case TokenKind.LessThanEqualSymbol:     //  '<='
                case TokenKind.NotEqualSymbol:          //  '<>'
                case TokenKind.AngleLeftSymbol:         //  '<'
                case TokenKind.AngleRightSymbol:        //  '>'
                case TokenKind.AsteriskSymbol:          //  '*'
                case TokenKind.CaretSymbol:             //  '^'
                case TokenKind.EqualsSymbol:            //  '='
                case TokenKind.GreaterThanSymbol:       //  '>'
                case TokenKind.LessThanSymbol:          //  '<'
                case TokenKind.PlusSymbol:              //  '+'
                case TokenKind.SlashSymbol:             //  '/'
                    {
                        // single space padding surrounding operator symbols
                        const p = line_tks[i - 1];
                        const n = line_tks[i + 1];
                        if (p.type !== TokenKind.WhitespaceToken) {
                            edits.push(insertSpace(tk.range));
                        } else if (range_size(p.range) > 1) {
                            edits.push(vscode.TextEdit.delete(range1(p.range)));
                            p.range.end = p.range.begin + 1;
                        }
                        if (n.type !== TokenKind.WhitespaceToken) {
                            edits.push(insertSpace(n.range));
                        } else if (range_size(n.range) > 1) {
                            edits.push(vscode.TextEdit.delete(range1(n.range)));
                            n.range.end = n.range.begin + 1;
                        }
                        break;
                    }

                case TokenKind.CommaSymbol: { //   ','
                    const p = line_tks[i - 1];
                    if (i > 1 && p && p.type === TokenKind.WhitespaceToken && range_size(p.range) > 0) {
                        edits.push(vscode.TextEdit.delete(toRange(p.range)));
                    }
                    const n = line_tks[i + 1];
                    if (n.type !== TokenKind.WhitespaceToken) {
                        edits.push(insertSpace(n.range));
                    } else if (range_size(n.range) > 1) {
                        edits.push(vscode.TextEdit.delete(range1(n.range)));
                        n.range.end = n.range.begin + 1;
                    }
                    break;
                }

                case TokenKind.ParenthesesLeftSymbol: {
                    // remove spaces after opening parens
                    const n = line_tks[i + 1];
                    if (n.type === TokenKind.WhitespaceToken) {
                        edits.push(vscode.TextEdit.delete(toRange(n.range)));
                    }
                    break;
                }
                case TokenKind.ParenthesesRightSymbol: {
                    //  remove spaces before closing parens
                    const p = line_tks[i - 1];
                    if (p.type === TokenKind.WhitespaceToken) {
                        edits.push(vscode.TextEdit.delete(toRange(p.range)));
                    }
                    break;
                }
                default:
                    break;
            }


            if (isSymbolKind(tk.type)) {
            }
        }

        line_continue = lastTk.type === TokenKind.ContinueLineToken;
    }
    return edits;
}

