import * as path from "path";
import * as mocha from "mocha";
// import * as case23A from "./case23A";
import * as case23 from "./case23";

export function loadTests(baseDir: string)
{
    var thisDir = path.join(baseDir, "section03");
    describe('2.3: How make Processes a Makefile', function ()
    {
        // case23A.loadTests();
        case23.loadTests(thisDir);
    });
}



