import { ITarget } from "./target";
import { IJisonLocation } from "./location";

export class TargetName implements ITarget
{
    constructor(public readonly location: IJisonLocation, public readonly name: string)
    {}

    public isPattern(): boolean
    {
        return false;
    }
}

export function toExplicit(src: ITarget): TargetName 
{
    if (!src)
        return null;

    if (src.isPattern())
        throw new Error(`Target ${this.name} (line ${this.location.first_line}, pos ${this.location.first_column}) is not a filename`);

    return src as TargetName;
}

export function asExplicit(context: string, src: ITarget[], min: number, max: number = -1): TargetName[]
{
    if (!src)
    {
        return null;
    }

    if (src.length < min)
    {
        throw new Error(context + " must have at least " + min + " target(s) specified");
    }

    if (max >= 0 &&  src.length > max)
    {
        throw new Error(context + " must have at maximum of " + max + " target(s) specified");
    }

    return src.map(t => toExplicit(t));
}
