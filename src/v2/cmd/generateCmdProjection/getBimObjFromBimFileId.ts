import type { SpinalNode } from 'spinal-model-graph';
import { getBimObjsOfBimFileId } from './getBimObjsOfBimFileId';

export async function getBimObjFromBimFileId(
  dico: Record<string, SpinalNode[]>,
  bimFileId: string,
  bimObjectDbId: number
): Promise<SpinalNode> {
  const bimObjs = await getBimObjsOfBimFileId(dico, bimFileId);
  for (const bimObj of bimObjs) {
    if (bimObj.info.dbid.get() === bimObjectDbId) {
      return bimObj;
    }
  }
}
