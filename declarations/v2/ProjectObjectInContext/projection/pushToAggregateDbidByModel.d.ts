import type { SpinalVec3 } from '../../interfaces';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
export declare function pushToAggregateDbidByModel(targetArray: IAggregateDbidByModelItem[], ids: number[], model: Autodesk.Viewing.Model, offset: SpinalVec3, rootDbId: number): void;
