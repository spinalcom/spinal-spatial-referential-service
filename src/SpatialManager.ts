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

import Model = Autodesk.Viewing.Model;
import PropertyResult = Autodesk.Viewing.PropertyResult;
import Property = Autodesk.Viewing.Property;
import GeographicService from 'spinal-env-viewer-context-geographic-service'
// import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service'
import createFctGetArchi from './createFctGetArchi'
import { config } from './Config'
import {
  GEO_REFERENCE_RELATION,
  GEO_REFERENCE_ROOM_RELATION,
  GEO_BUILDING_RELATION,
  GEO_FLOOR_RELATION,
  GEO_ROOM_RELATION,
} from './Constant';

import {
  SpinalContext,
  SpinalNode,
  SpinalGraphService,
  SpinalNodeRef,
  SPINAL_RELATION_PTR_LST_TYPE,
} from "spinal-env-viewer-graph-service";
import { SpatialConfig, IMConfigArchi } from "./models/SpatialConfig";
import { BuildingManager } from "./managers/BuildingManager";
import { FloorManager } from "./managers/FloorManager";
import { RoomManager } from "./managers/RoomManager";
import { consumeBatch } from './utils/consumeBatch';

interface ComparisionObject {
  deleted: {
    levels: object,
    rooms: object,
  },
  updated: {
    levels: object,
    rooms: object,
  },
  new: {
    levels: object,
    rooms: object,
  }
}

export interface ModelArchi {
  [dbId: string]: Level
}
export type LevelRooms = { [externalId: string]: Room }
export type LevelStructures = { [externalId: string]: Structure }

export interface Level {
  properties: Properties,
  children: LevelRooms
  structures: LevelStructures
}

export interface Room {
  properties: Properties,
  children: Properties[]
}
export interface Structure {
  properties: Properties,
}

export interface Properties {
  dbId: number,
  externalId: string,
  properties: SpinalProps[]
}

export interface SpinalProps {
  name: string;
  value: any;
  [type: string]: any;
}

export class SpatialManager {
  // private context: SpinalContext<any>;
  // private contextId: string;
  private spatialConfig: SpatialConfig;
  private buildingManager: BuildingManager;
  private floorManager: FloorManager;
  private roomManager: RoomManager;
  private initialized: Promise<any>;
  private model: Model;
  private modelArchi: ModelArchi;
  private modelArchiLib = new Map<Model, ModelArchi>();

  constructor() {
    //Todo remove
    this.initialized = this.init();
    (<any>window).getArchi = this.getArchiModel.bind(this)
  }

  public init() {
    this.initialized = new Promise<any>(async (resolve, reject) => {
      await SpinalGraphService.waitForInitialization();
      this.spatialConfig = await this.getSpatialConfig();
      if (typeof this.spatialConfig === "undefined")
        reject('SpatialConfiguration undefined');

      // let contextName = "spatial";
      // if (typeof this.spatialConfig.contextName !== "undefined") {
      //   // @ts-ignore
      //   contextName = this.spatialConfig.contextName.get()
      // }
      // this.context = await SpatialManager.getContext(contextName);
      // this.contextId = this.context.info.id.get();
      this.buildingManager = new BuildingManager();
      this.floorManager = new FloorManager();
      this.roomManager = new RoomManager();
      resolve()
    });
    return this.initialized;
  }

  public async generateContext(configName: string, model: Model) {
    try {
      this.model = model;
      await this.init();
      this.modelArchi = await this.getArchiModel(model, configName);
      const config = this.spatialConfig.getConfig(configName)
      config.mod_attr('archi', this.modelArchi);
      let building: any = await this.getBuilding(config);
      if (typeof building !== "undefined" && building.hasOwnProperty('id'))
        building = SpinalGraphService.getRealNode(building.id.get());
      const context = await this.getContextFromConfig(config)
      const contextId = context.getId().get()
      if (typeof building === "undefined") {
        building = await GeographicService.addBuilding(contextId, contextId, config.basic.buildingName);
      } const prom = [];
      for (let key in this.modelArchi) {
        if (this.modelArchi.hasOwnProperty(key) &&
          Object.entries(this.modelArchi[key].children).length !== 0 &&
          this.modelArchi[key].constructor === Object) {
          const level = this.modelArchi[key];

          // prom.push(
          await this.createFloor(contextId, building.info.id.get(),
            this.floorManager.getPropertyValueByName(level.properties.properties, 'name'),
            level, model)
          // )
        }
      }
      await Promise.all(prom);
    } catch (e) {
      console.error(e);
    }
    console.log("generateContext DONE")
  }

