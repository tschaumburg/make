import * as exits from '../../make-errors';
import * as path from "path";
import { IFilePlan, IPlanBuilder } from "../plan";
import { ExplicitRuleHandler } from "./explicit-rule-manger";
import { IVariableManager } from '../../variables';
import { IExplicitRule, IImplicitRule, ITargetName } from '../../parser';
import { ImplicitRuleHandler } from './implicit-rule-manger';
import { Resolver } from 'dns';

export class PlanManager
{
    private readonly explicitRuleHandler: ExplicitRuleHandler;
    private readonly implicitRuleHandler: ImplicitRuleHandler;
    ;
    constructor(
        private readonly builder: IPlanBuilder, 
        explicitRules: IExplicitRule[],
        implicitRules: IImplicitRule[],
        private readonly variablemanager: IVariableManager
    )
    {
        let self = this;
        
        this.explicitRuleHandler = 
            new ExplicitRuleHandler(
                (target) => self.planTargetFile(target),
                explicitRules, 
                this.builder
            );
        
        this.implicitRuleHandler = 
            new ImplicitRuleHandler(
                (target) => self.planTargetFile(target),
                implicitRules, 
                this.builder,
                (target) => self.explicitRuleHandler.isMentioned(target)
            );
    }

    public planGoal(target: ITargetName): void
    {
        let goal = this.planTargetFile(target);

        if (!goal)
        {
            exits.commandUnknownGoal(target.relname);
        }

        this.builder.addGoal(goal);
    }

    public planMakefile(target: ITargetName): void
    {
        let goal = this.planTargetFile(target);

        if (!!goal)
        {
            this.builder.addGoal(goal);
        }
    }

    private planTargetFile(target: ITargetName): IFilePlan
    {
        //console.error("planGoal(" + basedir + ", " + relname + ")");
        let res: IFilePlan = null;

        if (!res)
            res = this.builder.getExistingPlan(target);

        if (!res)
            res = this.explicitRuleHandler.plan(target);

        // "...To allow make to find a customary method [implicit rule] for
        // updating a target file, all you have to do is refrain from 
        // specifying recipes yourself. Either write a rule with no recipe,
        // or don’t write a rule at all.
        // Then make will figure out which implicit rule to use based on
        // which kind of source file exists or can be made."
        //
        //                                           GNU Make manual, 10.1
        //
        // "...This procedure is followed for each double-colon rule with
        // no recipe, for each target of ordinary rules none of which have
        // a recipe, and for each prerequisite that is not the target of
        // any rule.
        //
        //                                           GNU Make manual, 10.8

        if (!res || !res.producedBy || !res.producedBy.recipe || res.producedBy.recipe.length == 0)
            res = this.implicitRuleHandler.plan(target);
            
        if (!res)
            res = this.builder.getExistingPlan(target);

        return res;
    }
}

