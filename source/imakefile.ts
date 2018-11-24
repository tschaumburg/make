export interface IMakefile
{
    readonly makefileNames: string[];
    readonly defaultTarget: string;
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
    readonly isOrderOnly: boolean

    producedBy(): IRule;
    toString(): string;
    timestamp(): number;
}

export interface IRecipe
{
    readonly steps: string[];
    isLocked(): boolean;
    run(): void;

    toString(): string;
}

export interface IPlan
{
    isEmpty(): boolean;
    run(): void;
}