import * as glob from "glob";
import * as touch from "touch";

export function touchFiles(...files: string[]): void
{
    touchFilesRelative(0, ...files);
}

export function touchFilesRelative(relativeMillis: number , ...files: string[]): void
{
    if (relativeMillis==undefined)
    {
        relativeMillis = 0;
    }

    var timestamp = Date.now() + relativeMillis;

    for (let _pattern of files)
    {
        //console.error("TOUCH start " + _pattern);;
        if (glob.hasMagic(_pattern))
        {
            for (let f of glob.sync(_pattern)||[])
            {
                //console.error("TOUCH " + f);
                touch.sync(f, { time: timestamp++, mtime: true });
            }
        }
        else
        {
            //console.error("TOUCH " + _pattern);
            touch.sync(_pattern, { time: timestamp++, mtime: true });
        }
    }
}

