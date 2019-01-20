import * as mocha from "mocha";
import { multiTestcase, deleteFiles, touchFiles, error } from "../../.."

export function loadTests(): void
{
    describe('21A: Testing basic out-of-date detection', function ()
    {
        multiTestcase(
            {
                makefile: [
                    'hello.exe: hello.c  # comment',
                    '\t  dir > log.txt',
                    '\t  echo cc hello.c -o hello.exe',''
                ],
                id: "21A",
                title: "updates out-of-date targets"
            },
            {
                title: "Simple build",
                prepare: function ()
                {
                    console.error("PREPARE wd=" + process.cwd());
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
