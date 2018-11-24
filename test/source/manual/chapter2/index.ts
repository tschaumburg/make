import * as mocha from "mocha";
import * as section21 from "./section21";
import * as section22 from "./section22";
import * as section23 from "./section23";
import * as section24 from "./section24";
//import * as section25 from "./section25";
//import * as section26 from "./section26";

export function loadTests()
{
    describe('Chapter 2', function ()
    {
        section21.loadTests();
        section22.loadTests();
        section23.loadTests();
        section24.loadTests();
        //section25.loadTests();
        //section26.loadTests();
    });
}
