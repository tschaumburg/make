import * as glob from "glob";
import * as touch from "touch";

import * as del from "del";

export function deleteFiles(...files: string[]): void
{
    for (let pattern of files)
    {
        for (let f of glob.sync(pattern))
        {
            //console.log("touching " + f + " at " + Date.now());
            touch.sync(f, { time: Date.now(), mtime: true });
        }
    }
}

// {
//     del.sync(path);
// }
