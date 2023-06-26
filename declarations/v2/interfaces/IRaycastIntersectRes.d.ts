import type { IDbIdCenter } from './IDbIdCenter';
export interface IRaycastIntersectRes {
    origin: IDbIdCenter;
    intersections: {
        distance: number;
        modelId: number;
        dbId: number;
    };
}
