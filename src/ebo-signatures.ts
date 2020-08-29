
export interface Signature {
    description: string
    , alias?: string[]
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
    },

    GETBUFFERSIZE: {
        description: 'returns the current buffer size (that is, the number of buffered values) of a passed buffered input variable.'
        , syntaxes: [
            'GETBUFFERSIZE(variable_name)'
        ]
    },

    // Conversion Functions

    NUMTOSTR: {
        description: 'converts a number in a numeric variable or other numeric form to a string variable so the number can be used in string operations. NUMTOSTR returns the converted string value.'
        , syntaxes: ['NUMTOSTR(numeric_value)']
    },
    STRTODATE: {
        description: 'returns a datetime that corresponds to the particular date and time you specify in the date_time. The controller has a unique number for each understandable moment in time.'
        , syntaxes: ['STRTODATE(date_time_string)']
        , alias: ['STRTOTIME']
    },
    STRTONUM: {
        description: 'converts a string that contains a number in a string variable or other string form to a numeric variable for use in mathematical operations. StrToNum returns the converted numeric value'
        , syntaxes: ['STRTONUM(number_string)']
        , alias: ['VAL']
    },

    // Math Functions

    ABS: {
        description: 'returns the absolute value of number. The absolute value of any number, positive or negative, is always the positive number.'
        , syntaxes: ['ABS(number_expression)']
    },
    EXPONENTIAL: {
        description: 'returns a value equal to the base e raised to the number power.'
        , syntaxes: ['EXPONENTIAL(number_expression)']
        , alias: ['EXP']
    },
    FACTORIAL: {
        description: "returns the factorial of integer_expression"
        , syntaxes: ['FACTORIAL(integer_expression)']
        , alias: ['FACT']
    },
    LN: {
        description: "returns the natural logarithm of any number_expression."
        , syntaxes: ['LN(number_expression)']
    },
    LOG: {
        description: "returns the base 10 logarithm of any number_expression."
        , syntaxes: ['LOG(number_expression)']
    },
    RANDOM: {
        description: "returns a random number from 0 to 32,767 using number. Random is used to simulate real-life values to test programs."
        , syntaxes: [
            'RANDOM(number_expression)',
            'RANDOM()'
        ]
        , alias: ['RND']
    },
    SQRT: {
        description: "returns the square root of the number."
        , syntaxes: ['SQRT(number_expression)']
    },
    SUM: {
        description: 'returns the sum of the listed items, or the sum of an array.'
        , syntaxes: [
            'SUM(item1, item2, item3, ..itemN)',
            'SUM(numeric_array)'
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
        description: ' sets the value of a property of a BACnet object. The returned value is either SUCCESS or FAILURE.'
        , syntaxes: ['WRITEPROPERTY(object_property, value, priority, index)']
    },

    // Function Functions

    PASSED: {
        description: 'The PASSED function keyword indicates whether or not the argument with the arg_number has been passed into the current function. Returns TRUE (numeric 1) if the argument is actually passed and FALSE (numeric 0) if not.'
        , syntaxes: ['PASSED(arg_number)']
    },

    // Rounding Functions

    CEILING: {
        description: 'rounds a number to the next larger integer on the number line and returns that integer.'
        , syntaxes: ['CEILING(numeric_expression)']
    },
    FLOOR: {
        description: 'returns the next smaller integer on the number line and returns that integer.'
        , syntaxes: ['FLOOR(numeric_expression)']
    },
    ROUND: {
        description: 'rounds a number to the nearest integer and returns that value.'
        , syntaxes: ['ROUND(numeric_expression)']
    },
    TRUNCATE: {
        description: 'drops the fractional part of number and returns the integer.'
        , syntaxes: ['TRUNCATE(numeric_expression)']
        , alias: ['TRUNC']
    },

    // Statistical Functions

    AVERAGE: {
        description: 'returns the average of a list of numeric values, a numeric array, or a numeric log.'
        , syntaxes: [
            'AVERAGE(item1,item2,item3,item4,... itemN)',
            'AVERAGE(numeric_array)'
        ]
        , alias: ['AVG']
    },
    MAXIMUM: {
        description: 'finds the maximum number in a list of numeric values, a numeric array, or a numeric log.'
        , syntaxes: [
            'MAXIMUM(item1,item2,item3,item4,... itemN)',
            'MAXIMUM(numeric_array)'
        ]
        , alias: ['MAX']
    },
    MAXITEM: {
        description: 'finds the position of the largest number in a list, an array, or a log. For example, MAXITEM returns 1 if the largest number is the first one in the list.'
        , syntaxes: [
            'MAXITEM(item1, item2, item3, ... itemN)',
            'MAXITEM(numeric_array)'
        ]
    },
    MINIMUM: {
        description: 'finds the maximum number in a list of numeric values, a numeric array, or a numeric log.'
        , syntaxes: [
            'MINIMUM(item1,item2,item3,item4,... itemN)',
            'MINIMUM(numeric_array)'
        ]
    },
    MINITEM: {
        description: 'finds the position of the smallest number in a list, an array, or a log. For example, MINITEM returns 1 if the smallest number is the first one in the list.'
        , syntaxes: [
            'MINITEM(item1, item2, item3, ... itemN)',
            'MINITEM(numeric_array)'
        ]
    },
    STANDARDDEVIATION: {
        description: 'StandardDeviation finds the standard deviation of a series of numbers.'
        , syntaxes: [
            'STANDARDDEVIATION(item1, item2, item3, ... itemN)',
            'STANDARDDEVIATION(numeric_array)'
        ]
        , alias: ['SD']
    },

    // String Functions

    ASC: {
        description: 'returns the ASCII value of the first character of the string.'
        , syntaxes: []
    },
    CHR: undefined,
    LEFT: undefined,
    LENGTH: undefined,
    LEN: undefined,
    MID: undefined,
    RIGHT: undefined,
    SEARCH: undefined,
    STRINGFILL: undefined,
    TAB: undefined,

    // Time Functions

    DIFFTIME: {
        description: 'calculates the difference in whole seconds, minutes, hours, or days between two dates and times, date_time1 and date_time2. (Subtracts date_time1 from date_time2.)'
        , syntaxes: [
            'Difftime(SECOND, date_time1, date_time2)',
            'Difftime(MINUTE, date_time1, date_time2)',
            'Difftime(HOUR, date_time1, date_time2)',
            'Difftime(WKD, date_time1, date_time2)',
        ]
    },
    TIMEPIECE: {
        description: `retrieves the piece of time (hour, minute, second) or the piece of the date (weekday, month, day of the month, year, day of the year) from a variable or point.
    `
        , syntaxes: [
            `Timepiece(datetime_system_variable, datetime_name)`,
            `Timepiece(HOUR, datetime_name)`,
            `Timepiece(MINUTE, datetime_name)`,
            `Timepiece(SECOND, datetime_name)`,
            `Timepiece(HOD, datetime_name)`,
            `Timepiece(TOD, datetime_name)`,
            `Timepiece(WEEKDAY, datetime_name)`,
            `Timepiece(MONTH, datetime_name)`,
            `Timepiece(DAYOFMONTH, datetime_name)`,
            `Timepiece(YEAR, datetime_name)`,
            `Timepiece(DAYOFYEAR, datetime_name)`,
        ]
    },

    // Trig Functions

    ACOS: {
        description: 'returns the arccosine of the given number.'
        , syntaxes: ['ACOS(number)']
        , alias: ['ARCCOSINE']
    },
    ASIN: {
        description: 'returns the arcsine of the given number.'
        , syntaxes: ['ASIN(number)']
        , alias: ['ARCSINE']
    },
    ATAN: {
        description: 'returns the arctangent of the given number.'
        , syntaxes: ['ATAN(number)']
        , alias: ['ARCTANGENT']
    },
    ATAN2: {
        description: 'returns an angle with a sine of sin and a cosine of cos'
        , syntaxes: ['ATAN2 (sin, cos)']
        , alias: ['ARCTANGENT2']
    },
    COS: {
        description: 'returns the cosine of number.'
        , syntaxes: ['COS(number)']
        , alias: ['COSINE']
    },
    SIN: {
        description: 'returns the sine of the angle you specify.'
        , syntaxes: ['SIN(number)']
        , alias: ['SINE']
    },
    TAN: {
        description: 'returns the tangent of number.'
        , syntaxes: ['TAN(number)']
        , alias: ['TANGENT']
    },

    // Dynamic Array Functions

    GETARRAYSIZE: undefined,
    SETARRAYSIZE: undefined,

    // Triggered Programs Functions

    GETTICKCOUNT: undefined,
    GETELASPEDTIME: undefined,
    STARTTIMER: undefined,
    STOPTIMER: undefined,
    GETTRIGGEREDVARIABLENAME: undefined,
    GETTRIGGEREDVARIABLEID: undefined,
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
