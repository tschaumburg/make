import * as glob from "glob";
import * as touch from "touch";

import * as del from "del";

export function listFiles(...files: string[]): void
{
    var res: string[] = [];
    for (let pattern of files)
    {
        for (let f of glob.sync(pattern)||[])
        {
            res.push(f);
        }
    }

    for (var s of res.sort())
    {
        console.log("XX" + s);
    }
}
