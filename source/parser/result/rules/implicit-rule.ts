import * as exits from '../../../return-codes';
import { Target, TargetPattern } from "../targets";
import { BaseRule } from "./base-rule";

export class ImplicitRule extends BaseRule
{
    constructor(
        readonly targetPatterns: TargetPattern[], // must all be pattern
        readonly prereqPatterns: Target[], // either explicit or patern
        readonly orderOnlyPatterns: Target[], // either explicit or patern
            inlineRecipe: string)
    {
        super(inlineRecipe);

        if (!targetPatterns || targetPatterns.length ==0)
            exits.ruleMissingTarget();
    }
}
