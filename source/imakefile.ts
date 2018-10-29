export interface IMakefile
{
    readonly rules: IRule[];

    findTarget(name: string): ITarget;

    toString(): string;
}

export interface IRule
{
    readonly target: ITarget;
    readonly prerequities: ITarget[];
    readonly recipe: IRecipe;

    toString(): string;
}

export interface ITarget
{
    readonly fullName: string;
    readonly name: string;

    producedBy(): IRule;
    toString(): string;
}

export interface IRecipe
{
    readonly steps: string[];
    run(): void;

    toString(): string;
}

export interface IPlan
{
    run(): void;
}