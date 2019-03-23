import * as fs from "fs";
import * as path from "path";
import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../fixtures"
import { simpleTest } from "../../../fixtures/testcases/simple-testcase";

import * as case1 from "./case1";
import * as case4 from "./case4";
import * as case5 from "./case5";
import * as case6 from "./case6";
import * as case7 from "./case7";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "section4");
    describe('10.4: ', function ()
    {
        case1.loadTests(thisDir);
        case4.loadTests(thisDir);
        // case5.loadTests(thisDir);
        // case6.loadTests(thisDir);
        // case7.loadTests(thisDir);
    });
}
