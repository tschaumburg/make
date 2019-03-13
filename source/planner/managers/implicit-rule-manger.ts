import * as exits from '../../make-errors';
import * as path from "path";
import * as fs from "fs";
import { IExplicitRule, ITargetName, ITarget, IImplicitRule, IStem, ITargetPattern } from "../../parser";
import { IAction, IFilePlan, IFileRef } from "../plan";
import { IPlanBuilder } from "../plan/plan-builder";
import * as filemanager from "./file-manager";
import { match } from 'minimatch';
import { TargetName } from '../../parser/parser-impl/result-builder/targets/target-name';

export class ImplicitRuleHandler
{
    constructor(
        private readonly _planner: (target: ITargetName) => IFilePlan,
        private readonly _srcRules: IImplicitRule[],
        private readonly _planBuilder: IPlanBuilder,
        private readonly _isMentioned: (target: ITargetName) => boolean
    ) {}

    public plan(
        xtarget: ITargetName
        ): IFilePlan 
    {
        let applicableRule = this.findApplicableImplicitRule(xtarget);
        if (!applicableRule)
            return null;

        // Once a rule that applies has been found, each target pattern 
        // of the rule (other than the one that matched targetFullname)
        // is expanded.
        // 
        // the resultant file name is stored 
        // until the recipe to remake the target file t is executed. After 
        // the recipe is executed, each of these stored file names are entered 
        // into the data base and marked as having been updated and having the 
        // same update status as the file t."
        let target = applicableRule.matchedTarget;
        let otherTargets = applicableRule.otherTargets;

        let planPrereqs = 
            applicableRule.prerequisite.map(p => this.planPrerequisite(p));
        
        let planOrderOnly = 
            applicableRule.orderOnly.map(p => this.planPrerequisite(p));
        
        //let planAction = new Action(planPrereqs, planOrderOnly, applicableRule.rule.recipe.steps);

        var vpath = filemanager.resolveVpath(target.basedir, target.parseContext.vpath, target.relname);
        let plan =
            this._planBuilder.addMultiplan(
                target, 
                otherTargets, 
                // planAction, 
                planPrereqs, 
                planOrderOnly, 
                applicableRule.rule.recipe.steps,
                vpath
            );
    }

    private findApplicableImplicitRule(target: ITargetName): ImplicitRuleMatch
    {
        // "...Here is the procedure make uses for searching for an implicit
        // rule for a target t.
        //
        //    A. Make a list of implicit rules matching the target name
        let matchingRules = this.findMatchingImplicitRules(target);

        //    B. For each pattern rule in the list:
        for (var patternRuleMatch of matchingRules)
        {
            //   1. Find the stem s, which is the nonempty part of t or n 
            //      matched by the ‘%’ in the target pattern.
            //   2. Compute the prerequisite names by substituting s for ‘%’; 
            //      if the target pattern does not contain a slash, append d 
            //      to the front of each prerequisite name.
            let prerequisites = patternRuleMatch.allPrerequisiteFullNames;
            
            //   3. Test whether all the prerequisites exist or ought to 
            //      exist. (If a file name is mentioned in the makefile 
            //      as a target or as an explicit prerequisite, then we
            //      say it ought to exist.)
            //      If all prerequisites exist or ought to exist, or there 
            //      are no prerequisites, then this rule applies.
            if (this.prequisitesExistsOrOughtToExist(prerequisites))
            {
                return patternRuleMatch;
            }
        }

        //    C. If no pattern rule has been found so far, try harder. 
        //       For each pattern rule in the list:
        for (var patternRuleMatch of matchingRules)
        {
            //   1. If the rule is terminal, ignore it and go on to the 
            //      next rule.
            if (patternRuleMatch.isTerminal())
            {
                continue;
            }
    
            //   2. Compute the prerequisite names as before.
            let prerequisiteFullnames = patternRuleMatch.allPrerequisiteFullNames;
    
            //   3. Test whether all the prerequisites exist or ought 
            //      to exist.
            //   4. For each prerequisite that does not exist, follow 
            //      this algorithm recursively to see if the prerequisite 
            //      can be made by an implicit rule.
            //   5. If all prerequisites exist, ought to exist, or can 
            //      be made by implicit rules, then this rule applies.
            if (this.prequisitesExistsOrOughtToExistOrCanBeMade(prerequisiteFullnames))
            {
                return patternRuleMatch;
            }
        }

        //    D. If no implicit rule applies, the rule for .DEFAULT, if any, 
        //       applies. 
        //       In that case, give t the same recipe that .DEFAULT has. 
        //       Otherwise, there is no recipe for t.
        
        return null;
    }

    private prequisitesExistsOrOughtToExist(prerequisiteFullnames: TargetName[]): boolean
    {
        if (!prerequisiteFullnames)
        return true;

        for (var prereq of prerequisiteFullnames)
        {
            if (fs.existsSync(prereq.fullname()))
                continue;

            if (this._isMentioned(prereq) == false)
                return false;
        }

        return true;
    }

