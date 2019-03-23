import * as log from '../makelog';

export const PARSE_UNEXPECTED_EXCEPTION = 104;
export function parseUnexpectedException(details: string, line: string, lineNo: number)
{
    var msg = "Unexpected exception in line\n(" + lineNo + ") " + line + "\n" + details;

    console.error(msg);
    log.fatal(msg);
    process.exit(PARSE_UNEXPECTED_EXCEPTION);
}
