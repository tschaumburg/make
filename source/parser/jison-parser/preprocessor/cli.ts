// #!/usr/bin/env node
// import * as log from '../../../makelog';
// import * as exits from '../../../return-codes';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as options from '../../../options';
// import { IVariableManager, createVariablemanager } from './variable-manager';
// import * as preprocessor from "./preprocessor";
// import { IPreprocessorContext } from './preprocessor-context';

// options.init();
// log.init();

// let makefilename = options.makefile;
// if (fs.existsSync(makefilename) == false)
//     exits.errorNoMakefile(makefilename);

// let variableManager = createVariablemanager(process.env);

// console.log(preprocessFile(variableManager, options.makefile));

// export function preprocessFile(
//     variableManager: IVariableManager,
//     makefilename: string
// ): string
// {
//     // makefilename = path.normalize(makefilename);
//     makefilename = path.resolve(process.cwd(), makefilename);
//     log.info("Preprocessing " + makefilename);

//     let context: IPreprocessorContext =
//         {
//             basedir: path.dirname(makefilename),
//             makefilename: path.basename(makefilename),
//             variableManager: variableManager,
//         };

//     // variableManager.startMakefile(makefilename);

//     var _preprocessor = new preprocessor.Parser();
//     _preprocessor.lexer.options.flex = false;
//     _preprocessor.yy.preprocessorContext = context;

//     let content = fs.readFileSync(makefilename, 'utf8');
//     return "" + _preprocessor.parse(content);
// }

// function debugParseErrorHandler(err, hash) 
// {
//     //console.error(hash.token + ": '" + hash.text + "'");
// };

// log.flush();

