import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../../test-utils";
import { listFiles } from "../../../../test-utils/list-files";

export const loadTests = 
    simpleTest(
        {
            title: 'case 1b: Intermediate skipping',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                 deleteFiles("foo*");
                 touchFilesRelative(-1, "foo.src")
                 touchFiles("foo.target")
            },
            targets: ['foo.target'],
            after: () =>
            {
                listFiles("foo.*");
            },
            expectedName: []
        }
    );

