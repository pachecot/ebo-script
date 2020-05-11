
export enum LxToken {
    TK_WHITESPACE = 10
    , TK_EOL
    , TK_COMMENT
    , TK_NUMBER
    , TK_STRING
    , TK_TIME
    , TK_OPERATOR
    , TK_KEYWORD
    , TK_FNCALL
    , TK_IDENT
    , TK_ERROR
}

export enum Symbols {
    AMPERSAND = 101       //   '&'
    , ANGLE_LEFT          //   '<'
    , ANGLE_RIGHT         //   '>'
    , APOSTROPHE          //   '''
    , ASTERISK            //   '*'
    , BACKSLASH           //   '\'
    , BRACKET_CL          //   ']'
    , BRACKET_OP          //   '['
    , CARET               //   '^'
    , COLON               //   ':'
    , COMMA               //   ','
    , DOUBLE_QUOTE        //   '"'
    , EQUALS_SIGN         //   '='
    , EXCLAMATION         //   '!'
    , GREATER_THAN        //   '>'
    , GREATER_THAN_EQUALS //   '>='
    , LESS_THAN           //   '<'
    , LESS_THAN_EQUALS    //   '<='
    , MINUS_SIGN          //   '-'
    , NOT_EQUAL           //   '!='
    , PARENTHESES_CL      //   ')'
    , PARENTHESES_OP      //   '('
    , PERCENT             //   '%'
    , PLUS_SIGN           //   '+'
    , SEMICOLON           //   ';'
    , SLASH               //   '/'
    , TILDE               //   '~'
}

export enum EboValues {

    '-ON' = 1000
    , OFF
    , ON

    , AM
    , PM

    , JANUARY = 1010
    , FEBRUARY
    , MARCH
    , APRIL
    , MAY
    , JUNE
    , JULY
    , AUGUST
    , SEPTEMBER
    , OCTOBER
    , NOVEMBER
    , DECEMBER

    , JAN = JANUARY
    , FEB = FEBRUARY
    , MAR = MARCH
    , APR = APRIL
    //MAY = MAY
    , JUN = JUNE
    , JUL = JULY
    , AUG = AUGUST
    , SEP = SEPTEMBER
    , OCT = OCTOBER
    , NOV = NOVEMBER
    , DEC = DECEMBER

    , SUNDAY = 1030
    , MONDAY
    , TUESDAY
    , WEDNESDAY
    , THURSDAY
    , FRIDAY
    , SATURDAY

    , SUN = SUNDAY
    , MON = MONDAY
    , TUE = TUESDAY
    , WED = WEDNESDAY
    , THU = THURSDAY
    , FRI = FRIDAY
    , SAT = SATURDAY

    , FALSE  // numeric = 0
    , TRUE   // numeric = 1

    , OFFLINE
    , ONLINE

    , SUCCESS
    , FAILURE

    , DISABLED
    , ENABLED

    , CLOSED
    , OPENED

    , ACTIVE
    // , AVERAGE

    // 

    //
    , MINUTES
    , DAYS
    , MONTHS

    // System Variables

    , TS
    , TM
    , TH
    , TD

    , SCAN, SC = SCAN
    , DATE, TIME = DATE
    , UTCOFFSET

    // Timepiece
    , DAYOFMONTH, DOM
    , DAYOFYEAR, DOY
    , HOUR, HR
    , HOUROFDAY, HOD
    , MINUTE, MIN
    , MONTH, MTH
    , SECOND, SEC
    , TOD, TIMEOFDAY
    , WEEKDAY, WKD

};

export enum EboOperators {

    //// Operators
    // , '-'
    // , ','
    // , ';'
    // , '!'
    // , '"'
    // , '('
    // , ')'
    // , '['
    // , ']'
    // , '*'
    // , '/'
    // , '\''
    // , '\\'
    // , '&'
    // , '%'
    // , '^'
    // , '+'
    // , '<'
    // , '='
    // , '>'
    // , '~'
    // , '<='
    // , '<>'
    // , '>='
    ABOVE = 1100
    , AND // &
    , BELOW
    , BETWEEN
    , BITAND
    , BITNOT
    , BITOR
    , BITXOR
    , DOES
    , EITHER
    , EQUAL
    , EQUALS
    , GREATER
    , IN
    , IS
    , LESS
    , NEITHER
    , NOT
    , OR
    , THAN
    , THE
    , THROUGH
    , THRU
    , TO

    , DIVIDED, BY, DIV
    , MINUS
    , MOD, REMAINDER
    , PLUS
    , TIMES, MULTIPLIED, MULT


};

export enum EboFunctions {

    //// System Functions

    // Buffer Functions
    GETBUFFEREDVALUE = 1200
    , GETBUFFERSIZE

    // Conversion Functions
    , NUMTOSTR
    , STRTODATE, STRTOTIME = STRTODATE
    , STRTONUM, VAL = STRTONUM

    // Math Functions
    , ABS
    , EXPONENTIAL, EXP
    , FACTORIAL, FACT
    , LN
    , LOG
    , RANDOM, RND
    , SQRT
    , SUM

    // Object Functions
    , READPROPERTY
    , RELINQUISH
    , WRITEPROPERTY

    // Function Functions
    , PASSED

    // Rounding Functions
    , CEILING
    , FLOOR
    , ROUND
    , TRUNCATE, TRUNC = TRUNCATE

