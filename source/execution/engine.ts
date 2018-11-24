import * as exits from '../return-codes';
import * as fs from 'fs';
import * as path from 'path';
import * as log from '../makelog';
import { IMakefile, ITarget, IRule, IRecipe, IPlan } from '../imakefile';
import { Plan } from './plan';
import * as asciiTree from "ascii-tree";
import { resolve } from 'dns';

const UNKNOWN_TARGET = 'target:unknown';

export function plan(makefile: IMakefile, targets: string[]): IPlan
{
    let engine = new Engine(makefile);
    return engine.updateTargets(targets);
}

export function toTree(makefile: IMakefile, targetName: string): string
{
    let target: ITarget = makefile.findTarget(path.resolve(".", targetName));
    if (!target)
    {
        return ("Target \"" + targetName + "\" does not exist, and no rule specifies how to create it");
    }

    return asciiTree.generate( _toTree(target, "#"));
}

function _toTree(target: ITarget, prefix: string): string
{
    let res =
        prefix + target.toString() ;

    if (!target.producedBy())
        return res;

    res += " (" + target.producedBy().recipe.steps.join(" && ") + ")";

    prefix += "#";

    for (let child of target.producedBy().prerequities)
    {
        res = res + "\r\n" + _toTree(child, prefix);
    }

    return res;
}

export class Engine
{
    private plan: Plan = new Plan();
    constructor(private readonly makefile: IMakefile) 
    {}

    public updateTargets(goalNames: string[]): IPlan
    {
        for (let targetName of goalNames)
        {
            let fullname = path.resolve(targetName);
            let target: ITarget = this.makefile.findTarget(fullname);
            if (!target)
            {
                exits.commandUnknownGoal(targetName);
            }

            this._updateTarget(target, "*");
        }

        let res = this.plan;
        this.plan = new Plan();
        return res;
    }

