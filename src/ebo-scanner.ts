import { TokenKind, VariableKind } from './ebo-types';

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

    'NULL': TokenKind.NullValue
    , '-ON': TokenKind.MinusOnValue
    , OFF: TokenKind.OffValue
    , ON: TokenKind.OnValue

    , AM: TokenKind.AmValue
    , PM: TokenKind.PmValue

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
    , BY: TokenKind.OperatorToken
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
    , P: TokenKind.PrintAction        /// print   
    , PR: TokenKind.PrintAction      /// print

    , SET: TokenKind.SetAction
    , ADJUST: TokenKind.AdjustAction
    , CHANGE: TokenKind.ChangeAction
    , LET: TokenKind.LetAction
    , MODIFY: TokenKind.ModifyAction

    , TURN: TokenKind.TurnAction
    , MOVE: TokenKind.MoveAction
    , MODULATE: TokenKind.ModulateAction

    , ENABLE: TokenKind.EnableAction
    , DISABLE: TokenKind.DisableAction
    , EN: TokenKind.EnAction
    , DIS: TokenKind.DisAction
    , OPEN: TokenKind.OpenAction
    , SHUT: TokenKind.ShutAction
    , CLOSE: TokenKind.CloseAction
    , START: TokenKind.StartAction

    , E: TokenKind.ErrorLine  /// error line

    // reserved words - usage?

    , AVERAGED: TokenKind.AveragedKeyword
    , BINARY: TokenKind.BinaryKeyword
    , BIT: TokenKind.BitKeyword
    , BITSTRING: TokenKind.BitstringKeyword
    , CHAR: TokenKind.CharKeyword
    , CHARACTERSETNOTSUPPORTED: TokenKind.CharacterSetNotSupportedKeyword
    , CHARTYPE: TokenKind.ChartypeKeyword
    , CONSTANT: TokenKind.ConstantKeyword
    , CURRENTVALUE: TokenKind.CurrentValueKeyword
    , DELETE: TokenKind.DeleteKeyword
    , DIGITAL: TokenKind.DigitalKeyword
    , ENABLEDISABLE: TokenKind.EnableDisableKeyword
    , ENDRESTORE: TokenKind.EndRestoreKeyword
    , FAILED: TokenKind.FailedKeyword
    , FAULT: TokenKind.FaultKeyword
    , MISSINGREQUIREDPARAMETER: TokenKind.MissingRequiredParameterKeyword
    , NOVTSESSIONS_AVAILABLE: TokenKind.NoVTSessionsAvailableKeyword
    , OBJECT: TokenKind.ObjectKeyword
    , OBJECTCLASS: TokenKind.ObjectClassKeyword
    , OBJECTDELETIONNOTPERMITTED: TokenKind.ObjectDeletionNotPermittedKeyword
    , OBJECTID: TokenKind.ObjectIdKeyword
    , OBJECTIDENTIFIERALREADYEXISTS: TokenKind.ObjectIdentifierAlreadyExistsKeyword
    , OBJECTREFERENCE: TokenKind.ObjectReferenceKeyword
    , ODD: TokenKind.OddKeyword
    , OTHER: TokenKind.OtherKeyword
    , OVERRANGE: TokenKind.OverrangeKeyword
    , OVERRIDDEN: TokenKind.OverriddenKeyword
    , PRINT: TokenKind.PrintKeyword
    , RUN: TokenKind.RunKeyword
    , RUNNING: TokenKind.RunningKeyword
    , SINGULAR: TokenKind.SingularKeyword
    , SITE_CONFIG: TokenKind.SiteConfigKeyword
    , SITE_CONFIGB: TokenKind.SiteConfigBKeyword

    , MONTHTODATE: TokenKind.MonthToDateKeyword
    , MONTHTONOW: TokenKind.MonthToNowKeyword
    , ONEWEEKTODATE: TokenKind.OneWeekToDateKeyword
    , ONEWEEKTONOW: TokenKind.OneWeekToNowKeyword
    , ONEYEARTODATE: TokenKind.OneYearToDateKeyword
    , ONEYEARTONOW: TokenKind.OneYearToNowKeyword
    , TODAY: TokenKind.TodayKeyword

    // , ERRORS
    , ACCESSLOG: TokenKind.AccessLogKeyword
    , ACCESSSERVER: TokenKind.AccessServerKeyword
    , ACKALARM: TokenKind.AckAlarmKeyword
    , ALL: TokenKind.AllKeyword
    , APPEND: TokenKind.AppendKeyword
    , ASK: TokenKind.AskKeyword
    , BREAKPOINT: TokenKind.BreakpointKeyword
    , C: TokenKind.CKeyword
    , CD: TokenKind.CDKeyword
    , CURVEFIT: TokenKind.CurvefitKeyword
    , DEL: TokenKind.DelKeyword
    , DT: TokenKind.DTKeyword
    , ENCRYPT: TokenKind.EncryptKeyword
    , ENCRYPTED: TokenKind.EncryptedKeyword
    , ERASE: TokenKind.EraseKeyword
    , EXECUTE: TokenKind.ExecuteKeyword
    , EXISTS: TokenKind.ExistsKeyword
    , FROM: TokenKind.FromKeyword
    , LOOKUP: TokenKind.LookupKeyword
    , MESSAGEWINDOW: TokenKind.MessageWindowKeyword
    , PID: TokenKind.PidKeyword
    , SITE: TokenKind.SiteKeyword
    , STATUS: TokenKind.StatusKeyword
    , STATUSLINE: TokenKind.StatusLineKeyword
    , TMTO: TokenKind.TmToKeyword
    , TOUCHEDCELL: TokenKind.TouchedCellKeyword
    , TRACE: TokenKind.TraceKeyword
    , UNADVISE: TokenKind.UnadviseKeyword
    , UNIQUEPIN: TokenKind.UniquePinKeyword
    , UPDATE: TokenKind.UpdateKeyword
    , UPDATEALARMS: TokenKind.UpdateAlarmsKeyword
    , UPDATEEVENTS: TokenKind.UpdateEventsKeyword
    , UPDATEEXITLOG: TokenKind.UpdateExitLogKeyword
    , VERSION: TokenKind.VersionKeyword
    , WHERE: TokenKind.WhereKeyword
    , WITH: TokenKind.WithKeyword
};

