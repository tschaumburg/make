// import * as path from 'path';
// import * as fs from 'fs';
// import { ITarget } from './target';
// import { IRecipe } from './recipe';

// export interface IRule
// {
//     readonly targets: ITarget[];
//     readonly prerequities: ITarget[];
//     readonly recipe: IRecipe;

//     toString(): string;
// }

// export class Recipe implements IRecipe
// {
//     public readonly steps: string[];
//     constructor(_steps?: string[])
//     {
//         this.steps = _steps || [];
//     }

//     private _locked: boolean = false;
//     public isLocked(): boolean
//     {
//         return this._locked;
//     }
//     public lock(): void
//     {
//         this._locked = true;
//     }

//     public run(): void
//     {
//         for (var s of this.steps)
//         {
//            console.log("   " + s);
//         }
//     }

//     public toString(): string
//     {
//         return "   " + this.steps.join("\n   ") + "\n";
//     }
// }