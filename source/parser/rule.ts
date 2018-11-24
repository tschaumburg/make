import * as path from 'path';
import * as fs from 'fs';
import { IRule, IPlan, ITarget, IRecipe } from '../imakefile';

export class Rule implements IRule
{
    constructor(
        public readonly target: Target,
        public readonly prerequities: Target[]
    ) { }

    readonly _recipe: Recipe = new Recipe();
    public get recipe(): IRecipe { return this._recipe; }
    public lockRecipe(): void
    {
        this._recipe.lock();
    }

    public toString(): string
    {
        return this.target /*this.targets.map(t => t.toString()).join(" ")*/ + ": " + this.prerequities.map(p => p.fullName).join(" ") +
            "\n" + this.recipe.toString();
    }
}

export class Target implements ITarget
{
    constructor(
        public readonly name: string,
        public readonly fullName: string,
        public readonly isOrderOnly: boolean
    )
    {
    }

    private _producedBy: IRule = null;

    setProducedBy(currentRule: IRule): void
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

    public timestamp(): number
    {
        let res = -1;

        if (!this.fullName)
        {
            res = 0;
        }
        else if (!fs.existsSync(this.fullName))
        {
            //if (fullName.endsWith(".h"))
            //    throw new Error(fullName + " missing");

            res = 0;
        }
        else 
        {
            res = fs.statSync(this.fullName).mtimeMs;;
        }

        return res;
    }
}

export class Recipe implements IRecipe
{
    public readonly steps: string[] = [];

    private _locked: boolean = false;
    public isLocked(): boolean
    {
        return this._locked;
    }
    public lock(): void
    {
        this._locked = true;
    }

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