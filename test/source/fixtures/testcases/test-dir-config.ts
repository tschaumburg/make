import * as tmp from "tmp";
import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { isArray, isString } from "util";
import { loadExpected, ExpectedError, ExpectedSuccess, IActualResult } from "../results";
import { run } from "./run";

export interface TestDirConfig
{
    makefile: string[] | string | { [name: string]: string[] | string },
    dirname: string;
    //title?: string;
}


export function createWorkingDir(
    spec: TestDirConfig
): string
{
    console.error("createWorkingDir " + JSON.stringify(spec));


    createTestdir(spec.dirname);
    createMakefiles(spec.dirname, spec.makefile);
    return spec.dirname;
}

function createTestdir(dirName: string): void
{
    console.error("createTestdir dirName=" + dirName);

    // console.error("TESTDIR=" + dirName);

    if (!fs.existsSync(dirName))
    {
        fse.ensureDirSync(dirName);
    }
}

function createMakefiles(basedir: string, makefile: string[] | string | { [name: string]: string[] | string } ): void
{
    if (isArray(makefile))
    {
        writeMakefile(basedir, 'Makefile', makefile);
    }
    else if (isString(makefile))
    {
        copyMakefile(basedir, 'Makefile', makefile);
    }
    else
    {
        for (let name in makefile)
        {
            let filecontents = makefile[name];
            let makefileName = path.basename(name) || 'Makefile';
            let relativeDirname = path.dirname(name) || '.';
            let absoluteDirname = path.resolve(basedir, relativeDirname);

            if (isArray(filecontents))
            {
                writeMakefile(absoluteDirname, makefileName, filecontents);
            }
            else if (isString(filecontents))
            {
                copyMakefile(absoluteDirname, makefileName, filecontents);
            }
        
            //let makefilename = path.resolve(dirName, filename);
            // let makefileDirname = path.dirname(makefilename);
            // fse.ensureDirSync(makefileDirname);
            // let lines = makefile[filename];
            // fs.writeFileSync(makefilename, lines.join("\n"));
        }
    }
}

function copyMakefile(targetAbsDir: string, targetFileName: string, srcFileName: string): void
{
    fse.ensureDirSync(targetAbsDir);

    // let dstFilename = destination;
    // if (fs.lstatSync(dstFilename).isDirectory())
    // {
    //     dstFilename = path.resolve(dstFilename, "Makefile");
    // }

    let targetFullname = path.resolve(targetAbsDir, targetFileName);
    let makefileContents = fs.readFileSync(srcFileName);
    fs.writeFileSync(targetFullname, makefileContents);
    //console.log(spec.makefile.join("\n"));
}

function writeMakefile(targetAbsDir: string, targetFileName: string, makefileLines: string[]): void
{
    fse.ensureDirSync(targetAbsDir);

    // let makefilename = pathName;
    // if (fs.existsSync(makefilename) && fs.lstatSync(makefilename).isDirectory())
    // {
    //     makefilename = path.resolve(makefilename, "Makefile");
    // }

    let targetFullname = path.resolve(targetAbsDir, targetFileName);
    fs.writeFileSync(targetFullname, makefileLines.join("\n"));
    //console.log(spec.makefile.join("\n"));
}

