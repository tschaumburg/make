import * as mocha from "mocha";
import * as case22A from "./case22A";

export function loadTests()
{
    describe('Section 2.2: A Simple Makefile', function ()
    {
        case22A.loadTests();
    });
}
