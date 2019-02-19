import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, deleteFiles } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'foo.o is out-of-date if foo.o does not exist',
            makefileName: require.resolve('./makefile'),
            prepare: () => { 
                deleteFiles(
                    "foo.o",
                );
                touchFiles(
                    "defs.h",
                    "foo.c",
                ); 
            },
            targets: ['foo.o'],
            expectedName: require.resolve('./expected'),
        }
    );

    