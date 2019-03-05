import { Target } from "./target";
import { findNextSplitter, splitPattern, unescapeTargetName } from "./split-target-list";
import { TargetPattern } from "./target-pattern";
import { TargetName } from "./target-name";
import { IParseContext } from "../../../parse-result";
import { IParseLocation } from "../../parse-location";

export function createTarget(
    src: string,
    location: IParseLocation, 
    parseContext: IParseContext,
    basedir: string 
): Target
{
    if (findNextSplitter(src, "%",0) >= 0)
    {
        return createTargetPattern(src, location, parseContext, basedir);
    }
    else
    {
        return createTargetName(src, location, parseContext, basedir);
    }
}

export function createTargetName(
    src: string,
    location: IParseLocation, 
    parseContext: IParseContext,
    basedir: string 
): TargetName
{
    var splitterIndex = findNextSplitter(src, "%", 0);
    if (splitterIndex >= 0)
    {
        throw new Error(
            "Expected target name, but got target pattern (unescaped '%' at index " 
            + splitterIndex 
            + " in '" 
            + src 
            + "' - consider using '\\%')"
        );
    }

    return new TargetName(location, parseContext, basedir, unescapeTargetName(src));
}

export function createTargetPattern(
    src: string,
    location: IParseLocation, 
    parseContext: IParseContext,
    basedir: string 
): TargetPattern
{
    if (!src)
        return null;
    
    var parts = splitPattern(src, "%");

    if (parts.length < 2)
        throw new Error("Expected a target pattern, but no unescaped '%' was found");

    if (parts.length > 2)
        throw new Error("Target pattern contained more than one unescaped '%'");

    return new TargetPattern(location, parseContext, basedir, unescapeTargetName(parts[0]), unescapeTargetName(parts[1]));
}
