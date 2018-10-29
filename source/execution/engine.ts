import * as fs from 'fs';
import * as path from 'path';
import { IMakefile, ITarget, IRule, IRecipe, IPlan } from '../imakefile';
import { Plan } from './plan';
import * as asciiTree from "ascii-tree";

const UNKNOWN_TARGET = 'target:unknown';

export function plan(makefile: IMakefile, targets: string[]): IPlan
{
    var engine = new Engine(makefile);
    return engine.updateTargets(targets.map(n => path.resolve(n)));
}

export function toTree(makefile: IMakefile, targetName: string): string
{
    var target: ITarget = makefile.findTarget(path.resolve(".", targetName));
    return asciiTree.generate( _toTree(target, "#"));
}

function _toTree(target: ITarget, prefix: string): string
{
    var res =
        prefix + target.toString() ;

    if (!target.producedBy())
        return res;

    res += " (" + target.producedBy().recipe.steps.join(" && ") + ")";

    prefix += "#";

    for (var child of target.producedBy().prerequities)
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

    public updateTargets(targetNames: string[]): IPlan
    {
        for (var targetName of targetNames)
        {
            var target: ITarget = this.makefile.findTarget(targetName);
            if (!target)
                throw new Error("Unknown target " + targetName);
            this._updateTarget(target);
        }

        var res = this.plan;
        this.plan = new Plan();
        return res;
    }

    /**
     * Returns true if target changed
     * @param target
     */
    private _updateTarget(target: ITarget): boolean
    {
        var targetTime = this.timestamp(target.fullName);
        var rule = target.producedBy();

        // If there's no rule for this target (i.e. it's a leaf node),
        // there's no way to update it:
        if (!rule)
            return false;

        // Check if the target is already out-of-date BEFORE any
        // update action is planned, we might as well put it in 
        // the plan already:
        var prerequisiteTimes = rule.prerequities.map((p) => this.timestamp(p.fullName));
        if (Math.max(...prerequisiteTimes) >= targetTime)
        {
            return this.plan.addStep(rule.recipe);
        }

        // Finally check for updates to any prerequisites:
        var changed = false;
        for (var prereq of rule.prerequities)
        {
            changed = changed || this._updateTarget(prereq);
        }

        if (changed)
        {
            return this.plan.addStep(rule.recipe);
        }

        return false;
    }

    private timestamp(fullName: string): number
    {
        if (!fullName)
            return 0;

        if (!fs.existsSync(fullName))
            return 0;

        return fs.statSync(fullName).mtimeMs;;
    }

}
