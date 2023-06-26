/// <reference types="forge-viewer" />
import type { AuProps } from '../../interfaces/AuProps';
export declare function getProperties(model: number | Autodesk.Viewing.Model, dbId: number): Promise<AuProps>;
