import {IRule} from "./rule";
import { IJisonLocation } from "./location";

export interface IBuilder
{
    addRule(rule: IRule): void;
    addRecipeLine(location: IJisonLocation, recipeLine: string): void;
    defineSimpleVariable(location: IJisonLocation, name: string, value: string): void;
    defineRecursiveVariable(location: IJisonLocation, name: string, value: string): void;
    defineRecursiveVariableIf(location: IJisonLocation, name: string, value: string): void;
    expandVariables(src: string): string;
    end(): void;
}

class Builder implements IBuilder
{
    private readonly _rules: IRule[] = [];
    private _currentRule: IRule = null;
    constructor(){}

    addRule(rule: IRule): void 
    {
        this._currentRule = rule;
        this._rules.push(rule);
    }    
    
    addRecipeLine(location: IJisonLocation, recipeLine: string): void 
    {
        if(!this._currentRule)
            throw new Error("Recipe specified outside rule context");

        this._currentRule.recipeLines.push(recipeLine);
    }
    
    defineSimpleVariable(location: IJisonLocation, name: string, value: string): void
    {
        throw new Error("Method not implemented.");
    }
    
    defineRecursiveVariable(location: IJisonLocation, name: string, value: string): void
    {
        throw new Error("Method not implemented.");
    }
    
    defineRecursiveVariableIf(location: IJisonLocation, name: string, value: string): void
    {
        throw new Error("Method not implemented.");
    }

    expandVariables(src: string): string
    {
        throw new Error("Method not implemented.");
    }
    
    end(): void {
        throw new Error("Method not implemented.");
    }


}

export function builder(): IBuilder
{
    return new Builder();
}