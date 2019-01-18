import * as exits from '../../../return-codes';
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
    public clearDefaultTarget(): void { this._defaultTarget = null; }
    public readonly explicitRules: ExplicitRule[] = [];
    public readonly implicitRules: ImplicitRule[] = [];
    public readonly staticPatternRules: StaticPatternRule[] = [];
    addRule(
        location: IParseLocation,
        context: IParseContext,
        basedir: string,
        targets: string[],
        prerequisites: string[],
        targetPattern: string[],
        prereqPattern: string[],
        orderOnlies: string[],
        inlineRecipe: string
    ): BaseRule
    {
        // console.error(
        //     "targets0 = " + targets0 + "\n" + 
        //     "targets1 = " + targets1 + "\n" + 
        //     "targets2 = " + targets2 + "\n" + 
        //     "targets3 = " + targets3 + "\n" 
        // );

        if (!!targetPattern && targetPattern.length > 0)
        {
            // Static pattern rule:
            let staticPatternRule =
                new StaticPatternRule(
                    location,
                    context,
                    basedir,
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
        else if (targets.some(t => TargetPatternFactory.isPattern(t)))
        {
            // Implicit pattern rule:
            let implicitRule =
                new ImplicitRule(
                    location,
                    context,
                    basedir,
                    targets, 
                    prerequisites, 
                    orderOnlies,
                    inlineRecipe
                );
            this.implicitRules.push(implicitRule);

            if (!this._defaultTarget)
            {
                let targetname = implicitRule.targetPatterns.find(t => !TargetPatternFactory.isPattern(t.relname)) as TargetName;
                // console.log("   DEFAULT TARGET : " + JSON.stringify(targetname));
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
                    targets, 
                    prerequisites, 
                    orderOnlies, 
                    inlineRecipe 
                );
            
            //console.log("   DEFAULT TARGET 0: " + JSON.stringify(explicitRule.targets[0]));
            if (!this._defaultTarget)
            {
                this._defaultTarget = explicitRule.targets[0];
            }

            this.explicitRules.push(explicitRule);
            return explicitRule;
        }
    }
}

