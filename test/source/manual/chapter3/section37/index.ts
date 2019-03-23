import * as path from "path";
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

export function loadTests(baseDir: string): void
{
    var thisDir = path.join(baseDir, "section07");

    //*******************************************
    //*  3.7 How make Reads a Makefile
    //*  =====================================
    //*******************************************
    var thisDir = path.join(baseDir, "section07");
    describe('3.7 How make Reads a Makefile', function ()
    {
        case1.loadTests(thisDir, 1);
        case2.loadTests(thisDir, 2);
        case3.loadTests(thisDir, 3);
        case4.loadTests(thisDir, 4);
        case5.loadTests(thisDir, 5);
        case6.loadTests(thisDir, 6);
        
        case7.loadTests(thisDir, 7);
        case8.loadTests(thisDir, 8);
        case9.loadTests(thisDir, 9);
        case10.loadTests(thisDir, 10);
        case11.loadTests(thisDir, 11);
        case12.loadTests(thisDir, 12);
    });
}
