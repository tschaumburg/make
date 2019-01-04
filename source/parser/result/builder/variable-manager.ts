import * as exits from '../../../return-codes';
import * as log from '../../../makelog';

export class VariableManager
{
    public readonly variables: { [name: string]: string } = {};

    constructor(importedVariables: { [name: string]: string })
    {
        for (var n in importedVariables)
            this.variables[n] = importedVariables[n];
    };

    private _expandVariable(value: string): string
    {
        var self = this;
        return value.replace(/\$\((\w+)\)/g, function (match: string, name: string)
        {
            // match = $(varname)
            if (match.length >= 4)
            {
                let varname = match.slice(2, match.length - 1);
                let varvalue = self.variables[varname];
                if (varvalue != null && varvalue != undefined)
                {
                    log.info(
                        "REPLACING '" + JSON.stringify(varname) + "' => '" +
                        varvalue + "'");
                    return varvalue;
                }
            }

            exits.parseUndefinedVariable(match);
           // return "";
        });
    }

    public expandVariables(value: string): string
    {
        let orgValue = value;
        var previousValues: string[] = [];
        for (var n = 0; n < 100; n++)
        {
            var newValue = this._expandVariable(value);

            // Termination: when there is no more to expand
            if (newValue === value)
            {
                //log.info("EXPAND '" + orgValue + "' => '" + value + "'");
                return value;
            }

            // infinite recursion detection
            if (previousValues.indexOf(newValue) >= 0)
            {
                throw new Error("Infinite recursion in variable expansion: " + previousValues.join(" => "));
            }

            value = newValue;
            previousValues.push(value);
        }
        throw new Error("Variable expansion exceeded max recursion depth: " + previousValues.join(" => "));
    }

    public defineSimpleVariable(name: string, value: string): void
    {
        name = this.expandVariables(name.trim());
        value = this.expandVariables(value);

        log.info("DEFINE: '" + name + "' = '" + value + "'");
        this.variables[name] = value;

        //console.log("VARIABLES:\n" + JSON.stringify(this.variables));
    }

    public defineRecursiveVariable(name: string, value: string): void
    {
        log.info("DEFINE RECURSIVE: '" + name + "' = '" + value+"'");
        name = this.expandVariables(name.trim());
        this.variables[name] = value;
    }

    public defineConditionalVariable(name: string, value: string): void
    {
        if (this.variables[name] == null)
        {
            log.info("DEFINE: '" + name + " = '" + value+"'");
            return this.defineRecursiveVariable(name, value);
        }
    }

    public defineShellVariable(name: string, value: string): any
    {
        return this.defineSimpleVariable(name, value);
    }

    public defineAppendVariable(name: string, value: string): any
    {
        return this.defineSimpleVariable(name, value);
    }
}
