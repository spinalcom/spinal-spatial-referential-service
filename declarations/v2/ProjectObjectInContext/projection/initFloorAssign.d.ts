import type { SpinalContext } from 'spinal-model-graph';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { ProjectionFloorItem } from '../../interfaces/ProjectionFloorItem';
export declare function initFloorAssign(lstItemsToAproximate: IAggregateDbidByModelItem[][], context: SpinalContext): Promise<{
    levelsFound: ProjectionFloorItem[];
    configFloorProjection: import("../..").ProjectionFloorConfig[];
}>;
