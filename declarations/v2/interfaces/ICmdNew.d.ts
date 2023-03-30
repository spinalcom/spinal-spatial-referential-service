export interface ICmdNew {
    pNId: string;
    id?: string;
    name?: string;
    type: string;
    nIdToDel?: string[];
    info?: ICmdNewInfo;
    attr?: ICmdNewAttr[];
}
export interface ICmdNewInfo {
    dbid: number;
    externalId: string;
    bimFileId: string;
    [key: string]: string | number;
}
export interface ICmdNewAttr {
    label: string;
    value: string | number;
    unit?: string;
}
