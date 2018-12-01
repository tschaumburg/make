import * as mocha from "mocha";
import * as case25A from "./case25A";

export function loadTests()
{
    describe('Section 2.5', function ()
    {
        case25A.loadTests();
        //section22.loadTests();
        //section23.loadTests();
        //section24.loadTests();
        //section25.loadTests();
        //section26.loadTests();
    });
}
