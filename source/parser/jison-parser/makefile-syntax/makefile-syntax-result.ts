import * as warn from '../../../make-warnings';
import { IParseResultBuilder } from "../../result";
import { IParseLocation } from "../../result/result-builder";
import { isArray } from "util";
import { stringify } from "querystring";
import * as log from '../../../makelog';

export function startRule(
    yy,
    jisonLocation,
    ruleDetails
): void
{
    let location: IParseLocation = getLocation(yy, jisonLocation);
    let builder: IParseResultBuilder = getResultBuilder(yy);
    let basedir: string = getBasedir(yy);

    log.error("ruleDetails: " + JSON.stringify(ruleDetails, null, 3));
    let targetNames0: string[] = getTargetNames(ruleDetails, "targets0");
    let targetNames1: string[] = getTargetNames(ruleDetails, "targets1");
    let targetNames2: string[] = getTargetNames(ruleDetails, "targets2");
    let targetNames3: string[] = getTargetNames(ruleDetails, "targets3");
    let inlinerecipe: string = getString(ruleDetails, "irecipe");

    builder.startRule(location, basedir, targetNames0, targetNames1, targetNames2, targetNames3, inlinerecipe);
}

export function recipeLine(
    yy,
    jisonLocation,
    line
): void
{
    let location: IParseLocation = getLocation(yy, jisonLocation);
    let builder: IParseResultBuilder = getResultBuilder(yy);

    // console.error("RECIPE3: " + line);
    builder.recipeLine(line);
}

export function include(
    yy,
    jisonLocation,
    filename
): void
{
    let location: IParseLocation = getLocation(yy, jisonLocation);
    let builder: IParseResultBuilder = getResultBuilder(yy);
    let _include: (makefilename: string) => void = yy.makefileParserContext.include;

    try 
    {
        let includedFile = filename; // builder.expandVariables(filename);
        _include(includedFile);
    }
    catch (reason)
    {
        warn.parseIncludeFailed(filename);
    }
}

export function defineVariable(yy, jisonLocation, vardef)
{
    let location: IParseLocation = getLocation(yy, jisonLocation);
    let builder: IParseResultBuilder = getResultBuilder(yy);
    let name = getString(vardef, "name");
    let kind = getString(vardef, "kind");
    let value = getString(vardef, "value");

    if (kind==='simple')
    {
        return builder.defineSimpleVariable(name, value);
    }
    
    if (kind==='recursive')
    {
        return builder.defineRecursiveVariable(name, value);
    }
    
    if (kind==='append')
    {
        return builder.defineAppendVariable(name, value);
    }
    
    if (kind==='conditional')
    {
        return builder.defineConditionalVariable(name, value);
    }
    
    if (kind==='shell')
    {
        return builder.defineShellVariable(name, value);
    }

    console.error   ("Unknown variable definition kind '" + kind + "' (supported kinds: 'simple', 'recursive', 'append', 'conditional' and 'shell')");
    
    // console.error("VARIABLE " + name + " = '" + value + "'");
    // this.variableManager.defineSimpleVariable(name, value);
}

export function end(yy)
{
    let builder: IParseResultBuilder = getResultBuilder(yy);
    builder.endRule();
}

function getLocation(yy, jisonLocation): IParseLocation
{
    return {
        filename: getMakefilename(yy),
        lineNo: getInt(jisonLocation, 'first_line'),
        colNo: getInt(jisonLocation, 'first_column')
    }
}

function getInt(obj, propname): number
{
    if (!obj)
        throw new Error("");
    
    if (obj[propname] == undefined)
        throw new Error("Makefile syntax error: property " + propname + " not defined on " + JSON.stringify(obj, null, 3));    

    if (typeof(obj[propname]) !== 'number')
        throw new Error("Makefile syntax error: property " + propname + " is not an integer");    

    if (!Number.isInteger(obj[propname]))
        throw new Error("Makefile syntax error: property " + propname + " is not an integer");    

    return (obj[propname] as number);
}

function getString(obj, propname): string
{
    if (!obj)
        throw new Error("");
    
    if (obj[propname] == undefined)
        throw new Error("Makefile syntax error: property " + propname + " not defined on " + JSON.stringify(obj, null, 3));    

    if (typeof(obj[propname]) !== 'string')
        throw new Error("Makefile syntax error: property " + propname + " is not a string");    

    return (obj[propname] as string);
}

function getResultBuilder(yy): IParseResultBuilder
{
    if (yy==null)
        throw new Error("Application error: jison variable yy is null");

    if (yy==undefined)
        throw new Error("Application error: jison variable yy is undefined");
        
    if (!yy.makefileParserContext)
        throw new Error("Application error: state variable yy.makefileParserContext is not set");
        
    if (!yy.makefileParserContext.resultBuilder)
        throw new Error("Application error: state variable yy.makefileParserContext.resultBuilder is not set");
        
    if (typeof(yy.makefileParserContext.resultBuilder)!=='object')
        throw new Error("Application error: state variable yy.makefileParserContext.resultBuilder is not an object");
        
    return (yy.makefileParserContext.resultBuilder as IParseResultBuilder);
}

function getBasedir(yy): string
{
    if (yy == null)
        throw new Error("Application error: jison variable yy is null");

    if (yy == undefined)
        throw new Error("Application error: jison variable yy is undefined");

    if (!yy.makefileParserContext)
        throw new Error("Application error: state variable yy.makefileParserContext is not set");

    if (!yy.makefileParserContext.basedir)
        throw new Error("Application error: state variable yy.makefileParserContext.basedir is not set");

    if (typeof (yy.makefileParserContext.basedir) !== 'string')
        throw new Error("Application error: state variable yy.makefileParserContext.basedir is not a string");

    return yy.makefileParserContext.basedir;
}

function getMakefilename(yy): string
{
    if (yy == null)
        throw new Error("Application error: jison variable yy is null");

    if (yy == undefined)
        throw new Error("Application error: jison variable yy is undefined");

    if (!yy.makefileParserContext)
        throw new Error("Application error: state variable yy.makefileParserContext is not set");

    if (!yy.makefileParserContext.makefilename)
        throw new Error("Application error: state variable yy.makefileParserContext.makefilename is not set (got " + JSON.stringify(yy) + ")");

    if (typeof (yy.makefileParserContext.makefilename) !== 'string')
        throw new Error("Application error: state variable yy.makefileParserContext.makefilename is not a string (got " + JSON.stringify(yy) + ")");

    return yy.makefileParserContext.makefilename;
}

/**
 * 
 * [ 
 *     { 
 *         targetName: "foo", 
 *         location: {line: 1, col: 1} 
 *     }, 
 *     { 
 *         targetName: "bar", 
 *         location: {line: 1, col: 5} 
 *     }
 * ]
 * @param targetlist 
 */
function getTargetNames(obj, propname): string[]
{
    if (!obj)
        throw new Error("");
    
    if (obj[propname] === undefined)
        throw new Error("Makefile syntax error: property " + propname + " not defined on " + JSON.stringify(obj, null, 3));    

    if (obj[propname] === null)
        return [];

    if (!isArray(obj[propname]))
        throw new Error("Makefile syntax error: expected array of targets")

    return (obj[propname] as any[]).map(t => getTargetName(t))
}

function getTargetName(target: any): string
{
    if (target==null)
        return null;

    if (typeof(target) !== 'object')
        throw new Error("Makefile syntax error: expected a target reference");

    if (!target.targetName)
        throw new Error("Makefile syntax error: expected a named target reference");

    if (typeof(target.targetName)!=='string')
        throw new Error("Makefile syntax error: expected a named target reference");

    return (target.targetName as string);
}