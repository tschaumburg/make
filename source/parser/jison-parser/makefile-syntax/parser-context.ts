import { IParseResultBuilder } from "../../result";

export interface IParserContext
{
    resultBuilder: IParseResultBuilder;
    basedir: string;
    include: (makefilename: string) => void
    makefilename: string;
}


export function setContext(yy: any, context: IParserContext): void
{
    yy.makefileParserContext = context;
}

export function getContext(yy: any): IParserContext
{
    return yy.makefileParserContext as IParserContext
}
