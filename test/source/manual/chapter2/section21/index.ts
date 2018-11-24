import * as mocha from "mocha";
import * as case21A from "./case21A";
import * as case21B from "./case21B";

export function loadTests()
{
    describe('Section 2.1: What a rule looks like', function ()
    {
        case21A.loadTests();
        case21B.loadTests();
    });
}
