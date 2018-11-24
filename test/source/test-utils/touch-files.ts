import * as glob from "glob";
import * as touch from "touch";

export function touchFiles(...files: string[]): void
{
    for (let pattern of files)
    {
        touch.sync(pattern, { time: Date.now(), mtime: true });
        // for (let f of glob.sync(pattern))
        // {
        //     console.error("touching " + f + " at " + Date.now());
        //     touch.sync(f, { time: Date.now(), mtime: true });
        // }
    }
}

