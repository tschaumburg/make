import { IVariableManager } from "../../../variables";
import { ITargetName, IExplicitRule, IImplicitRule, IStaticPatternRule, IParseResult } from "../../parse-result";

export class ParseResultImpl implements IParseResult
{
    constructor(
        public readonly basedir: string,
        public readonly variablemanager: IVariableManager,
        // private readonly importedVariables: { [name: string]: string },
        public readonly explicitRules: IExplicitRule[],
        public readonly implicitRules: IImplicitRule[],
        public readonly staticPatternRules: IStaticPatternRule[],
        public readonly makefileNames: string[],
        public readonly goals: ITargetName[]
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

