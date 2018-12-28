// import * as path from 'path';
// import * as fs from 'fs';
// import { IRule } from '../rule';
// import { ITarget } from '../target';
// import { IRecipe, Recipe } from '../recipe';

// export class Rule implements IRule
// {
//     constructor(
//         public readonly targets: ITarget[],
//         public readonly prerequities: ITarget[],
//         recipe?: string[]
//     ) { 
//         this._recipe = new Recipe(recipe);
//     }

//     readonly _recipe: Recipe;
//     public get recipe(): IRecipe { return this._recipe; }
//     public lockRecipe(): void
//     {
//         this._recipe.lock();
//     }

//     public toString(): string
//     {
//         return /*this.target*/ this.targets.map(t => t.toString()).join(" ") + ": " + this.prerequities.map(p => p.fullName).join(" ") +
//             "\n" + this.recipe.toString();
//     }
// }
