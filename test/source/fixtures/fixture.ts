import * as mocha from "mocha";
var assert = require("assert");

import * as tmp from "tmp";
import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";

import { IExpectedResult, ExpectedSuccess, ExpectedError } from "./expected";
import { run } from "./run";
import { isArray } from "util";
import { resolve } from "dns";
import { makefiles } from "../manual/chapter3/section33/setup";
import { IActualResult } from "./actual";

// export function testcase(spec: TestSpec): () => void
// {
//     return function ()
//     {
//         var dirName = createTestdir();
//         createMakefiles(dirName, spec.makefile);

//         // Prepare:
//         if (!!spec.prepare)
//         {
//             var cwd = process.cwd();
//             try
//             {
//                 process.chdir(dirName);
//                 spec.prepare();
//             }
//             catch (reason)
//             {
//                 process.chdir(cwd);
//                 console.error(reason);
//             }
//         }

//         // Run npm-make:
//         var result = make(dirName, spec.targets);

//         // Assert
//         var expectedResult = convert(spec.expect);
//         expectedResult.assertActual(result);
//     };
// }

// interface TestSpec
// {
//     makefile: string[];
//     prepare?: () => void;
//     targets: string[];
//     expect: ExpectedError | string | string[];
// }

interface MultiTestcase
{
    makefile: string[] | { [name: string]: string[] },
    id: string;
    title?: string;
}
export function multiTestcase(
    // makefile: string[] | { [name: string]: string[] },
    // dirName: string,
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
    expect: ExpectedError | string | string[];
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

function createMakefiles(dirName: string, makefile: string[] | { [name: string]: string[] }): void
{
    if (isArray(makefile))
    {
        let makefilename = path.resolve(dirName, "Makefile");
        fs.writeFileSync(makefilename, makefile.join("\n"));
        //console.log(spec.makefile.join("\n"));
    }
    else
    {
        for (let filename in makefile)
        {
            let makefilename = path.resolve(dirName, filename);
            let makefileDirname = path.dirname(makefilename);
            fse.ensureDirSync(makefileDirname);
            let lines = makefile[filename];
            fs.writeFileSync(makefilename, lines.join("\n"));
        }
    }
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

function convert(expected: ExpectedError | string | string[]): IExpectedResult
{
    if (typeof (expected) === 'string')
    {
        return new ExpectedSuccess([expected]);
    }

    if (isArray(expected))
    {
        return new ExpectedSuccess(expected as string[]);
    }

    return expected as ExpectedError;
}

function make(
    dirname: string,
    args: string[],
    env?: { [name: string]: string }
): IActualResult
{
    let prog = path.resolve(__dirname, "..", "..", "..", "bin", 'npm-make.cmd');

    if (args.length > 0)
        prog = prog + " " + args.join(" ");

    return run(prog, dirname, env)
}
