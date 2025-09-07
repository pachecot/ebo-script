
export const declarations = [
    "Numeric",
    "Numeric Input",
    "Numeric Output",
    "Numeric Public",
    "Numeric Triggered Input",
    "Numeric Buffered Input",
    "Numeric Queued Input",
    "String",
    "String Input",
    "String Output",
    "String Public",
    "DateTime",
    "DateTime Input",
    "DateTime Output",
    "DateTime Public",
];

export const reDeclaration = /^\s*((?:Numeric)(\s+(?:Output|Public|(?:(?:Buffered|Triggered|Queued)\s+)?Input))?|(?:String|DateTime)(?:\s+(?:Input|Output|Public))?)\s*$/i;
