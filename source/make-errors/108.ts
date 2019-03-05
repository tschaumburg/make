import * as log from '../makelog';

export const RECIPE_EXECUTION_ERROR = 108;
export function recipeExecutionError(code: number, cmd: string)
{
    var msg = 'Command \"' + cmd + '\" failed with code ' + code;

    if (code < 0)
        code -= 200;

    console.error(msg);
    log.fatal(msg);
    process.exit(code);
}