  addRoomValueParam(target: SpinalProps[], other: Room) {
    const area = this.roomManager.getPropertyValueByName(other.properties.properties, 'Area')
    const perimeter = this.roomManager.getPropertyValueByName(other.properties.properties, 'Perimeter')
    const volume = this.roomManager.getPropertyValueByName(other.properties.properties, 'Volume')
    for (const targetParam of target) {
      if (targetParam.name === "Area") targetParam.value = round(targetParam.value + area)
      if (targetParam.name === "Perimeter") targetParam.value = round(targetParam.value + perimeter)
      if (targetParam.name === "Volume") targetParam.value = round(targetParam.value + volume)
    }
  }
  addIfExist(array: Room[], room: Room) {
    const roomNuber = this.roomManager.getPropertyValueByName(room.properties.properties, 'Number')
    const target = array.find((e) => {
      return this.roomManager.getPropertyValueByName(e.properties.properties, 'Number') === roomNuber
    })
    if (target) {
      this.addRoomValueParam(target.properties.properties, room)
      return false;
    }
    return true;
  }
  getRoomName(room: Room) {
    const roomNbr = this.roomManager.getPropertyValueByName(room.properties.properties, 'Number')
    const roomName = this.roomManager.getPropertyValueByName(room.properties.properties, 'name');
    return `${roomNbr}-${roomName}`
  }

  async createRooms(rooms: LevelRooms, contextId: string, floorId: string, model: Model) {
    const nodeAttrNames = ['dbId', 'externalId']
    const tmpRoom = [];
    for (let key in rooms) {
      if (rooms.hasOwnProperty(key))
        if (this.addIfExist(tmpRoom, rooms[key])) {
          tmpRoom.push(rooms[key]);
        }
    }

    let proms = [];
    const resolveBatch: SpinalNode<any>[] = [];
    let turn = 0;
    let j = 0;

    while (j < tmpRoom.length) {
      for (j = turn * config.batchSize; j < ((turn + 1) * config.batchSize) && j < tmpRoom.length; j++) {
        const room = tmpRoom[j];
        proms.push(
          GeographicService.addRoom(contextId, floorId, this.getRoomName(room))
        );
      }
      const tmp: SpinalNode<any>[] = await this.waitForFileSystem(proms);
      resolveBatch.push(...tmp);
      turn++;
    }

    for (let i = 0; i < resolveBatch.length; i++) {
      let roomName = resolveBatch[i].info.name.get();
      let room = tmpRoom.find(r => {
        return this.getRoomName(r) === roomName;
      });
      if (typeof room !== "undefined" && typeof room.children !== "undefined") {
        const prom: any[] = [
          this.roomManager.addAttribute(resolveBatch[i], room.properties.properties)
        ]
        for (const child of room.children) {
          const roomAttrName = this.getRoomName(room);
          prom.push(
            this.addReferenceObject(
              child.dbId, roomName, model,
              resolveBatch[i], GEO_REFERENCE_ROOM_RELATION).catch(e => e)
          );

          // prom.push(

          //   // @ts-ignore
          //   window.spinal.BimObjectService.addReferenceObject(
          //     resolveBatch[i].info.id.get(), child.dbId, `Floor of ${roomAttrName}`, model
          //   )
          // )
        }
        await Promise.all(prom);
        // add or set attribut to  dbId & externalId
        for (const nodeAttrName of nodeAttrNames) {
          if (typeof resolveBatch[i].info[nodeAttrName] === "undefined")
            resolveBatch[i].info.add_attr(nodeAttrName, room.properties[nodeAttrName])
          else if (resolveBatch[i].info[nodeAttrName].get() !== room.properties[nodeAttrName]) {
            resolveBatch[i].info[nodeAttrName].set(room.properties[nodeAttrName])
          }
        }
      }
    }
  }

