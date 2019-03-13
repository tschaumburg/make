import { IVariableManager } from "../../../variables";
import { ITargetName, IExplicitRule, IImplicitRule, IStaticPatternRule, IParseResult } from "../../parse-result";

export class ParseResultImpl implements IParseResult
{
    public readonly explicitlyMentionedFiles: string[];
    constructor(
        public readonly basedir: string,
        public readonly variablemanager: IVariableManager,
        // private readonly importedVariables: { [name: string]: string },
        public readonly explicitRules: IExplicitRule[],
        public readonly implicitRules: IImplicitRule[],
        public readonly staticPatternRules: IStaticPatternRule[],
        public readonly makefileNames: string[],
        public readonly goals: ITargetName[]
    )
    {
        let mentioned: string[] = [];
        mentioned.concat(
            ...explicitRules.map(x => x.targets.map(t => t.fullname()))
        );
        mentioned.concat(
            ...explicitRules.map(x => x.prereqs.map(t => t.fullname()))
        );
        // remove duplicate values:
        this.explicitlyMentionedFiles = mentioned.filter((el, i, a) => i === a.indexOf(el));
    };
}

