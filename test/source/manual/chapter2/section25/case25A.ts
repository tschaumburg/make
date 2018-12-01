import * as mocha from "mocha";
import { multiTestcase, deleteFiles, touchFiles, error } from "../../.."

export function loadTests(): void
{
    describe('21A: Testing basic out-of-date detection', function ()
    {
        multiTestcase(
            {
                makefile: [
                    'objects = main.o kbd.o command.o display.o \\',
                    '          insert.o search.o files.o utils.o',
                    '',
                    '%o: %c',
                    '   cc -c $< -o $@',
                    '',
                    'edit : $(objects)',
                    '        cc -o edit $(objects)',
                    '',
                    'main.o : defs.h',
                    'kbd.o : defs.h command.h',
                    'command.o : defs.h command.h',
                    'display.o : defs.h buffer.h',
                    'insert.o : defs.h buffer.h',
                    'search.o : defs.h buffer.h',
                    'files.o : defs.h buffer.h command.h',
                    'utils.o : defs.h',
                    '',
                    '.PHONY : clean',
                    'clean :',
                    '        rm edit $(objects)',
                                    ],
                id: "21A",
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
