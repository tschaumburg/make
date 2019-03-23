import * as path from "path";
import * as case25A from "./case25A";

export function loadTests(baseDir: string)
{
    describe('Section 2.5', function ()
    {
        var thisDir = path.join(baseDir, "section05");
        case25A.loadTests(thisDir);
        //section22.loadTests();
        //section23.loadTests();
        //section24.loadTests();
        //section25.loadTests();
        //section26.loadTests();
    });
}
