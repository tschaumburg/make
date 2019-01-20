import * as fs from "fs";
import { isArray, isString } from "util";
import { ExpectedSuccess } from "./expected-success";
import { IExpectedResult } from "./expected-result";
import { ExpectedError } from "./expected-error";

export function loadExpected(expected: ExpectedError | ExpectedSuccess | string | string[] ): IExpectedResult
{
    if (isString (expected))
    {
        return new ExpectedSuccess(expected);
    }

    if (isArray(expected))
    {
        return new ExpectedSuccess(expected);
    }

    return expected as IExpectedResult;
}

export function error(exitCode?: number, errorMessage?: string | string[]): ExpectedError
{
    return new ExpectedError(exitCode, errorMessage);
}

export function success(expectation?: string[]): ExpectedSuccess
{
    return new ExpectedSuccess(expectation);
}

export function successFile(filename): ExpectedSuccess
{
    let expectedOutput = fs.readFileSync(filename, 'utf8');
    return success(expectedOutput.split('\n'))
}
