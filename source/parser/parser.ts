import * as exits from '../return-codes';
//const path = require('path');
import * as log from '../makelog';
import * as path from 'path';
import * as fs from 'fs';
import { ParserBase } from "./parser-base";
import { Makefile } from "./makefile";
import { IMakefile } from '../imakefile';
import { VariableManager } from './variable-manager';
import { makefileMissingTarget } from '../return-codes';
import { MakeOptions } from '../make-options';
import { stringify } from 'querystring';
//import { ParseFailure } from './failure';

function automakefiles(): string[]
{
    let mf = process.env['MAKEFILES'];

    if (!!mf)
    {
        return mf.split(/\s+/g).filter(n => n.length>0);
    }

    return [];
}

export function parse(
    makefilename: string,
    options: MakeOptions,
    importedVariables: { [name: string]: string }
): IMakefile
{
    if (fs.existsSync(makefilename) == false)
        exits.errorNoMakefile(makefilename);

    if (!importedVariables)
        importedVariables = process.env;

    var makefile = new Makefile();
    for (let autofile of automakefiles().filter(fn => fs.existsSync(fn)))
        parsefile(makefile, autofile, options, importedVariables);

    makefile.defaultTarget = null;

    parsefile(makefile, makefilename, options, importedVariables);
    return makefile;
}

function parsefile(
    result: Makefile,
    makefilename: string,
    options: MakeOptions,
    importedVariables: { [name: string]: string }
): void
{
    makefilename = path.normalize(makefilename);
    let makefiledir = path.dirname(makefilename);

    log.info("Parsing " + makefilename);

    var parser = new Parser(result, options, makefiledir);
    parser.parseMakefile(makefilename);
}

class Parser extends ParserBase
{
    constructor(
        private readonly _makefile: Makefile,
        private readonly options: MakeOptions,
        private readonly dirName: string
    )//, importedVariables: { [name: string]: string })
    {
        super(_makefile.variables);
        this.initializeParser();
    }


    public parseMakefile(makefileName: string): void
    {
        makefileName = path.normalize(makefileName);

        if (this._makefile.makefileNames.indexOf(makefileName) < 0)
            this._makefile.makefileNames.push(makefileName);

        if (!fs.existsSync(makefileName) && this.options && this.options.ignoreMissingIncludes)
            return;

        this.parseFile(makefileName);
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
            (matches: string[]) => this.variableManager.defineRecursiveVariable(matches[1], matches[2])
        );
        this.addPattern(
            /^(\S[^:?=\s]*)\s*?=\s*(.*)$/,
            (matches: string[]) => this.variableManager.defineRecursiveVariableIf(matches[1], matches[2])
        );
        this.addPattern(
            /^(\S[^:=?\s]*)\s*:?:=\s*(.*)$/,
            (matches: string[]) => this.variableManager.defineSimpleVariable(matches[1], matches[2])
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
                    this.parseIncluded(matches[1]);
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
        this.addPattern(
            /^([^\:]*):([^|]*)(|.*)?(#.*)?$/,
            (matches: string[]) => this.parseStartRule(matches[1], this.removeComment(matches[2]), this.removeComment(matches[3]))
        );

        this.addPattern(
            /^[\s\t]+([^\s\t].*)/,
            (matches: string[]) => this._makefile.recipeLine(matches[1])
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

    private parseStartRule(
        targetNames: string,
        normalPrerequisiteNames: string,
        orderOnlyPrerequisiteNames: string
    )
    {
        var targets = this.splitTargets(targetNames);
        var normalPrerequisites = this.splitTargets(normalPrerequisiteNames);
        var orderOnlyPrerequisites = this.splitTargets(orderOnlyPrerequisiteNames);

        return this._makefile.startRule(this.dirName, targets, normalPrerequisites, orderOnlyPrerequisites);
    }

    private parseIncluded(includedFile: string): void 
    {
        includedFile = this.variableManager.expandVariable(includedFile);
        includedFile = path.resolve(this.dirName, includedFile);
        log.info("INCLUDE " + includedFile);

        //let sharedVariables = this._makefile.variables;
        //let sharedTargets = this._makefile.targets;
        //let sharedRules = this._makefile.rules;

        //return parse(includedFile, sharedVariables);
        var subParser = new Parser(this._makefile, this.options, this.dirName);// this.sharedVariables, sharedTargets, sharedRules);

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
}
