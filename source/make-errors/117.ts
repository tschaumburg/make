import * as log from '../makelog';

export const STATIC_PATTERN_RULE_TARGETPATTERN_NOT_PATTERN = 117;
export function staticPatternRuleTargetPatternNotPattern()
{
    var msg =
        "Only targets containing '%' are allowed in the targetPattern tern of\n" +
        "a static pattern rule\n" +
        "   A static pattern rule is of the form\n" +
        "  \n" +
        "      targets:targetpattern:prerequisites|orderOnlies...\n" +
        "  \n" +
        "   where\n" +
        "      targetPattern: (required) single non-blank target pattern names\n" +
        "";
    console.error(msg);
    log.fatal(msg);
    process.exit(STATIC_PATTERN_RULE_TARGETPATTERN_NOT_PATTERN);
}

