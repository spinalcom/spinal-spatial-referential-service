import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
export declare function createCmdProjection(intersects: IRaycastIntersectRes[], contextGeoId: string): Promise<ICmdProjection[]>;
