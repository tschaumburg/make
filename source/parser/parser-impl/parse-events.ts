import { IParseLocation } from "./parse-location";

export interface IParseEvents
{
    startMakefile(fullMakefileName: string): void;
    startRule(
        location: IParseLocation,
        dirname: string,
        targets: string,
        prerequisites: string,
        targetPattern: string,
        prereqPattern: string,
        orderOnlies: string,
        inlineRecipeExpression: string,
        isTerminal: boolean
    ): void;
    isNameList(yy, src: string): boolean;
    isPatternList(yy, src: string): boolean;
    recipeLine(line: string): void;
    endRule(): void;
    vpathDirective(vpaths: string[]): void;
    //defineVariable(kind: string, name: string, value: string): void;
    defineSimpleVariable(name: string, value: string): void;
    defineAppendVariable(name: string, value: string): void;
    defineRecursiveVariable(name: string, value: string): void;
    defineConditionalVariable(name: string, value: string): void;
    defineShellVariable(name: string, value: string): void;
    expandVariables(value: string): string;
    // setDefaultTarget(val: ITarget): void;
    // clearDefaultTarget(): void;
    // build(): IParseResult;
}


