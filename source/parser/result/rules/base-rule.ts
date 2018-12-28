import { Recipe } from "./recipe";

export abstract class BaseRule
{
    readonly recipe: Recipe = new Recipe();
    constructor(inlineRecipe: string)
    {
        if (!!inlineRecipe)
            this.recipe.steps.push(inlineRecipe);
    }
}
