import * as exits from '../../return-codes';
import * as log from '../../makelog';
import * as fs from 'fs';
import * as path from 'path';
import { MakeOptions } from '../../options';
//import { IParseResult, ParseResult } from '../parse-result';


export interface IJisonResult {
    parseMakefile(makefileName: string): void;
    // this.parseFile(makefileName);

    defineRecursiveVariable(name: string, definition: string): void;
    defineRecursiveVariableIf(name: string, definition: string): void;
    defineSimpleVariable(name: string, definition: string): void;

    //*********************************************
    //* INCLUDES:
    //* =========
    //*  ...
    //*  include ./subdir/Makefile
    //*  ...
    //*********************************************
    parseIncluded(includedFile: string): void;

    //private currentRule: {dirName: string, targets: string[], normalPrerequisites: string[], orderOnlyPrerequisites: string[], recipe: string[]} = null;
    parseStartRule(
        targetNames: string,
        normalPrerequisiteNames: string,
        orderOnlyPrerequisiteNames: string
    ): void;
    addRecipeLine(line: string): void;
    // private endRule()
    //      this._parseResult.addStaticRule(
    //         this.currentRule.dirName, 
    //         this.currentRule.targets, 
    //         this.currentRule.normalPrerequisites, 
    //         this.currentRule.orderOnlyPrerequisites,
    //         this.currentRule.recipe
    //     );
}
