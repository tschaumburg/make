import * as path from "path";
import { multiTestcase, successFile } from "../../../../fixtures"
import { pathExists } from "fs-extra";

export function loadTests(basedir: string, caseNo: number): void
{
    //*******************************************
    //*  3.7 How make Reads a Makefile
    //*  =====================================
    //*******************************************
    describe('3.7.' + caseNo + ' "=" assignment is deferred', function ()
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
