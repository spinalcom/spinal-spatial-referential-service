import type { SpinalVec3 } from '../../interfaces';
import type { IAggregateDbidByModelItem } from '../../interfaces/IAggregateDbidByModelItem';

export function pushToAggregateDbidByModel(
  targetArray: IAggregateDbidByModelItem[],
  ids: number[],
  model: Autodesk.Viewing.Model,
  offset: SpinalVec3,
  rootDbId: number
): void {
  for (const obj of targetArray) {
    if (obj.model === model) {
      for (const id of ids) {
        const findItem = obj.dbId.find((a) => a.dbId === id);
        const isFocus = rootDbId === id;
        if (findItem === undefined) {
          obj.dbId.push({ dbId: id, offset, isFocus });
        } else if (isFocus === true && findItem.isFocus === false) {
          findItem.isFocus = true;
          findItem.offset = offset;
        }
      }
      return;
    }
  }

  const dbId = [];
  for (const id of ids) {
    const isFocus = rootDbId === id;
    dbId.push({ dbId: id, offset, isFocus });
  }
  targetArray.push({
    model,
    dbId,
  });
}
