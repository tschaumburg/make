import { IAction } from "../action";
import { IFilePlan } from "../file-plan";

export class Action implements IAction
{
    constructor(
        public readonly prerequisites: IFilePlan[],
        public readonly orderOnly: IFilePlan[],
        public readonly recipe: string[]
    ){}
}
