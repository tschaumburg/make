import { ITarget, IParseContext, IParseLocation } from "../../../result";

export abstract class Target implements ITarget
{
    protected constructor(
        public readonly location: IParseLocation, 
        public readonly parseContext: IParseContext, 
        public readonly basedir: string,
        public readonly relname: string
    ) {}

    public abstract isPattern(): boolean;
}
