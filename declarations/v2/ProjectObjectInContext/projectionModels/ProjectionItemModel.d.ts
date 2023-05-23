import { ProjectionItem } from '../ProjectionItem/ProjectionItem';
import { type Lst, type Str, Model } from 'spinal-core-connectorjs';
import { ProjectionOffsetModel } from './ProjectionOffsetModel';
export declare class ProjectionItemModel extends Model {
    offset: ProjectionOffsetModel;
    uid: Str;
    bimFileId: Str;
    externalId?: Str;
    path?: Lst<Str>;
    constructor(projectionItem: ProjectionItem);
    constructor();
    update(projectionItem: ProjectionItem): Promise<void>;
    toUxModel(): Promise<ProjectionItem>;
}
