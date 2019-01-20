import * as path from "path";
import * as os from "os";
import { createWorkingDir, TestDirConfig } from "./test-dir-config";
import { registerTestStep, TestStepConfig } from "./test-step-config";

export interface MultiTestcase
{
    makefile: string[] | string | { [name: string]: string[] | string },
    id: string;
    title?: string;
}
export function multiTestcase(
    spec: MultiTestcase,
    ...steps: TestStepConfig[]
): void
{
    let testdir = path.join(os.homedir(), "npm-make-test", spec.id);

    // auto-number steps:
    for (var n=0; n<steps.length; n++)
    {
        var step = steps[n];
        if (step.stepId == undefined)
            step.stepId = n+1;
    }

        var config: TestDirConfig =
            {
                dirname: testdir,
                makefile: spec.makefile
            }
        createWorkingDir(config);

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

        registerTestStep(
            testdir, // stepdir, 
            step
        );
    }
}
