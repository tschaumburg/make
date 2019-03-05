import { Target } from "./target";
import { splitTargetList } from "./split-target-list";
import { createTarget, createTargetName, createTargetPattern } from "./create-target";
import { TargetName } from "./target-name";
import { IParseContext } from "../../../parse-result";
import { IParseLocation } from "../../parse-location";
import { TargetPattern } from "./target-pattern";

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

export function createTargetPatternList(
    src: string,
    location: IParseLocation, 
    parseContext: IParseContext,
    basedir: string 
): TargetPattern[]
{
    var res = splitTargetList(src).map(t => createTargetPattern(t, location, parseContext, basedir));
    return res;
}
