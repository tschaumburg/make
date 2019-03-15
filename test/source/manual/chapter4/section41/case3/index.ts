import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, deleteFiles, touchFilesRelative } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'foo.o is out-of-date if defs.h is more recent',
            makefileName: require.resolve('./makefile'),
            prepare: () => { 
                touchFiles(
                    "foo.c",
                    "foo.o",
                    "defs.h",
                ); 
                touchFilesRelative(-2, "foo.c");
                touchFilesRelative(-1, "foo.o");
                touchFilesRelative(0, "defs.h");
    },
            targets: ['foo.o'],
            expectedName: require.resolve('./expected'),
        }
    );

