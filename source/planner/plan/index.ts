export { IPlan} from "./plan";
export { IFilePlan} from "./file-plan";
export { IAction} from "./action";
export { IFileRef} from "./file-ref";
export { IPlanBuilder} from "./plan-builder";
export { createPlanBuilder} from "./impl/plan-builder-impl";

// import { PlanBuilder } from "./impl/plan-builder-impl";
// import { IVariableManager } from "../../variables";
// import { IPlanBuilder } from "./plan-builder";

// export function createPlanBuilder(
//     basedir: string, 
//     makefileNames: string[], 
//     variablemanager: IVariableManager, 
//     explicitlyMentionedFiles:string[]
// ): IPlanBuilder
// {
//     let builder = 
//         new PlanBuilder(
//             basedir, 
//             makefileNames, 
//             variablemanager,
//             explicitlyMentionedFiles
//         );

//     return builder;
// }