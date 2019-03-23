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
// |  c   | defs.h kbd.c main.c             |   edit  |     build kbd.o      |  
// |      | kbd.o main.o edit               |         |     build edit       |
// |      | commands.h                      |         |                      |
// +------+---------------------------------+---------+----------------------+
//
export const loadTests = 
    simpleTest(
        {
            title: 'case 1c: header changed',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                deleteFiles("*.o", "edit");
                touchFilesRelative(-30, "defs.h", "kbd.c", "main.c");
                touchFilesRelative(-20, "kbd.o", "main.o");
                touchFilesRelative(-10, "edit");
                touchFilesRelative(  0, "command.h");
            },
            targets: ['edit'],
            expectedName: [
                'build kbd.o',
                'build edit'
            ]
        }
    );
