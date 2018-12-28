import * as exits from '../return-codes';
//const path = require('path');
import * as log from '../makelog';
import * as path from 'path';
import * as fs from 'fs';
import { makefileMissingTarget } from '../return-codes';
import * as options from '../options';
import { stringify } from 'querystring';
import { IParseResultBuilder, TargetName } from './result';
import * as result from './result';
// import { IRuleManager } from '../rules';
import { IParseResult } from './result';
//import { ParseFailure } from './failure';
import * as regexParser from "./regex-parser";

export interface IParser
{
    parse(): IParseResult;
    watch(onChange: () => void): void;
}

export class Parser implements IParser 
{
    private readonly makefilename: string;
    constructor(
        private readonly importedVariables: { [name: string]: string }
    )
    {
        this.makefilename = options.makefile;
        if (fs.existsSync(this.makefilename) == false)
            exits.errorNoMakefile(this.makefilename);

        if (!importedVariables)
            importedVariables = process.env;
    }

    public parse(): IParseResult
    {
        log.info("Parsing Makefile");
        // let parseResult: IParseResult = null;
        // do
        // {
        //     parseResult = parse("Makefile", { ignoreMissingIncludes: true }, process.env);
        // } while (remakeMakefiles(parseResult));

        let basedir = path.dirname(path.resolve(this.makefilename));
        var resultBuilder = result.createResultBuilder(basedir,  this.importedVariables);
        
        for (let autofile of automakefiles().filter(fn => fs.existsSync(fn)))
            parsefile(resultBuilder, autofile);
    
        resultBuilder.clearDefaultTarget();
    
        parsefile(resultBuilder, this.makefilename);
        
        var res =  resultBuilder.build();
        log.info("parse: " + JSON.stringify(res, null, 3));
        return res;
    }

    public watch(onChange: () => void): void {
        throw new Error("Method not implemented.");
    }
}

function automakefiles(): string[]
{
    let mf = process.env['MAKEFILES'];

    if (!!mf)
    {
        return mf.split(/\s+/g).filter(n => n.length>0);
    }

    return [];
}

function parsefile(
    resultBuilder: IParseResultBuilder,
    makefilename: string,
): void
{
    makefilename = path.normalize(makefilename);
    
    regexParser.parsefile(resultBuilder, makefilename);
}
