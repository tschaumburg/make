import * as exits from '../../return-codes';
import * as path from "path";
//var globToRegExp = require('glob-to-regexp');
import * as globToRegexp from "glob-to-regexp";
import { ExplicitRule, TargetName, IParseResult, Target } from "../../parser/result";
import { IFileRef, IFilePlan } from "../plan";
//import { Action } from "../plan-impl";
import { IPlanBuilder } from "../plan/plan-builder";
import { Action, FileRef } from "../plan/plan-impl";
import * as glob from "glob";
import * as filemanager from "./file-manager";

export class ExplicitRuleHandler
{
    constructor(
        private readonly _planner: (target: TargetName) => IFilePlan,
        private readonly _srcRules: ExplicitRule[],
        private readonly _planBuilder: IPlanBuilder
    ) {}

    public applyMatchingRules(
        fileFullname: string
        ): IFilePlan 
    {
        //console.error("Finding explicit rules matching " + fileFullname);
        let res: IFilePlan = null;

        for (var rule of this._srcRules)
        {
            for (var target of rule.targets)
            {
                var fileref = filemanager.doesFilenameMatchTarget(target, fileFullname);
                if (!!fileref)
                {
                    var vpath = filemanager.resolveVpath(target.basedir, target.parseContext.vpath, target.relname);
                    res = this.updatePlanFromExplicitRule(res, fileref, fileFullname, rule, vpath);
                }
            }
        }

        return res;
    }

    private updatePlanFromExplicitRule(
        plan: IFilePlan,
        targetfile: IFileRef, 
        fileFullname: string, 
        explicitRule: ExplicitRule,
        vpath: IFileRef
    ): IFilePlan
    {
        let self = this;

        let planPrereqs = 
            explicitRule.prereqs.map(p => self.planPrerequisite(p))
        
        let planOrderOnly = 
            explicitRule.orderOnly.map(p => self.planPrerequisite(p))
        
        let planAction = new Action(planPrereqs, planOrderOnly, explicitRule. recipe.steps);

        return this._planBuilder.addPlan(targetfile, planAction, vpath);
    }

    private planPrerequisite(prerequisite: Target): IFilePlan
    {
        let res = this._planner(prerequisite); 

        if (!res) 
        {
            let fullname = path.join(prerequisite.basedir, prerequisite.relname);
            res = this._planBuilder.addPlan(new FileRef(prerequisite.relname, fullname), null, null);
        }

        return res;
    }
}