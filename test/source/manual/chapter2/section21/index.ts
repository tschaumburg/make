import * as path from "path";
import * as mocha from "mocha";
import * as case21A from "./case21A";
import * as case21B from "./case21B";

export function loadTests(baseDir: string)
{
    var thisDir = path.join(baseDir, "section01");
    describe('2.1: What a rule looks like', function ()
    {
        case21A.loadTests(thisDir);
        case21B.loadTests(thisDir);
    });
}
