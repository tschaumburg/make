import * as log from '../makelog';

export const STATIC_PATTERN_RULE_MISSING_TARGETS = 114;
export function staticPatternRuleMissingTargets()
{
    var msg =
        "Missing targets in static pattern rule\n" +
        "  \n" +
        "   A static pattern rule is of the form\n" +
        "  \n" +
        "      targets:pattern:prerequisites|orderOnlies...\n" +
        "  \n" +
        "   where\n" +
        "      targets:       (required) list of one or more (non-pattern)\n" +
        "                     target names\n" +
        "";
    console.error(msg);
    log.fatal(msg);
    process.exit(STATIC_PATTERN_RULE_MISSING_TARGETS);
}

