import { ExplicitRule } from "./explicit-rule";
import { ImplicitRule } from "./implicit-rule";
import { StaticPatternRule } from "./static-pattern-rule";
import { BaseRule } from "./base-rule";
import { IRuleSet } from "./rule-set";
import { IParseLocation, IParseContext } from "../result-builder";
import { TargetPatternFactory, TargetFactory } from "../builder/target-factories";
import { TargetName } from "../targets";

export function createRuleset(): IRuleSet
{
    return new RuleSet();
}

class RuleSet implements IRuleSet
{
    private _defaultTarget: TargetName = null;
    public get defaultTarget(): TargetName { return this._defaultTarget; }
    public readonly explicitRules: ExplicitRule[] = [];
    public readonly implicitRules: ImplicitRule[] = [];
    public readonly staticPatternRules: StaticPatternRule[] = [];
    addRule(
        location: IParseLocation,
        context: IParseContext,
        basedir: string,
        targets0: string[],
        targets1: string[], 
        targets2: string[], 
        targets3: string[],
        inlineRecipe: string
    ): BaseRule
    {
        // console.error(
        //     "targets0 = " + targets0 + "\n" + 
        //     "targets1 = " + targets1 + "\n" + 
        //     "targets2 = " + targets2 + "\n" + 
        //     "targets3 = " + targets3 + "\n" 
        // );

        if (!!targets2 && targets2.length > 0)
        {
            // Static pattern rule:
            let staticPatternRule =
                new StaticPatternRule(
                    location,
                    context,
                    basedir,
                    targets0,
                    targets1,
                    targets2, 
                    targets3, 
                    inlineRecipe
                );
            
            if (!this._defaultTarget)
            {
                this._defaultTarget = staticPatternRule.targets[0];
            }

            this.staticPatternRules.push(staticPatternRule);
            return staticPatternRule;
        }
        else if (targets0.some(t => TargetPatternFactory.isPattern(t)))
        {
            // Implicit pattern rule:
            let implicitRule =
                new ImplicitRule(
                    location,
                    context,
                    basedir,
                    targets0, 
                    targets1, 
                    targets3,
                    inlineRecipe
                );
            this.implicitRules.push(implicitRule);

            if (!this._defaultTarget)
            {
                let targetname = implicitRule.targetPatterns.find(t => !TargetPatternFactory.isPattern(t.relname)) as TargetName;
                if (!!targetname)
                {
                    this._defaultTarget = targetname;
                }
            }
            
            return implicitRule;
        }
        else
        {
            // Explicit ("normal") rule:
            let explicitRule =
                new ExplicitRule(
                    location,
                    context,
                    basedir,
                    targets0, 
                    targets1, 
                    targets3, 
                    inlineRecipe 
                );
            
            if (!this._defaultTarget)
            {
                this._defaultTarget = explicitRule.targets[0];
            }

            this.explicitRules.push(explicitRule);
            return explicitRule;
        }
    }
}

