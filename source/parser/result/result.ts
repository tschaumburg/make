import { Target, TargetName } from "./targets";
import { IRuleSet, ExplicitRule, ImplicitRule, StaticPatternRule } from "./rules";

export interface IParseResult
{
    readonly basedir: string;
    readonly explicitRules: ExplicitRule[];
    readonly implicitRules: ImplicitRule[];
    readonly staticPatternRules: StaticPatternRule[];
    readonly makefileNames: string[];
    // readonly defaultTarget: TargetName;
    // findTarget(goalName: string): TargetName;
    readonly goals: TargetName[];
}

