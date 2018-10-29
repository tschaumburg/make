import { IMakefile, IRecipe, IPlan } from "../imakefile";
import { runRecipe } from "./run-recipe";

export class Plan implements IPlan
{
    private readonly plannedSteps: IRecipe[] = [];

    public addStep(step: IRecipe): boolean
    {
        if (this.plannedSteps.indexOf(step) >= 0)
            return false;

        this.plannedSteps.push(step);
        return true;
    }

    async run(): Promise<void>
    {
        for (var recipe of this.plannedSteps)
        {
            await runRecipe(recipe)
        }
    }
}