import { ITarget, IParseResult } from "../../parse-result";
import { IParseEvents } from "../parse-events";

export interface IParseResultBuilder extends IParseEvents
{
    setDefaultTarget(val: ITarget): void;
    clearDefaultTarget(): void;
    build(): IParseResult;
}

