// import * as exits from '../../../return-codes';
// import * as log from '../../../makelog';

// export interface IVariableManager
// {
//     /**
//      * 
//      * @param name 
//      * @returns
//      * - If name refers to a previously defined simple variable: the fully expanded value
//      * of the variable. 
//      * - If name refers to a previously defined recursive value: null, 
//      * - If no variable of the name has been defined: an empty string.
//      */
//     getVariableValue(name: string): string;
//     invokeFunction(name: string, parameters: string[]): string;
//     defineSimpleVariable(name: string, value: string): void;
//     defineRecursiveVariable(name: string, value: string): void;
//     defineConditionalVariable(name: string, value: string): void;
//     defineShellVariable(name: string, value: string): any;
//     defineAppendVariable(name: string, value: string): any;
// }

// export function createVariablemanager(importedVariables: { [name: string]: string }): IVariableManager
// {
//     return new VariableManager(importedVariables);
// }

// class VariableManager implements IVariableManager
// {
//     private readonly simpleVariables: { [name: string]: string } = {};
//     private readonly recursiveVariables: { [name: string]: string } = {};

//     constructor(importedVariables: { [name: string]: string })
//     {
//         for (var n in importedVariables)
//             this.simpleVariables[n] = importedVariables[n];
//     };

// /*************************************************************************
//  * Getting the value of a variable:
//  * ================================
//  * 
//  *************************************************************************/
// public getVariableValue(name: string): string
//     {
//         //console.error("getting " + name);
//         let recursive = this.recursiveVariables[name];
//         if (!!recursive)
//         {
//             return this._expandRecursiveValue(recursive);
//         }

//         let simple = this.simpleVariables[name];
//         if (!!simple)
//         {
//             return simple;
//         }

//         return "";
//     }

//     // public expandVariables(value: string): string
//     // {
//     //     let orgValue = value;
//     //     var previousValues: string[] = [];
//     //     for (var n = 0; n < 100; n++)
//     //     {
//     //         var newValue = this.getVariableValue(value);

//     //         // Termination: when there is no more to expand
//     //         if (newValue === value)
//     //         {
//     //             //log.info("EXPAND '" + orgValue + "' => '" + value + "'");
//     //             return value;
//     //         }

//     //         // infinite recursion detection
//     //         if (previousValues.indexOf(newValue) >= 0)
//     //         {
//     //             throw new Error("Infinite recursion in variable expansion: " + previousValues.join(" => "));
//     //         }

//     //         value = newValue;
//     //         previousValues.push(value);
//     //     }
//     //     throw new Error("Variable expansion exceeded max recursion depth: " + previousValues.join(" => "));
//     // }

//     public invokeFunction(name: string, parameters: string[]): string
//     {
//         return "Function '" + name + "' not implemented";
//     }

// /*************************************************************************
//  * Defining variables:
//  * ===================
//  * 
//  *************************************************************************/
//     public defineSimpleVariable(name: string, value: string): void
//     {
//         name = this._expandRecursiveValue(name);
//         value = this._expandRecursiveValue(value);

//         log.info("DEFINE SIMPLE:      '" + name + "' = '" + value + "'");
//         this.simpleVariables[name] = value;

//         //console.log("VARIABLES:\n" + JSON.stringify(this.variables));
//     }

//     public defineRecursiveVariable(name: string, value: string): void
//     {
//         name = this._expandRecursiveValue(name);
//         value = this._expandRecursiveValue(value);

//         log.info("DEFINE RECURSIVE:   '" + name + "' = '" + value+"'");
//         this.recursiveVariables[name] = value;
//     }

//     public defineConditionalVariable(name: string, value: string): void
//     {
//         name = this._expandRecursiveValue(name);
//         value = this._expandRecursiveValue(value);

//         if (!!this.simpleVariables[name])
//             return;

//         if (!!this.recursiveVariables[name])
//             return;

//         log.info("DEFINE CONDITIONAL: '" + name + "' = '" + value+"'");
//         this.recursiveVariables[name] = value;
//     }

//     public defineShellVariable(name: string, value: string): any
//     {
//         name = this._expandRecursiveValue(name);
//         value = this._expandRecursiveValue(value);

//         value = this._execute(value);

//         log.info("DEFINE SHELL:       '" + name + "' = '" + value + "'");
//         return this.defineSimpleVariable(name, value);
//     }

//     public defineAppendVariable(name: string, value: string): void
//     {
//         name = this._expandRecursiveValue(name);
//         value = ' ' + value; // gmake manual, sect. 6.6: "...preceded by a single space"

//         if (!!this.simpleVariables[name])
//         {
//             this.simpleVariables[name] += this._expandRecursiveValue(value);
//             return;
//         }

//         if (!!this.recursiveVariables[name])
//         {
//             this.recursiveVariables[name] += value;
//             return;
//         }

//         this.recursiveVariables[name] = value;
//     }

//     private _expandRecursiveValue(value: string): string
//     {
//         var self = this;
//         return value.replace(/\$\((\w+)\)/g, function (match: string, name: string)
//         {
//             // match = $(varname)
//             if (match.length >= 4)
//             {
//                 let varname = match.slice(2, match.length - 1);
//                 let varvalue = self._expandRecursiveValue[varname];
//                 if (!varvalue)
//                 {
//                     return "";
//                 }
//                 return varvalue;
//             }

//            return "";
//         });
//     }

//     private _execute(command: string): string
//     {
//         return "<command execution not supported yet>";
//     }
// }
