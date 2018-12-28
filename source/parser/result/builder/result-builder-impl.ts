import * as path from "path";
import * as options from '../../../options';
import { VariableManager } from './variable-manager';
import { IParseResultBuilder, IParseLocation, IParseContext } from '../result-builder';
import { ParseResultImpl } from './result-impl';
import { Target, TargetName } from '../targets';
import { IParseResult } from '../result';
import { BaseRule, IRuleSet, createRuleset } from '../rules';

export function createResultBuilder(basedir: string, importedVariables: { [name: string]: string }): IParseResultBuilder
{
    return new ParseResultBuilderImpl(basedir, importedVariables);
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

        if (!this.defaultTarget)
        {
            this.defaultTarget = this.rules.defaultTarget;
        }
    }

    public recipeLine(line: string): void
    {
        if (!this.currentRule)
            return;

        line = this.expandVariable(line);
        
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
    public defineSimpleVariable(name: string, value: string): void
    {
        this.variableManager.defineSimpleVariable(name, value);
    }

    public defineRecursiveVariable(name: string, value: string): void
    {
        this.variableManager.defineRecursiveVariable(name, value);
    }

    public defineRecursiveVariableIf(name: string, value: string): void
    {
        this.variableManager.defineRecursiveVariableIf(name, value);
    }

    public expandVariable(value: string): string
    {
        return this.variableManager.expandVariable(value);
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
        if (!this.defaultTarget)
            this.defaultTarget = val;
    }
    public clearDefaultTarget(): void { this.defaultTarget = null; }

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

