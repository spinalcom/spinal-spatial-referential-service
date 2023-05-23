import type { ICmdProjection } from '../../interfaces/ICmdProjection';
import type { ICmdMissing } from '../../interfaces/ICmdMissing';
export declare function consumeCmdProjection(cmds: (ICmdMissing | ICmdProjection)[], nodeId: string, contextId: string, callbackProg?: (index: number) => void): Promise<void>;
