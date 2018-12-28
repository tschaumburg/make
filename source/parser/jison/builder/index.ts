export * from "./location";
export * from "./target";
export * from "./target-pattern";
export * from "./target-name";
export * from "./builder";

import { IJisonLocation } from "./location";
import { ITarget } from "./target";
import { TargetPattern } from "./target-pattern";
import { TargetName } from "./target-name";

export function target(location: IJisonLocation, src: string): ITarget
{
    var splitter = /((?:[^\\%]|(?:\\.))*)[%](.*)/;
    var parts = src.match(splitter);

    if (!parts)
    {
        return new TargetName(location, normalize(src));
    }

    if (parts.length !== 2)
    {
        return new TargetName(location, normalize(src));
    }

    return new TargetPattern(location, normalize(parts[0]), normalize(parts[1]));
}

function normalize(src: string):string
{
    return src.replace(/\\(.)/g, "$1");
}
