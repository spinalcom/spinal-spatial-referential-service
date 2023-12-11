import type { IFloorData, IGetArchi, TManualAssingment } from '../interfaces';
export declare function diffArchiWithContextBIMGeo(archiData: IGetArchi, BIMGeocontextServId: number, manualAssingment: TManualAssingment): Promise<IFloorData[]>;
