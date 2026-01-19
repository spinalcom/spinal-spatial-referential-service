import type { IAggregateDbidSetByModelItem } from '../..';
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
export declare class ProjectionTester {
    pageSize: number;
    private viewer;
    private floorsData;
    private colors;
    constructor(intersectRes: IRaycastIntersectRes[], roomRefsByFloor: Record<string, IAggregateDbidSetByModelItem[]>);
    getFloorsDataUx(): {
        id: string;
        name: string;
        size: number;
    }[];
    /**
     * @param {number} pageIndex start at 0
     * @memberof ProjectionTester
     */
    colorRooms(floorNodeId: string, pageIndex: number): void;
    clearColors(): void;
    private assignItemByRooms;
    private getFloorData;
    private getFloorIdByModelAndDbid;
    private getFloorNameById;
}
