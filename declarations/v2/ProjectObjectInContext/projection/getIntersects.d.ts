import type { SpinalVec3 } from '../../interfaces';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
import type { IIntersectRes } from '../../interfaces/IIntersectRes';
import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
export declare function getIntersects(projectionGroupConfig: ProjectionGroupConfig, mergedRoomRef: IAggregateDbidSetByModelItem[]): Promise<IIntersectRes>;
export declare function pushToAggregateDbidByModel(targetArray: IAggregateDbidByModelItem[], ids: number[], model: Autodesk.Viewing.Model, offset: SpinalVec3, rootDbId: number): void;
