import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../fixtures"

import * as case1 from "./case1";
import * as case2 from "./case2";
import * as case3 from "./case3";
import * as case4 from "./case4";
import * as case6 from "./case6";

export function loadTests(): void
{
    //*******************************************
    //*  3.7 How make Reads a Makefile
    //*  =====================================
    //*******************************************
    describe('3.7 How make Reads a Makefile', function ()
    {
        case1.loadTests(1);
        case2.loadTests(2);
        case3.loadTests(3);
        case4.loadTests(4);
        case6.loadTests(6);
    });
}
