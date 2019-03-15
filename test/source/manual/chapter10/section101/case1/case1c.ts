import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'case 1c: foo.src newer than foo.intermediate => build foo.intermediate,',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                 deleteFiles("foo*");
                 touchFilesRelative(-10, "foo.intermediate");
                 touchFiles("foo.src");
            },
            targets: ['foo.target'],
            expectedName: [
                'building foo.intermediate from foo.src',
                'building foo.target from foo.intermediate'
            ]
        }
    );

