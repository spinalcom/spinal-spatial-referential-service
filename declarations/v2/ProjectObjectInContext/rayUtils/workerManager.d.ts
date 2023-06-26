import type { IWorkerData } from '../../interfaces/IWorkerData';
import type { IRaycastIntersectRes } from '../../interfaces/IRaycastIntersectRes';
import q = require('q');
declare class RayWorkerManager {
    worker: any;
    workInProg: Map<number, q.Deferred<IRaycastIntersectRes[]>>;
    workId: number;
    static instance: RayWorkerManager;
    private constructor();
    work(arg: IWorkerData): q.Promise<IRaycastIntersectRes[]>;
    static getInstance(): RayWorkerManager;
}
export { RayWorkerManager };
export default RayWorkerManager;
