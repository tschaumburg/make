const path = require('path');
import * as fs from 'fs';
import { Makefile } from "./makefile";
import { IMakefile } from '../imakefile';

export function parse(makefilename: string, importedVariables: { [name: string]: string }): IMakefile
{
    console.log("Parsing " + makefilename);

    if (!importedVariables)
        importedVariables = process.env;
    var parser = new Parser(makefilename, importedVariables);

    return parser.parse();
}

class Parser
{
    private readonly _makefile: Makefile;
    private readonly _makefileName: string;
    constructor(makefileName: string, importedVariables: { [name: string]: string })
    {
        this._makefileName = path.normalize(makefileName);
        this._makefile = new Makefile(makefileName, importedVariables);

        this.initializeParser();
    }


    public parse(): Makefile
    {
        let content = fs.readFileSync(this._makefileName, 'utf8');
        content = content.replace("\\\r\n", "").replace("\\\n\r", "").replace("\\\n", "");
        var lines = content.split(/\r?\n/);

        for (var lineNo in lines)
        {
            var line = lines[lineNo];
            try
            {
                this.parseLine(line);
            } catch (reason)
            {
                console.error("Error in line\n   (" + lineNo + "): " + line);
                throw reason;
            }
        }

        return this._makefile
    }

    private parseIncluded(includedFile: string): IMakefile
    {
        includedFile = this._makefile.expandVariable(includedFile);
        includedFile = path.resolve(this._makefile._makefileDir, includedFile);
        var importedvariables = this._makefile.variables;

        return parse(includedFile, importedvariables);
        //    console.log("STEP included " + includedFile);
        //    var includedTargets = [];
        //    try
        //    {
        //        includedTargets = parseFile(includedFile);
        //        console.log("PARSED");
        //    } catch (reason)
        //    {
        //        console.error(reason);
        //    }

        //    if (includedTargets && includedTargets.targets)
        //        includedTargets.targets.forEach((t) => targets.push(t));
        //}
    }

    private parseLine(line: string): void
    {
        //console.log("line " + line);
        var parsed = false;
        for (var pattern of this.patterns)
        {
            parsed = pattern(line) || parsed;
        }

        if (!parsed)
            throw new Error("Lime did not match Makefile syntax: " + line);
    }
    private patterns: ((line: string) => boolean)[] = [];
    private pattern(regex: RegExp, onMatch: (groups: string[]) => void): void
    {
        this.patterns.push(
            (line: string) =>
            {
                var parts = line.match(regex);
                if (!!parts)
                {
                    //console.log("  matched by " + JSON.stringify(regex.source, null, 3));
                    //console.log("  " + JSON.stringify(parts, null, 3));
                    onMatch(parts);
                    return true;
                }

                return false;
            }
        )
    }

    private initializeParser(): void
    {
        this.pattern(
            /^\s*$/,
            (matches: string[]) => { }
        );

        this.pattern(
            /^\s*#.*$/,
            (matches: string[]) => { }
        );

        this.pattern(
            /^(\w+)\s*=\s*"([^"]*)"/,
            (matches: string[]) => this._makefile.defineRecursiveVariable(matches[1], matches[2])
        );

        this.pattern(
            /^include\s+([^\s]+)[\s\t]*$/,
            (matches: string[]) => this._makefile.includeMakefile(this.parseIncluded(matches[1]))
        );

        // TARGET : PREREQUISITE PREREQUISITE ...
        // (see https://stackoverflow.com/a/3537914/5303042 for the repeating PREREQUISITE match)
        this.pattern(
            /^([^\s:]+)\s*:\s*((\S*\s*)*)\s*$/,
            (matches: string[]) => this._makefile.startRule(matches[1], splitPrereqs(matches[2]))
        );

        this.pattern(
            /^[\s\t]+([^\s\t].*)/,
            (matches: string[]) => this._makefile.recipeLine(matches[1])
        );
    }

}

function splitPrereqs(src: string): string[]
{
    //console.log("splitting " + src);
    var res = src.split(/\s+/).filter(s => !!s);
    //console.log("   ...into " + JSON.stringify(res));
    return res;
}