import * as exits from '../../make-errors';
import * as path from "path";
import { IExplicitRule, ITargetName, ITarget } from "../../parser";
import { IFileRef, IFilePlan } from "../plan";
import { IPlanBuilder } from "../plan/plan-builder";
//import { Action, FileRef } from "../plan/plan-impl";
import * as filemanager from "./file-manager";

export class ExplicitRuleHandler
{
    public isMentioned(target: ITargetName): boolean
    {
        let fileFullname = target.fullname();
        for (var rule of this._srcRules)
        {
            for (var _target of rule.targets)
            {
                var fileref = filemanager.doesFilenameMatchTarget(_target, fileFullname);
                return !!fileref;
            }
        }
    }
    constructor(
        private readonly _planner: (target: ITargetName) => IFilePlan,
        private readonly _srcRules: IExplicitRule[],
        private readonly _planBuilder: IPlanBuilder
    ) {}

    public plan(
        _target: ITargetName //fileFullname: string
    ): IFilePlan 
    {
        //console.error("Finding explicit rules matching " + fileFullname);
        let self = this;
        let res: IFilePlan = null;
        let fileFullname = _target.fullname();

        for (var rule of this._srcRules)
        {
            for (var ruleTarget of rule.targets)
            {
                var fileref = filemanager.doesFilenameMatchTarget(ruleTarget, fileFullname);
                if (!!fileref)
                {
                    // OK,we found an explicit (rule, target) tuple that 
                    // claims to generate fileFullname

                    let planPrereqs = 
                        rule.prereqs.map(p => self.planPrerequisite(p))
                    
                    let planOrderOnly = 
                        rule.orderOnly.map(p => self.planPrerequisite(p))
            
                    var vpath = 
                        filemanager.resolveVpath(
                            ruleTarget.basedir, 
                            ruleTarget.parseContext.vpath, 
                            ruleTarget.relname
                        );
                    
                    //let planAction = 
                    res = this._planBuilder.addPlan(
                        _target, //fileref, 
                        planPrereqs, 
                        planOrderOnly, 
                        rule.recipe.steps,
                        vpath
                    );
                }
            }
        }

        return res;
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