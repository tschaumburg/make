import * as mocha from "mocha";
import * as chapter2 from "./chapter2";
import * as chapter3 from "./chapter3";

export function loadTests()
{
    describe('Cases from GNU make manual', function ()
    {
        this.timeout(10000);
        chapter2.loadTests();
        chapter3.loadTests();
    });
}
