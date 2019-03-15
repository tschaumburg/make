import { IVariableManager } from "../../variables";
import { IFilePlan } from "./file-plan";

export interface IPlan 
{
    readonly goals: IFilePlan[];
    readonly basedir: string;
    readonly variablemanager: IVariableManager;
    makefileNames: string[]; // fullnames!
    // goals: IFileRef[];
    getFilePlan(fullname: string): IFilePlan;
}

