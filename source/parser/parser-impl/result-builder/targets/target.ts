import { ITarget, IParseContext } from "../../../parse-result";
import { IParseLocation } from "../../parse-location";

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
