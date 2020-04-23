"use strict";
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
// import { serviceDocumentation } from 'spinal-env-viewer-plugin-documentation-service'
const createFctGetArchi_1 = require("./createFctGetArchi");
const Config_1 = require("./Config");
const Constant_1 = require("./Constant");
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const SpatialConfig_1 = require("./models/SpatialConfig");
const BuildingManager_1 = require("./managers/BuildingManager");
const FloorManager_1 = require("./managers/FloorManager");
const RoomManager_1 = require("./managers/RoomManager");
const consumeBatch_1 = require("./utils/consumeBatch");
class SpatialManager {
    constructor() {
        this.modelArchiLib = new Map();
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
            // let contextName = "spatial";
            // if (typeof this.spatialConfig.contextName !== "undefined") {
            //   // @ts-ignore
            //   contextName = this.spatialConfig.contextName.get()
            // }
            // this.context = await SpatialManager.getContext(contextName);
            // this.contextId = this.context.info.id.get();
            this.buildingManager = new BuildingManager_1.BuildingManager();
            this.floorManager = new FloorManager_1.FloorManager();
            this.roomManager = new RoomManager_1.RoomManager();
            resolve();
        }));
        return this.initialized;
    }
    generateContext(configName, model) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.model = model;
                yield this.init();
                this.modelArchi = yield this.getArchiModel(model, configName);
                const config = this.spatialConfig.getConfig(configName);
                config.mod_attr('archi', this.modelArchi);
                let building = yield this.getBuilding(config);
                if (typeof building !== "undefined" && building.hasOwnProperty('id'))
                    building = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(building.id.get());
                const context = yield this.getContextFromConfig(config);
                const contextId = context.getId().get();
                if (typeof building === "undefined") {
                    building = yield spinal_env_viewer_context_geographic_service_1.default.addBuilding(contextId, contextId, config.basic.buildingName);
                }
                const prom = [];
                for (let key in this.modelArchi) {
                    if (this.modelArchi.hasOwnProperty(key) &&
                        Object.entries(this.modelArchi[key].children).length !== 0 &&
                        this.modelArchi[key].constructor === Object) {
                        const level = this.modelArchi[key];
                        // prom.push(
                        yield this.createFloor(contextId, building.info.id.get(), this.floorManager.getPropertyValueByName(level.properties.properties, 'name'), level, model);
                        // )
                    }
                }
                yield Promise.all(prom);
            }
            catch (e) {
                console.error(e);
            }
            console.log("generateContext DONE");
        });
    }
    addRoomValueParam(target, other) {
        const area = this.roomManager.getPropertyValueByName(other.properties.properties, 'Area');
        const perimeter = this.roomManager.getPropertyValueByName(other.properties.properties, 'Perimeter');
        const volume = this.roomManager.getPropertyValueByName(other.properties.properties, 'Volume');
        for (const targetParam of target) {
            if (targetParam.name === "Area")
                targetParam.value = round(targetParam.value + area);
            if (targetParam.name === "Perimeter")
                targetParam.value = round(targetParam.value + perimeter);
            if (targetParam.name === "Volume")
                targetParam.value = round(targetParam.value + volume);
        }
    }
    addIfExist(array, room) {
        const roomNuber = this.roomManager.getPropertyValueByName(room.properties.properties, 'Number');
        const target = array.find((e) => {
            return this.roomManager.getPropertyValueByName(e.properties.properties, 'Number') === roomNuber;
        });
        if (target) {
            this.addRoomValueParam(target.properties.properties, room);
            return false;
        }
        return true;
    }
    getRoomName(room) {
        const roomNbr = this.roomManager.getPropertyValueByName(room.properties.properties, 'Number');
        const roomName = this.roomManager.getPropertyValueByName(room.properties.properties, 'name');
        return `${roomNbr}-${roomName}`;
    }
    createRooms(rooms, contextId, floorId, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeAttrNames = ['dbId', 'externalId'];
            const tmpRoom = [];
            for (let key in rooms) {
                if (rooms.hasOwnProperty(key))
                    if (this.addIfExist(tmpRoom, rooms[key])) {
                        tmpRoom.push(rooms[key]);
                    }
            }
            let proms = [];
            const resolveBatch = [];
            let turn = 0;
            let j = 0;
            while (j < tmpRoom.length) {
                for (j = turn * Config_1.config.batchSize; j < ((turn + 1) * Config_1.config.batchSize) && j < tmpRoom.length; j++) {
                    const room = tmpRoom[j];
                    proms.push(spinal_env_viewer_context_geographic_service_1.default.addRoom(contextId, floorId, this.getRoomName(room)));
                }
                const tmp = yield this.waitForFileSystem(proms);
                resolveBatch.push(...tmp);
                turn++;
            }
            for (let i = 0; i < resolveBatch.length; i++) {
                let roomName = resolveBatch[i].info.name.get();
                let room = tmpRoom.find(r => {
                    return this.getRoomName(r) === roomName;
                });
                if (typeof room !== "undefined" && typeof room.children !== "undefined") {
                    const prom = [
                        this.roomManager.addAttribute(resolveBatch[i], room.properties.properties)
                    ];
                    for (const child of room.children) {
                        const roomAttrName = this.getRoomName(room);
                        prom.push(this.addReferenceObject(child.dbId, roomName, model, resolveBatch[i], Constant_1.GEO_REFERENCE_ROOM_RELATION).catch(e => e));
                        // prom.push(
                        //   // @ts-ignore
                        //   window.spinal.BimObjectService.addReferenceObject(
                        //     resolveBatch[i].info.id.get(), child.dbId, `Floor of ${roomAttrName}`, model
                        //   )
                        // )
                    }
                    yield Promise.all(prom);
                    // add or set attribut to  dbId & externalId
                    for (const nodeAttrName of nodeAttrNames) {
                        if (typeof resolveBatch[i].info[nodeAttrName] === "undefined")
                            resolveBatch[i].info.add_attr(nodeAttrName, room.properties[nodeAttrName]);
                        else if (resolveBatch[i].info[nodeAttrName].get() !== room.properties[nodeAttrName]) {
                            resolveBatch[i].info[nodeAttrName].set(room.properties[nodeAttrName]);
                        }
                    }
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
    addReferenceObject(dbId, name, model, targetNode, relationName = Constant_1.GEO_REFERENCE_RELATION) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            let bimObj = yield window.spinal.BimObjectService.getBIMObject(dbId, model);
            if (typeof bimObj === "undefined") {
                // @ts-ignore
                bimObj = yield window.spinal.BimObjectService.createBIMObject(dbId, name, model);
            }
            console.log("addReferenceObject", bimObj);
            if (typeof bimObj.id !== "undefined") {
                // @ts-ignore
                bimObj = window.spinal.spinalGraphService.nodes[bimObj.id.get()];
            }
            const childrenIds = targetNode.getChildrenIds();
            const idx = childrenIds.indexOf(bimObj.info.id.get());
            if (idx !== -1)
                return bimObj;
            return targetNode.addChild(bimObj, relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
        });
    }
    addRefStructureToFloor(floorId, structures, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const prom = [];
            const fct = (dbId, name, model, targetNode) => {
                return this.addReferenceObject(dbId, name, model, targetNode).catch(e => e);
            };
            try {
                for (const key in structures) {
                    if (structures.hasOwnProperty(key)) {
                        const objName = this.roomManager.getPropertyValueByName(structures[key].properties.properties, 'name');
                        prom.push(fct.bind(this, structures[key].properties.dbId, objName, model, 
                        // @ts-ignore
                        spinal.spinalGraphService.nodes[floorId]));
                    }
                }
                yield consumeBatch_1.consumeBatch(prom, 10);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    createFloor(contextId, buildingId, name, level, model) {
        const floorProps = level.properties;
        const rooms = level.children;
        const structures = level.structures;
        return spinal_env_viewer_context_geographic_service_1.default.addFloor(contextId, buildingId, name)
            .then((floor) => __awaiter(this, void 0, void 0, function* () {
            floor.info.add_attr({ 'externalId': floorProps.externalId });
            yield this.floorManager.addAttribute(floor, floorProps.properties),
                yield this.createRooms(rooms, contextId, floor.info.id.get(), model);
            yield this.addRefStructureToFloor(floor.info.id.get(), structures, model);
        })).catch(console.error);
    }
    updateContext(configName, model) {
        return __awaiter(this, void 0, void 0, function* () {
            this.model = model;
            yield this.init();
            const config = this.spatialConfig.getConfig(configName);
            const oldArchi = config.archi.get();
            this.modelArchi = yield this.getArchiModel(model, configName);
            const cmpObject = this.compareArchi(oldArchi, this.modelArchi);
            for (let levelId in cmpObject.updated.levels) {
                if (cmpObject.updated.levels.hasOwnProperty(levelId))
                    this.updateLevel(config, cmpObject.updated.levels[levelId], model);
            }
            for (let roomId in cmpObject.updated.rooms) {
                if (cmpObject.updated.rooms.hasOwnProperty(roomId))
                    this.updateRoom(roomId, cmpObject.updated.rooms[roomId]);
            }
            const context = yield this.getContextFromConfig(config);
            const contextId = context.getId().get();
            for (let levelId in cmpObject.new.levels) {
                if (cmpObject.new.levels.hasOwnProperty(levelId)) {
                    let building = yield this.getBuilding(config);
                    if (typeof building !== "undefined" && building.hasOwnProperty('id'))
                        yield this.createFloor(contextId, building.id.get(), this.floorManager.getPropertyValueByName(cmpObject.new.levels[levelId].properties.properties, 'name'), cmpObject.new.levels[levelId].properties.properties, model);
                }
                // cmpObject.new.levels[levelId].children, model)
            }
            for (let levelId in cmpObject.new.rooms) {
                if (!cmpObject.new.rooms.hasOwnProperty(levelId))
                    continue;
                let level = yield this.floorManager.getByExternalId(levelId, spinal_env_viewer_graph_service_1.SpinalGraphService
                    .getContext(spinal_env_viewer_context_geographic_service_1.default.constants.FLOOR_REFERENCE_CONTEXT).info.id.get(), Constant_1.GEO_FLOOR_RELATION);
                const proms = [];
                for (let i = 0; i < cmpObject.new.rooms[levelId].length; i++) {
                    let room = cmpObject.new.rooms[levelId][i];
                    proms.push(spinal_env_viewer_context_geographic_service_1.default.addRoom(contextId, level.id.get(), this.roomManager.getPropertyValueByName(room.properties.properties, 'name')));
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
                    const room = yield this.roomManager.getByExternalId(roomId, context.info.id.get(), Constant_1.GEO_ROOM_RELATION);
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
                    yield floor.removeChild(node, Constant_1.GEO_ROOM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE); // remove the room from the floor
                    const roomReferenceContext = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_REFERENCE_CONTEXT);
                    yield spinal_env_viewer_graph_service_1.SpinalGraphService
                        .removeChild(roomReferenceContext.info.id.get(), node.info.id.get(), Constant_1.GEO_ROOM_RELATION, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE); //remove the room from .room context
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
            return spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(context.info.id.get(), id, 'Invalid', spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
        });
    }
    getFloorFromRoom(room) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn("SpatialManager.getFloorFromRoom doesn't work", room);
            // let parents = await room.getParents();
            // for (let i = 0; i < parents.length; i++) {
            //   if (parents[i].info.type.get() === "geographicFloor")
            //     return parents[i];
            // }
            // return undefined;
        });
    }
    updateLevel(config, level, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const l = yield this.findLevel(config, level.properties.externalId);
            yield this.floorManager.addAttribute(spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(l.id.get()), level.properties.properties);
            yield this.addRefStructureToFloor(l.id.get(), level.structures, model);
            // return this.findLevel(config, level.properties.externalId).then(async l => {
            //   await this.floorManager
            //     .addAttribute(SpinalGraphService.getRealNode(l.id.get()), level.properties.properties);
            // })
            // missing check refObject
        });
    }
    updateRoom(externalId, room) {
        return __awaiter(this, void 0, void 0, function* () {
            this.roomManager
                .getByExternalId(externalId, spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_REFERENCE_CONTEXT).info.id.get(), Constant_1.GEO_ROOM_RELATION)
                .then(r => {
                this.roomManager.addAttribute(spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(r.id.get()), room.properties.properties);
                // @ts-ignore
                spinal_env_viewer_graph_service_1.SpinalGraphService.modifyNode(r.id.get(), { dbId: room.properties.dbId });
            });
            // missing check refObject
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
                    if (level.children.hasOwnProperty(roomExternal) && typeof level.children[roomExternal].children !== 'undefined') {
                        if (newArchi[levelId].children.hasOwnProperty(roomExternal)
                            && typeof newArchi[levelId].children[roomExternal].children !== "undefined") {
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
                        && typeof level.children[roomExternal].children !== 'undefined'
                        && (!oldArchi[levelId].children.hasOwnProperty(roomExternal) || typeof oldArchi[levelId].children[roomExternal].children === "undefined")) {
                        if (typeof comparisionObject.new.rooms[level.properties.externalId] === "undefined")
                            comparisionObject.new.rooms[level.properties.externalId] = [];
                        comparisionObject.new.rooms[level.properties.externalId].push(level.children[roomExternal]);
                    }
            }
            else { //add level and rooms to new
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
                        .addChild(context.info.id.get(), config, 'hasConfig', spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
                    config = spinal_env_viewer_graph_service_1.SpinalGraphService.getNode(config);
                }
                return config.element.load();
            }));
        });
    }
    /**
     * use propertyDb to create a representation of the architecture of the model
     * @private
     * @param {Model} model
     * @returns {Promise<ModelArchi>}
     * @memberof SpatialManager
     */
    getArchiModel(model, configName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.modelArchiLib.has(model))
                return this.modelArchiLib.get(model);
            //TODO une fois sur la version 7 du viewer la fonction
            // executerUserFonction permetera de passer des parametre a userFunction
            this.spatialConfig = yield this.getSpatialConfig();
            // let objectProperties = this.spatialConfig.objectProperties.get();
            // let floorAttrn = this.spatialConfig.revitAttribute.floors.attrName.get();
            const config = this.spatialConfig.getConfig(configName);
            if (!config)
                throw new Error('No Config Name found');
            const fct = createFctGetArchi_1.default(config.get());
            // @ts-ignore
            const modelArchi = yield model.getPropertyDb().executeUserFunction(fct);
            console.log("modelArchi", modelArchi);
            this.modelArchiLib.set(model, modelArchi);
            return modelArchi;
        });
    }
    findLevel(config, externalId) {
        return __awaiter(this, void 0, void 0, function* () {
            const building = yield this.getBuilding(config);
            return this.floorManager.getByExternalId(externalId, building.id.get(), Constant_1.GEO_FLOOR_RELATION);
        });
    }
    getContextFromConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let context = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(config.contextId.get());
            if (typeof context === "undefined" || context === null) {
                context = spinal_env_viewer_graph_service_1.SpinalGraphService.getContext(config.contextName.get());
            }
            if (typeof context === "undefined" || context === null) {
                context = yield spinal_env_viewer_context_geographic_service_1.default.createContext(config.contextName.get());
            }
            config.contextId.set(context.info.id.get());
            return context;
        });
    }
    getBuilding(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = yield this.getContextFromConfig(config);
            return spinal_env_viewer_graph_service_1.SpinalGraphService
                .getChildren(context.info.id.get(), [Constant_1.GEO_BUILDING_RELATION])
                .then(children => {
                if (typeof children === 'undefined')
                    return undefined;
                for (let i = 0; i < children.length; i++) {
                    const building = children[i];
                    if (building.name.get() === config.basic.buildingName.get())
                        return building;
                }
                return undefined;
            });
        });
    }
    getFloorFinish(configName, model) {
        return __awaiter(this, void 0, void 0, function* () {
            this.modelArchi = yield this.getArchiModel(model, configName);
            const floorFinish = [];
            for (let key in this.modelArchi) {
                if (this.modelArchi.hasOwnProperty(key)) {
                    for (let roomId in this.modelArchi[key].children) {
                        if (this.modelArchi[key].children.hasOwnProperty(roomId)) {
                            const room = this.modelArchi[key].children[roomId];
                            if (typeof room.children !== "undefined")
                                floorFinish.push(...room.children);
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
                .getChildren(roomReferenceContext.info.id.get(), [Constant_1.GEO_ROOM_RELATION]);
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].externalId.get() === externalId) {
                    return rooms[i].id.get();
                }
            }
        });
    }
    getRoomIdFromFloorFinish(floorId) {
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
    getFloorFinishId(configName, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const floors = yield this.getFloorFinish(configName, model);
            return floors.map(floor => floor.dbId);
        });
    }
}
exports.SpatialManager = SpatialManager;
function round(x, digits = 2) {
    return parseFloat(x.toFixed(digits));
}
//# sourceMappingURL=SpatialManager.js.map