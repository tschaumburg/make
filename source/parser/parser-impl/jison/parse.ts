import * as exits from '../../../make-errors';
import * as log from '../../../makelog';
import * as fs from 'fs';
import * as path from 'path';
import * as jison from "./makefile-syntax";
import { preprocess } from './makefile-preprocessor';
import { IParserContext, setContext } from "./makefile-syntax-context";
import { IParseEvents } from '../parse-events';

export function parsefile(
    parseEvents: IParseEvents,
    makefilename: string
): void
{
    makefilename = path.resolve(process.cwd(), makefilename);
    parseEvents.startMakefile(makefilename);

    let content = fs.readFileSync(makefilename, 'utf8') + '\n';
    content = preprocess(content);
    //console.error("preprocessed: " + JSON.stringify(content));

    log.info("Parsing " + makefilename);
 

    var _parser = createParser(makefilename, parseEvents, parsefile);
    log.info("parse():");
    _parser.parse(content);
    
    log.info("endRule():");
    parseEvents.endRule();
    log.info("End parsing " + makefilename);
}

function createParser(
    makefilename: string, 
    listener: IParseEvents,
    parsefile: (resultBuilder: IParseEvents, makefilename: string) => void
): any
{
    var _parser = new jison.Parser();
    _parser.lexer.options.flex = false;
    _parser.lexer.options.multiline = true;

    let context: IParserContext =
        {
            makefilename: makefilename,
            basedir: path.dirname(makefilename),
            resultBuilder: listener,
            include : (f) => { parsefile(listener, f);},
        };
    setContext(_parser.yy, context);

    return _parser;
}
