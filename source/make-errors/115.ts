import * as log from '../makelog';

export const STATIC_PATTERN_RULE_TARGET_PATTERN_NOT_ALLOWED = 115;
export function staticPatternRuleTargetPatternNotAllowed()
{
    var msg =
        "Only non-pattern targets allowed in the 'targets' term of a static\n" +
        "pattern rule\n" +
        "\n" +
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
    process.exit(STATIC_PATTERN_RULE_TARGET_PATTERN_NOT_ALLOWED);
}