  /**
   * Waits for the nodes to be in the FileSystem.
   * @param {Array<Promise>} promises Array of promises containing the nodes
   * @returns {Promise<any>} An empty promise
   */
  async waitForFileSystem(promises: Promise<any>[]): Promise<any[]> {
    let nodes: any[] = await Promise.all(promises);
    let unResolvedNode = [];
    return new Promise(resolve => {
      let inter = setInterval(() => {
        unResolvedNode = nodes.filter(node => {
          return (<any>window).FileSystem._objects[node._server_id] === undefined;
        });

        if (unResolvedNode.length === 0) {
          clearInterval(inter);
          resolve(nodes);
        }
      }, 500);
    });
  }

  async addReferenceObject(dbId: number, name: string, model: Model, targetNode: SpinalNode<any>,
     relationName = GEO_REFERENCE_RELATION): Promise<SpinalNode<any>> {
    // @ts-ignore
    let bimObj = await window.spinal.BimObjectService.getBIMObject(dbId, model)
    if (typeof bimObj === "undefined") {
      // @ts-ignore
      bimObj = await window.spinal.BimObjectService.createBIMObject(dbId, name, model)
    }
    console.log("addReferenceObject", bimObj);
    if (typeof bimObj.id !== "undefined") {
      // @ts-ignore
      bimObj = window.spinal.spinalGraphService.nodes[bimObj.id.get()];
    }

    const childrenIds = targetNode.getChildrenIds()
    const idx = childrenIds.indexOf(bimObj.info.id.get())
    if (idx !== -1)
      return bimObj;
    return targetNode.addChild(bimObj, relationName, SPINAL_RELATION_PTR_LST_TYPE)
  }


  private async addRefStructureToFloor(floorId: string, structures: LevelStructures, model: Model) {
    const prom = [];
    const fct = (dbId, name, model, targetNode) => {
      return this.addReferenceObject(dbId, name, model, targetNode).catch(e => e)
    }

    try {
      for (const key in structures) {
        if (structures.hasOwnProperty(key)) {
          const objName = this.roomManager.getPropertyValueByName(structures[key].properties.properties, 'name');
          prom.push(fct.bind(this, structures[key].properties.dbId, objName, model,
            // @ts-ignore
            spinal.spinalGraphService.nodes[floorId]))
        }
      }
      await consumeBatch(prom, 10)
    } catch (e) {
      console.error(e);
    }
  }

  createFloor(contextId: string, buildingId: string, name: string, level: Level, model: Model) {
    const floorProps = level.properties;
    const rooms = level.children;
    const structures = level.structures;
    return GeographicService.addFloor(contextId, buildingId, name)
      .then(async floor => {
        floor.info.add_attr({ 'externalId': floorProps.externalId });
        await this.floorManager.addAttribute(floor, floorProps.properties),
          await this.createRooms(rooms, contextId, floor.info.id.get(), model)
        await this.addRefStructureToFloor(floor.info.id.get(), structures, model)
      }).catch(console.error);
  }

