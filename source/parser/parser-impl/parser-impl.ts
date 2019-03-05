import * as fs from 'fs';
import * as path from 'path';
import * as exits from '../../make-errors';
import * as log from '../../makelog';
import * as options from '../../options';
import { IParser } from '../parser';
import { IParseResult } from '../parse-result';
import * as builder from './result-builder';
import { parsefile } from './jison/parse';
import * as jison from './jison';
import { OutgoingMessage } from 'http';

export function create(importedVariables: { [name: string]: string }): IParser
{
    return new ParserImpl(importedVariables);
}
class ParserImpl implements IParser 
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
        log.info("Parse phase begin...");
        // let parseResult: IParseResult = null;
        // do
        // {
        //     parseResult = parse("Makefile", { ignoreMissingIncludes: true }, process.env);
        // } while (remakeMakefiles(parseResult));

        let basedir = path.dirname(path.resolve(this.makefilename));
        var resultBuilder = builder.create({ basedir: basedir, importedVariables: this.importedVariables});
        
        log.info("Processing automakefiles");
        for (let autofile of automakefiles().filter(fn => fs.existsSync(fn)))
            _parsefile(resultBuilder, autofile);

        log.info("Done processing automakefiles");
    
        resultBuilder.clearDefaultTarget();
    
        log.info("Parsing " + this.makefilename);
        _parsefile(resultBuilder, this.makefilename);
        log.info("Done parsing " + this.makefilename);
        
        var res =  resultBuilder.build();
        log.info("parse: " + JSON.stringify(res, null, 3));
        log.info("Parse phase end");
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

function _parsefile(
    resultBuilder: builder.IParseResultBuilder,
    makefilename: string,
): void
{
    makefilename = path.normalize(makefilename);
    
    // regexParser.parsefile(resultBuilder, makefilename);
    parsefile(resultBuilder, makefilename);
}
