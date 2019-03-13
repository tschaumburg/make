import * as path from "path";
import * as fs from "fs";
import { ExpectedError, ExpectedSuccess, loadExpected, IActualResult } from "../results";
import { run } from "./run";
import { fstat } from "fs-extra";

export interface TestStepConfig
{
    stepId?: number;
    title: string;
    prepare?: () => void;
    env?: { [name: string]: string };
    targets: string[];
    expect: ExpectedError | ExpectedSuccess | string | string[] ; //| { [name: string]: string[] | string };
    after?: () => void;
}

export function registerTest(
    dirName: string,
    step: TestStepConfig
): void
{
    console.error("EXPECTS " + JSON.stringify(step.expect));
    let expectedResult = loadExpected(step.expect);
    let prepare = step.prepare;
    let after = step.after;
    //console.error("   => " + JSON.stringify(expectedResult));
    it(
        step.title,
        function (done)
        {
            // Prepare:
            runPrepare(dirName, prepare);

            // Run npm-make:
            let result = make(dirName, step.targets, step.env);
            runPrepare(dirName, after);

            if (!!expectedResult.lines())
                fs.writeFileSync(path.join(dirName, "expected.txt"), expectedResult.lines().join("\n"));
            fs.writeFileSync(path.join(dirName, "actual.txt"), result.stdout.concat(result.stderr).join("\n"));

            let msg = "Working dir: " + dirName;
            console.error(msg);
            console.log(msg);

            // Assert
            console.error("EXPECTED: " + JSON.stringify(expectedResult, null, 3));
            console.error("ACTUAL: " + JSON.stringify(result, null, 3));
            expectedResult.assertActual(result);

            done();
        }
    );
}

function runPrepare(dirName: string, prepare: () => void): void
{
    //console.error("runprepare: dirName=" + dirName + " prepare=" + prepare);
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

function make(
    dirname: string,
    args: string[],
    env?: { [name: string]: string }
): IActualResult
{
    console.log("Test execution dir: " + dirname)
    let prog = path.resolve(__dirname, "..", "..", "..", "..", "bin", 'npm-make.cmd');

    if (args.length > 0)
        prog = prog + " " + args.join(" ");

    return run(prog, dirname, env)
}

