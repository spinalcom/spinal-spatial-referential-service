import type { SpinalContext } from 'spinal-model-graph';
import type { TProjectionLst } from '../../interfaces/TProjectionLst';
export declare class ProjectionGroupConfig {
    name: string;
    uid: string;
    data: TProjectionLst;
    progress: number;
    constructor(name: string, uid?: string);
    countChild(): number;
    removeFromContext(context: SpinalContext): Promise<void>;
    saveToContext(context: SpinalContext): Promise<void>;
}
