import Model = Autodesk.Viewing.Model;
import PropertyResult = Autodesk.Viewing.PropertyResult;
import Property = Autodesk.Viewing.Property;
import GeographicService from 'spinal-env-viewer-context-geographic-service'
import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service'
import { config } from './Config'
import {
  SPINAL_RELATION_LST_PTR_TYPE,
  SPINAL_RELATION_TYPE,
  SpinalContext,
  SpinalGraphService, SpinalNodeRef, SPINAL_RELATION_PTR_LST_TYPE
} from "spinal-env-viewer-graph-service";
import { SpatialConfig } from "./models/SpatialConfig";
import { BuildingManager } from "./managers/BuildingManager";
import { FloorManager } from "./managers/FloorManager";
import { RoomManager } from "./managers/RoomManager";

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

export interface Level {
  properties: Properties,
  children: { [externalId: string]: Room }
}

export interface Room {
  properties: Properties,
  child: Properties
}

export interface Properties {
  dbId: number,
  externalId: string,
  properties: SpinalProps[]
}

export interface SpinalProps {
  name: string,
  value: any
}

export class SpatialManager {
  private context: SpinalContext;
  private contextId: string;
  private spatialConfig: SpatialConfig;
  private buildingManager: BuildingManager;
  private floorManager: FloorManager;
  private roomManager: RoomManager;
  private initialized: Promise<any>;
  private model: Model;
  private modelArchi: ModelArchi;


  constructor() {
    //Todo remove
    this.initialized = this.init();
    window.getArchi = this.getArchiModel.bind(this)
  }

  public init() {
    this.initialized = new Promise<any>(async (resolve, reject) => {
      await SpinalGraphService.waitForInitialization();
      this.spatialConfig = await this.getSpatialConfig();
      if (typeof this.spatialConfig === "undefined")
        reject('SpatialConfiguration undefined');

      // @ts-ignore
      this.context = await SpatialManager.getContext(this.spatialConfig.contextName.get());
      this.contextId = this.context.info.id.get();
      this.buildingManager = new BuildingManager();
      this.floorManager = new FloorManager();
      this.roomManager = new RoomManager();
      resolve()
    });
    return this.initialized;
  }

