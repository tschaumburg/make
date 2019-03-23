import * as path from "path";
import { Target } from "./target";
import { IParseContext, IParseLocation, ITargetName } from "../../../result";

export class TargetName extends Target implements ITargetName
{
    public fullname(): string 
    {
        // return path.resolve( this.basedir, this.relname);
        return path.join( this.basedir, this.relname);
        
    }
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
