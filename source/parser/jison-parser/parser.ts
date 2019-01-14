import * as exits from '../../return-codes';
import * as log from '../../makelog';
import * as fs from 'fs';
import * as path from 'path';
import * as options from '../../options';
import { IParseResultBuilder } from '../result';
//import { IParseResult, ParseResult } from '../parse-result';

import * as mfparser from "./makefile-syntax/makefile-syntax";
// import * as mfSyntax from "./makefile-syntax";
// import mfSyntax = require("./makefile-syntax");

export function parsefile(
    resultBuilder: IParseResultBuilder,
    makefilename: string
): void
{
    makefilename = path.resolve(process.cwd(), makefilename);
    log.info("Parsing " + makefilename);
 
    let context: IParserContext =
        {
            makefilename: makefilename,
            basedir: path.dirname(makefilename),
            resultBuilder: resultBuilder,
            include : (f) => { parsefile(resultBuilder, f);},
        };

   resultBuilder.startMakefile(makefilename);

    let content = fs.readFileSync(makefilename, 'utf8') + '\n';//.replace("\r", "");
    //console.log("PARSING file " + makefilename + ":\n" + content);
    var _parser = new mfparser.Parser();
    // _parser.yy.preprocessor = 
    //     { 
    //         expandVariables: function (s) { return _parser.yy.resultBuilder.expandVariables(s); } 
    //     }
    _parser.lexer.options.flex = false;
    _parser.lexer.options.multiline = true;
    _parser.yy.makefileParserContext = context;
    // _parser.yy.resultBuilder = resultBuilder;
    // _parser.yy.basedir = basedir;
    // _parser.yy.include = (f) => { parsefile(resultBuilder, f);};
    // _parser.yy.makefilename = path.basename(makefilename);
    _parser.parse(content);
    resultBuilder.endRule();
}

export interface IParserContext
{
    resultBuilder: IParseResultBuilder;
    basedir: string;
    include: (makefilename: string) => void
    makefilename: string;
}

// export interface IJisonResult {
//     parseMakefile(makefileName: string): void;
//     // this.parseFile(makefileName);

//     defineRecursiveVariable(name: string, definition: string): void;
//     defineConditionalVariable(name: string, definition: string): void;
//     defineSimpleVariable(name: string, definition: string): void;

//     //*********************************************
//     //* INCLUDES:
//     //* =========
//     //*  ...
//     //*  include ./subdir/Makefile
//     //*  ...
//     //*********************************************
//     parseIncluded(includedFile: string): void;

//     //private currentRule: {dirName: string, targets: string[], normalPrerequisites: string[], orderOnlyPrerequisites: string[], recipe: string[]} = null;
//     parseStartRule(
//         targetNames: string,
//         normalPrerequisiteNames: string,
//         orderOnlyPrerequisiteNames: string
//     ): void;
//     addRecipeLine(line: string): void;
//     // private endRule()
//     //      this._parseResult.addStaticRule(
//     //         this.currentRule.dirName, 
//     //         this.currentRule.targets, 
//     //         this.currentRule.normalPrerequisites, 
//     //         this.currentRule.orderOnlyPrerequisites,
//     //         this.currentRule.recipe
//     //     );
// }
