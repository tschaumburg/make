import * as exits from '../../return-codes';
//const path = require('path');
import * as log from '../../makelog';
import * as path from 'path';
import * as options from '../../options';
import * as fs from 'fs';
import { stringify } from 'querystring';
import { IParseResultBuilder } from '../result';
import { ParserBase } from './parser-base';

export function parsefile(
    result: IParseResultBuilder,
    makefilename: string
): void
{
    makefilename = path.normalize(makefilename);
    let makefiledir = path.dirname(makefilename);

    log.info("Parsing " + makefilename);

    var parser = new Parser(result, makefiledir);
    parser.parseMakefile(makefilename);
}

class Parser extends ParserBase
{
    constructor(
        private readonly _parseResult: IParseResultBuilder,
        // private readonly options: MakeOptions,
        private readonly dirName: string
    )//, importedVariables: { [name: string]: string })
    {
        super();
        this.initializeParser();
    }


    public parseMakefile(makefileName: string): void
    {
        makefileName = path.normalize(makefileName);

        // if (this._makefile.makefileNames.indexOf(makefileName) < 0)
        //     this._makefile.makefileNames.push(makefileName);

        if (!fs.existsSync(makefileName) &&  options.ignoreMissingIncludes)
            return;

        this.parseFile(makefileName);

        this._parseResult.endRule();
    }

    protected initializeParser(): void
    {
        //*********************************************
        //* EMPTY LINES:
        //* ============
        //* Accepted and ignored
        //*********************************************
        this.addPattern(
            /^\s*$/,
            (matches: string[]) => { }
        );

        //*********************************************
        //* WHOLE-LINE COMMENTS:
        //* ====================
        //*  # accepted and ignored
        //*********************************************
        this.addPattern(
            /^\s*#.*$/,
            (matches: string[]) => { }
        );

        //*********************************************
        //* ONE-LINE VARIABLE DEFINITIONS:
        //* ============================== 
        //*  variable = ....
        //*  variable ?= ....
        //*  variable := ....
        //*  variable ::= ....
        //*********************************************
        this.addPattern(
            /^(\S[^:?=\s]*)\s*=\s*(.*)$/,
            (matches: string[]) => this._parseResult.defineRecursiveVariable(matches[1], matches[2])
        );
        this.addPattern(
            /^(\S[^:?=\s]*)\s*?=\s*(.*)$/,
            (matches: string[]) => this._parseResult.defineRecursiveVariableIf(matches[1], matches[2])
        );
        this.addPattern(
            /^(\S[^:=?\s]*)\s*:?:=\s*(.*)$/,
            (matches: string[]) => this._parseResult.defineSimpleVariable(matches[1], matches[2])
        );

        //*********************************************
        //* INCLUDES:
        //* =========
        //*  ...
        //*  include ./subdir/Makefile
        //*  ...
        //*********************************************
        this.addPattern(
            /^include\s+([^\s]+)[\s\t]*$/,
            (matches: string[]) =>
            {
                try 
                {
                    let includedFile = this._parseResult.expandVariable(matches[1]);
                    this.parseIncluded(includedFile);
                }
                catch (reason)
                {
                    exits.parseIncludeFailed(matches[1]);
                }

                //return this._makefile.includeMakefile(included);
            }
        );

        //*********************************************
        //* RULES:
        //* ======
        //*  ...
        //*  target target : prerequisite prerequisite ...
        //*     recipe; recipe
        //*     recipe; recipe
        //*  ...
        //*********************************************
        // (see https://stackoverflow.com/a/3537914/5303042 for the repeating PREREQUISITE match)

        // let namechar = "[^:%\\s\\|]";
        // let colon = "\\s*:\\s*";
        // let pipe = "\\s*\\|\\s*";
        // let target = `${namechar}+`;
        // let targetlist = `${target}(?:\\s*${target})*`;
        // let pattern = `${namechar}*%${namechar}*`;
        // let patternlist = `${pattern}(?:\\s*${pattern})*`;
        // let comment = "\\s*(?:#.*)?";

        // let staticPatternRule = `^${targetlist}${colon}${pattern}${colon}${patternlist}(?:${pipe}${patternlist})?${comment}\$`;
        // console.error(staticPatternRule);

        this.addPattern(
            /^([^\:]*):([^|]*)(|.*)?(#.*)?$/,
            (matches: string[]) => this._parseResult.startRule(
                {filename: "fooboo", lineNo: 123, colNo: 456},
                this.dirName,
                this.splitTargets(matches[1]), 
                this.splitTargets(this.removeComment(matches[2])), 
                this.splitTargets(this.removeComment(matches[3])),
                [],
                null
            )
        );

        this.addPattern(
            /^[\s\t]+([^\s\t].*)/,
            (matches: string[]) => this._parseResult.recipeLine(matches[1])
        );
    }

    private removeComment(src: string): string
    {
        if (!src)
        {
            return src;
        }

        let idx = src.indexOf("#");
        if (idx < 0)
        {
            return src;
        }

        return src.substring(0, idx);
    }

    // private currentRule: {dirName: string, targets: string[], normalPrerequisites: string[], orderOnlyPrerequisites: string[], recipe: string[]} = null;
    // private parseStartRule(
    //     targetNames: string,
    //     normalPrerequisiteNames: string,
    //     orderOnlyPrerequisiteNames: string
    // )
    // {
    //     this.endRule();

    //     var targets = this.splitTargets(targetNames);
    //     var normalPrerequisites = this.splitTargets(normalPrerequisiteNames);
    //     var orderOnlyPrerequisites = this.splitTargets(orderOnlyPrerequisiteNames);

    //     this.currentRule = 
    //     {
    //         dirName: this.dirName, 
    //         targets: targets, 
    //         normalPrerequisites: normalPrerequisites,
    //         orderOnlyPrerequisites: orderOnlyPrerequisites,
    //         recipe: []
    //     }
    // }
    // private recipeLine(line: string)
    // {
    //     if (!this.currentRule)
    //         return;
        
    //     this.currentRule.recipe.push(line);
    // }
    // private endRule()
    // {
    //     if (!this.currentRule)
    //         return;
        
    //     var res =
    //      this._parseResult.addStaticRule(
    //         this.currentRule.dirName, 
    //         this.currentRule.targets, 
    //         this.currentRule.normalPrerequisites, 
    //         this.currentRule.orderOnlyPrerequisites,
    //         this.currentRule.recipe
    //     );

    //     this.currentRule = null;
    //     return res;
    // }

    private parseIncluded(includedFile: string): void 
    {
        includedFile = path.resolve(this.dirName, includedFile);
        log.info("INCLUDE " + includedFile);

        //let sharedVariables = this._makefile.variables;
        //let sharedTargets = this._makefile.targets;
        //let sharedRules = this._makefile.rules;

        //return parse(includedFile, sharedVariables);
        var subParser = new Parser(this._parseResult, this.dirName);// this.sharedVariables, sharedTargets, sharedRules);

        subParser.parseMakefile(includedFile);
        log.info("INCLUDE done " + includedFile);
    }

    private splitTargets(src: string): string[]
    {
        if (!src)
            return [];

        src = src.replace("|", "");

        return src.split(/\s+/).filter(s => !!s);
    }
    
    expandVariable(src: string): string
    {
        return this._parseResult.expandVariable(src);
    }
}
