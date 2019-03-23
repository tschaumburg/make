import * as path from "path";
import * as mocha from "mocha";
import * as section21 from "./section21";
import * as section22 from "./section22";
import * as section23 from "./section23";
import * as section24 from "./section24";
//import * as section25 from "./section25";
//import * as section26 from "./section26";

export function loadTests(baseDir: string)
{
    describe('Chapter 02', function ()
    {
        var thisDir = path.join(baseDir, "chapter02");
        section21.loadTests(thisDir);
        section22.loadTests(thisDir);
        section23.loadTests(thisDir);
        section24.loadTests(thisDir);
        //section25.loadTests(thisDir);
        //section26.loadTests(thisDir);
    });
}
