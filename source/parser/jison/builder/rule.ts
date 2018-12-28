import { IJisonLocation } from "./location";
import { TargetName, asExplicit } from "./target-name";
import { TargetPattern, asPattern } from "./target-pattern";
import { ITarget } from "./target";

export interface IRule
{
    readonly recipeLines: string[];
}

export class ExplicitRule implements IRule
{
    constructor(
        public readonly localtion: IJisonLocation,
        public readonly targets: TargetName[],
        public readonly prerequisites: TargetName[], 
        public readonly orderOnly: TargetName[], 
        public readonly inlineRecipe: string,
        public readonly recipeLines: string[]
    ){}

    public toString(): string
    {
        let tn = this.targets && this.targets.map(t => t.name).join(" ");
        var pr  = this.prerequisites && this.prerequisites.map(t => t.name).join(" ");
        var oo = this.orderOnly && this.orderOnly.map(t => t.name).join(" ");
        var ir = this.inlineRecipe;
    
        let msg = `${tn}: ${pr}`;
        if (oo)
        {
            msg += ` | ${oo}`
        }
        if (ir)
        {
            msg += ` ; ${ir}`
        }

        return msg;
    }
}

export class StaticPatternRule implements IRule
{
    constructor(
        public readonly localtion: IJisonLocation,
        public readonly targets: TargetName[],
        public readonly targetPattern: TargetPattern, 
        public readonly prereqPatterns: ITarget[], 
        public readonly orderOnly: ITarget[], 
        public readonly inlineRecipe: string,
        public readonly recipeLines: string[]
    ){}

    public toString(): string
    {
        let str1 = this.targets && this.targets.map(t => t.name).join(" ");
        let str2 = this.prereqPatterns && this.prereqPatterns.map(t => t.name).join(" ");
        let str3 = this.orderOnly && (" | " + this.orderOnly.map(t => t.name).join(" "));
        let str4 = this.inlineRecipe && (" ; " + this.inlineRecipe);
        return `${str1} : ${this.targetPattern} : ${str2}${str3}${str4}`;
    }
}

export class ImplicitRule implements IRule
{
    constructor(
        public readonly localtion: IJisonLocation,
        public readonly targetPatterns: TargetPattern[], 
        public readonly prereqPatterns: ITarget[], 
        public readonly orderOnly: ITarget[], 
        public readonly inlineRecipe: string,
        public readonly recipeLines: string[]
    ){}

    public toString(): string
    {
        let str1 = this.targetPatterns && this.targetPatterns.map(t => t.name).join(" ");
        let str2 = this.prereqPatterns && this.prereqPatterns.map(t => t.name).join(" ");
        let str3 = this.orderOnly && (" | " + this.orderOnly.map(t => t.name).join(" "));
        let str4 = this.inlineRecipe && (" ; " + this.inlineRecipe);
        return ` ${str1} : ${str2}${str3}${str4}`;
    }
}

export function rule(
    location: IJisonLocation,
    targets0: ITarget[],
    targets1: ITarget[], 
    targets2: ITarget[], 
    targets3: ITarget[], 
    inlineRecipe: string
): IRule
{
    if (!!targets2)
    {
        // Static pattern rule:
        var staticTargets = asExplicit("A static pattern rule", targets0, 1);
        var targetPattern = asPattern("A static pattern rule", targets1, 1, 1)[0];
        return new StaticPatternRule(
            location, 
            staticTargets,
            targetPattern,
            targets2, 
            targets3, 
            inlineRecipe,
            []
        );
    }
    else if (targets0.some(t => t.isPattern()))
    {
        // Implicit pattern rule:
        var targetPatterns = asPattern("An implicit pattern rule", targets0, 1);
        return new ImplicitRule(location, targetPatterns, targets1, targets3, inlineRecipe, [])
    }
    else
    {
        // Explicit ("normal") rule:
        var targets = asExplicit("An explicit rule", targets0, 1);
        var prerequisites = asExplicit("An explicit rule", targets1, 0);
        var orderonly = asExplicit("An explicit rule", targets3, 0);

        return new ExplicitRule(location, targets, prerequisites, orderonly, inlineRecipe, []);
    }
}