    /**
     * Returns true if target changed
     * @param target
     */
    private _updateTarget(target: ITarget, prefix: string): boolean
    {
        let self = this;

        //log.info(prefix + "TESTING(" + target.name + "): start");

        let rule = target.producedBy();
        if (!rule)
        {
            if (!fs.existsSync(target.fullName))
            {
                exits.ruleUnknownTarget(target.name, target.fullName);
            }
        }

        // Naked leaf nodes:
        // =================
        //
        //    specification.zip: ALWAYS
        //           wget ftp://foo.com/specification.zip
        //    ALWAYS:
        //
        // 4.7: ...If a target has no prerequisites or recipe
        // [henceforth a "naked leaf nodes"], and the target
        // of the rule is a nonexistent file, then make imagines 
        // this target to have been updated whenever its rule
        // is run.This implies that all targets depending on 
        // this one will always have their recipe run.

        if (this.isNakedLeaf(target))
        {
            if (!fs.existsSync(target.fullName))
            {
                //log.info(
                //    prefix + "SCHEDULING(" + target.name + "): " +
                //    target.fullName + " is a naked leaf node"
                //);
                return true; //this.plan.addStep(rule.recipe);
            }
        }

        // Phony targets:
        // ==============
        //
        //    clean:
        //         rm *.o
        //
        // 4.6: A phony target is one that is not really the name 
        // of a file; rather it is just a name for a recipe to be 
        // executed when you make an explicit request.

        if (this.isPhony(target))
        {
            log.info(
                prefix + "SCHEDULING(" + target.name + "): " +
                target.name + " is .PHONY"
            );
            return this.plan.addStep(rule.recipe, target, []);
        }

        // Depth-first recursion:
        // ======================
        if (!!rule)
        {
            // First update any prerequisites if necessary.
            let changedPrerequisites =
                rule.prerequities
                    .filter(
                        p =>
                            self._updateTarget(p, prefix + "   ")
                    );

            // If any prerequisites needed updating, the
            // target needs updating too:
            if (changedPrerequisites.length > 0)
            {
                let names = changedPrerequisites.map(p => p.name).join(" ");
                log.info(
                    prefix + "SCHEDULING(" + target.name + ") " +
                    "because prerequisites (" + names + ") were scheduled for update"
                );
                return this.plan.addStep(rule.recipe, target, rule.prerequities);
            }
        }

        // Missing targets need building:
        // ==============================
        if (!fs.existsSync(target.fullName))
        {
            log.info(
                prefix + "SCHEDULING(" + target.name + ") " +
                "because file " + target.fullName + " doesn't exist"
            );

            return this.plan.addStep(rule.recipe, target, rule.prerequities);
        }

        // Outdated targets need building:
        // ==============================
        // If the target is newer than all prequisites, we're done;
        if (!!rule)
        {
            let targetTime = this.timestamp(target.fullName);
            let newerPrerequisites =
                rule.prerequities
                    .filter(
                        p => self.timestamp(p.fullName) >= targetTime
                    );
            //        let prerequisiteTimes = rule.prerequities.map(p => self.timestamp(p.fullName));
            //if (prerequisiteTimes.some(p => p >= targetTime))

            if (newerPrerequisites.length > 0)
            {
                log.info(
                    prefix + "SCHEDULING(" + target.name + ") " +
                    "because file " + target.fullName + " is outdated" +
                    "compared to (" + newerPrerequisites.map(p => p.name).join(" ") + ")"
                );

                return this.plan.addStep(rule.recipe, target, rule.prerequities);
            }
        }

        //// Leaf nodes:
        //// ===========
        //if (!rule)
        //{
        //    if (fs.existsSync(target.fullName))
        //    {
        //        return false
        //    }
        //    else
        //    {
        //        return true;
        //    }
        //}
        //
        //// If there's no rule for this target (i.e. it's a leaf node),
        //// there's no way to update it:
        //if (!rule)
        //{
        //    log.info("Planning", prefix + "TESTING(" + target.name + "): returns false");
        //    return false;
        //}

        //// First check for updates to any prerequisites:


        //// If this is a .phony rule
        ////    target:
        ////       recipe
        //// always run recipe
        //if (!rule.prerequities || rule.prerequities.length == 0)
        //{
        //    if (!!rule.recipe && rule.recipe.steps.length > 0)
        //    {
        //        let result = this.plan.addStep(rule.recipe);

        //        if (result)
        //            log.info("Planning", prefix + "UPDATING " + target.name + " because it doesn't exist");

        //        log.info("Planning", prefix + "TESTING(" + target.name + "): returns " + result);
        //        return result;
        //    }
        //}

        //// Check if the target was already out-of-date BEFORE any
        //// update action is planned, we might as well put it in 
        //// the plan already:
        //let newerPrerequisiteTimes =
        //    rule.prerequities
        //        .filter((p) => this.timestamp(p.fullName) >= targetTime);

        //if (newerPrerequisiteTimes.length > 0)
        //{
        //    let result = this.plan.addStep(rule.recipe);

        //    if (result)
        //    {
        //        log.info("Planning", 
        //            prefix + "TESTING(" + target.name + "): returns " + result +
        //            " because prerequisites (" +
        //            newerPrerequisiteTimes.map(p => p.fullName).join(", ") +
        //            ") were newer"
        //        );
        //    }
        //    else
        //    {
        //        log.info("Planning", 
        //            prefix + "TESTING(" + target.name + "): returns " + result
        //        );
        //    }

        //    return result;
        //}

        return false;
    }

    private isNakedLeaf(target: ITarget): boolean
    {
        let rule = target.producedBy();

        if (!rule)
            return false;

        if (rule.prerequities && rule.prerequities.length > 0)
            return false;

        if (rule.recipe && rule.recipe.steps && rule.recipe.steps.length > 0)
            return false;

        return true;
    }

    private readonly phonies: ITarget[] = [];
    private isPhony(target: ITarget): any 
    {
        if (this.phonies.indexOf(target) >= 0)
            return true;

        let rule = target.producedBy();

        if (!rule)
            return false;

        if (rule.prerequities && rule.prerequities.length > 0)
            return false;

        return true;
    }

    private timestamp(fullName: string): number
    {
        let res = -1;

        if (!fullName)
        {
            res = 0;
        }
        else if (!fs.existsSync(fullName))
        {
            //if (fullName.endsWith(".h"))
            //    throw new Error(fullName + " missing");

            res = 0;
        }
        else 
        {
            res = fs.statSync(fullName).mtimeMs;;
        }

        log.info("timestamp " + fullName + " = " + res);
        return res;
    }

}
