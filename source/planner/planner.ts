import * as exits from '../make-errors';
import * as path from "path";
import * as log from '../makelog';
import { IParser } from "../parser";
import { IPlan, IFileRef, IFilePlan } from "./plan";
import { PlanBuilder, IPlanBuilder } from "./plan/plan-builder";
import { MakeOptions } from "../options";
import { PlanManager } from "./managers";
import { TargetName } from '../parser/parser-impl/result-builder/targets/target-name';

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
        log.info("Plan phase begin...");
        //console.log("PARSING - starting a new context");
        let builder = new PlanBuilder(basedir, parseResult.makefileNames, parseResult.variablemanager);
        let planManager = 
            new PlanManager(
                builder, 
                parseResult.explicitRules, 
                parseResult.implicitRules, 
                parseResult.variablemanager
            );

        for (var target of parseResult.goals)
        {
            planManager.planGoal(target);
        }

        for (var makefile of parseResult.makefileNames)
        {
            planManager.planMakefile(
                new TargetName(
                    { filename: "none", fromLine: 0, fromCol: 0, toLine: 0, toCol: 0},
                    { vpath: [] }, 
                    path.dirname(makefile), 
                    path.basename(makefile)
                ))
            ;
        }
        
        var res = builder.build();
        log.info("Plan phase end...");
        return res;
    }

    watch(onChange: () => void): void 
    {
        throw new Error("Method not implemented.");
    }
}
