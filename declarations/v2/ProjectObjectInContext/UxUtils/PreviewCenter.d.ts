/// <reference types="lodash" />
/// <reference types="forge-viewer" />
import type { IProjectionOffset } from '../../interfaces/IProjectionOffset';
import type { TProjectionItem } from '../../interfaces';
export declare const previewItem: import("lodash").DebouncedFunc<typeof _previewItem>;
declare function _previewItem(item: TProjectionItem, offset: IProjectionOffset, mode: number, viewer: Autodesk.Viewing.Viewer3D): Promise<void>;
export declare function stopPreview(viewer: Autodesk.Viewing.Viewer3D): Promise<void>;
export declare function setColorPreview(colorStr: string): void;
export declare function getColorPreview(): string;
export {};
