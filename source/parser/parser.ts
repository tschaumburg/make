import { IParseResult } from "./result";

export interface IParser
{
    parse(): IParseResult;
    watch(onChange: () => void): void;
}