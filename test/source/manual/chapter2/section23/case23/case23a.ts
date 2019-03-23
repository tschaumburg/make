import * as mocha from "mocha";
import { multiTestcase, successFile, error } from "../../../../fixtures"
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { deleteFiles, touchFiles } from "../../../../test-utils";

// +------+---------------------------------+---------+-----------------+
// | case |       Files (newest first)      | Targets | Expected output |
// +------+---------------------------------+---------+-----------------+
// |   a  | defs.h, commands.h kbd.c main.c |   edit  |   build main.o  |
// |      |                                 |         |   build kbd.o   |
// |      |                                 |         |   build edit    |
// +------+------------+--------------------+---------+-----------------+
export const loadTests = 
    simpleTest(
        {
            title: 'case a: all',
            makefileName: require.resolve('./makefile'),
            prepare: () => 
            {
                 deleteFiles("*.o", "edit");
                 touchFiles("defs.h", "command.h", "kbd.c", "main.c");
            },
            targets: ['edit'],
            expectedName: [
                'build main.o',
                'build kbd.o',
                'build edit'
            ]
        }
    );
