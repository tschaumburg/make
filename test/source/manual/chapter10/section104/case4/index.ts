import * as path from "path";

import * as case4a from "./case4a";
import * as case4b from "./case4b";
import * as case4c from "./case4c";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "case4");
    describe(
        'case4: Using .INTERMEDIATE', 
        function ()
        {
            case4a.loadTests(thisDir, 1);
            case4b.loadTests(thisDir, 2);
            case4c.loadTests(thisDir, 3);
        }
    );
}
