// import * as path from 'path';
// import * as exits from '../../return-codes';
// import { IRule } from '../rule';
// import { ITargetManager } from '../targets';
// import { Rule } from './rule';

// export function createManager(targetManager: ITargetManager): IStaticRuleManager
// {
//     return new StaticRuleManager(targetManager);
// }

// export interface IStaticRuleManager
// {
//     // startRule(dirName: string, targetNames: string[], prerequisiteName: string[], orderOnlyPrerequisiteName: string[]): void;
//     // recipeLine(line: string): void;
//     addRule(
//         dirName: string, 
//         targetNames: string[], 
//         prerequisiteName: string[], 
//         orderOnlyPrerequisiteName: string[],
//         recipe: string[]
//     ): void;

// }

// class StaticRuleManager implements IStaticRuleManager
// {
//     public readonly rules: IRule[] = [];
//     constructor(private readonly targetManager: ITargetManager)
//     {}

//     public addRule(
//         dirName: string, 
//         targetNames: string[], 
//         prerequisiteName: string[], 
//         orderOnlyPrerequisiteName: string[],
//         recipe: string[]
//     ): void
//     {
//         if (!targetNames || targetNames.length == 0)
//             exits.ruleMissingTarget();

//         // // Default target:
//         // // ===============
//         // // If this is the first target, mark it as the default
//         // // for this makefile
//         // if (!this.defaultTarget)
//         //     this.defaultTarget = targetNames.find(t => !t.startsWith(".") && !t.startsWith("@"));  

//         // Register targets:
//         // =================
//         var targets =
//             targetNames
//                 .map((f) => this.targetManager.addTarget(f, path.resolve(dirName, f), false));

//         // Register prerequisites:
//         // =======================
//         var prerequisites =
//             prerequisiteName
//                 .map((f) => this.targetManager.addTarget(f, path.resolve(dirName, f), false));

//         var orderOnlyPrerequisites =
//             orderOnlyPrerequisiteName
//                 .map((f) => this.targetManager.addTarget(f, path.resolve(dirName, f), true));

//         // Create a rule for each target:
//         // ==============================
//         // See gmake manual "4.10: Multiple targets in a rule"
//         for (let target of targets)
//         {
//             let rule = target.producedBy() as Rule;
//             if (!rule)
//             {
//                 // create a new rule:
//                 rule = new Rule([target], prerequisites.concat(orderOnlyPrerequisites), recipe);
//                 target.setProducedBy(rule);
//                 this.rules.push(rule);
//             }
//             else
//             {
//                 // merge into existing rule
//                 for (let addpr of prerequisites.concat(orderOnlyPrerequisites))
//                 {
//                     if (rule.prerequities.indexOf(addpr) < 0)
//                         rule.prerequities.push(addpr);
//                 }

//                 if (!!recipe && recipe.length > 0)
//                 {
//                     if (rule.recipe.isLocked())
//                     {
//                         exits.parseMultipleRulesForTarget(rule.targets.map(t=>t.name).join(" "));
//                     }
        
//                     rule.recipe.steps.push(...recipe);
//                 }
//             }

//             // OK, we're building on top of a previously defined rule
//             // - but if it already has a recipe, we cannot add to that
//             if (rule.recipe.steps.length > 0)
//                 rule.lockRecipe();

//         }
//     }

//     public includeRules(included: StaticRuleManager): void
//     {
//         for (var srcRule of included.rules)
//         {
//             this.includeRule(srcRule);
//         }
//     }

//     private includeRule(srcRule: IRule): void
//     {
//         var self = this;

//         // var includedTarget = this.includeTarget(srcRule.target);
//         var includedTargets = 
//             srcRule.targets.map(
//                 t => self.targetManager.addTarget(t.name, t.fullName, t.isOrderOnly)
//             );

//         var includedPrerequisites = 
//             srcRule.prerequities.map(
//                 t => self.targetManager.addTarget(t.name, t.fullName, t.isOrderOnly)
//             );

//         var includedRule = new Rule(includedTargets, includedPrerequisites);
//         includedTargets.forEach(t => t.setProducedBy(includedRule));
//         this.rules.push(includedRule);

//         for (var l of srcRule.recipe.steps)
//             includedRule.recipe.steps.push(l);
//     }

//     public toString(): string
//     {
//         return this.rules.map(r => r.toString()).join("\n");
//     }
// }
