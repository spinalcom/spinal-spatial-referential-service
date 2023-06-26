import type { SpinalContext } from 'spinal-model-graph';
import type { TProjectionLst } from '../../interfaces/TProjectionLst';
export declare class ProjectionGroupConfig {
    readonly _server_id: number;
    name: string;
    uid: string;
    data: TProjectionLst;
    progress: number;
    isLoaded: boolean;
    constructor(name: string, _server_id: number, uid?: string);
    countChild(): number;
    removeFromContext(context: SpinalContext): Promise<void>;
    loadConfigNode(): Promise<void>;
    saveToContext(context: SpinalContext): Promise<void>;
}
