import type { SpinalVec3 } from './SpinalVec3';
import type { ProjectionGroup } from '../ProjectObjectInContext/ProjectionItem/ProjectionGroup';
import type { ProjectionItem } from '../ProjectObjectInContext/ProjectionItem/ProjectionItem';
import type { IPrevewItemToShow } from './IPrevewItemToShow';
export interface IPreviewObj {
    item: ProjectionGroup | ProjectionItem;
    mode: number;
    offset: SpinalVec3;
    lock: boolean;
    itemToShow: IPrevewItemToShow[];
}
