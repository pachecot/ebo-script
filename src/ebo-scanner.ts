import { TokenKind } from './ebo-types';

type TokenDictionary = { [name: string]: TokenKind };

const SymbolMap: TokenDictionary = {
    '-': TokenKind.MinusSymbol,
    ',': TokenKind.CommaSymbol,
    ';': TokenKind.SemicolonSymbol,
    '!': TokenKind.ExclamationSymbol,
    '"': TokenKind.DoubleQuoteSymbol,
    '(': TokenKind.ParenthesesLeftSymbol,
    ')': TokenKind.ParenthesesRightSymbol,
    '[': TokenKind.BracketLeftSymbol,
    ']': TokenKind.BracketRightSymbol,
    '*': TokenKind.AsteriskSymbol,
    '/': TokenKind.SlashSymbol,
    '\'': TokenKind.ApostropheSymbol,
    '\\': TokenKind.BackslashSymbol,
    '&': TokenKind.AmpersandSymbol,
    '%': TokenKind.PercentSymbol,
    '^': TokenKind.CaretSymbol,
    '+': TokenKind.PlusSymbol,
    '<': TokenKind.AngleLeftSymbol,
    '=': TokenKind.EqualsSymbol,
    '>': TokenKind.AngleRightSymbol,
    '~': TokenKind.TildeSymbol,
    ':': TokenKind.ColonSymbol,
    '<=': TokenKind.LessThanEqualSymbol,
    '<>': TokenKind.NotEqualSymbol,
    '>=': TokenKind.GreaterThanEqualSymbol,
};


