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

    // Note on Unicode/UTF8 on Windows:
    // Character sets, encodings, codepages... so many ways to mess up
    // text input and output outside the 7-bit ASCII character set
    // 
    // But all that is history with Unicode and the UTF8/16 encodings.
    //
    // So here's how to get Unicode *output* from a program executed
    // using the spawnSync method;
    //
    // FIRST tell spawnSync to expect the binary data it receives
    // from the child process to be UTF8-encoded Unicode, by setting
    // the 'encoding' option to 'utf8':
    //
    //      let opts: SpawnSyncOptionsWithStringEncoding =
    //      {
    //          ...
    //          encoding: 'utf8'
    //      };
    //
    // SECOND, tell the Windows "shell" (cmd.exe) to actually encode
    // its' output as UTF8 (otherwise, how would it know what we're
    // expecting):
    //
    //      ...
    //      prog = "chcp 65001>nul && " + prog;
    //

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
        prog = prog.replace("%", "%%");
        prog = prog.replace("|", "\\|");
        console.error("RUN: " + prog);
        // Tell cmd to output UTF8-encoded unicode:
        prog = "chcp 65001>nul && " + prog;
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
        stdout: child.stdout.split(/[\r]?[\n]/),//os.EOL),
        stderr: child.stderr.split(/[\r]?[\n]/),//os.EOL),
    };

    //console.error("actual2 " + JSON.stringify(res));
    return res;
}
