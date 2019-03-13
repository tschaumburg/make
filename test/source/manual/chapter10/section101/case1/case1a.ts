import * as mocha from "mocha";
import { multiTestcase, successFile, error } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'case 1a: no foo.intermediate and no foo.src => fail',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                 deleteFiles("foo*");
            },
            targets: ['foo.target'],
            expectedName: error(109)
        }
    );

