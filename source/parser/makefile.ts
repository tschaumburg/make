import * as exits from '../return-codes';
import * as path from 'path';
import * as log from '../makelog';
import { Target, Rule } from './rule';
import { IMakefile, IRule, ITarget } from '../imakefile';

export class Makefile implements IMakefile
{
    public readonly makefileNames: string[] = [];
    public readonly variables: { [name: string]: string } = {};
    public readonly targets: { [fullname: string]: Target } = {};
    public readonly rules: IRule[] = [];
    // reference to last parsed target
    private currentRules: IRule[] = null;

    public defaultTarget: string = null;
    findTarget(fullname: string): ITarget 
    {
        return this.targets[fullname];
    }
    //public readonly _makefileDir: string;

    constructor()//private readonly _makefileName: string, )
    {
        //this._makefileDir = path.dirname(_makefileName);
    };

    private createTarget(targetName: string, targetFullname: string, isOrderOnly: boolean): Target
    {
        //var targetFullname = path.resolve(this._makefileDir, targetName);
        var target = this.targets[targetFullname];

        if (!target)
        {
            //console.log("CREATING: " + fullname);
            target = new Target(targetName, targetFullname, isOrderOnly);
            this.targets[targetFullname] = target;
        }

        return target;
    }

    public startRule(dirName: string, targetNames: string[], prerequisiteName: string[], orderOnlyPrerequisiteName: string[]): void
    {
        if (!targetNames || targetNames.length == 0)
            exits.ruleMissingTarget();

        // Default target:
        // ===============
        // If this is the first target, mark it as the default
        // for this makefile
        if (!this.defaultTarget)
            this.defaultTarget = targetNames.find(t => !t.startsWith(".") && !t.startsWith("@"));  

        // Register prerequisites:
        // =======================
        var prerequisites =
            prerequisiteName
                .map((f) => this.createTarget(f, path.resolve(dirName, f), false));

        var orderOnlyPrerequisites =
            orderOnlyPrerequisiteName
                //.map((f) => this.expandVariable(f))
                .map((f) => this.createTarget(f, path.resolve(dirName, f), true));

        // Create a rule for each target:
        // ==============================
        // See gmake manual "4.10: Multiple targets in a rule"
        this.currentRules = [];
        for (let targetName of targetNames)
        {
            var self = this;
            let target = self.createTarget(targetName, path.resolve(dirName, targetName), false);
            let rule = target.producedBy() as Rule;
            if (!rule)
            {
                // create a new rule:
                rule = new Rule(target, prerequisites.concat(orderOnlyPrerequisites));
                target.setProducedBy(rule);
                this.rules.push(rule);
            }
            else
            {
                // merge into existing rule
                for (let addpr of prerequisites.concat(orderOnlyPrerequisites))
                {
                    if (rule.prerequities.indexOf(addpr) < 0)
                        rule.prerequities.push(addpr);
                }
            }

            // OK, we're building on top of a previously defined rule
            // - but if it already has a recipe, we cannot add to that
            if (rule.recipe.steps.length > 0)
                rule.lockRecipe();

            this.currentRules.push(rule);

            if (!this.defaultTarget)
                this.defaultTarget = targetName;
        }
        //var self = this;
        //var targets = targetNames.map(name => self.createTarget(name, false));
        //this.currentRule = new Rule(targets, prerequisites.concat(orderOnlyPrerequisites));

        //targets.forEach(t => t.setProducedBy(this.currentRule));
        //this.rules.push(this.currentRule);

        //if (!this.defaultTarget)
        //    this.defaultTarget = this.currentRule.targets[0].name;
    }

    public recipeLine(line: string): void
    {
        //line = this.expandVariable(line);
        for (let rule of this.currentRules)
        {
            if (rule.recipe.isLocked())
            {
                exits.parseMultipleRulesForTarget(rule.target.name);
            }

            rule.recipe.steps.push(line);
        }
    }

    public includeMakefile(included: IMakefile): void
    {
        for (var srcRule of included.rules)
        {
            this.includeRule(srcRule);
        }
    }

    private includeRule(srcRule: IRule): void
    {
        var self = this;

        var includedTarget = this.includeTarget(srcRule.target);//srcRule.targets.map(t => self.includeTarget(t));
        var includedPrerequisites = srcRule.prerequities.map(pre => self.includeTarget(pre));

        var includedRule = new Rule(includedTarget, includedPrerequisites);
        includedTarget.setProducedBy(includedRule);
        this.rules.push(includedRule);

        for (var l of srcRule.recipe.steps)
            includedRule.recipe.steps.push(l);
    }

    private includeTarget(srcTarget: ITarget): Target
    {
        var targetName = srcTarget.name;
        var fullname = srcTarget.fullName;
        var target = this.targets[fullname];

        if (!target)
        {
            //console.log("CREATING: " + fullname);
            target = new Target(targetName, fullname, srcTarget.isOrderOnly);
            this.targets[fullname] = target;
        }

        return target;

    }

    public toString(): string
    {
        return this.rules.map(r => r.toString()).join("\n");
    }
}



//    public parseFile(makefile: string): Makefile
//    {
//        console.log("Parsing " + makefile);
//        let makefileDir = path.dirname(makefile);
//        let content = fs.readFileSync(makefile, 'utf8');
//        content = content.replace("\\\r\n", "").replace("\\\n\r", "").replace("\\\n", "");
//        var lines = content.split(/\r?\n/);

//        lines.forEach(function (line)
//        {
//        });
//    }

//}
//// returns
////   {
////     variables = {
////       "VARIABLE1": "value1",
////       "VARIABLE2": "value2",
////     },
////     targets = [
////       {
////         "target": "TARGET1",
////         "prerequities": ["PREREQUISITE1", "PREREQUISITE2"],
////         "recipe": "recipe1\nrecipe2\n...",
////       }
////     ]
////   }
//function parseFile(makefile: string)
//{

//  // VARIABLE = "value"
//  // ===================

//  return {
//    variables: variables,
//    targets: targets
//  };
//}
