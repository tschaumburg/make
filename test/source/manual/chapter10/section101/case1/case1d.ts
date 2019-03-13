import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'case 1d: foo.intermediate newer than foo.src => do nothing',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                 deleteFiles("foo*");
                 touchFilesRelative(-1, "foo.src")
                 touchFiles("foo.intermediate");
            },
            targets: ['foo.target'],
            expectedName: [
                'building foo.target from foo.intermediate'
            ]
        }
    );

