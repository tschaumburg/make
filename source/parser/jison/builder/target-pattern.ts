import { ITarget } from "./target";
import { IJisonLocation } from "./location";

export class TargetPattern implements ITarget
{
    public readonly name: string;

    constructor(
        public readonly location: IJisonLocation, 
        public readonly prefix: string,
        public readonly postfix: string
    )
    {
        this.name = this.prefix + "%" + this.postfix;
    }

    public isPattern(): boolean
    {
        return true;
    }
}

export function toPattern(src: ITarget): TargetPattern 
{
    if (!src)
        return null;

    if (!src.isPattern())
        throw new Error(`Target ${this.name} (line ${this.location.first_line}, pos ${this.location.first_column}) is not a pattern`);

    return src as TargetPattern;
}

export function asPattern(context: string, src: ITarget[], min: number, max: number = -1): TargetPattern[]
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

    return src.map(t => toPattern(t));
}
