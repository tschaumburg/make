import * as exits from '../../../return-codes';
import { TargetPattern, TargetName, Target } from "../targets";
import { BaseRule } from "./base-rule";

export class StaticPatternRule extends BaseRule
{
    constructor(
        readonly targets: TargetName[], // must all be explicit
        readonly targetPattern: TargetPattern, // must all be pattern
        readonly prereqPatterns: Target[], // either explicit or patern
        readonly orderOnlyPatterns: Target[], // either explicit or patern
        inlineRecipe: string
    )
    {
        super(inlineRecipe);

        if (!targets || targets.length ==0)
            exits.ruleMissingTarget();
    }
}

