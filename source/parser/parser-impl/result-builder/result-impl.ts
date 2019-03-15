import { IVariableManager } from "../../../variables";
import { ITargetName, IExplicitRule, IImplicitRule, IStaticPatternRule, IParseResult, ISpecialTargets } from "../../parse-result";

export class ParseResultImpl implements IParseResult
{
    public readonly specialTargets: ISpecialTargets;
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
        this.explicitlyMentionedFiles = this.getMentioned();
        this.specialTargets = this.getSpecialTargets();
        //console.error("Special targets: " + JSON.stringify(this.specialTargets));
    };

    private getMentioned(): string[]
    {
        let mentioned: string[] = [];
        mentioned = mentioned.concat(
            ...this.explicitRules.map(x => x.targets.map(t => t.fullname()))
        );

        mentioned = mentioned.concat(
            ...this.explicitRules.map(x => x.prereqs.map(t => t.fullname()))
        );

        mentioned.concat(
            ...this.explicitRules.map(x => x.orderOnly.map(t => t.fullname()))
        );

        // remove duplicate values:
        return mentioned.filter((el, i, a) => i === a.indexOf(el));
    }

    private getSpecialTargets(): SpecialTargets
    {
        let res = new SpecialTargets();

        for (var targetBasename of Object.getOwnPropertyNames(res))
        {
            if (targetBasename.toUpperCase() !== targetBasename)
            {
                continue;
            }

            let od = Object.getOwnPropertyDescriptor(res, targetBasename);
            if (od.writable !== true)
            {
                continue;
            }

            let targetName = "." + targetBasename;
            od.value = this.getSpecialTarget(targetName);
        }
        
        return res;
    }

    private getSpecialTarget(specialTargetName: string): ReadonlySet<string>
    {
        let res = new Set<string>();
        for (var xr of this.explicitRules)
        {
            if (xr.targets.some(t => t.relname === specialTargetName))
            {
                xr.prereqs.forEach(pr => res.add(pr.fullname()));
            }
        }

        return res;
    }
}


class SpecialTargets implements ISpecialTargets
{
    public INTERMEDIATE: ReadonlySet<string> = new Set<string>();    
    public SECONDARY: ReadonlySet<string> = new Set<string>();;
    public PRECIOUS: ReadonlySet<string> = new Set<string>();;
}