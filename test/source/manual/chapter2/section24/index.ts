import * as path from "path";
import * as mocha from "mocha";
import * as case24A from "./case24A";

export function loadTests(baseDir: string)
{
    var thisDir = path.join(baseDir, "section04");
    describe('2.4', function ()
    {
        case24A.loadTests(thisDir);
        //section22.loadTests();
        //section23.loadTests();
        //section24.loadTests();
        //section25.loadTests();
        //section26.loadTests();
    });
}
