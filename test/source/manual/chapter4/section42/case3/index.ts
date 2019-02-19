import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, deleteFiles } from "../../../../test-utils";

export function loadTests(baseDir: string): void
{
    //*******************************************
    //*  4.2.3 Order-only prerequisites special characters
    //*  =====================================
    //*******************************************
    var thisDir = path.resolve(baseDir, "3"); // "C:/Users/Thomas/npm-make-test/testing/42"; // 41");
    describe('4.2.3 Order-only prerequisites special characters', function ()
    {
        for (var charcode = 0; charcode<256; charcode++)
        {
            let character = String.fromCharCode(charcode);
            let charname = "Character #" + charcode;
            let notAllowed = (notAllowedStrings.indexOf(character) >= 0);

            if (notAllowed)
            {
                continue;
            }

            loadUnicodeTest(thisDir, charcode, charname, character);
        }
    });
}

function loadUnicodeTest(basedir: string, caseno: number, charname: string, character: string): void
{
    let loader = simpleTest(
        {
            title: 'prerequisites with Unicode character ' + ("0000" + caseno).slice(-3),
            makefileName: generateMakefile(charname, character),
            targets: ['run'],
            expectedName: generateExpected(charname, character)
        }
    );

    loader(basedir, caseno);
}

function generateMakefile(charname: string, character: string): string[]
{
    let escaped = escapeStrings[character];
    let defined = defineStrings[character];
    let quote = "\"";
    if (character === "\"")
        quote = "'";

    if (!!defined)
    {
        return [
            "SYMBOL:=" + defined,
            "",
            "run: a${SYMBOL}a",
            "\techo " + quote + charname + ": " + "$<" + quote,
            "",
            "a${SYMBOL}a:",
            "\t",
        ]; 
    }

    if (!!escaped)
    {
        return [
            "run: a" + escaped + "a",
            "\techo " + quote + charname + ": " + "$<" + quote,
            "",
            "a" + escaped + "a:",
            "\t",
            ""
        ];
    }

    return [
		"run: a" + character + "a",
        "\techo " + quote + charname + ": " + "$<" + quote,
        "",
        "a" + character + "a:",
        "\t",
    ""
    ];
}

function generateExpected(charname: string, character: string): string[]
{
    let quote = "\"";
    if (character === "\"")
        quote = "'";

    var res =
    [
        quote + charname + ": a" + character + "a" + quote,
        ""
    ];

    return res;
}

const notAllowedStrings = 
[
    // continue; // end-of-string
    // continue; // end-of-line has its own tests
    // continue; // end-of-line has its own tests
    // continue; // ':' not supported in prerequisites
    
    /**
     * Unicode character 0 is the string terminator
     * which GNU make does not support in order-only
     *  prerequisite names.
     */
    String.fromCharCode(0),

    // tab cannot be escaped, it appears
    String.fromCharCode(9),
    
    /**
     * Characters 10 (linefeed, lf) and 13 (carriage return, cr) are newlines, depending on platform
     * (Windows cr-lf, Linux/Unix cr, MacOS lf).
     * 
     * Newline teasting has it's own test set, so we'll skip them here
     */
    String.fromCharCode(10),
    String.fromCharCode(13),
    String.fromCharCode(58),
]
// Map of characters that should be escaped when used in a target.
//
// I.e. when referring to a target file named
//
//     thesis#backup
//
// write the rule like this:
//
//     thesis\#backup: thesis
//           copy $< $@
//
const escapeStrings =
{
    '$': '$$',
    '#': '\\#',
    '\t': '\\\t',
    ' ': '\\ ',
    '\\': '\\\\',
}

// Map of characters that need to be injected into a target 
// name using a variable
//
// I.e. when referring to a target file named
//
//     thesis;introduction
//
// write the rule like this:
//
//     SEMICOLON:=\;
//     thesis${SEMICOLON}introduction: thesis
//           copy $< $@
//
const defineStrings =
{
    ';': '\\;',
    '=': '=',
    '%': '\\%',  
    '|': '\\|',
}
