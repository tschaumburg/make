import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";

export const loadTests = 
    simpleTest(
        {
            title: '"define !=" assignment is immediate',
            makefileName: require.resolve('./makefile'),
            targets: ['run'],
            expectedName: require.resolve('./expected')
        }
    );

function clean(): void
{
//    rm(['./*.o', '!./Makefile', '!./.makelog']);
}
