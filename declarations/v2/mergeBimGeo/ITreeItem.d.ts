export declare enum ETreeItemStatus {
    normal = 0,
    newItem = 1,
    deleteItem = 2,
    unknown = 3
}
export interface ITreeItem {
    id: string;
    contextId: string;
    name: string;
    type: string;
    status: ETreeItemStatus;
    startStatus?: ETreeItemStatus;
    children: ITreeItem[];
    inGeoContext?: boolean;
}
