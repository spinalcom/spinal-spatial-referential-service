import type { SpinalNode } from 'spinal-model-graph';
import { getBimContextByBimFileId } from '../../utils';
import { GEO_EQUIPMENT_RELATION } from '../../../Constant';

export async function getBimObjsOfBimFileId(
  dico: Record<string, SpinalNode[]>,
  bimFileId: string
): Promise<SpinalNode[]> {
  const _bimObjs = dico[bimFileId];
  if (_bimObjs) return _bimObjs;
  const bimContext = await getBimContextByBimFileId(bimFileId);
  const bimObjs = await bimContext.getChildren(GEO_EQUIPMENT_RELATION);
  dico[bimFileId] = bimObjs;
  return bimObjs;
}
