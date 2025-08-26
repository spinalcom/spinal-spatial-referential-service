export interface ArchiSelect {
    key: string;
    value: string;
    isCat?: boolean;
}
export interface IFloorOnlyItemProp {
    name: string;
    value: string | number;
    category?: string;
    dataTypeContext?: string;
}
export interface IFloorOnlyItem {
    dbId: number;
    externalId: string;
    properties: IFloorOnlyItemProp[];
    children?: IFloorOnlyItem[];
}
export interface IFloorOnlyData {
    levels: IFloorOnlyItem[];
    structures: IFloorOnlyItem[];
}
export declare function getArchiFloorOnly(model: Autodesk.Viewing.Model, levelSelect: ArchiSelect[], structureSelect: ArchiSelect[]): Promise<IFloorOnlyData>;
