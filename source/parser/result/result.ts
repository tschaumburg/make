import { IVariableManager } from "../../variables";
import { IParseLocation } from "./location";
import { ISpecialTargets } from "./special-targets";
import { ITargetName, ITargetPattern, ITarget } from "./targets";
import { IExplicitRule, IImplicitRule, IStaticPatternRule } from "./rules";

export interface IParseResult
{
    readonly basedir: string;
    readonly variablemanager: IVariableManager;
    readonly explicitRules: IExplicitRule[];
    readonly implicitRules: IImplicitRule[];
    readonly staticPatternRules: IStaticPatternRule[];
    /**
     * List all the targets and prerequisites mentioned
     * explicitly in the makefile - this list is used to
     * determine if a file produced by make is an 
     * *intermediate* (which should be deleted when make
     * is done):
     */
    readonly explicitlyMentionedFiles: string[];
    readonly specialTargets: ISpecialTargets;
    readonly makefileNames: string[];
    readonly goals: ITargetName[];
}
