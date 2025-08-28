/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import type { SpinalContext } from 'spinal-model-graph';
import type { IFloorOnlyItem } from './getArchiFloorOnly';
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import type {
  ICmdNew,
  ICmdNewDelete,
  ICmdNewRef,
  ICmdNewRefNode,
  ICmdNewSpace,
} from '../interfaces';
import { guid } from '../utils';
import { parseUnit } from '../scripts';

interface IFloorNodeInfo {
  id: string;
  externalId: string;
  dbId: number;
  name: string;
}

interface IFloorNodeData extends IFloorNodeInfo {
  properties: {
    Spatial: {
      name: string;
      category: string;
      elevation: string;
    };
  };
  children: IFloorNodeInfo[];
}

export async function createCmdFloorOnlyImport(
  bimGeoContext: SpinalContext,
  floorOnlyItems: IFloorOnlyItem[],
  bimFileId: string
) {
  const floorDataRes: ICmdNewSpace | ICmdNewRefNode[] = [];
  const structDataRes: ICmdNewRef[] = [];
  const removeStructDataRes: ICmdNewDelete[] = [];

  const res: ICmdNew[][] = [floorDataRes, structDataRes, removeStructDataRes];

  const floorsNodeData: IFloorNodeData[] = await loadFloorDataWithChildren(
    bimGeoContext
  );

  for (const floorData of floorOnlyItems) {
    const matchingNodeData = floorsNodeData.find(
      (floorNodeData) => floorNodeData.externalId === floorData.externalId
    );
    if (floorData.children?.length > 0) {
      const floorId = createFloorDataEntry(
        floorData,
        floorDataRes,
        bimGeoContext.info.id.get(),
        bimFileId,
        matchingNodeData?.id
      );
      for (const structData of floorData.children) {
        const matchingStructData = matchingNodeData?.children.find(
          (child) => child.externalId === structData.externalId
        );
        createStructDataEntry(
          structData,
          structDataRes,
          bimGeoContext.info.id.get(),
          floorId,
          bimFileId,
          matchingStructData?.id
        );
      }
      // set to delete the other structures
      if (matchingNodeData?.children) {
        const toRm: string[] = [];
        for (const structData of matchingNodeData.children) {
          if (
            !floorData.children.find(
              (child) => child.externalId === structData.externalId
            )
          ) {
            toRm.push(structData.id);
          }
        }
        if (toRm.length > 0) {
          removeStructDataRes.push({
            pNId: matchingNodeData.id,
            type: 'floorRefDel',
            nIdToDel: toRm,
          });
        }
      }
    } else if (matchingNodeData.children.length > 0) {
      floorDataRes.push({
        type: 'RefNode',
        pNId: bimGeoContext.info.id.get(),
        id: matchingNodeData.id,
        contextId: bimGeoContext.info.id.get(),
      } as ICmdNewRefNode);

      // no new data found for the level but some data found from the past => remove old structures
      removeStructDataRes.push({
        pNId: matchingNodeData.id,
        type: 'floorRefDel',
        nIdToDel: matchingNodeData.children.map((child) => child.id),
      });
    }
  }

  return res;
}

function createStructDataEntry(
  structData: IFloorOnlyItem,
  structDataRes: ICmdNewRef[],
  contextId: string,
  floorId: string,
  bimFileId: string,
  nodeId?: string
) {
  const name =
    (structData.properties.find((itm) => itm.name === 'name')
      ?.value as string) ?? '';
  structDataRes.push({
    pNId: floorId,
    contextId,
    id: nodeId ? nodeId : guid(),
    name,
    type: 'floorRef',
    info: {
      dbid: structData.dbId,
      externalId: structData.externalId,
      bimFileId,
    },
  });
}

function createFloorDataEntry(
  floorData: IFloorOnlyItem,
  floorDataRes: (ICmdNewSpace | ICmdNewRefNode)[],
  contextId: string,
  bimFileId: string,
  nodeId?: string
) {
  let name = '';
  const attr = floorData.properties.map((itm) => {
    if (itm.name === 'name') name = <string>itm.value;
    return {
      label: itm.name,
      value: itm.value,
      unit: parseUnit(itm.dataTypeContext),
    };
  });
  const id = nodeId ? nodeId : guid();
  floorDataRes.push({
    pNId: contextId,
    contextId,
    id,
    name,
    type: 'floor',
    info: {
      dbid: floorData.dbId,
      externalId: floorData.externalId,
      bimFileId,
    },
    attr,
  });
  return id;
}

async function loadFloorDataWithChildren(bimGeoContext: SpinalContext) {
  const floorNodes = await bimGeoContext.getChildrenInContext(bimGeoContext);
  const floorsNodeData: IFloorNodeData[] = [];
  for (const node of floorNodes) {
    const children = await node.getChildren('hasReferenceObject');
    const childrenData: IFloorNodeInfo[] = children.map((child) => {
      return {
        id: child.info.id.get(),
        externalId: child.info.externalId.get(),
        dbId: child.info.dbid.get(),
        name: child.info.name.get(),
      };
    });
    const floorData = {
      id: node.info.id.get(),
      externalId: node.info.externalId.get(),
      dbId: node.info.dbid.get(),
      name: node.info.name.get(),
      properties: await attributeService.getAttrBySchema(node, {
        Spatial: ['name', 'category', 'elevation'] as const,
      }),
      children: childrenData,
    };
    floorsNodeData.push(floorData);
  }
  return floorsNodeData;
}
