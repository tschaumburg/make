import * as log from '../makelog';

export const RULE_UNKNOWN_TARGET = 109;
export function ruleUnknownTarget(targetName: string, fullname: string)
{
    var msg =
        "Target " + targetName +
        " (" + fullname + ")" +
        " does not exist, and there's no rule to build it";
    console.error(msg);
    log.fatal(msg);
    process.exit(RULE_UNKNOWN_TARGET);
}
