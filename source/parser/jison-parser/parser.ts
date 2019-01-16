import * as exits from '../../return-codes';
import * as log from '../../makelog';
import * as fs from 'fs';
import * as path from 'path';
import { IParseResultBuilder } from '../result';
import * as mfparser from "./makefile-syntax/makefile-syntax";
import { createParser } from './makefile-syntax/index';

export function parsefile(
    resultBuilder: IParseResultBuilder,
    makefilename: string
): void
{
    makefilename = path.resolve(process.cwd(), makefilename);
    let content = fs.readFileSync(makefilename, 'utf8') + '\n';

    log.info("Parsing " + makefilename);
 
    resultBuilder.startMakefile(makefilename);

    var _parser = createParser(makefilename, resultBuilder, parsefile);
    _parser.parse(content);
    
    resultBuilder.endRule();
}
