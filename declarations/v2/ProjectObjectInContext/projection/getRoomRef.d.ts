import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import { SpinalContext } from 'spinal-model-graph';
export declare function getRoomRefByFloor(context: SpinalContext): Promise<Record<string, IAggregateDbidSetByModelItem[]>>;
export declare function getRoomRef(context: SpinalContext): Promise<IAggregateDbidSetByModelItem[]>;
