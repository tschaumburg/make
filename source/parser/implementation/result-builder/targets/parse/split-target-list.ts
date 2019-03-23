const escape: string = "\\";
// const splitter: string = "%"; 

export function findNextSplitter(src: string, splitter: string, startIndex: number): number
{
    if (!src)
        return -1;

    if (startIndex >= src.length)
        return -1;

    var escapeMode = false;
    for (var n = startIndex; n<src.length; n++)
    {
        if (escapeMode)
        {
            escapeMode = false;
            continue;
        }

        let c = src[n];
        if (c === splitter)
        {
            return n;
        }

        if (c === escape)
        {
            escapeMode = true;
        }
    }

    return -1;
}

export function splitPattern(src: string, splitter: string): string[]
{
    if (!src)
        return null;

    var res: string[] = [];

    let latest = -1;
    for (var next = findNextSplitter(src, splitter, latest + 1); next >= 0; next = findNextSplitter(src, splitter, latest + 1))
    {
        res.push(src.substring(latest + 1, next));
        latest = next;
    }

    res.push(src.substring(latest + 1));
    return res;
}

export function isPattern(src: string): boolean
{
    return findNextSplitter(src, "%", 0) >= 0;
}

export function splitTargetList(targetList: string): string[]
{
    let list = splitPattern(targetList, " ");
    //console.error(JSON.stringify(src) + " => " + JSON.stringify(list));

    if (!list)
        return [];

    var res =
        list
        .filter(t => (!!t))
        .map(t => t.trim())
        .filter(t => t.length>0);

    return res;
}


const _escapes = " #%:;\\|";
export function unescapeTargetName(src: string): string
{
    var res = "";
    var escapeMode = false;
    for (var n = 0; n<src.length; n++)
    {
        if (escapeMode)
        {
            escapeMode = false;
            if (_escapes.indexOf(src[n])<0)
            {
                res = res + "\\";
            }
            res = res + src[n];
        }
        else if (src[n]==="\\")
        {
            escapeMode = true;
        }
        else
        {
            res = res + src[n];
        }
    }

    if (escapeMode)
        res = res + "\\";

    return res;
}
