import * as path from "path";
import * as options from '../../../options';
import * as log from '../../../makelog';
import { IVariableManager, createVariablemanager } from '../../../variables';
import { IParseResultBuilder, IParseLocation, IParseContext } from '../result-builder';
import { ParseResultImpl } from './result-impl';
import { Target, TargetName } from '../targets';
import { IParseResult } from '../result';
import { BaseRule, IRuleSet, createRuleset } from '../rules';
import { exists } from "fs";
import { stringify } from "querystring";
import { resolve } from "dns";

export interface IBuilderOptions
{
    basedir?: string;
    importedVariables?: { [name: string]: string } ;   
}
export function createResultBuilder(builderOptions?: IBuilderOptions): IParseResultBuilder
{
    builderOptions = builderOptions || {};
    builderOptions.basedir = builderOptions.basedir || options.basedir
    builderOptions.importedVariables = builderOptions.importedVariables || process.env;
    // let basedir = path.dirname(path.resolve(this.makefilename));
    // importedVariables = process.env;
    return new ParseResultBuilderImpl(builderOptions.basedir, createVariablemanager(builderOptions.importedVariables));
}

class ParseResultBuilderImpl implements IParseResultBuilder
{
    private _parseContext: IParseContext = { vpath: []}
    private readonly rules: IRuleSet;
    private readonly makefileNames: string[] = [];
    private defaultTarget: TargetName;

    constructor(
        private readonly basedir: string,
        protected readonly variableManager: IVariableManager
    )
    {
        this.rules = createRuleset(); // createManager();
    };

    public startMakefile(fullMakefileName: string): void
    {
        this.makefileNames.push(fullMakefileName);
    }

    /*********************************************************************
     * 
     * 
     * 
     *********************************************************************/
    private currentRule: BaseRule = null;
    public startRule(
        location: IParseLocation,
        dirname: string,
        targetsExpression: string,
        prerequisitesExpression: string,
        targetPatternExpression: string,
        prereqPatternExpression: string,
        orderOnliesExpression: string,
        inlineRecipeExpression: string
    ): void
    {
        this.currentRule = 
            this.rules.addRule(
                location, 
                this._parseContext,
                path.resolve(process.cwd(), dirname), 
                this.expandtargets(targetsExpression),
                this.expandtargets(prerequisitesExpression),
                this.expandtargets(targetPatternExpression),
                this.expandtargets(prereqPatternExpression),
                this.expandtargets(orderOnliesExpression),
                inlineRecipeExpression
            );

        this.setDefaultTarget(this.rules.defaultTarget);
    }

    private expandtargets(targetExpression: string): string[]
    {
        if (!targetExpression)
        {
            return [];
        }

        let targetString = this.variableManager.evaluateExpression(targetExpression);
        let res = targetString.split(/\s+/).filter(t => t!==null && t!==undefined && t.length>0);
        //console.error(JSON.stringify(targetExpression) + ' => ' + JSON.stringify(res));
        return res;
    }

    public recipeLine(line: string): void
    {
        // console.error("RECIPE4: " + line);
        if (!this.currentRule)
            return;

        // console.error("RECIPE5: " + line);
        // line = this.expandVariables(line);
        
        // console.error("RECIPE6: " + line);
        this.currentRule.recipe.steps.push(line);
    }

    public endRule(): void
    {
        this.currentRule = null;
    }

     /*********************************************************************
     * 
     * 
     * 
     *********************************************************************/
    // public defineVariable(kind: string, name: string, value: string): void
    // {
    //     // console.error("VARIABLE kind='" + kind + "', name='" + name + "', value='" + value + "'");
    //     if (kind==='simple')
    //     {
    //         return this.defineSimpleVariable(name, value);
    //     }
        
    //     if (kind==='recursive')
    //     {
    //         return this.defineRecursiveVariable(name, value);
    //     }
        
    //     if (kind==='append')
    //     {
    //         return this.defineAppendVariable(name, value);
    //     }
        
    //     if (kind==='conditional')
    //     {
    //         return this.defineConditionalVariable(name, value);
    //     }
        
    //     if (kind==='shell')
    //     {
    //         return this.defineShellVariable(name, value);
    //     }

    //     // console.error   ("Unknown variable definition kind '" + kind + "' (supported kinds: 'simple', 'recursive', 'append', 'conditional' and 'shell')");
        
    //     // console.error("VARIABLE " + name + " = '" + value + "'");
    //     this.variableManager.defineSimpleVariable(name, value);
    // }

    public defineSimpleVariable(name: string, value: string): void
    {
        // console.error("VARIABLE " + name + " = '" + value + "'");
        this.variableManager.defineSimpleVariable(name, value);
    }

    public defineRecursiveVariable(name: string, value: string): void
    {
        this.variableManager.defineRecursiveVariable(name, value);
    }

    public defineAppendVariable(name: string, value: string): void
    {
        this.variableManager.defineAppendVariable(name, value);
    }

    public defineConditionalVariable(name: string, value: string): void
    {
        this.variableManager.defineConditionalVariable(name, value);
    }

    public defineShellVariable(name: string, value: string): void
    {
        this.variableManager.defineShellVariable(name, value);
    }

    public expandVariables(value: string): string
    {
        var res = this.variableManager.evaluateExpression(value);
        // log.info("Variable manager expanded '" + value + "' to '" + res + "'");
        return res;
    }

    private _vpathDirective: string[] = []
    public vpathDirective(vpaths: string[]): void
    {
        this._vpathDirective = vpaths;
    }
     /*********************************************************************
     * 
     * 
     * 
     *********************************************************************/
    public setDefaultTarget(val: TargetName): void 
    {
       // console.log("   DEFAULT TARGET: " + JSON.stringify(val));

        if (!this.defaultTarget)
        {
            this.defaultTarget = val;
        }
    }
    public clearDefaultTarget(): void 
    { 
        //console.log("   DEFAULT TARGET: <clear>");
        this.defaultTarget = null;
        this.rules.clearDefaultTarget();
    }

     /*********************************************************************
     * 
     * 
     * 
     *********************************************************************/
    public build(): IParseResult
    {
        let goals: TargetName[] = [];

        if (!!options.goals)
        {
            goals.push(
                ...options.goals.map(
                    s => new TargetName(
                        { filename: "<commandline arg>", lineNo: 0, colNo: 0}, 
                        { vpath: [] }, 
                        this.basedir, 
                        s
                    )
                )
            );
        }

        if (goals.length == 0 && !!this.defaultTarget)
        {
            goals.push(this.defaultTarget);
        }

        return new ParseResultImpl(
            this.basedir, 
            this.variableManager,
            this.rules.explicitRules,
            this.rules.implicitRules,
            this.rules.staticPatternRules,
            new Array(...this.makefileNames),
            //new Array(...this.goals),
            goals
        );
    }
}

