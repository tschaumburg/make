// import { IPreprocessorContext } from "./preprocessor-context";

// /*************************************************************************
//  * Defining variables:
//  * ===================
//  * 
//  *************************************************************************/
// export function defineSimpleVariable(
//     yy,
//     jisonLocation,
//     name: string,
//     value: string
// ): void
// {
//     console.error("SIMPLE: '" + name + "' = '" + value + "'");
//     let context = getContext(yy);

//     context.variableManager.defineSimpleVariable(name, value);
// }

// export function defineRecursiveVariable(
//     yy,
//     jisonLocation,
//     name: string,
//     value: string
// ): void
// {
//     console.error("RECURSIVE: '" + name + "' = '" + value + "'");
//     let context = getContext(yy);

//     context.variableManager.defineRecursiveVariable(name, value);
// }

// export function defineAppendVariable(
//     yy,
//     jisonLocation,
//     name: string,
//     value: string
// ): void
// {
//     console.error("APPEND:      '" + name + "' = '" + value + "'");
//     let context = getContext(yy);

//     context.variableManager.defineAppendVariable(name, value);
// }

// export function defineShellVariable(
//     yy,
//     jisonLocation,
//     name: string,
//     value: string
// ): void
// {
//     console.error("SHELL:       '" + name + "' = '" + value + "'");
//     let context = getContext(yy);

//     context.variableManager.defineShellVariable(name, value);
// }

// /*************************************************************************
//  * Resolving a variable reference:
//  * ===============================
//  * 
//  *************************************************************************/
// export function getVariableValue(
//     yy,
//     jisonLocation,
//     name: string
// ): string
// {
//     let context = getContext(yy);

//     return context.variableManager.getVariableValue(name);
// }

// /*************************************************************************
//  * Calling a predefined make function:
//  * ===================================
//  * 
//  *************************************************************************/
// export function invokeFunction(
//     yy,
//     jisonLocation,
//     name: string,
//     parameters: string[]
// ): string
// {
//     let context = getContext(yy);

//     return context.variableManager.invokeFunction(name, parameters);
// }

// function getContext(yy: any): IPreprocessorContext
// {
//     if (!yy)
//         throw new Error("Application error: Missing preprocessor context");

//     if (!yy.preprocessorContext)
//         throw new Error("Application error: Missing preprocessor context");

//     let res = yy.preprocessorContext as IPreprocessorContext;

//     if (!res.makefilename)
//         throw new Error("Application error: Missing makefile name in preprocessor context");

//     if (!res.basedir)
//         throw new Error("Application error: Missing basedir in preprocessor context");

//     if (!res.variableManager)
//         throw new Error("Application error: Missing variable manager in preprocessor context");
        
//     return res;
// }