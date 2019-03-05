import * as log from '../makelog';

export const RULE_MISSING_TARGET = 101;
export function ruleMissingTarget()
{
    var msg = "Rule must contain at least one target";

    console.error(msg);
    log.fatal(msg);
    process.exit(RULE_MISSING_TARGET);
}
