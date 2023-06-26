import type { IAggregateDbidByModelItem } from './IAggregateDbidByModelItem';
import type { IRaycastIntersectRes } from './IRaycastIntersectRes';
export interface IIntersectRes {
    selection: IAggregateDbidByModelItem[];
    intersects: IRaycastIntersectRes[];
}
