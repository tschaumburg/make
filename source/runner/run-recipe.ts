import * as path from "path";
import * as exits from '../return-codes';
import * as log from '../makelog';
import { spawnSync, SpawnSyncOptionsWithStringEncoding } from "child_process";
import * as fs from 'fs';
import { IAction, IFilePlan } from "../planner";
import { FileRef, FilePlan } from "../planner/plan/plan-impl";
const os = require('os')

export function runPlan(target: IFilePlan): void
{
    for (let step of target.producedBy.recipe)
    {
        let cmd = 
            expandSymbols(
                step, 
                target, 
                target.producedBy.prerequisites,
                target.producedBy.orderOnly
            );
        var ret = run(cmd, [], '.');

        if (ret != 0)
            exits.recipeExecutionError(ret, cmd);
    }

    //var cmd = recipe.steps.join(" && ");
    //cmd = expandSymbols(cmd, target, prerequisites);
    //var ret = run(cmd, [], '.');
    //if (ret != 0)
    //    exits.recipeExecutionError(ret, cmd);
}

function expandSymbols(
    cmd: string, 
    target: FilePlan, 
    prerequisites: FilePlan[], 
    orderonlies: FilePlan[]
): string
{
    // $@:
    // ===
    // The file name of the target of the rule.
    // 
    // If the target is an archive member, then '$@' is the name of the
    // archive file.
    //
    // In a pattern rule that has multiple targets (see Introduction to
    // Pattern Rules), '$@' is the name of whichever target caused the
    // rule's recipe to be run.
    cmd = cmd.replace(/\$\(@D\)/g, path.dirname(target.file.fullname));
    cmd = cmd.replace(/\$\(@F\)/g, path.basename(target.file.fullname));
    cmd = cmd.replace(/\$@/g, target.file.orgname);

    //// $%:
    //// ===
    //// The target member name, when the target is an archive member. See Archives. 
    //// For example, if the target is foo.a(bar.o) then �$ %� is bar.o and �$@� is 
    //// foo.a.�$ %� is empty when the target is not an archive member.
    //cmd = cmd.replace('$%', );

    // $<:
    // ===
    // The name of the first prerequisite. If the target got its recipe 
    // from an implicit rule, this will be the first prerequisite added 
    // by the implicit rule (see Implicit Rules).
    //
    // Note: tests show that order-only prerequisites are ignored (GNU 
    // make 3.81 built for i386-pc-mingw32)
    if (prerequisites.length > 0)
        cmd = cmd.replace(/\$</g, prerequisites[0].file.orgname);

    // $?:
    // ===
    // The names of all the prerequisites that are newer than the target, 
    // with spaces between them. For prerequisites which are archive 
    // members, only the named member is used (see Archives).
    //
    // Note: tests show that order-only prerequisites are ignored (GNU 
    // make 3.81 built for i386-pc-mingw32)
    cmd =
        cmd.replace(
            /\$\?/g,
            newerThan(target.file, prerequisites.map((p) => p.file)).map(p => p.orgname).join(' ')
        );

    // The names of all the prerequisites, with spaces between them. 
    // For prerequisites which are archive members, only the named 
    // member is used (see Archives). A target has only one prerequisite 
    // on each other file it depends on, no matter how many times each 
    // file is listed as a prerequisite. So if you list a prerequisite 
    // more than once for a target, the value of $^ contains just one 
    // copy of the name.
    // 
    // This list does not contain any of the order-only prerequisites; 
    // for those see the '$|' variable, below.
    cmd = cmd.replace(
        /\$\^/g,
        prerequisites
            .filter(distinct)
            .map(p => p.file.orgname)
            .join(' ')
    );

    // $+:
    // ===
    // This is like '$^', but prerequisites listed more than once 
    // are duplicated in the order they were listed in the makefile. 
    // This is primarily useful for use in linking commands where it 
    // is meaningful to repeat library file names in a particular 
    // order.
    cmd = cmd.replace(
        /\$\+/g,
        prerequisites
            .map(p => p.file.orgname)
            .join(' ')
    );

    // $|:
    // ===
    // The names of all the order-only prerequisites, with spaces 
    // between them.
    cmd = cmd.replace(
        /\$\|/g,
        orderonlies
            .map(p => p.file.orgname)
            .join(' ')
    );

    //// The stem with which an implicit rule matches (see How Patterns 
    //// Match). If the target is 
    ////    dir/a.foo.b 
    //// and the target pattern is
    ////    a.%.b 
    //// then the stem is 
    ////    dir/foo.
    //// 
    //// The stem is useful for constructing names of related files.
    ////
    ////In a static pattern rule, the stem is part of the file name 
    //// that matched the �%� in the target pattern.
    ////
    ////In an explicit rule, there is no stem; so �$ *� cannot be 
    //// determined in that way.Instead, if the target name ends with 
    //// a recognized suffix(see Old - Fashioned Suffix Rules), �$ *� 
    //// is set to the target name minus the suffix.For example, if 
    //// the target name is �foo.c�, then �$ *� is set to �foo�, since 
    //// �.c� is a suffix.GNU make does this bizarre thing only for 
    //// compatibility with other implementations of make.You should 
    //// generally avoid using �$ *� except in implicit rules or static 
    //// pattern rules.
    ////
    ////If the target name in an explicit rule does not end with a 
    //// recognized suffix, �$ *� is set to the empty string for that 
    //// rule.
    //cmd = cmd.replace('$*');
    return cmd;
}

function distinct(value, index, self) { 
    return self.indexOf(value) === index;
}

function newerThan(target: FileRef, prerequisites: FileRef[]): FileRef[]
{
    let targetTime = target.timestamp();
    return prerequisites.filter(p => p.timestamp() > targetTime);
}

function addToPath(env: { [key: string]: string | undefined; }, dirname: string): { [key: string]: string | undefined;}
{
    let res = Object.assign({}, env);
    res["Path"] += path.delimiter + dirname;
    //console.error("Path = " + JSON.stringify(res["Path"]));
    return res;
}

function run(prog: string, args: string[], wd: string): number
{
    if (!args)
        args = [];

    let binpath = path.resolve(__dirname, "..", "..", "node_modules", ".bin");
    var opts: SpawnSyncOptionsWithStringEncoding =
    {
        stdio: 'inherit',
        cwd: wd,
        env: addToPath(process.env, binpath),
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

    log.info(cmd + " " + argsx.join(" "));
    var child =
        spawnSync(
            cmd,
            argsx,
            opts
        );
    log.info("STDOUT:\n    " + child.output.join("\n    "));

    return child.status;
}
//import { IRecipe } from "../imakefile";
//import { spawn } from "child_process";

//export async function runRecipe(recipe: IRecipe): Promise<void>
//{
//    var _this2 = this;

//    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { env: this.env, stdio: 'inherit' };

//    return new Promise<void>(function (r, errback)
//    {
//        // coming from https://github.com/npm/npm/blob/master/lib/utils/lifecycle.js#L222
//        var sh = 'sh';
//        var flags = ['-c'];

//        if (process.platform === 'win32')
//        {
//            sh = process.env.comspec || 'cmd';
//            flags = ['/d', '/s', '/c'];
//            opts.windowsVerbatimArguments = true;
//        }

//        var args = flags.concat(recipe.steps);
//        //_this2.debug('exec:', sh, flags, recipe);
//        //_this2.silly('env:', opts.env);
//        spawn(sh, args, opts).on('error', errback).on('close', function (code: number)
//        {
//            if (code !== 0)
//            {
//                //_this2.error(recipe);
//                return errback(new Error('Recipe exited with code ' + code));
//            }

//            r();
//        });
//    });
//}
