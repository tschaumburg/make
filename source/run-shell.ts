import * as path from "path";
import { spawnSync, SpawnSyncOptionsWithStringEncoding } from "child_process";

export interface IShellResult {
    retCode: number;
    stdout: string;
    stderr: string;
}

export function runShell(prog: string, args: string[], wd: string, stdio: "inherit" | "string"): IShellResult
{
    return runShellnew(prog, args, wd, stdio);
}
export function runShellold(
    prog: string, 
    args: string[], 
    wd: string,
    env?: { [name: string]: string }
): IShellResult
{
    if (!args)
        args = [];

    let binpath = path.resolve(__dirname, "..", "node_modules", ".bin");
    
    var opts: SpawnSyncOptionsWithStringEncoding =
    {
        stdio: 'inherit',
        cwd: wd,
        env: addToPathold(process.env, binpath),
        encoding: 'utf8'
    };

    var cmd = 'sh';
    var argsx = ['-c', prog].concat(args);

    if (process.platform === 'win32')
    {
        cmd = process.env.comspec || 'cmd';
        argsx = ['/d', '/s', '/c', prog].concat(args);
        opts.windowsVerbatimArguments = true;
    }

    var child =
        spawnSync(
            cmd,
            argsx,
            opts
        );
    // log.info("STDOUT:\n    " + child.output.join("\n    "));

    return { retCode: child.status, stdout: "", stderr: ""};
}

function addToPathold(env: { [key: string]: string | undefined; }, dirname: string): { [key: string]: string | undefined;}
{
    let res = Object.assign({}, env);
    res["Path"] += path.delimiter + dirname;
    //console.error("Path = " + JSON.stringify(res["Path"]));
    return res;
}
export function runShellnew(
    prog: string,
    args: string[],
    wd: string, 
    stdio?: "inherit" | "string"
): IShellResult
{
    if (!args)
        args = [];

    if (!stdio)
        stdio="inherit";

    let binpath = path.resolve(__dirname, "..", "node_modules", ".bin");

    let opts: SpawnSyncOptionsWithStringEncoding =
    {
        stdio: (stdio=="string") ? 'pipe' : stdio,
        cwd: wd,
        env: addToPathnew(process.env, {}, binpath),
        encoding: 'utf8'
    };

    var cmd = 'sh';
    var argsx = ['-c', prog].concat(args);

    if (process.platform === 'win32')
    {
        cmd = process.env.comspec || 'cmd';
        argsx = ['/d', '/s', '/c', prog].concat(args);
        opts.windowsVerbatimArguments = true;
    }

    let child =
        spawnSync( // consider using cross-spawn (https://www.npmjs.com/package/cross-spawn)
            cmd,
            argsx,
            opts
        );

    if (child.status!=0)
    {
        var msg = 
            'Shell command \n   ' + cmd 
            + "failed with return code " + child.status + ":   \n"
            + child.stderr.replace("\n", "\n   ");
        
        console.error(msg);
        process.exit(child.status);
    }
    //console.error("actual2 " + JSON.stringify(child.stdout));
    return { retCode: child.status, stdout: child.stdout, stderr: child.stderr};
}

function addToPathnew(
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


