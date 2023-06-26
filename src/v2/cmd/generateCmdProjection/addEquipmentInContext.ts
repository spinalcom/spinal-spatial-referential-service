/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
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

import {
  SPINAL_RELATION_TYPE,
  SPINAL_RELATION_LST_PTR_TYPE,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-model-graph';
import {
  GEO_REFERENCE_RELATION,
  GEO_EQUIPMENT_RELATION,
  GEO_ROOM_TYPE,
  GEO_FLOOR_TYPE,
  GEO_FLOOR_RELATION,
} from '../../../Constant';
import { FileSystem } from 'spinal-core-connectorjs';
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalAttribute } from 'spinal-models-documentation';
import { addNodeGraphService, getRealNode } from '../../utils/graphservice';

const ATTRIBUT_CAT_NAME = 'default';
const CAT_NAME_RENAME = 'revit_category';

export async function addEquipmentInContext(equipmentInfo, contextId) {
  const fail = [];
  const batchSize = 10;
  let turn = 0;
  let j = 0;
  let countOK = 0;

  while (j < equipmentInfo.length) {
    const proms = [];
    for (
      j = turn * batchSize;
      j < (turn + 1) * batchSize && j < equipmentInfo.length;
      j++
    ) {
      const info = equipmentInfo[j];
      if (!info.rooms) {
        fail.push(info);
        continue;
      }

      for (const room of info.rooms) {
        const bimObj = await getProps(info.bimObjectDbId, info.bimObjectModel);
        addNodeGraphService(room);
        proms.push(
          addBIMObject(
            contextId,
            room.getId().get(),
            info.bimObjectDbId,
            bimObj.name,
            info.bimObjectModel
          ).then((nodeRef) => {
            const nodeBimObject = getRealNode(nodeRef.id.get());
            return addCategoryAttribute(nodeBimObject, bimObj.properties).then(
              () => nodeRef
            );
          })
        );
      }
    }
    try {
      // eslint-disable-next-line no-await-in-loop
      await waitForFileSystem(proms);
      countOK += proms.length;
    } catch (obj) {
      console.log('batch fail');
      console.log('batch fail => promise', proms);
    }
    turn++;
  }

  if (fail.length > 0) {
    console.error(`${fail.length} items failed to be added in Local`, fail);
  }

  const res = {
    total: equipmentInfo.length,
    Succcess: countOK,
    failLen: fail.length,
    fail,
  };
  console.log(`addEquipmentInContext done`, res);
  return res;
}

function getCategory(props) {
  for (const prop of props) {
    // {displayName: "Category", displayValue: "Revit ", displayCategory: "__category__", attributeName: "Category", type: 20}
    if (
      prop.attributeName === 'Category' &&
      prop.displayCategory === '__category__'
    ) {
      return prop;
    }
  }
}
async function addCategoryAttribute(node, props) {
  let category = await serviceDocumentation.getCategoryByName(
    node,
    ATTRIBUT_CAT_NAME
  );
  if (typeof category === 'undefined') {
    category = await serviceDocumentation.addCategoryAttribute(
      node,
      ATTRIBUT_CAT_NAME
    );
  }
  const prop = getCategory(props);
  return addAttributeByCategory(
    node,
    category,
    CAT_NAME_RENAME,
    prop.displayValue
  );
}

async function addAttributeByCategory(parentNode, category, label, value) {
  if (label != undefined && value != undefined && value != '' && label != '') {
    const allAttributes = await serviceDocumentation.getAllAttributes(
      parentNode
    );
    for (let i = 0; i < allAttributes.length; i++) {
      const element = allAttributes[i];
      if (element.label.get() == label) {
        element.value.set(value);
        return;
      }
    }
    if (category != undefined) {
      const myChild = new SpinalAttribute(label, value);
      category.element.push(myChild);
    }
  }
}

async function getBimObjectParentRoom(nodeBimObject) {
  const parentPtrLst = nodeBimObject.parents.getElement(GEO_EQUIPMENT_RELATION);
  if (!parentPtrLst) return [];
  const prom = [];
  for (let idx = 0; idx < parentPtrLst.length; idx++) {
    prom.push(parentPtrLst[idx].load());
  }
  const relationsParent = await Promise.all(prom);
  const parents = await Promise.all(
    relationsParent.map((item) => item.parent.load())
  );
  return parents.filter((item) => {
    return item.info.type.get() === GEO_ROOM_TYPE;
  });
}

async function getBimObjectParentRefenceObject(nodeBimObject) {
  const parentPtrLst = nodeBimObject.parents.getElement(GEO_REFERENCE_RELATION);
  if (!parentPtrLst) return [];
  const prom = [];
  for (let idx = 0; idx < parentPtrLst.length; idx++) {
    prom.push(parentPtrLst[idx].load());
  }
  const relationsParent = await Promise.all(prom);
  const parents = await Promise.all(
    relationsParent.map((item) => item.parent.load())
  );
  return parents.filter((item) => {
    const type = item.info.type.get();
    return type === GEO_FLOOR_TYPE || type === GEO_ROOM_TYPE;
  });
}