  public async updateContext(configName: string, model: Model) {
    this.model = model;
    await this.init();
    const config = this.spatialConfig.getConfig(configName)
    const oldArchi = config.archi.get();
    this.modelArchi = await this.getArchiModel(model, configName);
    const cmpObject = this.compareArchi(oldArchi, this.modelArchi);
    for (let levelId in cmpObject.updated.levels) {
      if (cmpObject.updated.levels.hasOwnProperty(levelId))
        this.updateLevel(config, cmpObject.updated.levels[levelId], model)
    }

    for (let roomId in cmpObject.updated.rooms) {
      if (cmpObject.updated.rooms.hasOwnProperty(roomId))
        this.updateRoom(roomId, cmpObject.updated.rooms[roomId])
    }
    const context = await this.getContextFromConfig(config)
    const contextId = context.getId().get()
    for (let levelId in cmpObject.new.levels) {
      if (cmpObject.new.levels.hasOwnProperty(levelId)) {
        let building: any = await this.getBuilding(config);
        if (typeof building !== "undefined" && building.hasOwnProperty('id'))

          await this.createFloor(contextId, building.id.get(),
            this.floorManager.getPropertyValueByName(cmpObject.new.levels[levelId].properties.properties, 'name'),
            cmpObject.new.levels[levelId].properties.properties,
            model)
      }
      // cmpObject.new.levels[levelId].children, model)
    }

    for (let levelId in cmpObject.new.rooms) {
      if (!cmpObject.new.rooms.hasOwnProperty(levelId))
        continue;
      let level = await this.floorManager.getByExternalId(levelId, SpinalGraphService
        .getContext(GeographicService.constants.FLOOR_REFERENCE_CONTEXT).info.id.get(), GEO_FLOOR_RELATION);
      const proms = [];
      for (let i = 0; i < cmpObject.new.rooms[levelId].length; i++) {
        let room = cmpObject.new.rooms[levelId][i];
        proms.push(
          GeographicService.addRoom(contextId, level.id.get(),
            this.roomManager.getPropertyValueByName(room.properties.properties, 'name')
          ));
      }

      Promise.all(proms).then(console.log)

    }

    for (let levelId in cmpObject.deleted.levels) {
      if (cmpObject.deleted.levels.hasOwnProperty(levelId)) {

      }
    }

    for (let roomId in cmpObject.deleted.rooms) {
      if (cmpObject.deleted.rooms.hasOwnProperty(roomId)) {

        const context = SpinalGraphService
          .getContext(GeographicService.constants.ROOM_REFERENCE_CONTEXT);

        const room = await this.roomManager.getByExternalId(roomId, context.info.id.get(), GEO_ROOM_RELATION);
        await this.removeRoom(room)
      }
    }

  }

  /**
   * remove $room from the floor, the .room context and at it to the invalid
   * context
   * @param room
   */
  removeRoom(room: SpinalNodeRef) {
    return new Promise(async (resolve, reject) => {
      const node = SpinalGraphService.getRealNode(room.id.get());
      const floor = await this.roomManager.getParents(node);

      if (typeof floor !== "undefined") {
        try {
          // @ts-ignore
          await floor.removeChild(node, GEO_ROOM_RELATION, SPINAL_RELATION_PTR_LST_TYPE); // remove the room from the floor
          const roomReferenceContext = SpinalGraphService.getContext(GeographicService.constants.ROOM_REFERENCE_CONTEXT);

          await SpinalGraphService
            .removeChild(
              roomReferenceContext.info.id.get(), node.info.id.get(),
              GEO_ROOM_RELATION, SPINAL_RELATION_PTR_LST_TYPE); //remove the room from .room context
          this.addToInvalidContext(node.info.id.get());
          resolve()
        } catch (e) {
          console.log(e)
          reject(e)
        }
      } else
        resolve()
    })
  }

  async addToInvalidContext(id: string) {
    let context = SpinalGraphService.getContext(".invalid");
    if (typeof context === "undefined")
      context = await SpinalGraphService.addContext('.invalid', 'invalid');
    return SpinalGraphService.addChild(context.info.id.get(), id, 'Invalid', SPINAL_RELATION_PTR_LST_TYPE)
  }

  async getFloorFromRoom(room) {
    console.warn("SpatialManager.getFloorFromRoom doesn't work", room)
    // let parents = await room.getParents();
    // for (let i = 0; i < parents.length; i++) {
    //   if (parents[i].info.type.get() === "geographicFloor")
    //     return parents[i];
    // }
    // return undefined;
  }


  private async updateLevel(config: IMConfigArchi, level: Level, model: Model) {

    const l = await this.findLevel(config, level.properties.externalId);
    await this.floorManager.addAttribute(SpinalGraphService.getRealNode(l.id.get()), level.properties.properties);
    await this.addRefStructureToFloor(l.id.get(), level.structures, model)


    // return this.findLevel(config, level.properties.externalId).then(async l => {
    //   await this.floorManager
    //     .addAttribute(SpinalGraphService.getRealNode(l.id.get()), level.properties.properties);
    // })
    // missing check refObject
  }

  private async updateRoom(externalId: string, room: Room) {
    this.roomManager
      .getByExternalId(externalId,
        SpinalGraphService.getContext(
          GeographicService.constants.ROOM_REFERENCE_CONTEXT).info.id.get(), GEO_ROOM_RELATION)
      .then(r => {
        this.roomManager.addAttribute(SpinalGraphService.getRealNode(r.id.get()), room.properties.properties);
        // @ts-ignore
        SpinalGraphService.modifyNode(r.id.get(), { dbId: room.properties.dbId });
      })
    // missing check refObject
  }

