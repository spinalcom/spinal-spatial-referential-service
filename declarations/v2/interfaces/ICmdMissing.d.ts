import type { ICmdProjData } from './ICmdProjData';
export interface ICmdMissing {
    type: 'CmdMissing';
    bimFileId: string;
    data: Omit<ICmdProjData, 'flagWarining'>[];
}
