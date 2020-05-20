
export const enum TokenKind {

    Unknown
    , EndOfFileToken
    , EndOfLineToken
    , WhitespaceToken
    , CommentToken
    , NumberToken
    , StringToken
    , TimeToken
    , OperatorToken
    , KeywordToken
    , FunctionCallToken
    , IdentifierToken
    , ErrorToken

    //#region Symbols
    // --------------

    , AmpersandSymbol         //   '&'
    , AngleLeftSymbol         //   '<'
    , AngleRightSymbol        //   '>'
    , ApostropheSymbol        //   '''
    , AsteriskSymbol          //   '*'
    , BackslashSymbol         //   '\'
    , BracketRightSymbol      //   ']'
    , BracketLeftSymbol       //   '['
    , CaretSymbol             //   '^'
    , ColonSymbol             //   ':'
    , CommaSymbol             //   ','
    , DoubleQuoteSymbol       //   '"'
    , EqualsSymbol            //   '='
    , ExclamationSymbol       //   '!'
    , GreaterThanSymbol       //   '>'
    , GreaterThanEqualSymbol  //   '>='
    , LessThanSymbol          //   '<'
    , LessThanEqualSymbol     //   '<='
    , MinusSymbol             //   '-'
    , NotEqualSymbol          //   '<>'
    , ParenthesesRightSymbol  //   ')'
    , ParenthesesLeftSymbol   //   '('
    , PercentSymbol           //   '%'
    , PlusSymbol              //   '+'
    , SemicolonSymbol         //   ';'
    , SlashSymbol             //   '/'
    , TildeSymbol             //   '~'

    // Symbol Range Markers
    // ------------
    , FirstSymbol = AmpersandSymbol
    , LastSymbol = TildeSymbol

    //#endregion

    //#region system values
    //  -------------------

    , MinusOnValue
    , OffValue
    , OnValue

    , AmValue
    , PmValue

    , JanuaryValue
    , FebruaryValue
    , MarchValue
    , AprilValue
    , MayValue
    , JuneValue
    , JulyValue
    , AugustValue
    , SeptemberValue
    , OctoberValue
    , NovemberValue
    , DecemberValue

    , SundayValue
    , MondayValue
    , TuesdayValue
    , WednesdayValue
    , ThursdayValue
    , FridayValue
    , SaturdayValue

    , FalseValue  // numeric = 0
    , TrueValue   // numeric = 1

    , OfflineValue
    , OnlineValue

    , SuccessValue // 0
    , FailureValue // 1

    , DisabledValue
    , EnabledValue

    , ClosedValue
    , OpenedValue

    , InactiveValue
    , ActiveValue
    // , AVERAGE

    //
    , MinutesValue
    , DaysValue
    , MonthsValue

    // Value Range Markers
    // -------------------
    , FirstValue = MinusOnValue
    , LastValue = MonthsValue

    //#endregion

    //#region System Variables
    // -----------------------

    , TsVariable
    , TmVariable
    , ThVariable
    , TdVariable

    , ScanVariable
    , DateVariable
    , UtcOffsetVariable

    // Timepiece
    , DayOfMonthVariable
    , DayOfYearVariable
    , HourVariable
    , hourOfDayVariable
    , MinuteVariable
    , MonthVariable
    , SecondVariable
    , TimeOfDayVariable
    , WeekdayVariable
    , YearVariable

    , ErrorsVariable
    , FreememVariable
    , IsBoundVariable

    // Variable Range Markers
    // ----------------------
    , FirstVariable = TsVariable
    , LastVariable = IsBoundVariable

    //#endregion

    //#region Operators
    // ----------------

    , AboveOperator
    , AndOperator
    , BelowOperator
    , BetweenOperator
    , BitandOperator
    , BitnotOperator
    , BitorOperator
    , BitxorOperator
    , DoesOperator
    , EitherOperator
    , EqualOperator
    , EqualsOperator
    , GreaterOperator
    , InOperator
    , IsOperator
    , LessOperator
    , NeitherOperator
    , NotOperator
    , OrOperator
    , ThanOperator
    , TheOperator
    , ThruOperator
    , ToKeyWord

    , DivideOperator
    , MinusOperator
    , ModulusOperator
    , PlusOperator
    , TimesOperator

    // Operator Range Markers
    // ----------------------
    , FirstOperator = AboveOperator
    , LastOperator = TimesOperator

    //#endregion

    //#region System Functions
    // -----------------------

    // Buffer Functions
    , GetBufferedValueFunction
    , GetBufferSizeFunction

    // Conversion Functions
    , NumToStrFunction
    , StrToDateFunction
    , StrToNumFunction

    // Math Functions
    , AbsFunction
    , ExponentialFunction
    , FactorialFunction
    , LnFunction
    , LogFunction
    , RandomFunction
    , SqrtFunction
    , SumFunction

    // Object Functions
    , ReadPropertyFunction
    , RelinquishFunction
    , WritePropertyFunction

    // Function Functions
    , PassedFunction

    // Rounding Functions
    , CeilingFunction
    , FloorFunction
    , RoundFunction
    , TruncateFunction

    // Statistical Functions
    , AverageFunction
    , MaximumFunction
    , MaxItemFunction
    , MinimumFunction
    , MinItemFunction
    , StandardDeviationFunction


    // String Functions
    , AscFunction
    , ChrFunction
    , LeftFunction
    , LengthFunction
    , MidFunction
    , RightFunction
    , SearchFunction
    , StringFillFunction
    , TabFunction

    // Time Functions
    , DiffTimeFunction
    , TimePieceFunction

    // Trig Functions
    , AcosFunction
    , AsinFunction
    , AtanFunction
    , Atan2Function
    , CosFunction
    , SinFunction
    , TanFunction

    // Dynamic Array Functions
    , GetArraySizeFunction
    , SetArraySizeFunction

    // Triggered Programs Functions
    , GetTickCountFunction
    , GetElaspedTimeFunction
    , StartTimerFunction
    , StopTimerFunction
    , GetTriggeredVariableNameFunction
    , GetTriggeredVariableIdFunction

    // Obsolete - Continuum?
    , RotateFunction
    , OpenListFunction
    , GetObjectFunction
    , GetNameFunction

    // Function Range Markers
    // ----------------------
    , FirstFunction = GetBufferedValueFunction
    , LastFunction = GetNameFunction

    //#endregion

    //#region Declarations 
    // -------------------

    , FunctionDeclaration
    , ArgDeclaration
    , WebserviceDeclaration // web
    , NumericDeclaration
    , DatetimeDeclaration
    , StringDeclaration

    // Declaration modifiers
    , InputDeclaration
    , OutputDeclaration
    , PublicDeclaration
    , BufferedDeclaration
    , TriggeredDeclaration

    //#endregion

    // -------------------

    //#region Control Statements
    // -------------------------

    , EndStatement
    , StopStatement
    , BreakStatement
    , ContinueStatement
    , ReturnStatement
    , BasedonStatement
    , GoStatement
    , GotoStatement
    , LineStatement
    , IfStatement
    , ThenStatement
    , ElseStatement
    , EndIfStatement
    , ForStatement
    , StepStatement
    , NextStatement
    , SelectStatement
    , CaseStatement
    , EndSelectStatement
    , RepeatStatement
    , UntilStatement
    , WhenStatement
    , EndWhenStatement
    , WhileStatement
    , EndWhileStatement
    , WaitStatement

    //#endregion

    //#region Action Statements 
    // ------------------------
    , PrintAction /// print

    , SetAction
    , AdjustAction
    , ChangeAction
    , LetAction
    , ModifyAction

    , TurnAction
    , MoveAction
    , ModulateAction

    , EnableKeyword
    , DisableAction
    , EnAction
    , DisAction
    , OpenAction
    , ShutAction
    , StartAction

    , ErrorLine  /// error line

    //#endregion

    //#region reserved words
    // ---------------------
    // reserved words - usage?

    , AveragedKeyword
    , BinaryKeyword
    , BitKeyword
    , BitstringKeyword
    , CharKeyword
    , CharacterSetNotSupportedKeyword
    , ChartypeKeyword
    , ConstantKeyword
    , CurrentValueKeyword
    , DeleteKeyword
    , DigitalKeyword
    , EnableDisableKeyword
    , EndRestoreKeyword
    , FailedKeyword
    , FaultKeyword
    , MissingRequiredParamterKeyword
    , NoVTSessionsAvailableKeyword
    , ObjectKeyword
    , ObjectClassKeyword
    , ObjectDeletionNotPermittedKeyword
    , ObjectIdKeyword
    , ObjectIdentifierAlreadyExistsKeyword
    , ObjectReferenceKeyword
    , OddKeyword
    , OtherKeyword
    , OverrangeKeyword
    , OverriddenKeyword
    , PrintKeyword
    , RunKeyword
    , RunningKeyword
    , SingularKeyword
    , SiteConfigKeyword
    , SiteConfigBKeyword

    , MonthToDateKeyword
    , MonthToNowKeyword
    , OneWeekToDateKeyword
    , OneWeekToNowKeyword
    , OneYearToDateKeyword
    , OneYearToNowKeyword
    , TodayKeyword

    // , ERRORS
    , AccessLogKeyword
    , AccessServerKeyword
    , AckAlarmKeyword
    , AllKeyword
    , AppendKeyword
    , AskKeyword
    , BreakpointKeyword
    , CKeyword
    , CDKeyword
    , CurvefitKeyword
    , DelKeyword
    , DTKeyword
    , EncryptKeyword
    , EncryptedKeyword
    , EraseKeyword
    , ExecuteKeyword
    , ExistsKeyword
    , FromKeyword
    , LookupKeyword
    , MessageWindowKeyword
    , PidKeyword
    , SiteKeyword
    , StatusKeyword
    , StatusLineKeyword
    , TmToKeyword
    , TouchedCellKeyword
    , TraceKeyword
    , UnadviseKeyword
    , UniquePinKeyword
    , UpdateKeyword
    , UpdateAlarmsKeyword
    , UpdateEventsKeyword
    , UpdateExitLogKeyword
    , VersionKeyword
    , WhereKeyword
    , WithKeyword

    //#endregion
};

