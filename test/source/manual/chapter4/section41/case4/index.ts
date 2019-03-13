import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, touchFilesRelative, deleteFiles } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'foo.o is up-to-date',
            makefileName: require.resolve('./makefile'),
            prepare: () => { 
                touchFilesRelative(-2, "defs.h");
                touchFilesRelative(-1, "foo.c");
                touchFilesRelative(0, "foo.o");
            },
            targets: ['foo.o'],
            expectedName: require.resolve('./expected'),
        }
    );

