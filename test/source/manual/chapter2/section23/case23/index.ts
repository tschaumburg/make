import * as path from "path";

import * as caseA from "./case23a";
import * as caseB from "./case23b";
import * as caseC from "./case23c";
import * as caseD from "./case23d";
import * as caseE from "./case23e";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "case23");
        describe('case 23: Testing recursive out-of-date detection', function ()
        {
            caseA.loadTests(thisDir, 1);
            caseB.loadTests(thisDir, 2);
            caseC.loadTests(thisDir, 3);
            caseD.loadTests(thisDir, 4);
            caseE.loadTests(thisDir, 5);
        });
    }
