import { IParseResultBuilder } from "../../result";

export interface IParserContext
{
    resultBuilder: IParseResultBuilder;
    basedir: string;
    include: (makefilename: string) => void
    makefilename: string;
}
