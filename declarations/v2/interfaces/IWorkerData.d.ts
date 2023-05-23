import type { IDbIdCenter } from './IDbIdCenter';
import type { IDbIdMeshData } from './IDbIdMeshData';
export interface IWorkerData {
    centerPoints: IDbIdCenter[];
    geometries: IDbIdMeshData[];
}