    // Statistical Functions
    , AVERAGE, AVG = AVERAGE
    , MAXIMUM, MAX = MAXIMUM
    , MAXITEM
    , MINIMUM
    , MINITEM
    , STANDARDDEVIATION, SD

    // String Functions
    , ASC
    , CHR
    , LEFT, FIRST = LEFT
    , LENGTH, LEN
    , MID
    , RIGHT, LAST = RIGHT
    , SEARCH
    , STRINGFILL
    , TAB

    // Time Functions
    , DIFFTIME
    , TIMEPIECE

    // Trig Functions
    , ACOS, ARCCOSINE = ACOS
    , ASIN, ARCSINE = ASIN
    , ATAN, ARCTANGENT = ATAN
    , ATAN2, ARCTANGENT2 = ATAN2
    , COS, COSINE = COS
    , SIN, SINE = SIN
    , TAN, TANGENT = TAN

    // Dynamic Array Functions
    , GETARRAYSIZE
    , SETARRAYSIZE

    // Triggered Programs Functions
    , GETTICKCOUNT
    , GETELASPEDTIME
    , STARTTIMER
    , STOPTIMER
    , GETTRIGGEREDVARIABLENAME
    , GETTRIGGEREDVARIABLEID

    // Obsolete - Continuum?
    , ROTATE
    , OPENLIST
    , GETOBJECT
    , GETNAME


};

export enum EboDeclarations {


    /// Declarations
    FUNCTION = 1300
    , ARG, PARAM = ARG // function argument declaration
    , WEBSERVICE // web
    , NUMERIC, NUMBER = NUMERIC
    , DATETIME
    , STRING
    // Declaration modifiers
    , INPUT
    , OUTPUT
    , PUBLIC
    , BUFFERED
    , TRIGGERED

};

export enum EboControl {
    // Control
    TO = EboOperators.TO,
    END = 2000
    , STOP
    , BREAK
    , CONTINUE
    , RETURN
    , BASEDON
    , GO, GOTO, LINE
    , IF, THEN, ELSE, ENDIF
    , FOR, STEP, NEXT
    , SELECT, CASE, ENDSELECT
    , REPEAT, UNTIL
    , WHEN, ENDWHEN
    , WHILE, ENDWHILE
    , WAIT, DELAY

    // Action Statements 
    , P, PR   /// print

    , SET, ADJUST, CHANGE, LET, MODIFY

    , TURN
    , MOVE, MODULATE

    , ENABLE
    , DISABLE
    , EN
    , DIS
    , OPEN
    , SHUT
    , START

    , E  /// error line
};

export enum EboReserved {
    // reserved words - usage?

    AVERAGED = 9000
    , BINARY
    , BIT
    , BITSTRING
    , CHAR
    , CHARACTERSETNOTSUPPORTED
    , CHARTYPE
    , CONSTANT
    , CURRENTVALUE
    , DELETE
    , DIGITAL
    , ENABLEDISABLE
    , ENDRESTORE
    , FAILED
    , FAULT
    , MISSINGREQUIREDPARAMETER
    , 'NOVTSESSIONS-AVAILABLE'
    , OBJECT
    , OBJECTCLASS
    , OBJECTDELETIONNOTPERMITTED
    , OBJECTID
    , OBJECTIDENTIFIERALREADYEXISTS
    , OBJECTREFERENCE
    , ODD
    , OTHER
    , OVERRANGE
    , OVERRIDDEN
    , PRINT
    , RUN
    , RUNNING
    , SINGULAR
    , SITE_CONFIG
    , SITE_CONFIGB

    , MONTHTODATE
    , MONTHTONOW
    , ONEWEEKTODATE
    , ONEWEEKTONOW
    , ONEYEARTODATE
    , ONEYEARTONOW
    , TODAY

    , ERRORS
    , ACCESSLOG
    , ACCESSSERVER
    , ACKALARM
    , ALL
    , APPEND
    , ASK
    , BREAKPOINT
    , C
    , CD
    , CURVEFIT
    , DEL
    , DT
    , ENCRYPT
    , ENCRYPTED
    , ERASE
    , EXECUTE
    , EXISTS
    , FROM
    , LOOKUP
    , MESSAGEWINDOW
    , PID
    , SITE
    , STATUS
    , STATUSLINE
    , TMTO
    , TOUCHEDCELL
    , TRACE
    , UNADVISE
    , UNIQUEPIN
    , UPDATE
    , UPDATEALARMS
    , UPDATEEVENTS
    , UPDATEEXITLOG
    , VERSION
    , WHERE
    , WITH

};

export type EboKeyWords = EboValues | EboOperators | EboFunctions | EboDeclarations | EboControl | EboReserved;

const numberFilter = (x: string) => isNaN(Number(x));

export const EboKeyWordNames = Object.keys(EboValues).filter(numberFilter).concat(
    Object.keys(EboOperators).filter(numberFilter)
    , Object.keys(EboFunctions).filter(numberFilter)
    , Object.keys(EboDeclarations).filter(numberFilter)
    , Object.keys(EboControl).filter(numberFilter)
    , Object.keys(EboReserved).filter(numberFilter)
);

export function GetEboKeyWord(x: string): EboKeyWords {
    x = x.toUpperCase();
    return ((EboValues as any)[x]
        || (EboOperators as any)[x]
        || (EboFunctions as any)[x]
        || (EboDeclarations as any)[x]
        || (EboControl as any)[x]
        || (EboReserved as any)[x]
    );
}