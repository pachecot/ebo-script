import * as vscode from 'vscode';
import { ebo_scan_text, LexToken, TextRange } from './ebo-scanner';
import { TokenKind, isFunctionKind, isOperatorKind, isVariableKind, isValueKind, isSymbolKind } from './ebo-types';
import { detect_assign_line, compute_lhs_end, is_eof_skip_line, is_line_label } from './ebo-formatter-utils';

export { detect_assign_line, compute_lhs_end, is_eof_skip_line };

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
    return is_line_label(line) ? line[0] : undefined;
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
function range12(rng: TextRange) {
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
 * create a space insert before the range  
 */
function singleSpace(rng: TextRange) {
    return vscode.TextEdit.replace(toRange(rng), ' ');
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

/**
 * Generate alignment edits for consecutive assignment blocks.
 * Groups runs of consecutive assignment lines (same adjusted indent, no
 * blank line between them) and emits edits that pad the whitespace before
 * each '=' so all signs in the block land on the same column.
 */
function get_alignment_edits(
    tokensByLine: LexToken[][],
    assign_eq_map: Map<number, number>,
    indent_delta: Map<number, number>
): vscode.TextEdit[] {
    const edits: vscode.TextEdit[] = [];
    let i = 0;

    while (i < tokensByLine.length) {
        if (!assign_eq_map.has(i)) {
            i++;
            continue;
        }

        const start_tks = tokensByLine[i];
        const start_first = start_tks[0].type === TokenKind.WhitespaceToken ? start_tks[1] : start_tks[0];
        const start_indent = start_first.range.begin + (indent_delta.get(i) ?? 0);

        type BlockEntry = { line_tks: LexToken[]; eq_idx: number; adj_lhs_end: number; };
        const block: BlockEntry[] = [];
        let j = i;

        while (j < tokensByLine.length) {
            const ei = assign_eq_map.get(j);
            if (ei === undefined) { break; }

            const ltks = tokensByLine[j];
            const ws = ltks[0].type === TokenKind.WhitespaceToken;
            const ft = ws ? ltks[1] : ltks[0];
            const adj_indent = ft.range.begin + (indent_delta.get(j) ?? 0);
            if (block.length > 0 && adj_indent !== start_indent) { break; }

            block.push({
                line_tks: ltks,
                eq_idx: ei,
                adj_lhs_end: compute_lhs_end(ltks, ei) + (indent_delta.get(j) ?? 0),
            });
            j++;
        }

        if (block.length >= 1) {
            const target_col = Math.max(...block.map(b => b.adj_lhs_end)) + 1;

            for (const { line_tks: ltks, eq_idx: ei, adj_lhs_end } of block) {
                const eq_tk = ltks[ei];
                const spaces_needed = target_col - adj_lhs_end;
                const prev_tk = ltks[ei - 1];

                if (prev_tk && prev_tk.type === TokenKind.WhitespaceToken) {
                    const current_spaces = prev_tk.range.end - prev_tk.range.begin;
                    if (current_spaces !== spaces_needed) {
                        edits.push(vscode.TextEdit.replace(toRange(prev_tk.range), ' '.repeat(spaces_needed)));
                    }
                } else {
                    edits.push(vscode.TextEdit.insert(pos_start(eq_tk.range), ' '.repeat(spaces_needed)));
                }
            }
        }

        i = j > i ? j : i + 1;
    }

    return edits;
}

export function getReformatEdits(document: vscode.TextDocument): vscode.TextEdit[] {

    const alignAssignments = vscode.workspace.getConfiguration('ebo-script').get<boolean>('alignAssignments', true);
    let tokens = ebo_scan_text(document.getText());
    const assign_eq_map = new Map<number, number>();
    const indent_delta = new Map<number, number>();
    let edits: vscode.TextEdit[] = [];
    let depth = 0;
    let line_continue = false;
    let line_idx = 0;

    const editor = vscode.window.activeTextEditor;
    const tabSize = Number(editor?.options.tabSize || 2);


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

        if (alignAssignments && !line_continue && line_tks.length > 1) {
            const eq_i = detect_assign_line(line_tks);
            if (eq_i !== undefined) {
                assign_eq_map.set(line_idx, eq_i);
            }
        }

        if (is_eof_skip_line(line_tks)) {
            // blank line (EOL only) or trailing whitespace at EOF with no newline
            if (line_tks[0].type === TokenKind.WhitespaceToken && line_tks[0].value.length > 0) {
                edits.push(vscode.TextEdit.delete(toRange(line_tks[0].range)));
            }
            line_idx++;
            continue;
        }

        const last_id = line_tks.length - 1;
        const lastTk = line_tks[last_id].type === TokenKind.EndOfLineToken ? line_tks[last_id - 1] : line_tks[last_id];

        // trim trailing spaces

        if (lastTk.type === TokenKind.WhitespaceToken) {
            edits.push(vscode.TextEdit.delete(toRange(lastTk.range)));
            lastTk.range.end = lastTk.range.begin;
        } else if (lastTk.type === TokenKind.CommentToken) {
            const we = reTrailingSpaces.exec(lastTk.value);
            if (we) {
                edits.push(vscode.TextEdit.delete(range_back(lastTk.range.begin + we.index, lastTk.range)));
                lastTk.range.end = lastTk.range.begin + we.index;
            }
        }

        // do indentations

        const ws = line_tks[0].type === TokenKind.WhitespaceToken ? line_tks[0] : undefined;
        const first = ws ? line_tks[1] : line_tks[0];

        if (close_tags.includes(first.type)) {
            depth -= tabSize;
        }

        if (first.type === TokenKind.EndOfLineToken && ws && range_size(ws.range)) {
            /// needed??
        }

        if (test_is_line(line_tks)) {
            // reset on starting new line
            depth = tabSize;
        } else {
            const x_depth = line_continue ? depth + tabSize * 2 : depth;
            const cnt = x_depth - first.range.begin;
            indent_delta.set(line_idx, cnt);
            if (line_tks.length > 2 && x_depth && ws && /\t/.test(ws.value)) { // remove tabs
                edits.push(vscode.TextEdit.replace(toRange(ws.range), ' '.repeat(Math.abs(x_depth))));
            } else {
                if (cnt > 0) {
                    edits.push(vscode.TextEdit.insert(pos_start(first.range), ' '.repeat(cnt)));
                } else if (line_tks.length > 2 && cnt < 0 && ws) {
                    edits.push(vscode.TextEdit.delete(range_back(ws.range.begin + x_depth, ws.range)));
                    ws.range.end = ws.range.begin + x_depth;
                }
            }
        }

        if (open_tags.includes(first.type) || test_if_then_open(line_tks)) {
            depth += tabSize;
        }

        // formatting for operators

        for (let i = 0; i < line_tks.length - 1; ++i) {
            const tk = line_tks[i];

            switch (tk.type) {
                case TokenKind.EndOfLineToken:
                    if (tk.value !== '\n') {
                        edits.push(vscode.TextEdit.replace(toRange(tk.range), '\n'));
                    }
                    break;
                case TokenKind.ToKeyWord:
                case TokenKind.ElseStatement:
                case TokenKind.ThenStatement:
                    {
                        const p = line_tks[i - 1];
                        if (i > 1 && p && p.type === TokenKind.WhitespaceToken) {
                            if (range_size(p.range) > 1 || p.value === '\t') {
                                edits.push(singleSpace(p.range));
                                p.range.end = p.range.begin + 1;
                            }
                        }
                        const n = line_tks[i + 1];
                        if (n && n.type === TokenKind.WhitespaceToken) {
                            if (line_tks[i + 2] && line_tks[i + 2].type === TokenKind.EndOfLineToken) {
                                if (n.range.end - n.range.begin > 1) {
                                    edits.push(vscode.TextEdit.delete(toRange(n.range)));
                                    n.range.end = n.range.begin;
                                }
                            } else if (line_tks[i + 2]?.type !== TokenKind.CommentToken) {
                                if (range_size(n.range) > 1 || n.value === '\t') {
                                    edits.push(singleSpace(n.range));
                                    n.range.end = n.range.begin + 1;
                                }
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
                case TokenKind.BasedonStatement:
                case TokenKind.GotoStatement:
                    {
                        const n = line_tks[i + 1];
                        if (n && n.type === TokenKind.WhitespaceToken) {
                            if (range_size(n.range) || n.value === '\t') {
                                edits.push(singleSpace(n.range));
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
                case TokenKind.DatafileDeclaration:
                case TokenKind.TrendlogDeclaration:
                case TokenKind.StringDeclaration:
                    {
                        const n = line_tks[i + 1];
                        if (n && n.type === TokenKind.WhitespaceToken) {
                            if (range_size(n.range) > 1 || n.value === '\t') {
                                edits.push(singleSpace(n.range));
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
                        if (range_size(p.range) > 1 || p.value === '\t') {
                            const prev_tk = line_tks[i - 2].type;
                            if (!isSymbolKind(prev_tk) || prev_tk === TokenKind.BracketRightSymbol) {
                                edits.push(singleSpace(p.range));
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
                    const is_unary = (!(is_not_unary1 || is_not_unary2 || is_not_unary3) && isSymbolKind(p.type))
                        || (TokenKind.InOperator === p.type
                            || TokenKind.BetweenOperator === p.type
                            || TokenKind.IsOperator === p.type
                            || TokenKind.ToKeyWord === p.type
                            || TokenKind.StepStatement === p.type
                            || TokenKind.WhileStatement === p.type
                            || TokenKind.UntilStatement === p.type
                            || TokenKind.WaitStatement === p.type
                            || TokenKind.IfStatement === p.type
                            || TokenKind.CaseStatement === p.type
                            // || TokenKind.ThenStatement === p.type
                            || TokenKind.NotOperator === p.type
                        );

                    const n = line_tks[i + 1];
                    const nn = n.type === TokenKind.WhitespaceToken ? line_tks[i + 2] : n;

                    if (is_unary && (nn.type !== TokenKind.ParenthesesLeftSymbol)) {
                        if (n.type === TokenKind.WhitespaceToken) {
                            edits.push(vscode.TextEdit.delete(toRange(n.range)));
                        }
                    } else if (n.type !== TokenKind.WhitespaceToken) {
                        edits.push(insertSpace(n.range));
                    } else if (range_size(n.range) > 1 || n.value === '\t') {
                        edits.push(singleSpace(n.range));
                    }
                    break;
                }

                case TokenKind.EqualOperator:
                case TokenKind.EqualsOperator:
                    {
                        const p = line_tks[i - 1];
                        if (p.type === TokenKind.WhitespaceToken && (range_size(p.range) > 1 || p.value === '\t')) {
                            edits.push(singleSpace(p.range));
                            p.range.end = p.range.begin + 1;
                        }

                        const n = line_tks[i + 1];
                        if (n.type === TokenKind.WhitespaceToken && (range_size(n.range) > 1 || n.value === '\t')) {
                            edits.push(singleSpace(n.range));
                            n.range.end = n.range.begin + 1;
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
                        if (p.type === TokenKind.WhitespaceToken && (range_size(p.range) > 1 || p.value === '\t')) {
                            edits.push(singleSpace(p.range));
                            p.range.end = p.range.begin + 1;
                        }
                        const n = line_tks[i + 1];
                        if (n.type === TokenKind.WhitespaceToken && (range_size(n.range) > 1 || n.value === '\t')) {
                            edits.push(singleSpace(n.range));
                            n.range.end = n.range.begin + 1;
                        }
                        break;
                    }

                case TokenKind.ContinueLineToken:  //  '~'
                    {
                        const p = line_tks[i - 1];
                        if (p.type === TokenKind.WhitespaceToken) {
                            if (range_size(p.range) > 1 || p.value === '\t') {
                                edits.push(singleSpace(p.range));
                                p.range.end = p.range.begin + 1;
                            }
                        } else {
                            edits.push(insertSpace(p.range));
                        }
                        break;
                    }

                case TokenKind.EqualsSymbol: {  //  '='
                    const p = line_tks[i - 1];
                    const n = line_tks[i + 1];
                    // Skip before-space normalization for alignment '=' — second pass handles it
                    if (!assign_eq_map.has(line_idx) || assign_eq_map.get(line_idx) !== i) {
                        if (p.type !== TokenKind.WhitespaceToken) {
                            edits.push(insertSpace(tk.range));
                        } else if (range_size(p.range) > 1 || p.value === '\t') {
                            edits.push(singleSpace(p.range));
                            p.range.end = p.range.begin + 1;
                        }
                    }
                    if (n.type !== TokenKind.WhitespaceToken) {
                        edits.push(insertSpace(n.range));
                    } else if (range_size(n.range) > 1 || n.value === '\t') {
                        edits.push(singleSpace(n.range));
                        n.range.end = n.range.begin + 1;
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
                case TokenKind.AngleRightSymbol:        //  '>'
                case TokenKind.AngleLeftSymbol:         //  '<'
                case TokenKind.PlusSymbol:              //  '+'
                case TokenKind.SlashSymbol:             //  '/'
                    {
                        // single space padding surrounding operator symbols
                        const p = line_tks[i - 1];
                        const n = line_tks[i + 1];
                        if (p.type !== TokenKind.WhitespaceToken) {
                            edits.push(insertSpace(tk.range));
                        } else if (range_size(p.range) > 1 || p.value === '\t') {
                            edits.push(singleSpace(p.range));
                            p.range.end = p.range.begin + 1;
                        }
                        if (n.type !== TokenKind.WhitespaceToken) {
                            edits.push(insertSpace(n.range));
                        } else if (range_size(n.range) > 1 || p.value === '\t') {
                            edits.push(singleSpace(n.range));
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
                    } else if (range_size(n.range) > 1 || n.value === '\t') {
                        edits.push(singleSpace(n.range));
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
                    const n = line_tks[i];
                    if (i >= 2 && n && n.type === TokenKind.WhitespaceToken) {
                        if (range_size(n.range) || n.value === '\t') {
                            edits.push(singleSpace(n.range));
                            n.range.end = n.range.begin + 1;
                        }
                    }
                    break;
            }


            if (isSymbolKind(tk.type)) {
            }
        }

        line_continue = lastTk.type === TokenKind.ContinueLineToken;
        line_idx++;
    }

    if (alignAssignments) {
        edits.push(...get_alignment_edits(tokensByLine, assign_eq_map, indent_delta));
    }

    return edits;
}