type FunctionKind =
    TokenKind.GetBufferedValueFunction
    | TokenKind.GetBufferSizeFunction
    | TokenKind.NumToStrFunction
    | TokenKind.StrToDateFunction
    | TokenKind.StrToNumFunction
    | TokenKind.AbsFunction
    | TokenKind.ExponentialFunction
    | TokenKind.FactorialFunction
    | TokenKind.LnFunction
    | TokenKind.LogFunction
    | TokenKind.RandomFunction
    | TokenKind.SqrtFunction
    | TokenKind.SumFunction
    | TokenKind.ReadPropertyFunction
    | TokenKind.RelinquishFunction
    | TokenKind.WritePropertyFunction
    | TokenKind.PassedFunction
    | TokenKind.CeilingFunction
    | TokenKind.FloorFunction
    | TokenKind.RoundFunction
    | TokenKind.TruncateFunction
    | TokenKind.AverageFunction
    | TokenKind.MaximumFunction
    | TokenKind.MaxItemFunction
    | TokenKind.MinimumFunction
    | TokenKind.MinItemFunction
    | TokenKind.StandardDeviationFunction
    | TokenKind.AscFunction
    | TokenKind.ChrFunction
    | TokenKind.LeftFunction
    | TokenKind.LengthFunction
    | TokenKind.MidFunction
    | TokenKind.RightFunction
    | TokenKind.SearchFunction
    | TokenKind.StringFillFunction
    | TokenKind.TabFunction
    | TokenKind.DiffTimeFunction
    | TokenKind.TimePieceFunction
    | TokenKind.AcosFunction
    | TokenKind.AsinFunction
    | TokenKind.AtanFunction
    | TokenKind.Atan2Function
    | TokenKind.CosFunction
    | TokenKind.SinFunction
    | TokenKind.TanFunction
    | TokenKind.GetArraySizeFunction
    | TokenKind.SetArraySizeFunction
    | TokenKind.GetTickCountFunction
    | TokenKind.GetElaspedTimeFunction
    | TokenKind.StartTimerFunction
    | TokenKind.StopTimerFunction
    | TokenKind.GetTriggeredVariableNameFunction
    | TokenKind.GetTriggeredVariableIdFunction
    | TokenKind.RotateFunction
    | TokenKind.OpenListFunction
    | TokenKind.GetObjectFunction
    | TokenKind.GetNameFunction
    ;

