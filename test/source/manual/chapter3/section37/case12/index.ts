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

export function loadTestsOld(caseNo: number): void
{
    //*******************************************
    //*  3.7 How make Reads a Makefile
    //*  =====================================
    //*******************************************
    describe('3.7.' + caseNo + ' "define !=" assignment is immediate', function ()
    {
        multiTestcase(
            {
                makefile: require.resolve('./makefile'),
                id: "testing/37/" + caseNo,
            },
            {
                title: "case " + caseNo,
                targets: ['run'],
                expect: successFile(require.resolve('./expected'))
            },
        );
    });
}

function clean(): void
{
//    rm(['./*.o', '!./Makefile', '!./.makelog']);
}
