"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEO_ZONE_RELATION = exports.GEO_ROOM_RELATION = exports.GEO_FLOOR_RELATION = exports.GEO_BUILDING_RELATION = exports.GEO_REFERENCE_ROOM_RELATION = exports.GEO_REFERENCE_RELATION = exports.ROOM_WANTED_PROPS = exports.FLOOR_NEEDED_PROPS = exports.ROOM_ID_TEXT = exports.S_TYPE = exports.ROOM_FINISH_VALUE = void 0;
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
const spinal_env_viewer_context_geographic_service_1 = require("spinal-env-viewer-context-geographic-service");
exports.ROOM_FINISH_VALUE = "Room_finish";
exports.S_TYPE = "stype";
exports.ROOM_ID_TEXT = "RoomID";
exports.FLOOR_NEEDED_PROPS = [exports.S_TYPE, 'roomid'];
exports.ROOM_WANTED_PROPS = ['area', 'volume', 'perimeter', 'local', 'etage', 'Local', 'stype', 'roomid'];
exports.GEO_REFERENCE_RELATION = spinal_env_viewer_context_geographic_service_1.default.constants.REFERENCE_RELATION;
exports.GEO_REFERENCE_ROOM_RELATION = `${exports.GEO_REFERENCE_RELATION}.ROOM`;
exports.GEO_BUILDING_RELATION = spinal_env_viewer_context_geographic_service_1.default.constants.BUILDING_RELATION;
exports.GEO_FLOOR_RELATION = spinal_env_viewer_context_geographic_service_1.default.constants.FLOOR_RELATION;
exports.GEO_ROOM_RELATION = spinal_env_viewer_context_geographic_service_1.default.constants.ROOM_RELATION;
exports.GEO_ZONE_RELATION = spinal_env_viewer_context_geographic_service_1.default.constants.ZONE_RELATION;
//# sourceMappingURL=Constant.js.map