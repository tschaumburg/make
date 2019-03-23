import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../../test-utils";
import { assertFiles } from "../../../../test-utils";

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
            assertAfter: () =>
            {
                assertFiles("foo.*",["foo.src", "foo.target"]);
            },
            expectedName: [
                "'foo.target' is up to date"
            ]
        }
    );

