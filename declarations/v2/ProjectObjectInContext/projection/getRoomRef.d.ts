/// <reference types="forge-viewer" />
import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import type { SpinalContext } from 'spinal-model-graph';
export declare function getRoomRef(context: SpinalContext): Promise<IAggregateDbidSetByModelItem[]>;
export declare function pushToAggregateSetDbidByModel(targetArray: IAggregateDbidSetByModelItem[], id: number, model: Autodesk.Viewing.Model): void;
