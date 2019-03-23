import * as path from "path";
import * as os from "os";
import { createWorkingDir, TestDirConfig } from "./test-dir-config";
import { registerTest, TestStepConfig } from "./test-step-config";
import { isString, isArray } from "util";

export interface MultiTestcase
{
    makefile: string[] | string | { [name: string]: string[] | string },
    id: string;
    title?: string;
}

function convertFiles(makefile: string[] | string | { [name: string]: string[] | string }): { [name: string]: string[] | string }
{
    if (isString(makefile))
    {
        return {"Makefile": makefile}
    }

    if (isArray(makefile))
    {
        return {"Makefile": makefile}
    }

    return makefile;
}

export function multiTestcaseNew(
    spec: MultiTestcase,
    ...steps: TestStepConfig[]
): (basedir: string, caseNo: number) => void
{
    var res =
        (basedir: string, caseNo: number) => 
        {
            let testdir = path.resolve(basedir, "" + caseNo);
        
            _multiTestcase(testdir, spec, ...steps);
        };

    return res;    
}

export function multiTestcase(
    spec: MultiTestcase,
    ...steps: TestStepConfig[]
): void
{
    let basedir = path.join(os.homedir(), "npm-make-test");
    let testdir = path.resolve(basedir, spec.id);

    _multiTestcase(testdir, spec, ...steps);
}

function _multiTestcase(
    testdir: string,
    spec: MultiTestcase,
    ...steps: TestStepConfig[]
): void
{
    var config: TestDirConfig =
    {
        dirname: testdir,
        files: convertFiles(spec.makefile)
    }

    createWorkingDir(config);

    // auto-number steps:
    for (var n=0; n<steps.length; n++)
    {
        var step = steps[n];
        if (step.stepId == undefined)
            step.stepId = n+1;
    }

    for (let step of steps)
    {
        // var stepIdStr = ("00000" + step.stepId).slice(-3);
        // let stepdir = path.join(testdir, "step" + stepIdStr);
        //
        // var config: TestDirConfig =
        //     {
        //         dirname: stepdir,
        //         makefile: spec.makefile
        //     }
        // createWorkingDir(config);

        registerTest(
            testdir, // stepdir, 
            step
        );
    }
}
