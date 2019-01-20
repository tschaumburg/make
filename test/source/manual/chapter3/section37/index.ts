import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../fixtures"

import * as case1 from "./case1";
import * as case2 from "./case2";
import * as case3 from "./case3";
import * as case4 from "./case4";
import * as case5 from "./case5";
import * as case6 from "./case6";
import * as case7 from "./case7";
import * as case8 from "./case8";
import * as case9 from "./case9";
import * as case10 from "./case10";
import * as case11 from "./case11";
import * as case12 from "./case12";

export function loadTests(): void
{
    //*******************************************
    //*  3.7 How make Reads a Makefile
    //*  =====================================
    //*******************************************
    var thisDir = "C:/Users/Thomas/npm-make-test/testing/37";
    describe('3.7 How make Reads a Makefile', function ()
    {
        case1.loadTests(1);
        case2.loadTests(2);
        case3.loadTests(3);
        case4.loadTests(4);
        case5.loadTests(5);
        case6.loadTests(6);
        
        case7.loadTests(7);
        case8.loadTests(8);
        case9.loadTests(9);
        case10.loadTests(10);
        case11.loadTests(11);
        case12.loadTests(thisDir, 12);
    });
}
