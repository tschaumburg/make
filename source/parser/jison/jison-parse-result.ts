// import { IParseResult } from "../parse-result";

// export class JisonParseResult //implements IParseResult
// {
//     public addExplicitRule(
//         targets: NameToken[], 
//         prereqs: NameToken[],
//         orderOnlyPrereqs: NameToken[],
//         recipeLine: string
//     ): void
//     {}
//     public addExplicitPatternRule(
//         targets: NameToken[], 
//         targetPatterns: NameToken[], 
//         prereqPatterns: NameToken[],
//         orderOnlyPrereqs: NameToken[],
//         recipeLine: string
//     ): void
//     {}
//     public addImplicitPatternRule(
//         targetPatterns: NameToken[], 
//         prereqPatterns: NameToken[],
//         orderOnlyPrereqs: NameToken[],
//         recipeLine: string
//     ): void
//     {}
// }

// export class NameToken
// {
//     constructor(
//         public readonly identifier: string,
//         public readonly filename: string,
//         public readonly lineNo: number,
//         public readonly colNo: number
//     )
//     {}
// }