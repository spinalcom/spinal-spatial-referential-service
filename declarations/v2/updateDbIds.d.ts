/// <reference types="forge-viewer" />
export declare function getExternalIdMapping(model: Autodesk.Viewing.Model): Promise<Record<string, number>>;
export declare function updateDbIds(bimFileId: string, model: Autodesk.Viewing.Model): Promise<void>;
