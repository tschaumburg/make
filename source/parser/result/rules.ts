import { ITargetName, ITargetPattern, ITarget } from "./targets";
import { IRecipe } from "./recipe";

export interface IBaseRule
{
    readonly recipe: IRecipe;
    readonly isTerminal: boolean;
}

export interface IExplicitRule extends IBaseRule
{
        readonly targets: ITargetName[], // must all be explicit
        readonly prereqs: ITargetName[], // must all be explicit
        readonly orderOnly: ITargetName[], // must all be explicit
}

export interface IImplicitRule extends IBaseRule
{
    readonly targetPatterns: ITargetPattern[]; // must all be pattern
    readonly prereqPatterns: ITarget[]; // either explicit or patern
    readonly orderOnlyPatterns: ITarget[]; // either explicit or patern
}

export interface IStaticPatternRule extends IBaseRule
{
    readonly targets: ITargetName[]; // must all be explicit
    readonly targetPattern: ITargetPattern; // must all be pattern
    readonly prereqPatterns: ITarget[]; // either explicit or patern
    readonly orderOnlyPatterns: ITarget[]; // either explicit or patern
}
