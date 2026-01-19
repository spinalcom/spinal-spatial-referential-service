import type { SpinalVec3 } from './SpinalVec3';
export interface IDbidOffsetItem {
    dbId: number;
    offset: SpinalVec3;
    isFocus: boolean;
    levelDbId?: number;
}
