
export enum LxToken {
    TK_WHITESPACE = 10
    , TK_EOL
    , TK_COMMENT
    , TK_IDENT
    , TK_OPERATOR
    , TK_STRING
    , TK_NUMBER
    , TK_TIME
    , TK_KEYWORD
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


export enum EboKeyWords {

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

    /// 

    , AVERAGED
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
    , ABOVE
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

    //// System Functions

    // Buffer Functions
    , GETBUFFEREDVALUE
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


    /// Declarations
    , FUNCTION
    , ARG, PARAM = ARG // funtion argument declataion
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

    // Control    

    , END
    , STOP
    , BREAK
    , CONTINUE
    , RETURN
    , BASEDON
    , GO /* TO*/, GOTO, LINE
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

    // reserved words - no known usage
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

    // Obsolete - Continuum?
    , ROTATE
    , OPENLIST
    , GETOBJECT
    , GETNAME

};

