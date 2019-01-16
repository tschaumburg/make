import * as mocha from "mocha";
var assert = require("assert");

import * as tmp from "tmp";
import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";

import { IExpectedResult, ExpectedSuccess, ExpectedError } from "./expected";
import { run } from "./run";
import { isArray, isString } from "util";
import { resolve } from "dns";
import { makefiles } from "../manual/chapter3/section33/setup";
import { IActualResult } from "./actual";

interface MultiTestcase
{
    makefile: string[] | string | { [name: string]: string[] | string },
    id: string;
    title?: string;
}
export function multiTestcase(
    spec: MultiTestcase,
    ...steps: TestStep[]
): void
{
    let dirName = createTestdir(spec.id, spec.title);
    createMakefiles(dirName, spec.makefile);

    for (let step of steps)
    {
        //console.error("EXPECTS " + JSON.stringify(step.expect));
        let expectedResult = convert(step.expect);
        let prepare = step.prepare;
        //console.error("   => " + JSON.stringify(expectedResult));
        it(
            step.title,
            function (done)
            {
                // Prepare:
                runPrepare(dirName, prepare);

                // Run npm-make:
                let result = make(dirName, step.targets, step.env);

                // Assert
                expectedResult.assertActual(result);

                done();
            }
        );
    }
}

export interface TestStep
{
    title: string;
    prepare?: () => void;
    env?: { [name: string]: string };
    targets: string[];
    expect: ExpectedError | ExpectedSuccess | string | string[] | { [name: string]: string[] | string };
}

function createTestdir(testId: string, testTitle: string): string
{
    let homedir = require('os').homedir();
    let testdir = testId;
    if (!!testTitle)
    {
        testdir = testdir + " - " + testTitle;
    }
    let dirName = path.join(homedir, "npm-make-test", testdir);
    dirName = path.normalize(dirName);

    // console.error("TESTDIR=" + dirName);

    if (!fs.existsSync(dirName))
    {
        fse.ensureDirSync(dirName);
    }

    return dirName;
}

function createMakefiles(dirName: string, makefile: string[] | string | { [name: string]: string[] | string } ): void
{
    if (isArray(makefile))
    {
        writeMakefile(dirName, makefile);
    }
    else if (isString(makefile))
    {
        copyMakefile(dirName, makefile);
    }
    else
    {
        for (let filename in makefile)
        {
            let makefileDirname = path.dirname(filename);
            fse.ensureDirSync(makefileDirname);

            let filecontents = makefile[filename];
            if (isArray(filecontents))
            {
                writeMakefile(path.resolve(dirName, filename), filecontents);
            }
            else if (isString(filecontents))
            {
                copyMakefile(dirName, filecontents);
            }
        
            //let makefilename = path.resolve(dirName, filename);
            // let makefileDirname = path.dirname(makefilename);
            // fse.ensureDirSync(makefileDirname);
            // let lines = makefile[filename];
            // fs.writeFileSync(makefilename, lines.join("\n"));
        }
    }
}

function copyMakefile(destination: string, srcFileName: string): void
{
    let dstFilename = destination;
    if (fs.lstatSync(dstFilename).isDirectory())
    {
        dstFilename = path.resolve(dstFilename, "Makefile");
    }

    let makefileContents = fs.readFileSync(srcFileName);
    fs.writeFileSync(dstFilename, makefileContents);
    //console.log(spec.makefile.join("\n"));
}

function writeMakefile(pathName: string, makefileLines: string[]): void
{
    let makefilename = pathName;
    if (fs.lstatSync(makefilename).isDirectory())
    {
        makefilename = path.resolve(makefilename, "Makefile");
    }

    fs.writeFileSync(makefilename, makefileLines.join("\n"));
    //console.log(spec.makefile.join("\n"));
}

function runPrepare(dirName: string, prepare: () => void): void
{
    if (!!prepare)
    {
        var cwd = process.cwd();
        try
        {
            process.chdir(dirName);
            prepare();
        }
        finally
        {
            process.chdir(cwd);
        }
    }
}

function convert(expected: ExpectedError | ExpectedSuccess | string | string[] | { [name: string]: string[] | string }): IExpectedResult
{
    if (isString (expected))
    {
        return new ExpectedSuccess([expected]);
    }

    if (isArray(expected))
    {
        return new ExpectedSuccess(expected);
    }

    return expected as IExpectedResult;
}

function make(
    dirname: string,
    args: string[],
    env?: { [name: string]: string }
): IActualResult
{
    console.log("Test execution dir: " + dirname)
    let prog = path.resolve(__dirname, "..", "..", "..", "bin", 'npm-make.cmd');

    if (args.length > 0)
        prog = prog + " " + args.join(" ");

    return run(prog, dirname, env)
}
