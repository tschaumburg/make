import { Target } from "./target";
import { IParseLocation, IParseContext } from "../result-builder";
import { splitTargetList, splitPattern, findNextSplitter } from "./split-target-list";
import { locateFiles } from "../../../makelog";

export class TargetName extends Target
{
    public isPattern(): boolean
    {
        return false;
    }
    
    constructor(
        location: IParseLocation, 
        parseContext: IParseContext, 
        basedir: string,
        relname: string
    ) 
    {
        super(location, parseContext, basedir, relname); 
    }
}    
