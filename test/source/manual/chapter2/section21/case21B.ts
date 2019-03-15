import * as mocha from "mocha";
import { multiTestcase, deleteFiles, touchFiles, error } from "../../.."

function symbolList(symbol: string, n: number, separator: string): string
{
    var l = [symbol + "1", symbol + "2", symbol + "3"];
    return l.slice(0, n).join(separator);
}

function repeat(src: string[], nReps: number): string[]
{
    let res: string[] = [];
    for (let n = 0; n<nReps; n++)
    {
        res = res.concat(src);
    }

    return res;
}

export function loadTests(): void
{
    describe('21B: Testing basic rule shapes', function ()
    {
        //*******************************************
        //* A simple makefile consists of �rules� 
        //* with the following shape:
        //* 
        //* target ... : prerequisites ...
        //*     recipe
        //*     ...
        //*
        //* A target is usually the name of a file
        //* that is generated by a program
        //*
        //*******************************************
        for (let ntargets = 0; ntargets <= 2; ntargets++)
        {
            for (let nprerequisites = 0; nprerequisites <= 2; nprerequisites++)
            {
                for (let nrecipes = 0; nrecipes <= 2; nrecipes++)
                {
                    let targets = symbolList("target", ntargets, " ");
                    let prerequisites = symbolList("prerequisite", nprerequisites, " ");
                    let recipes = symbolList("\t echo recipe", nrecipes, " \n");
                    let output = repeat(symbolList("recipe", nrecipes, "\n").split('\n'), ntargets);
                    let makefile = [
                        targets + ': ' + prerequisites,
                        recipes,
                        '',
                        (nprerequisites>0) ? prerequisites + ': ' : '' ,
                        '',
                        'all: ' + symbolList("target", ntargets, " ")
                    ];
                    multiTestcase(
                        {
                            id: "21B-" + ntargets + "t-" + nprerequisites + "p-" + nrecipes + "r",
                            title: "",
                            makefile: makefile,
                        },
                        
                        //ntargets + ' targets, ' + nprerequisites + ' prerequisites, ' + nrecipes + ' recipes',
                        {
                            title: '' + ntargets + ' targets, ' + nprerequisites + ' prerequisites, ' + nrecipes + ' recipes',
                            prepare: () => { },
                            targets: ["all"],
                            expect: (ntargets == 0) ? error(101, "Rule must contain at least one target") : output
                        }
                    );
                }
            }
        }

        multiTestcase(
            {
                id: "21C",
                title: "",
                makefile: [
                    'hello.exe: hello.c  # comment',
                    '\techo cc hello.c -o hello.exe'
                ],
            },
            {
                title: 'updates out-of-date targets',
                prepare: () =>
                    {
                        deleteFiles("hello.exe");
                        touchFiles("hello.c");
                    },
                targets: ["hello.exe"],
                expect: [
                    'cc hello.c -o hello.exe'
                ]
            },
        );
    });
}