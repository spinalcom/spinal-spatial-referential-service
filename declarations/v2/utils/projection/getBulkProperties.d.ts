import type { AuProps } from '../../interfaces/AuProps';
export declare function getBulkProperties(model: number | Autodesk.Viewing.Model, dbIds: number[] | Set<number>, props?: {
    propFilter: string[];
}): Promise<AuProps[]>;
