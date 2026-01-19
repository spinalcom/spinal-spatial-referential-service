import type { Model, Val, Lst } from 'spinal-core-connectorjs_type';
import type { ProjectionFloorConfig } from './ProjectionFloorConfig';
import type { ProjectionFloorItemModel } from './ProjectionFloorItemModel';
export interface ProjectionFloorConfigModel extends Model {
    /**
     * @type {Val} server id of the floor node
     * @memberof ProjectionFloorConfig
     */
    floorId: Val;
    floorData: Lst<ProjectionFloorItemModel>;
    get(): ProjectionFloorConfig;
}
