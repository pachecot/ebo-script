
export const enum VarType {
    Null,
    DateTime,
    Numeric,
    NumericA,
    String,
    Variant,
    VarName,
}

export interface Signature {
    description: string
    , alias?: string[]
    , returns?: VarType
    , args?: VarType[]
    , signatures?: VarType[][]
    , syntaxes: string[]
};

export type SignatureMap = { [name: string]: Signature | undefined };

export const Signatures: SignatureMap = {

    // Buffer Functions

    GETBUFFEREDVALUE: {
        description: 'gets the next available value of the passed buffered input variable. This function returns Success or Failure.'
        , syntaxes: [
            'GETBUFFEREDVALUE(variable_name)'
        ]
        , returns: VarType.Variant
        , signatures: [[VarType.VarName]]
    },

    GETBUFFERSIZE: {
        description: 'returns the current buffer size (that is, the number of buffered values) of a passed buffered input variable.'
        , syntaxes: [
            'GETBUFFERSIZE(variable_name)'
        ]
        , returns: VarType.Numeric
        , signatures: [[VarType.VarName]]
    },

    // Conversion Functions

    NUMTOSTR: {
        description: 'converts a number in a numeric variable or other numeric form to a string variable so the number can be used in string operations. NUMTOSTR returns the converted string value.'
        , syntaxes: ['NUMTOSTR(numeric_value)']
        , returns: VarType.String
        , signatures: [[VarType.Numeric]]
    },
    STRTODATE: {
        description: 'returns a datetime that corresponds to the particular date and time you specify in the date_time. The controller has a unique number for each understandable moment in time.'
        , syntaxes: ['STRTODATE(date_time_string)']
        , alias: ['STRTOTIME']
        , returns: VarType.DateTime
        , signatures: [[VarType.String]]
    },
    STRTONUM: {
        description: 'converts a string that contains a number in a string variable or other string form to a numeric variable for use in mathematical operations. StrToNum returns the converted numeric value'
        , syntaxes: ['STRTONUM(number_string)']
        , alias: ['VAL']
        , returns: VarType.Numeric
        , signatures: [[VarType.String]]
    },

    // Math Functions

    ABS: {
        description: 'returns the absolute value of number. The absolute value of any number, positive or negative, is always the positive number.'
        , syntaxes: ['ABS(number_expression)']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    EXPONENTIAL: {
        description: 'returns a value equal to the base e raised to the number power.'
        , syntaxes: ['EXPONENTIAL(number_expression)']
        , alias: ['EXP']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    FACTORIAL: {
        description: "returns the factorial of integer_expression"
        , syntaxes: ['FACTORIAL(integer_expression)']
        , alias: ['FACT']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    LN: {
        description: "returns the natural logarithm of any number_expression."
        , syntaxes: ['LN(number_expression)']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    LOG: {
        description: "returns the base 10 logarithm of any number_expression."
        , syntaxes: ['LOG(number_expression)']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    RANDOM: {
        description: "returns a random number from 0 to 32,767 using number. Random is used to simulate real-life values to test programs."
        , syntaxes: [
            'RANDOM(number_expression)',
            'RANDOM()'
        ]
        , alias: ['RND']
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric],
            []
        ]
    },
    SQRT: {
        description: "returns the square root of the number."
        , syntaxes: ['SQRT(number_expression)']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    SUM: {
        description: 'returns the sum of the listed items, or the sum of an array.'
        , syntaxes: [
            'SUM(item1, item2, item3, ..itemN)',
            'SUM(numeric_array)'
        ]
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric, VarType.Numeric],
            [VarType.NumericA]
        ]
    },

    // Object Functions

    READPROPERTY: {
        description: 'retrieves the value of a property of a BACnet object'
        , syntaxes: ['ReadProperty(object_property)']
    },
    RELINQUISH: {
        description: 'Relinquish relinquishes a command. (You may also use WriteProperty and pass no argument for the value)'
        , syntaxes: ['Relinquish(object_property, priority)']
    },
    WRITEPROPERTY: {
        description: 'sets the value of a property of a BACnet object. The returned value is either SUCCESS or FAILURE.'
        , syntaxes: ['WRITEPROPERTY(object_property, value, priority, index)']
    },

    // Function Functions

    PASSED: {
        description: 'The PASSED function keyword indicates whether or not the argument with the arg_number has been passed into the current function. Returns TRUE (numeric 1) if the argument is actually passed and FALSE (numeric 0) if not.'
        , syntaxes: ['PASSED(arg_number)']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },

    // Rounding Functions

    CEILING: {
        description: 'rounds a number to the next larger integer on the number line and returns that integer.'
        , syntaxes: ['CEILING(numeric_expression)']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    FLOOR: {
        description: 'returns the next smaller integer on the number line and returns that integer.'
        , syntaxes: ['FLOOR(numeric_expression)']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    ROUND: {
        description: 'rounds a number to the nearest integer and returns that value.'
        , syntaxes: ['ROUND(numeric_expression)']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    TRUNCATE: {
        description: 'drops the fractional part of number and returns the integer.'
        , syntaxes: ['TRUNCATE(numeric_expression)']
        , alias: ['TRUNC']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },

    // Statistical Functions

    AVERAGE: {
        description: 'returns the average of a list of numeric values, a numeric array, or a numeric log.'
        , syntaxes: [
            'AVERAGE(item1,item2,item3,item4,... itemN)',
            'AVERAGE(numeric_array)'
        ]
        , alias: ['AVG']
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric, VarType.Numeric],
            [VarType.NumericA]
        ]
    },
    MAXIMUM: {
        description: 'finds the maximum number in a list of numeric values, a numeric array, or a numeric log.'
        , syntaxes: [
            'MAXIMUM(item1,item2,item3,item4,... itemN)',
            'MAXIMUM(numeric_array)'
        ]
        , alias: ['MAX']
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric, VarType.Numeric],
            [VarType.NumericA]
        ]
    },
    MAXITEM: {
        description: 'finds the position of the largest number in a list, an array, or a log. For example, MAXITEM returns 1 if the largest number is the first one in the list.'
        , syntaxes: [
            'MAXITEM(item1, item2, item3, ... itemN)',
            'MAXITEM(numeric_array)'
        ]
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric, VarType.Numeric],
            [VarType.NumericA]
        ]
    },
    MINIMUM: {
        description: 'finds the maximum number in a list of numeric values, a numeric array, or a numeric log.'
        , syntaxes: [
            'MINIMUM(item1,item2,item3,item4,... itemN)',
            'MINIMUM(numeric_array)'
        ]
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric, VarType.Numeric],
            [VarType.NumericA]
        ]
    },
    MINITEM: {
        description: 'finds the position of the smallest number in a list, an array, or a log. For example, MINITEM returns 1 if the smallest number is the first one in the list.'
        , syntaxes: [
            'MINITEM(item1, item2, item3, ... itemN)',
            'MINITEM(numeric_array)'
        ]
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric, VarType.Numeric],
            [VarType.NumericA]
        ]
    },
    STANDARDDEVIATION: {
        description: 'StandardDeviation finds the standard deviation of a series of numbers.'
        , syntaxes: [
            'STANDARDDEVIATION(item1, item2, item3, ... itemN)',
            'STANDARDDEVIATION(numeric_array)'
        ]
        , alias: ['SD']
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric, VarType.Numeric],
            [VarType.NumericA]
        ]
    },

    // String Functions

    ASC: {
        description: 'returns the ASCII value of the first character of the string.'
        , syntaxes: ['ASC(string)']
        , returns: VarType.Numeric
    },
    CHR: {
        description: 'returns one character whose ASCII code is number. CHR can be used to send non-printing characters to a terminal, computer, or printer to initiate action'
        , syntaxes: ['CHR(number)']
        , returns: VarType.String
    },
    LEFT: {
        description: 'returns a string consisting of the leftmost characters of string with a length specified by integer.'
        , syntaxes: ['LEFT(string, integer)']
        , alias: ['FIRST']
        , returns: VarType.String
    },
    LENGTH: {
        description: 'returns the number of characters in the string'
        , syntaxes: ['LENGTH(string)']
        , alias: ['LEN']
        , returns: VarType.Numeric
    },
    MID: {
        description: 'returns a string number character extracted from the string starting at offset'
        , syntaxes: ['MID(string, offset, number)']
        , returns: VarType.String
    },
    RIGHT: {
        description: ' returns the number of requested characters (the integer) from the text string starting from the right side (end) and counting left.'
        , syntaxes: ['RIGHT(string, integer)']
        , alias: ['LAST']
        , returns: VarType.String
    },
    SEARCH: {
        description: 'returns the position of the given search_string within string or 0 if the controller can’t find the search_string. (case sensitive)'
        , syntaxes: ['SEARCH(string, search_string)']
        , returns: VarType.Numeric
    },
    FIND: {
        description: 'performs a case sensitive or insensitive string search.'
        , syntaxes: ['FIND(string, search_string, [0 or 1])']
        , returns: VarType.Numeric
    },
    STRINGFILL: {
        description: 'returns a string of number length containing a particular character that you specify with the ASCII character code named by character code.'
        , syntaxes: ['STRINGFILL(number, character_code)']
        , returns: VarType.String
    },
    TAB: {
        description: 'returns a series of continuous blank spaces. The number of blank spaces is number.'
        , syntaxes: ['TAB(number)']
        , returns: VarType.String
    },

    // Time Functions

    DIFFTIME: {
        description: 'calculates the difference in whole seconds, minutes, hours, or days between two dates and times, date_time1 and date_time2. (Subtracts date_time1 from date_time2.)'
        , syntaxes: [
            'Difftime(SECOND, date_time1, date_time2)',
            'Difftime(MINUTE, date_time1, date_time2)',
            'Difftime(HOUR, date_time1, date_time2)',
            'Difftime(WKD, date_time1, date_time2)',
        ]
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric, VarType.DateTime, VarType.DateTime]
        ]
    },
    GETDST: {
        description: 'gets the time offset in seconds of the given time. Only supported in servers.'
        , syntaxes: [
            'GetDST(date_time)',
        ]
        , returns: VarType.Numeric
        , signatures: [
            [VarType.DateTime]
        ]
    },
    TIMEPIECE: {
        description: 'retrieves the piece of time (hour, minute, second) or the piece of the date (weekday, month, day of the month, year, day of the year) from a variable or point.'
        , syntaxes: [
            'Timepiece(datetime_system_variable, datetime_name)',
            'Timepiece(HOUR, datetime_name)',
            'Timepiece(MINUTE, datetime_name)',
            'Timepiece(SECOND, datetime_name)',
            'Timepiece(HOD, datetime_name)',
            'Timepiece(TOD, datetime_name)',
            'Timepiece(WEEKDAY, datetime_name)',
            'Timepiece(MONTH, datetime_name)',
            'Timepiece(DAYOFMONTH, datetime_name)',
            'Timepiece(YEAR, datetime_name)',
            'Timepiece(DAYOFYEAR, datetime_name)',
        ]
        , returns: VarType.Numeric
        , signatures: [
            [VarType.Numeric, VarType.DateTime]
        ]
    },

    // Trig Functions

    ACOS: {
        description: 'returns the arccosine of the given number.'
        , syntaxes: ['ACOS(number)']
        , alias: ['ARCCOSINE']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    ASIN: {
        description: 'returns the arcsine of the given number.'
        , syntaxes: ['ASIN(number)']
        , alias: ['ARCSINE']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    ATAN: {
        description: 'returns the arctangent of the given number.'
        , syntaxes: ['ATAN(number)']
        , alias: ['ARCTANGENT']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    ATAN2: {
        description: 'returns an angle with a sine of sin and a cosine of cos'
        , syntaxes: ['ATAN2 (sin, cos)']
        , alias: ['ARCTANGENT2']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric, VarType.Numeric]]
    },
    COS: {
        description: 'returns the cosine of number.'
        , syntaxes: ['COS(number)']
        , alias: ['COSINE']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    SIN: {
        description: 'returns the sine of the angle you specify.'
        , syntaxes: ['SIN(number)']
        , alias: ['SINE']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },
    TAN: {
        description: 'returns the tangent of number.'
        , syntaxes: ['TAN(number)']
        , alias: ['TANGENT']
        , returns: VarType.Numeric
        , signatures: [[VarType.Numeric]]
    },

    // Dynamic Array Functions

    GETARRAYSIZE: {
        description: 'requests the current size of the array.'
        , syntaxes: ['GETARRAYSIZE(array_variable)']
        , returns: VarType.Numeric
        , signatures: [[VarType.VarName]]
    },
    SETARRAYSIZE: {
        description: 'sets the size of the array to a given number.'
        , syntaxes: ['SETARRAYSIZE(array_variable, number)']
        , returns: VarType.Numeric
        , signatures: [[VarType.VarName, VarType.Numeric]]
    },

    // Triggered Programs Functions

    GETTICKCOUNT: {
        description: 'returns the number of milliseconds since the system started'
        , syntaxes: ['GETTICKCOUNT()']
        , returns: VarType.Numeric
        , signatures: [[]]
    },
    GETELASPEDTIME: {
        description: 'gets the elapsed time between the system time and the given time stamp.'
        , syntaxes: ['GETELASPEDTIME(time_stamp)']
        , returns: VarType.Numeric
        , signatures: [[VarType.DateTime]]
    },
    STARTTIMER: {
        description: 'When given a variable name, StartTimer starts a timer to trigger a program using the variable value or a number if present'
        , syntaxes: [
            'STARTTIMER(timer_variable)',
            'STARTTIMER(timer_variable, time_ms)'
        ]
    },
    STOPTIMER: {
        description: 'cancels a previously started timer and stops the Script event program timer from triggering.'
        , syntaxes: ['STOPTIMER(timer_variable)']
    },
    GETTRIGGEREDVARIABLENAME: {
        description: 'gets the name of the input variable that triggered the Script program.'
        , syntaxes: ['GETTRIGGEREDVARIABLENAME']
    },
    GETTRIGGEREDVARIABLEID: {
        description: 'gets the ID of the input variable that triggered the program.'
        , syntaxes: ['GETTRIGGEREDVARIABLEID']
    },
};

/// Add Function Alias

Signatures['STRTOTIME'] = Signatures.STRTODATE;
Signatures['VAL'] = Signatures.STRTONUM;
Signatures['EXP'] = Signatures.EXPONENTIAL;
Signatures['FACT'] = Signatures.FACTORIAL;
Signatures['RND'] = Signatures.RANDOM;
Signatures['TRUNC'] = Signatures.TRUNCATE;
Signatures['AVG'] = Signatures.AVERAGE;
Signatures['MAX'] = Signatures.MAXIMUM;
Signatures['SD'] = Signatures.STANDARDDEVIATION;
Signatures['LEN'] = Signatures.LENGTH;
Signatures['FIRST'] = Signatures.LEFT;
Signatures['LAST'] = Signatures.RIGHT;
Signatures['ARCCOSINE'] = Signatures.ACOS;
Signatures['ARCSINE'] = Signatures.ASIN;
Signatures['ARCTANGENT'] = Signatures.ATAN;
Signatures['ARCTANGENT2'] = Signatures.ATAN2;
Signatures['COSINE'] = Signatures.COS;
Signatures['SINE'] = Signatures.SIN;
Signatures['TANGENT'] = Signatures.TAN;


export const get = (name: string) => (Signatures as unknown as SignatureMap)[name.toUpperCase()];
