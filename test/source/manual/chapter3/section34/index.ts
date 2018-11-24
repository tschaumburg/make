import * as mocha from "mocha";
import { multiTestcase } from "../../../fixtures"
import * as case1 from "./case1";
import * as case3 from "./case3";
import * as case4 from "./case4";

export function loadTests(): void
{
    //*******************************************
    //*  3.4 The Variable MAKEFILES:
    //*  =====================================
    //*******************************************
    describe('3.4 The Variable MAKEFILES', function ()
    {
        multiTestcase(
            {
                makefile:  case1.makefile,
                id: "testing/34/1",
            },
            {
                title: "case 1",
                prepare: clean,
                env: case1.env,
                targets: case1.target,
                expect: case1.expected
            },
        );
        multiTestcase(
            {
                makefile: case3.makefile,
                id:"testing/34/3",
            },
            {
                title: "case 3",
                prepare: clean,
                env: case3.env,
                targets: case3.target,
                expect: case3.expected
            },
        );
        multiTestcase(
            {
                makefile: case4.makefile,
                id: "testing/34/4",
            },
            {
                title: "case 4",
                prepare: clean,
                env: case4.env,
                targets: case4.target,
                expect: case4.expected
            },
        );
    });
}

function clean(): void
{
//    rm(['./*.o', '!./Makefile', '!./.makelog']);
}
