import { IParseResult } from "./parse-result";

export interface IParser
{
    parse(): IParseResult;
    watch(onChange: () => void): void;
}