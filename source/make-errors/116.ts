import * as log from '../makelog';

export const STATIC_PATTERN_RULE_MISSING_PATTERN = 116;
export function staticPatternRuleMissingPattern()
{
    var msg =
        "Missing targetPattern in static pattern rule\n" +
        "   A static pattern rule is of the form\n" +
        "  \n" +
        "      targets:targetpattern:prerequisites|orderOnlies...\n" +
        "  \n" +
        "   where\n" +
        "      targetPattern: (required) single non-blank target pattern names\n" +
        "";
    console.error(msg);
    log.fatal(msg);
    process.exit(STATIC_PATTERN_RULE_MISSING_PATTERN);
}

