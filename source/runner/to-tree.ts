//import * as asciiTree from "ascii-tree";

// export function plan(makefile: IRuleManager, targets: string[]): IPlan
// {
//     let engine = new Engine(makefile);
//     return engine.updateTargets(targets);
// }

// export function toTree(makefile: IRuleManager, targetName: string): string
// {
//     let target: ITarget = makefile.findTarget(path.resolve(".", targetName));
//     if (!target)
//     {
//         return ("Target \"" + targetName + "\" does not exist, and no rule specifies how to create it");
//     }

//     return asciiTree.generate( _toTree(target, "#"));
// }

// function _toTree(target: ITarget, prefix: string): string
// {
//     let res =
//         prefix + target.toString() ;

//     if (!target.producedBy())
//         return res;

//     res += " (" + target.producedBy().recipe.steps.join(" && ") + ")";

//     prefix += "#";

//     for (let child of target.producedBy().prerequities)
//     {
//         res = res + "\r\n" + _toTree(child, prefix);
//     }

//     return res;
// }
