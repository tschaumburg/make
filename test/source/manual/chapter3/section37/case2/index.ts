import * as path from "path";
import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"

export function loadTests(basedir: string, caseNo: number): void
{
    //*******************************************
    //*  3.7 How make Reads a Makefile
    //*  =====================================
    //*******************************************
    describe('3.7.' + caseNo + ' "?=" assignment is deferred', function ()
    {
        multiTestcase(
            {
                makefile: require.resolve('./makefile'),
                id: path.join(basedir, "" + caseNo)
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
