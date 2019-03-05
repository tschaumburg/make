import * as log from '../makelog';

export const PARSE_MULTIPLE_RULES_FOR_TARGET = 110;
export function parseMultipleRulesForTarget(targetName: string)
{
    var msg =
        "Target " + targetName +
        " has multiple build rules";
    console.error(msg);
    log.fatal(msg);
    process.exit(PARSE_MULTIPLE_RULES_FOR_TARGET);
}
