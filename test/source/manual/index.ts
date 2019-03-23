import * as mocha from "mocha";
import * as chapter2 from "./chapter2";
import * as chapter3 from "./chapter3";
import * as chapter4 from "./chapter4";
import * as chapter5 from "./chapter4";
import * as chapter10 from "./chapter10";

export function loadTests(baseDir: string)
{
    var thisDir = "C:/Users/Thomas/npm-make-test";
    describe('Cases from GNU make manual', function ()
    {
        this.timeout(10000);
        chapter2.loadTests(thisDir);
        chapter3.loadTests(thisDir);
        chapter4.loadTests(thisDir);
        //chapter5.loadTests(thisDir);
        chapter10.loadTests(thisDir);
    });
}
