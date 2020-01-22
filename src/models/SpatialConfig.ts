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

import { Model } from "spinal-core-connectorjs_type";

const ROOM_ATTRIBUTE_NAME: string = 'category';
const ROOM_ATTRIBUTE_VALUE: string = 'Revit Pièces';

const LEVEL_ATTRIBUTE_NAME: string = 'category';
const LEVEL_ATTRIBUTE_VALUE: string = 'Revit Level';

const FLOOR_ATTRIBUTE_NAME: string = 'SCtype';
const FLOOR_ATTRIBUTE_VALUE: string = 'Floor_finish';

const ROOM_PROPERTIES: string[] = ['area', 'volume', 'perimeter', 'local', 'etage', 'stype', 'roomid', 'number'];
const FLOOR_PROPERTIES: string[] = [];
const LEVEL_PROPERTIES: string[] = ['roomid'];

const DEFAULT_BUILDINGS_NAME: string[] = ['Default building name'];
const CONTEXT_NAME: string = 'spatial';

interface RevitAttributesObj extends spinal.Model {
  attrName: spinal.Str,
  attrVal: spinal.Str,
}

//Attribute needed to find the elements
export interface RevitAttributes extends spinal.Model {
  room: RevitAttributesObj;// Piece du batiment
  level: RevitAttributesObj;// Etage du batiment
  floors: RevitAttributesObj;// Sol des rooms
}

export interface ObjectProperties extends spinal.Model {
  room: spinal.Lst<spinal.Str>,
  level: spinal.Lst<spinal.Str>,
  floor: spinal.Lst<spinal.Str>,
}


export class SpatialConfig extends Model {
  public contextName: string;
  public buildingName: string[];
  public revitAttribute: RevitAttributes;
  public objectProperties: ObjectProperties;

  constructor() {
    super();

    this.add_attr({
      'contextName': CONTEXT_NAME,
      'buildingName': DEFAULT_BUILDINGS_NAME,
      'revitAttribute': {
        room: { // Piece du batiment
          attrName: 'category',
          attrVal: 'Revit Pièces',
          attrCat: 'Level',

        },
        level: { // Etage du batiment
          attrName: 'category',
          attrVal: 'Revit Level',

        },
        floors: { // sol des rooms
          attrName: 'SCtype',
          attrVal: 'Floor_finish'
        }
      },
      'objectProperties': {
        room: ['area', 'volume', 'perimeter', 'local', 'etage', 'stype', 'roomid', 'number'],
        level: ['elevation'],
        floors: ['roomid']
      },
      'archi': {}
    });
  }

}
