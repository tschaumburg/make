import { assert } from "chai";
import { IActualResult } from "./actual-result";
import { isArray, isString } from "util";
import { IExpectedResult, linesMatch } from "./expected-result";

export class ExpectedError implements IExpectedResult
{
    public lines(): string[] { return this.stderr; }
    public readonly exit?: number;
    public readonly stderr?: string[];
    constructor(exitCode?: number, errorMessage?: string | string[])
    {
        //if (typeof (expectation) === 'number')
            this.exit = exitCode;
        /*else*/ if (typeof (errorMessage) === 'string')
            this.stderr = [errorMessage];
        else
            this.stderr = errorMessage;
    }

    public assertActual(actual: IActualResult): void
    {
        if (actual.exit == 0)
        {
            return assert.fail("Expected error " + this.exit + " ('" + this.stderr + "'), but completed OK");
        }

        if (this.exit != undefined)
        {
            if (this.exit != actual.exit)
                return assert.fail("Expected falure code " + this.exit + ", but got " + actual.exit);
        }

        if (this.stderr != undefined)
        {
            if (!linesMatch(this.stderr, actual.stderr))
            {
                return assert.fail(
                    "Failure code " + actual.exit + " OK, but output didn't match.\n" +
                    "EXPECTED\n   " + 
                    this.stderr.join("\n   ") + "\n" +
                    "ACTUAL\n"   + 
                    actual.stderr.join("\n   ") 
                );
            }
        }
    }
}
