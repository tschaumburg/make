import * as log from '../makelog';

export const UNKNOWN_RULE_TYPE = 118;
export function unknownRuleType(rulesnippet: string)
{
    var msg =
        "Unknown rule form:\n" +
        "   " + rulesnippet.trim().replace(/\r?\n/, "\n   ") + "\n" +
        "\n" +
        "A rule must be one of the following forms:\n" +
        "   Implicit:       'target-pattern-list:...'\n" + 
        "   Explicit:       'target-name-list:target-name-list...'\n" + 
        "   Static pattern: 'target-name-list:target-pattern-list...'\n" + 
        "";
    console.error(msg);
    log.fatal(msg);
    process.exit(UNKNOWN_RULE_TYPE);
}