async function removeBimObjectFromOtherRoom(parentLst, nodeRoom, bimObject) {
  let found = false;
  const prom = [];
  for (const parent of parentLst) {
    if (nodeRoom === parent) {
      found = true;
      continue;
    }
    if (parent.hasRelation(GEO_EQUIPMENT_RELATION, SPINAL_RELATION_TYPE)) {
      prom.push(
        parent.removeChild(
          bimObject,
          GEO_EQUIPMENT_RELATION,
          SPINAL_RELATION_TYPE
        )
      );
    }
    if (
      parent.hasRelation(GEO_EQUIPMENT_RELATION, SPINAL_RELATION_LST_PTR_TYPE)
    ) {
      prom.push(
        parent.removeChild(
          bimObject,
          GEO_EQUIPMENT_RELATION,
          SPINAL_RELATION_LST_PTR_TYPE
        )
      );
    }
    if (
      parent.hasRelation(GEO_EQUIPMENT_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
    ) {
      prom.push(
        parent.removeChild(
          bimObject,
          GEO_EQUIPMENT_RELATION,
          SPINAL_RELATION_PTR_LST_TYPE
        )
      );
    }
  }
  await Promise.all(prom);
  return found;
}

async function removeBimObjectFromParentRefenceObject(
  parentLst,
  nodeRoom,
  bimObject
) {
  let found = false;
  const prom = [];
  for (const parent of parentLst) {
    if (nodeRoom === parent) {
      found = true;
      continue;
    }
    if (parent.hasRelation(GEO_FLOOR_RELATION, SPINAL_RELATION_TYPE)) {
      prom.push(
        parent.removeChild(bimObject, GEO_FLOOR_RELATION, SPINAL_RELATION_TYPE)
      );
    }
    if (parent.hasRelation(GEO_FLOOR_RELATION, SPINAL_RELATION_LST_PTR_TYPE)) {
      prom.push(
        parent.removeChild(
          bimObject,
          GEO_FLOOR_RELATION,
          SPINAL_RELATION_LST_PTR_TYPE
        )
      );
    }
    if (parent.hasRelation(GEO_FLOOR_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
      prom.push(
        parent.removeChild(
          bimObject,
          GEO_FLOOR_RELATION,
          SPINAL_RELATION_PTR_LST_TYPE
        )
      );
    }
  }
  await Promise.all(prom);
  return found;
}

async function addBIMObject(contextId, roomId, dbId, bimObjName, model) {
  try {
    const bimObject = await window.spinal.BimObjectService.getBIMObject(
      dbId,
      model
    );
    if (typeof bimObject !== 'undefined') {
      const nodeBimObject = getRealNode(bimObject.id.get());
      const nodeRoom = getRealNode(roomId);

      // rm other room parent
      const parentLst = await getBimObjectParentRoom(nodeBimObject);
      if (parentLst.length > 0) {
        const found = await removeBimObjectFromOtherRoom(
          parentLst,
          nodeRoom,
          nodeBimObject
        );
        if (found) return bimObject;
      }

      // rm ref Object parent
      const parentRefLst = await getBimObjectParentRefenceObject(nodeBimObject);
      if (parentRefLst.length > 0) {
        await removeBimObjectFromParentRefenceObject(
          parentRefLst,
          nodeRoom,
          nodeBimObject
        );
      }

      const context = getRealNode(contextId);
      await nodeRoom.addChildInContext(
        nodeBimObject,
        GEO_EQUIPMENT_RELATION,
        SPINAL_RELATION_LST_PTR_TYPE,
        context
      );
      return bimObject;
    }
    const child = await window.spinal.BimObjectService.createBIMObject(
      dbId,
      bimObjName,
      model
    );
    const nodeBimObject = getRealNode(child.id.get());
    const nodeRoom = getRealNode(roomId);
    const context = getRealNode(contextId);
    await nodeRoom.addChildInContext(
      nodeBimObject,
      GEO_EQUIPMENT_RELATION,
      SPINAL_RELATION_LST_PTR_TYPE,
      context
    );
    return child;
  } catch (e) {
    console.log(
      'Error addBIMObject',
      contextId,
      roomId,
      dbId,
      bimObjName,
      model
    );
    console.error(e);
    throw e;
  }
}

function getProps(
  dbId: number,
  model: Autodesk.Viewing.Model
): Promise<Autodesk.Viewing.PropertyResult> {
  return new Promise((resolve, reject) => {
    model.getProperties(dbId, resolve, reject);
  });
}

/**
 * Waits for the nodes to be in the FileSystem.
 * @param {Array<Promise>} promises Array of promises containing the nodes
 * @returns {Promise<any>} An empty promise
 */
async function waitForFileSystem(promises) {
  console.log('waitForFileSystem', promises.length);
  const nodes = await Promise.all(promises);

  const realNodes = nodes.map((item) => {
    if (item && Object.prototype.hasOwnProperty.call(item, 'id')) {
      return getRealNode(item.id.get());
    }
  });
  console.log('waitForFileSystem after promise.all', realNodes);
  return new Promise((resolve) => {
    const inter = setInterval(() => {
      console.log('in interval');
      for (const node of realNodes) {
        if (
          node &&
          typeof FileSystem._objects[node._server_id] === 'undefined'
        ) {
          return;
        }
      }
      console.log('in interval RESOLVED');
      clearInterval(inter);
      resolve(nodes);
    }, 500);
  });
}
