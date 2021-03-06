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
import GeographicService from 'spinal-env-viewer-context-geographic-service'

export const ROOM_FINISH_VALUE: string = "Room_finish";
export const S_TYPE: string = "stype";
export const ROOM_ID_TEXT: string = "RoomID"
export const FLOOR_NEEDED_PROPS: string[] = [S_TYPE, 'roomid'];
export const ROOM_WANTED_PROPS: string[] = ['area', 'volume', 'perimeter', 'local', 'etage', 'Local', 'stype', 'roomid'];

export const GEO_REFERENCE_RELATION = GeographicService.constants.REFERENCE_RELATION;
export const GEO_REFERENCE_ROOM_RELATION = `${GEO_REFERENCE_RELATION}.ROOM`;

export const GEO_BUILDING_RELATION = GeographicService.constants.BUILDING_RELATION;
export const GEO_FLOOR_RELATION = GeographicService.constants.FLOOR_RELATION;
export const GEO_ROOM_RELATION = GeographicService.constants.ROOM_RELATION;
export const GEO_ZONE_RELATION = GeographicService.constants.ZONE_RELATION;
