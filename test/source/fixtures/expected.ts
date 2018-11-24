import { equal } from "assert";

import { fail } from "assert";

import { read } from "fs";
import { assert } from "chai";
import { IActualResult } from "./actual";

export interface IExpectedResult
{
    assertActual(actual: IActualResult): void;
}

export class ExpectedError implements IExpectedResult
{
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

function linesMatch(first: string[], second: string[]): boolean
{
    //return true;
    first = first.map(s => s.trim()).filter(s => !!s && s.length > 0);
    second = second.map(s => s.trim()).filter(s => !!s && s.length > 0);

    if (first.length != second.length)
    {
        //console.log("length " + first.length + "!=" + second.length);
        return false;
    }

    for (var n in first)
    {
        if (first[n] !== second[n])
        {
            return false;
        }
    }

    return true;
}

export function error(exitCode?: number, errorMessage?: string | string[]): ExpectedError
{
    return new ExpectedError(exitCode, errorMessage);
}

export class ExpectedSuccess implements IExpectedResult
{
    public readonly stdout?: string[];
    constructor(expectation?: string | string[])
    {
        if (typeof (expectation) === 'string')
            this.stdout = [expectation];
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

export function success(expectation?: string | string[]): ExpectedSuccess
{
    return new ExpectedSuccess(expectation);
}
//export function success(expectation?: string | string[]): IExpectedResult
//{
//    return new ExpectedSuccess(expectation);
//}
