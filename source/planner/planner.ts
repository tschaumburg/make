import * as exits from '../return-codes';
import * as path from "path";
import { IParser } from "../parser";
import { IPlan, IFileRef, IFilePlan } from "./plan";
import { PlanBuilder, IPlanBuilder } from "./plan/plan-builder";
import { MakeOptions } from "../options";
import { PlanManager } from "./managers";
import { exists } from "fs";

export interface IPlanner
{
    plan(): IPlan;
    watch(onChange: () => void): void;
}

export class Planner implements IPlanner
{
    public constructor(
        private readonly parser: IParser,
        private readonly options: MakeOptions
    )
    {
    }

    /**
     * Update all goals specified on the command line (or
     * the default target, if no goals are specified).
     * 
     * Goal names are interpreted relative to the main
     * Makefile *or* as specified using the VPATH variable
     * or directive
     */
    public plan(): IPlan
    {
        let parseResult = this.parser.parse();
        let basedir = parseResult.basedir;
        let builder = new PlanBuilder(basedir, parseResult.makefileNames);
        let planManager = new PlanManager(builder, parseResult.explicitRules);

        // let explicitGoals = this.options.goals;

        // if (!explicitGoals || explicitGoals.length == 0)
        // {
        //     planManager.planGoal(parseResult.defaultTarget.basedir, parseResult.defaultTarget.relname);
        // }
        // else
        // {
        //     for (var goalName of explicitGoals)
        //     {
        //         planManager.planGoal(basedir, goalName);
        //     }
        // }

        for (var target of parseResult.goals)
        {
            let goal = planManager.planGoal(target.basedir, target.relname);

            if (!goal)
            {
                exits.commandUnknownGoal(target.relname);
            }

            builder.goals.push(goal);
        }
        
        var res = builder.build();
        return res;
    }

    watch(onChange: () => void): void 
    {
        throw new Error("Method not implemented.");
    }
}
