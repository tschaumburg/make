import * as os from "os";
import * as exits from '../return-codes';
import * as log from '../makelog';
//import { getValue } from '../../jison-parser/variables';
import { include } from '../parser/jison-parser/makefile-syntax/makefile-syntax-result';
import { resolveString } from './variable-expander';
import { runShell } from '../run-shell';
import { openSync } from 'fs';

export interface IVariableManager
{
    /**
     * 
     * @param name 
     * @returns
     * - If name refers to a previously defined simple variable: the fully expanded value
     * of the variable. 
     * - If name refers to a previously defined recursive value: null, 
     * - If no variable of the name has been defined: an empty string.
     */
    getValue(name: string): string;
    defineSimpleVariable(name: string, value: string): void;
    defineRecursiveVariable(name: string, value: string): void;
    defineConditionalVariable(name: string, value: string): void;
    defineShellVariable(name: string, value: string): void;
    defineAppendVariable(name: string, value: string): void;
    /**
     * Replace any variable references ('${varname}' or '$(varname)')
     * in the src string with their values, and return the resulting 
     * value
     */
    evaluateExpressionNoTrim(src: string): string;
    evaluateExpression(src: string): string;
}

export function createVariablemanager(importedVariables: { [name: string]: string }): IVariableManager
{
    return new VariableManager(importedVariables);
}

class VariableManager implements IVariableManager
{
    private readonly immediateValues: { [name: string]: string } = {};
    private readonly deferredValues: { [name: string]: string } = {};

    constructor(importedVariables: { [name: string]: string })
    {
        for (var n in importedVariables)
            this.immediateValues[n] = importedVariables[n];

        this.registerPredefined("@");
        this.registerPredefined("@D");
        this.registerPredefined("@F");
        this.registerPredefined("<");
        this.registerPredefined("^");
        this.registerPredefined("?");
        this.registerPredefined("+");
        this.registerPredefined("|");
    };

    private registerPredefined(name: string): void
    {
        if (name.length > 1)
        {
            this.immediateValues[name] = '$(' + name + ')';
        }
        else
        {
            this.immediateValues[name] = '$' + name;
        }
    }

    public setValueImmediate(name: string, expression: string): void
    {
        this.immediateValues[name] = this.evaluateExpression(expression);
        this.deferredValues[name] = null;
    }

    public setValueDeferred(name: string, expression: string): void
    {
        this.immediateValues[name] = null;
        this.deferredValues[name] = expression;
    }

    /*************************************************************************
     * Getting the value of a variable:
     * ================================
     * 
     *************************************************************************/
    public getValue(nameExpression: string): string
    {
        let name = this.evaluateExpression(nameExpression);
        let value = this.immediateValues[name];
        if (!!value)
        {
            return value;
        }

        let expression = this.deferredValues[name];
        if (!!expression)
        {
            return this.evaluateExpression(expression);
        }

        return null;
    }

    public evaluateExpression(expression: string): string
    {
        // GNU make manual, section 6.2:
        // Leading whitespace characters are discarded from your
        // input before substitution of variable references and
        // function calls
        expression = expression.replace(/^\s+/, "");

        return this.evaluateExpressionNoTrim(expression);
    }

    public evaluateExpressionNoTrim(expression: string): string
    {
        var self = this;
        var res = 
            resolveString(
                expression, 
                (variableName: string) => self.getValue(variableName),
                (functionName: string, params: string[]) => self.invokeBuiltinFunction(functionName, params)
            );
        //console.error("Evaluated: '" + expression + "' => '" + res + "'");
        return res;
    }

    private invokeBuiltinFunction(
        functionNameExpression: string, 
        parameterExpressions: string[]
    ): string
    {
        let functionName = this.evaluateExpression(functionNameExpression);
        let parameters = parameterExpressions.map(p=>this.evaluateExpression(p));

        return "<built-in functions not defined yet>";
    }

    /*************************************************************************
     * Defining variables:
     * ===================
     * 
     *************************************************************************/
    public defineSimpleVariable(nameExpression: string, valueExpression: string): void
    {
        let name = this.evaluateExpression(nameExpression);

        this.setValueImmediate(name, valueExpression);

        log.info("DEFINE SIMPLE:      '" + name + "' = '" + valueExpression + "'");
        //console.log("VARIABLES:\n" + JSON.stringify(this.variables));
    }

    public defineRecursiveVariable(nameExpression: string, valueExpression: string): void
    {
        let name = this.evaluateExpression(nameExpression);

        this.setValueDeferred(name, valueExpression);

        log.info("DEFINE RECURSIVE:   '" + name + "' = '" + valueExpression+"'");
    }

    public defineConditionalVariable(nameExpression: string, valueExpression: string): void
    {
        let name = this.evaluateExpression(nameExpression);

        if (this.getValue(name)===null)
        {
            this.setValueDeferred(name, valueExpression);
        }

        log.info("DEFINE CONDITIONAL: '" + name + "' = '" + valueExpression+"'");
    }

    public defineShellVariable(nameExpression: string, shellCommandExpression: string): void
    {
        // GNU make manual, sect. 6.5:
        // This operator first evaluates the right-hand side, then passes
        // that result to the shell for execution. If the result of the
        // execution ends in a newline, that one newline is removed; all
        // other newlines are replaced by spaces. The resulting string is
        // then placed into the named recursively-expanded variable.

        let name = this.evaluateExpression(nameExpression);
        let shellCommand = this.evaluateExpression(shellCommandExpression);

        let value = this._execute(shellCommand);

        if (value.endsWith(os.EOL))
            value = value.substr(0, value.length - os.EOL.length);
        
        value = value.replace(os.EOL, " ")

        this.setValueImmediate(name, value);
        log.info("DEFINE SHELL:       '" + name + "' = '" + value + "'");
    }

    public defineAppendVariable(nameExpression: string, valueExpression: string): void
    {
        let name = this.evaluateExpression(nameExpression);

        let immediate = this.immediateValues[name];
        if (!!immediate)
        {
            let value = this.evaluateExpression(valueExpression);
            this.setValueImmediate(name, immediate + " " + value); // gmake manual, sect. 6.6: "...preceded by a single space"
            return;
        }

        let deferred = this.deferredValues[name] || "";
        this.setValueDeferred(name, deferred + " " + valueExpression); // gmake manual, sect. 6.6: "...preceded by a single space"
    }

    private _execute(shellCommand: string): string
    {
        var res = runShell(shellCommand, '.', "string");

        if (res.retCode != 0)
            exits.recipeExecutionError(res.retCode, shellCommand);
        
        return res.stdout;
    }
    
}
