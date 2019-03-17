import * as fs from 'fs';
import { IVirtualPath } from '../virtual-path';
import { IFileRef } from '../file-ref';

export class FileRef implements IFileRef
{
    constructor(
        public readonly orgname: string,
        public readonly fullname: string,
        private readonly isExplicitlyMentioned: boolean,
        private readonly isDotIntermediate: boolean,
        private readonly isDotSecondary: boolean,
        private readonly isDotPrecious: boolean
    ){}

    public isIntermediate(): boolean
    {
        if (this.isDotIntermediate)
            return true;

        if (this.isExplicitlyMentioned == false)
            return true;
        
        return false;
    }

    public isSecondary(): boolean
    {
        if (this.isDotSecondary)
            return true;

        return false;
    }

    public isPrecious(): boolean
    {
        if (this.isDotPrecious)
            return true;

        return false;
    }

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
