import * as path from "path";
import * as mocha from "mocha";
import * as case22A from "./case22A";

export function loadTests(baseDir: string)
{
    var thisDir = path.join(baseDir, "section02");
    describe('2.2: A Simple Makefile', function ()
    {
        case22A.loadTests(thisDir);
    });
}
