import * as mocha from "mocha";
import * as case24A from "./case24A";

export function loadTests()
{
    describe('Section 2.4', function ()
    {
        case24A.loadTests();
        //section22.loadTests();
        //section23.loadTests();
        //section24.loadTests();
        //section25.loadTests();
        //section26.loadTests();
    });
}
