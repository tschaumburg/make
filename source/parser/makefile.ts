import * as path from 'path';
import * as fs from 'fs';
import { Rule, Target } from './rule';
import { IMakefile, IRule, ITarget } from '../imakefile';

export class Makefile implements IMakefile
{
    findTarget(fullname: string): ITarget 
    {
        return this.targets[fullname];
    }
    public readonly variables: { [name: string]: string } = {};
    private readonly targets: { [fullname: string]: Target } = {};
    public readonly rules: IRule[] = [];
    // reference to last parsed target
    private currentRule: Rule = null;
    public readonly _makefileDir: string;

    constructor(private readonly _makefileName: string, importedVariables: { [name: string]: string })
    {
        for (var n in importedVariables)
            this.variables[n] = importedVariables[n];

        this._makefileDir = path.dirname(_makefileName);
    };

    private _expandVariable(value: string): string
    {
        var self = this;
        return value.replace(/\$(\w+)/g, function (match, name: string)
        {
            if (self.variables[name]) return self.variables[name];
            return match;
        });
    }

    public expandVariable(value: string): string
    {
        var previousValues: string[] = [];
        for (var n = 0; n < 100; n++)
        {
            var newValue = this._expandVariable(value);

            // Termination: when there is no more to expand
            if (newValue === value)
                return value;

            // infinite recursion detection
            if (previousValues.indexOf(newValue) >= 0)
            {
                throw new Error("Infinite recursion in variable expansion: " + previousValues.join(" => "));
            }

            value = newValue;
            previousValues.push(value);
        }
        throw new Error("Variable expansion exceeded max recursion depth: " + previousValues.join(" => "));
    }

    public defineSimpleVariable(name: string, value: string): void
    {
        name = this.expandVariable(name);
        value = this.expandVariable(value);

        this.variables[name] = value;
    }

    public defineRecursiveVariable(name: string, value: string): void
    {
        name = this.expandVariable(name);
        this.variables[name] = value;
    }

    private createTarget(targetName: string): Target
    {
        targetName = this.expandVariable(targetName);
        var fullname = path.resolve(this._makefileDir, targetName);
        var target = this.targets[fullname];

        if (!target)
        {
            console.log("CREATING: " + fullname);
            target = new Target(targetName, fullname);
            this.targets[fullname] = target;
        }

        return target;
    }

    public startRule(targetName: string, prerequisiteName: string[]): void
    {
        var target = this.createTarget(targetName);// new Target(this.expandVariable(targetName), this._makefileDir);
        var prerequisites =
            prerequisiteName
                .map((f) => this.expandVariable(f))
                .map((f) => this.createTarget(f));// new Target(f, this._makefileDir));

        this.currentRule = new Rule(target, prerequisites);
        target.setProducedBy(this.currentRule);
        this.rules.push(this.currentRule);
    }

    public recipeLine(line: string): void
    {
        line = this.expandVariable(line);
        this.currentRule.recipe.steps.push(line);
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

        var includedTarget = this.includeTarget(srcRule.target);
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
            console.log("CREATING: " + fullname);
            target = new Target(targetName, fullname);
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
