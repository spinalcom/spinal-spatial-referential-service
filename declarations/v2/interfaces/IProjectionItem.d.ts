/// <reference types="forge-viewer" />
import type { IProjectionOffset } from './IProjectionOffset';
export interface IProjectionItem {
    name: string;
    offset: IProjectionOffset;
    uid: string;
    modelId: number;
    dbId: number;
    id: string;
    properties: Autodesk.Viewing.Property[];
}
