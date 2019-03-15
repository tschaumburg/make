
export interface IFileRef {
    readonly orgname: string;
    readonly fullname: string;
    timestamp(): number;
    isIntermediate(): boolean;
    isSecondary(): boolean;
    isPrecious(): boolean;
}