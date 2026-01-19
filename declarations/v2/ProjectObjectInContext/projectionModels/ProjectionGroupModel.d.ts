import { ProjectionGroup } from '../ProjectionItem/ProjectionGroup';
import { type Bool, type Lst, type Str, Model } from 'spinal-core-connectorjs';
import { ProjectionOffsetModel } from './ProjectionOffsetModel';
import { ProjectionGroupItemModel } from './ProjectionGroupItemModel';
export declare class ProjectionGroupModel extends Model {
    name: Str;
    offset: ProjectionOffsetModel;
    uid: Str;
    data: Lst<ProjectionGroupItemModel>;
    stopAtLeaf: Bool;
    aproximateByLevel: Bool;
    constructor(projectionGroup?: ProjectionGroup);
    private updateData;
    update(projectionGroup: ProjectionGroup): Promise<this>;
    toUxModel(): Promise<ProjectionGroup>;
}
