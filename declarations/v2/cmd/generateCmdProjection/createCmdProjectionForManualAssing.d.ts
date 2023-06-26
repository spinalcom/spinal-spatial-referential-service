import type { ICmdMissing } from '../../interfaces/ICmdMissing';
import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import type { IManualAssingData } from '../../interfaces/IManualAssingData';
export declare function createCmdProjectionForManualAssing(warnArr: IManualAssingData[], errorArr: IManualAssingData[]): Promise<{
    cmd: ICmdProjection[];
    cmdMiss: ICmdMissing[];
}>;
