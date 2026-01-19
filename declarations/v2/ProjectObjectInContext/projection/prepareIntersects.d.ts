import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { ProjectionGroupConfig } from '../ProjectionItem/ProjectionGroupConfig';
export declare function prepareIntersects(projectionGroupConfig: ProjectionGroupConfig): Promise<{
    itemsToAproximate: IAggregateDbidByModelItem[];
    itemsToIntersect: IAggregateDbidByModelItem[];
}>;
