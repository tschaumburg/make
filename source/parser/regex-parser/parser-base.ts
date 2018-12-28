import * as exits from '../../return-codes';
const path = require('path');
import * as log from '../../makelog';
import * as fs from 'fs';

export abstract class ParserBase
{
    // protected readonly variableManager: VariableManager;
    constructor()//importedVariables: { [name: string]: string })
    {
        // this.variableManager = new VariableManager(importedVariables);
        this.initializeParser();
    }

    abstract expandVariable(src: string): string;

    protected parseFile(fileName: string): void
    {
        fileName = path.normalize(fileName);
        let content = fs.readFileSync(fileName, 'utf8');

        //log.info("BEFORE:\n" + content);
        //content = content.replace("\\s*\\\r\n\\s*", " ").replace("\\s*\\\n\r\\s*", " ").replace("\\s*\\\n\\s*", " ");
        content =
            content
                .replace(/(\s*\\\r\n\s*)+/g, " ")
                .replace(/(\s*\\\n\r\s*)+/g, " ")
                .replace(/(\s*\\\n\s*)+/g, " ");
        //log.info("AFTER:\n" + content);
        var lines = content.split(/\r?\n/);

        for (let lineNo = 0; lineNo < lines.length; lineNo++)
        {
            let line = lines[lineNo];

            try
            {
                this.parseLine(line, lineNo);
            }
            catch (reason)
            {
                exits.parseUnexpectedException(reason, line, lineNo);
            }
        }
    }

    private parseLine(line: string, lineNo: number): void
    {
        log.info("(" + lineNo + "): " + line)
        var line = this.expandVariable(line);
        //log.info("(" + lineNo + "): " + line)

        for (var pattern of this.patterns)
        {
            if (pattern(line))
                return;
        }

        exits.parseNoMatch(line, lineNo);
    }

    private patterns: ((line: string) => boolean)[] = [];
    protected addPattern(regex: RegExp, onMatch: (groups: string[]) => void): void
    {
        this.patterns.push(
            (line: string) =>
            {
                var parts = line.match(regex);

                if (!parts)
                    return false;

                onMatch(parts);
                return true;
            }
        )
    }

    protected abstract initializeParser(): void;
}
