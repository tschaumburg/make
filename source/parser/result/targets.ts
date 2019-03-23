import { IParseLocation } from "./location";
import { IParseContext } from "./context";

export interface ITarget
{
    readonly location: IParseLocation; 
    readonly parseContext: IParseContext;
    readonly basedir: string;
    readonly relname: string;
    isPattern(): boolean;
}

export interface ITargetName extends ITarget
{
    fullname(): string;
}    

export interface ITargetPattern extends ITarget
{
    match(name: ITargetName): IStem;
    expand(stem: IStem): ITargetName;
}

export interface IStem
{
    basedir: string;
    stem: string;
}
