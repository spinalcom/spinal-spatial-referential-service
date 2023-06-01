import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
import type { IFloorZData } from '../../interfaces/IFloorZData';
export declare function createCmdProjection(intersects: IRaycastIntersectRes[], contextGeoId: string, floorsData: Record<string, IFloorZData>): Promise<ICmdProjection[]>;
