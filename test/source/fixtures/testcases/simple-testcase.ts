import { createWorkingDir, TestDirConfig } from "./test-dir-config";
import { registerTest, TestStepConfig } from "./test-step-config";
import * as path from "path";
import { ExpectedSuccess, ExpectedError } from "../results";

export interface SimpleTestcase
{
    title: string;
    makefileName: string | string[];
    prepare?: () => void;
    targets: string[];
    expectedName: string | string[] | ExpectedError | ExpectedSuccess;
    after?: () => void;
}

// Defining a test by callig simpletest with these parameters.
// 
//   simpleTest(
//       {
//           stepId: 419,
//           makefileName: require.resolve("./Makefile"),
//           expectedName: require.resolve("./expected"),
//           ...
//       };
//   )
//
// will create the following directory structure for the test
// to run in:
//
//   +-basedir
//       +-419
//          +-Makefile  (copied from source dir)
//          +-expected  (copied from source dir)
export function simpleTest(testConfig: SimpleTestcase): (basedir: string, caseNo: number) => void
{
    var res =
        (basedir: string, caseNo: number) => 
        {
            let testdir = path.resolve(basedir, "" + caseNo);
            console.error("simpleTest basedir=" + basedir + " caseNo=" + caseNo + " => testdir=" + testdir);
            console.log("simpleTest basedir=" + basedir + " caseNo=" + caseNo + " => testdir=" + testdir);
            //describe(caseNo + " " + testConfig.title, function ()
            {
                if (!!testConfig.makefileName)
                {
                    createWorkingDir(
                        {
                            dirname: testdir,
                            files: {
                                "Makefile": testConfig.makefileName
                            }
                        }
                    );
                }

                registerTest(
                    testdir,
                    {
                        stepId: caseNo, //testConfig.testId,
                        title: testConfig.title,
                        prepare: testConfig.prepare,
                        targets: testConfig.targets,
                        expect: testConfig.expectedName,
                        after: testConfig.after
                    }
                )
            }//);
        };

    return res;
}
