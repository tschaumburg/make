import * as mocha from "mocha";
import { multiTestcase } from "../../../fixtures"
import * as setup31 from "./setup";

export function loadTests(): void
{
    //*******************************************
    //*  3.1.1 Splitting Long Lines:
    //*  =====================================
    //*******************************************
    describe('3.1.1 Splitting Long Lines', function ()
    {
        for (let makefileNo in setup31.makefiles)
        {
            let makefile = setup31.makefiles[makefileNo];
            for (let targetNo in setup31.targets)
            {
                let target = setup31.targets[targetNo];
                        multiTestcase(
                            {
                                makefile: makefile,
                                id: "testing/311/" + makefileNo + "-" + targetNo,
                            },
                            {
                                title: "mf" + makefileNo + "-" + target.join(""),
                                prepare: clean,
                                targets: target,
                                expect: setup31.expected.split('\n')
                            },
                        );
            }
        }
    });
}

function clean(): void
{
//    rm(['./*.o', '!./Makefile', '!./.makelog']);
}
