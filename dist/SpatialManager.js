"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
const Config_1 = require("./Config");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const SpatialConfig_1 = require("./models/SpatialConfig");
const BuildingManager_1 = require("./managers/BuildingManager");
const FloorManager_1 = require("./managers/FloorManager");
const RoomManager_1 = require("./managers/RoomManager");
class SpatialManager {
    constructor() {
        //Todo remove
        this.initialized = this.init();
        window.getArchi = this.getArchiModel.bind(this);
    }
    init() {
        this.initialized = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield spinal_env_viewer_graph_service_1.SpinalGraphService.waitForInitialization();
            this.spatialConfig = yield this.getSpatialConfig();
            if (typeof this.spatialConfig === "undefined")
                reject('SpatialConfiguration undefined');
            // @ts-ignore
            this.context = yield SpatialManager.getContext(this.spatialConfig.contextName.get());
            this.contextId = this.context.info.id.get();
            this.buildingManager = new BuildingManager_1.BuildingManager();
            this.floorManager = new FloorManager_1.FloorManager();
            this.roomManager = new RoomManager_1.RoomManager();
            resolve();
        }));
        return this.initialized;
    }
    generateContext(buildingName, model) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.model = model;
                yield this.init();
                this.modelArchi = yield this.getArchiModel(model);
                this.spatialConfig.mod_attr('archi', this.modelArchi);
                let building = yield this.getBuilding(buildingName);
                if (typeof building !== "undefined" && building.hasOwnProperty('id'))
                    building = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(building.id.get());
                if (typeof building === "undefined")
                    building = yield spinal_env_viewer_context_geographic_service_1.default.addBuilding(this.contextId, this.contextId, buildingName);
                for (let key in this.modelArchi) {
                    if (this.modelArchi.hasOwnProperty(key) && Object.entries(this.modelArchi[key].children).length !== 0 && this.modelArchi[key].constructor === Object) {
                        const level = this.modelArchi[key];
                        this.createFloor(this.contextId, building.info.id.get(), this.floorManager.getPropertyValueByName(level.properties.properties, 'name'), level, model);
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    createRooms(rooms, contextId, floorId, model) {
        return __awaiter(this, void 0, void 0, function* () {
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
                for (j = turn * Config_1.config.batchSize; j < ((turn + 1) * Config_1.config.batchSize) && j < tmpRoom.length; j++) {
                    const room = tmpRoom[j];
                    if (typeof room.child !== "undefined") {
                        proms.push(spinal_env_viewer_context_geographic_service_1.default.addRoom(contextId, floorId, this.roomManager.getPropertyValueByName(room.properties.properties, 'name')));
                    }
                }
                const tmp = yield this.waitForFileSystem(proms);
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
                    window.spinal.BimObjectService.addReferenceObject(resolveBatch[i].info.id.get(), room.child.dbId, `Floor of ${this.roomManager.getPropertyValueByName(room.properties.properties, 'name')}`, model);
                    const result = yield this.roomManager.addAttribute(resolveBatch[i], room.properties.properties);
                    resolveBatch[i].info.add_attr({
                        'dbId': room.properties.dbId,
                        'externalId': room.properties.externalId
                    });
                    //resolveBatch[i].element.setElement(room)
                }
            }
        });
    }
    /**
     * Waits for the nodes to be in the FileSystem.
     * @param {Array<Promise>} promises Array of promises containing the nodes
     * @returns {Promise<any>} An empty promise
     */
    waitForFileSystem(promises) {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = yield Promise.all(promises);
            let unResolvedNode = [];
            return new Promise(resolve => {
                let inter = setInterval(() => {
                    unResolvedNode = nodes.filter(node => {
                        return window.FileSystem._objects[node._server_id] === undefined;
                    });
                    if (unResolvedNode.length === 0) {
                        clearInterval(inter);
                        resolve(nodes);
                    }
                }, 500);
            });
        });
    }
    createFloor(contextId, buildingId, name, level, model) {
        const floorProps = level.properties;
        const rooms = level.children;
        const structures = level.structures;
        return spinal_env_viewer_context_geographic_service_1.default.addFloor(contextId, buildingId, name)
            .then((floor) => __awaiter(this, void 0, void 0, function* () {
            floor.info.add_attr({ 'externalId': floorProps.externalId });
            const result = yield this.floorManager.addAttribute(floor, floorProps.properties);
            console.log('icici', result);
            spinal_env_viewer_context_geographic_service_1.default.addZone(this.contextId, floor.info.id.get(), 'Stucture')
                .then((structureZone) => __awaiter(this, void 0, void 0, function* () {
                for (const key in structures) {
                    if (structures.hasOwnProperty(key)) {
                        try {
                            const objName = this.roomManager.getPropertyValueByName(structures[key].properties.properties, 'name');
                            // @ts-ignore
                            yield window.spinal.BimObjectService.addBIMObject(this.contextId, structureZone.info.id.get(), structures[key].properties.dbId, objName, model);
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
                return;
            })).then(() => {
                return spinal_env_viewer_context_geographic_service_1.default.addZone(this.contextId, floor.info.id.get(), 'Pièces');
            }).then(roomZone => {
                return this.createRooms(rooms, contextId, roomZone.info.id.get(), model);
            });
            /* */
            //wait for the attribute to be added then create the rooms
        }));
    }
    updateContext(buildingName, model) {
        return __awaiter(this, void 0, void 0, function* () {
            this.model = model;
            yield this.init();
            const oldArchi = this.spatialConfig.archi.get();
            this.modelArchi = yield this.getArchiModel(model);
            const cmpObject = this.compareArchi(oldArchi, this.modelArchi);
            for (let levelId in cmpObject.updated.levels) {
                if (cmpObject.updated.levels.hasOwnProperty(levelId))
                    this.updateLevel(buildingName, cmpObject.updated.levels[levelId]);
            }
            for (let roomId in cmpObject.updated.rooms) {
                if (cmpObject.updated.rooms.hasOwnProperty(roomId))
                    this.updateRoom(roomId, cmpObject.updated.rooms[roomId]);
            }
            for (let levelId in cmpObject.new.levels) {
                if (cmpObject.new.levels.hasOwnProperty(levelId))
                    this.createFloor(this.contextId, this.getBuilding(buildingName), this.floorManager.getPropertyValueByName(cmpObject.new.levels[levelId].properties.properties, 'name'), cmpObject.new.levels[levelId].properties.properties, cmpObject.new.levels[levelId].children, model);
            }
            for (let levelId in cmpObject.new.rooms) {
                if (!cmpObject.new.rooms.hasOwnProperty(levelId))
                    continue;
                let level = yield this.floorManager.getByExternalId(levelId, spinal_env_viewer_graph_service_1.SpinalGraphService
                    .getContext(spinal_env_viewer_context_geographic_service_1.default.constants.FLOOR_REFERENCE_CONTEXT).info.id.get(), spinal_env_viewer_context_geographic_service_1.default.constants.FLOOR_RELATION);
                const proms = [];
                for (let i = 0; i < cmpObject.new.rooms[levelId].length; i++) {
                    let room = cmpObject.new.rooms[levelId][i];
                    proms.push(spinal_env_viewer_context_geographic_service_1.default.addRoom(this.contextId, level.id.get(), this.roomManager.getPropertyValueByName(room.properties.properties, 'name')));
                }
                Promise.all(proms).then(console.log);
            }
            for (let levelId in cmpObject.deleted.levels) {
                if (cmpObject.deleted.levels.hasOwnProperty(levelId)) {
                }
            }
            for (let roomId in cmpObject.deleted.rooms) {
                if (cmpObject.deleted.rooms.hasOwnProperty(roomId)) {
                    const context = spinal_env_viewer_graph_service_1.SpinalGraphService
                        .getContext(spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_REFERENCE_CONTEXT);
                    const room = yield this.roomManager.getByExternalId(roomId, context.info.id.get(), spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_RELATION);
                    yield this.removeRoom(room);
                }
            }
        });
    }
    /**
     * remove $room from the floor, the .room context and at it to the invalid
     * context
     * @param room
     */
    removeRoom(room) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(room.id.get());
            const floor = yield this.roomManager.getParents(node);
            if (typeof floor !== "undefined") {
                try {
                    // @ts-ignore
                    yield floor.removeChild(node, spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_TYPE); // remove the room from the floor
                    const roomReferenceContext = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_REFERENCE_CONTEXT);
                    //TODO check why PTR_LST insteadof LST_PTRhasOwnAttribute
                    yield spinal_env_viewer_graph_service_1.SpinalGraphService
                        .removeChild(roomReferenceContext.info.id.get(), node.info.id.get(), spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE); //remove the room from .room context
                    this.addToInvalidContext(node.info.id.get());
                    resolve();
                }
                catch (e) {
                    console.log(e);
                    reject(e);
                }
            }
            else
                resolve();
        }));
    }
    addToInvalidContext(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(".invalid");
            if (typeof context === "undefined")
                context = yield spinal_env_viewer_graph_service_1.SpinalGraphService.addContext('.invalid', 'invalid');
            return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(context.info.id.get(), id, 'Invalid', spinal_env_viewer_graph_service_1.SPINAL_RELATION_LST_PTR_TYPE);
        });
    }
    getFloorFromRoom(room) {
        return __awaiter(this, void 0, void 0, function* () {
            let parents = yield room.getParents();
            for (let i = 0; i < parents.length; i++) {
                if (parents[i].info.type.get() === "geographicFloor")
                    return parents[i];
            }
            return undefined;
        });
    }
    updateLevel(buildingName, level) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findLevel(buildingName, level.properties.externalId).then((l) => __awaiter(this, void 0, void 0, function* () {
                yield this.floorManager
                    .addAttribute(spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(l.id.get()), level.properties.properties);
            }));
        });
    }
    updateRoom(externalId, room) {
        return __awaiter(this, void 0, void 0, function* () {
            this.roomManager.getByExternalId(externalId, spinal_env_viewer_graph_service_1.SpinalGraphService
                .getContext(spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_REFERENCE_CONTEXT).info.id.get(), spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_RELATION)
                .then(r => {
                this.roomManager.addAttribute(spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(r.id.get()), room.properties.properties);
                // @ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService.modifyNode(r.id.get(), { dbId: room.properties.dbId });
            });
        });
    }
    compareArchi(oldArchi, newArchi) {
        const comparisionObject = {
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
                        }
                        else
                            comparisionObject.deleted.rooms[roomExternal] = oldArchi[levelId].children[roomExternal];
                    }
                }
            }
            else { //delete floor
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
                        && (!oldArchi[levelId].children.hasOwnProperty(roomExternal) || typeof oldArchi[levelId].children[roomExternal].child === "undefined")) {
                        if (typeof comparisionObject.new.rooms[level.properties.externalId] === "undefined")
                            comparisionObject.new.rooms[level.properties.externalId] = [];
                        comparisionObject.new.rooms[level.properties.externalId].push(level.children[roomExternal]);
                    }
            }
            else { //add level and rooms to new
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
    static getContext(contextName) {
        return __awaiter(this, void 0, void 0, function* () {
            let context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(contextName);
            if (typeof context === "undefined" || context === null) {
                context = yield spinal_env_viewer_context_geographic_service_1.default.createContext(contextName);
            }
            return context;
        });
    }
    getSpatialConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            let context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext('.config');
            if (typeof context === "undefined")
                context = yield spinal_env_viewer_graph_service_1.SpinalGraphService.addContext('.config', 'system configuration', undefined);
            return spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(context.info.id.get(), ['hasConfig'])
                .then((children) => __awaiter(this, void 0, void 0, function* () {
                let config;
                if (typeof children !== "undefined")
                    for (let i = 0; i < children.length; i++) {
                        if (children[i].type.get() === 'SpatialConfig')
                            config = children[i];
                    }
                if (typeof config === "undefined") { // create default config
                    config = spinal_env_viewer_graph_service_1.SpinalGraphService.createNode({
                        name: 'spatial config',
                        type: 'SpatialConfig'
                    }, new SpatialConfig_1.SpatialConfig());
                    yield spinal_env_viewer_graph_service_1.SpinalGraphService
                        .addChild(context.info.id.get(), config, 'hasConfig', spinal_env_viewer_graph_service_1.SPINAL_RELATION_LST_PTR_TYPE);
                    config = spinal_env_viewer_graph_service_1.SpinalGraphService.getNode(config);
                }
                return config.element.load();
            }));
        });
    }
    /**
     * use propertyDb to create a representation of the architecture of the model
     * @param model
     */
    getArchiModel(model) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO une fois sur la version 7 du viewer la fonction
            // executerUserFonction permetera de passer des parametre a userFunction
            this.spatialConfig = yield this.getSpatialConfig();
            let objectProperties = this.spatialConfig.objectProperties.get();
            let floorAttrn = this.spatialConfig.revitAttribute.floors.attrName.get();
            // @ts-ignore
            return yield model.getPropertyDb().executeUserFunction(`
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
        });
    }
    findLevel(buildingName, externalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const building = yield this.getBuilding(buildingName);
            return this.floorManager.getByExternalId(externalId, building.id.get(), spinal_env_viewer_context_geographic_service_1.default.constants.FLOOR_RELATION);
        });
    }
    getBuilding(buildingName) {
        return __awaiter(this, void 0, void 0, function* () {
            return spinal_env_viewer_graph_service_1.SpinalGraphService
                .getChildren(this.contextId, [spinal_env_viewer_context_geographic_service_1.default.constants.BUILDING_RELATION])
                .then(children => {
                if (typeof children === 'undefined')
                    return undefined;
                for (let i = 0; i < children.length; i++) {
                    const building = children[i];
                    if (building.name.get() === buildingName)
                        return building;
                }
                return undefined;
            });
        });
    }
    getFloorFinish(model) {
        return __awaiter(this, void 0, void 0, function* () {
            this.modelArchi = yield this.getArchiModel(model);
            const floorFinish = [];
            for (let key in this.modelArchi) {
                if (this.modelArchi.hasOwnProperty(key)) {
                    for (let roomId in this.modelArchi[key].children) {
                        if (this.modelArchi[key].children.hasOwnProperty(roomId)) {
                            const room = this.modelArchi[key].children[roomId];
                            if (typeof room.child !== "undefined")
                                floorFinish.push(room.child);
                        }
                    }
                }
            }
            return floorFinish;
        });
    }
    getRoomIdFromDbId(externalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomReferenceContext = spinal_env_viewer_graph_service_1.SpinalGraphService
                .getContext(spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_REFERENCE_CONTEXT);
            const rooms = yield spinal_env_viewer_graph_service_1.SpinalGraphService
                .getChildren(roomReferenceContext.info.id.get(), [spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_RELATION]);
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].externalId.get() === externalId)
                    return rooms[i].id.get();
            }
        });
    }
    getRoomIdFromFloorFinish(floorId) {
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
    getFloorFinishId(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const floors = yield this.getFloorFinish(model);
            return floors.map(floor => floor.dbId);
        });
    }
}
exports.SpatialManager = SpatialManager;
//# sourceMappingURL=SpatialManager.js.map