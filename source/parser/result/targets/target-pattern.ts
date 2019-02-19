import { Target } from "./target";
import { IParseLocation, IParseContext } from "../result-builder";
import { splitPattern } from "./split-target-list";

export class TargetPattern extends Target
{
    public isPattern(): boolean
    {
        return true;
    }

    match(name: string): string
    {
        let stemLength = name.length - (this.prefix.length + this.postfix.length);
        if (stemLength <= 0)
            return null;

        if (!name.startsWith(this.prefix))
            return null;

        if (!name.endsWith(this.postfix))
            return null;

        return name.substr(this.prefix.length, stemLength);
    }
    
    public expand(stem: string): string
    {
        return this.prefix + stem + this.postfix;
    }

    constructor(
        location: IParseLocation, 
        parseContext: IParseContext, 
        basedir: string,
        public readonly prefix: string,
        public readonly postfix: string
    ) { super(location, parseContext, basedir, prefix + "%" + postfix); }
}

