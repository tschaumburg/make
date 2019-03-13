
// General character classes:
// ==========================
const backslash = "\\\\";
const tab = "\\t";
const inlineWhitespace = " " + tab;
const spc = "[" + inlineWhitespace + "]*";

// Target character classes:
// =========================
const escapeableNameChars = "%:;#|" + inlineWhitespace + backslash;
const disallowedNameChars = "\\r\\n\\x00";
const nameChar = 
    backslash + "[" + escapeableNameChars + "]" + 
    "|" + 
    "[^" + escapeableNameChars + disallowedNameChars + "]";
const targetPart = "(?:" + nameChar + ")*";

// Target names:
// =============
const targetName = "(" + targetPart + ")";
const targetNameList = "^" + spc + "(?:" + targetName + spc + ")*$";

// Target patterns:
// ================
const targetPattern = "(" + targetPart + "[%]"+ targetPart + ")";
const targetPatternList = "^" + spc + "(?:" + targetPattern + spc + ")*$";

export function isNameList(yy, src: string): boolean
{
    if (!src)
        return false;

    let tester = new RegExp(targetNameList, "g");
    let res = tester.test(src); // src.match(tester);
    //console.error("isNameList(" + src + "): " + JSON.stringify(src.match(tester)));
    return (!!res);
}

export function isPatternList(src: string): boolean
{
    if (!src)
        return false;

    let tester = new RegExp(targetPatternList, "g");
    let res = tester.test(src); // src.match(tester);
    //console.error("isPatternList(" + src + "): " + JSON.stringify(src.match(tester)));
    return (!!res);
}

