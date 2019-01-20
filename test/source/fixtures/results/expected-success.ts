import * as fs from "fs";
import * as os from "os";
import { assert } from "chai";
import { isArray, isString } from "util";
import { IActualResult } from "./actual-result";
import { IExpectedResult, linesMatch } from "./expected-result";


export class ExpectedSuccess implements IExpectedResult
{
    public readonly stdout?: string[];
    constructor(expectation?: string | string[])
    {
        if (typeof (expectation) === 'string')
            this.stdout = fs.readFileSync(expectation, 'utf8').split(os.EOL);
        else
            this.stdout = expectation;
    }

    assertActual(actual: IActualResult): boolean
    {
        if (!actual)
            return false;

        if (actual.exit !== 0)
        {
            return assert.fail(
                "npm-make failed with output\n   " +
                "   " + actual.stderr.join("\n   ") + 
                "\n" +
                "Expected successful completion" +
                ((!!this.stdout) ? (": \n   " + this.stdout.join("\n   ")) : "")
            );
        }

        if (this.stdout != undefined)
        {
            if (!linesMatch(this.stdout, actual.stdout))
            {
                return assert.fail(
                    "Succeeded as expected, but output didn't match.\n" +
                    "EXPECTED\n   " +
                    this.stdout.join("\n   ") +
                    "\nACTUAL\n   " +
                    actual.stdout.join("\n   ")
                );
            }
        }
    }
}
