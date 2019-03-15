import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, deleteFiles, touchFilesRelative } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'foo.o is out-of-date if foo.c is more recent',
            makefileName: require.resolve('./makefile'),
            prepare: () => { 
                touchFiles(
                ); 
                touchFilesRelative(-2, "defs.h");
                touchFilesRelative(-1, "foo.o");
                touchFilesRelative(0, "foo.c");
            },
            targets: ['foo.o'],
            expectedName: require.resolve('./expected'),
        }
    );

