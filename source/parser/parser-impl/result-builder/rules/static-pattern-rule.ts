import * as exits from '../../../../make-errors';
import { BaseRule } from "./base-rule";
import { IStaticPatternRule, ITargetName, ITarget, ITargetPattern } from '../../../parse-result';

export class StaticPatternRule extends BaseRule implements IStaticPatternRule
{
    constructor(
        readonly targets: ITargetName[], // must all be explicit
        readonly targetPattern: ITargetPattern, // must all be pattern
        readonly prereqPatterns: ITarget[], // either explicit or patern
        readonly orderOnlyPatterns: ITarget[], // either explicit or patern
        inlineRecipe: string,
        isTerminal: boolean
    )
    {
        super(isTerminal, inlineRecipe);

        if (!targets || targets.length ==0)
            exits.ruleMissingTarget();
    }
}