  public async generateContext(buildingName: string, model: Model) {
    try {
      this.model = model;
      await this.init();
      this.modelArchi = await this.getArchiModel(model);
      this.spatialConfig.mod_attr('archi', this.modelArchi);
      let building = await this.getBuilding(buildingName);
      if (typeof building !== "undefined" && building.hasOwnProperty('id'))
        building = SpinalGraphService.getRealNode(building.id.get());

      if (typeof building === "undefined")
        building = await GeographicService.addBuilding(this.contextId, this.contextId, buildingName);
      for (let key in this.modelArchi) {

        if (this.modelArchi.hasOwnProperty(key) && Object.entries(this.modelArchi[key].children).length !== 0 && this.modelArchi[key].constructor === Object) {
          const level = this.modelArchi[key];
          this.createFloor(this.contextId, building.info.id.get(),
            this.floorManager.getPropertyValueByName(level.properties.properties, 'name'),
            level, model)
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  async createRooms(rooms, contextId, floorId, model) {

    const tmpRoom = [];
    for (let key in rooms) {
      if (rooms.hasOwnProperty(key))
        tmpRoom.push(rooms[key]);
    }

    let proms = [];
    const resolveBatch = [];
    let turn = 0;
    let j = 0;

    while (j < tmpRoom.length) {
      for (j = turn * config.batchSize; j < ((turn + 1) * config.batchSize) && j < tmpRoom.length; j++) {
        const room = tmpRoom[j];

        if (typeof room.child !== "undefined") {
          proms.push(GeographicService.addRoom(contextId, floorId, this.roomManager.getPropertyValueByName(room.properties.properties, 'name')));
        }
      }
      const tmp: any[] = await this.waitForFileSystem(proms);
/*
      for (let i = 0; i < tmp.length; i++) {

        let roomName = tmp[i].info.name.get();
        let room = tmpRoom.find(room => {
          return this.roomManager.getPropertyValueByName(room.properties.properties, 'name') === roomName;
        });
        if (typeof room !== "undefined" && typeof room.child !== "undefined") {

          // @ts-ignore
          await window.spinal.BimObjectService.addReferenceObject(
            tmp[i].info.id.get()
            , room.child.dbId,
            `Floor of ${this.roomManager.getPropertyValueByName(room.properties.properties, 'name')}`,
            model
          );

          await this.roomManager.addAttribute(tmp[i], room.properties);

          tmp[i].info.add_attr({
            'dbId': room.properties.dbId,
            'externalId': room.properties.externalId
          });
          //resolveBatch[i].element.setElement(room)
        }
      }
*/

      resolveBatch.push(...tmp);
      turn++;
    }

    for (let i = 0; i < resolveBatch.length; i++) {

      let roomName = resolveBatch[i].info.name.get();
      let room = tmpRoom.find(room => {
        return this.roomManager.getPropertyValueByName(room.properties.properties, 'name') === roomName;
      });
      if (typeof room !== "undefined" && typeof room.child !== "undefined") {

        // @ts-ignore
        window.spinal.BimObjectService.addReferenceObject(
          resolveBatch[i].info.id.get()
          , room.child.dbId,
          `Floor of ${this.roomManager.getPropertyValueByName(room.properties.properties, 'name')}`,
          model
        );

        await this.roomManager.addAttribute(resolveBatch[i], room.properties);

        resolveBatch[i].info.add_attr({
          'dbId': room.properties.dbId,
          'externalId': room.properties.externalId
        });
        //resolveBatch[i].element.setElement(room)
      }
    }


  }

  /**
   * Waits for the nodes to be in the FileSystem.
   * @param {Array<Promise>} promises Array of promises containing the nodes
   * @returns {Promise<any>} An empty promise
   */
  async waitForFileSystem(promises): Promise<any[]> {
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

  createFloor(contextId, buildingId, name, level, model) {
    const floorProps = level.properties;
    const rooms = level.children;
    const structures = level.structures;
    return GeographicService.addFloor(contextId, buildingId, name)
      .then(async floor => {
        floor.info.add_attr({'externalId': floorProps.externalId});
        await this.floorManager.addAttribute(floor, floorProps.properties);

        GeographicService.addZone(this.contextId, floor.info.id.get(), 'Stucture')
          .then(async structureZone => {
            for (const key in structures) {
              if (structures.hasOwnProperty(key)) {
                try {
                  console.log('structure', structures[key], );
                    const objName = this.roomManager.getPropertyValueByName(structures[key].properties.properties, 'name')
                  // @ts-ignore
                  await window.spinal.BimObjectService.addBIMObject(
                    this.contextId,
                    structureZone.info.id.get()
                    , structures[key].properties.dbId,
                    objName,
                    model
                  );
                } catch (e) {
                  console.error(e);
                }
              }
            }
            return;
          }).then(() => {
          return GeographicService.addZone(this.contextId, floor.info.id.get(), 'Pièces');
        }).then(roomZone => {
          return this.createRooms(rooms, contextId, roomZone.info.id.get(), model)
        })
        ;


        /* */

        //wait for the attribute to be added then create the rooms

      });
  }

  public async updateContext(buildingName: string, model: Model) {

    this.model = model;
    await this.init();
    const oldArchi = this.spatialConfig.archi.get();
    this.modelArchi = await this.getArchiModel(model);
    const cmpObject = this.compareArchi(oldArchi, this.modelArchi);

    for (let levelId in cmpObject.updated.levels) {
      if (cmpObject.updated.levels.hasOwnProperty(levelId))
        this.updateLevel(buildingName, cmpObject.updated.levels[levelId])
    }

    for (let roomId in cmpObject.updated.rooms) {
      if (cmpObject.updated.rooms.hasOwnProperty(roomId))
        this.updateRoom(roomId, cmpObject.updated.rooms[roomId])
    }

    for (let levelId in cmpObject.new.levels) {
      if (cmpObject.new.levels.hasOwnProperty(levelId))
        this.createFloor(this.contextId, this.getBuilding(buildingName),
          this.floorManager.getPropertyValueByName(cmpObject.new.levels[levelId].properties.properties, 'name'),
          cmpObject.new.levels[levelId].properties.properties,
          cmpObject.new.levels[levelId].children, model)
    }

    for (let levelId in cmpObject.new.rooms) {
      if (!cmpObject.new.rooms.hasOwnProperty(levelId))
        continue;
      let level = await this.floorManager.getByExternalId(levelId, SpinalGraphService
          .getContext(GeographicService.constants.FLOOR_REFERENCE_CONTEXT).info.id.get(),
        GeographicService.constants.FLOOR_RELATION);
      const proms = [];
      for (let i = 0; i < cmpObject.new.rooms[levelId].length; i++) {
        let room = cmpObject.new.rooms[levelId][i];
        proms.push(GeographicService.addRoom(this.contextId, level.id.get(), this.roomManager.getPropertyValueByName(room.properties.properties, 'name')))
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

        const room = await this.roomManager.getByExternalId(roomId, context.info.id.get(), GeographicService.constants.ROOM_RELATION);
        await this.removeRoom(room)
      }
    }

  }

  /**
   * remove $room from the floor, the .room context and at it to the invalid
   * context
   * @param room
   */
  removeRoom(room) {

    return new Promise(async (resolve, reject) => {
      const node = SpinalGraphService.getRealNode(room.id.get());
      const floor = await this.roomManager.getParents(node);

      if (typeof floor !== "undefined") {
        try {


          // @ts-ignore
          await floor.removeChild(node,
            GeographicService.constants.ROOM_RELATION, SPINAL_RELATION_TYPE); // remove the room from the floor


          const roomReferenceContext = SpinalGraphService.getContext(GeographicService.constants.ROOM_REFERENCE_CONTEXT);


          //TODO check why PTR_LST insteadof LST_PTRhasOwnAttribute
          await SpinalGraphService
            .removeChild(
              roomReferenceContext.info.id.get(), node.info.id.get(),
              GeographicService.constants.ROOM_RELATION, SPINAL_RELATION_PTR_LST_TYPE); //remove the room from .room context

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

  async addToInvalidContext(id) {
    let context = SpinalGraphService.getContext(".invalid");
    if (typeof context === "undefined")
      context = await SpinalGraphService.addContext('.invalid', 'invalid');

    return SpinalGraphService.addChild(context.info.id.get(), id, 'Invalid', SPINAL_RELATION_LST_PTR_TYPE)
  }


  async getFloorFromRoom(room) {
    let parents = await room.getParents();
    for (let i = 0; i < parents.length; i++) {
      if (parents[i].info.type.get() === "geographicFloor")
        return parents[i];
    }
    return undefined;
  }

  private async updateLevel(buildingName: string, level: Level) {
    return this.findLevel(buildingName, level.properties.externalId).then(async l => {
      await this.floorManager
        .addAttribute(SpinalGraphService.getRealNode(l.id.get()), level.properties.properties);
    })
  }

  private async updateRoom(externalId: string, room) {
    this.roomManager.getByExternalId(externalId, SpinalGraphService
      .getContext(GeographicService.constants.ROOM_REFERENCE_CONTEXT).info.id.get(), GeographicService.constants.ROOM_RELATION).then(r => {
      this.roomManager.addAttribute(SpinalGraphService.getRealNode(r.id.get()), room.properties.properties);
      // @ts-ignore
      SpinalGraphService.modifyNode(r.id.get(), {dbId: room.properties.dbId});

    })
  }

  public compareArchi(oldArchi: object, newArchi: object): ComparisionObject {
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
          if (level.children.hasOwnProperty(roomExternal) && typeof level.children[roomExternal].child !== 'undefined') {
            if (newArchi[levelId].children.hasOwnProperty(roomExternal)
              && typeof newArchi[levelId].children[roomExternal].child !== "undefined") {
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
            && typeof level.children[roomExternal].child !== 'undefined'
            && (!oldArchi[levelId].children.hasOwnProperty(roomExternal) || typeof oldArchi[levelId].children[roomExternal].child === "undefined")
          ) {
            if (typeof comparisionObject.new.rooms[level.properties.externalId] === "undefined")
              comparisionObject.new.rooms[level.properties.externalId] = [];
            comparisionObject.new.rooms[level.properties.externalId].push(level.children[roomExternal]);
          }
      } else { //add level and rooms to new
        comparisionObject.new.levels[levelId] = level;
        for (let roomExternal in level.children)
          if (level.children.hasOwnProperty(roomExternal)
            && typeof level.children[levelId].child !== 'undefined') //add room if it has a floor
          {
            if (typeof comparisionObject.new.rooms[level.properties.externalId] === "undefined")
              comparisionObject.new.rooms[level.properties.externalId] = [];
            comparisionObject.new.rooms[level.properties.externalId].push(level.children[roomExternal]);
          }
      }
    }


    return comparisionObject;
  }

  private static async getContext(contextName) {
    let context = SpinalGraphService.getContext(contextName);
    if (typeof context === "undefined" || context === null) {
      context = await GeographicService.createContext(contextName);
    }
    return context;
  }

  private async getSpatialConfig() {
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
              'hasConfig', SPINAL_RELATION_LST_PTR_TYPE);
          config = SpinalGraphService.getNode(config);
        }

        return config.element.load();
      })
  }

  /**
   * use propertyDb to create a representation of the architecture of the model
   * @param model
   */
  private async getArchiModel(model: Model) {

    //TODO une fois sur la version 7 du viewer la fonction
    // executerUserFonction permetera de passer des parametre a userFunction
    this.spatialConfig = await this.getSpatialConfig();
    let objectProperties = this.spatialConfig.objectProperties.get();
    let floorAttrn = this.spatialConfig.revitAttribute.floors.attrName.get();
    // @ts-ignore
    return await model.getPropertyDb().executeUserFunction(
      `
function userFunction(pdb) {
  function createArchitectureModel(object ) {
    const archiModel = {};

    function getLevelFromRoom(room) {
      const props = room.properties;
      for (let i = 0; i < props.length; i++) {
        if (props[i].name === 'RoomID')
          return props[i].value
      }
    }

    function getAttrValue(obj, attrName) {
      const props = obj.properties;
      for (let i = 0; i < props.length; i++) {
        if (props[i].name === attrName)
          return props[i].value
      }
    }

    function findFloor(externalId) {
      for (let i = 0; i < object.floors.length; i++) {
        if (getAttrValue(object.floors[i], 'RoomID') === externalId)
          return object.floors[i];
      }
    }

    for (let i = 0; i < object.levels.length; i++) {
      const obj = object.levels[i];
      archiModel[obj.dbId] = {properties: obj, children: {}, structures: {}}
    }
    for (let i = 0; i < object.rooms.length; i++) {
      const obj = object.rooms[i];
      archiModel[getAttrValue(obj, 'Level')].children[obj.externalId] = {
        properties: obj,
        child: findFloor(obj.externalId)
      }
    }
    for (let i = 0; i < object.structures.length; i++) {
      const obj = object.structures[i];
      archiModel[getAttrValue(obj, 'Level')]
        .structures[obj.externalId] = {
        properties: obj,
      }
    }

    return archiModel;
  }

  let attrIdSCtype = -1;
  let attrIdLevel = -1;
  let attrICategory = -1;

  let objectProperties = [ 'elevation', 'area', 'volume', 'perimeter', 'local', 'etage', 'stype', 'roomid', 'number'];
  let props = [];
  // Iterate over all attributes and find the index to the one we are interested in
  pdb.enumAttributes(function (i, attrDef, attrRaw) {
    let name = attrDef.name;
    let category = attrDef.category;
    if (name === 'name') {
      props.push({attrId: i, name})
    }
    if (objectProperties.includes(name.toLowerCase())) {
      props.push({attrId: i, name})
    }
    if (name === 'SCtype') {
      props.push({attrId: i, name})
      attrIdSCtype = i;
    } else if (name === 'Level' && category === '__internalref__') {
      props.push({attrId: i, name});
      attrIdLevel = i;
    } else if (name === 'Category' && category === '__category__') {
      props.push({attrId: i, name});
      attrICategory = i;
    } else if (name === 'Elevation')
      props.push({attrId: i, name})
  });

  if (attrIdSCtype === -1 && attrIdLevel === -1 && attrICategory === -1)
    return null;


  let dbIds = {floors: [], rooms: [], levels: [], structures: []};


  let externalIdMapping = pdb.getExternalIdMapping();
  const idExternal = {};

  for (let key in externalIdMapping) {
    if (externalIdMapping.hasOwnProperty(key)) {
      idExternal[externalIdMapping[key]] = key;
    }
  }

  pdb.enumObjects(function (dbId) {
    const properties = [];
    let keepProperties = false;
    let array = [];

    // For each part, iterate over their properties.
    pdb.enumObjectProperties(dbId, function (attrId, valId) {
      let value = pdb.getAttrValue(attrId, valId);
      let prop = props.find(prop => prop.attrId === attrId)
      if (prop)
        properties.push({name: prop.name, value});
      // Only process 'Mass' property.
      // The word "Property" and "Attribute" are used interchangeably.
      if (attrId === attrIdSCtype || attrId === attrICategory || attrId === attrIdLevel) {
        keepProperties = true;

        if (value === 'Floor_finish') {
          array = dbIds.floors;
        }
        else if (value === 'Revit Level') {
          array = dbIds.levels;
        }
        else if (value === 'Revit Pièces') {
          array = dbIds.rooms;
        }
        else if (value === 'Revit Fenêtres'
          || value === 'Revit Murs'
          || value === 'Revit Sols') {
          array = dbIds.structures;
        }
      }

    });

    if (keepProperties)
      array.push({dbId, properties, externalId: idExternal[dbId]})
  });
  // Return results
  return createArchitectureModel(dbIds)
}
`);
  }

  private async findLevel(buildingName, externalId) {
    const building = await this.getBuilding(buildingName);
    return this.floorManager.getByExternalId(externalId, building.id.get(), GeographicService.constants.FLOOR_RELATION);
  }

  private async getBuilding(buildingName: string): Promise<SpinalNodeRef> {
    return SpinalGraphService
      .getChildren(this.contextId, [GeographicService.constants.BUILDING_RELATION])
      .then(children => {
        if (typeof children === 'undefined')
          return undefined;
        for (let i = 0; i < children.length; i++) {
          const building = children[i];

          if (building.name.get() === buildingName)
            return building;
        }

        return undefined;
      })
  }

  public async getFloorFinish(model): Promise<Properties[]> {
    this.modelArchi = await this.getArchiModel(model);
    const floorFinish: Properties[] = [];
    for (let key in this.modelArchi) {
      if (this.modelArchi.hasOwnProperty(key)) {
        for (let roomId in this.modelArchi[key].children) {

          if (this.modelArchi[key].children.hasOwnProperty(roomId)) {
            const room = this.modelArchi[key].children[roomId];
            if (typeof room.child !== "undefined")
              floorFinish.push(room.child)
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
        [GeographicService.constants.ROOM_RELATION]);

    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].externalId.get() === externalId)
        return rooms[i].id.get();
    }
  }

  public getRoomIdFromFloorFinish(floorId) {
    for (let key in this.modelArchi) {
      if (this.modelArchi.hasOwnProperty(key)) {
        for (let roomId in this.modelArchi[key].children) {
          if (this.modelArchi[key].children.hasOwnProperty(roomId)) {
            const room = this.modelArchi[key].children[roomId];

            if (typeof room.child !== "undefined" && room.child.dbId === floorId)
              return room.properties.externalId;
          }
        }
      }
    }
  }

  public async getFloorFinishId(model) {
    const floors = await this.getFloorFinish(model);
    return floors.map(floor => floor.dbId);
  }


}
