import { IRecipe } from "../imakefile";
import { spawn } from "child_process";

export async function runRecipe(recipe: IRecipe): Promise<void>
{
    var _this2 = this;

    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { env: this.env, stdio: 'inherit' };

    return new Promise<void>(function (r, errback)
    {
        // coming from https://github.com/npm/npm/blob/master/lib/utils/lifecycle.js#L222
        var sh = 'sh';
        var flags = ['-c'];

        if (process.platform === 'win32')
        {
            sh = process.env.comspec || 'cmd';
            flags = ['/d', '/s', '/c'];
            opts.windowsVerbatimArguments = true;
        }

        var args = flags.concat(recipe.steps);
        _this2.debug('exec:', sh, flags, recipe);
        _this2.silly('env:', opts.env);
        spawn(sh, args, opts).on('error', errback).on('close', function (code: number)
        {
            if (code !== 0)
            {
                _this2.error(recipe);
                return errback(new Error('Recipe exited with code ' + code));
            }

            r();
        });
    });
}