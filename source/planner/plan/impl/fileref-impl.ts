import * as fs from 'fs';
import { IFileRef, IVirtualPath } from "../plan";

export class VirtualPath implements IVirtualPath
{
    constructor(
        //public readonly orgname: string,
        public readonly fullname: string
    ){}
}

export class FileRef implements IFileRef
{
    constructor(
        public readonly orgname: string,
        public readonly fullname: string
    ){}
    public timestamp(): number
    {
        return timestamp(this.fullname);
    }
}

function timestamp(fullName: string): number
{
    let res = -1;

    if (!fullName)
    {
        res = 0;
    }
    else if (!fs.existsSync(fullName))
    {
        //if (fullName.endsWith(".h"))
        //    throw new Error(fullName + " missing");

        res = 0;
    }
    else 
    {
        res = fs.statSync(fullName).mtimeMs;;
    }

    return res;
}
