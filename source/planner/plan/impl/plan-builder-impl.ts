import * as path from "path";
import * as exits from "../../../make-errors";
import { IPlan,  IFilePlan, IFileRef, IVirtualPath} from "../plan";
import { IVariableManager } from "../../../variables";
import { ITargetName } from "../../../parser";
import { IPlanBuilder } from "../plan-builder";
import { FileRef } from "./fileref-impl";
import { Action, createPlan } from "./plan-impl";
import { FilePlan } from "./fileplan-impl";

export class PlanBuilder implements IPlanBuilder
{
    private readonly goals: IFilePlan[] = [];
    public addGoal(goal: IFilePlan): void
    {
        this.goals.push(goal);

    }
    private readonly fileplans: { [fullname: string]: FilePlan } = {};

    constructor(
        private readonly basedir: string, 
        private readonly makefileNames: string[],
        private readonly variablemanager: IVariableManager,
        private readonly explicitlyMentionedFiles: string[]
    )
    {
    }

    public getExistingPlan(target: ITargetName): IFilePlan
    {
        return this.fileplans[target.fullname()];
    }
      
    
    public addMultiplan(
        target: ITargetName, 
        otherTargets: ITargetName[], 
        //action: Action, 
        prerequisites: IFilePlan[],
        orderOnly: IFilePlan[],
        recipeSteps: string[],
        vpath: IFileRef
    ): IFilePlan
    {

        for (var _otherTarget of otherTargets)
        {
            //let fileRef = new FileRef(_otherTarget.relname, path.resolve(_otherTarget.basedir, _otherTarget.relname));
            this.addPlan(_otherTarget, prerequisites, orderOnly, recipeSteps, vpath);
        }

        return this.addPlan(target, prerequisites, orderOnly, recipeSteps, vpath);
    }

    private registerFile(target: ITargetName, isIntermediate: boolean): IFileRef
    {
        var targetRef = 
            new FileRef(
                target.relname, 
                path.resolve(target.basedir, target.relname)
            );

        return targetRef
    }
    
    public addPlan(
        target: ITargetName, 
        prerequisites: IFilePlan[], 
        orderOnly: IFilePlan[], 
        recipeSteps: string[],
        vpath: IVirtualPath
    ): IFilePlan
    {
        let t: IFileRef = this.registerFile(target, false);
        let plan = this.fileplans[t.fullname];
        
        let action = 
            new Action(
                prerequisites, 
                orderOnly, 
                recipeSteps
            );

        if (!plan)
        {
            let fileRef = new FileRef(t.orgname, t.fullname);
            plan = new FilePlan(fileRef, action, vpath);
            this.fileplans[target.fullname()] = plan;
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
            exits.parseMultipleRulesForTarget(target.fullname());
        }

        // plan.producedBy.prerequisites.push(...action.prerequisites);
        // plan.producedBy.orderOnly.push(...action.orderOnly);
        // plan.producedBy.recipe.push(...action.recipe);
        addMissing(plan.producedBy.prerequisites, action.prerequisites);
        addMissing(plan.producedBy.orderOnly, action.orderOnly);
        addMissing(plan.producedBy.recipe, action.recipe);

        return plan;
    }

    public addLeafnode(
        target: ITargetName
    ): IFilePlan
    {
        let fileRef = new FileRef(target.relname, target.fullname());
        let plan = new FilePlan(fileRef, null, null);
        this.fileplans[target.fullname()] = plan;
        return plan;
    }

    build(): IPlan 
    {
        return createPlan(this.basedir, this.variablemanager, this.makefileNames, this.goals, this.fileplans);
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