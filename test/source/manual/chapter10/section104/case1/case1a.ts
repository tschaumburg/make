import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'case 1a: Chains of implicit rules',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                 deleteFiles("foo*");
                 touchFiles("foo.src")
            },
            targets: ['foo.target'],
            expectedName: [
                'making foo.intermediate from foo.src',
                'making foo.target from foo.intermediate',
                'rm foo.intermediate'
            ]
        }
    );

