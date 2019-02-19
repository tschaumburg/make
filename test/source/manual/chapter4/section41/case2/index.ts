import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, deleteFiles } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'foo.o is out-of-date if foo.c is more recent',
            makefileName: require.resolve('./makefile'),
            prepare: () => { 
                touchFiles(
                    "defs.h",
                    "foo.o",
                    "foo.c",
                ); 
            },
            targets: ['foo.o'],
            expectedName: require.resolve('./expected'),
        }
    );

