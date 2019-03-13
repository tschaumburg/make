import * as path from "path";

import * as case1a from "./case1a";
import * as case1b from "./case1b";
import * as case1c from "./case1c";
import * as case1d from "./case1d";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "case1");
        describe('case1: Simple implicit rule', function ()
        {
            case1a.loadTests(thisDir, 1);
            case1b.loadTests(thisDir, 2);
            case1c.loadTests(thisDir, 3);
            case1d.loadTests(thisDir, 4);
        });
    }
