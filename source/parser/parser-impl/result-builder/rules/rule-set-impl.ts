import * as error from '../../../../make-errors';
import { ExplicitRule } from "./explicit-rule";
import { ImplicitRule } from "./implicit-rule";
import { StaticPatternRule } from "./static-pattern-rule";
import { BaseRule } from "./base-rule";
import { IRuleSet } from "./rule-set";
import { ITargetName, ITarget, ITargetPattern } from '../../../parse-result';

export function createRuleset(): IRuleSet
{
    return new RuleSet();
}

class RuleSet implements IRuleSet
{
    private _defaultTarget: ITargetName = null;
    public get defaultTarget(): ITargetName { return this._defaultTarget; }
    public clearDefaultTarget(): void { this._defaultTarget = null; }
    public readonly explicitRules: ExplicitRule[] = [];
    public readonly implicitRules: ImplicitRule[] = [];
    public readonly staticPatternRules: StaticPatternRule[] = [];
    addRule(
        targets: ITarget[], // all TargetNames => static rule, all targetPatterns => implicit rule, mixed => error
        prerequisites: ITarget[],
        targetPattern: ITargetPattern,
        prereqPattern: ITarget[],
        orderOnlies: ITarget[],
        inlineRecipe: string,
        isTerminal: boolean
    ): BaseRule
    {
        //console.error("orderOnlies = " + JSON.stringify(orderOnlies));
        // console.error(
        //     "targets0 = " + targets0 + "\n" + 
        //     "targets1 = " + targets1 + "\n" + 
        //     "targets2 = " + targets2 + "\n" + 
        //     "targets3 = " + targets3 + "\n" 
        // );

        // All rules must begin with
        //    targets:...
        // where 'targets' is a list of one or more targets
        if (!targets || targets.length == 0)
        {
            error.ruleMissingTarget();
        }


        // Static pattern rule:
        // ====================
        // A static pattern rule is of the form
        //
        //    targets:pattern:prerequisites|orderOnlies...
        //
        // where
        //    targets:       (required) list of one or more (non-pattern)
        //                   targets
        //    targetPattern: (required) single non-blank target pattern
        //    prerequisites: (optional) list of (name or pattern) targets
        //    orderOnlies  : (optional) list of (name or pattern) targets
        if (!!targetPattern)
        {
            // Validating targets:
            if (!targets || targets.length == 0) //...one or more
            {
                error.staticPatternRuleMissingTargets();
            }

            if (targets.some(t => t.isPattern())) // ...non.pattern
            {
                error.staticPatternRuleTargetPatternNotAllowed();
            }
            
            // Validating targetPattern:
            if (!targetPattern || !targetPattern.relname || targetPattern.relname.trim().length == 0)
            {
                error.staticPatternRuleMissingPattern();
            }

            if (targetPattern.isPattern() == false)
            {
                error.staticPatternRuleTargetPatternNotPattern();
            }

            let staticPatternRule =
                new StaticPatternRule(
                    targets.map(t => t as ITargetName), 
                    targetPattern,
                    prereqPattern, 
                    orderOnlies, 
                    inlineRecipe,
                    isTerminal
                );
            
            if (!this._defaultTarget)
            {
                this._defaultTarget = staticPatternRule.targets[0];
            }

            this.staticPatternRules.push(staticPatternRule);
            return staticPatternRule;
        }
    
        // Implicit pattern rule (10.5.1):
        // ===============================
        // An implicit rule is of the form
        //
        //    targets:prerequisites|orderOnlies...
        //
        // where
        //    targets:       required list of one or more target patterns
        //    prerequisites: optional list of (name or pattern) targets
        //    orderOnlies:   optional list of (name or pattern) targets
        if (targets.every(t => t.isPattern()))
        {
            let implicitRule =
                new ImplicitRule(
                    targets.map(t => t as ITargetPattern), 
                    prerequisites, 
                    orderOnlies,
                    inlineRecipe,
                    isTerminal
                );
            this.implicitRules.push(implicitRule);
            return implicitRule;
        }
    
        // Explicit ("normal") rule:
        // =========================
        // An explicit rule is of the form
        //
        //    targets:prerequisites...
        //
        // where
        //    targets: is a list of one or more (non-pattern) target names
        //    prerequisites: optional list of (name or pattern) targets
        if (targets.every(t => !t.isPattern()))
        {
            let explicitRule =
                new ExplicitRule(
                    targets.map(t => t as ITargetName), 
                    prerequisites.map(t => t as ITargetName), 
                    orderOnlies.map(t => t as ITargetName), 
                    inlineRecipe ,
                    isTerminal
                );
            
            //console.log("   DEFAULT TARGET 0: " + JSON.stringify(explicitRule.targets[0]));
            this.explicitRules.push(explicitRule);

            if (!this._defaultTarget)
            {
                this._defaultTarget = explicitRule.targets[0];
            }

            return explicitRule;
        }
    
        throw new Error("mixed implicit and normal rules.");
    }
}

