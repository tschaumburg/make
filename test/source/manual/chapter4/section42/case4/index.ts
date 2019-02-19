import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { simpleTest } from "../../../../fixtures/testcases/simple-testcase";
import { touchFiles, deleteFiles } from "../../../../test-utils";

const eol = "\n";
const escapedEol = "\\" + eol

export function loadTests(baseDir: string): void
{
    //*******************************************
    //*  4.2.4 Linebreaks in rules
    //*  =========================
    //*******************************************
    var thisDir = path.resolve(baseDir, "4"); // "C:/Users/Thomas/npm-make-test/testing/42"; // 41");
    describe('4.2.4 Linebreaks in rules', function ()
    {
        let targets = [
            ["t1", "t2"], 
            [escapedEol, "t1", "t2"], 
            ["t1" , escapedEol, "t2"], 
            ["t1", "t2", escapedEol]
        ];
        let prerequisites = [
            ["pr1", "pr2"], 
            [escapedEol , "pr1", "pr2"], 
            ["pr1" , escapedEol , "pr2"],
            ["pr1", "pr2" , escapedEol]
        ];
        let orderonlyPrerequisites = [
            ["oopr1", "oopr2"], 
            [escapedEol , "oopr1", "oopr2"], 
            ["oopr1" , escapedEol , "oopr2"],
            ["oopr1", "oopr2" , escapedEol]
        ];

        let caseno = 1;
        for (let t of targets)
        {
            for (let pr of prerequisites)
            {
                for (let oopr of orderonlyPrerequisites)
                {
                    loadLinebreakTest(thisDir, caseno++, t, pr, oopr);
                }
            }
        }
    });
}

function loadLinebreakTest(
    basedir: string, 
    caseno: number, 
    t: string[], 
    pr: string[], 
    oopr: string[]
): void
{
    let loader = simpleTest(
        {
            title: 'Linebreaks in rules ' + ("0000" + caseno).slice(-3),
            makefileName: generateMakefile(caseno, t, pr, oopr),
            targets: ['run'],
            expectedName: generateExpected(caseno, t, pr, oopr)
        }
    );

    loader(basedir, caseno);
}

// function clean(src: string): string
// {
//     if (!src)
//     {
//         return src;
//     }

//     return src.replace(/[\\\n\r\s]+/g, " ").trim();
// }

function optional(separator: string, term: string[]): string
{
    if (term==null)
        return "";

    return separator + term.join(" ");
}

function generateMakefile(
    caseno: number, 
    targets: string[], 
    pr: string[], 
    oopr: string[]
): string[]
{
    return [
        targets.join(" ") + ":" + pr.join(" ") + optional("|", oopr),
        "\techo \"$@ : $^ | $|\"",
        "",
        "run: " + targets.join(" "),
        "",
        "tp0 tp tp2:",
        "",
        "pr0 pr1 pr2:",
        "",
        "oopr0 oopr1 oopr2:",
        "",
        "",
    ]; 
}

function generateExpected(caseno: number, targets: string[], pr: string[], oopr: string[]): string[]
{
    targets = targets.filter(t => t !== escapedEol);
    pr = pr.filter(t => t !== escapedEol);
    oopr = oopr.filter(t => t !== escapedEol);
    var res =
        targets
        .map(t => "\"" + t + " : " + pr.join(" ") + " | " + oopr.join(" ") + "\"");

    return res;
}