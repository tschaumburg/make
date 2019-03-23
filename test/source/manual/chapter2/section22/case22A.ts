import * as path from "path";
import { suite, it } from "mocha";
import { deleteFiles, touchFiles, error, multiTestcase } from "../../.."
// import * as setup22 from "./setup22";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "case22a");
    describe('22A: Testing the section 2.2 example', function ()
    {
        multiTestcase(
            {
                id: thisDir,
                title: "",
                makefile: [
                    'edit : main.o kbd.o',
                    '\techo build edit',
                    '\tnodetouch edit',
                    'main.o : main.c defs.h',
                    '\techo build main.o',
                    '\tnodetouch main.o',
                    'kbd.o : kbd.c defs.h command.h',
                    '\techo build kbd.o',
                    '\tnodetouch kbd.o',
                    'clean :',
                    '\trm edit main.o kbd.o'
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
                expect: ["'edit' is up to date"]
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
