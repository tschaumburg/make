import * as log from '../makelog';

export const APPLICATION_ERROR_REDEFINING_TARGET = 112;
export function applicationErrorRedefiningTarget(targetname: string)
{
    var msg =
        "Application Error: attempting to redefine rule for target '" + targetname +"'";
    console.error(msg);
    log.fatal(msg);
    process.exit(APPLICATION_ERROR_REDEFINING_TARGET);
}

