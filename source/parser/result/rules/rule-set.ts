import { ExplicitRule } from "./explicit-rule";
import { ImplicitRule } from "./implicit-rule";
import { StaticPatternRule } from "./static-pattern-rule";
import { BaseRule } from "./base-rule";
import { IParseContext, IParseLocation } from "../result-builder";
import { TargetName } from "../targets";

export interface IRuleSet
{
    readonly defaultTarget: TargetName;
    clearDefaultTarget(): void;
    readonly explicitRules: ExplicitRule[];
    readonly implicitRules: ImplicitRule[];
    readonly staticPatternRules: StaticPatternRule[];
    addRule(
        location: IParseLocation,
        context: IParseContext,
        dirname: string,
        targets: string[],
        prerequisites: string[],
        targetPattern: string[],
        prereqPattern: string[],
        orderOnlies: string[],
        inlineRecipe: string
    ): BaseRule;
}

