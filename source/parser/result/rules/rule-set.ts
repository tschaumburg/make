import { ExplicitRule } from "./explicit-rule";
import { ImplicitRule } from "./implicit-rule";
import { StaticPatternRule } from "./static-pattern-rule";
import { BaseRule } from "./base-rule";
import { IParseContext, IParseLocation } from "../result-builder";
import { TargetName, TargetPattern, Target } from "../targets";

export interface IRuleSet
{
    readonly defaultTarget: TargetName;
    clearDefaultTarget(): void;
    readonly explicitRules: ExplicitRule[];
    readonly implicitRules: ImplicitRule[];
    readonly staticPatternRules: StaticPatternRule[];
    addRule(
        targets: TargetName[],
        prerequisites: TargetName[],
        targetPattern: TargetPattern,
        prereqPattern: Target[],
        orderOnlies: Target[],
        inlineRecipe: string
    ): BaseRule;
}

