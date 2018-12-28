import * as exits from '../../../return-codes';
import { Target } from "../targets";
import { BaseRule } from "./base-rule";
import { IParseContext, IParseLocation } from "../result-builder";
import { TargetPatternFactory, TargetFactory } from "../builder/target-factories";

export class ImplicitRule extends BaseRule
{
    readonly targetPatterns: Target[]; // must all be pattern
    readonly prereqPatterns: Target[]; // either explicit or patern
    readonly orderOnlyPatterns: Target[]; // either explicit or patern
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

        this.targetPatterns = 
            TargetPatternFactory.createList(
                location,
                context,
                basedir,
                targetNames, 
            );
        this.prereqPatterns = 
            TargetFactory.createList(
                location,
                context,
                basedir,
                prereqNames, 
            );
        this.orderOnlyPatterns = 
            TargetFactory.createList(
                location,
                context,
                basedir,
                orderOnlyNames, 
            );
    }
}
