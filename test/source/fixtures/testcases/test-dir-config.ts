import * as tmp from "tmp";
import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { isArray, isString } from "util";
import { loadExpected, ExpectedError, ExpectedSuccess, IActualResult } from "../results";
import { run } from "./run";
import { resolve } from "url";

export interface TestDirConfig
{
    // makefile: string[] | string | { [name: string]: string[] | string },
    files: { [name: string]: string[] | string },
    dirname: string;
    //title?: string;
}


export function createWorkingDir(
    spec: TestDirConfig
): string
{
    console.error("createWorkingDir " + JSON.stringify(spec));
    console.error("createTestdir dirName=" + spec.dirname);

    if (!fs.existsSync(spec.dirname))
    {
        fse.ensureDirSync(spec.dirname);
    }

    createFiles(spec.dirname, spec.files);

    return spec.dirname;
}

function createFiles(basedir: string, files: { [name: string]: string[] | string } ): void
{
    for (let relativeFileName in files)
    {
        let absoluteDestination = path.resolve(basedir, relativeFileName);
        let source = files[relativeFileName];

        createTestFile(absoluteDestination, source);
    }
}

function createTestFile(destination: string, source: string[] | string): void
{
    if (isArray(source))
    {
        writeMakefile(destination, source);
    }
    else
    {
        copyMakefile(destination, source);
    }
}

function copyMakefile(destination: string, srcFileName: string): void
{
    destination = path.resolve(".", destination);
    let destinationDir = path.dirname(destination);
    if (!fs.existsSync(destinationDir))
        fse.ensureDirSync(destinationDir);

    let makefileContents = fs.readFileSync(srcFileName);
    fs.writeFileSync(destination, makefileContents);
    //console.log(spec.makefile.join("\n"));
}

function writeMakefile(destination: string, makefileLines: string[]): void
{
    destination = path.resolve(".", destination);
    let destinationDir = path.dirname(destination);

    if (!fs.existsSync(destinationDir))
        fse.ensureDirSync(destinationDir);

    fs.writeFileSync(destination, makefileLines.join("\n"));
    //console.log(spec.makefile.join("\n"));
}

