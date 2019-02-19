import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, deleteFiles } from "../../../../test-utils";

export const loadTests = 
    simpleTest(
        {
            title: 'foo.o is up-to-date',
            makefileName: require.resolve('./makefile'),
            prepare: () => { 
                touchFiles(
                    "defs.h",
                    "foo.c",
                    "foo.o",
                ); 
            },
            targets: ['foo.o'],
            expectedName: require.resolve('./expected'),
        }
    );

