import * as path from "path";
import * as mocha from "mocha";
//import * as section22 from "./section22";
//import * as section23 from "./section23";
//import * as section24 from "./section24";
//import * as section25 from "./section25";
//import * as section26 from "./section26";
//import * as section31 from "./section31";
// import * as section33 from "./section33";
// import * as section34 from "./section34";
// import * as section35 from "./section35";
import * as section41 from "./section41";
import * as section42 from "./section42";
import * as section43 from "./section43";
import * as section44 from "./section44";

export function loadTests(baseDir: string)
{
    describe('Chapter 04', function ()
    {
        var thisDir = path.join(baseDir, "chapter04");
        section41.loadTests(thisDir);
        section42.loadTests(thisDir);
        section43.loadTests(thisDir);
        section44.loadTests(thisDir);
        // section33.loadTests();
        // section34.loadTests();
        // section35.loadTests();
        // section37.loadTests();
    });
}
