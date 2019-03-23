import * as path from "path";
import * as mocha from "mocha";
import { multiTestcase } from "../../../fixtures"
import * as setup33 from "./setup";

export function loadTests(baseDir: string): void
{
    var thisDir = path.join(baseDir, "section03");
    //*******************************************
    //*  3.3 Including Other Makefiles:
    //*  =====================================
    //*******************************************
    describe('3.3 Including Other Makefiles', function ()
    {
        multiTestcase(
            {
                makefile: setup33.makefiles1,
                id: path.join(thisDir, "1"),
            },
            {
                title: "case 1",
                prepare: clean,
                targets: setup33.targets1,
                expect: setup33.expected1
            },
        );
    });
}

function clean(): void
{
//    rm(['./*.o', '!./Makefile', '!./.makelog']);
}
