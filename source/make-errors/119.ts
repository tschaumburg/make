import * as log from '../makelog';

export const APPLICATION_ERROR_TARGET_VANISHED = 119;
export function targetVanished(targetName: string)
{
    var msg =
        "What?! " +
        "Make just rebuilt " + targetName + " " +
        "- and now it is missing?";

    console.error(msg);
    log.fatal(msg);
    process.exit(APPLICATION_ERROR_TARGET_VANISHED);
}

