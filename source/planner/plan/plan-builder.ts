import { IPlan, IFilePlan, IAction, IVirtualPath} from "./plan";
import { ITargetName } from "../../parser";

export interface IPlanBuilder
{
    // expandTarget(src: TargetName, producedBy: Action): IFileRef[];
    // findFile(filename: string): IFileRef
    getExistingPlan(target: ITargetName): IFilePlan;
    addGoal(goal: IFilePlan): void;
    addMultiplan(
        target: ITargetName, 
        otherTargets: ITargetName[], 
        prerequisites: IFilePlan[], 
        orderOnly: IFilePlan[], 
        recipeSteps: string[],
        vpath: IVirtualPath
    ): IFilePlan;

    addPlan(
        target: ITargetName, 
        prerequisites: IFilePlan[], 
        orderOnly: IFilePlan[], 
        recipeSteps: string[],
        vpath: IVirtualPath
    ): IFilePlan;

    addLeafnode(
        target: ITargetName
    ): IFilePlan;
    build(): IPlan;
}
