import type { ICmdNew } from '../../interfaces/ICmdNew';
export declare function consumeCmdGeo(cmds: ICmdNew[][], nodeGenerationId: string, contextGenerationId: string, callbackProg?: (indexCmd: number, idxInCmd: number) => void): Promise<void>;
