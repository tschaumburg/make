export function normalize(src: string):string
{
    return src.replace(/\\(.)/g, "$1");
}
