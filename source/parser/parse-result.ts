import { IVariableManager } from "../variables";
import { IParseLocation } from "./parser-impl/parse-location";
import { TargetName } from "./parser-impl/result-builder/targets/target-name";

export interface IParseResult
{
    readonly basedir: string;
    readonly variablemanager: IVariableManager;
    readonly explicitRules: IExplicitRule[];
    readonly implicitRules: IImplicitRule[];
    readonly staticPatternRules: IStaticPatternRule[];
    /**
     * List all the targets and prerequisites mentioned
     * explicitly in the makefile - this list is used to
     * determine if a file produced by make is an 
     * *intermediate* (which should be deleted when make
     * is done):
     */
    readonly explicitlyMentionedFiles: string[];
    readonly specialTargets: ISpecialTargets;
    readonly makefileNames: string[];
    readonly goals: ITargetName[];
}

export interface ISpecialTargets
{
    readonly INTERMEDIATE: ReadonlySet<string>;
    readonly SECONDARY: ReadonlySet<string>;
    readonly PRECIOUS: ReadonlySet<string>;
}
export interface IParseContext
{
    vpath: string[];
}

export interface ITarget
{
    readonly location: IParseLocation; 
    readonly parseContext: IParseContext;
    readonly basedir: string;
    readonly relname: string;
    isPattern(): boolean;
}

export interface ITargetName extends ITarget
{
    fullname(): string;
}    

export interface ITargetPattern extends ITarget
{
    match(name: ITargetName): IStem;
    expand(stem: IStem): ITargetName;
}

export interface IStem
{
    basedir: string;
    stem: string;
}

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

export interface IRecipe
{
    readonly steps: string[];
}
