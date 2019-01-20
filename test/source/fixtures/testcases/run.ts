import * as path from "path";
import { spawnSync, SpawnSyncOptionsWithStringEncoding } from "child_process";
import { IActualResult } from "../results";
const os = require('os')

function addToPath(
    env: { [key: string]: string | undefined; }, 
    env2: { [key: string]: string | undefined; }, 
    dirname: string
): { [key: string]: string | undefined;}
{
    let res = Object.assign({}, env, env2);
    res["Path"] += path.delimiter + dirname;
    //console.error("Path = " + JSON.stringify(res["Path"]));
    return res;
}

export function run(
    prog: string,
    wd: string,
    env?: { [name: string]: string }
): IActualResult
{
    let binpath = path.resolve(__dirname, "..", "..", "node_modules", ".bin");

    let opts: SpawnSyncOptionsWithStringEncoding =
    {
        stdio: 'pipe',
        cwd: wd,
        env: addToPath(process.env, env, binpath),
        encoding: 'utf8'
    };

    let cmd = 'sh';
    let argsx = ['-c', prog];

    if (process.platform === 'win32')
    {
        cmd = process.env.comspec || 'cmd';
        argsx = ['/d', '/s', '/c', prog];
        opts.windowsVerbatimArguments = true;
    }

    //console.log("Running " + cmd + " " + argsx.join(" "));
    //console.log("from " + wd);
    //console.error("SPAWN " + JSON.stringify(opts.env));
    let child =
        spawnSync(
            cmd,
            argsx,
            opts
        );

    let res = {
        exit: child.status,
        stdout: child.stdout.split(os.EOL),
        stderr: child.stderr.split(os.EOL),
    };

    //console.error("actual2 " + JSON.stringify(res));
    return res;
}
