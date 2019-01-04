import * as path from "path";
import * as glob from "glob";
import * as exits from "../../return-codes";
import * as log from '../../makelog';
import { IPlan, IFileRef, IFilePlan} from "./plan";
import { FileRef, Action, createPlan, FilePlan } from "./plan-impl";
import { IParseResult } from "../../parser/result";
import { resolve } from "dns";

export interface IPlanBuilder
{
    // expandTarget(src: TargetName, producedBy: Action): IFileRef[];
    // findFile(filename: string): IFileRef
    addPlan(target: IFileRef, action: Action, vpath: FileRef): IFilePlan,
    build(): IPlan
}


export class PlanBuilder implements IPlanBuilder
{
    readonly goals: IFilePlan[] = [];
    private readonly fileplans: { [fullname: string]: FilePlan } = {};

    constructor(private readonly basedir: string, private readonly makefileNames: string[])
    {
    }
    
    public addPlan(target: IFileRef, action: Action, vpath: FileRef): IFilePlan
    {
        let plan = this.fileplans[target.fullname];
        
        if (!plan)
        {
            let fileRef = new FileRef(target.orgname, target.fullname);
            plan = new FilePlan(fileRef, action, vpath);
            this.fileplans[target.fullname] = plan;
            return plan;
        }

        if (!plan.producedBy)
        {
            plan.producedBy = action;
            return plan;
        }

        if (!action)
        {
            return plan;
        }

        if (action.recipe.length > 0 && plan.producedBy.recipe.length > 0)
        {
            exits.parseMultipleRulesForTarget(target.fullname);
        }

        // plan.producedBy.prerequisites.push(...action.prerequisites);
        // plan.producedBy.orderOnly.push(...action.orderOnly);
        // plan.producedBy.recipe.push(...action.recipe);
        addMissing(plan.producedBy.prerequisites, action.prerequisites);
        addMissing(plan.producedBy.orderOnly, action.orderOnly);
        addMissing(plan.producedBy.recipe, action.recipe);

        return plan;
    }


    build(): IPlan 
    {
        return createPlan(this.basedir, this.makefileNames, this.goals, this.fileplans);
    }

    public existingPlan(filename: string): IFilePlan
    {
        return this.fileplans[filename];
    }
}

function addMissing<T>(target: T[], candidates: T[]): void
{
    for (var c of candidates)
    {
        if (target.findIndex((t) => t===c) < 0)
        {
            target.push(c);
        }
    }
}