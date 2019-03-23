import * as warn from '../../../make-warnings';
import { isArray } from "util";
import * as log from '../../../makelog';
import * as errors from "../../../make-errors";
import { IParseEvents } from './parse-events';
import { IParseLocation } from '../../result';
export function sendExplicitRule(
    yy: any,
    jisonLocation: any,
    targets: string,
    prerequisites: string,
    orderOnlies: string,
    irecipe: string,
    isTerminal: boolean
): void
{

    if (!targets || targets.trim().length == 0)
    {
       errors.ruleMissingTarget();
    }

    let location: IParseLocation = getLocation(yy, jisonLocation);
    let builder: IParseEvents = getResultBuilder(yy);
    let basedir: string = getBasedir(yy);

    builder.explicitRule(
        location, 
        basedir, 
        targets,
        prerequisites,
        orderOnlies,
        irecipe,
        isTerminal
            );
}

export function sendImplicitRule(
    yy: any,
    jisonLocation: any,
    targetPatterns: string,
    prerequisites: string,
    orderOnlies: string,
    irecipe: string,
    isTerminal: boolean
): void
{
    if (!targetPatterns || targetPatterns.trim().length == 0)
    {
       errors.ruleMissingTarget();
    }

    let location: IParseLocation = getLocation(yy, jisonLocation);
    let builder: IParseEvents = getResultBuilder(yy);
    let basedir: string = getBasedir(yy);

    builder.implicitRule(
        location, 
        basedir, 
        targetPatterns,
        prerequisites,
        orderOnlies,
        irecipe,
        isTerminal
        );
}

export function sendRecipeLine(
    yy: any,
    jisonLocation: any,
    line: string
): void
{
    let location: IParseLocation = getLocation(yy, jisonLocation);
    let builder: IParseEvents = getResultBuilder(yy);

    // console.error("RECIPE3: " + line);
    builder.recipeLine(line);
}

export function sendInclude(
    yy: any,
    jisonLocation: any,
    filename: string
): void
{
    let location: IParseLocation = getLocation(yy, jisonLocation);
    let builder: IParseEvents = getResultBuilder(yy);
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

export function sendDefineVariable(yy: any, jisonLocation: any, vardef: any)
{
    let location: IParseLocation = getLocation(yy, jisonLocation);
    let builder: IParseEvents = getResultBuilder(yy);
    let name = getString(vardef, "name");
    let kind = getString(vardef, "kind");
    let value = getString(vardef, "value");

    if (kind==='simple')
    {
        return builder.defineSimpleVariable(name, value);
    }
    
    if (kind==='recursive')
    {
        //console.error("Recursive " + name + " = " + value);
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

    //console.error   ("Unknown variable definition kind '" + kind + "' (supported kinds: 'simple', 'recursive', 'append', 'conditional' and 'shell')");
    
    // console.error("VARIABLE " + name + " = '" + value + "'");
    // this.variableManager.defineSimpleVariable(name, value);
}

export function end(yy: any)
{
    let builder: IParseEvents = getResultBuilder(yy);
    builder.endRule();
}

function getLocation(yy: any, jisonLocation: any): IParseLocation
{
    return {
        filename: getMakefilename(yy),
        fromLine: getInt(jisonLocation, 'first_line'),
        fromCol: getInt(jisonLocation, 'first_column'),
        toLine: getInt(jisonLocation, 'last_line'),
        toCol: getInt(jisonLocation, 'last_column')
    }
}

function getInt(obj: any, propname: string): number
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

function getString(obj: any, propname: string): string
{
    if (!obj)
        throw new Error("");
    
    if (obj[propname] == undefined)
        throw new Error("Makefile syntax error: property " + propname + " not defined on " + JSON.stringify(obj, null, 3));    

    if (typeof(obj[propname]) !== 'string')
        throw new Error("Makefile syntax error: property " + propname + " is not a string");    

    return (obj[propname] as string);
}

function getStringOpt(obj: any, propname: string): string
{
    if (!obj)
        throw new Error("");
    
    if (!obj[propname])
        return null;

    if (typeof(obj[propname]) !== 'string')
        throw new Error("Makefile syntax error: property " + propname + " is not a string");    

    return (obj[propname] as string);
}

function getResultBuilder(yy: any): IParseEvents
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
        
    return (yy.makefileParserContext.resultBuilder as IParseEvents);
}

function getBasedir(yy: any): string
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

function getMakefilename(yy: any): string
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
function getTargetNames(obj: any, propname: string): string[]
{
    if (!obj)
        throw new Error("");
    
    if (obj[propname] === undefined)
        throw new Error("Makefile syntax error: property " + propname + " not defined on " + JSON.stringify(obj, null, 3));    

    if (obj[propname] === null)
        return [];

    if (!isArray(obj[propname]))
        throw new Error("Makefile syntax error: expected list of target names")

    return (obj[propname] as string[]);//.map(t => getTargetName(t))
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