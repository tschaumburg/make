import { success, error, IExpectedResult, TestStepConfig } from "../../../fixtures"
import * as path from "path";
import { multiTestcase } from "../../../fixtures"
//import { makefile, expected } from "./setup";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "case24a");
    //*******************************************
    //*  2.4 Variables Make Makefiles Simpler:
    //*  =====================================
    //*******************************************
    describe('24A Variables Make Makefiles Simpler', function ()
    {
        for (let T = 0; T < 3; T++)
        {
            for (let P = 0; P < 3; P++)
            {
                for (let R = 0; R < 3; R++)
                {
                    if (T==1 && P == 1&& R==1)
                    console.error("");

                    let steps: TestStepConfig[] = [];
                    for (let goal of [undefined, 1, 2, 3])
                    {
                        steps.push(
                            {
                                title: "$(target" + T + "): $(prerequisite" + P + ") => $(recipe" + R + ") - goal " + goal,
                                prepare: clean,
                                targets: (goal==undefined) ? [] : ["t" + goal + ".exe"],
                                expect: expected(T, P, R, goal)
                            }
                        );
                    }

                    multiTestcase(
                        {
                            id: path.join(thisDir, "t" + T + "-p" + P + "-r" + R),
                            title: "t" + T + "-p" + P + "-r" + R ,
                            makefile: makefile(R, T, P),
                        },
                        ...steps
                    );
                }
            }
        }
    });
}

function clean(): void
{
//    rm(['./*.o', '!./Makefile', '!./.makelog']);
}

// Makefile:
// =========
// This group of test cases will be testing makefiles of the form
// 
//    $(targetT) : $(prerequisiteP)
//        $(recipeR)
// 
// where targetT is a variable whose value is a list of T targets
// 
//    target0 =
//    target1 = t1.exe
//    target2 = t2.exe t3.exe
//    ...etc.
// 
// prerequisiteT is a list of P prequisites:
// 
//    prerequisite0 =
//    prerequisite1 = p1.c
//    prerequisite2 = p2.c p3.c
//    ...etc.
//
// and recipeR is a list of R recipes:
//
//    recipe0 = echo build0 $@ from $^
//    recipe1 = echo build1 $@ from $^
//    recipe2 = echo build2 $@ from $^
//    ...etc.
//
// with R, T and P in the range [0..2] this gives
// 27 different makefiles, which can be generated
// by the function below:
//
export function makefile(R: number, T: number, P: number): string[]
{
    return [
        'target0 = ',
        'target1 = t1.exe',
        'target2 = t2.exe t3.exe',
        // 't1.exe:',
        // 't2.exe:',
        // 't3.exe:',
        '',
        'prerequisite0 =',
        'prerequisite1 = p1.c',
        'prerequisite2 = p2.c p3.c',
        '',
        'recipe0 = echo build0 -o $@ $^',
        'recipe1 = echo build1 -o $@ $^',
        'recipe2 = echo build2 -o $@ $^',
        '',
        "$(target" + T + '): $(prerequisite' + P + ")",
        '\t$(recipe' + R + ')',
        '',
        'p1.c: ',
        'p2.c: ',
        'p3.c: ',
        ''
    ];
}


// Expected results:
// =================
// For each makefile generated from a (T, P, R) tuple:
// 
//    target1 ... targetT : prerequisite1 ... prerequisiteP
//        recipeR
// 
// a parse error will result for T=0 because a rule
// must have at least 1 target.
// 
// If a command
// 
//    npm-make tG.exe
// 
// (where G is a positive integer), an "undefined target"
// error will result if G>T
// 
// For all other values of G, recipeG will be run,
// printing the following to stdout:
// 
//    buildR -o tG.exe p1.c ... pP.c
// 
// for example, running 'npm-make t1.exe' against
// a makefile generated from (T, P, R) = (1,2,2)
// completes succesfully with the following output:
// 
//    build2 -o t2.exe p1.c p2.c
// 
// These expected results are summarized in the
// table below:
//
//    +-------+-----------------------+-------+------------------------------------
//    |       |       Makefile        |       |               
//    |  Goal +-------+-------+-------|  Goal |            Expected result 
//    |   G   |   T   |   P   |   R   |   G   |
//    +-------+-------+-------+-------+-------+------------------------------------
//    |   *   |   0   |   *   |   *   |   *   | error(101, "Rule must contain at
//    |       |       |       |       |       |             least one target")
//    +-------+-------+-------+-------+-------+------------------------------------
//    |       |   1   |   *   |   *   |  G>T  | error(106, "Target tG.exe not
//    |       |       |       |       |       |             defined in makefile");
//    +-------+-------+-------+-------+-------+------------------------------------
//    |       |   1   |   *   |   *   |  G<=T | success("buildR -o tG.exe
//    |       |       |       |       |       |          p1.c...pP.c")
//    +-------+-------+-------+-------+-------+------------------------------------

export function expected(
    T: number,
    P: number,
    R: number,
    goal?: number
): IExpectedResult
{
    let targets = makeList(T);
    let prerequisites = makeList(P);
    let recipes = [R];//makeList(R);

    if (targets.length == 0)
        return error(101, "Rule must contain at least one target");

    if (goal == undefined || goal == null)
        goal = targets[0];

    if (targets.indexOf(goal) < 0)
        return error(106, "No rule to make target 't" + goal + ".exe'");//"Target t" + goal + ".exe not defined in makefile");

    return success(
        recipes.map(
            recipeNo => (
                "build" + recipeNo +
                " -o t" + goal + ".exe " +
                prerequisites.map(p => "p" + p + ".c").join(" ")
            )
        )//.join("\n")
    );
}

function makeList(N: number)
{
    let consecutives: number[][] =
        [
            [],
            [1],
            [2, 3],
            [4, 5, 6],
            [7, 8, 9, 10],
            [11, 12, 13, 14, 15]
        ];

    return consecutives[N];
}

