export interface ICmdNew {
    /**
     * nodeIdParent
     */
    pNId: string;
    contextId?: string;
    id?: string;
    name?: string;
    type: string;
    nIdToDel?: string[];
    info?: ICmdNewInfo;
    attr?: ICmdNewAttr[];
}
export interface ICmdNewDelete extends ICmdNew {
    type: 'roomRefDel' | 'floorRoomDel' | 'floorRefDel';
    pNId: string;
    nIdToDel: string[];
}
export interface ICmdNewRefNode extends ICmdNew {
    type: 'RefNode';
    pNId: string;
    id: string;
    contextId: string;
}
export interface ICmdNewRef extends ICmdNew {
    type: 'floorRef' | 'roomRef';
    pNId: string;
    id: string;
    name: string;
    info: ICmdNewInfo;
    attr?: ICmdNewAttr[];
}
export interface ICmdNewSpace extends ICmdNew {
    pNId: string;
    contextId: string;
    id: string;
    name: string;
    type: 'room' | 'floor' | 'building';
    info?: ICmdNewInfo;
    attr?: ICmdNewAttr[];
    linkedBimGeos?: {
        floorId: string;
        contextId: string;
    }[];
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
