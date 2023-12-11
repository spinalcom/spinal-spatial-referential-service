import type { IFloorData, IGetArchi, TManualAssingment } from '../interfaces';
export declare function diffArchiWithContextGeo(archiData: IGetArchi, buildingServerId: number, manualAssingment: TManualAssingment): Promise<IFloorData[]>;
