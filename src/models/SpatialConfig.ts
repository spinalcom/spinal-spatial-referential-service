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

import spinalCore, { Model, Lst } from "spinal-core-connectorjs_type";

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
const DEFAULT_CONFIG_NAME = 'default';

// interface RevitAttributesObj extends spinal.Model {
//   attrName: spinal.Str,
//   attrVal: spinal.Str,
// }

//Attribute needed to find the elements
// export interface RevitAttributes extends spinal.Model {
//   room: RevitAttributesObj;// Piece du batiment
//   level: RevitAttributesObj;// Etage du batiment
//   floors: RevitAttributesObj;// Sol des rooms
// }

// export interface ObjectProperties extends spinal.Model {
//   room: spinal.Lst<spinal.Str>,
//   level: spinal.Lst<spinal.Str>,
//   floor: spinal.Lst<spinal.Str>,
// }
export interface IMBasic extends spinal.Model {
  addLevel: spinal.Bool;
  buildingName: spinal.Str;
  selectedModel: spinal.Str;
}

export interface IMArchiSelect extends spinal.Model {
  key: spinal.Str;
  value: spinal.Str;
  isCat?: spinal.Bool;
}

export interface IMConfigArchi extends spinal.Model {
  configName: spinal.Str;
  contextName: spinal.Str;
  contextId: spinal.Str;
  basic: IMBasic;
  levelSelect: IMArchiSelect[];
  roomSelect: IMArchiSelect[];
  structureSelect: IMArchiSelect[];
  floorSelect?: IMArchiSelect[];
  floorRoomNbr: spinal.Str;
  floorRoomName?: spinal.Str;
  floorLevelName?: spinal.Str;
}

export interface Basic {
  addLevel: boolean;
  buildingName: string;
  selectedModel: string;
}

export interface ArchiSelect {
  key: string;
  value: string;
  isCat?: boolean;
}

export interface ConfigArchi {
  configName: string;
  contextName: string;
  contextId: string;
  basic: Basic;
  levelSelect: ArchiSelect[];
  roomSelect: ArchiSelect[];
  structureSelect: ArchiSelect[];
  floorSelect?: ArchiSelect[];
  floorRoomNbr: string;
  floorRoomName?: string;
  floorLevelName?: string;
  archi?: any;
}


export class SpatialConfig extends Model {
  public data: spinal.Lst<IMConfigArchi>

  constructor() {
    super();
    this.add_attr({
      data: [{
        configName: DEFAULT_CONFIG_NAME,
        contextName: CONTEXT_NAME,
        contextId: '',
        basic: { "addLevel": false, "buildingName": "Building", "selectedModel": "" },
        levelSelect: [{ "key": '/^Category$/', "value": '/^Revit Level$/', "isCat": true }],
        roomSelect: [{ "key": '/^Category$/', "value": '/^Revit Pièces$/', "isCat": true }],
        structureSelect: [
          { "key": '/^Category$/', "value": '/^Revit Murs$/', "isCat": true },
          { "key": '/^Category$/', "value": '/^Revit Portes$/', "isCat": true },
          { "key": '/^Category$/', "value": '/^Revit Sols$/', "isCat": true },
          { "key": '/^Category$/', "value": '/^Revit Garde-corps$/', "isCat": true },
          { "key": '/^Category$/', "value": '/^Revit Fenêtres$/', "isCat": true }
        ],
        floorRoomNbr: 'Number',
        floorSelect: [{ key: "/^Nom du type$/", value: "/^Finition de sol$/" }]
      }]
    });
  }

  saveConfig(config: ConfigArchi) {
    for (var i = 0; i < this.data.length; i++) {
      const item = this.data[i];
      if (item.configName.get() === config.configName) {
        const contextId = item.contextId;
        const contextName = item.contextName;
        const archi = item.archi;
        item.set(config);
        if (contextId) item.mod_attr('contextId', contextId);
        if (contextName) item.mod_attr('contextName', contextName);
        if (archi) item.mod_attr('archi', archi);
      }
    }
  }
  getConfig(configName: string): IMConfigArchi {
    for (var i = 0; i < this.data.length; i++) {
      const item = this.data[i];
      if (item.configName.get() === configName) {
        return item
      }
    }
  }

  getConfigFromContextId(contextId: string): IMConfigArchi {
    for (var i = 0; i < this.data.length; i++) {
      const item = this.data[i];
      if (item.contextId.get() === contextId) {
        return item
      }
    }
  }
}

spinalCore.register_models(SpatialConfig)
