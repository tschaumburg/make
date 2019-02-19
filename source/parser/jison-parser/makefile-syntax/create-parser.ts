import * as path from 'path';
import * as jison from "./makefile-syntax";
import { IParseResultBuilder } from "../../result";
import { IParserContext, setContext } from "./parser-context";

export function createParser(
    makefilename: string, 
    resultBuilder: IParseResultBuilder,
    parsefile: (resultBuilder: IParseResultBuilder, makefilename: string) => void
): any
{
    let context: IParserContext =
        {
            makefilename: makefilename,
            basedir: path.dirname(makefilename),
            resultBuilder: resultBuilder,
            include : (f) => { parsefile(resultBuilder, f);},
        };

    var _parser = new jison.Parser();
    _parser.lexer.options.flex = false;
    _parser.lexer.options.multiline = true;
    setContext(_parser.yy, context);

    return _parser;
}
