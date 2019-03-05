import * as exits from '../../../../make-errors';
import { BaseRule } from "./base-rule";
import { IImplicitRule, ITarget, ITargetPattern } from '../../../parse-result';

export class ImplicitRule extends BaseRule implements IImplicitRule
{
    constructor(
        readonly targetPatterns: ITargetPattern[], // must all be pattern
        readonly prereqPatterns: ITarget[], // either explicit or patern
        readonly orderOnlyPatterns: ITarget[], // either explicit or patern
        inlineRecipe: string,
        isTerminal: boolean
    )
    {
        super(isTerminal, inlineRecipe);

        if (!targetPatterns || targetPatterns.length ==0)
            exits.ruleMissingTarget();
    }
}
