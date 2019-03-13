import * as path from "path";
import { Target } from "./target";
import { IParseContext, ITargetPattern, ITargetName, IStem } from "../../../parse-result";
import { IParseLocation } from "../../parse-location";
import { TargetName } from "./target-name";

export class TargetPattern extends Target implements ITargetPattern
{
    public readonly patternDir: string;
    public readonly patternPrefix: string;
    public readonly patternPostfix: string;
    constructor(
        location: IParseLocation, 
        parseContext: IParseContext, 
        basedir: string,
        prefix: string,
        postfix: string
    )
    {
        super(location, parseContext, basedir, prefix + "%" + postfix); 
        this.patternDir = path.dirname(prefix);
        this.patternPrefix = path.basename(prefix);
        this.patternPostfix = postfix;
    }

    public isPattern(): boolean
    {
        return true;
    }

    public match(targetName: ITargetName): IStem
    {
        // Match (pattern does not contain a slash):
        // -----------------------------------------
        // When the pattern does not contain a slash (and it usually does
        // not) directory names in the file names are removed from the file name
        // before it is compared with the pattern prefix and suffix.
        //
        // After matching the file name to the pattern, the directory
        // name, along with the slash that ends it, are added on to the 
        // file names generated from the pattern and the
        // file name. 
        //
        // Example:
        //    Filename: 'src/eat
        //    Pattern:  ‘e%t’ 
        //             |
        //             V
        //    Stem:     ‘src/a’
        if (this.patternDir !== null && this.patternDir.length > 0)
        {
            let name = targetName.relname;
            let filenameDir = path.dirname(name);
            let filenameBase = path.basename(name);

            let stemBase = this.baseMatch(filenameBase);
            if (stemBase === null)
                return null;

            let stemName = path.join(filenameDir, stemBase);
            return { basedir: targetName.basedir, stem: stemName}
        }

        // Match (pattern contains a slash):
        // ---------------------------------
        // The pattern matches a file name only if the file name starts with
        // the prefix and ends with the suffix, without overlap.
        //
        // The text between the prefix and the suffix is called the stem.
        //
        // Example:
        //    Pattern ‘%.o’
        //    Filename test.o
        //             |
        //             V
        //    Stem: 'test’.
        let name = targetName.relname;
        let stemName = this.baseMatch(name);
        return { basedir: targetName.basedir, stem: stemName}
    }

    private baseMatch(basename: string): string
    {
        let stemLength = basename.length - (this.patternPrefix.length + this.patternPostfix.length);
        if (stemLength <= 0)
            return null;

        if (!basename.startsWith(this.patternPrefix))
            return null;

        if (!basename.endsWith(this.patternPostfix))
            return null;

        return basename.substr(this.patternPrefix.length, stemLength);
    }
    
    public expand(stem: IStem): ITargetName
    {
        // Expand (pattern does not contain a slash):
        // ------------------------------------------
        // When prerequisites are turned into file names, the directories from
        // the stem are added at the front, while the rest of the stem is substituted
        // for the ‘%’.
        //
        // Example (expand):
        //    Stem:     ‘src/a’
        //    Pattern:  ‘c%r’
        //    Filename: 'src/car'
        if (this.patternDir !== null && this.patternDir.length > 0)
        {
            let stemDir = path.dirname(stem.stem);
            let stemBase = path.basename(stem.stem);
            let filenameBase = this.baseExpand(stemBase);

            let relname = path.join(stemDir, filenameBase);
            return new TargetName(this.location, this.parseContext, stem.basedir, relname);
        }

        // Expand (pattern contains a slash):
        // -----------------------------------
        // The pattern is expanded into an actual file name by substituting
        // the stem for the character ‘%’.
        //
        // Example:
        //    Pattern: 'src/%.o’
        //    Stem:    'test’.
        //             |
        //             V
        //    Filename: src/test.o
        let relname = this.baseExpand(stem.stem);
        return new TargetName(this.location, this.parseContext, stem.basedir, relname);
    }

    private baseExpand(stem: string): string
    {
        return this.patternPrefix + stem + this.patternPostfix;
    }
}

