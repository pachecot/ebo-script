/**
 *
 */

export enum EboErrors {
    None,
    ArrayNotAllowed,
    ArraySizeInvalid,
    DuplicateDeclaration,
    DuplicateLine,
    ExtraCloseParentheses,
    ForIdentifierInvalid,
    ForStatementInvalidRange,
    ForStatementMissingNext,
    FunctionUsedAsVariable,
    IfThenStatementMissingEndIf,
    IllegalAssignment,
    LineUsedAsVariable,
    MissingCloseParentheses,
    ParseError,
    RedeclaredFunction,
    RepeatStatementMissingUntil,
    SelectCaseMissingEnd,
    UndeclaredFunction,
    UndeclaredVariable,
    UndefinedLine,
    UnreferencedDeclaration,
    UnreferencedFunction,
    UnreferencedLine,
    WhileMissingEndWhile
}
