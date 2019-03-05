import * as log from '../makelog';

export const RULE_RECIPE_BEFORE_TARGET = 113;
export function ruleErrorPrematureRecipe()
{
    var msg =
        "commands commence before first target.";
    console.error(msg);
    log.fatal(msg);
    process.exit(RULE_RECIPE_BEFORE_TARGET);
}

