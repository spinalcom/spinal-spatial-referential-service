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
const CONTEXT_NAME: string = 'Spatial';

//Attribute needed to find the elements
export interface RevitAttributes {
  room: { // Piece du batiment
    attrName: string,
    attrVal: string,
  },
  level: { // Etage du batiment
    attrName: string,
    attrVal: string,
  },
  floor: { // Sol des rooms
    attrName: string,
    attrVal: string,

  }
}


export interface ObjectProperties {
  room: string[],
  level: string[],
  floor: string[]
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
