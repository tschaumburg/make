import * as mocha from "mocha";
import * as manual from "./manual";

export function loadTests()
{
    describe(
        'npm-make unit test suite',
        function ()
        {
            manual.loadTests();
        }
    );
}

export * from "./fixtures";
export * from "./test-utils";
