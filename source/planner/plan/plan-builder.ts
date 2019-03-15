import { ITargetName } from "../../parser";
import { IFilePlan } from "./file-plan";
import { IVirtualPath } from "./virtual-path";
import { IPlan } from "./plan";

export interface IPlanBuilder
{
    addGoal(goal: IFilePlan): void;
    getExistingPlan(target: ITargetName): IFilePlan;
    addMultiplan(
        target: ITargetName, 
        otherTargets: ITargetName[], 
        prerequisites: IFilePlan[], 
        orderOnly: IFilePlan[], 
        recipeSteps: string[],
        vpath: string //IVirtualPath
    ): IFilePlan;

    addPlan(
        target: ITargetName, 
        prerequisites: IFilePlan[], 
        orderOnly: IFilePlan[], 
        recipeSteps: string[],
        vpath: string //IVirtualPath
    ): IFilePlan;

    addLeafnode(
        target: ITargetName
    ): IFilePlan;

    build(): IPlan;
}
