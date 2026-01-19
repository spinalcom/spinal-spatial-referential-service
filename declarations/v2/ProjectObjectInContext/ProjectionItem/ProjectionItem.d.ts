import type { IProjectionItem } from '../../interfaces/IProjectionItem';
import type { IProjectionOffset } from '../../interfaces/IProjectionOffset';
export declare class ProjectionItem implements IProjectionItem {
    name: string;
    offset: IProjectionOffset;
    uid: string;
    modelId: number;
    externalId: string;
    dbId: number;
    id: string;
    properties: Autodesk.Viewing.Property[];
    stopAtLeaf: boolean;
    aproximateByLevel: boolean;
    constructor(name: string, modelId: number, dbId: number, properties: Autodesk.Viewing.Property[], externalId: string, stopAtLeaf?: boolean, aproximateByLevel?: boolean);
    selectItem(viewer: Autodesk.Viewing.Viewer3D): void;
}
