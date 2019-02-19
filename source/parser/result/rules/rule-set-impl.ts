import * as exits from '../../../return-codes';
import { ExplicitRule } from "./explicit-rule";
import { ImplicitRule } from "./implicit-rule";
import { StaticPatternRule } from "./static-pattern-rule";
import { BaseRule } from "./base-rule";
import { IRuleSet } from "./rule-set";
import { TargetName, TargetPattern, Target } from "../targets";

export function createRuleset(): IRuleSet
{
    return new RuleSet();
}

class RuleSet implements IRuleSet
{
    private _defaultTarget: TargetName = null;
    public get defaultTarget(): TargetName { return this._defaultTarget; }
    public clearDefaultTarget(): void { this._defaultTarget = null; }
    public readonly explicitRules: ExplicitRule[] = [];
    public readonly implicitRules: ImplicitRule[] = [];
    public readonly staticPatternRules: StaticPatternRule[] = [];
    addRule(
        targets: Target[], // all TargetNames => static rule, all targetPatterns => implicit rule, mixed => error
        prerequisites: Target[],
        targetPattern: TargetPattern,
        prereqPattern: Target[],
        orderOnlies: Target[],
        inlineRecipe: string
    ): BaseRule
    {
        //console.error("orderOnlies = " + JSON.stringify(orderOnlies));
        // console.error(
        //     "targets0 = " + targets0 + "\n" + 
        //     "targets1 = " + targets1 + "\n" + 
        //     "targets2 = " + targets2 + "\n" + 
        //     "targets3 = " + targets3 + "\n" 
        // );
        if (!targets || targets.length == 0)
        {
            exits.ruleMissingTarget();
        }

        if (!!targetPattern) // && targetPattern.length > 0)
        {
            // Static pattern rule:
            let staticPatternRule =
                new StaticPatternRule(
                    targets,
                    targetPattern,
                    prereqPattern, 
                    orderOnlies, 
                    inlineRecipe
                );
            
            if (!this._defaultTarget)
            {
                this._defaultTarget = staticPatternRule.targets[0];
            }

            this.staticPatternRules.push(staticPatternRule);
            return staticPatternRule;
        }
        
        if (targets.every(t => t.isPattern()))
        {
            // Implicit pattern rule (10.5.1):
            //
            // Note: experimentation shows that Gnu make accepts multiple
            // pattern targets, but no mix - i.e. a target list '%.o %.debug'
            // is OK, but '%o %.debug compile.errors' is not
            // 
            // prerequisites: any mix allowed

            let implicitRule =
                new ImplicitRule(
                    targets.map(t => t as TargetPattern), 
                    prerequisites, 
                    orderOnlies,
                    inlineRecipe
                );
            this.implicitRules.push(implicitRule);

            if (!this._defaultTarget)
            {
                let targetname = implicitRule.targetPatterns.find(t => !t.isPattern()) as TargetName;
                // console.log("   DEFAULT TARGET : " + JSON.stringify(targetname));
                if (!!targetname)
                {
                    this._defaultTarget = targetname;
                }
            }
            
            return implicitRule;
        }
        
        if (targets.every(t => !t.isPattern()))
        {
            // Explicit ("normal") rule:
            let explicitRule =
                new ExplicitRule(
                    targets, 
                    prerequisites, 
                    orderOnlies, 
                    inlineRecipe 
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

