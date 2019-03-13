import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'case 1b: foo.src but no foo.intermediate => build foo.intermediate, ',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                 deleteFiles("foo*");
                 touchFiles("foo.src")
            },
            targets: ['foo.target'],
            expectedName: [
                'building foo.intermediate from foo.src',
                'building foo.target from foo.intermediate'
            ]
        }
    );

