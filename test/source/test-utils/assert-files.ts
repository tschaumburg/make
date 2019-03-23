import * as glob from "glob";
import * as touch from "touch";

import * as del from "del";

export function assertFiles(fileGlob: string, expectedFiles: string[]): void
{
    var actualFiles: string[] = [];
    
    for (let f of glob.sync(fileGlob)||[])
    {
        actualFiles.push(f);
    }

    expectedFiles = expectedFiles.sort();
    actualFiles = actualFiles.sort();

    if (expectedFiles.length == actualFiles.length)
    {
        if (expectedFiles.every(f => actualFiles.indexOf(f) >= 0))
        {
            return;
        }
    }

    throw new Error(
        "Custom assert failed: unexpected files matching '" + fileGlob + "'" +
        "EXPECTED (" + expectedFiles.join(" ") + ")" + 
        "ACTUAL (" + actualFiles.join(" ") + ")"
    );
}