  public compareArchi(oldArchi: ModelArchi, newArchi: ModelArchi): ComparisionObject {
    const comparisionObject: ComparisionObject = {
      deleted: {
        levels: {},
        rooms: {},
      },
      updated: {
        levels: {},
        rooms: {},
      },
      new: {
        levels: {},
        rooms: {},
      }
    };

    for (const levelId in oldArchi) {
      if (!oldArchi.hasOwnProperty(levelId))
        continue;

      const level = oldArchi[levelId];
      if (newArchi.hasOwnProperty(levelId)) { //level update
        comparisionObject.updated.levels[levelId] = newArchi[levelId];
        for (const roomExternal in level.children) {
          if (level.children.hasOwnProperty(roomExternal) && typeof level.children[roomExternal].children !== 'undefined') {
            if (newArchi[levelId].children.hasOwnProperty(roomExternal)
              && typeof newArchi[levelId].children[roomExternal].children !== "undefined") {
              comparisionObject.updated.rooms[roomExternal] = newArchi[levelId].children[roomExternal];
            } else
              comparisionObject.deleted.rooms[roomExternal] = oldArchi[levelId].children[roomExternal];
          }
        }
      } else { //delete floor
        comparisionObject.deleted.levels[levelId] = oldArchi[levelId];
        for (const roomExternal in level.children) { //delete all rooms
          if (level.children.hasOwnProperty(roomExternal)) {
            comparisionObject.deleted.rooms[roomExternal] = oldArchi[levelId].children[roomExternal];
          }
        }
      }
    }

    for (const levelId in newArchi) {
      if (!newArchi.hasOwnProperty(levelId))
        continue;

      const level = newArchi[levelId];
      if (oldArchi.hasOwnProperty(levelId)) { //level already exist
        for (let roomExternal in level.children)
          if (level.children.hasOwnProperty(roomExternal)
            && typeof level.children[roomExternal].children !== 'undefined'
            && (!oldArchi[levelId].children.hasOwnProperty(roomExternal) || typeof oldArchi[levelId].children[roomExternal].children === "undefined")
          ) {
            if (typeof comparisionObject.new.rooms[level.properties.externalId] === "undefined")
              comparisionObject.new.rooms[level.properties.externalId] = [];
            comparisionObject.new.rooms[level.properties.externalId].push(level.children[roomExternal]);
          }
      } else { //add level and rooms to new
        comparisionObject.new.levels[levelId] = level;
        for (let roomExternal in level.children)
          if (level.children.hasOwnProperty(roomExternal)
            && typeof level.children[levelId].children !== 'undefined') //add room if it has a floor
          {
            if (typeof comparisionObject.new.rooms[level.properties.externalId] === "undefined")
              comparisionObject.new.rooms[level.properties.externalId] = [];
            comparisionObject.new.rooms[level.properties.externalId].push(level.children[roomExternal]);
          }
      }
    }
    return comparisionObject;
  }

  private static async getContext(contextName: string) {
    let context = SpinalGraphService.getContext(contextName);
    if (typeof context === "undefined" || context === null) {
      context = await GeographicService.createContext(contextName);
    }
    return context;
  }

  async getSpatialConfig(): Promise<SpatialConfig> {
    let context = SpinalGraphService.getContext('.config');
    if (typeof context === "undefined")
      context = await SpinalGraphService.addContext('.config',
        'system configuration', undefined);
    return SpinalGraphService.getChildren(context.info.id.get(), ['hasConfig'])
      .then(async children => {
        let config;
        if (typeof children !== "undefined")
          for (let i = 0; i < children.length; i++) {
            if (children[i].type.get() === 'SpatialConfig')
              config = children[i];
          }

        if (typeof config === "undefined") { // create default config
          config = SpinalGraphService.createNode({
            name: 'spatial config',
            type: 'SpatialConfig'
          }, new SpatialConfig());

          await SpinalGraphService
            .addChild(context.info.id.get(), config,
              'hasConfig', SPINAL_RELATION_PTR_LST_TYPE);
          config = SpinalGraphService.getNode(config);
        }
        return config.element.load();
      })
  }

