import type { ICmdProjData } from './ICmdProjData';
export interface ICmdProjection {
    type: 'CmdProjection';
    /**
     * room nodeIdParent
     */
    pNId: string;
    bimFileId: string;
    data: ICmdProjData[];
}
