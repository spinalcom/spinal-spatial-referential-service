/// <reference types="forge-viewer" />
import type { IProjectionOffset } from '../../interfaces/IProjectionOffset';
import type { IAggregateSelectItem } from '../../interfaces/IAggregateSelectItem';
import { IProjectionGroupItem } from '../../interfaces/IProjectionGroupItem';
export declare class ProjectionGroup {
    name: string;
    offset: IProjectionOffset;
    uid: string;
    data: IAggregateSelectItem[];
    computedData: IProjectionGroupItem[];
    constructor(name: string);
    getAndMergeSelection(viewer: Autodesk.Viewing.Viewer3D): Promise<void>;
    updateComputed(): Promise<void>;
    deleteItem(item: {
        modelId: number;
        dbId: number;
    }): Promise<void>;
    selectItem(item: {
        modelId: number;
        dbId: number;
    }, viewer: Autodesk.Viewing.Viewer3D): void;
    selectAll(viewer: Autodesk.Viewing.Viewer3D): void;
}
