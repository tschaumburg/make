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
// |  d   | command.h kbd.c main.c          |   edit  |     build kbd.o      |  
// |      | kbd.o main.o edit               |         |     build main.o     |
// |      | defs.h                          |         |     build edit       |
// +------+---------------------------------+---------+----------------------+
export const loadTests = 
    simpleTest(
        {
            title: 'case 1d: global-use header changed',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                deleteFiles("*.o", "edit");
                touchFilesRelative(-30, "command.h", "kbd.c", "main.c");
                touchFilesRelative(-20, "kbd.o", "main.o");
                touchFilesRelative(-10, "edit");
                touchFilesRelative(  0, "defs.h");
            },
            targets: ['edit'],
            expectedName: [
                'build main.o',
                'build kbd.o',
                'build edit'
            ]
        }
    );
