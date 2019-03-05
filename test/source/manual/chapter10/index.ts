import * as mocha from "mocha";
import * as section101 from "./section101";

export function loadTests()
{
    describe('Chapter 10', function ()
    {
        var thisDir = "C:/Users/Thomas/npm-make-test/testing";
        section101.loadTests(thisDir);
    });
}
