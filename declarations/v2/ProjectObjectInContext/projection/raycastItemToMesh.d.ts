import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
import type { IDbIdMeshData } from '../../interfaces/IDbIdMeshData';
import type { IDbIdCenter } from '../../interfaces/IDbIdCenter';
export declare function raycastItemToMesh(from: IAggregateDbidByModelItem[], to: IAggregateDbidSetByModelItem[], viewer?: Autodesk.Viewing.Viewer3D): Promise<IRaycastIntersectRes[]>;
export declare function getCenterObjects(array: IAggregateDbidByModelItem[], viewer: Autodesk.Viewing.Viewer3D): Promise<IDbIdCenter[]>;
export declare function getMeshsData(array: IAggregateDbidSetByModelItem[], viewer: Autodesk.Viewing.Viewer3D): Promise<IDbIdMeshData[]>;
