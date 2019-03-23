import * as exits from '../../../../make-errors';
import { BaseRule } from "./base-rule";
import { IExplicitRule, ITargetName } from '../../../result';

export class ExplicitRule extends BaseRule implements IExplicitRule
{
    constructor(
        readonly targets: ITargetName[], // must all be explicit
        readonly prereqs: ITargetName[], // must all be explicit
        readonly orderOnly: ITargetName[], // must all be explicit
        inlineRecipe: string,
        isTerminal: boolean
    )
    {
        super(isTerminal, inlineRecipe);

        // console.error("EXPLICIT: " + JSON.stringify(targetNames, null, 3));
        if (!targets || targets.length ==0)
            exits.ruleMissingTarget();
    }
}
