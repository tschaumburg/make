// import * as log from '../makelog';
// import { runRecipe } from "./run-recipe";
// import { IRecipe, ITarget } from '../rules';

// export interface IPlan
// {
//     isEmpty(): boolean;
//     run(): void;
// }

// export class Plan implements IPlan
// {
//     private readonly plannedSteps: PlannedRecipe[] = [];

//     public addStep(recipe: IRecipe, target: ITarget, prerequisites: ITarget[]): boolean
//     {
//         let plannedRecipe =
//             new PlannedRecipe(
//                 recipe,
//                 target,
//                 prerequisites || []
//             );

//         if (this.plannedSteps.findIndex(r => r.equals(plannedRecipe)) >= 0)
//             return false;

//         this.plannedSteps.push(plannedRecipe);

//         return true;
//     }

//     public isEmpty(): boolean
//     {
//         //for (var plannedRecipe of this.plannedSteps)
//         //{
//         //    console.log(plannedRecipe.target.name + "\n    <= " + JSON.stringify(plannedRecipe.prerequisites.map(p => p.fullName)));
//         //}

//         if (!this.plannedSteps)
//             return true;

//         if (this.plannedSteps.length == 0)
//             return true;

//         return false;
//     }

//     run(): void
//     {
//         for (var plannedRecipe of this.plannedSteps)
//         {
//             runRecipe(plannedRecipe.recipe, plannedRecipe.target, plannedRecipe.prerequisites);
//         }
//     }
// }

// class PlannedRecipe
// {
//     constructor(
//         readonly recipe: IRecipe,
//         readonly target: ITarget,
//         readonly prerequisites: ITarget[]
//     ) { }

//     equals(other: PlannedRecipe): boolean
//     {
//         if (this.recipe !== other.recipe)
//             return false;

//         if (this.target !== other.target)
//             return false;

//         if (!listsEqual(this.prerequisites, other.prerequisites))
//             return false;

//         return true;
//     }
// }

// function listsEqual(first: ITarget[], second: ITarget[]): boolean
// {
//     if (first.length !== second.length)
//         return false;

//     for (let p of first)
//     {
//         if (second.indexOf(p) < 0)
//             return false;
//     }
//     return true;
// }