import type { SpinalNode } from 'spinal-model-graph';
export declare function getBimObjFromBimFileId(dico: Record<string, SpinalNode[]>, bimFileId: string, bimObjectDbId: number): Promise<SpinalNode>;