const TokenMap: TokenDictionary = {

    //// VALUES

    '-ON': TokenKind.minusOnValue
    , OFF: TokenKind.offValue
    , ON: TokenKind.onValue

    , AM: TokenKind.amValue
    , PM: TokenKind.pmValue

    , JANUARY: TokenKind.JanuaryValue
    , FEBRUARY: TokenKind.FebruaryValue
    , MARCH: TokenKind.MarchValue
    , APRIL: TokenKind.AprilValue
    , MAY: TokenKind.MayValue
    , JUNE: TokenKind.JuneValue
    , JULY: TokenKind.JulyValue
    , AUGUST: TokenKind.AugustValue
    , SEPTEMBER: TokenKind.SeptemberValue
    , OCTOBER: TokenKind.OctoberValue
    , NOVEMBER: TokenKind.NovemberValue
    , DECEMBER: TokenKind.DecemberValue

    , JAN: TokenKind.JanuaryValue
    , FEB: TokenKind.FebruaryValue
    , MAR: TokenKind.MarchValue
    , APR: TokenKind.AprilValue
    //MAY :TokenKind. MAY
    , JUN: TokenKind.JuneValue
    , JUL: TokenKind.JulyValue
    , AUG: TokenKind.AugustValue
    , SEP: TokenKind.SeptemberValue
    , OCT: TokenKind.OctoberValue
    , NOV: TokenKind.NovemberValue
    , DEC: TokenKind.DecemberValue

    , SUNDAY: TokenKind.SundayValue
    , MONDAY: TokenKind.MondayValue
    , TUESDAY: TokenKind.TuesdayValue
    , WEDNESDAY: TokenKind.WednesdayValue
    , THURSDAY: TokenKind.ThursdayValue
    , FRIDAY: TokenKind.FridayValue
    , SATURDAY: TokenKind.SaturdayValue

    , SUN: TokenKind.SundayValue
    , MON: TokenKind.MondayValue
    , TUE: TokenKind.TuesdayValue
    , WED: TokenKind.WednesdayValue
    , THU: TokenKind.ThursdayValue
    , FRI: TokenKind.FridayValue
    , SAT: TokenKind.SaturdayValue

    , FALSE: TokenKind.FalseValue  // numeric = 0
    , TRUE: TokenKind.TrueValue   // numeric = 1

    , OFFLINE: TokenKind.OfflineValue
    , ONLINE: TokenKind.OnlineValue

    , SUCCESS: TokenKind.SuccessValue // 0
    , FAILURE: TokenKind.FailureValue // 1

    , DISABLED: TokenKind.DisabledValue
    , ENABLED: TokenKind.EnabledValue

    , CLOSED: TokenKind.ClosedValue
    , OPENED: TokenKind.OpenedValue

    , INACTIVE: TokenKind.InactiveValue
    , ACTIVE: TokenKind.ActiveValue
    // , AVERAGE:TokenKind.AVERAGE

    //
    , MINUTES: TokenKind.MinutesValue
    , DAYS: TokenKind.DaysValue
    , MONTHS: TokenKind.MonthsValue

    // System Variables

    , TS: TokenKind.TsVariable
    , TM: TokenKind.TmVariable
    , TH: TokenKind.ThVariable
    , TD: TokenKind.TdVariable

    , SCAN: TokenKind.ScanVariable
    , SC: TokenKind.ScanVariable
    , DATE: TokenKind.DateVariable
    , TIME: TokenKind.DateVariable
    , UTCOFFSET: TokenKind.UtcOffsetVariable

    // Timepiece
    , DAYOFMONTH: TokenKind.DayOfMonthVariable
    , DOM: TokenKind.DayOfMonthVariable
    , DAYOFYEAR: TokenKind.DayOfYearVariable
    , DOY: TokenKind.DayOfYearVariable
    , HOUR: TokenKind.HourVariable
    , HR: TokenKind.HourVariable
    , HOUROFDAY: TokenKind.hourOfDayVariable
    , HOD: TokenKind.hourOfDayVariable
    , MINUTE: TokenKind.MinuteVariable
    , MIN: TokenKind.MinuteVariable
    , MONTH: TokenKind.MonthVariable
    , MTH: TokenKind.MonthVariable
    , SECOND: TokenKind.SecondVariable
    , SEC: TokenKind.SecondVariable
    , TIMEOFDAY: TokenKind.TimeOfDayVariable
    , TOD: TokenKind.TimeOfDayVariable
    , WEEKDAY: TokenKind.WeekdayVariable
    , WKD: TokenKind.WeekdayVariable
    , YEAR: TokenKind.YearVariable
    , YR: TokenKind.YearVariable

    , ERRORS: TokenKind.ErrorsVariable
    , FREEMEM: TokenKind.FreememVariable
    , ISBOUND: TokenKind.IsBoundVariable

    // Operators

    , ABOVE: TokenKind.AboveOperator
    , AND: TokenKind.AndOperator
    , BELOW: TokenKind.BelowOperator
    , BETWEEN: TokenKind.BetweenOperator
    , BITAND: TokenKind.BitandOperator
    , BITNOT: TokenKind.BitnotOperator
    , BITOR: TokenKind.BitorOperator
    , BITXOR: TokenKind.BitxorOperator
    , DOES: TokenKind.DoesOperator
    , EITHER: TokenKind.EitherOperator
    , EQUAL: TokenKind.EqualOperator
    , EQUALS: TokenKind.EqualsOperator
    , GREATER: TokenKind.GreaterOperator
    , IN: TokenKind.InOperator
    , IS: TokenKind.IsOperator
    , LESS: TokenKind.LessOperator
    , NEITHER: TokenKind.NeitherOperator
    , NOT: TokenKind.NotOperator
    , OR: TokenKind.OrOperator
    , THAN: TokenKind.ThanOperator
    , THE: TokenKind.TheOperator
    , THROUGH: TokenKind.ThruOperator
    , THRU: TokenKind.ThruOperator
    , TO: TokenKind.ToKeyWord

    , DIVIDED: TokenKind.DivideOperator
    , BY: TokenKind.DivideOperator
    , DIV: TokenKind.DivideOperator
    , MINUS: TokenKind.MinusOperator
    , MOD: TokenKind.ModulusOperator
    , REMAINDER: TokenKind.ModulusOperator
    , PLUS: TokenKind.PlusOperator
    , TIMES: TokenKind.TimesOperator
    , MULTIPLIED: TokenKind.TimesOperator
    , MULT: TokenKind.TimesOperator

    //// System Functions

    // Buffer Functions
    , GETBUFFEREDVALUE: TokenKind.GetBufferedValueFunction
    , GETBUFFERSIZE: TokenKind.GetBufferSizeFunction

    // Conversion Functions
    , NUMTOSTR: TokenKind.NumToStrFunction
    , STRTODATE: TokenKind.StrToDateFunction
    , STRTOTIME: TokenKind.StrToDateFunction
    , STRTONUM: TokenKind.StrToNumFunction
    , VAL: TokenKind.StrToNumFunction

    // Math Functions
    , ABS: TokenKind.AbsFunction
    , EXPONENTIAL: TokenKind.ExponentialFunction
    , EXP: TokenKind.ExponentialFunction
    , FACTORIAL: TokenKind.FactorialFunction
    , FACT: TokenKind.FactorialFunction
    , LN: TokenKind.LnFunction
    , LOG: TokenKind.LogFunction
    , RANDOM: TokenKind.RandomFunction
    , RND: TokenKind.RandomFunction
    , SQRT: TokenKind.SqrtFunction
    , SUM: TokenKind.SumFunction

    // Object Functions
    , READPROPERTY: TokenKind.ReadPropertyFunction
    , RELINQUISH: TokenKind.RelinquishFunction
    , WRITEPROPERTY: TokenKind.WritePropertyFunction

    // Function Functions
    , PASSED: TokenKind.PassedFunction

    // Rounding Functions
    , CEILING: TokenKind.CeilingFunction
    , FLOOR: TokenKind.FloorFunction
    , ROUND: TokenKind.RoundFunction
    , TRUNCATE: TokenKind.TruncateFunction
    , TRUNC: TokenKind.TruncateFunction

    // Statistical Functions
    , AVERAGE: TokenKind.AverageFunction
    , AVG: TokenKind.AverageFunction
    , MAXIMUM: TokenKind.MaximumFunction
    , MAX: TokenKind.MaximumFunction
    , MAXITEM: TokenKind.MaxItemFunction
    , MINIMUM: TokenKind.MinimumFunction
    , MINITEM: TokenKind.MinItemFunction
    , STANDARDDEVIATION: TokenKind.StandardDeviationFunction
    , SD: TokenKind.StandardDeviationFunction

    // String Functions
    , ASC: TokenKind.AscFunction
    , CHR: TokenKind.ChrFunction
    , LEFT: TokenKind.LeftFunction
    , FIRST: TokenKind.LeftFunction
    , LENGTH: TokenKind.LengthFunction
    , LEN: TokenKind.LengthFunction
    , MID: TokenKind.MidFunction
    , RIGHT: TokenKind.RightFunction
    , LAST: TokenKind.RightFunction
    , SEARCH: TokenKind.SearchFunction
    , STRINGFILL: TokenKind.StringFillFunction
    , TAB: TokenKind.TabFunction

    // Time Functions
    , DIFFTIME: TokenKind.DiffTimeFunction
    , TIMEPIECE: TokenKind.TimePieceFunction

    // Trig Functions
    , ACOS: TokenKind.AcosFunction
    , ARCCOSINE: TokenKind.AcosFunction
    , ASIN: TokenKind.AsinFunction
    , ARCSINE: TokenKind.AsinFunction
    , ATAN: TokenKind.AtanFunction
    , ARCTANGENT: TokenKind.AtanFunction
    , ATAN2: TokenKind.Atan2Function
    , ARCTANGENT2: TokenKind.Atan2Function
    , COS: TokenKind.CosFunction
    , COSINE: TokenKind.CosFunction
    , SIN: TokenKind.SinFunction
    , SINE: TokenKind.SinFunction
    , TAN: TokenKind.TanFunction
    , TANGENT: TokenKind.TanFunction

    // Dynamic Array Functions
    , GETARRAYSIZE: TokenKind.GetArraySizeFunction
    , SETARRAYSIZE: TokenKind.SetArraySizeFunction

    // Triggered Programs Functions
    , GETTICKCOUNT: TokenKind.GetTickCountFunction
    , GETELASPEDTIME: TokenKind.GetElaspedTimeFunction
    , STARTTIMER: TokenKind.StartTimerFunction
    , STOPTIMER: TokenKind.StopTimerFunction
    , GETTRIGGEREDVARIABLENAME: TokenKind.GetTriggeredVariableNameFunction
    , GETTRIGGEREDVARIABLEID: TokenKind.GetTriggeredVariableIdFunction

    // Obsolete - Continuum?
    , ROTATE: TokenKind.RotateFunction
    , OPENLIST: TokenKind.OpenListFunction
    , GETOBJECT: TokenKind.GetObjectFunction
    , GETNAME: TokenKind.GetNameFunction


    /// Declarations
    , FUNCTION: TokenKind.FunctionDeclaration
    , ARG: TokenKind.ArgDeclaration
    , PARAM: TokenKind.ArgDeclaration // function argument declaration
    , WEBSERVICE: TokenKind.WebserviceDeclaration // web
    , NUMERIC: TokenKind.NumericDeclaration
    , NUMBER: TokenKind.NumericDeclaration
    , DATETIME: TokenKind.DatetimeDeclaration
    , STRING: TokenKind.StringDeclaration
    // Declaration modifiers
    , INPUT: TokenKind.InputDeclaration
    , OUTPUT: TokenKind.OutputDeclaration
    , PUBLIC: TokenKind.PublicDeclaration
    , BUFFERED: TokenKind.BufferedDeclaration
    , TRIGGERED: TokenKind.TriggeredDeclaration

    // };

    // export enum EboControl {
    // Control
    // TO = EboOperators.TO,
    , END: TokenKind.EndStatement
    , STOP: TokenKind.StopStatement
    , BREAK: TokenKind.BreakStatement
    , CONTINUE: TokenKind.ContinueStatement
    , RETURN: TokenKind.ReturnStatement

    , BASEDON: TokenKind.BasedonStatement
    , GO: TokenKind.GoStatement
    , GOTO: TokenKind.GotoStatement
    , LINE: TokenKind.LineStatement

    , IF: TokenKind.IfStatement
    , THEN: TokenKind.ThenStatement
    , ELSE: TokenKind.ElseStatement
    , ENDIF: TokenKind.EndIfStatement

    , FOR: TokenKind.ForStatement
    , STEP: TokenKind.StepStatement
    , NEXT: TokenKind.NextStatement

    , SELECT: TokenKind.SelectStatement
    , CASE: TokenKind.CaseStatement
    , ENDSELECT: TokenKind.EndSelectStatement

    , REPEAT: TokenKind.RepeatStatement
    , UNTIL: TokenKind.UntilStatement

    , WHEN: TokenKind.WhenStatement
    , ENDWHEN: TokenKind.EndWhenStatement

    , WHILE: TokenKind.WhileStatement
    , ENDWHILE: TokenKind.EndWhileStatement

    , WAIT: TokenKind.WaitStatement
    , DELAY: TokenKind.WaitStatement

    // Action Statements 
    , P: TokenKind.P        /// print   
    , PR: TokenKind.PR      /// print

    , SET: TokenKind.SET
    , ADJUST: TokenKind.ADJUST
    , CHANGE: TokenKind.CHANGE
    , LET: TokenKind.LET
    , MODIFY: TokenKind.MODIFY

    , TURN: TokenKind.TURN
    , MOVE: TokenKind.MOVE
    , MODULATE: TokenKind.MODULATE

    , ENABLE: TokenKind.ENABLE
    , DISABLE: TokenKind.DISABLE
    , EN: TokenKind.EN
    , DIS: TokenKind.DIS
    , OPEN: TokenKind.OPEN
    , SHUT: TokenKind.SHUT
    , START: TokenKind.START

    , E: TokenKind.E  /// error line

    // reserved words - usage?

    , AVERAGED: TokenKind.AVERAGED
    , BINARY: TokenKind.BINARY
    , BIT: TokenKind.BIT
    , BITSTRING: TokenKind.BITSTRING
    , CHAR: TokenKind.CHAR
    , CHARACTERSETNOTSUPPORTED: TokenKind.CHARACTERSETNOTSUPPORTED
    , CHARTYPE: TokenKind.CHARTYPE
    , CONSTANT: TokenKind.CONSTANT
    , CURRENTVALUE: TokenKind.CURRENTVALUE
    , DELETE: TokenKind.DELETE
    , DIGITAL: TokenKind.DIGITAL
    , ENABLEDISABLE: TokenKind.ENABLEDISABLE
    , ENDRESTORE: TokenKind.ENDRESTORE
    , FAILED: TokenKind.FAILED
    , FAULT: TokenKind.FAULT
    , MISSINGREQUIREDPARAMETER: TokenKind.MISSINGREQUIREDPARAMETER
    , NOVTSESSIONS_AVAILABLE: TokenKind.NOVTSESSIONS_AVAILABLE
    , OBJECT: TokenKind.OBJECT
    , OBJECTCLASS: TokenKind.OBJECTCLASS
    , OBJECTDELETIONNOTPERMITTED: TokenKind.OBJECTDELETIONNOTPERMITTED
    , OBJECTID: TokenKind.OBJECTID
    , OBJECTIDENTIFIERALREADYEXISTS: TokenKind.OBJECTIDENTIFIERALREADYEXISTS
    , OBJECTREFERENCE: TokenKind.OBJECTREFERENCE
    , ODD: TokenKind.ODD
    , OTHER: TokenKind.OTHER
    , OVERRANGE: TokenKind.OVERRANGE
    , OVERRIDDEN: TokenKind.OVERRIDDEN
    , PRINT: TokenKind.PRINT
    , RUN: TokenKind.RUN
    , RUNNING: TokenKind.RUNNING
    , SINGULAR: TokenKind.SINGULAR
    , SITE_CONFIG: TokenKind.SITE_CONFIG
    , SITE_CONFIGB: TokenKind.SITE_CONFIGB

    , MONTHTODATE: TokenKind.MONTHTODATE
    , MONTHTONOW: TokenKind.MONTHTONOW
    , ONEWEEKTODATE: TokenKind.ONEWEEKTODATE
    , ONEWEEKTONOW: TokenKind.ONEWEEKTONOW
    , ONEYEARTODATE: TokenKind.ONEYEARTODATE
    , ONEYEARTONOW: TokenKind.ONEYEARTONOW
    , TODAY: TokenKind.TODAY

    // , ERRORS
    , ACCESSLOG: TokenKind.ACCESSLOG
    , ACCESSSERVER: TokenKind.ACCESSSERVER
    , ACKALARM: TokenKind.ACKALARM
    , ALL: TokenKind.ALL
    , APPEND: TokenKind.APPEND
    , ASK: TokenKind.ASK
    , BREAKPOINT: TokenKind.BREAKPOINT
    , C: TokenKind.C
    , CD: TokenKind.CD
    , CURVEFIT: TokenKind.CURVEFIT
    , DEL: TokenKind.DEL
    , DT: TokenKind.DT
    , ENCRYPT: TokenKind.ENCRYPT
    , ENCRYPTED: TokenKind.ENCRYPTED
    , ERASE: TokenKind.ERASE
    , EXECUTE: TokenKind.EXECUTE
    , EXISTS: TokenKind.EXISTS
    , FROM: TokenKind.FROM
    , LOOKUP: TokenKind.LOOKUP
    , MESSAGEWINDOW: TokenKind.MESSAGEWINDOW
    , PID: TokenKind.PID
    , SITE: TokenKind.SITE
    , STATUS: TokenKind.STATUS
    , STATUSLINE: TokenKind.STATUSLINE
    , TMTO: TokenKind.TMTO
    , TOUCHEDCELL: TokenKind.TOUCHEDCELL
    , TRACE: TokenKind.TRACE
    , UNADVISE: TokenKind.UNADVISE
    , UNIQUEPIN: TokenKind.UNIQUEPIN
    , UPDATE: TokenKind.UPDATE
    , UPDATEALARMS: TokenKind.UPDATEALARMS
    , UPDATEEVENTS: TokenKind.UPDATEEVENTS
    , UPDATEEXITLOG: TokenKind.UPDATEEXITLOG
    , VERSION: TokenKind.VERSION
    , WHERE: TokenKind.WHERE
    , WITH: TokenKind.WITH
};