const EboKeyWordNames = Object.keys(TokenMap);

const reEndLine = /\r?\n/;
const reContLine = /~\r?\n/;
const reWhiteSpace = /[ \t]+/;
const reComment = /'.*/;
const reQuotedString = /"(?:\|"|[^"|]*)*"/;
const reNumber = /[-+]?\d+(?:\.\d+)?(?:[eE][-+]?[0-9]+)?/;
const reTime = /\d{1,2}:\d{2}(?:\s*(?:am|pm))?/;
const reSymbol = /(?:>=|<=|<>|[-,;!*&%^+<>=:~/\\()[\]])/;
const reKWords = new RegExp("(?:" + EboKeyWordNames.join('|') + ")\\b");
const reFnCall = /[\w_][\w\d_]*(?=\s*\()/;
const reToken = /[\w_][\w\d_]*\b/;
const reErr = /./;
const reLine = /(Line\s+([1-9]|\d\d+|[\w_][\w\d_]*))|([1-9]|\d\d+|[\w_][\w\d_]*):/;

// export type Token = LxToken | TokenKind;

export interface TextRange {
    line: number
    begin: number
    end: number
    lines?: number
}

export interface LexToken {
    type: TokenKind
    value: string
    range: TextRange
}

export interface VarToken extends LexToken {
    type: TokenKind.IdentifierToken | VariableKind
    value: string
    range: TextRange
}

function getTokenKind(x: string): TokenKind {
    return TokenMap[x.toUpperCase()];
}

const scannerRe = new RegExp(`(${[
    //                          0
    reEndLine.source         // 1
    , reContLine.source      // 2
    , reWhiteSpace.source    // 3
    , reComment.source       // 4
    , reQuotedString.source  // 5
    , reTime.source          // 6
    , reNumber.source        // 7
    , reSymbol.source        // 8
    , reKWords.source        // 9
    , reFnCall.source        // 10
    , reToken.source         // 11
    , reErr.source           // 12
].join(')|(')})`, 'yi');


const scannerFns: ((m: string) => TokenKind)[] = [
/* 0 */    () => TokenKind.EndOfLineToken,
/* 1 */    () => TokenKind.ContinueLineToken,
/* 2 */    () => TokenKind.WhitespaceToken,
/* 3 */    () => TokenKind.CommentToken,
/* 4 */    () => TokenKind.StringToken,
/* 5 */    () => TokenKind.TimeToken,
/* 6 */    () => TokenKind.NumberToken,
/* 7 */    (m: string) => SymbolMap[m] || TokenKind.OperatorToken,
/* 8 */    (m: string): TokenKind => getTokenKind(m) || TokenKind.KeywordToken,
/* 9 */    () => TokenKind.FunctionCallToken,
/* 10 */   () => TokenKind.IdentifierToken,
/* 11 */   () => TokenKind.ErrorToken,
];

// function ebo_scan_line(line: string, line_id: number): LexToken[] {
function ebo_scan_line(line: string): LexToken[] {
    let line_id = 0;
    let offset = 0;
    const tks: LexToken[] = [];
    let m: RegExpExecArray | null;

    while ((m = scannerRe.exec(line))) {
        let i = 1;
        while (!m[i] && i < m.length) { ++i; }
        let begin = m.index - offset;
        tks.push({
            range: {
                line: line_id,
                begin: begin,
                end: begin + m[i].length
            },
            type: scannerFns[i - 1](m[i]),
            value: m[i]
        });
        if (m[1] || m[2]) {
            ++line_id;
            offset = m.index + m[0].length;
        }
    }
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
    return ebo_scan_line(fileText);
    // return ebo_scan_lines(fileText.split(reEndLine));
}
