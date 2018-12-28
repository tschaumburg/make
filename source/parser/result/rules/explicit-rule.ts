import * as exits from '../../../return-codes';
import { BaseRule } from "./base-rule";
import { Target, TargetName } from "../targets";
import { TargetNameFactory } from "../builder/target-factories";
import { IParseContext, IParseLocation } from "../result-builder";

export class ExplicitRule extends BaseRule
{
    readonly targets: TargetName[]; // must all be explicit
    readonly prereqs: TargetName[]; // must all be explicit
    readonly orderOnly: TargetName[]; // must all be explicit
    constructor(
        location: IParseLocation,
        context: IParseContext,
        basedir: string, 
        targetNames: string[], 
        prereqNames: string[], 
        orderOnlyNames: string[],
        inlineRecipe: string)
    {
        super(inlineRecipe);

        if (!targetNames || targetNames.length ==0)
            exits.ruleMissingTarget();

        this.targets = 
            TargetNameFactory.createList(
                location,
                context,
                basedir,
                targetNames
            );
        this.prereqs = 
            TargetNameFactory.createList(
                location,
                context,
                basedir,
                prereqNames
            );
        this.orderOnly = 
            TargetNameFactory.createList(
                location,
                context,
                basedir,
                orderOnlyNames
            );
    }
}
