import * as exits from '../../../return-codes';
import * as log from '../../../makelog';
//import { getValue } from '../../jison-parser/variables';
import { include } from '../../jison-parser/makefile-syntax/makefile-syntax-result';

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
    getVariableValue(name: string): string;
    invokeFunction(name: string, parameters: string[]): string;
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
    resolveVariableReferences(src: string): string;
}

export function createVariablemanager(importedVariables: { [name: string]: string }): IVariableManager
{
    return new VariableManager(importedVariables);
}

class VariableManager implements IVariableManager
{
    private readonly simpleVariables: { [name: string]: string } = {};
    private readonly recursiveVariables: { [name: string]: string } = {};

    constructor(importedVariables: { [name: string]: string })
    {
        for (var n in importedVariables)
            this.simpleVariables[n] = importedVariables[n];

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
            this.recursiveVariables[name] = '$(' + name + ')';
        }
        else
        {
            this.recursiveVariables[name] = '$' + name;
        }
    }

/*************************************************************************
 * Getting the value of a variable:
 * ================================
 * 
 *************************************************************************/
public getVariableValue(name: string): string
    {
        //console.error("getting " + name);
        let recursive = this.recursiveVariables[name];
        if (!!recursive)
        {
            return this._expandRecursiveValue(recursive);
        }

        let simple = this.simpleVariables[name];
        if (!!simple)
        {
            return simple;
        }

        return "";
    }

    public resolveVariableReferences(value: string): string
    {
        if (value.indexOf('$') < 0)
        {
            return value;
        }
        var self = this;
        var lexer = new StringLexer(value);
        var res= expandString(lexer, (name: string) => self.getVariableValue(name));
        log.info("EXPAND '" + value + "' => '" + res + "'");
        return res;
        // let orgValue = value;
        // var previousValues: string[] = [];
        // for (var n = 0; n < 100; n++)
        // {
        //     var newValue = this.getVariableValue(value);

        //     // Termination: when there is no more to expand
        //     if (newValue === value)
        //     {
        //         //log.info("EXPAND '" + orgValue + "' => '" + value + "'");
        //         return value;
        //     }

        //     // infinite recursion detection
        //     if (previousValues.indexOf(newValue) >= 0)
        //     {
        //         throw new Error("Infinite recursion in variable expansion: " + previousValues.join(" => "));
        //     }

        //     value = newValue;
        //     previousValues.push(value);
        // }
        // throw new Error("Variable expansion exceeded max recursion depth: " + previousValues.join(" => "));
    }

    public invokeFunction(name: string, parameters: string[]): string
    {
        return "Function '" + name + "' not implemented";
    }

/*************************************************************************
 * Defining variables:
 * ===================
 * 
 *************************************************************************/
    public defineSimpleVariable(name: string, value: string): void
    {
        name = this._expandRecursiveValue(name);
        value = this._expandRecursiveValue(value);

        log.info("DEFINE SIMPLE:      '" + name + "' = '" + value + "'");
        this.simpleVariables[name] = value;

        //console.log("VARIABLES:\n" + JSON.stringify(this.variables));
    }

    public defineRecursiveVariable(name: string, value: string): void
    {
        name = this._expandRecursiveValue(name);
        value = this._expandRecursiveValue(value);

        log.info("DEFINE RECURSIVE:   '" + name + "' = '" + value+"'");
        this.recursiveVariables[name] = value;
    }

    public defineConditionalVariable(name: string, value: string): void
    {
        name = this._expandRecursiveValue(name);
        value = this._expandRecursiveValue(value);

        if (!!this.simpleVariables[name])
            return;

        if (!!this.recursiveVariables[name])
            return;

        log.info("DEFINE CONDITIONAL: '" + name + "' = '" + value+"'");
        this.recursiveVariables[name] = value;
    }

    public defineShellVariable(name: string, value: string): any
    {
        name = this._expandRecursiveValue(name);
        value = this._expandRecursiveValue(value);

        value = this._execute(value);

        log.info("DEFINE SHELL:       '" + name + "' = '" + value + "'");
        return this.defineSimpleVariable(name, value);
    }

    public defineAppendVariable(name: string, value: string): void
    {
        name = this._expandRecursiveValue(name);
        value = ' ' + value; // gmake manual, sect. 6.6: "...preceded by a single space"

        if (!!this.simpleVariables[name])
        {
            this.simpleVariables[name] += this._expandRecursiveValue(value);
            return;
        }

        if (!!this.recursiveVariables[name])
        {
            this.recursiveVariables[name] += value;
            return;
        }

        this.recursiveVariables[name] = value;
    }

    private _expandRecursiveValue(value: string): string
    {
        var self = this;
        return value.replace(/\$\((\w+)\)/g, function (match: string, name: string)
        {
            // match = $(varname)
            if (match.length >= 4)
            {
                let varname = match.slice(2, match.length - 1);
                let varvalue = self._expandRecursiveValue[varname];
                if (!varvalue)
                {
                    return "";
                }
                return varvalue;
            }

           return "";
        });
    }

    private _execute(command: string): string
    {
        return "<command execution not supported yet>";
    }
}

const TOKENS = "${}()";
class StringLexer
{
    private next: number = 0;
    constructor(readonly src: string)
    {}
    hasMore(...terminators: string[]): boolean
    {
        // EOF:
        if (this.next >= this.src.length)
            return false;
            
        terminators = terminators || [];
        var nextChar = this.src[this.next];

        return (terminators.indexOf(nextChar) < 0);
    }

