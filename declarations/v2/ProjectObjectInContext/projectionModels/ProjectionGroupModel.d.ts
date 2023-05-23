import { ProjectionGroup } from '../ProjectionItem/ProjectionGroup';
import { type Lst, type Str, Model } from 'spinal-core-connectorjs';
import { ProjectionOffsetModel } from './ProjectionOffsetModel';
import { ProjectionGroupItemModel } from './ProjectionGroupItemModel';
export declare class ProjectionGroupModel extends Model {
    name: Str;
    offset: ProjectionOffsetModel;
    uid: Str;
    data: Lst<ProjectionGroupItemModel>;
    constructor(projectionGroup?: ProjectionGroup);
    private updateData;
    update(projectionGroup: ProjectionGroup): Promise<void>;
    toUxModel(): Promise<ProjectionGroup>;
}
