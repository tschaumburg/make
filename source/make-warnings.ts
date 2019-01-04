import * as log from './makelog';

export const PARSE_INCLUDE_FAILED = 103;
export function parseIncludeFailed(includedFile: string)
{
    var msg = "Error including file " + includedFile;

    console.warn(msg);
    log.warning(msg);
    //process.exit(PARSE_INCLUDE_FAILED);
}
