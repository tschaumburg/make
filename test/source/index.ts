import * as mocha from "mocha";
import * as manual from "./manual";

export function loadTests(baseDir: string)
{
    describe(
        'npm-make unit test suite',
        function ()
        {
            manual.loadTests("C:/Users/Thomas/npm-make-test");
        }
    );
}

export * from "./fixtures";
export * from "./test-utils";
