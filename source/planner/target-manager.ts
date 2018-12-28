// import { Target, BaseRule, TargetName } from "../parser/result";

// export function createManager(): ITargetManager
// {
//     return new TargetManager();
// }

// export interface ITargetManager
// {
//     defaultTarget: ITarget;
//     findTarget(name: string): ITarget;
//     addTarget(targetName: string, targetFullname: string, isOrderOnly: boolean): ITarget
// }

// class TargetNode
// {
//     target: Target;
//     producedBy: BaseRule[];
// }

// class TargetManager implements ITargetManager
// {
//     private readonly targets: { [fullname: string]: TargetNode } = {};
//     public defaultTarget: TargetNode = null;
//     public findTarget(fullname: string): TargetNode 
//     {
//         return this.targets[fullname];
//     }


//     public addTarget(target: TargetName): Target
//     {
//         var node = this.targets[target.fullname];

//         if (!node)
//         {
//             //console.log("CREATING: " + fullname);
//             target = new Target(targetName, targetFullname, isOrderOnly);
//             this.targets[targetFullname] = target;
//         }

//         // Default target:
//         // ===============
//         // If this is the first target, mark it as the default
//         // for this makefile
//         if (!this.defaultTarget)
//         {
//             if (!target.name.startsWith(".") && !target.name.startsWith("@"))
//             {
//                 this.defaultTarget = target;  
//             }
//         }

//             return target;
//     }
// }
