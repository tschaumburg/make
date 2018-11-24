import * as log from '../makelog';
import { IMakefile, IRecipe, IPlan, ITarget } from "../imakefile";
import { runRecipe } from "./run-recipe";

export class Plan implements IPlan
{
    private readonly plannedSteps: PlannedRecipe[] = [];

    public addStep(recipe: IRecipe, target: ITarget, prerequisites: ITarget[]): boolean
    {
        let plannedRecipe =
            new PlannedRecipe(
                recipe,
                target,
                prerequisites || []
            );

        if (this.plannedSteps.findIndex(r => r.equals(plannedRecipe)) >= 0)
            return false;

        this.plannedSteps.push(plannedRecipe);

        return true;
    }

    public isEmpty(): boolean
    {
        //for (var plannedRecipe of this.plannedSteps)
        //{
        //    console.log(plannedRecipe.target.name + "\n    <= " + JSON.stringify(plannedRecipe.prerequisites.map(p => p.fullName)));
        //}

        if (!this.plannedSteps)
            return true;

        if (this.plannedSteps.length == 0)
            return true;

        return false;
    }

    run(): void
    {
        for (var plannedRecipe of this.plannedSteps)
        {
            runRecipe(plannedRecipe.recipe, plannedRecipe.target, plannedRecipe.prerequisites);
        }
    }
}

class PlannedRecipe
{
    constructor(
        readonly recipe: IRecipe,
        readonly target: ITarget,
        readonly prerequisites: ITarget[]
    ) { }

    equals(other: PlannedRecipe): boolean
    {
        if (this.recipe !== other.recipe)
            return false;

        if (this.target !== other.target)
            return false;

        if (this.prerequisites.length !== other.prerequisites.length)
            return false;

        for (let p of this.prerequisites)
        {
            if (other.prerequisites.indexOf(p) < 0)
                return false;
        }
        return true;
    }
}