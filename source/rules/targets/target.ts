import * as path from 'path';
import * as fs from 'fs';
import * as exits from '../../return-codes';
import { IRule, ITarget } from '..';

export class Target implements ITarget
{
    constructor(
        public readonly name: string,
        public readonly fullName: string,
        public readonly isOrderOnly: boolean
    )
    {
    }

    private _producedBy: IRule = null;

    setProducedBy(currentRule: IRule): void
    {
        if (!!this._producedBy)
        {
            exits.applicationErrorRedefiningTarget(this.name);
        }
        
        this._producedBy = currentRule;
    }

    producedBy(): IRule
    {
        return this._producedBy;
    }

    public toString(): string
    {
        return path.relative(".", this.fullName);
    }

    public timestamp(): number
    {
        let res = -1;

        if (!this.fullName)
        {
            res = 0;
        }
        else if (!fs.existsSync(this.fullName))
        {
            //if (fullName.endsWith(".h"))
            //    throw new Error(fullName + " missing");

            res = 0;
        }
        else 
        {
            res = fs.statSync(this.fullName).mtimeMs;;
        }

        return res;
    }
}
