import { createWorkingDir, TestDirConfig } from "./test-dir-config";
import { registerTestStep, TestStepConfig } from "./test-step-config";
import { dirname } from "path";
import { loadExpected } from "../results";

// export interface MultiTestcase extends TestDirConfig
// {
//     // makefile: string[] | string | { [name: string]: string[] | string },
//     // id: string;
//     // title?: string;
// }
export interface SimpleTestcase
{
    title: string;
    makefileName: string;
    targets: string[];
    expectedName: string;
}

export function simpleTest(testConfig: SimpleTestcase): (basedir: string, caseNo: number) => void
{
    var res =
        (basedir: string, caseNo: number) => 
        {
            console.error("simpleTest basedir=" + basedir + " caseNo=" + caseNo);
            describe(caseNo + " " + testConfig.title, function ()
            {
                var dirName = 
                    createWorkingDir(
                        {
                            dirname: basedir + "/" + caseNo,
                            makefile: testConfig.makefileName
                        }
                    );
        
                registerTestStep(
                    dirName,
                    {
                        title: testConfig.title,
                        targets: testConfig.targets,
                        expect: testConfig.expectedName
                    }
                )
            });
        };

    return res;
}
