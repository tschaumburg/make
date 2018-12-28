import { Target } from "./targets";
import { IParseResult } from "./result";

export interface IParseResultBuilder
{
    startRule(
        location: IParseLocation,
        dirname: string,
        targets0: string[],
        targets1: string[],
        targets2: string[],
        targets3: string[],
        inlineRecipe: string
    ): void;
    recipeLine(line: string): void;
    endRule(): void;
    vpathDirective(vpaths: string[]): void;
    defineSimpleVariable(name: string, value: string): void;
    defineRecursiveVariable(name: string, value: string): void;
    defineRecursiveVariableIf(name: string, value: string): void;
    expandVariable(value: string): string;
    setDefaultTarget(val: Target): void;
    clearDefaultTarget(): void;
    build(): IParseResult;
}

export interface IParseContext
{
    vpath: string[];
}

export interface IParseLocation
{
    filename: string;
    lineNo: number;
    colNo: number;
}
