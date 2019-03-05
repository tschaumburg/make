import { IParseEvents } from "../parse-events";

export interface IParserContext
{
    resultBuilder: IParseEvents;
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
