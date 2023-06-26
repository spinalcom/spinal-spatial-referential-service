interface IAggregateSetDbidByBimFileId {
    bimFileId: string;
    dbId: Set<number>;
}
interface ISpatialTreeNode {
    type: string;
    id: string;
    name: string;
    server_id: number;
    children: ISpatialTreeNode[];
    data?: IAggregateSetDbidByBimFileId[];
}
export declare function getSpatialTree(): Promise<ISpatialTreeNode[]>;
export declare function pushToAggregateSetDbidByBimFileId(targetArray: IAggregateSetDbidByBimFileId[], id: number, bimFileId: string): void;
export {};
