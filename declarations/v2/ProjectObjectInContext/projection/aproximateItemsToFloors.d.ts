import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import type { ProjectionFloorConfig } from '../../interfaces/ProjectionFloorConfig';
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
export declare function aproximateItemsToFloors(itemsToAproximate: IAggregateDbidByModelItem[], roomRefsByFloor: Record<string, IAggregateDbidSetByModelItem[]>, configFloorProjections: ProjectionFloorConfig[]): Promise<IRaycastIntersectRes[]>;
