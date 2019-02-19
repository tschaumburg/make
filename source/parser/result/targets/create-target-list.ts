import { IParseLocation, IParseContext } from "../result-builder";
import { Target } from "./target";
import { splitTargetList } from "./split-target-list";
import { createTarget, createTargetName } from "./create-target";
import { TargetName } from "./target-name";

export function createTargetList(
    src: string,
    location: IParseLocation, 
    parseContext: IParseContext,
    basedir: string 
): Target[]
{
    var res = splitTargetList(src).map(t => createTarget(t, location, parseContext, basedir));
    return res;
}

export function createTargetNameList(
    src: string,
    location: IParseLocation, 
    parseContext: IParseContext,
    basedir: string 
): TargetName[]
{
    var res = splitTargetList(src).map(t => createTargetName(t, location, parseContext, basedir));
    return res;
}
