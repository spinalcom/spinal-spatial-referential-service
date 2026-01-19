import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
export declare class ProjectionTester {
    nbPages: number;
    private pageSize;
    private viewer;
    private roomData;
    private colors;
    constructor(intersectRes: IRaycastIntersectRes[]);
    /**
     * @param {number} pageIndex start at 0
     * @memberof ProjectionTester
     */
    colorRooms(pageIndex: number): void;
    clearColors(): void;
    private assignItemByRooms;
}
