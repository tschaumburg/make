import { ExplicitRule } from "./explicit-rule";
import { ImplicitRule } from "./implicit-rule";
import { StaticPatternRule } from "./static-pattern-rule";
import { BaseRule } from "./base-rule";
import { ITargetName, ITarget, ITargetPattern, IBaseRule } from "../../../result";

export interface IRuleSet
{
    readonly defaultTarget: ITargetName;
    clearDefaultTarget(): void;
    readonly explicitRules: ExplicitRule[];
    readonly implicitRules: ImplicitRule[];
    readonly staticPatternRules: StaticPatternRule[];
    addRule(
        targets: ITarget[],
        prerequisites: ITarget[],
        targetPattern: ITargetPattern,
        prereqPattern: ITarget[],
        orderOnlies: ITarget[],
        inlineRecipe: string,
        isTerminal: boolean
    ): IBaseRule;
    addExplicitRule(
        targets: ITarget[], 
        prerequisites: ITarget[],
        orderOnlies: ITarget[],
        inlineRecipe: string,
        isTerminal: boolean
    ): BaseRule;
    addImplicitRule(
        targets: ITargetPattern[], // all TargetNames => static rule, all targetPatterns => implicit rule, mixed => error
        prerequisites: ITarget[],
        orderOnlies: ITarget[],
        inlineRecipe: string,
        isTerminal: boolean
    ): BaseRule;
}

