import * as log from '../makelog';

export const ERROR_NO_MAKEFILE = 111;
export function errorNoMakefile(filename: string)
{
    var msg =
        "Cannot find makefile '" + filename +"'";
    console.error(msg);
    log.fatal(msg);
    process.exit(ERROR_NO_MAKEFILE);
}
