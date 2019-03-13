export { IPlan, IFilePlan, IAction, IFileRef} from "./plan";
export {IPlanBuilder} from "./plan-builder";

import { PlanBuilder } from "./impl/plan-builder-impl";
import { IVariableManager } from "../../variables";
import { IPlanBuilder } from "./plan-builder";

export function createPlanBuilder(
    basedir: string, 
    makefileNames: string[], 
    variablemanager: IVariableManager, 
    explicitlyMentionedFiles:string[]
): IPlanBuilder
{
    let builder = 
        new PlanBuilder(
            basedir, 
            makefileNames, 
            variablemanager,
            explicitlyMentionedFiles
        );

    return builder;
}