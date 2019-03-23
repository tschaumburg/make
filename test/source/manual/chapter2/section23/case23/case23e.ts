import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles, touchFilesRelative } from "../../../../test-utils";

//
// +------+---------------------------------+---------+----------------------+
// | case |       Files (oldest first)      | Targets |    Expected output   |
// +------+---------------------------------+---------+----------------------+
// |  e   | command.h defs.h kbd.c          |  edit   |     build main.o     |
// |      | kbd.o main.o edit               |         |     build edit       |  
// |      | main.c                          |         |                      |
// +------+---------------------------------+---------+----------------------+
export const loadTests = 
    simpleTest(
        {
            title: "case 1e: source-file changed",
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                deleteFiles("*.o", "edit");
                touchFilesRelative(-30, "command.h", "defs.h", "kbd.c");
                touchFilesRelative(-20, "kbd.o", "main.o");
                touchFilesRelative(-10, "edit");
                touchFilesRelative(  0, "main.c");
            },
            targets: ['edit'],
            expectedName: [
                'build main.o',
                'build edit'
            ]
        }
    );
