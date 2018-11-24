import * as mocha from "mocha";
import * as case23A from "./case23A";

export function loadTests()
{
    describe('Section 2.3: How make Processes a Makefile', function ()
    {
        case23A.loadTests();
    });
}
