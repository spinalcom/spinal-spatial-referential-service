import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import type { IFloorZData } from '../../interfaces/IFloorZData';
export declare function getRefFloorZMinMax(data: Record<string, IAggregateDbidSetByModelItem[]>): Promise<Record<string, IFloorZData>>;
