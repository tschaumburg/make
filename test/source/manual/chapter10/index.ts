import * as path from "path";
import * as mocha from "mocha";
import * as section101 from "./section101";
import * as section104 from "./section104";

export function loadTests(baseDir: string)
{
    describe('Chapter 10', function ()
    {
        var thisDir = path.join(baseDir, "chapter10"); // "C:/Users/Thomas/npm-make-test/testing";
        section101.loadTests(thisDir);
        section104.loadTests(thisDir);
    });
}
