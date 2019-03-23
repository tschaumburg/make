import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../../test-utils";

//   "The recompilation must be done if the source file, or any of the header 
//    files named as prerequisites, is more recent than the object file, or if
//    the object file does not exist."
//
// +------+---------------------------------+---------+----------------------+
// | case |       Files (oldest first)      | Targets |    Expected output   |
// +------+---------------------------------+---------+----------------------+
// |   b  | defs.h, commands.h kbd.c main.c |   edit  | 'edit' is up to date |  
// |      | kbd.o main.o edit               |         |                      |
// +------+---------------------------------+---------+----------------------+
//
export const loadTests = 
    simpleTest(
        {
            title: 'case b: none',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                deleteFiles("*.o", "edit");
                touchFilesRelative(-30, "defs.h", "command.h", "kbd.c", "main.c");
                touchFilesRelative(-20, "kbd.o", "main.o");
                touchFilesRelative(-10, "edit");
            },
            targets: ['edit'],
            expectedName: [
                "'edit' is up to date"
            ]
        }
    );
