import * as path from "path";
import * as mocha from "mocha";
import { multiTestcase } from "../../../fixtures"
import * as case1 from "./case1";
import * as case4 from "./case4";

export function loadTests(baseDir: string): void
{
    var thisDir = path.join(baseDir, "section05");

    //*******************************************
    //*  3.5 How Makefiles Are Remade
    //*  =====================================
    //*******************************************
    describe('3.5 How Makefiles Are Remade', function ()
    {
        multiTestcase(
            {
                makefile: case1.makefile,
                id: path.join(thisDir, "case1"),
        },
        ...case1.steps
        );
        multiTestcase(
            {
                makefile: case4.makefile,
                id: path.join(thisDir, "case4"),
            },
            ...case4.steps
        );
    });
}

function clean(): void
{
//    rm(['./*.o', '!./Makefile', '!./.makelog']);
}
