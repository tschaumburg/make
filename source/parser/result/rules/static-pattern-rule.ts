import * as exits from '../../../return-codes';
import { TargetNameFactory, TargetFactory, TargetPatternFactory } from "../builder/target-factories";
import { TargetPattern, TargetName, Target } from "../targets";
import { BaseRule } from "./base-rule";
import { IParseContext, IParseLocation } from "../result-builder";

export class StaticPatternRule extends BaseRule
{
    readonly targets: TargetName[]; // must all be explicit
    readonly targetPattern: TargetPattern; // must all be pattern
    readonly prereqPatterns: Target[]; // either explicit or patern
    readonly orderOnlyPatterns: Target[]; // either explicit or patern
    constructor(
        location: IParseLocation,
        context: IParseContext,
        basedir: string, 
        targetNames: string[], 
        targetPatternNames: string[], 
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
                targetNames, 
            );

        this.targetPattern = 
        TargetPatternFactory.createList(
            location, 
            context,
            basedir,
            targetPatternNames, 
        )[0];

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