type OperatorKind = TokenKind.AboveOperator
    | TokenKind.AndOperator
    | TokenKind.BelowOperator
    | TokenKind.BetweenOperator
    | TokenKind.BitandOperator
    | TokenKind.BitnotOperator
    | TokenKind.BitorOperator
    | TokenKind.BitxorOperator
    | TokenKind.DoesOperator
    | TokenKind.EitherOperator
    | TokenKind.EqualOperator
    | TokenKind.EqualsOperator
    | TokenKind.GreaterOperator
    | TokenKind.InOperator
    | TokenKind.IsOperator
    | TokenKind.LessOperator
    | TokenKind.NeitherOperator
    | TokenKind.NotOperator
    | TokenKind.OrOperator
    | TokenKind.ThanOperator
    | TokenKind.TheOperator
    | TokenKind.ThruOperator
    | TokenKind.ToKeyWord

    | TokenKind.DivideOperator
    | TokenKind.MinusOperator
    | TokenKind.ModulusOperator
    | TokenKind.PlusOperator
    | TokenKind.TimesOperator
    ;


type ValueKind = TokenKind.MinusOnValue
    | TokenKind.OffValue
    | TokenKind.OnValue
    | TokenKind.AmValue
    | TokenKind.PmValue
    | TokenKind.JanuaryValue
    | TokenKind.FebruaryValue
    | TokenKind.MarchValue
    | TokenKind.AprilValue
    | TokenKind.MayValue
    | TokenKind.JuneValue
    | TokenKind.JulyValue
    | TokenKind.AugustValue
    | TokenKind.SeptemberValue
    | TokenKind.OctoberValue
    | TokenKind.NovemberValue
    | TokenKind.DecemberValue
    | TokenKind.SundayValue
    | TokenKind.MondayValue
    | TokenKind.TuesdayValue
    | TokenKind.WednesdayValue
    | TokenKind.ThursdayValue
    | TokenKind.FridayValue
    | TokenKind.SaturdayValue
    | TokenKind.FalseValue
    | TokenKind.TrueValue
    | TokenKind.OfflineValue
    | TokenKind.OnlineValue
    | TokenKind.SuccessValue
    | TokenKind.FailureValue
    | TokenKind.DisabledValue
    | TokenKind.EnabledValue
    | TokenKind.ClosedValue
    | TokenKind.OpenedValue
    | TokenKind.InactiveValue
    | TokenKind.ActiveValue
    | TokenKind.MinutesValue
    | TokenKind.DaysValue
    | TokenKind.MonthsValue
    ;


