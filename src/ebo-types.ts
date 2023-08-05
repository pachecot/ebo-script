
export const enum TokenKind {

    Unknown
    , EndOfFileToken
    , EndOfLineToken
    , ContinueLineToken
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
    , GreaterThanEqualSymbol  //   '>='
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

    , NullValue
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


    , BlindCommandDown
    , BlindCommandDownStep
    , BlindCommandNoCommand
    , BlindCommandResynchronize
    , BlindCommandStop
    , BlindCommandUp
    , BlindCommandUpStep

    , LightCommandColorDown
    , LightCommandColorUp
    , LightCommandDown
    , LightCommandNoCommand
    , LightCommandOff
    , LightCommandOn
    , LightCommandStop
    , LightCommandUp

    // PE Command & Status
    , BackupNeededValue      /// ACCBackupNeeded      
    , FlashEmptyValue        /// ACCFlashEmpty
    , BackupNowCommand       /// ACCBackupNow  

    // Value Range Markers
    // -------------------
    , FirstValue = NullValue
    , LastValue = BackupNowCommand

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
    , DSTVariable

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

    , IsOperator         /// a IS ....
    , InOperator         /// a IS IN ....
    , BetweenOperator    /// a IS BETWEEN b AND c
    , AboveOperator      /// a IS ABOVE b
    , BelowOperator      /// a IS BELOW b
    , GreaterOperator    /// a IS GREATER b, a IS GREATER THAN b
    , LessOperator       /// a IS LESS b, a IS LESS THAN b
    , EitherOperator     /// a IS EITHER b, c, d 
    , NeitherOperator    /// a IS NEITHER b, c, d
    , DoesOperator       /// a DOES NOT EQUAL b
    , EqualOperator      /// a IS EQUAL b, a IS EQUAL TO b, a IS NOT EQUAL TO b
    , ThanOperator       /// a IS LESS THAN b
    , ThruOperator       /// a THRU b, a IS b THRU c

    , NotOperator        /// NOT a
    , TheOperator        /// THE a

    , AndOperator        /// a AND b
    , BitandOperator     /// a BITAND b
    , BitnotOperator     /// a BITNOT b
    , BitorOperator      /// a BITOR b
    , BitxorOperator     /// a BITXOR b
    , EqualsOperator     /// a EQUALS b
    , OrOperator         /// a OR b
    , MinusOperator      /// a MINUS b, MINUS a
    , ToKeyWord          /// a TO b
    , DivideOperator     /// a DIV b, a DIVIDED BY b, 
    , ModulusOperator    /// a MOD b, a REMAINDER b
    , PlusOperator       /// a PLUS b,
    , TimesOperator      /// a TIMES b, a MULT b, a MULTIPLIED BY b  

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
    , GetDSTFunction

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
    , TrendlogDeclaration
    , DatafileDeclaration

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

    , EnableAction
    , DisableAction
    , EnAction
    , DisAction
    , OpenAction
    , CloseAction
    , ShutAction
    , StartAction
    , StopAction

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
    , MissingRequiredParameterKeyword
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

export type FunctionKind =
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
    | TokenKind.GetDSTFunction
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

export type UnaryOperatorKind =
    | TokenKind.NotOperator
    | TokenKind.BitnotOperator
    | TokenKind.PercentSymbol           //   '%'
    | TokenKind.MinusSymbol             //   '-'
    | TokenKind.PlusSymbol              //   '+'
    ;

export type BinaryOperatorKind =
    | TokenKind.AmpersandSymbol         //   '&'  AND
    | TokenKind.ExclamationSymbol       //   '!'  OR
    | TokenKind.AsteriskSymbol          //   '*'
    | TokenKind.EqualsSymbol            //   '='
    | TokenKind.NotEqualSymbol          //   '<>'
    | TokenKind.AngleLeftSymbol         //   '<'
    | TokenKind.LessThanEqualSymbol     //   '<='
    | TokenKind.AngleRightSymbol        //   '>'
    | TokenKind.GreaterThanEqualSymbol  //   '>='
    | TokenKind.MinusSymbol             //   '-'
    | TokenKind.PlusSymbol              //   '+'
    | TokenKind.SemicolonSymbol         //   ';'
    | TokenKind.SlashSymbol             //   '/'
    // | TokenKind.ExponentiationSymbol    //   '^^'
    | TokenKind.AndOperator
    | TokenKind.OrOperator
    | TokenKind.BitandOperator
    | TokenKind.BitorOperator
    | TokenKind.BitxorOperator
    | TokenKind.EqualsOperator
    | TokenKind.DivideOperator
    | TokenKind.ModulusOperator
    | TokenKind.PlusOperator
    | TokenKind.TimesOperator
    | TokenKind.MinusOperator;

export type OperatorKind =
    | TokenKind.AboveOperator
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


export type ValueKind =
    | TokenKind.NullValue
    | TokenKind.MinusOnValue
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
    | TokenKind.BlindCommandDown
    | TokenKind.BlindCommandDownStep
    | TokenKind.BlindCommandNoCommand
    | TokenKind.BlindCommandResynchronize
    | TokenKind.BlindCommandStop
    | TokenKind.BlindCommandUp
    | TokenKind.BlindCommandUpStep
    | TokenKind.LightCommandColorDown
    | TokenKind.LightCommandColorUp
    | TokenKind.LightCommandDown
    | TokenKind.LightCommandNoCommand
    | TokenKind.LightCommandOff
    | TokenKind.LightCommandOn
    | TokenKind.LightCommandStop
    | TokenKind.LightCommandUp
    | TokenKind.FlashEmptyValue
    | TokenKind.BackupNeededValue
    | TokenKind.BackupNowCommand
    ;


export type VariableKind =
    | TokenKind.TsVariable
    | TokenKind.TmVariable
    | TokenKind.ThVariable
    | TokenKind.TdVariable
    | TokenKind.ScanVariable
    | TokenKind.DateVariable
    | TokenKind.UtcOffsetVariable
    | TokenKind.DSTVariable
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


export type SymbolKind =
    | TokenKind.AmpersandSymbol
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
    | TokenKind.GreaterThanEqualSymbol
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

export function isUnaryOperator(s: TokenKind): s is UnaryOperatorKind {
    switch (s) {
        case TokenKind.NotOperator:
        case TokenKind.BitnotOperator:
        case TokenKind.PercentSymbol:
        case TokenKind.MinusSymbol:
        case TokenKind.PlusSymbol:
            return true;
    }
    return false;
}

export function isBinaryOperator(s: TokenKind): s is BinaryOperatorKind {
    switch (s) {
        case TokenKind.AmpersandSymbol:
        case TokenKind.ExclamationSymbol:
        case TokenKind.AsteriskSymbol:
        case TokenKind.EqualsSymbol:
        case TokenKind.NotEqualSymbol:
        case TokenKind.AngleLeftSymbol:
        case TokenKind.LessThanEqualSymbol:
        case TokenKind.AngleRightSymbol:
        case TokenKind.GreaterThanEqualSymbol:
        case TokenKind.MinusSymbol:
        case TokenKind.PlusSymbol:
        case TokenKind.SemicolonSymbol:
        case TokenKind.SlashSymbol:
        // case TokenKind.ExponentiationSymbol:
        case TokenKind.AndOperator:
        case TokenKind.OrOperator:
        case TokenKind.BitandOperator:
        case TokenKind.BitorOperator:
        case TokenKind.BitxorOperator:
        case TokenKind.EqualsOperator:
        case TokenKind.DivideOperator:
        case TokenKind.ModulusOperator:
        case TokenKind.PlusOperator:
        case TokenKind.TimesOperator:
        case TokenKind.MinusOperator:
            return true;
    }
    return false;
}