  /**
   * use propertyDb to create a representation of the architecture of the model
   * @private
   * @param {Model} model
   * @returns {Promise<ModelArchi>}
   * @memberof SpatialManager
   */
  private async getArchiModel(model: Model, configName: string): Promise<ModelArchi> {
    if (this.modelArchiLib.has(model)) return this.modelArchiLib.get(model);
    //TODO une fois sur la version 7 du viewer la fonction
    // executerUserFonction permetera de passer des parametre a userFunction
    this.spatialConfig = await this.getSpatialConfig();
    // let objectProperties = this.spatialConfig.objectProperties.get();
    // let floorAttrn = this.spatialConfig.revitAttribute.floors.attrName.get();

    const config = this.spatialConfig.getConfig(configName);
    if (!config) throw new Error('No Config Name found')
    const fct = createFctGetArchi(config.get())
    // @ts-ignore
    const modelArchi: ModelArchi = await model.getPropertyDb().executeUserFunction(fct);

    console.log("modelArchi", modelArchi)

    this.modelArchiLib.set(model, modelArchi)
    return modelArchi;

  }

  private async findLevel(config: IMConfigArchi, externalId: string): Promise<SpinalNodeRef> {
    const building = await this.getBuilding(config);
    return this.floorManager.getByExternalId(externalId, building.id.get(), GEO_FLOOR_RELATION);
  }

  async getContextFromConfig(config: IMConfigArchi): Promise<SpinalContext<any>> {
    let context = SpinalGraphService.getRealNode(config.contextId.get());

    if (typeof context === "undefined" || context === null) {
      context = SpinalGraphService.getContext(config.contextName.get());
    }
    if (typeof context === "undefined" || context === null) {
      context = await GeographicService.createContext(config.contextName.get());
    }
    config.contextId.set(context.info.id.get());
    return context;
  }

  private async getBuilding(config: IMConfigArchi): Promise<SpinalNodeRef> {
    const context = await this.getContextFromConfig(config)
    return SpinalGraphService
      .getChildren(context.info.id.get(), [GEO_BUILDING_RELATION])
      .then(children => {
        if (typeof children === 'undefined')
          return undefined;
        for (let i = 0; i < children.length; i++) {
          const building = children[i];
          if (building.name.get() === config.basic.buildingName.get())
            return building;
        }
        return undefined;
      })
  }

  public async getFloorFinish(configName: string, model: Model): Promise<Properties[]> {
    this.modelArchi = await this.getArchiModel(model, configName);
    const floorFinish: Properties[] = [];
    for (let key in this.modelArchi) {
      if (this.modelArchi.hasOwnProperty(key)) {
        for (let roomId in this.modelArchi[key].children) {
          if (this.modelArchi[key].children.hasOwnProperty(roomId)) {
            const room = this.modelArchi[key].children[roomId];
            if (typeof room.children !== "undefined")
              floorFinish.push(...room.children)
          }
        }
      }
    }
    return floorFinish;
  }

  async getRoomIdFromDbId(externalId: string) {
    const roomReferenceContext = SpinalGraphService
      .getContext(GeographicService.constants.ROOM_REFERENCE_CONTEXT);
    const rooms = await SpinalGraphService
      .getChildren(roomReferenceContext.info.id.get(),
        [GEO_ROOM_RELATION]);

    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].externalId.get() === externalId) {
        return rooms[i].id.get();
      }
    }
  }

  public getRoomIdFromFloorFinish(floorId: number) {
    for (let key in this.modelArchi) {
      if (this.modelArchi.hasOwnProperty(key)) {
        for (let roomId in this.modelArchi[key].children) {
          if (this.modelArchi[key].children.hasOwnProperty(roomId)) {
            const room = this.modelArchi[key].children[roomId];
            if (typeof room.children !== "undefined")
              for (const roomChild of room.children) {
                if (roomChild.dbId === floorId)
                  return room.properties.externalId;
              }
          }
        }
      }
    }
  }

  public async getFloorFinishId(configName: string, model: Model) {
    const floors = await this.getFloorFinish(configName, model);
    return floors.map(floor => floor.dbId);
  }


}


function round(x, digits = 2) {
  return parseFloat(x.toFixed(digits))
}
