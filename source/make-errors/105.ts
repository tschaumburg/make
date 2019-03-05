import * as log from '../makelog';

export const PARSE_UNDEFINED_VARIABLE = 105;
export function parseUndefinedVariable(varname: string)
{
    var msg = "Undefined variable " + varname;

    console.error(msg);
    log.fatal(msg);
    process.exit(PARSE_UNDEFINED_VARIABLE);
}
