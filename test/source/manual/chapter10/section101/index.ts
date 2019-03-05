import * as fs from "fs";
import * as path from "path";
import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../fixtures"
import { simpleTest } from "../../../fixtures/testcases/simple-testcase";

import * as case1 from "./case1";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "101");
    describe('10.1: ', function ()
    {
        case1.loadTests(thisDir, 1);
    });
}
