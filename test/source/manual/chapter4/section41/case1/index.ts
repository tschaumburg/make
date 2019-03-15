import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, deleteFiles, touchFilesRelative } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'foo.o is out-of-date if foo.o does not exist',
            makefileName: require.resolve('./makefile'),
            prepare: () => { 
                deleteFiles(
                    "foo.o",
                );
                touchFilesRelative(-2, "defs.h");
                touchFilesRelative(-1, "foo.c");
           },
            targets: ['foo.o'],
            expectedName: require.resolve('./expected'),
        }
    );

    