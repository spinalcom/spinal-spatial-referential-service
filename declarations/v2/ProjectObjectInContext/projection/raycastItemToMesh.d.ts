/// <reference types="forge-viewer" />
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
import type { IAggregateDbidSetByModelItem } from '../../interfaces/IAggregateDbidSetByModelItem';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';
export declare function raycastItemToMesh(from: IAggregateDbidByModelItem[], to: IAggregateDbidSetByModelItem[], viewer: Autodesk.Viewing.Viewer3D): Promise<IRaycastIntersectRes[]>;
