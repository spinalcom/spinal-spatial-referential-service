import type { IWorkerData } from './IWorkerData';
export interface IWorkerEventData {
    data: {
        workId: number;
        data: IWorkerData;
    };
}
