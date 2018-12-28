import * as fs from 'fs';
// import { ExplicitRule, TargetPattern, Target, TargetName, Recipe } from "../parser/result";
import * as exits from "../../return-codes";
import { IPlan, IFileRef, IAction, IFilePlan } from "./plan";
// import { ExplicitRuleHandler } from "./explicit-rule-handler";
// import { FileRefHandler } from "./file-ref-handler";

export function createPlan(
    basedir: string, 
    makefileNames: string[], // fullnames!
    goals: IFilePlan[],
    filerefs: { [fullname: string]: FilePlan }
): IPlan
{
    return new Plan(basedir, makefileNames, goals, filerefs);
}

class Plan implements IPlan
{
    constructor(
        public readonly basedir: string, 
        public readonly makefileNames: string[], // fullnames!
        public readonly goals: IFilePlan[],
        private readonly filerefs: { [fullname: string]: FilePlan }
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

export class FileRef implements IFileRef
{
    constructor(
        public readonly orgname: string,
        public readonly fullname: string
    ){}
    public timestamp(): number
    {
        return timestamp(this.fullname);
    }
}

export class FilePlan implements IFilePlan 
{
    constructor(
        public readonly file: FileRef,
        public producedBy: Action,
        public readonly vpath: FileRef
    ) {};
}

export  class Action implements IAction
{
    constructor(
        public readonly prerequisites: FilePlan[],
        public readonly orderOnly: FilePlan[],
        public readonly recipe: string[]
    ){}
}


function timestamp(fullName: string): number
{
    let res = -1;

    if (!fullName)
    {
        res = 0;
    }
    else if (!fs.existsSync(fullName))
    {
        //if (fullName.endsWith(".h"))
        //    throw new Error(fullName + " missing");

        res = 0;
    }
    else 
    {
        res = fs.statSync(fullName).mtimeMs;;
    }

    return res;
}