    private prequisitesExistsOrOughtToExistOrCanBeMade(prerequisiteFullnames: TargetName[]): boolean
    {
        if (this.prequisitesExistsOrOughtToExist(prerequisiteFullnames))
            return true;

        for (var prereq of prerequisiteFullnames)
        {
            if (this.plan(prereq) == null )
            {
                return false;
            }
        }
    }

    private findMatchingImplicitRules(target: ITargetName): ImplicitRuleMatch[]
    {
        //  1. Split t into a directory part, called d, and the rest, called n.
        //     For example, if t is ‘src/foo.o’, then d is ‘src/’ and n is ‘foo.o’.
        //  2. Make a list of all the pattern rules one of whose targets
        //     matches t or n. If the target pattern contains a slash, it
        //     is matched against t; otherwise, against n.
        let matchingRules = 
            this
            ._srcRules
            .map(rule => ImplicitRuleMatch.match(rule, target))
            .filter(ruleMatch => ruleMatch != null);

        //  3. If any rule in that list is not a match-anything rule, then 
        //     remove all non-terminal match-anything rules from the list.
        if (matchingRules.some(match => !match.isMatchAnything()))
            matchingRules = remove(matchingRules, match => match.isMatchAnything() && !match.isTerminal());

        //       4. Remove from the list all rules with no recipe.
        matchingRules = remove(matchingRules, (rule) => rule.hasRecipe() == false);

        return matchingRules;
    }

    // private updatePlanFromExplicitRule(
    //     plan: IFilePlan,
    //     targetfile: IFileRef, 
    //     fileFullname: string, 
    //     explicitRule: IExplicitRule,
    //     vpath: IFileRef
    // ): IFilePlan
    // {
    //     let self = this;

    //     let planPrereqs = 
    //         explicitRule.prereqs.map(p => self.planPrerequisite(p))
        
    //     let planOrderOnly = 
    //         explicitRule.orderOnly.map(p => self.planPrerequisite(p))
        
    //     let planAction = new Action(planPrereqs, planOrderOnly, explicitRule. recipe.steps);

    //     return this._planBuilder.addPlan(targetfile, planAction, vpath);
    // }

    private planPrerequisite(prerequisite: ITargetName): IFilePlan
    {
        let res = this._planner(prerequisite); 

        if (!res) 
        {
            //let fullname = path.join(prerequisite.basedir, prerequisite.relname);
            res = this._planBuilder.addLeafnode(prerequisite);
        }

        return res;
    }
}

class ImplicitRuleMatch
{
    public readonly matchedTarget: TargetName;
    public readonly otherTargets: TargetName[];
    public readonly prerequisite: TargetName[];
    public readonly orderOnly: TargetName[];
    public readonly allPrerequisiteFullNames: TargetName[];
    
    constructor(public readonly rule: IImplicitRule, matchedTarget: ITargetPattern, public readonly stem: IStem)
    {
        this.matchedTarget = matchedTarget.expand(stem);
        this.otherTargets = rule.targetPatterns.filter(tp => tp !== matchedTarget).map(tp => tp.expand(stem));
        this.prerequisite = rule.prereqPatterns.map(tp => expandTarget(tp, stem));
        this.orderOnly = rule.orderOnlyPatterns.map(tp => expandTarget(tp, stem));
    }

    public static match(implicitRule: IImplicitRule, target: ITargetName): ImplicitRuleMatch
    {
        let bestMatch: {tp: ITargetPattern;  stem: IStem} = null;
        for (var tp of implicitRule.targetPatterns)
        {
            let stem = tp.match(target);
            if (!stem)
                continue;

            if (!bestMatch)
            {
                bestMatch = {tp: tp, stem: stem};
            }
            else if (stem.stem.length > bestMatch.stem.stem.length)
            {
                bestMatch = {tp: tp, stem: stem};
            }
        }

        if (bestMatch === null)
        {
            return null;
        }

        return new ImplicitRuleMatch(implicitRule, bestMatch.tp, bestMatch.stem);
    }

    public isMatchAnything(): boolean
    {
        return (this.rule.targetPatterns.some(match => match.relname === "%"));
    }

    public isTerminal(): boolean
    {
        return this.rule.isTerminal;
    }

    public hasRecipe(): boolean
    {
        if (this.rule === null)
            return false;

        if (this.rule.recipe === null)
            return false;

        if (this.rule.recipe.steps.length > 0 === null)
            return false;

        return true;
    }
}

function expandTarget(from: ITarget, stem: IStem): ITargetName
{
    if (!from)
        return null;

    return from.isPattern() ? (from as ITargetPattern).expand(stem) : (from as ITargetName)
}
function remove(rules: ImplicitRuleMatch[], selector: (r: ImplicitRuleMatch) => boolean): ImplicitRuleMatch[]
{
    return rules.filter(r => !selector(r));
}

// function exists(fullname: string): boolean
// {
//     return fs.existsSync(fullname);
// }

// function oughtToExist(fullname: string): boolean
// {
//     // "...If a file name is mentioned in the makefile as a target or
//     //  as an explicit prerequisite, then we say it ought to exist."
//     //
//     //              Excerpt from GNU Make manual sect. 10.8, item 5.3
// }
