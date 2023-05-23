/// <reference types="forge-viewer" />
import type { SpinalVec3 } from '../../interfaces';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { SpinalContext } from 'spinal-model-graph';
import type { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
import type { IIntersectRes } from '../../interfaces/IIntersectRes';
export declare function getIntersects(projectionGroupConfig: ProjectionGroupConfig, context: SpinalContext): Promise<IIntersectRes>;
export declare function pushToAggregateDbidByModel(targetArray: IAggregateDbidByModelItem[], ids: number[], model: Autodesk.Viewing.Model, offset: SpinalVec3, rootDbId: number): void;