    isToken(s: string): boolean
    {
        return (TOKENS.indexOf(s) >= 0);
    }
    nextToken(): string
    {
        if (!this.src)
            return null;
            
        // EOF:
        if (this.next >= this.src.length)
            return null;
            
        var nextChar = this.src[this.next];

        if (this.isToken(nextChar))
        {
            this.next++;
            return nextChar
        }

        var textStart = this.next;
        for (var nextToken = textStart+1; nextToken<this.src.length; nextToken++)
        {
            if (this.isToken(this.src[nextToken]))
            {
                this.next = nextToken;
                return this.src.substring(textStart, nextToken);
            }
        }

        this.next = this.src.length;
        return this.src.substring(textStart, this.next);
    }
    nextChar(): string
    {
        if (!this.src)
            return null;
            
        // EOF:
        if (this.next >= this.src.length)
            return null;
            
        return this.src[this.next++];
    }
}

var _tracelevel = 0
function _trace(msg: string): void
{
    var indent = "                                             ".substring(0, _tracelevel*3);
    console.error(indent + msg);
}

function _traceenter(msg: string): void
{
    _trace(msg);
    _tracelevel++;
}

function _traceleave(msg: string): void
{
    _tracelevel--;
    _trace(msg);
}

/**
 * 'xxxx${var1}xxxx{var2}xxxx...'
 * @param src 
 * 
 */
function expandString(src: StringLexer, getValue: (string) => string, ...terminators: string[]): string
{
    //_traceenter("Resolving '" + src.src + "'...");
    var res = "";
    while (src.hasMore(...terminators))
    {
        var token = src.nextToken();

        if (token==='$')
        {
            res += expandVariable(src, getValue);
        }
        else
        {
            res += token;
        }
    }

    return res;
}
/**
 * 'abc$(myvar)def'
 *      ^
 * next token
 * @param src 'abc$(myvar)def'
 * @param getValue 
 */
function expandVariable(src: StringLexer, getValue: (string) => string): string
{
    var token = src.nextChar();

    if (token === '$')
    {
        return '$';
    }

    if (token === '{')
    {
        var name = expandString(src, getValue, '}', ')');
        var terminator = src.nextToken();

        if (terminator === ')')
        {
            // warn about mismatch?
        }
        else if (terminator !== '}')
        {
            // error
        }

        return getValue(name);
    }

    if (token === '(')
    {
        var name = expandString(src, getValue, ')', '}');
        var terminator = src.nextToken();

        if (terminator === '}')
        {
            // warn about mismatch?
        }
        else if (terminator !== ')')
        {
            // error
        }

        return getValue(name);
    }

    return getValue(token);
}
// import * as exits from '../../../return-codes';
// import * as log from '../../../makelog';

// export class VariableManager
// {
//     public readonly variables: { [name: string]: string } = {};

//     constructor(importedVariables: { [name: string]: string })
//     {
//         for (var n in importedVariables)
//             this.variables[n] = importedVariables[n];
//     };

//     private _expandVariable(value: string): string
//     {
//         var self = this;
//         return value.replace(/\$\((\w+)\)/g, function (match: string, name: string)
//         {
//             // match = $(varname)
//             if (match.length >= 4)
//             {
//                 let varname = match.slice(2, match.length - 1);
//                 let varvalue = self.variables[varname];
//                 if (varvalue != null && varvalue != undefined)
//                 {
//                     log.info(
//                         "REPLACING '" + JSON.stringify(varname) + "' => '" +
//                         varvalue + "'");
//                     return varvalue;
//                 }
//             }

//             exits.parseUndefinedVariable(match);
//            // return "";
//         });
//     }

//     public expandVariables(value: string): string
//     {
//         let orgValue = value;
//         var previousValues: string[] = [];
//         for (var n = 0; n < 100; n++)
//         {
//             var newValue = this._expandVariable(value);

//             // Termination: when there is no more to expand
//             if (newValue === value)
//             {
//                 //log.info("EXPAND '" + orgValue + "' => '" + value + "'");
//                 return value;
//             }

//             // infinite recursion detection
//             if (previousValues.indexOf(newValue) >= 0)
//             {
//                 throw new Error("Infinite recursion in variable expansion: " + previousValues.join(" => "));
//             }

//             value = newValue;
//             previousValues.push(value);
//         }
//         throw new Error("Variable expansion exceeded max recursion depth: " + previousValues.join(" => "));
//     }

//     public defineSimpleVariable(name: string, value: string): void
//     {
//         name = this.expandVariables(name.trim());
//         value = this.expandVariables(value);

//         log.info("DEFINE: '" + name + "' = '" + value + "'");
//         this.variables[name] = value;

//         //console.log("VARIABLES:\n" + JSON.stringify(this.variables));
//     }

//     public defineRecursiveVariable(name: string, value: string): void
//     {
//         log.info("DEFINE RECURSIVE: '" + name + "' = '" + value+"'");
//         name = this.expandVariables(name.trim());
//         this.variables[name] = value;
//     }

//     public defineConditionalVariable(name: string, value: string): void
//     {
//         if (this.variables[name] == null)
//         {
//             log.info("DEFINE: '" + name + " = '" + value+"'");
//             return this.defineRecursiveVariable(name, value);
//         }
//     }

//     public defineShellVariable(name: string, value: string): any
//     {
//         return this.defineSimpleVariable(name, value);
//     }

//     public defineAppendVariable(name: string, value: string): any
//     {
//         return this.defineSimpleVariable(name, value);
//     }
// }
