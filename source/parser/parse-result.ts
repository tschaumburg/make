import * as exits from '../return-codes';
import * as path from 'path';
import * as log from '../makelog';
import { IRuleManager, createManager } from '../rules';
import { ITarget } from '../rules';

export interface IParseResult
{
    readonly rules: IRuleManager;
    readonly defaultTarget: ITarget;
    readonly makefileNames: string[];
}

export class ParseResult implements IParseResult
{
    public readonly rules: IRuleManager;
    public readonly variables: { [name: string]: string } = {};
    public readonly makefileNames: string[] = [];
    public get defaultTarget(): ITarget { return this.rules.defaultTarget; }
    public clearDefaultTarget(): void { this.rules.clearDefaultTarget(); }

    constructor()
    {
        this.rules = createManager();
    };

}

