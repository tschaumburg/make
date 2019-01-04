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
        //console.log("PARSING - starting a new context");
        let builder = new PlanBuilder(basedir, parseResult.makefileNames);
        let planManager = new PlanManager(builder, parseResult.explicitRules);

        for (var target of parseResult.goals)
        {
            planManager.planGoal(target.basedir, target.relname);
        }

        for (var makefile of parseResult.makefileNames)
        {
            planManager.planMakefile(path.dirname(makefile), path.basename(makefile));
        }
        
        var res = builder.build();
        return res;
    }

    watch(onChange: () => void): void 
    {
        throw new Error("Method not implemented.");
    }
}
