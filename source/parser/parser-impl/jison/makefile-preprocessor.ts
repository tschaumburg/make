import { findUnescaped } from "./makefile-syntax-utils";

export function findEOL(src: string, startAt: number): number
{
    var currentEscaped = false;

    for (var n = startAt; n < src.length; n++)
    {
        var c = src[n];

        if (!currentEscaped && c==="\\")
        {
            currentEscaped = true;
            continue;
        }

        // if (currentEscaped && c==="\r")
        // {
        //     continue;
        // }

        if (!currentEscaped && c === "\n")
            return n;

        currentEscaped = false;
    }

    return -1;
}

export function preprocess(file: string): string
{
    // console.error("preprocessing file: " + JSON.stringify(file));
    let res = "";
    let latestEnd = -1
    for (var n = findEOL(file, 0); n >=0; n = findEOL(file, n+1))
    {
        //  console.error("eol = " + n);
        let line = file.substring(latestEnd + 1, n + 1);
        //  console.error("preprocessing line: " + JSON.stringify(line));
        let preprocessed = preprocessLine(line);
        // console.error("                =>  " + JSON.stringify(preprocessed));
        res += preprocessed;
        latestEnd = n;

    }

    let line = file.substring(latestEnd + 1);
    res += preprocessLine(line);

    return res;
}

function preprocessLine(line: string): string
{
    if (line.startsWith("\t"))
    {
        // console.error("preprocessing recipe line: " + JSON.stringify(line));
        return preprocessRecipeLine(line);
    }
    else
    {
        var res = preprocessNormalLine(line);
        //console.error("preprocessing normal line: " + JSON.stringify(line) + " => " + JSON.stringify(res));
        return res;
    }
}

// Gnu manual, section 3.1.1:
//
//   "Outside of recipe lines, backslash/newlines are converted
//    into a single space character. Once that is done, all
//    whitespace around the backslash/newline is condensed into
//    a single space: this includes all whitespace preceding the
//    backslash, all whitespace at the beginning of the line
//    after the backslash/newline, and any consecutive backslash/
//    newline combinations."
function preprocessNormalLine(line: string): string
{
    // remove escaped newlines, per the description above:
    let preprocessed = line.replace(/(?:[\t ]*\\\r?\n[\t ]*)+/g, " ");

    return removeComments(preprocessed);
}

function removeComments(line: string): string
{
    let commmentStart = findUnescaped(line, "#");
    if (commmentStart >=0)
    {
        let lineEnd = "\n";
        if (line.endsWith("\r\n"))
            lineEnd = "\r\n";

            line = line.substring(0, commmentStart) + lineEnd;
    }

    return line;
}


// Gnu manual, section 5.1.1:
//
//   "One of the few ways in which make does interpret recipes 
//    is checking for a backslash just before the newline. As in 
//    normal makefile syntax, a single logical recipe line can 
//    be split into multiple physical lines in the makefile by 
//    placing a backslash before each newline. A sequence of lines 
//    like this is considered a single recipe line, and one 
//    instance of the shell will be invoked to run it.
//    
//    However, in contrast to how they are treated in other places 
//    in a makefile (see Splitting Long Lines), backslash/newline 
//    pairs are not removed from the recipe. Both the backslash 
//    and the newline characters are preserved and passed to the 
//    shell. How the backslash/newline is interpreted depends on 
//    your shell. If the first character of the next line after 
//    the backslash/newline is the recipe prefix character (a tab 
//    by default; see Special Variables), then that character (and 
//    only that character) is removed. Whitespace is never added 
//    to the recipe.

function preprocessRecipeLine(line: string): string
{
    let res =  line.replace("\n\t", "\n");
    //console.error("RECIPE: " + res);
    return res;
}

// export function isEscapedEol(line: string): boolean
// {
//     if (!line)
//         return false;

//     if (line.endsWith("\\\r\n"))
//         return true;

//     if (line.endsWith("\\\n"))
//         return true;

//     return false;
// }
// export function preprocessLine(line: string, afterEscEol: boolean): string
// {
//     var res = line;
//     if (afterEscEol)
//     {
//         console.error("replacing leading whitespace in " + line);
//         res = res.replace(/^\s/, "");
//     }

//     if (isEscapedEol(line))
//     {
//         res = res.replace(/(\t| )*\\\r?\n/, "")
//     }
//     console.error("PREPROCESS: " + JSON.stringify(line) + " => " + JSON.stringify(res));
//     return res;
// }