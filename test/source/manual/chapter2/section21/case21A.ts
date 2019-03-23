import * as path from "path";
import { multiTestcase, deleteFiles, touchFiles, error } from "../../.."

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "case21a");
    describe('21A: Testing basic out-of-date detection', function ()
    {
        multiTestcase(
            {
                makefile: [
                    'hello.exe: hello.c  # comment',
                    '\t  dir > log.txt',
                    '\t  echo cc hello.c -o hello.exe',''
                ],
                id: thisDir,
                title: "updates out-of-date targets"
            },
            {
                title: "Simple build",
                prepare: function ()
                {
                    touchFiles("hello.c");
                    deleteFiles("hello.exe");
                },
                targets: ["hello.exe"],
                expect: [
                    'cc hello.c -o hello.exe'
                ]
            },
        );
    });
}
