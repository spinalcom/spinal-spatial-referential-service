import type { IManualAssingData } from '../../interfaces/IManualAssingData';
export declare function getDataAssing({ contextId, selectedNodeId, }: {
    contextId: string;
    selectedNodeId: string;
}): Promise<{
    warn: IManualAssingData[];
    error: IManualAssingData[];
}>;
