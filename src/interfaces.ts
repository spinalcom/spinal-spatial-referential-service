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

export interface ComparisionObject {
  deleted: {
    levels: { [externalId: string]: Level };
    rooms: { [externalId: string]: CmpRoom };
  };
  updated: {
    levels: { [externalId: string]: Level };
    rooms: { [externalId: string]: CmpRoom };
  };
  new: {
    levels: { [externalId: string]: Level };
    rooms: { [externalId: string]: Room[] };
  };
}

export type CmpRoom = { levelId: string; room: Room };
export interface ModelArchi {
  [dbId: string]: Level;
}
export type LevelRooms = { [externalId: string]: Room };
export type LevelStructures = { [externalId: string]: Structure };

export interface Level {
  properties: Properties;
  children: LevelRooms;
  structures: LevelStructures;
}

export interface Room {
  properties: Properties;
  children: Structure[];
}
export interface Structure {
  properties: Properties;
}

export interface Properties {
  dbId: number;
  externalId: string;
  properties: SpinalProps[];
}

export interface SpinalProps {
  name: string;
  value: any;
  [type: string]: any;
}
