import { Target } from "./target";
import { ITarget } from "../target";

export function createManager(): ITargetManager
{
    return new TargetManager();
}

export interface ITargetManager
{
    defaultTarget: ITarget;
    findTarget(name: string): ITarget;
    addTarget(targetName: string, targetFullname: string, isOrderOnly: boolean): ITarget
}

class TargetManager implements ITargetManager
{
    private readonly targets: { [fullname: string]: Target } = {};
    public defaultTarget: ITarget = null;
    public findTarget(fullname: string): ITarget 
    {
        return this.targets[fullname];
    }


    public addTarget(targetName: string, targetFullname: string, isOrderOnly: boolean): Target
    {
        var target = this.targets[targetFullname];

        if (!target)
        {
            //console.log("CREATING: " + fullname);
            target = new Target(targetName, targetFullname, isOrderOnly);
            this.targets[targetFullname] = target;
        }

        // Default target:
        // ===============
        // If this is the first target, mark it as the default
        // for this makefile
        if (!this.defaultTarget)
        {
            if (!target.name.startsWith(".") && !target.name.startsWith("@"))
            {
                this.defaultTarget = target;  
            }
        }

            return target;
    }
}
