import type { IProjectionGroupItem } from '../../interfaces/IProjectionGroupItem';
import { type Lst, type Str, Model } from 'spinal-core-connectorjs';
export declare class ProjectionGroupItemModel extends Model {
    bimFileId: Str;
    uid: Str;
    externalId?: Str;
    path?: Lst<Str>;
    constructor(item: IProjectionGroupItem);
    constructor();
    update(item: IProjectionGroupItem): Promise<this>;
    toUxModel(): Promise<{
        modelId: number;
        dbid: number;
    }>;
}
