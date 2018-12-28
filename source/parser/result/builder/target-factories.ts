import { TargetName, TargetPattern, Target } from "../targets";
import { normalize } from "../normalize";
import { IParseLocation, IParseContext } from "../result-builder";

export interface ITargetParseSettings
{
    context?: string;
    min?: number;
    max?: number;
}

export class TargetFactory
{
    static create(location: IParseLocation, context: IParseContext, basedir: string, src: string, ): Target
    {
        if (TargetPatternFactory.isPattern(src))
            return TargetPatternFactory.create(location, context, basedir, src);

        return TargetNameFactory.create(location, context, basedir, src);
    }

    static createList(location: IParseLocation, context: IParseContext, basedir: string, src: string[]): Target[]
    {
        if (!src)
        {
            return null;
        }

        return src.map((s) => TargetFactory.create(location, context, basedir, s))
    }
}

export class TargetNameFactory
{
    static create(location: IParseLocation, context: IParseContext, basedir: string, src: string): TargetName
    {
        var splitter = /((?:[^\\%]|(?:\\.))*)[%](.*)/;
        var parts = src.match(splitter);
    
        if (!parts)
        {
            return new TargetName(location, context, basedir, normalize(src));
        }
    
        if (parts.length !== 2)
        {
            return new TargetName(location, context, basedir, normalize(src));
        }
    
        return null;
    }

    static createList(location: IParseLocation, context: IParseContext, basedir: string, src: string[]): TargetName[]
    {
        if (!src)
        {
            return null;
        }

        return src.map((s) => TargetNameFactory.create(location, context, basedir, s));
    }
}

export class TargetPatternFactory
{
    static create(location: IParseLocation, context: IParseContext, basedir: string, src: string): TargetPattern
    {
        var splitter = /((?:[^\\%]|(?:\\.))*)[%](.*)/;
        var parts = src.match(splitter);
    
        if (!parts)
            return null;
    
        if (parts.length !== 2)
            return null;
    
        return new TargetPattern(location, context, basedir, normalize(parts[0]), normalize(parts[1]));
    }

    static createList(location: IParseLocation, context: IParseContext, basedir: string, src: string[]): TargetPattern[]
    {
        if (!src)
        {
            return null;
        }

        return src.map((s) => TargetPatternFactory.create(location, context, basedir, s))
    }

    public static isPattern(name: string): boolean
    {
        if (!name)
            return false;

        return (normalize(name).indexOf("%") >= 0);
    }
}

