// import * as fs from 'fs';
// import { ExplicitRule, TargetPattern, Target, TargetName, Recipe } from "../parser/result";
import { IPlan, IAction, IFilePlan } from "../plan";
import { IVariableManager } from '../../../variables';

export function createPlan(
    basedir: string, 
    variablemanager: IVariableManager,
    makefileNames: string[], // fullnames!
    goals: IFilePlan[],
    filerefs: { [fullname: string]: IFilePlan }
): IPlan
{
    return new Plan(basedir, variablemanager, makefileNames, goals, filerefs);
}

class Plan implements IPlan
{
    constructor(
        public readonly basedir: string, 
        public readonly variablemanager: IVariableManager,
        public readonly makefileNames: string[], // fullnames!
        public readonly goals: IFilePlan[],
        private readonly filerefs: { [fullname: string]: IFilePlan }
    ){} 
    
    getFilePlan(fullname: string): IFilePlan
    {
        //console.error("Resolving fullname = " + JSON.stringify(fullname));
        return this.filerefs[fullname];
    }

    // {
    //     this._explicitRuleHandler = new ExplicitRuleHandler(rules.explicitRules, this._fileRefHandler);
    // }
    // public importPatternRule(
    //     targets: TargetName[], 
    //     targetPattern: TargetPattern, 
    //     prereqPatterns: Target[], 
    //     orderOnlyPatterns: Target[], 
    //     recipe: Recipe
    // ): void 
    // {
    //     let self = this;

    //     for (let target of targets)
    //     {
    //         let stem = targetPattern.match(target.name);
    //         if (!stem)
    //         {
    //             exits.warnStaticPatternMismatch(target.name, targetPattern.name);
    //             continue;
    //         }

    //         let prereqs = prereqPatterns.map(p => p.expand(stem));
    //         let orderOnlies = orderOnlyPatterns.map(p => p.expand(stem));

    //         let prereqFiles = prereqs.map(p => self.registerFile(p));
    //         let orderOnlyFiles = orderOnlies.map(p => self.registerFile(p));

    //         this.createAction(prereqFiles, orderOnlyFiles, recipe.steps);
    //     }
    // }
}

export class Action implements IAction
{
    constructor(
        public readonly prerequisites: IFilePlan[],
        public readonly orderOnly: IFilePlan[],
        public readonly recipe: string[]
    ){}
}


// function timestamp(fullName: string): number
// {
//     let res = -1;

//     if (!fullName)
//     {
//         res = 0;
//     }
//     else if (!fs.existsSync(fullName))
//     {
//         //if (fullName.endsWith(".h"))
//         //    throw new Error(fullName + " missing");

//         res = 0;
//     }
//     else 
//     {
//         res = fs.statSync(fullName).mtimeMs;;
//     }

//     return res;
// }
