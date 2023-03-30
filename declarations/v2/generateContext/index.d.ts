import type { IFloorData } from '../interfaces/IFloorData';
import type { ISkipItem } from '../interfaces/ISkipItem';
import type { ICmdNew } from '../interfaces/ICmdNew';
export declare function generateCmd(data: IFloorData[], skipList: ISkipItem[], buildingServerId: number, bimFileId: string): Promise<ICmdNew[][]>;
