import * as path from "path";
import * as options from '../../../options';
import { VariableManager } from './variable-manager';
import { IParseResultBuilder, IParseLocation, IParseContext } from '../result-builder';
import { ParseResultImpl } from './result-impl';
import { Target, TargetName } from '../targets';
import { IParseResult } from '../result';
import { BaseRule, IRuleSet, createRuleset } from '../rules';
import { exists } from "fs";

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
    return new ParseResultBuilderImpl(builderOptions.basedir, builderOptions.importedVariables);
}

class ParseResultBuilderImpl implements IParseResultBuilder
{
    private _parseContext: IParseContext = { vpath: []}
    private readonly rules: IRuleSet;
    private readonly makefileNames: string[] = [];
    protected readonly variableManager: VariableManager;
    private defaultTarget: TargetName;

    constructor(
        private readonly basedir: string,
        private readonly importedVariables: { [name: string]: string }
    )
    {
        this.rules = createRuleset(); // createManager();
        this.variableManager = new VariableManager(importedVariables);
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
        targets0: string[],
        targets1: string[], 
        targets2: string[], 
        targets3: string[], 
        inlineRecipe: string
    ): void
    {
        this.currentRule = 
            this.rules.addRule(
                location, 
                this._parseContext,
                path.resolve(process.cwd(), dirname), 
                targets0, 
                targets1, 
                targets2, 
                targets3, 
                inlineRecipe
            );

        this.setDefaultTarget(this.rules.defaultTarget);
    }

    public recipeLine(line: string): void
    {
        if (!this.currentRule)
            return;

        line = this.expandVariables(line);
        
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
        return this.variableManager.expandVariables(value);
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
            this.importedVariables,
            this.rules.explicitRules,
            this.rules.implicitRules,
            this.rules.staticPatternRules,
            new Array(...this.makefileNames),
            //new Array(...this.goals),
            goals
        );
    }
}

