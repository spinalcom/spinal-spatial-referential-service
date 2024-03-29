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
import GeographicService from 'spinal-env-viewer-context-geographic-service';
// import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service'
import createFctGetArchi from './createFctGetArchi';
import { config } from './Config';
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
} from 'spinal-env-viewer-graph-service';
import { SpatialConfig, IMConfigArchi } from './models/SpatialConfig';
import { BuildingManager } from './managers/BuildingManager';
import { FloorManager } from './managers/FloorManager';
import { RoomManager } from './managers/RoomManager';
import { consumeBatch } from './utils/consumeBatch';

export * from './interfaces';
import {
  ComparisionObject,
  ModelArchi,
  LevelRooms,
  LevelStructures,
  Level,
  Room,
  Structure,
  SpinalProps,
} from './interfaces';

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
    (<any>window).getArchi = this.getArchiModel.bind(this);
  }

  public init(): Promise<void> {
    this.initialized = new Promise<void>(async (resolve, reject) => {
      await SpinalGraphService.waitForInitialization();
      this.spatialConfig = await this.getSpatialConfig();
      if (typeof this.spatialConfig === 'undefined')
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
      resolve();
    });
    return this.initialized;
  }

  public async generateContext(configName: string, model: Model) {
    try {
      this.model = model;
      await this.init();
      this.modelArchi = await this.getArchiModel(model, configName);
      const config = this.spatialConfig.getConfig(configName);
      config.mod_attr('archi', this.modelArchi);
      let building: any = await this.getBuilding(config);
      if (typeof building !== 'undefined' && building.hasOwnProperty('id'))
        building = SpinalGraphService.getRealNode(building.id.get());
      const context = await this.getContextFromConfig(config);
      const contextId = context.getId().get();
      if (typeof building === 'undefined') {
        building = await GeographicService.addBuilding(
          contextId,
          contextId,
          config.basic.buildingName.get()
        );
      }
      const prom = [];
      for (const key in this.modelArchi) {
        if (
          this.modelArchi.hasOwnProperty(key) &&
          Object.entries(this.modelArchi[key].children).length !== 0 &&
          this.modelArchi[key].constructor === Object
        ) {
          const level = this.modelArchi[key];
          const buildingName = this.floorManager.getPropertyValueByName(
            level.properties.properties,
            'name'
          );
          // prom.push(
          await this.createFloor(
            contextId,
            building.info.id.get(),
            buildingName,
            level,
            model
          );
          // )
        }
      }
      await Promise.all(prom);
    } catch (e) {
      console.error(e);
    }
    console.log('generateContext DONE');
  }

  addRoomValueParam(target: SpinalProps[], other: Room) {
    const area = this.roomManager.getPropertyValueByName(
      other.properties.properties,
      'Area'
    );
    const perimeter = this.roomManager.getPropertyValueByName(
      other.properties.properties,
      'Perimeter'
    );
    const volume = this.roomManager.getPropertyValueByName(
      other.properties.properties,
      'Volume'
    );
    for (const targetParam of target) {
      if (targetParam.name === 'Area')
        targetParam.value = round(targetParam.value + area);
      if (targetParam.name === 'Perimeter')
        targetParam.value = round(targetParam.value + perimeter);
      if (targetParam.name === 'Volume')
        targetParam.value = round(targetParam.value + volume);
    }
  }
  addIfExist(array: Room[], room: Room) {
    const roomNuber = this.roomManager.getPropertyValueByName(
      room.properties.properties,
      'Number'
    );
    const target = array.find((e) => {
      return (
        this.roomManager.getPropertyValueByName(
          e.properties.properties,
          'Number'
        ) === roomNuber
      );
    });
    if (target) {
      this.addRoomValueParam(target.properties.properties, room);
      return false;
    }
    return true;
  }
  getRoomName(room: Room) {
    const roomNbr = this.roomManager.getPropertyValueByName(
      room.properties.properties,
      'Number'
    );
    const roomName = this.roomManager.getPropertyValueByName(
      room.properties.properties,
      'name'
    );
    return `${roomNbr}-${roomName}`;
  }

  async createRooms(
    rooms: LevelRooms,
    contextId: string,
    floorId: string,
    model: Model
  ) {
    const nodeAttrNames = ['dbId', 'externalId'];
    const tmpRoom = [];
    for (const key in rooms) {
      if (rooms.hasOwnProperty(key))
        if (this.addIfExist(tmpRoom, rooms[key])) {
          tmpRoom.push(rooms[key]);
        }
    }

    const proms = [];
    const resolveBatch: SpinalNode<any>[] = [];
    let turn = 0;
    let j = 0;

    while (j < tmpRoom.length) {
      for (
        j = turn * config.batchSize;
        j < (turn + 1) * config.batchSize && j < tmpRoom.length;
        j++
      ) {
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
      const roomName = resolveBatch[i].info.name.get();
      const room = tmpRoom.find((r) => {
        return this.getRoomName(r) === roomName;
      });
      if (typeof room !== 'undefined' && typeof room.children !== 'undefined') {
        const prom: any[] = [
          this.roomManager.addAttribute(
            resolveBatch[i],
            room.properties.properties
          ),
        ];
        for (const child of room.children) {
          const objName = this.roomManager.getPropertyValueByName(
            child.properties,
            'name'
          );
          prom.push(
            this.addReferenceObject(
              child.dbId,
              objName,
              model,
              resolveBatch[i],
              GEO_REFERENCE_ROOM_RELATION
            ).catch((e) => e)
          );
        }
        await Promise.all(prom);
        // add or set attribut to  dbId & externalId
        for (const nodeAttrName of nodeAttrNames) {
          if (typeof resolveBatch[i].info[nodeAttrName] === 'undefined')
            resolveBatch[i].info.add_attr(
              nodeAttrName,
              room.properties[nodeAttrName]
            );
          else if (
            resolveBatch[i].info[nodeAttrName].get() !==
            room.properties[nodeAttrName]
          ) {
            resolveBatch[i].info[nodeAttrName].set(
              room.properties[nodeAttrName]
            );
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
    const nodes: any[] = await Promise.all(promises);
    let unResolvedNode = [];
    return new Promise((resolve) => {
      const inter = setInterval(() => {
        unResolvedNode = nodes.filter((node) => {
          return (
            (<any>window).FileSystem._objects[node._server_id] === undefined
          );
        });

        if (unResolvedNode.length === 0) {
          clearInterval(inter);
          resolve(nodes);
        }
      }, 500);
    });
  }

  async addReferenceObject(
    dbId: number,
    name: string,
    model: Model,
    targetNode: SpinalNode<any>,
    relationName = GEO_REFERENCE_RELATION
  ): Promise<SpinalNode<any>> {
    // @ts-ignore
    let bimObj = await window.spinal.BimObjectService.getBIMObject(dbId, model);
    if (typeof bimObj === 'undefined') {
      // @ts-ignore
      bimObj = await window.spinal.BimObjectService.createBIMObject(
        dbId,
        name,
        model
      );
    }
    if (typeof bimObj.id !== 'undefined') {
      // @ts-ignore
      bimObj = window.spinal.spinalGraphService.nodes[bimObj.id.get()];
    }

    const childrenIds = targetNode.getChildrenIds();
    const idx = childrenIds.indexOf(bimObj.info.id.get());
    if (idx !== -1) return bimObj;
    return targetNode.addChild(
      bimObj,
      relationName,
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }

  private async addRefStructureToLevel(
    levelId: string,
    structures: LevelStructures,
    model: Model
  ) {
    const prom = [];
    const fct = (dbId, name, model, targetNode) => {
      return this.addReferenceObject(dbId, name, model, targetNode).catch(
        (e) => e
      );
    };

    try {
      for (const key in structures) {
        if (structures.hasOwnProperty(key)) {
          const objName = this.roomManager.getPropertyValueByName(
            structures[key].properties.properties,
            'name'
          );
          prom.push(
            fct.bind(
              this,
              structures[key].properties.dbId,
              objName,
              model,
              // @ts-ignore
              spinal.spinalGraphService.nodes[levelId]
            )
          );
        }
      }
      await consumeBatch(prom, 10);
    } catch (e) {
      console.error(e);
    }
  }
  private async addRefStructureToRoom(
    levelId: string,
    structures: Structure[],
    model: Model
  ) {
    const prom = [];
    const fct = (dbId, name, model, targetNode) => {
      return this.addReferenceObject(
        dbId,
        name,
        model,
        targetNode,
        GEO_REFERENCE_ROOM_RELATION
      ).catch((e) => e);
    };

    try {
      for (const structure of structures) {
        let props: any;
        let strucdbId: any;
        if (typeof structure.properties.properties === 'undefined') {
          props = structure.properties;
          // @ts-ignore
          strucdbId = structure.dbId;
        } else {
          props = structure.properties.properties;
          strucdbId = structure.properties.dbId;
        }

        const objName = this.roomManager.getPropertyValueByName(props, 'name');
        prom.push(
          fct.bind(
            this,
            strucdbId,
            objName,
            model,
            // @ts-ignore
            spinal.spinalGraphService.nodes[levelId]
          )
        );
      }
      await consumeBatch(prom, 10);
    } catch (e) {
      console.error(e);
    }
  }
  async createFloor(
    contextId: string,
    buildingId: string,
    name: string,
    level: Level,
    model: Model
  ) {
    const floorProps = level.properties;
    const rooms = level.children;
    const structures = level.structures;
    try {
      const floor = await GeographicService.addFloor(
        contextId,
        buildingId,
        name
      );
      floor.info.add_attr({ externalId: floorProps.externalId });
      await this.floorManager.addAttribute(floor, floorProps.properties);
      await this.createRooms(rooms, contextId, floor.info.id.get(), model);
      await this.addRefStructureToLevel(floor.info.id.get(), structures, model);
    } catch (e) {
      console.error(e);
    }
  }

  public async updateContext(configName: string, model: Model) {
    try {
      this.model = model;
      await this.init();
      this.modelArchi = await this.getArchiModel(model, configName);
      const config = this.spatialConfig.getConfig(configName);
      const oldArchi = config.archi.get();

      let building: any = await this.getBuilding(config);
      if (typeof building !== 'undefined' && building.hasOwnProperty('id'))
        building = SpinalGraphService.getRealNode(building.id.get());
      const cmpObject = this.compareArchi(oldArchi, this.modelArchi);
      const context = await this.getContextFromConfig(config);
      const contextId = context.getId().get();

      for (const levelId in cmpObject.updated.levels) {
        if (cmpObject.updated.levels.hasOwnProperty(levelId))
          await this.updateLevel(
            building,
            cmpObject.updated.levels[levelId],
            model
          );
      }

      for (const roomId in cmpObject.updated.rooms) {
        if (cmpObject.updated.rooms.hasOwnProperty(roomId)) {
          const levelId = cmpObject.updated.rooms[roomId].levelId;
          const room = cmpObject.updated.rooms[roomId].room;
          await this.updateRoom(building, levelId, room, model);
        }
      }

      for (const levelId in cmpObject.new.rooms) {
        if (!cmpObject.new.rooms.hasOwnProperty(levelId)) continue;
        const level = await this.findLevel(building, levelId);
        const proms = [];
        for (let i = 0; i < cmpObject.new.rooms[levelId].length; i++) {
          const room = cmpObject.new.rooms[levelId][i];
          proms.push(
            this.updateContextCreateRoom(contextId, room, level, model)

            // GeographicService.addRoom(contextId, level.id.get(),
            //   this.roomManager.getPropertyValueByName(room.properties.properties, 'name')
            // )
          );
        }
        await Promise.all(proms).then(console.log);
      }

      // for (let levelId in cmpObject.deleted.levels) {
      //   if (cmpObject.deleted.levels.hasOwnProperty(levelId)) {
      //   }
      // }

      for (const roomId in cmpObject.deleted.rooms) {
        if (cmpObject.deleted.rooms.hasOwnProperty(roomId)) {
          const levelId = cmpObject.deleted.rooms[roomId].levelId;
          const room = cmpObject.deleted.rooms[roomId].room;
          const levelRef = await this.findLevel(building, levelId);
          const roomRef = await this.findRoom(
            building,
            levelId,
            room.properties.externalId
          );
          await this.removeRoom(levelRef, roomRef);
        }
      }
      config.mod_attr('archi', this.modelArchi);
    } catch (e) {
      console.error(e);
    }
    console.log('generateContext DONE');
  }

  async updateContextCreateRoom(
    contextId: string,
    room: Room,
    level: SpinalNodeRef,
    model: Model
  ) {
    const nodeAttrNames = ['dbId', 'externalId'];
    const roomRealNode: SpinalNode<any> = await GeographicService.addRoom(
      contextId,
      level.id.get(),
      this.roomManager.getPropertyValueByName(
        room.properties.properties,
        'name'
      )
    );
    if (typeof room !== 'undefined' && typeof room.children !== 'undefined') {
      const prom: any[] = [
        this.roomManager.addAttribute(roomRealNode, room.properties.properties),
      ];
      for (const child of <any>room.children) {
        const objName = this.roomManager.getPropertyValueByName(
          child.properties,
          'name'
        );
        prom.push(
          this.addReferenceObject(
            child.dbId,
            objName,
            model,
            roomRealNode,
            GEO_REFERENCE_ROOM_RELATION
          ).catch((e) => e)
        );
      }
      await Promise.all(prom);
      // add or set attribut to  dbId & externalId
      for (const nodeAttrName of nodeAttrNames) {
        if (typeof roomRealNode.info[nodeAttrName] === 'undefined')
          roomRealNode.info.add_attr(
            nodeAttrName,
            room.properties[nodeAttrName]
          );
        else if (
          roomRealNode.info[nodeAttrName].get() !==
          room.properties[nodeAttrName]
        ) {
          roomRealNode.info[nodeAttrName].set(room.properties[nodeAttrName]);
        }
      }
    }
  }

  /**
   * remove $room from the floor, the .room context and at it to the invalid
   * context
   * @param room
   */
  async removeRoom(levelRef: SpinalNodeRef, roomRef: SpinalNodeRef) {
    const room = SpinalGraphService.getRealNode(roomRef.id.get());
    const floor = SpinalGraphService.getRealNode(levelRef.id.get());
    await floor.removeChild(
      room,
      GEO_ROOM_RELATION,
      SPINAL_RELATION_PTR_LST_TYPE
    ); // remove the room from the floor
    const roomReferenceContext = SpinalGraphService.getContext(
      GeographicService.constants.ROOM_REFERENCE_CONTEXT
    );
    await SpinalGraphService.removeChild(
      roomReferenceContext.info.id.get(),
      room.info.id.get(),
      GEO_ROOM_RELATION,
      SPINAL_RELATION_PTR_LST_TYPE
    );
    await this.addToInvalidContext(room.info.id.get());
  }

  async addToInvalidContext(id: string) {
    let context = SpinalGraphService.getContext('.invalid');
    if (typeof context === 'undefined')
      context = await SpinalGraphService.addContext('.invalid', 'invalid');
    return SpinalGraphService.addChild(
      context.info.id.get(),
      id,
      'Invalid',
      SPINAL_RELATION_PTR_LST_TYPE
    );
  }

  async getFloorFromRoom(room) {
    console.warn("SpatialManager.getFloorFromRoom doesn't work", room);
    // let parents = await room.getParents();
    // for (let i = 0; i < parents.length; i++) {
    //   if (parents[i].info.type.get() === "geographicFloor")
    //     return parents[i];
    // }
    // return undefined;
  }

  private async updateLevel(
    building: SpinalNode<any>,
    level: Level,
    model: Model
  ) {
    // @ts-ignore
    SpinalGraphService._addNode(building);
    const levelNodeRef = await this.findLevel(
      building,
      level.properties.externalId
    );
    const levelId = levelNodeRef.id.get();
    const levelRealNode = SpinalGraphService.getRealNode(levelId);
    await this.floorManager.addAttribute(
      levelRealNode,
      level.properties.properties
    );
    await this.addRefStructureToLevel(levelId, level.structures, model);
  }

  private async updateRoom(
    building: SpinalNode<any>,
    levelExternId: string,
    room: Room,
    model: Model
  ) {
    // @ts-ignore
    SpinalGraphService._addNode(building);
    const roomNodeRef = await this.findRoom(
      building,
      levelExternId,
      room.properties.externalId
    );
    const roomId = roomNodeRef.id.get();
    const roomRealNode = SpinalGraphService.getRealNode(roomId);
    await this.roomManager.addAttribute(
      roomRealNode,
      room.properties.properties
    );
    if (typeof roomRealNode.info.dbId !== 'undefined') {
      roomRealNode.info.dbId.set(room.properties.dbId);
    } else {
      roomRealNode.info.add_attr('dbId', room.properties.dbId);
    }
    // missing check refObject
    await this.addRefStructureToRoom(roomId, room.children, model);
  }

  // private async updateRoom(externalId: string, room: Room) {
  //   this.roomManager
  //     .getByExternalId(externalId,
  //       SpinalGraphService.getContext(
  //         GeographicService.constants.ROOM_REFERENCE_CONTEXT).info.id.get(), GEO_ROOM_RELATION)
  //     .then(r => {
  //       this.roomManager.addAttribute(SpinalGraphService.getRealNode(r.id.get()), room.properties.properties);
  //       // @ts-ignore
  //       SpinalGraphService.modifyNode(r.id.get(), { dbId: room.properties.dbId });
  //     })
  //   // missing check refObject
  // }

  createRoomObj(levelId: string, room: Room) {
    return { levelId, room };
  }

  public compareArchi(
    oldArchi: ModelArchi,
    newArchi: ModelArchi
  ): ComparisionObject {
    const cmpObj = {
      deleted: { levels: {}, rooms: {} },
      updated: { levels: {}, rooms: {} },
      new: { levels: {}, rooms: {} },
    };

    for (const levelId in oldArchi) {
      const oldLevel = oldArchi[levelId];
      if (newArchi.hasOwnProperty(levelId)) {
        // level exist in old and new => level update
        const newArchiLvl = newArchi[levelId];
        for (const roomExternId in oldLevel.children) {
          if (
            oldLevel.children.hasOwnProperty(roomExternId) &&
            typeof oldLevel.children[roomExternId].children !== 'undefined'
          ) {
            // exist in old and have children
            cmpObj.updated.levels[levelId] = newArchiLvl;
            const levelExternalId = newArchiLvl.properties.externalId;
            if (
              newArchiLvl.children[roomExternId] &&
              newArchiLvl.children[roomExternId].children
            ) {
              cmpObj.updated.rooms[roomExternId] = this.createRoomObj(
                levelExternalId,
                newArchiLvl.children[roomExternId]
              );
            } else {
              cmpObj.deleted.rooms[roomExternId] = this.createRoomObj(
                levelExternalId,
                oldLevel.children[roomExternId]
              );
            }
          }
        }
      } else {
        //delete floor
        cmpObj.deleted.levels[levelId] = oldArchi[levelId];
        for (const roomExternId in oldLevel.children) {
          //delete all rooms
          if (oldLevel.children.hasOwnProperty(roomExternId)) {
            const levelExternalId = oldLevel.properties.externalId;
            cmpObj.deleted.rooms[roomExternId] = this.createRoomObj(
              levelExternalId,
              oldArchi[levelId].children[roomExternId]
            );
          }
        }
      }
    }

    for (const levelId in newArchi) {
      if (!newArchi.hasOwnProperty(levelId)) {
        continue;
      }
      const newLevel = newArchi[levelId];
      if (oldArchi.hasOwnProperty(levelId)) {
        //level already exist
        for (const roomExternal in newLevel.children) {
          if (
            newLevel.children.hasOwnProperty(roomExternal) &&
            typeof newLevel.children[roomExternal].children !== 'undefined' &&
            (!oldArchi[levelId].children.hasOwnProperty(roomExternal) ||
              typeof oldArchi[levelId].children[roomExternal].children ===
                'undefined')
          ) {
            const lvlExternId = newLevel.properties.externalId;
            if (typeof cmpObj.new.rooms[lvlExternId] === 'undefined') {
              cmpObj.new.rooms[lvlExternId] = [];
            }
            cmpObj.new.rooms[lvlExternId].push(newLevel.children[roomExternal]);
          }
        }
      } else {
        //add level and rooms to new
        cmpObj.new.levels[levelId] = newLevel;
        for (const roomExternal in newLevel.children) {
          if (
            newLevel.children.hasOwnProperty(roomExternal) &&
            typeof newLevel.children[levelId].children !== 'undefined'
          ) {
            //add room if it has a floor
            const lvlExternId = newLevel.properties.externalId;
            if (typeof cmpObj.new.rooms[lvlExternId] === 'undefined') {
              cmpObj.new.rooms[lvlExternId] = [];
            }
            cmpObj.new.rooms[lvlExternId].push(newLevel.children[roomExternal]);
          }
        }
      }
    }
    return cmpObj;
  }

  private static async getContext(contextName: string) {
    let context = SpinalGraphService.getContext(contextName);
    if (typeof context === 'undefined' || context === null) {
      context = await GeographicService.createContext(contextName);
    }
    return context;
  }

  async getSpatialConfig(): Promise<SpatialConfig> {
    let context = SpinalGraphService.getContext('.config');
    if (typeof context === 'undefined')
      context = await SpinalGraphService.addContext(
        '.config',
        'system configuration',
        undefined
      );
    return SpinalGraphService.getChildren(context.info.id.get(), [
      'hasConfig',
    ]).then(async (children) => {
      let config;
      if (typeof children !== 'undefined')
        for (let i = 0; i < children.length; i++) {
          if (children[i].type.get() === 'SpatialConfig') config = children[i];
        }

      if (typeof config === 'undefined') {
        // create default config
        config = SpinalGraphService.createNode(
          {
            name: 'spatial config',
            type: 'SpatialConfig',
          },
          new SpatialConfig()
        );

        await SpinalGraphService.addChild(
          context.info.id.get(),
          config,
          'hasConfig',
          SPINAL_RELATION_PTR_LST_TYPE
        );
        config = SpinalGraphService.getNode(config);
      }
      return config.element.load();
    });
  }

  /**
   * use propertyDb to create a representation of the architecture of the model
   * @private
   * @param {Model} model
   * @returns {Promise<ModelArchi>}
   * @memberof SpatialManager
   */
  private async getArchiModel(
    model: Model,
    configName: string
  ): Promise<ModelArchi> {
    if (this.modelArchiLib.has(model)) return this.modelArchiLib.get(model);
    //TODO une fois sur la version 7 du viewer la fonction
    // executerUserFonction permetera de passer des parametre a userFunction
    this.spatialConfig = await this.getSpatialConfig();
    // let objectProperties = this.spatialConfig.objectProperties.get();
    // let floorAttrn = this.spatialConfig.revitAttribute.floors.attrName.get();

    const config = this.spatialConfig.getConfig(configName);
    if (!config) throw new Error('No Config Name found');
    const fct = createFctGetArchi(config.get());
    const modelArchi: ModelArchi = await model
      .getPropertyDb()
      // @ts-ignore
      .executeUserFunction(fct);

    console.log('modelArchi', modelArchi);

    this.modelArchiLib.set(model, modelArchi);
    return modelArchi;
  }

  private findLevel(
    building: SpinalNode<any>,
    externalId: string
  ): Promise<SpinalNodeRef> {
    return this.floorManager.getByExternalId(
      externalId,
      building.info.id.get(),
      GEO_FLOOR_RELATION
    );
  }

  private async findRoom(
    building: SpinalNode<any>,
    floorExternId: string,
    roomExternId: string
  ): Promise<SpinalNodeRef> {
    const level = await this.findLevel(building, floorExternId);
    return this.roomManager.getByExternalId(
      roomExternId,
      level.id.get(),
      GEO_ROOM_RELATION
    );
  }

  async getContextFromConfig(
    config: IMConfigArchi
  ): Promise<SpinalContext<any>> {
    let context = SpinalGraphService.getRealNode(config.contextId.get());

    if (typeof context === 'undefined' || context === null) {
      context = SpinalGraphService.getContext(config.contextName.get());
    }
    if (typeof context === 'undefined' || context === null) {
      context = await GeographicService.createContext(config.contextName.get());
    }
    config.contextId.set(context.info.id.get());
    return context;
  }

  private async getBuilding(config: IMConfigArchi): Promise<SpinalNodeRef> {
    const context = await this.getContextFromConfig(config);
    return SpinalGraphService.getChildren(context.info.id.get(), [
      GEO_BUILDING_RELATION,
    ]).then((children) => {
      if (typeof children === 'undefined') return undefined;
      for (let i = 0; i < children.length; i++) {
        const building = children[i];
        if (building.name.get() === config.basic.buildingName.get())
          return building;
      }
      return undefined;
    });
  }

  public async getFloorFinish(
    configName: string,
    model: Model
  ): Promise<Structure[]> {
    this.modelArchi = await this.getArchiModel(model, configName);
    const floorFinish: Structure[] = [];
    for (const key in this.modelArchi) {
      if (this.modelArchi.hasOwnProperty(key)) {
        for (const roomId in this.modelArchi[key].children) {
          if (this.modelArchi[key].children.hasOwnProperty(roomId)) {
            const room = this.modelArchi[key].children[roomId];
            if (typeof room.children !== 'undefined')
              floorFinish.push(...room.children);
          }
        }
      }
    }
    return floorFinish;
  }

  async getRoomIdFromDbId(externalId: string) {
    const roomReferenceContext = SpinalGraphService.getContext(
      GeographicService.constants.ROOM_REFERENCE_CONTEXT
    );
    const rooms = await SpinalGraphService.getChildren(
      roomReferenceContext.info.id.get(),
      [GEO_ROOM_RELATION]
    );

    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].externalId.get() === externalId) {
        return rooms[i].id.get();
      }
    }
  }

  public getRoomIdFromFloorFinish(floorId: number) {
    for (const key in this.modelArchi) {
      if (this.modelArchi.hasOwnProperty(key)) {
        for (const roomId in this.modelArchi[key].children) {
          if (this.modelArchi[key].children.hasOwnProperty(roomId)) {
            const room = this.modelArchi[key].children[roomId];
            if (typeof room.children !== 'undefined')
              for (const roomChild of room.children) {
                if (roomChild.properties.dbId === floorId)
                  return room.properties.externalId;
              }
          }
        }
      }
    }
  }

  public async getFloorFinishId(configName: string, model: Model) {
    const floors = await this.getFloorFinish(configName, model);
    return floors.map((floor) => floor.properties.dbId);
  }
}

function round(x, digits = 2) {
  return parseFloat(x.toFixed(digits));
}
