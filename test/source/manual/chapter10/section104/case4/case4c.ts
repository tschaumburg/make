import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../../test-utils";
import { assertFiles } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'case 4c: .INTERMEDIATE deletion',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                deleteFiles("foo*");
                touchFiles("foo.src")
           },
            targets: ['foo.target'],
            assertAfter: () =>
            {
                assertFiles("foo.*",["foo.src", "foo.target"]);
            },
            expectedName: [
                'making foo.intermediate from foo.src',
                'making foo.target from foo.intermediate',
                'rm foo.intermediate'
            ]
        }
    );

