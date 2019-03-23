import * as log from '../makelog';
import { IPlanner } from "../planner/planner";
import { MakeOptions } from "../options";
import { IPlan, IFilePlan } from "../planner/plan";
import { Engine } from './engine';

export interface IRunner
{
    run(): void;
    watch(onChange: () => void): void;
}

export class Runner implements IRunner
{
    public constructor(
        private readonly planner: IPlanner,
        private readonly options: MakeOptions
    )
    {}

    public run(): void 
    {
        let plan: IPlan = null;
        do {
           plan = this.planner.plan(); 
        } while (this.updateMakefiles(plan));

        log.info("Run phase begin...");
        this._run(plan, plan.goals); 
        log.info("Run phase end");
    }
    
    private _run(plan: IPlan, goals: IFilePlan[], isMakefileBuild: boolean = false): boolean //Names: string[]): void 
    {
        log.info("plan: " + JSON.stringify(plan, null, 3));
        var engine = new Engine(plan);
        let res = engine.updateGoals(goals, isMakefileBuild); //goalNames);
        engine.cleanup();
        return res;
    }
    
    watch(onChange: () => void): void 
    {
        // throw new Error("Method not implemented.");
    }
    
    updateMakefiles(plan: IPlan): boolean 
    {
        var makefiles = plan.makefileNames;
        var makefilePlans = makefiles.map(f => plan.getFilePlan(f)).filter(fp => !!fp);

        log.info("updating " + JSON.stringify(makefiles) + "\n\n\n==> " + makefilePlans.length + ": " +  JSON.stringify(makefilePlans, null, 3));

        return this._run(plan, makefilePlans, true);
    }
}