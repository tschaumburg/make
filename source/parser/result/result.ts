import { Target, TargetName } from "./targets";
import { IRuleSet, ExplicitRule, ImplicitRule, StaticPatternRule } from "./rules";
import { IVariableManager } from "../../variables";

export interface IParseResult
{
    readonly basedir: string;
    readonly variablemanager: IVariableManager;
    readonly explicitRules: ExplicitRule[];
    readonly implicitRules: ImplicitRule[];
    readonly staticPatternRules: StaticPatternRule[];
    readonly makefileNames: string[];
    readonly goals: TargetName[];
}

