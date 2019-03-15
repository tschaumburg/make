import { IFileRef } from "../file-ref";
import { IAction } from "../action";
import { IVirtualPath } from "../virtual-path";
import { IFilePlan } from "../file-plan";

export class FilePlan implements IFilePlan 
{
    constructor(
        public readonly file: IFileRef,
        public producedBy: IAction,
        public readonly vpath: string //IVirtualPath
    ) {};
}

