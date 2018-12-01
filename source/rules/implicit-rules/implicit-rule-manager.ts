import { ImplicitRule } from "./implicit-rule";
import { IRule } from "../rule";
import { ITarget } from "../target";
import { ITargetManager } from "../targets";

export function createManager(targetManager: ITargetManager): IImplicitRuleManager
{
    return new ImplicitRuleManager(targetManager);
}

export interface IImplicitRuleManager
{
    addImplicitRule(
        targetPatterns: string[], 
        prerequisitePatterns: string[], 
        recipe: string[]
    ): void;

    findImplicitRules(dirName: string, targetName: string): IRule[];
}

class ImplicitRuleManager implements IImplicitRuleManager
{
    private readonly implicitRules: ImplicitRule[] = [];
    constructor(private readonly targetManager: ITargetManager)
    {}

    public addImplicitRule(
        targetPatterns: string[], 
        prerequisitePatterns: string[], 
        recipe: string[]
    ): void
    {
        this.implicitRules.push(new ImplicitRule(targetPatterns, prerequisitePatterns, recipe));
    }

    public findImplicitRules(
        dirName: string, 
        targetName: string
    ): IRule[]
    {
        let res: IRule[]=[];
        let matches = new Map<number, {stem: string, rule: ImplicitRule}[]>(); //{[stemLength: number]: {stem: string, rule: ImplicitRule2}[]} = {};
        for (const ir of this.implicitRules)
        {
            for (const stem of ir.stems(targetName))
            {
                let stemLength = stem.length
                let lst = matches[stemLength];
                if (!lst)
                {
                    lst = [];
                    matches[stemLength] = lst;
                }

                lst.push({stem: stem, rule: ir});
            }
        }

        for (const stemLength of Array.from(matches.keys()).sort((a,b) => a-b))
        {
            let lst = matches.get(stemLength);
            for (const match of lst)
            {
                let rule = match.rule.apply(dirName, match.stem, this.targetManager);
                if (!!rule)
                {
                    res.push(rule);
                }
            }
        }

        return res;
    }
}


