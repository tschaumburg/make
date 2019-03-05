import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'Simple implicit rule',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                 deleteFiles("foo*");
            },
            targets: ['foo.target'],
            expectedName: [
                ''
            ]
        }
    );

