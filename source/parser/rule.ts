import * as path from 'path';
import * as fs from 'fs';
import { IRule, IPlan, ITarget, IRecipe } from '../imakefile';

export class Rule implements IRule
{
    constructor(
        public readonly target: Target,
        public readonly prerequities: Target[]
    ) { }

    readonly recipe: IRecipe = new Recipe();
    //update(): IPlan
    //{
    //}

    public toString(): string
    {
        return this.target.toString() + ": " + this.prerequities.map(p => p.fullName).join(" ") +
            "\n" + this.recipe.toString();
    }
}

export class Target implements ITarget
{
    constructor(
        public readonly name: string,
        public readonly fullName: string
    )
    {
    }

    private _producedBy: IRule = null;

    setProducedBy(currentRule: Rule): void
    {
        this._producedBy = currentRule;
    }

    producedBy(): IRule
    {
        return this._producedBy;
    }

    public toString(): string
    {
        return path.relative(".", this.fullName);
    }
}

export class Recipe implements IRecipe
{
    public readonly steps: string[] = [];

    public run(): void
    {
        for (var s of this.steps)
        {
           console.log("   " + s);
        }
    }

    public toString(): string
    {
        return "   " + this.steps.join("\n   ") + "\n";
    }
}