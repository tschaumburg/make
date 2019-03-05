import * as log from '../makelog';

export const MAKEFILE_MISSING_TARGET = 107;
export function makefileMissingTarget()
{
    var msg = "Makefile must contain at least one target";

    console.error(msg);
    log.fatal(msg);
    process.exit(MAKEFILE_MISSING_TARGET);
}
