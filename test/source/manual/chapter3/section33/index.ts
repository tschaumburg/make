import * as mocha from "mocha";
import { multiTestcase } from "../../../fixtures"
import * as setup33 from "./setup";

export function loadTests(): void
{
    //*******************************************
    //*  3.3 Including Other Makefiles:
    //*  =====================================
    //*******************************************
    describe('3.3 Including Other Makefiles', function ()
    {
        multiTestcase(
            {
                makefile: setup33.makefiles1,
                id: "testing/33/1",
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
