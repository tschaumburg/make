import * as path from "path";
import * as options from '../../../options';
import * as log from '../../../makelog';
import * as exits from "../../../make-errors";
import { IVariableManager, createVariablemanager } from '../../../variables';
import { ParseResultImpl } from './result-impl';
import { ITargetName, IParseResult, IBaseRule, IParseContext, IParseLocation } from "../../result";
import { createTargetNameList, createTargetPattern, createTargetPatternList, createTargetList } from "./targets";
import { TargetName } from "./targets/target-name";
import { IRuleSet } from "./rules/rule-set";
import { createRuleset } from "./rules/rule-set-impl";
import { IParseResultBuilder } from "./result-builder";

export interface IBuilderOptions
{
    basedir?: string;
    importedVariables?: { [name: string]: string } ;   
}
export function create(builderOptions?: IBuilderOptions): IParseResultBuilder
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
    private defaultTarget: ITargetName;

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
    private currentRule: IBaseRule = null;
    explicitRule(
        location: IParseLocation, 
        dirname: string, 
        targets: string, 
        prerequisites: string, 
        orderOnlies: string, 
        inlineRecipe: string, 
        isTerminal: boolean
    ):void
    {
        var basedir = path.resolve(process.cwd(), dirname);

        //console.error("orderOnlies = " + JSON.stringify(orderOnlies));
        this.currentRule = 
            this.rules.addExplicitRule(
                createTargetList(targets, location, this._parseContext, basedir),
                createTargetList(prerequisites, location, this._parseContext, basedir),
                createTargetList(orderOnlies, location, this._parseContext, basedir),
                inlineRecipe,
                isTerminal
            );

        this.setDefaultTarget(this.rules.defaultTarget);
    }
    implicitRule(
        location: IParseLocation, 
        dirname: string, 
        targetPatterns: string, 
        prerequisites: string, 
        orderOnlies: string, 
        inlineRecipe: string, 
        isTerminal: boolean
    ): void
    {
        var basedir = path.resolve(process.cwd(), dirname);

        //console.error("orderOnlies = " + JSON.stringify(orderOnlies));
        this.currentRule = 
            this.rules.addImplicitRule(
                createTargetPatternList(targetPatterns, location, this._parseContext, basedir),
                createTargetList(prerequisites, location, this._parseContext, basedir),
                createTargetList(orderOnlies, location, this._parseContext, basedir),
                inlineRecipe,
                isTerminal
            );

        this.setDefaultTarget(this.rules.defaultTarget);
    }

    // private expandTargets(targetExpression: string): TargetInfo[]
    // {
    //     if (!targetExpression)
    //     {
    //         return [];
    //     }

    //     let targetString = this.variableManager.evaluateExpression(targetExpression);
    //     let res = targetString.split(/\s+/).filter(t => t!==null && t!==undefined && t.length>0);
    //     //console.error(JSON.stringify(targetExpression) + ' => ' + JSON.stringify(res));
    //     return res;
    // }


    // public resolveVariables(targetExpression: string): string
    // {
    //     if (!targetExpression)
    //     {
    //         return "";
    //     }

    //     return this.variableManager.evaluateExpression(targetExpression);
    // }

    public recipeLine(line: string): void
    {
        if (line.match(/^\s*$/))
            return;

        //console.error("RECIPE4: " + JSON.stringify( line, null, 3));
        if (!this.currentRule)
        {
            exits.ruleErrorPrematureRecipe();
            return;
        }

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
        var res = this.variableManager.evaluateExpressionNoTrim(value);
        log.info("Variable manager expanded '" + value + "' to '" + res + "'");
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
    public setDefaultTarget(val: ITargetName): void 
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
        let goals: ITargetName[] = [];

        if (!!options.goals)
        {
            goals.push(
                ...options.goals.map(
                    s => new TargetName(
                        { filename: "<commandline arg>", fromLine: 0, fromCol: 0, toLine: 0, toCol: 0}, 
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

// function splitTargets(src: string): string[]
// {
//     let list = splitPattern(src, " ");
//     //console.error(JSON.stringify(src) + " => " + JSON.stringify(list));

//     if (!list)
//         return [];

//     var res =
//         list
//         .filter(t => (!!t))
//         .map(t => t.trim())
//         .filter(t => t.length>0);

//     return res;
// }
