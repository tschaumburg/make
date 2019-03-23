import * as path from "path";
import * as mocha from "mocha";
//import * as section22 from "./section22";
//import * as section23 from "./section23";
//import * as section24 from "./section24";
//import * as section25 from "./section25";
//import * as section26 from "./section26";
//import * as section31 from "./section31";
import * as section33 from "./section33";
import * as section34 from "./section34";
import * as section35 from "./section35";
import * as section37 from "./section37";

export function loadTests(baseDir: string)
{
    describe('Chapter 03', function ()
    {
        var thisDir = path.join(baseDir, "chapter03");
        //section31.loadTests();
        section33.loadTests(thisDir);
        section34.loadTests(thisDir);
        section35.loadTests(thisDir);
        section37.loadTests(thisDir);
    });
}
