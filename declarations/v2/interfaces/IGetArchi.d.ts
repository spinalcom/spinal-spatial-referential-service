export interface IGetArchi {
    [floorDbId: number]: IFloorArchi;
}
export interface IFloorArchi {
    properties: INodeInfo;
    children: Record<string, IRoomArchi>;
    structures: IStructures;
    merged?: number;
    propertiesArr?: INodeInfo[];
}
export interface INodeInfo {
    dbId: number;
    externalId: string;
    spinalnodeServerId?: number;
    modificationType?: number;
    properties: IPropertiesItem[];
}
export interface IPropertiesItem {
    name: string;
    value: string | number;
    dataTypeContext?: string;
    oldValue?: string;
    category?: string;
    overwriteValue?: string | number;
}
export interface IRoomArchi {
    properties: INodeInfo;
    children: INodeInfo[];
}
export interface IStructures {
    [externalId: string]: {
        properties: INodeInfo;
    };
}
export declare enum EModificationType {
    none = 0,
    update = 1,
    create = 2,
    updateNode = 8,
    updateAttr = 16,
    updateChildren = 32,
    delete = 64
}
export interface IDiffNodeInfoAttr {
    diffInfo: IDiffObj[];
    diffAttr: IDiffObj[];
}
export interface IDiffObj {
    label: string;
    nodeValue?: string | number | boolean;
    archiValue: string | number;
    unit?: string;
}
export interface IUpdateRoomDiff {
    roomArchi: IRoomArchi;
    diff: IDiffNodeInfoAttr;
}
export interface IUpdateBimObjDiff {
    nodeInfo: INodeInfo;
    diff: IDiffNodeInfoAttr;
}
export interface IDiffRoomChildren {
    newRooms: IRoomArchi[];
    updateRooms: IUpdateRoomDiff[];
    delRooms: number[];
}
export interface IDiffBimObj {
    newBimObj: INodeInfo[];
    delBimObj: number[];
}
export interface IDiffFloor {
    diffInfo: IDiffNodeInfoAttr;
    diffRoom: IDiffRoomChildren;
    diffRef: IDiffBimObj;
}
export type TManualAssingment = Map<string, number>;
