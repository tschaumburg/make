import * as fs from "fs";
import * as path from "path";
import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../fixtures"
import { simpleTest } from "../../../fixtures/testcases/simple-testcase";

import * as case1 from "./case1";
import * as case2 from "./case2";
import * as case3 from "./case3";
import * as case4 from "./case4";

export function loadTests(baseDir: string): void
{
    //*******************************************
    //*  4.2 Rule syntax
    //*  =====================================
    //*******************************************
    var thisDir = path.resolve(baseDir, "42"); // "C:/Users/Thomas/npm-make-test/testing/42"; // 41");
    describe('4.2 Rule syntax', function ()
    {
        case1.loadTests(thisDir);
        case2.loadTests(thisDir);
        case3.loadTests(thisDir);
        case4.loadTests(thisDir);
    });
}
