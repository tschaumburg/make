import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, deleteFiles } from "../../../../test-utils";

export function loadTests(baseDir: string): void
{
    //*******************************************
    //*  4.2.1 Target special characters
    //*  =====================================
    //*******************************************
    var thisDir = path.resolve(baseDir, "1"); // "C:/Users/Thomas/npm-make-test/testing/42"; // 41");
    describe('4.2.1 Target special characters', function ()
    {
        for (var charcode = 0; charcode<256; charcode++)
        {
            if (charcode == 0)
            {
                continue; // end-of-string
            }

            if (charcode == 9)
            {
                continue; // tab cannot be escaped, it appears
            }

            if (charcode == 10)
            {
                continue; // end-of-line has its own tests
            }
            
            if (charcode == 13)
            {
                continue; // end-of-line has its own tests
            }
            
            let character = String.fromCharCode(charcode);
            let charname = "Character #" + charcode;
            loadUnicodeTest(thisDir, charcode, charname, character);
        }
    });
}

function loadUnicodeTest(basedir: string, caseno: number, charname: string, character: string): void
{
    let loader = simpleTest(
        {
            title: 'target with Unicode character ' + ("0000" + caseno).slice(-3),
            makefileName: generateMakefile(charname, character),
            targets: [],
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
            "SEMICOLON:=" + defined,
            "",
            "a${SEMICOLON}a:",
            "\techo " + quote + charname + ": $@" + quote,
            ""
        ]; 
    }

    if (!!escaped)
    {
        return [
            "a" + escaped + "a:",
            "\techo " + quote + charname + ": $@" + quote,
            ""
        ];
    }

    return [
		"a" + character + "a:",
        "\techo " + quote + charname + ": $@" + quote,
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
    //'%': '\\%',
    ':': '\\:',
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