type VariableKind = TokenKind.TsVariable
    | TokenKind.TmVariable
    | TokenKind.ThVariable
    | TokenKind.TdVariable
    | TokenKind.ScanVariable
    | TokenKind.DateVariable
    | TokenKind.UtcOffsetVariable
    | TokenKind.DayOfMonthVariable
    | TokenKind.DayOfYearVariable
    | TokenKind.HourVariable
    | TokenKind.hourOfDayVariable
    | TokenKind.MinuteVariable
    | TokenKind.MonthVariable
    | TokenKind.SecondVariable
    | TokenKind.TimeOfDayVariable
    | TokenKind.WeekdayVariable
    | TokenKind.YearVariable
    | TokenKind.ErrorsVariable
    | TokenKind.FreememVariable
    | TokenKind.IsBoundVariable
    ;


type SymbolKind = TokenKind.AmpersandSymbol
    | TokenKind.AngleLeftSymbol
    | TokenKind.AngleRightSymbol
    | TokenKind.ApostropheSymbol
    | TokenKind.AsteriskSymbol
    | TokenKind.BackslashSymbol
    | TokenKind.BracketRightSymbol
    | TokenKind.BracketLeftSymbol
    | TokenKind.CaretSymbol
    | TokenKind.ColonSymbol
    | TokenKind.CommaSymbol
    | TokenKind.DoubleQuoteSymbol
    | TokenKind.EqualsSymbol
    | TokenKind.ExclamationSymbol
    | TokenKind.GreaterThanSymbol
    | TokenKind.GreaterThanEqualSymbol
    | TokenKind.LessThanSymbol
    | TokenKind.LessThanEqualSymbol
    | TokenKind.MinusSymbol
    | TokenKind.NotEqualSymbol
    | TokenKind.ParenthesesRightSymbol
    | TokenKind.ParenthesesLeftSymbol
    | TokenKind.PercentSymbol
    | TokenKind.PlusSymbol
    | TokenKind.SemicolonSymbol
    | TokenKind.SlashSymbol
    | TokenKind.TildeSymbol
    ;


export function isFunctionKind(s: TokenKind): s is FunctionKind {
    return TokenKind.FirstFunction <= s && s <= TokenKind.LastFunction;
}
export function isOperatorKind(s: TokenKind): s is OperatorKind {
    return TokenKind.FirstOperator <= s && s <= TokenKind.LastOperator;
}
export function isValueKind(s: TokenKind): s is ValueKind {
    return TokenKind.FirstValue <= s && s <= TokenKind.LastValue;
}
export function isVariableKind(s: TokenKind): s is VariableKind {
    return TokenKind.FirstVariable <= s && s <= TokenKind.LastVariable;
}
export function isSymbolKind(s: TokenKind): s is SymbolKind {
    return TokenKind.FirstSymbol <= s && s <= TokenKind.LastSymbol;
}



