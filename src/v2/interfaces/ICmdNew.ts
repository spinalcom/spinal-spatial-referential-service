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
export interface ICmdNew {
  /**
   * nodeIdParent
   */
  pNId: string;
  contextId?: string;
  id?: string;
  name?: string;
  type: string;
  nIdToDel?: string[];
  info?: ICmdNewInfo;
  attr?: ICmdNewAttr[];
}
export interface ICmdNewDelete extends ICmdNew {
  type: 'roomRefDel' | 'floorRoomDel' | 'floorRefDel';
  pNId: string;
  nIdToDel: string[];
}

export interface ICmdNewRefNode extends ICmdNew {
  type: 'RefNode';
  pNId: string;
  id: string;
  contextId: string;
}
export interface ICmdNewRef extends ICmdNew {
  type: 'floorRef' | 'roomRef';
  pNId: string;
  id: string;
  name: string;
  info: ICmdNewInfo;
  attr?: ICmdNewAttr[];
}

export interface ICmdNewSpace extends ICmdNew {
  pNId: string;
  contextId: string;
  id: string;
  name: string;
  type: 'room' | 'floor' | 'building';
  info?: ICmdNewInfo;
  attr?: ICmdNewAttr[];
  linkedBimGeos?: { floorId: string; contextId: string }[];
}

export interface ICmdNewInfo {
  dbid: number;
  externalId: string;
  bimFileId: string;
  [key: string]: string | number;
}

export interface ICmdNewAttr {
  label: string;
  value: string | number;
  unit?: string;
}
