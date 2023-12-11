/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

export interface IGetArchi {
  [floorDbId: number]: IFloorArchi;
}
export interface IFloorArchi {
  properties: INodeInfo;
  children: Record<string, IRoomArchi>;
  structures: IStructures;
  merged?: number;
  propertiesArr?: INodeInfo[];
}
export interface INodeInfo {
  dbId: number;
  externalId: string;
  spinalnodeServerId?: number;
  modificationType?: number;
  properties: IPropertiesItem[];
}
export interface IPropertiesItem {
  name: string;
  value: string | number;
  dataTypeContext?: string; // eg: 'autodesk.unit.unit:millimeters-1.0.1'
  oldValue?: string;
  category?: string;
  overwriteValue?: string | number;
}
export interface IRoomArchi {
  properties: INodeInfo;
  children: INodeInfo[];
}
export interface IStructures {
  [externalId: string]: {
    properties: INodeInfo;
  };
}

export enum EModificationType {
  none = 0,
  update = 1 << 0,
  create = 1 << 1,
  updateNode = 1 << 3, // update on node
  updateAttr = 1 << 4, // update on attr
  updateChildren = 1 << 5, // change in children
  delete = 1 << 6,
}

export interface IDiffNodeInfoAttr {
  diffInfo: IDiffObj[];
  diffAttr: IDiffObj[];
}

export interface IDiffObj {
  label: string;
  nodeValue?: string | number | boolean;
  archiValue: string | number;
  unit?: string;
}

export interface IUpdateRoomDiff {
  roomArchi: IRoomArchi;
  diff: IDiffNodeInfoAttr;
}

export interface IUpdateBimObjDiff {
  nodeInfo: INodeInfo;
  diff: IDiffNodeInfoAttr;
}

export interface IDiffRoomChildren {
  newRooms: IRoomArchi[];
  updateRooms: IUpdateRoomDiff[];
  delRooms: number[];
}
export interface IDiffBimObj {
  newBimObj: INodeInfo[];
  delBimObj: number[];
}

export interface IDiffFloor {
  diffInfo: IDiffNodeInfoAttr;
  diffRoom: IDiffRoomChildren;
  diffRef: IDiffBimObj;
}

export type TManualAssingment = Map<string, number>;
