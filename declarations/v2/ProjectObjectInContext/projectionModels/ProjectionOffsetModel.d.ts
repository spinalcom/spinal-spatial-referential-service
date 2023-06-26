import type { IProjectionOffset } from '../../interfaces';
import { type Val, Model } from 'spinal-core-connectorjs';
export declare class ProjectionOffsetModel extends Model {
    r: Val;
    t: Val;
    z: Val;
    constructor(offset: IProjectionOffset);
    update(offset: IProjectionOffset): void;
}
