import * as options from "../../../options";
import * as exits from "../../../return-codes";
import { IParseResult } from "../result";
import { Target, TargetName } from "../targets";
import { IRuleSet, createRuleset, ExplicitRule, ImplicitRule, StaticPatternRule } from "../rules";
import { IVariableManager } from "../../../variables";

export class ParseResultImpl implements IParseResult
{
    constructor(
        public readonly basedir: string,
        public readonly variablemanager: IVariableManager,
        // private readonly importedVariables: { [name: string]: string },
        public readonly explicitRules: ExplicitRule[],
        public readonly implicitRules: ImplicitRule[],
        public readonly staticPatternRules: StaticPatternRule[],
        public readonly makefileNames: string[],
        public readonly goals: TargetName[]
        // public readonly defaultTarget: TargetName
    )
    {
        // console.error("defaultTarget = " + JSON.stringify( defaultTarget));
    };

    // public findTarget(goalName: string): TargetName 
    // {
    //     throw new Error("Method not implemented.");
    // }
}

