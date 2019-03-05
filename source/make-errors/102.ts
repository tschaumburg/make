import * as log from '../makelog';

export const PARSE_NO_MATCH = 102;
export function parseNoMatch(line: string, lineNo: number)
{
    var msg = "Error parsing line (" + lineNo + ") " + line;

    console.error(msg);
    log.fatal(msg);
    process.exit(PARSE_NO_MATCH);
}

