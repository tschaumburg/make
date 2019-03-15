import { IFilePlan } from "./file-plan";

export interface IAction {
    readonly prerequisites: IFilePlan[];
    readonly orderOnly: IFilePlan[];
    readonly recipe: string[];
}
