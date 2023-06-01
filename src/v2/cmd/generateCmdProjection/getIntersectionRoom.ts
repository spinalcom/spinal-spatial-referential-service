import type { SpinalNode } from 'spinal-model-graph';
import { getBimFileIdByModelId } from '../../utils';
import { getModelByModelId } from '../../utils/projection/getModelByModelId';
import { GEO_REFERENCE_ROOM_RELATION, GEO_ROOM_TYPE } from '../../../Constant';
import { getBimObjFromBimFileId } from './getBimObjFromBimFileId';

export async function getIntersectionRoom(
  dbId: number,
  modelId: number,
  dicoBimObjs: Record<string, SpinalNode[]>,
  contextGeoId: string
): Promise<SpinalNode> {
  const roomRefObjModel = getModelByModelId(modelId);
  const bimFileId = getBimFileIdByModelId(roomRefObjModel.id);
  const refObj = await getBimObjFromBimFileId(dicoBimObjs, bimFileId, dbId);
  const rooms = await refObj.getParents(GEO_REFERENCE_ROOM_RELATION);
  const filteredRooms = rooms.filter((room) => {
    return (
      room.info.type.get() === GEO_ROOM_TYPE &&
      room.contextIds.has(contextGeoId)
    );
  });
  const room = filteredRooms[0];
  return room;
}
