import * as path from "path";
import { ExpectedError, ExpectedSuccess, loadExpected, IActualResult } from "../results";
import { run } from "./run";

export interface TestStepConfig
{
    stepId?: number;
    title: string;
    prepare?: () => void;
    env?: { [name: string]: string };
    targets: string[];
    expect: ExpectedError | ExpectedSuccess | string | string[] ; //| { [name: string]: string[] | string };
}

export function registerTestStep(
    dirName: string,
    step: TestStepConfig
): void
{
    //console.error("EXPECTS " + JSON.stringify(step.expect));
    let expectedResult = loadExpected(step.expect);
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

function runPrepare(dirName: string, prepare: () => void): void
{
    console.error("runprepare: dirName=" + dirName + " prepare=" + prepare);
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

