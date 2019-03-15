import { IVirtualPath } from '../virtual-path';

export class VirtualPath implements IVirtualPath
{
    constructor(
        //public readonly orgname: string,
        public readonly fullname: string
    ){}
}