const EboKeyWordNames = Object.keys(TokenMap);

const reEndLine = /\r?\n/;
const reWhiteSpace = /\s+/;
const reComment = /'.*/;
const reQuotedString = /"(?:\|"|[^"|]*)*"/;
const reNumber = /\d+(?:\.\d+)?(?:[eE][-+]?[0-9]+)?/;
const reTime = /\d{1,2}:\d{2}(?:\s*(?:am|pm))?/;
const reSymbol = /(?:>=|<=|<>|[-,;!*&%^+<>=:~/\\()[\]])/;
const reKWords = new RegExp("(?:" + EboKeyWordNames.join('|') + ")\\b");
const reFnCall = /[\w_][\w\d_]*(?=\s*\()/;
const reToken = /[\w_][\w\d_]*\b/;
const reErr = /./;

// export type Token = LxToken | TokenKind;

export interface TextRange {
    line: number
    begin: number
    end: number
}

export interface LexToken {
    type: TokenKind
    value: string
    range: TextRange
}

function getTokenKind(x: string): TokenKind {
    return TokenMap[x.toUpperCase()];
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


const scannerFns: ((m: string) => TokenKind)[] = [
/* 0 */    () => TokenKind.EndOfLineToken,
/* 1 */    () => TokenKind.WhitespaceToken,
/* 2 */    () => TokenKind.CommentToken,
/* 3 */    () => TokenKind.StringToken,
/* 4 */    () => TokenKind.NumberToken,
/* 5 */    () => TokenKind.TimeToken,
/* 6 */    (m: string) => SymbolMap[m] || TokenKind.OperatorToken,
/* 7 */    (m: string): TokenKind => getTokenKind(m) || TokenKind.KeywordToken,
/* 8 */    () => TokenKind.FunctionCallToken,
/* 9 */    () => TokenKind.IdentifierToken,
/* 10*/    () => TokenKind.ErrorToken,
];

function ebo_scan_line(line: string, line_id: number): LexToken[] {

    const tks: LexToken[] = [];
    let m: RegExpExecArray | null;
    while ((m = scannerRe.exec(line))) {
        let i = 1;
        while (!m[i] && i < m.length) { ++i; }
        tks.push({
            range: {
                line: line_id,
                begin: m.index,
                end: m.index + m[i].length
            },
            type: scannerFns[i - 1](m[i]),
            value: m[i]
        });
    }
    tks.push({
        range: {
            line: line_id,
            begin: line.length,
            end: line.length + 1,
        },
        type: TokenKind.EndOfLineToken,
        value: "\n"
    });
    return tks;
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
