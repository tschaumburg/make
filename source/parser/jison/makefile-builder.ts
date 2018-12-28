
// export function targetList(location: IJisonLocation, src: string): TargetName[]
// {
//     if (!src)
//         return [];

//     src = src.replace(/[\s|;:]+/, " ").trim();

//     return src.split(" ").filter(s => !!s).map(s => new TargetName(location, s));
// }

// export function parseRuleStart(location: IJisonLocation, src: string): {t0: TargetName[], t1: TargetName[]}
// {
//     if (!src)
//         return {t0: null, t1: null};

//     var p = src.split(":", 2);
//     p.push("");

//     return { t0: targetList(location, p[0]), t1: targetList(location, p[1])}
// }
