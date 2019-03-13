import * as path from "path";

import { error, ExpectedSuccess, ExpectedError, success } from "../../../../fixtures";
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../../test-utils";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "case2");
    describe('case2: Adding explicit dependency to implicit rule', function ()
    {
        var nextCaseNo = 1;
        registerTestcase(thisDir, nextCaseNo++, [], 109);
        registerTestcase(thisDir, nextCaseNo++, ['h'], 109);
        registerTestcase(thisDir, nextCaseNo++, ['src'], 109);
        registerTestcase(thisDir, nextCaseNo++, ['h', 'src'], ['intermediate', 'target']);

        registerTestcase(thisDir, nextCaseNo++, ['intermediate', 'src', 'h'], ['intermediate', 'target']);
        registerTestcase(thisDir, nextCaseNo++, ['intermediate', 'h', 'src'], ['intermediate', 'target']);
        registerTestcase(thisDir, nextCaseNo++, ['src', 'intermediate', 'h'], ['intermediate', 'target']);
        registerTestcase(thisDir, nextCaseNo++, ['h', 'intermediate', 'src'], ['intermediate', 'target']);
        registerTestcase(thisDir, nextCaseNo++, ['src', 'h', 'intermediate'], ['target']);
        registerTestcase(thisDir, nextCaseNo++, ['h', 'src', 'intermediate'], ['target']);
    });

}

const letters = "-abcdefghijklmnopqrstuvwxyz";
function registerTestcase(thisDir: string, caseNo: number, generateFiles: string[], expect: string[]|number): void
{
    var caseId = letters[caseNo];
    var registrar =
        simpleTest(
            {
                title: 'case 2' + caseId, // + ': foo.src but no foo.intermediate => build foo.intermediate, ',
                makefileName: require.resolve('./makefile'),
                prepare: () => 
                {
                    deleteFiles("foo*");

                    var relativeMillis = 0;
                    for (var n = generateFiles.length - 1; n >= 0; n--)
                    {
                        touchFilesRelative(relativeMillis, "foo." + generateFiles[n]);
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
        return expect.map(x => "building foo." + x)
    }
}
