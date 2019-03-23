// import * as slash from "slash";
const slash = require("slash");
import * as path from "path";
import * as glob from "glob";
import { IFileRef } from "../plan";
import globToRegexp = require("glob-to-regexp");
import * as minimatch from "minimatch";
import { makefileMissingTarget } from "../../make-errors";
import { ITargetName } from "../../parser";
import { TargetName } from "../../parser/implementation/result-builder/targets/target-name";
import { IVirtualPath } from "../plan/virtual-path";
// import { i } from "../plan/plan";
// import { VirtualPath } from "../plan/impl/fileref-impl";

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

/**
 * Tests if a filename matches a pattern, specified as a glob 
 * string and a list of base directories to search relative to.
 * @param basedirs A list of directories to start the search from.
 * @param glob 
 * @param filename 
 * 
 * @example globMatch(['c:\\foo'], 'src\\**\\*.x', 'c:\\foo\\src\\moduleA\bar.x') => true
 * @example globMatch(['/home/wiz'], "src\/**\/*.x", '/home/wiz/moduleA/bar.x') => true
 */
function globMatch(basedirs: string[], glob: string, absoluteFilename: string): boolean
{
    absoluteFilename = path.normalize(absoluteFilename);
    glob = path.normalize(glob);
    for (var basedir of basedirs)
    {
        // clean up the basedir:
        basedir = path.normalize(basedir);
        if (!basedir.endsWith(path.sep))
            basedir = basedir + path.sep;

        if (!absoluteFilename.startsWith(basedir))
            continue;

        let relativeFilename = absoluteFilename.substr(basedir.length);

        if (minimatch(relativeFilename, glob))
        {
            return true;
        }
    }

    return false;
}

// export function wildcardTargetMatch(pattern: TargetName, candidate: string): boolean
// {
//     return wildcardMatch(pattern.basedir, pattern.parseContext.vpath, pattern.relname, candidate);
// }

export function doesFilenameMatchTarget(target: ITargetName, filename: string): ITargetName 
{
    if (globMatch([target.basedir], target.relname, filename))
        return new TargetName(
            target.location, 
            target.parseContext, 
            target.basedir, 
            path.relative(target.basedir, filename)
        ); //new FileRef(target.relname, filename);

    return null;
}

export function resolveVpath(basedir: string, vpath: string[], relname: string): string //IVirtualPath
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
            return files[0];//return new VirtualPath(/*relname,*/ files[0]);
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
