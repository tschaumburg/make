import * as path from "path";

import { error, ExpectedSuccess, ExpectedError, success } from "../../../../fixtures";
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../../test-utils";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "case3");
    describe('case3: Multiple implicit rules', function ()
    {
        var nextCaseNo = 1;
        registerTestcase(thisDir, nextCaseNo++, [], 106);
        registerTestcase(thisDir, nextCaseNo++, ['foo.src1'], ['build from foo.src1']);
        registerTestcase(thisDir, nextCaseNo++, ['foo.src2'], ['build from foo.src2']);
        registerTestcase(thisDir, nextCaseNo++, ['foo.src1', 'foo.src2'], ['build from foo.src1']);
    });

}

const letters = "-abcdefghijklmnopqrstuvwxyz";
function registerTestcase(thisDir: string, caseNo: number, generateFiles: string[], expect: string[]|number): void
{
    var caseId = letters[caseNo];
    var registrar =
        simpleTest(
            {
                title: 'case 3' + caseId, // + ': foo.src but no foo.intermediate => build foo.intermediate, ',
                makefileName: require.resolve('./makefile'),
                prepare: () => 
                {
                    deleteFiles("foo*");

                    var relativeMillis = 0;
                    for (var n = generateFiles.length - 1; n >= 0; n--)
                    {
                        touchFilesRelative(relativeMillis, generateFiles[n]);
                        relativeMillis = relativeMillis - 300;
                    }
                },
                targets: ['foo.target'],
                expectedName: expectation(expect)
            }
        );

    registrar(thisDir, caseNo);
}

function expectation(expect: string[]|number): string|string[]|ExpectedError|ExpectedSuccess
{
    if (typeof expect === 'number')
    {
        return error(expect);
    }
    else
    {
        return expect; 
    }
}
