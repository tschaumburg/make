import { IVariableManager } from "../../../variables";
import { ITargetName, IExplicitRule, IImplicitRule, IStaticPatternRule, IParseResult, ISpecialTargets } from "../../result";

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

        for (var propertyname of Reflect.ownKeys(res)) // Object.getOwnPropertyNames(res))
        {
            if (typeof(propertyname) !== 'string')
                continue;

            if (propertyname.toUpperCase() !== propertyname)
                continue;

            let targetName = "." + propertyname;

            let targetPrerequisites = this.getSpecialTarget(targetName); 
            Reflect.set(res, propertyname, targetPrerequisites);
        }
        
        return res;
    }

    private getSpecialTarget(specialTargetName: string): string[]
    {
        let res = new Set<string>();
        for (var xr of this.explicitRules)
        {
            if (xr.targets.some(t => t.relname === specialTargetName))
            {
                xr.prereqs.forEach(pr => res.add(pr.fullname()));
            }
        }

        return Array.from(res.values());
    }
}


class SpecialTargets implements ISpecialTargets
{
    public INTERMEDIATE: string[] = [];    
    public SECONDARY: string[] = [];
    public PRECIOUS: string[] = [];
}