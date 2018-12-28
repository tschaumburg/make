import { Target } from "./target";
import { IParseLocation, IParseContext } from "../result-builder";

export class TargetName extends Target
{
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