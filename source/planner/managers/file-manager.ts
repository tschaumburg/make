import * as slash from "slash";
import * as path from "path";
import * as glob from "glob";
import * as log from '../../makelog';
import { TargetName } from "../../parser/result";
import { Action, FileRef } from "../plan/plan-impl";
import { IFileRef } from "../plan";
import globToRegexp = require("glob-to-regexp");
import * as minimatch from "minimatch";

function simpleWildcardMatch(pattern: string, candidate: string): boolean
{
    if (!path.isAbsolute(candidate))
    {
        return false;
    }

    candidate = path.normalize(candidate);

    let _pattern = new minimatch.Minimatch(pattern)
    return _pattern.match(candidate);
}

export function wildcardMatch(basedir: string, vpath: string[], pattern: string, candidate: string): boolean
{
    for (var dir in searchdirs(basedir, vpath))
    {
        let strpattern = path.join(dir, pattern);
        if (simpleWildcardMatch(strpattern, candidate))
        {
            return true;
        }
    }

    return false;
}

function glob2RegExp(glob: string): string
{
    //console.error("glob2RegExp " + glob);
    var res = minimatch.makeRe(glob).source;

    if (res.startsWith("^"))
    {
        res = res.substring(1);
    }

    if (res.endsWith("$"))
    {
        res = res.substr(0, res.length - 1);
    }

    return res;
}

function wildcardMap(dirs: string[], pattern: string, candidate: string): IFileRef
{
    candidate = slash(candidate);
    var patternRe = glob2RegExp(pattern);
    for (var dir of dirs)
    {
        if (!dir.endsWith(path.sep))
        {
            dir = dir + path.sep;
        }
    
        var dirRe = glob2RegExp(dir);
        var matchRe = new RegExp("^(" + dirRe + ")(" + patternRe + ")$");
        var parts = candidate.match(matchRe);
        //console.error("match " + matchRe.source + " => " + JSON.stringify(parts));

        if (!!parts && parts.length == 3)
        {
            return new FileRef(path.normalize(parts[2]), path.normalize(candidate));
        }
    }

    return null;
}

// export function wildcardTargetMatch(pattern: TargetName, candidate: string): boolean
// {
//     return wildcardMatch(pattern.basedir, pattern.parseContext.vpath, pattern.relname, candidate);
// }

export function wildcardTargetMap(pattern: TargetName, candidate: string): IFileRef 
{
    return wildcardMap(
        [pattern.basedir]/*searchdirs(pattern.basedir, pattern.parseContext.vpath)*/,
        pattern.relname, 
        candidate);
}

export function resolveVpath(basedir: string, vpath: string[], relname: string): IFileRef
{
    // log.locateFiles(
    //     () => "Resolving target '" + relname + "' ref. from '" + basedir + "':"
    // );

    for (let globDir of vpath)
    {
        let dirs = globMatchDirs(basedir, globDir);
        for (let dir of dirs)
        {
            console.error("   " + dir + ":");
            let files = globMatchFiles(dir, relname);
            for (let file of files)
            {
                console.error("      " + file);
            }

            var relname = path.relative(dir, files[0]);
            return new FileRef(relname, files[0]);
        }
    }
    return null;
}
// export function expandTarget(basedir: string, vpath: string[], relname: string): string[] //src: TargetName, producedBy: Action): IFileRef[]
// {
//     let res: string[] = []// IFileRef[] = [];
//     log.locateFiles(
//         () => "Resolving target '" + relname + "' ref. from '" + basedir + "':"
//     );
//     let _searchdirs = 
//         searchdirs(
//             basedir, 
//             vpath //src.parseContext && src.parseContext.VPATH
//         );

//     console.error("searchdirs: " + JSON.stringify(_searchdirs));
//     for (let globDir of _searchdirs)
//     {
//         let dirs = globMatchDirs(basedir, globDir);
//         for (let dir of dirs)
//         {
//             console.error("   " + dir + ":");
//             let files = globMatchFiles(dir, relname);
//             for (let file of files)
//             {
//                 console.error("      " + file);
//             }
//             res.push(...files);//.map(filename => new FileRef(src.relname, filename, producedBy)))
//         }
//     }
//     return res;
// }

// console.error("options:     " + JSON.stringify(options));
// console.error("defaultGoal: " + JSON.stringify(this.defaultTarget));

// let commandlineGoalNames = options.goals || [];
// let commandlineGoals = commandlineGoalNames.map(n => this.fi)

// if (!Array.isArray(this.goals) || !this.goals.length) {
//     if (!defaultTarget)
//         exits.makefileMissingTarget();
//     targets = [defaultTarget];
// }

function globMatchFiles(basedir: string, globfile: string): string[] 
{
    let res = glob.sync(globfile, {nodir: true, cwd: basedir});

    console.error("glob.sync('" + globfile + "', {nodir: true, cwd: '" + basedir + "' }) => " + JSON.stringify(res))

    return res;
}

function globMatchDirs(basedir: string, globDir: string): string[] 
{
    if (!globDir.endsWith("/"))
    {
        globDir = globDir + "/";
    }
    return glob.sync(globDir, {nodir: false, cwd: basedir})
}

function searchdirs(basedir: string, vpath: string[]): string[]
{
    let res = [basedir];

    if (!!vpath)
    {
        res.push(...vpath);
    }

    return res;
}
