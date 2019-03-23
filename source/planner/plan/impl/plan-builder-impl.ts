import * as path from "path";
import * as exits from "../../../make-errors";
import { IVariableManager } from "../../../variables";
import { ITargetName, ISpecialTargets } from "../../../parser";
import { IPlanBuilder } from "../plan-builder";
import { FileRef } from "./file-ref-impl";
import {  createPlan } from "./plan-impl";
import { FilePlan } from "./file-plan-impl";
import { IFilePlan } from "../file-plan";
import { IFileRef } from "../file-ref";
import { IVirtualPath } from "../virtual-path";
import { IPlan } from "../plan";
import { Action } from "./action-impl";

export function createPlanBuilder(
    basedir: string, 
    makefileNames: string[], 
    variablemanager: IVariableManager, 
    explicitlyMentionedFiles:string[],
    specialTargets: ISpecialTargets
): IPlanBuilder
{
    let builder = 
        new PlanBuilder(
            basedir, 
            makefileNames, 
            variablemanager,
            explicitlyMentionedFiles,
            specialTargets
        );

    return builder;
}
export class PlanBuilder implements IPlanBuilder
{
    private isExplicitlyMentioned(fullname: string): boolean
    {
        return (this.explicitlyMentionedFiles.indexOf(fullname)>=0);
    }

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
        private readonly explicitlyMentionedFiles: string[],
        private readonly specialTargets: ISpecialTargets
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
        vpath: string //IFileRef
    ): IFilePlan
    {

        for (var _otherTarget of otherTargets)
        {
            //let fileRef = new FileRef(_otherTarget.relname, path.resolve(_otherTarget.basedir, _otherTarget.relname));
            this.addPlan(_otherTarget, prerequisites, orderOnly, recipeSteps, vpath);
        }

        return this.addPlan(target, prerequisites, orderOnly, recipeSteps, vpath);
    }

    private registerSourceFile(target: ITargetName): IFileRef
    {
        return this._registerFile(target, true);
    }

    private registerTargetFile(target: ITargetName): IFileRef
    {
        return this._registerFile(target, false);
    }

    private _registerFile(target: ITargetName, isSource: boolean): IFileRef
    {
        let fullname = target.fullname();
        var targetRef = 
            new FileRef(
                target.relname, 
                fullname,
                isSource,
                this.isExplicitlyMentioned(fullname),
                this.specialTargets.INTERMEDIATE.indexOf(fullname) >= 0,
                this.specialTargets.SECONDARY.indexOf(fullname) >= 0,
                this.specialTargets.PRECIOUS.indexOf(fullname) >= 0
            );

        return targetRef
    }
    
    public addPlan(
        target: ITargetName, 
        prerequisites: IFilePlan[], 
        orderOnly: IFilePlan[], 
        recipeSteps: string[],
        vpath: string //IVirtualPath
    ): IFilePlan
    {
        let self = this;
        if (target.relname.startsWith("."))
        {
            let propertyName = target.relname.substr(1);
            let propertyDescriptor = 
                Object.getOwnPropertyDescriptor(this.specialTargets, propertyName);

            if (!!propertyDescriptor)
            {
                let propertyValue = propertyDescriptor.value as Set<string>;
                prerequisites.forEach(p => propertyValue.add(p.file.fullname));
                orderOnly.forEach(p => propertyValue.add(p.file.fullname));
            }
        }
        // if (target.relname === ".INTERMEDIATE")
        // {
        //     prerequisites.forEach(p => self.INTERMEDIATE.add(p.file.fullname));
        //     orderOnly.forEach(p => self.INTERMEDIATE.add(p.file.fullname));
        // }

        let t: IFileRef = this.registerTargetFile(target);
        let plan = this.fileplans[t.fullname];
        
        let action = 
            new Action(
                prerequisites, 
                orderOnly, 
                recipeSteps
            );

        if (!plan)
        {
            let fileRef = t; // new FileRef(t.orgname, t.fullname);
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
        let fileRef = this.registerSourceFile(target);
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