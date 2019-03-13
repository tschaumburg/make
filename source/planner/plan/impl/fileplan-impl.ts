import { IFilePlan, IAction, IFileRef, IVirtualPath } from "../plan";

export class FilePlan implements IFilePlan 
{
    constructor(
        public readonly file: IFileRef,
        public producedBy: IAction,
        public readonly vpath: IVirtualPath
    ) {};
}

