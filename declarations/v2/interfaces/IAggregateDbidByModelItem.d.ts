import type { IDbidOffsetItem } from './IDbidOffsetItem';
export interface IAggregateDbidByModelItem {
    model: Autodesk.Viewing.Model;
    dbId: IDbidOffsetItem[];
    floors?: {
        name: string;
        dbId: number;
    }[];
}
