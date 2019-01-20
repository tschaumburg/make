import * as mocha from "mocha";
import { suite, it } from "mocha";
import { deleteFiles, touchFiles, error, multiTestcase } from "../../.."
// import * as setup22 from "./setup22";

export function loadTests(): void
{
    describe('22A: Testing the section 2.2 example', function ()
    {
        multiTestcase(
            {
                id: "22A",
                title: "",
                makefile: [
                    'edit : main.o kbd.o',
                    '   echo build edit',
                    '   nodetouch edit',
                    'main.o : main.c defs.h',
                    '   echo build main.o',
                    '   nodetouch main.o',
                    'kbd.o : kbd.c defs.h command.h',
                    '   echo build kbd.o',
                    '   nodetouch kbd.o',
                    'clean :',
                    '        rm edit main.o kbd.o'
                ],
            },
            {
                title: "all",
                prepare: clean,
                targets: ["edit"],
                expect:
                    [
                        'build main.o',
                        'build kbd.o',
                        'build edit'
                    ]
            },
            {
                title: "none",
                prepare: () => 
                { touchFiles('edit'); },
                targets: ["edit"],
                expect: []
            },
            {
                title: "header changed",
                prepare: () => { touchFiles('command.h'); },
                targets: ["edit"],
                expect:
                    [
                        'build kbd.o',
                        'build edit'
                    ]
            },
            {
                title: "global-use header changed",
                prepare: () => { touchFiles('defs.h'); },
                targets: ["edit"],
                expect:
                    [
                        'build main.o',
                        'build kbd.o',
                        'build edit'
                    ]
            },
            {
                title: "source-file changed",
                prepare: () => { touchFiles('main.c'); },
                targets: ["edit"],
                expect:
                    [
                        'build main.o',
                        'build edit'
                    ]
            }
        );
    });
}

function clean(): void
{
    deleteFiles('*.o', '!./Makefile');
    touchFiles("main.c", "kbd.c", "defs.h", "command.h");
}
