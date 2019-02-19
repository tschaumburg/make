import { IActualResult } from "./actual-result";

export interface IExpectedResult
{
    lines(): string[];
    assertActual(actual: IActualResult): void;
}

export function linesMatch(first: string[], second: string[]): boolean
{
    //return true;
    first = first.map(s => s.trim()).filter(s => !!s && s.length > 0);
    second = second.map(s => s.trim()).filter(s => !!s && s.length > 0);

    if (first.length != second.length)
    {
        //console.log("length " + first.length + "!=" + second.length);
        return false;
    }

    for (var n in first)
    {
        if (first[n] !== second[n])
        {
            return false;
        }
    }

    return true;
}
