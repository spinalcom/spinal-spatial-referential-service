import type { ProjectionFloorItem } from './ProjectionFloorItem';
export interface ProjectionFloorConfig {
    /**
     * @type {number} serverid of the floor node
     * @memberof ProjectionFloorConfig
     */
    floorId: number;
    floorData: ProjectionFloorItem[];
}
