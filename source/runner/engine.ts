import * as exits from '../make-errors';
import * as fs from 'fs';
import * as log from '../makelog';
import { IPlan, IFilePlan, IFileRef } from '../planner/plan';
import { runPlan } from './run-recipe';

const UNKNOWN_TARGET = 'target:unknown';


export class Engine
{
    constructor(private readonly plan: IPlan) 
    {}

    public updateGoals(goals: IFilePlan[]): boolean
    {
        let res = false;
        for (let goal of goals)
        {
            res = this._updateTarget(goal, this.timestamp(goal.file.fullname, Number.NEGATIVE_INFINITY), "*") || res;
        }

        return res;
    }

    private _intermediatesBuilt: string[] = [];
    public cleanupIntermediates()
    {}

    /**
     * Returns true if target changed
     * @param target
     */
    private _hasChangesAfter(fileplan: IFilePlan, ignoreChangesBefore: number, prefix: string): boolean
    {
        let self = this;
        let targetFullname = fileplan.file.fullname;
        let action = fileplan.producedBy;

        //console.error(prefix + "TESTING(" + targetFullname + "): start");

        // Source file:
        // ============
        //
        // Targets appearing only as prerequisites (i.e with no specification
        // of how they should be produced) are assumed to be source files:
        //
        //     foo.o: foo.c foo.h bar.h
        //          cc foo.c -o foo.o
        //
        //     bar.c bar.h: bar.spec
        //          ...
        // 
        // (in the above example foo.c, foo.h and bar.spec are sources, but
        // bar.c and bar.h are not)

        if (this.isSourceFile(fileplan))
        {
            if (!fs.existsSync(targetFullname))
            {
                exits.ruleUnknownTarget(targetFullname, targetFullname);
            }

            return this.timestamp(targetFullname) >= ignoreChangesBefore;
        }

        // Naked leaf nodes:
        // =================
        //
        //    specification.zip: ALWAYS
        //           wget ftp://foo.com/specification.zip
        //    ALWAYS:
        //
        // 4.7: ...If a target has no prerequisites or recipe
        // [henceforth a "naked leaf node", tsc], and the target
        // of the rule is a nonexistent file, then make imagines 
        // this target to have been updated whenever its rule
        // is run.This implies that all targets depending on 
        // this one will always have their recipe run.

        if (this.isNakedLeaf(fileplan))
        {
            if (!fs.existsSync(targetFullname))
            {
                //log.info(
                //    prefix + "SCHEDULING(" + target.name + "): " +
                //    target.fullName + " is a naked leaf node"
                //);
                return true;
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

        if (this.isPhony(fileplan))
        {
            log.info(
                prefix + "SCHEDULING(" + targetFullname + "): " +
                targetFullname + " is .PHONY"
            );
            //this._execute(fileplan);
            return true;
        }

        // Intermediate files:
        // ===================
        // Intermediate files are remade using their rules just like all other
        // files. But intermediate files are treated differently in two ways.
        //
        // The first difference is what happens if the intermediate file does
        // not exist.
        //
        // If an ordinary file b does not exist, and make considers
        // a target that depends on b, it invariably creates b and then updates
        // the target from b.
        //
        // But if b is an intermediate file, then make can leave well enough
        // alone. It won’t bother updating b, or the ultimate target, unless
        // some prerequisite of b is newer than that target or there is some
        // other reason to update that target.

        // Depth-first recursion:
        // ----------------------
        if (action.prerequisites.some(pr => self._hasChangesAfter(pr, ignoreChangesBefore, prefix + "   ")))
            return true;

        // Rebuild target if it is missing:
        // --------------------------------
        let isOrdinary = (fileplan.file.isIntermediate() == false && fileplan.file.isSecondary() == false);
        if (!fs.existsSync(targetFullname))
            return isOrdinary;

        return false;
    }

    /**
     * Returns true if target changed
     * @param target
     */
    private _updateTarget(fileplan: IFilePlan, parentTimestamp: number,  prefix: string): boolean
    {
        let self = this;
        let targetFullname = fileplan.file.fullname;
        let action = fileplan.producedBy;

        //console.error(prefix + "TESTING(" + targetFullname + "): start");

        // Source file:
        // ============
        //
        // Targets appearing only as prerequisites (i.e with no specification
        // of how they should be produced) are assumed to be source files.
        // 
        // In the below example foo.c, foo.h and bar.spec are sources - but
        // bar.c and bar.h are not:
        //
        //     foo.o: foo.c foo.h bar.h
        //          cc foo.c -o foo.o
        //
        //     bar.c bar.h: bar.spec
        //          ...

        if (!action)
        {
            if (!fs.existsSync(targetFullname))
                exits.ruleUnknownTarget(targetFullname, targetFullname);

            return false;
        }

        // Naked leaf nodes:
        // =================
        //
        //    specification.zip: ALWAYS
        //           wget ftp://foo.com/specification.zip
        //    ALWAYS:
        //
        // 4.7: ...If a target has no prerequisites or recipe
        // [henceforth a "naked leaf node", tsc], and the target
        // of the rule is a nonexistent file, then make imagines 
        // this target to have been updated whenever its rule
        // is run.This implies that all targets depending on 
        // this one will always have their recipe run.

        if (this.isNakedLeaf(fileplan))
        {
            if (!fs.existsSync(targetFullname))
            {
                //log.info(
                //    prefix + "SCHEDULING(" + target.name + "): " +
                //    target.fullName + " is a naked leaf node"
                //);
                return true;
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

        if (this.isPhony(fileplan))
        {
            log.info(
                prefix + "SCHEDULING(" + targetFullname + "): " +
                targetFullname + " is .PHONY"
            );
            this._execute(fileplan);
            return true;
        }

        // Intermediate files:
        // ===================
        // Intermediate files are remade using their rules just like all other
        // files. But intermediate files are treated differently in two ways.
        //
        // The first difference is what happens if the intermediate file does
        // not exist.
        //
        // If an ordinary file b does not exist, and make considers
        // a target that depends on b, it invariably creates b and then updates
        // the target from b.
        //
        // But if b is an intermediate file, then make can leave well enough
        // alone. It won’t bother updating b, or the ultimate target, unless
        // some prerequisite of b is newer than that target or there is some
        // other reason to update that target.
        let isOrdinary = fileplan.file.isIntermediate() == false && fileplan.file.isSecondary() == false;
        let thisTimestamp = isOrdinary ? this.timestamp(targetFullname, Number.NEGATIVE_INFINITY): parentTimestamp;
        // Depth-first recursion:
        // ----------------------
        // First update any prerequisites.
        let rebuilt = false;
        let rebuiltNames = "";
        for (var prereq of action.prerequisites)
        {
            if (this._updateTarget(prereq, thisTimestamp, prefix + "   "))
            {
                rebuilt = true;
                rebuiltNames = rebuiltNames + " " + prereq.file.fullname;
            }
        }

        // If any prerequisites were updated, this
        // target needs updating too:
        if (rebuilt)
        {
            // log.info(
            //     prefix + "SCHEDULING(" + targetFullname + ") " +
            //     "because prerequisites (" + rebuiltNames.trim() + ") were scheduled for update"
            // );

            // self._execute(fileplan);
            // return true;
        }

        if (!fs.existsSync(targetFullname))
        {
            if (isOrdinary)
            {
                log.info(
                    prefix + "SCHEDULING(" + targetFullname + ") " +
                    "because file " + targetFullname + " doesn't exist"
                );

                self._execute(fileplan);
                return true;
            }
            else
            {
                // Check if the parent target is outdated by any prerequisites:
                // -------------------------------------------------------------
                let outdated = false;
                let outdatedBy = "";
                for (var prereq of action.prerequisites)
                {
                    if (this.timestamp(prereq.file.fullname) >= parentTimestamp)
                    {
                        outdated = true;
                        outdatedBy = outdatedBy + " " + prereq.file.fullname;
                    }
                }

                if (outdated)
                {
                    log.info(
                        prefix + "SCHEDULING(" + targetFullname + ") " +
                        "because prerequisites (" + outdatedBy.trim() + ") are newer"
                    );
        
                    self._execute(fileplan);
                    return true;
                }

                log.info(
                    prefix + "SKIPPING " + targetFullname + "(" + parentTimestamp + ") " +
                    "because file " + targetFullname + " is up-to-date" +
                    "compared to (" + outdatedBy + ")"
                );
            }
        }

        return false;
    }

    private _generatedIntermediates: IFileRef[] = [];
    private _execute(target: IFilePlan): void
    {
        if (target.file.isIntermediate())
        {
            if (!target.file.isPrecious())
            {
                this._generatedIntermediates.push(target.file);
            }
        }
        runPlan(target, this.plan.variablemanager);
    }

    public cleanup(): void
    {
       for (var generated of this._generatedIntermediates)
       {
           if (fs.existsSync(generated.fullname))
           {
               console.log("rm " + generated.orgname);
               fs.unlinkSync(generated.fullname);
           }
       }
       this._generatedIntermediates = [];
    }

    private isSourceFile(target: IFilePlan): boolean 
    {
        // Source file:
        // ============
        //
        // Targets appearing only as prerequisites (i.e with no specification
        // of how they should be produced) are assumed to be source files:
        //
        //     foo.o: foo.c foo.h bar.h
        //          cc foo.c -o foo.o
        //
        //     bar.c bar.h: bar.spec
        //          ...
        // 
        // (in the above example foo.c, foo.h and bar.spec are sources, but
        // bar.c and bar.h are not)

        if (!target.producedBy)
        {
            return true;
        }

        return false;
    }
    private isNakedLeaf(target: IFilePlan): boolean
    {
        let rule = target.producedBy;

        if (!rule)
            return false;

        if (rule.prerequisites && rule.prerequisites.length > 0)
            return false;

        if (rule.recipe && rule.recipe && rule.recipe.length > 0)
            return false;

        return true;
    }

    private readonly phonies: IFileRef[] = [];
    private isPhony(target: IFilePlan): boolean 
    {
        if (this.phonies.indexOf(target.file) >= 0)
            return true;

        let rule = target.producedBy;

        if (!rule)
            return false;

        if (rule.prerequisites && rule.prerequisites.length > 0)
            return false;

        return true;
    }

    private recursiveTimestamp(fp: IFilePlan): number
    {
        let self = this;
        if (fp.file.isIntermediate() || fp.file.isSecondary())
        {
            if (!!fp.producedBy)
            {
                let prereqTimestamps = 
                    fp.producedBy.prerequisites.map(pr => self.recursiveTimestamp(pr));
                return Math.max(...prereqTimestamps)
            }
        }

        return this.timestamp(fp.file.fullname);
    }

    private timestamp(fullName: string, defaultValue: number = 0): number
    {
        let res = -1;

        if (!fullName)
        {
            res = defaultValue;
        }
        else if (!fs.existsSync(fullName))
        {
            //if (fullName.endsWith(".h"))
            //    throw new Error(fullName + " missing");

            res = defaultValue;
        }
        else 
        {
            res = fs.statSync(fullName).mtimeMs;;
        }

        log.info("timestamp " + fullName + " = " + res);
        return res;
    }

}
