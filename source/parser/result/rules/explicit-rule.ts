import * as exits from '../../../return-codes';
import { BaseRule } from "./base-rule";
import { Target, TargetName } from "../targets";

export class ExplicitRule extends BaseRule
{
    constructor(
        readonly targets: TargetName[], // must all be explicit
        readonly prereqs: TargetName[], // must all be explicit
        readonly orderOnly: TargetName[], // must all be explicit
        inlineRecipe: string
    )
    {
        super(inlineRecipe);

        // console.error("EXPLICIT: " + JSON.stringify(targetNames, null, 3));
        if (!targets || targets.length ==0)
            exits.ruleMissingTarget();
    }
}
