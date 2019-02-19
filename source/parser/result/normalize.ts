// export function normalize(src: string):string
// {
//     return src.replace(/\\(.)/g, "$1");
// }

// const escape: string = "\\";
// // const splitter: string = "%"; 

// function nextSplitter(src: string, splitter: string, startIndex: number): number
// {
//     if (!src)
//         return -1;

//     if (startIndex >= src.length)
//         return -1;

//     var escapeMode = false;
//     for (var n = startIndex; n<src.length; n++)
//     {
//         let c = src[n];
//         if (escapeMode == false && c === splitter)
//         {
//             return n;
//         }

//         if (escapeMode == false && c === escape)
//         {
//             escapeMode = true;
//         }
//     }

//     return -1;
// }

// export function splitPattern(src: string, splitter: string): string[]
// {
//     if (!src)
//         return null;

//     var res: string[] = [];

//     let latest = -1;
//     for (var next = nextSplitter(src, splitter, latest + 1); next >= 0; next = nextSplitter(src, splitter, latest + 1))
//     {
//         res.push(src.substring(latest + 1, next));
//         latest = next;
//     }

//     res.push(src.substring(latest + 1));
//     return res;
// }

// export function isPattern(src: string): boolean
// {
//     return nextSplitter(src, "%", 0) >= 0;
// }
