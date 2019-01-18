import * as exits from '../../return-codes';
import * as path from "path";
import { IFilePlan, PlanBuilder } from "../plan";
import { ExplicitRuleHandler } from "./explicit-rule-manger";
import { ExplicitRule } from "../../parser/result";
import { FileRef } from "../plan/plan-impl";
import { IVariableManager } from '../../variables';

export class PlanManager
{
    private readonly explicitRuleHandler: ExplicitRuleHandler;
    ;
    constructor(
        private readonly builder: PlanBuilder, 
        explicitRules: ExplicitRule[],
        private readonly variablemanager: IVariableManager
    )
    {
        let self = this;
        this.explicitRuleHandler = 
            new ExplicitRuleHandler(
                (target) => self.planTargetFile(target.basedir, target.relname),
                explicitRules, 
                this.builder
            );
    }

    public planGoal(basedir: string, relname: string): void
    {
        let goal = this.planTargetFile(basedir, relname);

        if (!goal)
        {
            exits.commandUnknownGoal(relname);
        }

        this.builder.goals.push(goal);
    }

    public planMakefile(basedir: string, relname: string): void
    {
        let goal = this.planTargetFile(basedir, relname);

        if (!!goal)
        {
            this.builder.goals.push(goal);
        }
    }

    private planTargetFile(basedir: string, relname: string): IFilePlan
    {
        //console.error("planGoal(" + basedir + ", " + relname + ")");
        let res: IFilePlan = null;
        let fullname = path.join(basedir, relname);

        if (!res)
            res = this.builder.existingPlan(fullname);

        if (!res)
            res = this.explicitRuleHandler.applyMatchingRules(fullname);

        // if (!res)
        //     res = this.builder.addPlan(new FileRef(relname, fullname), null, null);
            
        return res;
    }
}

